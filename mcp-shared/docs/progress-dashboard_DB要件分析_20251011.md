# ProgressDashboard（進捗ダッシュボード）DB要件分析書

**作成日**: 2025年10月11日
**対象ページ**: ProgressDashboard（進捗ダッシュボード）
**URL**: https://voicedrive-v100.vercel.app/progress-dashboard
**対象レベル**: Level 10+（部長以上）
**ページ目的**: 複数部署・施設全体のプロジェクト進捗を俯瞰的に可視化

---

## 1. エグゼクティブサマリー

### 1.1 主要な発見事項

**結論**: ProgressDashboardページは**既存テーブルのみで実装可能**です。

- ✅ **新規テーブル不要**: 既存Post/Vote/Commentテーブルで対応可能
- ⚠️ **複合インデックス追加推奨**: プロジェクト絞り込みクエリの高速化
- 🔄 **医療システムAPI使用**: 施設・部門情報の取得に既存APIを活用
- 📊 **進捗計算ロジック**: クライアント側で計算（マイルストーン情報はPost拡張で対応）

### 1.2 データ管理責任分担

| データ種別 | 管理システム | 理由 |
|-----------|------------|------|
| プロジェクト情報 | VoiceDrive | 既存Postテーブル（type='project'） |
| マイルストーン情報 | VoiceDrive | 新規ProjectMilestoneテーブル（推奨） |
| チームメンバー情報 | VoiceDrive | 新規ProjectTeamMemberテーブル（推奨） |
| 施設・部門マスター | 医療システム | 既存API `/api/v2/facilities`, `/api/v2/departments` |
| 職員情報 | 医療システム | 既存API `/api/v2/employees` |

### 1.3 実装推奨事項

#### Phase 1（必須）: コアテーブル追加
1. **ProjectMilestone**テーブル作成（マイルストーン管理）
2. **ProjectTeamMember**テーブル作成（チームメンバー管理）
3. 複合インデックス追加（Post絞り込み高速化）

#### Phase 2（推奨）: API実装
1. `GET /api/progress-dashboard/projects` - プロジェクト一覧取得
2. `GET /api/progress-dashboard/stats` - 統計サマリー取得
3. `GET /api/progress-dashboard/projects/:id/milestones` - マイルストーン一覧

#### Phase 3（将来）: 高度な機能
1. プロジェクトテンプレート機能
2. 施設横断比較レポート
3. 自動遅延アラート機能

---

## 2. ページ機能詳細分析

### 2.1 表示要素

ProgressDashboardページは以下の要素で構成されています：

#### 2.1.1 統計サマリー（5つのカード）
```typescript
// Line 44-52: 統計計算
const stats = {
  total: projects.length,           // 総プロジェクト数
  active: projects.filter(p => p.status === 'active').length,  // 進行中
  completed: projects.filter(p => p.status === 'completed').length,  // 完了
  delayed: projects.filter(p => p.isDelayed).length,  // 遅延
  avgProgress: Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)  // 平均進捗
};
```

**必要データ**:
- プロジェクト総数
- プロジェクトステータス（active/completed）
- 遅延フラグ（isDelayed）
- 進捗率（progress）

#### 2.1.2 フィルター機能
```typescript
// Line 18: フィルター状態管理
const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'delayed'>('all');

// Line 31-39: フィルタリングロジック
const getFilteredProjects = () => {
  if (filter === 'all') return projects;
  return projects.filter(p => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'completed') return p.status === 'completed';
    if (filter === 'delayed') return p.isDelayed;
    return true;
  });
};
```

**必要データ**:
- プロジェクトステータス
- 遅延判定ロジック（期限 vs 現在日時）

#### 2.1.3 プロジェクトカード表示
```typescript
// Line 255-310: デモデータ構造
{
  id: 'project-1',
  title: '新人教育プログラム改善プロジェクト',
  description: '新人看護師の教育体系を整備し、メンター制度を導入',
  status: 'active',                // ステータス
  progress: 65,                     // 進捗率（%）
  teamSize: 12,                     // チームサイズ
  completedMilestones: 3,           // 完了マイルストーン数
  totalMilestones: 5,               // 総マイルストーン数
  dueDate: '2025-12-31',           // 期限
  isDelayed: false,                 // 遅延フラグ
  level: 'チームプロジェクト'      // プロジェクトレベル
}
```

**必要データ**:
- プロジェクト基本情報（ID、タイトル、説明）
- ステータス管理（active/completed）
- 進捗率（0-100%）
- チームメンバー数
- マイルストーン情報（完了数/総数）
- 期限日時
- プロジェクトレベル（Team/Department/Facility）

