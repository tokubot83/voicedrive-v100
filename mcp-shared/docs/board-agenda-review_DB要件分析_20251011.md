# Board Agenda Review DB要件分析

**作成日**: 2025年10月11日
**対象ページ**: BoardAgendaReview (https://voicedrive-v100.vercel.app/board-agenda-review)
**権限レベル**: Level 18（理事長・法人事務局長）
**ドキュメントID**: BOARD-AGENDA-REVIEW-20251011

---

## 1. ページ概要

### 1.1 目的
Level 17（戦略企画部長・人事部長）が準備した理事会議題を事前確認し、理事会前の論点整理と承認を行う。

### 1.2 対象ユーザー
- Level 18: 理事長、法人事務局長

### 1.3 主要機能
1. **理事会議題の事前確認** - Level 17が準備した議題を詳細確認
2. **理事長レビュー** - 承認・修正依頼・却下の判断
3. **論点整理** - 理事会での議論ポイントを事前に把握
4. **資料準備状況の確認** - 報告書・プレゼン資料の準備状況

---

## 2. ページ構成とデータ分析

### 2.1 サマリーカード（lines 234-271）

**表示内容**:
```typescript
- 次回理事会情報
  - date: "2025年10月20日"
  - time: "14:00"
  - location: "本部会議室A"
  - expectedAttendees: 12
  - totalEstimatedTime: 120分

- 総議題数: 6件
- 承認済み: 2件
- 確認待ち: 3件
- 修正依頼中: 1件
```

**データソース**:
- **BoardMeeting** テーブル（既存）- 理事会情報
- **BoardMeetingAgenda** テーブル（既存、要拡張）- 議題情報

**算出方法**:
```typescript
// 総議題数
SELECT COUNT(*) FROM BoardMeetingAgenda
WHERE board_meeting_id = :boardMeetingId;

// 承認済み件数
SELECT COUNT(*) FROM BoardMeetingAgenda
WHERE board_meeting_id = :boardMeetingId
  AND chairman_review = 'approved';

// 確認待ち件数
SELECT COUNT(*) FROM BoardMeetingAgenda
WHERE board_meeting_id = :boardMeetingId
  AND chairman_review = 'pending';

// 修正依頼中件数
SELECT COUNT(*) FROM BoardMeetingAgenda
WHERE board_meeting_id = :boardMeetingId
  AND chairman_review = 'needs_revision';
```

---

### 2.2 議題一覧（lines 51-180, 273-403）

**表示内容**:
```typescript
interface AgendaItem {
  id: string;
  title: string;                      // "2025年度第2四半期 人事戦略報告"
  category: string;                   // "人事戦略"
  priority: 'high' | 'medium' | 'low';
  preparedBy: string;                 // "戦略企画部"
  source: string;                     // "月次議題化プロセスレポート"
  summary: string;                    // 議題サマリー
  keyPoints: string[];                // 主要ポイント（4-5個）
  expectedDiscussion: string;         // 想定される議論
  requiredDecision: string;           // 求められる決定
  documentsAttached: boolean;         // 報告書添付済み
  presentationReady: boolean;         // プレゼン資料準備済み
  estimatedTime: number;              // 予定時間（分）
  chairmanReview: 'pending' | 'approved' | 'needs_revision' | 'rejected';
  chairmanComment?: string;           // 理事長コメント
}
```

**6件の議題**:
1. **2025年度第2四半期 人事戦略報告**（人事戦略、high、pending）
2. **施設間人材配置最適化提案**（組織改善、high、pending）
3. **職員エンゲージメント向上施策の中間報告**（カルチャー開発、medium、approved）
4. **委員会制度改革の進捗と成果**（ガバナンス、medium、approved）
5. **VoiceDrive議題化プロセス導入成果報告**（システム改善、high、pending）
6. **次年度予算編成方針（人事関連）**（予算、high、needs_revision）

**データソース**:
- **BoardMeetingAgenda** テーブル（既存、要拡張）
- Level 17が`BoardPreparationPage`で作成した議題

**必要な追加フィールド**:
```prisma
model BoardMeetingAgenda {
  // ... 既存フィールド

  // 🆕 理事長レビュー用フィールド（2025-10-11）
  keyPoints           Json?     @map("key_points")            // 主要ポイント配列
  expectedDiscussion  String?   @db.Text @map("expected_discussion")  // 想定される議論
  requiredDecision    String?   @db.Text @map("required_decision")    // 求められる決定
  chairmanReview      String?   @default("pending") @map("chairman_review")  // "pending", "approved", "needs_revision", "rejected"
  chairmanComment     String?   @db.Text @map("chairman_comment")     // 理事長コメント
  chairmanReviewedBy  String?   @map("chairman_reviewed_by")          // レビュー実施者（User ID）
  chairmanReviewedAt  DateTime? @map("chairman_reviewed_at")          // レビュー日時

  // リレーション追加
  chairmanReviewer    User?     @relation("AgendaChairmanReviewer", fields: [chairmanReviewedBy], references: [id])
}
```

---

### 2.3 レビューアクション（lines 208-211, 370-399）

**アクション**:
```typescript
handleReviewAction(agendaId: string, action: 'approve' | 'revise' | 'reject')
```

**処理内容**:
1. **承認（approve）**
   - `chairmanReview` を 'approved' に更新
   - `chairmanReviewedBy` にユーザーIDを設定
   - `chairmanReviewedAt` に現在日時を設定
   - Level 17に通知

2. **修正依頼（revise）**
   - `chairmanReview` を 'needs_revision' に更新
   - `chairmanComment` に修正依頼内容を設定
   - Level 17に通知（修正内容を含む）

3. **却下（reject）**
   - `chairmanReview` を 'rejected' に更新
   - `chairmanComment` に却下理由を設定
   - Level 17に通知

**データベース更新**:
```sql
UPDATE board_meeting_agendas
SET
  chairman_review = :status,
  chairman_comment = :comment,
  chairman_reviewed_by = :userId,
  chairman_reviewed_at = NOW()
WHERE id = :agendaId;
```

---

## 3. データ責任分担

### 3.1 VoiceDrive側の責任（100%）

| データ項目 | 管理方法 | 理由 |
|-----------|---------|------|
| **理事会議題データ** | 既存テーブル拡張 | BoardMeetingAgendaテーブルを拡張 |
| **理事長レビュー結果** | 既存テーブル拡張 | レビューステータス・コメントを追加 |
| **理事会情報** | 既存テーブル | BoardMeetingテーブル（既存） |

### 3.2 医療職員管理システム側の責任

**なし** - このページは完全にVoiceDrive内部のワークフローであり、医療システム側のデータは不要。

---

## 4. 不足項目の洗い出し

### 4.1 新規テーブルが必要

**なし** - 既存の`BoardMeetingAgenda`テーブルを拡張するのみ。

### 4.2 既存テーブルの拡張

#### 4.2.1 BoardMeetingAgenda テーブル拡張

**追加フィールド（7個）**:

| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| keyPoints | Json? | 主要ポイント配列 | ["スコア74点", "参加率64.3%", ...] |
| expectedDiscussion | Text? | 想定される議論 | "施設間ローテーション制度の具体的な運用方法、予算措置" |
| requiredDecision | Text? | 求められる決定 | "施設間人材ローテーション制度の試験導入承認" |
| chairmanReview | String? | レビューステータス | "pending" / "approved" / "needs_revision" / "rejected" |
| chairmanComment | Text? | 理事長コメント | "良好な成果。横展開を積極的に進めてください。" |
| chairmanReviewedBy | String? | レビュー実施者ID | "USR_LEVEL18_001" |
| chairmanReviewedAt | DateTime? | レビュー日時 | "2025-10-15T14:30:00Z" |

**リレーション追加（1個）**:
- `chairmanReviewer: User` - レビュー実施者

#### 4.2.2 User テーブル拡張

```prisma
model User {
  // 既存フィールド...

  // BoardAgendaReview統合実装（2025-10-11）
  reviewedAgendas         BoardMeetingAgenda[]  @relation("AgendaChairmanReviewer")
}
```

### 4.3 医療システムAPIの必要性

**なし** - 医療システム側のデータは不要。

---

## 5. サービス層実装要件

### 5.1 BoardAgendaReviewService

```typescript
class BoardAgendaReviewService {
  /**
   * 次回理事会の議題一覧を取得
   * @param boardMeetingId 理事会ID
   * @returns 議題一覧
   */
  async getAgendasForReview(
    boardMeetingId: string
  ): Promise<BoardMeetingAgenda[]>;

  /**
   * 議題の詳細を取得
   * @param agendaId 議題ID
   * @returns 議題詳細
   */
  async getAgendaDetail(agendaId: string): Promise<BoardMeetingAgenda>;

  /**
   * 理事長レビューを実行
   * @param agendaId 議題ID
   * @param reviewData レビューデータ
   */
  async submitChairmanReview(
    agendaId: string,
    reviewData: {
      status: 'approved' | 'needs_revision' | 'rejected';
      comment?: string;
      reviewedBy: string;
    }
  ): Promise<BoardMeetingAgenda>;

  /**
   * レビュー統計を取得
   * @param boardMeetingId 理事会ID
   * @returns レビュー統計
   */
  async getReviewStats(boardMeetingId: string): Promise<{
    totalAgendas: number;
    approvedCount: number;
    pendingCount: number;
    needsRevisionCount: number;
    rejectedCount: number;
  }>;

  /**
   * Level 17に通知を送信
   * @param agendaId 議題ID
   * @param reviewResult レビュー結果
   */
  async notifyLevel17(
    agendaId: string,
    reviewResult: {
      status: string;
      comment?: string;
    }
  ): Promise<void>;
}
```

### 5.2 主要メソッド実装詳細

#### 5.2.1 getAgendasForReview()

```typescript
async getAgendasForReview(
  boardMeetingId: string
): Promise<BoardMeetingAgenda[]> {
  return await prisma.boardMeetingAgenda.findMany({
    where: {
      boardMeeting: {
        id: boardMeetingId
      }
    },
    include: {
      presenter: {
        select: {
          id: true,
          name: true,
          department: true
        }
      },
      sourceReportRef: {
        select: {
          id: true,
          reportType: true,
          generatedAt: true
        }
      },
      chairmanReviewer: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      agendaOrder: 'asc'
    }
  });
}
```

#### 5.2.2 submitChairmanReview()

```typescript
async submitChairmanReview(
  agendaId: string,
  reviewData: {
    status: 'approved' | 'needs_revision' | 'rejected';
    comment?: string;
    reviewedBy: string;
  }
): Promise<BoardMeetingAgenda> {
  // 1. 議題を更新
  const updatedAgenda = await prisma.boardMeetingAgenda.update({
    where: { id: agendaId },
    data: {
      chairmanReview: reviewData.status,
      chairmanComment: reviewData.comment,
      chairmanReviewedBy: reviewData.reviewedBy,
      chairmanReviewedAt: new Date()
    },
    include: {
      presenter: true,
      boardMeeting: true
    }
  });

  // 2. Level 17に通知
  await this.notifyLevel17(agendaId, {
    status: reviewData.status,
    comment: reviewData.comment
  });

  // 3. 監査ログ記録
  await prisma.auditLog.create({
    data: {
      userId: reviewData.reviewedBy,
      action: 'CHAIRMAN_REVIEW_AGENDA',
      resource: agendaId,
      details: JSON.stringify({
        status: reviewData.status,
        comment: reviewData.comment
      }),
      timestamp: new Date()
    }
  });

  return updatedAgenda;
}
```

#### 5.2.3 notifyLevel17()

```typescript
async notifyLevel17(
  agendaId: string,
  reviewResult: {
    status: string;
    comment?: string;
  }
): Promise<void> {
  const agenda = await prisma.boardMeetingAgenda.findUnique({
    where: { id: agendaId },
    include: {
      presenter: true,
      chairmanReviewer: true
    }
  });

  if (!agenda) return;

  // Level 17ユーザーに通知
  const level17Users = await prisma.user.findMany({
    where: {
      permissionLevel: { gte: 17, lt: 18 }
    }
  });

  const notificationMessage = {
    approved: `議題「${agenda.item}」が理事長に承認されました。`,
    needs_revision: `議題「${agenda.item}」に修正依頼があります。コメント: ${reviewResult.comment}`,
    rejected: `議題「${agenda.item}」が却下されました。理由: ${reviewResult.comment}`
  }[reviewResult.status];

  for (const user of level17Users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        category: 'board_agenda_review',
        title: '理事会議題レビュー結果',
        message: notificationMessage,
        priority: reviewResult.status === 'needs_revision' ? 'high' : 'medium',
        isRead: false
      }
    });
  }
}
```

---

## 6. API要件

### 6.1 議題一覧取得

```typescript
GET /api/board-agenda-review/:boardMeetingId/agendas
Permission: Level 18+
Response: BoardMeetingAgenda[]
```

### 6.2 議題詳細取得

```typescript
GET /api/board-agenda-review/agendas/:agendaId
Permission: Level 18+
Response: BoardMeetingAgenda
```

### 6.3 理事長レビュー実行

```typescript
POST /api/board-agenda-review/agendas/:agendaId/review
Permission: Level 18+
Body: {
  status: 'approved' | 'needs_revision' | 'rejected';
  comment?: string;
}
Response: BoardMeetingAgenda
```

### 6.4 レビュー統計取得

```typescript
GET /api/board-agenda-review/:boardMeetingId/stats
Permission: Level 18+
Response: {
  totalAgendas: number;
  approvedCount: number;
  pendingCount: number;
  needsRevisionCount: number;
  rejectedCount: number;
  totalEstimatedTime: number;
}
```

### 6.5 次回理事会情報取得

```typescript
GET /api/board-agenda-review/next-meeting
Permission: Level 18+
Response: {
  id: string;
  date: string;
  time: string;
  location: string;
  expectedAttendees: number;
  agendaCount: number;
}
```

---

## 7. フロントエンド要件

### 7.1 コンポーネント構成

```typescript
// src/components/board-agenda-review/AgendaReviewCard.tsx
interface Props {
  agenda: BoardMeetingAgenda;
  onReview: (
    agendaId: string,
    action: 'approve' | 'revise' | 'reject',
    comment?: string
  ) => void;
}

// src/components/board-agenda-review/ReviewStatusBadge.tsx
interface Props {
  status: 'pending' | 'approved' | 'needs_revision' | 'rejected';
}

// src/components/board-agenda-review/ReviewCommentDialog.tsx
interface Props {
  agendaId: string;
  action: 'revise' | 'reject';
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

// src/components/board-agenda-review/MeetingSummaryCards.tsx
interface Props {
  meetingInfo: BoardMeeting;
  stats: ReviewStats;
}
```

### 7.2 カスタムフック

```typescript
// src/hooks/useBoardAgendaReview.ts
export const useBoardAgendaReview = (boardMeetingId: string) => {
  const [agendas, setAgendas] = useState<BoardMeetingAgenda[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgenda, setSelectedAgenda] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'revise' | 'reject' | null>(null);

  useEffect(() => {
    fetchAgendas();
    fetchStats();
  }, [boardMeetingId]);

  const fetchAgendas = async () => {
    const response = await fetch(`/api/board-agenda-review/${boardMeetingId}/agendas`);
    const data = await response.json();
    setAgendas(data);
  };

  const fetchStats = async () => {
    const response = await fetch(`/api/board-agenda-review/${boardMeetingId}/stats`);
    const data = await response.json();
    setStats(data);
  };

  const handleReview = async (
    agendaId: string,
    action: 'approve' | 'revise' | 'reject',
    comment?: string
  ) => {
    const statusMap = {
      approve: 'approved',
      revise: 'needs_revision',
      reject: 'rejected'
    };

    await fetch(`/api/board-agenda-review/agendas/${agendaId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: statusMap[action],
        comment
      })
    });

    await fetchAgendas();
    await fetchStats();
  };

  const openReviewDialog = (agendaId: string, action: 'revise' | 'reject') => {
    setSelectedAgenda(agendaId);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  return {
    agendas,
    stats,
    loading,
    handleReview,
    openReviewDialog,
    reviewDialogOpen,
    setReviewDialogOpen,
    selectedAgenda,
    reviewAction
  };
};
```

---

## 8. 実装スケジュール

### Phase 1: データベース・サービス層実装（2日）

**Day 1: テーブル拡張・マイグレーション**
- BoardMeetingAgendaテーブルに7フィールド追加
- Userテーブルにリレーション追加
- インデックス追加
- マイグレーション実行

**Day 2: サービス層実装**
- BoardAgendaReviewService実装
- getAgendasForReview() メソッド
- submitChairmanReview() メソッド
- getReviewStats() メソッド
- notifyLevel17() メソッド
- ユニットテスト（8ケース以上）

### Phase 2: API実装（1日）

**Day 3: API実装**
- GET /api/board-agenda-review/:boardMeetingId/agendas
- GET /api/board-agenda-review/agendas/:agendaId
- POST /api/board-agenda-review/agendas/:agendaId/review
- GET /api/board-agenda-review/:boardMeetingId/stats
- GET /api/board-agenda-review/next-meeting
- API統合テスト（5ケース以上）

### Phase 3: フロントエンド実装（2日）

**Day 4: コンポーネント実装**
- AgendaReviewCard
- ReviewStatusBadge
- ReviewCommentDialog
- MeetingSummaryCards

**Day 5: ページ統合・テスト**
- BoardAgendaReviewPage API連携
- useBoardAgendaReview フック実装
- エンドツーエンドテスト
- レスポンシブデザイン調整

### 総工数
- **開発期間**: 5日（1週間）
- **バックエンド**: 3日（DB 1日 + サービス 1日 + API 1日）
- **フロントエンド**: 2日

---

## 9. セキュリティ要件

### 9.1 アクセス制御

```typescript
// Level 18（理事長・法人事務局長）のみアクセス可能
const checkBoardAgendaReviewAccess = (user: User) => {
  if (user.permissionLevel < 18) {
    throw new ForbiddenError('理事会議題確認へのアクセス権限がありません');
  }
};
```

### 9.2 監査ログ

```typescript
// 理事長レビューを監査ログに記録
await auditLog.create({
  userId: user.id,
  action: 'CHAIRMAN_REVIEW_AGENDA',
  resource: agendaId,
  details: {
    status: 'approved',
    comment: 'Good work'
  },
  timestamp: new Date()
});
```

### 9.3 通知セキュリティ

```typescript
// Level 17のみに通知を送信
const level17Users = await prisma.user.findMany({
  where: {
    permissionLevel: { gte: 17, lt: 18 }
  }
});
```

---

## 10. パフォーマンス要件

### 10.1 インデックス設計

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

### 10.2 キャッシュ戦略

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
await redis.del(`board-agenda-review:stats:${boardMeetingId}`);
```

