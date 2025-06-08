// 通知サービス - Phase 2 実装
import { ProjectWorkflow, WorkflowStage } from './ApprovalWorkflowEngine';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SLACK' | 'SMS';
export type NotificationUrgency = 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  slackId?: string;
}

export interface NotificationData {
  to: NotificationRecipient | NotificationRecipient[];
  template: string;
  data: any;
  urgency: NotificationUrgency;
  channels: NotificationChannel[];
}

export class NotificationService {
  static async sendWorkflowNotification(
    workflow: ProjectWorkflow, 
    stage: WorkflowStage, 
    event: string
  ): Promise<void> {
    const notificationConfigs = {
      STAGE_ASSIGNED: {
        recipients: stage.assignedTo ? [stage.assignedTo] : [],
        template: 'workflow_assignment',
        urgency: stage.escalationDate ? 'HIGH' : 'NORMAL' as NotificationUrgency
      },
      STAGE_COMPLETED: {
        recipients: await this.getStakeholders(workflow),
        template: 'workflow_progress',
        urgency: 'NORMAL' as NotificationUrgency
      },
      STAGE_ESCALATED: {
        recipients: await this.getEscalationRecipients(stage),
        template: 'workflow_escalation',
        urgency: 'URGENT' as NotificationUrgency
      },
      WORKFLOW_COMPLETED: {
        recipients: await this.getAllParticipants(workflow),
        template: 'project_approved',
        urgency: 'NORMAL' as NotificationUrgency
      },
      WORKFLOW_REJECTED: {
        recipients: await this.getProjectCreator(workflow),
        template: 'project_rejected',
        urgency: 'HIGH' as NotificationUrgency
      }
    };
    
    const config = notificationConfigs[event as keyof typeof notificationConfigs];
    if (!config) return;
    
    await Promise.all(config.recipients.map(recipient => 
      this.sendNotification({
        to: recipient,
        template: config.template,
        data: { workflow, stage, event },
        urgency: config.urgency,
        channels: this.selectChannels(config.urgency)
      })
    ));
  }
  
  static selectChannels(urgency: NotificationUrgency): NotificationChannel[] {
    const channelConfigs: Record<NotificationUrgency, NotificationChannel[]> = {
      NORMAL: ['IN_APP'],
      HIGH: ['IN_APP', 'EMAIL'],
      URGENT: ['IN_APP', 'EMAIL', 'SLACK', 'SMS']
    };
    return channelConfigs[urgency] || ['IN_APP'];
  }
  
  static async sendNotification(notification: NotificationData): Promise<void> {
    const recipients = Array.isArray(notification.to) ? notification.to : [notification.to];
    
    for (const recipient of recipients) {
      for (const channel of notification.channels) {
        await this.sendToChannel(channel, recipient, notification);
      }
    }
  }
  
  private static async sendToChannel(
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    switch (channel) {
      case 'IN_APP':
        await this.sendInAppNotification(recipient, notification);
        break;
      case 'EMAIL':
        if (recipient.email) {
          await this.sendEmailNotification(recipient, notification);
        }
        break;
      case 'SLACK':
        if (recipient.slackId) {
          await this.sendSlackNotification(recipient, notification);
        }
        break;
      case 'SMS':
        if (recipient.phone) {
          await this.sendSMSNotification(recipient, notification);
        }
        break;
    }
  }
  
  private static async sendInAppNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // アプリ内通知の実装
    console.log('Sending in-app notification to:', recipient.name);
    // 実際の実装では、WebSocketやプッシュ通知を使用
  }
  
  private static async sendEmailNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // メール通知の実装
    console.log('Sending email to:', recipient.email);
    // 実際の実装では、メールサービスAPIを使用
  }
  
  private static async sendSlackNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // Slack通知の実装
    console.log('Sending Slack message to:', recipient.slackId);
    // 実際の実装では、Slack APIを使用
  }
  
  private static async sendSMSNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // SMS通知の実装
    console.log('Sending SMS to:', recipient.phone);
    // 実際の実装では、SMS APIを使用
  }
  
  // ヘルパーメソッド
  private static async getStakeholders(workflow: ProjectWorkflow): Promise<NotificationRecipient[]> {
    // 実装では、ワークフローに関連するステークホルダーを取得
    return [];
  }
  
  private static async getEscalationRecipients(stage: WorkflowStage): Promise<NotificationRecipient[]> {
    // 実装では、エスカレーション先の受信者を取得
    return [];
  }
  
  private static async getAllParticipants(workflow: ProjectWorkflow): Promise<NotificationRecipient[]> {
    // 実装では、すべての参加者を取得
    return [];
  }
  
  private static async getProjectCreator(workflow: ProjectWorkflow): Promise<NotificationRecipient[]> {
    // 実装では、プロジェクト作成者を取得
    return [];
  }
  
  // 通知テンプレート
  static getNotificationTemplate(templateName: string, data: any): {
    subject: string;
    body: string;
  } {
    const templates: Record<string, (data: any) => { subject: string; body: string }> = {
      workflow_assignment: (data) => ({
        subject: '新しい承認依頼があります',
        body: `${data.stage.stage}の承認をお願いします。期限: ${data.stage.dueDate}`
      }),
      workflow_progress: (data) => ({
        subject: 'ワークフローが進行しました',
        body: `${data.stage.stage}が完了しました。`
      }),
      workflow_escalation: (data) => ({
        subject: '【緊急】エスカレーション発生',
        body: `${data.stage.stage}がエスカレーションされました。至急対応をお願いします。`
      }),
      project_approved: (data) => ({
        subject: 'プロジェクトが承認されました',
        body: `プロジェクトID: ${data.workflow.projectId}が承認され、実行フェーズに移行しました。`
      }),
      project_rejected: (data) => ({
        subject: 'プロジェクトが却下されました',
        body: `プロジェクトID: ${data.workflow.projectId}が却下されました。理由: ${data.stage.comments}`
      })
    };
    
    const template = templates[templateName];
    return template ? template(data) : { subject: '', body: '' };
  }
}

export default NotificationService;