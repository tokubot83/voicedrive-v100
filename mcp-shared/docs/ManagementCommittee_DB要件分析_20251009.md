# 運営委員会（ManagementCommittee）DB要件分析
**作成日**: 2025年10月9日
**対象システム**: VoiceDrive v1.0.0
**対象ページ**: https://voicedrive-v100.vercel.app/management-committee
**アクセス権限**: Level 10-13（部長・医局長・事務長・副院長・院長）

---

## 📊 概要サマリー

| 項目 | 内容 |
|------|------|
| **ページ名** | 運営委員会（ManagementCommittee） |
| **目的** | 施設運営の最高意思決定機関 - 議題審議・決定・進捗管理 |
| **アクセス権限** | Level 10+（部長以上） |
| **主要機能** | 議題管理、議事録、決定事項追跡、委員管理 |
| **データベーステーブル数** | 6テーブル |
| **VoiceDrive内部API数** | 12 API |
| **医療システム連携API** | 0（連携不要） |
| **見積工数** | 4週間（20日） |
| **見積金額** | ¥0（医療システム連携不要） |

---

## 🎯 ページ機能概要

### 現状のUIコンポーネント分析

#### ヘッダーセクション
- **タイトル**: 🏛️ 運営委員会
- **説明**: 施設運営の最高意思決定機関 - 議題審議・決定・進捗管理
- **統計サマリー**:
  - 審議待ち議題数
  - 承認済み議題数
  - 実施中の決定事項数
  - 委員会メンバー数（例: 12名）

#### 4つのタブ機能

##### 1. 議題管理タブ（Agenda Management）
**目的**: 運営委員会で審議する議題の一覧管理

**表示項目**:
- 議題タイトル
- ステータス: 審議待ち / 審議中 / 承認 / 却下
- 優先度: 高 / 中 / 低
- 提案者（部署名 + 役職名）
- 提案元部署
- 議題サマリー（背景・目的）
- 審議予定日

**データソース**:
- 投稿管理システムから自動エスカレーションされた議題
- 各部署から直接提出された議題
- 委員会メンバーからの提案議題

##### 2. 議事録タブ（Minutes）
**目的**: 運営委員会の議事録管理・閲覧

**表示項目**:
- 開催日時
- 出席者リスト
- 審議議題リスト
- 決定事項リスト
- 次回開催予定日
- ダウンロード機能（PDF）

##### 3. 決定事項タブ（Decisions）
**目的**: 委員会で承認された決定事項の追跡・進捗管理

**表示項目**:
- 決定事項タイトル
- ステータス: 実施中 / 監視中 / 完了
- 決定日
- 影響範囲（対象部署・人数）
- 担当部署

##### 4. 委員タブ（Members）
**目的**: 運営委員会のメンバー管理

**表示内容**（現在開発中）:
- 委員一覧
- 役割管理（委員長、副委員長、委員、オブザーバー）
- 任期管理
- 出席率統計

---

## 🗂️ データベース設計

### テーブル1: ManagementCommitteeAgenda（運営委員会議題）

**目的**: 運営委員会で審議する議題の管理

```prisma
model ManagementCommitteeAgenda {
  id                    String    @id @default(cuid())

  // 基本情報
  title                 String
  agendaType            String    // 'committee_proposal' | 'facility_policy' | 'personnel' | 'budget' | 'equipment' | 'other'
  description           String    // 議題の説明
  background            String    // 背景・経緯

  // 提案元情報
  proposedBy            String    // 提案者名（委員会名など）
  proposedDate          DateTime
  proposerDepartment    String
  proposerId            String?   // User ID（提案者がUserの場合）

  // 関連投稿（アイデアボイスからエスカレーションされた場合）
  relatedPostId         String?   // Post ID
  escalationSource      String?   // 'voting_system' | 'department_proposal' | 'direct_submission'

  // ステータス
  status                String    @default("pending") // 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred'
  priority              String    @default("normal")  // 'urgent' | 'high' | 'normal' | 'low'

  // 審議情報
  scheduledDate         DateTime? // 審議予定日
  actualReviewDate      DateTime? // 実際の審議日
  decidedDate           DateTime? // 決定日
  decidedBy             String?   // 決定者（院長名）
  decidedById           String?   // User ID
  decision              String?   // 'approved' | 'rejected' | 'deferred'
  decisionNotes         String?   // 決定理由・コメント

  // 影響分析
  impactDepartments     Json      // string[] - 影響を受ける部署
  estimatedCost         Float?    // 予算影響
  implementationPeriod  String?   // 実施期間
  expectedEffect        String    // 期待される効果

  // 関連資料
  attachments           Json?     // {id, name, type, url}[]

  // メタデータ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  tags                  Json?     // string[]

  // リレーション
  relatedPost           Post?     @relation("AgendaFromPost", fields: [relatedPostId], references: [id])
  proposer              User?     @relation("AgendaProposer", fields: [proposerId], references: [id])
  decisionMaker         User?     @relation("AgendaDecisionMaker", fields: [decidedById], references: [id])
  minutes               ManagementCommitteeMinutes[] @relation("MinutesAgenda")
  decisions             ManagementCommitteeDecision[]

  @@index([status])
  @@index([priority])
  @@index([proposedDate])
  @@index([scheduledDate])
  @@index([relatedPostId])
}
```

