/**
 * 投票サービス
 * PersonalStation用 - Phase 2統合
 */

import { prisma } from '../lib/prisma';

export type VoteOption = 'strongly-support' | 'support' | 'neutral' | 'oppose' | 'strongly-oppose';

export interface RecordVoteParams {
  userId: string;
  postId: string;
  voteOption: VoteOption;
  voteWeight: number;
  postCategory?: string;
  postType?: string;
}

/**
 * 投票を記録する
 * @param params 投票パラメータ
 */
export async function recordVote(params: RecordVoteParams): Promise<void> {
  const { userId, postId, voteOption, voteWeight, postCategory, postType } = params;

  await prisma.voteHistory.upsert({
    where: {
      userId_postId: { userId, postId }
    },
    create: {
      userId,
      postId,
      voteOption,
      voteWeight,
      votedAt: new Date(),
      postCategory,
      postType
    },
    update: {
      voteOption,
      voteWeight,
      votedAt: new Date()
    }
  });
}

/**
 * ユーザーが特定の投稿に投票済みかチェック
 * @param userId ユーザーID
 * @param postId 投稿ID
 */
export async function hasUserVoted(userId: string, postId: string): Promise<boolean> {
  const vote = await prisma.voteHistory.findUnique({
    where: {
      userId_postId: { userId, postId }
    }
  });
  return !!vote;
}

/**
 * ユーザーの投票内容を取得
 * @param userId ユーザーID
 * @param postId 投稿ID
 */
export async function getUserVote(userId: string, postId: string): Promise<VoteOption | null> {
  const vote = await prisma.voteHistory.findUnique({
    where: {
      userId_postId: { userId, postId }
    },
    select: { voteOption: true }
  });
  return vote?.voteOption as VoteOption | null;
}

/**
 * ユーザーの投票を削除
 * @param userId ユーザーID
 * @param postId 投稿ID
 */
export async function deleteVote(userId: string, postId: string): Promise<void> {
  await prisma.voteHistory.delete({
    where: {
      userId_postId: { userId, postId }
    }
  });
}

/**
 * 複数の投稿に対するユーザーの投票状況を一括取得
 * @param userId ユーザーID
 * @param postIds 投稿IDリスト
 */
export async function getUserVotesForPosts(
  userId: string,
  postIds: string[]
): Promise<Map<string, VoteOption>> {
  const votes = await prisma.voteHistory.findMany({
    where: {
      userId,
      postId: { in: postIds }
    },
    select: {
      postId: true,
      voteOption: true
    }
  });

  const voteMap = new Map<string, VoteOption>();
  votes.forEach((vote: { postId: string; voteOption: string }) => {
    voteMap.set(vote.postId, vote.voteOption as VoteOption);
  });

  return voteMap;
}

/**
 * 投稿に対する全投票を取得
 * @param postId 投稿ID
 */
export async function getPostVotes(postId: string) {
  return await prisma.voteHistory.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          department: true,
          permissionLevel: true
        }
      }
    },
    orderBy: { votedAt: 'desc' }
  });
}

/**
 * 投稿の投票サマリーを取得
 * @param postId 投稿ID
 */
export async function getPostVoteSummary(postId: string) {
  const votes = await prisma.voteHistory.findMany({
    where: { postId },
    select: {
      voteOption: true,
      voteWeight: true
    }
  });

  const summary = {
    total: votes.length,
    stronglySupport: 0,
    support: 0,
    neutral: 0,
    oppose: 0,
    stronglyOppose: 0,
    totalWeight: 0
  };

  votes.forEach((vote: { voteOption: string; voteWeight: number }) => {
    summary.totalWeight += vote.voteWeight;
    switch (vote.voteOption) {
      case 'strongly-support':
        summary.stronglySupport++;
        break;
      case 'support':
        summary.support++;
        break;
      case 'neutral':
        summary.neutral++;
        break;
      case 'oppose':
        summary.oppose++;
        break;
      case 'strongly-oppose':
        summary.stronglyOppose++;
        break;
    }
  });

  return summary;
}

