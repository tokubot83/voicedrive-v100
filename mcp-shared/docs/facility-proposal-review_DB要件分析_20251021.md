# 施設改善提案レビューページ DB要件分析

**文書番号**: DB-REQ-2025-1021-001
**作成日**: 2025年10月21日
**対象ページ**: https://voicedrive-v100.vercel.app/facility-proposal-review/:postId
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
施設改善提案レビューページ（FacilityProposalReviewPage）は**VoiceDrive独自管理のページ**であり、医療システムとの直接的な連携は**最小限**です。

### ✅ 現状評価
- **データベース構造**: ✅ **完全対応済み** - 必要なフィールドは全て存在
- **API実装**: ✅ **完全実装済み** - `/api/facility-proposal-review/:postId` 動作中
- **権限チェック**: ✅ **実装済み** - Level 8+（副看護部長・看護部長）
- **通知機能**: ✅ **実装済み** - 投稿者と施設全職員への通知

### 🟢 不足項目: **なし**

このページは**現在のスキーマとAPIで完全に動作可能**です。

---

## 🔍 詳細分析

### 1. ページ概要

**目的**:
- 100点到達した施設議題を副看護部長/看護部長が最終判断
- 委員会提出を承認するか、却下するかを決定

**アクセス権限**:
- **必須レベル**: permissionLevel ≥ 8（副看護部長・看護部長）
- 該当コード: `FacilityProposalReviewPage.tsx` 62行目

**主要機能**:
1. 投稿詳細表示（内容、著者、現在スコア）
2. 施設内投票状況表示（賛成・中立・反対）
3. 議題昇格履歴表示
4. 判断選択（委員会提出承認/却下）
5. 判断理由入力（10文字以上必須）

---

### 2. データソース分析

#### 2.1 投稿基本情報（159-174行目）

**表示内容**:
```typescript
post.content           // 投稿内容
post.author?.name      // 投稿者名
post.department        // 部署
post.agendaScore       // 現在スコア
```

**必要なデータソース**:

| 表示項目 | VoiceDrive Post | VoiceDrive User | 医療システム | データ管理責任 | 状態 |
|---------|----------------|----------------|-------------|--------------|------|
| `content` | ✅ マスタ | - | - | VoiceDrive | ✅ OK |
| `author.name` | - | ✅ キャッシュ | ✅ マスタ | 医療システム | ✅ OK |
| `department` | ✅ マスタ | ✅ キャッシュ | ✅ マスタ | 医療システム | ✅ OK |
| `agendaScore` | ✅ マスタ | - | - | VoiceDrive | ✅ OK |

**評価**: ✅ **完全対応済み**

- `Post.content`, `Post.agendaScore`はVoiceDriveが管理
- `User.name`, `User.department`は医療システムから同期済み（キャッシュ）
- 追加実装不要

---

#### 2.2 投票状況（176-199行目）

**表示内容**:
```typescript
approveVotes  // 賛成票数
neutralVotes  // 中立票数
opposeVotes   // 反対票数
```

**必要なデータソース**:

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| 投票結果 | ✅ マスタ | - | VoiceDrive | `Post.pollResult` (JSON) | ✅ OK |
| 投票オプション | ✅ マスタ | - | VoiceDrive | `Poll.options` | ✅ OK |

**実装コード**（130-133行目）:
```typescript
const voteData = post.pollResult || {};
const approveVotes = voteData.results?.find((r: any) => r.option.text === '賛成')?.votes || 0;
const neutralVotes = voteData.results?.find((r: any) => r.option.text === '中立')?.votes || 0;
const opposeVotes = voteData.results?.find((r: any) => r.option.text === '反対')?.votes || 0;
```

**評価**: ✅ **完全対応済み**

- `Post`テーブルに`pollResult`フィールドが存在（JSON型）
- `Poll`テーブルで投票集計済み
- 追加実装不要

---

#### 2.3 議題昇格履歴（202-212行目）

**表示内容**:
```typescript
post.agendaDecisionReason  // 施設議題昇格理由
post.agendaDecisionBy      // 昇格者ID
post.decider?.name         // 昇格者名
post.agendaDecisionAt      // 昇格日時
```

**必要なデータソース**:

| 表示項目 | VoiceDrive Post | データ管理責任 | 状態 |
|---------|----------------|--------------|------|
| `agendaDecisionReason` | ✅ マスタ | VoiceDrive | ✅ OK |
| `agendaDecisionBy` | ✅ マスタ | VoiceDrive | ✅ OK |
| `agendaDecisionAt` | ✅ マスタ | VoiceDrive | ✅ OK |
| `decider.name` | ✅ リレーション | VoiceDrive | ✅ OK |

