# Dashboard 暫定マスターリスト

**文書番号**: VD-MASTER-DASHBOARD-2025-1009-001
**作成日**: 2025年10月9日
**対象**: 医療職員管理システムチーム
**目的**: Dashboard機能に必要なマスターデータおよびAPI要求の共有
**参照文書**: [Dashboard_DB要件分析_20251009.md](./Dashboard_DB要件分析_20251009.md)

---

## 📋 概要

VoiceDrive Dashboardページの実装に必要なマスターデータとAPI要求をまとめました。
医療システム側で以下を実装いただく必要があります：

- ✅ **既存API拡張**: 1つ（API-1: 職員情報取得）
- ⚠️ **新規API**: 2つ（API-2: 経験年数、API-3: 部署効率）
- ⚠️ **VoiceDriveからの受信API**: 1つ（API-4: 活動統計）
- 🔵 **マスターデータ**: 提供済み（追加なし）

---

## 🎯 API要求一覧

### API-1: 職員情報取得API（拡張）

**エンドポイント**: `GET /api/employees/{employeeId}`

**現状**: ✅ 実装済み

**拡張要求**: `permission`オブジェクトの追加

```json
{
  "employeeId": "OH-NS-2024-001",
  "name": "山田 花子",
  "email": "hanako.yamada@obara-hospital.jp",
  "department": "内科",
  "facility": "小原病院",
  "profession": "看護師",
  "position": "主任",
  "permissionLevel": 6.0,
  "canPerformLeaderDuty": false,

  // ← 以下を追加
  "permission": {
    "level": 6.0,
    "calculatedLevel": 6.2,
    "availableMenus": [
      "personal_station",
      "department_board",
      "team_dashboard"
    ],
    "isNewcomer": false,
    "isManager": false,
    "isSystemAdmin": false,
    "canAccessAnalytics": false
  }
}
```

**データソース**:
- `Employee.permissionLevel` → permission.level
- V3評価計算値 → permission.calculatedLevel
- 権限レベルから算出 → permission.availableMenus
- 経験年数・権限判定 → permission.isNewcomer
- 役職・権限判定 → permission.isManager
- 特権フラグ → permission.isSystemAdmin
- 権限レベル判定 → permission.canAccessAnalytics

**優先度**: 🔴 HIGH
**納期希望**: 2週間以内
**影響範囲**: Dashboard全体の表示制御

---

### API-2: 経験年数取得API（新規）

**エンドポイント**: `GET /api/employees/{employeeId}/experience-summary`

**現状**: ❌ 未実装

**レスポンス例**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "totalExperienceYears": 8.2,
  "yearsOfService": 4.5,
  "currentPositionYears": 2.1,
  "specialtyExperienceYears": 6.5,
  "calculatedAt": "2025-10-09T10:00:00Z"
}
```

**フィールド仕様**:

| フィールド | 型 | 必須 | 説明 | 計算方法 |
|----------|-----|------|------|---------|
| employeeId | String | ✅ | 職員ID | 入力値 |
| totalExperienceYears | Float | ✅ | 総職務経験年数（前職含む） | WorkExperience集計 |
| yearsOfService | Float | ✅ | 当法人勤続年数 | 現在日 - Employee.hireDate |
| currentPositionYears | Float | ✅ | 現役職での年数 | AssignmentHistory集計 |
| specialtyExperienceYears | Float | ⚠️ | 専門分野経験年数 | WorkExperience（専門分野）集計 |
| calculatedAt | DateTime | ✅ | 計算日時 | 現在時刻 |

**データソース**:
- `Employee.hireDate` → yearsOfService計算
- `WorkExperience`テーブル → totalExperienceYears、specialtyExperienceYears
- `AssignmentHistory`テーブル → currentPositionYears

**更新頻度**: 週次バッチ + Webhook通知

**Webhook仕様**:
```http
POST https://voicedrive.ai/api/webhooks/employee-experience-updated
Content-Type: application/json
X-Medical-System-Signature: HMAC-SHA256署名

