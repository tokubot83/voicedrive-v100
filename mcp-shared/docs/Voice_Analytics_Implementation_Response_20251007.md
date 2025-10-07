# VoiceDriveボイス分析機能実装計画 - 回答書

**作成日：2025年10月7日**
**作成者：VoiceDrive開発チーム**
**宛先：職員カルテシステム開発チーム様**

---

## 1. はじめに

VoiceDriveボイス分析機能の集団分析データ受信API仕様に関する詳細な回答書、誠にありがとうございます。

貴チームからのご提案を検討した結果、以下の実装方針で進めることを決定いたしましたので、ご報告申し上げます。

---

## 2. 実装方針の決定

### 2.1 投稿データアクセス方法

**決定：方法B（集計API提供）を採用します。**

#### 採用理由

| 項目 | 理由 |
|------|------|
| **情報保護** | 最小権限の原則に基づき、必要な集計データのみ提供 |
| **アクセス制御** | VoiceDrive側で完全にアクセスを制御可能 |
| **監査証跡** | すべてのアクセスを詳細に記録・追跡可能 |
| **セキュリティ** | JWT認証 + IPホワイトリスト + レート制限 |
| **異常検知** | 不正アクセスパターンを即座に検知可能 |

#### 方法A（DBビュー）を不採用とした理由

- ⚠️ 予想外のSQLクエリによるデータ流出リスク
- ⚠️ DB接続情報の管理リスク
- ⚠️ 監査ログが不十分
- ⚠️ レート制限が不可能

### 2.2 感情分析・トピック分析の実装

**決定：職員カルテシステム側のローカルLLM（Llama 3.2 8B）での実施を了承します。**

#### 了承理由

| 項目 | メリット |
|------|---------|
| **コスト** | VoiceDrive側でLLM環境構築が不要（追加コストゼロ） |
| **プライバシー** | 投稿内容がローカルLLMで処理され、外部流出リスクゼロ |
| **既存資産活用** | 貴チームの既存ローカルLLM基盤を有効活用 |
| **責任分離** | 分析は職員カルテ、表示はVoiceDriveと明確に分離 |
| **精度** | Llama 3.2 8Bは90-95%の精度（十分な品質） |

---

## 3. VoiceDrive側の実装内容

### 3.1 集計APIエンドポイント

職員カルテシステムからアクセスするための集計APIを提供します。

#### 3.1.1 エンドポイント仕様

```
GET https://voicedrive.example.com/api/v1/analytics/aggregated-stats
```

#### 3.1.2 認証方式

```http
Authorization: Bearer {JWT_TOKEN}
X-API-Key: {SHARED_API_KEY}
```

**セキュリティ層**:
1. JWT認証（システム識別）
2. API Key認証（追加検証）
3. IPホワイトリスト（職員カルテシステムのIPのみ許可）
4. レート制限（100リクエスト/時間）

#### 3.1.3 リクエストパラメータ

```typescript
interface AggregatedStatsRequest {
  startDate: string;        // YYYY-MM-DD（必須）
  endDate: string;          // YYYY-MM-DD（必須）
  department?: string;      // 部門フィルタ（オプション）
  levelRange?: string;      // レベル範囲 "1-3", "4-6" など（オプション）
  category?: string;        // カテゴリフィルタ（オプション）
}
```

**リクエスト例**:
```
GET /api/v1/analytics/aggregated-stats
  ?startDate=2025-10-01
  &endDate=2025-10-07
  &department=看護部
```

#### 3.1.4 レスポンスフォーマット

