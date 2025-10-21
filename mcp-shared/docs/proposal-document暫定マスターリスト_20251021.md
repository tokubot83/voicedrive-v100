# 議題提案書編集ページ（ProposalDocumentEditor）暫定マスターリスト

**文書番号**: PDE-ML-2025-1021-001
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**対象機能**: 議題提案書編集ページ（ProposalDocumentEditor）
**ステータス**: 暫定版

---

## 📊 データベーススキーマ拡張計画

### 1. ProposalDocument テーブル作成

**目的**: 議題提案書の全データを保持

| フィールド名 | 型 | NULL | デフォルト | 説明 | ステータス |
|------------|------|------|----------|------|----------|
| `id` | String | ❌ | cuid() | プライマリキー | ❌ 新規 |
| `post_id` | String | ❌ | - | 投稿ID（外部キー） | ❌ 新規 |
| `title` | String | ❌ | - | 提案書タイトル | ❌ 新規 |
| `summary` | String | ❌ | - | 提案概要（100-300字） | ❌ 新規 |
| `agenda_level` | String | ❌ | - | 議題レベル（PENDING～CORP_AGENDA） | ❌ 新規 |
| `target_committee` | String | ✅ | NULL | 提出先委員会 | ❌ 新規 |
| `vote_analysis` | Json | ❌ | - | 投票分析データ | ❌ 新規 |
| `comment_analysis` | Json | ❌ | - | コメント分析データ | ❌ 新規 |
| `related_info` | Json | ✅ | NULL | 関連情報 | ❌ 新規 |
| `background` | String | ✅ | NULL | 背景・現状課題 | ❌ 新規 |
| `objectives` | String | ✅ | NULL | 目的 | ❌ 新規 |
| `expected_effects` | String | ✅ | NULL | 期待される効果 | ❌ 新規 |
| `concerns` | String | ✅ | NULL | 懸念点 | ❌ 新規 |
| `counter_measures` | String | ✅ | NULL | 懸念への対応策 | ❌ 新規 |
| `manager_notes` | String | ✅ | NULL | 管理職による補足説明 | ❌ 新規 |
| `additional_context` | String | ✅ | NULL | 追加の文脈 | ❌ 新規 |
| `recommendation_level` | String | ✅ | NULL | 推奨レベル | ❌ 新規 |
| `status` | String | ❌ | "draft" | ステータス | ❌ 新規 |
| `created_by` | String | ❌ | - | 作成者employeeId | ❌ 新規 |
| `created_by_name` | String | ✅ | NULL | 作成者名（キャッシュ） | ❌ 新規 |
| `created_date` | DateTime | ❌ | now() | 作成日時 | ❌ 新規 |
| `updated_date` | DateTime | ❌ | now() | 更新日時 | ❌ 新規 |
| `submitted_date` | DateTime | ✅ | NULL | 委員会提出日 | ❌ 新規 |
| `submitted_by` | String | ✅ | NULL | 提出者employeeId | ❌ 新規 |
| `submitted_by_name` | String | ✅ | NULL | 提出者名（キャッシュ） | ❌ 新規 |
| `committee_decision_status` | String | ✅ | NULL | 委員会決定ステータス | ❌ 新規 |
| `committee_decision_date` | DateTime | ✅ | NULL | 委員会決定日 | ❌ 新規 |
| `committee_decision_reason` | String | ✅ | NULL | 委員会決定理由 | ❌ 新規 |
| `committee_next_steps` | String | ✅ | NULL | 次のステップ | ❌ 新規 |

**インデックス追加**:
```prisma
@@index([post_id])
@@index([status])
@@index([agenda_level])
@@index([created_by])
@@index([created_date])
```

**リレーション追加**:
```prisma
post              Post                 @relation(fields: [post_id], references: [id], onDelete: Cascade)
auditLogs         ProposalAuditLog[]
submissionRequests SubmissionRequest[]
```

---

### 2. ProposalAuditLog テーブル（新規作成）

**目的**: 議題提案書の編集履歴・監査ログを記録

