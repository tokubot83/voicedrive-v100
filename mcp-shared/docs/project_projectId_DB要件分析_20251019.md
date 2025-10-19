# Project Detail Page (project/:projectId) DB要件分析

**文書番号**: PRO-DETAIL-DBA-2025-1019-001
**作成日**: 2025年10月19日
**作成者**: VoiceDriveチーム
**対象ページ**: `/project/:projectId`
**対象コンポーネント**: `ProjectDetailPage.tsx`
**ルート**: `<Route path="project/:projectId" element={<ProjectDetailPage />} />`
**ステータス**: 🟡 分析完了(DB統合作業必要)

---

## 📋 エグゼクティブサマリー

### 現状の問題点

**ProjectDetailPage (`/project/:projectId`) は現在、完全にデモデータで動作しており、データベースとの統合が一切実装されていません。**

| 項目 | 現状 | あるべき姿 |
|------|------|-----------|
| **データソース** | ハードコードされたデモデータ (lines 100-174) | Prisma Post/ProjectApproval/ProjectTeamMember |
| **API連携** | なし | GET /api/projects/:projectId |
| **リアルタイム性** | 固定デモデータ | DBから取得した実データ |
| **承認フロー** | デモデータ (4ステップ固定) | ProjectApproval テーブルから動的取得 |
| **メンバー管理** | デモデータ (3人固定) | ProjectTeamMember テーブルから動的取得 |

### 重要な発見

1. **完全デモデータ実装**
   - lines 100-174: 全データがハードコード
   - ページリロード時も同じデモデータ表示
   - projectIdパラメータは受け取っているが使用されていない

2. **既存のDBスキーマとの整合性**
   - schema.prismaには必要なテーブルが既に存在:
     - `Post` (プロジェクト基本情報)
     - `ProjectApproval` (承認フロー)
     - `ProjectTeamMember` (メンバー管理)
     - `ProjectMilestone` (マイルストーン)
   - **実装が足りないのはAPI層とデータ取得ロジックのみ**

3. **ProjectDetailインターフェースとPostモデルのギャップ**
   - ProjectDetail.consensusLevel → Post に対応フィールドなし
   - ProjectDetail.upvotes/downvotes → Post.stronglySupportCount等を集計
   - ProjectDetail.approvalFlow → ProjectApproval テーブルから構築
   - ProjectDetail.selectedMembers → ProjectTeamMember テーブルから構築

4. **ApprovalFlowServiceとの連携**
   - ApprovalFlowService.ts (600行) が存在
   - 階層承認フローのロジック実装済み
   - **ProjectDetailPageとの統合が未実施**

### 優先度の判断

⚠️ **中優先度** (Projects/Projects Legacyと同時に実施)

**理由**:
- Projects/Projects Legacyと同じPostテーブル中心アーキテクチャ
- プロジェクト詳細ページはプロジェクト一覧ページの次に必要
- 承認フローやメンバー管理など、既存実装(サービスクラス)との統合がメイン

**推奨スケジュール**: Projects Legacy Phase完了後 (2025年12月18日～)

---

## 🔍 現状分析

### 1. ProjectDetailPage.tsx の機能詳細

**ファイル**: `src/pages/ProjectDetailPage.tsx` (495行)

#### 主要機能

1. **プロジェクト概要表示** (lines 305-340)
   - タイトル、カテゴリ、作成者、作成日
   - プロジェクト説明文
   - ステータスバッジ (pending/approved/rejected/in_progress/completed)
   - 承認・参加ボタン

2. **合意形成状況** (lines 342-368)
   - 合意レベル (consensusLevel): 0-100%のプログレスバー
   - 賛成票数 (upvotes)
   - 反対票数 (downvotes)

3. **承認プロセス表示** (lines 370-412)
   - 承認フロー全ステップ (4ステップ固定 in デモ)
   - 各ステップの承認者、ステータス、コメント
   - 承認済み/却下/承認待ちのビジュアル表示

