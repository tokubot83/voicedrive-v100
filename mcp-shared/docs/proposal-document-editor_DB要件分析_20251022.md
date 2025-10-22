# proposal-document-editor DB要件分析

**文書番号**: DB-ANALYSIS-PDE-2025-1022-001
**作成日**: 2025年10月22日
**対象ページ**: `/proposal-document-editor` (Proposal Document Editor)
**URL**: https://voicedrive-v100.vercel.app/proposal-document-editor/:documentId
**権限レベル**: Level 7以上（主任・係長以上）

---

## 📋 1. ページ概要

### 基本情報
| 項目 | 内容 |
|-----|------|
| ページ名 | 議題提案書編集ページ |
| 目的 | 自動生成された議題提案書を管理職が補足・編集し、委員会に提出する |
| 対象ユーザー | Level 7以上の管理職（主任・係長以上） |
| ファイルパス | `src/pages/ProposalDocumentEditor.tsx` (410行) |
| 主要サービス | ProposalDocumentGenerator, CommitteeSubmissionService |

### 機能概要
投稿が50点（部署議題）または100点（施設議題）に到達すると、議題提案書が自動生成されます。このページでは、管理職が以下を実施します：

1. **閲覧**: 自動生成された提案内容（要約、背景、目的、期待される効果、懸念点、対応策）
2. **補足**: 管理職による補足説明・追加の文脈・推奨レベルの設定
3. **編集**: managerNotes, additionalContext, recommendationLevel の編集
4. **提出準備**: ステータスを「提出準備完了」に変更
5. **委員会提出リクエスト**: Level 7+が提出先委員会を選択して提出リクエストを作成
6. **承認・却下**: Level 8+が提出リクエストを承認または却下（別ページで実施）

---

## 📊 2. データ構造分析

### 主要な表示項目

#### ヘッダー情報
| 表示項目 | データソース | テーブル・フィールド |
|---------|------------|-----------------|
| 議題タイトル | ProposalDocument | title |
| 議題レベル | ProposalDocument | agendaLevel (PENDING/DEPT_REVIEW/DEPT_AGENDA/FACILITY_AGENDA/CORP_REVIEW/CORP_AGENDA) |
| ステータス | ProposalDocument | status (draft/under_review/ready/submitted/approved/rejected) |
| 提出先委員会 | ProposalDocument | targetCommittee (optional) |
| 作成日 | ProposalDocument | createdDate |
| 作成者 | User (関連) | createdBy.name |

#### 提案内容（自動生成）
| 表示項目 | データソース | テーブル・フィールド |
|---------|------------|-----------------|
| 要約 | ProposalDocument | summary |
| 背景・経緯 | ProposalDocument | background |
| 目的 | ProposalDocument | objectives |
| 期待される効果 | ProposalDocument | expectedEffects |
| 懸念点 | ProposalDocument | concerns |
| 対応策 | ProposalDocument | counterMeasures |

#### 管理職による補足（編集可能）
| 表示項目 | データソース | テーブル・フィールド |
|---------|------------|-----------------|
| 補足説明 | ProposalDocument | managerNotes (編集可能) |
| 追加の文脈 | ProposalDocument | additionalContext (編集可能) |
| 推奨レベル | ProposalDocument | recommendationLevel (strongly_recommend/recommend/neutral/not_recommend) |

#### サイドバー - 投票データ
| 表示項目 | データソース | テーブル・フィールド |
|---------|------------|-----------------|
| 総投票数 | ProposalDocument | voteAnalysis.totalVotes (JSON) |
| 支持率 | ProposalDocument | voteAnalysis.supportRate (JSON) |
| 反対率 | ProposalDocument | voteAnalysis.oppositionRate (JSON) |

#### サイドバー - コメント統計
| 表示項目 | データソース | テーブル・フィールド |
|---------|------------|-----------------|
| 総コメント数 | ProposalDocument | commentAnalysis.totalComments (JSON) |
| 賛成意見 | ProposalDocument | commentAnalysis.supportComments (JSON) |
| 懸念点 | ProposalDocument | commentAnalysis.concernComments (JSON) |
| 建設的提案 | ProposalDocument | commentAnalysis.proposalComments (JSON) |

