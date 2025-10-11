# エグゼクティブレポートページ DB要件分析

**文書番号**: DB-REQ-2025-1010-010
**作成日**: 2025年10月10日
**対象ページ**: https://voicedrive-v100.vercel.app/executive-reports
**対象ファイル**: `src/pages/ExecutiveReportsPage.tsx`
**Permission Level**: Level 16+（戦略企画・統括管理部門員）
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [organization-analytics_DB要件分析_20251010.md](./organization-analytics_DB要件分析_20251010.md)
- [strategic-hr-plan_DB要件分析_20251010.md](./strategic-hr-plan_DB要件分析_20251010.md)

---

## 📋 分析サマリー

### 結論
エグゼクティブレポートページは**Level 16経営幹部専用**のレポート生成・管理機能であり、**VoiceDriveの投稿データと医療システムの人事データを統合したレポート作成**を提供します。

**現状**: **全データがハードコードされたダミーデータ**（37-143行目）

### 🔴 重大な不足項目（即対応必要）

1. **レポートテンプレート管理テーブル**
   - レポート定義、生成履歴、カスタマイズ設定の管理
   - 現在ハードコードされている（48-103行目）

2. **レポート生成エンジン**
   - 月次/四半期/年次レポートの自動生成
   - PDF/Excel/PowerPoint出力機能
   - 現在未実装

3. **KPI集計サービス**
   - 総投稿数、議題化数、委員会提出数、決議済み数の集計
   - 参加率、解決率、平均解決日数の計算
   - 現在ハードコードされている（37-45行目）

4. **理事会アジェンダ管理テーブル**
   - 理事会議題、発表者、所要時間の管理
   - 現在ハードコードされている（137-143行目）

5. **戦略的インサイトAI分析**
   - 成功事例の自動抽出
   - 改善提案の自動生成
   - 現在ハードコードされている（383-416行目）

---

## 🔍 詳細分析

### 1. 今月のKPIサマリー（37-45行目、215-242行目）

#### 表示内容
```typescript
const monthlyKPIs = {
  totalPosts: 342,              // 総投稿数
  agendaCreated: 85,            // 議題化
  committeeSubmitted: 28,       // 委員会提出
  resolved: 45,                 // 決議済み
  participationRate: 68,        // 参加率（%）
  resolutionRate: 53,           // 解決率（%）
  avgResolutionDays: 42         // 平均解決日数
};
```

#### 必要なデータソース

| KPI項目 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|--------|---------|--------------|--------------|------|
| **総投稿数** | 当月の投稿数 | `Post` | VoiceDrive | 🔴 集計機能不足 |
| **議題化数** | `agendaLevel >= 'DEPT_AGENDA'` | `Post.agendaLevel` | VoiceDrive | 🔴 集計機能不足 |
| **委員会提出数** | 委員会議題登録数 | `ManagementCommitteeAgenda` | VoiceDrive | 🔴 集計機能不足 |
| **決議済み数** | 委員会決議完了数 | `ManagementCommitteeAgenda.decision='approved'` | VoiceDrive | 🔴 集計機能不足 |
| **参加率** | (投稿者数 ÷ 全職員数) × 100 | `Post.authorId`, `User` | VoiceDrive + 医療システム | 🔴 集計機能不足 |
| **解決率** | (決議済み ÷ 総議題数) × 100 | `ManagementCommitteeAgenda` | VoiceDrive | 🔴 集計機能不足 |
| **平均解決日数** | AVG(decidedDate - proposedDate) | `ManagementCommitteeAgenda` | VoiceDrive | 🔴 集計機能不足 |

#### 解決策1: ExecutiveReportService（新規作成）

**ファイル**: `src/services/ExecutiveReportService.ts`

