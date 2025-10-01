/**
 * CareerCourseNotificationService.ts
 * キャリア選択制度の通知サービス
 *
 * 医療システムからのWebhook通知をシミュレート
 * 既存のNotificationServiceと統合
 */

import NotificationService, { MedicalNotificationConfig, NotificationUrgency } from './NotificationService';
import { CareerCourseNotification } from '../types/career-course';

export class CareerCourseNotificationService {
  private static instance: CareerCourseNotificationService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): CareerCourseNotificationService {
    if (!CareerCourseNotificationService.instance) {
      CareerCourseNotificationService.instance = new CareerCourseNotificationService();
    }
    return CareerCourseNotificationService.instance;
  }

  /**
   * Webhook通知を受信（医療システムからの通知をシミュレート）
   * 本番環境ではExpressサーバーのエンドポイントから呼ばれる
   */
  public async handleWebhookNotification(notification: CareerCourseNotification): Promise<void> {
    console.log('📥 キャリアコース通知受信:', notification);

    // 認証チェック（本番環境では実装）
    // const apiKey = process.env.MEDICAL_SYSTEM_API_KEY;
    // if (!apiKey) throw new Error('API Key not configured');

    try {
      // 通知タイプに応じた処理
      if (notification.type === 'course_change_approved') {
        await this.handleApprovalNotification(notification);
      } else if (notification.type === 'course_change_rejected') {
        await this.handleRejectionNotification(notification);
      }

      // 実績ログ（開発環境）
      this.logNotification(notification);
    } catch (error) {
      console.error('❌ Webhook通知処理エラー:', error);
      throw error;
    }
  }

  /**
   * 承認通知の処理
   */
  private async handleApprovalNotification(notification: CareerCourseNotification): Promise<void> {
    const { staffId, approvedCourse, effectiveDate, reviewComment } = notification;

    const config: MedicalNotificationConfig = {
      type: 'system_notification',
      title: '✅ コース変更申請が承認されました',
      message: `${approvedCourse}コースへの変更が承認されました。\n適用日: ${effectiveDate}\n\n${reviewComment || ''}`,
      urgency: 'high' as NotificationUrgency,
      channels: ['browser', 'storage', 'sound'],
      timestamp: new Date().toISOString(),
      actionRequired: true,
      data: {
        category: 'career_course',
        action: 'approved',
        staffId,
        approvedCourse,
        effectiveDate,
        link: '/career-selection-station/my-requests',
      },
    };

    await this.notificationService.sendNotification(config);

    // リアルタイム通知（画面が開いている場合）
    this.notificationService.emitRealtimeNotification('career_course_update', {
      type: 'approved',
      staffId,
      approvedCourse,
      effectiveDate,
    });
  }

  /**
   * 却下通知の処理
   */
  private async handleRejectionNotification(notification: CareerCourseNotification): Promise<void> {
    const { staffId, rejectionReason, reviewComment } = notification;

    const config: MedicalNotificationConfig = {
      type: 'system_notification',
      title: '❌ コース変更申請が却下されました',
      message: `理由: ${rejectionReason}\n\n${reviewComment || ''}`,
      urgency: 'normal' as NotificationUrgency,
      channels: ['browser', 'storage', 'sound'],
      timestamp: new Date().toISOString(),
      actionRequired: true,
      data: {
        category: 'career_course',
        action: 'rejected',
        staffId,
        rejectionReason,
        link: '/career-selection-station/my-requests',
      },
    };

    await this.notificationService.sendNotification(config);

    // リアルタイム通知（画面が開いている場合）
    this.notificationService.emitRealtimeNotification('career_course_update', {
      type: 'rejected',
      staffId,
      rejectionReason,
    });
  }

  /**
   * 開発環境用：通知をシミュレート
   * テストやデモで使用
   */
  public async simulateWebhookNotification(
    type: 'approved' | 'rejected',
    staffId: string,
    options?: {
      approvedCourse?: string;
      effectiveDate?: string;
      rejectionReason?: string;
      reviewComment?: string;
    }
  ): Promise<void> {
    const notification: CareerCourseNotification = {
      type: type === 'approved' ? 'course_change_approved' : 'course_change_rejected',
      staffId,
      requestId: `req-${Date.now()}`,
      ...(type === 'approved' && {
        approvedCourse: options?.approvedCourse || 'A',
        effectiveDate: options?.effectiveDate || '2026-04-01',
      }),
      ...(type === 'rejected' && {
        rejectionReason: options?.rejectionReason || '現在の勤務状況から、来年度の変更が望ましいと判断しました。',
      }),
      reviewComment: options?.reviewComment,
    };

    await this.handleWebhookNotification(notification);
  }

  /**
   * 通知ログ記録
   */
  private logNotification(notification: CareerCourseNotification): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: notification.type,
      staffId: notification.staffId,
      requestId: notification.requestId,
    };

    console.log('📝 キャリアコース通知ログ:', logEntry);

    // LocalStorageにログ保存（開発用）
    try {
      const logs = JSON.parse(localStorage.getItem('career_course_notification_logs') || '[]');
      logs.push(logEntry);
      // 最大100件まで保存
      if (logs.length > 100) logs.shift();
      localStorage.setItem('career_course_notification_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('ログ保存エラー:', error);
    }
  }

  /**
   * リアルタイム通知リスナーの登録
   * 画面がマウントされた時に呼ばれる
   */
  public subscribeToCareerCourseUpdates(
    callback: (data: any) => void
  ): () => void {
    this.notificationService.onRealtimeNotification('career_course_update', callback);

    // アンサブスクライブ関数を返す
    return () => {
      this.notificationService.offRealtimeNotification('career_course_update', callback);
    };
  }

  /**
   * 通知センターに表示する未読通知を取得
   */
  public getUnreadCareerCourseNotifications(): any[] {
    // NotificationServiceから取得
    const allNotifications = this.notificationService.getActionableNotifications();
    return allNotifications.filter(
      (n: any) => n.data?.category === 'career_course' && !n.isRead
    );
  }

  /**
   * 通知を既読にする
   */
  public markAsRead(notificationId: string): void {
    this.notificationService.markAsActioned(notificationId);
  }
}

export default CareerCourseNotificationService;
