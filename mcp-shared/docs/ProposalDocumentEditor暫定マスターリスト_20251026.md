# ProposalDocumentEditor (/proposal-document/:documentId) 暫定マスターリスト

**文書番号**: MASTER-2025-1026-004
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/proposal-document/:documentId ProposalDocumentEditor
**参照文書**: [ProposalDocumentEditor_DB要件分析_20251026.md](./ProposalDocumentEditor_DB要件分析_20251026.md)

---

## 📋 概要

ProposalDocumentEditor（議題提案書編集ページ）の実装に必要なテーブル・フィールド・API・サービスの完全なマスターリストです。

**重要**: 本ページは**完全実装済み**であり、全てのデータソースとサービスが動作しています。

---

## 🗂️ データ項目カタログ（50+項目）

### カテゴリ別分類

1. **基本情報**: 7項目
2. **提案内容（自動生成）**: 6項目
3. **データ分析**: 3項目（JSON）
4. **管理職による追記**: 3項目
5. **委員会提出情報**: 4項目
6. **透明性ログ**: 8項目
7. **UI状態**: 3項目
8. **投票分析詳細**: 10+項目
9. **コメント分析詳細**: 10+項目

---

## 1️⃣ 基本情報（7項目）

### 1.1 提案書ID
| 項目名 | `id` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.id |
| **説明** | 議題提案書の一意識別子 |
| **実装状況** | ✅ 完了 |
| **生成方法** | `doc-{postId}-{timestamp}` |
| **例** | `doc-post-abc123-1698765432000` |

---

### 1.2 元投稿ID
| 項目名 | `postId` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.postId |
| **説明** | 提案書の元となった投稿のID |
| **実装状況** | ✅ 完了 |
| **リレーション** | Post.id（Cascade削除） |

---

### 1.3 提案書タイトル
| 項目名 | `title` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.title |
| **説明** | 提案書のタイトル |
| **実装状況** | ✅ 完了 |
| **生成ロジック** | `【{提案タイプ}】{投稿内容の最初の30文字}...` |
| **例** | `【業務改善】夜勤明けの休憩時間を延長してほしい...` |

---

### 1.4 議題レベル
| 項目名 | `agendaLevel` |
|--------|------|
| **型** | enum: 'PENDING' \| 'DEPT_REVIEW' \| 'DEPT_AGENDA' \| 'FACILITY_AGENDA' \| 'CORP_REVIEW' \| 'CORP_AGENDA' |
| **データソース** | ProposalDocument.agendaLevel |
| **説明** | 議題のレベル・スケール |
| **実装状況** | ✅ 完了 |
| **表示場所** | ヘッダーのバッジ |

**議題レベル一覧**:
| 値 | 日本語表示 | 色 | 提出先 |
|----|----------|-----|--------|
| `PENDING` | 投票中 | gray | - |
| `DEPT_REVIEW` | 部署レビュー | blue | 部署長 |
| `DEPT_AGENDA` | 部署議題 | blue | 部署委員会 |
| `FACILITY_AGENDA` | 施設議題 | purple | 施設委員会 |
| `CORP_REVIEW` | 法人レビュー | orange | 法人委員会 |
| `CORP_AGENDA` | 法人議題 | red | 経営委員会 |

---

### 1.5 ステータス
| 項目名 | `status` |
|--------|------|
| **型** | enum: 'draft' \| 'under_review' \| 'ready' \| 'submitted' \| 'approved' \| 'rejected' |
| **データソース** | ProposalDocument.status |
| **説明** | 提案書の現在のステータス |
| **実装状況** | ✅ 完了 |
| **デフォルト値** | 'draft' |
| **表示場所** | ヘッダーのバッジ |

**ステータス一覧**:
| 値 | 日本語表示 | 色 | 説明 |
|----|----------|-----|------|
| `draft` | 下書き | gray | 編集中 |
| `under_review` | レビュー中 | gray | レビュー中 |
| `ready` | 提出準備完了 | green | 提出可能 |
| `submitted` | 委員会提出済み | blue | 委員会に提出済み |
| `approved` | 承認 | green | 委員会承認 |
| `rejected` | 却下 | red | 委員会却下 |

---

### 1.6 作成者
| 項目名 | `createdBy` |
|--------|------|
| **型** | User |
| **データソース** | ProposalDocument.createdBy（Relation） |
| **説明** | 提案書を作成した管理職 |
| **実装状況** | ✅ 完了 |
| **表示場所** | ヘッダーの作成者情報 |
| **表示形式** | `作成者: {name}` |

