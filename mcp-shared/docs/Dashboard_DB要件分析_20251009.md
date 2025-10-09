# Dashboard DB要件分析

**文書番号**: VD-DB-DASHBOARD-2025-1009-001
**作成日**: 2025年10月9日
**対象ページ**: Dashboard（ダッシュボード）
**対象ファイル**: `src/pages/Dashboard.tsx` (283行)
**URL**: https://voicedrive-v100.vercel.app/dashboard
**優先度**: 🔴 HIGH
**グループ**: 1 (コアページ)
**ステータス**: ✅ 分析完了

---

## 📋 エグゼクティブサマリー

### 分析結果概要

Dashboardページは職員の個人活動状況と権限情報を一元表示する中核機能です。データ管理責任分界点定義書に基づき分析した結果：

- ✅ **新規テーブル**: 不要（既存テーブルで対応可能）
- ⚠️ **不足フィールド**: 1つ（User.experienceYears）
- ⚠️ **医療システムAPI要求**: 2つ（経験年数取得、部署効率データ）
- ✅ **VoiceDrive集計機能**: 4つ実装必要
- 🔵 **データ依存度**: 医療システム 70%、VoiceDrive 30%

### 主要機能

1. **ユーザー情報表示** - 基本情報、権限レベル、経験年数
2. **活動統計カード** - 投稿数、投票数、承認待ち、部署効率
3. **利用可能機能一覧** - 権限に応じたメニュー表示
4. **権限レベル詳細** - 算出レベル、利用可能機能数、権限アイコン

---

## 🎯 ページ機能詳細分析

### 機能1: ユーザー情報表示 (lines 118-148)

#### 表示項目

| 項目 | 変数 | データソース | 管理責任 | API |
|------|------|------------|---------|-----|
| 氏名 | `user.name` | Employee.name | 🔵 医療システム | API-1 |
| 部署 | `user.department` | DepartmentMaster | 🔵 医療システム | API-1 |
| 施設 | `user.facility` | FacilityMaster | 🔵 医療システム | API-1 |
| 職種 | `user.profession` | OccupationMaster | 🔵 医療システム | API-1 |
| 役職 | `user.position` | PositionMaster | 🔵 医療システム | API-1 |
| 経験年数 | `user.experienceYears` | **❌ 不足** | 🔵 医療システム | **API-2 (新規)** |
| 権限レベル | `permission.level` | V3Assessment計算 | 🔵 医療システム | API-1 |
| 算出レベル | `permission.calculatedLevel` | V3Assessment計算 | 🔵 医療システム | API-1 |
| リーダー資格 | `permission.canPerformLeaderDuty` | Employee.canPerformLeaderDuty | 🔵 医療システム | API-1 |
| 利用可能機能数 | `permission.availableMenus.length` | 権限レベルから算出 | 🔵 医療システム | API-1 |

#### 現状の課題

```typescript
// Dashboard.tsx:158
<div className="text-2xl font-bold text-gray-900">{user.experienceYears}年</div>
```

**問題点**:
- ❌ `User`テーブルに`experienceYears`フィールドが存在しない
- ❌ データ管理責任分界点定義書により、経験年数は医療システム管理
- ❌ 現在は表示エラーまたはundefinedになる

**解決策**:
1. `User`テーブルに`experienceYears Float?`を追加（キャッシュ用）
2. 医療システムに経験年数取得API実装を依頼（API-2）
3. Webhook経由で経験年数更新を受信

---

### 機能2: 活動統計カード (lines 34-73, 183-201)

#### 統計項目

| 統計 | コード箇所 | データソース | 管理責任 | 実装状況 |
|------|----------|------------|---------|---------|
| 投稿したアイデア | line 36-40 | Post集計 | 🟢 VoiceDrive | ❌ ハードコード |
| 投票参加 | line 42-48 | Vote集計 | 🟢 VoiceDrive | ❌ ハードコード |
| 承認待ち議題 | line 53-58 | ApprovalTask集計 | 🟢 VoiceDrive | ❌ ハードコード |
| 部署効率 | line 63-69 | **不明** | ⚠️ **要検討** | ❌ ハードコード |

#### 現状のコード（問題あり）

