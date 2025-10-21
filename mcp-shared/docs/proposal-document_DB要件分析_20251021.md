# 議題提案書編集ページ（ProposalDocumentEditor）DB要件分析

**文書番号**: PDE-DB-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDriveチーム
**対象機能**: 議題提案書編集ページ（ProposalDocumentEditor）
**重要度**: 🔴 超重要
**ステータス**: 詳細分析完了

---

## 📋 エグゼクティブサマリー

### 機能概要

議題提案書編集ページ（ProposalDocumentEditor）は、管理職が投稿から自動生成された議題提案書を確認・編集し、委員会提出のための準備を行う最重要機能です。

**主要機能**:
1. **提案書自動生成内容の表示** - 投票データ・コメント分析から自動生成
2. **管理職による補足編集** - 現場の文脈・追加情報の記入
3. **推奨レベル設定** - 強く推奨/推奨/中立/推奨しない
4. **ステータス管理** - 下書き → レビュー中 → 提出準備完了 → 提出済み
5. **委員会提出リクエスト** - Level 7+が作成、Level 8+が承認
6. **透明性ログ** - 全編集履歴の記録

### データ管理責任の原則

データ管理責任分界点定義書（DM-DEF-2025-1008-001）に基づき：

| データ項目 | VoiceDrive | 医療システム | 提供方法 |
|-----------|-----------|-------------|---------|
| **議題提案書** | ✅ マスタ | ❌ | - |
| **投票分析データ** | ✅ 計算・保持 | ❌ | - |
| **コメント分析データ** | ✅ 計算・保持 | ❌ | - |
| **管理職による補足** | ✅ マスタ | ❌ | - |
| **委員会提出リクエスト** | ✅ マスタ | ❌ | - |
| **透明性ログ（監査ログ）** | ✅ マスタ | ❌ | - |
| **職員情報** | キャッシュ | ✅ マスタ | API |
| **委員会マスタ** | キャッシュ | ✅ マスタ | API |

**原則**: 議題提案書データはVoiceDrive 100%管轄、職員・委員会マスタのみ医療システムから取得

---

## 🎯 現状分析

### A. ProposalDocumentEditor.tsx 機能詳細

**ファイルパス**: `src/pages/ProposalDocumentEditor.tsx`
**コードサイズ**: 410行
**ルート**: `/proposal-document/:documentId`

#### 1. 画面構成

```
ヘッダー
  - タイトル表示
  - 議題レベルバッジ（PENDING～CORP_AGENDA）
  - ステータスバッジ（下書き/レビュー中/提出準備完了/提出済み）
  - 提出先委員会表示
  - 作成日時・作成者表示
  ↓
メインコンテンツ（2カラム）
  ↓
左カラム:
  - 提案内容（自動生成・読み取り専用）
    - 要約
    - 背景・経緯
    - 目的
    - 期待される効果
    - 懸念点
    - 対応策
  - 管理職による補足（編集可能）
    - 補足説明
    - 追加の文脈
    - 推奨レベル選択
  - アクションボタン
    - 提出準備完了としてマーク（draft→ready）
    - 委員会提出リクエスト（Level 7+、ready時のみ）
  ↓
右カラム（サイドバー）:
  - 投票データ
    - 総投票数
    - 支持率
    - 反対率
  - コメント統計
    - 総コメント数
    - 賛成意見数
    - 懸念点数
    - 建設的提案数
  - 透明性ログ
    - 編集履歴
    - ユーザー名・権限レベル
    - アクション詳細
```

#### 2. データ取得フロー (lines 35-47)

```typescript
useEffect(() => {
  if (documentId) {
    const doc = proposalDocumentGenerator.getDocument(documentId);
    if (doc) {
      setDocument(doc);
      setEditedFields({
        managerNotes: doc.managerNotes || '',
        additionalContext: doc.additionalContext || '',
        recommendationLevel: doc.recommendationLevel || 'recommend'
      });
    }
  }
}, [documentId]);
```

**現状**: `ProposalDocumentGenerator` サービス（メモリ上）からデータ取得
**必要**: `GET /api/proposal-documents/:documentId` API実装

#### 3. 編集機能 (lines 55-71)

```typescript
const handleSave = () => {
  if (!documentId) return;

  proposalDocumentGenerator.updateDocument(
    documentId,
    editedFields,
    activeUser
  );

  const updated = proposalDocumentGenerator.getDocument(documentId);
  if (updated) {
    setDocument(updated);
  }

  setIsEditing(false);
  alert('保存しました');
};
```

**編集可能フィールド**:
- `managerNotes` (補足説明)
- `additionalContext` (追加の文脈)
- `recommendationLevel` ('strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend')