---

### 1.7 作成日
| 項目名 | `createdDate` |
|--------|------|
| **型** | DateTime |
| **データソース** | ProposalDocument.createdAt |
| **説明** | 提案書の作成日時 |
| **実装状況** | ✅ 完了 |
| **デフォルト値** | now() |
| **表示場所** | ヘッダーの日付情報 |
| **表示形式** | `作成: 2025/10/26` |

---

## 2️⃣ 提案内容（自動生成）（6項目）

### 2.1 要約
| 項目名 | `summary` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.summary |
| **説明** | 提案の要約 |
| **実装状況** | ✅ 完了 |
| **生成方法** | generateProposalSummary(post) |
| **表示場所** | 提案内容セクション |

---

### 2.2 背景・経緯
| 項目名 | `background` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.background |
| **説明** | 提案の背景と経緯 |
| **実装状況** | ✅ 完了 |
| **生成方法** | generateBackground(post, voteAnalysis) |
| **表示場所** | 提案内容セクション |

---

### 2.3 目的
| 項目名 | `objectives` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.objectives |
| **説明** | 提案の目的 |
| **実装状況** | ✅ 完了 |
| **生成方法** | ProposalDocumentGenerator.generateObjectives(post) |
| **表示場所** | 提案内容セクション |

---

### 2.4 期待される効果
| 項目名 | `expectedEffects` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.expectedEffects |
| **説明** | 期待される効果・メリット |
| **実装状況** | ✅ 完了 |
| **生成方法** | generateExpectedEffects(post, commentAnalysis) |
| **表示場所** | 提案内容セクション |

---

### 2.5 懸念点
| 項目名 | `concerns` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.concerns |
| **説明** | 提案に対する懸念点・リスク |
| **実装状況** | ✅ 完了 |
| **生成方法** | generateConcerns(commentAnalysis) |
| **表示場所** | 提案内容セクション |

---

### 2.6 対応策
| 項目名 | `counterMeasures` |
|--------|------|
| **型** | string |
| **データソース** | ProposalDocument.counterMeasures |
| **説明** | 懸念点への対応策 |
| **実装状況** | ✅ 完了 |
| **生成方法** | generateCounterMeasures(commentAnalysis) |
| **表示場所** | 提案内容セクション |

---

## 3️⃣ データ分析（3項目・JSON）

### 3.1 投票分析
| 項目名 | `voteAnalysis` |
|--------|------|
| **型** | Json（VoteAnalysis） |
| **データソース** | ProposalDocument.voteAnalysis |
| **説明** | 投票データの詳細分析 |
| **実装状況** | ✅ 完了 |
| **生成方法** | analyzeVotes(post) |
| **表示場所** | サイドバー「投票データ」 |

**VoteAnalysis構造**:
```typescript
{
  totalVotes: number;              // 総投票数
  supportRate: number;             // 支持率（%）
  strongSupportRate: number;       // 強い支持率（%）
  oppositionRate: number;          // 反対率（%）
  neutralRate: number;             // 中立率（%）
  byDepartment?: [...];           // 部署別分析
  byPosition?: [...];             // 職位別分析
  byStakeholder?: [...];          // ステークホルダー別分析
}
```

---

### 3.2 コメント分析
| 項目名 | `commentAnalysis` |
|--------|------|
| **型** | Json（CommentAnalysis） |
| **データソース** | ProposalDocument.commentAnalysis |
| **説明** | コメントデータの詳細分析 |
| **実装状況** | ✅ 完了 |
| **生成方法** | analyzeComments(post) |
| **表示場所** | サイドバー「コメント統計」 |

**CommentAnalysis構造**:
```typescript
{
  totalComments: number;           // 総コメント数
  supportComments: number;         // 賛成意見数
  concernComments: number;         // 懸念点数
  proposalComments: number;        // 建設的提案数
  supportSummary: string[];        // 賛成意見要約
  concernSummary: string[];        // 懸念点要約
  constructiveProposals: string[]; // 建設的提案
  keyComments: [...]               // 主要コメント
}
```

---

### 3.3 関連情報
| 項目名 | `relatedInfo` |
|--------|------|
| **型** | Json?（RelatedInfo） |
| **データソース** | ProposalDocument.relatedInfo |
| **説明** | 類似議題・関連部署等の情報 |
| **実装状況** | ✅ 完了 |
| **生成方法** | analyzeRelatedInfo(post) |
| **NULL許可** | ✅ Yes |

