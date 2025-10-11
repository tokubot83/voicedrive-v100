# 戦略的人事計画ページ DB要件分析

**文書番号**: DB-REQ-2025-1010-009
**作成日**: 2025年10月10日
**対象ページ**: https://voicedrive-v100.vercel.app/strategic-hr-plan
**Permission Level**: Level 16+（経営幹部）
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md

---

## 📋 分析サマリー

### 結論
戦略的人事計画ページは**Level 16経営幹部専用**の人事戦略管理機能であり、**医療システムDBの専門的な人事戦略テーブル群が必要**です。VoiceDriveは表示のみを担当し、データ管理は100%医療システム側で実施します。

### 🔴 重大な不足項目（即対応必要）

1. **戦略的人事計画テーブル（StrategicHRPlan）**
   - 職員満足度目標、離職率目標、年間採用目標の管理
   - 現在ハードコードされている（95%, 5%, 120人）
   - 医療システムで戦略目標の設定・追跡が必要

2. **戦略的イニシアチブテーブル（StrategicInitiative）**
   - タレントマネジメント、働き方改革、デジタル人事等の施策管理
   - 進捗率、期限、責任者の追跡
   - 現在ハードコードされている

3. **組織健全性指標テーブル（OrganizationHealthMetrics）**
   - 職員エンゲージメント、組織コミットメント、チーム協働性等の指標
   - 定期測定データの蓄積と推移分析
   - 現在ハードコードされている（82%, 78%, 85%, 70%）

4. **組織開発プログラムテーブル（OrgDevelopmentProgram）**
   - チームビルディング、リーダーシップ開発、文化変革ワークショップ等
   - 参加者数、ステータス、実施日程の管理
   - 現在ハードコードされている

5. **パフォーマンス分析テーブル（PerformanceAnalytics）**
   - 総合パフォーマンス、生産性指標、品質スコア、イノベーション度
   - 部門別パフォーマンス、改善提案実績
   - 現在ハードコードされている

6. **退職管理テーブル（RetirementManagement）**
   - 退職予定者の引き継ぎ状況、面談ステータス
   - 退職理由分析、改善アクション
   - 現在ハードコードされている

7. **影響力分析テーブル（InfluenceAnalysis）**
   - 影響力の高い職員の自動抽出
   - 部門間連携度の計測
   - 現在demoUsersでランダム生成

8. **人材戦略ロードマップテーブル（HRStrategyRoadmap）**
   - 短期（1年）・中期（3年）・長期（5年）の目標管理
   - 現在ハードコードされている

---

## 🔍 詳細分析

### 1. 戦略的人事計画タブ（strategic_planning）

#### 1-1. 戦略目標カード（23-39行目）

**表示内容**:
```typescript
職員満足度目標: 95%
離職率目標: 5%
年間採用目標: 120人
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `職員満足度目標` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `離職率目標` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `年間採用目標` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model StrategicHRGoal {
  id                      String    @id @default(cuid())
  fiscalYear              Int       @map("fiscal_year")          // 2025
  facilityId              String    @map("facility_id")          // 施設別目標

  // 目標値
  employeeSatisfactionTarget  Float  @map("employee_satisfaction_target")  // 95.0
  turnoverRateTarget      Float     @map("turnover_rate_target")           // 5.0
  annualHiringTarget      Int       @map("annual_hiring_target")           // 120

  // 実績値（計算値）
  currentSatisfaction     Float?    @map("current_satisfaction")
  currentTurnoverRate     Float?    @map("current_turnover_rate")
  currentHiring           Int?      @map("current_hiring")

  // メタデータ
  setByUserId             String    @map("set_by_user_id")      // 目標設定者
  approvedAt              DateTime? @map("approved_at")         // 承認日時
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  facility                Facility  @relation(fields: [facilityId], references: [id])

  @@unique([fiscalYear, facilityId])
  @@index([fiscalYear])
  @@map("strategic_hr_goals")
}
```

#### 1-2. 戦略的イニシアチブカード（41-60行目）

