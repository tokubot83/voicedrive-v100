# 組織文化開発ページ DB要件分析

**文書番号**: CD-DB-REQ-2025-1010-001
**作成日**: 2025年10月10日
**作成者**: VoiceDriveチーム
**目的**: 組織文化開発ページのDB要件を明確化し、医療システムとの責任分界を定義
**重要度**: 🔴 最重要
**関連文書**: データ管理責任分界点定義書_20251008.md

---

## 📋 エグゼクティブサマリー

### 背景
- 組織文化開発ページは**既に実装完了**（377行、デモデータ、権限制御Level 14-17）
- **人事部門専用**ページ（組織文化の診断・改善施策管理・効果測定）
- 現在は**デモデータのみ**でDB未統合
- **VoiceDrive管轄データが中心**（医療システムからの依存は職員情報のみ）

### 実装状況
- ✅ UI完全実装（[CultureDevelopmentPage.tsx](src/pages/CultureDevelopmentPage.tsx):377行）
- ✅ 型定義完備（[src/types/cultureDevelopment.ts](src/types/cultureDevelopment.ts):310行）
- ✅ サービス層実装（[src/services/CultureDevelopmentService.ts](src/services/CultureDevelopmentService.ts):515行）
- ❌ DB未構築（schema.prismaに組織文化関連テーブル無し）
- ❌ 診断データ永続化未実装
- ❌ 施策管理機能DB未統合

### データ連携体制の特徴

VoiceAnalyticsとは異なり、**VoiceDrive単独管理**が中心：

| 項目 | VoiceAnalytics | CultureDevelopment |
|------|----------------|-------------------|
| データ取得方式 | Webhook（医療システム → VoiceDrive） | VoiceDrive単独管理 |
| データ種別 | 集団分析データ（匿名化済み） | 文化診断データ + 施策管理 |
| 医療システム依存度 | 高（AI分析結果受信） | 低（職員情報のみ） |
| データ所有者 | 医療システム（生データ） | VoiceDrive（診断・施策） |
| 更新頻度 | バッチ（週次・月次） | 随時（施策追加・更新） |

### DB構築方針
1. **VoiceDrive管轄データ**: 文化診断結果、改善施策、KPI、マイルストーン、成果データ
2. **医療システム連携**: 職員情報（診断参加者、施策責任者）のみ
3. **データ管理責任**: 診断・施策データは100% VoiceDrive管轄
4. **プライバシー保護**: 部門別スコアは最小5名以上の集団データのみ

---

## 🎯 ページ機能分析

### 対象URL
- **本番URL**: https://voicedrive-v100.vercel.app/culture-development
- **権限レベル**: Level 14-17（人事部門専用）
- **ソースファイル**: [src/pages/CultureDevelopmentPage.tsx](src/pages/CultureDevelopmentPage.tsx)

### タブ構成

#### タブ1: 文化診断（Assessment）
- 総合スコア表示（0-100点）
- トレンド表示（improving/stable/declining）
- 文化次元別スコア（5次元）
- 部門別スコア
- 強み・弱み・機会の分析

#### タブ2: 改善施策（Initiatives）
- 施策一覧（planning/active/completed/on_hold/cancelled）
- 施策詳細（目標、KPI、進捗、マイルストーン）
- 成果表示（完了施策のみ）

---

### サマリーカード（4つ）

#### Card 1: 総合スコア
- **overallScore**: 72点（0-100）
- **trend**: improving（改善中）
- **scoreChange**: +4（前回比）

#### Card 2: 実施中施策
- **activeInitiatives**: 2件
- **initiativesOnTrack**: 1件（順調）
- **initiativesDelayed**: 0件（遅延）

#### Card 3: 完了施策
- **completedInitiatives**: 1件
- **highImpactInitiatives**: 1件（高影響）

#### Card 4: 平均改善率
- **averageImprovement**: 38.9%
- 完了施策の平均効果

**データソース**: 全てVoiceDrive管轄

---

