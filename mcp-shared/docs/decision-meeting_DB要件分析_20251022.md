# 決定会議ページ DB要件分析

**文書番号**: DB-REQ-2025-1022-003
**作成日**: 2025年10月22日
**対象ページ**: https://voicedrive-v100.vercel.app/decision-meeting
**対象ユーザー**: レベル13（院長・施設長）
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [board-agenda-review_DB要件分析_20251013.md](./board-agenda-review_DB要件分析_20251013.md)

---

## 📋 分析サマリー

### 結論
決定会議ページは**既存のDecisionMeetingAgendaテーブルで完全に動作可能**です。不足フィールドはありません。

### ✅ 良好な点

1. **完全なテーブル定義済み**
   - `DecisionMeetingAgenda`テーブルが全ての必要フィールドを保持
   - 影響分析、議事録、決定情報すべて対応

2. **適切なJSON活用**
   - `impactDepartments`（影響部署リスト）
   - `meetingConcerns`（懸念事項リスト）
   - `meetingConditions`（承認条件リスト）
   - JSON型で柔軟に配列データを格納

3. **医療システム連携不要**
   - VoiceDrive独自機能（運営委員会→院長決定のフロー）
   - 既存の職員マスタ同期のみで対応可能

### 🟢 追加項目なし

**結論**: schema.prismaの修正は不要

---

## 🔍 詳細分析

### 1. ページ概要

**機能**: 運営委員会からエスカレーションされた議題を院長・施設長が最終決定
**権限**: レベル13（院長・施設長）専用
**主要操作**:
- 審議待ち議題の確認
- 審議開始
- 承認/却下/保留の決定
- 決定理由の記録

---

### 2. 統計サマリー表示（203-260行目）

#### 表示内容
```typescript
interface DecisionMeetingStats {
  totalAgendas: number;         // 総議題数
  pendingCount: number;         // 審議待ち
  approvedCount: number;        // 承認済み
  rejectedCount: number;        // 却下
  deferredCount: number;        // 保留
  urgentCount: number;          // 緊急
  thisMonthDecisions: number;   // 今月決定数
  approvalRate: number;         // 承認率
  averageDecisionDays: number;  // 平均決定日数
}
```

#### 必要なデータソース

| 統計項目 | データ管理責任 | 計算方法 | 状態 |
|---------|--------------|---------|------|
| 総議題数 | VoiceDrive | `COUNT(*)` | ✅ OK |
| 審議待ち | VoiceDrive | `COUNT WHERE status='pending'` | ✅ OK |
| 承認済み | VoiceDrive | `COUNT WHERE status='approved'` | ✅ OK |
| 却下 | VoiceDrive | `COUNT WHERE status='rejected'` | ✅ OK |
| 保留 | VoiceDrive | `COUNT WHERE status='deferred'` | ✅ OK |
| 緊急 | VoiceDrive | `COUNT WHERE priority='urgent'` | ✅ OK |
| 今月決定数 | VoiceDrive | `COUNT WHERE decidedDate >= thisMonthStart` | ✅ OK |
| 承認率 | VoiceDrive | `approvedCount / totalAgendas * 100` | ✅ OK |
| 平均決定日数 | VoiceDrive | `AVG(decidedDate - proposedDate)` | ✅ OK |

**評価**: ✅ 既存フィールドで完全対応可能

**集計ロジック例**:
```typescript
// src/services/DecisionMeetingService.ts
async function getStats(): Promise<DecisionMeetingStats> {
  const totalAgendas = await prisma.decisionMeetingAgenda.count();

  const pendingCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'pending' }
  });

  const approvedCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'approved' }
  });

  const rejectedCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'rejected' }
  });

  const deferredCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'deferred' }
  });

  const urgentCount = await prisma.decisionMeetingAgenda.count({
    where: { priority: 'urgent' }
  });

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonthDecisions = await prisma.decisionMeetingAgenda.count({
    where: {
      decidedDate: { gte: thisMonthStart },
      status: { in: ['approved', 'rejected', 'deferred'] }
    }
  });

  const approvalRate = totalAgendas > 0
    ? (approvedCount / totalAgendas) * 100
    : 0;

  // 平均決定日数計算
  const decidedAgendas = await prisma.decisionMeetingAgenda.findMany({
    where: { decidedDate: { not: null } },
    select: { proposedDate: true, decidedDate: true }
  });

  const totalDays = decidedAgendas.reduce((sum, agenda) => {
    if (!agenda.decidedDate) return sum;
    const days = Math.floor(
      (agenda.decidedDate.getTime() - agenda.proposedDate.getTime())
      / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  const averageDecisionDays = decidedAgendas.length > 0
    ? Math.round(totalDays / decidedAgendas.length)
    : 0;

  return {
    totalAgendas,
    pendingCount,
    approvedCount,
    rejectedCount,
    deferredCount,
    urgentCount,
    thisMonthDecisions,
    approvalRate,
    averageDecisionDays
  };
}
```

