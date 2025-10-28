import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { AuditService } from '../../../../services/AuditService';

/**
 * GET /api/committee/settings/types
 * 議題タイプ一覧取得
 *
 * PUT /api/committee/settings/types
 * 議題タイプ一括更新
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
 * GET - 議題タイプ一覧取得
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const types = await prisma.committeeAgendaType.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({ types });
  } catch (error) {
    console.error('議題タイプ取得エラー:', error);
    return res.status(500).json({ error: '議題タイプの取得に失敗しました' });
  }
}

/**
 * PUT - 議題タイプ一括更新
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { types, userId } = req.body;

    if (!types || !Array.isArray(types)) {
      return res.status(400).json({ error: 'タイプリストが必要です' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'ユーザーIDが必要です' });
    }

    // 一括更新
    const updatePromises = types.map((type) => {
      if (!type.typeId) {
        throw new Error('typeIdが必要です');
      }

      return prisma.committeeAgendaType.update({
        where: { typeId: type.typeId },
        data: {
          enabled: type.enabled !== undefined ? type.enabled : undefined,
          displayOrder: type.displayOrder !== undefined ? type.displayOrder : undefined,
        },
      });
    });

    await Promise.all(updatePromises);

    // 監査ログ
    AuditService.log({
      userId,
      action: 'COMMITTEE_TYPES_UPDATED',
      details: {
        updatedTypes: types.map((t) => ({
          typeId: t.typeId,
          enabled: t.enabled,
        })),
      },
      severity: 'high',
    });

    return res.status(200).json({ success: true, updated: types.length });
  } catch (error) {
    console.error('議題タイプ更新エラー:', error);
    return res.status(500).json({ error: '議題タイプの更新に失敗しました' });
  }
}
