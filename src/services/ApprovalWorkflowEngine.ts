// 承認ワークフローエンジン - Phase 2 実装 (8段階権限システム対応)
import { PostType } from '../types';
import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';

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
  private workflowTemplates = {
    // チームレベルプロジェクト
    TEAM: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'TEAM_LEAD_APPROVAL', assignee: 'TEAM_LEAD', requiredLevel: PermissionLevel.LEVEL_2 },
      { stage: 'MANAGER_APPROVAL', assignee: 'MANAGER', requiredLevel: PermissionLevel.LEVEL_3 },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 部門レベルプロジェクト
    DEPARTMENT: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'MANAGER_APPROVAL', assignee: 'MANAGER', requiredLevel: PermissionLevel.LEVEL_3 },
      { stage: 'SECTION_CHIEF_APPROVAL', assignee: 'SECTION_CHIEF', requiredLevel: PermissionLevel.LEVEL_4 },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 施設レベルプロジェクト
    FACILITY: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'SECTION_CHIEF_APPROVAL', assignee: 'SECTION_CHIEF', requiredLevel: PermissionLevel.LEVEL_4 },
      { stage: 'HR_DEPT_HEAD_APPROVAL', assignee: 'HR_DEPT_HEAD', requiredLevel: PermissionLevel.LEVEL_5 },
      { stage: 'HR_GENERAL_MANAGER_APPROVAL', assignee: 'HR_GENERAL_MANAGER', requiredLevel: PermissionLevel.LEVEL_6 },
      { stage: 'BUDGET_APPROVAL', assignee: 'FINANCE_HEAD', requiredLevel: PermissionLevel.LEVEL_6 },
      { stage: 'DIRECTOR_APPROVAL', assignee: 'DIRECTOR', requiredLevel: PermissionLevel.LEVEL_7 },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 組織全体レベルプロジェクト
    ORGANIZATION: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'HR_DEPT_HEAD_REVIEW', assignee: 'HR_DEPT_HEAD', requiredLevel: PermissionLevel.LEVEL_5 },
      { stage: 'HR_GENERAL_MANAGER_REVIEW', assignee: 'HR_GENERAL_MANAGER', requiredLevel: PermissionLevel.LEVEL_6 },
      { stage: 'DIRECTOR_APPROVAL', assignee: 'DIRECTOR', requiredLevel: PermissionLevel.LEVEL_7 },
      { stage: 'EXECUTIVE_APPROVAL', assignee: 'EXECUTIVE', requiredLevel: PermissionLevel.LEVEL_8 },
      { stage: 'BUDGET_ALLOCATION', assignee: 'CFO', requiredLevel: PermissionLevel.LEVEL_7 },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    // 戦略的プロジェクト
    STRATEGIC: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'DIRECTOR_REVIEW', assignee: 'DIRECTOR', requiredLevel: PermissionLevel.LEVEL_7 },
      { stage: 'EXECUTIVE_APPROVAL', assignee: 'EXECUTIVE', requiredLevel: PermissionLevel.LEVEL_8 },
      { stage: 'BOARD_APPROVAL', assignee: 'BOARD', requiredLevel: PermissionLevel.LEVEL_8 },
      { stage: 'STRATEGIC_ALLOCATION', assignee: 'CEO', requiredLevel: PermissionLevel.LEVEL_8 },
      { stage: 'IMPLEMENTATION', assignee: 'STRATEGIC_TEAM', autoComplete: false }
    ]
  };

  async initializeWorkflow(projectData: {
    id: string;
    level: ProjectScope;
    department: string;
    facility?: string;
    organization?: string;
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
      DIRECTOR: async () => this.findDirector(projectData.facility),
      EXECUTIVE: async () => this.findExecutive(projectData.organization),
      BOARD: async () => this.findBoardMembers(projectData.organization),
      FINANCE_HEAD: async () => this.findFinanceHead(projectData.organization),
      CFO: async () => this.findCFO(projectData.organization),
      CEO: async () => this.findCEO(projectData.organization),
      PROJECT_TEAM: async () => this.assembleProjectTeam(projectData),
      STRATEGIC_TEAM: async () => this.assembleStrategicTeam(projectData)
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
      IMPLEMENTATION: 30 // 30日
    };
    
    const days = durations[stage.stage] || 3;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
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
    
    // 次のステージに進む
    if (stageIndex < workflow.stages.length - 1) {
      workflow.currentStage = stageIndex + 1;
      workflow.stages[stageIndex + 1].status = 'IN_PROGRESS';
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
  
  private async findCEO(organization?: string): Promise<AssigneeInfo> {
    return {
      id: 'ceo',
      name: 'CEO',
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
  
  getStageDisplayName(stage: string): string {
    const displayNames: Record<string, string> = {
      AUTO_PROJECT: '自動プロジェクト化',
      TEAM_LEAD_APPROVAL: 'チームリーダー承認',
      MANAGER_APPROVAL: 'マネージャー承認',
      SECTION_CHIEF_APPROVAL: '課長承認',
      HR_DEPT_HEAD_APPROVAL: '人財統括本部部門長承認',
      HR_DEPT_HEAD_REVIEW: '人財統括本部部門長レビュー',
      HR_GENERAL_MANAGER_APPROVAL: '人財統括本部統括管理部門長承認',
      HR_GENERAL_MANAGER_REVIEW: '人財統括本部統括管理部門長レビュー',
      DIRECTOR_APPROVAL: '本部長承認',
      DIRECTOR_REVIEW: '本部長レビュー',
      EXECUTIVE_APPROVAL: '役員承認',
      BOARD_APPROVAL: '理事会承認',
      BUDGET_APPROVAL: '予算承認',
      BUDGET_ALLOCATION: '予算配分',
      STRATEGIC_ALLOCATION: '戦略的リソース配分',
      IMPLEMENTATION: 'プロジェクト実行'
    };
    
    return displayNames[stage] || stage;
  }
}

export default ApprovalWorkflowEngine;