# StrategicInitiativesPage DB要件分析

**作成日**: 2025年10月26日
**対象ページ**: StrategicInitiativesPage (戦略イニシアチブページ)
**URL**: https://voicedrive-v100.vercel.app/strategic-initiatives

---

## 📋 目次

1. [ページ概要](#ページ概要)
2. [主要機能](#主要機能)
3. [データフロー](#データフロー)
4. [データ管理責任分界点](#データ管理責任分界点)
5. [現在のDB実装状況](#現在のdb実装状況)
6. [不足項目の洗い出し](#不足項目の洗い出し)
7. [API要件](#api要件)
8. [セキュリティ要件](#セキュリティ要件)
9. [パフォーマンス要件](#パフォーマンス要件)

---

## ページ概要

### 目的
院長主導の戦略プロジェクトを管理し、進捗状況、予算、リスク、KPIを一元的に監視するページ。プロジェクト化モード専用機能。

### ユーザー
- **対象**: レベル13以上（院長・施設長）
- **権限**: 全戦略プロジェクトの閲覧・管理
- **アクセス**: プロジェクト化モード専用

### ページ構成
```
StrategicInitiativesPage
├── 統計サマリー
│   ├── 総プロジェクト数
│   ├── 平均進捗率・期限内完了率
│   ├── 総予算・消化率
│   └── リスクありプロジェクト数
├── タブ切り替え
│   ├── 全プロジェクト
│   ├── 進行中
│   ├── 計画中
│   └── 完了
├── プロジェクト一覧
│   ├── プロジェクトカード（タイトル、説明、ステータス、優先度）
│   ├── 進捗バー
│   ├── KPI表示（上位3件）
│   ├── リスク表示
│   └── 次のマイルストーン
├── プロジェクト詳細モーダル
│   ├── プロジェクト目標
│   ├── マイルストーン一覧（5段階進捗）
│   ├── チームメンバー
│   ├── 予算管理（総予算、支出済み、残額、消化率）
│   └── リスク管理
└── 新規プロジェクト立案ボタン（未実装）
```

---

## 主要機能

### 1. 統計サマリー表示

#### 1.1 総プロジェクト数
- **計算**: 全プロジェクトのカウント
- **補足**: 進行中プロジェクト数も表示

#### 1.2 平均進捗率・期限内完了率
- **平均進捗率**: 進行中プロジェクトの進捗率平均（%）
- **期限内完了率**: 完了プロジェクトのうち期限内に完了した割合（%）

#### 1.3 総予算・消化率
- **総予算**: 全プロジェクトの予算合計（円）
- **消化率**: 総支出 / 総予算（%）

#### 1.4 リスクありプロジェクト数
- **カウント**: status === 'at_risk' のプロジェクト数

### 2. プロジェクト一覧表示

#### 2.1 ステータス別フィルタリング
- **全プロジェクト**: 全件表示
- **進行中**: status === 'in_progress' || status === 'at_risk'
- **計画中**: status === 'planning'
- **完了**: status === 'completed'

#### 2.2 プロジェクトカード表示
**表示項目**:
- タイトル、説明
- ステータスバッジ（計画中、進行中、リスクあり、保留中、完了、キャンセル）
- 優先度アイコン（critical, high, medium, low）
- 開始日・終了日
- チーム人数
- 予算
- 全体進捗バー
- KPI（上位3件のみ）
- リスク（上位2件のみ）
- 次のマイルストーン

#### 2.3 プロジェクト詳細モーダル
- プロジェクト目標
- 全マイルストーン（5段階進捗、遅延フラグ）
- チームメンバー一覧（役割、所属、稼働率）
- 予算詳細（総予算、支出済み、残額、消化率、進捗バー）
- 全リスク（リスクレベル、発生確率、影響度、対策、担当者、ステータス）

### 3. 新規プロジェクト立案（未実装）

#### 3.1 プロジェクトテンプレート
- DX推進プロジェクト
- 地域医療拠点化プロジェクト
- 人材育成改革プロジェクト
- 医療品質向上プロジェクト

---

## データフロー

### 全体フロー

```
院長 → VoiceDrive StrategicInitiativesPage
  ↓
  1. プロジェクト一覧取得（GET /api/strategic-projects）
  2. 統計情報計算（クライアントサイド）
  3. タブ切り替え（フィルタリング）
  4. プロジェクト詳細取得（GET /api/strategic-projects/:id）
  ↓
医療システムAPI
  ↓
  5. 新規プロジェクト作成（POST /api/strategic-projects）
  6. プロジェクト更新（PATCH /api/strategic-projects/:id）
  7. マイルストーン完了（POST /api/strategic-projects/:id/milestones/:mid/complete）
  8. リスク追加・解決（POST /api/strategic-projects/:id/risks）
```

---

## データ管理責任分界点

### 医療システム管理データ（推奨: 80%）

#### 1. 戦略プロジェクト基本データ
- **プロジェクトマスタ**: ID、タイトル、説明、目標、ステータス、優先度、期間
- **予算データ**: 総予算、支出済み、残額、消化率
- **チームメンバー**: 職員マスタとの連携
- **理事会連携**: 承認ステータス、プレゼン日

#### 2. 進捗管理データ
- **マイルストーン**: タイトル、説明、目標日、完了日、ステータス、進捗率
- **全体進捗率**: マイルストーン進捗から計算

#### 3. KPI管理
- **KPIマスタ**: KPI名、目標値、現在値、単位、トレンド
- **KPI実績データ**: 時系列データ

#### 4. リスク管理
- **リスクマスタ**: リスクID、タイトル、説明、レベル、発生確率、影響度
- **リスク対応**: 対策、担当者、ステータス

### VoiceDrive管理データ（推奨: 20%）

#### 1. プロジェクトテンプレート
- **テンプレートマスタ**: テンプレートID、名前、説明、カテゴリ
- **推奨マイルストーン**: テンプレート別のマイルストーン候補
- **推奨KPI**: テンプレート別のKPI候補
- **推奨予算**: 概算予算

#### 2. UI設定
- **表示設定**: ソート順、フィルタ設定
- **カスタマイズ**: 院長ごとのダッシュボード設定

#### 3. 一時データ（セッション）
- **現在のタブ**: overview/active/planning/completed
- **選択中プロジェクト**: 詳細モーダル表示用
- **統計情報**: クライアント計算結果（キャッシュ）

### データ同期方針

**推奨**: 医療システムが Single Source of Truth

**理由**:
- 戦略プロジェクトは経営・予算管理と密接に関連
- 医療システムで既に理事会連携、予算管理、職員マスタを管理
- VoiceDriveは「声の収集・組織改善」に特化し、プロジェクト管理は医療システムに委譲
- データ重複を避け、一貫性を保つ

**代替案**: VoiceDrive側でも一部保存
- 将来的にVoiceDriveがプロジェクト管理の中心となる場合のみ検討
- その場合は双方向同期が必要（複雑度増加）

---

## 現在のDB実装状況

### VoiceDrive側テーブル

#### ❌ StrategicProject テーブル: **存在しない**

**検証結果**:
- `prisma/schema.prisma`を検索 → StrategicProjectモデル見つからず
- 戦略プロジェクトデータを保存するテーブルが存在しない

**現在の実装**:
- すべてメモリ内（StrategicProjectService.ts）でデモデータ管理
- ページリロードでデータ消失
- 永続化なし

### 医療システム側テーブル（推定）

#### StrategicProject（推定）
```sql
CREATE TABLE strategic_projects (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  objective TEXT,
  status ENUM('planning', 'in_progress', 'at_risk', 'on_hold', 'completed', 'cancelled'),
  priority ENUM('critical', 'high', 'medium', 'low'),
  phase ENUM('initiation', 'planning', 'execution', 'monitoring', 'closure'),
  start_date DATE,
  end_date DATE,
  estimated_duration INT,
  overall_progress DECIMAL(5,2),
  budget_total BIGINT,
  budget_allocated BIGINT,
  budget_spent BIGINT,
  budget_remaining BIGINT,
  budget_utilization_rate DECIMAL(5,2),
  owner VARCHAR(255),
  team_size INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by VARCHAR(255),
  last_modified_by VARCHAR(255),
  board_approval_required BOOLEAN,
  board_approval_status ENUM('pending', 'approved', 'rejected'),
  board_presentation_date DATE,
  category ENUM('facility', 'hr', 'digital', 'quality', 'community', 'finance', 'other')
);
```

#### ProjectMilestone（推定）
```sql
CREATE TABLE project_milestones (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES strategic_projects(id),
  title VARCHAR(500),
  description TEXT,
  target_date DATE,
  completed_date DATE,
  status ENUM('pending', 'in_progress', 'completed', 'delayed'),
  completion_rate DECIMAL(5,2)
);
```

#### ProjectKPI（推定）
```sql
CREATE TABLE project_kpis (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES strategic_projects(id),
  name VARCHAR(255),
  target DECIMAL(10,2),
  current DECIMAL(10,2),
  unit VARCHAR(50),
  trend ENUM('up', 'down', 'stable')
);
```

#### ProjectRisk（推定）
```sql
CREATE TABLE project_risks (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES strategic_projects(id),
  title VARCHAR(500),
  description TEXT,
  level ENUM('high', 'medium', 'low'),
  probability ENUM('high', 'medium', 'low'),
  impact ENUM('high', 'medium', 'low'),
  mitigation TEXT,
  status ENUM('identified', 'mitigating', 'resolved'),
  owner VARCHAR(255)
);
```

#### ProjectTeamMember（推定）
```sql
CREATE TABLE project_team_members (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES strategic_projects(id),
  user_id VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(255),
  department VARCHAR(255),
  commitment INT  -- %
);
```

---

## 不足項目の洗い出し

### 1. VoiceDrive側データベーステーブル

#### オプション1: 医療システム完全依存（推奨）

**実装**: テーブル追加不要

**理由**:
- データ管理責任分界点の原則に従う
- 医療システムがSingle Source of Truth
- VoiceDriveは表示・操作のUIレイヤーのみ
- データ重複回避

**必要なAPI**:
- GET /api/strategic-projects（一覧取得）
- GET /api/strategic-projects/:id（詳細取得）
- POST /api/strategic-projects（新規作成）
- PATCH /api/strategic-projects/:id（更新）
- POST /api/strategic-projects/:id/milestones/:mid/complete（マイルストーン完了）
- POST /api/strategic-projects/:id/risks（リスク追加）

#### オプション2: VoiceDrive側でも保存（非推奨）

**理由**:
- データ重複による同期問題
- 予算・理事会連携は医療システムの管轄
- VoiceDriveの本来の役割から逸脱

**実装する場合の追加テーブル**:
```prisma
model StrategicProject {
  id                    String   @id @default(cuid())
  title                 String
  description           String?
  objective             String?
  status                String   @default("planning")
  priority              String   @default("medium")
  phase                 String   @default("planning")
  startDate             DateTime
  endDate               DateTime
  estimatedDuration     Int
  overallProgress       Float    @default(0)
  budgetTotal           BigInt
  budgetAllocated       BigInt
  budgetSpent           BigInt
  budgetRemaining       BigInt
  budgetUtilizationRate Float
  owner                 String
  teamSize              Int
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  createdBy             String
  lastModifiedBy        String
  boardApprovalRequired Boolean  @default(false)
  boardApprovalStatus   String?
  boardPresentationDate DateTime?
  category              String
  tags                  String[]

  milestones    ProjectMilestone[]
  kpis          ProjectKPI[]
  risks         ProjectRisk[]
  teamMembers   ProjectTeamMember[]
}

model ProjectMilestone {
  id             String    @id @default(cuid())
  projectId      String
  title          String
  description    String?
  targetDate     DateTime
  completedDate  DateTime?
  status         String    @default("pending")
  completionRate Float     @default(0)
  project        StrategicProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ProjectKPI {
  id        String @id @default(cuid())
  projectId String
  name      String
  target    Float
  current   Float
  unit      String
  trend     String @default("stable")
  project   StrategicProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ProjectRisk {
  id          String @id @default(cuid())
  projectId   String
  title       String
  description String?
  level       String
  probability String
  impact      String
  mitigation  String?
  status      String @default("identified")
  owner       String
  project     StrategicProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ProjectTeamMember {
  id         String @id @default(cuid())
  projectId  String
  userId     String
  name       String
  role       String
  department String
  commitment Int
  project    StrategicProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

### 2. API実装

#### ❌ すべて未実装

**現状**: デモデータのみ（StrategicProjectService.ts）

**必要なAPI**:

1. **GET /api/strategic-projects**
   - 全プロジェクト一覧取得
   - フィルタリング: status, priority, category

2. **GET /api/strategic-projects/:id**
   - プロジェクト詳細取得

3. **POST /api/strategic-projects**
   - 新規プロジェクト作成
   - テンプレートからの作成サポート

4. **PATCH /api/strategic-projects/:id**
   - プロジェクト更新

5. **POST /api/strategic-projects/:id/milestones/:milestoneId/complete**
   - マイルストーン完了マーク

6. **POST /api/strategic-projects/:id/risks**
   - リスク追加

7. **PATCH /api/strategic-projects/:id/risks/:riskId**
   - リスク更新・解決

### 3. 型定義

#### ✅ 既存型定義（完全実装済み）
- StrategicProject
- StrategicInitiativeStats
- ProjectMilestone
- ProjectRisk
- ProjectBudget
- ProjectTeamMember
- StrategicKPI
- ProjectTemplate

#### ❌ 不足なし

---

## API要件

### 1. GET /api/strategic-projects

#### エンドポイント
- **URL**: `http://localhost:8080/api/strategic-projects`
- **Method**: GET
- **認証**: Bearer Token（Level 13以上）

#### クエリパラメータ
```typescript
{
  status?: 'planning' | 'in_progress' | 'at_risk' | 'on_hold' | 'completed' | 'cancelled'
  priority?: 'critical' | 'high' | 'medium' | 'low'
  category?: 'facility' | 'hr' | 'digital' | 'quality' | 'community' | 'finance' | 'other'
}
```

#### レスポンス
```typescript
{
  success: true,
  projects: StrategicProject[]
}
```

#### 実装状況
- ❌ クライアント側API呼び出し: 未実装（デモデータ使用中）
- ❌ サーバー側（VoiceDrive）: 未実装
- ❌ 医療システム側: 未実装（想定）

---

### 2. POST /api/strategic-projects

#### エンドポイント
- **URL**: `http://localhost:8080/api/strategic-projects`
- **Method**: POST
- **認証**: Bearer Token（Level 13以上）

#### リクエスト
```typescript
{
  title: string
  description: string
  objective: string
  priority: StrategicProjectPriority
  startDate: string  // ISO8601
  endDate: string    // ISO8601
  estimatedDuration: number  // months
  budgetTotal: number
  owner: string
  teamSize: number
  category: string
  tags: string[]
  milestones: {...}[]
  kpis: {...}[]
  teamMembers: {...}[]
  boardApprovalRequired?: boolean
}
```

#### レスポンス
```typescript
{
  success: true,
  project: StrategicProject
}
```

#### 実装状況
- ❌ クライアント側: 未実装（アラート表示のみ）
- ❌ サーバー側: 未実装

---

### 3. PATCH /api/strategic-projects/:id/milestones/:milestoneId/complete

#### エンドポイント
- **URL**: `http://localhost:8080/api/strategic-projects/:id/milestones/:milestoneId/complete`
- **Method**: POST
- **認証**: Bearer Token

#### リクエスト
```typescript
{
  completedDate: string  // ISO8601
}
```

#### レスポンス
```typescript
{
  success: true,
  project: StrategicProject,  // 更新後のプロジェクト全体
  milestone: ProjectMilestone  // 完了したマイルストーン
}
```

---

## セキュリティ要件

### 1. 認証・認可
- **認証**: JWT Bearer Token
- **認可**: レベル13以上（院長・施設長）のみアクセス可能
- **データアクセス**: 所属施設のプロジェクトのみ（複数施設の場合は全施設）

### 2. データ保護
- **転送中**: HTTPS（本番環境）
- **保存中**: 医療システム側で暗号化
- **予算データ**: 高度な機密情報として扱う

### 3. 監査ログ
- プロジェクト作成・更新・削除
- マイルストーン完了
- リスク追加・解決
- 予算変更

---

## パフォーマンス要件

### 1. レスポンスタイム
- **初期ローディング**: < 3秒
- **プロジェクト一覧取得**: < 2秒
- **プロジェクト詳細表示**: < 1秒（キャッシュ利用）

### 2. キャッシュ戦略
- **プロジェクト一覧**: 5分間キャッシュ
- **統計情報**: クライアント計算（リアルタイム）
- **プロジェクト詳細**: 2分間キャッシュ

### 3. ページネーション
- **一覧表示**: 20件/ページ（現状は全件表示）
- **マイルストーン**: 全件表示（通常5-10件程度）
- **リスク**: 全件表示

---

## まとめ

### データ管理責任
| データ種別 | 管理者 | VoiceDrive役割 |
|---------|-------|---------------|
| プロジェクト基本データ | 医療システム | 表示・操作UI |
| 予算データ | 医療システム | 表示のみ |
| マイルストーン | 医療システム | 表示・完了マーク |
| KPI | 医療システム | 表示のみ |
| リスク | 医療システム | 表示・追加・解決 |
| チームメンバー | 医療システム | 表示のみ（職員マスタ参照） |
| 理事会連携 | 医療システム | 表示のみ |
| プロジェクトテンプレート | VoiceDrive | 管理・提供 |
| UI設定 | VoiceDrive | 管理 |

### 実装優先度

#### 🔴 高優先度（必須）
1. ❌ **GET /api/strategic-projects API統合**
2. ❌ **GET /api/strategic-projects/:id API統合**
3. ❌ **統計情報クライアント計算の最適化**
4. ❌ **デモデータから実APIへ切り替え**

#### 🟡 中優先度（推奨）
5. ❌ **POST /api/strategic-projects 新規プロジェクト作成機能**
6. ❌ **マイルストーン完了API統合**
7. ❌ **リスク追加・解決API統合**
8. ❌ **プロジェクトテンプレート管理UI**

#### 🟢 低優先度（オプション）
9. VoiceDrive側DBテーブル作成（医療システム完全依存を推奨するため不要）
10. ページネーション実装（プロジェクト数が少ない想定）

---

**次のステップ**: StrategicInitiativesPage暫定マスターリスト作成
