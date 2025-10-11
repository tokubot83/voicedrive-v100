# Board Agenda Review 暫定マスターリスト

**作成日**: 2025年10月11日
**対象ページ**: BoardAgendaReview (https://voicedrive-v100.vercel.app/board-agenda-review)
**権限レベル**: Level 18（理事長・法人事務局長）
**ドキュメントID**: BOARD-AGENDA-REV-MASTER-20251011

---

## 1. 概要

### 1.1 目的
Level 17（戦略企画部長・人事部長）が準備した理事会議題を事前確認し、承認・修正依頼・却下の判断を行う。

### 1.2 主要機能
- **理事会議題の事前確認** - Level 17が準備した議題を詳細確認
- **理事長レビュー** - 承認/修正依頼/却下の3つのアクション
- **論点整理** - 理事会での議論ポイントを事前に把握
- **Level 17への通知** - レビュー結果を自動通知

### 1.3 データ責任分担
- **VoiceDrive**: 100%（既存BoardMeetingAgendaテーブルを拡張）
- **医療職員管理システム**: なし（医療システム側のデータは不要）

---

## 2. 医療職員管理システム側要件

### 2.1 必要API

**なし** - このページは完全にVoiceDrive内部のワークフローであり、医療システム側のデータは不要。

### 2.2 追加作業

**なし** - 医療システム側の作業は不要。

---

## 3. VoiceDrive側要件

### 3.1 データベース要件

#### 3.1.1 新規テーブル

**なし** - 新規テーブルは不要。既存の`BoardMeetingAgenda`テーブルを拡張するのみ。

#### 3.1.2 既存テーブル拡張

##### BoardMeetingAgenda テーブル拡張

**追加フィールド（7個）**:

| フィールド | 型 | 説明 | デフォルト値 | 例 |
|-----------|---|------|------------|---|
| keyPoints | Json? | 主要ポイント配列 | null | ["スコア74点(前期比+6点)", "参加率64.3%(目標60%達成)", ...] |
| expectedDiscussion | Text? | 想定される議論 | null | "施設間ローテーション制度の具体的な運用方法、予算措置" |
| requiredDecision | Text? | 求められる決定 | null | "施設間人材ローテーション制度の試験導入承認" |
| chairmanReview | String? | レビューステータス | "pending" | "pending" / "approved" / "needs_revision" / "rejected" |
| chairmanComment | Text? | 理事長コメント | null | "良好な成果。横展開を積極的に進めてください。" |
| chairmanReviewedBy | String? | レビュー実施者ID | null | "USR_LEVEL18_001" |
| chairmanReviewedAt | DateTime? | レビュー日時 | null | "2025-10-15T14:30:00Z" |

**リレーション追加（1個）**:
```prisma
chairmanReviewer    User?     @relation("AgendaChairmanReviewer", fields: [chairmanReviewedBy], references: [id])
```

##### User テーブル拡張

```prisma
model User {
  // 既存フィールド...

  // BoardAgendaReview統合実装（2025-10-11）
  reviewedAgendas         BoardMeetingAgenda[]  @relation("AgendaChairmanReviewer")
}
```

### 3.2 サービス層要件

#### 3.2.1 BoardAgendaReviewService

```typescript
class BoardAgendaReviewService {
  // 次回理事会の議題一覧を取得
  async getAgendasForReview(
    boardMeetingId: string
  ): Promise<BoardMeetingAgenda[]>;

  // 議題の詳細を取得
  async getAgendaDetail(agendaId: string): Promise<BoardMeetingAgenda>;

  // 理事長レビューを実行
  async submitChairmanReview(
    agendaId: string,
    reviewData: {
      status: 'approved' | 'needs_revision' | 'rejected';
      comment?: string;
      reviewedBy: string;
    }
  ): Promise<BoardMeetingAgenda>;

  // レビュー統計を取得
  async getReviewStats(boardMeetingId: string): Promise<ReviewStats>;

  // Level 17に通知を送信
  async notifyLevel17(
    agendaId: string,
    reviewResult: { status: string; comment?: string }
  ): Promise<void>;
}
```

### 3.3 API要件

#### 5つのAPIエンドポイント

| No | メソッド | エンドポイント | 説明 | 権限 |
|----|---------|---------------|------|------|
| 1 | GET | /api/board-agenda-review/:boardMeetingId/agendas | 議題一覧取得 | Level 18+ |
| 2 | GET | /api/board-agenda-review/agendas/:agendaId | 議題詳細取得 | Level 18+ |
| 3 | POST | /api/board-agenda-review/agendas/:agendaId/review | 理事長レビュー実行 | Level 18+ |
| 4 | GET | /api/board-agenda-review/:boardMeetingId/stats | レビュー統計取得 | Level 18+ |
| 5 | GET | /api/board-agenda-review/next-meeting | 次回理事会情報取得 | Level 18+ |

### 3.4 フロントエンド要件

#### コンポーネント（4つ）

1. **AgendaReviewCard** - 議題レビューカード
2. **ReviewStatusBadge** - レビューステータスバッジ
3. **ReviewCommentDialog** - レビューコメント入力ダイアログ
4. **MeetingSummaryCards** - 理事会サマリーカード

#### カスタムフック（1つ）

- **useBoardAgendaReview** - データフェッチング、レビュー実行、状態管理

---

## 4. 初期データ例

### 4.1 BoardMeetingAgenda（6件）

#### 議題1: 2025年度第2四半期 人事戦略報告
```json
{
  "id": "AGENDA001",
  "boardMeetingId": "BM001",
  "meetingDate": "2025-10-20T14:00:00Z",
  "agendaOrder": 1,
  "item": "2025年度第2四半期 人事戦略報告",
  "description": "Q2の人事施策実施状況、職員エンゲージメント指標、次四半期の重点課題を報告。",
  "category": "人事戦略",
  "duration": 20,
  "presenterId": "USR_LEVEL17_001",
  "presenterTitle": "戦略企画部長",
  "priority": "high",
  "sourceReport": "月次議題化プロセスレポート",
  "sourceReportId": "REPORT123",
  "preparedBy": "戦略企画部",
  "preparationStatus": "finalized",
  "documentsReady": true,
  "presentationReady": true,
  "documentUrls": {
    "report": "s3://reports/q2-hr-strategy.pdf",
    "presentation": "s3://reports/q2-hr-strategy-presentation.pptx"
  },
  "keyPoints": [
    "職員エンゲージメントスコア: 74点（前期比+6点）",
    "VoiceDrive参加率: 64.3%（目標60%達成）",
    "議題化プロセス導入による組織課題の早期発見・解決",
    "Q3重点施策: 施設間人材ローテーション制度の試験導入"
  ],
  "expectedDiscussion": "施設間ローテーション制度の具体的な運用方法、予算措置",
  "requiredDecision": "施設間人材ローテーション制度の試験導入承認",
  "chairmanReview": "pending",
  "chairmanComment": null,
  "chairmanReviewedBy": null,
  "chairmanReviewedAt": null
}
```

#### 議題2: 施設間人材配置最適化提案
```json
{
  "id": "AGENDA002",
  "boardMeetingId": "BM001",
  "meetingDate": "2025-10-20T14:00:00Z",
  "agendaOrder": 2,
  "item": "施設間人材配置最適化提案",
  "description": "全10施設の人材配置分析の結果、夜勤帯の人員偏在が判明。",
  "category": "組織改善",
  "duration": 15,
  "presenterId": "USR_LEVEL17_001",
  "presenterTitle": "戦略企画部長",
  "priority": "high",
  "sourceReport": "組織分析レポート",
  "preparedBy": "戦略企画部",
  "preparationStatus": "reviewing",
  "documentsReady": true,
  "presentationReady": false,
  "keyPoints": [
    "6施設で夜勤時の人手不足が共通課題",
    "施設間での人材融通により月平均40時間の残業削減見込み",
    "職員のスキル向上とキャリア開発にも寄与",
    "初期投資: 約500万円、年間効果: 人件費効率化 約2,000万円"
  ],
  "expectedDiscussion": "施設間移動の支援体制、職員の同意取得プロセス",
  "requiredDecision": "2026年4月からの試験運用承認、予算措置",
  "chairmanReview": "pending"
}
```

#### 議題3: 職員エンゲージメント向上施策の中間報告
```json
{
  "id": "AGENDA003",
  "boardMeetingId": "BM001",
  "meetingDate": "2025-10-20T14:00:00Z",
  "agendaOrder": 3,
  "item": "職員エンゲージメント向上施策の中間報告",
  "description": "2025年上半期のエンゲージメント向上施策の実施状況と成果を報告。",
  "category": "カルチャー開発",
  "duration": 10,
  "presenterId": "USR_HR_001",
  "presenterTitle": "人事部長",
  "priority": "medium",
  "sourceReport": "カルチャー開発委員会",
  "preparedBy": "人事部",
  "preparationStatus": "finalized",
  "documentsReady": true,
  "presentationReady": true,
  "keyPoints": [
    "新人離職率: 35% → 12%（中央総合病院メンター制度）",
    "残業時間削減: 月平均18時間 → 12時間（桜ヶ丘総合病院チーム制勤務）",
    "成功事例の横展開により法人全体での効果拡大を計画",
    "下半期重点: 若手職員キャリアパス制度の整備"
  ],
  "expectedDiscussion": "成功事例の他施設への展開スケジュール",
  "requiredDecision": "特になし（情報共有）",
  "chairmanReview": "approved",
  "chairmanComment": "良好な成果。横展開を積極的に進めてください。",
  "chairmanReviewedBy": "USR_CHAIRMAN",
  "chairmanReviewedAt": "2025-10-15T14:30:00Z"
}
```

#### 議題4: 委員会制度改革の進捗と成果
```json
{
  "id": "AGENDA004",
  "boardMeetingId": "BM001",
  "meetingDate": "2025-10-20T14:00:00Z",
  "agendaOrder": 4,
  "item": "委員会制度改革の進捗と成果",
  "description": "議題化プロセスと連動した委員会制度改革の進捗報告。",
  "category": "ガバナンス",
  "duration": 15,
  "presenterId": "USR_LEVEL17_001",
  "presenterTitle": "戦略企画部長",
  "priority": "medium",
  "sourceReport": "委員会効果測定レポート",
  "preparedBy": "戦略企画部",
  "preparationStatus": "finalized",
  "documentsReady": true,
  "presentationReady": true,
  "keyPoints": [
    "委員会レビュー案件: 342件（前年同期比+180%）",
    "委員会から経営層への提案: 89件（実施率67%）",
    "職員の声が組織改善につながる実感の向上",
    "今後の課題: 委員会間の連携強化、審議の効率化"
  ],
  "expectedDiscussion": "委員会運営の効率化施策",
  "requiredDecision": "特になし（進捗確認）",
  "chairmanReview": "approved",
  "chairmanReviewedBy": "USR_CHAIRMAN",
  "chairmanReviewedAt": "2025-10-15T15:00:00Z"
}
```

#### 議題5: VoiceDrive議題化プロセス導入成果報告
```json
{
  "id": "AGENDA005",
  "boardMeetingId": "BM001",
  "meetingDate": "2025-10-20T14:00:00Z",
  "agendaOrder": 5,
  "item": "VoiceDrive議題化プロセス導入成果報告",
  "description": "VoiceDrive議題化プロセスの導入成果を総括。",
  "category": "システム改善",
  "duration": 25,
  "presenterId": "USR_HR_001",
  "presenterTitle": "人事部長",
  "priority": "high",
  "sourceReport": "ボイス分析統括レポート",
  "preparedBy": "人事部・戦略企画部",
  "preparationStatus": "finalized",
  "documentsReady": true,
  "presentationReady": true,
  "keyPoints": [
    "総投稿数: 12,847件（全施設）、参加率: 64.3%",
    "解決済み案件: 7,541件（解決率58.7%）",
    "平均処理日数: 26.4日（目標30日以内達成）",
    "2026年4月より全10施設への本格展開を提案"
  ],
  "expectedDiscussion": "全施設展開の予算、スケジュール、体制",
  "requiredDecision": "2026年4月全施設展開の承認、予算約800万円の承認",
  "chairmanReview": "pending"
}
```

#### 議題6: 次年度予算編成方針（人事関連）
```json
{
  "id": "AGENDA006",
  "boardMeetingId": "BM001",
  "meetingDate": "2025-10-20T14:00:00Z",
  "agendaOrder": 6,
  "item": "次年度予算編成方針（人事関連）",
  "description": "2026年度の人事関連予算編成方針を提示。",
  "category": "予算",
  "duration": 20,
  "presenterId": "USR_LEVEL17_001",
  "presenterTitle": "戦略企画部長",
  "priority": "high",
  "sourceReport": "戦略HR計画",
  "preparedBy": "戦略企画部",
  "preparationStatus": "draft",
  "documentsReady": false,
  "presentationReady": false,
  "keyPoints": [
    "総額: 前年比+12%（重点投資により組織強化）",
    "主要項目: VoiceDrive全施設展開、人材ローテーション制度、キャリアラダー制度",
    "期待効果: 離職率低下、生産性向上、職員満足度向上",
    "投資回収: 3年間で人件費効率化により投資額の150%回収見込み"
  ],
  "expectedDiscussion": "予算規模の妥当性、優先順位",
  "requiredDecision": "次年度予算編成方針の承認",
  "chairmanReview": "needs_revision",
  "chairmanComment": "具体的な数値根拠を補強してください。投資効果の試算をより詳細に。",
  "chairmanReviewedBy": "USR_CHAIRMAN",
  "chairmanReviewedAt": "2025-10-16T10:00:00Z"
}
```

---

## 5. Prisma マイグレーションスクリプト

### 5.1 マイグレーションファイル

```sql
-- prisma/migrations/YYYYMMDDHHMMSS_add_board_agenda_review_fields/migration.sql

-- BoardMeetingAgenda テーブルに理事長レビュー用フィールドを追加
ALTER TABLE `board_meeting_agendas`
ADD COLUMN `key_points` JSON NULL AFTER `document_urls`,
ADD COLUMN `expected_discussion` TEXT NULL AFTER `key_points`,
ADD COLUMN `required_decision` TEXT NULL AFTER `expected_discussion`,
ADD COLUMN `chairman_review` VARCHAR(191) NULL DEFAULT 'pending' AFTER `required_decision`,
ADD COLUMN `chairman_comment` TEXT NULL AFTER `chairman_review`,
ADD COLUMN `chairman_reviewed_by` VARCHAR(191) NULL AFTER `chairman_comment`,
ADD COLUMN `chairman_reviewed_at` DATETIME(3) NULL AFTER `chairman_reviewed_by`;

-- インデックス追加
CREATE INDEX `idx_bma_chairman_review` ON `board_meeting_agendas`(`chairman_review`);
CREATE INDEX `idx_bma_chairman_reviewed_at` ON `board_meeting_agendas`(`chairman_reviewed_at`);

-- 外部キー制約追加
ALTER TABLE `board_meeting_agendas`
ADD CONSTRAINT `fk_bma_chairman_reviewed_by` FOREIGN KEY (`chairman_reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
```

### 5.2 Seed データスクリプト

```typescript
// prisma/seeds/boardAgendaReviewSeed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBoardAgendaReview() {
  console.log('🌱 Seeding BoardAgendaReview data...');

  // 理事会作成
  const boardMeeting = await prisma.boardMeeting.upsert({
    where: { id: 'BM001' },
    create: {
      id: 'BM001',
      meetingDate: new Date('2025-10-20T14:00:00Z'),
      startTime: '14:00',
      location: '本部会議室A',
      expectedDuration: 120,
      expectedAttendees: 12,
      status: 'planning',
      preparationProgress: 60,
      createdBy: 'USR_CHAIRMAN'
    },
    update: {}
  });

  console.log('✅ BoardMeeting created:', boardMeeting.id);

  // 議題データ
  const agendas = [
    {
      id: 'AGENDA001',
      boardMeetingId: 'BM001',
      agendaOrder: 1,
      item: '2025年度第2四半期 人事戦略報告',
      description: 'Q2の人事施策実施状況、職員エンゲージメント指標、次四半期の重点課題を報告。',
      category: '人事戦略',
      duration: 20,
      presenterId: 'USR_LEVEL17_001',
      presenterTitle: '戦略企画部長',
      priority: 'high',
      sourceReport: '月次議題化プロセスレポート',
      preparedBy: '戦略企画部',
      preparationStatus: 'finalized',
      documentsReady: true,
      presentationReady: true,
      keyPoints: [
        '職員エンゲージメントスコア: 74点（前期比+6点）',
        'VoiceDrive参加率: 64.3%（目標60%達成）',
        '議題化プロセス導入による組織課題の早期発見・解決',
        'Q3重点施策: 施設間人材ローテーション制度の試験導入'
      ],
      expectedDiscussion: '施設間ローテーション制度の具体的な運用方法、予算措置',
      requiredDecision: '施設間人材ローテーション制度の試験導入承認',
      chairmanReview: 'pending'
    },
    // ... 他5件
  ];

  for (const agenda of agendas) {
    await prisma.boardMeetingAgenda.upsert({
      where: { id: agenda.id },
      create: agenda,
      update: agenda
    });
  }

  console.log('✅ BoardMeetingAgendas seeded (6 items)');
  console.log('🎉 BoardAgendaReview seed completed!');
}