4. **選定メンバー表示** (lines 414-444)
   - メンバーリスト (名前、部署、役割)
   - メンバーステータス (invited/accepted/declined)

5. **タイムライン表示** (lines 446-487)
   - 投票締切日
   - プロジェクト開始日 (任意)
   - プロジェクト完了予定日 (任意)

6. **アクション機能** (lines 188-231)
   - 承認ボタン: `handleApprove()` → ApprovalFlowService.approveStep()
   - 参加ボタン: `handleJoinProject()` → メンバー参加処理

#### 現在のデータフロー

```
ProjectDetailPage.tsx (lines 92-185)
  ↓
useParams → projectId取得
  ↓
loadProjectDetails() (lines 93-182)
  ↓
デモデータ生成 (lines 100-174) ← 🔴 問題: ハードコード
  ↓
setProject(demoProject)
  ↓
UI表示
```

**問題点**: データベース接続が一切ない

### 2. ProjectDetail インターフェース

#### ProjectDetail型定義 (lines 36-75)

```typescript
interface ProjectDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  createdAt: Date;
  author: {
    name: string;
    department: string;
    avatar?: string;
  };
  consensusLevel: number;      // 🔴 Post に対応フィールドなし
  upvotes: number;              // 🟡 Post.stronglySupportCount + supportCount
  downvotes: number;            // 🟡 Post.opposeCount + stronglyOpposeCount
  approvalFlow: {               // 🟡 ProjectApproval テーブルから構築
    currentStep: number;
    totalSteps: number;
    steps: Array<{
      id: string;
      title: string;
      approver: string;
      status: 'pending' | 'approved' | 'rejected';
      approvedAt?: Date;
      comments?: string;
    }>;
  };
  selectedMembers: Array<{      // 🟡 ProjectTeamMember テーブルから構築
    id: string;
    name: string;
    department: string;
    role: string;
    status: 'invited' | 'accepted' | 'declined';
  }>;
  timeline: {                   // 🟡 Post フィールドから構築
    votingDeadline: Date;
    projectStart?: Date;
    projectEnd?: Date;
  };
}
```

### 3. 既存のPostテーブルフィールド

schema.prisma の Post モデル (lines 450-540):

#### 既存のプロジェクト関連フィールド

| フィールド | 型 | 用途 | ProjectDetailで使用 |
|----------|-----|------|-------------------|
| `id` | String | プロジェクトID | ✅ 使用 |
| `type` | String | 投稿タイプ | ✅ 使用 (プロジェクト判定) |
| `content` | String | プロジェクト説明 | ✅ 使用 |
| `authorId` | String | 作成者ID | ✅ 使用 |
| `createdAt` | DateTime | 作成日時 | ✅ 使用 |
| `approvalStatus` | String? | 承認ステータス | ✅ 使用 |
| `approvedAt` | DateTime? | 承認日時 | ✅ 使用 |
| `approvedBy` | String? | 承認者ID | ✅ 使用 |
| `rejectedAt` | DateTime? | 却下日時 | ✅ 使用 |
| `rejectedBy` | String? | 却下者ID | ✅ 使用 |
| `rejectionReason` | String? | 却下理由 | ✅ 使用 |
| `projectStatus` | String? | プロジェクトステータス | ✅ 使用 |
| `projectStartDate` | DateTime? | プロジェクト開始日 | ✅ 使用 |
| `projectEndDate` | DateTime? | プロジェクト完了予定日 | ✅ 使用 |
| `stronglySupportCount` | Int | 強く賛成の数 | ✅ 使用 |
| `supportCount` | Int | 賛成の数 | ✅ 使用 |
| `neutralCount` | Int | 中立の数 | ✅ 使用 |
| `opposeCount` | Int | 反対の数 | ✅ 使用 |
| `stronglyOpposeCount` | Int | 強く反対の数 | ✅ 使用 |
| `expirationDate` | DateTime? | 投票締切日 | ✅ 使用 |

#### 不足しているフィールド

