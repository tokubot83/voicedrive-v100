# Project Organization Developmentページ DB要件分析

**文書番号**: DB-REQ-2025-1013-002
**作成日**: 2025年10月13日
**対象ページ**: https://voicedrive-v100.vercel.app/project-org-development
**参照文書**:
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- C:\projects\voicedrive-v100\src\pages\ProjectOrgDevelopmentPage.tsx

---

## 📋 分析サマリー

### 結論
Project Organization Developmentページは**完全にダミーデータで構成**されており、実データ連携のためには**大規模な新規テーブル追加とプロジェクト管理機能の実装**が必要です。

### 🔴 重大な不足項目（即対応必要）

1. **部門間コラボレーション追跡テーブル不足**
   - 部門ペア別のプロジェクト数、コラボレーションスコア
   - 現在完全にハードコード（48-77行目）

2. **リーダーシップ育成追跡テーブル不足**
   - プロジェクトリーダーの成長記録、成功率
   - 現在完全にハードコード（80-105行目）

3. **イノベーション創出追跡テーブル不足**
   - カテゴリ別アイデア生成数、プロジェクト化率
   - 現在完全にハードコード（108-137行目）

4. **組織文化指標テーブル不足**
   - 参加率、エンゲージメント、コラボスコア
   - 現在完全にハードコード（140-146行目）

5. **プロジェクト詳細管理テーブル不足**
   - プロジェクトの成功/失敗記録、チームメンバー、期間
   - Projectテーブルは存在するが、組織開発分析に必要な詳細情報が不足

### 🎯 ページの目的と表示内容

**アクセス権限**: Level 16+（戦略企画・統括管理部門員以上）

**ページ概要**:
組織開発インサイトページ - プロジェクトを通じた組織開発の効果測定と分析

**4つのタブ構成**:

#### 1. コラボレーションタブ（collaboration）
- **サマリーカード**（163-196行目）:
  - 部門間プロジェクト数: 35件
  - コラボスコア: 75/100
  - 参加率: 72.5%

- **部門間コラボレーション状況**（198-229行目）:
  - 部門ペア名（例: 「看護部 × 医療技術部」）
  - プロジェクト数: 12件
  - コラボレーションスコア: 85/100
  - トレンド: up/down/stable（±15%）

- **組織開発インサイト**（232-242行目）:
  - AI生成または手動入力のインサイトテキスト

#### 2. リーダーシップタブ（leadership）
- **サマリー**（249-266行目）:
  - リーダー候補: 23名
  - 平均成功率: 89%
  - 総プロジェクト: 67件
  - 平均チーム規模: 11.5名

- **リーダーシップ育成トラッキング**（269-320行目）:
  - 名前: 山田 次郎
  - 現在の役職: 副主任
  - プロジェクト主導: 3件
  - チーム規模: 12名
  - 成功率: 92%
  - 成長スコア: 88/100

#### 3. イノベーションタブ（innovation）
- **イノベーション指標**（327-349行目）:
  - イノベーション指数: 82/100
  - 平均実装率: 25.8%

- **カテゴリー別イノベーション創出**（352-389行目）:
  - カテゴリー: 業務効率化
  - アイデア生成: 45件
  - プロジェクト化: 12件
  - 実装率: 26.7%
  - 影響度スコア: 78/100

- **イノベーション創出トレンド**（392-401行目）:
  - グラフプレースホルダー（実装予定）

#### 4. 組織文化タブ（culture）
- **組織文化指標**（407-440行目）:
  - 参加率: 72.5%
  - 従業員エンゲージメント: 78/100
  - コラボスコア: 75/100

- **組織文化変革の兆候**（443-472行目）:
  - オープンなコミュニケーション: 82/100 (up)
  - 部門間の協力意識: 75/100 (up)
  - 継続的改善の姿勢: 78/100 (stable)
  - イノベーションへの意欲: 80/100 (up)
  - 組織への帰属意識: 73/100 (up)

- **戦略的提言**（475-487行目）:
  - テキストベースの提言（3つの箇条書き）

---

## 🔍 詳細分析

### 1. 部門間コラボレーション追跡（コラボレーションタブ）

