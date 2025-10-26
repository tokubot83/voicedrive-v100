# ExecutiveFunctionsPage DB要件分析

**文書番号**: DB-REQ-2025-1026-003
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/executive-functions
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](../データ管理責任分界点定義書_20251008.md)
- [ExecutiveDashboard_DB要件分析_20251019.md](../ExecutiveDashboard_DB要件分析_20251019.md)
- C:\projects\voicedrive-v100\src\pages\ExecutiveFunctionsPage.tsx

---

## 📋 分析サマリー

### 結論
ExecutiveFunctionsPageは**5つのタブを持つ経営層向け統合管理ページ**ですが、**全機能がハードコーディングされたダミーデータ**で動作しています。データ管理責任分界点に基づくと、以下の対応が必要です。

### 🔴 重大な不足項目

1. **経営概要タブのKPIデータ不足**
   - ExecutiveFunctionsPage.tsx 21-150行目: 総売上、純利益、患者満足度等
   - 現在: 完全にダミーデータ（ハードコーディング）
   - 必要: 医療システムからの財務・経営データAPI

2. **戦略イニシアチブ管理機能不足**
   - ExecutiveFunctionsPage.tsx 152-292行目: プロジェクト進捗、予算、ROI
   - 現在: 完全にダミーデータ
   - 必要: StrategicInitiativeテーブル（新規） + 医療システム財務API

3. **組織分析データの集計機能不足**
   - ExecutiveFunctionsPage.tsx 294-418行目: 組織健全度、イノベーション指数等
   - 現在: 完全にダミーデータ
   - 必要: 組織分析集計サービス + 医療システムからの基礎データ

4. **理事会報告書管理機能不足**
   - ExecutiveFunctionsPage.tsx 420-543行目: 理事会報告書一覧、承認フロー
   - 現在: 完全にダミーデータ
   - 必要: BoardReportテーブル（新規） + 承認ワークフロー

5. **会議スケジュール・決議事項管理不足**
   - ExecutiveFunctionsPage.tsx 493-543行目: 会議スケジュール、重要決議事項
   - 現在: 完全にダミーデータ
   - 必要: BoardMeeting/BoardDecisionテーブル（一部実装済み）の強化

### 🟢 一部実装済みの機能

1. **BoardMeetingAgendaテーブル**（schema.prisma 1393-1436行目）
   - ✅ 理事会議題管理（一部定義済み）
   - ⚠️ ExecutiveFunctionsPageとの統合が未完了

2. **BoardMeetingテーブル**（schema.prisma 1469-1492行目）
   - ✅ 理事会会議管理（一部定義済み）
   - ⚠️ ExecutiveFunctionsPageとの統合が未完了

3. **BoardDecisionテーブル**（schema.prisma 1673行目以降）
   - ✅ 理事会決議管理（一部定義済み）
   - ⚠️ ExecutiveFunctionsPageとの統合が未完了

4. **ExecutiveStrategicInsightテーブル**（schema.prisma 2283-2307行目）
   - ✅ 戦略分析受信用テーブル（定義済み）
   - ⏳ Phase 18.5（2026年1月）で本格稼働予定

---

## 🔍 詳細分析

### 1. 経営概要タブ（executive_overview）

#### 1-1. 経営KPIカード（21-44行目）

**表示内容**:
```typescript
{
  totalRevenue: '¥1.2B',       // 総売上
  netProfit: '¥180M',          // 純利益
  totalStaff: 255,             // 総職員数
  patientSatisfaction: '94%'   // 患者満足度
}
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 総売上 | **医療システム** | ❌ ダミーデータ | 医療システム財務DB | 🔴 **API提供必要** |
| 純利益 | **医療システム** | ❌ ダミーデータ | 医療システム財務DB | 🔴 **API提供必要** |
| 総職員数 | **医療システム** | ⚠️ 計算可能 | Employee集計 | 🟡 **API提供推奨** |
| 患者満足度 | **医療システム** | ❌ ダミーデータ | 医療システムアンケートDB | 🔴 **API提供必要** |

**データ管理責任分界点**:
- ✅ **医療システムが100%管理**: 財務・経営データは医療システムの管轄
- ❌ **VoiceDriveは表示のみ**: APIで取得したデータを表示

**解決策1A: 医療システムAPIの提供**

```typescript
// 医療システム提供API
GET /api/medical/executive/kpis
Response: {
  fiscalYear: 2024,
  quarter: 4,
  revenue: {
    total: 1200000000,        // ¥1.2B
    growth: 8.0,              // +8% YoY
    currency: 'JPY'
  },
  profit: {
    net: 180000000,           // ¥180M
    margin: 15.0,             // 利益率 15%
    currency: 'JPY'
  },
  staff: {
    total: 255,
    facilities: 3,
    byFacility: {
      'obara-hospital': 150,
      'ryokufuen': 80,
      'visiting-nurse': 25
    }
  },
  patientSatisfaction: {
    overall: 94.0,            // 94%
    growth: 2.0,              // +2% YoY
    surveyDate: '2024-12-01'
  }
}
```

---

#### 1-2. 重要指標ダッシュボード（46-87行目）

**表示内容**:
```typescript
{
  financialHealth: 92,          // 財務健全性
  organizationEngagement: 87,   // 組織エンゲージメント
  marketCompetitiveness: 89,    // 市場競争力
  riskManagement: 85            // リスク管理
}
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 財務健全性 | **医療システム** | ❌ ダミーデータ | 財務分析DB | 🔴 **API提供必要** |
| 組織エンゲージメント | **VoiceDrive** + 医療システム | ❌ ダミーデータ | VoiceDrive活動統計 + 医療システムアンケート | 🟡 **統合計算必要** |
| 市場競争力 | **医療システム** | ❌ ダミーデータ | 医療システム分析DB | 🔴 **API提供必要** |
| リスク管理 | **医療システム** | ❌ ダミーデータ | リスク管理DB | 🔴 **API提供必要** |

