/**
 * 議題モード期限管理フック
 *
 * 投票期限管理と通知発火を統合
 */

import { useState, useCallback, useEffect } from 'react';
import { Post, User } from '../types';
import { agendaNotificationIntegration } from '../systems/agenda/services/AgendaNotificationIntegration';
import AgendaDeadlineManager from '../utils/agendaDeadlineManager';

export function useAgendaDeadline(allUsers: User[] = []) {
  const [isExtending, setIsExtending] = useState(false);

  /**
   * 投票期限の監視と通知
   */
  const monitorDeadline = useCallback((
    post: Post,
    scope: 'department' | 'facility' | 'corporation'
  ): void => {
    if (!post.agendaDeadline) {
      return;
    }

    const deadlineInfo = AgendaDeadlineManager.getDeadlineInfo(
      post.agendaDeadline,
      post.agendaDeadlineExtensions || 0
    );

    if (deadlineInfo.isExpired) {
      console.log('⏰ [AgendaDeadline] Deadline expired:', post.id);
      return;
    }

    const hoursRemaining = deadlineInfo.hoursRemaining;

    // 期限3日前（72時間）に通知
    if (hoursRemaining <= 72 && hoursRemaining > 48) {
      console.log('⚠️ [AgendaDeadline] 3 days warning:', post.id);
      agendaNotificationIntegration.notifyDeadlineWarning(
        post,
        hoursRemaining,
        scope,
        allUsers
      );
    }

    // 期限1日前（24時間以内）に通知
    if (hoursRemaining <= 24) {
      console.log('🚨 [AgendaDeadline] 1 day warning:', post.id);
      agendaNotificationIntegration.notifyDeadlineWarning(
        post,
        hoursRemaining,
        scope,
        allUsers
      );
    }
  }, [allUsers]);

  /**
   * 投票期限の延長
   */
  const extendDeadline = useCallback(async (
    post: Post,
    extensionDays: number = 7
  ): Promise<void> => {
    setIsExtending(true);

    try {
      const currentDeadline = new Date(post.agendaDeadline || Date.now());
      const newDeadline = new Date(currentDeadline);
      newDeadline.setDate(newDeadline.getDate() + extensionDays);

      const extensionCount = (post.agendaDeadlineExtensions || 0) + 1;

      console.log('🔔 [AgendaDeadline] Extending deadline:', {
        postId: post.id,
        postTitle: post.title,
        oldDeadline: currentDeadline.toLocaleDateString('ja-JP'),
        newDeadline: newDeadline.toLocaleDateString('ja-JP'),
        extensionCount
      });

      // 実際の実装では、ここでバックエンドAPIを呼び出し
      // await deadlineAPI.extendDeadline({ postId, newDeadline, extensionCount });

      // 期限延長通知を発火
      await agendaNotificationIntegration.notifyDeadlineExtension(
        post,
        newDeadline.toLocaleDateString('ja-JP'),
        extensionCount,
        allUsers
      );

      console.log('✅ [AgendaDeadline] Deadline extended successfully');

    } catch (error) {
      console.error('期限延長エラー:', error);
      throw error;
    } finally {
      setIsExtending(false);
    }
  }, [allUsers]);

  /**
   * 複数の投稿の期限を一括監視
   */
  const monitorMultipleDeadlines = useCallback((
    posts: Post[],
    getScope: (post: Post) => 'department' | 'facility' | 'corporation'
  ): void => {
    console.log(`🔍 [AgendaDeadline] Monitoring ${posts.length} posts`);

    posts.forEach(post => {
      if (post.agendaDeadline && post.type === 'improvement') {
        const scope = getScope(post);
        monitorDeadline(post, scope);
      }
    });
  }, [monitorDeadline]);

  /**
   * 定期的な期限チェック（1時間ごと）
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('⏰ [AgendaDeadline] Periodic deadline check');
      // 実際の実装では、ここで全投稿の期限をチェック
      // monitorMultipleDeadlines(allPosts, getScopeForPost);
    }, 60 * 60 * 1000); // 1時間

    return () => clearInterval(intervalId);
  }, []);

  return {
    monitorDeadline,
    extendDeadline,
    monitorMultipleDeadlines,
    isExtending
  };
}
