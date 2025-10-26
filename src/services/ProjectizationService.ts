import { prisma } from '../lib/prisma';

/**
 * プロジェクト化サービス
 * IdeaVoiceTrackingPage Phase 2実装
 *
 * 投稿がプロジェクト化閾値（スコア100）に到達したときの記録と通知を管理
 */

export interface ProjectizationResult {
  isProjectized: boolean;
  wasJustProjectized: boolean;
  projectizedHistory?: {
    id: string;
    projectizedAt: Date;
    projectizedScore: number;
    projectLevel: string;
  };
}

/**
 * 投稿のプロジェクト化状態をチェックし、必要に応じて履歴を記録
 *
 * @param postId - 投稿ID
 * @param currentScore - 現在のスコア
 * @returns プロジェクト化結果
 */
export async function checkAndRecordProjectization(
  postId: string,
  currentScore: number
): Promise<ProjectizationResult> {
  const PROJECTIZATION_THRESHOLD = 100;

  // 既にプロジェクト化済みか確認
  const existingHistory = await prisma.projectizedHistory.findFirst({
    where: { postId },
    orderBy: { projectizedAt: 'desc' }
  });

  const isProjectized = currentScore >= PROJECTIZATION_THRESHOLD;

  // 既にプロジェクト化済みの場合
  if (existingHistory) {
    return {
      isProjectized: true,
      wasJustProjectized: false,
      projectizedHistory: {
        id: existingHistory.id,
        projectizedAt: existingHistory.projectizedAt,
        projectizedScore: existingHistory.projectizedScore,
        projectLevel: existingHistory.projectLevel
      }
    };
  }

  // 初めてプロジェクト化閾値を超えた場合
  if (isProjectized && !existingHistory) {
    const projectLevel = getProjectLevelFromScore(currentScore);

    const projectizedHistory = await prisma.projectizedHistory.create({
      data: {
        postId,
        projectizedScore: currentScore,
        projectLevel,
        previousScore: 0, // 初回プロジェクト化なので前回スコアは0
        scoreIncrement: currentScore,
        isNotified: false
      }
    });

    // 投稿情報を取得して著者に通知
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, content: true }
    });

    if (post) {
      // 通知を作成（非同期）
      createProjectizationNotification(post.authorId, postId, projectLevel, currentScore)
        .catch(error => console.error('通知作成エラー:', error));
    }

    return {
      isProjectized: true,
      wasJustProjectized: true,
      projectizedHistory: {
        id: projectizedHistory.id,
        projectizedAt: projectizedHistory.projectizedAt,
        projectizedScore: projectizedHistory.projectizedScore,
        projectLevel: projectizedHistory.projectLevel
      }
    };
  }

  // プロジェクト化未達成
  return {
    isProjectized: false,
    wasJustProjectized: false
  };
}

/**
 * スコアからプロジェクトレベルを判定
 *
 * @param score - スコア
 * @returns プロジェクトレベル
 */
export function getProjectLevelFromScore(score: number): string {
  if (score >= 800) return 'ORGANIZATION';
  if (score >= 400) return 'FACILITY';
  if (score >= 200) return 'DEPARTMENT';
  if (score >= 100) return 'TEAM';
  return 'PENDING';
}

/**
 * プロジェクト化達成通知を作成
 *
 * @param userId - ユーザーID
 * @param postId - 投稿ID
 * @param projectLevel - プロジェクトレベル
 * @param score - 達成スコア
 */
async function createProjectizationNotification(
  userId: string,
  postId: string,
  projectLevel: string,
  score: number
): Promise<void> {
  const levelLabels: Record<string, string> = {
    'TEAM': 'チームプロジェクト',
    'DEPARTMENT': '部署プロジェクト',
    'FACILITY': '施設プロジェクト',
    'ORGANIZATION': '法人プロジェクト',
    'STRATEGIC': '戦略プロジェクト'
  };

  const levelLabel = levelLabels[projectLevel] || 'プロジェクト';

  try {
    await prisma.notification.create({
      data: {
        userId,
        type: 'project_achievement',
        title: `🎉 プロジェクト化達成！`,
        message: `あなたのアイデア投稿が${levelLabel}として承認されました！（スコア: ${score}）`,
        relatedId: postId,
        relatedType: 'post',
        isRead: false
      }
    });

    // ProjectizedHistoryの通知フラグを更新
    await prisma.projectizedHistory.updateMany({
      where: { postId, isNotified: false },
      data: {
        isNotified: true,
        notifiedAt: new Date()
      }
    });
  } catch (error) {
    console.error('プロジェクト化通知作成エラー:', error);
    throw error;
  }
}

/**
 * 投稿のプロジェクト化履歴を取得
 *
 * @param postId - 投稿ID
 * @returns プロジェクト化履歴（存在しない場合はnull）
 */
export async function getProjectizedHistory(postId: string) {
  return await prisma.projectizedHistory.findFirst({
    where: { postId },
    orderBy: { projectizedAt: 'desc' }
  });
}

/**
 * ユーザーのプロジェクト化達成数を取得
 *
 * @param userId - ユーザーID
 * @returns プロジェクト化達成数
 */
export async function getUserProjectizedCount(userId: string): Promise<number> {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    select: { id: true }
  });

  const postIds = posts.map((p: { id: string }) => p.id);

  return await prisma.projectizedHistory.count({
    where: {
      postId: { in: postIds }
    }
  });
}

/**
 * プロジェクト化達成率を計算
 *
 * @param userId - ユーザーID
 * @returns プロジェクト化達成率（0-100）
 */
export async function getUserProjectizationRate(userId: string): Promise<number> {
  const totalPosts = await prisma.post.count({
    where: {
      authorId: userId,
      type: 'improvement' // アイデアボイス投稿のみ
    }
  });

  if (totalPosts === 0) return 0;

  const projectizedCount = await getUserProjectizedCount(userId);

  return Math.round((projectizedCount / totalPosts) * 100);
}

export const projectizationService = {
  checkAndRecordProjectization,
  getProjectLevelFromScore,
  getProjectizedHistory,
  getUserProjectizedCount,
  getUserProjectizationRate
};
