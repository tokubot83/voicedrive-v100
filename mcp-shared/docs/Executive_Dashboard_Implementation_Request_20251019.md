# エグゼクティブダッシュボード実装依頼書

**文書番号**: ED-REQ-2025-1019-001
**作成日**: 2025年10月19日
**作成者**: VoiceDriveチーム
**宛先**: 医療職員管理システムチーム
**件名**: レポートセンターページへのエグゼクティブダッシュボード追加依頼
**重要度**: 🟡 中
**ステータス**: 依頼中

---

## 📋 エグゼクティブサマリー

VoiceDriveシステムの**エグゼクティブダッシュボード**機能を、医療職員管理システムの**レポートセンターページ**に追加実装していただきたく、ご依頼申し上げます。

本機能は、**ボイス分析ページと同じ構成**で実装され、VoiceDriveからデータを取得し、医療システム側でLLM分析を実施し、結果をVoiceDriveに送信する方式となります。

---

## 🎯 実装場所

### レポートセンターページに追加

医療職員管理システムの**レポートセンターページ**に、新規項目として「**エグゼクティブダッシュボード**」を追加してください。

**ボイス分析ページと同じ構成**:
- レポートセンターページ
  - ✅ ボイス分析（既存）
  - 🆕 **エグゼクティブダッシュボード**（新規追加）

---

## 🔄 データフロー（ボイス分析と同じ方式）

### Phase 1: データ提供API（VoiceDrive側）

VoiceDriveが以下のAPIを提供します：

#### **エンドポイント**: `GET /api/v1/executive/dashboard-data`

**提供データ**:
```json
{
  "period": "2025-10",
  "facilities": [
    {
      "facilityCode": "H001",
      "facilityName": "本院",
      "stats": {
        "totalPosts": 342,
        "agendaCreated": 85,
        "committeeSubmitted": 28,
        "resolved": 45,
        "participationRate": 68,
        "resolutionRate": 55,
        "avgResolutionDays": 42
      },
      "departments": [
        {
          "name": "看護部",
          "posts": 128,
          "agendas": 32,
          "activeScore": 85,
          "trend": "up"
        }
      ],
      "alerts": [
        {
          "type": "risk",
          "severity": "high",
          "title": "看護部でネガティブ投稿急増",
          "description": "シフト調整に関する不満が3件連続",
          "department": "看護部",
          "affectedCount": 12
        }
      ],
      "projects": {
        "inProgress": 12,
        "completed": 8,
        "delayed": 3,
        "avgProgress": 65
      }
    }
  ],
  "trends": {
    "monthly": [
      {
        "month": "2025-10",
        "totalPosts": 342,
        "participationRate": 68,
        "resolutionRate": 55
      }
    ]
  }
}
```

---

### Phase 2: LLM分析実装（医療システム側）

**ボイス分析と同じLlama 3.2 8Bを使用**して、以下の戦略分析を実施してください：

#### 分析内容

1. **施設間比較分析**
   - 各施設の参加率・解決率を比較
   - パフォーマンスの高い施設と低い施設の特定

2. **原因特定**
   - なぜ参加率が低いのか？
   - なぜ解決率が低下しているのか？
   - アラートが発生している根本原因は何か？

3. **推奨アクション生成**
   - 優先対応事項のリスト化
   - 具体的なアクションプラン提案
   - 実施スケジュール提案

4. **ベストプラクティス抽出**
   - 高パフォーマンス施設の成功要因分析
   - 他施設への横展開可能な施策の特定

5. **予測分析**
   - 現在のトレンドが継続した場合の予測
   - 早期対応による改善見込み

6. **中長期戦略提案**
   - 法人全体での改善施策
   - データドリブン経営の強化策

#### 分析結果の例

```json
{
  "analysisDate": "2025-10-19",
  "insights": [
    {
      "type": "priority_action",
      "severity": "high",
      "title": "施設Bの事務部門活性度低下",
      "analysis": "投稿数18件（他部門の半分以下）、参加率55%（下降傾向）",
      "rootCause": "業務負荷が高く投稿する時間がない可能性",
      "recommendedActions": [
        "部門長との1on1面談実施",
        "業務負荷の確認",
        "声を上げやすい環境づくり"
      ],
      "bestPractice": {
        "source": "施設C",
        "method": "月1回のミニ懇談会",
        "result": "参加率71%達成"
      },
      "expectedImpact": "3ヶ月以内に参加率65%まで回復見込み",
      "urgency": "2週間以内に対応推奨"
    }
  ],
  "predictions": [
    {
      "metric": "施設B参加率",
      "currentValue": 52,
      "predictedValue": 45,
      "timeframe": "3ヶ月後",
      "confidence": 78,
      "condition": "現状維持の場合"
    },
    {
      "metric": "施設B参加率",
      "currentValue": 52,
      "predictedValue": 65,
      "timeframe": "6ヶ月後",
      "confidence": 82,
      "condition": "推奨アクション実施時"
    }
  ],
  "strategicRecommendations": [
    {
      "category": "組織文化",
      "title": "法人全体での「声の文化」醸成",
      "actions": [
        "成功事例の共有会（月1回）",
        "施設間ベンチマーク導入",
        "表彰制度の導入"
      ],
      "expectedOutcome": "参加率全体で10%向上",
      "timeline": "6ヶ月"
    },
    {
      "category": "データ活用",
      "title": "データドリブン経営の強化",
      "actions": [
        "月次KPIダッシュボードの定着",
        "理事会での定期報告",
        "PDCAサイクルの確立"
      ],
      "expectedOutcome": "意思決定速度30%向上",
      "timeline": "3ヶ月"
    }
  ],
  "successCases": [
    {
      "facilityName": "施設C",
      "metric": "解決率",
      "value": 62,
      "industry_avg": 55,
      "keyFactors": [
        "月次進捗レポートで可視化",
        "小規模でも確実に実行",
        "職員へのフィードバックを徹底"
      ],
      "recommendation": "他施設でも導入検討を推奨"
    }
  ]
}
```