seedBoardAgendaReview()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 6. 実装スケジュール

### Phase 1: データベース・サービス層実装（2日）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 1 | テーブル拡張・マイグレーション | BoardMeetingAgendaに7フィールド追加、User拡張 |
| 2 | サービス層実装・テスト | BoardAgendaReviewService、ユニットテスト |

### Phase 2: API実装（1日）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 3 | API実装・統合テスト | 5エンドポイント、統合テスト |

### Phase 3: フロントエンド実装（2日）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 4 | コンポーネント実装 | 4コンポーネント、useBoardAgendaReview |
| 5 | ページ統合・テスト | API連携、エンドツーエンドテスト |

### 総工数
- **開発期間**: 5日（1週間）
- **バックエンド**: 3日
- **フロントエンド**: 2日

---

## 7. テスト要件

### 7.1 ユニットテスト

```typescript
describe('BoardAgendaReviewService', () => {
  describe('getAgendasForReview', () => {
    it('指定された理事会の議題を全て取得すること', async () => {
      const agendas = await service.getAgendasForReview('BM001');
      expect(agendas).toHaveLength(6);
    });
  });

  describe('submitChairmanReview', () => {
    it('承認時に正しくステータスを更新すること', async () => {
      const result = await service.submitChairmanReview('AGENDA001', {
        status: 'approved',
        reviewedBy: 'USR_CHAIRMAN'
      });
      expect(result.chairmanReview).toBe('approved');
      expect(result.chairmanReviewedAt).toBeDefined();
    });

    it('修正依頼時はコメントが必須であること', async () => {
      await expect(
        service.submitChairmanReview('AGENDA001', {
          status: 'needs_revision',
          reviewedBy: 'USR_CHAIRMAN'
        })
      ).rejects.toThrow('修正依頼にはコメントが必要です');
    });
  });

  describe('notifyLevel17', () => {
    it('Level 17ユーザーに通知が送信されること', async () => {
      await service.notifyLevel17('AGENDA001', { status: 'approved' });
      const notifications = await prisma.notification.findMany({
        where: { category: 'board_agenda_review' }
      });
      expect(notifications.length).toBeGreaterThan(0);
    });
  });
});
```

