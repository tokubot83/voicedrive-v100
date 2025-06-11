// エスカレーションサービス - Phase 2 実装
import { ProjectWorkflow, WorkflowStage } from './ApprovalWorkflowEngine';
import NotificationService from './NotificationService';

export interface EscalationTarget {
  escalateTo: string;
  autoReassign: boolean;
  newAssignee?: any;
  requiresManualIntervention?: boolean;
}

export class EscalationService {
  private static escalationTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  
  static async initializeEscalationMonitoring(workflow: ProjectWorkflow): Promise<void> {
    workflow.stages.forEach((stage, index) => {
      if (stage.escalationDate && stage.status === 'IN_PROGRESS') {
        this.scheduleEscalation(workflow.projectId, stage.id, stage.escalationDate);
      }
    });
  }
  
  static scheduleEscalation(workflowId: string, stageId: string, escalationDate: Date): void {
    const timerId = `${workflowId}_${stageId}`;
    
    // 既存のタイマーがあればクリア
    if (this.escalationTimers.has(timerId)) {
      clearTimeout(this.escalationTimers.get(timerId)!);
    }
    
    const timeUntilEscalation = escalationDate.getTime() - Date.now();
    
    if (timeUntilEscalation > 0) {
      const timer = setTimeout(() => {
        this.executeEscalation(workflowId, stageId);
      }, timeUntilEscalation);
      
      this.escalationTimers.set(timerId, timer);
    }
  }
  
  static async executeEscalation(workflowId: string, stageId: string): Promise<void> {
    try {
      // 実際の実装では、ストレージからワークフローを取得
      const workflow = await this.getWorkflow(workflowId);
      const stage = workflow.stages.find(s => s.id === stageId);
      
      if (!stage || stage.status !== 'IN_PROGRESS') {
        return; // 既に処理済み
      }
      
      // エスカレーション先の決定
      const escalationTarget = await this.determineEscalationTarget(stage);
      
      // ステージの更新
      stage.status = 'ESCALATED';
      const escalation = {
        stageId: stage.id,
        escalatedAt: new Date(),
        escalatedTo: escalationTarget.escalateTo,
        reason: 'デッドライン超過'
      };
      workflow.escalations.push(escalation);
      
      // 通知送信
      const notificationService = NotificationService.getInstance();
      await notificationService.sendWorkflowNotification(workflow, stage, 'STAGE_ESCALATED');
      
      // 新しい承認者に再割り当て
      if (escalationTarget.autoReassign && escalationTarget.newAssignee) {
        stage.assignedTo = escalationTarget.newAssignee;
        stage.status = 'IN_PROGRESS';
        stage.dueDate = this.calculateNewDueDate(stage);
        stage.escalationDate = this.calculateNewEscalationDate(stage);
        
        // 新しいエスカレーションタイマーを設定
        if (stage.escalationDate) {
          this.scheduleEscalation(workflowId, stage.id, stage.escalationDate);
        }
      }
      
      // ワークフローを保存
      await this.saveWorkflow(workflow);
      
    } catch (error) {
      console.error('Escalation execution failed:', error);
    }
  }
  
  static async determineEscalationTarget(stage: WorkflowStage): Promise<EscalationTarget> {
    const escalationRules: Record<string, EscalationTarget> = {
      DEPT_HEAD_APPROVAL: {
        escalateTo: 'FACILITY_DIRECTOR',
        autoReassign: true,
        newAssignee: {
          id: 'facility_director',
          name: '施設管理者',
          type: 'USER'
        }
      },
      FACILITY_APPROVAL: {
        escalateTo: 'EXECUTIVE',
        autoReassign: true,
        newAssignee: {
          id: 'executive',
          name: '役員',
          type: 'USER'
        }
      },
      EXECUTIVE_APPROVAL: {
        escalateTo: 'BOARD',
        autoReassign: false,
        requiresManualIntervention: true
      },
      BUDGET_APPROVAL: {
        escalateTo: 'CFO',
        autoReassign: true,
        newAssignee: {
          id: 'cfo',
          name: 'CFO',
          type: 'USER'
        }
      }
    };
    
    return escalationRules[stage.stage] || {
      escalateTo: 'MANUAL_REVIEW',
      autoReassign: false
    };
  }
  
  static calculateNewDueDate(stage: WorkflowStage): Date {
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 3); // 追加で3日
    return newDueDate;
  }
  
  static calculateNewEscalationDate(stage: WorkflowStage): Date {
    const newEscalationDate = new Date();
    newEscalationDate.setDate(newEscalationDate.getDate() + 5); // 追加で5日
    return newEscalationDate;
  }
  
  static cancelEscalation(workflowId: string, stageId: string): void {
    const timerId = `${workflowId}_${stageId}`;
    if (this.escalationTimers.has(timerId)) {
      clearTimeout(this.escalationTimers.get(timerId)!);
      this.escalationTimers.delete(timerId);
    }
  }
  
  static cancelAllEscalations(workflowId: string): void {
    // ワークフローIDを含むすべてのタイマーをキャンセル
    this.escalationTimers.forEach((timer, timerId) => {
      if (timerId.startsWith(workflowId)) {
        clearTimeout(timer);
        this.escalationTimers.delete(timerId);
      }
    });
  }
  
  // ダミー実装 - 実際の実装では適切なストレージから取得
  private static async getWorkflow(workflowId: string): Promise<ProjectWorkflow> {
    throw new Error('Not implemented - should fetch from storage');
  }
  
  private static async saveWorkflow(workflow: ProjectWorkflow): Promise<void> {
    // 実際の実装では、ストレージに保存
    console.log('Saving workflow:', workflow.projectId);
  }
}

export default EscalationService;