### 2.2 データフロー

```
[ProgressDashboardPage]
       ↓
[loadProjects()] ← API呼び出し
       ↓
[GET /api/progress-dashboard/projects?viewerLevel=10&facilityId=xxx]
       ↓
[ProgressDashboardService.getAccessibleProjects()]
       ↓
[Prisma Query]
  ├─ Post（プロジェクト情報）
  ├─ ProjectMilestone（マイルストーン）
  ├─ ProjectTeamMember（チームメンバー）
  └─ User（権限チェック）
       ↓
[医療システムAPI呼び出し]
  ├─ GET /api/v2/facilities → 施設マスター
  ├─ GET /api/v2/departments → 部門マスター
  └─ GET /api/v2/employees/{id} → 職員情報
       ↓
[データ統合・加工]
  ├─ 遅延判定（dueDate < now && status != 'completed'）
  ├─ 進捗計算（completedMilestones / totalMilestones × 100）
  └─ 権限フィルタリング（Level 10+ = 自部門以上、Level 13+ = 全施設）
       ↓
[JSON Response]
```

---

## 3. データベース要件定義

### 3.1 新規テーブル要件

#### 3.1.1 ProjectMilestoneテーブル（マイルストーン管理）

**目的**: プロジェクトの中間目標を管理し、進捗を可視化

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

  // Relations
  project           Post      @relation("ProjectMilestones", fields: [projectId], references: [id], onDelete: Cascade)
  completedByUser   User?     @relation("MilestoneCompletedBy", fields: [completedBy], references: [id], onDelete: SetNull)

  @@index([projectId])
  @@index([status])
  @@index([dueDate])
  @@map("project_milestones")
}
```

**フィールド詳細**:

| フィールド名 | 型 | NULL | デフォルト | 説明 |
|------------|------|------|-----------|------|
| id | String | NO | cuid() | 主キー |
| projectId | String | NO | - | 対象プロジェクトID（Post.id） |
| title | String | NO | - | マイルストーン名 |
| description | String | YES | - | 詳細説明 |
| dueDate | DateTime | NO | - | 期限日時 |
| completedAt | DateTime | YES | - | 完了日時 |
| completedBy | String | YES | - | 完了者ID（User.id） |
| status | String | NO | pending | ステータス |
| order | Int | NO | 0 | 表示順序 |
| createdAt | DateTime | NO | now() | 作成日時 |
| updatedAt | DateTime | NO | - | 更新日時 |

**インデックス設計**:
- `projectId`: プロジェクトIDでの絞り込み（頻繁）
- `status`: ステータスフィルタリング
- `dueDate`: 期限日時でのソート・遅延判定

#### 3.1.2 ProjectTeamMemberテーブル（チームメンバー管理）

**目的**: プロジェクトに参加するメンバーを管理

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

  // Relations
  project           Post      @relation("ProjectTeamMembers", fields: [projectId], references: [id], onDelete: Cascade)
  user              User      @relation("ProjectMemberships", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([role])
  @@map("project_team_members")
}
```

**フィールド詳細**:

| フィールド名 | 型 | NULL | デフォルト | 説明 |
|------------|------|------|-----------|------|
| id | String | NO | cuid() | 主キー |
| projectId | String | NO | - | プロジェクトID（Post.id） |
| userId | String | NO | - | ユーザーID（User.id） |
| role | String | NO | member | 役割（リーダー/メンバー等） |
| joinedAt | DateTime | NO | now() | 参加日時 |
| leftAt | DateTime | YES | - | 離脱日時 |
| createdAt | DateTime | NO | now() | 作成日時 |
| updatedAt | DateTime | NO | - | 更新日時 |

**インデックス設計**:
- `projectId`: プロジェクトごとのメンバー一覧取得
- `userId`: ユーザーが参加しているプロジェクト一覧取得
- `role`: リーダー・メンバーフィルタリング
- `UNIQUE(projectId, userId)`: 重複参加防止

### 3.2 既存テーブル拡張要件

#### 3.2.1 Postテーブル拡張

