// 4カテゴリ統合管理サービス - 全システム機能での一貫性確保
import { CategoryNotificationService } from './CategoryNotificationService';
import { VotingDeadlineService } from './VotingDeadlineService';
import { ApprovalWorkflowEngine, ProjectWorkflow } from './ApprovalWorkflowEngine';
import { BasicMemberSelectionService } from './BasicMemberSelectionService';
import { ProjectScoringEngine } from '../utils/ProjectScoring';
import { ProjectScope } from '../permissions/types/PermissionTypes';

export type ProposalCategory = 'operational' | 'communication' | 'innovation' | 'strategic';

export interface CategoryProjectData {
  id: string;
  title: string;
  category: ProposalCategory;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  facility?: string;
  organization?: string;
  initiatorId: string;
  scope?: ProjectScope;
}

export interface CategoryVotingData {
  postId: string;
  title: string;
  category: ProposalCategory;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  department: string;
}

export interface CategoryMemberSelectionData {
  projectId: string;
  title: string;
  category: ProposalCategory;
  requiredRoles: string[];
  department: string;
  deadline: Date;
}

export class CategoryIntegrationService {
  private static instance: CategoryIntegrationService;
  private notificationService: CategoryNotificationService;
  private votingDeadlineService: VotingDeadlineService;
  private workflowEngine: ApprovalWorkflowEngine;
  private memberSelectionService: BasicMemberSelectionService;
  private scoringEngine: ProjectScoringEngine;

  private constructor() {
    this.notificationService = CategoryNotificationService.getInstance();
    this.votingDeadlineService = new VotingDeadlineService();
    this.workflowEngine = ApprovalWorkflowEngine.getInstance();
    this.memberSelectionService = new BasicMemberSelectionService();
    this.scoringEngine = new ProjectScoringEngine();
  }

  public static getInstance(): CategoryIntegrationService {
    if (!CategoryIntegrationService.instance) {
      CategoryIntegrationService.instance = new CategoryIntegrationService();
    }
    return CategoryIntegrationService.instance;
  }

  // 投票期限の統一計算（4カテゴリ対応）
  calculateVotingDeadline(category: ProposalCategory, urgencyLevel: 'low' | 'medium' | 'high' | 'critical'): Date {
    return this.votingDeadlineService.calculateVotingDeadline(category, urgencyLevel);
  }

  // カテゴリ別プロジェクト化スコア計算
  calculateProjectScore(
    engagements: any[],
    userWeights: any,
    category: ProposalCategory,
    organizationSize?: number,
    projectScope?: ProjectScope
  ): number {
    return this.scoringEngine.calculateProjectScore(engagements, userWeights);
  }

  // カテゴリ別プロジェクトステータス判定
  getProjectStatus(
    score: number,
    category: ProposalCategory,
    organizationSize?: number,
    projectScope?: ProjectScope
  ) {
    return this.scoringEngine.getProjectStatus(score, category, organizationSize, projectScope);
  }

  // 投票通知の統一送信（4カテゴリ対応）
  async sendVotingNotification(userId: string, data: CategoryVotingData): Promise<void> {
    const deadline = this.calculateVotingDeadline(data.category, data.urgencyLevel);
    
    await this.notificationService.createCategoryVoteNotification(userId, {
      category: data.category,
      title: data.title,
      deadline,
      postId: data.postId
    });
  }

  // 承認ワークフロー初期化（4カテゴリ対応）
  async initializeCategoryWorkflow(projectData: CategoryProjectData): Promise<ProjectWorkflow> {
    return await this.workflowEngine.initializeWorkflow({
      id: projectData.id,
      level: projectData.scope || ProjectScope.DEPARTMENT,
      department: projectData.department,
      facility: projectData.facility,
      organization: projectData.organization,
      category: projectData.category
    });
  }

  // 承認通知の統一送信（4カテゴリ対応）
  async sendApprovalNotification(userId: string, data: CategoryProjectData): Promise<void> {
    // カテゴリ別の承認期限を計算
    const deadline = this.calculateApprovalDeadline(data.category, data.urgencyLevel);
    
    await this.notificationService.createCategoryApprovalNotification(userId, {
      category: data.category,
      title: data.title,
      deadline,
      projectId: data.id
    });
  }

