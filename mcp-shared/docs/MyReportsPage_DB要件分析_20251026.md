# MyReportsPage DB要件分析

**作成日**: 2025年10月26日
**対象ページ**: MyReportsPage（コンプライアンス通報履歴）
**URL**: https://voicedrive-v100.vercel.app/my-reports
**分析者**: VoiceDrive開発チーム

---

## 📋 エグゼクティブサマリー

MyReportsPageは、職員が自分自身で送信した**コンプライアンス通報**（内部通報・ホイッスルブロー）の履歴を確認し、医療システムからの受付確認や調査状況をトラッキングするためのページです。

### 主要機能
1. ✅ 通報履歴一覧表示（フィルター機能付き）
2. ✅ 受付確認通知の表示
3. ✅ 統計情報の可視化（カテゴリー別、ステータス別）
4. ✅ 通報詳細の閲覧

### データ管理責任

| カテゴリ | VoiceDrive責任 | 医療システム責任 |
|---------|---------------|----------------|
| 通報データ管理 | 100% | 0% |
| 受付確認通知 | 50%（受信・表示） | 50%（送信） |
| 調査状況更新 | 0% | 100% |
| 統計集計 | 100% | 0% |

---

## 🔍 ページ機能の詳細分析

### 1. 通報履歴一覧タブ

#### 表示内容
- 通報ID（例: RPT-2025-001）
- 匿名ID（例: ANON-8F3A2B）
- タイトル
- カテゴリー（6種類: ハラスメント、安全管理、財務・会計、コンプライアンス、差別・不公正、その他）
- 緊急度（critical/high/medium/low）
- ステータス（6段階: 受付完了→分類中→調査中→エスカレーション→対応完了→案件終了）
- 送信日時
- 最終更新日時
- 医療システムケース番号（連携時）
- 受付確認状態
- 対応予定時間

#### フィルター機能
- ステータス別フィルター
- カテゴリー別フィルター

#### 必要なデータソース
| データ項目 | 現在の状態 | 必要なテーブル/API |
|-----------|----------|------------------|
| 通報リスト | ❌ デモデータ | WhistleblowingReport テーブル（新規） |
| フィルター機能 | ✅ フロントエンド実装済み | なし |
| 通報詳細へのナビゲーション | ✅ 実装済み | なし |

---

### 2. 受付確認通知エリア

#### 表示内容
- 医療システムケース番号（例: MED-2025-0001）
- 緊急度アイコン（🔴🟠🟡🟢）
- 対応予定時間（例: "1時間以内"、"当日中"）
- 受付日時
- 現在の状況説明
- 次のステップ
- 即時対応フラグ

#### 必要なデータソース
| データ項目 | 現在の状態 | 必要なテーブル/API |
|-----------|----------|------------------|
| 受付確認通知 | ✅ ComplianceAcknowledgement テーブル存在 | API実装必要 |
| 医療システム連携 | ✅ Webhook受信エンドポイント存在 | なし |

---

### 3. 統計情報タブ

#### サマリーカード（4つ）
1. **総通報数**: 全通報件数
2. **調査中**: ステータス='investigating'の件数
3. **対応完了**: ステータス='resolved' or 'closed'の件数
4. **受付確認済**: acknowledgementReceived=trueの件数

#### カテゴリー別統計
- 各カテゴリーの件数と割合
- プログレスバー表示

#### ステータス別統計
- 各ステータスの件数と割合
- プログレスバー表示

#### 必要なデータソース
| データ項目 | 現在の状態 | 必要なテーブル/API |
|-----------|----------|------------------|
| 統計集計 | ❌ デモデータ | WhistleblowingReport テーブルから集計 |
| 月次トレンド | ❌ 未実装 | MonthlyComplianceStats テーブル（新規検討） |

---

## 🗄️ データベース要件

### 必要なテーブル

#### 1. WhistleblowingReport テーブル（新規作成必須）

