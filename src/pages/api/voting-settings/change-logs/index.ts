import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ChangeLogListResponse } from '@/types/votingHistory';

const prisma = new PrismaClient();

type ErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

type Response = ChangeLogListResponse | ErrorResponse;

/**
 * 投票設定変更履歴API
 * GET /api/voting-settings/change-logs - 履歴一覧取得
 * POST /api/voting-settings/change-logs - 履歴記録（Phase 2で実装）
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      details: 'Only GET and POST methods are supported',
    });
  }
}

/**
 * GET /api/voting-settings/change-logs
 * 変更履歴一覧を取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    const {
      mode = 'all',
      page = '1',
      limit = '50',
      startDate,
      endDate,
      category,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // クエリ条件構築
    const where: any = {};

    // モードフィルタ
    if (mode !== 'all') {
      where.mode = mode;
    }

    // 日付フィルタ
    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) {
        where.changedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.changedAt.lte = new Date(endDate as string);
      }
    }

    // カテゴリフィルタ
    if (category) {
      where.category = category;
    }

    // データ取得
    const [logs, totalCount, agendaCount, projectCount] = await Promise.all([
      prisma.votingSettingChangeLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              permissionLevel: true,
            },
          },
        },
        orderBy: {
          changedAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.votingSettingChangeLog.count({ where }),
      prisma.votingSettingChangeLog.count({
        where: { ...where, mode: 'agenda' },
      }),
      prisma.votingSettingChangeLog.count({
        where: { ...where, mode: 'project' },
      }),
    ]);

    // レスポンスデータ整形
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      date: log.changedAt.toISOString(),
      mode: log.mode as 'agenda' | 'project' | 'both',
      modeLabel: getModeLabel(log.mode as 'agenda' | 'project' | 'both'),
      category: getCategoryLabel(log.category),
      user: log.user.name,
      userLevel: Number(log.user.permissionLevel),
      action: log.changeDescription,
      impact: log.impactDescription || undefined,
      status: log.status as 'active' | 'reverted' | 'superseded',
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      logs: formattedLogs,
      statistics: {
        totalCount,
        agendaModeCount: agendaCount,
        projectModeCount: projectCount,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('[change-logs] GET error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/voting-settings/change-logs
 * 変更履歴を記録（Phase 2で実装）
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const {
      mode,
      category,
      subcategory,
      changeDescription,
      impactDescription,
      beforeValue,
      afterValue,
      changedBy,
      changedByLevel,
      relatedEntityType,
      relatedEntityId,
      metadata,
    } = req.body;

    // バリデーション
    if (!mode || !category || !changeDescription || !changedBy) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing required fields: mode, category, changeDescription, changedBy',
      });
    }

    // 変更履歴を記録
    const log = await prisma.votingSettingChangeLog.create({
      data: {
        mode,
        category,
        subcategory,
        changeDescription,
        impactDescription,
        beforeValue,
        afterValue,
        changedBy,
        changedByLevel,
        status: 'active',
        relatedEntityType,
        relatedEntityId,
        metadata,
      },
    });

    res.status(201).json({
      success: true,
      logId: log.id,
      createdAt: log.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('[change-logs] POST error:', error);
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