#### 表示内容（48-77行目、160-243行目）
```typescript
interface CollaborationMetric {
  departmentPair: string;         // "看護部 × 医療技術部"
  projectCount: number;           // 12
  collaborationScore: number;     // 85 (0-100)
  trend: 'up' | 'down' | 'stable';
  trendValue: number;             // 15 (%)
}

// サマリー
cultureMetrics.crossDepartmentProjects: 35 // 部門間プロジェクト総数
cultureMetrics.collaborationScore: 75      // 全体コラボスコア
cultureMetrics.participationRate: 72.5     // 参加率 (%)
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 部門間プロジェクト数 | VoiceDrive | ❌ ダミーデータ | `DepartmentCollaboration` | 🔴 **要追加** |
| コラボレーションスコア | VoiceDrive | ❌ ダミーデータ | `DepartmentCollaboration` | 🔴 **要追加** |
| トレンド計算 | VoiceDrive | ❌ ダミーデータ | `CollaborationHistory` | 🔴 **要追加** |
| 参加率 | VoiceDrive | ❌ ダミーデータ | `ProjectTeamMember` (一部存在) | 🟡 **要拡張** |
| 部門マスタ | 医療システム | ✅ 提供可能 | Employee.department | ✅ OK |

#### 解決策1: 部門間コラボレーション追跡テーブル

**新規テーブル: `DepartmentCollaboration`**
```prisma
// VoiceDrive: prisma/schema.prisma
model DepartmentCollaboration {
  id                    String    @id @default(cuid())

  // 部門ペア識別
  department1           String    @map("department_1")
  department2           String    @map("department_2")
  facilityId            String?   @map("facility_id")

  // 集計期間
  periodType            String    @map("period_type")  // quarter, year, all
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")

  // コラボレーション指標
  projectCount          Int       @default(0) @map("project_count")
  collaborationScore    Float     @default(0) @map("collaboration_score")  // 0-100

  // トレンド計算用
  previousScore         Float?    @map("previous_score")
  trendDirection        String?   @map("trend_direction")  // up, down, stable
  trendValue            Float?    @map("trend_value")      // パーセント変化

  // 詳細メトリクス
  successfulProjects    Int       @default(0) @map("successful_projects")
  activeProjects        Int       @default(0) @map("active_projects")
  completedProjects     Int       @default(0) @map("completed_projects")

  // 計算日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@unique([department1, department2, periodType, periodStart])
  @@index([facilityId])
  @@index([periodStart])
  @@index([collaborationScore])
  @@map("department_collaboration")
}
```

**コラボレーションスコア計算ロジック**:
```typescript
// src/services/OrganizationDevelopmentService.ts
export async function calculateCollaborationScore(
  dept1: string,
  dept2: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  // プロジェクトの成功率、参加人数、期間などから算出
  const projects = await prisma.project.findMany({
    where: {
      createdAt: { gte: periodStart, lte: periodEnd },
      teamMembers: {
        some: {
          OR: [
            { user: { department: dept1 } },
            { user: { department: dept2 } }
          ]
        }
      }
    },
    include: {
      teamMembers: { include: { user: true } }
    }
  });

  let score = 0;

  // スコア計算ロジック:
  // 1. プロジェクト数（最大30点）
  const projectScore = Math.min(projects.length * 2.5, 30);
  score += projectScore;

  // 2. 成功率（最大40点）
  const successCount = projects.filter(p => p.status === 'completed' && p.outcome === 'success').length;
  const successRate = projects.length > 0 ? (successCount / projects.length) * 40 : 0;
  score += successRate;

  // 3. 参加人数の多様性（最大30点）
  const dept1Members = new Set();
  const dept2Members = new Set();
  projects.forEach(p => {
    p.teamMembers.forEach(m => {
      if (m.user.department === dept1) dept1Members.add(m.userId);
      if (m.user.department === dept2) dept2Members.add(m.userId);
    });
  });
  const diversityScore = Math.min((dept1Members.size + dept2Members.size) * 1.5, 30);
  score += diversityScore;

  return Math.min(Math.round(score), 100);
}
```

---

### 2. リーダーシップ育成追跡（リーダーシップタブ）

#### 表示内容（80-105行目、246-322行目）
```typescript
interface LeadershipDevelopment {
  name: string;              // "山田 次郎"
  currentRole: string;       // "副主任"
  projectsLed: number;       // 3
  teamSize: number;          // 12
  successRate: number;       // 92 (%)
  growthScore: number;       // 88 (0-100)
}

