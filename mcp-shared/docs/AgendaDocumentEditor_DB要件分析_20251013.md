# AgendaDocumentEditor コンポーネント DB要件分析

**作成日**: 2025年10月13日
**コンポーネントパス**: src/components/proposal/AgendaDocumentEditor.tsx
**対象ユーザー**: Level 9以上（課長・部長・施設長・経営層）

---

## 1. コンポーネント概要

### 1.1 機能概要
議題提案書を編集・管理するためのリッチテキストエディターコンポーネント。提案が委員会に提出される際に使用され、自動生成された議題書類を編集可能。

### 1.2 主要機能
- 議題提案書の自動生成（ProposalEscalationEngineと連携）
- セクション別編集（タイトル、背景、提案内容、期待効果、予算、投票サマリー）
- 編集履歴の記録・表示
- 未保存変更の検知
- PDF/Wordエクスポート機能
- リアルタイムプレビュー

### 1.3 権限レベル
- **Level 9-10**: 課長・部長（自部署の提案のみ編集可）
- **Level 11**: 施設長（自施設の提案のみ編集可）
- **Level 12-17**: 経営層（権限範囲内の提案を編集可）
- **Level 18**: 理事長・法人事務局長（すべての提案を編集可）

---

## 2. 現在の実装状況

### 2.1 フロントエンド実装
**ファイル**: [src/components/proposal/AgendaDocumentEditor.tsx](../../src/components/proposal/AgendaDocumentEditor.tsx)

**実装状況**: ✅ 完全実装済み（384行）

**使用中のデータ構造**:
```typescript
interface EditableAgendaDocument {
  proposalId: string;
  committeeId: string;
  documentType: string;
  content: string;
  editedSections: {
    [key: string]: {
      original: string;
      edited: string;
      editedAt: Date;
      editedBy?: string;
    };
  };
  generatedAt: Date;
  lastEditedAt?: Date;
}

interface EditableSection {
  id: string;           // セクションID（title, background, content等）
  label: string;        // 表示ラベル
  value: string;        // 現在の値
  multiline?: boolean;  // 複数行テキストか
  required?: boolean;   // 必須項目か
}
```

**編集可能セクション**:
1. `title` - 議題名（必須、単一行）
2. `background` - 背景・現状の課題（任意、複数行）
3. `content` - 提案内容（必須、複数行）
4. `expectedEffect` - 期待される効果（任意、複数行）
5. `budget` - 必要予算（任意、単一行）
6. `votingSummary` - 投票結果サマリー（自動生成、複数行）

**現在のデータソース**: ProposalEscalationEngine経由で動的生成

### 2.2 サービス層実装
**ファイル**: [src/services/ProposalEscalationEngine.ts](../../src/services/ProposalEscalationEngine.ts)

**実装済み機能**:
- `generateAgendaDocument()` - 議題提案書の自動生成
- `determineTargetCommittee()` - 対象委員会の判定
- `getDocumentTemplate()` - 委員会別テンプレート取得

**委員会マスター**（ハードコード）:
1. 医療安全管理委員会（第2火曜日）
2. 感染対策委員会（第3水曜日）
3. 業務改善委員会（第4木曜日）
4. 小原病院運営委員会（月2回）
5. 病院意思決定会議（月1回）

### 2.3 データベース実装
**ファイル**: [prisma/schema.prisma](../../prisma/schema.prisma:2293-2340)

**実装状況**: ✅ 関連テーブルすべて実装済み

#### テーブル1: ProposalDocument（提案書類）
```prisma
model ProposalDocument {
  id                  String    @id @default(cuid())
  postId              String    @map("post_id")
  title               String
  agendaLevel         String    @map("agenda_level")
  createdById         String    @map("created_by_id")
  status              String    @default("draft")
  summary             String
  background          String
  objectives          String
  expectedEffects     String    @map("expected_effects")
  concerns            String
  counterMeasures     String    @map("counter_measures")
  voteAnalysis        Json      @map("vote_analysis")
  commentAnalysis     Json      @map("comment_analysis")
  relatedInfo         Json?     @map("related_info")
  managerNotes        String?   @map("manager_notes")
  additionalContext   String?   @map("additional_context")
  recommendationLevel String?   @map("recommendation_level")
  targetCommittee     String?   @map("target_committee")
  submittedDate       DateTime? @map("submitted_date")
  submittedById       String?   @map("submitted_by_id")
  committeeDecision   Json?     @map("committee_decision")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  lastModifiedDate    DateTime  @updatedAt @map("last_modified_date")

  // リレーション
  submissionRequests  CommitteeSubmissionRequest[]
  auditLogs           ProposalAuditLog[]
  submittedBy         User?     @relation("ProposalSubmitter", fields: [submittedById], references: [id])
  createdBy           User      @relation("ProposalCreator", fields: [createdById], references: [id])
  post                Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([status])
  @@index([agendaLevel])
  @@index([createdById])
  @@index([targetCommittee])
  @@map("proposal_documents")
}
```

