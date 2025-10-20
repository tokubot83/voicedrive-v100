# Phase 6: 期限到達判断履歴機能 実装計画書

**作成日**: 2025年10月20日
**作成者**: VoiceDrive開発チーム
**バージョン**: 1.0.0
**ステータス**: ✅ Phase 2完了・Phase 3準備中

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システム構成](#2-システム構成)
3. [データベース設計](#3-データベース設計)
4. [API仕様](#4-api仕様)
5. [フロントエンド実装](#5-フロントエンド実装)
6. [テストデータ](#6-テストデータ)
7. [フェーズ別実装計画](#7-フェーズ別実装計画)
8. [医療システム連携](#8-医療システム連携)
9. [セキュリティ・権限設計](#9-セキュリティ権限設計)
10. [運用・保守](#10-運用保守)

---

## 1. プロジェクト概要

### 1.1 目的

VoiceDriveの議題モードにおいて、投票期限に達したが目標スコアに到達しなかった提案に対する管理者の判断（承認・格下げ・却下）を記録・可視化する機能を実装する。

### 1.2 背景

- 議題の投票期限到達時、目標スコア未達の場合、管理者が判断する必要がある
- 判断履歴を記録し、意思決定の透明性を確保する
- 医療職員管理システムとデータ連携し、レポート機能を提供する

### 1.3 スコープ

#### VoiceDrive側（本システム）
- ✅ 判断記録API実装
- ✅ 判断履歴取得API実装
- ✅ 期限到達提案一覧UI
- ✅ 判断モーダルUI
- ✅ テストデータ生成

#### 医療職員管理システム側
- ⏳ 判断履歴レポート画面
- ⏳ 統計ダッシュボード
- ⏳ CSVエクスポート機能
- ⏳ MCP API実装

### 1.4 目標スコア定義

| 議題レベル | 目標スコア | 説明 |
|-----------|----------|------|
| 部署議題（DEPT_AGENDA） | 100点 | 部署内での合意形成 |
| 施設議題（FACILITY_AGENDA） | 300点 | 施設全体での合意形成 |
| 法人議題（CORP_AGENDA） | 600点 | 法人全体での合意形成 |

### 1.5 判断タイプ

| タイプ | 値 | 説明 |
|-------|-----|------|
| 承認 | `approve_at_current_level` | 現在のレベルで実施承認 |
| 格下げ | `downgrade` | 下位レベルに降格して実施 |
| 却下 | `reject` | 不採用 |

---

## 2. システム構成

### 2.1 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VoiceDrive System                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────┐    ┌──────────────────────────┐      │
│  │  Frontend (Next.js)       │    │  Backend (Express.js)    │      │
│  │                           │    │                          │      │
│  │  - 期限到達提案一覧       │◄───┤  - POST /api/.../        │      │
│  │  - 判断モーダル           │    │    decisions             │      │
│  │  - 判断履歴ページ         │    │  - GET /api/.../         │      │
│  │                           │    │    history               │      │
│  └───────────────────────────┘    └──────────┬───────────────┘      │
│                                               │                      │
│                                    ┌──────────▼───────────────┐     │
│                                    │  Database (SQLite)       │     │
│                                    │                          │     │
│                                    │  - ExpiredEscalation     │     │
│                                    │    Decision              │     │
│                                    │  - Post                  │     │
│                                    │  - User                  │     │
│                                    └──────────┬───────────────┘     │
└───────────────────────────────────────────────┼─────────────────────┘
                                                │
                                    ┌───────────▼───────────────┐
                                    │  MCP Shared Folder        │
                                    │                           │
                                    │  - JSON Export            │
                                    │  - SQL Export             │
                                    │  - Documentation          │
                                    └───────────┬───────────────┘
                                                │
┌───────────────────────────────────────────────┼─────────────────────┐
│                    Medical Staff Record System                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────┐    ┌──────────────────────────┐      │
│  │  Report UI (Next.js)      │    │  MCP API Server          │      │
│  │                           │    │                          │      │
│  │  - 判断履歴一覧           │◄───┤  - GET /mcp/expired-     │      │
│  │  - 統計ダッシュボード     │    │    escalation-history    │      │
│  │  - グラフ表示             │    │  - GET /mcp/expired-     │      │
│  │  - CSVエクスポート        │    │    escalation-stats      │      │
│  └───────────────────────────┘    └──────────────────────────┘      │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 2.2 技術スタック

#### VoiceDrive側

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js | 14.2.3 |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 3.x |
| 状態管理 | React Hooks | - |
| バックエンド | Express.js | 4.x |
| データベース | SQLite | 3.x |
| ORM | Prisma | 6.16.2 |

#### 医療システム側

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js | 14.2.3 |
| バックエンド | Express.js | 4.x |
| MCP連携 | ファイル同期 | - |

---

## 3. データベース設計

### 3.1 ER図

```
┌─────────────────────────┐
│  User                   │
│─────────────────────────│
│  id (PK)                │
│  name                   │
│  department             │
│  permissionLevel        │◄───┐
│  facilityId             │    │
└─────────────────────────┘    │
                               │
                               │ decider
                               │
┌─────────────────────────┐    │
│  Post                   │    │
│─────────────────────────│    │
│  id (PK)                │◄───┼───┐
│  content                │    │   │
│  agendaLevel            │    │   │
│  agendaScore            │    │   │
│  agendaVotingDeadline   │    │   │
│  proposalType           │    │   │
│  authorId (FK)          │    │   │
└─────────────────────────┘    │   │
                               │   │ post
                               │   │
┌──────────────────────────────┼───┼──────────┐
│  ExpiredEscalationDecision   │   │          │
│──────────────────────────────┼───┼──────────│
│  id (PK)                     │   │          │
│  postId (FK) ────────────────┘   │          │
│  deciderId (FK) ─────────────────┘          │
│  decision                                    │
│  decisionReason                              │
│  currentScore                                │
│  targetScore                                 │
│  achievementRate                             │
│  daysOverdue                                 │
│  agendaLevel                                 │
│  proposalType                                │
│  department                                  │
│  facilityId                                  │
│  createdAt                                   │
│  updatedAt                                   │
└──────────────────────────────────────────────┘
```

### 3.2 テーブル定義

#### ExpiredEscalationDecision

```sql
CREATE TABLE "expired_escalation_decisions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "post_id" TEXT NOT NULL,
  "decider_id" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "decision_reason" TEXT NOT NULL,
  "current_score" INTEGER NOT NULL,
  "target_score" INTEGER NOT NULL,
  "achievement_rate" REAL NOT NULL,
  "days_overdue" INTEGER NOT NULL,
  "agenda_level" TEXT NOT NULL,
  "proposal_type" TEXT,
  "department" TEXT,
  "facility_id" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL,

  FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("decider_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "expired_escalation_decisions_post_id_decider_id_facility_id_created_at_decision_idx"
ON "expired_escalation_decisions"("post_id", "decider_id", "facility_id", "created_at", "decision");
```

### 3.3 フィールド説明

| フィールド | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| id | TEXT | ✅ | 主キー（CUID） | `cmgyc8w390009s530uqxvju7l` |
| post_id | TEXT | ✅ | 提案ID | `cmgyc6pwv0009s55k6tuzro20` |
| decider_id | TEXT | ✅ | 判断者ID | `test-consent-user-002` |
| decision | TEXT | ✅ | 判断結果 | `approve_at_current_level` |
| decision_reason | TEXT | ✅ | 判断理由 | `到達率60.0%で...` |
| current_score | INTEGER | ✅ | 現在スコア | `180` |
| target_score | INTEGER | ✅ | 目標スコア | `300` |
| achievement_rate | REAL | ✅ | 到達率（%） | `60.0` |
| days_overdue | INTEGER | ✅ | 期限超過日数 | `14` |
| agenda_level | TEXT | ✅ | 議題レベル | `escalated_to_facility` |
| proposal_type | TEXT | - | 提案タイプ | `training` |
| department | TEXT | - | 部署 | `看護部` |
| facility_id | TEXT | - | 施設ID | `obara-hospital` |
| created_at | DATETIME | ✅ | 作成日時 | `2025-10-15T23:29:07.682Z` |
| updated_at | DATETIME | ✅ | 更新日時 | `2025-10-19T23:29:07.702Z` |

---

## 4. API仕様

### 4.1 判断記録API

#### エンドポイント

```
POST /api/agenda/expired-escalation-decisions
```

#### リクエスト

```typescript
{
  postId: string;                    // 提案ID
  decision: 'approve_at_current_level' | 'downgrade' | 'reject';
  deciderId: string;                 // 判断者ID
  decisionReason: string;            // 判断理由（10文字以上）
  currentScore: number;              // 現在スコア
  targetScore: number;               // 目標スコア（100/300/600）
  agendaLevel: string;               // 議題レベル
  proposalType?: string;             // 提案タイプ
  department?: string;               // 部署
  facilityId?: string;               // 施設ID
}
```

#### レスポンス

```typescript
{
  success: true,
  decisionId: "cmgyc8w390009s530uqxvju7l"
}
```

#### エラーレスポンス

```typescript
{
  success: false,
  error: "判断理由は10文字以上入力してください"
}
```

### 4.2 判断履歴取得API

#### エンドポイント

```
GET /api/agenda/expired-escalation-history
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| userId | string | ✅ | ユーザーID | `test-user-001` |
| permissionLevel | number | ✅ | 権限レベル | `7` |
| facilityId | string | - | 施設ID | `obara-hospital` |
| departmentId | string | - | 部署ID | `nursing-dept` |
| startDate | string | - | 開始日 | `2025-01-01` |
| endDate | string | - | 終了日 | `2025-12-31` |
| limit | number | - | 取得件数 | `50` |
| offset | number | - | オフセット | `0` |

#### レスポンス

```typescript
{
  success: true;
  data: {
    decisions: ExpiredEscalationDecision[];
    total: number;
    limit: number;
    offset: number;
  };
  summary: {
    totalDecisions: number;
    approvalCount: number;
    downgradeCount: number;
    rejectCount: number;
    averageAchievementRate: number;
    averageDaysOverdue: number;
  };
}
```

### 4.3 期限到達提案一覧API

#### エンドポイント

```
GET /api/agenda/expired-escalation-proposals
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| userId | string | ✅ | ユーザーID |
| permissionLevel | number | ✅ | 権限レベル |
| facilityId | string | - | 施設ID |
| departmentId | string | - | 部署ID |

#### レスポンス

```typescript
{
  success: true;
  data: {
    proposals: Array<{
      id: string;
      content: string;
      agendaLevel: string;
      currentScore: number;
      targetScore: number;
      achievementRate: number;
      deadline: string;
      daysOverdue: number;
    }>;
  };
}
```

---

## 5. フロントエンド実装

### 5.1 画面一覧

| 画面名 | パス | 権限 | 状態 |
|-------|------|------|------|
| 期限到達提案一覧 | `/expired-escalation-proposals` | LEVEL_7+ | ✅ 完了 |
| 判断履歴ページ | `/reports/decision-history` | LEVEL_5+ | ✅ 完了 |

### 5.2 コンポーネント構成

#### 期限到達提案一覧ページ

```
ExpiredEscalationProposalsPage
├── サマリー統計カード
│   ├── 総提案件数
│   ├── 平均到達率
│   └── 平均超過日数
├── フィルタパネル
│   ├── 議題レベル選択
│   ├── 提案タイプ選択
│   └── 並び順選択
├── 提案一覧テーブル
│   ├── 提案内容
│   ├── 到達率
│   ├── 超過日数
│   └── 判断ボタン
└── ExpiredEscalationDecisionModal（判断モーダル）
    ├── 提案詳細表示
    ├── スコア情報表示
    ├── 判断タイプ選択（ラジオボタン）
    │   ├── 承認
    │   ├── 格下げ
    │   └── 却下
    ├── 判断理由入力（テキストエリア）
    └── 送信ボタン
```

#### 判断履歴ページ

```
DecisionHistoryPage
├── サマリー統計カード（6種類）
│   ├── 総判断件数
│   ├── 承認件数・割合
│   ├── 格下げ件数・割合
│   ├── 却下件数・割合
│   ├── 平均到達率
│   └── 平均超過日数
├── フィルタパネル
│   ├── 判断タイプ選択
│   ├── アジェンダレベル選択
│   ├── 提案タイプ選択
│   └── 並び順選択
├── 判断履歴テーブル
│   ├── 判断日時
│   ├── 判断結果
│   ├── 提案内容
│   ├── 判断者
│   ├── 到達率
│   └── 超過日数
├── 詳細モーダル
│   ├── 提案内容
│   ├── 判断結果・理由
│   ├── 判断者・提案者情報
│   └── スコア情報
├── ページネーション
│   ├── 前へ/次へボタン
│   └── ページ情報表示
└── CSVエクスポートボタン
```

### 5.3 カスタムフック

#### useDecisionHistory

```typescript
const {
  decisions,        // 判断履歴データ配列
  summary,          // サマリー統計
  pagination,       // ページネーション情報
  isLoading,        // ローディング状態
  error,            // エラー情報
  filter,           // 現在のフィルタ条件
  setFilter,        // フィルタ更新関数
  refetch,          // データ再取得関数
  goToPage,         // ページ移動関数
  nextPage,         // 次ページ関数
  previousPage,     // 前ページ関数
} = useDecisionHistory({
  userLevel: 99,
  userId: 'test-user',
  userFacilityId: null,
  autoFetch: true,
});
```

### 5.4 ファイル構成

```
src/
├── app/
│   └── reports/
│       └── decision-history/
│           └── page.tsx                          # 判断履歴ページ
├── pages/
│   └── ExpiredEscalationProposalsPage.tsx        # 期限到達提案一覧
├── components/
│   └── agenda-mode/
│       └── ExpiredEscalationDecisionModal.tsx    # 判断モーダル
├── hooks/
│   └── useDecisionHistory.ts                     # カスタムフック
├── api/
│   └── expiredEscalationDecision.ts              # API関数
└── routes/
    └── agendaExpiredEscalationRoutes.ts          # Expressルート
```

---

## 6. テストデータ

### 6.1 テストデータ仕様

| 項目 | 値 |
|------|-----|
| 総件数 | 10件 |
| 承認 | 6件（60%） |
| 格下げ | 2件（20%） |
| 却下 | 2件（20%） |
| 平均到達率 | 65.0% |
| 平均期限超過日数 | 11.9日 |

### 6.2 議題レベル別内訳

| レベル | 件数 | 目標スコア | スコア範囲 | 到達率範囲 |
|-------|------|----------|----------|----------|
| 部署 | 4件 | 100点 | 30-80点 | 30-80% |
| 施設 | 3件 | 300点 | 150-250点 | 50-83% |
| 法人 | 3件 | 600点 | 420-550点 | 70-92% |

### 6.3 テストデータ生成スクリプト

#### ファイル

- [`scripts/create-sample-proposals.ts`](../scripts/create-sample-proposals.ts) - 提案データ作成
- [`scripts/generate-expired-escalation-test-data.ts`](../scripts/generate-expired-escalation-test-data.ts) - 判断データ生成
- [`scripts/export-test-data-to-json.ts`](../scripts/export-test-data-to-json.ts) - JSONエクスポート
- [`scripts/export-test-data-to-sql.ts`](../scripts/export-test-data-to-sql.ts) - SQLエクスポート

#### 実行方法

```bash
# 1. 提案データ作成（10件）
npx tsx scripts/create-sample-proposals.ts

# 2. 判断データ生成（10件）
npx tsx scripts/generate-expired-escalation-test-data.ts

# 3. エクスポート
npx tsx scripts/export-test-data-to-json.ts
npx tsx scripts/export-test-data-to-sql.ts
```

### 6.4 エクスポートファイル

| ファイル | パス | サイズ | 形式 |
|---------|------|--------|------|
| JSON | `mcp-shared/test-data/expired-escalation-history.json` | 12KB | JSON |
| SQL | `mcp-shared/test-data/expired-escalation-history.sql` | 7.9KB | SQL |

---

## 7. フェーズ別実装計画

### 7.1 Phase 1: 基本機能実装（完了）

**期間**: 2025年10月15日 - 10月18日
**ステータス**: ✅ 完了

#### 実装内容

- [x] データベーススキーマ定義
- [x] バックエンドAPI実装
  - [x] 判断記録API
  - [x] 判断履歴取得API
  - [x] 期限到達提案取得API
- [x] フロントエンドUI実装
  - [x] 期限到達提案一覧ページ
  - [x] 判断モーダル
- [x] 権限レベル別フィルタリング
- [x] メニュー設定

### 7.2 Phase 2: テストデータ・エクスポート（完了）

**期間**: 2025年10月19日 - 10月20日
**ステータス**: ✅ 完了

#### 実装内容

- [x] テストデータ生成スクリプト
  - [x] 提案データ作成
  - [x] 判断履歴生成（目標スコア修正済み）
- [x] JSONエクスポート
- [x] SQLエクスポート
- [x] データ検証スクリプト
- [x] 医療システムチームへの連絡書作成

#### 修正事項

- **目標スコア計算バグ修正**
  - 修正前: 全レベルで100点
  - 修正後: 部署100点、施設300点、法人600点
  - 平均到達率: 224.5% → 65.0%

### 7.3 Phase 3: 統計・レポート拡張（予定）

**期間**: 2025年10月21日 - 10月25日
**ステータス**: ⏳ 未着手

#### 実装予定

- [ ] 統計グラフ追加
  - [ ] 判断タイプ別円グラフ
  - [ ] 月次トレンドグラフ
  - [ ] 権限レベル別棒グラフ
- [ ] 詳細フィルタ追加
  - [ ] 日付範囲ピッカー
  - [ ] 部署選択ドロップダウン
  - [ ] 施設選択ドロップダウン
- [ ] 検索機能
  - [ ] 提案内容全文検索
  - [ ] 判断理由検索

### 7.4 Phase 4: MCP統合・医療システム連携（予定）

**期間**: 2025年10月22日 - 10月23日
**ステータス**: ⏳ 未着手

#### VoiceDrive側

- [ ] MCP API実装
- [ ] リアルタイム同期機能
- [ ] データ整合性チェック

#### 医療システム側

- [ ] レポート画面実装
- [ ] MCP APIエンドポイント実装
- [ ] 権限認証・認可処理
- [ ] CSVエクスポート機能

### 7.5 Phase 5: テスト・デバッグ（予定）

**期間**: 2025年10月24日 - 10月27日
**ステータス**: ⏳ 未着手

#### テスト項目

- [ ] 単体テスト
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] 権限レベル別動作確認
- [ ] パフォーマンステスト

### 7.6 Phase 6: ベータリリース（予定）

**期間**: 2025年11月1日
**ステータス**: ⏳ 未着手

#### リリース対象

- LEVEL_14-18（法人管理者）向けベータ版
- フィードバック収集
- バグ修正

### 7.7 Phase 7: 本番リリース（予定）

**期間**: 2025年11月15日
**ステータス**: ⏳ 未着手

#### リリース対象

- LEVEL_5-18（全管理者）向け正式版
- 運用開始
- 監視体制確立

---

## 8. 医療システム連携

### 8.1 連携方式

#### MCP共有フォルダ方式

```
mcp-shared/
├── docs/                                          # ドキュメント
│   ├── phase6-test-data-delivery-notice.md        # テストデータ納品連絡書
│   ├── expired-escalation-report-access-levels.md # アクセス権限設計書
│   ├── cron-job-setup.md                          # Cron Job設定書
│   └── phase6-voicedrive-action-plan-20251021.md  # 実装計画書
├── test-data/                                     # テストデータ
│   ├── expired-escalation-history.json            # JSON形式
│   └── expired-escalation-history.sql             # SQL形式
├── config/                                        # 設定ファイル
│   └── interview-types.json                       # 面談タイプ設定
├── interfaces/                                    # TypeScript型定義
│   └── interview.interface.ts                     # インターフェース
└── sync-status.json                               # 同期ステータス
```

### 8.2 データ形式

#### JSON形式

```json
{
  "metadata": {
    "exportDate": "2025-10-19T23:30:59.224Z",
    "totalCount": 10,
    "version": "1.0.0",
    "description": "Phase 6 期限到達判断履歴テストデータ"
  },
  "summary": {
    "totalDecisions": 10,
    "approvalCount": 6,
    "downgradeCount": 2,
    "rejectCount": 2,
    "averageAchievementRate": 65.0,
    "averageDaysOverdue": 11.9
  },
  "decisions": [...]
}
```

#### SQL形式

```sql
-- テーブル作成
CREATE TABLE IF NOT EXISTS "expired_escalation_decisions" (...);

-- インデックス作成
CREATE INDEX IF NOT EXISTS "expired_escalation_decisions_...";

-- データ投入
BEGIN TRANSACTION;
INSERT INTO "expired_escalation_decisions" (...) VALUES (...);
COMMIT;
```

### 8.3 医療システム側実装予定

#### レポート画面

| 画面 | 機能 | 優先度 |
|------|------|--------|
| 判断履歴一覧 | フィルタ・ソート・ページネーション | 高 |
| 統計ダッシュボード | グラフ表示・KPI表示 | 高 |
| 詳細画面 | 判断詳細・関連情報表示 | 中 |
| CSVエクスポート | データダウンロード | 中 |

#### MCP API

| エンドポイント | メソッド | 機能 | 優先度 |
|--------------|---------|------|--------|
| `/mcp/expired-escalation-history` | GET | 判断履歴取得 | 高 |
| `/mcp/expired-escalation-stats` | GET | 統計情報取得 | 高 |
| `/mcp/expired-escalation-export` | GET | CSVエクスポート | 中 |

---

## 9. セキュリティ・権限設計

### 9.1 権限レベル定義

| レベル | 役職 | アクセス権限 |
|-------|------|------------|
| LEVEL_1-4 | 一般職員 | アクセス不可 |
| LEVEL_5-6 | 主任 | 自身の判断のみ閲覧 |
| LEVEL_7-8 | 師長 | 部署内統計閲覧・判断実行 |
| LEVEL_9-13 | 副看護部長・看護部長 | 施設内全体閲覧・判断実行 |
| LEVEL_14-18 | 法人本部 | 法人全体閲覧 |
| LEVEL_99 | システム管理者 | 全データアクセス |

### 9.2 データフィルタリングロジック

```typescript
function buildWhereCondition(
  userId: string,
  permissionLevel: number,
  facilityId?: string,
  departmentId?: string
): any {
  if (permissionLevel === 99) {
    // LEVEL_99: 全データアクセス
    return {};
  }

  if (permissionLevel >= 16 && permissionLevel <= 17) {
    // LEVEL_16-17: 組織開発担当（全データ）
    return {};
  }

  if (permissionLevel >= 14 && permissionLevel <= 15) {
    // LEVEL_14-15: 法人全体
    return {};
  }

  if (permissionLevel >= 12 && permissionLevel <= 13) {
    // LEVEL_12-13: 施設全体
    return { facilityId };
  }

  if (permissionLevel >= 9 && permissionLevel <= 11) {
    // LEVEL_9-11: 施設全体
    return { facilityId };
  }

  if (permissionLevel >= 7 && permissionLevel <= 8) {
    // LEVEL_7-8: 部署内統計のみ
    return {
      OR: [
        { deciderId: userId },
        { department: departmentId }
      ]
    };
  }

  if (permissionLevel >= 5 && permissionLevel <= 6) {
    // LEVEL_5-6: 自身の判断のみ
    return { deciderId: userId };
  }

  // LEVEL_1-4: アクセス不可
  return { id: 'no-access' };
}
```

### 9.3 セキュリティ対策

#### 入力検証

- ✅ 判断理由: 10文字以上必須
- ✅ スコア値: 0以上の整数
- ✅ 判断タイプ: enum値検証
- ✅ SQLインジェクション対策: Prismaによる自動エスケープ

#### 認証・認可

- ✅ JWTトークン認証（将来実装）
- ✅ 権限レベル検証
- ✅ CSRF対策（将来実装）

#### データ保護

- ✅ 個人情報のマスキング（必要に応じて）
- ✅ アクセスログ記録（将来実装）
- ✅ データバックアップ（運用時）

---

## 10. 運用・保守

### 10.1 監視項目

| 項目 | 目標値 | アラート閾値 |
|------|--------|------------|
| API応答時間 | < 500ms | > 2000ms |
| エラー率 | < 1% | > 5% |
| データベースサイズ | - | 監視のみ |
| 同時接続数 | - | > 100 |

### 10.2 バックアップ戦略

| 対象 | 頻度 | 保持期間 |
|------|------|---------|
| データベース | 毎日 | 30日 |
| ログファイル | 毎週 | 90日 |
| エクスポートファイル | 毎日 | 7日 |

### 10.3 ログ管理

#### ログレベル

| レベル | 用途 | 例 |
|-------|------|-----|
| ERROR | エラー発生時 | API呼び出し失敗 |
| WARN | 警告 | スコア計算異常 |
| INFO | 一般情報 | 判断記録成功 |
| DEBUG | デバッグ情報 | クエリパラメータ |

#### ログ出力先

- コンソール（開発環境）
- ファイル（本番環境）: `logs/expired-escalation-{date}.log`
- 監視システム（将来実装）

### 10.4 パフォーマンス最適化

#### データベース

- ✅ インデックス設定
  - `(post_id, decider_id, facility_id, created_at, decision)`
- ⏳ クエリ最適化（Phase 5）
- ⏳ 定期的なVACUUM実行（運用時）

#### フロントエンド

- ✅ ページネーション（50件/ページ）
- ⏳ 仮想スクロール（長いリスト時）
- ⏳ React.memo最適化

#### API

- ⏳ レスポンスキャッシュ（Redis）
- ⏳ CDN利用（静的リソース）

### 10.5 トラブルシューティング

#### よくある問題

| 問題 | 原因 | 対処法 |
|------|------|--------|
| 判断が記録されない | 権限不足 | 権限レベル確認 |
| データが表示されない | フィルタリング | フィルタ条件確認 |
| エクスポート失敗 | ファイル権限 | 権限設定確認 |
| API応答遅延 | データ量増加 | インデックス追加 |

---

## 付録

### A. 用語集

| 用語 | 説明 |
|------|------|
| 期限到達 | 投票期限に達したが目標スコア未達の状態 |
| 判断 | 管理者による承認・格下げ・却下の決定 |
| 到達率 | 現在スコア ÷ 目標スコア × 100 |
| 格下げ | 上位レベルから下位レベルへの降格 |
| MCP | Model Context Protocol（システム間連携） |

### B. 参考資料

- [Phase 6 テストデータ納品連絡書](phase6-test-data-delivery-notice.md)
- [アクセス権限設計書](expired-escalation-report-access-levels.md)
- [Cron Job設定書](cron-job-setup.md)
- [実装計画書（10/21）](phase6-voicedrive-action-plan-20251021.md)

### C. 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|---------|--------|
| 2025-10-20 | 1.0.0 | 初版作成 | VoiceDrive開発チーム |

---

**作成日**: 2025年10月20日
**最終更新**: 2025年10月20日
**承認者**: （承認待ち）
**次回レビュー**: 2025年10月25日