---

## 11. 運用要件

### 11.1 通知タイミング

```typescript
// Level 17が議題を準備完了した際
await notifyLevel18({
  title: '理事会議題の確認依頼',
  message: `${agenda.item} の確認をお願いします。`,
  link: `/board-agenda-review`
});

// 理事長がレビューを完了した際
await notifyLevel17({
  title: '理事会議題レビュー結果',
  message: reviewResultMessage,
  link: `/board-preparation`
});
```

### 11.2 モニタリング

```typescript
// レビュー完了率の監視
const reviewCompletionRate = (approvedCount + rejectedCount) / totalAgendas;
if (reviewCompletionRate < 0.8 && daysUntilMeeting < 3) {
  logger.warn('理事会まで3日を切りましたが、レビュー完了率が80%未満です');
}
```

---

## 12. テスト要件

### 12.1 ユニットテスト

```typescript
describe('BoardAgendaReviewService', () => {
  describe('getAgendasForReview', () => {
    it('指定された理事会の議題を全て取得すること', async () => {
      const agendas = await service.getAgendasForReview(boardMeetingId);
      expect(agendas).toHaveLength(6);
      expect(agendas.every(a => a.boardMeetingId === boardMeetingId)).toBe(true);
    });
  });

  describe('submitChairmanReview', () => {
    it('承認時に正しくステータスを更新すること', async () => {
      const result = await service.submitChairmanReview(agendaId, {
        status: 'approved',
        reviewedBy: userId
      });
      expect(result.chairmanReview).toBe('approved');
      expect(result.chairmanReviewedBy).toBe(userId);
      expect(result.chairmanReviewedAt).toBeDefined();
    });

    it('修正依頼時にコメントが必須であること', async () => {
      await expect(
        service.submitChairmanReview(agendaId, {
          status: 'needs_revision',
          reviewedBy: userId
          // comment が未設定
        })
      ).rejects.toThrow('修正依頼にはコメントが必要です');
    });

    it('却下時にコメントが必須であること', async () => {
      await expect(
        service.submitChairmanReview(agendaId, {
          status: 'rejected',
          reviewedBy: userId
          // comment が未設定
        })
      ).rejects.toThrow('却下にはコメントが必要です');
    });
  });

  describe('notifyLevel17', () => {
    it('Level 17ユーザーに通知が送信されること', async () => {
      await service.notifyLevel17(agendaId, {
        status: 'approved'
      });

      const notifications = await prisma.notification.findMany({
        where: {
          category: 'board_agenda_review'
        }
      });
      expect(notifications.length).toBeGreaterThan(0);
    });
  });
});
```