#### サイドバー - 透明性ログ
| 表示項目 | データソース | テーブル・フィールド |
|---------|------------|-----------------|
| タイムスタンプ | ProposalAuditLog | timestamp |
| ユーザー名 | ProposalAuditLog | userName |
| ユーザーレベル | ProposalAuditLog | userLevel |
| アクション | ProposalAuditLog | action (created/edited/reviewed/submitted/approved/rejected) |
| 詳細 | ProposalAuditLog | details (optional) |

---

## 🔄 3. データフロー

### フロー1: 議題提案書の自動生成

```
[投稿が50点/100点到達]
    ↓
[ProposalDocumentGenerator.generateDocument()]
    ↓ 投稿データから自動生成
[ProposalDocument] テーブル
    ├─ title: 自動生成タイトル
    ├─ summary: 投稿内容の要約
    ├─ background: 背景・経緯
    ├─ objectives: 目的
    ├─ expectedEffects: 期待される効果
    ├─ concerns: 懸念点
    ├─ counterMeasures: 対応策
    ├─ voteAnalysis: 投票データ分析（JSON）
    ├─ commentAnalysis: コメント分析（JSON）
    ├─ relatedInfo: 関連情報（JSON）
    ├─ agendaLevel: 議題レベル
    ├─ status: 'draft'
    └─ createdById: 作成者ID
    ↓
[ProposalAuditLog] INSERT
    ├─ action: 'created'
    ├─ userId: 作成者ID
    └─ timestamp: 作成日時
```

### フロー2: 管理職による補足編集

```
[管理職（Level 7+）]
    ↓ 編集ボタンクリック
[編集モード]
    ├─ managerNotes: テキストエリア入力
    ├─ additionalContext: テキストエリア入力
    └─ recommendationLevel: ドロップダウン選択
    ↓ 保存ボタンクリック
[ProposalDocumentGenerator.updateDocument()]
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
[ProposalDocumentGenerator.markAsReady()]
    ↓
[ProposalDocument] UPDATE
    ├─ status: 'ready'
    └─ lastModifiedDate: NOW()
    ↓
[ProposalAuditLog] INSERT
    ├─ action: 'marked_ready'
    └─ timestamp: 変更日時
```

### フロー4: 委員会提出リクエスト作成

```
[管理職（Level 7+）]
    ↓ 「委員会提出リクエスト」ボタンクリック
[CommitteeSubmissionService.createSubmissionRequest()]
    ↓ targetCommittee入力
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
```

### フロー5: 提出リクエストの承認（Level 8+）

```
[管理職（Level 8+）]
    ↓ 提出リクエストを承認（CommitteeManagementページ）
[CommitteeSubmissionService.approveSubmissionRequest()]
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
```

---

## 🗄️ 4. データベーステーブル仕様

### テーブル1: ProposalDocument（議題提案書）

| # | フィールド名 | 型 | NULL | デフォルト | 説明 | データ管理責任 |
|---|------------|---|------|----------|------|-------------|
| 1 | id | String | ✗ | cuid() | 主キー | VoiceDrive |
| 2 | postId | String | ✗ | - | 元となる投稿ID | VoiceDrive |
| 3 | title | String | ✗ | - | 議題タイトル | VoiceDrive（自動生成） |
| 4 | agendaLevel | String | ✗ | - | 議題レベル | VoiceDrive（投稿スコアから決定） |
| 5 | createdById | String | ✗ | - | 作成者ID | VoiceDrive |
| 6 | status | String | ✗ | 'draft' | ステータス | VoiceDrive |
| 7 | summary | String | ✗ | - | 提案の要約 | VoiceDrive（自動生成） |
| 8 | background | String | ✗ | - | 背景・経緯 | VoiceDrive（自動生成） |
| 9 | objectives | String | ✗ | - | 目的 | VoiceDrive（自動生成） |
| 10 | expectedEffects | String | ✗ | - | 期待される効果 | VoiceDrive（自動生成） |
| 11 | concerns | String | ✗ | - | 懸念点 | VoiceDrive（自動生成） |
| 12 | counterMeasures | String | ✗ | - | 対応策 | VoiceDrive（自動生成） |
| 13 | voteAnalysis | Json | ✗ | - | 投票データ分析 | VoiceDrive（自動生成） |
| 14 | commentAnalysis | Json | ✗ | - | コメント分析 | VoiceDrive（自動生成） |
| 15 | relatedInfo | Json | ✓ | null | 関連情報 | VoiceDrive（自動生成） |
| 16 | managerNotes | String | ✓ | null | 管理職による補足説明 | VoiceDrive（管理職が編集） |
| 17 | additionalContext | String | ✓ | null | 追加の文脈 | VoiceDrive（管理職が編集） |
| 18 | recommendationLevel | String | ✓ | null | 推奨レベル | VoiceDrive（管理職が設定） |
| 19 | targetCommittee | String | ✓ | null | 提出先委員会 | VoiceDrive |
| 20 | submittedDate | DateTime | ✓ | null | 提出日時 | VoiceDrive |
| 21 | submittedById | String | ✓ | null | 提出者ID | VoiceDrive |
| 22 | committeeDecision | Json | ✓ | null | 委員会決定 | VoiceDrive |
| 23 | createdAt | DateTime | ✗ | now() | 作成日時 | VoiceDrive |
| 24 | updatedAt | DateTime | ✗ | now() | 更新日時 | VoiceDrive |
| 25 | lastModifiedDate | DateTime | ✗ | now() | 最終変更日時 | VoiceDrive |