---

### 3. 議題一覧表示（290-368行目）

#### 表示内容（DecisionAgendaインターフェース）
```typescript
interface DecisionAgenda {
  id: string;                    // ✅ DecisionMeetingAgenda.id
  title: string;                 // ✅ DecisionMeetingAgenda.title
  type: string;                  // ✅ DecisionMeetingAgenda.type
  description: string;           // ✅ DecisionMeetingAgenda.description
  background: string;            // ✅ DecisionMeetingAgenda.background
  proposedBy: string;            // ✅ DecisionMeetingAgenda.proposedBy
  proposedDate: Date;            // ✅ DecisionMeetingAgenda.proposedDate
  proposerDepartment: string;    // ✅ DecisionMeetingAgenda.proposerDepartment
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred';
                                 // ✅ DecisionMeetingAgenda.status
  priority: 'urgent' | 'high' | 'normal' | 'low';
                                 // ✅ DecisionMeetingAgenda.priority
  scheduledDate?: Date;          // ✅ DecisionMeetingAgenda.scheduledDate
  decidedDate?: Date;            // ✅ DecisionMeetingAgenda.decidedDate
  decidedBy?: string;            // ✅ DecisionMeetingAgenda.decidedBy
  decisionNotes?: string;        // ✅ DecisionMeetingAgenda.decisionNotes

  impact: {
    departments: string[];       // ✅ DecisionMeetingAgenda.impactDepartments (JSON)
    estimatedCost?: number;      // ✅ DecisionMeetingAgenda.impactEstimatedCost
    implementationPeriod?: string; // ✅ DecisionMeetingAgenda.impactImplementationPeriod
    expectedEffect: string;      // ✅ DecisionMeetingAgenda.impactExpectedEffect
  };

  meetingMinutes?: {
    attendees: string[];         // ✅ DecisionMeetingAgenda.meetingAttendees (JSON)
    discussion: string;          // ✅ DecisionMeetingAgenda.meetingDiscussion
    concerns: string[];          // ✅ DecisionMeetingAgenda.meetingConcerns (JSON)
    conditions?: string[];       // ✅ DecisionMeetingAgenda.meetingConditions (JSON)
  };
}
```

#### 必要なデータソース

| フィールド | DecisionMeetingAgenda | 状態 | データ型 |
|-----------|----------------------|------|---------|
| `id` | `id` | ✅ OK | String |
| `title` | `title` | ✅ OK | String |
| `type` | `type` | ✅ OK | String (committee_proposal, facility_policy, etc.) |
| `description` | `description` | ✅ OK | String |
| `background` | `background` | ✅ OK | String |
| `proposedBy` | `proposedBy` | ✅ OK | String |
| `proposedDate` | `proposedDate` | ✅ OK | DateTime |
| `proposerDepartment` | `proposerDepartment` | ✅ OK | String |
| `status` | `status` | ✅ OK | String |
| `priority` | `priority` | ✅ OK | String |
| `scheduledDate` | `scheduledDate` | ✅ OK | DateTime? |
| `decidedDate` | `decidedDate` | ✅ OK | DateTime? |
| `decidedBy` | `decidedBy` | ✅ OK | String? |
| `decisionNotes` | `decisionNotes` | ✅ OK | String? |
| `impact.departments` | `impactDepartments` | ✅ OK | Json (string[]) |
| `impact.estimatedCost` | `impactEstimatedCost` | ✅ OK | Float? |
| `impact.implementationPeriod` | `impactImplementationPeriod` | ✅ OK | String? |
| `impact.expectedEffect` | `impactExpectedEffect` | ✅ OK | String |
| `meetingMinutes.attendees` | `meetingAttendees` | ✅ OK | Json (string[]) |
| `meetingMinutes.discussion` | `meetingDiscussion` | ✅ OK | String? |
| `meetingMinutes.concerns` | `meetingConcerns` | ✅ OK | Json (string[]) |
| `meetingMinutes.conditions` | `meetingConditions` | ✅ OK | Json (string[]) |

