# Project Organization Development 暫定マスターリスト

**文書番号**: MASTER-LIST-2025-1013-002
**作成日**: 2025年10月13日
**対象ページ**: Project Organization Development（組織開発インサイト）
**参照文書**:
- [project-org-development_DB要件分析_20251013.md](./project-org-development_DB要件分析_20251013.md)
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

## 📋 実装優先順位サマリー

| Phase | 期間 | 優先度 | 状態 |
|-------|-----|--------|------|
| Phase 0 | 現在 | - | ❌ 完全ダミーデータ |
| Phase 1 | 3-5日 | 🔴 最高 | ⏳ プロジェクト管理強化 |
| Phase 2 | 5-7日 | 🔴 最高 | ⏳ 組織開発指標計算 |
| Phase 3 | 2-3日 | 🔴 最高 | ⏳ ページ実装修正 |
| Phase 4 | 3-5日 | 🟡 中 | ⏳ 高度な分析（オプション） |

**総所要時間**: 13-20日（Phase 1-3のみ）、16-25日（Phase 4含む）

---

## 🎯 Phase 1: プロジェクト管理機能の強化（3-5日）

### 目標
Projectテーブルに組織開発分析に必要な情報を追加

### 実装項目

#### 1. Projectテーブルのスキーマ拡張 ⏳ 未実装

**ファイル**: `prisma/schema.prisma`

**追加フィールド**:
```prisma
model Project {
  id                String    @id @default(cuid())
  // ... 既存フィールド

  // 🆕 リーダーシップ追跡用
  leaderId          String?   @map("leader_id")
  leader            User?     @relation("ProjectLeader", fields: [leaderId], references: [id])

  // 🆕 プロジェクト成果
  outcome           String?   @map("outcome")  // success, failure, partial
  successScore      Float?    @map("success_score")  // 0-100

  // 🆕 影響度評価
  impactLevel       String?   @map("impact_level")  // low, medium, high, critical
  impactScore       Float?    @map("impact_score")  // 0-100

  // ... 既存Relations
}
```

**Userモデルへの追加**:
```prisma
model User {
  // ... 既存フィールド
  ledProjects       Project[] @relation("ProjectLeader")  // 🆕
  // ... 既存Relations
}
```

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: なし

---

#### 2. マイグレーション実行 ⏳ 未実装

**コマンド**:
```bash
npx prisma migrate dev --name add_project_leadership_fields
npx prisma generate
```

**推定工数**: 0.5日（テスト含む）
**優先度**: 🔴 最高
**依存関係**: 項目1完了後

---

#### 3. プロジェクト作成UIの修正 ⏳ 未実装

**対象ファイル**:
- `src/components/projects/ProjectCreationForm.tsx`（推定）
- または関連するプロジェクト作成コンポーネント

**追加機能**:
- リーダー選択ドロップダウン
- 影響度レベル選択（low/medium/high/critical）

**実装例**:
```typescript
// リーダー選択
<select value={leaderId} onChange={(e) => setLeaderId(e.target.value)}>
  <option value="">リーダーを選択...</option>
  {eligibleLeaders.map(user => (
    <option key={user.id} value={user.id}>{user.name}</option>
  ))}
</select>

// 影響度選択
<select value={impactLevel} onChange={(e) => setImpactLevel(e.target.value)}>
  <option value="low">低（部門内）</option>
  <option value="medium">中（部門間）</option>
  <option value="high">高（施設全体）</option>
  <option value="critical">最高（複数施設）</option>
</select>
```

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: 項目2完了後

---

#### 4. プロジェクト完了処理の修正 ⏳ 未実装

**対象ファイル**:
- `src/components/projects/ProjectCompletionForm.tsx`（推定）
- または関連するプロジェクト完了コンポーネント

**追加機能**:
- 成功/失敗の選択（success/failure/partial）
- 成功スコア入力（0-100）
- 影響度スコア入力（0-100）

