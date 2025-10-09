# 委員会管理ページ DB要件分析

**文書番号**: CM-DB-REQ-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**目的**: 委員会管理ページのDB要件を明確化し、医療システムとの責任分界を定義
**重要度**: 🔴 最重要
**関連文書**: データ管理責任分界点定義書_20251008.md

---

## 📋 エグゼクティブサマリー

### 背景
- 委員会管理ページは**既に実装完了**（4タブ、TypeScript型定義、Singletonサービス）
- 現在は**デモデータのみ**でDB未統合
- PersonalStation方式と同様のDB構築とAPI連携が必要

### 実装状況
- ✅ UI完全実装（[CommitteeManagementPage.tsx](src/pages/CommitteeManagementPage.tsx):840行）
- ✅ 型定義完備（[src/types/committee.ts](src/types/committee.ts):167行）
- ✅ サービス層実装（[src/services/ManagementCommitteeService.ts](src/services/ManagementCommitteeService.ts):370行）
- ❌ DB未構築（schema.prismaに委員会関連テーブル無し）
- ❌ 医療システムAPI連携未実装

### DB構築方針
1. **VoiceDrive管轄データ**: 議題、委員会、会議、承認リクエスト
2. **医療システム連携**: 職員情報（提案者、決定者、委員長等）
3. **データ管理責任**: データ管理責任分界点定義書に準拠

---

## 🎯 ページ機能分析

### タブ1: 提出承認（Submission Approval）

**画面機能**:
- 委員会提出リクエストの一覧表示
- 承認・却下アクション（Level 8+のみ）
- フィルター: 承認待ち / 全て

**必要データ**:
```typescript
SubmissionRequest {
  id: string
  proposalTitle: string              // 提案タイトル
  targetCommittee: string            // 提出先委員会
  requesterName: string              // 申請者名（医療システムから取得）
  requesterLevel: number             // 申請者権限レベル（医療システムから取得）
  requestedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string                // 承認者（医療システムから取得）
  approvedAt?: Date
  rejectionReason?: string
}
```

**データソース**:
- ✅ VoiceDrive管轄: id, proposalTitle, targetCommittee, requestedAt, status, rejectionReason
- 🔵 医療システム連携: requesterName, requesterLevel, approvedBy（API経由）

---

### タブ2: 議題一覧（Agenda List）

**画面機能**:
- 検索バー（タイトル、提案者、説明）
- フィルター: ステータス × 優先度 × 議題タイプ（3軸同時）
- 議題カード表示（詳細情報、影響部署、予算、決定メモ）

**必要データ**:
```typescript
ManagementCommitteeAgenda {
  id: string
  title: string
  agendaType: 'committee_proposal' | 'facility_policy' | 'personnel' | 'budget' | 'equipment' | 'other'
  description: string
  background: string

  // 提案元情報
  proposedBy: string                 // 提案者名（医療システムから取得）
  proposedDate: Date
  proposerDepartment: string         // 提案者部署（医療システムから取得）
  proposerId?: string                // VoiceDrive User.id

  // 関連投稿
  relatedPostId?: string             // VoiceDrive Post.id
  escalationSource?: 'voting_system' | 'department_proposal' | 'direct_submission'

  // ステータス
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred'
  priority: 'urgent' | 'high' | 'normal' | 'low'

  // 審議情報
  scheduledDate?: Date
  actualReviewDate?: Date
  decidedDate?: Date
  decidedBy?: string                 // 決定者名（医療システムから取得）
  decision?: 'approved' | 'rejected' | 'deferred'
  decisionNotes?: string

  // 影響分析
  impactDepartments: string[]        // 部署リスト（医療システムマスタ参照）
  estimatedCost?: number
  implementationPeriod?: string
  expectedEffect: string

  tags?: string[]
  createdAt: Date
  updatedAt: Date
}
```

