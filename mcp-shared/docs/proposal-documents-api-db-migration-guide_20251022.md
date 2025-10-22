# 議題提案書API DB構築時実装作業再開ガイド

**文書番号**: DB-MIGRATION-PD-API-2025-1022-001
**作成日**: 2025年10月22日
**対象API**: 議題提案書API（Proposal Documents API）
**目的**: DB構築後のスムーズな実装再開

---

## 📋 現在の実装状態（2025年10月22日時点）

### ✅ 完了している実装

#### 1. APIルート層（変更不要）
```
src/api/routes/proposal-documents.routes.ts (379行)
```
**実装済みエンドポイント**:
- GET /api/proposal-documents/:documentId
- PUT /api/proposal-documents/:documentId
- POST /api/proposal-documents/:documentId/mark-ready
- POST /api/committee-submission-requests
- GET /api/proposal-documents/:documentId/audit-logs

**状態**: ✅ 本番用実装完了（DB構築後も変更不要）

#### 2. サービス層（メモリ内で動作中）
```
src/services/ProposalDocumentGenerator.ts (333行)
src/services/CommitteeSubmissionService.ts (218行)
src/services/ProposalAuditService.ts
```
**状態**: ✅ メモリ内で動作中（DB構築後にPrismaに切り替え）

#### 3. データベーススキーマ
```
prisma/schema.prisma
```
**実装済みテーブル**:
- ✅ ProposalDocument（全25フィールド）
- ✅ CommitteeSubmissionRequest（全11フィールド）
- ✅ ProposalAuditLog（全9フィールド）

**状態**: ✅ スキーマ定義完了（マイグレーション未実行）

#### 4. テスト
```
src/tests/proposal-documents-api.test.ts (333行)
```
**状態**: ✅ 19個のテストケース実装済み

---

## 🎯 DB構築後の実装作業（3ステップ）

### Phase 1: Prismaマイグレーション実行（所要時間: 5分）

#### ステップ1-1: マイグレーション実行
```bash
cd c:\projects\voicedrive-v100
npx prisma migrate dev --name add_proposal_documents
```

#### ステップ1-2: Prisma Clientの生成
```bash
npx prisma generate
```

#### ステップ1-3: マイグレーション確認
```bash
npx prisma studio
```
ブラウザで以下のテーブルが表示されることを確認:
- ✅ ProposalDocument
- ✅ CommitteeSubmissionRequest
- ✅ ProposalAuditLog

---

### Phase 2: サービス層のPrisma切り替え（所要時間: 30分）

#### ファイル1: ProposalDocumentGenerator.ts

**変更箇所**: `src/services/ProposalDocumentGenerator.ts`

##### 変更1: インポート追加

```typescript
// ファイル冒頭に追加
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

##### 変更2: データストレージの切り替え

```typescript
// 【変更前】メモリ内Map
export class ProposalDocumentGenerator {
  private documents: Map<string, ProposalDocument> = new Map();

  public getDocument(documentId: string): ProposalDocument | undefined {
    return this.documents.get(documentId);
  }
}

// 【変更後】Prisma使用
export class ProposalDocumentGenerator {
  // private documents: Map<string, ProposalDocument> = new Map(); ← 削除

  public async getDocument(documentId: string): Promise<ProposalDocument | null> {
    return await prisma.proposalDocument.findUnique({
      where: { id: documentId },
      include: {
        createdBy: true,
        submittedBy: true,
        post: {
          include: {
            author: true,
            votes: true,
            comments: true
          }
        }
      }
    });
  }
}
```

##### 変更3: generateDocument メソッド

```typescript
// 【変更前】
public generateDocument(
  post: Post,
  agendaLevel: AgendaLevel,
  createdBy: User
): ProposalDocument {
  // ... 省略 ...

  this.documents.set(documentId, document);
  return document;
}

// 【変更後】
public async generateDocument(
  post: Post,
  agendaLevel: AgendaLevel,
  createdBy: User
): Promise<ProposalDocument> {
  // ... 省略（document作成ロジックは同じ）...

  const savedDocument = await prisma.proposalDocument.create({
    data: {
      id: documentId,
      postId: post.id,
      title: this.generateTitle(post),
      agendaLevel,
      createdById: createdBy.id,
      status: 'draft',
      summary: generateProposalSummary(post),
      background: generateBackground(post, voteAnalysis),
      objectives: this.generateObjectives(post),
      expectedEffects: generateExpectedEffects(post, commentAnalysis),
      concerns: generateConcerns(commentAnalysis),
      counterMeasures: generateCounterMeasures(commentAnalysis),
      voteAnalysis: voteAnalysis as any, // Prisma JsonValue
      commentAnalysis: commentAnalysis as any,
      relatedInfo: relatedInfo as any,
      targetCommittee,
      lastModifiedDate: now
    },
    include: {
      createdBy: true,
      post: true
    }
  });

  // 監査ログ記録
  await proposalAuditService.logCreated(documentId, createdBy, post.id);

  return savedDocument as ProposalDocument;
}
```

##### 変更4: updateDocument メソッド

```typescript
// 【変更前】
public updateDocument(
  documentId: string,
  updates: Partial<ProposalDocument>,
  updatedBy: User
): ProposalDocument | undefined {
  const document = this.documents.get(documentId);
  if (!document) return undefined;

  const updatedDocument: ProposalDocument = {
    ...document,
    ...updates,
    lastModifiedDate: new Date()
  };

  this.documents.set(documentId, updatedDocument);
  return updatedDocument;
}

