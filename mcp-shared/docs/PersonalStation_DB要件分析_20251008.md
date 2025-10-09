# PersonalStationページ DB要件分析

**文書番号**: DB-REQ-2025-1008-001
**作成日**: 2025年10月8日
**対象ページ**: https://voicedrive-v100.vercel.app/personal-station
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md

---

## 📋 分析サマリー

### 結論
PersonalStationページは**医療システムDB構築計画書の内容で概ね動作可能**ですが、以下の**重大な不足項目**と**推奨追加項目**があります。

### 🔴 重大な不足項目（即対応必要）

1. **`experienceYears`フィールド不足**
   - PersonalStation 157行目: `{contextUser?.experienceYears || 0}年`
   - VoiceDrive `User`テーブルに存在しない
   - 医療システム`Employee`テーブルにも直接的には存在しない

2. **VoiceDrive活動統計の集計機能不足**
   - 総投票数、影響力スコア、提案数
   - 現在ダミーデータ（76-81行目）
   - 実データ集計のための専用テーブルが必要

3. **投票履歴の管理テーブル不足**
   - PersonalStationで投票履歴表示（600-729行目）
   - `posts.filter(p => p.hasUserVoted || p.userVote)` としているが、実際の投票記録テーブルがない

---

## 🔍 詳細分析

### 1. ユーザー基本情報表示（117-177行目）

#### 表示内容
```typescript
{contextUser?.name || currentUser?.name || 'ゲスト'}
{contextUser?.department || '未設定'} • {contextUser?.facility || '大原記念財団'}
{contextUser?.profession || '医療従事者'} {contextUser?.position && `• ${contextUser.position}`}
{contextUser?.experienceYears || 0}年  // ← 🔴 不足
```

#### 必要なデータソース

| 表示項目 | VoiceDrive User | 医療システム Employee | データ管理責任 | 提供方法 | 状態 |
|---------|----------------|---------------------|--------------|---------|------|
| `name` | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `department` | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `facility` | ✅ `facilityId` | ✅ `facility` | 医療システム | API | ✅ OK |
| `profession` | ✅ `professionCategory` | ✅ `professionCategory` | 医療システム | API | ✅ OK |
| `position` | ✅ キャッシュ | ✅ マスタ | 医療システム | API | ✅ OK |
| `experienceYears` | ❌ **不足** | ❌ **不足** | 医療システム | API | 🔴 **要追加** |

#### 解決策1: 医療システムに経験年数計算APIを追加

**医療システム側**:
```typescript
// GET /api/employees/:employeeId/experience-summary
{
  yearsOfService: 4.5,           // 勤続年数（当法人）
  totalExperienceYears: 8.2,      // 総職務経験年数（前職含む）
  currentPositionYears: 2.1,      // 現職での年数
  specialtyExperienceYears: 6.5   // 専門分野経験年数
}
```

**計算ロジック**:
```typescript
// 医療システム側: src/services/ExperienceCalculator.ts
export async function calculateTotalExperience(employeeId: string): Promise<number> {
  const employee = await prisma.employee.findUnique({
    where: { employeeId },
    include: {
      workExperiences: true,  // WorkExperienceテーブル（DB構築計画書 Section 14）
    }
  });

  if (!employee) return 0;

  // 当法人での勤続年数
  const yearsOfService = employee.yearsOfService || 0;

  // 前職の経験年数を集計（WorkExperienceテーブルから）
  const priorExperience = employee.workExperiences.reduce((total, exp) => {
    if (exp.endDate && exp.startDate) {
      const years = (exp.endDate.getTime() - exp.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + years;
    }
    return total;
  }, 0);

  return yearsOfService + priorExperience;
}
```

**VoiceDrive側キャッシュ追加**:
```prisma
// prisma/schema.prisma
model User {
  // ... 既存フィールド
  experienceYears  Float?  @map("experience_years")  // 🆕 追加
}
```

---

### 2. 権限レベル表示（132-146行目、150-177行目）

#### 表示内容
```typescript
<PermissionLevelBadge level={permission.level} size="large" />
{permission.levelDescription}
{permission.isNursingLeader && <span>リーダー業務可</span>}
{permission.calculatedLevel || 1}
{permission.availableMenus?.length || 0} // 利用可能機能
```

#### 必要なデータソース

