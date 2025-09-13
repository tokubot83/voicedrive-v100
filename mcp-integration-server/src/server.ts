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

// V3 API endpoints - 医療チーム提案の新フロー対応
app.post('/api/v3/appeals/submit', (req, res) => {
  logger.info('V3 Appeal submission received:', req.body);
  
  // V3異議申立受信の模擬レスポンス
  const appealId = `APL${Date.now()}`;
  const response = {
    appealId,
    status: 'received',
    assignedTo: 'MGR002',
    estimatedResponseDate: '2025-08-28',
    message: 'V3異議申立を受理しました',
    voiceDriveCallbackUrl: `/api/v3/appeals/${appealId}/status`
  };
  
  logger.info('V3 Appeal response:', response);
  res.json(response);
});

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

// V3評価システムAPIモック - 100点満点対応
app.get('/api/v3/evaluation/periods', (req, res) => {
  const v3Data = {
    success: true,
    version: "v3.0.0",
    systemType: "100-point-evaluation",
    periods: [
      {
        id: "2025-H1-V3",
        name: "2025年度上期（V3）",
        startDate: "2025-04-01",
        endDate: "2025-09-30",
        evaluationStartDate: "2025-09-15",
        evaluationEndDate: "2025-10-15",
        disclosureDate: "2025-10-20",
        appealDeadline: "2025-11-03",
        status: "active",
        evaluationSystem: {
          maxScore: 100,
          minScore: 0,
          gradeSystem: "7-tier",
          gradeBoundaries: [90, 80, 70, 60, 50, 40, 0],
          gradeLabels: ["S", "A+", "A", "B+", "B", "C", "D"]
        }
      },
      {
        id: "2024-H2-V3",
        name: "2024年度下期（V3）",
        startDate: "2024-10-01",
        endDate: "2025-03-31",
        evaluationStartDate: "2025-03-15",
        evaluationEndDate: "2025-04-15",
        disclosureDate: "2025-04-20",
        appealDeadline: "2025-05-04",
        status: "active",
        evaluationSystem: {
          maxScore: 100,
          minScore: 0,
          gradeSystem: "7-tier",
          gradeBoundaries: [90, 80, 70, 60, 50, 40, 0],
          gradeLabels: ["S", "A+", "A", "B+", "B", "C", "D"]
        }
      }
    ]
  };
  
  logger.info(`V3 Medical System API: /api/v3/evaluation/periods called`);
  res.json(v3Data);
});

// V3異議申し立て送信APIモック
app.post('/api/v3/appeals', (req, res) => {
  const { body } = req;
  
  // V3データ検証
  if (!body.employeeId || !body.evaluationPeriod || !body.appealReason) {
    return res.status(400).json({
      success: false,
      error: {
        code: "V3_VALIDATION_ERROR",
        message: "必須フィールドが不足しています（V3システム）",
        details: {
          requiredFields: ["employeeId", "evaluationPeriod", "appealReason"],
          receivedFields: Object.keys(body)
        }
      }
    });
  }
  
  // V3優先度判定（100点満点システム対応）
  const determineV3Priority = (request: any) => {
    if (request.appealCategory === 'calculation_error') return 'high';
    
    if (request.originalScore !== undefined && request.requestedScore !== undefined) {
      const diff = request.requestedScore - request.originalScore;
      if (diff >= 15) return 'high';  // V3では15点以上で高優先度
      if (diff >= 8) return 'medium'; // V3では8点以上で中優先度
    }
    
    if (request.appealCategory === 'achievement_oversight') return 'medium';
    
    return 'low';
  };
  
  const priority = determineV3Priority(body);
  const appealId = `V3-APPEAL-${Date.now()}`;
  
  // V3レスポンス
  const v3Response = {
    success: true,
    version: "v3.0.0",
    appealId: appealId,
    message: "V3評価システムで異議申し立てを受理しました",
    expectedResponseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    details: {
      status: "under_review",
      priority: priority,
      processedAt: new Date().toISOString(),
      assignedTo: priority === 'high' ? 'DEPT_HEAD_V3_001' : 
                  priority === 'medium' ? 'SECTION_CHIEF_V3_001' : 
                  'TEAM_LEADER_V3_001',
      evaluationSystem: "100-point",
      gradingSystem: "7-tier",
      scoreDifference: body.requestedScore - body.originalScore || 0,
      grade: {
        current: getV3Grade(body.originalScore || 0),
        requested: getV3Grade(body.requestedScore || 0)
      }
    }
  };
  
  logger.info(`V3 Appeal submitted: ${appealId}, Priority: ${priority}`);
  res.json(v3Response);
});

// V3グレード計算関数
function getV3Grade(score: number): string {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A+';
  if (score >= 70) return 'A';
  if (score >= 60) return 'B+';
  if (score >= 50) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

// V3審査者割り当て確認API
app.get('/api/v3/appeals/:appealId/status', (req, res) => {
  const { appealId } = req.params;
  
  const v3Status = {
    success: true,
    version: "v3.0.0",
    appealId: appealId,
    status: "under_review",
    assignedReviewer: {
      id: "DEPT_HEAD_V3_001",
      name: "V3部門長テスト",
      role: "department_head_v3",
      capacity: "available"
    },
    workflow: {
      currentStep: 2,
      totalSteps: 4,
      estimatedCompletion: "2025-08-27",
      steps: [
        { step: 1, name: "受理確認", status: "completed", completedAt: "2025-08-20T14:45:00Z" },
        { step: 2, name: "V3評価検証", status: "in_progress", startedAt: "2025-08-20T14:50:00Z" },
        { step: 3, name: "100点満点再計算", status: "pending" },
        { step: 4, name: "7段階グレード確定", status: "pending" }
      ]
    },
    evaluationDetails: {
      systemVersion: "v3.0.0",
      maxScore: 100,
      gradeSystem: "7-tier"
    }
  };
  
  logger.info(`V3 Appeal status checked: ${appealId}`);
  res.json(v3Status);
});

// レガシーV1 APIモック（廃止予定）
app.get('/api/v1/evaluation/periods', (req, res) => {
  logger.warn(`DEPRECATED: V1 API called - /api/v1/evaluation/periods. Please migrate to V3.`);
  res.status(410).json({
    error: "DEPRECATED_API",
    message: "V1 APIは廃止されました。V3 APIをご利用ください。",
    migration: {
      oldEndpoint: "/api/v1/evaluation/periods",
      newEndpoint: "/api/v3/evaluation/periods", 
      changes: [
        "100点満点システム対応",
        "7段階グレードシステム",
        "V3データ構造への変更"
      ]
    }
  });
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