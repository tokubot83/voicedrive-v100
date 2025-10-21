# proposal-management ページDB要件分析書

**文書番号**: VD-ANALYSIS-PM-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDriveチーム
**対象ページ**: ProposalManagementPage
**URL**: https://voicedrive-v100.vercel.app/proposal-management
**目的**: proposal-managementページの機能を実現するために必要なデータベース要件を分析

---

## 📋 エグゼクティブサマリー

### ページ概要

ProposalManagementPage は、議題提案を管理職が管理するためのページです。議題レベル（PENDING → DEPT_REVIEW → DEPT_AGENDA → FACILITY_AGENDA → CORP_REVIEW → CORP_AGENDA）に応じて、権限を持つ管理職が以下の操作を行います:

- 投稿の客観的データ分析（投票数、支持率、コメント分析）
- 議題候補としてマーク
- 議題提案書の自動生成
- レベルアップ承認（スコアに基づく昇格）
- 却下・保留・部署案件化（期限切れ後の責任者判断）

### 主要機能

| 機能 | 説明 | データソース |
|------|------|------------|
| **議題レベル別フィルタリング** | PENDING/DEPT_REVIEW等のレベルごとに投稿を表示 | Post.agendaLevel |
| **権限ベースのアクセス制御** | ユーザーの権限レベルに応じて閲覧・編集権限を制御 | User.permissionLevel, ProposalPermissionService |
| **投稿分析** | 投票数・支持率・コメント分析の可視化 | Post.votes, Post.comments |
| **議題候補マーク** | 重要な提案を候補としてマーク | Post.isAgendaCandidate |
| **提案書自動生成** | 投稿データから議題提案書を自動作成 | ProposalDocument |
| **レベルアップ承認** | スコアに基づいて次の議題レベルへ昇格 | Post.agendaLevel, Post.escalationReason |
| **期限切れ投稿の処理** | 投票期限切れの投稿を責任者が判断 | Post.agendaDeadline |
| **却下** | 提案を却下し、理由を記録（未実装） | ❌ API未実装 |
| **保留** | 提案を一時保留、理由を記録（未実装） | ❌ API未実装 |
| **部署案件化** | 部署ミーティング案件として処理（未実装） | ❌ API未実装 |

### データ管理責任

| データカテゴリ | 管理責任 | 理由 |
|--------------|---------|------|
| **投稿（Post）** | 🟢 VoiceDrive | VoiceDrive活動データ |
| **提案書（ProposalDocument）** | 🟢 VoiceDrive | 投稿から自動生成 |
| **ユーザー情報（User）** | 🔵 医療システム | 職員マスタ（VoiceDriveはキャッシュのみ） |
| **権限レベル** | 🔵 医療システム | V3評価から算出 |
| **部署・施設情報** | 🔵 医療システム | 組織マスタ |

---

## 🎯 ページ機能詳細分析

### 1. 議題レベル別フィルタリング

**機能説明:**
- ユーザーの権限レベルに応じて、管轄する議題レベルの投稿を表示
- 6段階の議題レベル（PENDING → DEPT_REVIEW → DEPT_AGENDA → FACILITY_AGENDA → CORP_REVIEW → CORP_AGENDA）

**使用データ:**
```typescript
// ProposalPermissionService.ts - 議題レベルごとの責任定義
AGENDA_RESPONSIBILITIES: AgendaResponsibility[] = [
  {
    agendaLevel: 'PENDING',
    minPermissionLevel: 5,   // 副主任以上
    targetPermissionLevel: 5,
    description: '検討中（様子見・提案書不要）',
    targetCommittee: 'なし（様子見）',
    nextLevel: 'DEPT_REVIEW',
    nextLevelThreshold: 30
  },
  {
    agendaLevel: 'DEPT_REVIEW',
    minPermissionLevel: 6,   // 主任以上
    targetPermissionLevel: 6,
    description: '部署内で議論するための提案書作成',
    targetCommittee: '部署ミーティング',
    nextLevel: 'DEPT_AGENDA',
    nextLevelThreshold: 50
  },
  // ... 6段階のレベル定義
]
```

**必要なDB項目:**
- `Post.agendaLevel` (AgendaLevel型) - 現在の議題レベル ✅ 既存
- `User.permissionLevel` (Float) - ユーザーの権限レベル（1-25） ✅ 既存