**実装例**:
```typescript
// 成功/失敗選択
<select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
  <option value="success">成功</option>
  <option value="partial">部分的成功</option>
  <option value="failure">失敗</option>
</select>

// 成功スコア
<input
  type="range"
  min="0"
  max="100"
  value={successScore}
  onChange={(e) => setSuccessScore(Number(e.target.value))}
/>
<span>{successScore}/100</span>

// 影響度スコア
<input
  type="range"
  min="0"
  max="100"
  value={impactScore}
  onChange={(e) => setImpactScore(Number(e.target.value))}
/>
<span>{impactScore}/100</span>
```

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: 項目2完了後

---

#### 5. API修正 ⏳ 未実装

**対象ファイル**:
- `src/api/routes/project.routes.ts`（推定）

**修正内容**:
- プロジェクト作成時に `leaderId`, `impactLevel`を保存
- プロジェクト完了時に `outcome`, `successScore`, `impactScore`を保存

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: 項目2完了後

---

### Phase 1完了基準
- ✅ Projectテーブルに新フィールド追加完了
- ✅ マイグレーション成功
- ✅ プロジェクト作成時にリーダーと影響度を設定可能
- ✅ プロジェクト完了時に成果と影響度を記録可能
- ✅ 既存プロジェクトが正常動作（新フィールドはNULL許可）

---

## 🎯 Phase 2: 組織開発指標の計算（5-7日）

### 目標
日次バッチで組織開発指標を自動計算し、DBに保存

### 実装項目

#### 6. 新規テーブル追加（6テーブル） ⏳ 未実装

**ファイル**: `prisma/schema.prisma`

##### 6-A. DepartmentCollaboration（部門間コラボレーション）

