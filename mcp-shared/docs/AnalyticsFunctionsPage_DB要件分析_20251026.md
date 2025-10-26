# AnalyticsFunctionsPage DB要件分析

**作成日**: 2025年10月26日
**作成者**: VoiceDriveチーム
**対象ページ**: AnalyticsFunctionsPage
**分析目的**: PersonalStationと同様の分析手法で、必要なDB要件を特定

---

## 📋 目次

1. [ページ概要](#1-ページ概要)
2. [権限レベル別機能マトリクス](#2-権限レベル別機能マトリクス)
3. [タブ別データソース分析](#3-タブ別データソース分析)
4. [データ管理責任分界点](#4-データ管理責任分界点)
5. [ギャップ分析](#5-ギャップ分析)
6. [実装推奨事項](#6-実装推奨事項)

---

## 1. ページ概要

### 1.1 現在の実装状況

**ファイル**: `src/pages/AnalyticsFunctionsPage.tsx` (398行)

**主要機能**:
- 権限レベル別タブ表示（レベル3/5/10）
- 部門ユーザー分析（アクティブ率、パフォーマンス）
- 部門世代間分析（Z世代、ミレニアル、X世代、ベビーブーマー）
- 施設階層間分析
- 施設職種間分析
- 全施設分析（施設比較テーブル）
- エグゼクティブレポート

**現在のデータソース**:
```typescript
// デモデータのみ使用（実際のDB接続なし）
const users = [
  { name: '山田太郎', active: true, posts: 25, votes: 42, generation: 'ミレニアル' },
  { name: '佐藤花子', active: true, posts: 18, votes: 35, generation: 'Z世代' },
  // ... ハードコードされたデモデータ
];
```

### 1.2 権限レベルによる表示制御

| 権限レベル | 表示可能なタブ |
|-----------|--------------|
| **Level 3** | 部門ユーザー分析、部門世代間分析 |
| **Level 5** | + 施設階層間分析、施設職種間分析 |
| **Level 10** | + 全施設分析、エグゼクティブレポート |

---

## 2. 権限レベル別機能マトリクス

### Level 3: 部門レベル分析

#### Tab 1: 部門ユーザー分析

**表示内容**:
- アクティブユーザー率: 87% (20/23)
- ユーザーパフォーマンス傾向（投稿数、投票数、フィードバック数）
- ユーザー別アクティビティランキング

**必要なデータ**:
```typescript
interface DepartmentUserAnalytics {
  totalUsers: number;           // 部門の総ユーザー数
  activeUsers: number;          // アクティブユーザー数（30日以内に活動）
  activeRate: number;           // アクティブ率

  userPerformances: {
    userId: string;
    userName: string;
    totalPosts: number;         // 投稿数
    totalVotes: number;         // 投票数
    totalFeedbacks: number;     // フィードバック数
    activityScore: number;      // 活動スコア
    lastActiveAt: Date;         // 最終活動日時
  }[];
}
```

#### Tab 2: 部門世代間分析

**表示内容**:
- 世代別分布（Z世代 22%, ミレニアル 35%, X世代 30%, ベビーブーマー 13%）
- 世代別アクティブ率
- 世代別投稿傾向

**必要なデータ**:
```typescript
interface GenerationAnalytics {
  generationBreakdown: {
    generation: 'Z世代' | 'ミレニアル' | 'X世代' | 'ベビーブーマー';
    count: number;              // 人数
    percentage: number;         // 割合
    activeRate: number;         // アクティブ率
    avgPosts: number;           // 平均投稿数
    avgVotes: number;           // 平均投票数
    avgFeedbacks: number;       // 平均フィードバック数
  }[];
}
```

---

### Level 5: 施設レベル分析

#### Tab 3: 施設階層間分析

**表示内容**:
- 役職階層別のアクティビティ比較
- 階層間コミュニケーション状況
- 階層別の意見提出率

**必要なデータ**:
```typescript
interface HierarchyAnalytics {
  hierarchyBreakdown: {
    hierarchyLevel: string;     // 役職階層（例: 一般職員、主任、師長、部長）
    userCount: number;          // 人数
    activeRate: number;         // アクティブ率
    avgPostsPerUser: number;    // 1人あたり平均投稿数
    avgVotesPerUser: number;    // 1人あたり平均投票数

    // 階層間コミュニケーション
    postsToUpperHierarchy: number;   // 上位階層への投稿数
    postsToLowerHierarchy: number;   // 下位階層への投稿数
    crossHierarchyFeedbacks: number; // 階層を超えたフィードバック数
  }[];
}
```

#### Tab 4: 施設職種間分析

**表示内容**:
- 職種別アクティビティ比較
- 職種間コラボレーション状況
- 職種別の関心テーマ

**必要なデータ**:
```typescript
interface ProfessionAnalytics {
  professionBreakdown: {
    profession: string;         // 職種（看護師、医師、薬剤師、等）
    userCount: number;          // 人数
    activeRate: number;         // アクティブ率
    avgPostsPerUser: number;    // 1人あたり平均投稿数

    // 職種間コラボレーション
    crossProfessionPosts: number;     // 他職種向け投稿数
    crossProfessionFeedbacks: number; // 他職種からのフィードバック数

    // 関心テーマ（投稿分類に基づく）
    topCategories: {
      categoryId: string;
      categoryName: string;
      postCount: number;
    }[];
  }[];
}
```

---

### Level 10: 全施設レベル分析

#### Tab 5: 全施設分析

**表示内容**:
- 施設別比較テーブル（ユーザー数、投稿数、アクティブ率）
- 施設間パフォーマンスランキング
- ベストプラクティス施設の特定

**必要なデータ**:
```typescript
interface AllFacilitiesAnalytics {
  facilityComparison: {
    facilityId: string;
    facilityName: string;
    totalUsers: number;         // 総ユーザー数
    activeUsers: number;        // アクティブユーザー数
    activeRate: number;         // アクティブ率
    totalPosts: number;         // 総投稿数
    totalVotes: number;         // 総投票数
    totalProjects: number;      // 総プロジェクト数

    // パフォーマンス指標
    postsPerUser: number;       // 1人あたり投稿数
    votesPerUser: number;       // 1人あたり投票数
    engagementScore: number;    // エンゲージメントスコア
    rank: number;               // ランキング
  }[];

  // ベストプラクティス
  topFacility: {
    facilityId: string;
    facilityName: string;
    successFactors: string[];   // 成功要因
  };
}
```

#### Tab 6: エグゼクティブレポート

**表示内容**:
- 全社的なKPI（投稿数、ユーザー参加率、改善提案数）
- 月次トレンド分析
- 部門別パフォーマンス比較
- ROI分析（VoiceDrive導入効果）

**必要なデータ**:
```typescript
interface ExecutiveReport {
  // 全社KPI
  overallKPIs: {
    totalUsers: number;
    activeUsers: number;
    activeRate: number;
    totalPosts: number;
    totalProjects: number;
    implementedProjects: number;
    implementationRate: number;
  };

  // 月次トレンド
  monthlyTrends: {
    month: string;              // YYYY-MM
    activeUsers: number;
    newPosts: number;
    newProjects: number;
    completedProjects: number;
  }[];

  // 部門別パフォーマンス
  departmentPerformance: {
    departmentId: string;
    departmentName: string;
    activeRate: number;
    postsPerUser: number;
    projectsPerUser: number;
    performanceScore: number;   // 総合スコア
    rank: number;
  }[];

  // ROI指標
  roiMetrics: {
    totalSuggestions: number;           // 総提案数
    implementedSuggestions: number;     // 実装済み提案数
    estimatedCostSavings: number;       // 推定コスト削減額
    employeeSatisfactionImprovement: number; // 従業員満足度改善率
  };
}
```

---

## 3. タブ別データソース分析

### 3.1 部門ユーザー分析（Level 3）

| 表示項目 | 現在の実装 | 必要なデータソース | 責任主体 |
|---------|-----------|------------------|---------|
| **総ユーザー数** | デモデータ | `User.count()` WHERE `department = 部門A` | VoiceDrive |
| **アクティブユーザー数** | デモデータ | `User.count()` WHERE `lastActiveAt > 30日前` | VoiceDrive |
| **ユーザー別投稿数** | デモデータ | `Post.groupBy(authorId).count()` | VoiceDrive |
| **ユーザー別投票数** | デモデータ | `Vote.groupBy(userId).count()` | VoiceDrive |
| **ユーザー別フィードバック数** | デモデータ | `Feedback.groupBy(authorId).count()` | VoiceDrive |
| **ユーザー名** | デモデータ | `User.name` (キャッシュ) | 医療システム→VoiceDrive |
| **部門名** | デモデータ | `User.department` (キャッシュ) | 医療システム→VoiceDrive |

**データフロー**:
```
医療システム（マスタ）
  ↓ Webhook (employee.updated)
VoiceDrive User テーブル（キャッシュ）
  ↓ JOIN
VoiceDrive 活動データ（Post, Vote, Feedback）
  ↓ 集計
AnalyticsFunctionsPage 表示
```

---

### 3.2 部門世代間分析（Level 3）

| 表示項目 | 現在の実装 | 必要なデータソース | 責任主体 |
|---------|-----------|------------------|---------|
| **世代分類** | デモデータ | `User.generation` (計算フィールド) | VoiceDrive |
| **年齢** | デモデータ | `User.age` (キャッシュ) | 医療システム→VoiceDrive |
| **世代別人数** | デモデータ | `User.groupBy(generation).count()` | VoiceDrive |
| **世代別投稿数** | デモデータ | `Post JOIN User ON generation` | VoiceDrive |
| **世代別投票数** | デモデータ | `Vote JOIN User ON generation` | VoiceDrive |

**世代分類ロジック**:
```typescript
function getGeneration(birthYear: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  if (age <= 27) return 'Z世代';        // 1997年以降生まれ
  if (age <= 43) return 'ミレニアル';    // 1981-1996年生まれ
  if (age <= 59) return 'X世代';        // 1965-1980年生まれ
  return 'ベビーブーマー';               // 1964年以前生まれ
}
```

---

### 3.3 施設階層間分析（Level 5）

| 表示項目 | 現在の実装 | 必要なデータソース | 責任主体 |
|---------|-----------|------------------|---------|
| **役職階層** | ❌ 未実装 | `User.hierarchyLevel` (新規フィールド) | 医療システム→VoiceDrive |
| **階層別人数** | ❌ 未実装 | `User.groupBy(hierarchyLevel).count()` | VoiceDrive |
| **階層別投稿数** | ❌ 未実装 | `Post JOIN User ON hierarchyLevel` | VoiceDrive |
| **階層間コミュニケーション** | ❌ 未実装 | `Post.targetHierarchy` (新規フィールド) | VoiceDrive |

**⚠️ ギャップ**: `User.hierarchyLevel` フィールドが存在しない

---

### 3.4 施設職種間分析（Level 5）

| 表示項目 | 現在の実装 | 必要なデータソース | 責任主体 |
|---------|-----------|------------------|---------|
| **職種** | ❌ 未実装 | `User.profession` (新規フィールド) | 医療システム→VoiceDrive |
| **職種別人数** | ❌ 未実装 | `User.groupBy(profession).count()` | VoiceDrive |
| **職種別投稿数** | ❌ 未実装 | `Post JOIN User ON profession` | VoiceDrive |
| **職種間コラボレーション** | ❌ 未実装 | `Post.targetProfession` (新規フィールド) | VoiceDrive |
| **関心テーマ** | ❌ 未実装 | `Post.category` (既存) | VoiceDrive |

**⚠️ ギャップ**: `User.profession` フィールドが存在しない

---

### 3.5 全施設分析（Level 10）

| 表示項目 | 現在の実装 | 必要なデータソース | 責任主体 |
|---------|-----------|------------------|---------|
| **施設ID** | デモデータ | `User.facilityId` (新規フィールド) | 医療システム→VoiceDrive |
| **施設名** | デモデータ | `Facility.name` (新規テーブル) | 医療システム→VoiceDrive |
| **施設別ユーザー数** | デモデータ | `User.groupBy(facilityId).count()` | VoiceDrive |
| **施設別投稿数** | デモデータ | `Post JOIN User ON facilityId` | VoiceDrive |
| **施設別プロジェクト数** | デモデータ | `Project JOIN User ON facilityId` | VoiceDrive |
| **エンゲージメントスコア** | ❌ 未実装 | 計算フィールド（新規） | VoiceDrive |

**⚠️ ギャップ**: `User.facilityId`, `Facility` テーブルが存在しない

---

### 3.6 エグゼクティブレポート（Level 10）

| 表示項目 | 現在の実装 | 必要なデータソース | 責任主体 |
|---------|-----------|------------------|---------|
| **全社KPI** | ❌ 未実装 | `User.count()`, `Post.count()`, `Project.count()` | VoiceDrive |
| **月次トレンド** | ❌ 未実装 | `MonthlyAnalytics` (新規テーブル) | VoiceDrive |
| **部門別パフォーマンス** | ❌ 未実装 | `DepartmentAnalytics` (新規テーブル) | VoiceDrive |
| **ROI指標** | ❌ 未実装 | `Project.status`, `Project.costSavings` (新規フィールド) | VoiceDrive |
| **従業員満足度** | ❌ 未実装 | 医療システムAPI (`/api/employee-satisfaction`) | 医療システム |

**⚠️ ギャップ**: 月次集計テーブル、ROI指標フィールドが存在しない

---

## 4. データ管理責任分界点

**参照**: `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

### 4.1 医療システム責任（マスタデータ）

| データ項目 | 理由 | 同期方法 |
|-----------|------|---------|
| **従業員ID** | 人事システムのマスタ | Webhook |
| **従業員名** | 人事システムのマスタ | Webhook |
| **部門** | 組織マスタ | Webhook |
| **職種** | 人事マスタ | Webhook |
| **役職階層** | 組織マスタ | Webhook |
| **施設ID** | 施設マスタ | Webhook |
| **年齢/生年月日** | 人事マスタ | Webhook |
| **経験年数** | 人事マスタ | Webhook |

**Webhook イベント**:
- `employee.created` - 新規職員登録
- `employee.updated` - 職員情報更新
- `employee.deleted` - 退職/削除
- `employee.transferred` - 異動（部門/施設変更）

---

### 4.2 VoiceDrive責任（活動データ）

| データ項目 | 理由 | 保存場所 |
|-----------|------|---------|
| **投稿（Post）** | VoiceDrive固有の活動 | VoiceDrive DB |
| **投票（Vote）** | VoiceDrive固有の活動 | VoiceDrive DB |
| **フィードバック（Feedback）** | VoiceDrive固有の活動 | VoiceDrive DB |
| **プロジェクト（Project）** | VoiceDrive固有の活動 | VoiceDrive DB |
| **アンケート（Survey）** | VoiceDrive固有の活動 | VoiceDrive DB |
| **世代分類** | VoiceDriveの計算フィールド | VoiceDrive DB |
| **最終アクティブ日時** | VoiceDriveの記録 | VoiceDrive DB |
| **アクティビティスコア** | VoiceDriveの計算 | VoiceDrive DB |

**提供方法**: REST API (`/api/analytics/*`)

---

### 4.3 ハイブリッドデータ（両方が関与）

| データ項目 | VoiceDrive側 | 医療システム側 | 統合方法 |
|-----------|-------------|--------------|---------|
| **世代別分析** | 活動データ集計 | 年齢マスタ提供 | VoiceDriveが計算 |
| **職種別分析** | 活動データ集計 | 職種マスタ提供 | VoiceDriveが計算 |
| **階層間分析** | 活動データ集計 | 役職マスタ提供 | VoiceDriveが計算 |
| **施設間比較** | 活動データ集計 | 施設マスタ提供 | VoiceDriveが計算 |
| **従業員満足度** | アンケートデータ（一部） | 公式満足度調査 | 医療システムAPI提供 |

---

## 5. ギャップ分析

### 5.1 Userテーブルの不足フィールド

**現在のschema.prisma**:
```prisma
model User {
  id                   String   @id @default(cuid())
  employeeId           String   @unique
  email                String   @unique
  name                 String
  department           String?
  permissionLevel      Decimal
  age                  Int?
  experienceYears      Float?
  generation           String?
  // ...
}
```

**不足フィールド**:
| フィールド名 | 型 | 必須 | デフォルト値 | 説明 |
|------------|---|------|------------|------|
| `profession` | `String?` | No | `null` | 職種（看護師、医師、薬剤師、等） |
| `hierarchyLevel` | `String?` | No | `null` | 役職階層（一般職員、主任、師長、部長、等） |
| `facilityId` | `String?` | No | `null` | 所属施設ID |
| `lastActiveAt` | `DateTime?` | No | `null` | 最終活動日時 |
| `activityScore` | `Float?` | No | `0` | アクティビティスコア（計算フィールド） |
| `birthYear` | `Int?` | No | `null` | 生年（世代計算用） |

---

### 5.2 新規テーブルの必要性

#### 5.2.1 Facilityテーブル（施設マスタ）

```prisma
model Facility {
  id                String   @id @default(cuid())
  facilityCode      String   @unique        // 医療システムの施設コード
  facilityName      String                  // 施設名
  facilityType      String?                 // 施設種別（病院、クリニック、等）
  region            String?                 // 地域

  // 同期情報
  syncStatus        SyncStatus @default(never_synced)
  lastSyncedAt      DateTime?
  syncErrorMessage  String?

  // リレーション
  users             User[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([facilityCode])
}
```

#### 5.2.2 MonthlyAnalyticsテーブル（月次集計）

```prisma
model MonthlyAnalytics {
  id                    String   @id @default(cuid())
  month                 String                  // YYYY-MM形式
  facilityId            String?                 // 施設別（nullは全社）
  departmentId          String?                 // 部門別（nullは全社）

  // ユーザー指標
  totalUsers            Int      @default(0)
  activeUsers           Int      @default(0)
  newUsers              Int      @default(0)

  // 活動指標
  totalPosts            Int      @default(0)
  totalVotes            Int      @default(0)
  totalFeedbacks        Int      @default(0)
  totalProjects         Int      @default(0)
  completedProjects     Int      @default(0)

  // パフォーマンス指標
  postsPerUser          Float?
  votesPerUser          Float?
  engagementScore       Float?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([month, facilityId, departmentId])
  @@index([month])
  @@index([facilityId])
  @@index([departmentId])
}
```

#### 5.2.3 UserActivityLogテーブル（活動ログ）

```prisma
model UserActivityLog {
  id                String   @id @default(cuid())
  userId            String
  activityType      String              // 'post', 'vote', 'feedback', 'project', 'survey'
  activityId        String              // 活動対象のID
  timestamp         DateTime @default(now())

  // リレーション
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp])
  @@index([activityType])
}
```

**用途**: `lastActiveAt` の自動更新、アクティブユーザー判定

---

### 5.3 Projectテーブルの不足フィールド

**現在のschema.prisma**:
```prisma
model Project {
  id            String   @id @default(cuid())
  title         String
  description   String
  status        String
  // ...
}
```

**不足フィールド**:
| フィールド名 | 型 | 必須 | デフォルト値 | 説明 |
|------------|---|------|------------|------|
| `implementationStatus` | `String?` | No | `'proposed'` | 実装状況（proposed, approved, implementing, implemented, rejected） |
| `estimatedCostSavings` | `Float?` | No | `null` | 推定コスト削減額（円） |
| `actualCostSavings` | `Float?` | No | `null` | 実際のコスト削減額（円） |
| `implementedAt` | `DateTime?` | No | `null` | 実装完了日 |
| `roiScore` | `Float?` | No | `null` | ROIスコア |

---

### 5.4 API エンドポイントの不足

#### VoiceDrive側（実装必要）

| エンドポイント | メソッド | 説明 | ステータス |
|--------------|---------|------|-----------|
| `/api/analytics/department/:deptId/users` | GET | 部門ユーザー分析 | ❌ 未実装 |
| `/api/analytics/department/:deptId/generations` | GET | 部門世代間分析 | ❌ 未実装 |
| `/api/analytics/facility/:facilityId/hierarchy` | GET | 施設階層間分析 | ❌ 未実装 |
| `/api/analytics/facility/:facilityId/professions` | GET | 施設職種間分析 | ❌ 未実装 |
| `/api/analytics/all-facilities` | GET | 全施設分析 | ❌ 未実装 |
| `/api/analytics/executive-report` | GET | エグゼクティブレポート | ❌ 未実装 |
| `/api/analytics/monthly-trends` | GET | 月次トレンド | ❌ 未実装 |

#### 医療システム側（確認必要）

| エンドポイント | メソッド | 説明 | ステータス |
|--------------|---------|------|-----------|
| `/api/voicedrive/facilities` | GET | 施設マスタ取得 | ❓ 確認必要 |
| `/api/voicedrive/employee-satisfaction` | GET | 従業員満足度調査結果 | ❓ 確認必要 |
| `/api/voicedrive/organization-hierarchy` | GET | 組織階層マスタ | ❓ 確認必要 |

---

## 6. 実装推奨事項

### 6.1 Phase 1: 基礎データ整備（Week 1-2）

#### ステップ1: schema.prisma更新
```prisma
// Userテーブル拡張
model User {
  // 既存フィールド...

  // 新規フィールド追加
  profession       String?         // 職種
  hierarchyLevel   String?         // 役職階層
  facilityId       String?         // 施設ID
  birthYear        Int?            // 生年
  lastActiveAt     DateTime?       // 最終活動日時
  activityScore    Float @default(0) // アクティビティスコア

  // リレーション追加
  facility         Facility? @relation(fields: [facilityId], references: [id])
  activityLogs     UserActivityLog[]
}

// Facilityテーブル作成
model Facility {
  id                String   @id @default(cuid())
  facilityCode      String   @unique
  facilityName      String
  facilityType      String?
  region            String?

  syncStatus        SyncStatus @default(never_synced)
  lastSyncedAt      DateTime?

  users             User[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// MonthlyAnalyticsテーブル作成
model MonthlyAnalytics {
  // (上記の定義を参照)
}

// UserActivityLogテーブル作成
model UserActivityLog {
  // (上記の定義を参照)
}

// Project拡張
model Project {
  // 既存フィールド...

  implementationStatus  String @default("proposed")
  estimatedCostSavings  Float?
  actualCostSavings     Float?
  implementedAt         DateTime?
  roiScore              Float?
}
```

#### ステップ2: マイグレーション実行
```bash
npx prisma migrate dev --name add_analytics_fields
npx prisma generate
```

---

### 6.2 Phase 2: Webhook拡張（Week 3）

#### 医療システム側Webhook拡張（確認事項）

**既存Webhook**:
- `employee.created`
- `employee.updated`
- `employee.deleted`

**拡張リクエスト**:
```typescript
// employee.updated のペイロード拡張
interface EmployeeUpdatedPayload {
  // 既存フィールド
  employeeId: string;
  name: string;
  email: string;
  department: string;

  // 新規フィールド（追加リクエスト）
  profession: string;           // 職種
  hierarchyLevel: string;       // 役職階層
  facilityId: string;           // 施設ID
  facilityName: string;         // 施設名
  birthYear: number;            // 生年
  age: number;                  // 年齢
}
```

#### VoiceDrive側Webhook受信処理

**ファイル**: `src/pages/api/webhooks/medical-system.ts`

```typescript
// 施設情報の同期
if (payload.facilityId && payload.facilityName) {
  await prisma.facility.upsert({
    where: { facilityCode: payload.facilityId },
    update: { facilityName: payload.facilityName },
    create: {
      facilityCode: payload.facilityId,
      facilityName: payload.facilityName,
      syncStatus: 'synced',
      lastSyncedAt: new Date()
    }
  });
}

// ユーザー情報の更新
await prisma.user.update({
  where: { employeeId: payload.employeeId },
  data: {
    profession: payload.profession,
    hierarchyLevel: payload.hierarchyLevel,
    facilityId: payload.facilityId,
    birthYear: payload.birthYear,
    age: payload.age,
    generation: getGeneration(payload.birthYear),
    syncStatus: 'synced',
    lastSyncedAt: new Date()
  }
});
```

---

### 6.3 Phase 3: Analytics API実装（Week 4-5）

#### API実装優先順位

**Priority 1 (Level 3機能)**:
1. `/api/analytics/department/:deptId/users` - 部門ユーザー分析
2. `/api/analytics/department/:deptId/generations` - 部門世代間分析

**Priority 2 (Level 5機能)**:
3. `/api/analytics/facility/:facilityId/hierarchy` - 施設階層間分析
4. `/api/analytics/facility/:facilityId/professions` - 施設職種間分析

**Priority 3 (Level 10機能)**:
5. `/api/analytics/all-facilities` - 全施設分析
6. `/api/analytics/executive-report` - エグゼクティブレポート

#### 実装例: 部門ユーザー分析API

**ファイル**: `src/pages/api/analytics/department/[deptId]/users.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { deptId } = req.query;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    // 総ユーザー数
    const totalUsers = await prisma.user.count({
      where: { department: deptId as string }
    });

    // アクティブユーザー数
    const activeUsers = await prisma.user.count({
      where: {
        department: deptId as string,
        lastActiveAt: { gte: thirtyDaysAgo }
      }
    });

    // ユーザー別パフォーマンス
    const users = await prisma.user.findMany({
      where: { department: deptId as string },
      include: {
        posts: { select: { id: true } },
        votes: { select: { id: true } },
        feedbacks: { select: { id: true } }
      }
    });

    const userPerformances = users.map(user => ({
      userId: user.id,
      userName: user.name,
      totalPosts: user.posts.length,
      totalVotes: user.votes.length,
      totalFeedbacks: user.feedbacks.length,
      activityScore: user.posts.length * 3 + user.votes.length + user.feedbacks.length * 2,
      lastActiveAt: user.lastActiveAt
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        userPerformances: userPerformances.sort((a, b) => b.activityScore - a.activityScore)
      }
    });
  } catch (error) {
    console.error('[Analytics API Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### 6.4 Phase 4: 月次バッチ処理（Week 6）

#### 月次集計バッチジョブ

**ファイル**: `src/scripts/monthly-analytics-batch.ts`

```typescript
import { prisma } from '@/lib/prisma';

async function calculateMonthlyAnalytics(month: string) {
  console.log(`[MonthlyAnalytics] Calculating for ${month}...`);

  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  // 全施設のリスト
  const facilities = await prisma.facility.findMany();

  for (const facility of facilities) {
    const totalUsers = await prisma.user.count({
      where: { facilityId: facility.id }
    });

    const activeUsers = await prisma.user.count({
      where: {
        facilityId: facility.id,
        lastActiveAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalPosts = await prisma.post.count({
      where: {
        author: { facilityId: facility.id },
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const totalVotes = await prisma.vote.count({
      where: {
        user: { facilityId: facility.id },
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const totalProjects = await prisma.project.count({
      where: {
        author: { facilityId: facility.id },
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const completedProjects = await prisma.project.count({
      where: {
        author: { facilityId: facility.id },
        implementationStatus: 'implemented',
        implementedAt: { gte: startDate, lte: endDate }
      }
    });

    // MonthlyAnalyticsに保存
    await prisma.monthlyAnalytics.upsert({
      where: {
        month_facilityId_departmentId: {
          month,
          facilityId: facility.id,
          departmentId: null
        }
      },
      update: {
        totalUsers,
        activeUsers,
        totalPosts,
        totalVotes,
        totalProjects,
        completedProjects,
        postsPerUser: totalUsers > 0 ? totalPosts / totalUsers : 0,
        votesPerUser: totalUsers > 0 ? totalVotes / totalUsers : 0,
        engagementScore: calculateEngagementScore(totalPosts, totalVotes, activeUsers)
      },
      create: {
        month,
        facilityId: facility.id,
        departmentId: null,
        totalUsers,
        activeUsers,
        totalPosts,
        totalVotes,
        totalProjects,
        completedProjects,
        postsPerUser: totalUsers > 0 ? totalPosts / totalUsers : 0,
        votesPerUser: totalUsers > 0 ? totalVotes / totalUsers : 0,
        engagementScore: calculateEngagementScore(totalPosts, totalVotes, activeUsers)
      }
    });

    console.log(`[MonthlyAnalytics] ${facility.facilityName} - ${month} completed`);
  }
}

function calculateEngagementScore(posts: number, votes: number, activeUsers: number): number {
  if (activeUsers === 0) return 0;
  return ((posts * 3 + votes) / activeUsers) * 10;
}

// 実行
const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
calculateMonthlyAnalytics(currentMonth);
```

**Cron設定** (`package.json`):
```json
{
  "scripts": {
    "analytics:monthly": "npx tsx src/scripts/monthly-analytics-batch.ts"
  }
}
```

**実行タイミング**: 毎月1日 0:00 (Vercel Cronまたは外部スケジューラー)

---

### 6.5 Phase 5: フロントエンド統合（Week 7）

#### AnalyticsFunctionsPageの更新

**ファイル**: `src/pages/AnalyticsFunctionsPage.tsx`

**変更箇所**:
```typescript
// Before: デモデータ
const users = [
  { name: '山田太郎', active: true, posts: 25, votes: 42, generation: 'ミレニアル' },
  // ...
];

// After: API呼び出し
const [departmentAnalytics, setDepartmentAnalytics] = useState(null);

useEffect(() => {
  async function fetchDepartmentAnalytics() {
    const response = await fetch(`/api/analytics/department/${currentUser.department}/users`);
    const data = await response.json();
    setDepartmentAnalytics(data.data);
  }

  fetchDepartmentAnalytics();
}, [currentUser.department]);

// 表示
{departmentAnalytics && (
  <div>
    <p>アクティブユーザー率: {departmentAnalytics.activeRate.toFixed(1)}%</p>
    <p>({departmentAnalytics.activeUsers}/{departmentAnalytics.totalUsers})</p>
  </div>
)}
```

---

## 7. 医療システムチームへの確認事項

### 7.1 Webhook拡張リクエスト

**件名**: Phase 2.6 - AnalyticsFunctionsPage実装のためのWebhook拡張依頼

**本文**:
```
医療システムチーム 様

VoiceDrive Phase 2.6の実装に伴い、以下のフィールドをWebhookペイロードに追加していただけますでしょうか？

【employee.created / employee.updated】
- profession (String): 職種（看護師、医師、薬剤師、等）
- hierarchyLevel (String): 役職階層（一般職員、主任、師長、部長、等）
- facilityId (String): 施設ID
- facilityName (String): 施設名
- birthYear (Int): 生年（西暦）

【employee.transferred（新規）】
異動イベント（部門/施設変更時）
- employeeId
- oldDepartment / newDepartment
- oldFacilityId / newFacilityId
- transferredAt

確認事項:
1. 上記フィールドの追加は可能でしょうか？
2. ステージング環境でのテストはいつ頃可能でしょうか？
3. facilityマスタのAPI提供は可能でしょうか？（GET /api/voicedrive/facilities）

よろしくお願いいたします。
```

---

### 7.2 新規API提供リクエスト

| API名 | 目的 | 優先度 |
|------|------|--------|
| `GET /api/voicedrive/facilities` | 施設マスタ取得 | 高 |
| `GET /api/voicedrive/employee-satisfaction` | 従業員満足度調査結果 | 中 |
| `GET /api/voicedrive/organization-hierarchy` | 組織階層マスタ | 中 |

---

## 8. まとめ

### 8.1 実装タイムライン（Phase 2.6想定）

| Week | 作業内容 | 担当 |
|------|---------|------|
| **Week 1** | schema.prisma更新、マイグレーション | VoiceDrive |
| **Week 2** | Webhook拡張実装（医療システム側） | 医療システム |
| **Week 3** | Webhook受信処理実装（VoiceDrive側） | VoiceDrive |
| **Week 4** | Analytics API実装（Priority 1） | VoiceDrive |
| **Week 5** | Analytics API実装（Priority 2-3） | VoiceDrive |
| **Week 6** | 月次バッチ処理実装 | VoiceDrive |
| **Week 7** | フロントエンド統合、統合テスト | 両チーム |

---

### 8.2 重要な設計原則

1. **Single Source of Truth**: 医療システムがマスタ、VoiceDriveはキャッシュ
2. **Webhook駆動**: リアルタイム同期を維持
3. **権限ベース表示**: Level 3/5/10で段階的に機能解放
4. **パフォーマンス最適化**: 月次バッチで事前集計
5. **エラーハンドリング**: 医療システムAPI障害時のフォールバック

---

### 8.3 次のアクション

✅ **即座に実施**:
1. 医療システムチームへWebhook拡張リクエスト送信
2. schema.prisma更新（Week 1作業）
3. マイグレーション実行

⏳ **Week 2以降**:
4. Analytics API実装開始
5. 月次バッチジョブ作成
6. フロントエンド統合

---

**最終更新**: 2025年10月26日
**作成者**: VoiceDriveチーム
**レビュー**: 未実施