// 【変更後】
public async updateDocument(
  documentId: string,
  updates: Partial<ProposalDocument>,
  updatedBy: User
): Promise<ProposalDocument | null> {
  const document = await this.getDocument(documentId);
  if (!document) return null;

  // 変更されたフィールドを記録
  const changedFields = Object.keys(updates).filter(
    key => key !== 'lastModifiedDate' && key !== 'auditLog'
  );

  const updatedDocument = await prisma.proposalDocument.update({
    where: { id: documentId },
    data: {
      ...updates,
      lastModifiedDate: new Date()
    },
    include: {
      createdBy: true,
      submittedBy: true,
      post: true
    }
  });

  // 監査ログ記録
  await proposalAuditService.logEdited(documentId, updatedBy, changedFields);

  return updatedDocument as ProposalDocument;
}
```

##### 変更5: その他のメソッド

全てのメソッドを非同期（async/await）に変更:
- `markAsReady()` → `async markAsReady()`
- `submitToCommittee()` → `async submitToCommittee()`
- `getAllDocuments()` → `async getAllDocuments()`
- `getDocumentsByUser()` → `async getDocumentsByUser()`
- `getDocumentsByAgendaLevel()` → `async getDocumentsByAgendaLevel()`
- `getDocumentsByStatus()` → `async getDocumentsByStatus()`

---

#### ファイル2: CommitteeSubmissionService.ts

**変更箇所**: `src/services/CommitteeSubmissionService.ts`

##### 変更1: インポート追加

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

##### 変更2: createSubmissionRequest メソッド

```typescript
// 【変更前】
public createSubmissionRequest(
  documentId: string,
  targetCommittee: string,
  requestedBy: User
): SubmissionRequest | undefined {
  // ... 検証ロジック ...

  const request: SubmissionRequest = { /* ... */ };
  this.submissionRequests.set(requestId, request);
  return request;
}

// 【変更後】
public async createSubmissionRequest(
  documentId: string,
  targetCommittee: string,
  requestedBy: User
): Promise<SubmissionRequest | null> {
  // ... 検証ロジック（同じ）...

  const savedRequest = await prisma.committeeSubmissionRequest.create({
    data: {
      documentId,
      targetCommittee,
      requestedById: requestedBy.id,
      status: 'pending'
    },
    include: {
      requestedBy: true,
      document: {
        include: {
          createdBy: true,
          post: true
        }
      }
    }
  });

  return savedRequest as SubmissionRequest;
}
```

##### 変更3: approveSubmissionRequest メソッド

```typescript
// 【変更後】
public async approveSubmissionRequest(
  requestId: string,
  approver: User,
  notes?: string
): Promise<SubmissionRequest | null> {
  // ... 権限チェック（同じ）...

  const updatedRequest = await prisma.committeeSubmissionRequest.update({
    where: { id: requestId },
    data: {
      status: 'approved',
      reviewedById: approver.id,
      reviewedDate: new Date(),
      reviewNotes: notes
    },
    include: {
      requestedBy: true,
      reviewedBy: true,
      document: true
    }
  });

  // 議題提案書を委員会に提出
  await proposalDocumentGenerator.submitToCommittee(
    updatedRequest.documentId,
    updatedRequest.targetCommittee,
    approver
  );

  return updatedRequest as SubmissionRequest;
}
```

---

#### ファイル3: ProposalAuditService.ts

**変更箇所**: `src/services/ProposalAuditService.ts`

##### 変更1: logCreated メソッド

```typescript
// 【変更前】
public logCreated(documentId: string, user: User, postId: string): void {
  const log: ProposalAuditLog = { /* ... */ };
  this.logs.push(log);
}

