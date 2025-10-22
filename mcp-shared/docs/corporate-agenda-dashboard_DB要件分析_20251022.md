# CorporateAgendaDashboardページ DB要件分析

**文書番号**: DB-REQ-2025-1022-002
**作成日**: 2025年10月22日
**対象ページ**: https://voicedrive-v100.vercel.app/corporate-agenda-dashboard
**対象ユーザー**: レベル18（理事長・法人事務局長）
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md

---

## 📋 分析サマリー

### 結論
CorporateAgendaDashboardページは**全10施設の議題化プロセス稼働状況**を統合的に表示するダッシュボードです。現在は完全にダミーデータで実装されており、**実データ化には複数の新規テーブルとAPIが必要**です。

### 🔴 重大な不足項目（即対応必要）

1. **施設マスタデータの不足**
   - 現在ハードコードされた10施設（69-200行目）
   - 医療システムの`FacilityMaster`から取得する必要あり

2. **施設別統計の集計テーブル不足**
   - 総投稿数、対応中、解決済み、参加率、処理日数、ヘルススコア
   - 現在すべてダミーデータ
   - リアルタイム集計では重すぎる

3. **法人全体KPIの集計機能不足**
   - 総投稿数、平均参加率、平均解決率、平均処理日数
   - 施設横断での統計計算が必要

4. **アラート・監視機能の不足**
   - 参加率低下、処理日数増加、ヘルススコア低下の検知
   - 現在ハードコード

---

## 🔍 詳細分析

### 1. ページ概要（CorporateAgendaDashboardPage.tsx）

#### 対象ユーザー
- **レベル18**: 理事長・法人事務局長
- **目的**: 全10施設の議題化プロセス稼働状況を統合的に把握

#### 主要機能
1. **法人全体KPI表示**（37-66行目）
   - 総投稿数（全施設）
   - 平均参加率
   - 平均解決率
   - 平均処理日数

2. **施設別ステータス表示**（69-200行目）
   - 10施設それぞれの詳細データ
   - 総投稿数、対応中、解決済み
   - 参加率、処理日数、ヘルススコア
   - トレンド（up/down/stable）

3. **アラート・注意事項**（242-264行目）
   - 参加率低下警告
   - 処理日数増加警告
   - ヘルススコア低下警告

4. **施設タイプ別統計**（203-239行目）
   - 総合病院、地域医療センター、リハビリ病院、クリニック、介護施設
   - タイプごとの平均ヘルススコア、平均参加率、総投稿数

5. **ヘルススコアランキング**（378-412行目）
   - 全施設をヘルススコアでソート
   - Top 5施設を表示

6. **全施設詳細テーブル**（414-466行目）
   - 全10施設の詳細データを一覧表示

---

### 2. 法人全体KPI（37-66行目）

#### 表示内容
```typescript
const corporateKPIs: KPISummary[] = [
  {
    label: '総投稿数（全施設）',
    value: '12,847',        // ダミー
    change: '+8.2%',        // ダミー
    trend: 'up',
    status: 'good'
  },
  {
    label: '平均参加率',
    value: '64.3%',         // ダミー
    change: '+2.1%',
    trend: 'up',
    status: 'good'
  },
  {
    label: '平均解決率',
    value: '58.7%',         // ダミー
    change: '-1.3%',
    trend: 'down',
    status: 'warning'
  },
  {
    label: '平均処理日数',
    value: '26.4日',        // ダミー
    change: '-3.8日',
    trend: 'up',
    status: 'good'
  }
];
```

#### 必要なデータソース

| 表示項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|---------|--------------|-----------|------------------|------|
| 総投稿数 | VoiceDrive | ❌ ダミー | `Post`集計 | 🔴 **要実装** |
| 平均参加率 | VoiceDrive + 医療システム | ❌ ダミー | `User`集計 + 医療システムAPI | 🔴 **要実装** |
| 平均解決率 | VoiceDrive | ❌ ダミー | `Post`ステータス集計 | 🔴 **要実装** |
| 平均処理日数 | VoiceDrive | ❌ ダミー | `Post`日付計算 | 🔴 **要実装** |
| 前月比較 | VoiceDrive | ❌ ダミー | 時系列データ | 🔴 **要実装** |

#### 解決策1: 法人全体KPI集計テーブルを追加