**評価**: ✅ 既存フィールドで100%対応

---

### 4. 決定アクション（124-179行目）

#### 機能内容

**承認アクション**:
```typescript
handleApprove(agendaId: string, userId: string, notes?: string) {
  await prisma.decisionMeetingAgenda.update({
    where: { id: agendaId },
    data: {
      status: 'approved',
      decision: 'approved',
      decidedDate: new Date(),
      decidedBy: userName,
      deciderId: userId,
      decisionNotes: notes
    }
  });
}
```

**却下アクション**:
```typescript
handleReject(agendaId: string, userId: string, reason: string) {
  await prisma.decisionMeetingAgenda.update({
    where: { id: agendaId },
    data: {
      status: 'rejected',
      decision: 'rejected',
      decidedDate: new Date(),
      decidedBy: userName,
      deciderId: userId,
      decisionNotes: reason
    }
  });
}
```

**保留アクション**:
```typescript
handleDefer(agendaId: string, userId: string, reason: string) {
  await prisma.decisionMeetingAgenda.update({
    where: { id: agendaId },
    data: {
      status: 'deferred',
      decision: 'deferred',
      decidedDate: new Date(),
      decidedBy: userName,
      deciderId: userId,
      decisionNotes: reason
    }
  });
}
```

**審議開始アクション**:
```typescript
handleStartReview(agendaId: string) {
  await prisma.decisionMeetingAgenda.update({
    where: { id: agendaId },
    data: {
      status: 'in_review'
    }
  });
}
```

#### 必要なフィールド

| アクション | 更新フィールド | DecisionMeetingAgenda | 状態 |
|-----------|--------------|----------------------|------|
| 承認 | status, decision, decidedDate, decidedBy, deciderId, decisionNotes | ✅ すべて存在 | ✅ OK |
| 却下 | status, decision, decidedDate, decidedBy, deciderId, decisionNotes | ✅ すべて存在 | ✅ OK |
| 保留 | status, decision, decidedDate, decidedBy, deciderId, decisionNotes | ✅ すべて存在 | ✅ OK |
| 審議開始 | status | ✅ 存在 | ✅ OK |

**評価**: ✅ 既存フィールドで完全対応

---

### 5. 詳細モーダル表示（371-557行目）

#### 表示内容

**基本情報**:
- タイトル、ステータス、タイプ、概要

**背景・経緯**:
- DecisionMeetingAgenda.background

**提案元情報**:
- proposedBy, proposerDepartment, proposedDate, scheduledDate

**影響分析**:
- impact.departments (JSON配列)
- impact.estimatedCost (Float)
- impact.implementationPeriod (String)
- impact.expectedEffect (String)

**審議内容（議事録）**:
- meetingMinutes.attendees (JSON配列)
- meetingMinutes.discussion (String)
- meetingMinutes.concerns (JSON配列)
- meetingMinutes.conditions (JSON配列)

**決定内容**:
- decidedBy, decidedDate, decisionNotes

**評価**: ✅ すべて既存フィールドで対応済み

---

## 📊 データフロー図

### 運営委員会から決定会議へのエスカレーション

```
┌─────────────────────────────────────────────────────────────┐
│           運営委員会（レベル12：事務部長・看護部長）          │
│                                                               │
│  ManagementCommitteeAgenda                                   │
│  - 議題レビュー                                               │
│  - 重要度判定                                                 │
│  - 施設長決定が必要な議題を特定                                │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ エスカレーション
                    │ relatedCommitteeAgendaId設定
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              決定会議（レベル13：院長・施設長）               │
│                                                               │
│  DecisionMeetingAgenda                                       │
│  - relatedCommitteeAgendaId: 元の運営委員会議題ID             │
│  - status: 'pending' → 'in_review' → 'approved/rejected/deferred' │
│  - decidedBy, decidedDate, decisionNotes記録                  │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ 決定通知
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Notification                              │
│  - 提案者への決定通知                                          │
│  - 関係部署への通知                                            │
└─────────────────────────────────────────────────────────────┘
```

