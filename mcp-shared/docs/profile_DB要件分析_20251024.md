# ProfilePage DB要件分析

**文書番号**: DB-REQ-2025-1024-001
**作成日**: 2025年10月24日
**対象ページ**: https://voicedrive-v100.vercel.app/profile
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
ProfilePageは**議題モードとプロジェクトモードの両方に対応した統計表示ページ**であり、PersonalStationと類似の機能を持ちますが、以下の**重大な不足項目**と**追加要件**があります。

### 🔴 重大な不足項目（即対応必要）

1. **プロフィール情報の不足**
   - `experienceYears`, `previousExperience`, `totalExperience`フィールド
   - `motto`, `selfIntroduction`, `hobbies`, `skills`フィールド
   - `profileImage`, `coverImage`フィールド

2. **投票履歴管理テーブルの不足**
   - PersonalStationと同様、`VoteHistory`テーブルが必要
   - 投票履歴タブ（428-449行目）で使用予定

3. **モード別統計データの管理**
   - 議題モード統計（議題提出数、採択数、委員会貢献度）
   - プロジェクトモード統計（プロジェクト数、協働スコア、チーム規模）
   - これらの統計を効率的に管理するテーブルが必要

4. **プライバシー設定の管理**
   - プロフィール公開設定（非公開/部署のみ/全体公開）
   - 現在UIのみで、DB保存機能なし（464-516行目）

---

## 🔍 詳細分析

### 1. プロフィールヘッダー情報（111-140行目）

#### 表示内容
```typescript
profile: MedicalProfile = {
  id: currentUser.id,
  employeeNumber: 'EMP-2024-' + currentUser.id.slice(-3),
  name: currentUser.name,
  furigana: 'ふりがな',  // ← 🔴 ハードコード
  facility: 'kohara_hospital',  // ← 🔴 ハードコード
  department: currentUser.department || 'rehabilitation_ward',
  profession: 'physical_therapist',  // ← 🔴 ハードコード
  position: currentUser.position || 'member',
  hireDate: '2018-04-01',  // ← 🔴 ハードコード
  experienceYears: 6,  // ← 🔴 ハードコード
  previousExperience: 3,  // ← 🔴 ハードコード
  totalExperience: 9,  // ← 🔴 ハードコード
}
```

#### 必要なデータソース

| 表示項目 | VoiceDrive User | 医療システム Employee | データ管理責任 | 提供方法 | 状態 |
|---------|----------------|---------------------|--------------|---------|------|
| `id` | ✅ `id` | ✅ `employeeId` | 医療システム | API | ✅ OK |
| `employeeNumber` | ✅ `employeeId` | ✅ `employeeNumber` | 医療システム | API | ✅ OK |
| `name` | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `furigana` | ❌ **不足** | ✅ `nameKana` | 医療システム | API | 🔴 **要追加** |
| `facility` | ✅ `facilityId` | ✅ `facility` | 医療システム | API | ✅ OK |
| `department` | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `profession` | ✅ `professionCategory` | ✅ `professionCategory` | 医療システム | API | ✅ OK |
| `position` | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `hireDate` | ❌ **不足** | ✅ `hireDate` | 医療システム | API | 🔴 **要追加** |
| `experienceYears` | ❌ **不足** | ❌ **要計算** | 医療システム | API | 🔴 **要追加** |
| `previousExperience` | ❌ **不足** | ✅ WorkExperience | 医療システム | API | 🔴 **要追加** |
| `totalExperience` | ❌ **不足** | ❌ **要計算** | 医療システム | API | 🔴 **要追加** |
| `votingWeight` | 🟡 計算 | ❌ | VoiceDrive | ローカル計算 | ✅ OK |
| `permissionLevel` | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `approvalAuthority` | 🟡 計算 | ❌ | VoiceDrive | ローカル計算 | ✅ OK |

---

### 2. プロフィール詳細情報（33-59行目）

