# 異常検知アラート機能設計書

**日付**: 2025年10月9日
**バージョン**: 1.0.0（設計段階）
**実装予定日**: 2025年11月18日-11月22日
**担当**: VoiceDrive開発チーム

---

## 📋 概要

VoiceDrive Analytics APIの異常検知アラート機能の設計書です。
APIの異常なアクセスパターンや障害を自動検知し、管理者に通知します。

---

## 🎯 目的

1. **異常なアクセスパターンの検知**
   - レート制限超過の頻発
   - 認証エラーの増加
   - 異常なリクエストパターン

2. **サービス品質の監視**
   - レスポンスタイムの劣化
   - エラー率の上昇
   - サーバーリソースの逼迫

3. **セキュリティインシデントの検知**
   - 不正アクセスの試行
   - データ漏洩の兆候
   - DDoS攻撃の検知

---

## 🔍 検知対象

### 1. レート制限関連

| 検知項目 | 閾値 | アクション |
|---------|------|----------|
| **警告レベル** | 200リクエスト/時間 | Slack通知 |
| **危険レベル** | 400リクエスト/時間 | 自動ブロック + メール通知 |
| **頻繁な429エラー** | 10回/時間 | Slack通知 |

**検知ロジック**:
```typescript
if (requestCount >= 200 && requestCount < 400) {
  sendSlackNotification('警告: レート制限に近づいています');
}

if (requestCount >= 400) {
  blockIP();
  sendEmailNotification('危険: 自動ブロックを実施しました');
}
```

### 2. 認証エラー関連

| 検知項目 | 閾値 | アクション |
|---------|------|----------|
| **認証エラー増加** | 20回/時間 | Slack通知 |
| **無効トークン試行** | 10回/10分 | 一時ブロック + 調査 |
| **同一IPからの連続失敗** | 5回/5分 | IPブロック |

### 3. パフォーマンス関連

| 検知項目 | 閾値 | アクション |
|---------|------|----------|
| **平均レスポンスタイム** | > 500ms | Slack通知 |
| **P99レスポンスタイム** | > 2000ms | メール通知 |
| **エラー率** | > 5% | 緊急対応 |

### 4. データ異常関連

| 検知項目 | 閾値 | アクション |
|---------|------|----------|
| **大量データリクエスト** | > 1万件/リクエスト | Slack通知 |
| **同一データの繰り返しリクエスト** | 10回/時間 | 調査 |
| **異常なデータパターン** | 統計的外れ値 | ログ記録 |

---

## 🏗️ アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────────────────────┐
│                  VoiceDrive API Server                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  API Routes  │→ │  Analytics   │→ │   Response   │  │
│  │              │  │  Middleware  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           ↓                ↓                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Anomaly Detection Service               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │ Rate Limit │  │   Auth     │  │ Performance│ │  │
│  │  │  Monitor   │  │  Monitor   │  │  Monitor   │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│           ↓                ↓                ↓            │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Alert Notification Service             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │   Slack    │  │   Email    │  │    Log     │ │  │
│  │  │  Notifier  │  │  Notifier  │  │  Recorder  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### コンポーネント

#### 1. Anomaly Detection Service

**責務**:
- 各種メトリクスの収集
- 閾値の監視
- 異常パターンの検知

**実装ファイル**: `src/services/AnomalyDetectionService.ts`

```typescript
export class AnomalyDetectionService {
  private rateLimitMonitor: RateLimitMonitor;
  private authMonitor: AuthMonitor;
  private performanceMonitor: PerformanceMonitor;

  async detectAnomalies(): Promise<Anomaly[]> {
    // 各モニターから異常を検知
  }

  async handleAnomaly(anomaly: Anomaly): Promise<void> {
    // 異常に応じた対応を実施
  }
}
```

#### 2. Alert Notification Service

**責務**:
- Slack通知
- メール通知
- ログ記録

**実装ファイル**: `src/services/AlertNotificationService.ts`

```typescript
export class AlertNotificationService {
  async sendSlackAlert(alert: Alert): Promise<void> {
    // Slack Webhook経由で通知
  }

  async sendEmailAlert(alert: Alert): Promise<void> {
    // メール送信
  }

  async recordLog(alert: Alert): Promise<void> {
    // ログファイルまたはDBに記録
  }
}
```

---

## 📊 監視メトリクス

### 収集メトリクス一覧

| メトリクス | 収集間隔 | 保持期間 | 説明 |
|----------|---------|---------|------|
| **requestCount** | 1分 | 30日 | リクエスト数 |
| **errorCount** | 1分 | 30日 | エラー数 |
| **authFailureCount** | 1分 | 30日 | 認証失敗数 |
| **avgResponseTime** | 1分 | 30日 | 平均レスポンスタイム |
| **p99ResponseTime** | 5分 | 30日 | P99レスポンスタイム |
| **activeIPs** | 5分 | 7日 | アクティブIP数 |
| **uniqueUsers** | 1時間 | 30日 | ユニークユーザー数 |

### データストレージ

```typescript
interface MetricData {
  timestamp: Date;
  metricName: string;
  value: number;
  tags: {
    endpoint?: string;
    statusCode?: number;
    ip?: string;
    userId?: string;
  };
}
```