**新規テーブル: `CorporateKPI`**
```prisma
model CorporateKPI {
  id                    String    @id @default(cuid())

  // 期間
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")
  periodType            String    @map("period_type")
  // "daily", "weekly", "monthly", "quarterly", "yearly"

  // 投稿統計
  totalPosts            Int       @default(0) @map("total_posts")
  totalPostsPrevious    Int       @default(0) @map("total_posts_previous")
  totalPostsChange      Float     @default(0) @map("total_posts_change")

  // 参加率統計
  avgParticipationRate  Float     @default(0) @map("avg_participation_rate")
  avgParticipationPrev  Float     @default(0) @map("avg_participation_prev")
  participationChange   Float     @default(0) @map("participation_change")

  // 解決率統計
  avgResolutionRate     Float     @default(0) @map("avg_resolution_rate")
  avgResolutionPrev     Float     @default(0) @map("avg_resolution_prev")
  resolutionChange      Float     @default(0) @map("resolution_change")

  // 処理日数統計
  avgProcessDays        Float     @default(0) @map("avg_process_days")
  avgProcessDaysPrev    Float     @default(0) @map("avg_process_days_prev")
  processDaysChange     Float     @default(0) @map("process_days_change")

  // メタデータ
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@unique([periodStart, periodEnd, periodType])
  @@index([periodStart])
  @@index([periodType])
  @@map("corporate_kpi")
}
```

**集計ロジック**:
```typescript
// src/services/CorporateKPIService.ts
export async function calculateCorporateKPI(
  periodStart: Date,
  periodEnd: Date
): Promise<CorporateKPISummary> {
  // 全施設の投稿を集計
  const posts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: periodStart,
        lte: periodEnd
      }
    },
    include: {
      author: {
        select: { facilityId: true }
      }
    }
  });

  const totalPosts = posts.length;

  // 解決済み投稿
  const resolvedPosts = posts.filter(p =>
    p.status === 'CLOSED' || p.resolvedAt !== null
  ).length;

  const avgResolutionRate = totalPosts > 0
    ? (resolvedPosts / totalPosts) * 100
    : 0;

  // 処理日数計算
  const processedPosts = posts.filter(p => p.resolvedAt !== null);
  const avgProcessDays = processedPosts.length > 0
    ? processedPosts.reduce((sum, p) => {
        const days = (p.resolvedAt!.getTime() - p.createdAt.getTime())
          / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / processedPosts.length
    : 0;

  // 参加率計算（全職員数が必要 - 医療システムから取得）
  const totalEmployees = await getTotalEmployeeCount(); // 医療システムAPI
  const activeUsers = await prisma.user.count({
    where: {
      lastLoginAt: {
        gte: periodStart
      }
    }
  });

  const avgParticipationRate = totalEmployees > 0
    ? (activeUsers / totalEmployees) * 100
    : 0;

  return {
    totalPosts,
    avgParticipationRate,
    avgResolutionRate,
    avgProcessDays
  };
}
```

---

### 3. 施設別ステータス（69-200行目）

