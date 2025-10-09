# ボイス分析ページ DB要件分析

**文書番号**: VA-DB-REQ-2025-1010-001
**作成日**: 2025年10月10日
**作成者**: VoiceDriveチーム
**目的**: ボイス分析ページのDB要件を明確化し、医療システムとの責任分界を定義
**重要度**: 🔴 最重要
**関連文書**: データ管理責任分界点定義書_20251008.md

---

## 📋 エグゼクティブサマリー

### 背景
- ボイス分析ページは**既に実装完了**（373行、デモデータ、権限制御Level 14-17）
- **人事部門専用**ページ（組織の声を可視化する集団分析ダッシュボード）
- 現在は**デモデータのみ**でDB未統合
- **職員カルテシステムからWebhook経由でバッチ分析データを受信**する体制

### 実装状況
- ✅ UI完全実装（[VoiceAnalyticsPage.tsx](src/pages/VoiceAnalyticsPage.tsx):373行）
- ✅ 型定義完備（[src/types/voiceAnalytics.ts](src/types/voiceAnalytics.ts):352行）
- ✅ サービス層実装（[src/services/VoiceAnalyticsService.ts](src/services/VoiceAnalyticsService.ts):374行）
- ✅ Webhook受信テーブル存在（`WebhookNotification`）
- ❌ 分析データ専用テーブル未構築
- ❌ バッチデータの永続化未実装

### 特殊なデータ連携体制

このページは他のページと異なる**プッシュ型連携**を採用：

| 項目 | PersonalStation等 | VoiceAnalytics |
|------|-------------------|----------------|
| データ取得方式 | Pull型（VoiceDrive → 医療API） | Push型（医療Webhook → VoiceDrive） |
| データ種別 | 個人データ（User情報） | 集団分析データ（匿名化済み） |
| 更新頻度 | リアルタイム（API呼び出し） | バッチ（日次・週次・月次） |
| キャッシュ戦略 | 短期（数時間～24時間） | 長期（分析期間全体） |
| プライバシー | 個人特定可能 | 最小グループサイズ5名で匿名化 |

### DB構築方針
1. **VoiceDrive管轄データ**: 集団分析結果（投稿動向、感情分析、トピック分析、エンゲージメント、アラート）
2. **医療システム連携**: Webhook経由でバッチ分析結果を受信
3. **データ管理責任**: 生データは医療システム、集団統計はVoiceDrive
4. **プライバシー保護**: 同意済み職員のみ、最小グループサイズ5名、個人特定不可

---

## 🎯 ページ機能分析

### 対象URL
- **本番URL**: https://voicedrive-v100.vercel.app/voice-analytics
- **権限レベル**: Level 14-17（人事部門専用）
- **ソースファイル**: [src/pages/VoiceAnalyticsPage.tsx](src/pages/VoiceAnalyticsPage.tsx)

### ヘッダー情報

**分析期間表示**:
- `analysisDate`: 2025-10-07（分析実施日）
- `period.startDate`: 2025-09-01（分析期間開始）
- `period.endDate`: 2025-09-30（分析期間終了）

**データソース**: VoiceDrive管轄（医療システムから受信したバッチ結果）

---

### サマリーカード（4つ）

#### Card 1: 総投稿数
- **totalPosts**: 342件
- **trendDirection**: 増加傾向/減少傾向/安定
- **monthOverMonthChange**: 前月比 +4.3%

#### Card 2: 参加率
- **participationRate**: 74.2%（投稿参加率）
- **totalUsers**: 89名（投稿した職員数）
- **totalEligibleUsers**: 120名（同意済み職員総数）

#### Card 3: ポジティブ率
- **positiveRate**: 55.3%（ポジティブ投稿率）
- **negativeRate**: 16.1%（ネガティブ投稿率）
- **neutralRate**: 28.6%（中立投稿率）

#### Card 4: エンゲージメントスコア
- **engagementScore**: 71（0-100の総合スコア）
- **totalComments**: 1300件（総コメント数）
- **totalVotes**: 1934件（総投票数）

**データソース**: 全てVoiceDrive管轄（集計値）

---

### グラフエリア（6つ）

#### グラフ1: 月次推移
- **monthlyTrend**: 過去6ヶ月の投稿数推移
- データ例: 2025-04（186件）→ 2025-09（342件）

#### グラフ2: カテゴリ別投稿数
- **byCategory**: アイデアボイス（45.6%）、フリーボイス（28.7%）、議題提案（17.0%）、その他（8.8%）

