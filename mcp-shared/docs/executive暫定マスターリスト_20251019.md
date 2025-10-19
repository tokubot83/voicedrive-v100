# Executive Dashboard 暫定マスターリスト

**作成日**: 2025年10月19日
**対象ページ**: Executive Dashboard (`/dashboard/executive`)
**目的**: DB構築完了後の円滑な実装を実現し、医療システムとの統合仕様を明確化する

---

## 📋 エグゼクティブサマリー

### 現状
- Executive Dashboardページは組織全体の健康状態と戦略的意思決定を支援
- 月次KPI、重要アラート、部門パフォーマンス、プロジェクト進捗等を表示
- **現在は全てダミーデータ**（実装準備は完了、データ投入待ち）
- 医療システムとの統合API（Phase 1）は実装完了済み

### 必要な対応
1. **VoiceDrive DB追加**: テーブル4件、サービス6件
2. **医療システムとの統合**: Phase 18.5（2026年1月）でLLM分析統合
3. **管理画面実装**: トピック・アジェンダ管理（Phase 3）

### 優先度
**Priority: HIGH（グループ1: 経営層向けコアページ）**

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### A. 新規テーブル追加（4件）

#### Table-1: ExecutiveAlert（重要アラート）

**優先度**: 🔴 **CRITICAL（Phase 2実装必須）**

**理由**:
- Executive Dashboardの重要アラート表示に必須
- 部門別リスク自動検出（ネガティブ投稿急増、活性度低下、プロジェクト遅延）
- K-匿名性（最小5名）によるプライバシー保護

**スキーマ定義**:
```prisma
/// エグゼクティブダッシュボードアラートテーブル
/// 自動検出された組織的リスク・課題を記録
model ExecutiveAlert {
  id              String    @id @default(cuid())

  // アラート基本情報
  alertType       String    @map("alert_type")
  // "risk" | "engagement" | "delay" | "quality" | "compliance"
  severity        String    @map("severity")
  // "high" | "medium" | "low"

  // 内容
  title           String    @map("title")
  description     String    @map("description")
  department      String?   @map("department")
  affectedCount   Int       @default(0) @map("affected_count")

  // K-匿名性チェック
  anonymityLevel  Int       @default(5) @map("anonymity_level")
  // 最小5名以上でアラート表示

  // 検出情報
  detectedAt      DateTime  @default(now()) @map("detected_at")
  detectionMethod String    @map("detection_method")
  // "threshold" | "trend" | "manual" | "llm_analysis"

  // ステータス
  isAcknowledged  Boolean   @default(false) @map("is_acknowledged")
  acknowledgedBy  String?   @map("acknowledged_by")
  acknowledgedAt  DateTime? @map("acknowledged_at")
  isResolved      Boolean   @default(false) @map("is_resolved")
  resolvedBy      String?   @map("resolved_by")
  resolvedAt      DateTime? @map("resolved_at")

  // 関連データ
  relatedPostIds  Json?     @map("related_post_ids")  // string[]
  metadata        Json?     @map("metadata")

  // タイムスタンプ
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([alertType])
  @@index([severity])
  @@index([department])
  @@index([detectedAt])
  @@index([isAcknowledged])
  @@index([isResolved])
  @@map("executive_alerts")
}
```

**マイグレーション**:
```bash
# VoiceDrive側で実行
npx prisma migrate dev --name add_executive_alert
```

---

#### Table-2: Project（プロジェクト管理）

**優先度**: 🔴 **CRITICAL（Phase 2実装必須）**

**理由**:
- プロジェクト進捗状況表示に必須
- 議題から昇格したプロジェクトの追跡
- マイルストーン管理・更新履歴

