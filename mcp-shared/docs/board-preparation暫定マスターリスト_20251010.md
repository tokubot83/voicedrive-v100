# BoardPreparation（理事会準備）暫定マスターリスト

**文書番号**: BOARD-PREP-MASTER-2025-1010-001
**作成日**: 2025年10月10日
**対象ページ**: https://voicedrive-v100.vercel.app/board-preparation
**関連文書**: [board-preparation_DB要件分析_20251010.md](./board-preparation_DB要件分析_20251010.md)

---

## 📋 エグゼクティブサマリー

### データ管理責任
- **VoiceDrive**: 100%（理事会準備機能は完全にVoiceDrive管轄）
- **医療システム**: なし（新規API不要）

### 必要なDB変更
- **新規テーブル**: 3テーブル
- **既存テーブル拡張**: 2テーブル
- **医療システムAPI**: 0件（既存APIのみ使用）

---

## 🗂️ 1. 医療システム側の要件

### 1-1. 必要なAPI

**結論: 新規API不要**

理由:
- BoardPreparationページは既存のVoiceDriveデータ（Post, ManagementCommitteeAgenda, ExecutiveReports）を集約する機能
- 職員総数APIは既に実装済み（`GET /api/v2/employees/count`）

### 1-2. 既存APIの利用

| API | エンドポイント | 利用目的 | 実装状況 |
|-----|--------------|---------|---------|
| 職員総数取得 | `GET /api/v2/employees/count` | 参加率計算用 | ✅ 実装済み |

---

## 🗄️ 2. VoiceDrive側のDB要件

### 2-1. 新規テーブル（3テーブル）

#### テーブル1: `BoardMeeting`（理事会マスタ）