**RelatedInfo構造**:
```typescript
{
  similarPastAgendas?: [...];      // 類似の過去議題
  affectedDepartments?: [...];     // 関連部署への影響
  references?: [...];              // 参考資料
}
```

---

## 4️⃣ 管理職による追記（3項目）

### 4.1 補足説明
| 項目名 | `managerNotes` |
|--------|------|
| **型** | string? |
| **データソース** | ProposalDocument.managerNotes |
| **説明** | 管理職による補足説明 |
| **実装状況** | ✅ 完了 |
| **編集可能** | ✅ Yes（権限あれば） |
| **NULL許可** | ✅ Yes |
| **表示場所** | 管理職による補足セクション |
| **プレースホルダー** | "現場の状況や追加の背景情報を記入してください" |

---

### 4.2 追加の文脈
| 項目名 | `additionalContext` |
|--------|------|
| **型** | string? |
| **データソース** | ProposalDocument.additionalContext |
| **説明** | 委員会に伝えたい追加情報 |
| **実装状況** | ✅ 完了 |
| **編集可能** | ✅ Yes（権限あれば） |
| **NULL許可** | ✅ Yes |
| **表示場所** | 管理職による補足セクション |
| **プレースホルダー** | "委員会に伝えたい追加情報を記入してください" |

---

### 4.3 推奨レベル
| 項目名 | `recommendationLevel` |
|--------|------|
| **型** | enum?: 'strongly_recommend' \| 'recommend' \| 'neutral' \| 'not_recommend' |
| **データソース** | ProposalDocument.recommendationLevel |
| **説明** | 管理職による推奨度 |
| **実装状況** | ✅ 完了 |
| **編集可能** | ✅ Yes（権限あれば） |
| **NULL許可** | ✅ Yes |
| **デフォルト値** | 'recommend' |

**推奨レベル一覧**:
| 値 | 日本語表示 | 色 |
|----|----------|-----|
| `strongly_recommend` | 強く推奨 | green |
| `recommend` | 推奨 | blue |
| `neutral` | 中立 | gray |
| `not_recommend` | 推奨しない | orange |

---

## 5️⃣ 委員会提出情報（4項目）

### 5.1 提出先委員会
| 項目名 | `targetCommittee` |
|--------|------|
| **型** | string? |
| **データソース** | ProposalDocument.targetCommittee |
| **説明** | 提出先の委員会名 |
| **実装状況** | ✅ 完了 |
| **NULL許可** | ✅ Yes |
| **設定方法** | 自動設定（議題レベルに応じて） or 手動入力 |
| **表示場所** | ヘッダーのバッジ |
| **例** | "運営委員会"、"経営委員会" |

---

### 5.2 提出日
| 項目名 | `submittedDate` |
|--------|------|
| **型** | DateTime? |
| **データソース** | ProposalDocument.submittedDate |
| **説明** | 委員会に提出した日時 |
| **実装状況** | ✅ 完了 |
| **NULL許可** | ✅ Yes |
| **設定タイミング** | submitToCommittee()実行時 |

---

### 5.3 提出者
| 項目名 | `submittedBy` |
|--------|------|
| **型** | User? |
| **データソース** | ProposalDocument.submittedBy（Relation） |
| **説明** | 委員会に提出したユーザー |
| **実装状況** | ✅ 完了 |
| **NULL許可** | ✅ Yes |
| **権限要件** | Level 7+（委員会提出リクエスト機能） |

---

### 5.4 委員会決定
| 項目名 | `committeeDecision` |
|--------|------|
| **型** | Json? |
| **データソース** | ProposalDocument.committeeDecision |
| **説明** | 委員会の決定内容 |
| **実装状況** | ✅ 完了 |
| **NULL許可** | ✅ Yes |

**CommitteeDecision構造**:
```typescript
{
  status: 'approved' | 'rejected' | 'deferred';
  date: Date;
  reason?: string;
  nextSteps?: string;
}
```

---

## 6️⃣ 透明性ログ（8項目）

### 6.1 ログID
| 項目名 | `auditLog[].id` |
|--------|------|
| **型** | string |
| **データソース** | ProposalAuditLog.id |
| **説明** | 監査ログの一意識別子 |
| **実装状況** | ✅ 完了 |
| **生成方法** | cuid() |

---

