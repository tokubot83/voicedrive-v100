/**
 * 監査ログミドルウェア
 *
 * API Analytics endpoints用の詳細な監査ログを記録
 * 5年間の保持期間を想定
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 監査ログ記録ミドルウェア
 *
 * リクエストの詳細を記録し、レスポンス後に結果も記録
 */
export const auditLogger = (actionType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // リクエスト情報
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.headers['x-real-ip']?.toString() ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown';

    const userAgent = req.get('user-agent') || 'unknown';
    const userId = req.user?.staffId || 'system';

    // リクエストパラメータ（機密情報を除く）
    const sanitizedQuery = { ...req.query };
    const sanitizedBody = { ...req.body };

    // JWTトークンなどの機密情報を除去
    delete sanitizedBody.password;
    delete sanitizedBody.token;

    // オリジナルのres.jsonを保存
    const originalJson = res.json.bind(res);

    // res.jsonをオーバーライドしてレスポンスをキャプチャ
    let responseBody: any = null;
    let responseStatus: number = 200;

    res.json = function (body: any): Response {
      responseBody = body;
      responseStatus = res.statusCode;
      return originalJson(body);
    };

    // レスポンス完了時に監査ログを記録
    res.on('finish', async () => {
      const duration = Date.now() - startTime;

      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: actionType,
            entityType: 'Analytics',
            entityId: requestId,
            oldValues: {
              method: req.method,
              path: req.path,
              query: sanitizedQuery,
              body: sanitizedBody,
              ip: clientIp,
              userAgent,
              timestamp: new Date().toISOString()
            },
            newValues: {
              statusCode: responseStatus,
              duration,
              success: responseStatus >= 200 && responseStatus < 300,
              responseBodySummary: responseBody
                ? {
                    hasError: !!responseBody.error,
                    recordCount: responseBody.stats?.totalPosts || null
                  }
                : null
            },
            ipAddress: clientIp,
            userAgent
          }
        });

        console.log(
          `📋 監査ログ記録: ${actionType} | ${req.method} ${req.path} | ${responseStatus} | ${duration}ms | IP: ${clientIp}`
        );
      } catch (error) {
        console.error('❌ 監査ログ記録エラー:', error);
        // 監査ログ記録失敗はエラーとして扱わない（サービス継続優先）
      }
    });

    next();
  };
};

/**
 * 異常検知：短時間に大量リクエストがあった場合に警告
 */
interface RequestCount {
  count: number;
  firstRequest: number;
}

const requestCounts = new Map<string, RequestCount>();

export const anomalyDetector = (req: Request, res: Response, next: NextFunction): void => {
  const clientIp =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.headers['x-real-ip']?.toString() ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown';

  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1時間
  const threshold = 200; // 1時間に200リクエスト以上で警告

  // 現在のカウントを取得
  const current = requestCounts.get(clientIp) || { count: 0, firstRequest: now };

  // ウィンドウをリセット
  if (now - current.firstRequest > windowMs) {
    requestCounts.set(clientIp, { count: 1, firstRequest: now });
    next();
    return;
  }

  // カウントを増やす
  current.count++;
  requestCounts.set(clientIp, current);

  // 閾値チェック
  if (current.count > threshold) {
    console.error(
      `🚨 異常検知: IP ${clientIp} から1時間に${current.count}リクエスト（閾値: ${threshold}）`
    );

    // 管理者に通知（実装例：実際はメール/Slack通知など）
    prisma.notification
      .create({
        data: {
          category: 'system',
          subcategory: 'security',
          priority: 'critical',
          title: '異常なAPIアクセスを検知',
          content: `IP ${clientIp} から1時間に${current.count}リクエストを検知しました。`,
          target: 'admin',
          senderId: 'system',
          status: 'sent',
          sentAt: new Date(),
          recipientCount: 1
        }
      })
      .catch(error => {
        console.error('通知作成エラー:', error);
      });

    // 一定回数以上で自動ブロック
    if (current.count > threshold * 2) {
      res.status(429).json({
        error: {
          code: 'ANOMALY_DETECTED',
          message: '異常なアクセスパターンを検知しました。アクセスを一時的にブロックします。',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
  }

  next();
};

/**
 * リクエストカウントをクリーンアップ（定期実行推奨）
 */
export const cleanupRequestCounts = (): void => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1時間

  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.firstRequest > windowMs) {
      requestCounts.delete(ip);
    }
  }
};

// 1時間ごとにクリーンアップ
setInterval(cleanupRequestCounts, 60 * 60 * 1000);