**スキーマ定義**:
```prisma
/// プロジェクト管理テーブル
/// 議題から昇格したプロジェクトを管理
model Project {
  id                String    @id @default(cuid())

  // 基本情報
  title             String    @map("title")
  description       String?   @map("description")
  category          String    @map("category")
  // "improvement" | "innovation" | "compliance" | "quality"

  // ステータス
  status            String    @default("proposed") @map("status")
  // "proposed" | "approved" | "in_progress" | "completed" | "cancelled" | "delayed"
  progress          Int       @default(0) @map("progress")  // 0-100

  // 期限管理
  startDate         DateTime? @map("start_date")
  targetDate        DateTime? @map("target_date")
  completedDate     DateTime? @map("completed_date")

  // 責任者・担当者
  ownerId           String    @map("owner_id")
  departmentId      String?   @map("department_id")
  facilityId        String?   @map("facility_id")

  // プロジェクトレベル
  projectLevel      String?   @map("project_level")
  // "DEPT_PROJECT" | "FACILITY_PROJECT" | "ORG_PROJECT"

  // 元となった投稿・議題
  originPostId      String?   @map("origin_post_id")

  // 優先度・インパクト
  priority          String    @default("medium") @map("priority")
  // "low" | "medium" | "high" | "critical"
  expectedImpact    String?   @map("expected_impact")

  // メタデータ
  metadata          Json?     @map("metadata")

  // タイムスタンプ
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  owner             User      @relation("ProjectOwner", fields: [ownerId], references: [id])
  milestones        ProjectMilestone[]
  updates           ProjectUpdate[]

  @@index([status])
  @@index([ownerId])
  @@index([departmentId])
  @@index([facilityId])
  @@index([projectLevel])
  @@index([targetDate])
  @@index([progress])
  @@map("projects")
}

/// プロジェクトマイルストーン
model ProjectMilestone {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  title             String    @map("title")
  targetDate        DateTime  @map("target_date")
  completedDate     DateTime? @map("completed_date")
  isCompleted       Boolean   @default(false) @map("is_completed")
  order             Int       @default(0) @map("order")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([targetDate])
  @@map("project_milestones")
}

/// プロジェクト更新履歴
model ProjectUpdate {
  id                String    @id @default(cuid())
  projectId         String    @map("project_id")
  updateType        String    @map("update_type")
  // "status_change" | "progress_update" | "milestone_completed" | "comment"
  content           String    @map("content")
  previousValue     String?   @map("previous_value")
  newValue          String?   @map("new_value")
  updatedBy         String    @map("updated_by")
  createdAt         DateTime  @default(now()) @map("created_at")

  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([createdAt])
  @@map("project_updates")
}
```

**Userモデルへの追加**:
```prisma
model User {
  // ... 既存フィールド
  ownedProjects     Project[]  @relation("ProjectOwner")  // 🆕 追加
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_project_management
```

---

#### Table-3: KeyTopic（重要トピック）

**優先度**: 🟡 **RECOMMENDED（Phase 3実装推奨）**

**理由**:
- 重要トピックTOP5表示に必須
- 戦略的課題の可視化
- 管理者による手動登録・管理

**スキーマ定義**:
```prisma
/// 重要トピック管理テーブル
/// エグゼクティブダッシュボードに表示する戦略的重要トピック
model KeyTopic {
  id                String    @id @default(cuid())

  // 基本情報
  title             String    @map("title")
  description       String?   @map("description")

  // ステータス
  status            String    @map("status")
  // "proposed" | "under_review" | "committee_approved" | "in_progress" | "completed"
  statusLabel       String    @map("status_label")
  // 日本語表示用: "提案段階" | "審議中" | "委員会承認済み" | "実装中" | "決議済み"

  // インパクト・優先度
  impact            String    @map("impact")
  priority          String    @map("priority")
  // "low" | "medium" | "high"

  // 表示制御
  isVisible         Boolean   @default(true) @map("is_visible")
  displayOrder      Int       @default(0) @map("display_order")

  // 関連情報
  relatedPostIds    Json?     @map("related_post_ids")  // string[]
  relatedProjectId  String?   @map("related_project_id")

  // 作成者・更新者
  createdBy         String    @map("created_by")
  updatedBy         String?   @map("updated_by")

  // タイムスタンプ
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([status])
  @@index([priority])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("key_topics")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_key_topic
```

---

#### Table-4: BoardAgenda（理事会アジェンダ）

**優先度**: 🟡 **RECOMMENDED（Phase 3実装推奨）**

**理由**:
- 次回理事会アジェンダ表示に必須
- 議題管理・資料生成
- 会議記録の保存

