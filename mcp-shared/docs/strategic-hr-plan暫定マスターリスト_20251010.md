# 戦略的人事計画ページ 暫定マスターリスト

**作成日**: 2025年10月10日
**対象ページ**: StrategicHRPage (`src/pages/StrategicHRPage.tsx`)
**Permission Level**: Level 16+（経営幹部）
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- 戦略的人事計画ページはLevel 16経営幹部専用の戦略管理機能
- 4つのタブ（戦略的人事計画、組織開発、パフォーマンス分析、退職管理）
- 現在は**すべてハードコードされたダミーデータ**で動作
- 医療システムからの専門的な人事戦略データ受信が必要

### 必要な対応
1. **医療システムからのAPI提供**: 12件
2. **医療システムDB追加**: テーブル11件
3. **VoiceDrive側実装**: API統合のみ（新規テーブル不要）
4. **確認事項**: 5件

### 優先度
**Priority: HIGH（Level 16経営幹部機能）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（12件）

#### API-1: 戦略的人事目標取得API

**エンドポイント**:
```
GET /api/v2/strategic-hr/goals?fiscalYear=2025&facilityId={facilityId}
```

**必要な理由**:
- StrategicHRPage 23-39行目で戦略目標を表示
- 職員満足度目標、離職率目標、年間採用目標
- 現在ハードコード（95%, 5%, 120人）

**レスポンス例**:
```json
{
  "fiscalYear": 2025,
  "facilityId": "tategami-hospital",
  "employeeSatisfactionTarget": 95.0,
  "turnoverRateTarget": 5.0,
  "annualHiringTarget": 120,
  "currentSatisfaction": 87.5,
  "currentTurnoverRate": 3.2,
  "currentHiring": 45
}
```

**セキュリティ**:
- JWT Bearer Token認証
- Permission Level 16以上
- Rate Limit: 100 req/min/IP

---

#### API-2: 戦略的イニシアチブ取得API

**エンドポイント**:
```
GET /api/v2/strategic-hr/initiatives?facilityId={facilityId}&status=in_progress
```

**必要な理由**:
- StrategicHRPage 41-60行目でイニシアチブを表示
- タレントマネジメント、働き方改革、デジタル人事等の施策
- 進捗率、期限、説明

**レスポンス例**:
```json
{
  "initiatives": [
    {
      "id": "INIT-2025-001",
      "name": "タレントマネジメント強化",
      "description": "高パフォーマー育成とキャリアパス最適化",
      "category": "talent",
      "progressPercent": 75,
      "deadline": "2025-03-31",
      "status": "in_progress",
      "ownerId": "EMP2024001",
      "ownerName": "山田 部長"
    }
  ]
}
```

---

#### API-3: 人材戦略ロードマップ取得API

**エンドポイント**:
```
GET /api/v2/strategic-hr/roadmap?facilityId={facilityId}
```

**必要な理由**:
- StrategicHRPage 63-92行目でロードマップを表示
- 短期（1年）・中期（3年）・長期（5年）の目標リスト

**レスポンス例**:
```json
{
  "shortTerm": [
    "新人研修プログラム刷新",
    "評価制度の透明性向上",
    "メンタルヘルス支援強化"
  ],
  "midTerm": [
    "リーダーシップ開発プログラム",
    "多様性・包摂性推進",
    "デジタルスキル向上支援"
  ],
  "longTerm": [
    "次世代リーダー輩出",
    "組織文化変革",
    "地域医療貢献人材育成"
  ]
}
```

---

#### API-4: 組織健全性指標取得API

**エンドポイント**:
```
GET /api/v2/org-health/metrics?facilityId={facilityId}&latest=true
```

**必要な理由**:
- StrategicHRPage 98-138行目で組織健全性指標を表示
- 職員エンゲージメント、組織コミットメント、チーム協働性、イノベーション指向
- 現在ハードコード（82%, 78%, 85%, 70%）

