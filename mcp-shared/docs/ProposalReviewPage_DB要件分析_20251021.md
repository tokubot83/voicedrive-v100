# 提案レビューページ DB要件分析

**文書番号**: DB-REQ-2025-1021-006
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**分析対象**: 提案レビューページ（ProposalReviewPage.tsx）
**分析者**: VoiceDriveチーム

---

## 📋 エグゼクティブサマリー

### 分析対象ページ

- **URL**: `https://voicedrive-v100.vercel.app/proposal-review/:postId`
- **ファイル**: [src/pages/ProposalReviewPage.tsx](src/pages/ProposalReviewPage.tsx:1-351) (351行)
- **機能**: 部署議題モードで50点到達時の承認/却下判断画面（主任・師長用）

### ページ概要

提案レビューページは、**部署議題が50点に到達した時**に、主任（LEVEL 5-6）または師長以上（LEVEL 7+）が以下の判断を行う画面です：

1. **部署議題として承認**: 部署の正式議題として承認し、部署ミーティングで議論
2. **施設議題に昇格**: 施設全体で検討すべき重要な提案として昇格
3. **却下**: 提案を採用しない

### 総合結論

| 項目 | 状態 | 詳細 |
|------|------|------|
| **DB実装** | 🟡 **部分的に不足** | Postテーブルにフィールドはあるが、レビュー判断記録テーブルが不足 |
| **データ管理責任** | 🟢 **VoiceDrive** | 100% VoiceDrive管轄（医療システム関与なし） |
| **API必要性** | 🔴 **要実装** | 4本のAPI実装が必要 |
| **schema.prisma更新** | 🔴 **必要** | ProposalReviewテーブル追加が必要 |

---

## 1. ページ機能詳細分析

### 1.1 主要機能

#### 機能1: 提案詳細表示

**コード参照**: [ProposalReviewPage.tsx:40-60](src/pages/ProposalReviewPage.tsx:40-60)

```typescript
const fetchPostDetails = async () => {
  const response = await fetch(`/api/posts/${postId}`);
  const data = await response.json();
  setPost(data);
};
```

**表示データ**:
- 提案内容（content）
- 投稿者情報（author.name, department）
- 現在スコア（agendaScore）
- 投票状況（pollResult: 賛成/中立/反対の票数）

**データソース**: `Post`テーブル（既存）

---

#### 機能2: 権限チェック

**コード参照**: [ProposalReviewPage.tsx:63-70](src/pages/ProposalReviewPage.tsx:63-70)

**権限要件**:
- **最小権限**: permissionLevel >= 5.0
- **対象ユーザー**: 主任（LEVEL 5-6）、師長（LEVEL 7-8）、部長以上（LEVEL 9+）

**データソース**: `User.permissionLevel`（既存）

---

#### 機能3: 判断選択

**コード参照**: [ProposalReviewPage.tsx:213-283](src/pages/ProposalReviewPage.tsx:213-283)

3つの判断オプション:

| アクション | actionコード | 説明 |
|-----------|-------------|------|
| 部署議題として承認 | `approve_as_dept_agenda` | 部署の正式議題として承認 |
| 施設議題に昇格 | `escalate_to_facility` | 施設全体で検討すべき提案として昇格 |
| 却下 | `reject` | 提案を採用しない |

**入力データ**:
- `selectedAction`: 判断結果
- `reason`: 判断理由（必須、10文字以上、500文字以内）
- `comment`: 承認コメント（任意、300文字以内）※承認時のみ

---

#### 機能4: 判断送信

**コード参照**: [ProposalReviewPage.tsx:72-113](src/pages/ProposalReviewPage.tsx:72-113)

**送信データ**:
- `action`: 判断結果
- `reason`: 判断理由
- `comment`: 承認コメント（任意）
- `reviewerId`: レビュー実施者ID

**期待される処理**:
1. 判断記録をDBに保存
2. Postのステータスを更新
3. 承認/昇格/却下に応じた後続処理

---

## 2. データソース特定

### 2.1 必要なデータと取得元

