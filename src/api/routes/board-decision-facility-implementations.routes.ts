/**
 * 理事会決定施設別実施状況API
 * 作成日: 2025年10月13日
 *
 * エンドポイント:
 * - PUT /api/board-decision-facility-implementations/:implementationId - 施設実施状況更新（親レコード自動更新）
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { updateFacilityImplementationAndParent } from '../../services/boardDecisionService';

const router = Router();
const prisma = new PrismaClient();

/**
 * PUT /api/board-decision-facility-implementations/:implementationId
 * 施設別実施状況を更新し、親決定事項の進捗率・ステータスを自動更新
 *
 * リクエストボディ:
 * {
 *   status?: 'completed' | 'in_progress' | 'not_started',
 *   progress?: number (0-100),
 *   note?: string,
 *   userId: string (更新者)
 * }
 *
 * レスポンス:
 * {
 *   success: true,
 *   data: {
 *     implementation: {
 *       id: string,
 *       facilityName: string,
 *       status: string,
 *       progress: number,
 *       note: string | null
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
router.put('/board-decision-facility-implementations/:implementationId', async (req: Request, res: Response) => {
  try {
    const { implementationId } = req.params;
    const { status, progress, note, userId } = req.body;

    // 1. バリデーション
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userIdが必要です'
      });
    }

    // 少なくとも1つの更新項目が必要
    if (status === undefined && progress === undefined && note === undefined) {
      return res.status(400).json({
        success: false,
        error: '更新する項目を少なくとも1つ指定してください（status, progress, note）'
      });
    }

    // statusのバリデーション
    if (status !== undefined) {
      const validStatuses = ['completed', 'in_progress', 'not_started'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'statusは "completed", "in_progress", "not_started" のいずれかである必要があります'
        });
      }
    }

    // progressのバリデーション
    if (progress !== undefined) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          error: 'progressは0～100の数値である必要があります'
        });
      }
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

    // 3. 施設実施状況存在確認
    const implementation = await prisma.boardDecisionFacilityImplementation.findUnique({
      where: { id: implementationId }
    });

    if (!implementation) {
      return res.status(404).json({
        success: false,
        error: '施設別実施状況が見つかりません'
      });
    }

    console.log('[PUT /api/board-decision-facility-implementations/:implementationId] 更新開始:', {
      implementationId,
      facilityName: implementation.facilityName,
      oldStatus: implementation.status,
      oldProgress: implementation.progress,
      newStatus: status,
      newProgress: progress,
      userId
    });

    // 4. サービス層を使用して更新（親レコードも自動更新される）
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (note !== undefined) updateData.note = note;

    const result = await updateFacilityImplementationAndParent(implementationId, updateData);

    console.log('[PUT /api/board-decision-facility-implementations/:implementationId] 更新完了:', {
      implementationId: result.implementation.id,
      parentDecisionId: result.parentDecision.id,
      newProgress: result.parentDecision.progress,
      newStatus: result.parentDecision.status
    });

    // 5. レスポンス
    return res.status(200).json({
      success: true,
      data: {
        implementation: {
          id: result.implementation.id,
          facilityId: result.implementation.facilityId,
          facilityName: result.implementation.facilityName,
          status: result.implementation.status,
          progress: result.implementation.progress,
          note: result.implementation.note,
          startedAt: result.implementation.startedAt?.toISOString() || null,
          completedAt: result.implementation.completedAt?.toISOString() || null,
          updatedAt: result.implementation.updatedAt.toISOString()
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
    console.error('[PUT /api/board-decision-facility-implementations/:implementationId] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '施設別実施状況の更新中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