#### 表示内容
```typescript
motto: '患者さまの笑顔が私の原動力',  // ← 🔴 ハードコード
selfIntroduction: '理学療法士として9年間...',  // ← 🔴 ハードコード
hobbies: ['running', 'reading', 'cooking'],  // ← 🔴 ハードコード
skills: ['脳血管リハビリ', 'チーム医療', '患者指導'],  // ← 🔴 ハードコード
profileImage: currentUser.avatar,
coverImage: 'linear-gradient(...)',  // ← 🔴 ハードコード
profileCompleteRate: 85  // ← 🔴 ハードコード
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 状態 |
|---------|-----------|-------------|--------------|------|
| `motto` | ❌ **不足** | ❌ | VoiceDrive | 🔴 **要追加** |
| `selfIntroduction` | ❌ **不足** | ❌ | VoiceDrive | 🔴 **要追加** |
| `hobbies` | ❌ **不足** | ❌ | VoiceDrive | 🔴 **要追加** |
| `skills` | ❌ **不足** | ✅ EmployeeSkill | 医療システム | 🟡 **API要** |
| `profileImage` | ✅ `avatar` | ❌ | VoiceDrive | ✅ OK |
| `coverImage` | ❌ **不足** | ❌ | VoiceDrive | 🔴 **要追加** |
| `profileCompleteRate` | ❌ **不足** | ❌ | VoiceDrive | 🔴 **要追加** |

**解決策**: VoiceDriveに`UserProfile`テーブルを追加

```prisma
model UserProfile {
  id                    String    @id @default(cuid())
  userId                String    @unique @map("user_id")

  // プロフィール情報（VoiceDrive独自）
  motto                 String?   @db.Text  // モットー・座右の銘
  selfIntroduction      String?   @db.Text  // 自己紹介
  hobbies               String[]  // 趣味（配列）
  coverImage            String?   @map("cover_image")  // カバー画像URL

  // プロフィール完成度
  profileCompleteRate   Int       @default(0) @map("profile_complete_rate")  // 0-100

  // プライバシー設定
  privacyLevel          String    @default("private") @map("privacy_level")
  // private, department, public

  // メタデータ
  lastProfileUpdate     DateTime  @default(now()) @map("last_profile_update")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relations
  user                  User      @relation(fields: [userId], references: [id])

  @@map("user_profiles")
}
```

---

### 3. 議題モード統計表示（256-320行目）

#### 表示内容
```typescript
const agendaStats = {
  totalPosts: 24,  // ← 🔴 ダミー
  improvementPosts: 15,  // ← 🔴 ダミー
  totalLikes: 156,  // ← 🔴 ダミー
  totalComments: 89,  // ← 🔴 ダミー
  submittedAgendas: 8,  // ← 🔴 ダミー（100点到達した提案）
  adoptedAgendas: 5,  // ← 🔴 ダミー（委員会で採択）
  implementingAgendas: 3,  // ← 🔴 ダミー（実施中の改善活動）
  completedAgendas: 12,  // ← 🔴 ダミー（完了した改善活動）
  committeeScore: 85,  // ← 🔴 ダミー（委員会貢献度）
};
```

#### 必要なデータソース

| 統計項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| `totalPosts` | VoiceDrive | ❌ ダミー | `Post`（既存）+ 集計 | 🟡 **集計要** |
| `improvementPosts` | VoiceDrive | ❌ ダミー | `Post` WHERE type='improvement' | 🟡 **集計要** |
| `totalLikes` | VoiceDrive | ❌ ダミー | `PostLike`（新規） | 🔴 **要追加** |
| `totalComments` | VoiceDrive | ❌ ダミー | `Comment`（既存）+ 集計 | 🟡 **集計要** |
| `submittedAgendas` | VoiceDrive | ❌ ダミー | `Post` WHERE score >= 100 | 🟡 **集計要** |
| `adoptedAgendas` | VoiceDrive | ❌ ダミー | `AgendaDecision`（新規） | 🔴 **要追加** |
| `implementingAgendas` | VoiceDrive | ❌ ダミー | `AgendaImplementation`（新規） | 🔴 **要追加** |
| `completedAgendas` | VoiceDrive | ❌ ダミー | `AgendaImplementation` WHERE status='completed' | 🔴 **要追加** |
| `committeeScore` | VoiceDrive | ❌ ダミー | 複合計算 | 🔴 **要追加** |

**解決策**: 議題管理用テーブルの追加

```prisma
// 議題採択決定
model AgendaDecision {
  id                String    @id @default(cuid())
  postId            String    @unique @map("post_id")

  // 採択情報
  isAdopted         Boolean   @default(false) @map("is_adopted")
  adoptedAt         DateTime? @map("adopted_at")
  decidedBy         String?   @map("decided_by")  // 承認者ID

  // 委員会情報
  committeeType     String    @map("committee_type")  // facility, department, etc.
  committeeLevel    String    @map("committee_level")  // FACILITY, ORGANIZATION

  // 決定理由
  decisionReason    String?   @db.Text @map("decision_reason")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([postId])
  @@index([isAdopted])
  @@map("agenda_decisions")
}