**スキーマ確認**（schema.prisma 599-601行目）:
```prisma
agendaDecisionBy     String?   @map("agenda_decision_by")
agendaDecisionAt     DateTime? @map("agenda_decision_at")
agendaDecisionReason String?   @map("agenda_decision_reason")
```

**評価**: ✅ **完全対応済み**

---

#### 2.4 判断処理（69-109行目）

**必要な処理**:
1. 権限チェック（permissionLevel ≥ 8）
2. 投稿ステータス更新
3. 通知送信

**実装状況**:

| 処理 | ルート | 実装状態 | 備考 |
|-----|-------|---------|------|
| 権限チェック | `facilityProposalReviewRoutes.ts` 78-84行目 | ✅ 完了 | Level 8+チェック |
| 委員会提出承認 | `handleApproveForCommittee()` 144-232行目 | ✅ 完了 | ステータス: `APPROVED_FOR_COMMITTEE` |
| 却下 | `handleReject()` 237-275行目 | ✅ 完了 | ステータス: `REJECTED_BY_DEPUTY_DIRECTOR` |
| 通知送信 | 各ハンドラー内 | ✅ 完了 | 投稿者+施設全職員 |

**評価**: ✅ **完全実装済み**

---

### 3. API分析

#### 3.1 既存API

**エンドポイント**:
```
POST /api/facility-proposal-review/:postId
```

**リクエスト**:
```json
{
  "action": "approve_for_committee" | "reject",
  "reason": "判断理由（10文字以上）"
}
```

**レスポンス**（成功時）:
```json
{
  "success": true,
  "data": {
    "message": "委員会提出を承認しました",
    "notificationsSent": 150
  }
}
```

**実装状況**: ✅ **完全実装済み**

- バリデーション: ✅ 実装済み
- 権限チェック: ✅ 実装済み（Level 8+）
- DB更新: ✅ 実装済み
- 通知送信: ✅ 実装済み
- エラーハンドリング: ✅ 実装済み

---

#### 3.2 投稿取得API

**エンドポイント**:
```
GET /api/posts/:postId
```

**実装状況**: ✅ **既存API利用中**

