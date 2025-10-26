# SystemMonitorPage Phase 2.5 - VoiceDrive回答書

**文書番号**: VD-RESPONSE-2025-1026-003
**作成日**: 2025年10月26日
**作成者**: VoiceDriveチーム
**宛先**: 医療職員管理システムチーム
**件名**: 医療システム回答書（MED-RESPONSE-2025-1026-002）への回答

---

## 📋 エグゼクティブサマリー

医療システムチームからの回答書（MED-RESPONSE-2025-1026-002）を受領しました。
詳細な質問への回答と4週間スケジュールの承認、誠にありがとうございます。

### 確認結果
- ✅ **全ての質問に回答いただき感謝**: Webhook送信状況、面談テーブルスキーマ、セキュリティイベント、タイムライン
- ✅ **スケジュール承認確認**: 4週間スケジュール（10/28〜11/22）で双方合意
- ✅ **リソース確保確認**: 開発者1名フルタイム、Week 1からテスト環境利用可能
- ✅ **API 3の延期に同意**: Phase 3以降での実装が妥当と判断

### 医療システムチームからの確認事項への回答

以下、3つの確認事項に回答いたします。

---

## ✅ 確認事項への回答

### 確認1: APIベースURL

**質問**:
- 本番環境: `https://medical-system.example.com`
- ステージング環境: `https://staging-medical.example.com`
- 上記で問題ないですか？

**回答**: ✅ **問題ありません**

**VoiceDrive側の環境変数設定**:

```bash
# .env.development（開発・テスト環境）
MEDICAL_SYSTEM_API_URL=https://staging-medical.example.com
MEDICAL_SYSTEM_API_KEY=<ステージング環境用APIキー>
WEBHOOK_SECRET=<既存のWebhook認証シークレット>

# .env.production（本番環境）
MEDICAL_SYSTEM_API_URL=https://medical-system.example.com
MEDICAL_SYSTEM_API_KEY=<本番環境用APIキー>
WEBHOOK_SECRET=<既存のWebhook認証シークレット>
```

**確認事項**:
- キックオフMTG（10/28）で、ステージング環境用のAPIキーを共有いただけますか？
- 本番環境用のAPIキーは、Week 4（本番デプロイ前）に共有いただければ大丈夫です

---

### 確認2: APIキーの発行方法

**質問**:
- キックオフMTGで共有予定のAPIキーで問題ないですか？
- 本番環境用とテスト環境用で別々のキーが必要ですか？

**回答**: ✅ **別々のキーが必要です**

**理由**:
1. **セキュリティ**: 本番環境とテスト環境でキーを分離することで、万が一テスト環境のキーが漏洩しても本番環境への影響を防げる
2. **監視**: 環境ごとに別キーを使用することで、どの環境からのアクセスかを識別できる
3. **ベストプラクティス**: 一般的なAPI設計では環境ごとにキーを分離する

**提案**:

| 環境 | APIキー名 | 用途 | 共有タイミング |
|------|-----------|------|--------------|
| ステージング | `vd-staging-api-key-xxx` | 開発・テスト | 10/28キックオフMTG |
| 本番 | `vd-production-api-key-xxx` | 本番運用 | 11/20デプロイ前 |

**APIキーのフォーマット**:
```
vd-{環境}-api-key-{ランダム文字列32文字}

例:
vd-staging-api-key-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
vd-production-api-key-x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

**VoiceDrive側の実装**:
```typescript
// src/services/MedicalSystemClient.ts
const API_KEY = process.env.MEDICAL_SYSTEM_API_KEY;

if (!API_KEY) {
  throw new Error('MEDICAL_SYSTEM_API_KEY is not defined in environment variables');
}

