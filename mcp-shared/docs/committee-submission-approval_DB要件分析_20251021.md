# Committee Submission Approval ページ DB要件分析

**文書番号**: DB-REQ-2025-1021-002
**作成日**: 2025年10月21日
**対象ページ**: https://voicedrive-v100.vercel.app/committee-submission-approval
**参照文書**:
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)

---

## 📋 分析サマリー

### 結論
Committee Submission Approvalページは**VoiceDrive専用機能**であり、主に以下の状況です：

- ✅ **基本機能は動作可能**: 現在のメモリベースの実装（CommitteeSubmissionService）で基本機能が動作
- 🔴 **データ永続化が必要**: ページリロードでデータが消失するため、DB実装が必須
- 🟡 **医療システム連携は限定的**: 職員情報（名前、権限レベル）のみ医療システムから取得、提出管理はVoiceDrive独自

### 🔴 重大な不足項目（即対応必要）

1. **CommitteeSubmissionRequestテーブル不足**
   - 現在はメモリ内の`Map`で管理（CommitteeSubmissionService.ts 29行目）
   - ページリロード、サーバー再起動でデータ消失
   - データベース永続化が必須

2. **ProposalDocumentテーブル不足**
   - 議題提案書本体のデータ永続化が必要
   - 現在は`ProposalDocumentGenerator`がメモリ管理
   - 投票データ、コメント分析を含む複雑な構造

3. **ProposalAuditLogテーブル不足**
   - 提案書の編集履歴、承認履歴の追跡
   - 透明性確保のための必須機能

---

## 🔍 詳細分析

### 1. ヘッダー・統計サマリー（106-139行目）

#### 表示内容
```typescript
const stats = {
  pending: requests.filter(r => r.status === 'pending').length,
  approved: requests.filter(r => r.status === 'approved').length,
  rejected: requests.filter(r => r.status === 'rejected').length
};
```

#### 必要なデータソース

| 表示項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| レビュー待ち件数 | VoiceDrive | ⚠️ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |
| 承認済み件数 | VoiceDrive | ⚠️ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |
| 却下件数 | VoiceDrive | ⚠️ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |

**評価**: 🔴 DB永続化が必須

---

### 2. フィルター機能（141-166行目）

#### 表示内容
```typescript
const [filter, setFilter] = useState<'pending' | 'all'>('pending');

if (filter === 'pending') {
  setRequests(committeeSubmissionService.getPendingRequests());
} else {
  setRequests(committeeSubmissionService.getAllRequests());
}
```

#### 必要なデータソース

| 機能 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----|--------------|-----------|--------------|------|
| レビュー待ちフィルタ | VoiceDrive | ⚠️ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |
| 全件表示フィルタ | VoiceDrive | ⚠️ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |

**評価**: 🔴 DB永続化が必須

---

### 3. リクエスト一覧表示（168-272行目）

#### 表示内容
```typescript
interface SubmissionRequest {
  id: string;
  documentId: string;
  document: ProposalDocument; // 議題提案書
  requestedBy: User;          // 提出依頼者（Level 7+）
  requestedDate: Date;
  targetCommittee: string;    // 対象委員会
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: User;          // レビュアー（Level 8+）
  reviewedDate?: Date;
  reviewNotes?: string;       // レビューコメント
}
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `id` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `documentId` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `document.title` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `document.voteAnalysis` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `document.commentAnalysis` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `requestedBy.name` | ✅ キャッシュ | ✅ マスタ | 医療システム | API/Webhook | ✅ OK |
| `requestedBy.permissionLevel` | ✅ キャッシュ | ✅ マスタ | 医療システム | API/Webhook | ✅ OK |
| `requestedDate` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `targetCommittee` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `status` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `reviewedBy.name` | ✅ キャッシュ | ✅ マスタ | 医療システム | API/Webhook | ✅ OK |
| `reviewedDate` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |
| `reviewNotes` | ❌ メモリのみ | - | VoiceDrive | DB | 🔴 **要追加** |

**評価**: 🔴 DB永続化が必須

---

### 4. 投票データ表示（206-220行目）

#### 表示内容
```typescript
// 投票データ
<div className="grid grid-cols-3 gap-4 mb-4 bg-gray-900/30 rounded-lg p-4">
  <div>
    <div className="text-xs text-gray-400">総投票数</div>
    <div className="text-xl font-bold text-white">{request.document.voteAnalysis.totalVotes}票</div>
  </div>
  <div>
    <div className="text-xs text-gray-400">支持率</div>
    <div className="text-xl font-bold text-green-400">{request.document.voteAnalysis.supportRate}%</div>
  </div>
  <div>
    <div className="text-xs text-gray-400">コメント数</div>
    <div className="text-xl font-bold text-blue-400">{request.document.commentAnalysis.totalComments}件</div>
  </div>