### 7.2 API統合テスト

```typescript
describe('Board Agenda Review API', () => {
  describe('GET /api/board-agenda-review/:boardMeetingId/agendas', () => {
    it('Level 18未満はアクセス拒否', async () => {
      const response = await request(app)
        .get('/api/board-agenda-review/BM001/agendas')
        .set('Authorization', 'Bearer level17_token');
      expect(response.status).toBe(403);
    });

    it('Level 18以上は正常取得', async () => {
      const response = await request(app)
        .get('/api/board-agenda-review/BM001/agendas')
        .set('Authorization', 'Bearer level18_token');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(6);
    });
  });

  describe('POST /api/board-agenda-review/agendas/:agendaId/review', () => {
    it('承認処理が正常に完了すること', async () => {
      const response = await request(app)
        .post('/api/board-agenda-review/agendas/AGENDA001/review')
        .set('Authorization', 'Bearer level18_token')
        .send({ status: 'approved' });
      expect(response.status).toBe(200);
      expect(response.body.chairmanReview).toBe('approved');
    });
  });
});
```

---

## 8. セキュリティ要件

### 8.1 アクセス制御

```typescript
// Level 18（理事長・法人事務局長）のみアクセス可能
const checkBoardAgendaReviewAccess = (user: User) => {
  if (user.permissionLevel < 18) {
    throw new ForbiddenError('理事会議題確認へのアクセス権限がありません');
  }
};
```