**必要**: `PUT /api/proposal-documents/:documentId` API実装

#### 4. 提出準備完了マーク (lines 73-83)

```typescript
const handleMarkAsReady = () => {
  if (!documentId) return;

  proposalDocumentGenerator.markAsReady(documentId, activeUser);
  const updated = proposalDocumentGenerator.getDocument(documentId);
  if (updated) {
    setDocument(updated);
  }

  alert('提出準備完了としてマークしました');
};
```

**ステータス変更**: `draft` → `ready`

#### 5. 委員会提出リクエスト (lines 85-106)

```typescript
const handleSubmitRequest = () => {
  if (!documentId) return;

  // Level 7+ のみ
  if (!activeUser.permissionLevel || activeUser.permissionLevel < 7) {
    alert('委員会提出リクエストには Level 7 以上の権限が必要です');
    return;
  }

  const targetCommittee = prompt('提出先の委員会を入力してください（例: 運営委員会）');
  if (!targetCommittee) return;

  const request = committeeSubmissionService.createSubmissionRequest(
    documentId,
    targetCommittee,
    activeUser
  );

  if (request) {
    alert(`委員会提出リクエストを作成しました\n提出先: ${targetCommittee}\nレビュー待ち`);
  }
};
```

**権限チェック**: Level 7+ のみ実行可能
**必要**: `POST /api/committee-submissions/requests` API実装

#### 6. 議題レベル表示 (lines 108-119)

```typescript
const levelConfig = {
  PENDING: { label: '投票中', color: 'text-gray-400', bg: 'bg-gray-800/30' },
  DEPT_REVIEW: { label: '部署レビュー', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  DEPT_AGENDA: { label: '部署議題', color: 'text-blue-500', bg: 'bg-blue-900/50' },
  FACILITY_AGENDA: { label: '施設議題', color: 'text-purple-400', bg: 'bg-purple-900/50' },
  CORP_REVIEW: { label: '法人レビュー', color: 'text-orange-400', bg: 'bg-orange-900/50' },
  CORP_AGENDA: { label: '法人議題', color: 'text-red-400', bg: 'bg-red-900/50' }
};
```

6段階の議題レベルに対応したUIバッジ表示

---

### B. ProposalDocument 型定義詳細

**ファイルパス**: `src/types/proposalDocument.ts`
**コードサイズ**: 170行

#### 1. ProposalDocument インターフェース (lines 111-155)

```typescript
export interface ProposalDocument {
  id: string;
  postId: string;
  post: Post;

  // 基本情報
  title: string;
  agendaLevel: AgendaLevel;
  createdBy: User;
  createdDate: Date;
  lastModifiedDate: Date;
  status: ProposalDocumentStatus;

  // 提案内容（自動生成 + 管理職による補足）
  summary: string; // 提案の要約
  background: string; // 背景・経緯
  objectives: string; // 目的
  expectedEffects: string; // 期待される効果
  concerns: string; // 懸念点
  counterMeasures: string; // 懸念への対応策

  // データ分析（自動生成）
  voteAnalysis: VoteAnalysis;
  commentAnalysis: CommentAnalysis;
  relatedInfo: RelatedInfo;

  // 管理職による追記
  managerNotes?: string;
  additionalContext?: string;
  recommendationLevel?: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';

  // 委員会提出情報
  targetCommittee?: string;
  submittedDate?: Date;
  submittedBy?: User;
  committeeDecision?: {
    status: 'approved' | 'rejected' | 'deferred';
    date: Date;
    reason?: string;
    nextSteps?: string;
  };

  // 透明性ログ
  auditLog: ProposalAuditLog[];
}
```

#### 2. VoteAnalysis インターフェース (lines 23-51)

```typescript
export interface VoteAnalysis {
  totalVotes: number;
  supportRate: number;
  strongSupportRate: number;
  oppositionRate: number;
  neutralRate: number;

  // 部署別分析
  byDepartment?: {
    department: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];

  // 職位別分析
  byPosition?: {
    positionLevel: number;
    positionName: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];

  // ステークホルダー別分析
  byStakeholder?: {
    category: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];
}
```

#### 3. CommentAnalysis インターフェース (lines 56-78)

```typescript
export interface CommentAnalysis {
  totalComments: number;
  supportComments: number;
  concernComments: number;
  proposalComments: number;

  // 賛成意見の要約
  supportSummary: string[];

  // 懸念点の要約
  concernSummary: string[];

  // 建設的提案
  constructiveProposals: string[];

  // 主要なコメント（代表的な意見）
  keyComments: {
    content: string;
    author: string; // 匿名化された表示名
    type: 'support' | 'concern' | 'proposal';
    likes: number;
  }[];
}
```

