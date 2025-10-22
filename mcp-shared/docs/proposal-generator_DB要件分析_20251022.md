# ProposalGenerator（議題提案書ジェネレーター） DB要件分析

**文書番号**: DB-REQ-PG-2025-1022-001
**作成日**: 2025年10月22日
**対象ページ**: ProposalGeneratorPage (`/proposal-generator`)
**対象URL**: https://voicedrive-v100.vercel.app/proposal-generator
**対象ユーザー**: レベル5以上（副主任以上）
**ステータス**: ✅ DB構築前分析完了

---

## 📋 エグゼクティブサマリー

### ページ概要

**ProposalGeneratorPage**は、一定の投票スコアに達した投稿から、委員会提出用の正式な議題提案書を自動生成する機能です。

**主要機能**:
1. **議題選択**: 閾値達成済みの投稿リスト表示（100点以上）
2. **自動生成**: 投票データから議題提案書を自動生成
3. **文書編集**: 生成された提案書をセクション別に編集
4. **エクスポート**: PDF/Word形式で出力

### 現状の問題点

| 問題点 | 現状 | 必要な対応 |
|--------|------|-----------|
| **議題データ** | 100%ダミーデータ（3件ハードコード） | `Post`テーブルから実データ取得 |
| **投票集計** | ダミーの投票数・スコア | `Vote`, `VoteHistory`から実集計 |
| **コメント抽出** | ダミーコメント | `Comment`テーブルから実データ取得 |
| **文書保存** | 保存機能未実装（console.logのみ） | `ProposalDocument`テーブルに保存 |
| **委員会情報** | ハードコード（小原病院のみ5委員会） | 医療システムから委員会マスタ取得 |
| **文書履歴** | 編集履歴未保存 | `ProposalAuditLog`テーブルに記録 |

---

## 🎯 ページ機能の詳細分析

### 1. 議題選択パネル（左側）

#### 1.1 表示データ

**現在のハードコードデータ** (ProposalGeneratorPage.tsx:55-137):
```typescript
const proposals: ProposalData[] = [
  {
    id: '1',
    title: '看護部の夜勤シフト最適化提案',
    department: '看護部',
    currentScore: 85,
    participantCount: 45,
    submittedAt: new Date('2024-03-15'),
    votes: {
      'strongly-support': 12,
      'support': 18,
      'neutral': 8,
      'oppose': 5,
      'strongly-oppose': 2
    },
    topComments: [
      {
        author: '田中看護師長',
        content: '現場の負担軽減に直結する重要な提案です。',
        likes: 23
      }
    ]
  },
  // ... 他2件（電子カルテUI改善、福利厚生改革）
];
```

**必要なデータソース**:

| フィールド | 現状 | 必要なデータソース | 責任 |
|-----------|------|------------------|------|
| `id` | ダミー | `Post.id` | VoiceDrive |
| `title` | ダミー | `Post.content`（AI要約 or 先頭100文字） | VoiceDrive |
| `department` | ダミー | `User.department`（`Post.authorId`経由） | 医療システム（キャッシュ） |
| `currentScore` | ダミー | `HybridVotingCalculator`で計算 | VoiceDrive |
| `participantCount` | ダミー | `Vote.userId` DISTINCT COUNT | VoiceDrive |
| `submittedAt` | ダミー | `Post.createdAt` | VoiceDrive |
| `votes` | ダミー | `Vote.option` GROUP BY | VoiceDrive |
| `topComments` | ダミー | `Comment` ORDER BY likeCount DESC LIMIT 3 | VoiceDrive |

#### 1.2 抽出条件

**現在のフィルタリング**: なし（全議題を表示）

**必要な抽出条件**:
1. ✅ `Post.status` が以下のいずれか:
   - `PENDING_DEPUTY_DIRECTOR_REVIEW` (100点到達)
   - `APPROVED_FOR_COMMITTEE` (委員会提出承認済み)
2. ✅ `currentScore >= 100` (施設議題レベル)
3. ✅ 委員会未提出または再提出が必要
4. ✅ 削除済み・却下済みを除外

