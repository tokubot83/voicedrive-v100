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
app.use('/api/medical', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  pathRewrite: {
    '^/api/medical': '/api/v1'
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

// VoiceDrive向け受信エンドポイント - 医療システムからの提案受信
const proposalStore = new Map<string, any>(); // 提案データの一時保存
const bookingStore = new Map<string, any>(); // 予約確定データの保存
const interviewReservations = new Map<string, any>(); // フィードバック面談予約データ

// 1. 医療システムからの3パターン提案受信
app.post('/api/medical/proposals', (req, res) => {
  const proposalData = req.body;
  logger.info('Proposal received from Medical System:', {
    voicedriveRequestId: proposalData.voicedriveRequestId,
    proposalCount: proposalData.proposals?.length || 0
  });

  // データ検証
  if (!proposalData.voicedriveRequestId || !proposalData.proposals) {
    return res.status(400).json({
      success: false,
      error: 'Invalid proposal data'
    });
  }

  // 提案データを保存
  proposalStore.set(proposalData.voicedriveRequestId, {
    ...proposalData,
    receivedAt: new Date().toISOString(),
    status: 'pending_selection'
  });

  // VoiceDriveフロントエンドへの通知（WebSocket実装予定）
  logger.info(`Stored ${proposalData.proposals.length} proposals for request ${proposalData.voicedriveRequestId}`);

  res.json({
    success: true,
    message: 'Proposals received and stored',
    voicedriveRequestId: proposalData.voicedriveRequestId,
    proposalCount: proposalData.proposals.length
  });
});

// 2. 本予約確定通知受信
app.post('/api/medical/booking-confirmed', (req, res) => {
  const confirmationData = req.body;
  logger.info('Booking confirmation received:', {
    voicedriveRequestId: confirmationData.voicedriveRequestId,
    bookingId: confirmationData.bookingId
  });

  // データ検証
  if (!confirmationData.voicedriveRequestId || !confirmationData.bookingId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid confirmation data'
    });
  }

  // 確定データを保存
  bookingStore.set(confirmationData.voicedriveRequestId, {
    ...confirmationData,
    confirmedAt: new Date().toISOString(),
    status: 'confirmed'
  });

  // 提案データのステータスも更新
  const proposal = proposalStore.get(confirmationData.voicedriveRequestId);
  if (proposal) {
    proposal.status = 'confirmed';
    proposal.bookingId = confirmationData.bookingId;
  }

  logger.info(`Booking confirmed: ${confirmationData.bookingId}`);

  res.json({
    success: true,
    message: 'Booking confirmation received',
    bookingId: confirmationData.bookingId
  });
});

// 3. 再調整提案受信
app.post('/api/medical/reschedule-proposals', (req, res) => {
  const rescheduleData = req.body;
  logger.info('Reschedule proposals received:', {
    voicedriveRequestId: rescheduleData.voicedriveRequestId,
    adjustmentId: rescheduleData.adjustmentId
  });

  // 既存の提案データを更新
  const originalProposal = proposalStore.get(rescheduleData.voicedriveRequestId);
  if (originalProposal) {
    originalProposal.revisedProposals = rescheduleData.revisedProposals;
    originalProposal.adjustmentId = rescheduleData.adjustmentId;
    originalProposal.adjustmentSummary = rescheduleData.adjustmentSummary;
    originalProposal.status = 'revised_pending_selection';
    originalProposal.revisedAt = new Date().toISOString();
  } else {
    // 新規として保存
    proposalStore.set(rescheduleData.voicedriveRequestId, {
      ...rescheduleData,
      receivedAt: new Date().toISOString(),
      status: 'revised_pending_selection'
    });
  }

  logger.info(`Reschedule proposals stored for ${rescheduleData.voicedriveRequestId}`);

  res.json({
    success: true,
    message: 'Reschedule proposals received',
    adjustmentId: rescheduleData.adjustmentId
  });
});

