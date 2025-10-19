# MyProjectsPage 暫定マスターリスト

**作成日**: 2025年10月19日
**対象ページ**: MyProjectsPage (`src/pages/MyProjectsPage.tsx`)
**目的**: プロジェクト管理機能のDB実装要件を明確化し、デモデータから本番DBへの移行を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- MyProjectsPageはユーザーが関わるプロジェクトを4つのカテゴリで表示（提案/承認待ち/参加中/仮選出中）
- **現在は完全にデモデータで動作**（`src/data/demo/projects.ts`）
- **Prisma schema上にProjectテーブルが存在しない**

### 必要な対応
1. **VoiceDrive DB追加**: テーブル5件（Project, ProjectTeamMember, ProjectProvisionalMember, ProjectWorkflowStage, ProjectMilestone）
2. **医療システムからの依頼**: なし（プロジェクト管理は100%VoiceDrive管轄）

### 優先度
**Priority: HIGH（プロジェクト管理コア機能）**

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### A. 新規テーブル追加（5件）

#### Table-1: Project（プロジェクトマスタ）

**優先度**: 🔴 **CRITICAL**

**理由**:
- MyProjectsPage全体の基盤となるテーブル
- 統計カード、プロジェクト一覧表示に必須
- 現在完全にデモデータ（src/data/demo/projects.ts）

**スキーマ定義**:
```prisma
model Project {
  id                    String    @id @default(cuid())
  title                 String
  description           String    @db.Text
  status                ProjectStatus
  priority              ProjectPriority?
  category              ProjectCategory?

  // 提案元情報
  createdBy             String    @map("created_by")
  createdByName         String?   @map("created_by_name")
  originalPostId        String?   @map("original_post_id")

  // 期間
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  startDate             DateTime? @map("start_date")
  targetDate            DateTime? @map("target_date")
  actualEndDate         DateTime? @map("actual_end_date")

  // プロジェクト規模
  budget                Int?
  actualCost            Int?      @default(0) @map("actual_cost")
  roi                   Float?    @default(0)

  // スコアリング
  impactScore           Int?      @map("impact_score")
  feasibilityScore      Int?      @map("feasibility_score")
  alignmentScore        Int?      @map("alignment_score")
  totalScore            Int?      @map("total_score")

  // メンバー選出状態
  memberSelectionStatus MemberSelectionStatus?  @map("member_selection_status")

  // 投票情報
  votingDeadline        DateTime? @map("voting_deadline")
  requiredVotes         Int?      @map("required_votes")
  currentVotes          Int?      @default(0) @map("current_votes")
  approvalPercentage    Float?    @map("approval_percentage")

  // フェーズ
  currentPhase          String?   @map("current_phase")

  // 組織情報
  visibility            String?
  department            String?
  facilityId            String?   @map("facility_id")
  tags                  String[]  @default([])

  // Relations
  creator               User      @relation(fields: [createdBy], references: [id])
  teamMembers           ProjectTeamMember[]
  provisionalMembers    ProjectProvisionalMember[]
  workflowStages        ProjectWorkflowStage[]
  milestones            ProjectMilestone[]

  @@index([createdBy])
  @@index([status])
  @@index([facilityId])
  @@index([memberSelectionStatus])
  @@index([createdAt])
  @@map("projects")
}

enum ProjectStatus {
  draft
  submitted
  reviewing
  approved
  in_progress
  completed
  rejected
  member_selection
  approval_pending
}

enum ProjectPriority {
  low
  medium
  high
  urgent
}

enum ProjectCategory {
  employee_welfare
  innovation
  improvement
  safety
  training
  equipment
}

enum MemberSelectionStatus {
  not_started
  in_progress
  completed
}
```

**使用例（MyProjectsPage.tsx）**:
```typescript
// 42-43行目: 提案済みプロジェクト
const proposedProjects = await prisma.project.findMany({
  where: { createdBy: activeUser.id }
});

// 統計カード表示
<p>{proposedProjects.length}</p>
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_project_tables
```

---

#### Table-2: ProjectTeamMember（プロジェクトチームメンバー）

**優先度**: 🔴 **CRITICAL**

**理由**:
- 「参加中プロジェクト」の判定に必須（MyProjectsPage.tsx 53-58行目）
- チームメンバー情報の表示

**スキーマ定義**:
```prisma
model ProjectTeamMember {
  id            String    @id @default(cuid())
  projectId     String    @map("project_id")
  userId        String    @map("user_id")
  userName      String?   @map("user_name")
  role          String
  joinedAt      DateTime  @default(now()) @map("joined_at")
  contribution  Float     @default(0)
  isProvisional Boolean   @default(false) @map("is_provisional")

  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user          User      @relation(fields: [userId], references: [id])

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@map("project_team_members")
}
```