---

### Phase 3: 分析結果送信（医療システム側）

分析完了後、以下のAPIに結果を送信してください：

#### **エンドポイント**: `POST /api/v1/executive/strategic-insights`

**Request Body**: 上記の分析結果JSON

**Response**:
```json
{
  "success": true,
  "insightId": "insight-001",
  "receivedAt": "2025-10-19T10:30:00Z"
}
```

---

## 🗄️ VoiceDrive側の実装状況

### 既に実装済み

✅ **経営概要タブ**（リニューアル完了）:
- 月次KPIサマリー（7指標）
- 重要アラート表示
- 部門別パフォーマンス
- プロジェクト進捗状況
- 重要トピックTOP5
- 次回理事会アジェンダ

✅ **戦略分析タブ**（既存）:
- ExecutivePostingAnalytics（既存の戦略分析コンポーネント）
- 将来的にLLM分析結果を統合予定

### これから実装（医療システムとの連携後）

🔜 **データ提供API**:
- `GET /api/v1/executive/dashboard-data`

🔜 **分析結果受信API**:
- `POST /api/v1/executive/strategic-insights`

🔜 **新規テーブル**:
```prisma
model ExecutiveStrategicInsight {
  id                   String   @id @default(cuid())
  analysisDate         DateTime
  insightType          String   // "priority_action" | "success_case" | "prediction"
  severity             String?  // "low" | "medium" | "high"
  title                String
  analysis             String
  rootCause            String?
  recommendedActions   Json     // string[]
  bestPractice         Json?    // { source, method, result }
  predictions          Json?    // { metric, current, predicted, timeframe }
  isAcknowledged       Boolean  @default(false)
  acknowledgedBy       String?
  acknowledgedAt       DateTime?
  createdAt            DateTime @default(now())
}
```

---

## 📅 実装スケジュール提案

### Phase 1: VoiceDrive側準備（1週間）
- データ提供API実装
- 分析結果受信API実装
- 新規テーブル作成

### Phase 2: 医療システム側実装（2-3週間）
- レポートセンターページに「エグゼクティブダッシュボード」項目追加
- データ取得バッチ処理実装
- Llama 3.2 8Bによる戦略分析実装
- 分析結果送信バッチ処理実装

### Phase 3: 統合テスト（1週間）
- データ取得確認
- LLM分析精度確認
- 分析結果受信確認

### Phase 4: 本番リリース
- ステージング環境テスト
- 本番環境デプロイ

---

## 🔒 セキュリティとプライバシー

**ボイス分析と同じセキュリティレベル**:

✅ **k-匿名性保証**
- 個人特定不可の集計データのみ提供
- 最小グループサイズ: 5名以上

✅ **JWT認証**
- システム識別トークン使用
- Bearer Token方式

✅ **IPホワイトリスト**
- 医療システムIPのみ許可

✅ **監査ログ**
- 全APIアクセスを記録
- 5年保持

✅ **ローカルLLM使用**
- Llama 3.2 8B（医療システム内部）
- データが外部に送信されない

---

## 💬 ボイス分析との違い

| 項目 | ボイス分析 | エグゼクティブダッシュボード |
|------|-----------|---------------------------|
| **対象ユーザー** | 人事部門（Level 14-17） | 経営層（Level 12+） |
| **目的** | 職員の声の詳細分析 | 組織全体の健康状態把握と戦略判断 |
| **分析内容** | 投稿分析・感情分析・キーワード分析 | 施設間比較・原因特定・推奨アクション・予測分析 |
| **表示形式** | 詳細データ + グラフ | サマリー + 戦略提案 |
| **データ範囲** | 投稿データのみ | 投稿 + プロジェクト進捗 + 施設別比較 |

---

## 📞 連絡先

**VoiceDriveチーム**
- Slack: `#phase2-integration`
- MCPサーバー: `mcp-shared/docs/`

**質問事項**:
- 実装スケジュールの調整
- LLM分析の詳細仕様
- データ提供APIのフォーマット確認

---

## 📝 補足事項

### ボイス分析との共通点
✅ 同じデータフロー（VoiceDrive → 医療システム → VoiceDrive）
✅ 同じLLM（Llama 3.2 8B）
✅ 同じセキュリティ対策
✅ レポートセンターページに並列配置

### 追加される価値
✅ 経営層向けの戦略的意思決定支援
✅ 施設間比較による改善機会の発見
✅ 予測分析による先手対応
✅ ベストプラクティスの横展開

---

**本依頼書について、ご確認・ご検討のほどよろしくお願いいたします。**

**VoiceDriveチーム**
2025年10月19日
