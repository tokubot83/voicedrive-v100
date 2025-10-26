/**
 * 医療システムAPIクライアント
 * Phase 2.5, 2.6で使用
 *
 * 最終更新: 2025-10-26
 * 参照:
 *   - SystemMonitorPage_VoiceDrive回答書_20251026.md (Phase 2.5)
 *   - UserManagementPage_VoiceDrive回答_20251026.md (Phase 2.6)
 */

import axios, { AxiosError } from 'axios';
import {
  MedicalSystemWebhookStats,
  MedicalSystemInterviewStats,
  MedicalSystemApiResponse,
  MedicalSystemApiError
} from '../types/medicalSystem.types';

// Phase 2.6: UserManagementPage用の型定義
export interface MedicalSystemEmployee {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position?: string;
  professionCategory?: string;
  role: string;
  permissionLevel: number;
  hireDate: string;
  isActive: boolean;
  facilityId: string;
  avatar?: string;
  phone?: string;
  extension?: string;
  birthDate?: string;
  yearsOfService: number;
  updatedAt: string;
}

export interface MedicalSystemEmployeesResponse {
  employees: MedicalSystemEmployee[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export interface MedicalSystemJWTResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const MEDICAL_SYSTEM_BASE_URL = process.env.MEDICAL_SYSTEM_API_URL || '';
const API_KEY = process.env.MEDICAL_SYSTEM_API_KEY || '';

if (!MEDICAL_SYSTEM_BASE_URL) {
  console.warn('[MedicalSystemClient] MEDICAL_SYSTEM_API_URL is not set');
}

if (!API_KEY) {
  console.warn('[MedicalSystemClient] MEDICAL_SYSTEM_API_KEY is not set - API calls will fail');
}

export class MedicalSystemClient {
  // Phase 2.6: JWT認証用のトークンキャッシュ
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  private static axiosInstance = axios.create({
    baseURL: MEDICAL_SYSTEM_BASE_URL,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-VoiceDrive-System-ID': 'voicedrive-v100',
      'Content-Type': 'application/json'
    },
    timeout: 10000  // 10秒
  });

  /**
   * Webhook送信統計を取得
   * API 1: GET /api/voicedrive/webhook-stats
   *
   * @param startDate - 開始日時（ISO 8601形式、オプション）
   * @param endDate - 終了日時（ISO 8601形式、オプション）
   * @returns Webhook送信統計
   */
  static async getWebhookStats(
    startDate?: string,
    endDate?: string
  ): Promise<MedicalSystemWebhookStats> {
    try {
      const response = await this.axiosInstance.get<MedicalSystemApiResponse<MedicalSystemWebhookStats>>(
        '/api/voicedrive/webhook-stats',
        {
          params: { startDate, endDate }
        }
      );

      console.log('[MedicalSystemClient.getWebhookStats] 成功:', {
        sent24h: response.data.data.sent24h,
        succeeded: response.data.data.succeeded,
        failed: response.data.data.failed
      });

      return response.data.data;
    } catch (error) {
      this.handleError('getWebhookStats', error);
      throw error;
    }
  }

  /**
   * 面談実施統計を取得
   * API 2: GET /api/voicedrive/interview-completion-stats
   *
   * @param startDate - 開始日時（ISO 8601形式、オプション）
   * @param endDate - 終了日時（ISO 8601形式、オプション）
   * @returns 面談実施統計
   */
  static async getInterviewStats(
    startDate?: string,
    endDate?: string
  ): Promise<MedicalSystemInterviewStats> {
    try {
      const response = await this.axiosInstance.get<MedicalSystemApiResponse<MedicalSystemInterviewStats>>(
        '/api/voicedrive/interview-completion-stats',
        {
          params: { startDate, endDate }
        }
      );

      console.log('[MedicalSystemClient.getInterviewStats] 成功:', {
        totalScheduled: response.data.data.totalScheduled,
        actuallyCompleted: response.data.data.actuallyCompleted,
        completionRate: response.data.data.completionRate
      });

      return response.data.data;
    } catch (error) {
      this.handleError('getInterviewStats', error);
      throw error;
    }
  }

  /**
   * エラーハンドリング
   *
   * @param method - メソッド名
   * @param error - エラーオブジェクト
   */
  private static handleError(method: string, error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<MedicalSystemApiError>;

      if (axiosError.response) {
        // サーバーエラー（4xx, 5xx）
        console.error(`[MedicalSystemClient.${method}] APIエラー:`, {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          error: axiosError.response.data
        });

        if (axiosError.response.status === 401) {
          console.error(`[MedicalSystemClient.${method}] 認証エラー: APIキーが無効です`);
        } else if (axiosError.response.status === 429) {
          console.error(`[MedicalSystemClient.${method}] レート制限超過: しばらく待ってから再試行してください`);
        }
      } else if (axiosError.request) {
        // ネットワークエラー（タイムアウト等）
        console.error(`[MedicalSystemClient.${method}] ネットワークエラー:`, {
          message: axiosError.message,
          code: axiosError.code
        });

        if (axiosError.code === 'ECONNABORTED') {
          console.error(`[MedicalSystemClient.${method}] タイムアウト: 10秒以内に応答がありませんでした`);
        } else if (axiosError.code === 'ENOTFOUND') {
          console.error(`[MedicalSystemClient.${method}] DNS解決エラー: ${MEDICAL_SYSTEM_BASE_URL} が見つかりません`);
        }
      } else {
        // その他のエラー
        console.error(`[MedicalSystemClient.${method}] リクエスト設定エラー:`, axiosError.message);
      }
    } else {
      console.error(`[MedicalSystemClient.${method}] 予期しないエラー:`, error);
    }
  }