**ステータス**: ✅ 実装済み
**データ管理責任**: VoiceDrive（自動生成 + 管理職編集）

---

### テーブル2: CommitteeSubmissionRequest（委員会提出リクエスト）

| # | フィールド名 | 型 | NULL | デフォルト | 説明 | データ管理責任 |
|---|------------|---|------|----------|------|-------------|
| 1 | id | String | ✗ | cuid() | 主キー | VoiceDrive |
| 2 | documentId | String | ✗ | - | 議題提案書ID | VoiceDrive |
| 3 | requestedById | String | ✗ | - | リクエスト作成者ID | VoiceDrive |
| 4 | requestedDate | DateTime | ✗ | now() | リクエスト日時 | VoiceDrive |
| 5 | targetCommittee | String | ✗ | - | 提出先委員会名 | VoiceDrive |
| 6 | status | String | ✗ | 'pending' | ステータス (pending/approved/rejected) | VoiceDrive |
| 7 | reviewedById | String | ✓ | null | レビュー者ID | VoiceDrive |
| 8 | reviewedDate | DateTime | ✓ | null | レビュー日時 | VoiceDrive |
| 9 | reviewNotes | String | ✓ | null | レビューコメント | VoiceDrive |
| 10 | createdAt | DateTime | ✗ | now() | 作成日時 | VoiceDrive |
| 11 | updatedAt | DateTime | ✗ | now() | 更新日時 | VoiceDrive |

**ステータス**: ✅ 実装済み
**データ管理責任**: VoiceDrive

---

### テーブル3: ProposalAuditLog（議題提案書監査ログ）

| # | フィールド名 | 型 | NULL | デフォルト | 説明 | データ管理責任 |
|---|------------|---|------|----------|------|-------------|
| 1 | id | String | ✗ | cuid() | 主キー | VoiceDrive |
| 2 | documentId | String | ✗ | - | 議題提案書ID | VoiceDrive |
| 3 | userId | String | ✗ | - | 実行者ID | VoiceDrive |
| 4 | userName | String | ✗ | - | 実行者名 | VoiceDrive |
| 5 | userLevel | Decimal | ✗ | - | 実行者権限レベル | VoiceDrive |
| 6 | action | String | ✗ | - | アクション種別 | VoiceDrive |
| 7 | details | String | ✓ | null | 詳細情報 | VoiceDrive |
| 8 | changedFields | Json | ✓ | null | 変更されたフィールド | VoiceDrive |
| 9 | timestamp | DateTime | ✗ | now() | 実行日時 | VoiceDrive |

**ステータス**: ✅ 実装済み
**データ管理責任**: VoiceDrive

**アクション種別**:
- `created`: 議題提案書作成
- `edited`: 編集（管理職による補足）
- `reviewed`: レビュー完了
- `submitted`: 委員会提出
- `approved`: 承認
- `rejected`: 却下
- `marked_candidate`: 候補としてマーク
- `unmarked_candidate`: 候補マーク解除

---

### テーブル4: Post（投稿）

| フィールド | 説明 | 使用箇所 |
|----------|------|---------|
| id | 投稿ID | ProposalDocument.postId（外部キー） |
| content | 投稿内容 | 議題提案書の要約生成に使用 |
| proposalType | 提案タイプ | タイトル生成に使用 |
| votes | 投票データ | voteAnalysis生成に使用 |
| comments | コメントデータ | commentAnalysis生成に使用 |