export class MedicalSystemClient {
  private static axiosInstance = axios.create({
    baseURL: process.env.MEDICAL_SYSTEM_API_URL,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-VoiceDrive-System-ID': 'voicedrive-v100',
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });
}
```

---

### 確認3: 統合テストの詳細

**質問**:
- Week 4の統合テストはどのような形式を想定していますか？
- テストシナリオは事前に共有いただけますか？

**回答**: ✅ **詳細を以下に記載します**

---

#### テスト形式

**Phase 1（Week 4 Day 1-2）: API接続テスト**
- VoiceDriveのステージング環境から医療システムのステージング環境APIを呼び出し
- レスポンスの形式、ステータスコード、エラーハンドリングを確認
- **場所**: 各チームがリモートで実施、Slack/Zoomで連携

**Phase 2（Week 4 Day 2-3）: データ整合性テスト**
- 医療システムがWebhookを送信 → VoiceDriveが受信 → 差分が正しく計算される
- 医療システムで面談を完了 → VoiceDriveが統計を取得 → 実施率が正しく表示される
- **場所**: 各チームがリモートで実施、Slack/Zoomで連携

**Phase 3（Week 4 Day 3）: エラーシナリオテスト**
- 医療システムAPIがタイムアウト、500エラー、認証エラーを返す場合の動作確認
- VoiceDrive側で適切にエラーハンドリングされているか確認
- **場所**: 各チームがリモートで実施、Slack/Zoomで連携

**Phase 4（Week 4 Day 4）: パフォーマンステスト**
- 大量データでの動作確認（Webhook 1000件、面談 500件）
- レスポンスタイムが300ms以内か確認
- **場所**: VoiceDriveチームが実施、結果を医療システムチームに共有

---

#### テストシナリオ

**シナリオ1: Webhook差分検出（正常系）**
```
前提条件:
- 医療システムが過去24時間で100件のWebhookを送信
- VoiceDriveは100件全てを受信

テスト手順:
1. 医療システム: API 1を実装
   → レスポンス: { sent24h: 100, succeeded: 100, failed: 0 }

2. VoiceDrive: MonitoringService.getIntegrationMetrics()を呼び出し
   → レスポンス: { webhook: { received24h: 100 } }

3. VoiceDrive: 拡張メトリクス取得
   → 医療システムAPI 1を呼び出し
   → 差分計算: 100（送信） - 100（受信） = 0

4. VoiceDrive: SystemMonitorPageに表示
   → 「医療システム連携」タブで差分0、健全性「healthy」を表示

期待結果:
✅ 差分: 0件
✅ 健全性: healthy（緑色）
✅ アラート: なし
```

---

**シナリオ2: Webhook差分検出（異常系）**
```
前提条件:
- 医療システムが過去24時間で100件のWebhookを送信
- VoiceDriveは95件のみ受信（5件が通信障害で消失）

テスト手順:
1. 医療システム: API 1を実装
   → レスポンス: { sent24h: 100, succeeded: 95, failed: 5 }

2. VoiceDrive: MonitoringService.getIntegrationMetrics()を呼び出し
   → レスポンス: { webhook: { received24h: 95 } }

3. VoiceDrive: 拡張メトリクス取得
   → 医療システムAPI 1を呼び出し
   → 差分計算: 100（送信） - 95（受信） = 5

4. VoiceDrive: SystemMonitorPageに表示
   → 「医療システム連携」タブで差分5、健全性「warning」を表示

期待結果:
✅ 差分: 5件
✅ 健全性: warning（黄色）
✅ アラート: 「注意: データ欠損検出 - 医療システム送信: 100件 / VoiceDrive受信: 95件 / 差分: 5件」
```

---

**シナリオ3: 面談実施率監視（正常系）**
```
前提条件:
- 本日50件の面談が予定されている
- 医療システムで45件が実施完了

テスト手順:
1. 医療システム: API 2を実装
   → レスポンス: { totalScheduled: 50, actuallyCompleted: 45, completionRate: 90.0 }

2. VoiceDrive: 拡張メトリクス取得
   → 医療システムAPI 2を呼び出し
   → 面談統計を取得

3. VoiceDrive: SystemMonitorPageに表示
   → 「医療システム連携」タブで面談統計を表示

期待結果:
✅ 予定数: 50件
✅ 実施完了: 45件
✅ 実施率: 90.0%（緑色、90%以上）
```

---

**シナリオ4: エラーハンドリング（医療システムAPIタイムアウト）**
```
前提条件:
- 医療システムAPIが10秒以上応答しない（VoiceDriveのタイムアウトは10秒）

テスト手順:
1. 医療システム: API 1のレスポンスを意図的に遅延させる（15秒）

