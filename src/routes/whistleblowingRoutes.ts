/**
 * コンプライアンス通報API Routes
 * Phase 1: 基本機能（2025-10-26）
 *
 * エンドポイント:
 * - POST   /api/whistleblowing/reports              通報送信
 * - GET    /api/whistleblowing/reports              通報履歴取得
 * - GET    /api/whistleblowing/reports/:reportId    通報詳細取得
 * - GET    /api/whistleblowing/acknowledgements     受付確認通知取得
 * - GET    /api/whistleblowing/statistics           通報統計取得
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// 型定義
type ReportCategory = 'harassment' | 'safety' | 'financial' | 'compliance' | 'discrimination' | 'other';
type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';
type ReportStatus = 'received' | 'triaging' | 'investigating' | 'escalated' | 'resolved' | 'closed';

interface ReportSubmissionForm {
  category: ReportCategory;
  title: string;
  content: string;
  isAnonymous: boolean;
  contactMethod?: 'email' | 'phone' | 'none';
  contactInfo?: string;
  evidenceDescription?: string;
  expectedOutcome?: string;
}

/**
 * POST /api/whistleblowing/reports
 * 通報送信
 */
router.post('/reports', async (req: Request, res: Response) => {
  try {
    const data: ReportSubmissionForm = req.body;

    // TODO: 認証チェック（req.user.id）
    const userId = (req as any).user?.id || 'demo-user';

    // 1. バリデーション
    if (!validateTitle(data.title)) {
      return res.status(400).json({ error: 'タイトルは5-200文字で入力してください' });
    }

    if (!validateContent(data.content)) {
      return res.status(400).json({ error: '内容は20-5000文字で入力してください' });
    }

    if (!validateCategory(data.category)) {
      return res.status(400).json({ error: '無効なカテゴリーです' });
    }

    const contactValidation = validateContactInfo(data.contactMethod, data.contactInfo);
    if (!contactValidation.valid) {
      return res.status(400).json({ error: contactValidation.error });
    }

    // 2. 匿名ID生成
    const anonymousId = generateAnonymousId();

    // 3. 緊急度自動判定
    const severity = detectSeverity(data.content, data.category);

    // 4. 優先度計算
    const priority = calculatePriority(severity, data.category);

    // 5. DB保存
    const report = await prisma.whistleblowingReport.create({
      data: {
        userId: data.isAnonymous ? null : userId,
        anonymousId,
        category: data.category,
        severity,
        title: data.title,
        content: data.content,
        isAnonymous: data.isAnonymous,
        contactMethod: data.contactMethod || null,
        contactInfo: data.contactInfo ? encryptContactInfo(data.contactInfo) : null,
        expectedOutcome: data.expectedOutcome || null,
        status: 'received',
        priority,
        followUpRequired: false,
        acknowledgementReceived: false
      }
    });

    // 6. 医療システムへWebhook送信
    const webhookResult = await sendReportToMedicalSystem(report);

    if (webhookResult.success && webhookResult.caseNumber) {
      // ケース番号を保存
      await prisma.whistleblowingReport.update({
        where: { id: report.id },
        data: {
          medicalSystemCaseNumber: webhookResult.caseNumber,
          estimatedResponseTime: webhookResult.estimatedResponseTime
        }
      });
    }

    // 7. レスポンス返却
    res.json({
      success: true,
      data: {
        id: report.id,
        anonymousId: report.anonymousId,
        submittedAt: report.submittedAt,
        status: report.status,
        medicalSystemCaseNumber: webhookResult.caseNumber || null
      },
      message: '通報を受け付けました。匿名IDを記録してください。'
    });

  } catch (error) {
    console.error('通報送信エラー:', error);
    res.status(500).json({ error: '通報の送信に失敗しました' });
  }
});