### 文化次元別スコア（5次元）

#### 次元1: 心理的安全性（Psychological Safety）
- **score**: 78点
- **change**: +6（前回比）
- **indicators**: 自由な発言（82点）、失敗から学ぶ（76点）、助け合い（76点）
- **recommendedActions**: 1on1ミーティング、フィードバック文化醸成

#### 次元2: 協働性（Collaboration）
- **score**: 68点
- **change**: +3
- **indicators**: 部門間連携（65点）、情報共有（72点）、チーム意識（67点）
- **recommendedActions**: 部門横断プロジェクト、コラボレーションツール活用

#### 次元3: イノベーション志向（Innovation）
- **score**: 70点
- **change**: +2
- **indicators**: アイデア提案（74点）、変化への適応（68点）、実験的試み（68点）
- **recommendedActions**: アイデアボイス活用、イノベーションワークショップ

#### 次元4: 学習文化（Learning）
- **score**: 75点
- **change**: +1
- **indicators**: 研修機会（80点）、スキル開発（72点）、ナレッジ共有（73点）
- **recommendedActions**: オンライン学習プラットフォーム、メンタリングプログラム

#### 次元5: ワークライフバランス（Work-Life Balance）
- **score**: 65点
- **change**: +1
- **indicators**: 労働時間適正（68点）、休暇取得（62点）、柔軟な働き方（65点）
- **recommendedActions**: リモートワーク制度拡充、有給休暇取得推進

**データソース**: VoiceDrive管轄（診断結果）

---

### 部門別スコア

#### 部門1: リハビリ科
- **overallScore**: 78点
- **rank**: 1位
- **participationRate**: 92%
- **dimensionScores**: 心理的安全性（82点）、協働性（76点）、イノベーション志向（75点）

#### 部門2: 事務部
- **overallScore**: 74点
- **rank**: 2位
- **participationRate**: 88%

#### 部門3: 看護部
- **overallScore**: 70点
- **rank**: 3位
- **participationRate**: 85%

**データソース**: VoiceDrive管轄（診断結果）

---

### 改善施策（Initiatives）

#### 施策1: 部門横断コミュニケーション強化プログラム
- **status**: active（実施中）
- **priority**: high
- **targetDimensions**: 協働性、心理的安全性
- **startDate**: 2025-08-01
- **endDate**: 2025-12-31
- **progress**: 42%
- **kpis**:
  - 協働スコア: 65点 → 68点（目標75点）
  - 交流会参加率: 0% → 72%（目標80%）
- **budget**: ¥500,000
- **actualSpending**: ¥185,000
- **milestones**: 3つ（2つ完了、1つ進行中）

#### 施策2: ワークライフバランス改善プロジェクト
- **status**: active
- **priority**: critical
- **targetDimensions**: ワークライフバランス
- **targetDepartments**: 看護部、事務部
- **progress**: 25%
- **kpis**:
  - ワークライフバランススコア: 65点（目標75点）
  - リモートワーク利用率: 0% → 8%（目標30%）
- **budget**: ¥2,000,000
- **actualSpending**: ¥420,000

#### 施策3: イノベーション文化醸成ワークショップ
- **status**: completed（完了）
- **priority**: medium
- **progress**: 100%
- **outcomes**:
  - イノベーションスコア: 68点 → 70点（+2.9%）
  - アイデア提案数: 24件/月 → 42件/月（+75%）

**データソース**: VoiceDrive管轄（施策管理）

---

## 📊 データ管理責任マトリクス

### カテゴリ1: 文化診断（CultureAssessment）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 診断ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| 診断実施日（assessmentDate） | ✅ マスタ | - | - | VoiceDrive管理 |
| 診断期間（period） | ✅ マスタ | - | - | VoiceDrive管理 |
| 総合スコア（overallScore） | ✅ マスタ | - | - | VoiceDrive計算 |
| トレンド（trend） | ✅ マスタ | - | - | VoiceDrive判定 |
| 文化次元スコア（dimensions） | ✅ マスタ | - | - | VoiceDrive計算 |
| 部門別スコア（byDepartment） | ✅ マスタ | - | - | VoiceDrive計算 |
| 強み・弱み・機会 | ✅ マスタ | - | - | VoiceDrive分析 |
| 参加者数（participantCount） | ✅ マスタ | - | - | VoiceDrive集計 |
| 参加率（responseRate） | ✅ マスタ | - | - | VoiceDrive算出 |

