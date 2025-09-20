// VoiceDrive APIサーバー（エラーハンドリング実装版）
import express from 'express';
import cors from 'cors';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateNotification, validateBookingData, validateSurveyData, validatePayloadSize } from '../middleware/validationMiddleware.js';
import { standardRateLimit, apiRateLimit } from '../middleware/rateLimitMiddleware.js';

const app = express();
const PORT = process.env.API_PORT || 8080;

// ====================
// グローバルミドルウェア
// ====================

// CORS設定
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true
}));

// JSON解析（サイズ制限付き）
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ペイロードサイズ制限
app.use(validatePayloadSize(1048576)); // 1MB

// リクエストログ
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ====================
// 医療システムAPI
// ====================

// 通知送信
app.post('/api/medical/notifications',
  standardRateLimit,
  authenticateToken,
  validateNotification,
  async (req, res) => {
    const { category, subcategory, priority, title, content, target } = req.body;

    try {
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
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send notification',
        code: 'NOTIFICATION_FAILED'
      });
    }
  }
);

// 面談予約
app.post('/api/medical/bookings',
  standardRateLimit,
  authenticateToken,
  validateBookingData,
  async (req, res) => {
    const { employeeId, preferredDate, reason } = req.body;

    try {
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
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create booking',
        code: 'BOOKING_FAILED'
      });
    }
  }
);

// アンケート結果送信
app.post('/api/medical/survey-results',
  standardRateLimit,
  authenticateToken,
  validateSurveyData,
  async (req, res) => {
    const { surveyId, responses } = req.body;

    try {
      res.json({
        success: true,
        id: `result_${Date.now()}`,
        message: 'Survey results submitted',
        data: {
          surveyId,
          responseCount: Object.keys(responses).length
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to submit survey results',
        code: 'SURVEY_SUBMIT_FAILED'
      });
    }
  }
);

// ヘルスチェック（ルート）
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      authentication: true,
      validation: true,
      rateLimit: true,
      errorHandling: true
    }
  });
});

// ステータスエンドポイント
app.get('/api/status', (req, res) => {
  res.json({
    server: 'VoiceDrive API Server',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    errorHandling: 'enabled',
    features: {
      authentication: true,
      validation: true,
      rateLimit: true,
      cors: true
    }
  });
});

// ====================
// エラーハンドリング
// ====================

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

// グローバルエラーハンドラー
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: 'Server Error',
    message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
});

// ====================
// サーバー起動
// ====================

export function startAPIServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║    VoiceDrive API Server v2.0.0              ║
╠═══════════════════════════════════════════════╣
║  ✅ Server: http://localhost:${PORT}            ║
║  ✅ Authentication: Enabled                  ║
║  ✅ Validation: Enabled                      ║
║  ✅ Rate Limiting: Enabled                   ║
║  ✅ Error Handling: Enhanced                 ║
╚═══════════════════════════════════════════════╝

Available Endpoints:
  - GET  /api/health              (Health check)
  - GET  /api/status              (Server status)
  - POST /api/medical/notifications (Send notification)
  - POST /api/medical/bookings     (Create booking)
  - POST /api/medical/survey-results (Submit survey)
      `);
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });
  });
}

// エクスポート
export { app };

// 直接実行の場合
if (import.meta.url === `file://${process.argv[1]}`) {
  startAPIServer().catch(err => {
    console.error('Server startup failed:', err);
    process.exit(1);
  });
}