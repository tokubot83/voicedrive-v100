/**
 * 投票統計取得用カスタムフック
 */

import { useState, useEffect } from 'react';

export interface VoteDistribution {
  stronglySupport: number;
  support: number;
  neutral: number;
  oppose: number;
  stronglyOppose: number;
}

export interface CategoryBreakdown {
  category: string;
  voteCount: number;
  averageTendency: number;
}

export interface RecentVote {
  postId: string;
  voteOption: string;
  votedAt: string;
  postCategory: string | null;
  postType: string | null;
}

export interface MonthlyVote {
  month: string;
  voteCount: number;
}

export interface VoteStats {
  totalVotes: number;
  voteDistribution: VoteDistribution;
  voteTendencyScore: number;
  categoryBreakdown: CategoryBreakdown[];
  recentVotes: RecentVote[];
  monthlyVotes: MonthlyVote[];
  averageVoteWeight: number;
  mostActiveCategory: string | null;
  votingFrequency: number;
}

export interface DepartmentTendency {
  averageTendencyScore: number;
  totalVotes: number;
  averageVotesPerUser: number;
  tendencyLabel: string;
}

export function useVoteStats(userId?: string) {
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [voteTendencyLabel, setVoteTendencyLabel] = useState<string>('');
  const [departmentTendency, setDepartmentTendency] = useState<DepartmentTendency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile/vote-stats', {
        headers: userId ? { 'x-user-id': userId } : {},
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '投票統計の取得に失敗しました');
      }

      setStats(data.stats);
      setVoteTendencyLabel(data.voteTendencyLabel);
      setDepartmentTendency(data.departmentTendency);
    } catch (err) {
      console.error('[useVoteStats] 投票統計取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return {
    stats,
    voteTendencyLabel,
    departmentTendency,
    loading,
    error,
    refetch: fetchStats,
  };
}