#### グラフ3: 部門別投稿数
- **byDepartment**: 看護部（37.4%）、リハビリ科（25.1%）、事務部（15.8%）、医局（12.3%）、その他（9.4%）

#### グラフ4: 感情分析
- **sentimentAnalysis**: ポジティブ（189件、55.3%）、中立（98件、28.6%）、ネガティブ（55件、16.1%）
- **部門別感情**: 各部門のポジティブ率・ネガティブ率

#### グラフ5: 頻出キーワード TOP 10
- **topKeywords**: 「業務改善」（68回）、「働きやすさ」（54回）、「研修」（42回）等
- カテゴリ: work, environment, welfare, system, other

#### グラフ6: 部門別エンゲージメント
- **engagementMetrics.byDepartment**: 各部門のエンゲージメントスコア（0-100）

**データソース**: 全てVoiceDrive管轄（医療システムから受信した分析結果）

---

### アラートセクション

**表示項目**:
- **id**: アラートID
- **severity**: low | medium | high | critical
- **topic**: トピック名（例: 「シフト調整の課題」）
- **description**: 詳細説明
- **affectedDepartments**: 影響部門リスト
- **recommendedAction**: 推奨アクション

**データ例**:
```json
{
  "id": "alert-001",
  "severity": "medium",
  "topic": "シフト調整の課題",
  "description": "看護部において、シフト調整に関するネガティブな投稿が増加しています。",
  "affectedDepartments": ["看護部"],
  "recommendedAction": "シフト管理システムの見直しと、現場ヒアリングの実施を推奨します。"
}
```

**データソース**: VoiceDrive管轄（医療システムの分析結果を保存）

---

### プライバシー保護情報

**表示項目**:
- **totalConsentedUsers**: 120名（同意済み職員数）
- **minimumGroupSize**: 5名（最小グループサイズ）
- **excludedSmallGroupsCount**: 2件（除外された小規模グループ数）

**プライバシー保護原則**:
1. ✅ 同意済み職員のみが分析対象
2. ✅ 最小グループサイズ5名（個人特定不可）
3. ✅ 小規模グループは自動除外
4. ✅ 集団統計データのみ（生データは職員カルテシステムで管理）

---

## 📊 データ管理責任マトリクス

### カテゴリ1: 集団分析データ（GroupAnalyticsData）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 分析ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| 分析実施日（analysisDate） | キャッシュ | ✅ マスタ | Webhook | 医療システムが分析実施 |
| 分析期間（period） | キャッシュ | ✅ マスタ | Webhook | 医療システムが期間指定 |
| 総投稿数（totalPosts） | キャッシュ | ✅ マスタ | Webhook | 医療システムが集計 |
| 投稿参加率（participationRate） | キャッシュ | ✅ マスタ | Webhook | 医療システムが算出 |
| 同意済み職員数（totalConsentedUsers） | - | ✅ マスタ | Webhook | 医療システムが管理 |
| 最小グループサイズ（minimumGroupSize） | - | ✅ マスタ | Webhook | 医療システム設定値 |
| 除外グループ数（excludedSmallGroupsCount） | - | ✅ マスタ | Webhook | 医療システムが判定 |

**方針**:
- 集団分析の**計算処理**は医療システムが実施
- VoiceDriveは**結果を受信・保存・可視化**
- 生データ（個人別投稿内容）は医療システムのみが保持

---

### カテゴリ2: 投稿動向（PostingTrends）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| カテゴリ別投稿数（byCategory） | キャッシュ | ✅ マスタ | Webhook | 医療システムが集計 |
| 部門別投稿数（byDepartment） | キャッシュ | ✅ マスタ | Webhook | 医療システムが集計 |
| レベル別投稿数（byLevel） | キャッシュ | ✅ マスタ | Webhook | 医療システムが集計 |
| 月次推移（monthlyTrend） | キャッシュ | ✅ マスタ | Webhook | 医療システムが集計 |

---

### カテゴリ3: 感情分析（SentimentAnalysis）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| ポジティブ数（positive） | キャッシュ | ✅ マスタ | Webhook | 医療システムがAI分析 |
| ネガティブ数（negative） | キャッシュ | ✅ マスタ | Webhook | 医療システムがAI分析 |
| 中立数（neutral） | キャッシュ | ✅ マスタ | Webhook | 医療システムがAI分析 |
| 部門別感情（byDepartment） | キャッシュ | ✅ マスタ | Webhook | 医療システムがAI分析 |

