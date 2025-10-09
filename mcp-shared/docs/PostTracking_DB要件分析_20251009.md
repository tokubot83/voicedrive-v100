# 投稿追跡（Post Tracking）DB要件分析

**文書番号**: PT-DB-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**対象機能**: 投稿追跡（個人・部署・施設・法人）
**重要度**: 🔴 超重要
**ステータス**: 詳細分析完了

---

## 📋 エグゼクティブサマリー

### 機能概要

投稿追跡機能は、職員が自身の投稿・投票・コメント活動を**6段階議題化レベルごとに追跡**できる最重要機能です。

**主要機能**:
1. **個人追跡** - 投稿・投票・コメントした議題の進捗を個別追跡
2. **部署追跡** - チームごとの投稿品質・採用率・エンゲージメント分析
3. **施設追跡** - 部署間比較・ROI分析・リスク検出・戦略整合性
4. **法人追跡** - 施設間ベンチマーク・財務インパクト・競争力分析

**6段階議題化レベル**:
- **PENDING** (0-29点): 検討中（部署内）
- **DEPT_REVIEW** (30-49点): 部署検討
- **DEPT_AGENDA** (50-99点): 部署議題
- **FACILITY_AGENDA** (100-299点): 施設議題（委員会提出可能）
- **CORP_REVIEW** (300-599点): 法人検討
- **CORP_AGENDA** (600点以上): 法人議題（理事会提出レベル）

### データ管理責任の原則

データ管理責任分界点定義書（DM-DEF-2025-1008-001）に基づき：

| データ項目 | VoiceDrive | 医療システム | 提供方法 |
|-----------|-----------|-------------|---------|
| **投稿データ** | ✅ マスタ | ❌ | - |
| **投票履歴** | ✅ マスタ | ❌ | - |
| **コメント履歴** | ✅ マスタ | ❌ | - |
| **議題レベル履歴** | ✅ マスタ | ❌ | - |
| **活動イベント** | ✅ マスタ | ❌ | - |
| **職員情報** | キャッシュ | ✅ マスタ | API |
| **部署・施設マスタ** | キャッシュ | ✅ マスタ | API |

**原則**: 投稿追跡データはVoiceDrive 100%管轄、職員・組織マスタのみ医療システムから取得

---

## 🎯 現状分析

### A. IdeaVoiceTracking.tsx 機能詳細（議題モード）

**コードサイズ**: 281行

#### 1. 画面構成

```
ヘッダー「投稿の追跡」
  ↓
統計サマリー（TrackingStats）
  - 投稿数
  - 投票数
  - コメント数
  - 昇格済み（議題レベル到達数）
  ↓
3タブ切替
  - 📝 投稿した議題
  - 🗳️ 投票した議題
  - 💬 参加した議題
  ↓
各タブコンテンツ
  ↓
TrackingPostCard（投稿カード）
```

#### 2. データ取得フロー (lines 26-38)

```typescript
useEffect(() => {
  if (activeUser) {
    loadTrackingData();
  }
}, [activeUser]);

const loadTrackingData = () => {
  // TODO: 実際のAPI実装
  // 仮データ（デモ用）
  setMyPosts(getDemoMyPosts());
  setVotedPosts(getDemoVotedPosts());
  setCommentedPosts(getDemoCommentedPosts());
};
```

**必要なAPI**:
1. `GET /api/my/posts` - 自分の投稿一覧
2. `GET /api/my/voted-posts` - 投票した投稿一覧
3. `GET /api/my/commented-posts` - コメントした投稿一覧

#### 3. 議題レベル判定ロジック (lines 40-48)

```typescript
const getAgendaLevel = (score: number): AgendaLevel => {
  if (score >= 600) return 'CORP_AGENDA';      // 600点以上
  if (score >= 300) return 'CORP_REVIEW';      // 300-599点
  if (score >= 100) return 'FACILITY_AGENDA';  // 100-299点
  if (score >= 50) return 'DEPT_AGENDA';       // 50-99点
  if (score >= 30) return 'DEPT_REVIEW';       // 30-49点
  return 'PENDING';                             // 0-29点
};
```

#### 4. 投稿データ計算 (lines 50-79)

```typescript
const getPostData = (post: Post) => {
  // スコア計算
  const currentScore = calculateScore(
    convertVotesToEngagements(post.votes || {}),
    post.proposalType
  );

  // 議題レベル判定
  const agendaLevel = getAgendaLevel(currentScore);

  // 権限判定
  const permissions = agendaVisibilityEngine.getPermissions(
    post,
    activeUser!,
    currentScore
  );

  // 投票統計
  const totalVotes = Object.values(post.votes).reduce((sum, count) => sum + count, 0);
  const supportVotes = (post.votes['strongly-support'] || 0) + (post.votes['support'] || 0);
  const supportRate = totalVotes > 0 ? Math.round((supportVotes / totalVotes) * 100) : 0;

  return {
    currentScore,
    agendaLevel,
    permissions,
    totalVotes,
    supportRate
  };
};
```

### B. TrackingPostCard.tsx 機能詳細

**コードサイズ**: 148行

#### 1. 表示内容 (lines 54-116)