// 改善活動実施状況
model AgendaImplementation {
  id                String    @id @default(cuid())
  postId            String    @unique @map("post_id")
  agendaDecisionId  String    @map("agenda_decision_id")

  // 実施状況
  status            String    @map("status")  // planning, implementing, completed, canceled
  progress          Int       @default(0)  // 0-100

  // 実施期間
  plannedStartDate  DateTime? @map("planned_start_date")
  plannedEndDate    DateTime? @map("planned_end_date")
  actualStartDate   DateTime? @map("actual_start_date")
  actualEndDate     DateTime? @map("actual_end_date")

  // 実施内容
  implementationPlan String?  @db.Text @map("implementation_plan")
  results           String?   @db.Text  // 実施結果

  // 責任者
  responsibleUserId String?   @map("responsible_user_id")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([postId])
  @@index([status])
  @@map("agenda_implementations")
}
```

---

### 4. プロジェクトモード統計表示（323-387行目）

#### 表示内容
```typescript
const projectStats = {
  totalProjects: projectAnalytics.totalProjects,  // ← 🟡 計算済み
  activeProjects: projectAnalytics.activeProjects,  // ← 🟡 計算済み
  completedProjects: projectAnalytics.completedProjects,  // ← 🟡 計算済み
  projectCompletionRate: projectAnalytics.projectCompletionRate,  // ← 🟡 計算済み
  collaborationScore: projectAnalytics.collaborationScore,  // ← 🟡 計算済み
  crossDepartmentProjects: projectAnalytics.crossDepartmentProjects,  // ← 🟡 計算済み
  averageTeamSize: projectAnalytics.averageTeamSize,  // ← 🟡 計算済み
};
```

#### 必要なデータソース

| 統計項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| `totalProjects` | VoiceDrive | ✅ 計算中 | `Post` WHERE projectStatus IS NOT NULL | ✅ OK |
| `activeProjects` | VoiceDrive | ✅ 計算中 | `Post` WHERE projectStatus.stage='active' | ✅ OK |
| `completedProjects` | VoiceDrive | ✅ 計算中 | `Post` WHERE projectStatus.stage='completed' | ✅ OK |
| `projectCompletionRate` | VoiceDrive | ✅ 計算中 | 計算値 | ✅ OK |
| `collaborationScore` | VoiceDrive | ✅ 計算中 | 計算値 | ✅ OK |
| `crossDepartmentProjects` | VoiceDrive | ✅ 計算中 | Post分析 | ✅ OK |
| `averageTeamSize` | VoiceDrive | ✅ 計算中 | projectDetails.team分析 | ✅ OK |

**評価**: ✅ プロジェクトモード統計は`ProjectModeAnalytics`で実装済み

---

### 5. 投稿履歴表示（400-425行目）

#### 表示内容
```typescript
<Timeline activeTab="all" filterByUser={currentUser.id} />
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 投稿リスト | VoiceDrive | ✅ 動作中 | `Post`（既存） | ✅ OK |
| 匿名投稿の識別 | VoiceDrive | ✅ 動作中 | `Post.anonymityLevel` | ✅ OK |
| 投稿者フィルタ | VoiceDrive | ✅ 動作中 | `Post.author.id` | ✅ OK |

