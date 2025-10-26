# IdeaVoiceTrackingPage 暫定マスターリスト

**文書番号**: MASTER-2025-1026-002
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/IdeaVoiceTrackingPage
**参照文書**:
- [IdeaVoiceTrackingPage_DB要件分析_20251026.md](./IdeaVoiceTrackingPage_DB要件分析_20251026.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

## 📋 概要

このドキュメントは、IdeaVoiceTrackingPageが必要とする全マスターデータと設定値を網羅的にリストアップしたものです。

**重要な発見**:
- ✅ **既存のDB構造で完全に動作可能**
- 🟡 **推奨追加項目**（機能強化）: プロジェクト化履歴、レベル遷移履歴
- ✅ **医療システムからの新規データ提供は不要**

---

## 📊 マスターデータ一覧

### 1. プロジェクトレベルマスター

#### 定義場所
- **コード内定数**: `IdeaVoiceTrackingPage.tsx` 76-107行目
- **管理責任**: VoiceDrive（コード定義）
- **データ形式**: TypeScript定数

#### マスターデータ

| レベルコード | 表示名 | アイコン | 色設定 | スコア閾値 | プロジェクト化 |
|------------|-------|--------|--------|-----------|--------------|
| `PENDING` | アイデア検討中 | 💡 | `text-gray-400 bg-gray-800/50 border-gray-700` | 0-99 | ❌ |
| `TEAM` | チームプロジェクト | 👥 | `text-blue-400 bg-blue-900/30 border-blue-700` | 100-199 | ✅ |
| `DEPARTMENT` | 部署プロジェクト | 🏢 | `text-green-400 bg-green-900/30 border-green-700` | 200-399 | ✅ |
| `FACILITY` | 施設プロジェクト | 🏥 | `text-yellow-400 bg-yellow-900/30 border-yellow-700` | 400-799 | ✅ |
| `ORGANIZATION` | 法人プロジェクト | 🏛️ | `text-purple-400 bg-purple-900/30 border-purple-700` | 800-1599 | ✅ |
| `STRATEGIC` | 戦略プロジェクト | ⭐ | `text-pink-400 bg-pink-900/30 border-pink-700` | 1600+ | ✅ |

#### 実装コード
```typescript
// src/pages/IdeaVoiceTrackingPage.tsx (76-107行目)
const levelConfig: Record<ProjectLevel, { label: string; icon: string; color: string }> = {
  'PENDING': {
    label: 'アイデア検討中',
    icon: '💡',
    color: 'text-gray-400 bg-gray-800/50 border-gray-700'
  },
  'TEAM': {
    label: 'チームプロジェクト',
    icon: '👥',
    color: 'text-blue-400 bg-blue-900/30 border-blue-700'
  },
  'DEPARTMENT': {
    label: '部署プロジェクト',
    icon: '🏢',
    color: 'text-green-400 bg-green-900/30 border-green-700'
  },
  'FACILITY': {
    label: '施設プロジェクト',
    icon: '🏥',
    color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700'
  },
  'ORGANIZATION': {
    label: '法人プロジェクト',
    icon: '🏛️',
    color: 'text-purple-400 bg-purple-900/30 border-purple-700'
  },
  'STRATEGIC': {
    label: '戦略プロジェクト',
    icon: '⭐',
    color: 'text-pink-400 bg-pink-900/30 border-pink-700'
  }
};
```

#### 管理方法
- ❌ **DBテーブル不要** - コード内定数で管理
- ✅ **変更時**: コード修正 → デプロイ
- ✅ **一貫性**: `src/types/visibility.ts` の `ProjectLevel` 型と同期

---

### 2. スコア閾値マスター

#### 定義場所
- **コード内定数**: `IdeaVoiceTrackingPage.tsx` 56-73行目
- **管理責任**: VoiceDrive（コード定義）
- **データ形式**: TypeScript配列

#### マスターデータ

| レベル | スコア閾値 | 説明 | 備考 |
|-------|-----------|------|------|
| `TEAM` | 100 | チームプロジェクト開始 | プロジェクト化開始ライン |
| `DEPARTMENT` | 200 | 部署プロジェクト | |
| `FACILITY` | 400 | 施設プロジェクト | |
| `ORGANIZATION` | 800 | 法人プロジェクト | |

#### 実装コード
```typescript
// src/pages/IdeaVoiceTrackingPage.tsx (56-73行目)
const getScoreToNextLevel = (currentScore: number, projectLevel: ProjectLevel): { nextLevel: ProjectLevel; remaining: number } | null => {
  const thresholds: Array<{ level: ProjectLevel; score: number }> = [
    { level: 'TEAM', score: 100 },
    { level: 'DEPARTMENT', score: 200 },
    { level: 'FACILITY', score: 400 },
    { level: 'ORGANIZATION', score: 800 }
  ];

  for (const threshold of thresholds) {
    if (currentScore < threshold.score) {
      return {
        nextLevel: threshold.level,
        remaining: threshold.score - currentScore
      };
    }
  }

  return null; // 既に最高レベル
};
```

#### プロジェクト化閾値
```typescript
// src/pages/IdeaVoiceTrackingPage.tsx (45-47行目)
const getProjectThreshold = (): number => {
  return 100; // TEAM レベル = プロジェクト化開始
};
```

#### 管理方法
- ❌ **DBテーブル不要** - コード内定数で管理
- ✅ **変更時**: コード修正 → デプロイ
- ⚠️ **注意**: `ProjectPermissionService` の閾値と同期必要

---

### 3. 投票オプションマスター

#### 定義場所
- **型定義**: `src/types/index.ts`
- **管理責任**: VoiceDrive（型定義）
- **データ形式**: TypeScript Union型

#### マスターデータ

| 投票オプション | 表示名 | 重み | 説明 |
|--------------|-------|------|------|
| `strongly-support` | 強く支持 | 2.0 | 最も肯定的 |
| `support` | 支持 | 1.0 | 肯定的 |
| `neutral` | 中立 | 0.0 | どちらでもない |
| `oppose` | 反対 | -1.0 | 否定的 |
| `strongly-oppose` | 強く反対 | -2.0 | 最も否定的 |

#### 実装コード
```typescript
// src/types/index.ts
export type VoteOption =
  | 'strongly-support'
  | 'support'
  | 'neutral'
  | 'oppose'
  | 'strongly-oppose';
```

#### スコア計算での使用
```typescript
// src/hooks/projects/useProjectScoring.ts
const convertVotesToEngagements = (votes: Record<string, number>): EngagementData[] => {
  const engagements: EngagementData[] = [];
  const voteTypes = ['strongly-oppose', 'oppose', 'neutral', 'support', 'strongly-support'] as const;

  voteTypes.forEach(voteType => {
    const count = votes[voteType] || 0;
    for (let i = 0; i < count; i++) {
      engagements.push({
        userId: `user_${userIndex % 100}`,
        level: voteType,
        timestamp: new Date()
      });
      userIndex++;
    }
  });

  return engagements;
};
```

#### 管理方法
- ❌ **DBテーブル不要** - 型定義で管理
- ✅ **変更時**: 型定義修正 → デプロイ
- ✅ **一貫性**: 全システムで共通の投票オプション

---

### 4. 提案タイプマスター

#### 定義場所
- **型定義**: `src/types/index.ts`
- **管理責任**: VoiceDrive（型定義）
- **データ形式**: TypeScript Union型

#### マスターデータ

| 提案タイプ | 表示名 | アイコン | 説明 |
|-----------|-------|--------|------|
| `operational` | 業務改善 | 🏥 | 業務プロセスの改善 |
| `communication` | コミュニケーション | 👥 | チーム連携の改善 |
| `innovation` | イノベーション | 💡 | 新しい取り組み |
| `strategy` | 戦略提案 | 🎯 | 組織戦略の提案 |

#### 実装コード
```typescript
// src/types/index.ts
export type ProposalType =
  | 'operational'
  | 'communication'
  | 'innovation'
  | 'strategy';
```

#### デモデータでの使用例
```typescript
// src/pages/IdeaVoiceTrackingPage.tsx (273-342行目)
const getDemoMyIdeas = (): Post[] => {
  return [
    {
      id: 'demo-idea-1',
      type: 'improvement',
      proposalType: 'operational',  // 業務改善
      content: '新人教育プログラムの体系化とメンター制度の導入を提案します',
      // ...
    },
    {
      id: 'demo-idea-2',
      type: 'improvement',
      proposalType: 'communication',  // コミュニケーション
      content: '多職種カンファレンスの定期開催で情報共有を強化したい',
      // ...
    },
    {
      id: 'demo-idea-3',
      type: 'improvement',
      proposalType: 'operational',  // 業務改善
      content: '勤務シフト作成の効率化ツールを導入したい',
      // ...
    }
  ];
};
```

#### 管理方法
- ❌ **DBテーブル不要** - 型定義で管理
- ✅ **変更時**: 型定義修正 → デプロイ
- ⚠️ **注意**: スコア計算ロジックで `proposalType` を考慮

---

### 5. 投稿タイプマスター

#### 定義場所
- **型定義**: `src/types/index.ts`
- **管理責任**: VoiceDrive（型定義）
- **データ形式**: TypeScript Union型

#### マスターデータ

| 投稿タイプ | 表示名 | 説明 | IdeaVoiceTrackingPageでの使用 |
|-----------|-------|------|---------------------------|
| `improvement` | アイデアボイス | 改善提案・アイデア投稿 | ✅ メイン対象 |
| `community` | コミュニティ | 雑談・情報共有 | ❌ 対象外 |
| `report` | 報告 | 業務報告 | ❌ 対象外 |

#### 実装コード
```typescript
// src/types/index.ts
export type PostType =
  | 'improvement'
  | 'community'
  | 'report';
```

#### フィルタリングでの使用
```typescript
// src/pages/IdeaVoiceTrackingPage.tsx (35-36行目)
const loadIdeasData = () => {
  // 自分が投稿したアイデアボイス投稿（type: 'improvement'）を取得
  setMyIdeas(getDemoMyIdeas());
};

// 実際のAPI実装例
const myIdeas = await prisma.post.findMany({
  where: {
    authorId: userId,
    type: 'improvement',  // アイデアボイス投稿のみ
  }
});
```

#### 管理方法
- ❌ **DBテーブル不要** - 型定義で管理
- ✅ **変更時**: 型定義修正 → デプロイ
- ✅ **一貫性**: Postテーブルのtypeフィールドと同期

---

## 🗄️ データベーステーブル対応表

### 既存テーブル（使用中）

| テーブル名 | 使用目的 | 主要フィールド | 状態 |
|-----------|---------|---------------|------|
| `Post` | アイデア投稿の保存 | id, type, content, authorId, proposalType, createdAt | ✅ 使用中 |
| `Vote` | 投票記録 | id, postId, userId, option, timestamp | ✅ 使用中 |
| `User` | ユーザー情報 | id, name, department, permissionLevel | ✅ 使用中 |
| `VoteHistory` | 投票履歴（詳細） | id, userId, postId, voteOption, voteWeight, votedAt | ✅ 使用中 |

### 推奨追加テーブル（機能強化）

| テーブル名 | 使用目的 | 優先度 | 状態 |
|-----------|---------|--------|------|
| `ProjectizedHistory` | プロジェクト化達成履歴 | 🟡 中 | ⚠️ 未実装（推奨） |
| `ProjectLevelTransitionHistory` | レベル遷移履歴 | 🟡 中 | ⚠️ 未実装（推奨） |

---

## 📝 設定値一覧

### 1. スコア計算設定

| 設定項目 | 設定値 | 定義場所 | 説明 |
|---------|-------|---------|------|
| プロジェクト化閾値 | 100 | `IdeaVoiceTrackingPage.tsx:46` | TEAM レベル開始 |
| TEAM閾値 | 100 | `IdeaVoiceTrackingPage.tsx:57` | チームプロジェクト |
| DEPARTMENT閾値 | 200 | `IdeaVoiceTrackingPage.tsx:58` | 部署プロジェクト |
| FACILITY閾値 | 400 | `IdeaVoiceTrackingPage.tsx:59` | 施設プロジェクト |
| ORGANIZATION閾値 | 800 | `IdeaVoiceTrackingPage.tsx:60` | 法人プロジェクト |

### 2. 投票重み設定

| 投票オプション | 重み | 定義場所 | 説明 |
|--------------|------|---------|------|
| strongly-support | 2.0 | `ProjectScoring.ts` | 強く支持 |
| support | 1.0 | `ProjectScoring.ts` | 支持 |
| neutral | 0.0 | `ProjectScoring.ts` | 中立 |
| oppose | -1.0 | `ProjectScoring.ts` | 反対 |
| strongly-oppose | -2.0 | `ProjectScoring.ts` | 強く反対 |

### 3. 表示設定

| 設定項目 | 設定値 | 定義場所 | 説明 |
|---------|-------|---------|------|
| 統計カード数 | 4 | `IdeaVoiceTrackingPage.tsx:124-159` | 総数、検討中、プロジェクト化、平均 |
| アイデアカード情報数 | 3 | `IdeaVoiceTrackingPage.tsx:215-228` | スコア、投票数、支持率 |

---

## 🔄 データ同期要件

### VoiceDrive内部データ（同期不要）

| データ項目 | 管理システム | 同期方法 | 備考 |
|-----------|------------|---------|------|
| 投稿データ | VoiceDrive | - | 内部管理 |
| 投票データ | VoiceDrive | - | 内部管理 |
| スコア計算 | VoiceDrive | - | リアルタイム計算 |
| プロジェクトレベル | VoiceDrive | - | リアルタイム計算 |

### 医療システムからのデータ（既存同期）

| データ項目 | 管理システム | 同期方法 | 備考 |
|-----------|------------|---------|------|
| ユーザー基本情報 | 医療システム | API/Webhook | User.name, department等 |
| 権限レベル | 医療システム | API/Webhook | User.permissionLevel |

**重要**: IdeaVoiceTrackingPageは **医療システムからの新規データ提供は不要**

---

## ✅ 完全性チェックリスト

### マスターデータ整備

- [x] プロジェクトレベルマスター定義済み
- [x] スコア閾値マスター定義済み
- [x] 投票オプションマスター定義済み
- [x] 提案タイプマスター定義済み
- [x] 投稿タイプマスター定義済み

### データベーステーブル

- [x] Postテーブル存在確認
- [x] Voteテーブル存在確認
- [x] Userテーブル存在確認
- [x] VoteHistoryテーブル存在確認
- [ ] ProjectizedHistoryテーブル追加（推奨）
- [ ] ProjectLevelTransitionHistoryテーブル追加（推奨）

### 設定値確認

- [x] スコア計算設定確認
- [x] 投票重み設定確認
- [x] 表示設定確認

### データフロー検証

- [x] 投稿データ取得フロー確認
- [x] 投票集計フロー確認
- [x] スコア計算フロー確認
- [x] プロジェクトレベル判定フロー確認

---

## 📊 データ依存関係図

```
IdeaVoiceTrackingPage
  ↓ 取得
Post（type='improvement', authorId=userId）
  ↓ 含む
Vote（投票データ）
  ↓ 変換
EngagementData[]
  ↓ 計算
ProjectScore（スコア）
  ↓ 判定
ProjectLevel（レベル）
  ↓ 表示
levelConfig（表示設定）
```

---

## 🔗 関連ドキュメント

- [IdeaVoiceTrackingPage_DB要件分析](./IdeaVoiceTrackingPage_DB要件分析_20251026.md)
- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_暫定マスターリスト](./PersonalStation_暫定マスターリスト_20251008.md) ※参考
- [idea-tracking暫定マスターリスト](./idea-tracking暫定マスターリスト_20251018.md) ※参考