**スキーマ定義**:
```prisma
/// 理事会アジェンダ管理テーブル
/// 理事会・運営会議の議題を管理
model BoardAgenda {
  id                String    @id @default(cuid())

  // 会議情報
  meetingDate       DateTime  @map("meeting_date")
  meetingType       String    @map("meeting_type")
  // "board" | "executive" | "management"

  // 議題情報
  agendaItem        String    @map("agenda_item")
  description       String?   @map("description")
  duration          String    @map("duration")  // "15分" | "20分"
  presenter         String    @map("presenter")
  presenterTitle    String?   @map("presenter_title")

  // 優先度・カテゴリ
  priority          String    @default("medium") @map("priority")
  // "low" | "medium" | "high"
  category          String?   @map("category")
  // "hr" | "finance" | "operations" | "strategy" | "compliance"

  // 表示制御
  displayOrder      Int       @default(0) @map("display_order")
  isVisible         Boolean   @default(true) @map("is_visible")

  // 関連情報
  relatedTopicId    String?   @map("related_topic_id")
  relatedProjectId  String?   @map("related_project_id")
  attachments       Json?     @map("attachments")  // ファイルパス等

  // 結果記録
  isCompleted       Boolean   @default(false) @map("is_completed")
  decision          String?   @map("decision")
  notes             String?   @map("notes")

  // 作成者・更新者
  createdBy         String    @map("created_by")
  updatedBy         String?   @map("updated_by")

  // タイムスタンプ
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([meetingDate])
  @@index([meetingType])
  @@index([priority])
  @@index([displayOrder])
  @@index([isVisible])
  @@map("board_agendas")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_board_agenda
```

---

### B. 既存テーブル確認（1件）

#### Verify-1: ExecutiveStrategicInsightテーブル

**対象テーブル**: `ExecutiveStrategicInsight`（既に定義済み）

**確認内容**:
- ✅ schema.prisma 2182-2206行目に既に定義済み
- ✅ POST /api/v1/executive/strategic-insights 実装済み
- ✅ 医療システムからのLLM分析結果受信準備完了
- ⏳ Phase 18.5（2026年1月）で本格稼働予定

**スキーマ確認**:
```prisma
model ExecutiveStrategicInsight {
  id                 String    @id @default(cuid())
  analysisDate       DateTime  @map("analysis_date")
  insightType        String    @map("insight_type")
  severity           String?   @map("severity")
  title              String    @map("title")
  analysis           String    @map("analysis")
  rootCause          String?   @map("root_cause")
  recommendedActions Json      @map("recommended_actions")
  bestPractice       Json?     @map("best_practice")
  predictions        Json?     @map("predictions")
  strategicData      Json?     @map("strategic_data")
  isAcknowledged     Boolean   @default(false) @map("is_acknowledged")
  acknowledgedBy     String?   @map("acknowledged_by")
  acknowledgedAt     DateTime? @map("acknowledged_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  @@index([analysisDate])
  @@index([insightType])
  @@index([severity])
  @@index([isAcknowledged])
  @@index([analysisDate, insightType])
  @@map("executive_strategic_insights")
}
```

**マイグレーション**: DB構築時に自動作成（追加作業不要）

---

## 🔧 VoiceDrive新規サービス実装（6件）

### Service-1: ExecutiveKPIService（月次KPI集計）

**優先度**: 🔴 **CRITICAL（Phase 1実装必須）**

**理由**:
- 月次KPIサマリー表示に必須（総投稿数、議題化、委員会提出、決議済み等）
- Postテーブルから統計を集計

**実装ファイル**: `src/services/ExecutiveKPIService.ts`

**主要関数**:
```typescript
export async function getMonthlyKPIs(
  year: number,
  month: number,
  facilityIds?: string[]
): Promise<MonthlyKPIs>
```

**APIエンドポイント**:
```
GET /api/executive/kpis?year=2025&month=10&facilityIds=H001,R001
```

---

### Service-2: DepartmentPerformanceService（部門別パフォーマンス集計）

**優先度**: 🔴 **CRITICAL（Phase 1実装必須）**

**理由**:
- 部門別パフォーマンス表示に必須（投稿数、議題数、活性度スコア、トレンド）
- 前月比較によるトレンド計算