// サマリー
リーダー候補: 23名
平均成功率: 89%
総プロジェクト: 67件
平均チーム規模: 11.5名
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| プロジェクトリーダー記録 | VoiceDrive | ⚠️ 一部存在 | `Project.leaderId`（新規） | 🔴 **要追加** |
| プロジェクト成功/失敗 | VoiceDrive | ⚠️ 一部存在 | `Project.outcome`（新規） | 🔴 **要追加** |
| チームサイズ | VoiceDrive | ✅ 動作中 | `ProjectTeamMember` (既存) | ✅ OK |
| リーダー成長スコア | VoiceDrive | ❌ ダミーデータ | `LeadershipDevelopment` | 🔴 **要追加** |
| 職員の役職 | 医療システム | ✅ 提供可能 | Employee.position | ✅ OK |

#### 解決策2: リーダーシップ育成追跡テーブル

**Projectテーブルの拡張**:
```prisma
model Project {
  id                String    @id @default(cuid())
  // ... 既存フィールド

  // 🆕 リーダーシップ追跡用フィールド
  leaderId          String?   @map("leader_id")           // プロジェクトリーダー
  outcome           String?   @map("outcome")             // success, failure, partial
  successScore      Float?    @map("success_score")       // 0-100
  impactLevel       String?   @map("impact_level")        // low, medium, high, critical

  // Relations
  leader            User?     @relation("ProjectLeader", fields: [leaderId], references: [id])
}

// Userモデルに追加
model User {
  // ... 既存フィールド
  ledProjects       Project[] @relation("ProjectLeader")  // 🆕
}
```

**新規テーブル: `LeadershipDevelopment`**
```prisma
model LeadershipDevelopment {
  id                    String    @id @default(cuid())
  userId                String    @map("user_id")

  // 集計期間
  periodType            String    @map("period_type")  // quarter, year, all
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")

  // リーダーシップ指標
  projectsLed           Int       @default(0) @map("projects_led")
  successfulProjects    Int       @default(0) @map("successful_projects")
  failedProjects        Int       @default(0) @map("failed_projects")
  successRate           Float     @default(0) @map("success_rate")      // 0-100%

  // チーム管理指標
  averageTeamSize       Float     @default(0) @map("average_team_size")
  totalTeamMembers      Int       @default(0) @map("total_team_members")
  teamRetentionRate     Float?    @map("team_retention_rate")           // メンバー定着率

  // 成長スコア
  growthScore           Float     @default(0) @map("growth_score")      // 0-100
  previousGrowthScore   Float?    @map("previous_growth_score")
  growthTrend           String?   @map("growth_trend")                  // up, down, stable

  // 詳細メトリクス
  collaborationScore    Float?    @map("collaboration_score")           // コラボ能力
  innovationScore       Float?    @map("innovation_score")              // 革新性
  problemSolvingScore   Float?    @map("problem_solving_score")         // 問題解決能力
  communicationScore    Float?    @map("communication_score")           // コミュニケーション能力

  // 計算日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id])

  @@unique([userId, periodType, periodStart])
  @@index([userId])
  @@index([growthScore])
  @@index([successRate])
  @@map("leadership_development")
}

// Userモデルに追加
model User {
  // ... 既存フィールド
  leadershipDevelopment LeadershipDevelopment[] // 🆕
}
```

**成長スコア計算ロジック**:
```typescript
// src/services/LeadershipService.ts
export async function calculateGrowthScore(
  userId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const projects = await prisma.project.findMany({
    where: {
      leaderId: userId,
      createdAt: { gte: periodStart, lte: periodEnd }
    },
    include: {
      teamMembers: true
    }
  });

  if (projects.length === 0) return 0;

  let score = 0;

  // 1. プロジェクト成功率（40点）
  const successCount = projects.filter(p => p.outcome === 'success').length;
  const successRate = (successCount / projects.length) * 40;
  score += successRate;

  // 2. プロジェクト数（30点）
  const projectScore = Math.min(projects.length * 5, 30);
  score += projectScore;

  // 3. チーム規模（20点）
  const avgTeamSize = projects.reduce((sum, p) => sum + p.teamMembers.length, 0) / projects.length;
  const teamScore = Math.min(avgTeamSize * 2, 20);
  score += teamScore;

  // 4. 成長トレンド（10点）
  // 前期と比較して改善しているか
  const previousPeriod = await prisma.leadershipDevelopment.findFirst({
    where: {
      userId,
      periodEnd: { lt: periodStart }
    },
    orderBy: { periodEnd: 'desc' }
  });

  if (previousPeriod && previousPeriod.successRate > 0) {
    const currentSuccessRate = (successCount / projects.length) * 100;
    const improvement = currentSuccessRate - previousPeriod.successRate;
    if (improvement > 10) score += 10;
    else if (improvement > 5) score += 5;
  }

  return Math.min(Math.round(score), 100);
}
```

