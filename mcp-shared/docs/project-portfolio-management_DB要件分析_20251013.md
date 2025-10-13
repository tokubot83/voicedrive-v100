# Project Portfolio Managementページ DB要件分析

**文書番号**: DB-REQ-2025-1013-003
**作成日**: 2025年10月13日
**対象ページ**: https://voicedrive-v100.vercel.app/project-portfolio-management
**参照文書**:
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [project-org-development_DB要件分析_20251013.md](./project-org-development_DB要件分析_20251013.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- C:\projects\voicedrive-v100\src\pages\ProjectPortfolioManagementPage.tsx

---

## 📋 分析サマリー

### 結論
Project Portfolio Managementページは**Level 18（理事会）向けの戦略的プロジェクト管理機能**で、**完全にダミーデータで構成**されています。実データ連携のためには**プロジェクト財務データの追加と集計機能の実装**が必要です。

### 🔴 重大な不足項目（即対応必要）

1. **プロジェクト財務データテーブル不足**
   - 投資額、期待リターン、ROI（17-29行目）
   - 現在完全にハードコード（38-142行目）

2. **戦略的評価データテーブル不足**
   - 戦略的影響度、緊急度、戦略整合性スコア
   - 現在完全にハードコード

3. **リソース配分テーブル不足**
   - 人日数、リソース配分率
   - ProjectTeamMemberは存在するが、リソース集計テーブルが不足

4. **プロジェクトカテゴリマスタ不足**
   - DX推進、働き方改革、医療連携など（596-611行目）
   - 現在ハードコード

5. **優先度マトリクス計算ロジック不足**
   - 影響度×緊急度のマトリクス（164-169行目、228-286行目）
   - 現在静的データ

### 🎯 ページの目的と表示内容

**アクセス権限**: Level 18（理事会）

**ページ概要**:
プロジェクトポートフォリオ管理ページ - 全プロジェクトの戦略的管理と意思決定支援

**4つのタブ構成**:

#### 1. 優先度マトリクスタブ（matrix）
- **サマリーカード**（181-225行目）:
  - 総プロジェクト数: 8件
  - 最優先プロジェクト: 2件（影響度・緊急度が高）
  - 総投資額: 1.583億円
  - 平均ROI: 176%

- **戦略的優先度マトリクス**（228-286行目）:
  - 影響度（1-5）× 緊急度（1-5）の散布図
  - 4象限（最優先、重要、緊急、通常）
  - プロジェクトのプロット表示

- **優先度別プロジェクト一覧**（289-322行目）:
  - プロジェクト名、カテゴリー
  - 影響度、緊急度スコア
  - ステータス（計画中、進行中、完了、中断）

#### 2. ROI分析タブ（roi）
- **ROIサマリー**（329-342行目）:
  - 総投資額: 1.58億円
  - 期待リターン: 3.07億円
  - ポートフォリオROI: 94.1%

- **プロジェクト別ROI**（345-387行目）:
  - 投資額、期待リターン、ROI（%）
  - ROI降順ソート

- **ROI分布**（390-413行目）:
  - 300%以上: 1件
  - 200-299%: 3件
  - 100-199%: 2件
  - 50-99%: 2件
  - 50%未満: 0件

#### 3. リソース配分タブ（resources）
- **リソースサマリー**（420-436行目）:
  - 総リソース配分: 1200人日
  - プロジェクト平均: 150人日/PJ
  - 最大リソースPJ: 450人日

- **プロジェクト別リソース配分**（439-467行目）:
  - リソース配分量（人日）
  - 全体比率（%）

- **最適化提案**（470-482行目）:
  - テキストベースの提案（AI生成想定）

#### 4. 戦略整合性タブ（strategic_alignment）
- **整合性サマリー**（489-511行目）:
  - 平均整合性スコア: 85点
  - 高整合性PJ（80点以上）: 6件
  - 要再評価PJ（70点未満）: 1件

- **経営戦略との整合性評価**（514-556行目）:
  - プロジェクト名、カテゴリー
  - 戦略整合性スコア（0-100）
  - 整合性スコア降順ソート

- **戦略的提言**（559-571行目）:
  - テキストベースの評価・提言

---

## 🔍 詳細分析

### 1. プロジェクト財務データ（17-29行目、38-142行目）

#### データ構造
```typescript
interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'suspended';
  strategicImpact: number;    // 1-5
  urgency: number;            // 1-5
  investment: number;         // 万円
  expectedReturn: number;     // 万円
  roi: number;                // %
  resourceAllocation: number; // 人日
  strategicAlignment: number; // 0-100
  category: string;
}
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| `id` | ✅ Post.id | ❌ | VoiceDrive | 既存 | ✅ OK |
| `name` | ✅ Post.title | ❌ | VoiceDrive | 既存 | ✅ OK |
| `status` | ✅ Post.approvalStatus | ❌ | VoiceDrive | 既存 | ✅ OK |
| `strategicImpact` | ❌ **新規** | ❌ | VoiceDrive | 新規テーブル | 🔴 **要追加** |
| `urgency` | ❌ **新規** | ❌ | VoiceDrive | 新規テーブル | 🔴 **要追加** |
| `investment` | ❌ **新規** | ❌ | VoiceDrive | 新規テーブル | 🔴 **要追加** |
| `expectedReturn` | ❌ **新規** | ❌ | VoiceDrive | 新規テーブル | 🔴 **要追加** |
| `roi` | ❌ **計算** | ❌ | VoiceDrive | 計算ロジック | 🔴 **要実装** |
| `resourceAllocation` | ⚠️ **集計** | ❌ | VoiceDrive | 集計ロジック | 🔴 **要実装** |
| `strategicAlignment` | ❌ **新規** | ❌ | VoiceDrive | 新規テーブル | 🔴 **要追加** |
| `category` | ⚠️ Post拡張 | ❌ | VoiceDrive | DB拡張 | 🔴 **要追加** |

#### 解決策1: プロジェクト財務・戦略データテーブル追加

**新規テーブル: `ProjectFinancial`**
```prisma
// VoiceDrive: prisma/schema.prisma
model ProjectFinancial {
  id                    String    @id @default(cuid())
  projectId             String    @unique @map("project_id")

  // 財務データ
  investmentAmount      Int       @default(0) @map("investment_amount")  // 投資額（万円）
  expectedReturn        Int       @default(0) @map("expected_return")    // 期待リターン（万円）
  roi                   Float     @default(0) @map("roi")                // ROI（%）
  actualCost            Int?      @map("actual_cost")                    // 実コスト（万円）
  actualReturn          Int?      @map("actual_return")                  // 実リターン（万円）

  // 予算管理
  budgetYear            Int       @map("budget_year")                    // 予算年度
  budgetDepartment      String?   @map("budget_department")              // 予算部署
  approvedBudget        Int?      @map("approved_budget")                // 承認済み予算

  // 財務承認
  financialApprovalStatus String?  @map("financial_approval_status")     // pending, approved, rejected
  financialApprovedBy     String?  @map("financial_approved_by")
  financialApprovedAt     DateTime? @map("financial_approved_at")

  // ROI計算日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  project               Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([budgetYear])
  @@index([roi])
  @@index([investmentAmount])
  @@map("project_financial")
}
```

**新規テーブル: `ProjectStrategicEvaluation`**
```prisma
model ProjectStrategicEvaluation {
  id                    String    @id @default(cuid())
  projectId             String    @unique @map("project_id")

  // 戦略的評価
  strategicImpact       Int       @default(3) @map("strategic_impact")     // 1-5
  urgency               Int       @default(3) @map("urgency")               // 1-5
  strategicAlignment    Int       @default(50) @map("strategic_alignment")  // 0-100

  // 優先度計算
  priorityQuadrant      String?   @map("priority_quadrant")
  // "high_priority" (最優先), "important" (重要), "urgent" (緊急), "normal" (通常)

  // 評価根拠
  impactReason          String?   @map("impact_reason")     @db.Text
  urgencyReason         String?   @map("urgency_reason")    @db.Text
  alignmentReason       String?   @map("alignment_reason")  @db.Text

  // 評価者・日時
  evaluatedBy           String?   @map("evaluated_by")
  evaluatedAt           DateTime? @map("evaluated_at")
  lastReviewedAt        DateTime? @map("last_reviewed_at")

  // 更新日時
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  project               Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([strategicImpact])
  @@index([urgency])
  @@index([strategicAlignment])
  @@index([priorityQuadrant])
  @@map("project_strategic_evaluation")
}
```

**Postモデルに追加**:
```prisma
model Post {
  // ... 既存フィールド

  // 🆕 プロジェクトカテゴリ
  projectCategory       String?   @map("project_category")
  // DX推進、働き方改革、医療連携、人材育成、患者サービス、設備投資、業務効率化、医療安全

  // 🆕 Relations
  financial             ProjectFinancial?
  strategicEvaluation   ProjectStrategicEvaluation?
}
```

**ROI計算ロジック**:
```typescript
// src/services/ProjectFinancialService.ts
export async function calculateProjectROI(projectId: string): Promise<number> {
  const financial = await prisma.projectFinancial.findUnique({
    where: { projectId }
  });

  if (!financial || financial.investmentAmount === 0) return 0;

  // ROI = ((期待リターン - 投資額) / 投資額) * 100
  const roi = ((financial.expectedReturn - financial.investmentAmount) / financial.investmentAmount) * 100;

  // ROIを更新
  await prisma.projectFinancial.update({
    where: { projectId },
    data: { roi, calculatedAt: new Date() }
  });

  return roi;
}

export async function calculatePortfolioROI(): Promise<number> {
  const allFinancials = await prisma.projectFinancial.findMany();

  const totalInvestment = allFinancials.reduce((sum, f) => sum + f.investmentAmount, 0);
  const totalReturn = allFinancials.reduce((sum, f) => sum + f.expectedReturn, 0);

  if (totalInvestment === 0) return 0;

  return ((totalReturn - totalInvestment) / totalInvestment) * 100;
}
```

**優先度象限計算ロジック**:
```typescript
// src/services/StrategicEvaluationService.ts
export function calculatePriorityQuadrant(
  impact: number,
  urgency: number
): 'high_priority' | 'important' | 'urgent' | 'normal' {
  if (impact >= 4 && urgency >= 4) return 'high_priority';  // 最優先
  if (impact >= 4 && urgency < 4) return 'important';       // 重要
  if (impact < 4 && urgency >= 4) return 'urgent';          // 緊急
  return 'normal';                                           // 通常
}

export async function updateProjectPriority(projectId: string) {
  const evaluation = await prisma.projectStrategicEvaluation.findUnique({
    where: { projectId }
  });

  if (!evaluation) return;

  const quadrant = calculatePriorityQuadrant(
    evaluation.strategicImpact,
    evaluation.urgency
  );

  await prisma.projectStrategicEvaluation.update({
    where: { projectId },
    data: { priorityQuadrant: quadrant }
  });
}
```

---

### 2. リソース配分データ（417-483行目）

#### 表示内容
```typescript
const totalResourceAllocation = projects.reduce((sum, p) => sum + p.resourceAllocation, 0);
// 総リソース配分: 1200人日
// プロジェクト平均: 150人日
// 最大リソースPJ: 450人日
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| プロジェクトメンバー数 | ✅ ProjectTeamMember | ❌ | VoiceDrive | 既存 | ✅ OK |
| 人日集計 | ❌ 集計必要 | ❌ | VoiceDrive | 集計テーブル | 🔴 **要追加** |
| リソース配分率 | ❌ 計算必要 | ❌ | VoiceDrive | 計算ロジック | 🔴 **要実装** |

#### 解決策2: プロジェクトリソース集計テーブル追加

**新規テーブル: `ProjectResourceSummary`**
```prisma
model ProjectResourceSummary {
  id                    String    @id @default(cuid())
  projectId             String    @unique @map("project_id")

  // リソース集計
  totalMembers          Int       @default(0) @map("total_members")
  estimatedPersonDays   Int       @default(0) @map("estimated_person_days")  // 見積人日
  actualPersonDays      Int?      @map("actual_person_days")                // 実績人日
  resourceAllocationRate Float    @default(0) @map("resource_allocation_rate") // 配分率（%）

  // 職種別リソース
  nursesCount           Int       @default(0) @map("nurses_count")
  doctorsCount          Int       @default(0) @map("doctors_count")
  adminCount            Int       @default(0) @map("admin_count")
  othersCount           Int       @default(0) @map("others_count")

  // リソース効率
  resourceEfficiency    Float?    @map("resource_efficiency")  // 効率性指標

  // 計算日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  project               Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([estimatedPersonDays])
  @@index([resourceAllocationRate])
  @@map("project_resource_summary")
}
```

**集計ロジック**:
```typescript
// src/services/ProjectResourceService.ts
export async function calculateProjectResourceSummary(projectId: string) {
  // メンバー数取得
  const members = await prisma.projectTeamMember.findMany({
    where: { projectId },
    include: { user: true }
  });

  const totalMembers = members.length;

  // 職種別集計
  const professionCounts = members.reduce((acc, member) => {
    const prof = member.user.professionCategory || 'others';
    acc[prof] = (acc[prof] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 見積人日（仮定：メンバー数 × 平均稼働日数）
  // 実際のプロジェクト期間やメンバーの稼働率から計算
  const project = await prisma.post.findUnique({ where: { id: projectId } });
  const estimatedPersonDays = totalMembers * 30; // 暫定: 1メンバーあたり30人日

  // 全プロジェクトのリソース合計
  const allSummaries = await prisma.projectResourceSummary.findMany();
  const totalResourceAllocation = allSummaries.reduce((sum, s) => sum + s.estimatedPersonDays, 0);
  const resourceAllocationRate = totalResourceAllocation > 0
    ? (estimatedPersonDays / totalResourceAllocation) * 100
    : 0;

  await prisma.projectResourceSummary.upsert({
    where: { projectId },
    create: {
      projectId,
      totalMembers,
      estimatedPersonDays,
      resourceAllocationRate,
      nursesCount: professionCounts['nurse'] || 0,
      doctorsCount: professionCounts['doctor'] || 0,
      adminCount: professionCounts['admin'] || 0,
      othersCount: totalMembers - (professionCounts['nurse'] || 0) - (professionCounts['doctor'] || 0) - (professionCounts['admin'] || 0),
      calculatedAt: new Date()
    },
    update: {
      totalMembers,
      estimatedPersonDays,
      resourceAllocationRate,
      nursesCount: professionCounts['nurse'] || 0,
      doctorsCount: professionCounts['doctor'] || 0,
      adminCount: professionCounts['admin'] || 0,
      othersCount: totalMembers - (professionCounts['nurse'] || 0) - (professionCounts['doctor'] || 0) - (professionCounts['admin'] || 0),
      calculatedAt: new Date()
    }
  });
}
```

---

### 3. プロジェクトカテゴリマスタ（596-611行目）

#### 現在のハードコード
```typescript
<select>
  <option value="all">全カテゴリー</option>
  <option value="DX推進">DX推進</option>
  <option value="働き方改革">働き方改革</option>
  <option value="医療連携">医療連携</option>
  <option value="人材育成">人材育成</option>
  <option value="患者サービス">患者サービス</option>
  <option value="設備投資">設備投資</option>
  <option value="業務効率化">業務効率化</option>
  <option value="医療安全">医療安全</option>
</select>
```

#### 解決策3: プロジェクトカテゴリマスタテーブル追加

**新規テーブル: `ProjectCategory`**
```prisma
model ProjectCategory {
  id                    String    @id @default(cuid())
  categoryCode          String    @unique @map("category_code")
  categoryName          String    @map("category_name")
  categoryNameEn        String?   @map("category_name_en")
  description           String?   @db.Text
  color                 String?   @map("color")  // 表示用カラー
  icon                  String?   @map("icon")   // アイコン名
  sortOrder             Int       @default(0) @map("sort_order")
  isActive              Boolean   @default(true) @map("is_active")

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@index([sortOrder])
  @@index([isActive])
  @@map("project_categories")
}
```

**初期データ挿入**:
```typescript
// prisma/seed.ts
const categories = [
  { categoryCode: 'dx', categoryName: 'DX推進', color: '#3b82f6', sortOrder: 1 },
  { categoryCode: 'workstyle', categoryName: '働き方改革', color: '#10b981', sortOrder: 2 },
  { categoryCode: 'collaboration', categoryName: '医療連携', color: '#8b5cf6', sortOrder: 3 },
  { categoryCode: 'training', categoryName: '人材育成', color: '#f59e0b', sortOrder: 4 },
  { categoryCode: 'service', categoryName: '患者サービス', color: '#ec4899', sortOrder: 5 },
  { categoryCode: 'equipment', categoryName: '設備投資', color: '#6366f1', sortOrder: 6 },
  { categoryCode: 'efficiency', categoryName: '業務効率化', color: '#14b8a6', sortOrder: 7 },
  { categoryCode: 'safety', categoryName: '医療安全', color: '#ef4444', sortOrder: 8 }
];

for (const cat of categories) {
  await prisma.projectCategory.upsert({
    where: { categoryCode: cat.categoryCode },
    create: cat,
    update: cat
  });
}
```

---

### 4. ポートフォリオ統計サマリー（171-177行目、181-225行目）

#### サマリーカード計算
```typescript
const totalInvestment = projects.reduce((sum, p) => sum + p.investment, 0);
const totalExpectedReturn = projects.reduce((sum, p) => sum + p.expectedReturn, 0);
const averageROI = projects.reduce((sum, p) => sum + p.roi, 0) / projects.length;
const totalResourceAllocation = projects.reduce((sum, p) => sum + p.resourceAllocation, 0);
const highPriorityCount = projects.filter(p => p.strategicImpact >= 4 && p.urgency >= 4).length;
```

#### 解決策4: ポートフォリオサマリーテーブル追加

**新規テーブル: `PortfolioSummary`**
```prisma
model PortfolioSummary {
  id                        String    @id @default(cuid())

  // 集計期間
  periodType                String    @map("period_type")  // quarter, year, all
  periodStart               DateTime  @map("period_start")
  periodEnd                 DateTime  @map("period_end")

  // プロジェクト統計
  totalProjects             Int       @default(0) @map("total_projects")
  activeProjects            Int       @default(0) @map("active_projects")
  completedProjects         Int       @default(0) @map("completed_projects")
  highPriorityProjects      Int       @default(0) @map("high_priority_projects")

  // 財務統計
  totalInvestment           Int       @default(0) @map("total_investment")         // 万円
  totalExpectedReturn       Int       @default(0) @map("total_expected_return")    // 万円
  portfolioROI              Float     @default(0) @map("portfolio_roi")            // %
  averageProjectROI         Float     @default(0) @map("average_project_roi")     // %

  // リソース統計
  totalResourceAllocation   Int       @default(0) @map("total_resource_allocation") // 人日
  averageResourcePerProject Int       @default(0) @map("average_resource_per_project")

  // 戦略整合性統計
  averageStrategicAlignment Float     @default(0) @map("average_strategic_alignment")
  highAlignmentProjects     Int       @default(0) @map("high_alignment_projects")  // 80点以上

  // 計算日時
  calculatedAt              DateTime  @default(now()) @map("calculated_at")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart])
  @@index([periodType])
  @@index([calculatedAt])
  @@map("portfolio_summary")
}
```

**集計バッチ**:
```typescript
// src/jobs/calculatePortfolioSummary.ts
export async function calculatePortfolioSummary(
  periodType: 'quarter' | 'year' | 'all',
  periodStart: Date,
  periodEnd: Date
) {
  // プロジェクト取得
  const projects = await prisma.post.findMany({
    where: {
      type: 'improvement',  // プロジェクトタイプ
      createdAt: periodType === 'all' ? undefined : { gte: periodStart, lte: periodEnd }
    },
    include: {
      financial: true,
      strategicEvaluation: true,
      resourceSummary: true
    }
  });

  // 統計計算
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.approvalStatus === 'in_progress').length;
  const completedProjects = projects.filter(p => p.approvalStatus === 'completed').length;

  const highPriorityProjects = projects.filter(p =>
    p.strategicEvaluation &&
    p.strategicEvaluation.strategicImpact >= 4 &&
    p.strategicEvaluation.urgency >= 4
  ).length;

  const totalInvestment = projects.reduce((sum, p) => sum + (p.financial?.investmentAmount || 0), 0);
  const totalExpectedReturn = projects.reduce((sum, p) => sum + (p.financial?.expectedReturn || 0), 0);
  const portfolioROI = totalInvestment > 0 ? ((totalExpectedReturn - totalInvestment) / totalInvestment) * 100 : 0;
  const averageProjectROI = projects.reduce((sum, p) => sum + (p.financial?.roi || 0), 0) / totalProjects;

  const totalResourceAllocation = projects.reduce((sum, p) => sum + (p.resourceSummary?.estimatedPersonDays || 0), 0);
  const averageResourcePerProject = totalProjects > 0 ? totalResourceAllocation / totalProjects : 0;

  const averageStrategicAlignment = projects.reduce((sum, p) => sum + (p.strategicEvaluation?.strategicAlignment || 0), 0) / totalProjects;
  const highAlignmentProjects = projects.filter(p =>
    p.strategicEvaluation && p.strategicEvaluation.strategicAlignment >= 80
  ).length;

  // 保存
  await prisma.portfolioSummary.upsert({
    where: {
      periodType_periodStart: {
        periodType,
        periodStart
      }
    },
    create: {
      periodType,
      periodStart,
      periodEnd,
      totalProjects,
      activeProjects,
      completedProjects,
      highPriorityProjects,
      totalInvestment,
      totalExpectedReturn,
      portfolioROI,
      averageProjectROI,
      totalResourceAllocation,
      averageResourcePerProject,
      averageStrategicAlignment,
      highAlignmentProjects,
      calculatedAt: new Date()
    },
    update: {
      totalProjects,
      activeProjects,
      completedProjects,
      highPriorityProjects,
      totalInvestment,
      totalExpectedReturn,
      portfolioROI,
      averageProjectROI,
      totalResourceAllocation,
      averageResourcePerProject,
      averageStrategicAlignment,
      highAlignmentProjects,
      calculatedAt: new Date()
    }
  });
}
```

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 最高（即対応）

**A. ProjectFinancial（プロジェクト財務データ）**
```prisma
model ProjectFinancial {
  id                      String    @id @default(cuid())
  projectId               String    @unique @map("project_id")
  investmentAmount        Int       @default(0) @map("investment_amount")
  expectedReturn          Int       @default(0) @map("expected_return")
  roi                     Float     @default(0) @map("roi")
  budgetYear              Int       @map("budget_year")
  financialApprovalStatus String?   @map("financial_approval_status")
  calculatedAt            DateTime  @default(now()) @map("calculated_at")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  project                 Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([budgetYear])
  @@index([roi])
  @@map("project_financial")
}
```

**理由**:
- ROI分析タブ（326-415行目）に必須
- 投資額、期待リターン、ROIの管理

---

**B. ProjectStrategicEvaluation（プロジェクト戦略評価）**
```prisma
model ProjectStrategicEvaluation {
  id                    String    @id @default(cuid())
  projectId             String    @unique @map("project_id")
  strategicImpact       Int       @default(3) @map("strategic_impact")
  urgency               Int       @default(3) @map("urgency")
  strategicAlignment    Int       @default(50) @map("strategic_alignment")
  priorityQuadrant      String?   @map("priority_quadrant")
  evaluatedBy           String?   @map("evaluated_by")
  evaluatedAt           DateTime? @map("evaluated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  project               Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([strategicImpact])
  @@index([urgency])
  @@index([strategicAlignment])
  @@map("project_strategic_evaluation")
}
```

**理由**:
- 優先度マトリクスタブ（178-324行目）に必須
- 戦略整合性タブ（486-573行目）に必須

---

**C. ProjectResourceSummary（プロジェクトリソース集計）**
```prisma
model ProjectResourceSummary {
  id                      String    @id @default(cuid())
  projectId               String    @unique @map("project_id")
  totalMembers            Int       @default(0) @map("total_members")
  estimatedPersonDays     Int       @default(0) @map("estimated_person_days")
  actualPersonDays        Int?      @map("actual_person_days")
  resourceAllocationRate  Float     @default(0) @map("resource_allocation_rate")
  calculatedAt            DateTime  @default(now()) @map("calculated_at")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  project                 Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([estimatedPersonDays])
  @@map("project_resource_summary")
}
```

**理由**:
- リソース配分タブ（417-484行目）に必須

---

#### 🔴 優先度: 高（推奨）

**D. PortfolioSummary（ポートフォリオサマリー）**
```prisma
model PortfolioSummary {
  id                        String    @id @default(cuid())
  periodType                String    @map("period_type")
  periodStart               DateTime  @map("period_start")
  periodEnd                 DateTime  @map("period_end")
  totalProjects             Int       @default(0) @map("total_projects")
  activeProjects            Int       @default(0) @map("active_projects")
  totalInvestment           Int       @default(0) @map("total_investment")
  totalExpectedReturn       Int       @default(0) @map("total_expected_return")
  portfolioROI              Float     @default(0) @map("portfolio_roi")
  totalResourceAllocation   Int       @default(0) @map("total_resource_allocation")
  averageStrategicAlignment Float     @default(0) @map("average_strategic_alignment")
  calculatedAt              DateTime  @default(now()) @map("calculated_at")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart])
  @@index([periodType])
  @@map("portfolio_summary")
}
```

**理由**:
- サマリーカードの高速表示
- 日次バッチで事前集計

---

#### 🟡 優先度: 中（推奨）

**E. ProjectCategory（プロジェクトカテゴリマスタ）**
```prisma
model ProjectCategory {
  id            String    @id @default(cuid())
  categoryCode  String    @unique @map("category_code")
  categoryName  String    @map("category_name")
  description   String?   @db.Text
  color         String?   @map("color")
  sortOrder     Int       @default(0) @map("sort_order")
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@index([sortOrder])
  @@map("project_categories")
}
```

**理由**:
- カテゴリーフィルタ（596-611行目）の動的生成
- カテゴリー管理の柔軟性向上

---

### 2. 既存テーブル修正（1件）

#### Modify-1: Postテーブルにプロジェクトカテゴリ追加

```prisma
model Post {
  // ... 既存フィールド

  // 🆕 プロジェクトカテゴリ
  projectCategory       String?   @map("project_category")

  // 🆕 Relations
  financial             ProjectFinancial?
  strategicEvaluation   ProjectStrategicEvaluation?
  resourceSummary       ProjectResourceSummary?
}
```

---

### 3. 医療システム側で追加が必要

**なし**

Project Portfolio Managementページは完全にVoiceDrive側の管理機能のため、医療システム側での追加実装は不要。

---

## 🎯 実装優先順位

### Phase 1: プロジェクト財務・戦略評価機能（3-4日）

**目標**: 優先度マトリクスとROI分析タブが動作する

1. 🔴 **ProjectFinancialテーブル追加**
   ```bash
   npx prisma migrate dev --name add_project_financial
   ```

2. 🔴 **ProjectStrategicEvaluationテーブル追加**
   ```bash
   npx prisma migrate dev --name add_project_strategic_evaluation
   ```

3. 🔴 **Post.projectCategory追加**
   ```prisma
   model Post {
     projectCategory  String?  @map("project_category")
   }
   ```

4. 🔴 **ROI計算サービス実装**
   ```typescript
   // src/services/ProjectFinancialService.ts
   export async function calculateProjectROI(projectId: string) { /* ... */ }
   ```

5. 🔴 **優先度象限計算ロジック実装**
   ```typescript
   // src/services/StrategicEvaluationService.ts
   export function calculatePriorityQuadrant() { /* ... */ }
   ```

**このPhaseで動作する機能**:
- ✅ 優先度マトリクスタブ（実データ）
- ✅ ROI分析タブ（実データ）
- ✅ 戦略整合性タブ（実データ）
- ⚠️ リソース配分タブ（簡易版）

---

### Phase 2: リソース配分機能（2-3日）

**目標**: リソース配分タブが完全動作する

1. 🔴 **ProjectResourceSummaryテーブル追加**
   ```bash
   npx prisma migrate dev --name add_project_resource_summary
   ```

2. 🔴 **リソース集計サービス実装**
   ```typescript
   // src/services/ProjectResourceService.ts
   export async function calculateProjectResourceSummary(projectId: string) { /* ... */ }
   ```

3. 🔴 **リソース集計バッチ実装**
   ```typescript
   // src/jobs/calculateProjectResources.ts
   ```

**このPhaseで動作する機能**:
- ✅ リソース配分タブ（実データ）
- ✅ リソース最適化提案（基本版）

---

### Phase 3: ポートフォリオサマリー集計（1-2日）

**目標**: サマリーカードの高速表示

1. 🔴 **PortfolioSummaryテーブル追加**
   ```bash
   npx prisma migrate dev --name add_portfolio_summary
   ```

2. 🔴 **ポートフォリオ集計バッチ実装**
   ```typescript
   // src/jobs/calculatePortfolioSummary.ts
   ```

3. 🔴 **日次バッチスケジュール設定**

**このPhaseで動作する機能**:
- ✅ 高速なサマリーカード表示
- ✅ 期間別ポートフォリオ分析

---

### Phase 4: カテゴリマスタ・拡張機能（1-2日）

**目標**: カテゴリー管理の柔軟性向上

1. 🟡 **ProjectCategoryテーブル追加**
   ```bash
   npx prisma migrate dev --name add_project_category
   ```

2. 🟡 **カテゴリーシードデータ投入**

3. 🟡 **カテゴリーフィルタの動的生成**

---

## 📊 データフロー図

### フロー1: 優先度マトリクス表示

```
ProjectPortfolioManagementPage - 優先度マトリクスタブ
  ↓ データ取得
ProjectStrategicEvaluation (戦略評価)
  ← Post (プロジェクト基本情報)

  ↓ 表示
- 影響度×緊急度マトリクス
- 優先度象限（最優先、重要、緊急、通常）
```

---

### フロー2: ROI分析表示

```
ProjectPortfolioManagementPage - ROI分析タブ
  ↓ データ取得
ProjectFinancial (財務データ)
  ← Post (プロジェクト基本情報)

  ↓ 計算
ROI = ((期待リターン - 投資額) / 投資額) * 100

  ↓ 表示
- 投資額、期待リターン、ROI
- ROI分布グラフ
```

---

### フロー3: リソース配分表示

```
ProjectPortfolioManagementPage - リソース配分タブ
  ↓ データ取得
ProjectResourceSummary (リソース集計)
  ← ProjectTeamMember (メンバーリスト)
  ← User (職員情報)

  ↓ 表示
- 総リソース配分（人日）
- プロジェクト別配分率
```

---

### フロー4: ポートフォリオサマリー集計

```
日次バッチ (深夜2:00)
  ↓ 集計
Post (プロジェクト一覧)
  + ProjectFinancial (財務データ)
  + ProjectStrategicEvaluation (戦略評価)
  + ProjectResourceSummary (リソース)

  ↓ 保存
PortfolioSummary (ポートフォリオサマリー)

  ↓ 表示
ProjectPortfolioManagementPage - サマリーカード
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1: プロジェクト財務・戦略評価
- [ ] ProjectFinancialテーブル追加
- [ ] ProjectStrategicEvaluationテーブル追加
- [ ] Post.projectCategory追加
- [ ] マイグレーション実行
- [ ] ROI計算サービス実装
- [ ] 優先度象限計算ロジック実装
- [ ] 優先度マトリクスタブ実装
- [ ] ROI分析タブ実装
- [ ] 戦略整合性タブ実装

#### Phase 2: リソース配分
- [ ] ProjectResourceSummaryテーブル追加
- [ ] マイグレーション実行
- [ ] リソース集計サービス実装
- [ ] リソース集計バッチ実装
- [ ] リソース配分タブ実装

#### Phase 3: ポートフォリオサマリー
- [ ] PortfolioSummaryテーブル追加
- [ ] マイグレーション実行
- [ ] ポートフォリオ集計バッチ実装
- [ ] 日次バッチスケジュール設定
- [ ] サマリーカードの実データ連携

#### Phase 4: カテゴリマスタ
- [ ] ProjectCategoryテーブル追加
- [ ] マイグレーション実行
- [ ] カテゴリーシードデータ投入
- [ ] カテゴリーフィルタの動的生成

### テスト

- [ ] ROI計算の単体テスト
- [ ] 優先度象限計算の単体テスト
- [ ] リソース集計の単体テスト
- [ ] ポートフォリオ集計の単体テスト
- [ ] 統合テスト（全タブ）
- [ ] パフォーマンステスト（100プロジェクト）
- [ ] E2Eテスト（ProjectPortfolioManagement全機能）

---

## 🔗 関連ドキュメント

- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [project-org-development_DB要件分析](./project-org-development_DB要件分析_20251013.md)
- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
次回レビュー: Phase 1実装後
