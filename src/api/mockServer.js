// モックサーバー with エラーハンドリング
import express from 'express';
import cors from 'cors';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateNotification, validatePayloadSize } from '../middleware/validationMiddleware.js';
import { standardRateLimit, performanceTestLimit } from '../middleware/rateLimitMiddleware.js';

const app = express();
const PORT = process.env.MOCK_SERVER_PORT || 3100;

// ミドルウェア設定
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ペイロードサイズ制限（全ルート）
app.use(validatePayloadSize(1048576)); // 1MB

// ヘルスチェックエンドポイント（認証不要）
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ステータスエンドポイント（認証不要）
app.get('/api/status', (req, res) => {
  res.json({
    server: 'VoiceDrive Mock Server',
    version: '1.0.0',
    errorHandling: 'enabled',
    features: {
      authentication: true,
      validation: true,
      rateLimit: true
    }
  });
});

// ====================
// 認証が必要なAPI
// ====================

// レート制限を適用
app.use('/api/medical', standardRateLimit);

// 通知送信エンドポイント
app.post('/api/medical/notifications',
  authenticateToken,           // 認証チェック
  validateNotification,        // データバリデーション
  (req, res) => {
    const { category, subcategory, priority, title, content, target } = req.body;

    // モック成功レスポンス
    res.json({
      success: true,
      id: `notif_${Date.now()}`,
      message: 'Notification sent successfully',
      data: {
        category,
        subcategory,
        priority,
        title,
        recipientCount: Array.isArray(target) ? target.length : 1
      }
    });
  }
);

// 面談予約エンドポイント
app.post('/api/medical/bookings',
  authenticateToken,
  (req, res) => {
    const { employeeId, preferredDate, reason } = req.body;

    // 簡易バリデーション
    if (!employeeId || !preferredDate || !reason) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    res.json({
      success: true,
      id: `booking_${Date.now()}`,
      message: 'Booking request created',
      data: {
        employeeId,
        preferredDate,
        status: 'pending'
      }
    });
  }
);

// アンケート結果送信エンドポイント
app.post('/api/medical/survey-results',
  authenticateToken,
  (req, res) => {
    const { surveyId, responses } = req.body;

    if (!surveyId || !responses) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Survey ID and responses are required',
        code: 'MISSING_FIELDS'
      });
    }

    res.json({
      success: true,
      id: `result_${Date.now()}`,
      message: 'Survey results submitted',
      data: {
        surveyId,
        responseCount: Object.keys(responses).length
      }
    });
  }
);

// パフォーマンステスト用エンドポイント
app.post('/api/medical/test/bulk',
  authenticateToken,
  performanceTestLimit,  // より厳しいレート制限
  (req, res) => {
    res.json({
      success: true,
      message: 'Bulk request processed',
      timestamp: new Date().toISOString()
    });
  }
);

// ====================
// エラーハンドリング
// ====================

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path
  });
});

// グローバルエラーハンドラー
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: 'Server Error',
    message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// サーバー起動
function startMockServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   VoiceDrive Mock Server (Enhanced)    ║
╠════════════════════════════════════════╣
║  ✅ Server: http://localhost:${PORT}      ║
║  ✅ Authentication: Enabled            ║
║  ✅ Validation: Enabled                ║
║  ✅ Rate Limiting: Enabled             ║
╚════════════════════════════════════════╝
      `);
      resolve(server);
    });

    server.on('error', reject);
  });
}

// エクスポート
export { app, startMockServer };

// 直接実行の場合
if (import.meta.url === `file://${process.argv[1]}`) {
  startMockServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}