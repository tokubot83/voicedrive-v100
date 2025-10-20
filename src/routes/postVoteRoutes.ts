/**
 * 投票APIルート
 */
import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';
import { prisma } from '../lib/prisma.js';
import { AgendaLevelNotificationService } from '../services/AgendaLevelNotificationService';
import { ProjectLevelNotificationService } from '../services/ProjectLevelNotificationService';

const router = Router();

/**
 * 全投稿を取得する
 * GET /api/posts
 */
router.get(
  '/',
  standardRateLimit,
  authenticateToken,
  async (req, res) => {
    // @ts-ignore - req.userはミドルウェアで追加
    const userId = req.user?.id;

    try {
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
              permissionLevel: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        posts,
      });
    } catch (error) {
      console.error('[PostAPI] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch posts',
      });
    }
  }
);

/**
 * 投票を記録する
 * POST /api/posts/:postId/vote
 */
router.post(
  '/:postId/vote',
  standardRateLimit,
  authenticateToken,
  async (req, res) => {
    const { postId } = req.params;
    const { voteOption } = req.body; // 'strongly-support' | 'support' | 'neutral' | 'oppose' | 'strongly-oppose'
    // @ts-ignore - req.userはミドルウェアで追加
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!voteOption) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'voteOption is required',
      });
    }

    try {
      // トランザクション開始
      const result = await prisma.$transaction(async (tx) => {
        // 投稿を取得
        const post = await tx.post.findUnique({
          where: { id: postId },
          include: {
            author: true,
          },
        });

        if (!post) {
          throw new Error('Post not found');
        }

        // 既存の投票を確認
        const existingVote = await tx.vote.findFirst({
          where: {
            postId,
            userId,
          },
        });

        // 投票を作成または更新
        if (existingVote) {
          await tx.vote.update({
            where: { id: existingVote.id },
            data: {
              voteOption,
              votedAt: new Date(),
            },
          });
        } else {
          await tx.vote.create({
            data: {
              postId,
              userId,
              voteOption,
              voteWeight: 1, // 現時点では全員1票
              votedAt: new Date(),
            },
          });
        }

        // 投票集計
        const votes = await tx.vote.findMany({
          where: { postId },
        });

        // スコア計算
        const newScore = calculateAgendaScore(votes);

        // 🆕 投稿タイプに応じて前回スコアを取得
        const previousScore = post.type === 'project'
          ? (post.projectScore || 0)
          : (post.agendaScore || 0);

        // スコアが変わった場合のみ更新
        if (newScore !== previousScore) {
          // 🆕 投稿タイプに応じてスコアフィールドを分岐
          if (post.type === 'project') {
            // プロジェクトモード: projectScore を更新
            await tx.post.update({
              where: { id: postId },
              data: {
                projectScore: newScore,
              },
            });
            console.log(`[VoteAPI] プロジェクトスコア更新: ${postId} → ${previousScore}点 から ${newScore}点`);
          } else {
            // 議題モード: agendaScore を更新（デフォルト）
            await tx.post.update({
              where: { id: postId },
              data: {
                agendaScore: newScore,
              },
            });
            console.log(`[VoteAPI] 議題スコア更新: ${postId} → ${previousScore}点 から ${newScore}点`);
          }
        }

        return {
          post,
          newScore,
          previousScore,
          voteCount: votes.length,
        };
      });

      // 🆕 トランザクション外でスコア閾値チェック（モード別）
      if (result.post.type === 'project') {
        await checkProjectScoreThresholds(result.post, result.previousScore, result.newScore);
      } else {
        await checkScoreThresholds(result.post, result.previousScore, result.newScore);
      }

      return res.json({
        success: true,
        message: 'Vote recorded successfully',
        data: {
          postId,
          newScore: result.newScore,
          voteCount: result.voteCount,
        },
      });
    } catch (error) {
      console.error('[VoteAPI] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to record vote',
      });
    }
  }
);

/**
 * 投票集計を取得する
 * GET /api/posts/:postId/votes
 */
router.get(
  '/:postId/votes',
  standardRateLimit,
  async (req, res) => {
    const { postId } = req.params;

    try {
      const votes = await prisma.vote.findMany({
        where: { postId },
      });

      const summary = {
        totalVotes: votes.length,
        breakdown: {
          'strongly-support': votes.filter((v) => v.voteOption === 'strongly-support').length,
          support: votes.filter((v) => v.voteOption === 'support').length,
          neutral: votes.filter((v) => v.voteOption === 'neutral').length,
          oppose: votes.filter((v) => v.voteOption === 'oppose').length,
          'strongly-oppose': votes.filter((v) => v.voteOption === 'strongly-oppose').length,
        },
        agendaScore: calculateAgendaScore(votes),
      };

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('[VoteAPI] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to get vote summary',
      });
    }
  }
);

/**
 * ユーザーの投票を取得する
 * GET /api/posts/:postId/my-vote
 */
