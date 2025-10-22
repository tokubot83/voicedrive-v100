# 理事会議題レビューページ DB要件分析

**文書番号**: DB-REQ-2025-1013-002
**作成日**: 2025年10月13日
**対象ページ**: https://voicedrive-v100.vercel.app/board-agenda-review
**対象ユーザー**: レベル18（理事長・法人事務局長）
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
理事会議題レビューページは**既存のBoardMeetingAgendaテーブルで概ね動作可能**ですが、以下の**不足項目**と**推奨追加項目**があります。

### 🔴 重大な不足項目（即対応必要）

1. **`summary`フィールド不足**
   - BoardAgendaReviewPage 59行目: `summary: '...'`
   - `BoardMeetingAgenda`テーブルに存在しない
   - 議題の要約説明に必須

2. **`keyPoints`配列フィールド不足**
   - BoardAgendaReviewPage 60-65行目: `keyPoints: [...]`
   - 主要ポイントのリスト表示に必須
   - JSON型またはテキスト型で格納

3. **`preparedBy`フィールド不足**
   - BoardAgendaReviewPage 57行目: `preparedBy: '戦略企画部'`
   - 議題準備担当部署の記録に必要

### 🟡 推奨追加項目

1. **理事会会議情報の充実化**
   - 次回理事会の詳細情報（日時、場所、参加予定者数）
   - 準備進捗状況の可視化

2. **議題統計機能**
   - 承認済み件数、確認待ち件数、修正依頼中件数の集計

---

## 🔍 詳細分析

### 1. 次回理事会情報表示（42-48行目）

#### 表示内容
```typescript
const nextMeeting: BoardMeeting = {
  date: '2025年10月20日',
  time: '14:00',
  location: '本部会議室A',
  expectedAttendees: 12,
  totalEstimatedTime: 120
};
```

#### 必要なデータソース

| 表示項目 | VoiceDrive BoardMeeting | 医療システム | データ管理責任 | 状態 |
|---------|------------------------|-------------|--------------|------|
| `date` (meetingDate) | ✅ 存在 | ❌ 不要 | VoiceDrive | ✅ OK |
| `time` (startTime) | ✅ 存在 | ❌ 不要 | VoiceDrive | ✅ OK |
| `location` | ✅ 存在 | ❌ 不要 | VoiceDrive | ✅ OK |
| `expectedAttendees` | ✅ 存在 | ❌ 不要 | VoiceDrive | ✅ OK |
| `totalEstimatedTime` | 🟡 計算可能 | ❌ 不要 | VoiceDrive | 🟡 **要集計** |

**評価**: ✅ 既存テーブルで対応可能

**totalEstimatedTime計算ロジック**:
```typescript
// 全議題の予定時間を合計
const totalEstimatedTime = await prisma.boardMeetingAgenda.aggregate({
  where: { meetingDate: nextMeeting.meetingDate },
  _sum: { duration: true }
});
```

---

### 2. 理事会議題一覧表示（51-180行目）

#### 表示内容（AgendaItemインターフェース）
```typescript
interface AgendaItem {
  id: string;              // ✅ BoardMeetingAgenda.id
  title: string;           // ✅ BoardMeetingAgenda.item
  category: string;        // ✅ BoardMeetingAgenda.category
  priority: 'high' | 'medium' | 'low'; // ✅ BoardMeetingAgenda.priority
  preparedBy: string;      // 🔴 不足
  source: string;          // ✅ BoardMeetingAgenda.sourceReport
  summary: string;         // 🔴 不足
  keyPoints: string[];     // 🔴 不足（JSON or Text）
  expectedDiscussion: string;  // ✅ BoardMeetingAgenda.expectedDiscussion
  requiredDecision: string;    // ✅ BoardMeetingAgenda.requiredDecision
  documentsAttached: boolean;  // ✅ BoardMeetingAgenda.documentsReady
  presentationReady: boolean;  // ✅ BoardMeetingAgenda.presentationReady
  estimatedTime: number;       // ✅ BoardMeetingAgenda.duration
  chairmanReview: 'pending' | 'approved' | 'needs_revision' | 'rejected'; // ✅ BoardMeetingAgenda.chairmanReview
  chairmanComment?: string;    // ✅ BoardMeetingAgenda.chairmanComment
}
```

