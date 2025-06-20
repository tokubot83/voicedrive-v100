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
  | 'POLL_EXPIRED'
  | 'INTERVIEW_REMINDER_FIRST'      // 新入職員初回面談リマインダー
  | 'INTERVIEW_REMINDER_MONTHLY'    // 新入職員月次面談リマインダー
  | 'INTERVIEW_REMINDER_ANNUAL'     // 一般職員年次面談リマインダー
  | 'INTERVIEW_OVERDUE'             // 面談期限超過通知
  | 'INTERVIEW_AUTO_SCHEDULED';     // 自動スケジュール面談通知

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
      'EMERGENCY_ACTION', 'PROJECT_UPDATE', 'DEADLINE_REMINDER', 'ESCALATION',
      'INTERVIEW_REMINDER_FIRST', 'INTERVIEW_REMINDER_MONTHLY', 
      'INTERVIEW_REMINDER_ANNUAL', 'INTERVIEW_OVERDUE', 'INTERVIEW_AUTO_SCHEDULED'
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
    if (type === 'INTERVIEW_OVERDUE') return 'URGENT';
    
    if (type === 'INTERVIEW_REMINDER_FIRST') return 'HIGH';
    if (type === 'INTERVIEW_AUTO_SCHEDULED') return 'HIGH';
    
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
}

export default NotificationService;