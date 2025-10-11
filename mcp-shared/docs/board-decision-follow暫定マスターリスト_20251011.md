# BoardDecisionFollow（理事会決定事項フォロー）暫定マスターリスト

**文書番号**: VD-MASTER-BOARD-DECISION-FOLLOW-20251011
**作成日**: 2025年10月11日
**対象ページ**: https://voicedrive-v100.vercel.app/board-decision-follow
**前提**: DB要件分析書（board-decision-follow_DB要件分析_20251011.md）に基づく

---

## 📋 エグゼクティブサマリー

### システム間責任分担

| 項目 | 医療システム | VoiceDrive | 備考 |
|------|------------|-----------|------|
| 理事会決定事項管理 | ❌ | ✅ | VoiceDrive管轄 |
| マイルストーン管理 | ❌ | ✅ | VoiceDrive管轄 |
| 施設別実施状況管理 | ❌ | ✅ | VoiceDrive管轄 |
| 施設マスタ | ✅ | キャッシュ | 医療システムが管理 |
| 部門マスタ | ✅ | キャッシュ | 医療システムが管理 |

### 実装サマリー

- **医療システムAPI**: 0個（既存APIで対応）
- **VoiceDrive新規テーブル**: 3個
- **VoiceDrive既存テーブル拡張**: 1個
- **VoiceDrive新規API**: 5個

---

## 🏥 医療システム側の対応

### API要件

#### ✅ 既存API（追加実装不要）

1. **GET /api/v2/facilities**
   - 施設マスタ取得
   - BoardDecisionFollow ページで使用
   - 状況: **既存APIで対応可能**

2. **GET /api/v2/departments**
   - 部門マスタ取得
   - 決定事項作成時に担当部門を選択
   - 状況: **既存APIで対応可能**

---

### 結論: 医療システム側の追加実装不要 ✅

理事会決定事項のフォロー機能は **100% VoiceDrive内部で完結** します。

---

## 🗄️ VoiceDrive側のDB実装

### 新規テーブル1: BoardDecision（理事会決定事項）

```prisma
model BoardDecision {
  id                      String    @id @default(cuid())

  // 理事会情報
  boardMeetingId          String    @map("board_meeting_id")
  meetingDate             DateTime  @map("meeting_date")

  // 決定事項情報
  title                   String
  category                String    // "システム導入", "人事制度", "IT・システム", "人材育成"
  description             String    @db.Text
  decision                String    @db.Text  // 理事会決定内容

  // 実施情報
  implementationDeadline  DateTime  @map("implementation_deadline")
  responsibleDept         String    @map("responsible_dept")  // 担当部門名（キャッシュ）
  responsibleDeptId       String?   @map("responsible_dept_id")  // 医療システム部門ID
  affectedFacilities      Json      @map("affected_facilities")  // 影響施設ID配列

  // 進捗管理
  status                  String    @default("on_track")  // "completed", "on_track", "at_risk", "delayed"
  progress                Int       @default(0)  // 0-100
  lastUpdate              DateTime  @default(now()) @map("last_update")

  // メタデータ
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  // リレーション
  boardMeeting            BoardMeeting @relation("BoardDecisions", fields: [boardMeetingId], references: [id], onDelete: Cascade)
  milestones              BoardDecisionMilestone[]
  facilityImplementations BoardDecisionFacilityImplementation[]

  @@index([boardMeetingId])
  @@index([status])
  @@index([implementationDeadline])
  @@index([category])
  @@map("board_decisions")
}
```

**初期データ例**:
```sql
INSERT INTO board_decisions (
  id, board_meeting_id, meeting_date, title, category,
  description, decision, implementation_deadline,
  responsible_dept, affected_facilities, status, progress
) VALUES
(
  'dec-001',
  'bm-2025-07',
  '2025-07-15',
  'VoiceDrive議題化プロセス全施設展開',
  'システム導入',
  '現在3施設で試験運用中のVoiceDrive議題化プロセスを、2026年4月より全10施設に展開する。',
  '予算800万円を承認。2026年4月本格運用開始。',
  '2026-04-01',
  '人事部・IT部',
  '["FAC001","FAC002","FAC003","FAC004","FAC005","FAC006","FAC007","FAC008","FAC009","FAC010"]',
  'on_track',
  45
),
(
  'dec-002',
  'bm-2025-07',
  '2025-07-15',
  '施設間人材ローテーション制度試験導入',
  '人事制度',
  '施設間での人材融通により、夜勤負担の平準化と職員のスキル向上を図る。',
  '予算500万円を承認。2026年4月より6ヶ月間の試験運用。',
  '2026-04-01',
  '戦略企画部・人事部',
  '["FAC001","FAC002","FAC003","FAC004"]',
  'on_track',
  38
);
```

