# Project Portfolio Management 暫定マスターリスト

**文書番号**: MASTER-LIST-2025-1013-003
**作成日**: 2025年10月13日
**対象ページ**: Project Portfolio Management（プロジェクトポートフォリオ管理）
**参照文書**:
- [project-portfolio-management_DB要件分析_20251013.md](./project-portfolio-management_DB要件分析_20251013.md)
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)
- [project-org-development暫定マスターリスト_20251013.md](./project-org-development暫定マスターリスト_20251013.md)

---

## 📋 実装優先順位サマリー

| Phase | 期間 | 優先度 | 状態 |
|-------|-----|--------|------|
| Phase 0 | 現在 | - | ❌ 完全ダミーデータ |
| Phase 1 | 3-4日 | 🔴 最高 | ⏳ 財務・戦略評価 |
| Phase 2 | 2-3日 | 🔴 最高 | ⏳ リソース配分 |
| Phase 3 | 1-2日 | 🔴 高 | ⏳ ポートフォリオサマリー |
| Phase 4 | 1-2日 | 🟡 中 | ⏳ カテゴリマスタ |

**総所要時間**: 7-11日（Phase 1-3のみ）、8-13日（Phase 4含む）

---

## 🎯 Phase 1: プロジェクト財務・戦略評価機能（3-4日）

### 目標
優先度マトリクス、ROI分析、戦略整合性タブが動作する

### 実装項目

#### 1. ProjectFinancialテーブルの追加 ⏳ 未実装

**ファイル**: `prisma/schema.prisma`

**追加テーブル**:
```prisma
model ProjectFinancial {
  id                      String    @id @default(cuid())
  projectId               String    @unique @map("project_id")

  // 財務データ
  investmentAmount        Int       @default(0) @map("investment_amount")  // 投資額（万円）
  expectedReturn          Int       @default(0) @map("expected_return")    // 期待リターン（万円）
  roi                     Float     @default(0) @map("roi")                // ROI（%）
  actualCost              Int?      @map("actual_cost")                    // 実コスト（万円）
  actualReturn            Int?      @map("actual_return")                  // 実リターン（万円）

  // 予算管理
  budgetYear              Int       @map("budget_year")                    // 予算年度
  budgetDepartment        String?   @map("budget_department")              // 予算部署
  approvedBudget          Int?      @map("approved_budget")                // 承認済み予算

  // 財務承認
  financialApprovalStatus String?   @map("financial_approval_status")     // pending, approved, rejected
  financialApprovedBy     String?   @map("financial_approved_by")
  financialApprovedAt     DateTime? @map("financial_approved_at")

  // 計算日時
  calculatedAt            DateTime  @default(now()) @map("calculated_at")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  project                 Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([budgetYear])
  @@index([roi])
  @@index([investmentAmount])
  @@map("project_financial")
}
```

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: なし

---

#### 2. ProjectStrategicEvaluationテーブルの追加 ⏳ 未実装

**ファイル**: `prisma/schema.prisma`

**追加テーブル**:
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

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: なし

---

#### 3. Postテーブルの拡張 ⏳ 未実装

**ファイル**: `prisma/schema.prisma`

**追加フィールド**:
```prisma
model Post {
  // ... 既存フィールド

  // 🆕 プロジェクトカテゴリ
  projectCategory       String?   @map("project_category")

  // 🆕 Relations
  financial             ProjectFinancial?
  strategicEvaluation   ProjectStrategicEvaluation?
}
```

**推定工数**: 0.2日
**優先度**: 🔴 最高
**依存関係**: 項目1, 2完了後

---

#### 4. マイグレーション実行 ⏳ 未実装

**コマンド**:
```bash
npx prisma migrate dev --name add_project_portfolio_management
npx prisma generate
```

**推定工数**: 0.3日（テスト含む）
**優先度**: 🔴 最高
**依存関係**: 項目1, 2, 3完了後

---

#### 5. ROI計算サービスの実装 ⏳ 未実装

**対象ファイル**: `src/services/ProjectFinancialService.ts`（新規作成）