**実装ファイル**: `src/services/DepartmentPerformanceService.ts`

**主要関数**:
```typescript
export async function getDepartmentPerformance(
  year: number,
  month: number,
  topN: number = 10
): Promise<DepartmentPerformance[]>
```

**APIエンドポイント**:
```
GET /api/executive/department-performance?year=2025&month=10&limit=10
```

---

### Service-3: ExecutiveAlertService（アラート検出）

**優先度**: 🔴 **CRITICAL（Phase 2実装必須）**

**理由**:
- 重要アラート自動検出に必須
- ネガティブ投稿急増、部門活性度低下、プロジェクト遅延を検出
- K-匿名性チェック（最小5名）

**実装ファイル**: `src/services/ExecutiveAlertService.ts`

**主要関数**:
```typescript
export async function detectNegativeSurge(
  startDate: Date,
  endDate: Date
): Promise<AlertDetectionResult>

export async function detectEngagementDrop(
  currentPeriod: { start: Date; end: Date },
  previousPeriod: { start: Date; end: Date }
): Promise<AlertDetectionResult>
```

**APIエンドポイント**:
```
GET /api/executive/alerts?year=2025&month=10
POST /api/executive/alerts/detect  // 手動検出トリガー
```

---

### Service-4: ProjectProgressService（プロジェクト進捗管理）

**優先度**: 🔴 **CRITICAL（Phase 2実装必須）**

**理由**:
- プロジェクト進捗サマリー表示に必須
- 進行中、完了、遅延プロジェクトの集計

**実装ファイル**: `src/services/ProjectProgressService.ts`

**主要関数**:
```typescript
export async function getProjectProgressSummary(): Promise<ProjectProgressSummary>
```

**APIエンドポイント**:
```
GET /api/executive/projects/summary
GET /api/executive/projects  // プロジェクト一覧
POST /api/executive/projects  // プロジェクト作成
PUT /api/executive/projects/:id  // プロジェクト更新
```

---

### Service-5: KeyTopicManagementService（重要トピック管理）

**優先度**: 🟡 **RECOMMENDED（Phase 3実装推奨）**

**理由**:
- 重要トピックTOP5表示に必須
- 管理者による手動登録・管理

**実装ファイル**: `src/services/KeyTopicManagementService.ts`

**APIエンドポイント**:
```
GET /api/executive/key-topics?limit=5
POST /api/executive/key-topics  // 追加（管理者のみ）
PUT /api/executive/key-topics/:id  // 更新（管理者のみ）
DELETE /api/executive/key-topics/:id  // 削除（管理者のみ）
```

---

### Service-6: BoardAgendaManagementService（理事会アジェンダ管理）

**優先度**: 🟡 **RECOMMENDED（Phase 3実装推奨）**

**理由**:
- 次回理事会アジェンダ表示に必須
- 議題管理・資料生成

**実装ファイル**: `src/services/BoardAgendaManagementService.ts`

**APIエンドポイント**:
```
GET /api/executive/board-agendas?meetingDate=2025-11-15
POST /api/executive/board-agendas  // 追加（管理者のみ）
PUT /api/executive/board-agendas/:id  // 更新（管理者のみ）
POST /api/executive/board-agendas/:id/complete  // 会議完了記録
```

---

## 🔗 医療システムとの統合

### C. 医療システムからのデータ提供（既に実装済み）

#### Integration-1: ダッシュボードデータ提供API（VoiceDrive → 医療システム）

**エンドポイント**:
```
GET /api/v1/executive/dashboard-data
```

**実装状況**: ✅ **完了**（dashboard-data.ts 1-376行目）

**認証方式**: Bearer Token（実装済み）

**提供データ**:
- 月次KPI統計（総投稿数、議題化、委員会提出、決議済み等）
- 部門別パフォーマンス（TOP10）
- 重要アラート（K-匿名性チェック済み）
- プロジェクト進捗サマリー
- 月次トレンドデータ（過去6ヶ月）

**医療システム側の利用**:
- 週次バッチでデータ取得（毎週月曜 午前2時）
- Llama 3.2 8Bで分析処理
- 分析結果をVoiceDriveへ返送

