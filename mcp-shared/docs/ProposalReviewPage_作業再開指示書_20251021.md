# ProposalReviewPage 作業再開指示書

**作成日**: 2025年10月21日
**対象**: VoiceDrive開発チーム
**目的**: ProposalReviewPage実装作業の中断後、再開するための詳細手順

---

## 📋 実装完了サマリー

### ✅ 完了済み項目

#### 1. **ドキュメント作成（3件）**
- ✅ `ProposalReviewPage_DB要件分析_20251021.md` - 詳細分析レポート
- ✅ `ProposalReviewPage暫定マスターリスト_20251021.md` - API仕様書
- ✅ `ProposalReviewPage_実装完了報告_20251021.md` - 実装完了報告書
- ✅ `ProposalReviewPage_作業再開指示書_20251021.md` - 本ファイル

#### 2. **データベース設計・実装**
- ✅ ProposalReviewモデル作成（`prisma/schema.prisma:618-647`）
- ✅ Postモデルにリレーション追加（`proposalReviews`）
- ✅ Userモデルにリレーション追加（`proposalReviews`）
- ✅ データベース同期完了（`prisma db push`）
- ✅ proposal_reviewsテーブル作成確認済み

#### 3. **API実装（4エンドポイント）**

| API | ファイル | 行数 | 機能 |
|-----|---------|------|------|
| POST /api/proposal-review/[postId] | `src/pages/api/proposal-review/[postId].ts` | 305行 | レビュー判断記録 |
| GET /api/posts/[postId] | `src/pages/api/posts/[postId].ts` | 180行 | 提案詳細+最新レビュー |
| GET /api/proposal-review/[postId]/history | `src/pages/api/proposal-review/[postId]/history.ts` | 133行 | レビュー履歴取得 |
| GET /api/proposal-review/pending | `src/pages/api/proposal-review/pending.ts` | 193行 | 未処理提案一覧 |

**合計**: 811行の実装コード

#### 4. **フロントエンド統合**
- ✅ ProposalReviewPage.tsx 更新（`src/pages/ProposalReviewPage.tsx`）
  - API レスポンス構造対応（`{ success: true, post: {...} }`）
  - 投票データ構造修正（`voteCount.approve/neutral/oppose`）
  - エラーハンドリング強化
  - 部署名表示修正（`post.author.department`）

#### 5. **AI_SUMMARY.md 更新**
- ✅ 最新の実装完了情報を追加

---

## ⏳ 未完了項目（作業再開時に実施）

### 1. **Prisma Client生成**

**現状**: Windowsファイルロック（EPERM）のため保留中

**原因**: 複数のNode.jsプロセスが`.prisma/client`ディレクトリを使用中

**作業再開手順**:

#### **方法A: PC再起動後に実行（推奨）**
```bash
# PC再起動後
cd c:\projects\voicedrive-v100
npx prisma generate
```

#### **方法B: 全Node.jsプロセス終了後に実行**
```bash
# タスクマネージャーでnode.exeプロセスを全て終了
# または
taskkill /F /IM node.exe

# Prisma Client生成
npx prisma generate
```

#### **方法C: 正式なマイグレーション実行（推奨・本番環境向け）**
```bash
# マイグレーションファイル作成 + Prisma Client生成
npx prisma migrate dev --name add_proposal_review_table

# 成果物: prisma/migrations/20251021_add_proposal_review_table/migration.sql
```

---

### 2. **API統合テスト**

#### **テスト環境準備**
```bash
# 開発サーバー起動
npm run dev

# ブラウザで確認
# http://localhost:3001
```

#### **テストケース1: POST レビュー記録**

**エンドポイント**: `POST /api/proposal-review/[postId]`

**テストデータ**:
```bash
curl -X POST http://localhost:3001/api/proposal-review/post_abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "approve_as_dept_agenda",
    "reason": "職員の声を反映した改善提案として評価できる",
    "comment": "次回部署ミーティングで議論します",
    "reviewerId": "user_abc123"
  }'
```