**データ管理責任分界点**:
- ✅ **医療システムが主管理**: 財務、市場、リスクは医療システム
- ⚠️ **VoiceDriveが部分貢献**: 組織エンゲージメントはVoiceDrive活動も考慮

**解決策1B: 組織エンゲージメントの統合計算**

```typescript
// VoiceDrive側集計
const voiceDriveEngagement = {
  postParticipationRate: 68,      // 投稿参加率
  voteActivityRate: 72,            // 投票活動率
  averageSentiment: 0.65           // 平均センチメント
};

// 医療システム側集計
GET /api/medical/executive/engagement
Response: {
  surveyEngagement: 85,            // アンケートエンゲージメント
  attendanceRate: 96,              // 出席率
  turnoverRate: 8.3                // 離職率（低い方が良い）
};

// VoiceDrive内部で統合計算
const organizationEngagement = calculateEngagement({
  voiceDrive: voiceDriveEngagement,
  medical: medicalEngagement
});
// => 87点
```

---

#### 1-3. 今期の重要課題（89-114行目）

**表示内容**:
```typescript
[
  {
    title: '人材確保・定着強化',
    description: '看護師・技師の採用難',
    priority: 'critical'
  },
  {
    title: 'デジタル変革推進',
    description: '業務効率化・患者体験向上',
    priority: 'high'
  },
  {
    title: '地域医療連携拡大',
    description: '他医療機関との協力体制強化',
    priority: 'medium'
  }
]
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 重要課題リスト | **VoiceDrive** | ❌ ダミーデータ | KeyIssueテーブル（新規） | 🔴 **要追加** |
| 優先度 | **VoiceDrive** | ❌ ダミーデータ | KeyIssue.priority | 🔴 **要追加** |
| 進捗状況 | **VoiceDrive** | ❌ ダミーデータ | KeyIssue.progress | 🔴 **要追加** |

**データ管理責任分界点**:
- ✅ **VoiceDriveが100%管理**: 組織課題管理はVoiceDrive内部で完結
- ❌ **医療システムは関与しない**: VoiceDrive独自の課題管理機能

**解決策1C: KeyIssueテーブルの追加**

```prisma
/// 経営重要課題テーブル
/// 経営層が設定する今期の重要課題を管理
model ExecutiveKeyIssue {
  id              String    @id @default(cuid())

  // 課題基本情報
  title           String    @map("title")
  description     String    @map("description")
  priority        String    @map("priority")
  // "critical" | "high" | "medium" | "low"

  // ステータス
  status          String    @default("active") @map("status")
  // "active" | "in_progress" | "resolved" | "deferred"
  progress        Int       @default(0) @map("progress")  // 0-100

  // 期限
  targetDate      DateTime? @map("target_date")

  // 表示制御
  displayOrder    Int       @default(0) @map("display_order")
  isVisible       Boolean   @default(true) @map("is_visible")

  // 関連情報
  relatedPostIds  Json?     @map("related_post_ids")
  relatedProjectIds Json?   @map("related_project_ids")
  assignedTo      String?   @map("assigned_to")

  // 作成者・更新者
  createdBy       String    @map("created_by")
  updatedBy       String?   @map("updated_by")

  // タイムスタンプ
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  creator         User      @relation("KeyIssueCreator", fields: [createdBy], references: [id])
  assignee        User?     @relation("KeyIssueAssignee", fields: [assignedTo], references: [id])

  @@index([priority])
  @@index([status])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("executive_key_issues")
}
```

---

#### 1-4. 月次業績サマリー（117-149行目）

**表示内容**:
```typescript
{
  achieved: [
    '月次売上目標 112%達成',
    '患者満足度 目標超過',
    'コスト削減目標 達成',
    '新規患者獲得 計画比105%'
  ],
  improvement: [
    '職員離職率の改善',
    '夜勤体制の最適化',
    '在庫管理効率化',
    '研修参加率向上'
  ],
  investment: [
    'MRI装置更新プロジェクト',
    '電子カルテシステム刷新',
    '職員研修センター設立',
    '地域連携システム構築'
  ]
}
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 目標達成項目 | **医療システム** + VoiceDrive | ❌ ダミーデータ | MonthlySummaryテーブル（新規） | 🟡 **要追加** |
| 改善要項目 | **VoiceDrive** | ❌ ダミーデータ | MonthlySummary.improvements | 🟡 **要追加** |
| 戦略的投資 | **医療システム** | ❌ ダミーデータ | 医療システム予算DB | 🔴 **API提供必要** |

