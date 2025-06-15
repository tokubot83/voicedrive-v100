// BasicMemberSelectionService - Phase 1 基盤実装
// プロジェクトメンバー選定システムの基本機能

import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';
import { HierarchicalUser, User } from '../types';

// メンバー選定関連の型定義
export interface MemberSelection {
  id: string;
  projectId: string;
  selectorId: string; // 選定権限者のID
  selectionType: 'BASIC' | 'COLLABORATIVE' | 'AI_ASSISTED' | 'EMERGENCY' | 'STRATEGIC';
  selectedMembers: MemberAssignment[];
  selectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  // 承認ワークフロー連携
  approvalCompleted?: boolean;
  approvalCompletedAt?: Date;
  workflowStageId?: string;
}

export interface MemberAssignment {
  userId: string;
  role: MemberRole;
  responsibility?: string;
  estimatedWorkload?: number; // 時間/週
  startDate?: Date;
  endDate?: Date;
  isRequired: boolean; // 必須メンバー（提案者・承認者）かどうか
  assignmentReason?: string;
}

export type MemberRole = 
  | 'PROJECT_OWNER'      // プロジェクト提案者
  | 'PROJECT_SUPERVISOR' // プロジェクト承認者・監督役
  | 'PROJECT_LEADER'     // プロジェクトリーダー
  | 'TEAM_MEMBER'        // チームメンバー
  | 'SPECIALIST'         // 専門家
  | 'ADVISOR'            // アドバイザー
  | 'STAKEHOLDER';       // ステークホルダー

export interface MemberCandidate {
  user: HierarchicalUser;
  availability: AvailabilityStatus;
  skillMatch: number; // 0-100のスコア
  workloadCapacity: number; // 現在の作業負荷（％）
  departmentMatch: boolean;
  facilityMatch: boolean;
  recommendationScore: number;
}

export interface AvailabilityStatus {
  isAvailable: boolean;
  currentProjects: number;
  workloadPercentage: number;
  nextAvailableDate?: Date;
  constraints?: string[];
}

export interface SelectionCriteria {
  projectScope: ProjectScope;
  requiredSkills?: string[];
  preferredDepartments?: string[];
  maxTeamSize?: number;
  budgetConstraints?: number;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SelectionResult {
  success: boolean;
  selection?: MemberSelection;
  errors?: string[];
  warnings?: string[];
  recommendations?: string[];
}

/**
 * BasicMemberSelectionService
 * Phase 1: 基本的なメンバー選定機能を提供
 */
export class BasicMemberSelectionService {
  private selections: Map<string, MemberSelection> = new Map();
  private candidates: Map<string, MemberCandidate[]> = new Map();

  /**
   * プロジェクトメンバーを選定する（基本機能）
   * Level 2-4の承認者による部門内選定
   */
  async selectMembers(
    projectId: string,
    selectorId: string,
    memberIds: string[],
    criteria?: SelectionCriteria
  ): Promise<SelectionResult> {
    try {
      // 選定権限の検証
      const permissionCheck = await this.validateSelectionPermission(selectorId, projectId, 'BASIC');
      if (!permissionCheck.hasPermission) {
        return {
          success: false,
          errors: [`選定権限がありません: ${permissionCheck.reason}`]
        };
      }

      // メンバーの可用性チェック
      const availabilityCheck = await this.validateMemberAvailability(memberIds);
      if (!availabilityCheck.success) {
        return {
          success: false,
          errors: availabilityCheck.errors
        };
      }

      // メンバー選定実行
      const selection = await this.createMemberSelection(
        projectId,
        selectorId,
        memberIds,
        'BASIC',
        criteria
      );

      // 選定結果を記録
      this.selections.set(selection.id, selection);

      return {
        success: true,
        selection,
        recommendations: await this.generateSelectionRecommendations(selection)
      };

    } catch (error) {
      return {
        success: false,
        errors: [`選定処理中にエラーが発生しました: ${error}`]
      };
    }
  }

