import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateAnonymousId } from '../../../utils/anonymousId';
import { encryptContactInfo } from '../../../utils/encryption';
import { logWhistleblowingAccess } from '../../../utils/auditLog';
import type { ReportSubmissionForm } from '../../../types/whistleblowing';

const prisma = new PrismaClient();

/**
 * 通報の重要度を判定する（簡易版）
 */
function determineSeverity(category: string, content: string): string {
  // キーワードベースの簡易判定
  const criticalKeywords = ['緊急', '生命', '危険', '重大', '至急'];
  const highKeywords = ['ハラスメント', 'いじめ', '暴力', '横領'];

  const lowerContent = content.toLowerCase();

  if (criticalKeywords.some(keyword => lowerContent.includes(keyword))) {
    return 'critical';
  }

  if (highKeywords.some(keyword => lowerContent.includes(keyword)) || category === 'safety') {
    return 'high';
  }

  return 'medium';
}

/**
 * 優先度を計算する
 */
function calculatePriority(severity: string, category: string): number {
  const severityScores: Record<string, number> = {
    critical: 10,
    high: 7,
    medium: 5,
    low: 3
  };

  const categoryScores: Record<string, number> = {
    safety: 3,
    harassment: 2,
    financial: 2,
    compliance: 1,
    discrimination: 2,
    other: 0
  };

  return severityScores[severity] || 5 + (categoryScores[category] || 0);
}

/**
 * 推定対応時間を取得する
 */
function getEstimatedResponseTime(severity: string): string {
  switch (severity) {
    case 'critical':
      return '1時間以内';
    case 'high':
      return '24時間以内';
    case 'medium':
      return '3営業日以内';
    default:
      return '5営業日以内';
  }
}

/**
 * POST /api/whistleblowing/reports
 * 通報を提出する
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body as ReportSubmissionForm;

    // バリデーション
    if (!formData.category || !formData.title || !formData.content) {
      return res.status(400).json({ error: '必須項目が入力されていません' });
    }

    // 匿名ID生成
    const anonymousId = generateAnonymousId();

    // 重要度判定
    const severity = determineSeverity(formData.category, formData.content);

    // 優先度計算
    const priority = calculatePriority(severity, formData.category);

    // 連絡先情報の暗号化（記名通報の場合）
    let encryptedContactInfo: string | null = null;
    if (!formData.isAnonymous && formData.contactInfo) {
      encryptedContactInfo = encryptContactInfo(formData.contactInfo);
    }

    // ユーザーID取得（認証実装後に対応）
    // const userId = req.session?.user?.id || null;
    const userId = null; // 暫定: 認証未実装のためnull

    // 通報作成
    const report = await prisma.whistleblowingReport.create({
      data: {
        userId: formData.isAnonymous ? null : userId,
        anonymousId,
        category: formData.category,
        severity,
        title: formData.title,
        content: formData.content,
        evidenceDescription: formData.evidenceDescription,
        isAnonymous: formData.isAnonymous,
        contactMethod: formData.contactMethod || 'none',
        contactInfo: encryptedContactInfo,
        expectedOutcome: formData.expectedOutcome,
        status: 'received',
        priority,
        followUpRequired: false
      }
    });

    // アクセスログ記録（記名通報の場合のみ）
    if (!formData.isAnonymous && userId) {
      await logWhistleblowingAccess(
        report.id,
        userId,
        'submitted',
        JSON.stringify({ category: report.category, severity: report.severity }),
        req as any
      );
    }

    // レスポンス
    return res.status(201).json({
      success: true,
      reportId: report.id,
      anonymousId: report.anonymousId,
      message: '通報を受け付けました。追跡IDを大切に保管してください。',
      estimatedResponseTime: getEstimatedResponseTime(severity),
      severity
    });
  } catch (error) {
    console.error('通報提出エラー:', error);
    return res.status(500).json({
      error: '通報の提出に失敗しました',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
