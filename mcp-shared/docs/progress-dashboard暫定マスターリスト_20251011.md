# ProgressDashboard（進捗ダッシュボード）医療システム確認結果

**作成日**: 2025年10月11日
**対象ページ**: ProgressDashboard（進捗ダッシュボード）
**確認者**: Claude Code
**ステータス**: 確認完了 ✅

---

## エグゼクティブサマリー

ProgressDashboard（進捗ダッシュボード）ページは、複数部署・施設全体のプロジェクト進捗を俯瞰的に可視化する機能です（Level 10+：部長以上）。

**結論**: 医療職員管理システムでの**新規API実装は不要**です。

- ✅ 医療システム既存API（facilities/departments/employees）のみ使用
- ⚠️ VoiceDrive側で**2つの新規テーブル追加が必要**（ProjectMilestone/ProjectTeamMember）
- ⚠️ Postテーブルに**3つのフィールド追加が必要**（projectDueDate/projectLevel/projectProgress）
- 🔧 VoiceDrive側で**3つのAPI実装が必要**

---

## 1. 暫定マスターリスト分析結果

### 1.1 ページ概要
- **対象ユーザー**: Level 10+（部長以上）
- **主要機能**:
  - プロジェクト一覧表示（フィルタリング機能付き）
  - 統計サマリー表示（総数/進行中/完了/遅延/平均進捗）
  - マイルストーン進捗可視化
  - チームサイズ表示

### 1.2 データソース分析

| データ種別 | 使用テーブル/API | 医療システム依存 |
|-----------|----------------|----------------|
| プロジェクト情報 | VoiceDrive.Post | ❌ 不要 |
| マイルストーン情報 | VoiceDrive.ProjectMilestone（新規） | ❌ 不要 |
| チームメンバー情報 | VoiceDrive.ProjectTeamMember（新規） | ❌ 不要 |
| 施設マスター | 医療システムAPI `/api/v2/facilities` | ✅ 既存API使用 |
| 部門マスター | 医療システムAPI `/api/v2/departments` | ✅ 既存API使用 |
| 職員情報 | 医療システムAPI `/api/v2/employees/{id}` | ✅ 既存API使用 |

**結論**: プロジェクトデータはVoiceDrive内部で完結し、施設・部門・職員情報のみ既存医療システムAPIを使用します。

### 1.3 テーブル要件分析

#### 新規テーブル1: ProjectMilestone（マイルストーン管理）

```prisma
model ProjectMilestone {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  title             String
  description       String?   @db.Text
  dueDate           DateTime  @map("due_date")
  completedAt       DateTime? @map("completed_at")
  completedBy       String?   @map("completed_by")
  status            String    @default("pending") // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  order             Int       @default(0)
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  project           Post      @relation("ProjectMilestones", fields: [projectId], references: [id], onDelete: Cascade)
  completedByUser   User?     @relation("MilestoneCompletedBy", fields: [completedBy], references: [id], onDelete: SetNull)

  @@index([projectId])
  @@index([status])
  @@index([dueDate])
  @@map("project_milestones")
}
```

#### 新規テーブル2: ProjectTeamMember（チームメンバー管理）

```prisma
model ProjectTeamMember {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  userId            String    @map("user_id")
  role              String    @default("member") // 'leader' | 'sub_leader' | 'member' | 'observer'
  joinedAt          DateTime  @default(now()) @map("joined_at")
  leftAt            DateTime? @map("left_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  project           Post      @relation("ProjectTeamMembers", fields: [projectId], references: [id], onDelete: Cascade)
  user              User      @relation("ProjectMemberships", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([role])
  @@map("project_team_members")
}
```

#### 既存テーブル拡張: Post

```prisma
model Post {
  // ... 既存フィールド

  // ProgressDashboard統合実装（2025-10-11）
  projectDueDate      DateTime? @map("project_due_date")      // プロジェクト期限
  projectLevel        String?   @map("project_level")         // 'team' | 'department' | 'facility' | 'organization'
  projectProgress     Int?      @default(0) @map("project_progress")  // 進捗率（0-100）

  // Relations
  milestones          ProjectMilestone[]   @relation("ProjectMilestones")
  teamMembers         ProjectTeamMember[]  @relation("ProjectTeamMembers")

  // 新規インデックス
  @@index([type, status, createdAt])  // プロジェクト一覧取得用
  @@index([projectDueDate])            // 期限ソート・遅延判定用
  @@index([projectLevel])              // レベル別フィルタリング用
}
```

