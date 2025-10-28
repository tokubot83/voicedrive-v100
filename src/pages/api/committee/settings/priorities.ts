import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { AuditService } from '../../../../services/AuditService';

/**
 * GET /api/committee/settings/priorities
 * 優先度レベル一覧取得
 *
 * PUT /api/committee/settings/priorities
 * 優先度レベル一括更新
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET - 優先度レベル一覧取得
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const priorities = await prisma.committeePriorityLevel.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({ priorities });
  } catch (error) {
    console.error('優先度レベル取得エラー:', error);
    return res.status(500).json({ error: '優先度レベルの取得に失敗しました' });
  }
}

/**
 * PUT - 優先度レベル一括更新
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { priorities, userId } = req.body;

    if (!priorities || !Array.isArray(priorities)) {
      return res.status(400).json({ error: '優先度リストが必要です' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'ユーザーIDが必要です' });
    }

    // 一括更新
    const updatePromises = priorities.map((priority) => {
      if (!priority.priorityId) {
        throw new Error('priorityIdが必要です');
      }

      return prisma.committeePriorityLevel.update({
        where: { priorityId: priority.priorityId },
        data: {
          enabled: priority.enabled !== undefined ? priority.enabled : undefined,
          displayOrder: priority.displayOrder !== undefined ? priority.displayOrder : undefined,
        },
      });
    });

    await Promise.all(updatePromises);

    // 監査ログ
    AuditService.log({
      userId,
      action: 'COMMITTEE_PRIORITIES_UPDATED',
      details: {
        updatedPriorities: priorities.map((p) => ({
          priorityId: p.priorityId,
          enabled: p.enabled,
        })),
      },
      severity: 'high',
    });

    return res.status(200).json({ success: true, updated: priorities.length });
  } catch (error) {
    console.error('優先度レベル更新エラー:', error);
    return res.status(500).json({ error: '優先度レベルの更新に失敗しました' });
  }
}
