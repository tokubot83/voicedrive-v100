// レート制限ミドルウェア (TypeScript版)
import { Request, Response, NextFunction } from 'express';

// レート制限設定の型定義
interface RateLimitOptions {
  windowMs?: number;        // ウィンドウサイズ（ミリ秒）
  max?: number;            // 最大リクエスト数
  message?: string;        // エラーメッセージ
  standardHeaders?: boolean; // X-RateLimit-* ヘッダーを含める
  legacyHeaders?: boolean;  // X-RateLimit-* レガシーヘッダー
  skipSuccessfulRequests?: boolean; // 成功リクエストをカウントしない
  skipFailedRequests?: boolean; // 失敗リクエストをカウントしない
}

// クライアントごとのリクエスト情報
interface ClientInfo {
  count: number;
  windowStart: number;
  lastRequest: number;
}

// メモリストア（本番環境ではRedisを推奨）
class MemoryStore {
  private clients: Map<string, ClientInfo> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 定期的なクリーンアップ（1分ごと）
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  increment(key: string, windowMs: number): ClientInfo {
    const now = Date.now();
    const client = this.clients.get(key) || {
      count: 0,
      windowStart: now,
      lastRequest: now
    };

    // ウィンドウの確認
    if (now - client.windowStart > windowMs) {
      // 新しいウィンドウ
      client.count = 1;
      client.windowStart = now;
    } else {
      // 既存ウィンドウでカウント
      client.count++;
    }

    client.lastRequest = now;
    this.clients.set(key, client);
    return client;
  }

  get(key: string): ClientInfo | undefined {
    return this.clients.get(key);
  }

  reset(key: string): void {
    this.clients.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1時間

    for (const [key, client] of this.clients.entries()) {
      if (now - client.lastRequest > maxAge) {
        this.clients.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clients.clear();
  }
}

// ストアインスタンス
const store = new MemoryStore();

// IPアドレス取得関数
function getClientId(req: Request): string {
  // X-Forwarded-For ヘッダーを優先（プロキシ経由の場合）
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // 通常のIPアドレス
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

// レート制限ミドルウェア生成関数
export function rateLimit(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const config = {
    windowMs: 1000,           // デフォルト: 1秒
    max: 10,                  // デフォルト: 10リクエスト/秒
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    ...options
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = getClientId(req);
    const client = store.increment(clientId, config.windowMs);

    // レート制限ヘッダーを設定
    if (config.standardHeaders) {
      res.setHeader('X-RateLimit-Limit', config.max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - client.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(client.windowStart + config.windowMs).toISOString());
    }

    // レート制限に達した場合
    if (client.count > config.max) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: config.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(config.windowMs / 1000),
        limit: config.max,
        windowMs: config.windowMs
      });
      return;
    }

    // 成功/失敗時のスキップ処理
    if (config.skipSuccessfulRequests || config.skipFailedRequests) {
      const originalSend = res.send;
      res.send = function(data: any): Response {
        // ステータスコードに基づいてカウントを調整
        if ((config.skipSuccessfulRequests && res.statusCode < 400) ||
            (config.skipFailedRequests && res.statusCode >= 400)) {
          store.reset(clientId);
        }
        return originalSend.call(this, data);
      };
    }

    next();
  };
}

// プリセット設定

// 標準レート制限（10リクエスト/秒）
export const standardRateLimit = rateLimit({
  windowMs: 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again after a second'
});

// 厳しいレート制限（5リクエスト/10秒）
export const strictRateLimit = rateLimit({
  windowMs: 10000,
  max: 5,
  message: 'Rate limit exceeded. Please wait before retrying'
});

// パフォーマンステスト用（100リクエスト/秒）
export const performanceTestLimit = rateLimit({
  windowMs: 1000,
  max: 100,
  message: 'Performance test rate limit exceeded'
});

// API用レート制限（60リクエスト/分）
export const apiRateLimit = rateLimit({
  windowMs: 60000,
  max: 60,
  message: 'API rate limit exceeded. Please try again in a minute'
});

// 認証試行用レート制限（5試行/15分）
export const authRateLimit = rateLimit({
  windowMs: 900000, // 15分
  max: 5,
  message: 'Too many authentication attempts. Please try again later',
  skipSuccessfulRequests: true // 成功した認証はカウントしない
});

export default {
  rateLimit,
  standardRateLimit,
  strictRateLimit,
  performanceTestLimit,
  apiRateLimit,
  authRateLimit
};