/**
 * 医療職員管理システムAPIクライアント
 * Phase 2統合 - 権限レベル計算API
 */

interface CalculateLevelRequest {
  staffId: string;
  facilityId?: string;
  // 25レベル対応の追加パラメータ
  position?: string;
  experienceYears?: number;
  canPerformLeaderDuty?: boolean;
  profession?: string;  // nursing, medical, administrative, etc.
}

interface CalculateLevelResponse {
  staffId: string;
  facilityId?: string;
  position?: string;
  permissionLevel: number;  // 1-18, 1.5-4.5, 97-99
  accountType?: string;      // NEW_STAFF, JUNIOR_STAFF, etc.
  canPerformLeaderDuty?: boolean;
  professionCategory?: string;
  details?: {
    baseLevel: number;
    adjustments: Array<{
      reason: string;
      value: number;
    }>;
    leaderDutyAdjustment?: number;  // 看護職リーダー可の場合+0.5
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
   * 権限レベル計算APIを呼び出し（25レベル対応）
   * @param request 権限レベル計算リクエスト
   */
  async calculatePermissionLevel(request: CalculateLevelRequest): Promise<CalculateLevelResponse> {
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
        body: JSON.stringify(request),
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
        const adjustments: Array<{ reason: string; value: number }> = [];

        if (rawData.breakdown?.leaderBonus) {
          adjustments.push({ reason: '管理職ボーナス', value: rawData.breakdown.leaderBonus });
        }

        if (rawData.breakdown?.leaderDutyAdjustment) {
          adjustments.push({ reason: 'リーダー業務可（+0.5）', value: rawData.breakdown.leaderDutyAdjustment });
        }

        if (rawData.breakdown?.facilityAdjustment) {
          adjustments.push({ reason: '施設別調整', value: rawData.breakdown.facilityAdjustment });
        }

        const data: CalculateLevelResponse = {
          staffId: rawData.staffId,
          facilityId: rawData.facilityId,
          position: rawData.position,
          permissionLevel: rawData.accountLevel,
          accountType: rawData.accountType,
          canPerformLeaderDuty: rawData.canPerformLeaderDuty,
          professionCategory: rawData.professionCategory,
          details: {
            baseLevel: rawData.breakdown?.baseLevel || rawData.accountLevel,
            adjustments,
            leaderDutyAdjustment: rawData.breakdown?.leaderDutyAdjustment,
            facilityAdjustment: rawData.breakdown?.facilityAdjustment,
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
   * 権限レベル計算（簡易版、後方互換性のため）
   * @deprecated 新しいcalculatePermissionLevel(request)を使用してください
   */
  async calculatePermissionLevelSimple(staffId: string, facilityId?: string): Promise<CalculateLevelResponse> {
    return this.calculatePermissionLevel({ staffId, facilityId });
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
   * 権限レベル計算（フォールバック機能付き）
   * API障害時は簡易計算で暫定レベルを返す
   * @param request 権限レベル計算リクエスト
   * @param useFallback フォールバック使用フラグ（デフォルト: true）
   */
  async calculatePermissionLevelWithFallback(
    request: CalculateLevelRequest,
    useFallback: boolean = true
  ): Promise<CalculateLevelResponse> {
    try {
      return await this.calculatePermissionLevel(request);
    } catch (error) {
      console.error('医療システムAPI呼び出しエラー:', error);

      if (!useFallback) {
        throw error;
      }

      console.warn('フォールバック機能: 簡易計算で暫定レベルを返します');
      return this.fallbackCalculateLevel(request);
    }
  }

  /**
   * フォールバック用簡易権限レベル計算
   * @param request 権限レベル計算リクエスト
   */
  private fallbackCalculateLevel(request: CalculateLevelRequest): CalculateLevelResponse {
    const { staffId, position, experienceYears, canPerformLeaderDuty, profession, facilityId } = request;

    // 簡易計算ロジック
    let baseLevel = 1; // デフォルト: 新人

    // 経験年数ベースの判定
    if (experienceYears !== undefined) {
      if (experienceYears >= 11) baseLevel = 4; // ベテラン
      else if (experienceYears >= 4) baseLevel = 3; // 中堅
      else if (experienceYears >= 2) baseLevel = 2; // 若手
      else baseLevel = 1; // 新人
    }

    // 役職ベースの判定（経験年数より優先）
    if (position) {
      const positionLevelMap: Record<string, number> = {
        '副主任': 5,
        '主任': 6,
        '統括主任': 7, // 立神リハビリ専用
        '副師長': 7,
        '副科長': 7,
        '師長': 8,
        '科長': 8,
        '課長': 8,
        '副部長': 9,
        '部長': 10,
        '医局長': 10,
        '事務長': 11,
        '副院長': 12,
        '院長': 13,
        '施設長': 13,
        '人事部門員': 14,
        '人事部門長': 15,
        '戦略企画部門員': 16,
        '戦略企画部門長': 17,
        '理事': 18,
      };

      baseLevel = positionLevelMap[position] || baseLevel;
    }

    // 看護職リーダー可の場合+0.5
    let finalLevel = baseLevel;
    let leaderDutyAdjustment = 0;

    if (profession === 'nursing' && canPerformLeaderDuty && baseLevel >= 1 && baseLevel <= 4) {
      leaderDutyAdjustment = 0.5;
      finalLevel = baseLevel + 0.5;
    }

    // アカウントタイプの推定
    const accountType = this.inferAccountType(finalLevel, canPerformLeaderDuty);

    return {
      staffId,
      facilityId,
      position,
      permissionLevel: finalLevel,
      accountType,
      canPerformLeaderDuty: canPerformLeaderDuty || false,
      professionCategory: profession,
      details: {
        baseLevel,
        adjustments: leaderDutyAdjustment > 0 ? [
          { reason: 'リーダー業務可（フォールバック）', value: leaderDutyAdjustment }
        ] : [],
        leaderDutyAdjustment,
        finalLevel
      }
    };
  }

  /**
   * レベルからアカウントタイプを推定
   */
  private inferAccountType(level: number, canPerformLeaderDuty?: boolean): string {
    const levelMap: Record<number, string> = {
      1: 'NEW_STAFF',
      1.5: 'NEW_STAFF_LEADER',
      2: 'JUNIOR_STAFF',
      2.5: 'JUNIOR_STAFF_LEADER',
      3: 'MIDLEVEL_STAFF',
      3.5: 'MIDLEVEL_STAFF_LEADER',
      4: 'VETERAN_STAFF',
      4.5: 'VETERAN_STAFF_LEADER',
      5: 'DEPUTY_CHIEF',
      6: 'CHIEF',
      7: 'DEPUTY_MANAGER',
      8: 'MANAGER',
      9: 'DEPUTY_DIRECTOR',
      10: 'DIRECTOR',
      11: 'ADMINISTRATIVE_DIRECTOR',
      12: 'VICE_PRESIDENT',
      13: 'PRESIDENT',
      14: 'HR_STAFF',
      15: 'HR_MANAGER',
      16: 'STRATEGIC_PLANNING_STAFF',
      17: 'STRATEGIC_PLANNING_MANAGER',
      18: 'BOARD_MEMBER',
    };

    return levelMap[level] || 'NEW_STAFF';
  }

  /**
   * 接続テスト用メソッド
   */
  async testConnection(facilityId?: string): Promise<boolean> {
    try {
      // テスト用のスタッフIDで接続確認
      await this.calculatePermissionLevel({ staffId: 'STAFF001', facilityId });
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