// 【変更後】
public async logCreated(documentId: string, user: User, postId: string): Promise<void> {
  await prisma.proposalAuditLog.create({
    data: {
      documentId,
      userId: user.id,
      userName: user.name,
      userLevel: user.permissionLevel,
      action: 'created',
      details: `投稿${postId}から議題提案書を自動生成`
    }
  });
}
```

##### 変更2: getLogs メソッド

```typescript
// 【変更後】
public async getLogs(documentId: string): Promise<ProposalAuditLog[]> {
  return await prisma.proposalAuditLog.findMany({
    where: { documentId },
    orderBy: { timestamp: 'desc' }
  });
}
```

---

### Phase 3: APIルートの非同期対応（所要時間: 15分）

**変更箇所**: `src/api/routes/proposal-documents.routes.ts`

#### 変更1: GET /api/proposal-documents/:documentId

```typescript
// 【変更前】
router.get('/:documentId', (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = proposalDocumentGenerator.getDocument(documentId);
    // ...
  } catch (error: any) {
    // ...
  }
});

// 【変更後】async/await追加
router.get('/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = await proposalDocumentGenerator.getDocument(documentId);

    if (!document) {
      return res.status(404).json({ /* ... */ });
    }

    // 監査ログを取得
    const auditLogs = await proposalAuditService.getLogs(documentId);

    res.json({
      ...document,
      auditLog: auditLogs
    });
  } catch (error: any) {
    console.error('議題提案書取得エラー:', error);
    res.status(500).json({ /* ... */ });
  }
});
```

#### 変更2: PUT /api/proposal-documents/:documentId

```typescript
// 【変更後】
router.put('/:documentId', async (req: Request, res: Response) => {
  try {
    // ... 検証ロジック（同じ）...

    const document = await proposalDocumentGenerator.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ /* ... */ });
    }

    // ... 権限チェック（同じ）...

    const updatedDocument = await proposalDocumentGenerator.updateDocument(
      documentId,
      updates,
      user as User
    );

    if (!updatedDocument) {
      return res.status(500).json({ /* ... */ });
    }

    // 最新の監査ログを取得
    const auditLogs = await proposalAuditService.getLogs(documentId);

    res.json({
      success: true,
      documentId: updatedDocument.id,
      lastModifiedDate: updatedDocument.lastModifiedDate,
      auditLogId: auditLogs[0]?.id
    });
  } catch (error: any) {
    // ...
  }
});
```

#### 変更3: POST /api/proposal-documents/:documentId/mark-ready

```typescript
// 【変更後】
router.post('/:documentId/mark-ready', async (req: Request, res: Response) => {
  try {
    // ... 検証・権限チェック（同じ）...

    const document = await proposalDocumentGenerator.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ /* ... */ });
    }

    // ... 権限チェック（同じ）...

    const updatedDocument = await proposalDocumentGenerator.markAsReady(documentId, user as User);

    if (!updatedDocument) {
      return res.status(500).json({ /* ... */ });
    }

    const auditLogs = await proposalAuditService.getLogs(documentId);

    res.json({
      success: true,
      documentId: updatedDocument.id,
      status: updatedDocument.status,
      lastModifiedDate: updatedDocument.lastModifiedDate,
      auditLogId: auditLogs[0]?.id
    });
  } catch (error: any) {
    // ...
  }
});
```

#### 変更4: GET /api/proposal-documents/:documentId/audit-logs

```typescript
// 【変更後】
router.get('/:documentId/audit-logs', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const document = await proposalDocumentGenerator.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ /* ... */ });
    }

    // Prismaでページネーション
    const allLogs = await prisma.proposalAuditLog.findMany({
      where: { documentId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const totalCount = await prisma.proposalAuditLog.count({
      where: { documentId }
    });

    res.json({
      auditLogs: allLogs,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error: any) {
    // ...
  }
});
```

#### 変更5: POST /api/committee-submission-requests

```typescript
// 【変更後】
router.post('/committee-submission-requests', async (req: Request, res: Response) => {
  try {
    // ... 検証・権限チェック（同じ）...

    const document = await proposalDocumentGenerator.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ /* ... */ });
    }

    // ... 権限チェック（同じ）...

    const request = await committeeSubmissionService.createSubmissionRequest(
      documentId,
      targetCommittee,
      user as User
    );

    if (!request) {
      return res.status(500).json({ /* ... */ });
    }

    res.status(201).json({
      success: true,
      requestId: request.id,
      documentId: request.documentId,
      targetCommittee: request.targetCommittee,
      status: request.status,
      requestedDate: request.requestedDate,
      requestedBy: {
        id: request.requestedBy.id,
        name: request.requestedBy.name,
        permissionLevel: request.requestedBy.permissionLevel
      }
    });
  } catch (error: any) {
    // ...
  }
});
```

---

## ✅ 実装完了チェックリスト

### Phase 1: Prismaマイグレーション
- [ ] `npx prisma migrate dev --name add_proposal_documents` 実行
- [ ] `npx prisma generate` 実行
- [ ] Prisma Studio で3テーブルが表示されることを確認

### Phase 2: サービス層のPrisma切り替え
- [ ] ProposalDocumentGenerator.ts の変更
  - [ ] Prisma Client インポート
  - [ ] getDocument() を async に変更
  - [ ] generateDocument() を async に変更
  - [ ] updateDocument() を async に変更
  - [ ] markAsReady() を async に変更
  - [ ] submitToCommittee() を async に変更
  - [ ] その他のメソッドを async に変更
- [ ] CommitteeSubmissionService.ts の変更
  - [ ] Prisma Client インポート
  - [ ] createSubmissionRequest() を async に変更
  - [ ] approveSubmissionRequest() を async に変更
  - [ ] その他のメソッドを async に変更
- [ ] ProposalAuditService.ts の変更
  - [ ] Prisma Client インポート
  - [ ] logCreated() を async に変更
  - [ ] logEdited() を async に変更
  - [ ] getLogs() を async に変更

### Phase 3: APIルートの非同期対応
- [ ] GET /api/proposal-documents/:documentId に async/await 追加
- [ ] PUT /api/proposal-documents/:documentId に async/await 追加
- [ ] POST /api/proposal-documents/:documentId/mark-ready に async/await 追加
- [ ] GET /api/proposal-documents/:documentId/audit-logs に async/await 追加
- [ ] POST /api/committee-submission-requests に async/await 追加

### Phase 4: テストの更新
- [ ] proposal-documents-api.test.ts のテストケース更新
- [ ] テスト実行: `npm test -- proposal-documents-api.test.ts`
- [ ] 全19個のテストが成功することを確認

### Phase 5: 動作確認
- [ ] サーバー起動: `npm run dev:api`
- [ ] 手動テスト実施（Postman/curl）
- [ ] フロントエンドとの統合テスト

---

## 🚨 注意事項

### 1. トランザクション処理
議題提案書の作成・更新時はトランザクションを使用することを推奨:

```typescript
await prisma.$transaction(async (tx) => {
  // 議題提案書作成
  const document = await tx.proposalDocument.create({ /* ... */ });

  // 監査ログ記録
  await tx.proposalAuditLog.create({ /* ... */ });
});
```

### 2. エラーハンドリング
Prismaエラーの適切な処理:

```typescript
import { Prisma } from '@prisma/client';