### 6.2 タイムスタンプ
| 項目名 | `auditLog[].timestamp` |
|--------|------|
| **型** | DateTime |
| **データソース** | ProposalAuditLog.timestamp |
| **説明** | アクション実行日時 |
| **実装状況** | ✅ 完了 |
| **デフォルト値** | now() |
| **表示形式** | `2025/10/26 15:30:45` |

---

### 6.3 ユーザーID
| 項目名 | `auditLog[].userId` |
|--------|------|
| **型** | string |
| **データソース** | ProposalAuditLog.userId |
| **説明** | アクション実行者のユーザーID |
| **実装状況** | ✅ 完了 |

---

### 6.4 ユーザー名
| 項目名 | `auditLog[].userName` |
|--------|------|
| **型** | string |
| **データソース** | ProposalAuditLog.userName |
| **説明** | アクション実行者の氏名 |
| **実装状況** | ✅ 完了 |
| **表示場所** | 透明性ログリスト |

---

### 6.5 権限レベル
| 項目名 | `auditLog[].userLevel` |
|--------|------|
| **型** | Decimal |
| **データソース** | ProposalAuditLog.userLevel |
| **説明** | アクション実行者の権限レベル |
| **実装状況** | ✅ 完了 |
| **表示場所** | 透明性ログリスト（Lv.表示） |

---

### 6.6 アクション
| 項目名 | `auditLog[].action` |
|--------|------|
| **型** | string |
| **データソース** | ProposalAuditLog.action |
| **説明** | 実行されたアクション |
| **実装状況** | ✅ 完了 |

**アクション一覧**:
| 値 | 日本語表示 |
|----|----------|
| `created` | 作成 |
| `edited` | 編集 |
| `reviewed` | レビュー |
| `submitted` | 提出 |
| `approved` | 承認 |
| `rejected` | 却下 |
| `marked_candidate` | 候補マーク |
| `unmarked_candidate` | 候補マーク解除 |

---

### 6.7 詳細
| 項目名 | `auditLog[].details` |
|--------|------|
| **型** | string? |
| **データソース** | ProposalAuditLog.details |
| **説明** | アクションの詳細説明 |
| **実装状況** | ✅ 完了 |
| **NULL許可** | ✅ Yes |

---

### 6.8 変更フィールド
| 項目名 | `auditLog[].changedFields` |
|--------|------|
| **型** | Json? |
| **データソース** | ProposalAuditLog.changedFields |
| **説明** | 変更されたフィールドのリスト |
| **実装状況** | ✅ 完了 |
| **NULL許可** | ✅ Yes |

**ChangedFields構造**:
```typescript
{
  fields: string[];              // 変更フィールド名のリスト
}
```

---

## 7️⃣ UI状態（3項目）

### 7.1 編集モード
| 項目名 | `isEditing` |
|--------|------|
| **型** | boolean |
| **データソース** | React state |
| **説明** | 管理職補足セクションが編集モードか |
| **実装状況** | ✅ 完了 |
| **デフォルト値** | false |

---

### 7.2 編集中フィールド
| 項目名 | `editedFields` |
|--------|------|
| **型** | object |
| **データソース** | React state |
| **説明** | 編集中のフィールド値 |
| **実装状況** | ✅ 完了 |

**EditedFields構造**:
```typescript
{
  managerNotes: string;
  additionalContext: string;
  recommendationLevel: RecommendationLevel;
}
```

---

### 7.3 読み込み中
| 項目名 | `loading` |
|--------|------|
| **型** | boolean |
| **データソース** | React state |
| **説明** | データ読み込み中フラグ |
| **実装状況** | ✅ 完了 |
| **デフォルト値** | false |
| **表示条件** | ProposalDocument取得中 |

---

## 📊 サービス層マスターリスト

### 1. ProposalDocumentGenerator ✅
**ファイルパス**: `src/services/ProposalDocumentGenerator.ts` (333行)

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `generateDocument` | post, agendaLevel, createdBy | ProposalDocument | 議題提案書の自動生成 |
| `getDocument` | documentId | ProposalDocument? | 提案書取得 |
| `findDocumentByPostId` | postId | ProposalDocument? | 投稿IDから検索 |
| `updateDocument` | documentId, updates, updatedBy | ProposalDocument? | 提案書更新 |
| `updateStatus` | documentId, status, user | ProposalDocument? | ステータス更新 |
| `addManagerNotes` | documentId, notes, user | ProposalDocument? | 補足説明追加 |
| `setRecommendationLevel` | documentId, level, user | ProposalDocument? | 推奨レベル設定 |
| `submitToCommittee` | documentId, targetCommittee, submittedBy | ProposalDocument? | 委員会提出 |
| `markAsReviewed` | documentId, reviewer, notes? | ProposalDocument? | レビュー完了 |
| `markAsReady` | documentId, user | ProposalDocument? | 提出準備完了 |
| `getAllDocuments` | - | ProposalDocument[] | 全提案書取得 |
| `getDocumentsByUser` | userId | ProposalDocument[] | ユーザー別取得 |
| `getDocumentsByAgendaLevel` | level | ProposalDocument[] | レベル別取得 |
| `getDocumentsByStatus` | status | ProposalDocument[] | ステータス別取得 |

