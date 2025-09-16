// Token自動更新サービス
import { TokenState } from '../types/medicalSystemIntegration';

class TokenRefreshService {
  private static instance: TokenRefreshService;
  private tokenState: TokenState;
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(token: string) => void> = [];

  private constructor() {
    this.tokenState = {
      accessToken: 'vd_prod_A8B9C2D3E4F5G6H7I8J9K0L1M2N3O4P5',
      refreshToken: 'refresh_vd_X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
      refreshThreshold: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22時間後（2時間前）
      isValid: true,
      autoRefreshEnabled: true
    };

    this.startAutoRefresh();
  }

  public static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  // 現在のToken取得
  public getCurrentToken(): string {
    return this.tokenState.accessToken;
  }

  // Token状態取得
  public getTokenState(): TokenState {
    return { ...this.tokenState };
  }

  // Token有効性チェック
  public isTokenValid(): boolean {
    const now = new Date();
    const expiresAt = new Date(this.tokenState.expiresAt);
    return now < expiresAt && this.tokenState.isValid;
  }

  // Token期限チェック（更新必要かどうか）
  public needsRefresh(): boolean {
    const now = new Date();
    const refreshThreshold = new Date(this.tokenState.refreshThreshold);
    return now >= refreshThreshold;
  }

  // Token更新リスナー追加
  public addTokenUpdateListener(listener: (token: string) => void): void {
    this.listeners.push(listener);
  }

  // Token更新リスナー削除
  public removeTokenUpdateListener(listener: (token: string) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 手動Token更新
  public async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('https://medical.system.local/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.tokenState.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData = await response.json();

      // Token状態更新
      this.tokenState = {
        ...this.tokenState,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken || this.tokenState.refreshToken,
        expiresAt: tokenData.expiresAt,
        refreshThreshold: new Date(new Date(tokenData.expiresAt).getTime() - 2 * 60 * 60 * 1000).toISOString(),
        isValid: true,
        lastRefreshed: new Date().toISOString()
      };

      // リスナー通知
      this.notifyListeners();

      console.log('✅ Token refreshed successfully');
      return true;

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.tokenState.isValid = false;

      // 認証エラー通知
      this.notifyAuthError();
      return false;
    }
  }

  // 自動更新開始
  private startAutoRefresh(): void {
    if (!this.tokenState.autoRefreshEnabled) return;

    // 既存タイマークリア
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // 次回更新時間計算
    const now = new Date().getTime();
    const refreshTime = new Date(this.tokenState.refreshThreshold).getTime();
    const delay = Math.max(refreshTime - now, 60000); // 最低1分後

    this.refreshTimer = setTimeout(async () => {
      if (this.needsRefresh()) {
        await this.refreshToken();
      }

      // 次回タイマー設定（1時間間隔でチェック）
      this.refreshTimer = setTimeout(() => this.startAutoRefresh(), 60 * 60 * 1000);
    }, delay);

    console.log(`🔄 Token auto-refresh scheduled in ${Math.round(delay / 1000 / 60)} minutes`);
  }

  // Token手動設定（開発・テスト用）
  public setToken(accessToken: string, expiresAt?: string): void {
    this.tokenState = {
      ...this.tokenState,
      accessToken,
      expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isValid: true
    };

    this.notifyListeners();
    this.startAutoRefresh();
  }

  // 自動更新有効/無効切り替え
  public setAutoRefreshEnabled(enabled: boolean): void {
    this.tokenState.autoRefreshEnabled = enabled;

    if (enabled) {
      this.startAutoRefresh();
    } else if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Token期限までの残り時間（分）
  public getTimeUntilExpiry(): number {
    const now = new Date().getTime();
    const expiresAt = new Date(this.tokenState.expiresAt).getTime();
    return Math.max(0, Math.floor((expiresAt - now) / (1000 * 60)));
  }

  // Token更新までの残り時間（分）
  public getTimeUntilRefresh(): number {
    const now = new Date().getTime();
    const refreshTime = new Date(this.tokenState.refreshThreshold).getTime();
    return Math.max(0, Math.floor((refreshTime - now) / (1000 * 60)));
  }

  // リスナー通知
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.tokenState.accessToken);
      } catch (error) {
        console.error('Token update listener error:', error);
      }
    });
  }

  // 認証エラー通知
  private notifyAuthError(): void {
    // カスタムイベント発行
    const event = new CustomEvent('tokenAuthError', {
      detail: {
        message: 'Token認証に失敗しました。再度ログインしてください。',
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  }

  // サービス停止
  public destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.listeners = [];
  }

  // デバッグ情報取得
  public getDebugInfo(): Record<string, any> {
    return {
      tokenState: this.tokenState,
      isValid: this.isTokenValid(),
      needsRefresh: this.needsRefresh(),
      timeUntilExpiry: this.getTimeUntilExpiry(),
      timeUntilRefresh: this.getTimeUntilRefresh(),
      hasActiveTimer: this.refreshTimer !== null,
      listenerCount: this.listeners.length
    };
  }
}

export default TokenRefreshService;