| フィールド名 | 型 | NULL | デフォルト | 説明 | ステータス |
|------------|------|------|----------|------|----------|
| `id` | String | ❌ | cuid() | プライマリキー | ❌ 新規 |
| `document_id` | String | ❌ | - | 提案書ID（外部キー） | ❌ 新規 |
| `timestamp` | DateTime | ❌ | now() | ログ記録日時 | ❌ 新規 |
| `user_id` | String | ❌ | - | ユーザーID（employeeId） | ❌ 新規 |
| `user_name` | String | ❌ | - | ユーザー名（キャッシュ） | ❌ 新規 |
| `user_level` | Int | ❌ | - | 権限レベル | ❌ 新規 |
| `action` | String | ❌ | - | アクション種別 | ❌ 新規 |
| `details` | String | ✅ | NULL | アクション詳細 | ❌ 新規 |
| `changed_fields` | Json | ✅ | NULL | 変更されたフィールド | ❌ 新規 |

**インデックス**:
```prisma
@@index([document_id])
@@index([timestamp])
@@index([user_id])
@@index([action])
```

**リレーション**:
```prisma
document   ProposalDocument @relation(fields: [document_id], references: [id], onDelete: Cascade)
```

**アクション種別**:
- `created` - 作成
- `edited` - 編集
- `reviewed` - レビュー
- `submitted` - 委員会提出
- `approved` - 承認
- `rejected` - 却下
- `marked_candidate` - 議題候補としてマーク
- `unmarked_candidate` - 議題候補マーク解除

---

### 3. SubmissionRequest テーブル（新規作成）

**目的**: 委員会提出リクエスト（Level 7+が作成、Level 8+が承認）

| フィールド名 | 型 | NULL | デフォルト | 説明 | ステータス |
|------------|------|------|----------|------|----------|
| `id` | String | ❌ | cuid() | プライマリキー | ❌ 新規 |
| `document_id` | String | ❌ | - | 提案書ID（外部キー） | ❌ 新規 |
| `post_id` | String | ❌ | - | 投稿ID（追跡用） | ❌ 新規 |
| `requested_by` | String | ❌ | - | リクエスト者employeeId | ❌ 新規 |
| `requested_by_name` | String | ✅ | NULL | リクエスト者名（キャッシュ） | ❌ 新規 |
| `requested_by_level` | Int | ❌ | - | リクエスト者権限レベル（7+） | ❌ 新規 |
| `requested_date` | DateTime | ❌ | now() | リクエスト日時 | ❌ 新規 |
| `target_committee` | String | ❌ | - | 提出先委員会名 | ❌ 新規 |
| `status` | String | ❌ | "pending" | ステータス | ❌ 新規 |
| `reviewed_by` | String | ✅ | NULL | レビュー者employeeId（Level 8+） | ❌ 新規 |
| `reviewed_by_name` | String | ✅ | NULL | レビュー者名（キャッシュ） | ❌ 新規 |
| `reviewed_by_level` | Int | ✅ | NULL | レビュー者権限レベル（8+） | ❌ 新規 |
| `reviewed_date` | DateTime | ✅ | NULL | レビュー日時 | ❌ 新規 |
| `review_notes` | String | ✅ | NULL | レビューノート（承認コメント/却下理由） | ❌ 新規 |

**インデックス**:
```prisma
@@index([document_id])
@@index([post_id])
@@index([status])
@@index([requested_by])
@@index([reviewed_by])
@@index([requested_date])
```

**リレーション**:
```prisma
document   ProposalDocument @relation(fields: [document_id], references: [id], onDelete: Cascade)
post       Post             @relation(fields: [post_id], references: [id], onDelete: Cascade)
```

**ステータス種別**:
- `pending` - 承認待ち
- `approved` - 承認済み
- `rejected` - 却下

---

### 4. Post テーブル拡張

**目的**: ProposalDocumentとのリレーション追加

**リレーション追加**:
```prisma
proposalDocuments   ProposalDocument[]
submissionRequests  SubmissionRequest[]
```

**ステータス**: ✅ 既存テーブルにリレーション追加のみ

---

## 🔌 API実装計画

### API-PDE-1: 議題提案書取得

**エンドポイント**: `GET /api/proposal-documents/:documentId`

**実装ファイル**: `src/routes/proposalDocumentRoutes.ts` (新規作成)

**実装内容**:
1. `documentId` からProposalDocumentを取得
2. 関連する投稿データを結合
3. 監査ログを取得
4. レスポンス整形

**依存サービス**:
- `ProposalDocumentService` (新規作成)

**ステータス**: ❌ **未実装**

