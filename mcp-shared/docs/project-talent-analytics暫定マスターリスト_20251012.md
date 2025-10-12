# プロジェクト人材分析 暫定マスターリスト

**作成日**: 2025年10月12日
**対象ページ**: ProjectTalentAnalyticsPage (`src/pages/ProjectTalentAnalyticsPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- プロジェクト人材分析ページはプロジェクト参加者の分布・参加率・育成効果を可視化
- 現在はダミーデータで動作（総参加者数、多様性スコア、世代別統計等）
- 医療システムからの職員マスタデータ（年齢・職種・部門別人数）受信が必要
- VoiceDrive側で複雑な集計ロジック（多様性スコア計算等）の実装が必要

### 必要な対応
1. **医療システムからのAPI提供**: 3件
2. **VoiceDrive DB追加**: テーブル2件、フィールド3件
3. **VoiceDrive集計サービス実装**: 4件
4. **確認事項**: 3件（緊急）

### 優先度
**Priority: HIGH（グループ1: コアページ、人事部門Level 14+向け）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（3件）

#### API-1: 職種マスタ取得API（🔴 緊急）

**エンドポイント**:
```
GET /api/v2/professions
```

**必要な理由**:
- プロジェクト人材分析の職種別参加状況表示（ProjectTalentAnalyticsPage.tsx 117-139行目）
- 職種名の表示ラベル取得
- 職種グループ分類（医療職・看護職・コメディカル・事務）

**レスポンス例**:
```json
[
  {
    "professionCode": "nurse",
    "professionName": "看護師",
    "professionGroup": "nursing",
    "requiresLicense": true,
    "sortOrder": 1,
    "isActive": true
  },
  {
    "professionCode": "doctor",
    "professionName": "医師",
    "professionGroup": "medical",
    "requiresLicense": true,
    "sortOrder": 2,
    "isActive": true
  },
  {
    "professionCode": "pharmacist",
    "professionName": "薬剤師",
    "professionGroup": "medical",
    "requiresLicense": true,
    "sortOrder": 3,
    "isActive": true
  },
  {
    "professionCode": "pt",
    "professionName": "理学療法士",
    "professionGroup": "allied",
    "requiresLicense": true,
    "sortOrder": 4,
    "isActive": true
  },
  {
    "professionCode": "ot",
    "professionName": "作業療法士",
    "professionGroup": "allied",
    "requiresLicense": true,
    "sortOrder": 5,
    "isActive": true
  }
]
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- キャッシュTTL: 24時間（職種マスタは頻繁に変更されない）

**実装スケジュール**: Phase 1（2025年10月末まで）

---

#### API-2: 部門別人数取得API（🔴 緊急）

**エンドポイント**:
```
GET /api/v2/departments/headcount
```

**必要な理由**:
- ProjectTalentAnalyticsPage.tsx 161-193行目で部門別プロジェクト参加率を表示
- 参加率計算には「部門総人数」が必須
- 現在VoiceDriveでは部門総人数データを保持していない

**レスポンス例**:
```json
[
  {
    "departmentId": "DEPT-NS",
    "departmentName": "看護部",
    "facilityId": "FAC001",
    "facilityName": "小原記念病院",
    "totalMembers": 320,          // 部門総人数
    "activeMembers": 298,         // 休職・休暇除く
    "retiredMembers": 22,
    "onLeaveMembers": 0,
    "calculatedAt": "2025-10-12T00:00:00Z"
  },
  {
    "departmentId": "DEPT-MED",
    "departmentName": "医療技術部",
    "facilityId": "FAC001",
    "facilityName": "小原記念病院",
    "totalMembers": 180,
    "activeMembers": 172,
    "retiredMembers": 8,
    "onLeaveMembers": 0,
    "calculatedAt": "2025-10-12T00:00:00Z"
  },
  {
    "departmentId": "DEPT-ADM",
    "departmentName": "事務部",
    "facilityId": "FAC001",
    "facilityName": "小原記念病院",
    "totalMembers": 95,
    "activeMembers": 92,
    "retiredMembers": 3,
    "onLeaveMembers": 0,
    "calculatedAt": "2025-10-12T00:00:00Z"
  },
  {
    "departmentId": "DEPT-RHB",
    "departmentName": "リハビリ部",
    "facilityId": "FAC001",
    "facilityName": "小原記念病院",
    "totalMembers": 75,
    "activeMembers": 71,
    "retiredMembers": 4,
    "onLeaveMembers": 0,
    "calculatedAt": "2025-10-12T00:00:00Z"
  }
]
```

**更新頻度**:
- 日次更新（深夜1:00）
- 職員入社・退職時にリアルタイム更新

**キャッシュ戦略**:
- VoiceDrive側で24時間キャッシュ
- 日次バッチで更新

**実装スケジュール**: Phase 1（2025年10月末まで）

---

#### API-3: 年齢・世代取得API（🔴 緊急）+ データ同意システム連携

**エンドポイント**:
```
GET /api/v2/employees/{employeeId}/age
```

**🔐 重要**: **データ同意システムと連携必須**
- VoiceDriveには**データ同意システム**が既に実装済み
- 初回投稿時（議題モード・プロジェクトモード共通）に同意取得
- `DataConsent.analyticsConsent = true`の職員のみ、年齢データを提供

**必要な理由**:
- ProjectTalentAnalyticsPage.tsx 141-158行目で世代別プロジェクト参加状況を表示
- 世代別分析には年齢または生年月日が必須
- **個人情報保護のため、生年月日ではなく年齢と世代区分のみを提供**（選択肢A採用）
- **同意済み職員のみを分析対象とし、未同意職員のプライバシーを完全保護**

**レスポンス例**:
```json
{
  "employeeId": "EMP2024001",
  "age": 34,                    // 現在の年齢
  "generation": "30代",         // 世代区分（医療システム側で計算）
  "generationCode": "30s",      // 世代コード（集計用）
  "calculatedAt": "2025-10-12"
}
```

**世代区分ルール**:
- `20代`: 20-29歳
- `30代`: 30-39歳
- `40代`: 40-49歳
- `50代以上`: 50歳以上

**バッチ取得エンドポイント（推奨）**:
```
POST /api/v2/employees/age-batch
Request Body: {
  "employeeIds": ["EMP001", "EMP002", "EMP003"]
}
```

**レスポンス例**:
```json
[
  { "employeeId": "EMP001", "age": 28, "generation": "20代", "generationCode": "20s" },
  { "employeeId": "EMP002", "age": 35, "generation": "30代", "generationCode": "30s" },
  { "employeeId": "EMP003", "age": 42, "generation": "40代", "generationCode": "40s" }
]
```

**⚠️ 重要な前提条件**:
- VoiceDrive側は、**`analyticsConsent = true`の職員IDのみ**をリクエストボディに含める
- 医療システム側は、リクエストされた職員IDの年齢データのみを返却
- 未同意職員のIDは絶対にリクエストに含めない（VoiceDrive側で事前フィルタリング）

**更新頻度**:
- 週次更新（日曜深夜2:00）
- VoiceDrive側で年齢データをキャッシュ
- 同意状況の変更（新規同意・同意取り消し）を反映

**実装スケジュール**: Phase 1（2025年10月末まで）

---

### B. 確認事項（3件）

#### 確認-1: 生年月日データの提供方法（🔴 緊急） + データ同意システム連携

**3つの選択肢**:

| 選択肢 | 内容 | メリット | デメリット | 推奨度 |
|-------|------|---------|-----------|--------|
| **選択肢A** | 年齢・世代区分のみ提供<br>**+ データ同意連携** | ✅ 個人情報保護<br>✅ シンプル実装<br>✅ **同意済み職員のみ対象** | ⚠️ 週次更新必要<br>⚠️ 未同意職員は除外 | 🟢 **強く推奨** |
| 選択肢B | 生年月日をハッシュ化 | ✅ 個人情報保護 | ⚠️ セキュリティ複雑化<br>⚠️ 年単位の精度<br>⚠️ 同意管理が複雑 | 🟡 |
| 選択肢C | 医療システム側で世代別分析 | ✅ 個人情報完全保護 | ⚠️ API呼び出しオーバーヘッド<br>⚠️ 医療側工数増 | 🔴 |

**VoiceDrive推奨**: **選択肢A（年齢・世代区分のみ提供 + データ同意システム連携）**

**理由**:
- 個人情報保護と分析機能のバランスが最適
- VoiceDrive側の実装がシンプル
- 医療システム側の負荷も低い
- 週次更新で十分な精度
- **既存のデータ同意システムと完全連携**
- 同意済み職員のみ分析対象とし、未同意職員のプライバシーを完全保護

**確認期限**: 2025年10月15日

---

#### 確認-2: 部門別人数APIの実装スケジュール（🔴 緊急）

**質問**:
- `GET /api/v2/departments/headcount`の実装は2025年10月末までに可能か？
- Phase 1（2025年10月末）での提供が必須

**代替案**:
- Phase 1で提供不可の場合、VoiceDrive側で`User`テーブルから部門別カウントを実施
- ただし、退職者・休職者の扱いが不正確になる可能性あり

**確認期限**: 2025年10月15日

---

#### 確認-3: 多様性スコア計算ロジックの承認（🟡 中期）

**提案ロジック**: Simpson's Diversity Index（シンプソンの多様性指数）

**計算式**:
```
多様性スコア = (職種多様性 × 40%) + (世代多様性 × 35%) + (階層多様性 × 25%)
```

**質問**:
1. Simpson's Diversity Indexの使用に問題ないか？
2. 重み付け（40%・35%・25%）は適切か？
3. 医療業界特有の多様性指標を追加すべきか？

**確認期限**: 2025年10月末

---

## 🗄️ VoiceDrive DB追加要件

### A. 新規テーブル（2件）

#### テーブル-1: `ProjectParticipationStats`（🔴 必須）

**目的**: プロジェクト参加統計の集計結果を保存

**スキーマ**:
```prisma
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

**データ例**:
```typescript
{
  periodType: "quarter",
  periodStart: "2025-10-01T00:00:00Z",
  periodEnd: "2025-12-31T23:59:59Z",
  totalParticipants: 487,
  totalProjects: 127,
  averageProjectsPerPerson: 2.3,
  diversityScore: 78.0,
  professionDiversityScore: 82.0,
  generationDiversityScore: 76.0,
  hierarchyDiversityScore: 72.0,
  growthRate: 12.5
}
```

**更新頻度**: 日次バッチ（深夜2:00）

---

#### テーブル-2: `ProjectParticipationByProfession`（🟡 推奨）

**目的**: 職種別プロジェクト参加統計を保存

**スキーマ**:
```prisma
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

**データ例**:
```typescript
{
  periodType: "quarter",
  periodStart: "2025-10-01T00:00:00Z",
  periodEnd: "2025-12-31T23:59:59Z",
  professionCode: "nurse",
  professionName: "看護師",
  professionGroup: "nursing",
  participantCount: 245,
  projectCount: 87,
  averageProjects: 2.5,
  percentage: 50.3
}
```

**更新頻度**: 日次バッチ（深夜2:00）

---

### B. 既存テーブルへのフィールド追加（1件）

#### テーブル: `User`

**追加フィールド**:
```prisma
model User {
  // ... 既存フィールド

  // 🆕 世代別分析用フィールド（2025-10-12追加）
  age            Int?      @map("age")                // キャッシュ（医療システムから週次更新）
  generation     String?   @map("generation")         // キャッシュ（"20代", "30代", "40代", "50代以上"）
  ageUpdatedAt   DateTime? @map("age_updated_at")     // 年齢更新日時
}
```

**更新方法**:
- 医療システムAPI `GET /api/v2/employees/{id}/age`から取得
- 週次バッチ（日曜深夜2:00）で全職員の年齢データを更新
- 新入社員は入社時にリアルタイム更新（Webhook経由）

---

## 🔧 VoiceDrive実装要件

### A. 集計サービス実装（4件）

#### サービス-1: `ProjectAnalyticsService.calculateParticipationStats()`（🔴 必須）

**目的**: 全体統計（総参加者数、平均参加数、多様性スコア、成長率）を計算

**実装ファイル**: `src/services/ProjectAnalyticsService.ts`

**関数シグネチャ**:
```typescript
export async function calculateParticipationStats(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<ProjectParticipationStatsData>
```

**処理フロー**:
1. `ProjectTeamMember`から期間内のメンバーデータを取得
2. ユニーク参加者数・プロジェクト数を集計
3. 平均参加プロジェクト数を計算
4. 多様性スコアを計算（DiversityCalculator呼び出し）
5. 前期比成長率を計算
6. `ProjectParticipationStats`テーブルに保存

**実装スケジュール**: Phase 2（2025年11月中旬まで）

---

#### サービス-2: `ProjectAnalyticsService.calculateProfessionParticipation()`（🔴 必須）

**目的**: 職種別プロジェクト参加統計を計算

**実装ファイル**: `src/services/ProjectAnalyticsService.ts`

**関数シグネチャ**:
```typescript
export async function calculateProfessionParticipation(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<ProjectParticipationByProfessionData[]>
```

**処理フロー**:
1. `ProjectTeamMember` + `User`から期間内のメンバーを職種ごとに集計
2. 医療システムAPI `GET /api/v2/professions`から職種名を取得
3. 職種別参加者数・プロジェクト数・割合を計算
4. `ProjectParticipationByProfession`テーブルに保存

**実装スケジュール**: Phase 2（2025年11月中旬まで）

---

#### サービス-3: `ProjectAnalyticsService.calculateDepartmentParticipation()`（🔴 必須）

**目的**: 部門別プロジェクト参加率を計算

**実装ファイル**: `src/services/ProjectAnalyticsService.ts`

**関数シグネチャ**:
```typescript
export async function calculateDepartmentParticipation(
  periodType: 'month' | 'quarter' | 'year',
  periodStart: Date,
  periodEnd: Date
): Promise<DepartmentParticipationData[]>
```

**処理フロー**:
1. 医療システムAPI `GET /api/v2/departments/headcount`から部門別総人数を取得
2. `ProjectTeamMember` + `User`から部門別参加者数を集計
3. 参加率（参加者数 / 総人数 × 100）を計算
4. 部門別平均参加プロジェクト数を計算
5. 結果を返却（オプション: テーブル保存）

**実装スケジュール**: Phase 2（2025年11月中旬まで）

---

#### サービス-4: `DiversityCalculator.calculateDiversityScore()`（🟡 推奨）

**目的**: プロジェクトチームの多様性スコアを計算

**実装ファイル**: `src/services/DiversityCalculator.ts`

**関数シグネチャ**:
```typescript
export function calculateDiversityScore(
  members: ProjectTeamMemberWithUser[]
): DiversityScoreResult
```

**計算アルゴリズム**: Simpson's Diversity Index（シンプソンの多様性指数）

**処理フロー**:
1. 職種別にメンバーをグループ化し、Simpson's Indexを計算
2. 世代別にメンバーをグループ化し、Simpson's Indexを計算
3. 階層別にメンバーをグループ化し、Simpson's Indexを計算
4. 重み付け平均で総合多様性スコアを計算（職種40% + 世代35% + 階層25%）

**結果例**:
```typescript
{
  overall: 78,           // 総合多様性スコア（0-100）
  profession: 82,        // 職種多様性
  generation: 76,        // 世代多様性
  hierarchy: 72          // 階層多様性
}
```

**実装スケジュール**: Phase 3（2025年11月末まで）

---

### B. バッチ処理実装（2件）

#### バッチ-1: 日次集計バッチ（🔴 必須）

**実行タイミング**: 毎日深夜2:00

**処理内容**:
1. 前日の統計データを集計
2. `ProjectParticipationStats`テーブルに保存
3. `ProjectParticipationByProfession`テーブルに保存
4. エラー時はSlack通知

**実装ファイル**: `src/jobs/daily-project-stats.ts`

**実装スケジュール**: Phase 2（2025年11月中旬まで）

---

#### バッチ-2: 年齢データ同期バッチ（🔴 必須）

**実行タイミング**: 毎週日曜深夜2:00

**処理内容**:
1. 医療システムAPI `GET /api/v2/employees/age-batch`から全職員の年齢データを取得
2. `User`テーブルの`age`, `generation`, `ageUpdatedAt`を更新
3. エラー時はSlack通知

**実装ファイル**: `src/jobs/sync-employee-age.ts`

**実装スケジュール**: Phase 1（2025年10月末まで）

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
│  │  - GET /api/v2/employees/age-batch                 │   │
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
│  │              年齢データ同期バッチ（週次）              │   │
│  │  - 医療システムから年齢データ取得                     │   │
│  │  - Userテーブルの age, generation 更新               │   │
│  └───────────────┬───────────────────────────────────────┘   │
│                  │                                           │
│                  ▼                                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                  User テーブル                        │   │
│  │  - age (キャッシュ)                                  │   │
│  │  - generation (キャッシュ)                           │   │
│  │  - department (キャッシュ)                           │   │
│  │  - professionCategory (キャッシュ)                   │   │
│  │  - hierarchyLevel                                    │   │
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
│  │            日次集計バッチ（深夜2:00）                 │   │
│  │  - ProjectAnalyticsService.calculateParticipationStats()│
│  │  - ProjectAnalyticsService.calculateProfessionParticipation()│
│  │  - DiversityCalculator.calculateDiversityScore()     │   │
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
│  │   ProjectParticipationByProfession テーブル          │   │
│  │  - professionCode, professionName                    │   │
│  │  - participantCount, percentage                      │   │
│  └───────────────┬───────────────────────────────────────┘   │
│                  │                                           │
│                  ▼                                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │       ProjectTalentAnalyticsPage (UI)                │   │
│  │  - 概要タブ（メトリクスカード、職種別、世代別）       │   │
│  │  - 部門別分布タブ                                    │   │
│  │  - 参加トレンドタブ（Phase 4実装予定）               │   │
│  │  - 育成効果タブ（Phase 4実装予定）                   │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 実装スケジュール

### Phase 1: 基本データ取得（優先度: 🔴 HIGH）
**期間**: 2025年10月13日～10月31日
**担当**: 医療システムチーム + VoiceDriveチーム

#### 医療システム側タスク（3件）
- [ ] `GET /api/v2/professions` - 職種マスタ取得API実装
- [ ] `GET /api/v2/departments/headcount` - 部門別人数取得API実装
- [ ] `GET /api/v2/employees/{id}/age` - 年齢・世代取得API実装
- [ ] `GET /api/v2/employees/age-batch` - 年齢バッチ取得API実装

#### VoiceDrive側タスク（2件）
- [ ] `User`テーブルに`age`, `generation`, `ageUpdatedAt`フィールド追加
- [ ] 年齢データ同期バッチ実装（`src/jobs/sync-employee-age.ts`）

**完了条件**:
- 医療システムAPI 4本が稼働
- VoiceDrive側で年齢データが週次更新されている

---

### Phase 2: 集計機能実装（優先度: 🔴 HIGH）
**期間**: 2025年11月1日～11月15日
**担当**: VoiceDriveチーム

#### タスク（6件）
- [ ] `ProjectParticipationStats`テーブル追加
- [ ] `ProjectParticipationByProfession`テーブル追加
- [ ] `ProjectAnalyticsService.calculateParticipationStats()`実装
- [ ] `ProjectAnalyticsService.calculateProfessionParticipation()`実装
- [ ] `ProjectAnalyticsService.calculateDepartmentParticipation()`実装
- [ ] 日次集計バッチ実装（`src/jobs/daily-project-stats.ts`）

**完了条件**:
- 日次バッチが正常稼働
- `ProjectParticipationStats`テーブルにデータが蓄積されている
- UIでダミーデータではなく実データが表示される

---

### Phase 3: 多様性スコア実装（優先度: 🟡 MEDIUM）
**期間**: 2025年11月16日～11月30日
**担当**: VoiceDriveチーム

#### タスク（3件）
- [ ] `DiversityCalculator.calculateDiversityScore()`実装（Simpson's Index）
- [ ] 多様性スコアカードUI実装
- [ ] 多様性の内訳グラフ実装（職種・世代・階層の内訳）

**完了条件**:
- 多様性スコアが正確に計算されている
- UIで多様性スコアとその内訳が表示される

---

### Phase 4: 高度な分析機能（優先度: 🟢 LOW）
**期間**: 2025年12月1日～12月31日
**担当**: VoiceDriveチーム

#### タスク（4件）
- [ ] 参加トレンドグラフ実装（ProjectTalentAnalyticsPage.tsx 195-205行目）
- [ ] 人材育成効果分析実装（207-217行目）
- [ ] レポート出力機能（PDF/Excel）
- [ ] 施設別フィルタリング機能

**完了条件**:
- 全タブが実データで動作
- レポート出力機能が稼働

---

## 📝 確認事項サマリー

### 🔴 緊急確認事項（10月15日まで）

| 項目 | 内容 | 担当 | 期限 |
|------|------|------|------|
| **確認-1** | 生年月日データ提供方法（選択肢A推奨） | 医療システムチーム | 10/15 |
| **確認-2** | 部門別人数API実装スケジュール | 医療システムチーム | 10/15 |
| **確認-3** | 職種マスタAPI実装スケジュール | 医療システムチーム | 10/15 |

### 🟡 中期確認事項（10月末まで）

| 項目 | 内容 | 担当 | 期限 |
|------|------|------|------|
| **確認-4** | 多様性スコア計算ロジック承認 | 医療システムチーム | 10/31 |
| **確認-5** | 年齢データ更新頻度（週次で問題ないか） | 医療システムチーム | 10/31 |

---

## 📚 参考資料

- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [project-talent-analytics_DB要件分析_20251012.md](./project-talent-analytics_DB要件分析_20251012.md)
- Simpson's Diversity Index: https://en.wikipedia.org/wiki/Diversity_index#Simpson_index
- ProjectTalentAnalyticsPage.tsx: `C:\projects\voicedrive-v100\src\pages\ProjectTalentAnalyticsPage.tsx`

---

**文書ステータス**: ✅ 初版完成
**次のアクション**: 医療システムチームへの確認依頼（10月15日まで）
**レビュー期限**: 2025年10月15日
