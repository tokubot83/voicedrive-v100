# VoiceDrive統計情報Webhook送信仕様書

**作成日：2025年10月7日**
**作成者：VoiceDrive開発チーム**
**宛先：職員カルテシステム ご担当者様**
**Version：1.0.0**

---

## 1. 概要

VoiceDriveから職員カルテシステムへ、お知らせの統計情報をWebhook経由で送信する仕様です。

### 1.1 送信タイミング

- **リアルタイム**：アクションボタンクリック時
- **バッチ**：1時間ごとの集計結果（オプション）
- **日次**：日次サマリー（オプション）

### 1.2 送信内容

- ✅ アクション実行数（ボタンクリック数）
- ✅ 完了数（アンケート送信、面談予約完了など）
- ✅ 配信数
- ❌ メッセージ本文（送信しない）
- ❌ 個別の応答内容（送信しない）

---

## 2. Webhookエンドポイント仕様

### 2.1 エンドポイント

```
POST https://api.staff-chart.example.com/api/voicedrive/stats
```

### 2.2 認証

```http
Authorization: Bearer {API_TOKEN}
Content-Type: application/json
X-VoiceDrive-Signature: {HMAC-SHA256}
```

**認証方式**：
- Bearer Token認証
- HMAC-SHA256署名検証（改ざん防止）

---

## 3. リクエストフォーマット

### 3.1 基本構造

```typescript
interface StatsWebhookPayload {
  // イベント情報
  event: 'stats.updated' | 'stats.hourly' | 'stats.daily';
  timestamp: string;  // ISO 8601形式

  // お知らせ情報
  announcement: {
    id: string;
    title: string;
    category: 'announcement' | 'interview' | 'training' | 'survey' | 'other';
    priority: 'low' | 'medium' | 'high';
    publishedAt: string;  // ISO 8601形式
  };

  // 統計情報
  stats: {
    delivered: number;      // 配信数
    actions: number;        // アクション実行数（旧: responses）
    completions: number;    // 完了数（アンケート送信、予約完了など）

    // 詳細情報（オプション）
    details?: {
      viewCount?: number;           // 閲覧数
      uniqueViewers?: number;       // ユニーク閲覧者数
      averageReadTime?: number;     // 平均閲覧時間（秒）
      actionsByDepartment?: {       // 部門別統計
        [department: string]: number;
      };
    };
  };

  // メタデータ
  metadata: {
    source: 'voicedrive';
    version: '1.0.0';
    environment: 'production' | 'staging' | 'development';
  };
}
```

### 3.2 具体例

#### 例1：アクションボタンクリック時（リアルタイム）

```json
{
  "event": "stats.updated",
  "timestamp": "2025-10-07T10:30:45.123Z",
  "announcement": {
    "id": "ann_20251007_001",
    "title": "【アンケート】職場環境改善に関する意識調査のお願い",
    "category": "survey",
    "priority": "medium",
    "publishedAt": "2025-10-07T09:00:00.000Z"
  },
  "stats": {
    "delivered": 450,
    "actions": 235,
    "completions": 189,
    "details": {
      "viewCount": 380,
      "uniqueViewers": 320,
      "averageReadTime": 45,
      "actionsByDepartment": {
        "看護部": 120,
        "医局": 50,
        "事務部": 40,
        "リハビリ科": 25
      }
    }
  },
  "metadata": {
    "source": "voicedrive",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

#### 例2：時間別集計（バッチ）

```json
{
  "event": "stats.hourly",
  "timestamp": "2025-10-07T11:00:00.000Z",
  "announcement": {
    "id": "ann_20251007_001",
    "title": "【医療チーム連携】ストレスチェック結果に基づく面談のご案内",
    "category": "announcement",
    "priority": "high",
    "publishedAt": "2025-10-07T08:00:00.000Z"
  },
  "stats": {
    "delivered": 45,
    "actions": 15,
    "completions": 12,
    "details": {
      "viewCount": 38,
      "uniqueViewers": 35,
      "averageReadTime": 120
    }
  },
  "metadata": {
    "source": "voicedrive",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

#### 例3：日次サマリー

```json
{
  "event": "stats.daily",
  "timestamp": "2025-10-08T00:00:00.000Z",
  "announcement": {
    "id": "ann_20251007_001",
    "title": "【アンケート】職場環境改善に関する意識調査のお願い",
    "category": "survey",
    "priority": "medium",
    "publishedAt": "2025-10-07T09:00:00.000Z"
  },
  "stats": {
    "delivered": 450,
    "actions": 287,
    "completions": 245,
    "details": {
      "viewCount": 420,
      "uniqueViewers": 395,
      "averageReadTime": 52,
      "actionsByDepartment": {
        "看護部": 150,
        "医局": 65,
        "事務部": 42,
        "リハビリ科": 30
      }
    }
  },
  "metadata": {
    "source": "voicedrive",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

---

## 4. レスポンスフォーマット

### 4.1 成功レスポンス（200 OK）

```json
{
  "success": true,
  "receivedAt": "2025-10-07T10:30:45.500Z",
  "processed": true,
  "message": "統計情報を正常に受信しました"
}
```

### 4.2 エラーレスポンス

#### 認証エラー（401 Unauthorized）

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証トークンが無効です"
  }
}
```

#### バリデーションエラー（400 Bad Request）

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "リクエストボディが不正です",
    "details": [
      {
        "field": "stats.delivered",
        "message": "必須フィールドです"
      }
    ]
  }
}
```

#### サーバーエラー（500 Internal Server Error）

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "サーバー内部エラーが発生しました"
  }
}
```

