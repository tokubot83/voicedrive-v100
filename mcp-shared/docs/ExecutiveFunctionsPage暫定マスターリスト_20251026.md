# ExecutiveFunctionsPage 暫定マスターリスト

**文書番号**: MASTER-LIST-2025-1026-003
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/executive-functions
**目的**: 医療システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- ExecutiveFunctionsPageは**5つのタブを持つ経営層向け統合管理ページ**
- **全機能がハードコーディングされたダミーデータ**で動作
- データ管理責任分界点に基づき、VoiceDrive管理と医療システム管理を明確化

### 必要な対応
1. **医療システムからのAPI提供**: 5件
2. **VoiceDrive DB追加**: テーブル6件（新規5件 + 既存1件強化）
3. **VoiceDrive既存テーブル統合**: 3件（BoardMeeting, BoardMeetingAgenda, BoardDecision）
4. **確認事項**: 3件

### 優先度
**Priority: 🟡 HIGH（グループ2: 経営層向けページ）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（5件）

#### API 1: 経営KPI取得API
**エンドポイント**: `GET /api/medical/executive/kpis`

**目的**: 経営概要タブで表示する総売上、純利益、総職員数、患者満足度を取得

**レスポンス例**:
```json
{
  "fiscalYear": 2024,
  "quarter": 4,
  "revenue": {
    "total": 1200000000,
    "growth": 8.0,
    "currency": "JPY"
  },
  "profit": {
    "net": 180000000,
    "margin": 15.0,
    "currency": "JPY"
  },
  "staff": {
    "total": 255,
    "facilities": 3,
    "byFacility": {
      "obara-hospital": 150,
      "ryokufuen": 80,
      "visiting-nurse": 25
    }
  },
  "patientSatisfaction": {
    "overall": 94.0,
    "growth": 2.0,
    "surveyDate": "2024-12-01"
  }
}
```

**優先度**: 🔴 HIGH
**データ管理責任**: 医療システム 100%
**VoiceDrive側の使用箇所**: ExecutiveFunctionsPage.tsx 21-44行目

---

#### API 2: ROI取得API
**エンドポイント**: `GET /api/medical/executive/initiatives/{initiativeId}/roi`

**目的**: 戦略イニシアチブの投資収益率（ROI）を取得

**レスポンス例**:
```json
{
  "initiativeId": "init-001",
  "expectedRoi": 18.0,
  "actualRoi": 16.5,
  "calculatedAt": "2025-10-26T00:00:00Z",
  "calculation": {
    "investment": 250000000,
    "expectedReturn": 45000000,
    "period": 36
  }
}
```

**優先度**: 🟡 MEDIUM
**データ管理責任**: 医療システム 100%
**VoiceDrive側の使用箇所**: ExecutiveFunctionsPage.tsx 240-262行目

---

#### API 3: キーポジション充足率取得API
**エンドポイント**: `GET /api/medical/executive/staffing-status`

**目的**: 組織分析タブで表示する部長・管理職、専門資格者、次世代リーダーの充足率を取得

**レスポンス例**:
```json
{
  "management": {
    "current": 15,
    "required": 15,
    "rate": 100
  },
  "specialists": {
    "current": 42,
    "required": 50,
    "rate": 84
  },
  "nextGen": {
    "current": 23,
    "required": 30,
    "rate": 76.7
  }
}
```

**優先度**: 🟡 MEDIUM
**データ管理責任**: 医療システム 100%
**VoiceDrive側の使用箇所**: ExecutiveFunctionsPage.tsx 380-417行目

---

#### API 4: リーダーシップ評価取得API
**エンドポイント**: `GET /api/medical/executive/leadership-rating`

**目的**: 組織分析タブで表示するリーダーシップ評価を取得

**レスポンス例**:
```json
{
  "overall": 4.3,
  "byFacility": {
    "obara-hospital": 4.5,
    "ryokufuen": 4.2,
    "visiting-nurse": 4.1
  },
  "surveyDate": "2024-12-01"
}
```

**優先度**: 🟡 MEDIUM
**データ管理責任**: 医療システム 100%
**VoiceDrive側の使用箇所**: ExecutiveFunctionsPage.tsx 294-317行目

---

#### API 5: 組織能力評価取得API
**エンドポイント**: `GET /api/medical/executive/organization-capabilities`

