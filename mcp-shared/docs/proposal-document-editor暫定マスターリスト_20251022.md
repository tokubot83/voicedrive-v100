# proposal-document-editor 暫定マスターリスト

**文書番号**: MASTER-PDE-2025-1022-001
**作成日**: 2025年10月22日
**対象ページ**: `/proposal-document-editor/:documentId` (Proposal Document Editor)
**URL**: https://voicedrive-v100.vercel.app/proposal-document-editor/:documentId
**権限レベル**: Level 7以上（主任・係長以上）

---

## 📋 ページ概要

### 基本情報
| 項目 | 内容 |
|-----|------|
| ページ名 | 議題提案書編集ページ |
| ルート | `/proposal-document-editor/:documentId` |
| コンポーネント | `src/pages/ProposalDocumentEditor.tsx` |
| 主要サービス | ProposalDocumentGenerator, CommitteeSubmissionService |
| 必要権限 | Level 7以上（主任・係長以上） |
| レイアウト | サイドバー付きレイアウト（2カラム） |

### 機能概要
投稿が50点（部署議題）または100点（施設議題）に到達すると、投稿データから議題提案書が**自動生成**されます。このページでは、管理職（Level 7以上）が以下を実施します：

1. **閲覧**: 自動生成された提案内容（要約、背景、目的、期待される効果、懸念点、対応策）
2. **補足**: 管理職による補足説明・追加の文脈・推奨レベルの設定
3. **編集**: managerNotes, additionalContext, recommendationLevel の編集
4. **提出準備**: ステータスを「提出準備完了」に変更
5. **委員会提出リクエスト**: Level 7+が提出先委員会を選択して提出リクエストを作成

### 主要な4つの操作
1. **閲覧モード** - 自動生成された議題提案書の確認
2. **編集モード** - 管理職による補足情報の追記
3. **提出準備完了** - 委員会提出の準備完了マーク
4. **委員会提出リクエスト** - Level 7+による提出リクエスト作成（Level 8+が承認）

---

## 🎯 権限レベル別機能

| 権限レベル | 役職例 | 利用可能機能 |
|-----------|-------|------------|
| Level 1-6 | 一般職員 | アクセス不可 |
| Level 7-9 | 主任・係長 | 自分が作成した議題提案書の閲覧・編集・提出リクエスト |
| Level 8+ | 課長・看護師長以上 | 全ての議題提案書の閲覧・編集 + 提出リクエストの承認・却下 |
| Level 10+ | 運営委員会メンバー | 全機能利用可能 |

---

## 📊 データベーステーブル構成

### 主要テーブル一覧

| # | テーブル名 | 用途 | ステータス | データ管理責任 |
|---|----------|------|----------|-------------|
| 1 | ProposalDocument | 議題提案書 | ✅ 実装済み | VoiceDrive（自動生成 + 管理職編集） |
| 2 | CommitteeSubmissionRequest | 委員会提出リクエスト | ✅ 実装済み | VoiceDrive |
| 3 | ProposalAuditLog | 議題提案書監査ログ | ✅ 実装済み | VoiceDrive |
| 4 | Post | 投稿（元データ） | ✅ 実装済み | VoiceDrive |
| 5 | User | 職員情報（キャッシュ） | ✅ 実装済み | 医療システム（VoiceDriveはキャッシュ） |

---

## 📁 ファイル構成

### コンポーネント
```
src/pages/ProposalDocumentEditor.tsx              # メインページ (410行)
src/components/proposal/ProposalDocumentCard.tsx  # 議題提案書カード (175行)
```

### サービス
```
src/services/ProposalDocumentGenerator.ts         # 議題提案書生成・管理 (333行)
src/services/CommitteeSubmissionService.ts        # 委員会提出フロー (218行)
src/services/ProposalAuditService.ts              # 監査ログ記録
src/services/ProposalPermissionService.ts         # 権限管理
```

