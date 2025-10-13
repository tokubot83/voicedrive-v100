# ProjectParticipationRecommendationページ DB要件分析

**文書番号**: DB-REQ-2025-1012-002
**作成日**: 2025年10月12日
**対象ページ**: https://voicedrive-v100.vercel.app/project-participation-recommendation
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
ProjectParticipationRecommendationページは**人事管理者（Level 15+）向けのプロジェクト参加推奨機能**で、以下の**重大な不足項目**があります。

### 🔴 重大な不足項目（即対応必要）

1. **職員スキルマスタ・スキル評価データの連携不足**
   - スキルマッチング分析（259-290行目）に必要
   - 医療システムの`EmployeeSkill`テーブルとの連携が未定義

2. **プロジェクト参加履歴テーブル不足**
   - 参加率が低い職員の特定（165-257行目）に必要
   - `ProjectTeamMember`は存在するが、参加統計の集計テーブルが不足

3. **職員経験情報の不足**
   - PersonalStationと同様に`experienceYears`が必要
   - スキルマッチングの精度向上に必須

4. **チーム多様性スコア計算テーブル不足**
   - 多様性向上推奨（292-344行目）に必要
   - 職種構成比の分析・最適化データが不足

---

## 🔍 詳細分析

### 1. ページ概要（1-9行目）

#### 機能説明
```typescript
/**
 * プロジェクト参加推奨ページ（Level 15+：人事各部門長以上）
 *
 * 職員のスキル・経験に基づいたプロジェクト参加推奨
 * - 参加率が低い職員への推奨プロジェクト提案
 * - スキルマッチング分析
 * - チーム多様性向上のための推奨
 * - プロジェクト経験の偏り是正
 */
```

#### アクセス権限
| 項目 | 値 | データソース | 状態 |
|------|-----|-------------|------|
| 最小権限レベル | Level 15+ | User.permissionLevel | ✅ OK |
| 対象ユーザー | 人事各部門長以上 | User.position | ✅ OK |

**評価**: ✅ 権限制御は既存の`User`テーブルで対応可能

---

### 2. タブ構造（15行目、397-417行目）

#### 4つのタブ
```typescript
type TabType = 'low_participation' | 'skill_match' | 'diversity' | 'experience_gap';
```

| タブID | 表示名 | 機能 | データ要件 |
|--------|--------|------|-----------|
| `low_participation` | 参加率低 | 参加率が低い職員のリスト | 🔴 **新規テーブル必要** |
| `skill_match` | スキルマッチ | スキル保有者とプロジェクトのマッチング | 🔴 **医療システム連携必要** |
| `diversity` | 多様性向上 | チーム構成の多様性分析 | 🔴 **新規集計テーブル必要** |
| `experience_gap` | 経験偏り | 経験の偏り分析（実装予定） | 🟡 **今後実装** |

---

### 3. 参加率が低い職員推奨（165-257行目）