**ステータス**: ✅ 実装済み
**データ管理責任**: VoiceDrive

---

### テーブル5: User（職員情報）

| フィールド | 説明 | 使用箇所 |
|----------|------|---------|
| id | 職員ID | ProposalDocument.createdById（外部キー） |
| name | 職員名 | ヘッダー表示、監査ログ |
| permissionLevel | 権限レベル | 編集権限チェック、提出権限チェック |

**ステータス**: ✅ 実装済み
**データ管理責任**: 医療システム（VoiceDriveはキャッシュ）

---

## 🔍 5. データ管理責任分析

### データ管理責任分界点定義書に基づく分類

| データ項目 | 管理責任 | 理由 |
|----------|---------|------|
| **議題提案書の自動生成内容** | VoiceDrive | 投稿データから自動生成される客観的書類 |
| **投票データ分析** | VoiceDrive | VoiceDriveの投票機能で収集したデータの分析 |
| **コメント分析** | VoiceDrive | VoiceDriveのコメント機能で収集したデータの分析 |
| **管理職による補足** | VoiceDrive | VoiceDrive内で管理職が編集する追記情報 |
| **提出リクエスト** | VoiceDrive | VoiceDrive内の委員会提出フロー管理 |
| **監査ログ** | VoiceDrive | VoiceDrive内での操作履歴の記録 |
| **職員情報** | 医療システム（キャッシュ） | 医療システムが管理、VoiceDriveはキャッシュのみ |

### 結論
**議題提案書編集ページは完全にVoiceDrive管轄です。**

- 投稿データから議題提案書を自動生成
- 管理職が補足情報を追記
- 委員会への提出リクエストを管理
- 全ての操作を監査ログに記録
- 医療システムとの連携は不要（職員情報のキャッシュのみ）

---

## 📋 6. 不足項目の洗い出し

### ✅ 実装済み項目

#### データベーステーブル
- [x] ProposalDocument テーブル（全フィールド実装済み）
- [x] CommitteeSubmissionRequest テーブル（全フィールド実装済み）
- [x] ProposalAuditLog テーブル（全フィールド実装済み）
- [x] Post テーブル（議題提案書生成に必要）
- [x] User テーブル（職員情報キャッシュ）

#### 画面機能
- [x] 議題提案書の閲覧
- [x] 自動生成内容の表示
- [x] 管理職による補足編集（managerNotes, additionalContext, recommendationLevel）
- [x] 投票データ・コメント統計の表示
- [x] 透明性ログの表示
- [x] 提出準備完了マーク
- [x] 委員会提出リクエスト作成

#### サービス
- [x] ProposalDocumentGenerator（議題提案書生成・管理）
- [x] CommitteeSubmissionService（委員会提出フロー）
- [x] ProposalAuditService（監査ログ記録）

### ❌ 未実装項目（API接続）

#### API実装
- [ ] **GET /api/proposal-documents/{documentId}** - 議題提案書取得
- [ ] **PUT /api/proposal-documents/{documentId}** - 議題提案書更新（管理職補足）
- [ ] **POST /api/proposal-documents/{documentId}/mark-ready** - 提出準備完了マーク
- [ ] **POST /api/committee-submission-requests** - 委員会提出リクエスト作成
- [ ] **GET /api/proposal-documents/{documentId}/audit-logs** - 監査ログ取得

### 📝 必要な追加フィールド

**現在のテーブル構成で十分です。追加フィールドは不要です。**

---

## 🔌 7. API仕様（実装推奨）

