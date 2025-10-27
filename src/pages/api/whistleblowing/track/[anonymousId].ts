import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateAnonymousId } from '../../../../utils/anonymousId';

const prisma = new PrismaClient();

/**
 * ステータスメッセージを取得
 */
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    received: '通報を受け付けました。担当者が確認中です。',
    triaging: '通報内容を分類しています。適切な担当者に割り当てられます。',
    investigating: '専門チームが調査を実施しています。',
    escalated: '重要案件として上位管理者および専門家が対応しています。',
    resolved: '調査が完了し、適切な対応を実施しました。',
    closed: '本案件は終了しました。ご協力ありがとうございました。'
  };

  return messages[status] || '状況を確認しています。';
}

/**
 * 推定完了日を計算
 */
function estimateCompletionDate(status: string, submittedAt: Date, severity: string): string | null {
  if (status === 'resolved' || status === 'closed') {
    return null; // 完了済み
  }

  const now = new Date();
  const elapsed = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24);

  // 重要度別の標準処理日数
  const standardDays: Record<string, number> = {
    critical: 3,
    high: 7,
    medium: 14,
    low: 21
  };

  const targetDays = standardDays[severity] || 14;
  const remainingDays = Math.max(0, targetDays - elapsed);

  const estimatedDate = new Date(now.getTime() + remainingDays * 24 * 60 * 60 * 1000);
  return estimatedDate.toLocaleDateString('ja-JP');
}

/**
 * GET /api/whistleblowing/track/[anonymousId]
 * 匿名IDで通報の進捗を確認する（認証不要）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { anonymousId } = req.query;

    // バリデーション
    if (!anonymousId || typeof anonymousId !== 'string') {
      return res.status(400).json({ error: '匿名IDが無効です' });
    }

    if (!validateAnonymousId(anonymousId)) {
      return res.status(400).json({
        error: '匿名IDの形式が正しくありません',
        format: 'ANON-YYYY-XXXXXX'
      });
    }

    // 通報検索
    const report = await prisma.whistleblowingReport.findFirst({
      where: { anonymousId },
      select: {
        id: true,
        anonymousId: true,
        category: true,
        severity: true,
        status: true,
        submittedAt: true,
        updatedAt: true,
        followUpRequired: true,
        // 機密情報は除外
        title: false,
        content: false,
        contactInfo: false,
        userId: false,
        investigationNotes: false
      }
    });

    if (!report) {
      return res.status(404).json({
        error: '指定された匿名IDの通報が見つかりません',
        message: '匿名IDが正しいか確認してください'
      });
    }

    // ステータスメッセージ
    const statusMessage = getStatusMessage(report.status);

    // 推定完了日
    const estimatedCompletion = estimateCompletionDate(
      report.status,
      report.submittedAt,
      report.severity
    );

    // 進捗率計算
    const progressSteps: Record<string, number> = {
      received: 20,
      triaging: 40,
      investigating: 60,
      escalated: 80,
      resolved: 100,
      closed: 100
    };
    const progress = progressSteps[report.status] || 0;

    return res.status(200).json({
      reportId: report.id,
      anonymousId: report.anonymousId,
      status: report.status,
      statusMessage,
      category: report.category,
      severity: report.severity,
      submittedAt: report.submittedAt,
      lastUpdatedAt: report.updatedAt,
      progress,
      estimatedCompletion,
      followUpRequired: report.followUpRequired,
      message: report.status === 'resolved' || report.status === 'closed'
        ? '通報への対応が完了しました。ご協力ありがとうございました。'
        : '引き続き調査を進めております。進捗があり次第、こちらに反映されます。'
    });
  } catch (error) {
    console.error('匿名ID検索エラー:', error);
    return res.status(500).json({
      error: '通報の検索に失敗しました',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