#### 表示内容
```typescript
interface StaffRecommendation {
  staffId: string;           // 職員ID
  name: string;              // 氏名
  department: string;        // 部署
  profession: string;        // 職種
  currentProjects: number;   // 現在の参加数
  recommendedProjects: RecommendedProject[];  // 推奨プロジェクト
  reason: string;            // 推奨理由
  priority: 'high' | 'medium' | 'low';  // 優先度
}
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `staffId` | ✅ User.employeeId | ✅ マスタ | 医療システム | Webhook/API | ✅ OK |
| `name` | ✅ User.name | ✅ マスタ | 医療システム | Webhook/API | ✅ OK |
| `department` | ✅ User.department | ✅ マスタ | 医療システム | Webhook/API | ✅ OK |
| `profession` | ✅ User.professionCategory | ✅ マスタ | 医療システム | Webhook/API | ✅ OK |
| `currentProjects` | ❌ **集計必要** | ❌ | VoiceDrive | 集計テーブル | 🔴 **要追加** |
| `recommendedProjects` | ❌ **計算必要** | ❌ | VoiceDrive | マッチングロジック | 🔴 **要実装** |
| `priority` | ❌ **計算必要** | ❌ | VoiceDrive | 計算ロジック | 🔴 **要実装** |

#### 統計サマリーカード（168-190行目）
```typescript
<div>参加なし（6ヶ月）: 28名</div>
<div>参加率低（平均以下）: 67名</div>
<div>推奨送信済み: 42件</div>
```

**必要な集計データ**:
- 過去6ヶ月のプロジェクト参加履歴
- 部門別の平均参加率
- 推奨送信履歴

#### 解決策1: プロジェクト参加統計テーブル追加

**新規テーブル: `StaffProjectParticipationStats`**
```prisma
// VoiceDrive: prisma/schema.prisma
model StaffProjectParticipationStats {
  id                        String    @id @default(cuid())
  userId                    String    @unique @map("user_id")

  // 参加統計
  totalProjectsJoined       Int       @default(0) @map("total_projects_joined")
  activeProjects            Int       @default(0) @map("active_projects")
  completedProjects         Int       @default(0) @map("completed_projects")

  // 期間別統計
  projectsLast6Months       Int       @default(0) @map("projects_last_6months")
  projectsThisYear          Int       @default(0) @map("projects_this_year")

  // 参加率指標
  participationRate         Float     @default(0) @map("participation_rate")
  departmentAvgRate         Float     @default(0) @map("department_avg_rate")
  isBelowAverage            Boolean   @default(false) @map("is_below_average")

  // 最終参加日
  lastJoinedAt              DateTime? @map("last_joined_at")
  daysSinceLastJoin         Int?      @map("days_since_last_join")

  // 推奨送信履歴
  recommendationsSent       Int       @default(0) @map("recommendations_sent")
  lastRecommendedAt         DateTime? @map("last_recommended_at")

  // 更新日時
  calculatedAt              DateTime  @default(now()) @map("calculated_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  user                      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([participationRate])
  @@index([isBelowAverage])
  @@index([departmentAvgRate])
  @@index([lastJoinedAt])
  @@map("staff_project_participation_stats")
}
```

**集計ロジック**:
```typescript
// src/services/ProjectParticipationAnalyzer.ts
export async function calculateStaffParticipationStats(userId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  // 参加プロジェクト数
  const totalProjects = await prisma.projectTeamMember.count({
    where: { userId }
  });

  const activeProjects = await prisma.projectTeamMember.count({
    where: {
      userId,
      project: { approvalStatus: 'in_progress' }
    }
  });

  const projectsLast6Months = await prisma.projectTeamMember.count({
    where: {
      userId,
      joinedAt: { gte: sixMonthsAgo }
    }
  });

  // 最終参加日
  const lastJoin = await prisma.projectTeamMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: 'desc' }
  });

  const daysSinceLastJoin = lastJoin
    ? Math.floor((Date.now() - lastJoin.joinedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // 部門平均参加率を計算
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const departmentAvg = await calculateDepartmentAverageRate(user.department);

  const participationRate = totalProjects / (daysSinceLastJoin || 1) * 30;
  const isBelowAverage = participationRate < departmentAvg;

  return {
    totalProjectsJoined: totalProjects,
    activeProjects,
    projectsLast6Months,
    participationRate,
    departmentAvgRate: departmentAvg,
    isBelowAverage,
    lastJoinedAt: lastJoin?.joinedAt || null,
    daysSinceLastJoin
  };
}
```

---

### 4. スキルマッチング分析（259-290行目）

#### 表示内容
```typescript
const skillMatchData = [
  {
    skill: 'システム・IT',
    availableStaff: 42,        // スキル保有者数
    activeProjects: 8,         // 関連プロジェクト数
    recommendations: 15        // 推奨可能数
  }
];
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| スキルマスタ | ❌ | ✅ `SkillMaster` | 医療システム | API | 🔴 **要連携** |
| 職員スキル評価 | ❌ | ✅ `EmployeeSkill` | 医療システム | API | 🔴 **要連携** |
| プロジェクト必要スキル | 🟡 Post拡張 | ❌ | VoiceDrive | DB拡張 | 🔴 **要追加** |
| スキル保有者数 | ❌ 集計 | ✅ 集計 | 医療システム | API | 🔴 **要連携** |

#### 解決策2: 医療システムからスキルデータAPIを追加

**医療システム側API**:
```typescript
// GET /api/v2/skills/summary
// スキル別の保有者数と評価レベル分布を取得

Response: {
  skills: [
    {
      skillId: "SK001",
      skillName: "システム・IT",
      category: "専門スキル",
      totalStaff: 42,
      staffByLevel: {
        expert: 8,      // レベル5（エキスパート）
        advanced: 15,   // レベル4
        intermediate: 12,  // レベル3
        basic: 7        // レベル1-2
      },
      averageLevel: 3.2
    }
  ]
}
```

**VoiceDrive側キャッシュテーブル**:
```prisma
// VoiceDrive: prisma/schema.prisma
model SkillSummaryCache {
  id                String    @id @default(cuid())
  skillId           String    @unique @map("skill_id")
  skillName         String    @map("skill_name")
  skillCategory     String    @map("skill_category")

  // 保有者統計
  totalStaff        Int       @default(0) @map("total_staff")
  expertCount       Int       @default(0) @map("expert_count")
  advancedCount     Int       @default(0) @map("advanced_count")
  intermediateCount Int       @default(0) @map("intermediate_count")
  basicCount        Int       @default(0) @map("basic_count")
  averageLevel      Float     @default(0) @map("average_level")

  // プロジェクト関連統計（VoiceDrive側で計算）
  activeProjects    Int       @default(0) @map("active_projects")
  recommendations   Int       @default(0) @map("recommendations")

  // 更新日時
  lastSyncedAt      DateTime  @default(now()) @map("last_synced_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([skillName])
  @@index([skillCategory])
  @@map("skill_summary_cache")
}
```

**プロジェクトにスキル要件を追加**:
```prisma
// 既存のPostテーブル拡張
model Post {
  // ... 既存フィールド

  // 🆕 プロジェクトのスキル要件（JSONフィールド）
  requiredSkills    Json?     @map("required_skills")
  // 例: [{ skillId: "SK001", skillName: "システム・IT", minLevel: 3 }]

  // 🆕 プロジェクトの難易度・規模
  projectComplexity String?   @map("project_complexity")  // 'simple' | 'moderate' | 'complex' | 'advanced'
}
```

---

### 5. チーム多様性向上推奨（292-344行目）

#### 表示内容
```typescript
const diversityRecommendations = [
  {
    projectName: '外来待ち時間改善プロジェクト',
    currentTeam: { nurses: 5, doctors: 2, admin: 1, others: 0 },
    recommendation: '薬剤師、医療技術職の参加推奨',
    diversityScore: 45,   // 現在のスコア
    targetScore: 75       // 目標スコア
  }
];
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| プロジェクトメンバー構成 | VoiceDrive | ✅ `ProjectTeamMember` | 既存 | ✅ OK |
| 職種別カウント | VoiceDrive | ❌ 集計必要 | 集計テーブル | 🔴 **要追加** |
| 多様性スコア計算 | VoiceDrive | ❌ 計算必要 | 計算ロジック | 🔴 **要実装** |
| 推奨職種リスト | VoiceDrive | ❌ 計算必要 | 計算ロジック | 🔴 **要実装** |

#### 解決策3: プロジェクト多様性分析テーブル追加

**新規テーブル: `ProjectDiversityAnalysis`**
```prisma
// VoiceDrive: prisma/schema.prisma
model ProjectDiversityAnalysis {
  id                    String    @id @default(cuid())
  projectId             String    @unique @map("project_id")

  // 職種別カウント
  nursesCount           Int       @default(0) @map("nurses_count")
  doctorsCount          Int       @default(0) @map("doctors_count")
  adminCount            Int       @default(0) @map("admin_count")
  rehabCount            Int       @default(0) @map("rehab_count")
  pharmacistCount       Int       @default(0) @map("pharmacist_count")
  medicalTechCount      Int       @default(0) @map("medical_tech_count")
  othersCount           Int       @default(0) @map("others_count")

  // 世代別カウント
  gen20sCount           Int       @default(0) @map("gen_20s_count")
  gen30sCount           Int       @default(0) @map("gen_30s_count")
  gen40sCount           Int       @default(0) @map("gen_40s_count")
  gen50sCount           Int       @default(0) @map("gen_50s_count")
  gen60sCount           Int       @default(0) @map("gen_60s_count")

  // 部署別カウント
  departmentsCount      Int       @default(0) @map("departments_count")
  departmentList        Json?     @map("department_list")  // ["内科", "外科", "事務部"]

  // 多様性スコア（0-100）
  professionDiversityScore  Float  @default(0) @map("profession_diversity_score")
  generationDiversityScore  Float  @default(0) @map("generation_diversity_score")
  departmentDiversityScore  Float  @default(0) @map("department_diversity_score")
  overallDiversityScore     Float  @default(0) @map("overall_diversity_score")

  // 目標・推奨
  targetDiversityScore      Float  @default(75) @map("target_diversity_score")
  recommendedProfessions    Json?  @map("recommended_professions")
  // ["薬剤師", "医療技術職"]

  // 更新日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  project               Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([overallDiversityScore])
  @@index([professionDiversityScore])
  @@map("project_diversity_analysis")
}
```

**多様性スコア計算ロジック**:
```typescript
// src/services/DiversityAnalyzer.ts
export function calculateDiversityScore(teamComposition: {
  nurses: number;
  doctors: number;
  admin: number;
  rehab: number;
  pharmacist: number;
  medicalTech: number;
  others: number;
}): number {
  const total = Object.values(teamComposition).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;

  // シャノンの多様性指数（Shannon Diversity Index）を使用
  // H = -Σ(pi * ln(pi))
  // pi = 各職種の割合

  let diversity = 0;
  for (const count of Object.values(teamComposition)) {
    if (count > 0) {
      const proportion = count / total;
      diversity -= proportion * Math.log(proportion);
    }
  }

  // 最大多様性 = ln(職種数)
  const maxDiversity = Math.log(7);  // 7職種

  // 0-100にスケーリング
  return Math.round((diversity / maxDiversity) * 100);
}

export function recommendProfessions(
  currentTeam: Record<string, number>,
  targetScore: number
): string[] {
  const currentScore = calculateDiversityScore(currentTeam);
  if (currentScore >= targetScore) return [];

  // 不足している職種を推奨
  const recommendations: string[] = [];
  const professionMap = {
    nurses: '看護師',
    doctors: '医師',
    admin: '事務職',
    rehab: 'リハビリ職',
    pharmacist: '薬剤師',
    medicalTech: '医療技術職',
    others: 'その他'
  };

  for (const [key, label] of Object.entries(professionMap)) {
    if (currentTeam[key] === 0) {
      recommendations.push(label);
    }
  }

  return recommendations;
}
```

---

### 6. 推奨プロジェクトマッチングロジック（17-33行目）

#### データ構造
```typescript
interface RecommendedProject {
  projectId: string;
  projectName: string;
  matchScore: number;        // 0-100のマッチ度
  reasons: string[];         // マッチング理由
}
```

#### マッチング要素
1. **職種マッチ**: 職員の職種とプロジェクトの対象職種
2. **スキルマッチ**: 職員のスキルとプロジェクトの必要スキル
3. **経験マッチ**: 職員の経験年数とプロジェクトの難易度
4. **過去の投稿**: 関連テーマへの投稿履歴
5. **部署関連性**: 職員の部署とプロジェクトの対象部署

#### 解決策4: マッチングスコア計算サービス

**マッチングロジック実装**:
```typescript
// src/services/ProjectMatchingService.ts
export async function calculateMatchScore(
  userId: string,
  projectId: string
): Promise<{ score: number; reasons: string[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  });

  const project = await prisma.post.findUnique({
    where: { id: projectId },
    include: { teamMembers: true }
  });

  const reasons: string[] = [];
  let score = 0;

  // 1. 職種マッチ（25点）
  if (project.targetProfession?.includes(user.professionCategory)) {
    score += 25;
    reasons.push(`${user.professionCategory}対象プロジェクト`);
  }

  // 2. 部署マッチ（20点）
  if (project.targetDepartment?.includes(user.department)) {
    score += 20;
    reasons.push(`${user.department}関連プロジェクト`);
  }

  // 3. スキルマッチ（30点）
  // 医療システムAPIからスキル情報取得
  const userSkills = await fetchEmployeeSkills(user.employeeId);
  const requiredSkills = project.requiredSkills as any[];
  if (requiredSkills && userSkills) {
    const matchingSkills = requiredSkills.filter(req =>
      userSkills.some(skill => skill.skillId === req.skillId && skill.level >= req.minLevel)
    );
    if (matchingSkills.length > 0) {
      score += 30;
      reasons.push(`必要スキル保有: ${matchingSkills.map(s => s.skillName).join(', ')}`);
    }
  }

  // 4. 経験年数マッチ（15点）
  if (user.experienceYears && project.projectComplexity) {
    const complexityMap = { simple: 1, moderate: 3, complex: 5, advanced: 8 };
    if (user.experienceYears >= complexityMap[project.projectComplexity]) {
      score += 15;
      reasons.push(`経験年数${user.experienceYears}年（要件適合）`);
    }
  }

  // 5. 関連投稿履歴（10点）
  const relatedPosts = user.posts.filter(p =>
    p.category === project.category || p.tags?.some(tag => project.tags?.includes(tag))
  );
  if (relatedPosts.length > 0) {
    score += 10;
    reasons.push(`関連する投稿実績あり（${relatedPosts.length}件）`);
  }

  return { score, reasons };
}
```

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. StaffProjectParticipationStats（職員プロジェクト参加統計）**
```prisma
model StaffProjectParticipationStats {
  id                    String    @id @default(cuid())
  userId                String    @unique @map("user_id")
  totalProjectsJoined   Int       @default(0) @map("total_projects_joined")
  activeProjects        Int       @default(0) @map("active_projects")
  projectsLast6Months   Int       @default(0) @map("projects_last_6months")
  participationRate     Float     @default(0) @map("participation_rate")
  departmentAvgRate     Float     @default(0) @map("department_avg_rate")
  isBelowAverage        Boolean   @default(false) @map("is_below_average")
  lastJoinedAt          DateTime? @map("last_joined_at")
  daysSinceLastJoin     Int?      @map("days_since_last_join")
  recommendationsSent   Int       @default(0) @map("recommendations_sent")
  lastRecommendedAt     DateTime? @map("last_recommended_at")
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([participationRate])
  @@index([isBelowAverage])
  @@map("staff_project_participation_stats")
}
```

**理由**:
- 参加率が低い職員タブ（165-257行目）に必須
- 統計カード表示に必要
- 推奨送信履歴の管理

---

**B. ProjectDiversityAnalysis（プロジェクト多様性分析）**
```prisma
model ProjectDiversityAnalysis {
  id                          String    @id @default(cuid())
  projectId                   String    @unique @map("project_id")
  nursesCount                 Int       @default(0) @map("nurses_count")
  doctorsCount                Int       @default(0) @map("doctors_count")
  adminCount                  Int       @default(0) @map("admin_count")
  rehabCount                  Int       @default(0) @map("rehab_count")
  pharmacistCount             Int       @default(0) @map("pharmacist_count")
  medicalTechCount            Int       @default(0) @map("medical_tech_count")
  othersCount                 Int       @default(0) @map("others_count")
  professionDiversityScore    Float     @default(0) @map("profession_diversity_score")
  generationDiversityScore    Float     @default(0) @map("generation_diversity_score")
  departmentDiversityScore    Float     @default(0) @map("department_diversity_score")
  overallDiversityScore       Float     @default(0) @map("overall_diversity_score")
  targetDiversityScore        Float     @default(75) @map("target_diversity_score")
  recommendedProfessions      Json?     @map("recommended_professions")
  calculatedAt                DateTime  @default(now()) @map("calculated_at")
  updatedAt                   DateTime  @updatedAt @map("updated_at")

  project                     Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([overallDiversityScore])
  @@map("project_diversity_analysis")
}
```

**理由**:
- チーム多様性向上タブ（292-344行目）に必須
- 職種・世代・部署別の構成分析
- 推奨職種の自動算出

---

**C. SkillSummaryCache（スキルサマリキャッシュ）**
```prisma
model SkillSummaryCache {
  id                String    @id @default(cuid())
  skillId           String    @unique @map("skill_id")
  skillName         String    @map("skill_name")
  skillCategory     String    @map("skill_category")
  totalStaff        Int       @default(0) @map("total_staff")
  expertCount       Int       @default(0) @map("expert_count")
  advancedCount     Int       @default(0) @map("advanced_count")
  intermediateCount Int       @default(0) @map("intermediate_count")
  basicCount        Int       @default(0) @map("basic_count")
  averageLevel      Float     @default(0) @map("average_level")
  activeProjects    Int       @default(0) @map("active_projects")
  recommendations   Int       @default(0) @map("recommendations")
  lastSyncedAt      DateTime  @default(now()) @map("last_synced_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([skillName])
  @@map("skill_summary_cache")
}
```

**理由**:
- スキルマッチングタブ（259-290行目）に必須
- 医療システムのスキルデータキャッシュ
- プロジェクト推奨に使用

---

#### 🟡 優先度: 中（推奨）

**D. ProjectRecommendationLog（プロジェクト推奨履歴）**
```prisma
model ProjectRecommendationLog {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  projectId         String    @map("project_id")
  matchScore        Int       @map("match_score")
  reasons           Json      @map("reasons")
  recommendedBy     String    @map("recommended_by")
  sentAt            DateTime  @default(now()) @map("sent_at")
  viewedAt          DateTime? @map("viewed_at")
  acceptedAt        DateTime? @map("accepted_at")
  rejectedAt        DateTime? @map("rejected_at")

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  project           Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([projectId])
  @@index([sentAt])
  @@map("project_recommendation_logs")
}
```

**理由**:
- 推奨の効果測定
- A/Bテスト・改善に使用

---

### 2. 既存テーブル修正（2件）

#### Modify-1: Userテーブルに経験年数追加

PersonalStationと同様、`experienceYears`が必要。

```prisma
model User {
  // ... 既存フィールド
  experienceYears       Float?    @map("experience_years")  // 🆕 追加（既にある場合はスキップ）

  // 🆕 新規リレーション
  participationStats    StaffProjectParticipationStats?
  recommendationLogs    ProjectRecommendationLog[]
}
```

---

#### Modify-2: Postテーブルにプロジェクト情報追加

```prisma
model Post {
  // ... 既存フィールド

  // 🆕 プロジェクト推奨用フィールド
  requiredSkills        Json?     @map("required_skills")
  // [{ skillId: "SK001", skillName: "システム・IT", minLevel: 3 }]

  projectComplexity     String?   @map("project_complexity")
  // 'simple' | 'moderate' | 'complex' | 'advanced'

  targetProfession      Json?     @map("target_profession")
  // ["看護師", "医師", "薬剤師"]

  targetDepartment      Json?     @map("target_department")
  // ["内科", "外科", "事務部"]

  // 🆕 新規リレーション
  diversityAnalysis     ProjectDiversityAnalysis?
  recommendationLogs    ProjectRecommendationLog[]
}
```

---

### 3. 医療システム側で追加が必要

#### 🔴 優先度: 高（即対応）

**E. スキルサマリAPI追加**

**エンドポイント**: `GET /api/v2/skills/summary`

**必要な理由**:
- スキルマッチングタブ（259-290行目）に必須
- 医療システムの`EmployeeSkill`、`SkillMaster`テーブルから集計

**レスポンス例**:
```json
{
  "skills": [
    {
      "skillId": "SK001",
      "skillName": "システム・IT",
      "category": "専門スキル",
      "totalStaff": 42,
      "staffByLevel": {
        "expert": 8,
        "advanced": 15,
        "intermediate": 12,
        "basic": 7
      },
      "averageLevel": 3.2
    }
  ]
}
```

---

**F. 職員スキル詳細API追加**

**エンドポイント**: `GET /api/v2/employees/{employeeId}/skills`

**必要な理由**:
- マッチングスコア計算に必須
- 職員の保有スキルとレベルを取得

**レスポンス例**:
```json
{
  "employeeId": "EMP2024001",
  "skills": [
    {
      "skillId": "SK001",
      "skillName": "システム・IT",
      "level": 4,
      "levelName": "上級",
      "acquiredDate": "2023-04-01",
      "lastAssessedDate": "2024-09-01"
    }
  ]
}
```

---

## 🎯 実装優先順位

### Phase 1: 基本統計機能（3-4日）

**目標**: 参加率が低い職員タブが動作する

1. 🔴 **StaffProjectParticipationStatsテーブル追加**
   ```bash
   npx prisma migrate dev --name add_staff_project_participation_stats
   ```

2. 🔴 **User.experienceYears追加（PersonalStationと共通）**
   ```prisma
   model User {
     experienceYears  Float?  @map("experience_years")
   }
   ```

3. 🔴 **参加統計集計バッチ実装**
   ```typescript
   // src/jobs/calculateProjectParticipationStats.ts
   export async function calculateAllStaffStats() { /* ... */ }
   ```

4. 🔴 **推奨ロジック実装（基本版）**
   ```typescript
   // src/services/ProjectRecommendationService.ts
   export async function getStaffWithLowParticipation() { /* ... */ }
   ```

**このPhaseで動作する機能**:
- ✅ 参加率が低い職員のリスト表示
- ✅ 統計カード表示（実データ）
- ⚠️ 推奨プロジェクト（簡易版、スキルマッチなし）

---

### Phase 2: スキルマッチング機能（3-4日）

**目標**: スキルマッチングタブが動作する

1. 🔴 **医療システムにスキルサマリAPI追加**
   ```typescript
   // GET /api/v2/skills/summary
   ```

2. 🔴 **SkillSummaryCacheテーブル追加**
   ```bash
   npx prisma migrate dev --name add_skill_summary_cache
   ```

3. 🔴 **スキル同期バッチ実装**
   ```typescript
   // src/jobs/syncSkillDataFromMedicalSystem.ts
   ```

4. 🔴 **Post.requiredSkillsフィールド追加**
   ```sql
   ALTER TABLE posts ADD COLUMN required_skills JSON NULL;
   ALTER TABLE posts ADD COLUMN project_complexity VARCHAR(20) NULL;
   ```

5. 🔴 **マッチングスコア計算サービス実装**
   ```typescript
   // src/services/ProjectMatchingService.ts
   export async function calculateMatchScore() { /* ... */ }
   ```

**このPhaseで動作する機能**:
- ✅ スキルマッチングタブ（実データ）
- ✅ 推奨プロジェクトのマッチング精度向上

---

### Phase 3: 多様性分析機能（2-3日）

**目標**: チーム多様性向上タブが動作する

1. 🔴 **ProjectDiversityAnalysisテーブル追加**
   ```bash
   npx prisma migrate dev --name add_project_diversity_analysis
   ```

2. 🔴 **多様性スコア計算サービス実装**
   ```typescript
   // src/services/DiversityAnalyzer.ts
   export function calculateDiversityScore() { /* ... */ }
   ```

3. 🔴 **多様性分析バッチ実装**
   ```typescript
   // src/jobs/calculateProjectDiversity.ts
   ```

**このPhaseで動作する機能**:
- ✅ チーム多様性向上タブ（実データ）
- ✅ 推奨職種の自動算出

---

### Phase 4: 推奨履歴・効果測定（1-2日）

**目標**: 推奨の効果測定とA/Bテスト

1. 🟡 **ProjectRecommendationLogテーブル追加**
   ```bash
   npx prisma migrate dev --name add_project_recommendation_log
   ```

2. 🟡 **推奨送信機能実装**
   ```typescript
   // src/services/RecommendationNotifier.ts
   ```

3. 🟡 **効果測定ダッシュボード実装**

---

## 📊 データフロー図

### フロー1: 参加率が低い職員の推奨

```
PersonalStationPage
  ↓ 日次バッチ
StaffProjectParticipationStats (集計)
  ← ProjectTeamMember (参加履歴)
  ← User (職員基本情報)

  ↓ 推奨ロジック
ProjectMatchingService
  ← SkillSummaryCache (スキルデータ)
  ← Post.requiredSkills (プロジェクトスキル要件)

  ↓ 表示
ProjectParticipationRecommendationPage
  - 参加率が低い職員リスト
  - 推奨プロジェクト（マッチスコア付き)
