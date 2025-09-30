/**
 * 健康通知ハンドラー
 * 医療職員管理システムからの健康データ通知を処理する
 */

import fs from 'fs';
import path from 'path';
import {
  HealthNotification,
  NotificationProcessResult,
  NotificationPriority,
  RiskLevel,
  NotificationFile
} from '../types/health-notifications';

/**
 * 健康通知ハンドラークラス
 */
export class HealthNotificationHandler {
  private notificationsPath: string;
  private logsPath: string;
  private processedNotifications: Set<string>;

  constructor() {
    this.notificationsPath = path.join(process.cwd(), 'mcp-shared', 'notifications');
    this.logsPath = path.join(process.cwd(), 'mcp-shared', 'logs', 'health-notifications.log');
    this.processedNotifications = new Set<string>();

    // フォルダが存在しない場合は作成
    this.ensureDirectoriesExist();
  }

  /**
   * 必要なディレクトリが存在することを確認
   */
  private ensureDirectoriesExist(): void {
    const dirs = [
      this.notificationsPath,
      path.dirname(this.logsPath)
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 新規通知ファイルを検知
   */
  public detectNewNotifications(): NotificationFile[] {
    const files: NotificationFile[] = [];

    try {
      const fileList = fs.readdirSync(this.notificationsPath);

      fileList
        .filter(filename => filename.startsWith('health_notif_') && filename.endsWith('.json'))
        .forEach(filename => {
          const filePath = path.join(this.notificationsPath, filename);
          const stats = fs.statSync(filePath);
          const processed = this.processedNotifications.has(filename);

          files.push({
            filename,
            path: filePath,
            createdAt: stats.birthtime,
            processed
          });
        });

      // 作成日時でソート（新しい順）
      return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      this.logError('通知ファイルの検知エラー', error);
      return [];
    }
  }

  /**
   * 通知を処理
   */
  public async processNotification(notificationFile: NotificationFile): Promise<NotificationProcessResult> {
    const startTime = new Date().toISOString();

    try {
      // ファイルから通知データを読み込み
      const notification = this.readNotificationFile(notificationFile.path);

      // 優先度を判定
      const priority = this.determinePriority(notification);

      // 優先度別の処理を実行
      const actions = await this.executeActions(notification, priority);

      // 処理済みとしてマーク
      this.processedNotifications.add(notificationFile.filename);

      // 処理結果をログに記録
      this.logProcessing(notification, actions);

      return {
        success: true,
        notificationId: notificationFile.filename,
        staffId: notification.staffId,
        processedAt: startTime,
        actions
      };
    } catch (error) {
      this.logError('通知処理エラー', error);

      return {
        success: false,
        notificationId: notificationFile.filename,
        staffId: 'unknown',
        processedAt: startTime,
        actions: [],
        error: error instanceof Error ? error.message : '不明なエラー'
      };
    }
  }

  /**
   * 通知ファイルを読み込み
   */
  private readNotificationFile(filePath: string): HealthNotification {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as HealthNotification;
    } catch (error) {
      throw new Error(`通知ファイルの読み込みエラー: ${filePath}`);
    }
  }

  /**
   * 通知の優先度を判定
   */
  private determinePriority(notification: HealthNotification): NotificationPriority {
    // メタデータに優先度が設定されている場合はそれを使用
    if (notification.metadata?.priority) {
      return notification.metadata.priority;
    }

    // リスク評価がある場合、リスクレベルから優先度を判定
    if (notification.assessment?.overallLevel) {
      const riskLevel = notification.assessment.overallLevel;
      return this.mapRiskLevelToPriority(riskLevel);
    }

    // デフォルトは medium
    return 'medium';
  }

  /**
   * リスクレベルを優先度にマッピング
   */
  private mapRiskLevelToPriority(riskLevel: RiskLevel): NotificationPriority {
    const mapping: Record<RiskLevel, NotificationPriority> = {
      'very-high': 'urgent',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    return mapping[riskLevel];
  }

  /**
   * 優先度別のアクションを実行
   */
  private async executeActions(
    notification: HealthNotification,
    priority: NotificationPriority
  ): Promise<string[]> {
    const actions: string[] = [];

    switch (priority) {
      case 'urgent':
        actions.push('管理者への緊急通知を送信');
        actions.push('緊急対応フローを起動');
        actions.push('職員の健康状態を即座に確認');
        // TODO: 実際の緊急通知処理を実装
        break;

      case 'high':
        actions.push('担当者への高優先度通知を送信');
        actions.push('24時間以内の対応計画を作成');
        actions.push('フォローアップスケジュールを設定');
        // TODO: 実際の高優先度通知処理を実装
        break;

      case 'medium':
        actions.push('週次レポートに含める');
        actions.push('定期フォロー対象に追加');
        // TODO: 週次レポート追加処理を実装
        break;

      case 'low':
        actions.push('月次レポートに記録');
        actions.push('経過観察対象に追加');
        // TODO: 月次レポート追加処理を実装
        break;
    }

    // 通知タイプ別の処理
    if (notification.type === 'reexamination_required') {
      actions.push('再検査スケジュールの調整を開始');
    }

    if (notification.recommendations) {
      actions.push('健康改善推奨事項を職員に通知');
    }

    return actions;
  }

  /**
   * 処理ログを記録
   */
  private logProcessing(notification: HealthNotification, actions: string[]): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      staffId: notification.staffId,
      type: notification.type,
      priority: notification.metadata?.priority || 'unknown',
      actions,
      overallScore: notification.assessment?.overallScore,
      overallLevel: notification.assessment?.overallLevel
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(this.logsPath, logLine);
    } catch (error) {
      console.error('ログ記録エラー:', error);
    }
  }

  /**
   * エラーログを記録
   */
  private logError(message: string, error: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error instanceof Error ? error.message : String(error)
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(this.logsPath, logLine);
    } catch (err) {
      console.error('エラーログ記録失敗:', err);
    }

    console.error(message, error);
  }

  /**
   * 未処理の通知を一括処理
   */
  public async processAllPendingNotifications(): Promise<NotificationProcessResult[]> {
    const notifications = this.detectNewNotifications();
    const unprocessed = notifications.filter(n => !n.processed);

    const results: NotificationProcessResult[] = [];

    for (const notification of unprocessed) {
      const result = await this.processNotification(notification);
      results.push(result);
    }

    return results;
  }

  /**
   * 処理済み通知のクリア
   */
  public clearProcessedNotifications(): void {
    this.processedNotifications.clear();
  }

  /**
   * 統計情報を取得
   */
  public getStatistics() {
    const notifications = this.detectNewNotifications();
    const processed = notifications.filter(n => n.processed).length;
    const pending = notifications.filter(n => !n.processed).length;

    return {
      total: notifications.length,
      processed,
      pending
    };
  }
}

// シングルトンインスタンス
let handlerInstance: HealthNotificationHandler | null = null;

/**
 * ハンドラーインスタンスを取得
 */
export function getHealthNotificationHandler(): HealthNotificationHandler {
  if (!handlerInstance) {
    handlerInstance = new HealthNotificationHandler();
  }
  return handlerInstance;
}