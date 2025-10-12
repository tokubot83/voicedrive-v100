# TalentAnalyticsPage（議題モード用）実装メモ

**作成日**: 2025年10月12日
**対象ページ**: TalentAnalyticsPage (`src/pages/TalentAnalyticsPage.tsx`)
**現在の状態**: 開発中プレースホルダー（77行）

---

## 📋 現状

### 現在の実装

`TalentAnalyticsPage.tsx`は現在**プレースホルダーのみ**で、実際の機能は未実装：

```typescript
// 現在の内容（77行）
- ヘッダー: "タレント分析"
- 開発中メッセージ
- 予定機能プレビュー（3カード）:
  1. スキル分析
  2. パフォーマンス予測
  3. 適性マッチング
```

---

## 🎯 実装すべき内容（ProjectTalentAnalyticsPageと同等）

### 議題モード版の人材分析機能

**ProjectTalentAnalyticsPage**（プロジェクトモード用）と同様の機能を、議題モード（通常投稿）に実装：

#### 1. **概要タブ**
- 総参加者数（投稿者・投票者）
- 平均参加数（投稿数・投票数）
- 多様性スコア（職種・世代・階層の多様性）
- 成長率（前期比）
- 職種別参加状況
- 世代別参加状況

#### 2. **部門別分布タブ**
- 部門別投稿・投票参加率
- 部門総人数 vs 参加者数
- 平均投稿数・投票数

#### 3. **参加トレンドタブ**
- 時系列グラフ（月次・四半期・年次）

#### 4. **育成効果タブ**
- 投稿品質の向上
- 議論への積極的参加度

---

## 🔐 データ同意システム連携（最重要）

### 既存の実装を活用

VoiceDriveには**データ同意システム**が既に実装済み：

- **DataConsentモーダル**: 初回投稿時に表示
- **DataConsentテーブル**: 同意状況を管理
- **analyticsConsent = true**: 分析同意済み職員のみを対象

### 議題モード版の実装ポイント

```typescript
// 1. 同意済み職員のみフィルタリング
const consentedUsers = await prisma.dataConsent.findMany({
  where: { analyticsConsent: true },
  select: { userId: true }
});

// 2. 投稿データの集計（同意済みのみ）
const posts = await prisma.post.findMany({
  where: {
    authorId: { in: consentedUsers.map(c => c.userId) },
    createdAt: { gte: periodStart, lte: periodEnd }
  },
  include: {
    author: {
      select: {
        age: true,
        generation: true,
        professionCategory: true,
        hierarchyLevel: true,
      }
    }
  }
});

// 3. 投票データの集計（同意済みのみ）
const votes = await prisma.vote.findMany({
  where: {
    userId: { in: consentedUsers.map(c => c.userId) },
    createdAt: { gte: periodStart, lte: periodEnd }
  },
  include: {
    user: {
      select: {
        age: true,
        generation: true,
        professionCategory: true,
        hierarchyLevel: true,
      }
    }
  }
});
```

---

## 📊 必要なデータソース

### 既存テーブル（そのまま使用可能）

| テーブル | 用途 | 状態 |
|---------|------|------|
| `Post` | 投稿データ | ✅ OK |
| `Vote` | 投票データ | ✅ OK |
| `User` | 職員基本情報 | ✅ OK（age, generation追加済み） |
| `DataConsent` | 同意状況 | ✅ OK |

### 新規テーブル（ProjectTalentAnalyticsと共用）

| テーブル | 用途 | 状態 |
|---------|------|------|
| `ProjectParticipationStats` | プロジェクト参加統計 | ✅ 実装済み |
| `ProjectParticipationByProfession` | 職種別統計 | ✅ 実装済み |
| **🆕 `TopicParticipationStats`** | **議題参加統計** | ❌ **要追加** |
| **🆕 `TopicParticipationByProfession`** | **議題職種別統計** | ❌ **要追加** |

---

## 🛠️ 実装ステップ

### Phase 1: テーブル追加（優先度: 🟡 MEDIUM）

```prisma
// VoiceDrive: prisma/schema.prisma

// 議題参加統計 - 全体統計
model TopicParticipationStats {
  id                      String    @id @default(cuid())
  periodType              String                                // 'month' | 'quarter' | 'year'
  periodStart             DateTime  @map("period_start")
  periodEnd               DateTime  @map("period_end")

  // 投稿統計
  totalPosters            Int       @default(0) @map("total_posters")
  totalPosts              Int       @default(0) @map("total_posts")
  averagePostsPerPerson   Float     @default(0) @map("avg_posts_per_person")

  // 投票統計
  totalVoters             Int       @default(0) @map("total_voters")
  totalVotes              Int       @default(0) @map("total_votes")
  averageVotesPerPerson   Float     @default(0) @map("avg_votes_per_person")

  // 多様性スコア（0-100）
  diversityScore          Float     @default(0) @map("diversity_score")
  professionDiversityScore Float    @default(0) @map("profession_diversity_score")
  generationDiversityScore Float    @default(0) @map("generation_diversity_score")
  hierarchyDiversityScore Float    @default(0) @map("hierarchy_diversity_score")

  // 成長率（前期比%）
  growthRate              Float?    @map("growth_rate")
  posterGrowthRate        Float?    @map("poster_growth_rate")
  voterGrowthRate         Float?    @map("voter_growth_rate")

  calculatedAt            DateTime  @default(now()) @map("calculated_at")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart, periodEnd])
  @@index([periodType])
  @@map("topic_participation_stats")
}

// 議題参加統計（職種別）
model TopicParticipationByProfession {
  id                String    @id @default(cuid())
  periodType        String
  periodStart       DateTime  @map("period_start")
  periodEnd         DateTime  @map("period_end")

  professionCode    String    @map("profession_code")
  professionName    String    @map("profession_name")
  professionGroup   String    @map("profession_group")

  posterCount       Int       @default(0) @map("poster_count")
  postCount         Int       @default(0) @map("post_count")
  voterCount        Int       @default(0) @map("voter_count")
  voteCount         Int       @default(0) @map("vote_count")
  percentage        Float     @default(0) @map("percentage")

  calculatedAt      DateTime  @default(now()) @map("calculated_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart, periodEnd, professionCode])
  @@index([periodType])
  @@index([professionCode])
  @@map("topic_participation_by_profession")
}
```