**保存先**:
- 短期（7日）: Redis
- 中期（30日）: PostgreSQL
- 長期（1年）: S3 + Athena

---

## 🔔 通知設定

### Slack通知

**Webhook URL**: `https://hooks.slack.com/services/...`
**チャンネル**: `#voicedrive-analytics-alerts`

**通知フォーマット**:
```json
{
  "text": "⚠️ Analytics API異常検知",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*異常タイプ*: レート制限警告\n*詳細*: 200リクエスト/時間に到達"
      }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*IP*: 203.0.113.10" },
        { "type": "mrkdwn", "text": "*時刻*: 2025-10-09 14:35:00" }
      ]
    }
  ]
}
```

### メール通知

**送信先**: `voicedrive-admin@example.com`
**送信条件**:
- 危険レベルの異常
- 自動ブロック実施時
- サービスダウン検知時

**メールテンプレート**:
```
件名: [VoiceDrive Analytics API] 異常検知アラート

VoiceDrive Analytics APIで異常を検知しました。

異常タイプ: レート制限超過（自動ブロック実施）
検知時刻: 2025-10-09 14:35:00 JST
対象IP: 203.0.113.10
リクエスト数: 450リクエスト/時間

対応状況: 自動ブロックを実施しました。
ダッシュボード: http://localhost:8080/dashboard

VoiceDrive開発チーム
```

---

## 🛠️ 実装計画

### Phase 1: 基本監視機能（11月18日-11月20日）

- [  ] `AnomalyDetectionService`クラス実装
- [  ] レート制限監視機能
- [  ] 認証エラー監視機能
- [  ] Slack通知機能

### Phase 2: 高度な監視機能（11月20日-11月22日）

- [  ] パフォーマンス監視機能
- [  ] データ異常検知機能
- [  ] メール通知機能
- [  ] ログ記録機能

### Phase 3: ダッシュボード連携（11月22日）

- [  ] メトリクスデータの可視化
- [  ] リアルタイムアラート表示
- [  ] 履歴データの確認

---

## 📝 設定ファイル

### 環境変数（.env）

```env
# Slack通知設定
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_CHANNEL=#voicedrive-analytics-alerts

# メール通知設定
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_FROM=voicedrive-alerts@example.com
EMAIL_TO=voicedrive-admin@example.com

# 異常検知設定
ANOMALY_RATE_LIMIT_WARNING=200
ANOMALY_RATE_LIMIT_DANGER=400
ANOMALY_AUTH_FAILURE_THRESHOLD=20
ANOMALY_RESPONSE_TIME_THRESHOLD=500
```

### 設定ファイル（anomaly-config.json）

```json
{
  "rateLimitMonitor": {
    "enabled": true,
    "warningThreshold": 200,
    "dangerThreshold": 400,
    "checkInterval": 60000
  },
  "authMonitor": {
    "enabled": true,
    "failureThreshold": 20,
    "consecutiveFailureThreshold": 5,
    "checkInterval": 60000
  },
  "performanceMonitor": {
    "enabled": true,
    "avgResponseTimeThreshold": 500,
    "p99ResponseTimeThreshold": 2000,
    "errorRateThreshold": 0.05,
    "checkInterval": 60000
  },
  "notifications": {
    "slack": {
      "enabled": true,
      "levels": ["warning", "danger", "critical"]
    },
    "email": {
      "enabled": true,
      "levels": ["danger", "critical"]
    },
    "log": {
      "enabled": true,
      "levels": ["warning", "danger", "critical", "info"]
    }
  }
}
```

---

## 🧪 テスト計画

### 単体テスト

```typescript
describe('AnomalyDetectionService', () => {
  it('レート制限警告を検知する', async () => {
    // テストコード
  });

  it('認証エラー増加を検知する', async () => {
    // テストコード
  });

  it('パフォーマンス劣化を検知する', async () => {
    // テストコード
  });
});
```

### 統合テスト

```typescript
describe('Anomaly Detection Integration', () => {
  it('異常検知→Slack通知の統合テスト', async () => {
    // 異常を発生させる
    // Slack通知を確認
  });

  it('自動ブロック機能の統合テスト', async () => {
    // 危険レベルの異常を発生させる
    // IPブロックを確認
    // メール通知を確認
  });
});
```

---

## 📊 期待効果

### 定量的効果

| 指標 | 現状 | 目標 |
|------|------|------|
| **インシデント検知時間** | 手動（数時間） | 自動（数分） |
| **対応開始時間** | 30分-1時間 | 5分以内 |
| **誤検知率** | - | < 5% |

### 定性的効果

1. **信頼性向上**: 異常を早期に検知し、迅速に対応
2. **運用負荷削減**: 手動監視が不要に
3. **セキュリティ強化**: 不正アクセスを自動検知・ブロック

---

## 📚 参考資料

- [Anomaly Detection Best Practices](https://example.com)
- [Slack Webhook API](https://api.slack.com/messaging/webhooks)
- [AWS CloudWatch Alarms](https://aws.amazon.com/cloudwatch/)

---

**VoiceDrive開発チーム**
2025年10月9日

---

## 🔄 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2025-10-09 | 初版作成（設計段階） | VoiceDrive開発チーム |
| 2025-11-18 | 実装開始予定 | - |