### 8.2 監査ログ

```typescript
// 理事長レビューを監査ログに記録
await auditLog.create({
  userId: user.id,
  action: 'CHAIRMAN_REVIEW_AGENDA',
  resource: agendaId,
  details: { status: 'approved', comment: 'Good work' },
  timestamp: new Date()
});
```

### 8.3 通知セキュリティ

```typescript
// Level 17のみに通知を送信
const level17Users = await prisma.user.findMany({
  where: { permissionLevel: { gte: 17, lt: 18 } }
});
```

---

## 9. パフォーマンス要件

### 9.1 インデックス設計

```sql
-- 理事会IDでの議題検索を高速化
CREATE INDEX idx_board_meeting_agendas_meeting_id
ON board_meeting_agendas(board_meeting_id);

-- レビューステータスでのフィルタリングを高速化
CREATE INDEX idx_board_meeting_agendas_chairman_review
ON board_meeting_agendas(chairman_review);

-- レビュー日時でのソートを高速化
CREATE INDEX idx_board_meeting_agendas_chairman_reviewed_at
ON board_meeting_agendas(chairman_reviewed_at);
```

### 9.2 キャッシュ戦略

```typescript
// 次回理事会情報: 10分キャッシュ
await redis.setex(
  'board-agenda-review:next-meeting',
  600,
  JSON.stringify(nextMeeting)
);

// 議題一覧: 5分キャッシュ
await redis.setex(
  `board-agenda-review:agendas:${boardMeetingId}`,
  300,
  JSON.stringify(agendas)
);

// レビュー実行時はキャッシュクリア
await redis.del(`board-agenda-review:agendas:${boardMeetingId}`);
```

