/**
 * 投票グループ管理API
 *
 * GET: 投票グループ一覧取得
 * POST: 投票グループ作成（自動ログ記録付き）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logVotingGroupChange } from '../../../../services/votingSettingLogService';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * 投票グループ一覧取得
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const groups = await prisma.votingGroup.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      groups: groups.map((group) => ({
        id: group.id,
        groupId: group.groupId,
        groupName: group.groupName,
        groupType: group.groupType,
        departments: group.departments,
        memberCount: group.memberCount,
        members: group.members,
        isActive: group.isActive,
        metadata: group.metadata,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      })),
      total: groups.length,
    });
  } catch (error) {
    console.error('[API Error] GET /api/agenda-mode/voting-groups:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * 投票グループ作成（自動ログ記録付き）
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      groupName,
      groupType,
      departments,
      memberCount,
      changedBy,
      changedByLevel,
    } = req.body;

    // 必須フィールドチェック
    if (!groupName || !groupType || !departments || !changedBy || !changedByLevel) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    // グループIDを生成
    const groupId = `VG-${Date.now()}`;

    // グループを作成
    const newGroup = await prisma.votingGroup.create({
      data: {
        groupId,
        groupName,
        groupType,
        departments,
        memberCount: memberCount || 0,
        isActive: true,
      },
    });

    // 🔥 自動ログ記録
    try {
      await logVotingGroupChange({
        groupName,
        action: 'create',
        departments,
        affectedCount: memberCount || 0,
        changedBy,
        changedByLevel,
      });

      console.log('[VotingGroupAPI] グループ作成ログを記録しました');
    } catch (logError) {
      console.error('[VotingGroupAPI] ログ記録エラー（処理は継続）:', logError);
    }

    return res.status(201).json({
      success: true,
      group: newGroup,
      message: '投票グループを作成しました',
    });
  } catch (error) {
    console.error('[API Error] POST /api/agenda-mode/voting-groups:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
