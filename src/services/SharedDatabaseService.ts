// 職員カルテシステム共通データベース直接アクセスサービス
// 統合計画書 VoiceDrive_DB_Integration_Plan_20250831.md 準拠

import { InterviewBooking } from '../types/interview';

// 統合計画書で定義されたAPI連携インターフェース
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
  version: string;
}

interface UserSyncRequest {
  employeeId: string;
  lastSyncTimestamp?: string;
  includeProfile?: boolean;
  includePermissions?: boolean;
}

interface UserSyncResponse {
  employee_id: string;
  name: string;
  department: string;
  facility_id: string;
  permission_level: number;
  account_type: string;
  position: string;
  updated_at: string;
}

interface BookingRecordRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  facility: string;
  department: string;
  interview_type_id: string;
  interview_category_id?: string;
  booking_date: string;
  time_slot: {
    start: string;
    end: string;
  };
  status: string;
  urgency_level: string;
  interviewer_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuditLogRequest {
  action_type: string;
  resource_type: string;
  resource_id: string;
  actor_id: string;
  reason: string;
  previous_state?: any;
  new_state?: any;
  ip_address?: string;
  timestamp: string;
}

class SharedDatabaseService {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number = 30000; // 30秒タイムアウト
  private retryAttempts: number = 3;

  constructor() {
    // 統合計画書準拠の環境変数
    this.baseUrl = import.meta.env.VITE_SHARED_DB_API_URL || 'http://localhost:3002';
    this.apiKey = import.meta.env.VITE_SHARED_DB_API_KEY || '';
  }

  // ユーザーデータ同期（統合計画書: GET /api/users/sync）
  async syncUserData(request: UserSyncRequest): Promise<UserSyncResponse | null> {
    try {
      const response = await this.apiRequest<UserSyncResponse>('/api/users/sync', {
        method: 'POST',
        body: JSON.stringify(request)
      });

      if (response.success) {
        return response.data!;
      }

      console.error('ユーザーデータ同期失敗:', response.message);
      return null;
    } catch (error) {
      console.error('ユーザーデータ同期エラー:', error);
      return null;
    }
  }

  // バッチユーザー同期
  async batchSyncUsers(employeeIds: string[]): Promise<UserSyncResponse[]> {
    try {
      const response = await this.apiRequest<UserSyncResponse[]>('/api/users/batch-sync', {
        method: 'POST',
        body: JSON.stringify({ employee_ids: employeeIds })
      });

      return response.success ? response.data! : [];
    } catch (error) {
      console.error('バッチユーザー同期エラー:', error);
      return [];
    }
  }

  // 面談予約記録（共通DB保存）
  async recordInterviewBooking(booking: InterviewBooking): Promise<boolean> {
    try {
      const bookingRecord: BookingRecordRequest = {
        id: booking.id,
        employee_id: booking.employeeId,
        employee_name: booking.employeeName,
        facility: booking.facility,
        department: booking.department,
        interview_type_id: booking.interviewType,
        interview_category_id: booking.interviewCategory,
        booking_date: booking.bookingDate.toISOString().split('T')[0],
        time_slot: {
          start: booking.timeSlot.startTime,
          end: booking.timeSlot.endTime
        },
        status: booking.status,
        urgency_level: booking.urgencyLevel,
        interviewer_id: booking.interviewerId,
        created_at: booking.createdAt.toISOString(),
        updated_at: booking.lastModified?.toISOString() || booking.createdAt.toISOString()
      };

      const response = await this.apiRequest('/api/interview-bookings/record', {
        method: 'POST',
        body: JSON.stringify(bookingRecord)
      });

      return response.success;
    } catch (error) {
      console.error('面談予約記録エラー:', error);
      return false;
    }
  }