**目的**: 理事会全体の情報を管理

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
  proposals           ChairmanProposal[]

  @@index([meetingDate])
  @@map("board_meetings")
}
```

**初期データ例**:
```json
{
  "meetingDate": "2025-10-20T05:00:00.000Z",
  "startTime": "14:00",
  "location": "本部会議室A",
  "expectedDuration": 120,
  "expectedAttendees": 12,
  "status": "materials_ready",
  "preparationProgress": 75,
  "createdBy": "user-level17-001"
}
```

---

#### テーブル2: `BoardAgendaCandidateSelection`（議題候補選定履歴）

**目的**: 理事会議題の選定プロセスを記録（監査証跡）

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

**初期データ例**:
```json
{
  "boardMeetingId": "board-2025-10-20",
  "agendaId": "agenda-001",
  "selectedBy": "user-level17-001",
  "selectionReason": "2025年度第2四半期の人事戦略報告として重要性が高いため選定",
  "isFinalized": true,
  "statusHistory": [
    {
      "timestamp": "2025-10-05T10:00:00.000Z",
      "from": "draft",
      "to": "reviewing",
      "by": "user-level17-001"
    },
    {
      "timestamp": "2025-10-08T14:30:00.000Z",
      "from": "reviewing",
      "to": "approved",
      "by": "user-level18-001"
    },
    {
      "timestamp": "2025-10-10T09:00:00.000Z",
      "from": "approved",
      "to": "finalized",
      "by": "user-level17-001"
    }
  ]
}
```

---

#### テーブル3: `ChairmanProposal`（理事長への提案）

**目的**: 戦略的重要事項を理事長に提案

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

**初期データ例**:
```json
[
  {
    "title": "議題化プロセスの法人全体展開",
    "description": "現在3施設で試験運用中のVoiceDrive議題化プロセスを、2026年4月より全10施設に展開することを提案します。",
    "impact": "職員エンゲージメント向上、組織課題の早期発見・解決",
    "requiredBudget": "約800万円",
    "budgetAmount": 8000000.00,
    "timeline": "2026年1月準備開始、4月本格運用",
    "status": "pending_review",
    "relatedBoardMeetingId": "board-2025-10-20",
    "createdBy": "user-level17-001"
  },
  {
    "title": "施設間人材ローテーション制度の導入",
    "description": "組織分析により判明した施設間の人材偏在を解消するため、定期的な人材ローテーション制度を提案します。",
    "impact": "スキル平準化、組織活性化、キャリア開発支援",
    "requiredBudget": "約200万円（移動支援費）",
    "budgetAmount": 2000000.00,
    "timeline": "2026年4月第1回実施",
    "status": "draft",
    "relatedBoardMeetingId": "board-2025-10-20",
    "createdBy": "user-level17-001"
  }
]
```

---

### 2-2. 既存テーブル拡張（2テーブル）

#### 拡張1: `BoardMeetingAgenda`（理事会議題）

**追加フィールド**: 議題準備状況を管理するための9フィールド

```prisma
model BoardMeetingAgenda {
  // 既存フィールド...
  id                  String    @id @default(cuid())
  meetingDate         DateTime  @map("meeting_date")
  agendaOrder         Int       @map("agenda_order")
  item                String
  description         String?   @db.Text
  category            String
  duration            Int
  presenterId         String    @map("presenter_id")
  presenterTitle      String    @map("presenter_title")
  relatedAgendaId     String?   @map("related_agenda_id")
  attachments         Json?
  status              String    @default("scheduled")
  actualDuration      Int?      @map("actual_duration")

  // 🆕 理事会準備用フィールド（2025-10-10）
  priority            String?   @default("medium")              // "high", "medium", "low"
  sourceReport        String?   @map("source_report")           // "月次議題化プロセスレポート"
  sourceReportId      String?   @map("source_report_id")        // GeneratedReport ID
  preparedBy          String?   @map("prepared_by")             // "戦略企画部"
  preparationStatus   String?   @default("draft") @map("preparation_status")  // "draft", "reviewing", "approved", "finalized"
  documentsReady      Boolean   @default(false) @map("documents_ready")
  presentationReady   Boolean   @default(false) @map("presentation_ready")
  documentUrls        Json?     @map("document_urls")           // { report: "url", presentation: "url" }

  // 既存リレーション...
  presenter           User                         @relation("BoardPresenter", fields: [presenterId], references: [id])
  relatedAgenda       ManagementCommitteeAgenda?   @relation("BoardRelatedAgenda", fields: [relatedAgendaId], references: [id])

  // 🆕 新規リレーション（2025-10-10）
  sourceReportRef     GeneratedReport?             @relation("AgendaSourceReport", fields: [sourceReportId], references: [id])
  candidateSelections BoardAgendaCandidateSelection[]

  @@unique([meetingDate, agendaOrder])
  @@index([meetingDate])
  @@index([presenterId])
  @@map("board_meeting_agendas")
}
```

**初期データ例（拡張フィールドのみ）**:
```json
[
  {
    "item": "2025年度第2四半期 人事戦略報告",
    "category": "人事戦略",
    "duration": 20,
    "priority": "high",
    "sourceReport": "月次議題化プロセスレポート",
    "sourceReportId": "report-monthly-2025-q2",
    "preparedBy": "戦略企画部",
    "preparationStatus": "finalized",
    "documentsReady": true,
    "presentationReady": true,
    "documentUrls": {
      "report": "https://s3.amazonaws.com/voicedrive/reports/q2-hr-strategy.pdf",
      "presentation": "https://s3.amazonaws.com/voicedrive/presentations/q2-hr-strategy.pptx"
    }
  },
  {
    "item": "施設間人材配置最適化提案",
    "category": "組織改善",
    "duration": 15,
    "priority": "high",
    "sourceReport": "組織分析レポート",
    "sourceReportId": "report-org-analytics-2025-09",
    "preparedBy": "戦略企画部",
    "preparationStatus": "approved",
    "documentsReady": true,
    "presentationReady": false
  },
  {
    "item": "職員エンゲージメント向上施策の中間報告",
    "category": "カルチャー開発",
    "duration": 10,
    "priority": "medium",
    "sourceReport": "カルチャー開発委員会",
    "preparedBy": "人事部",
    "preparationStatus": "reviewing",
    "documentsReady": true,
    "presentationReady": true
  },
  {
    "item": "委員会制度改革の進捗と成果",
    "category": "ガバナンス",
    "duration": 15,
    "priority": "medium",
    "sourceReport": "委員会効果測定レポート",
    "preparedBy": "戦略企画部",
    "preparationStatus": "approved",
    "documentsReady": true,
    "presentationReady": true
  },
  {
    "item": "VoiceDrive議題化プロセス導入成果報告",
    "category": "システム改善",
    "duration": 25,
    "priority": "high",
    "sourceReport": "ボイス分析統括レポート",
    "preparedBy": "人事部・戦略企画部",
    "preparationStatus": "finalized",
    "documentsReady": true,
    "presentationReady": true
  },
  {
    "item": "次年度予算編成方針（人事関連）",
    "category": "予算",
    "duration": 20,
    "priority": "high",
    "sourceReport": "戦略HR計画",
    "preparedBy": "戦略企画部",
    "preparationStatus": "draft",
    "documentsReady": false,
    "presentationReady": false
  }
]
```

---

#### 拡張2: `User`（ユーザー）

**追加リレーション**: BoardPreparation関連のリレーション4つ

```prisma
model User {
  // 既存フィールド...
  id                          String    @id @default(cuid())
  employeeId                  String    @unique @map("employee_id")
  email                       String    @unique
  name                        String
  // ... その他既存フィールド

  // 既存リレーション...
  posts                       Post[]
  comments                    Comment[]
  // ... その他既存リレーション

  // 🆕 BoardPreparation統合実装（2025-10-10）
  createdBoardMeetings        BoardMeeting[]                  @relation("BoardMeetingCreator")
  selectedAgendaCandidates    BoardAgendaCandidateSelection[] @relation("AgendaSelector")
  createdProposals            ChairmanProposal[]              @relation("ProposalCreator")
  reviewedProposals           ChairmanProposal[]              @relation("ProposalReviewer")

  @@map("users")
}
```

---

## 📊 3. データフロー図

### 3-1. 理事会準備プロセス

```
1. ExecutiveReports生成
   ↓
