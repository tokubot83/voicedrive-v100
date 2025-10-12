# プロジェクト人材分析ページ DB要件分析

**文書番号**: DB-REQ-2025-1012-002
**作成日**: 2025年10月12日
**対象ページ**: http://localhost:3001/project-talent-analytics
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- C:\projects\voicedrive-v100\src\pages\ProjectTalentAnalyticsPage.tsx

---

## 📋 分析サマリー

### 結論
プロジェクト人材分析ページは**プロジェクト参加データと職員マスタデータを組み合わせた集計・分析機能**ですが、以下の**重大な不足項目**と**推奨追加項目**があります。

### 🔴 重大な不足項目（即対応必要）

1. **`ProjectTeamMember`の部門・職種・世代データ不足**
   - プロジェクトメンバーテーブルに職員の部門・職種・世代情報が直接的に存在しない
   - User経由のJOINで取得可能だが、パフォーマンスと医療システムとの責任分界点が不明確

2. **プロジェクト参加統計の集計テーブル不足**
   - 総参加者数、平均参加数、多様性スコア、成長率の計算
   - 現在ダミーデータ（38-66行目）
   - 実データ集計のための専用テーブルまたはマテリアライズドビューが必要

3. **世代データ（年齢・生年月日）の管理方針未確定**
   - PersonalStationで`experienceYears`（経験年数）は医療システムから提供
   - 世代別分析のための生年月日は医療システム管理だが、VoiceDriveへの提供方針が未決定

4. **多様性スコア（diversityScore）の計算ロジック未定義**
   - 職種・世代・階層の多様性を0-100点で評価する指標
   - 計算アルゴリズムとデータソースが未定義

---

## 🔍 詳細分析

### 1. 概要タブ: メトリクスカード（71-115行目）

