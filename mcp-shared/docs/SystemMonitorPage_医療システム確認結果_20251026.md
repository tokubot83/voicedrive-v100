# SystemMonitorPage 医療システム確認結果

**作成日**: 2025年10月26日
**作成者**: 医療職員管理システム開発チーム
**対象**: VoiceDrive Phase 2.5 連携要件
**参照文書**: `SystemMonitorPage_DB要件分析_20251026.md`

---

## エグゼクティブサマリー

VoiceDriveチームによるSystemMonitorPage Phase 2（医療システム連携監視）の実装完了を確認しました。VoiceDrive側での20項目の監視機能が実装され、Webhook受信ログの記録とメトリクス提供が完了しています。

Phase 2.5として、双方向の連携監視を実現するため、医療職員管理システム側で以下3つのAPIを提供する必要があります：

1. **Webhook送信統計取得API** （優先度：高、必須）
2. **面談実施統計取得API** （優先度：中、必須）
3. **統合セキュリティイベントAPI** （優先度：低、オプション）

本文書では、各APIの詳細仕様、実装要件、データベーススキーマ、およびタイムラインを提示します。

---

## 1. Phase 2 実装確認

### VoiceDrive側で完了した実装（確認済み）

#### 1.1 データベーススキーマ
VoiceDriveの`WebhookLog`テーブルが正しく設計されていることを確認しました：

```prisma
model WebhookLog {
  id                  String   @id @default(cuid())
  eventType           String
  eventTimestamp      DateTime
  receivedAt          DateTime @default(now())
  requestId           String?  @unique
  staffId             String
  payloadSize         Int
  fullPayload         Json
  processingStatus    String
  processingTime      Int
  errorMessage        String?
  errorStack          String?
  signatureValid      Boolean
  ipAddress           String?
  userAgent           String?
  userFound           Boolean
  dataChanged         Boolean
  previousValue       Json?
  newValue            Json?
  isDuplicate         Boolean  @default(false)
  retryCount          Int      @default(0)
  createdAt           DateTime @default(now())

  @@index([eventType])
  @@index([receivedAt])
  @@index([processingStatus])
  @@index([staffId])
  @@index([eventType, receivedAt])
  @@index([processingStatus, receivedAt])
  @@index([requestId])
}
```

**確認事項**:
- ✅ 20フィールドが適切に定義されている
- ✅ 7つのインデックスが効率的なクエリをサポート
- ✅ `requestId`がユニーク制約で重複検出可能
- ✅ JSONフィールドで柔軟なペイロード保存

#### 1.2 監視メトリクス（20項目）
VoiceDriveの`MonitoringService.getIntegrationMetrics()`で提供される監視項目を確認：

**Webhook受信統計（10項目）**:
1. 24時間以内の受信件数
2. イベントタイプ別件数（employee.created）
3. イベントタイプ別件数（employee.photo.updated）
4. イベントタイプ別件数（employee.photo.deleted）
5. イベントタイプ別成功率
6. イベントタイプ別平均処理時間
7. 署名検証失敗件数
8. 処理エラー件数
9. 重複イベント件数
10. 最終受信日時・平均処理時間

**データ同期統計（5項目）**:
11. 総ユーザー数
12. 写真あり職員数
13. 写真同期率（%）
14. 24時間以内の同期件数
15. 同期エラー件数・最終同期日時

**接続性監視（5項目）**:
16. Webhookエンドポイント健全性ステータス
17. 最終Webhook受信日時
18. 最終受信からの経過時間
19. エラー率トレンド（improving/stable/degrading）
20. 直近エラーリスト（timestamp, eventType, errorMessage）

#### 1.3 APIエンドポイント
```
GET /api/integration/metrics  - 全メトリクス取得
GET /api/integration/health   - 健全性チェック（軽量版）
```

**評価**: VoiceDrive側の実装は完璧です。Phase 2として想定された全ての監視機能が実装されています。

---

## 2. Phase 2.5 要件分析