### テーブル2: ManagementCommitteeMinutes（運営委員会議事録）

**目的**: 運営委員会の議事録管理

```prisma
model ManagementCommitteeMinutes {
  id                  String    @id @default(cuid())

  // 基本情報
  meetingDate         DateTime  // 開催日時
  meetingNumber       String    // 第○回
  venue               String?   // 開催場所

  // 出席者情報
  attendees           Json      // {userId, name, role}[] - 出席者リスト
  absentees           Json?     // {userId, name, reason}[] - 欠席者リスト
  observers           Json?     // {userId, name}[] - オブザーバー

  // 議題情報
  agendaIds           Json      // string[] - 審議した議題ID

  // 議事内容
  openingRemarks      String?   // 冒頭挨拶
  discussions         Json      // {agendaId, summary, concerns, opinions}[]
  decisionsText       Json      // string[] - 決定事項（テキスト）
  actionItems         Json?     // {task, assignee, dueDate}[] - アクションアイテム
  closingRemarks      String?   // 終了挨拶

  // 次回予定
  nextMeetingDate     DateTime? // 次回開催予定日
  nextAgendaPreview   String?   // 次回の主な議題

  // ドキュメント管理
  pdfUrl              String?   // PDF議事録のURL
  documentStatus      String    @default("draft") // 'draft' | 'reviewed' | 'approved' | 'published'
  approvedBy          String?   // 承認者（議長）
  approvedById        String?   // User ID
  approvedAt          DateTime?

  // メタデータ
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  createdBy           String    // 議事録作成者（事務局）
  createdById         String

  // リレーション
  agendas             ManagementCommitteeAgenda[] @relation("MinutesAgenda")
  approver            User?     @relation("MinutesApprover", fields: [approvedById], references: [id])
  creator             User      @relation("MinutesCreator", fields: [createdById], references: [id])

  @@index([meetingDate])
  @@index([documentStatus])
}
```

### テーブル3: ManagementCommitteeDecision（運営委員会決定事項）

**目的**: 委員会で承認された決定事項の追跡

```prisma
model ManagementCommitteeDecision {
  id                    String    @id @default(cuid())

  // 基本情報
  agendaId              String    // 元となった議題ID
  title                 String
  decisionSummary       String    // 決定事項の要約

  // 決定情報
  decidedDate           DateTime
  decidedBy             String    // 決定者（院長名）
  decidedById           String    // User ID
  decisionType          String    // 'approved' | 'approved_with_conditions' | 'pilot_program'
  conditions            Json?     // string[] - 承認条件

  // 実施情報
  implementationStatus  String    @default("implementation") // 'implementation' | 'monitoring' | 'completed' | 'cancelled'
  implementationPlan    String?   // 実施計画
  implementationStart   DateTime? // 実施開始日
  implementationEnd     DateTime? // 実施終了日（予定）
  actualCompletionDate  DateTime? // 実際の完了日

  // 影響情報
  impactScope           String    // 影響範囲（例: 全職員500名）
  affectedDepartments   Json      // string[] - 対象部署
  responsibleDepartment String    // 担当部署
  responsiblePerson     String?   // 担当者
  responsibleUserId     String?   // User ID

  // 予算・コスト
  approvedBudget        Float?    // 承認予算
  actualCost            Float?    // 実際のコスト

  // 進捗管理
  progressRate          Int       @default(0) // 進捗率 (0-100%)
  milestones            Json?     // {name, dueDate, status, completedDate}[]
  progressNotes         Json?     // {date, note, reportedBy}[] - 進捗報告

  // 効果測定
  expectedEffects       Json      // string[] - 期待される効果
  actualEffects         Json?     // {effect, measurement, result}[] - 実際の効果
  kpiTargets            Json?     // {name, target, actual}[] - KPI目標と実績

  // メタデータ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // リレーション
  agenda                ManagementCommitteeAgenda @relation(fields: [agendaId], references: [id])
  decisionMaker         User      @relation("DecisionMaker", fields: [decidedById], references: [id])
  responsibleUser       User?     @relation("DecisionResponsible", fields: [responsibleUserId], references: [id])

  @@index([agendaId])
  @@index([implementationStatus])
  @@index([decidedDate])
}
```

