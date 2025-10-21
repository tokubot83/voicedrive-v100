# Committee Submission Approval 暫定マスターリスト

**作成日**: 2025年10月21日
**対象ページ**: CommitteeSubmissionApprovalPage (`src/pages/CommitteeSubmissionApprovalPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- Committee Submission Approvalページは**VoiceDrive専用機能**
- Level 7+が作成した議題提案書を、Level 8+が委員会に提出承認する機能
- 現在はメモリベースで動作（CommitteeSubmissionService）
- ページリロード、サーバー再起動でデータ消失

### 必要な対応
1. **医療システムからのAPI提供**: 0件（既存APIのみ使用）
2. **医療システムからのWebhook通知**: 0件（既存Webhookのみ使用）
3. **VoiceDrive DB追加**: テーブル3件
4. **確認事項**: 0件

### 優先度
**Priority: HIGH（グループ2: 管理職専用機能）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（0件）

**なし**

Committee Submission Approvalページで必要な医療システムデータは以下のみ：
- 職員基本情報（名前、部署、役職）
- 権限レベル

これらは**既存のAPI**（PersonalStation用に作成済み）で取得可能です。

#### 既存API利用
```
GET /api/v2/employees/{employeeId}
```

**レスポンス（必要なフィールドのみ）**:
```json
{
  "employeeId": "EMP2024001",
  "name": "山田 太郎",
  "department": "外科",
  "position": "主任",
  "permissionLevel": 7.0
}
```

---

### B. Webhook通知依頼（0件）

**なし**

Committee Submission Approvalページで必要なWebhook通知は以下のみ：
- 職員情報更新通知（名前、部署、権限レベル変更時）

これは**既存のWebhook**（PersonalStation用に作成済み）で対応可能です。

#### 既存Webhook利用
```
POST https://voicedrive.ai/api/webhooks/employee-updated
```

**ペイロード例**:
```json
{
  "eventType": "employee.updated",
  "timestamp": "2025-10-21T10:30:00Z",
  "employeeId": "EMP2024001",
  "changes": {
    "name": { "old": "山田 太郎", "new": "山田 花子" },
    "permissionLevel": { "old": 7.0, "new": 8.0 }
  },
  "signature": "abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// Userテーブルのキャッシュを更新（既存実装）
await prisma.user.update({
  where: { employeeId },
  data: {
    name: changes.name.new,
    permissionLevel: changes.permissionLevel.new,
    updatedAt: new Date()
  }
});
```

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### C. 新規テーブル追加（3件）

#### Table-1: CommitteeSubmissionRequest（委員会提出リクエスト）

**優先度**: 🔴 **CRITICAL**

**理由**:
- CommitteeSubmissionApprovalPageの全機能に必須
- 現在はメモリ内Mapで管理されており、永続化されない
- Level 7+からLevel 8+への提出承認フローのコア機能

**スキーマ定義**:
```prisma
model CommitteeSubmissionRequest {
  id                String                  @id @default(cuid())
  documentId        String                  @map("document_id")
  requestedById     String                  @map("requested_by_id")
  requestedDate     DateTime                @default(now()) @map("requested_date")
  targetCommittee   String                  @map("target_committee")
  status            String                  @default("pending") // 'pending' | 'approved' | 'rejected'
  reviewedById      String?                 @map("reviewed_by_id")
  reviewedDate      DateTime?               @map("reviewed_date")
  reviewNotes       String?                 @map("review_notes") @db.Text

  createdAt         DateTime                @default(now()) @map("created_at")
  updatedAt         DateTime                @updatedAt @map("updated_at")

  // Relations
  document          ProposalDocument        @relation(fields: [documentId], references: [id], onDelete: Cascade)
  requestedBy       User                    @relation("SubmissionRequester", fields: [requestedById], references: [id])
  reviewedBy        User?                   @relation("SubmissionApprover", fields: [reviewedById], references: [id])

  @@index([documentId])
  @@index([requestedById])
  @@index([reviewedById])
  @@index([status])
  @@index([targetCommittee])
  @@map("committee_submission_requests")
}
```

**使用例**:
```typescript
// Level 7+ が提出リクエスト作成
const request = await prisma.committeeSubmissionRequest.create({
  data: {
    documentId: 'doc-123',
    requestedById: currentUser.id,
    targetCommittee: '安全管理委員会',
    status: 'pending'
  },
  include: {
    document: true,
    requestedBy: true
  }
});

// Level 8+ が承認
await prisma.committeeSubmissionRequest.update({
  where: { id: request.id },
  data: {
    status: 'approved',
    reviewedById: approver.id,
    reviewedDate: new Date(),
    reviewNotes: '内容を確認しました。承認します。'
  }
});
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_committee_submission_request
```

---

#### Table-2: ProposalDocument（議題提案書）

**優先度**: 🔴 **CRITICAL**

**理由**:
- 議題提案書の本体データを永続化
- 投票データ、コメント分析を含む複雑な構造
- 委員会提出フローの中核データ

**スキーマ定義**:
```prisma
model ProposalDocument {
  id                    String                          @id @default(cuid())
  postId                String                          @map("post_id")
  title                 String
  agendaLevel           String                          @map("agenda_level") // 'department' | 'facility' | 'organization'
  createdById           String                          @map("created_by_id")
  status                String                          @default("draft") // 'draft' | 'under_review' | 'ready' | 'submitted' | 'approved' | 'rejected'

  // 提案内容
  summary               String                          @db.Text // 提案の要約
  background            String                          @db.Text // 背景・経緯
  objectives            String                          @db.Text // 目的
  expectedEffects       String                          @db.Text // 期待される効果
  concerns              String                          @db.Text // 懸念点
  counterMeasures       String                          @db.Text // 懸念への対応策

  // データ分析（JSON）
  voteAnalysis          Json                            @map("vote_analysis") // VoteAnalysis型
  commentAnalysis       Json                            @map("comment_analysis") // CommentAnalysis型
  relatedInfo           Json?                           @map("related_info") // RelatedInfo型

  // 管理職による追記
  managerNotes          String?                         @map("manager_notes") @db.Text
  additionalContext     String?                         @map("additional_context") @db.Text
  recommendationLevel   String?                         @map("recommendation_level") // 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend'

  // 委員会提出情報
  targetCommittee       String?                         @map("target_committee")
  submittedDate         DateTime?                       @map("submitted_date")
  submittedById         String?                         @map("submitted_by_id")
  committeeDecision     Json?                           @map("committee_decision") // { status, date, reason, nextSteps }

  createdAt             DateTime                        @default(now()) @map("created_at")
  updatedAt             DateTime                        @updatedAt @map("updated_at")
  lastModifiedDate      DateTime                        @updatedAt @map("last_modified_date")

  // Relations
  post                  Post                            @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdBy             User                            @relation("ProposalCreator", fields: [createdById], references: [id])
  submittedBy           User?                           @relation("ProposalSubmitter", fields: [submittedById], references: [id])

  submissionRequests    CommitteeSubmissionRequest[]
  auditLogs             ProposalAuditLog[]

  @@index([postId])
  @@index([createdById])
  @@index([status])
  @@index([agendaLevel])
  @@index([targetCommittee])
  @@map("proposal_documents")
}
```

**JSON型フィールドの構造**:

**voteAnalysis**:
```typescript
interface VoteAnalysis {
  totalVotes: number;              // 総投票数: 89
  supportRate: number;             // 支持率: 76%
  strongSupportRate: number;       // 強い支持率: 45%
  oppositionRate: number;          // 反対率: 12%
  neutralRate: number;             // 中立率: 12%

  byDepartment?: {                 // 部署別分析
    department: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];

  byPosition?: {                   // 職位別分析
    positionLevel: number;
    positionName: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];
}
```

**commentAnalysis**:
```typescript
interface CommentAnalysis {
  totalComments: number;           // 総コメント数: 34
  supportComments: number;         // 賛成コメント: 20
  concernComments: number;         // 懸念コメント: 10
  proposalComments: number;        // 提案コメント: 4

  supportSummary: string[];        // 賛成意見の要約
  concernSummary: string[];        // 懸念点の要約
  constructiveProposals: string[]; // 建設的提案

  keyComments: {                   // 主要なコメント
    content: string;
    author: string;
    type: 'support' | 'concern' | 'proposal';
    likes: number;
  }[];
}
```

**使用例**:
```typescript
// Level 7+ が議題提案書を作成
const document = await prisma.proposalDocument.create({
  data: {
    postId: 'post-123',
    title: '夜勤体制の見直し提案',
    agendaLevel: 'facility',
    createdById: currentUser.id,
    status: 'draft',
    summary: '現在の夜勤体制の問題点を解消し...',
    background: '過去3ヶ月の間に...',
    objectives: '職員の負担軽減と患者ケアの質向上',
    expectedEffects: '離職率の低下、患者満足度の向上',
    concerns: '人員配置の調整が必要',
    counterMeasures: '段階的な導入を検討',
    voteAnalysis: {
      totalVotes: 89,
      supportRate: 76,
      strongSupportRate: 45,
      oppositionRate: 12,
      neutralRate: 12
    },
    commentAnalysis: {
      totalComments: 34,
      supportComments: 20,
      concernComments: 10,
      proposalComments: 4,
      supportSummary: ['負担が軽減される', '良い提案'],
      concernSummary: ['人員不足が心配'],
      constructiveProposals: ['段階的導入を推奨'],
      keyComments: []
    }
  }
});

// 提出準備完了に変更
await prisma.proposalDocument.update({
  where: { id: document.id },
  data: {
    status: 'ready',
    managerNotes: '部署内で十分に検討しました',
    recommendationLevel: 'strongly_recommend'
  }
});
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_proposal_document
```

---

#### Table-3: ProposalAuditLog（議題提案書監査ログ）

**優先度**: 🔴 **CRITICAL**

**理由**:
- 提案書の編集履歴、承認・却下履歴を記録
- 透明性確保、不正防止のための必須機能
- Level 7+, Level 8+の操作を全て記録

**スキーマ定義**:
```prisma
model ProposalAuditLog {
  id              String            @id @default(cuid())
  documentId      String            @map("document_id")
  userId          String            @map("user_id")
  userName        String            @map("user_name")
  userLevel       Decimal           @map("user_level")
  action          String            // 'created' | 'edited' | 'reviewed' | 'submitted' | 'approved' | 'rejected' | 'marked_candidate' | 'unmarked_candidate'
  details         String?           @db.Text
  changedFields   Json?             @map("changed_fields") // string[]
  timestamp       DateTime          @default(now())

  // Relations
  document        ProposalDocument  @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([userId])
  @@index([timestamp])
  @@map("proposal_audit_logs")
}
```

**使用例**:
```typescript
// 提出リクエスト作成時のログ
await prisma.proposalAuditLog.create({
  data: {
    documentId: document.id,
    userId: requestedBy.id,
    userName: requestedBy.name,
    userLevel: requestedBy.permissionLevel,
    action: 'submitted',
    details: `委員会提出リクエスト作成: 安全管理委員会`,
    timestamp: new Date()
  }
});

// 承認時のログ
await prisma.proposalAuditLog.create({
  data: {
    documentId: document.id,
    userId: approver.id,
    userName: approver.name,
    userLevel: approver.permissionLevel,
    action: 'approved',
    details: '内容を確認しました。承認します。',
    timestamp: new Date()
  }
});

// 編集時のログ
await prisma.proposalAuditLog.create({
  data: {
    documentId: document.id,
    userId: editor.id,
    userName: editor.name,
    userLevel: editor.permissionLevel,
    action: 'edited',
    details: '提案内容を修正しました',
    changedFields: ['summary', 'objectives'],
    timestamp: new Date()
  }
});
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_proposal_audit_log
```

---

### D. 既存テーブル修正（2件）

#### Modify-1: Userテーブルにリレーション追加

**対象テーブル**: `User`

**追加リレーション**:
```prisma
model User {
  // ... 既存フィールド

  // 🆕 新規リレーション
  submissionRequestsSent      CommitteeSubmissionRequest[]  @relation("SubmissionRequester")
  submissionRequestsApproved  CommitteeSubmissionRequest[]  @relation("SubmissionApprover")
  proposalDocumentsCreated    ProposalDocument[]            @relation("ProposalCreator")
  proposalDocumentsSubmitted  ProposalDocument[]            @relation("ProposalSubmitter")
}
```

**理由**:
- CommitteeSubmissionRequestとProposalDocumentへの参照
- 既存のUserテーブルに影響なし（リレーションの追加のみ）

**マイグレーション**:
```bash
# リレーション追加（既存データに影響なし）
npx prisma migrate dev --name add_user_committee_relations
```

---

#### Modify-2: Postテーブルにリレーション追加

**対象テーブル**: `Post`

**追加リレーション**:
```prisma
model Post {
  // ... 既存フィールド

  // 🆕 新規リレーション
  proposalDocuments   ProposalDocument[]  @relation
}
```

**理由**:
- ProposalDocumentはPostから生成される
- 1つのPostから1つのProposalDocumentが作成される

**マイグレーション**:
```bash
# リレーション追加（既存データに影響なし）
npx prisma migrate dev --name add_post_proposal_relation
```

---

## ❓ 医療システムチームへの確認事項

### 確認-1: なし

Committee Submission Approvalページは**VoiceDrive専用機能**であり、医療システムチームへの確認事項はありません。

---

## 📅 想定スケジュール

### Phase 1: DB永続化（2-3日）
- **Day 1**: スキーマ定義、マイグレーション実行
- **Day 2**: CommitteeSubmissionService、ProposalDocumentGeneratorのリファクタリング
- **Day 3**: 動作確認、テスト実装

### Phase 2: 監査ログと透明性強化（1-2日）
- **Day 4**: ProposalAuditLog記録処理実装
- **Day 5**: 監査ログ表示機能実装

### Phase 3: 正規化（1日）
- **Day 6**: CommitteeInfoテーブル確認・拡張、参照整合性追加

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                  CommitteeSubmissionApprovalPage             │
│                     (Level 8+ 専用画面)                      │
│                                                               │
│  機能:                                                        │
│  - 提出リクエスト一覧表示                                      │
│  - 投票データ・コメント分析表示                                │
│  - 承認・却下処理                                            │
│  - レビューコメント記録                                       │
└─────────────────────────────────────────────────────────────┘
         │
         │ ① リクエスト一覧取得
         ▼
┌─────────────────────────────────────────────────────────────┐
│             CommitteeSubmissionService (DB対応)              │
│                                                               │
│  メソッド:                                                    │
│  - getPendingRequests(): レビュー待ち一覧                     │
│  - getAllRequests(): 全リクエスト一覧                         │
│  - approveSubmissionRequest(): 承認処理                       │
│  - rejectSubmissionRequest(): 却下処理                        │
└─────────────────────────────────────────────────────────────┘
         │
         │ ② Prismaクエリ
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    VoiceDrive Database                       │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │  CommitteeSubmissionRequest             │                │
│  │    - id, documentId, requestedById      │                │
│  │    - targetCommittee, status            │                │
│  │    - reviewedById, reviewedDate         │                │
│  │    - reviewNotes                         │                │
│  └─────────────────────────────────────────┘                │
│         │                                                     │
│         │ ③ ProposalDocument参照                            │
│         ▼                                                     │
│  ┌─────────────────────────────────────────┐                │
│  │  ProposalDocument                        │                │
│  │    - id, postId, title                  │                │
│  │    - voteAnalysis (JSON)                │                │
│  │    - commentAnalysis (JSON)             │                │
│  │    - status, targetCommittee            │                │
│  └─────────────────────────────────────────┘                │
│         │                                                     │
│         │ ④ 監査ログ記録                                     │
│         ▼                                                     │
│  ┌─────────────────────────────────────────┐                │
│  │  ProposalAuditLog                        │                │
│  │    - id, documentId, userId             │                │
│  │    - action, timestamp                  │                │
│  │    - details                             │                │
│  └─────────────────────────────────────────┘                │
│         │                                                     │
│         │ ⑤ 職員情報参照（キャッシュ）                        │
│         ▼                                                     │
│  ┌─────────────────────────────────────────┐                │
│  │  User (キャッシュ)                       │                │
│  │    - name, department, position         │                │
│  │    - permissionLevel                     │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ ⑥ Webhook通知（職員情報更新時）
         │
┌─────────────────────────────────────────────────────────────┐
│           医療職員管理システム (既存API/Webhook)              │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │  Employee                                │                │
│  │    - name, department, position         │                │
│  │    - permissionLevel                     │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  API: GET /api/v2/employees/{employeeId}                     │
│  Webhook: POST /api/webhooks/employee-updated                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### VoiceDrive側作業

#### Phase 1: DB永続化
- [ ] **schema.prismaに3テーブル追加**
  - [ ] CommitteeSubmissionRequest定義
  - [ ] ProposalDocument定義
  - [ ] ProposalAuditLog定義
- [ ] **マイグレーション実行**
  ```bash
  npx prisma migrate dev --name add_committee_submission_tables
  ```
- [ ] **CommitteeSubmissionServiceリファクタリング**
  - [ ] メモリ内Map削除
  - [ ] `createSubmissionRequest()` → Prisma実装
  - [ ] `approveSubmissionRequest()` → Prisma実装
  - [ ] `rejectSubmissionRequest()` → Prisma実装
  - [ ] `getPendingRequests()` → Prisma実装
  - [ ] `getAllRequests()` → Prisma実装
- [ ] **ProposalDocumentGeneratorリファクタリング**
  - [ ] メモリ内Map削除
  - [ ] `createDocument()` → Prisma実装
  - [ ] `getDocument()` → Prisma実装
  - [ ] `submitToCommittee()` → Prisma実装
- [ ] **単体テスト実装**
  - [ ] CommitteeSubmissionService全メソッド
  - [ ] ProposalDocumentGenerator全メソッド

#### Phase 2: 監査ログ
- [ ] **ProposalAuditLog記録処理実装**
  - [ ] 提出リクエスト作成時
  - [ ] 承認時
  - [ ] 却下時
  - [ ] 議題提案書編集時
- [ ] **監査ログ表示機能**
  - [ ] ProposalDocumentEditorページに監査ログタブ追加
  - [ ] タイムライン表示UI実装

#### Phase 3: 正規化
- [ ] **CommitteeInfoテーブル確認**
  - [ ] 既存テーブルがあれば構造確認
  - [ ] なければ新規作成
- [ ] **参照整合性追加**
  - [ ] CommitteeSubmissionRequest.targetCommitteeIdをCommitteeInfoへの外部キーに変更
- [ ] **既存データ移行**
  - [ ] 文字列のtargetCommittee → CommitteeInfoのidに変換

### テスト
- [ ] **単体テスト**
  - [ ] CommitteeSubmissionRequest CRUD
  - [ ] ProposalDocument CRUD
  - [ ] ProposalAuditLog記録
- [ ] **統合テスト**
  - [ ] 提出リクエスト作成フロー
  - [ ] 承認フロー
  - [ ] 却下フロー
- [ ] **E2Eテスト**
  - [ ] CommitteeSubmissionApprovalPage全機能
  - [ ] データ永続化確認
  - [ ] 監査ログ記録確認
- [ ] **パフォーマンステスト**
  - [ ] 100件のリクエスト一覧表示
  - [ ] 複雑なJSONクエリの性能

---

## 📝 補足資料

### 参照ドキュメント

1. **committee-submission-approval_DB要件分析_20251021.md**
   `mcp-shared/docs/committee-submission-approval_DB要件分析_20251021.md`

2. **PersonalStation暫定マスターリスト**
   `mcp-shared/docs/PersonalStation暫定マスターリスト_20251008.md`

3. **PersonalStation DB要件分析**
   `mcp-shared/docs/PersonalStation_DB要件分析_20251008.md`

### 技術スタック

**VoiceDrive**:
- SQLite (開発環境) → MySQL 8.0 (本番環境)
- Prisma ORM
- TypeScript + React
- Express.js (API Server)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js
- NestJS (API Server)

### データサイズ見積もり

**CommitteeSubmissionRequest**:
- 想定レコード数: 月50件 × 12ヶ月 = 600件/年
- 1レコードサイズ: 約500 bytes
- 年間データ量: 600 × 500 bytes = 300 KB/年

**ProposalDocument**:
- 想定レコード数: 月50件 × 12ヶ月 = 600件/年
- 1レコードサイズ: 約5 KB（JSON含む）
- 年間データ量: 600 × 5 KB = 3 MB/年

**ProposalAuditLog**:
- 想定レコード数: 1提案あたり平均10操作 × 600件 = 6,000件/年
- 1レコードサイズ: 約300 bytes
- 年間データ量: 6,000 × 300 bytes = 1.8 MB/年

**合計**: 約5 MB/年（非常に軽量）

---

**作成者**: AI (Claude Code)
**承認待ち**: なし（VoiceDrive専用機能）
**次のステップ**: schema.prisma更新 → マイグレーション実行 → サービス層リファクタリング

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-21 | 初版作成 | AI (Claude Code) |