**追加フィールド**:

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

  // 既存インデックス
  @@index([type, status, createdAt])  // プロジェクト一覧取得用
  @@index([projectDueDate])            // 期限ソート・遅延判定用（新規）
  @@index([projectLevel])              // レベル別フィルタリング用（新規）
}
```

**追加フィールド詳細**:

| フィールド名 | 型 | NULL | デフォルト | 説明 |
|------------|------|------|-----------|------|
| projectDueDate | DateTime | YES | - | プロジェクト期限（type='project'の場合必須） |
| projectLevel | String | YES | - | プロジェクトレベル（team/department/facility/organization） |
| projectProgress | Int | YES | 0 | 進捗率（0-100%）※マイルストーンから自動計算可能 |

**理由**:
- 既存Postテーブルに`type='project'`として保存
- プロジェクト固有のフィールド（期限、レベル、進捗）を追加
- マイルストーン/チームメンバーはリレーションで管理

#### 3.2.2 Userテーブル拡張

**追加リレーション**:

```prisma
model User {
  // ... 既存フィールド

  // ProgressDashboard統合実装（2025-10-11）
  projectMemberships      ProjectTeamMember[]   @relation("ProjectMemberships")
  completedMilestones     ProjectMilestone[]    @relation("MilestoneCompletedBy")
}
```

**理由**:
- ユーザーが参加しているプロジェクト一覧を取得可能
- マイルストーン完了履歴の追跡

### 3.3 インデックス設計

#### 3.3.1 必須インデックス

```sql
-- Post: プロジェクト一覧取得用複合インデックス
CREATE INDEX "Post_type_status_createdAt_idx"
ON "Post"("type", "status", "createdAt" DESC);

-- Post: 期限ソート用
CREATE INDEX "Post_projectDueDate_idx"
ON "Post"("project_due_date");

-- Post: プロジェクトレベルフィルタリング用
CREATE INDEX "Post_projectLevel_idx"
ON "Post"("project_level");

-- ProjectMilestone: プロジェクトID絞り込み用
CREATE INDEX "ProjectMilestone_projectId_idx"
ON "project_milestones"("project_id");

-- ProjectMilestone: ステータスフィルタリング用
CREATE INDEX "ProjectMilestone_status_idx"
ON "project_milestones"("status");

-- ProjectTeamMember: プロジェクトID絞り込み用
CREATE INDEX "ProjectTeamMember_projectId_idx"
ON "project_team_members"("project_id");

-- ProjectTeamMember: ユーザーID絞り込み用
CREATE INDEX "ProjectTeamMember_userId_idx"
ON "project_team_members"("user_id");
```

#### 3.3.2 パフォーマンス最適化インデックス

```sql
-- 遅延プロジェクト検索用複合インデックス
CREATE INDEX "Post_status_projectDueDate_idx"
ON "Post"("status", "project_due_date")
WHERE "type" = 'project' AND "status" = 'active';

