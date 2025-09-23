// 承認ワークフローエンジン - Phase 2 実装 (8段階権限システム対応)
import { PostType } from '../types';
import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';
import NotificationService from './NotificationService';
import { CategoryNotificationService } from './CategoryNotificationService';

export interface WorkflowStage {
  id: string;
  stage: string;
  assignee: string;
  assignedTo?: AssigneeInfo;
  autoComplete: boolean;
  requiredLevel?: PermissionLevel;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'ESCALATED';
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  escalationDate?: Date;
  comments?: string;
  // 新機能: 複数承認者と緊急オーバーライド機能
  multipleApprovers?: boolean;  // 複数承認者が必要かどうか
  emergencyOverride?: boolean;  // 緊急オーバーライド権限かどうか
  approvedBy?: string[];        // 承認者リスト（複数承認者用）
  requiredApprovers?: string[]; // 必要な承認者リスト
  // メンバー選出関連
  memberSelectionStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  provisionalMembers?: string[];
}

export interface AssigneeInfo {
  id: string;
  name: string;
  type: 'USER' | 'AUTOMATED' | 'GROUP';
  email?: string;
  department?: string;
}

export interface ProjectWorkflow {
  projectId: string;
  currentStage: number;
  stages: WorkflowStage[];
  notifications: WorkflowNotification[];
  escalations: WorkflowEscalation[];
  createdAt: Date;
  updatedAt: Date;
  // 承認フロー完了フラグ
  isApprovalCompleted?: boolean;
  approvalCompletedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface WorkflowNotification {
  id: string;
  type: string;
  recipient: string;
  sentAt: Date;
  status: 'SENT' | 'DELIVERED' | 'READ';
}

export interface WorkflowEscalation {
  stageId: string;
  escalatedAt: Date;
  escalatedTo: string;
  reason: string;
}

export class ApprovalWorkflowEngine {
  private notificationService: NotificationService;
  private categoryNotificationService: CategoryNotificationService;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.categoryNotificationService = CategoryNotificationService.getInstance();
  }