---

### 3. イノベーション創出追跡（イノベーションタブ）

#### 表示内容（108-137行目、324-402行目）
```typescript
interface InnovationMetric {
  category: string;          // "業務効率化"
  ideasGenerated: number;    // 45
  projectsLaunched: number;  // 12
  implementationRate: number; // 26.7 (%)
  impactScore: number;       // 78 (0-100)
}

// イノベーション指標
cultureMetrics.innovationIndex: 82  // 0-100
平均実装率: 25.8%
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| アイデア生成数 | VoiceDrive | ⚠️ 一部存在 | `Post` (type='improvement') | 🟡 **要拡張** |
| プロジェクト化記録 | VoiceDrive | ❌ ダミーデータ | `IdeaToProject` | 🔴 **要追加** |
| 実装率 | VoiceDrive | ❌ ダミーデータ | `InnovationMetric` | 🔴 **要追加** |
| 影響度スコア | VoiceDrive | ❌ ダミーデータ | `Project.impactLevel` | 🔴 **要追加** |
| カテゴリー分類 | VoiceDrive | ✅ 動作中 | `Post.category` (既存) | ✅ OK |

#### 解決策3: イノベーション創出追跡テーブル

**新規テーブル: `IdeaToProjectLink`**
```prisma
model IdeaToProjectLink {
  id                    String    @id @default(cuid())

  // アイデアソース（議題モード投稿）
  postId                String    @map("post_id")
  postCategory          String    @map("post_category")  // improvement, innovation, etc

  // プロジェクト化
  projectId             String?   @map("project_id")
  isProjectLaunched     Boolean   @default(false) @map("is_project_launched")
  launchedAt            DateTime? @map("launched_at")

  // 実装状態
  isImplemented         Boolean   @default(false) @map("is_implemented")
  implementedAt         DateTime? @map("implemented_at")
  implementationScore   Float?    @map("implementation_score")  // 0-100

  // 影響度
  impactLevel           String?   @map("impact_level")  // low, medium, high, critical
  impactScore           Float?    @map("impact_score")  // 0-100

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  post                  Post?     @relation(fields: [postId], references: [id])
  project               Project?  @relation(fields: [projectId], references: [id])

  @@unique([postId])
  @@index([postCategory])
  @@index([isProjectLaunched])
  @@index([isImplemented])
  @@map("idea_to_project_link")
}

// Postモデルに追加
model Post {
  // ... 既存フィールド
  ideaToProjectLink     IdeaToProjectLink? // 🆕
}

// Projectモデルに追加
model Project {
  // ... 既存フィールド
  ideaLinks             IdeaToProjectLink[] // 🆕
}
```

**新規テーブル: `InnovationMetric`**
```prisma
model InnovationMetric {
  id                    String    @id @default(cuid())

  // カテゴリー
  category              String    @map("category")  // improvement, safety, service, workstyle

  // 集計期間
  periodType            String    @map("period_type")  // quarter, year, all
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")

  // イノベーション指標
  ideasGenerated        Int       @default(0) @map("ideas_generated")
  projectsLaunched      Int       @default(0) @map("projects_launched")
  projectsImplemented   Int       @default(0) @map("projects_implemented")
  implementationRate    Float     @default(0) @map("implementation_rate")  // %

  // 影響度スコア
  impactScore           Float     @default(0) @map("impact_score")  // 0-100
  averageImpactLevel    String?   @map("average_impact_level")

  // トレンド
  previousImpactScore   Float?    @map("previous_impact_score")
  trendDirection        String?   @map("trend_direction")  // up, down, stable

  // 計算日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@unique([category, periodType, periodStart])
  @@index([category])
  @@index([periodStart])
  @@index([impactScore])
  @@map("innovation_metric")
}
```

---

### 4. 組織文化指標（組織文化タブ）

#### 表示内容（140-146行目、404-489行目）
```typescript
const cultureMetrics = {
  participationRate: 72.5,     // %
  crossDepartmentProjects: 35,
  employeeEngagement: 78,      // 0-100
  innovationIndex: 82,         // 0-100
  collaborationScore: 75       // 0-100
};