-- マイルストーン期限遅延検索用
CREATE INDEX "ProjectMilestone_status_dueDate_idx"
ON "project_milestones"("status", "due_date")
WHERE "status" IN ('pending', 'in_progress');
```

---

## 4. 医療システム連携要件

### 4.1 使用する既存API

#### 4.1.1 施設マスター取得
```
GET /api/v2/facilities
```

**用途**:
- プロジェクトレベル判定（施設プロジェクトの場合）
- 施設名表示

**レスポンス例**:
```json
{
  "data": [
    {
      "id": "facility-001",
      "name": "東京第一病院",
      "code": "TKH001",
      "type": "hospital"
    }
  ]
}
```

#### 4.1.2 部門マスター取得
```
GET /api/v2/departments
```

**用途**:
- プロジェクトレベル判定（部門プロジェクトの場合）
- 部門名表示

**レスポンス例**:
```json
{
  "data": [
    {
      "id": "dept-001",
      "facilityId": "facility-001",
      "name": "看護部",
      "code": "NURS"
    }
  ]
}
```

#### 4.1.3 職員情報取得
```
GET /api/v2/employees/{employeeId}
```

**用途**:
- チームメンバー詳細情報取得
- 権限レベル確認

**レスポンス例**:
```json
{
  "data": {
    "id": "emp-001",
    "name": "山田太郎",
    "facilityId": "facility-001",
    "departmentId": "dept-001",
    "position": "部長",
    "level": 10
  }
}
```

### 4.2 新規API要件（医療システム側）

**結論**: **新規API不要**

理由:
- 既存API（facilities/departments/employees）で必要な情報取得可能
- プロジェクト管理はVoiceDrive完結

---

## 5. API設計（VoiceDrive側）

### 5.1 プロジェクト一覧取得API

#### エンドポイント
```
GET /api/progress-dashboard/projects
```

#### クエリパラメータ

| パラメータ名 | 型 | 必須 | デフォルト | 説明 |
|------------|------|------|-----------|------|
| filter | string | NO | all | フィルター（all/active/completed/delayed） |
| facilityId | string | NO | - | 施設ID（Level 10-12の場合必須） |
| departmentId | string | NO | - | 部門ID（Level 10の場合必須） |
| limit | number | NO | 20 | 取得件数 |
| offset | number | NO | 0 | オフセット |

#### レスポンス

```typescript
{
  "data": [
    {
      "id": "project-001",
      "title": "新人教育プログラム改善プロジェクト",
      "description": "新人看護師の教育体系を整備し、メンター制度を導入",
      "status": "active",
      "progress": 65,
      "teamSize": 12,
      "completedMilestones": 3,
      "totalMilestones": 5,
      "dueDate": "2025-12-31T00:00:00Z",
      "isDelayed": false,
      "level": "team",
      "createdAt": "2025-08-01T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "meta": {
    "timestamp": "2025-10-11T12:00:00Z"
  }
}
```

#### 実装ロジック

```typescript
async getAccessibleProjects(userId: string, options: {
  filter?: 'all' | 'active' | 'completed' | 'delayed';
  facilityId?: string;
  departmentId?: string;
  limit?: number;
  offset?: number;
}) {
  // 1. ユーザー権限取得
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const userLevel = user.level;

  // 2. WHERE条件構築
  const where: any = { type: 'project' };

  // 2.1 ステータスフィルタリング
  if (options.filter === 'active') {
    where.status = 'active';
  } else if (options.filter === 'completed') {
    where.status = 'completed';
  }

  // 2.2 権限ベースフィルタリング
  if (userLevel < 13) {
    // Level 10-12: 自部門・自施設のみ
    if (options.facilityId) {
      where.author = {
        facilityId: options.facilityId
      };
    }
    if (options.departmentId) {
      where.author = {
        departmentId: options.departmentId
      };
    }
  }
  // Level 13+: 全施設アクセス可能（フィルタなし）

  // 3. プロジェクト取得
  const projects = await prisma.post.findMany({
    where,
    include: {
      _count: {
        select: {
          milestones: true,
          teamMembers: true
        }
      },
      milestones: {
        select: {
          id: true,
          status: true
        }
      },
      teamMembers: {
        where: { leftAt: null }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: options.offset || 0,
    take: options.limit || 20
  });

  // 4. 遅延判定・進捗計算
  const now = new Date();
  const result = projects.map(project => {
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = project.milestones.length;
    const isDelayed = project.projectDueDate < now && project.status !== 'completed';

    return {
      id: project.id,
      title: project.title,
      description: project.content,
      status: project.status,
      progress: totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : project.projectProgress || 0,
      teamSize: project._count.teamMembers,
      completedMilestones,
      totalMilestones,
      dueDate: project.projectDueDate,
      isDelayed,
      level: project.projectLevel,
      createdAt: project.createdAt
    };
  });

  // 5. 遅延フィルタリング（必要な場合）
  if (options.filter === 'delayed') {
    return result.filter(p => p.isDelayed);
  }

  return result;
}
```

### 5.2 統計サマリー取得API

#### エンドポイント
```
GET /api/progress-dashboard/stats
```

#### クエリパラメータ

| パラメータ名 | 型 | 必須 | デフォルト | 説明 |
|------------|------|------|-----------|------|
| facilityId | string | NO | - | 施設ID |
| departmentId | string | NO | - | 部門ID |

#### レスポンス

```typescript
{
  "data": {
    "total": 25,
    "active": 15,
    "completed": 8,
    "delayed": 2,
    "avgProgress": 62
  },
  "meta": {
    "timestamp": "2025-10-11T12:00:00Z"
  }
}
```

#### 実装ロジック

```typescript
async getProjectStats(userId: string, options: {
  facilityId?: string;
  departmentId?: string;
}) {
  // WHERE条件は getAccessibleProjects と同じロジック
  const where = buildWhereCondition(userId, options);

  // 並列クエリで高速化
  const [total, active, completed, allProjects] = await Promise.all([
    prisma.post.count({ where: { ...where, type: 'project' } }),
    prisma.post.count({ where: { ...where, type: 'project', status: 'active' } }),
    prisma.post.count({ where: { ...where, type: 'project', status: 'completed' } }),
    prisma.post.findMany({
      where: { ...where, type: 'project' },
      include: {
        milestones: {
          select: { status: true }
        }
      }
    })
  ]);

  // 遅延判定
  const now = new Date();
  const delayed = allProjects.filter(p =>
    p.projectDueDate && p.projectDueDate < now && p.status !== 'completed'
  ).length;

  // 平均進捗計算
  const avgProgress = allProjects.length > 0
    ? Math.round(
        allProjects.reduce((sum, p) => {
          const completed = p.milestones.filter(m => m.status === 'completed').length;
          const total = p.milestones.length;
          return sum + (total > 0 ? (completed / total) * 100 : p.projectProgress || 0);
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
```

### 5.3 マイルストーン一覧取得API

#### エンドポイント
```
GET /api/progress-dashboard/projects/:projectId/milestones
```

#### レスポンス

```typescript
{
  "data": [
    {
      "id": "milestone-001",
      "title": "要件定義完了",
      "description": "プロジェクト要件を確定",
      "dueDate": "2025-09-30T00:00:00Z",
      "completedAt": "2025-09-25T14:30:00Z",
      "completedBy": {
        "id": "user-001",
        "name": "山田太郎"
      },
      "status": "completed",
      "order": 1
    }
  ],
  "meta": {
    "timestamp": "2025-10-11T12:00:00Z"
  }
}
```

---

## 6. ビジネスロジック詳細

### 6.1 遅延判定ロジック

```typescript
function isProjectDelayed(project: {
  dueDate: Date;
  status: string;
}): boolean {
  const now = new Date();

  // 完了済みプロジェクトは遅延なし
  if (project.status === 'completed') {
    return false;
  }

  // 期限超過判定
  return project.dueDate < now;
}
```

### 6.2 進捗率計算ロジック

```typescript
function calculateProjectProgress(project: {
  milestones: { status: string }[];
  projectProgress?: number;
}): number {
  const totalMilestones = project.milestones.length;

  // マイルストーンがある場合: マイルストーン完了率
  if (totalMilestones > 0) {
    const completedMilestones = project.milestones.filter(
      m => m.status === 'completed'
    ).length;
    return Math.round((completedMilestones / totalMilestones) * 100);
  }

  // マイルストーンがない場合: 手動設定値
  return project.projectProgress || 0;
}
```

### 6.3 権限ベースフィルタリング

```typescript
function buildAccessFilter(user: {
  id: string;
  level: number;
  facilityId: string;
  departmentId: string;
}, options: {
  facilityId?: string;
  departmentId?: string;
}) {
  const filter: any = {};

  if (user.level >= 13) {
    // Level 13+ (理事会メンバー): 全施設アクセス可能
    if (options.facilityId) {
      filter.facilityId = options.facilityId;
    }
    if (options.departmentId) {
      filter.departmentId = options.departmentId;
    }
  } else if (user.level >= 10) {
    // Level 10-12 (部長・施設長): 自施設のみ
    filter.facilityId = user.facilityId;

    if (user.level === 10) {
      // Level 10 (部長): 自部門のみ
      filter.departmentId = user.departmentId;
    }
  } else {
    // Level 1-9: アクセス不可（エラー）
    throw new Error('Insufficient permissions');
  }

  return filter;
}
```

---

## 7. セキュリティ・権限要件

### 7.1 アクセス制御

| ユーザーレベル | アクセス範囲 | 制限事項 |
|--------------|------------|---------|
| Level 18 (理事長) | 全施設・全部門 | なし |
| Level 13-17 (理事) | 全施設・全部門 | なし |
| Level 12 (施設長) | 自施設全体 | 他施設のプロジェクト閲覧不可 |
| Level 11 (副施設長) | 自施設全体 | 他施設のプロジェクト閲覧不可 |
| Level 10 (部長) | 自部門のみ | 他部門のプロジェクト閲覧不可 |
| Level 1-9 | アクセス不可 | ページ表示不可 |

### 7.2 データ保護

```typescript
// API認証ミドルウェア
async function requireLevel10Plus(request: Request) {
  const user = await authenticateUser(request);

  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (user.level < 10) {
    throw new ForbiddenError('Level 10+ required for ProgressDashboard');
  }

  return user;
}
```

---

## 8. パフォーマンス要件

### 8.1 目標パフォーマンス

| 操作 | 目標レスポンスタイム | 備考 |
|------|-------------------|------|
| プロジェクト一覧取得 | < 500ms | 20件取得時 |
| 統計サマリー取得 | < 300ms | 5つの統計値 |
| マイルストーン取得 | < 200ms | 1プロジェクトあたり |
| フィルタリング | < 100ms | クライアント側処理 |

### 8.2 最適化戦略

#### 8.2.1 データベースクエリ最適化

```typescript
// ❌ BAD: N+1クエリ
const projects = await prisma.post.findMany({ where: { type: 'project' } });
for (const project of projects) {
  const milestones = await prisma.projectMilestone.findMany({
    where: { projectId: project.id }
  });
  // ...
}

// ✅ GOOD: includeで一括取得
const projects = await prisma.post.findMany({
  where: { type: 'project' },
  include: {
    milestones: true,
    teamMembers: { where: { leftAt: null } },
    _count: {
      select: {
        milestones: true,
        teamMembers: true
      }
    }
  }
});
```

#### 8.2.2 キャッシング戦略

```typescript
// 統計サマリーは5分間キャッシュ
const STATS_CACHE_TTL = 300; // 5 minutes

async function getProjectStatsWithCache(userId: string, options: any) {
  const cacheKey = `progress-stats:${userId}:${JSON.stringify(options)}`;

  // Redis キャッシュチェック
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // DB取得
  const stats = await getProjectStats(userId, options);

  // キャッシュ保存
  await redis.setex(cacheKey, STATS_CACHE_TTL, JSON.stringify(stats));

  return stats;
}
```

#### 8.2.3 ページネーション

```typescript
// カーソルベースページネーション（大量データ対応）
async function getProjectsWithCursor(options: {
  cursor?: string;
  limit?: number;
}) {
  const limit = options.limit || 20;

  const projects = await prisma.post.findMany({
    where: { type: 'project' },
    orderBy: { createdAt: 'desc' },
    cursor: options.cursor ? { id: options.cursor } : undefined,
    skip: options.cursor ? 1 : 0,
    take: limit + 1 // 次ページ有無判定用
  });

  const hasMore = projects.length > limit;
  const data = hasMore ? projects.slice(0, limit) : projects;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return {
    data,
    pagination: {
      nextCursor,
      hasMore
    }
  };
}
```

---

## 9. テスト要件

### 9.1 ユニットテスト

```typescript
describe('ProgressDashboard Service', () => {
  describe('遅延判定', () => {
    it('期限超過かつ未完了のプロジェクトは遅延と判定', () => {
      const project = {
        dueDate: new Date('2025-01-01'),
        status: 'active'
      };
      expect(isProjectDelayed(project)).toBe(true);
    });

    it('完了済みプロジェクトは遅延と判定しない', () => {
      const project = {
        dueDate: new Date('2025-01-01'),
        status: 'completed'
      };
      expect(isProjectDelayed(project)).toBe(false);
    });
  });

  describe('進捗率計算', () => {
    it('マイルストーン5個中3個完了の場合60%', () => {
      const project = {
        milestones: [
          { status: 'completed' },
          { status: 'completed' },
          { status: 'completed' },
          { status: 'pending' },
          { status: 'pending' }
        ]
      };
      expect(calculateProjectProgress(project)).toBe(60);
    });

    it('マイルストーンなしの場合は手動設定値を返す', () => {
      const project = {
        milestones: [],
        projectProgress: 45
      };
      expect(calculateProjectProgress(project)).toBe(45);
    });
  });

  describe('権限フィルタリング', () => {
    it('Level 10は自部門のみアクセス可能', () => {
      const user = { id: 'u1', level: 10, facilityId: 'f1', departmentId: 'd1' };
      const filter = buildAccessFilter(user, {});

      expect(filter).toEqual({
        facilityId: 'f1',
        departmentId: 'd1'
      });
    });

    it('Level 13は全施設アクセス可能', () => {
      const user = { id: 'u2', level: 13, facilityId: 'f1', departmentId: 'd1' };
      const filter = buildAccessFilter(user, {});

      expect(filter).toEqual({});
    });

    it('Level 9はエラー', () => {
      const user = { id: 'u3', level: 9, facilityId: 'f1', departmentId: 'd1' };

      expect(() => buildAccessFilter(user, {})).toThrow('Insufficient permissions');
    });
  });
});
```

### 9.2 統合テスト

```typescript
describe('ProgressDashboard API Integration', () => {
  beforeAll(async () => {
    // テストデータセットアップ
    await seedTestData();
  });

  it('GET /api/progress-dashboard/projects - 正常系', async () => {
    const response = await fetch('/api/progress-dashboard/projects?filter=all&limit=10', {
      headers: { Authorization: `Bearer ${level10Token}` }
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.data).toBeInstanceOf(Array);
    expect(data.data.length).toBeLessThanOrEqual(10);
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('hasMore');
  });

  it('GET /api/progress-dashboard/projects - 遅延フィルター', async () => {
    const response = await fetch('/api/progress-dashboard/projects?filter=delayed', {
      headers: { Authorization: `Bearer ${level10Token}` }
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // すべてのプロジェクトが遅延していることを確認
    data.data.forEach((project: any) => {
      expect(project.isDelayed).toBe(true);
    });
  });

  it('GET /api/progress-dashboard/stats - 統計取得', async () => {
    const response = await fetch('/api/progress-dashboard/stats', {
      headers: { Authorization: `Bearer ${level10Token}` }
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.data).toHaveProperty('total');
    expect(data.data).toHaveProperty('active');
    expect(data.data).toHaveProperty('completed');
    expect(data.data).toHaveProperty('delayed');
    expect(data.data).toHaveProperty('avgProgress');

    expect(data.data.avgProgress).toBeGreaterThanOrEqual(0);
    expect(data.data.avgProgress).toBeLessThanOrEqual(100);
  });

  it('Level 9ユーザーはアクセス不可', async () => {
    const response = await fetch('/api/progress-dashboard/projects', {
      headers: { Authorization: `Bearer ${level9Token}` }
    });

    expect(response.status).toBe(403);
  });
});
```

### 9.3 E2Eテスト

```typescript
describe('ProgressDashboard E2E', () => {
  it('部長がダッシュボードを閲覧できる', async () => {
    // ログイン
    await loginAs('部長', 'password');

    // ProgressDashboardページへ移動
    await page.goto('/progress-dashboard');

    // 統計カードが表示される
    await expect(page.locator('[data-testid="stat-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-active"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-delayed"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-avg-progress"]')).toBeVisible();

    // プロジェクトカードが表示される
    const projectCards = await page.locator('[data-testid^="project-card-"]').count();
    expect(projectCards).toBeGreaterThan(0);
  });

  it('フィルター切り替えが動作する', async () => {
    await page.goto('/progress-dashboard');

    // すべて表示
    await page.click('[data-testid="filter-all"]');
    const allCount = await page.locator('[data-testid^="project-card-"]').count();

    // 進行中のみ表示
    await page.click('[data-testid="filter-active"]');
    const activeCount = await page.locator('[data-testid^="project-card-"]').count();

    expect(activeCount).toBeLessThanOrEqual(allCount);

    // すべてのカードのステータスが「進行中」
    const statuses = await page.locator('[data-testid="project-status"]').allTextContents();
    statuses.forEach(status => {
      expect(status).toContain('進行中');
    });
  });
});
```

---

## 10. データ移行要件

### 10.1 既存プロジェクトデータ移行

**前提**: 既存のPost（type='project'）データが存在する場合

```sql
-- Step 1: projectDueDate, projectLevel, projectProgress を NULL許可で追加
ALTER TABLE "Post"
ADD COLUMN "project_due_date" TIMESTAMP,
ADD COLUMN "project_level" TEXT,
ADD COLUMN "project_progress" INTEGER DEFAULT 0;

-- Step 2: 既存プロジェクトにデフォルト値設定
UPDATE "Post"
SET
  "project_due_date" = "createdAt" + INTERVAL '3 months',  -- 作成日から3ヶ月後
  "project_level" = 'team',                                  -- デフォルト: チームプロジェクト
  "project_progress" = 0                                     -- デフォルト: 0%
WHERE "type" = 'project'
  AND "project_due_date" IS NULL;

-- Step 3: インデックス作成
CREATE INDEX "Post_projectDueDate_idx" ON "Post"("project_due_date");
CREATE INDEX "Post_projectLevel_idx" ON "Post"("project_level");
```

### 10.2 新規テーブル作成

```sql
-- ProjectMilestoneテーブル作成
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

  CONSTRAINT "fk_project" FOREIGN KEY ("project_id") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_completed_by" FOREIGN KEY ("completed_by") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "ProjectMilestone_projectId_idx" ON "project_milestones"("project_id");
CREATE INDEX "ProjectMilestone_status_idx" ON "project_milestones"("status");
CREATE INDEX "ProjectMilestone_dueDate_idx" ON "project_milestones"("due_date");

-- ProjectTeamMemberテーブル作成
CREATE TABLE "project_team_members" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joined_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "left_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "fk_project" FOREIGN KEY ("project_id") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_project_user" UNIQUE ("project_id", "user_id")
);

CREATE INDEX "ProjectTeamMember_projectId_idx" ON "project_team_members"("project_id");
CREATE INDEX "ProjectTeamMember_userId_idx" ON "project_team_members"("user_id");
CREATE INDEX "ProjectTeamMember_role_idx" ON "project_team_members"("role");
```

---

## 11. 運用・監視要件

### 11.1 ログ要件

```typescript
// プロジェクトアクセスログ
logger.info('ProgressDashboard accessed', {
  userId: user.id,
  userLevel: user.level,
  filter: options.filter,
  facilityId: options.facilityId,
  departmentId: options.departmentId,
  projectsReturned: projects.length,
  responseTime: `${Date.now() - startTime}ms`
});

// 遅延プロジェクト検出ログ
logger.warn('Delayed projects detected', {
  count: delayedProjects.length,
  projects: delayedProjects.map(p => ({
    id: p.id,
    title: p.title,
    dueDate: p.dueDate,
    daysDelayed: Math.floor((now - p.dueDate) / (1000 * 60 * 60 * 24))
  }))
});
```

### 11.2 監視メトリクス

| メトリクス名 | 種別 | 閾値 | アラート条件 |
|------------|------|------|------------|
| api.progress_dashboard.response_time | Gauge | 500ms | > 1000ms |
| api.progress_dashboard.error_rate | Counter | 1% | > 5% |
| projects.delayed.count | Gauge | - | > 10件 |
| projects.completed.rate | Gauge | - | < 50% |

---

## 12. エラーハンドリング

### 12.1 想定エラーケース

| エラーケース | HTTPステータス | エラーコード | ユーザーメッセージ |
|------------|--------------|------------|------------------|
| 認証なし | 401 | UNAUTHORIZED | ログインが必要です |
| Level 9以下 | 403 | FORBIDDEN | このページは部長以上のみアクセス可能です |
| プロジェクト不存在 | 404 | NOT_FOUND | プロジェクトが見つかりません |
| 無効なfilterパラメータ | 400 | INVALID_PARAMETER | フィルターパラメータが不正です |
| DB接続エラー | 500 | DATABASE_ERROR | データベースエラーが発生しました |

### 12.2 エラーレスポンス形式

```typescript
{
  "error": {
    "code": "FORBIDDEN",
    "message": "このページは部長以上のみアクセス可能です",
    "details": "User level: 9, Required level: 10+",
    "timestamp": "2025-10-11T12:00:00Z"
  }
}
```

---

## 13. まとめ

### 13.1 実装要件サマリー

| カテゴリ | 要件 | 優先度 |
|---------|------|-------|
| 新規テーブル | ProjectMilestone | 高 |
| 新規テーブル | ProjectTeamMember | 高 |
| Postテーブル拡張 | projectDueDate, projectLevel, projectProgress | 高 |
| 複合インデックス | Post(type, status, createdAt) | 高 |
| API実装 | GET /api/progress-dashboard/projects | 高 |
| API実装 | GET /api/progress-dashboard/stats | 高 |
| API実装 | GET /api/progress-dashboard/projects/:id/milestones | 中 |
| 医療システムAPI | 既存APIのみ使用（新規不要） | - |

### 13.2 医療システム側の対応

**結論**: **追加実装不要**

理由:
- 既存API（facilities/departments/employees）で必要な情報取得可能
- プロジェクト管理データはすべてVoiceDrive側で管理

### 13.3 推定工数

| フェーズ | 作業内容 | 工数 |
|---------|---------|------|
| Phase 1 | スキーマ設計・マイグレーション作成 | 1日 |
| Phase 2 | テーブル作成・インデックス追加 | 0.5日 |
| Phase 3 | Service層実装 | 2日 |
| Phase 4 | API実装 | 1.5日 |
| Phase 5 | フロントエンド実装 | 2日 |
| Phase 6 | テスト実装・実行 | 1.5日 |
| Phase 7 | レビュー・修正 | 0.5日 |
| **合計** | | **9日** |

---

## 14. 次のアクション

### 14.1 VoiceDriveチーム

1. ✅ DB要件分析書レビュー
2. ⏳ schema.prisma更新（ProjectMilestone/ProjectTeamMember追加）
3. ⏳ マイグレーションファイル作成
4. ⏳ Service層実装開始
5. ⏳ API実装・テスト

### 14.2 医療システムチーム

1. ✅ **対応不要**（確認のみ）
2. ℹ️ 既存API（facilities/departments/employees）の継続提供

---

**承認状態**: レビュー待ち
**次回更新予定**: 2025年10月12日

**添付ファイル**:
- なし

**関連ドキュメント**:
- `progress-dashboard暫定マスターリスト_20251011.md`（次に作成）
- `共通DB構築後_作業再開指示書_20250928.md`

---

**作成者**: Claude Code
**レビュアー**: VoiceDriveチームリード
**承認者**: プロジェクトマネージャー