#### 4. ProposalAuditLog インターフェース (lines 160-169)

```typescript
export interface ProposalAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userLevel: number;
  action: 'created' | 'edited' | 'reviewed' | 'submitted' | 'approved' | 'rejected' | 'marked_candidate' | 'unmarked_candidate';
  details?: string;
  changedFields?: string[];
}
```

---

### C. ProposalDocumentGenerator サービス詳細

**ファイルパス**: `src/services/ProposalDocumentGenerator.ts`
**コードサイズ**: 333行

#### 1. 提案書自動生成 (lines 38-101)

```typescript
public generateDocument(
  post: Post,
  agendaLevel: AgendaLevel,
  createdBy: User
): ProposalDocument {
  // データ分析
  const voteAnalysis = analyzeVotes(post);
  const commentAnalysis = analyzeComments(post);
  const relatedInfo = analyzeRelatedInfo(post);

  // 議題レベルに応じた提出先委員会を取得
  const responsibility = proposalPermissionService.getResponsibility(agendaLevel);
  const targetCommittee = responsibility?.targetCommittee || '未定';

  // 提案書作成
  const documentId = `doc-${post.id}-${Date.now()}`;
  const now = new Date();

  const document: ProposalDocument = {
    id: documentId,
    postId: post.id,
    post,

    // 基本情報
    title: this.generateTitle(post),
    agendaLevel,
    targetCommittee,  // 議題レベルに応じた委員会を自動設定
    createdBy,
    createdDate: now,
    lastModifiedDate: now,
    status: 'draft',

    // 提案内容（自動生成）
    summary: generateProposalSummary(post),
    background: generateBackground(post, voteAnalysis),
    objectives: this.generateObjectives(post),
    expectedEffects: generateExpectedEffects(post, commentAnalysis),
    concerns: generateConcerns(commentAnalysis),
    counterMeasures: generateCounterMeasures(commentAnalysis),

    // データ分析
    voteAnalysis,
    commentAnalysis,
    relatedInfo,

    // 透明性ログ
    auditLog: []
  };

  // ドキュメントを保存
  this.documents.set(documentId, document);

  // 監査ログ記録
  proposalAuditService.logCreated(documentId, createdBy, post.id);
  document.auditLog.push(proposalAuditService.getLogs(documentId)[0]);

  return document;
}
```

**依存関数** (from `src/utils/proposalAnalyzer.ts`):
- `analyzeVotes(post)` - 投票データ分析
- `analyzeComments(post)` - コメントデータ分析
- `analyzeRelatedInfo(post)` - 関連情報分析
- `generateProposalSummary(post)` - 提案要約生成
- `generateBackground(post, voteAnalysis)` - 背景生成
- `generateExpectedEffects(post, commentAnalysis)` - 期待効果生成
- `generateConcerns(commentAnalysis)` - 懸念点生成
- `generateCounterMeasures(commentAnalysis)` - 対応策生成

#### 2. 提案書更新 (lines 160-187)

```typescript
public updateDocument(
  documentId: string,
  updates: Partial<ProposalDocument>,
  updatedBy: User
): ProposalDocument | undefined {
  const document = this.documents.get(documentId);
  if (!document) return undefined;

  // 変更されたフィールドを記録
  const changedFields = Object.keys(updates).filter(
    key => key !== 'lastModifiedDate' && key !== 'auditLog'
  );

  // 更新
  const updatedDocument: ProposalDocument = {
    ...document,
    ...updates,
    lastModifiedDate: new Date()
  };

  this.documents.set(documentId, updatedDocument);

  // 監査ログ記録
  proposalAuditService.logEdited(documentId, updatedBy, changedFields);
  updatedDocument.auditLog = proposalAuditService.getLogs(documentId);

  return updatedDocument;
}
```

#### 3. 委員会提出 (lines 225-251)

```typescript
public submitToCommittee(
  documentId: string,
  targetCommittee: string,
  submittedBy: User
): ProposalDocument | undefined {
  const document = this.documents.get(documentId);
  if (!document) return undefined;

  const updated = this.updateDocument(
    documentId,
    {
      status: 'submitted',
      targetCommittee,
      submittedDate: new Date(),
      submittedBy
    },
    submittedBy
  );

  // 監査ログ記録
  proposalAuditService.logSubmitted(documentId, submittedBy, targetCommittee);
  if (updated) {
    updated.auditLog = proposalAuditService.getLogs(documentId);
  }

  return updated;
}
```

---

### D. CommitteeSubmissionService サービス詳細

