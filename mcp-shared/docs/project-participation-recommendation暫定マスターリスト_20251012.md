# プロジェクト参加推奨 暫定マスターリスト

**作成日**: 2025年10月12日
**対象ページ**: ProjectParticipationRecommendationPage (`src/pages/ProjectParticipationRecommendationPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- プロジェクト参加推奨ページは人事管理者（Level 15+）向けの職員プロジェクト参加推奨機能
- 参加率が低い職員へのプロジェクト推奨、スキルマッチング、チーム多様性向上を支援
- 現在はダミーデータで動作（参加統計、スキルデータ、多様性分析）

### 必要な対応
1. **医療システムからのAPI提供**: 2件
2. **医療システムからのWebhook通知**: 1件（スキル更新）
3. **VoiceDrive DB追加**: テーブル4件、フィールド5件
4. **確認事項**: 3件

### 優先度
**Priority: HIGH（グループ1: 管理者向けコアページ）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（2件）

#### API-1: スキルサマリー取得API

**エンドポイント**:
```
GET /api/v2/skills/summary
```

**必要な理由**:
- ProjectParticipationRecommendationPage.tsx 259-290行目のスキルマッチングタブで使用
- スキル別の保有者数、レベル分布、関連プロジェクト数を表示
- マッチングスコア計算の基礎データ

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
        "expert": 8,       // レベル5（エキスパート）
        "advanced": 15,    // レベル4
        "intermediate": 12, // レベル3
        "basic": 7         // レベル1-2
      },
      "averageLevel": 3.2,
      "lastUpdated": "2025-10-12T10:00:00Z"
    },
    {
      "skillId": "SK002",
      "skillName": "教育・研修",
      "category": "専門スキル",
      "totalStaff": 67,
      "staffByLevel": {
        "expert": 12,
        "advanced": 25,
        "intermediate": 20,
        "basic": 10
      },
      "averageLevel": 3.5,
      "lastUpdated": "2025-10-12T10:00:00Z"
    }
  ],
  "totalSkills": 25,
  "timestamp": "2025-10-12T10:00:00Z"
}
```

**データソース**:
- 医療システム`SkillMaster`テーブル
- 医療システム`EmployeeSkill`テーブル（スキル評価）
- 集計処理が必要（日次バッチ推奨）

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- 個人情報は含まない（集計値のみ）

---

#### API-2: 職員スキル詳細取得API

**エンドポイント**:
```
GET /api/v2/employees/{employeeId}/skills
```

**必要な理由**:
- プロジェクトマッチングスコア計算で使用
- 職員が保有するスキルとそのレベルを取得
- 推奨プロジェクトの精度向上

**レスポンス例**:
```json
{
  "employeeId": "EMP2024001",
  "skills": [
    {
      "skillId": "SK001",
      "skillName": "システム・IT",
      "skillCategory": "専門スキル",
      "level": 4,
      "levelName": "上級",
      "selfAssessment": 4,
      "supervisorAssessment": 4,
      "acquiredDate": "2023-04-01",
      "lastAssessedDate": "2024-09-01",
      "certifications": [
        {
          "certificationName": "ITパスポート",
          "issuedDate": "2023-03-15"
        }
      ]
    },
    {
      "skillId": "SK005",
      "skillName": "プロジェクト管理",
      "skillCategory": "マネジメント",
      "level": 3,
      "levelName": "中級",
      "selfAssessment": 3,
      "supervisorAssessment": 3,
      "acquiredDate": "2024-01-01",
      "lastAssessedDate": "2024-09-01"
    }
  ],
  "totalSkills": 8,
  "averageLevel": 3.4,
  "lastUpdated": "2024-09-01T15:30:00Z"
}
```

**データソース**:
- 医療システム`EmployeeSkill`テーブル
- 医療システム`SkillRadarAssessment`テーブル
- 医療システム`Certification`テーブル（資格情報）

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- アクセス権限チェック（本人 or 上司 or HR管理者のみ）

---

### B. Webhook通知依頼（1件）

#### Webhook-1: 職員スキル更新通知

**トリガー**:
- `EmployeeSkill`テーブル更新時（新規スキル取得、レベル変更）
- `Certification`テーブル更新時（新規資格取得）
- スキル評価実施時（V3評価、スキルレーダー評価）

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/employee-skill-updated
```

**ペイロード例**:
```json
{
  "eventType": "employee.skill.updated",
  "timestamp": "2025-10-12T15:30:00Z",
  "employeeId": "EMP2024001",
  "changes": {
    "skillId": "SK001",
    "skillName": "システム・IT",
    "previousLevel": 3,
    "newLevel": 4,
    "assessmentDate": "2025-10-10",
    "assessor": "MGR001"
  },
  "signature": "abc123..."  // HMAC-SHA256署名
}
```

**VoiceDrive側の処理**:
```typescript
// SkillSummaryCacheを更新
await updateSkillSummaryCache(employeeId, changes);

// マッチングスコアを再計算（影響を受けるプロジェクト推奨）
await recalculateMatchingScores(employeeId);
```

**送信頻度**:
- リアルタイム送信（スキル更新時に即座）
- または日次バッチ（毎日午前2時に前日分をまとめて送信）
- **推奨**: 日次バッチ（負荷軽減）

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### C. 新規テーブル追加（4件）

#### Table-1: StaffProjectParticipationStats（職員プロジェクト参加統計）

**優先度**: 🔴 **CRITICAL**

**理由**:
- ProjectParticipationRecommendationPage.tsx 165-257行目の「参加率が低い職員」タブに必須
- 統計カード（168-190行目）表示に必要
- 推奨送信履歴の管理

**スキーマ定義**:
```prisma
model StaffProjectParticipationStats {
  id                    String    @id @default(cuid())
  userId                String    @unique @map("user_id")

  // 参加統計
  totalProjectsJoined   Int       @default(0) @map("total_projects_joined")
  activeProjects        Int       @default(0) @map("active_projects")
  completedProjects     Int       @default(0) @map("completed_projects")

  // 期間別統計
  projectsLast6Months   Int       @default(0) @map("projects_last_6months")
  projectsThisYear      Int       @default(0) @map("projects_this_year")

  // 参加率指標
  participationRate     Float     @default(0) @map("participation_rate")
  departmentAvgRate     Float     @default(0) @map("department_avg_rate")
  isBelowAverage        Boolean   @default(false) @map("is_below_average")

  // 最終参加日
  lastJoinedAt          DateTime? @map("last_joined_at")
  daysSinceLastJoin     Int?      @map("days_since_last_join")

  // 推奨送信履歴
  recommendationsSent   Int       @default(0) @map("recommendations_sent")
  lastRecommendedAt     DateTime? @map("last_recommended_at")

  // 更新日時
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([participationRate])
  @@index([isBelowAverage])
  @@index([departmentAvgRate])
  @@index([lastJoinedAt])
  @@map("staff_project_participation_stats")
}
```

**使用例**:
```typescript
// 参加率が低い職員を取得
const lowParticipationStaff = await prisma.staffProjectParticipationStats.findMany({
  where: {
    OR: [
      { projectsLast6Months: 0 },        // 6ヶ月参加なし
      { isBelowAverage: true }            // 平均以下
    ]
  },
  include: { user: true },
  orderBy: { participationRate: 'asc' }
});
```

**マイグレーション**:
```bash
# VoiceDrive側で実行
npx prisma migrate dev --name add_staff_project_participation_stats
```

---

#### Table-2: ProjectDiversityAnalysis（プロジェクト多様性分析）

**優先度**: 🔴 **CRITICAL**

**理由**:
- ProjectParticipationRecommendationPage.tsx 292-344行目の「多様性向上」タブに必須
- チーム構成の職種・世代・部署別分析
- 推奨職種の自動算出

**スキーマ定義**:
```prisma
model ProjectDiversityAnalysis {
  id                          String    @id @default(cuid())
  projectId                   String    @unique @map("project_id")

  // 職種別カウント
  nursesCount                 Int       @default(0) @map("nurses_count")
  doctorsCount                Int       @default(0) @map("doctors_count")
  adminCount                  Int       @default(0) @map("admin_count")
  rehabCount                  Int       @default(0) @map("rehab_count")
  pharmacistCount             Int       @default(0) @map("pharmacist_count")
  medicalTechCount            Int       @default(0) @map("medical_tech_count")
  othersCount                 Int       @default(0) @map("others_count")

  // 世代別カウント
  gen20sCount                 Int       @default(0) @map("gen_20s_count")
  gen30sCount                 Int       @default(0) @map("gen_30s_count")
  gen40sCount                 Int       @default(0) @map("gen_40s_count")
  gen50sCount                 Int       @default(0) @map("gen_50s_count")
  gen60sCount                 Int       @default(0) @map("gen_60s_count")

  // 部署別カウント
  departmentsCount            Int       @default(0) @map("departments_count")
  departmentList              Json?     @map("department_list")  // ["内科", "外科", "事務部"]

  // 多様性スコア（0-100）
  professionDiversityScore    Float     @default(0) @map("profession_diversity_score")
  generationDiversityScore    Float     @default(0) @map("generation_diversity_score")
  departmentDiversityScore    Float     @default(0) @map("department_diversity_score")
  overallDiversityScore       Float     @default(0) @map("overall_diversity_score")

  // 目標・推奨
  targetDiversityScore        Float     @default(75) @map("target_diversity_score")
  recommendedProfessions      Json?     @map("recommended_professions")
  // ["薬剤師", "医療技術職"]

  // 更新日時
  calculatedAt                DateTime  @default(now()) @map("calculated_at")
  updatedAt                   DateTime  @updatedAt @map("updated_at")

  project                     Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([overallDiversityScore])
  @@index([professionDiversityScore])
  @@map("project_diversity_analysis")
}
```

**使用例**:
```typescript
// 多様性スコアが低いプロジェクトを取得
const lowDiversityProjects = await prisma.projectDiversityAnalysis.findMany({
  where: {
    overallDiversityScore: { lt: 50 }
  },
  include: { project: true },
  orderBy: { overallDiversityScore: 'asc' }
});
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_project_diversity_analysis
```

---

#### Table-3: SkillSummaryCache（スキルサマリキャッシュ）

**優先度**: 🔴 **CRITICAL**

**理由**:
- ProjectParticipationRecommendationPage.tsx 259-290行目の「スキルマッチング」タブに必須
- 医療システムのスキルデータをキャッシュ
- マッチングスコア計算の基礎データ

**スキーマ定義**:
```prisma
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
  @@index([totalStaff])
  @@map("skill_summary_cache")
}
```

**使用例**:
```typescript
// スキル別の保有者数を取得
const skillSummary = await prisma.skillSummaryCache.findMany({
  orderBy: { totalStaff: 'desc' }
});
```

**データ更新ロジック**:
```typescript
// 日次バッチで医療システムAPIからスキルデータを同期
async function syncSkillDataFromMedicalSystem() {
  const skillsData = await medicalSystemAPI.get('/api/v2/skills/summary');

  for (const skill of skillsData.skills) {
    // VoiceDrive側でプロジェクト関連統計を計算
    const activeProjects = await countProjectsRequiringSkill(skill.skillId);
    const recommendations = await countRecommendationsForSkill(skill.skillId);

    await prisma.skillSummaryCache.upsert({
      where: { skillId: skill.skillId },
      create: {
        skillId: skill.skillId,
        skillName: skill.skillName,
        skillCategory: skill.category,
        totalStaff: skill.totalStaff,
        expertCount: skill.staffByLevel.expert,
        advancedCount: skill.staffByLevel.advanced,
        intermediateCount: skill.staffByLevel.intermediate,
        basicCount: skill.staffByLevel.basic,
        averageLevel: skill.averageLevel,
        activeProjects,
        recommendations,
        lastSyncedAt: new Date()
      },
      update: {
        skillName: skill.skillName,
        skillCategory: skill.category,
        totalStaff: skill.totalStaff,
        expertCount: skill.staffByLevel.expert,
        advancedCount: skill.staffByLevel.advanced,
        intermediateCount: skill.staffByLevel.intermediate,
        basicCount: skill.staffByLevel.basic,
        averageLevel: skill.averageLevel,
        activeProjects,
        recommendations,
        lastSyncedAt: new Date()
      }
    });
  }
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_skill_summary_cache
```

---

#### Table-4: ProjectRecommendationLog（プロジェクト推奨履歴）

**優先度**: 🟡 **RECOMMENDED（効果測定用）**

**理由**:
- 推奨の効果測定
- A/Bテスト・改善活動に使用
- 推奨の閲覧・受諾・拒否履歴を記録

**スキーマ定義**:
```prisma
model ProjectRecommendationLog {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  projectId         String    @map("project_id")

  // 推奨情報
  matchScore        Int       @map("match_score")       // 0-100
  reasons           Json      @map("reasons")           // ["スキルマッチ", "部署関連"]
  recommendedBy     String    @map("recommended_by")    // 推奨者のemployeeId

  // 送信・閲覧・反応
  sentAt            DateTime  @default(now()) @map("sent_at")
  viewedAt          DateTime? @map("viewed_at")
  acceptedAt        DateTime? @map("accepted_at")
  rejectedAt        DateTime? @map("rejected_at")
  rejectionReason   String?   @map("rejection_reason")

  // メタデータ
  recommendationType String   @default("auto") @map("recommendation_type")  // "auto" | "manual"
  priority           String   @default("medium") @map("priority")           // "high" | "medium" | "low"

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  project           Post      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([projectId])
  @@index([sentAt])
  @@index([acceptedAt])
  @@map("project_recommendation_logs")
}
```

**使用例**:
```typescript
// 推奨の受諾率を計算
const stats = await prisma.projectRecommendationLog.aggregate({
  where: {
    sentAt: { gte: last30Days }
  },
  _count: {
    id: true,
    acceptedAt: true,
    rejectedAt: true
  }
});

const acceptanceRate = (stats._count.acceptedAt / stats._count.id) * 100;
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_project_recommendation_log
```

---

### D. 既存テーブル修正（2件）

#### Modify-1: Userテーブルに経験年数とリレーション追加

**対象テーブル**: `User`

**追加フィールド**:
```prisma
model User {
  // ... 既存フィールド

  // 🆕 経験年数（PersonalStationと共通、既にある場合はスキップ）
  experienceYears       Float?    @map("experience_years")

  // 🆕 新規リレーション
  participationStats    StaffProjectParticipationStats?
  recommendationLogs    ProjectRecommendationLog[]
}
```

**データソース**:
- 医療システムAPI-2（`/api/v2/employees/{employeeId}/experience-summary`）から取得
- PersonalStationと同じAPI使用

**マイグレーション**:
```sql
-- experienceYearsが未追加の場合のみ実行
ALTER TABLE users ADD COLUMN experience_years DECIMAL(4,1) NULL;
CREATE INDEX idx_users_experience_years ON users(experience_years);
```

---

#### Modify-2: Postテーブルにプロジェクト情報追加

**対象テーブル**: `Post`

**追加フィールド**:
```prisma
model Post {
  // ... 既存フィールド

  // 🆕 プロジェクト推奨用フィールド
  requiredSkills        Json?     @map("required_skills")
  // 例: [{ skillId: "SK001", skillName: "システム・IT", minLevel: 3 }]

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

**マイグレーション**:
```sql
-- VoiceDrive: prisma/migrations/xxx_add_project_recommendation_fields.sql
ALTER TABLE posts ADD COLUMN required_skills JSON NULL;
ALTER TABLE posts ADD COLUMN project_complexity VARCHAR(20) NULL;
ALTER TABLE posts ADD COLUMN target_profession JSON NULL;
ALTER TABLE posts ADD COLUMN target_department JSON NULL;

CREATE INDEX idx_posts_project_complexity ON posts(project_complexity);
```

---

## ❓ 医療システムチームへの確認事項

### 確認-1: SkillMasterとEmployeeSkillテーブルの確認

**質問**:
> DB構築計画書には以下のテーブルが記載されていると認識していますが、確認させてください：
>
> 1. `SkillMaster`テーブルは確実に実装予定ですか？
> 2. `EmployeeSkill`テーブル（職員のスキル評価）は確実に実装予定ですか？
> 3. 以下のフィールドは含まれますか？
>    - `SkillMaster`: `skillId`, `skillName`, `category`, `description`
>    - `EmployeeSkill`: `employeeId`, `skillId`, `level` (1-5), `selfAssessment`, `supervisorAssessment`, `lastAssessedDate`
> 4. API-1（スキルサマリーAPI）とAPI-2（職員スキル詳細API）の実装は可能ですか？

**期待回答**:
- ✅ SkillMaster、EmployeeSkillテーブル実装確定
- ✅ 必要フィールド全て含まれる
- ✅ API-1、API-2実装可能

---

### 確認-2: スキルデータ更新頻度とWebhook送信方式

**質問**:
> Webhook-1（職員スキル更新通知）について：
>
> 1. スキル評価が更新されるたびにリアルタイム送信すると頻繁すぎる可能性があります。以下のどちらの方式を希望しますか？
>    - **Option A**: リアルタイム送信（EmployeeSkill更新時に即座にWebhook）
>    - **Option B**: バッチ送信（日次で前日のスキル更新をまとめてWebhook送信）
>
> 2. VoiceDrive側では**Option B（日次バッチ）**を推奨しますが、医療システム側の負荷やポリシーに合わせます。

**推奨回答**:
- Option B: 日次バッチ（毎日午前2時に前日のスキル更新をまとめて送信）

---

### 確認-3: スキル評価のレベル定義

**質問**:
> スキル評価のレベル（1-5）の定義を確認させてください：
>
> - レベル1: 初級（基本的な知識）
> - レベル2: 初級-中級（基本業務可能）
> - レベル3: 中級（独力で業務遂行可能）
> - レベル4: 上級（他者への指導可能）
> - レベル5: エキスパート（組織の第一人者）
>
> この定義で問題ありませんか？また、医療システム側で異なる定義を使用している場合は教えてください。

**期待回答**:
- ✅ レベル定義の確認・調整
- ✅ スキルカテゴリの一覧共有（専門スキル、マネジメント、IT、教育等）

---

## 📅 想定スケジュール

### Phase 1: 要件確認（1週間）
- **Week 1**: 医療システムチームからの回答受領、仕様確定

### Phase 2: 医療システム側実装（2週間）
- **Week 2**: API-1（スキルサマリーAPI）実装
- **Week 3**: API-2（職員スキル詳細API）実装、Webhook-1実装、テスト環境構築

### Phase 3: VoiceDrive側実装（2週間）
- **Week 4**: StaffProjectParticipationStats、ProjectDiversityAnalysis追加、基本統計機能実装
- **Week 5**: SkillSummaryCache追加、スキル同期バッチ実装、マッチングロジック実装

### Phase 4: 統合テスト（1週間）
- **Week 6**: E2Eテスト、負荷テスト、セキュリティ監査

### Phase 5: 本番リリース
- **Week 7**: 段階的ロールアウト（管理者グループのみ → 全管理者）

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Employee   │      │ EmployeeSkill│                    │
│  │   (Master)   │──────│ SkillMaster  │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                      │                             │
│         │ ①API提供             │ ②スキル集計                │
│         ▼                      ▼                             │
│  ┌─────────────────────────────────────┐                   │
│  │  API-1: スキルサマリー              │                   │
│  │  API-2: 職員スキル詳細              │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                     │
│         │ ③Webhook通知（スキル更新時・日次）                │
│         ▼                                                     │
└─────────────────────────────────────────────────────────────┘
         │
         │ HTTPS + JWT Auth
         │ HMAC-SHA256 Signature
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  Webhook受信: /api/webhooks/employee-*   │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ④キャッシュ更新 & 統計計算                        │
│         ▼                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   User   │  │ SkillCache│  │Participation│ │Diversity │  │
│  │(キャッシュ)│  │(VD専用)   │  │Stats(VD専用)│ │Analysis  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│         │             │              │              │        │
│         └─────────────┴──────────────┴──────────────┘        │
│                           │                                   │
│                           │ ⑤推奨ロジック実行                │
│                           ▼                                   │
│                ┌──────────────────────┐                      │
│                │ProjectParticipation  │                      │
│                │RecommendationPage    │                      │
│                │  - 参加率低い職員    │                      │
│                │  - スキルマッチング  │                      │
│                │  - 多様性向上        │                      │
│                └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### 医療システム側作業

- [ ] **確認-1**: SkillMaster、EmployeeSkillテーブル仕様確認
- [ ] **確認-2**: スキルWebhook送信頻度決定
- [ ] **確認-3**: スキル評価レベル定義確認
- [ ] **API-1**: スキルサマリー取得API実装
- [ ] **API-2**: 職員スキル詳細取得API実装
- [ ] **Webhook-1**: 職員スキル更新通知実装
- [ ] スキルデータ集計バッチ実装
- [ ] テスト環境でのAPI動作確認
- [ ] Webhook署名検証テスト

### VoiceDrive側作業

- [ ] **Table-1**: StaffProjectParticipationStatsテーブル追加
- [ ] **Table-2**: ProjectDiversityAnalysisテーブル追加
- [ ] **Table-3**: SkillSummaryCacheテーブル追加
- [ ] **Table-4**: ProjectRecommendationLogテーブル追加（推奨）
- [ ] **Modify-1**: User.experienceYears追加（PersonalStationと共通）
- [ ] **Modify-2**: Post.requiredSkills, projectComplexity等追加
- [ ] Webhook受信エンドポイント実装（1件）
- [ ] HMAC-SHA256署名検証実装
- [ ] API呼び出しクライアント実装（2件）
- [ ] スキル同期バッチ実装
- [ ] 参加統計集計バッチ実装
- [ ] 多様性分析バッチ実装
- [ ] マッチングスコア計算サービス実装
- [ ] ProjectParticipationRecommendationPageのダミーデータ削除、実データ接続
- [ ] 統合テスト実装
- [ ] パフォーマンステスト（1000職員、100プロジェクト想定）

---

## 📝 補足資料

### 参照ドキュメント

1. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

2. **ProjectParticipationRecommendation DB要件分析**
   `mcp-shared/docs/project-participation-recommendation_DB要件分析_20251012.md`

3. **PersonalStation DB要件分析**
   `mcp-shared/docs/PersonalStation_DB要件分析_20251008.md`

4. **医療システムDB構築計画書**
   `C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Express.js (API Server)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js
- NestJS (API Server)

---

**作成者**: AI (Claude Code)
**承認待ち**: 医療システムチームからの確認事項回答
**次のステップ**: VoiceDrive schema.prisma更新 → 医療チームへ送付

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-12 | 初版作成 | AI (Claude Code) |
