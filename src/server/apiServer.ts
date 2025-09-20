// VoiceDrive APIサーバー（エラーハンドリング実装版）
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import medicalRoutes from '../routes/medicalRoutes';
import { validatePayloadSize } from '../middleware/validationMiddleware';

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
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ====================
// APIルート
// ====================

// 医療システムAPI
app.use('/api/medical', medicalRoutes);

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

// 404ハンドラー（すべての未定義ルート）
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

// グローバルエラーハンドラー
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);

  // エラーの種類に応じたレスポンス
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      code: 'VALIDATION_ERROR',
      details: err.details || []
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  if (err.name === 'ForbiddenError') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient permissions',
      code: 'FORBIDDEN'
    });
    return;
  }

  // デフォルトエラーレスポンス
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

export function startAPIServer(): Promise<any> {
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
  - GET  /api/medical/bookings/:id (Get booking)
  - POST /api/medical/survey-results (Submit survey)
  - GET  /api/medical/surveys      (List surveys)
  - GET  /api/medical/analytics/summary (Analytics)
      `);
      resolve(server);
    });

    server.on('error', (error: any) => {
      console.error('Failed to start server:', error);
      reject(error);
    });
  });
}

// エクスポート
export { app };

// 直接実行の場合
if (require.main === module) {
  startAPIServer().catch(err => {
    console.error('Server startup failed:', err);
    process.exit(1);
  });
}