/**
 * アプリアイコンバッジ更新サービス
 * PWAのアイコンに未読件数を表示
 *
 * 対応状況:
 * - Android Chrome: ✅ 完全対応
 * - PC Chrome/Edge: ✅ 対応
 * - iOS Safari: ❌ 未対応（エラーは出ない）
 */

interface BadgeUpdateOptions {
  updateInterval?: number; // 更新間隔（ミリ秒）
  enabled?: boolean; // バッジ機能の有効/無効
}

class AppBadgeService {
  private static instance: AppBadgeService;
  private updateInterval: number = 30000; // デフォルト30秒
  private intervalId: NodeJS.Timeout | null = null;
  private isSupported: boolean = false;
  private lastCount: number = 0;
  private enabled: boolean = true;

  private constructor() {
    this.checkSupport();
  }

  public static getInstance(): AppBadgeService {
    if (!AppBadgeService.instance) {
      AppBadgeService.instance = new AppBadgeService();
    }
    return AppBadgeService.instance;
  }

  /**
   * Badge APIのサポート確認
   */
  private checkSupport(): void {
    // Badge APIのサポート確認
    this.isSupported = 'setAppBadge' in navigator && 'clearAppBadge' in navigator;

    if (!this.isSupported) {
      console.log('Badge API is not supported on this device/browser');
    } else {
      console.log('Badge API is supported');
    }
  }

  /**
   * 未読通知数を取得（モックAPI）
   * 実際の実装では /api/notifications/unread-count などのエンドポイントから取得
   */
  private async fetchUnreadCount(): Promise<number> {
    try {
      // 実際のAPI実装例：
      // const response = await fetch('/api/notifications/unread-count', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // });
      // const data = await response.json();
      // return data.count || 0;

      // モック実装：ローカルストレージから取得
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;

      // 人事部お知らせの未読数も加算
      const hrAnnouncements = JSON.parse(localStorage.getItem('hrAnnouncements') || '[]');
      const hrUnreadCount = hrAnnouncements.filter((a: any) => !a.isRead).length;

      return unreadCount + hrUnreadCount;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * バッジを更新
   */
  public async updateBadge(count?: number): Promise<void> {
    if (!this.isSupported || !this.enabled) {
      return;
    }

    try {
      // カウントが指定されていない場合は取得
      const badgeCount = count !== undefined ? count : await this.fetchUnreadCount();

      // 前回と同じ値の場合はスキップ
      if (badgeCount === this.lastCount) {
        return;
      }

      this.lastCount = badgeCount;

      if (badgeCount > 0) {
        // バッジを設定（最大99まで表示）
        await (navigator as any).setAppBadge(Math.min(badgeCount, 99));
        console.log(`Badge updated: ${badgeCount}`);
      } else {
        // バッジをクリア
        await this.clearBadge();
      }
    } catch (error) {
      // Badge APIがサポートされていない場合もエラーにならないようにする
      console.log('Badge update failed (likely unsupported):', error);
    }
  }

  /**
   * バッジをクリア
   */
  public async clearBadge(): Promise<void> {
    if (!this.isSupported || !this.enabled) {
      return;
    }

    try {
      await (navigator as any).clearAppBadge();
      this.lastCount = 0;
      console.log('Badge cleared');
    } catch (error) {
      console.log('Badge clear failed:', error);
    }
  }

  /**
   * 定期更新を開始
   */
  public startPeriodicUpdate(options?: BadgeUpdateOptions): void {
    if (!this.isSupported) {
      return;
    }

    // オプション適用
    if (options?.updateInterval) {
      this.updateInterval = options.updateInterval;
    }
    if (options?.enabled !== undefined) {
      this.enabled = options.enabled;
    }

    // 既存のインターバルをクリア
    this.stopPeriodicUpdate();

    if (!this.enabled) {
      return;
    }

    // 即座に更新
    this.updateBadge();

    // 定期更新を設定
    this.intervalId = setInterval(() => {
      this.updateBadge();
    }, this.updateInterval);

    console.log(`Badge periodic update started (interval: ${this.updateInterval}ms)`);
  }

  /**
   * 定期更新を停止
   */
  public stopPeriodicUpdate(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Badge periodic update stopped');
    }
  }

  /**
   * 通知を既読にした時の処理
   */
  public async onNotificationRead(): Promise<void> {
    // 即座にバッジを更新
    await this.updateBadge();
  }

  /**
   * 新しい通知を受信した時の処理
   */
  public async onNewNotification(): Promise<void> {
    // 即座にバッジを更新
    const currentCount = await this.fetchUnreadCount();
    await this.updateBadge(currentCount);
  }

  /**
   * バッジ機能の有効/無効を切り替え
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.clearBadge();
      this.stopPeriodicUpdate();
    } else {
      this.startPeriodicUpdate();
    }
  }

  /**
   * サポート状況を取得
   */
  public getSupport(): { isSupported: boolean; platform: string } {
    const userAgent = navigator.userAgent.toLowerCase();
    let platform = 'unknown';

    if (/iphone|ipad|ipod/.test(userAgent)) {
      platform = 'ios';
    } else if (/android/.test(userAgent)) {
      platform = 'android';
    } else if (/windows|mac|linux/.test(userAgent)) {
      platform = 'desktop';
    }

    return {
      isSupported: this.isSupported,
      platform
    };
  }

  /**
   * デバッグ情報を取得
   */
  public getDebugInfo(): object {
    return {
      isSupported: this.isSupported,
      enabled: this.enabled,
      updateInterval: this.updateInterval,
      lastCount: this.lastCount,
      isRunning: this.intervalId !== null,
      platform: this.getSupport().platform
    };
  }
}

export default AppBadgeService;

// 使用例：
// import AppBadgeService from './services/AppBadgeService';
//
// const badgeService = AppBadgeService.getInstance();
//
// // 定期更新を開始（30秒ごと）
// badgeService.startPeriodicUpdate({
//   updateInterval: 30000,
//   enabled: true
// });
//
// // 通知を読んだ時
// badgeService.onNotificationRead();
//
// // 新しい通知を受信した時
// badgeService.onNewNotification();
//
// // バッジをクリア
// badgeService.clearBadge();
//
// // 定期更新を停止
// badgeService.stopPeriodicUpdate();