**重要**: 感情分析はAI処理が必要であり、医療システムの責任範囲

---

### カテゴリ4: トピック分析（TopicAnalysis）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 頻出キーワード（topKeywords） | キャッシュ | ✅ マスタ | Webhook | 医療システムが自然言語処理 |
| 新興トピック（emergingTopics） | キャッシュ | ✅ マスタ | Webhook | 医療システムがトレンド分析 |
| 部門別トピック（byDepartment） | キャッシュ | ✅ マスタ | Webhook | 医療システムが部門別分析 |

**重要**: トピック分析は自然言語処理が必要であり、医療システムの責任範囲

---

### カテゴリ5: エンゲージメント（EngagementMetrics）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 投稿あたりコメント数（averageCommentsPerPost） | キャッシュ | ✅ マスタ | Webhook | 医療システムが集計 |
| アイデアあたり投票数（averageVotesPerIdea） | キャッシュ | ✅ マスタ | Webhook | 医療システムが集計 |
| アクティブユーザー率（activeUserRate） | キャッシュ | ✅ マスタ | Webhook | 医療システムが算出 |
| 部門別エンゲージメント（byDepartment） | キャッシュ | ✅ マスタ | Webhook | 医療システムが算出 |

---

### カテゴリ6: アラート（AnalyticsAlert）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| アラートID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| 重要度（severity） | キャッシュ | ✅ マスタ | Webhook | 医療システムが判定 |
| トピック（topic） | キャッシュ | ✅ マスタ | Webhook | 医療システムが抽出 |
| 影響部門（affectedDepartments） | キャッシュ | ✅ マスタ | Webhook | 医療システムが判定 |
| 推奨アクション（recommendedAction） | キャッシュ | ✅ マスタ | Webhook | 医療システムがAI生成 |

---

## 🏗️ 必要なDBテーブル設計

### テーブル1: GroupAnalytics（集団分析データ）

```prisma
model GroupAnalytics {
  id                        String    @id @default(cuid())

  // メタデータ
  analysisDate              DateTime  // 分析実施日
  periodStartDate           DateTime  // 分析期間開始
  periodEndDate             DateTime  // 分析期間終了
  analysisType              String    @default("monthly") // 'weekly' | 'monthly' | 'quarterly' | 'yearly'

  // 投稿動向（JSON: PostingTrends）
  postingTrendsData         Json      // { totalPosts, totalUsers, participationRate, byCategory, byDepartment, byLevel, monthlyTrend }

  // 感情分析（JSON: SentimentAnalysis）
  sentimentAnalysisData     Json?     // { positive, neutral, negative, positiveRate, negativeRate, byDepartment }

  // トピック分析（JSON: TopicAnalysis）
  topicAnalysisData         Json?     // { topKeywords, emergingTopics, byDepartment }

  // エンゲージメント（JSON: EngagementMetrics）
  engagementMetricsData     Json      // { averageCommentsPerPost, averageVotesPerIdea, activeUserRate, byDepartment }

  // プライバシー保護情報（JSON: PrivacyMetadata）
  privacyMetadata           Json      // { totalConsentedUsers, minimumGroupSize, excludedSmallGroupsCount }

  // 受信情報
  receivedAt                DateTime  @default(now())  // VoiceDriveが受信した日時
  webhookNotificationId     String?   // WebhookNotification.id

  // ステータス
  isProcessed               Boolean   @default(true)   // 処理完了フラグ
  isActive                  Boolean   @default(true)   // 最新データフラグ（古いデータはfalse）

  // タイムスタンプ
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  // リレーション
  webhookNotification       WebhookNotification? @relation(fields: [webhookNotificationId], references: [id])
  alerts                    AnalyticsAlert[]

  @@index([analysisDate])
  @@index([analysisType])
  @@index([isActive])
  @@index([periodStartDate, periodEndDate])
}
```

---

### テーブル2: AnalyticsAlert（分析アラート）

```prisma
model AnalyticsAlert {
  id                    String           @id @default(cuid())

  // 分析データとの関連
  groupAnalyticsId      String           // GroupAnalytics.id

  // アラート情報
  severity              String           // 'low' | 'medium' | 'high' | 'critical'
  topic                 String           // トピック名
  description           String           // 詳細説明
  affectedDepartments   Json             // string[] - 影響部門リスト
  recommendedAction     String           // 推奨アクション

  // ステータス
  isAcknowledged        Boolean          @default(false)  // 確認済みフラグ
  acknowledgedBy        String?          // 確認者名
  acknowledgedAt        DateTime?        // 確認日時

  // タイムスタンプ
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  // リレーション
  groupAnalytics        GroupAnalytics   @relation(fields: [groupAnalyticsId], references: [id], onDelete: Cascade)

  @@index([groupAnalyticsId])
  @@index([severity])
  @@index([isAcknowledged])
  @@index([createdAt])
}
```

