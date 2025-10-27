import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getWhistleblowingPermissions } from '../../../../../data/demo/whistleblowing';
import { logWhistleblowingAccess } from '../../../../../utils/auditLog';
import { decryptContactInfo } from '../../../../../utils/encryption';

const prisma = new PrismaClient();

/**
 * GET /api/whistleblowing/reports/[id]
 * 通報の詳細を取得する（権限に応じて情報をフィルタリング）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    // バリデーション
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '通報IDが無効です' });
    }

    // ユーザー認証（認証実装後に対応）
    // const userId = req.session?.user?.id;
    // const userLevel = req.session?.user?.permissionLevel || 1;
    const userId = 'demo-user-001'; // 暫定
    const userLevel = 5; // 暫定: 管理者権限

    // 権限チェック
    const permissions = getWhistleblowingPermissions(userLevel);
    if (!permissions.canView) {
      return res.status(403).json({
        error: '通報を閲覧する権限がありません',
        requiredLevel: 3,
        currentLevel: userLevel
      });
    }

    // 通報取得
    const report = await prisma.whistleblowingReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            position: true
          }
        },
        investigationNotes: permissions.canAccessConfidentialNotes
          ? {
              orderBy: { createdAt: 'desc' }
            }
          : false,
        accessLogs: permissions.canAccessConfidentialNotes
          ? {
              orderBy: { accessedAt: 'desc' },
              take: 20,
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    department: true
                  }
                }
              }
            }
          : false
      }
    });

    if (!report) {
      return res.status(404).json({ error: '指定された通報が見つかりません' });
    }

    // 重要度制限チェック
    const severityLevels: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const reportSeverityLevel = severityLevels[report.severity] || 1;
    const maxSeverityLevel = severityLevels[permissions.maxSeverityLevel] || 1;

    if (reportSeverityLevel > maxSeverityLevel) {
      return res.status(403).json({
        error: 'この重要度の通報を閲覧する権限がありません',
        reportSeverity: report.severity,
        maxAllowedSeverity: permissions.maxSeverityLevel
      });
    }

    // 連絡先情報の復号化（高権限の場合のみ）
    let decryptedContactInfo: string | null = null;
    if (permissions.canAccessConfidentialNotes && report.contactInfo) {
      try {
        decryptedContactInfo = decryptContactInfo(report.contactInfo);
      } catch (error) {
        console.error('連絡先情報の復号化エラー:', error);
        decryptedContactInfo = '[復号化エラー]';
      }
    }

    // 監査ログ記録
    await logWhistleblowingAccess(
      id,
      userId,
      'viewed',
      JSON.stringify({
        severity: report.severity,
        status: report.status,
        hasNotes: !!report.investigationNotes
      }),
      req as any
    );

    // レスポンスデータの構築
    const responseData: any = {
      id: report.id,
      anonymousId: report.anonymousId,
      category: report.category,
      severity: report.severity,
      title: report.title,
      content: report.content,
      evidenceDescription: report.evidenceDescription,
      submittedAt: report.submittedAt,
      updatedAt: report.updatedAt,
      status: report.status,
      priority: report.priority,
      isAnonymous: report.isAnonymous,
      followUpRequired: report.followUpRequired
    };

    // 高権限者のみ閲覧可能な情報
    if (permissions.canAccessConfidentialNotes) {
      responseData.contactMethod = report.contactMethod;
      responseData.contactInfo = decryptedContactInfo;
      responseData.expectedOutcome = report.expectedOutcome;
      responseData.escalationReason = report.escalationReason;
      responseData.resolutionSummary = report.resolutionSummary;
      responseData.medicalSystemCaseNumber = report.medicalSystemCaseNumber;
      responseData.acknowledgementReceived = report.acknowledgementReceived;
      responseData.acknowledgementDate = report.acknowledgementDate;
      responseData.estimatedResponseTime = report.estimatedResponseTime;
      responseData.investigationNotes = report.investigationNotes;
      responseData.accessLogs = report.accessLogs;
    }

    // 記名通報の場合のユーザー情報
    if (!report.isAnonymous && report.user) {
      responseData.reporter = report.user;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('通報詳細取得エラー:', error);
    return res.status(500).json({
      error: '通報の取得に失敗しました',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
