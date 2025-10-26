# IdeaVoiceTrackingPage DB要件分析

**文書番号**: DB-REQ-2025-1026-002
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/IdeaVoiceTrackingPage
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
IdeaVoiceTrackingPageは**プロジェクトモード専用のアイデア投稿追跡ページ**で、既存のDB構造で**概ね動作可能**ですが、以下の**推奨追加項目**があります。

### 🟡 推奨追加項目（機能強化）

1. **プロジェクト化履歴テーブル**
   - 投稿がいつプロジェクト化されたかの履歴
   - スコア遷移の記録

2. **プロジェクトレベル遷移履歴**
   - PENDING → TEAM → DEPARTMENT → FACILITY等のレベル遷移記録
   - 各レベル到達日時の記録

3. **投票集計の最適化**
   - 現在は`post.votes`（JSON）に依存
   - `VoteHistory`テーブルで正確な追跡が可能

---

## 🔍 詳細分析

### 1. ページ概要（17-22行目）

#### 目的
```typescript
/**
 * プロジェクトモード専用：アイデアボイス投稿の追跡ページ
 * プロジェクト化前のアイデアボイス投稿の投票スコア進捗を追跡
 */
```

#### 主要機能
1. 自分が投稿したアイデアボイス投稿の一覧表示
2. 投票スコアとプロジェクトレベルの追跡
3. プロジェクト化達成までの進捗表示
4. プロジェクト化済み投稿の識別

---

### 2. 統計サマリー表示（122-160行目）

#### 表示内容
```typescript
// 総アイデア数
{myIdeas.length}

// 検討中（プロジェクト化未達成）
{myIdeas.filter(idea => !isProjectized(score)).length}

// プロジェクト化済み
{myIdeas.filter(idea => isProjectized(score)).length}

// 平均スコア
{Math.round(totalScore / myIdeas.length)}
```

#### 必要なデータソース

| 統計項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| 総アイデア数 | VoiceDrive | ✅ 動作中 | `Post`（既存） | ✅ OK |
| 検討中数 | VoiceDrive | ✅ 計算中 | `Post`（既存） | ✅ OK |
| プロジェクト化済み数 | VoiceDrive | ✅ 計算中 | `Post`（既存） | ✅ OK |
| 平均スコア | VoiceDrive | ✅ 計算中 | `Post`（既存） | ✅ OK |

**評価**: ✅ DB構築計画書の内容で完全対応可能

**データ取得ロジック**:
```typescript
// src/services/IdeaTrackingService.ts
export async function getMyIdeasSummary(userId: string) {
  const ideas = await prisma.post.findMany({
    where: {
      authorId: userId,
      type: 'improvement',
      // proposalType: 任意（operational, communication, innovation等）
    },
    include: {
      votes: true
    }
  });

  const stats = {
    totalIdeas: ideas.length,
    pending: 0,
    projectized: 0,
    averageScore: 0
  };

  let totalScore = 0;
  ideas.forEach(idea => {
    const score = calculateProjectScore(idea.votes);
    totalScore += score;

    if (score >= 100) {
      stats.projectized++;
    } else {
      stats.pending++;
    }
  });

  stats.averageScore = ideas.length > 0 ? Math.round(totalScore / ideas.length) : 0;

  return stats;
}
```

---

### 3. アイデア一覧表示（162-263行目）

