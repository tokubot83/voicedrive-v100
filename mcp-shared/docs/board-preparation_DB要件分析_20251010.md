# BoardPreparation（理事会準備）ページ DB要件分析

**文書番号**: BOARD-PREP-DB-2025-1010-001
**作成日**: 2025年10月10日
**対象ページ**: https://voicedrive-v100.vercel.app/board-preparation
**対象ユーザー**: Level 17（戦略企画・統括管理部門長）
**目的**: 理事会準備ページの全機能を分析し、必要なDB要件を明確化

---

## 📋 エグゼクティブサマリー

### ページ概要
BoardPreparationページは、**Level 17（戦略企画・統括管理部門長）** が理事会議題を選定し、理事会資料を準備するためのページです。エグゼクティブレポートから議題候補を選定し、理事長承認を経て理事会アジェンダを確定します。

### 主要機能（5セクション）
1. **次回理事会情報**: 開催日時・場所・出席者・準備状況
2. **議題候補一覧**: エグゼクティブレポートから選定した6議題
3. **資料準備状況サマリー**: 確定/承認/レビュー中/草案の集計
4. **理事長への提案**: 戦略的重要事項の提案書
5. **議題化プロセス統括サマリー**: 職員の声→理事会までの統計

### データ管理責任
- **VoiceDrive**: 100%（理事会準備は完全にVoiceDrive管轄）
- **医療システム**: なし（このページ固有のAPI不要）

### 必要なDB変更
- **新規テーブル**: 3テーブル
  - `BoardMeeting`: 理事会マスタ（✅既存のBoardMeetingAgendaを拡張）
  - `BoardAgendaCandidateSelection`: 議題候補選定履歴
  - `ChairmanProposal`: 理事長への提案

- **既存テーブル拡張**: 2テーブル
  - `BoardMeetingAgenda`: 議題準備状況フィールド追加
  - `GeneratedReport`: 理事会資料との関連付け

---

## 🎯 ページ機能詳細分析

### 1. 次回理事会情報（BoardMeetingInfo）

#### 表示内容（lines 37-44）
```typescript
const nextBoardMeeting: BoardMeetingInfo = {
  date: '2025年10月20日',              // 開催日
  time: '14:00',                       // 開催時刻
  location: '本部会議室A',             // 開催場所
  attendees: 12,                       // 出席予定者数（理事）
  expectedDuration: 120,               // 予定時間（分）
  status: 'materials_ready'            // 準備ステータス
};
```

#### データソース分析

| フィールド | 現状 | 必要なテーブル | 計算ロジック |
|-----------|------|--------------|-------------|
| date | ハードコード | `BoardMeeting.meetingDate` | 次回理事会を取得 |
| time | ハードコード | `BoardMeeting.startTime` | - |
| location | ハードコード | `BoardMeeting.location` | - |
| attendees | ハードコード | `BoardMeeting.expectedAttendees` | 理事マスタから算出 |
| expectedDuration | ハードコード | `BoardMeeting.expectedDuration` | 議題の合計時間 |
| status | ハードコード | 計算値 | 議題の準備状況から算出 |

#### 必要なテーブル: `BoardMeeting`

**注意**: 現在`BoardMeetingAgenda`テーブルは存在しますが、個別議題のテーブルです。理事会全体の情報を管理する`BoardMeeting`テーブルが必要です。