該当コード（`FacilityProposalReviewPage.tsx` 37-57行目）:
```typescript
const response = await fetch(`/api/posts/${postId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

**評価**: ✅ **追加実装不要**

---

### 4. データ管理責任分界点分析

#### 4.1 VoiceDrive管轄（100%）

| データ項目 | 理由 | 状態 |
|-----------|------|------|
| 投稿内容（Post） | VoiceDrive独自の提案管理 | ✅ OK |
| 投票結果（Poll, PollVote） | VoiceDrive独自の投票機能 | ✅ OK |
| 議題ステータス（agendaStatus） | VoiceDrive独自のワークフロー | ✅ OK |
| 承認履歴（agendaDecision*） | VoiceDrive独自の承認管理 | ✅ OK |
| 提案書（ProposalDocument） | VoiceDrive独自のドキュメント管理 | ✅ OK |
| 通知（Notification） | VoiceDrive独自の通知機能 | ✅ OK |

---

#### 4.2 医療システム管轄（キャッシュ利用のみ）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 状態 |
|-----------|-----------|-------------|---------|------|
| 職員名（User.name） | キャッシュ | ✅ マスタ | API/Webhook | ✅ OK |
| 部署（User.department） | キャッシュ | ✅ マスタ | API/Webhook | ✅ OK |
| 権限レベル（User.permissionLevel） | キャッシュ | ✅ マスタ | API/Webhook | ✅ OK |
| 施設ID（User.facilityId） | キャッシュ | ✅ マスタ | API/Webhook | ✅ OK |

**評価**: ✅ **既存の同期機構で対応済み**

- 医療システムから職員情報をWebhook/APIで取得済み
- VoiceDrive Userテーブルにキャッシュ済み
- 追加API不要

---

## 📊 必要なテーブル・フィールド一覧

### ✅ 既存テーブル（完全対応済み）

#### 1. Post（投稿）

**使用フィールド**:
```prisma
model Post {
  id                   String    @id @default(cuid())
  content              String    // 投稿内容
  authorId             String    // 投稿者ID
  agendaScore          Int?      @default(0) // 現在スコア
  agendaStatus         PostStatus? @default(ACTIVE) // 議題ステータス
  agendaDecisionBy     String?   // 判断者ID
  agendaDecisionAt     DateTime? // 判断日時
  agendaDecisionReason String?   // 判断理由

  author User @relation("PostAuthor", fields: [authorId], references: [id])
  poll   Poll?
}
```

**状態**: ✅ **完全対応済み**

---

#### 2. User（職員）

**使用フィールド**:
```prisma
model User {
  id              String  @id @default(cuid())
  name            String  // 職員名
  department      String? // 部署
  facilityId      String? // 施設ID
  permissionLevel Decimal // 権限レベル

  posts Post[] @relation("PostAuthor")
}
```

**状態**: ✅ **完全対応済み**

---

#### 3. Poll（投票）

**使用フィールド**:
```prisma
model Poll {
  id         String @id @default(cuid())
  postId     String @unique
  options    Json   // 投票選択肢
  pollResult Json?  // 投票結果

  post Post @relation(fields: [postId], references: [id])
  votes PollVote[]
}
```

**状態**: ✅ **完全対応済み**

---

#### 4. Notification（通知）

**使用フィールド**:
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String   // 受信者ID
  type      String   // 通知種類
  title     String   // タイトル
  message   String   // メッセージ
  senderId  String   // 送信者ID
  createdAt DateTime @default(now())

  sender User @relation(fields: [senderId], references: [id])
}
```

**状態**: ✅ **完全対応済み**

---

#### 5. ProposalDocument（提案書）

**使用フィールド**:
```prisma
model ProposalDocument {
  id                   String @id @default(cuid())
  postId               String
  title                String
  background           String
  objectives           String
  expectedEffects      String
  implementationPlan   String
  status               String
  creatorId            String

  post    Post @relation(fields: [postId], references: [id])
  creator User @relation("ProposalCreator", fields: [creatorId], references: [id])
}
```

**状態**: ✅ **完全対応済み**

---

## 🔄 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────┐                                           │
│  │   Employee   │ (職員マスタ)                              │
│  │  - name      │                                           │
│  │  - department│                                           │
│  │  - permLevel │                                           │
│  └──────────────┘                                           │
│         │                                                     │
│         │ ①Webhook通知（職員情報更新時）                    │
│         │ API提供（リアルタイム同期）                        │
│         ▼                                                     │
└─────────────────────────────────────────────────────────────┘
         │
         │ HTTPS + JWT Auth
         │ Webhook (HMAC-SHA256)
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  User（キャッシュ）                      │               │
│  │  - name, department, permissionLevel    │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ②権限チェック                                      │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  FacilityProposalReviewPage              │               │
│  │  - 投稿詳細表示                          │               │
│  │  - 投票状況表示                          │               │
│  │  - 判断選択（承認/却下）                 │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ③判断送信                                          │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  POST /api/facility-proposal-review      │               │
│  │  - 権限チェック (Level 8+)               │               │
│  │  - Post.agendaStatus更新                 │               │
│  │  - ProposalDocument更新                  │               │
│  │  - Notification送信                      │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ④データ更新                                        │
│         ▼                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   Post   │  │Proposal  │  │Notifica- │                 │
│  │          │  │Document  │  │tion      │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
         │
         │ ⑤通知配信
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    施設職員                                   │
│  - 投稿者: 承認/却下通知                                     │
│  - 施設全職員: 委員会提出通知（承認時のみ）                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ 実装完了状況チェックリスト

### データベース

- [x] **Post.agendaStatus** - ✅ 実装済み（PostStatusEnum）
- [x] **Post.agendaDecisionBy** - ✅ 実装済み
- [x] **Post.agendaDecisionAt** - ✅ 実装済み
- [x] **Post.agendaDecisionReason** - ✅ 実装済み
- [x] **Post.agendaScore** - ✅ 実装済み
- [x] **Post.pollResult** - ✅ 実装済み（JSON型）
- [x] **User.permissionLevel** - ✅ 実装済み
- [x] **User.facilityId** - ✅ 実装済み
- [x] **ProposalDocument** - ✅ 実装済み
- [x] **Notification** - ✅ 実装済み

### API

- [x] **GET /api/posts/:postId** - ✅ 実装済み
- [x] **POST /api/facility-proposal-review/:postId** - ✅ 実装済み
  - [x] 権限チェック（Level 8+）
  - [x] バリデーション
  - [x] 委員会提出承認処理
  - [x] 却下処理
  - [x] 通知送信
  - [x] エラーハンドリング

### フロントエンド

- [x] **FacilityProposalReviewPage.tsx** - ✅ 実装済み
  - [x] 投稿詳細表示
  - [x] 投票状況表示
  - [x] 議題昇格履歴表示
  - [x] 判断選択UI
  - [x] 判断理由入力
  - [x] 権限チェック（クライアント側）
  - [x] 送信処理

---

## 📋 医療システムへの依頼内容

### ❌ **依頼なし**

このページは**VoiceDrive内部で完結**しており、医療システムへの新規API依頼や追加Webhook通知は**不要**です。

#### 既存の連携で十分な理由

1. **職員情報**:
   - VoiceDrive Userテーブルに既にキャッシュ済み
   - 医療システムからの既存Webhook/APIで同期済み

2. **権限チェック**:
   - `User.permissionLevel`は医療システムから提供済み
   - VoiceDrive側で権限判定可能

3. **投稿・投票データ**:
   - 100% VoiceDrive管轄のデータ
   - 医療システムへの連携不要

---

## 🎯 実装優先順位

### ✅ Phase 0: 完了（実装不要）

**理由**: 全ての機能が既に実装済み

| 機能 | 状態 | 備考 |
|-----|------|------|
| データベーススキーマ | ✅ 完了 | Post, User, Poll, Notification全て存在 |
| APIエンドポイント | ✅ 完了 | `/api/facility-proposal-review/:postId` 動作中 |
| フロントエンド | ✅ 完了 | FacilityProposalReviewPage 動作中 |
| 権限チェック | ✅ 完了 | Level 8+チェック実装済み |
| 通知機能 | ✅ 完了 | 投稿者+施設全職員への通知 |

---

## 🔍 コードレビュー結果

### ✅ 良好な実装

#### 1. 権限チェックの二重防御

**フロントエンド**（60-67行目）:
```typescript
if (!user.permissionLevel || Number(user.permissionLevel) < 8) {
  alert('この画面にアクセスする権限がありません');
  navigate('/unauthorized');
}
```

**バックエンド**（78-84行目）:
```typescript
if (!reviewer.permissionLevel || Number(reviewer.permissionLevel) < 8) {
  return res.status(403).json({
    success: false,
    error: 'この操作を行う権限がありません'
  });
}
```

**評価**: ✅ セキュリティベストプラクティス

---

#### 2. バリデーションの充実

```typescript
// アクション検証
if (!['approve_for_committee', 'reject'].includes(action)) {
  return res.status(400).json({ error: '無効なアクションです' });
}