### テーブル4: ManagementCommitteeMember（運営委員会メンバー）

**目的**: 運営委員会の委員管理

```prisma
model ManagementCommitteeMember {
  id                String    @id @default(cuid())

  // メンバー情報
  userId            String
  facilityId        String    // 所属施設

  // 委員会での役割
  role              String    // 'chairman' | 'vice_chairman' | 'secretary' | 'member' | 'observer'
  department        String    // 所属部署
  position          String    // 役職（部長、副院長など）

  // 任期情報
  termStart         DateTime  // 任期開始日
  termEnd           DateTime? // 任期終了日
  isActive          Boolean   @default(true)

  // 出席情報
  totalMeetings     Int       @default(0)  // 総開催回数（在任中）
  attendedMeetings  Int       @default(0)  // 出席回数
  absentMeetings    Int       @default(0)  // 欠席回数
  attendanceRate    Float     @default(0)  // 出席率（%）

  // 貢献度
  proposedAgendas   Int       @default(0)  // 提案した議題数
  commentCount      Int       @default(0)  // 発言・意見数

  // メタデータ
  appointedAt       DateTime  @default(now())
  appointedBy       String?   // 任命者
  appointedById     String?   // User ID
  notes             String?   // 備考

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // リレーション
  user              User      @relation("CommitteeMemberUser", fields: [userId], references: [id])
  appointer         User?     @relation("MemberAppointer", fields: [appointedById], references: [id])

  @@unique([userId, facilityId])
  @@index([userId])
  @@index([facilityId])
  @@index([role])
  @@index([isActive])
}
```

### テーブル5: ManagementCommitteeAttendance（出席記録）

**目的**: 各会議への出席状況の詳細記録

```prisma
model ManagementCommitteeAttendance {
  id              String    @id @default(cuid())

  // 基本情報
  minutesId       String    // 議事録ID
  memberId        String    // 委員ID
  userId          String    // User ID

  // 出席情報
  attendanceType  String    // 'present' | 'absent' | 'late' | 'early_leave' | 'observer'
  arrivalTime     DateTime? // 到着時刻（遅刻の場合）
  departureTime   DateTime? // 退出時刻（早退の場合）
  absentReason    String?   // 欠席理由

  // 貢献度
  commentCount    Int       @default(0) // 発言回数
  proposedAgendas Json?     // string[] - この会議で提案した議題ID

  // メタデータ
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // リレーション
  minutes         ManagementCommitteeMinutes @relation(fields: [minutesId], references: [id])
  member          ManagementCommitteeMember  @relation(fields: [memberId], references: [id])
  user            User      @relation("AttendanceUser", fields: [userId], references: [id])

  @@unique([minutesId, memberId])
  @@index([minutesId])
  @@index([memberId])
  @@index([userId])
}
```

### テーブル6: ManagementCommitteeNotification（委員会通知）

**目的**: 委員会関連の通知管理