```prisma
model BoardMeeting {
  id                  String    @id @default(cuid())

  // 開催情報
  meetingDate         DateTime  @map("meeting_date")
  startTime           String    @map("start_time")              // "14:00"
  location            String                                    // "本部会議室A"
  expectedDuration    Int       @map("expected_duration")       // 予定時間（分）
  actualDuration      Int?      @map("actual_duration")         // 実際の時間

  // 参加者
  expectedAttendees   Int       @map("expected_attendees")      // 出席予定者数
  actualAttendees     Int?      @map("actual_attendees")        // 実際の出席者数
  attendeeList        Json?     @map("attendee_list")           // 出席者リスト

  // ステータス
  status              String    @default("planning")            // "planning", "agenda_draft", "materials_ready", "confirmed", "completed"
  preparationProgress Int       @default(0) @map("preparation_progress")  // 0-100%

  // 資料
  agendaDocumentUrl   String?   @map("agenda_document_url")     // 議事次第PDF
  minutesDocumentUrl  String?   @map("minutes_document_url")    // 議事録PDF

  // メタ
  createdBy           String    @map("created_by")              // User ID
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  creator             User                    @relation("BoardMeetingCreator", fields: [createdBy], references: [id])
  agendas             BoardMeetingAgenda[]    @relation("BoardMeetingAgendas")
  candidateSelections BoardAgendaCandidateSelection[]

  @@index([meetingDate])
  @@map("board_meetings")
}
```

---

### 2. 議題候補一覧（BoardAgendaItem[]）

#### 表示内容（lines 47-120）
```typescript
const agendaCandidates: BoardAgendaItem[] = [
  {
    id: 'agenda-1',
    title: '2025年度第2四半期 人事戦略報告',
    category: '人事戦略',
    priority: 'high',
    source: '月次議題化プロセスレポート',        // ExecutiveReportから
    preparedBy: '戦略企画部',
    status: 'finalized',                        // draft/reviewing/approved/finalized
    documentsReady: true,                       // 報告書準備完了
    presentationReady: true,                    // プレゼン資料準備完了
    estimatedTime: 20                           // 予定時間（分）
  },
  // ... 6議題
];
```

#### データソース分析

| フィールド | 現状 | 必要なテーブル | 計算ロジック |
|-----------|------|--------------|-------------|
| title | ハードコード | `BoardMeetingAgenda.item` | - |
| category | ハードコード | `BoardMeetingAgenda.category` | - |
| priority | ハードコード | **新規フィールド必要** | - |
| source | ハードコード | **新規フィールド必要** | ExecutiveReport参照 |
| preparedBy | ハードコード | **新規フィールド必要** | 部署名 |
| status | ハードコード | **新規フィールド必要** | draft/reviewing/approved/finalized |
| documentsReady | ハードコード | **新規フィールド必要** | 報告書の有無 |
| presentationReady | ハードコード | **新規フィールド必要** | プレゼン資料の有無 |
| estimatedTime | ハードコード | `BoardMeetingAgenda.duration` | ✅既存 |

#### 必要なテーブル拡張: `BoardMeetingAgenda`

```prisma
model BoardMeetingAgenda {
  // 既存フィールド...

  // 🆕 理事会準備用フィールド（2025-10-10）
  priority            String?   @default("medium")              // "high", "medium", "low"
  sourceReport        String?   @map("source_report")           // "月次議題化プロセスレポート"
  sourceReportId      String?   @map("source_report_id")        // GeneratedReport ID
  preparedBy          String?   @map("prepared_by")             // "戦略企画部"
  preparationStatus   String?   @default("draft") @map("preparation_status")  // "draft", "reviewing", "approved", "finalized"
  documentsReady      Boolean   @default(false) @map("documents_ready")
  presentationReady   Boolean   @default(false) @map("presentation_ready")
  documentUrls        Json?     @map("document_urls")           // { report: "url", presentation: "url" }

  // リレーション追加
  sourceReportRef     GeneratedReport?  @relation("AgendaSourceReport", fields: [sourceReportId], references: [id])
}
```

#### 必要な新規テーブル: `BoardAgendaCandidateSelection`

議題候補の選定履歴を記録（理事会準備プロセスの監査証跡）