| ProjectDetail必須項目 | schema.prisma | ギャップ |
|----------------------|--------------|---------|
| `title` | ❌ なし | 🔴 **要追加** (contentから抽出 or 専用フィールド) |
| `category` | proposalType, freespaceCategory | 🟡 **変換必要** |
| `consensusLevel` | ❌ なし | 🔴 **要追加** (投票数から計算) |

### 4. ProjectApprovalテーブル (既存)

schema.prisma lines 1547-1574:

```prisma
model ProjectApproval {
  id                  String   @id @default(cuid())
  postId              String   @map("post_id")
  approverId          String   @map("approver_id")
  approverName        String   @map("approver_name")
  approverLevel       Float    @map("approver_level")
  action              String   // 'approved' | 'rejected' | 'pending'
  reason              String?
  comment             String?
  projectLevel        String   @map("project_level")
  projectScore        Int      @map("project_score")
  totalVotes          Int      @map("total_votes")
  supportRate         Float    @map("support_rate")
  isEmergencyOverride Boolean  @default(false) @map("is_emergency_override")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  approver            User     @relation("ProjectApprover", fields: [approverId], references: [id])
  post                Post     @relation("PostApprovals", fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([approverId])
  @@index([action])
  @@index([projectLevel])
  @@index([createdAt])
  @@index([postId, createdAt])
  @@map("project_approvals")
}
```

**評価**: ✅ 承認フロー構築に必要な情報が揃っている

### 5. ProjectTeamMemberテーブル (既存)

schema.prisma lines 1691-1708:

```prisma
model ProjectTeamMember {
  id        String    @id @default(cuid())
  projectId String    @map("project_id")
  userId    String    @map("user_id")
  role      String    @default("member")
  joinedAt  DateTime  @default(now()) @map("joined_at")
  leftAt    DateTime? @map("left_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user      User      @relation("ProjectMemberships", fields: [userId], references: [id], onDelete: Cascade)
  project   Post      @relation("ProjectTeamMembers", fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([role])
  @@map("project_team_members")
}
```

**不足フィールド**:

| ProjectDetail.selectedMembers | ProjectTeamMember | ギャップ |
|------------------------------|-------------------|---------|
| `status` (invited/accepted/declined) | ❌ なし | 🔴 **要追加** |

**解決策**:

```prisma
model ProjectTeamMember {
  // ... 既存フィールド ...

  // 🆕 メンバーステータス追加
  status  String  @default("invited")  // 'invited' | 'accepted' | 'declined'
}
```

---

## 🎯 データ管理責任分界点

### VoiceDrive側の責任 (100%)

| データカテゴリ | 管理テーブル/フィールド | 詳細 |
|--------------|---------------------|------|
| **プロジェクト基本情報** | `Post` | id, content, type, authorId, createdAt |
| **プロジェクトステータス** | `Post` | projectStatus, approvalStatus |
| **プロジェクト日程** | `Post` | projectStartDate, projectEndDate, expirationDate |
| **投票集計** | `Post` | stronglySupportCount, supportCount, neutralCount, opposeCount |
| **承認履歴** | `ProjectApproval` | approverId, action, reason, comment, createdAt |
| **チームメンバー** | `ProjectTeamMember` | userId, role, status, joinedAt, leftAt |
| **マイルストーン** | `ProjectMilestone` | title, dueDate, status, completedAt |

### 医療システム側からの参照 (読み取り専用)

| データカテゴリ | ソース | 用途 |
|--------------|-------|------|
| **ユーザー基本情報** | 医療システム User API | author.name, author.department, author.avatar 表示 |
| **部署情報** | 医療システム Organization API | department 表示 |
| **承認者情報** | 医療システム User API | approverName 表示 |

**⚠️ 重要**: 医療システム側は **一切のProjectデータを保持しない**
- VoiceDriveが100%管理
- 医療システムからは既存API (ユーザー、部署) のみ使用

---

## 🔴 不足項目の洗い出し

### 1. Postテーブルの不足フィールド