VoiceDriveチームが特定した通り、**双方向の連携監視**を実現するには医療システム側のデータが必要です。以下3つのAPIを医療職員管理システム側で実装します。

---

## 3. API 1: Webhook送信統計取得API（必須）

### 3.1 目的
医療システムから送信したWebhookとVoiceDriveが受信したWebhookの**差分を検出**し、通信障害やデータロスを早期発見する。

### 3.2 必要な理由
**問題シナリオ**:
- 医療システムが100件のWebhookを送信
- VoiceDriveは95件しか受信していない
- 5件がネットワーク障害で消失

**VoiceDriveだけでは検出できない理由**:
- VoiceDriveは「受信したWebhook」しか記録できない
- 「送信されたが届かなかったWebhook」は検出不可

**このAPIで可能になる監視**:
```typescript
// SystemMonitorPageでの表示例
送信済み: 100件
受信済み: 95件
→ 差分: 5件（要調査） ⚠️
```

### 3.3 エンドポイント仕様

```
GET /api/voicedrive/webhook-stats
```

**クエリパラメータ**:
```typescript
{
  startDate?: string;  // ISO 8601形式（デフォルト: 24時間前）
  endDate?: string;    // ISO 8601形式（デフォルト: 現在）
  eventType?: string;  // 特定イベントタイプのみ取得
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-10-25T12:00:00Z",
      "endDate": "2025-10-26T12:00:00Z"
    },
    "summary": {
      "totalSent": 150,
      "totalSuccess": 145,
      "totalFailed": 3,
      "totalRetrying": 2,
      "avgResponseTime": 125.5,
      "successRate": 96.67
    },
    "byEventType": {
      "employee.created": {
        "sent": 50,
        "success": 48,
        "failed": 1,
        "retrying": 1,
        "avgResponseTime": 145.2,
        "successRate": 96.0
      },
      "employee.photo.updated": {
        "sent": 80,
        "success": 78,
        "failed": 2,
        "retrying": 0,
        "avgResponseTime": 110.3,
        "successRate": 97.5
      },
      "employee.photo.deleted": {
        "sent": 20,
        "success": 19,
        "failed": 0,
        "retrying": 1,
        "avgResponseTime": 98.7,
        "successRate": 95.0
      }
    },
    "recentFailures": [
      {
        "timestamp": "2025-10-26T10:30:45Z",
        "eventType": "employee.created",
        "staffId": "EMP001234",
        "requestId": "req_abc123",
        "httpStatus": 500,
        "errorMessage": "VoiceDrive internal server error",
        "retryCount": 2,
        "nextRetryAt": "2025-10-26T10:45:00Z"
      },
      {
        "timestamp": "2025-10-26T09:15:22Z",
        "eventType": "employee.photo.updated",
        "staffId": "EMP005678",
        "requestId": "req_def456",
        "httpStatus": 0,
        "errorMessage": "Network timeout after 30s",
        "retryCount": 3,
        "nextRetryAt": null
      }
    ],
    "lastSentWebhook": {
      "timestamp": "2025-10-26T11:58:30Z",
      "eventType": "employee.photo.updated",
      "staffId": "EMP009999",
      "requestId": "req_ghi789",
      "status": "success",
      "responseTime": 98
    }
  },
  "timestamp": "2025-10-26T12:00:00Z"
}
```

### 3.4 必要なデータベーステーブル

医療システム側に新規テーブル追加が必要です：