```
投稿タイトル（60文字まで）
  ↓
現在地バッジ（大きく目立つ）
  - 議題レベルアイコン + 名称
  - 現在スコア
  ↓
進捗バー（TrackingProgressBar）
  - 次のレベルまでの進捗
  - 残り必要点数
  ↓
活動サマリー
  - 👍 投票数
  - 📊 支持率
  - 💬 コメント数
  ↓
最新の動き（3件）
  - 💬 コメント追加
  - 👍 新規投票
  - 📊 レベル昇格
  ↓
「全ての動きを見る」ボタン
  ↓ 展開
タイムライン表示（TrackingTimeline）
```

#### 2. 議題レベル設定 (lines 30-38)

```typescript
const levelConfig = {
  'PENDING': {
    label: '検討中',
    icon: '💭',
    color: 'gray',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30'
  },
  'DEPT_REVIEW': {
    label: '部署検討',
    icon: '📋',
    color: 'blue',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  'DEPT_AGENDA': {
    label: '部署議題',
    icon: '👥',
    color: 'green',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  'FACILITY_AGENDA': {
    label: '施設議題',
    icon: '🏥',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  'CORP_REVIEW': {
    label: '法人検討',
    icon: '🏢',
    color: 'orange',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  'CORP_AGENDA': {
    label: '法人議題',
    icon: '🏛️',
    color: 'pink',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30'
  }
}[postData.agendaLevel];
```

### C. TrackingTimeline.tsx 機能詳細

**コードサイズ**: 206行

#### 1. イベントタイプ (lines 10-21)

```typescript
interface TimelineEvent {
  id: string;
  type: 'post_created' | 'comment_added' | 'vote_received' | 'level_upgraded';
  timestamp: string;
  description: string;
  details?: string;
  userName?: string;
  voteType?: string;
  points?: number;
  fromLevel?: string;
  toLevel?: string;
}
```

#### 2. イベントスタイル定義 (lines 58-90)

```typescript
const getEventStyle = (type: TimelineEvent['type']) => {
  const styles = {
    post_created: {
      icon: <FileText className="w-4 h-4" />,
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-400',
      label: '投稿'
    },
    comment_added: {
      icon: <MessageSquare className="w-4 h-4" />,
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
      label: 'コメント'
    },
    vote_received: {
      icon: <ThumbsUp className="w-4 h-4" />,
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-400',
      label: '投票'
    },
    level_upgraded: {
      icon: <ArrowUp className="w-4 h-4" />,
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
      label: 'レベル昇格'
    }
  };
  return styles[type];
};
```

#### 3. タイムスタンプ表示 (lines 92-112)

