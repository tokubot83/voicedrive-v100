/**
 * MedicalSystemService
 *
 * 医療職員管理システムとのAPI連携サービス
 *
 * Phase 1実装:
 * - 部門マスタ取得（施設情報含む）
 * - キャッシュ機能（24時間）
 * - エラーハンドリング
 */

export interface DepartmentMaster {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  facilityId: string;
  facilityCode: string;
  facilityName: string;
  parentDepartmentId: string | null;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCount {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  count: number;
}

export interface EmployeeCountResponse {
  totalCount: number;
  byDepartment: EmployeeCount[];
}

// 環境変数から取得
const MEDICAL_SYSTEM_URL = process.env.NEXT_PUBLIC_MEDICAL_SYSTEM_URL || 'http://localhost:3002';
const MEDICAL_SYSTEM_API_KEY = process.env.MEDICAL_SYSTEM_API_KEY || '';

// キャッシュ用
let departmentCache: {
  data: DepartmentMaster[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

/**
 * 医療システムから部門マスタを取得
 *
 * @param facilityId - 施設IDでフィルター（オプション）
 * @param useCache - キャッシュを使用するか（デフォルト: true）
 * @returns 部門マスタ配列
 */
export async function fetchDepartmentMaster(
  facilityId?: string,
  useCache: boolean = true
): Promise<DepartmentMaster[]> {
  try {
    // キャッシュチェック
    if (useCache && departmentCache) {
      const now = Date.now();
      if (now - departmentCache.timestamp < CACHE_DURATION) {
        console.log('[MedicalSystemService] Using cached department master');

        // facilityIdフィルター
        if (facilityId) {
          return departmentCache.data.filter(d => d.facilityId === facilityId);
        }
        return departmentCache.data;
      }
    }

    // API URL構築
    const url = facilityId
      ? `${MEDICAL_SYSTEM_URL}/api/v2/departments?facilityId=${facilityId}`
      : `${MEDICAL_SYSTEM_URL}/api/v2/departments`;

    console.log('[MedicalSystemService] Fetching department master from:', url);

    // API呼び出し
    const response = await fetch(url, {
      headers: {
        'X-API-Key': MEDICAL_SYSTEM_API_KEY,
        'Content-Type': 'application/json'
      },
      // タイムアウト設定（10秒）
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch departments: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    const departments: DepartmentMaster[] = result.data || [];

    // キャッシュ更新（facilityIdがない場合のみ）
    if (!facilityId) {
      departmentCache = {
        data: departments,
        timestamp: Date.now()
      };
      console.log('[MedicalSystemService] Department master cached');
    }

    return departments;
  } catch (error) {
    console.error('[MedicalSystemService] Error fetching department master:', error);

    // キャッシュがあれば返す（エラー時のフォールバック）
    if (departmentCache) {
      console.warn('[MedicalSystemService] Using stale cache due to error');
      if (facilityId) {
        return departmentCache.data.filter(d => d.facilityId === facilityId);
      }
      return departmentCache.data;
    }

    // キャッシュもない場合は空配列
    return [];
  }
}

/**
 * 部署IDから施設名を取得
 *
 * @param departmentId - 部署ID
 * @returns 施設名（見つからない場合は'未設定'）
 */
export async function getFacilityFromDepartment(
  departmentId: string
): Promise<string> {
  try {
    const departments = await fetchDepartmentMaster();
    const department = departments.find(d => d.departmentId === departmentId);
    return department?.facilityName || '未設定';
  } catch (error) {
    console.error('[MedicalSystemService] Error getting facility:', error);
    return '未設定';
  }
}

/**
 * 部署名から施設名を取得
 *
 * @param departmentName - 部署名
 * @returns 施設名（見つからない場合は'未設定'）
 */
export async function getFacilityFromDepartmentName(
  departmentName: string
): Promise<string> {
  try {
    const departments = await fetchDepartmentMaster();
    const department = departments.find(d => d.departmentName === departmentName);
    return department?.facilityName || '未設定';
  } catch (error) {
    console.error('[MedicalSystemService] Error getting facility:', error);
    return '未設定';
  }
}

/**
 * 複数部署の施設名を一括取得
 *
 * @param departmentNames - 部署名の配列
 * @returns 部署名をキーとした施設名マップ
 */
export async function getFacilitiesFromDepartments(
  departmentNames: string[]
): Promise<Record<string, string>> {
  try {
    const departments = await fetchDepartmentMaster();
    const facilityMap: Record<string, string> = {};

    for (const deptName of departmentNames) {
      const department = departments.find(d => d.departmentName === deptName);
      facilityMap[deptName] = department?.facilityName || '未設定';
    }

    return facilityMap;
  } catch (error) {
    console.error('[MedicalSystemService] Error getting facilities:', error);
    return Object.fromEntries(departmentNames.map(name => [name, '未設定']));
  }
}

/**
 * 医療システムから職員総数を取得（参考）
 *
 * @param facilityId - 施設IDでフィルター（オプション）
 * @returns 職員総数レスポンス
 */
export async function fetchEmployeeCount(
  facilityId?: string
): Promise<EmployeeCountResponse | null> {
  try {
    const url = facilityId
      ? `${MEDICAL_SYSTEM_URL}/api/v2/employees/count?facilityId=${facilityId}`
      : `${MEDICAL_SYSTEM_URL}/api/v2/employees/count`;

    console.log('[MedicalSystemService] Fetching employee count from:', url);

    const response = await fetch(url, {
      headers: {
        'X-API-Key': MEDICAL_SYSTEM_API_KEY,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch employee count: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('[MedicalSystemService] Error fetching employee count:', error);
    return null;
  }
}

/**
 * 部門マスタと職員数を統合して取得
 *
 * @param facilityId - 施設IDでフィルター（オプション）
 * @returns 職員数付き部門マスタ
 */
export async function getDepartmentWithEmployeeCount(
  facilityId?: string
): Promise<Array<DepartmentMaster & { employeeCount: number }>> {
  try {
    // 並列実行
    const [departments, employeeCounts] = await Promise.all([
      fetchDepartmentMaster(facilityId),
      fetchEmployeeCount(facilityId)
    ]);

    // 職員数マップを作成
    const countMap = new Map<string, number>();
    if (employeeCounts?.byDepartment) {
      for (const dept of employeeCounts.byDepartment) {
        countMap.set(dept.departmentId, dept.count);
      }
    }

    // 統合
    return departments.map(dept => ({
      ...dept,
      employeeCount: countMap.get(dept.departmentId) || 0
    }));
  } catch (error) {
    console.error('[MedicalSystemService] Error getting departments with count:', error);
    return [];
  }
}

/**
 * キャッシュをクリア
 */
export function clearDepartmentCache(): void {
  departmentCache = null;
  console.log('[MedicalSystemService] Cache cleared');
}

/**
 * API接続テスト
 *
 * @returns 接続成功時true
 */
export async function testConnection(): Promise<boolean> {
  try {
    const url = `${MEDICAL_SYSTEM_URL}/api/v2/departments`;
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'X-API-Key': MEDICAL_SYSTEM_API_KEY
      },
      signal: AbortSignal.timeout(5000)
    });

    return response.ok;
  } catch (error) {
    console.error('[MedicalSystemService] Connection test failed:', error);
    return false;
  }
}

/**
 * Rate Limit情報を取得
 *
 * @returns Rate Limit情報
 */
export async function getRateLimitInfo(): Promise<{
  limit: number;
  remaining: number;
  reset: number;
} | null> {
  try {
    const url = `${MEDICAL_SYSTEM_URL}/api/v2/departments`;
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'X-API-Key': MEDICAL_SYSTEM_API_KEY
      }
    });

    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset)
      };
    }

    return null;
  } catch (error) {
    console.error('[MedicalSystemService] Error getting rate limit info:', error);
    return null;
  }
}