```sql
-- Webhook送信ログテーブル
CREATE TABLE webhook_send_logs (
  id BIGSERIAL PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE NOT NULL,  -- X-Request-IDヘッダーと一致
  event_type VARCHAR(100) NOT NULL,
  event_timestamp TIMESTAMP NOT NULL,       -- イベント発生時刻
  sent_at TIMESTAMP DEFAULT NOW(),          -- 送信時刻
  staff_id VARCHAR(50) NOT NULL,
  payload_size INTEGER NOT NULL,
  full_payload JSONB,                       -- デバッグ用

  -- レスポンス情報
  response_status INTEGER,                  -- HTTPステータスコード
  response_time INTEGER,                    -- レスポンス時間（ミリ秒）
  response_body TEXT,                       -- VoiceDriveからのレスポンス

  -- 送信状態
  send_status VARCHAR(50) NOT NULL,         -- success, failed, retrying, timeout
  error_message TEXT,
  error_stack TEXT,

  -- リトライ情報
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  max_retries INTEGER DEFAULT 3,

  -- ネットワーク情報
  voicedrive_endpoint VARCHAR(500),
  request_timeout INTEGER DEFAULT 30000,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_webhook_send_logs_sent_at ON webhook_send_logs(sent_at);
CREATE INDEX idx_webhook_send_logs_event_type ON webhook_send_logs(event_type);
CREATE INDEX idx_webhook_send_logs_send_status ON webhook_send_logs(send_status);
CREATE INDEX idx_webhook_send_logs_staff_id ON webhook_send_logs(staff_id);
CREATE INDEX idx_webhook_send_logs_event_type_sent_at ON webhook_send_logs(event_type, sent_at);
CREATE INDEX idx_webhook_send_logs_send_status_sent_at ON webhook_send_logs(send_status, sent_at);
CREATE INDEX idx_webhook_send_logs_request_id ON webhook_send_logs(request_id);
```

### 3.5 実装要件

#### Webhook送信コードの変更

**既存のWebhook送信処理**（推測）:
```typescript
// 現在の実装（ログなし）
async function sendWebhook(eventType: string, data: any) {
  const payload = {
    eventType,
    timestamp: new Date().toISOString(),
    data
  };

  await fetch('https://voicedrive.example.com/api/webhooks/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': generateSignature(payload)
    },
    body: JSON.stringify(payload)
  });
}
```

**新しい実装（ログあり）**:
```typescript
import { v4 as uuidv4 } from 'uuid';

async function sendWebhook(eventType: string, data: any) {
  const requestId = uuidv4();
  const eventTimestamp = new Date();
  const payload = {
    eventType,
    timestamp: eventTimestamp.toISOString(),
    data
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString);

  let sendStatus = 'success';
  let responseStatus: number | null = null;
  let responseTime: number | null = null;
  let responseBody: string | null = null;
  let errorMessage: string | null = null;
  let errorStack: string | null = null;

  const startTime = Date.now();

  try {
    const response = await fetch('https://voicedrive.example.com/api/webhooks/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Request-ID': requestId  // 重複検出用
      },
      body: payloadString,
      signal: AbortSignal.timeout(30000)  // 30秒タイムアウト
    });

    responseStatus = response.status;
    responseTime = Date.now() - startTime;
    responseBody = await response.text();

    if (!response.ok) {
      sendStatus = 'failed';
      errorMessage = `HTTP ${response.status}: ${responseBody}`;
    }
  } catch (error) {
    sendStatus = error.name === 'AbortError' ? 'timeout' : 'failed';
    responseTime = Date.now() - startTime;
    errorMessage = error.message;
    errorStack = error.stack;
  }

  // データベースに記録
  await db.webhookSendLog.create({
    requestId,
    eventType,
    eventTimestamp,
    sentAt: new Date(),
    staffId: data.staffId,
    payloadSize: payloadString.length,
    fullPayload: payload,
    responseStatus,
    responseTime,
    responseBody,
    sendStatus,
    errorMessage,
    errorStack,
    retryCount: 0,
    voicediveEndpoint: 'https://voicedrive.example.com/api/webhooks/employees'
  });

  // 失敗時はリトライキューに追加
  if (sendStatus !== 'success') {
    await scheduleRetry(requestId);
  }
}
```

### 3.6 実装工数見積もり