```prisma
model ManagementCommitteeNotification {
  id                String    @id @default(cuid())

  // 通知タイプ
  notificationType  String    // 'meeting_scheduled' | 'agenda_added' | 'decision_made' | 'minutes_published' | 'action_item_assigned'

  // 通知対象
  recipientType     String    // 'all_members' | 'specific_members' | 'responsible_person'
  recipientIds      Json      // string[] - User IDs

  // 通知内容
  title             String
  message           String
  priority          String    @default("normal") // 'urgent' | 'high' | 'normal' | 'low'

  // 関連情報
  relatedAgendaId   String?
  relatedMinutesId  String?
  relatedDecisionId String?
  actionRequired    Boolean   @default(false)
  actionDueDate     DateTime?

  // 送信情報
  sentAt            DateTime  @default(now())
  sentBy            String    // 送信者
  sentById          String    // User ID

  // 既読管理
  readBy            Json?     // {userId, readAt}[]
  readCount         Int       @default(0)

  // メタデータ
  createdAt         DateTime  @default(now())

  // リレーション
  sender            User      @relation("NotificationSender", fields: [sentById], references: [id])

  @@index([notificationType])
  @@index([sentAt])
}
```

---

## 🔌 VoiceDrive内部API設計

### API-MC-1: 議題一覧取得
```typescript
GET /api/management-committee/agendas

Query Parameters:
- status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred'
- priority?: 'urgent' | 'high' | 'normal' | 'low'
- fromDate?: string (ISO 8601)
- toDate?: string (ISO 8601)
- limit?: number (default: 50)
- offset?: number (default: 0)

Response:
{
  success: true,
  count: number,
  agendas: ManagementCommitteeAgenda[]
}
```

### API-MC-2: 議題詳細取得
```typescript
GET /api/management-committee/agendas/:agendaId

Response:
{
  success: true,
  agenda: ManagementCommitteeAgenda & {
    relatedPost?: Post,
    minutes?: ManagementCommitteeMinutes[],
    decision?: ManagementCommitteeDecision
  }
}
```

### API-MC-3: 議題作成
```typescript
POST /api/management-committee/agendas

Request Body:
{
  title: string,
  agendaType: string,
  description: string,
  background: string,
  proposedBy: string,
  proposerDepartment: string,
  relatedPostId?: string,
  priority: string,
  impactDepartments: string[],
  estimatedCost?: number,
  implementationPeriod?: string,
  expectedEffect: string,
  attachments?: {id, name, type, url}[],
  tags?: string[]
}

Response:
{
  success: true,
  agenda: ManagementCommitteeAgenda
}

Permission: Level 8+ (課長以上)
```

### API-MC-4: 議題ステータス更新
```typescript
PUT /api/management-committee/agendas/:agendaId/status

Request Body:
{
  status: 'in_review' | 'approved' | 'rejected' | 'deferred',
  decision?: 'approved' | 'rejected' | 'deferred',
  decisionNotes?: string,
  decidedDate?: string (ISO 8601),
  decidedBy?: string
}

Response:
{
  success: true,
  agenda: ManagementCommitteeAgenda
}

Permission: Level 10+ (部長以上)
```

### API-MC-5: 議事録一覧取得
```typescript
GET /api/management-committee/minutes

Query Parameters:
- fromDate?: string (ISO 8601)
- toDate?: string (ISO 8601)
- status?: 'draft' | 'reviewed' | 'approved' | 'published'
- limit?: number (default: 20)
- offset?: number (default: 0)

Response:
{
  success: true,
  count: number,
  minutes: ManagementCommitteeMinutes[]
}
```

### API-MC-6: 議事録詳細取得
```typescript
GET /api/management-committee/minutes/:minutesId

Response:
{
  success: true,
  minutes: ManagementCommitteeMinutes & {
    agendas: ManagementCommitteeAgenda[],
    attendance: ManagementCommitteeAttendance[]
  }
}
```

### API-MC-7: 議事録作成
```typescript
POST /api/management-committee/minutes

Request Body:
{
  meetingDate: string (ISO 8601),
  meetingNumber: string,
  venue?: string,
  attendees: {userId, name, role}[],
  absentees?: {userId, name, reason}[],
  observers?: {userId, name}[],
  agendaIds: string[],
  discussions: {agendaId, summary, concerns, opinions}[],
  decisionsText: string[],
  actionItems?: {task, assignee, dueDate}[],
  nextMeetingDate?: string (ISO 8601)
}

Response:
{
  success: true,
  minutes: ManagementCommitteeMinutes
}

Permission: Level 11+ (事務長以上)
```