#### 既存テーブル拡張: User

```prisma
model User {
  // ... 既存フィールド

  // ProgressDashboard統合実装（2025-10-11）
  projectMemberships      ProjectTeamMember[]   @relation("ProjectMemberships")
  completedMilestones     ProjectMilestone[]    @relation("MilestoneCompletedBy")
}
```

---

## 2. 医療システム側の対応不要項目

### 2.1 新規API不要

ProgressDashboardページは以下の既存APIのみ使用します：

✅ **既存API（そのまま使用）**:
- `GET /api/v2/facilities` - 施設マスター取得
- `GET /api/v2/departments` - 部門マスター取得
- `GET /api/v2/employees/{employeeId}` - 職員情報取得

❌ **新規API不要**:
- プロジェクト管理関連API（すべてVoiceDrive内部で実装）

### 2.2 既存APIの使用目的

#### GET /api/v2/facilities
**用途**: プロジェクトレベル判定と施設名表示

**使用箇所**:
```typescript
// 施設プロジェクトの施設名表示
const facility = await medicalSystemAPI.getFacility(project.facilityId);
console.log(`施設: ${facility.name}`);
```

#### GET /api/v2/departments
**用途**: プロジェクトレベル判定と部門名表示

**使用箇所**:
```typescript
// 部門プロジェクトの部門名表示
const department = await medicalSystemAPI.getDepartment(project.departmentId);
console.log(`部門: ${department.name}`);
```

#### GET /api/v2/employees/{id}
**用途**: チームメンバー詳細情報取得、権限レベル確認

**使用箇所**:
```typescript
// ユーザー権限チェック
const employee = await medicalSystemAPI.getEmployee(userId);
if (employee.level < 10) {
  throw new Error('Level 10+ required');
}
```

---

## 3. VoiceDrive側実装推奨事項

### 3.1 データベースマイグレーション（優先度: 高）

#### マイグレーション1: Postテーブル拡張

```sql
-- Migration: add_progress_dashboard_fields_to_post
-- Description: ProgressDashboard用フィールド追加

ALTER TABLE "Post"
ADD COLUMN "project_due_date" TIMESTAMP,
ADD COLUMN "project_level" TEXT,
ADD COLUMN "project_progress" INTEGER DEFAULT 0;

-- インデックス追加
CREATE INDEX "Post_type_status_createdAt_idx"
ON "Post"("type", "status", "createdAt" DESC);

CREATE INDEX "Post_projectDueDate_idx"
ON "Post"("project_due_date");

CREATE INDEX "Post_projectLevel_idx"
ON "Post"("project_level");

-- 既存プロジェクトにデフォルト値設定
UPDATE "Post"
SET
  "project_due_date" = "createdAt" + INTERVAL '3 months',
  "project_level" = 'team',
  "project_progress" = 0
WHERE "type" = 'project'
  AND "project_due_date" IS NULL;
```

**実行タイミング**: Phase 1実装前（必須）

**影響範囲**:
- ダウンタイムなし（オンラインスキーマ変更）
- 既存プロジェクトにデフォルト値自動設定

#### マイグレーション2: ProjectMilestoneテーブル作成

```sql
-- Migration: create_project_milestones_table
-- Description: プロジェクトマイルストーン管理テーブル作成

CREATE TABLE "project_milestones" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "due_date" TIMESTAMP NOT NULL,
  "completed_at" TIMESTAMP,
  "completed_by" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "fk_project_milestones_project"
    FOREIGN KEY ("project_id") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_project_milestones_completed_by"
    FOREIGN KEY ("completed_by") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "ProjectMilestone_projectId_idx"
ON "project_milestones"("project_id");

CREATE INDEX "ProjectMilestone_status_idx"
ON "project_milestones"("status");

CREATE INDEX "ProjectMilestone_dueDate_idx"
ON "project_milestones"("due_date");
```

**実行タイミング**: Phase 1実装前（必須）

**影響範囲**:
- 新規テーブル作成（既存データに影響なし）
- ディスク使用量: 最小（初期データなし）

#### マイグレーション3: ProjectTeamMemberテーブル作成