```typescript
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

### D. UserActivityService.ts 機能詳細

**コードサイズ**: 260行

#### 1. 投票統計取得 (lines 26-57)

```typescript
export async function getUserVoteStats(userId: string): Promise<VoteStats> {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);

  // 総投票数
  const totalVotes = await prisma.voteHistory.count({
    where: { userId }
  });

  // 今月の投票数
  const thisMonthVotes = await prisma.voteHistory.count({
    where: {
      userId,
      votedAt: { gte: thisMonthStart }
    }
  });

  // 影響力スコア計算（投票重みの合計 × 2、最大100）
  const votes = await prisma.voteHistory.findMany({
    where: { userId },
    select: { voteWeight: true }
  });

  const totalWeight = votes.reduce((sum, v) => sum + v.voteWeight, 0);
  const impactScore = Math.min(100, Math.round(totalWeight * 2));

  return {
    total: totalVotes,
    thisMonth: thisMonthVotes,
    impactScore
  };
}
```

#### 2. カテゴリ別投票統計 (lines 63-79)

```typescript
export async function getVoteStatsByCategory(userId: string): Promise<CategoryStats> {
  const votes = await prisma.voteHistory.groupBy({
    by: ['postCategory'],
    where: {
      userId,
      postCategory: { not: null }
    },
    _count: { id: true }
  });

  return {
    improvement: votes.find(v => v.postCategory === 'improvement')?._count.id || 0,
    communication: votes.find(v => v.postCategory === 'communication')?._count.id || 0,
    innovation: votes.find(v => v.postCategory === 'innovation')?._count.id || 0,
    strategy: votes.find(v => v.postCategory === 'strategy')?._count.id || 0,
  };
}
```

#### 3. 投票済み投稿一覧取得 (lines 86-112)

```typescript
export async function getUserVotedPosts(userId: string, limit: number = 50) {
  const votedPosts = await prisma.voteHistory.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
              avatar: true
            }
          }
        }
      }
    },
    orderBy: { votedAt: 'desc' },
    take: limit
  });

  return votedPosts.map(v => ({
    ...v.post,
    userVote: v.voteOption,
    votedAt: v.votedAt
  }));
}
```

### E. 部署・施設・法人追跡機能

#### 1. DepartmentPostingAnalytics.tsx（部署追跡）

**表示内容**:
- チームデータ（リーダー、メンバー数、投稿数、採用率、エンゲージメント）
- チームリーダーパフォーマンス（投稿文化、メンバー育成、革新スコア）
- 提案品質（カテゴリ別採用率、インパクトスコア、戦略整合性）
- エンゲージメント健全性（アクティブ投稿者数、非アクティブメンバー）
- クロスチーム課題（複数チーム共通課題、優先度、エスカレーション要否）

#### 2. FacilityPostingAnalytics.tsx（施設追跡）

**表示内容**:
- 施設KPI（投稿活性度、改善実現率、職員参加率、戦略整合性）
- 部署メトリクス（総投稿数、採用率、リスクスコア、革新度）
- ROIプロジェクト（投資額、期待ROI、実績ROI、回収期間）
- クリティカル課題（リスクレベル、患者安全、コンプライアンス、財務）
- リーダーシップメトリクス（チーム育成、革新促進、文化推進、戦略整合性）

#### 3. CorporatePostingAnalytics.tsx（法人追跡）

**表示内容**:
- 施設ベンチマーク（改善ランク、収益貢献、収益性インパクト、ブランド貢献、競争優位性）
- 財務インパクト（投資額、実現削減、ROI、回収期間、NPV、リスク調整リターン）
- 競争分析（業界平均比較、トップパフォーマー比較、競争ギャップ、戦略重要度）
- M&A統合（文化同化、改善採用率、シナジー実現、統合課題）

---

## 📊 データ管理責任分界点（投稿追跡専用）

### カテゴリA: 投稿データ

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 投稿ID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | cuid() |
| 投稿内容 (content) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 投稿タイプ (type) | ✅ 保持 | ❌ | VoiceDrive管轄 | improvement/community/report |
| 提案タイプ (proposalType) | ✅ 保持 | ❌ | VoiceDrive管轄 | operational/communication/innovation/strategic |
| 議題スコア (agendaScore) | ✅ 計算 | ❌ | VoiceDrive管轄 | 投票から自動計算 |
| 議題レベル (agendaLevel) | ✅ 判定 | ❌ | VoiceDrive管轄 | スコアから自動判定 |
| 投稿者ID (authorId) | ✅ 保持 | ✅ マスタ | 双方向 | 職員ID |
| 作成日時 (createdAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: 投稿データはVoiceDrive 100%管轄

### カテゴリB: 投票履歴

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 投票ID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | cuid() |
| ユーザーID (userId) | ✅ 保持 | ✅ マスタ | 双方向 | 職員ID |
| 投稿ID (postId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 投票オプション (voteOption) | ✅ 保持 | ❌ | VoiceDrive管轄 | strongly-support/support/neutral/oppose/strongly-oppose |
| 投票重み (voteWeight) | ✅ 計算 | ❌ | VoiceDrive管轄 | 権限レベルから計算 |
| 投票日時 (votedAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: 投票履歴はVoiceDrive 100%管轄

### カテゴリC: コメント履歴

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| コメントID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | cuid() |
| 投稿ID (postId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 作成者ID (authorId) | ✅ 保持 | ✅ マスタ | 双方向 | 職員ID |
| コメント内容 (content) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| コメントタイプ (commentType) | ✅ 保持 | ❌ | VoiceDrive管轄 | proposal/question/support/concern |
| 作成日時 (createdAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: コメント履歴はVoiceDrive 100%管轄

### カテゴリD: 議題レベル履歴

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 履歴ID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | 新規テーブル |
| 投稿ID (postId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 旧レベル (fromLevel) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 新レベル (toLevel) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 旧スコア (fromScore) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 新スコア (toScore) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 昇格日時 (upgradedAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: 議題レベル履歴はVoiceDrive 100%管轄（新規テーブル必要）

### カテゴリE: 活動イベント

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| イベントID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | 新規テーブル |
| 投稿ID (postId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| イベントタイプ (eventType) | ✅ 保持 | ❌ | VoiceDrive管轄 | post_created/comment_added/vote_received/level_upgraded |
| イベント詳細 (eventData) | ✅ 保持 | ❌ | VoiceDrive管轄 | JSON |
| 発生日時 (occurredAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: 活動イベントはVoiceDrive 100%管轄（新規テーブル必要）

### カテゴリF: 職員・組織マスタ（参照のみ）

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 職員ID (employeeId) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 職員名 (name) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 部署 (department) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 施設 (facilityId) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 権限レベル (permissionLevel) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |

**原則**: 職員・組織マスタは医療システムが管理、VoiceDriveはAPI経由で参照

---

## 🗄️ VoiceDrive側のDB要件

### 必要なテーブル（Prisma Schema）

#### 1. Post（投稿）- **既存テーブル（拡張必要）**

**現状** (schema.prisma lines 417-468):
```prisma
model Post {
  id                    String    @id @default(cuid())

  // 基本情報
  type                  String    // 'improvement' | 'community' | 'report'
  content               String
  authorId              String
  anonymityLevel        String
  status                String    @default("active")

  // improvement投稿専用
  proposalType          String?
  priority              String?

  // community投稿専用（フリースペース）
  freespaceCategory     String?
  freespaceScope        String?
  expirationDate        DateTime?
  isExpired             Boolean   @default(false)

  // メタデータ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // 議題モード用
  agendaScore           Int?      @default(0)
  agendaLevel           String?   // 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA'

  // モデレーション情報
  moderationStatus      String    @default("pending")
  moderationScore       Int?

  // リレーション
  author                User      @relation("PostAuthor", fields: [authorId], references: [id])
  votes                 Vote[]
  comments              Comment[]

  @@index([authorId])
  @@index([type])
  @@index([agendaLevel]) // 追加推奨
  @@index([agendaScore]) // 追加推奨
  @@index([createdAt])
}
```

**必要な拡張**:
```prisma
model Post {
  // ... 既存フィールド ...

  // 議題モード用（拡張）
  agendaScore           Int?      @default(0)
  agendaLevel           String?   // 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA'
  currentLevelStartedAt DateTime? // 追加: 現在のレベルになった日時
  lastLevelUpgrade      DateTime? // 追加: 最後にレベルアップした日時

  // 統計情報（キャッシュ）- パフォーマンス最適化
  totalVotes            Int       @default(0)        // 追加
  supportVotes          Int       @default(0)        // 追加
  supportRate           Int       @default(0)        // 追加: 0-100
  uniqueVoters          Int       @default(0)        // 追加
  commentCount          Int       @default(0)        // 追加
  viewCount             Int       @default(0)        // 追加

  // リレーション（追加）
  levelHistory          AgendaLevelHistory[]  // 追加
  activityEvents        PostActivityEvent[]   // 追加

  @@index([agendaLevel])  // 追加
  @@index([agendaScore])  // 追加
  @@index([currentLevelStartedAt]) // 追加
}
```

#### 2. VoteHistory（投票履歴）- **既存テーブル（OK）**

**現状** (schema.prisma lines 369-387):
```prisma
model VoteHistory {
  id            String    @id @default(cuid())
  userId        String
  postId        String
  voteOption    String    // "strongly-support" | "support" | "neutral" | "oppose" | "strongly-oppose"
  voteWeight    Float     @default(1.0)
  votedAt       DateTime  @default(now())
  postCategory  String?
  postType      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@index([votedAt])
}
```

**判定**: ✅ 既存スキーマで十分

#### 3. Comment（コメント）- **既存テーブル（OK）**

**現状** (schema.prisma lines 487-508):
```prisma
model Comment {
  id              String    @id @default(cuid())
  postId          String
  parentId        String?
  authorId        String
  content         String
  commentType     String
  anonymityLevel  String
  likes           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent          Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies         Comment[] @relation("CommentReplies")
  author          User      @relation("CommentAuthor", fields: [authorId], references: [id])

  @@index([postId])
  @@index([parentId])
  @@index([authorId])
}
```

**判定**: ✅ 既存スキーマで十分

#### 4. AgendaLevelHistory（議題レベル履歴）- **新規テーブル（必須）**

```prisma
model AgendaLevelHistory {
  id              String    @id @default(cuid())
  postId          String

  // レベル変更
  fromLevel       String?   // PENDING, DEPT_REVIEW, DEPT_AGENDA, FACILITY_AGENDA, CORP_REVIEW, CORP_AGENDA
  toLevel         String    // PENDING, DEPT_REVIEW, DEPT_AGENDA, FACILITY_AGENDA, CORP_REVIEW, CORP_AGENDA

  // スコア記録
  fromScore       Int?
  toScore         Int

  // トリガー情報
  triggeredBy     String?   // vote_received, committee_submission, manual_upgrade
  triggeringUserId String?  // 昇格のトリガーとなった投票者ID（vote_receivedの場合）

  // タイムスタンプ
  upgradedAt      DateTime  @default(now())

  // メタデータ
  notes           String?   // 備考（手動昇格時の理由など）

  // リレーション
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([toLevel])
  @@index([upgradedAt])
}
```

#### 5. PostActivityEvent（投稿活動イベント）- **新規テーブル（必須）**

```prisma
model PostActivityEvent {
  id              String    @id @default(cuid())
  postId          String

  // イベントタイプ
  eventType       String    // post_created, comment_added, vote_received, level_upgraded, committee_submitted

  // イベント詳細（JSON）
  eventData       Json?     // {
                            //   userName?: string,
                            //   voteType?: string,
                            //   points?: number,
                            //   fromLevel?: string,
                            //   toLevel?: string,
                            //   commentId?: string,
                            //   voteId?: string
                            // }

  // トリガーユーザー
  triggeredByUserId String? // イベントを起こしたユーザー

  // タイムスタンプ
  occurredAt      DateTime  @default(now())

  // リレーション
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([eventType])
  @@index([occurredAt])
  @@index([triggeredByUserId])
}
```

#### 6. UserActivitySummary（ユーザー活動サマリー）- **既存テーブル（OK）**

**現状** (schema.prisma lines 390-410):
```prisma
model UserActivitySummary {
  id                    String    @id @default(cuid())
  userId                String    @unique
  totalPosts            Int       @default(0)
  totalVotes            Int       @default(0)
  thisMonthVotes        Int       @default(0)
  impactScore           Float     @default(0)
  feedbackReceived      Int       @default(0)
  feedbackSent          Int       @default(0)
  projectsProposed      Int       @default(0)
  surveysCompleted      Int       @default(0)
  loginDays             Int       @default(0)
  lastCalculatedAt      DateTime  @default(now())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([lastCalculatedAt])
}
```

**追加推奨フィールド**:
```prisma
model UserActivitySummary {
  // ... 既存フィールド ...

  // 議題レベル到達数
  achievedPending       Int       @default(0) // 追加
  achievedDeptReview    Int       @default(0) // 追加
  achievedDeptAgenda    Int       @default(0) // 追加
  achievedFacilityAgenda Int      @default(0) // 追加
  achievedCorpReview    Int       @default(0) // 追加
  achievedCorpAgenda    Int       @default(0) // 追加

  // 最高到達レベル
  highestAgendaLevel    String?   // 追加: CORP_AGENDA, CORP_REVIEW, etc.
  highestLevelReachedAt DateTime? // 追加
}
```

---

## 🔌 必要なAPI要件（VoiceDrive側）

### API-PT-1: 自分の投稿一覧取得

**エンドポイント**: `GET /api/my/posts`

**Query Parameters**:
- `limit` (number, optional): 取得件数（デフォルト: 50）
- `offset` (number, optional): オフセット（デフォルト: 0）
- `orderBy` (string, optional): ソート順（デフォルト: `createdAt_desc`）

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "post-001",
      "content": "夜勤の引継ぎ時間を15分延長して、より詳細な患者情報の共有をしたい",
      "type": "improvement",
      "proposalType": "operational",
      "agendaScore": 78,
      "agendaLevel": "DEPT_AGENDA",
      "currentLevelStartedAt": "2025-10-01T10:00:00Z",
      "totalVotes": 23,
      "supportVotes": 20,
      "supportRate": 87,
      "commentCount": 5,
      "viewCount": 145,
      "createdAt": "2025-09-25T14:30:00Z",
      "updatedAt": "2025-10-08T09:15:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### API-PT-2: 投票した投稿一覧取得

**エンドポイント**: `GET /api/my/voted-posts`

**Query Parameters**:
- `limit` (number, optional): 取得件数（デフォルト: 50）
- `offset` (number, optional): オフセット（デフォルト: 0）

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "post-002",
      "content": "部署間の情報共有を円滑にするため、週1回の合同ミーティングを提案",
      "author": {
        "id": "user-123",
        "name": "田中太郎",
        "department": "看護部",
        "avatar": "https://example.com/avatar.jpg"
      },
      "agendaScore": 54,
      "agendaLevel": "DEPT_AGENDA",
      "userVote": "strongly-support",
      "votedAt": "2025-10-05T11:20:00Z",
      "totalVotes": 18,
      "supportRate": 83,
      "createdAt": "2025-09-28T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 342,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### API-PT-3: コメントした投稿一覧取得

**エンドポイント**: `GET /api/my/commented-posts`

**Query Parameters**:
- `limit` (number, optional): 取得件数（デフォルト: 50）
- `offset` (number, optional): オフセット（デフォルト: 0）

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "post-003",
      "content": "電子カルテの入力項目を見直し、重複入力を削減したい",
      "author": {
        "id": "user-456",
        "name": "佐藤花子",
        "department": "情報システム部"
      },
      "agendaScore": 112,
      "agendaLevel": "FACILITY_AGENDA",
      "myComments": [
        {
          "id": "comment-001",
          "content": "現場の看護師としても、この提案は非常に助かります",
          "commentType": "support",
          "createdAt": "2025-10-03T15:40:00Z"
        }
      ],
      "totalVotes": 45,
      "supportRate": 76,
      "commentCount": 12,
      "createdAt": "2025-09-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 89,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### API-PT-4: 投稿の活動イベント取得

**エンドポイント**: `GET /api/posts/:postId/activity-events`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "event-001",
      "eventType": "level_upgraded",
      "eventData": {
        "fromLevel": "DEPT_REVIEW",
        "toLevel": "DEPT_AGENDA",
        "fromScore": 48,
        "toScore": 52
      },
      "occurredAt": "2025-10-05T09:30:00Z"
    },
    {
      "id": "event-002",
      "eventType": "vote_received",
      "eventData": {
        "userName": "田中太郎",
        "voteType": "strongly-support",
        "points": 5
      },
      "occurredAt": "2025-10-05T09:29:00Z"
    },
    {
      "id": "event-003",
      "eventType": "comment_added",
      "eventData": {
        "userName": "山田花子",
        "commentId": "comment-123"
      },
      "occurredAt": "2025-10-04T14:15:00Z"
    },
    {
      "id": "event-004",
      "eventType": "post_created",
      "occurredAt": "2025-09-25T14:30:00Z"
    }
  ]
}
```