| 作業項目 | 工数 | 担当 |
|---------|------|------|
| データベーステーブル作成 | 2時間 | DB担当 |
| Webhook送信処理の改修 | 4時間 | バックエンド |
| API実装（統計取得） | 6時間 | バックエンド |
| リトライ機能実装 | 4時間 | バックエンド |
| ユニットテスト | 4時間 | QA |
| 統合テスト | 2時間 | QA |
| **合計** | **22時間** | **約3営業日** |

---

## 4. API 2: 面談実施統計取得API（必須）

### 4.1 目的
VoiceDriveで予定された面談が**医療システム側で実際に完了したか**を監視し、面談実施率や未完了件数を可視化する。

### 4.2 必要な理由

**業務シナリオ**:
1. VoiceDriveで10月26日に50件の面談が予定される
2. 医療システムで実際に完了したのは45件
3. 5件は職員都合でキャンセル、または実施記録の入力漏れ

**VoiceDriveだけでは検出できない理由**:
- VoiceDriveは「面談を予定した」記録を持つ
- 医療システムは「面談が完了した」記録を持つ
- 両者を照合しないと実施率が分からない

**このAPIで可能になる監視**:
```typescript
// SystemMonitorPageでの表示例
本日予定: 50件
実施完了: 45件（90%）
未完了: 5件 ⚠️
→ 詳細確認が必要
```

### 4.3 エンドポイント仕様

```
GET /api/voicedrive/interview-completion-stats
```

**クエリパラメータ**:
```typescript
{
  startDate?: string;    // ISO 8601形式（デフォルト: 今日00:00）
  endDate?: string;      // ISO 8601形式（デフォルト: 今日23:59）
  staffId?: string;      // 特定職員のみ
  interviewType?: string; // 定期面談、緊急面談、etc
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-10-26T00:00:00Z",
      "endDate": "2025-10-26T23:59:59Z"
    },
    "summary": {
      "totalScheduled": 50,
      "totalCompleted": 45,
      "totalCancelled": 3,
      "totalNoShow": 2,
      "completionRate": 90.0,
      "avgDuration": 18.5
    },
    "byInterviewType": {
      "定期面談": {
        "scheduled": 30,
        "completed": 28,
        "cancelled": 1,
        "noShow": 1,
        "completionRate": 93.33,
        "avgDuration": 20.3
      },
      "緊急面談": {
        "scheduled": 15,
        "completed": 13,
        "cancelled": 2,
        "noShow": 0,
        "completionRate": 86.67,
        "avgDuration": 15.2
      },
      "フォローアップ": {
        "scheduled": 5,
        "completed": 4,
        "cancelled": 0,
        "noShow": 1,
        "completionRate": 80.0,
        "avgDuration": 12.5
      }
    },
    "recentCompletions": [
      {
        "interviewId": "INT12345",
        "staffId": "EMP001234",
        "staffName": "山田太郎",
        "interviewType": "定期面談",
        "scheduledAt": "2025-10-26T10:00:00Z",
        "completedAt": "2025-10-26T10:18:30Z",
        "duration": 18,
        "status": "completed",
        "notes": "良好なコミュニケーション"
      },
      {
        "interviewId": "INT12346",
        "staffId": "EMP005678",
        "staffName": "佐藤花子",
        "interviewType": "緊急面談",
        "scheduledAt": "2025-10-26T11:00:00Z",
        "completedAt": "2025-10-26T11:15:45Z",
        "duration": 16,
        "status": "completed",
        "notes": "懸念事項を共有"
      }
    ],
    "pendingInterviews": [
      {
        "interviewId": "INT12350",
        "staffId": "EMP009999",
        "staffName": "鈴木一郎",
        "interviewType": "定期面談",
        "scheduledAt": "2025-10-26T14:00:00Z",
        "status": "scheduled",
        "isPastDue": false
      }
    ],
    "missedInterviews": [
      {
        "interviewId": "INT12347",
        "staffId": "EMP002468",
        "staffName": "田中次郎",
        "interviewType": "フォローアップ",
        "scheduledAt": "2025-10-26T09:00:00Z",
        "status": "no_show",
        "reason": null
      },
      {
        "interviewId": "INT12348",
        "staffId": "EMP003579",
        "staffName": "高橋三郎",
        "interviewType": "緊急面談",
        "scheduledAt": "2025-10-26T13:00:00Z",
        "status": "cancelled",
        "reason": "職員体調不良"
      }
    ]
  },
  "timestamp": "2025-10-26T12:00:00Z"
}
```