try {
  // ...
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // ユニーク制約違反
      return res.status(409).json({ /* ... */ });
    }
  }
  throw error;
}
```

### 3. パフォーマンス最適化
- インデックスの確認（schema.prismaで既に設定済み）
- N+1問題の回避（include/select の適切な使用）
- クエリのパフォーマンス監視

---

## 📊 見積もり時間

| フェーズ | 所要時間 | 難易度 |
|---------|---------|-------|
| Phase 1: Prismaマイグレーション | 5分 | 易 |
| Phase 2: サービス層の切り替え | 30分 | 中 |
| Phase 3: APIルートの非同期対応 | 15分 | 易 |
| Phase 4: テストの更新 | 10分 | 易 |
| Phase 5: 動作確認 | 10分 | 易 |
| **合計** | **70分（約1時間）** | **中** |

---

## 📞 サポート

### 質問・相談先
- **Slack**: #voicedrive-dev
- **メール**: voicedrive-dev@example.com
- **ドキュメント**: `mcp-shared/docs/`

### 参考ドキュメント
1. [proposal-document-editor_DB要件分析_20251022.md](c:\projects\voicedrive-v100\mcp-shared\docs\proposal-document-editor_DB要件分析_20251022.md)
2. [proposal-document-editor暫定マスターリスト_20251022.md](c:\projects\voicedrive-v100\mcp-shared\docs\proposal-document-editor暫定マスターリスト_20251022.md)
3. [proposal-documents-api-implementation-report_20251022.md](c:\projects\voicedrive-v100\mcp-shared\docs\proposal-documents-api-implementation-report_20251022.md)

---

## 🎯 成功の定義

### 実装完了の条件
1. ✅ Prismaマイグレーション成功
2. ✅ 全19個のテストケースが成功
3. ✅ APIが正常に動作（手動テスト成功）
4. ✅ フロントエンドとの統合テスト成功

---

**作成日**: 2025年10月22日
**最終更新**: 2025年10月22日
**ステータス**: ✅ 準備完了
**次回作業予定**: DB構築完了後

---

**文書終了**

このガイドに従えば、DB構築後にスムーズに実装を再開できます。
