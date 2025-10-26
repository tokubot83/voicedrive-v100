# EnhancedProjectListPage (/projects) DB要件分析

**文書番号**: DB-REQ-2025-1026-003
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/projects EnhancedProjectListPage
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [ProjectListPage_DB要件分析_20251026.md](./ProjectListPage_DB要件分析_20251026.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
EnhancedProjectListPage（/projects）は**VoiceDrive独自のプロジェクト一覧表示機能**であり、**Phase 2まで完全実装済み**です。

### 🎉 実装状況
| 項目 | 状態 | 詳細 |
|------|------|------|
| **Phase 1実装** | ✅ **完了** | 基本的なプロジェクト一覧表示 |
| **Phase 2実装** | ✅ **完了** | レベル計算・承認フロー・エスカレーション |
| **データベーススキーマ** | ✅ **完全** | 全必要フィールド存在 |
| **医療システムAPI連携** | ✅ **完了** | 部署マスタAPI統合済み |
| **サービス層** | ✅ **完了** | 6つのサービス実装済み |
| **Phase 3実装** | 🟡 **未実装** | パフォーマンス最適化（スキーマ定義済み） |

---

## 🎯 データ管理責任分界点

### VoiceDrive側の責任（100%）
- ✅ プロジェクト基本情報（title, description, status, category, priority）
- ✅ プロジェクトレベル（DEPARTMENT/FACILITY/CORPORATE/EMERGENCY）
- ✅ 進捗管理（progressRate, startedAt, completedAt）
- ✅ 承認状態（approvalStatus, currentApprover）
- ✅ 緊急エスカレーション（isEmergencyEscalated, escalatedBy, escalatedDate）
- ✅ チームメンバー管理（ProjectTeamMember）
- ✅ 参加者数の集計
- ✅ ユーザー役割判定（owner/participant/viewer）

### 医療システム側の責任
- 📡 部署マスタAPI提供のみ（GET /api/v2/departments）
- 📡 施設情報提供のみ（departmentsレスポンス内）
- ❌ プロジェクトデータの管理は**一切なし**

---

## 📊 ページ機能分析

### 1. URL・ルーティング
```typescript
// ページURL
https://voicedrive-v100.vercel.app/projects

// コンポーネント
src/pages/ProjectListPage.tsx

// URLパラメータでの初期フィルター対応
?filter=active        → ステータス: 進行中
?filter=completed     → ステータス: 完了
?filter=department    → カテゴリー: 業務改善
?filter=facility      → カテゴリー: 施設管理
?filter=corporate     → カテゴリー: システム
```

---

### 2. 画面構成

#### 2.1 統計サマリーセクション
```typescript
interface ProjectStats {
  active: number;      // 参加中のプロジェクト数
  completed: number;   // 完了済みプロジェクト数
  proposed: number;    // 提案中のプロジェクト数
  owned: number;       // オーナープロジェクト数
}
```

**データソース**: `ProjectListService.getProjectStats(currentUserId)`
**計算方法**:
- `active`: ユーザーが参加中（proposer or teamMember）のプロジェクト数
- `completed`: 全てのcompleted状態プロジェクト数
- `proposed`: 全てのproposed状態プロジェクト数
- `owned`: ユーザーがproposerのプロジェクト数

---

#### 2.2 検索・フィルターセクション
```typescript
interface Filters {
  searchTerm: string;                                    // タイトル・説明文で検索
  status: 'all' | 'active' | 'completed' | 'proposed';  // ステータスフィルター
  category: 'all' | 'improvement' | 'community' | 'facility' | 'system'; // カテゴリー
  level: 'all' | 'DEPARTMENT' | 'FACILITY' | 'CORPORATE' | 'EMERGENCY';  // レベル
}
```

**実装状況**: ✅ 完全実装済み
- 検索: タイトル・説明文の部分一致検索（大文字小文字区別なし）
- フィルター: 4つの独立したフィルター（AND条件）
- ユーザー参加フィルター: proposer or teamMemberのみ表示

---

#### 2.3 プロジェクト一覧セクション

**47データ項目を表示**:

```typescript
interface ProjectListItem {
  // === 基本情報（9項目）===
  id: string;                    // プロジェクトID
  title: string;                 // プロジェクト名
  description: string;           // 説明文
  status: 'proposed' | 'active' | 'completed' | 'paused';  // ステータス
  category: 'improvement' | 'community' | 'facility' | 'system'; // カテゴリー
  priority: 'high' | 'medium' | 'low' | 'urgent' | null;  // 優先度
  progress: number;              // 進捗率（0-100）
  startDate: string | null;      // 開始日
  endDate: string | null;        // 完了日

  // === チーム情報（2項目）===
  participants: number;          // 参加者数（集計）
  myRole: 'owner' | 'participant' | 'viewer';  // ユーザーの役割

  // === 組織情報（2項目）===
  department: string;            // 提案者の部署名
  facility: string;              // 施設名（医療システムAPIから取得）

  // === Phase 2拡張（6項目）===
  projectLevel: string | null;          // プロジェクトレベル
  isEmergencyEscalated: boolean;       // 緊急エスカレーション有無
  escalatedBy: string | null;          // エスカレーション実行者ID
  escalatedDate: string | null;        // エスカレーション日時
  approvalStatus: string;              // 承認状態
  currentApprover: string | null;      // 現在の承認者ID
}
```

**合計47データ項目の内訳**:
- 基本情報: 9項目
- チーム情報: 2項目
- 組織情報: 2項目
- Phase 2拡張: 6項目
- 内部管理用: 28項目（proposerId, createdAt, updatedAt等）

---

## 💾 データベース実装状況

### 1. Projectテーブル（完全実装済み）

**ファイルパス**: `prisma/schema.prisma` (lines 308-365)

```prisma
model Project {
  // === Phase 1: 基本フィールド ===
  id                    String    @id @default(cuid())
  title                 String
  description           String
  category              String    // improvement/community/facility/system
  status                String    @default("proposed")  // proposed/active/completed/paused
  priority              String?   // high/medium/low/urgent
  proposerId            String
  progressRate          Float     @default(0)  // 0-100（progress表示用）
  startedAt             DateTime? // startDate表示用
  completedAt           DateTime? // endDate表示用
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // === Phase 2: レベル・承認・エスカレーション ===
  isEmergencyEscalated  Boolean   @default(false)
  escalatedBy           String?
  escalatedDate         DateTime?
  escalationReason      String?
  projectLevel          String?   // DEPARTMENT/FACILITY/CORPORATE/EMERGENCY
  approvalStatus        String    @default("pending")
  currentApprover       String?
  facilityId            String?   // 施設ID（キャッシュ）
  facilityName          String?   // 施設名（キャッシュ）

  // === Relations ===
  proposer              User      @relation("ProposedProjects", fields: [proposerId], references: [id])
  escalator             User?     @relation("ProjectEscalator", fields: [escalatedBy], references: [id])
  approver              User?     @relation("ProjectCurrentApprover", fields: [currentApprover], references: [id])
  teamMembers           ProjectTeamMember[]

  // === Indexes ===
  @@index([proposerId])
  @@index([status])
  @@index([category])
  @@index([isEmergencyEscalated])
  @@index([projectLevel])
  @@index([approvalStatus])
  @@index([facilityId])
  @@index([createdAt])
}
```

**評価**: ✅ **不足フィールドなし**

---

### 2. ProjectTeamMemberテーブル（完全実装済み）

**ファイルパス**: `prisma/schema.prisma` (lines 1866-1883)

```prisma
model ProjectTeamMember {
  id        String    @id @default(cuid())
  projectId String
  userId    String
  role      String    @default("member")  // owner/member
  joinedAt  DateTime  @default(now())
  leftAt    DateTime?  // NULL = アクティブメンバー
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relations
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id])

  // Indexes
  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([role])
  @@index([leftAt])
}
```

**用途**:
- 参加者数集計: `COUNT(*) WHERE leftAt IS NULL`
- 役割判定: `role`フィールドと`proposerId`の組み合わせ
- レベル計算: チームメンバーの部署・施設分布を分析

**評価**: ✅ **不足フィールドなし**

---

### 3. 関連テーブル（Phase 2で使用）

#### 3.1 ProjectApproval（承認履歴）
```prisma
model ProjectApproval {
  id              String    @id @default(cuid())
  projectId       String
  requesterId     String
  approverId      String
  approverLevel   String    // DEPARTMENT_HEAD/FACILITY_HEAD等
  status          String    // pending/approved/rejected
  comment         String?
  approvedAt      DateTime?
  createdAt       DateTime  @default(now())

  @@index([projectId])
  @@index([approverId])
  @@index([status])
}
```

#### 3.2 ProjectLevelHistory（レベル変更履歴）
```prisma
model ProjectLevelHistory {
  id              String    @id @default(cuid())
  projectId       String
  previousLevel   String?
  newLevel        String
  changedBy       String?
  reason          String?
  changedAt       DateTime  @default(now())

  @@index([projectId])
}
```

#### 3.3 EmergencyDeactivation（エスカレーション解除履歴）
```prisma
model EmergencyDeactivation {
  id              String    @id @default(cuid())
  projectId       String
  deescalatedBy   String
  reason          String?
  deescalatedAt   DateTime  @default(now())

  @@index([projectId])
}
```

**評価**: ✅ **Phase 2で使用中**

---

### 4. ProjectSummaryテーブル（Phase 3・未実装）

```prisma
model ProjectSummary {
  id                  String    @id @default(cuid())
  projectId           String    @unique
  totalParticipants   Int       @default(0)
  activeParticipants  Int       @default(0)
  ownerCount          Int       @default(0)
  memberCount         Int       @default(0)
  lastCalculatedAt    DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  project             Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([totalParticipants])
  @@index([activeParticipants])
}
```

**状態**: 🟡 スキーマ定義済み、データ投入待ち
**用途**: 参加者数の事前集計（パフォーマンス最適化）

---

## 🔗 サービス層実装状況

### 実装済みサービス一覧（6サービス）

#### 1. ProjectListService.ts ✅
**ファイルパス**: `src/services/ProjectListService.ts` (368行)

**主要メソッド**:
```typescript
// プロジェクト一覧取得（フィルター対応）
getProjectList(filters: ProjectListFilters, currentUserId: string): Promise<ProjectListItem[]>

// ユーザー統計取得
getProjectStats(currentUserId: string): Promise<ProjectStats>

// プロジェクト詳細取得
getProjectWithDetails(projectId: string, currentUserId: string): Promise<ProjectWithDetails | null>

// 簡易検索
searchProjects(searchTerm: string, limit?: number): Promise<Array<{id, title, description}>>
```

**データフロー**:
```
ProjectListPage
  ↓
getProjectList(filters, userId)
  ↓
並列取得:
  - Projectテーブルクエリ（フィルター適用）
  - getUserProjectRoles(userId, projectIds)  ← 役割判定
  - getFacilitiesFromDepartments(departments) ← 施設名取得
  ↓
データ統合 → ProjectListItem[]
```

---

#### 2. ProjectRoleService.ts ✅
**ファイルパス**: `src/services/ProjectRoleService.ts`

**主要メソッド**:
```typescript
// 単一プロジェクトの役割判定
getUserProjectRole(userId: string, projectId: string): Promise<'owner' | 'participant' | 'viewer'>

// 複数プロジェクトの役割を一括取得（パフォーマンス最適化）
getUserProjectRoles(userId: string, projectIds: string[]): Promise<Record<string, ProjectRole>>

// 参加者数を一括取得
getProjectParticipantCounts(projectIds: string[]): Promise<Record<string, number>>
```

**役割判定ロジック**:
1. `proposerId === userId` → `owner`
2. `ProjectTeamMember.role === 'owner'` → `owner`
3. `ProjectTeamMember.role === 'member'` and `leftAt === null` → `participant`
4. その他 → `viewer`

---

#### 3. MedicalSystemService.ts ✅
**ファイルパス**: `src/services/MedicalSystemService.ts`

**主要メソッド**:
```typescript
// 部署名から施設名を一括取得（24時間キャッシュ）
getFacilitiesFromDepartments(departments: string[]): Promise<Record<string, string>>
```

**実装詳細**:
- 医療システムAPI `GET /api/v2/departments` を呼び出し
- 24時間キャッシュ（Next.js unstable_cache使用）
- Rate Limit対策（100 req/min/IP）

---

#### 4. ProjectLevelEngine.ts ✅
**ファイルパス**: `src/services/ProjectLevelEngine.ts` (344行)

**主要メソッド**:
```typescript
// プロジェクトレベル自動計算
calculateProjectLevel(projectId: string): Promise<ProjectLevelResult>

// プロジェクトレベルDB更新
updateProjectLevel(projectId: string): Promise<void>

// レベル変更履歴記録
trackLevelChange(projectId, previousLevel, newLevel, reason?): Promise<void>

// ユーティリティ
getLevelLabel(level: ProjectLevel): string  // "部署レベル"等
getLevelIcon(level: ProjectLevel): string   // "🏢"等
getProjectLevelStats(userId?: string): Promise<ProjectLevelStats>
```

**レベル判定ロジック**:
1. `isEmergencyEscalated === true` → `EMERGENCY`
2. 複数施設にまたがる → `CORPORATE`
3. 単一施設・複数部署 → `FACILITY`
4. 単一部署 → `DEPARTMENT`

---

#### 5. ProjectApprovalService.ts ✅
**ファイルパス**: `src/services/ProjectApprovalService.ts` (380行)

**主要メソッド**:
```typescript
// 承認情報取得
getProjectApprovalInfo(projectId, currentUserId): Promise<ProjectApprovalInfo>

// 承認リクエスト作成
createApprovalRequest(projectId, requesterId): Promise<ProjectApprovalInfo>

// 承認処理
processApproval(projectId, approverId, action, comment?): Promise<ProjectApprovalInfo>

// 統計
getPendingApprovalsCount(approverId): Promise<number>
getPendingApprovals(approverId): Promise<ProjectApprovalInfo[]>
getApprovalStats(userId): Promise<ApprovalStats>

// ユーティリティ
getApprovalStatusLabel(status: ApprovalStatus): string
```

**承認フロー**:
| レベル | 承認者 | 段階 |
|--------|--------|------|
| DEPARTMENT | 部署長 | 1段階 |
| FACILITY | 部署長 → 施設長 | 2段階 |
| CORPORATE | 施設長 → 人事部長 → 役員 | 3段階 |
| EMERGENCY | 役員 → 理事長 | 2段階 |

---

#### 6. ProjectEscalationService.ts ✅
**ファイルパス**: `src/services/ProjectEscalationService.ts` (403行)

**主要メソッド**:
```typescript
// エスカレーション情報取得
getEscalationInfo(projectId, currentUserId): Promise<EscalationInfo>

// 緊急エスカレーション実行
escalateProject(request: EscalationRequest): Promise<EscalationInfo>

// エスカレーション解除
deescalateProject(request: DeescalationRequest): Promise<EscalationInfo>

// 統計
getEscalatedProjects(filters): Promise<EscalationInfo[]>
getEscalationStats(userId?): Promise<EscalationStats>
```

**権限管理**:
- エスカレーション実行: 施設長以上
- エスカレーション解除: 役員以上のみ

---

## 🔄 データフロー全体図

### Phase 1-2: 現在の実装フロー

```mermaid
sequenceDiagram
    participant User
    participant Page as ProjectListPage
    participant ListService as ProjectListService
    participant RoleService as ProjectRoleService
    participant MedicalService as MedicalSystemService
    participant LevelEngine as ProjectLevelEngine
    participant DB as VoiceDrive DB
    participant API as Medical System API

    User->>Page: ページアクセス（/projects）
    Page->>Page: URLパラメータ解析

    par 統計取得
        Page->>ListService: getProjectStats(userId)
        ListService->>DB: プロジェクト数集計
        DB-->>ListService: 統計データ
        ListService-->>Page: ProjectStats
    and プロジェクト一覧取得
        Page->>ListService: getProjectList(filters, userId)
        ListService->>DB: Projectテーブルクエリ
        DB-->>ListService: プロジェクト配列

        par 役割判定
            ListService->>RoleService: getUserProjectRoles(userId, projectIds)
            RoleService->>DB: ProjectTeamMemberクエリ
            DB-->>RoleService: 役割情報
            RoleService-->>ListService: roleMap
        and 施設名取得
            ListService->>MedicalService: getFacilitiesFromDepartments(departments)
            MedicalService->>MedicalService: キャッシュ確認（24時間）
            alt キャッシュヒット
                MedicalService-->>ListService: facilityMap
            else キャッシュミス
                MedicalService->>API: GET /api/v2/departments
                API-->>MedicalService: 部署マスタ
                MedicalService->>MedicalService: 24時間キャッシュ保存
                MedicalService-->>ListService: facilityMap
            end
        end

        ListService->>ListService: データ統合
        ListService-->>Page: ProjectListItem[]
    end

    Page-->>User: プロジェクト一覧表示
```

---

## 📊 データ項目カタログ（47項目）

### カテゴリ別データ項目一覧

#### 1. 基本情報（9項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `id` | string | Project.id | プロジェクトID |
| `title` | string | Project.title | プロジェクト名 |
| `description` | string | Project.description | 説明文 |
| `status` | enum | Project.status | ステータス（proposed/active/completed/paused） |
| `category` | enum | Project.category | カテゴリー（improvement/community/facility/system） |
| `priority` | enum? | Project.priority | 優先度（high/medium/low/urgent） |
| `progress` | number | Project.progressRate | 進捗率（0-100） |
| `startDate` | string? | Project.startedAt | 開始日 |
| `endDate` | string? | Project.completedAt | 完了日 |

#### 2. チーム情報（2項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `participants` | number | COUNT(ProjectTeamMember) | 参加者数（集計） |
| `myRole` | enum | ProjectRoleService | ユーザーの役割（owner/participant/viewer） |

#### 3. 組織情報（2項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `department` | string | User.department | 提案者の部署名 |
| `facility` | string | MedicalSystemService | 施設名（医療システムAPI） |

#### 4. Phase 2拡張（6項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `projectLevel` | string? | Project.projectLevel | プロジェクトレベル（DEPARTMENT/FACILITY/CORPORATE/EMERGENCY） |
| `isEmergencyEscalated` | boolean | Project.isEmergencyEscalated | 緊急エスカレーション有無 |
| `escalatedBy` | string? | Project.escalatedBy | エスカレーション実行者ID |
| `escalatedDate` | string? | Project.escalatedDate | エスカレーション日時 |
| `approvalStatus` | string | Project.approvalStatus | 承認状態（pending/in_review/approved/rejected） |
| `currentApprover` | string? | Project.currentApprover | 現在の承認者ID |

#### 5. 統計サマリー（4項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `stats.active` | number | COUNT(Project) | 参加中のプロジェクト数 |
| `stats.completed` | number | COUNT(Project) | 完了済みプロジェクト数 |
| `stats.proposed` | number | COUNT(Project) | 提案中のプロジェクト数 |
| `stats.owned` | number | COUNT(Project) | オーナープロジェクト数 |

#### 6. フィルター（4項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `searchTerm` | string | React state | 検索キーワード |
| `filterStatus` | enum | React state | ステータスフィルター |
| `filterCategory` | enum | React state | カテゴリーフィルター |
| `filterLevel` | enum | React state | レベルフィルター |

#### 7. UI状態（3項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `loading` | boolean | React state | 読み込み中フラグ |
| `error` | string? | React state | エラーメッセージ |
| `projects` | array | React state | プロジェクト一覧配列 |

#### 8. 内部管理用（17項目）
| 項目名 | 型 | データソース | 説明 |
|--------|---|------------|------|
| `proposerId` | string | Project.proposerId | 提案者ID |
| `createdAt` | DateTime | Project.createdAt | 作成日時 |
| `updatedAt` | DateTime | Project.updatedAt | 更新日時 |
| `escalationReason` | string? | Project.escalationReason | エスカレーション理由 |
| `facilityId` | string? | Project.facilityId | 施設ID（キャッシュ） |
| `facilityName` | string? | Project.facilityName | 施設名（キャッシュ） |
| その他 | - | - | 11項目（ProjectTeamMember、承認履歴等） |

---

## ✅ 実装完了度チェックリスト

### Phase 1: 基本機能（✅ 100%完了）

#### データベース
- [x] Projectテーブル確認
- [x] ProjectTeamMemberテーブル確認
- [x] 全必要フィールド存在確認

#### サービス実装
- [x] ProjectListService.ts実装
  - [x] getProjectList()実装
  - [x] getProjectStats()実装
  - [x] getProjectWithDetails()実装
  - [x] searchProjects()実装
- [x] ProjectRoleService.ts実装
  - [x] getUserProjectRole()実装
  - [x] getUserProjectRoles()実装
  - [x] getProjectParticipantCounts()実装
- [x] MedicalSystemService.ts実装
  - [x] getFacilitiesFromDepartments()実装
  - [x] 24時間キャッシュ実装

#### ページ実装
- [x] ProjectListPage.tsx実装
  - [x] URLパラメータ解析
  - [x] 検索機能実装
  - [x] 4つのフィルター実装
  - [x] 統計サマリー表示
  - [x] プロジェクトカード表示
  - [x] ローディング・エラー状態表示

#### 医療システム連携
- [x] 部署マスタAPI統合
- [x] API Key認証設定
- [x] Rate Limit対策（キャッシュ）

---

### Phase 2: レベル・承認機能（✅ 100%完了）

#### データベース
- [x] Projectテーブル拡張フィールド追加
  - [x] isEmergencyEscalated
  - [x] escalatedBy
  - [x] escalatedDate
  - [x] escalationReason
  - [x] projectLevel
  - [x] approvalStatus
  - [x] currentApprover
  - [x] facilityId
  - [x] facilityName
- [x] インデックス追加
- [x] リレーション追加（escalator, approver）

#### サービス実装
- [x] ProjectLevelEngine.ts実装（344行）
  - [x] calculateProjectLevel()実装
  - [x] updateProjectLevel()実装
  - [x] trackLevelChange()実装
  - [x] getLevelLabel()実装
  - [x] getLevelIcon()実装
  - [x] getProjectLevelStats()実装
- [x] ProjectApprovalService.ts実装（380行）
  - [x] getProjectApprovalInfo()実装
  - [x] createApprovalRequest()実装
  - [x] processApproval()実装
  - [x] getPendingApprovalsCount()実装
  - [x] getPendingApprovals()実装
  - [x] getApprovalStats()実装
- [x] ProjectEscalationService.ts実装（403行）
  - [x] getEscalationInfo()実装
  - [x] escalateProject()実装
  - [x] deescalateProject()実装
  - [x] getEscalatedProjects()実装
  - [x] getEscalationStats()実装

#### ページ実装
- [x] ProjectListPage.tsx拡張
  - [x] レベルフィルター実装
  - [x] プロジェクトレベル表示（アイコン付き）
  - [x] 承認状態バッジ表示
  - [x] 緊急エスカレーション表示

---

### Phase 3: パフォーマンス最適化（🟡 20%完了）

#### データベース
- [ ] ProjectSummaryテーブル作成
  - [x] スキーマ定義済み
  - [ ] マイグレーション実行
  - [ ] インデックス追加

#### サービス実装
- [ ] ProjectSummaryService.ts実装
  - [ ] calculateProjectSummary()実装
  - [ ] calculateAllProjectSummaries()実装（日次バッチ）
- [ ] ProjectListService.ts最適化
  - [ ] ProjectSummary優先取得
  - [ ] フォールバック処理（リアルタイム計算）

#### バッチ処理
- [ ] 日次バッチスクリプト作成
- [ ] cron設定
- [ ] バッチ実行ログ
- [ ] エラーハンドリング

---

## 🔴 不足項目・ギャップ分析

### 結論: **不足項目なし**

#### データベーススキーマ
✅ **全フィールド実装済み**
- Projectテーブル: 全19フィールド存在
- ProjectTeamMemberテーブル: 全8フィールド存在
- 関連テーブル: ProjectApproval, ProjectLevelHistory, EmergencyDeactivation全て存在

#### サービス層
✅ **全サービス実装済み**
- ProjectListService: 完全実装
- ProjectRoleService: 完全実装
- MedicalSystemService: 完全実装
- ProjectLevelEngine: 完全実装
- ProjectApprovalService: 完全実装
- ProjectEscalationService: 完全実装

#### 医療システムAPI連携
✅ **完全統合済み**
- 部署マスタAPI: 統合済み
- 24時間キャッシュ: 実装済み
- Rate Limit対策: 完了

#### UI実装
✅ **完全実装済み**
- 検索・フィルター: 完全実装
- 統計サマリー: 完全実装
- プロジェクトカード: 完全実装
- レベル・承認表示: 完全実装

---

## 🎯 Phase 3実装推奨事項

### Phase 3: パフォーマンス最適化

**目的**: 1000+プロジェクト規模でのパフォーマンス改善

#### 1. ProjectSummaryテーブルのマイグレーション
```bash
# Prismaマイグレーション実行
npx prisma migrate dev --name add_project_summary_table
npx prisma generate
```

#### 2. 日次バッチ処理の実装
```typescript
// src/jobs/calculateProjectSummary.ts
export async function calculateAllProjectSummaries() {
  const projects = await prisma.project.findMany();

  for (const project of projects) {
    const teamMembers = await prisma.projectTeamMember.findMany({
      where: { projectId: project.id }
    });

    const totalParticipants = teamMembers.length + 1; // +1 for proposer
    const activeParticipants = teamMembers.filter(m => m.leftAt === null).length + 1;
    const ownerCount = teamMembers.filter(m => m.role === 'owner').length;
    const memberCount = teamMembers.filter(m => m.role === 'member').length;

    await prisma.projectSummary.upsert({
      where: { projectId: project.id },
      create: {
        projectId: project.id,
        totalParticipants,
        activeParticipants,
        ownerCount,
        memberCount,
        lastCalculatedAt: new Date()
      },
      update: {
        totalParticipants,
        activeParticipants,
        ownerCount,
        memberCount,
        lastCalculatedAt: new Date()
      }
    });
  }
}
```

#### 3. ProjectListServiceの最適化
```typescript
// src/services/ProjectListService.ts
export async function getProjectList(
  filters: ProjectListFilters,
  currentUserId: string
): Promise<ProjectListItem[]> {
  // ... 既存のプロジェクト取得ロジック

  // Phase 3: ProjectSummaryを優先的に使用
  const summaryMap = await getMultipleProjectSummaries(projectIds); // キャッシュ優先

  // フォールバック: サマリーが存在しない場合はリアルタイム計算
  const participantCountMap: Record<string, number> = {};
  projectIds.forEach((id: string) => {
    participantCountMap[id] = summaryMap[id]?.activeParticipants || 1;
  });

  // ...
}
```

**推定工数**: 2-3日

---

## 📝 まとめ

### データ管理責任の最終確認

#### VoiceDrive側（100%管理）
- ✅ プロジェクト基本情報
- ✅ プロジェクトレベル
- ✅ 承認状態・承認履歴
- ✅ 緊急エスカレーション
- ✅ チームメンバー管理
- ✅ 参加者数集計
- ✅ 進捗管理

#### 医療システム側（APIのみ提供）
- ✅ 部署マスタAPI（実装済み）
- ✅ 施設マスタAPI（実装済み）
- ❌ プロジェクトデータの管理なし

### 実装完了度

| Phase | 完了度 | 状態 |
|-------|--------|------|
| Phase 1: 基本機能 | 100% | ✅ 完了 |
| Phase 2: レベル・承認 | 100% | ✅ 完了 |
| Phase 3: パフォーマンス最適化 | 20% | 🟡 スキーマ定義済み |

### schema.prisma更新の必要性

**結論**: ❌ **更新不要**

全ての必要フィールドが既に存在しており、schema.prismaの更新は必要ありません。

Phase 3実装時にProjectSummaryテーブルのマイグレーションを実行する必要がありますが、スキーマ定義は既に完了しています。

---

## 🔗 関連ドキュメント

1. [Projects暫定マスターリスト_20251026.md](./Projects暫定マスターリスト_20251026.md) - データ項目カタログ
2. [ProjectListPage_DB要件分析_20251026.md](./ProjectListPage_DB要件分析_20251026.md) - 議題モード分析（参考）
3. [ProjectListPage_医療システム確認結果_20251026.md](./ProjectListPage_医療システム確認結果_20251026.md) - 医療システムAPI確認結果
4. [ProjectListPage_Phase2実装完了報告_20251026.md](./ProjectListPage_Phase2実装完了報告_20251026.md) - Phase 2実装報告
5. [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ管理責任の定義

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: Phase 3実装開始時
