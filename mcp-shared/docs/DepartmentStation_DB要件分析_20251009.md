# DepartmentStation DB要件分析報告書

**作成日**: 2025年10月9日
**対象ページ**: DepartmentStationPage (src/pages/DepartmentStationPage.tsx)
**優先度**: HIGH (Group 1: Core Pages)
**総行数**: 291行

---

## 📋 エグゼクティブサマリー

### 分析結果概要

DepartmentStationPageは、部門単位の活動状況を可視化する重要な管理ページですが、**現在は100%デモデータで動作しており、実データ統合が未実装**です。PersonalStationやDashboardと異なり、**医療職員管理システムとの新規API連携および部門統計集計機能の実装が必要**です。

### 🔴 重大な発見事項

1. **医療システムAPI連携が未実装**
   - 部門メンバー一覧の取得APIが不在
   - 部門統計データの取得APIが不在
   - リアルタイム部門情報の同期が不可能

2. **VoiceDrive内部の部門関連集計が未実装**
   - 部門別投稿数の集計機能なし
   - 部門別プロジェクト統計なし
   - 部門メンバーのアクティビティ集計なし

3. **データソースが100%デモデータ**
   - `src/data/demo/posts.ts` - デモ投稿データ
   - `src/data/demo/projects.ts` - デモプロジェクトデータ
   - `src/data/demo/users.ts` - デモユーザーデータ

### 📊 実装規模見積もり

| カテゴリ | 規模 | 備考 |
|---------|------|------|
| **医療システムAPI** | 2個 (新規) | API-3, API-4 |
| **VoiceDriveサービス** | 2個 (新規) | DepartmentStatsService, DepartmentPostService |
| **データベーステーブル** | 0個 (既存で対応可能) | User, Project, VoteHistoryで対応 |
| **実装コード量** | ~600行 | サービス層400行 + ページ修正200行 |
| **PersonalStation再利用率** | 30% | UserActivityService一部再利用可能 |

---

## 🎯 ページ機能概要

DepartmentStationPageは以下の5つのタブで構成されています：

### 1. 部門概要 (dept_overview)
**表示内容**:
- 総メンバー数
- アクティブプロジェクト数
- 今月の投稿数
- 最新プロジェクト3件（タイトル、説明、メンバー数、ステータス）

### 2. 部門メンバー (dept_members)
**表示内容**:
- メンバーカード一覧（アバター、氏名、職位、権限レベル、所属、施設）

### 3. 部門投稿 (dept_posts)
**表示内容**:
- 部門メンバーが投稿した全投稿
- EnhancedPostコンポーネントで表示

### 4. 部門プロジェクト (dept_projects)
**表示内容**:
- 部門のプロジェクト一覧
- プロジェクト詳細（タイトル、説明、ステータス、進捗、メンバー数、予算、期限）

### 5. 部門分析 (dept_analytics)
**表示内容**:
- 活動統計（今月の投稿数、アクティブメンバー、完了プロジェクト）
- 権限レベル分布（レベル1〜5の割合）

---

## 🔍 詳細コード分析

### セクション1: 部門情報取得（19-40行目）

#### 現在の実装
```typescript
const userDepartment = user?.department;
const safeDepartment = userDepartment || '未設定部門';

// 部門メンバーを取得（徹底的安全チェック）
const deptMembers = (demoUsers && Array.isArray(demoUsers) && userDepartment)
  ? demoUsers.filter(u => u?.department === userDepartment)
  : [];

// 部門の投稿（徹底的安全チェック）
const deptPosts = (posts && Array.isArray(posts) && demoUsers && Array.isArray(demoUsers) && userDepartment)
  ? posts.filter(post => {
      if (!post?.authorId) return false;
      const author = demoUsers.find(u => u?.id === post.authorId);
      return author?.department === userDepartment;
    })
  : [];

// 部門のプロジェクト（徹底的安全チェック）
const deptProjects = (projects && Array.isArray(projects) && userDepartment)
  ? projects.filter(project => project?.department === userDepartment)
  : [];
```

#### 問題点
🔴 **致命的**: すべてデモデータ（`demoUsers`, `posts`, `projects`）を参照
🔴 **致命的**: フィルタリングがクライアントサイドで実行（大量データで性能問題）
🟡 **改善必要**: 部門コード標準化が不明確（`user.department`の値が医療システムと一致するか不明）

#### 必要な対応

##### A. 医療システムAPI
**API-3: 部門メンバー一覧取得**
- **エンドポイント**: `GET /employees/department/{departmentCode}`
- **認証**: JWT Bearer Token
- **レスポンス**:
```typescript
interface DepartmentMemberResponse {
  departmentCode: string;
  departmentName: string;
  members: Array<{
    employeeId: string;
    name: string;
    position: string;
    accountType: string;
    permissionLevel: number;
    facilityId: string;
    experienceYears?: number;
    isActive: boolean;
  }>;
  totalMembers: number;
  activeMembers: number;
  lastUpdated: string; // ISO8601
}
```

