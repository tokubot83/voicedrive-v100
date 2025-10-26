/**
 * 医療システムAPIクライアント
 * Phase 2.5で使用
 *
 * 最終更新: 2025-10-26
 * 参照: SystemMonitorPage_VoiceDrive回答書_20251026.md
 */

import axios, { AxiosError } from 'axios';
import {
  MedicalSystemWebhookStats,
  MedicalSystemInterviewStats,
  MedicalSystemApiResponse,
  MedicalSystemApiError
} from '../types/medicalSystem.types';

const MEDICAL_SYSTEM_BASE_URL = process.env.MEDICAL_SYSTEM_API_URL || '';
const API_KEY = process.env.MEDICAL_SYSTEM_API_KEY || '';

if (!MEDICAL_SYSTEM_BASE_URL) {
  console.warn('[MedicalSystemClient] MEDICAL_SYSTEM_API_URL is not set');
}

if (!API_KEY) {
  console.warn('[MedicalSystemClient] MEDICAL_SYSTEM_API_KEY is not set - API calls will fail');
}

export class MedicalSystemClient {
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
}
