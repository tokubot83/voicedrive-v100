// レート制限ミドルウェア

// メモリストア（本番環境ではRedis等を使用推奨）
class RateLimitStore {
  constructor() {
    this.records = new Map();
    // 定期的な古いレコードのクリーンアップ
    setInterval(() => this.cleanup(), 60000); // 1分ごと
  }

  // レコードを取得または作成
  getRecord(key) {
    const now = Date.now();
    let record = this.records.get(key);

    if (!record) {
      record = {
        count: 0,
        firstRequest: now,
        lastRequest: now
      };
      this.records.set(key, record);
    }

    return record;
  }

  // リクエストをインクリメント
  increment(key, windowMs) {
    const now = Date.now();
    const record = this.getRecord(key);

    // ウィンドウ期間が過ぎていたらリセット
    if (now - record.firstRequest > windowMs) {
      record.count = 1;
      record.firstRequest = now;
      record.lastRequest = now;
    } else {
      record.count++;
      record.lastRequest = now;
    }

    return record;
  }

  // レコードをリセット
  reset(key) {
    this.records.delete(key);
  }

  // 古いレコードをクリーンアップ
  cleanup() {
    const now = Date.now();
    const maxAge = 3600000; // 1時間

    for (const [key, record] of this.records.entries()) {
      if (now - record.lastRequest > maxAge) {
        this.records.delete(key);
      }
    }
  }
}

// ストアインスタンス
const store = new RateLimitStore();

// IPアドレス取得
function getClientId(req) {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

// レート制限ミドルウェア生成関数
export function rateLimit(options = {}) {
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

  return (req, res, next) => {
    const clientId = getClientId(req);
    const record = store.increment(clientId, config.windowMs);

    // レート制限ヘッダーを設定
    if (config.standardHeaders) {
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - record.count));
      res.setHeader('X-RateLimit-Reset', new Date(record.firstRequest + config.windowMs).toISOString());
    }

    // レート制限に達した場合
    if (record.count > config.max) {
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
      res.send = function(data) {
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