**実装内容**:
```typescript
// src/services/ProjectFinancialService.ts

/**
 * プロジェクトのROIを計算
 */
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

/**
 * ポートフォリオ全体のROIを計算
 */
export async function calculatePortfolioROI(): Promise<{
  totalInvestment: number;
  totalExpectedReturn: number;
  portfolioROI: number;
}> {
  const allFinancials = await prisma.projectFinancial.findMany();

  const totalInvestment = allFinancials.reduce((sum, f) => sum + f.investmentAmount, 0);
  const totalReturn = allFinancials.reduce((sum, f) => sum + f.expectedReturn, 0);

  if (totalInvestment === 0) {
    return { totalInvestment: 0, totalExpectedReturn: 0, portfolioROI: 0 };
  }

  const portfolioROI = ((totalReturn - totalInvestment) / totalInvestment) * 100;

  return {
    totalInvestment,
    totalExpectedReturn: totalReturn,
    portfolioROI
  };
}
```

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: 項目4完了後

---

#### 6. 優先度象限計算ロジックの実装 ⏳ 未実装

**対象ファイル**: `src/services/StrategicEvaluationService.ts`（新規作成）

**実装内容**:
```typescript
// src/services/StrategicEvaluationService.ts

export type PriorityQuadrant = 'high_priority' | 'important' | 'urgent' | 'normal';

/**
 * 影響度と緊急度から優先度象限を計算
 */
export function calculatePriorityQuadrant(
  impact: number,
  urgency: number
): PriorityQuadrant {
  if (impact >= 4 && urgency >= 4) return 'high_priority';  // 最優先
  if (impact >= 4 && urgency < 4) return 'important';       // 重要
  if (impact < 4 && urgency >= 4) return 'urgent';          // 緊急
  return 'normal';                                           // 通常
}

/**
 * プロジェクトの優先度象限を更新
 */
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

/**
 * 戦略整合性スコアを評価
 */
export function evaluateStrategicAlignment(
  projectCategory: string,
  strategicGoals: string[]
): number {
  // 簡易評価ロジック（実際はより複雑な評価）
  const categoryScores: Record<string, number> = {
    'DX推進': 95,
    '医療安全': 98,
    '医療連携': 92,
    '働き方改革': 88,
    '患者サービス': 82,
    '設備投資': 85,
    '人材育成': 75,
    '業務効率化': 68
  };

  return categoryScores[projectCategory] || 50;
}
```

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: 項目4完了後

---

#### 7. APIエンドポイントの実装 ⏳ 未実装

**対象ファイル**: `src/api/routes/portfolio.routes.ts`（新規作成）

**実装エンドポイント**:
```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateProjectROI, calculatePortfolioROI } from '../../services/ProjectFinancialService';
import { calculatePriorityQuadrant } from '../../services/StrategicEvaluationService';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/portfolio/projects
// 全プロジェクトの財務・戦略データ取得
router.get('/projects', async (req, res) => {
  const projects = await prisma.post.findMany({
    where: { type: 'improvement' },
    include: {
      financial: true,
      strategicEvaluation: true,
      author: {
        select: { name: true, department: true }
      }
    }
  });

  res.json({ projects });
});

// GET /api/portfolio/summary
// ポートフォリオサマリー取得
router.get('/summary', async (req, res) => {
  const { totalInvestment, totalExpectedReturn, portfolioROI } = await calculatePortfolioROI();

  const projects = await prisma.post.findMany({
    where: { type: 'improvement' },
    include: { strategicEvaluation: true }
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.approvalStatus === 'in_progress').length;
  const highPriorityProjects = projects.filter(p =>
    p.strategicEvaluation &&
    p.strategicEvaluation.strategicImpact >= 4 &&
    p.strategicEvaluation.urgency >= 4
  ).length;

  res.json({
    totalProjects,
    activeProjects,
    highPriorityProjects,
    totalInvestment,
    totalExpectedReturn,
    portfolioROI
  });
});

// POST /api/portfolio/projects/:projectId/financial
// プロジェクト財務データ登録・更新
router.post('/projects/:projectId/financial', async (req, res) => {
  const { projectId } = req.params;
  const { investmentAmount, expectedReturn, budgetYear } = req.body;

  const financial = await prisma.projectFinancial.upsert({
    where: { projectId },
    create: {
      projectId,
      investmentAmount,
      expectedReturn,
      budgetYear,
      roi: 0
    },
    update: {
      investmentAmount,
      expectedReturn,
      budgetYear
    }
  });

  // ROI計算
  await calculateProjectROI(projectId);

  res.json({ financial });
});

// POST /api/portfolio/projects/:projectId/evaluation
// プロジェクト戦略評価登録・更新
router.post('/projects/:projectId/evaluation', async (req, res) => {
  const { projectId } = req.params;
  const { strategicImpact, urgency, strategicAlignment } = req.body;

  const priorityQuadrant = calculatePriorityQuadrant(strategicImpact, urgency);

  const evaluation = await prisma.projectStrategicEvaluation.upsert({
    where: { projectId },
    create: {
      projectId,
      strategicImpact,
      urgency,
      strategicAlignment,
      priorityQuadrant
    },
    update: {
      strategicImpact,
      urgency,
      strategicAlignment,
      priorityQuadrant
    }
  });

  res.json({ evaluation });
});

export default router;
```