#### 表示内容（各アイデアカード）
```typescript
// プロジェクトレベルバッジ
<div className={config.color}>
  {config.icon} {config.label}
</div>

// 投稿内容
<p>{idea.content}</p>

// 投稿日時
{idea.timestamp.toLocaleDateString('ja-JP')}

// スコア情報（3列グリッド）
現在のスコア: {currentScore}
総投票数: {totalVotes}
支持率: {supportRate}%

// 進捗バー（プロジェクト化未達成の場合）
プロジェクト化まであと {nextLevel.remaining} 点

// アクションボタン（プロジェクト化済みの場合）
<button onClick={() => navigate('/project-tracking')}>
  プロジェクトの追跡で確認
</button>
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 投稿リスト | VoiceDrive | ✅ 動作中 | `Post`（既存） | ✅ OK |
| 投稿内容 | VoiceDrive | ✅ 動作中 | `Post.content` | ✅ OK |
| 投稿日時 | VoiceDrive | ✅ 動作中 | `Post.timestamp` | ✅ OK |
| 投票データ | VoiceDrive | ✅ 動作中 | `Post.votes` (JSON) | ✅ OK |
| スコア計算 | VoiceDrive | ✅ 計算中 | ローカル計算 | ✅ OK |
| プロジェクトレベル | VoiceDrive | ✅ 計算中 | ローカル計算 | ✅ OK |

**評価**: ✅ DB構築計画書の内容で完全対応可能

---

### 4. プロジェクトレベル定義（76-107行目）

#### レベル設定
```typescript
const levelConfig: Record<ProjectLevel, { label: string; icon: string; color: string }> = {
  'PENDING': { label: 'アイデア検討中', icon: '💡', color: 'text-gray-400' },
  'TEAM': { label: 'チームプロジェクト', icon: '👥', color: 'text-blue-400' },
  'DEPARTMENT': { label: '部署プロジェクト', icon: '🏢', color: 'text-green-400' },
  'FACILITY': { label: '施設プロジェクト', icon: '🏥', color: 'text-yellow-400' },
  'ORGANIZATION': { label: '法人プロジェクト', icon: '🏛️', color: 'text-purple-400' },
  'STRATEGIC': { label: '戦略プロジェクト', icon: '⭐', color: 'text-pink-400' }
};
```

#### スコア閾値（55-73行目）
```typescript
const thresholds = [
  { level: 'TEAM', score: 100 },       // プロジェクト化開始
  { level: 'DEPARTMENT', score: 200 },
  { level: 'FACILITY', score: 400 },
  { level: 'ORGANIZATION', score: 800 }
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| プロジェクトレベル定義 | VoiceDrive | ✅ コード定義 | 定数 | ✅ OK |
| スコア閾値 | VoiceDrive | ✅ コード定義 | 定数 | ✅ OK |

**評価**: ✅ コード内定数で管理、DB不要

---

### 5. スコア計算ロジック（24-25行目）

#### 使用サービス
```typescript
const { calculateScore, convertVotesToEngagements } = useProjectScoring();

// 計算例（175行目）
const currentScore = calculateScore(
  convertVotesToEngagements(idea.votes || {}),
  idea.proposalType
);
```

#### データフロー
```
Post.votes (JSON)
  ↓ convertVotesToEngagements
EngagementData[]
  ↓ calculateScore
Number (スコア)
  ↓ getProjectLevel
ProjectLevel
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 投票データ | VoiceDrive | ✅ 動作中 | `Post.votes` (JSON) | ✅ OK |
| 投票重み計算 | VoiceDrive | ✅ 計算中 | ローカル計算 | ✅ OK |
| スコア計算 | VoiceDrive | ✅ 計算中 | ローカル計算 | ✅ OK |

**評価**: ✅ 現在のロジックで動作可能

**より正確な追跡のための推奨改善**:
```typescript
// VoteHistoryテーブルを使用した正確な集計
export async function calculateAccurateProjectScore(postId: string) {
  const votes = await prisma.voteHistory.findMany({
    where: { postId },
    include: { user: { select: { permissionLevel: true } } }
  });

  let score = 0;
  votes.forEach(vote => {
    const baseWeight = getVoteWeight(vote.voteOption);
    const permissionWeight = vote.user.permissionLevel;
    score += baseWeight * permissionWeight * vote.voteWeight;
  });

  return score;
}
```

---

### 6. プロジェクト化判定（44-52行目）

#### 判定ロジック
```typescript
const getProjectThreshold = (): number => {
  return 100; // TEAM レベル = プロジェクト化開始
};

const isProjectized = (score: number): boolean => {
  return score >= getProjectThreshold();
};
```

#### データフロー
```
投稿スコア >= 100
  ↓ YES
プロジェクト化達成
  ↓
"プロジェクトの追跡で確認"ボタン表示
  ↓
/project-trackingへ遷移
```

#### 推奨追加テーブル: ProjectizedHistory

**目的**: プロジェクト化達成の履歴記録

```prisma
// VoiceDrive: prisma/schema.prisma
model ProjectizedHistory {
  id                String    @id @default(cuid())
  postId            String    @map("post_id")

  // プロジェクト化情報
  projectizedAt     DateTime  @default(now()) @map("projectized_at")
  projectizedScore  Int       @map("projectized_score")
  // プロジェクト化達成時のスコア（通常100以上）

  projectLevel      String    @map("project_level")
  // TEAM, DEPARTMENT, FACILITY, ORGANIZATION, STRATEGIC

  // スコア遷移記録
  previousScore     Int?      @map("previous_score")
  scoreIncrement    Int?      @map("score_increment")

  // 達成要因分析
  triggerVoteId     String?   @map("trigger_vote_id")
  // プロジェクト化を達成させた投票のID

  // メタデータ
  notifiedAt        DateTime? @map("notified_at")
  isNotified        Boolean   @default(false) @map("is_notified")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  post              Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([projectizedAt])
  @@index([projectLevel])
  @@map("projectized_history")
}

// Postモデルに追加
model Post {
  // ... 既存フィールド
  projectizedHistory  ProjectizedHistory[]  // 🆕 追加
}
```

**利用シーン**:
1. プロジェクト化達成の通知
2. プロジェクト化タイミングの分析
3. スコア遷移のトレンド分析
4. ユーザーへの達成通知

**実装例**:
```typescript
// src/services/ProjectizationService.ts
export async function checkAndRecordProjectization(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { votes: true }
  });

  const currentScore = calculateProjectScore(post.votes);
  const isAlreadyProjectized = await prisma.projectizedHistory.findFirst({
    where: { postId }
  });

  // 初めてプロジェクト化閾値を超えた場合
  if (currentScore >= 100 && !isAlreadyProjectized) {
    await prisma.projectizedHistory.create({
      data: {
        postId,
        projectizedScore: currentScore,
        projectLevel: getProjectLevel(currentScore),
        isNotified: false
      }
    });

    // 著者に通知
    await notifyAuthorOfProjectization(post.authorId, postId);
  }
}
```

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が推奨

#### 🟡 優先度: 中（機能強化）

**A. ProjectizedHistory（プロジェクト化履歴）**
```prisma
model ProjectizedHistory {
  id                String    @id @default(cuid())
  postId            String    @map("post_id")
  projectizedAt     DateTime  @default(now()) @map("projectized_at")
  projectizedScore  Int       @map("projectized_score")
  projectLevel      String    @map("project_level")
  previousScore     Int?      @map("previous_score")
  scoreIncrement    Int?      @map("score_increment")
  triggerVoteId     String?   @map("trigger_vote_id")
  notifiedAt        DateTime? @map("notified_at")
  isNotified        Boolean   @default(false) @map("is_notified")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  post              Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([projectizedAt])
  @@index([projectLevel])
  @@map("projectized_history")
}
```

**理由**:
- プロジェクト化達成の正確な記録
- 達成日時の追跡
- ユーザーへの通知管理
- データ分析の基礎データ

**影響範囲**:
- IdeaVoiceTrackingPage: 249-257行目（プロジェクト化済みボタン）
- 通知システム
- 分析ダッシュボード

---

**B. ProjectLevelTransitionHistory（レベル遷移履歴）**
```prisma
model ProjectLevelTransitionHistory {
  id            String    @id @default(cuid())
  postId        String    @map("post_id")

  // レベル遷移情報
  fromLevel     String    @map("from_level")
  // PENDING, TEAM, DEPARTMENT, FACILITY, ORGANIZATION, STRATEGIC
  toLevel       String    @map("to_level")
  transitionAt  DateTime  @default(now()) @map("transition_at")

  // スコア情報
  scoreAtTransition Int   @map("score_at_transition")
  scoreDelta        Int   @map("score_delta")
  // 前回のレベル遷移からのスコア増分

  // 達成期間
  daysToAchieve Int?      @map("days_to_achieve")
  // 前レベルから次レベル到達までの日数

  // メタデータ
  createdAt     DateTime  @default(now()) @map("created_at")

  // Relations
  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([transitionAt])
  @@index([toLevel])
  @@map("project_level_transition_history")
}

