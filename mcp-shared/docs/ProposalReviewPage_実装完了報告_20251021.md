# ProposalReviewPage 実装完了報告

**作成日**: 2025年10月21日
**実装範囲**: ProposalReviewPage DB分析・API実装・フロントエンド統合
**ステータス**: ✅ 完了（Prisma Client生成待ち）

---

## 📋 実装サマリー

### 実装内容
50点到達提案のレビュー承認機能を完全実装しました。主任・師長が提案を審査し、部署議題として承認/施設議題に昇格/却下の3つの判断を記録できます。

### データ管理責任
- **VoiceDrive**: 100%（提案、投票、レビュー情報）
- **医療システム**: 不要（User tableのキャッシュデータのみ使用）

---

## 🗄️ データベース変更

### 新規テーブル: ProposalReview

```prisma
model ProposalReview {
  id                       String   @id @default(cuid())
  postId                   String
  reviewerId               String
  action                   String   // 'approve_as_dept_agenda' | 'escalate_to_facility' | 'reject'
  reason                   String
  comment                  String?
  reviewedAt               DateTime @default(now())
  agendaScoreAtReview      Int
  voteCountAtReview        Json     // { approve: 15, neutral: 3, oppose: 2 }
  reviewerPermissionLevel  Decimal
  reviewerDepartment       String
  status                   String   @default("active") // 'active' | 'superseded'
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  post     Post @relation("PostProposalReviews", fields: [postId], references: [id], onDelete: Cascade)
  reviewer User @relation("UserProposalReviews", fields: [reviewerId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([reviewerId])
  @@index([reviewedAt])
  @@index([action])
  @@index([status])
  @@index([postId, status])
  @@map("proposal_reviews")
}
```

### リレーション追加

**Post model**:
```prisma
proposalReviews ProposalReview[] @relation("PostProposalReviews")
```

**User model**:
```prisma
proposalReviews ProposalReview[] @relation("UserProposalReviews")
```

---

## 🔌 API実装

### 1. POST /api/proposal-review/[postId]
**ファイル**: `src/pages/api/proposal-review/[postId].ts`

**機能**: 提案レビュー判断の記録

**リクエスト**:
```json
{
  "action": "approve_as_dept_agenda",
  "reason": "職員の声を反映した改善提案として評価できる",
  "comment": "次回部署ミーティングで議論します",
  "reviewerId": "user_abc123"
}
```

**レスポンス**:
```json
{
  "success": true,
  "review": {
    "id": "review_xyz789",
    "postId": "post_abc123",
    "action": "approve_as_dept_agenda",
    "reason": "職員の声を反映した改善提案として評価できる",
    "comment": "次回部署ミーティングで議論します",
    "reviewedAt": "2025-10-21T10:30:00.000Z",
    "reviewer": {
      "id": "user_abc123",
      "name": "山田太郎",
      "permissionLevel": 7.0,
      "department": "看護部-看護科"
    }
  },
  "post": {
    "id": "post_abc123",
    "agendaStatus": "APPROVED_AS_DEPT_AGENDA",
    "agendaDecisionBy": "user_abc123",
    "agendaDecisionAt": "2025-10-21T10:30:00.000Z"
  },
  "message": "判断を記録しました"
}
```

**バリデーション**:
- `action`: 必須、3つの値のいずれか
- `reason`: 必須、10-500文字
- `comment`: 任意、最大300文字
- `reviewerId`: 必須、permissionLevel >= 5.0
- `postId`: 必須、agendaScore >= 50

**エラーコード**:
- `400 VALIDATION_ERROR`: バリデーションエラー
- `400 REASON_TOO_SHORT`: 理由が10文字未満
- `400 REASON_TOO_LONG`: 理由が500文字超
- `400 INVALID_ACTION`: アクションが不正
- `403 INSUFFICIENT_PERMISSION`: 権限不足（Level 5未満）
- `404 POST_NOT_FOUND`: 提案が見つからない
- `404 USER_NOT_FOUND`: レビュー実施者が見つからない
- `409 SCORE_NOT_REACHED`: スコア50点未到達
- `500 INTERNAL_ERROR`: サーバーエラー

---

### 2. GET /api/posts/[postId]
**ファイル**: `src/pages/api/posts/[postId].ts`

**機能**: 提案詳細とレビュー情報の取得