**レスポンス例**:
```json
{
  "facilityId": "tategami-hospital",
  "measurementDate": "2025-09-30",
  "employeeEngagement": 82.0,
  "organizationCommitment": 78.0,
  "teamCollaboration": 85.0,
  "innovationOrientation": 70.0,
  "measurementMethod": "survey",
  "sampleSize": 245
}
```

---

#### API-5: 組織開発プログラム取得API

**エンドポイント**:
```
GET /api/v2/org-development/programs?facilityId={facilityId}
```

**必要な理由**:
- StrategicHRPage 140-168行目で組織開発プログラムを表示
- チームビルディング、リーダーシップ開発、文化変革ワークショップ
- 参加者数、ステータス

**レスポンス例**:
```json
{
  "programs": [
    {
      "id": "PROG-2025-001",
      "name": "チームビルディング研修",
      "description": "部門間コラボレーション強化",
      "category": "team_building",
      "status": "preparing",
      "plannedParticipants": 45,
      "currentParticipants": 0,
      "completedParticipants": 0
    }
  ]
}
```

---

#### API-6: パフォーマンス分析取得API

**エンドポイント**:
```
GET /api/v2/performance/analytics?facilityId={facilityId}&latest=true
```

**必要な理由**:
- StrategicHRPage 218-294行目でパフォーマンス分析を表示
- 総合パフォーマンス、生産性指標、品質スコア、イノベーション度
- 部門別パフォーマンス、改善提案実績

**レスポンス例**:
```json
{
  "facilityId": "tategami-hospital",
  "analysisDate": "2025-09-30",
  "overallPerformance": 8.7,
  "productivityScore": 1.12,
  "qualityScore": 9.2,
  "innovationScore": 7.8,
  "performanceChange": 0.3,
  "qualityChange": 0.5,
  "innovationChange": 0.0,
  "productivityTarget": 1.0
}
```

---

#### API-7: 部門別パフォーマンス取得API

**エンドポイント**:
```
GET /api/v2/performance/analytics/by-department?facilityId={facilityId}
```

**必要な理由**:
- StrategicHRPage 241-273行目で部門別パフォーマンスを表示
- 看護部、医療技術部、事務部等の部門別スコア

**レスポンス例**:
```json
{
  "departments": [
    {
      "departmentName": "看護部",
      "overallPerformance": 9.2
    },
    {
      "departmentName": "医療技術部",
      "overallPerformance": 8.8
    }
  ]
}
```

---

#### API-8: 改善提案実績取得API

**エンドポイント**:
```
GET /api/v2/improvement/proposals/statistics?facilityId={facilityId}&fiscalYear=2025
```

**必要な理由**:
- StrategicHRPage 275-294行目で改善提案実績を表示
- 年間提案数、採用済み数、コスト削減効果

**レスポンス例**:
```json
{
  "fiscalYear": 2025,
  "totalProposals": 124,
  "adoptedProposals": 89,
  "totalCostSavings": 2400000
}
```

---

#### API-9: 退職統計取得API

**エンドポイント**:
```
GET /api/v2/retirement/statistics?facilityId={facilityId}&fiscalYear=2025
```

**必要な理由**:
- StrategicHRPage 300-317行目で退職関連統計を表示
- 今年度退職者数、離職率、定年退職予定者数

**レスポンス例**:
```json
{
  "fiscalYear": 2025,
  "totalRetirements": 6,
  "turnoverRate": 3.2,
  "plannedRetirements": 2
}
```

---

#### API-10: 退職プロセス取得API

**エンドポイント**:
```
GET /api/v2/retirement/processes?facilityId={facilityId}&status=in_progress
```

**必要な理由**:
- StrategicHRPage 319-343行目で退職プロセス管理を表示
- 退職予定者リスト、引き継ぎステータス、面談状況

**レスポンス例**:
```json
{
  "processes": [
    {
      "employeeId": "EMP2024001",
      "employeeName": "山田 花子",
      "position": "看護師",
      "retirementDate": "2025-01-31",
      "status": "handover",
      "handoverStatus": "in_progress",
      "interviewStatus": "completed"
    }
  ]
}
```

---

#### API-11: 退職理由分析取得API