2. VoiceDrive: 拡張メトリクス取得を試行
   → 10秒後にタイムアウト

3. VoiceDrive: エラーハンドリング
   → コンソールにエラーログ出力
   → VoiceDrive側のメトリクスのみ表示（医療システム側はnull）

4. VoiceDrive: SystemMonitorPageに表示
   → 「医療システム連携」タブで医療システムデータが取得できなかったことを表示

期待結果:
✅ タイムアウトエラーが適切にキャッチされる
✅ VoiceDrive側のメトリクスは正常に表示される
✅ ユーザーに「医療システムデータの取得に失敗しました」と表示
✅ システム全体がクラッシュしない
```

---

**シナリオ5: エラーハンドリング（医療システムAPI 500エラー）**
```
前提条件:
- 医療システムAPIが500 Internal Server Errorを返す

テスト手順:
1. 医療システム: API 1で意図的に500エラーを返す

2. VoiceDrive: 拡張メトリクス取得を試行
   → 500エラーを受信

3. VoiceDrive: エラーハンドリング
   → エラーログ出力
   → VoiceDrive側のメトリクスのみ表示

期待結果:
✅ 500エラーが適切にキャッチされる
✅ エラーログに詳細が記録される
✅ システム全体がクラッシュしない
```

---

**シナリオ6: パフォーマンステスト（大量データ）**
```
前提条件:
- 医療システムが過去24時間で1000件のWebhookを送信
- VoiceDriveは1000件受信
- 本日500件の面談が予定

テスト手順:
1. 医療システム: 大量データを準備

2. VoiceDrive: 拡張メトリクス取得
   → 医療システムAPI 1、API 2を呼び出し
   → レスポンスタイムを測定

3. VoiceDrive: SystemMonitorPageに表示
   → レンダリング時間を測定

期待結果:
✅ API 1レスポンスタイム: ≤ 300ms
✅ API 2レスポンスタイム: ≤ 300ms
✅ SystemMonitorPageレンダリング時間: ≤ 500ms
✅ 大量データでも正常に動作
```

---

#### テストシナリオ共有スケジュール

**Week 3 Day 10（11/12 火）**: テストシナリオの最終版を共有
- 上記6シナリオの詳細版を作成
- Postmanコレクション作成（APIテスト用）
- テストデータサンプル作成
- 医療システムチームにレビュー依頼

**Week 3 Day 11（11/13 水）**: レビューフィードバック反映
- 医療システムチームからのフィードバックを反映
- テストシナリオ確定

**Week 4 Day 1（11/18 月）**: 統合テスト開始
- 確定したシナリオに基づいてテスト実施

---

### 確認4: データ保持期間

**質問**:
- `webhook_send_logs`のデータ保持期間はどれくらいが適切ですか？
- 提案: 3ヶ月（90日間）

**回答**: ✅ **3ヶ月（90日間）で問題ありません**

**VoiceDrive側の設定**:
- `WebhookLog`テーブル（VoiceDrive側のWebhook受信ログ）も同様に3ヶ月保持
- 両システムで保持期間を統一することで、差分検出の整合性を確保

**自動削除スクリプト**:
VoiceDrive側でも以下のスクリプトを実装します：

```typescript
// src/scripts/cleanupWebhookLogs.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupWebhookLogs() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const result = await prisma.webhookLog.deleteMany({
    where: {
      receivedAt: {
        lt: threeMonthsAgo
      }
    }
  });

  console.log(`削除されたWebhookログ: ${result.count}件`);
}

cleanupWebhookLogs()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Webhookログのクリーンアップエラー:', error);
    prisma.$disconnect();
  });