### API呼び出しフロー

```
DecisionMeetingPage
  ↓ ページロード
GET /api/decision-agendas
  ↓ クエリ
DecisionMeetingAgenda.findMany()
  ↓ 統計計算
getStats() → 集計処理
  ↓ レスポンス
{ agendas, stats }

ユーザーアクション（承認/却下/保留）
  ↓
POST /api/decision-agendas/:id/decide
  ↓ 更新
DecisionMeetingAgenda.update({
  status, decision, decidedDate,
  decidedBy, deciderId, decisionNotes
})
  ↓ 通知作成
Notification.create({ ... })
  ↓ レスポンス
{ success: true, agenda }
```

---

## 📋 必要なAPI一覧

### API-1: 決定会議議題一覧取得

**エンドポイント**: `GET /api/decision-agendas`

**クエリパラメータ**:
- `status?`: string (pending, in_review, approved, rejected, deferred)
- `priority?`: string (urgent, high, normal, low)
- `month?`: string (YYYY-MM形式、今月決定フィルタ用)

**レスポンス例**:
```json
{
  "success": true,
  "agendas": [
    {
      "id": "agenda-1",
      "title": "夜勤帯人員配置最適化計画",
      "type": "committee_proposal",
      "description": "...",
      "background": "...",
      "proposedBy": "田中太郎",
      "proposedDate": "2025-10-01T00:00:00Z",
      "proposerDepartment": "看護部",
      "status": "pending",
      "priority": "high",
      "scheduledDate": "2025-10-15T14:00:00Z",
      "impact": {
        "departments": ["看護部", "医事課", "総務課"],
        "estimatedCost": 5000000,
        "implementationPeriod": "2026年4月〜2026年9月",
        "expectedEffect": "夜勤時の残業時間40%削減見込み"
      }
    }
  ],
  "stats": {
    "totalAgendas": 25,
    "pendingCount": 5,
    "approvedCount": 15,
    "rejectedCount": 3,
    "deferredCount": 2,
    "urgentCount": 2,
    "thisMonthDecisions": 8,
    "approvalRate": 60,
    "averageDecisionDays": 7
  }
}
```

---

### API-2: 決定会議議題詳細取得

**エンドポイント**: `GET /api/decision-agendas/:id`

**レスポンス例**:
```json
{
  "success": true,
  "agenda": {
    "id": "agenda-1",
    "title": "夜勤帯人員配置最適化計画",
    "type": "committee_proposal",
    "description": "...",
    "background": "6施設で夜勤時の人手不足が共通課題として挙がっており...",
    "proposedBy": "田中太郎",
    "proposedDate": "2025-10-01T00:00:00Z",
    "proposerDepartment": "看護部",
    "proposerId": "user-001",
    "status": "in_review",
    "priority": "high",
    "scheduledDate": "2025-10-15T14:00:00Z",
    "decidedDate": null,
    "decidedBy": null,
    "decision": null,
    "decisionNotes": null,
    "impact": {
      "departments": ["看護部", "医事課", "総務課"],
      "estimatedCost": 5000000,
      "implementationPeriod": "2026年4月〜2026年9月",
      "expectedEffect": "夜勤時の残業時間40%削減見込み"
    },
    "meetingMinutes": {
      "attendees": ["山田院長", "佐藤看護部長", "鈴木事務部長"],
      "discussion": "施設間での人材融通の具体的な実施方法について議論。交通費支給、シフト調整の仕組みなど詳細を詰める必要がある。",
      "concerns": [
        "職員の移動負担増加の懸念",
        "施設間での業務手順の違いによる混乱"
      ],
      "conditions": [
        "交通費全額支給",
        "事前研修の実施",
        "3ヶ月間のトライアル期間設定"
      ]
    },
    "relatedCommitteeAgendaId": "committee-agenda-123"
  }
}
```

---

### API-3: 決定アクション（承認/却下/保留）

**エンドポイント**: `POST /api/decision-agendas/:id/decide`