**表示内容**:
```typescript
- タレントマネジメント強化: 進捗75%, 期限2025年3月
- 働き方改革推進: 進捗60%, 期限2025年6月
- デジタル人事システム導入: 進捗40%, 期限2025年9月
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `イニシアチブ名` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `説明` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `進捗率` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `期限` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model StrategicInitiative {
  id                String    @id @default(cuid())
  facilityId        String    @map("facility_id")
  name              String                                        // "タレントマネジメント強化"
  description       String    @db.Text                            // "高パフォーマー育成..."
  category          String                                        // "talent", "workstyle", "digital"
  progressPercent   Int       @default(0) @map("progress_percent") // 75
  deadline          DateTime                                      // 2025-03-31
  ownerId           String    @map("owner_id")                   // 責任者
  priority          Int       @default(5) @map("priority")       // 1-10
  status            String    @default("in_progress")            // "in_progress", "completed", "paused"

  // 予算・実績
  budgetAllocated   Float?    @map("budget_allocated")
  budgetUsed        Float?    @map("budget_used")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  facility          Facility  @relation(fields: [facilityId], references: [id])
  owner             Employee  @relation("InitiativeOwner", fields: [ownerId], references: [id])

  @@index([facilityId])
  @@index([deadline])
  @@map("strategic_initiatives")
}
```

#### 1-3. 人材戦略ロードマップカード（63-92行目）

**表示内容**:
```typescript
短期目標（1年）: 新人研修プログラム刷新、評価制度の透明性向上、メンタルヘルス支援強化
中期目標（3年）: リーダーシップ開発プログラム、多様性・包摂性推進、デジタルスキル向上支援
長期目標（5年）: 次世代リーダー輩出、組織文化変革、地域医療貢献人材育成
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `短期目標リスト` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `中期目標リスト` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `長期目標リスト` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model HRStrategyRoadmap {
  id              String    @id @default(cuid())
  facilityId      String    @map("facility_id")
  timeframe       String                                  // "short_term", "mid_term", "long_term"
  title           String                                  // "新人研修プログラム刷新"
  description     String?   @db.Text
  targetYear      Int       @map("target_year")          // 2026, 2028, 2030
  status          String    @default("planned")          // "planned", "in_progress", "completed"
  order           Int       @default(0)                  // 表示順序

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  facility        Facility  @relation(fields: [facilityId], references: [id])

  @@index([facilityId, timeframe])
  @@map("hr_strategy_roadmap")
}
```

---

### 2. 組織開発タブ（org_development）

#### 2-1. 組織健全性指標（98-138行目）

**表示内容**:
```typescript
職員エンゲージメント: 82%
組織コミットメント: 78%
チーム協働性: 85%
イノベーション指向: 70%
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `エンゲージメント` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `コミットメント` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `チーム協働性` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `イノベーション指向` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model OrganizationHealthMetrics {
  id                      String    @id @default(cuid())
  facilityId              String    @map("facility_id")
  departmentId            String?   @map("department_id")        // 部門別測定も可能
  measurementDate         DateTime  @map("measurement_date")

  // 指標（0-100）
  employeeEngagement      Float     @map("employee_engagement")     // 82
  organizationCommitment  Float     @map("organization_commitment") // 78
  teamCollaboration       Float     @map("team_collaboration")      // 85
  innovationOrientation   Float     @map("innovation_orientation")  // 70

  // 測定方法
  measurementMethod       String    @map("measurement_method")   // "survey", "calculated", "ai_analysis"
  sampleSize              Int?      @map("sample_size")          // 回答者数

  createdAt               DateTime  @default(now()) @map("created_at")

  facility                Facility     @relation(fields: [facilityId], references: [id])
  department              Department?  @relation(fields: [departmentId], references: [id])

  @@index([facilityId, measurementDate])
  @@index([departmentId, measurementDate])
  @@map("organization_health_metrics")
}
```

#### 2-2. 組織開発プログラム（140-168行目）

