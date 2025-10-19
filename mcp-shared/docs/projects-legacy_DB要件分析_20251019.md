# Projects Legacy (プロジェクト一覧レガシー) DB要件分析

**文書番号**: PL-DBA-2025-1019-001
**作成日**: 2025年10月19日
**作成者**: VoiceDriveチーム
**対象ページ**: `/projects-legacy`
**対象コンポーネント**: `ProjectListPage.tsx`
**ステータス**: 🟡 分析完了（DB統合作業必要）

---

## 📋 エグゼクティブサマリー

### 現状の問題点

**Projects Legacy ページは100%ハードコードされたデモデータで動作しており、データベース統合が一切行われていません。**

| 項目 | 現状 | あるべき姿 |
|------|------|-----------|
| **データソース** | ハードコードされた配列 | Prisma Project モデル |
| **API連携** | なし | ProjectService経由でDB取得 |
| **リアルタイム性** | 固定データ（5件） | ユーザーの実際のプロジェクト |
| **データ整合性** | なし | PostテーブルとProjectテーブルの連携 |
| **フィルタ機能** | デモデータのみ | status, category, myRole等でDB検索 |

### 重要な発見

1. **ProjectServiceが既に実装済み** (`src/api/db/projectService.ts`, 467行)
   - `list()`, `getById()`, `propose()`, `approve()`, `start()` 等のメソッドが完備
   - しかし **ProjectListPageは一切使用していない**

2. **schema.prismaにProjectモデルが存在** (lines 203-229)
   - 必要なフィールドの大部分が既に定義済み
   - ただし **ProjectListPageのinterfaceと不一致** あり

3. **2つの異なるProject型定義が混在**
   - `src/types/project.ts`: 新しいプロジェクト化モード用（予算廃止、規模概念導入）
   - `ProjectListPage.tsx`: レガシープロジェクト用（予算あり、異なるステータス）

4. **Post → Project の変換ロジックが未実装**
   - Idea Tracking（アイデアボイス投稿）からプロジェクト化した際のPost → Project変換が未実装

### 優先度の判断

⚠️ **中優先度**（即座の対応は不要、計画的な統合が必要）

**理由**:
- ページは動作している（デモデータで）
- 他の重要なDB統合作業（Idea Tracking, Phase 1.2 MySQL移行）が優先
- ProjectServiceが既に実装済みのため、統合作業は比較的容易

**推奨スケジュール**: Phase 2 完了後、Phase 3 で実施（2025年12月～2026年1月）

---

## 🔍 現状分析

### 1. ProjectListPage.tsx の機能詳細

**ファイル**: `src/pages/ProjectListPage.tsx` (376行)

#### 主要機能

1. **プロジェクト一覧表示**
   - フィルタ機能（status, category, priority, myRole）
   - ソート機能（最新順、優先度順）
   - ページネーション（未実装）

2. **プロジェクトステータス管理**
   ```typescript
   status: 'proposed' | 'active' | 'completed' | 'paused'
   ```

3. **プロジェクト詳細情報**
   - タイトル、説明、進捗率、開始日、終了日
   - 参加者数、部署、施設、カテゴリ
   - 優先度、自分の役割

4. **緊急エスカレーション表示**
   - `isEmergencyEscalated` フラグ
   - エスカレーション日時と実行者

5. **承認ステータス表示**
   - `approvalStatus`: 'pending' | 'approved' | 'rejected' | 'escalated'
   - 現在の承認者情報

#### 現在のデータフロー

```
ProjectListPage.tsx (lines 78-145)
  ↓
getDemoProjects() ← ハードコード配列
  ↓
ローカルstate (projects)
  ↓
フィルタ・ソート処理
  ↓
UI表示
```

**問題点**: データベースへの接続が一切ない

### 2. 既存のProject関連テーブル

#### Projectモデル (schema.prisma lines 203-229)