```

---

### フロー2: スキルデータ同期

```
医療システム EmployeeSkill, SkillMaster
  ↓ API: GET /api/v2/skills/summary
VoiceDrive 同期バッチ
  ↓ 保存
SkillSummaryCache (キャッシュ)
  ↓ 活用
ProjectMatchingService (マッチングスコア計算)
```

---

### フロー3: 多様性分析

```
ProjectTeamMember (メンバーリスト)
  + User (職種・世代・部署情報)
  ↓ 集計
DiversityAnalyzer (多様性スコア計算)
  ↓ 保存
ProjectDiversityAnalysis (分析結果)
  ↓ 表示
ProjectParticipationRecommendationPage - 多様性向上タブ
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1
- [ ] StaffProjectParticipationStatsテーブル追加
- [ ] User.experienceYears追加
- [ ] 参加統計集計バッチ実装
- [ ] 推奨ロジック実装（基本版）
- [ ] 参加率が低い職員タブの実装

#### Phase 2
- [ ] SkillSummaryCacheテーブル追加
- [ ] Post.requiredSkills, projectComplexity追加
- [ ] スキル同期バッチ実装
- [ ] マッチングスコア計算サービス実装
- [ ] スキルマッチングタブの実装

#### Phase 3
- [ ] ProjectDiversityAnalysisテーブル追加
- [ ] 多様性スコア計算サービス実装
- [ ] 多様性分析バッチ実装
- [ ] チーム多様性向上タブの実装

#### Phase 4
- [ ] ProjectRecommendationLogテーブル追加
- [ ] 推奨送信機能実装
- [ ] 効果測定ダッシュボード実装

### 医療システム側の実装

- [ ] GET /api/v2/skills/summary 実装
- [ ] GET /api/v2/employees/{employeeId}/skills 実装
- [ ] スキルデータのバッチ集計処理
- [ ] API仕様書更新

### テスト

- [ ] 参加統計集計の単体テスト
- [ ] マッチングスコア計算の単体テスト
- [ ] 多様性スコア計算の単体テスト
- [ ] 統合テスト（全タブ）
- [ ] パフォーマンステスト（1000職員、100プロジェクト）
- [ ] E2Eテスト（推奨送信〜受諾まで）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [ProjectTalentAnalytics_DB要件分析](./ProjectTalentAnalytics_DB要件分析_20251012.md)

---

**文書終了**

最終更新: 2025年10月12日
バージョン: 1.0
次回レビュー: Phase 1実装後
