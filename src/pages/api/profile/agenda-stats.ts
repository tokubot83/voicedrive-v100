/**
 * 議題統計情報API
 *
 * GET: ユーザーの議題モード統計情報を取得
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { AgendaStatsService } from '../../../api/db/agendaStatsService';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 認証チェック（仮実装）
  // TODO: 本番環境では適切なJWT認証を実装
  const userId = req.headers['x-user-id'] as string || 'user1';

  if (req.method === 'GET') {
    return handleGet(req, res, userId);
  }

  return res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed'
  });
}

/**
 * 議題統計情報を取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        department: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'ユーザーが見つかりません'
      });
    }

    // 議題統計を取得
    const statsResult = await AgendaStatsService.getUserAgendaStats(userId);

    if (!statsResult.success) {
      return res.status(500).json({
        success: false,
        error: 'STATS_FETCH_FAILED',
        message: statsResult.error || '議題統計の取得に失敗しました'
      });
    }

    // 部署平均も取得（比較用）
    let departmentAverage = null;
    if (user.department) {
      const deptStatsResult = await AgendaStatsService.getDepartmentAgendaStats(user.department);
      if (deptStatsResult.success && deptStatsResult.data) {
        departmentAverage = deptStatsResult.data;
      }
    }

    return res.status(200).json({
      success: true,
      stats: statsResult.data,
      departmentAverage
    });

  } catch (error) {
    console.error('[Agenda Stats API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