```sql
-- Migration: create_project_team_members_table
-- Description: プロジェクトチームメンバー管理テーブル作成

CREATE TABLE "project_team_members" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joined_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "left_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "fk_project_team_members_project"
    FOREIGN KEY ("project_id") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_project_team_members_user"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_project_team_members_project_user"
    UNIQUE ("project_id", "user_id")
);

CREATE INDEX "ProjectTeamMember_projectId_idx"
ON "project_team_members"("project_id");

CREATE INDEX "ProjectTeamMember_userId_idx"
ON "project_team_members"("user_id");

CREATE INDEX "ProjectTeamMember_role_idx"
ON "project_team_members"("role");
```

**実行タイミング**: Phase 1実装前（必須）

**影響範囲**:
- 新規テーブル作成（既存データに影響なし）
- UNIQUE制約により重複参加を防止

### 3.2 サービス層実装（優先度: 高）

#### ProgressDashboardService実装例

```typescript
// src/services/ProgressDashboardService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProgressDashboardService {
  /**
   * アクセス可能なプロジェクト一覧取得
   */
  async getAccessibleProjects(userId: string, options: {
    filter?: 'all' | 'active' | 'completed' | 'delayed';
    facilityId?: string;
    departmentId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { filter = 'all', limit = 20, offset = 0 } = options;

    // 1. ユーザー権限取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, level: true, facilityId: true, departmentId: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.level < 10) {
      throw new Error('Level 10+ required for ProgressDashboard');
    }

    // 2. WHERE条件構築
    const where: any = { type: 'project' };

    // 2.1 ステータスフィルター
    if (filter === 'active') {
      where.status = 'active';
    } else if (filter === 'completed') {
      where.status = 'completed';
    }

    // 2.2 権限ベースフィルタリング
    if (user.level < 13) {
      // Level 10-12: 自施設のみ
      where.author = {
        facilityId: options.facilityId || user.facilityId
      };

      if (user.level === 10) {
        // Level 10 (部長): 自部門のみ
        where.author = {
          ...where.author,
          departmentId: options.departmentId || user.departmentId
        };
      }
    }
    // Level 13+: 全施設アクセス可能（フィルタなし）

    // 3. プロジェクト取得
    const projects = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            facilityId: true,
            departmentId: true
          }
        },
        milestones: {
          select: {
            id: true,
            status: true
          }
        },
        teamMembers: {
          where: { leftAt: null },
          select: {
            id: true,
            userId: true,
            role: true
          }
        },
        _count: {
          select: {
            milestones: true,
            teamMembers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    // 4. 総件数取得
    const totalCount = await prisma.post.count({ where });

    // 5. データ加工（遅延判定・進捗計算）
    const now = new Date();
    const result = projects.map(project => {
      const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
      const totalMilestones = project.milestones.length;

      // 進捗計算
      const progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : project.projectProgress || 0;

      // 遅延判定
      const isDelayed = project.projectDueDate &&
                       project.projectDueDate < now &&
                       project.status !== 'completed';

      return {
        id: project.id,
        title: project.title || '無題のプロジェクト',
        description: project.content,
        status: project.status,
        progress,
        teamSize: project._count.teamMembers,
        completedMilestones,
        totalMilestones,
        dueDate: project.projectDueDate?.toISOString(),
        isDelayed,
        level: project.projectLevel,
        createdAt: project.createdAt.toISOString()
      };
    });

    // 6. 遅延フィルタリング（必要な場合）
    const filteredResult = filter === 'delayed'
      ? result.filter(p => p.isDelayed)
      : result;

    return {
      projects: filteredResult,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    };
  }

  /**
   * プロジェクト統計取得
   */
  async getProjectStats(userId: string, options: {
    facilityId?: string;
    departmentId?: string;
  }) {
    // 1. ユーザー権限取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, level: true, facilityId: true, departmentId: true }
    });

    if (!user || user.level < 10) {
      throw new Error('Insufficient permissions');
    }

    // 2. WHERE条件構築（getAccessibleProjectsと同じロジック）
    const where: any = { type: 'project' };

    if (user.level < 13) {
      where.author = {
        facilityId: options.facilityId || user.facilityId
      };
      if (user.level === 10) {
        where.author = {
          ...where.author,
          departmentId: options.departmentId || user.departmentId
        };
      }
    }

    // 3. 並列クエリで統計取得
    const [total, active, completed, allProjects] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.count({ where: { ...where, status: 'active' } }),
      prisma.post.count({ where: { ...where, status: 'completed' } }),
      prisma.post.findMany({
        where,
        include: {
          milestones: {
            select: { status: true }
          }
        }
      })
    ]);

    // 4. 遅延判定
    const now = new Date();
    const delayed = allProjects.filter(p =>
      p.projectDueDate && p.projectDueDate < now && p.status !== 'completed'
    ).length;

    // 5. 平均進捗計算
    const avgProgress = allProjects.length > 0
      ? Math.round(
          allProjects.reduce((sum, p) => {
            const completedMilestones = p.milestones.filter(m => m.status === 'completed').length;
            const totalMilestones = p.milestones.length;
            const progress = totalMilestones > 0
              ? (completedMilestones / totalMilestones) * 100
              : p.projectProgress || 0;
            return sum + progress;
          }, 0) / allProjects.length
        )
      : 0;

    return {
      total,
      active,
      completed,
      delayed,
      avgProgress
    };
  }

  /**
   * プロジェクトマイルストーン一覧取得
   */
  async getProjectMilestones(projectId: string, userId: string) {
    // 1. プロジェクトアクセス権限確認
    const project = await prisma.post.findUnique({
      where: { id: projectId },
      include: {
        author: {
          select: { facilityId: true, departmentId: true }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, facilityId: true, departmentId: true }
    });

    if (!user || user.level < 10) {
      throw new Error('Insufficient permissions');
    }

    // 権限チェック
    if (user.level < 13) {
      if (user.facilityId !== project.author.facilityId) {
        throw new Error('Access denied: different facility');
      }
      if (user.level === 10 && user.departmentId !== project.author.departmentId) {
        throw new Error('Access denied: different department');
      }
    }

    // 2. マイルストーン取得
    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId },
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return milestones.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      dueDate: m.dueDate.toISOString(),
      completedAt: m.completedAt?.toISOString(),
      completedBy: m.completedByUser ? {
        id: m.completedByUser.id,
        name: m.completedByUser.name
      } : null,
      status: m.status,
      order: m.order
    }));
  }
}
```