#### 必要なデータソース

| フィールド | BoardMeetingAgenda | 状態 | 対応方法 |
|-----------|-------------------|------|---------|
| `id` | `id` | ✅ OK | 既存フィールド |
| `title` | `item` | ✅ OK | 既存フィールド |
| `category` | `category` | ✅ OK | 既存フィールド |
| `priority` | `priority` | ✅ OK | 既存フィールド（デフォルト: medium） |
| `preparedBy` | ❌ 不足 | 🔴 **要追加** | 新規フィールド追加 |
| `source` | `sourceReport` | ✅ OK | 既存フィールド |
| `summary` | ❌ 不足 | 🔴 **要追加** | 新規フィールド追加 |
| `keyPoints` | ❌ 不足 | 🔴 **要追加** | JSON型フィールド追加 |
| `expectedDiscussion` | `expectedDiscussion` | ✅ OK | 既存フィールド |
| `requiredDecision` | `requiredDecision` | ✅ OK | 既存フィールド |
| `documentsAttached` | `documentsReady` | ✅ OK | 既存フィールド（Boolean） |
| `presentationReady` | `presentationReady` | ✅ OK | 既存フィールド（Boolean） |
| `estimatedTime` | `duration` | ✅ OK | 既存フィールド（分単位） |
| `chairmanReview` | `chairmanReview` | ✅ OK | 既存フィールド（デフォルト: pending） |
| `chairmanComment` | `chairmanComment` | ✅ OK | 既存フィールド（nullable） |

---

### 3. サマリーカード表示（235-271行目）

#### 表示内容
```typescript
// 次回理事会日時
{nextMeeting.date}
{nextMeeting.time} / {nextMeeting.location}

// 総議題数
{agendaItems.length}件
予定時間: {totalTime}分

// 承認済
{approvedCount}件
確認待ち: {pendingCount}件

// 要対応
{needsRevisionCount}件
修正依頼中
```

#### 必要なデータソース

**評価**: ✅ 既存データから集計可能

**集計ロジック**:
```typescript
// 総議題数
const totalAgendas = await prisma.boardMeetingAgenda.count({
  where: { meetingDate: nextMeetingDate }
});

// 承認済件数
const approvedCount = await prisma.boardMeetingAgenda.count({
  where: {
    meetingDate: nextMeetingDate,
    chairmanReview: 'approved'
  }
});

// 確認待ち件数
const pendingCount = await prisma.boardMeetingAgenda.count({
  where: {
    meetingDate: nextMeetingDate,
    chairmanReview: 'pending'
  }
});

// 修正依頼中件数
const needsRevisionCount = await prisma.boardMeetingAgenda.count({
  where: {
    meetingDate: nextMeetingDate,
    chairmanReview: 'needs_revision'
  }
});

// 総予定時間
const totalTime = await prisma.boardMeetingAgenda.aggregate({
  where: { meetingDate: nextMeetingDate },
  _sum: { duration: true }
});
```

---

### 4. 議題詳細表示（283-402行目）

#### 表示要素

**基本情報**:
- 優先度インジケーター（高: 赤、中: 黄、低: 青）
- 議題タイトル
- 承認ステータスバッジ
- カテゴリ、準備担当、出典、予定時間

**詳細情報**:
- 議題要約（summary）
- 主要ポイント（keyPoints配列）
- 想定される議論（expectedDiscussion）
- 求められる決定（requiredDecision）

**資料状況**:
- 報告書添付状況（documentsReady）
- プレゼン資料準備状況（presentationReady）

**理事長コメント**:
- 理事長によるレビューコメント（chairmanComment）

**アクションボタン**（確認待ちの場合のみ）:
- 承認ボタン
- 修正依頼ボタン
- 却下ボタン
- 詳細確認ボタン

#### 必要なデータソース

**評価**: 🟡 既存フィールドで大部分対応可能、3つのフィールド追加が必要

---

### 5. レビューアクション処理（208-211行目）

#### 機能内容
```typescript
const handleReviewAction = (agendaId: string, action: 'approve' | 'revise' | 'reject') => {
  console.log(`Agenda ${agendaId}: ${action}`);
  // 実際の実装では、ここでAPIを呼び出してレビュー結果を保存
};
```

