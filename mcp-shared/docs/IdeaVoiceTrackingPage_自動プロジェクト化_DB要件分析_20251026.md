# IdeaVoiceTrackingPage（自動プロジェクト化）DB要件分析

**分析日**: 2025年10月26日
**対象ページ**: IdeaVoiceTrackingPage（URL: `/auto-projectization`）
**ページ種別**: **プロジェクトモードページ**（注意: 議題モード系ページとは別）
**実装状態**: ✅ Phase 1-3 完全実装済み

---

## 📋 ページ概要

### ページの目的
ユーザーが投稿した「アイデア声」の自動プロジェクト化進捗を追跡・可視化するページ。スコアが100点に達するとプロジェクト化され、さらにスコアが上がるとプロジェクトレベルが段階的に上昇する。

### 主要機能
1. **統計情報表示**
   - 総アイデア数
   - プロジェクト化待ち件数
   - プロジェクト化済み件数
   - 平均スコア

2. **アイデア一覧表示**
   - 投稿内容
   - 現在のスコア
   - プロジェクトレベルバッジ
   - 次レベルまでの進捗バー
   - プロジェクト化達成表示

3. **プロジェクトレベル管理**
   - PENDING（検討中）: スコア < 100
   - TEAM（チーム）: 100-199
   - DEPARTMENT（部署）: 200-399
   - FACILITY（施設）: 400-799
   - ORGANIZATION（法人）: 800+
   - STRATEGIC（戦略）: 特別指定

---

## 🎯 データ管理責任分界点

### 重要: プロジェクトモードの特性

**このページはプロジェクトモードページです。議題モード系ページとは完全に別のデータ管理体系を持ちます。**

### データ所有権: 100% VoiceDrive

参照: [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md) - **カテゴリー6: VoiceDrive活動データ**

| データ種別 | マスター所有 | 理由 |
|-----------|-------------|------|
| 投稿（Post） | VoiceDrive | プロジェクト提案・アイデア投稿はVoiceDrive固有機能 |
| プロジェクト化履歴（ProjectizedHistory） | VoiceDrive | 自動プロジェクト化はVoiceDrive独自ロジック |
| レベル遷移履歴（ProjectLevelHistory） | VoiceDrive | プロジェクトレベルはVoiceDrive独自概念 |
| 投票（Vote） | VoiceDrive | フィードバック活動はVoiceDrive機能 |
| ユーザー基本情報（User） | 医療システム | 職員マスターは医療システム管理 |
| 所属情報（UserDepartment） | 医療システム | 組織構造は医療システム管理 |

### 統合方針
- **医療システムからの取得**: ユーザー基本情報、所属情報のみ
- **VoiceDrive独自管理**: 投稿、プロジェクト化、レベル遷移、投票
- **データ連携**: 不要（VoiceDrive内で完結）

---

## 📊 現在の実装状態分析

### ✅ 実装済み機能（Phase 1-3完了）

#### Phase 1: 基本機能
- ✅ 投稿一覧取得API
- ✅ スコア計算ロジック
- ✅ プロジェクトレベル判定
- ✅ 統計情報表示

#### Phase 2: プロジェクト化管理
- ✅ ProjectizationService実装
- ✅ ProjectizedHistory記録
- ✅ プロジェクト化通知
- ✅ 閾値判定（スコア100）

#### Phase 3: レベル遷移管理
- ✅ ProjectLevelTransitionService実装
- ✅ ProjectLevelHistory記録
- ✅ レベルアップ通知
- ✅ 進捗バー表示

---

## 🗄️ データソース詳細分析

### 1. 統計情報表示

#### 1.1 総アイデア数
```typescript
// データソース
const ideas = await prisma.post.findMany({
  where: {
    authorId: userId,
    type: 'improvement', // アイデア声のみ
    deletedAt: null
  }
});
const totalIdeas = ideas.length;
```

**使用テーブル**: `Post`
**必要フィールド**:
- `id` (主キー)
- `authorId` (ユーザーID)
- `type` (投稿タイプ)
- `deletedAt` (削除日時)

**実装状態**: ✅ 完全実装済み

---

#### 1.2 プロジェクト化待ち件数
```typescript
// データソース
const pendingIdeas = ideas.filter(idea => {
  const score = calculateScore(idea.votes); // useProjectScoring
  return score < 100; // プロジェクト化閾値
});
const pendingCount = pendingIdeas.length;
```