### 4.4 必要なデータベーステーブル

医療システムは既に面談記録テーブルを持っていると推測しますが、以下のフィールドが必要です：

```sql
-- 既存の面談記録テーブルに必要なカラム（追加が必要な場合）
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interview_id VARCHAR(50) UNIQUE;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS staff_id VARCHAR(50) NOT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interview_type VARCHAR(100);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS status VARCHAR(50);
  -- 'scheduled', 'completed', 'cancelled', 'no_show'
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS notes TEXT;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_staff_id ON interviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interview_type ON interviews(interview_type);
```

### 4.5 実装工数見積もり

| 作業項目 | 工数 | 担当 |
|---------|------|------|
| データベーススキーマ確認・修正 | 2時間 | DB担当 |
| API実装（統計取得） | 6時間 | バックエンド |
| 面談ステータス管理ロジック | 4時間 | バックエンド |
| ユニットテスト | 3時間 | QA |
| 統合テスト | 2時間 | QA |
| **合計** | **17時間** | **約2営業日** |

---

## 5. API 3: 統合セキュリティイベントAPI（オプション）

### 5.1 目的
VoiceDriveと医療システム双方のセキュリティイベント（不正アクセス試行、認証失敗、権限エラー）を**統合的に監視**する。

### 5.2 優先度：低（オプション）

**理由**:
- VoiceDriveは既に独自のセキュリティ監視を実装済み
- 医療システムも独自の監視がある前提
- 統合監視は「あれば便利」だが必須ではない

**実装するメリット**:
- 連携に起因するセキュリティイベント（署名検証失敗など）を統合的に確認できる
- VoiceDriveの管理画面で医療システム側の異常も把握できる

### 5.3 エンドポイント仕様

```
GET /api/voicedrive/security-events
```

**クエリパラメータ**:
```typescript
{
  startDate?: string;
  endDate?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  eventType?: string;  // 'auth_failure', 'permission_denied', etc
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-10-26T00:00:00Z",
      "endDate": "2025-10-26T12:00:00Z"
    },
    "summary": {
      "totalEvents": 25,
      "critical": 1,
      "high": 3,
      "medium": 8,
      "low": 13
    },
    "events": [
      {
        "timestamp": "2025-10-26T10:45:30Z",
        "severity": "critical",
        "eventType": "repeated_auth_failure",
        "source": "医療システムログイン",
        "userId": "user_12345",
        "ipAddress": "203.0.113.42",
        "description": "5回連続のログイン失敗（アカウントロック）",
        "actionTaken": "アカウント一時停止"
      },
      {
        "timestamp": "2025-10-26T09:30:15Z",
        "severity": "high",
        "eventType": "permission_denied",
        "source": "VoiceDrive API呼び出し",
        "userId": "api_client_voicedrive",
        "endpoint": "/api/employees/EMP999999",
        "description": "存在しない職員IDへのアクセス試行",
        "actionTaken": "403 Forbiddenレスポンス"
      }
    ]
  },
  "timestamp": "2025-10-26T12:00:00Z"
}
```

### 5.4 実装工数見積もり

| 作業項目 | 工数 | 担当 |
|---------|------|------|
| セキュリティイベント収集基盤確認 | 4時間 | セキュリティ |
| API実装 | 6時間 | バックエンド |
| イベントフォーマット標準化 | 4時間 | バックエンド |
| テスト | 4時間 | QA |
| **合計** | **18時間** | **約2.5営業日** |

**推奨**: Phase 3以降で実装を検討

---

## 6. 実装優先順位とタイムライン

### Phase 2.5 実装ロードマップ

