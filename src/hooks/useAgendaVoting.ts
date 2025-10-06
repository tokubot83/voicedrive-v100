/**
 * 議題モード専用投票フック
 *
 * 投票処理とレベル昇格時の通知発火を統合
 */

import { useState, useCallback } from 'react';
import { Post, VoteOption, User } from '../types';
import { AgendaLevel } from '../types/committee';
import { agendaLevelEngine } from '../systems/agenda/engines/AgendaLevelEngine';
import { agendaNotificationIntegration } from '../systems/agenda/services/AgendaNotificationIntegration';
import { useProjectScoring } from './projects/useProjectScoring';

export function useAgendaVoting(allUsers: User[] = []) {
  const [isVoting, setIsVoting] = useState(false);
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  /**
   * 投票処理（レベル昇格時に通知発火）
   */
  const vote = useCallback(async (
    post: Post,
    voteOption: VoteOption,
    currentUser: User
  ): Promise<void> => {
    if (!post || !currentUser) {
      console.error('投票エラー: 投稿またはユーザー情報が不足しています');
      return;
    }

    setIsVoting(true);

    try {
      // 投票前のレベルを記録
      const oldScore = calculateScore(
        convertVotesToEngagements(post.votes || {}),
        post.proposalType
      );
      const oldLevel = agendaLevelEngine.getAgendaLevel(oldScore);

      console.log('🗳️ [AgendaVoting] Voting:', {
        postId: post.id,
        postTitle: post.title,
        voteOption,
        oldScore,
        oldLevel
      });

      // 投票を記録（実際の実装ではバックエンドAPI呼び出し）
      const updatedVotes = { ...post.votes };
      if (!updatedVotes[voteOption]) {
        updatedVotes[voteOption] = 0;
      }
      updatedVotes[voteOption]++;

      // 新しいスコアを計算
      const newScore = calculateScore(
        convertVotesToEngagements(updatedVotes),
        post.proposalType
      );
      const newLevel = agendaLevelEngine.getAgendaLevel(newScore);

      console.log('📊 [AgendaVoting] New score:', {
        newScore,
        newLevel,
        scoreChange: newScore - oldScore
      });

      // レベルが昇格した場合、通知を発火
      if (newLevel !== oldLevel) {
        console.log('🎉 [AgendaVoting] Level up detected!', {
          oldLevel,
          newLevel
        });

        await agendaNotificationIntegration.notifyLevelUp(
          post,
          oldLevel,
          newLevel,
          newScore,
          allUsers
        );

        // ブラウザ通知許可をリクエスト（まだの場合）
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      // 実際の実装では、ここでバックエンドAPIを呼び出して投票を保存
      // await voteAPI.submitVote({ postId: post.id, voteOption, userId: currentUser.id });

      console.log('✅ [AgendaVoting] Vote submitted successfully');

    } catch (error) {
      console.error('投票エラー:', error);
      throw error;
    } finally {
      setIsVoting(false);
    }
  }, [calculateScore, convertVotesToEngagements, allUsers]);

  /**
   * レベル昇格をシミュレート（デモ用）
   */
  const simulateLevelUp = useCallback(async (
    post: Post,
    targetLevel: AgendaLevel
  ): Promise<void> => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const currentLevel = agendaLevelEngine.getAgendaLevel(currentScore);

    // レベル昇格通知を発火
    await agendaNotificationIntegration.notifyLevelUp(
      post,
      currentLevel,
      targetLevel,
      currentScore + 100, // デモ用のスコア
      allUsers
    );
  }, [calculateScore, convertVotesToEngagements, allUsers]);

  return {
    vote,
    isVoting,
    simulateLevelUp
  };
}
