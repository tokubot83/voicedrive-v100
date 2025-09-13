// 通知サービス - Phase 2 実装 + Pattern D リアルタイム通知統合
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
  | 'POLL_EXPIRED'
  | 'INTERVIEW_REMINDER_FIRST'      // 新入職員初回面談リマインダー
  | 'INTERVIEW_REMINDER_MONTHLY'    // 新入職員月次面談リマインダー
  | 'INTERVIEW_REMINDER_ANNUAL'     // 一般職員年次面談リマインダー
  | 'INTERVIEW_OVERDUE'             // 面談期限超過通知
  | 'INTERVIEW_AUTO_SCHEDULED'      // 自動スケジュール面談通知
  | 'INTERVIEW_BOOKING_CONFIRMED'   // 予約確定通知
  | 'INTERVIEW_BOOKING_CANCELLED'   // キャンセル通知
  | 'INTERVIEW_RESCHEDULE_REQUEST'  // 日時変更リクエスト通知
  | 'INTERVIEW_RESCHEDULE_APPROVED' // 日時変更承認通知
  | 'INTERVIEW_RESCHEDULE_REJECTED' // 日時変更拒否通知
  | 'INTERVIEW_REMINDER_24H'        // 面談前日リマインダー
  | 'INTERVIEW_REMINDER_2H'         // 面談2時間前リマインダー
  | 'ASSISTED_BOOKING_UPDATE'       // おまかせ予約状況更新
  | 'PROPOSAL_READY'                // 面談候補準備完了
  | 'BOOKING_STATUS_CHANGE'         // 予約ステータス変更
  | 'REALTIME_SYSTEM_MESSAGE';      // リアルタイムシステムメッセージ

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
  private actionCallbacks: Map<string, (userId: string, actionId: string, metadata: any, comment?: string) => Promise<boolean>> = new Map();

  // Pattern D リアルタイム通知用のWebSocket機能
  private websocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private realtimeListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // WebSocket接続の初期化（ブラウザ環境のみ）
    if (typeof window !== 'undefined') {
      this.initializeWebSocketConnection();
    }
  }

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

  // アクションコールバック登録
  registerActionCallback(
    actionType: string,
    callback: (userId: string, actionId: string, metadata: any, comment?: string) => Promise<boolean>
  ): void {
    this.actionCallbacks.set(actionType, callback);
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
      selectionReason?: string;
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
      'EMERGENCY_ACTION', 'PROJECT_UPDATE', 'DEADLINE_REMINDER', 'ESCALATION',
      'INTERVIEW_REMINDER_FIRST', 'INTERVIEW_REMINDER_MONTHLY',
      'INTERVIEW_REMINDER_ANNUAL', 'INTERVIEW_OVERDUE', 'INTERVIEW_AUTO_SCHEDULED',
      'INTERVIEW_BOOKING_CONFIRMED', 'INTERVIEW_BOOKING_CANCELLED',
      'INTERVIEW_RESCHEDULE_REQUEST', 'INTERVIEW_RESCHEDULE_APPROVED',
      'INTERVIEW_RESCHEDULE_REJECTED', 'INTERVIEW_REMINDER_24H', 'INTERVIEW_REMINDER_2H'
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

    // 特定のアクションタイプに対してコールバックを実行
    if (action.action === 'approve' || action.action === 'reject') {
      const callback = this.actionCallbacks.get('approval');
      if (callback) {
        try {
          const success = await callback(userId, action.action, notification.metadata, comment);
          if (!success) {
            return { success: false, message: '承認処理に失敗しました' };
          }
        } catch (error) {
          console.error('承認アクション実行エラー:', error);
          return { success: false, message: '承認処理でエラーが発生しました' };
        }
      }
    }

    // アクションを実行
    notification.isActioned = true;
    this.notifyListeners(userId);

    return { success: true, message: 'アクションが実行されました' };
  }

  private determineUrgency(type: NotificationType, dueDate?: Date): NotificationUrgency {
    if (type === 'EMERGENCY_ACTION') return 'URGENT';
    if (type === 'ESCALATION') return 'URGENT';
    if (type === 'INTERVIEW_OVERDUE') return 'URGENT';
    if (type === 'INTERVIEW_REMINDER_2H') return 'URGENT';

    if (type === 'INTERVIEW_REMINDER_FIRST') return 'HIGH';
    if (type === 'INTERVIEW_AUTO_SCHEDULED') return 'HIGH';
    if (type === 'INTERVIEW_RESCHEDULE_REQUEST') return 'HIGH';
    if (type === 'INTERVIEW_BOOKING_CANCELLED') return 'HIGH';

    if (type === 'INTERVIEW_BOOKING_CONFIRMED') return 'NORMAL';
    if (type === 'INTERVIEW_RESCHEDULE_APPROVED') return 'NORMAL';
    if (type === 'INTERVIEW_RESCHEDULE_REJECTED') return 'NORMAL';
    if (type === 'INTERVIEW_REMINDER_24H') return 'NORMAL';

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
  
  /**
   * メンバー選出通知を送信（理由付き）
   */
  async sendMemberSelectionNotification(
    selectedMembers: Array<{
      userId: string;
      name: string;
      role: string;
      selectionReason?: string;
    }>,
    projectData: {
      projectId: string;
      projectTitle: string;
      selectorName: string;
      dueDate: Date;
    }
  ): Promise<void> {
    const promises = selectedMembers.map(member => 
      this.createActionableNotification(member.userId, 'MEMBER_SELECTION', {
        title: `🎯 プロジェクトメンバー選出通知`,
        message: this.buildMemberSelectionMessage(member, projectData),
        dueDate: projectData.dueDate,
        actions: [
          {
            id: 'accept',
            label: '参加する',
            type: 'primary',
            action: 'participate'
          },
          {
            id: 'decline',
            label: '辞退する',
            type: 'secondary',
            action: 'decline',
            requiresComment: true
          },
          {
            id: 'negotiate',
            label: '条件相談',
            type: 'secondary',
            action: 'negotiate',
            requiresComment: true
          }
        ],
        metadata: {
          projectId: projectData.projectId,
          urgencyLevel: 3
        },
        selectionReason: member.selectionReason
      })
    );

    await Promise.all(promises);
    console.log(`✅ メンバー選出通知送信完了: ${selectedMembers.length}名`);
  }

  /**
   * メンバー選出メッセージを構築
   */
  private buildMemberSelectionMessage(
    member: { name: string; role: string; selectionReason?: string },
    projectData: { projectTitle: string; selectorName: string }
  ): string {
    let message = `${member.name}さん、「${projectData.projectTitle}」プロジェクトのメンバーに選出されました。\n\n`;
    message += `選出権限者: ${projectData.selectorName}\n`;
    message += `あなたの役割: ${member.role}\n\n`;
    
    if (member.selectionReason) {
      message += `【選出理由】\n${member.selectionReason}\n\n`;
    }
    
    message += `プロジェクトへの参加をご検討ください。`;
    
    return message;
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
      }),
      // 面談リマインダー用テンプレート
      interview_reminder_first: (data) => ({
        subject: '🩺 新入職員初回面談のご案内',
        body: `入職おめでとうございます。${data.daysBefore}日後に初回面談が予定されています。人事部までご連絡ください。`
      }),
      interview_reminder_monthly: (data) => ({
        subject: '📅 月次面談のリマインダー',
        body: `新入職員月次面談が${data.daysBefore}日後に予定されています。忘れずに予約してください。`
      }),
      interview_reminder_annual: (data) => ({
        subject: '📋 年次面談のお知らせ',
        body: `年次定期面談の時期になりました。${data.daysBefore}日以内に人事部までご連絡ください。`
      }),
      interview_overdue: (data) => ({
        subject: '⚠️ 面談期限超過のお知らせ',
        body: `面談の期限が${data.daysOverdue}日過ぎています。至急人事部までご連絡ください。`
      }),
      interview_auto_scheduled: (data) => ({
        subject: '🔔 面談が自動スケジュールされました',
        body: `${data.interviewType}が${data.scheduledDate}に自動スケジュールされました。詳細は人事部までお問い合わせください。`
      }),
      // 新しい面談予約関連テンプレート
      interview_booking_confirmed: (data) => ({
        subject: '✅ 面談予約が確定しました',
        body: `面談予約が確定しました。日時: ${data.bookingDate} ${data.timeSlot}`
      }),
      interview_booking_cancelled: (data) => ({
        subject: '❌ 面談がキャンセルされました',
        body: `面談がキャンセルされました。理由: ${data.cancellationReason}`
      }),
      interview_reschedule_request: (data) => ({
        subject: '📅 面談日時変更リクエスト',
        body: `${data.employeeName}さんから面談日時の変更リクエストが届きました。`
      }),
      interview_reschedule_approved: (data) => ({
        subject: '✅ 面談日時変更が承認されました',
        body: `面談日時の変更が承認されました。新しい日時: ${data.newDateTime}`
      }),
      interview_reschedule_rejected: (data) => ({
        subject: '❌ 面談日時変更が拒否されました',
        body: `面談日時の変更リクエストが拒否されました。理由: ${data.rejectionReason}`
      }),
      interview_reminder_24h: (data) => ({
        subject: '📅 明日は面談日です',
        body: `明日の面談のリマインダーです。日時: ${data.interviewDateTime} ${data.timeSlot}`
      }),
      interview_reminder_2h: (data) => ({
        subject: '🔔 面談まであと2時間です',
        body: `面談まであと2時間です。お時間に遅れないようお気をつけください。`
      })
    };
    
    const template = templates[templateName];
    return template ? template(data) : { subject: '', body: '' };
  }

  // デモ用通知の初期化（立神リハビリテーション温泉病院の正しいデモデータ）
  async initializeDemoNotifications(): Promise<void> {
    const now = new Date();
    const deadline = new Date('2025-06-30T23:59:59');
    const hoursUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    // 1. 承認権限者への承認発動通知（立神リハビリ病院の権限者）
    const approvalAuthorities = [
      { userId: 'user-1', name: '山田 太郎', role: '院長', level: 4 },
      { userId: 'user-2', name: '佐藤 花子', role: '総師長', level: 4 },
      { userId: 'user-rehab-head', name: '松本 隆一', role: 'リハビリテーション部長', level: 4 }
    ];

    await Promise.all(approvalAuthorities.map(async (authority) => {
      await this.createActionableNotification(authority.userId, 'APPROVAL_REQUIRED', {
        title: '🏥 非常勤職員処遇改善プロジェクト承認要請',
        message: `【非常勤職員の慶弔休暇取得制度の導入】が施設レベル（94%支持）に到達し、${authority.role}の承認が必要です。渡辺由美さんの提案を予算承認・制度運用の観点からご判断ください。`,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48時間後
        actions: [
          {
            id: 'approve',
            label: '承認',
            type: 'primary',
            action: 'approve',
            requiresComment: true
          },
          {
            id: 'request_modification',
            label: '修正要求',
            type: 'secondary',
            action: 'request_modification',
            requiresComment: true
          },
          {
            id: 'reject',
            label: '却下',
            type: 'danger',
            action: 'reject',
            requiresComment: true
          }
        ],
        metadata: {
          projectId: 'proj-1',
          postId: 'post-1',
          workflowStage: 'FACILITY_APPROVAL',
          urgencyLevel: 4
        }
      });
    }));

    // 2. 非常勤職員処遇改善プロジェクトメンバー選出通知
    const memberSelectionTargets = [
      'user-7', // 渡辺由美（提案者・非常勤看護師）
      'user-3', // 鈴木美香（医療療養病棟師長）
      'user-4', // 田中恵子（看護主任）
      'user-5', // 高橋真理（介護看護補助者主任）
      'user-2', // 佐藤花子（総師長）
    ];

    await Promise.all(memberSelectionTargets.map(async (userId) => {
      await this.createActionableNotification(userId, 'MEMBER_SELECTION', {
        title: '🔥 緊急：非常勤職員処遇改善プロジェクトメンバー選出',
        message: `【非常勤職員の慶弔休暇取得制度の導入】のメンバー選出期限まで残り${Math.max(hoursUntilDeadline, 24)}時間です。渡辺由美さんの提案が94%の支持を獲得し、施設レベルのプロジェクトとして承認されました。`,
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
          projectId: 'proj-1',
          postId: 'post-1',
          urgencyLevel: 3
        }
      });
    }));

    // 3. 投稿者（渡辺由美）へのプロジェクト化成功通知
    await this.createActionableNotification('user-7', 'PROJECT_UPDATE', {
      title: '🎯 おめでとうございます！あなたの提案がプロジェクト化決定！',
      message: '「非常勤職員の慶弔休暇取得制度の導入」提案が施設プロジェクトレベル（94%支持）に到達しました！現在、承認プロセス中です。6月30日までに制度設計を完了する必要があります。',
      dueDate: deadline,
      actions: [
        {
          id: 'view_project',
          label: 'プロジェクト詳細',
          type: 'primary',
          action: 'view'
        },
        {
          id: 'update_proposal',
          label: '提案更新',
          type: 'secondary',
          action: 'update'
        }
      ],
      metadata: {
        projectId: 'proj-1',
        postId: 'post-1',
        urgencyLevel: 2
      }
    });

    // 4. 音声入力システム導入プロジェクトの進捗通知
    await this.createActionableNotification('user-4', 'PROJECT_UPDATE', {
      title: '📢 音声入力システム導入プロジェクト進捗報告',
      message: '「音声入力を活用した申し送り業務の効率化」プロジェクトが部門検討フェーズに入りました。予算120万円での導入が検討されています。',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
      actions: [
        {
          id: 'review_budget',
          label: '予算検討',
          type: 'primary',
          action: 'review'
        },
        {
          id: 'provide_feedback',
          label: 'フィードバック',
          type: 'secondary',
          action: 'feedback',
          requiresComment: true
        }
      ],
      metadata: {
        projectId: 'proj-2',
        postId: 'post-4',
        urgencyLevel: 2
      }
    });

    // 5. リハビリテーション部の新人教育プログラム改善通知
    await this.createActionableNotification('user-rehab-head', 'MEMBER_SELECTION', {
      title: '👥 新人教育プログラム改善メンバー募集',
      message: '木村誠さんの「理学療法士新人教育プログラム改善」提案についてプロジェクトメンバーを募集しています。リハビリテーション部の専門性向上が期待されます。',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5日後
      actions: [
        {
          id: 'assign_mentor',
          label: 'メンター指名',
          type: 'primary',
          action: 'assign'
        },
        {
          id: 'schedule_meeting',
          label: '会議設定',
          type: 'secondary',
          action: 'schedule'
        }
      ],
      metadata: {
        projectId: 'proj-rehab-education',
        urgencyLevel: 1
      }
    });

    // 6. 面談リマインダー通知（立神リハビリ病院スタッフ向け）
    await this.createActionableNotification('user-6', 'INTERVIEW_REMINDER_FIRST', {
      title: '📅 職員面談リマインダー（立神リハビリテーション温泉病院）',
      message: '伊藤麻衣さん、四半期面談の時期になりました。来週金曜日に看護部での面談を予定しています。キャリア発達や職場環境について相談しましょう。',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3日後
      actions: [
        {
          id: 'confirm_attendance',
          label: '出席確認',
          type: 'primary',
          action: 'confirm'
        },
        {
          id: 'reschedule',
          label: '日程変更',
          type: 'secondary',
          action: 'reschedule'
        }
      ],
      metadata: {
        urgencyLevel: 2
      }
    });

    console.log('✅ デモ通知システム初期化完了 - 立神リハビリテーション温泉病院データ統合・承認権限発動・プロジェクト化通知');
  }

  // 面談リマインダー送信メソッド
  async sendInterviewReminder(
    employeeId: string, 
    reminderType: 'INTERVIEW_REMINDER_FIRST' | 'INTERVIEW_REMINDER_MONTHLY' | 'INTERVIEW_REMINDER_ANNUAL' | 'INTERVIEW_OVERDUE',
    data: {
      employeeName: string;
      interviewType: string;
      dueDate: Date;
      daysBefore?: number;
      daysOverdue?: number;
      additionalInfo?: string;
    }
  ): Promise<void> {
    const actions = this.getInterviewReminderActions(reminderType);
    
    const notification = await this.createActionableNotification(employeeId, reminderType, {
      title: this.getInterviewReminderTitle(reminderType, data),
      message: this.getInterviewReminderMessage(reminderType, data),
      dueDate: data.dueDate,
      actions,
      metadata: {
        urgencyLevel: reminderType === 'INTERVIEW_OVERDUE' ? 4 : 2
      }
    });

    console.log(`✅ 面談リマインダー送信完了: ${employeeId} - ${reminderType}`);
  }

  private getInterviewReminderTitle(
    type: 'INTERVIEW_REMINDER_FIRST' | 'INTERVIEW_REMINDER_MONTHLY' | 'INTERVIEW_REMINDER_ANNUAL' | 'INTERVIEW_OVERDUE',
    data: any
  ): string {
    switch (type) {
      case 'INTERVIEW_REMINDER_FIRST':
        return '🩺 新入職員初回面談のご案内';
      case 'INTERVIEW_REMINDER_MONTHLY':
        return '📅 月次面談のリマインダー';
      case 'INTERVIEW_REMINDER_ANNUAL':
        return '📋 年次面談のお知らせ';
      case 'INTERVIEW_OVERDUE':
        return '⚠️ 面談期限超過のお知らせ';
      default:
        return '面談のお知らせ';
    }
  }

  private getInterviewReminderMessage(
    type: 'INTERVIEW_REMINDER_FIRST' | 'INTERVIEW_REMINDER_MONTHLY' | 'INTERVIEW_REMINDER_ANNUAL' | 'INTERVIEW_OVERDUE',
    data: any
  ): string {
    const dayText = data.daysBefore === 1 ? '明日' : `${data.daysBefore}日後`;
    
    switch (type) {
      case 'INTERVIEW_REMINDER_FIRST':
        return `${data.employeeName}さん、入職おめでとうございます。${dayText}に初回面談が予定されています。人事部までご連絡ください。`;
      case 'INTERVIEW_REMINDER_MONTHLY':
        return `新入職員月次面談が${dayText}に予定されています。忘れずに予約してください。`;
      case 'INTERVIEW_REMINDER_ANNUAL':
        return `年次定期面談の時期になりました。${data.daysBefore}日以内に人事部までご連絡ください。`;
      case 'INTERVIEW_OVERDUE':
        return `面談の期限が${data.daysOverdue}日過ぎています。至急人事部までご連絡ください。`;
      default:
        return '面談についてのお知らせです。';
    }
  }

  private getInterviewReminderActions(
    type: 'INTERVIEW_REMINDER_FIRST' | 'INTERVIEW_REMINDER_MONTHLY' | 'INTERVIEW_REMINDER_ANNUAL' | 'INTERVIEW_OVERDUE'
  ): NotificationAction[] {
    const commonActions: NotificationAction[] = [
      {
        id: 'book_interview',
        label: '面談予約',
        type: 'primary',
        action: 'book_interview'
      },
      {
        id: 'view_details',
        label: '詳細確認',
        type: 'secondary',
        action: 'view'
      }
    ];

    if (type === 'INTERVIEW_OVERDUE') {
      commonActions.unshift({
        id: 'urgent_contact',
        label: '至急連絡',
        type: 'danger',
        action: 'urgent_contact'
      });
    }

    return commonActions;
  }

  // 一括面談リマインダー送信（日次バッチ処理用）
  async sendBatchInterviewReminders(reminders: Array<{
    employeeId: string;
    employeeName: string;
    reminderType: 'INTERVIEW_REMINDER_FIRST' | 'INTERVIEW_REMINDER_MONTHLY' | 'INTERVIEW_REMINDER_ANNUAL' | 'INTERVIEW_OVERDUE';
    interviewType: string;
    dueDate: Date;
    daysBefore?: number;
    daysOverdue?: number;
  }>): Promise<void> {
    const promises = reminders.map(reminder =>
      this.sendInterviewReminder(reminder.employeeId, reminder.reminderType, {
        employeeName: reminder.employeeName,
        interviewType: reminder.interviewType,
        dueDate: reminder.dueDate,
        daysBefore: reminder.daysBefore,
        daysOverdue: reminder.daysOverdue
      })
    );

    await Promise.all(promises);
    console.log(`✅ 一括面談リマインダー送信完了: ${reminders.length}件`);
  }

  // === 面談予約関連通知 ===

  // 予約確定通知
  async sendBookingConfirmationNotification(bookingData: {
    employeeId: string;
    employeeName: string;
    bookingDate: Date;
    timeSlot: string;
    interviewType: string;
    interviewerName?: string;
    bookingId: string;
    facility: string;
  }): Promise<void> {
    const actions = [
      {
        id: 'view_booking',
        label: '予約詳細確認',
        type: 'primary' as const,
        action: 'view_booking'
      },
      {
        id: 'prepare_interview',
        label: '面談準備',
        type: 'secondary' as const,
        action: 'prepare'
      }
    ];

    await this.createActionableNotification(bookingData.employeeId, 'INTERVIEW_BOOKING_CONFIRMED', {
      title: '✅ 面談予約が確定しました',
      message: `${bookingData.employeeName}さん、面談予約が確定しました。\n\n` +
               `📅 日時: ${this.formatDateJP(bookingData.bookingDate)} ${bookingData.timeSlot}\n` +
               `🏥 場所: ${bookingData.facility}\n` +
               `💼 面談種類: ${bookingData.interviewType}\n` +
               `👤 担当者: ${bookingData.interviewerName || '未定'}\n\n` +
               `面談前日にもリマインダーをお送りします。`,
      dueDate: bookingData.bookingDate,
      actions,
      metadata: {
        bookingId: bookingData.bookingId,
        urgencyLevel: 1
      }
    });

    // MCP連携：職員カルテシステムに予約確定を通知
    await this.notifyMCPBookingEvent('BOOKING_CONFIRMED', bookingData);

    console.log(`✅ 予約確定通知送信完了: ${bookingData.employeeId} - ${bookingData.bookingId}`);
  }

  // キャンセル通知
  async sendBookingCancellationNotification(cancellationData: {
    employeeId: string;
    employeeName: string;
    originalBookingDate: Date;
    timeSlot: string;
    interviewType: string;
    cancellationReason: string;
    cancelledBy: string;
    bookingId: string;
    alternativeSuggestions?: any[];
  }): Promise<void> {
    const actions = [
      {
        id: 'book_alternative',
        label: '代替日時予約',
        type: 'primary' as const,
        action: 'book_alternative'
      },
      {
        id: 'contact_support',
        label: 'サポート連絡',
        type: 'secondary' as const,
        action: 'contact'
      }
    ];

    await this.createActionableNotification(cancellationData.employeeId, 'INTERVIEW_BOOKING_CANCELLED', {
      title: '❌ 面談がキャンセルされました',
      message: `${cancellationData.employeeName}さん、面談がキャンセルされました。\n\n` +
               `📅 キャンセルされた日時: ${this.formatDateJP(cancellationData.originalBookingDate)} ${cancellationData.timeSlot}\n` +
               `💼 面談種類: ${cancellationData.interviewType}\n` +
               `📝 理由: ${cancellationData.cancellationReason}\n\n` +
               `必要に応じて、新しい日時での面談予約をお願いします。`,
      actions,
      metadata: {
        bookingId: cancellationData.bookingId,
        urgencyLevel: 2
      }
    });

    // 面談者・管理者への通知（該当する場合）
    await this.notifyInterviewerAndAdmins('CANCELLATION', cancellationData);

    // MCP連携：職員カルテシステムにキャンセルを記録
    await this.notifyMCPBookingEvent('BOOKING_CANCELLED', cancellationData);

    console.log(`✅ キャンセル通知送信完了: ${cancellationData.employeeId} - ${cancellationData.bookingId}`);
  }

  // 日時変更リクエスト通知（管理者向け）
  async sendRescheduleRequestNotification(rescheduleData: {
    employeeId: string;
    employeeName: string;
    currentDateTime: Date;
    preferredDates: Date[];
    reason: string;
    requestId: string;
    bookingId: string;
    adminIds: string[];
  }): Promise<void> {
    const actions = [
      {
        id: 'approve_reschedule',
        label: '変更承認',
        type: 'primary' as const,
        action: 'approve',
        requiresComment: true
      },
      {
        id: 'reject_reschedule',
        label: '変更拒否',
        type: 'danger' as const,
        action: 'reject',
        requiresComment: true
      },
      {
        id: 'view_details',
        label: '詳細確認',
        type: 'secondary' as const,
        action: 'view'
      }
    ];

    const preferredDatesText = rescheduleData.preferredDates
      .map((date, index) => `第${index + 1}希望: ${this.formatDateJP(date)}`)
      .join('\n');

    // 管理者全員に通知
    const promises = rescheduleData.adminIds.map(adminId =>
      this.createActionableNotification(adminId, 'INTERVIEW_RESCHEDULE_REQUEST', {
        title: '📅 面談日時変更リクエスト',
        message: `${rescheduleData.employeeName}さんから面談日時の変更リクエストが届きました。\n\n` +
                 `📅 現在の予定: ${this.formatDateJP(rescheduleData.currentDateTime)}\n\n` +
                 `🔄 希望日時:\n${preferredDatesText}\n\n` +
                 `📝 変更理由: ${rescheduleData.reason}\n\n` +
                 `承認または拒否をお願いします。`,
        actions,
        metadata: {
          requestId: rescheduleData.requestId,
          bookingId: rescheduleData.bookingId,
          employeeId: rescheduleData.employeeId,
          urgencyLevel: 2
        }
      })
    );

    await Promise.all(promises);

    // MCP連携：職員カルテシステムに変更リクエストを記録
    await this.notifyMCPBookingEvent('RESCHEDULE_REQUESTED', rescheduleData);

    console.log(`✅ 日時変更リクエスト通知送信完了: ${rescheduleData.employeeId} - ${rescheduleData.requestId}`);
  }

  // 日時変更承認通知
  async sendRescheduleApprovalNotification(approvalData: {
    employeeId: string;
    employeeName: string;
    newDateTime: Date;
    timeSlot: string;
    approvedBy: string;
    bookingId: string;
    requestId: string;
  }): Promise<void> {
    const actions = [
      {
        id: 'view_new_booking',
        label: '新しい予約確認',
        type: 'primary' as const,
        action: 'view_booking'
      },
      {
        id: 'prepare_interview',
        label: '面談準備',
        type: 'secondary' as const,
        action: 'prepare'
      }
    ];

    await this.createActionableNotification(approvalData.employeeId, 'INTERVIEW_RESCHEDULE_APPROVED', {
      title: '✅ 面談日時変更が承認されました',
      message: `${approvalData.employeeName}さん、面談日時の変更が承認されました。\n\n` +
               `📅 新しい日時: ${this.formatDateJP(approvalData.newDateTime)} ${approvalData.timeSlot}\n` +
               `👤 承認者: ${approvalData.approvedBy}\n\n` +
               `新しい日時での面談をお待ちしています。`,
      dueDate: approvalData.newDateTime,
      actions,
      metadata: {
        bookingId: approvalData.bookingId,
        requestId: approvalData.requestId,
        urgencyLevel: 1
      }
    });

    // MCP連携：職員カルテシステムに変更承認を記録
    await this.notifyMCPBookingEvent('RESCHEDULE_APPROVED', approvalData);

    console.log(`✅ 日時変更承認通知送信完了: ${approvalData.employeeId} - ${approvalData.requestId}`);
  }

  // 日時変更拒否通知
  async sendRescheduleRejectionNotification(rejectionData: {
    employeeId: string;
    employeeName: string;
    rejectedBy: string;
    rejectionReason: string;
    originalDateTime: Date;
    bookingId: string;
    requestId: string;
  }): Promise<void> {
    const actions = [
      {
        id: 'contact_admin',
        label: '管理者に連絡',
        type: 'primary' as const,
        action: 'contact'
      },
      {
        id: 'view_original_booking',
        label: '元の予約確認',
        type: 'secondary' as const,
        action: 'view_booking'
      }
    ];

    await this.createActionableNotification(rejectionData.employeeId, 'INTERVIEW_RESCHEDULE_REJECTED', {
      title: '❌ 面談日時変更が拒否されました',
      message: `${rejectionData.employeeName}さん、面談日時の変更リクエストが拒否されました。\n\n` +
               `📅 元の日時: ${this.formatDateJP(rejectionData.originalDateTime)}\n` +
               `👤 判断者: ${rejectionData.rejectedBy}\n` +
               `📝 理由: ${rejectionData.rejectionReason}\n\n` +
               `元の日時での面談となります。ご質問がある場合は管理者までお問い合わせください。`,
      dueDate: rejectionData.originalDateTime,
      actions,
      metadata: {
        bookingId: rejectionData.bookingId,
        requestId: rejectionData.requestId,
        urgencyLevel: 2
      }
    });

    // MCP連携：職員カルテシステムに変更拒否を記録
    await this.notifyMCPBookingEvent('RESCHEDULE_REJECTED', rejectionData);

    console.log(`✅ 日時変更拒否通知送信完了: ${rejectionData.employeeId} - ${rejectionData.requestId}`);
  }

  // 面談前日リマインダー
  async sendInterviewReminderBeforeInterview(reminderData: {
    employeeId: string;
    employeeName: string;
    interviewDateTime: Date;
    timeSlot: string;
    interviewType: string;
    interviewerName: string;
    facility: string;
    bookingId: string;
    hoursUntil: number;
  }): Promise<void> {
    const notificationType = reminderData.hoursUntil <= 2 ? 'INTERVIEW_REMINDER_2H' : 'INTERVIEW_REMINDER_24H';
    const title = reminderData.hoursUntil <= 2 ? '🔔 面談まであと2時間です' : '📅 明日は面談日です';

    const actions = [
      {
        id: 'confirm_attendance',
        label: '出席確認',
        type: 'primary' as const,
        action: 'confirm'
      },
      {
        id: 'view_location',
        label: '場所確認',
        type: 'secondary' as const,
        action: 'location'
      },
      {
        id: 'emergency_contact',
        label: '緊急連絡',
        type: 'secondary' as const,
        action: 'emergency'
      }
    ];

    await this.createActionableNotification(reminderData.employeeId, notificationType, {
      title,
      message: `${reminderData.employeeName}さん、面談のリマインダーです。\n\n` +
               `📅 日時: ${this.formatDateJP(reminderData.interviewDateTime)} ${reminderData.timeSlot}\n` +
               `🏥 場所: ${reminderData.facility}\n` +
               `💼 面談種類: ${reminderData.interviewType}\n` +
               `👤 担当者: ${reminderData.interviewerName}\n\n` +
               `お時間に遅れないようお気をつけください。`,
      dueDate: reminderData.interviewDateTime,
      actions,
      metadata: {
        bookingId: reminderData.bookingId,
        urgencyLevel: reminderData.hoursUntil <= 2 ? 3 : 2
      }
    });

    console.log(`✅ 面談リマインダー送信完了: ${reminderData.employeeId} - ${reminderData.hoursUntil}時間前`);
  }

  // === プライベートメソッド ===

  // MCP連携通知（職員カルテシステム）
  private async notifyMCPBookingEvent(eventType: string, data: any): Promise<void> {
    try {
      // 職員カルテシステムへの通知（実際の実装ではMCPサーバー経由）
      const mcpPayload = {
        eventType,
        timestamp: new Date().toISOString(),
        employeeId: data.employeeId,
        bookingId: data.bookingId || data.requestId,
        interviewData: {
          type: data.interviewType,
          date: data.bookingDate || data.originalBookingDate || data.currentDateTime,
          status: this.mapEventTypeToStatus(eventType),
          facility: data.facility || '本院',
          reason: data.reason || data.cancellationReason || data.rejectionReason
        },
        mcpVersion: '1.0',
        systemId: 'voicedrive-interview-system'
      };

      // 実際の実装ではMCPサーバーのAPIを呼び出し
      console.log(`📡 MCP通知: ${eventType} - ${data.employeeId}`, mcpPayload);

      // TODO: 実際のMCP連携実装
      // await mcpClient.sendNotification('EMPLOYEE_INTERVIEW_EVENT', mcpPayload);

    } catch (error) {
      console.error(`❌ MCP通知エラー: ${eventType}`, error);
      // MCP連携エラーは本機能を停止させない
    }
  }

  // 面談者・管理者への通知
  private async notifyInterviewerAndAdmins(eventType: string, data: any): Promise<void> {
    // 実装では面談者と管理者のIDを取得して通知
    const stakeholders = await this.getInterviewStakeholders(data.bookingId);

    const promises = stakeholders.map(stakeholder =>
      this.createActionableNotification(stakeholder.id, 'INTERVIEW_BOOKING_CANCELLED', {
        title: `📋 職員面談${eventType === 'CANCELLATION' ? 'キャンセル' : '変更'}通知`,
        message: `${data.employeeName}さんの面談が${eventType === 'CANCELLATION' ? 'キャンセル' : '変更'}されました。`,
        actions: [{
          id: 'view_schedule',
          label: 'スケジュール確認',
          type: 'primary' as const,
          action: 'view'
        }],
        metadata: {
          bookingId: data.bookingId,
          urgencyLevel: 1
        }
      })
    );

    await Promise.all(promises);
  }

  // ユーティリティメソッド
  private formatDateJP(date: Date): string {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }

  private mapEventTypeToStatus(eventType: string): string {
    const statusMap: Record<string, string> = {
      'BOOKING_CONFIRMED': 'confirmed',
      'BOOKING_CANCELLED': 'cancelled',
      'RESCHEDULE_REQUESTED': 'reschedule_pending',
      'RESCHEDULE_APPROVED': 'rescheduled',
      'RESCHEDULE_REJECTED': 'confirmed'
    };
    return statusMap[eventType] || 'unknown';
  }

  private async getInterviewStakeholders(bookingId: string): Promise<Array<{ id: string; name: string; role: string }>> {
    // 実装では該当する面談の関係者（面談者、管理者）を取得
    return [
      { id: 'interviewer_001', name: '田中 キャリア支援部門長', role: 'interviewer' },
      { id: 'user-2', name: '佐藤 花子', role: 'hr_admin' }
    ];
  }

  // === Pattern D リアルタイム通知システム ===

  // WebSocket接続の初期化
  private initializeWebSocketConnection() {
    try {
      // 医療システムのWebSocketエンドポイント
      const wsUrl = process.env.REACT_APP_MEDICAL_SYSTEM_WS ||
                   'ws://medical-dev.hospital.jp/ws/notifications';

      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = this.handleWebSocketOpen.bind(this);
      this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
      this.websocket.onclose = this.handleWebSocketClose.bind(this);
      this.websocket.onerror = this.handleWebSocketError.bind(this);

    } catch (error) {
      console.error('WebSocket接続初期化エラー:', error);
      this.scheduleWebSocketReconnect();
    }
  }

  // WebSocket接続開始時の処理
  private handleWebSocketOpen() {
    console.log('医療システム通知サービスに接続しました');
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // 認証メッセージ送信
    this.sendWebSocketAuthMessage();

    // ハートビート開始
    this.startWebSocketHeartbeat();
  }

  // WebSocketメッセージ受信時の処理
  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);

      // ハートビート応答の場合はスキップ
      if (data.type === 'pong') {
        return;
      }

      // おまかせ予約状況更新の処理
      if (data.type === 'booking_status_update') {
        this.handleAssistedBookingUpdate(data.payload);
      }

      // 提案候補準備完了通知
      if (data.type === 'proposal_ready') {
        this.handleProposalReadyUpdate(data.payload);
      }

      // 一般通知の処理
      if (data.type === 'notification') {
        this.handleRealtimeNotification(data.payload);
      }

    } catch (error) {
      console.error('WebSocket通知メッセージ解析エラー:', error);
    }
  }

  // WebSocket接続終了時の処理
  private handleWebSocketClose(event: CloseEvent) {
    console.log('医療システム通知サービスから切断されました', event.code);
    this.isConnected = false;
    this.stopWebSocketHeartbeat();

    // 正常終了でなければ再接続を試行
    if (event.code !== 1000) {
      this.scheduleWebSocketReconnect();
    }
  }

  // WebSocketエラー時の処理
  private handleWebSocketError(error: Event) {
    console.error('WebSocket接続エラー:', error);
    this.isConnected = false;
  }

  // WebSocket認証メッセージ送信
  private sendWebSocketAuthMessage() {
    const authMessage = {
      type: 'auth',
      token: this.getWebSocketAuthToken(),
      clientType: 'voicedrive',
      subscriptions: [
        'assisted_booking_updates',
        'proposal_notifications',
        'booking_status_changes',
        'system_messages'
      ]
    };

    this.sendWebSocketMessage(authMessage);
  }

  // WebSocketハートビート開始
  private startWebSocketHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.websocket?.readyState === WebSocket.OPEN) {
        this.sendWebSocketMessage({ type: 'ping' });
      }
    }, 30000); // 30秒間隔
  }

  // WebSocketハートビート停止
  private stopWebSocketHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // WebSocketメッセージ送信
  private sendWebSocketMessage(message: any) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  // WebSocket再接続スケジュール
  private scheduleWebSocketReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('最大再接続回数に達しました。リアルタイム通知機能が無効になります。');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数バックオフ

    console.log(`${delay}ms後にWebSocket再接続を試行します (試行回数: ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.initializeWebSocketConnection();
    }, delay);
  }

  // WebSocket認証トークン取得
  private getWebSocketAuthToken(): string {
    return localStorage.getItem('voicedrive_jwt_token') ||
           sessionStorage.getItem('voicedrive_jwt_token') ||
           'dev-demo-token';
  }

  // おまかせ予約状況更新の処理
  private handleAssistedBookingUpdate(payload: any) {
    const notification = {
      id: `assisted_${payload.requestId}_${Date.now()}`,
      type: 'ASSISTED_BOOKING_UPDATE',
      requestId: payload.requestId,
      title: this.getAssistedBookingUpdateTitle(payload.newStatus),
      message: payload.message,
      urgency: payload.actionRequired ? 'high' : 'medium',
      timestamp: new Date().toISOString(),
      actionRequired: payload.actionRequired,
      data: payload
    };

    // ブラウザ通知の表示
    this.showRealtimeBrowserNotification(notification);

    // リアルタイムリスナーに通知
    this.notifyRealtimeListeners('assistedBookingUpdate', payload);

    // カスタムイベントを発火
    this.dispatchCustomEvent('assistedBookingUpdate', payload);
  }

  // 提案候補準備完了通知の処理
  private handleProposalReadyUpdate(payload: any) {
    const notification = {
      id: `proposal_${payload.requestId}_${Date.now()}`,
      type: 'PROPOSAL_READY',
      requestId: payload.requestId,
      title: '💡 面談候補をご用意しました！',
      message: `${payload.proposalCount || 2}つの面談候補から選択できます`,
      urgency: 'high',
      timestamp: new Date().toISOString(),
      actionRequired: true,
      data: payload
    };

    // ブラウザ通知の表示
    this.showRealtimeBrowserNotification(notification);

    // リアルタイムリスナーに通知
    this.notifyRealtimeListeners('proposalReady', payload);

    // カスタムイベントを発火してInterviewStationに通知
    this.dispatchCustomEvent('proposalReady', payload);
  }

  // リアルタイム通知の処理
  private handleRealtimeNotification(payload: any) {
    // ブラウザ通知の表示
    this.showRealtimeBrowserNotification(payload);

    // リアルタイムリスナーに通知
    this.notifyRealtimeListeners('realtimeNotification', payload);
  }

  // ブラウザ通知の表示（リアルタイム用）
  private showRealtimeBrowserNotification(payload: any) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(payload.title, {
        body: payload.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.id,
        requireInteraction: payload.urgency === 'high',
        silent: payload.urgency === 'low'
      });

      // 通知クリック時の処理
      notification.onclick = () => {
        window.focus();
        if (payload.actionUrl) {
          window.location.href = payload.actionUrl;
        }
        notification.close();
      };

      // 自動消去 (高優先度以外)
      if (payload.urgency !== 'high') {
        setTimeout(() => notification.close(), 5000);
      }
    }
  }

  // おまかせ予約ステータス更新タイトルの取得
  private getAssistedBookingUpdateTitle(status: string): string {
    const titles: Record<string, string> = {
      'pending_review': '📋 面談調整中',
      'proposals_ready': '💡 面談候補準備完了！',
      'awaiting_selection': '⚡ 選択をお待ちしています',
      'confirmed': '✅ 面談予約確定',
      'failed': '❌ 面談調整困難',
      'expired': '⏰ 選択期限切れ'
    };

    return titles[status] || '📢 面談状況更新';
  }

  // カスタムイベントの発火
  private dispatchCustomEvent(eventName: string, data: any) {
    const customEvent = new CustomEvent(eventName, {
      detail: data
    });
    window.dispatchEvent(customEvent);
  }

  // リアルタイムリスナーへの通知
  private notifyRealtimeListeners(eventType: string, data: any) {
    const listeners = this.realtimeListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('リアルタイム通知リスナーエラー:', error);
        }
      });
    }
  }

  // === 公開メソッド（リアルタイム通知用） ===

  // リアルタイムイベントリスナーの登録
  public addRealtimeListener(eventType: string, callback: (data: any) => void) {
    if (!this.realtimeListeners.has(eventType)) {
      this.realtimeListeners.set(eventType, new Set());
    }
    this.realtimeListeners.get(eventType)!.add(callback);
  }

  // リアルタイムイベントリスナーの削除
  public removeRealtimeListener(eventType: string, callback: (data: any) => void) {
    const listeners = this.realtimeListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // WebSocket接続状態の確認
  public isWebSocketConnected(): boolean {
    return this.isConnected && this.websocket?.readyState === WebSocket.OPEN;
  }

  // WebSocket手動接続
  public connectWebSocket() {
    if (!this.isConnected) {
      this.initializeWebSocketConnection();
    }
  }

  // WebSocket手動切断
  public disconnectWebSocket() {
    this.stopWebSocketHeartbeat();
    if (this.websocket) {
      this.websocket.close(1000, 'Manual disconnect');
      this.websocket = null;
    }
    this.isConnected = false;
  }

  // 特定リクエストの通知購読
  public subscribeToAssistedBooking(requestId: string) {
    const message = {
      type: 'subscribe',
      target: 'assisted_booking',
      requestId: requestId
    };
    this.sendWebSocketMessage(message);
  }

  // 特定リクエストの通知購読解除
  public unsubscribeFromAssistedBooking(requestId: string) {
    const message = {
      type: 'unsubscribe',
      target: 'assisted_booking',
      requestId: requestId
    };
    this.sendWebSocketMessage(message);
  }

  // ブラウザ通知許可の要求
  public async requestRealtimeNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('このブラウザはブラウザ通知をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

export default NotificationService;