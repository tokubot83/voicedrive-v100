import axios from 'axios';
import { 
  AppealRequest, 
  AppealResponse, 
  AppealRecord,
  AppealStatus
} from '../types/appeal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AppealService {
  private apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/appeals`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // リクエストインターセプター
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 認証エラーの処理
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 異議申し立てを送信
   */
  async submitAppeal(request: AppealRequest): Promise<AppealResponse> {
    try {
      // バリデーション
      if (request.appealReason.length < 100) {
        throw new Error('申し立て理由は100文字以上入力してください');
      }

      const response = await this.apiClient.post<AppealResponse>('/submit', request);
      return response.data;
    } catch (error: any) {
      console.error('異議申し立て送信エラー:', error);
      throw {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'SUBMIT_ERROR',
          message: error.response?.data?.error?.message || '異議申し立ての送信に失敗しました',
          details: error.response?.data?.error?.details
        }
      };
    }
  }

  /**
   * 異議申し立て一覧を取得
   */
  async getAppeals(employeeId?: string): Promise<AppealRecord[]> {
    try {
      const params = employeeId ? { employeeId } : {};
      const response = await this.apiClient.get<{ data: AppealRecord[] }>('/submit', { params });
      return response.data.data || [];
    } catch (error: any) {
      console.error('異議申し立て一覧取得エラー:', error);
      return [];
    }
  }

  /**
   * 特定の異議申し立てステータスを取得
   */
  async getAppealStatus(appealId: string): Promise<AppealRecord | null> {
    try {
      const response = await this.apiClient.get<{ data: AppealRecord }>(`/status/${appealId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('ステータス取得エラー:', error);
      return null;
    }
  }

  /**
   * 異議申し立てに追加情報を提出
   */
  async updateAppeal(appealId: string, additionalInfo: Partial<AppealRequest>): Promise<AppealResponse> {
    try {
      const response = await this.apiClient.put<AppealResponse>('/submit', {
        appealId,
        ...additionalInfo
      });
      return response.data;
    } catch (error: any) {
      console.error('更新エラー:', error);
      throw {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: '追加情報の提出に失敗しました'
        }
      };
    }
  }

  /**
   * 異議申し立てを取り下げ
   */
  async withdrawAppeal(appealId: string, reason?: string): Promise<AppealResponse> {
    try {
      const response = await this.apiClient.delete<AppealResponse>('/submit', {
        data: { appealId, reason }
      });
      return response.data;
    } catch (error: any) {
      console.error('取り下げエラー:', error);
      throw {
        success: false,
        error: {
          code: 'WITHDRAW_ERROR',
          message: '異議申し立ての取り下げに失敗しました'
        }
      };
    }
  }

  /**
   * ファイルアップロード
   */
  async uploadEvidence(file: File, appealId?: string): Promise<string> {
    try {
      // ファイルサイズチェック（10MB）
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('ファイルサイズは10MB以下にしてください');
      }

      const formData = new FormData();
      formData.append('file', file);
      if (appealId) {
        formData.append('appealId', appealId);
      }

      const response = await this.apiClient.post<{ url: string }>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error: any) {
      console.error('ファイルアップロードエラー:', error);
      throw new Error(error.message || 'ファイルのアップロードに失敗しました');
    }
  }

  /**
   * 評価期間リストを取得
   */
  async getEvaluationPeriods(): Promise<string[]> {
    try {
      const response = await this.apiClient.get<{ periods: string[] }>('/evaluation-periods');
      return response.data.periods || ['2025年度上期', '2024年度下期', '2024年度上期'];
    } catch (error) {
      // フォールバック
      return ['2025年度上期', '2024年度下期', '2024年度上期'];
    }
  }

  /**
   * 異議申し立て可能かチェック
   */
  async checkEligibility(evaluationPeriod: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const response = await this.apiClient.post<{ eligible: boolean; reason?: string }>('/check-eligibility', {
        evaluationPeriod
      });
      return response.data;
    } catch (error) {
      return { eligible: true }; // デフォルトは申し立て可能
    }
  }

  /**
   * コミュニケーションログにコメント追加
   */
  async addComment(appealId: string, message: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/status/${appealId}`, { message });
      return true;
    } catch (error) {
      console.error('コメント追加エラー:', error);
      return false;
    }
  }
}

export default new AppealService();