| 表示項目 | VoiceDrive User | 医療システム Employee | データ管理責任 | 提供方法 | 状態 |
|---------|----------------|---------------------|--------------|---------|------|
| `permissionLevel` | ✅ キャッシュ | ✅ マスタ | 医療システム | API/Webhook | ✅ OK |
| `canPerformLeaderDuty` | ✅ キャッシュ | ✅ マスタ | 医療システム | API/Webhook | ✅ OK |
| `levelDescription` | 🟡 計算 | 🟡 計算 | VoiceDrive | ローカル計算 | ✅ OK |
| `availableMenus` | 🟡 計算 | ❌ 不要 | VoiceDrive | ローカル計算 | ✅ OK |

**評価**: ✅ DB構築計画書の内容で対応可能

- `permissionLevel`はV3評価から算出され、Employeeテーブルに保存
- Webhook経由でVoiceDrive Userテーブルに同期
- `levelDescription`や`availableMenus`はVoiceDrive側でローカル計算

---

### 3. 統計カード（194-226行目）

#### 表示内容
```typescript
// 総投票数
{myVotes.total}        // 89 (ダミー)
{myVotes.thisMonth}    // 12 (ダミー)

// 影響力スコア
{myVotes.impactScore}  // 76 (ダミー)

// 提案数
{myPosts?.length || 0}
```

#### 必要なデータソース

| 統計項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| 総投票数 | VoiceDrive | ❌ ダミーデータ | `VoteHistory` | 🔴 **要追加** |
| 今月投票数 | VoiceDrive | ❌ ダミーデータ | `VoteHistory` | 🔴 **要追加** |
| 影響力スコア | VoiceDrive | ❌ ダミーデータ | `EngagementMetrics` | 🔴 **要追加** |
| 提案数 | VoiceDrive | ✅ 動作中 | `Post`（既存） | ✅ OK |

#### 解決策2: VoiceDriveに投票履歴テーブルを追加

**新規テーブル: `VoteHistory`**
```prisma
// VoiceDrive: prisma/schema.prisma
model VoteHistory {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  postId        String    @map("post_id")
  voteOption    String    @map("vote_option")
  // strongly-support, support, neutral, oppose, strongly-oppose
  voteWeight    Float     @default(1.0) @map("vote_weight")
  // 権限レベルに応じた投票重み
  votedAt       DateTime  @default(now()) @map("voted_at")

  // カテゴリ分類（統計用）
  postCategory  String?   @map("post_category")
  postType      String?   @map("post_type")
  // improvement, communication, innovation, strategy

  // Relations
  user          User      @relation(fields: [userId], references: [id])

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@index([votedAt])
  @@map("vote_history")
}

// Userモデルに追加
model User {
  // ... 既存フィールド
  voteHistory   VoteHistory[]  // 🆕 追加
}
```

**統計集計クエリ**:
```typescript
// src/services/UserActivityService.ts
export async function getUserVoteStats(userId: string) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 総投票数
  const totalVotes = await prisma.voteHistory.count({
    where: { userId }
  });

  // 今月の投票数
  const thisMonthVotes = await prisma.voteHistory.count({
    where: {
      userId,
      votedAt: { gte: thisMonthStart }
    }
  });

  // 影響力スコア計算
  const votes = await prisma.voteHistory.findMany({
    where: { userId },
    select: { voteWeight: true }
  });

  const impactScore = Math.min(100, votes.reduce((sum, v) => sum + v.voteWeight, 0) * 2);

  return {
    total: totalVotes,
    thisMonth: thisMonthVotes,
    impactScore: Math.round(impactScore)
  };
}
```

---

### 4. 議題モード投稿追跡（228-300行目）