### 3.3 API実装（優先度: 高）

#### API 1: プロジェクト一覧取得

```typescript
// src/app/api/progress-dashboard/projects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ProgressDashboardService } from '@/services/ProgressDashboardService';
import { authenticateUser } from '@/lib/auth';

const service = new ProgressDashboardService();

export async function GET(request: NextRequest) {
  try {
    // 認証
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Level 10+チェック
    if (user.level < 10) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'このページは部長以上のみアクセス可能です',
            details: `User level: ${user.level}, Required: 10+`
          }
        },
        { status: 403 }
      );
    }

    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') as 'all' | 'active' | 'completed' | 'delayed' | undefined;
    const facilityId = searchParams.get('facilityId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // バリデーション
    if (filter && !['all', 'active', 'completed', 'delayed'].includes(filter)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PARAMETER',
            message: 'Invalid filter parameter',
            details: 'filter must be one of: all, active, completed, delayed'
          }
        },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'limit must be between 1-100' } },
        { status: 400 }
      );
    }

    // データ取得
    const result = await service.getAccessibleProjects(user.id, {
      filter,
      facilityId,
      departmentId,
      limit,
      offset
    });

    return NextResponse.json({
      data: result.projects,
      pagination: result.pagination,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('GET /api/progress-dashboard/projects error:', error);

    if (error.message.includes('permissions')) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: error.message } },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch projects',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}
```

#### API 2: 統計サマリー取得

```typescript
// src/app/api/progress-dashboard/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ProgressDashboardService } from '@/services/ProgressDashboardService';
import { authenticateUser } from '@/lib/auth';

const service = new ProgressDashboardService();

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    if (user.level < 10) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Level 10+ required' } },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;

    const stats = await service.getProjectStats(user.id, {
      facilityId,
      departmentId
    });

    return NextResponse.json({
      data: stats,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('GET /api/progress-dashboard/stats error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch stats',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}
```

#### API 3: マイルストーン一覧取得

```typescript
// src/app/api/progress-dashboard/projects/[projectId]/milestones/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ProgressDashboardService } from '@/services/ProgressDashboardService';
import { authenticateUser } from '@/lib/auth';

const service = new ProgressDashboardService();

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const milestones = await service.getProjectMilestones(params.projectId, user.id);

    return NextResponse.json({
      data: milestones,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('GET /api/progress-dashboard/projects/:id/milestones error:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }

    if (error.message.includes('denied')) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: error.message } },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch milestones',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}
```

### 3.4 フロントエンド実装（優先度: 中）

#### useProgressDashboardフック実装例

