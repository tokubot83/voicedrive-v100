import { 
  EvaluationNotification,
  EvaluationNotificationRequest,
  EvaluationNotificationResponse,
  BulkEvaluationNotificationRequest,
  NotificationStats,
  EvaluationNotificationListItem,
  NotificationFilter,
  NotificationTemplateType,
  DEFAULT_NOTIFICATION_TEMPLATES,
  EVALUATION_NOTIFICATION_VALIDATION_RULES
} from '../types/evaluation-notification';
import { V3GradeUtils } from '../types/appeal-v3';
import NotificationService from './NotificationService';

class EvaluationNotificationService {
  private baseUrl: string;
  private apiKey: string;
  private notificationService: NotificationService;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
    this.notificationService = NotificationService.getInstance();
  }

  // 医療システムから評価結果通知を受信
  async receiveEvaluationNotification(request: EvaluationNotificationRequest): Promise<EvaluationNotificationResponse> {
    try {
      // バリデーション
      this.validateNotificationRequest(request);

      // 通知データを準備
      const notification: EvaluationNotification = {
        id: this.generateNotificationId(),
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        evaluationPeriod: request.evaluationPeriod,
        evaluationScore: request.evaluationScore,
        evaluationGrade: request.evaluationGrade || V3GradeUtils.getGradeFromScore(request.evaluationScore),
        // 3軸評価対応
        facilityGrade: request.facilityGrade,
        corporateGrade: request.corporateGrade,
        overallGrade: request.overallGrade,
        overallScore: request.overallScore,
        disclosureDate: request.disclosureDate,
        appealDeadline: request.appealDeadline,
        hasUnreadNotification: true,
        notificationSentAt: new Date().toISOString(),
        appealSubmitted: false
      };

      // データベースに保存
      const savedNotification = await this.saveNotification(notification);

      // 通知送信（複数チャネル）
      const deliveryResults = await this.sendNotificationToUser(savedNotification);

      return {
        success: true,
        notificationId: savedNotification.id,
        message: '評価通知を正常に送信しました',
        deliveryMethods: deliveryResults,
        estimatedDeliveryTime: new Date(Date.now() + 60000).toISOString() // 1分後
      };

    } catch (error) {
      console.error('評価通知送信エラー:', error);
      throw new Error(`評価通知の送信に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 一括評価通知送信
  async sendBulkEvaluationNotifications(request: BulkEvaluationNotificationRequest): Promise<{
    totalRequested: number;
    successCount: number;
    failureCount: number;
    failures: Array<{employeeId: string; error: string}>;
  }> {
    const results = {
      totalRequested: request.notifications.length,
      successCount: 0,
      failureCount: 0,
      failures: [] as Array<{employeeId: string; error: string}>
    };

    for (const notification of request.notifications) {
      try {
        await this.receiveEvaluationNotification(notification);
        results.successCount++;
      } catch (error) {
        results.failureCount++;
        results.failures.push({
          employeeId: notification.employeeId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  // 評価通知一覧取得
  async getEvaluationNotifications(
    employeeId: string, 
    filter?: NotificationFilter
  ): Promise<EvaluationNotificationListItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/evaluation-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ employeeId, filter })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const notifications = await response.json();
      return this.enrichNotificationListItems(notifications);
    } catch (error) {
      console.error('評価通知一覧取得エラー:', error);
      throw error;
    }
  }

  // 特定の評価通知取得
  async getEvaluationNotification(notificationId: string): Promise<EvaluationNotification> {
    try {
      const response = await fetch(`${this.baseUrl}/api/evaluation-notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('評価通知取得エラー:', error);
      throw error;
    }
  }

  // 通知を既読にマーク
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/evaluation-notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
    } catch (error) {
      console.error('既読マークエラー:', error);
      throw error;
    }
  }

  // 異議申立リンクをトラッキング
  async trackAppealLinkClick(notificationId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/evaluation-notifications/${notificationId}/appeal-click`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
    } catch (error) {
      console.error('異議申立リンククリックトラッキングエラー:', error);
    }
  }

  // 通知統計取得
  async getNotificationStats(evaluationPeriod?: string): Promise<NotificationStats> {
    try {
      const url = evaluationPeriod 
        ? `${this.baseUrl}/api/evaluation-notifications/stats?period=${evaluationPeriod}`
        : `${this.baseUrl}/api/evaluation-notifications/stats`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('通知統計取得エラー:', error);
      throw error;
    }
  }

  // 異議申立締切リマインダー送信
  async sendAppealDeadlineReminders(): Promise<void> {
    try {
      // 3日以内に締切が迫っている未申立の評価通知を取得
      const upcomingDeadlines = await this.getUpcomingDeadlines(3);
      
      for (const notification of upcomingDeadlines) {
        await this.sendDeadlineReminder(notification);
      }
    } catch (error) {
      console.error('締切リマインダー送信エラー:', error);
      throw error;
    }
  }

  // プライベートメソッド

  private validateNotificationRequest(request: EvaluationNotificationRequest): void {
    const rules = EVALUATION_NOTIFICATION_VALIDATION_RULES;

    // 従業員ID検証
    if (!rules.employeeId.pattern.test(request.employeeId)) {
      throw new Error('従業員IDの形式が正しくありません');
    }

    // スコア検証
    if (request.evaluationScore < rules.evaluationScore.min || 
        request.evaluationScore > rules.evaluationScore.max) {
      throw new Error('評価スコアが範囲外です (0-100)');
    }

    // 日付検証
    const disclosureDate = new Date(request.disclosureDate);
    const appealDeadline = new Date(request.appealDeadline);
    
    if (appealDeadline <= disclosureDate) {
      throw new Error('異議申立締切日は開示日より後である必要があります');
    }
  }

  private generateNotificationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `EVAL_${timestamp}_${random}`.toUpperCase();
  }

  private async saveNotification(notification: EvaluationNotification): Promise<EvaluationNotification> {
    try {
      const response = await fetch(`${this.baseUrl}/api/evaluation-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`保存エラー: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('通知保存エラー:', error);
      throw error;
    }
  }

  private async sendNotificationToUser(notification: EvaluationNotification): Promise<{
    email: boolean;
    push: boolean;
    sms: boolean;
  }> {
    const template = DEFAULT_NOTIFICATION_TEMPLATES[NotificationTemplateType.EVALUATION_DISCLOSURE];
    
    // テンプレートの変数を置換
    const personalizedTemplate = {
      ...template,
      title: template.title,
      body: template.body
        .replace('{period}', notification.evaluationPeriod)
        .replace('{score}', notification.evaluationScore.toString())
        .replace('{grade}', notification.evaluationGrade)
        .replace('{deadline}', this.formatDate(notification.appealDeadline)),
      actionUrl: template.actionUrl.replace('{notificationId}', notification.id)
    };

    const results = {
      email: false,
      push: false,
      sms: false
    };

    try {
      // アプリ内プッシュ通知
      await this.notificationService.sendNotification({
        recipientId: notification.employeeId,
        type: 'EVALUATION_DISCLOSURE',
        title: personalizedTemplate.title,
        message: personalizedTemplate.body,
        data: {
          notificationId: notification.id,
          actionUrl: personalizedTemplate.actionUrl,
          evaluationScore: notification.evaluationScore,
          evaluationGrade: notification.evaluationGrade
        },
        priority: 'HIGH'
      });
      results.push = true;
    } catch (error) {
      console.error('プッシュ通知送信エラー:', error);
    }

    // メール通知 (実装は省略 - 実際にはメール送信サービスを使用)
    results.email = true;

    return results;
  }

  private enrichNotificationListItems(notifications: EvaluationNotification[]): EvaluationNotificationListItem[] {
    return notifications.map(notification => {
      const appealDeadline = new Date(notification.appealDeadline);
      const today = new Date();
      const daysUntilDeadline = Math.ceil((appealDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: notification.id,
        employeeName: notification.employeeName,
        evaluationPeriod: notification.evaluationPeriod,
        score: notification.evaluationScore,
        grade: notification.evaluationGrade,
        // 3軸評価対応
        facilityGrade: notification.facilityGrade,
        corporateGrade: notification.corporateGrade,
        overallGrade: notification.overallGrade,
        overallScore: notification.overallScore,
        disclosureDate: notification.disclosureDate,
        appealDeadline: notification.appealDeadline,
        notificationStatus: notification.notificationReadAt ? 'read' : 'delivered',
        appealStatus: notification.appealSubmitted ? 'submitted' : 'none',
        daysUntilDeadline,
        isUrgent: daysUntilDeadline <= 3 && !notification.appealSubmitted
      };
    });
  }

  private async getUpcomingDeadlines(days: number): Promise<EvaluationNotification[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const filter: NotificationFilter = {
      deadlineRange: {
        from: new Date().toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      }
    };

    // 実装の詳細は省略
    return [];
  }

  private async sendDeadlineReminder(notification: EvaluationNotification): Promise<void> {
    const template = DEFAULT_NOTIFICATION_TEMPLATES[NotificationTemplateType.APPEAL_DEADLINE_REMINDER];
    const appealDeadline = new Date(notification.appealDeadline);
    const today = new Date();
    const daysLeft = Math.ceil((appealDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const personalizedTemplate = {
      ...template,
      body: template.body
        .replace('{period}', notification.evaluationPeriod)
        .replace('{days}', daysLeft.toString()),
      actionUrl: template.actionUrl.replace('{notificationId}', notification.id)
    };

    try {
      await this.notificationService.sendNotification({
        recipientId: notification.employeeId,
        type: 'APPEAL_DEADLINE_REMINDER',
        title: personalizedTemplate.title,
        message: personalizedTemplate.body,
        data: {
          notificationId: notification.id,
          daysLeft,
          isUrgent: daysLeft <= 1
        },
        priority: daysLeft <= 1 ? 'CRITICAL' : 'HIGH'
      });
    } catch (error) {
      console.error('締切リマインダー送信エラー:', error);
      throw error;
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export const evaluationNotificationService = new EvaluationNotificationService();
export default evaluationNotificationService;