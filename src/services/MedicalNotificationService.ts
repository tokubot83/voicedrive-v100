import {
  InterviewConfirmationNotification,
  InterviewConfirmationData,
  InterviewChangeNotification,
  InterviewCancellationRequest,
  NotificationStatus
} from '../types/medicalNotification';

class MedicalNotificationService {
  private static instance: MedicalNotificationService;
  private notifications: InterviewConfirmationNotification[] = [];
  private changeNotifications: InterviewChangeNotification[] = [];
  private listeners: Array<(notifications: InterviewConfirmationNotification[]) => void> = [];

  private constructor() {
    this.initializeWebSocket();
    this.loadStoredNotifications();
  }

  public static getInstance(): MedicalNotificationService {
    if (!MedicalNotificationService.instance) {
      MedicalNotificationService.instance = new MedicalNotificationService();
    }
    return MedicalNotificationService.instance;
  }

  // WebSocket接続の初期化（医療システムからの通知受信用）
  private initializeWebSocket() {
    // 実際の実装では医療システムのWebSocketエンドポイントに接続
    // ここではデモ用の設定
    console.log('Medical notification WebSocket initialized');

    // デモ用: 5秒後にサンプル通知を生成
    setTimeout(() => {
      this.simulateIncomingNotification();
    }, 5000);
  }

  // ローカルストレージから通知データを読み込み
  private loadStoredNotifications() {
    try {
      const stored = localStorage.getItem('medicalNotifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load stored notifications:', error);
    }
  }

  // ローカルストレージに通知データを保存
  private saveNotifications() {
    try {
      localStorage.setItem('medicalNotifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // 新しい面談確定通知を受信
  public receiveInterviewConfirmation(data: InterviewConfirmationData): void {
    const notification: InterviewConfirmationNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      status: {
        notificationStatus: 'delivered',
        userAction: 'none',
        reminder1Sent: false,
        reminder2Sent: false,
        attendanceConfirmed: false,
        lastUpdated: new Date().toISOString()
      },
      receivedAt: new Date().toISOString(),
      priority: this.determinePriority(data.urgency)
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.notifyListeners();

    // プッシュ通知を表示
    this.showPushNotification(notification);
  }

  // 緊急度に基づく優先度の決定
  private determinePriority(urgency: string): 'low' | 'normal' | 'high' | 'urgent' {
    switch (urgency) {
      case 'urgent': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'normal';
      case 'low': return 'low';
      default: return 'normal';
    }
  }

  // プッシュ通知の表示
  private showPushNotification(notification: InterviewConfirmationNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const { data } = notification;
      new Notification('面談予約が確定しました！', {
        body: `${data.finalScheduledDate} ${data.finalScheduledTime}から${data.interviewer.name}との面談が確定しました。`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: true
      });
    }
  }

  // 通知の確認（ユーザーアクション）
  public acknowledgeNotification(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status.userAction = 'acknowledged';
      notification.status.notificationStatus = 'acknowledged';
      notification.status.lastUpdated = new Date().toISOString();

      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // 通知の辞退
  public declineNotification(notificationId: string, reason: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status.userAction = 'declined';
      notification.status.lastUpdated = new Date().toISOString();

      // 医療システムに辞退情報を送信
      this.sendDeclineToMedicalSystem(notification.data.reservationId, reason);

      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // 医療システムへの辞退通知送信
  private async sendDeclineToMedicalSystem(reservationId: string, reason: string) {
    try {
      // 実際の実装では医療システムのAPIエンドポイントに送信
      console.log('Sending decline notification to medical system:', {
        reservationId,
        reason,
        timestamp: new Date().toISOString()
      });

      // デモ用のAPI呼び出し
      // await fetch('/api/medical-system/decline', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reservationId, reason })
      // });
    } catch (error) {
      console.error('Failed to send decline notification:', error);
    }
  }

  // 通知リストの取得
  public getNotifications(): InterviewConfirmationNotification[] {
    return [...this.notifications].sort((a, b) => {
      // 優先度とタイムスタンプでソート
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });
  }

  // 未読通知数の取得
  public getUnreadCount(): number {
    return this.notifications.filter(n => n.status.userAction === 'none').length;
  }

  // リスナーの登録
  public addListener(callback: (notifications: InterviewConfirmationNotification[]) => void): void {
    this.listeners.push(callback);
  }

  // リスナーの削除
  public removeListener(callback: (notifications: InterviewConfirmationNotification[]) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // リスナーへの通知
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.getNotifications()));
  }

  // 通知権限のリクエスト
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'default';
  }

  // リマインダーの設定
  public scheduleReminder(notification: InterviewConfirmationNotification): void {
    const { data } = notification;
    const interviewDateTime = new Date(`${data.finalScheduledDate}T${data.finalScheduledTime}`);

    // 前日17:00のリマインダー
    const dayBeforeReminder = new Date(interviewDateTime);
    dayBeforeReminder.setDate(dayBeforeReminder.getDate() - 1);
    dayBeforeReminder.setHours(17, 0, 0, 0);

    // 2時間前のリマインダー
    const twoHoursBefore = new Date(interviewDateTime);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);

    const now = new Date();

    // 前日17:00のリマインダー設定
    if (dayBeforeReminder > now && !notification.status.reminder1Sent) {
      const timeUntilReminder1 = dayBeforeReminder.getTime() - now.getTime();
      setTimeout(() => {
        this.sendReminder(notification, 'day_before');
      }, timeUntilReminder1);
    }

    // 2時間前のリマインダー設定
    if (twoHoursBefore > now && !notification.status.reminder2Sent) {
      const timeUntilReminder2 = twoHoursBefore.getTime() - now.getTime();
      setTimeout(() => {
        this.sendReminder(notification, 'two_hours_before');
      }, timeUntilReminder2);
    }
  }