```typescript
// src/hooks/useProgressDashboard.ts

import useSWR from 'swr';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  teamSize: number;
  completedMilestones: number;
  totalMilestones: number;
  dueDate: string;
  isDelayed: boolean;
  level: string;
  createdAt: string;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  delayed: number;
  avgProgress: number;
}

export function useProgressDashboard(
  filter: 'all' | 'active' | 'completed' | 'delayed',
  options?: {
    facilityId?: string;
    departmentId?: string;
  }
) {
  // プロジェクト一覧取得
  const queryParams = new URLSearchParams({
    filter,
    ...(options?.facilityId && { facilityId: options.facilityId }),
    ...(options?.departmentId && { departmentId: options.departmentId })
  });

  const { data: projectsData, error: projectsError, isLoading: projectsLoading } = useSWR<{
    data: Project[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }>(`/api/progress-dashboard/projects?${queryParams.toString()}`);

  // 統計サマリー取得
  const statsQueryParams = new URLSearchParams({
    ...(options?.facilityId && { facilityId: options.facilityId }),
    ...(options?.departmentId && { departmentId: options.departmentId })
  });

  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR<{
    data: ProjectStats;
  }>(`/api/progress-dashboard/stats?${statsQueryParams.toString()}`, {
    refreshInterval: 60000  // 1分ごとに再取得
  });

  return {
    projects: projectsData?.data || [],
    pagination: projectsData?.pagination,
    stats: statsData?.data,
    isLoading: projectsLoading || statsLoading,
    error: projectsError || statsError
  };
}
```

#### ProgressDashboardPage実装例