</div>
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| `voteAnalysis.totalVotes` | VoiceDrive | ❌ メモリのみ | `ProposalDocument` | 🔴 **要追加** |
| `voteAnalysis.supportRate` | VoiceDrive | ❌ メモリのみ | `ProposalDocument` | 🔴 **要追加** |
| `commentAnalysis.totalComments` | VoiceDrive | ❌ メモリのみ | `ProposalDocument` | 🔴 **要追加** |

**評価**: 🔴 ProposalDocumentテーブルが必須

---

### 5. レビュー情報表示（222-238行目）

#### 表示内容
```typescript
{request.reviewedBy && (
  <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
    <div className="text-xs text-gray-400 mb-1">レビュー結果</div>
    <div className="text-sm text-white">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium">{request.reviewedBy.name}</span>
        <span className="text-gray-500">
          {request.reviewedDate && new Date(request.reviewedDate).toLocaleString('ja-JP')}
        </span>
      </div>
      {request.reviewNotes && (
        <div className="text-gray-300 mt-2">{request.reviewNotes}</div>
      )}
    </div>
  </div>
)}
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| `reviewedBy` (User) | VoiceDrive | ✅ 既存 | `User` | ✅ OK |
| `reviewedDate` | VoiceDrive | ❌ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |
| `reviewNotes` | VoiceDrive | ❌ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |

**評価**: 🔴 CommitteeSubmissionRequestテーブルが必須

---

### 6. アクションボタン（240-268行目）

#### 機能
- **提案書を確認**: ProposalDocumentEditorページへ遷移
- **承認して提出**: `handleApprove()` → `committeeSubmissionService.approveSubmissionRequest()`
- **却下**: `handleReject()` → `committeeSubmissionService.rejectSubmissionRequest()`

#### 必要な処理

| アクション | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 承認処理 | VoiceDrive | ⚠️ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |
| 却下処理 | VoiceDrive | ⚠️ メモリのみ | `CommitteeSubmissionRequest` | 🔴 **要追加** |
| 監査ログ記録 | VoiceDrive | ❌ 未実装 | `ProposalAuditLog` | 🔴 **要追加** |

**評価**: 🔴 DB永続化とログ記録が必須

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. CommitteeSubmissionRequest（委員会提出リクエスト）**

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

**理由**:
- CommitteeSubmissionApprovalPageの全機能に必須
- 現在はメモリ内Mapで管理されており、永続化されない
- Level 7+からLevel 8+への提出承認フローのコア機能

**影響範囲**:
- CommitteeSubmissionApprovalPage: 全機能（106-272行目）
- CommitteeSubmissionService: 全メソッド

---

**B. ProposalDocument（議題提案書）**

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

**理由**:
- 議題提案書の本体データを永続化
- 投票データ、コメント分析を含む複雑な構造
- 委員会提出フローの中核データ

**影響範囲**:
- CommitteeSubmissionApprovalPage: 投票データ表示（206-220行目）
- ProposalDocumentGenerator: 全機能
- ProposalDocumentEditorPage: 全機能

---

**C. ProposalAuditLog（議題提案書監査ログ）**

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

**理由**:
- 提案書の編集履歴、承認・却下履歴を記録
- 透明性確保、不正防止のための必須機能
- Level 7+, Level 8+の操作を全て記録

**影響範囲**:
- CommitteeSubmissionService: 承認・却下処理
- ProposalDocumentGenerator: 編集・提出処理

---

#### 🟡 優先度: 中（推奨）

**D. CommitteeInfoテーブル拡張（既存テーブル）**

現在のschema.prismaには`CommitteeInfo`が存在する可能性がありますが、以下のフィールドが必要です：

```prisma
model CommitteeInfo {
  id                  String              @id @default(cuid())
  name                String              // 委員会名
  code                String              @unique // 委員会コード
  description         String?             @db.Text
  facilityId          String?             @map("facility_id")
  category            String              // 'management' | 'safety' | 'quality' | 'ethics' | 'other'
  chairpersonId       String?             @map("chairperson_id")
  meetingFrequency    String?             @map("meeting_frequency") // 'weekly' | 'biweekly' | 'monthly' | 'quarterly'

  isActive            Boolean             @default(true) @map("is_active")
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")

  // Relations
  chairperson         User?               @relation("CommitteeChairperson", fields: [chairpersonId], references: [id])
  members             CommitteeMember[]

  @@index([facilityId])
  @@index([category])
  @@map("committee_info")
}
```

**理由**:
- `targetCommittee`フィールドの正規化
- 現在は文字列で管理されているが、マスタデータとして管理すべき

---

### 2. 医療システム側で追加が必要

**なし**

Committee Submission Approvalページは**VoiceDrive専用機能**であり、医療システム側のテーブル追加は不要です。

ただし、以下の既存データは医療システムから取得します：

| データ項目 | 医療システムのテーブル | 提供方法 |
|-----------|---------------------|---------|
| 職員基本情報（名前、部署、役職） | `Employee` | API/Webhook（既存） |
| 権限レベル | `Employee.permissionLevel` | API/Webhook（既存） |

---

## 🎯 実装優先順位

### Phase 1: 基本機能のDB永続化（2-3日）

**目標**: Committee Submission Approvalページが永続化される

1. 🔴 **CommitteeSubmissionRequestテーブル追加**
   ```bash
   npx prisma migrate dev --name add_committee_submission_request
   ```

2. 🔴 **ProposalDocumentテーブル追加**
   ```bash
   npx prisma migrate dev --name add_proposal_document
   ```

3. 🔴 **ProposalAuditLogテーブル追加**
   ```bash
   npx prisma migrate dev --name add_proposal_audit_log
   ```

4. 🔴 **CommitteeSubmissionServiceをDB対応に書き換え**
   - メモリ内Mapを削除
   - Prismaクエリに置き換え
   ```typescript
   // Before: メモリ管理
   private submissionRequests: Map<string, SubmissionRequest> = new Map();

   // After: DB管理
   public async createSubmissionRequest(...) {
     return await prisma.committeeSubmissionRequest.create({ ... });
   }
   ```

5. 🔴 **ProposalDocumentGeneratorをDB対応に書き換え**
   - メモリ内Mapを削除
   - Prismaクエリに置き換え

**このPhaseで動作する機能**:
- ✅ 提出リクエスト作成（Level 7+）
- ✅ レビュー待ち一覧表示（Level 8+）
- ✅ 承認・却下処理（Level 8+）
- ✅ データ永続化（ページリロードでも消えない）

---

### Phase 2: 監査ログと透明性強化（1-2日）

**目標**: 全ての操作が記録され、透明性が確保される

1. 🟡 **ProposalAuditLogの記録処理実装**
   ```typescript
   // 提出リクエスト作成時
   await prisma.proposalAuditLog.create({
     data: {
       documentId,
       userId: requestedBy.id,
       userName: requestedBy.name,
       userLevel: requestedBy.permissionLevel,
       action: 'submitted',
       details: `委員会提出リクエスト作成: ${targetCommittee}`,
       timestamp: new Date()
     }
   });

   // 承認時
   await prisma.proposalAuditLog.create({
     data: {
       documentId,
       userId: approver.id,
       userName: approver.name,
       userLevel: approver.permissionLevel,
       action: 'approved',
       details: notes,
       timestamp: new Date()
     }
   });
   ```

2. 🟡 **監査ログ表示機能の追加**
   - ProposalDocumentEditorページに監査ログタブを追加
   - 誰が、いつ、何をしたかを表示

**このPhaseで動作する機能**:
- ✅ 全操作の記録
- ✅ 監査ログの閲覧
- ✅ 不正操作の検知

---

### Phase 3: CommitteeInfo正規化（1日）

**目標**: 委員会マスタデータの整備

1. 🟡 **CommitteeInfoテーブルの確認・拡張**
   - 既存テーブルがあれば確認
   - なければ新規作成

2. 🟡 **targetCommitteeの参照整合性追加**
   ```prisma
   model CommitteeSubmissionRequest {
     // ... 既存フィールド
     targetCommitteeId String?             @map("target_committee_id")
     targetCommittee   CommitteeInfo?      @relation(fields: [targetCommitteeId], references: [id])
   }
   ```

**このPhaseで動作する機能**:
- ✅ 委員会マスタ管理
- ✅ 参照整合性の確保
- ✅ 委員会情報の一元管理

---

## 📊 データフロー図

### 現在の状態（Phase 0 - メモリ管理）

```
CommitteeSubmissionApprovalPage
  ↓ 表示