**方針**:
- 文化診断データは**100% VoiceDrive管轄**
- 診断ロジック、スコア計算、分析は全てVoiceDrive側で実施
- 医療システムは関与しない（職員情報参照のみ）

---

### カテゴリ2: 文化次元（CultureDimension）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 次元ID（id） | ✅ マスタ | - | - | VoiceDrive定義 |
| 次元名（name） | ✅ マスタ | - | - | VoiceDrive定義（10種類） |
| スコア（score） | ✅ マスタ | - | - | VoiceDrive計算 |
| 変化（change） | ✅ マスタ | - | - | VoiceDrive算出 |
| 指標（indicators） | ✅ マスタ | - | - | VoiceDrive測定 |
| 推奨アクション（recommendedActions） | ✅ マスタ | - | - | VoiceDrive生成 |

---

### カテゴリ3: 改善施策（CultureInitiative）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 施策ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| タイトル・説明（title, description） | ✅ マスタ | - | - | VoiceDrive管理 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive管理 |
| 優先度（priority） | ✅ マスタ | - | - | VoiceDrive設定 |
| 対象次元（targetDimensions） | ✅ マスタ | - | - | VoiceDrive設定 |
| 対象部門（targetDepartments） | ✅ マスタ | - | - | VoiceDrive設定 |
| スケジュール（startDate, endDate） | ✅ マスタ | - | - | VoiceDrive管理 |
| 責任者ID（owner） | キャッシュ | ✅ マスタ | API | User.id |
| 責任者名（ownerName） | キャッシュ | ✅ マスタ | API | User.name |
| チームメンバー（team） | キャッシュ | ✅ マスタ | API | User.id[] |
| KPI（kpis） | ✅ マスタ | - | - | VoiceDrive管理 |
| 進捗（progress） | ✅ マスタ | - | - | VoiceDrive計算 |
| 予算（budget, actualSpending） | ✅ マスタ | - | - | VoiceDrive管理 |
| 成果（outcomes） | ✅ マスタ | - | - | VoiceDrive記録 |

**方針**:
- 施策データは**100% VoiceDrive管轄**
- 職員情報（責任者、チームメンバー）のみ医療システムから取得
- 施策の追加・更新・削除は全てVoiceDrive側で管理

---

## 🏗️ 必要なDBテーブル設計

### テーブル1: CultureAssessment（文化診断）

```prisma
model CultureAssessment {
  id                    String    @id @default(cuid())

  // 診断期間
  assessmentDate        DateTime  // 診断実施日
  periodStartDate       DateTime  // 対象期間開始
  periodEndDate         DateTime  // 対象期間終了

  // スコア
  overallScore          Int       // 総合スコア（0-100）
  previousScore         Int?      // 前回スコア
  trend                 String    // 'improving' | 'stable' | 'declining'

  // SWOT分析
  strengths             Json      // string[] - 強み
  weaknesses            Json      // string[] - 弱み
  opportunities         Json      // string[] - 機会

  // 参加データ
  participantCount      Int       // 参加者数
  responseRate          Float     // 参加率（%）

  // ステータス
  isActive              Boolean   @default(true)  // 最新データフラグ

  // タイムスタンプ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // リレーション
  dimensions            CultureDimension[]
  departmentScores      DepartmentCultureScore[]

  @@index([assessmentDate])
  @@index([isActive])
  @@index([periodStartDate, periodEndDate])
}
```

---

### テーブル2: CultureDimension（文化次元）

