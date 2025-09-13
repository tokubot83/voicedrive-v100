import { InterviewBooking } from '../types/interview';
import { NotificationService } from './NotificationService';

// プッシュ通知専用インターフェース
interface MobilePushNotification {
  type: MobileNotificationType;
  title: string;
  body: string;
  data: {
    bookingId: string;
    actionUrl: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    timestamp: string;
    employeeId: string;
  };
  badge?: number;
  icon: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  vibrate?: number[];
  tag?: string; // 同種通知の重複防止
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// モバイル通知タイプ定義
export type MobileNotificationType =
  | 'INTERVIEW_BOOKING_CONFIRMED'     // 面談予約確定
  | 'INTERVIEW_REMINDER_24H'          // 24時間前リマインダー
  | 'INTERVIEW_REMINDER_2H'           // 2時間前リマインダー
  | 'INTERVIEW_CANCELLED'             // 面談キャンセル
  | 'INTERVIEW_RESCHEDULE_APPROVED'   // 変更申請承認
  | 'INTERVIEW_RESCHEDULE_REJECTED'   // 変更申請拒否
  | 'INTERVIEWER_ASSIGNED'            // 面談者決定
  | 'URGENT_SCHEDULE_CHANGE'          // 緊急スケジュール変更
  | 'INTERVIEW_STARTING_SOON'         // まもなく開始
  | 'INTERVIEW_FOLLOWUP_REQUIRED';    // フォローアップ要求

// デバイス登録情報
interface DeviceRegistration {
  employeeId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  registeredAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

class MobilePushNotificationService {
  private baseUrl: string;
  private vapidKeys: {
    publicKey: string;
    privateKey: string;
  };
  private notificationService: NotificationService;
  private mcpIntegrationEnabled: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.vapidKeys = {
      publicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
      privateKey: import.meta.env.VITE_VAPID_PRIVATE_KEY || ''
    };
    this.notificationService = new NotificationService();
    this.mcpIntegrationEnabled = import.meta.env.VITE_MCP_INTEGRATION_ENABLED === 'true';
  }