// 組織文化変革の兆候（446-471行目）
[
  { label: 'オープンなコミュニケーション', value: 82, trend: 'up' },
  { label: '部門間の協力意識', value: 75, trend: 'up' },
  { label: '継続的改善の姿勢', value: 78, trend: 'stable' },
  { label: 'イノベーションへの意欲', value: 80, trend: 'up' },
  { label: '組織への帰属意識', value: 73, trend: 'up' }
]
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 参加率 | VoiceDrive | ❌ ダミーデータ | `OrganizationCultureMetric` | 🔴 **要追加** |
| 従業員エンゲージメント | VoiceDrive | ❌ ダミーデータ | `OrganizationCultureMetric` | 🔴 **要追加** |
| コラボスコア | VoiceDrive | ❌ ダミーデータ | `DepartmentCollaboration` (前述) | 🔴 **要追加** |
| 文化変革の兆候 | VoiceDrive | ❌ ダミーデータ | `CultureChangeIndicator` | 🔴 **要追加** |
| イノベーション指数 | VoiceDrive | ❌ ダミーデータ | `InnovationMetric` (前述) | 🔴 **要追加** |

#### 解決策4: 組織文化指標テーブル

**新規テーブル: `OrganizationCultureMetric`**
```prisma
model OrganizationCultureMetric {
  id                        String    @id @default(cuid())

  // 集計期間
  periodType                String    @map("period_type")  // quarter, year, all
  periodStart               DateTime  @map("period_start")
  periodEnd                 DateTime  @map("period_end")

  // 施設フィルタ
  facilityId                String?   @map("facility_id")

  // 参加率指標
  totalEmployees            Int       @default(0) @map("total_employees")
  activeParticipants        Int       @default(0) @map("active_participants")
  participationRate         Float     @default(0) @map("participation_rate")  // %

  // プロジェクト指標
  totalProjects             Int       @default(0) @map("total_projects")
  crossDepartmentProjects   Int       @default(0) @map("cross_department_projects")

  // エンゲージメント指標
  employeeEngagement        Float     @default(0) @map("employee_engagement")  // 0-100
  collaborationScore        Float     @default(0) @map("collaboration_score")  // 0-100
  innovationIndex           Float     @default(0) @map("innovation_index")     // 0-100

  // トレンド
  previousEngagement        Float?    @map("previous_engagement")
  engagementTrend           String?   @map("engagement_trend")  // up, down, stable

  // 計算日時
  calculatedAt              DateTime  @default(now()) @map("calculated_at")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart, facilityId])
  @@index([facilityId])
  @@index([periodStart])
  @@map("organization_culture_metric")
}
```

**新規テーブル: `CultureChangeIndicator`**
```prisma
model CultureChangeIndicator {
  id                    String    @id @default(cuid())

  // 指標名
  indicatorName         String    @map("indicator_name")
  // オープンなコミュニケーション、部門間の協力意識、継続的改善の姿勢、など

  indicatorKey          String    @map("indicator_key")
  // open_communication, cross_department_cooperation, continuous_improvement, etc

  // 集計期間
  periodType            String    @map("period_type")  // quarter, year, all
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")

  // 指標値
  value                 Float     @default(0) @map("value")  // 0-100
  previousValue         Float?    @map("previous_value")
  trend                 String?   @map("trend")  // up, down, stable
  trendValue            Float?    @map("trend_value")  // ポイント変化

  // 計算方法メタデータ
  calculationMethod     String?   @map("calculation_method")  @db.Text
  dataSource            String?   @map("data_source")

  // 計算日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@unique([indicatorKey, periodType, periodStart])
  @@index([indicatorKey])
  @@index([periodStart])
  @@index([value])
  @@map("culture_change_indicator")
}
```