#### 表示内容
```typescript
const myAgendaPosts = myPosts.filter(p => p.type === 'improvement');
const score = calculateScore(convertVotesToEngagements(post.votes || {}), post.proposalType);
const level = agendaLevelEngine.getAgendaLevel(score);
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 投稿リスト | VoiceDrive | ✅ 動作中 | `Post`（既存） | ✅ OK |
| 投票データ | VoiceDrive | ⚠️ 一部動作 | `VoteHistory`（新規） | 🟡 **要強化** |
| 議題レベル | VoiceDrive | ✅ 計算中 | ローカル計算 | ✅ OK |
| スコア計算 | VoiceDrive | ✅ 計算中 | ローカル計算 | ✅ OK |

**評価**: 🟡 基本動作可能だが、投票データの正確性に課題

- `Post`テーブルは存在（既存）
- 投票集計は`post.votes`フィールド（JSON）に依存
- より正確な追跡には`VoteHistory`テーブルが推奨

---

### 5. カテゴリ別投票実績（442-481行目）

#### 表示内容
```typescript
// ダミーデータ
🏥 業務改善: 23回
👥 コミュニケーション: 15回
💡 イノベーション: 8回
🎯 戦略提案: 5回
```

#### 必要なデータソース

**現状**: 完全にダミーデータ

**解決策**: `VoteHistory`テーブルから集計
```typescript
// src/services/UserActivityService.ts
export async function getVoteStatsByCategory(userId: string) {
  const votes = await prisma.voteHistory.groupBy({
    by: ['postCategory'],
    where: { userId },
    _count: { id: true }
  });

  return {
    improvement: votes.find(v => v.postCategory === 'improvement')?._count.id || 0,
    communication: votes.find(v => v.postCategory === 'communication')?._count.id || 0,
    innovation: votes.find(v => v.postCategory === 'innovation')?._count.id || 0,
    strategy: votes.find(v => v.postCategory === 'strategy')?._count.id || 0,
  };
}
```

---

### 6. マイポスト表示（485-555行目）

#### 表示内容
```typescript
const myPosts = posts?.filter(post => post.authorId === user?.id) || [];
const agendaPosts = myPosts.filter(p => p.type === 'improvement');
const projectPosts = myPosts.filter(p => p.type !== 'improvement');
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 投稿リスト | VoiceDrive | ✅ 動作中 | `Post`（既存） | ✅ OK |
| 著者フィルタ | VoiceDrive | ✅ 動作中 | `Post.authorId` | ✅ OK |
| 投稿タイプ | VoiceDrive | ✅ 動作中 | `Post.type` | ✅ OK |

**評価**: ✅ DB構築計画書の内容で完全対応可能

---

### 7. 投票履歴表示（600-729行目）

#### 表示内容
```typescript
const votedPosts = posts.filter(p => p.hasUserVoted || p.userVote);
const agendaVotes = votedPosts.filter(p => p.type === 'improvement');
const projectVotes = votedPosts.filter(p => p.type !== 'improvement');
```

#### 必要なデータソース

| データ項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|-----------|--------------|-----------|--------------|------|
| 投票済み判定 | VoiceDrive | ⚠️ 不正確 | `VoteHistory`（新規） | 🔴 **要追加** |
| 投票種類 | VoiceDrive | ⚠️ 不正確 | `VoteHistory.voteOption` | 🔴 **要追加** |
| 投票日時 | VoiceDrive | ❌ 不足 | `VoteHistory.votedAt` | 🔴 **要追加** |

**現在の問題**:
- `post.hasUserVoted`や`post.userVote`はクライアント側の一時的なフラグ
- 永続的な投票履歴が記録されていない
- ページリロードで投票履歴が消える可能性

**解決策**: 前述の`VoteHistory`テーブルで対応

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. VoteHistory（投票履歴）**
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
- PersonalStationの統計カード（総投票数、影響力スコア）に必須
- カテゴリ別投票実績に必須
- 投票履歴表示に必須
- データ分析の基礎データ

**影響範囲**:
- PersonalStation: 194-226行目（統計カード）
- PersonalStation: 442-481行目（カテゴリ別投票実績）
- PersonalStation: 600-729行目（投票履歴）

---

#### 🟡 優先度: 中（推奨）

**B. UserActivitySummary（ユーザー活動サマリ）**
```prisma
model UserActivitySummary {
  id                    String    @id @default(cuid())
  userId                String    @unique @map("user_id")

  // 投稿統計
  totalPosts            Int       @default(0) @map("total_posts")
  totalAgendaPosts      Int       @default(0) @map("total_agenda_posts")
  totalProjectPosts     Int       @default(0) @map("total_project_posts")

  // 投票統計
  totalVotes            Int       @default(0) @map("total_votes")
  thisMonthVotes        Int       @default(0) @map("this_month_votes")
  totalVoteWeight       Float     @default(0) @map("total_vote_weight")

  // 影響力指標
  impactScore           Float     @default(0) @map("impact_score")
  engagementScore       Float     @default(0) @map("engagement_score")

  // フィードバック統計
  feedbackReceived      Int       @default(0) @map("feedback_received")
  feedbackSent          Int       @default(0) @map("feedback_sent")

  // プロジェクト統計
  projectsProposed      Int       @default(0) @map("projects_proposed")
  projectsParticipated  Int       @default(0) @map("projects_participated")

  // アンケート統計
  surveysCompleted      Int       @default(0) @map("surveys_completed")

  // ログイン統計
  loginDays             Int       @default(0) @map("login_days")
  lastActiveDate        DateTime? @map("last_active_date")

  // 更新日時
  lastCalculatedAt      DateTime  @default(now()) @map("last_calculated_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id])

  @@index([impactScore])
  @@index([lastActiveDate])
  @@map("user_activity_summary")
}
```