```typescript
// Dashboard.tsx:34-73
const baseStats: DashboardStat[] = [
  {
    label: '投稿したアイデア',
    value: 12,  // ❌ ハードコード！
    change: '+2 今月',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'blue'
  },
  {
    label: '投票参加',
    value: 48,  // ❌ ハードコード！
    change: '+8 今週',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'green'
  }
];

// 管理者レベル以上の統計
if (permission.isManager) {
  baseStats.push({
    label: '承認待ち議題',
    value: 5,  // ❌ ハードコード！
    icon: <Award className="w-5 h-5" />,
    color: 'orange'
  });
}

// 分析アクセス権限がある場合
if (permission.canAccessAnalytics) {
  baseStats.push({
    label: '部署効率',
    value: '87%',  // ❌ ハードコード！
    change: '+3%',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'purple'
  });
}
```

#### 必要な実装

##### 1. VoiceDrive側の集計API

```typescript
// 新規サービス: UserActivityService.ts
export class UserActivityService {
  async getActivityStats(userId: string) {
    const totalPosts = await prisma.post.count({
      where: { authorId: userId }
    });

    const totalVotes = await prisma.vote.count({
      where: { userId: userId }
    });

    const pendingApprovals = await prisma.approvalTask.count({
      where: {
        approverId: userId,
        status: 'pending'
      }
    });

    return {
      totalPosts,
      totalVotes,
      pendingApprovals
    };
  }
}
```

##### 2. 部署効率データの責任分担

**推奨方針**:

| データ | 計算元 | 責任 | 理由 |
|-------|-------|------|------|
| 部署の投稿数 | VoiceDrive Post集計 | 🟢 VoiceDrive | VoiceDrive活動データ |
| 部署の職員数 | 医療システム Employee集計 | 🔵 医療システム | 組織マスタ |
| 部署のタスク完了率 | 医療システム Task集計 | 🔵 医療システム | 業務管理データ |
| **総合効率スコア** | **医療システムで計算** | 🔵 **医療システム** | **統合指標** |

**結論**: 部署効率は医療システムが算出し、API-3で提供

---

### 機能3: 利用可能機能一覧 (lines 204-246)

#### 表示項目

| 項目 | 変数 | データソース | 管理責任 |
|------|------|------------|---------|
| 利用可能メニュー | `permission.availableMenus` | 権限レベル算出 | 🔵 医療システム |
| 新人判定 | `permission.isNewcomer` | 経験年数・権限 | 🔵 医療システム |
| 管理職判定 | `permission.isManager` | 役職・権限 | 🔵 医療システム |
| システム管理者判定 | `permission.isSystemAdmin` | 特権フラグ | 🔵 医療システム |

#### データ依存

```typescript
// Dashboard.tsx:208-218
{permission.availableMenus.map((menu, index) => (
  <button key={index}>
    <MenuIcon name={menu} />
    <span>{getMenuLabel(menu)}</span>
  </button>
))}
```

**依存API**: API-1 (職員情報取得) の`permission`セクション

---

## 📊 データ管理責任マトリクス

### カテゴリ1: 職員基本情報

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 職員ID（employeeId） | キャッシュ | ✅ マスタ | API-1 | User.employeeId |
| 氏名（name） | キャッシュ | ✅ マスタ | API-1 | User.name |
| 部署（department） | キャッシュ | ✅ マスタ | API-1 | User.department |
| 施設（facility） | キャッシュ | ✅ マスタ | API-1 | User.facilityId |
| 職種（profession） | キャッシュ | ✅ マスタ | API-1 | User.profession |
| 役職（position） | キャッシュ | ✅ マスタ | API-1 | User.position |
| **経験年数（experienceYears）** | **❌ なし** | ✅ **マスタ** | **API-2 (新規)** | **不足フィールド** |

### カテゴリ2: 権限情報

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 権限レベル（permissionLevel） | キャッシュ | ✅ マスタ | API-1 | User.permissionLevel |
| 算出レベル（calculatedLevel） | キャッシュ | ✅ マスタ | API-1 | V3評価から計算 |
| リーダー資格（canPerformLeaderDuty） | キャッシュ | ✅ マスタ | API-1 | User.canPerformLeaderDuty |
| 利用可能メニュー（availableMenus） | ❌ | ✅ マスタ | API-1 | 権限レベルから算出 |
| 新人判定（isNewcomer） | ❌ | ✅ マスタ | API-1 | 経験年数・権限判定 |
| 管理職判定（isManager） | ❌ | ✅ マスタ | API-1 | 役職・権限判定 |
| システム管理者（isSystemAdmin） | ❌ | ✅ マスタ | API-1 | 特権フラグ |

