// VoiceDrive APIサーバー
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes.js';
import agendaRoutes from './routes/agendaRoutes';
import postVoteRoutes from './routes/postVoteRoutes';
import agendaEscalationRoutes from './routes/agendaEscalationRoutes';
import agendaExpiredEscalationRoutes from './routes/agendaExpiredEscalationRoutes';
import proposalReviewRoutes from './routes/proposalReviewRoutes';
import { startExpiredEscalationJob } from './jobs/expiredEscalationCheckJob';

const app = express();
const PORT = process.env.PORT || 3003;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 議題モードAPI（より具体的なパスを先に登録）
console.log('📋 Registering Agenda API routes at /api/agenda');
app.use('/api/agenda', agendaRoutes);
app.use('/api/agenda', agendaEscalationRoutes);
app.use('/api/agenda', agendaExpiredEscalationRoutes);

// 提案レビューAPI
console.log('📝 Registering Proposal Review API routes at /api/proposal-review');
app.use('/api/proposal-review', proposalReviewRoutes);

// 投票API（より具体的なパスを先に登録）
console.log('🗳️  Registering Vote API routes at /api/posts');
app.use('/api/posts', postVoteRoutes);

// API ルート（より一般的なパスは後に登録）
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
│ • POST /api/summaries/receive               │
│ • POST /api/notifications                   │
│ • GET  /api/users/me                        │
│ • GET  /api/health                          │
└─────────────────────────────────────────────┘
  `);

  // Cron Job起動
  startExpiredEscalationJob();
});

export default app;