**セキュリティ**:
- ✅ Bearer Token認証（環境変数: `MCP_API_KEY`）
- ✅ K-匿名性チェック（最小5名未満は非表示）
- ✅ 施設コードマッピング（VoiceDrive → 医療システム）

---

#### Integration-2: 戦略分析結果受信API（医療システム → VoiceDrive）

**エンドポイント**:
```
POST /api/v1/executive/strategic-insights
```

**実装状況**: ✅ **完了**（strategic-insights.ts 1-242行目）

**認証方式**: HMAC-SHA256署名（実装済み）

**受信データ**:
```json
{
  "analysisDate": "2025-10-19",
  "insights": [
    {
      "insightType": "priority_action",
      "severity": "high",
      "title": "看護部の離職リスク上昇",
      "analysis": "過去1ヶ月で看護部のネガティブ投稿が35%増加...",
      "rootCause": "シフト調整の不満、休憩時間不足...",
      "recommendedActions": [
        "シフト作成AIの導入検討",
        "休憩室環境の改善"
      ],
      "bestPractice": {
        "source": "大原病院 看護部",
        "method": "月次1on1ミーティング導入",
        "result": "離職率 12% → 8% に改善"
      },
      "predictions": {
        "metric": "看護部離職率",
        "currentValue": 12.5,
        "predictedValue": 15.2,
        "timeframe": "3ヶ月後",
        "confidence": 0.78,
        "condition": "現状維持の場合"
      }
    }
  ]
}
```

**VoiceDrive側の処理**:
- HMAC-SHA256署名検証
- タイムスタンプ有効性チェック（5分以内）
- ExecutiveStrategicInsightテーブルに保存
- Executive Dashboardページで表示

**セキュリティ**:
- ✅ HMAC-SHA256署名検証（環境変数: `MCP_HMAC_SECRET`）
- ✅ タイムスタンプチェック（5分以内）
- ✅ リプレイアタック防止

**稼働予定**: ⏳ **Phase 18.5（2026年1月）で本格稼働**

---

## 📅 想定スケジュール

### Phase 1: 基本統計機能（DB構築時 - 2日）

**目標**: Executive Dashboardの基本統計が実データで表示される

**実装内容**:
- [ ] ExecutiveKPIService実装
- [ ] DepartmentPerformanceService実装
- [ ] GET /api/executive/kpis 実装
- [ ] GET /api/executive/department-performance 実装
- [ ] ExecutiveLevelDashboard.tsxの月次KPI部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxの部門別パフォーマンス部分を実データに置き換え

**完了基準**:
- ✅ 月次KPIサマリー（実データ）
- ✅ 部門別パフォーマンス（実データ、TOP10）
- ⚠️ 重要アラート（ダミーデータのまま）
- ⚠️ プロジェクト進捗（ダミーデータのまま）

---

### Phase 2: アラート・プロジェクト管理（DB構築後 - 3日）

**目標**: アラート検出とプロジェクト管理が動作する

**実装内容**:
- [ ] ExecutiveAlertテーブル追加
- [ ] Projectテーブル追加
- [ ] ProjectMilestoneテーブル追加
- [ ] ProjectUpdateテーブル追加
- [ ] マイグレーション実行
- [ ] ExecutiveAlertService実装
- [ ] ProjectProgressService実装
- [ ] GET /api/executive/alerts 実装
- [ ] POST /api/executive/alerts/detect 実装
- [ ] GET /api/executive/projects 実装
- [ ] POST /api/executive/projects 実装
- [ ] PUT /api/executive/projects/:id 実装
- [ ] ExecutiveLevelDashboard.tsxの重要アラート部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxのプロジェクト進捗部分を実データに置き換え

**完了基準**:
- ✅ 重要アラート（自動検出、実データ）
- ✅ プロジェクト進捗状況（実データ）
- ✅ K-匿名性チェック（最小5名）
- ⚠️ 重要トピック（ダミーデータのまま）
- ⚠️ 理事会アジェンダ（ダミーデータのまま）

---

### Phase 3: トピック・アジェンダ管理（DB構築後 - 2日）

**目標**: 重要トピック・理事会アジェンダの管理機能が動作する

