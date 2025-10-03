/**
 * Webhookルート
 *
 * 医療システムからのWebhookリクエストを処理します。
 * - 受付確認通知（POST /webhook/compliance/acknowledgement）
 */

import { Router, Request, Response } from 'express';
import {
  verifyWebhookSignature,
  verifyTimestamp,
  validateWebhookPayload
} from '../services/webhookVerifier.js';
import type { AcknowledgementNotification } from '../types/whistleblowing.js';

const router = Router();

// テストルート
router.get('/test', (req, res) => {
  console.log('[webhookRoutes] Test route accessed');
  res.json({ message: 'Webhook routes working!' });
});

/**
 * コンプライアンス通報 受付確認通知受信エンドポイント
 *
 * 医療システムから送信される受付確認通知を受信し、検証します。
 * - HMAC-SHA256署名検証
 * - タイムスタンプ検証（リプレイ攻撃対策）
 * - ペイロードバリデーション
 */
router.post('/compliance/acknowledgement', async (req: Request, res: Response) => {
  console.log('[webhookRoutes] Received request at /compliance/acknowledgement');
  const startTime = Date.now();

  try {
    // 1. ヘッダー検証
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    const caseNumber = req.headers['x-case-number'] as string;
    const anonymousId = req.headers['x-anonymous-id'] as string;

    if (!signature || !timestamp) {
      console.error('[Webhook] Missing required headers:', {
        hasSignature: !!signature,
        hasTimestamp: !!timestamp
      });
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HEADERS',
          message: '必須ヘッダーが不足しています',
          details: {
            requiredHeaders: ['X-Webhook-Signature', 'X-Webhook-Timestamp']
          }
        }
      });
    }

    // 2. タイムスタンプ検証（リプレイ攻撃対策）
    const timestampValid = verifyTimestamp(timestamp, 5); // 5分以内
    if (!timestampValid) {
      console.warn('[Webhook] Timestamp verification failed:', {
        timestamp,
        anonymousId,
        age: Math.abs(Date.now() - new Date(timestamp).getTime()) / 1000 / 60
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'TIMESTAMP_EXPIRED',
          message: 'タイムスタンプが無効です（5分以上経過）',
          timestamp
        }
      });
    }

    // 3. 署名検証（HMAC-SHA256）
    const secret = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Webhook] MEDICAL_SYSTEM_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_CONFIGURATION_ERROR',
          message: 'サーバー設定エラー'
        }
      });
    }

    const signatureValid = verifyWebhookSignature(signature, req.body, secret);
    if (!signatureValid) {
      console.warn('[Webhook] Signature verification failed:', {
        receivedSignature: signature.substring(0, 10) + '...',
        anonymousId,
        caseNumber
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: '署名検証に失敗しました'
        }
      });
    }

    // 4. ペイロードバリデーション
    const missingFields = validateWebhookPayload(req.body);
    if (missingFields.length > 0) {
      console.warn('[Webhook] Payload validation failed:', {
        missingFields,
        anonymousId,
        caseNumber
      });
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '必須フィールドが不足しています',
          missingFields
        }
      });
    }

    // 5. ペイロードパース
    const payload = req.body;
    const notification: AcknowledgementNotification = {
      reportId: payload.reportId,
      anonymousId: payload.anonymousId,
      medicalSystemCaseNumber: payload.caseNumber,
      severity: payload.severity,
      category: payload.category,
      receivedAt: new Date(payload.receivedAt),
      estimatedResponseTime: payload.estimatedResponseTime,
      requiresImmediateAction: payload.requiresImmediateAction || false,
      currentStatus: payload.currentStatus || 'received',
      nextSteps: payload.nextSteps
    };

    // 6. データベース保存（TODO: 実装予定）
    console.log('[Webhook] Acknowledgement notification received:', {
      reportId: notification.reportId,
      caseNumber: notification.medicalSystemCaseNumber,
      anonymousId: notification.anonymousId,
      severity: notification.severity,
      estimatedResponseTime: notification.estimatedResponseTime,
      processingTime: `${Date.now() - startTime}ms`
    });

    // TODO: データベースへの保存処理を実装
    // await saveAcknowledgementNotification(notification);

    // 7. 成功レスポンス
    return res.status(200).json({
      success: true,
      notificationId: `ACK-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      receivedAt: new Date().toISOString(),
      message: '受付確認通知を正常に受信しました',
      processingTime: `${Date.now() - startTime}ms`
    });

  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバー内部エラーが発生しました'
      }
    });
  }
});

export default router;
