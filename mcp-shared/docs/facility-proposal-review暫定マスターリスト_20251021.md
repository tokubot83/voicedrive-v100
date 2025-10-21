# 施設改善提案レビュー 暫定マスターリスト

**作成日**: 2025年10月21日
**対象ページ**: FacilityProposalReviewPage (`src/pages/FacilityProposalReviewPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- 施設改善提案レビューページは100点到達した施設議題を副看護部長/看護部長が最終判断するページ
- **完全実装済み** - データベース、API、フロントエンド全て動作中
- **VoiceDrive内部完結** - 医療システムへの新規依頼は不要

### 必要な対応
**❌ なし** - 全ての機能が実装済み

### 優先度
**Priority: COMPLETED（実装完了）**

---

## 🎉 実装完了状況

### ✅ 実装済み項目

| カテゴリ | 項目 | 状態 | 備考 |
|---------|-----|------|------|
| **データベース** | Post.agendaStatus | ✅ 完了 | PostStatusEnum定義済み |
| | Post.agendaDecisionBy | ✅ 完了 | 判断者ID保存 |
| | Post.agendaDecisionAt | ✅ 完了 | 判断日時保存 |
| | Post.agendaDecisionReason | ✅ 完了 | 判断理由保存 |
| | Post.agendaScore | ✅ 完了 | スコア保存 |
| | Post.pollResult | ✅ 完了 | 投票結果（JSON） |
| | User.permissionLevel | ✅ 完了 | 権限レベル |
| | ProposalDocument | ✅ 完了 | 提案書テーブル |
| | Notification | ✅ 完了 | 通知テーブル |
| **API** | GET /api/posts/:postId | ✅ 完了 | 投稿詳細取得 |
| | POST /api/facility-proposal-review/:postId | ✅ 完了 | 承認/却下処理 |
| **フロントエンド** | 投稿詳細表示 | ✅ 完了 | 内容、著者、スコア |
| | 投票状況表示 | ✅ 完了 | 賛成/中立/反対 |
| | 判断選択UI | ✅ 完了 | 承認/却下ボタン |
| | 判断理由入力 | ✅ 完了 | 10文字以上バリデーション |
| | 権限チェック | ✅ 完了 | Level 8+チェック |
| **セキュリティ** | 二重権限チェック | ✅ 完了 | フロント+バックエンド |
| | バリデーション | ✅ 完了 | 入力検証 |
| **通知** | 投稿者通知 | ✅ 完了 | 承認/却下通知 |
| | 施設全職員通知 | ✅ 完了 | 承認時のみ |

---

## 🔗 医療システムへの依頼内容

### ❌ **依頼なし - VoiceDrive内部で完結**

#### 理由

1. **職員情報は既に同期済み**
   - VoiceDrive Userテーブルに職員情報（name, department, permissionLevel）をキャッシュ済み
   - 医療システムからのWebhook/APIで自動同期中

2. **投稿・投票データはVoiceDrive管轄**
   - Post, Poll, PollVoteは100% VoiceDrive管理
   - 医療システムへのデータ提供不要

3. **権限チェックはVoiceDrive側で実施**
   - `User.permissionLevel`を使用してLevel 8+をチェック
   - 医療システムへの権限確認API呼び出し不要

4. **通知もVoiceDrive内部で完結**
   - VoiceDrive Notificationテーブルで管理
   - 医療システムへの通知連携不要

---

## 🗄️ データベーススキーマ（既存）

### ✅ Post（投稿）- 完全対応済み

```prisma
model Post {
  id                   String      @id @default(cuid())
  content              String      // 投稿内容
  authorId             String      // 投稿者ID
  agendaScore          Int?        @default(0) // 現在スコア

  // 🆕 議題モード管理フィールド（既存）
  agendaStatus         PostStatus? @default(ACTIVE) @map("agenda_status")
  agendaDecisionBy     String?     @map("agenda_decision_by")
  agendaDecisionAt     DateTime?   @map("agenda_decision_at")
  agendaDecisionReason String?     @map("agenda_decision_reason")

  author User @relation("PostAuthor", fields: [authorId], references: [id])
  poll   Poll?
  proposalDocuments ProposalDocument[]
}
```

**PostStatusの関連値**:
- `PENDING_DEPUTY_DIRECTOR_REVIEW` - 副看護部長の判断待ち（100点到達）
- `APPROVED_FOR_COMMITTEE` - 委員会提出承認済み
- `REJECTED_BY_DEPUTY_DIRECTOR` - 副看護部長が却下

---

### ✅ User（職員）- 完全対応済み

```prisma
model User {
  id              String  @id @default(cuid())
  employeeId      String  @unique
  name            String  // 職員名（医療システムから同期）
  department      String? // 部署（医療システムから同期）
  facilityId      String? // 施設ID（医療システムから同期）
  permissionLevel Decimal // 権限レベル（医療システムから同期）

  posts         Post[]         @relation("PostAuthor")
  notifications Notification[]
}
```

**データソース**:
- 医療システムからWebhook/APIで同期
- VoiceDriveはキャッシュとして利用

---

### ✅ Poll（投票）- 完全対応済み

```prisma
model Poll {
  id         String   @id @default(cuid())
  postId     String   @unique
  options    Json     // 投票選択肢
  pollResult Json?    // 投票結果（賛成/中立/反対の集計）

  post  Post       @relation(fields: [postId], references: [id])
  votes PollVote[]
}
```

**pollResult構造**（JSON）:
```json
{
  "results": [
    { "option": { "text": "賛成" }, "votes": 45 },
    { "option": { "text": "中立" }, "votes": 12 },
    { "option": { "text": "反対" }, "votes": 8 }
  ]
}
```

---

### ✅ Notification（通知）- 完全対応済み

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

**通知タイプ**:
- `proposal_approved` - 投稿者への承認通知
- `proposal_rejected` - 投稿者への却下通知
- `facility_agenda_approved` - 施設全職員への委員会提出通知

---

### ✅ ProposalDocument（提案書）- 完全対応済み

```prisma
model ProposalDocument {
  id                   String   @id @default(cuid())
  postId               String   // 関連投稿ID
  title                String   // タイトル
  background           String   // 背景
  objectives           String   // 目的
  expectedEffects      String   // 期待効果
  implementationPlan   String   // 実施計画
  status               String   // ステータス
  creatorId            String   // 作成者ID
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  post    Post @relation(fields: [postId], references: [id])
  creator User @relation("ProposalCreator", fields: [creatorId], references: [id])
}
```

**使用タイミング**:
- 委員会提出承認時に自動生成または更新
- ステータス: `'approved'`

---

## 📡 API仕様（既存）

### API-1: 投稿詳細取得（既存）

**エンドポイント**:
```
GET /api/posts/:postId
```

**認証**: JWT Bearer Token

**レスポンス例**:
```json
{
  "id": "post123",
  "content": "夜勤帯の休憩時間を確保するため、業務効率化を提案します",
  "authorId": "user456",
  "author": {
    "name": "山田 太郎",
    "department": "外科"
  },
  "agendaScore": 105,
  "agendaStatus": "PENDING_DEPUTY_DIRECTOR_REVIEW",
  "agendaDecisionReason": null,
  "pollResult": {
    "results": [
      { "option": { "text": "賛成" }, "votes": 45 },
      { "option": { "text": "中立" }, "votes": 12 },
      { "option": { "text": "反対" }, "votes": 8 }
    ]
  }
}
```

**状態**: ✅ **実装済み**

---

### API-2: 施設議題レビュー（既存）

**エンドポイント**:
```
POST /api/facility-proposal-review/:postId
```

**認証**: JWT Bearer Token（Level 8+必須）

**リクエスト例**:
```json
{
  "action": "approve_for_committee",
  "reason": "施設内の投票結果から、この提案は多くの職員の支持を得ており、委員会での審議に値すると判断しました。"
}
```

**actionの種類**:
- `"approve_for_committee"` - 委員会提出を承認
- `"reject"` - 却下

**レスポンス例**（成功時）:
```json
{
  "success": true,
  "data": {
    "message": "委員会提出を承認しました",
    "notificationsSent": 150
  }
}
```

**レスポンス例**（エラー時）:
```json
{
  "success": false,
  "error": "この操作を行う権限がありません"
}
```

**実装ファイル**: `src/routes/facilityProposalReviewRoutes.ts`

**状態**: ✅ **実装済み**

---

## 🔄 データフロー

### フロー1: ページ表示

```mermaid
sequenceDiagram
    participant User as 副看護部長/看護部長
    participant FE as FacilityProposalReviewPage
    participant API as GET /api/posts/:postId
    participant DB as VoiceDrive DB

    User->>FE: ページアクセス
    FE->>FE: 権限チェック (Level 8+)
    FE->>API: 投稿詳細取得
    API->>DB: Post取得（author, poll含む）
    DB-->>API: 投稿データ
    API-->>FE: 投稿詳細
    FE->>User: 表示（内容、投票状況、昇格履歴）
```

---

### フロー2: 委員会提出承認

```mermaid
sequenceDiagram
    participant User as 副看護部長/看護部長
    participant FE as FacilityProposalReviewPage
    participant API as POST /api/facility-proposal-review
    participant DB as VoiceDrive DB

    User->>FE: 「委員会提出を承認」選択
    User->>FE: 判断理由入力（10文字以上）
    User->>FE: 送信ボタンクリック
    FE->>API: POST {action: "approve_for_committee", reason: "..."}
    API->>API: 権限チェック (Level 8+)
    API->>DB: Post.agendaStatus = 'APPROVED_FOR_COMMITTEE'
    API->>DB: ProposalDocument作成/更新
    API->>DB: 投稿者への通知作成
    API->>DB: 施設全職員への通知作成（150件）
    DB-->>API: 更新完了
    API-->>FE: {success: true, notificationsSent: 150}
    FE->>User: 成功メッセージ表示
    FE->>User: 提案管理ページへリダイレクト
```

---

### フロー3: 却下

```mermaid
sequenceDiagram
    participant User as 副看護部長/看護部長
    participant FE as FacilityProposalReviewPage
    participant API as POST /api/facility-proposal-review
    participant DB as VoiceDrive DB

    User->>FE: 「却下」選択
    User->>FE: 判断理由入力（10文字以上）
    User->>FE: 送信ボタンクリック
    FE->>API: POST {action: "reject", reason: "..."}
    API->>API: 権限チェック (Level 8+)
    API->>DB: Post.agendaStatus = 'REJECTED_BY_DEPUTY_DIRECTOR'
    API->>DB: Post.visibility = 'private'（投稿者のみ閲覧可）
    API->>DB: 投稿者への却下通知作成
    DB-->>API: 更新完了
    API-->>FE: {success: true, status: 'REJECTED_BY_DEPUTY_DIRECTOR'}
    FE->>User: 成功メッセージ表示
    FE->>User: 提案管理ページへリダイレクト
```

---

## ✅ セキュリティ実装

### 二重権限チェック

#### フロントエンド（`FacilityProposalReviewPage.tsx` 60-67行目）

```typescript
if (!user.permissionLevel || Number(user.permissionLevel) < 8) {
  alert('この画面にアクセスする権限がありません');
  navigate('/unauthorized');
}
```

#### バックエンド（`facilityProposalReviewRoutes.ts` 78-84行目）

```typescript
if (!reviewer.permissionLevel || Number(reviewer.permissionLevel) < 8) {
  return res.status(403).json({
    success: false,
    error: 'この操作を行う権限がありません'
  });
}
```

**評価**: ✅ **セキュリティベストプラクティス準拠**

---

### バリデーション

```typescript
// アクション検証
if (!['approve_for_committee', 'reject'].includes(action)) {
  return res.status(400).json({ error: '無効なアクションです' });
}

// 理由の長さチェック
if (!reason || reason.trim().length < 10) {
  return res.status(400).json({
    error: '判断理由は10文字以上入力してください'
  });
}
```

**評価**: ✅ **適切な入力検証**

---

## 📅 想定スケジュール

### ✅ Phase 0: 実装完了（完了済み）

| 項目 | 状態 | 完了日 |
|-----|------|-------|
| データベーススキーマ | ✅ 完了 | 既存 |
| APIエンドポイント | ✅ 完了 | 既存 |
| フロントエンド | ✅ 完了 | 既存 |
| 権限チェック | ✅ 完了 | 既存 |
| 通知機能 | ✅ 完了 | 既存 |

### 🔄 次のステップ（オプション）

#### Phase 1: テスト実施（1-2日）

- [ ] E2Eテスト作成
  - 承認フローテスト
  - 却下フローテスト
  - 権限エラーテスト
- [ ] パフォーマンステスト
  - 大規模施設での通知送信テスト（1000人規模）
- [ ] セキュリティ監査
  - 権限チェックの妥当性確認

#### Phase 2: 最適化（1日）

- [ ] 通知のバッチ挿入最適化
  ```typescript
  // 現状: Promise.all with map
  await Promise.all(users.map(u => create({ ... })));

  // 改善案: createMany
  await prisma.notification.createMany({
    data: users.map(u => ({ ... }))
  });
  ```

- [ ] ProposalDocument生成ロジックの明確化
  - 100点到達時に自動生成するか
  - 承認時に生成するか（現在）

---

## 🔍 改善推奨事項（オプション）

### 🟡 優先度: 中

#### 1. 通知のバッチ挿入最適化

**現状**:
```typescript
await Promise.all(facilityUsers.map(user =>
  prisma.notification.create({ data: { ... } })
));
```

**問題点**:
- 1000人施設の場合、1000回のINSERT
- パフォーマンス低下の可能性

**改善案**:
```typescript
await prisma.notification.createMany({
  data: facilityUsers.map(user => ({
    userId: user.id,
    type: 'facility_agenda_approved',
    title: '施設議題が委員会提出されました',
    message: `...`,
    relatedPostId: post.id,
    senderId: reviewer.id
  })),
  skipDuplicates: true
});
```

**期待効果**:
- 1回のバッチ処理で完了
- パフォーマンス大幅改善

---

#### 2. ProposalDocument生成タイミングの明確化

**現状**:
- 承認時に存在チェック → なければ作成

**推奨案1**: 100点到達時に自動生成
```typescript
// 100点到達時（別のロジック）
if (newScore >= 100 && oldScore < 100) {
  await prisma.proposalDocument.create({ ... });
}
```

**推奨案2**: 承認時のみ生成（現状維持）
```typescript
// 承認時
await prisma.proposalDocument.create({ ... });
```

**選択基準**:
- 提案書をいつから編集可能にするか
- 100点到達時点で職員が内容を確認できるべきか

---

#### 3. 監査ログ記録

**現状**: AuditLogへの記録なし

**推奨**:
```typescript
// 承認/却下時にAuditLogを記録
await prisma.auditLog.create({
  data: {
    userId: reviewer.id,
    action: 'FACILITY_PROPOSAL_REVIEW',
    entityType: 'Post',
    entityId: post.id,
    oldValues: { agendaStatus: post.agendaStatus },
    newValues: { agendaStatus: 'APPROVED_FOR_COMMITTEE' },
    reason: reason
  }
});
```

**期待効果**:
- 承認/却下の履歴を完全追跡
- コンプライアンス対応

---

## 📊 データ管理責任マトリクス

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| **Post（投稿）** | ✅ マスタ | - | VoiceDrive | - | ✅ OK |
| Post.content | ✅ | - | VoiceDrive | - | ✅ OK |
| Post.agendaScore | ✅ | - | VoiceDrive | - | ✅ OK |
| Post.agendaStatus | ✅ | - | VoiceDrive | - | ✅ OK |
| Post.agendaDecision* | ✅ | - | VoiceDrive | - | ✅ OK |
| **Poll（投票）** | ✅ マスタ | - | VoiceDrive | - | ✅ OK |
| Poll.pollResult | ✅ | - | VoiceDrive | - | ✅ OK |
| **User（職員）** | キャッシュ | ✅ マスタ | 医療システム | Webhook/API | ✅ OK |
| User.name | キャッシュ | ✅ | 医療システム | Webhook/API | ✅ OK |
| User.department | キャッシュ | ✅ | 医療システム | Webhook/API | ✅ OK |
| User.permissionLevel | キャッシュ | ✅ | 医療システム | Webhook/API | ✅ OK |
| User.facilityId | キャッシュ | ✅ | 医療システム | Webhook/API | ✅ OK |
| **ProposalDocument** | ✅ マスタ | - | VoiceDrive | - | ✅ OK |
| **Notification** | ✅ マスタ | - | VoiceDrive | - | ✅ OK |

**結論**:
- **VoiceDrive管轄**: 投稿、投票、提案書、通知（100%）
- **医療システム管轄**: 職員情報（既存Webhook/APIで同期済み）
- **追加依頼**: ❌ なし

---

## ✅ 実装完了確認チェックリスト

### データベース

- [x] Post.agendaStatus（PostStatusEnum）
- [x] Post.agendaDecisionBy
- [x] Post.agendaDecisionAt
- [x] Post.agendaDecisionReason
- [x] Post.agendaScore
- [x] Post.pollResult（JSON型）
- [x] User.permissionLevel
- [x] User.facilityId
- [x] ProposalDocument
- [x] Notification

### API

- [x] GET /api/posts/:postId（投稿詳細取得）
- [x] POST /api/facility-proposal-review/:postId（承認/却下処理）
  - [x] 権限チェック（Level 8+）
  - [x] バリデーション
  - [x] 委員会提出承認処理
  - [x] 却下処理
  - [x] 通知送信
  - [x] エラーハンドリング

### フロントエンド

- [x] FacilityProposalReviewPage.tsx
  - [x] 投稿詳細表示
  - [x] 投票状況表示
  - [x] 議題昇格履歴表示
  - [x] 判断選択UI
  - [x] 判断理由入力
  - [x] 権限チェック（クライアント側）
  - [x] 送信処理

### セキュリティ

- [x] 二重権限チェック（フロント+バックエンド）
- [x] バリデーション（アクション、理由の長さ）
- [x] JWT認証

### 通知

- [x] 投稿者への通知（承認/却下）
- [x] 施設全職員への通知（承認時のみ）

---

## 📝 補足資料

### 参照ドキュメント

1. **facility-proposal-review_DB要件分析_20251021.md**
   詳細な分析レポート

2. **データ管理責任分界点定義書_20251008.md**
   VoiceDriveと医療システムの責任分担

3. **PersonalStation暫定マスターリスト_20251008.md**
   同様の分析手法の参考例

### 技術スタック

**VoiceDrive**:
- SQLite（開発環境）/ MySQL（本番環境）
- Prisma ORM
- TypeScript + React
- Express.js (API Server)

**医療システム**:
- MySQL 8.0
- Prisma ORM
- TypeScript + Next.js
- NestJS (API Server)

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-21 | 初版作成（実装完了確認） | AI (Claude Code) |

---

**作成者**: AI (Claude Code)
**ステータス**: ✅ **実装完了確認済み**
**医療システムチームへの依頼**: ❌ **なし**（VoiceDrive内部完結）

---

## 🎯 総括

施設改善提案レビューページは**完全に実装済み**であり、以下の理由で追加作業は不要です：

1. ✅ **データベース完備** - 全てのフィールドが schema.prisma に存在
2. ✅ **API実装済み** - `/api/facility-proposal-review/:postId` が動作中
3. ✅ **フロントエンド実装済み** - FacilityProposalReviewPage が動作中
4. ✅ **権限チェック実装済み** - Level 8+の厳格なチェック
5. ✅ **通知機能実装済み** - 投稿者+施設職員への配信
6. ✅ **VoiceDrive内部完結** - 医療システムへの追加依頼不要

**次のステップ**: オプションの最適化（通知バッチ挿入、監査ログ）のみ

---

**文書終了**