```

**Cron設定**（毎週日曜日深夜2時に実行）:
```bash
# crontab -e
0 2 * * 0 cd /path/to/voicedrive && node dist/scripts/cleanupWebhookLogs.js
```

---

## 📝 医療システムチームからの要望への回答

### 要望1: ドキュメント共有

**要望**:
- VoiceDrive側の実装計画（型定義、MedicalSystemClient等）を事前に共有いただけますか？
- API仕様書（OpenAPI形式）を作成したいため

**回答**: ✅ **共有いたします**

**共有スケジュール**:

| ドキュメント | 共有日 | 内容 |
|-------------|--------|------|
| 型定義（TypeScript） | 10/28（月） | MedicalSystemWebhookStats、MedicalSystemInterviewStats、EnhancedIntegrationMetrics |
| MedicalSystemClient実装計画 | 10/29（火） | APIクライアントの設計、エラーハンドリング、リトライロジック |
| OpenAPI仕様書（Draft） | 11/1（金） | API 1、API 2の期待レスポンス形式（VoiceDrive視点） |
| 統合テストシナリオ | 11/12（火） | 上記「確認3」で記載した6シナリオの詳細版 |

**共有方法**:
- MCPサーバー: `mcp-shared/docs/phase2.5/`フォルダに配置
- Slack通知: `#phase2-5-integration`チャンネルで通知

**型定義の事前共有**（現時点版）:

```typescript
// src/types/medicalSystem.types.ts

/**
 * 医療システム側のWebhook送信統計
 */
export interface MedicalSystemWebhookStats {
  /** 過去24時間の送信件数 */
  sent24h: number;
  /** 成功件数 */
  succeeded: number;
  /** 失敗件数 */
  failed: number;
  /** リトライ中の件数 */
  retried: number;
  /** 最終送信日時（ISO 8601） */
  lastSentAt: string;

  /** イベントタイプ別統計 */
  byEventType: {
    [eventType: string]: {
      sent: number;
      succeeded: number;
      failed: number;
      avgResponseTime: number;  // ミリ秒
    };
  };

  /** リトライキューの状態 */
  queueStatus: {
    pending: number;    // 送信待ち
    processing: number; // 処理中
    failed: number;     // 失敗（リトライ上限超過）
  };

  /** リトライポリシー情報 */
  retryPolicy: {
    maxRetries: number;        // 最大リトライ回数
    retryIntervals: number[];  // リトライ間隔（秒）
    currentRetrying: number;   // 現在リトライ中の件数
  };
}

/**
 * 医療システム側の面談実施統計
 */
export interface MedicalSystemInterviewStats {
  /** 予定された面談の総数 */
  totalScheduled: number;
  /** 実際に完了した面談数 */
  actuallyCompleted: number;
  /** 実施率（%） */
  completionRate: number;
  /** 無断欠席率（%） */
  noShowRate: number;
  /** 再予約された件数 */
  rescheduledCount: number;
  /** 平均所要時間（分） */
  avgDuration: number;

  /** 面談タイプ別統計 */
  byInterviewType: {
    [type: string]: {
      scheduled: number;
      completed: number;
      completionRate: number;
      avgDuration: number;
    };
  };

  /** 直近完了面談リスト（最大5件） */
  recentCompletions: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;     // ISO 8601
    completedAt: string;     // ISO 8601
    duration: number;        // 分
    status: 'completed';
  }>;

  /** 未完了面談リスト */
  pendingInterviews: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;
    status: 'scheduled';
    isPastDue: boolean;      // 予定時刻を過ぎているか
  }>;

  /** 欠席・キャンセル面談リスト */
  missedInterviews: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;
    status: 'no_show' | 'cancelled';
    reason: string | null;
  }>;
}

/**
 * 拡張された連携メトリクス（VoiceDrive + 医療システム）
 */
export interface EnhancedIntegrationMetrics extends IntegrationMetrics {
  /** 医療システム側のデータ */
  medicalSystem: {
    webhookStats: MedicalSystemWebhookStats;
    interviewStats: MedicalSystemInterviewStats;

    /** 送信 vs 受信の差分 */
    syncDiscrepancy: number;

    /** 連携の健全性 */
    syncHealth: 'healthy' | 'warning' | 'critical';
  } | null;  // 医療システムAPIがエラーの場合はnull
}
```

---

### 要望2: テストデータ

**要望**:
- 統合テスト用のサンプルデータが必要ですか？
- 必要であれば、どのような形式が望ましいですか？

**回答**: ✅ **必要です**

**必要なテストデータ**:

#### テストデータ1: Webhook送信ログ（100件）

**形式**: JSON配列
**期間**: 過去24時間
**内容**:
- `employee.created`: 30件（全て成功）
- `employee.photo.updated`: 50件（48件成功、2件失敗）
- `employee.photo.deleted`: 20件（全て成功）