**使用テーブル**: `Post`, `Vote`
**必要フィールド**:
- Post: `id`, `authorId`, `type`, `deletedAt`
- Vote: `postId`, `voteOption` (strongly-support, support, neutral, oppose, strongly-oppose)

**実装状態**: ✅ 完全実装済み

---

#### 1.3 プロジェクト化済み件数
```typescript
// データソース
const projectizedIdeas = ideas.filter(idea => {
  const score = calculateScore(idea.votes);
  return score >= 100;
});
const projectizedCount = projectizedIdeas.length;
```

**使用テーブル**: `Post`, `Vote`
**実装状態**: ✅ 完全実装済み

---

#### 1.4 平均スコア
```typescript
// データソース
const totalScore = ideas.reduce((sum, idea) => {
  const score = calculateScore(idea.votes);
  return sum + score;
}, 0);
const averageScore = totalScore / ideas.length;
```

**使用テーブル**: `Post`, `Vote`
**実装状態**: ✅ 完全実装済み

---

### 2. アイデア一覧表示

#### 2.1 投稿基本情報
```typescript
// データソース
const ideas = await prisma.post.findMany({
  where: {
    authorId: userId,
    type: 'improvement',
    deletedAt: null
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        avatarUrl: true
      }
    },
    votes: {
      select: {
        voteOption: true,
        userId: true,
        createdAt: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

**使用テーブル**: `Post`, `User`, `Vote`
**必要フィールド**:
- Post: `id`, `content`, `authorId`, `type`, `createdAt`, `deletedAt`
- User: `id`, `name`, `avatarUrl`
- Vote: `postId`, `voteOption`, `userId`, `createdAt`

**実装状態**: ✅ 完全実装済み

---

#### 2.2 現在のスコア計算
```typescript
// データソース: src/hooks/useProjectScoring.ts
const calculateScore = (votes: Vote[]): number => {
  const weights = {
    'strongly-support': 20,
    'support': 10,
    'neutral': 0,
    'oppose': -10,
    'strongly-oppose': -20
  };

  return votes.reduce((total, vote) => {
    return total + (weights[vote.voteOption] || 0);
  }, 0);
};
```

**使用テーブル**: `Vote`
**実装状態**: ✅ 完全実装済み

---

#### 2.3 プロジェクトレベル判定
```typescript
// データソース: src/services/ProjectPermissionService.ts
export function getProjectLevelFromScore(score: number): ProjectLevel {
  if (score >= 800) return 'ORGANIZATION';
  if (score >= 400) return 'FACILITY';
  if (score >= 200) return 'DEPARTMENT';
  if (score >= 100) return 'TEAM';
  return 'PENDING';
}
```

**ロジック**: VoiceDrive内部計算（テーブル不要）
**実装状態**: ✅ 完全実装済み

---

#### 2.4 プロジェクト化履歴
```typescript
// データソース: ProjectizedHistory
const projectizedHistory = await prisma.projectizedHistory.findFirst({
  where: { postId },
  orderBy: { projectizedAt: 'desc' }
});

const isProjectized = projectizedHistory !== null;
const projectizedAt = projectizedHistory?.projectizedAt;
const projectizedScore = projectizedHistory?.projectizedScore;
```

**使用テーブル**: `ProjectizedHistory`
**必要フィールド**:
- `id` (主キー)
- `postId` (投稿ID)
- `projectizedAt` (プロジェクト化日時)
- `projectizedScore` (プロジェクト化時スコア)
- `projectLevel` (プロジェクトレベル)
- `previousScore` (前回スコア)
- `scoreIncrement` (スコア増分)
- `isNotified` (通知済みフラグ)
- `notifiedAt` (通知日時)

**実装状態**: ✅ 完全実装済み

---

#### 2.5 レベル遷移履歴
```typescript
// データソース: ProjectLevelHistory
const levelHistory = await prisma.projectLevelHistory.findMany({
  where: { postId },
  orderBy: { upgradedAt: 'desc' }
});

const latestLevel = levelHistory[0]?.toLevel;
const levelTransitions = levelHistory.length;
```

**使用テーブル**: `ProjectLevelHistory`
**必要フィールド**:
- `id` (主キー)
- `postId` (投稿ID)
- `fromLevel` (変更前レベル)
- `toLevel` (変更後レベル)
- `fromScore` (変更前スコア)
- `toScore` (変更後スコア)
- `upgradedAt` (レベルアップ日時)

**実装状態**: ✅ 完全実装済み

---

#### 2.6 次レベルまでの進捗
```typescript
// データソース: ロジック計算（テーブル不要）
const thresholds = [
  { level: 'TEAM', score: 100 },
  { level: 'DEPARTMENT', score: 200 },
  { level: 'FACILITY', score: 400 },
  { level: 'ORGANIZATION', score: 800 }
];