### カテゴリ3: 活動統計

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 投稿したアイデア数 | ✅ マスタ | ❌ | VD集計 | Post.count() |
| 投票参加数 | ✅ マスタ | ❌ | VD集計 | Vote.count() |
| 承認待ち議題数 | ✅ マスタ | ❌ | VD集計 | ApprovalTask.count() |
| **部署効率** | ❌ | ✅ **マスタ** | **API-3 (新規)** | **統合指標** |

---

## 🔍 不足項目詳細

### 不足1: User.experienceYears フィールド

**現状**:
- ❌ `User`テーブルに存在しない
- ❌ Dashboard.tsx:158で参照しているが未定義
- ❌ データ管理責任分界点定義書により医療システム管理

**必要な対応**:

#### VoiceDrive側

```prisma
// prisma/schema.prisma
model User {
  id                    String    @id @default(cuid())
  employeeId            String    @unique
  email                 String    @unique
  name                  String
  department            String?
  facilityId            String?
  profession            String?
  position              String?
  experienceYears       Float?    // ← 追加（医療システムから同期）
  permissionLevel       Float?
  canPerformLeaderDuty  Boolean   @default(false)
  // ... 他のフィールド
}
```

#### 医療システム側

**API-2: 経験年数取得API（新規実装依頼）**

```typescript
GET /api/employees/{employeeId}/experience-summary

Response:
{
  "employeeId": "OH-NS-2024-001",
  "totalExperienceYears": 8.2,      // ← Dashboard表示用
  "yearsOfService": 4.5,            // 当法人勤続年数
  "currentPositionYears": 2.1,      // 現役職での年数
  "specialtyExperienceYears": 6.5,  // 専門分野経験年数
  "calculatedAt": "2025-10-09T10:00:00Z"
}
```

**データソース**:
- `Employee.hireDate` → yearsOfService計算
- `WorkExperience`テーブル → totalExperienceYears集計
- `AssignmentHistory` → currentPositionYears計算

**更新方法**:
- 週次バッチでVoiceDriveへ更新通知（Webhook）
- 表示時にリアルタイム取得は不要（キャッシュで十分）

---

### 不足2: 部署効率データ

**現状**:
- ❌ ハードコード（'87%'）
- ❌ 計算ロジック未実装
- ❌ データソース不明

**必要な対応**:

#### 医療システム側

**API-3: 部署効率データ取得API（新規実装依頼）**

```typescript
GET /api/analytics/department/{departmentId}/efficiency

Query Parameters:
- period: string (例: "2024-10", "2024-Q3")
- metrics: string[] (例: ["task_completion", "voicedrive_activity"])

Response:
{
  "departmentId": "内科",
  "period": "2024-10",
  "efficiencyScore": 87.5,  // ← Dashboard表示用
  "trend": "+3.2%",         // 前月比
  "breakdown": {
    "taskCompletionRate": 92.0,      // 医療システムタスク完了率
    "voiceDriveActivityScore": 83.0, // VoiceDrive活動スコア
    "responseTimeScore": 88.5,       // 対応速度スコア
    "qualityScore": 89.0             // 品質スコア
  },
  "calculatedAt": "2025-10-09T00:00:00Z"
}
```

**計算方針**:

| 指標 | 重み | データソース | 管理システム |
|------|-----|------------|------------|
| タスク完了率 | 40% | Task.status | 医療システム |
| VoiceDrive活動 | 20% | Post/Vote統計 | VoiceDrive（API提供） |
| 対応速度 | 20% | Task.respondedAt - submittedAt | 医療システム |
| 品質スコア | 20% | 評価フィードバック | 医療システム |

**統合方式**:
1. 医療システムがVoiceDrive APIを呼び出してVD活動データ取得
2. 医療システムで全指標を統合計算
3. API-3で効率スコアを提供

---

### 不足3: 活動統計の集計機能

**現状**:
- ❌ 投稿数、投票数、承認待ち数がハードコード
- ❌ DB集計ロジック未実装

**必要な実装**:

#### UserActivityService.ts（新規作成）