```prisma
model Post {
  // ... 既存フィールド ...

  // 🆕 ProjectDetailPage用フィールド
  title             String?   @map("title")  // プロジェクトタイトル (任意)
  consensusLevel    Int?      @default(0) @map("consensus_level")  // 合意レベル (0-100)
}
```

**title フィールド**:
- **Option A**: `title` フィールドを追加 (推奨)
- **Option B**: `content` の最初の文をタイトルとして抽出 (現在のデモ実装)

**consensusLevel フィールド**:
- **計算ロジック**: `(stronglySupportCount + supportCount) / totalEngagements * 100`
- **Option A**: 計算済みフィールドとして保存 (パフォーマンス優先)
- **Option B**: リアルタイム計算 (正確性優先)

**推奨**: Option A (titleフィールド追加 + consensusLevel保存)

### 2. ProjectTeamMemberテーブルの不足フィールド

```prisma
model ProjectTeamMember {
  // ... 既存フィールド ...

  // 🆕 メンバーステータス追加
  status  String  @default("invited")  // 'invited' | 'accepted' | 'declined'
}
```

### 3. 新規APIエンドポイント

ProjectDetailPageをDB統合するために必要なAPIエンドポイント:

| エンドポイント | メソッド | 用途 | 優先度 |
|--------------|---------|------|--------|
| `/api/projects/:projectId` | GET | プロジェクト詳細取得 | 🔴 必須 |
| `/api/projects/:projectId/approve` | POST | プロジェクト承認 | 🔴 必須 |
| `/api/projects/:projectId/join` | POST | プロジェクト参加 | 🔴 必須 |
| `/api/projects/:projectId/approvals` | GET | 承認履歴取得 | 🟡 推奨 |
| `/api/projects/:projectId/members` | GET | メンバー一覧取得 | 🟡 推奨 |

**統合後のデータフロー**:

```
ProjectDetailPage.tsx
  ↓
GET /api/projects/:projectId
  ↓
ProjectService.getProjectDetail(projectId)
  ↓
Prisma query (
  Post
  JOIN User (author)
  JOIN ProjectApproval (approvals)
  JOIN ProjectTeamMember (members)
  JOIN ProjectMilestone (milestones)
)
  ↓
convertPostToProjectDetail()
  ↓
Response with ProjectDetail
  ↓
UI表示
```

---

## 📋 必要な追加項目一覧

### 1. Postテーブルへの追加フィールド

```prisma
model Post {
  // ... 既存フィールド ...

  // 🆕 ProjectDetailPage用フィールド
  title             String?   @map("title")  // プロジェクトタイトル
  consensusLevel    Int?      @default(0) @map("consensus_level")  // 合意レベル (0-100)

  // インデックス追加
  @@index([title])
  @@index([consensusLevel])
}
```

### 2. ProjectTeamMemberテーブルへの追加フィールド

```prisma
model ProjectTeamMember {
  // ... 既存フィールド ...

  // 🆕 メンバーステータス
  status  String  @default("invited")  // 'invited' | 'accepted' | 'declined'

  // インデックス追加
  @@index([status])
}
```

---

## 📝 実装計画

### Phase 1: スキーマ拡張 (2日)

#### 1-1. Postテーブル拡張

```prisma
model Post {
  // ... 既存フィールド ...

  // 🆕 ProjectDetailPage用フィールド
  title             String?   @map("title")
  consensusLevel    Int?      @default(0) @map("consensus_level")
}
```

#### 1-2. ProjectTeamMemberテーブル拡張

```prisma
model ProjectTeamMember {
  // ... 既存フィールド ...

  // 🆕 メンバーステータス
  status  String  @default("invited")
}
```

#### 1-3. マイグレーション実行

```bash
npx prisma migrate dev --name add_project_detail_fields
```

### Phase 2: ProjectService拡張 (3日)

#### 2-1. getProjectDetail() 実装