/**
 * GET /api/whistleblowing/reports
 * 通報履歴取得
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    // TODO: 認証チェック
    const userId = (req as any).user?.id || 'demo-user';

    const { status, category, limit = '50', offset = '0' } = req.query;

    const where: any = {
      OR: [
        { userId },
        { userId: null, anonymousId: { contains: userId } }
      ]
    };

    if (status && status !== 'all') {
      where.status = status as string;
    }

    if (category && category !== 'all') {
      where.category = category as string;
    }

    const reports = await prisma.whistleblowingReport.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.whistleblowingReport.count({ where });

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      total
    });

  } catch (error) {
    console.error('通報履歴取得エラー:', error);
    res.status(500).json({ error: '通報履歴の取得に失敗しました' });
  }
});

/**
 * GET /api/whistleblowing/reports/:reportId
 * 通報詳細取得
 */
router.get('/reports/:reportId', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    // TODO: 認証チェック
    const userId = (req as any).user?.id || 'demo-user';

    const report = await prisma.whistleblowingReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ error: '通報が見つかりません' });
    }

    // アクセス権限チェック
    if (report.userId !== userId && report.userId !== null) {
      const permissionLevel = (req as any).user?.permissionLevel || 0;
      if (permissionLevel < 99) {
        return res.status(403).json({ error: 'アクセス権限がありません' });
      }
    }

    // contactInfoは復号化して返す（本人のみ）
    const responseData = {
      ...report,
      contactInfo: report.userId === userId && report.contactInfo
        ? decryptContactInfo(report.contactInfo)
        : null
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('通報詳細取得エラー:', error);
    res.status(500).json({ error: '通報詳細の取得に失敗しました' });
  }
});

/**
 * GET /api/whistleblowing/acknowledgements
 * 受付確認通知取得
 */
router.get('/acknowledgements', async (req: Request, res: Response) => {
  try {
    // TODO: 認証チェック
    const userId = (req as any).user?.id || 'demo-user';
    const { anonymousId } = req.query;

    const where: any = {};

    if (anonymousId) {
      where.anonymousId = anonymousId as string;
    } else {
      const userReports = await prisma.whistleblowingReport.findMany({
        where: {
          OR: [
            { userId },
            { userId: null, anonymousId: { contains: userId } }
          ]
        },
        select: { id: true }
      });

      const reportIds = userReports.map(r => r.id);
      where.reportId = { in: reportIds };
    }

    const acknowledgements = await prisma.complianceAcknowledgement.findMany({
      where,
      orderBy: { receivedAt: 'desc' }
    });

    res.json({
      success: true,
      data: acknowledgements
    });

  } catch (error) {
    console.error('受付確認通知取得エラー:', error);
    res.status(500).json({ error: '受付確認通知の取得に失敗しました' });
  }
});