**表示内容**:
```typescript
- チームビルディング研修: 参加予定45名、準備中
- リーダーシップ開発: 参加中12名、進行中
- 文化変革ワークショップ: 完了78名、完了
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `プログラム名` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `説明` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `参加者数` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `ステータス` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model OrgDevelopmentProgram {
  id                  String    @id @default(cuid())
  facilityId          String    @map("facility_id")
  name                String                                      // "チームビルディング研修"
  description         String    @db.Text                          // "部門間コラボレーション強化"
  category            String                                      // "team_building", "leadership", "culture"
  status              String                                      // "preparing", "in_progress", "completed"

  // 参加者管理
  plannedParticipants Int       @map("planned_participants")     // 45
  currentParticipants Int       @default(0) @map("current_participants") // 12
  completedParticipants Int     @default(0) @map("completed_participants") // 78

  // 日程
  scheduledDate       DateTime? @map("scheduled_date")
  startDate           DateTime? @map("start_date")
  endDate             DateTime? @map("end_date")

  // 予算
  budgetAllocated     Float?    @map("budget_allocated")
  budgetUsed          Float?    @map("budget_used")

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  facility            Facility  @relation(fields: [facilityId], references: [id])
  participants        ProgramParticipant[]

  @@index([facilityId])
  @@index([status])
  @@map("org_development_programs")
}

model ProgramParticipant {
  id              String    @id @default(cuid())
  programId       String    @map("program_id")
  employeeId      String    @map("employee_id")
  status          String    @default("enrolled")  // "enrolled", "in_progress", "completed", "dropped"
  enrolledAt      DateTime  @default(now()) @map("enrolled_at")
  completedAt     DateTime? @map("completed_at")

  program         OrgDevelopmentProgram @relation(fields: [programId], references: [id], onDelete: Cascade)
  employee        Employee  @relation(fields: [employeeId], references: [id])

  @@unique([programId, employeeId])
  @@index([programId])
  @@index([employeeId])
  @@map("program_participants")
}
```

#### 2-3. 組織ネットワーク分析（171-213行目）

**表示内容**:
```typescript
影響力の高い職員: demoUsers上位5名（ランダム影響度70-100）
部門間連携度:
  - 看護部 ↔ 医療技術部: 高
  - 事務部 ↔ 各診療科: 中
  - リハビリ ↔ 栄養科: 低
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `影響力スコア` | 🟡 VoiceDrive活動から計算 | 🟡 補助データ | 両方協力 | API | 🔴 **要追加** |
| `部門間連携度` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model InfluenceAnalysis {
  id              String    @id @default(cuid())
  employeeId      String    @map("employee_id")
  facilityId      String    @map("facility_id")
  analysisDate    DateTime  @map("analysis_date")

  // 影響力指標
  influenceScore  Int       @map("influence_score")      // 0-100
  networkSize     Int       @map("network_size")         // 直接つながり人数
  centralityScore Float     @map("centrality_score")     // ネットワーク中心性

  // 計算ソース
  voiceDriveActivity  Float?  @map("voicedrive_activity")  // VoiceDrive活動度
  meetingParticipation Float? @map("meeting_participation") // 会議参加率
  projectLeadership   Float?  @map("project_leadership")    // プロジェクトリーダー経験

  createdAt       DateTime  @default(now()) @map("created_at")

  employee        Employee  @relation(fields: [employeeId], references: [id])
  facility        Facility  @relation(fields: [facilityId], references: [id])

  @@unique([employeeId, analysisDate])
  @@index([facilityId, influenceScore])
  @@map("influence_analysis")
}

model DepartmentCollaboration {
  id                  String    @id @default(cuid())
  facilityId          String    @map("facility_id")
  departmentAId       String    @map("department_a_id")
  departmentBId       String    @map("department_b_id")
  analysisDate        DateTime  @map("analysis_date")

  collaborationLevel  String    @map("collaboration_level")  // "high", "medium", "low"
  collaborationScore  Float     @map("collaboration_score")  // 0-100

  // 計測指標
  sharedProjects      Int       @default(0) @map("shared_projects")
  crossMeetings       Int       @default(0) @map("cross_meetings")
  sharedResources     Int       @default(0) @map("shared_resources")

  createdAt           DateTime  @default(now()) @map("created_at")

  facility            Facility     @relation(fields: [facilityId], references: [id])
  departmentA         Department   @relation("DeptA", fields: [departmentAId], references: [id])
  departmentB         Department   @relation("DeptB", fields: [departmentBId], references: [id])

  @@unique([departmentAId, departmentBId, analysisDate])
  @@index([facilityId, analysisDate])
  @@map("department_collaboration")
}
```

---

### 3. パフォーマンス分析タブ（performance_analytics）

