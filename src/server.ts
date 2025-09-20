// VoiceDrive APIサーバー
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes';

const app = express();
const PORT = process.env.PORT || 3003;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API ルート
app.use('/api', apiRoutes);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VoiceDrive API Server',
    version: '1.0.0',
  });
});

// 404 ハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// エラーハンドラー
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────────┐
│         VoiceDrive API Server               │
├─────────────────────────────────────────────┤
│ ✅ Server: http://localhost:${PORT}            │
│ ✅ Health: http://localhost:${PORT}/health       │
│ ✅ APIs: http://localhost:${PORT}/api           │
│                                             │
│ Available Endpoints:                        │
│ • POST /api/interviews                      │
│ • GET  /api/interviews                      │
│ • POST /api/notifications                   │
│ • GET  /api/users/me                        │
│ • GET  /api/health                          │
└─────────────────────────────────────────────┘
  `);
});

export default app;