```prisma
model CultureDimension {
  id                    String              @id @default(cuid())

  // 診断との関連
  assessmentId          String              // CultureAssessment.id

  // 次元情報
  dimensionType         String              // 'psychological_safety' | 'collaboration' | 'innovation' | 'learning' | 'work_life_balance' | ...
  name                  String              // 次元名（日本語）
  description           String              // 説明

  // スコア
  score                 Int                 // スコア（0-100）
  previousScore         Int?                // 前回スコア
  change                Int                 // 変化（前回比）

  // 推奨アクション
  recommendedActions    Json                // string[]

  // タイムスタンプ
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // リレーション
  assessment            CultureAssessment   @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  indicators            CultureIndicator[]

  @@index([assessmentId])
  @@index([dimensionType])
}
```

---

### テーブル3: CultureIndicator（文化指標）

```prisma
model CultureIndicator {
  id                String              @id @default(cuid())

  // 次元との関連
  dimensionId       String              // CultureDimension.id

  // 指標情報
  name              String              // 指標名
  value             Int                 // 現在値（0-100）
  target            Int                 // 目標値（0-100）
  achievement       Float               // 達成率（%）
  trend             String              // 'up' | 'down' | 'stable'

  // タイムスタンプ
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // リレーション
  dimension         CultureDimension    @relation(fields: [dimensionId], references: [id], onDelete: Cascade)

  @@index([dimensionId])
}
```

---

### テーブル4: DepartmentCultureScore（部門別スコア）

```prisma
model DepartmentCultureScore {
  id                    String              @id @default(cuid())

  // 診断との関連
  assessmentId          String              // CultureAssessment.id

  // 部門情報
  department            String              // 部門名
  departmentId          String?             // 医療システムの部門ID（将来実装）

  // スコア
  overallScore          Int                 // 総合スコア（0-100）
  dimensionScores       Json                // { dimension: string, score: number }[]
  rank                  Int                 // 部門ランキング
  participationRate     Float               // 参加率（%）

  // タイムスタンプ
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // リレーション
  assessment            CultureAssessment   @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@index([assessmentId])
  @@index([department])
  @@index([rank])
}
```

---

### テーブル5: CultureInitiative（改善施策）

```prisma
model CultureInitiative {
  id                    String                      @id @default(cuid())

  // 基本情報
  title                 String                      // タイトル
  description           String                      // 説明
  objective             String                      // 目標

  // ステータス
  status                String                      @default("planning") // 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled'
  priority              String                      @default("medium")   // 'low' | 'medium' | 'high' | 'critical'

  // ターゲット
  targetDimensions      Json                        // string[] - 対象文化次元
  targetDepartments     Json                        // string[] - 対象部門（空配列=全体）
  targetAudience        String                      // 対象者（例: 「全職員」）

  // スケジュール
  startDate             DateTime                    // 開始日
  endDate               DateTime                    // 終了日

  // 責任者（医療システムから取得）
  ownerId               String?                     // User.id
  ownerName             String                      // User.name（キャッシュ）
  teamMembers           Json                        // string[] - User.id[]

  // 進捗
  progress              Int                         @default(0) // 0-100
  currentPhase          String?                     // 現在のフェーズ

  // 予算
  budget                Float?                      // 予算
  actualSpending        Float?                      // 実支出

  // 成果（完了時のみ）
  outcomesDescription   String?                     // 成果説明
  outcomesMetrics       Json?                       // { name, before, after, improvement }[]

  // タイムスタンプ
  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt
  completedAt           DateTime?                   // 完了日時

  // リレーション
  owner                 User?                       @relation("InitiativeOwner", fields: [ownerId], references: [id])
  kpis                  InitiativeKPI[]
  milestones            InitiativeMilestone[]

  @@index([ownerId])
  @@index([status])
  @@index([priority])
  @@index([startDate, endDate])
}
```

---

### テーブル6: InitiativeKPI（施策KPI）

