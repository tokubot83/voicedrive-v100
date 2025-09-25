/**
 * 医療職員管理システムAPIクライアント
 * Phase 2統合 - 権限レベル計算API
 */

interface CalculateLevelRequest {
  staffId: string;
}

interface CalculateLevelResponse {
  staffId: string;
  permissionLevel: number;
  details?: {
    baseLevel: number;
    adjustments: Array<{
      reason: string;
      value: number;
    }>;
    finalLevel: number;
  };
}

interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

class MedicalSystemAPI {
  private baseURL: string;
  private jwtToken: string | null = null;
  private timeout: number = 5000; // 5秒タイムアウト

  constructor() {
    // 開発環境では医療システムのローカルAPIを使用
    this.baseURL = import.meta.env.VITE_MEDICAL_API_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * JWTトークンを設定
   */
  setAuthToken(token: string): void {
    this.jwtToken = token;
  }

  /**
   * 権限レベル計算APIを呼び出し
   */
  async calculatePermissionLevel(staffId: string): Promise<CalculateLevelResponse> {
    if (!this.jwtToken) {
      throw new Error('認証トークンが設定されていません');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/calculate-level`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ staffId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.error?.message || `APIエラー: ${response.status}`);
      }

      const data: CalculateLevelResponse = await response.json();
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('APIタイムアウト: 5秒以内に応答がありませんでした');
      }

      throw error;
    }
  }

  /**
   * 複数のスタッフIDの権限レベルを一括取得
   */
  async calculateMultiplePermissionLevels(
    staffIds: string[]
  ): Promise<Map<string, CalculateLevelResponse>> {
    const results = new Map<string, CalculateLevelResponse>();

    // 並列で処理（最大5件ずつ）
    const batchSize = 5;
    for (let i = 0; i < staffIds.length; i += batchSize) {
      const batch = staffIds.slice(i, i + batchSize);
      const promises = batch.map(id =>
        this.calculatePermissionLevel(id)
          .then(result => ({ id, result }))
          .catch(error => ({ id, error }))
      );

      const batchResults = await Promise.allSettled(promises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled' && !result.value.error) {
          results.set(result.value.id, result.value.result);
        }
      }
    }

    return results;
  }

  /**
   * 接続テスト用メソッド
   */
  async testConnection(): Promise<boolean> {
    try {
      // テスト用のスタッフIDで接続確認
      const testStaffId = 'STAFF001';
      await this.calculatePermissionLevel(testStaffId);
      return true;
    } catch (error) {
      console.error('医療システムAPI接続エラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const medicalSystemAPI = new MedicalSystemAPI();

// テストデータ（開発環境用）
export const testStaffData = [
  { staffId: 'STAFF001', name: '山田花子', level: 1.0, role: '新人看護師' },
  { staffId: 'STAFF002', name: '佐藤太郎', level: 1.5, role: '看護師（2年目）' },
  { staffId: 'STAFF003', name: '田中美穂', level: 2.0, role: '若手看護師' },
  { staffId: 'STAFF004', name: '鈴木一郎', level: 2.5, role: '看護師（5年目）' },
  { staffId: 'STAFF005', name: '高橋由美', level: 3.5, role: '中堅看護師' },
  { staffId: 'STAFF006', name: '伊藤健二', level: 4.5, role: 'ベテラン看護師' },
  { staffId: 'STAFF007', name: '渡辺明', level: 5.0, role: '主任看護師' },
  { staffId: 'STAFF008', name: '中村幸子', level: 6.0, role: '副師長' },
  { staffId: 'STAFF009', name: '小林誠', level: 8.0, role: '師長' },
  { staffId: 'STAFF010', name: '加藤真理', level: 16.0, role: '戦略企画室長' }
];