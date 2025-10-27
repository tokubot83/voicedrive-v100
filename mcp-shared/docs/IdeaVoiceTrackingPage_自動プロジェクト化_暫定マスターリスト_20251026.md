# IdeaVoiceTrackingPage（自動プロジェクト化）暫定マスターリスト

**作成日**: 2025年10月26日
**対象ページ**: IdeaVoiceTrackingPage（URL: `/auto-projectization`）
**ページ種別**: **プロジェクトモードページ**（議題モードとは別）
**データ所有**: 100% VoiceDrive

---

## 📋 概要

このドキュメントは、IdeaVoiceTrackingPage（自動プロジェクト化ページ）で使用されるマスターデータの一覧と、データ管理責任の所在を明確にするための暫定リストです。

### 重要な前提
- **プロジェクトモードページ**: 議題モード系ページとは完全に別のデータ管理体系
- **VoiceDrive独自機能**: 医療システムとのデータ連携は不要
- **実装状態**: Phase 1-3 完全実装済み

---

## 🗂️ マスターデータ一覧

### 1. プロジェクトレベル定義

**データ種別**: 定数マスター
**管理責任**: VoiceDrive
**更新頻度**: ほぼ不変
**実装状態**: ✅ 完全実装済み

| レベルコード | レベル名 | スコア範囲 | アイコン | 説明 | 権限範囲 |
|------------|---------|-----------|---------|------|---------|
| `PENDING` | アイデア検討中 | 0-99 | 💡 | プロジェクト化前の状態 | 投稿者のみ |
| `TEAM` | チームプロジェクト | 100-199 | 👥 | チーム単位のプロジェクト | チームメンバー |
| `DEPARTMENT` | 部署プロジェクト | 200-399 | 🏢 | 部署単位のプロジェクト | 部署メンバー |
| `FACILITY` | 施設プロジェクト | 400-799 | 🏥 | 施設全体のプロジェクト | 施設メンバー |
| `ORGANIZATION` | 法人プロジェクト | 800+ | 🏛️ | 法人全体のプロジェクト | 法人メンバー |
| `STRATEGIC` | 戦略プロジェクト | 特別指定 | ⭐ | 経営戦略レベル | 経営層 |

