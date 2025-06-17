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
  | 'ESCALATION'
  | 'POLL_RESULT'
  | 'POLL_EXPIRED';

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
    // プロジェクト詳細ボタンを追加しない
    const enhancedActions = data.actions ? [...data.actions] : [];

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
      actions: enhancedActions,
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
  
  // 通知テンプレート（4カテゴリ対応）
  getNotificationTemplate(templateName: string, data: any): {
    subject: string;
    body: string;
  } {
    const templates: Record<string, (data: any) => { subject: string; body: string }> = {
      workflow_assignment: (data) => ({
        subject: '新しい承認依頼があります',
        body: `${data.stage.stage}の承認をお願いします。期限: ${data.stage.dueDate}`
      }),
      // 4カテゴリ別通知テンプレート
      operational_vote: (data) => ({
        subject: '🏥 業務改善の投票依頼',
        body: `業務改善案「${data.title}」への投票をお願いします。期限: ${data.deadline}`
      }),
      communication_vote: (data) => ({
        subject: '👥 コミュニケーション改善の投票依頼',
        body: `職場環境改善案「${data.title}」への投票をお願いします。期限: ${data.deadline}`
      }),
      innovation_vote: (data) => ({
        subject: '💡 イノベーション提案の投票依頼',
        body: `革新的提案「${data.title}」への投票をお願いします。期限: ${data.deadline}`
      }),
      strategic_vote: (data) => ({
        subject: '🎯 戦略提案の投票依頼（管理職向け）',
        body: `戦略提案「${data.title}」への投票をお願いします。期限: ${data.deadline}`
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

  // デモ用通知の初期化（田中太郎の1on1プロジェクトメンバー選出緊急通知）
  async initializeDemoNotifications(): Promise<void> {
    const now = new Date();
    const deadline = new Date('2024-12-22T17:00:00');
    const hoursUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    // 施設レベルのプロジェクトメンバー選出に関わる可能性のあるユーザーに通知
    const memberSelectionTargets = [
      'user-1', // 田中太郎（提案者）
      'user-5', // 高橋健太（チームリーダー）
      'user-7', // 渡辺大輔（スーパーバイザー）
      'user-8', // 中村恵子（HR部門長）
      'user-12', // 藤田洋平（営業本部長）
    ];

    await Promise.all(memberSelectionTargets.map(async (userId) => {
      await this.createActionableNotification(userId, 'MEMBER_SELECTION', {
        title: '🔥 緊急：施設プロジェクトメンバー選出期限迫る',
        message: `【1on1時間拡充プロジェクト】のメンバー選出期限まで残り${hoursUntilDeadline}時間です。田中太郎さんの提案が380点を獲得し、施設レベルのプロジェクトとして承認されました。メンバー選出が完了していません。`,
        dueDate: deadline,
        actions: [
          {
            id: 'participate',
            label: '参加',
            type: 'primary',
            action: 'participate'
          },
          {
            id: 'recommend',
            label: 'メンバー推薦',
            type: 'secondary',
            action: 'recommend',
            requiresComment: true
          },
          {
            id: 'view_details',
            label: '詳細',
            type: 'secondary',
            action: 'view'
          }
        ],
        metadata: {
          projectId: 'proj-003',
          postId: 'post-6',
          urgencyLevel: 3
        }
      });
    }));

    // さらに緊急性を高めるため、期限間近の投票催促通知も追加
    await this.createActionableNotification('user-1', 'DEADLINE_REMINDER', {
      title: '🎯 あなたの提案がプロジェクト化決定！',
      message: '「1on1時間増加」提案が施設プロジェクトレベル（380点）に到達しました！メンバー選出フェーズに入っています。22日17時までにチーム編成を完了する必要があります。',
      dueDate: deadline,
      actions: [
        {
          id: 'view_project',
          label: '詳細',
          type: 'primary',
          action: 'view'
        }
      ],
      metadata: {
        projectId: 'proj-003',
        postId: 'post-6',
        urgencyLevel: 4
      }
    });

    console.log('✅ デモ通知システム初期化完了 - 田中太郎1on1プロジェクト緊急メンバー選出通知');
  }
}

export default NotificationService;