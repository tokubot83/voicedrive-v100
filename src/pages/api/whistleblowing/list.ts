import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getWhistleblowingPermissions } from '../../../data/demo/whistleblowing';

const prisma = new PrismaClient();

/**
 * GET /api/whistleblowing/list
 * 通報一覧を取得する（権限に応じてフィルタリング）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // クエリパラメータ
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // ユーザーの権限レベル取得（認証実装後に対応）
    // const userLevel = req.session?.user?.permissionLevel || 1;
    const userLevel = 5; // 暫定: 認証未実装のため管理者権限

    // 権限チェック
    const permissions = getWhistleblowingPermissions(userLevel);
    if (!permissions.canView) {
      return res.status(403).json({ error: 'アクセス権限がありません' });
    }

    // 重要度フィルタ（権限に応じて制限）
    const severityLevels: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    const maxLevel = severityLevels[permissions.maxSeverityLevel];
    const allowedSeverities = Object.entries(severityLevels)
      .filter(([_, level]) => level <= maxLevel)
      .map(([severity]) => severity);

    // WHERE条件構築
    const where: any = {
      severity: { in: allowedSeverities }
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    // 通報一覧取得
    const reports = await prisma.whistleblowingReport.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true
          }
        },
        investigationNotes: permissions.canAccessConfidentialNotes
          ? {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          : false
      }
    });

    // 総件数取得
    const totalCount = await prisma.whistleblowingReport.count({ where });

    // 機密情報の除外
    const sanitizedReports = reports.map(report => ({
      ...report,
      contactInfo: undefined, // 連絡先情報は常に除外
      user: report.isAnonymous ? null : report.user // 匿名通報の場合はユーザー情報を除外
    }));

    return res.status(200).json({
      reports: sanitizedReports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount
      },
      filters: {
        status: status || 'all',
        userLevel,
        maxSeverity: permissions.maxSeverityLevel
      }
    });
  } catch (error) {
    console.error('通報一覧取得エラー:', error);
    return res.status(500).json({
      error: 'データの取得に失敗しました',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