**API-4: 部門統計情報取得**
- **エンドポイント**: `GET /departments/{departmentCode}/statistics`
- **認証**: JWT Bearer Token
- **レスポンス**:
```typescript
interface DepartmentStatisticsResponse {
  departmentCode: string;
  departmentName: string;
  totalMembers: number;
  activeMembers: number;
  permissionLevelDistribution: {
    level: number;
    count: number;
    percentage: number;
  }[];
  averageExperienceYears: number;
  staffTurnoverRate: number; // 離職率
  lastCalculated: string; // ISO8601
}
```

##### B. VoiceDriveサービス層実装

**新規サービス: DepartmentStatsService.ts**
```typescript
// 部門別投稿統計
export async function getDepartmentPostStats(
  departmentCode: string,
  timeRange: 'thisMonth' | 'lastMonth' | 'last3Months' = 'thisMonth'
): Promise<{
  totalPosts: number;
  byCategory: { category: string; count: number }[];
  byType: { type: string; count: number }[];
  avgVotesPerPost: number;
}>;

// 部門別プロジェクト統計
export async function getDepartmentProjectStats(
  departmentCode: string
): Promise<{
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  byStatus: { status: string; count: number }[];
  totalBudget: number;
  avgCompletionRate: number;
}>;

// 部門メンバーアクティビティ統計
export async function getDepartmentActivityStats(
  departmentCode: string
): Promise<{
  totalVotes: number;
  totalPosts: number;
  totalFeedbacks: number;
  activeMembers: number;
  inactiveMembers: number;
  avgImpactScore: number;
}>;
```

**新規サービス: DepartmentPostService.ts**
```typescript
// 部門投稿一覧取得（ページネーション対応）
export async function getDepartmentPosts(
  departmentCode: string,
  options?: {
    limit?: number;
    offset?: number;
    category?: string;
    sortBy?: 'newest' | 'mostVoted' | 'mostDiscussed';
  }
): Promise<{
  posts: Post[];
  total: number;
  hasMore: boolean;
}>;

// 部門プロジェクト一覧取得
export async function getDepartmentProjects(
  departmentCode: string,
  statusFilter?: 'all' | 'active' | 'completed' | 'planning'
): Promise<Project[]>;
```

---

### セクション2: 部門概要タブ（50-97行目）

#### 現在の実装
```typescript
const renderDeptOverview = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* 部門統計 */}
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">部門統計</h3>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{deptMembers?.length || 0}</div>
          <div className="text-sm text-gray-500">総メンバー数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {deptProjects?.filter(p => p.status === 'active').length || 0}
          </div>
          <div className="text-sm text-gray-500">アクティブプロジェクト</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{deptPosts?.length || 0}</div>
          <div className="text-sm text-gray-400">今月の投稿数</div>
        </div>
      </div>
    </div>
    {/* 最新のプロジェクト */}
    {/* ... */}
  </div>
);
```

#### データソース分析

| 表示項目 | 現在のソース | 必要な実装 |
|---------|------------|-----------|
| 総メンバー数 | `deptMembers.length` (デモ) | API-3 または API-4 |
| アクティブプロジェクト | `deptProjects.filter()` (デモ) | DepartmentProjectStats |
| 今月の投稿数 | `deptPosts.length` (デモ) | DepartmentPostStats |
| 最新プロジェクト3件 | `deptProjects.slice(0,3)` (デモ) | getDepartmentProjects() |

#### 必要な修正
```typescript
// Phase 1実装例（11月7-8日）
const [deptStats, setDeptStats] = useState<DepartmentStatistics | null>(null);
const [projectStats, setProjectStats] = useState<DepartmentProjectStats | null>(null);
const [postStats, setPostStats] = useState<DepartmentPostStats | null>(null);

useEffect(() => {
  if (!userDepartment) return;

  const fetchDepartmentData = async () => {
    try {
      // API-4で部門統計取得
      const stats = await medicalSystemAPI.getDepartmentStatistics(userDepartment);
      setDeptStats(stats);

      // VoiceDrive内部で集計
      const projStats = await getDepartmentProjectStats(userDepartment);
      setProjectStats(projStats);

      const postStats = await getDepartmentPostStats(userDepartment, 'thisMonth');
      setPostStats(postStats);
    } catch (error) {
      console.error('Failed to fetch department data:', error);
    }
  };

  fetchDepartmentData();
}, [userDepartment]);
```

---

### セクション3: 部門メンバータブ（99-131行目）