```typescript
// src/services/UserActivityService.ts
import { prisma } from '../lib/prisma';

export class UserActivityService {
  /**
   * ユーザーの活動統計を取得
   */
  async getActivityStats(userId: string) {
    const [totalPosts, totalVotes, pendingApprovals] = await Promise.all([
      // 投稿数
      prisma.post.count({
        where: { authorId: userId }
      }),

      // 投票数
      prisma.vote.count({
        where: { userId: userId }
      }),

      // 承認待ち議題数
      prisma.approvalTask.count({
        where: {
          approverId: userId,
          status: 'pending'
        }
      })
    ]);

    return {
      totalPosts,
      totalVotes,
      pendingApprovals
    };
  }

  /**
   * 今月の投稿増加数
   */
  async getPostsThisMonth(userId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return await prisma.post.count({
      where: {
        authorId: userId,
        createdAt: { gte: startOfMonth }
      }
    });
  }

  /**
   * 今週の投票増加数
   */
  async getVotesThisWeek(userId: string) {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return await prisma.vote.count({
      where: {
        userId: userId,
        createdAt: { gte: startOfWeek }
      }
    });
  }
}
```

#### Dashboard.tsx の修正

```typescript
// src/pages/Dashboard.tsx
import { UserActivityService } from '../services/UserActivityService';

export const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // 活動統計を取得
      const service = new UserActivityService();
      Promise.all([
        service.getActivityStats(user.id),
        service.getPostsThisMonth(user.id),
        service.getVotesThisWeek(user.id)
      ]).then(([stats, postsThisMonth, votesThisWeek]) => {
        setActivityStats({
          ...stats,
          postsThisMonth,
          votesThisWeek
        });
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && activityStats) {
      const baseStats: DashboardStat[] = [
        {
          label: '投稿したアイデア',
          value: activityStats.totalPosts,  // ← DB集計値
          change: `+${activityStats.postsThisMonth} 今月`,
          icon: <MessageSquare className="w-5 h-5" />,
          color: 'blue'
        },
        {
          label: '投票参加',
          value: activityStats.totalVotes,  // ← DB集計値
          change: `+${activityStats.votesThisWeek} 今週`,
          icon: <UserCheck className="w-5 h-5" />,
          color: 'green'
        }
      ];

      if (permission.isManager) {
        baseStats.push({
          label: '承認待ち議題',
          value: activityStats.pendingApprovals,  // ← DB集計値
          icon: <Award className="w-5 h-5" />,
          color: 'orange'
        });
      }

      // 部署効率は医療システムAPIから取得
      if (permission.canAccessAnalytics) {
        fetchDepartmentEfficiency(user.department).then(efficiency => {
          baseStats.push({
            label: '部署効率',
            value: `${efficiency.efficiencyScore}%`,  // ← API-3から取得
            change: efficiency.trend,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'purple'
          });
          setStats(baseStats);
        });
      } else {
        setStats(baseStats);
      }
    }
  }, [user, activityStats, permission]);

  // ...
};
```

---

## 🔄 医療システムへのAPI要求まとめ

### API-1: 職員情報取得（既存・拡張）

**エンドポイント**: `GET /api/employees/{employeeId}`

**追加要求フィールド**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "name": "山田 花子",
  "email": "hanako.yamada@obara-hospital.jp",
  "department": "内科",
  "facility": "小原病院",
  "profession": "看護師",
  "position": "主任",
  "permissionLevel": 6.0,
  "canPerformLeaderDuty": false,

  // ← 以下は拡張要求
  "permission": {
    "level": 6.0,
    "calculatedLevel": 6.2,
    "availableMenus": ["personal_station", "department_board", ...],
    "isNewcomer": false,
    "isManager": false,
    "isSystemAdmin": false,
    "canAccessAnalytics": false
  }
}
```

**優先度**: 🔴 HIGH
**理由**: Dashboard表示に必須

---

### API-2: 経験年数取得（新規）

**エンドポイント**: `GET /api/employees/{employeeId}/experience-summary`

**レスポンス**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "totalExperienceYears": 8.2,
  "yearsOfService": 4.5,
  "currentPositionYears": 2.1,
  "specialtyExperienceYears": 6.5,
  "calculatedAt": "2025-10-09T10:00:00Z"
}
```

