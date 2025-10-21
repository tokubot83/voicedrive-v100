/**
 * 投票スコープ設定API（特定部署）
 *
 * GET: 特定部署の投票スコープ設定取得
 * PUT: 投票スコープ設定更新（自動ログ記録付き）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logVotingScopeChange } from '../../../../services/votingSettingLogService';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { departmentId } = req.query;

  if (typeof departmentId !== 'string') {
    return res.status(400).json({ error: 'Invalid department ID' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, departmentId);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, departmentId);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * 特定部署の投票スコープ設定取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  departmentId: string
) {
  try {
    const config = await prisma.agendaModeConfig.findUnique({
      where: { departmentId },
      include: {
        department: {
          select: {
            departmentId: true,
            departmentName: true,
            level: true,
          },
        },
      },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    return res.status(200).json({
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
    });
  } catch (error) {
    console.error(
      `[API Error] GET /api/agenda-mode/voting-scopes/${departmentId}:`,
      error
    );
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * 投票スコープ設定更新（自動ログ記録付き）
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  departmentId: string
) {
  try {
    const {
      votingScopeRules,
      agendaUpgradeThreshold,
      changedBy,
      changedByLevel,
    } = req.body;

    // 必須フィールドチェック
    if (!changedBy || !changedByLevel) {
      return res.status(400).json({
        error: 'Missing required fields: changedBy, changedByLevel',
      });
    }

    // 変更前の設定を取得
    const beforeConfig = await prisma.agendaModeConfig.findUnique({
      where: { departmentId },
      include: {
        department: {
          select: {
            departmentName: true,
          },
        },
      },
    });

    if (!beforeConfig) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // 設定を更新
    const updatedConfig = await prisma.agendaModeConfig.update({
      where: { departmentId },
      data: {
        ...(votingScopeRules && { votingScopeRules }),
        ...(agendaUpgradeThreshold !== undefined && { agendaUpgradeThreshold }),
        updatedAt: new Date(),
      },
    });

    // 変更内容の説明を生成
    let changeDescription = '';
    let affectedCount = 0;

    if (votingScopeRules) {
      const oldPattern = (beforeConfig.votingScopeRules as any)?.pattern || 'パターンA';
      const newPattern = votingScopeRules.pattern || 'パターンA';

      if (oldPattern !== newPattern) {
        changeDescription = `${beforeConfig.department.departmentName}の投票パターンを${oldPattern}から${newPattern}に変更`;
        affectedCount = (beforeConfig.metadata as any)?.memberCount || 50;
      }
    }

    if (agendaUpgradeThreshold !== undefined && agendaUpgradeThreshold !== beforeConfig.agendaUpgradeThreshold) {
      if (changeDescription) {
        changeDescription += '、';
      }
      changeDescription += `議題昇格閾値を${beforeConfig.agendaUpgradeThreshold}点から${agendaUpgradeThreshold}点に変更`;
      affectedCount = Math.max(affectedCount, 30);
    }

    // 🔥 自動ログ記録
    if (changeDescription) {
      try {
        await logVotingScopeChange({
          departmentName: beforeConfig.department.departmentName,
          oldPattern: (beforeConfig.votingScopeRules as any)?.pattern || 'パターンA',
          newPattern: votingScopeRules?.pattern || (beforeConfig.votingScopeRules as any)?.pattern || 'パターンA',
          affectedCount,
          changedBy,
          changedByLevel,
        });

        console.log('[VotingScopeAPI] 変更ログを記録しました');
      } catch (logError) {
        // ログ記録の失敗は警告のみ（本来の処理は成功させる）
        console.error('[VotingScopeAPI] ログ記録エラー（処理は継続）:', logError);
      }
    }

    return res.status(200).json({
      success: true,
      config: updatedConfig,
      message: '投票スコープ設定を更新しました',
    });
  } catch (error) {
    console.error(
      `[API Error] PUT /api/agenda-mode/voting-scopes/${departmentId}:`,
      error
    );
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
