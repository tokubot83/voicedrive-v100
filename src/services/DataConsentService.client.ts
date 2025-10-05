/**
 * データ分析同意管理サービス（クライアントサイド版）
 *
 * ブラウザ環境用のスタブ実装。
 * 実際の処理はAPIを通じて行います。
 */

import { environment } from '../config/environment';

export interface ConsentStatus {
  userId: string;
  analyticsConsent: boolean;
  analyticsConsentDate: Date | null;
  personalFeedbackConsent: boolean;
  personalFeedbackConsentDate: Date | null;
  isRevoked: boolean;
  revokeDate: Date | null;
  dataDeletionRequested: boolean;
  dataDeletionRequestedAt: Date | null;
  dataDeletionCompletedAt: Date | null;
}

export interface ConsentUpdateData {
  analyticsConsent?: boolean;
  personalFeedbackConsent?: boolean;
}

export interface ConsentServiceResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ConsentStatistics {
  totalUsers: number;
  analyticsConsented: number;
  personalFeedbackConsented: number;
  bothConsented: number;
  noneConsented: number;
  revoked: number;
  deletionRequested: number;
  deletionCompleted: number;
  consentRate: number;
  feedbackRate: number;
}

class DataConsentService {
  private static instance: DataConsentService;

  private constructor() {}

  public static getInstance(): DataConsentService {
    if (!DataConsentService.instance) {
      DataConsentService.instance = new DataConsentService();
    }
    return DataConsentService.instance;
  }

  /**
   * ユーザーの同意状態を取得（クライアント版はAPIコール）
   */
  async getConsentStatus(userId: string): Promise<ConsentStatus | null> {
    // Vercel環境ではデフォルト値を返す
    if (environment.isDemoMode) {
      return {
        userId,
        analyticsConsent: false,
        analyticsConsentDate: null,
        personalFeedbackConsent: false,
        personalFeedbackConsentDate: null,
        isRevoked: false,
        revokeDate: null,
        dataDeletionRequested: false,
        dataDeletionRequestedAt: null,
        dataDeletionCompletedAt: null
      };
    }

    try {
      const response = await fetch(`/api/consent/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  }

  /**
   * 同意を更新（クライアント版はAPIコール）
   */
  async updateConsent(
    userId: string,
    consentData: ConsentUpdateData
  ): Promise<ConsentServiceResult> {
    // Vercel環境では成功を返す
    if (environment.isDemoMode) {
      return {
        success: true,
        message: 'デモモード: 同意状態を更新しました',
        data: await this.getConsentStatus(userId)
      };
    }

    try {
      const response = await fetch(`/api/consent/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(consentData)
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        message: data.message,
        error: !response.ok ? data.error : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: 'ネットワークエラーが発生しました'
      };
    }
  }

  /**
   * 同意を作成（クライアント版はAPIコール）
   */
  async createConsent(
    userId: string,
    consentData: ConsentUpdateData
  ): Promise<ConsentServiceResult> {
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId, ...consentData })
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        message: data.message,
        error: !response.ok ? data.error : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: 'ネットワークエラーが発生しました'
      };
    }
  }

  /**
   * 同意を取り消し（クライアント版はAPIコール）
   */
  async revokeConsent(userId: string): Promise<ConsentServiceResult> {
    try {
      const response = await fetch(`/api/consent/${userId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message,
        error: !response.ok ? data.error : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: 'ネットワークエラーが発生しました'
      };
    }
  }

  /**
   * データ削除を要求（クライアント版はAPIコール）
   */
  async requestDataDeletion(userId: string): Promise<ConsentServiceResult> {
    try {
      const response = await fetch(`/api/consent/${userId}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message,
        error: !response.ok ? data.error : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: 'ネットワークエラーが発生しました'
      };
    }
  }

  /**
   * 統計情報を取得（クライアント版はダミーデータ）
   */
  async getStatistics(): Promise<ConsentStatistics> {
    // クライアント版はダミーデータを返す
    return {
      totalUsers: 0,
      analyticsConsented: 0,
      personalFeedbackConsented: 0,
      bothConsented: 0,
      noneConsented: 0,
      revoked: 0,
      deletionRequested: 0,
      deletionCompleted: 0,
      consentRate: 0,
      feedbackRate: 0
    };
  }

  /**
   * 同意モーダルを表示すべきかチェック
   */
  async shouldShowConsentModal(userId: string): Promise<boolean> {
    // Vercel環境ではモーダルを表示しない
    if (environment.isDemoMode) {
      return false;
    }

    try {
      const response = await fetch(`/api/consent/${userId}/should-show-modal`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) return true; // エラー時は安全側に倒す
      const data = await response.json();
      return data.shouldShow;
    } catch {
      return true; // エラー時は安全側に倒してモーダルを表示
    }
  }
}

// エクスポート
export const dataConsentService = DataConsentService.getInstance();
export default dataConsentService;