  /**
   * 健全性チェック
   * 医療システムAPIが正常に動作しているか確認
   *
   * @returns 健全性チェック結果
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/api/health', {
        timeout: 5000  // 5秒
      });

      return response.status === 200;
    } catch (error) {
      console.error('[MedicalSystemClient.healthCheck] 健全性チェック失敗:', error);
      return false;
    }
  }

  // ==========================================
  // Phase 2.6: UserManagementPage用メソッド
  // ==========================================

  /**
   * JWTアクセストークンを取得（キャッシュあり）
   *
   * @returns JWTアクセストークン
   */
  private static async getAccessToken(): Promise<string> {
    // トークンが有効期限内なら再利用
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // トークン取得
    const employeeId = process.env.VITE_MEDICAL_ADMIN_EMPLOYEE_ID || '';
    const password = process.env.VITE_MEDICAL_ADMIN_PASSWORD || '';

    if (!employeeId || !password) {
      throw new Error('MEDICAL_ADMIN_EMPLOYEE_ID または MEDICAL_ADMIN_PASSWORD が設定されていません');
    }

    try {
      const response = await this.axiosInstance.post<MedicalSystemJWTResponse>(
        '/api/auth/token',
        {
          employeeId,
          password
        }
      );

      this.accessToken = response.data.accessToken;
      // 有効期限の90%でリフレッシュ（例: 1時間なら54分で再取得）
      this.tokenExpiry = Date.now() + (response.data.expiresIn * 1000 * 0.9);

      console.log('[MedicalSystemClient.getAccessToken] JWTトークン取得成功');

      return this.accessToken;
    } catch (error) {
      this.handleError('getAccessToken', error);
      throw error;
    }
  }

  /**
   * API-1: 全職員取得API
   * GET /api/v2/employees
   *
   * @param params - クエリパラメータ（page, limit, department等）
   * @returns 職員リストとページネーション情報
   */
  static async getAllEmployees(params?: {
    page?: number;
    limit?: number;
    department?: string;
    isActive?: boolean;
  }): Promise<MedicalSystemEmployeesResponse> {
    try {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get<MedicalSystemEmployeesResponse>(
        '/api/v2/employees',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            page: params?.page || 1,
            limit: params?.limit || 100,
            ...params
          }
        }
      );

      console.log('[MedicalSystemClient.getAllEmployees] 成功:', {
        取得件数: response.data.employees.length,
        totalCount: response.data.pagination.totalCount,
        page: response.data.pagination.page
      });

      return response.data;
    } catch (error) {
      this.handleError('getAllEmployees', error);
      throw error;
    }
  }

  /**
   * API-2: 個別職員取得API
   * GET /api/v2/employees/{employeeId}
   *
   * @param employeeId - 職員ID（例: "EMP-2025-001"）
   * @returns 職員詳細情報
   */
  static async getEmployee(employeeId: string): Promise<MedicalSystemEmployee> {
    try {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get<MedicalSystemEmployee>(
        `/api/v2/employees/${employeeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[MedicalSystemClient.getEmployee] 成功:', {
        employeeId: response.data.employeeId,
        name: response.data.name,
        department: response.data.department
      });

      return response.data;
    } catch (error) {
      this.handleError('getEmployee', error);
      throw error;
    }
  }
}