#### 3-1. パフォーマンス指標カード（218-239行目）

**表示内容**:
```typescript
総合パフォーマンス: 8.7/10 (+0.3 前年比)
生産性指標: 112% (目標比)
品質スコア: 9.2/10 (+0.5 前年比)
イノベーション度: 7.8/10 (±0 前年比)
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `総合パフォーマンス` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `生産性指標` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `品質スコア` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `イノベーション度` | 🟡 VoiceDriveから一部 | ✅ マスタ | 両方協力 | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model PerformanceAnalytics {
  id                      String    @id @default(cuid())
  facilityId              String    @map("facility_id")
  departmentId            String?   @map("department_id")
  analysisDate            DateTime  @map("analysis_date")
  fiscalYear              Int       @map("fiscal_year")

  // パフォーマンス指標（0-10スケール）
  overallPerformance      Float     @map("overall_performance")       // 8.7
  productivityScore       Float     @map("productivity_score")        // 1.12 (112%)
  qualityScore            Float     @map("quality_score")             // 9.2
  innovationScore         Float     @map("innovation_score")          // 7.8

  // 前年比
  performanceChange       Float?    @map("performance_change")        // +0.3
  productivityChange      Float?    @map("productivity_change")
  qualityChange           Float?    @map("quality_change")            // +0.5
  innovationChange        Float?    @map("innovation_change")         // 0.0

  // 目標比
  productivityTarget      Float?    @map("productivity_target")       // 1.0 (100%)

  createdAt               DateTime  @default(now()) @map("created_at")

  facility                Facility     @relation(fields: [facilityId], references: [id])
  department              Department?  @relation(fields: [departmentId], references: [id])

  @@unique([facilityId, departmentId, analysisDate])
  @@index([facilityId, fiscalYear])
  @@map("performance_analytics")
}
```

#### 3-2. 部門別パフォーマンス（241-273行目）

**表示内容**:
```typescript
看護部: 9.2/10
医療技術部: 8.8/10
事務部: 8.5/10
```

**データソース**: 上記`PerformanceAnalytics`テーブルの`departmentId`別集計で対応可能

#### 3-3. 改善提案実績（275-294行目）

**表示内容**:
```typescript
年間提案数: 124
採用済み: 89
コスト削減効果: ¥2.4M
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `年間提案数` | ✅ VoiceDrive Post集計 | ❌ | VoiceDrive | VD内部計算 | ✅ OK（要実装） |
| `採用済み数` | 🟡 ProjectまたはPostステータス | 🟡 | 両方協力 | VD内部計算 | 🟡 **要明確化** |
| `コスト削減効果` | ❌ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model ImprovementProposal {
  id                    String    @id @default(cuid())
  voiceDrivePostId      String?   @map("voicedrive_post_id")  // VoiceDrive投稿ID
  title                 String
  description           String    @db.Text
  proposedByEmployeeId  String    @map("proposed_by_employee_id")
  status                String                                  // "submitted", "adopted", "rejected", "in_progress", "completed"

  // 効果測定
  estimatedCostSavings  Float?    @map("estimated_cost_savings")  // ¥240万
  actualCostSavings     Float?    @map("actual_cost_savings")
  estimatedTimesSavings Int?      @map("estimated_time_savings")  // 時間削減（分）

  // 日程
  proposedDate          DateTime  @map("proposed_date")
  adoptedDate           DateTime? @map("adopted_date")
  completedDate         DateTime? @map("completed_date")

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  proposedBy            Employee  @relation(fields: [proposedByEmployeeId], references: [id])

  @@index([status])
  @@index([proposedDate])
  @@map("improvement_proposals")
}
```

---

### 4. 退職管理タブ（retirement_management）

#### 4-1. 退職関連統計（300-317行目）