| データ項目 | 取得元 | テーブル/フィールド | 管理責任 | 実装状況 |
|-----------|-------|-------------------|---------|---------|
| **提案情報** |  |  |  |  |
| 提案ID | URL | postId | VoiceDrive | ✅ 実装済み |
| 提案内容 | API | Post.content | VoiceDrive | ✅ 実装済み |
| 投稿者ID | API | Post.authorId | VoiceDrive | ✅ 実装済み |
| 投稿者名 | API | User.name | 医療システム（キャッシュ） | ✅ 実装済み |
| 部署名 | API | Post経由User.department | 医療システム（キャッシュ） | ✅ 実装済み |
| 現在スコア | API | Post.agendaScore | VoiceDrive | ✅ 実装済み |
| **投票情報** |  |  |  |  |
| 投票結果 | API | Post.pollResult | VoiceDrive | ✅ 実装済み |
| 賛成票数 | 計算 | pollResult経由 | VoiceDrive | ✅ 実装済み |
| 中立票数 | 計算 | pollResult経由 | VoiceDrive | ✅ 実装済み |
| 反対票数 | 計算 | pollResult経由 | VoiceDrive | ✅ 実装済み |
| **レビュー実施者情報** |  |  |  |  |
| レビュー実施者ID | 認証 | user.id | VoiceDrive | ✅ 実装済み |
| 実施者権限レベル | 認証 | user.permissionLevel | 医療システム（キャッシュ） | ✅ 実装済み |
| **判断記録（🔴 不足）** |  |  |  |  |
| 判断ID | ❌ | ProposalReview.id | VoiceDrive | 🔴 **未実装** |
| 判断アクション | ❌ | ProposalReview.action | VoiceDrive | 🔴 **未実装** |
| 判断理由 | ❌ | ProposalReview.reason | VoiceDrive | 🔴 **未実装** |
| 承認コメント | ❌ | ProposalReview.comment | VoiceDrive | 🔴 **未実装** |
| 判断日時 | ❌ | ProposalReview.reviewedAt | VoiceDrive | 🔴 **未実装** |

---

## 3. データ管理責任分界点

### 3.1 VoiceDrive管轄（100%）

このページで使用するデータは**すべてVoiceDrive管轄**であり、医療システムとのAPI連携は不要です。

| データ項目 | 理由 |
|-----------|------|
| 提案情報（Post） | VoiceDrive活動データ |
| 投票情報（Vote, Poll） | VoiceDrive活動データ |
| 判断記録（ProposalReview） | VoiceDrive業務フロー |
| スコア計算（agendaScore） | VoiceDrive独自ロジック |

### 3.2 医療システムからのキャッシュデータ

| データ項目 | 真実の情報源 | VoiceDriveでの扱い |
|-----------|------------|------------------|
| User.name | 医療システム Employee.name | キャッシュ（表示用） |
| User.department | 医療システム Employee.department | キャッシュ（表示用） |
| User.permissionLevel | 医療システム Employee.permissionLevel | キャッシュ（権限判定用） |

---

## 4. 既存テーブル分析

### 4.1 Post テーブル

**コード参照**: [schema.prisma:568-678](prisma/schema.prisma:568-678)

**既存の判断関連フィールド**:

| フィールド | 型 | 用途 | レビュー機能で使用 |
|-----------|----|----|-----------------|
| `agendaStatus` | PostStatus | 議題ステータス | ⚠️ 更新必要 |
| `agendaDecisionBy` | String | 判断実施者ID | ⚠️ 更新必要 |
| `agendaDecisionAt` | DateTime | 判断日時 | ⚠️ 更新必要 |
| `agendaDecisionReason` | String | 判断理由 | ⚠️ 更新必要 |
| `approvalStatus` | String | 承認ステータス | ⚠️ 更新必要 |
| `approvedAt` | DateTime | 承認日時 | ⚠️ 更新必要 |
| `approvedBy` | String | 承認者ID | ⚠️ 更新必要 |
| `rejectedAt` | DateTime | 却下日時 | ⚠️ 更新必要 |
| `rejectedBy` | String | 却下者ID | ⚠️ 更新必要 |
| `rejectionReason` | String | 却下理由 | ⚠️ 更新必要 |

**分析**:
- ✅ **基本情報は実装済み**: 提案内容、投稿者、スコア等
- ⚠️ **判断記録フィールドは存在**: `agendaDecisionBy`, `agendaDecisionAt`, `agendaDecisionReason`等
- 🤔 **課題**: これらのフィールドは**直接Postテーブルに保存**されており、履歴管理ができない

**問題点**:
1. **履歴が残らない**: 1つの提案に対して1回の判断しか記録できない
2. **複数レビューの記録不可**: 再レビューや変更履歴が記録できない
3. **監査証跡不足**: 誰がいつどのような判断をしたかの完全な履歴がない

---

## 5. 不足項目の洗い出し

### 5.1 不足テーブル

#### 🔴 ProposalReviewテーブル（新規作成必要）

