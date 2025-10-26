# ProjectListPage 暫定マスターリスト

**文書番号**: MASTER-2025-1026-002
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/ ProjectListPage
**参照文書**: [ProjectListPage_DB要件分析_20251026.md](./ProjectListPage_DB要件分析_20251026.md)

---

## 📋 概要

ProjectListPageの実装に必要なテーブル・フィールド・APIの暫定マスターリストです。
DB要件分析に基づき、**VoiceDrive側**と**医療システム側**で実装すべき項目を整理しました。

---

## 🗂️ VoiceDrive側 テーブル・フィールド一覧

### 1. Projectテーブル（既存テーブルの拡張）

#### 🔴 Phase 1: 必須フィールド（既存のまま使用可能）

| フィールド名 | 型 | デフォルト値 | 説明 | 状態 |
|-----------|---|------------|------|------|
| `id` | String | cuid() | プロジェクトID | ✅ 既存 |
| `title` | String | - | プロジェクト名 | ✅ 既存 |
| `description` | String | - | 説明文 | ✅ 既存 |
| `category` | String | - | カテゴリー（improvement/community/facility/system） | ✅ 既存 |
| `proposerId` | String | - | 提案者ID | ✅ 既存 |
| `status` | String | "proposed" | ステータス（proposed/active/completed/paused） | ✅ 既存 |
| `priority` | String? | null | 優先度（high/medium/low/urgent） | ✅ 既存 |
| `progressRate` | Float | 0 | 進捗率（0-100） | ✅ 既存 |
| `startedAt` | DateTime? | null | 開始日 | ✅ 既存 |
| `completedAt` | DateTime? | null | 完了日 | ✅ 既存 |
| `createdAt` | DateTime | now() | 作成日時 | ✅ 既存 |
| `updatedAt` | DateTime | - | 更新日時 | ✅ 既存 |

---

#### 🔴 Phase 2: 追加必須フィールド（緊急エスカレーション・承認）

| フィールド名 | 型 | デフォルト値 | NULL許可 | 説明 | マイグレーション |
|-----------|---|------------|---------|------|---------------|
| `isEmergencyEscalated` | Boolean | false | ❌ | 緊急エスカレーション有無 | 🔴 **要追加** |
| `escalatedBy` | String? | null | ✅ | エスカレーション実行者ID | 🔴 **要追加** |
| `escalatedDate` | DateTime? | null | ✅ | エスカレーション日時 | 🔴 **要追加** |
| `escalationReason` | String? | null | ✅ | エスカレーション理由 | 🔴 **要追加** |
| `projectLevel` | String? | null | ✅ | プロジェクトレベル（DEPARTMENT/FACILITY/CORPORATE/EMERGENCY） | 🔴 **要追加** |
| `approvalStatus` | String | "pending" | ❌ | 承認状態（pending/in_review/approved/rejected） | 🔴 **要追加** |
| `currentApprover` | String? | null | ✅ | 現在の承認者ID | 🔴 **要追加** |
| `facilityId` | String? | null | ✅ | 施設ID（キャッシュ） | 🔴 **要追加** |
| `facilityName` | String? | null | ✅ | 施設名（キャッシュ） | 🔴 **要追加** |

**マイグレーションSQL**:
```sql
-- Phase 2: プロジェクトテーブル拡張
ALTER TABLE projects ADD COLUMN is_emergency_escalated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN escalated_by TEXT;
ALTER TABLE projects ADD COLUMN escalated_date TIMESTAMP;
ALTER TABLE projects ADD COLUMN escalation_reason TEXT;
ALTER TABLE projects ADD COLUMN project_level TEXT;
ALTER TABLE projects ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN current_approver TEXT;
ALTER TABLE projects ADD COLUMN facility_id TEXT;
ALTER TABLE projects ADD COLUMN facility_name TEXT;

-- インデックス追加
CREATE INDEX idx_projects_is_emergency_escalated ON projects(is_emergency_escalated);
CREATE INDEX idx_projects_project_level ON projects(project_level);
CREATE INDEX idx_projects_approval_status ON projects(approval_status);
CREATE INDEX idx_projects_facility_id ON projects(facility_id);
```

---

### 2. ProjectTeamMemberテーブル（既存）

| フィールド名 | 型 | デフォルト値 | 説明 | 状態 |
|-----------|---|------------|------|------|
| `id` | String | cuid() | メンバーID | ✅ 既存 |
| `projectId` | String | - | プロジェクトID | ✅ 既存 |
| `userId` | String | - | ユーザーID | ✅ 既存 |
| `role` | String | "member" | 役割（owner/member） | ✅ 既存 |
| `joinedAt` | DateTime | now() | 参加日時 | ✅ 既存 |
| `leftAt` | DateTime? | null | 退出日時 | ✅ 既存 |
| `createdAt` | DateTime | now() | 作成日時 | ✅ 既存 |
| `updatedAt` | DateTime | - | 更新日時 | ✅ 既存 |

