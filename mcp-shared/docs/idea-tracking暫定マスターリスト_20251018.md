# アイデア追跡（Idea Tracking - プロジェクトモード）暫定マスターリスト

**文書番号**: IT-ML-2025-1018-001
**作成日**: 2025年10月18日
**最終更新**: 2025年10月18日
**対象機能**: アイデア声追跡（プロジェクトモード）
**ステータス**: 暫定版

---

## 📊 データベーススキーマ拡張計画

### 1. Post テーブル拡張

**目的**: プロジェクトモード用のスコア・レベル・履歴管理

| フィールド名 | 型 | NULL | デフォルト | 説明 | ステータス |
|------------|------|------|----------|------|----------|
| `project_score` | Int | ✅ | 0 | プロジェクトスコア（投票エンゲージメントから計算） | ❌ 追加必要 |
| `project_level` | String | ✅ | NULL | プロジェクトレベル（PENDING/TEAM/DEPARTMENT/FACILITY/ORGANIZATION） | ✅ 既存あり |
| `current_project_level_started_at` | DateTime | ✅ | NULL | 現在のレベルになった日時 | ❌ 追加必要 |
| `last_project_level_upgrade` | DateTime | ✅ | NULL | 最後にレベルアップした日時 | ❌ 追加必要 |
| `total_engagements` | Int | ❌ | 0 | 総エンゲージメント数（キャッシュ） | ❌ 追加必要 |
| `strongly_support_count` | Int | ❌ | 0 | 強く賛成の数（キャッシュ） | ❌ 追加必要 |
| `support_count` | Int | ❌ | 0 | 賛成の数（キャッシュ） | ❌ 追加必要 |
| `neutral_count` | Int | ❌ | 0 | 中立の数（キャッシュ） | ❌ 追加必要 |
| `oppose_count` | Int | ❌ | 0 | 反対の数（キャッシュ） | ❌ 追加必要 |
| `strongly_oppose_count` | Int | ❌ | 0 | 強く反対の数（キャッシュ） | ❌ 追加必要 |

**インデックス追加**:
```prisma
@@index([project_score])
@@index([project_level])
@@index([current_project_level_started_at])
```

**リレーション追加**:
```prisma
projectLevelHistory   ProjectLevelHistory[]
```

---

### 2. ProjectLevelHistory テーブル（新規作成）

**目的**: プロジェクトレベルの昇格履歴を記録

| フィールド名 | 型 | NULL | デフォルト | 説明 | ステータス |
|------------|------|------|----------|------|----------|
| `id` | String | ❌ | cuid() | プライマリキー | ❌ 新規 |
| `post_id` | String | ❌ | - | 投稿ID（外部キー） | ❌ 新規 |
| `from_level` | String | ✅ | NULL | 昇格前レベル（初回作成時はnull） | ❌ 新規 |
| `to_level` | String | ❌ | - | 昇格後レベル | ❌ 新規 |
| `from_score` | Int | ✅ | NULL | 昇格前スコア | ❌ 新規 |
| `to_score` | Int | ❌ | - | 昇格後スコア | ❌ 新規 |
| `triggered_by` | String | ✅ | NULL | トリガー種別（vote_received/committee_submission/manual_upgrade） | ❌ 新規 |
| `triggering_user_id` | String | ✅ | NULL | トリガーとなった投票者ID | ❌ 新規 |
| `upgraded_at` | DateTime | ❌ | now() | 昇格日時 | ❌ 新規 |
| `notes` | String | ✅ | NULL | 備考（手動昇格時の理由など） | ❌ 新規 |

**インデックス**:
```prisma
@@index([post_id])
@@index([to_level])
@@index([upgraded_at])
```

**リレーション**:
```prisma
post   Post   @relation(fields: [post_id], references: [id], onDelete: Cascade)
```

---

### 3. ProjectApproval テーブル（既存確認）

**目的**: プロジェクト承認記録

**ステータス**: ✅ **既存あり**（schema.prisma lines 2059-2082）

**既存フィールド**:
- `id`, `post_id`, `project_level`, `project_score`
- `approver_id`, `approved_at`, `approval_type`, `comments`

**必要な対応**: なし（既存スキーマで対応可能）

---

### 4. VoteHistory テーブル（既存確認）

**目的**: 投票履歴（プロジェクトスコア計算のソース）

**ステータス**: ✅ **既存あり**（schema.prisma lines 445-466）

**既存フィールド**:
- `id`, `user_id`, `post_id`, `vote_option`, `vote_weight`, `voted_at`

**必要な対応**: なし（既存スキーマで対応可能）

---

## 🔌 API実装計画

### API-IT-1: 自分のアイデア一覧取得

**エンドポイント**: `GET /api/my/ideas`

**実装ファイル**: `src/routes/myIdeaRoutes.ts` (新規作成)

