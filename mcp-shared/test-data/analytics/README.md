# VoiceDrive Analytics API - テストデータサンプル

**作成日**: 2025年10月9日
**バージョン**: 1.0.0
**目的**: 職員カルテシステム開発チーム向けのテストデータ提供

---

## 📁 ファイル一覧

| ファイル名 | 説明 | サイズ | 用途 |
|-----------|------|--------|------|
| `aggregated-stats-1week.json` | 1週間分の集計データ | 342件 | 短期データテスト |
| `aggregated-stats-1month.json` | 1ヶ月分の集計データ | 1,250件 | 中期データテスト |
| `group-analysis-with-llm.json` | LLM分析付き分析データ | - | 送信APIテスト |
| `error-cases.json` | エラーケース一覧 | 8ケース | エラーハンドリングテスト |
| **`README.md`** | 本ドキュメント | - | 使い方ガイド |

---

## 🚀 使い方

### 1. 集計データ取得APIのテスト

#### 1週間分のデータでテスト

```bash
# VoiceDriveの統合テストサーバーから実際に取得
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  "http://localhost:4000/api/v1/analytics/aggregated-stats?startDate=2025-09-30&endDate=2025-10-07"

# または、サンプルファイルを使用
cat mcp-shared/test-data/analytics/aggregated-stats-1week.json
```

**期待データ構造**:
- `period`: 期間情報（startDate, endDate, totalDays）
- `stats`: 統計データ
  - `totalPosts`: 総投稿数
  - `totalUsers`: 総ユーザー数
  - `participationRate`: 参加率
  - `byCategory`: カテゴリ別内訳
  - `byDepartment`: 部署別内訳
  - `byLevel`: レベル別内訳
  - `timeSeries`: 日次トレンド
  - `engagement`: エンゲージメント指標
- `privacyMetadata`: プライバシーメタデータ

#### 1ヶ月分のデータでテスト

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  "http://localhost:4000/api/v1/analytics/aggregated-stats?startDate=2025-09-01&endDate=2025-09-30"

# サンプルファイル
cat mcp-shared/test-data/analytics/aggregated-stats-1month.json
```

**データ規模**:
- 総投稿数: 1,250件
- 総ユーザー数: 120名
- 参加率: 78.5%

---

### 2. 分析データ送信APIのテスト

#### LLM分析付きデータ送信

```bash
# サンプルファイルを使用して送信
curl -X POST -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d @mcp-shared/test-data/analytics/group-analysis-with-llm.json \
  http://localhost:4000/api/v1/analytics/group-data
```

**データ構造**:
- `analysisDate`: 分析日
- `period`: 分析期間
- `postingTrends`: 投稿トレンド
- `sentimentAnalysis`: 感情分析
  - `overall`: 全体の感情分布
  - `byDepartment`: 部署別感情分布
  - `trendOverTime`: 時系列推移
- `topicAnalysis`: トピック分析
  - `topKeywords`: トップキーワード（TOP 5）
  - `emergingTopics`: 新出トピック
  - `topicClusters`: トピッククラスター
- `privacyMetadata`: プライバシーメタデータ
- `metadata`: メタデータ（LLMモデル情報含む）

---

### 3. エラーケースのテスト

#### エラーケース一覧

```bash
# エラーケースファイルを確認
cat mcp-shared/test-data/analytics/error-cases.json | jq '.errorCases[].name'
```

**テストすべきエラーケース（8ケース）**:

1. **日付範囲超過エラー（3ヶ月以上）**
   - エラーコード: `DATE_RANGE_TOO_LONG`
   - ステータス: 400

2. **過去6ヶ月を超えるデータリクエスト**
   - エラーコード: `DATE_TOO_OLD`
   - ステータス: 400

3. **無効な日付形式**
   - エラーコード: `INVALID_DATE_FORMAT`
   - ステータス: 400

4. **JWT認証エラー（トークン無し）**
   - エラーコード: `UNAUTHORIZED`
   - ステータス: 401

5. **JWT認証エラー（無効なトークン）**
   - エラーコード: `INVALID_TOKEN`
   - ステータス: 401

6. **レート制限超過**
   - エラーコード: `RATE_LIMIT_EXCEEDED`
   - ステータス: 429

7. **HMAC署名検証エラー**
   - エラーコード: `INVALID_SIGNATURE`
   - ステータス: 400

8. **必須フィールド不足**
   - エラーコード: `VALIDATION_ERROR`
   - ステータス: 400

#### エラーケーステスト実行例

```bash
# 日付範囲超過エラー
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  "http://localhost:4000/api/v1/analytics/aggregated-stats?startDate=2025-06-01&endDate=2025-10-07"

