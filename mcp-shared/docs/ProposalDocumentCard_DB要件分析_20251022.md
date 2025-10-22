# ProposalDocumentCard コンポーネント DB要件分析

**作成日**: 2025年10月22日
**対象コンポーネント**: ProposalDocumentCard.tsx
**分析者**: Claude Code
**ステータス**: ✅ 完了

---

## 📋 コンポーネント概要

### **目的**
議題提案書（ProposalDocument）をカード形式で一覧表示するUIコンポーネント。管理職が現場の声をまとめて委員会に提出するための客観的書類を可視化します。

### **主要機能**
1. ✅ 提案書の基本情報表示（タイトル、作成者、作成日）
2. ✅ 議題レベル表示（PENDING/DEPT_REVIEW/DEPT_AGENDA/FACILITY_AGENDA/CORP_REVIEW/CORP_AGENDA）
3. ✅ ステータス表示（draft/under_review/ready/submitted/approved/rejected）
4. ✅ 投票分析統計（総投票数、支持率、コメント数）
5. ✅ 提案内容プレビュー（summary）
6. ✅ 推奨レベル表示（strongly_recommend/recommend/neutral/not_recommend）
7. ✅ アクションボタン（詳細表示、編集、提出）
8. ✅ 提出済み情報表示（提出先委員会、提出日時）

### **対象ユーザー**
- **管理職（Level 11-12）**: 提案書の作成・編集
- **院長・施設長（Level 13-14）**: 提案書のレビュー・承認
- **委員会メンバー**: 提出された提案書の閲覧

---

## 🗄️ データソース分析

### **使用するデータモデル**

#### 1. ProposalDocument（議題提案書）
コンポーネントのメインデータソース