| フィールド名 | 型 | 説明 | デフォルト値 | 必須 | VD責任 | 医療責任 |
|------------|---|------|------------|-----|--------|---------|
| id | String | 通報ID（RPT-YYYY-NNN形式） | cuid() | ✅ | 100% | 0% |
| userId | String? | 送信者ID（匿名の場合null） | null | ❌ | 100% | 0% |
| anonymousId | String | 匿名ID（ANON-XXXXXX形式） | 自動生成 | ✅ | 100% | 0% |
| category | String | カテゴリー | - | ✅ | 100% | 0% |
| severity | String | 緊急度 | 'medium' | ✅ | 100% | 0% |
| title | String | タイトル | - | ✅ | 100% | 0% |
| content | String | 内容 | - | ✅ | 100% | 0% |
| evidenceFiles | Json? | 証拠ファイルURL配列 | null | ❌ | 100% | 0% |
| submittedAt | DateTime | 送信日時 | now() | ✅ | 100% | 0% |
| updatedAt | DateTime | 更新日時 | now() | ✅ | 100% | 0% |
| status | String | ステータス | 'received' | ✅ | 100% | 0% |
| assignedInvestigators | Json? | 担当調査員 | null | ❌ | 0% | 100% |
| escalationReason | String? | エスカレーション理由 | null | ❌ | 0% | 100% |
| resolutionSummary | String? | 対応結果サマリー | null | ❌ | 0% | 100% |
| followUpRequired | Boolean | フォローアップ必要 | false | ✅ | 0% | 100% |
| isAnonymous | Boolean | 匿名通報フラグ | true | ✅ | 100% | 0% |
| priority | Int | 優先度（1-10） | 5 | ✅ | 0% | 100% |
| medicalSystemCaseNumber | String? | 医療システムケース番号 | null | ❌ | 0% | 100% |
| acknowledgementReceived | Boolean | 受付確認済みフラグ | false | ✅ | 50% | 50% |
| acknowledgementDate | DateTime? | 受付確認日時 | null | ❌ | 0% | 100% |
| estimatedResponseTime | String? | 対応予定時間 | null | ❌ | 0% | 100% |
| contactMethod | String? | 連絡方法 | null | ❌ | 100% | 0% |
| contactInfo | String? | 連絡先情報 | null | ❌ | 100% | 0% |
| expectedOutcome | String? | 期待する結果 | null | ❌ | 100% | 0% |
| createdAt | DateTime | 作成日時 | now() | ✅ | 100% | 0% |

**インデックス**:
```prisma
@@index([userId])
@@index([anonymousId])
@@index([category])
@@index([status])
@@index([severity])
@@index([medicalSystemCaseNumber])
@@index([submittedAt])
```

---

#### 2. InvestigationNote テーブル（新規作成推奨）

| フィールド名 | 型 | 説明 | デフォルト値 | 必須 | VD責任 | 医療責任 |
|------------|---|------|------------|-----|--------|---------|
| id | String | ノートID | cuid() | ✅ | 0% | 100% |
| reportId | String | 通報ID | - | ✅ | 0% | 100% |
| authorRole | String | 作成者役割 | - | ✅ | 0% | 100% |
| authorName | String | 作成者名 | - | ✅ | 0% | 100% |
| content | String | 内容 | - | ✅ | 0% | 100% |
| isConfidential | Boolean | 機密フラグ | true | ✅ | 0% | 100% |
| actionItems | Json? | アクションアイテム | null | ❌ | 0% | 100% |
| createdAt | DateTime | 作成日時 | now() | ✅ | 0% | 100% |
| updatedAt | DateTime | 更新日時 | now() | ✅ | 0% | 100% |

**インデックス**:
```prisma
@@index([reportId])
@@index([createdAt])
```

---

#### 3. ComplianceAcknowledgement テーブル（既存）

✅ **既に存在** - 医療システムからの受付確認通知を保存

現在のフィールド:
- id
- reportId
- medicalSystemCaseNumber
- anonymousId
- severity
- category
- receivedAt
- estimatedResponseTime
- requiresImmediateAction
- currentStatus
- nextSteps
- webhookReceivedAt
- processed
- processedAt
- createdAt
- updatedAt