```prisma
model DepartmentCollaboration {
  id                    String    @id @default(cuid())
  department1           String    @map("department_1")
  department2           String    @map("department_2")
  facilityId            String?   @map("facility_id")
  periodType            String    @map("period_type")  // quarter, year, all
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")
  projectCount          Int       @default(0) @map("project_count")
  collaborationScore    Float     @default(0) @map("collaboration_score")
  previousScore         Float?    @map("previous_score")
  trendDirection        String?   @map("trend_direction")  // up, down, stable
  trendValue            Float?    @map("trend_value")
  successfulProjects    Int       @default(0) @map("successful_projects")
  activeProjects        Int       @default(0) @map("active_projects")
  completedProjects     Int       @default(0) @map("completed_projects")
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

**推定工数**: 0.5日
**優先度**: 🔴 最高

---

##### 6-B. LeadershipDevelopment（リーダーシップ育成）

```prisma
model LeadershipDevelopment {
  id                    String    @id @default(cuid())
  userId                String    @map("user_id")
  periodType            String    @map("period_type")
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")
  projectsLed           Int       @default(0) @map("projects_led")
  successfulProjects    Int       @default(0) @map("successful_projects")
  failedProjects        Int       @default(0) @map("failed_projects")
  successRate           Float     @default(0) @map("success_rate")
  averageTeamSize       Float     @default(0) @map("average_team_size")
  totalTeamMembers      Int       @default(0) @map("total_team_members")
  teamRetentionRate     Float?    @map("team_retention_rate")
  growthScore           Float     @default(0) @map("growth_score")
  previousGrowthScore   Float?    @map("previous_growth_score")
  growthTrend           String?   @map("growth_trend")
  collaborationScore    Float?    @map("collaboration_score")
  innovationScore       Float?    @map("innovation_score")
  problemSolvingScore   Float?    @map("problem_solving_score")
  communicationScore    Float?    @map("communication_score")
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
  // ... 既存
  leadershipDevelopment LeadershipDevelopment[]  // 🆕
}
```

**推定工数**: 0.5日
**優先度**: 🔴 最高

---

##### 6-C. InnovationMetric（イノベーション指標）

```prisma
model InnovationMetric {
  id                    String    @id @default(cuid())
  category              String    @map("category")  // improvement, safety, service, workstyle
  periodType            String    @map("period_type")
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")
  ideasGenerated        Int       @default(0) @map("ideas_generated")
  projectsLaunched      Int       @default(0) @map("projects_launched")
  projectsImplemented   Int       @default(0) @map("projects_implemented")
  implementationRate    Float     @default(0) @map("implementation_rate")
  impactScore           Float     @default(0) @map("impact_score")
  averageImpactLevel    String?   @map("average_impact_level")
  previousImpactScore   Float?    @map("previous_impact_score")
  trendDirection        String?   @map("trend_direction")
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

**推定工数**: 0.3日
**優先度**: 🔴 最高

---

##### 6-D. IdeaToProjectLink（アイデア→プロジェクトリンク）

```prisma
model IdeaToProjectLink {
  id                    String    @id @default(cuid())
  postId                String    @map("post_id")
  postCategory          String    @map("post_category")
  projectId             String?   @map("project_id")
  isProjectLaunched     Boolean   @default(false) @map("is_project_launched")
  launchedAt            DateTime? @map("launched_at")
  isImplemented         Boolean   @default(false) @map("is_implemented")
  implementedAt         DateTime? @map("implemented_at")
  implementationScore   Float?    @map("implementation_score")
  impactLevel           String?   @map("impact_level")
  impactScore           Float?    @map("impact_score")
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
  // ... 既存
  ideaToProjectLink     IdeaToProjectLink?  // 🆕
}

// Projectモデルに追加
model Project {
  // ... 既存
  ideaLinks             IdeaToProjectLink[]  // 🆕
}
```

**推定工数**: 0.3日
**優先度**: 🔴 最高

---

##### 6-E. OrganizationCultureMetric（組織文化指標）

```prisma
model OrganizationCultureMetric {
  id                        String    @id @default(cuid())
  periodType                String    @map("period_type")
  periodStart               DateTime  @map("period_start")
  periodEnd                 DateTime  @map("period_end")
  facilityId                String?   @map("facility_id")
  totalEmployees            Int       @default(0) @map("total_employees")
  activeParticipants        Int       @default(0) @map("active_participants")
  participationRate         Float     @default(0) @map("participation_rate")
  totalProjects             Int       @default(0) @map("total_projects")
  crossDepartmentProjects   Int       @default(0) @map("cross_department_projects")
  employeeEngagement        Float     @default(0) @map("employee_engagement")
  collaborationScore        Float     @default(0) @map("collaboration_score")
  innovationIndex           Float     @default(0) @map("innovation_index")
  previousEngagement        Float?    @map("previous_engagement")
  engagementTrend           String?   @map("engagement_trend")
  calculatedAt              DateTime  @default(now()) @map("calculated_at")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart, facilityId])
  @@index([facilityId])
  @@index([periodStart])
  @@map("organization_culture_metric")
}
```

**推定工数**: 0.3日
**優先度**: 🔴 最高

---

##### 6-F. CultureChangeIndicator（文化変革指標）

```prisma
model CultureChangeIndicator {
  id                    String    @id @default(cuid())
  indicatorName         String    @map("indicator_name")
  indicatorKey          String    @map("indicator_key")
  // open_communication, cross_department_cooperation, continuous_improvement, innovation_enthusiasm, organizational_belonging
  periodType            String    @map("period_type")
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")
  value                 Float     @default(0) @map("value")
  previousValue         Float?    @map("previous_value")
  trend                 String?   @map("trend")
  trendValue            Float?    @map("trend_value")
  calculationMethod     String?   @map("calculation_method")  @db.Text
  dataSource            String?   @map("data_source")
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

**推定工数**: 0.3日
**優先度**: 🔴 最高

---

#### 7. マイグレーション実行 ⏳ 未実装

**コマンド**:
```bash
npx prisma migrate dev --name add_organization_development_tables
npx prisma generate
```

**推定工数**: 0.5日（テスト含む）
**優先度**: 🔴 最高
**依存関係**: 項目6完了後

---

#### 8. 計算サービス実装 ⏳ 未実装

##### 8-A. OrganizationDevelopmentService

**ファイル**: `src/services/OrganizationDevelopmentService.ts`

**実装機能**:
- `calculateDepartmentCollaboration(periodStart, periodEnd)` - 部門間コラボスコア計算
- `calculateCollaborationScore(dept1, dept2, periodStart, periodEnd)` - コラボスコア計算ロジック

**推定工数**: 1.5日
**優先度**: 🔴 最高
**依存関係**: 項目7完了後

---

##### 8-B. LeadershipService

**ファイル**: `src/services/LeadershipService.ts`

**実装機能**:
- `calculateLeadershipDevelopment(periodStart, periodEnd)` - リーダーシップ育成指標計算
- `calculateGrowthScore(userId, periodStart, periodEnd)` - 成長スコア計算ロジック

**推定工数**: 1.5日
**優先度**: 🔴 最高
**依存関係**: 項目7完了後

---

##### 8-C. InnovationService

**ファイル**: `src/services/InnovationService.ts`

**実装機能**:
- `calculateInnovationMetrics(periodStart, periodEnd)` - イノベーション指標計算
- `calculateImplementationRate(category, periodStart, periodEnd)` - 実装率計算

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: 項目7完了後

---

##### 8-D. CultureMetricsService

**ファイル**: `src/services/CultureMetricsService.ts`

**実装機能**:
- `calculateCultureMetrics(periodStart, periodEnd, facilityId?)` - 組織文化指標計算
- `calculateEmployeeEngagement(periodStart, periodEnd, facilityId?)` - エンゲージメント計算
- `calculateCultureChangeIndicators(periodStart, periodEnd)` - 文化変革指標計算

**推定工数**: 1.5日
**優先度**: 🔴 最高
**依存関係**: 項目7完了後

---

#### 9. 日次バッチ実装 ⏳ 未実装

**ファイル**: `src/jobs/calculateOrganizationMetrics.ts`

**実装機能**:
```typescript
export async function dailyOrganizationMetricsCalculation() {
  const today = new Date();

  // 四半期集計
  const quarterStart = getQuarterStart(today);
  await calculateAllMetrics(quarterStart, today, 'quarter');

  // 年間集計
  const yearStart = getYearStart(today);
  await calculateAllMetrics(yearStart, today, 'year');

  // 全期間集計
  await calculateAllMetrics(new Date('2025-01-01'), today, 'all');
}

async function calculateAllMetrics(
  periodStart: Date,
  periodEnd: Date,
  periodType: string
) {
  await calculateDepartmentCollaboration(periodStart, periodEnd, periodType);
  await calculateLeadershipDevelopment(periodStart, periodEnd, periodType);
  await calculateInnovationMetrics(periodStart, periodEnd, periodType);
  await calculateCultureMetrics(periodStart, periodEnd, periodType);
  await calculateCultureChangeIndicators(periodStart, periodEnd, periodType);
}
```

**スケジュール設定**:
```typescript
// src/jobs/scheduler.ts
import cron from 'node-cron';

// 毎日深夜2:00に実行
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily organization metrics calculation...');
  await dailyOrganizationMetricsCalculation();
});
```

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: 項目8完了後

---

### Phase 2完了基準
- ✅ 6つの新規テーブル追加完了
- ✅ マイグレーション成功
- ✅ 4つの計算サービス実装完了
- ✅ 日次バッチ動作確認
- ✅ 計算ロジックの単体テスト成功

---

## 🎯 Phase 3: ページ実装修正（2-3日）

### 目標
ProjectOrgDevelopmentページのダミーデータを実データに置き換え

### 実装項目

#### 10. APIエンドポイント実装 ⏳ 未実装

**ファイル**: `src/api/routes/organization-development.routes.ts`（新規作成）

**実装エンドポイント**:

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/organization-development/collaboration
router.get('/collaboration', async (req, res) => {
  const { period } = req.query;
  const data = await prisma.departmentCollaboration.findMany({
    where: { periodType: period as string },
    orderBy: { collaborationScore: 'desc' }
  });
  res.json(data);
});

// GET /api/organization-development/leadership
router.get('/leadership', async (req, res) => {
  const { period } = req.query;
  const data = await prisma.leadershipDevelopment.findMany({
    where: { periodType: period as string },
    include: { user: { select: { name: true, position: true } } },
    orderBy: { growthScore: 'desc' }
  });
  res.json(data);
});

// GET /api/organization-development/innovation
router.get('/innovation', async (req, res) => {
  const { period } = req.query;
  const data = await prisma.innovationMetric.findMany({
    where: { periodType: period as string },
    orderBy: { category: 'asc' }
  });
  res.json(data);
});

// GET /api/organization-development/culture
router.get('/culture', async (req, res) => {
  const { period } = req.query;
  const metrics = await prisma.organizationCultureMetric.findFirst({
    where: { periodType: period as string },
    orderBy: { periodStart: 'desc' }
  });
  const indicators = await prisma.cultureChangeIndicator.findMany({
    where: { periodType: period as string },
    orderBy: { indicatorKey: 'asc' }
  });
  res.json({ metrics, indicators });
});

export default router;
```