#### 表示内容
```typescript
interface FacilityStatus {
  id: string;
  name: string;
  type: string;
  totalVoices: number;      // 総投稿数
  activeVoices: number;     // 対応中
  resolvedVoices: number;   // 解決済み
  participationRate: number; // 参加率（%）
  avgProcessTime: number;    // 平均処理日数
  healthScore: number;       // ヘルススコア（0-100）
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

// 現在ハードコードされた10施設
const facilities: FacilityStatus[] = [
  {
    id: 'F001',
    name: '中央総合病院',
    type: '総合病院',
    totalVoices: 3247,      // ダミー
    activeVoices: 487,
    resolvedVoices: 1842,
    participationRate: 72,
    avgProcessTime: 24,
    healthScore: 85,
    lastUpdated: '2時間前',
    trend: 'up'
  },
  // ... 以下9施設
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 施設マスタ | 医療システム | ❌ ハードコード | `FacilityMaster` | 🔴 **医療システムAPI必要** |
| 総投稿数 | VoiceDrive | ❌ ダミー | `Post`集計 | 🔴 **要実装** |
| 対応中 | VoiceDrive | ❌ ダミー | `Post`ステータス集計 | 🔴 **要実装** |
| 解決済み | VoiceDrive | ❌ ダミー | `Post`ステータス集計 | 🔴 **要実装** |
| 参加率 | 医療システム + VoiceDrive | ❌ ダミー | 職員数API + ログイン統計 | 🔴 **要実装** |
| 処理日数 | VoiceDrive | ❌ ダミー | `Post`日付計算 | 🔴 **要実装** |
| ヘルススコア | VoiceDrive | ❌ ダミー | 独自計算ロジック | 🔴 **要実装** |
| トレンド | VoiceDrive | ❌ ダミー | 時系列比較 | 🔴 **要実装** |

#### 解決策2: 施設別統計テーブルを追加

**新規テーブル: `FacilityStatistics`**
```prisma
model FacilityStatistics {
  id                    String    @id @default(cuid())
  facilityId            String    @map("facility_id")

  // 期間
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")
  periodType            String    @map("period_type")
  // "daily", "weekly", "monthly"

  // 投稿統計
  totalPosts            Int       @default(0) @map("total_posts")
  activePosts           Int       @default(0) @map("active_posts")
  resolvedPosts         Int       @default(0) @map("resolved_posts")

  // 参加統計
  totalEmployees        Int       @default(0) @map("total_employees")
  activeUsers           Int       @default(0) @map("active_users")
  participationRate     Float     @default(0) @map("participation_rate")

  // 処理統計
  avgProcessDays        Float     @default(0) @map("avg_process_days")
  medianProcessDays     Float     @default(0) @map("median_process_days")
  maxProcessDays        Int       @default(0) @map("max_process_days")

  // ヘルススコア（0-100）
  healthScore           Float     @default(0) @map("health_score")
  healthScorePrevious   Float     @default(0) @map("health_score_previous")

  // トレンド
  trend                 String    @default("stable") @map("trend")
  // "up", "down", "stable"

  // メタデータ
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@unique([facilityId, periodStart, periodEnd, periodType])
  @@index([facilityId])
  @@index([periodStart])
  @@index([healthScore])
  @@map("facility_statistics")
}
```

**ヘルススコア計算ロジック**:
```typescript
// src/services/FacilityHealthScoreService.ts
export function calculateHealthScore(stats: {
  participationRate: number;
  avgProcessDays: number;
  totalPosts: number;
  resolvedPosts: number;
}): number {
  // 参加率スコア（40点満点）
  const participationScore = Math.min(40, (stats.participationRate / 80) * 40);

  // 解決率スコア（30点満点）
  const resolutionRate = stats.totalPosts > 0
    ? (stats.resolvedPosts / stats.totalPosts) * 100
    : 0;
  const resolutionScore = Math.min(30, (resolutionRate / 70) * 30);

  // 処理速度スコア（30点満点、30日以内が満点）
  const processScore = stats.avgProcessDays <= 30
    ? 30 - (stats.avgProcessDays / 30) * 10
    : 20 - Math.min(10, (stats.avgProcessDays - 30) / 10);

  return Math.round(participationScore + resolutionScore + processScore);
}
```

---

### 4. 施設タイプ別統計（203-239行目）

#### 表示内容
```typescript
const facilityTypeStats = [
  {
    type: '総合病院',
    count: 2,
    avgHealthScore: 83,
    avgParticipation: 70.5,
    totalVoices: 5381
  },
  // ... 他4タイプ
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| 施設タイプ | 医療システム | ❌ ハードコード | `FacilityMaster.type` | 🔴 **医療システムAPI必要** |
| タイプ別集計 | VoiceDrive | ❌ ダミー | `FacilityStatistics`集計 | 🔴 **要実装** |

#### 解決策3: 医療システムから施設マスタを取得

**医療システムAPI**:
```typescript
// 医療システム: GET /api/facilities
{
  "facilities": [
    {
      "id": "facility-001",
      "code": "OH",
      "name": "小原病院",
      "type": "総合病院",
      "address": "...",
      "totalEmployees": 450,
      "isActive": true
    },
    // ... 全10施設
  ]
}
```

**VoiceDrive側キャッシュテーブル**:
```prisma
model Facility {
  id              String    @id @default(cuid())
  facilityCode    String    @unique @map("facility_code")
  facilityName    String    @map("facility_name")
  facilityType    String    @map("facility_type")
  // "総合病院", "地域医療センター", "リハビリ病院", "クリニック", "介護施設"

  totalEmployees  Int       @default(0) @map("total_employees")
  isActive        Boolean   @default(true) @map("is_active")

  // 医療システムとの同期
  syncedAt        DateTime  @default(now()) @map("synced_at")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@map("facilities")
}
```

---

### 5. アラート・注意事項（242-264行目）

#### 表示内容
```typescript
const alerts = [
  {
    id: 'alert-1',
    facility: '西部介護施設',
    type: 'warning',
    message: '参加率が51%に低下（目標60%）',
    timestamp: '2時間前'
  },
  {
    id: 'alert-2',
    facility: '緑の森介護センター',
    type: 'critical',
    message: '平均処理日数が38日に増加（目標30日以内）',
    timestamp: '3時間前'
  },
  // ...
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル/API | 状態 |
|-----------|--------------|-----------|------------------|------|
| アラート | VoiceDrive | ❌ ハードコード | `FacilityAlert`（新規） | 🔴 **要実装** |
| しきい値 | VoiceDrive | ❌ ハードコード | `AlertThreshold`（新規） | 🔴 **要実装** |

#### 解決策4: アラート管理テーブルを追加

**新規テーブル: `FacilityAlert`**
```prisma
model FacilityAlert {
  id              String    @id @default(cuid())
  facilityId      String    @map("facility_id")

  // アラートタイプ
  alertType       String    @map("alert_type")
  // "participation_low", "process_time_high", "health_score_low"

  // 重要度
  severity        String    @map("severity")
  // "info", "warning", "critical"

  // 内容
  message         String    @db.Text
  currentValue    Float     @map("current_value")
  thresholdValue  Float     @map("threshold_value")

  // ステータス
  isAcknowledged  Boolean   @default(false) @map("is_acknowledged")
  acknowledgedBy  String?   @map("acknowledged_by")
  acknowledgedAt  DateTime? @map("acknowledged_at")

  // メタデータ
  detectedAt      DateTime  @default(now()) @map("detected_at")
  createdAt       DateTime  @default(now()) @map("created_at")

  @@index([facilityId])
  @@index([alertType])
  @@index([severity])
  @@index([isAcknowledged])
  @@map("facility_alerts")
}

model AlertThreshold {
  id                        String    @id @default(cuid())

  // しきい値設定
  participationRateMin      Float     @default(60) @map("participation_rate_min")
  processTimeDaysMax        Int       @default(30) @map("process_time_days_max")
  healthScoreMin            Float     @default(60) @map("health_score_min")
  resolutionRateMin         Float     @default(50) @map("resolution_rate_min")

  // 適用範囲
  applicableScope           String    @default("all") @map("applicable_scope")
  // "all", "hospital", "clinic", "nursing_home"

  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  @@map("alert_thresholds")
}
```

**アラート検知ロジック**:
```typescript
// src/services/AlertDetectionService.ts
export async function detectFacilityAlerts(
  facilityId: string,
  stats: FacilityStatistics
): Promise<FacilityAlert[]> {
  const thresholds = await prisma.alertThreshold.findFirst({
    where: { applicableScope: 'all' }
  });

  if (!thresholds) return [];

  const alerts: FacilityAlert[] = [];

  // 参加率チェック
  if (stats.participationRate < thresholds.participationRateMin) {
    alerts.push({
      facilityId,
      alertType: 'participation_low',
      severity: stats.participationRate < 40 ? 'critical' : 'warning',
      message: `参加率が${stats.participationRate.toFixed(1)}%に低下（目標${thresholds.participationRateMin}%）`,
      currentValue: stats.participationRate,
      thresholdValue: thresholds.participationRateMin
    });
  }

  // 処理日数チェック
  if (stats.avgProcessDays > thresholds.processTimeDaysMax) {
    alerts.push({
      facilityId,
      alertType: 'process_time_high',
      severity: stats.avgProcessDays > 45 ? 'critical' : 'warning',
      message: `平均処理日数が${Math.round(stats.avgProcessDays)}日に増加（目標${thresholds.processTimeDaysMax}日以内）`,
      currentValue: stats.avgProcessDays,
      thresholdValue: thresholds.processTimeDaysMax
    });
  }

  // ヘルススコアチェック
  if (stats.healthScore < thresholds.healthScoreMin) {
    alerts.push({
      facilityId,
      alertType: 'health_score_low',
      severity: stats.healthScore < 40 ? 'critical' : 'warning',
      message: `ヘルススコアが${Math.round(stats.healthScore)}に低下`,
      currentValue: stats.healthScore,
      thresholdValue: thresholds.healthScoreMin
    });
  }

  return alerts;
}
```

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. FacilityStatistics（施設別統計）**
```prisma
model FacilityStatistics {
  id                  String    @id @default(cuid())
  facilityId          String
  periodStart         DateTime
  periodEnd           DateTime
  periodType          String
  totalPosts          Int       @default(0)
  activePosts         Int       @default(0)
  resolvedPosts       Int       @default(0)
  totalEmployees      Int       @default(0)
  activeUsers         Int       @default(0)
  participationRate   Float     @default(0)
  avgProcessDays      Float     @default(0)
  healthScore         Float     @default(0)
  trend               String    @default("stable")
  calculatedAt        DateTime  @default(now())

  @@unique([facilityId, periodStart, periodEnd, periodType])
  @@map("facility_statistics")
}
```

**理由**:
- CorporateAgendaDashboardのメイン表示データ
- リアルタイム集計では重すぎる
- 日次バッチで更新

**B. CorporateKPI（法人全体KPI）**
```prisma
model CorporateKPI {
  id                    String    @id @default(cuid())
  periodStart           DateTime
  periodEnd             DateTime
  periodType            String
  totalPosts            Int       @default(0)
  totalPostsChange      Float     @default(0)
  avgParticipationRate  Float     @default(0)
  participationChange   Float     @default(0)
  avgResolutionRate     Float     @default(0)
  resolutionChange      Float     @default(0)
  avgProcessDays        Float     @default(0)
  processDaysChange     Float     @default(0)
  calculatedAt          DateTime  @default(now())

  @@unique([periodStart, periodEnd, periodType])
  @@map("corporate_kpi")
}
```

**理由**:
- 法人全体KPI表示に必須
- 前月比較計算に必須

**C. Facility（施設マスタキャッシュ）**
```prisma
model Facility {
  id              String    @id @default(cuid())
  facilityCode    String    @unique
  facilityName    String
  facilityType    String
  totalEmployees  Int       @default(0)
  isActive        Boolean   @default(true)
  syncedAt        DateTime  @default(now())

  @@map("facilities")
}
```

**理由**:
- 医療システムの施設マスタをキャッシュ
- ハードコード削除

**D. FacilityAlert（施設アラート）**
```prisma
model FacilityAlert {
  id              String    @id @default(cuid())
  facilityId      String
  alertType       String
  severity        String
  message         String    @db.Text
  currentValue    Float
  thresholdValue  Float
  isAcknowledged  Boolean   @default(false)
  detectedAt      DateTime  @default(now())

  @@map("facility_alerts")
}
```

**理由**:
- アラート表示に必須
- 監視機能の基盤

**E. AlertThreshold（アラートしきい値）**
```prisma
model AlertThreshold {
  id                    String    @id @default(cuid())
  participationRateMin  Float     @default(60)
  processTimeDaysMax    Int       @default(30)
  healthScoreMin        Float     @default(60)
  resolutionRateMin     Float     @default(50)
  applicableScope       String    @default("all")

  @@map("alert_thresholds")
}
```

**理由**:
- アラート検知ロジックの設定管理
- 施設タイプ別のしきい値設定

---

### 2. 医療システム側で追加が必要

#### 🔴 優先度: 高（即対応）

**F. 施設マスタAPI**
```typescript
// GET /api/facilities
// 全施設の基本情報を提供
{
  "facilities": [
    {
      "id": "facility-001",
      "code": "OH",
      "name": "小原病院",
      "type": "総合病院",
      "totalEmployees": 450,
      "isActive": true
    }
  ]
}
```

**G. 施設別職員数API**
```typescript
// GET /api/facilities/:id/employee-count
// 施設ごとの総職員数（参加率計算用）
{
  "facilityId": "facility-001",
  "totalEmployees": 450,
  "activeEmployees": 420,
  "retiredEmployees": 30
}
```

---

## 🎯 実装優先順位

### Phase 1: 施設マスタとKPI基盤（2-3日）

**目標**: ハードコードデータを削除し、医療システムAPIから取得

1. 🔴 **医療システム: 施設マスタAPI実装**
   - GET /api/facilities
   - 全10施設の基本情報を返す

2. 🔴 **VoiceDrive: Facilityテーブル追加**
   ```bash
   npx prisma migrate dev --name add_facility_master
   ```

3. 🔴 **VoiceDrive: 施設マスタ同期機能実装**
   ```typescript
   // src/services/FacilitySyncService.ts
   export async function syncFacilities() {
     const response = await fetch('/api/medical/facilities');
     const { facilities } = await response.json();

     for (const facility of facilities) {
       await prisma.facility.upsert({
         where: { facilityCode: facility.code },
         create: {
           facilityCode: facility.code,
           facilityName: facility.name,
           facilityType: facility.type,
           totalEmployees: facility.totalEmployees,
           isActive: facility.isActive
         },
         update: {
           facilityName: facility.name,
           facilityType: facility.type,
           totalEmployees: facility.totalEmployees,
           isActive: facility.isActive,
           syncedAt: new Date()
         }
       });
     }
   }
   ```

**このPhaseで動作する機能**:
- ✅ 施設マスタがDB管理される（ハードコード削除）
- ⚠️ 統計データはまだダミー

---

### Phase 2: 施設別統計の実装（3-5日）

**目標**: 施設別統計を実データで表示

1. 🔴 **FacilityStatisticsテーブル追加**
   ```bash
   npx prisma migrate dev --name add_facility_statistics
   ```

2. 🔴 **統計計算サービス実装**
   ```typescript
   // src/services/FacilityStatisticsService.ts
   export async function calculateFacilityStatistics(
     facilityId: string,
     periodStart: Date,
     periodEnd: Date
   ) {
     // 投稿統計
     const posts = await prisma.post.findMany({
       where: {
         author: { facilityId },
         createdAt: { gte: periodStart, lte: periodEnd }
       },
       include: { author: true }
     });

     const totalPosts = posts.length;
     const activePosts = posts.filter(p =>
       p.status !== 'CLOSED' && p.resolvedAt === null
     ).length;
     const resolvedPosts = posts.filter(p => p.resolvedAt !== null).length;

     // 参加率計算
     const facility = await prisma.facility.findUnique({
       where: { facilityId }
     });
     const totalEmployees = facility?.totalEmployees || 0;

     const activeUsers = await prisma.user.count({
       where: {
         facilityId,
         lastLoginAt: { gte: periodStart }
       }
     });

     const participationRate = totalEmployees > 0
       ? (activeUsers / totalEmployees) * 100
       : 0;

     // 処理日数計算
     const processedPosts = posts.filter(p => p.resolvedAt !== null);
     const avgProcessDays = processedPosts.length > 0
       ? processedPosts.reduce((sum, p) => {
           const days = (p.resolvedAt!.getTime() - p.createdAt.getTime())
             / (1000 * 60 * 60 * 24);
           return sum + days;
         }, 0) / processedPosts.length
       : 0;

     // ヘルススコア計算
     const healthScore = calculateHealthScore({
       participationRate,
       avgProcessDays,
       totalPosts,
       resolvedPosts
     });

     // 保存
     await prisma.facilityStatistics.upsert({
       where: {
         facilityId_periodStart_periodEnd_periodType: {
           facilityId,
           periodStart,
           periodEnd,
           periodType: 'daily'
         }
       },
       create: {
         facilityId,
         periodStart,
         periodEnd,
         periodType: 'daily',
         totalPosts,
         activePosts,
         resolvedPosts,
         totalEmployees,
         activeUsers,
         participationRate,
         avgProcessDays,
         healthScore
       },
       update: {
         totalPosts,
         activePosts,
         resolvedPosts,
         totalEmployees,
         activeUsers,
         participationRate,
         avgProcessDays,
         healthScore,
         calculatedAt: new Date()
       }
     });
   }
   ```

3. 🔴 **日次バッチ実装**
   ```typescript
   // src/jobs/calculateFacilityStatistics.ts
   export async function runDailyFacilityStatistics() {
     const facilities = await prisma.facility.findMany({
       where: { isActive: true }
     });

     const today = new Date();
     const yesterday = new Date(today);
     yesterday.setDate(yesterday.getDate() - 1);

     for (const facility of facilities) {
       await calculateFacilityStatistics(
         facility.facilityCode,
         yesterday,
         today
       );
     }
   }
   ```

4. 🔴 **CorporateAgendaDashboardページ修正**
   - ダミーデータを削除
   - `FacilityStatistics`から取得

**このPhaseで動作する機能**:
- ✅ 施設別統計が実データで表示
- ✅ ヘルススコアが正確に計算される
- ✅ トレンド表示（前日比較）

---

### Phase 3: 法人全体KPIとアラート（2-3日）

**目標**: 法人全体KPIとアラート機能を実装

1. 🔴 **CorporateKPIテーブル追加**
   ```bash
   npx prisma migrate dev --name add_corporate_kpi
   ```

2. 🔴 **法人全体KPI計算実装**
   ```typescript
   // src/services/CorporateKPIService.ts
   export async function calculateCorporateKPI(
     periodStart: Date,
     periodEnd: Date
   ) {
     // 全施設の統計を集計
     const facilityStats = await prisma.facilityStatistics.findMany({
       where: {
         periodStart,
         periodEnd,
         periodType: 'daily'
       }
     });

     const totalPosts = facilityStats.reduce((sum, s) => sum + s.totalPosts, 0);
     const avgParticipation = facilityStats.reduce((sum, s) =>
       sum + s.participationRate, 0) / facilityStats.length;

     // ... 他のKPI計算

     await prisma.corporateKPI.create({
       data: {
         periodStart,
         periodEnd,
         periodType: 'daily',
         totalPosts,
         avgParticipationRate: avgParticipation,
         // ...
       }
     });
   }
   ```

3. 🔴 **アラート検知実装**
   ```typescript
   // src/services/AlertDetectionService.ts
   export async function runAlertDetection() {
     const facilities = await prisma.facility.findMany({
       where: { isActive: true }
     });

     for (const facility of facilities) {
       const latestStats = await prisma.facilityStatistics.findFirst({
         where: { facilityId: facility.facilityCode },
         orderBy: { calculatedAt: 'desc' }
       });

       if (!latestStats) continue;

       const alerts = await detectFacilityAlerts(
         facility.facilityCode,
         latestStats
       );

       for (const alert of alerts) {
         await prisma.facilityAlert.create({
           data: alert
         });
       }
     }
   }
   ```

**このPhaseで動作する機能**:
- ✅ 法人全体KPI表示（実データ）
- ✅ 前月比較表示
- ✅ アラート自動検知
- ✅ アラート一覧表示

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
CorporateAgendaDashboard
  ↓ 表示
ハードコードデータ
  - 10施設（ダミー）
  - KPI（ダミー）
  - アラート（ダミー）
```

### Phase 1完了後
```
CorporateAgendaDashboard
  ↓ 表示
Facility（キャッシュ） ← 医療システム Facility Master API
統計データ: ダミーのまま
```

### Phase 2完了後
```
CorporateAgendaDashboard
  ↓ 表示
Facility（キャッシュ） ← 医療システム API
FacilityStatistics（実データ） ← 日次バッチ ← Post + User
```

### Phase 3完了後
```
CorporateAgendaDashboard
  ↓ 表示
Facility（キャッシュ） ← 医療システム API
FacilityStatistics（実データ） ← 日次バッチ
CorporateKPI（実データ） ← 日次バッチ ← FacilityStatistics集計
FacilityAlert（実データ） ← アラート検知バッチ ← FacilityStatistics
```

---

## ✅ チェックリスト

### 医療システム側の実装

#### Phase 1
- [ ] FacilityMasterテーブル確認（DB構築計画書に既存）
- [ ] GET /api/facilities 実装
- [ ] GET /api/facilities/:id/employee-count 実装
- [ ] 単体テスト作成
- [ ] API仕様書更新

### VoiceDrive側の実装

#### Phase 1
- [ ] Facilityテーブル追加
- [ ] マイグレーション実行
- [ ] 施設マスタ同期機能実装
- [ ] CorporateAgendaDashboardページで表示確認

#### Phase 2
- [ ] FacilityStatisticsテーブル追加
- [ ] マイグレーション実行
- [ ] 統計計算サービス実装
- [ ] 日次バッチ実装
- [ ] CorporateAgendaDashboardページのダミーデータを削除
- [ ] 実データ表示に変更

#### Phase 3
- [ ] CorporateKPIテーブル追加
- [ ] FacilityAlertテーブル追加
- [ ] AlertThresholdテーブル追加
- [ ] マイグレーション実行
- [ ] 法人全体KPI計算実装
- [ ] アラート検知実装
- [ ] CorporateAgendaDashboardページ最終調整

### テスト
- [ ] 施設マスタ同期テスト
- [ ] 統計計算精度テスト
- [ ] ヘルススコア計算テスト
- [ ] アラート検知テスト
- [ ] パフォーマンステスト（10施設×1年分データ）
- [ ] E2Eテスト（CorporateAgendaDashboard全機能）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)

---

**文書終了**

最終更新: 2025年10月22日
バージョン: 1.0
次回レビュー: Phase 1実装後
