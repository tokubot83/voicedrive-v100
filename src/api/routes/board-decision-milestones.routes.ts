/**
 * 理事会決定マイルストーンAPI
 * 作成日: 2025年10月13日
 *
 * エンドポイント:
 * - PUT /api/board-decision-milestones/:milestoneId - マイルストーン更新（親レコード自動更新）
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { updateMilestoneAndParent } from '../../services/boardDecisionService';

const router = Router();
const prisma = new PrismaClient();

/**
 * PUT /api/board-decision-milestones/:milestoneId
 * マイルストーンのステータスを更新し、親決定事項の進捗率・ステータスを自動更新
 *
 * リクエストボディ:
 * {
 *   status: 'completed' | 'in_progress' | 'pending' | 'delayed',
 *   userId: string (更新者)
 * }
 *
 * レスポンス:
 * {
 *   success: true,
 *   data: {
 *     milestone: {
 *       id: string,
 *       title: string,
 *       status: string,
 *       completedAt: string | null
 *     },
 *     parentDecision: {
 *       id: string,
 *       title: string,
 *       progress: number,
 *       status: string,
 *       lastUpdate: string
 *     }
 *   }
 * }
 */
router.put('/board-decision-milestones/:milestoneId', async (req: Request, res: Response) => {
  try {
    const { milestoneId } = req.params;
    const { status, userId } = req.body;

    // 1. バリデーション
    const validStatuses = ['completed', 'in_progress', 'pending', 'delayed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'statusは "completed", "in_progress", "pending", "delayed" のいずれかである必要があります'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userIdが必要です'
      });
    }

    // 2. ユーザー存在確認
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    // 3. マイルストーン存在確認
    const milestone = await prisma.boardDecisionMilestone.findUnique({
      where: { id: milestoneId }
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'マイルストーンが見つかりません'
      });
    }

    console.log('[PUT /api/board-decision-milestones/:milestoneId] 更新開始:', {
      milestoneId,
      oldStatus: milestone.status,
      newStatus: status,
      userId
    });

    // 4. サービス層を使用して更新（親レコードも自動更新される）
    const result = await updateMilestoneAndParent(milestoneId, status);

    console.log('[PUT /api/board-decision-milestones/:milestoneId] 更新完了:', {
      milestoneId: result.milestone.id,
      parentDecisionId: result.parentDecision.id,
      newProgress: result.parentDecision.progress,
      newStatus: result.parentDecision.status
    });

    // 5. レスポンス
    return res.status(200).json({
      success: true,
      data: {
        milestone: {
          id: result.milestone.id,
          title: result.milestone.title,
          status: result.milestone.status,
          deadline: result.milestone.deadline.toISOString(),
          assignee: result.milestone.assignee,
          completedAt: result.milestone.completedAt?.toISOString() || null,
          updatedAt: result.milestone.updatedAt.toISOString()
        },
        parentDecision: {
          id: result.parentDecision.id,
          title: result.parentDecision.title,
          progress: result.parentDecision.progress,
          status: result.parentDecision.status,
          lastUpdate: result.parentDecision.lastUpdate.toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error('[PUT /api/board-decision-milestones/:milestoneId] エラー:', error);
    return res.status(500).json({
      success: false,
      error: 'マイルストーンの更新中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