### 型定義
```
src/types/proposalDocument.ts                     # 議題提案書型定義 (170行)
src/types/committee.ts                            # 委員会関連型定義
```

### ユーティリティ
```
src/utils/proposalAnalyzer.ts                     # 投票・コメント分析ロジック
```

---

## 🔄 データフロー

### フロー1: 議題提案書の自動生成

```
[投稿が50点/100点到達]
    ↓ スコア到達イベント
[ProposalDocumentGenerator.generateDocument()]
    ↓ 投稿データから自動生成
[ProposalDocument] INSERT
    ├─ title: 自動生成（投稿内容から）
    ├─ summary: 投稿内容の要約
    ├─ background: 背景・経緯（投票データから分析）
    ├─ objectives: 目的（proposalTypeから決定）
    ├─ expectedEffects: 期待される効果（コメント分析）
    ├─ concerns: 懸念点（コメント分析）
    ├─ counterMeasures: 対応策（コメント分析）
    ├─ voteAnalysis: 投票データ分析（JSON）
    ├─ commentAnalysis: コメント分析（JSON）
    ├─ relatedInfo: 関連情報（JSON）
    ├─ agendaLevel: 議題レベル（スコアから決定）
    └─ status: 'draft'
    ↓
[ProposalAuditLog] INSERT
    ├─ action: 'created'
    ├─ userId: 作成者ID
    └─ timestamp: 作成日時
```

### フロー2: 管理職による補足編集

```
[管理職（Level 7+）]
    ↓ ページ表示
[GET /api/proposal-documents/{documentId}]
    ↓ 議題提案書取得
[画面表示]
    ├─ 自動生成内容（読み取り専用）
    └─ 管理職による補足（編集可能）
    ↓ 「編集」ボタンクリック
[編集モード]
    ├─ managerNotes: テキストエリア入力
    ├─ additionalContext: テキストエリア入力
    └─ recommendationLevel: ドロップダウン選択
        ├─ strongly_recommend: 強く推奨
        ├─ recommend: 推奨
        ├─ neutral: 中立
        └─ not_recommend: 推奨しない
    ↓ 「保存」ボタンクリック
[PUT /api/proposal-documents/{documentId}]
    ↓
[ProposalDocument] UPDATE
    ├─ managerNotes: 更新
    ├─ additionalContext: 更新
    ├─ recommendationLevel: 更新
    └─ lastModifiedDate: NOW()
    ↓
[ProposalAuditLog] INSERT
    ├─ action: 'edited'
    ├─ changedFields: ['managerNotes', 'additionalContext', 'recommendationLevel']
    └─ timestamp: 編集日時
```

### フロー3: 提出準備完了

```
[管理職（Level 7+）]
    ↓ 「提出準備完了としてマーク」ボタンクリック
[POST /api/proposal-documents/{documentId}/mark-ready]
    ↓
[ProposalDocument] UPDATE
    ├─ status: 'ready'
    └─ lastModifiedDate: NOW()
    ↓
[ProposalAuditLog] INSERT
    ├─ action: 'marked_ready'
    └─ timestamp: 変更日時
    ↓
[画面更新]
    └─ 「委員会提出リクエスト」ボタン表示
```

### フロー4: 委員会提出リクエスト作成

```
[管理職（Level 7+）]
    ↓ 「委員会提出リクエスト」ボタンクリック
[委員会名入力ダイアログ]
    ↓ targetCommittee入力
[POST /api/committee-submission-requests]
    ↓
[CommitteeSubmissionRequest] INSERT
    ├─ documentId: 議題提案書ID
    ├─ requestedById: リクエスト作成者ID
    ├─ targetCommittee: 提出先委員会名
    ├─ status: 'pending'
    └─ requestedDate: NOW()
    ↓
[ProposalAuditLog] INSERT
    ├─ action: 'submission_requested'
    ├─ details: targetCommittee
    └─ timestamp: リクエスト日時
    ↓
[通知]
    └─ Level 8以上の管理職に承認依頼通知
```

