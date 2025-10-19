# Executive Dashboardページ DB要件分析

**文書番号**: DB-REQ-2025-1019-002
**作成日**: 2025年10月19日
**対象ページ**: https://voicedrive-v100.vercel.app/dashboard/executive
**参照文書**:
- [PersonalStation_DB要件分析_20251008.md](../PersonalStation_DB要件分析_20251008.md)
- [ExecutiveDashboard_Authentication_Credentials_20251019.md](../ExecutiveDashboard_Authentication_Credentials_20251019.md)
- C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md

---

## 📋 分析サマリー

### 結論
Executive Dashboardページは**医療システムとの統合設計が完了**していますが、**VoiceDrive内部のデータ不足**により以下の機能が**ダミーデータ化**しています。

### 🔴 重大な不足項目（Phase 2実装時に対応必要）

1. **月次KPI統計の集計機能不足**
   - ExecutiveLevelDashboard.tsx 9-17行目: 総投稿数、議題化、委員会提出、決議済み、参加率、解決率、平均解決日数
   - 現在: 完全にダミーデータ（ハードコーディング）
   - 必要: Postテーブルからの集計クエリ

2. **重要アラートの検出・管理機能不足**
   - ExecutiveLevelDashboard.tsx 20-45行目: 部門別リスク、活性度低下、プロジェクト遅延
   - 現在: 完全にダミーデータ
   - 必要: アラート検出ロジック + AlertHistoryテーブル

3. **部門別パフォーマンスの集計機能不足**
   - ExecutiveLevelDashboard.tsx 48-54行目: 部門別の投稿数、議題数、活性度スコア、トレンド
   - 現在: 完全にダミーデータ
   - 必要: 部門別集計クエリ + トレンド計算

4. **プロジェクト進捗管理機能不足**
   - ExecutiveLevelDashboard.tsx 57-62行目: 進行中、完了、遅延、平均進捗率
   - 現在: 完全にダミーデータ
   - 必要: Projectテーブル（新規） + 進捗管理

5. **重要トピック管理機能不足**
   - ExecutiveLevelDashboard.tsx 65-96行目: トピック一覧、ステータス、インパクト、優先度
   - 現在: 完全にダミーデータ
   - 必要: KeyTopicテーブル（新規） + 管理画面

6. **理事会アジェンダ管理機能不足**
   - ExecutiveLevelDashboard.tsx 99-104行目: 議題項目、所要時間、発表者、優先度
   - 現在: 完全にダミーデータ
   - 必要: BoardAgendaテーブル（新規） + 管理画面

7. **戦略分析タブの企業向けデータ（医療に不適合）**
   - ExecutivePostingAnalytics.tsx 62-745行目: 中期経営計画、株主総利回り、ESG指標等
   - 現在: **医療法人に不適合な企業向けダミーデータ**
   - 必要: 医療システムからのLlama 3.2 8B分析結果（Phase 18.5で本格稼働）

### 🟢 正常稼働中の機能

1. **ExecutiveStrategicInsightテーブル**（schema.prisma 2182-2206行目）
   - ✅ 医療システムのLLM分析結果受信用テーブル（定義済み）
   - ✅ POST /api/v1/executive/strategic-insights（実装済み）
   - ⏳ Phase 18.5（2026年1月）で本格稼働予定

2. **ダッシュボードデータ提供API**（dashboard-data.ts 1-376行目）
   - ✅ GET /api/v1/executive/dashboard-data（実装済み）
   - ✅ Bearer Token認証（実装済み）
   - ✅ 医療システムへのデータ提供準備完了

---

## 🔍 詳細分析

### 1. 月次KPIサマリー（ExecutiveLevelDashboard.tsx 8-208行目）

#### 表示内容
```typescript
const monthlyKPIs = {
  totalPosts: 342,           // 総投稿数
  agendaCreated: 85,          // 議題化
  committeeSubmitted: 28,     // 委員会提出
  resolved: 45,               // 決議済み
  participationRate: 68,      // 参加率
  resolutionRate: 55,         // 解決率
  avgResolutionDays: 42       // 平均解決日数
};
```

#### 必要なデータソース

| 表示項目 | VoiceDrive Post | データ管理責任 | 提供方法 | 状態 |
|---------|----------------|--------------|---------|------|
| `totalPosts` | ✅ 集計可能 | VoiceDrive | Postテーブル集計 | 🔴 **集計クエリ未実装** |
| `agendaCreated` | ✅ `agendaLevel` | VoiceDrive | Postテーブル集計 | 🔴 **集計クエリ未実装** |
| `committeeSubmitted` | ✅ `agendaLevel` | VoiceDrive | Postテーブル集計 | 🔴 **集計クエリ未実装** |
| `resolved` | ✅ `status` | VoiceDrive | Postテーブル集計 | 🔴 **集計クエリ未実装** |
| `participationRate` | 🟡 計算 | VoiceDrive | ローカル計算 | 🔴 **ロジック未実装** |
| `resolutionRate` | 🟡 計算 | VoiceDrive | ローカル計算 | 🔴 **ロジック未実装** |
| `avgResolutionDays` | 🟡 計算 | VoiceDrive | ローカル計算 | 🔴 **ロジック未実装** |

#### 解決策1A: VoiceDriveに月次KPI集計サービスを実装