```typescript
/**
 * エグゼクティブレポートサービス
 * Level 16+専用のレポート生成・統計集計
 */
export class ExecutiveReportService {

  /**
   * 月次KPIサマリーを計算
   */
  async calculateMonthlyKPIs(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 総投稿数
    const totalPosts = await prisma.post.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'active'
      }
    });

    // 議題化数（部署議題以上）
    const agendaCreated = await prisma.post.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        agendaLevel: { in: ['DEPT_AGENDA', 'FACILITY_AGENDA', 'CORP_REVIEW', 'CORP_AGENDA'] },
        status: 'active'
      }
    });

    // 委員会提出数
    const committeeSubmitted = await prisma.managementCommitteeAgenda.count({
      where: {
        proposedDate: { gte: startDate, lte: endDate }
      }
    });

    // 決議済み数
    const resolved = await prisma.managementCommitteeAgenda.count({
      where: {
        decidedDate: { gte: startDate, lte: endDate },
        decision: 'approved'
      }
    });

    // 参加率
    const uniqueAuthors = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'active'
      }
    });
    const totalEmployees = await this.getTotalEmployees(); // 医療システムAPI
    const participationRate = Math.round((uniqueAuthors.length / totalEmployees) * 100);

    // 解決率
    const totalAgendas = committeeSubmitted;
    const resolutionRate = totalAgendas > 0
      ? Math.round((resolved / totalAgendas) * 100)
      : 0;

    // 平均解決日数
    const resolvedAgendas = await prisma.managementCommitteeAgenda.findMany({
      where: {
        decidedDate: { gte: startDate, lte: endDate },
        decision: 'approved'
      },
      select: {
        proposedDate: true,
        decidedDate: true
      }
    });
    const avgResolutionDays = resolvedAgendas.length > 0
      ? Math.round(
          resolvedAgendas.reduce((sum, agenda) => {
            const days = Math.ceil(
              (agenda.decidedDate!.getTime() - agenda.proposedDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / resolvedAgendas.length
        )
      : 0;

    return {
      totalPosts,
      agendaCreated,
      committeeSubmitted,
      resolved,
      participationRate,
      resolutionRate,
      avgResolutionDays
    };
  }

  /**
   * 医療システムから総職員数を取得
   */
  private async getTotalEmployees(): Promise<number> {
    const response = await fetch('/api/medical-system/employees/count', {
      headers: {
        'Authorization': `Bearer ${process.env.MEDICAL_SYSTEM_API_TOKEN}`
      }
    });
    const data = await response.json();
    return data.totalEmployees;
  }
}
```

---

### 2. レポートテンプレート（48-103行目、245-292行目）

#### 表示内容
```typescript
const reportTemplates = [
  {
    id: 'monthly_summary',
    title: '月次議題化プロセスレポート',
    description: '当月の議題化活動・委員会成果・人事課題を総括',
    pages: 8,
    lastGenerated: '2025-10-01',
    status: 'ready'
  },
  {
    id: 'quarterly_hr',
    title: '四半期人事戦略レポート',
    description: '人材育成・組織開発の進捗と次期計画',
    pages: 15,
    status: 'ready'
  },
  // ... 他4件
];
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| **レポート定義** | ✅ マスタ | ❌ | VoiceDrive | DB | 🔴 **要追加** |
| **生成履歴** | ✅ マスタ | ❌ | VoiceDrive | DB | 🔴 **要追加** |
| **カスタマイズ設定** | ✅ マスタ | ❌ | VoiceDrive | DB | 🔴 **要追加** |
| **レポート本体** | ✅ ストレージ | ❌ | VoiceDrive | S3/ファイルシステム | 🔴 **要追加** |

#### 解決策2: レポート管理テーブル群

**prisma/schema.prisma**に追加:

```prisma
/**
 * レポートテンプレート定義
 */
model ReportTemplate {
  id                  String    @id @default(cuid())
  templateKey         String    @unique @map("template_key")   // "monthly_summary", "quarterly_hr"
  title               String
  description         String    @db.Text
  category            String                                    // "monthly", "quarterly", "board"
  icon                String?                                   // アイコン名

  // テンプレート設定
  defaultPages        Int       @default(10) @map("default_pages")
  requiredDataSources Json      @map("required_data_sources")   // ["posts", "agendas", "employees"]
  outputFormats       Json      @map("output_formats")          // ["pdf", "excel", "pptx"]

  // 生成設定
  isActive            Boolean   @default(true) @map("is_active")
  permissionLevel     Decimal   @map("permission_level")        // Level 16+のみ
  generationSchedule  String?   @map("generation_schedule")     // "monthly", "quarterly", "on_demand"

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  reports             GeneratedReport[]
  customizations      ReportCustomization[]

  @@index([category])
  @@index([permissionLevel])
  @@map("report_templates")
}

/**
 * 生成済みレポート
 */
