# 理事会議題レビュー 暫定マスターリスト

**作成日**: 2025年10月13日
**対象ページ**: BoardAgendaReviewPage (`src/pages/BoardAgendaReviewPage.tsx`)
**対象ユーザー**: レベル18（理事長・法人事務局長）
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- 理事会議題レビューページは理事長がレベル17の準備した理事会議題を事前確認する機能
- 現在は完全にダミーデータで動作
- 既存の`BoardMeetingAgenda`テーブルで大部分対応可能
- **医療システムとの連携は不要**（VoiceDrive独自機能）

### 必要な対応
1. **VoiceDrive DB修正**: フィールド1件、テーブル修正1件
2. **API実装**: 3件
3. **確認事項**: 0件（医療システム連携不要）

### 優先度
**Priority: MEDIUM（グループ2: レベル18専用機能）**

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### A. 既存テーブル修正（1件）

#### Modify-1: BoardMeetingAgendaテーブルに`summary`追加

**対象テーブル**: `BoardMeetingAgenda`

**追加フィールド**:
```prisma
model BoardMeetingAgenda {
  // ... 既存フィールド

  summary             String?      @db.Text @map("summary")
  // 🆕 議題の要約説明（300-500文字程度）

  // 既存フィールド（確認）
  preparedBy          String?      @map("prepared_by")       // ✅ 既存
  keyPoints           String?      @map("key_points")        // ✅ 既存（Text型）
  expectedDiscussion  String?      @map("expected_discussion") // ✅ 既存
  requiredDecision    String?      @map("required_decision")   // ✅ 既存
  documentsReady      Boolean      @default(false) @map("documents_ready") // ✅ 既存
  presentationReady   Boolean      @default(false) @map("presentation_ready") // ✅ 既存
  chairmanReview      String?      @default("pending") @map("chairman_review") // ✅ 既存
  chairmanComment     String?      @map("chairman_comment")    // ✅ 既存
  chairmanReviewedBy  String?      @map("chairman_reviewed_by") // ✅ 既存
  chairmanReviewedAt  DateTime?    @map("chairman_reviewed_at") // ✅ 既存
}
```

**必要な理由**:
- BoardAgendaReviewPage 59行目: `summary: '...'`
- 議題の要約を一目で理解するために必須
- 理事長が短時間で議題の概要を把握できる

**データ格納形式**:
- TEXT型（MySQL: TEXT、PostgreSQL: TEXT）
- 300-500文字程度の日本語テキスト
- 改行コード含む

**マイグレーション**:
```sql
-- VoiceDrive: prisma/migrations/xxx_add_board_agenda_summary.sql
ALTER TABLE board_meeting_agendas ADD COLUMN summary TEXT NULL;
```

**初期データ投入**:
```typescript
// 既存議題にダミーサマリーを追加（後で手動更新）
await prisma.boardMeetingAgenda.updateMany({
  where: { summary: null },
  data: {
    summary: '議題の詳細は後で記入してください。'
  }
});
```

---

### B. keyPointsフィールドの使用方法

**既存フィールド**: `keyPoints` (String型)

**格納形式の推奨**:
現在のスキーマでは`String`型ですが、以下のフォーマットで格納推奨:

**Option 1: JSON配列形式（推奨）**
```json
["職員エンゲージメントスコア: 74点（前期比+6点）", "VoiceDrive参加率: 64.3%（目標60%達成）", "議題化プロセス導入による組織課題の早期発見・解決"]
```

**Option 2: 改行区切りテキスト**
```text
職員エンゲージメントスコア: 74点（前期比+6点）
VoiceDrive参加率: 64.3%（目標60%達成）
議題化プロセス導入による組織課題の早期発見・解決
```

**フロントエンド表示処理**:
```typescript
// BoardAgendaReviewPage.tsx 312-319行目
const keyPoints = typeof agenda.keyPoints === 'string'
  ? JSON.parse(agenda.keyPoints)  // JSON形式の場合
  : agenda.keyPoints.split('\n'); // 改行区切りの場合

{keyPoints.map((point, idx) => (
  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
    <span className="text-blue-400 mt-1">•</span>
    <span>{point}</span>
  </li>
))}
```

---

## 🔌 VoiceDrive API実装計画

### API-1: 次回理事会情報取得

**エンドポイント**:
```
GET /api/board-meetings/next
```

**必要な理由**:
- BoardAgendaReviewPage 42-48行目で次回理事会情報を表示
- 日時、場所、参加予定者数、総予定時間を取得