**APIサーバーへの登録**:
```typescript
// src/api/server.ts
import organizationDevelopmentRoutes from './routes/organization-development.routes';

app.use('/api/organization-development', organizationDevelopmentRoutes);
```

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: Phase 2完了後

---

#### 11. Reactコンポーネント修正 ⏳ 未実装

**ファイル**: `src/pages/ProjectOrgDevelopmentPage.tsx`

**修正内容**:

1. **ダミーデータ削除**（48-146行目）
2. **APIフック実装**

```typescript
// 🆕 カスタムフック
function useOrganizationDevelopmentData(selectedPeriod: string) {
  const [collaborationData, setCollaborationData] = useState<CollaborationMetric[]>([]);
  const [leadershipData, setLeadershipData] = useState<LeadershipDevelopment[]>([]);
  const [innovationData, setInnovationData] = useState<InnovationMetric[]>([]);
  const [cultureMetrics, setCultureMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [collab, leader, innovation, culture] = await Promise.all([
          fetch(`/api/organization-development/collaboration?period=${selectedPeriod}`).then(r => r.json()),
          fetch(`/api/organization-development/leadership?period=${selectedPeriod}`).then(r => r.json()),
          fetch(`/api/organization-development/innovation?period=${selectedPeriod}`).then(r => r.json()),
          fetch(`/api/organization-development/culture?period=${selectedPeriod}`).then(r => r.json())
        ]);

        setCollaborationData(collab);
        setLeadershipData(leader);
        setInnovationData(innovation);
        setCultureMetrics(culture);
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedPeriod]);

  return { collaborationData, leadershipData, innovationData, cultureMetrics, loading, error };
}

// コンポーネント内で使用
const ProjectOrgDevelopmentPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarter' | 'year' | 'all'>('quarter');
  const { collaborationData, leadershipData, innovationData, cultureMetrics, loading, error } =
    useOrganizationDevelopmentData(selectedPeriod);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!cultureMetrics) return <NoDataMessage />;

  // ... 既存のレンダリングロジック
};
```