**サンプル**:
```json
[
  {
    "requestId": "req_001",
    "eventType": "employee.created",
    "staffId": "EMP001234",
    "sentAt": "2025-10-26T10:00:00Z",
    "sendStatus": "success",
    "responseStatus": 200,
    "responseTime": 120
  },
  {
    "requestId": "req_002",
    "eventType": "employee.photo.updated",
    "staffId": "EMP005678",
    "sentAt": "2025-10-26T10:05:00Z",
    "sendStatus": "failed",
    "responseStatus": 500,
    "responseTime": 5000,
    "errorMessage": "Internal server error"
  }
  // ... 98件分
]
```

**提供方法**: Week 3 Day 10（11/12）にMCPサーバー経由で共有

---

#### テストデータ2: 面談記録（50件）

**形式**: JSON配列
**期間**: 本日（2025-10-26）
**内容**:
- 定期面談: 30件（28件完了、1件キャンセル、1件無断欠席）
- 緊急面談: 15件（13件完了、2件キャンセル）
- フォローアップ: 5件（4件完了、1件無断欠席）

**サンプル**:
```json
[
  {
    "interviewId": "INT12345",
    "staffId": "EMP001234",
    "staffName": "山田太郎",
    "interviewType": "定期面談",
    "scheduledAt": "2025-10-26T10:00:00Z",
    "actualStartTime": "2025-10-26T10:02:30Z",
    "actualEndTime": "2025-10-26T10:20:45Z",
    "durationMinutes": 18,
    "status": "completed",
    "notes": "良好なコミュニケーション"
  },
  {
    "interviewId": "INT12346",
    "staffId": "EMP005678",
    "staffName": "佐藤花子",
    "interviewType": "緊急面談",
    "scheduledAt": "2025-10-26T11:00:00Z",
    "status": "cancelled",
    "reason": "職員体調不良"
  }
  // ... 48件分
]
```

**提供方法**: Week 3 Day 10（11/12）にMCPサーバー経由で共有

---

#### テストデータ3: 差分検出用データ（異常系）

**シナリオ**: 医療システムが100件送信、VoiceDriveは95件受信
**必要なデータ**:
- 医療システム側: 100件の送信ログ
- VoiceDrive側: 95件の受信ログ（5件が欠損）

**提供内容**:
- 欠損した5件の`requestId`リスト
- 欠損理由（タイムアウト、ネットワークエラー等）

---

### 要望3: 監視・アラート

**要望**:
- Phase 2.5リリース後、医療システム側で監視すべき項目はありますか？

**回答**: ✅ **以下の項目を推奨します**

#### 医療システム側で監視すべき項目

**1. VoiceDriveからのAPI呼び出し監視**

| 項目 | 閾値 | アラート条件 |
|------|------|------------|
| API呼び出し回数 | 100 req/min | 超過時に警告 |
| APIエラー率 | 5% | 超過時に警告 |
| API応答時間（95パーセンタイル） | 300ms | 超過時に警告 |
| 認証エラー回数 | 10回/時間 | 超過時にアラート |

**実装方法**:
```typescript
// 医療システム側のミドルウェア
app.use('/api/voicedrive/*', (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // メトリクス記録
    metrics.recordApiCall({
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date()
    });

    // 閾値チェック
    if (duration > 300) {
      console.warn(`[Alert] Slow API response: ${req.path} - ${duration}ms`);
    }
  });

  next();
});
```

---

**2. Webhook送信監視**

| 項目 | 閾値 | アラート条件 |
|------|------|------------|
| 送信成功率 | 99% | 下回る時に警告 |
| リトライキューのサイズ | 50件 | 超過時に警告 |
| リトライ上限超過件数 | 5件/日 | 超過時にアラート |

**実装方法**:
```typescript
// 毎時実行
async function monitorWebhookSending() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const stats = await prisma.webhookSendLog.groupBy({
    by: ['sendStatus'],
    where: { sentAt: { gte: oneHourAgo } },
    _count: true
  });

  const total = stats.reduce((sum, s) => sum + s._count, 0);
  const success = stats.find(s => s.sendStatus === 'success')?._count || 0;
  const successRate = (success / total) * 100;

  if (successRate < 99) {
    sendAlert(`Webhook送信成功率が低下: ${successRate.toFixed(2)}%`);
  }
}
```