**エンゲージメント計算ロジック**:
```typescript
// src/services/CultureMetricsService.ts
export async function calculateEmployeeEngagement(
  periodStart: Date,
  periodEnd: Date,
  facilityId?: string
): Promise<number> {
  // VoiceDrive活動データから計算

  // 1. ログイン頻度（20点）
  const users = await prisma.user.findMany({
    where: {
      facilityId: facilityId || undefined,
      lastLoginAt: { gte: periodStart, lte: periodEnd }
    }
  });
  const loginScore = Math.min((users.length / 100) * 20, 20);

  // 2. 投稿・投票活動（30点）
  const posts = await prisma.post.count({
    where: {
      createdAt: { gte: periodStart, lte: periodEnd },
      author: { facilityId: facilityId || undefined }
    }
  });
  const votes = await prisma.voteHistory.count({
    where: {
      votedAt: { gte: periodStart, lte: periodEnd },
      user: { facilityId: facilityId || undefined }
    }
  });
  const activityScore = Math.min((posts + votes) / 10, 30);

  // 3. プロジェクト参加（30点）
  const projectParticipants = await prisma.projectTeamMember.count({
    where: {
      joinedAt: { gte: periodStart, lte: periodEnd },
      user: { facilityId: facilityId || undefined }
    }
  });
  const projectScore = Math.min(projectParticipants * 2, 30);

  // 4. フィードバック送受信（20点）
  const feedbacks = await prisma.feedback.count({
    where: {
      createdAt: { gte: periodStart, lte: periodEnd },
      OR: [
        { sender: { facilityId: facilityId || undefined } },
        { receiver: { facilityId: facilityId || undefined } }
      ]
    }
  });
  const feedbackScore = Math.min(feedbacks * 2, 20);

  return Math.min(Math.round(loginScore + activityScore + projectScore + feedbackScore), 100);
}
```

---

## 📋 必要な追加テーブル一覧

### VoiceDrive側で追加が必要

#### 🔴 優先度: 最高（即対応）

**A. DepartmentCollaboration（部門間コラボレーション追跡）**
- 理由: コラボレーションタブの全データに必須
- 影響: 163-242行目が完全にダミーデータ

**B. LeadershipDevelopment（リーダーシップ育成追跡）**
- 理由: リーダーシップタブの全データに必須
- 影響: 246-322行目が完全にダミーデータ

**C. InnovationMetric（イノベーション創出指標）**
- 理由: イノベーションタブの全データに必須
- 影響: 324-402行目が完全にダミーデータ

**D. OrganizationCultureMetric（組織文化指標）**
- 理由: 組織文化タブのサマリーデータに必須
- 影響: 404-440行目が完全にダミーデータ

**E. CultureChangeIndicator（文化変革指標）**
- 理由: 組織文化タブの詳細指標に必須
- 影響: 443-472行目が完全にダミーデータ

**F. IdeaToProjectLink（アイデアからプロジェクトへのリンク）**
- 理由: イノベーション創出の実装率計算に必須
- 影響: プロジェクト化率、実装率の正確な追跡

#### 🔴 優先度: 高（推奨）

**G. Projectテーブルの拡張**
```prisma
model Project {
  // ... 既存フィールド

  // 🆕 追加必要フィールド
  leaderId          String?   @map("leader_id")           // プロジェクトリーダー
  outcome           String?   @map("outcome")             // success, failure, partial
  successScore      Float?    @map("success_score")       // 0-100
  impactLevel       String?   @map("impact_level")        // low, medium, high, critical
  impactScore       Float?    @map("impact_score")        // 0-100
}
```

---

## 🎯 実装優先順位

### Phase 1: プロジェクト管理機能の強化（3-5日）

**目標**: Projectテーブルに必要な情報を追加

1. 🔴 **Projectテーブル拡張**
   - `leaderId`, `outcome`, `successScore`, `impactLevel`, `impactScore`追加
   - マイグレーション実行

2. 🔴 **プロジェクト作成UI修正**
   - リーダー選択機能追加
   - 影響度レベル設定機能追加

3. 🔴 **プロジェクト完了処理修正**
   - 成功/失敗の記録機能追加
   - 成功スコア入力UI追加

**このPhaseで可能になること**:
- リーダーシップ育成追跡の基礎データ収集
- イノベーション影響度の測定

---

### Phase 2: 組織開発指標の計算（5-7日）