#### 現在の実装
```typescript
const renderDeptMembers = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {deptMembers?.map(member => (
      <div key={member?.id || Math.random()} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={member?.avatar || '/default-avatar.png'}
            alt={member?.name || 'ユーザー'}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-white">{member?.name || 'Unknown User'}</h3>
            <p className="text-sm text-gray-300">{member?.position || '職位未設定'}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">権限レベル:</span>
            <span className="font-medium text-gray-200">レベル {member?.permissionLevel || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">所属:</span>
            <span className="font-medium text-gray-200">{member?.department || '未設定'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">施設:</span>
            <span className="font-medium text-gray-200">{member?.facility || '未設定'}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);
```

#### データソース分析

| 表示項目 | 現在のソース | 必要な実装 |
|---------|------------|-----------|
| メンバー一覧 | `demoUsers.filter()` | API-3 getDepartmentMembers |
| アバター | `member.avatar` (デモ) | VoiceDrive User.avatar (既存) |
| 氏名 | `member.name` (デモ) | API-3 または User.name |
| 職位 | `member.position` (デモ) | API-3 position |
| 権限レベル | `member.permissionLevel` (デモ) | API-3 permissionLevel |
| 所属部門 | `member.department` (デモ) | API-3 departmentCode |
| 施設 | `member.facility` (デモ) | API-3 facilityId |

#### 必要な修正

**医療システムAPI-3実装確認事項**:
1. `avatar`フィールドは含まれるか？
   - ❌ 含まれない場合 → VoiceDrive User.avatarから取得
   - ✅ 含まれる場合 → API-3レスポンスをそのまま使用

2. `departmentCode` vs `departmentName`の区別
   - API-3は両方返すべき（表示用に`departmentName`必要）

**実装例**:
```typescript
const [deptMembers, setDeptMembers] = useState<DepartmentMember[]>([]);

useEffect(() => {
  const fetchMembers = async () => {
    if (!userDepartment) return;

    try {
      const response = await medicalSystemAPI.getDepartmentMembers(userDepartment);

      // avatarはVoiceDrive Userから補完
      const membersWithAvatars = await Promise.all(
        response.members.map(async (member) => {
          const userProfile = await prisma.user.findUnique({
            where: { employeeId: member.employeeId },
            select: { avatar: true }
          });
          return {
            ...member,
            avatar: userProfile?.avatar || '/default-avatar.png'
          };
        })
      );

      setDeptMembers(membersWithAvatars);
    } catch (error) {
      console.error('Failed to fetch department members:', error);
    }
  };

  fetchMembers();
}, [userDepartment]);
```

---

### セクション4: 部門投稿タブ（133-147行目）

#### 現在の実装
```typescript
const renderDeptPosts = () => (
  <div className="space-y-4">
    {deptPosts.length === 0 ? (
      <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur border border-gray-700/50 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">部門投稿がありません</h3>
        <p className="text-gray-400">部門メンバーの投稿がここに表示されます。</p>
      </div>
    ) : (
      deptPosts?.map(post => (
        <EnhancedPost key={post?.id || Math.random()} post={post} />
      ))
    )}
  </div>
);
```

#### データソース分析

| 表示項目 | 現在のソース | 必要な実装 | テーブル |
|---------|------------|-----------|---------|
| 部門投稿一覧 | `posts.filter()` (デモ) | getDepartmentPosts() | Post (未実装?) |

#### 🔴 重大な問題: Postテーブルが存在しない

**現状確認**:
- `prisma/schema.prisma`を確認したところ、**Postモデルが定義されていない**
- EnhancedPostコンポーネントは存在するが、実データがない

**必要な対応**:

##### Option A: Postテーブル新規作成（推奨）
```prisma
model Post {
  id              String    @id @default(cuid())
  authorId        String
  authorName      String?   // 医療システムから取得した氏名をキャッシュ
  content         String
  category        String    // 改善提案, 質問相談, etc.
  type            String    // personal, department, organization
  visibility      String    // private, department, facility, organization
  department      String?
  facilityId      String?
  status          String    @default("active") // active, archived, deleted
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  voteHistory     VoteHistory[]

  @@index([authorId])
  @@index([department])
  @@index([facilityId])
  @@index([category])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}
```

##### Option B: 既存テーブル再利用検討
- Feedbackテーブル: ❌ 用途が異なる（1対1フィードバック）
- Projectテーブル: ❌ プロジェクト専用
- Surveyテーブル: ❌ アンケート専用

**結論**: 🔴 **Postテーブル新規作成が必須**

---

### セクション5: 部門プロジェクトタブ（149-184行目）

#### 現在の実装
```typescript
const renderDeptProjects = () => (
  <div className="space-y-4">
    {deptProjects.length === 0 ? (
      <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur border border-gray-700/50 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">部門プロジェクトがありません</h3>
        <p className="text-gray-400">部門のプロジェクトがここに表示されます。</p>
      </div>
    ) : (
      deptProjects?.map(project => (
        <div key={project?.id || Math.random()} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          {/* ... プロジェクト詳細表示 ... */}
        </div>
      ))
    )}
  </div>
);
```

