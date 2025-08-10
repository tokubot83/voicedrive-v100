import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// ロガー設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: winston.format.json()
    })
  ]
});

// Express アプリケーション
const app = express();
const PORT = process.env.MCP_PORT || 8080;

// CORS設定
app.use(cors({
  origin: [
    'http://localhost:3000',  // 医療職員管理システム
    'http://localhost:5173',  // VoiceDrive
    'http://localhost:8080'   // MCPサーバー自身
  ],
  credentials: true
}));

// JSONパーサー
app.use(express.json());

// ロギングミドルウェア
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// 医療職員管理システムへのプロキシ
app.use('/api/medical', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/medical': '/api/v1'
  },
  on: {
    proxyReq: (proxyReq: any, req: any, res: any) => {
      logger.info(`Proxying to Medical System: ${req.method} ${req.path}`);
    },
    error: (err: any, req: any, res: any) => {
      logger.error(`Medical System Proxy Error: ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Medical System is unavailable' });
      }
    }
  }
}));

// VoiceDriveへのプロキシ
app.use('/api/voicedrive', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  pathRewrite: {
    '^/api/voicedrive': '/api/v1'
  },
  on: {
    proxyReq: (proxyReq: any, req: any, res: any) => {
      logger.info(`Proxying to VoiceDrive: ${req.method} ${req.path}`);
    },
    error: (err: any, req: any, res: any) => {
      logger.error(`VoiceDrive Proxy Error: ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({ error: 'VoiceDrive is unavailable' });
      }
    }
  }
}));

// 統合API - 両システムの状態を取得
app.get('/api/status', async (req, res) => {
  const status = {
    mcp: 'running',
    timestamp: new Date().toISOString(),
    services: {
      medical: { url: 'http://localhost:3000', status: 'unknown' },
      voicedrive: { url: 'http://localhost:5173', status: 'unknown' }
    }
  };

  // 各サービスの状態チェック
  try {
    const medicalResponse = await fetch('http://localhost:3000/api/health');
    status.services.medical.status = medicalResponse.ok ? 'healthy' : 'unhealthy';
  } catch (error) {
    status.services.medical.status = 'offline';
  }

  try {
    const voicedriveResponse = await fetch('http://localhost:5173/api/health');
    status.services.voicedrive.status = voicedriveResponse.ok ? 'healthy' : 'unhealthy';
  } catch (error) {
    status.services.voicedrive.status = 'offline';
  }

  res.json(status);
});

// 統合ダッシュボード（HTML）
app.get('/dashboard', (req, res) => {
  const dashboardHTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCP Integration Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .card h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.5em;
    }
    .status {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .status-dot.healthy { background: #10b981; }
    .status-dot.unhealthy { background: #f59e0b; }
    .status-dot.offline { background: #ef4444; }
    .status-dot.unknown { background: #6b7280; }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .metric:last-child {
      border-bottom: none;
    }
    .metric-value {
      font-weight: bold;
      color: #667eea;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      margin-top: 15px;
      transition: background 0.3s;
    }
    .button:hover {
      background: #764ba2;
    }
    .logs {
      background: #1f2937;
      color: #10b981;
      padding: 15px;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      height: 200px;
      overflow-y: auto;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 MCP Integration Dashboard</h1>
    
    <div class="grid">
      <!-- システム状態 -->
      <div class="card">
        <h2>📊 システム状態</h2>
        <div id="system-status">
          <div class="status">
            <span class="status-dot unknown"></span>
            <span>読み込み中...</span>
          </div>
        </div>
      </div>

      <!-- メトリクス -->
      <div class="card">
        <h2>📈 パフォーマンス</h2>
        <div class="metric">
          <span>レスポンス時間</span>
          <span class="metric-value">-ms</span>
        </div>
        <div class="metric">
          <span>成功率</span>
          <span class="metric-value">-%</span>
        </div>
        <div class="metric">
          <span>アクティブ接続</span>
          <span class="metric-value">-</span>
        </div>
      </div>

      <!-- クイックアクセス -->
      <div class="card">
        <h2>⚡ クイックアクセス</h2>
        <a href="http://localhost:3000" target="_blank" class="button">医療システム →</a>
        <a href="http://localhost:5173" target="_blank" class="button">VoiceDrive →</a>
        <a href="/api/status" target="_blank" class="button">API Status →</a>
      </div>

      <!-- 最新ログ -->
      <div class="card" style="grid-column: 1 / -1;">
        <h2>📝 最新ログ</h2>
        <div class="logs" id="logs">
          <div>[2025-08-10 15:00:00] MCP Server started</div>
          <div>[2025-08-10 15:00:01] Medical System: Connected</div>
          <div>[2025-08-10 15:00:02] VoiceDrive: Connected</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 状態を定期的に更新
    async function updateStatus() {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        const statusHtml = Object.entries(data.services).map(([name, service]) => {
          const statusClass = service.status === 'healthy' ? 'healthy' : 
                            service.status === 'unhealthy' ? 'unhealthy' : 
                            service.status === 'offline' ? 'offline' : 'unknown';
          return \`
            <div class="status">
              <span class="status-dot \${statusClass}"></span>
              <span>\${name}: \${service.status} (\${service.url})</span>
            </div>
          \`;
        }).join('');
        
        document.getElementById('system-status').innerHTML = statusHtml;
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }

    // 初期読み込みと定期更新
    updateStatus();
    setInterval(updateStatus, 5000);

    // ログの自動更新（WebSocket実装予定）
    setInterval(() => {
      const logsDiv = document.getElementById('logs');
      const time = new Date().toISOString().replace('T', ' ').substr(0, 19);
      const newLog = \`<div>[\${time}] Health check performed</div>\`;
      logsDiv.innerHTML += newLog;
      logsDiv.scrollTop = logsDiv.scrollHeight;
    }, 10000);
  </script>
</body>
</html>
  `;
  res.send(dashboardHTML);
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ログディレクトリの作成
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// サーバー起動
app.listen(PORT, () => {
  logger.info(`
┌─────────────────────────────────────────────┐
│         MCP Integration Server              │
├─────────────────────────────────────────────┤
│ ✅ Server: http://localhost:${PORT}            │
│ ✅ Dashboard: http://localhost:${PORT}/dashboard │
│ ✅ API Status: http://localhost:${PORT}/api/status │
│                                             │
│ Proxying:                                   │
│ • Medical System: http://localhost:3000    │
│ • VoiceDrive: http://localhost:5173        │
└─────────────────────────────────────────────┘
  `);
});

export default app;