---

## 5. HMAC署名検証

### 5.1 署名生成（VoiceDrive側）

```typescript
import crypto from 'crypto';

function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// 使用例
const payloadString = JSON.stringify(payload);
const signature = generateSignature(payloadString, SHARED_SECRET);

// HTTPヘッダーに追加
headers['X-VoiceDrive-Signature'] = signature;
```

### 5.2 署名検証（職員カルテシステム側）

```typescript
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// 使用例
const body = await request.text();
const signature = request.headers.get('X-VoiceDrive-Signature');
const isValid = verifySignature(body, signature, SHARED_SECRET);

if (!isValid) {
  return Response.json(
    { success: false, error: { code: 'INVALID_SIGNATURE' } },
    { status: 401 }
  );
}
```

---

## 6. エラーハンドリング

### 6.1 リトライポリシー

VoiceDrive側のリトライ設定：

```typescript
const retryPolicy = {
  maxRetries: 3,
  backoff: 'exponential',  // 1秒、2秒、4秒
  retryOn: [500, 502, 503, 504],  // サーバーエラー時のみ
  timeout: 5000  // 5秒
};
```

### 6.2 フォールバック

Webhook送信が失敗した場合：
1. ローカルキューに保存
2. 次回バッチ送信時に再試行
3. 3回失敗後、管理者に通知

---

## 7. セキュリティ

### 7.1 通信暗号化

- ✅ HTTPS必須
- ✅ TLS 1.2以上
- ❌ HTTP接続は許可しない

### 7.2 IPホワイトリスト（オプション）

VoiceDriveサーバーのIPアドレスをホワイトリストに登録：

```
# VoiceDrive Production IPs
203.0.113.10
203.0.113.11
```

### 7.3 レート制限

推奨設定：
- リアルタイム：100リクエスト/分
- バッチ：10リクエスト/分
- 日次：1リクエスト/日

---

## 8. 実装例（職員カルテシステム側）

### 8.1 Next.js API Route

```typescript
// src/app/api/voicedrive/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SHARED_SECRET = process.env.VOICEDRIVE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // 1. 署名検証
    const body = await request.text();
    const signature = request.headers.get('X-VoiceDrive-Signature');

    if (!verifySignature(body, signature, SHARED_SECRET)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE' } },
        { status: 401 }
      );
    }

    // 2. JSONパース
    const payload: StatsWebhookPayload = JSON.parse(body);

    // 3. バリデーション
    if (!payload.announcement?.id || !payload.stats) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // 4. DB保存
    await saveAnnouncementStats({
      announcementId: payload.announcement.id,
      delivered: payload.stats.delivered,
      actions: payload.stats.actions,
      completions: payload.stats.completions,
      receivedAt: new Date(payload.timestamp),
      details: payload.stats.details
    });

    // 5. 成功レスポンス
    return NextResponse.json({
      success: true,
      receivedAt: new Date().toISOString(),
      processed: true,
      message: '統計情報を正常に受信しました'
    });

  } catch (error) {
    console.error('Webhook処理エラー:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function saveAnnouncementStats(stats: any) {
  // Prisma/Drizzle などでDB保存
  // await db.announcementStats.create({ data: stats });
}
```