**必要なAPI**:
```typescript
GET /api/proposals?minScore=100&status=PENDING_DEPUTY_DIRECTOR_REVIEW,APPROVED_FOR_COMMITTEE
```

---

### 2. ProposalEscalationEngine（議題エスカレーションエンジン）

#### 2.1 委員会情報のハードコード

**現在の実装** (ProposalEscalationEngine.ts:96-128):
```typescript
private readonly committees: CommitteeInfo[] = [
  {
    name: '医療安全管理委員会',
    schedule: '第2火曜日',
    facility: '小原病院',
    targetCategories: ['医療安全', '患者安全', 'インシデント対策']
  },
  {
    name: '感染対策委員会',
    schedule: '第3水曜日',
    facility: '小原病院',
    targetCategories: ['感染対策', '衛生管理', '感染予防']
  },
  {
    name: '業務改善委員会',
    schedule: '第4木曜日',
    facility: '小原病院',
    targetCategories: ['業務改善', '効率化', 'コスト削減']
  },
  {
    name: '小原病院運営委員会',
    schedule: '月2回（第2・第4月曜日）',
    facility: '小原病院',
    targetCategories: ['施設運営', '戦略提案', '組織改革']
  },
  {
    name: '病院意思決定会議',
    schedule: '月1回（第1金曜日）',
    facility: '小原病院',
    targetCategories: ['経営判断', '重要決定', '投資案件']
  }
];
```

**問題点**:
- ハードコードのため、委員会の追加・変更がコード変更必要
- 他施設（立神リハビリ等）の委員会に対応不可
- 医療システムとの二重管理

**解決策**: 医療システムから委員会マスタをAPI取得

#### 2.2 議題提案書テンプレート

**テンプレート構造** (ProposalEscalationEngine.ts:330-377):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{committee_name}} 議題提案書
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

提案ID: {{proposal_id}}
提出日: {{submission_date}}
次回委員会: {{committee_date}}

【議題名】
{{proposal_title}}

【提案者】
{{proposer}} ({{department}})

【背景・現状の課題】
{{proposal_background}}

【提案内容】
{{proposal_content}}

【期待される効果】
{{expected_effect}}

【必要予算】
{{required_budget}}

【投票結果サマリー】
※VoiceDriveシステムより自動集計
- 総投票スコア: [システム自動入力]
- 賛成率: [システム自動入力]
- 主な賛成意見: [システム自動入力]
- 主な懸念事項: [システム自動入力]