**目的**: 組織分析タブで表示する組織能力マトリックス（実行力、適応力、結束力、創造性）を取得

**レスポンス例**:
```json
{
  "execution": 92,
  "adaptation": 88,
  "cohesion": 90,
  "creativity": 75,
  "calculatedAt": "2024-12-01",
  "method": "survey"
}
```

**優先度**: 🟡 MEDIUM
**データ管理責任**: 医療システム 100%
**VoiceDrive側の使用箇所**: ExecutiveFunctionsPage.tsx 319-342行目

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### C. 新規テーブル追加（5件）

以下のテーブルをschema.prismaに追加する必要があります。

1. **ExecutiveKeyIssue** - 経営重要課題管理
2. **ExecutiveMonthlySummary** - 月次業績サマリー
3. **StrategicInitiative** - 戦略イニシアチブ管理
4. **StrategicInitiativeRisk** - イニシアチブリスク管理
5. **OrganizationAnalyticsMetrics** - 組織分析メトリクス
6. **BoardReport** - 理事会報告書管理

詳細なPrisma定義は [ExecutiveFunctionsPage_DB要件分析_20251026.md](./ExecutiveFunctionsPage_DB要件分析_20251026.md) を参照してください。

---

### D. 既存テーブル修正（1件）

#### D-1. Userテーブルへのリレーション追加

新規テーブルとUserテーブルのリレーションを追加：

```prisma
model User {
  // ... 既存フィールド

  // 🆕 ExecutiveFunctionsPage関連リレーション
  createdKeyIssues          ExecutiveKeyIssue[]  @relation("KeyIssueCreator")
  assignedKeyIssues         ExecutiveKeyIssue[]  @relation("KeyIssueAssignee")
  createdMonthlySummaries   ExecutiveMonthlySummary[]  @relation("MonthlySummaryCreator")
  approvedMonthlySummaries  ExecutiveMonthlySummary[]  @relation("MonthlySummaryApprover")
  ownedInitiatives          StrategicInitiative[]  @relation("InitiativeOwner")
  createdInitiatives        StrategicInitiative[]  @relation("InitiativeCreator")
  createdRisks              StrategicInitiativeRisk[]  @relation("RiskCreator")
  calculatedMetrics         OrganizationAnalyticsMetrics[]  @relation("MetricsCalculator")
  createdBoardReports       BoardReport[]  @relation("BoardReportCreator")
  approvedBoardReports      BoardReport[]  @relation("BoardReportApprover")
}
```

---

### E. 既存テーブル統合（3件）

#### E-1. BoardMeetingテーブル
- **現状**: schema.prisma 1469-1492行目に定義済み
- **必要作業**: ExecutiveFunctionsPageとの統合
- **使用箇所**: ExecutiveFunctionsPage.tsx 493-519行目（会議スケジュール）
- **優先度**: 🟡 MEDIUM

#### E-2. BoardMeetingAgendaテーブル
- **現状**: schema.prisma 1393-1436行目に定義済み
- **必要作業**: ExecutiveFunctionsPageとの統合
- **使用箇所**: 理事会レポートタブ（間接的に使用）
- **優先度**: 🟡 MEDIUM

#### E-3. BoardDecisionテーブル
- **現状**: schema.prisma 1673行目以降に定義済み
- **必要作業**: ExecutiveFunctionsPageとの統合
- **使用箇所**: ExecutiveFunctionsPage.tsx 521-543行目（重要決議事項）
- **優先度**: 🟡 MEDIUM

---

## ❓ 医療システムチームへの確認事項

### 確認1: 財務・経営データAPIの提供スケジュール

**質問**:
- 経営KPI API（総売上、純利益、患者満足度）の実装スケジュールは？
- ROI計算API の実装スケジュールは？

**理由**:
- ExecutiveFunctionsPageの経営概要タブが医療システムAPIに依存
- VoiceDriveの実装優先順位を決定するため

---

### 確認2: 組織分析データAPIの提供スケジュール

**質問**:
- リーダーシップ評価API の実装スケジュールは？
- 組織能力評価API の実装スケジュールは？
- キーポジション充足率API の実装スケジュールは？

**理由**:
- ExecutiveFunctionsPageの組織分析タブが医療システムAPIに依存
- VoiceDrive側の組織健全度計算ロジックの設計に影響

---