**データフロー:**
```typescript
// ProposalManagementPage.tsx:140-176
const getManagedLevels = (): AgendaResponsibility[] => {
  if (!activeUser) return [];
  return proposalPermissionService.getManagedLevels(activeUser);
};

const getViewableLevels = (): AgendaResponsibility[] => {
  if (!activeUser) return [];
  return proposalPermissionService.getViewableLevels(activeUser);
};
```

---

### 2. 権限ベースのアクセス制御

**機能説明:**
- ユーザーの権限レベルに応じて、各議題レベルに対する権限を判定
- 権限タイプ: owner（担当者）、supervisor（上位監督者）、observer（参考閲覧）、none（権限なし）

**権限マトリクス:**

| ユーザーレベル | PENDING (5) | DEPT_REVIEW (6) | DEPT_AGENDA (8) | FACILITY_AGENDA (10) | CORP_REVIEW (12) | CORP_AGENDA (13) |
|-------------|------------|----------------|----------------|-------------------|-----------------|-----------------|
| Level 5（副主任） | owner | - | - | - | - | - |
| Level 6（主任） | supervisor | owner | - | - | - | - |
| Level 8（師長） | observer | supervisor | owner | - | - | - |
| Level 10（部長） | - | observer | supervisor | owner | - | - |
| Level 12（副院長） | - | - | observer | supervisor | owner | - |
| Level 13（院長） | - | - | - | observer | supervisor | owner |

**権限による操作制限:**

| 操作 | owner | supervisor | observer | none |
|------|-------|-----------|----------|------|
| 閲覧（canView） | ✅ | ✅ | ✅ | ❌ |
| 編集（canEdit） | ✅ | ❌ | ❌ | ❌ |
| コメント（canComment） | ✅ | ✅ (アドバイス) | ❌ | ❌ |
| 緊急介入（canEmergencyOverride） | ❌ | ✅ | ✅ | ❌ |

**必要なDB項目:**
- `User.permissionLevel` (Float) - 権限レベル ✅ 既存
- `Post.agendaLevel` (AgendaLevel) - 議題レベル ✅ 既存

---

### 3. 投稿分析（ProposalAnalysisCard）

**機能説明:**
- 投稿の客観的データを視覚化
- 投票数、支持率、コメント分析を表示
- タイムライン形式で投稿の経過を表示

**分析項目:**

#### 3.1 投票分析（VoteAnalysis）

```typescript
interface VoteAnalysis {
  totalVotes: number;           // 総投票数
  supportRate: number;          // 支持率（%）
  stronglySupport: number;      // 強く支持
  support: number;              // 支持
  neutral: number;              // 中立
  oppose: number;               // 反対
  stronglyOppose: number;       // 強く反対
  byDepartment?: Array<{        // 部署別分析
    department: string;
    totalVotes: number;
    supportRate: number;
  }>;
}
```

**データソース:**
```typescript
// Post.votes: { [voteType: string]: number }
votes: {
  'strongly-support': 15,
  'support': 25,
  'neutral': 5,
  'oppose': 3,
  'strongly-oppose': 1
}
```

**必要なDB項目:**
- `Post.votes` (Json) - 投票データ ✅ 既存
- `User.department` (String) - 部署別分析用 ✅ 既存

#### 3.2 コメント分析（CommentAnalysis）

```typescript
interface CommentAnalysis {
  totalComments: number;        // 総コメント数
  supportComments: number;      // 賛成意見
  concernComments: number;      // 懸念点
  proposalComments: number;     // 建設的提案
  keyComments: Array<{          // 主要なコメント
    content: string;
    author: string;
    likes: number;
  }>;
}
```

**データソース:**
```typescript
// Post.comments: Comment[]
comments: [
  {
    id: 'c1',
    author: { name: '山田太郎', department: '内科' },
    content: '良い提案だと思います',
    sentiment: 'support',
    likes: 12,
    timestamp: new Date()
  },
  // ...
]
```

**必要なDB項目:**
- `Post.comments` (Comment[]) - コメントデータ ✅ 既存

#### 3.3 タイムライン分析

**イベントタイプ:**
1. 投稿作成（created）
2. レベルアップ（level_up）
3. 投票マイルストーン（vote_milestone）
4. コメント追加（comment）
5. 期限イベント（deadline）

**必要なDB項目:**
- `Post.createdAt` / `Post.timestamp` - 作成日時 ✅ 既存
- `Post.lastActivityDate` - 最終活動日時 ✅ 既存
- `Post.agendaDeadline` - 投票期限 ✅ 既存
- `Post.agendaDeadlineExtensions` - 期限延長回数 ✅ 既存

---

### 4. 議題候補マーク

