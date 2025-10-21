/**
 * 投票スコープ設定API
 *
 * GET: 投票スコープ設定一覧取得
 * POST: 投票スコープ設定作成（通常は使用しない）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * 投票スコープ設定一覧取得
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 全部署の議題モード設定を取得
    const configs = await prisma.agendaModeConfig.findMany({
      include: {
        department: {
          select: {
            departmentId: true,
            departmentName: true,
            level: true,
          },
        },
      },
      orderBy: {
        department: {
          level: 'asc',
        },
      },
    });

    // レスポンス整形
    const formattedConfigs = configs.map((config) => ({
      id: config.id,
      departmentId: config.departmentId,
      departmentName: config.department.departmentName,
      departmentLevel: config.department.level,
      votingScopeRules: config.votingScopeRules,
      agendaUpgradeThreshold: config.agendaUpgradeThreshold,
      primaryApproverRotation: config.primaryApproverRotation,
      metadata: config.metadata,
      isActive: config.isActive,
      updatedAt: config.updatedAt,
    }));

    return res.status(200).json({
      configs: formattedConfigs,
      total: formattedConfigs.length,
    });
  } catch (error) {
    console.error('[API Error] GET /api/agenda-mode/voting-scopes:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