### API-PT-5: ユーザー活動サマリー取得

**エンドポイント**: `GET /api/my/activity-summary`

**Response**:
```json
{
  "success": true,
  "data": {
    "posts": {
      "total": 125,
      "agenda": 98,
      "project": 27
    },
    "votes": {
      "total": 342,
      "thisMonth": 45,
      "impactScore": 87
    },
    "categories": {
      "improvement": 156,
      "communication": 89,
      "innovation": 67,
      "strategy": 30
    },
    "achievements": {
      "achievedPending": 125,
      "achievedDeptReview": 89,
      "achievedDeptAgenda": 67,
      "achievedFacilityAgenda": 23,
      "achievedCorpReview": 8,
      "achievedCorpAgenda": 2,
      "highestAgendaLevel": "CORP_AGENDA",
      "highestLevelReachedAt": "2025-08-15T10:30:00Z"
    },
    "feedback": {
      "received": 56,
      "sent": 34
    },
    "lastCalculatedAt": "2025-10-09T08:00:00Z"
  }
}
```

### API-PT-6: 部署投稿分析取得

**エンドポイント**: `GET /api/department/:departmentId/posting-analytics`

**Query Parameters**:
- `period` (string): `month` | `quarter` | `year`

**Response**:
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "team-001",
        "name": "外来看護チーム",
        "leader": "山田太郎",
        "memberCount": 12,
        "totalPosts": 156,
        "adoptedPosts": 98,
        "adoptionRate": 62.8,
        "avgEngagement": 85,
        "lastActivityDays": 1
      }
    ],
    "proposalQuality": [
      {
        "category": "業務効率化",
        "count": 145,
        "adoptionRate": 72,
        "avgImpactScore": 85,
        "strategicAlignment": 90
      }
    ],
    "engagementHealth": {
      "totalActivePosters": 45,
      "newPostersThisMonth": 7,
      "inactiveMembers": 12,
      "postingDistribution": {
        "heavy": 8,
        "moderate": 15,
        "light": 22,
        "none": 12
      }
    }
  }
}
```

### API-PT-7: 施設投稿分析取得

**エンドポイント**: `GET /api/facility/:facilityId/posting-analytics`

**Query Parameters**:
- `period` (string): `month` | `quarter` | `year`

**Response**:
```json
{
  "success": true,
  "data": {
    "kpis": [
      {
        "label": "全体投稿活性度",
        "current": 89,
        "target": 85,
        "trend": "up",
        "change": "+5.2%",
        "status": "excellent"
      }
    ],
    "departmentMetrics": [
      {
        "id": "dept-001",
        "name": "看護部",
        "head": "山田太郎",
        "totalPosts": 456,
        "adoptionRate": 68,
        "engagement": 85,
        "strategicAlignment": 92,
        "riskScore": 15,
        "innovation": 78
      }
    ],
    "roiProjects": [
      {
        "id": "proj-001",
        "title": "電子カルテ入力項目最適化",
        "department": "情報システム部",
        "investment": 1200000,
        "expectedROI": 250,
        "actualROI": 280,
        "status": "completed",
        "timeline": "2025年4月-6月"
      }
    ]
  }
}
```

### API-PT-8: 法人投稿分析取得

**エンドポイント**: `GET /api/corporate/posting-analytics`

**Query Parameters**:
- `period` (string): `quarter` | `year` | `multi_year`

**Response**:
```json
{
  "success": true,
  "data": {
    "facilityBenchmarks": [
      {
        "facilityId": "fac-001",
        "facilityName": "小原病院",
        "region": "九州",
        "size": "large",
        "improvementRank": 1,
        "revenueContribution": 3200000000,
        "profitabilityImpact": 8.5,
        "brandContribution": 92,
        "riskLevel": "low",
        "competitiveAdvantage": 88
      }
    ],
    "financialImpacts": [
      {
        "category": "IT・デジタル化改善",
        "investmentAmount": 125500000,
        "realizedSavings": 289300000,
        "roi": 130.4,
        "paybackPeriod": 18,
        "npv": 156800000,
        "riskAdjustedReturn": 124.2
      }
    ]
  }
}
```

---

## ⚙️ 動的閾値設定システム（将来拡張）

### 背景

組織改編・部署統廃合・人数変動に対応するため、議題レベル昇格の閾値を**動的に調整可能**な設計が必要です。

### 設計方針

#### 1. 閾値設定テーブル（AgendaLevelThreshold）

```prisma
model AgendaLevelThreshold {
  id                    String    @id @default(cuid())

  // 適用範囲
  scopeType             String    // 'global' | 'facility' | 'department' | 'team'
  scopeId               String?   // facilityId or departmentId or teamId (globalの場合はnull)

  // レベル定義
  level                 String    // 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA'
  minScore              Int       // 最小スコア

  // 動的調整設定
  isDynamic             Boolean   @default(false) // 動的調整を有効にするか
  dynamicFormula        String?   // 'fixed' | 'member_count_ratio' | 'active_member_ratio' | 'custom'

  // 動的調整パラメータ（dynamicFormula='member_count_ratio'の場合）
  baseMemberCount       Int?      // 基準メンバー数（例: 30人）
  baseScore             Int?      // 基準スコア（例: 30点）
  scalingFactor         Float?    // スケーリング係数（例: 1.0）
  minThreshold          Int?      // 最小閾値（例: 10点）
  maxThreshold          Int?      // 最大閾値（例: 100点）

  // カスタム式（dynamicFormula='custom'の場合）
  customFormula         String?   // 例: "baseSc ore * (sqrt(memberCount) / sqrt(baseMemberCount))"

  // メタデータ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  createdBy             String?   // 設定者のuserId
  notes                 String?   // 設定理由のメモ

  @@unique([scopeType, scopeId, level]) // 同じスコープ・レベルには1つのみ
  @@index([scopeType, scopeId])
  @@index([level])
}
```

#### 2. 動的閾値計算ロジック

**計算式の例**:

##### ① 固定値（fixed）
```typescript
threshold = minScore  // 30点固定
```

##### ② メンバー数比率（member_count_ratio）
```typescript
// 少人数部署は低い閾値、大人数部署は高い閾値
threshold = Math.max(
  minThreshold,
  Math.min(
    maxThreshold,
    baseScore * (Math.sqrt(currentMemberCount) / Math.sqrt(baseMemberCount)) * scalingFactor
  )
);