  /**
   * メンバーの可用性を検証
   */
  async validateMemberAvailability(memberIds: string[]): Promise<SelectionResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const memberId of memberIds) {
      const candidate = await this.getMemberCandidate(memberId);
      
      if (!candidate) {
        errors.push(`メンバー ${memberId} が見つかりません`);
        continue;
      }

      if (!candidate.availability.isAvailable) {
        errors.push(`${candidate.user.name} は現在利用できません`);
      }

      if (candidate.availability.workloadPercentage > 80) {
        warnings.push(`${candidate.user.name} の作業負荷が高いです (${candidate.availability.workloadPercentage}%)`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 選定権限を検証
   */
  async validateSelectionPermission(
    selectorId: string,
    projectId: string,
    selectionType: string
  ): Promise<{ hasPermission: boolean; reason?: string }> {
    // 基本的な権限チェック（実際の実装では権限サービスを使用）
    const selector = await this.getUser(selectorId);
    
    if (!selector) {
      return { hasPermission: false, reason: 'ユーザーが見つかりません' };
    }

    // Level 2-4の承認者のみ基本選定権限を持つ
    if (selector.permissionLevel < PermissionLevel.LEVEL_2 || selector.permissionLevel > PermissionLevel.LEVEL_4) {
      return { hasPermission: false, reason: 'レベル2-4の権限が必要です' };
    }

    return { hasPermission: true };
  }

  /**
   * メンバー選定レコードを作成
   */
  private async createMemberSelection(
    projectId: string,
    selectorId: string,
    memberIds: string[],
    selectionType: 'BASIC' | 'COLLABORATIVE' | 'AI_ASSISTED' | 'EMERGENCY' | 'STRATEGIC',
    criteria?: SelectionCriteria
  ): Promise<MemberSelection> {
    const id = this.generateSelectionId();
    const now = new Date();

    // メンバー割り当て情報を作成
    const assignments: MemberAssignment[] = [];

    // 必須メンバー（提案者・承認者）の追加
    // 実際の実装では、プロジェクトデータから提案者・承認者を取得
    assignments.push({
      userId: 'proposer-id', // プロジェクト提案者
      role: 'PROJECT_OWNER',
      isRequired: true,
      assignmentReason: 'プロジェクト提案者'
    });

    assignments.push({
      userId: selectorId, // 承認者
      role: 'PROJECT_SUPERVISOR',
      isRequired: true,
      assignmentReason: 'プロジェクト承認者・監督役'
    });

    // 選定されたメンバーを追加
    for (const memberId of memberIds) {
      assignments.push({
        userId: memberId,
        role: 'TEAM_MEMBER',
        isRequired: false,
        assignmentReason: '選定権限者による選出'
      });
    }

    return {
      id,
      projectId,
      selectorId,
      selectionType,
      selectedMembers: assignments,
      selectionReason: criteria ? `選定基準: ${JSON.stringify(criteria)}` : undefined,
      createdAt: now,
      updatedAt: now,
      status: 'DRAFT',
      // 承認ワークフロー連携フィールド
      approvalCompleted: false
    };
  }

  /**
   * メンバー候補者情報を取得
   */
  async getMemberCandidate(userId: string): Promise<MemberCandidate | null> {
    // 実際の実装では、ユーザーサービスやデータベースから取得
    const user = await this.getUser(userId);
    if (!user) return null;

    return {
      user,
      availability: {
        isAvailable: true,
        currentProjects: 2,
        workloadPercentage: 60,
        constraints: []
      },
      skillMatch: 75,
      workloadCapacity: 40,
      departmentMatch: true,
      facilityMatch: true,
      recommendationScore: 80
    };
  }

  /**
   * 部門内候補者リストを取得
   */
  async getDepartmentCandidates(
    departmentId: string,
    criteria?: SelectionCriteria
  ): Promise<MemberCandidate[]> {
    // 実際の実装では、部門のメンバーリストを取得し、候補者情報を構築
    const candidates: MemberCandidate[] = [];
    
    // デモ用の候補者データ
    const demoUsers = await this.getDepartmentUsers(departmentId);
    
    for (const user of demoUsers) {
      const candidate = await this.getMemberCandidate(user.id);
      if (candidate && this.matchesCriteria(candidate, criteria)) {
        candidates.push(candidate);
      }
    }

    // 推奨スコア順でソート
    return candidates.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  /**
   * 選定結果の推奨事項を生成
   */
  private async generateSelectionRecommendations(selection: MemberSelection): Promise<string[]> {
    const recommendations: string[] = [];

    // チーム構成の分析
    const memberCount = selection.selectedMembers.filter(m => !m.isRequired).length;
    if (memberCount < 3) {
      recommendations.push('チームメンバーが少ないため、追加メンバーの検討をお勧めします');
    }

    // スキルバランスの確認
    const specialists = selection.selectedMembers.filter(m => m.role === 'SPECIALIST').length;
    if (specialists === 0) {
      recommendations.push('専門家の参加を検討することをお勧めします');
    }

    return recommendations;
  }

  // ヘルパーメソッド
  private generateSelectionId(): string {
    return `sel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUser(userId: string): Promise<HierarchicalUser | null> {
    // 実際の実装では、ユーザーサービスから取得
    // デモ用の実装
    return {
      id: userId,
      name: `User ${userId}`,
      department: 'デモ部門',
      role: 'STAFF',
      accountType: 'STAFF',
      permissionLevel: PermissionLevel.LEVEL_2,
      facility_id: 'facility-1'
    };
  }

  private async getDepartmentUsers(departmentId: string): Promise<HierarchicalUser[]> {
    // 実際の実装では、部門のユーザーリストを取得
    return [];
  }

  private matchesCriteria(candidate: MemberCandidate, criteria?: SelectionCriteria): boolean {
    if (!criteria) return true;

    // 可用性チェック
    if (!candidate.availability.isAvailable) return false;

    // スキルマッチチェック
    if (criteria.requiredSkills && candidate.skillMatch < 60) return false;

    // 作業負荷チェック
    if (candidate.availability.workloadPercentage > 90) return false;

    return true;
  }

  /**
   * 選定状況を取得
   */
  async getSelection(selectionId: string): Promise<MemberSelection | null> {
    return this.selections.get(selectionId) || null;
  }

  /**
   * プロジェクトの選定状況を取得
   */
  async getProjectSelections(projectId: string): Promise<MemberSelection[]> {
    const selections: MemberSelection[] = [];
    for (const selection of this.selections.values()) {
      if (selection.projectId === projectId) {
        selections.push(selection);
      }
    }
    return selections;
  }

  /**
   * 選定を承認
   */
  async approveSelection(selectionId: string, approverId: string): Promise<SelectionResult> {
    const selection = this.selections.get(selectionId);
    if (!selection) {
      return { success: false, errors: ['選定が見つかりません'] };
    }

    selection.status = 'APPROVED';
    selection.updatedAt = new Date();

    return { success: true, selection };
  }

  /**
   * 承認ステータスを確認
   */
  private async checkApprovalStatus(projectId: string): Promise<{
    completed: boolean;
    completedAt?: Date;
    stageId?: string;
  }> {
    // 実際の実装では ApprovalWorkflowEngine から情報を取得
    // デモ用の実装
    return {
      completed: true,
      completedAt: new Date(),
      stageId: `${projectId}_approval_completed`
    };
  }

  /**
   * ワークフローステージを更新
   */
  private async updateWorkflowStage(projectId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<void> {
    // 実際の実装では ApprovalWorkflowEngine のメンバー選出ステージを更新
    console.log(`ワークフローステージ更新: プロジェクト ${projectId}, ステータス: ${status}`);
  }

  /**
   * メンバー選出をキャンセル
   */
  async cancelMemberSelection(projectId: string, selectorId: string, reason: string): Promise<SelectionResult> {
    try {
      const selection = Array.from(this.selections.values()).find(s => s.projectId === projectId);
      
      if (!selection) {
        return {
          success: false,
          errors: ['選出プロセスが見つかりません']
        };
      }

      if (selection.status === 'COMPLETED') {
        return {
          success: false,
          errors: ['既に完了した選出はキャンセルできません']
        };
      }

      selection.status = 'CANCELLED';
      selection.updatedAt = new Date();
      selection.selectionReason = reason;

      await this.updateWorkflowStage(projectId, 'CANCELLED');

      return {
        success: true,
        selection
      };

    } catch (error) {
      return {
        success: false,
        errors: [`キャンセル処理中にエラーが発生しました: ${error}`]
      };
    }
  }
}

export default BasicMemberSelectionService;