```typescript
// src/api/db/projectService.ts に追加

/**
 * プロジェクト詳細取得
 */
static async getProjectDetail(projectId: string) {
  const project = await prisma.post.findUnique({
    where: { id: projectId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          department: true,
          avatar: true,
        }
      },
      approvals: {
        orderBy: { createdAt: 'asc' },
        include: {
          approver: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          }
        }
      },
      teamMembers: {
        where: { leftAt: null },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          }
        }
      },
      milestones: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!project) {
    return {
      success: false,
      error: 'Project not found'
    };
  }

  return {
    success: true,
    data: convertPostToProjectDetail(project)
  };
}

/**
 * Post を ProjectDetail に変換
 */
function convertPostToProjectDetail(post: Post): ProjectDetail {
  // タイトル取得
  const title = post.title || post.content.split('。')[0] + '...';

  // 合意レベル計算
  const totalVotes = post.totalEngagements || 0;
  const supportVotes = (post.stronglySupportCount || 0) + (post.supportCount || 0);
  const consensusLevel = totalVotes > 0
    ? Math.round((supportVotes / totalVotes) * 100)
    : post.consensusLevel || 0;

  // 承認フロー構築
  const approvalSteps = post.approvals.map((approval, index) => ({
    id: approval.id,
    title: `${approval.approverName} 承認`,
    approver: approval.approverName,
    status: approval.action as 'pending' | 'approved' | 'rejected',
    approvedAt: approval.action === 'approved' ? approval.createdAt : undefined,
    comments: approval.comment || undefined
  }));

  const currentStepIndex = approvalSteps.findIndex(step => step.status === 'pending');

  // メンバーリスト構築
  const selectedMembers = post.teamMembers.map(member => ({
    id: member.userId,
    name: member.user.name,
    department: member.user.department,
    role: member.role,
    status: member.status as 'invited' | 'accepted' | 'declined'
  }));

  return {
    id: post.id,
    title,
    content: post.content,
    category: post.proposalType || post.freespaceCategory || 'その他',
    status: post.projectStatus || post.approvalStatus || 'pending',
    createdAt: post.createdAt,
    author: {
      name: post.author.name,
      department: post.author.department,
      avatar: post.author.avatar
    },
    consensusLevel,
    upvotes: supportVotes,
    downvotes: (post.opposeCount || 0) + (post.stronglyOpposeCount || 0),
    approvalFlow: {
      currentStep: currentStepIndex >= 0 ? currentStepIndex + 1 : approvalSteps.length,
      totalSteps: approvalSteps.length,
      steps: approvalSteps
    },
    selectedMembers,
    timeline: {
      votingDeadline: post.expirationDate || new Date(),
      projectStart: post.projectStartDate || undefined,
      projectEnd: post.projectEndDate || undefined
    }
  };
}
```

#### 2-2. approveProject() 実装

```typescript
/**
 * プロジェクト承認
 */
static async approveProject(
  projectId: string,
  approverId: string,
  comment?: string
) {
  // ApprovalFlowService と統合
  const approvalFlowService = ApprovalFlowService.getInstance();

  // 承認処理実行
  const result = await approvalFlowService.processApproval(
    await getUserById(approverId),
    projectId,
    'approved',
    comment || ''
  );

  if (result.success) {
    // ProjectApproval レコード作成
    await prisma.projectApproval.create({
      data: {
        postId: projectId,
        approverId,
        approverName: result.approverName,
        approverLevel: result.approverLevel,
        action: 'approved',
        comment,
        projectLevel: result.projectLevel,
        projectScore: result.projectScore,
        totalVotes: result.totalVotes,
        supportRate: result.supportRate
      }
    });

    // Post の approvalStatus 更新
    await prisma.post.update({
      where: { id: projectId },
      data: {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: approverId
      }
    });
  }

  return result;
}
```

#### 2-3. joinProject() 実装