  private workflowTemplates = {
    // チームレベルプロジェクト（予算上限：5万円）
    TEAM: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'TEAM_LEAD_APPROVAL', assignee: 'TEAM_LEAD', requiredLevel: PermissionLevel.LEVEL_2 },
      { stage: 'MANAGER_APPROVAL', assignee: 'MANAGER', requiredLevel: PermissionLevel.LEVEL_3 },
      { stage: 'SECTION_CHIEF_APPROVAL', assignee: 'SECTION_CHIEF', requiredLevel: PermissionLevel.LEVEL_5 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 部門レベルプロジェクト（予算上限：20万円）
    DEPARTMENT: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MANAGER_APPROVAL', assignee: 'MANAGER', requiredLevel: PermissionLevel.LEVEL_3 },
      { stage: 'SECTION_CHIEF_APPROVAL', assignee: 'SECTION_CHIEF', requiredLevel: PermissionLevel.LEVEL_4 },
      { stage: 'HR_STRATEGIC_APPROVAL', assignee: 'HR_STRATEGIC', requiredLevel: PermissionLevel.LEVEL_5 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 施設レベルプロジェクト（予算上限：1000万円）- 所属施設のレベル4全員承認
    FACILITY: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'ALL_LEVEL4_APPROVAL', assignee: 'ALL_FACILITY_LEVEL4', requiredLevel: PermissionLevel.LEVEL_4, multipleApprovers: true },
      { stage: 'HR_STRATEGIC_APPROVAL', assignee: 'HR_STRATEGIC', requiredLevel: PermissionLevel.LEVEL_5 },
      { stage: 'HR_CAREER_APPROVAL', assignee: 'HR_CAREER', requiredLevel: PermissionLevel.LEVEL_6 },
      { stage: 'HR_DEPT_HEAD_APPROVAL', assignee: 'HR_DEPT_HEAD', requiredLevel: PermissionLevel.LEVEL_7 },
      { stage: 'CEO_REVIEW', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 法人レベルプロジェクト（予算上限：2000万円）- 各施設のレベル5全員承認
    ORGANIZATION: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'ALL_FACILITIES_LEVEL5_APPROVAL', assignee: 'ALL_FACILITIES_LEVEL5', requiredLevel: PermissionLevel.LEVEL_5, multipleApprovers: true },
      { stage: 'ALL_FACILITIES_LEVEL6_APPROVAL', assignee: 'ALL_FACILITIES_LEVEL6', requiredLevel: PermissionLevel.LEVEL_6, multipleApprovers: true },
      { stage: 'ALL_FACILITIES_LEVEL7_APPROVAL', assignee: 'ALL_FACILITIES_LEVEL7', requiredLevel: PermissionLevel.LEVEL_7, multipleApprovers: true },
      { stage: 'CEO_REVIEW', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12 },
      { stage: 'CHAIRMAN_APPROVAL', assignee: 'CHAIRMAN', requiredLevel: PermissionLevel.LEVEL_13 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 法人戦略的プロジェクト（予算無制限）- レベル12緊急オーバーライド権限行使により発動
    STRATEGIC: [
      { stage: 'EMERGENCY_OVERRIDE', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12, emergencyOverride: true },
      { stage: 'CEO_REVIEW', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12 },
      { stage: 'CHAIRMAN_LEVEL_APPROVAL', assignee: 'CHAIRMAN', requiredLevel: PermissionLevel.LEVEL_13 },
      { stage: 'CHAIRMAN_APPROVAL', assignee: 'CHAIRMAN', requiredLevel: PermissionLevel.LEVEL_13 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'STRATEGIC_TEAM', autoComplete: false }
    ],
    
    // 特別カテゴリ: 人財統括本部プロジェクト（レベル12提案権限）
    // 面談システム関連
    HR_INTERVIEW_SYSTEM: [
      { stage: 'CEO_INITIATED', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12, autoComplete: true },
      { stage: 'ALL_HR_DEPT_HEADS_APPROVAL', assignee: 'ALL_HR_DEPT_HEADS', requiredLevel: PermissionLevel.LEVEL_10, multipleApprovers: true },
      { stage: 'HR_GENERAL_MANAGER_REVIEW', assignee: 'HR_GENERAL_MANAGER', requiredLevel: PermissionLevel.LEVEL_11 },
      { stage: 'CEO_APPROVAL', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'HR_INTERVIEW_TEAM', autoComplete: false }
    ],
    
    // 研修・キャリア支援
    HR_TRAINING_CAREER: [
      { stage: 'CEO_INITIATED', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12, autoComplete: true },
      { stage: 'ALL_HR_DEPT_HEADS_APPROVAL', assignee: 'ALL_HR_DEPT_HEADS', requiredLevel: PermissionLevel.LEVEL_10, multipleApprovers: true },
      { stage: 'HR_GENERAL_MANAGER_REVIEW', assignee: 'HR_GENERAL_MANAGER', requiredLevel: PermissionLevel.LEVEL_11 },
      { stage: 'CEO_APPROVAL', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'HR_TRAINING_TEAM', autoComplete: false }
    ],
    
    // 人事政策
    HR_POLICY: [
      { stage: 'CEO_INITIATED', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12, autoComplete: true },
      { stage: 'ALL_HR_DEPT_HEADS_APPROVAL', assignee: 'ALL_HR_DEPT_HEADS', requiredLevel: PermissionLevel.LEVEL_10, multipleApprovers: true },
      { stage: 'HR_GENERAL_MANAGER_REVIEW', assignee: 'HR_GENERAL_MANAGER', requiredLevel: PermissionLevel.LEVEL_11 },
      { stage: 'CEO_APPROVAL', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'HR_POLICY_TEAM', autoComplete: false }
    ],
    
    // 戦略的人事企画
    HR_STRATEGIC_PLANNING: [
      { stage: 'CEO_INITIATED', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12, autoComplete: true },
      { stage: 'ALL_HR_DEPT_HEADS_APPROVAL', assignee: 'ALL_HR_DEPT_HEADS', requiredLevel: PermissionLevel.LEVEL_10, multipleApprovers: true },
      { stage: 'HR_GENERAL_MANAGER_REVIEW', assignee: 'HR_GENERAL_MANAGER', requiredLevel: PermissionLevel.LEVEL_11 },
      { stage: 'CEO_APPROVAL', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_12 },
      { stage: 'APPROVAL_COMPLETED', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MEMBER_SELECTION', assignee: 'PROJECT_LEAD', autoComplete: false },
      { stage: 'IMPLEMENTATION', assignee: 'HR_STRATEGIC_TEAM', autoComplete: false }
    ]
  };

  async initializeWorkflow(projectData: {
    id: string;
    level: ProjectScope;
    department: string;
    facility?: string;
    organization?: string;
    category?: 'operational' | 'communication' | 'innovation' | 'strategic';
  }): Promise<ProjectWorkflow> {
    const template = this.workflowTemplates[projectData.level];
    
    const workflow: ProjectWorkflow = {
      projectId: projectData.id,
      currentStage: 0,
      stages: await Promise.all(template.map(async (stage, index) => ({
        id: `${projectData.id}_stage_${index}`,
        stage: stage.stage,
        assignee: stage.assignee,
        assignedTo: await this.resolveAssignee(stage.assignee, projectData),
        autoComplete: stage.autoComplete,
        requiredLevel: stage.requiredLevel,
        status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
        createdAt: new Date(),
        dueDate: this.calculateDueDate(stage, projectData),
        escalationDate: this.calculateEscalationDate(stage)
      }))),
      notifications: [],
      escalations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 最初のステージが自動完了の場合は即座に実行
    if (template[0].autoComplete) {
      await this.completeStage(workflow, 0, 'SYSTEM', 'プロジェクト化基準を達成しました');
    }
    
    return workflow;
  }
  
  private async resolveAssignee(
    assigneeType: string, 
    projectData: any
  ): Promise<AssigneeInfo> {
    const assigneeResolvers: Record<string, () => Promise<AssigneeInfo>> = {
      SYSTEM: async () => ({ 
        id: 'system', 
        name: 'システム', 
        type: 'AUTOMATED' 
      }),
      TEAM_LEAD: async () => this.findTeamLead(projectData.department),
      MANAGER: async () => this.findManager(projectData.department),
      SECTION_CHIEF: async () => this.findSectionChief(projectData.department),
      HR_DEPT_HEAD: async () => this.findHRDepartmentHead(projectData.organization),
      HR_GENERAL_MANAGER: async () => this.findHRGeneralManager(projectData.organization),
      // 新マッピング対応のアサイニー
      HR_STRATEGIC: async () => this.findHRStrategic(),
      HR_CAREER: async () => this.findHRCareer(),
      ALL_FACILITY_LEVEL4: async () => this.findAllFacilityLevel4(projectData.facility || 'default'),
      ALL_FACILITIES_LEVEL5: async () => this.findAllFacilitiesLevel5(),
      ALL_FACILITIES_LEVEL6: async () => this.findAllFacilitiesLevel6(),
      ALL_FACILITIES_LEVEL7: async () => this.findAllFacilitiesLevel7(),
      ALL_HR_DEPT_HEADS: async () => this.findAllHRDeptHeads(),
      CEO: async () => this.findCEO(),
      CHAIRMAN: async () => this.findChairman(),
      // 既存役職
      DIRECTOR: async () => this.findDirector(projectData.facility),
      EXECUTIVE: async () => this.findExecutive(projectData.organization),
      BOARD: async () => this.findBoardMembers(projectData.organization),
      FINANCE_HEAD: async () => this.findFinanceHead(projectData.organization),
      CFO: async () => this.findCFO(projectData.organization),
      PROJECT_LEAD: async () => this.findProjectLead(projectData),
      PROJECT_TEAM: async () => this.assembleProjectTeam(projectData),
      STRATEGIC_TEAM: async () => this.assembleStrategicTeam(projectData),
      // HR特別チーム
      HR_INTERVIEW_TEAM: async () => this.assembleHRInterviewTeam(projectData),
      HR_TRAINING_TEAM: async () => this.assembleHRTrainingTeam(projectData),
      HR_POLICY_TEAM: async () => this.assembleHRPolicyTeam(projectData),
      HR_STRATEGIC_TEAM: async () => this.assembleHRStrategicTeam(projectData)
    };
    
    const resolver = assigneeResolvers[assigneeType];
    return resolver ? await resolver() : { id: 'unknown', name: '未定', type: 'USER' };
  }
  
  private calculateDueDate(stage: any, projectData: any): Date {
    const durations: Record<string, number> = {
      AUTO_PROJECT: 0, // 即座に完了
      TEAM_LEAD_APPROVAL: 2, // 2日
      MANAGER_APPROVAL: 3, // 3日
      SECTION_CHIEF_APPROVAL: 3, // 3日
      HR_DEPT_HEAD_APPROVAL: 4, // 4日
      HR_DEPT_HEAD_REVIEW: 3, // 3日
      HR_GENERAL_MANAGER_APPROVAL: 5, // 5日
      HR_GENERAL_MANAGER_REVIEW: 4, // 4日
      DIRECTOR_APPROVAL: 5, // 5日
      DIRECTOR_REVIEW: 3, // 3日
      EXECUTIVE_APPROVAL: 7, // 7日
      BOARD_APPROVAL: 14, // 14日
      BUDGET_APPROVAL: 5, // 5日
      BUDGET_ALLOCATION: 7, // 7日
      STRATEGIC_ALLOCATION: 10, // 10日
      // 新規追加: 面談関連ワークフロー期間
      HR_ADMIN_REVIEW: 3, // 3日
      HR_ADMIN_PREPARATION: 2, // 2日
      CAREER_SUPPORT_APPROVAL: 4, // 4日
      CAREER_SUPPORT_REVIEW: 3, // 3日
      FINAL_APPROVAL: 5, // 5日
      APPROVAL_COMPLETED: 0, // 即座に完了
      MEMBER_SELECTION: 7, // 7日
      IMPLEMENTATION: 30 // 30日
    };
    
    // カテゴリ別の期間調整
    const categoryMultipliers = {
      operational: 1.0,      // 業務改善は標準
      communication: 1.2,    // コミュニケーション改善は少し長め
      innovation: 1.5,       // イノベーションは慎重に検討
      strategic: 2.0         // 戦略提案は十分な検討期間
    };
    
    const baseDays = durations[stage.stage] || 3;
    const multiplier = projectData.category ? categoryMultipliers[projectData.category] : 1.0;
    const adjustedDays = Math.ceil(baseDays * multiplier);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + adjustedDays);
    return dueDate;
  }
  
  private calculateEscalationDate(stage: any): Date | undefined {
    // 自動完了や実装ステージはエスカレーションしない
    if (stage.autoComplete || stage.stage === 'IMPLEMENTATION') {
      return undefined;
    }
    
    const escalationDate = new Date();
    escalationDate.setDate(escalationDate.getDate() + 7); // 7日後にエスカレーション
    return escalationDate;
  }
  
  async completeStage(
    workflow: ProjectWorkflow,
    stageIndex: number,
    completedBy: string,
    comments?: string
  ): Promise<void> {
    const stage = workflow.stages[stageIndex];
    if (!stage || stage.status !== 'IN_PROGRESS') {
      throw new Error('Invalid stage or stage not in progress');
    }

    // ステージを完了
    stage.status = 'COMPLETED';
    stage.completedAt = new Date();
    stage.comments = comments;

    // APPROVAL_COMPLETEDステージの場合、承認完了をマーク
    if (stage.stage === 'APPROVAL_COMPLETED') {
      workflow.isApprovalCompleted = true;
      workflow.approvalCompletedAt = new Date();

      // メンバー選出通知を送信
      await this.notifyMemberSelectionStart(workflow);
    }

    // 次のステージに進む
    if (stageIndex < workflow.stages.length - 1) {
      workflow.currentStage = stageIndex + 1;
      const nextStage = workflow.stages[stageIndex + 1];
      nextStage.status = 'IN_PROGRESS';

      // 次のステージが自動完了の場合は即座に実行
      if (nextStage.autoComplete) {
        await this.completeStage(workflow, stageIndex + 1, 'SYSTEM', '自動完了');
      } else if (nextStage.assignedTo) {
        // 次の承認者に通知を送信
        await this.notifyNextApprover(workflow, nextStage);
      }
    }

    workflow.updatedAt = new Date();
  }
  
  async rejectStage(
    workflow: ProjectWorkflow,
    stageIndex: number,
    rejectedBy: string,
    reason: string
  ): Promise<void> {
    const stage = workflow.stages[stageIndex];
    if (!stage || stage.status !== 'IN_PROGRESS') {
      throw new Error('Invalid stage or stage not in progress');
    }
    
    stage.status = 'REJECTED';
    stage.completedAt = new Date();
    stage.comments = reason;
    
    // プロジェクトが却下されたことを記録
    workflow.rejectedAt = new Date();
    workflow.rejectionReason = reason;
    
    // メンバー選出が進行中の場合はキャンセル
    await this.cancelMemberSelection(workflow);
    
    workflow.updatedAt = new Date();
  }
  
  // ダミー実装 - 実際のアプリケーションでは適切な実装が必要
  private async findTeamLead(department: string): Promise<AssigneeInfo> {
    return {
      id: `team_lead_${department}`,
      name: `${department}チームリーダー`,
      type: 'USER',
      department: department
    };
  }
  
  private async findManager(department: string): Promise<AssigneeInfo> {
    return {
      id: `manager_${department}`,
      name: `${department}マネージャー`,
      type: 'USER',
      department: department
    };
  }
  
  private async findSectionChief(department: string): Promise<AssigneeInfo> {
    return {
      id: `section_chief_${department}`,
      name: `${department}課長`,
      type: 'USER',
      department: department
    };
  }
  
  private async findHRDepartmentHead(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'hr_dept_head',
      name: '人財統括本部部門長',
      type: 'USER'
    };
  }
  
  private async findHRGeneralManager(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'hr_general_manager',
      name: '人財統括本部統括管理部門長',
      type: 'USER'
    };
  }
  
