/**
 * ユーザー統計情報API
 *
 * GET: ユーザーの活動統計情報を取得
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '../../../api/db/userService';
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
 * ユーザー統計情報を取得
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
        role: true,
        profilePhotoUrl: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'ユーザーが見つかりません'
      });
    }

    // 統計情報を取得
    const statsResult = await UserService.getUserStats(userId, user.employeeId);

    if (!statsResult.success) {
      return res.status(500).json({
        success: false,
        error: 'STATS_FETCH_FAILED',
        message: statsResult.error || '統計情報の取得に失敗しました'
      });
    }

    return res.status(200).json({
      success: true,
      stats: statsResult.data
    });

  } catch (error) {
    console.error('[Profile Stats API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