# 期待レスポンス:
# {
#   "error": {
#     "code": "DATE_RANGE_TOO_LONG",
#     "message": "日付範囲は最大3ヶ月までです",
#     "details": {
#       "requestedDays": 128,
#       "maxAllowedDays": 90
#     }
#   }
# }
```

---

## 📊 データ特徴

### プライバシー保護

全てのサンプルデータは**K-匿名性（K=5）**に準拠しています:
- グループサイズ < 5 のデータは抑制
- 同意済みユーザーのデータのみ含む
- 個人を特定できる情報は含まない

### データ品質

- **整合性**: 日付範囲とデータ数が一致
- **現実性**: 実際の医療現場を想定した数値
- **多様性**: 複数の部署・カテゴリ・レベルを含む

---

## 🧪 統合テストシナリオ

### Scenario 1: 正常系（1週間分データ取得）

```bash
# Step 1: ヘルスチェック
curl http://localhost:4000/health

# Step 2: 集計データ取得
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  "http://localhost:4000/api/v1/analytics/aggregated-stats?startDate=2025-09-30&endDate=2025-10-07"

# Step 3: レスポンス検証
# - ステータス: 200 OK
# - totalPosts: 342
# - totalUsers: 89
# - participationRate: 74.2
```

### Scenario 2: LLM分析データ送信

```bash
# Step 1: サンプルファイル読み込み
data=$(cat mcp-shared/test-data/analytics/group-analysis-with-llm.json)

# Step 2: HMAC署名生成（オプション）
signature=$(echo -n "$data" | openssl dgst -sha256 -hmac "<HMAC_SECRET>" | awk '{print $2}')

# Step 3: データ送信
curl -X POST -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "X-VoiceDrive-Signature: $signature" \
  -d "$data" \
  http://localhost:4000/api/v1/analytics/group-data

# Step 4: レスポンス検証
# - ステータス: 200 OK
# - success: true
# - receivedAt: timestamp
```

### Scenario 3: エラーハンドリング

```bash
# 日付範囲超過エラーのテスト
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  "http://localhost:4000/api/v1/analytics/aggregated-stats?startDate=2025-06-01&endDate=2025-10-07"

# 期待レスポンス:
# - ステータス: 400 Bad Request
# - エラーコード: DATE_RANGE_TOO_LONG
```

---

## 📝 TypeScript型定義

### 集計データ型

```typescript
interface AggregatedStats {
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string;
    totalDays: number;
  };
  stats: {
    totalPosts: number;
    totalUsers: number;
    participationRate: number;
    byCategory: CategoryBreakdown[];
    byDepartment: DepartmentBreakdown[];
    byLevel: LevelBreakdown[];
    timeSeries: DailyData[];
    engagement: EngagementMetrics;
  };
  privacyMetadata: PrivacyMetadata;
}
```

### 分析データ型

```typescript
interface GroupAnalysisData {
  analysisDate: string;
  period: { startDate: string; endDate: string };
  postingTrends: PostingTrends;
  sentimentAnalysis?: SentimentAnalysis;
  topicAnalysis?: TopicAnalysis;
  privacyMetadata: PrivacyMetadata;
  metadata: AnalysisMetadata;
}
```

---

## 🔧 トラブルシューティング

### Q1: サンプルファイルが見つからない

**確認事項**:
```bash
# ファイルの存在確認
ls -la mcp-shared/test-data/analytics/

# パスの確認
pwd
```

### Q2: JSONパースエラー

**対処法**:
```bash
# JSON形式の検証
cat mcp-shared/test-data/analytics/aggregated-stats-1week.json | jq '.'

# jqがインストールされていない場合
npm install -g jq
```

### Q3: VoiceDriveサーバーに接続できない

**確認事項**:
```bash
# サーバー起動確認
curl http://localhost:4000/health

# ポート確認
netstat -ano | findstr :4000

# サーバーが起動していない場合
cd C:\projects\voicedrive-v100
npm run test:integration:server
```

---

## 📚 参考資料

### 統合テスト関連ドキュメント

| ドキュメント | 説明 |
|------------|------|
| `Integration_Test_Success_Acknowledgement_20251009.md` | VoiceDrive側返答・成功確認 |
| `Integration_Test_Completion_Report_20251009.md` | 職員カルテ側完了報告 |
| `Integration_Test_Server_Ready_20251009.md` | サーバー起動完了 |

### API仕様書

- `mcp-shared/docs/VoiceDrive_Analytics_Integration_Implementation_Guide.md` - 実装ガイド
- `mcp-shared/interfaces/voicedrive-analytics-api.interface.ts` - TypeScript型定義

---

## 📞 お問い合わせ

### サポート

- **Slack**: `#voicedrive-analytics-integration`
- **MCPサーバー**: `mcp-shared/docs/`
- **メール**: voicedrive-dev@example.com（仮）

### フィードバック

テストデータに関するフィードバックやリクエストがあれば、お気軽にご連絡ください：
- 追加のテストケースが必要
- データ量の調整が必要
- 新しいエラーケースの追加

---

**VoiceDrive開発チーム**
2025年10月9日

---

## 🔄 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2025-10-09 | 初版作成 | VoiceDrive開発チーム |