```prisma
model BoardAgendaCandidateSelection {
  id                  String    @id @default(cuid())
  boardMeetingId      String    @map("board_meeting_id")
  agendaId            String    @map("agenda_id")

  // 選定情報
  selectedAt          DateTime  @default(now()) @map("selected_at")
  selectedBy          String    @map("selected_by")              // User ID
  selectionReason     String?   @db.Text @map("selection_reason")
  isFinalized         Boolean   @default(false) @map("is_finalized")

  // ステータス変更履歴
  statusHistory       Json?     @map("status_history")          // { timestamp, from, to, by }[]

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  boardMeeting        BoardMeeting            @relation(fields: [boardMeetingId], references: [id], onDelete: Cascade)
  agenda              BoardMeetingAgenda      @relation(fields: [agendaId], references: [id], onDelete: Cascade)
  selector            User                    @relation("AgendaSelector", fields: [selectedBy], references: [id])

  @@unique([boardMeetingId, agendaId])
  @@index([boardMeetingId])
  @@index([selectedBy])
  @@map("board_agenda_candidate_selections")
}
```

---

### 3. 資料準備状況サマリー（preparationStatus）

#### 表示内容（lines 123-131）
```typescript
const preparationStatus = {
  totalAgendas: 6,
  finalized: 2,
  approved: 2,
  reviewing: 1,
  draft: 1,
  documentsReady: 5,
  presentationsReady: 4
};
```

#### データソース分析

| 項目 | 計算ロジック | 使用テーブル |
|------|------------|------------|
| totalAgendas | COUNT(BoardMeetingAgenda WHERE meetingDate = ?) | BoardMeetingAgenda |
| finalized | COUNT(WHERE preparationStatus = 'finalized') | BoardMeetingAgenda |
| approved | COUNT(WHERE preparationStatus = 'approved') | BoardMeetingAgenda |
| reviewing | COUNT(WHERE preparationStatus = 'reviewing') | BoardMeetingAgenda |
| draft | COUNT(WHERE preparationStatus = 'draft') | BoardMeetingAgenda |
| documentsReady | COUNT(WHERE documentsReady = true) | BoardMeetingAgenda |
| presentationsReady | COUNT(WHERE presentationReady = true) | BoardMeetingAgenda |

**結論**: 上記の`BoardMeetingAgenda`拡張で対応可能

---

### 4. 理事長への提案（chairmanProposals）

#### 表示内容（lines 134-153）
```typescript
const chairmanProposals = [
  {
    id: 'prop-1',
    title: '議題化プロセスの法人全体展開',
    description: '現在3施設で試験運用中のVoiceDrive議題化プロセスを、2026年4月より全10施設に展開することを提案します。',
    impact: '職員エンゲージメント向上、組織課題の早期発見・解決',
    requiredBudget: '約800万円',
    timeline: '2026年1月準備開始、4月本格運用',
    status: 'pending_review'
  },
  // ... 2提案
];
```

#### 必要な新規テーブル: `ChairmanProposal`

```prisma
model ChairmanProposal {
  id                  String    @id @default(cuid())

  // 提案情報
  title               String
  description         String    @db.Text
  impact              String    @db.Text                        // 期待効果
  requiredBudget      String                                    // "約800万円"
  budgetAmount        Decimal?  @db.Decimal(15, 2)             // 数値（集計用）
  timeline            String    @db.Text                        // "2026年1月準備開始、4月本格運用"

  // ステータス
  status              String    @default("draft")               // "draft", "pending_review", "approved", "rejected", "implemented"
  submittedAt         DateTime? @map("submitted_at")
  reviewedAt          DateTime? @map("reviewed_at")
  reviewedBy          String?   @map("reviewed_by")             // User ID（理事長）
  reviewComments      String?   @db.Text @map("review_comments")

  // 関連
  relatedBoardMeetingId String? @map("related_board_meeting_id")
  documentUrl         String?   @map("document_url")            // 提案書PDF

  // メタ
  createdBy           String    @map("created_by")              // User ID
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  creator             User          @relation("ProposalCreator", fields: [createdBy], references: [id])
  reviewer            User?         @relation("ProposalReviewer", fields: [reviewedBy], references: [id])
  relatedBoardMeeting BoardMeeting? @relation(fields: [relatedBoardMeetingId], references: [id])

  @@index([status])
  @@index([createdBy])
  @@index([relatedBoardMeetingId])
  @@map("chairman_proposals")
}
```