  // メンバー選定通知の統一送信（4カテゴリ対応）
  async sendMemberSelectionNotification(
    userId: string,
    data: CategoryMemberSelectionData & { role: string }
  ): Promise<void> {
    await this.notificationService.createCategoryMemberSelectionNotification(userId, {
      category: data.category,
      title: data.title,
      deadline: data.deadline,
      projectId: data.projectId,
      role: data.role
    });
  }

  // カテゴリ別の承認期限計算
  private calculateApprovalDeadline(
    category: ProposalCategory,
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  ): Date {
    // 承認期限は投票期限より長めに設定
    const baseDeadlines = {
      operational: { low: 10, medium: 5, high: 2, critical: 1 },     // 業務改善
      communication: { low: 14, medium: 7, high: 3, critical: 1 },  // コミュニケーション
      innovation: { low: 21, medium: 14, high: 7, critical: 3 },    // イノベーション
      strategic: { low: 30, medium: 21, high: 14, critical: 7 }     // 戦略提案
    };

    const days = baseDeadlines[category][urgencyLevel];
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline;
  }

  // カテゴリ別の重要度レベル取得
  getCategoryImportanceLevel(category: ProposalCategory): 'low' | 'medium' | 'high' | 'critical' {
    const importanceLevels = {
      operational: 'medium',      // 業務改善：中程度
      communication: 'medium',    // コミュニケーション：中程度
      innovation: 'high',         // イノベーション：高い
      strategic: 'critical'       // 戦略提案：最重要
    };
    
    return importanceLevels[category] as 'low' | 'medium' | 'high' | 'critical';
  }

  // カテゴリ別の推奨検討期間取得
  getRecommendedConsiderationPeriod(category: ProposalCategory): number {
    const periods = {
      operational: 7,      // 業務改善：1週間
      communication: 10,   // コミュニケーション：10日
      innovation: 21,      // イノベーション：3週間
      strategic: 30        // 戦略提案：1ヶ月
    };
    
    return periods[category];
  }

  // カテゴリ別の必要な権限レベル取得
  getRequiredPermissionLevel(category: ProposalCategory, scope: ProjectScope) {
    // 戦略提案は他カテゴリより1段階高い権限が必要
    const baseLevel = this.scoringEngine.getRequiredPermissionLevel(scope);
    
    if (category === 'strategic') {
      // 戦略提案は最低でもレベル4（課長）以上が必要
      return Math.max(baseLevel, 4);
    }
    
    if (category === 'innovation') {
      // イノベーションは慎重な検討が必要
      return Math.max(baseLevel, 3);
    }
    
    return baseLevel;
  }

  // 全カテゴリの統計情報取得
  async getCategoryStatistics(): Promise<{
    operational: { active: number; completed: number; pending: number };
    communication: { active: number; completed: number; pending: number };
    innovation: { active: number; completed: number; pending: number };
    strategic: { active: number; completed: number; pending: number };
  }> {
    // 実際の実装では、各カテゴリのプロジェクト状況をデータベースから取得
    return {
      operational: { active: 0, completed: 0, pending: 0 },
      communication: { active: 0, completed: 0, pending: 0 },
      innovation: { active: 0, completed: 0, pending: 0 },
      strategic: { active: 0, completed: 0, pending: 0 }
    };
  }

  // カテゴリ別の進行中プロジェクト取得
  async getActiveProjectsByCategory(category: ProposalCategory): Promise<any[]> {
    // 実際の実装では、指定カテゴリの進行中プロジェクトを取得
    return [];
  }

  // 全システムでのカテゴリ整合性チェック
  async validateCategoryConsistency(category: ProposalCategory): Promise<{
    isConsistent: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // カテゴリの有効性チェック
    const validCategories: ProposalCategory[] = ['operational', 'communication', 'innovation', 'strategic'];
    if (!validCategories.includes(category)) {
      issues.push(`無効なカテゴリです: ${category}`);
    }
    
    // 各サービスでのカテゴリサポート確認
    try {
      this.calculateVotingDeadline(category, 'medium');
    } catch (error) {
      issues.push(`投票期限サービスでカテゴリ ${category} がサポートされていません`);
    }
    
    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
}

export default CategoryIntegrationService;