router.get(
  '/:postId/my-vote',
  standardRateLimit,
  authenticateToken,
  async (req, res) => {
    const { postId } = req.params;
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    try {
      const vote = await prisma.vote.findFirst({
        where: {
          postId,
          userId,
        },
      });

      return res.json({
        success: true,
        data: vote
          ? {
              voteOption: vote.voteOption,
              votedAt: vote.votedAt,
            }
          : null,
      });
    } catch (error) {
      console.error('[VoteAPI] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      });
    }
  }
);

// ========== ヘルパー関数 ==========

/**
 * スコア計算ロジック
 *
 * 各投票オプションの重み:
 * - strongly-support: +10点
 * - support: +5点
 * - neutral: 0点
 * - oppose: -5点
 * - strongly-oppose: -10点
 */
function calculateAgendaScore(votes: any[]): number {
  const weights: Record<string, number> = {
    'strongly-support': 10,
    support: 5,
    neutral: 0,
    oppose: -5,
    'strongly-oppose': -10,
  };

  let totalScore = 0;
  for (const vote of votes) {
    const weight = weights[vote.voteOption] || 0;
    totalScore += weight * (vote.voteWeight || 1);
  }

  return Math.max(0, totalScore); // 負の値にはならない
}

/**
 * 議題モード: スコア閾値チェックと通知送信
 *
 * 閾値:
 * - 30点: 部署検討開始（主任・師長に通知）
 * - 50点: 部署議題（主任の判断要求）
 * - 100点: 施設議題（副看護部長の判断要求）
 * - 300点: 法人検討（事務長の判断要求）
 * - 600点: 法人議題（法人統括事務局長の判断要求）
 */
async function checkScoreThresholds(
  post: any,
  previousScore: number,
  newScore: number
): Promise<void> {
  const thresholds = [
    { score: 30, method: 'notifyScoreThreshold30', status: 'dept_review' },
    { score: 50, method: 'notifyScoreThreshold50', status: 'pending' },
    { score: 100, method: 'notifyScoreThreshold100', status: 'pending_deputy_director_review' },
    { score: 300, method: 'notifyScoreThreshold300', status: 'pending_general_affairs_review' },
    { score: 600, method: 'notifyScoreThreshold600', status: 'pending_general_affairs_director_review' },
  ];

  const notificationService = AgendaLevelNotificationService.getInstance();

  for (const threshold of thresholds) {
    // 閾値を跨いだ場合のみ通知
    if (previousScore < threshold.score && newScore >= threshold.score) {
      console.log(`[VoteAPI] 議題モード閾値到達: ${threshold.score}点 → 通知送信`);

      // 通知送信
      const method = notificationService[threshold.method as keyof AgendaLevelNotificationService] as any;
      if (typeof method === 'function') {
        const notificationCount = await method.call(notificationService, post);
        console.log(`[VoteAPI] 通知送信完了: ${notificationCount}件`);
      }

      // agendaStatusを更新
      if (threshold.status) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            agendaStatus: threshold.status,
          },
        });
        console.log(`[VoteAPI] agendaStatus更新: ${post.id} → ${threshold.status}`);
      }
    }
  }
}

/**
 * 🆕 プロジェクトモード: スコア閾値チェックと通知送信
 *
 * 閾値:
 * - 100点: チームプロジェクト化
 * - 200点: 部署プロジェクト化
 * - 400点: 施設プロジェクト化
 * - 800点: 法人プロジェクト化
 */
async function checkProjectScoreThresholds(
  post: any,
  previousScore: number,
  newScore: number
): Promise<void> {
  const thresholds = [
    { score: 100, level: 'TEAM', name: 'チームプロジェクト' },
    { score: 200, level: 'DEPARTMENT', name: '部署プロジェクト' },
    { score: 400, level: 'FACILITY', name: '施設プロジェクト' },
    { score: 800, level: 'ORGANIZATION', name: '法人プロジェクト' },
  ];

  for (const threshold of thresholds) {
    // 閾値を跨いだ場合のみ通知
    if (previousScore < threshold.score && newScore >= threshold.score) {
      console.log(`[VoteAPI] プロジェクトモード閾値到達: ${threshold.score}点 → ${threshold.name}に昇格`);

      // projectLevel と lastProjectLevelUpgrade を更新
      await prisma.post.update({
        where: { id: post.id },
        data: {
          projectLevel: threshold.level,
          lastProjectLevelUpgrade: new Date(),
        },
      });
      console.log(`[VoteAPI] projectLevel更新: ${post.id} → ${threshold.level} (${threshold.name})`);

      // 🎉 レベルアップ通知を送信
      const notificationService = ProjectLevelNotificationService.getInstance();
      const notificationCount = await notificationService.notifyLevelUp(post, threshold.level, newScore);
      console.log(`[VoteAPI] プロジェクト通知送信完了: ${notificationCount}件`);
    }
  }
}

export default router;
