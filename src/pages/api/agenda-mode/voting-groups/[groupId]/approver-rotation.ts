/**
 * 主承認者ローテーション設定API
 *
 * GET: 主承認者ローテーション設定取得
 * PUT: 主承認者ローテーション設定更新（自動ログ記録付き）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logPrimaryApproverChange } from '../../../../../services/votingSettingLogService';

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

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * 主承認者ローテーション設定取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  groupId: string
) {
  try {
    const group = await prisma.votingGroup.findUnique({
      where: { groupId },
      select: {
        groupId: true,
        groupName: true,
        primaryApproverRotation: true,
        metadata: true,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    return res.status(200).json({
      groupId: group.groupId,
      groupName: group.groupName,
      rotation: group.primaryApproverRotation,
      metadata: group.metadata,
    });
  } catch (error) {
    console.error(
      `[API Error] GET /api/agenda-mode/voting-groups/${groupId}/approver-rotation:`,
      error
    );
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * 主承認者ローテーション設定更新（自動ログ記録付き）
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  groupId: string
) {
  try {
    const {
      rotationEnabled,
      rotationPeriod,
      approvers,
      changedBy,
      changedByLevel,
    } = req.body;

    if (!changedBy || !changedByLevel) {
      return res.status(400).json({
        error: 'Missing required fields: changedBy, changedByLevel',
      });
    }

    // 変更前の設定を取得
    const beforeGroup = await prisma.votingGroup.findUnique({
      where: { groupId },
    });

    if (!beforeGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // ローテーション設定を更新
    const rotationConfig = {
      enabled: rotationEnabled !== undefined ? rotationEnabled : (beforeGroup.primaryApproverRotation as any)?.enabled,
      period: rotationPeriod || (beforeGroup.primaryApproverRotation as any)?.period,
      approvers: approvers || (beforeGroup.primaryApproverRotation as any)?.approvers || [],
    };

    const updatedGroup = await prisma.votingGroup.update({
      where: { groupId },
      data: {
        primaryApproverRotation: rotationConfig,
        updatedAt: new Date(),
      },
    });

    // 変更内容の説明を生成
    let description = '';
    if (rotationPeriod && rotationPeriod !== (beforeGroup.primaryApproverRotation as any)?.period) {
      const periodLabels: Record<string, string> = {
        monthly: '月次',
        quarterly: '四半期',
        yearly: '年次',
      };
      const oldPeriodLabel = periodLabels[(beforeGroup.primaryApproverRotation as any)?.period] || '月次';
      const newPeriodLabel = periodLabels[rotationPeriod] || '月次';
      description = `${updatedGroup.groupName}のローテーション期間を${oldPeriodLabel}から${newPeriodLabel}に変更`;
    } else if (approvers) {
      description = `${updatedGroup.groupName}の承認者リストを更新`;
    } else if (rotationEnabled !== undefined) {
      description = `${updatedGroup.groupName}のローテーションを${rotationEnabled ? '有効化' : '無効化'}`;
    }

    // 🔥 自動ログ記録
    if (description) {
      try {
        await logPrimaryApproverChange({
          groupName: updatedGroup.groupName,
          changeType: 'rotation',
          description,
          affectedCount: approvers?.length || 3,
          changedBy,
          changedByLevel,
          beforeValue: beforeGroup.primaryApproverRotation,
          afterValue: rotationConfig,
        });

        console.log('[ApproverRotationAPI] ローテーション変更ログを記録しました');
      } catch (logError) {
        console.error('[ApproverRotationAPI] ログ記録エラー（処理は継続）:', logError);
      }
    }

    return res.status(200).json({
      success: true,
      rotation: rotationConfig,
      message: '主承認者ローテーション設定を更新しました',
    });
  } catch (error) {
    console.error(
      `[API Error] PUT /api/agenda-mode/voting-groups/${groupId}/approver-rotation:`,
      error
    );
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