**データソース**:
- ✅ VoiceDrive管轄:
  - 議題内容: title, description, background
  - ステータス: status, priority, decision, decisionNotes
  - 関連情報: relatedPostId, escalationSource
  - 影響分析: estimatedCost, implementationPeriod, expectedEffect
  - 日時: proposedDate, scheduledDate, actualReviewDate, decidedDate
- 🔵 医療システム連携:
  - 職員情報: proposedBy, proposerDepartment, decidedBy（API取得）
  - 部署マスタ: impactDepartments（API取得・検証）

---

### タブ3: カレンダー（Calendar）

**画面機能**:
- 月選択（前月・次月ナビゲーション、今月ボタン）
- 会議一覧（日時、会場、議題数、ステータス）
- 統計サマリー（予定会議数、審議予定議題、完了会議）

**必要データ**:
```typescript
MeetingSchedule {
  id: string
  committeeName: string              // 委員会名（CommitteeInfo参照）
  date: Date
  venue: string
  agendaCount: number                // 審議予定議題数
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

  // 拡張情報（将来）
  chairperson?: string               // 委員長名（医療システムから取得）
  participants?: string[]            // 参加者リスト
  meetingMinutes?: string            // 議事録URL
}
```

**データソース**:
- ✅ VoiceDrive管轄: id, committeeName, date, venue, agendaCount, status
- 🔵 医療システム連携: chairperson（将来実装、API取得）

---

### タブ4: 委員会一覧（Committee List）

**画面機能**:
- 委員会カード（名前、説明、メンバー数、総開催回数、審議中議題数）
- 委員長、次回開催日表示
- 「議題を見る」ボタン（議題一覧タブへ遷移＋委員会名で検索）

**必要データ**:
```typescript
CommitteeInfo {
  id: string
  name: string
  description: string
  memberCount: number
  chairperson: string                // 委員長名（医療システムから取得）
  nextMeetingDate?: Date
  totalMeetings: number
  activeAgendas: number              // 審議中議題数（集計）
}

CommitteeMember {
  id: string
  committeeId: string
  userId: string                     // VoiceDrive User.id
  name: string                       // 職員名（医療システムから取得）
  department: string                 // 部署（医療システムから取得）
  position: string                   // 役職（医療システムから取得）
  role: 'chairman' | 'vice_chairman' | 'secretary' | 'member' | 'observer'
  termStart: Date
  termEnd?: Date
  isActive: boolean
  attendanceRate: number             // 出席率（VoiceDrive計算）
}
```

**データソース**:
- ✅ VoiceDrive管轄:
  - 委員会情報: id, name, description, nextMeetingDate, totalMeetings
  - メンバー管理: role, termStart, termEnd, isActive, attendanceRate
- 🔵 医療システム連携:
  - 職員情報: chairperson, name, department, position（API取得）

---

## 📊 データ管理責任マトリクス

データ管理責任分界点定義書（808行）に基づく詳細分析:

### カテゴリ1: 委員会議題（Agenda）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 議題ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| タイトル・説明（title, description） | ✅ マスタ | - | - | VoiceDrive管轄 |
| 議題タイプ（agendaType） | ✅ マスタ | - | - | VoiceDrive定義 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive管理 |
| 優先度（priority） | ✅ マスタ | - | - | VoiceDrive判定 |
| 提案者ID（proposerId） | キャッシュ | ✅ マスタ | API | User.id参照 |
| 提案者名（proposedBy） | キャッシュ | ✅ マスタ | API | 表示用 |
| 提案者部署（proposerDepartment） | キャッシュ | ✅ マスタ | API | 表示用 |
| 決定者（decidedBy） | キャッシュ | ✅ マスタ | API | 院長・副院長等 |
| 影響部署（impactDepartments） | キャッシュ | ✅ マスタ | API | 部署マスタ検証 |
| 関連投稿（relatedPostId） | ✅ マスタ | - | - | VoiceDrive Post.id |
| 予算（estimatedCost） | ✅ マスタ | - | - | VoiceDrive入力 |
| 決定メモ（decisionNotes） | ✅ マスタ | - | - | VoiceDrive管理 |