**レスポンス**:
```json
{
  "success": true,
  "post": {
    "id": "post_abc123",
    "content": "夜勤明けの休憩時間を30分延長してほしい",
    "title": "夜勤明け休憩延長提案",
    "status": "published",
    "agendaScore": 65,
    "voteCount": {
      "approve": 15,
      "neutral": 3,
      "oppose": 2,
      "total": 20
    },
    "agendaStatus": "APPROVED_AS_DEPT_AGENDA",
    "author": {
      "id": "user_def456",
      "name": "佐藤花子",
      "department": "看護部-看護科",
      "permissionLevel": 3.0
    },
    "latestReview": {
      "id": "review_xyz789",
      "action": "approve_as_dept_agenda",
      "reason": "職員の声を反映した改善提案として評価できる",
      "comment": "次回部署ミーティングで議論します",
      "reviewedAt": "2025-10-21T10:30:00.000Z",
      "agendaScoreAtReview": 65,
      "voteCountAtReview": {
        "approve": 15,
        "neutral": 3,
        "oppose": 2
      },
      "reviewer": {
        "id": "user_abc123",
        "name": "山田太郎",
        "department": "看護部-看護科",
        "permissionLevel": 7.0
      }
    }
  }
}
```

---

### 3. GET /api/proposal-review/[postId]/history
**ファイル**: `src/pages/api/proposal-review/[postId]/history.ts`

**機能**: 提案のレビュー履歴を取得

**レスポンス**:
```json
{
  "success": true,
  "post": {
    "id": "post_abc123",
    "title": "夜勤明け休憩延長提案",
    "agendaScore": 65,
    "status": "published"
  },
  "reviews": [
    {
      "id": "review_xyz789",
      "action": "approve_as_dept_agenda",
      "reason": "職員の声を反映した改善提案として評価できる",
      "comment": "次回部署ミーティングで議論します",
      "reviewedAt": "2025-10-21T10:30:00.000Z",
      "agendaScoreAtReview": 65,
      "voteCountAtReview": {
        "approve": 15,
        "neutral": 3,
        "oppose": 2
      },
      "status": "active",
      "reviewer": {
        "id": "user_abc123",
        "name": "山田太郎",
        "department": "看護部-看護科",
        "permissionLevel": 7.0
      }
    }
  ],
  "summary": {
    "total": 1,
    "byAction": {
      "approve_as_dept_agenda": 1,
      "escalate_to_facility": 0,
      "reject": 0
    },
    "byStatus": {
      "active": 1,
      "superseded": 0
    }
  }
}
```

---

### 4. GET /api/proposal-review/pending
**ファイル**: `src/pages/api/proposal-review/pending.ts`

**機能**: レビュー待ち提案一覧の取得（50点以上で未判断）

**クエリパラメータ**:
- `department`: 部署フィルター（任意）
- `minScore`: 最小スコア（デフォルト: 50）
- `limit`: 取得件数（デフォルト: 50、最大: 100）
- `offset`: オフセット（デフォルト: 0）
- `sortBy`: ソート項目（agendaScore/createdAt/updatedAt）
- `sortOrder`: ソート順（asc/desc、デフォルト: desc）

**例**: `GET /api/proposal-review/pending?department=看護部-看護科&minScore=60&limit=20&sortBy=agendaScore&sortOrder=desc`

**レスポンス**:
```json
{
  "success": true,
  "proposals": [
    {
      "id": "post_abc123",
      "title": "夜勤明け休憩延長提案",
      "content": "夜勤明けの休憩時間を30分延長してほしい...",
      "category": "労働環境",
      "priority": "medium",
      "agendaScore": 65,
      "agendaStatus": "PENDING",
      "voteCount": {
        "approve": 15,
        "neutral": 3,
        "oppose": 2,
        "total": 20
      },
      "approvalRate": 75,
      "createdAt": "2025-10-15T09:00:00.000Z",
      "updatedAt": "2025-10-21T08:30:00.000Z",
      "author": {
        "id": "user_def456",
        "name": "佐藤花子",
        "department": "看護部-看護科",
        "permissionLevel": 3.0
      },
      "latestReview": null
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "filters": {
    "department": "看護部-看護科",
    "minScore": 60,
    "sortBy": "agendaScore",
    "sortOrder": "desc"
  },
  "statistics": {
    "totalPending": 8,
    "scoreDistribution": {
      "50-99": 6,
      "100-199": 2,
      "200-299": 0,
      "300+": 0
    }
  }
}
```

---

## 🎨 フロントエンド統合

### ProposalReviewPage.tsx 更新内容

**ファイル**: `src/pages/ProposalReviewPage.tsx`

**主な変更点**:

1. **API統合更新**
   - `/api/posts/[postId]` からの新しいレスポンス構造に対応
   - `{ success: true, post: {...} }` 形式をパース
   - エラーメッセージ表示改善

2. **データ表示修正**
   - `post.voteCount` 構造に対応（`approve`, `neutral`, `oppose`）
   - `post.author.department` から部署名を取得
   - 未使用の `Users` インポートを削除

3. **エラーハンドリング強化**
   - API エラーレスポンスの `message` フィールド優先表示
   - 詳細なバリデーションエラー表示