---

### API-PDE-2: 議題提案書編集

**エンドポイント**: `PUT /api/proposal-documents/:documentId`

**実装ファイル**: `src/routes/proposalDocumentRoutes.ts` (既存拡張)

**実装内容**:
1. リクエストボディの検証
2. 権限チェック（作成者 or 上位権限者）
3. ProposalDocument更新
4. 監査ログ記録（変更フィールド記録）
5. レスポンス返却

**依存サービス**:
- `ProposalDocumentService`
- `ProposalAuditService`

**ステータス**: ❌ **未実装**

---

### API-PDE-3: 提出準備完了マーク

**エンドポイント**: `PATCH /api/proposal-documents/:documentId/status`

**実装ファイル**: `src/routes/proposalDocumentRoutes.ts` (既存拡張)

**実装内容**:
1. ステータス変更（`draft` → `ready`）
2. 権限チェック
3. 監査ログ記録

**ステータス**: ❌ **未実装**

---

### API-PDE-4: 委員会提出リクエスト作成

**エンドポイント**: `POST /api/committee-submissions/requests`

**実装ファイル**: `src/routes/committeeSubmissionRoutes.ts` (新規作成)

**実装内容**:
1. 権限チェック（Level 7+）
2. 提案書ステータス確認（`ready` のみ）
3. SubmissionRequest作成
4. 監査ログ記録

**権限要件**: Level 7+ のみ実行可能

**ステータス**: ❌ **未実装**

---

### API-PDE-5: 委員会提出リクエスト承認

**エンドポイント**: `POST /api/committee-submissions/requests/:requestId/approve`

**実装ファイル**: `src/routes/committeeSubmissionRoutes.ts` (既存拡張)

**実装内容**:
1. 権限チェック（Level 8+）
2. リクエストステータス更新（`pending` → `approved`）
3. ProposalDocumentステータス更新（`ready` → `submitted`）
4. 委員会提出日時・提出者記録
5. 監査ログ記録

**権限要件**: Level 8+ のみ実行可能

**ステータス**: ❌ **未実装**

---

### API-PDE-6: 議題提案書一覧取得（管理用）

**エンドポイント**: `GET /api/proposal-documents`

**実装ファイル**: `src/routes/proposalDocumentRoutes.ts` (既存拡張)

**実装内容**:
1. クエリパラメータ解析（status, agendaLevel, createdBy）
2. フィルタリング・ソート
3. ページネーション
4. レスポンス返却

**ステータス**: ❌ **未実装**

---

## 🔧 サービス実装計画

### サービス-PDE-1: proposalAnalyzer.ts 実装

**目的**: 投票・コメントデータの分析

**実装ファイル**: `src/utils/proposalAnalyzer.ts` (新規作成)

**実装内容**:

#### 1. analyzeVotes(post: Post): VoteAnalysis

投票データ分析:
- 総投票数算出
- 支持率・強支持率・反対率・中立率算出
- 部署別集計
- 職位別集計
- ステークホルダー別集計

#### 2. analyzeComments(post: Post): CommentAnalysis

コメントデータ分析:
- 総コメント数算出
- コメントタイプ別集計（support/concern/proposal）
- 賛成意見の要約抽出
- 懸念点の要約抽出
- 建設的提案の抽出
- 主要コメント抽出（いいね数順）

#### 3. analyzeRelatedInfo(post: Post): RelatedInfo

関連情報分析:
- 類似過去議題検索
- 影響部署の特定
- 参考資料の提案

#### 4. generateProposalSummary(post: Post): string

提案要約生成:
- 投稿内容から100-300字の要約を生成

#### 5. generateBackground(post: Post, voteAnalysis: VoteAnalysis): string

背景生成:
- 投稿内容と投票データから背景・経緯を生成

#### 6. generateExpectedEffects(post: Post, commentAnalysis: CommentAnalysis): string

期待効果生成:
- コメント分析から期待される効果を生成

#### 7. generateConcerns(commentAnalysis: CommentAnalysis): string

懸念点生成:
- コメント分析から懸念点を抽出

#### 8. generateCounterMeasures(commentAnalysis: CommentAnalysis): string

対応策生成:
- コメント分析から対応策を生成

**ステータス**: ❌ **未実装**

---

### サービス-PDE-2: ProposalAuditService.ts 実装