**データ管理責任分界点**:
- ⚠️ **混在管理**: 目標達成は医療システム（売上）とVoiceDrive（活動）の統合
- ✅ **VoiceDriveが主導**: 改善要項目はVoiceDrive活動から抽出
- ✅ **医療システムが主導**: 戦略的投資は医療システムの予算管理

**解決策1D: MonthlySummaryテーブルの追加**

```prisma
/// 月次業績サマリーテーブル
/// 毎月の業績概要を記録
model ExecutiveMonthlySummary {
  id                  String    @id @default(cuid())

  // 期間
  year                Int       @map("year")
  month               Int       @map("month")  // 1-12

  // 目標達成項目
  achievedItems       Json      @map("achieved_items")
  // [{title: string, value: string, targetValue: string, achievementRate: number}]

  // 改善要項目
  improvementItems    Json      @map("improvement_items")
  // [{title: string, currentStatus: string, targetStatus: string}]

  // 戦略的投資（医療システムAPIから取得）
  investmentProjects  Json?     @map("investment_projects")
  // [{title: string, budget: number, status: string}]

  // 全体評価
  overallRating       String?   @map("overall_rating")
  // "excellent" | "good" | "fair" | "needs_improvement"

  // 作成・承認
  createdBy           String    @map("created_by")
  approvedBy          String?   @map("approved_by")
  approvedAt          DateTime? @map("approved_at")

  // タイムスタンプ
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  creator             User      @relation("MonthlySummaryCreator", fields: [createdBy], references: [id])
  approver            User?     @relation("MonthlySummaryApprover", fields: [approvedBy], references: [id])

  @@unique([year, month])
  @@index([year, month])
  @@map("executive_monthly_summaries")
}
```

---

### 2. 戦略イニシアチブタブ（strategic_initiatives）

#### 2-1. 2025年戦略イニシアチブ（152-238行目）

**表示内容**:
```typescript
[
  {
    title: '地域医療拠点化プロジェクト',
    description: '地域の中核医療機関としての地位確立',
    status: '進行中',
    budget: '¥2.5億',
    period: '2025-2027年',
    progress: 35
  },
  {
    title: '次世代医療DXプラットフォーム',
    description: 'AI・IoT活用による医療の質向上',
    status: '計画中',
    budget: '¥1.8億',
    period: '2025-2026年',
    progress: 15
  },
  {
    title: '人材育成・定着促進プログラム',
    description: '魅力的な職場環境づくりと人材開発',
    status: '展開中',
    budget: '¥5,000万',
    period: '2024-2025年',
    progress: 60
  }
]
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| イニシアチブ一覧 | **VoiceDrive** | ❌ ダミーデータ | StrategicInitiativeテーブル（新規） | 🔴 **要追加** |
| 予算 | **医療システム** | ❌ ダミーデータ | 医療システム予算DB | 🔴 **API提供必要** |
| 進捗率 | **VoiceDrive** | ❌ ダミーデータ | StrategicInitiative.progress | 🔴 **要追加** |

**データ管理責任分界点**:
- ✅ **VoiceDriveが主管理**: イニシアチブ登録・進捗管理
- ⚠️ **医療システムが予算管理**: 予算情報はAPIで取得

**解決策2A: StrategicInitiativeテーブルの追加**

```prisma
/// 戦略イニシアチブテーブル
/// 経営層が設定する戦略的プロジェクトを管理
model StrategicInitiative {
  id                  String    @id @default(cuid())

  // 基本情報
  title               String    @map("title")
  description         String?   @map("description")
  category            String    @map("category")
  // "digital_transformation" | "regional_development" | "hr_development" | "other"

  // ステータス
  status              String    @default("planning") @map("status")
  // "planning" | "in_progress" | "deployed" | "completed" | "cancelled"
  progress            Int       @default(0) @map("progress")  // 0-100

  // 予算（医療システムAPIから取得、キャッシュ）
  budgetAmount        BigInt?   @map("budget_amount")
  budgetCurrency      String?   @default("JPY") @map("budget_currency")
  budgetSourceId      String?   @map("budget_source_id")  // 医療システムの予算ID

  // 期間
  startDate           DateTime? @map("start_date")
  endDate             DateTime? @map("end_date")

  // ROI（医療システムAPIから取得、キャッシュ）
  expectedRoi         Float?    @map("expected_roi")
  actualRoi           Float?    @map("actual_roi")

  // 責任者
  ownerId             String    @map("owner_id")
  teamMembers         Json?     @map("team_members")  // string[] (employeeIds)

  // 表示制御
  displayOrder        Int       @default(0) @map("display_order")
  isVisible           Boolean   @default(true) @map("is_visible")

  // 関連情報
  relatedKeyIssueIds  Json?     @map("related_key_issue_ids")

  // 作成者・更新者
  createdBy           String    @map("created_by")
  updatedBy           String?   @map("updated_by")

  // タイムスタンプ
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  owner               User      @relation("InitiativeOwner", fields: [ownerId], references: [id])
  creator             User      @relation("InitiativeCreator", fields: [createdBy], references: [id])

  @@index([status])
  @@index([ownerId])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("strategic_initiatives")
}
```

---

#### 2-2. 投資収益分析（240-262行目）

**表示内容**:
```typescript
{
  '地域拠点化プロジェクト': { roi: 18 },
  'DXプラットフォーム': { roi: 24 },
  '人材育成プログラム': { roi: 15 }
}
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| ROI計算 | **医療システム** | ❌ ダミーデータ | 医療システム財務DB | 🔴 **API提供必要** |