### 8.2 データベーススキーマ例

```sql
-- 統計情報テーブル
CREATE TABLE announcement_stats (
  id SERIAL PRIMARY KEY,
  announcement_id VARCHAR(255) NOT NULL,
  delivered INTEGER NOT NULL DEFAULT 0,
  actions INTEGER NOT NULL DEFAULT 0,
  completions INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER,
  unique_viewers INTEGER,
  average_read_time INTEGER,
  received_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_announcement_id (announcement_id),
  INDEX idx_received_at (received_at)
);

-- 部門別統計テーブル
CREATE TABLE announcement_stats_by_department (
  id SERIAL PRIMARY KEY,
  announcement_id VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  action_count INTEGER NOT NULL DEFAULT 0,
  received_at TIMESTAMP NOT NULL,

  INDEX idx_announcement_dept (announcement_id, department)
);
```

---

## 9. テスト手順

### 9.1 ローカルテスト

```bash
# 1. ngrokでローカルエンドポイントを公開
ngrok http 3000

# 2. VoiceDrive側で設定
MEDICAL_TEAM_WEBHOOK_URL=https://xxxx.ngrok.io/api/voicedrive/stats
MEDICAL_TEAM_WEBHOOK_SECRET=test_secret_key

# 3. テストリクエスト送信
curl -X POST https://xxxx.ngrok.io/api/voicedrive/stats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -H "X-VoiceDrive-Signature: $(echo -n '{"test":"data"}' | openssl dgst -sha256 -hmac 'test_secret_key' | cut -d' ' -f2)" \
  -d '{
    "event": "stats.updated",
    "timestamp": "2025-10-07T10:30:45.123Z",
    "announcement": {
      "id": "test_001",
      "title": "テスト通知",
      "category": "announcement",
      "priority": "medium",
      "publishedAt": "2025-10-07T09:00:00.000Z"
    },
    "stats": {
      "delivered": 10,
      "actions": 5,
      "completions": 3
    },
    "metadata": {
      "source": "voicedrive",
      "version": "1.0.0",
      "environment": "development"
    }
  }'
```

### 9.2 統合テスト項目

- [ ] 認証トークンの検証
- [ ] HMAC署名の検証
- [ ] リクエストボディのバリデーション
- [ ] DB保存の確認
- [ ] エラーハンドリング
- [ ] レスポンス形式の確認

---

## 10. モニタリング

### 10.1 推奨メトリクス

- Webhook成功率
- 平均レスポンス時間
- エラー率（4xx, 5xx）
- リトライ回数

### 10.2 アラート設定

```yaml
alerts:
  - name: webhook_failure_rate_high
    condition: error_rate > 5%
    duration: 5m
    action: notify_slack

  - name: webhook_response_time_slow
    condition: avg_response_time > 3s
    duration: 10m
    action: notify_email
```

---

## 11. バージョニング

### 11.1 APIバージョン管理

```
POST /api/v1/voicedrive/stats  ← 現在のバージョン
POST /api/v2/voicedrive/stats  ← 将来の拡張
```

### 11.2 互換性ポリシー

- メジャーバージョン更新：破壊的変更あり
- マイナーバージョン更新：後方互換性維持
- パッチバージョン更新：バグ修正のみ

---

## 12. FAQ

**Q1: リアルタイム送信の頻度は？**
A1: アクションボタンクリック時に即座に送信されます。負荷が高い場合は、バッチ送信（1時間ごと）に切り替え可能です。

**Q2: 過去データの再送信は可能ですか？**
A2: 可能です。管理画面から特定期間の統計データを再送信できます。

**Q3: 送信失敗時の通知は？**
A3: 3回リトライ後も失敗した場合、VoiceDrive管理者にSlack通知が送られます。

**Q4: 個人情報は含まれますか？**
A4: いいえ。統計情報のみで、個人を特定できる情報は送信されません。

---

## 13. 変更履歴

| バージョン | 日付 | 変更内容 |
|---------|------|---------|
| 1.0.0 | 2025-10-07 | 初版リリース |

---

## 14. 連絡先

**VoiceDrive開発チーム**
- Slack: #phase2-integration
- MCPサーバー: `mcp-shared/docs/`
- メール: voicedrive-dev@example.com

---

**ご質問やご不明点がございましたら、お気軽にお問い合わせください。**

VoiceDrive開発チーム
2025年10月7日
