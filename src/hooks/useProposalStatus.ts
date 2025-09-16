import { useState, useEffect, useCallback } from 'react';
import { checkProposalStatus, pollStatus, ProposalStatus } from '../api/proposalAPI';

interface UseProposalStatusOptions {
  voicedriveRequestId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (status: ProposalStatus) => void;
}

interface UseProposalStatusReturn {
  status: ProposalStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  startPolling: () => () => void;
  stopPolling: () => void;
}

export const useProposalStatus = ({
  voicedriveRequestId,
  autoRefresh = false,
  refreshInterval = 5000,
  onStatusChange
}: UseProposalStatusOptions): UseProposalStatusReturn => {
  const [status, setStatus] = useState<ProposalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollStopFunction, setPollStopFunction] = useState<(() => void) | null>(null);

  // ステータス取得
  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const data = await checkProposalStatus(voicedriveRequestId);
      setStatus(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch proposal status:', err);
      setError('ステータスの取得に失敗しました');
      throw err;
    }
  }, [voicedriveRequestId]);

  // 初回読み込み
  useEffect(() => {
    const loadInitialStatus = async () => {
      setLoading(true);
      try {
        await fetchStatus();
      } catch (err) {
        // エラーは fetchStatus 内で処理済み
      } finally {
        setLoading(false);
      }
    };

    loadInitialStatus();
  }, [fetchStatus]);

  // ポーリング開始
  const startPolling = useCallback(() => {
    if (pollStopFunction) {
      pollStopFunction();
    }

    const stopPolling = pollStatus(
      voicedriveRequestId,
      (newStatus) => {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      },
      (error) => {
        console.error('Polling error:', error);
        setError('ステータス監視中にエラーが発生しました');
      },
      refreshInterval
    );

    setPollStopFunction(() => stopPolling);
    return stopPolling;
  }, [voicedriveRequestId, refreshInterval, onStatusChange, pollStopFunction]);

  // ポーリング停止
  const stopPolling = useCallback(() => {
    if (pollStopFunction) {
      pollStopFunction();
      setPollStopFunction(null);
    }
  }, [pollStopFunction]);

  // 手動更新
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // 自動更新設定
  useEffect(() => {
    if (autoRefresh && !loading) {
      const stopPolling = startPolling();
      return stopPolling;
    }
  }, [autoRefresh, loading, startPolling]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (pollStopFunction) {
        pollStopFunction();
      }
    };
  }, [pollStopFunction]);

  return {
    status,
    loading,
    error,
    refresh,
    startPolling,
    stopPolling
  };
};