**表示内容**:
```typescript
今年度退職者: 6人
離職率: 3.2%
定年退職予定: 2人
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `今年度退職者数` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🟡 **既存データから計算可** |
| `離職率` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🟡 **既存データから計算可** |
| `定年退職予定` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🟡 **既存データから計算可** |

**データソース**: 医療システムの`Employee`テーブルで`isRetired=true`の職員を集計可能。API提供のみで新規テーブル不要。

#### 4-2. 退職プロセス管理（319-343行目）

**表示内容**:
```typescript
- 山田花子 - 看護師: 引き継ぎ中、退職予定2025/1/31
- 佐藤太郎 - 技師: 面談実施中、退職予定2025/2/28
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `退職予定者リスト` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `引き継ぎステータス` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `退職面談状況` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model RetirementProcess {
  id                    String    @id @default(cuid())
  employeeId            String    @map("employee_id")
  retirementDate        DateTime  @map("retirement_date")
  retirementType        String    @map("retirement_type")  // "voluntary", "mandatory", "retirement_age"

  // プロセス管理
  status                String    @default("initiated")    // "initiated", "handover", "interview_done", "completed"
  handoverStatus        String?   @map("handover_status")  // "not_started", "in_progress", "completed"
  interviewStatus       String?   @map("interview_status") // "scheduled", "completed", "skipped"

  // 引き継ぎ
  handoverDocument      String?   @db.Text @map("handover_document")
  successorEmployeeId   String?   @map("successor_employee_id")

  // 面談
  exitInterviewDate     DateTime? @map("exit_interview_date")
  exitInterviewerId     String?   @map("exit_interviewer_id")

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  employee              Employee  @relation("RetirementProcess", fields: [employeeId], references: [id])
  successor             Employee? @relation("Successor", fields: [successorEmployeeId], references: [id])
  interviewer           Employee? @relation("ExitInterviewer", fields: [exitInterviewerId], references: [id])

  @@unique([employeeId])
  @@index([retirementDate])
  @@map("retirement_processes")
}
```

#### 4-3. 退職理由分析（346-388行目）

**表示内容**:
```typescript
退職理由（過去1年）:
  - キャリアアップ: 40%
  - 家庭事情: 25%
  - 他業界転職: 20%
  - 定年退職: 15%

改善アクション:
  - キャリアパス明確化: 昇進・昇格基準の透明化
  - ワークライフバランス向上: 柔軟な勤務制度導入
  - エンゲージメント強化: 定期面談とフィードバック充実
```

**必要なデータソース**:

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `退職理由分類` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `退職理由割合` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |
| `改善アクション` | ❌ 表示のみ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

**推奨スキーマ（医療システム）**:
```prisma
model RetirementReason {
  id              String    @id @default(cuid())
  employeeId      String    @map("employee_id")
  retirementDate  DateTime  @map("retirement_date")

  // 退職理由（複数選択可能）
  primaryReason   String    @map("primary_reason")    // "career_growth", "family", "industry_change", "retirement_age", "health", "relocation"
  secondaryReasons String?  @db.Text @map("secondary_reasons") // JSON array

  // 詳細
  reasonDetails   String?   @db.Text @map("reason_details")
  satisfaction    Int?                                  // 1-5満足度
  wouldRecommend  Boolean?  @map("would_recommend")    // 推奨度

  // 改善提案（退職者からのフィードバック）
  improvementSuggestions String? @db.Text @map("improvement_suggestions")

  createdAt       DateTime  @default(now()) @map("created_at")

  employee        Employee  @relation(fields: [employeeId], references: [id])

  @@unique([employeeId])
  @@index([retirementDate])
  @@index([primaryReason])
  @@map("retirement_reasons")
}

model RetentionAction {
  id                String    @id @default(cuid())
  facilityId        String    @map("facility_id")
  title             String                              // "キャリアパス明確化"
  description       String    @db.Text                  // "昇進・昇格基準の透明化"
  targetReason      String    @map("target_reason")     // "career_growth"対策
  status            String    @default("planned")       // "planned", "in_progress", "completed"
  priority          Int       @default(5)               // 1-10

  // 実施状況
  startDate         DateTime? @map("start_date")
  completedDate     DateTime? @map("completed_date")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  facility          Facility  @relation(fields: [facilityId], references: [id])

  @@index([facilityId])
  @@index([targetReason])
  @@map("retention_actions")
}
```

---

## 📋 必要な追加テーブル一覧

### 医療システム側で追加が必要（8件）

#### 🔴 優先度: 最高（Level 16機能の基盤）

1. **StrategicHRGoal** - 戦略的人事目標
2. **StrategicInitiative** - 戦略的イニシアチブ
3. **HRStrategyRoadmap** - 人材戦略ロードマップ
4. **OrganizationHealthMetrics** - 組織健全性指標
5. **OrgDevelopmentProgram** + **ProgramParticipant** - 組織開発プログラム
6. **PerformanceAnalytics** - パフォーマンス分析
7. **RetirementProcess** - 退職プロセス管理
8. **RetirementReason** + **RetentionAction** - 退職理由分析・改善アクション

#### 🟡 優先度: 高（データ分析強化）

9. **InfluenceAnalysis** - 影響力分析
10. **DepartmentCollaboration** - 部門間連携度
11. **ImprovementProposal** - 改善提案実績管理

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
StrategicHRPage
  ↓ 表示
全データ: ハードコード（ダミーデータ）
影響力の高い職員: demoUsers（ランダム）
```