// VoiceDriveフロントエンド向け：提案データ取得API
app.get('/api/medical/proposals/:requestId', (req, res) => {
  const { requestId } = req.params;
  const proposalData = proposalStore.get(requestId);

  if (!proposalData) {
    return res.status(404).json({
      success: false,
      error: 'Proposals not found'
    });
  }

  logger.info(`Proposals retrieved for ${requestId}`);
  res.json({
    success: true,
    data: proposalData
  });
});

// VoiceDriveフロントエンド向け：予約確定データ取得API
app.get('/api/medical/booking/:requestId', (req, res) => {
  const { requestId } = req.params;
  const bookingData = bookingStore.get(requestId);

  if (!bookingData) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found'
    });
  }

  logger.info(`Booking data retrieved for ${requestId}`);
  res.json({
    success: true,
    data: bookingData
  });
});

// VoiceDriveフロントエンド向け：ステータス確認API
app.get('/api/medical/status/:requestId', (req, res) => {
  const { requestId } = req.params;
  const proposalData = proposalStore.get(requestId);
  const bookingData = bookingStore.get(requestId);

  const status = {
    requestId,
    hasProposals: !!proposalData,
    proposalStatus: proposalData?.status || 'no_data',
    hasBooking: !!bookingData,
    bookingStatus: bookingData?.status || 'no_data',
    lastUpdate: proposalData?.revisedAt || proposalData?.receivedAt || null
  };

  logger.info(`Status check for ${requestId}:`, status);
  res.json({
    success: true,
    status
  });
});

// フィードバック面談予約受信API
app.post('/api/interviews/reservations', (req, res) => {
  const reservationData = req.body;

  logger.info('Feedback interview reservation received:', {
    staffId: reservationData.staffId,
    type: reservationData.type,
    category: reservationData.supportCategory,
    urgency: reservationData.urgency,
    evaluationId: reservationData.evaluationDetails?.evaluationId
  });

  // データ検証
  if (!reservationData.staffId || !reservationData.type) {
    return res.status(400).json({
      success: false,
      error: 'Invalid reservation data',
      message: 'staffId and type are required'
    });
  }

  // 予約IDを生成
  const reservationId = `RES_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

  // 予約データを保存
  const reservation = {
    id: reservationId,
    ...reservationData,
    status: 'pending_schedule',
    receivedAt: new Date().toISOString(),
    processedBy: 'medical_system'
  };

  interviewReservations.set(reservationId, reservation);

  logger.info(`Feedback interview reservation saved: ${reservationId}`);

  // 成功レスポンス（医療システム想定）
  res.json({
    success: true,
    reservationId,
    message: 'フィードバック面談の予約を受け付けました',
    status: 'pending_schedule',
    estimatedResponseDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2日後
    nextSteps: [
      '調整担当者が面談日程を確認します',
      '48時間以内に候補日時をご連絡します',
      '日程確定後、正式な予約確認通知を送信します'
    ]
  });
});

// フィードバック面談予約一覧取得API
app.get('/api/interviews/reservations', (req, res) => {
  const { staffId, status } = req.query;

  let reservations = Array.from(interviewReservations.values());

  // フィルタリング
  if (staffId) {
    reservations = reservations.filter(r => r.staffId === staffId);
  }
  if (status) {
    reservations = reservations.filter(r => r.status === status);
  }

  logger.info(`Reservations retrieved: ${reservations.length} records`);

  res.json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});

// フィードバック面談予約詳細取得API
app.get('/api/interviews/reservations/:id', (req, res) => {
  const { id } = req.params;
  const reservation = interviewReservations.get(id);

  if (!reservation) {
    return res.status(404).json({
      success: false,
      error: 'Reservation not found'
    });
  }

  logger.info(`Reservation details retrieved: ${id}`);

  res.json({
    success: true,
    data: reservation
  });
});

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