{
  "eventType": "employee.experience_updated",
  "employeeId": "OH-NS-2024-001",
  "timestamp": "2025-10-09T10:00:00Z",
  "data": {
    "totalExperienceYears": 8.2
  }
}
```

**優先度**: 🟡 MEDIUM
**納期希望**: 1ヶ月以内
**影響範囲**: Dashboard経験年数表示（初期は固定値で回避可能）

---

### API-3: 部署効率データ取得API（新規）

**エンドポイント**: `GET /api/analytics/department/{departmentId}/efficiency`

**現状**: ❌ 未実装

**Query Parameters**:
```
period: string (例: "2024-10", "2024-Q3")
metrics: string[] (例: ["task_completion", "voicedrive_activity"])
```

**レスポンス例**:
```json
{
  "departmentId": "内科",
  "period": "2024-10",
  "efficiencyScore": 87.5,
  "trend": "+3.2%",
  "breakdown": {
    "taskCompletionRate": 92.0,
    "voiceDriveActivityScore": 83.0,
    "responseTimeScore": 88.5,
    "qualityScore": 89.0
  },
  "calculatedAt": "2025-10-09T00:00:00Z"
}
```

**フィールド仕様**:

| フィールド | 型 | 必須 | 説明 | 計算方法 |
|----------|-----|------|------|---------|
| departmentId | String | ✅ | 部署ID | 入力値 |
| period | String | ✅ | 集計期間 | 入力値 |
| efficiencyScore | Float | ✅ | 総合効率スコア（0-100） | 加重平均 |
| trend | String | ⚠️ | 前期比トレンド | 前期との差分 |
| breakdown.taskCompletionRate | Float | ✅ | タスク完了率 | Task.status集計 |
| breakdown.voiceDriveActivityScore | Float | ✅ | VD活動スコア | API-4から取得 |
| breakdown.responseTimeScore | Float | ✅ | 対応速度スコア | Task応答時間集計 |
| breakdown.qualityScore | Float | ✅ | 品質スコア | 評価フィードバック集計 |
| calculatedAt | DateTime | ✅ | 計算日時 | 現在時刻 |

**計算方式**:

```typescript
efficiencyScore =
  taskCompletionRate * 0.4 +
  voiceDriveActivityScore * 0.2 +
  responseTimeScore * 0.2 +
  qualityScore * 0.2
```

| 指標 | 重み | データソース | 計算方法 |
|------|-----|------------|---------|
| タスク完了率 | 40% | 医療システムTask | (完了タスク数 / 全タスク数) * 100 |
| VD活動スコア | 20% | VoiceDrive API-4 | VoiceDriveから取得 |
| 対応速度スコア | 20% | 医療システムTask | 平均応答時間から算出 |
| 品質スコア | 20% | 医療システム評価 | 評価フィードバックから算出 |

**前提条件**:
- VoiceDrive側がAPI-4（活動統計API）を提供
- 医療システムがAPI-4を呼び出してVD活動データ取得

**更新頻度**: 日次バッチ

**優先度**: 🟢 LOW
**納期希望**: 2ヶ月以内
**影響範囲**: Dashboard部署効率表示（分析権限者のみ、初期は非表示可能）

---

### API-4: VoiceDrive活動統計API（VoiceDrive提供→医療システム）

**エンドポイント**: `GET /api/voicedrive/employees/{employeeId}/activity-stats`

**提供側**: VoiceDrive

**レスポンス例**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "period": "2024-10-01 to 2024-10-31",
  "stats": {
    "totalPosts": 45,
    "totalVotes": 128,
    "totalFeedbackReceived": 67,
    "totalFeedbackSent": 52,
    "projectsProposed": 3,
    "surveysCompleted": 12,
    "loginDays": 22,
    "averageEngagement": 85.5
  }
}
```

**フィールド仕様**:

| フィールド | 型 | 説明 | 計算方法 |
|----------|-----|------|---------|
| employeeId | String | 職員ID | 入力値 |
| period | String | 集計期間 | 入力値 |
| stats.totalPosts | Integer | 投稿数 | Post.count() |
| stats.totalVotes | Integer | 投票数 | Vote.count() |
| stats.totalFeedbackReceived | Integer | 受信フィードバック数 | Feedback.count() |
| stats.totalFeedbackSent | Integer | 送信フィードバック数 | Feedback.count() |
| stats.projectsProposed | Integer | 提案プロジェクト数 | Project.count() |
| stats.surveysCompleted | Integer | 回答アンケート数 | SurveyResponse.count() |
| stats.loginDays | Integer | ログイン日数 | ログイン履歴集計 |
| stats.averageEngagement | Float | 平均エンゲージメント | 総合スコア |

**認証**:
```http
Authorization: Bearer {jwt_token}
X-Medical-System-Client: analytics-v1.0
```

**用途**: 医療システムがAPI-3の部署効率計算に使用

**提供開始**: API-3実装時

**優先度**: 🟡 MEDIUM
**VoiceDrive実装**: API-3の前提条件として実装

---

## 📦 マスターデータ要求

### 必要なマスターデータ

Dashboard機能に必要なマスターデータは**すべて提供済み**です：

| マスター | 現状 | 用途 |
|---------|------|------|
| FacilityMaster | ✅ 提供済み | 施設名表示 |
| DepartmentMaster | ✅ 提供済み | 部署名表示 |
| OccupationMaster | ✅ 提供済み | 職種名表示 |
| PositionMaster | ✅ 提供済み | 役職名表示 |