**APIサーバーへの登録**:
```typescript
// src/api/server.ts
import portfolioRoutes from './routes/portfolio.routes';

app.use('/api/portfolio', portfolioRoutes);
```

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: 項目5, 6完了後

---

#### 8. ProjectPortfolioManagementPageの修正 ⏳ 未実装

**対象ファイル**: `src/pages/ProjectPortfolioManagementPage.tsx`

**修正内容**:

1. **ダミーデータ削除**（38-142行目）
2. **APIフック実装**

```typescript
// 🆕 カスタムフック
function usePortfolioData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [projectsRes, summaryRes] = await Promise.all([
          fetch('/api/portfolio/projects').then(r => r.json()),
          fetch('/api/portfolio/summary').then(r => r.json())
        ]);

        setProjects(projectsRes.projects);
        setSummary(summaryRes);
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { projects, summary, loading, error };
}

// コンポーネント内で使用
const ProjectPortfolioManagementPage: React.FC = () => {
  const { projects, summary, loading, error } = usePortfolioData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!summary) return <NoDataMessage />;

  // ... 既存のレンダリングロジック
};
```

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: 項目7完了後

---

### Phase 1完了基準
- ✅ ProjectFinancial, ProjectStrategicEvaluationテーブル追加完了
- ✅ マイグレーション成功
- ✅ ROI計算サービス動作確認
- ✅ 優先度象限計算ロジック動作確認
- ✅ APIエンドポイント動作確認
- ✅ 優先度マトリクスタブで実データ表示
- ✅ ROI分析タブで実データ表示
- ✅ 戦略整合性タブで実データ表示

---

## 🎯 Phase 2: リソース配分機能（2-3日）

### 目標
リソース配分タブが完全動作する

### 実装項目

#### 9. ProjectResourceSummaryテーブルの追加 ⏳ 未実装

**ファイル**: `prisma/schema.prisma`

**追加テーブル**:
```prisma
model ProjectResourceSummary {
  id                      String    @id @default(cuid())
  projectId               String    @unique @map("project_id")

  // リソース集計
  totalMembers            Int       @default(0) @map("total_members")
  estimatedPersonDays     Int       @default(0) @map("estimated_person_days")  // 見積人日
  actualPersonDays        Int?      @map("actual_person_days")                // 実績人日
  resourceAllocationRate  Float     @default(0) @map("resource_allocation_rate") // 配分率（%）

  // 職種別リソース
  nursesCount             Int       @default(0) @map("nurses_count")
  doctorsCount            Int       @default(0) @map("doctors_count")
  adminCount              Int       @default(0) @map("admin_count")
  othersCount             Int       @default(0) @map("others_count")

  // リソース効率
  resourceEfficiency      Float?    @map("resource_efficiency")  // 効率性指標

  // 計算日時
  calculatedAt            DateTime  @default(now()) @map("calculated_at")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  project                 Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([estimatedPersonDays])
  @@index([resourceAllocationRate])
  @@map("project_resource_summary")
}

// Postモデルに追加
model Post {
  // ... 既存
  resourceSummary       ProjectResourceSummary?  // 🆕
}
```

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: Phase 1完了後

