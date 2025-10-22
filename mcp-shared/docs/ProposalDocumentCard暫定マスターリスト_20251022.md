# ProposalDocumentCard 暫定マスターリスト

**作成日**: 2025年10月22日
**対象コンポーネント**: ProposalDocumentCard.tsx
**API実装**: proposal-documents.routes.ts
**ステータス**: 📝 実装待ち

---

## 📋 API仕様一覧

### **API 1: 提案書一覧取得**

#### **エンドポイント**
```
GET /api/proposal-documents
```

#### **目的**
議題提案書の一覧を取得し、ProposalDocumentCardコンポーネントで表示

#### **権限**
- **Level 1+**: 提出済み（submitted/approved/rejected）のみ閲覧可能
- **Level 11+**: 自分が作成した提案書をすべて閲覧可能
- **Level 13+**: すべての提案書を閲覧可能

#### **クエリパラメータ**
```typescript
{
  status?: 'draft' | 'under_review' | 'ready' | 'submitted' | 'approved' | 'rejected';
  agendaLevel?: 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';
  createdById?: string;
  targetCommittee?: string;
  limit?: number;        // デフォルト: 20
  offset?: number;       // デフォルト: 0
  sortBy?: 'createdAt' | 'updatedAt' | 'submittedDate';  // デフォルト: 'createdAt'
  sortOrder?: 'asc' | 'desc';  // デフォルト: 'desc'
}
```

#### **レスポンス**
```typescript
{
  documents: Array<{
    id: string;
    postId: string;
    title: string;
    agendaLevel: string;
    status: string;
    summary: string;
    voteAnalysis: {
      totalVotes: number;
      supportRate: number;
      strongSupportRate: number;
      oppositionRate: number;
      neutralRate: number;
      // ... その他の分析データ
    };
    commentAnalysis: {
      totalComments: number;
      supportComments: number;
      concernComments: number;
      proposalComments: number;
      // ... その他の分析データ
    };
    recommendationLevel?: string;
    targetCommittee?: string;
    submittedDate?: string;  // ISO 8601
    createdBy: {
      id: string;
      name: string;
      position?: string;
      department?: string;
    };
    submittedBy?: {
      id: string;
      name: string;
    };
    createdAt: string;      // ISO 8601
    updatedAt: string;      // ISO 8601
  }>;
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}
```