---

### 5. 議題化プロセス統括サマリー（agendaProcessSummary）

#### 表示内容（lines 156-164）
```typescript
const agendaProcessSummary = {
  totalVoices: 1247,                // 総投稿数
  committeeReviewed: 342,           // 委員会レビュー数
  executiveReported: 89,            // エグゼクティブ報告数
  boardAgenda: 6,                   // 理事会議題数
  implementedActions: 127,          // 実施済みアクション数
  avgProcessTime: '28日',           // 平均処理時間
  participationRate: '68%'          // 参加率
};
```

#### データソース分析

| 項目 | 計算ロジック | 使用テーブル |
|------|------------|------------|
| totalVoices | COUNT(Post) | Post |
| committeeReviewed | COUNT(ManagementCommitteeAgenda) | ManagementCommitteeAgenda |
| executiveReported | COUNT(StrategicInsight) or GeneratedReport | StrategicInsight / GeneratedReport |
| boardAgenda | COUNT(BoardMeetingAgenda) | BoardMeetingAgenda |
| implementedActions | COUNT(ManagementCommitteeAgenda WHERE implementationStatus = 'completed') | ManagementCommitteeAgenda |
| avgProcessTime | AVG(resolvedAt - createdAt) WHERE resolved | Post |
| participationRate | UNIQUE(authorId) / totalEmployees * 100 | Post / 医療システムAPI |

**結論**: 既存テーブルで対応可能（集計クエリのみ）

---

## 🗂️ 必要なDB変更まとめ

### 新規テーブル（3テーブル）

1. **BoardMeeting**: 理事会マスタ
2. **BoardAgendaCandidateSelection**: 議題候補選定履歴
3. **ChairmanProposal**: 理事長への提案

### 既存テーブル拡張（2テーブル）

1. **BoardMeetingAgenda**: 議題準備状況フィールド追加（9フィールド）
2. **GeneratedReport**: 理事会資料との関連付け（リレーション追加）

### リレーション追加（Userモデル）

```prisma
model User {
  // 既存フィールド...

  // BoardPreparation統合実装（2025-10-10）
  createdBoardMeetings        BoardMeeting[]                  @relation("BoardMeetingCreator")
  selectedAgendaCandidates    BoardAgendaCandidateSelection[] @relation("AgendaSelector")
  createdProposals            ChairmanProposal[]              @relation("ProposalCreator")
  reviewedProposals           ChairmanProposal[]              @relation("ProposalReviewer")
}
```

---

## 📊 サービス層設計

### BoardPreparationService