**必要な変更**: なし（現状のまま使用可能）

---

## 🔌 必要なAPI

### VoiceDrive側で実装が必要なAPI

#### 1. 通報履歴取得API
```
GET /api/whistleblowing/reports
```
**クエリパラメータ**:
- `userId`: ユーザーID（自分の通報のみ取得）
- `status`: ステータスフィルター（optional）
- `category`: カテゴリーフィルター（optional）
- `limit`: 取得件数（default: 50）
- `offset`: オフセット（ページネーション用）

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "RPT-2025-001",
      "anonymousId": "ANON-8F3A2B",
      "category": "harassment",
      "severity": "high",
      "title": "パワーハラスメントの相談",
      "content": "上司からの不適切な発言が...",
      "submittedAt": "2025-10-01T10:30:00Z",
      "updatedAt": "2025-10-02T14:20:00Z",
      "status": "investigating",
      "medicalSystemCaseNumber": "MED-2025-0001",
      "acknowledgementReceived": true,
      "acknowledgementDate": "2025-10-01T11:00:00Z",
      "estimatedResponseTime": "当日中"
    }
  ],
  "count": 3,
  "total": 3
}
```

---

#### 2. 通報詳細取得API
```
GET /api/whistleblowing/reports/:reportId
```
**レスポンス**: 通報の詳細情報（InvestigationNoteは機密扱いのため除外）

---

#### 3. 通報送信API
```
POST /api/whistleblowing/reports
```
**リクエストボディ**:
```json
{
  "category": "harassment",
  "title": "パワーハラスメントの相談",
  "content": "詳細な内容...",
  "isAnonymous": true,
  "contactMethod": "email",
  "contactInfo": "example@example.com",
  "evidenceDescription": "証拠の説明",
  "expectedOutcome": "改善を期待します"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "RPT-2025-004",
    "anonymousId": "ANON-9E4C3D",
    "submittedAt": "2025-10-26T15:00:00Z"
  },
  "message": "通報を受け付けました。匿名IDを記録してください。"
}
```

---

#### 4. 受付確認通知取得API
```
GET /api/whistleblowing/acknowledgements
```
**クエリパラメータ**:
- `anonymousId`: 匿名ID（自分の通報の受付確認のみ取得）

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "reportId": "RPT-2025-003",
      "anonymousId": "ANON-2A7F4C",
      "medicalSystemCaseNumber": "MED-2025-0003",
      "severity": "critical",
      "category": "コンプライアンス",
      "receivedAt": "2025-10-03T08:30:00Z",
      "estimatedResponseTime": "1時間以内",
      "requiresImmediateAction": true,
      "currentStatus": "緊急対応チームによる初動調査を開始",
      "nextSteps": "担当者による聞き取り調査を実施予定です。"
    }
  ]
}
```

---