**評価**: ✅ 追加不要（既存のまま使用可能）

---

### 3. ProjectSummaryテーブル（新規）🟡 Phase 3

| フィールド名 | 型 | デフォルト値 | NULL許可 | 説明 | マイグレーション |
|-----------|---|------------|---------|------|---------------|
| `id` | String | cuid() | ❌ | サマリーID | 🟡 **Phase 3で追加** |
| `projectId` | String | - | ❌ | プロジェクトID（UNIQUE） | 🟡 **Phase 3で追加** |
| `totalParticipants` | Int | 0 | ❌ | 総参加者数 | 🟡 **Phase 3で追加** |
| `activeParticipants` | Int | 0 | ❌ | アクティブ参加者数 | 🟡 **Phase 3で追加** |
| `ownerCount` | Int | 0 | ❌ | オーナー数 | 🟡 **Phase 3で追加** |
| `memberCount` | Int | 0 | ❌ | メンバー数 | 🟡 **Phase 3で追加** |
| `lastCalculatedAt` | DateTime | now() | ❌ | 最終集計日時 | 🟡 **Phase 3で追加** |
| `updatedAt` | DateTime | - | ❌ | 更新日時 | 🟡 **Phase 3で追加** |

**マイグレーションSQL**:
```sql
-- Phase 3: プロジェクトサマリーテーブル作成
CREATE TABLE project_summaries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  total_participants INTEGER NOT NULL DEFAULT 0,
  active_participants INTEGER NOT NULL DEFAULT 0,
  owner_count INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- インデックス追加
CREATE INDEX idx_project_summaries_total_participants ON project_summaries(total_participants);
CREATE INDEX idx_project_summaries_project_id ON project_summaries(project_id);
```

---

### 4. Userモデルへのリレーション追加

#### 🔴 Phase 2: 追加リレーション

```prisma
model User {
  // ... 既存フィールド

  // 🆕 プロジェクト関連リレーション
  escalatedProjects     Project[]  @relation("ProjectEscalator")
  approvingProjects     Project[]  @relation("ProjectCurrentApprover")
}
```

**評価**: schema.prismaのみ変更、マイグレーション不要

---

## 🔧 VoiceDrive側 サービス・API一覧

### 1. ProjectRoleService（新規）🔴 Phase 1

**ファイル**: `src/services/ProjectRoleService.ts`

#### メソッド一覧

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `getUserProjectRole` | userId, projectId | `'owner' \| 'participant' \| 'viewer'` | ユーザーのプロジェクト内役割を判定 |
| `getUserProjects` | userId | `{ owned: Project[], participated: Project[], viewed: Project[] }` | ユーザーのプロジェクト一覧を役割別に取得 |
| `getProjectParticipants` | projectId | `{ owners: User[], members: User[] }` | プロジェクトの参加者一覧を取得 |

**実装例**:
```typescript
// src/services/ProjectRoleService.ts
export async function getUserProjectRole(
  userId: string,
  projectId: string
): Promise<'owner' | 'participant' | 'viewer'> {
  // プロジェクト提案者かチェック
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { proposerId: true }
  });

  if (project?.proposerId === userId) {
    return 'owner';
  }

  // チームメンバーかチェック
  const membership = await prisma.projectTeamMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  if (membership && membership.leftAt === null) {
    return membership.role === 'owner' ? 'owner' : 'participant';
  }

  return 'viewer';
}
```

---

### 2. ProjectListService（新規）🔴 Phase 1

**ファイル**: `src/services/ProjectListService.ts`

#### メソッド一覧

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `getProjectList` | filters, currentUserId | `ProjectListItem[]` | プロジェクト一覧を取得（フィルター対応） |
| `getProjectStats` | currentUserId | `{ active: number, completed: number, proposed: number, owned: number }` | ユーザーのプロジェクト統計を取得 |
| `getProjectWithDetails` | projectId, currentUserId | `ProjectWithDetails` | プロジェクト詳細を取得 |