  // 面談予約状態更新
  async updateBookingStatus(bookingId: string, status: string, updatedBy: string): Promise<boolean> {
    try {
      const response = await this.apiRequest('/api/interview-bookings/update-status', {
        method: 'PATCH',
        body: JSON.stringify({
          booking_id: bookingId,
          status,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
      });

      return response.success;
    } catch (error) {
      console.error('予約状態更新エラー:', error);
      return false;
    }
  }

  // 監査ログ記録（統合計画書: POST /api/audit/log）
  async logAuditAction(request: AuditLogRequest): Promise<boolean> {
    try {
      const response = await this.apiRequest('/api/audit/log', {
        method: 'POST',
        body: JSON.stringify(request)
      });

      return response.success;
    } catch (error) {
      console.error('監査ログ記録エラー:', error);
      return false;
    }
  }

  // 組織情報同期
  async syncOrganizationData(): Promise<{
    facilities: any[];
    departments: any[];
    positions: any[];
  }> {
    try {
      const response = await this.apiRequest('/api/organization/sync', {
        method: 'GET'
      });

      return response.success ? response.data! : {
        facilities: [],
        departments: [],
        positions: []
      };
    } catch (error) {
      console.error('組織情報同期エラー:', error);
      return {
        facilities: [],
        departments: [],
        positions: []
      };
    }
  }

  // 統計データ記録
  async recordStatistics(statisticType: string, period: string, values: any): Promise<boolean> {
    try {
      const response = await this.apiRequest('/api/statistics/record', {
        method: 'POST',
        body: JSON.stringify({
          statistic_type: statisticType,
          period,
          values,
          calculated_at: new Date().toISOString()
        })
      });

      return response.success;
    } catch (error) {
      console.error('統計データ記録エラー:', error);
      return false;
    }
  }

  // 面談タイプ・カテゴリ同期
  async syncInterviewConfigurations(): Promise<{
    types: any[];
    categories: any[];
  }> {
    try {
      const response = await this.apiRequest('/api/interview-config/sync', {
        method: 'GET'
      });

      return response.success ? response.data! : {
        types: [],
        categories: []
      };
    } catch (error) {
      console.error('面談設定同期エラー:', error);
      return {
        types: [],
        categories: []
      };
    }
  }

  // 共通DBヘルスチェック
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.apiRequest('/api/health', {
        method: 'GET',
        timeout: 5000 // 5秒でタイムアウト
      });

      return response.success;
    } catch (error) {
      console.error('共通DBヘルスチェックエラー:', error);
      return false;
    }
  }

  // データバックアップ状態確認
  async checkBackupStatus(): Promise<{
    lastBackup: string;
    nextBackup: string;
    status: 'healthy' | 'warning' | 'error';
  }> {
    try {
      const response = await this.apiRequest('/api/backup/status', {
        method: 'GET'
      });

      return response.success ? response.data! : {
        lastBackup: '',
        nextBackup: '',
        status: 'error'
      };
    } catch (error) {
      console.error('バックアップ状態確認エラー:', error);
      return {
        lastBackup: '',
        nextBackup: '',
        status: 'error'
      };
    }
  }

  // プライベートメソッド: 共通API要求処理
  private async apiRequest<T = any>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {},
    attempt = 1
  ): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || this.timeout
    );

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-Type': 'voicedrive-mobile',
          'X-Client-Version': '1.0.0',
          'X-Integration-Mode': 'hybrid-mcp-api',
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt < this.retryAttempts && !controller.signal.aborted) {
        console.warn(`API要求失敗、リトライ中... (${attempt}/${this.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.apiRequest<T>(endpoint, options, attempt + 1);
      }

      throw error;
    }
  }

  // 接続テスト
  async testConnection(): Promise<{
    connected: boolean;
    latency: number;
    version: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await this.apiRequest('/api/ping', {
        method: 'GET',
        timeout: 10000
      });

      const latency = Date.now() - startTime;

      return {
        connected: response.success,
        latency,
        version: response.version || 'unknown'
      };
    } catch (error) {
      return {
        connected: false,
        latency: -1,
        version: 'unknown'
      };
    }
  }

  // レート制限情報取得
  async getRateLimitInfo(): Promise<{
    remaining: number;
    resetTime: string;
    limit: number;
  }> {
    try {
      const response = await this.apiRequest('/api/rate-limit', {
        method: 'GET'
      });

      return response.success ? response.data! : {
        remaining: 0,
        resetTime: '',
        limit: 0
      };
    } catch (error) {
      console.error('レート制限情報取得エラー:', error);
      return {
        remaining: 0,
        resetTime: '',
        limit: 0
      };
    }
  }
}

export const sharedDatabaseService = new SharedDatabaseService();
export default sharedDatabaseService;