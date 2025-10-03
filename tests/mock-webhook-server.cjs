/**
 * コンプライアンス通報 モックWebhookサーバー
 *
 * VoiceDriveチームの開発用モックサーバー
 * 医療システムからの受付確認通知Webhookをシミュレート
 *
 * 使用方法:
 * 1. npm install express body-parser
 * 2. node tests/mock-webhook-server.js
 * 3. http://localhost:3100 でサーバー起動
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.MOCK_WEBHOOK_PORT || 3100;

// モックシークレットキー（開発用）
const MOCK_SECRET = process.env.MOCK_WEBHOOK_SECRET || 'mock-secret-key-for-development-only-32chars';

// ミドルウェア設定
app.use(bodyParser.json());

// ロギングミドルウェア
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    service: 'Mock Webhook Server for Compliance Notifications',
    version: '1.0.0',
    endpoints: {
      webhook: 'POST /api/webhook/compliance/acknowledgement',
      test: 'POST /api/webhook/test',
      health: 'GET /health'
    },
    config: {
      port: PORT,
      signatureHeader: 'X-Webhook-Signature',
      timestampHeader: 'X-Webhook-Timestamp'
    }
  });
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 署名検証関数
function verifyWebhookSignature(receivedSignature, payload, secret) {
  try {
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    const receivedBuffer = Buffer.from(receivedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch (error) {
    console.error('Signature verification error:', error.message);
    return false;
  }
}

// タイムスタンプ検証関数
function verifyTimestamp(timestamp, maxAgeMinutes = 5) {
  try {
    const receivedTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const ageMinutes = Math.abs(currentTime - receivedTime) / 1000 / 60;

    return ageMinutes <= maxAgeMinutes;
  } catch (error) {
    console.error('Timestamp verification error:', error.message);
    return false;
  }
}

// メインWebhookエンドポイント
app.post('/api/webhook/compliance/acknowledgement', (req, res) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  console.log('\n=== Webhook Request Received ===');
  console.log('Request ID:', requestId);
  console.log('Case Number:', req.headers['x-case-number']);
  console.log('Anonymous ID:', req.headers['x-anonymous-id']);
  console.log('Timestamp:', req.headers['x-webhook-timestamp']);

  // 1. 署名検証
  const receivedSignature = req.headers['x-webhook-signature'];
  if (!receivedSignature) {
    console.error('❌ Missing X-Webhook-Signature header');
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_SIGNATURE',
        message: 'X-Webhook-Signature header is required'
      },
      requestId
    });
  }

  if (!verifyWebhookSignature(receivedSignature, req.body, MOCK_SECRET)) {
    console.error('❌ Signature verification failed');
    console.error('Received Signature:', receivedSignature);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SIGNATURE',
        message: 'Webhook signature verification failed'
      },
      requestId
    });
  }
  console.log('✅ Signature verification passed');

  // 2. タイムスタンプ検証
  const timestamp = req.headers['x-webhook-timestamp'];
  if (!timestamp) {
    console.error('❌ Missing X-Webhook-Timestamp header');
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_TIMESTAMP',
        message: 'X-Webhook-Timestamp header is required'
      },
      requestId
    });
  }

  if (!verifyTimestamp(timestamp)) {
    console.error('❌ Timestamp verification failed (too old or too new)');
    return res.status(401).json({
      success: false,
      error: {
        code: 'TIMESTAMP_EXPIRED',
        message: 'Webhook timestamp is invalid or expired'
      },
      requestId
    });
  }
  console.log('✅ Timestamp verification passed');

  // 3. ペイロード検証
  const {
    reportId,
    caseNumber,
    anonymousId,
    severity,
    category,
    receivedAt,
    estimatedResponseTime
  } = req.body;

  const missingFields = [];
  if (!reportId) missingFields.push('reportId');
  if (!caseNumber) missingFields.push('caseNumber');
  if (!anonymousId) missingFields.push('anonymousId');
  if (!severity) missingFields.push('severity');
  if (!category) missingFields.push('category');
  if (!receivedAt) missingFields.push('receivedAt');
  if (!estimatedResponseTime) missingFields.push('estimatedResponseTime');

  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields.join(', '));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields',
        missingFields
      },
      requestId
    });
  }
  console.log('✅ Payload validation passed');

  // 4. データ表示（デバッグ用）
  console.log('\n--- Notification Data ---');
  console.log('Report ID:', reportId);
  console.log('Case Number:', caseNumber);
  console.log('Anonymous ID:', anonymousId);
  console.log('Severity:', severity);
  console.log('Category:', category);
  console.log('Received At:', receivedAt);
  console.log('Estimated Response Time:', estimatedResponseTime);
  console.log('------------------------\n');

  // 5. 模擬処理（実際はデータベース保存・通知送信等）
  const notificationId = `NOTIF-${Date.now()}`;
  console.log('✅ Notification processed successfully');
  console.log('Notification ID:', notificationId);

  // 6. 成功レスポンス
  res.status(200).json({
    success: true,
    notificationId,
    deliveredToUser: true,
    receivedAt: new Date().toISOString(),
    requestId
  });
  console.log('=== Webhook Request Completed ===\n');
});

// テスト用エンドポイント（署名生成ヘルパー）
app.post('/api/webhook/test', (req, res) => {
  const payload = req.body;
  const signature = crypto
    .createHmac('sha256', MOCK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  res.json({
    message: 'Test signature generated',
    payload,
    signature,
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Timestamp': new Date().toISOString()
    },
    curlExample: `curl -X POST http://localhost:${PORT}/api/webhook/compliance/acknowledgement \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Signature: ${signature}" \\
  -H "X-Webhook-Timestamp: ${new Date().toISOString()}" \\
  -H "X-Case-Number: ${payload.caseNumber || 'MED-2025-0001'}" \\
  -H "X-Anonymous-Id: ${payload.anonymousId || 'ANON-TEST-001'}" \\
  -d '${JSON.stringify(payload)}'`
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Mock Webhook Server for Compliance Notifications       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Secret Key: ${MOCK_SECRET.substring(0, 10)}...`);
  console.log(`\n📚 Available Endpoints:`);
  console.log(`   - GET  /                                  Server info`);
  console.log(`   - GET  /health                            Health check`);
  console.log(`   - POST /api/webhook/compliance/acknowledgement  Main webhook`);
  console.log(`   - POST /api/webhook/test                  Signature test helper`);
  console.log(`\n💡 Usage Example:`);
  console.log(`   curl http://localhost:${PORT}/api/webhook/test -X POST -H "Content-Type: application/json" -d '{"reportId":"VD-TEST-001","caseNumber":"MED-2025-0001","anonymousId":"ANON-TEST-001","severity":"high","category":"ハラスメント","receivedAt":"2025-10-03T10:00:00Z","estimatedResponseTime":"当日中"}'`);
  console.log('\n');
});

module.exports = app;