**データソース**:
- `Employee.hireDate` → yearsOfService
- `WorkExperience`テーブル → totalExperienceYears
- `AssignmentHistory` → currentPositionYears

**更新頻度**: 週次バッチ（Webhook通知）

**優先度**: 🟡 MEDIUM
**理由**: Dashboard表示項目だが、初期は固定値でも可

---

### API-3: 部署効率データ（新規）

**エンドポイント**: `GET /api/analytics/department/{departmentId}/efficiency`

**レスポンス**:
```json
{
  "departmentId": "内科",
  "period": "2024-10",
  "efficiencyScore": 87.5,
  "trend": "+3.2%",
  "breakdown": {
    "taskCompletionRate": 92.0,
    "voiceDriveActivityScore": 83.0,
    "responseTimeScore": 88.5,
    "qualityScore": 89.0
  },
  "calculatedAt": "2025-10-09T00:00:00Z"
}
```

**計算要素**:
- タスク完了率（医療システム）: 40%
- VoiceDrive活動（VoiceDrive API呼び出し）: 20%
- 対応速度（医療システム）: 20%
- 品質スコア（医療システム）: 20%

**前提条件**:
- VoiceDrive側がAPI-4（活動統計API）を提供

**優先度**: 🟢 LOW
**理由**: 分析権限者のみ表示、初期は非表示でも可

---

### API-4: VoiceDrive活動統計（VoiceDrive提供→医療システム）

**エンドポイント**: `GET /api/voicedrive/employees/{employeeId}/activity-stats`

**VoiceDriveが提供**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "period": "2024-10-01 to 2024-10-31",
  "stats": {
    "totalPosts": 45,
    "totalVotes": 128,
    "totalFeedbackReceived": 67,
    "totalFeedbackSent": 52,
    "projectsProposed": 3,
    "surveysCompleted": 12,
    "loginDays": 22,
    "averageEngagement": 85.5
  }
}
```

**用途**: 医療システムがAPI-3の部署効率計算に使用

**優先度**: 🟡 MEDIUM
**理由**: API-3の前提条件

---

## 📦 VoiceDrive DB変更要件

### 変更1: User テーブルフィールド追加

```prisma
model User {
  id                    String    @id @default(cuid())
  employeeId            String    @unique
  email                 String    @unique
  name                  String
  department            String?
  facilityId            String?
  profession            String?
  position              String?
  experienceYears       Float?    // ← 追加
  permissionLevel       Float?
  canPerformLeaderDuty  Boolean   @default(false)
  professionCategory    String?
  parentId              String?
  role                  String?
  accountType           String    @default("regular")
  avatar                String?
  lastLoginAt           DateTime?
  loginCount            Int       @default(0)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  posts                 Post[]    @relation("PostAuthor")
  votes                 Vote[]
  comments              Comment[]
  approvalTasksRequested ApprovalTask[] @relation("ApprovalRequester")
  approvalTasksAssigned  ApprovalTask[] @relation("ApprovalApprover")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_experience_years_to_user
```

**初期値**: `null`（医療システムから同期後に更新）

---

### 変更2: 新規テーブル

**結論**: ❌ 不要

既存テーブルで全機能をカバー可能：
- `User` - ユーザー情報キャッシュ
- `Post` - 投稿データ
- `Vote` - 投票データ
- `ApprovalTask` - 承認タスク

---

## 🛠️ 実装優先順位

### Phase 1: 基本表示（1週間）

**優先度**: 🔴 HIGH

1. ✅ User.experienceYears フィールド追加
2. ✅ UserActivityService.ts 実装
3. ✅ Dashboard.tsx の統計データDB集計化
4. ⚠️ 医療システムAPI-1拡張（permission情報）
5. ⚠️ 医療システムAPI-2実装（経験年数）

**成果物**:
- 投稿数、投票数、承認待ち数が正しく表示
- 経験年数が医療システムから取得・表示

---

### Phase 2: 部署効率統合（2週間）

**優先度**: 🟡 MEDIUM

1. ✅ VoiceDrive API-4実装（活動統計提供）
2. ⚠️ 医療システムAPI-3実装（部署効率）
3. ✅ Dashboard.tsx に部署効率表示統合

**成果物**:
- 部署効率が医療システムから取得・表示
- VoiceDrive活動データが医療システムに提供

---

### Phase 3: リアルタイム更新（1週間）

**優先度**: 🟢 LOW

1. ⚠️ Webhook実装（経験年数更新通知）
2. ✅ バックグラウンド同期機能
3. ✅ キャッシュ更新ロジック

**成果物**:
- 経験年数が週次で自動更新
- 部署効率が日次で自動更新

---

## 🔒 セキュリティ・プライバシー考慮事項

### データアクセス制限

| データ | 表示条件 | 制限理由 |
|-------|---------|---------|
| 基本情報（氏名、部署） | 全ユーザー | ✅ 公開情報 |
| 経験年数 | 全ユーザー | ✅ 公開情報 |
| 投稿数、投票数 | 本人のみ | ⚠️ 個人活動データ |
| 承認待ち議題数 | 管理者のみ | ⚠️ 管理職機能 |
| 部署効率 | 分析権限者のみ | ⚠️ 組織分析データ |

### API認証

```typescript
// Dashboard.tsx での医療システムAPI呼び出し
const fetchDepartmentEfficiency = async (department: string) => {
  const response = await fetch(
    `/api/medical/analytics/department/${department}/efficiency`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,  // JWT認証
        'X-VoiceDrive-Client': 'dashboard-v1.0'
      }
    }
  );
  return response.json();
};
```

---

## 📈 パフォーマンス最適化

### キャッシュ戦略

| データ | 更新頻度 | キャッシュTTL | 取得方法 |
|-------|---------|------------|---------|
| ユーザー基本情報 | 変更時 | 1時間 | API-1 + Webhook |
| 経験年数 | 週次 | 7日 | API-2 + Webhook |
| 投稿数、投票数 | リアルタイム | なし | DB集計 |
| 部署効率 | 日次 | 1日 | API-3 |

### クエリ最適化

```typescript
// UserActivityService.ts - 最適化版
async getActivityStats(userId: string) {
  // 並列クエリで高速化
  const [totalPosts, totalVotes, pendingApprovals] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.vote.count({ where: { userId: userId } }),
    prisma.approvalTask.count({
      where: { approverId: userId, status: 'pending' }
    })
  ]);

  return { totalPosts, totalVotes, pendingApprovals };
}
```

**インデックス要件**:
```prisma
model Post {
  // ...
  @@index([authorId, createdAt])  // 投稿数集計用
}