### フロー5: 提出リクエストの承認（Level 8+）

```
[管理職（Level 8+）]
    ↓ CommitteeManagementページで承認
[PUT /api/committee-submission-requests/{requestId}/approve]
    ↓
[CommitteeSubmissionRequest] UPDATE
    ├─ status: 'approved'
    ├─ reviewedById: 承認者ID
    ├─ reviewedDate: NOW()
    └─ reviewNotes: 承認コメント
    ↓
[ProposalDocument] UPDATE
    ├─ status: 'submitted'
    ├─ submittedById: 承認者ID
    └─ submittedDate: NOW()
    ↓
[ProposalAuditLog] INSERT
    ├─ action: 'submitted'
    ├─ details: '委員会提出承認'
    └─ timestamp: 承認日時
    ↓
[ManagementCommitteeAgenda] INSERT
    └─ 委員会議題として登録
```

---

## 📺 画面レイアウト

### メインビュー（2カラムレイアウト）

```
┌─────────────────────────────────────────────────────────┐
│ [← 投稿管理に戻る]                                       │
│                                                         │
│ 📄 議題提案書                                           │
│ 夜勤体制の見直しと人員配置最適化...                      │
│                                                         │
│ [施設議題] [提出準備完了] [提出先: 運営委員会]          │
│ 📅 作成: 2025/10/15  🛡️ 作成者: 山田 花子             │
└─────────────────────────────────────────────────────────┘

┌────────────────────────────────┬─────────────────────────┐
│ メインコンテンツ（左カラム）     │ サイドバー（右カラム）   │
├────────────────────────────────┼─────────────────────────┤
│ ┌───────────────────────────┐  │ ┌──────────────────────┐ │
│ │ 📄 提案内容（自動生成）      │  │ │ 📊 投票データ        │ │
│ ├───────────────────────────┤  │ ├──────────────────────┤ │
│ │ 要約                      │  │ │ 総投票数: 87票      │ │
│ │ 夜勤帯の看護師配置を見直し... │  │ │ 支持率: 82.3%      │ │
│ │                          │  │ │ 反対率: 5.7%       │ │
│ │ 背景・経緯                │  │ └──────────────────────┘ │
│ │ 現在の夜勤体制では...     │  │                        │
│ │                          │  │ ┌──────────────────────┐ │
│ │ 目的                      │  │ │ 💬 コメント統計      │ │
│ │ 業務効率化と職員の負担軽減 │  │ ├──────────────────────┤ │
│ │                          │  │ │ 総コメント数: 34件  │ │
│ │ 期待される効果            │  │ │ 賛成意見: 18件     │ │
│ │ 1. 職員の疲労軽減...      │  │ │ 懸念点: 12件       │ │
│ │                          │  │ │ 建設的提案: 8件    │ │
│ │ 懸念点                    │  │ └──────────────────────┘ │
│ │ 1. 人員確保の困難さ...    │  │                        │
│ │                          │  │ ┌──────────────────────┐ │
│ │ 対応策                    │  │ │ 🛡️ 透明性ログ       │ │
│ │ 1. 段階的な導入...        │  │ ├──────────────────────┤ │
│ └───────────────────────────┘  │ │ 2025/10/20 14:30   │ │
│                                │ │ 山田 花子 (Lv.7)    │ │
│ ┌───────────────────────────┐  │ │ 管理職による補足追加 │ │
│ │ 👥 管理職による補足 [編集]│  │ │                     │ │
│ ├───────────────────────────┤  │ │ 2025/10/15 10:00   │ │
│ │ 補足説明                  │  │ │ 山田 花子 (Lv.7)    │ │
│ │ 現場の声を反映した提案で... │  │ │ 議題提案書作成      │ │
│ │                          │  │ └──────────────────────┘ │
│ │ 追加の文脈                │  │                        │
│ │ 人員確保については人事部と... │                        │
│ │                          │  │                        │
│ │ 推奨レベル                │  │                        │
│ │ [推奨]                    │  │                        │
│ └───────────────────────────┘  │                        │
│                                │                        │
│ ┌───────────────────────────┐  │                        │
│ │ [✅ 提出準備完了としてマーク] │  │                        │
│ │ [📤 委員会提出リクエスト]    │  │                        │
│ └───────────────────────────┘  │                        │
└────────────────────────────────┴─────────────────────────┘
```