**評価**: ✅ Timelineコンポーネントで実装済み

---

### 6. 投票履歴タブ（428-449行目）

#### 表示内容
```typescript
// Phase 7実装予定の通知
「Phase 7実装後に利用可能になります」
「投票した議題、カテゴリ別投票実績、投票傾向分析などが表示されます」
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 投票履歴 | VoiceDrive | ❌ 未実装 | `VoteHistory`（PersonalStationと共通） | 🔴 **要追加** |
| カテゴリ別投票実績 | VoiceDrive | ❌ 未実装 | `VoteHistory` + 集計 | 🔴 **要追加** |
| 投票傾向分析 | VoiceDrive | ❌ 未実装 | `VoteHistory` + 分析ロジック | 🔴 **要追加** |

**解決策**: PersonalStationと同じ`VoteHistory`テーブルを使用

---

### 7. プライバシー設定タブ（453-516行目）

#### 表示内容
```typescript
<input type="radio" id="privacy-private" name="privacy" defaultChecked />
非公開（推奨）

<input type="radio" id="privacy-department" name="privacy" disabled />
同じ部署のみ公開（準備中）

<input type="radio" id="privacy-all" name="privacy" disabled />
全体公開（準備中）
```

#### 必要なデータソース

| 設定項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| プライバシーレベル | VoiceDrive | ❌ UI のみ | `UserProfile.privacyLevel` | 🔴 **要追加** |
| 設定保存 | VoiceDrive | ❌ 未実装 | `UserProfile` | 🔴 **要追加** |
| 設定適用ロジック | VoiceDrive | ❌ 未実装 | アクセス制御 | 🔴 **要追加** |

**解決策**: `UserProfile`テーブルに`privacyLevel`フィールドを含める（前述）

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. UserProfile（ユーザープロフィール詳細）**
```prisma
model UserProfile {
  id                    String    @id @default(cuid())
  userId                String    @unique @map("user_id")

  // プロフィール情報
  motto                 String?   @db.Text
  selfIntroduction      String?   @db.Text
  hobbies               String[]
  coverImage            String?   @map("cover_image")

  // プロフィール完成度
  profileCompleteRate   Int       @default(0) @map("profile_complete_rate")

  // プライバシー設定
  privacyLevel          String    @default("private") @map("privacy_level")

  // メタデータ
  lastProfileUpdate     DateTime  @default(now()) @map("last_profile_update")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id])

  @@map("user_profiles")
}
```

**理由**:
- プロフィールページの詳細情報表示に必須
- プライバシー設定の保存に必須
- プロフィール完成度の計算に必須

---

**B. VoteHistory（投票履歴）** ※PersonalStationと共通
```prisma
model VoteHistory {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  postId        String    @map("post_id")
  voteOption    String    @map("vote_option")
  voteWeight    Float     @default(1.0) @map("vote_weight")
  votedAt       DateTime  @default(now()) @map("voted_at")
  postCategory  String?   @map("post_category")
  postType      String?   @map("post_type")

  user          User      @relation(fields: [userId], references: [id])

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@index([votedAt])
  @@map("vote_history")
}
```

**理由**:
- 投票履歴タブで使用
- カテゴリ別投票実績の集計に必須
- PersonalStationと共通で使用

---

**C. PostLike（いいね履歴）**
```prisma
model PostLike {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  postId    String    @map("post_id")
  likedAt   DateTime  @default(now()) @map("liked_at")

  user      User      @relation(fields: [userId], references: [id])
  post      Post      @relation(fields: [postId], references: [id])

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@map("post_likes")
}
```

**理由**:
- 議題モード統計の「総いいね数」表示に必須
- 現在はダミーデータ

---

**D. AgendaDecision（議題採択決定）**
```prisma
model AgendaDecision {
  id                String    @id @default(cuid())
  postId            String    @unique @map("post_id")
  isAdopted         Boolean   @default(false) @map("is_adopted")
  adoptedAt         DateTime? @map("adopted_at")
  decidedBy         String?   @map("decided_by")
  committeeType     String    @map("committee_type")
  committeeLevel    String    @map("committee_level")
  decisionReason    String?   @db.Text @map("decision_reason")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([postId])
  @@index([isAdopted])
  @@map("agenda_decisions")
}
```

**理由**:
- 議題モード統計の「委員会で採択」表示に必須
- 採択率の計算に必須

---

**E. AgendaImplementation（改善活動実施状況）**
```prisma
model AgendaImplementation {
  id                String    @id @default(cuid())
  postId            String    @unique @map("post_id")
  agendaDecisionId  String    @map("agenda_decision_id")
  status            String    @map("status")
  progress          Int       @default(0)
  plannedStartDate  DateTime? @map("planned_start_date")
  plannedEndDate    DateTime? @map("planned_end_date")
  actualStartDate   DateTime? @map("actual_start_date")
  actualEndDate     DateTime? @map("actual_end_date")
  implementationPlan String?  @db.Text @map("implementation_plan")
  results           String?   @db.Text
  responsibleUserId String?   @map("responsible_user_id")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([postId])
  @@index([status])
  @@map("agenda_implementations")
}
```

**理由**:
- 議題モード統計の「実施中の改善活動」「完了した改善活動」表示に必須
- 改善活動の進捗管理に必須

---

### 2. 医療システム側で追加が必要

#### 🔴 優先度: 高（即対応）

**F. 経験年数API拡張**（PersonalStationと共通）

```typescript
// GET /api/employees/:employeeId/experience-summary
{
  yearsOfService: 4.5,           // 勤続年数（当法人）
  totalExperienceYears: 8.2,     // 総職務経験年数（前職含む）
  currentPositionYears: 2.1,     // 現職での年数
  previousExperience: 3.7        // 前職経験年数
}
```

**理由**:
- プロフィールヘッダーの経験年数表示に必須
- VoiceDrive Userテーブルにキャッシュ

---

**G. スキル情報API**

```typescript
// GET /api/employees/:employeeId/skills
{
  skills: [
    { skillId: "1", skillName: "脳血管リハビリ", level: 4 },
    { skillId: "2", skillName: "チーム医療", level: 5 },
    { skillId: "3", skillName: "患者指導", level: 4 }
  ]
}
```

**理由**:
- プロフィール詳細情報のスキル表示に使用
- 医療システムのEmployeeSkillテーブルから取得

---

## 🎯 実装優先順位

### Phase 1: 基本プロフィール表示（2-3日）

**目標**: プロフィールページが基本的に動作する

1. 🔴 **UserProfileテーブル追加**
   - `motto`, `selfIntroduction`, `hobbies`, `coverImage`フィールド
   - `privacyLevel`, `profileCompleteRate`フィールド

2. 🔴 **医療システムAPI連携**
   - 経験年数API（PersonalStationと共通）
   - スキル情報API

3. 🔴 **VoiceDrive Userテーブル拡張**
   - `experienceYears`, `previousExperience`, `totalExperience`キャッシュ

**このPhaseで動作する機能**:
- ✅ プロフィールヘッダー（名前、部署、役職、経験年数）
- ✅ プロフィール詳細（モットー、自己紹介、趣味、スキル）
- ✅ プライバシー設定（保存機能）
- ⚠️ 統計表示（ダミーデータのまま）

---

### Phase 2: 議題モード統計の実装（3-4日）

**目標**: 議題モードの統計が正確に表示される

1. 🔴 **PostLikeテーブル追加**
   - いいね機能の実装

2. 🔴 **AgendaDecisionテーブル追加**
   - 議題採択管理

3. 🔴 **AgendaImplementationテーブル追加**
   - 改善活動実施管理

4. 🔴 **統計集計サービス実装**
   ```typescript
   export async function getAgendaStats(userId: string) {
     // 議題提出数、採択数、実施中・完了数を集計
   }
   ```

**このPhaseで動作する機能**:
- ✅ 議題提出・採択状況（実データ）
- ✅ 改善活動状況（実データ）
- ✅ 委員会貢献度スコア（計算値）

---

### Phase 3: 投票履歴の実装（2-3日）

**目標**: 投票履歴タブが動作する

1. 🔴 **VoteHistoryテーブル追加**（PersonalStationと共通）

2. 🔴 **投票履歴表示機能実装**
   - 投票した議題一覧
   - カテゴリ別投票実績
   - 投票傾向分析

3. 🔴 **統計集計サービス拡張**
   ```typescript
   export async function getVoteHistoryStats(userId: string) {
     // カテゴリ別投票実績、投票傾向を集計
   }
   ```

**このPhaseで動作する機能**:
- ✅ 投票履歴タブ（Phase 7完了）
- ✅ カテゴリ別投票実績
- ✅ 投票傾向分析

---

### Phase 4: パフォーマンス最適化（1-2日）

**目標**: ページ読み込みを高速化

1. 🟡 **UserActivitySummaryテーブル追加**（PersonalStationと共通）
   - 事前集計済み統計データ

2. 🟡 **日次バッチ実装**
   - 全ユーザーの統計を日次で更新

3. 🟡 **ProfilePageの最適化**
   - 集計済みデータの利用
   - キャッシュ戦略の実装

---

## 📊 データフロー図

### Phase 1完了後
```
ProfilePage
  ↓ 表示