**ファイルパス**: `src/services/CommitteeSubmissionService.ts`
**コードサイズ**: 218行

#### 1. SubmissionRequest インターフェース (lines 14-25)

```typescript
export interface SubmissionRequest {
  id: string;
  documentId: string;
  document: ProposalDocument;
  requestedBy: User;
  requestedDate: Date;
  targetCommittee: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: User;
  reviewedDate?: Date;
  reviewNotes?: string;
}
```

#### 2. 提出リクエスト作成 (lines 43-88, Level 7+)

```typescript
public createSubmissionRequest(
  documentId: string,
  targetCommittee: string,
  requestedBy: User
): SubmissionRequest | undefined {
  const document = proposalDocumentGenerator.getDocument(documentId);
  if (!document) {
    console.error('議題提案書が見つかりません:', documentId);
    return undefined;
  }

  // Level 7+ のみ提出リクエスト可能
  if (!requestedBy.permissionLevel || requestedBy.permissionLevel < 7) {
    console.error('提出リクエストには Level 7 以上の権限が必要です');
    return undefined;
  }

  // ドキュメントのステータスを確認
  if (document.status !== 'ready') {
    console.error('議題提案書が提出準備完了状態ではありません');
    return undefined;
  }

  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const request: SubmissionRequest = {
    id: requestId,
    documentId,
    document,
    requestedBy,
    requestedDate: new Date(),
    targetCommittee,
    status: 'pending'
  };

  this.submissionRequests.set(requestId, request);

  return request;
}
```

**権限チェック**:
- Level 7+ のみ作成可能
- ドキュメントステータスが `ready` である必要あり

#### 3. 提出リクエスト承認 (lines 93-130, Level 8+)

```typescript
public approveSubmissionRequest(
  requestId: string,
  approver: User,
  notes?: string
): SubmissionRequest | undefined {
  const request = this.submissionRequests.get(requestId);
  if (!request) {
    console.error('提出リクエストが見つかりません:', requestId);
    return undefined;
  }

  // Level 8+ のみ承認可能
  if (!approver.permissionLevel || approver.permissionLevel < 8) {
    console.error('提出承認には Level 8 以上の権限が必要です');
    return undefined;
  }

  // リクエストを承認
  request.status = 'approved';
  request.reviewedBy = approver;
  request.reviewedDate = new Date();
  request.reviewNotes = notes;

  // 議題提案書を委員会に提出
  proposalDocumentGenerator.submitToCommittee(
    request.documentId,
    request.targetCommittee,
    approver
  );

  return request;
}
```

**権限チェック**: Level 8+ のみ承認可能

---

## 📊 データ管理責任分界点（議題提案書専用）

