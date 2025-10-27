import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getWhistleblowingPermissions } from '../../../data/demo/whistleblowing';

const prisma = new PrismaClient();

/**
 * 期間の開始日を取得する
 */
function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'last7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'last30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'last90days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'thisYear':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // デフォルト: 過去30日
  }
}

/**
 * エスカレーション率を計算する
 */
function calculateEscalationRate(byStatus: any[]): number {
  const totalReports = byStatus.reduce((sum, s) => sum + s._count, 0);
  const escalatedCount = byStatus.find(s => s.status === 'escalated')?._count || 0;

  if (totalReports === 0) return 0;
  return Math.round((escalatedCount / totalReports) * 100 * 10) / 10;
}

/**
 * 月次トレンドを取得する
 */
async function getMonthlyTrend(startDate: Date) {
  const now = new Date();
  const months: Array<{ month: string; count: number; resolved: number }> = [];

  // 過去6ヶ月のデータを取得
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const monthStr = monthDate.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit' });

    const totalCount = await prisma.whistleblowingReport.count({
      where: {
        submittedAt: {
          gte: monthDate,
          lt: nextMonthDate
        }
      }
    });

    const resolvedCount = await prisma.whistleblowingReport.count({
      where: {
        submittedAt: {
          gte: monthDate,
          lt: nextMonthDate
        },
        status: 'resolved'
      }
    });

    months.push({
      month: monthStr,
      count: totalCount,
      resolved: resolvedCount
    });
  }

  return months;
}

/**
 * GET /api/whistleblowing/statistics
 * 通報統計を取得する
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period = 'last30days' } = req.query;

    // ユーザーの権限レベル取得（認証実装後に対応）
    // const userLevel = req.session?.user?.permissionLevel || 1;
    const userLevel = 5; // 暫定: 認証未実装のため管理者権限

    // 権限チェック
    const permissions = getWhistleblowingPermissions(userLevel);
    if (!permissions.canViewStatistics) {
      return res.status(403).json({ error: '統計閲覧権限がありません' });
    }

    const startDate = getStartDate(period as string);

    // 総通報数
    const totalReports = await prisma.whistleblowingReport.count({
      where: { submittedAt: { gte: startDate } }
    });

    // カテゴリ別集計
    const byCategory = await prisma.whistleblowingReport.groupBy({
      by: ['category'],
      where: { submittedAt: { gte: startDate } },
      _count: true
    });

    // ステータス別集計
    const byStatus = await prisma.whistleblowingReport.groupBy({
      by: ['status'],
      where: { submittedAt: { gte: startDate } },
      _count: true
    });

    // 重要度別集計
    const bySeverity = await prisma.whistleblowingReport.groupBy({
      by: ['severity'],
      where: { submittedAt: { gte: startDate } },
      _count: true
    });

    // 平均解決日数（resolved案件のみ）
    const resolvedReports = await prisma.whistleblowingReport.findMany({
      where: {
        status: 'resolved',
        submittedAt: { gte: startDate }
      },
      select: {
        submittedAt: true,
        updatedAt: true
      }
    });

    const averageResolutionDays = resolvedReports.length > 0
      ? resolvedReports.reduce((sum, r) => {
          const days = (r.updatedAt.getTime() - r.submittedAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / resolvedReports.length
      : 0;

    // エスカレーション率
    const escalationRate = calculateEscalationRate(byStatus);

    // 月次トレンド
    const monthlyTrend = await getMonthlyTrend(startDate);

    return res.status(200).json({
      totalReports,
      byCategory: Object.fromEntries(
        byCategory.map(c => [c.category, c._count])
      ),
      byStatus: Object.fromEntries(
        byStatus.map(s => [s.status, s._count])
      ),
      bySeverity: Object.fromEntries(
        bySeverity.map(s => [s.severity, s._count])
      ),
      averageResolutionDays: Math.round(averageResolutionDays * 10) / 10,
      escalationRate,
      monthlyTrend,
      period: period as string
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    return res.status(500).json({
      error: '統計の取得に失敗しました',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