---

### 2. proposalDocumentService ✅
**ファイルパス**: `src/services/proposalDocumentService.ts` (456行)

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `canEditDocument` | userId, userLevel, document | Promise\<boolean\> | 編集権限チェック |
| `canViewDocument` | userLevel | boolean | 閲覧権限チェック |
| `detectChangedFields` | oldDocument, newData | {changedFields, previousValues, newValues} | 変更フィールド検出 |
| `createAuditLog` | data | Promise\<ProposalAuditLog\> | 監査ログ作成 |
| `getAuditLogs` | documentId, limit?, offset? | Promise\<{auditLogs, total}\> | 監査ログ取得 |
| `getDocumentWithPermission` | documentId, userId, userLevel | Promise\<{document, canEdit, canView}\> | 権限付き取得 |
| `updateDocumentWithAudit` | documentId, updateData, userId, userName, userLevel, ipAddress?, userAgent? | Promise\<{document, auditLog}\> | 監査ログ付き更新 |

---

### 3. ProposalAuditService ✅
**ファイルパス**: `src/services/ProposalAuditService.ts`

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `logCreated` | documentId, user, postId | void | 作成ログ記録 |
| `logEdited` | documentId, user, changedFields | void | 編集ログ記録 |
| `logReviewed` | documentId, user, notes? | void | レビューログ記録 |
| `logSubmitted` | documentId, user, targetCommittee | void | 提出ログ記録 |
| `getLogs` | documentId | ProposalAuditLog[] | ログ取得 |

---

### 4. ProposalPermissionService ✅
**ファイルパス**: `src/services/ProposalPermissionService.ts`

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `getResponsibility` | agendaLevel | {targetCommittee, approver, description} | 議題レベル別責任者取得 |
| `canSubmitToCommittee` | userLevel | boolean | 委員会提出権限（Level 7+） |
| `canApproveSubmission` | userLevel | boolean | 提出承認権限（Level 12+） |

---

### 5. committeeSubmissionService ✅
| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `createSubmissionRequest` | documentId, targetCommittee, requestedBy | CommitteeSubmissionRequest | 提出リクエスト作成 |

---

## 🗄️ テーブル・フィールドマスターリスト

### 1. ProposalDocumentテーブル
**ファイルパス**: `prisma/schema.prisma` (lines 2417-2455)

| フィールド名 | 型 | デフォルト値 | NULL許可 | インデックス | 説明 |
|-----------|---|------------|---------|-----------|------|
| `id` | String | cuid() | ❌ | PRIMARY | 提案書ID |
| `postId` | String | - | ❌ | ✅ | 元投稿ID |
| `title` | String | - | ❌ | ❌ | タイトル |
| `agendaLevel` | String | - | ❌ | ✅ | 議題レベル |
| `createdById` | String | - | ❌ | ✅ | 作成者ID |
| `status` | String | "draft" | ❌ | ✅ | ステータス |
| `summary` | String | - | ❌ | ❌ | 要約 |
| `background` | String | - | ❌ | ❌ | 背景・経緯 |
| `objectives` | String | - | ❌ | ❌ | 目的 |
| `expectedEffects` | String | - | ❌ | ❌ | 期待される効果 |
| `concerns` | String | - | ❌ | ❌ | 懸念点 |
| `counterMeasures` | String | - | ❌ | ❌ | 対応策 |
| `voteAnalysis` | Json | - | ❌ | ❌ | 投票分析 |
| `commentAnalysis` | Json | - | ❌ | ❌ | コメント分析 |
| `relatedInfo` | Json? | null | ✅ | ❌ | 関連情報 |
| `managerNotes` | String? | null | ✅ | ❌ | 補足説明 |
| `additionalContext` | String? | null | ✅ | ❌ | 追加の文脈 |
| `recommendationLevel` | String? | null | ✅ | ❌ | 推奨レベル |
| `targetCommittee` | String? | null | ✅ | ✅ | 提出先委員会 |
| `submittedDate` | DateTime? | null | ✅ | ❌ | 提出日 |
| `submittedById` | String? | null | ✅ | ❌ | 提出者ID |
| `committeeDecision` | Json? | null | ✅ | ❌ | 委員会決定 |
| `createdAt` | DateTime | now() | ❌ | ❌ | 作成日時 |
| `updatedAt` | DateTime | - | ❌ | ❌ | 更新日時 |
| `lastModifiedDate` | DateTime | - | ❌ | ❌ | 最終更新日時 |

