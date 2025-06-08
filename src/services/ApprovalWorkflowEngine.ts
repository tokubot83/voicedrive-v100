// 承認ワークフローエンジン - Phase 2 実装
import { PostType } from '../types';

export interface WorkflowStage {
  id: string;
  stage: string;
  assignee: string;
  assignedTo?: AssigneeInfo;
  autoComplete: boolean;
  requiredLevel?: string;
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
    DEPARTMENT: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'DEPT_HEAD_APPROVAL', assignee: 'DEPARTMENT_HEAD', requiredLevel: 'LEVEL_3' },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    FACILITY: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'DEPT_HEAD_APPROVAL', assignee: 'DEPARTMENT_HEAD', requiredLevel: 'LEVEL_3' },
      { stage: 'FACILITY_APPROVAL', assignee: 'FACILITY_DIRECTOR', requiredLevel: 'LEVEL_4' },
      { stage: 'BUDGET_APPROVAL', assignee: 'FINANCE_HEAD', requiredLevel: 'LEVEL_4' },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ],
    ORGANIZATION: [
      { stage: 'AUTO_PROJECT', assignee: 'SYSTEM', autoComplete: true },
      { stage: 'DEPT_HEAD_APPROVAL', assignee: 'DEPARTMENT_HEAD', requiredLevel: 'LEVEL_3' },
      { stage: 'FACILITY_APPROVAL', assignee: 'FACILITY_DIRECTOR', requiredLevel: 'LEVEL_4' },
      { stage: 'EXECUTIVE_APPROVAL', assignee: 'EXECUTIVE', requiredLevel: 'LEVEL_5' },
      { stage: 'BOARD_APPROVAL', assignee: 'BOARD', requiredLevel: 'LEVEL_6' },
      { stage: 'BUDGET_ALLOCATION', assignee: 'CFO', requiredLevel: 'LEVEL_5' },
      { stage: 'IMPLEMENTATION', assignee: 'PROJECT_TEAM', autoComplete: false }
    ]
  };

  async initializeWorkflow(projectData: {
    id: string;
    level: 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION';
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
      DEPARTMENT_HEAD: async () => this.findDepartmentHead(projectData.department),
      FACILITY_DIRECTOR: async () => this.findFacilityDirector(projectData.facility),
      EXECUTIVE: async () => this.findExecutive(projectData.organization),
      BOARD: async () => this.findBoardMembers(projectData.organization),
      FINANCE_HEAD: async () => this.findFinanceHead(projectData.organization),
      CFO: async () => this.findCFO(projectData.organization),
      PROJECT_TEAM: async () => this.assembleProjectTeam(projectData)
    };
    
    const resolver = assigneeResolvers[assigneeType];
    return resolver ? await resolver() : { id: 'unknown', name: '未定', type: 'USER' };
  }
  
  private calculateDueDate(stage: any, projectData: any): Date {
    const durations: Record<string, number> = {
      AUTO_PROJECT: 0, // 即座に完了
      DEPT_HEAD_APPROVAL: 3, // 3日
      FACILITY_APPROVAL: 5, // 5日
      EXECUTIVE_APPROVAL: 7, // 7日
      BOARD_APPROVAL: 14, // 14日
      BUDGET_APPROVAL: 5, // 5日
      BUDGET_ALLOCATION: 7, // 7日
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
  private async findDepartmentHead(department: string): Promise<AssigneeInfo> {
    return {
      id: `dept_head_${department}`,
      name: `${department}部長`,
      type: 'USER',
      department: department
    };
  }
  
  private async findFacilityDirector(facility?: string): Promise<AssigneeInfo> {
    return {
      id: 'facility_director',
      name: '施設管理者',
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
  
  private async assembleProjectTeam(projectData: any): Promise<AssigneeInfo> {
    return {
      id: 'project_team',
      name: 'プロジェクトチーム',
      type: 'GROUP'
    };
  }
  
  getStageDisplayName(stage: string): string {
    const displayNames: Record<string, string> = {
      AUTO_PROJECT: '自動プロジェクト化',
      DEPT_HEAD_APPROVAL: '部門長承認',
      FACILITY_APPROVAL: '施設管理者承認',
      EXECUTIVE_APPROVAL: '役員承認',
      BOARD_APPROVAL: '理事会承認',
      BUDGET_APPROVAL: '予算承認',
      BUDGET_ALLOCATION: '予算配分',
      IMPLEMENTATION: 'プロジェクト実行'
    };
    
    return displayNames[stage] || stage;
  }
}

export default ApprovalWorkflowEngine;