```prisma
model InitiativeKPI {
  id                String              @id @default(cuid())

  // 施策との関連
  initiativeId      String              // CultureInitiative.id

  // KPI情報
  name              String              // KPI名
  baseline          Float               // ベースライン値
  target            Float               // 目標値
  current           Float               // 現在値
  unit              String              // 単位
  achievement       Float               // 達成率（%）

  // タイムスタンプ
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // リレーション
  initiative        CultureInitiative   @relation(fields: [initiativeId], references: [id], onDelete: Cascade)

  @@index([initiativeId])
}
```

---

### テーブル7: InitiativeMilestone（施策マイルストーン）

```prisma
model InitiativeMilestone {
  id                String              @id @default(cuid())

  // 施策との関連
  initiativeId      String              // CultureInitiative.id

  // マイルストーン情報
  name              String              // マイルストーン名
  targetDate        DateTime            // 目標日
  completedDate     DateTime?           // 完了日
  status            String              @default("pending") // 'pending' | 'in_progress' | 'completed' | 'delayed'
  deliverables      Json                // string[] - 成果物リスト

  // タイムスタンプ
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // リレーション
  initiative        CultureInitiative   @relation(fields: [initiativeId], references: [id], onDelete: Cascade)

  @@index([initiativeId])
  @@index([targetDate])
  @@index([status])
}
```

---

### テーブル8: User model拡張

```prisma
model User {
  // 既存フィールド...

  // CultureDevelopment統合実装（2025-10-10）
  ownedInitiatives      CultureInitiative[] @relation("InitiativeOwner")
}
```

---

## 🔗 医療システムAPI連携要件

### API 1: 職員情報取得（既存API流用）

**エンドポイント**: `GET /api/employees/{employeeId}`

**用途**:
- 施策責任者（owner）情報取得
- チームメンバー情報取得

**レスポンス例**:
```json
{
  "employeeId": "OH-HR-2020-001",
  "name": "人事部 田中",
  "department": "人事部",
  "position": "主任",
  "permissionLevel": 14.0
}
```

---

### API 2: 複数職員情報一括取得（既存API流用）

**エンドポイント**: `POST /api/employees/batch`

**用途**:
- チームメンバーリストの職員情報を一括取得

**リクエスト例**:
```json
{
  "employeeIds": ["OH-HR-2020-001", "OH-HR-2020-002", "OH-NS-2020-005"]
}
```

**レスポンス例**:
```json
{
  "employees": [
    { "employeeId": "OH-HR-2020-001", "name": "人事部 田中", "department": "人事部" },
    { "employeeId": "OH-HR-2020-002", "name": "人事部 佐藤", "department": "人事部" }
  ]
}
```

**新規API**: なし（全て既存API流用）

---

## 🚧 不足項目まとめ

### A. DBテーブル（schema.prisma）
1. ❌ `CultureAssessment` - 文化診断
2. ❌ `CultureDimension` - 文化次元
3. ❌ `CultureIndicator` - 文化指標
4. ❌ `DepartmentCultureScore` - 部門別スコア
5. ❌ `CultureInitiative` - 改善施策
6. ❌ `InitiativeKPI` - 施策KPI
7. ❌ `InitiativeMilestone` - 施策マイルストーン

### B. Userモデルへの追加リレーション
```prisma
model User {
  // 既存フィールド...

  // CultureDevelopment統合実装
  ownedInitiatives      CultureInitiative[] @relation("InitiativeOwner")
}
```

### C. 医療システムAPI
- ✅ API-2（職員情報単体） - PersonalStation API流用
- ✅ API-CM-1（職員情報バッチ） - CommitteeManagement API流用

**追加API**: なし（全て既存API流用）

---

## 📅 実装ロードマップ

### Phase 1: DB構築（2日）

**Day 1**:
- [ ] schema.prisma更新（7テーブル追加）
- [ ] Userモデルにリレーション追加
- [ ] Prisma Migration実行（MySQL移行後）
- [ ] Prisma Client再生成