**データ管理責任分界点**:
- ✅ **医療システムが100%管理**: ROI計算は財務データから算出

**解決策2B: 医療システムAPIでROI提供**

```typescript
// 医療システムAPI
GET /api/medical/executive/initiatives/{initiativeId}/roi
Response: {
  initiativeId: 'init-001',
  expectedRoi: 18.0,      // 予測ROI
  actualRoi: 16.5,        // 実績ROI
  calculatedAt: '2025-10-26T00:00:00Z',
  calculation: {
    investment: 250000000,  // 投資額
    expectedReturn: 45000000,  // 期待リターン
    period: 36  // 期間（月）
  }
}
```

---

#### 2-3. リスク管理（264-289行目）

**表示内容**:
```typescript
[
  {
    title: '人材不足リスク',
    severity: '高',
    mitigation: '採用強化・働き方改革・研修充実'
  },
  {
    title: '技術変革対応リスク',
    severity: '中',
    mitigation: '段階的導入・職員教育・外部支援活用'
  },
  {
    title: '競合激化リスク',
    severity: '低',
    mitigation: '差別化サービス・地域密着・品質向上'
  }
]
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| リスク一覧 | **VoiceDrive** | ❌ ダミーデータ | InitiativeRiskテーブル（新規） | 🔴 **要追加** |

**データ管理責任分界点**:
- ✅ **VoiceDriveが100%管理**: リスク管理はVoiceDrive内部で完結

**解決策2C: InitiativeRiskテーブルの追加**

```prisma
/// 戦略イニシアチブリスクテーブル
/// イニシアチブに関連するリスクを管理
model StrategicInitiativeRisk {
  id                String              @id @default(cuid())

  initiativeId      String?             @map("initiative_id")
  // nullの場合は全般的リスク

  // リスク基本情報
  title             String              @map("title")
  description       String?             @map("description")
  severity          String              @map("severity")
  // "high" | "medium" | "low"

  // 対策
  mitigation        String              @map("mitigation")
  mitigationStatus  String              @default("planning") @map("mitigation_status")
  // "planning" | "in_progress" | "implemented"

  // ステータス
  status            String              @default("active") @map("status")
  // "active" | "mitigated" | "realized" | "closed"

  // 作成者・更新者
  createdBy         String              @map("created_by")
  updatedBy         String?             @map("updated_by")

  // タイムスタンプ
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @updatedAt @map("updated_at")

  initiative        StrategicInitiative? @relation("InitiativeRisks", fields: [initiativeId], references: [id], onDelete: Cascade)
  creator           User                @relation("RiskCreator", fields: [createdBy], references: [id])

  @@index([initiativeId])
  @@index([severity])
  @@index([status])
  @@map("strategic_initiative_risks")
}
```

---

### 3. 組織分析タブ（organization_analytics）

#### 3-1. 組織指標カード（294-317行目）

**表示内容**:
```typescript
{
  organizationHealth: 87,        // 組織健全度
  innovationIndex: 72,           // イノベーション指数
  leadershipRating: 4.3,         // リーダーシップ評価
  cultureAdaptation: 89          // 文化適応度
}
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 組織健全度 | **VoiceDrive** + 医療システム | ❌ ダミーデータ | OrganizationMetricsテーブル（新規） | 🟡 **統合計算必要** |
| イノベーション指数 | **VoiceDrive** | ❌ ダミーデータ | VoiceDrive活動統計 | 🔴 **集計必要** |
| リーダーシップ評価 | **医療システム** | ❌ ダミーデータ | 医療システムV3評価DB | 🔴 **API提供必要** |
| 文化適応度 | **医療システム** | ❌ ダミーデータ | 医療システムアンケートDB | 🔴 **API提供必要** |

**データ管理責任分界点**:
- ⚠️ **混在管理**: 組織健全度はVoiceDrive活動と医療システムアンケートの統合
- ✅ **VoiceDriveが主導**: イノベーション指数はVoiceDrive投稿から算出
- ✅ **医療システムが主導**: リーダーシップ評価・文化適応度

---

#### 3-2. 組織能力マトリックス（319-342行目）