**目標**: 日次バッチで組織開発指標を計算

1. 🔴 **新規テーブル追加**
   - `DepartmentCollaboration`
   - `LeadershipDevelopment`
   - `InnovationMetric`
   - `OrganizationCultureMetric`
   - `CultureChangeIndicator`
   - `IdeaToProjectLink`

2. 🔴 **計算サービス実装**
   ```typescript
   // src/services/OrganizationDevelopmentService.ts
   export async function calculateAllMetrics(periodStart: Date, periodEnd: Date) {
     await calculateDepartmentCollaboration(periodStart, periodEnd);
     await calculateLeadershipDevelopment(periodStart, periodEnd);
     await calculateInnovationMetrics(periodStart, periodEnd);
     await calculateCultureMetrics(periodStart, periodEnd);
     await calculateCultureChangeIndicators(periodStart, periodEnd);
   }
   ```

3. 🔴 **日次バッチ実装**
   ```typescript
   // src/jobs/calculateOrganizationMetrics.ts
   export async function dailyOrganizationMetricsCalculation() {
     const today = new Date();
     const quarterStart = getQuarterStart(today);
     const yearStart = getYearStart(today);

     // 四半期集計
     await calculateAllMetrics(quarterStart, today);

     // 年間集計
     await calculateAllMetrics(yearStart, today);

     // 全期間集計
     await calculateAllMetrics(new Date('2025-01-01'), today);
   }
   ```

**このPhaseで可能になること**:
- 4つのタブ全てで実データ表示
- トレンド分析（前期比較）

---

### Phase 3: ProjectOrgDevelopmentページの実装修正（2-3日）

**目標**: ダミーデータを実データに置き換え

1. 🔴 **APIエンドポイント実装**
   ```typescript
   // src/api/routes/organization-development.routes.ts

   // GET /api/organization-development/collaboration
   router.get('/collaboration', async (req, res) => {
     const { period } = req.query;
     const data = await prisma.departmentCollaboration.findMany({
       where: { periodType: period }
     });
     res.json(data);
   });

   // GET /api/organization-development/leadership
   router.get('/leadership', async (req, res) => {
     const { period } = req.query;
     const data = await prisma.leadershipDevelopment.findMany({
       where: { periodType: period },
       include: { user: true }
     });
     res.json(data);
   });

   // GET /api/organization-development/innovation
   router.get('/innovation', async (req, res) => {
     const { period } = req.query;
     const data = await prisma.innovationMetric.findMany({
       where: { periodType: period }
     });
     res.json(data);
   });

   // GET /api/organization-development/culture
   router.get('/culture', async (req, res) => {
     const { period } = req.query;
     const metrics = await prisma.organizationCultureMetric.findFirst({
       where: { periodType: period }
     });
     const indicators = await prisma.cultureChangeIndicator.findMany({
       where: { periodType: period }
     });
     res.json({ metrics, indicators });
   });
   ```

2. 🔴 **Reactコンポーネント修正**
   ```typescript
   // src/pages/ProjectOrgDevelopmentPage.tsx

   // ダミーデータを削除（48-146行目）
   // API呼び出しに置き換え

   const [collaborationData, setCollaborationData] = useState<CollaborationMetric[]>([]);
   const [leadershipData, setLeadershipData] = useState<LeadershipDevelopment[]>([]);
   const [innovationData, setInnovationData] = useState<InnovationMetric[]>([]);
   const [cultureMetrics, setCultureMetrics] = useState<any>(null);

   useEffect(() => {
     async function fetchData() {
       const collab = await fetch(`/api/organization-development/collaboration?period=${selectedPeriod}`);
       setCollaborationData(await collab.json());

       const leader = await fetch(`/api/organization-development/leadership?period=${selectedPeriod}`);
       setLeadershipData(await leader.json());

       const innovation = await fetch(`/api/organization-development/innovation?period=${selectedPeriod}`);
       setInnovationData(await innovation.json());

       const culture = await fetch(`/api/organization-development/culture?period=${selectedPeriod}`);
       setCultureMetrics(await culture.json());
     }

     fetchData();
   }, [selectedPeriod]);
   ```

**このPhaseで完了する機能**:
- ✅ 全タブで実データ表示
- ✅ 期間フィルタ（四半期/年間/全期間）動作
- ✅ トレンド表示（前期比較）

