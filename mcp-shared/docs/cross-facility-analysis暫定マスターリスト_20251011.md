# Cross Facility Analysis 暫定マスターリスト

**作成日**: 2025年10月11日
**対象ページ**: CrossFacilityAnalysis (https://voicedrive-v100.vercel.app/cross-facility-analysis)
**権限レベル**: Level 18（理事長・法人事務局長）
**ドキュメントID**: CROSS-FAC-MASTER-20251011

---

## 1. 概要

### 1.1 目的
複数施設で共通する課題を自動検出し、成功事例の横展開と法人全体での戦略的施策を支援する。

### 1.2 主要機能
- **施設横断共通課題の自動検出** - 既存Postから2施設以上で発生している課題を抽出
- **成功事例の自動抽出** - 高評価のresolvedPostから横展開可能な事例を特定
- **戦略的機会の自動生成** - 共通課題から法人レベルの施策を提案

### 1.3 データ責任分担
- **VoiceDrive**: 100%（既存Postテーブルから集計・分析）
- **医療職員管理システム**: 施設マスタAPI提供のみ（既存実装済み）

---

## 2. 医療職員管理システム側要件

### 2.1 必要API

#### 2.1.1 施設マスタ取得API
```yaml
endpoint: GET /api/v2/facilities
description: 全施設マスタ情報を取得
permission: Level 18以上
response:
  type: array
  items:
    - id: string                    # 施設ID
      name: string                  # 施設名
      type: string                  # 施設タイプ
```

**実装状況**: ✅ **既存実装済み**（Phase 3実装時、2025/9/28完了）

### 2.2 追加作業
**なし** - 既存APIのみで対応可能

---

## 3. VoiceDrive側要件

### 3.1 データベース要件

#### 3.1.1 新規テーブル（4テーブル）

##### ① CrossFacilityCommonIssue（施設横断共通課題）

**目的**: 2施設以上で発生している共通課題を管理

**フィールド**:
| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| id | String | ID | "CFCI001" |
| title | String | 課題タイトル | "夜勤時の人手不足" |
| category | String | カテゴリ | "人材配置" |
| description | Text | 詳細説明 | "夜勤帯の人員不足により..." |
| affectedFacilities | Json | 影響施設ID配列 | ["FAC001", "FAC002", ...] |
| affectedFacilityCount | Int | 影響施設数 | 6 |
| totalVoices | Int | 関連投稿数 | 347 |
| severity | String | 重要度 | "high" / "medium" / "low" |
| trend | String | トレンド | "increasing" / "stable" / "decreasing" |
| suggestedAction | Text | 推奨アクション | "法人全体での夜勤シフト最適化..." |
| sourcePostIds | Json | 元Post ID配列 | ["POST123", "POST456", ...] |
| detectedAt | DateTime | 検出日時 | "2025-09-15T10:00:00Z" |
| lastUpdatedAt | DateTime | 最終更新日時 | "2025-10-11T00:00:00Z" |
| status | String | ステータス | "active" / "addressing" / "resolved" / "archived" |
| assignedTo | String? | 担当者ID | "USR123" |

**リレーション**:
- assignee: User (assignedTo)
- strategicOpportunities: StrategicOpportunity[]

**インデックス**:
- category
- severity
- detectedAt

##### ② CrossFacilitySuccessCase（横展開可能な成功事例）

**目的**: 1施設で成功した取り組みを他施設に展開可能な事例として管理

**フィールド**:
| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| id | String | ID | "CFSC001" |
| facilityId | String | 成功事例の発生施設ID | "FAC001" |
| title | String | 事例タイトル | "メンター制度による新人定着率向上" |
| category | String | カテゴリ | "人材育成" |
| description | Text | 詳細説明 | "1年目看護師に対する専任メンター制度..." |
| impact | Text | 成果 | "新人離職率 35% → 8%（-27pt）" |
| impactMetrics | Json? | 成果指標 | { turnoverRate: { before: 35, after: 8 } } |
| replicability | Int | 横展開可能性スコア | 85 (0-100) |
| implementationCost | String? | 実装コスト | "約50万円" |
| implementationPeriod | String? | 実装期間 | "3ヶ月" |
| interestedFacilities | Json? | 関心施設ID配列 | ["FAC002", "FAC003", ...] |
| sourcePostId | String | 元Post ID | "POST12345" |
| identifiedAt | DateTime | 特定日時 | "2025-09-20T00:00:00Z" |
| status | String | ステータス | "proposed" / "approved" / "replicating" / "replicated" |
| approvedBy | String? | 承認者ID | "USR456" |
| approvedAt | DateTime? | 承認日時 | "2025-09-25T00:00:00Z" |

**リレーション**:
- facility: User (facilityId)
- sourcePost: Post (sourcePostId)
- approver: User (approvedBy)
- replications: SuccessCaseReplication[]

**インデックス**:
- facilityId
- category
- replicability

##### ③ SuccessCaseReplication（成功事例の横展開状況）

**目的**: 成功事例を他施設に展開する際の進捗を管理

**フィールド**:
| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| id | String | ID | "SCR001" |
| successCaseId | String | 成功事例ID | "CFSC001" |
| targetFacilityId | String | 展開先施設ID | "FAC002" |
| status | String | ステータス | "planning" / "implementing" / "completed" / "failed" |
| startedAt | DateTime? | 開始日時 | "2025-10-01T00:00:00Z" |
| completedAt | DateTime? | 完了日時 | null |
| progress | Int | 進捗率 | 60 (0-100) |
| results | Text? | 実施結果 | "メンター研修完了。11月から本格運用予定。" |
| resultMetrics | Json? | 成果指標 | { turnoverRate: { current: 12 } } |
| responsiblePerson | String | 実施責任者ID | "USR789" |
| notes | Text? | 備考 | "メンター候補者10名の研修を完了。" |

**リレーション**:
- successCase: CrossFacilitySuccessCase (successCaseId)
- targetFacility: User (targetFacilityId)
- responsible: User (responsiblePerson)

**ユニーク制約**:
- (successCaseId, targetFacilityId)

**インデックス**:
- targetFacilityId
- status

##### ④ StrategicOpportunity（法人全体での戦略的機会）

**目的**: 共通課題から生成された法人レベルの戦略的施策を管理

**フィールド**:
| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| id | String | ID | "SO001" |
| title | String | 施策タイトル | "施設間人材ローテーション制度" |
| opportunity | Text | 機会の詳細 | "夜勤人手不足など6施設共通の課題に対し..." |
| expectedImpact | Text | 期待効果 | "夜勤負担の平準化、職員スキルの多様化..." |
| requiredInvestment | String | 必要投資 | "約500万円" |
| investmentAmount | Decimal? | 投資金額 | 5000000.00 |
| timeline | Text | 実施スケジュール | "2026年1月制度設計開始、4月試験運用..." |
| priority | String | 優先度 | "high" / "medium" / "low" |
| status | String | ステータス | "proposed" / "approved" / "implementing" / "completed" / "rejected" |
| proposedAt | DateTime | 提案日時 | "2025-10-01T00:00:00Z" |
| approvedAt | DateTime? | 承認日時 | null |
| approvedBy | String? | 承認者ID | null |
| relatedIssueIds | Json? | 関連課題ID配列 | ["CFCI001"] |
| targetFacilities | Json? | 対象施設ID配列 | ["FAC001", "FAC002", ...] |
| kpiTargets | Json? | KPI目標値 | { nightShiftBurdenReduction: { target: 30, unit: "%" } } |
| actualResults | Json? | 実績値 | null |
| documentUrl | String? | 企画書URL | "s3://..." |

**リレーション**:
- approver: User (approvedBy)
- relatedIssues: CrossFacilityCommonIssue[]

**インデックス**:
- priority
- status
- proposedAt

#### 3.1.2 既存テーブル拡張

##### User テーブル拡張

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

##### Post テーブル拡張

```prisma
model Post {
  // 既存フィールド...

  // CrossFacilityAnalysis統合実装（2025-10-11）
  successCases              CrossFacilitySuccessCase[]  @relation("SuccessCaseSource")
}
```

### 3.2 サービス層要件

#### 3.2.1 CrossFacilityAnalysisService

```typescript
class CrossFacilityAnalysisService {
  // 共通課題の自動検出
  async detectCommonIssues(): Promise<CrossFacilityCommonIssue[]>;

  // 重要度判定
  calculateSeverity(
    affectedFacilityCount: number,
    totalVoices: number
  ): 'high' | 'medium' | 'low';

  // トレンド判定
  calculateTrend(
    currentMonthCount: number,
    previousMonthCount: number
  ): 'increasing' | 'stable' | 'decreasing';

  // 成功事例の自動抽出
  async identifySuccessCases(): Promise<CrossFacilitySuccessCase[]>;

  // 横展開可能性スコア算出
  calculateReplicability(
    post: Post,
    similarIssuesInOtherFacilities: number,
    implementationComplexity: 'low' | 'medium' | 'high'
  ): number;

  // 関心施設の判定
  async findInterestedFacilities(successCaseId: string): Promise<string[]>;

  // 戦略的機会の自動生成
  async generateStrategicOpportunities(): Promise<StrategicOpportunity[]>;

  // 全データ取得
  async getCrossFacilityAnalysisData(): Promise<{
    commonIssues: CrossFacilityCommonIssue[];
    successCases: CrossFacilitySuccessCase[];
    strategicOpportunities: StrategicOpportunity[];
  }>;

  // カテゴリ別フィルタリング
  async filterCommonIssuesByCategory(
    category: string
  ): Promise<CrossFacilityCommonIssue[]>;
}
```

### 3.3 API要件

#### 9つのAPIエンドポイント

| No | メソッド | エンドポイント | 説明 | 権限 |
|----|---------|---------------|------|------|
| 1 | GET | /api/cross-facility/common-issues | 共通課題取得 | Level 18+ |
| 2 | GET | /api/cross-facility/success-cases | 成功事例取得 | Level 18+ |
| 3 | GET | /api/cross-facility/strategic-opportunities | 戦略的機会取得 | Level 18+ |
| 4 | POST | /api/cross-facility/detect-common-issues | 共通課題自動検出実行 | Level 18+ |
| 5 | POST | /api/cross-facility/identify-success-cases | 成功事例自動抽出実行 | Level 18+ |
| 6 | POST | /api/cross-facility/generate-opportunities | 戦略的機会自動生成実行 | Level 18+ |
| 7 | POST | /api/cross-facility/success-cases/:id/approve | 成功事例承認 | Level 18+ |
| 8 | POST | /api/cross-facility/success-cases/:id/replicate | 成功事例横展開開始 | Level 18+ |
| 9 | POST | /api/cross-facility/strategic-opportunities/:id/approve | 戦略的機会承認 | Level 18+ |

### 3.4 フロントエンド要件

#### コンポーネント（4つ）

1. **CommonIssueCard** - 共通課題表示カード
2. **SuccessCaseCard** - 成功事例表示カード
3. **StrategicOpportunityCard** - 戦略的機会表示カード
4. **CategoryFilter** - カテゴリフィルター

#### カスタムフック（1つ）

- **useCrossFacilityAnalysis** - データフェッチング、状態管理

### 3.5 バッチ処理要件

#### 3つの定期バッチジョブ

| No | ジョブ名 | 頻度 | 実行時刻 | 説明 |
|----|---------|------|---------|------|
| 1 | detectCommonIssuesJob | 日次 | 午前3時 | 共通課題の自動検出 |
| 2 | identifySuccessCasesJob | 週次 | 月曜午前4時 | 成功事例の自動抽出 |
| 3 | generateOpportunitiesJob | 月次 | 1日午前5時 | 戦略的機会の自動生成 |

---

## 4. 初期データ例

### 4.1 CrossFacilityCommonIssue（5件）

#### 課題1: 夜勤時の人手不足
```json
{
  "id": "CFCI001",
  "title": "夜勤時の人手不足",
  "category": "人材配置",
  "description": "夜勤帯の人員不足により、職員の負担増加と患者対応の質低下が懸念される。6施設で同様の声が多数上がっている。",
  "affectedFacilities": ["FAC001", "FAC002", "FAC003", "FAC004", "FAC005", "FAC006"],
  "affectedFacilityCount": 6,
  "totalVoices": 347,
  "severity": "high",
  "trend": "increasing",
  "suggestedAction": "法人全体での夜勤シフト最適化、施設間ローテーション制度の導入検討",
  "sourcePostIds": ["POST001", "POST002", "POST003", "..."],
  "detectedAt": "2025-09-15T10:00:00Z",
  "status": "active"
}
```

#### 課題2: 電子カルテシステムの操作性
```json
{
  "id": "CFCI002",
  "title": "電子カルテシステムの操作性",
  "category": "IT・システム",
  "description": "電子カルテシステムの操作が複雑で業務効率が低下。特に新人職員からの声が多い。",
  "affectedFacilities": ["FAC001", "FAC002", "FAC003", "FAC004"],
  "affectedFacilityCount": 4,
  "totalVoices": 234,
  "severity": "medium",
  "trend": "stable",
  "suggestedAction": "法人統一の操作研修プログラム開発、UIの改善提案をベンダーに提出",
  "sourcePostIds": ["POST101", "POST102", "POST103", "..."],
  "detectedAt": "2025-09-10T10:00:00Z",
  "status": "active"
}
```

#### 課題3: 若手職員のキャリアパス不透明
```json
{
  "id": "CFCI003",
  "title": "若手職員のキャリアパス不透明",
  "category": "人材育成",
  "description": "キャリアパスが不明確で、若手職員のモチベーション低下と離職リスクが高まっている。",
  "affectedFacilities": ["FAC001", "FAC002", "FAC003", "FAC007", "FAC008", "FAC005"],
  "affectedFacilityCount": 6,
  "totalVoices": 198,
  "severity": "high",
  "trend": "increasing",
  "suggestedAction": "法人全体でのキャリアラダー制度設計、施設間異動によるキャリア開発支援",
  "sourcePostIds": ["POST201", "POST202", "POST203", "..."],
  "detectedAt": "2025-09-20T10:00:00Z",
  "status": "active"
}
```

#### 課題4: 施設間情報共有の不足
```json
{
  "id": "CFCI004",
  "title": "施設間情報共有の不足",
  "category": "コミュニケーション",
  "description": "施設間での情報共有が不足し、ベストプラクティスの横展開ができていない。",
  "affectedFacilities": ["FAC001", "FAC002", "FAC003", "FAC004", "FAC005", "FAC006", "FAC007", "FAC008", "FAC009", "FAC010"],
  "affectedFacilityCount": 10,
  "totalVoices": 156,
  "severity": "medium",
  "trend": "stable",
  "suggestedAction": "法人全体での定期的な事例共有会の開催、ナレッジ共有プラットフォームの構築",
  "sourcePostIds": ["POST301", "POST302", "POST303", "..."],
  "detectedAt": "2025-09-05T10:00:00Z",
  "status": "active"
}
```

#### 課題5: 医療材料の調達コスト
```json
{
  "id": "CFCI005",
  "title": "医療材料の調達コスト",
  "category": "コスト管理",
  "description": "施設ごとに異なる調達先で材料費にばらつき。コスト最適化の余地あり。",
  "affectedFacilities": ["FAC001", "FAC002", "FAC003", "FAC004", "FAC005"],
  "affectedFacilityCount": 5,
  "totalVoices": 134,
  "severity": "medium",
  "trend": "increasing",
  "suggestedAction": "法人全体での共同購買システム導入、スケールメリットの活用",
  "sourcePostIds": ["POST401", "POST402", "POST403", "..."],
  "detectedAt": "2025-09-25T10:00:00Z",
  "status": "active"
}
```

### 4.2 CrossFacilitySuccessCase（3件）

#### 成功事例1: メンター制度による新人定着率向上
```json
{
  "id": "CFSC001",
  "facilityId": "FAC001",
  "title": "メンター制度による新人定着率向上",
  "category": "人材育成",
  "description": "1年目看護師に対する専任メンター制度を導入。定期的な1on1面談と目標設定により、新人の離職率が35%から8%に大幅改善。",
  "impact": "新人離職率 35% → 8%（-27pt）、新人満足度 82%",
  "impactMetrics": {
    "turnoverRate": { "before": 35, "after": 8, "unit": "%" },
    "satisfaction": { "after": 82, "unit": "%" }
  },
  "replicability": 85,
  "implementationCost": "約50万円（メンター研修費用）",
  "implementationPeriod": "3ヶ月（制度設計1ヶ月、研修1ヶ月、運用開始1ヶ月）",
  "interestedFacilities": ["FAC002", "FAC003", "FAC005"],
  "sourcePostId": "POST12345",
  "identifiedAt": "2025-09-20T00:00:00Z",
  "status": "approved",
  "approvedBy": "USR_LEVEL18_001",
  "approvedAt": "2025-09-25T00:00:00Z"
}
```

#### 成功事例2: チーム制勤務による負担平準化
```json
{
  "id": "CFSC002",
  "facilityId": "FAC003",
  "title": "チーム制勤務による負担平準化",
  "category": "働き方改革",
  "description": "固定シフトからチーム制勤務に変更。チーム内で柔軟にシフト調整することで、個人の負担を軽減。",
  "impact": "残業時間 月平均18時間 → 12時間（-33%）、職員満足度 +12pt",
  "impactMetrics": {
    "overtimeHours": { "before": 18, "after": 12, "unit": "hours/month" },
    "satisfaction": { "change": 12, "unit": "pt" }
  },
  "replicability": 78,
  "implementationCost": "約30万円（シフト管理システム改修）",
  "implementationPeriod": "2ヶ月（制度設計1ヶ月、運用開始1ヶ月）",
  "interestedFacilities": ["FAC001", "FAC004"],
  "sourcePostId": "POST23456",
  "identifiedAt": "2025-09-22T00:00:00Z",
  "status": "approved",
  "approvedBy": "USR_LEVEL18_001",
  "approvedAt": "2025-09-27T00:00:00Z"
}
```

#### 成功事例3: 患者対応マニュアルの体系化
```json
{
  "id": "CFSC003",
  "facilityId": "FAC002",
  "title": "患者対応マニュアルの体系化",
  "category": "業務改善",
  "description": "頻出する患者対応をマニュアル化し、QRコードでアクセス可能に。対応時間の短縮と品質向上を実現。",
  "impact": "問い合わせ対応時間 -40%、患者満足度 +8pt",
  "impactMetrics": {
    "responseTime": { "reduction": 40, "unit": "%" },
    "patientSatisfaction": { "change": 8, "unit": "pt" }
  },
  "replicability": 92,
  "implementationCost": "約20万円（マニュアル作成費用）",
  "implementationPeriod": "1ヶ月（マニュアル作成2週間、展開2週間）",
  "interestedFacilities": ["FAC001", "FAC003", "FAC004", "FAC007"],
  "sourcePostId": "POST34567",
  "identifiedAt": "2025-09-18T00:00:00Z",
  "status": "approved",
  "approvedBy": "USR_LEVEL18_001",
  "approvedAt": "2025-09-23T00:00:00Z"
}
```

### 4.3 SuccessCaseReplication（2件）

#### 横展開1: FAC002でメンター制度を実施中
```json
{
  "id": "SCR001",
  "successCaseId": "CFSC001",
  "targetFacilityId": "FAC002",
  "status": "implementing",
  "startedAt": "2025-10-01T00:00:00Z",
  "progress": 60,
  "results": null,
  "resultMetrics": null,
  "responsiblePerson": "USR_FAC002_LEADER",
  "notes": "メンター候補者10名の研修を完了。11月から本格運用予定。"
}
```

#### 横展開2: FAC003でメンター制度を計画中
```json
{
  "id": "SCR002",
  "successCaseId": "CFSC001",
  "targetFacilityId": "FAC003",
  "status": "planning",
  "startedAt": null,
  "progress": 20,
  "results": null,
  "resultMetrics": null,
  "responsiblePerson": "USR_FAC003_LEADER",
  "notes": "2025年12月開始予定。メンター候補者選定中。"
}
```

### 4.4 StrategicOpportunity（3件）

#### 戦略施策1: 施設間人材ローテーション制度
```json
{
  "id": "SO001",
  "title": "施設間人材ローテーション制度",
  "opportunity": "夜勤人手不足など6施設共通の課題に対し、施設間で人材を融通し合う仕組みを構築。職員のスキル向上とキャリア開発にも寄与。",
  "expectedImpact": "夜勤負担の平準化、職員スキルの多様化、法人全体での人材最適配置",
  "requiredInvestment": "約500万円（システム開発、移動支援費）",
  "investmentAmount": 5000000,
  "timeline": "2026年1月制度設計開始、4月試験運用、7月本格運用",
  "priority": "high",
  "status": "proposed",
  "proposedAt": "2025-10-01T00:00:00Z",
  "approvedAt": null,
  "approvedBy": null,
  "relatedIssueIds": ["CFCI001"],
  "targetFacilities": ["FAC001", "FAC002", "FAC003", "FAC004", "FAC005", "FAC006"],
  "kpiTargets": {
    "nightShiftBurdenReduction": { "target": 30, "unit": "%" },
    "staffSatisfaction": { "target": 20, "unit": "pt increase" }
  },
  "actualResults": null,
  "documentUrl": null
}
```

#### 戦略施策2: 法人統一キャリアラダー制度
```json
{
  "id": "SO002",
  "title": "法人統一キャリアラダー制度",
  "opportunity": "若手職員のキャリアパス不透明という6施設共通課題に対応。法人全体で統一されたキャリアラダーを設計し、施設間異動も評価に反映。",
  "expectedImpact": "若手職員の定着率向上、計画的な人材育成、組織の活性化",
  "requiredInvestment": "約300万円（制度設計、研修プログラム開発）",
  "investmentAmount": 3000000,
  "timeline": "2026年2月設計開始、6月制度発表、10月運用開始",
  "priority": "high",
  "status": "proposed",
  "proposedAt": "2025-10-05T00:00:00Z",
  "approvedAt": null,
  "approvedBy": null,
  "relatedIssueIds": ["CFCI003"],
  "targetFacilities": ["FAC001", "FAC002", "FAC003", "FAC007", "FAC008", "FAC005"],
  "kpiTargets": {
    "youngStaffRetention": { "target": 15, "unit": "pt increase" },
    "careerDevelopmentSatisfaction": { "target": 80, "unit": "%" }
  },
  "actualResults": null,
  "documentUrl": null
}
```

#### 戦略施策3: 法人共同購買システム
```json
{
  "id": "SO003",
  "title": "法人共同購買システム",
  "opportunity": "5施設で医療材料調達コストが課題。法人全体での共同購買により、スケールメリットを活用してコスト削減。",
  "expectedImpact": "材料費 年間約8,000万円削減見込み、調達業務の効率化",
  "requiredInvestment": "約1,200万円（システム導入、初期調整費）",
  "investmentAmount": 12000000,
  "timeline": "2026年3月ベンダー選定、6月システム構築、10月運用開始",
  "priority": "medium",
  "status": "proposed",
  "proposedAt": "2025-10-08T00:00:00Z",
  "approvedAt": null,
  "approvedBy": null,
  "relatedIssueIds": ["CFCI005"],
  "targetFacilities": ["FAC001", "FAC002", "FAC003", "FAC004", "FAC005"],
  "kpiTargets": {
    "materialCostReduction": { "target": 80000000, "unit": "yen/year" },
    "procurementEfficiency": { "target": 30, "unit": "% improvement" }
  },
  "actualResults": null,
  "documentUrl": null
}
```

---

## 5. Prisma マイグレーションスクリプト

### 5.1 マイグレーションファイル

```prisma
// prisma/migrations/YYYYMMDDHHMMSS_add_cross_facility_analysis/migration.sql

-- CrossFacilityCommonIssue テーブル作成
CREATE TABLE `cross_facility_common_issue` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `affected_facilities` JSON NOT NULL,
  `affected_facility_count` INTEGER NOT NULL,
  `total_voices` INTEGER NOT NULL,
  `severity` VARCHAR(191) NOT NULL DEFAULT 'medium',
  `trend` VARCHAR(191) NOT NULL DEFAULT 'stable',
  `suggested_action` TEXT NOT NULL,
  `source_post_ids` JSON NOT NULL,
  `detected_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_updated_at` DATETIME(3) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'active',
  `assigned_to` VARCHAR(191) NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_cfci_category` (`category`),
  INDEX `idx_cfci_severity` (`severity`),
  INDEX `idx_cfci_detected_at` (`detected_at`),
  CONSTRAINT `fk_cfci_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CrossFacilitySuccessCase テーブル作成
CREATE TABLE `cross_facility_success_case` (
  `id` VARCHAR(191) NOT NULL,
  `facility_id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `impact` TEXT NOT NULL,
  `impact_metrics` JSON NULL,
  `replicability` INTEGER NOT NULL DEFAULT 50,
  `implementation_cost` VARCHAR(191) NULL,
  `implementation_period` VARCHAR(191) NULL,
  `interested_facilities` JSON NULL,
  `source_post_id` VARCHAR(191) NOT NULL,
  `identified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` VARCHAR(191) NOT NULL DEFAULT 'proposed',
  `approved_by` VARCHAR(191) NULL,
  `approved_at` DATETIME(3) NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_cfsc_facility_id` (`facility_id`),
  INDEX `idx_cfsc_category` (`category`),
  INDEX `idx_cfsc_replicability` (`replicability`),
  CONSTRAINT `fk_cfsc_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `users`(`facility_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cfsc_source_post_id` FOREIGN KEY (`source_post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cfsc_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- SuccessCaseReplication テーブル作成
CREATE TABLE `success_case_replication` (
  `id` VARCHAR(191) NOT NULL,
  `success_case_id` VARCHAR(191) NOT NULL,
  `target_facility_id` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'planning',
  `started_at` DATETIME(3) NULL,
  `completed_at` DATETIME(3) NULL,
  `progress` INTEGER NOT NULL DEFAULT 0,
  `results` TEXT NULL,
  `result_metrics` JSON NULL,
  `responsible_person` VARCHAR(191) NOT NULL,
  `notes` TEXT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_scr_unique` (`success_case_id`, `target_facility_id`),
  INDEX `idx_scr_target_facility_id` (`target_facility_id`),
  INDEX `idx_scr_status` (`status`),
  CONSTRAINT `fk_scr_success_case_id` FOREIGN KEY (`success_case_id`) REFERENCES `cross_facility_success_case`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_scr_target_facility_id` FOREIGN KEY (`target_facility_id`) REFERENCES `users`(`facility_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_scr_responsible_person` FOREIGN KEY (`responsible_person`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- StrategicOpportunity テーブル作成
CREATE TABLE `strategic_opportunity` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `opportunity` TEXT NOT NULL,
  `expected_impact` TEXT NOT NULL,
  `required_investment` VARCHAR(191) NOT NULL,
  `investment_amount` DECIMAL(15, 2) NULL,
  `timeline` TEXT NOT NULL,
  `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
  `status` VARCHAR(191) NOT NULL DEFAULT 'proposed',
  `proposed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `approved_at` DATETIME(3) NULL,
  `approved_by` VARCHAR(191) NULL,
  `related_issue_ids` JSON NULL,
  `target_facilities` JSON NULL,
  `kpi_targets` JSON NULL,
  `actual_results` JSON NULL,
  `document_url` VARCHAR(191) NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_so_priority` (`priority`),
  INDEX `idx_so_status` (`status`),
  INDEX `idx_so_proposed_at` (`proposed_at`),
  CONSTRAINT `fk_so_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5.2 Seed データスクリプト

```typescript
// prisma/seeds/crossFacilityAnalysisSeed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCrossFacilityAnalysis() {
  console.log('🌱 Seeding CrossFacilityAnalysis data...');

  // 共通課題の作成
  const commonIssues = [
    {
      id: 'CFCI001',
      title: '夜勤時の人手不足',
      category: '人材配置',
      description: '夜勤帯の人員不足により、職員の負担増加と患者対応の質低下が懸念される。',
      affectedFacilities: ['FAC001', 'FAC002', 'FAC003', 'FAC004', 'FAC005', 'FAC006'],
      affectedFacilityCount: 6,
      totalVoices: 347,
      severity: 'high',
      trend: 'increasing',
      suggestedAction: '法人全体での夜勤シフト最適化、施設間ローテーション制度の導入検討',
      sourcePostIds: ['POST001', 'POST002', 'POST003'],
      status: 'active'
    },
    // 他4件...
  ];

  for (const issue of commonIssues) {
    await prisma.crossFacilityCommonIssue.upsert({
      where: { id: issue.id },
      create: issue,
      update: issue
    });
  }

  console.log('✅ CommonIssues seeded');

  // 成功事例の作成
  const successCases = [
    {
      id: 'CFSC001',
      facilityId: 'FAC001',
      title: 'メンター制度による新人定着率向上',
      category: '人材育成',
      description: '1年目看護師に対する専任メンター制度を導入...',
      impact: '新人離職率 35% → 8%（-27pt）',
      impactMetrics: { turnoverRate: { before: 35, after: 8, unit: '%' } },
      replicability: 85,
      implementationCost: '約50万円',
      implementationPeriod: '3ヶ月',
      interestedFacilities: ['FAC002', 'FAC003', 'FAC005'],
      sourcePostId: 'POST12345',
      status: 'approved',
      approvedBy: 'USR_LEVEL18_001',
      approvedAt: new Date('2025-09-25')
    },
    // 他2件...
  ];

  for (const successCase of successCases) {
    await prisma.crossFacilitySuccessCase.upsert({
      where: { id: successCase.id },
      create: successCase,
      update: successCase
    });
  }

  console.log('✅ SuccessCases seeded');

  // 戦略的機会の作成
  const opportunities = [
    {
      id: 'SO001',
      title: '施設間人材ローテーション制度',
      opportunity: '夜勤人手不足など6施設共通の課題に対し...',
      expectedImpact: '夜勤負担の平準化、職員スキルの多様化...',
      requiredInvestment: '約500万円',
      investmentAmount: 5000000,
      timeline: '2026年1月制度設計開始、4月試験運用、7月本格運用',
      priority: 'high',
      status: 'proposed',
      relatedIssueIds: ['CFCI001'],
      targetFacilities: ['FAC001', 'FAC002', 'FAC003', 'FAC004', 'FAC005', 'FAC006'],
      kpiTargets: { nightShiftBurdenReduction: { target: 30, unit: '%' } }
    },
    // 他2件...
  ];

  for (const opportunity of opportunities) {
    await prisma.strategicOpportunity.upsert({
      where: { id: opportunity.id },
      create: opportunity,
      update: opportunity
    });
  }

  console.log('✅ StrategicOpportunities seeded');
  console.log('🎉 CrossFacilityAnalysis seed completed!');
}

seedCrossFacilityAnalysis()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 6. 実装スケジュール

### Phase 1: データベース・サービス層実装（5日）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 1-2 | テーブル設計・マイグレーション | 4テーブル作成、User/Post拡張 |
| 3-4 | サービス層実装 | CrossFacilityAnalysisService |
| 5 | ユニットテスト | 15ケース以上 |

### Phase 2: API実装（3日）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 6 | API実装（GET系） | 3エンドポイント |
| 7 | API実装（POST系） | 6エンドポイント |
| 8 | API統合テスト | 10ケース以上 |

### Phase 3: フロントエンド実装（4日）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 9 | コンポーネント実装 | 4コンポーネント |
| 10 | カスタムフック実装 | useCrossFacilityAnalysis |
| 11 | ページ統合 | API連携、状態管理 |
| 12 | UI調整・レスポンシブ | 完成形 |

### Phase 4: バッチ処理・統合テスト（3日）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 13 | バッチ処理実装 | 3バッチジョブ + cron設定 |
| 14 | 統合テスト | エンドツーエンドテスト |
| 15 | ドキュメント作成・リリース準備 | API仕様書、運用手順書 |

### 総工数
- **開発期間**: 15日（3週間）
- **バックエンド**: 8日
- **フロントエンド**: 4日
- **バッチ・テスト**: 3日

---

## 7. テスト要件

### 7.1 ユニットテスト

```typescript
describe('CrossFacilityAnalysisService', () => {
  describe('detectCommonIssues', () => {
    it('2施設以上で発生している課題を検出すること', async () => {
      const issues = await service.detectCommonIssues();
      expect(issues.every(i => i.affectedFacilityCount >= 2)).toBe(true);
    });

    it('閾値未満の課題は検出しないこと', async () => {
      // 1施設あたり20件未満の投稿は検出されないことを確認
    });
  });

  describe('calculateSeverity', () => {
    it('6施設以上200件以上でhighを返すこと', () => {
      expect(service.calculateSeverity(6, 200)).toBe('high');
    });

    it('4施設以上100件以上でmediumを返すこと', () => {
      expect(service.calculateSeverity(4, 100)).toBe('medium');
    });

    it('それ以外はlowを返すこと', () => {
      expect(service.calculateSeverity(2, 50)).toBe('low');
    });
  });

  describe('identifySuccessCases', () => {
    it('resolutionRating 4.0以上のPostのみ抽出すること', async () => {
      const cases = await service.identifySuccessCases();
      // 全てのsourcePo stがresolutionRating >= 4.0であることを確認
    });

    it('30人以上の賛同があるPostのみ抽出すること', async () => {
      // Vote数が30以上であることを確認
    });
  });

  describe('calculateReplicability', () => {
    it('類似課題が多いほど高スコアになること', () => {
      const score1 = service.calculateReplicability(post, 5, 'low');
      const score2 = service.calculateReplicability(post, 10, 'low');
      expect(score2).toBeGreaterThan(score1);
    });

    it('実装の複雑度が低いほど高スコアになること', () => {
      const scoreLow = service.calculateReplicability(post, 5, 'low');
      const scoreHigh = service.calculateReplicability(post, 5, 'high');
      expect(scoreLow).toBeGreaterThan(scoreHigh);
    });
  });
});
```

### 7.2 API統合テスト

```typescript
describe('CrossFacility API', () => {
  describe('GET /api/cross-facility/common-issues', () => {
    it('Level 18未満はアクセス拒否', async () => {
      const response = await request(app)
        .get('/api/cross-facility/common-issues')
        .set('Authorization', 'Bearer level17_token');
      expect(response.status).toBe(403);
    });

    it('Level 18以上は正常取得', async () => {
      const response = await request(app)
        .get('/api/cross-facility/common-issues')
        .set('Authorization', 'Bearer level18_token');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('categoryフィルタが動作すること', async () => {
      const response = await request(app)
        .get('/api/cross-facility/common-issues?category=人材配置')
        .set('Authorization', 'Bearer level18_token');
      expect(response.body.every(i => i.category === '人材配置')).toBe(true);
    });
  });

  describe('POST /api/cross-facility/detect-common-issues', () => {
    it('共通課題を検出して返すこと', async () => {
      const response = await request(app)
        .post('/api/cross-facility/detect-common-issues')
        .set('Authorization', 'Bearer level18_token');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('detected');
      expect(response.body).toHaveProperty('commonIssues');
    });
  });
});
```

### 7.3 バッチ処理テスト

```typescript
describe('CrossFacility Batch Jobs', () => {
  describe('detectCommonIssuesJob', () => {
    it('日次バッチが正常実行されること', async () => {
      await detectCommonIssuesJob();
      const issues = await prisma.crossFacilityCommonIssue.findMany();
      expect(issues.length).toBeGreaterThan(0);
    });

    it('高重要度課題検出時に通知が送信されること', async () => {
      // モックで通知サービスをスパイ
      const notificationSpy = jest.spyOn(notificationService, 'notifyLevel18Users');
      await detectCommonIssuesJob();
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});
```

---

## 8. セキュリティ要件

### 8.1 アクセス制御

```typescript
// Level 18（理事長・法人事務局長）のみアクセス可能
const checkCrossFacilityAccess = (user: User) => {
  if (user.permissionLevel < 18) {
    throw new ForbiddenError('施設横断分析へのアクセス権限がありません');
  }
};
```

### 8.2 データマスキング

```typescript
// sourcePostIdsは内部管理用のみ
const sanitizeCommonIssue = (issue: CrossFacilityCommonIssue) => {
  return {
    ...issue,
    sourcePostIds: undefined  // API経由では返さない
  };
};
```

### 8.3 監査ログ

```typescript
// 戦略的機会の承認をログ記録
await auditLog.create({
  userId: user.id,
  action: 'APPROVE_STRATEGIC_OPPORTUNITY',
  resource: opportunity.id,
  details: { title: opportunity.title },
  timestamp: new Date()
});
```

---

## 9. パフォーマンス要件

### 9.1 インデックス設計

```sql
-- 共通課題検出の高速化
CREATE INDEX idx_posts_category_facility_status
ON posts(category, facility_id, status);

CREATE INDEX idx_posts_created_at
ON posts(created_at);

-- 成功事例抽出の高速化
CREATE INDEX idx_posts_status_rating
ON posts(status, resolution_rating);
```

### 9.2 キャッシュ戦略

```typescript
// 共通課題: 1時間キャッシュ
await redis.setex(
  'cross-facility:common-issues',
  3600,
  JSON.stringify(commonIssues)
);

// 成功事例: 6時間キャッシュ
await redis.setex(
  'cross-facility:success-cases',
  21600,
  JSON.stringify(successCases)
);

// 戦略的機会: 12時間キャッシュ
await redis.setex(
  'cross-facility:strategic-opportunities',
  43200,
  JSON.stringify(opportunities)
);
```

---

## 10. 運用要件

### 10.1 モニタリング

```typescript
// 共通課題検出の成功率監視
const detectionSuccessRate = detectedIssues.length / totalCategories;
if (detectionSuccessRate < 0.5) {
  logger.warn('Common issue detection rate is low');
}
```

### 10.2 通知設定

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

## 11. 実装チェックリスト

### 11.1 バックエンド

#### データベース
- [ ] CrossFacilityCommonIssue テーブル作成
- [ ] CrossFacilitySuccessCase テーブル作成
- [ ] SuccessCaseReplication テーブル作成
- [ ] StrategicOpportunity テーブル作成
- [ ] User テーブル拡張（6リレーション追加）
- [ ] Post テーブル拡張（1リレーション追加）
- [ ] インデックス作成（9個）
- [ ] マイグレーション実行
- [ ] Seed データ投入

#### サービス層
- [ ] CrossFacilityAnalysisService クラス作成
- [ ] detectCommonIssues() 実装
- [ ] calculateSeverity() 実装
- [ ] calculateTrend() 実装
- [ ] identifySuccessCases() 実装
- [ ] calculateReplicability() 実装
- [ ] findInterestedFacilities() 実装
- [ ] generateStrategicOpportunities() 実装
- [ ] getCrossFacilityAnalysisData() 実装
- [ ] filterCommonIssuesByCategory() 実装

#### API層
- [ ] GET /api/cross-facility/common-issues
- [ ] GET /api/cross-facility/success-cases
- [ ] GET /api/cross-facility/strategic-opportunities
- [ ] POST /api/cross-facility/detect-common-issues
- [ ] POST /api/cross-facility/identify-success-cases
- [ ] POST /api/cross-facility/generate-opportunities
- [ ] POST /api/cross-facility/success-cases/:id/approve
- [ ] POST /api/cross-facility/success-cases/:id/replicate
- [ ] POST /api/cross-facility/strategic-opportunities/:id/approve
- [ ] Level 18権限チェック実装
- [ ] Redisキャッシュ層実装

#### バッチ処理
- [ ] detectCommonIssuesJob（日次）
- [ ] identifySuccessCasesJob（週次）
- [ ] generateOpportunitiesJob（月次）
- [ ] cron設定

#### テスト
- [ ] サービス層ユニットテスト（15ケース以上）
- [ ] API統合テスト（10ケース以上）
- [ ] バッチ処理テスト（3ケース以上）
- [ ] パフォーマンステスト（<2秒）

### 11.2 フロントエンド

#### コンポーネント
- [ ] CommonIssueCard コンポーネント実装
- [ ] SuccessCaseCard コンポーネント実装
- [ ] StrategicOpportunityCard コンポーネント実装
- [ ] CategoryFilter コンポーネント実装

#### フック
- [ ] useCrossFacilityAnalysis カスタムフック実装
- [ ] データフェッチング実装
- [ ] 状態管理実装
- [ ] エラーハンドリング実装

#### ページ統合
- [ ] CrossFacilityAnalysisPage API連携
- [ ] ローディング状態UI
- [ ] エラー状態UI
- [ ] レスポンシブデザイン
- [ ] アクセシビリティ対応

### 11.3 運用準備

#### ドキュメント
- [ ] API仕様書作成
- [ ] 運用手順書作成
- [ ] バッチジョブ管理手順作成
- [ ] トラブルシューティングガイド作成

#### モニタリング
- [ ] 共通課題検出成功率監視設定
- [ ] バッチジョブ実行状況監視設定
- [ ] エラーログ収集設定
- [ ] 通知設定（高重要度課題検出時）

---

## 12. 医療システムとの連携確認

### 12.1 施設マスタAPI確認

#### 確認事項
- [x] GET /api/v2/facilities が実装済みか → ✅ 実装済み（Phase 3）
- [x] レスポンス形式に必要なフィールドが含まれるか → ✅ 含まれる
- [x] API呼び出し頻度制限の有無 → 確認必要
- [x] キャッシュポリシー → 確認必要

### 12.2 連携テストシナリオ

```typescript
describe('Medical System Integration', () => {
  it('施設マスタAPIから10施設取得できること', async () => {
    const facilities = await medicalSystemClient.getFacilities();
    expect(facilities).toHaveLength(10);
  });

  it('API障害時はキャッシュされた施設情報を使用すること', async () => {
    medicalSystemClient.mockFailure();
    const facilities = await service.getAllFacilities();
    expect(facilities).toBeDefined(); // キャッシュから取得
  });
});
```

---

## 13. リスク管理

### 13.1 技術的リスク

#### リスク1: 共通課題の検出精度
**内容**: テキスト類似度判定の精度が低く、誤検出が多発
**対策**:
- カテゴリベースの集計を優先
- キーワードマッチングの閾値調整
- 定期的な検出結果のレビュー

#### リスク2: バッチ処理のパフォーマンス劣化
**内容**: 投稿数増加により日次バッチが長時間化
**対策**:
- インデックス最適化
- 並列処理の導入
- 段階的な処理（増分更新）

### 13.2 運用リスク

#### リスク3: 成功事例の選定基準
**内容**: 自動抽出された成功事例が実際には横展開困難
**対策**:
- Level 18ユーザーによる承認フロー
- replicabilityスコアの継続的な調整
- 横展開実施後のフィードバック反映

---

## 14. 今後の拡張予定

### Phase 2 機能（3ヶ月後）
- AI による共通課題の自動分類
- 成功事例のテキスト要約機能
- 戦略的機会のROI自動計算
- 横展開の進捗ダッシュボード

### Phase 3 機能（6ヶ月後）
- 施設間ベンチマーク機能
- 予測アラート（課題の早期検出）
- Excel/PDFレポート自動生成
- 外部システム連携（ERP等）

---

## 15. 承認

### 15.1 VoiceDrive側承認
- [ ] バックエンドリード承認
- [ ] フロントエンドリード承認
- [ ] プロダクトマネージャー承認

### 15.2 医療システム側確認事項
- [x] 施設マスタAPI仕様確認 → ✅ 確認済み
- [ ] API呼び出し頻度上限確認
- [ ] キャッシュポリシー確認

### 15.3 統合テスト日程
- **予定日**: 2025年10月25日（金）
- **参加者**: VoiceDrive開発チーム、医療システムチーム
- **確認項目**:
  - 施設マスタAPI連携
  - 共通課題自動検出ロジック
  - 成功事例抽出ロジック
  - パフォーマンス（<2秒）

---

## 16. 関連ドキュメント

- [Cross Facility Analysis DB要件分析](./cross-facility-analysis_DB要件分析_20251011.md)
- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)
- [CorporateAgendaDashboard 暫定マスターリスト](./corporate-agenda-dashboard暫定マスターリスト_20251011.md)
- [BoardPreparation 暫定マスターリスト](./board-preparation暫定マスターリスト_20251010.md)

---

**ドキュメント作成者**: Claude (VoiceDrive AI Assistant)
**最終更新日**: 2025年10月11日
**バージョン**: 1.0.0
**ステータス**: ✅ 完成 - 医療システム確認待ち