**方針**:
- 議題の内容・ステータス・決定情報は**VoiceDriveが管轄**
- 職員情報（提案者、決定者）は**医療システムからAPI取得**してキャッシュ
- 部署情報は**医療システム部署マスタ**で検証

---

### カテゴリ2: 委員会情報（Committee）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 委員会ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| 名称・説明（name, description） | ✅ マスタ | - | - | VoiceDrive定義 |
| メンバー数（memberCount） | ✅ マスタ | - | - | VoiceDrive集計 |
| 総開催回数（totalMeetings） | ✅ マスタ | - | - | VoiceDrive集計 |
| 審議中議題（activeAgendas） | ✅ マスタ | - | - | VoiceDrive集計 |
| 委員長名（chairperson） | キャッシュ | ✅ マスタ | API | 職員名取得 |
| 次回開催日（nextMeetingDate） | ✅ マスタ | - | - | VoiceDrive管理 |

**方針**:
- 委員会の組織構成は**VoiceDriveが管轄**
- 委員長等の職員名は**医療システムからAPI取得**

---

### カテゴリ3: 委員会メンバー（CommitteeMember）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| メンバーID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| 職員ID（userId） | キャッシュ | ✅ マスタ | API | User.id参照 |
| 氏名（name） | キャッシュ | ✅ マスタ | API | 表示用 |
| 部署（department） | キャッシュ | ✅ マスタ | API | 表示用 |
| 役職（position） | キャッシュ | ✅ マスタ | API | 表示用 |
| 委員会内役割（role） | ✅ マスタ | - | - | VoiceDrive定義 |
| 任期（termStart, termEnd） | ✅ マスタ | - | - | VoiceDrive管理 |
| 出席率（attendanceRate） | ✅ マスタ | - | - | VoiceDrive集計 |

**方針**:
- メンバーの委員会内役割・任期は**VoiceDriveが管轄**
- 職員基本情報は**医療システムからAPI取得**

---

### カテゴリ4: 会議スケジュール（Meeting）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 会議ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| 委員会名（committeeName） | ✅ マスタ | - | - | CommitteeInfo参照 |
| 日時（date） | ✅ マスタ | - | - | VoiceDrive管理 |
| 会場（venue） | ✅ マスタ | - | - | VoiceDrive入力 |
| 議題数（agendaCount） | ✅ マスタ | - | - | VoiceDrive集計 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive管理 |

**方針**:
- 会議スケジュールは**VoiceDriveが完全管轄**

---

### カテゴリ5: 提出承認リクエスト（SubmissionRequest）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| リクエストID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| 提案タイトル（proposalTitle） | ✅ マスタ | - | - | VoiceDrive入力 |
| 提出先委員会（targetCommittee） | ✅ マスタ | - | - | VoiceDrive選択 |
| 申請者ID（requesterId） | キャッシュ | ✅ マスタ | API | User.id参照 |
| 申請者名（requesterName） | キャッシュ | ✅ マスタ | API | 表示用 |
| 申請者レベル（requesterLevel） | キャッシュ | ✅ マスタ | API | アクセス制御 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive管理 |
| 承認者（approvedBy） | キャッシュ | ✅ マスタ | API | 職員名取得 |
| 却下理由（rejectionReason） | ✅ マスタ | - | - | VoiceDrive入力 |

**方針**:
- 承認フロー・ステータスは**VoiceDriveが管轄**
- 職員情報は**医療システムからAPI取得**

---

## 🏗️ 必要なDBテーブル設計

### テーブル1: ManagementCommitteeAgenda（議題）