---

**3. データベース監視**

| 項目 | 閾値 | アラート条件 |
|------|------|------------|
| `webhook_send_logs`テーブルサイズ | 1GB | 超過時に通知 |
| インデックスの効率 | - | 週次でスロークエリをレビュー |

---

## 🎯 VoiceDrive側の実装計画（詳細）

### Week 1: 型定義とAPIクライアント実装

**Day 1（10/28 月）: キックオフMTG + 型定義**
- 10:00-11:00: キックオフMTG
- 11:00-12:00: 型定義ファイル作成（`src/types/medicalSystem.types.ts`）
- 13:00-17:00: MedicalSystemClient基本実装

**Day 2（10/29 火）: APIクライアント完成**
- 09:00-12:00: エラーハンドリング実装
- 13:00-15:00: リトライロジック実装
- 15:00-17:00: 単体テスト作成

**Day 3（10/30 水）: MonitoringService拡張**
- 09:00-12:00: `getEnhancedIntegrationMetrics()`実装
- 13:00-15:00: 差分計算ロジック実装
- 15:00-17:00: テスト

---

### Week 2: API統合とUI拡張

**Day 4（11/4 月）: API routes拡張**
- 09:00-12:00: `/api/integration/enhanced-metrics`エンドポイント実装
- 13:00-17:00: テスト

**Day 5（11/5 火）: UI拡張開始**
- 09:00-12:00: 差分アラートコンポーネント実装
- 13:00-17:00: 面談統計表示コンポーネント実装

**Day 6（11/6 水）: UI完成**
- 09:00-12:00: SystemMonitorPageに統合
- 13:00-17:00: スタイリング、アクセシビリティ対応

---

### Week 3: テスト準備

**Day 7-10（11/11-14）: 統合テスト準備**
- テストシナリオ作成
- Postmanコレクション作成
- テストデータ準備

---

### Week 4: 統合テスト & デプロイ

**Day 11-15（11/18-22）**: 上記「確認3」のスケジュール通り

---

## ✅ アクションアイテム

### VoiceDriveチーム（今日〜明日）
- [x] 医療システム回答書の確認
- [x] 3つの確認事項への回答（本文書）
- [ ] 型定義の事前共有（10/28）
- [ ] Phase 2.5ブランチ作成
- [ ] 環境変数の準備

### VoiceDriveチーム（Week 1以降）
- [ ] 10/28 10:00 キックオフMTG参加
- [ ] Week 1: MedicalSystemClient実装
- [ ] Week 2: UI拡張
- [ ] Week 3: テスト準備
- [ ] Week 4: 統合テスト & デプロイ

---

## 📞 次のステップ

### 医療システムチームへのお願い
1. **本回答書の確認**: 確認事項への回答内容をご確認ください
2. **APIキーの準備**: 10/28のキックオフMTGでステージング環境用APIキーを共有
3. **キックオフMTG参加**: 10/28（月）10:00

### VoiceDriveチーム
1. **型定義の共有**: 10/28にMCPサーバー経由で共有
2. **Phase 2.5ブランチ作成**: 10/28に作成
3. **環境変数設定**: ステージング環境のAPIキー設定

---

## 🎉 まとめ

医療システムチームの詳細な回答と4週間スケジュールの承認、誠にありがとうございます。

**合意事項**:
- ✅ 4週間スケジュール（10/28〜11/22）で実装
- ✅ API 1、API 2を優先実装（API 3はPhase 3に延期）
- ✅ データ保持期間は3ヶ月で統一
- ✅ 環境ごとに別々のAPIキーを使用
- ✅ Week 4に統合テスト実施（6シナリオ）

**Phase 2.5完了時の期待成果**:
- データ欠損の早期検出（送信vs受信の差分を24時間以内に検出）
- 面談実施率の可視化（実施率90%以上を維持）
- Webhook送信成功率99%以上を達成

引き続きよろしくお願いいたします！

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
承認: VoiceDriveチーム承認済み
次回レビュー: キックオフMTG後（10月28日）