#### **実装例**
```typescript
// proposal-documents.routes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/proposal-documents', async (req: Request, res: Response) => {
  try {
    const {
      status,
      agendaLevel,
      createdById,
      targetCommittee,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 権限チェック（JWT認証を想定）
    const currentUser = req.user; // 認証ミドルウェアから取得
    const userLevel = Number(currentUser.permissionLevel);

    // フィルタ条件構築
    const where: any = {};

    if (status) where.status = status;
    if (agendaLevel) where.agendaLevel = agendaLevel;
    if (createdById) where.createdById = createdById;
    if (targetCommittee) where.targetCommittee = targetCommittee;

    // 権限に応じたフィルタ
    if (userLevel < 11) {
      // 一般職員: 提出済みのみ
      where.status = { in: ['submitted', 'approved', 'rejected'] };
    } else if (userLevel < 13) {
      // 管理職: 自分の提案書 OR 提出済み
      where.OR = [
        { createdById: currentUser.id },
        { status: { in: ['submitted', 'approved', 'rejected'] } }
      ];
    }
    // Level 13+: 制限なし

    // 件数取得
    const total = await prisma.proposalDocument.count({ where });

    // データ取得
    const documents = await prisma.proposalDocument.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true
          }
        },
        submittedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { [sortBy as string]: sortOrder },
      take: Number(limit),
      skip: Number(offset)
    });

    // レスポンス整形
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      voteAnalysis: JSON.parse(JSON.stringify(doc.voteAnalysis)),
      commentAnalysis: JSON.parse(JSON.stringify(doc.commentAnalysis)),
      relatedInfo: doc.relatedInfo ? JSON.parse(JSON.stringify(doc.relatedInfo)) : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      submittedDate: doc.submittedDate?.toISOString()
    }));

    const totalPages = Math.ceil(total / Number(limit));
    const currentPage = Math.floor(Number(offset) / Number(limit)) + 1;

    res.json({
      documents: formattedDocuments,
      total,
      hasMore: total > Number(offset) + documents.length,
      currentPage,
      totalPages
    });

  } catch (error) {
    console.error('Error fetching proposal documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

### **API 2: 提案書詳細取得**

#### **エンドポイント**
```
GET /api/proposal-documents/:id
```

#### **目的**
特定の議題提案書の詳細情報を取得

#### **権限**
- **Level 1+**: 提出済み提案書のみ
- **Level 11+**: 自分の提案書 OR 提出済み
- **Level 13+**: すべて

#### **パスパラメータ**
```typescript
{
  id: string;  // ProposalDocument ID
}
```

#### **レスポンス**
```typescript
{
  document: {
    id: string;
    postId: string;
    title: string;
    agendaLevel: string;
    status: string;

    // 提案内容
    summary: string;
    background: string;
    objectives: string;
    expectedEffects: string;
    concerns: string;
    counterMeasures: string;

    // 分析データ
    voteAnalysis: VoteAnalysis;
    commentAnalysis: CommentAnalysis;
    relatedInfo?: RelatedInfo;

    // 管理職追記
    managerNotes?: string;
    additionalContext?: string;
    recommendationLevel?: string;

    // 委員会情報
    targetCommittee?: string;
    submittedDate?: string;
    committeeDecision?: {
      status: string;
      date: string;
      reason?: string;
      nextSteps?: string;
    };

    // リレーション
    createdBy: User;
    submittedBy?: User;
    post: Post;
    auditLogs: ProposalAuditLog[];

    // タイムスタンプ
    createdAt: string;
    updatedAt: string;
    lastModifiedDate: string;
  };
}
```

#### **実装例**
```typescript
router.get('/proposal-documents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const userLevel = Number(currentUser.permissionLevel);

    const document = await prisma.proposalDocument.findUnique({
      where: { id },
      include: {
        createdBy: true,
        submittedBy: true,
        post: {
          include: {
            author: true,
            votes: true,
            comments: true
          }
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 権限チェック
    const isOwner = document.createdById === currentUser.id;
    const isSubmitted = ['submitted', 'approved', 'rejected'].includes(document.status);
    const isAdmin = userLevel >= 13;

    if (!isAdmin && !isOwner && !isSubmitted) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ document });

  } catch (error) {
    console.error('Error fetching proposal document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

### **API 3: 提案書更新**

#### **エンドポイント**
```
PUT /api/proposal-documents/:id
```

#### **目的**
議題提案書の内容を更新（下書き状態のみ）

#### **権限**
- **Level 11+**: 自分が作成した下書き状態の提案書のみ編集可能

#### **リクエストボディ**
```typescript
{
  title?: string;
  summary?: string;
  background?: string;
  objectives?: string;
  expectedEffects?: string;
  concerns?: string;
  counterMeasures?: string;
  managerNotes?: string;
  additionalContext?: string;
  recommendationLevel?: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
  status?: 'draft' | 'under_review' | 'ready';  // ステータス更新
}
```

#### **レスポンス**
```typescript
{
  success: true;
  document: ProposalDocument;
  auditLog: ProposalAuditLog;  // 更新記録
}
```

#### **実装例**
```typescript
router.put('/proposal-documents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const updateData = req.body;

    // 提案書取得
    const document = await prisma.proposalDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 権限チェック
    if (document.createdById !== currentUser.id) {
      return res.status(403).json({ error: 'Only the creator can edit this document' });
    }

    // ステータスチェック
    if (document.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft documents can be edited' });
    }

    // 変更フィールド記録
    const changedFields = Object.keys(updateData);

    // トランザクション: 更新 + 監査ログ
    const [updatedDocument, auditLog] = await prisma.$transaction([
      prisma.proposalDocument.update({
        where: { id },
        data: {
          ...updateData,
          lastModifiedDate: new Date()
        },
        include: {
          createdBy: true,
          submittedBy: true
        }
      }),
      prisma.proposalAuditLog.create({
        data: {
          documentId: id,
          userId: currentUser.id,
          userName: currentUser.name,
          userLevel: currentUser.permissionLevel,
          action: 'edited',
          details: `Updated fields: ${changedFields.join(', ')}`,
          changedFields
        }
      })
    ]);

    res.json({
      success: true,
      document: updatedDocument,
      auditLog
    });

  } catch (error) {
    console.error('Error updating proposal document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

### **API 4: 提案書提出**

#### **エンドポイント**
```
POST /api/proposal-documents/:id/submit
```

#### **目的**
準備完了状態の提案書を委員会に提出

#### **権限**
- **Level 11+**: 自分が作成した ready 状態の提案書のみ提出可能

#### **リクエストボディ**
```typescript
{
  targetCommittee: string;  // 提出先委員会名
  userId: string;           // 提出者ID（認証ユーザー）
}
```

#### **レスポンス**
```typescript
{
  success: true;
  document: ProposalDocument;  // status が 'submitted' に更新
  submissionRequest: CommitteeSubmissionRequest;  // 提出リクエスト作成
  notification: Notification;  // 委員会メンバーへの通知
}
```

#### **実装例**
```typescript
router.post('/proposal-documents/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetCommittee, userId } = req.body;
    const currentUser = req.user;

    // バリデーション
    if (!targetCommittee || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 提案書取得
    const document = await prisma.proposalDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 権限チェック
    if (document.createdById !== currentUser.id) {
      return res.status(403).json({ error: 'Only the creator can submit this document' });
    }

    // ステータスチェック
    if (document.status !== 'ready') {
      return res.status(400).json({
        error: 'Only ready documents can be submitted',
        currentStatus: document.status
      });
    }

    // トランザクション: 提案書更新 + 提出リクエスト作成 + 監査ログ + 通知
    const result = await prisma.$transaction(async (tx) => {
      // 1. 提案書ステータス更新
      const updatedDocument = await tx.proposalDocument.update({
        where: { id },
        data: {
          status: 'submitted',
          targetCommittee,
          submittedDate: new Date(),
          submittedById: userId
        },
        include: {
          createdBy: true,
          submittedBy: true
        }
      });

      // 2. 提出リクエスト作成
      const submissionRequest = await tx.committeeSubmissionRequest.create({
        data: {
          documentId: id,
          requestedById: userId,
          targetCommittee,
          status: 'pending'
        }
      });

      // 3. 監査ログ作成
      await tx.proposalAuditLog.create({
        data: {
          documentId: id,
          userId: currentUser.id,
          userName: currentUser.name,
          userLevel: currentUser.permissionLevel,
          action: 'submitted',
          details: `Submitted to ${targetCommittee}`
        }
      });

      // 4. 委員会メンバーへ通知作成
      // TODO: 委員会メンバー取得ロジック
      const notification = await tx.notification.create({
        data: {
          userId: 'committee-member-id', // 実際は委員会メンバー全員にループ
          type: 'proposal_submitted',
          title: '新しい提案書が提出されました',
          message: `${updatedDocument.title}が${targetCommittee}に提出されました`,
          link: `/proposal-documents/${id}`,
          isRead: false
        }
      });

      return { updatedDocument, submissionRequest, notification };
    });

    res.json({
      success: true,
      document: result.updatedDocument,
      submissionRequest: result.submissionRequest,
      notification: result.notification
    });

  } catch (error) {
    console.error('Error submitting proposal document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

### **API 5: 提案書削除**

#### **エンドポイント**
```
DELETE /api/proposal-documents/:id
```

#### **目的**
下書き状態の提案書を削除

#### **権限**
- **Level 11+**: 自分が作成した draft 状態の提案書のみ削除可能

#### **レスポンス**
```typescript
{
  success: true;
  deletedId: string;
  auditLog: ProposalAuditLog;
}
```

#### **実装例**
```typescript
router.delete('/proposal-documents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // 提案書取得
    const document = await prisma.proposalDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 権限チェック
    if (document.createdById !== currentUser.id) {
      return res.status(403).json({ error: 'Only the creator can delete this document' });
    }

    // ステータスチェック
    if (document.status !== 'draft') {
      return res.status(400).json({
        error: 'Only draft documents can be deleted',
        currentStatus: document.status
      });
    }

    // トランザクション: 監査ログ作成 + 削除
    const result = await prisma.$transaction(async (tx) => {
      // 監査ログ作成
      const auditLog = await tx.proposalAuditLog.create({
        data: {
          documentId: id,
          userId: currentUser.id,
          userName: currentUser.name,
          userLevel: currentUser.permissionLevel,
          action: 'deleted',
          details: `Deleted draft document: ${document.title}`
        }
      });

      // 提案書削除（CASCADE設定により監査ログも削除される）
      await tx.proposalDocument.delete({
        where: { id }
      });

      return { auditLog };
    });

    res.json({
      success: true,
      deletedId: id,
      auditLog: result.auditLog
    });

  } catch (error) {
    console.error('Error deleting proposal document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────┐
│ ProposalDocumentCard Component                           │
│                                                          │
│  ┌──────────────┐         ┌────────────────┐           │
│  │ useQuery     │────────>│ GET /api/      │           │
│  │              │<────────│ proposal-      │           │
│  │              │         │ documents      │           │
│  └──────────────┘         └────────────────┘           │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────┐           │
│  │ ProposalDocument[] (documents)           │           │
│  │ ├─ id, title, status, agendaLevel        │           │
│  │ ├─ voteAnalysis: { totalVotes, ... }     │           │
│  │ ├─ commentAnalysis: { totalComments, ... }│          │
│  │ └─ createdBy: { name, department }       │           │
│  └──────────────────────────────────────────┘           │
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────┐            │
│  │ Card UI Rendering                       │            │
│  │ ├─ Header (title, badges)               │            │
│  │ ├─ Stats (votes, support, comments)     │            │
│  │ ├─ Summary preview                      │            │
│  │ ├─ Recommendation level                 │            │
│  │ └─ Action buttons                       │            │
│  └─────────────────────────────────────────┘            │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐         ┌────────────────┐           │
│  │ User Actions │────────>│ PUT / POST /   │           │
│  │ (Edit/Submit)│         │ DELETE APIs    │           │
│  └──────────────┘         └────────────────┘           │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ invalidate   │ (キャッシュ更新)                       │
│  │ Queries      │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Backend API (proposal-documents.routes.ts)               │
│                                                          │
│  GET    /api/proposal-documents                          │
│  GET    /api/proposal-documents/:id                      │
│  PUT    /api/proposal-documents/:id                      │
│  POST   /api/proposal-documents/:id/submit               │
│  DELETE /api/proposal-documents/:id                      │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Prisma ORM                                               │
│                                                          │
│  ProposalDocument table                                  │
│  ├─ voteAnalysis (JSON)                                  │
│  ├─ commentAnalysis (JSON)                               │
│  └─ relatedInfo (JSON)                                   │
│                                                          │
│  Relations:                                              │
│  ├─ createdBy → User                                     │
│  ├─ submittedBy → User                                   │
│  ├─ post → Post                                          │
│  ├─ auditLogs → ProposalAuditLog[]                       │
│  └─ submissionRequests → CommitteeSubmissionRequest[]    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 権限マトリックス

| 操作 | Level 1-10 | Level 11-12 | Level 13-14 | Level 15-18 |
|-----|-----------|------------|------------|------------|
| 提出済み提案書閲覧 | ✅ | ✅ | ✅ | ✅ |
| 自分の下書き閲覧 | ❌ | ✅ | ✅ | ✅ |
| 他人の下書き閲覧 | ❌ | ❌ | ✅ | ✅ |
| 提案書作成 | ❌ | ✅ | ✅ | ✅ |
| 自分の下書き編集 | ❌ | ✅ | ✅ | ✅ |
| 自分の下書き削除 | ❌ | ✅ | ✅ | ✅ |
| 提案書提出 | ❌ | ✅ | ✅ | ✅ |
| 提案書承認/却下 | ❌ | ❌ | ✅ | ✅ |

---

## 📝 実装チェックリスト

### **バックエンド実装**
- [ ] proposal-documents.routes.ts ファイル作成
- [ ] API 1: GET /api/proposal-documents 実装
- [ ] API 2: GET /api/proposal-documents/:id 実装
- [ ] API 3: PUT /api/proposal-documents/:id 実装
- [ ] API 4: POST /api/proposal-documents/:id/submit 実装
- [ ] API 5: DELETE /api/proposal-documents/:id 実装
- [ ] 権限チェックミドルウェア実装
- [ ] バリデーション実装
- [ ] エラーハンドリング実装
- [ ] トランザクション処理実装
- [ ] server.ts へのルート登録

### **フロントエンド実装**
- [x] ProposalDocumentCard.tsx コンポーネント作成 ✅
- [ ] ProposalDocumentList ページ作成
- [ ] React Query統合
- [ ] API呼び出し関数作成
- [ ] ページネーション実装
- [ ] フィルタ機能実装
- [ ] ローディング・エラー状態UI
- [ ] 編集モーダル実装
- [ ] 提出確認ダイアログ実装
- [ ] 削除確認ダイアログ実装

### **テスト**
- [ ] Unit tests (API routes)
- [ ] Integration tests (API + DB)
- [ ] Component tests (React)
- [ ] E2E tests
- [ ] 手動テスト

---

## 🚀 実装優先順位

### **Phase 1: 基本機能** (優先度: 高)
1. API 1 (一覧取得) の実装
2. API 2 (詳細取得) の実装
3. ProposalDocumentList ページ作成
4. React Query統合

### **Phase 2: 編集機能** (優先度: 高)
1. API 3 (更新) の実装
2. 編集モーダルUI実装
3. バリデーション実装

### **Phase 3: 提出機能** (優先度: 中)
1. API 4 (提出) の実装
2. 提出確認ダイアログ実装
3. 通知システム統合

### **Phase 4: 削除機能** (優先度: 低)
1. API 5 (削除) の実装
2. 削除確認ダイアログ実装

### **Phase 5: テスト・最適化** (優先度: 中)
1. テストコード作成
2. パフォーマンス最適化
3. エラーハンドリング強化

---

## 💡 技術的推奨事項

### **パフォーマンス**
- **JSON解析最適化**: voteAnalysis/commentAnalysisの解析をメモ化
- **ページネーション**: 無限スクロール or ページネーション実装
- **キャッシング**: React Queryの staleTime/cacheTime 設定

### **セキュリティ**
- **XSS対策**: summary/backgroundのサニタイズ
- **CSRF対策**: トークン検証
- **Rate Limiting**: API呼び出し制限
- **監査ログ**: すべての変更をProposalAuditLogに記録

### **ユーザビリティ**
- **楽観的更新**: 編集時のUIレスポンス向上
- **エラーメッセージ**: ユーザーフレンドリーなメッセージ
- **ローディングフィードバック**: スケルトンUI

---

## 📊 結論

**ProposalDocumentCardの暫定マスターリストが完成しました。**

### ✅ 定義完了
- API仕様: **5つ**
- 実装例: **完全**
- 権限マトリックス: **明確**
- データフロー: **可視化**

### 🎯 次のアクション
1. **proposal-documents.routes.ts 作成**
2. **5つのAPIエンドポイント実装**
3. **server.ts へのルート登録**
4. **ProposalDocumentList ページ作成**
5. **React Query統合**

---

**作成者**: Claude Code
**最終更新**: 2025年10月22日
**レビュー状態**: 要レビュー