```
Week 1-2: API 1（Webhook送信統計）
├─ Day 1-2: データベーステーブル設計・作成
├─ Day 3-4: Webhook送信処理の改修
├─ Day 5-6: 統計API実装
└─ Day 7-8: テスト・デバッグ

Week 3: API 2（面談実施統計）
├─ Day 1-2: データベーススキーマ確認・修正
├─ Day 3-4: 統計API実装
└─ Day 5: テスト・デバッグ

Week 4: 統合テスト・本番リリース
├─ Day 1-2: VoiceDriveとの統合テスト
├─ Day 3: パフォーマンステスト
├─ Day 4: ドキュメント整備
└─ Day 5: 本番環境デプロイ

Week 5以降（オプション）: API 3（セキュリティイベント）
```

### 推奨実装順序

1. **API 1（Webhook送信統計）** - 最優先
   - データロス検出は業務上重要
   - 実装規模が大きいため早期着手が必要

2. **API 2（面談実施統計）** - 高優先
   - 業務KPIの可視化に直結
   - 既存テーブルの拡張で実装可能

3. **API 3（セキュリティイベント）** - 低優先（Phase 3以降）
   - 既存のセキュリティ監視で当面は対応可能

---

## 7. 技術的推奨事項

### 7.1 パフォーマンス考慮事項

**インデックス戦略**:
```sql
-- 複合インデックスで効率的なクエリを実現
CREATE INDEX idx_webhook_logs_composite
  ON webhook_send_logs(sent_at, event_type, send_status);

CREATE INDEX idx_interviews_composite
  ON interviews(scheduled_at, status, interview_type);
```

**クエリ最適化**:
```sql
-- 24時間以内の統計（高速化版）
SELECT
  event_type,
  COUNT(*) as total,
  AVG(response_time) as avg_time,
  SUM(CASE WHEN send_status = 'success' THEN 1 ELSE 0 END) as success_count
FROM webhook_send_logs
WHERE sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type;
```

### 7.2 セキュリティ考慮事項

**API認証**:
```typescript
// VoiceDriveからのAPI呼び出しを認証
app.use('/api/voicedrive/*', authenticateVoiceDrive);

async function authenticateVoiceDrive(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || !isValidVoiceDriveApiKey(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
  }

  next();
}
```

**レート制限**:
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 100, // 100リクエスト/分
  message: 'Too many requests from this IP'
});