**実装内容**:
- [ ] KeyTopicテーブル追加
- [ ] BoardAgendaテーブル追加
- [ ] マイグレーション実行
- [ ] KeyTopicManagementService実装
- [ ] BoardAgendaManagementService実装
- [ ] GET /api/executive/key-topics 実装
- [ ] POST /api/executive/key-topics 実装
- [ ] PUT /api/executive/key-topics/:id 実装
- [ ] DELETE /api/executive/key-topics/:id 実装
- [ ] GET /api/executive/board-agendas 実装
- [ ] POST /api/executive/board-agendas 実装
- [ ] PUT /api/executive/board-agendas/:id 実装
- [ ] POST /api/executive/board-agendas/:id/complete 実装
- [ ] ExecutiveLevelDashboard.tsxの重要トピック部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxの理事会アジェンダ部分を実データに置き換え
- [ ] （オプション）管理画面実装（admin/key-topics.tsx, admin/board-agendas.tsx）

**完了基準**:
- ✅ 重要トピックTOP5（実データ、管理者登録）
- ✅ 次回理事会アジェンダ（実データ、管理者登録）
- ✅ 管理画面（オプション）

---

### Phase 4: 戦略分析タブの医療特化（Phase 18.5 - 2026年1月）

**目標**: 医療法人向けの戦略分析が表示される

**実装内容**:
- [ ] ExecutivePostingAnalytics.tsxの企業向けダミーデータを削除
- [ ] 医療法人向けKPIに置き換え（職員満足度、離職率、医療安全インシデント報告率等）
- [ ] ExecutiveStrategicInsightテーブルからLLM分析結果を取得
- [ ] 戦略分析タブに医療システムのLlama 3.2 8B分析を表示

**完了基準**:
- ✅ 医療法人向け戦略KPI
- ✅ LLM分析結果の表示（Phase 18.5）
- ✅ 完全な医療特化ダッシュボード

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  週次バッチ（毎週月曜 午前2時）           │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ①データ取得（Bearer Token認証）                    │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  GET /api/v1/executive/dashboard-data    │               │
│  │  - 月次KPI統計                           │               │
│  │  - 部門別パフォーマンス（TOP10）          │               │
│  │  - 重要アラート（K-匿名性済み）           │               │
│  │  - プロジェクト進捗                       │               │
│  │  - 月次トレンド（過去6ヶ月）              │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ②Llama 3.2 8Bで分析処理                           │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  戦略分析エンジン（Llama 3.2 8B）         │               │
│  │  - 優先アクション抽出                     │               │
│  │  - 成功事例発見                           │               │
│  │  - 予測分析                               │               │
│  │  - 戦略提言生成                           │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ③分析結果送信（HMAC-SHA256署名）                  │
│         ▼                                                     │
└─────────────────────────────────────────────────────────────┘
         │
         │ HTTPS + HMAC-SHA256
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  POST /api/v1/executive/strategic-insights│               │
│  │  - HMAC署名検証                           │               │
│  │  - タイムスタンプ有効性チェック            │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ④データ保存                                        │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  ExecutiveStrategicInsight               │               │
│  │  - 優先アクション                         │               │
│  │  - 成功事例                               │               │
│  │  - 予測分析                               │               │
│  │  - 戦略提言                               │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ⑤表示                                              │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  Executive Dashboard                      │               │
│  │  - 経営概要タブ                           │               │
│  │  - 戦略分析タブ（LLM分析結果）            │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### VoiceDrive側作業

#### Phase 1（DB構築時）
- [ ] **Verify-1**: ExecutiveStrategicInsightテーブル確認（既に定義済み）
- [ ] **Service-1**: ExecutiveKPIService実装
- [ ] **Service-2**: DepartmentPerformanceService実装
- [ ] GET /api/executive/kpis 実装
- [ ] GET /api/executive/department-performance 実装
- [ ] ExecutiveLevelDashboard.tsxの月次KPI部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxの部門別パフォーマンス部分を実データに置き換え