```prisma
model Project {
  id               String    @id @default(cuid())
  title            String
  description      String
  category         String
  proposerId       String
  objectives       Json      // 🔴 ProjectListPageに未使用
  expectedOutcomes Json      // 🔴 ProjectListPageに未使用
  budget           Float?    // ✅ ProjectListPageに使用
  timeline         Json?     // 🔴 ProjectListPageに未使用
  status           String    @default("proposed") // ✅ 使用（値が異なる）
  priority         String?   // ✅ 使用
  approvalLevel    Int       @default(0) // 🔴 ProjectListPageに未使用
  approvedBy       Json?     // 🔴 ProjectListPageに未使用
  rejectionReason  String?   // 🔴 ProjectListPageに未使用
  progressRate     Float     @default(0) // ✅ progress として使用
  milestones       Json?     // 🔴 ProjectListPageに未使用
  deliverables     Json?     // 🔴 ProjectListPageに未使用
  actualOutcomes   Json?     // 🔴 ProjectListPageに未使用
  lessonsLearned   String?   // 🔴 ProjectListPageに未使用
  roi              Float?    // 🔴 ProjectListPageに未使用
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  startedAt        DateTime? // ✅ startDate として使用
  completedAt      DateTime? // ✅ endDate として使用
  proposer         User      @relation(fields: [proposerId], references: [id])
}
```

#### ProjectTeamMemberモデル (schema.prisma lines 1669-1686)

```prisma
model ProjectTeamMember {
  id        String    @id @default(cuid())
  projectId String
  userId    String
  role      String    @default("member") // ✅ myRole として使用
  joinedAt  DateTime  @default(now())
  leftAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  user      User      @relation("ProjectMemberships", fields: [userId], references: [id])
  project   Post      @relation("ProjectTeamMembers", fields: [projectId], references: [id])

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([role])
  @@map("project_team_members")
}
```

**⚠️ 重要な発見**: `project` フィールドが `Post` を参照している
- これは **Postテーブルがプロジェクト化後もプロジェクト情報を保持する** 設計を示唆

#### ProjectMilestoneモデル (schema.prisma lines 1648-1667)

```prisma
model ProjectMilestone {
  id              String    @id @default(cuid())
  projectId       String
  title           String
  description     String?
  dueDate         DateTime
  completedAt     DateTime?
  completedBy     String?
  status          String    @default("pending")
  order           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  completedByUser User?     @relation("MilestoneCompletedBy", fields: [completedBy], references: [id])
  project         Post      @relation("ProjectMilestones", fields: [projectId], references: [id])

  @@index([projectId])
  @@index([status])
  @@index([dueDate])
  @@map("project_milestones")
}
```

**⚠️ 同様の問題**: `project` フィールドが `Post` を参照

#### ProjectApprovalモデル (schema.prisma lines 1525-1552)

```prisma
model ProjectApproval {
  id                  String   @id @default(cuid())
  postId              String
  approverId          String
  approverName        String
  approverLevel       Float
  action              String   // ✅ approvalStatus として使用可能
  reason              String?
  comment             String?
  projectLevel        String
  projectScore        Int
  totalVotes          Int
  supportRate         Float
  isEmergencyOverride Boolean  @default(false) // ✅ isEmergencyEscalated として使用
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  approver            User     @relation("ProjectApprover", fields: [approverId], references: [id])
  post                Post     @relation("PostApprovals", fields: [postId], references: [id])

  @@index([postId])
  @@index([approverId])
  @@index([action])
  @@index([projectLevel])
  @@index([createdAt])
  @@map("project_approvals")
}
```

### 3. ProjectServiceの実装状況

**ファイル**: `src/api/db/projectService.ts` (467行)

#### 実装済みメソッド

| メソッド | 機能 | ProjectListPageでの使用 |
|---------|------|------------------------|
| `list(filters?)` | プロジェクト一覧取得 | ❌ **未使用** |
| `getById(id)` | プロジェクト詳細取得 | ❌ 未使用 |
| `propose(data)` | プロジェクト提案 | ❌ 未使用 |
| `approve(id, approverId)` | プロジェクト承認 | ❌ 未使用 |
| `reject(id, approverId, reason)` | プロジェクト却下 | ❌ 未使用 |
| `start(id)` | プロジェクト開始 | ❌ 未使用 |
| `updateProgress(id, data)` | 進捗更新 | ❌ 未使用 |
| `complete(id, results)` | プロジェクト完了 | ❌ 未使用 |
| `getDashboard(period?)` | ダッシュボード統計 | ❌ 未使用 |