---

## 📝 補足事項

### コード内定数のメリット

IdeaVoiceTrackingPageで使用される主要なマスターデータ（プロジェクトレベル、スコア閾値等）は **コード内定数** として管理されています。

**メリット**:
1. ✅ **高速**: DB問い合わせ不要
2. ✅ **シンプル**: テーブル管理不要
3. ✅ **型安全**: TypeScriptの型チェック
4. ✅ **バージョン管理**: Gitで変更履歴管理

**デメリット**:
1. ⚠️ **柔軟性**: 変更時にデプロイ必要
2. ⚠️ **動的変更**: 実行時の変更不可

**現時点の判断**:
- プロジェクトレベルやスコア閾値は **頻繁に変更されない** ため、コード内定数で問題なし
- 将来的に動的変更が必要になった場合は、マスターテーブル化を検討

---

### 推奨追加テーブルの判断基準

**ProjectizedHistory** と **ProjectLevelTransitionHistory** は以下の理由で **推奨** としました:

**追加すべき理由**:
1. ✅ プロジェクト化達成の正確な記録
2. ✅ ユーザーへの通知管理
3. ✅ 成長分析・トレンド分析
4. ✅ レベル到達タイミングの可視化

**追加しなくても動作する理由**:
1. ✅ 現在のスコアで判定可能
2. ✅ 履歴がなくても基本機能は動作

**判断**:
- **Phase 1**: 追加なしで基本機能動作確認
- **Phase 2-3**: 機能強化として追加実装

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
承認: 未承認（レビュー待ち）
次回レビュー: Phase 2実装時
