# project/:projectId 暫定マスターリスト

**作成日**: 2025年10月19日
**対象ページ**: ProjectDetailPage (`src/pages/ProjectDetailPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- プロジェクト詳細ページは現在完全にデモデータで動作
- 承認フロー、メンバー管理、合意形成状況などの機能を表示
- データベース統合が未実施

### 必要な対応
1. **VoiceDrive DB追加**: テーブル修正2件、フィールド追加3件
2. **API実装**: 3件 (プロジェクト詳細取得、承認、参加)
3. **医療システムからのAPI提供**: **不要** (既存APIのみ使用)
4. **確認事項**: 1件

### 優先度
**Priority: MEDIUM** (Projects Legacy完了後に実施)

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### A. 既存テーブル修正 (2件)

#### Modify-1: Postテーブルにtitle, consensusLevelフィールド追加

**対象テーブル**: `Post`

**追加フィールド**:
```prisma
model Post {
  // ... 既存フィールド ...

  // 🆕 ProjectDetailPage用フィールド
  title             String?   @map("title")  // プロジェクトタイトル
  consensusLevel    Int?      @default(0) @map("consensus_level")  // 合意レベル (0-100)

  // ... 既存リレーション ...

  // 🆕 インデックス追加
  @@index([title])
  @@index([consensusLevel])
}
```

**必要な理由**:
- ProjectDetailPage lines 308: `{project.title}` を表示
- lines 353: `{project.consensusLevel}%` を表示
- 現在はデモデータで固定値

**データソース**:
- `title`: ユーザー入力 or contentの最初の文から自動抽出
- `consensusLevel`: 投票数から自動計算
  - 計算式: `(stronglySupportCount + supportCount) / totalEngagements * 100`

**マイグレーション**:
```sql
-- VoiceDrive: prisma/migrations/xxx_add_project_detail_fields.sql
ALTER TABLE Post ADD COLUMN title VARCHAR(255) NULL;
ALTER TABLE Post ADD COLUMN consensus_level INT DEFAULT 0;
CREATE INDEX idx_post_title ON Post(title);
CREATE INDEX idx_post_consensus_level ON Post(consensus_level);
```

**初期データ投入**:
```typescript
// 全Postのタイトルをcontentから抽出
const posts = await prisma.post.findMany();
for (const post of posts) {
  const title = post.content.split('。')[0].substring(0, 100) + '...';
  const consensusLevel = post.totalEngagements > 0
    ? Math.round(((post.stronglySupportCount + post.supportCount) / post.totalEngagements) * 100)
    : 0;

  await prisma.post.update({
    where: { id: post.id },
    data: { title, consensusLevel }
  });
}
```

---

#### Modify-2: ProjectTeamMemberテーブルにstatusフィールド追加

**対象テーブル**: `ProjectTeamMember`

**追加フィールド**:
```prisma
model ProjectTeamMember {
  id        String    @id @default(cuid())
  projectId String    @map("project_id")
  userId    String    @map("user_id")
  role      String    @default("member")

  // 🆕 メンバーステータス追加
  status    String    @default("invited")  // 'invited' | 'accepted' | 'declined'

  joinedAt  DateTime  @default(now()) @map("joined_at")
  leftAt    DateTime? @map("left_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user      User      @relation("ProjectMemberships", fields: [userId], references: [id], onDelete: Cascade)
  project   Post      @relation("ProjectTeamMembers", fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([role])
  @@index([status])  // 🆕 インデックス追加
  @@map("project_team_members")
}
```

**必要な理由**:
- ProjectDetailPage lines 422-440: メンバーステータスバッジを表示
  - '参加済み' (accepted)
  - '辞退' (declined)
  - '招待中' (invited)
- 現在はデモデータで固定値

**データソース**:
- `status`: メンバーの参加状態
  - デフォルト: 'invited' (招待中)
  - 参加承認時: 'accepted'
  - 辞退時: 'declined'

**マイグレーション**:
```sql
-- VoiceDrive: prisma/migrations/xxx_add_team_member_status.sql
ALTER TABLE project_team_members ADD COLUMN status VARCHAR(50) DEFAULT 'invited';
CREATE INDEX idx_project_team_members_status ON project_team_members(status);
```

**初期データ投入**:
```typescript
// 既存メンバーのステータスをデフォルト値に設定
await prisma.projectTeamMember.updateMany({
  data: { status: 'accepted' }  // 既存メンバーは全て参加済みと仮定
});
```

---

### B. 新規APIエンドポイント (3件)

#### API-1: プロジェクト詳細取得API

**エンドポイント**:
```
GET /api/projects/:projectId
```

**必要な理由**:
- ProjectDetailPage.tsx lines 93-185: プロジェクト詳細データ取得
- 現在はデモデータ (lines 100-174)
- 実際のPostレコードをDBから取得する必要

**レスポンス例**:
```json
{
  "id": "post_123",
  "title": "新しい医療記録管理システムの導入",
  "content": "現在の紙ベースの医療記録管理を完全デジタル化し、業務効率を大幅に改善する提案です。",
  "category": "システム改善",
  "status": "pending",
  "createdAt": "2024-01-15T00:00:00Z",
  "author": {
    "name": "山田太郎",
    "department": "情報システム部",
    "avatar": "https://..."
  },
  "consensusLevel": 78,
  "upvotes": 45,
  "downvotes": 12,
  "approvalFlow": {
    "currentStep": 2,
    "totalSteps": 4,
    "steps": [
      {
        "id": "approval_1",
        "title": "部門長承認",
        "approver": "佐藤部長",
        "status": "approved",
        "approvedAt": "2024-01-16T00:00:00Z",
        "comments": "良い提案です。進めてください。"
      },
      {
        "id": "approval_2",
        "title": "施設責任者承認",
        "approver": "田中施設長",
        "status": "pending"
      }
    ]
  },
  "selectedMembers": [
    {
      "id": "user_1",
      "name": "田中花子",
      "department": "看護部",
      "role": "プロジェクトリーダー",
      "status": "accepted"
    },
    {
      "id": "user_2",
      "name": "鈴木一郎",
      "department": "IT部",
      "role": "システムエンジニア",
      "status": "invited"
    }
  ],
  "timeline": {
    "votingDeadline": "2024-01-25T00:00:00Z",
    "projectStart": "2024-02-01T00:00:00Z",
    "projectEnd": "2024-06-30T00:00:00Z"
  }
}
```

**実装ポイント**:
- `Post` + `User` (author) + `ProjectApproval` + `ProjectTeamMember` を JOIN
- convertPostToProjectDetail() で型変換
- 合意レベルは Post.consensusLevel から取得 or リアルタイム計算

**セキュリティ**:
- JWT認証必須
- プロジェクトへのアクセス権限チェック (作成者 or メンバー or 承認者)

---

#### API-2: プロジェクト承認API

**エンドポイント**:
```
POST /api/projects/:projectId/approve
```

**必要な理由**:
- ProjectDetailPage.tsx lines 188-208: 承認ボタンアクション
- 現在はApprovalFlowService.approveStep() を呼び出すがデモ実装
- 実際のDBレコード作成が必要

**リクエストボディ**:
```json
{
  "comment": "承認します。進めてください。"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "message": "Approval approved. All approvals complete.",
  "projectId": "post_123",
  "approvalId": "approval_2"
}
```

**実装ポイント**:
- ApprovalFlowService.processApproval() と統合
- ProjectApproval レコード作成
- Post.approvalStatus 更新
- 次の承認者への通知送信

**セキュリティ**:
- JWT認証必須
- 承認者本人のみ実行可能
- 承認権限レベルチェック

---

#### API-3: プロジェクト参加API

**エンドポイント**:
```
POST /api/projects/:projectId/join
```

**必要な理由**:
- ProjectDetailPage.tsx lines 211-231: 参加ボタンアクション
- 現在はNotificationService.sendNotification() のみ
- ProjectTeamMember.status を 'accepted' に更新する必要

**リクエストボディ**:
```json
{}
```

**レスポンス例**:
```json
{
  "success": true,
  "message": "Successfully joined the project"
}
```

**実装ポイント**:
- ProjectTeamMember.status を 'invited' → 'accepted' に更新
- ProjectTeamMember.joinedAt を現在時刻に更新
- プロジェクト作成者への通知送信

**セキュリティ**:
- JWT認証必須
- 招待されているユーザーのみ実行可能 (status === 'invited')

---

## ❓ VoiceDriveチーム内の確認事項

### 確認-1: consensusLevel計算方法の確定

**質問**:
> プロジェクト詳細ページに表示される「合意レベル」の計算方法を確定させてください:
>
> 1. **Option A**: 投票数から計算 (推奨)
>    ```typescript
>    consensusLevel = Math.round(
>      ((stronglySupportCount + supportCount) / totalEngagements) * 100
>    )
>    ```
>
> 2. **Option B**: より複雑な重み付け計算
>    ```typescript
>    consensusLevel = Math.round(
>      ((stronglySupportCount * 2 + supportCount) /
>       (totalEngagements * 2)) * 100
>    )
>    ```
>
> 3. 計算結果を Post.consensusLevel に保存するか、リアルタイム計算するか?

**推奨回答**:
- Option A: シンプルな計算式 (賛成票 / 全投票 * 100)
- Post.consensusLevel に保存 (パフォーマンス優先)
- 投票時に自動更新

---

## 📅 想定スケジュール

### Phase 1: スキーマ拡張 (2日)
- **12月18日～12月19日**: Postテーブル, ProjectTeamMemberテーブル修正

### Phase 2: ProjectService実装 (3日)
- **12月20日～12月23日**: getProjectDetail(), approveProject(), joinProject() 実装

### Phase 3: APIエンドポイント実装 (2日)
- **12月24日～12月25日**: 3つのAPIエンドポイント実装

### Phase 4: ProjectDetailPage統合 (2日)
- **12月26日～12月27日**: デモデータ削除、実API接続

### Phase 5: テスト (2日)
- **12月28日～12月29日**: E2Eテスト、承認フロー確認

### Phase 6: リリース
- **12月30日**: 本番リリース

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  ProjectDetailPage.tsx                   │               │
│  │  (UI Layer)                              │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ①GET /api/projects/:projectId                     │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  API Layer                                │               │
│  │  - /api/projects/:projectId               │               │
│  │  - /api/projects/:projectId/approve       │               │
│  │  - /api/projects/:projectId/join          │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ②ProjectService呼び出し                           │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  ProjectService                           │               │
│  │  - getProjectDetail()                     │               │
│  │  - approveProject()                       │               │
│  │  - joinProject()                          │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ③Prismaクエリ実行                                  │
│         ▼                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Post     │  │ProjectApproval│  │ProjectTeam   │     │
│  │              │──│               │  │Member        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                   │
│                           │ ④データ結合                       │
│                           ▼                                   │
│                ┌──────────────────────┐                      │
│                │ convertPostToProject │                      │
│                │ Detail()             │                      │
│                └──────────────────────┘                      │
│                           │                                   │
│                           │ ⑤レスポンス返却                   │
│                           ▼                                   │
│                ┌──────────────────────┐                      │
│                │ ProjectDetailPage    │                      │
│                │ UI表示               │                      │
│                └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
         │
         │ ⑥ユーザー情報取得（参照のみ）
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Employee   │      │ Organization │                    │
│  │   (User)     │──────│ (Department) │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                      │                             │
│         │ 既存API提供（変更不要）│                            │
│         ▼                      ▼                             │
│  ┌─────────────────────────────────────┐                   │
│  │  GET /api/employees/:id             │                   │
│  │  GET /api/organizations/:id         │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### VoiceDrive側作業

#### スキーマ拡張
- [ ] **Modify-1**: Postテーブルに title, consensusLevel フィールド追加
- [ ] **Modify-2**: ProjectTeamMemberテーブルに status フィールド追加
- [ ] マイグレーション実行
- [ ] 初期データ投入 (既存Postのtitle抽出)

#### ProjectService実装
- [ ] `getProjectDetail()` 実装
- [ ] `approveProject()` 実装
- [ ] `joinProject()` 実装
- [ ] `convertPostToProjectDetail()` 実装
- [ ] ApprovalFlowService との統合

#### APIエンドポイント実装
- [ ] **API-1**: GET /api/projects/:projectId
- [ ] **API-2**: POST /api/projects/:projectId/approve
- [ ] **API-3**: POST /api/projects/:projectId/join
- [ ] JWT認証実装
- [ ] 権限チェック実装

#### ProjectDetailPage統合
- [ ] loadProjectDetails() をAPI呼び出しに変更
- [ ] handleApprove() をAPI呼び出しに変更
- [ ] handleJoinProject() をAPI呼び出しに変更
- [ ] デモデータ削除 (lines 100-174)
- [ ] エラーハンドリング追加

#### テスト
- [ ] プロジェクト詳細取得のテスト
- [ ] 承認フロー動作確認
- [ ] メンバー参加機能確認
- [ ] 合意レベル計算精度確認
- [ ] E2Eテスト (ProjectDetailPage全機能)

### 医療システム側作業

**対応不要**:
- ProjectDetailPage は VoiceDrive 100% 管理
- 医療システムからの新規API提供は不要
- 既存のユーザーAPI, 部署APIのみ使用

---

## 📝 補足資料

### 参照ドキュメント

1. **project/:projectId_DB要件分析**
   `mcp-shared/docs/project_projectId_DB要件分析_20251019.md`

2. **Projects DB要件分析**
   `mcp-shared/docs/projects_DB要件分析_20251019.md`

3. **Projects Legacy DB要件分析**
   `mcp-shared/docs/projects-legacy_DB要件分析_20251019.md`

4. **PersonalStation DB要件分析**
   `mcp-shared/docs/PersonalStation_DB要件分析_20251008.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Express.js / Next.js (API Server)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js

---

**作成者**: AI (Claude Code)
**承認待ち**: VoiceDriveチーム内確認
**次のステップ**: Projects Legacy完了後に実装開始 (2025年12月18日～)

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-19 | 初版作成 | AI (Claude Code) |
