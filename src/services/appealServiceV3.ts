import axios, { AxiosError } from 'axios';
import { 
  V3AppealRequest, 
  V3AppealResponse, 
  V3AppealRecord,
  V3AppealStatus,
  V3EvaluationPeriod
} from '../types/appeal-v3';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MEDICAL_SYSTEM_URL = import.meta.env.VITE_MEDICAL_API_URL || 'http://localhost:8080';

/**
 * V3評価システム異議申立サービス
 * 医療システムチームとの合意に基づく新API仕様
 */
class AppealServiceV3 {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly LOCAL_STORAGE_KEY = 'v3_appeal_draft';
  private readonly LOCAL_STORAGE_BACKUP_KEY = 'v3_appeal_backup';
  private apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/v3/appeals`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private medicalApiClient = axios.create({
    baseURL: MEDICAL_SYSTEM_URL,
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

    this.medicalApiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('medicalApiToken') || localStorage.getItem('authToken');
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
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 一時保存機能 - ローカルストレージに下書きを保存
   */
  saveDraft(request: Partial<V3AppealRequest>): void {
    try {
      const draft = {
        ...request,
        savedAt: new Date().toISOString(),
        version: 'v3.0.0'
      };
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(draft));
      
      // バックアップも作成
      const existingBackups = this.getBackups();
      existingBackups.push(draft);
      // 最新10件のみ保持
      if (existingBackups.length > 10) {
        existingBackups.shift();
      }
      localStorage.setItem(this.LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(existingBackups));
    } catch (error) {
      console.error('下書き保存エラー:', error);
    }
  }

  /**
   * 下書きを取得
   */
  getDraft(): Partial<V3AppealRequest> | null {
    try {
      const draft = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('下書き読み込みエラー:', error);
      return null;
    }
  }

  /**
   * 下書きを削除
   */
  clearDraft(): void {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
  }

  /**
   * バックアップ履歴を取得
   */
  getBackups(): any[] {
    try {
      const backups = localStorage.getItem(this.LOCAL_STORAGE_BACKUP_KEY);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * リトライ機能付きのAPIリクエスト
   */
  private async retryableRequest<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // リトライ可能なエラーかチェック
      const isRetryable = 
        axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ETIMEDOUT' ||
        axiosError.response?.status === 503 ||
        axiosError.response?.status === 504 ||
        (!axiosError.response && axiosError.message?.includes('Network'));
      
      if (isRetryable && retryCount < this.MAX_RETRY_ATTEMPTS) {
        console.log(`リトライ ${retryCount + 1}/${this.MAX_RETRY_ATTEMPTS}...`);
        
        // 指数バックオフ
        const delay = this.RETRY_DELAY_MS * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.retryableRequest(requestFn, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * V3異議申し立てを医療システムAPIに直接送信
   * 医療チーム提案の新フロー対応
   */
  async submitAppealV3(request: V3AppealRequest): Promise<V3AppealResponse> {
    try {
      // V3バリデーション
      this.validateV3Appeal(request);

      // 医療システムチーム提案の追加フィールドを含めた送信データ
      const submitData = {
        ...request,
        voiceDriveUserId: localStorage.getItem('voiceDriveUserId') || request.employeeId,
        deviceInfo: {
          platform: this.detectPlatform(),
          version: '3.2.1',
          userAgent: navigator.userAgent
        },
        attachments: request.evidenceDocuments?.map(doc => ({
          filename: doc.originalName,
          fileId: doc.fileId,
          size: doc.size
        })) || [],
        submittedAt: new Date().toISOString(),
        apiVersion: 'v3.0.0'
      };

      // リトライ機能付きで医療システムAPIに送信
      const response = await this.retryableRequest(async () => {
        // 送信前に自動保存
        this.saveDraft(request);
        
        return await this.medicalApiClient.post<V3AppealResponse>(
          '/api/v3/appeals/submit',
          submitData
        );
      });

      // 送信成功後、下書きをクリア
      this.clearDraft();
      
      return response.data;
    } catch (error: any) {
      console.error('V3異議申し立て送信エラー:', error);
      
      // エラー時も下書きを保存
      this.saveDraft(request);
      
      // フォールバック処理
      const fallbackMessage = this.getFallbackMessage(error);
      
      throw {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'V3_SUBMIT_ERROR',
          message: fallbackMessage,
          details: error.response?.data?.error?.details,
          retryable: this.isRetryableError(error),
          draft: request
        }
      };
    }
  }

  /**
   * V3評価期間リストを取得
   */
  async getV3EvaluationPeriods(): Promise<V3EvaluationPeriod[]> {
    try {
      const response = await this.medicalApiClient.get<{ 
        success: boolean;
        version: string;
        systemType: string;
        periods: V3EvaluationPeriod[]
      }>('/api/v3/evaluation/periods');
      
      if (response.data.success && response.data.version === 'v3.0.0') {
        // V3システム確認
        console.log('✅ V3システム確認:', response.data.systemType);
        
        // 申立可能期間のみフィルター
        const now = new Date();
        return response.data.periods.filter(period => 
          period.status === 'active' && 
          new Date(period.appealDeadline) > now
        );
      }
      
      return [];
    } catch (error: any) {
      console.error('V3評価期間取得エラー:', error);
      return [];
    }
  }

  /**
   * V3異議申し立て一覧を取得
   */
  async getV3Appeals(employeeId?: string): Promise<V3AppealRecord[]> {
    try {
      const params = employeeId ? { employeeId } : {};
      const response = await this.medicalApiClient.get<{ 
        success: boolean;
        data: V3AppealRecord[] 
      }>('/api/v3/appeals', { params });
      
      return response.data.data || [];
    } catch (error: any) {
      console.error('V3異議申し立て一覧取得エラー:', error);
      return [];
    }
  }

  /**
   * V3異議申し立て詳細を取得
   */
  async getV3AppealDetail(appealId: string): Promise<V3AppealRecord | null> {
    try {
      const response = await this.medicalApiClient.get<{
        success: boolean;
        data: V3AppealRecord
      }>(`/api/v3/appeals/${appealId}`);
      
      return response.data.success ? response.data.data : null;
    } catch (error: any) {
      console.error('V3異議申し立て詳細取得エラー:', error);
      return null;
    }
  }

  /**
   * V3異議申し立てのステータス更新を取得
   */
  async getV3AppealStatus(appealId: string): Promise<V3AppealStatus | null> {
    try {
      const response = await this.medicalApiClient.get<{
        success: boolean;
        status: V3AppealStatus;
        message?: string;
      }>(`/api/v3/appeals/${appealId}/status`);
      
      return response.data.success ? response.data.status : null;
    } catch (error: any) {
      console.error('V3ステータス取得エラー:', error);
      return null;
    }
  }

  /**
   * V3バリデーション
   */
  private validateV3Appeal(request: V3AppealRequest): void {
    // 100点満点バリデーション
    if (request.scores?.currentTotal < 0 || request.scores?.currentTotal > 100) {
      throw new Error('現在スコアは0-100の範囲で入力してください');
    }

    // 項目別スコアバリデーション
    if (request.scores?.disputedItems) {
      for (const item of request.scores.disputedItems) {
        if (item.currentScore < 0 || item.currentScore > 100) {
          throw new Error('項目スコアは0-100の範囲で入力してください');
        }
        if (item.expectedScore < 0 || item.expectedScore > 100) {
          throw new Error('期待スコアは0-100の範囲で入力してください');
        }
      }
    }

    // 申立理由の最小文字数
    const totalReason = request.appealReason + 
      (request.scores?.disputedItems?.map(item => item.reason).join('') || '');
    
    if (totalReason.length < 100) {
      throw new Error('申し立て理由は合計100文字以上入力してください');
    }
  }

  /**
   * エラーメッセージのフォールバック
   */
  private getFallbackMessage(error: any): string {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'タイムアウトしました。ネットワーク接続を確認してください。';
    }
    if (error.response?.status === 503) {
      return 'サービスが一時的に利用できません。しばらくしてから再試行してください。';
    }
    if (error.response?.status === 504) {
      return 'ゲートウェイタイムアウト。しばらくしてから再試行してください。';
    }
    if (!error.response && error.message?.includes('Network')) {
      return 'ネットワークエラーが発生しました。接続を確認してください。';
    }
    return error.response?.data?.error?.message || 'V3異議申し立ての送信に失敗しました';
  }

  /**
   * リトライ可能なエラーかチェック
   */
  private isRetryableError(error: any): boolean {
    const axiosError = error as AxiosError;
    return (
      axiosError.code === 'ECONNABORTED' ||
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.response?.status === 503 ||
      axiosError.response?.status === 504 ||
      (!axiosError.response && axiosError.message?.includes('Network'))
    );
  }

  /**
   * プラットフォーム検出
   */
  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  /**
   * V3ファイルアップロード
   */
  async uploadV3Evidence(file: File, appealId?: string): Promise<string> {
    try {
      // ファイルサイズチェック（15MB - V3では拡張）
      if (file.size > 15 * 1024 * 1024) {
        throw new Error('ファイルサイズは15MB以下にしてください');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('apiVersion', 'v3.0.0');
      if (appealId) {
        formData.append('appealId', appealId);
      }

      const response = await this.medicalApiClient.post<{ 
        success: boolean;
        fileId: string;
        url: string;
      }>('/api/v3/appeals/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.fileId;
    } catch (error: any) {
      console.error('V3ファイルアップロードエラー:', error);
      throw new Error(error.message || 'ファイルのアップロードに失敗しました');
    }
  }
}

// V3サービスのシングルトンインスタンス
export const appealServiceV3 = new AppealServiceV3();
export default AppealServiceV3;