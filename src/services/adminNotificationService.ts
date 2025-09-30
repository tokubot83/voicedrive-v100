/**
 * 管理者通知サービス
 * urgent/high優先度の健康通知を管理者に即座に通知
 */

import {
  HealthNotification,
  NotificationPriority,
  NotificationProcessResult
} from '../types/health-notifications';

/**
 * 通知先設定
 */
interface NotificationTarget {
  email?: string;           // メールアドレス
  slackWebhook?: string;    // Slack Webhook URL
  userId?: string;          // システム内ユーザーID
  name: string;             // 管理者名
}

/**
 * 管理者通知設定
 */
interface AdminNotificationConfig {
  urgentTargets: NotificationTarget[];  // urgent優先度の通知先
  highTargets: NotificationTarget[];    // high優先度の通知先
  enableEmail: boolean;                 // メール通知有効化
  enableSlack: boolean;                 // Slack通知有効化
  enableInApp: boolean;                 // アプリ内通知有効化
}

/**
 * 通知結果
 */
interface NotificationResult {
  success: boolean;
  target: NotificationTarget;
  method: 'email' | 'slack' | 'in-app';
  error?: string;
}

/**
 * 管理者通知サービスクラス
 */
export class AdminNotificationService {
  private config: AdminNotificationConfig;

  constructor(config?: Partial<AdminNotificationConfig>) {
    this.config = {
      urgentTargets: config?.urgentTargets || [],
      highTargets: config?.highTargets || [],
      enableEmail: config?.enableEmail ?? true,
      enableSlack: config?.enableSlack ?? true,
      enableInApp: config?.enableInApp ?? true
    };
  }

  /**
   * 健康通知を管理者に送信
   */
  public async notifyAdmins(
    notification: HealthNotification,
    priority: NotificationPriority
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // urgent または high 優先度のみ処理
    if (priority !== 'urgent' && priority !== 'high') {
      console.log(`優先度 ${priority} は管理者通知の対象外です`);
      return results;
    }

    // 通知先を決定
    const targets = priority === 'urgent'
      ? this.config.urgentTargets
      : this.config.highTargets;

    if (targets.length === 0) {
      console.warn(`${priority}優先度の通知先が設定されていません`);
      return results;
    }

    // 各通知先に通知を送信
    for (const target of targets) {
      // メール通知
      if (this.config.enableEmail && target.email) {
        const emailResult = await this.sendEmailNotification(notification, target, priority);
        results.push(emailResult);
      }

      // Slack通知
      if (this.config.enableSlack && target.slackWebhook) {
        const slackResult = await this.sendSlackNotification(notification, target, priority);
        results.push(slackResult);
      }

      // アプリ内通知
      if (this.config.enableInApp && target.userId) {
        const inAppResult = await this.sendInAppNotification(notification, target, priority);
        results.push(inAppResult);
      }
    }

    return results;
  }

  /**
   * メール通知を送信
   */
  private async sendEmailNotification(
    notification: HealthNotification,
    target: NotificationTarget,
    priority: NotificationPriority
  ): Promise<NotificationResult> {
    try {
      console.log(`📧 メール通知送信: ${target.email}`);

      // TODO: 実際のメール送信処理を実装
      // 例: SendGrid, AWS SES, Nodemailerなどを使用

      const emailContent = this.buildEmailContent(notification, priority);

      // ログに記録（デモ用）
      console.log(`
        宛先: ${target.email}
        件名: ${emailContent.subject}
        本文プレビュー: ${emailContent.body.substring(0, 100)}...
      `);

      return {
        success: true,
        target,
        method: 'email'
      };
    } catch (error) {
      console.error('メール通知エラー:', error);
      return {
        success: false,
        target,
        method: 'email',
        error: error instanceof Error ? error.message : '不明なエラー'
      };
    }
  }

  /**
   * Slack通知を送信
   */
  private async sendSlackNotification(
    notification: HealthNotification,
    target: NotificationTarget,
    priority: NotificationPriority
  ): Promise<NotificationResult> {
    try {
      console.log(`💬 Slack通知送信: ${target.name}`);

      // TODO: 実際のSlack Webhook送信処理を実装

      const slackMessage = this.buildSlackMessage(notification, priority);

      // ログに記録（デモ用）
      console.log(`Slackメッセージ: ${JSON.stringify(slackMessage, null, 2)}`);

      /*
      // 実際のSlack送信例:
      const response = await fetch(target.slackWebhook!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });

      if (!response.ok) {
        throw new Error('Slack送信失敗');
      }
      */

      return {
        success: true,
        target,
        method: 'slack'
      };
    } catch (error) {
      console.error('Slack通知エラー:', error);
      return {
        success: false,
        target,
        method: 'slack',
        error: error instanceof Error ? error.message : '不明なエラー'
      };
    }
  }