**レスポンス例**:
```json
{
  "id": "board-meeting-001",
  "meetingDate": "2025-10-20T14:00:00Z",
  "startTime": "14:00",
  "location": "本部会議室A",
  "expectedAttendees": 12,
  "expectedDuration": 120,
  "totalAgendaCount": 6,
  "totalEstimatedTime": 105,
  "preparationProgress": 75,
  "status": "planning"
}
```

**実装例**:
```typescript
// src/api/routes/board-meetings.routes.ts
router.get('/next', authenticateJWT, authorizeLevel(18), async (req, res) => {
  const nextMeeting = await prisma.boardMeeting.findFirst({
    where: {
      meetingDate: { gte: new Date() },
      status: { in: ['planning', 'scheduled'] }
    },
    orderBy: { meetingDate: 'asc' }
  });

  if (!nextMeeting) {
    return res.status(404).json({ error: 'No upcoming board meeting found' });
  }

  // 総予定時間を集計
  const totalEstimatedTime = await prisma.boardMeetingAgenda.aggregate({
    where: { meetingDate: nextMeeting.meetingDate },
    _sum: { duration: true }
  });

  res.json({
    ...nextMeeting,
    totalEstimatedTime: totalEstimatedTime._sum.duration || 0
  });
});
```

**セキュリティ**:
- JWT認証必須
- レベル18以上のみアクセス可能

---

### API-2: 理事会議題一覧取得

**エンドポイント**:
```
GET /api/board-agendas?meetingDate={date}
```

**必要な理由**:
- BoardAgendaReviewPage 51-180行目で議題一覧を表示
- 議題の詳細情報（要約、主要ポイント、資料状況等）を取得

**リクエスト例**:
```http
GET /api/board-agendas?meetingDate=2025-10-20
Authorization: Bearer {jwt_token}
```

**レスポンス例**:
```json
{
  "agendas": [
    {
      "id": "agenda-1",
      "item": "2025年度第2四半期 人事戦略報告",
      "category": "人事戦略",
      "priority": "high",
      "preparedBy": "戦略企画部",
      "sourceReport": "月次議題化プロセスレポート",
      "summary": "Q2の人事施策実施状況、職員エンゲージメント指標、次四半期の重点課題を報告。VoiceDrive議題化プロセス導入により職員参加率が64%に向上。",
      "keyPoints": "[\"職員エンゲージメントスコア: 74点（前期比+6点）\", \"VoiceDrive参加率: 64.3%（目標60%達成）\"]",
      "expectedDiscussion": "施設間ローテーション制度の具体的な運用方法、予算措置",
      "requiredDecision": "施設間人材ローテーション制度の試験導入承認",
      "documentsReady": true,
      "presentationReady": true,
      "duration": 20,
      "chairmanReview": "pending",
      "chairmanComment": null,
      "agendaOrder": 1,
      "presenter": {
        "id": "user-001",
        "name": "山田太郎",
        "position": "戦略企画部長"
      }
    }
    // ... 他の議題
  ],
  "statistics": {
    "total": 6,
    "approved": 2,
    "pending": 3,
    "needsRevision": 1,
    "rejected": 0
  }
}
```

**実装例**:
```typescript
// src/api/routes/board-agendas.routes.ts
router.get('/', authenticateJWT, authorizeLevel(18), async (req, res) => {
  const { meetingDate } = req.query;

  if (!meetingDate) {
    return res.status(400).json({ error: 'meetingDate is required' });
  }

  const agendas = await prisma.boardMeetingAgenda.findMany({
    where: {
      meetingDate: new Date(meetingDate as string)
    },
    include: {
      presenter: {
        select: { id: true, name: true, position: true }
      }
    },
    orderBy: { agendaOrder: 'asc' }
  });

  // 統計情報を集計
  const statistics = await prisma.boardMeetingAgenda.groupBy({
    by: ['chairmanReview'],
    where: { meetingDate: new Date(meetingDate as string) },
    _count: { id: true }
  });

  res.json({
    agendas,
    statistics: {
      total: agendas.length,
      approved: statistics.find(s => s.chairmanReview === 'approved')?._count.id || 0,
      pending: statistics.find(s => s.chairmanReview === 'pending')?._count.id || 0,
      needsRevision: statistics.find(s => s.chairmanReview === 'needs_revision')?._count.id || 0,
      rejected: statistics.find(s => s.chairmanReview === 'rejected')?._count.id || 0
    }
  });
});
```

