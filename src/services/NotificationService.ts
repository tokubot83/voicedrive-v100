// 通知サービス - Phase 2 実装
import { ProjectWorkflow, WorkflowStage } from './ApprovalWorkflowEngine';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SLACK' | 'SMS';
export type NotificationUrgency = 'NORMAL' | 'HIGH' | 'URGENT';
export type NotificationType = 
  | 'APPROVAL_REQUIRED' 
  | 'MEMBER_SELECTION' 
  | 'VOTE_REQUIRED' 
  | 'EMERGENCY_ACTION'
  | 'PROJECT_UPDATE'
  | 'DEADLINE_REMINDER'
  | 'ESCALATION';

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

export interface SimpleNotificationData {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ActionableNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  dueDate?: Date;
  isRead: boolean;
  isActioned: boolean;
  actions?: NotificationAction[];
  metadata?: {
    projectId?: string;
    postId?: string;
    workflowStage?: string;
    urgencyLevel?: number;
  };
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string; // 'approve' | 'reject' | 'vote' | 'participate' | 'decline' | 'view'
  requiresComment?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  pending: number;
  overdue: number;
  byType: Record<NotificationType, number>;
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, ActionableNotification[]> = new Map();
  private notificationListeners: Set<(userId: string) => void> = new Set();

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 通知リスナー管理
  subscribeToNotifications(callback: (userId: string) => void): () => void {
    this.notificationListeners.add(callback);
    return () => this.notificationListeners.delete(callback);
  }

  private notifyListeners(userId: string): void {
    this.notificationListeners.forEach(callback => callback(userId));
  }

  // アクション可能な通知を作成
  async createActionableNotification(
    userId: string,
    type: NotificationType,
    data: {
      title: string;
      message: string;
      dueDate?: Date;
      actions?: NotificationAction[];
      metadata?: ActionableNotification['metadata'];
    }
  ): Promise<ActionableNotification> {
    const notification: ActionableNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title: data.title,
      message: data.message,
      createdAt: new Date(),
      dueDate: data.dueDate,
      isRead: false,
      isActioned: false,
      actions: data.actions,
      metadata: data.metadata
    };

    // ユーザーの通知リストに追加
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.push(notification);

    // リスナーに通知
    this.notifyListeners(userId);

    // 既存の通知システムと統合
    await this.sendNotification({
      to: { id: userId, name: userId },
      template: type,
      data: notification,
      urgency: this.determineUrgency(type, data.dueDate),
      channels: this.selectChannels(this.determineUrgency(type, data.dueDate))
    });