#### 必要なAPI

**エンドポイント**: `POST /api/board-agendas/:id/review`

**リクエスト例**:
```json
{
  "action": "approve",
  "comment": "良好な成果。横展開を積極的に進めてください。"
}
```

**更新内容**:
```typescript
await prisma.boardMeetingAgenda.update({
  where: { id: agendaId },
  data: {
    chairmanReview: action === 'approve' ? 'approved' :
                    action === 'revise' ? 'needs_revision' : 'rejected',
    chairmanComment: comment,
    chairmanReviewedBy: currentUserId,
    chairmanReviewedAt: new Date()
  }
});
```

**評価**: ✅ 既存フィールドで完全対応可能

---

## 📋 必要な追加・修正項目一覧

### VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. BoardMeetingAgendaテーブル修正**

```prisma
model BoardMeetingAgenda {
  // ... 既存フィールド

  // 🆕 追加フィールド
  summary             String?      @db.Text @map("summary")
  // 議題の要約説明（300-500文字程度）

  preparedBy          String?      @map("prepared_by")
  // 議題準備担当部署（例: "戦略企画部"、"人事部"）

  keyPointsJson       Json?        @map("key_points_json")
  // 主要ポイントの配列（JSON形式）
  // 例: ["職員エンゲージメントスコア: 74点", "VoiceDrive参加率: 64.3%"]

  // 既存フィールド（確認）
  expectedDiscussion  String?      @map("expected_discussion") // ✅ 既存
  requiredDecision    String?      @map("required_decision")   // ✅ 既存
  documentsReady      Boolean      @default(false) @map("documents_ready") // ✅ 既存
  presentationReady   Boolean      @default(false) @map("presentation_ready") // ✅ 既存
  chairmanReview      String?      @default("pending") @map("chairman_review") // ✅ 既存
  chairmanComment     String?      @map("chairman_comment")    // ✅ 既存
}
```

**理由**:
- `summary`: 理事会議題の要約を一目で理解するために必須
- `preparedBy`: 準備担当部署を明示することで責任範囲を明確化
- `keyPointsJson`: 主要ポイントをリスト形式で表示するため必須

**影響範囲**:
- BoardAgendaReviewPage: 全体（特に287-332行目の詳細表示）
- 議題作成画面（レベル17用）での入力フォーム追加

---

#### 🟡 優先度: 中（推奨）

**B. BoardMeetingテーブル統計情報の事前計算**

理事会会議ごとの統計情報を事前計算してパフォーマンス向上を図る。

```prisma
model BoardMeeting {
  // ... 既存フィールド

  // 🆕 統計情報フィールド（推奨）
  totalAgendaCount       Int?     @default(0) @map("total_agenda_count")
  approvedAgendaCount    Int?     @default(0) @map("approved_agenda_count")
  pendingAgendaCount     Int?     @default(0) @map("pending_agenda_count")
  revisionAgendaCount    Int?     @default(0) @map("revision_agenda_count")
  totalEstimatedMinutes  Int?     @default(0) @map("total_estimated_minutes")

  lastStatisticsUpdate   DateTime? @map("last_statistics_update")
}
```

**更新ロジック**:
```typescript
// 議題追加・変更時に自動更新
async function updateBoardMeetingStatistics(meetingDate: Date) {
  const stats = await prisma.boardMeetingAgenda.groupBy({
    by: ['chairmanReview'],
    where: { meetingDate },
    _count: { id: true },
    _sum: { duration: true }
  });

  await prisma.boardMeeting.update({
    where: { meetingDate },
    data: {
      totalAgendaCount: stats.reduce((sum, s) => sum + s._count.id, 0),
      approvedAgendaCount: stats.find(s => s.chairmanReview === 'approved')?._count.id || 0,
      pendingAgendaCount: stats.find(s => s.chairmanReview === 'pending')?._count.id || 0,
      revisionAgendaCount: stats.find(s => s.chairmanReview === 'needs_revision')?._count.id || 0,
      totalEstimatedMinutes: stats.reduce((sum, s) => sum + (s._sum.duration || 0), 0),
      lastStatisticsUpdate: new Date()
    }
  });
}
```

