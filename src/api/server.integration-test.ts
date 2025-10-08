import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import permissionsRoutes from './routes/permissions.routes';
import consentRoutes from './routes/consent.routes';
import analyticsRoutes from './routes/analytics.routes';
import webhookRoutes from './routes/webhook.routes';

// 統合テスト環境変数の読み込み
import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.integration-test');
console.log('Loading integration test environment from:', envPath);
config({ path: envPath });

const app: Application = express();
const PORT = process.env.PORT || 4000;

// セキュリティミドルウェア
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS設定
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003',
    'https://voicedrive.ohara-hospital.jp',
    'https://staging.voicedrive.ohara-hospital.jp'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// ボディパーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// レート制限 - 認証エンドポイント
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 5,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '認証リクエストが多すぎます。しばらく待ってから再試行してください。',
      timestamp: new Date().toISOString()
    }
  }
});

// レート制限 - API一般
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 100,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'APIリクエストが多すぎます。',
      timestamp: new Date().toISOString()
    }
  }
});

// レート制限 - 権限計算（最優先API）
const calculateLevelLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 100, // 高頻度アクセス可能
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '権限計算リクエストが多すぎます。',
      timestamp: new Date().toISOString()
    }
  }
});

// ヘルスチェック
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'test'
  });
});

// MCPサーバー連携用ヘルスチェック
app.get('/api/mcp/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      mcp_server: 'connected',
      cache: 'connected'
    },
    lastSync: {
      timestamp: new Date().toISOString(),
      status: 'success',
      recordsProcessed: 450
    }
  });
});

// ルート設定
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, permissionsRoutes);
app.use('/api', calculateLevelLimiter, permissionsRoutes); // /api/v1/calculate-level用
app.use('/api/consent', apiLimiter, consentRoutes);
app.use('/api/v1/analytics', analyticsRoutes); // レート制限はルート内で個別に設定
app.use('/api/webhook', webhookRoutes); // Webhook通知受信

// 404ハンドラー
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'エンドポイントが見つかりません',
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
});

// エラーハンドラー
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'サーバーエラーが発生しました';

  res.status(statusCode).json({
    error: {
      code: 'INTERNAL_ERROR',
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`
  ====================================
  🚀 VoiceDrive API Server (Integration Test)
  ====================================
  Environment: ${process.env.NODE_ENV || 'test'}
  Port: ${PORT}
  Health: http://localhost:${PORT}/health
  Analytics API: http://localhost:${PORT}/api/v1/analytics
  ====================================
  `);
});

export default app;