app.use('/api/voicedrive/', apiLimiter);
```

### 7.3 エラーハンドリング

**標準エラーレスポンス**:
```json
{
  "success": false,
  "error": "INVALID_DATE_RANGE",
  "message": "終了日は開始日より後である必要があります",
  "details": {
    "startDate": "2025-10-26T00:00:00Z",
    "endDate": "2025-10-25T00:00:00Z"
  },
  "timestamp": "2025-10-26T12:00:00Z"
}
```

---

## 8. テスト要件

### 8.1 単体テスト

**API 1のテストケース**:
```typescript
describe('GET /api/voicedrive/webhook-stats', () => {
  it('24時間以内の統計を返す', async () => {
    const response = await request(app).get('/api/voicedrive/webhook-stats');
    expect(response.status).toBe(200);
    expect(response.body.data.summary).toHaveProperty('totalSent');
  });

  it('イベントタイプでフィルタできる', async () => {
    const response = await request(app)
      .get('/api/voicedrive/webhook-stats?eventType=employee.created');
    expect(response.body.data.byEventType).toHaveProperty('employee.created');
  });

  it('不正な日付範囲でエラーを返す', async () => {
    const response = await request(app)
      .get('/api/voicedrive/webhook-stats?startDate=2025-10-26&endDate=2025-10-25');
    expect(response.status).toBe(400);
  });
});
```

### 8.2 統合テスト

**VoiceDriveとの連携テスト**:
1. 医療システムがWebhookを送信
2. VoiceDriveが受信してWebhookLogに記録
3. VoiceDriveがAPI 1を呼び出し
4. 送信数と受信数が一致することを確認

```typescript
describe('VoiceDrive統合テスト', () => {
  it('送信したWebhookがVoiceDriveで受信される', async () => {
    // 医療システム: Webhook送信
    await sendWebhook('employee.created', { staffId: 'TEST001' });

    // 少し待つ
    await sleep(1000);

    // 医療システム: 送信統計確認
    const sendStats = await getMedicalSystemWebhookStats();
    expect(sendStats.summary.totalSent).toBe(1);

    // VoiceDrive: 受信統計確認
    const receiveStats = await getVoiceDriveIntegrationMetrics();
    expect(receiveStats.webhook.received24h).toBe(1);
  });
});
```

---

## 9. ドキュメント要件

実装完了時に以下のドキュメントを提供してください：

1. **API仕様書**
   - OpenAPI (Swagger) 形式
   - リクエスト/レスポンス例
   - エラーコード一覧

2. **データベーススキーマドキュメント**
   - ER図
   - テーブル定義
   - インデックス戦略

3. **運用マニュアル**
   - APIエンドポイント一覧
   - 監視項目と閾値
   - トラブルシューティング手順

4. **セキュリティドキュメント**
   - 認証方式
   - APIキー管理
   - レート制限設定

---

## 10. 質問と確認事項

### 医療システムチームへの質問

1. **Webhook送信の現在の実装**
   - 既にログを記録していますか？
   - リトライ機能は実装されていますか？
   - タイムアウト設定は何秒ですか？

2. **面談管理の現在の実装**
   - 面談テーブルのスキーマを共有いただけますか？
   - ステータス管理（scheduled/completed/cancelled）は実装されていますか？
   - 面談時間の記録は分単位ですか？

3. **セキュリティイベント**
   - 現在のセキュリティログの形式は？
   - 統合監視の必要性は高いですか？
   - Phase 3以降の実装で問題ないですか？

4. **タイムライン**
   - 4週間での実装は可能ですか？
   - リソース（開発者数）は確保されていますか？
   - テスト環境はいつ利用可能ですか？

---

## 11. 次のアクションアイテム

### VoiceDriveチーム
- ✅ Phase 2実装完了（済）
- ⏳ Phase 2.5のAPI仕様レビュー（本文書）
- ⏳ 統合テスト計画の策定

### 医療システムチーム
- ⏳ 本文書のレビューと質問への回答
- ⏳ データベーススキーマの確認と共有
- ⏳ 実装タイムラインの確定
- ⏳ 開発環境のセットアップ
- ⏳ API 1の実装開始（Week 1）

### 共同作業
- ⏳ 週次進捗会議の設定（毎週金曜日を提案）
- ⏳ Slackチャンネル`#phase2-5-integration`の作成
- ⏳ 統合テスト環境の準備

---

## 12. まとめ

VoiceDriveのSystemMonitorPage Phase 2実装は完璧に完了しており、VoiceDrive側での20項目の監視機能が動作しています。

Phase 2.5として、以下3つのAPIを医療システム側で実装することで、**双方向の連携監視**が実現します：

1. **Webhook送信統計API**（必須、3営業日）
   - データロス検出
   - 送信/受信の差分監視

2. **面談実施統計API**（必須、2営業日）
   - 面談実施率の可視化
   - 未完了面談の追跡

3. **統合セキュリティイベントAPI**（オプション、2.5営業日）
   - セキュリティイベントの統合監視
   - Phase 3以降を推奨

**推定総工数**: 5営業日（API 1+2のみ）、7.5営業日（API 3含む）

医療システムチームのレビューとフィードバックをお待ちしております。ご質問やご不明な点がございましたら、お気軽にお問い合わせください。

---

**連絡先**:
- VoiceDrive開発チーム: voicedrive-dev@example.com
- Slack: #phase2-5-integration（作成予定）
- 技術的質問: プロジェクトリードまで

**次回MTG**: 2025年10月28日（月）10:00 - Phase 2.5 キックオフミーティング
