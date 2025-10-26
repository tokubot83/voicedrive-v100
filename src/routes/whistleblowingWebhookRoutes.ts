/**
 * コンプライアンス通報 Webhook Routes
 * Phase 3: 医療システム連携（2025-10-26）
 *
 * エンドポイント:
 * - POST /api/webhooks/medical-system/whistleblowing/status-update    ステータス更新受信
 * - POST /api/webhooks/medical-system/whistleblowing/resolution       調査完了通知受信
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/webhooks/medical-system/whistleblowing/status-update
 * 医療システムからのステータス更新を受信
 */
router.post('/status-update', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const signature = req.headers['x-medical-system-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    if (!signature || !timestamp) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_HEADERS', message: '必須ヘッダーが不足しています' }
      });
    }

    // Webhook署名検証
    const secret = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_CONFIGURATION_ERROR', message: 'サーバー設定エラー' }
      });
    }

    if (!verifyTimestamp(timestamp, 5)) {
      return res.status(401).json({
        success: false,
        error: { code: 'TIMESTAMP_EXPIRED', message: 'タイムスタンプが無効です' }
      });
    }

    if (!verifyWebhookSignature(signature, req.body, timestamp, secret)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: '署名検証に失敗しました' }
      });
    }

    // ペイロード取得
    const { reportId, caseNumber, status, assignedInvestigators, updatedAt, nextSteps, priority } = req.body;

    if (!reportId || !caseNumber || !status) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '必須フィールドが不足しています' }
      });
    }

    // 通報を検索
    const report = await prisma.whistleblowingReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: '通報が見つかりません' }
      });
    }

    // ステータス遷移検証
    const validTransitions: Record<string, string[]> = {
      received: ['triaging'],
      triaging: ['investigating', 'escalated', 'resolved'],
      investigating: ['escalated', 'resolved', 'closed'],
      escalated: ['investigating', 'resolved', 'closed'],
      resolved: ['closed'],
      closed: []
    };

    const allowedTransitions = validTransitions[report.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `不正なステータス遷移: ${report.status} → ${status}`
        }
      });
    }

    // WhistleblowingReport更新
    await prisma.whistleblowingReport.update({
      where: { id: reportId },
      data: {
        status,
        assignedInvestigators: assignedInvestigators ? JSON.stringify(assignedInvestigators) : null,
        priority: priority || report.priority,
        updatedAt: updatedAt ? new Date(updatedAt) : new Date()
      }
    });

    console.log(`[Webhook] ステータス更新受信: reportId=${reportId}, status=${status}`);

    return res.status(200).json({
      success: true,
      message: 'ステータス更新を記録しました',
      processingTime: `${Date.now() - startTime}ms`
    });

  } catch (error) {
    console.error('[Webhook] ステータス更新Webhook処理エラー:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'サーバー内部エラー' }
    });
  }
});

/**
 * POST /api/webhooks/medical-system/whistleblowing/resolution
 * 医療システムからの調査完了通知を受信
 */
router.post('/resolution', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const signature = req.headers['x-medical-system-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    if (!signature || !timestamp) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_HEADERS', message: '必須ヘッダーが不足しています' }
      });
    }

    // Webhook署名検証
    const secret = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_CONFIGURATION_ERROR', message: 'サーバー設定エラー' }
      });
    }

    if (!verifyTimestamp(timestamp, 5)) {
      return res.status(401).json({
        success: false,
        error: { code: 'TIMESTAMP_EXPIRED', message: 'タイムスタンプが無効です' }
      });
    }

    if (!verifyWebhookSignature(signature, req.body, timestamp, secret)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: '署名検証に失敗しました' }
      });
    }

    // ペイロード取得
    const { reportId, caseNumber, status, resolutionSummary, resolvedAt, followUpRequired } = req.body;

    if (!reportId || !caseNumber || !status || !resolutionSummary) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '必須フィールドが不足しています' }
      });
    }

    // 通報を検索
    const report = await prisma.whistleblowingReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: '通報が見つかりません' }
      });
    }

    // WhistleblowingReport更新
    await prisma.whistleblowingReport.update({
      where: { id: reportId },
      data: {
        status,
        resolutionSummary,
        followUpRequired: followUpRequired !== undefined ? followUpRequired : false,
        updatedAt: resolvedAt ? new Date(resolvedAt) : new Date()
      }
    });

    console.log(`[Webhook] 調査完了通知受信: reportId=${reportId}, status=${status}`);

    return res.status(200).json({
      success: true,
      message: '調査完了を記録しました',
      processingTime: `${Date.now() - startTime}ms`
    });

  } catch (error) {
    console.error('[Webhook] 調査完了Webhook処理エラー:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'サーバー内部エラー' }
    });
  }
});

function verifyTimestamp(timestamp: string, maxAgeMinutes: number): boolean {
  try {
    const webhookTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const ageMinutes = (currentTime - webhookTime) / (1000 * 60);
    return ageMinutes <= maxAgeMinutes && ageMinutes >= -1;
  } catch {
    return false;
  }
}

function verifyWebhookSignature(
  signature: string,
  payload: any,
  timestamp: string,
  secret: string
): boolean {
  try {
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export default router;
