import { prisma } from '../lib/prisma';
import { getProjectLevelFromScore } from './ProjectizationService';

/**
 * プロジェクトレベル遷移サービス
 * IdeaVoiceTrackingPage Phase 3実装
 *
 * プロジェクトレベルの遷移（PENDING → TEAM → DEPARTMENT等）を追跡・記録
 */

export interface LevelTransitionResult {
  transitionOccurred: boolean;
  fromLevel: string | null;
  toLevel: string;
  transition?: {
    id: string;
    fromLevel: string | null;
    toLevel: string;
    fromScore: number | null;
    toScore: number;
    upgradedAt: Date;
  };
}

/**
 * プロジェクトレベルの遷移をチェックし、必要に応じて履歴を記録
 *
 * @param postId - 投稿ID
 * @param newScore - 新しいスコア
 * @returns レベル遷移結果
 */
export async function trackLevelTransition(
  postId: string,
  newScore: number
): Promise<LevelTransitionResult> {
  // 現在のレベルを計算
  const currentLevel = getProjectLevelFromScore(newScore);

  // 最新の遷移履歴を取得
  const latestTransition = await prisma.projectLevelHistory.findFirst({
    where: { postId },
    orderBy: { upgradedAt: 'desc' }
  });

  const previousLevel = latestTransition?.toLevel || null;
  const previousScore = latestTransition?.toScore || null;

  // レベルが変わっていない場合は何もしない
  if (previousLevel === currentLevel) {
    return {
      transitionOccurred: false,
      fromLevel: previousLevel,
      toLevel: currentLevel
    };
  }

  // レベル遷移を記録
  const transition = await prisma.projectLevelHistory.create({
    data: {
      postId,
      fromLevel: previousLevel,
      toLevel: currentLevel,
      fromScore: previousScore,
      toScore: newScore,
      upgradedAt: new Date()
    }
  });

  // 投稿情報を取得して著者に通知
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, content: true }
  });

  if (post) {
    // レベルアップ通知を作成（非同期）
    createLevelUpNotification(
      post.authorId,
      postId,
      previousLevel,
      currentLevel,
      newScore
    ).catch(error => console.error('レベルアップ通知作成エラー:', error));
  }

  return {
    transitionOccurred: true,
    fromLevel: previousLevel,
    toLevel: currentLevel,
    transition: {
      id: transition.id,
      fromLevel: transition.fromLevel,
      toLevel: transition.toLevel,
      fromScore: transition.fromScore,
      toScore: transition.toScore,
      upgradedAt: transition.upgradedAt
    }
  };
}

/**
 * レベルアップ通知を作成
 *
 * @param userId - ユーザーID
 * @param postId - 投稿ID
 * @param fromLevel - 前のレベル
 * @param toLevel - 新しいレベル
 * @param score - 現在のスコア
 */
async function createLevelUpNotification(
  userId: string,
  postId: string,
  fromLevel: string | null,
  toLevel: string,
  score: number
): Promise<void> {
  const levelLabels: Record<string, string> = {
    'PENDING': 'アイデア検討中',
    'TEAM': 'チームプロジェクト',
    'DEPARTMENT': '部署プロジェクト',
    'FACILITY': '施設プロジェクト',
    'ORGANIZATION': '法人プロジェクト',
    'STRATEGIC': '戦略プロジェクト'
  };

  const levelIcons: Record<string, string> = {
    'PENDING': '💡',
    'TEAM': '👥',
    'DEPARTMENT': '🏢',
    'FACILITY': '🏥',
    'ORGANIZATION': '🏛️',
    'STRATEGIC': '⭐'
  };

  const fromLevelLabel = fromLevel ? levelLabels[fromLevel] : 'なし';
  const toLevelLabel = levelLabels[toLevel] || toLevel;
  const toLevelIcon = levelIcons[toLevel] || '🎯';

  try {
    await prisma.notification.create({
      data: {
        userId,
        type: 'project_level_up',
        title: `${toLevelIcon} レベルアップ！`,
        message: `あなたのアイデア投稿が「${toLevelLabel}」に昇格しました！（${fromLevelLabel} → ${toLevelLabel}、スコア: ${score}）`,
        relatedId: postId,
        relatedType: 'post',
        isRead: false
      }
    });
  } catch (error) {
    console.error('レベルアップ通知作成エラー:', error);
    throw error;
  }
}