const currentLevel = getProjectLevelFromScore(score);
const nextThreshold = thresholds.find(t => t.score > score);

if (nextThreshold) {
  const progress = ((score - currentThreshold) / (nextThreshold.score - currentThreshold)) * 100;
  const pointsNeeded = nextThreshold.score - score;
}
```

**ロジック**: VoiceDrive内部計算（テーブル不要）
**実装状態**: ✅ 完全実装済み

---

## 📁 使用中のDBテーブル

### 1. Post（投稿）
**所有**: VoiceDrive
**用途**: アイデア声の投稿データ

```prisma
model Post {
  id                String              @id @default(cuid())
  content           String
  authorId          String              @map("author_id")
  type              String              // 'improvement'
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @updatedAt @map("updated_at")
  deletedAt         DateTime?           @map("deleted_at")

  author            User                @relation("UserPosts", fields: [authorId], references: [id])
  votes             Vote[]              @relation("PostVotes")
  projectizedHistory ProjectizedHistory[] @relation("PostProjectizedHistory")
  levelHistory      ProjectLevelHistory[] @relation("PostLevelHistory")

  @@index([authorId])
  @@index([type])
  @@index([createdAt])
  @@map("posts")
}
```

**実装状態**: ✅ 完全実装済み

---

### 2. Vote（投票）
**所有**: VoiceDrive
**用途**: スコア計算のための投票データ

```prisma
model Vote {
  id           String   @id @default(cuid())
  postId       String   @map("post_id")
  userId       String   @map("user_id")
  voteOption   String   @map("vote_option") // strongly-support, support, neutral, oppose, strongly-oppose
  createdAt    DateTime @default(now()) @map("created_at")

  post         Post     @relation("PostVotes", fields: [postId], references: [id], onDelete: Cascade)
  user         User     @relation("UserVotes", fields: [userId], references: [id])

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
  @@map("votes")
}
```

**実装状態**: ✅ 完全実装済み

---

### 3. ProjectizedHistory（プロジェクト化履歴）
**所有**: VoiceDrive
**用途**: プロジェクト化達成の記録

```prisma
model ProjectizedHistory {
  id                String    @id @default(cuid())
  postId            String    @map("post_id")
  projectizedAt     DateTime  @default(now()) @map("projectized_at")
  projectizedScore  Int       @map("projectized_score")
  projectLevel      String    @map("project_level")
  previousScore     Int?      @map("previous_score")
  scoreIncrement    Int       @map("score_increment")
  isNotified        Boolean   @default(false) @map("is_notified")
  notifiedAt        DateTime? @map("notified_at")

  post              Post      @relation("PostProjectizedHistory", fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([projectizedAt])
  @@map("projectized_history")
}
```

**実装状態**: ✅ 完全実装済み

---

### 4. ProjectLevelHistory（レベル遷移履歴）
**所有**: VoiceDrive
**用途**: プロジェクトレベルの遷移記録

```prisma
model ProjectLevelHistory {
  id          String    @id @default(cuid())
  postId      String    @map("post_id")
  fromLevel   String?   @map("from_level")
  toLevel     String    @map("to_level")
  fromScore   Int       @map("from_score")
  toScore     Int       @map("to_score")
  upgradedAt  DateTime  @default(now()) @map("upgraded_at")

  post        Post      @relation("PostLevelHistory", fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([upgradedAt])
  @@map("project_level_history")
}
```

**実装状態**: ✅ 完全実装済み

---

### 5. User（ユーザー）
**所有**: 医療システム
**用途**: 投稿者情報表示

```prisma
model User {
  id          String   @id @default(cuid())
  name        String
  avatarUrl   String?  @map("avatar_url")

  posts       Post[]   @relation("UserPosts")
  votes       Vote[]   @relation("UserVotes")

  @@map("users")
}
```

**実装状態**: ✅ 完全実装済み（医療システム連携）

---

## 🔍 不足項目分析

### データベーステーブル
**結果**: ❌ 不足なし

すべての必要テーブルが存在:
- ✅ Post
- ✅ Vote
- ✅ ProjectizedHistory
- ✅ ProjectLevelHistory
- ✅ User

---

### テーブルフィールド
**結果**: ❌ 不足なし

すべての必要フィールドが存在:
- ✅ Post: id, content, authorId, type, createdAt, deletedAt
- ✅ Vote: id, postId, userId, voteOption, createdAt
- ✅ ProjectizedHistory: id, postId, projectizedAt, projectizedScore, projectLevel, previousScore, scoreIncrement, isNotified, notifiedAt
- ✅ ProjectLevelHistory: id, postId, fromLevel, toLevel, fromScore, toScore, upgradedAt
- ✅ User: id, name, avatarUrl

---

### API・サービス
**結果**: ❌ 不足なし

すべての必要API/サービスが存在:
- ✅ `ProjectizationService.ts` - プロジェクト化管理
- ✅ `ProjectLevelTransitionService.ts` - レベル遷移管理
- ✅ `ProjectPermissionService.ts` - レベル判定ロジック
- ✅ `useProjectScoring.ts` - スコア計算フック

---

### ビジネスロジック
**結果**: ❌ 不足なし

すべての必要ロジックが実装済み:
- ✅ スコア計算（投票オプション別の重み付け）
- ✅ プロジェクト化判定（閾値100）
- ✅ レベル判定（スコア区間別）
- ✅ 進捗計算（次レベルまでのパーセンテージ）
- ✅ プロジェクト化履歴記録
- ✅ レベル遷移履歴記録
- ✅ 通知生成

---

## 📝 サービス層実装状況

### ProjectizationService.ts
**ファイルパス**: [src/services/ProjectizationService.ts](../../src/services/ProjectizationService.ts)

#### 主要関数

**1. checkAndRecordProjectization**
```typescript
/**
 * プロジェクト化をチェックして記録
 * @param postId - 投稿ID
 * @param currentScore - 現在のスコア
 * @returns プロジェクト化結果
 */
export async function checkAndRecordProjectization(
  postId: string,
  currentScore: number
): Promise<ProjectizationResult>
```

**実装状態**: ✅ 完全実装済み

---

**2. getProjectizationStatus**
```typescript
/**
 * プロジェクト化状態を取得
 * @param postId - 投稿ID
 * @returns プロジェクト化状態
 */
export async function getProjectizationStatus(
  postId: string
): Promise<ProjectizationStatus>
```

**実装状態**: ✅ 完全実装済み

---

**3. createProjectizationNotification**
```typescript
/**
 * プロジェクト化通知を作成
 * @param userId - ユーザーID
 * @param postId - 投稿ID
 * @param projectLevel - プロジェクトレベル
 * @param score - スコア
 */
export async function createProjectizationNotification(
  userId: string,
  postId: string,
  projectLevel: string,
  score: number
): Promise<void>
```

**実装状態**: ✅ 完全実装済み

---

### ProjectLevelTransitionService.ts
**ファイルパス**: [src/services/ProjectLevelTransitionService.ts](../../src/services/ProjectLevelTransitionService.ts)

#### 主要関数

**1. trackLevelTransition**
```typescript
/**
 * レベル遷移を追跡
 * @param postId - 投稿ID
 * @param newScore - 新スコア
 * @returns レベル遷移結果
 */
export async function trackLevelTransition(
  postId: string,
  newScore: number
): Promise<LevelTransitionResult>
```

**実装状態**: ✅ 完全実装済み

---

**2. getLevelTransitionHistory**
```typescript
/**
 * レベル遷移履歴を取得
 * @param postId - 投稿ID
 * @returns レベル遷移履歴
 */
export async function getLevelTransitionHistory(
  postId: string
): Promise<ProjectLevelHistory[]>
```

**実装状態**: ✅ 完全実装済み

---

**3. createLevelUpNotification**
```typescript
/**
 * レベルアップ通知を作成
 * @param userId - ユーザーID
 * @param postId - 投稿ID
 * @param fromLevel - 変更前レベル
 * @param toLevel - 変更後レベル
 * @param score - スコア
 */
export async function createLevelUpNotification(
  userId: string,
  postId: string,
  fromLevel: string | null,
  toLevel: string,
  score: number
): Promise<void>
```

**実装状態**: ✅ 完全実装済み

---

## 🎨 フロントエンド実装状況

### IdeaVoiceTrackingPage.tsx
**ファイルパス**: [src/pages/IdeaVoiceTrackingPage.tsx](../../src/pages/IdeaVoiceTrackingPage.tsx)

#### 実装済み機能

**1. 統計情報カード**
```typescript
// 総アイデア数
<StatCard
  title="総アイデア数"
  value={ideas.length}
  icon="💡"
  color="blue"
/>

// プロジェクト化待ち
<StatCard
  title="プロジェクト化待ち"
  value={pendingCount}
  icon="⏳"
  color="yellow"
/>

// プロジェクト化済み
<StatCard
  title="プロジェクト化済み"
  value={projectizedCount}
  icon="✅"
  color="green"
/>

// 平均スコア
<StatCard
  title="平均スコア"
  value={averageScore.toFixed(1)}
  icon="📊"
  color="purple"
/>
```

**実装状態**: ✅ 完全実装済み

---

**2. プロジェクトレベルバッジ**
```typescript
const levelConfig = {
  'PENDING': { label: 'アイデア検討中', icon: '💡', color: 'text-gray-400' },
  'TEAM': { label: 'チームプロジェクト', icon: '👥', color: 'text-blue-400' },
  'DEPARTMENT': { label: '部署プロジェクト', icon: '🏢', color: 'text-green-400' },
  'FACILITY': { label: '施設プロジェクト', icon: '🏥', color: 'text-yellow-400' },
  'ORGANIZATION': { label: '法人プロジェクト', icon: '🏛️', color: 'text-purple-400' },
  'STRATEGIC': { label: '戦略プロジェクト', icon: '⭐', color: 'text-pink-400' }
};

<LevelBadge level={currentLevel} config={levelConfig[currentLevel]} />
```

**実装状態**: ✅ 完全実装済み

---

**3. 進捗バー**
```typescript
// 次レベルまでの進捗
const progress = calculateProgress(score, currentLevel, nextLevel);

<ProgressBar
  current={score}
  target={nextThreshold}
  percentage={progress}
  label={`次レベルまであと ${pointsNeeded}pt`}
/>
```

**実装状態**: ✅ 完全実装済み

---

**4. プロジェクト化達成表示**
```typescript
{isProjectized && (
  <ProjectizedBadge
    projectizedAt={projectizedAt}
    projectizedScore={projectizedScore}
  />
)}
```

**実装状態**: ✅ 完全実装済み

---

## 📊 データフロー図

```
[ユーザー] → [IdeaVoiceTrackingPage]
                ↓
         [useProjectScoring]
                ↓
    ┌──────────┴──────────┐
    ↓                     ↓
[Post + Vote]    [ProjectizationService]
    ↓                     ↓
[スコア計算]    [ProjectizedHistory登録]
    ↓                     ↓
[レベル判定]    [ProjectLevelTransitionService]
    ↓                     ↓
[進捗計算]      [ProjectLevelHistory登録]
    ↓                     ↓
[統計表示]            [通知生成]
```

---

## ✅ 結論

### 実装完了状態
**Phase 1-3: すべて完全実装済み ✅**

1. ✅ **データベーステーブル**: すべて存在
2. ✅ **テーブルフィールド**: すべて存在
3. ✅ **API・サービス**: すべて実装済み
4. ✅ **ビジネスロジック**: すべて実装済み
5. ✅ **フロントエンド**: すべて実装済み

### 不足項目
**なし ❌**

### データ管理責任
- **VoiceDrive所有**: Post, Vote, ProjectizedHistory, ProjectLevelHistory
- **医療システム所有**: User（基本情報のみ）
- **統合方針**: VoiceDrive内で完結（医療システム連携不要）

### 重要事項
**このページはプロジェクトモードページです。議題モード系ページとは別のデータ管理体系を持ちます。**

- プロジェクト化はVoiceDrive独自機能
- スコア計算はVoiceDrive独自ロジック
- レベル管理はVoiceDrive独自概念
- 医療システムとのデータ連携は不要

---

**分析完了日**: 2025年10月26日
**次のステップ**: 暫定マスターリスト作成

---

## 📎 参考資料

- [IdeaVoiceTrackingPage.tsx](../../src/pages/IdeaVoiceTrackingPage.tsx)
- [ProjectizationService.ts](../../src/services/ProjectizationService.ts)
- [ProjectLevelTransitionService.ts](../../src/services/ProjectLevelTransitionService.ts)
- [ProjectPermissionService.ts](../../src/services/ProjectPermissionService.ts)
- [useProjectScoring.ts](../../src/hooks/useProjectScoring.ts)
- [schema.prisma](../../prisma/schema.prisma)
- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