CommitteeSubmissionService (メモリ内Map)
  ├─ submissionRequests: Map<string, SubmissionRequest>
  └─ ProposalDocumentGenerator (メモリ内Map)
       └─ documents: Map<string, ProposalDocument>

⚠️ サーバー再起動でデータ消失
```

### Phase 1完了後（DB永続化）

```
CommitteeSubmissionApprovalPage
  ↓ 表示
CommitteeSubmissionService (DB管理)
  ↓ Prismaクエリ
┌─────────────────────────────────────────────┐
│            VoiceDrive Database              │
│                                             │
│  CommitteeSubmissionRequest                 │
│    ├─ id, documentId, requestedById        │
│    ├─ targetCommittee, status              │
│    ├─ reviewedById, reviewedDate           │
│    └─ reviewNotes                           │
│                                             │
│  ProposalDocument                           │
│    ├─ id, postId, title                    │
│    ├─ voteAnalysis (JSON)                  │
│    ├─ commentAnalysis (JSON)               │
│    └─ status, targetCommittee              │
│                                             │
│  ProposalAuditLog                           │
│    ├─ id, documentId, userId               │
│    ├─ action, timestamp                    │
│    └─ details                               │
└─────────────────────────────────────────────┘
  ↑ 職員情報取得
┌─────────────────────────────────────────────┐
│      医療職員管理システム (既存API)          │
│                                             │
│  Employee                                   │
│    ├─ name, department, position           │
│    └─ permissionLevel                       │
└─────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### VoiceDrive側作業