**評価**: ✅ **全フィールド実装済み**

---

### 2. ProposalAuditLogテーブル
**ファイルパス**: `prisma/schema.prisma` (lines 2483-2499)

| フィールド名 | 型 | デフォルト値 | NULL許可 | インデックス | 説明 |
|-----------|---|------------|---------|-----------|------|
| `id` | String | cuid() | ❌ | PRIMARY | ログID |
| `documentId` | String | - | ❌ | ✅ | 提案書ID |
| `userId` | String | - | ❌ | ✅ | ユーザーID |
| `userName` | String | - | ❌ | ❌ | ユーザー名 |
| `userLevel` | Decimal | - | ❌ | ❌ | 権限レベル |
| `action` | String | - | ❌ | ❌ | アクション |
| `details` | String? | null | ✅ | ❌ | 詳細 |
| `changedFields` | Json? | null | ✅ | ❌ | 変更フィールド |
| `timestamp` | DateTime | now() | ❌ | ✅ | タイムスタンプ |

**評価**: ✅ **全フィールド実装済み**

---

### 3. CommitteeSubmissionRequestテーブル
**ファイルパス**: `prisma/schema.prisma` (lines 2458-2480)

| フィールド名 | 型 | デフォルト値 | NULL許可 | インデックス | 説明 |
|-----------|---|------------|---------|-----------|------|
| `id` | String | cuid() | ❌ | PRIMARY | リクエストID |
| `documentId` | String | - | ❌ | ✅ | 提案書ID |
| `requestedById` | String | - | ❌ | ✅ | リクエスター |
| `requestedDate` | DateTime | now() | ❌ | ❌ | リクエスト日 |
| `targetCommittee` | String | - | ❌ | ✅ | 提出先委員会 |
| `status` | String | "pending" | ❌ | ✅ | ステータス |
| `reviewedById` | String? | null | ✅ | ✅ | レビュアーID |
| `reviewedDate` | DateTime? | null | ✅ | ❌ | レビュー日 |
| `reviewNotes` | String? | null | ✅ | ❌ | レビューノート |
| `createdAt` | DateTime | now() | ❌ | ❌ | 作成日時 |
| `updatedAt` | DateTime | - | ❌ | ❌ | 更新日時 |

**評価**: ✅ **全フィールド実装済み**

---

## ✅ 実装チェックリスト

### データベース
- [x] ProposalDocumentテーブル実装
- [x] ProposalAuditLogテーブル実装
- [x] CommitteeSubmissionRequestテーブル実装
- [x] 全フィールド実装
- [x] 全インデックス設定
- [x] Relationマッピング

### サービス層
- [x] ProposalDocumentGenerator実装
- [x] proposalDocumentService実装
- [x] ProposalAuditService実装
- [x] ProposalPermissionService実装
- [x] committeeSubmissionService実装

### ページ実装
- [x] ProposalDocumentEditor.tsx実装
- [x] 全セクション実装
- [x] 編集機能実装
- [x] アクション機能実装
- [x] 権限制御実装

### 分析・生成機能
- [x] analyzeVotes()実装
- [x] analyzeComments()実装
- [x] analyzeRelatedInfo()実装
- [x] generateProposalSummary()実装
- [x] generateBackground()実装
- [x] generateExpectedEffects()実装
- [x] generateConcerns()実装
- [x] generateCounterMeasures()実装

---

## 📝 schema.prisma更新の必要性

**結論**: ❌ **更新不要**

全ての必要テーブル・フィールドが既に存在しており、schema.prismaの更新は必要ありません。

---

## 🔗 関連ドキュメント

1. [ProposalDocumentEditor_DB要件分析_20251026.md](./ProposalDocumentEditor_DB要件分析_20251026.md) - DB要件分析
2. [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ管理責任
3. [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md) - PersonalStation参考事例

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: 機能追加時