**エンドポイント**:
```
GET /api/v2/retirement/reason-analysis?facilityId={facilityId}&period=1year
```

**必要な理由**:
- StrategicHRPage 346-388行目で退職理由分析を表示
- 退職理由分類と割合
- 改善アクション

**レスポンス例**:
```json
{
  "period": "2024-10-01 to 2025-09-30",
  "totalRetirements": 20,
  "reasonBreakdown": {
    "career_growth": { "count": 8, "percentage": 40 },
    "family": { "count": 5, "percentage": 25 },
    "industry_change": { "count": 4, "percentage": 20 },
    "retirement_age": { "count": 3, "percentage": 15 }
  },
  "retentionActions": [
    {
      "title": "キャリアパス明確化",
      "description": "昇進・昇格基準の透明化",
      "targetReason": "career_growth",
      "status": "in_progress"
    }
  ]
}
```

---

#### API-12: 影響力分析取得API（Phase 2）

**エンドポイント**:
```
GET /api/v2/influence/analysis?facilityId={facilityId}&top=5
```

**必要な理由**:
- StrategicHRPage 171-213行目で影響力の高い職員を表示
- 現在demoUsersでランダム生成
- VoiceDrive活動データと組み合わせた分析

**レスポンス例**:
```json
{
  "topInfluencers": [
    {
      "employeeId": "EMP2024001",
      "employeeName": "山田 太郎",
      "department": "看護部",
      "influenceScore": 95,
      "networkSize": 45,
      "voiceDriveActivity": 78.5
    }
  ],
  "departmentCollaboration": [
    {
      "departmentA": "看護部",
      "departmentB": "医療技術部",
      "collaborationLevel": "high"
    }
  ]
}
```

---

### B. Webhook通知依頼（0件）

**理由**:
- 戦略的人事計画ページはLevel 16経営幹部専用の分析ページ
- リアルタイム更新は不要（日次・週次バッチ更新で十分）
- Webhook通知は必要なし

---

## 🗄️ 医療システムDB構築計画書への追加内容

### C. 新規テーブル追加（11件）

#### Table-1: StrategicHRGoal（戦略的人事目標）

**優先度**: 🔴 **CRITICAL**

**理由**:
- StrategicHRPage 23-39行目で戦略目標を表示
- 経営幹部が設定する年度目標の管理

**スキーマ定義**:
```prisma
model StrategicHRGoal {
  id                          String    @id @default(cuid())
  fiscalYear                  Int       @map("fiscal_year")
  facilityId                  String    @map("facility_id")

  // 目標値
  employeeSatisfactionTarget  Float     @map("employee_satisfaction_target")
  turnoverRateTarget          Float     @map("turnover_rate_target")
  annualHiringTarget          Int       @map("annual_hiring_target")

  // 実績値（計算値）
  currentSatisfaction         Float?    @map("current_satisfaction")
  currentTurnoverRate         Float?    @map("current_turnover_rate")
  currentHiring               Int?      @map("current_hiring")

  // メタデータ
  setByUserId                 String    @map("set_by_user_id")
  approvedAt                  DateTime? @map("approved_at")
  createdAt                   DateTime  @default(now()) @map("created_at")
  updatedAt                   DateTime  @updatedAt @map("updated_at")

  facility                    Facility  @relation(fields: [facilityId], references: [id])

  @@unique([fiscalYear, facilityId])
  @@index([fiscalYear])
  @@map("strategic_hr_goals")
}
```

---