---

### 新規テーブル2: BoardDecisionMilestone（マイルストーン）

```prisma
model BoardDecisionMilestone {
  id                String        @id @default(cuid())
  boardDecisionId   String        @map("board_decision_id")

  // マイルストーン情報
  title             String
  deadline          DateTime
  status            String        @default("pending")  // "completed", "in_progress", "pending", "delayed"
  assignee          String        // 担当者名（キャッシュ）
  assigneeId        String?       @map("assignee_id")  // User ID
  sortOrder         Int           @default(0) @map("sort_order")  // 表示順

  // メタデータ
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  completedAt       DateTime?     @map("completed_at")

  // リレーション
  boardDecision     BoardDecision @relation(fields: [boardDecisionId], references: [id], onDelete: Cascade)

  @@index([boardDecisionId])
  @@index([status])
  @@index([deadline])
  @@index([sortOrder])
  @@map("board_decision_milestones")
}
```

**初期データ例**:
```sql
-- VoiceDrive展開のマイルストーン
INSERT INTO board_decision_milestones (
  id, board_decision_id, title, deadline, status, assignee, sort_order
) VALUES
('m1', 'dec-001', 'システム改修・機能拡張', '2025-12-31', 'in_progress', 'IT部', 0),
('m2', 'dec-001', '各施設での説明会開催', '2026-01-31', 'pending', '人事部', 1),
('m3', 'dec-001', '管理者向けトレーニング', '2026-02-28', 'pending', '人事部', 2),
('m4', 'dec-001', '本格運用開始', '2026-04-01', 'pending', '人事部・IT部', 3);

-- 人材ローテーションのマイルストーン
INSERT INTO board_decision_milestones (
  id, board_decision_id, title, deadline, status, assignee, sort_order
) VALUES
('m5', 'dec-002', '制度詳細設計', '2025-11-30', 'in_progress', '戦略企画部', 0),
('m6', 'dec-002', '対象職員への説明・同意取得', '2026-01-31', 'pending', '人事部', 1),
('m7', 'dec-002', 'システム・勤怠管理整備', '2026-02-28', 'pending', 'IT部', 2),
('m8', 'dec-002', '試験運用開始', '2026-04-01', 'pending', '戦略企画部', 3);
```

---

### 新規テーブル3: BoardDecisionFacilityImplementation（施設別実施状況）

```prisma
model BoardDecisionFacilityImplementation {
  id                String        @id @default(cuid())
  boardDecisionId   String        @map("board_decision_id")

  // 施設情報
  facilityId        String        @map("facility_id")  // 医療システム施設ID
  facilityName      String        @map("facility_name")  // 施設名（キャッシュ）

  // 実施状況
  status            String        @default("not_started")  // "completed", "in_progress", "not_started"
  progress          Int           @default(0)  // 0-100
  note              String?       // 備考

  // スケジュール
  startedAt         DateTime?     @map("started_at")
  completedAt       DateTime?     @map("completed_at")

  // メタデータ
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  // リレーション
  boardDecision     BoardDecision @relation(fields: [boardDecisionId], references: [id], onDelete: Cascade)

  @@unique([boardDecisionId, facilityId])
  @@index([boardDecisionId])
  @@index([facilityId])
  @@index([status])
  @@map("board_decision_facility_implementations")
}
```