**使用例（MyProjectsPage.tsx 53-58行目）**:
```typescript
const participatingProjects = await prisma.project.findMany({
  where: {
    teamMembers: {
      some: { userId: activeUser.id }
    },
    status: { notIn: ['completed', 'rejected'] }
  },
  include: { teamMembers: true }
});
```

---

#### Table-3: ProjectProvisionalMember（仮選出メンバー）

**優先度**: 🔴 **CRITICAL**

**理由**:
- 「仮選出中プロジェクト」の判定に必須（MyProjectsPage.tsx 60-64行目）
- 仮選出メンバー数の表示（311-315行目）

**スキーマ定義**:
```prisma
model ProjectProvisionalMember {
  id          String    @id @default(cuid())
  projectId   String    @map("project_id")
  userId      String    @map("user_id")
  userName    String?   @map("user_name")
  nominatedAt DateTime  @default(now()) @map("nominated_at")
  nominatedBy String?   @map("nominated_by")
  status      ProvisionalMemberStatus  @default(pending)
  respondedAt DateTime? @map("responded_at")

  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id])

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([status])
  @@map("project_provisional_members")
}

enum ProvisionalMemberStatus {
  pending
  accepted
  declined
  expired
}
```

**使用例（MyProjectsPage.tsx 60-64行目）**:
```typescript
const provisionalProjects = await prisma.project.findMany({
  where: {
    provisionalMembers: {
      some: { userId: activeUser.id }
    },
    memberSelectionStatus: 'in_progress'
  },
  include: { provisionalMembers: true }
});
```

---

#### Table-4: ProjectWorkflowStage（承認フロー）

**優先度**: 🔴 **CRITICAL**

**理由**:
- 「承認待ちプロジェクト」の判定に必須（MyProjectsPage.tsx 45-51行目）
- 現在の承認フロー状態表示（282-309行目）

**スキーマ定義**:
```prisma
model ProjectWorkflowStage {
  id              String    @id @default(cuid())
  projectId       String    @map("project_id")
  name            String
  status          WorkflowStageStatus
  approver        String?
  approverName    String?   @map("approver_name")
  completedAt     DateTime? @map("completed_at")
  comments        String?   @db.Text
  order           Int       @default(0)

  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([status])
  @@index([approver])
  @@map("project_workflow_stages")
}

enum WorkflowStageStatus {
  pending
  in_progress
  completed
  rejected
  skipped
}
```

**使用例（MyProjectsPage.tsx 45-51行目）**:
```typescript
const approvingProjects = await prisma.project.findMany({
  where: {
    workflowStages: {
      some: {
        approver: activeUser.id,
        status: 'in_progress'
      }
    }
  },
  include: { workflowStages: true }
});
```

---

#### Table-5: ProjectMilestone（マイルストーン）

**優先度**: 🟡 **RECOMMENDED**

**理由**:
- demoProjectsに存在するmilestonesデータ
- プロジェクト詳細画面で必要
- 進捗管理機能の基盤

**スキーマ定義**:
```prisma
model ProjectMilestone {
  id              String    @id @default(cuid())
  projectId       String    @map("project_id")
  title           String
  description     String?   @db.Text
  dueDate         DateTime  @map("due_date")
  completed       Boolean   @default(false)
  completedDate   DateTime? @map("completed_date")
  assignedTo      String[]  @map("assigned_to")

  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([dueDate])
  @@index([completed])
  @@map("project_milestones")
}
```

---

### B. 既存テーブル修正（1件）

#### Modify-1: Userテーブルにプロジェクト関連リレーション追加

**対象テーブル**: `User`

**追加リレーション**:
```prisma
model User {
  // ... 既存フィールド

  // 🆕 プロジェクト関連リレーション
  createdProjects       Project[]               @relation("CreatedProjects")
  projectTeamMembers    ProjectTeamMember[]
  projectProvisional    ProjectProvisionalMember[]
}
```

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（3-5日）

**目標**: MyProjectsPageが基本的に動作する

**作業内容**:
1. 🔴 Projectテーブル追加（Prisma schema）
2. 🔴 ProjectTeamMemberテーブル追加
3. 🔴 ProjectWorkflowStageテーブル追加
4. 🔴 ProjectProvisionalMemberテーブル追加
5. 🔴 Prisma migrate実行
6. 🔴 Project CRUD API実装
   - GET /api/projects（一覧取得）
   - GET /api/projects/:id（詳細取得）
   - POST /api/projects（新規作成）
   - PUT /api/projects/:id（更新）
   - DELETE /api/projects/:id（削除）
