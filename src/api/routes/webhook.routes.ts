/**
 * Webhook Routes
 *
 * 職員カルテシステムからのAnalyticsバッチ処理通知受信用エンドポイント
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

/**
 * 通知リクエスト型定義
 */
interface NotificationRequest {
  notificationId: string;
  timestamp: string; // ISO 8601形式
  accountLevel: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: SuccessDetails | ErrorDetails;
}

interface SuccessDetails {
  processedRecords: number;
  startTime: string;
  endTime: string;
  processingDuration: number; // ミリ秒
}

interface ErrorDetails {
  errorCode: string;
  errorMessage: string;
  failedAt: string;
  retryCount?: number;
  stackTrace?: string;
}

/**
 * HMAC署名検証関数
 *
 * @param payload - リクエストボディ（JSON文字列）
 * @param signature - X-Signatureヘッダーの値
 * @param timestamp - X-Timestampヘッダーの値
 * @param secret - HMAC署名用の秘密鍵
 * @returns 署名が有効な場合true、無効な場合false
 */
function verifyHmacSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  try {
    // タイムスタンプ検証（±5分以内）
    const requestTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = Math.abs(currentTime - requestTime);
    const fiveMinutes = 5 * 60 * 1000;

    if (timeDiff > fiveMinutes) {
      console.warn('⚠️  タイムスタンプが許容範囲外:', {
        requestTime: new Date(requestTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        diffMinutes: (timeDiff / 60000).toFixed(2)
      });
      return false;
    }

    // HMAC-SHA256署名検証
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload + timestamp)
      .digest('hex');

    const isValid = signature === expectedSignature;

    if (!isValid) {
      console.warn('⚠️  HMAC署名が一致しません:', {
        expected: expectedSignature.substring(0, 16) + '...',
        received: signature.substring(0, 16) + '...'
      });
    }

    return isValid;
  } catch (error) {
    console.error('HMAC署名検証エラー:', error);
    return false;
  }
}

/**
 * アカウントレベル99のユーザーに通知
 *
 * @param notification - 通知データ
 */
async function notifyAccountLevel99Users(notification: NotificationRequest): Promise<void> {
  try {
    // 1. accountLevel 99のユーザーを取得
    const level99Users = await prisma.user.findMany({
      where: {
        permissionLevel: 99
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log('📢 アカウントレベル99のユーザー:', {
      count: level99Users.length,
      users: level99Users.map(u => ({ id: u.id, name: u.name }))
    });

    // 2. 通知レコードをデータベースに作成
    const webhookNotification = await prisma.webhookNotification.create({
      data: {
        notificationId: notification.notificationId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        details: notification.details ? notification.details : null,
        accountLevel: notification.accountLevel,
        timestamp: new Date(notification.timestamp),
        read: false
      }
    });

    console.log('✅ Webhook通知レコード作成:', {
      id: webhookNotification.id,
      notificationId: webhookNotification.notificationId,
      type: webhookNotification.type,
      title: webhookNotification.title
    });

    // 3. リアルタイム通知（WebSocketまたはポーリング）
    // TODO: WebSocket実装またはポーリングエンドポイント追加（11月11-15日予定）
    // 現在はデータベースに保存のみ。フロントエンドは定期的にGETリクエストで取得可能

  } catch (error) {
    console.error('通知作成エラー:', error);
    throw error;
  }
}

/**
 * GET /api/webhook/notifications
 *
 * Webhook通知一覧を取得（ポーリング用）
 *
 * クエリパラメータ:
 * - unreadOnly: 'true' の場合、未読のみ取得
 * - limit: 取得件数（デフォルト: 50）
 * - type: フィルタリング（success, error, warning, info）
 */
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as string;

    const where: any = {
      accountLevel: 99
    };

    if (unreadOnly) {
      where.read = false;
    }

    if (type && ['success', 'error', 'warning', 'info'].includes(type)) {
      where.type = type;
    }

    const notifications = await prisma.webhookNotification.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    const unreadCount = await prisma.webhookNotification.count({
      where: {
        accountLevel: 99,
        read: false
      }
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      totalCount: notifications.length
    });
  } catch (error) {
    console.error('通知取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '通知取得に失敗しました',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * PATCH /api/webhook/notifications/:id/read
 *
 * 通知を既読にする
 */
router.patch('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.webhookNotification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('通知既読更新エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '通知の既読更新に失敗しました',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * PATCH /api/webhook/notifications/read-all
 *
 * すべての通知を既読にする
 */
router.patch('/notifications/read-all', async (req: Request, res: Response) => {
  try {
    const result = await prisma.webhookNotification.updateMany({
      where: {
        accountLevel: 99,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('全通知既読更新エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '全通知の既読更新に失敗しました',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * POST /api/webhook/analytics-notification
 *
 * 職員カルテシステムからのAnalyticsバッチ処理通知を受信
 *
 * セキュリティ:
 * - HMAC-SHA256署名検証
 * - タイムスタンプ検証（±5分以内）
 * - アカウントレベル検証（99のみ許可）
 */
router.post('/analytics-notification', async (req: Request, res: Response) => {
  try {
    console.log('📨 Webhook通知受信:', {
      headers: {
        signature: req.headers['x-signature'] ? '***' : 'なし',
        timestamp: req.headers['x-timestamp']
      }
    });

    // ヘッダー取得
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    // 必須ヘッダーチェック
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'X-Signatureヘッダーが必要です',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (!timestamp) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TIMESTAMP',
          message: 'X-Timestampヘッダーが必要です',
          timestamp: new Date().toISOString()
        }
      });
    }

    // HMAC署名検証
    const payload = JSON.stringify(req.body);
    const HMAC_SECRET = process.env.ANALYTICS_WEBHOOK_SECRET || '';

    if (!HMAC_SECRET) {
      console.error('❌ ANALYTICS_WEBHOOK_SECRET が設定されていません');
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_CONFIGURATION_ERROR',
          message: 'サーバー設定エラー',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (!verifyHmacSignature(payload, signature, timestamp, HMAC_SECRET)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'HMAC署名が無効です',
          timestamp: new Date().toISOString()
        }
      });
    }

    // リクエストボディのバリデーション
    const notification = req.body as NotificationRequest;

    if (!notification.notificationId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_NOTIFICATION_ID',
          message: 'notificationIdが必要です',
          timestamp: new Date().toISOString()
        }
      });
    }

    // アカウントレベル検証
    if (notification.accountLevel !== 99) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_ACCOUNT_LEVEL',
          message: 'accountLevelが99ではありません',
          details: {
            received: notification.accountLevel,
            required: 99
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    // 通知タイプ検証
    const validTypes = ['success', 'error', 'warning', 'info'];
    if (!validTypes.includes(notification.type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NOTIFICATION_TYPE',
          message: '無効な通知タイプです',
          details: {
            received: notification.type,
            valid: validTypes
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    // アカウントレベル99のユーザーに通知
    await notifyAccountLevel99Users(notification);

    // 成功レスポンス
    res.status(200).json({
      success: true,
      message: '通知を受信しました',
      notificationId: notification.notificationId,
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook通知処理エラー:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '内部エラーが発生しました',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
