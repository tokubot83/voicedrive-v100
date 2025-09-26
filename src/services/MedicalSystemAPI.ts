/**
 * 医療職員管理システムAPIクライアント
 * Phase 2統合 - 権限レベル計算API
 */

interface CalculateLevelRequest {
  staffId: string;
  facilityId?: string;
}

interface CalculateLevelResponse {
  staffId: string;
  facilityId?: string;
  position?: string;
  permissionLevel: number;
  details?: {
    baseLevel: number;
    adjustments: Array<{
      reason: string;
      value: number;
    }>;
    facilityAdjustment?: number;
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
   * @param staffId 職員ID
   * @param facilityId 施設ID（オプション）
   */
  async calculatePermissionLevel(staffId: string, facilityId?: string): Promise<CalculateLevelResponse> {
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
        body: JSON.stringify({ staffId, facilityId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.error?.message || `APIエラー: ${response.status}`);
      }

      const rawData = await response.json();

      // 医療システムAPIのレスポンス形式をVoiceDrive形式に変換
      if (rawData.accountLevel !== undefined) {
        const data: CalculateLevelResponse = {
          staffId: rawData.staffId,
          permissionLevel: rawData.accountLevel,
          details: {
            baseLevel: rawData.breakdown?.baseLevel || rawData.accountLevel,
            adjustments: rawData.breakdown?.leaderBonus ? [
              { reason: '管理職ボーナス', value: rawData.breakdown.leaderBonus }
            ] : [],
            finalLevel: rawData.accountLevel
          }
        };
        return data;
      }

      return rawData;
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
    staffIds: string[],
    facilityId?: string
  ): Promise<Map<string, CalculateLevelResponse>> {
    const results = new Map<string, CalculateLevelResponse>();

    // 並列で処理（最大5件ずつ）
    const batchSize = 5;
    for (let i = 0; i < staffIds.length; i += batchSize) {
      const batch = staffIds.slice(i, i + batchSize);
      const promises = batch.map(id =>
        this.calculatePermissionLevel(id, facilityId)
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
   * 施設別役職マッピング取得API（新規）
   */
  async getFacilityPositionMapping(facilityId: string): Promise<any> {
    if (!this.jwtToken) {
      throw new Error('認証トークンが設定されていません');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/facilities/${facilityId}/position-mapping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.error?.message || `APIエラー: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('APIタイムアウト: 5秒以内に応答がありませんでした');
      }

      throw error;
    }
  }

  /**
   * 接続テスト用メソッド
   */
  async testConnection(facilityId?: string): Promise<boolean> {
    try {
      // テスト用のスタッフIDで接続確認
      const testStaffId = 'STAFF001';
      await this.calculatePermissionLevel(testStaffId, facilityId);
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
// 医療システム側で利用可能なスタッフIDのみを使用
export const testStaffData = [
  { staffId: 'STAFF001', name: '山田花子', expectedLevel: 1.0, role: '新人看護師' },
  // 以下は医療システム側で未実装のため、テスト時はSKIPされます
  { staffId: 'STAFF002', name: '佐藤太郎', expectedLevel: 1.5, role: '看護師（2年目）' },
  { staffId: 'STAFF003', name: '田中美穂', expectedLevel: 2.0, role: '若手看護師' },
  { staffId: 'STAFF005', name: '高橋由美', expectedLevel: 3.5, role: '中堅看護師' },
  { staffId: 'STAFF008', name: '中村幸子', expectedLevel: 6.0, role: '副師長' },
  { staffId: 'STAFF010', name: '加藤真理', expectedLevel: 16.0, role: '戦略企画室長' }
];