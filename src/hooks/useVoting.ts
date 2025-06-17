import { useState, useEffect, useCallback } from 'react';
import { VoteOption, Post } from '../types';
import VotingService, { UserVoteRecord } from '../services/VotingService';

export interface UseVotingReturn {
  // 投票状態
  hasVoted: (postId: string) => boolean;
  getUserVote: (postId: string) => VoteOption | null;
  
  // 投票アクション
  submitVote: (postId: string, option: VoteOption) => Promise<boolean>;
  
  // 投票統計
  getVotingStats: () => {
    totalVotes: number;
    votesByOption: Record<VoteOption, number>;
    recentVotes: UserVoteRecord[];
  };
  
  // 投票履歴
  getVoteHistory: () => UserVoteRecord[];
  
  // 投票データの更新トリガー
  refreshVotingData: () => void;
}

export const useVoting = (): UseVotingReturn => {
  const [votingDataVersion, setVotingDataVersion] = useState(0);

  // 投票データの強制更新
  const refreshVotingData = useCallback(() => {
    setVotingDataVersion(prev => prev + 1);
  }, []);

  // 投票済みかチェック
  const hasVoted = useCallback((postId: string): boolean => {
    return VotingService.hasUserVoted(postId);
  }, [votingDataVersion]);

  // ユーザーの投票取得
  const getUserVote = useCallback((postId: string): VoteOption | null => {
    return VotingService.getUserVote(postId);
  }, [votingDataVersion]);

  // 投票の実行
  const submitVote = useCallback(async (postId: string, option: VoteOption): Promise<boolean> => {
    try {
      // 既に投票済みかチェック
      if (VotingService.hasUserVoted(postId)) {
        console.warn(`User has already voted for post ${postId}`);
        return false;
      }

      // 投票を記録
      const success = VotingService.recordVote(postId, option);
      
      if (success) {
        // 投票データを更新してコンポーネントの再レンダリングをトリガー
        refreshVotingData();
        
        console.log(`Vote submitted successfully: ${option} for post ${postId}`);
        return true;
      } else {
        console.error(`Failed to submit vote: ${option} for post ${postId}`);
        return false;
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      return false;
    }
  }, [refreshVotingData]);

  // 投票統計の取得
  const getVotingStats = useCallback(() => {
    return VotingService.getVotingStats();
  }, [votingDataVersion]);

  // 投票履歴の取得
  const getVoteHistory = useCallback(() => {
    return VotingService.getVoteHistory();
  }, [votingDataVersion]);

  return {
    hasVoted,
    getUserVote,
    submitVote,
    getVotingStats,
    getVoteHistory,
    refreshVotingData
  };
};

// 投稿データと投票データを統合するヘルパーフック
export const usePostWithVoting = (posts: Post[]) => {
  const voting = useVoting();
  
  // 投稿データにユーザーの投票状態を追加
  const postsWithVoting = posts.map(post => ({
    ...post,
    userVote: voting.getUserVote(post.id),
    hasUserVoted: voting.hasVoted(post.id)
  }));

  return {
    posts: postsWithVoting,
    voting
  };
};

export default useVoting;