**新規サービス: `ExecutiveKPIService`**
```typescript
// src/services/ExecutiveKPIService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MonthlyKPIs {
  totalPosts: number;
  agendaCreated: number;
  committeeSubmitted: number;
  resolved: number;
  participationRate: number;
  resolutionRate: number;
  avgResolutionDays: number;
}

/**
 * 月次KPI統計を取得
 * @param year 対象年
 * @param month 対象月（1-12）
 * @param facilityIds 対象施設ID（未指定時は全施設）
 */
export async function getMonthlyKPIs(
  year: number,
  month: number,
  facilityIds?: string[]
): Promise<MonthlyKPIs> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const where = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    ...(facilityIds && { facilityId: { in: facilityIds } }),
  };

  // 総投稿数
  const totalPosts = await prisma.post.count({ where });

  // 議題化された投稿数
  const agendaCreated = await prisma.post.count({
    where: {
      ...where,
      agendaLevel: {
        in: ['DEPT_AGENDA', 'FACILITY_AGENDA', 'ORG_AGENDA'],
      },
    },
  });

  // 委員会提出（施設以上のアジェンダレベル）
  const committeeSubmitted = await prisma.post.count({
    where: {
      ...where,
      agendaLevel: {
        in: ['FACILITY_AGENDA', 'ORG_AGENDA'],
      },
    },
  });

  // 決議済み
  const resolved = await prisma.post.count({
    where: {
      ...where,
      status: {
        in: ['resolved', 'completed'],
      },
    },
  });

  // 参加率（投稿→議題化率）
  const participationRate = totalPosts > 0
    ? Math.round((agendaCreated / totalPosts) * 100)
    : 0;

  // 解決率（議題→解決率）
  const resolutionRate = agendaCreated > 0
    ? Math.round((resolved / agendaCreated) * 100)
    : 0;

  // 平均解決日数
  const resolvedPosts = await prisma.post.findMany({
    where: {
      ...where,
      status: {
        in: ['resolved', 'completed'],
      },
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  const avgResolutionDays = resolvedPosts.length > 0
    ? Math.round(
        resolvedPosts.reduce((sum, post) => {
          const days = Math.floor(
            (post.updatedAt.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / resolvedPosts.length
      )
    : 0;

  return {
    totalPosts,
    agendaCreated,
    committeeSubmitted,
    resolved,
    participationRate,
    resolutionRate,
    avgResolutionDays,
  };
}
```

**API実装**:
```typescript
// src/pages/api/executive/kpis.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getMonthlyKPIs } from '@/services/ExecutiveKPIService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { year, month, facilityIds } = req.query;

  const kpis = await getMonthlyKPIs(
    Number(year) || new Date().getFullYear(),
    Number(month) || new Date().getMonth() + 1,
    facilityIds ? (Array.isArray(facilityIds) ? facilityIds : [facilityIds]) : undefined
  );

  res.status(200).json(kpis);
}
```

---

### 2. 重要アラート（ExecutiveLevelDashboard.tsx 19-250行目）

#### 表示内容
```typescript
const criticalAlerts = [
  {
    type: 'risk',
    severity: 'high',
    title: '看護部でネガティブ投稿急増',
    description: 'シフト調整に関する不満が3件連続で投稿されています',
    department: '看護部',
    affectedCount: 12
  },
  // ... 他のアラート
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| アラート履歴 | VoiceDrive | ❌ ダミーデータ | `ExecutiveAlert`（新規） | 🔴 **要追加** |
| 検出ロジック | VoiceDrive | ❌ 未実装 | アラート検出サービス | 🔴 **要追加** |
| 部門別統計 | VoiceDrive | ⚠️ 一部可能 | Postテーブル集計 | 🟡 **要強化** |

#### 解決策2A: ExecutiveAlertテーブルを追加

**新規テーブル: `ExecutiveAlert`**
```prisma
// VoiceDrive: prisma/schema.prisma

/// エグゼクティブダッシュボードアラートテーブル
/// 自動検出された組織的リスク・課題を記録
model ExecutiveAlert {
  id              String    @id @default(cuid())

  // アラート基本情報
  alertType       String    @map("alert_type")
  // "risk" | "engagement" | "delay" | "quality" | "compliance"
  severity        String    @map("severity")
  // "high" | "medium" | "low"

  // 内容
  title           String    @map("title")
  description     String    @map("description")
  department      String?   @map("department")
  affectedCount   Int       @default(0) @map("affected_count")

  // K-匿名性チェック
  anonymityLevel  Int       @default(5) @map("anonymity_level")
  // 最小5名以上でアラート表示

  // 検出情報
  detectedAt      DateTime  @default(now()) @map("detected_at")
  detectionMethod String    @map("detection_method")
  // "threshold" | "trend" | "manual" | "llm_analysis"

  // ステータス
  isAcknowledged  Boolean   @default(false) @map("is_acknowledged")
  acknowledgedBy  String?   @map("acknowledged_by")
  acknowledgedAt  DateTime? @map("acknowledged_at")
  isResolved      Boolean   @default(false) @map("is_resolved")
  resolvedBy      String?   @map("resolved_by")
  resolvedAt      DateTime? @map("resolved_at")

  // 関連データ
  relatedPostIds  Json?     @map("related_post_ids")  // string[]
  metadata        Json?     @map("metadata")

  // タイムスタンプ
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([alertType])
  @@index([severity])
  @@index([department])
  @@index([detectedAt])
  @@index([isAcknowledged])
  @@index([isResolved])
  @@map("executive_alerts")
}
```

**アラート検出サービス**:
```typescript
// src/services/ExecutiveAlertService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AlertDetectionResult {
  detected: boolean;
  alerts: Array<{
    type: 'risk' | 'engagement' | 'delay';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    department: string;
    affectedCount: number;
    relatedPostIds: string[];
  }>;
}

/**
 * 部門別ネガティブ投稿急増を検出
 */