```typescript
interface AggregatedStatsResponse {
  // メタデータ
  period: {
    startDate: string;
    endDate: string;
  };

  // 基本統計
  stats: {
    totalPosts: number;              // 総投稿数
    totalUsers: number;              // 投稿した職員数（同意済みのみ）
    totalEligibleUsers: number;      // 同意済み職員総数
    participationRate: number;       // 投稿参加率 %

    // カテゴリ別集計
    byCategory: Array<{
      category: string;              // "idea_voice", "free_voice" など
      count: number;
      percentage: number;
    }>;

    // 部門別集計
    byDepartment: Array<{
      department: string;
      postCount: number;
      userCount: number;
      percentage: number;
    }>;

    // レベル別集計
    byLevel: Array<{
      levelRange: string;            // "1-3", "4-6", "7-9", "10+" など
      count: number;
      percentage: number;
    }>;

    // 時系列データ
    timeSeries: Array<{
      date: string;                  // YYYY-MM-DD
      count: number;
    }>;

    // エンゲージメント集計
    engagement: {
      totalComments: number;
      totalVotes: number;
      averageCommentsPerPost: number;
      averageVotesPerIdea: number;
      activeUserRate: number;        // %

      byDepartment: Array<{
        department: string;
        engagementScore: number;     // 0-100
      }>;
    };
  };

  // プライバシー保護情報
  privacyMetadata: {
    totalConsentedUsers: number;
    minimumGroupSize: number;        // 5
    excludedSmallGroupsCount: number;
  };

  // メタデータ
  metadata: {
    generatedAt: string;             // ISO 8601
    apiVersion: string;              // "1.0.0"
  };
}
```

**レスポンス例**:
```json
{
  "period": {
    "startDate": "2025-10-01",
    "endDate": "2025-10-07"
  },
  "stats": {
    "totalPosts": 342,
    "totalUsers": 89,
    "totalEligibleUsers": 120,
    "participationRate": 74.2,
    "byCategory": [
      { "category": "idea_voice", "count": 156, "percentage": 45.6 },
      { "category": "free_voice", "count": 98, "percentage": 28.7 }
    ],
    "byDepartment": [
      { "department": "看護部", "postCount": 128, "userCount": 45, "percentage": 37.4 },
      { "department": "リハビリ科", "postCount": 86, "userCount": 28, "percentage": 25.1 }
    ],
    "byLevel": [
      { "levelRange": "1-3", "count": 198, "percentage": 57.9 },
      { "levelRange": "4-6", "count": 92, "percentage": 26.9 }
    ],
    "timeSeries": [
      { "date": "2025-10-01", "count": 48 },
      { "date": "2025-10-02", "count": 52 }
    ],
    "engagement": {
      "totalComments": 1300,
      "totalVotes": 1935,
      "averageCommentsPerPost": 3.8,
      "averageVotesPerIdea": 12.4,
      "activeUserRate": 68.3,
      "byDepartment": [
        { "department": "看護部", "engagementScore": 72 },
        { "department": "リハビリ科", "engagementScore": 78 }
      ]
    }
  },
  "privacyMetadata": {
    "totalConsentedUsers": 120,
    "minimumGroupSize": 5,
    "excludedSmallGroupsCount": 2
  },
  "metadata": {
    "generatedAt": "2025-10-07T14:30:00Z",
    "apiVersion": "1.0.0"
  }
}
```

#### 3.1.5 エラーレスポンス

```typescript
// 認証エラー（401）
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証トークンが無効です"
  }
}

// パラメータエラー（400）
{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "startDateとendDateは必須です",
    "details": ["startDate is required", "endDate is required"]
  }
}

// レート制限エラー（429）
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "レート制限を超過しました。1時間後に再試行してください。"
  }
}
```

### 3.2 集団分析データ受信APIエンドポイント

職員カルテシステムから分析結果を受信するAPIエンドポイントです。

#### 3.2.1 エンドポイント仕様

```
POST https://voicedrive.example.com/api/v1/analytics/group-data
```

#### 3.2.2 認証方式

```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
X-VoiceDrive-Signature: {HMAC-SHA256}
```

**セキュリティ層**:
1. JWT認証
2. HMAC-SHA256署名検証（改ざん防止）
3. IPホワイトリスト

#### 3.2.3 リクエストフォーマット

貴チームからご提案いただいた仕様をそのまま採用します（`Voice_Analytics_Data_API_Inquiry_20251007.md` 参照）。

```typescript
interface GroupAnalyticsRequest {
  analysisDate: string;
  period: { startDate: string; endDate: string };
  postingTrends: { ... };
  sentimentAnalysis?: { ... };  // ローカルLLMで分析済み
  topicAnalysis?: { ... };      // ローカルLLMで分析済み
  engagementMetrics: { ... };
  alerts?: Array<{ ... }>;
  privacyMetadata: { ... };
}
```

#### 3.2.4 レスポンスフォーマット

