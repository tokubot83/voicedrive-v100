import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ChangeLogDetail } from '@/types/votingHistory';

const prisma = new PrismaClient();

type ErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

type Response = ChangeLogDetail | ErrorResponse;

/**
 * 投票設定変更履歴詳細API
 * GET /api/voting-settings/change-logs/[logId] - 履歴詳細取得
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      details: 'Only GET method is supported',
    });
    return;
  }

  try {
    const { logId } = req.query;

    if (!logId || typeof logId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Invalid logId parameter',
      });
      return;
    }

    // 履歴詳細取得
    const log = await prisma.votingSettingChangeLog.findUnique({
      where: { id: logId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            permissionLevel: true,
          },
        },
        revertedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!log) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        details: 'Change log not found',
      });
      return;
    }

    // レスポンスデータ整形
    const detail: ChangeLogDetail = {
      id: log.id,
      date: log.changedAt.toISOString(),
      mode: log.mode as 'agenda' | 'project' | 'both',
      modeLabel: getModeLabel(log.mode as 'agenda' | 'project' | 'both'),
      category: getCategoryLabel(log.category),
      subcategory: log.subcategory || undefined,
      user: log.user.name,
      userLevel: Number(log.user.permissionLevel),
      action: log.changeDescription,
      changeDescription: log.changeDescription,
      impact: log.impactDescription || undefined,
      impactDescription: log.impactDescription || undefined,
      beforeValue: log.beforeValue || undefined,
      afterValue: log.afterValue || undefined,
      changedBy: {
        id: log.user.id,
        name: log.user.name,
        permissionLevel: Number(log.user.permissionLevel),
      },
      changedAt: log.changedAt.toISOString(),
      status: log.status as 'active' | 'reverted' | 'superseded',
      relatedEntity: log.relatedEntityType && log.relatedEntityId
        ? {
            type: log.relatedEntityType,
            id: log.relatedEntityId,
          }
        : undefined,
      metadata: log.metadata || undefined,
    };

    res.status(200).json(detail);
  } catch (error) {
    console.error('[change-logs/[logId]] GET error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * モードラベル取得
 */
function getModeLabel(mode: 'agenda' | 'project' | 'both'): string {
  const labels = {
    agenda: '議題モード',
    project: 'プロジェクトモード',
    both: '共通設定',
  };
  return labels[mode] || mode;
}

/**
 * カテゴリラベル取得
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    voting_scope_setting: '投票スコープ設定',
    voting_group_management: '投票グループ管理',
    primary_approver_setting: '主承認者設定',
    committee_submission_setting: '委員会提出設定',
    agenda_threshold_setting: '議題昇格閾値設定',
    team_formation_rule: 'チーム編成ルール',
    project_threshold_setting: 'プロジェクト化閾値',
    progress_management_setting: '進捗管理設定',
    resource_allocation_rule: 'リソース配分ルール',
    milestone_setting: 'マイルストーン設定',
  };
  return labels[category] || category;
}