#### データソース分析

| 表示項目 | 現在のソース | 必要な実装 | テーブル |
|---------|------------|-----------|---------|
| プロジェクト一覧 | `projects.filter()` (デモ) | getDepartmentProjects() | Project (✅ 既存) |
| タイトル | `project.title` (デモ) | Project.title | Project |
| 説明 | `project.description` (デモ) | Project.description | Project |
| ステータス | `project.status` (デモ) | Project.status | Project |
| メンバー数 | `project.members.length` (デモ) | ❌ Project.membersなし | - |
| 予算 | `project.budget` (デモ) | Project.budget | Project |
| 期限 | `project.deadline` (デモ) | ❌ Project.deadlineなし | - |

#### 🟡 Projectスキーマの不足フィールド

**現在のProjectスキーマ**（prisma/schema.prisma 157-183行目）:
```prisma
model Project {
  id               String    @id @default(cuid())
  title            String
  description      String
  category         String
  proposerId       String
  objectives       Json
  expectedOutcomes Json
  budget           Float?
  timeline         Json?     // ⚠️ Jsonで保存
  status           String    @default("proposed")
  // ... その他フィールド
}
```

**問題点**:
- `members` フィールドがない（メンバー数が取得不可）
- `deadline` フィールドがない（期限が取得不可）
- `timeline` がJson型（デモデータでは `project.deadline` として使用）

**必要な対応**:

##### Option 1: Jsonから値を抽出（暫定対応）
```typescript
const getProjectDeadline = (project: Project): string | null => {
  if (project.timeline && typeof project.timeline === 'object') {
    return (project.timeline as any).deadline || null;
  }
  return null;
};

const getProjectMemberCount = (project: Project): number => {
  if (project.timeline && typeof project.timeline === 'object') {
    return (project.timeline as any).members?.length || 0;
  }
  return 0;
};
```

##### Option 2: スキーマ拡張（推奨）
```prisma
model Project {
  // ... 既存フィールド
  deadline         DateTime?  // 🆕 NEW
  members          Json?      // 🆕 NEW: メンバー情報のJSON配列
  // または
  projectMembers   ProjectMember[] // 🆕 NEW: リレーション
}

model ProjectMember {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  role        String?
  joinedAt    DateTime @default(now())

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}
```

---

### セクション6: 部門分析タブ（186-232行目）

#### 現在の実装
```typescript
const renderDeptAnalytics = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">活動統計</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">今月の投稿数</span>
          <span className="text-lg font-semibold text-blue-600">{deptPosts?.length || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">アクティブメンバー</span>
          <span className="text-lg font-semibold text-green-600">
            {deptMembers?.filter(m => m?.permissionLevel >= 1).length || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">完了プロジェクト</span>
          <span className="text-lg font-semibold text-purple-400">
            {deptProjects?.filter(p => p.status === 'completed').length || 0}
          </span>
        </div>
      </div>
    </div>

    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">権限レベル分布</h3>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(level => {
          const count = deptMembers?.filter(m => m?.permissionLevel === level).length || 0;
          const percentage = count > 0 && deptMembers?.length ? (count / deptMembers.length) * 100 : 0;
          return (
            <div key={level} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300 w-16">レベル{level}</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
```

#### データソース分析

| 表示項目 | 現在のソース | 必要な実装 |
|---------|------------|-----------|
| 今月の投稿数 | `deptPosts.length` (デモ) | getDepartmentPostStats() |
| アクティブメンバー | `deptMembers.filter()` (デモ) | API-4 activeMembers |
| 完了プロジェクト | `deptProjects.filter()` (デモ) | getDepartmentProjectStats() |
| 権限レベル分布 | `deptMembers.filter()` (デモ) | API-4 permissionLevelDistribution |

#### 必要な修正