---

## 10. 運用要件

### 10.1 通知タイミング

```typescript
// Level 17が議題を準備完了した際
await notifyLevel18({
  title: '理事会議題の確認依頼',
  message: `${agenda.item} の確認をお願いします。`,
  link: '/board-agenda-review'
});

// 理事長がレビューを完了した際
await notifyLevel17({
  title: '理事会議題レビュー結果',
  message: reviewResultMessage,
  link: '/board-preparation'
});
```

### 10.2 モニタリング

```typescript
// レビュー完了率の監視
const reviewCompletionRate = (approvedCount + rejectedCount) / totalAgendas;
if (reviewCompletionRate < 0.8 && daysUntilMeeting < 3) {
  logger.warn('理事会まで3日を切りましたが、レビュー完了率が80%未満です');
}
```

---

## 11. 実装チェックリスト

### 11.1 バックエンド

#### データベース
- [ ] BoardMeetingAgendaテーブルに7フィールド追加
- [ ] Userテーブルにリレーション追加（reviewedAgendas）
- [ ] インデックス作成（3個）
- [ ] マイグレーション実行
- [ ] Seed データ投入（6議題）

#### サービス層
- [ ] BoardAgendaReviewService クラス作成
- [ ] getAgendasForReview() 実装
- [ ] getAgendaDetail() 実装
- [ ] submitChairmanReview() 実装
- [ ] getReviewStats() 実装
- [ ] notifyLevel17() 実装
- [ ] ユニットテスト（8ケース以上）