// 例:
// - 10人部署: 30 * (√10 / √30) * 1.0 = 17点
// - 30人部署: 30 * (√30 / √30) * 1.0 = 30点
// - 100人部署: 30 * (√100 / √30) * 1.0 = 55点 → max(100)で100点
```

##### ③ アクティブメンバー比率（active_member_ratio）
```typescript
// 過去30日間の投稿・投票・コメント実績者を「アクティブメンバー」とカウント
activeMemberCount = getActiveMemberCount(departmentId, days=30);
threshold = baseScore * (activeMemberCount / baseMemberCount) * scalingFactor;

// 例:
// - 30人中10人がアクティブ: 30 * (10 / 30) * 1.0 = 10点
// - 30人中30人がアクティブ: 30 * (30 / 30) * 1.0 = 30点
```

##### ④ カスタム式（custom）
```typescript
// JavaScript式をevalで実行（セキュリティ注意）
// 使用可能変数: memberCount, baseMemberCount, baseScore, activeMemberCount
const formula = "baseScore * (Math.log(memberCount + 1) / Math.log(baseMemberCount + 1))";
threshold = eval(formula);
```

#### 3. 閾値取得API

**エンドポイント**: `GET /api/agenda/thresholds`

**Query Parameters**:
- `scopeType` (string): `global` | `facility` | `department` | `team`
- `scopeId` (string, optional): facilityId or departmentId or teamId

**Response**:
```json
{
  "success": true,
  "data": {
    "scopeType": "department",
    "scopeId": "dept-001",
    "departmentName": "看護部",
    "memberCount": 12,
    "activeMemberCount": 9,
    "thresholds": [
      {
        "level": "PENDING",
        "minScore": 0,
        "calculatedThreshold": 0,
        "isDynamic": false
      },
      {
        "level": "DEPT_REVIEW",
        "minScore": 30,
        "calculatedThreshold": 17,
        "isDynamic": true,
        "dynamicFormula": "member_count_ratio",
        "calculation": {
          "baseMemberCount": 30,
          "currentMemberCount": 12,
          "baseScore": 30,
          "scalingFactor": 1.0,
          "formula": "30 * (√12 / √30) * 1.0 = 17.32 → 17"
        }
      },
      {
        "level": "DEPT_AGENDA",
        "minScore": 50,
        "calculatedThreshold": 28,
        "isDynamic": true,
        "dynamicFormula": "member_count_ratio"
      },
      {
        "level": "FACILITY_AGENDA",
        "minScore": 100,
        "calculatedThreshold": 100,
        "isDynamic": false
      },
      {
        "level": "CORP_REVIEW",
        "minScore": 300,
        "calculatedThreshold": 300,
        "isDynamic": false
      },
      {
        "level": "CORP_AGENDA",
        "minScore": 600,
        "calculatedThreshold": 600,
        "isDynamic": false
      }
    ]
  }
}
```

#### 4. 閾値設定管理画面（管理者専用）

**機能**:
1. 全社デフォルト閾値設定
2. 施設別閾値オーバーライド
3. 部署別閾値オーバーライド
4. 動的調整式の選択・パラメータ設定
5. シミュレーション機能（メンバー数を変えた場合の閾値計算）
6. 変更履歴の記録

**権限**:
- Lv.10（役員）: 全社デフォルト変更可能
- Lv.9（施設長）: 自施設の閾値変更可能
- Lv.8（部署長）: 自部署の閾値変更可能（施設長承認必要）

#### 5. 組織改編対応フロー

```
組織改編（部署統合・分割・人数変動）
  ↓