### 確認3: 予算データの連携方法

**質問**:
- 戦略イニシアチブの予算情報は医療システムから提供可能か？
- 提供可能な場合、APIまたはWebhookどちらが適切か？

**理由**:
- StrategicInitiativeテーブルに予算情報をキャッシュする設計
- データ同期方法を確定する必要がある

---

## 📅 想定スケジュール

### Phase 1: 基本機能の実データ化（3日）
- ExecutiveKeyIssueテーブル追加
- ExecutiveMonthlySummaryテーブル追加
- 基本CRUD API実装

### Phase 2: 戦略イニシアチブ管理（3日）
- StrategicInitiativeテーブル追加
- StrategicInitiativeRiskテーブル追加
- イニシアチブ管理API実装

### Phase 3: 組織分析機能（2日）
- OrganizationAnalyticsMetricsテーブル追加
- 組織分析集計サービス実装

### Phase 4: 理事会レポート管理（2日）
- BoardReportテーブル追加
- BoardMeeting/BoardDecision統合

### Phase 5: 医療システムAPI統合（医療システム実装完了後）
- 医療システムAPI呼び出し機能実装
- 統合テスト

---

## 📊 データ項目カタログ（全5タブ、120項目）

### タブ1: 経営概要（executive_overview）- 30項目

| # | 項目名 | データ型 | データソース | 管理責任 | 状態 |
|---|--------|---------|------------|---------|------|
| 1 | 総売上 | BigInt | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 2 | 総売上成長率 | Float | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 3 | 純利益 | BigInt | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 4 | 利益率 | Float | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 5 | 総職員数 | Int | 医療システムAPI | 医療システム | 🟡 計算可能 |
| 6 | 施設数 | Int | VoiceDrive | VoiceDrive | ✅ OK |
| 7 | 患者満足度 | Float | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 8 | 患者満足度成長率 | Float | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 9 | 財務健全性スコア | Int | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 10 | 組織エンゲージメントスコア | Int | VoiceDrive + 医療システム | 統合計算 | 🟡 統合必要 |
| 11 | 市場競争力スコア | Int | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 12 | リスク管理スコア | Int | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 13-17 | 重要課題（5件） | ExecutiveKeyIssue | VoiceDrive DB | VoiceDrive | 🔴 テーブル追加必要 |
| 18-30 | 月次業績サマリー | ExecutiveMonthlySummary | VoiceDrive DB | VoiceDrive + 医療システム | 🔴 テーブル追加必要 |

### タブ2: 戦略イニシアチブ（strategic_initiatives）- 35項目

| # | 項目名 | データ型 | データソース | 管理責任 | 状態 |
|---|--------|---------|------------|---------|------|
| 31-45 | イニシアチブ基本情報（3件×5） | StrategicInitiative | VoiceDrive DB | VoiceDrive | 🔴 テーブル追加必要 |
| 46-50 | 予算情報 | BigInt | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 51-55 | ROI情報 | Float | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 56-65 | リスク情報（3件×3） | StrategicInitiativeRisk | VoiceDrive DB | VoiceDrive | 🔴 テーブル追加必要 |

### タブ3: 組織分析（organization_analytics）- 25項目

| # | 項目名 | データ型 | データソース | 管理責任 | 状態 |
|---|--------|---------|------------|---------|------|
| 66 | 組織健全度スコア | Int | VoiceDrive + 医療システム | 統合計算 | 🟡 統合必要 |
| 67 | イノベーション指数 | Int | VoiceDrive | VoiceDrive | 🔴 集計必要 |
| 68 | リーダーシップ評価 | Float | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 69 | 文化適応度 | Int | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 70-73 | 組織能力評価（4項目） | Int | 医療システムAPI | 医療システム | 🔴 API提供必要 |
| 74-82 | 施設別組織スコア（3施設×3項目） | OrganizationAnalyticsMetrics | VoiceDrive DB | VoiceDrive + 医療システム | 🔴 テーブル追加必要 |
| 83-90 | キーポジション充足状況 | - | 医療システムAPI | 医療システム | 🔴 API提供必要 |

### タブ4: 理事会レポート（board_reports）- 25項目