#### Phase 2（DB構築後）
- [ ] **Table-1**: ExecutiveAlertテーブル追加
- [ ] **Table-2**: Projectテーブル追加
- [ ] **Table-2**: ProjectMilestoneテーブル追加
- [ ] **Table-2**: ProjectUpdateテーブル追加
- [ ] マイグレーション実行
- [ ] **Service-3**: ExecutiveAlertService実装（ネガティブ投稿急増検出）
- [ ] **Service-3**: ExecutiveAlertService実装（部門活性度低下検出）
- [ ] **Service-4**: ProjectProgressService実装
- [ ] GET /api/executive/alerts 実装
- [ ] POST /api/executive/alerts/detect 実装
- [ ] GET /api/executive/projects 実装
- [ ] POST /api/executive/projects 実装
- [ ] PUT /api/executive/projects/:id 実装
- [ ] ExecutiveLevelDashboard.tsxの重要アラート部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxのプロジェクト進捗部分を実データに置き換え

#### Phase 3（DB構築後）
- [ ] **Table-3**: KeyTopicテーブル追加
- [ ] **Table-4**: BoardAgendaテーブル追加
- [ ] マイグレーション実行
- [ ] **Service-5**: KeyTopicManagementService実装
- [ ] **Service-6**: BoardAgendaManagementService実装
- [ ] GET /api/executive/key-topics 実装
- [ ] POST /api/executive/key-topics 実装
- [ ] PUT /api/executive/key-topics/:id 実装
- [ ] DELETE /api/executive/key-topics/:id 実装
- [ ] GET /api/executive/board-agendas 実装
- [ ] POST /api/executive/board-agendas 実装
- [ ] PUT /api/executive/board-agendas/:id 実装
- [ ] POST /api/executive/board-agendas/:id/complete 実装
- [ ] ExecutiveLevelDashboard.tsxの重要トピック部分を実データに置き換え
- [ ] ExecutiveLevelDashboard.tsxの理事会アジェンダ部分を実データに置き換え
- [ ] （オプション）管理画面実装（admin/key-topics.tsx）
- [ ] （オプション）管理画面実装（admin/board-agendas.tsx）

#### Phase 4（Phase 18.5 - 2026年1月）
- [ ] ExecutivePostingAnalytics.tsxの企業向けダミーデータを削除
- [ ] 医療法人向けKPIに置き換え
- [ ] ExecutiveStrategicInsightテーブルからLLM分析結果を取得
- [ ] 戦略分析タブに医療システムのLLM分析を表示

### テスト
- [ ] 月次KPI集計の単体テスト
- [ ] 部門別パフォーマンス集計の単体テスト
- [ ] アラート検出の単体テスト（ネガティブ投稿急増）
- [ ] アラート検出の単体テスト（部門活性度低下）
- [ ] K-匿名性チェックの検証（5名未満は非表示）
- [ ] プロジェクト進捗サマリーの単体テスト
- [ ] プロジェクト遅延判定の単体テスト
- [ ] KeyTopic CRUD APIの統合テスト
- [ ] BoardAgenda CRUD APIの統合テスト
- [ ] E2Eテスト（Executive Dashboard全機能）
- [ ] パフォーマンステスト（100プロジェクト、1000投稿）

---

## 📝 補足資料

### 参照ドキュメント

1. **Executive Dashboard DB要件分析**
   `mcp-shared/docs/dashboard/executive_DB要件分析_20251019.md`

2. **Executive Dashboard認証情報**
   `mcp-shared/docs/ExecutiveDashboard_Authentication_Credentials_20251019.md`

3. **Executive Dashboard API仕様書（OpenAPI）**
   `docs/api/executive-dashboard-openapi.yaml`

4. **医療チームへの回答書（Phase 2退職処理統合）**
   `mcp-shared/docs/ED-RESPONSE-2025-1019-001.md`

5. **PersonalStation DB要件分析**
   `mcp-shared/docs/PersonalStation_DB要件分析_20251008.md`

6. **MySQL Migration Guide**
   `docs/MySQL_Migration_Guide.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Next.js (API Routes)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js
- Llama 3.2 8B（Phase 18.5稼働予定）

---

**作成者**: AI (Claude Code)
**承認待ち**: DB構築計画書への統合
**次のステップ**: Phase 1実装（DB構築時）

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-19 | 初版作成 | AI (Claude Code) |