#### Phase 1: DB永続化
- [ ] **CommitteeSubmissionRequestテーブル追加**
  - [ ] schema.prismaに定義追加
  - [ ] マイグレーション実行
  - [ ] Relationの動作確認
- [ ] **ProposalDocumentテーブル追加**
  - [ ] schema.prismaに定義追加
  - [ ] マイグレーション実行
  - [ ] JSON型フィールドの動作確認
- [ ] **ProposalAuditLogテーブル追加**
  - [ ] schema.prismaに定義追加
  - [ ] マイグレーション実行
- [ ] **CommitteeSubmissionServiceリファクタリング**
  - [ ] メモリ内Map削除
  - [ ] Prismaクエリ実装
  - [ ] 単体テスト実装
- [ ] **ProposalDocumentGeneratorリファクタリング**
  - [ ] メモリ内Map削除
  - [ ] Prismaクエリ実装
  - [ ] 単体テスト実装
- [ ] **CommitteeSubmissionApprovalPageの動作確認**
  - [ ] リクエスト一覧表示
  - [ ] 承認・却下処理
  - [ ] データ永続化確認

#### Phase 2: 監査ログ
- [ ] **ProposalAuditLog記録処理実装**
  - [ ] 提出リクエスト作成時
  - [ ] 承認時
  - [ ] 却下時
- [ ] **監査ログ表示機能**
  - [ ] ProposalDocumentEditorページに追加
  - [ ] タイムライン表示

#### Phase 3: 正規化
- [ ] **CommitteeInfoテーブル確認・拡張**
- [ ] **参照整合性追加**
- [ ] **既存データ移行**

### テスト
- [ ] 提出リクエスト作成の統合テスト
- [ ] 承認・却下処理の統合テスト
- [ ] データ永続化の検証
- [ ] 監査ログ記録の検証
- [ ] パフォーマンステスト（100件のリクエスト）
- [ ] E2Eテスト（CommitteeSubmissionApprovalPage全機能）

---

## 🔗 関連ドキュメント

- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)
- [committee-submission-approval暫定マスターリスト_20251021.md](./committee-submission-approval暫定マスターリスト_20251021.md)

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
次回レビュー: Phase 1実装後