### 編集モード

```
┌─────────────────────────────────────────────┐
│ 👥 管理職による補足                         │
├─────────────────────────────────────────────┤
│ 補足説明                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ 現場の状況や追加の背景情報を記入してください │ │
│ │                                           │ │
│ │                                           │ │
│ │                                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 追加の文脈                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ 委員会に伝えたい追加情報を記入してください   │ │
│ │                                           │ │
│ │                                           │ │
│ │                                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 推奨レベル                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ [強く推奨 ▼]                              │ │
│ │  ├ 強く推奨                               │ │
│ │  ├ 推奨                                   │ │
│ │  ├ 中立                                   │ │
│ │  └ 推奨しない                             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [💾 保存]  [❌ キャンセル]                  │
└─────────────────────────────────────────────┘
```

---

## 🔌 API仕様

### VoiceDrive提供API（フロントエンド向け）

#### 1. 議題提案書取得
```http
GET /api/proposal-documents/{documentId}
Authorization: Bearer {jwt_token}

Response 200:
{
  "id": "doc-post123-1729584000000",
  "postId": "post123",
  "title": "【業務改善】夜勤体制の見直しと人員配置最適化...",
  "agendaLevel": "FACILITY_AGENDA",
  "createdBy": {
    "id": "user123",
    "name": "山田 花子",
    "permissionLevel": 7.0
  },
  "createdDate": "2025-10-15T10:00:00Z",
  "lastModifiedDate": "2025-10-20T14:30:00Z",
  "status": "ready",
  "summary": "夜勤帯の看護師配置を見直し、職員の負担軽減と医療安全の向上を目指す提案です...",
  "background": "現在の夜勤体制では...",
  "objectives": "業務効率化と職員の負担軽減",
  "expectedEffects": "1. 職員の疲労軽減...",
  "concerns": "1. 人員確保の困難さ...",
  "counterMeasures": "1. 段階的な導入...",
  "voteAnalysis": {
    "totalVotes": 87,
    "supportRate": 82.3,
    "strongSupportRate": 45.2,
    "oppositionRate": 5.7,
    "neutralRate": 12.0
  },
  "commentAnalysis": {
    "totalComments": 34,
    "supportComments": 18,
    "concernComments": 12,
    "proposalComments": 8
  },
  "managerNotes": "現場の声を反映した提案であり、安全性向上に寄与すると考えます。",
  "additionalContext": "人員確保については人事部と調整済みです。",
  "recommendationLevel": "recommend",
  "targetCommittee": "運営委員会",
  "auditLog": [...]
}
```

#### 2. 議題提案書更新（管理職補足）
```http
PUT /api/proposal-documents/{documentId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body:
{
  "managerNotes": "現場の声を反映した提案であり...",
  "additionalContext": "人員確保については人事部と調整済みです。",
  "recommendationLevel": "recommend"
}

Response 200:
{
  "success": true,
  "documentId": "doc-post123-1729584000000",
  "lastModifiedDate": "2025-10-20T14:30:00Z"
}
```

#### 3. 提出準備完了マーク
```http
POST /api/proposal-documents/{documentId}/mark-ready
Authorization: Bearer {jwt_token}

Response 200:
{
  "success": true,
  "status": "ready",
  "lastModifiedDate": "2025-10-20T15:00:00Z"
}
```

#### 4. 委員会提出リクエスト作成
```http
POST /api/committee-submission-requests
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body:
{
  "documentId": "doc-post123-1729584000000",
  "targetCommittee": "運営委員会"
}

Response 201:
{
  "success": true,
  "requestId": "req-1729584000000-abc123",
  "status": "pending",
  "requestedDate": "2025-10-20T15:30:00Z"
}
```

