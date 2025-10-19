/**
 * 議題昇格後の期限到達・未達成処理APIルート
 * Phase 6実装
 */

import express, { Request, Response } from 'express';
import { agendaExpiredEscalationService, ExpiredEscalationRequest } from '../services/AgendaExpiredEscalationService';
import { authenticateToken } from '../middleware/authMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';

const router = express.Router();

/**
 * GET /api/agenda/expired-escalations
 * 期限到達・未達成の昇格提案を取得
 */
router.get(
  '/expired-escalations',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です',
        });
      }

      const expiredEscalations = await agendaExpiredEscalationService.detectExpiredEscalations();

      return res.status(200).json({
        success: true,
        data: expiredEscalations,
        count: expiredEscalations.length,
      });
    } catch (error: any) {
      console.error('[API] 期限到達提案取得エラー:', error);

      return res.status(500).json({
        success: false,
        error: '期限到達提案の取得に失敗しました',
        details: error.message,
      });
    }
  }
);

/**
 * POST /api/agenda/expired-escalation/decide
 * 期限到達・未達成提案の判断処理
 */
router.post(
  '/expired-escalation/decide',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postId, decision, reason } = req.body;
      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;

      console.log(`[API] 期限到達判断リクエスト: postId=${postId}, decision=${decision}, userId=${userId}`);

      // バリデーション
      if (!postId) {
        return res.status(400).json({
          success: false,
          error: 'postIdは必須です',
        });
      }

      if (!decision) {
        return res.status(400).json({
          success: false,
          error: 'decisionは必須です',
        });
      }

      if (!['approve_at_current_level', 'downgrade', 'reject'].includes(decision)) {
        return res.status(400).json({
          success: false,
          error: '無効な判断です',
        });
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '判断理由は必須です',
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です',
        });
      }

      // 判断処理を実行
      const request: ExpiredEscalationRequest = {
        postId,
        decision,
        deciderId: userId,
        reason: reason.trim(),
      };

      const result = await agendaExpiredEscalationService.processExpiredEscalation(request);

      console.log(`[API] 期限到達判断完了: ${decision}`);

      return res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      console.error('[API] 期限到達判断エラー:', error);

      // 権限エラー
      if (error.message.includes('権限')) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      // バリデーションエラー
      if (
        error.message.includes('見つかりません') ||
        error.message.includes('到達していません') ||
        error.message.includes('達しています')
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      // その他のエラー
      return res.status(500).json({
        success: false,
        error: '判断処理に失敗しました',
        details: error.message,
      });
    }
  }
);

export default router;