```typescript
export class BoardPreparationService {
  /**
   * 次回理事会情報を取得
   */
  async getNextBoardMeeting(): Promise<BoardMeetingInfo> {
    const meeting = await prisma.boardMeeting.findFirst({
      where: {
        meetingDate: { gte: new Date() }
      },
      orderBy: { meetingDate: 'asc' },
      include: {
        agendas: true
      }
    });

    if (!meeting) return null;

    // 準備状況を計算
    const totalAgendas = meeting.agendas.length;
    const finalized = meeting.agendas.filter(a => a.preparationStatus === 'finalized').length;
    const progress = totalAgendas > 0 ? (finalized / totalAgendas) * 100 : 0;

    return {
      date: meeting.meetingDate,
      time: meeting.startTime,
      location: meeting.location,
      attendees: meeting.expectedAttendees,
      expectedDuration: meeting.expectedDuration,
      status: this.calculateMeetingStatus(meeting),
      preparationProgress: Math.round(progress)
    };
  }

  /**
   * 議題候補一覧を取得
   */
  async getAgendaCandidates(boardMeetingId: string): Promise<BoardAgendaItem[]> {
    const agendas = await prisma.boardMeetingAgenda.findMany({
      where: {
        meetingDate: {
          // 理事会の日付と一致
        }
      },
      include: {
        presenter: true,
        sourceReportRef: true
      },
      orderBy: { agendaOrder: 'asc' }
    });

    return agendas.map(agenda => ({
      id: agenda.id,
      title: agenda.item,
      category: agenda.category,
      priority: agenda.priority,
      source: agenda.sourceReport,
      preparedBy: agenda.preparedBy,
      status: agenda.preparationStatus,
      documentsReady: agenda.documentsReady,
      presentationReady: agenda.presentationReady,
      estimatedTime: agenda.duration
    }));
  }

  /**
   * 資料準備状況サマリーを取得
   */
  async getPreparationStatus(boardMeetingId: string) {
    const agendas = await prisma.boardMeetingAgenda.findMany({
      where: {
        // meetingDateでフィルタ
      }
    });

    return {
      totalAgendas: agendas.length,
      finalized: agendas.filter(a => a.preparationStatus === 'finalized').length,
      approved: agendas.filter(a => a.preparationStatus === 'approved').length,
      reviewing: agendas.filter(a => a.preparationStatus === 'reviewing').length,
      draft: agendas.filter(a => a.preparationStatus === 'draft').length,
      documentsReady: agendas.filter(a => a.documentsReady).length,
      presentationsReady: agendas.filter(a => a.presentationReady).length
    };
  }

  /**
   * 理事長への提案一覧を取得
   */
  async getChairmanProposals(boardMeetingId?: string) {
    return await prisma.chairmanProposal.findMany({
      where: {
        relatedBoardMeetingId: boardMeetingId,
        status: { in: ['pending_review', 'draft'] }
      },
      include: {
        creator: {
          select: { name: true, department: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 議題化プロセス統括サマリーを取得
   */
  async getAgendaProcessSummary() {
    const [
      totalVoices,
      committeeReviewed,
      executiveReported,
      boardAgenda,
      implementedActions
    ] = await Promise.all([
      prisma.post.count(),
      prisma.managementCommitteeAgenda.count(),
      prisma.strategicInsight.count(),
      prisma.boardMeetingAgenda.count(),
      prisma.managementCommitteeAgenda.count({
        where: { implementationStatus: 'completed' }
      })
    ]);

    // 平均処理時間を計算
    const resolvedPosts = await prisma.post.findMany({
      where: {
        postStatus: 'RESOLVED',
        resolvedAt: { not: null }
      },
      select: { createdAt: true, resolvedAt: true }
    });

    const avgDays = resolvedPosts.reduce((sum, post) => {
      const days = Math.floor(
        (post.resolvedAt.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0) / resolvedPosts.length;

    // 参加率を計算（医療システムAPIから職員総数を取得）
    const uniqueAuthors = await prisma.post.findMany({
      select: { authorId: true },
      distinct: ['authorId']
    });
    const totalEmployees = await this.getTotalEmployeeCount();
    const participationRate = (uniqueAuthors.length / totalEmployees) * 100;

    return {
      totalVoices,
      committeeReviewed,
      executiveReported,
      boardAgenda,
      implementedActions,
      avgProcessTime: `${Math.round(avgDays)}日`,
      participationRate: `${Math.round(participationRate)}%`
    };
  }

  /**
   * 議題候補を選定
   */
  async selectAgendaCandidate(
    boardMeetingId: string,
    agendaId: string,
    selectedBy: string,
    selectionReason?: string
  ) {
    return await prisma.boardAgendaCandidateSelection.create({
      data: {
        boardMeetingId,
        agendaId,
        selectedBy,
        selectionReason
      }
    });
  }

  /**
   * 議題準備ステータスを更新
   */
  async updateAgendaPreparationStatus(
    agendaId: string,
    status: 'draft' | 'reviewing' | 'approved' | 'finalized',
    documentsReady?: boolean,
    presentationReady?: boolean
  ) {
    return await prisma.boardMeetingAgenda.update({
      where: { id: agendaId },
      data: {
        preparationStatus: status,
        documentsReady: documentsReady ?? undefined,
        presentationReady: presentationReady ?? undefined
      }
    });
  }

  /**
   * 理事長への提案を作成
   */
  async createChairmanProposal(
    data: {
      title: string;
      description: string;
      impact: string;
      requiredBudget: string;
      timeline: string;
      createdBy: string;
      relatedBoardMeetingId?: string;
    }
  ) {
    return await prisma.chairmanProposal.create({
      data: {
        ...data,
        status: 'draft'
      }
    });
  }

  /**
   * 理事長への提案を提出
   */
  async submitProposalToChairman(proposalId: string) {
    return await prisma.chairmanProposal.update({
      where: { id: proposalId },
      data: {
        status: 'pending_review',
        submittedAt: new Date()
      }
    });
  }

  /**
   * 理事会準備状況を計算
   */
  private calculateMeetingStatus(meeting: any): string {
    const agendas = meeting.agendas || [];
    const totalAgendas = agendas.length;

    if (totalAgendas === 0) return 'planning';

    const finalized = agendas.filter(a => a.preparationStatus === 'finalized').length;
    const approved = agendas.filter(a => a.preparationStatus === 'approved').length;

    if (finalized === totalAgendas) return 'materials_ready';
    if (finalized + approved >= totalAgendas * 0.5) return 'agenda_draft';
    return 'planning';
  }

  /**
   * 医療システムから職員総数を取得
   */
  private async getTotalEmployeeCount(): Promise<number> {
    // 医療システムAPIを呼び出し
    // GET /api/v2/employees/count
    return 1500; // 仮の値
  }
}
```