**表示内容**:
```typescript
{
  execution: '高実行力',
  adaptation: '高適応力',
  cohesion: '強い結束力',
  creativity: '創造性'
}
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 組織能力評価 | **医療システム** | ❌ ダミーデータ | 医療システム組織分析DB | 🔴 **API提供必要** |

**データ管理責任分界点**:
- ✅ **医療システムが100%管理**: 組織能力評価は医療システムのアンケート・評価から算出

---

#### 3-3. 施設別組織分析（344-378行目）

**表示内容**:
```typescript
[
  {
    name: 'さつき台病院',
    description: '最大規模・高機能',
    score: 92
  },
  {
    name: '緑風園',
    description: '介護・リハビリ特化',
    score: 85
  },
  {
    name: '訪問看護ステーション',
    description: '在宅医療サポート',
    score: 94
  }
]
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 施設別組織スコア | **VoiceDrive** + 医療システム | ❌ ダミーデータ | FacilityMetricsテーブル（新規） | 🟡 **統合計算必要** |

**データ管理責任分界点**:
- ⚠️ **混在管理**: VoiceDrive活動と医療システムアンケートの統合

**解決策3A: OrganizationMetricsテーブルの追加**

```prisma
/// 組織分析メトリクステーブル
/// 組織健全度等の分析指標を記録
model OrganizationAnalyticsMetrics {
  id                      String    @id @default(cuid())

  // 期間
  year                    Int       @map("year")
  month                   Int       @map("month")  // 1-12

  // 対象（施設別 or 全体）
  facilityId              String?   @map("facility_id")
  // nullの場合は法人全体

  // 組織指標
  organizationHealth      Int?      @map("organization_health")      // 0-100
  innovationIndex         Int?      @map("innovation_index")         // 0-100
  leadershipRating        Float?    @map("leadership_rating")        // 0.0-5.0
  cultureAdaptation       Int?      @map("culture_adaptation")       // 0-100

  // 組織能力評価
  executionCapability     Int?      @map("execution_capability")     // 0-100
  adaptationCapability    Int?      @map("adaptation_capability")    // 0-100
  cohesionCapability      Int?      @map("cohesion_capability")      // 0-100
  creativityCapability    Int?      @map("creativity_capability")    // 0-100

  // データソース
  voicedriveData          Json?     @map("voicedrive_data")
  // VoiceDrive活動統計
  medicalSystemData       Json?     @map("medical_system_data")
  // 医療システムAPI取得データ

  // 計算メタデータ
  calculatedBy            String    @map("calculated_by")
  calculationMethod       String?   @map("calculation_method")

  // タイムスタンプ
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  calculator              User      @relation("MetricsCalculator", fields: [calculatedBy], references: [id])

  @@unique([year, month, facilityId])
  @@index([year, month])
  @@index([facilityId])
  @@map("organization_analytics_metrics")
}
```

---

#### 3-4. 戦略的人材配置分析（380-417行目）

**表示内容**:
```typescript
{
  keyPositions: {
    management: 100,      // 部長・管理職充足率
    specialists: 85,      // 専門資格者充足率
    nextGen: 78          // 次世代リーダー充足率
  },
  priorities: [
    '緊急: 看護師長候補の育成強化',
    '重要: デジタルスキル向上研修',
    '計画: 多職種連携チーム強化'
  ]
}
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| キーポジション充足状況 | **医療システム** | ❌ ダミーデータ | 医療システムHR DB | 🔴 **API提供必要** |
| 組織開発優先項目 | **医療システム** + VoiceDrive | ❌ ダミーデータ | OrganizationDevelopmentテーブル（新規） | 🟡 **要追加** |

**データ管理責任分界点**:
- ✅ **医療システムが主導**: キーポジション充足率は医療システムの人事データから算出
- ⚠️ **VoiceDriveが部分貢献**: VoiceDrive投稿から課題を抽出

---

### 4. 理事会レポートタブ（board_reports）

#### 4-1. 理事会報告書一覧（420-491行目）

**表示内容**:
```typescript
[
  {
    title: '2024年度第4四半期 経営報告',
    description: '財務実績・事業成果・来期計画',
    status: '承認済み',
    createdDate: '2024-12-20',
    approvedDate: '2024-12-22'
  },
  {
    title: '人事・組織開発状況報告',
    description: '採用実績・研修効果・職員満足度調査結果',
    status: '検討中',
    createdDate: '2024-12-18'
  },
  {
    title: '地域医療連携推進報告',
    description: '他医療機関との連携実績・地域貢献活動',
    status: '作成中',
    expectedDate: '2024-12-25'
  }
]
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 理事会報告書一覧 | **VoiceDrive** | ❌ ダミーデータ | BoardReportテーブル（新規） | 🔴 **要追加** |
| 承認ステータス | **VoiceDrive** | ❌ ダミーデータ | BoardReport.status | 🔴 **要追加** |

**データ管理責任分界点**:
- ✅ **VoiceDriveが100%管理**: 理事会報告書の登録・管理

**解決策4A: BoardReportテーブルの追加**