医療システムから組織マスタ更新通知（Webhook）
  ↓
VoiceDrive: 部署メンバー数を再取得
  ↓
動的閾値再計算
  ↓
既存投稿の議題レベル再判定
  ↓ (レベル変動があった場合)
AgendaLevelHistory に記録
  ↓
投稿者に通知（「組織改編により議題レベルが変更されました」）
```

#### 6. 実装例（TypeScript）

```typescript
// AgendaLevelThresholdService.ts

import { prisma } from '../lib/prisma';

export class AgendaLevelThresholdService {

  /**
   * 議題レベルの閾値を取得（動的計算含む）
   */
  async getThresholds(
    scopeType: 'global' | 'facility' | 'department' | 'team',
    scopeId?: string,
    departmentId?: string
  ): Promise<AgendaLevelThreshold[]> {

    // 1. スコープに応じた閾値設定を取得（優先順位: team > department > facility > global）
    const thresholdConfigs = await this.getThresholdConfigs(scopeType, scopeId);

    // 2. メンバー数取得（動的調整が必要な場合）
    const memberCount = departmentId ? await this.getMemberCount(departmentId) : null;
    const activeMemberCount = departmentId ? await this.getActiveMemberCount(departmentId, 30) : null;

    // 3. 各レベルの閾値を計算
    const thresholds = await Promise.all(
      thresholdConfigs.map(async config => {
        const calculatedThreshold = this.calculateThreshold(
          config,
          memberCount,
          activeMemberCount
        );

        return {
          level: config.level,
          minScore: config.minScore,
          calculatedThreshold,
          isDynamic: config.isDynamic,
          dynamicFormula: config.dynamicFormula,
          calculation: config.isDynamic ? {
            baseMemberCount: config.baseMemberCount,
            currentMemberCount: memberCount,
            baseScore: config.baseScore,
            scalingFactor: config.scalingFactor,
            formula: this.getFormulaDescription(config, memberCount, calculatedThreshold)
          } : undefined
        };
      })
    );

    return thresholds;
  }