**理由**:
- 統計計算の高速化（集計済みデータ）
- PersonalStation読み込み速度の向上
- 日次バッチで更新可能

**更新タイミング**:
- 日次バッチ（深夜）で全ユーザー更新
- リアルタイム更新（投稿・投票時）も可能

---

### 2. 医療システム側で追加が必要

#### 🔴 優先度: 高（即対応）

**C. 経験年数計算用のWorkExperienceテーブル拡張**

**現状**: DB構築計画書 Section 14に既に存在
```prisma
model WorkExperience {
  id                    String    @id @default(cuid())
  employeeId            String    @map("employee_id")
  company               String
  position              String
  startDate             DateTime  @map("start_date")
  endDate               DateTime? @map("end_date")
  isCurrent             Boolean   @default(false) @map("is_current")
  responsibilities      String?   @db.Text

  employee              Employee  @relation(fields: [employeeId], references: [id])

  @@index([employeeId])
  @@map("work_experiences")
}
```

**必要な追加機能**:
```typescript
// 医療システム: src/api/routes/employee.routes.ts

/**
 * GET /api/employees/:employeeId/experience-summary
 * 経験年数サマリ取得（VoiceDrive用）
 */
router.get('/:employeeId/experience-summary', authenticateAPI, async (req, res) => {
  const { employeeId } = req.params;

  const employee = await prisma.employee.findUnique({
    where: { employeeId },
    include: { workExperiences: true }
  });

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  // 勤続年数（当法人）
  const yearsOfService = employee.yearsOfService || 0;

  // 前職経験年数の合計
  const priorExperience = employee.workExperiences
    .filter(exp => exp.endDate)
    .reduce((total, exp) => {
      const years = (exp.endDate.getTime() - exp.startDate.getTime())
        / (1000 * 60 * 60 * 24 * 365);
      return total + years;
    }, 0);

  // 総職務経験年数
  const totalExperienceYears = yearsOfService + priorExperience;

  // 現職での年数
  const currentPositionYears = employee.hireDate
    ? (Date.now() - employee.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    : 0;

  res.json({
    yearsOfService,
    totalExperienceYears: Math.round(totalExperienceYears * 10) / 10,
    currentPositionYears: Math.round(currentPositionYears * 10) / 10,
    priorExperience: Math.round(priorExperience * 10) / 10
  });
});
```

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（1-2日）

**目標**: PersonalStationページが基本的に動作する

1. ✅ **医療システムから職員基本情報を取得**
   - GET /api/employees/:id で name, department, position等を取得
   - VoiceDrive Userテーブルにキャッシュ
   - **既に定義書で計画済み**

2. 🔴 **経験年数API追加（医療システム）**
   - GET /api/employees/:id/experience-summary
   - WorkExperienceテーブルから計算
   - **新規実装必要**

3. 🔴 **VoiceDrive UserテーブルにexperienceYears追加**
   ```prisma
   model User {
     // ... 既存
     experienceYears  Float?  @map("experience_years")
   }
   ```

**このPhaseで動作する機能**:
- ✅ ユーザー基本情報表示（名前、部署、役職、経験年数）
- ✅ 権限レベル表示
- ✅ マイポスト表示
- ⚠️ 統計カード（ダミーデータのまま）
- ⚠️ 投票履歴（不正確）

---

### Phase 2: 投票履歴の正確化（2-3日）

**目標**: 投票関連の統計が正確に表示される

1. 🔴 **VoteHistoryテーブル追加**
   ```prisma
   model VoteHistory { /* 前述の定義 */ }
   ```