**目的**: 監査ログの記録・取得

**実装ファイル**: `src/services/ProposalAuditService.ts` (新規作成)

**実装内容**:

#### 1. logCreated(documentId, user, postId)

提案書作成ログ記録

#### 2. logEdited(documentId, user, changedFields)

提案書編集ログ記録

#### 3. logReviewed(documentId, reviewer, notes)

レビューログ記録

#### 4. logSubmitted(documentId, submitter, targetCommittee)

委員会提出ログ記録

#### 5. getLogs(documentId): ProposalAuditLog[]

監査ログ取得

**ステータス**: ❌ **未実装**

---

### サービス-PDE-3: ProposalDocumentService.ts 実装

**目的**: 議題提案書のCRUD操作

**実装ファイル**: `src/services/ProposalDocumentService.ts` (新規作成)

**実装内容**:

#### 1. getDocument(documentId): ProposalDocument

提案書取得

#### 2. updateDocument(documentId, updates, user): ProposalDocument

提案書更新

#### 3. updateStatus(documentId, status, user): ProposalDocument

ステータス更新

#### 4. listDocuments(filters, pagination): ProposalDocument[]

提案書一覧取得

**ステータス**: ❌ **未実装**

---

### サービス-PDE-4: CommitteeSubmissionService.ts 統合

**目的**: 委員会提出リクエストの管理

**実装ファイル**: `src/services/CommitteeSubmissionService.ts` (✅ 既存)

**必要な対応**:
- データベース連携（現在はメモリ上）
- API実装

**ステータス**: ⚠️ **DB連携が未実装**

---

## 📋 実装チェックリスト

### Phase 1: 基本機能実装（10/22-10/30）

#### データベース
- [ ] ProposalDocument テーブル作成
- [ ] ProposalAuditLog テーブル作成
- [ ] SubmissionRequest テーブル作成
- [ ] Post テーブルにリレーション追加
- [ ] Prismaマイグレーション実行

#### サービス実装
- [ ] proposalAnalyzer.ts 実装
  - [ ] analyzeVotes()
  - [ ] analyzeComments()
  - [ ] analyzeRelatedInfo()
  - [ ] generateProposalSummary()
  - [ ] generateBackground()
  - [ ] generateExpectedEffects()
  - [ ] generateConcerns()
  - [ ] generateCounterMeasures()
- [ ] ProposalAuditService.ts 実装
  - [ ] logCreated()
  - [ ] logEdited()
  - [ ] logReviewed()
  - [ ] logSubmitted()
  - [ ] getLogs()
- [ ] ProposalDocumentService.ts 実装
  - [ ] getDocument()
  - [ ] updateDocument()
  - [ ] updateStatus()
  - [ ] listDocuments()

#### API実装
- [ ] `GET /api/proposal-documents/:documentId` 実装
- [ ] `PUT /api/proposal-documents/:documentId` 実装
- [ ] `PATCH /api/proposal-documents/:documentId/status` 実装

#### フロントエンド
- [ ] ProposalDocumentEditor.tsx からデモデータ削除
- [ ] 実APIへの切り替え
- [ ] エラーハンドリング追加
- [ ] ローディング状態表示

---

### Phase 2: 委員会提出フロー（10/31-11/7）

#### サービス実装
- [ ] CommitteeSubmissionService.ts DB連携
  - [ ] createSubmissionRequest() DB版
  - [ ] approveSubmissionRequest() DB版
  - [ ] rejectSubmissionRequest() DB版
  - [ ] getRequestsByUser()
  - [ ] getPendingRequests()

#### API実装
- [ ] `POST /api/committee-submissions/requests` 実装
  - [ ] Level 7+ 権限チェック
  - [ ] ステータス確認（`ready`のみ）
- [ ] `POST /api/committee-submissions/requests/:requestId/approve` 実装
  - [ ] Level 8+ 権限チェック
  - [ ] ステータス更新（`pending` → `approved`）
  - [ ] ProposalDocument ステータス更新（`ready` → `submitted`）

#### フロントエンド
- [ ] 委員会提出リクエストUI統合
- [ ] 承認フローUI実装（Level 8+用）

#### テスト
- [ ] ユニットテスト（権限チェック）
- [ ] 統合テスト（提出フロー）
- [ ] E2Eテスト（Level 7+ → Level 8+ フロー）

