/**
 * ユーザー活動統計サービス
 * PersonalStation用 - Phase 2統合
 */

import { prisma } from '../lib/prisma';
import { startOfMonth } from 'date-fns';

export interface VoteStats {
  total: number;
  thisMonth: number;
  impactScore: number;
}

export interface CategoryStats {
  improvement: number;
  communication: number;
  innovation: number;
  strategy: number;
}

/**
 * ユーザーの投票統計を取得
 * @param userId ユーザーID
 */
export async function getUserVoteStats(userId: string): Promise<VoteStats> {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);

  // 総投票数
  const totalVotes = await prisma.voteHistory.count({
    where: { userId }
  });

  // 今月の投票数
  const thisMonthVotes = await prisma.voteHistory.count({
    where: {
      userId,
      votedAt: { gte: thisMonthStart }
    }
  });

  // 影響力スコア計算（投票重みの合計 × 2、最大100）
  const votes = await prisma.voteHistory.findMany({
    where: { userId },
    select: { voteWeight: true }
  });

  const totalWeight = votes.reduce((sum, v) => sum + v.voteWeight, 0);
  const impactScore = Math.min(100, Math.round(totalWeight * 2));

  return {
    total: totalVotes,
    thisMonth: thisMonthVotes,
    impactScore
  };
}

/**
 * カテゴリ別投票統計を取得
 * @param userId ユーザーID
 */
export async function getVoteStatsByCategory(userId: string): Promise<CategoryStats> {
  const votes = await prisma.voteHistory.groupBy({
    by: ['postCategory'],
    where: {
      userId,
      postCategory: { not: null }
    },
    _count: { id: true }
  });

  return {
    improvement: votes.find(v => v.postCategory === 'improvement')?._count.id || 0,
    communication: votes.find(v => v.postCategory === 'communication')?._count.id || 0,
    innovation: votes.find(v => v.postCategory === 'innovation')?._count.id || 0,
    strategy: votes.find(v => v.postCategory === 'strategy')?._count.id || 0,
  };
}

/**
 * ユーザーが投票した投稿一覧を取得
 * @param userId ユーザーID
 * @param limit 取得件数制限（デフォルト: 50）
 */
export async function getUserVotedPosts(userId: string, limit: number = 50) {
  const votedPosts = await prisma.voteHistory.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
              avatar: true
            }
          }
        }
      }
    },
    orderBy: { votedAt: 'desc' },
    take: limit
  });

  return votedPosts.map(v => ({
    ...v.post,
    userVote: v.voteOption,
    votedAt: v.votedAt
  }));
}

/**
 * ユーザーの投稿統計を取得
 * @param userId ユーザーID
 */
export async function getUserPostStats(userId: string) {
  const totalPosts = await prisma.post.count({
    where: { authorId: userId }
  });

  const agendaPosts = await prisma.post.count({
    where: {
      authorId: userId,
      type: 'improvement'
    }
  });

  const projectPosts = await prisma.post.count({
    where: {
      authorId: userId,
      type: { not: 'improvement' }
    }
  });

  return {
    total: totalPosts,
    agenda: agendaPosts,
    project: projectPosts
  };
}

/**
 * ユーザーのフィードバック統計を取得
 * @param userId ユーザーID
 */
export async function getUserFeedbackStats(userId: string) {
  const feedbackReceived = await prisma.feedback.count({
    where: { receiverId: userId }
  });

  const feedbackSent = await prisma.feedback.count({
    where: { senderId: userId }
  });

  return {
    received: feedbackReceived,
    sent: feedbackSent
  };
}

/**
 * ユーザーの全活動統計を一括取得（パフォーマンス最適化版）
 * @param userId ユーザーID
 */
export async function getUserActivitySummary(userId: string) {
  const [voteStats, categoryStats, postStats, feedbackStats] = await Promise.all([
    getUserVoteStats(userId),
    getVoteStatsByCategory(userId),
    getUserPostStats(userId),
    getUserFeedbackStats(userId)
  ]);

  return {
    votes: voteStats,
    categories: categoryStats,
    posts: postStats,
    feedback: feedbackStats
  };
}

/**
 * ユーザー活動サマリーテーブルを更新（日次バッチ用）
 * @param userId ユーザーID
 */
export async function updateUserActivitySummaryRecord(userId: string) {
  const summary = await getUserActivitySummary(userId);

  await prisma.userActivitySummary.upsert({
    where: { userId },
    create: {
      userId,
      totalPosts: summary.posts.total,
      totalVotes: summary.votes.total,
      thisMonthVotes: summary.votes.thisMonth,
      impactScore: summary.votes.impactScore,
      feedbackReceived: summary.feedback.received,
      feedbackSent: summary.feedback.sent,
      projectsProposed: summary.posts.project,
      surveysCompleted: 0, // TODO: アンケート機能実装時に追加
      loginDays: 0, // TODO: ログイン追跡機能実装時に追加
      lastCalculatedAt: new Date()
    },
    update: {
      totalPosts: summary.posts.total,
      totalVotes: summary.votes.total,
      thisMonthVotes: summary.votes.thisMonth,
      impactScore: summary.votes.impactScore,
      feedbackReceived: summary.feedback.received,
      feedbackSent: summary.feedback.sent,
      projectsProposed: summary.posts.project,
      lastCalculatedAt: new Date()
    }
  });
}

/**
 * 全ユーザーの活動サマリーを更新（日次バッチ用）
 * @param batchSize バッチサイズ（デフォルト: 100）
 */
export async function updateAllUserActivitySummaries(batchSize: number = 100) {
  const users = await prisma.user.findMany({
    where: {
      isRetired: false
    },
    select: { id: true }
  });

  console.log(`[UserActivityService] 全ユーザー統計更新開始: ${users.length}件`);

  let processed = 0;
  let errors = 0;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(user =>
        updateUserActivitySummaryRecord(user.id)
          .then(() => { processed++; })
          .catch(err => {
            errors++;
            console.error(`[UserActivityService] ユーザー${user.id}の統計更新エラー:`, err);
          })
      )
    );

    console.log(`[UserActivityService] 進捗: ${Math.min(i + batchSize, users.length)}/${users.length}`);
  }

  console.log(`[UserActivityService] 更新完了: 成功${processed}件, エラー${errors}件`);

  return {
    total: users.length,
    processed,
    errors
  };
}
