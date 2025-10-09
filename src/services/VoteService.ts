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
  votes.forEach(vote => {
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

  votes.forEach(vote => {
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