3. **ローディング・エラーハンドリング追加**

```typescript
// ローディング表示
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
  </div>
);

// エラー表示
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
      <p className="text-red-400">{message}</p>
    </div>
  </div>
);

// データなし表示
const NoDataMessage = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
      <p className="text-slate-400">データがまだ計算されていません。</p>
      <p className="text-slate-500 text-sm mt-2">日次バッチ実行後に表示されます。</p>
    </div>
  </div>
);
```

**推定工数**: 1日
**優先度**: 🔴 最高
**依存関係**: 項目10完了後

---

#### 12. データ型定義の更新 ⏳ 未実装

**ファイル**: `src/types/organization-development.types.ts`（新規作成）

```typescript
// APIレスポンス型定義
export interface CollaborationMetric {
  id: string;
  department1: string;
  department2: string;
  departmentPair: string; // フロントエンド用の結合フィールド
  projectCount: number;
  collaborationScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export interface LeadershipDevelopment {
  id: string;
  userId: string;
  user: {
    name: string;
    position: string | null;
  };
  name: string; // user.nameのエイリアス
  currentRole: string; // user.positionのエイリアス
  projectsLed: number;
  teamSize: number; // averageTeamSizeから
  successRate: number;
  growthScore: number;
}

export interface InnovationMetric {
  id: string;
  category: string;
  ideasGenerated: number;
  projectsLaunched: number;
  implementationRate: number;
  impactScore: number;
}

export interface OrganizationCultureMetrics {
  participationRate: number;
  crossDepartmentProjects: number;
  employeeEngagement: number;
  innovationIndex: number;
  collaborationScore: number;
}

export interface CultureChangeIndicator {
  indicatorName: string;
  indicatorKey: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}
```