### Phase 2: 集計サービス実装（優先度: 🟡 MEDIUM）

```typescript
// src/services/TopicAnalyticsService.ts

export async function calculateTopicParticipationStats(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<TopicParticipationStatsData> {

  // 1. 同意済み職員のみ取得
  const consentedUsers = await prisma.dataConsent.findMany({
    where: { analyticsConsent: true },
    select: { userId: true }
  });
  const consentedIdSet = new Set(consentedUsers.map(c => c.userId));

  // 2. 投稿データ集計
  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: Array.from(consentedIdSet) },
      createdAt: { gte: periodStart, lte: periodEnd }
    },
    include: { author: true }
  });

  // 3. 投票データ集計
  const votes = await prisma.vote.findMany({
    where: {
      userId: { in: Array.from(consentedIdSet) },
      createdAt: { gte: periodStart, lte: periodEnd }
    },
    include: { user: true }
  });

  // 4. 統計計算
  const uniquePosters = new Set(posts.map(p => p.authorId)).size;
  const uniqueVoters = new Set(votes.map(v => v.userId)).size;
  const averagePostsPerPerson = uniquePosters > 0 ? posts.length / uniquePosters : 0;
  const averageVotesPerPerson = uniqueVoters > 0 ? votes.length / uniqueVoters : 0;

  // 5. 多様性スコア計算（ProjectTalentAnalyticsと同じロジック）
  const diversityScore = await calculateDiversityScore([...posts.map(p => p.author), ...votes.map(v => v.user)]);

  return {
    totalPosters: uniquePosters,
    totalPosts: posts.length,
    averagePostsPerPerson,
    totalVoters: uniqueVoters,
    totalVotes: votes.length,
    averageVotesPerPerson,
    diversityScore: diversityScore.overall,
    professionDiversityScore: diversityScore.profession,
    generationDiversityScore: diversityScore.generation,
    hierarchyDiversityScore: diversityScore.hierarchy,
  };
}
```

### Phase 3: UI実装（優先度: 🟡 MEDIUM）

`TalentAnalyticsPage.tsx`を`ProjectTalentAnalyticsPage.tsx`と同様のUIに置き換え：

```typescript
// src/pages/TalentAnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TalentAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [stats, setStats] = useState<TopicParticipationStatsData | null>(null);

  useEffect(() => {
    // API呼び出し
    fetchTopicParticipationStats(selectedPeriod).then(setStats);
  }, [selectedPeriod]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ProjectTalentAnalyticsPageと同様のUI */}
      {/* 概要タブ */}
      {/* 部門別分布タブ */}
      {/* 参加トレンドタブ */}
      {/* 育成効果タブ */}
    </div>
  );
};
```

---

## 🚀 優先度と実装スケジュール

### 現時点での優先度: 🟡 MEDIUM

**理由**:
- `ProjectTalentAnalyticsPage`（プロジェクトモード用）の実装が先
- 議題モード版は`ProjectTalentAnalyticsPage`完成後に着手
- データ同意システムは既に実装済みなので、連携は容易

### 推奨実装スケジュール

| Phase | 内容 | 期間 | 優先度 |
|-------|------|------|--------|
| **Phase 1** | ProjectTalentAnalyticsPage完成 | 2025年11月末まで | 🔴 HIGH |
| **Phase 2** | TalentAnalyticsPage実装開始 | 2025年12月～ | 🟡 MEDIUM |
| **Phase 3** | TalentAnalyticsPage完成 | 2026年1月末まで | 🟡 MEDIUM |

---

## 📝 次のアクション

### Phase 1完了後（2025年11月末～）

1. **`TopicParticipationStats`テーブル追加**
2. **`TopicParticipationByProfession`テーブル追加**
3. **`TopicAnalyticsService`実装**
4. **TalentAnalyticsPageのUI実装**
5. **データ同意システムとの統合テスト**

---

## 📚 参考資料

- [ProjectTalentAnalyticsPage.tsx](../../src/pages/ProjectTalentAnalyticsPage.tsx)
- [project-talent-analytics_DB要件分析_20251012.md](./project-talent-analytics_DB要件分析_20251012.md)
- [project-talent-analytics暫定マスターリスト_20251012.md](./project-talent-analytics暫定マスターリスト_20251012.md)
- [DataConsentModal.tsx](../../src/components/consent/DataConsentModal.tsx)
- [DataConsent schema](../../prisma/schema.prisma) (341-357行目)

---

**文書ステータス**: ✅ メモ作成完了
**次のアクション**: ProjectTalentAnalyticsPage完成後に本格実装
**優先度**: 🟡 MEDIUM（ProjectTalentAnalyticsPageの後）