**リクエストボディ**:
```json
{
  "action": "approve",  // approve | reject | defer
  "userId": "user-chairman-001",
  "notes": "承認します。条件付きで実施してください。"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "agenda": {
    "id": "agenda-1",
    "status": "approved",
    "decision": "approved",
    "decidedDate": "2025-10-22T10:30:00Z",
    "decidedBy": "山田太郎",
    "deciderId": "user-chairman-001",
    "decisionNotes": "承認します。条件付きで実施してください。"
  },
  "notification": {
    "id": "notif-001",
    "recipientId": "user-001",
    "recipientName": "田中太郎"
  }
}
```

---

### API-4: 審議開始

**エンドポイント**: `POST /api/decision-agendas/:id/start-review`

**リクエストボディ**:
```json
{
  "userId": "user-chairman-001"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "agenda": {
    "id": "agenda-1",
    "status": "in_review"
  }
}
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### DB修正
- [x] **不要**: DecisionMeetingAgendaテーブルは完全

#### API実装
- [ ] **API-1**: GET /api/decision-agendas 実装
- [ ] **API-2**: GET /api/decision-agendas/:id 実装
- [ ] **API-3**: POST /api/decision-agendas/:id/decide 実装
- [ ] **API-4**: POST /api/decision-agendas/:id/start-review 実装
- [ ] JWT認証ミドルウェア統合
- [ ] 権限チェックミドルウェア統合（Level 13）
- [ ] エラーハンドリング実装
- [ ] API仕様書作成（OpenAPI 3.0）

#### フロントエンド実装
- [ ] DecisionMeetingPageのダミーデータ削除
- [ ] API呼び出し実装（useQuery/useMutation or fetch）
- [ ] ローディング状態表示
- [ ] エラー表示
- [ ] 権限チェック（Level 13のみアクセス）
- [ ] レスポンシブデザイン確認

#### テスト
- [ ] 単体テスト（API）
- [ ] 統合テスト（API + DB）
- [ ] E2Eテスト（フルフロー）
- [ ] セキュリティテスト（権限チェック）
- [ ] パフォーマンステスト（100議題想定）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [board-agenda-review_DB要件分析](./board-agenda-review_DB要件分析_20251013.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)

---

## 📝 補足事項

### schema.prismaの既存定義確認

現在の`DecisionMeetingAgenda`テーブル定義（schema.prisma 1004-1048行目）:
```prisma
model DecisionMeetingAgenda {
  id                         String    @id @default(cuid())
  title                      String
  type                       String    // committee_proposal, facility_policy, personnel, budget, equipment, other
  description                String
  background                 String
  proposedBy                 String
  proposedDate               DateTime
  proposerDepartment         String
  proposerId                 String?
  status                     String    @default("pending") // pending, in_review, approved, rejected, deferred
  priority                   String    @default("normal")  // urgent, high, normal, low
  scheduledDate              DateTime?
  decidedDate                DateTime?
  decidedBy                  String?
  deciderId                  String?
  decision                   String?
  decisionNotes              String?
  impactDepartments          Json      // 影響部署リスト
  impactEstimatedCost        Float?    // 予算影響額
  impactImplementationPeriod String?   // 実施期間
  impactExpectedEffect       String    // 期待される効果
  attachments                Json?     // 添付ファイル
  meetingAttendeesRaw        Json?     // 出席者（生データ）
  meetingAttendees           Json?     // 出席者リスト
  meetingDiscussion          String?   // 議論内容
  meetingConcerns            Json?     // 懸念事項リスト
  meetingConditions          Json?     // 承認条件リスト
  tags                       Json?     // タグ
  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime  @updatedAt
  relatedCommitteeAgendaId   String?   @unique

  // Relations
  relatedCommitteeAgenda     ManagementCommitteeAgenda? @relation("CommitteeToDecisionEscalation", fields: [relatedCommitteeAgendaId], references: [id])
  deciderUser                User?     @relation("DecisionDecider", fields: [deciderId], references: [id])
  proposerUser               User?     @relation("DecisionProposer", fields: [proposerId], references: [id])

  // Indexes
  @@index([proposerId])
  @@index([deciderId])
  @@index([status])
  @@index([priority])
  @@index([type])
  @@index([proposedDate])
  @@index([decidedDate])
  @@index([relatedCommitteeAgendaId])
}
```

### 結論

**✅ 完璧なテーブル定義**: schema.prismaの修正は一切不要

すべての表示項目、アクション、統計計算に必要なフィールドが既に定義されています。

---

**文書終了**

最終更新: 2025年10月22日
バージョン: 1.0
次回レビュー: API実装後