```typescript
// src/app/progress-dashboard/page.tsx

'use client';

import { useState } from 'react';
import { useProgressDashboard } from '@/hooks/useProgressDashboard';

export default function ProgressDashboardPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'delayed'>('all');
  const { projects, stats, isLoading } = useProgressDashboard(filter);

  if (isLoading) {
    return <div className="text-center py-12">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2">進捗ダッシュボード</h1>
        <p className="text-gray-300">複数部署・施設全体のプロジェクト進捗を俯瞰的に管理（部長以上）</p>
      </div>

      {/* 統計サマリー */}
      {stats && (
        <div className="mx-6 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="総プロジェクト数" count={stats.total} />
          <StatCard label="進行中" count={stats.active} color="blue" />
          <StatCard label="完了" count={stats.completed} color="green" />
          <StatCard label="遅延" count={stats.delayed} color="red" />
          <StatCard label="平均進捗" count={`${stats.avgProgress}%`} color="purple" />
        </div>
      )}

      {/* フィルター */}
      <div className="mx-6 mb-6 flex gap-2 bg-gray-800/50 rounded-xl p-2">
        {['all', 'active', 'completed', 'delayed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {f === 'all' ? 'すべて' : f === 'active' ? '進行中' : f === 'completed' ? '完了' : '遅延'}
          </button>
        ))}
      </div>

      {/* プロジェクト一覧 */}
      <div className="mx-6 pb-24 space-y-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

---

## 4. テスト推奨事項

### 4.1 APIテスト（必須）

```typescript
describe('ProgressDashboard API Tests', () => {
  it('GET /api/progress-dashboard/projects - 正常系', async () => {
    const response = await fetch('/api/progress-dashboard/projects?filter=all&limit=10', {
      headers: { Authorization: `Bearer ${level10Token}` }
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeInstanceOf(Array);
    expect(data.pagination.total).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/progress-dashboard/stats - 統計取得', async () => {
    const response = await fetch('/api/progress-dashboard/stats', {
      headers: { Authorization: `Bearer ${level10Token}` }
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toHaveProperty('total');
    expect(data.data).toHaveProperty('avgProgress');
  });

  it('Level 9ユーザーはアクセス不可', async () => {
    const response = await fetch('/api/progress-dashboard/projects', {
      headers: { Authorization: `Bearer ${level9Token}` }
    });

    expect(response.status).toBe(403);
  });
});
```

### 4.2 権限テスト（必須）

```typescript
describe('ProgressDashboard Permission Tests', () => {
  it('Level 10は自部門のみアクセス可能', async () => {
    const response = await fetch('/api/progress-dashboard/projects', {
      headers: { Authorization: `Bearer ${level10DeptAToken}` }
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // すべてのプロジェクトが自部門のもの
    data.data.forEach((project: any) => {
      expect(project.author.departmentId).toBe('dept-A');
    });
  });

  it('Level 13は全施設アクセス可能', async () => {
    const response = await fetch('/api/progress-dashboard/projects', {
      headers: { Authorization: `Bearer ${level13Token}` }
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // 複数施設のプロジェクトが含まれる
    const facilities = [...new Set(data.data.map((p: any) => p.author.facilityId))];
    expect(facilities.length).toBeGreaterThan(1);
  });
});
```

---

## 5. リスク・注意事項

### 5.1 パフォーマンスリスク（中）

**リスク**: プロジェクト数増加に伴う一覧取得クエリの遅延

**影響**:
- 1,000プロジェクト超過時: 500ms-1秒のレスポンスタイム
- マイルストーン/チームメンバーのN+1クエリ発生リスク

**対策**:
```typescript
// ✅ include使用でN+1回避
const projects = await prisma.post.findMany({
  where: { type: 'project' },
  include: {
    milestones: true,  // 一括取得
    teamMembers: true,
    _count: { select: { milestones: true, teamMembers: true } }
  }
});
```

### 5.2 権限制御リスク（高）

**リスク**: Level 10ユーザーが他部門のプロジェクトを閲覧

**影響**: セキュリティインシデント、プライバシー侵害

**対策**:
```typescript
// WHERE条件に必ず権限フィルタを含める
if (user.level === 10) {
  where.author = {
    facilityId: user.facilityId,
    departmentId: user.departmentId  // 必須
  };
}
```

### 5.3 遅延判定ロジックリスク（低）

**リスク**: タイムゾーン差異による誤判定

**対策**:
```typescript
// UTCで統一比較
const now = new Date();
const isDelayed = project.projectDueDate.getTime() < now.getTime();
```

---

## 6. 将来拡張提案

### 6.1 プロジェクトテンプレート機能

```typescript
model ProjectTemplate {
  id               String    @id @default(cuid())
  name             String
  description      String?
  category         String    // 'education' | 'system' | 'workflow' | 'other'
  defaultDuration  Int       // デフォルト期間（日数）

  milestoneTemplates ProjectMilestoneTemplate[]
}

model ProjectMilestoneTemplate {
  id                String    @id @default(cuid())
  templateId        String
  title             String
  description       String?
  daysFromStart     Int       // プロジェクト開始からの日数
  order             Int

  template          ProjectTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
}
```

### 6.2 施設横断比較レポート

```typescript
async generateCrossFacilityReport(): Promise<{
  facilityId: string;
  facilityName: string;
  totalProjects: number;
  completionRate: number;
  avgProgress: number;
}[]> {
  // 施設ごとのプロジェクト統計を集計
}
```

### 6.3 自動遅延アラート

```typescript
// バッチジョブで毎日実行
async function sendDelayedProjectAlerts() {
  const delayedProjects = await prisma.post.findMany({
    where: {
      type: 'project',
      status: 'active',
      projectDueDate: { lt: new Date() }
    },
    include: {
      teamMembers: {
        where: { role: 'leader' }
      }
    }
  });

  for (const project of delayedProjects) {
    await sendEmail({
      to: project.teamMembers.map(m => m.user.email),
      subject: `[遅延警告] ${project.title}`,
      body: `プロジェクトが期限を過ぎています。確認してください。`
    });
  }
}
```

---

## 7. まとめ

### 医療システム側の対応

- ✅ **追加実装不要**: 既存API（facilities/departments/employees）で対応可能
- ✅ **既存機能で対応**: 新しいエンドポイント追加は不要です

### VoiceDrive側の実装要件

- 🔧 **新規テーブル作成**: ProjectMilestone/ProjectTeamMember（必須）
- 🔧 **Postテーブル拡張**: projectDueDate/projectLevel/projectProgress（必須）
- 🔧 **API実装**: 3エンドポイント（必須）
- 📊 **テスト実装**: 権限テスト・パフォーマンステスト（必須）

### 実装優先度

1. **Phase 1（必須）**: スキーマ変更・マイグレーション実行
2. **Phase 2（必須）**: Service層・API実装
3. **Phase 3（推奨）**: フロントエンド実装・テスト
4. **Phase 4（将来）**: テンプレート機能・アラート機能

**推定工数**: 9日間（Phase 1-3のみ）

---

**承認状態**: VoiceDriveチームレビュー待ち
**次のアクション**: VoiceDriveチームによる実装スケジュール確定

---

**添付ファイル**:
- なし

**関連ドキュメント**:
- `progress-dashboard_DB要件分析_20251011.md`（参照元）
- `共通DB構築後_作業再開指示書_20250928.md`（更新対象）