### Phase 1完了後（医療システムAPI提供）
```
StrategicHRPage (VoiceDrive)
  ↓ API呼び出し
医療システム API
  ├─ GET /api/v2/strategic-hr/goals
  ├─ GET /api/v2/strategic-hr/initiatives
  ├─ GET /api/v2/org-health/metrics
  ├─ GET /api/v2/org-development/programs
  ├─ GET /api/v2/performance/analytics
  ├─ GET /api/v2/retirement/statistics
  ├─ GET /api/v2/retirement/processes
  └─ GET /api/v2/influence/analysis
  ↓
医療システム DB
  ├─ StrategicHRGoal
  ├─ StrategicInitiative
  ├─ OrganizationHealthMetrics
  ├─ OrgDevelopmentProgram
  ├─ PerformanceAnalytics
  ├─ RetirementProcess
  ├─ RetirementReason
  └─ InfluenceAnalysis
```

### Phase 2完了後（VoiceDrive連携強化）
```
StrategicHRPage (VoiceDrive)
  ↓ API呼び出し
医療システム API
  ↓
医療システム DB + VoiceDrive活動データ
  ├─ 影響力分析: VoiceDrive Post/Vote/Feedback統計を組み合わせ
  ├─ イノベーション度: VoiceDrive提案数を加味
  └─ 改善提案実績: VoiceDrive Post → 医療システム ImprovementProposal連携
```

---

## 🎯 実装優先順位

### Phase 1: 基本表示（2-3週間）

**目標**: StrategicHRPageが実データで動作する

#### Week 1-2: 医療システム側DB構築
1. 🔴 StrategicHRGoal テーブル追加
2. 🔴 StrategicInitiative テーブル追加
3. 🔴 HRStrategyRoadmap テーブル追加
4. 🔴 OrganizationHealthMetrics テーブル追加
5. 🔴 OrgDevelopmentProgram + ProgramParticipant テーブル追加
6. 🔴 PerformanceAnalytics テーブル追加
7. 🔴 RetirementProcess テーブル追加
8. 🔴 RetirementReason + RetentionAction テーブル追加

#### Week 2-3: 医療システム側API実装
1. 🔴 GET /api/v2/strategic-hr/goals
2. 🔴 GET /api/v2/strategic-hr/initiatives
3. 🔴 GET /api/v2/strategic-hr/roadmap
4. 🔴 GET /api/v2/org-health/metrics
5. 🔴 GET /api/v2/org-development/programs
6. 🔴 GET /api/v2/performance/analytics
7. 🔴 GET /api/v2/retirement/statistics
8. 🔴 GET /api/v2/retirement/processes
9. 🔴 GET /api/v2/retirement/reason-analysis

#### Week 3: VoiceDrive側実装
1. 🔴 医療システムAPIクライアント実装（9エンドポイント）
2. 🔴 StrategicHRPageのハードコードデータを実データに置き換え
3. 🔴 エラーハンドリング・ローディング状態実装

**このPhaseで動作する機能**:
- ✅ 戦略目標表示（実データ）
- ✅ 戦略的イニシアチブ表示（実データ）
- ✅ 人材戦略ロードマップ表示（実データ）
- ✅ 組織健全性指標表示（実データ）
- ✅ 組織開発プログラム表示（実データ）
- ✅ パフォーマンス分析表示（実データ）
- ✅ 退職管理表示（実データ）
- ⚠️ 影響力分析（まだダミーデータ）

---

### Phase 2: 高度な分析機能（1-2週間）