#### 5. 通報統計取得API
```
GET /api/whistleblowing/statistics
```
**クエリパラメータ**:
- `userId`: ユーザーID（自分の統計のみ）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "totalReports": 3,
    "byCategory": {
      "harassment": 1,
      "safety": 1,
      "compliance": 1
    },
    "byStatus": {
      "received": 0,
      "triaging": 1,
      "investigating": 1,
      "resolved": 1
    },
    "bySeverity": {
      "critical": 1,
      "high": 1,
      "medium": 1,
      "low": 0
    },
    "acknowledgementRate": 100
  }
}
```

---

### 医療システム側で実装が必要なAPI

#### 1. 通報ステータス更新Webhook（受信）
```
POST /api/webhooks/voicedrive/whistleblowing/report
```
**VoiceDriveから医療システムへ送信**

**ペイロード**:
```json
{
  "reportId": "RPT-2025-004",
  "anonymousId": "ANON-9E4C3D",
  "category": "harassment",
  "severity": "high",
  "title": "パワーハラスメントの相談",
  "submittedAt": "2025-10-26T15:00:00Z",
  "isAnonymous": true
}
```

**期待レスポンス**:
```json
{
  "success": true,
  "caseNumber": "MED-2025-0004",
  "estimatedResponseTime": "当日中"
}
```

---

#### 2. 通報ステータス更新Webhook（送信）
```
POST /api/webhooks/medical-system/whistleblowing/status-update
```
**医療システムからVoiceDriveへ送信**

**ペイロード**:
```json
{
  "reportId": "RPT-2025-001",
  "caseNumber": "MED-2025-0001",
  "status": "investigating",
  "assignedInvestigators": ["hr_specialist", "management"],
  "updatedAt": "2025-10-26T16:00:00Z",
  "nextSteps": "担当者による聞き取り調査を実施します"
}
```

---

#### 3. 調査完了通知Webhook（送信）
```
POST /api/webhooks/medical-system/whistleblowing/resolution
```
**医療システムからVoiceDriveへ送信**

**ペイロード**:
```json
{
  "reportId": "RPT-2025-001",
  "caseNumber": "MED-2025-0001",
  "status": "resolved",
  "resolutionSummary": "対策を実施しました。ご報告ありがとうございました。",
  "resolvedAt": "2025-10-30T10:00:00Z"
}
```

---

## 📊 データフロー

### 通報送信フロー

```
職員（MyReportsPage）
  ↓ POST /api/whistleblowing/reports
VoiceDrive DB（WhistleblowingReport作成）
  ↓ Webhook送信
医療システム
  ↓ ケース番号発行
  ↓ POST /api/webhooks/medical-system/whistleblowing/acknowledgement
VoiceDrive DB（ComplianceAcknowledgement作成）
  ↓
職員へ通知表示（MyReportsPage）
```

---

### 調査状況更新フロー

```
医療システム（調査進行）
  ↓ POST /api/webhooks/medical-system/whistleblowing/status-update
VoiceDrive DB（WhistleblowingReport更新）
  ↓
職員へ通知（プッシュ通知 or メール）
  ↓
職員がMyReportsPageで確認
```

---

## ⚠️ 不足項目の洗い出し

### 1. データベーススキーマ

| 項目 | 現在の状態 | 必要な対応 |
|-----|----------|----------|
| WhistleblowingReport テーブル | ❌ 存在しない | 🔴 **新規作成必須** |
| InvestigationNote テーブル | ❌ 存在しない | 🟡 **推奨（Phase 2）** |
| ComplianceAcknowledgement テーブル | ✅ 存在 | ✅ そのまま使用可能 |

---

### 2. API実装

| API | 現在の状態 | 必要な対応 |
|-----|----------|----------|
| GET /api/whistleblowing/reports | ❌ 未実装 | 🔴 **実装必須** |
| GET /api/whistleblowing/reports/:id | ❌ 未実装 | 🔴 **実装必須** |
| POST /api/whistleblowing/reports | ❌ 未実装 | 🔴 **実装必須** |
| GET /api/whistleblowing/acknowledgements | ❌ 未実装 | 🔴 **実装必須** |
| GET /api/whistleblowing/statistics | ❌ 未実装 | 🟡 **推奨** |
| POST /api/webhooks/medical-system/whistleblowing/status-update | ❌ 未実装 | 🔴 **実装必須** |
| POST /api/webhooks/medical-system/whistleblowing/resolution | ❌ 未実装 | 🔴 **実装必須** |

---

### 3. フロントエンド実装

| 機能 | 現在の状態 | 必要な対応 |
|-----|----------|----------|
| 通報履歴一覧 | ✅ UI実装済み | 🔴 API統合必要 |
| 受付確認通知 | ✅ UI実装済み | 🔴 API統合必要 |
| 統計情報 | ✅ UI実装済み | 🔴 API統合必要 |
| 通報詳細ページ | ❌ 未実装 | 🟡 **Phase 2で実装** |

---

### 4. 医療システム連携

| 連携項目 | 現在の状態 | 必要な対応 |
|---------|----------|----------|
| 通報受信Webhook | ❌ 未確認 | 🔴 **医療システムチームへ確認** |
| 受付確認送信Webhook | ✅ VoiceDrive側受信エンドポイント存在 | ✅ 実装済み |
| ステータス更新Webhook | ❌ 未実装 | 🔴 **実装必須** |
| 調査完了通知Webhook | ❌ 未実装 | 🔴 **実装必須** |

---

## 🎯 実装優先度

### Phase 1: 基本機能（1週間）

| 優先度 | 項目 | 工数見積 |
|--------|------|---------|
| 🔴 最優先 | WhistleblowingReportテーブル作成 | 2時間 |
| 🔴 最優先 | POST /api/whistleblowing/reports（通報送信） | 4時間 |
| 🔴 最優先 | GET /api/whistleblowing/reports（履歴取得） | 3時間 |
| 🔴 最優先 | Webhook送信（VD→医療システム） | 3時間 |
| 🔴 最優先 | フロントエンドAPI統合 | 4時間 |

**合計**: 16時間（2日）

---

### Phase 2: 統計機能（1週間）

| 優先度 | 項目 | 工数見積 |
|--------|------|---------|
| 🟡 推奨 | GET /api/whistleblowing/statistics | 3時間 |
| 🟡 推奨 | 統計タブAPI統合 | 2時間 |
| 🟡 推奨 | InvestigationNoteテーブル作成 | 2時間 |
| 🟡 推奨 | 通報詳細ページ実装 | 6時間 |

**合計**: 13時間（1.5日）

---

### Phase 3: 医療システム連携強化（1週間）

| 優先度 | 項目 | 工数見積 |
|--------|------|---------|
| 🔴 最優先 | ステータス更新Webhook受信 | 3時間 |
| 🔴 最優先 | 調査完了通知Webhook受信 | 3時間 |
| 🟡 推奨 | プッシュ通知連携 | 4時間 |
| 🟡 推奨 | メール通知連携 | 4時間 |

**合計**: 14時間（2日）

---

## 🔐 セキュリティ要件

### 匿名性の保護

1. **匿名ID生成**: ユーザーIDから推測不可能な一意のID
   ```typescript
   const anonymousId = `ANON-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
   ```

