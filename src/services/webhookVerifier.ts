/**
 * Webhook署名検証・生成サービス
 *
 * HMAC-SHA256署名の生成と検証、タイムスタンプの検証を行います。
 * VoiceDrive ⇔ 医療システム間のWebhook通信の真正性を確保します。
 */

import * as crypto from 'crypto';

/**
 * Webhook署名を検証
 *
 * @param receivedSignature - リクエストヘッダーから受信した署名
 * @param payload - リクエストボディ（JSON）
 * @param secret - 共有シークレットキー
 * @returns 署名が有効な場合true
 */
export function verifyWebhookSignature(
  receivedSignature: string,
  payload: any,
  secret: string
): boolean {
  try {
    // ペイロードをJSON文字列に変換
    const payloadString = JSON.stringify(payload);

    // 期待される署名を生成
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    // タイミング攻撃を防ぐため、crypto.timingSafeEqualを使用
    const receivedBuffer = Buffer.from(receivedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // バッファ長が異なる場合はfalse
    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch (error) {
    // 署名形式が不正な場合などはfalse
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * タイムスタンプを検証（リプレイ攻撃対策）
 *
 * @param timestamp - ISO 8601形式のタイムスタンプ
 * @param maxAgeMinutes - 許容する最大経過時間（分）
 * @returns タイムスタンプが有効な場合true
 */
export function verifyTimestamp(
  timestamp: string,
  maxAgeMinutes: number = 5
): boolean {
  try {
    const receivedTime = new Date(timestamp).getTime();
    const currentTime = Date.now();

    // 時刻差を分単位で計算
    const differenceMinutes = Math.abs(currentTime - receivedTime) / 1000 / 60;

    // 指定された許容時間以内かチェック
    return differenceMinutes <= maxAgeMinutes;
  } catch (error) {
    // タイムスタンプ形式が不正な場合はfalse
    console.error('Timestamp verification error:', error);
    return false;
  }
}

/**
 * Webhookペイロードの必須フィールドを検証
 *
 * @param payload - 検証するペイロード
 * @returns 不足しているフィールドの配列（空の場合は全て存在）
 */
export function validateWebhookPayload(payload: any): string[] {
  const requiredFields = [
    'reportId',
    'caseNumber',
    'anonymousId',
    'severity',
    'category',
    'receivedAt',
    'estimatedResponseTime'
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!payload[field]) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

/**
 * Webhook送信用の署名を生成
 *
 * @param payload - リクエストボディ（JSON）
 * @param secret - 共有シークレットキー
 * @returns HMAC-SHA256署名（hex形式）
 */
export function generateWebhookSignature(
  payload: any,
  secret: string
): string {
  try {
    // ペイロードをJSON文字列に変換
    const payloadString = JSON.stringify(payload);

    // HMAC-SHA256署名を生成
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    return signature;
  } catch (error) {
    console.error('Signature generation error:', error);
    throw new Error('Failed to generate webhook signature');
  }
}

/**
 * Webhook送信用のヘッダーを生成
 *
 * @param payload - リクエストボディ
 * @param secret - 共有シークレットキー
 * @returns Webhookリクエスト用ヘッダー
 */
export function generateWebhookHeaders(
  payload: any,
  secret: string
): Record<string, string> {
  const timestamp = new Date().toISOString();
  const signature = generateWebhookSignature(payload, secret);

  return {
    'Content-Type': 'application/json',
    'X-VoiceDrive-Signature': signature,
    'X-VoiceDrive-Timestamp': timestamp,
    'X-VoiceDrive-Source': 'voicedrive-system'
  };
}