**実装例**:
```typescript
// src/services/ProjectListService.ts
export async function getProjectList(
  filters: {
    searchTerm?: string;
    status?: 'all' | 'active' | 'completed' | 'proposed';
    category?: 'all' | 'improvement' | 'community' | 'facility' | 'system';
    level?: 'all' | 'DEPARTMENT' | 'FACILITY' | 'CORPORATE' | 'EMERGENCY';
  },
  currentUserId: string
): Promise<ProjectListItem[]> {
  // Projectテーブルから取得
  const projects = await prisma.project.findMany({
    where: {
      AND: [
        // 検索条件
        filters.searchTerm ? {
          OR: [
            { title: { contains: filters.searchTerm } },
            { description: { contains: filters.searchTerm } }
          ]
        } : {},
        // ステータスフィルター
        filters.status && filters.status !== 'all' ? {
          status: filters.status
        } : {},
        // カテゴリーフィルター
        filters.category && filters.category !== 'all' ? {
          category: filters.category
        } : {},
        // レベルフィルター
        filters.level && filters.level !== 'all' ? {
          projectLevel: filters.level
        } : {}
      ]
    },
    include: {
      proposer: true,
      teamMembers: {
        where: { leftAt: null },
        include: { user: true }
      }
    }
  });

  // 各プロジェクトの役割を判定
  const projectsWithRole = await Promise.all(
    projects.map(async (project) => {
      const myRole = await getUserProjectRole(currentUserId, project.id);
      const participants = project.teamMembers.length + 1; // 提案者含む

      return {
        ...project,
        myRole,
        participants,
        facility: project.facilityName || '未設定',
        progress: project.progressRate,
        startDate: project.startedAt?.toISOString() || null,
        endDate: project.completedAt?.toISOString() || null
      };
    })
  );

  return projectsWithRole;
}
```

---

### 3. ProjectLevelCalculator（既存利用）🔴 Phase 2

**ファイル**: `src/services/ProjectLevelEngine.ts` （既存）

#### メソッド一覧

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `calculateProjectLevel` | project | `ProjectLevel` | プロジェクトレベルを計算 |
| `updateProjectLevel` | projectId | `void` | プロジェクトレベルを更新 |

**評価**: ✅ 既存のProjectLevelEngineを利用可能

---

### 4. ProjectSummaryCalculator（新規）🟡 Phase 3

**ファイル**: `src/jobs/calculateProjectSummary.ts`

#### メソッド一覧

| メソッド名 | 引数 | 戻り値 | 説明 |
|----------|------|-------|------|
| `calculateProjectSummary` | projectId | `ProjectSummary` | プロジェクトサマリーを計算 |
| `calculateAllProjectSummaries` | - | `void` | 全プロジェクトのサマリーを計算（日次バッチ） |

**実装例**:
```typescript
// src/jobs/calculateProjectSummary.ts
export async function calculateProjectSummary(projectId: string) {
  const teamMembers = await prisma.projectTeamMember.findMany({
    where: { projectId }
  });

  const totalParticipants = teamMembers.length;
  const activeParticipants = teamMembers.filter(m => m.leftAt === null).length;
  const ownerCount = teamMembers.filter(m => m.role === 'owner').length;
  const memberCount = teamMembers.filter(m => m.role === 'member').length;

  await prisma.projectSummary.upsert({
    where: { projectId },
    create: {
      projectId,
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
```

---

## 🏥 医療システム側 API一覧

### 1. 部署マスタAPI 🔴 Phase 1

**エンドポイント**: `GET /api/departments/{departmentId}`

**レスポンス**:
```json
{
  "departmentId": "DEPT-001",
  "departmentName": "リハビリテーション科",
  "departmentCode": "REHAB-01",
  "facilityId": "FAC-001",
  "facilityName": "立神リハ温泉病院",
  "facilityCode": "TATEGAMI",
  "isActive": true
}
```

**用途**:
- プロジェクト提案者の部署から施設を特定
- ProjectListPageでの施設表示

---

### 2. 施設マスタAPI 🔴 Phase 1

**エンドポイント**: `GET /api/facilities/{facilityId}`

**レスポンス**:
```json
{
  "facilityId": "FAC-001",
  "facilityCode": "TATEGAMI",
  "facilityName": "立神リハ温泉病院",
  "facilityType": "rehabilitation_hospital",
  "totalStaffCount": 150,
  "totalBedCount": 120,
  "address": "鹿児島県霧島市",
  "establishedYear": 1985,
  "corporationId": "CORP-001",
  "isActive": true
}
```

**用途**:
- 施設情報の詳細取得
- ProjectListPageでの施設フィルタリング

---

### 3. 部署一覧API 🔴 Phase 1

**エンドポイント**: `GET /api/departments`

**クエリパラメータ**:
- `facilityId`: 施設IDでフィルター
- `isActive`: アクティブな部署のみ（デフォルト: true）

**レスポンス**:
```json
{
  "departments": [
    {
      "departmentId": "DEPT-001",
      "departmentName": "リハビリテーション科",
      "facilityId": "FAC-001",
      "facilityName": "立神リハ温泉病院"
    },
    // ...
  ],
  "totalCount": 25
}
```

**用途**:
- 部署マスタのキャッシュ
- 施設マッピングテーブルの構築

---

## 📊 データフロー図

### Phase 1: 基本的な表示