【委員会での検討事項】
1. 実施可否の判断
2. 実施時期・スケジュール
3. 担当部署・責任者の決定
4. 予算承認
5. その他留意事項
```

**プレースホルダーのデータソース**:

| プレースホルダー | データソース | テーブル | 備考 |
|-----------------|-------------|---------|------|
| `{{proposal_id}}` | `Post.id` | `Post` | ✅ 実装済み |
| `{{proposal_title}}` | AI要約 or `Post.content`先頭100文字 | `Post` | ⚠️ AI要約未実装 |
| `{{proposal_background}}` | 未実装 | - | ⚠️ 将来実装 |
| `{{proposal_content}}` | `Post.content` | `Post` | ✅ 実装済み |
| `{{expected_effect}}` | 未実装 | - | ⚠️ 将来実装 |
| `{{required_budget}}` | 未実装 | - | ⚠️ 将来実装 |
| `{{proposer}}` | `User.name` | `User` | ✅ 実装済み（JOIN） |
| `{{department}}` | `User.department` | `User` | ✅ 実装済み（医療システムキャッシュ） |
| `{{submission_date}}` | `new Date().toLocaleDateString('ja-JP')` | システム日時 | ✅ 実装済み |
| `{{committee_name}}` | `CommitteeInfo.name` | 医療システムAPI | ⚠️ ハードコード |
| `{{committee_date}}` | `CommitteeInfo.schedule` | 医療システムAPI | ⚠️ ハードコード |

---

### 3. AgendaDocumentEditor（文書エディター）

#### 3.1 編集可能セクション

**セクション定義** (AgendaDocumentEditor.tsx:86-129):
```typescript
const sections: EditableSection[] = [
  {
    id: 'title',
    label: '議題名',
    value: proposalData.title,
    multiline: false,
    required: true
  },
  {
    id: 'background',
    label: '背景・現状の課題',
    value: proposalData.background || '',
    multiline: true,
    required: false
  },
  {
    id: 'content',
    label: '提案内容',
    value: proposalData.content,
    multiline: true,
    required: true
  },
  {
    id: 'expectedEffect',
    label: '期待される効果',
    value: proposalData.expectedEffect || '',
    multiline: true,
    required: false
  },
  {
    id: 'budget',
    label: '必要予算',
    value: proposalData.budget || '未定',
    multiline: false,
    required: false
  },
  {
    id: 'votingSummary',
    label: '投票結果サマリー',
    value: generateVotingSummary(proposalData),
    multiline: true,
    required: false
  }
];
```

#### 3.2 編集履歴

**現在の実装**: ローカルステートのみ（リロード時消失）

**editedSections構造** (AgendaDocumentEditor.tsx:162-178):
```typescript
editedSections: {
  [sectionId]: {
    original: string;
    edited: string;
    editedAt: Date;
    editedBy?: string;
  }
}
```

**必要なDB保存**: `ProposalDocument.editedSections` (JSON形式)

#### 3.3 保存・エクスポート機能

**現在の実装**:
- 保存: `onSave?.(documentToSave)` - 親コンポーネントに渡すのみ
- エクスポート: `console.log('Exporting as:', format)` - 未実装

**必要な実装**:
- 保存: `POST /api/proposal-documents`
- エクスポート: PDF/Word生成 + ダウンロード

---

## 🗄️ 必要なテーブルと不足項目

### ✅ 既存テーブル（利用可能）

#### 1. `Post`テーブル
**用途**: 議題の基本情報

**利用可能フィールド**:
- `id` - 議題ID
- `content` - 提案内容
- `authorId` - 提案者ID
- `createdAt` - 投稿日時
- `status` - ステータス（PENDING_DEPUTY_DIRECTOR_REVIEW等）

**不足フィールド**:
- ⚠️ `title` (議題タイトル) - 現在は`content`に含まれる
- ⚠️ `background` (背景説明) - 未実装
- ⚠️ `expectedEffect` (期待される効果) - 未実装
- ⚠️ `requiredBudget` (必要予算) - 未実装

**推奨**: Phase 1では`content`から自動抽出、Phase 3で専用フィールド追加検討

#### 2. `Vote`テーブル
**用途**: 投票データ

**利用可能フィールド**:
- `postId`, `userId`, `option`, `timestamp`

**ステータス**: ✅ 変更不要

#### 3. `VoteHistory`テーブル
**用途**: 投票履歴（スコア計算用）

**利用可能フィールド**:
- `voteWeight` - 投票重み

**ステータス**: ✅ 変更不要

#### 4. `Comment`テーブル
**用途**: コメント・意見抽出

**利用可能フィールド**:
- `postId`, `authorId`, `content`, `likeCount`

**不足フィールド**:
- ⚠️ `sentiment` (感情分析結果: positive/negative) - 将来的にAI分析で追加

**推奨**: Phase 1では`likeCount`順で抽出、Phase 4でAI感情分析追加

#### 5. `ProposalDocument`テーブル
**用途**: 生成された議題提案書の保存

**既存フィールド** (schema.prisma:2346-2419):
```prisma
model ProposalDocument {
  id          String @id @default(cuid())
  postId      String @map("post_id")
  title       String
  agendaLevel String @map("agenda_level")
  createdById String @map("created_by_id")
  submittedById String? @map("submitted_by_id")

  // 文書内容
  background       String?
  proposalContent  String @map("proposal_content")
  expectedEffect   String? @map("expected_effect")
  requiredBudget   String? @map("required_budget")

  // 投票集計
  votingSummary    String? @map("voting_summary")
  supportComments  String? @map("support_comments")
  concerns         String?

  // 編集履歴
  editedSections   Json? @map("edited_sections")

  // 日時
  generatedAt      DateTime @default(now()) @map("generated_at")
  lastEditedAt     DateTime? @map("last_edited_at")
  submittedAt      DateTime? @map("submitted_at")

  // リレーション
  createdBy   User @relation("ProposalCreator", fields: [createdById], references: [id])
  submittedBy User? @relation("ProposalSubmitter", fields: [submittedById], references: [id])
}
```

**ステータス**: ✅ 既に完璧に実装済み！

**不足フィールド**:
- ⚠️ `committeeId` (提出先委員会ID)
- ⚠️ `committeeSchedule` (委員会開催日)
- ⚠️ `documentType` (文書種別)

**推奨**: Phase 2で追加

#### 6. `ProposalAuditLog`テーブル
**用途**: 文書の編集・エクスポート履歴

**既存フィールド** (schema.prisma:2421-2495):
```prisma
model ProposalAuditLog {
  id            String   @id @default(cuid())
  documentId    String   @map("document_id")
  userId        String   @map("user_id")
  userName      String   @map("user_name")
  userLevel     Decimal  @map("user_level")
  action        String   // 'create', 'edit', 'submit', 'export'
  sectionEdited String?  @map("section_edited")
  changes       String?  // JSON形式の変更内容
  exportFormat  String?  @map("export_format")
  timestamp     DateTime @default(now())
}
```

**ステータス**: ✅ 既に完璧に実装済み！

---

### ⚠️ 不足項目（新規追加が必要）

#### 不足項目1: 委員会マスタ

**必要性**: ProposalEscalationEngineで委員会情報がハードコードされている

**提案**: ✅ **医療システムから取得（VoiceDriveでキャッシュ）**

**VoiceDrive側のキャッシュテーブル案**:
```prisma
model Committee {
  id                String   @id @default(cuid())
  committeeId       String   @unique @map("committee_id")
  name              String
  schedule          String   // "第2火曜日"
  facility          String
  targetCategories  Json     // ["医療安全", ...]
  isActive          Boolean  @default(true) @map("is_active")
  syncedAt          DateTime @default(now()) @map("synced_at")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@index([facility])
  @@index([isActive])
  @@map("committees")
}
```

#### 不足項目2: ProposalDocument拡張フィールド

**提案**: `ProposalDocument`テーブルに以下を追加
```prisma
model ProposalDocument {
  // ... 既存フィールド
  committeeId       String?  @map("committee_id")
  committeeSchedule String?  @map("committee_schedule")
  documentType      String   @default("議題提案書") @map("document_type")
  // ...
}
```

---

## ✅ データ管理責任分界点

### VoiceDrive管轄

| データ項目 | 理由 |
|-----------|------|
| 投稿（Post） | VoiceDrive固有データ |
| 投票（Vote） | VoiceDrive固有データ |
| コメント（Comment） | VoiceDrive固有データ |
| 議題提案書（ProposalDocument） | VoiceDrive固有データ |
| 文書編集履歴（ProposalAuditLog） | VoiceDrive固有データ |

### 医療システム管轄（APIまたはWebhook提供）

| データ項目 | 提供方法 | 理由 |
|-----------|---------|------|
| 委員会マスタ | API | 組織マスタデータ |
| 委員会スケジュール | API | 組織マスタデータ |
| 職員情報（氏名、部署） | API（キャッシュ済み） | 既存実装 |

### 共有データ（VoiceDriveがキャッシュ）

| データ項目 | マスタ | キャッシュ | 同期方法 |
|-----------|--------|-----------|---------|
| 委員会情報 | 医療システム | VoiceDrive | 日次バッチ or Webhook |

---

## 🚀 実装フェーズ

### Phase 1: 既存データ利用（即座に実装可能）

**期間**: 2週間

**実装内容**:
1. ✅ `Post`, `Vote`, `Comment`から実データ取得
2. ✅ 投票集計ロジック実装
3. ✅ コメント抽出ロジック実装
4. ✅ `ProposalDocument`への保存機能実装
5. ✅ `ProposalAuditLog`への記録機能実装

**必要なAPI**:
```typescript
GET /api/proposals?minScore=100&status=PENDING_DEPUTY_DIRECTOR_REVIEW
GET /api/proposals/:id/votes
GET /api/proposals/:id/comments?sort=likeCount&limit=3
POST /api/proposal-documents
POST /api/proposal-documents/:id/export?format=pdf
```

**DB変更**: ❌ 不要（既存テーブルで実装可能）

---

### Phase 2: 委員会マスタ統合（医療システム連携）

**期間**: 1週間

**実装内容**:
1. ✅ 医療システムから委員会マスタAPI取得
2. ✅ `Committee`テーブルへキャッシュ
3. ✅ 日次バッチ同期またはWebhook連携
4. ✅ ProposalEscalationEngineのハードコード削除
5. ✅ `ProposalDocument`に委員会情報追加

**必要なAPI（医療システム側）**:
```typescript
GET /api/v2/committees?facility=小原病院
```

**DB変更**: ✅ `Committee`テーブル追加、`ProposalDocument`フィールド追加

---

### Phase 3: PDF/Word エクスポート実装

**期間**: 1週間

**実装内容**:
1. ✅ PDF生成（`jsPDF`ライブラリ）
2. ✅ Word生成（`docx`ライブラリ）
3. ✅ テンプレートデザイン
4. ✅ エクスポート履歴記録

**DB変更**: ❌ 不要（`ProposalAuditLog.exportFormat`既存）

---

## 📝 実装チェックリスト

### Phase 1: 基本実装

- [ ] GET /api/proposals?minScore=100 API実装
- [ ] 投票集計ロジック実装（HybridVotingCalculator活用）
- [ ] コメント抽出ロジック実装（いいね順TOP3）
- [ ] POST /api/proposal-documents API実装
- [ ] ProposalAuditLog記録機能実装
- [ ] ProposalGeneratorPageのダミーデータ削除
- [ ] 実データ表示の統合テスト

### Phase 2: 委員会マスタ統合

- [ ] 医療システムAPI仕様確認（GET /api/v2/committees）
- [ ] Committeeテーブル追加（マイグレーション）
- [ ] 委員会同期バッチ実装
- [ ] ProposalEscalationEngineのハードコード削除
- [ ] 委員会選択ロジックのDB化

### Phase 3: エクスポート機能

- [ ] jsPDFライブラリ導入
- [ ] PDF生成機能実装
- [ ] docxライブラリ導入
- [ ] Word生成機能実装
- [ ] エクスポート履歴記録
- [ ] ダウンロード機能テスト

---

## 📞 医療システムチームへの確認事項

### 確認-1: 委員会マスタAPI

**質問**:
1. 医療システムに委員会マスタは存在しますか？
2. 以下のフィールドは取得可能ですか？
   - `committeeId`, `name`, `schedule`, `facility`, `targetCategories`, `isActive`
3. API実装は可能ですか？（`GET /api/v2/committees`）
4. 現在、何委員会が登録されていますか？

### 確認-2: 委員会スケジュール管理

**質問**:
1. 委員会の開催スケジュールは定期的ですか？（例: 毎月第2火曜日）
2. 不定期開催の委員会もありますか？
3. 次回開催日をAPI経由で取得可能ですか？

---

## 📚 関連ドキュメント

- **ProposalGeneratorPage.tsx** - メインコンポーネント（347行）
- **ProposalEscalationEngine.ts** - 議題エスカレーションロジック（502行）
- **AgendaDocumentEditor.tsx** - 文書エディターコンポーネント（384行）
- **schema.prisma** - ProposalDocument, ProposalAuditLog定義
- **データ管理責任分界点定義書_20251008.md** - データ責任分担

---

**文書終了**

最終更新: 2025年10月22日
作成者: VoiceDriveチーム
レビュー: 未実施