// Postモデルに追加
model Post {
  // ... 既存フィールド
  levelTransitions  ProjectLevelTransitionHistory[]  // 🆕 追加
}
```

**理由**:
- レベル遷移の詳細追跡
- 成長速度の分析
- ボトルネック特定
- 進捗バーの正確な表示

**利用シーン**:
1. 各レベル到達までの期間表示
2. スコア成長速度の可視化
3. プロジェクトの勢い分析
4. ベンチマーク比較

**実装例**:
```typescript
// src/services/ProjectLevelTransitionService.ts
export async function trackLevelTransition(postId: string, newScore: number) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { levelTransitions: { orderBy: { transitionAt: 'desc' }, take: 1 } }
  });

  const currentLevel = getProjectLevel(newScore);
  const previousTransition = post.levelTransitions[0];
  const previousLevel = previousTransition?.toLevel || 'PENDING';

  // レベルが変わった場合のみ記録
  if (currentLevel !== previousLevel) {
    const daysToAchieve = previousTransition
      ? Math.floor((Date.now() - previousTransition.transitionAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    await prisma.projectLevelTransitionHistory.create({
      data: {
        postId,
        fromLevel: previousLevel,
        toLevel: currentLevel,
        scoreAtTransition: newScore,
        scoreDelta: previousTransition ? newScore - previousTransition.scoreAtTransition : newScore,
        daysToAchieve
      }
    });

    // レベルアップ通知
    await notifyLevelUp(post.authorId, postId, currentLevel);
  }
}
```

---

**C. VoteHistory（投票履歴）** - PersonalStation分析で既に提案

```prisma
model VoteHistory {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  postId        String    @map("post_id")
  voteOption    String    @map("vote_option")
  voteWeight    Float     @default(1.0) @map("vote_weight")
  votedAt       DateTime  @default(now()) @map("voted_at")
  postCategory  String?   @map("post_category")
  postType      String?   @map("post_type")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@index([votedAt])
  @@map("vote_history")
}
```

**理由**:
- 正確な投票数カウント
- 支持率の精密計算
- 投票タイミングの追跡

---

### 2. 医療システム側で必要な追加

**なし** - IdeaVoiceTrackingPageは100% VoiceDrive内部データで動作

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（即時）

**目標**: IdeaVoiceTrackingPageが基本的に動作する

✅ **既に動作可能**:
- 投稿リスト表示（`Post`テーブル）
- スコア計算（`Post.votes`から）
- プロジェクトレベル判定（ローカル計算）
- 統計サマリー（リアルタイム集計）

**現在のschema.prismaで動作する機能**:
- ✅ 総アイデア数表示
- ✅ 検討中/プロジェクト化済み数表示
- ✅ 平均スコア表示
- ✅ アイデア一覧表示
- ✅ 進捗バー表示
- ✅ プロジェクト化判定

---

### Phase 2: 履歴追跡の実装（1-2日）

**目標**: プロジェクト化達成の正確な記録

1. 🟡 **ProjectizedHistoryテーブル追加**
   ```prisma
   model ProjectizedHistory { /* 前述の定義 */ }
   ```

2. 🟡 **プロジェクト化検知処理実装**
   ```typescript
   // src/services/ProjectizationService.ts
   export async function checkAndRecordProjectization(postId: string) { /* 前述 */ }
   ```

3. 🟡 **通知システム統合**
   ```typescript
   // プロジェクト化達成時に著者に通知
   await notifyAuthorOfProjectization(authorId, postId);
   ```

**このPhaseで追加される機能**:
- ✅ プロジェクト化達成日時の記録
- ✅ 著者への自動通知
- ✅ プロジェクト化履歴の表示

---

### Phase 3: レベル遷移追跡（2-3日）

**目標**: プロジェクトレベルの成長追跡

1. 🟡 **ProjectLevelTransitionHistoryテーブル追加**
   ```prisma
   model ProjectLevelTransitionHistory { /* 前述の定義 */ }
   ```

2. 🟡 **レベル遷移検知処理実装**
   ```typescript
   // src/services/ProjectLevelTransitionService.ts
   export async function trackLevelTransition(postId: string, newScore: number) { /* 前述 */ }
   ```

3. 🟡 **IdeaVoiceTrackingPageの拡張**
   - レベル遷移履歴タイムライン表示
   - 各レベル到達日の表示
   - 成長速度の可視化

**このPhaseで追加される機能**:
- ✅ レベル遷移履歴の記録
- ✅ 各レベル到達日時の表示
- ✅ 成長速度の分析
- ✅ レベルアップ通知

---

### Phase 4: 投票履歴統合（2-3日）

**目標**: PersonalStationと共通の投票履歴活用

1. 🟡 **VoteHistoryテーブル活用**（PersonalStation Phase 2で実装）
   - 既に実装済みの`VoteHistory`を活用

2. 🟡 **スコア計算の精密化**
   ```typescript
   // VoteHistoryから正確なスコアを計算
   export async function calculateAccurateProjectScore(postId: string) { /* 前述 */ }
   ```

3. 🟡 **IdeaVoiceTrackingPageの最適化**
   - `Post.votes`（JSON）から`VoteHistory`テーブルへ移行
   - より正確な支持率計算

**このPhaseで追加される機能**:
- ✅ 正確な投票数カウント
- ✅ 精密な支持率計算
- ✅ 投票タイミングの追跡

---

## 📊 データフロー図

### 現在の状態（Phase 1）- 動作可能
```
IdeaVoiceTrackingPage
  ↓ 表示
自分のアイデア投稿 ← Post（type: 'improvement', authorId: userId）
  ↓
投票データ ← Post.votes (JSON)
  ↓
スコア計算 ← useProjectScoring (ローカル計算)
  ↓
プロジェクトレベル判定 ← getProjectLevel (ローカル計算)
  ↓
統計サマリー ← リアルタイム集計
```

### Phase 2完了後
```
IdeaVoiceTrackingPage
  ↓ 表示
自分のアイデア投稿 ← Post + ProjectizedHistory
  ↓
プロジェクト化状態 ← ProjectizedHistory.projectizedAt
  ↓
達成日時表示 ← ProjectizedHistory.projectizedAt
  ↓
通知状態 ← ProjectizedHistory.isNotified
```

### Phase 3完了後
```
IdeaVoiceTrackingPage
  ↓ 表示
自分のアイデア投稿 ← Post + ProjectLevelTransitionHistory
  ↓
レベル遷移履歴 ← ProjectLevelTransitionHistory
  ↓
成長タイムライン表示 ← ProjectLevelTransitionHistory.transitionAt
  ↓
レベル到達期間 ← ProjectLevelTransitionHistory.daysToAchieve
```

### Phase 4完了後
```
IdeaVoiceTrackingPage
  ↓ 表示
自分のアイデア投稿 ← Post + VoteHistory（正確）
  ↓
投票データ ← VoteHistory（テーブル）
  ↓
スコア計算 ← calculateAccurateProjectScore (DB集計)
  ↓
支持率計算 ← VoteHistory.voteOption集計（正確）
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1（即時対応可能）
- [x] Postテーブル確認（既存）
- [x] useProjectScoring実装確認（既存）
- [x] プロジェクトレベル定義確認（既存）
- [x] IdeaVoiceTrackingPage実装確認（既存）
- [x] 基本機能動作確認

#### Phase 2（推奨実装）
- [ ] ProjectizedHistoryテーブル追加
- [ ] マイグレーション実行
- [ ] ProjectizationService実装
- [ ] 投票時のプロジェクト化チェック処理追加
- [ ] 通知システム統合
- [ ] IdeaVoiceTrackingPageに履歴表示追加

#### Phase 3（推奨実装）
- [ ] ProjectLevelTransitionHistoryテーブル追加
- [ ] マイグレーション実行
- [ ] ProjectLevelTransitionService実装
- [ ] レベル遷移検知処理追加
- [ ] IdeaVoiceTrackingPageにタイムライン追加
- [ ] レベルアップ通知実装

#### Phase 4（推奨実装）
- [ ] VoteHistory活用（PersonalStation Phase 2と統合）
- [ ] スコア計算ロジック切り替え
- [ ] IdeaVoiceTrackingPage最適化
- [ ] パフォーマンステスト

### テスト
- [ ] 基本機能テスト（Phase 1）
- [ ] プロジェクト化検知テスト（Phase 2）
- [ ] レベル遷移追跡テスト（Phase 3）
- [ ] 投票履歴統合テスト（Phase 4）
- [ ] E2Eテスト（IdeaVoiceTrackingPage全機能）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [idea-tracking_DB要件分析](./idea-tracking_DB要件分析_20251018.md)
- [projects_DB要件分析](./projects_DB要件分析_20251019.md)

---

## 📝 既存テーブルとの整合性確認

### Post テーブル（既存）

**現在のschema.prisma**:
```prisma
model Post {
  id                String      @id @default(cuid())
  type              String      // 'improvement' がアイデアボイス投稿
  content           String
  authorId          String
  anonymityLevel    String
  status            String      @default("active")
  proposalType      String?     // operational, communication, innovation等
  priority          String?
  // ... 他フィールド
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  votes             Vote[]
  comments          Comment[]
  // ... 他リレーション
}
```

**IdeaVoiceTrackingPageでの使用方法**:
```typescript
// 自分のアイデアボイス投稿を取得
const myIdeas = await prisma.post.findMany({
  where: {
    authorId: userId,
    type: 'improvement',  // アイデアボイス投稿
    // proposalType: 'operational', 'communication', 'innovation', 'strategy'
  },
  include: {
    votes: true
  }
});
```

**状態**: ✅ 既存テーブルで完全対応可能

---

### Vote テーブル（既存）

**現在のschema.prisma**:
```prisma
model Vote {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  option    String   // strongly-support, support, neutral, oppose, strongly-oppose
  timestamp DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}
```

**IdeaVoiceTrackingPageでの使用方法**:
```typescript
// 投票数集計（現在は post.votes JSONを使用）
const votes = await prisma.vote.groupBy({
  by: ['option'],
  where: { postId },
  _count: { id: true }
});

const totalVotes = votes.reduce((sum, v) => sum + v._count.id, 0);
const supportVotes = votes
  .filter(v => ['strongly-support', 'support'].includes(v.option))
  .reduce((sum, v) => sum + v._count.id, 0);
const supportRate = (supportVotes / totalVotes) * 100;
```

**状態**: ✅ 既存テーブルで対応可能（JSON依存からテーブル移行推奨）

---

### VoteHistory テーブル（既存）

**現在のschema.prisma**:
```prisma
model VoteHistory {
  id           String   @id @default(cuid())
  userId       String
  postId       String
  voteOption   String
  voteWeight   Float    @default(1.0)
  votedAt      DateTime @default(now())
  postCategory String?
  postType     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id])

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@index([votedAt])
}
```

**IdeaVoiceTrackingPageでの活用方法**:
```typescript
// より正確な投票集計
export async function getAccurateVoteStats(postId: string) {
  const votes = await prisma.voteHistory.findMany({
    where: { postId },
    include: { user: { select: { permissionLevel: true } } }
  });

  const totalVotes = votes.length;
  const supportVotes = votes.filter(v =>
    ['strongly-support', 'support'].includes(v.voteOption)
  ).length;

  const weightedScore = votes.reduce((sum, vote) => {
    const baseWeight = getVoteWeight(vote.voteOption);
    const permissionWeight = Number(vote.user.permissionLevel);
    return sum + (baseWeight * permissionWeight * vote.voteWeight);
  }, 0);

  return {
    totalVotes,
    supportVotes,
    supportRate: (supportVotes / totalVotes) * 100,
    weightedScore
  };
}
```

**状態**: ✅ PersonalStation Phase 2で実装済み、活用推奨

---

## 📈 推奨UI拡張（参考）

### タイムライン表示（Phase 3実装時）

```typescript
// IdeaVoiceTrackingPage拡張イメージ
<div className="timeline">
  <div className="timeline-item">
    <div className="timeline-badge">💡</div>
    <div className="timeline-content">
      <p>アイデア投稿</p>
      <small>{idea.createdAt.toLocaleDateString()}</small>
    </div>
  </div>

  {levelTransitions.map(transition => (
    <div key={transition.id} className="timeline-item">
      <div className="timeline-badge">{levelConfig[transition.toLevel].icon}</div>
      <div className="timeline-content">
        <p>{levelConfig[transition.toLevel].label}に到達</p>
        <small>{transition.transitionAt.toLocaleDateString()}</small>
        <small>スコア: {transition.scoreAtTransition}</small>
        {transition.daysToAchieve && (
          <small>{transition.daysToAchieve}日で達成</small>
        )}
      </div>
    </div>
  ))}

  {projectizedHistory && (
    <div className="timeline-item highlight">
      <div className="timeline-badge">✅</div>
      <div className="timeline-content">
        <p>プロジェクト化達成！</p>
        <small>{projectizedHistory.projectizedAt.toLocaleDateString()}</small>
        <small>達成スコア: {projectizedHistory.projectizedScore}</small>
      </div>
    </div>
  )}
</div>
```

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: Phase 2実装後