### API 1: 議題提案書取得

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
    "proposalComments": 8,
    "supportSummary": ["実際に夜勤負担が大きい", "安全性が向上する"],
    "concernSummary": ["人員確保が課題", "コストが増加する可能性"],
    "constructiveProposals": ["段階的導入を提案", "シフト調整で対応"]
  },
  "relatedInfo": {
    "similarPastAgendas": [],
    "affectedDepartments": [
      {
        "department": "看護部",
        "impactLevel": "high",
        "description": "夜勤シフトの大幅な変更が必要"
      }
    ]
  },
  "managerNotes": "現場の声を反映した提案であり、安全性向上に寄与すると考えます。",
  "additionalContext": "人員確保については人事部と調整済みです。",
  "recommendationLevel": "recommend",
  "targetCommittee": "運営委員会",
  "submittedDate": null,
  "submittedBy": null,
  "committeeDecision": null,
  "auditLog": [
    {
      "id": "audit001",
      "timestamp": "2025-10-15T10:00:00Z",
      "userId": "user123",
      "userName": "山田 花子",
      "userLevel": 7.0,
      "action": "created",
      "details": "投稿post123から議題提案書を自動生成"
    },
    {
      "id": "audit002",
      "timestamp": "2025-10-20T14:30:00Z",
      "userId": "user123",
      "userName": "山田 花子",
      "userLevel": 7.0,
      "action": "edited",
      "details": "管理職による補足を追加",
      "changedFields": ["managerNotes", "additionalContext", "recommendationLevel"]
    }
  ]
}
```

---

### API 2: 議題提案書更新（管理職補足）

```http
PUT /api/proposal-documents/{documentId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body:
{
  "managerNotes": "現場の声を反映した提案であり、安全性向上に寄与すると考えます。",
  "additionalContext": "人員確保については人事部と調整済みです。",
  "recommendationLevel": "recommend"
}

Response 200:
{
  "success": true,
  "documentId": "doc-post123-1729584000000",
  "lastModifiedDate": "2025-10-20T14:30:00Z",
  "auditLogId": "audit002"
}
```

---

### API 3: 提出準備完了マーク

```http
POST /api/proposal-documents/{documentId}/mark-ready
Authorization: Bearer {jwt_token}

Response 200:
{
  "success": true,
  "documentId": "doc-post123-1729584000000",
  "status": "ready",
  "lastModifiedDate": "2025-10-20T15:00:00Z",
  "auditLogId": "audit003"
}
```

---

### API 4: 委員会提出リクエスト作成

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
  "documentId": "doc-post123-1729584000000",
  "targetCommittee": "運営委員会",
  "status": "pending",
  "requestedDate": "2025-10-20T15:30:00Z",
  "requestedBy": {
    "id": "user123",
    "name": "山田 花子",
    "permissionLevel": 7.0
  }
}
```

---

### API 5: 監査ログ取得

```http
GET /api/proposal-documents/{documentId}/audit-logs
Authorization: Bearer {jwt_token}

Query Parameters:
  - limit: number (default: 50)
  - offset: number (default: 0)

Response 200:
{
  "auditLogs": [
    {
      "id": "audit003",
      "timestamp": "2025-10-20T15:00:00Z",
      "userId": "user123",
      "userName": "山田 花子",
      "userLevel": 7.0,
      "action": "marked_ready",
      "details": "提出準備完了としてマーク"
    },
    {
      "id": "audit002",
      "timestamp": "2025-10-20T14:30:00Z",
      "userId": "user123",
      "userName": "山田 花子",
      "userLevel": 7.0,
      "action": "edited",
      "details": "管理職による補足を追加",
      "changedFields": ["managerNotes", "additionalContext", "recommendationLevel"]
    },
    {
      "id": "audit001",
      "timestamp": "2025-10-15T10:00:00Z",
      "userId": "user123",
      "userName": "山田 花子",
      "userLevel": 7.0,
      "action": "created",
      "details": "投稿post123から議題提案書を自動生成"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 🔒 8. セキュリティ・権限管理

### 権限レベル別アクセス制御

| 操作 | Level 1-6 | Level 7-9 | Level 8+ | Level 10+ |
|-----|----------|----------|----------|----------|
| 議題提案書閲覧 | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 管理職補足編集 | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 提出準備完了マーク | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 委員会提出リクエスト作成 | ❌ | ✅（自分が作成したもののみ） | ✅ | ✅ |
| 提出リクエスト承認・却下 | ❌ | ❌ | ✅ | ✅ |

### データ可視性ルール

```typescript
// 議題提案書の閲覧権限
function canViewProposalDocument(user: User, document: ProposalDocument): boolean {
  // Level 7未満は閲覧不可
  if (!user.permissionLevel || user.permissionLevel < 7) {
    return false;
  }

  // Level 10以上は全て閲覧可能
  if (user.permissionLevel >= 10) {
    return true;
  }

  // Level 7-9は自分が作成したもののみ閲覧可能
  return document.createdBy.id === user.id;
}

// 議題提案書の編集権限
function canEditProposalDocument(user: User, document: ProposalDocument): boolean {
  // Level 7未満は編集不可
  if (!user.permissionLevel || user.permissionLevel < 7) {
    return false;
  }

  // 提出済みは編集不可
  if (document.status === 'submitted' || document.status === 'approved' || document.status === 'rejected') {
    return false;
  }

  // Level 10以上は全て編集可能
  if (user.permissionLevel >= 10) {
    return true;
  }

  // Level 7-9は自分が作成したもののみ編集可能
  return document.createdBy.id === user.id;
}

// 委員会提出リクエスト作成権限
function canCreateSubmissionRequest(user: User, document: ProposalDocument): boolean {
  // Level 7未満は作成不可
  if (!user.permissionLevel || user.permissionLevel < 7) {
    return false;
  }

  // 提出準備完了状態のみリクエスト可能
  if (document.status !== 'ready') {
    return false;
  }

  // Level 7以上で、自分が作成した議題提案書のみ
  return document.createdBy.id === user.id || user.permissionLevel >= 10;
}

// 提出リクエスト承認権限
function canApproveSubmissionRequest(user: User): boolean {
  // Level 8以上のみ承認可能
  return user.permissionLevel && user.permissionLevel >= 8;
}
```

---

## 📊 9. 想定データ量

### 月間想定

| 項目 | 想定数 | 備考 |
|-----|-------|------|
| 投稿数 | 500-1000件 | 全職員の声 |
| 50点到達（部署議題） | 20-30件 | 月間2-3% |
| 100点到達（施設議題） | 5-10件 | 月間0.5-1% |
| **議題提案書作成** | **25-40件/月** | 50点 + 100点到達分 |
| 管理職による編集 | 50-80回/月 | 提案書あたり2-3回編集 |
| 提出リクエスト作成 | 20-35件/月 | 提案書の約80% |
| 提出リクエスト承認 | 15-25件/月 | リクエストの約70% |
| 監査ログ記録 | 150-250件/月 | 作成・編集・提出など |

### 年間データ蓄積

| テーブル | 月間増加 | 年間蓄積 | 3年後蓄積 |
|---------|---------|---------|----------|
| ProposalDocument | 25-40件 | 300-480件 | 900-1440件 |
| CommitteeSubmissionRequest | 20-35件 | 240-420件 | 720-1260件 |
| ProposalAuditLog | 150-250件 | 1800-3000件 | 5400-9000件 |

---

## 🎯 10. 実装優先度

### 優先度1（最優先）: API実装
1. GET /api/proposal-documents/{documentId}（議題提案書取得）
2. PUT /api/proposal-documents/{documentId}（管理職補足更新）
3. POST /api/proposal-documents/{documentId}/mark-ready（提出準備完了）

### 優先度2（高）: 提出フロー
4. POST /api/committee-submission-requests（提出リクエスト作成）
5. GET /api/proposal-documents/{documentId}/audit-logs（監査ログ取得）

### 優先度3（中）: 機能拡張
6. 議題提案書の一覧表示機能
7. フィルタリング・検索機能
8. 統計ダッシュボード

---

## 📞 11. 医療システムチームへの連絡事項

**特に連絡すべき重要事項はありません。**

### 理由
- 議題提案書は完全にVoiceDrive内で生成・管理される
- 投稿データから自動生成される客観的書類
- 医療システムとのデータ連携は不要
- 職員情報のキャッシュのみ使用（既存のUser同期で対応済み）

### 将来的な連携の可能性
- 委員会決定結果を医療システムに通知（Webhook）
- 承認された議題を医療システムの委員会管理に連携

---

## ✅ 12. 結論

### データベース
- ✅ **全てのテーブルが実装済み**
- ✅ ProposalDocument テーブル（全25フィールド）
- ✅ CommitteeSubmissionRequest テーブル（全11フィールド）
- ✅ ProposalAuditLog テーブル（全9フィールド）
- ✅ schema.prismaの更新は不要

### API
- ❌ **API実装が未完了**
- フロントエンドは現在サービスクラス（メモリ内）で動作中
- DBとの連携が必要

### データ管理責任
- ✅ **完全にVoiceDrive管轄**
- 医療システムとの連携不要（職員情報キャッシュのみ）

---

**文書終了**

最終更新: 2025年10月22日
バージョン: 1.0
ステータス: レビュー待ち
次回レビュー予定: 2025年10月29日