**理由**:
- ページ読み込みごとに集計クエリを実行すると遅延が発生
- 事前計算により高速表示を実現

---

### 医療システム側の対応

#### 結論: **医療システム側の対応は不要**

理事会議題レビューは**VoiceDrive独自機能**であり、医療システムとの連携は不要。

**理由**:
- 理事会議題は組織運営の意思決定プロセス
- VoiceDriveの議題化プロセスから派生した議題を理事会レベルまでエスカレーション
- 医療システムの職員マスタ情報（権限レベル等）は既に同期済み
- 議題の準備・レビューはVoiceDrive内で完結

**ただし、以下の情報は既存の同期機構で取得**:
- 理事長・法人事務局長の職員情報（User.permissionLevel = 18）
- 議題準備者の所属部署情報（User.department）

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（1-2日）

**目標**: 理事会議題レビューページが基本的に動作する

1. 🔴 **BoardMeetingAgendaテーブル修正**
   ```sql
   ALTER TABLE board_meeting_agendas ADD COLUMN summary TEXT NULL;
   ALTER TABLE board_meeting_agendas ADD COLUMN prepared_by VARCHAR(255) NULL;
   ALTER TABLE board_meeting_agendas ADD COLUMN key_points_json JSON NULL;
   ```

2. 🔴 **Prismaスキーマ更新**
   ```bash
   npx prisma migrate dev --name add_board_agenda_review_fields
   ```

3. 🔴 **BoardAgendaReviewPage実装修正**
   - ダミーデータを削除
   - 実データ取得APIに接続
   - レビューアクションAPI実装

**このPhaseで動作する機能**:
- ✅ 次回理事会情報表示
- ✅ 議題一覧表示（要約、主要ポイント含む）
- ✅ サマリーカード表示
- ✅ 理事長によるレビューアクション（承認、修正依頼、却下）

---

### Phase 2: パフォーマンス最適化（1日）

**目標**: ページ読み込みを高速化

1. 🟡 **BoardMeetingテーブル統計フィールド追加**
   ```sql
   ALTER TABLE board_meetings ADD COLUMN total_agenda_count INT DEFAULT 0;
   ALTER TABLE board_meetings ADD COLUMN approved_agenda_count INT DEFAULT 0;
   ALTER TABLE board_meetings ADD COLUMN pending_agenda_count INT DEFAULT 0;
   ALTER TABLE board_meetings ADD COLUMN revision_agenda_count INT DEFAULT 0;
   ALTER TABLE board_meetings ADD COLUMN total_estimated_minutes INT DEFAULT 0;
   ALTER TABLE board_meetings ADD COLUMN last_statistics_update TIMESTAMP NULL;
   ```

2. 🟡 **統計更新トリガー実装**
   - 議題追加時
   - 議題更新時
   - 理事長レビュー時

3. 🟡 **キャッシュ機構導入**
   - Redis等でサマリー情報をキャッシュ
   - TTL: 5分

---

### Phase 3: 高度な機能追加（1-2日）

**目標**: ユーザビリティ向上

1. 🟢 **議題準備状況ダッシュボード**
   - 準備完了率の可視化
   - 未完了議題のアラート

2. 🟢 **理事会議事録自動生成**
   - 議題一覧からPDF生成
   - 理事長コメント含む

3. 🟢 **過去の理事会議題検索**
   - カテゴリ別フィルタ
   - 期間指定検索

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
BoardAgendaReviewPage
  ↓ 表示
議題データ: agendaItems（完全ダミー）
次回理事会情報: nextMeeting（ダミー）
統計情報: 計算ロジック（ダミーデータ基準）
```

### Phase 1完了後
```
BoardAgendaReviewPage
  ↓ API呼び出し
GET /api/board-meetings/next
  ↓ クエリ
BoardMeeting（次回会議情報取得）
  ↓ リレーション
BoardMeetingAgenda（議題一覧取得）
  - summary（新規フィールド）
  - preparedBy（新規フィールド）
  - keyPointsJson（新規フィールド）
  - その他既存フィールド

理事長レビューアクション
  ↓ API呼び出し
POST /api/board-agendas/:id/review
  ↓ 更新