  /**
   * 閾値計算（動的調整ロジック）
   */
  private calculateThreshold(
    config: AgendaLevelThresholdConfig,
    memberCount: number | null,
    activeMemberCount: number | null
  ): number {

    // 動的調整なしの場合
    if (!config.isDynamic) {
      return config.minScore;
    }

    // メンバー数が取得できない場合は固定値
    if (!memberCount) {
      return config.minScore;
    }

    // 動的計算式に応じて計算
    switch (config.dynamicFormula) {
      case 'member_count_ratio':
        return this.calculateMemberCountRatio(config, memberCount);

      case 'active_member_ratio':
        return this.calculateActiveMemberRatio(config, memberCount, activeMemberCount || 0);

      case 'custom':
        return this.calculateCustomFormula(config, memberCount, activeMemberCount || 0);

      default:
        return config.minScore;
    }
  }

  /**
   * メンバー数比率による閾値計算
   */
  private calculateMemberCountRatio(
    config: AgendaLevelThresholdConfig,
    currentMemberCount: number
  ): number {
    const { baseScore, baseMemberCount, scalingFactor, minThreshold, maxThreshold } = config;

    const calculated = baseScore! *
      (Math.sqrt(currentMemberCount) / Math.sqrt(baseMemberCount!)) *
      (scalingFactor || 1.0);

    return Math.round(
      Math.max(
        minThreshold || 0,
        Math.min(
          maxThreshold || 1000,
          calculated
        )
      )
    );
  }

