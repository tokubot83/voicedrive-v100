/**
 * 議題昇格APIルート
 * Phase 5実装
 */

import express, { Request, Response } from 'express';
import agendaEscalationService, { EscalationRequest } from '../services/AgendaEscalationService';
import { authenticateToken } from '../middleware/authMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';

const router = express.Router();

/**
 * POST /api/agenda/:postId/escalate
 * 議題レベルを昇格させる
 */
router.post(
  '/:postId/escalate',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const { targetLevel, reason } = req.body;
      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;

      console.log(`[API] 昇格リクエスト: postId=${postId}, targetLevel=${targetLevel}, userId=${userId}`);

      // バリデーション
      if (!targetLevel) {
        return res.status(400).json({
          success: false,
          error: 'targetLevelは必須です',
        });
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '昇格理由は必須です',
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です',
        });
      }

      // 昇格処理を実行
      const escalationRequest: EscalationRequest = {
        postId,
        targetLevel,
        deciderId: userId,
        reason: reason.trim(),
      };

      const result = await agendaEscalationService.escalateAgenda(escalationRequest);

      console.log(`[API] 昇格成功: ${result.previousLevel} → ${result.newLevel}`);

      return res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      console.error('[API] 昇格エラー:', error);

      // 権限エラー
      if (error.message.includes('権限')) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      // バリデーションエラー
      if (error.message.includes('昇格はできません') || error.message.includes('見つかりません')) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      // その他のエラー
      return res.status(500).json({
        success: false,
        error: '昇格処理に失敗しました',
        details: error.message,
      });
    }
  }
);

/**
 * GET /api/agenda/:postId/available-escalations
 * 昇格可能なレベルを取得
 */
router.get(
  '/:postId/available-escalations',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です',
        });
      }

      // 投稿とユーザー情報を取得
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          error: '投稿が見つかりません',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません',
        });
      }

      // 昇格可能なレベルを取得
      const availableLevels = agendaEscalationService.getNextAvailableLevels(
        post.agendaScore || 0,
        user.permissionLevel
      );

      return res.status(200).json({
        success: true,
        data: {
          currentScore: post.agendaScore || 0,
          userPermissionLevel: user.permissionLevel,
          availableLevels,
          canEscalate: availableLevels.length > 0,
        },
      });
    } catch (error: any) {
      console.error('[API] 昇格可能レベル取得エラー:', error);

      return res.status(500).json({
        success: false,
        error: '昇格可能レベルの取得に失敗しました',
        details: error.message,
      });
    }
  }
);

export default router;