  // リマインダーの送信
  private sendReminder(notification: InterviewConfirmationNotification, type: 'day_before' | 'two_hours_before'): void {
    const { data } = notification;

    let title = '';
    let body = '';

    if (type === 'day_before') {
      title = '明日の面談のお知らせ';
      body = `明日 ${data.finalScheduledTime}から${data.interviewer.name}との面談が予定されています。`;
      notification.status.reminder1Sent = true;
    } else {
      title = '面談開始2時間前です';
      body = `${data.finalScheduledTime}から${data.location}で面談が予定されています。準備をお願いします。`;
      notification.status.reminder2Sent = true;
    }

    // プッシュ通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `reminder_${notification.id}_${type}`,
        requireInteraction: false
      });
    }

    notification.status.lastUpdated = new Date().toISOString();
    this.saveNotifications();
    this.notifyListeners();
  }

  // 面談キャンセル要求の送信
  public async sendCancellationRequest(request: InterviewCancellationRequest): Promise<void> {
    try {
      // 実際の実装では医療システムのAPIエンドポイントに送信
      console.log('Sending cancellation request to medical system:', request);

      // デモ用のAPI呼び出し
      const response = await fetch('/api/medical-system/cancel-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(request)
      }).catch(() => {
        // デモ用: API呼び出しが失敗しても処理を続行
        console.log('Demo mode: API call simulated');
        return { ok: true, json: () => Promise.resolve({ success: true }) };
      });

      if (response.ok) {
        // キャンセル成功の処理
        this.showSuccessNotification(request);

        // 緊急キャンセルの場合は変更通知をシミュレート
        if (request.cancellationType === 'emergency') {
          setTimeout(() => {
            this.simulateCancellationNotification(request);
          }, 2000);
        }
      } else {
        throw new Error('Cancellation request failed');
      }
    } catch (error) {
      console.error('Failed to send cancellation request:', error);
      throw error;
    }
  }

  // 認証トークンの取得（デモ用）
  private getAuthToken(): string {
    return 'demo-auth-token-' + Date.now();
  }

  // キャンセル成功通知の表示
  private showSuccessNotification(request: InterviewCancellationRequest): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = request.cancellationType === 'emergency'
        ? '緊急キャンセルを受け付けました'
        : '面談キャンセルを受け付けました';

      new Notification(title, {
        body: '医療システムに送信されました。担当者からの連絡をお待ちください。',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `cancel_${request.reservationId}`,
        requireInteraction: true
      });
    }
  }

  // 変更通知の受信（面談がキャンセルされた場合）
  public receiveInterviewChange(changeData: InterviewChangeNotification): void {
    this.changeNotifications.unshift(changeData);
    this.saveChangeNotifications();

    // プッシュ通知を表示
    this.showChangeNotification(changeData);
  }

  // 変更通知のプッシュ通知表示
  private showChangeNotification(notification: InterviewChangeNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      let title = '';
      let body = '';

      switch (notification.changeType) {
        case 'cancelled':
          title = '面談がキャンセルされました';
          body = `${notification.originalData.scheduledDate}の面談がキャンセルされました。`;
          break;
        case 'rescheduled':
          title = '面談の日時が変更されました';
          body = `新しい日時: ${notification.newData?.scheduledDate} ${notification.newData?.scheduledTime}`;
          break;
        case 'location_changed':
          title = '面談場所が変更されました';
          body = `新しい場所: ${notification.newData?.location}`;
          break;
        case 'interviewer_changed':
          title = '面談担当者が変更されました';
          body = `新しい担当者: ${notification.newData?.interviewer?.name}`;
          break;
      }

      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `change_${notification.reservationId}`,
        requireInteraction: notification.isUrgent
      });
    }
  }

  // 変更通知のローカルストレージ保存
  private saveChangeNotifications(): void {
    try {
      localStorage.setItem('medicalChangeNotifications', JSON.stringify(this.changeNotifications));
    } catch (error) {
      console.error('Failed to save change notifications:', error);
    }
  }

  // 変更通知の取得
  public getChangeNotifications(): InterviewChangeNotification[] {
    return [...this.changeNotifications].sort((a, b) => {
      // 緊急度とタイムスタンプでソート
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime();
    });
  }

  // デモ用: キャンセル通知のシミュレート
  private simulateCancellationNotification(request: InterviewCancellationRequest): void {
    const changeNotification: InterviewChangeNotification = {
      staffId: request.staffId,
      staffName: "田中 花子",
      reservationId: request.reservationId,
      changeType: 'cancelled',
      originalData: {
        scheduledDate: "2025-09-20",
        scheduledTime: "14:30",
        location: "キャリア支援室",
        interviewer: {
          name: "田中美香子",
          title: "看護師長",
          department: "キャリア支援室",
          contactExtension: "内線2345"
        }
      },
      changeReason: request.cancellationReason,
      isUrgent: request.cancellationType === 'emergency',
      requiresAcknowledgement: true,
      changedBy: "システム自動処理",
      changedAt: new Date().toISOString(),
      notificationType: 'interview_change',
      sourceSystem: 'medical_system'
    };

    this.receiveInterviewChange(changeNotification);
  }

  // デモ用: サンプル通知の生成
  private simulateIncomingNotification(): void {
    const sampleData: InterviewConfirmationData = {
      staffId: "VD-NS-2025-001",
      staffName: "田中 花子",
      department: "内科",
      position: "看護師",
      interviewType: "support",
      urgency: "high",
      preferredDates: ["2025-09-20", "2025-09-21"],
      finalScheduledDate: "2025-09-20",
      finalScheduledTime: "14:30",
      duration: 45,
      location: "キャリア支援室",
      format: "face_to_face",
      interviewer: {
        name: "田中美香子",
        title: "看護師長",
        department: "キャリア支援室",
        contactExtension: "内線2345"
      },
      confirmedBy: "人事部管理者",
      confirmedAt: new Date().toISOString(),
      reservationId: "AI-BOOK-001",
      notificationType: "interview_confirmed",
      sourceSystem: "medical_system"
    };

    this.receiveInterviewConfirmation(sampleData);

    // 10秒後に変更通知のデモも実行
    setTimeout(() => {
      this.simulateChangeNotification();
    }, 10000);
  }

  // デモ用: 変更通知のシミュレート
  private simulateChangeNotification(): void {
    const changeNotification: InterviewChangeNotification = {
      staffId: "VD-NS-2025-001",
      staffName: "田中 花子",
      reservationId: "AI-BOOK-002",
      changeType: 'rescheduled',
      originalData: {
        scheduledDate: "2025-09-21",
        scheduledTime: "15:00",
        location: "第2面談室",
        interviewer: {
          name: "佐藤 太郎",
          title: "人事課長",
          department: "人事部",
          contactExtension: "内線3456"
        }
      },
      newData: {
        scheduledDate: "2025-09-22",
        scheduledTime: "14:00",
        location: "第2面談室",
        interviewer: {
          name: "佐藤 太郎",
          title: "人事課長",
          department: "人事部",
          contactExtension: "内線3456"
        }
      },
      changeReason: "担当者の急用により日時を変更いたします。",
      isUrgent: true,
      requiresAcknowledgement: true,
      changedBy: "人事部システム",
      changedAt: new Date().toISOString(),
      notificationType: 'interview_change',
      sourceSystem: 'medical_system'
    };

    this.receiveInterviewChange(changeNotification);
  }
}

export default MedicalNotificationService;