### カテゴリA: 議題提案書データ（完全管理）

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 提案書ID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | cuid() |
| 投稿ID (postId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| タイトル (title) | ✅ 生成 | ❌ | VoiceDrive管轄 | 自動生成 |
| 議題レベル (agendaLevel) | ✅ 保持 | ❌ | VoiceDrive管轄 | PENDING～CORP_AGENDA |
| ステータス (status) | ✅ 保持 | ❌ | VoiceDrive管轄 | draft/under_review/ready/submitted |
| 作成者ID (createdBy) | ✅ 保持 | ✅ マスタ | 双方向 | employeeId |
| 作成日時 (createdDate) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 更新日時 (lastModifiedDate) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: 基本情報はVoiceDrive 100%管轄

### カテゴリB: 自動生成コンテンツ

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 要約 (summary) | ✅ 生成 | ❌ | VoiceDrive管轄 | AI生成 |
| 背景 (background) | ✅ 生成 | ❌ | VoiceDrive管轄 | AI生成 |
| 目的 (objectives) | ✅ 生成 | ❌ | VoiceDrive管轄 | AI生成 |
| 期待効果 (expectedEffects) | ✅ 生成 | ❌ | VoiceDrive管轄 | AI生成 |
| 懸念点 (concerns) | ✅ 生成 | ❌ | VoiceDrive管轄 | AI生成 |
| 対応策 (counterMeasures) | ✅ 生成 | ❌ | VoiceDrive管轄 | AI生成 |

**原則**: 自動生成コンテンツはVoiceDrive 100%管轄

### カテゴリC: データ分析（自動計算）

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 投票分析 (voteAnalysis) | ✅ 計算 | ❌ | VoiceDrive管轄 | JSON形式 |
| コメント分析 (commentAnalysis) | ✅ 計算 | ❌ | VoiceDrive管轄 | JSON形式 |
| 関連情報 (relatedInfo) | ✅ 計算 | ❌ | VoiceDrive管轄 | JSON形式 |

**原則**: データ分析はVoiceDrive 100%管轄

### カテゴリD: 管理職による補足

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 補足説明 (managerNotes) | ✅ 保持 | ❌ | VoiceDrive管轄 | テキスト |
| 追加文脈 (additionalContext) | ✅ 保持 | ❌ | VoiceDrive管轄 | テキスト |
| 推奨レベル (recommendationLevel) | ✅ 保持 | ❌ | VoiceDrive管轄 | Enum値 |

**原則**: 管理職による補足はVoiceDrive 100%管轄

### カテゴリE: 委員会提出情報

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 提出先委員会 (targetCommittee) | ✅ 保持 | ✅ マスタ | 双方向 | 委員会名 |
| 提出日時 (submittedDate) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 提出者 (submittedBy) | ✅ 保持 | ✅ マスタ | 双方向 | employeeId |
| 委員会決定 (committeeDecision) | ❌ | ✅ マスタ | 医療 → VoiceDrive | Webhook経由 |

**原則**: 提出情報はVoiceDrive管轄、委員会決定は医療システムから受領

### カテゴリF: 透明性ログ

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 監査ログ (auditLog) | ✅ 生成・保持 | ❌ | VoiceDrive管轄 | 配列形式 |
| ログID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | - |
| タイムスタンプ (timestamp) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| ユーザーID (userId) | ✅ 保持 | ✅ マスタ | 双方向 | employeeId |
| アクション種別 (action) | ✅ 保持 | ❌ | VoiceDrive管轄 | Enum値 |
| 変更フィールド (changedFields) | ✅ 保持 | ❌ | VoiceDrive管轄 | 配列形式 |

**原則**: 監査ログはVoiceDrive 100%管轄

### カテゴリG: 委員会提出リクエスト

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| リクエストID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | - |
| 提案書ID (documentId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| リクエスト者 (requestedBy) | ✅ 保持 | ✅ マスタ | 双方向 | employeeId |
| リクエスト日時 (requestedDate) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| ステータス (status) | ✅ 保持 | ❌ | VoiceDrive管轄 | pending/approved/rejected |
| レビュー者 (reviewedBy) | ✅ 保持 | ✅ マスタ | 双方向 | employeeId (Level 8+) |
| レビュー日時 (reviewedDate) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| レビューノート (reviewNotes) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: 提出リクエストはVoiceDrive 100%管轄

### カテゴリH: 参照マスタ（API経由取得）

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 職員ID (employeeId) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 職員名 (name) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 権限レベル (permissionLevel) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 委員会マスタ | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |

**原則**: 職員・委員会マスタは医療システムが管理、VoiceDriveはAPI経由で参照

---

## 🗄️ VoiceDrive側のDB要件

### 必要なテーブル（Prisma Schema）

#### 1. ProposalDocument（議題提案書）- **新規テーブル（必須）**

```prisma
model ProposalDocument {
  id                   String    @id @default(cuid())
  postId               String

  // 基本情報
  title                String
  summary              String    // 提案概要（100-300字）
  agendaLevel          String    // 対象となる議題レベル
  targetCommittee      String?   // 提出先委員会

  // 自動生成データ
  voteAnalysis         Json      // VoteAnalysis型（総投票数、支持率、部署別分析）
  commentAnalysis      Json      // CommentAnalysis型（コメント分類、主要意見）
  relatedInfo          Json?     // RelatedInfo型（類似過去議題、影響部署、参考資料）

  // 提案書内容（自動生成）
  background           String?   // 背景・現状課題
  objectives           String?   // 目的
  expectedEffects      String?   // 期待される効果
  concerns             String?   // 懸念点
  counterMeasures      String?   // 懸念への対応策

  // 管理職による補足
  managerNotes         String?   // 補足説明
  additionalContext    String?   // 追加の文脈
  recommendationLevel  String?   // 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend'

  // ステータス
  status               String    @default("draft") // 'draft' | 'under_review' | 'ready' | 'submitted' | 'approved' | 'rejected'

  // 作成者・日時
  createdBy            String    // employeeId
  createdByName        String?   // キャッシュ用
  createdDate          DateTime  @default(now())
  updatedDate          DateTime  @updatedAt

  // 委員会提出情報
  submittedDate        DateTime? // 委員会提出日
  submittedBy          String?   // employeeId
  submittedByName      String?   // キャッシュ用

  // 委員会決定情報
  committeeDecisionStatus  String?    // 'approved' | 'rejected' | 'deferred'
  committeeDecisionDate    DateTime?
  committeeDecisionReason  String?
  committeeNextSteps       String?

  // リレーション
  post                 Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  auditLogs            ProposalAuditLog[]
  submissionRequests   SubmissionRequest[]

  @@index([postId])
  @@index([status])
  @@index([agendaLevel])
  @@index([createdBy])
  @@index([createdDate])
}
```

**判定**: ❌ **新規テーブル作成が必須**

#### 2. ProposalAuditLog（透明性ログ）- **新規テーブル（必須）**

```prisma
model ProposalAuditLog {
  id              String    @id @default(cuid())
  documentId      String

  // ログ情報
  timestamp       DateTime  @default(now())
  userId          String    // employeeId
  userName        String    // キャッシュ用
  userLevel       Int       // permissionLevel

  // アクション種別
  action          String    // 'created' | 'edited' | 'reviewed' | 'submitted' | 'approved' | 'rejected' | 'marked_candidate' | 'unmarked_candidate'
  details         String?   // アクション詳細
  changedFields   Json?     // 変更されたフィールドのリスト

  // リレーション
  document        ProposalDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([timestamp])
  @@index([userId])
  @@index([action])
}
```

**判定**: ❌ **新規テーブル作成が必須**

#### 3. SubmissionRequest（委員会提出リクエスト）- **新規テーブル（必須）**

```prisma
model SubmissionRequest {
  id              String    @id @default(cuid())
  documentId      String
  postId          String    // 追跡用

  // リクエスト情報
  requestedBy     String    // Level 7+ のemployeeId
  requestedByName String?   // キャッシュ用
  requestedByLevel Int      // Level 7+
  requestedDate   DateTime  @default(now())
  targetCommittee String    // 提出先委員会名

  // 承認情報
  status          String    @default("pending") // 'pending' | 'approved' | 'rejected'
  reviewedBy      String?   // Level 8+ のemployeeId
  reviewedByName  String?   // キャッシュ用
  reviewedByLevel Int?      // Level 8+
  reviewedDate    DateTime?
  reviewNotes     String?   // 承認コメント or 却下理由

  // リレーション
  document        ProposalDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  post            Post             @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([postId])
  @@index([status])
  @@index([requestedBy])
  @@index([reviewedBy])
  @@index([requestedDate])
}
```

**判定**: ❌ **新規テーブル作成が必須**

**注意**: PostManagement分析書ではSubmissionRequestとして定義されているが、CommitteeSubmissionRequestという名前も検討可能

#### 4. Post（投稿）- **既存テーブル（拡張必要）**

```prisma
model Post {
  // ... 既存フィールド ...

  // リレーション追加
  proposalDocuments     ProposalDocument[]
  submissionRequests    SubmissionRequest[]
}
```

**判定**: ✅ 既存テーブルにリレーション追加のみ

---

## 🔌 必要なAPI要件（VoiceDrive側）

### API-PDE-1: 議題提案書取得

**エンドポイント**: `GET /api/proposal-documents/:documentId`

**Response**:
```json
{
  "success": true,
  "document": {
    "id": "doc-789",
    "postId": "post-123",
    "title": "【業務改善】夜勤引継ぎ時間を15分延長し、より詳細な...",
    "agendaLevel": "DEPT_AGENDA",
    "status": "draft",
    "createdBy": {
      "id": "OH-NS-2024-010",
      "name": "鈴木副主任",
      "permissionLevel": 7
    },
    "createdDate": "2025-10-20T10:00:00Z",
    "lastModifiedDate": "2025-10-20T15:30:00Z",
    "summary": "夜勤引継ぎ時間を15分延長し、患者情報の詳細共有を実現する提案",
    "background": "現状の引継ぎ時間では情報共有が不十分であり...",
    "objectives": "業務効率化と職員の負担軽減",
    "expectedEffects": "医療安全性の向上、職員の負担軽減...",
    "concerns": "残業時間の増加、人件費の増大",
    "counterMeasures": "効率的な引継ぎフォーマットの導入により...",
    "voteAnalysis": {
      "totalVotes": 34,
      "supportRate": 85,
      "strongSupportRate": 45,
      "oppositionRate": 5,
      "neutralRate": 10,
      "byDepartment": [...]
    },
    "commentAnalysis": {
      "totalComments": 12,
      "supportComments": 8,
      "concernComments": 4,
      "proposalComments": 3,
      "supportSummary": ["安全性向上につながる", ...],
      "concernSummary": ["残業増加が心配", ...],
      "constructiveProposals": ["チェックリストを作る", ...],
      "keyComments": [...]
    },
    "managerNotes": "現場の状況として、実際に引継ぎミスによるヒヤリハットが...",
    "additionalContext": "過去3ヶ月の引継ぎミス事例を分析した結果...",
    "recommendationLevel": "recommend",
    "targetCommittee": "施設運営委員会",
    "auditLog": [
      {
        "id": "log-1",
        "timestamp": "2025-10-20T10:00:00Z",
        "userName": "鈴木副主任",
        "userLevel": 7,
        "action": "created",
        "details": "議題提案書を作成"
      },
      {
        "id": "log-2",
        "timestamp": "2025-10-20T15:30:00Z",
        "userName": "鈴木副主任",
        "userLevel": 7,
        "action": "edited",
        "changedFields": ["managerNotes", "recommendationLevel"]
      }
    ]
  }
}
```

### API-PDE-2: 議題提案書編集

**エンドポイント**: `PUT /api/proposal-documents/:documentId`

**Request**:
```json
{
  "managerNotes": "現場の状況として、実際に引継ぎミスによるヒヤリハットが月2-3件発生しています。",
  "additionalContext": "過去3ヶ月の引継ぎミス事例を分析した結果、時間不足が主要因でした。",
  "recommendationLevel": "strongly_recommend"
}
```

**Response**:
```json
{
  "success": true,
  "document": {
    "id": "doc-789",
    "lastModifiedDate": "2025-10-21T09:00:00Z",
    "managerNotes": "現場の状況として、実際に引継ぎミスによるヒヤリハットが月2-3件発生しています。",
    "additionalContext": "過去3ヶ月の引継ぎミス事例を分析した結果、時間不足が主要因でした。",
    "recommendationLevel": "strongly_recommend",
    "auditLog": [
      {
        "id": "log-3",
        "timestamp": "2025-10-21T09:00:00Z",
        "userName": "鈴木副主任",
        "userLevel": 7,
        "action": "edited",
        "changedFields": ["managerNotes", "additionalContext", "recommendationLevel"]
      }
    ]
  }
}
```

### API-PDE-3: 提出準備完了マーク

**エンドポイント**: `PATCH /api/proposal-documents/:documentId/status`

**Request**:
```json
{
  "status": "ready"
}
```

**Response**:
```json
{
  "success": true,
  "document": {
    "id": "doc-789",
    "status": "ready",
    "lastModifiedDate": "2025-10-21T10:00:00Z"
  }
}
```

### API-PDE-4: 委員会提出リクエスト作成

**エンドポイント**: `POST /api/committee-submissions/requests`

**Request**:
```json
{
  "documentId": "doc-789",
  "postId": "post-123",
  "requestedBy": "OH-NS-2024-015",
  "requestedByLevel": 7,
  "targetCommittee": "業務改善委員会"
}
```

**Response**:
```json
{
  "success": true,
  "request": {
    "id": "req-101",
    "documentId": "doc-789",
    "postId": "post-123",
    "status": "pending",
    "requestedBy": "OH-NS-2024-015",
    "requestedByName": "鈴木副主任",
    "requestedByLevel": 7,
    "requestedDate": "2025-10-21T11:00:00Z",
    "targetCommittee": "業務改善委員会"
  }
}
```

**権限要件**: Level 7+ のみ実行可能

### API-PDE-5: 委員会提出リクエスト承認

**エンドポイント**: `POST /api/committee-submissions/requests/:requestId/approve`

**Request**:
```json
{
  "reviewedBy": "OH-NS-2024-020",
  "reviewedByLevel": 8,
  "reviewNotes": "承認します。委員会で審議してください。"
}
```

**Response**:
```json
{
  "success": true,
  "request": {
    "id": "req-101",
    "status": "approved",
    "reviewedBy": "OH-NS-2024-020",
    "reviewedByName": "田中師長",
    "reviewedByLevel": 8,
    "reviewedDate": "2025-10-21T12:00:00Z",
    "reviewNotes": "承認します。委員会で審議してください。"
  },
  "document": {
    "id": "doc-789",
    "status": "submitted",
    "submittedDate": "2025-10-21T12:00:00Z",
    "submittedBy": "OH-NS-2024-020"
  }
}
```

**権限要件**: Level 8+ のみ実行可能

### API-PDE-6: 議題提案書一覧取得（管理用）

**エンドポイント**: `GET /api/proposal-documents`

**Query Parameters**:
```
?status=draft | under_review | ready | submitted
&agendaLevel=DEPT_REVIEW | DEPT_AGENDA | FACILITY_AGENDA | CORP_REVIEW | CORP_AGENDA
&createdBy=OH-NS-2024-010
&limit=50
&offset=0
```

**Response**:
```json
{
  "success": true,
  "documents": [
    {
      "id": "doc-789",
      "title": "【業務改善】夜勤引継ぎ時間を15分延長...",
      "agendaLevel": "DEPT_AGENDA",
      "status": "draft",
      "createdBy": { ... },
      "createdDate": "2025-10-20T10:00:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

---

## 🚨 不足項目の洗い出し

### 1. テーブル不足

| 不足項目 | 現状 | 必要な対応 | 優先度 |
|---------|------|----------|-------|
| **ProposalDocument テーブル** | ❌ なし | 新規テーブル作成 | 🔴 超重要 |
| **ProposalAuditLog テーブル** | ❌ なし | 新規テーブル作成 | 🔴 超重要 |
| **SubmissionRequest テーブル** | ❌ なし | 新規テーブル作成 | 🔴 超重要 |
| **Post.proposalDocuments リレーション** | ❌ なし | リレーション追加 | 🔴 超重要 |

### 2. API不足

| 不足API | 現状 | 必要な対応 | 優先度 |
|--------|------|----------|-------|
| **GET /api/proposal-documents/:documentId** | ❌ なし | 新規実装 | 🔴 超重要 |
| **PUT /api/proposal-documents/:documentId** | ❌ なし | 新規実装 | 🔴 超重要 |
| **PATCH /api/proposal-documents/:documentId/status** | ❌ なし | 新規実装 | 🟡 中 |
| **POST /api/committee-submissions/requests** | ❌ なし | 新規実装 | 🔴 超重要 |
| **POST /api/committee-submissions/requests/:requestId/approve** | ❌ なし | 新規実装 | 🔴 超重要 |
| **GET /api/proposal-documents** | ❌ なし | 新規実装（管理用） | 🟢 低 |

### 3. サービス実装不足

| 不足サービス | 現状 | 必要な対応 | 優先度 |
|------------|------|----------|-------|
| **proposalAnalyzer.ts (投票・コメント分析)** | ❌ なし | 新規実装 | 🔴 超重要 |
| **ProposalAuditService.ts (監査ログ)** | ❌ なし | 新規実装 | 🔴 超重要 |
| **ProposalPermissionService統合** | ✅ 既存 | 動作確認のみ | 🟢 低 |

### 4. 医療システム連携不足

| 不足連携 | 現状 | 必要な対応 | 優先度 |
|---------|------|----------|-------|
| **委員会マスタAPI** | ❌ なし | 医療システム実装依頼 | 🟡 中 |
| **委員会決定Webhook** | ❌ なし | 医療システム実装依頼 | 🟢 低（将来） |

---

## 📝 実装優先順位

### Phase 1: 基本機能実装（最優先）

**スケジュール**: 10/22-10/30（9日間）

**実装内容**:
1. ✅ ProposalDocument テーブル作成
2. ✅ ProposalAuditLog テーブル作成
3. ✅ SubmissionRequest テーブル作成
4. ✅ API-PDE-1: 議題提案書取得
5. ✅ API-PDE-2: 議題提案書編集
6. ✅ API-PDE-3: 提出準備完了マーク
7. ✅ proposalAnalyzer.ts 実装（投票・コメント分析）
8. ✅ ProposalAuditService.ts 実装

**成功基準**:
- ProposalDocumentEditor.tsx が実APIで動作
- 提案書の閲覧・編集・ステータス更新が可能
- 監査ログが正しく記録される

### Phase 2: 委員会提出フロー（重要）

**スケジュール**: 10/31-11/7（7日間）

**実装内容**:
1. ✅ API-PDE-4: 委員会提出リクエスト作成
2. ✅ API-PDE-5: 委員会提出リクエスト承認
3. ✅ 権限チェック実装（Level 7+, Level 8+）
4. ✅ 委員会提出フロー統合

**成功基準**:
- Level 7+が委員会提出リクエストを作成できる
- Level 8+が提出リクエストを承認できる
- 承認後、提案書が委員会に提出される

### Phase 3: 高度機能（オプション）

**スケジュール**: 11/8-11/15（7日間）

**実装内容**:
1. ✅ API-PDE-6: 議題提案書一覧取得
2. ✅ 委員会マスタAPI連携
3. ✅ 委員会決定Webhook受信
4. ✅ PDF出力機能

**成功基準**:
- 提案書一覧の取得・フィルタリングが可能
- 委員会マスタと連携できる
- 委員会決定を受信できる

---

## 🔗 関連ドキュメント

- **PostManagement_DB要件分析_20251009.md** - 投稿管理システム全体
- **CommitteeManagement_DB要件分析_20251009.md** - 委員会管理システム
- **unified-account-level-definition.json** - 13段階権限レベル定義
- **DM-DEF-2025-1008-001** - データ管理責任分界点定義書

---

**文書終了**