2. 🔴 **投票処理の実装**
   ```typescript
   // src/services/VoteService.ts
   export async function recordVote(
     userId: string,
     postId: string,
     voteOption: VoteOption,
     voteWeight: number
   ) {
     await prisma.voteHistory.upsert({
       where: { userId_postId: { userId, postId } },
       create: { userId, postId, voteOption, voteWeight, votedAt: new Date() },
       update: { voteOption, voteWeight, votedAt: new Date() }
     });
   }
   ```

3. 🔴 **統計集計サービス実装**
   ```typescript
   // src/services/UserActivityService.ts
   export async function getUserVoteStats(userId: string) { /* 前述 */ }
   export async function getVoteStatsByCategory(userId: string) { /* 前述 */ }
   ```

4. 🔴 **PersonalStationページの修正**
   - ダミーデータを実データに置き換え
   - 投票履歴表示を`VoteHistory`から取得

**このPhaseで動作する機能**:
- ✅ 統計カード（実データ）
- ✅ カテゴリ別投票実績（実データ）
- ✅ 投票履歴（正確）

---

### Phase 3: パフォーマンス最適化（1-2日）

**目標**: ページ読み込みを高速化

1. 🟡 **UserActivitySummaryテーブル追加**
   ```prisma
   model UserActivitySummary { /* 前述の定義 */ }
   ```

2. 🟡 **日次バッチ実装**
   ```typescript
   // src/jobs/calculateUserActivitySummary.ts
   export async function calculateAllUserSummaries() {
     const users = await prisma.user.findMany();
     for (const user of users) {
       const stats = await getUserVoteStats(user.id);
       const categories = await getVoteStatsByCategory(user.id);
       // ... 計算してUserActivitySummaryに保存
     }
   }
   ```

3. 🟡 **PersonalStationページの最適化**
   - `UserActivitySummary`から統計を取得（高速）
   - フォールバック: リアルタイム計算

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
PersonalStation
  ↓ 表示
User基本情報: contextUser (ダミー/一部実データ)
統計情報: myVotes (完全ダミー)
投票履歴: posts.hasUserVoted (不正確)
```

### Phase 1完了後
```
PersonalStation
  ↓ 表示
User基本情報 ← VoiceDrive User (キャッシュ) ← 医療システム Employee (API)
  - experienceYears ← 医療システム /experience-summary (新規API)
統計情報: ダミーのまま
投票履歴: 不正確のまま
```

### Phase 2完了後
```
PersonalStation
  ↓ 表示
User基本情報 ← VoiceDrive User (キャッシュ) ← 医療システム Employee (API)
統計情報 ← VoteHistory集計 (リアルタイム計算)
投票履歴 ← VoteHistory (正確)
```

### Phase 3完了後
```
PersonalStation
  ↓ 表示
User基本情報 ← VoiceDrive User (キャッシュ) ← 医療システム Employee (API)
統計情報 ← UserActivitySummary (事前集計) ← 日次バッチ ← VoteHistory
投票履歴 ← VoteHistory (正確)
```

---

## ✅ チェックリスト

### 医療システム側の実装

- [ ] WorkExperienceテーブル確認（DB構築計画書に既存）
- [ ] GET /api/employees/:id/experience-summary 実装
- [ ] 経験年数計算ロジック実装
- [ ] 単体テスト作成
- [ ] API仕様書更新

### VoiceDrive側の実装

#### Phase 1
- [ ] Userテーブルに experienceYears 追加
- [ ] マイグレーション実行
- [ ] 医療システムAPI呼び出し実装
- [ ] PersonalStationページで表示確認

#### Phase 2
- [ ] VoteHistoryテーブル追加
- [ ] マイグレーション実行
- [ ] 投票記録処理実装
- [ ] UserActivityService実装（統計集計）
- [ ] PersonalStationページのダミーデータを実データに置き換え
- [ ] 投票履歴表示をVoteHistoryから取得に変更

#### Phase 3
- [ ] UserActivitySummaryテーブル追加
- [ ] マイグレーション実行
- [ ] 日次バッチ実装
- [ ] PersonalStationページを最適化

### テスト
- [ ] 経験年数表示の単体テスト
- [ ] 投票記録の統合テスト
- [ ] 統計集計の精度テスト
- [ ] パフォーマンステスト（1000ユーザー）
- [ ] E2Eテスト（PersonalStation全機能）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)
- [MySQL_Migration_Guide.md](../../docs/MySQL_Migration_Guide.md)

---

**文書終了**

最終更新: 2025年10月8日
バージョン: 1.0
次回レビュー: Phase 1実装後