#### API層
- [ ] GET /api/board-agenda-review/:boardMeetingId/agendas
- [ ] GET /api/board-agenda-review/agendas/:agendaId
- [ ] POST /api/board-agenda-review/agendas/:agendaId/review
- [ ] GET /api/board-agenda-review/:boardMeetingId/stats
- [ ] GET /api/board-agenda-review/next-meeting
- [ ] Level 18権限チェック実装
- [ ] API統合テスト（5ケース以上）

### 11.2 フロントエンド

#### コンポーネント
- [ ] AgendaReviewCard コンポーネント実装
- [ ] ReviewStatusBadge コンポーネント実装
- [ ] ReviewCommentDialog コンポーネント実装
- [ ] MeetingSummaryCards コンポーネント実装

#### フック
- [ ] useBoardAgendaReview カスタムフック実装
- [ ] データフェッチング実装
- [ ] レビューアクション実装
- [ ] エラーハンドリング実装

#### ページ統合
- [ ] BoardAgendaReviewPage API連携
- [ ] ローディング状態UI
- [ ] エラー状態UI
- [ ] レスポンシブデザイン
- [ ] アクセシビリティ対応

### 11.3 運用準備

#### ドキュメント
- [ ] API仕様書作成
- [ ] 運用手順書作成
- [ ] レビューフロー図作成
- [ ] トラブルシューティングガイド作成