```typescript
interface ProposalDocument {
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

  // 提案内容
  summary: string;
  background: string;
  objectives: string;
  expectedEffects: string;
  concerns: string;
  counterMeasures: string;

  // データ分析
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

#### 2. VoteAnalysis（投票分析）
```typescript
interface VoteAnalysis {
  totalVotes: number;           // ✅ カードに表示
  supportRate: number;          // ✅ カードに表示
  strongSupportRate: number;
  oppositionRate: number;
  neutralRate: number;
  byDepartment?: Array<...>;
  byPosition?: Array<...>;
  byStakeholder?: Array<...>;
}
```

#### 3. CommentAnalysis（コメント分析）
```typescript
interface CommentAnalysis {
  totalComments: number;        // ✅ カードに表示
  supportComments: number;
  concernComments: number;
  proposalComments: number;
  supportSummary: string[];
  concernSummary: string[];
  constructiveProposals: string[];
  keyComments: Array<...>;
}
```

---

## 📊 schema.prisma テーブル分析

### **ProposalDocument テーブル** (schema.prisma: 2293-2331行)

| フィールド名 | Prisma型 | TypeScript型 | カード表示 | ステータス |
|------------|---------|-------------|----------|----------|
| id | String | string | ✅ | ✅ 存在 |
| postId | String | string | - | ✅ 存在 |
| title | String | string | ✅ タイトル | ✅ 存在 |
| agendaLevel | String | AgendaLevel | ✅ レベルバッジ | ✅ 存在 |
| createdById | String | string | - | ✅ 存在 |
| status | String | ProposalDocumentStatus | ✅ ステータスバッジ | ✅ 存在 |
| summary | String | string | ✅ プレビュー | ✅ 存在 |
| background | String | string | - | ✅ 存在 |
| objectives | String | string | - | ✅ 存在 |
| expectedEffects | String | string | - | ✅ 存在 |
| concerns | String | string | - | ✅ 存在 |
| counterMeasures | String | string | - | ✅ 存在 |
| voteAnalysis | Json | VoteAnalysis | ✅ 統計表示 | ✅ 存在 |
| commentAnalysis | Json | CommentAnalysis | ✅ 統計表示 | ✅ 存在 |
| relatedInfo | Json? | RelatedInfo | - | ✅ 存在 |
| managerNotes | String? | string | - | ✅ 存在 |
| additionalContext | String? | string | - | ✅ 存在 |
| recommendationLevel | String? | string | ✅ 推奨レベル | ✅ 存在 |
| targetCommittee | String? | string | ✅ 提出先 | ✅ 存在 |
| submittedDate | DateTime? | Date | ✅ 提出日 | ✅ 存在 |
| submittedById | String? | string | - | ✅ 存在 |
| committeeDecision | Json? | object | - | ✅ 存在 |
| createdAt | DateTime | Date | ✅ 作成日 | ✅ 存在 |
| updatedAt | DateTime | Date | - | ✅ 存在 |
| lastModifiedDate | DateTime | Date | - | ✅ 存在 |

### **リレーション**
| リレーション名 | 対象テーブル | 目的 | ステータス |
|-------------|------------|------|----------|
| createdBy | User | 作成者情報 | ✅ 存在 |
| submittedBy | User | 提出者情報 | ✅ 存在 |
| post | Post | 元の投稿 | ✅ 存在 |
| auditLogs | ProposalAuditLog | 監査ログ | ✅ 存在 |
| submissionRequests | CommitteeSubmissionRequest | 提出リクエスト | ✅ 存在 |

---

## ✅ 不足項目分析

### **結果: 不足フィールド 0個**

**素晴らしい！** ProposalDocumentテーブルは完璧に設計されており、ProposalDocumentCardコンポーネントが必要とするすべてのデータフィールドが存在します。

#### **確認済み項目**
✅ 基本情報（id, title, status, agendaLevel）
✅ 作成者情報（createdBy リレーション）
✅ 日付情報（createdAt, submittedDate）
✅ 投票分析（voteAnalysis JSON: totalVotes, supportRate）
✅ コメント分析（commentAnalysis JSON: totalComments）
✅ 提案内容（summary）
✅ 推奨レベル（recommendationLevel）
✅ 委員会提出情報（targetCommittee, submittedDate, submittedBy）
✅ ステータス管理（status フィールド）

---

## 🔄 データ管理責任分界

### **VoiceDrive責任範囲** ✅
ProposalDocumentCardコンポーネントは**100% VoiceDrive管理**です。

| データ項目 | 管理責任 | 理由 |
|----------|---------|------|
| ProposalDocument | VoiceDrive | VoiceDrive独自機能（議題提案書システム） |
| VoteAnalysis | VoiceDrive | 投稿の投票データから生成 |
| CommentAnalysis | VoiceDrive | 投稿のコメントから生成 |
| User情報 | VoiceDrive | createdByリレーション経由 |
| Post情報 | VoiceDrive | 元の投稿データ |

### **医療システム連携** ❌ 不要
このコンポーネントは医療システムとの連携を必要としません。すべてのデータはVoiceDrive内部で完結します。

---

## 🎨 表示ロジック分析

### **議題レベルの色分け**
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

### **ステータスの色分け**
```typescript
const statusConfig = {
  draft: { label: '下書き', color: 'bg-gray-700/30 text-gray-400' },
  under_review: { label: 'レビュー中', color: 'bg-blue-900/30 text-blue-400' },
  ready: { label: '提出準備完了', color: 'bg-green-900/30 text-green-400' },
  submitted: { label: '委員会提出済み', color: 'bg-purple-900/30 text-purple-400' },
  approved: { label: '承認', color: 'bg-green-900/30 text-green-400' },
  rejected: { label: '却下', color: 'bg-red-900/30 text-red-400' }
};
```

### **推奨レベルの色分け**
```typescript
const recommendationColors = {
  strongly_recommend: 'bg-green-900/30 text-green-400',
  recommend: 'bg-blue-900/30 text-blue-400',
  neutral: 'bg-gray-800/30 text-gray-400',
  not_recommend: 'bg-orange-900/30 text-orange-400'
};
```

---

## 🔧 必要なAPI仕様

### **1. GET /api/proposal-documents**
提案書一覧を取得

**クエリパラメータ**:
```typescript
{
  status?: ProposalDocumentStatus;
  agendaLevel?: AgendaLevel;
  createdById?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'submittedDate';
  sortOrder?: 'asc' | 'desc';
}
```

**レスポンス**:
```typescript
{
  documents: ProposalDocument[];
  total: number;
  hasMore: boolean;
}
```

### **2. GET /api/proposal-documents/:id**
提案書の詳細を取得

**レスポンス**:
```typescript
{
  document: ProposalDocument;
}
```

### **3. PUT /api/proposal-documents/:id**
提案書を更新（下書き状態のみ）

**リクエストボディ**:
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
  recommendationLevel?: string;
}
```

### **4. POST /api/proposal-documents/:id/submit**
提案書を委員会に提出

**リクエストボディ**:
```typescript
{
  targetCommittee: string;
  userId: string;
}
```

**レスポンス**:
```typescript
{
  success: true;
  document: ProposalDocument;
  submissionRequest: CommitteeSubmissionRequest;
}
```

### **5. DELETE /api/proposal-documents/:id**
提案書を削除（下書き状態のみ）

**レスポンス**:
```typescript
{
  success: true;
  deletedId: string;
}
```

---

## 📐 JSON構造例

### **voteAnalysis JSON**
```json
{
  "totalVotes": 85,
  "supportRate": 78.5,
  "strongSupportRate": 45.2,
  "oppositionRate": 12.3,
  "neutralRate": 9.2,
  "byDepartment": [
    {
      "department": "看護部",
      "votes": {
        "strong_support": 15,
        "support": 8,
        "neutral": 3,
        "oppose": 2,
        "strong_oppose": 0
      },
      "supportRate": 82.1
    }
  ]
}
```

