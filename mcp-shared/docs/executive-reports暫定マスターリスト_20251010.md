# エグゼクティブレポート 暫定マスターリスト

**作成日**: 2025年10月10日
**対象ページ**: ExecutiveReportsPage (`src/pages/ExecutiveReportsPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- エグゼクティブレポートページは理事会・経営層向けの議題化プロセスレポート生成機能
- 現在は全データがハードコード（KPI、レポートテンプレート、理事会アジェンダ、インサイト）
- レポート生成エンジン未実装

### 必要な対応
1. **医療システムからのAPI提供**: 1件
2. **VoiceDrive DB追加**: テーブル6件、フィールド拡張1件
3. **VoiceDrive サービス実装**: 3件
4. **確認事項**: 2件

### 優先度
**Priority: HIGH（グループ1: Level 16専用コア機能）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（1件）

#### API-1: 総職員数取得API

**エンドポイント**:
```
GET /api/v2/employees/count
```

**必要な理由**:
- KPI参加率の計算: `(投稿者数 ÷ 全職員数) × 100`
- VoiceDriveは職員マスタを持たず、医療システムが真実の情報源

**レスポンス例**:
```json
{
  "totalEmployees": 245,
  "byFacility": {
    "FAC001": 120,
    "FAC002": 100,
    "FAC003": 25
  },
  "byDepartment": {
    "看護部": 80,
    "医療技術部": 45,
    "事務部": 30
    // ...
  },
  "activeOnly": true,
  "calculatedAt": "2025-10-10T15:30:00Z"
}
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- Level 16以上のみアクセス可能

**データ鮮度**:
- 日次バッチで更新（深夜2:00 JST）
- キャッシュ有効期限: 24時間

---

## 📦 VoiceDrive DBスキーマ追加要件

### 1. ReportTemplate（レポートテンプレート定義）

**目的**: レポートの種類と生成設定を管理

**スキーマ**:
```prisma
model ReportTemplate {
  id                  String    @id @default(cuid())
  templateKey         String    @unique @map("template_key")   // "monthly_summary"
  title               String                                    // "月次議題化プロセスレポート"
  description         String    @db.Text
  category            String                                    // "monthly", "quarterly", "board"
  icon                String?                                   // "Calendar", "Users"

  // テンプレート設定
  defaultPages        Int       @default(10) @map("default_pages")
  requiredDataSources Json      @map("required_data_sources")   // ["posts", "agendas", "employees"]
  outputFormats       Json      @map("output_formats")          // ["pdf", "excel", "pptx"]

  // 生成設定
  isActive            Boolean   @default(true) @map("is_active")
  permissionLevel     Decimal   @map("permission_level")        // 16以上
  generationSchedule  String?   @map("generation_schedule")     // "monthly", "quarterly"

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  reports             GeneratedReport[]
  customizations      ReportCustomization[]

  @@index([category])
  @@index([permissionLevel])
  @@map("report_templates")
}
```

**初期データ**:
```json
[
  {
    "templateKey": "monthly_summary",
    "title": "月次議題化プロセスレポート",
    "description": "当月の議題化活動・委員会成果・人事課題を総括",
    "category": "monthly",
    "defaultPages": 8,
    "requiredDataSources": ["posts", "agendas", "kpis"],
    "outputFormats": ["pdf", "excel"],
    "permissionLevel": 16,
    "generationSchedule": "monthly"
  },
  {
    "templateKey": "quarterly_hr",
    "title": "四半期人事戦略レポート",
    "description": "人材育成・組織開発の進捗と次期計画",
    "category": "quarterly",
    "defaultPages": 15,
    "requiredDataSources": ["posts", "agendas", "employees", "hr_metrics"],
    "outputFormats": ["pdf", "excel"],
    "permissionLevel": 16,
    "generationSchedule": "quarterly"
  },
  {
    "templateKey": "board_presentation",
    "title": "理事会プレゼンテーション資料",
    "description": "理事会向け要約資料（スライド形式）",
    "category": "board",
    "defaultPages": 12,
    "requiredDataSources": ["posts", "agendas", "board_agenda"],
    "outputFormats": ["pptx", "pdf"],
    "permissionLevel": 16,
    "generationSchedule": "on_demand"
  },
  {
    "templateKey": "committee_effectiveness",
    "title": "委員会活動効果測定レポート",
    "description": "委員会の意思決定速度・実装率の分析",
    "category": "monthly",
    "defaultPages": 10,
    "requiredDataSources": ["agendas", "committee_decisions"],
    "outputFormats": ["pdf", "excel"],
    "permissionLevel": 16,
    "generationSchedule": "monthly"
  },
  {
    "templateKey": "dept_performance",
    "title": "部門別パフォーマンスレポート",
    "description": "声の活性度・議題化率・解決率の部門比較",
    "category": "monthly",
    "defaultPages": 12,
    "requiredDataSources": ["posts", "departments", "kpis"],
    "outputFormats": ["pdf", "excel"],
    "permissionLevel": 16,
    "generationSchedule": "monthly"
  },
  {
    "templateKey": "strategic_insights",
    "title": "戦略的HR課題レポート",
    "description": "AI分析による組織課題と改善提案",
    "category": "monthly",
    "defaultPages": 14,
    "requiredDataSources": ["posts", "insights", "ai_analysis"],
    "outputFormats": ["pdf"],
    "permissionLevel": 16,
    "generationSchedule": "monthly"
  }
]
```

---

### 2. GeneratedReport（生成済みレポート）

**目的**: レポート生成履歴とファイル管理

**スキーマ**:
```prisma
model GeneratedReport {
  id                  String    @id @default(cuid())
  templateId          String    @map("template_id")
  reportKey           String    @unique @map("report_key")      // "monthly_2025_10"

  // レポート情報
  title               String
  period              String                                    // "2025-10", "2025-Q3"
  periodStart         DateTime  @map("period_start")
  periodEnd           DateTime  @map("period_end")

  // 生成情報
  generatedBy         String    @map("generated_by")            // User ID
  generatedAt         DateTime  @default(now()) @map("generated_at")
  status              String    @default("generating")          // "generating", "ready", "failed"

  // ファイル情報
  fileUrl             String?   @map("file_url")                // S3 or local path
  fileSize            Int?      @map("file_size")               // bytes
  fileFormat          String?   @map("file_format")             // "pdf", "excel", "pptx"
  pageCount           Int?      @map("page_count")

  // 統計情報
  downloadCount       Int       @default(0) @map("download_count")
  viewCount           Int       @default(0) @map("view_count")
  lastAccessedAt      DateTime? @map("last_accessed_at")

  // エラー情報
  errorMessage        String?   @db.Text @map("error_message")

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  template            ReportTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  generator           User           @relation("ReportGenerator", fields: [generatedBy], references: [id])
  accessLogs          ReportAccessLog[]

  @@index([templateId])
  @@index([generatedBy])
  @@index([status])
  @@index([periodStart, periodEnd])
  @@map("generated_reports")
}
```

---

### 3. ReportCustomization（レポートカスタマイズ設定）

**目的**: ユーザー別のレポート設定保存

**スキーマ**:
```prisma
model ReportCustomization {
  id                  String    @id @default(cuid())
  templateId          String    @map("template_id")
  userId              String    @map("user_id")

  // カスタマイズ内容
  customTitle         String?   @map("custom_title")
  includedSections    Json      @map("included_sections")       // ["kpi", "topics", "insights"]
  excludedSections    Json?     @map("excluded_sections")
  customFilters       Json?     @map("custom_filters")          // { department: "看護部" }

  // 表示設定
  chartTypes          Json?     @map("chart_types")             // { "trend": "line" }
  colorScheme         String?   @map("color_scheme")            // "default", "colorblind"

  isDefault           Boolean   @default(false) @map("is_default")

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  template            ReportTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  user                User           @relation("ReportCustomizer", fields: [userId], references: [id])

  @@unique([templateId, userId])
  @@index([userId])
  @@map("report_customizations")
}
```

---

### 4. ReportAccessLog（レポートアクセスログ）

**目的**: レポート閲覧・ダウンロード履歴の監査

**スキーマ**:
```prisma
model ReportAccessLog {
  id                  String    @id @default(cuid())
  reportId            String    @map("report_id")
  userId              String    @map("user_id")

  // アクセス情報
  action              String                                    // "view", "download", "preview"
  accessedAt          DateTime  @default(now()) @map("accessed_at")

  // デバイス情報
  ipAddress           String?   @map("ip_address")
  userAgent           String?   @db.Text @map("user_agent")

  // リレーション
  report              GeneratedReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  user                User            @relation("ReportAccessUser", fields: [userId], references: [id])

  @@index([reportId])
  @@index([userId])
  @@index([accessedAt])
  @@map("report_access_logs")
}
```

---

### 5. BoardMeetingAgenda（理事会アジェンダ管理）

**目的**: 理事会議題と発表スケジュール管理

**スキーマ**:
```prisma
model BoardMeetingAgenda {
  id                  String    @id @default(cuid())
  meetingDate         DateTime  @map("meeting_date")
  agendaOrder         Int       @map("agenda_order")              // 議題順序

  // 議題情報
  item                String
  description         String?   @db.Text
  category            String                                      // "hr_strategy", "financial"

  // 発表情報
  duration            Int                                         // 分
  presenterId         String    @map("presenter_id")              // User ID
  presenterTitle      String    @map("presenter_title")           // "人事部門長"

  // 関連データ
  relatedAgendaId     String?   @map("related_agenda_id")         // 委員会議題ID
  attachments         Json?                                       // 添付資料URL配列

  // ステータス
  status              String    @default("scheduled")             // "scheduled", "presented"
  actualDuration      Int?      @map("actual_duration")

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  presenter           User                         @relation("BoardPresenter", fields: [presenterId], references: [id])
  relatedAgenda       ManagementCommitteeAgenda?   @relation("BoardRelatedAgenda", fields: [relatedAgendaId], references: [id])

  @@unique([meetingDate, agendaOrder])
  @@index([meetingDate])
  @@index([presenterId])
  @@map("board_meeting_agendas")
}
```

**初期データ例**:
```json
[
  {
    "meetingDate": "2025-10-15T14:00:00Z",
    "agendaOrder": 1,
    "item": "人材確保戦略の進捗報告",
    "category": "hr_strategy",
    "duration": 15,
    "presenterId": "user_hr_director",
    "presenterTitle": "人事部門長"
  },
  {
    "meetingDate": "2025-10-15T14:00:00Z",
    "agendaOrder": 2,
    "item": "組織風土改善施策の効果検証",
    "category": "hr_strategy",
    "duration": 20,
    "presenterId": "user_strategy_director",
    "presenterTitle": "戦略企画部門員"
  },
  {
    "meetingDate": "2025-10-15T14:00:00Z",
    "agendaOrder": 3,
    "item": "医療安全委員会からの提言事項",
    "category": "operational",
    "duration": 10,
    "presenterId": "user_safety_chair",
    "presenterTitle": "医療安全委員長"
  },
  {
    "meetingDate": "2025-10-15T14:00:00Z",
    "agendaOrder": 4,
    "item": "次年度予算案（人件費）",
    "category": "financial",
    "duration": 25,
    "presenterId": "user_admin_director",
    "presenterTitle": "事務局長"
  }
]
```

---

### 6. StrategicInsight（戦略的インサイト）

**目的**: AI分析による成功事例・改善提案の管理

**スキーマ**:
```prisma
model StrategicInsight {
  id                  String    @id @default(cuid())
  insightType         String    @map("insight_type")              // "success_story", "improvement"
  category            String                                      // "department", "process"

  // インサイト内容
  title               String
  summary             String    @db.Text
  details             String?   @db.Text

  // 根拠データ
  evidenceData        Json      @map("evidence_data")             // { avgDays: 35 }
  relatedPostIds      Json?     @map("related_post_ids")
  relatedDepartments  Json?     @map("related_departments")

  // 優先度
  priority            String    @default("medium")                // "high", "medium", "low"
  confidence          Float     @default(0.8) @map("confidence")  // AI信頼度

  // ステータス
  status              String    @default("pending")               // "pending", "approved"
  approvedBy          String?   @map("approved_by")
  approvedAt          DateTime? @map("approved_at")

  // 実装追跡
  actionTaken         String?   @db.Text @map("action_taken")
  implementedAt       DateTime? @map("implemented_at")

  // AI分析情報
  generatedBy         String    @default("ai") @map("generated_by") // "ai", "manual"
  generationModel     String?   @map("generation_model")          // "gpt-4"
  generatedAt         DateTime  @default(now()) @map("generated_at")

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  approver            User?     @relation("InsightApprover", fields: [approvedBy], references: [id])

  @@index([insightType])
  @@index([priority])
  @@index([status])
  @@map("strategic_insights")
}
```

**初期データ例**:
```json
[
  {
    "insightType": "success_story",
    "category": "process",
    "title": "効果的な議題化プロセス",
    "summary": "医療療養病棟での議題化プロセスが効果的に機能。提案から実装まで平均35日と法人内最短を記録。他部署への横展開を推奨。",
    "evidenceData": {
      "department": "医療療養病棟",
      "avgResolutionDays": 35,
      "corporateAvg": 58,
      "improvement": "39.7%"
    },
    "priority": "high",
    "confidence": 0.92,
    "status": "approved",
    "generatedBy": "ai",
    "generationModel": "gpt-4"
  },
  {
    "insightType": "improvement_suggestion",
    "category": "department",
    "title": "事務部門の活性化支援",
    "summary": "事務部門の声の活性度が低下傾向。部門長との1on1実施と議題化サポート体制の強化を提案。早期介入で改善の見込み。",
    "evidenceData": {
      "department": "事務部",
      "currentActivity": 32,
      "previousActivity": 48,
      "decline": "33.3%"
    },
    "priority": "medium",
    "confidence": 0.85,
    "status": "pending",
    "generatedBy": "ai",
    "generationModel": "gpt-4"
  }
]
```

---

### 7. ManagementCommitteeAgenda拡張（影響度評価）

**目的**: 委員会議題の影響度を記録

**追加フィールド**:
```prisma
model ManagementCommitteeAgenda {
  // ... 既存フィールド

  // 🆕 影響度評価
  impactAssessment    String?   @db.Text @map("impact_assessment")  // "採用目標達成率20%向上見込み"
  impactCategory      String?   @map("impact_category")              // "cost_reduction", "efficiency"
  estimatedImpact     Float?    @map("estimated_impact")             // 数値化された影響度（%）

  @@index([impactCategory])
}
```

---

## 🔧 VoiceDriveサービス実装要件

### サービス-1: ExecutiveReportService

**ファイル**: `src/services/ExecutiveReportService.ts`

**主要機能**:
1. `calculateMonthlyKPIs(year, month)` - 月次KPI集計
2. `calculateQuarterlyKPIs(year, quarter)` - 四半期KPI集計
3. `calculateYearlyKPIs(year)` - 年次KPI集計
4. `getKeyTopics(period, limit)` - 重要トピック抽出
5. `getTotalEmployees()` - 医療システムAPI呼び出し

**推定実装時間**: 2-3日

**依存関係**:
- `prisma` (Post, ManagementCommitteeAgenda, Vote)
- `axios` (医療システムAPI呼び出し)

---

### サービス-2: ReportGenerationEngine

**ファイル**: `src/services/ReportGenerationEngine.ts`

**主要機能**:
1. `generatePDF(templateId, data)` - PDF生成
2. `generateExcel(templateId, data)` - Excel生成
3. `generatePowerPoint(templateId, data)` - PowerPoint生成
4. `uploadToStorage(file)` - S3アップロード
5. `scheduleGeneration(templateId, schedule)` - 定期生成スケジューリング

**推定実装時間**: 5-7日

**依存関係**:
- `puppeteer` or `pdfkit` (PDF生成)
- `exceljs` (Excel生成)
- `pptxgenjs` (PowerPoint生成)
- `@aws-sdk/client-s3` (S3アップロード)
- `node-cron` (スケジューリング)

---

### サービス-3: InsightGenerationService

**ファイル**: `src/services/InsightGenerationService.ts`

**主要機能**:
1. `generateSuccessStories()` - 成功事例の自動抽出
2. `generateImprovementSuggestions()` - 改善提案の自動生成
3. `analyzeProcessEfficiency()` - プロセス効率分析
4. `analyzeDepartmentActivity()` - 部門活性度分析

**推定実装時間**: 3-5日（AI統合含む）

**依存関係**:
- `openai` or `@anthropic-ai/sdk` (AI分析)
- `prisma` (データ取得)

---

## ❓ 医療システムチームへの確認事項

### 確認-1: レポート配布リスト

**質問**:
理事会メンバーや経営幹部へのレポート配布リストは医療システム側で管理していますか？

**背景**:
- 生成したレポートを自動配布する場合、配布先リストが必要
- VoiceDriveで独自管理すべきか、医療システムから提供されるか

**提案**:
医療システム側で「理事会メンバー」「経営幹部」等のグループ管理があれば、APIで提供いただきたい

**エンドポイント例**:
```
GET /api/v2/groups/board-members
Response: {
  "groupId": "board-members",
  "members": [
    { "employeeId": "EMP001", "name": "理事長", "email": "..." },
    // ...
  ]
}
```

---

### 確認-2: レポート保管期限

**質問**:
生成したレポートファイルの保管期限はどのくらいが適切ですか？

**背景**:
- S3ストレージコスト削減のため、古いレポートの自動削除を検討
- 医療法人の文書管理規定に準拠する必要がある

**提案案**:
- 理事会資料: 5年保管
- 月次/四半期レポート: 3年保管
- 古いレポートはアーカイブ（Glacier）へ移動

---

## 📊 データフロー図

### レポート生成フロー

```
1. ユーザーがレポート生成リクエスト
   ↓
2. ExecutiveReportService: KPI集計
   ├─ VoiceDrive DB: Post, ManagementCommitteeAgenda
   └─ 医療システムAPI: 総職員数
   ↓
3. ExecutiveReportService: 重要トピック抽出
   ├─ ManagementCommitteeAgenda (impactAssessment)
   └─ Post (priority, status)
   ↓
4. InsightGenerationService: AI分析
   ├─ 成功事例抽出
   └─ 改善提案生成
   ↓
5. ReportGenerationEngine: レポート生成
   ├─ テンプレート読み込み (ReportTemplate)
   ├─ データ統合
   └─ PDF/Excel/PPTX出力
   ↓
6. S3アップロード
   ↓
7. GeneratedReport レコード作成
   ↓
8. ユーザーにダウンロードリンク提供
```

---

## ✅ 実装チェックリスト

### Phase 1: DB構築（3日）

- [ ] ReportTemplate テーブル作成
- [ ] GeneratedReport テーブル作成
- [ ] ReportCustomization テーブル作成
- [ ] ReportAccessLog テーブル作成
- [ ] BoardMeetingAgenda テーブル作成
- [ ] StrategicInsight テーブル作成
- [ ] ManagementCommitteeAgenda に影響度評価フィールド追加
- [ ] 初期データ投入（6テンプレート、理事会アジェンダ4件、インサイト2件）

### Phase 2: サービス実装（5-7日）

- [ ] ExecutiveReportService実装
  - [ ] calculateMonthlyKPIs
  - [ ] calculateQuarterlyKPIs
  - [ ] calculateYearlyKPIs
  - [ ] getKeyTopics
  - [ ] getTotalEmployees（医療システムAPI呼び出し）
- [ ] ReportGenerationEngine実装
  - [ ] PDF生成機能
  - [ ] Excel生成機能
  - [ ] PowerPoint生成機能（Phase 2）
  - [ ] S3アップロード
  - [ ] スケジューリング機能（Phase 2）
- [ ] InsightGenerationService実装（Phase 2）
  - [ ] 成功事例抽出
  - [ ] 改善提案生成

### Phase 3: API実装（2日）

- [ ] GET /api/executive-reports/kpis
- [ ] GET /api/executive-reports/templates
- [ ] POST /api/executive-reports/generate
- [ ] GET /api/executive-reports/:reportId/download
- [ ] GET /api/executive-reports/:reportId/preview
- [ ] GET /api/executive-reports/key-topics
- [ ] GET /api/executive-reports/board-agenda
- [ ] GET /api/executive-reports/insights（Phase 2）

### Phase 4: UI実装（2-3日）

- [ ] ExecutiveReportsPage ハードコードデータ削除
- [ ] KPIサマリー 実データ接続
- [ ] レポートテンプレート一覧 実データ接続
- [ ] レポート生成ボタン機能実装
- [ ] ダウンロード機能実装
- [ ] プレビュー機能実装
- [ ] 重要トピック 実データ接続
- [ ] 理事会アジェンダ 実データ接続
- [ ] ローディング状態実装
- [ ] エラーハンドリング実装

### Phase 5: テスト（2日）

- [ ] 単体テスト（ExecutiveReportService）
- [ ] 単体テスト（ReportGenerationEngine）
- [ ] 統合テスト（レポート生成フロー）
- [ ] E2Eテスト（ExecutiveReportsPage全機能）
- [ ] PDF/Excel出力テスト
- [ ] パフォーマンステスト（100ページレポート）
- [ ] Level 16権限チェックテスト

---

## 🔗 関連ドキュメント

- [executive-reports_DB要件分析_20251010.md](./executive-reports_DB要件分析_20251010.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [organization-analytics_DB要件分析_20251010.md](./organization-analytics_DB要件分析_20251010.md)
- [strategic-hr-plan_DB要件分析_20251010.md](./strategic-hr-plan_DB要件分析_20251010.md)

---

## 📞 連絡先

**VoiceDrive側担当**: VoiceDriveチーム
**医療システム側担当**: 医療職員管理システムチーム
**緊急連絡**: MCPサーバー経由（`mcp-shared/docs/`）

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
次回レビュー: Phase 1実装前（医療システムチームとの合意後）