---

#### 10. マイグレーション実行 ⏳ 未実装

**コマンド**:
```bash
npx prisma migrate dev --name add_project_resource_summary
npx prisma generate
```

**推定工数**: 0.2日
**優先度**: 🔴 最高
**依存関係**: 項目9完了後

---

#### 11. リソース集計サービスの実装 ⏳ 未実装

**対象ファイル**: `src/services/ProjectResourceService.ts`（新規作成）

**実装内容**:
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
  const estimatedPersonDays = totalMembers * 30; // 暫定: 1メンバーあたり30人日

  // 全プロジェクトのリソース合計
  const allSummaries = await prisma.projectResourceSummary.findMany();
  const totalResourceAllocation = allSummaries.reduce((sum, s) => sum + s.estimatedPersonDays, 0) + estimatedPersonDays;
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

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: 項目10完了後

---

#### 12. リソース集計バッチの実装 ⏳ 未実装

**対象ファイル**: `src/jobs/calculateProjectResources.ts`（新規作成）

**実装内容**:
```typescript
import cron from 'node-cron';
import { calculateProjectResourceSummary } from '../services/ProjectResourceService';

// 日次バッチ: プロジェクトリソース集計（深夜3:00）
cron.schedule('0 3 * * *', async () => {
  logger.info('[Batch] Calculating project resource summaries...');

  const projects = await prisma.post.findMany({
    where: { type: 'improvement' },
    select: { id: true }
  });

  for (const project of projects) {
    await calculateProjectResourceSummary(project.id);
  }

  logger.info(`[Batch] Resource calculation complete (${projects.length} projects)`);
});
```

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: 項目11完了後

---

#### 13. APIエンドポイント追加 ⏳ 未実装

**対象ファイル**: `src/api/routes/portfolio.routes.ts`

**追加エンドポイント**:
```typescript
// GET /api/portfolio/resources
router.get('/resources', async (req, res) => {
  const resources = await prisma.projectResourceSummary.findMany({
    include: {
      project: {
        select: {
          title: true,
          projectCategory: true,
          approvalStatus: true
        }
      }
    },
    orderBy: { estimatedPersonDays: 'desc' }
  });

  const totalResourceAllocation = resources.reduce((sum, r) => sum + r.estimatedPersonDays, 0);

  res.json({
    resources,
    totalResourceAllocation,
    averageResourcePerProject: resources.length > 0 ? totalResourceAllocation / resources.length : 0
  });
});
```

**推定工数**: 0.3日
**優先度**: 🔴 最高
**依存関係**: 項目11完了後

---

#### 14. リソース配分タブの実データ連携 ⏳ 未実装

**対象ファイル**: `src/pages/ProjectPortfolioManagementPage.tsx`

**修正内容**:
- リソース配分タブのダミーデータをAPI呼び出しに置き換え
- リソース最適化提案の動的生成（オプション）

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: 項目13完了後

---

### Phase 2完了基準
- ✅ ProjectResourceSummaryテーブル追加完了
- ✅ マイグレーション成功
- ✅ リソース集計サービス動作確認
- ✅ リソース集計バッチ動作確認
- ✅ リソース配分タブで実データ表示

---

## 🎯 Phase 3: ポートフォリオサマリー集計（1-2日）

### 目標
サマリーカードの高速表示

### 実装項目

#### 15. PortfolioSummaryテーブルの追加 ⏳ 未実装

**ファイル**: `prisma/schema.prisma`

**追加テーブル**:
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

**推定工数**: 0.3日
**優先度**: 🔴 高
**依存関係**: Phase 2完了後

---

#### 16. マイグレーション実行 ⏳ 未実装

**コマンド**:
```bash
npx prisma migrate dev --name add_portfolio_summary
npx prisma generate
```