// ============================================
// IdeaVoiceTrackingPage Phase 4 拡張機能
// ============================================

/**
 * 投稿の正確な投票統計を取得（VoteHistoryテーブルから）
 * IdeaVoiceTrackingPage用
 *
 * @param postId 投稿ID
 * @returns 投票統計
 */
export async function getAccurateVoteStats(postId: string) {
  const votes = await prisma.voteHistory.findMany({
    where: { postId },
    include: {
      user: {
        select: { permissionLevel: true }
      }
    }
  });

  const totalVotes = votes.length;
  const supportVotes = votes.filter((v: any) =>
    ['strongly-support', 'support'].includes(v.voteOption)
  ).length;
  const opposeVotes = votes.filter((v: any) =>
    ['oppose', 'strongly-oppose'].includes(v.voteOption)
  ).length;

  // 権限レベル加重スコア計算
  const weightedScore = votes.reduce((sum: number, vote: any) => {
    const baseWeight = getVoteWeight(vote.voteOption);
    const permissionWeight = Number(vote.user.permissionLevel);
    return sum + (baseWeight * permissionWeight * vote.voteWeight);
  }, 0);

  return {
    totalVotes,
    supportVotes,
    opposeVotes,
    neutralVotes: totalVotes - supportVotes - opposeVotes,
    supportRate: totalVotes > 0 ? (supportVotes / totalVotes) * 100 : 0,
    weightedScore: Math.round(weightedScore)
  };
}

/**
 * 投票オプションから基礎重みを取得
 *
 * @param voteOption 投票オプション
 * @returns 基礎重み
 */
function getVoteWeight(voteOption: string): number {
  const weights: Record<string, number> = {
    'strongly-support': 2.0,
    'support': 1.0,
    'neutral': 0.0,
    'oppose': -1.0,
    'strongly-oppose': -2.0
  };
  return weights[voteOption] || 0;
}

/**
 * ユーザーの投票統計を取得
 * PersonalStation用（既存機能の拡張）
 *
 * @param userId ユーザーID
 * @returns 投票統計
 */
export async function getUserVoteStats(userId: string) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

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

  // 影響力スコア計算
  const votes = await prisma.voteHistory.findMany({
    where: { userId },
    select: { voteWeight: true }
  });

  const impactScore = Math.min(100, votes.reduce((sum: number, v: any) => sum + v.voteWeight, 0) * 2);

  return {
    total: totalVotes,
    thisMonth: thisMonthVotes,
    impactScore: Math.round(impactScore)
  };
}

/**
 * ユーザーのカテゴリ別投票実績を取得
 * PersonalStation用
 *
 * @param userId ユーザーID
 * @returns カテゴリ別投票数
 */
export async function getVoteStatsByCategory(userId: string) {
  const votes = await prisma.voteHistory.groupBy({
    by: ['postCategory'],
    where: { userId, postCategory: { not: null } },
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
 * 投稿のリアルタイムスコアを計算
 * IdeaVoiceTrackingPage用
 *
 * @param postId 投稿ID
 * @returns 計算されたスコア
 */
export async function calculateRealtimeScore(postId: string): Promise<number> {
  const stats = await getAccurateVoteStats(postId);
  return stats.weightedScore;
}

/**
 * 複数投稿のスコアを一括計算
 * IdeaVoiceTrackingPage用（パフォーマンス最適化）
 *
 * @param postIds 投稿IDリスト
 * @returns 投稿ID -> スコアのマップ
 */
export async function calculateBatchScores(postIds: string[]): Promise<Map<string, number>> {
  const scoreMap = new Map<string, number>();

  // 並列処理で高速化
  await Promise.all(
    postIds.map(async (postId) => {
      const score = await calculateRealtimeScore(postId);
      scoreMap.set(postId, score);
    })
  );

  return scoreMap;
}