### 12.2 API統合テスト

```typescript
describe('Board Agenda Review API', () => {
  describe('GET /api/board-agenda-review/:boardMeetingId/agendas', () => {
    it('Level 18未満はアクセス拒否', async () => {
      const response = await request(app)
        .get(`/api/board-agenda-review/${boardMeetingId}/agendas`)
        .set('Authorization', 'Bearer level17_token');
      expect(response.status).toBe(403);
    });

    it('Level 18以上は正常取得', async () => {
      const response = await request(app)
        .get(`/api/board-agenda-review/${boardMeetingId}/agendas`)
        .set('Authorization', 'Bearer level18_token');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/board-agenda-review/agendas/:agendaId/review', () => {
    it('承認処理が正常に完了すること', async () => {
      const response = await request(app)
        .post(`/api/board-agenda-review/agendas/${agendaId}/review`)
        .set('Authorization', 'Bearer level18_token')
        .send({ status: 'approved' });
      expect(response.status).toBe(200);
      expect(response.body.chairmanReview).toBe('approved');
    });

    it('修正依頼時はコメントが必須', async () => {
      const response = await request(app)
        .post(`/api/board-agenda-review/agendas/${agendaId}/review`)
        .set('Authorization', 'Bearer level18_token')
        .send({ status: 'needs_revision' });
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('コメントが必要');
    });
  });
});
```

---

## 13. 関連ドキュメント

- [BoardPreparation DB要件分析](./board-preparation_DB要件分析_20251010.md)
- [BoardPreparation 暫定マスターリスト](./board-preparation暫定マスターリスト_20251010.md)
- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)

---

**ドキュメント作成者**: Claude (VoiceDrive AI Assistant)
**最終更新日**: 2025年10月11日
**バージョン**: 1.0.0
**ステータス**: ✅ レビュー待ち
