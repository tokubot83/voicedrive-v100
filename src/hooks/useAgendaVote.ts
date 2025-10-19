/**
 * 議題モード投票カスタムフック
 * Phase 3で実装した投票APIと統合
 */
import { useState, useEffect, useCallback } from 'react';
import { VoteOption } from '../types';

interface VoteSummary {
  totalVotes: number;
  breakdown: Record<VoteOption, number>;
  agendaScore: number;
}

interface UseAgendaVoteReturn {
  currentVote: VoteOption | null;
  voteSummary: VoteSummary | null;
  isVoting: boolean;
  isLoading: boolean;
  error: string | null;
  vote: (option: VoteOption) => Promise<void>;
  refreshVoteSummary: () => Promise<void>;
}

/**
 * 議題モード投票フック
 *
 * @param postId - 投稿ID
 * @param userId - ユーザーID（認証済み）
 * @returns 投票状態と投票関数
 */
export function useAgendaVote(postId: string, userId?: string): UseAgendaVoteReturn {
  const [currentVote, setCurrentVote] = useState<VoteOption | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 現在のユーザーの投票を取得
  const fetchCurrentVote = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/posts/${postId}/my-vote`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('投票情報の取得に失敗しました');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setCurrentVote(data.data.voteOption);
      }
    } catch (err) {
      console.error('投票情報取得エラー:', err);
      // エラーは無視（初回投票の場合はnullが正しい）
    }
  }, [postId, userId]);

  // 投票集計を取得
  const fetchVoteSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/votes`);

      if (!response.ok) {
        throw new Error('投票集計の取得に失敗しました');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setVoteSummary(data.data);
      }
    } catch (err) {
      console.error('投票集計取得エラー:', err);
      setError(err instanceof Error ? err.message : '投票集計の取得に失敗しました');
    }
  }, [postId]);

  // 初期データ取得
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCurrentVote(), fetchVoteSummary()]);
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchCurrentVote, fetchVoteSummary]);

  // 投票実行
  const vote = useCallback(
    async (option: VoteOption) => {
      if (isVoting) return;

      setIsVoting(true);
      setError(null);

      try {
        const response = await fetch(`/api/posts/${postId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ voteOption: option }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '投票に失敗しました');
        }

        const data = await response.json();

        if (data.success) {
          // 投票成功
          setCurrentVote(option);

          // 投票集計を更新
          await fetchVoteSummary();

          console.log('✅ 投票成功:', {
            postId,
            option,
            newScore: data.data.newScore,
            voteCount: data.data.voteCount,
          });
        } else {
          throw new Error(data.message || '投票に失敗しました');
        }
      } catch (err) {
        console.error('❌ 投票エラー:', err);
        setError(err instanceof Error ? err.message : '投票に失敗しました');
        throw err;
      } finally {
        setIsVoting(false);
      }
    },
    [postId, isVoting, fetchVoteSummary]
  );

  // 投票集計を手動でリフレッシュ
  const refreshVoteSummary = useCallback(async () => {
    await fetchVoteSummary();
  }, [fetchVoteSummary]);

  return {
    currentVote,
    voteSummary,
    isVoting,
    isLoading,
    error,
    vote,
    refreshVoteSummary,
  };
}