**初期データ例**:
```sql
-- VoiceDrive展開の施設別実施状況（dec-001）
INSERT INTO board_decision_facility_implementations (
  id, board_decision_id, facility_id, facility_name, status, progress, note, started_at, completed_at
) VALUES
('impl-001', 'dec-001', 'FAC001', '中央総合病院', 'completed', 100, '試験運用施設。順調に稼働中。', '2025-04-01', '2025-09-30'),
('impl-002', 'dec-001', 'FAC002', '北部医療センター', 'completed', 100, '試験運用施設。参加率68%達成。', '2025-04-01', '2025-09-30'),
('impl-003', 'dec-001', 'FAC003', '桜ヶ丘総合病院', 'completed', 100, '試験運用施設。良好な成果。', '2025-04-01', '2025-09-30'),
('impl-004', 'dec-001', 'FAC004', '海浜医療センター', 'in_progress', 60, '説明会実施済。管理者トレーニング中。', '2025-10-01', NULL),
('impl-005', 'dec-001', 'FAC005', '東部リハビリ病院', 'in_progress', 45, '説明会実施済。', '2025-10-15', NULL),
('impl-006', 'dec-001', 'FAC006', '山手リハビリセンター', 'in_progress', 40, '説明会予定。', '2025-11-01', NULL),
('impl-007', 'dec-001', 'FAC007', '南部クリニック', 'not_started', 0, '2026年2月説明会予定。', NULL, NULL),
('impl-008', 'dec-001', 'FAC008', '青葉台クリニック', 'not_started', 0, '2026年2月説明会予定。', NULL, NULL),
('impl-009', 'dec-001', 'FAC009', '西部介護施設', 'not_started', 0, '2026年3月説明会予定。', NULL, NULL),
('impl-010', 'dec-001', 'FAC010', '緑の森介護センター', 'not_started', 0, '2026年3月説明会予定。', NULL, NULL);
```

---

### 既存テーブル拡張: BoardMeeting

```prisma
model BoardMeeting {
  // ... 既存フィールド

  // 🆕 決定事項リレーション追加
  decisions           BoardDecision[]      @relation("BoardDecisions")
}
```

**マイグレーション**:
```sql
-- リレーション追加のため、既存のBoardMeetingテーブルへの変更は不要
-- BoardDecisionテーブル作成時に外部キー制約が自動生成される
```

---

## 🔄 Prismaマイグレーション

### マイグレーションファイル

```bash
# マイグレーション作成
npx prisma migrate dev --name add_board_decision_follow_tables
```

**生成されるSQL** (`migrations/xxxxx_add_board_decision_follow_tables/migration.sql`):

```sql
-- BoardDecision テーブル作成
CREATE TABLE "board_decisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "board_meeting_id" TEXT NOT NULL,
    "meeting_date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "implementation_deadline" DATETIME NOT NULL,
    "responsible_dept" TEXT NOT NULL,
    "responsible_dept_id" TEXT,
    "affected_facilities" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'on_track',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "last_update" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "board_decisions_board_meeting_id_fkey" FOREIGN KEY ("board_meeting_id") REFERENCES "board_meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- BoardDecisionMilestone テーブル作成
CREATE TABLE "board_decision_milestones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "board_decision_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignee" TEXT NOT NULL,
    "assignee_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "completed_at" DATETIME,
    CONSTRAINT "board_decision_milestones_board_decision_id_fkey" FOREIGN KEY ("board_decision_id") REFERENCES "board_decisions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- BoardDecisionFacilityImplementation テーブル作成
CREATE TABLE "board_decision_facility_implementations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "board_decision_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "facility_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "board_decision_facility_implementations_board_decision_id_fkey" FOREIGN KEY ("board_decision_id") REFERENCES "board_decisions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- インデックス作成
CREATE INDEX "board_decisions_board_meeting_id_idx" ON "board_decisions"("board_meeting_id");
CREATE INDEX "board_decisions_status_idx" ON "board_decisions"("status");
CREATE INDEX "board_decisions_implementation_deadline_idx" ON "board_decisions"("implementation_deadline");
CREATE INDEX "board_decisions_category_idx" ON "board_decisions"("category");

CREATE INDEX "board_decision_milestones_board_decision_id_idx" ON "board_decision_milestones"("board_decision_id");
CREATE INDEX "board_decision_milestones_status_idx" ON "board_decision_milestones"("status");
CREATE INDEX "board_decision_milestones_deadline_idx" ON "board_decision_milestones"("deadline");
CREATE INDEX "board_decision_milestones_sort_order_idx" ON "board_decision_milestones"("sort_order");

CREATE INDEX "board_decision_facility_implementations_board_decision_id_idx" ON "board_decision_facility_implementations"("board_decision_id");
CREATE INDEX "board_decision_facility_implementations_facility_id_idx" ON "board_decision_facility_implementations"("facility_id");
CREATE INDEX "board_decision_facility_implementations_status_idx" ON "board_decision_facility_implementations"("status");

-- ユニーク制約
CREATE UNIQUE INDEX "board_decision_facility_implementations_board_decision_id_facility_id_key" ON "board_decision_facility_implementations"("board_decision_id", "facility_id");
```

---

## 🌐 VoiceDrive API実装

### API 1: GET /api/board-decisions