**期待結果**:
```json
{
  "success": true,
  "review": {
    "id": "review_xyz789",
    "action": "approve_as_dept_agenda",
    "reason": "職員の声を反映した改善提案として評価できる"
  },
  "post": {
    "agendaStatus": "APPROVED_AS_DEPT_AGENDA"
  },
  "message": "判断を記録しました"
}
```

**検証項目**:
- [ ] ProposalReviewレコードが作成される
- [ ] Post.agendaStatusが更新される
- [ ] Post.agendaDecisionByが設定される
- [ ] Post.agendaDecisionAtが設定される

---

#### **テストケース2: GET 提案詳細**

**エンドポイント**: `GET /api/posts/[postId]`

**テストデータ**:
```bash
curl http://localhost:3001/api/posts/post_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**期待結果**:
```json
{
  "success": true,
  "post": {
    "id": "post_abc123",
    "content": "夜勤明けの休憩時間を30分延長してほしい",
    "agendaScore": 65,
    "voteCount": {
      "approve": 15,
      "neutral": 3,
      "oppose": 2,
      "total": 20
    },
    "latestReview": {
      "id": "review_xyz789",
      "action": "approve_as_dept_agenda",
      "reviewer": {
        "name": "山田太郎",
        "department": "看護部-看護科"
      }
    }
  }
}
```

**検証項目**:
- [ ] 提案詳細が取得できる
- [ ] voteCountが正しく集計される
- [ ] latestReviewが含まれる（レビュー済みの場合）
- [ ] author情報が含まれる

---

#### **テストケース3: GET レビュー履歴**

**エンドポイント**: `GET /api/proposal-review/[postId]/history`

**テストデータ**:
```bash
curl http://localhost:3001/api/proposal-review/post_abc123/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**期待結果**:
```json
{
  "success": true,
  "post": {
    "id": "post_abc123",
    "title": "夜勤明け休憩延長提案",
    "agendaScore": 65
  },
  "reviews": [
    {
      "id": "review_xyz789",
      "action": "approve_as_dept_agenda",
      "reviewedAt": "2025-10-21T10:30:00.000Z",
      "reviewer": {
        "name": "山田太郎"
      }
    }
  ],
  "summary": {
    "total": 1,
    "byAction": {
      "approve_as_dept_agenda": 1,
      "escalate_to_facility": 0,
      "reject": 0
    }
  }
}
```

**検証項目**:
- [ ] 全てのレビュー履歴が取得できる
- [ ] 新しい順にソートされる
- [ ] summaryが正しく集計される

---

#### **テストケース4: GET 未処理提案一覧**

**エンドポイント**: `GET /api/proposal-review/pending`