2. **アクセス制御**:
   - 職員は自分の通報のみ閲覧可能
   - 管理者（Level 99）は全通報を閲覧可能
   - 調査員は割り当てられた通報のみ閲覧可能

3. **データ暗号化**:
   - 証拠ファイルはS3等に暗号化保存
   - 連絡先情報は暗号化してDB保存

4. **監査ログ**:
   - 通報の閲覧履歴を記録
   - 調査ノートの編集履歴を記録

---

## 📝 医療システムチームへの確認事項

### 1. Webhook仕様の確認

**質問**:
- 通報受信WebhookのエンドポイントURLは？
- Webhook署名方式は？（HMAC-SHA256推奨）
- リトライポリシーは？

### 2. ステータス更新の頻度

**質問**:
- 調査状況の更新頻度は？（リアルタイム or バッチ？）
- VoiceDrive側でポーリングが必要か？

### 3. 調査ノートの共有

**質問**:
- InvestigationNoteを職員に公開するか？
- 公開する場合、どこまで公開するか？

---

## ✅ 結論

### 実装が必要な項目

1. ✅ **WhistleblowingReportテーブル作成** - Phase 1必須
2. ✅ **通報送信・取得API実装** - Phase 1必須
3. ✅ **Webhook連携実装** - Phase 1必須
4. ✅ **フロントエンドAPI統合** - Phase 1必須
5. 🟡 **統計機能API実装** - Phase 2推奨
6. 🟡 **通報詳細ページ実装** - Phase 2推奨

### 医療システムチームへの依頼

1. 🔴 通報受信Webhookエンドポイント実装
2. 🔴 受付確認Webhook送信実装（既存を確認）
3. 🔴 ステータス更新Webhook送信実装
4. 🔴 調査完了通知Webhook送信実装

---

**次のステップ**: 暫定マスターリスト作成 → schema.prisma更新 → API実装

---

**作成者**: VoiceDrive開発チーム
**最終更新**: 2025年10月26日
**バージョン**: 1.0
