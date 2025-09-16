// WebSocket通知サービス
import {
  WebSocketConnectionState,
  NotificationMessage,
  ProposalResponse,
  BookingConfirmedResponse,
  RevisedProposalResponse,
  RescheduleApprovalResponse
} from '../types/medicalSystemIntegration';

class WebSocketNotificationService {
  private static instance: WebSocketNotificationService;
  private ws: WebSocket | null = null;
  private connectionState: WebSocketConnectionState;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.connectionState = {
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
    };
  }

  public static getInstance(): WebSocketNotificationService {
    if (!WebSocketNotificationService.instance) {
      WebSocketNotificationService.instance = new WebSocketNotificationService();
    }
    return WebSocketNotificationService.instance;
  }

  // WebSocket接続開始
  public connect(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // WebSocketサーバーURL（環境に応じて変更）
        const wsUrl = process.env.NODE_ENV === 'production'
          ? 'wss://voicedrive-api.hospital.jp/ws'
          : 'ws://localhost:3001/ws';

        this.ws = new WebSocket(`${wsUrl}?userId=${userId}&type=medical_integration`);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.connectionState = {
            ...this.connectionState,
            isConnected: true,
            connectionId: `conn_${Date.now()}`,
            reconnectAttempts: 0
          };

          this.startHeartbeat();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('❌ WebSocket disconnected:', event.code, event.reason);
          this.connectionState.isConnected = false;
          this.stopHeartbeat();

          if (event.code !== 1000) { // 正常クローズ以外
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        // 接続タイムアウト
        setTimeout(() => {
          if (!this.connectionState.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // WebSocket切断
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.connectionState.isConnected = false;
  }

  // メッセージ受信処理
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'heartbeat':
          this.handleHeartbeat(data);
          break;

        case 'proposal_received':
          this.notifyListeners('proposal_received', data);
          break;

        case 'booking_confirmed':
          this.notifyListeners('booking_confirmed', data);
          break;

        case 'reschedule_approved':
        case 'reschedule_rejected':
          this.notifyListeners('reschedule_decision', data);
          break;

        case 'revised_proposal':
          this.notifyListeners('revised_proposal', data);
          break;

        case 'system_notification':
          this.notifyListeners('system_notification', data);
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // ハートビート処理
  private handleHeartbeat(data: any): void {
    this.connectionState.lastHeartbeat = new Date().toISOString();

    // ハートビート応答
    if (this.ws && this.connectionState.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'heartbeat_response',
        timestamp: new Date().toISOString()
      }));
    }
  }

  // ハートビート開始
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.connectionState.isConnected) {
        this.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // 30秒間隔
  }

  // ハートビート停止
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 再接続試行
  private attemptReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.connectionState.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.connectionState.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.connectionState.reconnectAttempts), 30000);

    console.log(`🔄 Attempting reconnection ${this.connectionState.reconnectAttempts}/${this.connectionState.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      // ユーザーIDは実装に応じて取得
      const userId = localStorage.getItem('currentUserId') || 'user-unknown';
      this.connect(userId).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  // イベントリスナー追加
  public addListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // イベントリスナー削除
  public removeListener(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // リスナー通知
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // 接続状態取得
  public getConnectionState(): WebSocketConnectionState {
    return { ...this.connectionState };
  }

  // 接続確認
  public isConnected(): boolean {
    return this.connectionState.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  // 通知送信メソッド群
  public notifyProposalReceived(requestId: string, data: ProposalResponse): void {
    this.notifyListeners('proposal_received', {
      requestId,
      proposals: data.proposals,
      expiresAt: data.expiresAt,
      timestamp: new Date().toISOString()
    });

    // ブラウザ通知
    this.showBrowserNotification(
      'AI最適化完了',
      '面談候補3つの提案が届きました',
      'proposal'
    );
  }

  public notifyBookingConfirmed(requestId: string, data: BookingConfirmedResponse): void {
    this.notifyListeners('booking_confirmed', {
      requestId,
      bookingId: data.bookingId,
      finalReservation: data.finalReservation,
      timestamp: new Date().toISOString()
    });

    // ブラウザ通知
    this.showBrowserNotification(
      '面談予約確定！',
      `${data.finalReservation.scheduledDate} ${data.finalReservation.scheduledTime}から面談が確定しました`,
      'success'
    );
  }

  public notifyRevisedProposal(requestId: string, data: RevisedProposalResponse): void {
    this.notifyListeners('revised_proposal', {
      requestId,
      adjustmentId: data.adjustmentId,
      proposals: data.revisedProposals,
      adjustmentSummary: data.adjustmentSummary,
      timestamp: new Date().toISOString()
    });

    // ブラウザ通知
    this.showBrowserNotification(
      '調整後の新提案',
      'ご要望に合わせて新しい候補を用意しました',
      'proposal'
    );
  }

  public notifyRescheduleDecision(requestId: string, data: RescheduleApprovalResponse): void {
    const isApproved = data.approvalStatus === 'approved';

    this.notifyListeners('reschedule_decision', {
      requestId,
      approved: isApproved,
      newBookingDetails: data.newBookingDetails,
      message: data.message,
      timestamp: new Date().toISOString()
    });

    // ブラウザ通知
    this.showBrowserNotification(
      isApproved ? '日時変更承認' : '日時変更拒否',
      data.message,
      isApproved ? 'success' : 'warning'
    );
  }

  // ブラウザ通知表示
  private showBrowserNotification(title: string, body: string, type: 'proposal' | 'success' | 'warning' = 'proposal'): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔔';

      new Notification(`${icon} ${title}`, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `voicedrive_${type}_${Date.now()}`,
        requireInteraction: type === 'proposal' // 提案通知は操作が必要
      });
    }
  }

  // 通知権限要求
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // デバッグ情報取得
  public getDebugInfo(): Record<string, any> {
    return {
      connectionState: this.connectionState,
      isConnected: this.isConnected(),
      listenerCounts: Object.fromEntries(
        Array.from(this.listeners.entries()).map(([key, value]) => [key, value.length])
      ),
      wsReadyState: this.ws?.readyState,
      hasReconnectTimer: this.reconnectTimer !== null,
      hasHeartbeatTimer: this.heartbeatTimer !== null
    };
  }
}

export default WebSocketNotificationService;