**追加要求**: ❌ なし

---

## 🔄 Webhook要求

### Webhook-1: 経験年数更新通知

**エンドポイント**: `POST /api/webhooks/employee-experience-updated`

**送信タイミング**: 週次バッチ更新時

**リクエスト例**:
```http
POST https://voicedrive.ai/api/webhooks/employee-experience-updated
Content-Type: application/json
X-Medical-System-Signature: HMAC-SHA256署名

{
  "eventType": "employee.experience_updated",
  "employeeId": "OH-NS-2024-001",
  "timestamp": "2025-10-09T10:00:00Z",
  "data": {
    "totalExperienceYears": 8.2,
    "yearsOfService": 4.5,
    "currentPositionYears": 2.1
  }
}
```

**署名検証**:
```typescript
const signature = HMAC_SHA256(
  secret_key,
  JSON.stringify(request.body)
);
if (request.headers['X-Medical-System-Signature'] !== signature) {
  throw new Error('Invalid signature');
}
```

**優先度**: 🟡 MEDIUM
**実装タイミング**: API-2実装後

---

## 📊 データフロー図

### フロー1: Dashboard初期表示

```
ユーザー → VoiceDrive → 医療システム
  |                           ↓
  |                     API-1: 職員情報取得
  |                           ↓
  |         ← 職員情報 + permission
  |
  |         → 医療システム
  |                ↓
  |         API-2: 経験年数取得
  |                ↓
  |         ← 経験年数データ
  |
  |         VoiceDrive内でDB集計
  |         (投稿数、投票数、承認待ち)
  |
  |         → 医療システム
  |                ↓
  |         API-3: 部署効率取得
  |                ↓
  |         医療システム → VoiceDrive
  |                           ↓
  |                    API-4: VD活動統計
  |                           ↓
  |         医療システム ← VD活動データ
  |                ↓
  |         医療システム → VoiceDrive
  |                           ↓
  |         ← 部署効率データ
  ↓
Dashboard表示完了
```

---

## ✅ 実装チェックリスト

### 医療システム側の実装

#### API実装

- [ ] **API-1拡張**: `permission`オブジェクト追加
  - [ ] permission.level, calculatedLevel
  - [ ] permission.availableMenus配列
  - [ ] permission.isNewcomer, isManager, isSystemAdmin
  - [ ] permission.canAccessAnalytics

- [ ] **API-2実装**: 経験年数取得API
  - [ ] WorkExperienceテーブル集計ロジック
  - [ ] AssignmentHistory集計ロジック
  - [ ] totalExperienceYears計算
  - [ ] yearsOfService計算
  - [ ] currentPositionYears計算

- [ ] **API-3実装**: 部署効率データAPI
  - [ ] Task集計ロジック（完了率）
  - [ ] Task集計ロジック（応答時間）
  - [ ] VoiceDrive API-4呼び出し
  - [ ] 総合効率スコア計算（加重平均）
  - [ ] トレンド計算（前期比）

- [ ] **API-4利用**: VoiceDrive活動統計取得
  - [ ] VoiceDrive APIクライアント実装
  - [ ] JWT認証設定
  - [ ] エラーハンドリング
  - [ ] リトライ機能

#### Webhook実装

- [ ] **Webhook-1**: 経験年数更新通知
  - [ ] 週次バッチトリガー設定
  - [ ] HMAC-SHA256署名生成
  - [ ] Webhook送信ロジック
  - [ ] リトライ機能
  - [ ] エラーログ記録

#### その他

- [ ] API認証・認可設定
- [ ] レート制限設定
- [ ] エラーハンドリング
- [ ] ログ記録
- [ ] 監視・アラート設定
- [ ] テストデータ準備
- [ ] API仕様書作成（OpenAPI）
- [ ] 統合テスト

---

### VoiceDrive側の実装

- [ ] **API-4実装**: 活動統計提供API
  - [ ] Post集計ロジック
  - [ ] Vote集計ロジック
  - [ ] Feedback集計ロジック
  - [ ] ログイン履歴集計
  - [ ] エンゲージメントスコア計算

- [ ] **Webhook受信**: 経験年数更新
  - [ ] Webhookエンドポイント実装
  - [ ] 署名検証機能
  - [ ] User.experienceYears更新ロジック
  - [ ] エラーハンドリング

- [ ] **医療システムAPI呼び出し**
  - [ ] API-1呼び出し（permission取得）
  - [ ] API-2呼び出し（経験年数取得）
  - [ ] API-3呼び出し（部署効率取得）
  - [ ] エラーハンドリング
  - [ ] リトライ機能