model Vote {
  // ...
  @@index([userId, createdAt])  // 投票数集計用
}

model ApprovalTask {
  // ...
  @@index([approverId, status])  // 承認待ち集計用
}
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

- [ ] User.experienceYears フィールド追加
- [ ] Prismaマイグレーション実行
- [ ] UserActivityService.ts 実装
- [ ] Dashboard.tsx のハードコード削除
- [ ] Dashboard.tsx のDB集計統合
- [ ] VoiceDrive API-4実装（活動統計提供）
- [ ] 医療システムAPI呼び出し実装（API-2, API-3）
- [ ] エラーハンドリング実装
- [ ] ローディング状態表示
- [ ] 統合テスト

### 医療システム側への依頼

- [ ] API-1拡張（permission情報追加）
- [ ] API-2実装（経験年数取得）
- [ ] API-3実装（部署効率データ）
- [ ] Webhook実装（経験年数更新通知）
- [ ] API認証・認可設定
- [ ] レート制限設定
- [ ] テストデータ提供
- [ ] 統合テスト協力

---

## 📞 連絡事項

### 医療システムチームへの確認事項

1. **API-2（経験年数取得）の実装可否と納期**
   - WorkExperienceテーブルからの集計ロジック
   - 週次Webhook通知の設定

2. **API-3（部署効率データ）の計算方針**
   - 統合指標の計算式確認
   - VoiceDrive活動データの取得方法（API-4呼び出し）

3. **API-1の拡張範囲**
   - `permission`オブジェクトの詳細仕様
   - `availableMenus`配列の要素定義

4. **テスト環境での連携確認**
   - 統合テストスケジュール調整
   - テストデータ準備

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 | 担当 |
|------|----------|---------|------|
| 2025-10-09 | 1.0 | 初版作成 | VoiceDriveチーム |

---

**文書終了**

最終更新: 2025年10月9日
ステータス: ✅ 分析完了、医療チームレビュー待ち
次のアクション: Dashboard暫定マスターリスト作成 → 医療チームへ共有