**実装内容**:
1. ログインユーザーの投稿を取得（type='improvement'）
2. 各投稿のプロジェクトスコア・レベルを計算
3. フィルタ・ソート適用
4. ページネーション処理
5. 統計サマリー計算（総数、PENDING数、プロジェクト化数、平均スコア）

**依存サービス**:
- `ProjectScoringEngine` (スコア計算)
- `ProjectPermissionService` (レベル判定)

**ステータス**: ❌ **未実装**

---

### API-IT-2: プロジェクトレベル履歴取得

**エンドポイント**: `GET /api/posts/:postId/project-level-history`

**実装ファイル**: `src/routes/projectRoutes.ts` (既存拡張)

**実装内容**:
1. 投稿IDからProjectLevelHistoryレコードを取得
2. 降順ソート（最新が先頭）
3. トリガーユーザー情報を結合

**依存テーブル**:
- `ProjectLevelHistory`

**ステータス**: ❌ **未実装**

---

### API-IT-3: プロジェクトスコア再計算（管理用）

**エンドポイント**: `POST /api/posts/:postId/recalculate-project-score`

**実装ファイル**: `src/routes/adminRoutes.ts` (既存拡張)

**実装内容**:
1. 投稿の全投票エンゲージメントを取得
2. ProjectScoringEngineでスコア再計算
3. Post.project_score を更新
4. レベル変更があればProjectLevelHistory記録

**権限**:
- Level 11（事務長）以上のみ実行可能

**ステータス**: ❌ **未実装**

---

### API-IT-4: プロジェクト承認実行

**エンドポイント**: `POST /api/projects/:postId/approve`

**実装ファイル**: `src/routes/projectRoutes.ts` (既存拡張)

**実装内容**:
1. ログインユーザーの承認権限を確認（ProjectPermissionService）
2. 投稿のプロジェクトレベルと一致するか確認
3. ProjectApprovalレコード作成
4. Post.approval_status を `approved` に更新
5. 投稿者に通知

**依存サービス**:
- `ProjectPermissionService`

**ステータス**: ❌ **未実装**

---

## 🔧 自動処理実装計画

### 処理-IT-1: 投票受付時のスコア自動再計算

**トリガー**: 投票API (`POST /api/posts/:postId/vote`)

**実装箇所**: `src/routes/voteRoutes.ts`

**処理フロー**:
```
1. 投票を VoteHistory に記録
2. 投稿のすべての投票を取得
3. ProjectScoringEngine でスコア再計算
4. Post.project_score を更新
5. エンゲージメント統計フィールド更新
   - total_engagements
   - strongly_support_count
   - support_count
   - neutral_count
   - oppose_count
   - strongly_oppose_count
6. プロジェクトレベル自動昇格判定（処理-IT-2）
```

**ステータス**: ❌ **未実装**

---

### 処理-IT-2: プロジェクトレベル自動昇格判定

**トリガー**: スコア更新時

**実装箇所**: `src/services/ProjectLevelUpgradeService.ts` (新規作成)

**処理フロー**:
```
1. 現在のプロジェクトレベルを取得
2. 新しいスコアから新しいレベルを判定（ProjectPermissionService）
3. レベルが変更された場合:
   a. ProjectLevelHistory に記録
   b. Post.project_level を更新
   c. Post.current_project_level_started_at を更新
   d. Post.last_project_level_upgrade を更新
   e. 投稿者にリアルタイム通知（WebSocket）
```

**ステータス**: ❌ **未実装**

---

### 処理-IT-3: リアルタイム通知（WebSocket）

**トリガー**: プロジェクトレベル昇格時

**実装箇所**: `src/services/WebSocketService.ts` (既存拡張)

**通知内容**:
```json
{
  "type": "project_level_upgraded",
  "data": {
    "postId": "post-001",
    "fromLevel": "PENDING",
    "toLevel": "TEAM",
    "fromScore": 95,
    "toScore": 105,
    "upgradedAt": "2025-10-18T14:00:00Z",
    "message": "おめでとうございます！あなたのアイデアがチームプロジェクトレベルに到達しました。"
  }
}
```

**ステータス**: ❌ **未実装**

---

## 📋 実装チェックリスト

### Phase 1: 基本機能実装（10/19-10/26）

#### データベース
- [ ] Post テーブルにフィールド追加
  - [ ] `project_score` (Int, default: 0)
  - [ ] `current_project_level_started_at` (DateTime, nullable)
  - [ ] `last_project_level_upgrade` (DateTime, nullable)
  - [ ] `total_engagements` (Int, default: 0)
  - [ ] `strongly_support_count` (Int, default: 0)
  - [ ] `support_count` (Int, default: 0)
  - [ ] `neutral_count` (Int, default: 0)
  - [ ] `oppose_count` (Int, default: 0)
  - [ ] `strongly_oppose_count` (Int, default: 0)
- [ ] Post テーブルにインデックス追加
  - [ ] `@@index([project_score])`
  - [ ] `@@index([current_project_level_started_at])`
- [ ] ProjectLevelHistory テーブル作成
- [ ] Prismaマイグレーション実行

