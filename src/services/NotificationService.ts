// 医療システム統合通知サービス - VoiceDrive Phase 4 実装
import { NotificationMessage } from '../types/medicalSystemIntegration';

export type NotificationChannel = 'browser' | 'websocket' | 'sound' | 'email' | 'storage';
export type NotificationUrgency = 'normal' | 'high' | 'urgent';
export type NotificationType =
  | 'proposal_received'             // AI提案受信通知
  | 'booking_confirmed'             // 本予約確定通知
  | 'revised_proposal'              // 再提案受信通知
  | 'reschedule_approved'           // 日時変更承認通知
  | 'reschedule_rejected'           // 日時変更拒否通知
  | 'cancellation_confirmed'        // キャンセル受付完了通知
  | 'selection_deadline_warning'    // 選択期限警告通知
  | 'processing_timeout'            // AI処理タイムアウト通知
  | 'system_notification'           // システムメッセージ通知
  | 'connection_status';

export interface MedicalNotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  urgency: NotificationUrgency;
  channels: NotificationChannel[];
  timestamp: string;
  data?: any;
  actionRequired?: boolean;
  expiresAt?: string;
}

export interface NotificationState {
  id: string;
  config: MedicalNotificationConfig;
  status: 'pending' | 'sent' | 'acknowledged' | 'expired';
  createdAt: Date;
  acknowledgedAt?: Date;
  retryCount: number;
}

export interface NotificationPreferences {
  enableBrowserNotifications: boolean;
  enableSoundAlerts: boolean;
  enableEmailNotifications: boolean;
  soundVolume: number;
  emailAddress?: string;
  muteDuringHours?: {
    start: string;
    end: string;
  };
}

export interface ActionableNotification {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  urgency: NotificationUrgency;
  timestamp: string;
  createdAt: Date;
  isRead: boolean;
  isActioned?: boolean;
  actionRequired: boolean;
  dueDate?: Date;
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: string;
  }>;
  metadata?: {
    projectId?: string;
  };
  data?: any;
}

export interface NotificationStats {
  pending: number;
  unread: number;
  total: number;
  overdue: number;
  byType: Record<string, number>;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, NotificationState> = new Map();
  private listeners: Set<(notification: NotificationState) => void> = new Set();
  private realtimeListeners: Map<string, Set<Function>> = new Map();
  private preferences: NotificationPreferences;
  private soundContext: AudioContext | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.preferences = this.loadPreferences();
    this.initializeAudioContext();
    this.initializeBrowserNotifications();
    this.isInitialized = true;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 医療システム通知メッセージの送信
  public async sendNotification(config: MedicalNotificationConfig): Promise<string> {
    const notificationId = this.generateNotificationId();

    const notificationState: NotificationState = {
      id: notificationId,
      config,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0
    };

    this.notifications.set(notificationId, notificationState);

    try {
      // 選択されたチャンネルで通知送信
      await Promise.all(
        config.channels.map(channel => this.sendToChannel(channel, config))
      );

      notificationState.status = 'sent';
      this.notifyListeners(notificationState);

      // ローカルストレージに保存（storageチャンネルが含まれる場合のみ）
      if (config.channels.includes('storage')) {
        this.saveToStorage(notificationState);
      }

      console.log(`✅ 医療システム通知送信完了: ${config.type} - ${notificationId}`);
      return notificationId;

    } catch (error) {
      console.error('❌ 医療システム通知送信エラー:', error);
      notificationState.status = 'pending';
      notificationState.retryCount++;

      // 再送機能
      if (notificationState.retryCount < 3) {
        setTimeout(() => this.retryNotification(notificationId), 5000);
      }

      throw error;
    }
  }

  // 医療システムからの通知メッセージを受信処理
  public async receiveNotification(message: NotificationMessage): Promise<void> {
    const config: MedicalNotificationConfig = {
      type: message.type as NotificationType,
      title: this.generateTitle(message.type, message.data),
      message: message.message,
      urgency: this.determineUrgency(message.type, message.priority),
      channels: this.selectChannels(message.type, message.priority),
      timestamp: message.timestamp,
      data: message.data,
      actionRequired: message.actionRequired,
      expiresAt: message.expiresAt
    };

    await this.sendNotification(config);
  }

