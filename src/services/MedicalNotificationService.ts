// 医療システム連携通知サービス - VoiceDrive Phase 4 統合実装
import NotificationService from './NotificationService';
import WebSocketNotificationService from './WebSocketNotificationService';
import TokenRefreshService from './TokenRefreshService';
import { NotificationMessage } from '../types/medicalSystemIntegration';

interface MedicalIntegrationConfig {
  enableRealtimeNotifications: boolean;
  enableOfflineMode: boolean;
  retryAttempts: number;
  connectionTimeout: number;
  heartbeatInterval: number;
}

class MedicalNotificationService {
  private static instance: MedicalNotificationService;
  private notificationService: NotificationService;
  private websocketService: WebSocketNotificationService;
  private tokenService: TokenRefreshService;
  private config: MedicalIntegrationConfig;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private messageQueue: NotificationMessage[] = [];
  private statusCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.websocketService = WebSocketNotificationService.getInstance();
    this.tokenService = TokenRefreshService.getInstance();

    this.config = {
      enableRealtimeNotifications: true,
      enableOfflineMode: true,
      retryAttempts: 3,
      connectionTimeout: 10000,
      heartbeatInterval: 30000
    };

    this.initialize();
  }

  public static getInstance(): MedicalNotificationService {
    if (!MedicalNotificationService.instance) {
      MedicalNotificationService.instance = new MedicalNotificationService();
    }
    return MedicalNotificationService.instance;
  }

  // サービス初期化
  private async initialize(): Promise<void> {
    try {
      // WebSocket接続設定
      await this.setupWebSocketConnection();

      // 通知権限の要求
      await this.requestNotificationPermissions();

      // イベントリスナー設定
      this.setupEventListeners();

      // ステータスチェック開始
      this.startStatusMonitoring();

      console.log('✅ 医療システム通知サービス初期化完了');

    } catch (error) {
      console.error('❌ 医療システム通知サービス初期化エラー:', error);
    }
  }

  // WebSocket接続設定
  private async setupWebSocketConnection(): Promise<void> {
    if (!this.config.enableRealtimeNotifications) return;

    try {
      // ユーザーIDの取得
      const userId = localStorage.getItem('currentUserId') || 'user-medical-system';

      // WebSocket接続
      const connected = await this.websocketService.connect(userId);

      if (connected) {
        this.connectionStatus = 'connected';
        console.log('🔗 医療システムWebSocket接続成功');

        // キューに蓄積されたメッセージを処理
        await this.processMessageQueue();
      }

    } catch (error) {
      console.error('❌ WebSocket接続エラー:', error);
      this.connectionStatus = 'disconnected';

      // オフラインモード有効時はキューに保存
      if (this.config.enableOfflineMode) {
        console.log('📱 オフラインモードで動作継続');
      }
    }
  }

  // 通知権限の要求
  private async requestNotificationPermissions(): Promise<void> {
    const granted = await this.notificationService.requestNotificationPermission();
    if (granted) {
      console.log('✅ ブラウザ通知権限取得成功');
    } else {
      console.warn('⚠️ ブラウザ通知権限が拒否されました');
    }
  }

  // イベントリスナー設定
  private setupEventListeners(): void {
    // WebSocket通知イベント
    this.websocketService.addListener('proposal_received', (data) => {
      this.handleProposalReceived(data);
    });

    this.websocketService.addListener('booking_confirmed', (data) => {
      this.handleBookingConfirmed(data);
    });

    this.websocketService.addListener('reschedule_decision', (data) => {
      this.handleRescheduleDecision(data);
    });

    this.websocketService.addListener('revised_proposal', (data) => {
      this.handleRevisedProposal(data);
    });

    this.websocketService.addListener('system_notification', (data) => {
      this.handleSystemNotification(data);
    });

    // Token更新イベント
    this.tokenService.addTokenUpdateListener((newToken) => {
      console.log('🔄 認証トークン更新完了');
    });

    // ブラウザ認証エラーイベント
    window.addEventListener('tokenAuthError', (event: any) => {
      this.handleAuthError(event.detail);
    });
  }

  // ステータス監視開始
  private startStatusMonitoring(): void {
    this.statusCheckInterval = setInterval(() => {
      this.checkConnectionStatus();
    }, this.config.heartbeatInterval);
  }

  // 接続状況チェック
  private checkConnectionStatus(): void {
    const wsConnected = this.websocketService.isConnected();
    const tokenValid = this.tokenService.isTokenValid();

    if (!wsConnected && this.connectionStatus === 'connected') {
      this.connectionStatus = 'disconnected';
      this.notifyConnectionStatus('disconnected');
    } else if (wsConnected && this.connectionStatus === 'disconnected') {
      this.connectionStatus = 'connected';
      this.notifyConnectionStatus('connected');
    }

    if (!tokenValid) {
      this.handleTokenExpiration();
    }
  }

  // === 医療システム通知ハンドラー ===

  // AI提案受信通知
  private async handleProposalReceived(data: any): Promise<void> {
    await this.notificationService.sendNotification({
      type: 'proposal_received',
      title: '🤖 AI最適化完了',
      message: `面談候補${data.proposals?.length || 3}つの提案が届きました`,
      urgency: 'high',
      channels: ['browser', 'sound', 'storage'],
      timestamp: data.timestamp || new Date().toISOString(),
      actionRequired: true,
      data: {
        requestId: data.requestId,
        proposalCount: data.proposals?.length,
        expiresAt: data.expiresAt
      }
    });

    // カスタムイベント発火（UI更新用）
    this.dispatchCustomEvent('proposalReceived', data);
  }

  // 予約確定通知
  private async handleBookingConfirmed(data: any): Promise<void> {
    const reservationInfo = data.finalReservation || {};

    await this.notificationService.sendNotification({
      type: 'booking_confirmed',
      title: '✅ 面談予約確定！',
      message: `${reservationInfo.scheduledDate} ${reservationInfo.scheduledTime}から面談が確定しました`,
      urgency: 'high',
      channels: ['browser', 'sound', 'storage'],
      timestamp: data.timestamp || new Date().toISOString(),
      actionRequired: false,
      data: {
        bookingId: data.bookingId,
        finalReservation: reservationInfo
      }
    });

    this.dispatchCustomEvent('bookingConfirmed', data);
  }

  // 日時変更承認・拒否通知
  private async handleRescheduleDecision(data: any): Promise<void> {
    const isApproved = data.approved;

    await this.notificationService.sendNotification({
      type: isApproved ? 'reschedule_approved' : 'reschedule_rejected',
      title: isApproved ? '✅ 日時変更承認' : '❌ 日時変更拒否',
      message: data.message || (isApproved ? '日時変更が承認されました' : '日時変更が拒否されました'),
      urgency: 'high',
      channels: ['browser', 'storage'],
      timestamp: data.timestamp || new Date().toISOString(),
      actionRequired: !isApproved,
      data: {
        requestId: data.requestId,
        approved: isApproved,
        newBookingDetails: data.newBookingDetails,
        message: data.message
      }
    });

    this.dispatchCustomEvent('rescheduleDecision', data);
  }

  // 再提案受信通知
  private async handleRevisedProposal(data: any): Promise<void> {
    await this.notificationService.sendNotification({
      type: 'revised_proposal',
      title: '🔄 調整後の新提案',
      message: 'ご要望に合わせて新しい候補を用意しました',
      urgency: 'high',
      channels: ['browser', 'sound', 'storage'],
      timestamp: data.timestamp || new Date().toISOString(),
      actionRequired: true,
      data: {
        requestId: data.requestId,
        adjustmentId: data.adjustmentId,
        proposals: data.proposals,
        adjustmentSummary: data.adjustmentSummary
      }
    });

    this.dispatchCustomEvent('revisedProposal', data);
  }

  // システム通知
  private async handleSystemNotification(data: any): Promise<void> {
    await this.notificationService.sendNotification({
      type: 'system_notification',
      title: '📢 システム通知',
      message: data.message || 'システムからのお知らせです',
      urgency: data.urgency || 'normal',
      channels: ['browser', 'storage'],
      timestamp: data.timestamp || new Date().toISOString(),
      actionRequired: data.actionRequired || false,
      data
    });

    this.dispatchCustomEvent('systemNotification', data);
  }

  // === エラーハンドリング ===

  // 認証エラー処理
  private async handleAuthError(error: any): Promise<void> {
    await this.notificationService.sendNotification({
      type: 'system_notification',
      title: '🔐 認証エラー',
      message: '認証に失敗しました。再度ログインしてください。',
      urgency: 'urgent',
      channels: ['browser', 'sound'],
      timestamp: new Date().toISOString(),
      actionRequired: true,
      data: { error }
    });

    // WebSocket切断
    this.websocketService.disconnect();
    this.connectionStatus = 'disconnected';
  }

  // Token期限切れ処理
  private async handleTokenExpiration(): Promise<void> {
    console.warn('⚠️ 認証トークンの期限が切れています');

    // Token更新試行
    const refreshed = await this.tokenService.refreshToken();
    if (!refreshed) {
      this.handleAuthError({ message: 'Token更新失敗' });
    }
  }

  // 接続状況通知
  private async notifyConnectionStatus(status: 'connected' | 'disconnected'): Promise<void> {
    const isConnected = status === 'connected';

    await this.notificationService.sendNotification({
      type: 'connection_status',
      title: isConnected ? '🔗 接続復旧' : '⚠️ 接続切断',
      message: isConnected ? '医療システムとの接続が復旧しました' : '医療システムとの接続が切断されました',
      urgency: isConnected ? 'normal' : 'high',
      channels: ['browser', 'storage'],
      timestamp: new Date().toISOString(),
      actionRequired: false,
      data: { status }
    });
  }

  // === 公開メソッド ===

  // 医療システムへの通知送信
  public async sendToMedicalSystem(message: NotificationMessage): Promise<void> {
    if (this.connectionStatus === 'connected') {
      // リアルタイム送信
      // 実装では医療システムAPIを使用
      console.log('📡 医療システムへ通知送信:', message);
    } else {
      // オフライン時はキューに保存
      this.messageQueue.push(message);
      console.log('📱 オフライン: メッセージをキューに追加');
    }
  }

  // キューメッセージ処理
  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) return;

    console.log(`📤 キューメッセージ処理開始: ${this.messageQueue.length}件`);

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      try {
        await this.sendToMedicalSystem(message);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms間隔
      } catch (error) {
        console.error('キューメッセージ送信エラー:', error);
        // 失敗したメッセージは再度キューに追加
        this.messageQueue.push(message);
      }
    }
  }

  // 設定更新
  public updateConfig(newConfig: Partial<MedicalIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.enableRealtimeNotifications !== undefined) {
      if (newConfig.enableRealtimeNotifications && this.connectionStatus === 'disconnected') {
        this.setupWebSocketConnection();
      } else if (!newConfig.enableRealtimeNotifications && this.connectionStatus === 'connected') {
        this.websocketService.disconnect();
        this.connectionStatus = 'disconnected';
      }
    }
  }

  // 接続状況取得
  public getConnectionStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    return this.connectionStatus;
  }

  // 統計情報取得
  public getStatistics(): Record<string, any> {
    return {
      connectionStatus: this.connectionStatus,
      queuedMessages: this.messageQueue.length,
      websocketConnected: this.websocketService.isConnected(),
      tokenValid: this.tokenService.isTokenValid(),
      tokenTimeUntilRefresh: this.tokenService.getTimeUntilRefresh(),
      notificationStats: this.notificationService.getUnacknowledgedCount(),
      config: this.config
    };
  }

  // WebSocketデバッグ情報
  public getWebSocketDebugInfo(): Record<string, any> {
    return this.websocketService.getDebugInfo();
  }

  // 手動再接続
  public async reconnect(): Promise<void> {
    this.connectionStatus = 'reconnecting';
    console.log('🔄 医療システム手動再接続開始...');

    try {
      this.websocketService.disconnect();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.setupWebSocketConnection();
    } catch (error) {
      console.error('❌ 手動再接続エラー:', error);
      this.connectionStatus = 'disconnected';
    }
  }

  // サービス停止
  public destroy(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }

    this.websocketService.disconnect();
    this.connectionStatus = 'disconnected';

    console.log('🛑 医療システム通知サービス停止');
  }

  // === ユーティリティメソッド ===

  // カスタムイベント発火
  private dispatchCustomEvent(eventName: string, data: any): void {
    const customEvent = new CustomEvent(`medical:${eventName}`, {
      detail: data
    });
    window.dispatchEvent(customEvent);
  }

  // 期限警告チェック
  public checkDeadlineWarnings(): void {
    // 実装では期限が近い面談選択などをチェック
    // 医療システムからの情報に基づいて警告通知を送信
    console.log('⏰ 期限警告チェック実行');
  }

  // デモモード：テスト通知送信
  public async sendTestNotification(type: 'proposal' | 'booking' | 'reschedule' = 'proposal'): Promise<void> {
    const testData = {
      'proposal': {
        requestId: 'test-req-001',
        proposals: [1, 2, 3],
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString()
      },
      'booking': {
        bookingId: 'test-book-001',
        finalReservation: {
          scheduledDate: '2025-01-20',
          scheduledTime: '14:00',
          interviewerName: '田中 面談担当者'
        },
        timestamp: new Date().toISOString()
      },
      'reschedule': {
        requestId: 'test-req-001',
        approved: true,
        message: 'テスト用日時変更承認通知',
        timestamp: new Date().toISOString()
      }
    };

    const data = testData[type];

    switch (type) {
      case 'proposal':
        await this.handleProposalReceived(data);
        break;
      case 'booking':
        await this.handleBookingConfirmed(data);
        break;
      case 'reschedule':
        await this.handleRescheduleDecision(data);
        break;
    }

    console.log(`✅ テスト通知送信完了: ${type}`);
  }
}

export default MedicalNotificationService;