```
ProjectListPage
  ↓
ProjectListService.getProjectList()
  ↓
┌─────────────────────────────────────┐
│ VoiceDrive DB                       │
├─────────────────────────────────────┤
│ • Project（基本情報）                │
│ • ProjectTeamMember（参加者集計）   │
│ • User（提案者情報）                 │
└─────────────────────────────────────┘
  ↓
ProjectRoleService.getUserProjectRole()
  ↓
医療システムAPI
  ↓
GET /api/departments/{departmentId}
  ↓
施設名取得
```

### Phase 2: レベル・承認機能

```
ProjectListPage
  ↓
ProjectListService.getProjectList()
  ↓
┌─────────────────────────────────────┐
│ VoiceDrive DB（拡張）                │
├─────────────────────────────────────┤
│ • Project（拡張フィールド）           │
│   - projectLevel                    │
│   - approvalStatus                  │
│   - isEmergencyEscalated            │
│ • ProjectApproval（承認履歴）        │
└─────────────────────────────────────┘
  ↓
ProjectLevelEngine.calculateProjectLevel()
```

### Phase 3: パフォーマンス最適化

```
ProjectListPage
  ↓
ProjectListService.getProjectList()
  ↓
┌─────────────────────────────────────┐
│ VoiceDrive DB（最適化）              │
├─────────────────────────────────────┤
│ • ProjectSummary（事前集計）         │
│   ← 日次バッチで更新                 │
└─────────────────────────────────────┘
```

---

## ✅ 実装チェックリスト

### Phase 1: 基本的な表示（1-2日）

#### VoiceDrive側

**データベース**:
- [ ] 既存のProjectテーブル確認
- [ ] 既存のProjectTeamMemberテーブル確認

**サービス実装**:
- [ ] ProjectRoleService.ts作成
  - [ ] getUserProjectRole()実装
  - [ ] getUserProjects()実装
  - [ ] getProjectParticipants()実装
- [ ] ProjectListService.ts作成
  - [ ] getProjectList()実装
  - [ ] getProjectStats()実装
  - [ ] getProjectWithDetails()実装

**ページ実装**:
- [ ] ProjectListPage.tsx修正
  - [ ] モックデータ削除
  - [ ] ProjectListService呼び出し
  - [ ] 実データ表示確認

**テスト**:
- [ ] ProjectRoleServiceの単体テスト
- [ ] ProjectListServiceの単体テスト
- [ ] ProjectListPageのE2Eテスト

#### 医療システム側

**API実装**:
- [ ] GET /api/departments/{departmentId}実装
- [ ] GET /api/facilities/{facilityId}実装
- [ ] GET /api/departments実装

**テスト**:
- [ ] 部署マスタAPIのテスト
- [ ] 施設マスタAPIのテスト

---

### Phase 2: レベル・承認機能（2-3日）

#### VoiceDrive側

**データベース**:
- [ ] Projectテーブルにフィールド追加
  - [ ] isEmergencyEscalated
  - [ ] escalatedBy
  - [ ] escalatedDate
  - [ ] escalationReason
  - [ ] projectLevel
  - [ ] approvalStatus
  - [ ] currentApprover
  - [ ] facilityId
  - [ ] facilityName
- [ ] マイグレーション実行
- [ ] インデックス追加

**サービス実装**:
- [ ] ProjectLevelEngine利用設定
- [ ] ProjectApprovalService実装
- [ ] 承認フロー取得ロジック実装

**ページ実装**:
- [ ] ProjectListPage.tsx拡張
  - [ ] レベルフィルター実装
  - [ ] 承認状態表示
  - [ ] 緊急エスカレーション表示

**テスト**:
- [ ] プロジェクトレベル計算のテスト
- [ ] 承認フロー取得のテスト
- [ ] レベルフィルターのE2Eテスト

---

### Phase 3: パフォーマンス最適化（1-2日）

#### VoiceDrive側

**データベース**:
- [ ] ProjectSummaryテーブル作成
- [ ] マイグレーション実行
- [ ] インデックス追加

**サービス実装**:
- [ ] ProjectSummaryCalculator実装
  - [ ] calculateProjectSummary()実装
  - [ ] calculateAllProjectSummaries()実装
- [ ] 日次バッチ設定

**ページ実装**:
- [ ] ProjectListService最適化
  - [ ] ProjectSummary優先取得
  - [ ] フォールバック処理

**テスト**:
- [ ] ProjectSummary集計のテスト
- [ ] 日次バッチのテスト
- [ ] パフォーマンステスト（1000プロジェクト）

---

## 🔗 関連ドキュメント

- [ProjectListPage_DB要件分析_20251026.md](./ProjectListPage_DB要件分析_20251026.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: Phase 1実装開始時