**機能説明:**
- 重要な提案を「議題候補」としてマークする機能
- マークされた投稿は優先的に提案書作成対象となる

**使用データ:**
```typescript
// ProposalManagementPage.tsx:210-218
const handleMarkAsCandidate = (post: Post) => {
  if (!activeUser) return;
  console.log('⭐ [ProposalManagement] 議題候補マーク:', {
    postId: post.id,
    userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`「${post.content}」を議題候補としてマークしました。`);
};
```

**必要なDB項目:**
- `Post.isAgendaCandidate` (Boolean?) - 議題候補フラグ ❓ 未確認（schema.prismaで確認必要）

---

### 5. 提案書自動生成

**機能説明:**
- 投稿データから議題提案書を自動生成
- 投票分析、コメント分析を基に客観的な提案書を作成

**生成される提案書:**
```typescript
interface ProposalDocument {
  id: string;
  postId: string;
  post: Post;

  // 基本情報
  title: string;                    // 提案タイトル
  agendaLevel: AgendaLevel;         // 議題レベル
  targetCommittee: string;          // 提出先委員会
  createdBy: User;                  // 作成者
  createdDate: Date;
  lastModifiedDate: Date;
  status: ProposalDocumentStatus;   // 'draft' | 'ready' | 'submitted' | 'under_review'

  // 提案内容（自動生成）
  summary: string;                  // 概要
  background: string;               // 背景
  objectives: string;               // 目的
  expectedEffects: string;          // 期待される効果
  concerns: string;                 // 懸念点
  counterMeasures: string;          // 対策

  // データ分析
  voteAnalysis: VoteAnalysis;
  commentAnalysis: CommentAnalysis;
  relatedInfo: any;

  // 管理職による補足
  managerNotes?: string;
  recommendationLevel?: 'strongly_recommend' | 'recommend' | 'neutral';

  // 透明性ログ
  auditLog: AuditLogEntry[];
}
```

**必要なテーブル:**
- `ProposalDocument` テーブル ❓ 未確認（現在はメモリ管理のみ）

**データフロー:**
```typescript
// ProposalManagementPage.tsx:220-237
const handleCreateDocument = (post: Post) => {
  if (!activeUser) return;

  const document = proposalDocumentGenerator.generateDocument(
    post,
    selectedLevel,
    activeUser
  );

  console.log('📄 [ProposalManagement] 議題提案書生成:', {
    documentId: document.id,
    postId: post.id,
    agendaLevel: selectedLevel,
    title: document.title
  });

  alert(`議題提案書「${document.title}」を作成しました。`);
};
```

---

### 6. レベルアップ承認（Escalation）

**機能説明:**
- スコアが閾値を超えた投稿を次の議題レベルへ昇格
- 責任者が承認理由を付けて昇格を実行

**昇格ルール:**

| 現在のレベル | スコア閾値 | 次のレベル | 必要権限 |
|------------|----------|-----------|---------|
| PENDING | 30点 | DEPT_REVIEW | Level 5以上 |
| DEPT_REVIEW | 50点 | DEPT_AGENDA | Level 6以上 |
| DEPT_AGENDA | 100点 | FACILITY_AGENDA | Level 8以上 |
| FACILITY_AGENDA | 300点 | CORP_REVIEW | Level 10以上 |
| CORP_REVIEW | 600点 | CORP_AGENDA | Level 12以上 |

**使用API:**
```typescript
// 既存API: /api/agenda/{id}/escalate
POST /api/agenda/{postId}/escalate
Body: {
  reason: string;  // 昇格理由
  userId: string;  // 承認者ID
}
```

**必要なDB項目:**
- `Post.agendaLevel` - 議題レベル ✅ 既存
- `Post.escalationReason` - 昇格理由 ✅ 既存
- `Post.escalatedBy` - 昇格承認者ID ❓ 未確認
- `Post.escalatedAt` - 昇格日時 ❓ 未確認

---

### 7. 期限切れ投稿の処理

**機能説明:**
- 投票期限が切れた投稿を表示
- 責任者が以下のいずれかの判断を下す:
  1. レベルアップ承認
  2. 却下
  3. 保留
  4. 部署案件化

**期限管理:**
```typescript
// Post.agendaDeadline - 投票期限
// Post.agendaDeadlineExtensions - 延長回数

// 期限切れ判定
const deadlineInfo = AgendaDeadlineManager.getDeadlineInfo(
  post.agendaDeadline,
  post.agendaDeadlineExtensions || 0
);

// deadlineInfo.isExpired === true の場合、責任者判断が必要
```