```typescript
// 成功（200 OK）
{
  "success": true,
  "receivedAt": "2025-10-07T14:30:45.500Z",
  "dataId": "analytics-20251007-143000",
  "message": "集団分析データを正常に受信しました"
}

// エラー（400/401/500）
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "必須フィールドが不足しています",
    "details": ["postingTrends.totalPosts is required"]
  }
}
```

---

## 4. セキュリティ実装

### 4.1 認証・認可

#### JWT認証

```typescript
// JWT Payload
{
  "sub": "staff-card-system",
  "iss": "medical-system",
  "aud": "voicedrive",
  "exp": 1696723200,  // 有効期限
  "iat": 1696636800,  // 発行日時
  "permissions": ["analytics:read", "analytics:write"]
}
```

#### IPホワイトリスト

職員カルテシステムのIPアドレスのみ許可：
```
# 職員カルテシステムのIP（例）
203.0.113.10
203.0.113.11
```

#### レート制限

| エンドポイント | 制限 |
|---------------|------|
| GET /api/v1/analytics/aggregated-stats | 100リクエスト/時間 |
| POST /api/v1/analytics/group-data | 10リクエスト/時間 |

### 4.2 監査ログ

すべてのAPIアクセスを記録します。

```typescript
interface AuditLog {
  timestamp: Date;
  requester: string;              // "staff-card-system"
  endpoint: string;               // "/api/v1/analytics/aggregated-stats"
  method: string;                 // "GET" or "POST"
  params: Record<string, any>;    // リクエストパラメータ
  ipAddress: string;              // 203.0.113.10
  userAgent: string;
  responseTime: number;           // ミリ秒
  statusCode: number;             // 200, 400, 401, etc.
  dataSize: number;               // バイト
}
```

**保管期限**: 5年間

### 4.3 異常検知

以下のパターンを検知します：

| パターン | 閾値 | アクション |
|---------|------|-----------|
| **大量アクセス** | 200リクエスト/時間 | 自動ブロック + アラート |
| **異常なパラメータ** | - | アラート |
| **認証失敗連続** | 5回/10分 | 一時的ブロック |
| **レスポンスタイム異常** | 5秒以上 | アラート |

---

## 5. 実装スケジュール

### 5.1 VoiceDrive側の実装計画

```
Phase 1: 集計APIエンドポイント実装（Week 1-2）
├─ Day 1-3: API実装
│  ├─ エンドポイント作成
│  ├─ 集計ロジック実装
│  └─ レスポンスフォーマット整備
├─ Day 4-5: 認証・セキュリティ実装
│  ├─ JWT認証
│  ├─ IPホワイトリスト
│  └─ レート制限
└─ Day 6-7: テスト
   ├─ 単体テスト
   └─ セキュリティテスト

Phase 2: 受信APIエンドポイント実装（Week 3）
├─ Day 1-3: API実装
│  ├─ エンドポイント作成
│  ├─ バリデーション実装
│  └─ データベース保存ロジック
├─ Day 4-5: 監査ログ実装
│  └─ アクセスログ記録
└─ Day 6-7: テスト
   └─ 統合テスト

Phase 3: 統合テスト（Week 4）
├─ Day 1-3: 職員カルテシステムとの統合テスト
│  ├─ 集計APIテスト
│  ├─ 受信APIテスト
│  └─ エラーハンドリングテスト
├─ Day 4-5: パフォーマンステスト
│  └─ 負荷テスト
└─ Day 6-7: セキュリティテスト
   ├─ 認証テスト
   └─ 異常系テスト

Phase 4: 本番リリース（Week 5）
├─ Day 1-2: 本番環境デプロイ
├─ Day 3-5: 監視・モニタリング
└─ Day 6-7: 最終確認
```

### 5.2 タイムライン

```
現在: 2025年10月7日

Phase 7（人事お知らせ統合）: 10月中旬〜下旬（完了予定）
  ↓
Phase 7.5（ボイス分析API実装）: 11月上旬〜中旬（4週間）
  - Week 1-2: 集計APIエンドポイント実装
  - Week 3: 受信APIエンドポイント実装
  - Week 4: 統合テスト
  ↓
本番リリース: 2025年12月上旬

【並行して職員カルテシステム側で実施】
  - ローカルLLM基盤での感情分析実装
  - 日次バッチ送信機能実装
  - K-匿名性チェック強化
```

---

## 6. API仕様の最終確認事項