```typescript
/**
 * プロジェクト参加
 */
static async joinProject(projectId: string, userId: string) {
  // メンバーステータス更新
  const member = await prisma.projectTeamMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  if (!member) {
    return {
      success: false,
      error: 'Member invitation not found'
    };
  }

  if (member.status !== 'invited') {
    return {
      success: false,
      error: 'Member already accepted or declined'
    };
  }

  await prisma.projectTeamMember.update({
    where: {
      id: member.id
    },
    data: {
      status: 'accepted',
      joinedAt: new Date()
    }
  });

  return {
    success: true,
    message: 'Successfully joined the project'
  };
}
```

### Phase 3: APIエンドポイント実装 (2日)

```typescript
// src/pages/api/projects/[projectId]/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ProjectService } from '../../../../api/db/projectService';
import { getServerSession } from 'next-auth/next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId } = req.query;

  if (req.method === 'GET') {
    const result = await ProjectService.getProjectDetail(projectId as string);

    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      return res.status(404).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

```typescript
// src/pages/api/projects/[projectId]/approve.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId } = req.query;
  const { comment } = req.body;

  if (req.method === 'POST') {
    const result = await ProjectService.approveProject(
      projectId as string,
      session.user.id,
      comment
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ error: result.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

```typescript
// src/pages/api/projects/[projectId]/join.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId } = req.query;

  if (req.method === 'POST') {
    const result = await ProjectService.joinProject(
      projectId as string,
      session.user.id
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

### Phase 4: ProjectDetailPage統合 (2日)

```typescript
// src/pages/ProjectDetailPage.tsx の修正

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load project details from API
  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!projectId) return;

      setLoading(true);
      try {
        // 🆕 実際のAPIを呼び出す
        const response = await fetch(`/api/projects/${projectId}`);

        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Failed to load project details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [projectId]);

  // Handle approval action
  const handleApprove = async () => {
    if (!project || !user) return;

    setActionLoading(true);
    try {
      // 🆕 実際の承認APIを呼び出す
      const response = await fetch(`/api/projects/${project.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Approved via UI' })
      });

      if (!response.ok) {
        throw new Error('Failed to approve');
      }

      // Reload project details
      window.location.reload();
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle member participation
  const handleJoinProject = async () => {
    if (!project || !user) return;

    setActionLoading(true);
    try {
      // 🆕 実際の参加APIを呼び出す
      const response = await fetch(`/api/projects/${project.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to join project');
      }

      // Reload project details
      window.location.reload();
    } catch (error) {
      console.error('Failed to join project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ... UI レンダリング (デモデータ削除) ...
};
```

### Phase 5: テストとデバッグ (2日)

- APIエンドポイントのテスト
- 承認フロー機能の動作確認
- メンバー参加機能の動作確認
- 合意レベル計算の精度確認
- エラーハンドリングの確認

---

## 📅 実装スケジュール

### 推奨スケジュール: Projects Legacy完了後

| フェーズ | 期間 | 工数 | 担当 | 依存関係 |
|---------|------|------|------|---------|
| **Phase 1** | 2025年12月18日～12月19日 | 2日 | VoiceDrive | Projects Legacy完了 |
| **Phase 2** | 2025年12月20日～12月23日 | 3日 | VoiceDrive | Phase 1完了 |
| **Phase 3** | 2025年12月24日～12月25日 | 2日 | VoiceDrive | Phase 2完了 |
| **Phase 4** | 2025年12月26日～12月27日 | 2日 | VoiceDrive | Phase 3完了 |
| **Phase 5** | 2025年12月28日～12月29日 | 2日 | VoiceDrive | Phase 4完了 |
| **リリース** | 2025年12月30日 | - | VoiceDrive | 全Phase完了 |

**総工数**: 11日 (2週間強)
**実質工数**: 11日 (新規実装)
**コスト見積もり**: ¥440,000 (11日 × ¥40,000/日)

### 依存関係

**前提条件**:
1. ✅ Projects Legacy Phase 1-5 完了 (2025年12月18日)
2. ✅ Phase 1.2 (MySQL移行) 完了
3. ✅ Post, ProjectApproval, ProjectTeamMember テーブル実装済み

**並行作業可能**:
- Projects と並行実施可能 (EnhancedProjectListPage)

---

## 🎯 成功指標

### 技術指標

| 指標 | 目標 | 測定方法 |
|------|------|---------|
| **API レスポンスタイム** | < 300ms | プロジェクト詳細取得時間 |
| **データ整合性** | 100% | Post → ProjectDetail の変換精度 |
| **承認フロー精度** | 100% | ApprovalFlowService との統合精度 |
| **メンバー管理精度** | 100% | ProjectTeamMember との同期精度 |

### ビジネス指標

| 指標 | 目標 | 測定方法 |
|------|------|---------|
| **プロジェクト可視化率** | 100% | DB上のプロジェクトがUIに表示される率 |
| **ユーザー満足度** | > 85% | フィードバック調査 |
| **デモデータ依存率** | 0% | ハードコードデータの削除完了 |
| **承認処理成功率** | > 99% | 承認アクション成功率 |

---

## 🚨 リスクと対策

### リスク 1: ApprovalFlowServiceとの統合複雑性

**リスク内容**:
- ApprovalFlowService は階層承認フローを実装
- ProjectDetailPageの簡易承認UIとの整合性

**対策**:
- ApprovalFlowService.processApproval() を活用
- ProjectApproval テーブルへの記録を確実に実施
- 承認フローのステップ管理を統一

### リスク 2: 合意レベル計算ロジック

**リスク内容**:
- consensusLevel の計算方法が明確化されていない
- デモデータでは78%固定

**対策**:
- 計算式の明確化: `(stronglySupport + support) / totalEngagements * 100`
- Post.consensusLevel フィールドに保存 (パフォーマンス向上)
- 投票時に自動更新

### リスク 3: メンバーステータス管理

**リスク内容**:
- ProjectTeamMember.status フィールドが未実装
- invited/accepted/declined の管理方法

**対策**:
- status フィールドをスキーマに追加
- デフォルト値: 'invited'
- 参加時に 'accepted' に更新

---

## 📞 次のアクション

### VoiceDriveチーム (12月18日～)

✅ **12月18日～12月19日 (Phase 1)**:
- [ ] Postテーブルに title, consensusLevel フィールド追加
- [ ] ProjectTeamMemberテーブルに status フィールド追加
- [ ] マイグレーション実行

⏳ **12月20日～12月23日 (Phase 2)**:
- [ ] ProjectService.getProjectDetail() 実装
- [ ] ProjectService.approveProject() 実装
- [ ] ProjectService.joinProject() 実装
- [ ] convertPostToProjectDetail() 実装

⏳ **12月24日～12月25日 (Phase 3)**:
- [ ] GET /api/projects/:projectId 実装
- [ ] POST /api/projects/:projectId/approve 実装
- [ ] POST /api/projects/:projectId/join 実装

⏳ **12月26日～12月27日 (Phase 4)**:
- [ ] ProjectDetailPage の loadProjectDetails() 修正
- [ ] handleApprove() 修正
- [ ] handleJoinProject() 修正
- [ ] デモデータ削除

⏳ **12月28日～12月29日 (Phase 5)**:
- [ ] APIエンドポイントのテスト
- [ ] 承認フロー動作確認
- [ ] メンバー参加動作確認
- [ ] エラーハンドリング確認

⏳ **12月30日**:
- [ ] リリース

### 医療システムチーム

**対応不要**:
- ProjectDetailPage は VoiceDrive 100% 管理
- 医療システムからの新規API提供は不要
- 既存のユーザーAPI, 部署APIのみ使用

---

## 📚 参考資料

- [projects_DB要件分析_20251019.md](./projects_DB要件分析_20251019.md)
- [projects-legacy_DB要件分析_20251019.md](./projects-legacy_DB要件分析_20251019.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [Proposal_IdeaTracking_MySQL_Integration_20251019.md](./Proposal_IdeaTracking_MySQL_Integration_20251019.md)

---

**本分析書をご確認いただき、実装方針について合意が得られましたら、Projects Legacy完了後に実装を開始いたします。**

**VoiceDriveチーム**
2025年10月19日