プロフィール基本情報 ← VoiceDrive User + UserProfile
  - 経験年数 ← 医療システム /experience-summary API
  - スキル ← 医療システム /skills API
統計情報: ダミーのまま
```

### Phase 2完了後
```
ProfilePage
  ↓ 表示
プロフィール基本情報 ← VoiceDrive User + UserProfile
議題モード統計 ← AgendaDecision + AgendaImplementation (リアルタイム集計)
プロジェクトモード統計 ← ProjectModeAnalytics (既存)
```

### Phase 3完了後
```
ProfilePage
  ↓ 表示
プロフィール基本情報 ← VoiceDrive User + UserProfile
議題モード統計 ← AgendaDecision + AgendaImplementation
プロジェクトモード統計 ← ProjectModeAnalytics
投票履歴 ← VoteHistory (正確)
```

### Phase 4完了後
```
ProfilePage
  ↓ 表示
プロフィール基本情報 ← VoiceDrive User + UserProfile
統計情報 ← UserActivitySummary (事前集計) ← 日次バッチ
投票履歴 ← VoteHistory
```

---

## ✅ チェックリスト

### 医療システム側の実装

- [ ] 経験年数API実装（PersonalStationと共通）
- [ ] スキル情報API実装
- [ ] API仕様書更新

### VoiceDrive側の実装

#### Phase 1
- [ ] UserProfileテーブル追加
- [ ] UserテーブルにexperienceYears等を追加
- [ ] マイグレーション実行
- [ ] 医療システムAPI呼び出し実装
- [ ] ProfilePageのハードコードを実データに置き換え

#### Phase 2
- [ ] PostLikeテーブル追加
- [ ] AgendaDecisionテーブル追加
- [ ] AgendaImplementationテーブル追加
- [ ] マイグレーション実行
- [ ] 議題統計集計サービス実装
- [ ] ProfilePageの統計表示を実データに置き換え

#### Phase 3
- [ ] VoteHistoryテーブル追加（PersonalStationと共通）
- [ ] 投票履歴表示機能実装
- [ ] 投票傾向分析実装
- [ ] ProfilePageの投票履歴タブ有効化

#### Phase 4
- [ ] UserActivitySummaryテーブル追加
- [ ] 日次バッチ実装
- [ ] ProfilePageの最適化

### テスト
- [ ] プロフィール表示の単体テスト
- [ ] 議題統計集計の精度テスト
- [ ] 投票履歴の統合テスト
- [ ] パフォーマンステスト
- [ ] E2Eテスト（ProfilePage全機能）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [ProjectModeAnalytics実装](../../src/systems/project/analytics/ProjectModeAnalytics.ts)

---

**文書終了**

最終更新: 2025年10月24日
バージョン: 1.0
次回レビュー: Phase 1実装後