**重要な設計ポイント**:
- ✅ `editedSections` はフロントエンドのみで管理（DBには保存しない）
- ✅ 編集履歴は `ProposalAuditLog` テーブルで管理
- ✅ `lastModifiedDate` で最終編集日時を記録
- ✅ `status` でドラフト/提出済み/承認済みを管理

#### テーブル2: ProposalAuditLog（提案書類監査ログ）
```prisma
model ProposalAuditLog {
  id             String           @id @default(cuid())
  documentId     String           @map("document_id")
  action         String           // 'CREATED', 'UPDATED', 'SUBMITTED', 'EXPORTED'
  userId         String           @map("user_id")
  userName       String           @map("user_name")
  userLevel      Int              @map("user_level")
  changedFields  Json             @map("changed_fields") // 変更されたフィールドの詳細
  previousValues Json?            // 変更前の値
  newValues      Json?            // 変更後の値
  ipAddress      String?          @map("ip_address")
  userAgent      String?          @map("user_agent")
  timestamp      DateTime         @default(now())

  // リレーション
  document       ProposalDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([userId])
  @@index([timestamp])
  @@map("proposal_audit_logs")
}
```

**監査ログの記録タイミング**:
1. ドキュメント作成時（action: 'CREATED'）
2. セクション編集時（action: 'UPDATED'）
3. 委員会提出時（action: 'SUBMITTED'）
4. PDF/Word エクスポート時（action: 'EXPORTED'）

#### テーブル3: CommitteeInfo（委員会情報）
**実装状況**: ❌ 未実装（ProposalEscalationEngineにハードコード）

**必要性**: △ 当面はハードコードで運用可能だが、将来的にDB化推奨

---

## 3. データ管理境界の明確化

### 3.1 医療職員管理システムが管理するデータ
- ❌ なし（議題提案書はVoiceDrive固有データ）

### 3.2 VoiceDriveが管理するデータ
- ✅ 提案書類（ProposalDocument）
- ✅ 編集履歴（ProposalAuditLog）
- ✅ 委員会情報（現在はハードコード、将来的にDB化）
- ✅ 文書テンプレート（現在はコードに埋め込み）

### 3.3 医療職員管理システムから取得するマスターデータ
- ユーザーマスター（userId, userName, permissionLevel）- 編集者情報用
- 部署マスター（departmentId, departmentName）- 提案者情報用
- 施設マスター（facilityId, facilityName）- 委員会所属施設用

**取得方法**: MCPサーバー経由でキャッシュ済みデータを参照

---

## 4. 必要なAPI一覧

### 4.1 議題提案書取得API
**エンドポイント**: `GET /api/proposal-documents/:documentId`

**レスポンス**:
```typescript
{
  success: true,
  data: {
    document: ProposalDocument,
    canEdit: boolean,     // 編集権限の有無
    editHistory: Array<{  // 最近の編集履歴（監査ログから）
      action: string,
      userName: string,
      timestamp: string,
      changedFields: string[]
    }>
  }
}
```

**実装ファイル**: `src/api/routes/proposal-documents.routes.ts` (未作成)

### 4.2 議題提案書更新API
**エンドポイント**: `PUT /api/proposal-documents/:documentId`

**リクエストボディ**:
```typescript
{
  title?: string,
  background?: string,
  objectives?: string,
  expectedEffects?: string,
  concerns?: string,
  counterMeasures?: string,
  managerNotes?: string,
  additionalContext?: string,
  userId: string,              // 編集者
  changedFields: string[]      // 変更されたフィールドのリスト
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    document: ProposalDocument,
    auditLog: ProposalAuditLog  // 作成された監査ログ
  }
}
```

**自動処理**:
- ProposalDocumentの該当フィールド更新
- `lastModifiedDate` を現在時刻に更新
- ProposalAuditLogに編集履歴を記録（action: 'UPDATED'）

**実装ファイル**: `src/api/routes/proposal-documents.routes.ts` (未作成)

### 4.3 議題提案書作成API
**エンドポイント**: `POST /api/proposal-documents`

**リクエストボディ**:
```typescript
{
  postId: string,              // 元の提案（Post）ID
  title: string,
  agendaLevel: string,         // '施設議題', '法人議題'等
  summary: string,
  background: string,
  objectives: string,
  expectedEffects: string,
  concerns: string,
  counterMeasures: string,
  voteAnalysis: object,        // 投票分析データ（JSON）
  commentAnalysis: object,     // コメント分析データ（JSON）
  targetCommittee?: string,    // 対象委員会
  userId: string               // 作成者
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    document: ProposalDocument,
    auditLog: ProposalAuditLog
  }
}
```

