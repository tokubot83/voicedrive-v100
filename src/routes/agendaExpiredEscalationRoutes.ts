/**
 * 議題昇格後の期限到達・未達成処理APIルート
 * Phase 6実装
 */

import express, { Request, Response } from 'express';
import { agendaExpiredEscalationService, ExpiredEscalationRequest } from '../services/AgendaExpiredEscalationService';
import { authenticateToken } from '../api/middleware/auth';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';
import {
  recordExpiredEscalationDecision,
  getExpiredEscalationHistory,
  getExpiredEscalationProposals
} from '../api/expiredEscalationDecision';

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
      const userId = req.user?.staffId;

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

/**
 * POST /api/agenda/expired-escalation-decisions
 * 期限到達判断を記録する
 */
router.post(
  '/expired-escalation-decisions',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const {
        postId,
        decision,
        decisionReason,
        currentScore,
        targetScore,
        agendaLevel,
        proposalType,
        department,
        facilityId
      } = req.body;

      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です',
        });
      }

      // バリデーション
      if (!postId || !decision || !decisionReason || !currentScore || !targetScore || !agendaLevel) {
        return res.status(400).json({
          success: false,
          error: '必須パラメータが不足しています',
        });
      }

      const result = await recordExpiredEscalationDecision({
        postId,
        decision,
        deciderId: userId,
        decisionReason,
        currentScore,
        targetScore,
        agendaLevel,
        proposalType,
        department,
        facilityId
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        decisionId: result.decisionId,
      });
    } catch (error: any) {
      console.error('[API] 期限到達判断記録エラー:', error);
      return res.status(500).json({
        success: false,
        error: '判断の記録に失敗しました',
        details: error.message,
      });
    }
  }
);

/**
 * GET /api/agenda/expired-escalation-decisions/history
 * 期限到達判断履歴を取得する
 */
router.get(
  '/expired-escalation-decisions/history',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;
      // @ts-ignore - req.userはミドルウェアで追加
      const permissionLevel = req.user?.permissionLevel || 1;
      // @ts-ignore - req.userはミドルウェアで追加
      const facilityId = req.user?.facilityId;
      // @ts-ignore - req.userはミドルウェアで追加
      const departmentId = req.user?.department;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です',
        });
      }

      const { startDate, endDate, limit, offset } = req.query;

      const history = await getExpiredEscalationHistory({
        userId,
        permissionLevel,
        facilityId,
        departmentId,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      return res.status(200).json({
        success: true,
        ...history,
      });
    } catch (error: any) {
      console.error('[API] 判断履歴取得エラー:', error);
      return res.status(500).json({
        success: false,
        error: '判断履歴の取得に失敗しました',
        details: error.message,
      });
    }
  }
);

/**
 * GET /api/agenda/expired-escalation-proposals
 * 期限到達提案一覧を取得する（判断待ち）
 */
router.get(
  '/expired-escalation-proposals',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;
      // @ts-ignore - req.userはミドルウェアで追加
      const permissionLevel = req.user?.permissionLevel || 1;
      // @ts-ignore - req.userはミドルウェアで追加
      const facilityId = req.user?.facilityId;
      // @ts-ignore - req.userはミドルウェアで追加
      const department = req.user?.department;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です',
        });
      }

      const { limit, offset } = req.query;

      const result = await getExpiredEscalationProposals({
        userId,
        permissionLevel,
        facilityId,
        department,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      return res.status(200).json({
        success: true,
        proposals: result.proposals,
        total: result.total,
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

export default router;