**結論**: ProjectServiceは完全に実装されているが、ProjectListPageは全く使用していない

#### ProjectService.list() のフィルタ機能

```typescript
static async list(filters?: {
  status?: string;
  category?: string;
  proposerId?: string;
  priority?: string;
})
```

**ProjectListPageの要求フィルタ**と比較:

| ProjectListPageのフィルタ | ProjectService対応 | ギャップ |
|-------------------------|-------------------|---------|
| `status` | ✅ 対応 | なし |
| `category` | ✅ 対応 | なし |
| `priority` | ✅ 対応 | なし |
| `myRole` | ❌ 未対応 | **要追加** |

**`myRole` フィルタの実装が必要**:
- ProjectTeamMemberテーブルとJOINして、ユーザーの役割でフィルタリング

---

## 🎯 データ管理責任分界点

### VoiceDrive側の責任（100%）

| データカテゴリ | 管理テーブル | 詳細 |
|--------------|-------------|------|
| **プロジェクト基本情報** | `Project` | title, description, category, status, priority |
| **プロジェクト進捗** | `Project` | progressRate, startedAt, completedAt |
| **チームメンバー** | `ProjectTeamMember` | userId, role, joinedAt, leftAt |
| **マイルストーン** | `ProjectMilestone` | title, dueDate, status, completedAt |
| **承認履歴** | `ProjectApproval` | action, approverName, isEmergencyOverride |
| **プロジェクト提案** | `Project` | proposerId, objectives, expectedOutcomes |
| **成果物** | `Project` | deliverables, actualOutcomes, lessonsLearned |

### 医療システム側からの参照（読み取り専用）

| データカテゴリ | ソース | 用途 |
|--------------|-------|------|
| **ユーザー基本情報** | 医療システム User API | proposer.name, teamMember.name 表示 |
| **部署情報** | 医療システム Organization API | department 表示 |
| **施設情報** | 医療システム Facility API | facility 表示 |
| **権限レベル** | 医療システム User API | 承認権限チェック |

**⚠️ 重要**: 医療システム側は **一切のProjectデータを保持しない**
- VoiceDriveが100%管理
- 医療システムからは既存API（ユーザー、部署、施設）のみ使用

---

## 🔴 不足項目の洗い出し

### 1. Projectテーブルの不足フィールド

ProjectListPageのinterfaceとschema.prismaのProjectモデルを比較:

| ProjectListPage Interface | schema.prisma Project | ギャップ | 対応 |
|--------------------------|---------------------|---------|------|
| `id` | `id` | なし | - |
| `title` | `title` | なし | - |
| `description` | `description` | なし | - |
| `status` | `status` | **値の定義が異なる** | 🔴 要調整 |
| `progress` | `progressRate` | 名前のみ異なる | 🟡 マッピング |
| `startDate` | `startedAt` | 名前のみ異なる | 🟡 マッピング |
| `endDate` | `completedAt` | 名前のみ異なる | 🟡 マッピング |
| `participants` | - | **不足** | 🔴 要追加（計算フィールド） |
| `department` | - | **不足** | 🔴 要追加 |
| `facility` | - | **不足** | 🔴 要追加 |
| `category` | `category` | なし | - |
| `priority` | `priority` | なし | - |
| `myRole` | - | **不足** | 🔴 要追加（ProjectTeamMemberから取得） |
| `projectLevel` | - | **不足** | 🔴 要追加（Postから取得） |
| `isEmergencyEscalated` | - | **不足** | 🔴 要追加（ProjectApprovalから取得） |
| `escalatedBy` | - | **不足** | 🔴 要追加（ProjectApprovalから取得） |
| `escalatedDate` | - | **不足** | 🔴 要追加（ProjectApprovalから取得） |
| `approvalStatus` | - | **不足** | 🔴 要追加（ProjectApprovalから取得） |
| `currentApprover` | - | **不足** | 🔴 要追加（ProjectApprovalから取得） |

#### status 値の不一致

**ProjectListPage**:
```typescript
status: 'proposed' | 'active' | 'completed' | 'paused'
```

**schema.prisma Project**:
```typescript
status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
```