```prisma
/// 理事会報告書テーブル
/// 理事会に提出する報告書を管理
model BoardReport {
  id                  String    @id @default(cuid())

  // 基本情報
  title               String    @map("title")
  description         String?   @map("description")
  category            String    @map("category")
  // "quarterly" | "hr" | "regional_collaboration" | "financial" | "other"

  // ステータス
  status              String    @default("draft") @map("status")
  // "draft" | "in_review" | "approved" | "rejected" | "published"
  preparationStatus   String?   @default("planning") @map("preparation_status")
  // "planning" | "writing" | "ready"

  // 承認フロー
  approvedBy          String?   @map("approved_by")
  approvedAt          DateTime? @map("approved_at")
  rejectedBy          String?   @map("rejected_by")
  rejectedAt          DateTime? @map("rejected_at")
  rejectionReason     String?   @map("rejection_reason")

  // 文書管理
  documentUrl         String?   @map("document_url")
  pdfUrl              String?   @map("pdf_url")
  attachments         Json?     @map("attachments")

  // 理事会関連
  boardMeetingId      String?   @map("board_meeting_id")
  presentationDate    DateTime? @map("presentation_date")

  // 作成者・更新者
  createdBy           String    @map("created_by")
  preparedBy          String?   @map("prepared_by")
  updatedBy           String?   @map("updated_by")

  // タイムスタンプ
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  boardMeeting        BoardMeeting? @relation("BoardReports", fields: [boardMeetingId], references: [id])
  creator             User      @relation("BoardReportCreator", fields: [createdBy], references: [id])
  approver            User?     @relation("BoardReportApprover", fields: [approvedBy], references: [id])

  @@index([status])
  @@index([boardMeetingId])
  @@index([presentationDate])
  @@index([createdAt])
  @@map("board_reports")
}
```

---

#### 4-2. 会議スケジュール（493-519行目）