**テストデータ**:
```bash
# 基本的な取得
curl "http://localhost:3001/api/proposal-review/pending?minScore=50&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 部署フィルター付き
curl "http://localhost:3001/api/proposal-review/pending?department=看護部-看護科&sortBy=agendaScore&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**期待結果**:
```json
{
  "success": true,
  "proposals": [
    {
      "id": "post_abc123",
      "title": "夜勤明け休憩延長提案",
      "agendaScore": 65,
      "agendaStatus": "PENDING",
      "voteCount": {
        "approve": 15,
        "neutral": 3,
        "oppose": 2,
        "total": 20
      },
      "approvalRate": 75
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 20,
    "offset": 0,
    "hasMore": false
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

**検証項目**:
- [ ] 50点以上の提案のみ取得される
- [ ] 未判断の提案のみ取得される
- [ ] ページネーションが機能する
- [ ] 部署フィルターが機能する
- [ ] スコア分布が正しく集計される

---

### 3. **エラーケーステスト**

#### **バリデーションエラー**

**テストケース**: 理由が短すぎる
```bash
curl -X POST http://localhost:3001/api/proposal-review/post_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_as_dept_agenda",
    "reason": "短い",
    "reviewerId": "user_abc123"
  }'
```

**期待結果**:
```json
{
  "success": false,
  "error": "REASON_TOO_SHORT",
  "message": "判断理由は10文字以上で入力してください"
}
```

---

#### **権限エラー**

**テストケース**: Level 5未満のユーザー
```bash
curl -X POST http://localhost:3001/api/proposal-review/post_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_as_dept_agenda",
    "reason": "この提案は有益だと思います",
    "reviewerId": "user_level3"
  }'
```

**期待結果**:
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSION",
  "message": "権限が不足しています（Level 5以上が必要）"
}
```

---

#### **スコア不足エラー**

**テストケース**: 50点未到達の提案
```bash
curl -X POST http://localhost:3001/api/proposal-review/post_lowscore \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_as_dept_agenda",
    "reason": "この提案は有益だと思います",
    "reviewerId": "user_abc123"
  }'
```

**期待結果**:
```json
{
  "success": false,
  "error": "SCORE_NOT_REACHED",
  "message": "この提案はまだ50点に到達していません"
}
```

---

### 4. **フロントエンド動作確認**

#### **ProposalReviewPageアクセス**
```
http://localhost:3001/proposal-review/post_abc123
```

**確認項目**:
- [ ] 提案詳細が表示される
- [ ] 現在スコアが表示される
- [ ] 投票状況（賛成・中立・反対）が表示される
- [ ] 3つのアクション選択ボタンが表示される
- [ ] 理由入力欄が表示される（10-500文字）
- [ ] コメント入力欄が表示される（最大300文字）
- [ ] 送信ボタンが適切に有効/無効化される

**操作テスト**:
1. [ ] アクションを選択
2. [ ] 理由を入力（10文字未満でエラー表示確認）
3. [ ] コメントを入力（任意）
4. [ ] 送信ボタンをクリック
5. [ ] 成功メッセージ表示確認
6. [ ] `/proposal-management`へ遷移確認

---

## 🔧 トラブルシューティング

### **問題1: Prisma Clientが古い型定義を使用している**

**症状**:
```typescript
// TypeScriptエラー
Property 'proposalReviews' does not exist on type 'Post'
```

**解決方法**:
```bash
# Prisma Client再生成
npx prisma generate

# それでも解決しない場合
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

---

### **問題2: データベーステーブルが見つからない**

**症状**:
```
Error: Table 'proposal_reviews' does not exist
```

**解決方法**:
```bash
# スキーマをデータベースに同期
npx prisma db push

# または正式なマイグレーション
npx prisma migrate dev --name add_proposal_review_table
```

---

### **問題3: APIエンドポイントが404を返す**

**症状**:
```
GET /api/posts/post_abc123 → 404 Not Found
```

**確認事項**:
1. ファイルパスが正しいか確認
   - ✅ `src/pages/api/posts/[postId].ts`（正）
   - ❌ `src/pages/api/posts/postId.ts`（誤）
2. 開発サーバーが起動しているか確認
3. Next.jsのファイルシステムルーティングが機能しているか確認

**解決方法**:
```bash
# 開発サーバー再起動
npm run dev
```

---

### **問題4: CORS エラー**

**症状**:
```
Access to fetch at 'http://localhost:3001/api/...' from origin '...' has been blocked by CORS policy
```

**解決方法**:
`next.config.js`にCORS設定を追加（必要に応じて）

---

## 📊 データベーススキーマ概要

### **ProposalReviewテーブル**

```sql
CREATE TABLE "proposal_reviews" (
    "id" TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,  -- 'approve_as_dept_agenda' | 'escalate_to_facility' | 'reject'
    "reason" TEXT NOT NULL,
    "comment" TEXT,
    "reviewedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "agendaScoreAtReview" INTEGER NOT NULL,
    "voteCountAtReview" TEXT NOT NULL,  -- JSON
    "reviewerPermissionLevel" REAL NOT NULL,
    "reviewerDepartment" TEXT NOT NULL,
    "status" TEXT DEFAULT 'active',  -- 'active' | 'superseded'
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE,
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "proposal_reviews_postId_idx" ON "proposal_reviews"("postId");
CREATE INDEX "proposal_reviews_reviewerId_idx" ON "proposal_reviews"("reviewerId");
CREATE INDEX "proposal_reviews_reviewedAt_idx" ON "proposal_reviews"("reviewedAt");
CREATE INDEX "proposal_reviews_action_idx" ON "proposal_reviews"("action");
CREATE INDEX "proposal_reviews_status_idx" ON "proposal_reviews"("status");
CREATE INDEX "proposal_reviews_postId_status_idx" ON "proposal_reviews"("postId", "status");
```

---

## 📁 関連ファイル一覧

### **スキーマ**
- `prisma/schema.prisma` - ProposalReviewモデル（618-647行）

### **API実装**
- `src/pages/api/proposal-review/[postId].ts` - レビュー記録API（305行）
- `src/pages/api/posts/[postId].ts` - 提案詳細API（180行）
- `src/pages/api/proposal-review/[postId]/history.ts` - レビュー履歴API（133行）
- `src/pages/api/proposal-review/pending.ts` - 未処理提案一覧API（193行）

### **フロントエンド**
- `src/pages/ProposalReviewPage.tsx` - レビュー画面（351行）

### **ドキュメント**
- `mcp-shared/docs/ProposalReviewPage_DB要件分析_20251021.md`
- `mcp-shared/docs/ProposalReviewPage暫定マスターリスト_20251021.md`
- `mcp-shared/docs/ProposalReviewPage_実装完了報告_20251021.md`
- `mcp-shared/docs/ProposalReviewPage_作業再開指示書_20251021.md`（本ファイル）
- `mcp-shared/docs/AI_SUMMARY.md`（更新済み）

---

## 🚀 作業再開クイックスタート

### **1分で再開する方法**

```bash
# 1. プロジェクトディレクトリに移動
cd c:\projects\voicedrive-v100

# 2. Prisma Client生成（ファイルロック解消後）
npx prisma generate

# 3. 開発サーバー起動
npm run dev

# 4. ブラウザで確認
# http://localhost:3001/proposal-review/post_abc123
```

### **正式なDB構築を行う場合**

```bash
# 1. プロジェクトディレクトリに移動
cd c:\projects\voicedrive-v100

# 2. マイグレーション実行
npx prisma migrate dev --name add_proposal_review_table

# 3. マイグレーションファイルをGitにコミット
git add prisma/migrations
git commit -m "feat: ProposalReviewテーブル追加"

# 4. 開発サーバー起動
npm run dev
```

---

## 📞 サポート・連絡先

- **技術的な質問**: プロジェクトリード
- **設計変更の相談**: アーキテクトチーム
- **バグ報告**: Slack `#voicedrive-dev`

---

## 📝 チェックリスト（作業再開時）

### **必須タスク**
- [ ] Prisma Client生成（`npx prisma generate`）
- [ ] 開発サーバー起動（`npm run dev`）
- [ ] ProposalReviewPageにアクセス可能か確認

### **推奨タスク**
- [ ] POST APIテスト実施
- [ ] GET APIテスト実施
- [ ] エラーケーステスト実施
- [ ] フロントエンド操作確認

### **オプションタスク**
- [ ] 正式なマイグレーション実行（`prisma migrate dev`）
- [ ] レビュー履歴表示UI追加
- [ ] 未処理提案一覧ページ作成
- [ ] 統合テスト自動化

---

**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**実装者**: Claude Code
**ステータス**: ✅ 実装完了（テスト待ち）

---

**END OF DOCUMENT**