  private async findDirector(facility?: string): Promise<AssigneeInfo> {
    return {
      id: 'director',
      name: '本部長',
      type: 'USER'
    };
  }
  
  private async findExecutive(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'executive',
      name: '役員',
      type: 'USER'
    };
  }
  
  private async findBoardMembers(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'board',
      name: '理事会',
      type: 'GROUP'
    };
  }
  
  private async findFinanceHead(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'finance_head',
      name: '財務部長',
      type: 'USER'
    };
  }
  
  private async findCFO(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'cfo',
      name: 'CFO',
      type: 'USER'
    };
  }
  
  private async findCEOLegacy(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'ceo_legacy',
      name: 'CEO(旧システム)',
      type: 'USER'
    };
  }
  
  private async assembleProjectTeam(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'project_team',
      name: 'プロジェクトチーム',
      type: 'GROUP'
    };
  }
  
  private async assembleStrategicTeam(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'strategic_team',
      name: '戦略プロジェクトチーム',
      type: 'GROUP'
    };
  }
  
  // 新機能: 複数承認者システム用ファインダー
  private async findAllFacilityLevel4(facility: string): Promise<AssigneeInfo> {
    return {
      id: `all_level4_${facility}`,
      name: `${facility}所属の全課長（レベル4）`,
      type: 'GROUP',
      department: facility
    };
  }
  
  private async findAllFacilitiesLevel5(): Promise<AssigneeInfo> {
    return {
      id: 'all_facilities_level5',
      name: '全施設のレベル5以上',
      type: 'GROUP'
    };
  }
  
  private async findAllFacilitiesLevel6(): Promise<AssigneeInfo> {
    return {
      id: 'all_facilities_level6',
      name: '全施設のレベル6以上',
      type: 'GROUP'
    };
  }
  
  private async findAllFacilitiesLevel7(): Promise<AssigneeInfo> {
    return {
      id: 'all_facilities_level7',
      name: '全施設のレベル7以上',
      type: 'GROUP'
    };
  }
  
  private async findAllHRDeptHeads(): Promise<AssigneeInfo> {
    return {
      id: 'all_hr_dept_heads',
      name: '人財統括本部各部門長全員',
      type: 'GROUP',
      department: '人財統括本部'
    };
  }
  
  private async findCEO(): Promise<AssigneeInfo> {
    return {
      id: 'ceo',
      name: '人財統括本部トップ（レベル12）',
      type: 'USER',
      department: '人財統括本部'
    };
  }
  
  private async findChairman(): Promise<AssigneeInfo> {
    return {
      id: 'chairman',
      name: '理事長（レベル13）',
      type: 'USER'
    };
  }
  
  private async findHRStrategic(): Promise<AssigneeInfo> {
    return {
      id: 'hr_strategic',
      name: '人財統括本部戦略企画・統括管理部門',
      type: 'USER',
      department: '人財統括本部'
    };
  }
  
  private async findHRCareer(): Promise<AssigneeInfo> {
    return {
      id: 'hr_career',
      name: '人財統括本部キャリア支援部門',
      type: 'USER',
      department: '人財統括本部'
    };
  }
  
  // 新チームアセンブラー
  private async assembleHRInterviewTeam(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'hr_interview_team',
      name: '人財統括本部面談システムチーム',
      type: 'GROUP',
      department: '人財統括本部'
    };
  }
  
  private async assembleHRTrainingTeam(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'hr_training_team',
      name: '人財統括本部研修・キャリア支援チーム',
      type: 'GROUP',
      department: '人財統括本部'
    };
  }
  
  private async assembleHRPolicyTeam(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'hr_policy_team',
      name: '人財統括本部人事政策チーム',
      type: 'GROUP',
      department: '人財統括本部'
    };
  }
  
  private async assembleHRStrategicTeam(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'hr_strategic_team',
      name: '人財統括本部戦略企画チーム',
      type: 'GROUP',
      department: '人財統括本部'
    };
  }
  
  private async findProjectLead(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'project_lead',
      name: 'プロジェクトリーダー',
      type: 'USER'
    };
  }
  
  // メンバー選出開始通知
  private async notifyMemberSelectionStart(workflow: ProjectWorkflow): Promise<void> {
    // メンバー選出ステージを找す
    const memberSelectionStage = workflow.stages.find(s => s.stage === 'MEMBER_SELECTION');
    if (memberSelectionStage && memberSelectionStage.assignedTo) {
      memberSelectionStage.memberSelectionStatus = 'NOT_STARTED';

      // プロジェクトリーダーへメンバー選出開始を通知
      await this.notificationService.sendNotification({
        type: 'system_notification',
        title: '🎯 メンバー選出フェーズ開始',
        message: `プロジェクト承認が完了しました。メンバー選出を開始してください。`,
        urgency: 'high',
        channels: ['browser', 'websocket', 'email'],
        timestamp: new Date().toISOString(),
        data: {
          projectId: workflow.projectId,
          stage: 'MEMBER_SELECTION',
          assignedTo: memberSelectionStage.assignedTo.id
        },
        actionRequired: true
      });

      // ワークフロー通知履歴に記録
      workflow.notifications.push({
        id: `notif_${Date.now()}`,
        type: 'MEMBER_SELECTION_START',
        recipient: memberSelectionStage.assignedTo.id,
        sentAt: new Date(),
        status: 'SENT'
      });
    }
  }
  
  // メンバー選出キャンセル
  private async cancelMemberSelection(workflow: ProjectWorkflow): Promise<void> {
    const memberSelectionStage = workflow.stages.find(s => s.stage === 'MEMBER_SELECTION');
    if (memberSelectionStage && memberSelectionStage.memberSelectionStatus === 'IN_PROGRESS') {
      memberSelectionStage.memberSelectionStatus = 'CANCELLED';

      // 仮メンバーへのキャンセル通知
      if (memberSelectionStage.provisionalMembers && memberSelectionStage.provisionalMembers.length > 0) {
        for (const memberId of memberSelectionStage.provisionalMembers) {
          await this.notificationService.sendNotification({
            type: 'system_notification',
            title: '⚠️ プロジェクト参加キャンセル',
            message: `プロジェクトが却下されたため、メンバー選出がキャンセルされました。`,
            urgency: 'normal',
            channels: ['browser', 'websocket'],
            timestamp: new Date().toISOString(),
            data: {
              projectId: workflow.projectId,
              reason: workflow.rejectionReason
            }
          });
        }

        // ワークフロー通知履歴に記録
        workflow.notifications.push({
          id: `notif_${Date.now()}`,
          type: 'MEMBER_SELECTION_CANCELLED',
          recipient: memberSelectionStage.provisionalMembers.join(','),
          sentAt: new Date(),
          status: 'SENT'
        });
      }
    }
  }
  
  getStageDisplayName(stage: string): string {
    const displayNames: Record<string, string> = {
      AUTO_PROJECT: '自動プロジェクト化',
      TEAM_LEAD_APPROVAL: 'チームリーダー承認',
      MANAGER_APPROVAL: 'マネージャー承認',
      SECTION_CHIEF_APPROVAL: '課長承認',
      HR_STRATEGIC_APPROVAL: '人財統括本部戦略企画部門承認',
      HR_CAREER_APPROVAL: '人財統括本部キャリア支援部門承認',
      HR_DEPT_HEAD_APPROVAL: '人財統括本部部門長承認',
      ALL_LEVEL4_APPROVAL: '所属施設の全課長承認',
      ALL_FACILITIES_LEVEL5_APPROVAL: '全施設レベル5承認',
      ALL_FACILITIES_LEVEL6_APPROVAL: '全施設レベル6承認',
      ALL_FACILITIES_LEVEL7_APPROVAL: '全施設レベル7承認',
      ALL_HR_DEPT_HEADS_APPROVAL: '人財統括本部各部門長全員承認',
      CEO_INITIATED: '人財統括本部トップ発起',
      CEO_REVIEW: '人財統括本部トップレビュー',
      CEO_APPROVAL: '人財統括本部トップ承認',
      CHAIRMAN_LEVEL_APPROVAL: '理事長レベル承認',
      CHAIRMAN_APPROVAL: '理事長承認',
      HR_GENERAL_MANAGER_REVIEW: '人財統括本部統括管理部門長レビュー',
      EMERGENCY_OVERRIDE: '緊急オーバーライド権限行使',
      // 既存表示名
      DIRECTOR_APPROVAL: '本部長承認',
      DIRECTOR_REVIEW: '本部長レビュー',
      EXECUTIVE_APPROVAL: '役員承認',
      BOARD_APPROVAL: '理事会承認',
      BUDGET_APPROVAL: '予算承認',
      BUDGET_ALLOCATION: '予算配分',
      STRATEGIC_ALLOCATION: '戦略的リソース配分',
      APPROVAL_COMPLETED: '承認完了',
      MEMBER_SELECTION: 'メンバー選出',
      IMPLEMENTATION: 'プロジェクト実行'
    };
    
    return displayNames[stage] || stage;
  }
  
  // 新機能: 緊急オーバーライド権限行使
  async executeEmergencyOverride(
    workflow: ProjectWorkflow,
    overrideBy: string,
    reason: string
  ): Promise<void> {
    const currentStage = workflow.stages[workflow.currentStage];
    if (currentStage?.emergencyOverride) {
      currentStage.status = 'COMPLETED';
      currentStage.completedAt = new Date();
      currentStage.comments = `緊急オーバーライド権限行使: ${reason}`;
      
      // 次のステージに進む
      if (workflow.currentStage < workflow.stages.length - 1) {
        workflow.currentStage += 1;
        workflow.stages[workflow.currentStage].status = 'IN_PROGRESS';
      }
      
      workflow.updatedAt = new Date();
    }
  }
  
  // 新機能: 複数承認者ステージの部分承認
  async approveMultipleApproversStage(
    workflow: ProjectWorkflow,
    stageIndex: number,
    approvedBy: string,
    comments?: string
  ): Promise<boolean> {
    const stage = workflow.stages[stageIndex];
    if (!stage?.multipleApprovers) {
      return false;
    }

    if (!stage.approvedBy) {
      stage.approvedBy = [];
    }

    if (!stage.approvedBy.includes(approvedBy)) {
      stage.approvedBy.push(approvedBy);
    }

    // 必要な承認者数をチェック（例：全員の80%以上）
    const requiredApprovals = stage.requiredApprovers ? stage.requiredApprovers.length : 1;

    if (stage.approvedBy.length >= requiredApprovals) {
      await this.completeStage(workflow, stageIndex, 'MULTIPLE_APPROVERS', '複数承認者による承認完了');
      return true;
    }

    return false;
  }

  // 次の承認者への通知
  private async notifyNextApprover(workflow: ProjectWorkflow, stage: WorkflowStage): Promise<void> {
    if (!stage.assignedTo) return;

    const stageDisplayName = this.getStageDisplayName(stage.stage);
    const projectLevel = this.getProjectLevelFromWorkflow(workflow);

    // カテゴリ別通知サービスを使用
    await this.categoryNotificationService.createCategoryApprovalNotification(
      stage.assignedTo.id,
      {
        category: this.getProjectCategory(workflow),
        title: `プロジェクト承認依頼: ${stageDisplayName}`,
        deadline: stage.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // デフォルト3日後
        projectId: workflow.projectId
      }
    );

    // 複数承認者の場合は全員に通知
    if (stage.multipleApprovers && stage.requiredApprovers) {
      for (const approverId of stage.requiredApprovers) {
        if (approverId !== stage.assignedTo.id) {
          await this.categoryNotificationService.createCategoryApprovalNotification(
            approverId,
            {
              category: this.getProjectCategory(workflow),
              title: `プロジェクト承認依頼（複数承認）: ${stageDisplayName}`,
              deadline: stage.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              projectId: workflow.projectId
            }
          );
        }
      }
    }

    // ワークフロー通知履歴に記録
    workflow.notifications.push({
      id: `notif_${Date.now()}`,
      type: 'APPROVAL_REQUEST',
      recipient: stage.assignedTo.id,
      sentAt: new Date(),
      status: 'SENT'
    });
  }

  // エスカレーション処理
  async escalateStage(
    workflow: ProjectWorkflow,
    stageIndex: number,
    escalateTo: string,
    reason: string
  ): Promise<void> {
    const stage = workflow.stages[stageIndex];
    if (!stage || stage.status !== 'IN_PROGRESS') {
      return;
    }

    stage.status = 'ESCALATED';
    stage.completedAt = new Date();

    // エスカレーション記録
    workflow.escalations.push({
      stageId: stage.id,
      escalatedAt: new Date(),
      escalatedTo: escalateTo,
      reason: reason
    });

    // エスカレーション通知
    await this.notificationService.sendNotification({
      type: 'system_notification',
      title: '⚠️ 承認エスカレーション',
      message: `${this.getStageDisplayName(stage.stage)}が期限超過のため上位者にエスカレーションされました。理由: ${reason}`,
      urgency: 'urgent',
      channels: ['browser', 'websocket', 'email'],
      timestamp: new Date().toISOString(),
      data: {
        projectId: workflow.projectId,
        stageId: stage.id,
        originalAssignee: stage.assignedTo?.id,
        escalatedTo: escalateTo
      },
      actionRequired: true
    });

    workflow.updatedAt = new Date();
  }

  // ヘルパーメソッド: プロジェクトレベル取得
  private getProjectLevelFromWorkflow(workflow: ProjectWorkflow): string {
    // ワークフローのステージ構成からプロジェクトレベルを判定
    const hasEmergencyOverride = workflow.stages.some(s => s.stage === 'EMERGENCY_OVERRIDE');
    const hasCEOApproval = workflow.stages.some(s => s.stage === 'CEO_APPROVAL');
    const hasAllFacilitiesApproval = workflow.stages.some(s => s.stage === 'ALL_FACILITIES_LEVEL5_APPROVAL');
    const hasAllLevel4Approval = workflow.stages.some(s => s.stage === 'ALL_LEVEL4_APPROVAL');

    if (hasEmergencyOverride) return 'STRATEGIC';
    if (hasAllFacilitiesApproval) return 'ORGANIZATION';
    if (hasAllLevel4Approval) return 'FACILITY';
    if (hasCEOApproval) return 'DEPARTMENT';
    return 'TEAM';
  }

  // ヘルパーメソッド: プロジェクトカテゴリ取得
  private getProjectCategory(workflow: ProjectWorkflow): 'operational' | 'communication' | 'innovation' | 'strategic' {
    // ワークフローメタデータからカテゴリを判定（実装時は実際のプロジェクトデータから取得）
    const level = this.getProjectLevelFromWorkflow(workflow);

    switch (level) {
      case 'STRATEGIC':
        return 'strategic';
      case 'ORGANIZATION':
        return 'innovation';
      case 'FACILITY':
      case 'DEPARTMENT':
        return 'communication';
      default:
        return 'operational';
    }
  }
}

export default ApprovalWorkflowEngine;