4. **既存機能維持**
   - 3つのアクション選択UI（承認/昇格/却下）
   - 理由入力（10-500文字、必須）
   - コメント入力（最大300文字、任意）
   - 権限チェック（Level 5以上）
   - スコア表示、投票状況表示

---

## 📊 実装ステータス

### ✅ 完了項目
- [x] ProposalReviewテーブル設計
- [x] schema.prisma更新（モデル・リレーション）
- [x] POST /api/proposal-review/[postId] 実装
- [x] GET /api/posts/[postId] 拡張実装
- [x] GET /api/proposal-review/[postId]/history 実装
- [x] GET /api/proposal-review/pending 実装
- [x] ProposalReviewPage.tsx フロントエンド統合

### ⏳ 未完了項目
- [ ] Prisma Client生成（`npx prisma generate`）
  - **理由**: Windows ファイルロック（開発サーバー起動中）
  - **対処**: 開発サーバー停止後に実行が必要

### 📝 後続作業推奨
- [ ] データベースマイグレーション実行（`npx prisma migrate dev`）
- [ ] API統合テスト実施
- [ ] エラーケースのテスト
- [ ] レビュー履歴表示UI追加（オプション）
- [ ] 未処理提案一覧ページ作成（オプション）

---

## 🎯 機能概要

### ユースケース
1. **主任・師長がレビュー画面を開く**
   - 50点到達提案の詳細を表示
   - 現在のスコア、投票状況を確認

2. **3つの判断から選択**
   - ✅ **部署議題として承認**: 部署ミーティングで議論
   - 🔼 **施設議題に昇格**: 施設全体で検討
   - ❌ **却下**: 提案を不採用

3. **判断理由を入力**
   - 必須：10-500文字の理由
   - 任意：最大300文字のコメント

4. **判断を記録**
   - ProposalReviewレコード作成
   - Post.agendaStatus更新
   - アクション別の後続処理実行

### データフロー
```
ユーザー（Level 5+）
    ↓
ProposalReviewPage.tsx
    ↓ GET /api/posts/[postId]
API（Post + 最新レビュー取得）
    ↓
画面表示（スコア、投票、判断選択）
    ↓ POST /api/proposal-review/[postId]
API（バリデーション → DB記録 → Post更新）
    ↓
完了画面 → /proposal-management へ遷移
```

---

## 🔒 セキュリティ・バリデーション

### 権限チェック
- **最小権限レベル**: 5.0（主任）
- **チェック箇所**:
  - フロントエンド: `useEffect` による画面アクセス制御
  - バックエンド: API内で `permissionLevel >= 5.0` を検証

### バリデーション
- **action**: 3つの有効値のみ許可
- **reason**: 10-500文字（トリム後）
- **comment**: 最大300文字
- **postId**: 存在確認、agendaScore >= 50
- **reviewerId**: 存在確認、権限確認

### データ整合性
- **Cascade削除**: Post削除時にProposalReviewも削除
- **インデックス**: 高速クエリのために6つのインデックス設定
- **status管理**: 'active' | 'superseded' でレビュー有効性を管理

---

## 📁 実装ファイル一覧

### スキーマ
- `prisma/schema.prisma` - ProposalReviewモデル追加

### API
- `src/pages/api/proposal-review/[postId].ts` - レビュー記録API
- `src/pages/api/posts/[postId].ts` - 提案詳細取得API
- `src/pages/api/proposal-review/[postId]/history.ts` - レビュー履歴API
- `src/pages/api/proposal-review/pending.ts` - 未処理提案一覧API

### フロントエンド
- `src/pages/ProposalReviewPage.tsx` - レビュー画面（更新）

### ドキュメント
- `mcp-shared/docs/ProposalReviewPage_DB要件分析_20251021.md`
- `mcp-shared/docs/ProposalReviewPage暫定マスターリスト_20251021.md`
- `mcp-shared/docs/ProposalReviewPage_実装完了報告_20251021.md` (本ファイル)

---

## 🚀 次回起動時の作業手順

### 1. Prisma Client生成
```bash
# 開発サーバーを停止後
npx prisma generate
```

### 2. マイグレーション実行
```bash
npx prisma migrate dev --name add_proposal_review_table
```

### 3. 開発サーバー再起動
```bash
npm run dev
```

### 4. 動作確認
1. 50点到達提案を用意
2. 主任・師長アカウントでログイン
3. ProposalReviewPageにアクセス
4. 判断を記録して動作確認

---

## 📞 連絡・確認事項

### データ管理責任
- ✅ VoiceDrive 100%管理
- ✅ 医療システムへの通知不要

### 医療システムチーム連携
- **不要** - User tableのキャッシュデータのみ使用

---

**実装完了日時**: 2025年10月21日
**実装者**: Claude Code
**レビュー待ち**: Prisma Client生成後に統合テスト実施可能