#### 5. 監査ログ取得
```http
GET /api/proposal-documents/{documentId}/audit-logs
Authorization: Bearer {jwt_token}

Response 200:
{
  "auditLogs": [
    {
      "id": "audit003",
      "timestamp": "2025-10-20T15:00:00Z",
      "userName": "山田 花子",
      "userLevel": 7.0,
      "action": "marked_ready",
      "details": "提出準備完了としてマーク"
    }
  ]
}
```

---

## 🔒 セキュリティ・権限管理

### アクセス制御マトリクス

| 機能 | Level 1-6 | Level 7-9 | Level 8+ | Level 10+ |
|-----|----------|----------|----------|----------|
| ページアクセス | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 議題提案書閲覧 | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 管理職補足編集 | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 提出準備完了マーク | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 委員会提出リクエスト作成 | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 提出リクエスト承認・却下 | ❌ | ❌ | ✅ | ✅ |

### データ可視性ルール

```typescript
// 議題提案書の閲覧権限
function canViewProposalDocument(user: User, document: ProposalDocument): boolean {
  if (!user.permissionLevel || user.permissionLevel < 7) {
    return false;
  }
  if (user.permissionLevel >= 10) {
    return true;
  }
  return document.createdBy.id === user.id;
}

// 議題提案書の編集権限
function canEditProposalDocument(user: User, document: ProposalDocument): boolean {
  if (!user.permissionLevel || user.permissionLevel < 7) {
    return false;
  }
  if (document.status === 'submitted' || document.status === 'approved' || document.status === 'rejected') {
    return false;
  }
  if (user.permissionLevel >= 10) {
    return true;
  }
  return document.createdBy.id === user.id;
}
```

---

## ✅ 実装チェックリスト

### データベース
- [x] ProposalDocument テーブル（全25フィールド）
- [x] CommitteeSubmissionRequest テーブル（全11フィールド）
- [x] ProposalAuditLog テーブル（全9フィールド）
- [x] Post テーブル（議題提案書生成に必要）
- [x] User テーブル（職員情報キャッシュ）

### API実装
- [ ] GET /api/proposal-documents/{documentId}（議題提案書取得）
- [ ] PUT /api/proposal-documents/{documentId}（管理職補足更新）
- [ ] POST /api/proposal-documents/{documentId}/mark-ready（提出準備完了）
- [ ] POST /api/committee-submission-requests（提出リクエスト作成）
- [ ] GET /api/proposal-documents/{documentId}/audit-logs（監査ログ取得）

### 画面実装
- [x] 議題提案書の閲覧
- [x] 自動生成内容の表示（要約、背景、目的、期待される効果、懸念点、対応策）
- [x] 管理職による補足編集（managerNotes, additionalContext, recommendationLevel）
- [x] 投票データ・コメント統計の表示
- [x] 透明性ログの表示
- [x] 提出準備完了マーク
- [x] 委員会提出リクエスト作成
- [ ] DB連携（API接続）

### サービス
- [x] ProposalDocumentGenerator（議題提案書生成・管理）
- [x] CommitteeSubmissionService（委員会提出フロー）
- [x] ProposalAuditService（監査ログ記録）
- [x] ProposalPermissionService（権限管理）

### テスト
- [ ] 議題提案書取得APIテスト
- [ ] 管理職補足更新APIテスト
- [ ] 提出準備完了APIテスト
- [ ] 委員会提出リクエストAPIテスト
- [ ] Level 7アクセステスト（自分が作成したもののみ閲覧可能）
- [ ] Level 8アクセステスト（全ての議題提案書閲覧可能）
- [ ] Level 10アクセステスト（全機能利用可能）
- [ ] Level 6以下アクセス拒否テスト
- [ ] 編集権限テスト（提出済みは編集不可）
- [ ] 監査ログ記録テスト

