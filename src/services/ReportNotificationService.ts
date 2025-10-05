// Report Notification Service
// 通報に関する管理者通知サービス
// 注意: 開発環境向け暫定実装

import { ReportAlert } from '../types/report';
import { HierarchicalUser } from '../types';

// 通知設定
interface NotificationConfig {
  severity: string;
  requiredLevel: number;
  notificationTypes: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// 通知データ
interface NotificationData {
  id: string;
  type: 'report_alert';
  severity: string;
  postId: string;
  reportCount: number;
  message: string;
  targetUsers: string[];
  priority: string;
  createdAt: Date;
  sentAt?: Date;
}

export class ReportNotificationService {
  private static instance: ReportNotificationService;

  // 通知設定（重大度別）
  private readonly notificationConfigs: NotificationConfig[] = [
    {
      severity: 'low',
      requiredLevel: 14,      // Level 14以上（人事部）に通知
      notificationTypes: ['dashboard'],
      priority: 'low'
    },
    {
      severity: 'medium',
      requiredLevel: 14,      // Level 14以上に通知
      notificationTypes: ['dashboard', 'email'],
      priority: 'medium'
    },
    {
      severity: 'high',
      requiredLevel: 15,      // Level 15以上（部長級）に通知
      notificationTypes: ['dashboard', 'email', 'push'],
      priority: 'high'
    },
    {
      severity: 'critical',
      requiredLevel: 97,      // Level 97以上（施設長・経営層）に通知
      notificationTypes: ['dashboard', 'email', 'push', 'sms'],
      priority: 'urgent'
    }
  ];

  // 通知履歴（開発環境用）
  private notificationHistory: NotificationData[] = [];

  private constructor() {}

  static getInstance(): ReportNotificationService {
    if (!ReportNotificationService.instance) {
      ReportNotificationService.instance = new ReportNotificationService();
    }
    return ReportNotificationService.instance;
  }

  /**
   * アラート発生時の管理者通知
   */
  public async notifyManagers(alert: ReportAlert): Promise<void> {
    const config = this.notificationConfigs.find(c => c.severity === alert.severity);
    if (!config) {
      console.warn(`未定義の重大度: ${alert.severity}`);
      return;
    }

    // 通知対象ユーザーを取得（開発環境では模擬データ）
    const targetUsers = await this.getTargetUsers(config.requiredLevel);

    // 通知データを作成
    const notification: NotificationData = {
      id: `notif_${Date.now()}`,
      type: 'report_alert',
      severity: alert.severity,
      postId: alert.postId,
      reportCount: alert.reportCount,
      message: alert.message,
      targetUsers: targetUsers.map(u => u.id),
      priority: config.priority,
      createdAt: new Date()
    };

    // 各通知タイプで送信
    for (const notificationType of config.notificationTypes) {
      await this.sendNotification(notificationType, notification, targetUsers);
    }

    // 履歴に記録
    notification.sentAt = new Date();
    this.notificationHistory.push(notification);

    console.log(`🔔 通知送信完了:`, {
      severity: alert.severity,
      targetCount: targetUsers.length,
      types: config.notificationTypes
    });
  }

  /**
   * 通知対象ユーザーの取得
   */
  private async getTargetUsers(requiredLevel: number): Promise<HierarchicalUser[]> {
    // 開発環境用: モックデータを返す
    // 本番環境では実際のユーザーデータベースから取得

    const mockUsers: HierarchicalUser[] = [
      {
        id: 'admin_14',
        name: '人事部管理者',
        email: 'hr@example.com',
        department: '人事部',
        accountType: 'HR管理者',
        permissionLevel: 14,
        facilityId: 'facility_1',
        budgetApprovalLimit: 1000000,
        stakeholderCategory: 'admin',
        position: '課長',
        expertise: 10,
        hierarchyLevel: 4
      },
      {
        id: 'admin_15',
        name: '看護部長',
        email: 'nurse_director@example.com',
        department: '看護部',
        accountType: '部長',
        permissionLevel: 15,
        facilityId: 'facility_1',
        budgetApprovalLimit: 5000000,
        stakeholderCategory: 'director',
        position: '部長',
        expertise: 15,
        hierarchyLevel: 5
      },
      {
        id: 'admin_97',
        name: '施設長',
        email: 'facility_director@example.com',
        department: '経営管理',
        accountType: '施設長',
        permissionLevel: 97,
        facilityId: 'facility_1',
        budgetApprovalLimit: 50000000,
        stakeholderCategory: 'executive',
        position: '施設長',
        expertise: 20,
        hierarchyLevel: 7
      },
      {
        id: 'admin_99',
        name: 'システム管理者',
        email: 'system@example.com',
        department: 'IT部',
        accountType: 'システム管理者',
        permissionLevel: 99,
        facilityId: 'facility_1',
        budgetApprovalLimit: 100000000,
        stakeholderCategory: 'system',
        position: 'システム管理者',
        expertise: 20,
        hierarchyLevel: 8
      }
    ];

    return mockUsers.filter(user => user.permissionLevel >= requiredLevel);
  }