#### 表示内容
```typescript
metrics: {
  totalParticipants: 487,        // 総参加者数
  averageProjectsPerPerson: 2.3, // 平均参加数
  diversityScore: 78,             // 多様性スコア（0-100）
  growthRate: 12.5                // 成長率（前期比%）
}
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|------------|--------------|---------|------|
| `totalParticipants` | 🟡 計算 | ❌ 不要 | VoiceDrive | `ProjectTeamMember`から集計 | 🔴 **要集計機能追加** |
| `averageProjectsPerPerson` | 🟡 計算 | ❌ 不要 | VoiceDrive | `ProjectTeamMember`から集計 | 🔴 **要集計機能追加** |
| `diversityScore` | 🟡 計算 | 🟡 職員属性 | VoiceDrive（計算）+ 医療システム（データ） | 複合計算 | 🔴 **要ロジック定義** |
| `growthRate` | 🟡 計算 | ❌ 不要 | VoiceDrive | 前期比較集計 | 🔴 **要集計機能追加** |

#### 解決策1: プロジェクト参加統計集計テーブルの追加

**新規テーブル: `ProjectParticipationStats`**
```prisma
// VoiceDrive: prisma/schema.prisma
model ProjectParticipationStats {
  id                      String    @id @default(cuid())

  // 集計期間
  periodType              String                                // 'month' | 'quarter' | 'year'
  periodStart             DateTime  @map("period_start")
  periodEnd               DateTime  @map("period_end")

  // 全体統計
  totalParticipants       Int       @default(0) @map("total_participants")
  totalProjects           Int       @default(0) @map("total_projects")
  averageProjectsPerPerson Float    @default(0) @map("avg_projects_per_person")

  // 多様性スコア（0-100）
  diversityScore          Float     @default(0) @map("diversity_score")
  professionDiversityScore Float    @default(0) @map("profession_diversity_score")
  generationDiversityScore Float    @default(0) @map("generation_diversity_score")
  hierarchyDiversityScore Float    @default(0) @map("hierarchy_diversity_score")

  // 成長率（前期比%）
  growthRate              Float?    @map("growth_rate")
  participantGrowthRate   Float?    @map("participant_growth_rate")
  projectGrowthRate       Float?    @map("project_growth_rate")

  // 集計タイムスタンプ
  calculatedAt            DateTime  @default(now()) @map("calculated_at")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart, periodEnd])
  @@index([periodType])
  @@index([periodStart, periodEnd])
  @@map("project_participation_stats")
}
```

**集計ロジック（VoiceDrive側で実装）**:
```typescript
// src/services/ProjectAnalyticsService.ts
export async function calculateParticipationStats(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<ProjectParticipationStatsData> {

  // 1. 期間内のプロジェクトメンバーを集計
  const members = await prisma.projectTeamMember.findMany({
    where: {
      joinedAt: { gte: periodStart, lte: periodEnd },
      leftAt: null, // アクティブメンバーのみ
    },
    include: {
      user: {
        select: {
          professionCategory: true,
          hierarchyLevel: true,
          department: true,
        }
      },
      project: {
        select: {
          status: true,
        }
      }
    }
  });

  // 2. ユニーク参加者数を計算
  const uniqueUsers = new Set(members.map(m => m.userId));
  const totalParticipants = uniqueUsers.size;

  // 3. プロジェクト数を計算
  const uniqueProjects = new Set(members.map(m => m.projectId));
  const totalProjects = uniqueProjects.size;

  // 4. 平均参加数を計算
  const projectCounts = new Map<string, number>();
  members.forEach(m => {
    projectCounts.set(m.userId, (projectCounts.get(m.userId) || 0) + 1);
  });
  const averageProjectsPerPerson = totalParticipants > 0
    ? Array.from(projectCounts.values()).reduce((a, b) => a + b, 0) / totalParticipants
    : 0;

  // 5. 多様性スコアを計算（後述）
  const diversityScore = await calculateDiversityScore(members);

  // 6. 成長率を計算（前期比較）
  const previousPeriod = getPreviousPeriod(periodType, periodStart);
  const previousStats = await prisma.projectParticipationStats.findUnique({
    where: {
      periodType_periodStart_periodEnd: {
        periodType,
        periodStart: previousPeriod.start,
        periodEnd: previousPeriod.end,
      }
    }
  });

  const growthRate = previousStats && previousStats.totalParticipants > 0
    ? ((totalParticipants - previousStats.totalParticipants) / previousStats.totalParticipants) * 100
    : 0;

  return {
    totalParticipants,
    totalProjects,
    averageProjectsPerPerson,
    diversityScore: diversityScore.overall,
    professionDiversityScore: diversityScore.profession,
    generationDiversityScore: diversityScore.generation,
    hierarchyDiversityScore: diversityScore.hierarchy,
    growthRate,
  };
}
```

---

### 2. 概要タブ: 職種別プロジェクト参加状況（117-139行目）

#### 表示内容
```typescript
professionData = [
  { profession: '看護師', count: 245, percentage: 50.3 },
  { profession: '医師', count: 42, percentage: 8.6 },
  { profession: '薬剤師', count: 38, percentage: 7.8 },
  // ...
]
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|------------|--------------|---------|------|
| `profession`（職種名） | ❌ | ✅ マスタ | 医療システム | `JobCategory`マスタ | ✅ OK |
| `count`（職種別参加者数） | 🟡 計算 | ❌ | VoiceDrive | `ProjectTeamMember` + `User`から集計 | 🔴 **要集計機能** |
| `percentage`（割合） | 🟡 計算 | ❌ | VoiceDrive | ローカル計算 | ✅ OK |

#### 解決策2: 職種別参加統計テーブルの追加

**新規テーブル: `ProjectParticipationByProfession`**
```prisma
// VoiceDrive: prisma/schema.prisma
model ProjectParticipationByProfession {
  id                String    @id @default(cuid())

  // 集計期間
  periodType        String                                // 'month' | 'quarter' | 'year'
  periodStart       DateTime  @map("period_start")
  periodEnd         DateTime  @map("period_end")

  // 職種情報（医療システムから取得してキャッシュ）
  professionCode    String    @map("profession_code")      // 'nurse' | 'doctor' | ...
  professionName    String    @map("profession_name")      // '看護師' | '医師' | ...
  professionGroup   String    @map("profession_group")     // 'medical' | 'nursing' | 'allied' | 'admin'

  // 統計データ
  participantCount  Int       @default(0) @map("participant_count")
  projectCount      Int       @default(0) @map("project_count")
  averageProjects   Float     @default(0) @map("average_projects")
  percentage        Float     @default(0) @map("percentage")

  // タイムスタンプ
  calculatedAt      DateTime  @default(now()) @map("calculated_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@unique([periodType, periodStart, periodEnd, professionCode])
  @@index([periodType])
  @@index([professionCode])
  @@map("project_participation_by_profession")
}
```

**集計ロジック**:
```typescript
// src/services/ProjectAnalyticsService.ts
export async function calculateProfessionParticipation(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<ProjectParticipationByProfessionData[]> {

  // 1. 期間内のプロジェクトメンバーを職種ごとに集計
  const members = await prisma.projectTeamMember.findMany({
    where: {
      joinedAt: { gte: periodStart, lte: periodEnd },
      leftAt: null,
    },
    include: {
      user: {
        select: {
          professionCategory: true,
        }
      }
    }
  });

  // 2. 職種別にグループ化
  const professionMap = new Map<string, Set<string>>();
  members.forEach(m => {
    const profession = m.user.professionCategory || 'その他';
    if (!professionMap.has(profession)) {
      professionMap.set(profession, new Set());
    }
    professionMap.get(profession)!.add(m.userId);
  });

  // 3. 総参加者数を計算
  const totalParticipants = new Set(members.map(m => m.userId)).size;

  // 4. 職種ごとの統計を生成
  const result: ProjectParticipationByProfessionData[] = [];
  for (const [professionCode, userSet] of professionMap.entries()) {
    const count = userSet.size;
    const percentage = totalParticipants > 0 ? (count / totalParticipants) * 100 : 0;

    // 医療システムから職種名を取得（キャッシュ）
    const professionName = await getProfessionName(professionCode);

    result.push({
      professionCode,
      professionName,
      participantCount: count,
      percentage,
    });
  }

  return result.sort((a, b) => b.participantCount - a.participantCount);
}
```

#### 医療システムへの依頼
```typescript
// 医療システムAPI: 職種マスタ取得
GET /api/v2/professions
Response: [
  {
    professionCode: "nurse",
    professionName: "看護師",
    professionGroup: "nursing",
    requiresLicense: true
  },
  {
    professionCode: "doctor",
    professionName: "医師",
    professionGroup: "medical",
    requiresLicense: true
  },
  // ...
]
```

---

### 3. 概要タブ: 世代別プロジェクト参加状況（141-158行目）

#### 表示内容
```typescript
generationData = [
  { generation: '20代', count: 142, percentage: 29.2, growth: '+15%' },
  { generation: '30代', count: 189, percentage: 38.8, growth: '+8%' },
  { generation: '40代', count: 112, percentage: 23.0, growth: '+5%' },
  { generation: '50代以上', count: 44, percentage: 9.0, growth: '+22%' },
]
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|------------|--------------|---------|------|
| `generation`（世代区分） | 🟡 計算 | ❌ | VoiceDrive | 生年月日から算出 | 🔴 **生年月日データ不足** |
| `count`（世代別参加者数） | 🟡 計算 | ❌ | VoiceDrive | `ProjectTeamMember` + `User`から集計 | 🔴 **生年月日データ不足** |
| `percentage`（割合） | 🟡 計算 | ❌ | VoiceDrive | ローカル計算 | ✅ OK |
| `growth`（前期比成長率） | 🟡 計算 | ❌ | VoiceDrive | 前期比較集計 | 🔴 **生年月日データ不足** |

#### 解決策3: 生年月日データの提供方法を確定

**問題**:
- 世代別分析には生年月日（`dateOfBirth`）が必要
- データ管理責任分界点定義書（214行目）によると、生年月日は**個人情報のため医療システム管理、VoiceDrive不要**
- しかし、世代別分析機能では生年月日または年齢データが必須

**3つの選択肢**:

#### 選択肢A: 年齢データのみを医療システムから提供（推奨）+ データ同意システム連携

**🔐 重要**: VoiceDriveには**データ同意システム**が既に実装済みです。
- 初回投稿時（議題モード・プロジェクトモード共通）に同意取得
- `DataConsent`テーブルで同意状況を管理
- `analyticsConsent = true`の職員のみ、年齢データを使用

**医療システムAPI追加**:
```typescript
// GET /api/v2/employees/{employeeId}/age
Response: {
  age: 34,                    // 現在の年齢
  generation: "30代",         // 世代区分（医療システム側で計算）
  calculatedAt: "2025-10-12"
}
```

**VoiceDrive Userテーブルに追加** (✅ 既に実装済み):
```prisma
model User {
  // ... 既存フィールド
  age            Int?      @map("age")                // キャッシュ（医療システムから週次更新）
  generation     String?   @map("generation")         // キャッシュ（"20代", "30代", ...）
  ageUpdatedAt   DateTime? @map("age_updated_at")     // 年齢更新日時
}
```

**VoiceDrive DataConsentテーブル** (✅ 既に実装済み):
```prisma
model DataConsent {
  userId                  String    @unique
  analyticsConsent        Boolean   @default(false)     // 分析同意
  analyticsConsentDate    DateTime?
  // ...
}
```

**年齢データ同期ロジック（週次バッチ）**:
```typescript
// src/jobs/sync-employee-age.ts
export async function syncEmployeeAge() {
  // 1. 分析同意済みの職員のみ取得
  const consentedUsers = await prisma.dataConsent.findMany({
    where: { analyticsConsent: true },
    include: { user: true }
  });

  // 2. 医療システムから年齢データを取得（同意済み職員のみ）
  const employeeIds = consentedUsers.map(c => c.userId);
  const ageData = await medicalSystemAPI.getEmployeeAgeBatch(employeeIds);

  // 3. Userテーブルを更新
  for (const data of ageData) {
    await prisma.user.update({
      where: { employeeId: data.employeeId },
      data: {
        age: data.age,
        generation: data.generation,
        ageUpdatedAt: new Date(),
      }
    });
  }
}
```

**世代別集計ロジック（同意済み職員のみ）**:
```typescript
// src/services/ProjectAnalyticsService.ts
export async function calculateGenerationParticipation(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<GenerationParticipationData[]> {

  // 1. 期間内のプロジェクトメンバーを取得
  const members = await prisma.projectTeamMember.findMany({
    where: {
      joinedAt: { gte: periodStart, lte: periodEnd },
      leftAt: null,
    },
    include: {
      user: {
        select: {
          age: true,
          generation: true,
          employeeId: true,
        }
      }
    }
  });

  // 2. 分析同意済み職員のみフィルタリング
  const consentedEmployeeIds = await prisma.dataConsent.findMany({
    where: { analyticsConsent: true },
    select: { userId: true }
  });
  const consentedIdSet = new Set(consentedEmployeeIds.map(c => c.userId));

  const consentedMembers = members.filter(m =>
    consentedIdSet.has(m.user.employeeId) && m.user.generation
  );

  // 3. 世代別にグループ化
  const generationMap = new Map<string, number>();
  consentedMembers.forEach(m => {
    const gen = m.user.generation || '不明';
    generationMap.set(gen, (generationMap.get(gen) || 0) + 1);
  });

  // 4. 未同意職員は「データ非公開」としてカウント（オプション）
  const nonConsentedCount = members.length - consentedMembers.length;
  if (nonConsentedCount > 0) {
    generationMap.set('データ非公開', nonConsentedCount);
  }

  // 5. 結果を返却
  const result: GenerationParticipationData[] = [];
  for (const [generation, count] of generationMap.entries()) {
    result.push({
      generation,
      count,
      percentage: (count / members.length) * 100,
    });
  }

  return result.sort((a, b) => b.count - a.count);
}
```

**メリット**:
- ✅ 個人情報（生年月日）をVoiceDrive側に保存しない
- ✅ 世代別分析に必要なデータのみを取得
- ✅ 医療システム側で世代区分ロジックを一元管理
- ✅ **データ同意システムと連携し、同意済み職員のみ分析対象**
- ✅ **未同意職員のプライバシーを完全保護**

**デメリット**:
- ⚠️ 年齢データの定期更新（週次バッチ）が必要
- ⚠️ リアルタイム性が低い
- ⚠️ 未同意職員は世代別統計から除外される（分析精度への影響）

---

#### 選択肢B: 生年月日をVoiceDriveでハッシュ化して保存

**医療システムAPI追加**:
```typescript
// GET /api/v2/employees/{employeeId}/birthdate-hash
Response: {
  birthYearHash: "a3f7c9d2e1...",  // SHA256(生年のみ + システムシークレット)
  generation: "30代"
}
```

**VoiceDrive Userテーブルに追加**:
```prisma
model User {
  // ... 既存フィールド
  birthYearHash  String?   @map("birth_year_hash")    // 生年のハッシュ値
  generation     String?   @map("generation")         // "20代", "30代", ...
}
```

**メリット**:
- ✅ 個人情報を平文で保存しない
- ✅ 年齢推定は可能（生年のみ）

**デメリット**:
- ⚠️ セキュリティ複雑化
- ⚠️ 年齢の精度が年単位（月日がない）

---

#### 選択肢C: 世代別分析を医療システム側で実装

**アーキテクチャ変更**:
- VoiceDriveは`ProjectTeamMember`の生データのみを提供
- 医療システムが世代別分析を実施
- 結果をVoiceDriveに返却

**メリット**:
- ✅ 個人情報はすべて医療システム内で完結
- ✅ VoiceDrive側のデータ保護要件が簡素化

**デメリット**:
- ⚠️ API呼び出しのオーバーヘッド増加
- ⚠️ 医療システム側の開発工数増加

---

**推奨**: **選択肢A（年齢データのみ提供 + データ同意システム連携）**
- 個人情報保護とデータ分析のバランスが最適
- VoiceDrive側の実装が最もシンプル
- 医療システム側の負荷も低い
- **既存のデータ同意システムと完全連携**
- 同意済み職員のみ分析対象とし、未同意職員のプライバシーを完全保護

---

### 4. 部門別分布タブ: 部門別プロジェクト参加状況（161-193行目）

#### 表示内容
```typescript
departmentData: DepartmentParticipation[] = [
  {
    department: '看護部',
    totalMembers: 320,        // 部門総人数
    activeParticipants: 245,  // プロジェクト参加者数
    participationRate: 76.6,  // 参加率（%）
    averageProjects: 2.5      // 平均参加プロジェクト数
  },
  // ...
]
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|------------|--------------|---------|------|
| `department`（部門名） | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `totalMembers`（部門総人数） | ❌ | ✅ マスタ | 医療システム | API | 🔴 **API未実装** |
| `activeParticipants`（参加者数） | 🟡 計算 | ❌ | VoiceDrive | `ProjectTeamMember`から集計 | 🔴 **要集計機能** |
| `participationRate`（参加率） | 🟡 計算 | ❌ | VoiceDrive | ローカル計算 | 🟡 totalMembers依存 |
| `averageProjects`（平均参加数） | 🟡 計算 | ❌ | VoiceDrive | `ProjectTeamMember`から集計 | 🔴 **要集計機能** |

#### 解決策4: 部門別人数APIの提供依頼（医療システム側）

**医療システムAPI追加**:
```typescript
// GET /api/v2/departments/headcount
Response: [
  {
    departmentId: "DEPT-NS",
    departmentName: "看護部",
    facilityId: "FAC001",
    totalMembers: 320,
    activeMembers: 298,        // 休職・休暇除く
    retiredMembers: 22,
    calculatedAt: "2025-10-12"
  },
  // ...
]
```

**VoiceDrive集計ロジック**:
```typescript
// src/services/ProjectAnalyticsService.ts
export async function calculateDepartmentParticipation(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<DepartmentParticipationData[]> {

  // 1. 医療システムから部門別人数を取得
  const departmentHeadcount = await fetchDepartmentHeadcount();

  // 2. VoiceDriveのプロジェクト参加データを集計
  const members = await prisma.projectTeamMember.findMany({
    where: {
      joinedAt: { gte: periodStart, lte: periodEnd },
      leftAt: null,
    },
    include: {
      user: {
        select: {
          department: true,
        }
      }
    }
  });

  // 3. 部門ごとにグループ化
  const deptMap = new Map<string, Set<string>>();
  members.forEach(m => {
    const dept = m.user.department || '未設定';
    if (!deptMap.has(dept)) {
      deptMap.set(dept, new Set());
    }
    deptMap.get(dept)!.add(m.userId);
  });

  // 4. 部門別統計を生成
  const result: DepartmentParticipationData[] = [];
  for (const deptInfo of departmentHeadcount) {
    const activeParticipants = deptMap.get(deptInfo.departmentName)?.size || 0;
    const participationRate = deptInfo.totalMembers > 0
      ? (activeParticipants / deptInfo.totalMembers) * 100
      : 0;

    // 平均参加プロジェクト数を計算
    const deptMembers = members.filter(m => m.user.department === deptInfo.departmentName);
    const projectCounts = new Map<string, number>();
    deptMembers.forEach(m => {
      projectCounts.set(m.userId, (projectCounts.get(m.userId) || 0) + 1);
    });
    const averageProjects = activeParticipants > 0
      ? Array.from(projectCounts.values()).reduce((a, b) => a + b, 0) / activeParticipants
      : 0;

    result.push({
      department: deptInfo.departmentName,
      totalMembers: deptInfo.totalMembers,
      activeParticipants,
      participationRate,
      averageProjects,
    });
  }

  return result.sort((a, b) => b.participationRate - a.participationRate);
}
```

---

### 5. 多様性スコア（diversityScore）の計算ロジック

#### 定義
多様性スコアは、プロジェクトチームにおける職種・世代・階層の多様性を0-100点で評価する指標。

#### 計算方法（推奨）

**Simpson's Diversity Index（シンプソンの多様性指数）を応用**:

```typescript
// src/services/DiversityCalculator.ts
export function calculateDiversityScore(
  members: ProjectTeamMemberWithUser[]
): DiversityScoreResult {

  // 1. 職種多様性（Profession Diversity）
  const professionCounts = new Map<string, number>();
  members.forEach(m => {
    const profession = m.user.professionCategory || 'その他';
    professionCounts.set(profession, (professionCounts.get(profession) || 0) + 1);
  });
  const professionDiversity = calculateSimpsonIndex(professionCounts, members.length);

  // 2. 世代多様性（Generation Diversity）
  const generationCounts = new Map<string, number>();
  members.forEach(m => {
    const generation = m.user.generation || '不明';
    generationCounts.set(generation, (generationCounts.get(generation) || 0) + 1);
  });
  const generationDiversity = calculateSimpsonIndex(generationCounts, members.length);

  // 3. 階層多様性（Hierarchy Diversity）
  const hierarchyCounts = new Map<number, number>();
  members.forEach(m => {
    const level = m.user.hierarchyLevel || 1;
    hierarchyCounts.set(level, (hierarchyCounts.get(level) || 0) + 1);
  });
  const hierarchyDiversity = calculateSimpsonIndex(hierarchyCounts, members.length);

  // 4. 総合多様性スコア（重み付け平均）
  const overall = (
    professionDiversity * 0.4 +    // 職種が最も重要（40%）
    generationDiversity * 0.35 +   // 世代も重要（35%）
    hierarchyDiversity * 0.25      // 階層は補助的（25%）
  );

  return {
    overall: Math.round(overall),
    profession: Math.round(professionDiversity),
    generation: Math.round(generationDiversity),
    hierarchy: Math.round(hierarchyDiversity),
  };
}

// Simpson's Diversity Indexを計算（0-100スケール）
function calculateSimpsonIndex(
  counts: Map<any, number>,
  total: number
): number {
  if (total <= 1) return 0;

  let sumSquares = 0;
  for (const count of counts.values()) {
    const proportion = count / total;
    sumSquares += proportion * proportion;
  }

  // Simpson's Index: D = 1 - Σ(p_i^2)
  // 0 = 完全に均一（多様性なし）、1 = 完全に多様
  const simpsonIndex = 1 - sumSquares;

  // 0-100スケールに変換
  return simpsonIndex * 100;
}
```

**多様性スコアの解釈**:
- **90-100**: 極めて高い多様性（理想的なチーム構成）
- **70-89**: 高い多様性（良好なチーム構成）
- **50-69**: 中程度の多様性（改善の余地あり）
- **30-49**: 低い多様性（偏りが大きい）
- **0-29**: 極めて低い多様性（多様性がほぼない）

---

## 🎯 不足項目まとめ

### VoiceDrive側で追加が必要なもの

#### 1. 新規テーブル（3件）

| テーブル名 | 目的 | 優先度 |
|----------|------|--------|
| `ProjectParticipationStats` | プロジェクト参加統計（全体） | 🔴 HIGH |
| `ProjectParticipationByProfession` | 職種別参加統計 | 🟡 MEDIUM |
| `ProjectParticipationByDepartment` | 部門別参加統計（オプション） | 🟢 LOW |

#### 2. 既存テーブルへのフィールド追加（1件）

| テーブル名 | 追加フィールド | 目的 | 優先度 |
|----------|--------------|------|--------|
| `User` | `age`, `generation`, `ageUpdatedAt` | 世代別分析 | 🔴 HIGH |

#### 3. 集計サービス実装（4件）

| サービス名 | 目的 | 優先度 |
|----------|------|--------|
| `ProjectAnalyticsService.calculateParticipationStats()` | 全体統計計算 | 🔴 HIGH |
| `ProjectAnalyticsService.calculateProfessionParticipation()` | 職種別統計 | 🔴 HIGH |
| `ProjectAnalyticsService.calculateDepartmentParticipation()` | 部門別統計 | 🔴 HIGH |
| `DiversityCalculator.calculateDiversityScore()` | 多様性スコア計算 | 🟡 MEDIUM |

---

### 医療システム側で提供が必要なもの

#### 1. 新規API（3件）

| API | エンドポイント | 目的 | 優先度 |
|-----|--------------|------|--------|
| 職種マスタ取得 | `GET /api/v2/professions` | 職種名の表示 | 🔴 HIGH |
| 部門別人数取得 | `GET /api/v2/departments/headcount` | 参加率計算 | 🔴 HIGH |
| 年齢・世代取得 | `GET /api/v2/employees/{employeeId}/age` | 世代別分析 | 🔴 HIGH |

#### 2. データ提供方針の確定（1件）

| 確認事項 | 詳細 | 優先度 |
|---------|------|--------|
| 生年月日データの提供方法 | 選択肢A（年齢のみ）を推奨 | 🔴 HIGH |

---

## 📊 データフロー図

```
┌──────────────────────────────────────────────────────────────┐
│                     医療システム                              │
│                                                              │
│  ┌───────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │  Employee     │   │  Department  │   │ JobCategory  │   │
│  │  テーブル     │   │  マスタ      │   │  マスタ      │   │
│  └───────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│          │                  │                  │           │
│          ▼                  ▼                  ▼           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          API Layer (医療システム)                     │   │
│  │  - GET /api/v2/professions                         │   │
│  │  - GET /api/v2/departments/headcount               │   │
│  │  - GET /api/v2/employees/{id}/age                  │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              │ API呼び出し（JWT認証）
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       VoiceDrive                             │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                  User テーブル                        │   │
│  │  - age (キャッシュ)                                  │   │
│  │  - generation (キャッシュ)                           │   │
│  │  - department (キャッシュ)                           │   │
│  │  - professionCategory (キャッシュ)                   │   │
│  └───────────────┬───────────────────────────────────────┘   │
│                  │                                           │
│                  ▼                                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │         ProjectTeamMember テーブル                    │   │
│  │  - projectId, userId, role                           │   │
│  │  - joinedAt, leftAt                                  │   │
│  └───────────────┬───────────────────────────────────────┘   │
│                  │                                           │
│                  ▼                                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │      ProjectAnalyticsService (集計ロジック)          │   │
│  │  - calculateParticipationStats()                     │   │
│  │  - calculateProfessionParticipation()                │   │
│  │  - calculateDepartmentParticipation()                │   │
│  │  - calculateDiversityScore()                         │   │
│  └───────────────┬───────────────────────────────────────┘   │
│                  │                                           │
│                  ▼                                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │   ProjectParticipationStats テーブル (集計結果)      │   │
│  │  - totalParticipants                                 │   │
│  │  - averageProjectsPerPerson                          │   │
│  │  - diversityScore                                    │   │
│  │  - growthRate                                        │   │
│  └───────────────┬───────────────────────────────────────┘   │
│                  │                                           │
│                  ▼                                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │       ProjectTalentAnalyticsPage (UI)                │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 実装優先度

### Phase 1: 基本データ取得（優先度: 🔴 HIGH）
**目標**: 2025年10月末まで

1. **医療システムAPI実装（医療チーム）**:
   - `GET /api/v2/professions` - 職種マスタ取得
   - `GET /api/v2/departments/headcount` - 部門別人数取得
   - `GET /api/v2/employees/{id}/age` - 年齢・世代取得

2. **VoiceDrive User拡張（VoiceDriveチーム）**:
   - `age`, `generation`, `ageUpdatedAt`フィールド追加
   - 医療システムからのデータ同期バッチ実装（週次）

### Phase 2: 集計機能実装（優先度: 🔴 HIGH）
**目標**: 2025年11月中旬まで

1. **VoiceDrive集計テーブル追加**:
   - `ProjectParticipationStats`
   - `ProjectParticipationByProfession`

2. **集計サービス実装**:
   - `ProjectAnalyticsService.calculateParticipationStats()`
   - `ProjectAnalyticsService.calculateProfessionParticipation()`
   - `ProjectAnalyticsService.calculateDepartmentParticipation()`

3. **バッチ処理実装**:
   - 日次集計バッチ（深夜2:00実行）
   - 月次・四半期・年次集計

### Phase 3: 多様性スコア実装（優先度: 🟡 MEDIUM）
**目標**: 2025年11月末まで

1. **DiversityCalculatorサービス実装**:
   - Simpson's Diversity Indexアルゴリズム実装
   - 職種・世代・階層の重み付け調整

2. **UIへの統合**:
   - 多様性スコアカード表示
   - 多様性の内訳グラフ表示

### Phase 4: 高度な分析機能（優先度: 🟢 LOW）
**目標**: 2025年12月末まで

1. **参加トレンドグラフ実装**（195-205行目）
2. **人材育成効果分析**（207-217行目）
3. **レポート出力機能**

---

## 📝 確認事項（医療システムチームへ）

### 🔴 緊急確認事項

1. **生年月日データの提供方法（データ同意システム連携）**
   - 選択肢A（年齢のみ + データ同意連携）、選択肢B（ハッシュ化）、選択肢Cのいずれを採用するか？
   - **推奨: 選択肢A（年齢のみ提供 + `analyticsConsent = true`の職員のみ）**
   - ⚠️ 医療システムAPIは、**VoiceDriveから提供される同意済み職員IDリストのみ**を対象に年齢データを返却

2. **部門別人数APIの実装可能時期**
   - `GET /api/v2/departments/headcount`の実装スケジュールは？
   - Phase 1完了までに提供可能か？

3. **職種マスタAPIの実装可能時期**
   - `GET /api/v2/professions`の実装スケジュールは？
   - Phase 1完了までに提供可能か？

### 🟡 中期確認事項

1. **年齢データの更新頻度**
   - 週次バッチで問題ないか？
   - 月初更新でも可能か？

2. **多様性スコアの計算ロジック承認**
   - Simpson's Diversity Indexを使用することに問題ないか？
   - 職種・世代・階層の重み付け（40%・35%・25%）は適切か？

---

## 📚 参考資料

- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- Simpson's Diversity Index: https://en.wikipedia.org/wiki/Diversity_index#Simpson_index

---

**文書ステータス**: ✅ 初版完成
**次のアクション**: 医療システムチームへの確認依頼
**レビュー期限**: 2025年10月15日