```prisma
model ManagementCommitteeAgenda {
  id                   String    @id @default(cuid())

  // 基本情報
  title                String
  agendaType           String    // 'committee_proposal' | 'facility_policy' | 'personnel' | 'budget' | 'equipment' | 'other'
  description          String
  background           String

  // 提案元情報
  proposedBy           String    // 提案者名（キャッシュ）
  proposedDate         DateTime
  proposerDepartment   String    // 提案者部署（キャッシュ）
  proposerId           String?   // User.id

  // 関連投稿
  relatedPostId        String?   // Post.id
  escalationSource     String?   // 'voting_system' | 'department_proposal' | 'direct_submission'

  // ステータス
  status               String    @default("pending") // 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred'
  priority             String    @default("normal")  // 'urgent' | 'high' | 'normal' | 'low'

  // 審議情報
  scheduledDate        DateTime?
  actualReviewDate     DateTime?
  decidedDate          DateTime?
  decidedBy            String?   // 決定者名（キャッシュ）
  decision             String?   // 'approved' | 'rejected' | 'deferred'
  decisionNotes        String?

  // 影響分析
  impactDepartments    Json      // string[] - 部署リスト
  estimatedCost        Float?
  implementationPeriod String?
  expectedEffect       String

  // その他
  tags                 Json?     // string[]

  // タイムスタンプ
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // リレーション
  proposer             User?     @relation("AgendaProposer", fields: [proposerId], references: [id])
  relatedPost          Post?     @relation("AgendaRelatedPost", fields: [relatedPostId], references: [id])

  @@index([proposerId])
  @@index([relatedPostId])
  @@index([status])
  @@index([priority])
  @@index([agendaType])
  @@index([proposedDate])
}
```

---

### テーブル2: CommitteeInfo（委員会）

```prisma
model CommitteeInfo {
  id               String             @id @default(cuid())

  // 基本情報
  name             String             @unique
  description      String

  // 統計情報
  memberCount      Int                @default(0)
  totalMeetings    Int                @default(0)
  activeAgendas    Int                @default(0)

  // 委員長情報
  chairperson      String?            // 委員長名（キャッシュ）
  chairpersonId    String?            // User.id

  // スケジュール
  nextMeetingDate  DateTime?

  // タイムスタンプ
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  // リレーション
  chairpersonUser  User?              @relation("CommitteeChairperson", fields: [chairpersonId], references: [id])
  members          CommitteeMember[]
  meetings         CommitteeMeeting[]

  @@index([name])
  @@index([chairpersonId])
}
```

---

### テーブル3: CommitteeMember（委員会メンバー）

```prisma
model CommitteeMember {
  id              String         @id @default(cuid())

  // 委員会情報
  committeeId     String

  // 職員情報
  userId          String         // User.id
  name            String         // 職員名（キャッシュ）
  department      String         // 部署（キャッシュ）
  position        String         // 役職（キャッシュ）

  // 委員会内役割
  role            String         // 'chairman' | 'vice_chairman' | 'secretary' | 'member' | 'observer'

  // 任期
  termStart       DateTime
  termEnd         DateTime?
  isActive        Boolean        @default(true)

  // 統計
  attendanceRate  Float          @default(0)

  // タイムスタンプ
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  // リレーション
  committee       CommitteeInfo  @relation(fields: [committeeId], references: [id], onDelete: Cascade)
  user            User           @relation("CommitteeMemberUser", fields: [userId], references: [id])

  @@unique([committeeId, userId])
  @@index([committeeId])
  @@index([userId])
  @@index([role])
  @@index([isActive])
}
```

---

### テーブル4: CommitteeMeeting（会議スケジュール）

```prisma
model CommitteeMeeting {
  id              String         @id @default(cuid())

  // 委員会情報
  committeeId     String
  committeeName   String         // 委員会名（キャッシュ）

  // 日時・会場
  date            DateTime
  venue           String

  // 議題情報
  agendaCount     Int            @default(0)

  // ステータス
  status          String         @default("scheduled") // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

  // 拡張情報（将来実装）
  chairperson     String?        // 委員長名（キャッシュ）
  participants    Json?          // string[] - 参加者リスト
  meetingMinutes  String?        // 議事録URL

  // タイムスタンプ
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  // リレーション
  committee       CommitteeInfo  @relation(fields: [committeeId], references: [id], onDelete: Cascade)

  @@index([committeeId])
  @@index([date])
  @@index([status])
}
```