/**
 * GET /api/whistleblowing/statistics
 * 通報統計取得
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    // TODO: 認証チェック
    const userId = (req as any).user?.id || 'demo-user';

    const reports = await prisma.whistleblowingReport.findMany({
      where: {
        OR: [
          { userId },
          { userId: null, anonymousId: { contains: userId } }
        ]
      }
    });

    const totalReports = reports.length;

    // カテゴリー別集計
    const byCategory: Record<string, number> = {};
    reports.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    });

    // ステータス別集計
    const byStatus: Record<string, number> = {};
    reports.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });

    // 緊急度別集計
    const bySeverity: Record<string, number> = {};
    reports.forEach(r => {
      bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
    });

    // 受付確認率
    const acknowledgedCount = reports.filter(r => r.acknowledgementReceived).length;
    const acknowledgementRate = totalReports > 0 ? (acknowledgedCount / totalReports) * 100 : 0;

    // 平均対応日数
    const resolvedReports = reports.filter(r => r.status === 'resolved' || r.status === 'closed');
    let averageResponseDays = 0;
    if (resolvedReports.length > 0) {
      const totalDays = resolvedReports.reduce((sum, r) => {
        const days = Math.floor((r.updatedAt.getTime() - r.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      averageResponseDays = totalDays / resolvedReports.length;
    }

    res.json({
      success: true,
      data: {
        totalReports,
        byCategory,
        byStatus,
        bySeverity,
        acknowledgementRate: Math.round(acknowledgementRate),
        averageResponseDays: Math.round(averageResponseDays * 10) / 10
      }
    });

  } catch (error) {
    console.error('通報統計取得エラー:', error);
    res.status(500).json({ error: '通報統計の取得に失敗しました' });
  }
});

// ========================================
// ユーティリティ関数
// ========================================

function validateTitle(title: string): boolean {
  return title && title.length >= 5 && title.length <= 200;
}

function validateContent(content: string): boolean {
  return content && content.length >= 20 && content.length <= 5000;
}

function validateCategory(category: string): boolean {
  const validCategories = ['harassment', 'safety', 'financial', 'compliance', 'discrimination', 'other'];
  return validCategories.includes(category);
}

function validateContactInfo(
  contactMethod: string | undefined,
  contactInfo: string | undefined
): { valid: boolean; error?: string } {
  if (contactMethod === 'none' || !contactMethod) {
    return { valid: true };
  }

  if (!contactInfo) {
    return { valid: false, error: '連絡方法を指定した場合、連絡先情報は必須です' };
  }

  if (contactMethod === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo)) {
      return { valid: false, error: '有効なメールアドレスを入力してください' };
    }
  }

  if (contactMethod === 'phone') {
    const phoneRegex = /^\d{10,11}$/;
    const cleanedPhone = contactInfo.replace(/-/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      return { valid: false, error: '有効な電話番号を入力してください（10-11桁）' };
    }
  }

  return { valid: true };
}

function generateAnonymousId(): string {
  const randomBytes = crypto.randomBytes(3);
  const hexString = randomBytes.toString('hex').toUpperCase();
  return `ANON-${hexString}`;
}

function detectSeverity(content: string, category: ReportCategory): ReportSeverity {
  const lowerContent = content.toLowerCase();

  const criticalKeywords = ['殺す', '自殺', '暴力', '脅迫', '即座', '緊急', '危険', '生命', '重大', '深刻'];
  if (criticalKeywords.some(kw => lowerContent.includes(kw))) {
    return 'critical';
  }

  const highKeywords = ['ハラスメント', 'いじめ', '差別', '不正', '横領', '改ざん', '隠蔽'];
  if (highKeywords.some(kw => lowerContent.includes(kw))) {
    return 'high';
  }

  if (category === 'compliance' || category === 'financial') {
    return 'high';
  }

  return 'medium';
}

function calculatePriority(severity: ReportSeverity, category: ReportCategory): number {
  let basePriority = 5;

  switch (severity) {
    case 'critical': basePriority += 5; break;
    case 'high': basePriority += 3; break;
    case 'medium': basePriority += 1; break;
    case 'low': basePriority += 0; break;
  }

  if (category === 'compliance' || category === 'financial') {
    basePriority += 2;
  }

  return Math.min(basePriority, 10);
}

function encryptContactInfo(contactInfo: string): string {
  return Buffer.from(contactInfo).toString('base64');
}

function decryptContactInfo(encrypted: string): string {
  try {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

async function sendReportToMedicalSystem(report: any): Promise<{
  success: boolean;
  caseNumber?: string;
  estimatedResponseTime?: string;
  error?: string;
}> {
  try {
    const webhookUrl = process.env.MEDICAL_SYSTEM_WEBHOOK_URL ||
      'http://localhost:8080/api/webhooks/voicedrive/whistleblowing/report';

    const payload = {
      reportId: report.id,
      anonymousId: report.anonymousId,
      category: report.category,
      severity: report.severity,
      title: report.title,
      submittedAt: report.submittedAt.toISOString(),
      isAnonymous: report.isAnonymous,
      priority: report.priority
    };

    const timestamp = new Date().toISOString();
    const signature = generateWebhookSignature(payload, timestamp);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VoiceDrive-Signature': signature,
        'X-VoiceDrive-Timestamp': timestamp
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`医療システムWebhook応答エラー: ${response.status}`);
    }

    const result = await response.json();

    console.log(`[Webhook] 通報送信成功: reportId=${report.id}, caseNumber=${result.caseNumber}`);

    return {
      success: true,
      caseNumber: result.caseNumber,
      estimatedResponseTime: result.estimatedResponseTime
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Webhook] 通報送信エラー:', errorMessage);

    return {
      success: false,
      error: errorMessage
    };
  }
}

function generateWebhookSignature(payload: any, timestamp: string): string {
  const secret = process.env.WEBHOOK_SECRET || 'voicedrive-webhook-secret';
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

export default router;