**目的**: 提案レビューの判断記録を履歴として保存

**必要なフィールド**:

| フィールド | 型 | 説明 | 必須 |
|-----------|----|----|------|
| `id` | String (cuid) | レビューID | ✅ |
| `postId` | String | 対象提案ID | ✅ |
| `reviewerId` | String | レビュー実施者ID | ✅ |
| `action` | String | 判断結果 | ✅ |
| `reason` | String | 判断理由 | ✅ |
| `comment` | String? | 承認コメント（任意） | ❌ |
| `reviewedAt` | DateTime | 判断日時 | ✅ |
| `agendaScoreAtReview` | Int | レビュー時のスコア | ✅ |
| `voteCountAtReview` | JSON | レビュー時の投票状況 | ✅ |
| `reviewerPermissionLevel` | Decimal | レビュー実施者の権限レベル | ✅ |
| `reviewerDepartment` | String | レビュー実施者の部署 | ✅ |
| `status` | String | ステータス | ✅ |
| `createdAt` | DateTime | 作成日時 | ✅ |
| `updatedAt` | DateTime | 更新日時 | ✅ |

---

### 5.2 不足API

#### API 1: 提案レビュー送信（🔴 新規作成必要）

**エンドポイント**: `POST /api/proposal-review/:postId`

**リクエスト**:
```json
{
  "action": "approve_as_dept_agenda",
  "reason": "職員の意見が多数賛成であり、部署で議論する価値がある",
  "comment": "前向きに検討しましょう",
  "reviewerId": "user123"
}
```

**実装状況**: 🔴 **未実装**

---

#### API 2: レビュー履歴取得（🔴 新規作成必要）

**エンドポイント**: `GET /api/proposal-review/:postId/history`

**実装状況**: 🔴 **未実装**

---

#### API 3: レビュー可能な提案一覧取得（🔴 新規作成必要）

**エンドポイント**: `GET /api/proposal-review/pending`

**実装状況**: 🔴 **未実装**

---

#### API 4: 提案詳細取得（⚠️ 既存APIの拡張）

**エンドポイント**: `GET /api/posts/:postId`

**実装状況**: ⚠️ 既存APIあり、`latestReview`の追加が必要

---

## 6. schema.prisma更新提案

### 6.1 新規テーブル: ProposalReview

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
  createdAt                DateTime @default(now()) @map("created_at")
  updatedAt                DateTime @updatedAt @map("updated_at")

  post                     Post     @relation("PostProposalReviews", fields: [postId], references: [id], onDelete: Cascade)
  reviewer                 User     @relation("UserProposalReviews", fields: [reviewerId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([reviewerId])
  @@index([reviewedAt])
  @@index([action])
  @@index([status])
  @@map("proposal_reviews")
}
```

### 6.2 Postテーブルにリレーション追加

```prisma
model Post {
  // ... 既存フィールド

  proposalReviews          ProposalReview[]    @relation("PostProposalReviews")

  // ... 既存リレーション
}
```

### 6.3 Userテーブルにリレーション追加

```prisma
model User {
  // ... 既存フィールド

  proposalReviews          ProposalReview[]    @relation("UserProposalReviews")

  // ... 既存リレーション
}
```

---

## 7. 実装優先度

### 🔴 優先度：高（即時実装必要）

1. **ProposalReviewテーブル作成** - 作業量: 0.5日
2. **POST /api/proposal-review/:postId 実装** - 作業量: 1日
3. **GET /api/posts/:postId 拡張** - 作業量: 0.5日

### 🟡 優先度：中（1週間以内）

4. **GET /api/proposal-review/:postId/history 実装** - 作業量: 0.5日
5. **GET /api/proposal-review/pending 実装** - 作業量: 1日

**総作業量**: 3.5日

---

## 8. まとめ

### 実装必要項目

| 項目 | 種類 | 優先度 | 作業量 | 状態 |
|------|------|--------|--------|------|
| ProposalReviewテーブル | DB | 🔴 高 | 0.5日 | ⏳ 未実装 |
| POST /api/proposal-review/:postId | API | 🔴 高 | 1日 | ⏳ 未実装 |
| GET /api/posts/:postId 拡張 | API | 🔴 高 | 0.5日 | ⚠️ 拡張必要 |
| GET /api/proposal-review/:postId/history | API | 🟡 中 | 0.5日 | ⏳ 未実装 |
| GET /api/proposal-review/pending | API | 🟡 中 | 1日 | ⏳ 未実装 |

---

**文書終了**

最終更新: 2025年10月21日
