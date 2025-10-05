/**
 * データ分析同意管理カスタムフック
 *
 * VoiceDrive活動データの職員カルテシステム連携における
 * 同意状態の管理を提供
 */

import { useState, useEffect, useCallback } from 'react';
import {
  dataConsentService,
  ConsentStatus,
  ConsentUpdateData,
  ConsentServiceResult
} from '../services/DataConsentService.client';

export interface UseDataConsentReturn {
  // 状態
  consentStatus: ConsentStatus | null;
  loading: boolean;
  error: string | null;

  // 同意モーダル表示判定
  shouldShowModal: boolean;

  // アクション
  updateConsent: (data: ConsentUpdateData) => Promise<ConsentServiceResult>;
  revokeConsent: () => Promise<ConsentServiceResult>;
  requestDataDeletion: () => Promise<ConsentServiceResult>;
  refreshStatus: () => Promise<void>;

  // ヘルパー
  hasAnalyticsConsent: boolean;
  hasPersonalFeedbackConsent: boolean;
  isConsentRevoked: boolean;
  isDeletionRequested: boolean;
}

/**
 * データ分析同意管理フック
 * @param userId ユーザーID
 * @param autoLoad 初期ロード時に自動で同意状態を取得するか（デフォルト: true）
 * @returns 同意状態と操作関数
 */
export const useDataConsent = (
  userId: string | null | undefined,
  autoLoad: boolean = true
): UseDataConsentReturn => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowModal, setShouldShowModal] = useState<boolean>(false);

  /**
   * 同意状態を取得
   */
  const loadConsentStatus = useCallback(async () => {
    if (!userId) {
      setConsentStatus(null);
      setShouldShowModal(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 同意状態を取得
      const status = await dataConsentService.getConsentStatus(userId);
      setConsentStatus(status);

      // モーダル表示判定
      const showModal = await dataConsentService.shouldShowConsentModal(userId);
      setShouldShowModal(showModal);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '同意状態の取得に失敗しました。';
      setError(errorMessage);
      console.error('[useDataConsent] 同意状態取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 同意状態を更新
   */
  const updateConsent = useCallback(
    async (data: ConsentUpdateData): Promise<ConsentServiceResult> => {
      if (!userId) {
        return {
          success: false,
          message: 'ユーザーIDが指定されていません。'
        };
      }

      setLoading(true);
      setError(null);

      try {
        const result = await dataConsentService.updateConsent(userId, data);

        if (result.success && result.data) {
          setConsentStatus(result.data);
          // 同意を更新したらモーダルは不要
          setShouldShowModal(false);
        } else {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '同意状態の更新に失敗しました。';
        setError(errorMessage);
        console.error('[useDataConsent] 同意更新エラー:', err);

        return {
          success: false,
          message: errorMessage
        };
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  /**
   * 同意を取り消す
   */
  const revokeConsent = useCallback(async (): Promise<ConsentServiceResult> => {
    if (!userId) {
      return {
        success: false,
        message: 'ユーザーIDが指定されていません。'
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dataConsentService.revokeConsent(userId);

      if (result.success && result.data) {
        setConsentStatus(result.data);
      } else {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '同意の取り消しに失敗しました。';
      setError(errorMessage);
      console.error('[useDataConsent] 同意取り消しエラー:', err);

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * データ削除をリクエスト
   */
  const requestDataDeletion = useCallback(async (): Promise<ConsentServiceResult> => {
    if (!userId) {
      return {
        success: false,
        message: 'ユーザーIDが指定されていません。'
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dataConsentService.requestDataDeletion(userId);

      if (result.success && result.data) {
        setConsentStatus(result.data);
      } else {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データ削除リクエストに失敗しました。';
      setError(errorMessage);
      console.error('[useDataConsent] データ削除リクエストエラー:', err);

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 同意状態を再取得
   */
  const refreshStatus = useCallback(async () => {
    await loadConsentStatus();
  }, [loadConsentStatus]);

  // 初期ロード
  useEffect(() => {
    if (autoLoad && userId) {
      loadConsentStatus();
    }
  }, [autoLoad, userId, loadConsentStatus]);

  // ヘルパー値
  const hasAnalyticsConsent = consentStatus?.analyticsConsent ?? false;
  const hasPersonalFeedbackConsent = consentStatus?.personalFeedbackConsent ?? false;
  const isConsentRevoked = consentStatus?.isRevoked ?? false;
  const isDeletionRequested = consentStatus?.dataDeletionRequested ?? false;

  return {
    // 状態
    consentStatus,
    loading,
    error,
    shouldShowModal,

    // アクション
    updateConsent,
    revokeConsent,
    requestDataDeletion,
    refreshStatus,

    // ヘルパー
    hasAnalyticsConsent,
    hasPersonalFeedbackConsent,
    isConsentRevoked,
    isDeletionRequested
  };
};

export default useDataConsent;