  /**
   * 通知送信処理
   */
  private async sendNotification(
    type: string,
    notification: NotificationData,
    targetUsers: HierarchicalUser[]
  ): Promise<void> {
    switch (type) {
      case 'dashboard':
        await this.sendDashboardNotification(notification, targetUsers);
        break;
      case 'email':
        await this.sendEmailNotification(notification, targetUsers);
        break;
      case 'push':
        await this.sendPushNotification(notification, targetUsers);
        break;
      case 'sms':
        await this.sendSmsNotification(notification, targetUsers);
        break;
      default:
        console.warn(`未対応の通知タイプ: ${type}`);
    }
  }

  /**
   * ダッシュボード通知（アプリ内通知）
   */
  private async sendDashboardNotification(
    notification: NotificationData,
    targetUsers: HierarchicalUser[]
  ): Promise<void> {
    // 開発環境: コンソールログで模擬
    console.log('📌 ダッシュボード通知:', {
      message: notification.message,
      targets: targetUsers.map(u => u.name)
    });

    // 本番環境では以下を実装:
    // 1. WebSocket経由でリアルタイム通知
    // 2. 通知APIエンドポイントへPOST
    // 3. ブラウザ通知API使用
  }

  /**
   * メール通知
   */
  private async sendEmailNotification(
    notification: NotificationData,
    targetUsers: HierarchicalUser[]
  ): Promise<void> {
    const emailTemplate = `
【VoiceDrive】重要通報アラート

${notification.message}

詳細情報:
- 投稿ID: ${notification.postId}
- 通報数: ${notification.reportCount}件
- 重大度: ${this.getSeverityLabel(notification.severity)}
- 優先度: ${this.getPriorityLabel(notification.priority)}

至急確認をお願いいたします。

▼ 管理画面で確認
https://voicedrive.example.com/admin/reports

---
このメールは自動送信されています。
VoiceDrive通報管理システム
    `;

    // 開発環境: コンソールログで模擬
    console.log('📧 メール通知:', {
      to: targetUsers.map(u => u.email),
      subject: `[緊急] VoiceDrive通報アラート - ${notification.severity}`,
      body: emailTemplate.trim()
    });

    // 本番環境では実際のメール送信APIを使用
  }

  /**
   * プッシュ通知
   */
  private async sendPushNotification(
    notification: NotificationData,
    targetUsers: HierarchicalUser[]
  ): Promise<void> {
    // 開発環境: コンソールログで模擬
    console.log('🔔 プッシュ通知:', {
      title: '重要通報アラート',
      body: notification.message,
      targets: targetUsers.map(u => u.name),
      urgency: notification.priority
    });

    // 本番環境では以下を実装:
    // 1. FCM (Firebase Cloud Messaging) 使用
    // 2. Web Push API使用
    // 3. モバイルアプリ通知
  }

  /**
   * SMS通知（重大案件のみ）
   */
  private async sendSmsNotification(
    notification: NotificationData,
    targetUsers: HierarchicalUser[]
  ): Promise<void> {
    const smsMessage = `
[VoiceDrive緊急]
${notification.message}
投稿ID: ${notification.postId.slice(0, 8)}
通報数: ${notification.reportCount}
至急対応要
    `.trim();

    // 開発環境: コンソールログで模擬
    console.log('📱 SMS通知:', {
      message: smsMessage,
      targets: targetUsers.map(u => u.name),
      priority: 'URGENT'
    });

    // 本番環境ではTwilio等のSMS APIを使用
  }

  /**
   * 重大度ラベル取得
   */
  private getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      low: '📌 注意',
      medium: '⚡ 警告',
      high: '⚠️ 緊急',
      critical: '🚨 重大'
    };
    return labels[severity] || severity;
  }

  /**
   * 優先度ラベル取得
   */
  private getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '緊急'
    };
    return labels[priority] || priority;
  }

  /**
   * 通知履歴取得
   */
  public getNotificationHistory(): NotificationData[] {
    return this.notificationHistory;
  }

  /**
   * 通知統計取得
   */
  public getNotificationStatistics() {
    const stats = {
      total: this.notificationHistory.length,
      bySeverity: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      last24Hours: 0,
      averageResponseTime: 0
    };

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    this.notificationHistory.forEach(notif => {
      // 重大度別集計
      stats.bySeverity[notif.severity] = (stats.bySeverity[notif.severity] || 0) + 1;

      // 優先度別集計
      stats.byPriority[notif.priority] = (stats.byPriority[notif.priority] || 0) + 1;

      // 24時間以内の通知数
      if (notif.createdAt.getTime() > oneDayAgo) {
        stats.last24Hours++;
      }
    });

    return stats;
  }

  /**
   * テスト用: 通知履歴クリア
   */
  public clearHistory(): void {
    this.notificationHistory = [];
  }
}

// エクスポート
export const reportNotificationService = ReportNotificationService.getInstance();