---

### テーブル5: CommitteeSubmissionRequest（提出承認リクエスト）

```prisma
model CommitteeSubmissionRequest {
  id                String    @id @default(cuid())

  // 提案情報
  proposalTitle     String
  targetCommittee   String

  // 申請者情報
  requesterId       String    // User.id
  requesterName     String    // 申請者名（キャッシュ）
  requesterLevel    Float     // 権限レベル（キャッシュ）

  // ステータス
  status            String    @default("pending") // 'pending' | 'approved' | 'rejected'

  // 承認情報
  approvedBy        String?   // 承認者名（キャッシュ）
  approverId        String?   // User.id
  approvedAt        DateTime?
  approvalNotes     String?

  // 却下情報
  rejectionReason   String?

  // タイムスタンプ
  requestedAt       DateTime  @default(now())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // リレーション
  requester         User      @relation("SubmissionRequester", fields: [requesterId], references: [id])
  approver          User?     @relation("SubmissionApprover", fields: [approverId], references: [id])

  @@index([requesterId])
  @@index([approverId])
  @@index([status])
  @@index([targetCommittee])
  @@index([requestedAt])
}
```

---

## 🔗 医療システムAPI連携要件

### API 1: 職員情報取得

**エンドポイント**: `GET /api/employees/{employeeId}`

**用途**:
- 議題の提案者・決定者情報取得
- 委員会メンバー情報取得
- 提出承認リクエストの申請者情報取得