**⚠️ 対応が必要**:
- `active` → `in_progress` にマッピング
- `paused` → `on_hold` を追加（schema.prismaに不足）
- `cancelled` の扱いを決定

#### 追加が必要なフィールド

**Projectテーブルに追加**:

```prisma
model Project {
  // ... 既存フィールド ...

  // 🆕 追加フィールド
  department       String?   // 主管部署
  facilityId       String?   // 施設ID
  facilityName     String?   // 施設名（キャッシュ）
  originalPostId   String?   // 元になったPostのID

  // リレーション追加
  originalPost     Post?     @relation("ProjectFromPost", fields: [originalPostId], references: [id])
}
```

### 2. ProjectServiceの不足メソッド

**`myRole` フィルタ対応**:

```typescript
// ProjectService に追加が必要
static async listByUser(userId: string, filters?: {
  role?: string;          // 'owner' | 'participant' | 'viewer'
  status?: string;
  category?: string;
  priority?: string;
}) {
  // ProjectTeamMemberテーブルとJOINして取得
}
```

**緊急エスカレーション取得**:

```typescript
// ProjectService に追加が必要
static async getEmergencyEscalation(projectId: string) {
  // ProjectApprovalテーブルから isEmergencyOverride=true を取得
}
```

**プロジェクト統計情報取得**:

```typescript
// ProjectService に追加が必要
static async getProjectStats(projectId: string) {
  return {
    participants: number;    // ProjectTeamMemberのcount
    milestones: {
      total: number;
      completed: number;
    };
    approvalStatus: string;
    currentApprover: string;
  };
}
```

### 3. 新規APIエンドポイント

ProjectListPageをDB統合するために必要なAPIエンドポイント:

| エンドポイント | メソッド | 用途 | 優先度 |
|--------------|---------|------|--------|
| `/api/projects` | GET | プロジェクト一覧取得 | 🔴 必須 |
| `/api/projects/:id` | GET | プロジェクト詳細取得 | 🔴 必須 |
| `/api/projects/my` | GET | 自分が関わるプロジェクト取得 | 🔴 必須 |
| `/api/projects/:id/team` | GET | チームメンバー取得 | 🟡 推奨 |
| `/api/projects/:id/approvals` | GET | 承認履歴取得 | 🟡 推奨 |
| `/api/projects/:id/milestones` | GET | マイルストーン取得 | 🟡 推奨 |

**統合後のデータフロー**:

```
ProjectListPage.tsx
  ↓
GET /api/projects?status=active&myRole=owner
  ↓
ProjectService.listByUser(userId, filters)
  ↓
Prisma query (Project JOIN ProjectTeamMember)
  ↓
Response with projects[]
  ↓
UI表示
```

---

## 📊 Post → Project の変換ロジック

### 前提: Postテーブルとの関係

**重要な設計決定**:

現在のスキーマ (`ProjectTeamMember`, `ProjectMilestone`) は `project` フィールドで **Post を参照** している:

```prisma
model ProjectTeamMember {
  project   Post  @relation("ProjectTeamMembers", fields: [projectId], references: [id])
}

model ProjectMilestone {
  project   Post  @relation("ProjectMilestones", fields: [projectId], references: [id])
}
```

**これは以下を意味する**:
1. **Postがプロジェクト化されると、PostがProjectとして機能する**
2. **独立したProjectテーブルは「提案段階のプロジェクト」専用**
3. **プロジェクト化後は Post.projectLevel, Post.projectScore がメイン**

### 推奨アーキテクチャ

#### オプション A: Post中心アーキテクチャ（現在のスキーマ準拠）

**Postテーブルがプロジェクト情報を保持**:

```prisma
model Post {
  // ... 既存フィールド ...

  // プロジェクトモード用（既に追加済み）
  projectScore                      Int?
  projectLevel                      String?
  currentProjectLevelStartedAt      DateTime?
  lastProjectLevelUpgrade           DateTime?

  // 🆕 プロジェクト実行用フィールド追加
  projectStatus                     String?   // 'active' | 'completed' | 'paused'
  projectProgress                   Float?    @default(0)
  projectStartDate                  DateTime?
  projectEndDate                    DateTime?
  projectDepartment                 String?
  projectFacilityId                 String?
  projectFacilityName               String?

  // リレーション
  projectTeamMembers                ProjectTeamMember[] @relation("ProjectTeamMembers")
  projectMilestones                 ProjectMilestone[]  @relation("ProjectMilestones")
  projectApprovals                  ProjectApproval[]   @relation("PostApprovals")
  projectLevelHistory               ProjectLevelHistory[] @relation("PostProjectLevelHistory")
}
```

**メリット**:
- スキーマの大幅な変更が不要
- Idea Tracking → Project への連続性が保たれる
- 既存のPostApproval等がそのまま使える

**デメリット**:
- Postテーブルが肥大化
- Post（投稿）とProject（プロジェクト）の概念的混同

#### オプション B: Project独立アーキテクチャ

**Projectテーブルを完全に独立させる**:

```prisma
model Project {
  // ... 既存フィールド ...

  originalPostId   String?  // 元になったPostへの参照

  // リレーション変更
  originalPost     Post?    @relation("ProjectFromPost", fields: [originalPostId], references: [id])
  teamMembers      ProjectTeamMember[] @relation("ProjectTeam")
  milestones       ProjectMilestone[]  @relation("ProjectMilestones")
  approvals        ProjectApproval[]   @relation("ProjectApprovals")
}

model ProjectTeamMember {
  // リレーション変更
  project   Project  @relation("ProjectTeam", fields: [projectId], references: [id])
}

model ProjectMilestone {
  // リレーション変更
  project   Project  @relation("ProjectMilestones", fields: [projectId], references: [id])
}

model ProjectApproval {
  // 両方をサポート
  postId     String?
  projectId  String?

  post       Post?     @relation("PostApprovals", fields: [postId], references: [id])
  project    Project?  @relation("ProjectApprovals", fields: [projectId], references: [id])
}
```

**メリット**:
- PostとProjectの概念的分離が明確
- Projectテーブルがプロジェクト管理に特化
- 将来的な拡張が容易

**デメリット**:
- **スキーマの大幅な変更が必要**
- 既存のProjectTeamMember, ProjectMilestone等のマイグレーションが必要
- データ移行の複雑性

### 推奨: オプション A（Post中心）

**理由**:
1. **既存のスキーマとの整合性**
   - ProjectTeamMember, ProjectMilestone が既に Post を参照
   - 変更が最小限で済む

2. **Idea Tracking との統合**
   - Post → プロジェクト化 の流れが自然
   - projectScore, projectLevel が既に Post に存在

3. **実装の容易さ**
   - Postテーブルへのフィールド追加のみ
   - 既存のリレーションを活用

**実装方針**:
- Postテーブルにプロジェクト実行用フィールドを追加
- ProjectListPageはPostテーブルから `projectLevel='TEAM'` 以上のレコードを取得
- 独立したProjectテーブルは「提案段階」専用として残す

---

## 📝 実装計画

### Phase 1: スキーマ拡張（3日）

#### 1-1. Postテーブル拡張

```prisma
model Post {
  // ... 既存フィールド ...

  // 🆕 プロジェクト実行管理フィールド
  projectStatus                     String?   @map("project_status")
  projectProgress                   Float?    @default(0) @map("project_progress")
  projectStartDate                  DateTime? @map("project_start_date")
  projectEndDate                    DateTime? @map("project_end_date")
  projectDepartment                 String?   @map("project_department")
  projectFacilityId                 String?   @map("project_facility_id")
  projectFacilityName               String?   @map("project_facility_name")
  projectParticipants               Int?      @default(0) @map("project_participants")
}
```

#### 1-2. Projectテーブル調整（提案段階専用として明確化）

```prisma
model Project {
  // ... 既存フィールド ...

  // 🆕 Post変換用
  convertedToPostId  String?   @unique @map("converted_to_post_id")
  conversionDate     DateTime? @map("conversion_date")

  // リレーション
  convertedPost      Post?     @relation("ConvertedFromProject", fields: [convertedToPostId], references: [id])
}
```

### Phase 2: ProjectService拡張（5日）

#### 2-1. プロジェクト一覧取得（Post中心）