#### Table-2: StrategicInitiative（戦略的イニシアチブ）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model StrategicInitiative {
  id              String    @id @default(cuid())
  facilityId      String    @map("facility_id")
  name            String
  description     String    @db.Text
  category        String
  progressPercent Int       @default(0) @map("progress_percent")
  deadline        DateTime
  ownerId         String    @map("owner_id")
  priority        Int       @default(5) @map("priority")
  status          String    @default("in_progress")

  budgetAllocated Float?    @map("budget_allocated")
  budgetUsed      Float?    @map("budget_used")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  facility        Facility  @relation(fields: [facilityId], references: [id])
  owner           Employee  @relation("InitiativeOwner", fields: [ownerId], references: [id])

  @@index([facilityId])
  @@index([deadline])
  @@map("strategic_initiatives")
}
```

---

#### Table-3: HRStrategyRoadmap（人材戦略ロードマップ）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model HRStrategyRoadmap {
  id          String    @id @default(cuid())
  facilityId  String    @map("facility_id")
  timeframe   String    // "short_term", "mid_term", "long_term"
  title       String
  description String?   @db.Text
  targetYear  Int       @map("target_year")
  status      String    @default("planned")
  order       Int       @default(0)

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  facility    Facility  @relation(fields: [facilityId], references: [id])

  @@index([facilityId, timeframe])
  @@map("hr_strategy_roadmap")
}
```

---

#### Table-4: OrganizationHealthMetrics（組織健全性指標）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model OrganizationHealthMetrics {
  id                      String    @id @default(cuid())
  facilityId              String    @map("facility_id")
  departmentId            String?   @map("department_id")
  measurementDate         DateTime  @map("measurement_date")

  employeeEngagement      Float     @map("employee_engagement")
  organizationCommitment  Float     @map("organization_commitment")
  teamCollaboration       Float     @map("team_collaboration")
  innovationOrientation   Float     @map("innovation_orientation")

  measurementMethod       String    @map("measurement_method")
  sampleSize              Int?      @map("sample_size")

  createdAt               DateTime  @default(now()) @map("created_at")

  facility                Facility     @relation(fields: [facilityId], references: [id])
  department              Department?  @relation(fields: [departmentId], references: [id])

  @@index([facilityId, measurementDate])
  @@index([departmentId, measurementDate])
  @@map("organization_health_metrics")
}
```

---

#### Table-5: OrgDevelopmentProgram（組織開発プログラム）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model OrgDevelopmentProgram {
  id                    String    @id @default(cuid())
  facilityId            String    @map("facility_id")
  name                  String
  description           String    @db.Text
  category              String
  status                String

  plannedParticipants   Int       @map("planned_participants")
  currentParticipants   Int       @default(0) @map("current_participants")
  completedParticipants Int       @default(0) @map("completed_participants")

  scheduledDate         DateTime? @map("scheduled_date")
  startDate             DateTime? @map("start_date")
  endDate               DateTime? @map("end_date")

  budgetAllocated       Float?    @map("budget_allocated")
  budgetUsed            Float?    @map("budget_used")

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  facility              Facility  @relation(fields: [facilityId], references: [id])
  participants          ProgramParticipant[]

  @@index([facilityId])
  @@index([status])
  @@map("org_development_programs")
}

model ProgramParticipant {
  id          String    @id @default(cuid())
  programId   String    @map("program_id")
  employeeId  String    @map("employee_id")
  status      String    @default("enrolled")
  enrolledAt  DateTime  @default(now()) @map("enrolled_at")
  completedAt DateTime? @map("completed_at")

  program     OrgDevelopmentProgram @relation(fields: [programId], references: [id], onDelete: Cascade)
  employee    Employee  @relation(fields: [employeeId], references: [id])

  @@unique([programId, employeeId])
  @@index([programId])
  @@index([employeeId])
  @@map("program_participants")
}
```

---