#### モニタリング
- [ ] レビュー完了率監視設定
- [ ] 通知送信状況監視設定
- [ ] エラーログ収集設定

---

## 12. 医療システムとの連携確認

### 12.1 確認事項

- [x] 医療システム側のデータは不要 → ✅ 確認済み（VoiceDrive内部ワークフロー）
- [x] 医療システム側の追加作業は不要 → ✅ 確認済み

---

## 13. リスク管理

### 13.1 技術的リスク

#### リスク1: レビューコメントの文字数制限
**内容**: 理事長コメントが長文の場合にエラー
**対策**:
- TEXT型を使用（制限なし）
- フロントエンドで3000文字以内に制限
- 超過時は警告表示

#### リスク2: 同時レビューの競合
**内容**: 複数のLevel 18ユーザーが同時にレビュー
**対策**:
- 楽観的ロック（updatedAtで競合検出）
- 先勝ちルール
- 競合時はエラーメッセージ表示

### 13.2 運用リスク

#### リスク3: レビュー期限切れ
**内容**: 理事会直前までレビューが完了しない
**対策**:
- 理事会3日前にリマインダー通知
- 未レビュー議題のレポート自動生成
- エスカレーション機能

---

## 14. 今後の拡張予定

### Phase 2 機能（3ヶ月後）
- 理事長レビューの一括承認機能
- レビュー履歴の表示
- 議題の優先順位自動調整
- レビューコメントのテンプレート機能

### Phase 3 機能（6ヶ月後）
- AIによる議題の論点抽出
- 過去の議論履歴の参照
- レビュー結果の統計分析
- Excel/PDFレポート生成

---

## 15. 承認

### 15.1 VoiceDrive側承認
- [ ] バックエンドリード承認
- [ ] フロントエンドリード承認
- [ ] プロダクトマネージャー承認

### 15.2 統合テスト日程
- **予定日**: 2025年10月25日（金）
- **参加者**: VoiceDrive開発チーム
- **確認項目**:
  - BoardPreparation → BoardAgendaReview のワークフロー
  - 理事長レビュー機能
  - Level 17への通知機能
  - レビュー統計の正確性

---

## 16. 関連ドキュメント

- [Board Agenda Review DB要件分析](./board-agenda-review_DB要件分析_20251011.md)
- [BoardPreparation DB要件分析](./board-preparation_DB要件分析_20251010.md)
- [BoardPreparation 暫定マスターリスト](./board-preparation暫定マスターリスト_20251010.md)
- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)

---

**ドキュメント作成者**: Claude (VoiceDrive AI Assistant)
**最終更新日**: 2025年10月11日
**バージョン**: 1.0.0
**ステータス**: ✅ 完成 - レビュー待ち