---

### テーブル3: WebhookNotification（既存テーブル拡張）

**現在のschema.prismaには既に存在**しているが、リレーション追加が必要：

```prisma
model WebhookNotification {
  // 既存フィールド...

  // 新規リレーション🆕
  groupAnalytics        GroupAnalytics[] // 分析データ受信通知
}
```

---

## 🔗 医療システムAPI連携要件

### Webhook 1: 集団分析バッチ完了通知

**エンドポイント**: `POST /api/webhooks/analytics-batch-completed`

**用途**:
- 医療システムが月次・週次・四半期バッチ分析完了時に通知
- VoiceDriveがGroupAnalyticsテーブルにデータを保存

**リクエスト例**:
```json
{
  "notificationId": "analytics-batch-2025-09",
  "type": "success",
  "title": "集団分析バッチ完了",
  "message": "2025年9月分の集団分析が完了しました。",
  "details": {
    "analysisDate": "2025-10-07",
    "period": {
      "startDate": "2025-09-01",
      "endDate": "2025-09-30"
    },
    "analysisType": "monthly",
    "dataUrl": "https://medical-system.internal/api/analytics/2025-09",
    "totalPosts": 342,
    "totalConsentedUsers": 120,
    "analysisStatus": "completed"
  },
  "accountLevel": 14,
  "timestamp": "2025-10-07T03:00:00Z"
}
```

**VoiceDrive側処理**:
1. WebhookNotificationテーブルに保存
2. `details.dataUrl`からJSON取得（GroupAnalyticsData形式）
3. GroupAnalyticsテーブルに保存
4. 古いデータの`isActive`をfalseに更新

---

### API 1: 分析データ取得（Pull型バックアップ）

**エンドポイント**: `GET /api/analytics/{analysisId}`

**用途**:
- Webhook失敗時のリトライ
- 過去データの再取得
- データ整合性チェック

**レスポンス例**:
```json
{
  "analysisDate": "2025-10-07",
  "period": {
    "startDate": "2025-09-01",
    "endDate": "2025-09-30"
  },
  "postingTrends": {
    "totalPosts": 342,
    "totalUsers": 89,
    "totalEligibleUsers": 120,
    "participationRate": 74.2,
    "byCategory": [ ... ],
    "byDepartment": [ ... ],
    "byLevel": [ ... ],
    "monthlyTrend": [ ... ]
  },
  "sentimentAnalysis": { ... },
  "topicAnalysis": { ... },
  "engagementMetrics": { ... },
  "alerts": [ ... ],
  "privacyMetadata": {
    "totalConsentedUsers": 120,
    "minimumGroupSize": 5,
    "excludedSmallGroupsCount": 2
  }
}
```

---

## 🚧 不足項目まとめ

### A. DBテーブル（schema.prisma）
1. ❌ `GroupAnalytics` - 集団分析データ
2. ❌ `AnalyticsAlert` - 分析アラート
3. 🔄 `WebhookNotification` - リレーション追加（既存テーブル拡張）

### B. Webhook受信エンドポイント
- 🔄 `/api/webhooks/analytics-batch-completed` - 既存Webhook体制活用

### C. 医療システムAPI
- ✅ Webhook通知 - 既存体制活用
- ✅ バッチ分析データ取得 - 新規実装必要（医療システム側）

---

## 📅 実装ロードマップ

### Phase 1: DB構築（1日）

**Day 1**:
- [ ] schema.prisma更新（GroupAnalytics、AnalyticsAlert追加）
- [ ] WebhookNotificationにリレーション追加
- [ ] Prisma Migration実行（MySQL移行後）
- [ ] Prisma Client再生成

---

### Phase 2: Webhook受信実装（1日）

**Day 2**:
- [ ] `/api/webhooks/analytics-batch-completed`エンドポイント実装
- [ ] Webhook署名検証
- [ ] GroupAnalyticsデータ保存ロジック
- [ ] AnalyticsAlertデータ保存ロジック
- [ ] 古いデータの`isActive`更新ロジック

---

### Phase 3: サービス層DB版移行（1日）

