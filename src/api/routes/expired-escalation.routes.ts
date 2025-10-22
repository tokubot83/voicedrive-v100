/**
 * 期限到達提案の判断API
 * 作成日: 2025年10月21日
 *
 * エンドポイント:
 * - GET /api/agenda/expired-escalation-proposals - 期限到達提案一覧取得
 * - POST /api/agenda/expired-escalation-decisions - 判断記録
 */

import { Router, Request, Response } from 'express';
import {
  getExpiredEscalationProposals,
  recordExpiredEscalationDecision,
  RecordDecisionParams
} from '../expiredEscalationDecision';

const router = Router();

/**
 * GET /api/agenda/expired-escalation-proposals
 * 期限到達提案一覧を取得
 *
 * クエリパラメータ:
 * - userId: ユーザーID（必須）
 * - permissionLevel: 権限レベル（必須）
 * - facilityId: 施設ID（オプション）
 * - department: 部署（オプション）
 * - limit: 取得件数（オプション、デフォルト: 20）
 * - offset: オフセット（オプション、デフォルト: 0）
 */
router.get('/expired-escalation-proposals', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      permissionLevel,
      facilityId,
      department,
      limit,
      offset
    } = req.query;

    // バリデーション
    if (!userId || !permissionLevel) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'userId と permissionLevel は必須です'
      });
    }

    const params = {
      userId: userId as string,
      permissionLevel: Number(permissionLevel),
      facilityId: facilityId as string | undefined,
      department: department as string | undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0
    };

    const { proposals, total } = await getExpiredEscalationProposals(params);

    return res.status(200).json({
      success: true,
      data: {
        proposals,
        pagination: {
          total,
          limit: params.limit,
          offset: params.offset,
          hasMore: total > params.offset + params.limit
        }
      }
    });

  } catch (error: any) {
    console.error('[GET /api/agenda/expired-escalation-proposals] エラー:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '提案の取得に失敗しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/agenda/expired-escalation-decisions
 * 期限到達提案の判断を記録
 *
 * リクエストボディ:
 * {
 *   postId: string,
 *   decision: 'approve_at_current_level' | 'downgrade' | 'reject',
 *   decisionReason: string,
 *   currentScore: number,
 *   targetScore: number,
 *   agendaLevel: string,
 *   proposalType?: string,
 *   department?: string
 * }
 *
 * ヘッダー:
 * - userId: ユーザーID（必須）
 */
router.post('/expired-escalation-decisions', async (req: Request, res: Response) => {
  try {
    const {
      postId,
      decision,
      decisionReason,
      currentScore,
      targetScore,
      agendaLevel,
      proposalType,
      department
    } = req.body;

    // ユーザーIDをヘッダーまたはボディから取得
    const userId = req.headers['x-user-id'] as string || req.body.userId;

    // バリデーション
    if (!postId || !decision || !decisionReason || !userId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '必須項目が不足しています（postId, decision, decisionReason, userId）'
      });
    }

    if (decisionReason.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '判断理由は10文字以上入力してください'
      });
    }

    if (!['approve_at_current_level', 'downgrade', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '判断内容が不正です'
      });
    }

    // 判断を記録
    const params: RecordDecisionParams = {
      postId,
      decision,
      deciderId: userId,
      decisionReason,
      currentScore: currentScore || 0,
      targetScore: targetScore || 100,
      agendaLevel,
      proposalType,
      department
    };

    const result = await recordExpiredEscalationDecision(params);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'RECORD_ERROR',
        message: result.error || '判断の記録に失敗しました'
      });
    }

    return res.status(200).json({
      success: true,
      message: '判断を記録しました',
      data: {
        decisionId: result.decisionId
      }
    });

  } catch (error: any) {
    console.error('[POST /api/agenda/expired-escalation-decisions] エラー:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '判断の記録に失敗しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
