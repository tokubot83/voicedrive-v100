/**
 * 健康通知ファイル監視サービス
 * mcp-shared/notifications フォルダを監視し、新規通知を自動処理
 */

import fs from 'fs';
import path from 'path';
import { getHealthNotificationHandler } from './healthNotificationHandler';
import { NotificationProcessResult } from '../types/health-notifications';

/**
 * ファイル監視設定
 */
interface WatcherConfig {
  pollingInterval?: number;  // ポーリング間隔（ミリ秒）デフォルト: 5000ms
  autoStart?: boolean;        // 自動開始フラグ（デフォルト: false）
}

/**
 * 健康通知ファイル監視クラス
 */
export class HealthNotificationWatcher {
  private notificationsPath: string;
  private handler: ReturnType<typeof getHealthNotificationHandler>;
  private watchInterval: NodeJS.Timeout | null = null;
  private isWatching: boolean = false;
  private pollingInterval: number;
  private processedFiles: Set<string>;
  private onNotificationCallback?: (result: NotificationProcessResult) => void;

  constructor(config: WatcherConfig = {}) {
    this.notificationsPath = path.join(process.cwd(), 'mcp-shared', 'notifications');
    this.handler = getHealthNotificationHandler();
    this.pollingInterval = config.pollingInterval || 5000;
    this.processedFiles = new Set<string>();

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(this.notificationsPath)) {
      fs.mkdirSync(this.notificationsPath, { recursive: true });
    }

    if (config.autoStart) {
      this.start();
    }
  }

  /**
   * 監視を開始
   */
  public start(): void {
    if (this.isWatching) {
      console.log('ファイル監視は既に実行中です');
      return;
    }

    console.log(`健康通知ファイルの監視を開始: ${this.notificationsPath}`);
    console.log(`ポーリング間隔: ${this.pollingInterval}ms`);

    this.isWatching = true;

    // 初回チェック
    this.checkForNewNotifications();

    // 定期的にチェック
    this.watchInterval = setInterval(() => {
      this.checkForNewNotifications();
    }, this.pollingInterval);
  }

  /**
   * 監視を停止
   */
  public stop(): void {
    if (!this.isWatching) {
      console.log('ファイル監視は実行されていません');
      return;
    }

    console.log('健康通知ファイルの監視を停止');

    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }

    this.isWatching = false;
  }

  /**
   * 新規通知をチェック
   */
  private async checkForNewNotifications(): Promise<void> {
    try {
      const files = fs.readdirSync(this.notificationsPath);
      const notificationFiles = files.filter(
        filename => filename.startsWith('health_notif_') && filename.endsWith('.json')
      );

      for (const filename of notificationFiles) {
        // 未処理のファイルのみ処理
        if (!this.processedFiles.has(filename)) {
          await this.processNewFile(filename);
        }
      }
    } catch (error) {
      console.error('通知チェックエラー:', error);
    }
  }

  /**
   * 新規ファイルを処理
   */
  private async processNewFile(filename: string): Promise<void> {
    const filePath = path.join(this.notificationsPath, filename);

    try {
      // ファイルが完全に書き込まれるまで少し待つ
      await this.waitForFileStability(filePath);

      console.log(`新規通知を検知: ${filename}`);

      const stats = fs.statSync(filePath);
      const notificationFile = {
        filename,
        path: filePath,
        createdAt: stats.birthtime,
        processed: false
      };

      // 通知を処理
      const result = await this.handler.processNotification(notificationFile);

      // 処理済みとしてマーク
      this.processedFiles.add(filename);

      console.log(`通知処理完了: ${filename}`);
      console.log(`  職員ID: ${result.staffId}`);
      console.log(`  アクション: ${result.actions.join(', ')}`);

      // コールバックがあれば実行
      if (this.onNotificationCallback) {
        this.onNotificationCallback(result);
      }
    } catch (error) {
      console.error(`通知処理エラー: ${filename}`, error);
    }
  }

  /**
   * ファイルが完全に書き込まれるまで待機
   */
  private async waitForFileStability(filePath: string, maxWait: number = 1000): Promise<void> {
    let lastSize = -1;
    let stableCount = 0;
    const checkInterval = 100;
    const requiredStableChecks = 3;

    return new Promise((resolve) => {
      const checkStability = () => {
        try {
          const stats = fs.statSync(filePath);
          const currentSize = stats.size;

          if (currentSize === lastSize) {
            stableCount++;
            if (stableCount >= requiredStableChecks) {
              resolve();
              return;
            }
          } else {
            stableCount = 0;
            lastSize = currentSize;
          }

          if (stableCount * checkInterval >= maxWait) {
            resolve();
            return;
          }

          setTimeout(checkStability, checkInterval);
        } catch (error) {
          resolve();
        }
      };

      checkStability();
    });
  }

  /**
   * 通知処理時のコールバックを設定
   */
  public onNotification(callback: (result: NotificationProcessResult) => void): void {
    this.onNotificationCallback = callback;
  }

  /**
   * 監視状態を取得
   */
  public getStatus() {
    return {
      isWatching: this.isWatching,
      notificationsPath: this.notificationsPath,
      pollingInterval: this.pollingInterval,
      processedCount: this.processedFiles.size
    };
  }

  /**
   * 処理済みファイルをクリア
   */
  public clearProcessedFiles(): void {
    this.processedFiles.clear();
    console.log('処理済みファイルリストをクリアしました');
  }

  /**
   * 即座にすべての未処理通知を処理
   */
  public async processAllNow(): Promise<NotificationProcessResult[]> {
    console.log('すべての未処理通知を処理します...');
    const results = await this.handler.processAllPendingNotifications();

    // 処理済みファイルを記録
    results.forEach(result => {
      if (result.success) {
        this.processedFiles.add(result.notificationId);
      }
    });

    console.log(`${results.length}件の通知を処理しました`);
    return results;
  }
}

// シングルトンインスタンス
let watcherInstance: HealthNotificationWatcher | null = null;

/**
 * 監視インスタンスを取得
 */
export function getHealthNotificationWatcher(config?: WatcherConfig): HealthNotificationWatcher {
  if (!watcherInstance) {
    watcherInstance = new HealthNotificationWatcher(config);
  }
  return watcherInstance;
}

/**
 * グローバル監視を開始（簡易メソッド）
 */
export function startGlobalHealthNotificationWatcher(config?: WatcherConfig): HealthNotificationWatcher {
  const watcher = getHealthNotificationWatcher(config);
  watcher.start();
  return watcher;
}