**実装ファイル**: `src/app/api/board-decisions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || 'all';
  const category = searchParams.get('category');

  const where: any = {};
  if (status !== 'all') {
    where.status = status;
  }
  if (category) {
    where.category = category;
  }

  const decisions = await prisma.boardDecision.findMany({
    where,
    include: {
      milestones: {
        orderBy: { sortOrder: 'asc' }
      },
      facilityImplementations: true,
      boardMeeting: true
    },
    orderBy: { implementationDeadline: 'asc' }
  });

  // ステータスサマリー計算
  const summary = {
    completed: decisions.filter(d => d.status === 'completed').length,
    on_track: decisions.filter(d => d.status === 'on_track').length,
    at_risk: decisions.filter(d => d.status === 'at_risk').length,
    delayed: decisions.filter(d => d.status === 'delayed').length
  };

  return NextResponse.json({ decisions, summary });
}
```

---

### API 2: GET /api/board-decisions/[id]/facility-implementations

**実装ファイル**: `src/app/api/board-decisions/[id]/facility-implementations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const implementations = await prisma.boardDecisionFacilityImplementation.findMany({
    where: { boardDecisionId: params.id },
    orderBy: { facilityName: 'asc' }
  });

  return NextResponse.json({
    decisionId: params.id,
    implementations
  });
}
```

---

### API 3: PUT /api/board-decisions/[id]/milestones/[milestoneId]

**実装ファイル**: `src/app/api/board-decisions/[id]/milestones/[milestoneId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const body = await request.json();

  // マイルストーン更新
  const milestone = await prisma.boardDecisionMilestone.update({
    where: { id: params.milestoneId },
    data: {
      status: body.status,
      completedAt: body.completedAt ? new Date(body.completedAt) : undefined
    }
  });

  // 親の決定事項の進捗を再計算
  const milestones = await prisma.boardDecisionMilestone.findMany({
    where: { boardDecisionId: params.id }
  });

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  // ステータス判定
  const now = new Date();
  const hasDelayed = milestones.some(m =>
    m.status !== 'completed' && m.deadline < now
  );
  const hasAtRisk = milestones.some(m => {
    const daysToDeadline = Math.floor((m.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return m.status !== 'completed' && daysToDeadline > 0 && daysToDeadline <= 7;
  });

  let status = 'on_track';
  if (progress === 100) {
    status = 'completed';
  } else if (hasDelayed) {
    status = 'delayed';
  } else if (hasAtRisk) {
    status = 'at_risk';
  }

  const decision = await prisma.boardDecision.update({
    where: { id: params.id },
    data: { progress, status }
  });

  return NextResponse.json({
    milestone,
    decisionProgress: {
      id: decision.id,
      progress: decision.progress,
      status: decision.status
    }
  });
}
```

---

### API 4: PUT /api/board-decisions/[id]/facility-implementations/[facilityId]

**実装ファイル**: `src/app/api/board-decisions/[id]/facility-implementations/[facilityId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; facilityId: string } }
) {
  const body = await request.json();

  // 施設別実施状況更新
  const implementation = await prisma.boardDecisionFacilityImplementation.update({
    where: {
      boardDecisionId_facilityId: {
        boardDecisionId: params.id,
        facilityId: params.facilityId
      }
    },
    data: {
      status: body.status,
      progress: body.progress,
      note: body.note
    }
  });

  // 全体進捗を再計算（全施設の平均）
  const implementations = await prisma.boardDecisionFacilityImplementation.findMany({
    where: { boardDecisionId: params.id }
  });

  const totalProgress = implementations.reduce((sum, impl) => sum + impl.progress, 0);
  const averageProgress = Math.round(totalProgress / implementations.length);

  const decision = await prisma.boardDecision.update({
    where: { id: params.id },
    data: { progress: averageProgress }
  });

  return NextResponse.json({
    implementation,
    overallProgress: {
      id: decision.id,
      progress: decision.progress
    }
  });
}
```

---

### API 5: POST /api/board-decisions