**表示内容**:
```typescript
[
  {
    title: '定例理事会',
    date: '2025-01-15',
    time: '14:00-17:00'
  },
  {
    title: '経営会議',
    date: '2025-01-08',
    time: '10:00-12:00'
  },
  {
    title: '施設長会議',
    date: '2025-01-10',
    time: '13:00-15:00'
  }
]
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 会議スケジュール | **VoiceDrive** | ⚠️ 一部実装済み | BoardMeetingテーブル（schema.prisma 1469行目） | 🟡 **統合必要** |

**データ管理責任分界点**:
- ✅ **VoiceDriveが100%管理**: 会議スケジュール管理
- ⚠️ **BoardMeetingテーブルは既に定義済み**: ExecutiveFunctionsPageとの統合が未完了

---

#### 4-3. 重要決議事項（521-543行目）

**表示内容**:
```typescript
[
  {
    title: '新病棟建設承認',
    description: '総額2.5億円の投資案件を満場一致で承認',
    decidedAt: '2024年12月理事会'
  },
  {
    title: '人事制度改革推進',
    description: '働き方改革・評価制度見直しを2025年4月より実施',
    decidedAt: '2024年11月理事会'
  },
  {
    title: '地域連携協定締結',
    description: '近隣3医療機関との包括的連携協定',
    decidedAt: '2024年10月理事会'
  }
]
```

**必要なデータソース**:

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 重要決議事項 | **VoiceDrive** | ⚠️ 一部実装済み | BoardDecisionテーブル（schema.prisma 1673行目） | 🟡 **統合必要** |

**データ管理責任分界点**:
- ✅ **VoiceDriveが100%管理**: 決議事項の記録・管理
- ⚠️ **BoardDecisionテーブルは既に定義済み**: ExecutiveFunctionsPageとの統合が未完了

---

## 📊 必要な追加テーブル一覧

### VoiceDrive側で追加が必要

#### 🔴 優先度: 高（Phase 2実装必須）

**A. ExecutiveKeyIssue（経営重要課題）**
- 目的: 今期の重要課題を管理
- 影響範囲: 経営概要タブ 89-114行目

**B. StrategicInitiative（戦略イニシアチブ）**
- 目的: 戦略的プロジェクトを管理
- 影響範囲: 戦略イニシアチブタブ 152-238行目

**C. StrategicInitiativeRisk（イニシアチブリスク）**
- 目的: リスク管理
- 影響範囲: 戦略イニシアチブタブ 264-289行目

**D. BoardReport（理事会報告書）**
- 目的: 理事会報告書管理
- 影響範囲: 理事会レポートタブ 420-491行目

#### 🟡 優先度: 中（推奨）

**E. ExecutiveMonthlySummary（月次業績サマリー）**
- 目的: 月次業績の記録
- 影響範囲: 経営概要タブ 117-149行目

**F. OrganizationAnalyticsMetrics（組織分析メトリクス）**
- 目的: 組織健全度等の指標を記録
- 影響範囲: 組織分析タブ 294-417行目

### 既に実装済み（統合作業必要）

#### ✅ BoardMeetingAgendaテーブル
- 現状: schema.prisma 1393-1436行目に定義済み
- 必要作業: ExecutiveFunctionsPageとの統合

#### ✅ BoardMeetingテーブル
- 現状: schema.prisma 1469-1492行目に定義済み
- 必要作業: ExecutiveFunctionsPageとの統合

#### ✅ BoardDecisionテーブル
- 現状: schema.prisma 1673行目以降に定義済み
- 必要作業: ExecutiveFunctionsPageとの統合

#### ✅ ExecutiveStrategicInsightテーブル
- 現状: schema.prisma 2283-2307行目に定義済み
- 稼働予定: Phase 18.5（2026年1月）

---

## 🔄 医療システムへのAPI提供依頼

### A. 財務・経営データAPI（優先度: 🔴 HIGH）

**API 1: 経営KPI取得**
```typescript
GET /api/medical/executive/kpis
Response: {
  revenue: { total: number, growth: number },
  profit: { net: number, margin: number },
  staff: { total: number, facilities: number },
  patientSatisfaction: { overall: number, growth: number }
}
```

**API 2: ROI取得**
```typescript
GET /api/medical/executive/initiatives/{initiativeId}/roi
Response: {
  expectedRoi: number,
  actualRoi: number,
  calculation: {...}
}
```

**API 3: キーポジション充足率取得**
```typescript
GET /api/medical/executive/staffing-status
Response: {
  management: { current: number, required: number, rate: number },
  specialists: { current: number, required: number, rate: number },
  nextGen: { current: number, required: number, rate: number }
}
```

### B. 組織分析データAPI（優先度: 🟡 MEDIUM）

**API 4: リーダーシップ評価取得**
```typescript
GET /api/medical/executive/leadership-rating
Response: {
  overall: number,  // 0.0-5.0
  byFacility: {...}
}
```

**API 5: 組織能力評価取得**
```typescript
GET /api/medical/executive/organization-capabilities
Response: {
  execution: number,    // 0-100
  adaptation: number,   // 0-100
  cohesion: number,     // 0-100
  creativity: number    // 0-100
}
```

---

## 🎯 実装優先順位

### Phase 1: 基本機能の実データ化（3日）

**目標**: 経営概要タブが基本的に動作する

1. 🔴 **ExecutiveKeyIssueテーブル追加**
2. 🔴 **ExecutiveMonthlySummaryテーブル追加**
3. 🟡 **医療システムAPI（経営KPI）の呼び出し機能実装**（医療システム提供待ち）

**このPhaseで動作する機能**:
- ✅ 今期の重要課題（実データ、管理者が登録）
- ✅ 月次業績サマリー（実データ、管理者が登録）
- ⚠️ 経営KPIカード（医療システムAPI提供待ち）

---

### Phase 2: 戦略イニシアチブ管理（3日）

**目標**: 戦略イニシアチブタブが動作する

1. 🔴 **StrategicInitiativeテーブル追加**
2. 🔴 **StrategicInitiativeRiskテーブル追加**
3. 🟡 **医療システムAPI（ROI）の呼び出し機能実装**（医療システム提供待ち）

**このPhaseで動作する機能**:
- ✅ イニシアチブ管理（実データ）
- ✅ リスク管理（実データ）
- ⚠️ ROI分析（医療システムAPI提供待ち）

---

### Phase 3: 組織分析機能（2日）

**目標**: 組織分析タブが動作する

1. 🔴 **OrganizationAnalyticsMetricsテーブル追加**
2. 🔴 **組織分析集計サービス実装**
3. 🟡 **医療システムAPI（組織評価）の呼び出し機能実装**（医療システム提供待ち）

**このPhaseで動作する機能**:
- ✅ 組織健全度（VoiceDrive活動統計）
- ✅ イノベーション指数（VoiceDrive投稿分析）
- ⚠️ リーダーシップ評価（医療システムAPI提供待ち）
- ⚠️ 組織能力評価（医療システムAPI提供待ち）

---

### Phase 4: 理事会レポート管理（2日）

**目標**: 理事会レポートタブが動作する

1. 🔴 **BoardReportテーブル追加**
2. 🔴 **BoardMeeting/BoardDecisionテーブルとの統合**
3. 🔴 **報告書管理API実装**

**このPhaseで動作する機能**:
- ✅ 理事会報告書一覧（実データ）
- ✅ 会議スケジュール（実データ）
- ✅ 重要決議事項（実データ）

---

## 📋 データフロー図

### 現在の状態（Phase 0）
```
ExecutiveFunctionsPage
  ↓ 表示
経営概要: ダミーデータ（ハードコーディング）
戦略イニシアチブ: ダミーデータ（ハードコーディング）
組織分析: ダミーデータ（ハードコーディング）
理事会レポート: ダミーデータ（ハードコーディング）
```

### Phase 1完了後
```
ExecutiveFunctionsPage
  ↓ 表示
経営概要 ← ExecutiveKeyIssueテーブル（実データ）
         ← ExecutiveMonthlySummaryテーブル（実データ）
         ← 医療システムAPI（経営KPI）（API提供待ち）