```typescript
// src/api/db/projectService.ts に追加

/**
 * プロジェクト化されたPostを取得
 */
static async listActiveProjects(filters?: {
  status?: 'active' | 'completed' | 'paused';
  category?: string;
  priority?: string;
  userId?: string;
  role?: 'owner' | 'participant' | 'viewer';
  facilityId?: string;
  department?: string;
}) {
  const where: any = {
    projectLevel: {
      in: ['TEAM', 'DEPARTMENT', 'FACILITY', 'ORGANIZATION', 'STRATEGIC']
    },
  };

  if (filters?.status) {
    where.projectStatus = filters.status;
  }

  if (filters?.category) {
    where.proposalType = filters.category;
  }

  // userId + role フィルタ
  if (filters?.userId && filters?.role) {
    where.projectTeamMembers = {
      some: {
        userId: filters.userId,
        role: filters.role,
      }
    };
  }

  const projects = await prisma.post.findMany({
    where,
    include: {
      author: true,
      projectTeamMembers: {
        include: { user: true }
      },
      projectMilestones: true,
      projectApprovals: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [
      { projectLevel: 'desc' },
      { projectScore: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return {
    success: true,
    data: projects.map(post => convertPostToProjectListItem(post)),
    count: projects.length,
  };
}

/**
 * Post を ProjectListItem に変換
 */
function convertPostToProjectListItem(post: Post): ProjectListItem {
  const latestApproval = post.projectApprovals[0];
  const teamMembers = post.projectTeamMembers || [];

  return {
    id: post.id,
    title: post.content.substring(0, 100), // タイトル抽出ロジック
    description: post.content,
    status: post.projectStatus || 'active',
    progress: post.projectProgress || 0,
    startDate: post.projectStartDate?.toISOString(),
    endDate: post.projectEndDate?.toISOString(),
    participants: teamMembers.length,
    department: post.projectDepartment || post.author.department,
    facility: post.projectFacilityName,
    category: post.proposalType,
    priority: determinePriority(post.projectLevel, post.projectScore),
    myRole: determineUserRole(post, currentUserId),
    projectLevel: post.projectLevel,
    isEmergencyEscalated: latestApproval?.isEmergencyOverride || false,
    escalatedBy: latestApproval?.approverName,
    escalatedDate: latestApproval?.createdAt?.toISOString(),
    approvalStatus: latestApproval?.action || 'pending',
    currentApprover: latestApproval?.approverName,
  };
}
```

#### 2-2. myRole判定ロジック

```typescript
function determineUserRole(post: Post, userId: string): 'owner' | 'participant' | 'viewer' {
  const teamMembership = post.projectTeamMembers?.find(m => m.userId === userId);

  if (!teamMembership) {
    return 'viewer';
  }

  if (teamMembership.role === 'プロジェクトリーダー' || post.authorId === userId) {
    return 'owner';
  }

  return 'participant';
}
```

### Phase 3: APIエンドポイント実装（3日）

```typescript
// src/pages/api/projects/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ProjectService } from '../../../api/db/projectService';
import { getServerSession } from 'next-auth/next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { status, category, priority, myRole, facilityId, department } = req.query;

    const result = await ProjectService.listActiveProjects({
      status: status as any,
      category: category as string,
      priority: priority as string,
      userId: session.user.id,
      role: myRole as any,
      facilityId: facilityId as string,
      department: department as string,
    });

    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

```typescript
// src/pages/api/projects/my.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await ProjectService.listActiveProjects({
    userId: session.user.id,
  });

  if (result.success) {
    return res.status(200).json(result.data);
  } else {
    return res.status(500).json({ error: result.error });
  }
}
```

### Phase 4: ProjectListPage統合（2日）

```typescript
// src/pages/ProjectListPage.tsx の修正