**推定工数**: 0.2日
**優先度**: 🔴 高
**依存関係**: 項目15完了後

---

#### 17. ポートフォリオ集計バッチの実装 ⏳ 未実装

**対象ファイル**: `src/jobs/calculatePortfolioSummary.ts`（新規作成）

**実装内容** (詳細はDB要件分析を参照):
```typescript
import cron from 'node-cron';

// 日次バッチ: ポートフォリオサマリー集計（深夜4:00）
cron.schedule('0 4 * * *', async () => {
  logger.info('[Batch] Calculating portfolio summary...');

  const today = new Date();
  const quarterStart = getQuarterStart(today);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  // 四半期集計
  await calculatePortfolioSummary('quarter', quarterStart, today);

  // 年間集計
  await calculatePortfolioSummary('year', yearStart, today);

  // 全期間集計
  await calculatePortfolioSummary('all', new Date('2025-01-01'), today);

  logger.info('[Batch] Portfolio summary calculation complete');
});
```

**推定工数**: 0.5日
**優先度**: 🔴 高
**依存関係**: 項目16完了後

---

#### 18. サマリーAPIエンドポイントの修正 ⏳ 未実装

**対象ファイル**: `src/api/routes/portfolio.routes.ts`

**修正内容**:
- `/api/portfolio/summary` エンドポイントをPortfolioSummaryテーブルから取得するように変更

**推定工数**: 0.2日
**優先度**: 🔴 高
**依存関係**: 項目17完了後

---

### Phase 3完了基準
- ✅ PortfolioSummaryテーブル追加完了
- ✅ マイグレーション成功
- ✅ ポートフォリオ集計バッチ動作確認
- ✅ サマリーカードが高速表示

---

## 🎯 Phase 4: カテゴリマスタ・拡張機能（1-2日）

### 目標
カテゴリー管理の柔軟性向上

### 実装項目

#### 19. ProjectCategoryテーブルの追加 ⏳ 未実装（オプション）

**ファイル**: `prisma/schema.prisma`

**追加テーブル**:
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

**推定工数**: 0.3日
**優先度**: 🟡 中
**依存関係**: Phase 3完了後

---

#### 20. カテゴリーシードデータ投入 ⏳ 未実装（オプション）

**対象ファイル**: `prisma/seed.ts`