### API-MC-8: 決定事項一覧取得
```typescript
GET /api/management-committee/decisions

Query Parameters:
- status?: 'implementation' | 'monitoring' | 'completed' | 'cancelled'
- department?: string
- fromDate?: string (ISO 8601)
- toDate?: string (ISO 8601)
- limit?: number (default: 50)
- offset?: number (default: 0)

Response:
{
  success: true,
  count: number,
  decisions: ManagementCommitteeDecision[]
}
```

### API-MC-9: 決定事項進捗更新
```typescript
PUT /api/management-committee/decisions/:decisionId/progress

Request Body:
{
  progressRate: number (0-100),
  progressNote: string,
  milestoneUpdate?: {
    milestoneName: string,
    status: 'completed' | 'in_progress' | 'delayed',
    completedDate?: string (ISO 8601)
  }
}

Response:
{
  success: true,
  decision: ManagementCommitteeDecision
}

Permission: Level 8+ (課長以上、担当者本人）
```

### API-MC-10: 委員一覧取得
```typescript
GET /api/management-committee/members

Query Parameters:
- facilityId?: string
- role?: 'chairman' | 'vice_chairman' | 'secretary' | 'member' | 'observer'
- isActive?: boolean
- limit?: number (default: 50)

Response:
{
  success: true,
  count: number,
  members: ManagementCommitteeMember[]
}
```

### API-MC-11: 委員追加
```typescript
POST /api/management-committee/members

Request Body:
{
  userId: string,
  facilityId: string,
  role: string,
  department: string,
  position: string,
  termStart: string (ISO 8601),
  termEnd?: string (ISO 8601),
  notes?: string
}

Response:
{
  success: true,
  member: ManagementCommitteeMember
}

Permission: Level 13 (院長のみ)
```

### API-MC-12: 統計情報取得
```typescript
GET /api/management-committee/stats

Response:
{
  success: true,
  stats: {
    totalAgendas: number,
    pendingCount: number,
    inReviewCount: number,
    approvedCount: number,
    rejectedCount: number,
    deferredCount: number,
    urgentCount: number,

    byType: {
      committee_proposal: number,
      facility_policy: number,
      personnel: number,
      budget: number,
      equipment: number,
      other: number
    },

    thisMonthDecisions: number,
    approvalRate: number,
    averageDecisionDays: number,

    activeDecisions: number,
    completedDecisions: number,
    totalMembers: number,
    averageAttendanceRate: number
  }
}
```

---

## 🔄 データフロー

### 1. 議題エスカレーションフロー

```
[アイデアボイス投稿]
  ↓ (投票300点以上)
[部署議題化] (DEPT_AGENDA)
  ↓ (レベル8が承認)
[委員会提出] (Post.agendaLevel = 'FACILITY_AGENDA')
  ↓
[運営委員会議題登録]
  - ManagementCommitteeAgenda作成
  - relatedPostId: 元投稿ID
  - escalationSource: 'voting_system'
  - status: 'pending'
  ↓
[運営委員会で審議]
  - status: 'in_review'
  - ManagementCommitteeMinutes作成
  ↓
[決定]
  - status: 'approved' | 'rejected' | 'deferred'
  - ManagementCommitteeDecision作成（承認の場合）
  ↓
[実施・進捗管理]
  - implementationStatus: 'implementation' → 'monitoring' → 'completed'
```

### 2. 議事録作成フロー

```
[会議開催]
  ↓
[事務局が議事録ドラフト作成]
  - ManagementCommitteeMinutes作成
  - documentStatus: 'draft'
  - 出席者・議題・決定事項を記録
  ↓
[委員長レビュー]
  - documentStatus: 'reviewed'
  ↓
[承認]
  - documentStatus: 'approved'
  - approvedBy: 委員長
  - approvedAt: 承認日時
  ↓
[公開]
  - documentStatus: 'published'
  - PDF生成・保存
  - 委員へ通知送信
```

### 3. 決定事項進捗管理フロー