**実装ファイル**: `src/app/api/board-decisions/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();

  // 施設名を医療システムから取得
  const facilitiesResponse = await fetch('https://medical-system/api/v2/facilities');
  const facilitiesData = await facilitiesResponse.json();
  const facilitiesMap = new Map(
    facilitiesData.facilities.map(f => [f.facilityId, f.name])
  );

  // 理事会情報取得
  const boardMeeting = await prisma.boardMeeting.findUnique({
    where: { id: body.boardMeetingId }
  });

  // 決定事項作成
  const decision = await prisma.boardDecision.create({
    data: {
      boardMeetingId: body.boardMeetingId,
      meetingDate: boardMeeting!.meetingDate,
      title: body.title,
      category: body.category,
      description: body.description,
      decision: body.decision,
      implementationDeadline: new Date(body.implementationDeadline),
      responsibleDept: body.responsibleDept,
      affectedFacilities: body.affectedFacilities,
      status: 'on_track',
      progress: 0
    }
  });

  // マイルストーン作成
  await prisma.boardDecisionMilestone.createMany({
    data: body.milestones.map((m: any, index: number) => ({
      boardDecisionId: decision.id,
      title: m.title,
      deadline: new Date(m.deadline),
      assignee: m.assignee,
      status: 'pending',
      sortOrder: index
    }))
  });

  // 施設別実施状況を初期化
  await prisma.boardDecisionFacilityImplementation.createMany({
    data: body.affectedFacilities.map((facilityId: string) => ({
      boardDecisionId: decision.id,
      facilityId,
      facilityName: facilitiesMap.get(facilityId) || facilityId,
      status: 'not_started',
      progress: 0
    }))
  });

  return NextResponse.json({ decision });
}
```

---

## 📅 実装スケジュール

### Week 1: DB構築（2日間）

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| Day 1 | schema.prisma更新 | Backend | ⏳ |
| Day 1 | マイグレーション実行 | Backend | ⏳ |
| Day 2 | 初期データ投入 | Backend | ⏳ |
| Day 2 | テストデータ作成 | Backend | ⏳ |

### Week 2: サービス層・API（5日間）

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| Day 3-4 | BoardDecisionFollowService実装 | Backend | ⏳ |
| Day 5 | ユニットテスト・統合テスト | Backend | ⏳ |
| Day 6 | API実装（GET /api/board-decisions等） | Backend | ⏳ |
| Day 7 | APIテスト | Backend | ⏳ |

### Week 3: フロントエンド統合（3日間）

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| Day 8 | ページ修正・API統合 | Frontend | ⏳ |
| Day 9 | UI実装（マイルストーン更新等） | Frontend | ⏳ |
| Day 10 | E2Eテスト・デプロイ | Full Stack | ⏳ |

---

## ✅ 統合チェックリスト

### データベース
- [ ] BoardDecision テーブル作成完了
- [ ] BoardDecisionMilestone テーブル作成完了
- [ ] BoardDecisionFacilityImplementation テーブル作成完了
- [ ] BoardMeeting リレーション追加完了
- [ ] マイグレーション実行成功
- [ ] 初期データ投入完了

### API
- [ ] GET /api/board-decisions 実装完了
- [ ] GET /api/board-decisions/:id/facility-implementations 実装完了
- [ ] PUT /api/board-decisions/:id/milestones/:milestoneId 実装完了
- [ ] PUT /api/board-decisions/:id/facility-implementations/:facilityId 実装完了
- [ ] POST /api/board-decisions 実装完了
- [ ] API統合テスト完了

### フロントエンド
- [ ] useBoardDecisions() カスタムフック実装
- [ ] useFacilityImplementations() カスタムフック実装
- [ ] マイルストーン更新UI実装
- [ ] 施設別実施状況更新UI実装
- [ ] エラーハンドリング実装

### テスト
- [ ] ユニットテスト完了
- [ ] 統合テスト完了
- [ ] E2Eテスト完了
- [ ] パフォーマンステスト完了

---

## 🔗 関連ドキュメント

1. **DB要件分析書**: `board-decision-follow_DB要件分析_20251011.md`
2. **データ管理責任分界点定義書**: `データ管理責任分界点定義書_20251008.md`
3. **BoardPreparation暫定マスターリスト**: `board-preparation暫定マスターリスト_20251010.md`（理事会関連）

---

## 📞 医療システムチームへの確認依頼事項

### ✅ 確認事項

1. **施設マスタAPI確認**
   - GET /api/v2/facilities は利用可能か？
   - レスポンス形式: `{ facilities: [{ facilityId, name }] }`

2. **部門マスタAPI確認**
   - GET /api/v2/departments は利用可能か？
   - レスポンス形式: `{ departments: [{ departmentId, name }] }`

3. **追加実装不要の確認**
   - 理事会決定事項フォロー機能は **VoiceDrive単独で完結** で問題ないか？

---

**文書終了**

最終更新: 2025年10月11日
次のステップ: schema.prisma更新
