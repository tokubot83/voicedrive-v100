# ProjectDetailPage DB要件分析

**文書番号**: DB-REQ-2025-1026-002
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/project/:projectId
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
ProjectDetailPageは**現在完全にダミーデータで動作**しており、実装には以下の対応が必要です。

### 🔴 重大な不足項目（即対応必要）

1. **承認フロー詳細表示の未実装**
   - 現在: 完全にダミーデータ（4段階承認フロー）
   - 必要: `ProjectApproval`テーブルの活用

2. **プロジェクトメンバー管理の未実装**
   - 現在: 完全にダミーデータ（3名のメンバー）
   - 必要: `ProjectTeamMember`テーブルの活用

3. **投票・合意形成データの不足**
   - 現在: ダミーデータ（consensusLevel: 78%, upvotes: 45, downvotes: 12）
   - 必要: `VoteHistory`テーブルの追加

4. **投票締切フィールドの不足**
   - 現在: `Project`テーブルに存在しない
   - 必要: `votingDeadline`フィールドの追加

---

## 🔍 詳細分析

### 1. プロジェクト基本情報（100-175行目）

#### 表示内容
```typescript
interface ProjectDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  createdAt: Date;
  author: { name: string; department: string; avatar?: string; };
  consensusLevel: number;
  upvotes: number;
  downvotes: number;
}
```

#### データソース分析

| 表示項目 | Project テーブル | 状態 |
|---------|----------------|------|
| `id` | ✅ `id` | ✅ OK |
| `title` | ✅ `title` | ✅ OK |
| `content` | ✅ `description` | ✅ OK |
| `category` | ✅ `category` | ✅ OK |
| `status` | ✅ `status` | ✅ OK |
| `createdAt` | ✅ `createdAt` | ✅ OK |
| `author.*` | User結合必要 | 🟡 要結合 |
| `consensusLevel` | ❌ 不足 | 🔴 要追加 |
| `upvotes` | ❌ 不足 | 🔴 要追加 |
| `downvotes` | ❌ 不足 | 🔴 要追加 |

---

### 2. 承認フロー表示（114-144行目、370-412行目）

#### 表示内容
```typescript
approvalFlow: {
  currentStep: 2;
  totalSteps: 4;
  steps: [{
    id: string;
    title: "部門長承認";
    approver: "佐藤部長";
    status: 'approved';
    approvedAt: Date;
    comments: "良い提案です。進めてください。";
  }];
}
```

#### データソース分析

**既存テーブル**: `ProjectApproval`が存在（活用可能）

```prisma
model ProjectApproval {
  id            String    @id @default(cuid())
  projectId     String
  approverId    String
  approvalLevel Int
  status        String    @default("pending")
  approvedAt    DateTime?
  comments      String?
  approver      User      @relation(...)
}
```

**状態**: ✅ テーブル存在、🔴 サービス未実装

---

### 3. 選定メンバー表示（146-168行目、414-444行目）

#### 表示内容
```typescript
selectedMembers: [{
  id: string;
  name: "田中花子";
  department: "看護部";
  role: "プロジェクトリーダー";
  status: 'accepted';
}]
```

#### データソース分析

**既存テーブル**: `ProjectTeamMember`が存在（活用可能）

```prisma
model ProjectTeamMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      String
  status    String   @default("invited")
  joinedAt  DateTime?
  user      User     @relation(...)
}
```

**状態**: ✅ テーブル存在、🔴 サービス未実装

---

### 4. 合意形成状況（342-368行目）

#### 表示内容
```typescript
consensusLevel: 78%
upvotes: 45票
downvotes: 12票
```

#### データソース分析

**必要**: `VoteHistory`テーブル（現在存在しない）

```prisma
model VoteHistory {
  id         String   @id @default(cuid())
  userId     String
  projectId  String?
  voteOption String
  votedAt    DateTime @default(now())
  user       User     @relation(...)
}
```

**状態**: 🔴 テーブル不足、🔴 サービス未実装

---

### 5. タイムライン（446-487行目）

#### 表示内容
```typescript
timeline: {
  votingDeadline: Date;   // 2024-01-25
  projectStart: Date;     // 2024-02-01
  projectEnd: Date;       // 2024-06-30
}
```

#### データソース分析

| 表示項目 | Project テーブル | 状態 |
|---------|----------------|------|
| `votingDeadline` | ❌ 不足 | 🔴 要追加 |
| `projectStart` | ✅ `startedAt` | ✅ OK |
| `projectEnd` | ✅ `completedAt` | ✅ OK |

---

## 📋 必要な追加・修正項目

### 1. データベーススキーマ変更

#### A. Projectテーブル拡張
```prisma
model Project {
  // 既存フィールド
  id          String   @id @default(cuid())
  title       String
  description String
  // ...

  // 🆕 追加必要
  votingDeadline DateTime? @map("voting_deadline")
}
```