- [ ] **DB変更**
  - [ ] User.experienceYears フィールド追加
  - [ ] Prismaマイグレーション実行
  - [ ] UserActivityService.ts実装
  - [ ] Dashboard.tsx統合

---

## 🎯 優先順位と納期

### Phase 1: 基本表示（優先度: HIGH）

**納期希望**: 2週間以内

| 項目 | 担当 | 期限 |
|------|------|------|
| API-1拡張 | 医療システム | Week 1 |
| User.experienceYears追加 | VoiceDrive | Week 1 |
| UserActivityService実装 | VoiceDrive | Week 1 |
| Dashboard統合 | VoiceDrive | Week 2 |
| 統合テスト | 両チーム | Week 2 |

**成果物**:
- 投稿数、投票数、承認待ち数がDB集計値で表示
- 権限情報が医療システムから取得・表示
- 経験年数表示（初期は固定値）

---

### Phase 2: 経験年数統合（優先度: MEDIUM）

**納期希望**: 1ヶ月以内

| 項目 | 担当 | 期限 |
|------|------|------|
| API-2実装 | 医療システム | Week 3-4 |
| Webhook-1実装 | 医療システム | Week 4 |
| Webhook受信実装 | VoiceDrive | Week 4 |
| 統合テスト | 両チーム | Week 4 |

**成果物**:
- 経験年数が医療システムから取得・表示
- 週次自動更新（Webhook）

---

### Phase 3: 部署効率統合（優先度: LOW）

**納期希望**: 2ヶ月以内

| 項目 | 担当 | 期限 |
|------|------|------|
| API-4実装 | VoiceDrive | Week 5-6 |
| API-3実装 | 医療システム | Week 7-8 |
| Dashboard統合 | VoiceDrive | Week 8 |
| 統合テスト | 両チーム | Week 8 |

**成果物**:
- 部署効率が医療システムから取得・表示
- VoiceDrive活動データが医療システムに提供
- 日次自動更新

---

## 📞 質問事項

### 医療システムチームへの確認事項

1. **API-1拡張の実装可否**
   - `permission`オブジェクトの詳細仕様確認
   - `availableMenus`配列の要素定義
   - 納期（2週間以内で可能か？）

2. **API-2実装の前提条件**
   - `WorkExperience`テーブルの現状確認
   - `AssignmentHistory`テーブルの現状確認
   - 経験年数計算ロジックの詳細
   - 納期（1ヶ月以内で可能か？）

3. **API-3実装の計算方針**
   - 総合効率スコアの計算式確認
   - VoiceDrive活動データの取得方法（API-4呼び出し）
   - 日次バッチのスケジュール
   - 納期（2ヶ月以内で可能か？）

4. **Webhook実装**
   - HMAC-SHA256署名の秘密鍵共有方法
   - Webhook送信のリトライポリシー
   - エラー時の通知方法

5. **テスト環境**
   - 統合テストスケジュール調整
   - テストデータ準備
   - テスト環境のAPI URL

---

## 📝 補足情報

### VoiceDrive側のDB構造

```prisma
model User {
  id                    String    @id @default(cuid())
  employeeId            String    @unique
  email                 String    @unique
  name                  String
  department            String?
  facilityId            String?
  profession            String?
  position              String?
  experienceYears       Float?    // ← API-2から同期
  permissionLevel       Float?
  canPerformLeaderDuty  Boolean   @default(false)
  // ... 他のフィールド
}
```

### データ同期方針

| データ | 同期方法 | 頻度 | 方向 |
|-------|---------|------|------|
| 職員基本情報 | API-1 + Webhook | 変更時 | 医療→VD |
| 経験年数 | API-2 + Webhook | 週次 | 医療→VD |
| 権限情報 | API-1 + Webhook | 変更時 | 医療→VD |
| VD活動統計 | API-4 | オンデマンド | VD→医療 |
| 部署効率 | API-3 | 日次 | 医療→VD |

---

## 📅 次のステップ

1. **医療システムチームレビュー** - 本文書の内容確認
2. **実装可否と納期の回答** - 各APIの実装可否と納期確定
3. **詳細仕様の確認会議** - API仕様の詳細確認（必要に応じて）
4. **Phase 1実装開始** - API-1拡張、UserActivityService実装
5. **統合テスト** - テスト環境での動作確認

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 | 担当 |
|------|----------|---------|------|
| 2025-10-09 | 1.0 | 初版作成 | VoiceDriveチーム |

---

**文書終了**

最終更新: 2025年10月9日
次のアクション: 医療システムチームレビュー → 実装可否・納期回答
連絡先: VoiceDriveチーム（Slack: #voicedrive-integration）