    return notification;
  }

  // ユーザーの通知を取得
  getUserNotifications(userId: string, filter?: {
    type?: NotificationType;
    unreadOnly?: boolean;
    pendingOnly?: boolean;
  }): ActionableNotification[] {
    const userNotifications = this.notifications.get(userId) || [];
    
    return userNotifications.filter(notification => {
      if (filter?.type && notification.type !== filter.type) return false;
      if (filter?.unreadOnly && notification.isRead) return false;
      if (filter?.pendingOnly && notification.isActioned) return false;
      return true;
    }).sort((a, b) => {
      // 緊急度と期限でソート
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // 通知統計を取得
  getUserNotificationStats(userId: string): NotificationStats {
    const userNotifications = this.notifications.get(userId) || [];
    const now = new Date();

    const stats: NotificationStats = {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.isRead).length,
      pending: userNotifications.filter(n => !n.isActioned).length,
      overdue: userNotifications.filter(n => 
        n.dueDate && n.dueDate < now && !n.isActioned
      ).length,
      byType: {} as Record<NotificationType, number>
    };

    // タイプ別集計
    const types: NotificationType[] = [
      'APPROVAL_REQUIRED', 'MEMBER_SELECTION', 'VOTE_REQUIRED',
      'EMERGENCY_ACTION', 'PROJECT_UPDATE', 'DEADLINE_REMINDER', 'ESCALATION'
    ];
    
    types.forEach(type => {
      stats.byType[type] = userNotifications.filter(n => n.type === type && !n.isActioned).length;
    });

    return stats;
  }

  // 通知を既読にする
  markAsRead(userId: string, notificationId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        this.notifyListeners(userId);
      }
    }
  }

  // 通知に対してアクションを実行
  async executeNotificationAction(
    userId: string,
    notificationId: string,
    actionId: string,
    comment?: string
  ): Promise<{ success: boolean; message: string }> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) {
      return { success: false, message: '通知が見つかりません' };
    }

    const notification = userNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return { success: false, message: '通知が見つかりません' };
    }

    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) {
      return { success: false, message: 'アクションが見つかりません' };
    }

    if (action.requiresComment && !comment) {
      return { success: false, message: 'コメントが必要です' };
    }

    // アクションを実行（実際の実装では各アクションタイプに応じた処理を行う）
    notification.isActioned = true;
    this.notifyListeners(userId);

    return { success: true, message: 'アクションが実行されました' };
  }

  private determineUrgency(type: NotificationType, dueDate?: Date): NotificationUrgency {
    if (type === 'EMERGENCY_ACTION') return 'URGENT';
    if (type === 'ESCALATION') return 'URGENT';
    
    if (dueDate) {
      const hoursUntilDue = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilDue < 2) return 'URGENT';
      if (hoursUntilDue < 24) return 'HIGH';
    }
    
    return 'NORMAL';
  }
  async sendWorkflowNotification(
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
        recipients: await this.getProjectInitiator(workflow),
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
  
  private mapPriorityToUrgency(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): NotificationUrgency {
    switch (priority) {
      case 'LOW':
      case 'MEDIUM':
        return 'NORMAL';
      case 'HIGH':
        return 'HIGH';
      case 'CRITICAL':
        return 'URGENT';
      default:
        return 'NORMAL';
    }
  }

  selectChannels(urgency: NotificationUrgency): NotificationChannel[] {
    const channelConfigs: Record<NotificationUrgency, NotificationChannel[]> = {
      NORMAL: ['IN_APP'],
      HIGH: ['IN_APP', 'EMAIL'],
      URGENT: ['IN_APP', 'EMAIL', 'SLACK', 'SMS']
    };
    return channelConfigs[urgency] || ['IN_APP'];
  }
  
  async sendNotification(notification: NotificationData | SimpleNotificationData): Promise<void> {
    // Handle simple notification format
    if ('recipientId' in notification) {
      const simpleNotification = notification as SimpleNotificationData;
      const recipient: NotificationRecipient = {
        id: simpleNotification.recipientId,
        name: simpleNotification.recipientId
      };
      
      const fullNotification: NotificationData = {
        to: recipient,
        template: simpleNotification.type,
        data: {
          title: simpleNotification.title,
          message: simpleNotification.message,
          ...simpleNotification.data
        },
        urgency: this.mapPriorityToUrgency(simpleNotification.priority),
        channels: this.selectChannels(this.mapPriorityToUrgency(simpleNotification.priority))
      };
      
      return this.sendNotification(fullNotification);
    }
    
    // Handle full notification format
    const recipients = Array.isArray(notification.to) ? notification.to : [notification.to];
    
    for (const recipient of recipients) {
      for (const channel of notification.channels) {
        await this.sendToChannel(channel, recipient, notification);
      }
    }
  }
  
  private async sendToChannel(
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
  
  private async sendInAppNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // アプリ内通知の実装
    console.log('Sending in-app notification to:', recipient.name);
    // 実際の実装では、WebSocketやプッシュ通知を使用
  }
  
  private async sendEmailNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // メール通知の実装
    console.log('Sending email to:', recipient.email);
    // 実際の実装では、メールサービスAPIを使用
  }
  
  private async sendSlackNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // Slack通知の実装
    console.log('Sending Slack message to:', recipient.slackId);
    // 実際の実装では、Slack APIを使用
  }
  
  private async sendSMSNotification(
    recipient: NotificationRecipient,
    notification: NotificationData
  ): Promise<void> {
    // SMS通知の実装
    console.log('Sending SMS to:', recipient.phone);
    // 実際の実装では、SMS APIを使用
  }
  
  // ヘルパーメソッド
  private async getStakeholders(workflow: ProjectWorkflow): Promise<NotificationRecipient[]> {
    // 実装では、ワークフローに関連するステークホルダーを取得
    return [];
  }
  
  private async getEscalationRecipients(stage: WorkflowStage): Promise<NotificationRecipient[]> {
    // 実装では、エスカレーション先の受信者を取得
    return [];
  }
  
  private async getAllParticipants(workflow: ProjectWorkflow): Promise<NotificationRecipient[]> {
    // 実装では、すべての参加者を取得
    return [];
  }
  
  private async getProjectInitiator(workflow: ProjectWorkflow): Promise<NotificationRecipient[]> {
    // 実装では、プロジェクト提案者を取得
    return [];
  }
  
  // 通知テンプレート
  getNotificationTemplate(templateName: string, data: any): {
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