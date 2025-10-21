/**
 * プロジェクト化閾値設定API
 *
 * PUT: 閾値設定更新（自動ログ記録付き）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logProjectSettingChange } from '../../../../../services/votingSettingLogService';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { departmentId } = req.query;

  if (typeof departmentId !== 'string') {
    return res.status(400).json({ error: 'Invalid department ID' });
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, departmentId);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * プロジェクト化閾値設定更新（自動ログ記録付き）
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  departmentId: string
) {
  try {
    const {
      thresholds,
      emergencyEscalation,
      changedBy,
      changedByLevel,
    } = req.body;

    if (!changedBy || !changedByLevel) {
      return res.status(400).json({
        error: 'Missing required fields: changedBy, changedByLevel',
      });
    }

    // 変更前の設定を取得
    const beforeConfig = await prisma.projectModeConfig.findUnique({
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

    // メタデータを更新
    const currentMetadata = (beforeConfig.metadata as any) || {};
    const updatedMetadata = {
      ...currentMetadata,
      ...(thresholds && { thresholds }),
      ...(emergencyEscalation && { emergencyEscalation }),
    };

    // 設定を更新
    const updatedConfig = await prisma.projectModeConfig.update({
      where: { departmentId },
      data: {
        ...(thresholds?.facility && {
          projectUpgradeThreshold: thresholds.facility,
        }),
        metadata: updatedMetadata,
        updatedAt: new Date(),
      },
    });

    // 変更内容の説明を生成
    const changes: string[] = [];

    if (thresholds) {
      const oldThresholds = currentMetadata.thresholds || {};
      if (thresholds.facility && thresholds.facility !== updatedConfig.projectUpgradeThreshold) {
        changes.push(`施設プロジェクト化閾値を${oldThresholds.facility || 400}点から${thresholds.facility}点に変更`);
      }
      if (thresholds.department && thresholds.department !== oldThresholds.department) {
        changes.push(`部署プロジェクト化閾値を${oldThresholds.department || 200}点から${thresholds.department}点に変更`);
      }
      if (thresholds.corporate && thresholds.corporate !== oldThresholds.corporate) {
        changes.push(`法人プロジェクト化閾値を${oldThresholds.corporate || 800}点から${thresholds.corporate}点に変更`);
      }
    }

    if (emergencyEscalation) {
      const oldEmergency = currentMetadata.emergencyEscalation || {};
      if (emergencyEscalation.enabled !== oldEmergency.enabled) {
        changes.push(`緊急昇格設定を${emergencyEscalation.enabled ? '有効化' : '無効化'}`);
      }
      if (emergencyEscalation.requiredLevel !== oldEmergency.requiredLevel) {
        changes.push(`緊急昇格必要レベルをLevel ${oldEmergency.requiredLevel || 8}からLevel ${emergencyEscalation.requiredLevel}に変更`);
      }
    }

    // 🔥 自動ログ記録
    if (changes.length > 0) {
      try {
        await logProjectSettingChange({
          category: 'プロジェクト化閾値',
          changeDescription: changes.join('、'),
          impactDescription: 'プロジェクト化判定基準が変更されます',
          changedBy,
          changedByLevel,
          beforeValue: {
            thresholds: currentMetadata.thresholds,
            emergencyEscalation: currentMetadata.emergencyEscalation,
          },
          afterValue: {
            thresholds: updatedMetadata.thresholds,
            emergencyEscalation: updatedMetadata.emergencyEscalation,
          },
        });

        console.log('[ThresholdsAPI] 閾値変更ログを記録しました');
      } catch (logError) {
        console.error('[ThresholdsAPI] ログ記録エラー（処理は継続）:', logError);
      }
    }

    return res.status(200).json({
      success: true,
      config: updatedConfig,
      message: 'プロジェクト化閾値設定を更新しました',
    });
  } catch (error) {
    console.error(
      `[API Error] PUT /api/project-mode/configs/${departmentId}/thresholds:`,
      error
    );
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