| # | 項目名 | データ型 | データソース | 管理責任 | 状態 |
|---|--------|---------|------------|---------|------|
| 91-105 | 理事会報告書一覧（3件×5） | BoardReport | VoiceDrive DB | VoiceDrive | 🔴 テーブル追加必要 |
| 106-114 | 会議スケジュール（3件×3） | BoardMeeting | VoiceDrive DB | VoiceDrive | 🟡 統合必要 |
| 115-120 | 重要決議事項（3件×2） | BoardDecision | VoiceDrive DB | VoiceDrive | 🟡 統合必要 |

### タブ5: ガバナンス（governance）- 5項目

**注**: 現在は理事会レポートタブと同じコンテンツを表示（ExecutiveFunctionsPage.tsx 590行目）

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1（経営概要タブ）
- [ ] ExecutiveKeyIssueテーブル追加
- [ ] ExecutiveMonthlySummaryテーブル追加
- [ ] マイグレーション実行
- [ ] GET /api/executive/key-issues 実装
- [ ] POST /api/executive/key-issues 実装
- [ ] PUT /api/executive/key-issues/:id 実装
- [ ] DELETE /api/executive/key-issues/:id 実装
- [ ] GET /api/executive/monthly-summary 実装
- [ ] POST /api/executive/monthly-summary 実装
- [ ] PUT /api/executive/monthly-summary/:id 実装
- [ ] ExecutiveFunctionsPageの経営概要タブを実データに置き換え

#### Phase 2（戦略イニシアチブタブ）
- [ ] StrategicInitiativeテーブル追加
- [ ] StrategicInitiativeRiskテーブル追加
- [ ] マイグレーション実行
- [ ] イニシアチブ管理API実装（CRUD）
- [ ] リスク管理API実装（CRUD）
- [ ] ExecutiveFunctionsPageの戦略イニシアチブタブを実データに置き換え

#### Phase 3（組織分析タブ）
- [ ] OrganizationAnalyticsMetricsテーブル追加
- [ ] マイグレーション実行
- [ ] 組織分析集計サービス実装
- [ ] 組織分析API実装
- [ ] ExecutiveFunctionsPageの組織分析タブを実データに置き換え

#### Phase 4（理事会レポートタブ）
- [ ] BoardReportテーブル追加
- [ ] マイグレーション実行
- [ ] 理事会報告書管理API実装（CRUD）
- [ ] BoardMeeting/BoardDecisionテーブルとの統合
- [ ] ExecutiveFunctionsPageの理事会レポートタブを実データに置き換え

#### Phase 5（医療システムAPI統合）
- [ ] 医療システムAPI（経営KPI）呼び出し機能実装
- [ ] 医療システムAPI（ROI）呼び出し機能実装
- [ ] 医療システムAPI（キーポジション充足率）呼び出し機能実装
- [ ] 医療システムAPI（リーダーシップ評価）呼び出し機能実装
- [ ] 医療システムAPI（組織能力評価）呼び出し機能実装
- [ ] エラーハンドリング実装
- [ ] キャッシュ機能実装
- [ ] 統合テスト

---

### 医療システム側の実装

#### 財務・経営データAPI
- [ ] GET /api/medical/executive/kpis 実装
- [ ] GET /api/medical/executive/initiatives/:id/roi 実装
- [ ] GET /api/medical/executive/staffing-status 実装

#### 組織分析データAPI
- [ ] GET /api/medical/executive/leadership-rating 実装
- [ ] GET /api/medical/executive/organization-capabilities 実装

#### 認証・認可
- [ ] JWT Bearer Token認証実装
- [ ] VoiceDriveからのAPI呼び出しを許可
- [ ] レート制限設定

#### テスト
- [ ] 単体テスト
- [ ] 統合テスト（VoiceDriveとの連携）
- [ ] パフォーマンステスト

---

## 📞 連絡先・参照

### 関連ドキュメント
- [ExecutiveFunctionsPage_DB要件分析_20251026.md](./ExecutiveFunctionsPage_DB要件分析_20251026.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [ExecutiveDashboard_DB要件分析_20251019.md](./ExecutiveDashboard_DB要件分析_20251019.md)

### VoiceDriveチーム
- MCPサーバー共有フォルダ: `mcp-shared/docs/`
- 進捗管理: 各ドキュメントのチェックリスト参照

### 医療システムチーム
- API仕様確認: 各API定義参照
- 確認事項: 上記「医療システムチームへの確認事項」参照

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: DB構築時（Phase 1実装前）
