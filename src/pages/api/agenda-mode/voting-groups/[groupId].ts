/**
 * 投票グループAPI（特定グループ）
 *
 * GET: 特定グループの詳細取得
 * PUT: グループ更新（自動ログ記録付き）
 * DELETE: グループ削除（自動ログ記録付き）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logVotingGroupChange } from '../../../../services/votingSettingLogService';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { groupId } = req.query;

  if (typeof groupId !== 'string') {
    return res.status(400).json({ error: 'Invalid group ID' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, groupId);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, groupId);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res, groupId);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * グループ詳細取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  groupId: string
) {
  try {
    const group = await prisma.votingGroup.findUnique({
      where: { groupId },
      include: {
        members: {
          select: {
            userId: true,
            userName: true,
            departmentName: true,
            role: true,
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    return res.status(200).json(group);
  } catch (error) {
    console.error(`[API Error] GET /api/agenda-mode/voting-groups/${groupId}:`, error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * グループ更新（自動ログ記録付き）
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  groupId: string
) {
  try {
    const {
      groupName,
      departments,
      memberCount,
      changedBy,
      changedByLevel,
    } = req.body;

    if (!changedBy || !changedByLevel) {
      return res.status(400).json({
        error: 'Missing required fields: changedBy, changedByLevel',
      });
    }

    // 変更前の状態を取得
    const beforeGroup = await prisma.votingGroup.findUnique({
      where: { groupId },
    });

    if (!beforeGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // グループを更新
    const updatedGroup = await prisma.votingGroup.update({
      where: { groupId },
      data: {
        ...(groupName && { groupName }),
        ...(departments && { departments }),
        ...(memberCount !== undefined && { memberCount }),
        updatedAt: new Date(),
      },
    });

    // 🔥 自動ログ記録
    try {
      await logVotingGroupChange({
        groupName: updatedGroup.groupName,
        action: 'update',
        departments: updatedGroup.departments as string[],
        affectedCount: updatedGroup.memberCount,
        changedBy,
        changedByLevel,
      });

      console.log('[VotingGroupAPI] グループ更新ログを記録しました');
    } catch (logError) {
      console.error('[VotingGroupAPI] ログ記録エラー（処理は継続）:', logError);
    }

    return res.status(200).json({
      success: true,
      group: updatedGroup,
      message: '投票グループを更新しました',
    });
  } catch (error) {
    console.error(`[API Error] PUT /api/agenda-mode/voting-groups/${groupId}:`, error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * グループ削除（自動ログ記録付き）
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  groupId: string
) {
  try {
    const { changedBy, changedByLevel } = req.body;

    if (!changedBy || !changedByLevel) {
      return res.status(400).json({
        error: 'Missing required fields: changedBy, changedByLevel',
      });
    }

    // 削除前の状態を取得
    const group = await prisma.votingGroup.findUnique({
      where: { groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // グループを削除（論理削除）
    await prisma.votingGroup.update({
      where: { groupId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // 🔥 自動ログ記録
    try {
      await logVotingGroupChange({
        groupName: group.groupName,
        action: 'delete',
        affectedCount: group.memberCount,
        changedBy,
        changedByLevel,
      });

      console.log('[VotingGroupAPI] グループ削除ログを記録しました');
    } catch (logError) {
      console.error('[VotingGroupAPI] ログ記録エラー（処理は継続）:', logError);
    }

    return res.status(200).json({
      success: true,
      message: '投票グループを削除しました',
    });
  } catch (error) {
    console.error(`[API Error] DELETE /api/agenda-mode/voting-groups/${groupId}:`, error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