```typescript
// Phase 1実装（11月7-8日）
const renderDeptAnalytics = () => {
  if (!deptStats || !projectStats || !postStats) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 活動統計 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">活動統計</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">今月の投稿数</span>
            <span className="text-lg font-semibold text-blue-600">{postStats.totalPosts}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">アクティブメンバー</span>
            <span className="text-lg font-semibold text-green-600">{deptStats.activeMembers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">完了プロジェクト</span>
            <span className="text-lg font-semibold text-purple-400">{projectStats.completedProjects}</span>
          </div>
        </div>
      </div>

      {/* 権限レベル分布 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">権限レベル分布</h3>
        <div className="space-y-3">
          {deptStats.permissionLevelDistribution.map(levelData => (
            <div key={levelData.level} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300 w-16">レベル{levelData.level}</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: `${levelData.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8">{levelData.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 医療システムAPI要求一覧

### API-3: 部門メンバー一覧取得

**基本情報**:
- **エンドポイント**: `GET /employees/department/{departmentCode}`
- **メソッド**: GET
- **認証**: JWT Bearer Token
- **実装優先度**: 🔴 **CRITICAL** (Phase 1)
- **実装予定日**: 2025年11月7日〜8日

**リクエストパラメータ**:
```typescript
// Path parameter
departmentCode: string  // 例: "medical_care_ward", "nursing_dept"

// Query parameters (optional)
activeOnly?: boolean    // trueの場合、退職者を除外（デフォルト: true）
```

**レスポンススキーマ**:
```typescript
interface DepartmentMemberResponse {
  departmentCode: string;
  departmentName: string;
  members: Array<{
    employeeId: string;
    name: string;
    position: string;           // 職位名（例: "看護師", "主任"）
    accountType: string;        // NEW_STAFF, CHIEF, MANAGER, etc.
    permissionLevel: number;    // 1.0 ~ 18.0
    facilityId: string;
    facilityName?: string;
    experienceYears?: number;
    isActive: boolean;          // 勤務中かどうか
  }>;
  totalMembers: number;
  activeMembers: number;
  lastUpdated: string;          // ISO8601形式
}
```

**エラーハンドリング**:
- `404 Not Found`: 部門コードが存在しない
- `401 Unauthorized`: JWT認証失敗
- `403 Forbidden`: 部門情報閲覧権限なし

**使用箇所**:
- DepartmentStationPage: 部門メンバータブ（99-131行目）
- DepartmentStationPage: 部門概要タブ - 総メンバー数（50-71行目）

---

### API-4: 部門統計情報取得

**基本情報**:
- **エンドポイント**: `GET /departments/{departmentCode}/statistics`
- **メソッド**: GET
- **認証**: JWT Bearer Token
- **実装優先度**: 🟡 **HIGH** (Phase 1)
- **実装予定日**: 2025年11月7日〜8日

**リクエストパラメータ**:
```typescript
// Path parameter
departmentCode: string

// Query parameters (optional)
includeHistorical?: boolean  // 過去の統計も含めるか（デフォルト: false）
```

**レスポンススキーマ**:
```typescript
interface DepartmentStatisticsResponse {
  departmentCode: string;
  departmentName: string;
  totalMembers: number;
  activeMembers: number;
  retiredMembers?: number;
  permissionLevelDistribution: {
    level: number;              // 1, 2, 3, ... 18
    count: number;
    percentage: number;         // 0 ~ 100
  }[];
  averageExperienceYears: number;
  experienceDistribution?: {
    range: string;              // "0-2年", "3-5年", etc.
    count: number;
  }[];
  staffTurnoverRate?: number;   // 離職率（年換算）
  lastCalculated: string;       // ISO8601形式
}
```

**計算ロジック**:
```typescript
// 権限レベル分布
permissionLevelDistribution = groupBy(members, 'permissionLevel').map(group => ({
  level: group.key,
  count: group.length,
  percentage: (group.length / totalMembers) * 100
}));

// 平均経験年数
averageExperienceYears = sum(members.map(m => m.experienceYears)) / totalMembers;
```

**使用箇所**:
- DepartmentStationPage: 部門概要タブ - 総メンバー数（57行目）
- DepartmentStationPage: 部門分析タブ - アクティブメンバー数（197行目）
- DepartmentStationPage: 部門分析タブ - 権限レベル分布（213-229行目）

---

## 🗄️ VoiceDriveデータベース要求

### テーブル追加要求

#### 1. Postテーブル（🔴 新規作成必須）

**理由**: 部門投稿機能の実装に必須。現在デモデータのみで動作。

**スキーマ定義**:
```prisma
model Post {
  id              String    @id @default(cuid())
  authorId        String
  authorName      String?   // キャッシュ用（医療システムから取得）
  content         String    @db.Text
  category        String    // 改善提案, 質問相談, お知らせ, その他
  type            String    // personal, department, organization
  visibility      String    // private, department, facility, organization
  department      String?
  facilityId      String?
  tags            Json?     // タグ配列
  attachments     Json?     // 添付ファイル情報
  status          String    @default("active") // active, archived, deleted, flagged
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // リレーション
  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  voteHistory     VoteHistory[]

  // インデックス
  @@index([authorId])
  @@index([department])
  @@index([facilityId])
  @@index([category])
  @@index([type])
  @@index([visibility])
  @@index([status])
  @@index([createdAt])
}
```

**影響範囲**:
- VoteHistoryテーブル: `postId`の外部キー制約が必要
- Userテーブル: `posts Post[]` リレーション追加

**マイグレーション計画**:
```bash
# Phase 1: 11月7-8日
npx prisma migrate dev --name add_post_model
```

---

#### 2. ProjectMemberテーブル（🟡 推奨）

**理由**: プロジェクトメンバー管理の正規化。現在はJson型で保存されており、集計が困難。

**スキーマ定義**:
```prisma
model ProjectMember {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  role        String?  // プロジェクトリーダー, メンバー, アドバイザー, etc.
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  isActive    Boolean  @default(true)
  contribution Float   @default(0)  // 貢献度（0-100）

  // リレーション
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // インデックス
  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([isActive])
}
```

**影響範囲**:
- Projectテーブル: `members ProjectMember[]` リレーション追加
- Userテーブル: `projectMemberships ProjectMember[]` リレーション追加

**マイグレーション計画**:
```bash
# Phase 2: 11月11-15日（任意）
npx prisma migrate dev --name add_project_member_model
```

---

### 既存テーブル修正要求

#### Projectテーブル拡張（🟡 推奨）

**現在のスキーマ**（prisma/schema.prisma 157-183行目）:
```prisma
model Project {
  id               String    @id @default(cuid())
  title            String
  description      String
  category         String
  // ... 他フィールド
  timeline         Json?     // ⚠️ 暫定対応でdeadlineを含む
}
```

**提案する修正**:
```prisma
model Project {
  // ... 既存フィールド

  // 🆕 追加フィールド
  deadline         DateTime?  // プロジェクト期限
  department       String?    // 主管部門（既存：proposerから推測）

  // 🆕 リレーション追加
  members          ProjectMember[]  // プロジェクトメンバー
}
```

**メリット**:
- `project.deadline`で直接アクセス可能（Jsonパース不要）
- `project.members.length`でメンバー数を簡単に取得
- 部門フィルタリングが高速化

---

## 🔧 VoiceDriveサービス層実装要求

### 新規サービス1: DepartmentStatsService.ts

**ファイルパス**: `src/services/DepartmentStatsService.ts`
**実装優先度**: 🔴 **CRITICAL** (Phase 1)
**実装予定日**: 2025年11月7日〜8日
**推定コード量**: ~200行

**主要機能**:

#### 1. 部門別投稿統計
```typescript
export async function getDepartmentPostStats(
  departmentCode: string,
  timeRange: 'thisMonth' | 'lastMonth' | 'last3Months' = 'thisMonth'
): Promise<DepartmentPostStats> {
  const { startDate, endDate } = getTimeRange(timeRange);

  const totalPosts = await prisma.post.count({
    where: {
      department: departmentCode,
      createdAt: { gte: startDate, lte: endDate },
      status: 'active'
    }
  });

  const byCategory = await prisma.post.groupBy({
    by: ['category'],
    where: {
      department: departmentCode,
      createdAt: { gte: startDate, lte: endDate },
      status: 'active'
    },
    _count: { id: true }
  });

  const avgVotesPerPost = await prisma.voteHistory.groupBy({
    by: ['postId'],
    where: {
      post: { department: departmentCode },
      votedAt: { gte: startDate, lte: endDate }
    },
    _avg: { voteWeight: true }
  });

  return {
    totalPosts,
    byCategory: byCategory.map(c => ({ category: c.category, count: c._count.id })),
    byType: [], // 同様のロジック
    avgVotesPerPost: avgVotesPerPost._avg.voteWeight || 0
  };
}

interface DepartmentPostStats {
  totalPosts: number;
  byCategory: { category: string; count: number }[];
  byType: { type: string; count: number }[];
  avgVotesPerPost: number;
}
```

#### 2. 部門別プロジェクト統計
```typescript
export async function getDepartmentProjectStats(
  departmentCode: string
): Promise<DepartmentProjectStats> {
  const projects = await prisma.project.findMany({
    where: { department: departmentCode },
    include: { members: true }
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const byStatus = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const avgCompletionRate = projects
    .filter(p => p.progressRate !== null)
    .reduce((sum, p) => sum + p.progressRate, 0) / totalProjects || 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    byStatus,
    totalBudget,
    avgCompletionRate
  };
}

interface DepartmentProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  byStatus: { status: string; count: number }[];
  totalBudget: number;
  avgCompletionRate: number;
}
```

#### 3. 部門メンバーアクティビティ統計
```typescript
export async function getDepartmentActivityStats(
  departmentCode: string
): Promise<DepartmentActivityStats> {
  // 部門メンバーのemployeeIdリスト取得
  const members = await prisma.user.findMany({
    where: { department: departmentCode, isRetired: false },
    select: { id: true }
  });

  const memberIds = members.map(m => m.id);

  const totalVotes = await prisma.voteHistory.count({
    where: { userId: { in: memberIds } }
  });

  const totalPosts = await prisma.post.count({
    where: { authorId: { in: memberIds }, status: 'active' }
  });

  const totalFeedbacks = await prisma.feedback.count({
    where: {
      OR: [
        { senderId: { in: memberIds } },
        { receiverId: { in: memberIds } }
      ]
    }
  });

  const activitySummaries = await prisma.userActivitySummary.findMany({
    where: { userId: { in: memberIds } },
    select: { impactScore: true, totalVotes: true, totalPosts: true }
  });

  const activeMembers = activitySummaries.filter(s => s.totalVotes > 0 || s.totalPosts > 0).length;
  const inactiveMembers = members.length - activeMembers;

  const avgImpactScore = activitySummaries.reduce((sum, s) => sum + s.impactScore, 0) / members.length || 0;

  return {
    totalVotes,
    totalPosts,
    totalFeedbacks,
    activeMembers,
    inactiveMembers,
    avgImpactScore
  };
}

interface DepartmentActivityStats {
  totalVotes: number;
  totalPosts: number;
  totalFeedbacks: number;
  activeMembers: number;
  inactiveMembers: number;
  avgImpactScore: number;
}
```

**テストケース**:
```typescript
// src/services/DepartmentStatsService.test.ts
describe('DepartmentStatsService', () => {
  it('should return correct department post stats', async () => {
    const stats = await getDepartmentPostStats('medical_care_ward', 'thisMonth');
    expect(stats.totalPosts).toBeGreaterThanOrEqual(0);
    expect(stats.byCategory).toBeInstanceOf(Array);
  });

  it('should return correct department project stats', async () => {
    const stats = await getDepartmentProjectStats('medical_care_ward');
    expect(stats.activeProjects).toBeLessThanOrEqual(stats.totalProjects);
  });
});
```

---

### 新規サービス2: DepartmentPostService.ts

**ファイルパス**: `src/services/DepartmentPostService.ts`
**実装優先度**: 🔴 **CRITICAL** (Phase 1)
**実装予定日**: 2025年11月7日〜8日
**推定コード量**: ~200行

**主要機能**:

#### 1. 部門投稿一覧取得
```typescript
export async function getDepartmentPosts(
  departmentCode: string,
  options?: {
    limit?: number;
    offset?: number;
    category?: string;
    sortBy?: 'newest' | 'mostVoted' | 'mostDiscussed';
  }
): Promise<DepartmentPostsResult> {
  const { limit = 20, offset = 0, category, sortBy = 'newest' } = options || {};

  const where = {
    department: departmentCode,
    status: 'active',
    ...(category && { category })
  };

  const orderBy =
    sortBy === 'newest' ? { createdAt: 'desc' as const } :
    sortBy === 'mostVoted' ? { voteHistory: { _count: 'desc' as const } } :
    { createdAt: 'desc' as const }; // mostDiscussedは後で実装

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        author: {
          select: { name: true, avatar: true, department: true, permissionLevel: true }
        },
        voteHistory: {
          select: { voteOption: true, voteWeight: true }
        }
      }
    }),
    prisma.post.count({ where })
  ]);

  return {
    posts,
    total,
    hasMore: offset + limit < total
  };
}

interface DepartmentPostsResult {
  posts: Post[];
  total: number;
  hasMore: boolean;
}
```

#### 2. 部門プロジェクト一覧取得
```typescript
export async function getDepartmentProjects(
  departmentCode: string,
  statusFilter: 'all' | 'active' | 'completed' | 'planning' = 'all'
): Promise<Project[]> {
  const where = {
    department: departmentCode,
    ...(statusFilter !== 'all' && { status: statusFilter })
  };

  return await prisma.project.findMany({
    where,
    include: {
      members: {
        include: {
          user: {
            select: { name: true, avatar: true }
          }
        }
      },
      proposer: {
        select: { name: true, avatar: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

**エラーハンドリング**:
```typescript
try {
  const posts = await getDepartmentPosts(departmentCode);
  return posts;
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new Error('部門が見つかりません');
    }
  }
  throw new Error('部門投稿の取得に失敗しました');
}
```

---

## 📅 実装スケジュール

### Phase 1: 基本実装（2025年11月7日〜8日）

#### 医療システムチーム
- [ ] API-3実装: 部門メンバー一覧取得
- [ ] API-4実装: 部門統計情報取得
- [ ] 統合テスト実施

#### VoiceDriveチーム
- [ ] Postテーブル作成（migration）
- [ ] DepartmentStatsService.ts実装（200行）
- [ ] DepartmentPostService.ts実装（200行）
- [ ] DepartmentStationPage.tsx修正（200行）
- [ ] ユニットテスト作成
- [ ] 統合テスト実施

**Phase 1完了条件**:
- ✅ 部門メンバー一覧がAPI-3から表示される
- ✅ 部門統計がAPI-4から表示される
- ✅ 部門投稿がPostテーブルから表示される
- ✅ 部門プロジェクトがProjectテーブルから表示される

---

### Phase 2: 拡張機能（2025年11月11日〜15日）

#### 任意実装
- [ ] ProjectMemberテーブル作成
- [ ] Project.deadline フィールド追加
- [ ] ページネーション実装（部門投稿）
- [ ] フィルタリング機能（カテゴリ、ステータス）
- [ ] ソート機能（最新、人気、議論数）

**Phase 2完了条件**:
- ✅ プロジェクトメンバー数が正確に表示される
- ✅ プロジェクト期限が正確に表示される
- ✅ 部門投稿のページネーションが動作する

---

### Phase 3: パフォーマンス最適化（2025年11月18日〜22日）

#### 任意実装
- [ ] 部門統計のキャッシング（Redis）
- [ ] 部門投稿の無限スクロール実装
- [ ] 集計クエリの最適化
- [ ] インデックス追加（パフォーマンステスト後）

---

## 🚨 リスクと課題

### 🔴 Critical Issues

#### 1. Postテーブルが存在しない
**影響**: 部門投稿機能が一切動作しない
**対応**: Phase 1でPostテーブル作成必須
**期限**: 2025年11月7日

#### 2. 医療システムAPI未実装
**影響**: 部門メンバー情報と統計が取得不可
**対応**: 医療システムチームとの調整必須
**期限**: 2025年11月7日

### 🟡 High Priority Issues

#### 3. Projectスキーマの不足
**影響**: メンバー数、期限が表示できない
**暫定対応**: Json型からパースして取得
**恒久対応**: Phase 2でスキーマ拡張

#### 4. 部門コード標準化
**影響**: 医療システムとVoiceDriveで部門コードが異なる可能性
**対応**: 部門マスタの同期確認
**期限**: 2025年11月7日（Phase 1開始前）

### 🟢 Low Priority Issues

#### 5. パフォーマンス懸念
**影響**: 大規模部門（100人以上）で読み込みが遅い可能性
**対応**: Phase 3でキャッシング実装

---

## 📝 医療システムチームへの確認事項

### 確認-1: API-3 部門メンバー一覧取得の仕様

**質問**:
1. `avatar`フィールドは含まれますか？
   - ✅ YES → VoiceDriveはそのまま使用
   - ❌ NO → VoiceDrive User.avatarから補完

2. `departmentName`（部門名）は含まれますか？
   - ✅ YES → 表示に使用
   - ❌ NO → VoiceDrive側でマッピング必要

3. レスポンスに含まれる`permissionLevel`は25レベル体系（1.0〜18.0）ですか？
   - ✅ YES → そのまま使用
   - ❌ NO → マッピング必要

**回答期限**: 2025年11月1日

---

### 確認-2: API-4 部門統計情報の計算ロジック

**質問**:
1. `activeMembers`の定義は？
   - Option A: 退職していない職員
   - Option B: 過去30日間にログインした職員
   - Option C: その他（具体的に記述）

2. `permissionLevelDistribution`は1〜18の全レベルを返しますか？
   - ✅ YES（count=0も含む） → グラフ表示に便利
   - ❌ NO（count>0のみ） → VoiceDrive側で補完

3. 統計の更新頻度は？
   - Option A: リアルタイム（APIリクエスト毎に計算）
   - Option B: 日次バッチ（02:00 JST）
   - Option C: その他

**回答期限**: 2025年11月1日

---

### 確認-3: 部門コードの標準化

**質問**:
1. VoiceDrive User.departmentの値は、医療システムの部門コードと一致していますか？
   - ✅ YES → そのまま使用可能
   - ❌ NO → マッピングテーブル必要

2. 部門コードの形式は？
   - 例: `"medical_care_ward"`, `"nursing_dept"`, `"001"`, etc.

3. 部門マスタはWebhookで同期されますか？
   - ✅ YES → Webhook仕様を共有してください
   - ❌ NO → 手動同期プロセス必要

**回答期限**: 2025年11月1日

---

## ✅ 完了チェックリスト

### 医療システムチーム
- [ ] 確認-1〜3の回答提出（11月1日）
- [ ] API-3実装完了（11月7日）
- [ ] API-4実装完了（11月7日）
- [ ] API仕様書の共有
- [ ] 統合テスト環境の準備

### VoiceDriveチーム
- [ ] Postテーブル作成（11月7日）
- [ ] DepartmentStatsService実装（11月7日）
- [ ] DepartmentPostService実装（11月7日）
- [ ] DepartmentStationPage修正（11月8日）
- [ ] ユニットテスト作成（11月8日）
- [ ] 統合テスト実施（11月8日）

---

## 📚 関連ドキュメント

- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [Dashboard_DB要件分析_20251009.md](./Dashboard_DB要件分析_20251009.md)
- [医療システムマスタープラン](./RESPONSE-PS-DB-2025-1009-001.md)
- [Prismaスキーマ](../../prisma/schema.prisma)

---

**最終更新**: 2025年10月9日
**作成者**: Claude (AI Assistant)
**レビュー**: 未実施