**セキュリティ**:
- JWT認証必須
- レベル18以上のみアクセス可能

---

### API-3: 理事長レビューアクション

**エンドポイント**:
```
POST /api/board-agendas/:id/review
```

**必要な理由**:
- BoardAgendaReviewPage 208-211行目, 371-399行目でレビューアクションを実行
- 理事長が議題を承認、修正依頼、却下する

**リクエスト例**:
```json
{
  "action": "approve",
  "comment": "良好な成果。横展開を積極的に進めてください。"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "agenda": {
    "id": "agenda-3",
    "chairmanReview": "approved",
    "chairmanComment": "良好な成果。横展開を積極的に進めてください。",
    "chairmanReviewedBy": "user-chairman-001",
    "chairmanReviewedAt": "2025-10-13T10:30:00Z"
  }
}
```

**実装例**:
```typescript
// src/api/routes/board-agendas.routes.ts
router.post('/:id/review', authenticateJWT, authorizeLevel(18), async (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body;

  // アクション検証
  const validActions = ['approve', 'revise', 'reject'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  // ステータスマッピング
  const statusMap = {
    approve: 'approved',
    revise: 'needs_revision',
    reject: 'rejected'
  };

  // 議題更新
  const updatedAgenda = await prisma.boardMeetingAgenda.update({
    where: { id },
    data: {
      chairmanReview: statusMap[action],
      chairmanComment: comment || null,
      chairmanReviewedBy: req.user.id,
      chairmanReviewedAt: new Date()
    }
  });

  // 通知送信（議題準備者に通知）
  await prisma.notification.create({
    data: {
      category: 'board_agenda',
      subcategory: 'chairman_review',
      priority: action === 'reject' ? 'high' : 'normal',
      title: `理事会議題「${updatedAgenda.item}」が${statusMap[action]}されました`,
      content: comment || '',
      target: 'individual',
      senderId: req.user.id,
      recipients: {
        create: {
          userId: updatedAgenda.presenterId,
          isRead: false
        }
      }
    }
  });

  res.json({
    success: true,
    agenda: updatedAgenda
  });
});
```

**セキュリティ**:
- JWT認証必須
- レベル18以上のみアクセス可能
- CSRF保護必須
- レビュー履歴の監査ログ記録

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    VoiceDrive システム                        │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  レベル17（戦略企画部等）                  │               │
│  │  - 理事会議題準備                         │               │
│  │  - BoardMeetingAgenda作成                 │               │
│  │    ├─ item: 議題タイトル                  │               │
│  │    ├─ summary: 要約（🆕）                 │               │
│  │    ├─ keyPoints: 主要ポイント             │               │
│  │    ├─ preparedBy: 準備担当部署            │               │
│  │    └─ chairmanReview: "pending"           │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ①議題登録                                          │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  BoardMeetingAgenda テーブル              │               │
│  │  - id, item, summary, keyPoints           │               │
│  │  - preparedBy, category, priority         │               │
│  │  - documentsReady, presentationReady      │               │
│  │  - chairmanReview, chairmanComment        │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ②API取得                                           │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  API-2: GET /api/board-agendas            │               │
│  │  - 議題一覧取得                            │               │
│  │  - 統計情報含む                            │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ③表示                                              │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  レベル18（理事長・法人事務局長）          │               │
│  │  BoardAgendaReviewPage                    │               │
│  │  - 次回理事会情報                         │               │
│  │  - 議題一覧（要約、主要ポイント）          │               │
│  │  - サマリーカード（統計）                  │               │
│  │  - レビューアクション                      │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ④レビューアクション                                │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  API-3: POST /api/board-agendas/:id/review│               │
│  │  - action: "approve" | "revise" | "reject"│               │
│  │  - comment: "理事長コメント"               │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ⑤更新 + 通知                                       │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  BoardMeetingAgenda.chairmanReview更新    │               │
│  │  Notification作成（準備者に通知）          │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## ❌ 医療システム連携は不要

### 理由

1. **VoiceDrive独自機能**
   - 理事会議題レビューはVoiceDriveの組織改善プロセスの一部
   - 医療システムの人事評価・キャリア管理とは独立

2. **必要な職員情報は既に同期済み**
   - 理事長・法人事務局長の権限レベル（User.permissionLevel = 18）
   - 議題準備者の所属部署（User.department）
   - これらは既存の職員マスタ同期で取得済み