```
[決定事項登録]
  - ManagementCommitteeDecision作成
  - implementationStatus: 'implementation'
  - progressRate: 0%
  ↓
[担当部署が進捗報告]
  - PUT /api/management-committee/decisions/:id/progress
  - progressRate更新
  - progressNotes追加
  ↓
[マイルストーン達成]
  - milestones更新
  - 進捗率自動計算
  ↓
[完了]
  - implementationStatus: 'completed'
  - actualCompletionDate設定
  - 効果測定データ入力
```

---

## 🔐 権限設計

### アクセス権限マトリクス

| 機能 | Level 10 (部長) | Level 11 (事務長) | Level 12 (副院長) | Level 13 (院長) |
|------|----------------|------------------|-----------------|----------------|
| 議題閲覧 | ✅ | ✅ | ✅ | ✅ |
| 議題提案 | ✅ | ✅ | ✅ | ✅ |
| 議題承認・却下 | ❌ | ❌ | ⚠️（副院長として助言） | ✅ |
| 議事録閲覧 | ✅ | ✅ | ✅ | ✅ |
| 議事録作成 | ❌ | ✅ | ✅ | ✅ |
| 議事録承認 | ❌ | ❌ | ❌ | ✅ |
| 決定事項閲覧 | ✅ | ✅ | ✅ | ✅ |
| 進捗報告 | ⚠️（担当案件のみ） | ✅ | ✅ | ✅ |
| 委員管理 | ❌ | ❌ | ❌ | ✅ |

### 権限定義（agendaModePermissions.ts より）

```typescript
// Level 10: 部長・医局長
{
  level: PermissionLevel.LEVEL_10,
  displayName: '部長・医局長',
  description: '運営委員会メンバー',
  menuItems: [..., 'operations_committee']
}

// Level 11: 事務長
{
  level: PermissionLevel.LEVEL_11,
  displayName: '事務長',
  description: '施設運営議題の統括',
  menuItems: [..., 'facility_governance']
}

// Level 12: 副院長
{
  level: PermissionLevel.LEVEL_12,
  displayName: '副院長',
  description: '施設議題の戦略的レビュー',
  menuItems: [..., 'strategic_review']
}

// Level 13: 院長・施設長
{
  level: PermissionLevel.LEVEL_13,
  displayName: '院長・施設長',
  description: '施設最終議題承認権限',
  menuItems: [..., 'executive_decision']
}
```

---

## 📊 統計・分析機能

### 運営委員会ダッシュボード統計

**API-MC-12で取得可能な統計**:

1. **議題統計**
   - 総議題数
   - ステータス別件数（審議待ち、審議中、承認、却下、保留）
   - 優先度別件数
   - タイプ別件数（委員会提案、施設方針、人事、予算、設備、その他）

2. **意思決定効率**
   - 今月の決定件数
   - 承認率（承認/(承認+却下)）
   - 平均決定日数（提案から決定まで）

3. **実施状況**
   - 実施中の決定事項数
   - 完了した決定事項数
   - 平均進捗率

4. **委員会活動**
   - 委員総数
   - 平均出席率
   - 今年度の開催回数

---

## 🎨 UI/UX要件

### レスポンシブデザイン

```typescript
// モバイル（<768px）
- 統計カード: 2列グリッド
- タブ: 2行×2列
- 議題カード: 縦積み

// タブレット（768px-1024px）
- 統計カード: 4列グリッド
- タブ: 1行×4列
- 議題カード: 縦積み

// デスクトップ（>1024px）
- 統計カード: 4列グリッド
- タブ: 1行×4列
- 議題カード: 縦積み（詳細表示）
```

### カラースキーム

```typescript
// ステータスカラー
- pending (審議待ち): bg-yellow-900/30 text-yellow-400
- in_review (審議中): bg-blue-900/30 text-blue-400
- approved (承認): bg-green-900/30 text-green-400
- rejected (却下): bg-red-900/30 text-red-400
- deferred (保留): bg-gray-900/30 text-gray-400

// 優先度カラー
- urgent (緊急): bg-red-900/30 text-red-400
- high (高): bg-orange-900/30 text-orange-400
- normal (通常): bg-blue-900/30 text-blue-400
- low (低): bg-gray-900/30 text-gray-400

// 実施ステータスカラー
- implementation (実施中): bg-blue-900/30 text-blue-400
- monitoring (監視中): bg-yellow-900/30 text-yellow-400
- completed (完了): bg-green-900/30 text-green-400
```

---

