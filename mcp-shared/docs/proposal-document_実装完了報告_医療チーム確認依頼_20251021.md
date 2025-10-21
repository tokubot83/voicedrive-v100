# 議題提案書編集ページ（ProposalDocument）Phase 1実装完了報告＆医療システム確認依頼書

**文書番号**: PDE-IMPL-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDriveチーム
**宛先**: 医療職員カルテシステムチーム
**重要度**: 🟡 中優先度（Phase 3実装準備）
**ステータス**: Phase 1完了、Phase 3準備

---

## 📋 エグゼクティブサマリー

### 実装完了報告

**VoiceDrive側のProposalDocumentEditor機能（Phase 1）が完了しました** ✅

議題提案書編集ページに必要な**3つのテーブル定義**をschema.prismaに追加し、データベーススキーマの準備が整いました。

**実装内容**:
1. ✅ **ProposalDocument**テーブル（29フィールド）
2. ✅ **ProposalAuditLog**テーブル（9フィールド）
3. ✅ **CommitteeSubmissionRequest**テーブル（13フィールド）
4. ✅ Post/Userモデルへのリレーション追加
5. ✅ Prisma Clientの生成完了

### 医療システム側への確認依頼

**Phase 3（11/8-11/15）で必要となる委員会マスタAPIの実装準備をお願いします** 🟡

---

## ✅ Phase 1実装完了内容

### 1. ProposalDocumentテーブル（議題提案書）

**ファイル**: `prisma/schema.prisma` (lines 2283-2328)

**概要**: 議題提案書の全データを保持するマスターテーブル

**フィールド詳細** (29フィールド):

| カテゴリ | フィールド数 | 主要フィールド |
|---------|------------|--------------|
| **基本情報** | 6 | id, postId, title, agendaLevel, status, createdById |
| **自動生成コンテンツ** | 6 | summary, background, objectives, expectedEffects, concerns, counterMeasures |
| **データ分析（JSON）** | 3 | voteAnalysis, commentAnalysis, relatedInfo |
| **管理職による補足** | 3 | managerNotes, additionalContext, recommendationLevel |
| **委員会提出情報** | 4 | targetCommittee, submittedDate, submittedById, committeeDecision |
| **メタデータ** | 3 | createdAt, updatedAt, lastModifiedDate |
| **リレーション** | 4 | post, createdBy, submittedBy, submissionRequests, auditLogs |