**実装内容**:
```typescript
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

**推定工数**: 0.2日
**優先度**: 🟡 中
**依存関係**: 項目19完了後

---

#### 21. カテゴリーフィルタの動的生成 ⏳ 未実装（オプション）

**対象ファイル**: `src/pages/ProjectPortfolioManagementPage.tsx`

**修正内容**:
- カテゴリーフィルタ（596-611行目）をProjectCategoryテーブルから動的生成

**推定工数**: 0.5日
**優先度**: 🟡 中
**依存関係**: 項目20完了後

---

### Phase 4完了基準
- ✅ ProjectCategoryテーブル追加完了
- ✅ カテゴリーシードデータ投入完了
- ✅ カテゴリーフィルタの動的生成動作確認

---

## 📊 全体タイムライン

| フェーズ | 項目 | 推定工数 | 優先度 | 開始条件 |
|---------|-----|---------|--------|---------|
| **Phase 1** | 財務・戦略評価 | **3-4日** | 🔴 最高 | - |
| 項目1 | ProjectFinancialテーブル追加 | 0.5日 | 🔴 | - |
| 項目2 | ProjectStrategicEvaluationテーブル追加 | 0.5日 | 🔴 | - |
| 項目3 | Postテーブル拡張 | 0.2日 | 🔴 | 項目1,2完了 |
| 項目4 | マイグレーション実行 | 0.3日 | 🔴 | 項目3完了 |
| 項目5 | ROI計算サービス実装 | 0.5日 | 🔴 | 項目4完了 |
| 項目6 | 優先度象限計算ロジック実装 | 0.5日 | 🔴 | 項目4完了 |
| 項目7 | APIエンドポイント実装 | 1日 | 🔴 | 項目5,6完了 |
| 項目8 | ページ修正（実データ連携） | 1日 | 🔴 | 項目7完了 |
| **Phase 2** | リソース配分 | **2-3日** | 🔴 最高 | Phase 1完了 |
| 項目9 | ProjectResourceSummaryテーブル追加 | 0.5日 | 🔴 | Phase 1完了 |
| 項目10 | マイグレーション実行 | 0.2日 | 🔴 | 項目9完了 |
| 項目11 | リソース集計サービス実装 | 0.5日 | 🔴 | 項目10完了 |
| 項目12 | リソース集計バッチ実装 | 0.5日 | 🔴 | 項目11完了 |
| 項目13 | APIエンドポイント追加 | 0.3日 | 🔴 | 項目11完了 |
| 項目14 | リソース配分タブ実データ連携 | 0.5日 | 🔴 | 項目13完了 |
| **Phase 3** | ポートフォリオサマリー | **1-2日** | 🔴 高 | Phase 2完了 |
| 項目15 | PortfolioSummaryテーブル追加 | 0.3日 | 🔴 | Phase 2完了 |
| 項目16 | マイグレーション実行 | 0.2日 | 🔴 | 項目15完了 |
| 項目17 | ポートフォリオ集計バッチ実装 | 0.5日 | 🔴 | 項目16完了 |
| 項目18 | サマリーAPIエンドポイント修正 | 0.2日 | 🔴 | 項目17完了 |
| **Phase 4** | カテゴリマスタ（オプション） | **1-2日** | 🟡 中 | Phase 3完了 |
| 項目19 | ProjectCategoryテーブル追加 | 0.3日 | 🟡 | Phase 3完了 |
| 項目20 | カテゴリーシードデータ投入 | 0.2日 | 🟡 | 項目19完了 |
| 項目21 | カテゴリーフィルタ動的生成 | 0.5日 | 🟡 | 項目20完了 |

**総所要時間**:
- Phase 1-3のみ: **7-11日**
- Phase 1-4全て: **8-13日**

---

## ✅ 完了チェックリスト

### Phase 1: 財務・戦略評価
- [ ] ProjectFinancialテーブル追加
- [ ] ProjectStrategicEvaluationテーブル追加
- [ ] Post.projectCategory追加
- [ ] マイグレーション成功（`npx prisma migrate dev`）
- [ ] ROI計算サービス実装
- [ ] 優先度象限計算ロジック実装
- [ ] portfolioRoutes API実装
- [ ] ProjectPortfolioManagementPageのダミーデータ削除
- [ ] 優先度マトリクスタブで実データ表示確認
- [ ] ROI分析タブで実データ表示確認
- [ ] 戦略整合性タブで実データ表示確認

### Phase 2: リソース配分
- [ ] ProjectResourceSummaryテーブル追加
- [ ] マイグレーション成功
- [ ] リソース集計サービス実装
- [ ] リソース集計バッチ実装
- [ ] `/api/portfolio/resources` APIエンドポイント実装
- [ ] リソース配分タブで実データ表示確認

### Phase 3: ポートフォリオサマリー
- [ ] PortfolioSummaryテーブル追加
- [ ] マイグレーション成功
- [ ] ポートフォリオ集計バッチ実装
- [ ] 日次バッチのcron設定完了
- [ ] `/api/portfolio/summary` エンドポイント修正
- [ ] サマリーカードの高速表示確認

### Phase 4: カテゴリマスタ（オプション）
- [ ] ProjectCategoryテーブル追加
- [ ] マイグレーション成功
- [ ] カテゴリーシードデータ投入
- [ ] カテゴリーフィルタの動的生成動作確認

---

## 🔗 関連ドキュメント

- [project-portfolio-management_DB要件分析_20251013.md](./project-portfolio-management_DB要件分析_20251013.md) - 詳細なDB要件分析
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md) - 参照実装例
- [project-org-development暫定マスターリスト_20251013.md](./project-org-development暫定マスターリスト_20251013.md) - 参照実装例
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ責任分担

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
次回レビュー: Phase 1開始時