  /**
   * 部署のメンバー数を取得
   */
  private async getMemberCount(departmentId: string): Promise<number> {
    const count = await prisma.user.count({
      where: {
        department: departmentId,
        isRetired: false
      }
    });
    return count;
  }

  /**
   * アクティブメンバー数を取得（過去N日間に投稿・投票・コメントした人数）
   */
  private async getActiveMemberCount(departmentId: string, days: number): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const activeUserIds = new Set<string>();

    // 投稿者
    const posters = await prisma.post.findMany({
      where: {
        author: { department: departmentId },
        createdAt: { gte: since }
      },
      select: { authorId: true },
      distinct: ['authorId']
    });
    posters.forEach(p => activeUserIds.add(p.authorId));

    // 投票者
    const voters = await prisma.voteHistory.findMany({
      where: {
        user: { department: departmentId },
        votedAt: { gte: since }
      },
      select: { userId: true },
      distinct: ['userId']
    });
    voters.forEach(v => activeUserIds.add(v.userId));

    // コメント者
    const commenters = await prisma.comment.findMany({
      where: {
        author: { department: departmentId },
        createdAt: { gte: since }
      },
      select: { authorId: true },
      distinct: ['authorId']
    });
    commenters.forEach(c => activeUserIds.add(c.authorId));

    return activeUserIds.size;
  }
}
```

### デフォルト設定例

| レベル | グローバル閾値 | 少人数部署（10人） | 標準部署（30人） | 大人数部署（100人） |
|--------|--------------|-----------------|-----------------|------------------|
| PENDING | 0点 | 0点 | 0点 | 0点 |
| DEPT_REVIEW | 30点 | 17点 | 30点 | 55点 |
| DEPT_AGENDA | 50点 | 28点 | 50点 | 91点 |
| FACILITY_AGENDA | 100点 | 100点 | 100点 | 100点 |
| CORP_REVIEW | 300点 | 300点 | 300点 | 300点 |
| CORP_AGENDA | 600点 | 600点 | 600点 | 600点 |

**設計方針**:
- DEPT_REVIEW・DEPT_AGENDA: メンバー数に応じて動的調整
- FACILITY_AGENDA以上: 全社共通の固定値

---

## 📝 実装優先順位

### Phase 1: 個人追跡基本機能（最優先）

**スケジュール**: 11/11-11/18（8日間）

**実装内容**:
1. ✅ Post モデル拡張（agendaLevel, 統計フィールド追加）
2. ✅ AgendaLevelHistory テーブル作成
3. ✅ PostActivityEvent テーブル作成
4. ✅ API-PT-1: 自分の投稿一覧取得
5. ✅ API-PT-2: 投票した投稿一覧取得
6. ✅ API-PT-3: コメントした投稿一覧取得
7. ✅ API-PT-4: 投稿の活動イベント取得
8. ✅ API-PT-5: ユーザー活動サマリー取得

**成功基準**:
- IdeaVoiceTracking.tsx が実APIで動作
- TrackingTimeline に実イベントが表示
- 6段階議題レベルが正確に判定される

### Phase 2: 議題レベル自動昇格機能

**スケジュール**: 11/19-11/25（7日間）

**実装内容**:
1. ✅ 投票受付時の自動スコア再計算
2. ✅ 議題レベル自動昇格判定
3. ✅ AgendaLevelHistory 自動記録
4. ✅ PostActivityEvent 自動記録
5. ✅ リアルタイム通知（WebSocket）

**成功基準**:
- 投票が50点に到達したら自動的にDEPT_AGENDAに昇格
- 昇格イベントがタイムラインに即座に表示
- 投稿者にリアルタイム通知が届く

### Phase 3: 部署・施設・法人分析（共通DB構築後）

**スケジュール**: 共通DB構築後（2025年12月以降）

**実装内容**:
1. ✅ API-PT-6: 部署投稿分析取得
2. ✅ API-PT-7: 施設投稿分析取得
3. ✅ API-PT-8: 法人投稿分析取得
4. ✅ DepartmentPostingAnalytics.tsx 実装
5. ✅ FacilityPostingAnalytics.tsx 実装
6. ✅ CorporatePostingAnalytics.tsx 実装

**成功基準**:
- 部署長が自部署の投稿品質を確認できる
- 施設長が部署間比較とROI分析ができる
- 法人本部が施設間ベンチマークができる

---

**文書終了**