## 🚀 実装計画

### Phase 1: 基本機能実装（1週間）

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| Day 1-2 | テーブル設計・マイグレーション | Prisma Schema更新 |
| Day 3-4 | API実装（API-MC-1 ~ API-MC-6） | 議題・議事録API |
| Day 5 | UI統合（議題管理タブ） | 議題一覧表示 |

### Phase 2: 議事録・決定事項（1週間）

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| Day 6-7 | 議事録作成・承認フロー実装 | API-MC-7 |
| Day 8-9 | 決定事項管理API実装 | API-MC-8 ~ API-MC-9 |
| Day 10 | UI統合（議事録・決定事項タブ） | 議事録・決定事項表示 |

### Phase 3: 委員管理・通知（1週間）

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| Day 11-12 | 委員管理API実装 | API-MC-10 ~ API-MC-11 |
| Day 13 | 出席記録・統計機能 | API-MC-12 |
| Day 14-15 | 通知システム統合 | 委員会通知機能 |

### Phase 4: 統合・テスト（1週間）

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| Day 16-17 | アイデアボイスからのエスカレーション統合 | 自動議題化 |
| Day 18 | PDF議事録生成機能 | 議事録ダウンロード |
| Day 19 | 統合テスト | テストレポート |
| Day 20 | バグ修正・リリース準備 | 本番リリース |

---

## 💰 コスト概算

### VoiceDrive開発工数

| 項目 | 工数 | 備考 |
|------|------|------|
| DB設計・マイグレーション | 2日 | 6テーブル |
| API実装 | 8日 | 12 API |
| UI実装 | 6日 | 4タブ + 統計 |
| PDF生成機能 | 1日 | 議事録ダウンロード |
| 統合・テスト | 3日 | エスカレーション統合含む |
| **合計** | **20日** | **4週間** |

### 医療システム連携工数

| 項目 | 工数 | 金額 |
|------|------|------|
| **連携不要** | **0日** | **¥0** |

**理由**: 運営委員会は完全にVoiceDrive内部で完結。医療職員管理システムとのデータ連携は不要。

---

## ✅ 確認事項

### VoiceDriveチームへ

1. **議題エスカレーション**
   - アイデアボイスから運営委員会への自動エスカレーションフローは正しいですか？
   - エスカレーション条件（投票300点以上、FACILITY_AGENDA）で問題ありませんか？

2. **権限設計**
   - Level 10-13のアクセス権限マトリクスで問題ありませんか？
   - 院長（Level 13）のみが最終承認できる設計で良いですか？

3. **議事録管理**
   - 議事録の承認フロー（draft → reviewed → approved → published）で問題ありませんか？
   - PDF生成は必須機能ですか？それとも将来実装でも可ですか？

4. **委員管理**
   - 委員の任期管理機能は必要ですか？
   - 委員の任命権限は院長（Level 13）のみで良いですか？

5. **決定事項追跡**
   - 進捗報告の頻度はどのくらいを想定していますか？（月次？四半期？）
   - マイルストーン管理は必須ですか？

6. **通知システム**
   - 委員会関連の通知は既存のNotificationテーブルと統合しますか？
   - それとも専用のManagementCommitteeNotificationテーブルを使いますか？

7. **統計・分析**
   - ダッシュボードに表示する統計項目は十分ですか？
   - 追加で必要な分析機能はありますか？

8. **実装優先度**
   - 委員管理機能（Phase 3）は最初のリリースに含める必要がありますか？
   - それとも議題・議事録・決定事項（Phase 1-2）を先行リリースしますか？

---

## 📚 関連ドキュメント

- [ManagementCommitteePage.tsx](../../src/pages/ManagementCommitteePage.tsx) - 現在のUI実装
- [DecisionMeetingService.ts](../../src/services/DecisionMeetingService.ts) - 決定会議サービス（類似機能）
- [agendaModePermissions.ts](../../src/permissions/config/agendaModePermissions.ts) - 権限定義
- [PostManagement_DB要件分析_20251009.md](./PostManagement_DB要件分析_20251009.md) - 投稿管理との連携

---

**最終更新**: 2025年10月9日
**作成者**: Claude (AI Assistant)
**レビュー**: VoiceDrive開発チーム
**承認待ち**: プロジェクトリード