export async function detectNegativeSurge(
  startDate: Date,
  endDate: Date
): Promise<AlertDetectionResult> {
  const alerts: AlertDetectionResult['alerts'] = [];

  // 部門別の投稿統計を取得
  const departmentStats = await prisma.post.groupBy({
    by: ['department'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  for (const stat of departmentStats) {
    if (!stat.department) continue;

    // ネガティブ投稿（sentiment < 0.3）を取得
    const negativePosts = await prisma.post.findMany({
      where: {
        department: stat.department,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        sentiment: {
          lt: 0.3,  // ネガティブ判定閾値
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
      },
    });

    // K-匿名性チェック: 5名未満は非表示
    if (negativePosts.length >= 5) {
      // 同一カテゴリの連続投稿を検出
      const categoryCount = new Map<string, number>();
      negativePosts.forEach(post => {
        const count = categoryCount.get(post.category || '不明') || 0;
        categoryCount.set(post.category || '不明', count + 1);
      });

      // 3件以上の同一カテゴリ投稿があればアラート
      for (const [category, count] of categoryCount.entries()) {
        if (count >= 3) {
          alerts.push({
            type: 'risk',
            severity: count >= 5 ? 'high' : 'medium',
            title: `${stat.department}でネガティブ投稿急増`,
            description: `${category}に関する不満が${count}件連続で投稿されています`,
            department: stat.department,
            affectedCount: count,
            relatedPostIds: negativePosts
              .filter(p => p.category === category)
              .map(p => p.id),
          });
        }
      }
    }
  }

  return {
    detected: alerts.length > 0,
    alerts,
  };
}

/**
 * 部門活性度低下を検出
 */
export async function detectEngagementDrop(
  currentPeriod: { start: Date; end: Date },
  previousPeriod: { start: Date; end: Date }
): Promise<AlertDetectionResult> {
  const alerts: AlertDetectionResult['alerts'] = [];

  // 全部門のリストを取得
  const departments = await prisma.post.findMany({
    select: { department: true },
    distinct: ['department'],
  });

  for (const { department } of departments) {
    if (!department) continue;

    // 前月の投稿数
    const previousCount = await prisma.post.count({
      where: {
        department,
        createdAt: {
          gte: previousPeriod.start,
          lte: previousPeriod.end,
        },
      },
    });

    // 今月の投稿数
    const currentCount = await prisma.post.count({
      where: {
        department,
        createdAt: {
          gte: currentPeriod.start,
          lte: currentPeriod.end,
        },
      },
    });

    // K-匿名性チェック
    if (previousCount >= 5 && currentCount >= 5) {
      const dropRate = ((previousCount - currentCount) / previousCount) * 100;

      // 40%以上減少した場合アラート
      if (dropRate >= 40) {
        // 参加率を計算
        const agendaCount = await prisma.post.count({
          where: {
            department,
            createdAt: {
              gte: currentPeriod.start,
              lte: currentPeriod.end,
            },
            agendaLevel: {
              not: null,
            },
          },
        });
        const participationRate = currentCount > 0
          ? Math.round((agendaCount / currentCount) * 100)
          : 0;

        alerts.push({
          type: 'engagement',
          severity: 'medium',
          title: `${department}の活性度低下`,
          description: `投稿数が前月比${Math.round(dropRate)}%減少、参加率${participationRate}%に低下`,
          department,
          affectedCount: currentCount,
          relatedPostIds: [],
        });
      }
    }
  }

  return {
    detected: alerts.length > 0,
    alerts,
  };
}
```

---

### 3. 部門別パフォーマンス（ExecutiveLevelDashboard.tsx 47-304行目）

#### 表示内容
```typescript
const departmentPerformance = [
  {
    name: '看護部',
    posts: 128,
    agendas: 32,
    activeScore: 85,
    trend: 'up',
    status: 'good'
  },
  // ... 他の部門
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 部門別投稿数 | VoiceDrive | ✅ 集計可能 | Postテーブル | ✅ OK |
| 部門別議題数 | VoiceDrive | ✅ 集計可能 | Postテーブル | ✅ OK |
| 活性度スコア | VoiceDrive | 🟡 計算 | ローカル計算 | 🔴 **ロジック未実装** |
| トレンド | VoiceDrive | 🟡 計算 | 前月比較 | 🔴 **ロジック未実装** |

#### 解決策3A: 部門別パフォーマンス集計サービス

**新規サービス: `DepartmentPerformanceService`**
```typescript
// src/services/DepartmentPerformanceService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DepartmentPerformance {
  name: string;
  posts: number;
  agendas: number;
  activeScore: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

/**
 * 部門別パフォーマンスを取得（TOP N）
 */
export async function getDepartmentPerformance(
  year: number,
  month: number,
  topN: number = 10
): Promise<DepartmentPerformance[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // 前月の期間
  const prevStartDate = new Date(year, month - 2, 1);
  const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59, 999);

  // 部門別集計
  const departments = await prisma.post.groupBy({
    by: ['department'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  const performances: DepartmentPerformance[] = [];

  for (const dept of departments) {
    if (!dept.department) continue;

    // 今月の議題化数
    const agendas = await prisma.post.count({
      where: {
        department: dept.department,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        agendaLevel: {
          not: null,
        },
      },
    });

    // 活性度スコア（議題化率 × 投稿数の対数）
    const agendaRate = dept._count.id > 0 ? agendas / dept._count.id : 0;
    const activeScore = Math.round(
      agendaRate * 100 * (1 + Math.log10(Math.max(dept._count.id, 1)))
    );

    // 前月の投稿数（トレンド計算用）
    const prevPosts = await prisma.post.count({
      where: {
        department: dept.department,
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    // トレンド判定
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (prevPosts > 0) {
      const changeRate = ((dept._count.id - prevPosts) / prevPosts) * 100;
      if (changeRate > 10) trend = 'up';
      else if (changeRate < -10) trend = 'down';
    }

    // ステータス判定
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (activeScore < 60) status = 'warning';
    if (activeScore < 40 || trend === 'down') status = 'critical';

    performances.push({
      name: dept.department,
      posts: dept._count.id,
      agendas,
      activeScore: Math.min(100, activeScore),
      trend,
      status,
    });
  }

  // 投稿数の多い順にソート → TOP N
  return performances
    .sort((a, b) => b.posts - a.posts)
    .slice(0, topN);
}
```

---

### 4. プロジェクト進捗状況（ExecutiveLevelDashboard.tsx 56-330行目）

#### 表示内容
```typescript
const projectProgress = {
  inProgress: 12,
  completed: 8,
  delayed: 3,
  avgProgress: 65
};
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| プロジェクト一覧 | VoiceDrive | ❌ 不足 | `Project`（新規） | 🔴 **要追加** |
| 進捗率 | VoiceDrive | ❌ 不足 | `Project.progress` | 🔴 **要追加** |
| 遅延判定 | VoiceDrive | ❌ 不足 | `Project.deadline` | 🔴 **要追加** |

**注意**: 現在のPostテーブルには`projectLevel`フィールドがあるが、プロジェクト管理に必要な詳細情報が不足

#### 解決策4A: Projectテーブルを追加

**新規テーブル: `Project`**
```prisma
// VoiceDrive: prisma/schema.prisma

/// プロジェクト管理テーブル
/// 議題から昇格したプロジェクトを管理
model Project {
  id                String    @id @default(cuid())

  // 基本情報
  title             String    @map("title")
  description       String?   @map("description")
  category          String    @map("category")
  // "improvement" | "innovation" | "compliance" | "quality"

  // ステータス
  status            String    @default("proposed") @map("status")
  // "proposed" | "approved" | "in_progress" | "completed" | "cancelled" | "delayed"
  progress          Int       @default(0) @map("progress")  // 0-100

  // 期限管理
  startDate         DateTime? @map("start_date")
  targetDate        DateTime? @map("target_date")
  completedDate     DateTime? @map("completed_date")

  // 責任者・担当者
  ownerId           String    @map("owner_id")
  departmentId      String?   @map("department_id")
  facilityId        String?   @map("facility_id")

  // プロジェクトレベル
  projectLevel      String?   @map("project_level")
  // "DEPT_PROJECT" | "FACILITY_PROJECT" | "ORG_PROJECT"

  // 元となった投稿・議題
  originPostId      String?   @map("origin_post_id")

  // 優先度・インパクト
  priority          String    @default("medium") @map("priority")
  // "low" | "medium" | "high" | "critical"
  expectedImpact    String?   @map("expected_impact")

  // メタデータ
  metadata          Json?     @map("metadata")

  // タイムスタンプ
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  owner             User      @relation("ProjectOwner", fields: [ownerId], references: [id])
  milestones        ProjectMilestone[]
  updates           ProjectUpdate[]

  @@index([status])
  @@index([ownerId])
  @@index([departmentId])
  @@index([facilityId])
  @@index([projectLevel])
  @@index([targetDate])
  @@index([progress])
  @@map("projects")
}

/// プロジェクトマイルストーン
model ProjectMilestone {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  title             String    @map("title")
  targetDate        DateTime  @map("target_date")
  completedDate     DateTime? @map("completed_date")
  isCompleted       Boolean   @default(false) @map("is_completed")
  order             Int       @default(0) @map("order")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([targetDate])
  @@map("project_milestones")
}

/// プロジェクト更新履歴
model ProjectUpdate {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  updateType        String    @map("update_type")
  // "status_change" | "progress_update" | "milestone_completed" | "comment"
  content           String    @map("content")
  previousValue     String?   @map("previous_value")
  newValue          String?   @map("new_value")
  updatedBy         String    @map("updated_by")
  createdAt         DateTime  @default(now()) @map("created_at")

  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([createdAt])
  @@map("project_updates")
}
```

**Userモデルへの追加**:
```prisma
model User {
  // ... 既存フィールド
  ownedProjects     Project[]  @relation("ProjectOwner")  // 🆕 追加
}
```

**プロジェクト進捗サービス**:
```typescript
// src/services/ProjectProgressService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProjectProgressSummary {
  inProgress: number;
  completed: number;
  delayed: number;
  avgProgress: number;
}

/**
 * プロジェクト進捗サマリーを取得
 */
export async function getProjectProgressSummary(): Promise<ProjectProgressSummary> {
  const now = new Date();

  // 進行中のプロジェクト
  const inProgress = await prisma.project.count({
    where: {
      status: 'in_progress',
    },
  });

  // 完了済みプロジェクト
  const completed = await prisma.project.count({
    where: {
      status: 'completed',
    },
  });

  // 遅延プロジェクト（期限超過 + 未完了）
  const delayed = await prisma.project.count({
    where: {
      targetDate: {
        lt: now,
      },
      status: {
        in: ['in_progress', 'approved'],
      },
    },
  });

  // 平均進捗率（進行中プロジェクトのみ）
  const progressData = await prisma.project.aggregate({
    where: {
      status: 'in_progress',
    },
    _avg: {
      progress: true,
    },
  });

  const avgProgress = Math.round(progressData._avg.progress || 0);

  return {
    inProgress,
    completed,
    delayed,
    avgProgress,
  };
}
```

---

### 5. 重要トピックTOP5（ExecutiveLevelDashboard.tsx 64-362行目）

#### 表示内容
```typescript
const keyTopics = [
  {
    title: '看護師確保策の効果検証',
    status: '委員会承認済み',
    impact: '採用目標達成率20%向上見込み',
    priority: 'high'
  },
  // ... 他のトピック
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| トピック一覧 | VoiceDrive | ❌ ダミーデータ | `KeyTopic`（新規） | 🔴 **要追加** |
| ステータス | VoiceDrive | ❌ ダミーデータ | `KeyTopic.status` | 🔴 **要追加** |
| インパクト | VoiceDrive | ❌ ダミーデータ | `KeyTopic.impact` | 🔴 **要追加** |

#### 解決策5A: KeyTopicテーブルを追加

**新規テーブル: `KeyTopic`**
```prisma
// VoiceDrive: prisma/schema.prisma

/// 重要トピック管理テーブル
/// エグゼクティブダッシュボードに表示する戦略的重要トピック
model KeyTopic {
  id                String    @id @default(cuid())

  // 基本情報
  title             String    @map("title")
  description       String?   @map("description")

  // ステータス
  status            String    @map("status")
  // "proposed" | "under_review" | "committee_approved" | "in_progress" | "completed"
  statusLabel       String    @map("status_label")
  // 日本語表示用: "提案段階" | "審議中" | "委員会承認済み" | "実装中" | "決議済み"

  // インパクト・優先度
  impact            String    @map("impact")
  priority          String    @map("priority")
  // "low" | "medium" | "high"

  // 表示制御
  isVisible         Boolean   @default(true) @map("is_visible")
  displayOrder      Int       @default(0) @map("display_order")

  // 関連情報
  relatedPostIds    Json?     @map("related_post_ids")  // string[]
  relatedProjectId  String?   @map("related_project_id")

  // 作成者・更新者
  createdBy         String    @map("created_by")
  updatedBy         String?   @map("updated_by")

  // タイムスタンプ
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([status])
  @@index([priority])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("key_topics")
}
```

**管理API**:
```typescript
// src/pages/api/executive/key-topics.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET: 重要トピック一覧取得（TOP N）
 * POST: 重要トピック追加（管理者のみ）
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { limit = '5' } = req.query;

    const topics = await prisma.keyTopic.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: Number(limit),
    });

    return res.status(200).json(topics);
  }

  if (req.method === 'POST') {
    // TODO: 管理者権限チェック
    const { title, description, status, statusLabel, impact, priority } = req.body;

    const topic = await prisma.keyTopic.create({
      data: {
        title,
        description,
        status,
        statusLabel,
        impact,
        priority,
        createdBy: 'admin',  // TODO: 実際のユーザーIDを使用
      },
    });

    return res.status(201).json(topic);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
```

---

### 6. 次回理事会アジェンダ（ExecutiveLevelDashboard.tsx 98-392行目）

#### 表示内容
```typescript
const boardAgenda = [
  {
    item: '人材確保戦略の進捗報告',
    duration: '15分',
    presenter: '人事部門長',
    priority: 'high'
  },
  // ... 他の議題
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| アジェンダ一覧 | VoiceDrive | ❌ ダミーデータ | `BoardAgenda`（新規） | 🔴 **要追加** |
| 所要時間 | VoiceDrive | ❌ ダミーデータ | `BoardAgenda.duration` | 🔴 **要追加** |
| 発表者 | VoiceDrive | ❌ ダミーデータ | `BoardAgenda.presenter` | 🔴 **要追加** |

#### 解決策6A: BoardAgendaテーブルを追加

**新規テーブル: `BoardAgenda`**
```prisma
// VoiceDrive: prisma/schema.prisma

/// 理事会アジェンダ管理テーブル
/// 理事会・運営会議の議題を管理
model BoardAgenda {
  id                String    @id @default(cuid())

  // 会議情報
  meetingDate       DateTime  @map("meeting_date")
  meetingType       String    @map("meeting_type")
  // "board" | "executive" | "management"

  // 議題情報
  agendaItem        String    @map("agenda_item")
  description       String?   @map("description")
  duration          String    @map("duration")  // "15分" | "20分"
  presenter         String    @map("presenter")
  presenterTitle    String?   @map("presenter_title")

  // 優先度・カテゴリ
  priority          String    @default("medium") @map("priority")
  // "low" | "medium" | "high"
  category          String?   @map("category")
  // "hr" | "finance" | "operations" | "strategy" | "compliance"

  // 表示制御
  displayOrder      Int       @default(0) @map("display_order")
  isVisible         Boolean   @default(true) @map("is_visible")

  // 関連情報
  relatedTopicId    String?   @map("related_topic_id")
  relatedProjectId  String?   @map("related_project_id")
  attachments       Json?     @map("attachments")  // ファイルパス等

  // 結果記録
  isCompleted       Boolean   @default(false) @map("is_completed")
  decision          String?   @map("decision")
  notes             String?   @map("notes")

  // 作成者・更新者
  createdBy         String    @map("created_by")
  updatedBy         String?   @map("updated_by")

  // タイムスタンプ
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([meetingDate])
  @@index([meetingType])
  @@index([priority])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("board_agendas")
}
```

---

### 7. 戦略分析タブ（ExecutivePostingAnalytics.tsx 1-745行目）

#### 表示内容
```typescript
// 🔴 医療法人に不適合な企業向けデータ
const strategicKPIs: StrategicKPI[] = [
  {
    metric: '中期経営計画達成率',      // ← 医療法人向けに要変更
    current: 89.2,
    target: 95.0,
    improvement: 12.5,
    unit: '%',
    trend: 'up',
    boardImportance: 'critical'
  },
  {
    metric: '株主総利回り(TSR)',        // ← 医療法人には不適合
    current: 18.7,
    target: 20.0,
    improvement: 8.3,
    unit: '%',
    trend: 'up',
    boardImportance: 'critical'
  },
  // ... ESG指標、投資判断、ステークホルダー、市場ポジション等
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 戦略分析結果 | **医療システム** | ✅ 準備済み | `ExecutiveStrategicInsight` | ✅ **実装済み** |
| LLM分析 | **医療システム** | ⏳ Phase 18.5 | Llama 3.2 8B | ⏳ **2026年1月稼働予定** |

**重要**:
- ExecutivePostingAnalyticsの企業向けダミーデータは**医療法人に不適合**
- Phase 18.5（2026年1月）でLlama 3.2 8Bによる医療特化分析に置き換え
- それまでは統計ベースの簡易分析で対応

#### 解決策7A: 医療法人向け戦略KPIに置き換え

**暫定対応（Phase 2）**:
```typescript
// 医療法人向けKPI（Phase 2暫定版）
const healthcareStrategicKPIs = [
  {
    metric: '職員満足度スコア',
    current: 78.5,
    target: 85.0,
    improvement: 8.2,
    unit: 'pt',
    trend: 'up',
    boardImportance: 'critical'
  },
  {
    metric: '離職率（年間）',
    current: 8.3,
    target: 6.0,
    improvement: -15.3,  // 改善（低下）
    unit: '%',
    trend: 'down',  // 下降=改善
    boardImportance: 'critical'
  },
  {
    metric: '医療安全インシデント報告率',
    current: 92.1,
    target: 95.0,
    improvement: 5.7,
    unit: '%',
    trend: 'up',
    boardImportance: 'high'
  },
  {
    metric: '改善提案実装率',
    current: 68.4,
    target: 75.0,
    improvement: 12.5,
    unit: '%',
    trend: 'up',
    boardImportance: 'high'
  },
  {
    metric: 'VoiceDrive参加率',
    current: 82.7,
    target: 90.0,
    improvement: 18.9,
    unit: '%',
    trend: 'up',
    boardImportance: 'medium'
  },
];
```

**Phase 18.5対応（2026年1月）**:
```typescript
// ExecutiveStrategicInsightテーブルからLLM分析結果を取得
const llmInsights = await prisma.executiveStrategicInsight.findMany({
  where: {
    analysisDate: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
    insightType: 'strategic_recommendation',
  },
  orderBy: {
    severity: 'desc',
  },
  take: 10,
});
```

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（Phase 2実装必須）

**A. ExecutiveAlert（重要アラート）**
```prisma
model ExecutiveAlert {
  id              String    @id @default(cuid())
  alertType       String    @map("alert_type")
  severity        String    @map("severity")
  title           String    @map("title")
  description     String    @map("description")
  department      String?   @map("department")
  affectedCount   Int       @default(0) @map("affected_count")
  anonymityLevel  Int       @default(5) @map("anonymity_level")
  detectedAt      DateTime  @default(now()) @map("detected_at")
  detectionMethod String    @map("detection_method")
  isAcknowledged  Boolean   @default(false) @map("is_acknowledged")
  acknowledgedBy  String?   @map("acknowledged_by")
  acknowledgedAt  DateTime? @map("acknowledged_at")
  isResolved      Boolean   @default(false) @map("is_resolved")
  resolvedBy      String?   @map("resolved_by")
  resolvedAt      DateTime? @map("resolved_at")
  relatedPostIds  Json?     @map("related_post_ids")
  metadata        Json?     @map("metadata")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([alertType])
  @@index([severity])
  @@index([department])
  @@index([detectedAt])
  @@index([isAcknowledged])
  @@index([isResolved])
  @@map("executive_alerts")
}
```

**理由**:
- エグゼクティブダッシュボードの重要アラート表示に必須
- 部門別リスク検出に必須
- K-匿名性（最小5名）のプライバシー保護

**影響範囲**:
- ExecutiveLevelDashboard.tsx: 19-250行目（重要アラート）

---

**B. Project（プロジェクト管理）**
```prisma
model Project {
  id                String    @id @default(cuid())
  title             String    @map("title")
  description       String?   @map("description")
  category          String    @map("category")
  status            String    @default("proposed") @map("status")
  progress          Int       @default(0) @map("progress")
  startDate         DateTime? @map("start_date")
  targetDate        DateTime? @map("target_date")
  completedDate     DateTime? @map("completed_date")
  ownerId           String    @map("owner_id")
  departmentId      String?   @map("department_id")
  facilityId        String?   @map("facility_id")
  projectLevel      String?   @map("project_level")
  originPostId      String?   @map("origin_post_id")
  priority          String    @default("medium") @map("priority")
  expectedImpact    String?   @map("expected_impact")
  metadata          Json?     @map("metadata")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  owner             User      @relation("ProjectOwner", fields: [ownerId], references: [id])
  milestones        ProjectMilestone[]
  updates           ProjectUpdate[]

  @@index([status])
  @@index([ownerId])
  @@index([departmentId])
  @@index([facilityId])
  @@index([projectLevel])
  @@index([targetDate])
  @@index([progress])
  @@map("projects")
}

model ProjectMilestone {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  title             String    @map("title")
  targetDate        DateTime  @map("target_date")
  completedDate     DateTime? @map("completed_date")
  isCompleted       Boolean   @default(false) @map("is_completed")
  order             Int       @default(0) @map("order")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([targetDate])
  @@map("project_milestones")
}

model ProjectUpdate {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  updateType        String    @map("update_type")
  content           String    @map("content")
  previousValue     String?   @map("previous_value")
  newValue          String?   @map("new_value")
  updatedBy         String    @map("updated_by")
  createdAt         DateTime  @default(now()) @map("created_at")

  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([createdAt])
  @@map("project_updates")
}
```

**理由**:
- プロジェクト進捗状況表示に必須
- 議題から昇格したプロジェクトの追跡
- マイルストーン管理・更新履歴

**影響範囲**:
- ExecutiveLevelDashboard.tsx: 56-330行目（プロジェクト進捗状況）

---

#### 🟡 優先度: 中（推奨）

**C. KeyTopic（重要トピック）**
```prisma
model KeyTopic {
  id                String    @id @default(cuid())
  title             String    @map("title")
  description       String?   @map("description")
  status            String    @map("status")
  statusLabel       String    @map("status_label")
  impact            String    @map("impact")
  priority          String    @map("priority")
  isVisible         Boolean   @default(true) @map("is_visible")
  displayOrder      Int       @default(0) @map("display_order")
  relatedPostIds    Json?     @map("related_post_ids")
  relatedProjectId  String?   @map("related_project_id")
  createdBy         String    @map("created_by")
  updatedBy         String?   @map("updated_by")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([status])
  @@index([priority])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("key_topics")
}
```

**理由**:
- 重要トピックTOP5表示に必須
- 戦略的課題の可視化
- 管理者による手動登録・管理

**影響範囲**:
- ExecutiveLevelDashboard.tsx: 64-362行目（重要トピックTOP5）

---

**D. BoardAgenda（理事会アジェンダ）**
```prisma
model BoardAgenda {
  id                String    @id @default(cuid())
  meetingDate       DateTime  @map("meeting_date")
  meetingType       String    @map("meeting_type")
  agendaItem        String    @map("agenda_item")
  description       String?   @map("description")
  duration          String    @map("duration")
  presenter         String    @map("presenter")
  presenterTitle    String?   @map("presenter_title")
  priority          String    @default("medium") @map("priority")
  category          String?   @map("category")
  displayOrder      Int       @default(0) @map("display_order")
  isVisible         Boolean   @default(true) @map("is_visible")
  relatedTopicId    String?   @map("related_topic_id")
  relatedProjectId  String?   @map("related_project_id")
  attachments       Json?     @map("attachments")
  isCompleted       Boolean   @default(false) @map("is_completed")
  decision          String?   @map("decision")
  notes             String?   @map("notes")
  createdBy         String    @map("created_by")
  updatedBy         String?   @map("updated_by")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([meetingDate])
  @@index([meetingType])
  @@index([priority])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("board_agendas")
}
```

**理由**:
- 次回理事会アジェンダ表示に必須
- 議題管理・資料生成
- 会議記録の保存

**影響範囲**:
- ExecutiveLevelDashboard.tsx: 98-392行目（次回理事会アジェンダ）

---

### 2. 既に実装済み

#### ✅ ExecutiveStrategicInsight（戦略分析結果）

**現状**: schema.prisma 2182-2206行目に既に定義済み

```prisma
model ExecutiveStrategicInsight {
  id                 String    @id @default(cuid())
  analysisDate       DateTime  @map("analysis_date")
  insightType        String    @map("insight_type")
  severity           String?   @map("severity")
  title              String    @map("title")
  analysis           String    @map("analysis")
  rootCause          String?   @map("root_cause")
  recommendedActions Json      @map("recommended_actions")
  bestPractice       Json?     @map("best_practice")
  predictions        Json?     @map("predictions")
  strategicData      Json?     @map("strategic_data")
  isAcknowledged     Boolean   @default(false) @map("is_acknowledged")
  acknowledgedBy     String?   @map("acknowledged_by")
  acknowledgedAt     DateTime? @map("acknowledged_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@index([analysisDate])
  @@index([insightType])
  @@index([severity])
  @@index([isAcknowledged])
  @@index([analysisDate, insightType])
  @@map("executive_strategic_insights")
}
```

**API実装状況**:
- ✅ POST /api/v1/executive/strategic-insights（受信用、実装済み）
- ✅ HMAC-SHA256認証（実装済み）
- ⏳ Phase 18.5（2026年1月）で本格稼働予定

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（DB構築時 - 2日）

**目標**: Executive Dashboardページが基本的に動作する

1. ✅ **ExecutiveStrategicInsightテーブル**
   - 既に定義済み
   - マイグレーション時に自動作成

2. 🔴 **月次KPI集計サービス実装**
   - src/services/ExecutiveKPIService.ts
   - Postテーブルから統計を集計
   - **新規実装必要**

3. 🔴 **部門別パフォーマンス集計サービス実装**
   - src/services/DepartmentPerformanceService.ts
   - 部門別の投稿数・議題数・トレンド計算
   - **新規実装必要**

**このPhaseで動作する機能**:
- ✅ 月次KPIサマリー（実データ）
- ✅ 部門別パフォーマンス（実データ、TOP10）
- ⚠️ 重要アラート（ダミーデータのまま）
- ⚠️ プロジェクト進捗（ダミーデータのまま）
- ⚠️ 重要トピック（ダミーデータのまま）
- ⚠️ 理事会アジェンダ（ダミーデータのまま）

---

### Phase 2: アラート・プロジェクト管理（DB構築後 - 3日）

**目標**: アラート検出とプロジェクト管理が動作する

1. 🔴 **ExecutiveAlertテーブル追加**
   ```prisma
   model ExecutiveAlert { /* 前述の定義 */ }
   ```

2. 🔴 **アラート検出サービス実装**
   - src/services/ExecutiveAlertService.ts
   - ネガティブ投稿急増検出
   - 部門活性度低下検出
   - K-匿名性チェック（最小5名）

3. 🔴 **Projectテーブル追加**
   ```prisma
   model Project { /* 前述の定義 */ }
   model ProjectMilestone { /* 前述の定義 */ }
   model ProjectUpdate { /* 前述の定義 */ }
   ```

4. 🔴 **プロジェクト進捗サービス実装**
   - src/services/ProjectProgressService.ts
   - 進捗サマリー取得
   - 遅延判定

**このPhaseで動作する機能**:
- ✅ 重要アラート（実データ、自動検出）
- ✅ プロジェクト進捗状況（実データ）
- ⚠️ 重要トピック（ダミーデータのまま）
- ⚠️ 理事会アジェンダ（ダミーデータのまま）

---

### Phase 3: トピック・アジェンダ管理（DB構築後 - 2日）

**目標**: 重要トピック・理事会アジェンダの管理機能が動作する

1. 🔴 **KeyTopicテーブル追加**
   ```prisma
   model KeyTopic { /* 前述の定義 */ }
   ```

2. 🔴 **KeyTopic管理API実装**
   - GET /api/executive/key-topics（一覧取得）
   - POST /api/executive/key-topics（追加）
   - PUT /api/executive/key-topics/:id（更新）
   - DELETE /api/executive/key-topics/:id（削除）

3. 🔴 **BoardAgendaテーブル追加**
   ```prisma
   model BoardAgenda { /* 前述の定義 */ }
   ```

4. 🔴 **BoardAgenda管理API実装**
   - GET /api/executive/board-agendas（一覧取得）
   - POST /api/executive/board-agendas（追加）
   - PUT /api/executive/board-agendas/:id（更新）

5. 🟡 **管理画面実装（オプション）**
   - src/pages/admin/key-topics.tsx
   - src/pages/admin/board-agendas.tsx

**このPhaseで動作する機能**:
- ✅ 重要トピックTOP5（実データ、管理者が登録）
- ✅ 次回理事会アジェンダ（実データ、管理者が登録）

---

### Phase 4: 戦略分析タブの医療特化（Phase 18.5 - 2026年1月）

**目標**: 医療法人向けの戦略分析が表示される

1. 🟡 **医療法人向けKPIに置き換え**
   - ExecutivePostingAnalytics.tsx の企業向けダミーデータを削除
   - 医療法人向けKPIに置き換え（職員満足度、離職率等）

2. ⏳ **Llama 3.2 8B分析結果の統合**
   - ExecutiveStrategicInsightテーブルからデータ取得
   - 医療システムからのLLM分析結果を表示
   - Phase 18.5（2026年1月）で本格稼働

**このPhaseで動作する機能**:
- ✅ 医療法人向け戦略KPI
- ✅ LLM分析結果の表示（Phase 18.5）
- ✅ 完全な医療特化ダッシュボード

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
Executive Dashboard
  ↓ 表示
月次KPI: ダミーデータ（ハードコーディング）
重要アラート: ダミーデータ（ハードコーディング）
部門別パフォーマンス: ダミーデータ（ハードコーディング）
プロジェクト進捗: ダミーデータ（ハードコーディング）
重要トピック: ダミーデータ（ハードコーディング）
理事会アジェンダ: ダミーデータ（ハードコーディング）
戦略分析タブ: 企業向けダミーデータ（医療に不適合）
```

### Phase 1完了後
```
Executive Dashboard
  ↓ 表示
月次KPI ← ExecutiveKPIService ← Postテーブル集計（実データ）
部門別パフォーマンス ← DepartmentPerformanceService ← Postテーブル集計（実データ）
重要アラート: ダミーデータのまま
プロジェクト進捗: ダミーデータのまま
重要トピック: ダミーデータのまま
理事会アジェンダ: ダミーデータのまま
戦略分析タブ: 企業向けダミーデータのまま
```

### Phase 2完了後
```
Executive Dashboard
  ↓ 表示
月次KPI ← ExecutiveKPIService ← Postテーブル集計（実データ）
部門別パフォーマンス ← DepartmentPerformanceService ← Postテーブル集計（実データ）
重要アラート ← ExecutiveAlertService ← ExecutiveAlertテーブル（自動検出、実データ）
プロジェクト進捗 ← ProjectProgressService ← Projectテーブル（実データ）
重要トピック: ダミーデータのまま
理事会アジェンダ: ダミーデータのまま
戦略分析タブ: 企業向けダミーデータのまま
```

### Phase 3完了後
```
Executive Dashboard
  ↓ 表示
月次KPI ← ExecutiveKPIService ← Postテーブル集計（実データ）
部門別パフォーマンス ← DepartmentPerformanceService ← Postテーブル集計（実データ）
重要アラート ← ExecutiveAlertService ← ExecutiveAlertテーブル（自動検出、実データ）
プロジェクト進捗 ← ProjectProgressService ← Projectテーブル（実データ）
重要トピック ← KeyTopicテーブル（管理者登録、実データ）
理事会アジェンダ ← BoardAgendaテーブル（管理者登録、実データ）
戦略分析タブ: 企業向けダミーデータのまま
```

### Phase 4完了後（Phase 18.5 - 2026年1月）
```
Executive Dashboard
  ↓ 表示
月次KPI ← ExecutiveKPIService ← Postテーブル集計（実データ）
部門別パフォーマンス ← DepartmentPerformanceService ← Postテーブル集計（実データ）
重要アラート ← ExecutiveAlertService ← ExecutiveAlertテーブル（自動検出、実データ）
プロジェクト進捗 ← ProjectProgressService ← Projectテーブル（実データ）
重要トピック ← KeyTopicテーブル（管理者登録、実データ）
理事会アジェンダ ← BoardAgendaテーブル（管理者登録、実データ）
戦略分析タブ ← ExecutiveStrategicInsightテーブル ← 医療システム Llama 3.2 8B（実データ）
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1（DB構築時）
- [ ] ExecutiveStrategicInsightテーブル確認（既に定義済み）
- [ ] ExecutiveKPIService実装
- [ ] DepartmentPerformanceService実装
- [ ] GET /api/executive/kpis 実装
- [ ] GET /api/executive/department-performance 実装
- [ ] ExecutiveLevelDashboard.tsxの月次KPI部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxの部門別パフォーマンス部分を実データに置き換え

#### Phase 2（DB構築後）
- [ ] ExecutiveAlertテーブル追加
- [ ] マイグレーション実行
- [ ] ExecutiveAlertService実装（ネガティブ投稿急増検出）
- [ ] ExecutiveAlertService実装（部門活性度低下検出）
- [ ] Projectテーブル追加
- [ ] ProjectMilestoneテーブル追加
- [ ] ProjectUpdateテーブル追加
- [ ] マイグレーション実行
- [ ] ProjectProgressService実装
- [ ] GET /api/executive/alerts 実装
- [ ] GET /api/executive/projects 実装
- [ ] ExecutiveLevelDashboard.tsxの重要アラート部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxのプロジェクト進捗部分を実データに置き換え

#### Phase 3（DB構築後）
- [ ] KeyTopicテーブル追加
- [ ] BoardAgendaテーブル追加
- [ ] マイグレーション実行
- [ ] GET /api/executive/key-topics 実装
- [ ] POST /api/executive/key-topics 実装
- [ ] PUT /api/executive/key-topics/:id 実装
- [ ] DELETE /api/executive/key-topics/:id 実装
- [ ] GET /api/executive/board-agendas 実装
- [ ] POST /api/executive/board-agendas 実装
- [ ] PUT /api/executive/board-agendas/:id 実装
- [ ] ExecutiveLevelDashboard.tsxの重要トピック部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxの理事会アジェンダ部分を実データに置き換え
- [ ] （オプション）管理画面実装

#### Phase 4（Phase 18.5 - 2026年1月）
- [ ] ExecutivePostingAnalytics.tsxの企業向けダミーデータを削除
- [ ] 医療法人向けKPIに置き換え
- [ ] ExecutiveStrategicInsightテーブルからLLM分析結果を取得
- [ ] 戦略分析タブに医療システムのLLM分析を表示

### テスト
- [ ] 月次KPI集計の単体テスト
- [ ] 部門別パフォーマンス集計の単体テスト
- [ ] アラート検出の単体テスト
- [ ] K-匿名性チェックの検証（5名未満は非表示）
- [ ] プロジェクト進捗サマリーの単体テスト
- [ ] KeyTopic CRUD APIの統合テスト
- [ ] BoardAgenda CRUD APIの統合テスト
- [ ] E2Eテスト（Executive Dashboard全機能）
- [ ] パフォーマンステスト（100プロジェクト）

---

## 🔗 関連ドキュメント

- [PersonalStation_DB要件分析_20251008.md](../PersonalStation_DB要件分析_20251008.md)
- [ExecutiveDashboard_Authentication_Credentials_20251019.md](../ExecutiveDashboard_Authentication_Credentials_20251019.md)
- [Executive Dashboard API実装書](../../docs/api/executive-dashboard-openapi.yaml)
- [医療チームへの回答書（Phase 2退職処理統合）](../ED-RESPONSE-2025-1019-001.md)
- [MySQL_Migration_Guide.md](../../docs/MySQL_Migration_Guide.md)

---

**文書終了**

最終更新: 2025年10月19日
バージョン: 1.0
次回レビュー: DB構築時（Phase 1実装前）