**自動処理**:
- ProposalDocumentレコード作成（status: 'draft'）
- ProposalAuditLogに作成履歴を記録（action: 'CREATED'）

**実装ファイル**: `src/api/routes/proposal-documents.routes.ts` (未作成)

### 4.4 議題提案書エクスポートAPI
**エンドポイント**: `POST /api/proposal-documents/:documentId/export`

**リクエストボディ**:
```typescript
{
  format: 'pdf' | 'word',
  userId: string
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    downloadUrl: string,     // エクスポートされたファイルのURL
    fileName: string,
    fileSize: number,
    expiresAt: string        // ダウンロード期限
  }
}
```

**自動処理**:
- テンプレートエンジン使用してPDF/Word生成
- 一時ファイル保存（24時間後に自動削除）
- ProposalAuditLogにエクスポート履歴を記録（action: 'EXPORTED'）

**実装ファイル**: `src/api/routes/proposal-documents.routes.ts` (未作成)

### 4.5 編集履歴取得API
**エンドポイント**: `GET /api/proposal-documents/:documentId/audit-logs`

**クエリパラメータ**:
```typescript
{
  limit?: number,    // 取得件数（デフォルト: 50）
  offset?: number    // オフセット（デフォルト: 0）
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    auditLogs: Array<ProposalAuditLog>,
    pagination: {
      total: number,
      limit: number,
      offset: number,
      hasMore: boolean
    }
  }
}
```

**実装ファイル**: `src/api/routes/proposal-documents.routes.ts` (未作成)

---

## 5. 不足している項目の特定

### 5.1 データベーステーブル
✅ **不足なし** - 必要なテーブルはすべて実装済み
- ProposalDocument ✅
- ProposalAuditLog ✅

**推奨追加テーブル**（優先度: 低）:
- CommitteeInfo（委員会マスター）- 現在はハードコード
- DocumentTemplate（文書テンプレートマスター）- 現在はコードに埋め込み

### 5.2 フィールド
✅ **不足なし** - 必要なフィールドすべて実装済み

**現在のProposalDocumentに不足しているフィールド（AgendaDocumentEditorで使用）**:
実際には不足していません。フロントエンドの`EditableAgendaDocument`型とDBスキーマの対応：

| フロントエンド | DBスキーマ | 備考 |
|-------------|-----------|------|
| proposalId | postId | Postテーブルへの参照 |
| committeeId | targetCommittee | 委員会名 |
| documentType | (固定値) | '議題提案書' |
| content | title + background + objectives等 | 複数フィールドから構成 |
| editedSections | (フロントエンドのみ) | DBには保存しない |
| generatedAt | createdAt | 作成日時 |
| lastEditedAt | lastModifiedDate | 最終編集日時 |

### 5.3 API
❌ **5つのAPIすべてが未実装**
1. GET /api/proposal-documents/:documentId
2. PUT /api/proposal-documents/:documentId
3. POST /api/proposal-documents
4. POST /api/proposal-documents/:documentId/export
5. GET /api/proposal-documents/:documentId/audit-logs

### 5.4 サービス層
△ **一部実装済み、追加実装必要**

**既存**（ProposalEscalationEngine）:
- ✅ `generateAgendaDocument()` - 文書自動生成
- ✅ `determineTargetCommittee()` - 委員会判定

**追加必要**:
- ❌ PDF生成サービス
- ❌ Word生成サービス
- ❌ 権限チェックサービス
- ❌ 監査ログ記録サービス

---

## 6. 実装計画

### Phase 1: APIルート実装（2-3日）

#### ファイル: `src/api/routes/proposal-documents.routes.ts`
```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/proposal-documents/:documentId
router.get('/proposal-documents/:documentId', async (req, res) => {
  // 提案書類取得 + 編集権限チェック + 最近の編集履歴取得
});

// PUT /api/proposal-documents/:documentId
router.put('/proposal-documents/:documentId', async (req, res) => {
  // 提案書類更新 + 監査ログ作成
});

// POST /api/proposal-documents
router.post('/proposal-documents', async (req, res) => {
  // 提案書類作成 + 監査ログ作成
});

// POST /api/proposal-documents/:documentId/export
router.post('/proposal-documents/:documentId/export', async (req, res) => {
  // PDF/Word生成 + 監査ログ作成
});

// GET /api/proposal-documents/:documentId/audit-logs
router.get('/proposal-documents/:documentId/audit-logs', async (req, res) => {
  // 編集履歴取得
});

export default router;
```

### Phase 2: サービス層実装（2-3日）

