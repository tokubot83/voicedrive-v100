/**
 * JWT認証トークン管理サービス
 * VoiceDrive - 医療システム間のAPI認証
 */

interface TokenPayload {
  sub: string; // ユーザーID
  iss: string; // 発行者（VoiceDrive）
  aud: string; // 対象（医療システム）
  exp: number; // 有効期限
  iat: number; // 発行時刻
  staffId?: string;
  permissionLevel?: number;
}

class AuthTokenService {
  private tokenKey = 'voicedrive_jwt_token';
  private refreshTokenKey = 'voicedrive_refresh_token';

  /**
   * JWTトークンをローカルストレージに保存
   */
  saveToken(token: string, refreshToken?: string): void {
    localStorage.setItem(this.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * JWTトークンを取得
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * リフレッシュトークンを取得
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * トークンをクリア
   */
  clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * トークンの有効期限をチェック
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * JWTトークンをデコード（検証なし）
   * 注意: これは簡易的なデコードです。本番環境では公開鍵での検証が必要
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('トークンのデコードエラー:', error);
      return null;
    }
  }

  /**
   * 開発環境用のモックトークンを生成
   */
  generateMockToken(staffId: string, permissionLevel: number): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: TokenPayload = {
      sub: staffId,
      iss: 'VoiceDrive',
      aud: 'MedicalSystem',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24時間後
      iat: Math.floor(Date.now() / 1000),
      staffId,
      permissionLevel
    };

    // 簡易的なBase64エンコード（開発用）
    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // 署名は開発用のダミー
    const signature = 'development_signature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * 現在のユーザー情報を取得
   */
  getCurrentUserInfo(): { staffId: string; permissionLevel: number } | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const payload = this.decodeToken(token);
    if (!payload || !payload.staffId) {
      return null;
    }

    return {
      staffId: payload.staffId,
      permissionLevel: payload.permissionLevel || 1
    };
  }

  /**
   * トークンのリフレッシュ
   * TODO: 実際のリフレッシュエンドポイントと連携
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    // 開発環境では新しいモックトークンを生成
    if (import.meta.env.DEV) {
      const currentInfo = this.getCurrentUserInfo();
      if (currentInfo) {
        const newToken = this.generateMockToken(
          currentInfo.staffId,
          currentInfo.permissionLevel
        );
        this.saveToken(newToken);
        return newToken;
      }
    }

    // TODO: 本番環境では実際のリフレッシュAPIを呼び出す
    return null;
  }
}

// シングルトンインスタンス
export const authTokenService = new AuthTokenService();

// 開発環境用のテスト認証
export const setupTestAuth = () => {
  if (import.meta.env.DEV) {
    // デフォルトのテストユーザー（中堅看護師）
    const mockToken = authTokenService.generateMockToken('STAFF005', 3.5);
    authTokenService.saveToken(mockToken);
    console.log('📝 開発用テストトークンを設定しました');
    return mockToken;
  }
  return null;
};