7. 🔴 MyProjectsPageの修正
   - demoProjects削除
   - API統合
   - エラーハンドリング

**このPhaseで動作する機能**:
- ✅ 統計カード（実データ）
- ✅ プロジェクト一覧（実データ）
- ✅ プロジェクトグループ分け（実データ）
- ✅ ステータスバッジ（実データ）

---

### Phase 2: マイルストーン対応（2-3日）

**目標**: プロジェクト進捗管理が可能になる

**作業内容**:
1. 🟡 ProjectMilestoneテーブル追加
2. 🟡 Milestone CRUD API実装
   - POST /api/projects/:id/milestones
   - GET /api/projects/:id/milestones
   - PUT /api/projects/:id/milestones/:milestoneId
   - DELETE /api/projects/:id/milestones/:milestoneId
3. 🟡 マイルストーン完了処理
   - マイルストーン完了率計算
   - プロジェクト全体進捗更新

---

### Phase 3: 高度な機能（3-4日）

**目標**: 投票・スコアリング機能の実装

**作業内容**:
1. 🟢 ProjectVoteテーブル追加
2. 🟢 スコアリングエンジン実装
   - impactScore, feasibilityScore, alignmentScore計算
   - totalScore算出ロジック
3. 🟢 投票機能実装
   - 施設内投票API
   - 投票結果集計
   - approvalPercentage更新

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
MyProjectsPage
  ↓ 表示
demoProjects (静的配列)
  - 完全にハードコード
  - DB未使用
```

### Phase 1完了後
```
MyProjectsPage
  ↓ API: GET /api/projects?userId={userId}
VoiceDrive Project (DB)
  ├─ Project (マスタ)
  ├─ ProjectTeamMember (参加メンバー)
  ├─ ProjectWorkflowStage (承認フロー)
  └─ ProjectProvisionalMember (仮選出メンバー)

User基本情報:
  ↓ キャッシュ参照
VoiceDrive User (キャッシュ) ← 医療システム Employee (マスタ)
```

---

## ✅ チェックリスト

### VoiceDrive側作業（Phase 1）

- [ ] **Table-1**: Projectテーブル追加（Prisma schema）
- [ ] **Table-2**: ProjectTeamMemberテーブル追加
- [ ] **Table-3**: ProjectProvisionalMemberテーブル追加
- [ ] **Table-4**: ProjectWorkflowStageテーブル追加
- [ ] **Modify-1**: Userテーブルリレーション追加
- [ ] Prisma migrate実行
- [ ] Project CRUD API実装
  - [ ] GET /api/projects（一覧取得）
  - [ ] GET /api/projects/:id（詳細取得）
  - [ ] POST /api/projects（新規作成）
  - [ ] PUT /api/projects/:id（更新）
  - [ ] DELETE /api/projects/:id（削除）
- [ ] ProjectTeamMember API実装
  - [ ] POST /api/projects/:id/members
  - [ ] DELETE /api/projects/:id/members/:userId
- [ ] ProjectWorkflowStage API実装
  - [ ] GET /api/projects/:id/workflow
  - [ ] PUT /api/projects/:id/workflow/:stageId
- [ ] ProjectProvisionalMember API実装
  - [ ] POST /api/projects/:id/provisional-members
  - [ ] PUT /api/projects/:id/provisional-members/:userId
- [ ] MyProjectsPageの修正
  - [ ] demoProjects削除
  - [ ] API統合（useEffect + fetch）
  - [ ] ローディング状態管理
  - [ ] エラーハンドリング
- [ ] 単体テスト作成
- [ ] 統合テスト実装

### VoiceDrive側作業（Phase 2）

- [ ] **Table-5**: ProjectMilestoneテーブル追加
- [ ] Prisma migrate実行
- [ ] Milestone CRUD API実装
- [ ] マイルストーン完了処理実装
- [ ] 進捗計算ロジック実装

### VoiceDrive側作業（Phase 3）

- [ ] ProjectVoteテーブル追加
- [ ] Prisma migrate実行
- [ ] 投票API実装
- [ ] スコアリングエンジン実装
- [ ] 統計集計API実装

---

## 📝 補足資料

### 参照ドキュメント

1. **MyProjectsPage DB要件分析**
   `mcp-shared/docs/MyProjectsPage_DB要件分析_20251019.md`

2. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

3. **PersonalStation 暫定マスターリスト**
   `mcp-shared/docs/PersonalStation暫定マスターリスト_20251008.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Express.js (API Server)

---

**作成者**: AI (Claude Code)
**次のステップ**: schema.prisma更新 → Phase 1実装開始

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-19 | 初版作成 | AI (Claude Code) |