### 6.1 確認事項

以下の点について、貴チームとの最終確認をお願いいたします：

#### 確認1: データ更新頻度

**VoiceDrive側の希望**:
- 日次バッチ（毎日深夜2:00）✅

**確認内容**:
- 上記の頻度で問題ないでしょうか？
- 初回データ送信はいつ頃を想定されていますか？

#### 確認2: 集計APIのデータ範囲

**質問**:
- 過去データはどこまで遡って集計可能でしょうか？
- 最大何ヶ月分のデータを一度にリクエスト可能でしょうか？

**VoiceDrive側の希望**:
- 最大3ヶ月分を一度にリクエスト可能

#### 確認3: ローカルLLM分析の精度

**質問**:
- Llama 3.2 8Bでの感情分析精度の目標値は何%でしょうか？
- トピック分析のキーワード数は何件程度を想定されていますか？

**VoiceDrive側の希望**:
- 感情分析精度: 85%以上
- トップキーワード: TOP 20
- 新興トピック: TOP 10

#### 確認4: エラーハンドリング

**質問**:
- ローカルLLM障害時のフォールバック戦略はどうされますか？
- 分析スキップ or リトライ or エラー通知？

**VoiceDrive側の提案**:
- 感情分析・トピック分析が失敗した場合でも、基本統計のみ送信

---

## 7. 今後のアクション

### 7.1 短期（10/8-10/10）

#### VoiceDrive側
- [x] 本回答書の送付
- [ ] 仕様調整ミーティング（Slack or Zoom）
- [ ] 最終仕様の合意

#### 職員カルテシステム側
- [ ] 本回答書の確認
- [ ] 確認事項への回答
- [ ] 仕様調整ミーティング参加

### 7.2 中期（11月上旬〜中旬）

#### VoiceDrive側
- [ ] 集計APIエンドポイント実装
- [ ] 受信APIエンドポイント実装
- [ ] セキュリティ実装
- [ ] テスト

#### 職員カルテシステム側
- [ ] ローカルLLM感情分析実装
- [ ] 日次バッチ送信機能実装
- [ ] 集計APIとの連携実装

### 7.3 長期（11月下旬〜12月上旬）

#### 両チーム合同
- [ ] 統合テスト
- [ ] パフォーマンステスト
- [ ] セキュリティテスト
- [ ] 本番リリース

---

## 8. 連絡先・対応窓口

### VoiceDrive開発チーム

- **Slack**: `#voicedrive-dev`
- **Email**: voicedrive-dev@example.com
- **MCPサーバー**: `mcp-shared/docs/`
- **担当者**: VoiceDriveプロジェクトリード

### 対応期限

**仕様調整ミーティング**: 2025年10月10日（木）までに実施希望

以下のいずれかの方法でご連絡いただけますと幸いです：
- Slackで日程調整
- MCPサーバー経由でのドキュメント共有

---

## 9. まとめ

### 9.1 決定事項

| 項目 | 決定内容 |
|------|---------|
| **データアクセス方法** | ✅ 方法B（集計API提供） |
| **感情分析実装** | ✅ 職員カルテシステム側のローカルLLM（Llama 3.2 8B） |
| **データ送信方式** | ✅ プッシュ型（日次バッチ） |
| **更新頻度** | ✅ 日次（毎日深夜2:00） |
| **認証方式** | ✅ JWT + IPホワイトリスト + レート制限 |

### 9.2 期待される効果

| 効果 | 内容 |
|------|------|
| **セキュリティ** | 最小権限の原則、完全なアクセス制御、詳細な監査ログ |
| **プライバシー** | ローカルLLM処理による投稿内容の外部流出ゼロ |
| **コスト** | VoiceDrive側でのLLM構築不要（追加コストゼロ） |
| **品質** | Llama 3.2 8Bによる高精度分析（90-95%） |
| **可用性** | 24時間365日の分析基盤（既存基盤活用） |

### 9.3 次のステップ

1. **仕様調整ミーティング**（10/8-10/10）
2. **VoiceDrive側実装開始**（11月上旬）
3. **統合テスト**（11月下旬）
4. **本番リリース**（12月上旬）

---

**ご確認のほど、よろしくお願いいたします。**

**VoiceDrive開発チーム一同**
**2025年10月7日**