BoardMeetingAgenda.chairmanReview, chairmanComment更新
```

### Phase 2完了後（最適化）
```
BoardAgendaReviewPage
  ↓ API呼び出し（高速）
GET /api/board-meetings/next
  ↓ クエリ（統計事前計算済み）
BoardMeeting（統計フィールド含む）
  - totalAgendaCount
  - approvedAgendaCount
  - pendingAgendaCount
  - revisionAgendaCount
  - totalEstimatedMinutes

  ↓ キャッシュ確認（Redis）
サマリー情報キャッシュヒット
  ↓ 返却
高速レスポンス（<100ms）
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1
- [ ] BoardMeetingAgendaテーブルに`summary`追加
- [ ] BoardMeetingAgendaテーブルに`preparedBy`追加
- [ ] BoardMeetingAgendaテーブルに`keyPointsJson`追加
- [ ] Prismaマイグレーション実行
- [ ] GET /api/board-meetings/next 実装
- [ ] GET /api/board-agendas?meetingDate={date} 実装
- [ ] POST /api/board-agendas/:id/review 実装
- [ ] BoardAgendaReviewPageのダミーデータ削除
- [ ] BoardAgendaReviewPageの実データ接続
- [ ] 理事長権限チェック実装（permissionLevel >= 18）

#### Phase 2
- [ ] BoardMeetingテーブル統計フィールド追加
- [ ] 統計更新トリガー実装
- [ ] Redis統合（キャッシュ）
- [ ] パフォーマンステスト（100議題想定）

#### Phase 3
- [ ] 議題準備状況ダッシュボード実装
- [ ] 議事録PDF自動生成機能
- [ ] 過去議題検索機能
- [ ] フィルタ・ソート機能

### テスト
- [ ] 議題一覧表示の単体テスト
- [ ] 理事長レビューアクションの統合テスト
- [ ] 統計集計の精度テスト
- [ ] 権限チェックのセキュリティテスト
- [ ] E2Eテスト（理事会議題レビュー全機能）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)

---

## 📝 補足事項

### schema.prismaの既存定義確認

現在の`BoardMeetingAgenda`テーブル定義（schema.prisma 1412-1452行目）:
```prisma
model BoardMeetingAgenda {
  id                  String    @id @default(cuid())
  meetingDate         DateTime  @map("meeting_date")
  agendaOrder         Int       @map("agenda_order")
  item                String
  description         String?
  category            String
  duration            Int
  presenterId         String    @map("presenter_id")
  presenterTitle      String    @map("presenter_title")
  relatedAgendaId     String?   @map("related_agenda_id")
  attachments         Json?
  status              String    @default("scheduled")
  actualDuration      Int?      @map("actual_duration")
  priority            String?   @default("medium")
  sourceReport        String?   @map("source_report")
  sourceReportId      String?   @map("source_report_id")
  preparedBy          String?   @map("prepared_by")       // ✅ 既に存在！
  preparationStatus   String?   @default("draft") @map("preparation_status")
  documentsReady      Boolean   @default(false) @map("documents_ready")
  presentationReady   Boolean   @default(false) @map("presentation_ready")
  documentUrls        Json?     @map("document_urls")
  keyPoints           String?   @map("key_points")        // ✅ 既に存在！
  expectedDiscussion  String?   @map("expected_discussion")
  requiredDecision    String?   @map("required_decision")
  chairmanReview      String?   @default("pending") @map("chairman_review")
  chairmanComment     String?   @map("chairman_comment")
  chairmanReviewedBy  String?   @map("chairman_reviewed_by")
  chairmanReviewedAt  DateTime? @map("chairman_reviewed_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // ... リレーション
}
```

### 訂正: 不足フィールド

**実際の不足フィールド**:
- ❌ `preparedBy` → ✅ **既に存在**（`prepared_by`）
- ❌ `keyPoints` → ✅ **既に存在**（`key_points`, String型）
- 🔴 `summary` → **不足**（要追加）

**修正後の追加項目**:
1. ✅ `preparedBy` - 既存フィールド利用
2. 🟡 `keyPoints` - 既存フィールド（String型）だが、JSON配列形式で格納推奨
3. 🔴 `summary` - **新規追加必須**

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
次回レビュー: Phase 1実装後