---

### Phase 4: 高度な分析機能（オプション、3-5日）

**目標**: AI生成インサイトとトレンドグラフ実装

1. 🟡 **AI生成インサイト**
   - 組織開発インサイト（232-242行目）をAI生成に変更
   - LLM（Claude or GPT）で分析結果から自動生成

2. 🟡 **トレンドグラフ実装**
   - イノベーション創出トレンド（392-401行目）
   - Recharts使用、月次データ表示

3. 🟡 **ドリルダウン機能**
   - 部門ペアクリックで詳細表示
   - リーダー名クリックで個別分析表示

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
ProjectOrgDevelopmentPage
  ↓ 表示
すべてダミーデータ (48-146行目)
  - collaborationData (ハードコード)
  - leadershipData (ハードコード)
  - innovationData (ハードコード)
  - cultureMetrics (ハードコード)
```

### Phase 1完了後
```
ProjectOrgDevelopmentPage
  ↓ 表示
すべてダミーデータ (変わらず)
  ↓
BUT: ProjectテーブルにleaderId, outcome, impactLevel追加
      → 将来の計算準備完了
```

### Phase 2完了後
```
日次バッチ (深夜2:00)
  ↓ 計算
OrganizationDevelopmentService
  ├─ calculateDepartmentCollaboration()
  ├─ calculateLeadershipDevelopment()
  ├─ calculateInnovationMetrics()
  ├─ calculateCultureMetrics()
  └─ calculateCultureChangeIndicators()
  ↓ 保存
DepartmentCollaboration, LeadershipDevelopment, InnovationMetric,
OrganizationCultureMetric, CultureChangeIndicator テーブル
```

### Phase 3完了後（最終形態）
```
ProjectOrgDevelopmentPage
  ↓ API呼び出し
GET /api/organization-development/collaboration?period=quarter
GET /api/organization-development/leadership?period=quarter
GET /api/organization-development/innovation?period=quarter
GET /api/organization-development/culture?period=quarter
  ↓ データ取得
DepartmentCollaboration, LeadershipDevelopment, InnovationMetric,
OrganizationCultureMetric, CultureChangeIndicator テーブル
  ↓ 表示
実データでコラボレーション、リーダーシップ、イノベーション、組織文化タブを表示
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1: プロジェクト管理強化
- [ ] Projectテーブルに `leaderId`, `outcome`, `successScore`, `impactLevel`, `impactScore`追加
- [ ] マイグレーション実行
- [ ] プロジェクト作成UIにリーダー選択追加
- [ ] プロジェクト完了処理に成功/失敗記録追加

#### Phase 2: 組織開発指標計算
- [ ] `DepartmentCollaboration`テーブル追加
- [ ] `LeadershipDevelopment`テーブル追加
- [ ] `InnovationMetric`テーブル追加
- [ ] `OrganizationCultureMetric`テーブル追加
- [ ] `CultureChangeIndicator`テーブル追加
- [ ] `IdeaToProjectLink`テーブル追加
- [ ] マイグレーション実行
- [ ] OrganizationDevelopmentService実装
- [ ] LeadershipService実装
- [ ] CultureMetricsService実装
- [ ] 日次バッチ実装

#### Phase 3: ページ実装修正
- [ ] `/api/organization-development/*` APIエンドポイント実装
- [ ] ProjectOrgDevelopmentPageのダミーデータ削除
- [ ] API呼び出し実装
- [ ] エラーハンドリング実装
- [ ] ローディング状態表示実装

#### Phase 4: 高度な分析（オプション）
- [ ] AI生成インサイト実装
- [ ] トレンドグラフ実装（Recharts）
- [ ] ドリルダウン機能実装

### テスト
- [ ] コラボレーションスコア計算の単体テスト
- [ ] 成長スコア計算の単体テスト
- [ ] エンゲージメント計算の単体テスト
- [ ] 日次バッチの統合テスト
- [ ] APIエンドポイントのテスト
- [ ] E2Eテスト（ProjectOrgDevelopment全機能）

---

## 🔗 関連ドキュメント

- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書_20251008.md](./共通DB構築後統合作業再開計画書_20251008.md)
- [MySQL_Migration_Guide.md](../../docs/MySQL_Migration_Guide.md)

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
次回レビュー: Phase 1実装後
