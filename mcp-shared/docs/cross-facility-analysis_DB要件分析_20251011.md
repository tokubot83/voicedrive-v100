# Cross Facility Analysis DB要件分析

**作成日**: 2025年10月11日
**対象ページ**: CrossFacilityAnalysis (https://voicedrive-v100.vercel.app/cross-facility-analysis)
**権限レベル**: Level 18（理事長・法人事務局長）
**ドキュメントID**: CROSS-FAC-ANALYSIS-20251011

---

## 1. ページ概要

### 1.1 目的
複数施設で共通する課題を発見し、法人全体で取り組むべき戦略課題を特定する。成功事例の横展開と戦略的機会の創出を支援。

### 1.2 対象ユーザー
- Level 18: 理事長、法人事務局長

### 1.3 主要機能
1. **施設横断共通課題の発見** - 2施設以上で発生している共通課題を抽出
2. **横展開可能な成功事例の特定** - 1施設で成功した取り組みを他施設に展開
3. **法人全体での戦略的機会の提案** - 共通課題から法人レベルの施策を提案

---

## 2. ページ構成とデータ分析

### 2.1 サマリーカード（lines 224-252）

**表示内容**:
```typescript
- 共通課題数: 5件（2施設以上で発生）
- 成功事例数: 3件（横展開可能）
- 戦略的機会数: 3件（法人全体施策）
```

**データソース**:
- 共通課題数: `CrossFacilityCommonIssue` テーブルから集計
- 成功事例数: `CrossFacilitySuccessCase` テーブルから集計
- 戦略的機会数: `StrategicOpportunity` テーブルから集計

**算出方法**:
```typescript
// 共通課題数
SELECT COUNT(*) FROM CrossFacilityCommonIssue
WHERE affectedFacilityCount >= 2;

// 成功事例数
SELECT COUNT(*) FROM CrossFacilitySuccessCase
WHERE replicability >= 70;

// 戦略的機会数
SELECT COUNT(*) FROM StrategicOpportunity
WHERE status = 'proposed' OR status = 'approved';
```

---

### 2.2 施設横断共通課題（lines 48-104, 254-322）

**表示内容**:
```typescript
interface CommonIssue {
  id: string;
  title: string;                      // "夜勤時の人手不足"
  category: string;                   // "人材配置"
  affectedFacilities: string[];       // ["中央総合病院", "北部医療センター", ...]
  totalVoices: number;                // 347件
  severity: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
  suggestedAction: string;            // "法人全体での夜勤シフト最適化..."
}
```

**5件の共通課題**:
1. 夜勤時の人手不足（6施設、347件、high、増加傾向）
2. 電子カルテシステムの操作性（4施設、234件、medium、横ばい）
3. 若手職員のキャリアパス不透明（6施設、198件、high、増加傾向）
4. 施設間情報共有の不足（全10施設、156件、medium、横ばい）
5. 医療材料の調達コスト（5施設、134件、medium、増加傾向）

**データソース**:
- **既存Postテーブルから自動抽出**
- 同じカテゴリ/キーワードのPostを施設横断で集計
- 2施設以上で閾値（例: 20件以上）を超えたら共通課題として登録

**算出方法**:
```sql
-- 施設横断課題の自動検出
WITH CategoryFacilityCounts AS (
  SELECT
    category,
    facilityId,
    COUNT(*) as voice_count,
    ARRAY_AGG(DISTINCT id) as post_ids
  FROM Post
  WHERE status = 'active' OR status = 'in_progress'
  GROUP BY category, facilityId
  HAVING COUNT(*) >= 20  -- 閾値: 1施設あたり20件以上
)
SELECT
  category,
  COUNT(DISTINCT facilityId) as affected_facility_count,
  SUM(voice_count) as total_voices,
  ARRAY_AGG(DISTINCT facilityId) as affected_facilities
FROM CategoryFacilityCounts
GROUP BY category
HAVING COUNT(DISTINCT facilityId) >= 2  -- 2施設以上
ORDER BY total_voices DESC;
```

**重要度判定ロジック**:
```typescript
const calculateSeverity = (
  affectedFacilityCount: number,
  totalVoices: number
): 'high' | 'medium' | 'low' => {
  if (affectedFacilityCount >= 6 && totalVoices >= 200) return 'high';
  if (affectedFacilityCount >= 4 && totalVoices >= 100) return 'medium';
  return 'low';
};
```

**トレンド判定ロジック**:
```typescript
const calculateTrend = (
  currentMonthCount: number,
  previousMonthCount: number
): 'increasing' | 'stable' | 'decreasing' => {
  const changeRate = (currentMonthCount - previousMonthCount) / previousMonthCount;
  if (changeRate > 0.1) return 'increasing';   // 10%以上増加
  if (changeRate < -0.1) return 'decreasing';  // 10%以上減少
  return 'stable';
};
```

**カテゴリフィルター**:
- 全カテゴリ（5件）
- 人材配置（1件）
- 人材育成（1件）
- IT・システム（1件）
- コミュニケーション（1件）
- コスト管理（1件）

---

### 2.3 横展開可能な成功事例（lines 107-138, 326-369）

**表示内容**:
```typescript
interface SuccessCase {
  id: string;
  facility: string;                   // "中央総合病院"
  title: string;                      // "メンター制度による新人定着率向上"
  category: string;                   // "人材育成"
  description: string;
  impact: string;                     // "新人離職率 35% → 8%（-27pt）"
  replicability: number;              // 85（横展開可能性: 0-100）
  interestedFacilities: string[];     // ["北部医療センター", "桜ヶ丘総合病院", ...]
}
```

**3件の成功事例**:
1. メンター制度による新人定着率向上（中央総合病院、85%、3施設が関心）
2. チーム制勤務による負担平準化（桜ヶ丘総合病院、78%、2施設が関心）
3. 患者対応マニュアルの体系化（北部医療センター、92%、4施設が関心）

**データソース**:
- **既存Postテーブルから自動抽出**
- status='resolved'で高評価（Vote数多数、高いresolutionRating）のPostを抽出
- 他施設で類似課題がある場合に成功事例として提案

**抽出ロジック**:
```sql
-- 成功事例の自動検出
SELECT
  p.id,
  p.title,
  p.category,
  p.facilityId,
  p.content as description,
  COUNT(DISTINCT v.userId) as vote_count,
  AVG(c.sentiment) as avg_sentiment,
  p.resolutionSummary as impact
FROM Post p
LEFT JOIN Vote v ON p.id = v.postId
LEFT JOIN Comment c ON p.id = c.postId
WHERE p.status = 'resolved'
  AND p.resolutionRating >= 4.0  -- 高評価のみ
  AND p.resolvedAt >= NOW() - INTERVAL '6 months'  -- 直近6ヶ月
GROUP BY p.id
HAVING COUNT(DISTINCT v.userId) >= 30  -- 30人以上の賛同
ORDER BY vote_count DESC, avg_sentiment DESC
LIMIT 10;
```

**横展開可能性スコア算出**:
```typescript
const calculateReplicability = (
  post: Post,
  similarIssuesInOtherFacilities: number,
  implementationComplexity: 'low' | 'medium' | 'high'
): number => {
  let score = 50; // ベーススコア

  // 他施設に類似課題が多いほど高スコア
  score += Math.min(similarIssuesInOtherFacilities * 5, 30);

  // 実装の複雑度が低いほど高スコア
  const complexityScores = { low: 20, medium: 10, high: 0 };
  score += complexityScores[implementationComplexity];

  return Math.min(score, 100);
};
```

**関心施設の判定**:
```sql
-- 関心施設の判定（類似課題を持つ施設）
SELECT DISTINCT
  p2.facilityId as interested_facility
FROM Post p1
CROSS JOIN Post p2
WHERE p1.id = :success_case_post_id
  AND p2.facilityId != p1.facilityId
  AND p2.category = p1.category
  AND p2.status IN ('active', 'in_progress')
  AND similarity(p1.title, p2.title) > 0.5  -- テキスト類似度50%以上
ORDER BY p2.facilityId;
```

---

### 2.4 法人全体での戦略的機会（lines 141-169, 372-409）

**表示内容**:
```typescript
interface StrategicOpportunity {
  id: string;
  title: string;                      // "施設間人材ローテーション制度"
  opportunity: string;                // 詳細説明
  expectedImpact: string;             // "夜勤負担の平準化、職員スキルの多様化..."
  requiredInvestment: string;         // "約500万円（システム開発、移動支援費）"
  timeline: string;                   // "2026年1月制度設計開始、4月試験運用..."
  priority: 'high' | 'medium' | 'low';
}
```

**3件の戦略的機会**:
1. 施設間人材ローテーション制度（high、500万円、2026年1月開始）
2. 法人統一キャリアラダー制度（high、300万円、2026年2月開始）
3. 法人共同購買システム（medium、1,200万円、2026年3月開始）

**データソース**:
- **共通課題から自動生成**
- 複数施設（4施設以上）で発生している高重要度課題から戦略的機会を提案
- または管理者が手動で登録

**自動生成ロジック**:
```typescript
const generateStrategicOpportunity = (
  commonIssue: CommonIssue
): StrategicOpportunity | null => {
  // 4施設以上で発生し、重要度highの課題のみ
  if (commonIssue.affectedFacilities.length < 4 || commonIssue.severity !== 'high') {
    return null;
  }

  // カテゴリに応じた戦略施策テンプレート
  const templates = {
    '人材配置': {
      title: '施設間人材ローテーション制度',
      expectedImpact: '負担の平準化、スキル向上、最適配置',
      requiredInvestment: '約500万円',
      priority: 'high' as const
    },
    '人材育成': {
      title: '法人統一キャリアラダー制度',
      expectedImpact: '定着率向上、計画的育成、組織活性化',
      requiredInvestment: '約300万円',
      priority: 'high' as const
    },
    'コスト管理': {
      title: '法人共同購買システム',
      expectedImpact: 'コスト削減、調達効率化',
      requiredInvestment: '約1,200万円',
      priority: 'medium' as const
    }
  };

  const template = templates[commonIssue.category];
  if (!template) return null;

  return {
    id: generateId(),
    title: template.title,
    opportunity: commonIssue.description,
    expectedImpact: template.expectedImpact,
    requiredInvestment: template.requiredInvestment,
    timeline: generateTimeline(),
    priority: template.priority
  };
};
```

---

## 3. データ責任分担

### 3.1 VoiceDrive側の責任（100%）

| データ項目 | 管理方法 | 理由 |
|-----------|---------|------|
| **共通課題データ** | 新規テーブル | VoiceDriveのPost集計結果 |
| **成功事例データ** | 新規テーブル | VoiceDriveのPost解析結果 |
| **戦略的機会データ** | 新規テーブル | VoiceDriveの分析結果 |
| **施設名** | キャッシュ | 医療システムAPIから取得してキャッシュ |

### 3.2 医療職員管理システム側の責任

| データ項目 | 提供方法 | 備考 |
|-----------|---------|------|
| **施設マスタ** | API提供 | GET /api/v2/facilities（既存） |
| **施設別職員数** | API提供 | GET /api/v2/employees/count（既存） |

**結論**: **医療システム側の追加作業なし**（既存APIのみ使用）

---

## 4. 不足項目の洗い出し

### 4.1 新規テーブルが必要

#### 4.1.1 CrossFacilityCommonIssue（施設横断共通課題）

```prisma
model CrossFacilityCommonIssue {
  id                    String    @id @default(cuid())
  title                 String                          // "夜勤時の人手不足"
  category              String                          // "人材配置"
  description           String    @db.Text              // 詳細説明
  affectedFacilities    Json                            // ["FAC001", "FAC002", ...]
  affectedFacilityCount Int       @map("affected_facility_count")
  totalVoices           Int       @map("total_voices")  // 関連投稿数
  severity              String    @default("medium")    // "high", "medium", "low"
  trend                 String    @default("stable")    // "increasing", "stable", "decreasing"
  suggestedAction       String    @db.Text              // 推奨アクション
  sourcePostIds         Json      @map("source_post_ids")  // 元となったPost IDの配列
  detectedAt            DateTime  @default(now()) @map("detected_at")
  lastUpdatedAt         DateTime  @updatedAt @map("last_updated_at")
  status                String    @default("active")    // "active", "addressing", "resolved", "archived"
  assignedTo            String?   @map("assigned_to")   // 担当者（Level 18ユーザー）

  assignee              User?     @relation("CommonIssueAssignee", fields: [assignedTo], references: [id])
  strategicOpportunities StrategicOpportunity[] @relation("IssueToOpportunity")

  @@map("cross_facility_common_issue")
  @@index([category])
  @@index([severity])
  @@index([detectedAt])
}
```

**初期データ例**:
```typescript
{
  id: "CFCI001",
  title: "夜勤時の人手不足",
  category: "人材配置",
  description: "夜勤帯の人員不足により、職員の負担増加と患者対応の質低下が懸念される。",
  affectedFacilities: ["FAC001", "FAC002", "FAC003", "FAC004", "FAC005", "FAC006"],
  affectedFacilityCount: 6,
  totalVoices: 347,
  severity: "high",
  trend: "increasing",
  suggestedAction: "法人全体での夜勤シフト最適化、施設間ローテーション制度の導入検討",
  sourcePostIds: ["POST123", "POST456", "POST789", ...],
  detectedAt: "2025-09-15T10:00:00Z",
  status: "active"
}
```

#### 4.1.2 CrossFacilitySuccessCase（横展開可能な成功事例）

```prisma
model CrossFacilitySuccessCase {
  id                    String    @id @default(cuid())
  facilityId            String    @map("facility_id")   // 成功事例の発生施設
  title                 String                          // "メンター制度による新人定着率向上"
  category              String                          // "人材育成"
  description           String    @db.Text              // 詳細説明
  impact                String    @db.Text              // "新人離職率 35% → 8%（-27pt）"
  impactMetrics         Json?     @map("impact_metrics")  // { before: 35, after: 8, unit: "%" }
  replicability         Int       @default(50)          // 横展開可能性スコア（0-100）
  implementationCost    String?   @map("implementation_cost")  // "約50万円"
  implementationPeriod  String?   @map("implementation_period") // "3ヶ月"
  interestedFacilities  Json?     @map("interested_facilities") // ["FAC002", "FAC003", ...]
  sourcePostId          String    @map("source_post_id")  // 元となったPost ID
  identifiedAt          DateTime  @default(now()) @map("identified_at")
  status                String    @default("proposed")  // "proposed", "approved", "replicating", "replicated"
  approvedBy            String?   @map("approved_by")   // 承認者（Level 18）
  approvedAt            DateTime? @map("approved_at")

  facility              User      @relation("SuccessCaseFacility", fields: [facilityId], references: [facilityId])
  sourcePost            Post      @relation("SuccessCaseSource", fields: [sourcePostId], references: [id])
  approver              User?     @relation("SuccessCaseApprover", fields: [approvedBy], references: [id])
  replications          SuccessCaseReplication[]

  @@map("cross_facility_success_case")
  @@index([facilityId])
  @@index([category])
  @@index([replicability])
}
```

**初期データ例**:
```typescript
{
  id: "CFSC001",
  facilityId: "FAC001",
  title: "メンター制度による新人定着率向上",
  category: "人材育成",
  description: "1年目看護師に対する専任メンター制度を導入。定期的な1on1面談と目標設定により、新人の離職率が大幅改善。",
  impact: "新人離職率 35% → 8%（-27pt）、新人満足度 82%",
  impactMetrics: {
    turnoverRate: { before: 35, after: 8, unit: "%" },
    satisfaction: { after: 82, unit: "%" }
  },
  replicability: 85,
  implementationCost: "約50万円（メンター研修費用）",
  implementationPeriod: "3ヶ月（制度設計1ヶ月、研修1ヶ月、運用開始1ヶ月）",
  interestedFacilities: ["FAC002", "FAC003", "FAC005"],
  sourcePostId: "POST12345",
  status: "approved"
}
```

#### 4.1.3 SuccessCaseReplication（成功事例の横展開状況）

```prisma
model SuccessCaseReplication {
  id                    String    @id @default(cuid())
  successCaseId         String    @map("success_case_id")
  targetFacilityId      String    @map("target_facility_id")
  status                String    @default("planning")  // "planning", "implementing", "completed", "failed"
  startedAt             DateTime? @map("started_at")
  completedAt           DateTime? @map("completed_at")
  progress              Int       @default(0)           // 進捗率（0-100）
  results               String?   @db.Text              // 実施結果
  resultMetrics         Json?     @map("result_metrics")  // 成果指標
  responsiblePerson     String    @map("responsible_person")  // 実施責任者
  notes                 String?   @db.Text              // 備考

  successCase           CrossFacilitySuccessCase @relation(fields: [successCaseId], references: [id], onDelete: Cascade)
  targetFacility        User      @relation("ReplicationTargetFacility", fields: [targetFacilityId], references: [facilityId])
  responsible           User      @relation("ReplicationResponsible", fields: [responsiblePerson], references: [id])

  @@unique([successCaseId, targetFacilityId])
  @@map("success_case_replication")
  @@index([targetFacilityId])
  @@index([status])
}
```

**初期データ例**:
```typescript
{
  id: "SCR001",
  successCaseId: "CFSC001",
  targetFacilityId: "FAC002",
  status: "implementing",
  startedAt: "2025-10-01T00:00:00Z",
  progress: 60,
  responsiblePerson: "USR12345",
  notes: "メンター候補者10名の研修を完了。11月から本格運用予定。"
}
```

#### 4.1.4 StrategicOpportunity（法人全体での戦略的機会）

```prisma
model StrategicOpportunity {
  id                    String    @id @default(cuid())
  title                 String                          // "施設間人材ローテーション制度"
  opportunity           String    @db.Text              // 機会の詳細
  expectedImpact        String    @db.Text              // 期待効果
  requiredInvestment    String                          // "約500万円"
  investmentAmount      Decimal?  @db.Decimal(15, 2) @map("investment_amount")
  timeline              String    @db.Text              // 実施スケジュール
  priority              String    @default("medium")    // "high", "medium", "low"
  status                String    @default("proposed")  // "proposed", "approved", "implementing", "completed", "rejected"
  proposedAt            DateTime  @default(now()) @map("proposed_at")
  approvedAt            DateTime? @map("approved_at")
  approvedBy            String?   @map("approved_by")   // 承認者（理事長等）
  relatedIssueIds       Json?     @map("related_issue_ids")  // 関連する共通課題ID
  targetFacilities      Json?     @map("target_facilities")  // 対象施設
  kpiTargets            Json?     @map("kpi_targets")   // KPI目標値
  actualResults         Json?     @map("actual_results")  // 実績値
  documentUrl           String?   @map("document_url")  // 企画書URL

  approver              User?     @relation("OpportunityApprover", fields: [approvedBy], references: [id])
  relatedIssues         CrossFacilityCommonIssue[] @relation("IssueToOpportunity")

  @@map("strategic_opportunity")
  @@index([priority])
  @@index([status])
  @@index([proposedAt])
}
```

**初期データ例**:
```typescript
{
  id: "SO001",
  title: "施設間人材ローテーション制度",
  opportunity: "夜勤人手不足など6施設共通の課題に対し、施設間で人材を融通し合う仕組みを構築。職員のスキル向上とキャリア開発にも寄与。",
  expectedImpact: "夜勤負担の平準化、職員スキルの多様化、法人全体での人材最適配置",
  requiredInvestment: "約500万円（システム開発、移動支援費）",
  investmentAmount: 5000000,
  timeline: "2026年1月制度設計開始、4月試験運用、7月本格運用",
  priority: "high",
  status: "proposed",
  relatedIssueIds: ["CFCI001"],
  targetFacilities: ["FAC001", "FAC002", "FAC003", "FAC004", "FAC005", "FAC006"],
  kpiTargets: {
    nightShiftBurdenReduction: { target: 30, unit: "%" },
    staffSatisfaction: { target: 20, unit: "pt increase" }
  }
}
```

### 4.2 既存テーブルの拡張

#### 4.2.1 User テーブル拡張

```prisma
model User {
  // 既存フィールド...

  // CrossFacilityAnalysis統合実装（2025-10-11）
  assignedCommonIssues      CrossFacilityCommonIssue[]  @relation("CommonIssueAssignee")
  successCasesFromFacility  CrossFacilitySuccessCase[]  @relation("SuccessCaseFacility")
  approvedSuccessCases      CrossFacilitySuccessCase[]  @relation("SuccessCaseApprover")
  replicationsAtFacility    SuccessCaseReplication[]    @relation("ReplicationTargetFacility")
  responsibleReplications   SuccessCaseReplication[]    @relation("ReplicationResponsible")
  approvedOpportunities     StrategicOpportunity[]      @relation("OpportunityApprover")
}
```

#### 4.2.2 Post テーブル拡張

```prisma
model Post {
  // 既存フィールド...

  // CrossFacilityAnalysis統合実装（2025-10-11）
  successCases              CrossFacilitySuccessCase[]  @relation("SuccessCaseSource")
}
```

### 4.3 医療システムAPIの必要性

**必要なAPI**: ✅ **全て既存実装済み**

| API | 用途 | 実装状況 |
|-----|------|---------|
| GET /api/v2/facilities | 施設マスタ取得 | ✅ 実装済み |
| GET /api/v2/employees/count | 施設別職員数取得 | ✅ 実装済み |

**結論**: **医療システム側の追加作業なし**

---

## 5. サービス層実装要件

### 5.1 CrossFacilityAnalysisService

```typescript
class CrossFacilityAnalysisService {
  /**
   * 施設横断共通課題の自動検出
   * - 既存Postテーブルから施設横断で発生している課題を抽出
   * - 2施設以上で閾値（20件以上）を超えたら共通課題として登録
   */
  async detectCommonIssues(): Promise<CrossFacilityCommonIssue[]>;

  /**
   * 共通課題の重要度判定
   * - 影響施設数と総投稿数から算出
   */
  calculateSeverity(
    affectedFacilityCount: number,
    totalVoices: number
  ): 'high' | 'medium' | 'low';

  /**
   * 共通課題のトレンド判定
   * - 前月比で増加・横ばい・減少を判定
   */
  calculateTrend(
    currentMonthCount: number,
    previousMonthCount: number
  ): 'increasing' | 'stable' | 'decreasing';

  /**
   * 成功事例の自動抽出
   * - status='resolved'で高評価のPostを抽出
   * - 他施設に類似課題がある場合に成功事例として提案
   */
  async identifySuccessCases(): Promise<CrossFacilitySuccessCase[]>;

  /**
   * 横展開可能性スコア算出
   * - 他施設の類似課題数、実装の複雑度から算出
   */
  calculateReplicability(
    post: Post,
    similarIssuesInOtherFacilities: number,
    implementationComplexity: 'low' | 'medium' | 'high'
  ): number;

  /**
   * 関心施設の判定
   * - 類似課題を持つ施設を特定
   */
  async findInterestedFacilities(
    successCaseId: string
  ): Promise<string[]>;

  /**
   * 戦略的機会の自動生成
   * - 4施設以上で発生している高重要度課題から提案
   */
  async generateStrategicOpportunities(): Promise<StrategicOpportunity[]>;

  /**
   * 全データ取得（ダッシュボード表示用）
   */
  async getCrossFacilityAnalysisData(): Promise<{
    commonIssues: CrossFacilityCommonIssue[];
    successCases: CrossFacilitySuccessCase[];
    strategicOpportunities: StrategicOpportunity[];
  }>;

  /**
   * カテゴリ別フィルタリング
   */
  async filterCommonIssuesByCategory(
    category: string
  ): Promise<CrossFacilityCommonIssue[]>;
}
```

### 5.2 主要メソッド実装詳細

#### 5.2.1 detectCommonIssues()

```typescript
async detectCommonIssues(): Promise<CrossFacilityCommonIssue[]> {
  // Step 1: カテゴリ×施設ごとに投稿数をカウント
  const categoryFacilityCounts = await prisma.$queryRaw`
    SELECT
      category,
      facility_id,
      COUNT(*) as voice_count,
      JSON_ARRAYAGG(id) as post_ids
    FROM posts
    WHERE (status = 'active' OR status = 'in_progress')
      AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY category, facility_id
    HAVING COUNT(*) >= 20
  `;

  // Step 2: 2施設以上で発生しているカテゴリを抽出
  const commonIssuesData = categoryFacilityCounts.reduce((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = {
        facilities: [],
        totalVoices: 0,
        postIds: []
      };
    }
    acc[row.category].facilities.push(row.facility_id);
    acc[row.category].totalVoices += row.voice_count;
    acc[row.category].postIds.push(...row.post_ids);
    return acc;
  }, {});

  // Step 3: 2施設以上のもののみフィルタリング
  const commonIssues = Object.entries(commonIssuesData)
    .filter(([_, data]) => data.facilities.length >= 2)
    .map(([category, data]) => ({
      category,
      affectedFacilities: data.facilities,
      affectedFacilityCount: data.facilities.length,
      totalVoices: data.totalVoices,
      sourcePostIds: data.postIds,
      severity: this.calculateSeverity(data.facilities.length, data.totalVoices),
      trend: await this.calculateTrend(category)
    }));

  // Step 4: データベースに保存（既存データは更新）
  for (const issue of commonIssues) {
    await prisma.crossFacilityCommonIssue.upsert({
      where: { category: issue.category },
      create: {
        title: this.generateTitle(issue.category),
        category: issue.category,
        description: await this.generateDescription(issue),
        affectedFacilities: issue.affectedFacilities,
        affectedFacilityCount: issue.affectedFacilityCount,
        totalVoices: issue.totalVoices,
        severity: issue.severity,
        trend: issue.trend,
        suggestedAction: await this.generateSuggestedAction(issue),
        sourcePostIds: issue.sourcePostIds
      },
      update: {
        affectedFacilities: issue.affectedFacilities,
        affectedFacilityCount: issue.affectedFacilityCount,
        totalVoices: issue.totalVoices,
        severity: issue.severity,
        trend: issue.trend
      }
    });
  }

  return commonIssues;
}
```

#### 5.2.2 identifySuccessCases()

```typescript
async identifySuccessCases(): Promise<CrossFacilitySuccessCase[]> {
  // Step 1: 高評価で解決済みのPostを抽出
  const resolvedPosts = await prisma.post.findMany({
    where: {
      status: 'resolved',
      resolutionRating: { gte: 4.0 },
      resolvedAt: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
    },
    include: {
      votes: true,
      comments: true
    }
  });

  // Step 2: 賛同数が多い順にソート
  const rankedPosts = resolvedPosts
    .map(post => ({
      post,
      voteCount: post.votes.length,
      avgSentiment: post.comments.reduce((sum, c) => sum + (c.sentiment || 0), 0) / post.comments.length
    }))
    .filter(item => item.voteCount >= 30)
    .sort((a, b) => b.voteCount - a.voteCount);

  // Step 3: 各Postについて横展開可能性を判定
  const successCases: CrossFacilitySuccessCase[] = [];

  for (const { post, voteCount } of rankedPosts.slice(0, 10)) {
    // 他施設で類似課題が存在するか確認
    const similarIssuesCount = await this.countSimilarIssuesInOtherFacilities(
      post.category,
      post.facilityId
    );

    if (similarIssuesCount === 0) continue; // 類似課題がなければスキップ

    const replicability = this.calculateReplicability(
      post,
      similarIssuesCount,
      'medium' // デフォルト複雑度
    );

    const interestedFacilities = await this.findInterestedFacilities(post.id);

    const successCase = await prisma.crossFacilitySuccessCase.create({
      data: {
        facilityId: post.facilityId,
        title: post.title,
        category: post.category,
        description: post.content,
        impact: post.resolutionSummary || 'データなし',
        replicability,
        interestedFacilities,
        sourcePostId: post.id,
        status: 'proposed'
      }
    });

    successCases.push(successCase);
  }

  return successCases;
}
```

#### 5.2.3 generateStrategicOpportunities()

```typescript
async generateStrategicOpportunities(): Promise<StrategicOpportunity[]> {
  // Step 1: 4施設以上で発生している高重要度課題を取得
  const highPriorityIssues = await prisma.crossFacilityCommonIssue.findMany({
    where: {
      affectedFacilityCount: { gte: 4 },
      severity: 'high',
      status: 'active'
    }
  });

  // Step 2: 各課題から戦略的機会を生成
  const opportunities: StrategicOpportunity[] = [];

  const templates = {
    '人材配置': {
      title: '施設間人材ローテーション制度',
      expectedImpact: '負担の平準化、スキル向上、最適配置',
      requiredInvestment: '約500万円',
      investmentAmount: 5000000,
      priority: 'high' as const
    },
    '人材育成': {
      title: '法人統一キャリアラダー制度',
      expectedImpact: '定着率向上、計画的育成、組織活性化',
      requiredInvestment: '約300万円',
      investmentAmount: 3000000,
      priority: 'high' as const
    },
    'IT・システム': {
      title: '法人統一IT研修プログラム',
      expectedImpact: '業務効率化、システム活用度向上',
      requiredInvestment: '約200万円',
      investmentAmount: 2000000,
      priority: 'medium' as const
    },
    'コスト管理': {
      title: '法人共同購買システム',
      expectedImpact: 'コスト削減、調達効率化',
      requiredInvestment: '約1,200万円',
      investmentAmount: 12000000,
      priority: 'medium' as const
    }
  };

  for (const issue of highPriorityIssues) {
    const template = templates[issue.category];
    if (!template) continue;

    // 既に同じタイトルの戦略的機会が存在するか確認
    const existing = await prisma.strategicOpportunity.findFirst({
      where: { title: template.title }
    });

    if (existing) continue; // 既存の場合はスキップ

    const opportunity = await prisma.strategicOpportunity.create({
      data: {
        title: template.title,
        opportunity: issue.description,
        expectedImpact: template.expectedImpact,
        requiredInvestment: template.requiredInvestment,
        investmentAmount: template.investmentAmount,
        timeline: this.generateTimeline(),
        priority: template.priority,
        relatedIssueIds: [issue.id],
        targetFacilities: issue.affectedFacilities,
        status: 'proposed'
      }
    });

    opportunities.push(opportunity);
  }

  return opportunities;
}
```

---

## 6. API要件

### 6.1 共通課題取得

```typescript
GET /api/cross-facility/common-issues
Permission: Level 18+
Query params:
  - category?: string          // カテゴリフィルタ
  - severity?: string          // 重要度フィルタ
Response: CrossFacilityCommonIssue[]
```

### 6.2 成功事例取得

```typescript
GET /api/cross-facility/success-cases
Permission: Level 18+
Query params:
  - category?: string          // カテゴリフィルタ
  - minReplicability?: number  // 最低横展開可能性スコア
Response: CrossFacilitySuccessCase[]
```

### 6.3 戦略的機会取得

```typescript
GET /api/cross-facility/strategic-opportunities
Permission: Level 18+
Query params:
  - priority?: string          // 優先度フィルタ
  - status?: string            // ステータスフィルタ
Response: StrategicOpportunity[]
```

### 6.4 共通課題の自動検出実行

```typescript
POST /api/cross-facility/detect-common-issues
Permission: Level 18+
Response: {
  detected: number;            // 検出された共通課題数
  commonIssues: CrossFacilityCommonIssue[];
}
```

### 6.5 成功事例の自動抽出実行

```typescript
POST /api/cross-facility/identify-success-cases
Permission: Level 18+
Response: {
  identified: number;          // 抽出された成功事例数
  successCases: CrossFacilitySuccessCase[];
}
```

### 6.6 戦略的機会の自動生成実行

```typescript
POST /api/cross-facility/generate-opportunities
Permission: Level 18+
Response: {
  generated: number;           // 生成された戦略的機会数
  opportunities: StrategicOpportunity[];
}
```

### 6.7 成功事例の承認

```typescript
POST /api/cross-facility/success-cases/:id/approve
Permission: Level 18+
Response: CrossFacilitySuccessCase
```

### 6.8 成功事例の横展開開始

```typescript
POST /api/cross-facility/success-cases/:id/replicate
Permission: Level 18+
Body: {
  targetFacilityId: string;
  responsiblePerson: string;
}
Response: SuccessCaseReplication
```

### 6.9 戦略的機会の承認

```typescript
POST /api/cross-facility/strategic-opportunities/:id/approve
Permission: Level 18+
Response: StrategicOpportunity
```

---

## 7. フロントエンド要件

### 7.1 コンポーネント構成

```typescript
// src/components/cross-facility/CommonIssueCard.tsx
interface Props {
  issue: CrossFacilityCommonIssue;
}

// src/components/cross-facility/SuccessCaseCard.tsx
interface Props {
  successCase: CrossFacilitySuccessCase;
  onApprove?: () => void;
  onReplicate?: (targetFacility: string) => void;
}

// src/components/cross-facility/StrategicOpportunityCard.tsx
interface Props {
  opportunity: StrategicOpportunity;
  onApprove?: () => void;
}

// src/components/cross-facility/CategoryFilter.tsx
interface Props {
  categories: { id: string; label: string; count: number }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}
```

### 7.2 カスタムフック

```typescript
// src/hooks/useCrossFacilityAnalysis.ts
export const useCrossFacilityAnalysis = () => {
  const [commonIssues, setCommonIssues] = useState<CrossFacilityCommonIssue[]>([]);
  const [successCases, setSuccessCases] = useState<CrossFacilitySuccessCase[]>([]);
  const [opportunities, setOpportunities] = useState<StrategicOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    const [issuesData, casesData, oppsData] = await Promise.all([
      fetch(`/api/cross-facility/common-issues?category=${selectedCategory}`),
      fetch('/api/cross-facility/success-cases'),
      fetch('/api/cross-facility/strategic-opportunities')
    ]);

    setCommonIssues(await issuesData.json());
    setSuccessCases(await casesData.json());
    setOpportunities(await oppsData.json());
    setLoading(false);
  };

  const detectCommonIssues = async () => {
    const response = await fetch('/api/cross-facility/detect-common-issues', {
      method: 'POST'
    });
    const result = await response.json();
    await fetchData();
    return result;
  };

  const approveSuccessCase = async (id: string) => {
    await fetch(`/api/cross-facility/success-cases/${id}/approve`, {
      method: 'POST'
    });
    await fetchData();
  };

  const replicateSuccessCase = async (
    id: string,
    targetFacilityId: string,
    responsiblePerson: string
  ) => {
    await fetch(`/api/cross-facility/success-cases/${id}/replicate`, {
      method: 'POST',
      body: JSON.stringify({ targetFacilityId, responsiblePerson })
    });
    await fetchData();
  };

  return {
    commonIssues,
    successCases,
    opportunities,
    loading,
    selectedCategory,
    setSelectedCategory,
    detectCommonIssues,
    approveSuccessCase,
    replicateSuccessCase
  };
};
```

---

## 8. バッチ処理要件

### 8.1 共通課題の定期検出

**頻度**: 日次（毎日午前3時）

```typescript
// src/jobs/detectCommonIssuesJob.ts
export const detectCommonIssuesJob = async () => {
  const service = new CrossFacilityAnalysisService();
  const commonIssues = await service.detectCommonIssues();

  logger.info(`Detected ${commonIssues.length} common issues across facilities`);

  // Level 18ユーザーに通知
  if (commonIssues.some(issue => issue.severity === 'high')) {
    await notificationService.notifyLevel18Users({
      title: '新しい重要な共通課題が検出されました',
      body: `${commonIssues.filter(i => i.severity === 'high').length}件の高重要度課題が検出されました。`,
      link: '/cross-facility-analysis'
    });
  }
};
```

### 8.2 成功事例の定期抽出

**頻度**: 週次（毎週月曜日午前4時）

```typescript
// src/jobs/identifySuccessCasesJob.ts
export const identifySuccessCasesJob = async () => {
  const service = new CrossFacilityAnalysisService();
  const successCases = await service.identifySuccessCases();

  logger.info(`Identified ${successCases.length} success cases for cross-facility replication`);

  // Level 18ユーザーに通知
  if (successCases.length > 0) {
    await notificationService.notifyLevel18Users({
      title: '新しい成功事例が発見されました',
      body: `${successCases.length}件の横展開可能な成功事例が見つかりました。`,
      link: '/cross-facility-analysis'
    });
  }
};
```

### 8.3 戦略的機会の定期生成

**頻度**: 月次（毎月1日午前5時）

```typescript
// src/jobs/generateOpportunitiesJob.ts
export const generateOpportunitiesJob = async () => {
  const service = new CrossFacilityAnalysisService();
  const opportunities = await service.generateStrategicOpportunities();

  logger.info(`Generated ${opportunities.length} strategic opportunities`);

  // Level 18ユーザーに通知
  if (opportunities.some(opp => opp.priority === 'high')) {
    await notificationService.notifyLevel18Users({
      title: '新しい戦略的機会が生成されました',
      body: `${opportunities.filter(o => o.priority === 'high').length}件の高優先度施策が提案されました。`,
      link: '/cross-facility-analysis'
    });
  }
};
```

---

## 9. 実装スケジュール

### Phase 1: データベース・サービス層実装（5日）

**Day 1-2: テーブル設計・マイグレーション**
- 4テーブル作成（CrossFacilityCommonIssue, CrossFacilitySuccessCase, SuccessCaseReplication, StrategicOpportunity）
- User, Postテーブル拡張
- インデックス追加
- マイグレーション実行

**Day 3-4: サービス層実装**
- CrossFacilityAnalysisService実装
- detectCommonIssues() メソッド
- identifySuccessCases() メソッド
- generateStrategicOpportunities() メソッド
- calculateSeverity(), calculateTrend(), calculateReplicability() ヘルパーメソッド

**Day 5: ユニットテスト**
- サービス層テスト（15ケース以上）
- データ集計ロジックのテスト

### Phase 2: API実装（3日）

**Day 6: API実装（GET系）**
- GET /api/cross-facility/common-issues
- GET /api/cross-facility/success-cases
- GET /api/cross-facility/strategic-opportunities
- 権限チェック実装

**Day 7: API実装（POST系）**
- POST /api/cross-facility/detect-common-issues
- POST /api/cross-facility/identify-success-cases
- POST /api/cross-facility/generate-opportunities
- POST /api/cross-facility/success-cases/:id/approve
- POST /api/cross-facility/success-cases/:id/replicate
- POST /api/cross-facility/strategic-opportunities/:id/approve

**Day 8: API統合テスト**
- APIエンドポイントテスト（10ケース以上）
- 権限チェックテスト
- エラーハンドリングテスト

### Phase 3: フロントエンド実装（4日）

**Day 9: コンポーネント実装**
- CommonIssueCard
- SuccessCaseCard
- StrategicOpportunityCard
- CategoryFilter

**Day 10: カスタムフック実装**
- useCrossFacilityAnalysis
- データフェッチング
- 状態管理

**Day 11: ページ統合**
- CrossFacilityAnalysisPageの既存コードをコンポーネント化
- API連携実装
- ローディング・エラーハンドリング

**Day 12: UI調整・レスポンシブ対応**
- レイアウト調整
- レスポンシブデザイン
- アクセシビリティ対応

### Phase 4: バッチ処理・統合テスト（3日）

**Day 13: バッチ処理実装**
- detectCommonIssuesJob（日次）
- identifySuccessCasesJob（週次）
- generateOpportunitiesJob（月次）
- cron設定

**Day 14: 統合テスト**
- エンドツーエンドテスト
- バッチ処理テスト
- パフォーマンステスト

**Day 15: ドキュメント作成・リリース準備**
- API仕様書作成
- 運用手順書作成
- リリースノート作成

### 総工数
- **開発期間**: 15日（3週間）
- **バックエンド**: 8日（DB 2日 + サービス 3日 + API 3日）
- **フロントエンド**: 4日
- **バッチ・テスト**: 3日

---

## 10. セキュリティ要件

### 10.1 アクセス制御

```typescript
// Level 18（理事長・法人事務局長）のみアクセス可能
const checkCrossFacilityAccess = (user: User) => {
  if (user.permissionLevel < 18) {
    throw new ForbiddenError('施設横断分析へのアクセス権限がありません');
  }
};
```

### 10.2 データマスキング

```typescript
// 共通課題に個人情報が含まれないことを確認
const sanitizeCommonIssue = (issue: CrossFacilityCommonIssue): CrossFacilityCommonIssue => {
  return {
    ...issue,
    // sourcePostIdsは内部管理用のみ、API経由では返さない
    sourcePostIds: undefined
  };
};
```

### 10.3 監査ログ

```typescript
// 戦略的機会の承認をログ記録
await auditLog.create({
  userId: user.id,
  action: 'APPROVE_STRATEGIC_OPPORTUNITY',
  resource: opportunity.id,
  details: { title: opportunity.title, investment: opportunity.investmentAmount },
  timestamp: new Date()
});
```

---

## 11. パフォーマンス要件

### 11.1 共通課題検出の最適化

```sql
-- インデックス作成
CREATE INDEX idx_posts_category_facility_status
ON posts(category, facility_id, status);

CREATE INDEX idx_posts_created_at
ON posts(created_at);
```

### 11.2 キャッシュ戦略

```typescript
// 共通課題: 1時間キャッシュ
await redis.setex('cross-facility:common-issues', 3600, JSON.stringify(commonIssues));

// 成功事例: 6時間キャッシュ
await redis.setex('cross-facility:success-cases', 21600, JSON.stringify(successCases));

// 戦略的機会: 12時間キャッシュ
await redis.setex('cross-facility:strategic-opportunities', 43200, JSON.stringify(opportunities));
```

### 11.3 バッチ処理の並列化

```typescript
// 複数施設の分析を並列実行
const facilities = await getFacilities();
const results = await Promise.all(
  facilities.map(facility => analyzeFacility(facility.id))
);
```

---

## 12. 運用要件

### 12.1 モニタリング

```typescript
// 共通課題検出の成功率監視
const detectionSuccessRate = detectedIssues.length / totalCategories;
if (detectionSuccessRate < 0.5) {
  logger.warn('Common issue detection rate is low');
}
```

### 12.2 通知設定

```typescript
// 高重要度課題検出時の通知
if (commonIssue.severity === 'high' && commonIssue.affectedFacilityCount >= 6) {
  await notificationService.send({
    to: 'executives@hospital.jp',
    subject: '【緊急】6施設以上で共通課題が検出されました',
    body: `課題: ${commonIssue.title}\n影響施設: ${commonIssue.affectedFacilityCount}施設`
  });
}
```

---

## 13. 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)
- [CorporateAgendaDashboard DB要件分析](./corporate-agenda-dashboard_DB要件分析_20251011.md)
- [BoardPreparation DB要件分析](./board-preparation_DB要件分析_20251010.md)

---

**ドキュメント作成者**: Claude (VoiceDrive AI Assistant)
**最終更新日**: 2025年10月11日
**バージョン**: 1.0.0
**ステータス**: ✅ レビュー待ち