  /**
   * アプリ内通知を送信
   */
  private async sendInAppNotification(
    notification: HealthNotification,
    target: NotificationTarget,
    priority: NotificationPriority
  ): Promise<NotificationResult> {
    try {
      console.log(`🔔 アプリ内通知送信: ${target.name} (${target.userId})`);

      // TODO: 実際のアプリ内通知処理を実装
      // 例: データベースに通知レコードを作成、WebSocketでリアルタイム配信など

      const inAppMessage = this.buildInAppMessage(notification, priority);

      // ログに記録（デモ用）
      console.log(`アプリ内通知: ${JSON.stringify(inAppMessage, null, 2)}`);

      return {
        success: true,
        target,
        method: 'in-app'
      };
    } catch (error) {
      console.error('アプリ内通知エラー:', error);
      return {
        success: false,
        target,
        method: 'in-app',
        error: error instanceof Error ? error.message : '不明なエラー'
      };
    }
  }

  /**
   * メールコンテンツを生成
   */
  private buildEmailContent(
    notification: HealthNotification,
    priority: NotificationPriority
  ): { subject: string; body: string } {
    const priorityLabel = priority === 'urgent' ? '【緊急】' : '【重要】';
    const subject = `${priorityLabel}健康リスク通知 - 職員ID: ${notification.staffId}`;

    const body = `
健康データ通知が届きました

優先度: ${priority.toUpperCase()}
職員ID: ${notification.staffId}
通知タイプ: ${notification.type}
通知日時: ${new Date(notification.timestamp).toLocaleString('ja-JP')}

${notification.assessment ? `
【健康評価】
総合スコア: ${notification.assessment.overallScore}点
リスクレベル: ${notification.assessment.overallLevel}

高リスクカテゴリー:
${notification.assessment.highRiskCategories.map(cat =>
  `  - ${cat.category}: ${cat.level} (${cat.score}点)`
).join('\n')}

優先対応事項:
${notification.assessment.priorityActions.map(action => `  - ${action}`).join('\n')}

次回検診推奨日: ${new Date(notification.assessment.nextCheckup).toLocaleDateString('ja-JP')}
` : ''}

${notification.recommendations ? `
【推奨事項】
生活習慣改善: ${notification.recommendations.lifestyle.join(', ')}
食事改善: ${notification.recommendations.diet.join(', ')}
運動改善: ${notification.recommendations.exercise.join(', ')}
医療フォローアップ: ${notification.recommendations.medicalFollowUp.join(', ')}
` : ''}

このメールはVoiceDriveシステムから自動送信されています。
    `.trim();

    return { subject, body };
  }

  /**
   * Slackメッセージを生成
   */
  private buildSlackMessage(
    notification: HealthNotification,
    priority: NotificationPriority
  ): any {
    const priorityEmoji = priority === 'urgent' ? '🚨' : '⚠️';
    const priorityLabel = priority === 'urgent' ? '緊急' : '重要';
    const color = priority === 'urgent' ? '#FF0000' : '#FFA500';

    return {
      attachments: [
        {
          color,
          title: `${priorityEmoji} ${priorityLabel}：健康リスク通知`,
          fields: [
            {
              title: '職員ID',
              value: notification.staffId,
              short: true
            },
            {
              title: '通知タイプ',
              value: notification.type,
              short: true
            },
            ...(notification.assessment ? [
              {
                title: '総合健康スコア',
                value: `${notification.assessment.overallScore}点`,
                short: true
              },
              {
                title: 'リスクレベル',
                value: notification.assessment.overallLevel,
                short: true
              },
              {
                title: '優先対応事項',
                value: notification.assessment.priorityActions.join('\n'),
                short: false
              }
            ] : [])
          ],
          footer: 'VoiceDrive 健康管理システム',
          ts: Math.floor(new Date(notification.timestamp).getTime() / 1000)
        }
      ]
    };
  }

  /**
   * アプリ内通知メッセージを生成
   */
  private buildInAppMessage(
    notification: HealthNotification,
    priority: NotificationPriority
  ): any {
    return {
      priority,
      title: priority === 'urgent' ? '【緊急】健康リスク通知' : '【重要】健康リスク通知',
      message: `職員ID ${notification.staffId} の健康データに注意が必要です`,
      data: {
        staffId: notification.staffId,
        type: notification.type,
        overallScore: notification.assessment?.overallScore,
        overallLevel: notification.assessment?.overallLevel,
        timestamp: notification.timestamp
      },
      actionUrl: `/health/notifications/${notification.staffId}`,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 通知設定を更新
   */
  public updateConfig(config: Partial<AdminNotificationConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  /**
   * 現在の設定を取得
   */
  public getConfig(): AdminNotificationConfig {
    return { ...this.config };
  }
}

// シングルトンインスタンス
let serviceInstance: AdminNotificationService | null = null;

/**
 * サービスインスタンスを取得
 */
export function getAdminNotificationService(
  config?: Partial<AdminNotificationConfig>
): AdminNotificationService {
  if (!serviceInstance) {
    serviceInstance = new AdminNotificationService(config);
  }
  return serviceInstance;
}