### **commentAnalysis JSON**
```json
{
  "totalComments": 42,
  "supportComments": 28,
  "concernComments": 10,
  "proposalComments": 4,
  "supportSummary": [
    "業務効率化に期待",
    "患者さんの満足度向上につながる"
  ],
  "concernSummary": [
    "導入コストが気になる",
    "研修時間の確保が必要"
  ],
  "constructiveProposals": [
    "段階的な導入を検討",
    "マニュアル整備を先行実施"
  ],
  "keyComments": [
    {
      "content": "この提案は現場の声を反映している",
      "author": "看護師A",
      "type": "support",
      "likes": 15
    }
  ]
}
```

---

## 🎯 UI/UX要件

### **レスポンシブデザイン**
- ✅ カードレイアウト（grid/flex対応）
- ✅ モバイル最適化（統計グリッド3列）
- ✅ タッチ操作対応

### **アクセシビリティ**
- ✅ 色覚サポート（色+ラベル併用）
- ✅ キーボードナビゲーション
- ✅ スクリーンリーダー対応

### **インタラクション**
- ✅ ホバーエフェクト（border変化）
- ✅ クリック時の詳細画面遷移
- ✅ ステータス別のアクションボタン表示制御

---

## 🔐 権限制御

### **表示権限**
- **Level 1-10（一般職員）**: 提出済みの提案書のみ閲覧可能
- **Level 11-12（管理職）**: 自分が作成した提案書の編集・提出
- **Level 13-14（院長・施設長）**: すべての提案書の閲覧・承認
- **Level 15-18（法人・理事）**: すべての提案書の閲覧

### **操作権限**
| アクション | 必要権限 | 条件 |
|----------|---------|------|
| 詳細を見る | Level 1+ | 誰でも |
| 編集 | Level 11+ | status === 'draft' かつ createdBy === currentUser |
| 提出 | Level 11+ | status === 'ready' かつ createdBy === currentUser |
| 削除 | Level 11+ | status === 'draft' かつ createdBy === currentUser |

---

## 📝 実装チェックリスト

### **フロントエンド**
- [x] ProposalDocumentCard.tsx 実装完了
- [ ] API統合（fetch/React Query）
- [ ] ローディング状態の実装
- [ ] エラーハンドリング
- [ ] ページネーション実装

### **バックエンド**
- [ ] GET /api/proposal-documents 実装
- [ ] GET /api/proposal-documents/:id 実装
- [ ] PUT /api/proposal-documents/:id 実装
- [ ] POST /api/proposal-documents/:id/submit 実装
- [ ] DELETE /api/proposal-documents/:id 実装
- [ ] 権限チェックミドルウェア実装

### **データベース**
- [x] ProposalDocument テーブル存在確認 ✅
- [x] ProposalAuditLog テーブル存在確認 ✅
- [x] CommitteeSubmissionRequest テーブル存在確認 ✅
- [ ] インデックス最適化
- [ ] テストデータ投入

---

## 🚀 次のステップ

### **Phase 1: API実装** (優先度: 高)
1. proposal-documents.routes.ts 作成
2. 5つのAPIエンドポイント実装
3. Prismaクエリ最適化（include指定）
4. 権限チェック実装

### **Phase 2: フロントエンド統合** (優先度: 高)
1. ProposalDocumentList ページ作成
2. React Query統合
3. ページネーション実装
4. フィルタ機能実装

### **Phase 3: テスト** (優先度: 中)
1. Unit tests作成
2. Integration tests作成
3. E2E tests作成
4. 手動テスト実施

---

## 💡 技術的推奨事項

### **パフォーマンス最適化**
- **JSON解析キャッシュ**: voteAnalysis/commentAnalysisの解析結果をメモ化
- **画像遅延読み込み**: カード内の画像がある場合はLazy Loading
- **仮想スクロール**: 大量の提案書表示時に検討

### **データ整合性**
- **楽観的更新**: 編集時のUIレスポンス向上
- **バリデーション**: status遷移の整合性チェック
- **監査ログ**: すべての変更をProposalAuditLogに記録

### **セキュリティ**
- **XSS対策**: summary/backgroundのサニタイズ
- **CSRF対策**: トークン検証
- **Rate Limiting**: API呼び出し制限

---

## 📊 結論

**ProposalDocumentCardコンポーネントのDB要件は完璧に満たされています。**

### ✅ 完了項目
- ProposalDocumentテーブル: **完全一致**
- 不足フィールド: **0個**
- schema.prisma変更: **不要**

### 🎯 次のアクション
1. **暫定マスターリスト作成** → API仕様の詳細化
2. **APIルート実装** → proposal-documents.routes.ts
3. **フロントエンド統合** → ProposalDocumentListページ

---

**作成者**: Claude Code
**最終更新**: 2025年10月22日
**レビュー状態**: 要レビュー