// 理由の長さチェック
if (!reason || reason.trim().length < 10) {
  return res.status(400).json({ error: '判断理由は10文字以上入力してください' });
}
```

**評価**: ✅ 適切な入力検証

---

#### 3. 通知の適切な配信

**承認時**:
- 投稿者への個別通知 + 施設全職員への通知（193-224行目）

**却下時**:
- 投稿者への個別通知のみ（258-267行目）

**評価**: ✅ ビジネスロジックに合致

---

### 🟡 改善推奨事項

#### 1. ProposalDocumentの取り扱い

**現状**（164-190行目）:
```typescript
const existingDocument = await prisma.proposalDocument.findFirst({
  where: { postId: post.id }
});

if (existingDocument) {
  await prisma.proposalDocument.update({ /* ... */ });
} else {
  await prisma.proposalDocument.create({ /* ... */ });
}
```

**推奨**:
- ProposalDocumentが事前に作成されていることを前提条件にする
- または、100点到達時に自動生成するロジックを別途実装

**優先度**: 🟡 中（現状でも動作するが、仕様を明確化すべき）

---

#### 2. 施設全職員への通知の最適化

**現状**（205-224行目）:
```typescript
const facilityUsers = await prisma.user.findMany({
  where: { facilityId: post.facilityId, isRetired: false }
});

await Promise.all(facilityUsers.map(user =>
  prisma.notification.create({ /* ... */ })
));
```

**問題点**:
- 施設職員が1000人いる場合、1000件のINSERT
- パフォーマンス低下の可能性

**推奨**:
- バッチ挿入（`createMany`）を使用
- または、バックグラウンドジョブで非同期処理

**優先度**: 🟡 中（大規模施設では改善必要）

---

## 📝 結論

### ✅ 総合評価: **完全実装済み**

施設改善提案レビューページは以下の理由で**追加実装不要**:

1. ✅ **データベーススキーマ完備** - 全てのフィールドが存在
2. ✅ **API完全実装** - `/api/facility-proposal-review/:postId` 動作中
3. ✅ **権限チェック実装済み** - Level 8+の厳格なチェック
4. ✅ **通知機能実装済み** - 投稿者+施設職員への配信
5. ✅ **VoiceDrive内部完結** - 医療システムへの追加依頼不要

### 📅 次のステップ

#### 即座に実施可能

- [x] **ページ動作確認** - 既に実装済み
- [ ] **E2Eテスト** - 承認/却下フローの統合テスト
- [ ] **パフォーマンステスト** - 大規模施設での通知送信テスト

#### 将来的な改善（オプション）

- [ ] ProposalDocument生成ロジックの明確化
- [ ] 通知のバッチ挿入最適化
- [ ] 監査ログ記録（AuditLog連携）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
ステータス: ✅ **実装完了確認済み**
次回レビュー: 不要（実装済みのため）