---

### Phase 3: 高度機能（11/8-11/15）

#### API実装
- [ ] `GET /api/proposal-documents` 実装（一覧取得）
  - [ ] フィルタリング（status, agendaLevel, createdBy）
  - [ ] ソート
  - [ ] ページネーション

#### 医療システム連携
- [ ] 委員会マスタAPI連携
  - [ ] GET /api/committees
  - [ ] 委員会一覧取得
- [ ] 委員会決定Webhook受信
  - [ ] POST /webhook/committee-decision
  - [ ] HMAC署名検証

#### 拡張機能
- [ ] PDF出力機能
  - [ ] 提案書PDFテンプレート作成
  - [ ] PDF生成API実装
- [ ] メール通知
  - [ ] 提出リクエスト作成時（Level 8+に通知）
  - [ ] 提出承認時（リクエスト者に通知）

---

## 🔍 データ整合性チェック項目

### 提案書データの整合性

- [ ] ProposalDocument.postId が存在する Post を参照しているか
- [ ] ProposalDocument.createdBy が存在する職員IDか
- [ ] ProposalDocument.agendaLevel が適切な範囲か（PENDING～CORP_AGENDA）
- [ ] ProposalDocument.status が適切な値か（draft/under_review/ready/submitted）

### 監査ログの整合性

- [ ] ProposalAuditLog.documentId が存在する ProposalDocument を参照しているか
- [ ] ProposalAuditLog.userId が存在する職員IDか
- [ ] ProposalAuditLog.action が適切な値か
- [ ] 時系列が正しいか（timestamp順）

### 提出リクエストの整合性

- [ ] SubmissionRequest.documentId が存在する ProposalDocument を参照しているか
- [ ] SubmissionRequest.requestedBy が Level 7+ か
- [ ] SubmissionRequest.reviewedBy が Level 8+ か（承認時）
- [ ] SubmissionRequest.status が適切な値か（pending/approved/rejected）

---

## 📊 パフォーマンス最適化計画

### キャッシュ戦略

**職員名キャッシュ**:
- ProposalDocument.createdByName
- ProposalDocument.submittedByName
- SubmissionRequest.requestedByName
- SubmissionRequest.reviewedByName

**目的**: 職員情報APIへのクエリ削減

**更新タイミング**: 提案書作成時・提出時・レビュー時

### インデックス最適化

**追加インデックス**:
```prisma
// ProposalDocument
@@index([created_by, status])  // 作成者別ステータス別フィルタ用
@@index([agenda_level, created_date]) // レベル別作成日順ソート用

// ProposalAuditLog
@@index([document_id, timestamp]) // 提案書別時系列ソート用

// SubmissionRequest
@@index([status, requested_date]) // ステータス別リクエスト日順ソート用
@@index([reviewed_by, status]) // レビュー者別ステータス別フィルタ用
```

---

## 🚨 注意事項

### 権限チェックの徹底

**重要**: API実行時に必ず権限チェックを実施

- **Level 7+**: 委員会提出リクエスト作成
- **Level 8+**: 委員会提出リクエスト承認
- **作成者 or 上位権限者**: 提案書編集

### ステータス遷移の検証

**提案書ステータス**:
```
draft → under_review → ready → submitted → (approved/rejected)
```

**提出リクエストステータス**:
```
pending → (approved/rejected)
```

**不正な遷移を防ぐ**:
- `draft` から直接 `submitted` への遷移は不可
- `submitted` から `draft` への遷移は不可

### 監査ログの完全性

**すべてのアクションを記録**:
- ✅ 提案書作成
- ✅ 提案書編集（変更フィールド記録）
- ✅ ステータス変更
- ✅ 委員会提出リクエスト作成
- ✅ 委員会提出リクエスト承認/却下
- ✅ 委員会提出

---

## 📝 今後の拡張予定

### AI支援機能（将来）

- 提案書の自動要約品質向上（GPT-4統合）
- コメント分析の高度化（感情分析）
- 類似過去議題のレコメンド精度向上

### レポート機能（将来）

- 提出済み提案書の一覧レポート
- 委員会別採択率レポート
- 部署別提案数レポート

### 委員会決定フィードバック（将来）

- 委員会からの決定結果受信（Webhook）
- 採択/要改善/却下の自動反映
- 次のアクション提案

---

**文書終了**