---

## 🔌 必要なAPI

### VoiceDrive側APIエンドポイント

#### 1. GET /api/board-preparation/next-meeting
次回理事会情報を取得

**レスポンス例**:
```json
{
  "meeting": {
    "id": "board-2025-10-20",
    "date": "2025-10-20",
    "time": "14:00",
    "location": "本部会議室A",
    "attendees": 12,
    "expectedDuration": 120,
    "status": "materials_ready",
    "preparationProgress": 75
  }
}
```

#### 2. GET /api/board-preparation/agenda-candidates?boardMeetingId={id}
議題候補一覧を取得

**レスポンス例**:
```json
{
  "agendas": [
    {
      "id": "agenda-1",
      "title": "2025年度第2四半期 人事戦略報告",
      "category": "人事戦略",
      "priority": "high",
      "source": "月次議題化プロセスレポート",
      "preparedBy": "戦略企画部",
      "status": "finalized",
      "documentsReady": true,
      "presentationReady": true,
      "estimatedTime": 20
    }
  ]
}
```

#### 3. GET /api/board-preparation/preparation-status?boardMeetingId={id}
資料準備状況サマリーを取得

#### 4. GET /api/board-preparation/chairman-proposals?boardMeetingId={id}
理事長への提案一覧を取得

#### 5. GET /api/board-preparation/agenda-process-summary
議題化プロセス統括サマリーを取得

#### 6. POST /api/board-preparation/select-agenda
議題候補を選定

#### 7. PATCH /api/board-preparation/agendas/{id}/preparation-status
議題準備ステータスを更新

#### 8. POST /api/board-preparation/chairman-proposals
理事長への提案を作成

#### 9. POST /api/board-preparation/chairman-proposals/{id}/submit
理事長への提案を提出

### 医療システム側API

**不要**: BoardPreparationページは完全にVoiceDrive管轄のため、医療システムへの新規API依頼なし

---

## 📅 実装計画

### Phase 1: DBテーブル作成（3日）

**Day 1: 新規テーブル作成**
- `BoardMeeting`テーブル作成
- `BoardAgendaCandidateSelection`テーブル作成
- `ChairmanProposal`テーブル作成

**Day 2: 既存テーブル拡張**
- `BoardMeetingAgenda`に9フィールド追加
- `User`モデルにリレーション追加
- `GeneratedReport`リレーション追加

**Day 3: マイグレーション・初期データ**
- `npx prisma migrate dev --name board-preparation`
- 初期データ投入スクリプト作成
- テストデータ投入

---

### Phase 2: サービス層実装（5日）