**目標**: VoiceDrive活動データと医療システムデータの統合分析

#### Week 4-5: 分析機能強化
1. 🟡 InfluenceAnalysis テーブル追加
2. 🟡 DepartmentCollaboration テーブル追加
3. 🟡 ImprovementProposal テーブル追加
4. 🟡 GET /api/v2/influence/analysis 実装
5. 🟡 GET /api/v2/influence/department-collaboration 実装
6. 🟡 GET /api/v2/improvement/proposals 実装
7. 🟡 VoiceDrive活動データを医療システムに提供するAPI実装
   - GET /api/voicedrive/employees/{id}/activity-stats
   - GET /api/voicedrive/improvement-proposals
8. 🟡 医療システム側で影響力スコア計算バッチ実装
9. 🟡 VoiceDrive側で影響力の高い職員表示を実データに置き換え

**このPhaseで動作する機能**:
- ✅ 影響力分析（実データ、VoiceDrive活動を加味）
- ✅ 部門間連携度（実データ）
- ✅ 改善提案実績（VoiceDrive投稿と医療システム管理の統合）

---

### Phase 3: ダッシュボード最適化（1週間）

**目標**: パフォーマンス向上とユーザー体験改善

1. 🟢 API レスポンスキャッシュ実装（Redis）
2. 🟢 バッチ更新処理（日次・週次）
3. 🟢 グラフ・チャート表示の追加
4. 🟢 エクスポート機能（PDF/Excel）
5. 🟢 リアルタイム更新（WebSocket）

---

## ✅ チェックリスト

### 医療システム側の実装

#### DB構築（8テーブル）
- [ ] StrategicHRGoal テーブル作成
- [ ] StrategicInitiative テーブル作成
- [ ] HRStrategyRoadmap テーブル作成
- [ ] OrganizationHealthMetrics テーブル作成
- [ ] OrgDevelopmentProgram + ProgramParticipant テーブル作成
- [ ] PerformanceAnalytics テーブル作成
- [ ] RetirementProcess テーブル作成
- [ ] RetirementReason + RetentionAction テーブル作成
- [ ] InfluenceAnalysis テーブル作成（Phase 2）
- [ ] DepartmentCollaboration テーブル作成（Phase 2）
- [ ] ImprovementProposal テーブル作成（Phase 2）

#### API実装（9エンドポイント）
- [ ] GET /api/v2/strategic-hr/goals
- [ ] GET /api/v2/strategic-hr/initiatives
- [ ] GET /api/v2/strategic-hr/roadmap
- [ ] GET /api/v2/org-health/metrics
- [ ] GET /api/v2/org-development/programs
- [ ] GET /api/v2/performance/analytics
- [ ] GET /api/v2/retirement/statistics
- [ ] GET /api/v2/retirement/processes
- [ ] GET /api/v2/retirement/reason-analysis
- [ ] GET /api/v2/influence/analysis（Phase 2）
- [ ] GET /api/v2/influence/department-collaboration（Phase 2）
- [ ] GET /api/v2/improvement/proposals（Phase 2）

#### テスト
- [ ] 単体テスト（各APIエンドポイント）
- [ ] 統合テスト（DB→API）
- [ ] パフォーマンステスト（大規模データ）

---

### VoiceDrive側の実装

#### API統合
- [ ] 医療システムAPIクライアント実装（9エンドポイント）
- [ ] エラーハンドリング・リトライ機能
- [ ] キャッシュ機能（オプショナル）

#### UI実装
- [ ] StrategicHRPage ハードコードデータ削除
- [ ] 実データ接続（9セクション）
- [ ] ローディング状態表示
- [ ] エラー状態表示
- [ ] データが無い場合の表示

#### Phase 2実装
- [ ] VoiceDrive活動統計API提供（医療システム向け）
- [ ] 影響力分析の実データ表示
- [ ] 改善提案実績の統合表示

#### テスト
- [ ] E2Eテスト（StrategicHRPage全機能）
- [ ] パフォーマンステスト（1000ユーザー想定）
- [ ] Level 16権限チェックテスト

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [organization-analytics_DB要件分析_20251010.md](./organization-analytics_DB要件分析_20251010.md)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
次回レビュー: Phase 1実装後