#### Table-6: PerformanceAnalytics（パフォーマンス分析）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model PerformanceAnalytics {
  id                    String    @id @default(cuid())
  facilityId            String    @map("facility_id")
  departmentId          String?   @map("department_id")
  analysisDate          DateTime  @map("analysis_date")
  fiscalYear            Int       @map("fiscal_year")

  overallPerformance    Float     @map("overall_performance")
  productivityScore     Float     @map("productivity_score")
  qualityScore          Float     @map("quality_score")
  innovationScore       Float     @map("innovation_score")

  performanceChange     Float?    @map("performance_change")
  productivityChange    Float?    @map("productivity_change")
  qualityChange         Float?    @map("quality_change")
  innovationChange      Float?    @map("innovation_change")

  productivityTarget    Float?    @map("productivity_target")

  createdAt             DateTime  @default(now()) @map("created_at")

  facility              Facility     @relation(fields: [facilityId], references: [id])
  department            Department?  @relation(fields: [departmentId], references: [id])

  @@unique([facilityId, departmentId, analysisDate])
  @@index([facilityId, fiscalYear])
  @@map("performance_analytics")
}
```

---

#### Table-7: ImprovementProposal（改善提案）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model ImprovementProposal {
  id                    String    @id @default(cuid())
  voiceDrivePostId      String?   @map("voicedrive_post_id")
  title                 String
  description           String    @db.Text
  proposedByEmployeeId  String    @map("proposed_by_employee_id")
  status                String

  estimatedCostSavings  Float?    @map("estimated_cost_savings")
  actualCostSavings     Float?    @map("actual_cost_savings")
  estimatedTimeSavings  Int?      @map("estimated_time_savings")

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

#### Table-8: RetirementProcess（退職プロセス管理）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model RetirementProcess {
  id                    String    @id @default(cuid())
  employeeId            String    @map("employee_id")
  retirementDate        DateTime  @map("retirement_date")
  retirementType        String    @map("retirement_type")

  status                String    @default("initiated")
  handoverStatus        String?   @map("handover_status")
  interviewStatus       String?   @map("interview_status")

  handoverDocument      String?   @db.Text @map("handover_document")
  successorEmployeeId   String?   @map("successor_employee_id")

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

---

#### Table-9: RetirementReason（退職理由分析）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model RetirementReason {
  id                      String    @id @default(cuid())
  employeeId              String    @map("employee_id")
  retirementDate          DateTime  @map("retirement_date")

  primaryReason           String    @map("primary_reason")
  secondaryReasons        String?   @db.Text @map("secondary_reasons")

  reasonDetails           String?   @db.Text @map("reason_details")
  satisfaction            Int?
  wouldRecommend          Boolean?  @map("would_recommend")

  improvementSuggestions  String?   @db.Text @map("improvement_suggestions")

  createdAt               DateTime  @default(now()) @map("created_at")

  employee                Employee  @relation(fields: [employeeId], references: [id])

  @@unique([employeeId])
  @@index([retirementDate])
  @@index([primaryReason])
  @@map("retirement_reasons")
}
```

---

#### Table-10: RetentionAction（リテンション改善アクション）

**優先度**: 🔴 **CRITICAL**

**スキーマ定義**:
```prisma
model RetentionAction {
  id            String    @id @default(cuid())
  facilityId    String    @map("facility_id")
  title         String
  description   String    @db.Text
  targetReason  String    @map("target_reason")
  status        String    @default("planned")
  priority      Int       @default(5)

  startDate     DateTime? @map("start_date")
  completedDate DateTime? @map("completed_date")

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  facility      Facility  @relation(fields: [facilityId], references: [id])

  @@index([facilityId])
  @@index([targetReason])
  @@map("retention_actions")
}
```

---

#### Table-11: InfluenceAnalysis（影響力分析）- Phase 2

**優先度**: 🟡 **HIGH（Phase 2）**