#### ファイル1: `src/services/proposalDocumentService.ts`
```typescript
// 権限チェック
export function canEditDocument(
  userId: string,
  userLevel: number,
  document: ProposalDocument
): boolean;

// 監査ログ作成
export async function createAuditLog(
  documentId: string,
  action: string,
  userId: string,
  changedFields: object
): Promise<ProposalAuditLog>;
```

#### ファイル2: `src/services/documentExportService.ts`
```typescript
import PDFDocument from 'pdfkit';
import { Document as DocxDocument } from 'docx';

// PDF生成
export async function generatePDF(
  document: ProposalDocument
): Promise<Buffer>;

// Word生成
export async function generateWord(
  document: ProposalDocument
): Promise<Buffer>;
```

### Phase 3: フロントエンド統合（1-2日）
**ファイル**: `src/components/proposal/AgendaDocumentEditor.tsx`

**変更内容**:
- `onSave` コールバックをAPI呼び出しに置き換え
- `onExport` コールバックをAPI呼び出しに置き換え
- 初期データ読み込みをAPIから取得
- ローディング状態・エラーハンドリング追加

### Phase 4: テスト実装（1-2日）
**ファイル**: `src/tests/proposal-document-api.test.ts`

**テストケース**:
1. 提案書類の取得
2. 提案書類の更新と監査ログ作成
3. 提案書類の新規作成
4. PDF/Wordエクスポート
5. 編集履歴の取得
6. 権限チェック（編集可能/不可）

---

## 7. スキーマ更新の必要性

### 結論: ❌ **スキーマ更新不要**

**理由**:
- 必要なテーブル（ProposalDocument, ProposalAuditLog）がすべて実装済み
- 必要なフィールドがすべて定義済み
- インデックスが適切に設定済み
- リレーションが正しく定義済み

**将来的な拡張候補**（優先度: 低）:
```prisma
// 委員会マスター（現在はProposalEscalationEngineにハードコード）
model CommitteeInfo {
  id              String   @id @default(cuid())
  name            String   @unique
  schedule        String   // '第2火曜日'等
  facilityId      String
  targetCategories Json    // ['医療安全', '患者安全']
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([facilityId])
  @@index([isActive])
  @@map("committee_info")
}

// 文書テンプレートマスター（現在はProposalEscalationEngineにハードコード）
model DocumentTemplate {
  id          String   @id @default(cuid())
  name        String
  type        String   // 'agenda_proposal', 'committee_minutes'等
  template    String   // テンプレート本文（プレースホルダー含む）
  committeeId String?  // 特定の委員会専用テンプレート
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([type])
  @@index([isActive])
  @@map("document_templates")
}
```

---

## 8. まとめ

### 8.1 実装完了項目
✅ データベーススキーマ（ProposalDocument, ProposalAuditLog）
✅ フロントエンドコンポーネント（完全実装、現在はローカル状態管理）
✅ サービス層（部分実装、文書生成ロジック）

### 8.2 実装必要項目
❌ APIルート（5つのエンドポイント）
❌ サービス層追加（PDF/Word生成、権限チェック、監査ログ）
❌ フロントエンド統合（モックからAPI呼び出しへの置き換え）
❌ テストコード

### 8.3 推定実装工数
- **APIルート**: 2-3日
- **サービス層追加**: 2-3日
- **フロントエンド統合**: 1-2日
- **テスト実装**: 1-2日
- **合計**: 6-10日

### 8.4 優先度
**中**: 議題提案書の編集機能は重要だが、現在はローカル状態で動作している。API化により以下のメリットが得られる：
- 編集履歴の永続化
- 複数ユーザー間での編集競合検知
- 権限ベースのアクセス制御
- PDF/Wordエクスポートの実装

---

## 9. 付録

### 9.1 編集可能セクション一覧
| セクションID | ラベル | 必須 | 複数行 |
|-------------|--------|-----|--------|
| title | 議題名 | ✅ | ❌ |
| background | 背景・現状の課題 | ❌ | ✅ |
| content | 提案内容 | ✅ | ✅ |
| expectedEffect | 期待される効果 | ❌ | ✅ |
| budget | 必要予算 | ❌ | ❌ |
| votingSummary | 投票結果サマリー | ❌ | ✅ |

### 9.2 監査ログアクション一覧
- `CREATED` - 文書作成
- `UPDATED` - フィールド更新
- `SUBMITTED` - 委員会提出
- `EXPORTED` - PDF/Wordエクスポート

### 9.3 文書ステータス
- `draft` - ドラフト（編集中）
- `submitted` - 委員会提出済み
- `approved` - 委員会承認済み
- `rejected` - 委員会却下
- `archived` - アーカイブ済み

---

**文書作成者**: Claude (VoiceDrive開発AI)
**最終更新**: 2025年10月13日