**Day 4-5: BoardPreparationService実装**
- `getNextBoardMeeting()`
- `getAgendaCandidates()`
- `getPreparationStatus()`
- `getChairmanProposals()`
- `getAgendaProcessSummary()`

**Day 6-7: 操作系メソッド実装**
- `selectAgendaCandidate()`
- `updateAgendaPreparationStatus()`
- `createChairmanProposal()`
- `submitProposalToChairman()`

**Day 8: 統合テスト**
- サービス層ユニットテスト
- 統合テスト

---

### Phase 3: APIエンドポイント実装（3日）

**Day 9-10: GET APIエンドポイント**
- `/api/board-preparation/next-meeting`
- `/api/board-preparation/agenda-candidates`
- `/api/board-preparation/preparation-status`
- `/api/board-preparation/chairman-proposals`
- `/api/board-preparation/agenda-process-summary`

**Day 11: POST/PATCH APIエンドポイント**
- `/api/board-preparation/select-agenda`
- `/api/board-preparation/agendas/{id}/preparation-status`
- `/api/board-preparation/chairman-proposals`
- `/api/board-preparation/chairman-proposals/{id}/submit`

---

### Phase 4: フロントエンド統合（5日）

**Day 12-13: データフェッチ実装**
- ハードコードデータをAPI呼び出しに置き換え
- React Queryによるデータキャッシング

**Day 14-15: インタラクション実装**
- 議題選定機能
- ステータス更新機能
- 提案作成・提出機能

**Day 16: テスト・調整**
- E2Eテスト
- パフォーマンス最適化

---

### 推定工数まとめ

| Phase | 内容 | 工数 |
|-------|------|------|
| Phase 1 | DBテーブル作成 | 3日 |
| Phase 2 | サービス層実装 | 5日 |
| Phase 3 | APIエンドポイント実装 | 3日 |
| Phase 4 | フロントエンド統合 | 5日 |
| **合計** | | **16日（約3週間）** |

---

## ⚠️ 注意事項・課題

### 1. ExecutiveReportsとの連携

BoardPreparationページは「エグゼクティブレポートから議題を選定」と記載されています。ExecutiveReportsページとの連携が必要です。

**対応**:
- `BoardMeetingAgenda.sourceReportId`を`GeneratedReport.id`に関連付け
- ExecutiveReportsページで生成されたレポートから議題候補を自動抽出する機能を実装

### 2. 理事マスタの管理

現在、理事（Board Members）のマスタデータがありません。

**対応案**:
- `User.accountType`に`board_member`を追加
- または、`BoardMember`テーブルを新規作成

### 3. 議事録管理

理事会開催後の議事録管理機能が必要になる可能性があります。

**対応案**:
- `BoardMeeting.minutesDocumentUrl`を使用
- 議事録作成・承認ワークフローは将来フェーズで実装

### 4. プレゼン資料管理

各議題のプレゼン資料（PowerPoint等）の管理が必要です。

**対応案**:
- `BoardMeetingAgenda.documentUrls`（JSON）を使用
- S3に格納し、署名付きURLを生成

---

## 🎯 成功指標（KPI）

### 機能要件

- ✅ 次回理事会情報が表示される
- ✅ 議題候補が一覧表示される
- ✅ 議題の準備状況が可視化される
- ✅ 理事長への提案が作成・提出できる
- ✅ 議題化プロセス統括サマリーが表示される

### パフォーマンス要件

- 各APIエンドポイントのレスポンスタイム: < 500ms
- ページ初期表示時間: < 2秒
- 議題候補一覧の表示: < 1秒

### データ整合性

- 議題準備状況の集計が正確
- ExecutiveReportsとBoardPreparationの連携が正常動作
- 理事長への提案ワークフローが正常動作

---

## 📞 連絡先

### 開発チーム
- Slack: #board-preparation-dev
- 担当: VoiceDrive開発チーム

### 関連ドキュメント
- [executive-reports_DB要件分析_20251010.md](./executive-reports_DB要件分析_20251010.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
次回レビュー: Phase 1完了後