3. **議題データはVoiceDrive管轄**
   - 議題の準備、レビュー、承認はVoiceDrive内で完結
   - 医療システムに送信する必要なし

### 医療システムとの連携が必要になる場合

**将来的に以下の機能を追加する場合のみ連携検討**:
- 理事会決定事項を医療システムの人事施策マスタに反映
- 理事会議事録を医療システムの文書管理システムに保存
- 理事会での予算承認を医療システムの予算管理システムに連携

---

## 📅 想定スケジュール

### Phase 1: 最小限の動作（2日）

**Day 1**: DB修正・API実装
- [x] BoardMeetingAgendaテーブルに`summary`追加
- [x] Prismaマイグレーション実行
- [x] API-1実装（次回理事会情報取得）
- [x] API-2実装（議題一覧取得）
- [x] API-3実装（理事長レビューアクション）

**Day 2**: フロントエンド実装
- [ ] BoardAgendaReviewPageのダミーデータ削除
- [ ] 実データ取得APIに接続
- [ ] レビューアクションボタン実装
- [ ] エラーハンドリング実装
- [ ] 権限チェック実装（Level 18のみアクセス）

### Phase 2: テスト・デバッグ（1日）

**Day 3**: 統合テスト
- [ ] 議題一覧表示テスト
- [ ] 理事長レビューアクションテスト
- [ ] 統計集計精度テスト
- [ ] 権限チェックセキュリティテスト
- [ ] E2Eテスト

### Phase 3: リリース

**Day 4**: 本番デプロイ
- [ ] 本番環境デプロイ
- [ ] モニタリング設定
- [ ] ユーザーガイド作成

---

## ✅ チェックリスト

### VoiceDrive側作業

#### DB修正
- [ ] **Modify-1**: BoardMeetingAgenda.summary追加
- [ ] Prismaマイグレーション実行
- [ ] 既存議題への初期値設定

#### API実装
- [ ] **API-1**: GET /api/board-meetings/next 実装
- [ ] **API-2**: GET /api/board-agendas 実装
- [ ] **API-3**: POST /api/board-agendas/:id/review 実装
- [ ] JWT認証ミドルウェア統合
- [ ] 権限チェックミドルウェア統合（Level 18）
- [ ] エラーハンドリング実装
- [ ] API仕様書作成（OpenAPI 3.0）

#### フロントエンド実装
- [ ] BoardAgendaReviewPageのダミーデータ削除
- [ ] API呼び出し実装（useQuery/useMutation）
- [ ] ローディング状態表示
- [ ] エラー表示
- [ ] 権限チェック（Level 18のみアクセス）
- [ ] レスポンシブデザイン確認

#### テスト
- [ ] 単体テスト（API）
- [ ] 統合テスト（API + DB）
- [ ] E2Eテスト（フルフロー）
- [ ] セキュリティテスト（権限チェック）
- [ ] パフォーマンステスト（100議題想定）

---

## 📝 補足資料

### 参照ドキュメント

1. **board-agenda-review_DB要件分析**
   `mcp-shared/docs/board-agenda-review_DB要件分析_20251013.md`

2. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

3. **共通DB構築後統合作業再開計画書**
   `mcp-shared/docs/共通DB構築後統合作業再開計画書_20251008.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Express.js (API Server)
- JWT認証

### keyPoints格納形式のベストプラクティス

**現在のスキーマ**: `keyPoints String? @map("key_points")`

**推奨格納方法**:
```typescript
// 登録時: 配列をJSON文字列に変換
const keyPointsArray = [
  "職員エンゲージメントスコア: 74点（前期比+6点）",
  "VoiceDrive参加率: 64.3%（目標60%達成）",
  "議題化プロセス導入による組織課題の早期発見・解決"
];

await prisma.boardMeetingAgenda.create({
  data: {
    // ...
    keyPoints: JSON.stringify(keyPointsArray)
  }
});

// 取得時: JSON文字列を配列にパース
const agenda = await prisma.boardMeetingAgenda.findUnique({ where: { id } });
const keyPointsArray = JSON.parse(agenda.keyPoints || '[]');
```

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-13 | 初版作成 | AI (Claude Code) |

---

**作成者**: AI (Claude Code)
**承認待ち**: VoiceDriveチームレビュー
**次のステップ**: schema.prisma更新 → マイグレーション実行 → API実装

---

**文書終了**