**Day 3**:
- [ ] VoiceAnalyticsService.tsをDB版に変更
- [ ] `getAnalyticsData()`メソッド：DB取得に変更
- [ ] `getSummary()`メソッド：DB集計に変更
- [ ] デモデータ投入スクリプト作成
- [ ] 統合テスト（CRUD操作）

---

### Phase 4: UI統合（0.5日）

**Day 4午前**:
- [ ] VoiceAnalyticsPage.tsxをDB版に接続
- [ ] リアルタイムデータ表示確認
- [ ] フィルタリング機能実装（期間選択）
- [ ] E2Eテスト

---

### Phase 5: 医療システム連携（0.5日）

**Day 4午後**:
- [ ] 医療システムとWebhook連携テスト
- [ ] バッチ分析データ受信確認
- [ ] データ整合性チェック
- [ ] エラーハンドリング確認

**合計**: 4日間

---

## ✅ 成功基準

### 機能要件
- [ ] サマリーカード4つ全て正確表示
- [ ] グラフエリア6つ全て正確表示
- [ ] アラートセクション動作
- [ ] プライバシー保護情報表示
- [ ] 期間フィルタリング機能動作
- [ ] Webhook受信からDB保存まで自動化

### 非機能要件
- [ ] ページ読み込み時間 < 2秒
- [ ] Webhook受信処理 < 5秒
- [ ] データ整合性100%（医療システムと）
- [ ] プライバシー保護完全性（最小グループサイズ5名）

### データ管理
- [ ] VoiceDrive/医療システム責任分界明確
- [ ] 集団分析データのみ保存（個人データなし）
- [ ] 同意済み職員のみが分析対象
- [ ] 最新データの`isActive`フラグ管理

---

## 🔒 プライバシー保護実装詳細

### 1. 同意管理

**医療システム側責任**:
- `DataConsent`テーブルで同意状況を管理
- `analyticsConsent = true`の職員のみが分析対象
- 同意撤回時は即座に次回分析から除外

**VoiceDrive側確認**:
```typescript
// GroupAnalytics受信時に確認
if (data.privacyMetadata.totalConsentedUsers < data.postingTrends.totalUsers) {
  throw new Error('プライバシー違反: 同意なし職員が分析に含まれています');
}
```

---

### 2. 最小グループサイズ

**医療システム側保証**:
- 部門別分析: 5名未満の部門は「その他」に統合
- レベル別分析: 5名未満のレベル範囲は統合
- 小規模グループ数を`excludedSmallGroupsCount`で報告

**VoiceDrive側検証**:
```typescript
// 部門別データ検証
for (const dept of data.postingTrends.byDepartment) {
  if (dept.count < 5 && dept.department !== 'その他') {
    throw new Error(`プライバシー違反: ${dept.department}の人数が5名未満です`);
  }
}
```

---

### 3. データ匿名化

**医療システム側処理**:
- 個人識別情報を完全除去
- 集計値のみ提供
- 生データへのアクセス権限なし

**VoiceDrive側保証**:
- GroupAnalyticsテーブルに個人IDフィールドなし
- 集団統計データのみ保存
- 個人特定不可能

---

## 📞 医療チームへの質問事項

### 質問1: バッチ分析実施頻度

集団分析バッチは：

- 月次のみ（月初1回）
- 週次 + 月次
- 週次 + 月次 + 四半期

どの頻度で実施しますか？

---

### 質問2: 感情分析・トピック分析の実装

感情分析（ポジティブ/ネガティブ判定）とトピック分析（キーワード抽出）は：

- Phase 1から実装（AI処理込み）
- Phase 2以降に実装（まず基本統計のみ）
- 外部AI API活用（OpenAI等）

どの方式を推奨しますか？

---

### 質問3: 過去データの保存期間

GroupAnalyticsテーブルのデータ保存期間は：

- 全期間保存（削除なし）
- 直近2年間のみ保存
- 直近1年間のみ保存、それ以前はアーカイブ

どの方式を推奨しますか？

---

## 📚 関連文書

- [データ管理責任分界点定義書_20251008.md](mcp-shared/docs/データ管理責任分界点定義書_20251008.md)
- [VoiceAnalyticsPage.tsx](src/pages/VoiceAnalyticsPage.tsx)
- [src/types/voiceAnalytics.ts](src/types/voiceAnalytics.ts)
- [src/services/VoiceAnalyticsService.ts](src/services/VoiceAnalyticsService.ts)
- [schema.prisma](prisma/schema.prisma) - WebhookNotificationテーブル

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
承認: 未承認（レビュー待ち）