  // デバイス登録
  async registerDevice(employeeId: string, subscription: PushSubscription): Promise<boolean> {
    try {
      const deviceRegistration: DeviceRegistration = {
        employeeId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh') ?
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
          auth: subscription.getKey('auth') ?
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : ''
        },
        userAgent: navigator.userAgent,
        registeredAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      };

      // 職員カルテシステムとの連携
      if (this.mcpIntegrationEnabled) {
        await this.registerDeviceWithMCP(deviceRegistration);
      }

      const response = await fetch(`${this.baseUrl}/api/push-notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceRegistration)
      });

      return response.ok;
    } catch (error) {
      console.error('デバイス登録エラー:', error);
      return false;
    }
  }

  // 面談予約確定通知
  async sendBookingConfirmedNotification(booking: InterviewBooking): Promise<void> {
    const notification: MobilePushNotification = {
      type: 'INTERVIEW_BOOKING_CONFIRMED',
      title: '🎯 面談予約が確定しました',
      body: `${this.formatDate(booking.bookingDate)} ${booking.timeSlot.startTime}からの面談予約が確定しました`,
      data: {
        bookingId: booking.id,
        actionUrl: `/interview-station/booking/${booking.id}`,
        priority: 'normal',
        timestamp: new Date().toISOString(),
        employeeId: booking.employeeId
      },
      icon: '/icons/interview-confirmed-192x192.png',
      badge: 1,
      actions: [
        {
          action: 'view_details',
          title: '詳細を確認',
          icon: '/icons/view-details.png'
        },
        {
          action: 'add_to_calendar',
          title: 'カレンダーに追加',
          icon: '/icons/calendar.png'
        }
      ],
      tag: `booking-${booking.id}`,
      vibrate: [100, 50, 100]
    };

    await this.sendPushNotification(booking.employeeId, notification);

    // 職員カルテシステムへの通知記録
    if (this.mcpIntegrationEnabled) {
      await this.logNotificationToMCP(booking.employeeId, notification);
    }
  }

  // 24時間前リマインダー
  async sendReminderNotification24H(booking: InterviewBooking): Promise<void> {
    const notification: MobilePushNotification = {
      type: 'INTERVIEW_REMINDER_24H',
      title: '📅 明日面談予定があります',
      body: `${booking.timeSlot.startTime}から${this.getInterviewTypeDisplay(booking.interviewType)}の予定です`,
      data: {
        bookingId: booking.id,
        actionUrl: `/interview-station/booking/${booking.id}`,
        priority: 'high',
        timestamp: new Date().toISOString(),
        employeeId: booking.employeeId
      },
      icon: '/icons/reminder-192x192.png',
      badge: 1,
      actions: [
        {
          action: 'view_details',
          title: '詳細確認',
          icon: '/icons/view-details.png'
        },
        {
          action: 'reschedule',
          title: '変更申請',
          icon: '/icons/reschedule.png'
        }
      ],
      tag: `reminder-24h-${booking.id}`,
      vibrate: [100, 100, 100]
    };

    await this.sendPushNotification(booking.employeeId, notification);
  }

  // 2時間前緊急リマインダー
  async sendReminderNotification2H(booking: InterviewBooking): Promise<void> {
    const notification: MobilePushNotification = {
      type: 'INTERVIEW_REMINDER_2H',
      title: '🚨 まもなく面談開始です',
      body: `${booking.timeSlot.startTime}から面談開始です。準備をお願いします`,
      data: {
        bookingId: booking.id,
        actionUrl: `/interview-station/booking/${booking.id}`,
        priority: 'urgent',
        timestamp: new Date().toISOString(),
        employeeId: booking.employeeId
      },
      icon: '/icons/urgent-192x192.png',
      badge: 1,
      requireInteraction: true, // 手動で閉じるまで表示
      actions: [
        {
          action: 'view_location',
          title: '場所を確認',
          icon: '/icons/location.png'
        },
        {
          action: 'contact_interviewer',
          title: '連絡する',
          icon: '/icons/contact.png'
        }
      ],
      tag: `reminder-2h-${booking.id}`,
      vibrate: [200, 100, 200, 100, 200] // 緊急パターン
    };

    await this.sendPushNotification(booking.employeeId, notification);
  }

  // 変更承認通知
  async sendRescheduleApprovedNotification(booking: InterviewBooking): Promise<void> {
    const notification: MobilePushNotification = {
      type: 'INTERVIEW_RESCHEDULE_APPROVED',
      title: '✅ 面談変更が承認されました',
      body: `新しい日時：${this.formatDate(booking.bookingDate)} ${booking.timeSlot.startTime}`,
      data: {
        bookingId: booking.id,
        actionUrl: `/interview-station/booking/${booking.id}`,
        priority: 'high',
        timestamp: new Date().toISOString(),
        employeeId: booking.employeeId
      },
      icon: '/icons/approved-192x192.png',
      badge: 1,
      actions: [
        {
          action: 'view_details',
          title: '詳細確認',
          icon: '/icons/view-details.png'
        },
        {
          action: 'add_to_calendar',
          title: 'カレンダー更新',
          icon: '/icons/calendar.png'
        }
      ],
      tag: `reschedule-approved-${booking.id}`,
      vibrate: [100, 50, 100, 50, 100]
    };

    await this.sendPushNotification(booking.employeeId, notification);
  }

  // キャンセル通知
  async sendCancellationNotification(booking: InterviewBooking): Promise<void> {
    const notification: MobilePushNotification = {
      type: 'INTERVIEW_CANCELLED',
      title: '❌ 面談がキャンセルされました',
      body: `${this.formatDate(booking.bookingDate)} ${booking.timeSlot.startTime}の面談がキャンセルされました`,
      data: {
        bookingId: booking.id,
        actionUrl: `/interview-station`,
        priority: 'high',
        timestamp: new Date().toISOString(),
        employeeId: booking.employeeId
      },
      icon: '/icons/cancelled-192x192.png',
      badge: 1,
      actions: [
        {
          action: 'book_new',
          title: '新しく予約',
          icon: '/icons/book-new.png'
        },
        {
          action: 'view_available',
          title: '空き状況確認',
          icon: '/icons/calendar.png'
        }
      ],
      tag: `cancelled-${booking.id}`,
      vibrate: [200, 100, 200]
    };

    await this.sendPushNotification(booking.employeeId, notification);
  }

  // 実際のプッシュ通知送信
  private async sendPushNotification(employeeId: string, notification: MobilePushNotification): Promise<void> {
    try {
      // 職員のデバイス情報取得
      const devices = await this.getEmployeeDevices(employeeId);

      for (const device of devices) {
        if (device.isActive) {
          await this.sendToDevice(device, notification);

          // 使用時刻更新
          await this.updateDeviceLastUsed(device.endpoint);
        }
      }

      // 通知統計記録
      await this.recordNotificationStats(employeeId, notification.type, true);

    } catch (error) {
      console.error('プッシュ通知送信エラー:', error);
      await this.recordNotificationStats(employeeId, notification.type, false);
      throw error;
    }
  }

  // デバイスへの個別送信
  private async sendToDevice(device: DeviceRegistration, notification: MobilePushNotification): Promise<void> {
    const pushSubscription = {
      endpoint: device.endpoint,
      keys: device.keys
    };

    const payload = JSON.stringify(notification);

    const response = await fetch(`${this.baseUrl}/api/push-notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: pushSubscription,
        payload,
        options: {
          vapidDetails: {
            subject: 'mailto:support@voicedrive.medical',
            publicKey: this.vapidKeys.publicKey,
            privateKey: this.vapidKeys.privateKey
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`プッシュ送信失敗: ${response.status}`);
    }
  }

  // 職員カルテシステムとの連携メソッド
  private async registerDeviceWithMCP(registration: DeviceRegistration): Promise<void> {
    try {
      // MCP経由で職員カルテシステムにデバイス情報を登録
      await fetch(`${this.baseUrl}/api/mcp/employee-devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register_device',
          data: {
            employeeId: registration.employeeId,
            deviceInfo: {
              endpoint: registration.endpoint,
              userAgent: registration.userAgent,
              registeredAt: registration.registeredAt,
              platform: this.detectPlatform(registration.userAgent)
            }
          }
        })
      });
    } catch (error) {
      console.error('MCPデバイス登録エラー:', error);
      // MCP連携エラーは致命的ではないため、継続
    }
  }

  private async logNotificationToMCP(employeeId: string, notification: MobilePushNotification): Promise<void> {
    try {
      // 職員カルテシステムに通知履歴を記録
      await fetch(`${this.baseUrl}/api/mcp/employee-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'log_notification',
          data: {
            employeeId,
            notificationType: notification.type,
            title: notification.title,
            body: notification.body,
            priority: notification.data.priority,
            timestamp: notification.data.timestamp,
            interviewBookingId: notification.data.bookingId
          }
        })
      });
    } catch (error) {
      console.error('MCP通知ログエラー:', error);
    }
  }

  // ヘルパーメソッド
  private async getEmployeeDevices(employeeId: string): Promise<DeviceRegistration[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/push-notifications/devices/${employeeId}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('デバイス取得エラー:', error);
      return [];
    }
  }

  private async updateDeviceLastUsed(endpoint: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/push-notifications/devices/last-used`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          lastUsed: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('デバイス使用時刻更新エラー:', error);
    }
  }

  private async recordNotificationStats(employeeId: string, type: MobileNotificationType, success: boolean): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/push-notifications/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          notificationType: type,
          success,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('通知統計記録エラー:', error);
    }
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }

  private getInterviewTypeDisplay(type: string): string {
    const typeMap: Record<string, string> = {
      'new_employee_monthly': '新入職員月次面談',
      'regular_annual': '年次面談',
      'management_biannual': '管理職面談',
      'feedback': 'フィードバック面談',
      'career_support': 'キャリア相談',
      'workplace_support': '職場環境相談',
      'individual_consultation': '個別相談',
      'return_to_work': '復職面談',
      'exit_interview': '退職面談'
    };
    return typeMap[type] || '面談';
  }

  private detectPlatform(userAgent: string): string {
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac/.test(userAgent)) return 'macOS';
    return 'Unknown';
  }

  // 自動リマインダー設定
  async scheduleAutomaticReminders(booking: InterviewBooking): Promise<void> {
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();

    // 24時間前リマインダー
    const reminder24h = new Date(bookingDate);
    reminder24h.setHours(9, 0, 0, 0); // 朝9時に送信
    reminder24h.setDate(reminder24h.getDate() - 1);

    if (reminder24h > now) {
      setTimeout(() => {
        this.sendReminderNotification24H(booking);
      }, reminder24h.getTime() - now.getTime());
    }

    // 2時間前リマインダー
    const reminder2h = new Date(bookingDate);
    const [hours, minutes] = booking.timeSlot.startTime.split(':');
    reminder2h.setHours(parseInt(hours) - 2, parseInt(minutes), 0, 0);

    if (reminder2h > now) {
      setTimeout(() => {
        this.sendReminderNotification2H(booking);
      }, reminder2h.getTime() - now.getTime());
    }
  }
}

export const mobilePushNotificationService = new MobilePushNotificationService();
export default mobilePushNotificationService;