**必要なDB項目:**
- `Post.agendaDeadline` (DateTime) - 投票期限 ✅ 既存
- `Post.agendaDeadlineExtensions` (Int) - 延長回数 ✅ 既存

**期限切れ投稿取得API:**
```typescript
// 既存API: /api/agenda/expired-escalations
GET /api/agenda/expired-escalations
Response: {
  expiredPosts: Post[];  // 期限切れ投稿リスト
}
```

---

### 8. 却下（Reject）機能 ❌ 未実装

**機能説明:**
- 投票期限切れ後、責任者が提案を却下
- 却下理由を記録
- 投稿ステータスを「却下済み」に変更

**実装箇所:**
```typescript
// ProposalManagementPage.tsx:259-270
const handleReject = (post: Post, feedback: string) => {
  if (!activeUser) return;
  console.log('❌ [ProposalManagement] 却下:', {
    postId: post.id,
    feedback,
    userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`却下しました。\n理由: ${feedback}`);
};
```

**必要な実装:**

#### 8.1 API エンドポイント
```typescript
// 新規API: /api/agenda/{postId}/reject
POST /api/agenda/{postId}/reject
Body: {
  feedback: string;   // 却下理由
  userId: string;     // 却下者ID
  agendaLevel: AgendaLevel;  // 現在の議題レベル
}
```

#### 8.2 必要なDB項目

**オプション1: Post テーブルに追加**
```prisma
model Post {
  // 既存フィールド...

  // 却下情報
  isRejected        Boolean?   // 却下済みフラグ
  rejectedBy        String?    // 却下者ID
  rejectedAt        DateTime?  // 却下日時
  rejectionReason   String?    // 却下理由
  rejectionLevel    String?    // 却下された議題レベル
}
```