/**
 * 投稿のレベル遷移履歴を取得
 *
 * @param postId - 投稿ID
 * @returns レベル遷移履歴のリスト
 */
export async function getLevelTransitionHistory(postId: string) {
  return await prisma.projectLevelHistory.findMany({
    where: { postId },
    orderBy: { upgradedAt: 'asc' }
  });
}

/**
 * 各レベルに到達するまでの日数を計算
 *
 * @param postId - 投稿ID
 * @returns レベル別到達日数
 */
export async function getDaysToReachEachLevel(postId: string): Promise<Record<string, number>> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { createdAt: true }
  });

  if (!post) return {};

  const transitions = await getLevelTransitionHistory(postId);

  const daysToReach: Record<string, number> = {};

  transitions.forEach((transition: any) => {
    const daysSinceCreation = Math.floor(
      (transition.upgradedAt.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    daysToReach[transition.toLevel] = daysSinceCreation;
  });

  return daysToReach;
}

/**
 * レベル遷移の速度を分析
 *
 * @param postId - 投稿ID
 * @returns レベル遷移速度分析結果
 */
export async function analyzeLevelTransitionSpeed(postId: string) {
  const transitions = await getLevelTransitionHistory(postId);

  if (transitions.length === 0) {
    return {
      totalTransitions: 0,
      averageDaysBetweenTransitions: 0,
      fastestTransition: null,
      slowestTransition: null
    };
  }

  const transitionSpeeds: Array<{
    fromLevel: string | null;
    toLevel: string;
    days: number;
  }> = [];

  for (let i = 1; i < transitions.length; i++) {
    const prevTransition = transitions[i - 1];
    const currTransition = transitions[i];

    const days = Math.floor(
      (currTransition.upgradedAt.getTime() - prevTransition.upgradedAt.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    transitionSpeeds.push({
      fromLevel: currTransition.fromLevel,
      toLevel: currTransition.toLevel,
      days
    });
  }

  const averageDays = transitionSpeeds.length > 0
    ? transitionSpeeds.reduce((sum, t) => sum + t.days, 0) / transitionSpeeds.length
    : 0;

  const fastestTransition = transitionSpeeds.length > 0
    ? transitionSpeeds.reduce((min, t) => t.days < min.days ? t : min)
    : null;

  const slowestTransition = transitionSpeeds.length > 0
    ? transitionSpeeds.reduce((max, t) => t.days > max.days ? t : max)
    : null;

  return {
    totalTransitions: transitions.length,
    averageDaysBetweenTransitions: Math.round(averageDays),
    fastestTransition,
    slowestTransition,
    allTransitions: transitionSpeeds
  };
}

/**
 * ユーザーのレベルアップ統計を取得
 *
 * @param userId - ユーザーID
 * @returns レベルアップ統計
 */
export async function getUserLevelUpStats(userId: string) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId, type: 'improvement' },
    select: { id: true }
  });

  const postIds = posts.map((p: { id: string }) => p.id);

  const transitions = await prisma.projectLevelHistory.findMany({
    where: { postId: { in: postIds } },
    orderBy: { upgradedAt: 'desc' }
  });

  const levelCounts: Record<string, number> = {};

  transitions.forEach((transition: any) => {
    const level = transition.toLevel;
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });

  return {
    totalLevelUps: transitions.length,
    levelCounts,
    recentTransitions: transitions.slice(0, 5) // 最新5件
  };
}

export const projectLevelTransitionService = {
  trackLevelTransition,
  getLevelTransitionHistory,
  getDaysToReachEachLevel,
  analyzeLevelTransitionSpeed,
  getUserLevelUpStats
};