---

## 🐛 既知の課題・制限事項

### 現在の制限
1. **API未実装**
   - フロントエンドは現在サービスクラス（メモリ内）で動作中
   - DB連携が未完了
   - **優先実装事項**: API実装とDB連携

2. **自動生成ロジックの精度**
   - 投票データとコメントから議題提案書を自動生成
   - 生成精度は投稿内容の質に依存
   - 管理職による補足で品質を担保

3. **委員会選択の柔軟性**
   - 現在は手動入力（プロンプトダイアログ）
   - 将来的には委員会マスタからの選択式に改善

### 将来の拡張候補
1. 議題提案書テンプレート機能
2. 委員会マスタからの選択式提出
3. 議題提案書の一括エクスポート（PDF/Excel）
4. 過去の類似議題の自動検索・提案
5. AI による要約・分析の精度向上

---

## 📊 統計情報

### コード統計
| ファイル | 行数 | 主要機能 |
|---------|-----|---------|
| ProposalDocumentEditor.tsx | 410 | メインページ（閲覧・編集・提出） |
| ProposalDocumentCard.tsx | 175 | 議題提案書カード |
| ProposalDocumentGenerator.ts | 333 | 議題提案書生成・管理 |
| CommitteeSubmissionService.ts | 218 | 委員会提出フロー |
| proposalDocument.ts | 170 | 型定義 |
| **合計** | **1,306行** | |

### データベース統計
| テーブル | フィールド数 | リレーション数 |
|---------|-----------|-------------|
| ProposalDocument | 25 | 4 (User x2, Post, SubmissionRequest) |
| CommitteeSubmissionRequest | 11 | 3 (User x2, ProposalDocument) |
| ProposalAuditLog | 9 | 1 (ProposalDocument) |

### 月間想定データ量
| 項目 | 想定数 |
|-----|-------|
| 議題提案書作成 | 25-40件/月 |
| 管理職による編集 | 50-80回/月 |
| 提出リクエスト作成 | 20-35件/月 |
| 提出リクエスト承認 | 15-25件/月 |
| 監査ログ記録 | 150-250件/月 |

---

## 🔄 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|-----|----------|---------|-------|
| 2025-10-22 | 1.0 | 初版作成 | VoiceDrive開発チーム |

---

## 📞 連絡先・レビュー

### 作成者
- **チーム**: VoiceDrive開発チーム
- **Slack**: #voicedrive-dev
- **メール**: voicedrive-dev@example.com

### レビュー依頼先
- **チーム**: VoiceDrive開発チーム（社内レビュー）
- **Slack**: #voicedrive-dev
- **備考**: 医療システムチームへの連絡は不要（完全にVoiceDrive管轄）

### 質問・フィードバック
- **MCP共有フォルダ**: `mcp-shared/docs/`
- **定例会議**: 毎週月曜 10:00-11:00
- **統合テスト**: 毎週金曜 15:00-17:00

---

## 🚀 優先実装ロードマップ

### Phase 1: API実装（最優先）
1. GET /api/proposal-documents/{documentId} 実装
2. PUT /api/proposal-documents/{documentId} 実装
3. POST /api/proposal-documents/{documentId}/mark-ready 実装
4. ProposalDocumentEditor.tsx のDB連携

### Phase 2: 提出フロー統合
1. POST /api/committee-submission-requests 実装
2. CommitteeManagementPage との連携
3. 提出リクエスト承認・却下フロー

### Phase 3: 監査ログ強化
1. GET /api/proposal-documents/{documentId}/audit-logs 実装
2. 監査ログ表示の充実
3. 変更履歴の差分表示

### Phase 4: 機能拡張
1. 議題提案書一覧表示
2. 委員会マスタからの選択式提出
3. PDF/Excelエクスポート機能

---

**文書終了**

最終更新: 2025年10月22日
バージョン: 1.0
ステータス: レビュー待ち
次回レビュー予定: 2025年10月29日