**推定工数**: 0.5日
**優先度**: 🔴 最高
**依存関係**: 項目10完了後

---

#### 13. E2Eテスト実装 ⏳ 未実装

**ファイル**: `tests/e2e/project-org-development.spec.ts`

**テストシナリオ**:
1. ページ読み込み成功
2. 四半期/年間/全期間のタブ切替動作
3. コラボレーション/リーダーシップ/イノベーション/組織文化タブ切替動作
4. データ表示確認（各指標が表示される）
5. エラーハンドリング（API障害時）

**推定工数**: 0.5日
**優先度**: 🟡 中
**依存関係**: 項目11完了後

---

### Phase 3完了基準
- ✅ 4つのAPIエンドポイント実装完了
- ✅ ProjectOrgDevelopmentPageのダミーデータ削除完了
- ✅ API呼び出しとデータ表示動作確認
- ✅ エラーハンドリング実装完了
- ✅ E2Eテスト成功

---

## 🎯 Phase 4: 高度な分析機能（オプション、3-5日）

### 目標
AI生成インサイトとトレンドグラフ実装（優先度: 🟡 中）

### 実装項目

#### 14. AI生成インサイト機能 ⏳ 未実装（オプション）

**対象箇所**:
- コラボレーションタブの「組織開発インサイト」（232-242行目）
- 組織文化タブの「戦略的提言」（475-487行目）

**実装方法**:

**ファイル**: `src/services/AIInsightService.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

export async function generateCollaborationInsight(
  collaborationData: CollaborationMetric[]
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const prompt = `
以下の部門間コラボレーションデータを分析し、組織開発に関する洞察を1-2文で簡潔に提供してください。

データ:
${JSON.stringify(collaborationData, null, 2)}

分析のポイント:
- 最もコラボレーションが活発な部門ペア
- トレンド（改善/悪化）
- 今後の推奨アクション
`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

export async function generateStrategicRecommendations(
  cultureMetrics: OrganizationCultureMetrics,
  indicators: CultureChangeIndicator[]
): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const prompt = `
以下の組織文化指標を分析し、戦略的提言を3つ提供してください。

組織文化指標:
${JSON.stringify(cultureMetrics, null, 2)}

文化変革指標:
${JSON.stringify(indicators, null, 2)}

各提言は箇条書き形式で、具体的かつ実行可能なアクションを含めてください。
`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  return text.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
}
```

**APIエンドポイント追加**:
```typescript
// src/api/routes/organization-development.routes.ts

// GET /api/organization-development/collaboration-insight
router.get('/collaboration-insight', async (req, res) => {
  const { period } = req.query;
  const data = await prisma.departmentCollaboration.findMany({
    where: { periodType: period as string }
  });
  const insight = await generateCollaborationInsight(data);
  res.json({ insight });
});

// GET /api/organization-development/strategic-recommendations
router.get('/strategic-recommendations', async (req, res) => {
  const { period } = req.query;
  const metrics = await prisma.organizationCultureMetric.findFirst({
    where: { periodType: period as string }
  });
  const indicators = await prisma.cultureChangeIndicator.findMany({
    where: { periodType: period as string }
  });
  const recommendations = await generateStrategicRecommendations(metrics, indicators);
  res.json({ recommendations });
});
```

**推定工数**: 2日
**優先度**: 🟡 中
**依存関係**: Phase 3完了後

---

#### 15. トレンドグラフ実装 ⏳ 未実装（オプション）

**対象箇所**: イノベーションタブのトレンドグラフ（392-401行目）

**実装方法**:

**必要なライブラリ**:
```bash
npm install recharts
```

**コンポーネント**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// トレンドデータ取得
async function fetchInnovationTrend(periodType: string) {
  const res = await fetch(`/api/organization-development/innovation-trend?period=${periodType}`);
  return res.json();
}