model GeneratedReport {
  id                  String    @id @default(cuid())
  templateId          String    @map("template_id")
  reportKey           String    @unique @map("report_key")      // "monthly_2025_10"

  // レポート情報
  title               String
  period              String                                    // "2025-10", "2025-Q3", "2025"
  periodStart         DateTime  @map("period_start")
  periodEnd           DateTime  @map("period_end")

  // 生成情報
  generatedBy         String    @map("generated_by")            // User ID
  generatedAt         DateTime  @default(now()) @map("generated_at")
  status              String    @default("generating")          // "generating", "ready", "failed"

  // ファイル情報
  fileUrl             String?   @map("file_url")                // S3 URL
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

/**
 * レポートカスタマイズ設定
 */
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
  chartTypes          Json?     @map("chart_types")             // { "trend": "line", "distribution": "pie" }
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

/**
 * レポートアクセスログ
 */
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

### 3. 最近の重要トピック（106-135行目、297-322行目）

#### 表示内容
```typescript
const keyTopics = [
  {
    category: '人事・採用',
    title: '看護師確保策の効果検証',
    priority: 'high',
    status: '委員会承認済み',
    impact: '採用目標達成率20%向上見込み'
  },
  // ... 他3件
];
```

#### 必要なデータソース

| データ項目 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|-----------|---------|--------------|--------------|------|
| **カテゴリ** | `Post.proposalType`マッピング | `Post` | VoiceDrive | ✅ 可能 |
| **タイトル** | 委員会議題タイトル | `ManagementCommitteeAgenda.title` | VoiceDrive | ✅ 可能 |
| **優先度** | `Post.priority`または委員会優先度 | `Post`, `ManagementCommitteeAgenda` | VoiceDrive | ✅ 可能 |
| **ステータス** | 委員会決議状況 | `ManagementCommitteeAgenda.status` | VoiceDrive | ✅ 可能 |
| **影響度** | AI分析またはマニュアル設定 | `ManagementCommitteeAgenda.impactAssessment` | VoiceDrive | 🔴 **要追加** |

#### 解決策3: ManagementCommitteeAgendaに影響度評価フィールド追加

```prisma
model ManagementCommitteeAgenda {
  // ... 既存フィールド

  // 🆕 影響度評価
  impactAssessment    String?   @db.Text @map("impact_assessment")  // "採用目標達成率20%向上見込み"
  impactCategory      String?   @map("impact_category")              // "cost_reduction", "efficiency", "satisfaction"
  estimatedImpact     Float?    @map("estimated_impact")             // 数値化された影響度（%）

  @@index([impactCategory])
}
```

---

### 4. 次回理事会アジェンダ（137-143行目、325-354行目）

#### 表示内容
```typescript
const boardAgenda = [
  { item: '人材確保戦略の進捗報告', duration: '15分', presenter: '人事部門長' },
  { item: '組織風土改善施策の効果検証', duration: '20分', presenter: '戦略企画部門員' },
  // ... 他2件
];
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| **議題項目** | ✅ マスタ | ❌ | VoiceDrive | DB | 🔴 **要追加** |
| **所要時間** | ✅ マスタ | ❌ | VoiceDrive | DB | 🔴 **要追加** |
| **発表者** | ✅ キャッシュ | ✅ マスタ | 医療システム | API | 🔴 **要追加** |

#### 解決策4: 理事会アジェンダ管理テーブル

```prisma
/**
 * 理事会アジェンダ
 */
model BoardMeetingAgenda {
  id                  String    @id @default(cuid())
  meetingDate         DateTime  @map("meeting_date")
  agendaOrder         Int       @map("agenda_order")              // 議題順序

  // 議題情報
  item                String
  description         String?   @db.Text
  category            String                                      // "hr_strategy", "financial", "operational"

  // 発表情報
  duration            Int                                         // 分
  presenterId         String    @map("presenter_id")              // 発表者（User ID）
  presenterTitle      String    @map("presenter_title")           // "人事部門長"

  // 関連データ
  relatedAgendaId     String?   @map("related_agenda_id")         // 委員会議題ID
  attachments         Json?                                       // 添付資料URL配列

  // ステータス
  status              String    @default("scheduled")             // "scheduled", "presented", "postponed"
  actualDuration      Int?      @map("actual_duration")           // 実際の所要時間

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

---

### 5. 戦略的インサイト（383-416行目）

#### 表示内容
```typescript
// 成功事例
"医療療養病棟での議題化プロセスが効果的に機能。
提案から実装まで平均35日と法人内最短を記録。
他部署への横展開を推奨。"

// 改善提案
"事務部門の声の活性度が低下傾向。
部門長との1on1実施と議題化サポート体制の強化を提案。
早期介入で改善の見込み。"
```

#### 必要なデータソース

| データ項目 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|-----------|---------|--------------|--------------|------|
| **成功事例** | AI分析で自動抽出 | `Post`, `ManagementCommitteeAgenda`, 部門統計 | VoiceDrive | 🔴 **AI実装不足** |
| **改善提案** | AI分析で自動生成 | `Post`, `Vote`, 部門別活性度 | VoiceDrive | 🔴 **AI実装不足** |

#### 解決策5: 戦略的インサイトテーブル

```prisma
/**
 * 戦略的インサイト
 */
model StrategicInsight {
  id                  String    @id @default(cuid())
  insightType         String    @map("insight_type")              // "success_story", "improvement_suggestion"
  category            String                                      // "department", "process", "engagement"

  // インサイト内容
  title               String
  summary             String    @db.Text
  details             String?   @db.Text

  // 根拠データ
  evidenceData        Json      @map("evidence_data")             // { avgDays: 35, department: "医療療養病棟" }
  relatedPostIds      Json?     @map("related_post_ids")          // 関連投稿ID配列
  relatedDepartments  Json?     @map("related_departments")       // 関連部門配列

  // 優先度
  priority            String    @default("medium")                // "high", "medium", "low"
  confidence          Float     @default(0.8) @map("confidence")  // AI信頼度（0-1）

  // ステータス
  status              String    @default("pending")               // "pending", "approved", "implemented", "dismissed"
  approvedBy          String?   @map("approved_by")               // 承認者ID
  approvedAt          DateTime? @map("approved_at")

  // 実装追跡
  actionTaken         String?   @db.Text @map("action_taken")
  implementedAt       DateTime? @map("implemented_at")

  // AI分析情報
  generatedBy         String    @default("ai") @map("generated_by") // "ai", "manual"
  generationModel     String?   @map("generation_model")          // "gpt-4", "llama-3.2"
  generatedAt         DateTime  @default(now()) @map("generated_at")

  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // リレーション
  approver            User?     @relation("InsightApprover", fields: [approvedBy], references: [id])

  @@index([insightType])
  @@index([priority])
  @@index([status])
  @@index([generatedAt])
  @@map("strategic_insights")
}
```

---

## 📋 必要な追加テーブル一覧

### VoiceDrive側で追加が必要（5テーブル）

#### 🔴 優先度: 最高（Level 16機能の基盤）

1. **ReportTemplate** - レポートテンプレート定義
2. **GeneratedReport** - 生成済みレポート
3. **ReportCustomization** - レポートカスタマイズ設定
4. **ReportAccessLog** - レポートアクセスログ
5. **BoardMeetingAgenda** - 理事会アジェンダ管理
6. **StrategicInsight** - 戦略的インサイト

#### 🟡 優先度: 高（既存テーブルへのフィールド追加）

7. **ManagementCommitteeAgenda拡張** - 影響度評価フィールド追加

---

## 📊 データ管理責任マトリクス

### ExecutiveReportsPage専用データ

| データカテゴリ | VoiceDrive | 医療システム | 提供方法 | 備考 |
|--------------|-----------|-------------|---------|------|
| **投稿データ** | ✅ マスタ | ❌ | - | `Post`, `Vote`, `Comment` |
| **議題レベル** | ✅ マスタ | ❌ | - | `Post.agendaLevel`（計算済み） |
| **委員会議題** | ✅ マスタ | ❌ | - | `ManagementCommitteeAgenda` |
| **決議情報** | ✅ マスタ | ❌ | - | `ManagementCommitteeAgenda.decision` |
| **レポート定義** | ✅ マスタ | ❌ | - | `ReportTemplate` |
| **レポート生成履歴** | ✅ マスタ | ❌ | - | `GeneratedReport` |
| **理事会アジェンダ** | ✅ マスタ | ❌ | - | `BoardMeetingAgenda` |
| **戦略的インサイト** | ✅ マスタ | ❌ | - | `StrategicInsight` |
| **職員総数** | ❌ | ✅ マスタ | API | Employee集計 |
| **発表者情報** | キャッシュ | ✅ マスタ | API | `Employee` |

---

## 🎯 実装優先順位

### Phase 1: 基本レポート機能（1-2週間）

**目標**: ExecutiveReportsPageが基本的に動作する

#### Week 1: DB構築＋KPI集計
1. 🔴 ReportTemplate テーブル作成
2. 🔴 GeneratedReport テーブル作成
3. 🔴 ReportCustomization テーブル作成
4. 🔴 ReportAccessLog テーブル作成
5. 🔴 BoardMeetingAgenda テーブル作成
6. 🔴 StrategicInsight テーブル作成
7. 🔴 ManagementCommitteeAgenda拡張（影響度評価フィールド）
8. 🔴 ExecutiveReportService実装（KPI集計）
9. 🔴 API実装（`/api/executive-reports/kpis`）

#### Week 2: レポート生成エンジン
1. 🔴 レポートテンプレートデータ投入（6テンプレート）
2. 🔴 レポート生成エンジン実装（PDF/Excel）
3. 🔴 API実装（`/api/executive-reports/generate`）
4. 🔴 ExecutiveReportsPageの修正（ダミーデータ削除）
5. 🔴 ダウンロード機能実装
6. 🔴 プレビュー機能実装

**このPhaseで動作する機能**:
- ✅ KPIサマリー（実データ）
- ✅ レポートテンプレート一覧（実データ）
- ✅ レポート生成（PDF/Excel）
- ✅ レポートダウンロード
- ⚠️ 重要トピック（一部手動設定）
- ⚠️ 理事会アジェンダ（手動設定）
- ❌ 戦略的インサイト（Phase 2）

---

### Phase 2: 高度な分析機能（1-2週間）

**目標**: AI分析とレポート自動化

#### Week 3-4: AI分析＋自動化
1. 🟡 重要トピック自動抽出機能
2. 🟡 StrategicInsight AI生成機能
3. 🟡 レポート定期自動生成（月次/四半期）
4. 🟡 理事会資料一括生成機能
5. 🟡 PowerPoint出力機能
6. 🟡 カスタムレポート作成UI
7. 🟡 レポート共有機能（理事会メンバー限定）

**このPhaseで動作する機能**:
- ✅ 重要トピック（自動抽出）
- ✅ 戦略的インサイト（AI分析）
- ✅ レポート自動生成（スケジューリング）
- ✅ 理事会資料一括生成
- ✅ カスタムレポート作成

---

### Phase 3: ダッシュボード最適化（1週間）

**目標**: パフォーマンス向上とユーザー体験改善

1. 🟢 レポート生成キューイング（バックグラウンド処理）
2. 🟢 大容量レポート対応（100ページ以上）
3. 🟢 レポートバージョン管理
4. 🟢 レポート承認ワークフロー
5. 🟢 レポート配布リスト管理
6. 🟢 アクセス統計ダッシュボード

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### DB構築（6テーブル + 1拡張）
- [ ] ReportTemplate テーブル作成
- [ ] GeneratedReport テーブル作成
- [ ] ReportCustomization テーブル作成
- [ ] ReportAccessLog テーブル作成
- [ ] BoardMeetingAgenda テーブル作成
- [ ] StrategicInsight テーブル作成
- [ ] ManagementCommitteeAgenda拡張（影響度評価）

#### サービス実装
- [ ] ExecutiveReportService実装（KPI集計）
- [ ] ReportGenerationEngine実装（PDF/Excel生成）
- [ ] TopicExtractionService実装（重要トピック抽出）
- [ ] InsightGenerationService実装（AI分析）

#### API実装
- [ ] GET /api/executive-reports/kpis
- [ ] GET /api/executive-reports/templates
- [ ] POST /api/executive-reports/generate
- [ ] GET /api/executive-reports/:reportId/download
- [ ] GET /api/executive-reports/:reportId/preview
- [ ] GET /api/executive-reports/key-topics
- [ ] GET /api/executive-reports/board-agenda
- [ ] GET /api/executive-reports/insights

#### UI実装
- [ ] ExecutiveReportsPage ハードコードデータ削除
- [ ] 実データ接続（5セクション）
- [ ] レポート生成UI
- [ ] ダウンロード機能
- [ ] プレビュー機能
- [ ] ローディング状態表示
- [ ] エラーハンドリング

#### Phase 2実装
- [ ] AI分析エンジン統合
- [ ] 自動生成スケジューラー
- [ ] PowerPoint出力
- [ ] カスタムレポートUI

#### テスト
- [ ] ExecutiveReportServiceの単体テスト
- [ ] レポート生成の統合テスト
- [ ] PDF/Excel出力テスト
- [ ] E2Eテスト（ExecutiveReportsPage全機能）
- [ ] パフォーマンステスト（100ページレポート）
- [ ] Level 16権限チェックテスト

---

### 医療システム側の実装

#### API実装
- [ ] GET /api/employees/count（総職員数取得）
- [ ] GET /api/employees/:employeeId/profile（発表者情報取得）

#### テスト
- [ ] 単体テスト（各APIエンドポイント）
- [ ] 統合テスト（VoiceDrive連携）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [organization-analytics_DB要件分析](./organization-analytics_DB要件分析_20251010.md)
- [strategic-hr-plan_DB要件分析](./strategic-hr-plan_DB要件分析_20251010.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)
- [prisma/schema.prisma](../../prisma/schema.prisma)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
次回レビュー: Phase 1実装後