2. 戦略企画部長が議題候補を選定
   → BoardAgendaCandidateSelection作成
   ↓
3. 各議題の資料を準備
   → BoardMeetingAgenda.preparationStatus更新
   → BoardMeetingAgenda.documentsReady = true
   → BoardMeetingAgenda.presentationReady = true
   ↓
4. 理事長への提案作成（必要に応じて）
   → ChairmanProposal作成
   → status: draft → pending_review
   ↓
5. 理事会開催
   → BoardMeeting.status = "confirmed"
   ↓
6. 理事会完了
   → BoardMeeting.status = "completed"
   → 議事録作成（minutesDocumentUrl）
```

---

## 🔧 4. 実装スクリプト

### 4-1. Prismaマイグレーション

```bash
# DBマイグレーション実行
npx prisma migrate dev --name board-preparation-implementation

# Prisma Client再生成
npx prisma generate

# DB確認
npx prisma studio
```

### 4-2. 初期データ投入スクリプト

```typescript
// scripts/seed-board-preparation.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. BoardMeeting作成
  const boardMeeting = await prisma.boardMeeting.create({
    data: {
      meetingDate: new Date('2025-10-20'),
      startTime: '14:00',
      location: '本部会議室A',
      expectedDuration: 120,
      expectedAttendees: 12,
      status: 'materials_ready',
      preparationProgress: 75,
      createdBy: 'user-level17-001'
    }
  });

  console.log('Created BoardMeeting:', boardMeeting.id);

  // 2. BoardMeetingAgenda更新（既存議題に準備状況を追加）
  const agendas = [
    {
      item: '2025年度第2四半期 人事戦略報告',
      priority: 'high',
      preparedBy: '戦略企画部',
      preparationStatus: 'finalized',
      documentsReady: true,
      presentationReady: true
    },
    // ... 他の議題
  ];

  for (const agendaData of agendas) {
    await prisma.boardMeetingAgenda.updateMany({
      where: { item: agendaData.item },
      data: {
        priority: agendaData.priority,
        preparedBy: agendaData.preparedBy,
        preparationStatus: agendaData.preparationStatus,
        documentsReady: agendaData.documentsReady,
        presentationReady: agendaData.presentationReady
      }
    });
  }

  console.log('Updated BoardMeetingAgendas');

  // 3. ChairmanProposal作成
  const proposals = await prisma.chairmanProposal.createMany({
    data: [
      {
        title: '議題化プロセスの法人全体展開',
        description: '現在3施設で試験運用中のVoiceDrive議題化プロセスを、2026年4月より全10施設に展開することを提案します。',
        impact: '職員エンゲージメント向上、組織課題の早期発見・解決',
        requiredBudget: '約800万円',
        budgetAmount: 8000000.00,
        timeline: '2026年1月準備開始、4月本格運用',
        status: 'pending_review',
        relatedBoardMeetingId: boardMeeting.id,
        createdBy: 'user-level17-001'
      },
      {
        title: '施設間人材ローテーション制度の導入',
        description: '組織分析により判明した施設間の人材偏在を解消するため、定期的な人材ローテーション制度を提案します。',
        impact: 'スキル平準化、組織活性化、キャリア開発支援',
        requiredBudget: '約200万円（移動支援費）',
        budgetAmount: 2000000.00,
        timeline: '2026年4月第1回実施',
        status: 'draft',
        relatedBoardMeetingId: boardMeeting.id,
        createdBy: 'user-level17-001'
      }
    ]
  });

  console.log('Created ChairmanProposals:', proposals.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**実行方法**:
```bash
npx ts-node scripts/seed-board-preparation.ts
```

---

## 📅 5. 実装スケジュール

### Phase 1: DBテーブル作成（3日）
- Day 1: 新規テーブル作成（BoardMeeting, BoardAgendaCandidateSelection, ChairmanProposal）
- Day 2: 既存テーブル拡張（BoardMeetingAgenda, User）
- Day 3: マイグレーション実行・初期データ投入

### Phase 2: サービス層実装（5日）
- Day 4-5: BoardPreparationService実装
- Day 6-7: 操作系メソッド実装
- Day 8: ユニットテスト・統合テスト

### Phase 3: APIエンドポイント実装（3日）
- Day 9-10: GET APIエンドポイント実装
- Day 11: POST/PATCH APIエンドポイント実装

### Phase 4: フロントエンド統合（5日）
- Day 12-13: データフェッチ実装
- Day 14-15: インタラクション実装
- Day 16: E2Eテスト・最適化

**合計: 16日（約3週間）**

---

## ⚠️ 6. 注意事項

### 6-1. ExecutiveReportsとの連携

BoardMeetingAgenda.sourceReportIdは、ExecutiveReportsページで生成された`GeneratedReport.id`を参照します。ExecutiveReports実装時に連携を確保してください。

### 6-2. 理事マスタの管理

現在、理事（Board Members）のマスタデータがありません。将来的に`User.accountType = 'board_member'`を追加するか、`BoardMember`テーブルを新規作成する必要があります。

### 6-3. S3ストレージ設定

プレゼン資料や報告書PDFはS3に格納します。以下の設定が必要です：

```typescript
// S3バケット構造
voicedrive-documents/
  ├── board-meetings/
  │   ├── 2025-10-20/
  │   │   ├── agenda-001-report.pdf
  │   │   ├── agenda-001-presentation.pptx
  │   │   ├── agenda-002-report.pdf
  │   │   └── ...
  │   └── ...
  └── chairman-proposals/
      ├── proposal-001.pdf
      └── ...
```

**S3ライフサイクルポリシー**:
- 理事会資料: 5年保存
- 提案書: 3年保存

---

## 🎯 7. 成功指標

### 機能要件
- ✅ 次回理事会情報が正しく表示される
- ✅ 議題候補の選定・管理ができる
- ✅ 資料準備状況がリアルタイムで可視化される
- ✅ 理事長への提案が作成・提出できる
- ✅ 議題化プロセス統括サマリーが正確に表示される

### データ整合性
- ✅ BoardMeetingとBoardMeetingAgendaのリレーションが正常
- ✅ ExecutiveReportsからの議題自動抽出が動作
- ✅ 理事長への提案ワークフローが正常

### パフォーマンス
- 各APIエンドポイント: < 500ms
- ページ初期表示: < 2秒

---

## 📞 8. 連絡先

### 開発チーム
- Slack: #board-preparation-dev
- 担当: VoiceDrive開発チーム

### 関連ドキュメント
- [board-preparation_DB要件分析_20251010.md](./board-preparation_DB要件分析_20251010.md)
- [executive-reports_DB要件分析_20251010.md](./executive-reports_DB要件分析_20251010.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
承認: 未承認（レビュー待ち）