  // 通知チャンネル別送信
  private async sendToChannel(channel: NotificationChannel, config: MedicalNotificationConfig): Promise<void> {
    switch (channel) {
      case 'browser':
        await this.sendBrowserNotification(config);
        break;
      case 'sound':
        await this.playSoundAlert(config);
        break;
      case 'email':
        await this.sendEmailNotification(config);
        break;
      case 'storage':
        // storageチャンネルの処理はsendNotificationメソッド内で既に実施されているためスキップ
        break;
      case 'websocket':
        // WebSocketNotificationService連携は別途実装済み
        break;
    }
  }

  // ブラウザ通知
  private async sendBrowserNotification(config: MedicalNotificationConfig): Promise<void> {
    if (!this.preferences.enableBrowserNotifications) return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const icon = this.getNotificationIcon(config.type);
      const notification = new Notification(`${icon} ${config.title}`, {
        body: config.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `medical_${config.type}_${Date.now()}`,
        requireInteraction: config.urgency === 'urgent' || config.actionRequired,
        silent: false
      });

      // 通知クリック時の処理
      notification.onclick = () => {
        this.handleNotificationClick(config);
        notification.close();
      };

      // 自動消去（緊急度に応じて）
      if (config.urgency !== 'urgent') {
        setTimeout(() => notification.close(), this.getNotificationDuration(config.urgency));
      }
    }
  }

  // 音響アラート
  private async playSoundAlert(config: MedicalNotificationConfig): Promise<void> {
    if (!this.preferences.enableSoundAlerts || !this.soundContext) return;

    try {
      const frequency = this.getSoundFrequency(config.urgency);
      const duration = this.getSoundDuration(config.urgency);

      // 音を再生する回数を決定（urgentは3回、それ以外は1回）
      const playCount = config.urgency === 'urgent' ? 3 : 1;

      // 音を指定回数再生（通知自体は再送信しない）
      for (let i = 0; i < playCount; i++) {
        if (i > 0) {
          // 2回目以降は1秒待機
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const oscillator = this.soundContext.createOscillator();
        const gainNode = this.soundContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.soundContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.soundContext.currentTime);
        gainNode.gain.setValueAtTime(this.preferences.soundVolume * 0.1, this.soundContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.soundContext.currentTime + duration);

        oscillator.start(this.soundContext.currentTime);
        oscillator.stop(this.soundContext.currentTime + duration);
      }

    } catch (error) {
      console.error('音響アラート再生エラー:', error);
    }
  }

  // メール通知
  private async sendEmailNotification(config: MedicalNotificationConfig): Promise<void> {
    if (!this.preferences.enableEmailNotifications || !this.preferences.emailAddress) return;

    try {
      // 実際の実装では医療システムのメールAPIを使用
      const emailData = {
        to: this.preferences.emailAddress,
        subject: `【VoiceDrive】${config.title}`,
        body: this.generateEmailBody(config),
        priority: config.urgency === 'urgent' ? 'high' : 'normal'
      };

      console.log('📧 メール通知（実装予定）:', emailData);

      // TODO: 医療システムメールAPI連携
      // await medicalSystemAPI.sendEmail(emailData);

    } catch (error) {
      console.error('メール通知送信エラー:', error);
    }
  }

  // 通知リスナー管理
  public addListener(callback: (notification: NotificationState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(notification: NotificationState): void {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('通知リスナーエラー:', error);
      }
    });
  }

  // 通知確認
  public acknowledgeNotification(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.status === 'sent') {
      notification.status = 'acknowledged';
      notification.acknowledgedAt = new Date();
      this.saveToStorage(notification);
      this.notifyListeners(notification);
    }
  }

  // 設定管理
  public updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // 通知履歴取得
  public getNotificationHistory(limit: number = 50): NotificationState[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // 未確認通知数
  public getUnacknowledgedCount(): number {
    return Array.from(this.notifications.values())
      .filter(n => n.status === 'sent').length;
  }

  // ブラウザ通知許可要求
  public async requestNotificationPermission(): Promise<boolean> {
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

  // リアルタイム通知許可要求（面談ステーション用）
  public async requestRealtimeNotificationPermission(): Promise<boolean> {
    console.log('リアルタイム通知許可を要求中...');

    // ブラウザ通知許可を要求
    const browserPermission = await this.requestNotificationPermission();

    if (browserPermission) {
      // 音響アラートを有効化
      this.updatePreferences({
        enableBrowserNotifications: true,
        enableSoundAlerts: true
      });

      console.log('✅ リアルタイム通知が有効化されました');
      return true;
    }

    console.warn('⚠️ リアルタイム通知許可が拒否されました');
    return false;
  }

  // === プライベートメソッド ===

  private initializeAudioContext(): void {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.soundContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('音響アラート初期化失敗:', error);
    }
  }

  private async initializeBrowserNotifications(): Promise<void> {
    if (this.preferences.enableBrowserNotifications) {
      await this.requestNotificationPermission();
    }
  }

  private generateNotificationId(): string {
    return `medical_notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTitle(type: string, data: any): string {
    const titleMap: Record<string, string> = {
      'proposal_received': '🤖 AI最適化完了',
      'booking_confirmed': '✅ 面談予約確定',
      'revised_proposal': '🔄 調整後の新提案',
      'reschedule_approved': '✅ 日時変更承認',
      'reschedule_rejected': '❌ 日時変更拒否',
      'cancellation_confirmed': '📋 キャンセル受付完了',
      'selection_deadline_warning': '⚠️ 選択期限警告',
      'processing_timeout': '⏰ AI処理タイムアウト',
      'system_notification': '📢 システム通知',
      'connection_status': '🔗 接続状況'
    };

    return titleMap[type] || '📨 医療システム通知';
  }

  private determineUrgency(type: string, priority?: string): NotificationUrgency {
    if (priority === 'high' || type === 'processing_timeout' || type === 'selection_deadline_warning') {
      return 'urgent';
    }
    if (priority === 'medium' || type === 'proposal_received' || type === 'reschedule_approved') {
      return 'high';
    }
    return 'normal';
  }

  private selectChannels(type: string, priority?: string): NotificationChannel[] {
    const urgency = this.determineUrgency(type, priority);

    const channelConfig: Record<NotificationUrgency, NotificationChannel[]> = {
      'urgent': ['browser', 'sound', 'storage'],
      'high': ['browser', 'storage'],
      'normal': ['browser', 'storage']
    };

    let channels = channelConfig[urgency];

    // メール通知が有効で緊急度が高い場合
    if (this.preferences.enableEmailNotifications && urgency !== 'normal') {
      channels = [...channels, 'email'];
    }

    return channels;
  }

  private getNotificationIcon(type: NotificationType): string {
    const iconMap: Record<NotificationType, string> = {
      'proposal_received': '🤖',
      'booking_confirmed': '✅',
      'revised_proposal': '🔄',
      'reschedule_approved': '✅',
      'reschedule_rejected': '❌',
      'cancellation_confirmed': '📋',
      'selection_deadline_warning': '⚠️',
      'processing_timeout': '⏰',
      'system_notification': '📢',
      'connection_status': '🔗'
    };

    return iconMap[type] || '📨';
  }

  private getNotificationDuration(urgency: NotificationUrgency): number {
    const durationMap: Record<NotificationUrgency, number> = {
      'normal': 3000,
      'high': 5000,
      'urgent': 10000
    };
    return durationMap[urgency];
  }

  private getSoundFrequency(urgency: NotificationUrgency): number {
    const frequencyMap: Record<NotificationUrgency, number> = {
      'normal': 600,
      'high': 800,
      'urgent': 1000
    };
    return frequencyMap[urgency];
  }

  private getSoundDuration(urgency: NotificationUrgency): number {
    const durationMap: Record<NotificationUrgency, number> = {
      'normal': 0.3,
      'high': 0.5,
      'urgent': 0.8
    };
    return durationMap[urgency];
  }

  private generateEmailBody(config: MedicalNotificationConfig): string {
    return `
${config.title}

${config.message}

---
送信日時: ${config.timestamp}
緊急度: ${config.urgency}
${config.actionRequired ? '※ アクションが必要です' : ''}

VoiceDrive 医療システム統合
    `.trim();
  }

  private handleNotificationClick(config: MedicalNotificationConfig): void {
    // 通知クリック時の処理
    window.focus();

    // タイプ別の処理
    switch (config.type) {
      case 'proposal_received':
      case 'revised_proposal':
        // AI提案画面に遷移
        if (config.data?.requestId) {
          window.location.href = `/interview/proposals/${config.data.requestId}`;
        }
        break;
      case 'booking_confirmed':
      case 'reschedule_approved':
        // 予約詳細画面に遷移
        if (config.data?.bookingId) {
          window.location.href = `/interview/booking/${config.data.bookingId}`;
        }
        break;
      default:
        // 面談ステーション画面に遷移
        window.location.href = '/interview';
    }
  }

  private async retryNotification(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.retryCount >= 3) return;

    try {
      await this.sendNotification(notification.config);
    } catch (error) {
      console.error('通知再送エラー:', error);
    }
  }

  private saveToStorage(notification: NotificationState): void {
    try {
      // モバイルブラウザ対応: localStorageが利用可能か確認
      if (typeof localStorage === 'undefined') {
        console.warn('LocalStorage is not available');
        return;
      }

      const storageKey = `medical_notifications`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = [notification, ...existing.slice(0, 99)]; // 最大100件保持
      localStorage.setItem(storageKey, JSON.stringify(updated));

      // メモリにも保存（モバイル対応）
      if (!this.notifications.has(notification.id)) {
        this.notifications.set(notification.id, notification);
      }
    } catch (error) {
      console.error('通知履歴保存エラー:', error);
      // localStorageが使えない場合でもメモリに保存
      this.notifications.set(notification.id, notification);
    }
  }

  private loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem('notification_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error);
    }

    // デフォルト設定
    return {
      enableBrowserNotifications: true,
      enableSoundAlerts: true,
      enableEmailNotifications: false,
      soundVolume: 0.5
    };
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('設定保存エラー:', error);
    }
  }

  // デバッグ情報取得
  public getDebugInfo(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      notificationCount: this.notifications.size,
      listenerCount: this.listeners.size,
      preferences: this.preferences,
      browserNotificationPermission: typeof window !== 'undefined' ? Notification?.permission : 'unavailable',
      audioContextState: this.soundContext?.state || 'unavailable'
    };
  }

  // 新しく追加するメソッド群
  public getUserNotificationStats(userId: string): NotificationStats {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.config.data?.userId === userId);

    const pending = userNotifications.filter(n => n.status === 'sent').length;
    const unread = userNotifications.filter(n => n.status === 'sent').length;
    const total = userNotifications.length;

    // 期限切れ通知の計算（簡易実装）
    const overdue = userNotifications.filter(n =>
      n.config.expiresAt && new Date(n.config.expiresAt) < new Date()
    ).length;

    // タイプ別の集計
    const byType: Record<string, number> = {};
    userNotifications.forEach(n => {
      const type = n.config.type;
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      pending,
      unread,
      total,
      overdue,
      byType
    };
  }

  public subscribeToNotifications(callback: (userId: string) => void): () => void {
    const listener = (notification: NotificationState) => {
      if (notification.config.data?.userId) {
        callback(notification.config.data.userId);
      }
    };

    return this.addListener(listener);
  }

  public getActionableNotifications(userId: string, filter: 'all' | 'unread' | 'pending' = 'all'): any[] {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.config.data?.userId === userId);

    switch (filter) {
      case 'unread':
        return userNotifications.filter(n => n.status === 'sent');
      case 'pending':
        return userNotifications.filter(n => n.status === 'sent' && n.config.actionRequired);
      default:
        return userNotifications;
    }
  }

  public loadNotifications(userId: string, filter: 'all' | 'unread' | 'pending' = 'all'): any[] {
    return this.getActionableNotifications(userId, filter);
  }

  public markAsRead(notificationId: string): void {
    this.acknowledgeNotification(notificationId);
  }

  public handleNotificationAction(notificationId: string, action: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.config.data = { ...notification.config.data, action };
      this.acknowledgeNotification(notificationId);
    }
  }

  // リアルタイムリスナー管理
  public addRealtimeListener(eventType: string, callback: Function): void {
    if (!this.realtimeListeners.has(eventType)) {
      this.realtimeListeners.set(eventType, new Set());
    }
    this.realtimeListeners.get(eventType)!.add(callback);
    console.log(`✅ リアルタイムリスナー追加: ${eventType}`);
  }

  public removeRealtimeListener(eventType: string, callback: Function): void {
    const listeners = this.realtimeListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.realtimeListeners.delete(eventType);
      }
      console.log(`🗑️ リアルタイムリスナー削除: ${eventType}`);
    }
  }

  public triggerRealtimeEvent(eventType: string, data: any): void {
    const listeners = this.realtimeListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`リアルタイムイベント処理エラー (${eventType}):`, error);
        }
      });
      console.log(`📡 リアルタイムイベント発火: ${eventType}`, data);
    }
  }

  public getUserNotifications(userId: string, filterOptions?: { unreadOnly?: boolean; pendingOnly?: boolean }): ActionableNotification[] {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.config.data?.userId === userId);

    let filtered = userNotifications;

    if (filterOptions?.unreadOnly) {
      filtered = filtered.filter(n => n.status === 'sent');
    }

    if (filterOptions?.pendingOnly) {
      filtered = filtered.filter(n => n.status === 'sent' && n.config.actionRequired);
    }

    return filtered.map(n => ({
      id: n.id,
      type: n.config.type,
      title: n.config.title,
      message: n.config.message,
      urgency: n.config.urgency,
      timestamp: n.config.timestamp,
      createdAt: n.createdAt,
      isRead: n.status === 'acknowledged',
      isActioned: false,
      actionRequired: n.config.actionRequired || false,
      dueDate: n.config.expiresAt ? new Date(n.config.expiresAt) : undefined,
      actions: undefined,
      metadata: undefined,
      data: n.config.data
    }));
  }

  // 通知送信メソッド
  public send(config: MedicalNotificationConfig): void {
    const notificationId = this.generateNotificationId();
    const notification: NotificationState = {
      id: notificationId,
      config,
      status: 'sent', // 即座にsent状態にする（モバイル対応）
      createdAt: new Date(),
      retryCount: 0
    };

    // 即座にメモリに保存（モバイル対応）
    this.notifications.set(notificationId, notification);

    // リスナーに通知
    this.notifyListeners(notification);

    // ストレージへの保存はsendNotificationメソッド内で処理される

    // 非同期で通知送信（エラーがあってもUIには影響しない）
    this.sendNotification(config).catch(error => {
      console.error('通知送信エラー:', error);
    });

    console.log(`✅ 通知作成完了: ${config.type} - ${notificationId}`);
  }

  // デモ用: 医療チームからの提案通知を生成
  public sendDemoProposalNotification(): void {
    const config: MedicalNotificationConfig = {
      type: 'proposal_received',
      title: '面談日程の提案が届きました',
      message: '医療チームのAI分析により、あなたのご希望に最適な面談日程を3つ提案させていただきました。選択期限は48時間です。',
      urgency: 'high',
      channels: ['browser', 'sound', 'storage'], // soundチャンネルを復活（1回だけ鳴らす）
      timestamp: new Date().toISOString(),
      actionRequired: true,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      data: {
        userId: 'demo-user',
        bookingId: 'demo-booking-001',
        proposalCount: 3,
        recommendedProposalId: 'p1',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        action: 'view_proposals'
      }
    };

    this.send(config);
  }

  // デモ用: 再調整完了通知を生成
  public sendDemoRescheduleNotification(): void {
    const config: MedicalNotificationConfig = {
      type: 'revised_proposal',
      title: '再調整後の新しい提案が届きました',
      message: 'ご要望を考慮して、新しい面談日程を3つ提案させていただきました。今回は夕方の時間帯を中心に調整しました。',
      urgency: 'high',
      channels: ['browser', 'sound', 'storage'], // soundチャンネルを復活（1回だけ鳴らす）
      timestamp: new Date().toISOString(),
      actionRequired: true,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      data: {
        userId: 'demo-user',
        bookingId: 'demo-booking-002',
        proposalCount: 3,
        previousRequestReason: 'time_preference',
        adjustmentNote: '夕方の時間帯を中心に再調整しました',
        action: 'view_proposals'
      }
    };

    this.send(config);
  }

  // デモ用: 選択期限警告通知を生成
  public sendDemoDeadlineWarning(): void {
    const config: MedicalNotificationConfig = {
      type: 'selection_deadline_warning',
      title: '⚠️ 面談日程の選択期限が近づいています',
      message: '提案された面談日程の選択期限まであと12時間です。期限を過ぎると自動的にキャンセルとなりますのでご注意ください。',
      urgency: 'urgent',
      channels: ['browser', 'sound', 'storage', 'email'], // soundチャンネルを復活（urgentは3回鳴らす）
      timestamp: new Date().toISOString(),
      actionRequired: true,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      data: {
        userId: 'demo-user',
        bookingId: 'demo-booking-001',
        remainingHours: 12,
        proposalCount: 3,
        action: 'view_proposals'
      }
    };

    this.send(config);
  }
}

export default NotificationService;