戦略イニシアチブ: ダミーデータのまま
組織分析: ダミーデータのまま
理事会レポート: ダミーデータのまま
```

### Phase 2完了後
```
ExecutiveFunctionsPage
  ↓ 表示
経営概要 ← ExecutiveKeyIssueテーブル（実データ）
         ← ExecutiveMonthlySummaryテーブル（実データ）
         ← 医療システムAPI（経営KPI）（API提供待ち）
戦略イニシアチブ ← StrategicInitiativeテーブル（実データ）
                ← StrategicInitiativeRiskテーブル（実データ）
                ← 医療システムAPI（ROI）（API提供待ち）
組織分析: ダミーデータのまま
理事会レポート: ダミーデータのまま
```

### Phase 3完了後
```
ExecutiveFunctionsPage
  ↓ 表示
経営概要 ← ExecutiveKeyIssueテーブル（実データ）
         ← ExecutiveMonthlySummaryテーブル（実データ）
         ← 医療システムAPI（経営KPI）（API提供待ち）
戦略イニシアチブ ← StrategicInitiativeテーブル（実データ）
                ← StrategicInitiativeRiskテーブル（実データ）
                ← 医療システムAPI（ROI）（API提供待ち）
組織分析 ← OrganizationAnalyticsMetricsテーブル（実データ）
        ← VoiceDrive活動統計（実データ）
        ← 医療システムAPI（組織評価）（API提供待ち）
理事会レポート: ダミーデータのまま
```

### Phase 4完了後
```
ExecutiveFunctionsPage
  ↓ 表示
経営概要 ← ExecutiveKeyIssueテーブル（実データ）
         ← ExecutiveMonthlySummaryテーブル（実データ）
         ← 医療システムAPI（経営KPI）（API提供待ち）
戦略イニシアチブ ← StrategicInitiativeテーブル（実データ）
                ← StrategicInitiativeRiskテーブル（実データ）
                ← 医療システムAPI（ROI）（API提供待ち）
組織分析 ← OrganizationAnalyticsMetricsテーブル（実データ）
        ← VoiceDrive活動統計（実データ）
        ← 医療システムAPI（組織評価）（API提供待ち）
理事会レポート ← BoardReportテーブル（実データ）
            ← BoardMeetingテーブル（実データ）
            ← BoardDecisionテーブル（実データ）
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1（経営概要タブ）
- [ ] ExecutiveKeyIssueテーブル追加
- [ ] ExecutiveMonthlySummaryテーブル追加
- [ ] マイグレーション実行
- [ ] GET /api/executive/key-issues 実装
- [ ] POST /api/executive/key-issues 実装
- [ ] GET /api/executive/monthly-summary 実装
- [ ] POST /api/executive/monthly-summary 実装
- [ ] 医療システムAPI（経営KPI）呼び出し機能実装
- [ ] ExecutiveFunctionsPageの経営概要タブを実データに置き換え

#### Phase 2（戦略イニシアチブタブ）
- [ ] StrategicInitiativeテーブル追加
- [ ] StrategicInitiativeRiskテーブル追加
- [ ] マイグレーション実行
- [ ] GET /api/executive/initiatives 実装
- [ ] POST /api/executive/initiatives 実装
- [ ] GET /api/executive/initiatives/:id/risks 実装
- [ ] POST /api/executive/initiatives/:id/risks 実装
- [ ] 医療システムAPI（ROI）呼び出し機能実装
- [ ] ExecutiveFunctionsPageの戦略イニシアチブタブを実データに置き換え

#### Phase 3（組織分析タブ）
- [ ] OrganizationAnalyticsMetricsテーブル追加
- [ ] マイグレーション実行
- [ ] 組織分析集計サービス実装
- [ ] GET /api/executive/organization-metrics 実装
- [ ] POST /api/executive/organization-metrics 実装
- [ ] 医療システムAPI（組織評価）呼び出し機能実装
- [ ] ExecutiveFunctionsPageの組織分析タブを実データに置き換え

#### Phase 4（理事会レポートタブ）
- [ ] BoardReportテーブル追加
- [ ] マイグレーション実行
- [ ] GET /api/executive/board-reports 実装
- [ ] POST /api/executive/board-reports 実装
- [ ] BoardMeeting/BoardDecisionテーブルとの統合
- [ ] ExecutiveFunctionsPageの理事会レポートタブを実データに置き換え

### 医療システム側の実装

#### 財務・経営データAPI
- [ ] GET /api/medical/executive/kpis 実装
- [ ] GET /api/medical/executive/initiatives/{id}/roi 実装
- [ ] GET /api/medical/executive/staffing-status 実装

#### 組織分析データAPI
- [ ] GET /api/medical/executive/leadership-rating 実装
- [ ] GET /api/medical/executive/organization-capabilities 実装

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書_20251008.md](../データ管理責任分界点定義書_20251008.md)
- [ExecutiveDashboard_DB要件分析_20251019.md](../ExecutiveDashboard_DB要件分析_20251019.md)
- [議題モード関連ページ一覧_20251020.md](../議題モード関連ページ一覧_20251020.md)

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: DB構築時（Phase 1実装前）