// グラフコンポーネント
const InnovationTrendChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="month" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip
        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
        labelStyle={{ color: '#e2e8f0' }}
      />
      <Legend />
      <Line type="monotone" dataKey="ideasGenerated" stroke="#fbbf24" name="アイデア生成" />
      <Line type="monotone" dataKey="projectsLaunched" stroke="#3b82f6" name="プロジェクト化" />
      <Line type="monotone" dataKey="projectsImplemented" stroke="#10b981" name="実装完了" />
    </LineChart>
  </ResponsiveContainer>
);
```

**APIエンドポイント追加**:
```typescript
// GET /api/organization-development/innovation-trend
router.get('/innovation-trend', async (req, res) => {
  const { period } = req.query;
  // 月次データを取得（過去12ヶ月など）
  const monthlyData = await getMonthlyInnovationData(period as string);
  res.json(monthlyData);
});
```

**推定工数**: 1.5日
**優先度**: 🟡 中
**依存関係**: Phase 3完了後

---

#### 16. ドリルダウン機能実装 ⏳ 未実装（オプション）

**対象箇所**:
- 部門ペアクリックで詳細表示
- リーダー名クリックで個別分析表示

**実装方法**:

**モーダルコンポーネント**:
```typescript
// src/components/organization-development/DepartmentCollaborationModal.tsx
export const DepartmentCollaborationModal = ({
  dept1,
  dept2,
  periodType,
  onClose
}: {
  dept1: string;
  dept2: string;
  periodType: string;
  onClose: () => void;
}) => {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/organization-development/collaboration-details?dept1=${dept1}&dept2=${dept2}&period=${periodType}`)
      .then(r => r.json())
      .then(setDetails);
  }, [dept1, dept2, periodType]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold text-white mb-4">
          {dept1} × {dept2} の詳細分析
        </h2>
        {/* プロジェクト一覧、参加メンバー、成功率の推移など */}
        {details && (
          <div>
            <h3>プロジェクト一覧（{details.projects.length}件）</h3>
            {/* ... */}
          </div>
        )}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-cyan-600 rounded">
          閉じる
        </button>
      </div>
    </div>
  );
};
```

**推定工数**: 1.5日
**優先度**: 🟡 中
**依存関係**: Phase 3完了後

---

### Phase 4完了基準
- ✅ AI生成インサイト動作確認
- ✅ トレンドグラフ表示確認
- ✅ ドリルダウンモーダル動作確認

---

## 📊 全体タイムライン

| フェーズ | 項目 | 推定工数 | 優先度 | 開始条件 |
|---------|-----|---------|--------|---------|
| **Phase 1** | プロジェクト管理強化 | **3-5日** | 🔴 最高 | - |
| 項目1 | Projectテーブルスキーマ拡張 | 0.5日 | 🔴 | - |
| 項目2 | マイグレーション実行 | 0.5日 | 🔴 | 項目1完了 |
| 項目3 | プロジェクト作成UI修正 | 1日 | 🔴 | 項目2完了 |
| 項目4 | プロジェクト完了処理修正 | 1日 | 🔴 | 項目2完了 |
| 項目5 | API修正 | 0.5日 | 🔴 | 項目2完了 |
| **Phase 2** | 組織開発指標計算 | **5-7日** | 🔴 最高 | Phase 1完了 |
| 項目6 | 新規テーブル追加（6テーブル） | 2日 | 🔴 | Phase 1完了 |
| 項目7 | マイグレーション実行 | 0.5日 | 🔴 | 項目6完了 |
| 項目8 | 計算サービス実装（4サービス） | 4日 | 🔴 | 項目7完了 |
| 項目9 | 日次バッチ実装 | 1日 | 🔴 | 項目8完了 |
| **Phase 3** | ページ実装修正 | **2-3日** | 🔴 最高 | Phase 2完了 |
| 項目10 | APIエンドポイント実装 | 1日 | 🔴 | Phase 2完了 |
| 項目11 | Reactコンポーネント修正 | 1日 | 🔴 | 項目10完了 |
| 項目12 | データ型定義更新 | 0.5日 | 🔴 | 項目10完了 |
| 項目13 | E2Eテスト実装 | 0.5日 | 🟡 | 項目11完了 |
| **Phase 4** | 高度な分析（オプション） | **3-5日** | 🟡 中 | Phase 3完了 |
| 項目14 | AI生成インサイト | 2日 | 🟡 | Phase 3完了 |
| 項目15 | トレンドグラフ実装 | 1.5日 | 🟡 | Phase 3完了 |
| 項目16 | ドリルダウン機能 | 1.5日 | 🟡 | Phase 3完了 |

**総所要時間**:
- Phase 1-3のみ: **13-20日**
- Phase 1-4全て: **16-25日**

---

## ✅ 完了チェックリスト

### Phase 1: プロジェクト管理強化
- [ ] Projectテーブルに `leaderId`, `outcome`, `successScore`, `impactLevel`, `impactScore`追加
- [ ] マイグレーション成功（`npx prisma migrate dev`）
- [ ] プロジェクト作成UIでリーダー選択可能
- [ ] プロジェクト作成UIで影響度選択可能
- [ ] プロジェクト完了処理で成功/失敗記録可能
- [ ] プロジェクト完了処理で成功スコア入力可能
- [ ] 既存プロジェクトが正常動作

### Phase 2: 組織開発指標計算
- [ ] `DepartmentCollaboration`テーブル追加
- [ ] `LeadershipDevelopment`テーブル追加
- [ ] `InnovationMetric`テーブル追加
- [ ] `IdeaToProjectLink`テーブル追加
- [ ] `OrganizationCultureMetric`テーブル追加
- [ ] `CultureChangeIndicator`テーブル追加
- [ ] マイグレーション成功
- [ ] OrganizationDevelopmentService実装完了
- [ ] LeadershipService実装完了
- [ ] InnovationService実装完了
- [ ] CultureMetricsService実装完了
- [ ] 日次バッチ実装完了（`src/jobs/calculateOrganizationMetrics.ts`）
- [ ] 日次バッチのcron設定完了
- [ ] 計算ロジックの単体テスト成功

### Phase 3: ページ実装修正
- [ ] `/api/organization-development/collaboration` APIエンドポイント実装
- [ ] `/api/organization-development/leadership` APIエンドポイント実装
- [ ] `/api/organization-development/innovation` APIエンドポイント実装
- [ ] `/api/organization-development/culture` APIエンドポイント実装
- [ ] ProjectOrgDevelopmentPageのダミーデータ削除
- [ ] APIフック実装（useOrganizationDevelopmentData）
- [ ] ローディング表示実装
- [ ] エラーハンドリング実装
- [ ] データなし表示実装
- [ ] 型定義更新（`src/types/organization-development.types.ts`）
- [ ] 四半期/年間/全期間のタブ切替動作確認
- [ ] コラボレーションタブで実データ表示確認
- [ ] リーダーシップタブで実データ表示確認
- [ ] イノベーションタブで実データ表示確認
- [ ] 組織文化タブで実データ表示確認
- [ ] E2Eテスト成功

### Phase 4: 高度な分析（オプション）
- [ ] AIInsightService実装（`src/services/AIInsightService.ts`）
- [ ] `/api/organization-development/collaboration-insight` APIエンドポイント
- [ ] `/api/organization-development/strategic-recommendations` APIエンドポイント
- [ ] AI生成インサイト表示確認
- [ ] トレンドグラフ実装（Recharts）
- [ ] `/api/organization-development/innovation-trend` APIエンドポイント
- [ ] トレンドグラフ表示確認
- [ ] DepartmentCollaborationModal実装
- [ ] LeaderDetailModal実装
- [ ] ドリルダウン動作確認

---

## 🔗 関連ドキュメント

- [project-org-development_DB要件分析_20251013.md](./project-org-development_DB要件分析_20251013.md) - 詳細なDB要件分析
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md) - 参照実装例
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ責任分担
- [共通DB構築後統合作業再開計画書_20251008.md](./共通DB構築後統合作業再開計画書_20251008.md) - 統合計画

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
次回レビュー: Phase 1開始時