#### B. VoteHistoryテーブル追加
```prisma
model VoteHistory {
  id         String   @id @default(cuid())
  userId     String   @map("user_id")
  postId     String?  @map("post_id")
  projectId  String?  @map("project_id")
  voteOption String   @map("vote_option")
  voteWeight Float    @default(1.0)
  votedAt    DateTime @default(now())

  user       User     @relation(...)

  @@unique([userId, projectId])
  @@index([projectId])
  @@map("vote_history")
}
```

#### C. ProjectSummaryテーブル拡張（推奨）
```prisma
model ProjectSummary {
  // 既存フィールド
  totalParticipants   Int @default(0)
  activeParticipants  Int @default(0)

  // 🆕 追加推奨
  totalVotes         Int   @default(0)
  upvotes            Int   @default(0)
  downvotes          Int   @default(0)
  consensusLevel     Float @default(0)
  totalApprovalSteps Int   @default(0)
  currentApprovalStep Int  @default(0)
}
```

---

### 2. サービスレイヤー実装

#### A. ProjectDetailService（新規）
```typescript
// src/services/ProjectDetailService.ts
export class ProjectDetailService {
  static async getProjectDetail(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { proposer: true }
    });

    const approvalFlow = await ProjectApprovalService.getProjectApprovalFlow(projectId);
    const teamMembers = await ProjectTeamService.getProjectTeamMembers(projectId);
    const voteSummary = await ProjectVoteService.getProjectVoteSummary(projectId);

    return { /* 統合データ */ };
  }
}
```

#### B. ProjectApprovalService拡張
```typescript
export async function getProjectApprovalFlow(projectId: string) {
  const approvals = await prisma.projectApproval.findMany({
    where: { projectId },
    include: { approver: true },
    orderBy: { approvalLevel: 'asc' }
  });

  return {
    currentStep: /* 計算 */,
    totalSteps: approvals.length,
    steps: approvals.map(/* 変換 */)
  };
}
```

#### C. ProjectTeamService（新規）
```typescript
export class ProjectTeamService {
  static async getProjectTeamMembers(projectId: string) {
    return await prisma.projectTeamMember.findMany({
      where: { projectId },
      include: { user: true }
    });
  }

  static async joinProject(projectId: string, userId: string) {
    // 参加処理
  }
}
```

#### D. ProjectVoteService（新規）
```typescript
export class ProjectVoteService {
  static async getProjectVoteSummary(projectId: string) {
    const votes = await prisma.voteHistory.findMany({
      where: { projectId }
    });

    const upvotes = votes.filter(v =>
      v.voteOption === 'strongly-support' || v.voteOption === 'support'
    ).length;

    return { upvotes, downvotes, consensusLevel };
  }
}
```

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（2-3日）

1. Projectテーブルに`votingDeadline`追加
2. ProjectDetailService実装
3. ProjectApprovalService拡張
4. ProjectTeamService実装
5. ProjectDetailPageをダミーから実データへ移行

**動作する機能**:
- ✅ プロジェクト基本情報
- ✅ 承認フロー
- ✅ メンバーリスト
- ⚠️ 投票統計（ダミー）

---

### Phase 2: 投票機能（2-3日）

1. VoteHistoryテーブル追加
2. ProjectVoteService実装
3. ProjectSummaryテーブル拡張
4. 投票UIの実装

**動作する機能**:
- ✅ 合意形成レベル（実データ）
- ✅ 賛成・反対票数（実データ）
- ✅ 投票機能

---

### Phase 3: アクション実装（2日）

1. 承認処理の実装
2. 参加処理の実装
3. 通知機能の統合

**動作する機能**:
- ✅ 承認ボタン
- ✅ 参加ボタン
- ✅ 通知送信

---

## ✅ チェックリスト

### データベース
- [ ] Projectテーブルに`votingDeadline`追加
- [ ] VoteHistoryテーブル追加
- [ ] ProjectSummaryテーブル拡張
- [ ] マイグレーション実行

### サービス（Phase 1）
- [ ] ProjectDetailService実装
- [ ] ProjectApprovalService.getProjectApprovalFlow()実装
- [ ] ProjectTeamService.getProjectTeamMembers()実装

### サービス（Phase 2）
- [ ] ProjectVoteService.getProjectVoteSummary()実装
- [ ] ProjectVoteService.voteOnProject()実装

### サービス（Phase 3）
- [ ] ProjectTeamService.joinProject()実装
- [ ] 承認処理フローの実装
- [ ] 通知機能の統合

### フロントエンド
- [ ] ダミーデータ削除
- [ ] 実API接続
- [ ] 投票UI実装
- [ ] エラーハンドリング

### テスト
- [ ] 単体テスト
- [ ] 統合テスト
- [ ] E2Eテスト

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [ProjectListPage_DB要件分析](./ProjectListPage_DB要件分析_20251026.md)

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: Phase 1実装後