#### API実装
- [ ] `GET /api/my/ideas` 実装
  - [ ] スコア計算ロジック統合
  - [ ] フィルタ・ソート処理
  - [ ] ページネーション
  - [ ] 統計サマリー計算
- [ ] `GET /api/posts/:postId/project-level-history` 実装

#### フロントエンド
- [ ] IdeaVoiceTrackingPage.tsx からデモデータ削除
- [ ] 実APIへの切り替え
- [ ] エラーハンドリング追加
- [ ] ローディング状態表示

#### 設定修正
- [ ] ProjectScoring.ts の閾値を 100/200/400/800 に統一

---

### Phase 2: 自動昇格機能（10/27-11/3）

#### サービス実装
- [ ] ProjectLevelUpgradeService 作成
  - [ ] レベル昇格判定ロジック
  - [ ] ProjectLevelHistory 自動記録
  - [ ] Post テーブル更新
- [ ] 投票API拡張（スコア再計算追加）
  - [ ] エンゲージメント統計更新
  - [ ] 自動昇格判定呼び出し

#### 通知機能
- [ ] WebSocket 通知実装
  - [ ] レベル昇格イベント送信
  - [ ] フロントエンド受信処理

#### テスト
- [ ] ユニットテスト（スコア計算）
- [ ] 統合テスト（昇格フロー）
- [ ] E2Eテスト（投票→昇格→通知）

---

### Phase 3: プロジェクト承認フロー（11/4-11/11）

#### API実装
- [ ] `POST /api/projects/:postId/approve` 実装
  - [ ] 権限チェック（ProjectPermissionService）
  - [ ] ProjectApproval レコード作成
  - [ ] Post.approval_status 更新

#### フロントエンド
- [ ] プロジェクト承認UI実装
- [ ] 承認者バッジ表示
- [ ] チーム編成フォーム実装

#### 管理機能
- [ ] `POST /api/posts/:postId/recalculate-project-score` 実装（管理者専用）

---

## 🔍 データ整合性チェック項目

### スコア計算の整合性

- [ ] VoteHistory のすべての投票が ProjectScore に反映されているか
- [ ] 権限レベル重みが正しく適用されているか
- [ ] 投稿タイプ別倍率が正しく適用されているか

### レベル判定の整合性

- [ ] Post.project_score と Post.project_level が一致しているか
- [ ] 閾値が UI 側（100/200/400/800）と計算側で統一されているか

### 履歴記録の整合性

- [ ] すべてのレベル変更が ProjectLevelHistory に記録されているか
- [ ] from_level と to_level が正しい順序か
- [ ] from_score < to_score の関係が保たれているか

---

## 📊 パフォーマンス最適化計画

### キャッシュフィールド活用

**目的**: スコア計算の都度クエリを減らす

**実装**:
1. Post テーブルの統計フィールド（strongly_support_count 等）をキャッシュとして使用
2. 投票時にインクリメント/デクリメント処理
3. スコア計算時は VoteHistory を読まず、キャッシュから計算

**期待効果**:
- 投稿一覧取得時のクエリ数削減（N+1問題回避）
- レスポンスタイム短縮（50ms → 10ms 想定）

### インデックス最適化

**追加インデックス**:
```prisma
@@index([author_id, project_level])  // ユーザー別レベル別フィルタ用
@@index([project_score, created_at]) // スコア順ソート用
```

---

## 🚨 注意事項

### 議題モードとの共存

**重要**: 同じ投稿が議題モードとプロジェクトモードの両方で進行可能

```prisma
model Post {
  // 議題モード用
  agenda_score         Int?
  agenda_level         String?
  agendaLevelHistory   AgendaLevelHistory[]

  // プロジェクトモード用
  project_score        Int?
  project_level        String?
  projectLevelHistory  ProjectLevelHistory[]
}
```

**対応**:
- 両方のスコア・レベルを並行管理
- 履歴テーブルも分離（AgendaLevelHistory と ProjectLevelHistory）

### 閾値の統一

**問題**: ProjectScoring.ts の閾値（50/100/300/600）と UI 側の閾値（100/200/400/800）が不一致

**対応**:
- ProjectScoring.ts を UI 側に合わせて修正
- または、設定ファイルで一元管理（推奨）

```typescript
// config/projectThresholds.ts (新規作成)
export const PROJECT_THRESHOLDS = {
  TEAM: 100,
  DEPARTMENT: 200,
  FACILITY: 400,
  ORGANIZATION: 800
};
```

---

## 📝 今後の拡張予定

### 動的閾値設定（将来）

- 組織規模による閾値調整
- 部署別カスタム閾値
- 季節・時期による調整

### 予算管理統合（将来）

- プロジェクトレベル別予算上限表示
- 予算申請フロー統合

### AIレコメンデーション（将来）

- プロジェクト化見込みスコア予測
- 最適な投票者レコメンド

---

**文書終了**