**Day 2**:
- [ ] デモデータ投入スクリプト作成
- [ ] 初期データ投入（診断1件、施策3件）
- [ ] データ整合性チェック

---

### Phase 2: サービス層DB版移行（2日）

**Day 3**:
- [ ] CultureDevelopmentService.tsをDB版に変更
- [ ] `getAssessment()`メソッド：DB取得に変更
- [ ] `getSummary()`メソッド：DB集計に変更
- [ ] `getAllInitiatives()`メソッド：DB取得に変更

**Day 4**:
- [ ] 施策CRUD操作実装（作成・更新・削除）
- [ ] KPI更新機能実装
- [ ] マイルストーン管理機能実装
- [ ] 統合テスト（CRUD操作）

---

### Phase 3: UI統合（1日）

**Day 5**:
- [ ] CultureDevelopmentPage.tsxをDB版に接続
- [ ] リアルタイムデータ表示確認
- [ ] フィルタリング機能確認
- [ ] E2Eテスト

**合計**: 5日間

---

## ✅ 成功基準

### 機能要件
- [ ] 文化診断タブが正常表示
- [ ] 改善施策タブが正常表示
- [ ] サマリーカード4つ全て正確表示
- [ ] 文化次元別スコア表示（5次元）
- [ ] 部門別スコア表示
- [ ] 施策一覧・詳細表示
- [ ] KPI・マイルストーン表示

### 非機能要件
- [ ] ページ読み込み時間 < 2秒
- [ ] API応答時間 < 500ms
- [ ] データ整合性100%（医療システムと）

### データ管理
- [ ] VoiceDrive/医療システム責任分界明確
- [ ] 診断・施策データ100% VoiceDrive管轄
- [ ] 職員情報のみ医療システムAPI参照

---

## 🔒 プライバシー保護実装詳細

### 部門別スコアの最小グループサイズ

```typescript
// 部門別スコア計算時のプライバシー保護
async function calculateDepartmentScores(
  assessmentId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<DepartmentCultureScore[]> {

  // 1. 部門別参加者数取得
  const departmentParticipants = await prisma.user.groupBy({
    by: ['department'],
    _count: { id: true },
    where: {
      // 診断参加者のみ
      cultureSurveyResponses: {
        some: {
          assessmentId: assessmentId
        }
      }
    }
  });

  // 2. 最小グループサイズチェック（5名未満は除外）
  const validDepartments = departmentParticipants.filter(
    d => d._count.id >= 5
  );

  // 3. 部門別スコア計算
  const departmentScores: DepartmentCultureScore[] = [];

  for (const dept of validDepartments) {
    const score = await calculateDepartmentScore(dept.department, assessmentId);
    departmentScores.push(score);
  }

  return departmentScores;
}
```

---

## 📞 医療チームへの質問事項

### 質問1: 文化診断の実施頻度

文化診断は：

- 四半期ごと（年4回）
- 半期ごと（年2回）
- 年1回のみ

どの頻度で実施しますか？

---

### 質問2: 診断データの保存期間

CultureAssessmentテーブルのデータ保存期間は：

- 全期間保存（削除なし）
- 直近5年間のみ保存
- 直近3年間のみ保存

どの方式を推奨しますか？

---

### 質問3: 施策管理の権限範囲

CultureInitiativeの作成・編集・削除権限は：

- Level 14-17のみ（人事部門専用）
- Level 10以上（部門長も施策作成可能）
- Level 7以上（リーダー層も施策作成可能）

どのレベルまで許可しますか？

---

## 📚 関連文書

- [データ管理責任分界点定義書_20251008.md](mcp-shared/docs/データ管理責任分界点定義書_20251008.md)
- [CultureDevelopmentPage.tsx](src/pages/CultureDevelopmentPage.tsx)
- [src/types/cultureDevelopment.ts](src/types/cultureDevelopment.ts)
- [src/services/CultureDevelopmentService.ts](src/services/CultureDevelopmentService.ts)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
承認: 未承認（レビュー待ち）