**オプション2: ProposalDecision テーブル新規作成**
```prisma
model ProposalDecision {
  id            String   @id @default(cuid())
  postId        String
  post          Post     @relation(fields: [postId], references: [id])

  decisionType  String   // 'reject' | 'hold' | 'department_matter' | 'approved'
  agendaLevel   String   // 決定時の議題レベル

  decidedBy     String
  decidedByUser User     @relation(fields: [decidedBy], references: [id])
  decidedAt     DateTime @default(now())

  reason        String   // 決定理由
  notes         String?  // 追加メモ

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**推奨:** オプション2（ProposalDecision テーブル）
- **理由:**
  - 却下・保留・部署案件化を統一的に管理できる
  - 複数回の決定履歴を保持できる
  - 監査ログとして活用できる
  - Postテーブルが肥大化しない

---

### 9. 保留（Hold）機能 ❌ 未実装

**機能説明:**
- 投票期限切れ後、即座に判断できない提案を一時保留
- 保留理由を記録
- 再検討期限を設定

**実装箇所:**
```typescript
// ProposalManagementPage.tsx:272-283
const handleHold = (post: Post, feedback: string) => {
  if (!activeUser) return;
  console.log('⏸️ [ProposalManagement] 保留:', {
    postId: post.id,
    feedback,
    userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`保留しました。\n理由: ${feedback}`);
};
```

**必要な実装:**

#### 9.1 API エンドポイント
```typescript
// 新規API: /api/agenda/{postId}/hold
POST /api/agenda/{postId}/hold
Body: {
  feedback: string;        // 保留理由
  userId: string;          // 保留決定者ID
  agendaLevel: AgendaLevel;  // 現在の議題レベル
  reviewDate?: Date;       // 再検討予定日
}
```

#### 9.2 必要なDB項目

**ProposalDecision テーブル使用（共通テーブル）**
```prisma
model ProposalDecision {
  // 基本フィールド（却下と共通）
  id            String   @id @default(cuid())
  postId        String
  decisionType  String   // 'hold'
  decidedBy     String
  decidedAt     DateTime
  reason        String

  // 保留固有フィールド
  reviewDate    DateTime?  // 再検討予定日
  isReviewed    Boolean?   // 再検討済みフラグ
  reviewedAt    DateTime?  // 再検討日時
  reviewedBy    String?    // 再検討者ID
  reviewOutcome String?    // 再検討結果（'approved' | 'rejected' | 'extended'）
}
```

---

### 10. 部署案件化（Department Matter）機能 ❌ 未実装

**機能説明:**
- 投稿スコアが低いが、部署内で検討すべき案件として処理
- 部署ミーティング案件として記録
- 部署リーダーへ通知

**実装箇所:**
```typescript
// ProposalManagementPage.tsx:285-296
const handleDepartmentMatter = (post: Post, feedback: string) => {
  if (!activeUser) return;
  console.log('🏢 [ProposalManagement] 部署案件化:', {
    postId: post.id,
    feedback,
    userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`部署ミーティング案件として処理します。\n理由: ${feedback}`);
};
```

**必要な実装:**

#### 10.1 API エンドポイント
```typescript
// 新規API: /api/agenda/{postId}/department-matter
POST /api/agenda/{postId}/department-matter
Body: {
  feedback: string;           // 部署案件化理由
  userId: string;             // 決定者ID
  agendaLevel: AgendaLevel;   // 現在の議題レベル
  targetDepartment: string;   // 対象部署
  assignedTo?: string;        // 担当リーダーID
}
```

#### 10.2 必要なDB項目

**ProposalDecision テーブル使用（共通テーブル）**
```prisma
model ProposalDecision {
  // 基本フィールド（共通）
  id            String   @id @default(cuid())
  postId        String
  decisionType  String   // 'department_matter'
  decidedBy     String
  decidedAt     DateTime
  reason        String

  // 部署案件化固有フィールド
  targetDepartment  String?   // 対象部署
  assignedTo        String?   // 担当リーダーID
  meetingScheduled  DateTime? // ミーティング予定日
  meetingCompleted  Boolean?  // ミーティング完了フラグ
  meetingOutcome    String?   // ミーティング結果
}
```

---

## 📊 データベース要件まとめ

### 既存テーブル（使用中）✅

#### Post テーブル
```prisma
model Post {
  id                      String    @id @default(cuid())
  content                 String
  author                  User      @relation(fields: [authorId], references: [id])
  authorId                String

  // 議題管理
  agendaLevel             String?   // 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA'
  agendaDeadline          DateTime?
  agendaDeadlineExtensions Int?
  escalationReason        String?

  // 投票・コメント
  votes                   Json?     // { [voteType: string]: number }
  comments                Comment[]

  // タイムスタンプ
  timestamp               DateTime  @default(now())
  createdAt               DateTime? @default(now())
  lastActivityDate        DateTime?

  // その他
  proposalType            String?   // 'operational' | 'communication' | 'innovation' | 'strategic'

  // ✅ 既存フィールドで十分
}
```

#### User テーブル
```prisma
model User {
  id                  String   @id @default(cuid())
  employeeId          String   @unique
  name                String
  email               String
  department          String
  permissionLevel     Float    // 1-25

  // VoiceDrive活動
  posts               Post[]

  // ✅ 既存フィールドで十分
}
```

---

### 新規テーブル（追加推奨）🆕

#### ProposalDecision テーブル（却下・保留・部署案件化を統合管理）

```prisma
model ProposalDecision {
  id            String   @id @default(cuid())
  postId        String
  post          Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  // 決定情報
  decisionType  String   // 'reject' | 'hold' | 'department_matter' | 'level_up_approved'
  agendaLevel   String   // 決定時の議題レベル

  // 決定者情報
  decidedBy     String
  decidedByUser User     @relation(fields: [decidedBy], references: [id])
  decidedAt     DateTime @default(now())

  // 決定理由
  reason        String   // 決定理由（必須）
  notes         String?  // 追加メモ

  // 保留固有フィールド
  reviewDate    DateTime?  // 再検討予定日
  isReviewed    Boolean?   @default(false)
  reviewedAt    DateTime?
  reviewedBy    String?
  reviewOutcome String?    // 'approved' | 'rejected' | 'extended'

  // 部署案件化固有フィールド
  targetDepartment  String?   // 対象部署
  assignedTo        String?   // 担当リーダーID
  meetingScheduled  DateTime? // ミーティング予定日
  meetingCompleted  Boolean?  @default(false)
  meetingOutcome    String?   // ミーティング結果

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([postId])
  @@index([decidedBy])
  @@index([decisionType])
  @@index([agendaLevel])
}
```

**テーブル設計の理由:**
1. **統合管理:** 却下・保留・部署案件化を1つのテーブルで管理
2. **履歴保持:** 複数回の決定履歴を保持可能
3. **監査対応:** 誰が・いつ・なぜ決定したかを完全記録
4. **柔軟性:** 新しい決定タイプの追加が容易
5. **クエリ効率:** decisionTypeでフィルタリング可能

---

### Post テーブル追加フィールド（オプション）

```prisma
model Post {
  // 既存フィールド...

  // 議題候補マーク（オプション）
  isAgendaCandidate   Boolean?   @default(false)
  markedAsCandidateBy String?    // マークした人のID
  markedAsCandidateAt DateTime?  // マーク日時

  // 昇格情報（オプション）
  escalatedBy         String?    // 昇格承認者ID
  escalatedAt         DateTime?  // 昇格日時

  // リレーション
  decisions           ProposalDecision[]
}
```

---

## 🔄 データフロー図

### フロー1: 議題レベルアップ承認

```
[責任者] → [ProposalManagementPage]
            ↓
            [handleApprovalLevelUp()]
            ↓
            POST /api/agenda/{postId}/escalate
            {
              reason: "スコア50点達成、部署議題へ昇格"
              userId: "user123"
            }
            ↓
            [API Handler]
            ↓
            Post.update({
              agendaLevel: 'DEPT_AGENDA',
              escalationReason: "...",
              escalatedBy: "user123",
              escalatedAt: new Date()
            })
            ↓
            ProposalDecision.create({
              decisionType: 'level_up_approved',
              reason: "...",
              decidedBy: "user123"
            })
```

---

### フロー2: 却下処理（新規実装）

```
[責任者] → [ProposalAnalysisCard]
            ↓
            [Reject Button] → [Modal入力]
            ↓
            [handleReject(post, feedback)]
            ↓
            POST /api/agenda/{postId}/reject
            {
              feedback: "実現困難なため却下",
              userId: "user123",
              agendaLevel: "DEPT_REVIEW"
            }
            ↓
            [API Handler - 新規実装必要]
            ↓
            ProposalDecision.create({
              decisionType: 'reject',
              postId: post.id,
              agendaLevel: 'DEPT_REVIEW',
              decidedBy: "user123",
              reason: "実現困難なため却下"
            })
            ↓
            [投稿者へ通知] ← Notification.create()
```

---

### フロー3: 保留処理（新規実装）

```
[責任者] → [ProposalAnalysisCard]
            ↓
            [Hold Button] → [Modal入力]
            ↓
            [handleHold(post, feedback)]
            ↓
            POST /api/agenda/{postId}/hold
            {
              feedback: "追加情報が必要",
              userId: "user123",
              agendaLevel: "FACILITY_AGENDA",
              reviewDate: "2025-11-15"
            }
            ↓
            [API Handler - 新規実装必要]
            ↓
            ProposalDecision.create({
              decisionType: 'hold',
              postId: post.id,
              agendaLevel: 'FACILITY_AGENDA',
              decidedBy: "user123",
              reason: "追加情報が必要",
              reviewDate: new Date("2025-11-15")
            })
            ↓
            [期限通知スケジュール] ← NotificationSchedule.create()
```

---

### フロー4: 部署案件化（新規実装）

```
[責任者] → [ProposalAnalysisCard]
            ↓
            [Department Matter Button] → [Modal入力]
            ↓
            [handleDepartmentMatter(post, feedback)]
            ↓
            POST /api/agenda/{postId}/department-matter
            {
              feedback: "部署内で詳細検討が必要",
              userId: "user123",
              agendaLevel: "DEPT_REVIEW",
              targetDepartment: "内科",
              assignedTo: "dept_leader_id"
            }
            ↓
            [API Handler - 新規実装必要]
            ↓
            ProposalDecision.create({
              decisionType: 'department_matter',
              postId: post.id,
              agendaLevel: 'DEPT_REVIEW',
              decidedBy: "user123",
              reason: "部署内で詳細検討が必要",
              targetDepartment: "内科",
              assignedTo: "dept_leader_id"
            })
            ↓
            [部署リーダーへ通知] ← Notification.create()
```

---

## 🎯 実装優先度

### 優先度 HIGH 🔴（即座に実装推奨）

1. **ProposalDecision テーブル作成**
   - 却下・保留・部署案件化の統合管理
   - schema.prisma に追加
   - マイグレーション実行

2. **却下API実装**
   - `POST /api/agenda/{postId}/reject`
   - ProposalDecisionレコード作成
   - 投稿者への通知

3. **保留API実装**
   - `POST /api/agenda/{postId}/hold`
   - ProposalDecisionレコード作成
   - 再検討期限通知スケジュール

4. **部署案件化API実装**
   - `POST /api/agenda/{postId}/department-matter`
   - ProposalDecisionレコード作成
   - 部署リーダーへの通知

---

### 優先度 MEDIUM 🟡（機能拡張時に実装）

1. **議題候補マーク機能の永続化**
   - Post.isAgendaCandidate フィールド追加
   - マーク履歴の記録

2. **提案書データベース永続化**
   - ProposalDocumentテーブル作成（現在はメモリ管理のみ）
   - 提案書の保存・編集・提出機能

3. **決定履歴の検索・フィルタリング機能**
   - ProposalDecisionの検索API
   - 決定タイプ別の統計

---

### 優先度 LOW 🟢（将来的な機能拡張）

1. **決定理由のテンプレート機能**
   - よく使う却下理由をテンプレート化

2. **部署案件のワークフロー管理**
   - ミーティング予定・結果の詳細管理
   - ガントチャート表示

3. **AI による決定支援**
   - 過去の決定パターンから推奨アクションを提示

---

## 📋 API実装仕様（新規）

### API 1: 却下API

**エンドポイント:** `POST /api/agenda/{postId}/reject`

**リクエスト:**
```json
{
  "feedback": "実現困難なため却下します。予算不足が主な理由です。",
  "userId": "user-cuid-123",
  "agendaLevel": "DEPT_REVIEW"
}
```

**レスポンス:**
```json
{
  "success": true,
  "decision": {
    "id": "decision-cuid-456",
    "postId": "post-cuid-789",
    "decisionType": "reject",
    "agendaLevel": "DEPT_REVIEW",
    "decidedBy": "user-cuid-123",
    "decidedAt": "2025-10-21T10:30:00Z",
    "reason": "実現困難なため却下します。予算不足が主な理由です。"
  },
  "notification": {
    "id": "notif-cuid-012",
    "message": "あなたの提案「...」が却下されました"
  }
}
```

**エラーレスポンス:**
```json
{
  "success": false,
  "error": "権限不足: あなたはこの議題レベルの却下権限がありません"
}
```

---

### API 2: 保留API

**エンドポイント:** `POST /api/agenda/{postId}/hold`

**リクエスト:**
```json
{
  "feedback": "追加の予算情報が必要です。財務部に確認中。",
  "userId": "user-cuid-123",
  "agendaLevel": "FACILITY_AGENDA",
  "reviewDate": "2025-11-15T00:00:00Z"
}
```

**レスポンス:**
```json
{
  "success": true,
  "decision": {
    "id": "decision-cuid-789",
    "postId": "post-cuid-789",
    "decisionType": "hold",
    "agendaLevel": "FACILITY_AGENDA",
    "decidedBy": "user-cuid-123",
    "decidedAt": "2025-10-21T10:30:00Z",
    "reason": "追加の予算情報が必要です。財務部に確認中。",
    "reviewDate": "2025-11-15T00:00:00Z"
  },
  "notificationSchedule": {
    "id": "schedule-cuid-345",
    "scheduledFor": "2025-11-14T09:00:00Z",
    "message": "保留中の提案の再検討期限が近づいています"
  }
}
```

---

### API 3: 部署案件化API

**エンドポイント:** `POST /api/agenda/{postId}/department-matter`

**リクエスト:**
```json
{
  "feedback": "スコアは低いですが、内科では重要な課題です。部署内で詳細検討します。",
  "userId": "user-cuid-123",
  "agendaLevel": "DEPT_REVIEW",
  "targetDepartment": "内科",
  "assignedTo": "dept-leader-cuid-456"
}
```

**レスポンス:**
```json
{
  "success": true,
  "decision": {
    "id": "decision-cuid-901",
    "postId": "post-cuid-789",
    "decisionType": "department_matter",
    "agendaLevel": "DEPT_REVIEW",
    "decidedBy": "user-cuid-123",
    "decidedAt": "2025-10-21T10:30:00Z",
    "reason": "スコアは低いですが、内科では重要な課題です。部署内で詳細検討します。",
    "targetDepartment": "内科",
    "assignedTo": "dept-leader-cuid-456"
  },
  "notification": {
    "id": "notif-cuid-234",
    "recipientId": "dept-leader-cuid-456",
    "message": "新しい部署ミーティング案件が割り当てられました"
  }
}
```

---

## 🔒 権限チェック仕様

### 責任者判断アクションの権限

各アクションは`AgendaResponsibilityService.canPerformAction()`で権限チェックを実施:

```typescript
interface ActionPermission {
  allowed: boolean;
  reason?: string;  // 不許可の理由
}

// 権限チェック結果
{
  approveLevelUp: { allowed: true },
  reject: {
    allowed: false,
    reason: "投票期限が切れていません"
  },
  hold: {
    allowed: false,
    reason: "このレベルでは保留できません"
  },
  departmentMatter: {
    allowed: true
  }
}
```

**権限ルール:**

| アクション | 実行可能条件 |
|----------|------------|
| **レベルアップ承認** | 期限内外問わず、targetPermissionLevel以上 |
| **却下** | 期限切れ後のみ、targetPermissionLevel以上 |
| **保留** | 期限切れ後のみ、targetPermissionLevel以上 |
| **部署案件化** | 期限切れ後のみ、DEPT_REVIEW/DEPT_AGENDAレベルのみ、targetPermissionLevel以上 |

---

## 📊 既存テーブル利用状況

### Post テーブル

| フィールド | 使用箇所 | 用途 | ステータス |
|-----------|---------|------|----------|
| `id` | 全機能 | 投稿識別 | ✅ 使用中 |
| `content` | ProposalAnalysisCard | 投稿内容表示 | ✅ 使用中 |
| `author` | ProposalAnalysisCard | 投稿者情報表示 | ✅ 使用中 |
| `agendaLevel` | フィルタリング | 議題レベル別表示 | ✅ 使用中 |
| `agendaDeadline` | 期限管理 | 投票期限表示・期限切れ判定 | ✅ 使用中 |
| `agendaDeadlineExtensions` | 期限管理 | 延長回数表示 | ✅ 使用中 |
| `escalationReason` | レベルアップ | 昇格理由記録 | ✅ 使用中 |
| `votes` | 投票分析 | 投票数・支持率計算 | ✅ 使用中 |
| `comments` | コメント分析 | コメント分析・表示 | ✅ 使用中 |
| `timestamp` | タイムライン | 投稿日時表示 | ✅ 使用中 |
| `lastActivityDate` | タイムライン | 最終活動日時 | ✅ 使用中 |
| `proposalType` | 提案書生成 | 提案タイプ識別 | ✅ 使用中 |

---

### User テーブル

| フィールド | 使用箇所 | 用途 | ステータス |
|-----------|---------|------|----------|
| `id` | 全機能 | ユーザー識別 | ✅ 使用中 |
| `name` | 表示 | ユーザー名表示 | ✅ 使用中 |
| `department` | フィルタリング | 部署別分析 | ✅ 使用中 |
| `permissionLevel` | 権限制御 | アクセス権限判定 | ✅ 使用中 |

---

## 🎯 データ管理責任の明確化

### VoiceDrive管轄 🟢

| データ | 理由 |
|-------|------|
| **Post（投稿）** | VoiceDrive活動データ |
| **ProposalDocument（提案書）** | 投稿から自動生成されるVoiceDrive内部ドキュメント |
| **ProposalDecision（決定記録）** | 議題管理の責任者判断記録 |
| **投票・コメント** | VoiceDriveのフィードバック機能 |

### 医療システム管轄 🔵

| データ | 理由 |
|-------|------|
| **User（職員情報）** | 職員マスタ（VoiceDriveはキャッシュのみ） |
| **permissionLevel** | V3評価から算出される権限 |
| **department, facility** | 組織マスタデータ |

**原則:** VoiceDrive活動に関するデータはVoiceDriveが管理、職員・組織マスタは医療システムが管理。

---

## ✅ チェックリスト

### Phase 1: DB要件分析 ✅ 完了

- [x] ページ機能の詳細分析
- [x] 既存テーブルの使用状況確認
- [x] 新規テーブルの設計
- [x] データ管理責任の明確化
- [x] API仕様の策定
- [x] データフロー図の作成

### Phase 2: 実装準備（次のステップ）

- [ ] schema.prisma に ProposalDecision テーブル追加
- [ ] マイグレーション実行
- [ ] 却下API実装（/api/agenda/{postId}/reject）
- [ ] 保留API実装（/api/agenda/{postId}/hold）
- [ ] 部署案件化API実装（/api/agenda/{postId}/department-matter）
- [ ] フロントエンド統合（ProposalManagementPage）
- [ ] 統合テスト

---

## 📞 次のアクション

### 医療システムチームへの確認事項

特になし。VoiceDrive内部で完結する機能です。

### VoiceDriveチーム内作業

1. **DB設計レビュー**
   - ProposalDecision テーブル設計の承認
   - フィールド名・型の最終確認

2. **実装着手**
   - schema.prisma 更新
   - API実装（3エンドポイント）
   - フロントエンド統合

3. **テスト計画**
   - 却下・保留・部署案件化の各シナリオテスト
   - 権限チェックのテスト
   - 通知機能のテスト

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
ステータス: 分析完了、実装待ち