**レスポンス例**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "name": "山田 花子",
  "department": "内科",
  "position": "看護師",
  "permissionLevel": 6.0
}
```

---

### API 2: 部署マスタ取得

**エンドポイント**: `GET /api/departments`

**用途**:
- 議題の影響部署（impactDepartments）検証
- 提案者部署の正確な名称取得

**レスポンス例**:
```json
{
  "departments": [
    { "id": "medical_care_ward", "name": "内科", "facilityId": "obara-hospital" },
    { "id": "surgical_ward", "name": "外科", "facilityId": "obara-hospital" }
  ]
}
```

---

### API 3: 複数職員情報一括取得（パフォーマンス最適化）

**エンドポイント**: `POST /api/employees/batch`

**用途**:
- 委員会メンバー一覧の職員情報を一括取得
- 議題一覧の提案者情報を一括取得

**リクエスト例**:
```json
{
  "employeeIds": ["OH-NS-2024-001", "OH-NS-2024-002", "OH-NS-2024-003"]
}
```

**レスポンス例**:
```json
{
  "employees": [
    { "employeeId": "OH-NS-2024-001", "name": "山田 花子", "department": "内科", "position": "看護師" },
    { "employeeId": "OH-NS-2024-002", "name": "佐藤 太郎", "department": "外科", "position": "医師" }
  ]
}
```

---

## 🚧 不足項目まとめ

### A. DBテーブル（schema.prisma）
1. ❌ `ManagementCommitteeAgenda` - 議題
2. ❌ `CommitteeInfo` - 委員会基本情報
3. ❌ `CommitteeMember` - 委員会メンバー
4. ❌ `CommitteeMeeting` - 会議スケジュール
5. ❌ `CommitteeSubmissionRequest` - 提出承認リクエスト

### B. Userモデルへの追加リレーション
```prisma
model User {
  // 既存フィールド...

  // 委員会管理追加リレーション
  proposedAgendas         ManagementCommitteeAgenda[] @relation("AgendaProposer")
  chairmanCommittees      CommitteeInfo[]             @relation("CommitteeChairperson")
  committeeMemberships    CommitteeMember[]           @relation("CommitteeMemberUser")
  submissionRequestsSent  CommitteeSubmissionRequest[] @relation("SubmissionRequester")
  submissionRequestsApproved CommitteeSubmissionRequest[] @relation("SubmissionApprover")
}
```

### C. Postモデルへの追加リレーション
```prisma
model Post {
  // 既存フィールド...

  // 委員会議題への昇格
  relatedAgendas  ManagementCommitteeAgenda[] @relation("AgendaRelatedPost")
}
```

### D. 医療システムAPI
1. ❌ 職員情報取得API（単体）
2. ❌ 職員情報一括取得API（バッチ）
3. ❌ 部署マスタ取得API

### E. VoiceDrive API（医療システム向け提供）
- なし（委員会管理は内部機能のため外部提供不要）

---

## 📅 実装ロードマップ

### Phase 1: DB構築（3日）

**Day 1**:
- [ ] schema.prisma更新（5テーブル追加）
- [ ] Prisma Migration実行
- [ ] Prisma Client再生成

**Day 2**:
- [ ] デモデータ投入スクリプト作成
- [ ] ManagementCommitteeService.tsをDB版に移行

**Day 3**:
- [ ] 統合テスト（CRUD操作）
- [ ] エラーハンドリング実装

---

### Phase 2: 医療システムAPI連携（2日）

**Day 4**:
- [ ] 医療システムAPI仕様書作成
- [ ] VoiceDrive側API呼び出しロジック実装
- [ ] キャッシュ戦略実装（職員情報）

**Day 5**:
- [ ] 医療システム側API実装（職員情報、部署マスタ）
- [ ] 統合テスト（API連携）

---

### Phase 3: UI統合（1日）

**Day 6**:
- [ ] CommitteeManagementPage.tsxをDB版に接続
- [ ] リアルタイムデータ表示確認
- [ ] E2Eテスト

---

## ✅ 成功基準

### 機能要件
- [x] 4タブ全て動作（提出承認、議題一覧、カレンダー、委員会一覧）
- [ ] 検索・フィルター機能正常動作
- [ ] 承認・却下フロー正常動作（Level 8+）
- [ ] 統計サマリー正確表示

### 非機能要件
- [ ] ページ読み込み時間 < 2秒
- [ ] API応答時間 < 500ms
- [ ] データ整合性100%（医療システムと）

### データ管理
- [ ] VoiceDrive/医療システム責任分界明確
- [ ] 職員情報キャッシュ戦略確立
- [ ] 部署マスタ同期確認

---

## 📞 医療チームへの質問事項

### 質問1: 委員会データの初期データ提供
委員会管理ページ稼働には以下の初期データが必要です：

1. **委員会リスト**（運営委員会、医療安全委員会等）
2. **委員会メンバー**（各委員会の構成員）
3. **委員長情報**（各委員会の委員長employeeId）

これらは医療システムから提供可能ですか？それともVoiceDrive側で手動入力しますか？

---

### 質問2: 議題の決定者権限
議題を「承認」「却下」「保留」できる決定者は：

- 院長（Level 25）
- 副院長（Level 20-24）
- 委員長（委員会ごとに異なる）

この理解で正しいですか？権限レベルで判定可能ですか？

---

### 質問3: 部署マスタ同期頻度
影響部署（impactDepartments）検証のため、部署マスタが必要です：

- 部署マスタの更新頻度はどの程度ですか？
- リアルタイムAPI取得 vs 日次バッチ同期のどちらが適切ですか？

---

## 📚 関連文書

- [データ管理責任分界点定義書_20251008.md](mcp-shared/docs/データ管理責任分界点定義書_20251008.md)
- [CommitteeManagementPage.tsx](src/pages/CommitteeManagementPage.tsx)
- [src/types/committee.ts](src/types/committee.ts)
- [src/services/ManagementCommitteeService.ts](src/services/ManagementCommitteeService.ts)

---

**文書終了**

最終更新: 2025年10月9日
バージョン: 1.0
承認: 未承認（レビュー待ち）
