import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 投票設定変更履歴エクスポートAPI
 * GET /api/voting-settings/change-logs/export - CSV形式でエクスポート
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    const { mode = 'all', startDate, endDate } = req.query;

    // クエリ条件構築
    const where: any = {};

    if (mode !== 'all') {
      where.mode = mode;
    }

    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) {
        where.changedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.changedAt.lte = new Date(endDate as string);
      }
    }

    // データ取得
    const logs = await prisma.votingSettingChangeLog.findMany({
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
    });

    // CSV生成
    const csv = generateCSV(logs);

    // レスポンスヘッダー設定
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=voting-history-${new Date().toISOString().split('T')[0]}.csv`
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error('[change-logs/export] GET error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * CSV生成
 */
function generateCSV(logs: any[]): string {
  // ヘッダー行
  const header = [
    '変更日時',
    'モード',
    'カテゴリ',
    '変更者',
    '権限レベル',
    '変更内容',
    '影響範囲',
    'ステータス',
  ].join(',');

  // データ行
  const rows = logs.map((log) => {
    const date = log.changedAt.toISOString().replace('T', ' ').split('.')[0];
    const mode = getModeLabel(log.mode);
    const category = getCategoryLabel(log.category);
    const user = escapeCsvField(log.user.name);
    const userLevel = Number(log.user.permissionLevel);
    const action = escapeCsvField(log.changeDescription);
    const impact = escapeCsvField(log.impactDescription || '');
    const status = getStatusLabel(log.status);

    return [date, mode, category, user, userLevel, action, impact, status].join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * CSVフィールドエスケープ
 */
function escapeCsvField(field: string): string {
  if (!field) return '';

  // カンマ、改行、ダブルクォートを含む場合はダブルクォートで囲む
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

/**
 * モードラベル取得
 */
function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
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

/**
 * ステータスラベル取得
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: '有効',
    reverted: '取消済',
    superseded: '上書済',
  };
  return labels[status] || status;
}
