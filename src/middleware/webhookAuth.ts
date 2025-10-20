/**
 * Phase 2: 顔写真統合 - Webhook署名検証ミドルウェア
 *
 * 医療システムからのWebhookリクエストを検証
 *
 * セキュリティ機能:
 * - HMAC-SHA256署名検証
 * - タイムスタンプ検証（5分以内のリクエストのみ受付）
 * - 環境変数での秘密鍵管理
 *
 * @module webhookAuth
 */

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Webhook Secret（環境変数から取得）
 *
 * 医療システムチームと共有する秘密鍵
 * - 64文字以上のランダム文字列推奨
 * - .envファイルで管理（Gitにコミットしない）
 */
const WEBHOOK_SECRET = process.env.MEDICAL_WEBHOOK_SECRET || '';

if (!WEBHOOK_SECRET) {
  console.warn(
    '[Webhook Auth] WARNING: MEDICAL_WEBHOOK_SECRET が設定されていません。' +
    'Webhook認証が無効化されています。本番環境では必ず設定してください。'
  );
}

/**
 * Webhook署名検証ミドルウェア
 *
 * 医療システムからのWebhookリクエストのHMAC-SHA256署名を検証します。
 *
 * 検証項目:
 * 1. 署名ヘッダーの存在確認
 * 2. タイムスタンプヘッダーの存在確認
 * 3. タイムスタンプの有効期限確認（5分以内）
 * 4. HMAC-SHA256署名の照合
 *
 * @param req - Expressリクエストオブジェクト
 * @param res - Expressレスポンスオブジェクト
 * @param next - 次のミドルウェアへ

の関数
 *
 * @example
 * ```typescript
 * // routes/apiRoutes.tsで使用
 * router.post(
 *   '/api/webhooks/medical-system/employee',
 *   validateWebhookSignature,
 *   handleEmployeeWebhook
 * );
 * ```
 */
export const validateWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 開発環境でのテスト用: Webhook Secretが未設定の場合はスキップ
  if (!WEBHOOK_SECRET) {
    console.warn('[Webhook Auth] SKIP: Webhook Secret未設定のため検証をスキップします');
    next();
    return;
  }

  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;

  // 1. 署名とタイムスタンプの存在確認
  if (!signature || !timestamp) {
    console.error('[Webhook Auth] ERROR: 署名またはタイムスタンプが欠落しています', {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      headers: req.headers
    });

    res.status(401).json({
      error: 'Missing signature or timestamp',
      message: 'Webhook認証に必要なヘッダーが欠落しています'
    });
    return;
  }

  // 2. タイムスタンプ検証（5分以内のリクエストのみ受け付け）
  const now = Date.now();
  const requestTime = parseInt(timestamp, 10);

  if (isNaN(requestTime)) {
    console.error('[Webhook Auth] ERROR: タイムスタンプが不正です', {
      timestamp,
      headers: req.headers
    });

    res.status(401).json({
      error: 'Invalid timestamp',
      message: 'タイムスタンプの形式が不正です'
    });
    return;
  }

  const timeDiff = Math.abs(now - requestTime);
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  if (timeDiff > FIVE_MINUTES_MS) {
    console.error('[Webhook Auth] ERROR: タイムスタンプが期限切れです', {
      timestamp,
      requestTime: new Date(requestTime).toISOString(),
      now: new Date(now).toISOString(),
      timeDiffMinutes: Math.round(timeDiff / 60000)
    });

    res.status(401).json({
      error: 'Request too old',
      message: 'リクエストのタイムスタンプが古すぎます（5分以内のみ有効）'
    });
    return;
  }

  // 3. HMAC-SHA256署名検証
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(timestamp + payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('[Webhook Auth] ERROR: 署名が一致しません', {
      receivedSignature: signature,
      expectedSignature,
      timestamp,
      payloadLength: payload.length
    });

    res.status(401).json({
      error: 'Invalid signature',
      message: 'Webhook署名が不正です'
    });
    return;
  }

  // 4. 検証成功
  console.log('[Webhook Auth] SUCCESS: Webhook署名検証成功', {
    timestamp,
    eventType: req.body.eventType,
    staffId: req.body.data?.staffId
  });

  next();
};

/**
 * Webhook署名生成（テスト用）
 *
 * 開発環境でのテスト時に、医療システムからのWebhookをシミュレートするために使用
 *
 * @param timestamp - Unixタイムスタンプ（ミリ秒、文字列）
 * @param payload - JSONペイロード（文字列）
 * @param secret - 共有秘密鍵（オプション、未指定時は環境変数から取得）
 * @returns HMAC-SHA256署名（hex形式）
 *
 * @example
 * ```typescript
 * // テストスクリプトで使用
 * const timestamp = Date.now().toString();
 * const payload = JSON.stringify({ eventType: 'employee.created', ... });
 * const signature = generateWebhookSignatureForTest(timestamp, payload);
 *
 * // Webhookリクエスト送信
 * await fetch('http://localhost:3001/api/webhooks/medical-system/employee', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-webhook-signature': signature,
 *     'x-webhook-timestamp': timestamp
 *   },
 *   body: payload
 * });
 * ```
 */
export function generateWebhookSignatureForTest(
  timestamp: string,
  payload: string,
  secret?: string
): string {
  const webhookSecret = secret || WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('MEDICAL_WEBHOOK_SECRET が設定されていません');
  }

  const message = timestamp + payload;
  return crypto
    .createHmac('sha256', webhookSecret)
    .update(message)
    .digest('hex');
}
