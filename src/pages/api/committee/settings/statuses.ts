import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { AuditService } from '../../../../services/AuditService';

/**
 * GET /api/committee/settings/statuses
 * 議題ステータス一覧取得
 *
 * PUT /api/committee/settings/statuses
 * 議題ステータス一括更新
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
 * GET - 議題ステータス一覧取得
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const statuses = await prisma.committeeAgendaStatus.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({ statuses });
  } catch (error) {
    console.error('議題ステータス取得エラー:', error);
    return res.status(500).json({ error: '議題ステータスの取得に失敗しました' });
  }
}

/**
 * PUT - 議題ステータス一括更新
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { statuses, userId } = req.body;

    if (!statuses || !Array.isArray(statuses)) {
      return res.status(400).json({ error: 'ステータスリストが必要です' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'ユーザーIDが必要です' });
    }

    // 一括更新
    const updatePromises = statuses.map((status) => {
      if (!status.statusId) {
        throw new Error('statusIdが必要です');
      }

      return prisma.committeeAgendaStatus.update({
        where: { statusId: status.statusId },
        data: {
          enabled: status.enabled !== undefined ? status.enabled : undefined,
          displayOrder: status.displayOrder !== undefined ? status.displayOrder : undefined,
        },
      });
    });

    await Promise.all(updatePromises);

    // 監査ログ
    AuditService.log({
      userId,
      action: 'COMMITTEE_STATUSES_UPDATED',
      details: {
        updatedStatuses: statuses.map((s) => ({
          statusId: s.statusId,
          enabled: s.enabled,
        })),
      },
      severity: 'high',
    });

    return res.status(200).json({ success: true, updated: statuses.length });
  } catch (error) {
    console.error('議題ステータス更新エラー:', error);
    return res.status(500).json({ error: '議題ステータスの更新に失敗しました' });
  }
}