export const ProjectListPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // フィルタstate
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, [statusFilter, categoryFilter, roleFilter]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (roleFilter !== 'all') params.append('myRole', roleFilter);

      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();

      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... UI レンダリング ...
};
```

### Phase 5: テストとデバッグ（2日）

- APIエンドポイントのテスト
- フィルタ機能の動作確認
- パフォーマンステスト
- エラーハンドリングの確認

---

## 📅 実装スケジュール

### 推奨スケジュール: Phase 2完了後

| フェーズ | 期間 | 工数 | 担当 | 依存関係 |
|---------|------|------|------|---------|
| **Phase 1** | 2025年12月1日～12月3日 | 3日 | VoiceDrive | MySQL移行完了後 |
| **Phase 2** | 2025年12月4日～12月10日 | 5日 | VoiceDrive | Phase 1完了 |
| **Phase 3** | 2025年12月11日～12月13日 | 3日 | VoiceDrive | Phase 2完了 |
| **Phase 4** | 2025年12月14日～12月15日 | 2日 | VoiceDrive | Phase 3完了 |
| **Phase 5** | 2025年12月16日～12月17日 | 2日 | VoiceDrive | Phase 4完了 |
| **リリース** | 2025年12月18日 | - | VoiceDrive | 全Phase完了 |

**総工数**: 15日（3週間）
**コスト見積もり**: ¥600,000（15日 × ¥40,000/日）

### 依存関係

**前提条件**:
1. ✅ Phase 1.2 (MySQL移行) 完了
2. ✅ Idea Tracking Phase 1 (schema拡張) 完了
3. ⏳ Post → Project 変換ポリシーの確定

**並行作業可能**:
- エグゼクティブダッシュボード実装（医療システム側）
- Phase 18.5 準備作業

---

## 🎯 成功指標

### 技術指標

| 指標 | 目標 | 測定方法 |
|------|------|---------|
| **API レスポンスタイム** | < 500ms | プロジェクト一覧取得時間 |
| **データ整合性** | 100% | Post ↔ Project の変換精度 |
| **フィルタ精度** | 100% | 期待される結果との一致率 |
| **エラー率** | < 0.1% | API呼び出し失敗率 |

### ビジネス指標

| 指標 | 目標 | 測定方法 |
|------|------|---------|
| **プロジェクト可視化率** | 100% | DB上のプロジェクトがUIに表示される率 |
| **ユーザー満足度** | > 80% | フィードバック調査 |
| **デモデータ依存率** | 0% | ハードコードデータの削除完了 |

---

## 🚨 リスクと対策

### リスク 1: Post と Project の概念混同

**リスク内容**:
- Postテーブルにプロジェクト情報を追加することで、概念的な混同が発生

**対策**:
- 明確なドキュメント化
- `projectLevel` が 'TEAM' 以上の Post は「プロジェクト」として扱うルールを確立
- 将来的にはView（`ProjectView`）を作成して抽象化

### リスク 2: 既存データの整合性

**リスク内容**:
- ProjectTeamMember, ProjectMilestone の既存データが Post を参照している

**対策**:
- マイグレーション前にデータ整合性チェック
- 不整合データのクリーンアップスクリプト作成

### リスク 3: パフォーマンス劣化

**リスク内容**:
- Post テーブルへの複雑なJOIN により、クエリが遅くなる

**対策**:
- インデックス最適化
- キャッシュ戦略の導入
- N+1問題の回避

---

## 📞 次のアクション

### VoiceDriveチーム（即座実行）

✅ **10月19日～10月20日**:
- [ ] Post → Project 変換ポリシーの最終確認
- [ ] スキーマ拡張の詳細設計

⏳ **12月1日～12月17日（Phase 2完了後）**:
- [ ] Phase 1-5 の実装
- [ ] テストとデバッグ
- [ ] リリース

### 医療システムチーム

**対応不要**:
- Projects Legacy は VoiceDrive 100% 管理
- 医療システムからの新規API提供は不要

---

## 📚 参考資料

- [idea-tracking_DB要件分析_20251018.md](./idea-tracking_DB要件分析_20251018.md)
- [Proposal_IdeaTracking_MySQL_Integration_20251019.md](./Proposal_IdeaTracking_MySQL_Integration_20251019.md)
- [AWS Lightsail統合実装マスタープラン](./AWS_Lightsail統合実装マスタープラン_20251018.md)

---

**本分析書をご確認いただき、実装方針について合意が得られましたら、Phase 2 完了後に実装を開始いたします。**

**VoiceDriveチーム**
2025年10月19日