**実装場所**: [src/pages/IdeaVoiceTrackingPage.tsx:40-47](../../src/pages/IdeaVoiceTrackingPage.tsx#L40-L47)

```typescript
const levelConfig: Record<ProjectLevel, { label: string; icon: string; color: string }> = {
  'PENDING': { label: 'アイデア検討中', icon: '💡', color: 'text-gray-400 bg-gray-800/50 border-gray-700' },
  'TEAM': { label: 'チームプロジェクト', icon: '👥', color: 'text-blue-400 bg-blue-900/30 border-blue-700' },
  'DEPARTMENT': { label: '部署プロジェクト', icon: '🏢', color: 'text-green-400 bg-green-900/30 border-green-700' },
  'FACILITY': { label: '施設プロジェクト', icon: '🏥', color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700' },
  'ORGANIZATION': { label: '法人プロジェクト', icon: '🏛️', color: 'text-purple-400 bg-purple-900/30 border-purple-700' },
  'STRATEGIC': { label: '戦略プロジェクト', icon: '⭐', color: 'text-pink-400 bg-pink-900/30 border-pink-700' }
};
```

---

### 2. レベル閾値定義

**データ種別**: 定数マスター
**管理責任**: VoiceDrive
**更新頻度**: ほぼ不変
**実装状態**: ✅ 完全実装済み

| レベル遷移 | 開始レベル | 目標レベル | 必要スコア | スコア増分 |
|-----------|-----------|-----------|-----------|-----------|
| プロジェクト化 | PENDING | TEAM | 100 | +100 |
| チーム→部署 | TEAM | DEPARTMENT | 200 | +100 |
| 部署→施設 | DEPARTMENT | FACILITY | 400 | +200 |
| 施設→法人 | FACILITY | ORGANIZATION | 800 | +400 |

**実装場所**: [src/pages/IdeaVoiceTrackingPage.tsx:50-55](../../src/pages/IdeaVoiceTrackingPage.tsx#L50-L55)

```typescript
const thresholds: Array<{ level: ProjectLevel; score: number }> = [
  { level: 'TEAM', score: 100 },
  { level: 'DEPARTMENT', score: 200 },
  { level: 'FACILITY', score: 400 },
  { level: 'ORGANIZATION', score: 800 }
];
```

**ビジネスロジック**: [src/services/ProjectPermissionService.ts](../../src/services/ProjectPermissionService.ts)

```typescript
export function getProjectLevelFromScore(score: number): ProjectLevel {
  if (score >= 800) return 'ORGANIZATION';
  if (score >= 400) return 'FACILITY';
  if (score >= 200) return 'DEPARTMENT';
  if (score >= 100) return 'TEAM';
  return 'PENDING';
}
```

---

### 3. 投票オプション定義

**データ種別**: 定数マスター
**管理責任**: VoiceDrive
**更新頻度**: ほぼ不変
**実装状態**: ✅ 完全実装済み

| オプションコード | 日本語ラベル | スコア重み | 説明 |
|----------------|------------|-----------|------|
| `strongly-support` | 強く賛成 | +20 | 非常に賛同する |
| `support` | 賛成 | +10 | 賛同する |
| `neutral` | 中立 | 0 | どちらでもない |
| `oppose` | 反対 | -10 | 反対する |
| `strongly-oppose` | 強く反対 | -20 | 強く反対する |

**実装場所**: [src/hooks/useProjectScoring.ts](../../src/hooks/useProjectScoring.ts)

```typescript
const weights = {
  'strongly-support': 20,
  'support': 10,
  'neutral': 0,
  'oppose': -10,
  'strongly-oppose': -20
};
```

**用途**: スコア計算、プロジェクトレベル判定の基礎データ

---

### 4. プロジェクト化閾値

**データ種別**: システムパラメータ
**管理責任**: VoiceDrive
**更新頻度**: ほぼ不変
**実装状態**: ✅ 完全実装済み

| パラメータ名 | 値 | 説明 |
|------------|---|------|
| `PROJECTIZATION_THRESHOLD` | 100 | プロジェクト化に必要な最小スコア |

**実装場所**: [src/services/ProjectizationService.ts:30](../../src/services/ProjectizationService.ts#L30)

```typescript
const PROJECTIZATION_THRESHOLD = 100;

// プロジェクト化判定
if (currentScore >= PROJECTIZATION_THRESHOLD && !existingHistory) {
  // プロジェクト化を記録
}
```

---

## 🗄️ データベーステーブル

### 1. Post（投稿）

**テーブル名**: `posts`
**管理責任**: VoiceDrive
**データ種別**: トランザクションデータ
**実装状態**: ✅ 完全実装済み

| フィールド名 | 型 | NULL | 説明 | 用途 |
|------------|---|------|------|------|
| `id` | String | × | 投稿ID（主キー） | 一意識別子 |
| `content` | String | × | 投稿内容 | アイデア本文 |
| `authorId` | String | × | 投稿者ID（外部キー） | ユーザー紐付け |
| `type` | String | × | 投稿タイプ | `'improvement'`でフィルタ |
| `createdAt` | DateTime | × | 作成日時 | ソート順 |
| `updatedAt` | DateTime | × | 更新日時 | 更新管理 |
| `deletedAt` | DateTime | ○ | 削除日時 | 論理削除 |

**インデックス**:
- `authorId` - ユーザー別投稿検索
- `type` - タイプ別フィルタ
- `createdAt` - 日時ソート

**リレーション**:
- `author` → User
- `votes` → Vote[]
- `projectizedHistory` → ProjectizedHistory[]
- `levelHistory` → ProjectLevelHistory[]

---

### 2. Vote（投票）

**テーブル名**: `votes`
**管理責任**: VoiceDrive
**データ種別**: トランザクションデータ
**実装状態**: ✅ 完全実装済み

| フィールド名 | 型 | NULL | 説明 | 用途 |
|------------|---|------|------|------|
| `id` | String | × | 投票ID（主キー） | 一意識別子 |
| `postId` | String | × | 投稿ID（外部キー） | 投稿紐付け |
| `userId` | String | × | 投票者ID（外部キー） | ユーザー紐付け |
| `voteOption` | String | × | 投票オプション | スコア計算用 |
| `createdAt` | DateTime | × | 投票日時 | タイムスタンプ |

**ユニーク制約**: `(postId, userId)` - 1ユーザー1投稿1票

**インデックス**:
- `postId` - 投稿別投票集計
- `userId` - ユーザー別投票履歴

**リレーション**:
- `post` → Post
- `user` → User

---

### 3. ProjectizedHistory（プロジェクト化履歴）

**テーブル名**: `projectized_history`
**管理責任**: VoiceDrive
**データ種別**: トランザクションデータ
**実装状態**: ✅ 完全実装済み

| フィールド名 | 型 | NULL | 説明 | 用途 |
|------------|---|------|------|------|
| `id` | String | × | 履歴ID（主キー） | 一意識別子 |
| `postId` | String | × | 投稿ID（外部キー） | 投稿紐付け |
| `projectizedAt` | DateTime | × | プロジェクト化日時 | 達成タイムスタンプ |
| `projectizedScore` | Int | × | プロジェクト化時スコア | 達成時スコア記録 |
| `projectLevel` | String | × | プロジェクトレベル | 初期レベル記録 |
| `previousScore` | Int | ○ | 前回スコア | スコア履歴 |
| `scoreIncrement` | Int | × | スコア増分 | 増分記録 |
| `isNotified` | Boolean | × | 通知済みフラグ | 通知管理 |
| `notifiedAt` | DateTime | ○ | 通知日時 | 通知タイムスタンプ |

**インデックス**:
- `postId` - 投稿別履歴検索
- `projectizedAt` - 日時ソート

**リレーション**:
- `post` → Post

**ビジネスルール**:
- プロジェクト化は1投稿につき1回のみ記録
- スコアが100に到達した時点で自動記録
- 通知は非同期で送信

---

### 4. ProjectLevelHistory（レベル遷移履歴）

**テーブル名**: `project_level_history`
**管理責任**: VoiceDrive
**データ種別**: トランザクションデータ
**実装状態**: ✅ 完全実装済み

| フィールド名 | 型 | NULL | 説明 | 用途 |
|------------|---|------|------|------|
| `id` | String | × | 履歴ID（主キー） | 一意識別子 |
| `postId` | String | × | 投稿ID（外部キー） | 投稿紐付け |
| `fromLevel` | String | ○ | 変更前レベル | レベル遷移元 |
| `toLevel` | String | × | 変更後レベル | レベル遷移先 |
| `fromScore` | Int | × | 変更前スコア | スコア履歴 |
| `toScore` | Int | × | 変更後スコア | スコア履歴 |
| `upgradedAt` | DateTime | × | レベルアップ日時 | 遷移タイムスタンプ |

**インデックス**:
- `postId` - 投稿別履歴検索
- `upgradedAt` - 日時ソート

**リレーション**:
- `post` → Post

**ビジネスルール**:
- レベル変更のたびに記録
- `fromLevel`が`null`の場合は初回プロジェクト化
- 降格は記録しない（スコアは減少しない設計）

---

### 5. User（ユーザー）

**テーブル名**: `users`
**管理責任**: **医療システム**
**データ種別**: マスターデータ
**実装状態**: ✅ 完全実装済み（医療システム連携）

| フィールド名 | 型 | NULL | 説明 | 用途 |
|------------|---|------|------|------|
| `id` | String | × | ユーザーID（主キー） | 一意識別子 |
| `name` | String | × | ユーザー名 | 表示名 |
| `avatarUrl` | String | ○ | アバターURL | プロフィール画像 |

**VoiceDriveでの用途**:
- 投稿者名表示
- アバター表示
- **参照のみ（更新はしない）**

**データ連携**: 医療システムから読み取り専用で参照

---

## 📊 データ管理責任マトリクス

### プロジェクトモードの特性

**このページはプロジェクトモードページです。議題モード系ページとは別のデータ管理体系を持ちます。**

| データ種別 | テーブル/マスター | 所有システム | 作成 | 更新 | 削除 | 参照 |
|-----------|---------------|------------|-----|-----|-----|-----|
| **定数マスター** | プロジェクトレベル定義 | VoiceDrive | VD | VD | VD | VD |
| **定数マスター** | レベル閾値定義 | VoiceDrive | VD | VD | VD | VD |
| **定数マスター** | 投票オプション定義 | VoiceDrive | VD | VD | VD | VD |
| **システムパラメータ** | プロジェクト化閾値 | VoiceDrive | VD | VD | VD | VD |
| **トランザクション** | Post（投稿） | VoiceDrive | VD | VD | VD | VD |
| **トランザクション** | Vote（投票） | VoiceDrive | VD | VD | VD | VD |
| **トランザクション** | ProjectizedHistory | VoiceDrive | VD | VD | VD | VD |
| **トランザクション** | ProjectLevelHistory | VoiceDrive | VD | VD | VD | VD |
| **マスター** | User（ユーザー） | 医療システム | 医 | 医 | 医 | VD |

**凡例**:
- VD: VoiceDrive
- 医: 医療システム

---

## 🔄 データフロー

### 1. アイデア投稿時
```
[ユーザー] → [投稿] → [Post作成]
```

**所有**: 100% VoiceDrive

---

### 2. 投票時
```
[ユーザー] → [投票] → [Vote作成] → [スコア再計算]
                                     ↓
                          [プロジェクト化判定]
                                     ↓
                          [ProjectizedHistory作成]（閾値到達時）
                                     ↓
                          [レベル遷移判定]
                                     ↓
                          [ProjectLevelHistory作成]（レベル変更時）
                                     ↓
                          [通知生成]
```

**所有**: 100% VoiceDrive

---

### 3. 統計情報表示時
```
[IdeaVoiceTrackingPage] → [Post + Vote取得]
                              ↓
                         [スコア集計]
                              ↓
                         [統計計算]
                              ↓
                         [画面表示]
```

**所有**: 100% VoiceDrive

---

## 🔍 マスターデータ同期要件

### 医療システムとの同期

**対象データ**: User（ユーザー基本情報）のみ

| データ項目 | 同期方向 | 同期頻度 | 同期方法 | 備考 |
|-----------|---------|---------|---------|------|
| ユーザーID | 医療 → VD | リアルタイム | API/SSO | 認証時に取得 |
| ユーザー名 | 医療 → VD | 日次 | バッチ | 表示名更新 |
| アバターURL | 医療 → VD | 日次 | バッチ | プロフィール画像更新 |

**同期不要なデータ**:
- Post（投稿）- VoiceDrive独自データ
- Vote（投票）- VoiceDrive独自データ
- ProjectizedHistory - VoiceDrive独自データ
- ProjectLevelHistory - VoiceDrive独自データ
- プロジェクトレベル定義 - VoiceDrive独自設定
- 投票オプション定義 - VoiceDrive独自設定

---

## 📝 マスターメンテナンス方針

### 1. プロジェクトレベル定義

**メンテナンス主体**: VoiceDrive開発チーム
**更新頻度**: ほぼ不変（年1回程度）
**更新方法**: コード修正 + デプロイ

**変更時の影響範囲**:
- [IdeaVoiceTrackingPage.tsx](../../src/pages/IdeaVoiceTrackingPage.tsx)（レベルバッジ表示）
- [ProjectPermissionService.ts](../../src/services/ProjectPermissionService.ts)（レベル判定ロジック）
- [ProjectizationService.ts](../../src/services/ProjectizationService.ts)（プロジェクト化ロジック）
- [ProjectLevelTransitionService.ts](../../src/services/ProjectLevelTransitionService.ts)（レベル遷移ロジック）

**変更例**:
- 新レベル追加（例: CROSS_ORGANIZATIONAL）
- レベル名変更（例: TEAM → WORKGROUP）
- アイコン変更

---

### 2. レベル閾値定義

**メンテナンス主体**: VoiceDrive管理者
**更新頻度**: 稀（半年～1年に1回程度）
**更新方法**: 環境変数またはコード修正

**変更時の影響範囲**:
- getProjectLevelFromScore()ロジック
- プロジェクト化判定ロジック
- レベル遷移判定ロジック
- 進捗バー計算

**変更例**:
- 閾値調整（例: TEAM: 100 → 50）
- スコア体系見直し

---

### 3. 投票オプション定義

**メンテナンス主体**: VoiceDrive開発チーム
**更新頻度**: ほぼ不変
**更新方法**: コード修正 + デプロイ

**変更時の影響範囲**:
- [useProjectScoring.ts](../../src/hooks/useProjectScoring.ts)（スコア計算）
- 投票UI（VoteButton等）
- スコア表示

**変更例**:
- 重み調整（例: strongly-support: 20 → 30）
- 新オプション追加（例: very-neutral）

---

### 4. プロジェクト化閾値

**メンテナンス主体**: VoiceDrive管理者
**更新頻度**: 稀（運用状況により調整）
**更新方法**: 環境変数またはコード修正

**変更時の影響範囲**:
- [ProjectizationService.ts](../../src/services/ProjectizationService.ts)
- プロジェクト化判定ロジック
- 進捗バー表示

**変更例**:
- 閾値緩和（例: 100 → 80）
- 閾値厳格化（例: 100 → 150）

---

## 🚀 実装完了状態

### Phase 1: 基本機能 ✅
- ✅ 投稿一覧取得
- ✅ スコア計算
- ✅ プロジェクトレベル判定
- ✅ 統計情報表示

### Phase 2: プロジェクト化管理 ✅
- ✅ ProjectizationService実装
- ✅ ProjectizedHistory記録
- ✅ プロジェクト化通知
- ✅ 閾値判定（スコア100）

### Phase 3: レベル遷移管理 ✅
- ✅ ProjectLevelTransitionService実装
- ✅ ProjectLevelHistory記録
- ✅ レベルアップ通知
- ✅ 進捗バー表示

**結論**: **すべて完全実装済み。追加実装不要。**

---

## 📎 参考資料

### コードファイル
- [IdeaVoiceTrackingPage.tsx](../../src/pages/IdeaVoiceTrackingPage.tsx) - メインページ
- [ProjectizationService.ts](../../src/services/ProjectizationService.ts) - プロジェクト化サービス
- [ProjectLevelTransitionService.ts](../../src/services/ProjectLevelTransitionService.ts) - レベル遷移サービス
- [ProjectPermissionService.ts](../../src/services/ProjectPermissionService.ts) - レベル判定ロジック
- [useProjectScoring.ts](../../src/hooks/useProjectScoring.ts) - スコア計算フック

### ドキュメント
- [IdeaVoiceTrackingPage_自動プロジェクト化_DB要件分析_20251026.md](./IdeaVoiceTrackingPage_自動プロジェクト化_DB要件分析_20251026.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [schema.prisma](../../prisma/schema.prisma)

---

**作成日**: 2025年10月26日
**最終更新**: 2025年10月26日
**ステータス**: Phase 1-3 完全実装済み