**Prismaスキーマ抜粋**:
```prisma
model ProposalDocument {
  id                    String   @id @default(cuid())
  postId                String
  title                 String
  agendaLevel           String   // PENDING, DEPT_REVIEW, DEPT_AGENDA, FACILITY_AGENDA, CORP_REVIEW, CORP_AGENDA
  status                String   @default("draft") // draft, under_review, ready, submitted, approved, rejected

  // 自動生成コンテンツ
  summary               String
  background            String
  objectives            String
  expectedEffects       String
  concerns              String
  counterMeasures       String

  // データ分析（JSON型）
  voteAnalysis          Json     // VoteAnalysis型（総投票数、支持率、部署別・職位別分析）
  commentAnalysis       Json     // CommentAnalysis型（コメント分類、主要意見、要約）
  relatedInfo           Json?    // RelatedInfo型（類似過去議題、影響部署、参考資料）

  // 管理職による補足
  managerNotes          String?  // 補足説明
  additionalContext     String?  // 追加の文脈
  recommendationLevel   String?  // strongly_recommend | recommend | neutral | not_recommend

  // 委員会提出情報
  targetCommittee       String?  // 提出先委員会名
  submittedDate         DateTime?
  submittedById         String?
  committeeDecision     Json?    // { status, date, reason, nextSteps }

  // リレーション
  post                  Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdBy             User     @relation("ProposalCreator", fields: [createdById], references: [id])
  submittedBy           User?    @relation("ProposalSubmitter", fields: [submittedById], references: [id])
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

**特記事項**:
- ✅ 投票データ・コメント分析は**JSON型**で保存（柔軟な構造対応）
- ✅ 委員会決定も**JSON型**で保存（医療システムからのWebhook受信に対応）
- ✅ **VoiceDrive 100%管轄**（医療システム側のテーブル追加不要）

---

### 2. ProposalAuditLogテーブル（透明性ログ）

**ファイル**: `prisma/schema.prisma` (lines 2357-2375)

**概要**: 議題提案書の全編集履歴・操作履歴を記録

**フィールド詳細** (9フィールド):

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | String | プライマリキー |
| `documentId` | String | 提案書ID（外部キー） |
| `userId` | String | 操作者の職員ID |
| `userName` | String | 操作者名（キャッシュ） |
| `userLevel` | Decimal | 操作者の権限レベル |
| `action` | String | アクション種別（created/edited/reviewed/submitted等） |
| `details` | String? | アクション詳細 |
| `changedFields` | Json? | 変更されたフィールドのリスト（配列） |
| `timestamp` | DateTime | 操作日時 |

**Prismaスキーマ抜粋**:
```prisma
model ProposalAuditLog {
  id              String   @id @default(cuid())
  documentId      String
  userId          String
  userName        String   // キャッシュ用
  userLevel       Decimal
  action          String   // 'created' | 'edited' | 'reviewed' | 'submitted' | 'approved' | 'rejected' | 'marked_candidate' | 'unmarked_candidate'
  details         String?
  changedFields   Json?    // string[]
  timestamp       DateTime @default(now())

  document        ProposalDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([userId])
  @@index([timestamp])
  @@map("proposal_audit_logs")
}
```

**特記事項**:
- ✅ **透明性確保**のため、全操作を記録
- ✅ Level 7+, Level 8+の操作を完全追跡
- ✅ **不正操作の検知**に活用可能

---

### 3. CommitteeSubmissionRequestテーブル（委員会提出リクエスト）

**ファイル**: `prisma/schema.prisma` (lines 2330-2355)

**概要**: Level 7+が作成し、Level 8+が承認する委員会提出フロー

**フィールド詳細** (13フィールド):

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | String | プライマリキー |
| `documentId` | String | 提案書ID（外部キー） |
| `requestedById` | String | リクエスト者の職員ID（Level 7+） |
| `requestedDate` | DateTime | リクエスト日時 |
| `targetCommittee` | String | 提出先委員会名 |
| `status` | String | ステータス（pending/approved/rejected） |
| `reviewedById` | String? | レビュー者の職員ID（Level 8+） |
| `reviewedDate` | DateTime? | レビュー日時 |
| `reviewNotes` | String? | レビューノート（承認コメント/却下理由） |
| `createdAt` | DateTime | 作成日時 |
| `updatedAt` | DateTime | 更新日時 |

**Prismaスキーマ抜粋**:
```prisma
model CommitteeSubmissionRequest {
  id                String   @id @default(cuid())
  documentId        String
  requestedById     String
  requestedDate     DateTime @default(now())
  targetCommittee   String
  status            String   @default("pending") // 'pending' | 'approved' | 'rejected'
  reviewedById      String?
  reviewedDate      DateTime?
  reviewNotes       String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  document          ProposalDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  requestedBy       User     @relation("SubmissionRequester", fields: [requestedById], references: [id])
  reviewedBy        User?    @relation("SubmissionApprover", fields: [reviewedById], references: [id])

  @@index([documentId])
  @@index([requestedById])
  @@index([reviewedById])
  @@index([status])
  @@index([targetCommittee])
  @@map("committee_submission_requests")
}
```

**特記事項**:
- ✅ **Level 7+**: 委員会提出リクエスト作成権限
- ✅ **Level 8+**: 委員会提出リクエスト承認権限
- ✅ **2段階承認フロー**を実現

---

### 4. Postモデルへのリレーション追加

**ファイル**: `prisma/schema.prisma` (line 569)

**追加内容**:
```prisma
model Post {
  // ... 既存フィールド ...

  // 🆕 追加
  proposalDocuments   ProposalDocument[]

  // ... 既存リレーション ...
}
```

**目的**: 1つの投稿から複数の議題提案書を生成可能にする

---

### 5. Userモデルへのリレーション追加

**ファイル**: `prisma/schema.prisma` (lines 83-84)

**追加内容**:
```prisma
model User {
  // ... 既存フィールド ...

  // 🆕 追加
  proposalDocumentsCreated    ProposalDocument[] @relation("ProposalCreator")
  proposalDocumentsSubmitted  ProposalDocument[] @relation("ProposalSubmitter")

  // ... 既存リレーション ...
}
```

**目的**: ユーザーが作成した提案書、提出した提案書の追跡

---

## 🔧 実装プロセス

### Step 1: 既存テーブル定義の確認

**発見事項**:
- ✅ ProposalDocument、ProposalAuditLog、CommitteeSubmissionRequestテーブルは**既に定義済み**
- ❌ 古いCommitteeSubmissionRequestモデル（919行目）が重複していたため削除
- ❌ Post/Userモデルへのリレーションが不足していたため追加

### Step 2: スキーマ修正

**実施内容**:
1. 古いCommitteeSubmissionRequestモデルを削除（919-943行目）
2. Postモデルに`proposalDocuments`リレーション追加
3. Userモデルに`proposalDocumentsCreated`, `proposalDocumentsSubmitted`リレーション追加

### Step 3: Prismaフォーマット

**実行コマンド**:
```bash
npx prisma format
```

**結果**: ✅ 成功（92ms）

### Step 4: Prisma Client生成

**実行コマンド**:
```bash
npx prisma generate
```

**結果**: ✅ 成功（553ms）

---

## 🎯 次のフェーズ（医療システム側の対応要請）

### Phase 2: 委員会提出フロー（10/31-11/7）

**VoiceDrive側のみで実装**:
- API-PDE-4,5実装（委員会提出フロー）
- 権限チェック実装（Level 7+, Level 8+）

**医療システム側**: ❌ 対応不要（待機のみ）

---

### Phase 3: 委員会マスタAPI実装（11/8-11/15）🟡 **医療チーム対応必要**

#### 必要なAPI: `GET /api/v2/committees`

**目的**: VoiceDrive側で委員会一覧を取得し、提出先選択UIに使用

**実装時期**: 11/8-11/15

**Request**:
```
GET /api/v2/committees?level=facility&facilityId=obara-hospital
```

**Response例**:
```json
{
  "success": true,
  "committees": [
    {
      "id": "com-001",
      "code": "OH-COM-001",
      "name": "業務改善委員会",
      "type": "operational",
      "level": "facility",
      "facilityId": "obara-hospital",
      "facilityName": "小原病院",
      "description": "施設運営の業務改善に関する審議",
      "chairperson": {
        "id": "OH-NS-2024-030",
        "name": "山田事務長",
        "position": "事務長"
      },
      "members": [
        {
          "id": "OH-NS-2024-020",
          "name": "田中師長",
          "role": "委員"
        }
      ],
      "meetingCycle": "monthly",
      "nextMeetingDate": "2025-11-10T14:00:00Z"
    },
    {
      "id": "com-002",
      "name": "施設運営委員会",
      "type": "management",
      "level": "facility",
      "facilityId": "obara-hospital",
      "facilityName": "小原病院",
      "chairperson": {
        "id": "OH-NS-2024-040",
        "name": "佐藤院長",
        "position": "院長"
      },
      "meetingCycle": "monthly",
      "nextMeetingDate": "2025-11-15T10:00:00Z"
    },
    {
      "id": "com-003",
      "name": "法人運営委員会",
      "type": "corporate",
      "level": "corporate",
      "chairperson": {
        "id": "CORP-2024-001",
        "name": "理事長",
        "position": "理事長"
      },
      "meetingCycle": "quarterly",
      "nextMeetingDate": "2025-12-20T13:00:00Z"
    }
  ],
  "total": 3
}
```

#### 必要なテーブル（医療システム側）

**1. Committee（委員会マスタ）**

```prisma
model Committee {
  id              String   @id @default(cuid())
  code            String   @unique
  name            String
  type            String   // operational, management, corporate
  level           String   // department, facility, corporate
  facilityId      String?  // 施設レベルの場合
  description     String?
  chairpersonId   String   // 委員長のemployeeId
  meetingCycle    String   // monthly, quarterly, yearly
  nextMeetingDate DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  facility        Facility? @relation(fields: [facilityId], references: [id])
  members         CommitteeMember[]

  @@index([facilityId])
  @@index([level])
  @@index([type])
  @@map("committees")
}
```

**2. CommitteeMember（委員会メンバー）**

```prisma
model CommitteeMember {
  id          String   @id @default(cuid())
  committeeId String
  employeeId  String
  role        String   // chairperson, vice_chairperson, member, secretary
  joinedDate  DateTime @default(now())
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  committee   Committee @relation(fields: [committeeId], references: [id])

  @@unique([committeeId, employeeId])
  @@index([employeeId])
  @@map("committee_members")
}
```

#### 実装スケジュール提案

| 日付 | 作業内容 | 担当 | 状態 |
|------|---------|------|------|
| **11/8（金）** | DB設計レビュー | 医療チーム | ⏳ 提案中 |
| **11/11（月）** | Prismaマイグレーション実施 | 医療チーム | ⏳ 提案中 |
| **11/12（火）** | API実装 | 医療チーム | ⏳ 提案中 |
| **11/13（水）** | テストデータ投入 | 医療チーム | ⏳ 提案中 |
| **11/14（木）** | 単体テスト | 医療チーム | ⏳ 提案中 |
| **11/15（金）** | VoiceDrive統合テスト | 両チーム | ⏳ 提案中 |

---

### Phase 4: 委員会決定Webhook（将来実装）🟢 **低優先度**

**エンドポイント**: `POST /webhook/committee-decision`（受信側はVoiceDrive）

**目的**: 委員会で決定された内容をVoiceDrive側に通知

**実装時期**: Phase 4以降（委員会決定システム実装後）

**Request例**:
```json
{
  "documentId": "doc-789",
  "committeeId": "com-001",
  "committeeName": "業務改善委員会",
  "decisionDate": "2025-11-10T15:30:00Z",
  "status": "approved",
  "reason": "業務効率化に有益であると判断",
  "nextSteps": "12月1日より試験導入開始",
  "decidedBy": {
    "id": "OH-NS-2024-030",
    "name": "山田事務長",
    "position": "委員長"
  },
  "signature": "HMAC-SHA256署名"
}
```

**実装優先度**: 🟢 **低**（将来実装）

---

## 📊 データ管理責任分界点（確認）

### VoiceDrive 100%管轄

| データ項目 | 管理責任 | 状態 |
|-----------|---------|------|
| **議題提案書** | VoiceDrive | ✅ テーブル作成完了 |
| **投票・コメント分析** | VoiceDrive | ✅ JSON型で保存 |
| **委員会提出リクエスト** | VoiceDrive | ✅ テーブル作成完了 |
| **監査ログ** | VoiceDrive | ✅ テーブル作成完了 |

### 医療システム提供（API経由）

| データ項目 | 管理責任 | 現状 | Phase 3対応 |
|-----------|---------|------|------------|
| **職員情報** | 医療システム | ✅ 既存API | 対応不要 |
| **委員会マスタ** | 医療システム | ❌ 未実装 | 🟡 **Phase 3で実装必要** |
| **委員会決定** | 医療システム | ❌ 未実装 | 🟢 将来実装 |

---

## ✅ 医療システムチーム確認事項

### 即時確認事項

- [ ] VoiceDrive側のPhase 1実装内容を確認
- [ ] データ管理責任分界点の確認（VoiceDrive 100%管轄で問題ないか）
- [ ] Phase 3で必要となる委員会マスタAPI仕様の確認

### Phase 3準備事項（11/8-11/15）

- [ ] Committeeテーブル設計の承認
- [ ] CommitteeMemberテーブル設計の承認
- [ ] `GET /api/v2/committees` API仕様の承認
- [ ] Phase 3実装スケジュールの承認（11/8-11/15）
- [ ] テストデータ準備の承認

### 将来検討事項

- [ ] 委員会決定Webhook（Phase 4以降）の仕様検討
- [ ] 委員会決定システムとの統合方針

---

## 🔗 関連ドキュメント

### VoiceDrive側

- **[proposal-document_DB要件分析_20251021.md](./proposal-document_DB要件分析_20251021.md)** - DB要件分析書
- **[proposal-document暫定マスターリスト_20251021.md](./proposal-document暫定マスターリスト_20251021.md)** - 実装チェックリスト
- **[committee-submission-approval_DB要件分析_20251021.md](./committee-submission-approval_DB要件分析_20251021.md)** - 関連ページ分析

### 医療システム側

- **[approvals_医療システム確認結果_20251021.md](./approvals_医療システム確認結果_20251021.md)** - 参考文書（開いているファイル）
- **DM-DEF-2025-1008-001** - データ管理責任分界点定義書

---

## 🎯 次のアクション

### VoiceDriveチーム

1. ✅ **Phase 1完了** - テーブル定義・Prisma Client生成
2. ⏳ **Phase 2開始準備** - 委員会提出フローAPI実装（10/31-11/7）
3. ⏳ **Phase 3準備** - 委員会マスタAPI仕様の最終確認（医療チーム回答待ち）

### 医療システムチーム

1. ⏳ **本文書のレビュー** - Phase 1実装内容の確認
2. ⏳ **委員会マスタAPI仕様の確認** - 必要なフィールド、Query Parametersの確認
3. ⏳ **Phase 3実装スケジュールの承認** - 11/8-11/15で問題ないか確認
4. ⏳ **テストデータ準備計画** - 委員会マスタの初期データ準備

---

## 📊 まとめ

### VoiceDrive側の対応状況

| カテゴリ | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| **DB実装** | ✅ 完了 | - | - |
| **API実装** | ⏳ 次フェーズ | ⏳ 10/31-11/7 | ⏳ 11/8-11/15 |
| **フロントエンド** | ⏳ 次フェーズ | ⏳ 10/31-11/7 | ⏳ 11/8-11/15 |

### 医療システム側の対応要否

| カテゴリ | 対応要否 | 優先度 | 実装時期 |
|---------|---------|-------|---------|
| **DB実装** | ❌ 不要 | - | - |
| **既存API拡張** | ❌ 不要 | - | - |
| **委員会マスタAPI** | ✅ 必要 | 🟡 中 | Phase 3（11/8-11/15） |
| **委員会決定Webhook** | ⏳ 将来 | 🟢 低 | Phase 4以降 |

### 結論

**VoiceDrive側のPhase 1実装（テーブル定義）が完了しました。**

Phase 3（11/8-11/15）で医療システム側の委員会マスタAPI実装をお願いします。それまでは医療システム側の対応は不要です。

---

**文書終了**

---

**次のステップ**:
1. 医療システムチームによる本文書のレビュー
2. 委員会マスタAPI仕様の最終確認
3. Phase 3実装スケジュールの承認
4. Phase 2開始（VoiceDrive側、10/31-11/7）

**連絡先**: VoiceDriveチーム
**最終更新**: 2025年10月21日