**スキーマ定義**:
```prisma
model InfluenceAnalysis {
  id                  String    @id @default(cuid())
  employeeId          String    @map("employee_id")
  facilityId          String    @map("facility_id")
  analysisDate        DateTime  @map("analysis_date")

  influenceScore      Int       @map("influence_score")
  networkSize         Int       @map("network_size")
  centralityScore     Float     @map("centrality_score")

  voiceDriveActivity  Float?    @map("voicedrive_activity")
  meetingParticipation Float?   @map("meeting_participation")
  projectLeadership   Float?    @map("project_leadership")

  createdAt           DateTime  @default(now()) @map("created_at")

  employee            Employee  @relation(fields: [employeeId], references: [id])
  facility            Facility  @relation(fields: [facilityId], references: [id])

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

  collaborationLevel  String    @map("collaboration_level")
  collaborationScore  Float     @map("collaboration_score")

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

## 🗄️ VoiceDrive DB構築計画書への追加内容

### D. VoiceDrive側テーブル追加（0件）

**理由**:
- 戦略的人事計画ページは医療システムのデータを表示するのみ
- VoiceDrive側で新規テーブルを追加する必要なし
- API統合のみで実装可能

**注意**:
- Phase 2の影響力分析では、VoiceDriveの`Post`, `VoteHistory`, `Feedback`等の既存テーブルから活動統計を計算し、医療システムに提供するAPI実装が必要

---

## ❓ 医療システムチームへの確認事項

### 確認-1: 戦略目標の設定権限

**質問**:
> 戦略的人事目標（職員満足度目標、離職率目標、年間採用目標）の設定は：
>
> 1. どのPermission Levelのユーザーが設定可能ですか？
>    - Level 16以上？
>    - Level 18（理事長）のみ？
> 2. 目標は年度ごとに設定しますか？
> 3. 施設ごとに個別目標を設定できますか？

**期待回答**:
- Level 16以上が設定可能
- 年度ごとに設定（fiscalYear単位）
- 施設ごとに個別目標設定可能

---

### 確認-2: 組織健全性指標の測定方法

**質問**:
> 組織健全性指標（職員エンゲージメント、組織コミットメント等）の測定方法は：
>
> 1. アンケート調査ですか？AI分析ですか？手動入力ですか？
> 2. 測定頻度はどのくらいですか？（月次、四半期、年次）
> 3. 測定対象者は全職員ですか？サンプリングですか？

**期待回答**:
- アンケート調査（医療システム内で実施）
- 四半期ごと測定
- 全職員対象

---

### 確認-3: パフォーマンス分析の計算ロジック

**質問**:
> パフォーマンス分析（総合パフォーマンス、生産性指標等）の計算方法は：
>
> 1. どのようなデータソースから計算しますか？
>    - V3評価結果？
>    - 勤怠データ？
>    - 売上・コストデータ？
> 2. 計算ロジックは医療システム側で実装済みですか？
> 3. VoiceDriveから提供すべきデータはありますか？

**期待回答**:
- V3評価結果 + 勤怠データ + 経営データを統合
- 医療システム側で計算バッチ実装予定
- VoiceDriveからは改善提案数・採用数を提供

---

### 確認-4: 改善提案のVoiceDrive連携

**質問**:
> 改善提案実績について：
>
> 1. VoiceDriveの`Post`（type="improvement"）を改善提案とみなしますか？
> 2. 「採用済み」のステータスはどこで管理しますか？
>    - VoiceDrive側でPostにstatusフィールド追加？
>    - 医療システム側でImprovementProposalテーブル管理？
> 3. コスト削減効果の入力は誰が行いますか？

**推奨回答**:
- VoiceDrive Postは提案の入口、採用・実施管理は医療システム側
- 医療システムのImprovementProposalテーブルで管理
- `voiceDrivePostId`フィールドでVoiceDrive投稿と紐付け
- コスト削減効果は部門長・経営幹部が入力

---

### 確認-5: 影響力分析の実装時期（Phase 2）

**質問**:
> 影響力分析機能について：
>
> 1. Phase 1では実装不要（demoUsersのまま）でOKですか？
> 2. Phase 2で実装する場合、VoiceDriveから以下のデータ提供が必要です：
>    - 職員ごとの投稿数、投票数、フィードバック数
>    - 部門間のコミュニケーション頻度
> 3. 医療システム側でどのような分析を行いますか？

**期待回答**:
- Phase 1では影響力分析は実装不要（優先度低）
- Phase 2で実装予定
- VoiceDrive活動データ + 会議参加データ + プロジェクトリーダー経験を統合

---

## 📅 想定スケジュール

### Phase 1: 基本機能（3週間）
- **Week 1**: 医療システム側DB構築（テーブル8件）
- **Week 2**: 医療システム側API実装（9エンドポイント）
- **Week 3**: VoiceDrive側API統合、ダミーデータ削除

### Phase 2: 高度な分析機能（2週間）
- **Week 4**: 影響力分析テーブル・API実装
- **Week 5**: VoiceDrive活動データ提供API実装、統合テスト

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │StrategicHRGoal   │  │StrategicInitiative│                │
│  │HRStrategyRoadmap │  │OrgHealthMetrics   │                │
│  │OrgDevelopmentProg│  │PerformanceAnalytics│               │
│  │RetirementProcess │  │ImprovementProposal│                │
│  └──────────────────┘  └──────────────────┘                │
│         │                      │                              │
│         │ ①API提供（12件）     │                              │
│         ▼                      ▼                              │
│  ┌─────────────────────────────────────┐                    │
│  │  API-1~12: 戦略人事データ提供      │                    │
│  └─────────────────────────────────────┘                    │
│         │                                                     │
└─────────┼─────────────────────────────────────────────────────┘
          │
          │ HTTPS + JWT Auth (Level 16+)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  API統合: 12エンドポイント               │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ②データ表示                                        │
│         ▼                                                     │
│  ┌──────────────────────┐                                   │
│  │ StrategicHRPage      │                                   │
│  │  - 戦略的人事計画    │                                   │
│  │  - 組織開発          │                                   │
│  │  - パフォーマンス    │                                   │
│  │  - 退職管理          │                                   │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### 医療システム側作業

#### DB構築（11テーブル）
- [ ] StrategicHRGoal テーブル作成
- [ ] StrategicInitiative テーブル作成
- [ ] HRStrategyRoadmap テーブル作成
- [ ] OrganizationHealthMetrics テーブル作成
- [ ] OrgDevelopmentProgram + ProgramParticipant テーブル作成
- [ ] PerformanceAnalytics テーブル作成
- [ ] ImprovementProposal テーブル作成
- [ ] RetirementProcess テーブル作成
- [ ] RetirementReason テーブル作成
- [ ] RetentionAction テーブル作成
- [ ] InfluenceAnalysis + DepartmentCollaboration テーブル作成（Phase 2）

#### API実装（12エンドポイント）
- [ ] API-1: GET /api/v2/strategic-hr/goals
- [ ] API-2: GET /api/v2/strategic-hr/initiatives
- [ ] API-3: GET /api/v2/strategic-hr/roadmap
- [ ] API-4: GET /api/v2/org-health/metrics
- [ ] API-5: GET /api/v2/org-development/programs
- [ ] API-6: GET /api/v2/performance/analytics
- [ ] API-7: GET /api/v2/performance/analytics/by-department
- [ ] API-8: GET /api/v2/improvement/proposals/statistics
- [ ] API-9: GET /api/v2/retirement/statistics
- [ ] API-10: GET /api/v2/retirement/processes
- [ ] API-11: GET /api/v2/retirement/reason-analysis
- [ ] API-12: GET /api/v2/influence/analysis（Phase 2）

#### テスト
- [ ] 単体テスト（各APIエンドポイント）
- [ ] 統合テスト（DB→API）
- [ ] Permission Level 16権限チェック

---

### VoiceDrive側作業

#### API統合
- [ ] 医療システムAPIクライアント実装（12エンドポイント）
- [ ] エラーハンドリング・リトライ機能
- [ ] Permission Level 16権限チェック

#### UI実装
- [ ] StrategicHRPage ハードコードデータ削除
- [ ] 実データ接続（4タブ、すべてのセクション）
- [ ] ローディング状態表示
- [ ] エラー状態表示
- [ ] データが無い場合の表示

#### Phase 2実装
- [ ] VoiceDrive活動統計API提供（医療システム向け）
- [ ] 影響力分析の実データ表示

#### テスト
- [ ] E2Eテスト（StrategicHRPage全機能）
- [ ] Permission Level 16権限チェックテスト

---

## 📝 補足資料

### 参照ドキュメント

1. **strategic-hr-plan_DB要件分析_20251010.md**
   `mcp-shared/docs/strategic-hr-plan_DB要件分析_20251010.md`

2. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

3. **共通DB構築後統合作業再開計画書**
   `mcp-shared/docs/共通DB構築後統合作業再開計画書_20251008.md`

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
**次のステップ**: 医療システムDB構築 → API実装 → VoiceDrive統合

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-10 | 初版作成 | AI (Claude Code) |
