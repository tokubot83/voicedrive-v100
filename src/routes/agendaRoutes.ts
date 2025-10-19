// 議題モード判断処理APIルート
import { Router } from 'express';
import { AgendaDecisionService, type AgendaDecisionInput } from '../services/AgendaDecisionService.js';

const router = Router();

console.log('📋 [AgendaRoutes] Loading agenda routes...');

/**
 * 議題判断処理エンドポイント
 * POST /api/agenda/decision
 */
router.post('/decision', async (req, res) => {
  try {
    const { postId, decisionType, deciderId, reason, committeeId } = req.body;

    // バリデーション
    if (!postId || !decisionType || !deciderId || !reason) {
      return res.status(400).json({
        success: false,
        error: '必須パラメータが不足しています',
        missing: {
          postId: !postId,
          decisionType: !decisionType,
          deciderId: !deciderId,
          reason: !reason,
        },
      });
    }

    // 判断処理実行
    const service = new AgendaDecisionService();
    const input: AgendaDecisionInput = {
      postId,
      decisionType,
      deciderId,
      reason,
      committeeId,
    };

    console.log(`[AgendaAPI] 判断処理開始:`, {
      postId,
      decisionType,
      deciderId,
    });

    const result = await service.executeDecision(input);

    if (!result.success) {
      console.error(`[AgendaAPI] 判断処理失敗:`, result.message);
      return res.status(400).json({
        success: false,
        error: result.message,
      });
    }

    console.log(`[AgendaAPI] 判断処理成功:`, {
      postId,
      postAgendaStatus: result.post?.agendaStatus,
      notificationsSent: result.notificationsSent,
    });

    return res.status(200).json({
      success: true,
      postId: result.post?.id,
      newStatus: result.post?.agendaStatus,
      notificationsSent: result.notificationsSent,
      message: result.message,
    });
  } catch (error) {
    console.error('[AgendaAPI] サーバーエラー:', error);
    return res.status(500).json({
      success: false,
      error: 'サーバー内部エラーが発生しました',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * 投稿の判断履歴取得
 * GET /api/agenda/decisions/:postId
 */
router.get('/decisions/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const { prisma } = await import('../lib/prisma.js');
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        agendaScore: true,
        agendaLevel: true,
        agendaStatus: true,
        agendaDecisionBy: true,
        agendaDecisionAt: true,
        agendaDecisionReason: true,
        agendaRescueLevel: true,
        agendaVotingDeadline: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '投稿が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('[AgendaAPI] 判断履歴取得エラー:', error);
    return res.status(500).json({
      success: false,
      error: 'サーバー内部エラーが発生しました',
    });
  }
});

export default router;
