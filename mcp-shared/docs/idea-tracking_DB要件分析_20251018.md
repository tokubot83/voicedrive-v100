# アイデア追跡（Idea Tracking - プロジェクトモード）DB要件分析

**文書番号**: IT-DB-2025-1018-001
**作成日**: 2025年10月18日
**作成者**: VoiceDriveチーム
**対象機能**: アイデア声追跡（プロジェクトモード）
**重要度**: 🔴 超重要
**ステータス**: 詳細分析完了

---

## 📋 エグゼクティブサマリー

### 機能概要

アイデア声追跡機能（プロジェクトモード）は、職員の改善提案が**プロジェクト化されるまでの進捗を5段階のレベルで追跡**する最重要機能です。議題モード（6段階）とは異なり、**スコアベースで自動的にプロジェクトレベルが判定**され、一定水準（100点）に達するとプロジェクト化が可能になります。

**主要機能**:
1. **プロジェクトレベル追跡** - PENDING → TEAM → DEPARTMENT → FACILITY → ORGANIZATION の5段階
2. **スコア計算** - 投票エンゲージメントから自動計算（ユーザー権限重み付き）
3. **プロジェクト化判定** - 100点以上でチームプロジェクト開始可能
4. **進捗可視化** - 次のレベルまでの残りポイント・達成率表示
5. **統計サマリー** - 総アイデア数、プロジェクト化数、平均スコア

### プロジェクトレベルと閾値

| レベル | スコア範囲 | 承認者 | 説明 |
|--------|-----------|--------|------|
| **PENDING** | 0-99点 | - | アイデア段階（プロジェクト化前） |
| **TEAM** | 100-199点 | 主任（Level 6） | チームプロジェクト（5-15名規模） |
| **DEPARTMENT** | 200-399点 | 師長（Level 8） | 部署横断プロジェクト（15-30名規模） |
| **FACILITY** | 400-799点 | 事務長（Level 11） | 施設横断プロジェクト（30-60名規模） |
| **ORGANIZATION** | 800点以上 | 院長（Level 13） | 法人プロジェクト（60名以上規模） |

**重要**: 100点 = プロジェクト化開始の閾値（TEAM レベル）

### データ管理責任の原則

データ管理責任分界点定義書（DM-DEF-2025-1008-001）に基づき：

| データ項目 | VoiceDrive | 医療システム | 提供方法 |
|-----------|-----------|-------------|---------|
| **投稿データ** | ✅ マスタ | ❌ | - |
| **プロジェクトスコア** | ✅ 計算・保持 | ❌ | - |
| **プロジェクトレベル** | ✅ 判定・保持 | ❌ | - |
| **投票エンゲージメント** | ✅ マスタ | ❌ | - |
| **レベル履歴** | ✅ マスタ | ❌ | - |
| **職員情報** | キャッシュ | ✅ マスタ | API |
| **部署・施設マスタ** | キャッシュ | ✅ マスタ | API |

**原則**: プロジェクト追跡データはVoiceDrive 100%管轄、職員・組織マスタのみ医療システムから取得

---

## 🎯 現状分析

### A. IdeaVoiceTrackingPage.tsx 機能詳細（プロジェクトモード）

**ファイルパス**: `src/pages/IdeaVoiceTrackingPage.tsx`
**コードサイズ**: 345行

#### 1. 画面構成

```
ヘッダー「アイデアの声 追跡」
  ↓
統計サマリー
  - 📊 総アイデア数
  - ⏳ アイデア段階（PENDING）
  - 🚀 プロジェクト化済み（TEAM以上）
  - 📈 平均スコア
  ↓
フィルタ・ソート
  - すべて / PENDING / プロジェクト化済み
  - 新しい順 / スコア順 / レベル順
  ↓
アイデアカード一覧
  ↓
各カードに表示:
  - タイトル
  - 現在のプロジェクトレベルバッジ
  - 現在スコア
  - 次のレベルまでの進捗バー
  - 投票数・支持率
  - プロジェクト化達成バッジ（100点以上）
```

#### 2. データ取得フロー (lines 26-38)

```typescript
useEffect(() => {
  if (user) {
    loadMyIdeas();
  }
}, [user]);

const loadMyIdeas = () => {
  // TODO: 実際のAPI実装（line 34）
  // 現在はデモデータを使用
  setMyIdeas(getDemoMyIdeas());
};
```

**必要なAPI**:
- `GET /api/my/ideas` - 自分のアイデア声一覧（プロジェクトスコア・レベル付き）

#### 3. プロジェクトレベル判定ロジック (lines 40-42)

```typescript
const getProjectLevel = (score: number): ProjectLevel => {
  return projectPermissionService.getProjectLevelFromScore(score);
};

// ProjectPermissionService.ts (lines 270-276)
getProjectLevelFromScore(score: number): ProjectLevel {
  if (score >= 800) return 'ORGANIZATION';
  if (score >= 400) return 'FACILITY';
  if (score >= 200) return 'DEPARTMENT';
  if (score >= 100) return 'TEAM';
  return 'PENDING';
}
```

#### 4. スコア計算ロジック

**使用フック**: `useProjectScoring` (src/hooks/projects/useProjectScoring.ts)

```typescript
const calculateScore = (engagements: EngagementData[], proposalType?: string) => {
  return scoringEngine.calculateProjectScore(engagements, userWeights);
};
```

**スコア計算の仕組み** (src/utils/ProjectScoring.ts):

##### 投票レベル別重み
- `strongly-support`: 10.0 ポイント
- `support`: 5.0 ポイント
- `neutral`: 2.0 ポイント
- `oppose`: 1.0 ポイント
- `strongly-oppose`: 0.5 ポイント

##### 権限レベル別ユーザー重み（25段階対応）
- Level 1（新人）: 1.0倍
- Level 2（若手）: 1.5倍
- Level 3（中堅）: 2.0倍
- Level 4（ベテラン）: 2.5倍
- Level 5（副主任）: 3.0倍
- Level 6（主任）: 3.2倍
- Level 8（師長）: 4.0倍
- Level 10（部長）: 5.0倍
- Level 13（院長）: 6.0倍
- Level 18（理事）: 10.0倍

**計算式**:
```
スコア = Σ (投票レベル重み × ユーザー権限重み)
```

**例**:
- Level 6（主任）が strongly-support: 10.0 × 3.2 = 32.0 ポイント
- Level 1（新人）が support: 5.0 × 1.0 = 5.0 ポイント

#### 5. プロジェクト化判定 (lines 45-52)

```typescript
const getProjectThreshold = (): number => {
  return 100; // TEAM レベル = プロジェクト化開始
};

const isProjectized = (score: number): boolean => {
  return score >= getProjectThreshold();
};
```

#### 6. 進捗計算 (lines 55-77)

```typescript
const getScoreToNextLevel = (
  currentScore: number,
  projectLevel: ProjectLevel
): { nextLevel: ProjectLevel; remaining: number } | null => {
  const thresholds: Array<{ level: ProjectLevel; score: number }> = [
    { level: 'TEAM', score: 100 },
    { level: 'DEPARTMENT', score: 200 },
    { level: 'FACILITY', score: 400 },
    { level: 'ORGANIZATION', score: 800 }
  ];

  const currentIndex = thresholds.findIndex(t => t.level === projectLevel);
  const nextThreshold = thresholds[currentIndex + 1];

  if (!nextThreshold) return null;

  return {
    nextLevel: nextThreshold.level,
    remaining: nextThreshold.score - currentScore
  };
};
```

#### 7. 統計計算 (lines 79-93)

```typescript
const stats = useMemo(() => {
  const total = myIdeas.length;
  const pending = myIdeas.filter(idea => {
    const score = calculateScore(
      convertVotesToEngagements(idea.votes || {}),
      idea.proposalType
    );
    return score < 100;
  }).length;
  const projectized = total - pending;
  const avgScore = total > 0
    ? Math.round(myIdeas.reduce((sum, idea) => {
        return sum + calculateScore(
          convertVotesToEngagements(idea.votes || {}),
          idea.proposalType
        );
      }, 0) / total)
    : 0;

  return { total, pending, projectized, avgScore };
}, [myIdeas]);
```

#### 8. レベル別バッジデザイン (lines 126-166)

```typescript
const getLevelBadge = (level: ProjectLevel, score: number) => {
  const configs = {
    PENDING: {
      label: 'アイデア段階',
      icon: '💡',
      color: 'bg-gray-500/20 text-gray-400 border-gray-500'
    },
    TEAM: {
      label: 'チーム',
      icon: '👥',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500'
    },
    DEPARTMENT: {
      label: '部署',
      icon: '🏢',
      color: 'bg-green-500/20 text-green-400 border-green-500'
    },
    FACILITY: {
      label: '施設',
      icon: '🏥',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
    },
    ORGANIZATION: {
      label: '法人',
      icon: '🏛️',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500'
    }
  };

  return configs[level];
};
```

### B. ProjectPermissionService.ts 機能詳細

**ファイルパス**: `src/services/ProjectPermissionService.ts`
**コードサイズ**: 390行

#### 1. プロジェクトレベルごとの承認責任定義 (lines 59-110)

```typescript
export const PROJECT_RESPONSIBILITIES: ProjectResponsibility[] = [
  {
    projectLevel: 'PENDING',
    minPermissionLevel: 5,   // 副主任以上（代行）
    targetPermissionLevel: 6, // 主任
    description: 'アイデア段階の提案を確認',
    label: 'アイデア検討中 (0-99点)',
    nextLevel: 'TEAM',
    nextLevelThreshold: 100
  },
  {
    projectLevel: 'TEAM',
    minPermissionLevel: 7,   // 副師長以上（代行）
    targetPermissionLevel: 8, // 師長
    description: 'チームプロジェクトの開始を承認（5-15名規模）',
    label: 'チームプロジェクト (100-199点)',
    nextLevel: 'DEPARTMENT',
    nextLevelThreshold: 200
  },
  {
    projectLevel: 'DEPARTMENT',
    minPermissionLevel: 9,   // 副部長以上（代行）
    targetPermissionLevel: 10, // 部長
    description: '部署横断プロジェクトの開始を承認（15-30名規模）',
    label: '部署プロジェクト (200-399点)',
    nextLevel: 'FACILITY',
    nextLevelThreshold: 400
  },
  {
    projectLevel: 'FACILITY',
    minPermissionLevel: 11,  // 事務長（代行なし）
    targetPermissionLevel: 11, // 事務長
    description: '施設横断プロジェクトの開始を承認（30-60名規模）',
    label: '施設プロジェクト (400-799点)',
    nextLevel: 'ORGANIZATION',
    nextLevelThreshold: 800
  },
  {
    projectLevel: 'ORGANIZATION',
    minPermissionLevel: 12,  // 副院長以上（代行）
    targetPermissionLevel: 13, // 院長
    description: '法人プロジェクトの開始を承認（60名以上規模）',
    label: '法人プロジェクト (800点以上)'
  }
];
```

#### 2. 権限判定ロジック (lines 131-220)

```typescript
getPermission(user: User, projectLevel: ProjectLevel): ProjectPermission {
  const userLevel = user.permissionLevel || 1;
  const responsibility = PROJECT_RESPONSIBILITIES.find(
    r => r.projectLevel === projectLevel
  );

  // 承認者（プロジェクト開始を承認する権限）
  if (userLevel === responsibility.targetPermissionLevel) {
    return {
      canView: true,
      canApprove: true,
      canComment: true,
      canEmergencyOverride: false,
      canFormTeam: true,
      role: 'approver',
      badge: '✅ 承認者',
      badgeColor: 'bg-green-500/20 text-green-400 border-green-500'
    };
  }

  // 上位監督者（師長が副主任の承認するチームプロジェクトを見る）
  if (userLevel > responsibility.targetPermissionLevel) {
    if (userLevel - responsibility.targetPermissionLevel <= 2) {
      return {
        canView: true,
        canApprove: false,
        canComment: true,
        canEmergencyOverride: true,
        canFormTeam: false,
        role: 'supervisor',
        badge: '👁️ 上位者（閲覧・アドバイス）',
        badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      };
    }
    // 3段階以上上: 参考閲覧のみ
  }

  // フォールバック（下位承認者不在時）
  if (userLevel >= responsibility.minPermissionLevel &&
      userLevel < responsibility.targetPermissionLevel) {
    return {
      canView: true,
      canApprove: true,
      canComment: true,
      canEmergencyOverride: false,
      canFormTeam: true,
      role: 'approver',
      badge: `✅ 承認者（代行）`,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500'
    };
  }
}
```

### C. ProjectScoring.ts 機能詳細

**ファイルパス**: `src/utils/ProjectScoring.ts`
**コードサイズ**: 331行

#### 1. 閾値定義 (lines 33-39)

```typescript
private readonly baseThresholds = {
  TEAM: 50,           // チームレベル（予算上限5万円）
  DEPARTMENT: 100,    // 部門レベル（予算上限20万円）
  FACILITY: 300,      // 施設レベル（予算上限1000万円）
  ORGANIZATION: 600,  // 法人レベル（予算上限2000万円）
  STRATEGIC: 1200     // 法人戦略レベル（予算無制限）
};
```

**注意**: この閾値はProjectScoring.ts内部のもので、実際のUI表示（IdeaVoiceTrackingPage）では100/200/400/800を使用。将来的に統一が必要。

#### 2. 投稿タイプ別倍率 (lines 109-119)

```typescript
const typeMultiplier = {
  improvement: 1.0,      // 改善提案は標準
  community: 0.8,        // コミュニティは少し低い閾値
  report: 1.2,          // 公益通報は高い閾値
  operational: 1.0,      // 業務改善は標準
  communication: 0.9,    // コミュニケーションは少し低め
  innovation: 1.3,       // イノベーションは高い閾値（慎重に）
  strategic: 1.5         // 戦略提案は最も高い閾値（管理職重視）
};
```

#### 3. 組織規模調整 (lines 229-253)

```typescript
private getSizeMultiplier(
  organizationSize: number,
  projectScope?: ProjectScope
): number {
  const baseOrganizationSize = 400; // 小原病院本院規模
  const baseSizeRatio = organizationSize / baseOrganizationSize;
  const logMultiplier = Math.log(baseSizeRatio) / Math.log(2) * 0.3 + 1.0;

  // 0.5倍～2.0倍の範囲に制限
  const clampedMultiplier = Math.max(0.5, Math.min(2.0, logMultiplier));

  return clampedMultiplier;
}
```

---

## 📊 データ管理責任分界点（プロジェクトモード専用）

### カテゴリA: 投稿データ（プロジェクトスコア・レベル）

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 投稿ID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | cuid() |
| 投稿内容 (content) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 提案タイプ (proposalType) | ✅ 保持 | ❌ | VoiceDrive管轄 | operational/communication/innovation/strategic |
| **プロジェクトスコア (projectScore)** | ✅ 計算 | ❌ | VoiceDrive管轄 | 投票から自動計算 |
| **プロジェクトレベル (projectLevel)** | ✅ 判定 | ❌ | VoiceDrive管轄 | スコアから自動判定 |
| 投稿者ID (authorId) | ✅ 保持 | ✅ マスタ | 双方向 | 職員ID |
| 作成日時 (createdAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: プロジェクトスコア・レベルはVoiceDrive 100%管轄

### カテゴリB: 投票エンゲージメント

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| エンゲージメントID | ✅ 生成 | ❌ | VoiceDrive管轄 | - |
| ユーザーID (userId) | ✅ 保持 | ✅ マスタ | 双方向 | 職員ID |
| 投稿ID (postId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| エンゲージメントレベル (level) | ✅ 保持 | ❌ | VoiceDrive管轄 | strongly-support～strongly-oppose |
| タイムスタンプ (timestamp) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| ユーザー権限重み (userWeight) | ✅ 計算 | 権限レベルから | 医療 → VoiceDrive | 権限レベルから動的計算 |

**原則**: 投票エンゲージメントはVoiceDrive管轄、権限レベルのみ医療システムから取得

### カテゴリC: プロジェクトレベル履歴

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 履歴ID (id) | ✅ 生成 | ❌ | VoiceDrive管轄 | 新規テーブル |
| 投稿ID (postId) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 旧レベル (fromLevel) | ✅ 保持 | ❌ | VoiceDrive管轄 | PENDING/TEAM/DEPARTMENT/FACILITY/ORGANIZATION |
| 新レベル (toLevel) | ✅ 保持 | ❌ | VoiceDrive管轄 | PENDING/TEAM/DEPARTMENT/FACILITY/ORGANIZATION |
| 旧スコア (fromScore) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 新スコア (toScore) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 昇格日時 (upgradedAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: プロジェクトレベル履歴はVoiceDrive 100%管轄（新規テーブル必要）

### カテゴリD: プロジェクト承認情報

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 承認ステータス (approvalStatus) | ✅ 保持 | ❌ | VoiceDrive管轄 | pending/approved/rejected/on_hold/team_formation |
| 承認者ID (approvedBy) | ✅ 保持 | ✅ マスタ | 双方向 | 職員ID |
| 承認日時 (approvedAt) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |
| 拒否理由 (rejectionReason) | ✅ 保持 | ❌ | VoiceDrive管轄 | - |

**原則**: 承認情報はVoiceDrive管轄（schema.prismaに既存）

### カテゴリE: 職員・組織マスタ（参照のみ）

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 職員ID (employeeId) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 職員名 (name) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 権限レベル (permissionLevel) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由（スコア計算に必須） |
| 部署 (department) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |

**原則**: 職員・組織マスタは医療システムが管理、VoiceDriveはAPI経由で参照

---

## 🗄️ VoiceDrive側のDB要件

### 必要なテーブル（Prisma Schema）

#### 1. Post（投稿）- **既存テーブル（拡張必要）**

**現状** (schema.prisma lines 493-543):
```prisma
model Post {
  id                  String    @id @default(cuid())

  // 基本情報
  type                String    // 'improvement' | 'community' | 'report'
  content             String
  authorId            String
  anonymityLevel      String
  status              String    @default("active")

  // improvement投稿専用
  proposalType        String?   // 'operational' | 'communication' | 'innovation' | 'strategic'
  priority            String?

  // メタデータ
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // 議題モード用（既存）
  agendaScore         Int?      @default(0)
  agendaLevel         String?   // 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA'

  // ProjectApproval統合実装（2025-10-11）- **既存あり**
  approvalStatus      String?   @default("pending") @map("approval_status")
  approvedAt          DateTime? @map("approved_at")
  approvedBy          String?   @map("approved_by")
  rejectedAt          DateTime? @map("rejected_at")
  rejectedBy          String?   @map("rejected_by")
  rejectionReason     String?   @map("rejection_reason")

  // ProgressDashboard統合実装（2025-10-11）- **既存あり**
  projectDueDate      DateTime? @map("project_due_date")
  projectLevel        String?   @map("project_level") // **既存あり！**
  projectProgress     Int?      @default(0) @map("project_progress")

  @@index([projectLevel]) // **既存あり！**
}
```

**必要な拡張**:
```prisma
model Post {
  // ... 既存フィールド ...

  // プロジェクトモード用（拡張）
  projectScore              Int?      @default(0) @map("project_score")        // 追加必要
  projectLevel              String?   @map("project_level")                    // ✅ 既存あり
  currentProjectLevelStartedAt DateTime? @map("current_project_level_started_at") // 追加必要
  lastProjectLevelUpgrade   DateTime? @map("last_project_level_upgrade")      // 追加必要

  // 統計情報（キャッシュ）- パフォーマンス最適化
  totalEngagements          Int       @default(0)        // 追加必要: 総エンゲージメント数
  stronglySupportCount      Int       @default(0)        // 追加必要
  supportCount              Int       @default(0)        // 追加必要
  neutralCount              Int       @default(0)        // 追加必要
  opposeCount               Int       @default(0)        // 追加必要
  stronglyOpposeCount       Int       @default(0)        // 追加必要

  // リレーション（追加）
  projectLevelHistory       ProjectLevelHistory[]  // 追加必要: 新規テーブル

  @@index([projectScore])  // 追加必要
  @@index([currentProjectLevelStartedAt]) // 追加必要
}
```

**判定**:
- ✅ `projectLevel` フィールドは既存
- ❌ `projectScore` フィールドは**追加必要**
- ❌ `currentProjectLevelStartedAt`, `lastProjectLevelUpgrade` は**追加必要**
- ❌ エンゲージメント統計フィールドは**追加必要**

#### 2. ProjectLevelHistory（プロジェクトレベル履歴）- **新規テーブル（必須）**

```prisma
model ProjectLevelHistory {
  id              String    @id @default(cuid())
  postId          String

  // レベル変更
  fromLevel       String?   // PENDING, TEAM, DEPARTMENT, FACILITY, ORGANIZATION
  toLevel         String    // PENDING, TEAM, DEPARTMENT, FACILITY, ORGANIZATION

  // スコア記録
  fromScore       Int?
  toScore         Int

  // トリガー情報
  triggeredBy     String?   // vote_received, committee_submission, manual_upgrade
  triggeringUserId String?  // 昇格のトリガーとなった投票者ID（vote_receivedの場合）

  // タイムスタンプ
  upgradedAt      DateTime  @default(now())

  // メタデータ
  notes           String?   // 備考（手動昇格時の理由など）

  // リレーション
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([toLevel])
  @@index([upgradedAt])
}
```

**判定**: ❌ **新規テーブル作成が必須**

#### 3. ProjectApproval（プロジェクト承認記録）- **既存テーブル確認必要**

**現状**: schema.prismaに `ProjectApproval` モデルが存在するか確認が必要

**期待されるスキーマ**:
```prisma
model ProjectApproval {
  id                String    @id @default(cuid())
  postId            String
  projectLevel      String    @map("project_level") // 'PENDING' | 'TEAM' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION'
  projectScore      Int       @map("project_score") // 承認時のスコア

  // 承認者情報
  approverId        String    @map("approver_id")
  approvedAt        DateTime  @map("approved_at")

  // 承認詳細
  approvalType      String    @map("approval_type") // 'standard' | 'emergency' | 'delegated'
  comments          String?

  // リレーション
  post              Post      @relation(fields: [postId], references: [id])
  approver          User      @relation(fields: [approverId], references: [id])

  @@index([postId])
  @@index([projectLevel])
  @@index([approverId, projectLevel]) // 承認者別レベル別統計取得用
}
```

**判定**: schema.prisma lines 2059-2082 に**既存あり**（確認済み）

#### 4. Vote / VoteHistory（投票履歴）- **既存テーブル（確認）**

**VoteHistory** は既存確認済み (schema.prisma lines 445-466)

**必要な確認**:
- `voteOption` フィールドが `strongly-support` / `support` / `neutral` / `oppose` / `strongly-oppose` に対応しているか
- `voteWeight` フィールドが権限レベル重み計算に使用可能か

**判定**: ✅ 既存スキーマで対応可能（PostTracking分析で確認済み）

---

## 🔌 必要なAPI要件（VoiceDrive側）

### API-IT-1: 自分のアイデア一覧取得（プロジェクトスコア付き）

**エンドポイント**: `GET /api/my/ideas`

**Query Parameters**:
- `limit` (number, optional): 取得件数（デフォルト: 50）
- `offset` (number, optional): オフセット（デフォルト: 0）
- `filter` (string, optional): `all` | `pending` | `projectized`（デフォルト: `all`）
- `orderBy` (string, optional): `createdAt_desc` | `projectScore_desc` | `projectLevel_asc`（デフォルト: `createdAt_desc`）

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "post-001",
      "content": "新人教育プログラムの体系化とメンター制度の導入を提案します",
      "type": "improvement",
      "proposalType": "operational",
      "projectScore": 156,
      "projectLevel": "TEAM",
      "currentProjectLevelStartedAt": "2025-10-10T14:00:00Z",
      "lastProjectLevelUpgrade": "2025-10-10T14:00:00Z",
      "totalEngagements": 41,
      "stronglySupportCount": 15,
      "supportCount": 22,
      "neutralCount": 3,
      "opposeCount": 1,
      "stronglyOpposeCount": 0,
      "supportRate": 90,
      "isProjectized": true,
      "createdAt": "2025-09-28T10:00:00Z",
      "updatedAt": "2025-10-15T16:30:00Z"
    }
  ],
  "stats": {
    "total": 24,
    "pending": 18,
    "projectized": 6,
    "avgScore": 68
  },
  "pagination": {
    "total": 24,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### API-IT-2: プロジェクトレベル履歴取得

**エンドポイント**: `GET /api/posts/:postId/project-level-history`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "history-001",
      "fromLevel": "PENDING",
      "toLevel": "TEAM",
      "fromScore": 95,
      "toScore": 105,
      "triggeredBy": "vote_received",
      "triggeringUserId": "user-123",
      "upgradedAt": "2025-10-10T14:00:00Z"
    },
    {
      "id": "history-002",
      "fromLevel": null,
      "toLevel": "PENDING",
      "fromScore": null,
      "toScore": 0,
      "triggeredBy": "post_created",
      "upgradedAt": "2025-09-28T10:00:00Z"
    }
  ]
}
```

### API-IT-3: プロジェクトスコア再計算（管理用）

**エンドポイント**: `POST /api/posts/:postId/recalculate-project-score`

**Request Body**:
```json
{
  "reason": "manual_recalculation"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "postId": "post-001",
    "oldScore": 150,
    "newScore": 156,
    "oldLevel": "TEAM",
    "newLevel": "TEAM",
    "levelChanged": false,
    "recalculatedAt": "2025-10-18T10:00:00Z"
  }
}
```

### API-IT-4: プロジェクト承認実行

**エンドポイント**: `POST /api/projects/:postId/approve`

**Request Body**:
```json
{
  "approvalType": "standard",
  "comments": "チーム編成を開始します。リーダーは田中さんにお願いします。"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "approvalId": "approval-001",
    "postId": "post-001",
    "projectLevel": "TEAM",
    "projectScore": 156,
    "approverId": "user-manager-001",
    "approvedAt": "2025-10-18T10:30:00Z",
    "approvalType": "standard"
  }
}
```

---

## 🔄 議題モード vs プロジェクトモードの違い

### 比較表

| 項目 | 議題モード | プロジェクトモード |
|------|-----------|------------------|
| **ファイル** | IdeaVoiceTracking.tsx | IdeaVoiceTrackingPage.tsx |
| **ルート** | - | `/idea-tracking` |
| **レベル数** | 6段階 | 5段階 |
| **レベル名** | PENDING → DEPT_REVIEW → DEPT_AGENDA → FACILITY_AGENDA → CORP_REVIEW → CORP_AGENDA | PENDING → TEAM → DEPARTMENT → FACILITY → ORGANIZATION |
| **スコアフィールド** | `agendaScore` | `projectScore` |
| **レベルフィールド** | `agendaLevel` | `projectLevel` |
| **閾値** | 30, 50, 100, 300, 600 | 100, 200, 400, 800 |
| **重要閾値** | 50点（DEPT_AGENDA = 部署議題化） | 100点（TEAM = プロジェクト化） |
| **権限判定** | AgendaVisibilityEngine | ProjectPermissionService |
| **スコア計算** | 議題スコア計算 | ProjectScoringEngine（権限重み付き） |
| **承認フロー** | 委員会提出フロー | プロジェクト承認フロー |
| **履歴テーブル** | AgendaLevelHistory | ProjectLevelHistory |
| **目的** | 会議議題化追跡 | プロジェクト化追跡 |

### データベーススキーマの共存

**Post テーブルに両方のフィールドが必要**:
```prisma
model Post {
  // 議題モード用
  agendaScore         Int?      @default(0)
  agendaLevel         String?

  // プロジェクトモード用
  projectScore        Int?      @default(0)  // 追加必要
  projectLevel        String?                // 既存あり

  // 両方の履歴テーブル
  agendaLevelHistory    AgendaLevelHistory[]
  projectLevelHistory   ProjectLevelHistory[]  // 追加必要
}
```

**同じ投稿が両方のモードで進行可能**:
- 例: 議題スコア 120点（FACILITY_AGENDA）、プロジェクトスコア 180点（TEAM）

---

## 🚨 不足項目の洗い出し

### 1. テーブル・フィールド不足

| 不足項目 | 現状 | 必要な対応 | 優先度 |
|---------|------|----------|-------|
| **Post.projectScore** | ❌ なし | フィールド追加 | 🔴 超重要 |
| **Post.currentProjectLevelStartedAt** | ❌ なし | フィールド追加 | 🟡 中 |
| **Post.lastProjectLevelUpgrade** | ❌ なし | フィールド追加 | 🟡 中 |
| **Post.totalEngagements** | ❌ なし | フィールド追加 | 🟢 低（計算可能） |
| **Post.stronglySupportCount** | ❌ なし | フィールド追加 | 🟢 低（計算可能） |
| **Post.supportCount** | ❌ なし | フィールド追加 | 🟢 低（計算可能） |
| **ProjectLevelHistory テーブル** | ❌ なし | 新規テーブル作成 | 🔴 超重要 |

### 2. API不足

| 不足API | 現状 | 必要な対応 | 優先度 |
|--------|------|----------|-------|
| **GET /api/my/ideas** | ❌ なし | 新規実装 | 🔴 超重要 |
| **GET /api/posts/:postId/project-level-history** | ❌ なし | 新規実装 | 🟡 中 |
| **POST /api/posts/:postId/recalculate-project-score** | ❌ なし | 新規実装（管理用） | 🟢 低 |

### 3. 自動処理不足

| 不足処理 | 現状 | 必要な対応 | 優先度 |
|---------|------|----------|-------|
| **投票受付時のスコア再計算** | ❌ なし | 投票API実装時に追加 | 🔴 超重要 |
| **レベル自動昇格判定** | ❌ なし | スコア更新時のトリガー実装 | 🔴 超重要 |
| **ProjectLevelHistory自動記録** | ❌ なし | レベル変更時のトリガー実装 | 🔴 超重要 |

### 4. 閾値不整合

| 不整合箇所 | ProjectScoring.ts | IdeaVoiceTrackingPage.tsx | 推奨値 |
|----------|-------------------|--------------------------|-------|
| TEAM | 50 | 100 | **100** |
| DEPARTMENT | 100 | 200 | **200** |
| FACILITY | 300 | 400 | **400** |
| ORGANIZATION | 600 | 800 | **800** |

**対応**: ProjectScoring.ts の閾値を UI 側に合わせて修正する必要あり

---

## 📝 実装優先順位

### Phase 1: 基本機能実装（最優先）

**スケジュール**: 10/19-10/26（8日間）

**実装内容**:
1. ✅ Post モデル拡張（projectScore, currentProjectLevelStartedAt 追加）
2. ✅ ProjectLevelHistory テーブル作成
3. ✅ API-IT-1: 自分のアイデア一覧取得
4. ✅ API-IT-2: プロジェクトレベル履歴取得
5. ✅ ProjectScoring.ts 閾値修正（100/200/400/800に統一）

**成功基準**:
- IdeaVoiceTrackingPage.tsx が実APIで動作
- プロジェクトスコア・レベルが正確に判定される
- デモデータから実データへの切り替え完了

### Phase 2: 自動昇格機能（重要）

**スケジュール**: 10/27-11/3（7日間）

**実装内容**:
1. ✅ 投票受付時の自動スコア再計算
2. ✅ プロジェクトレベル自動昇格判定
3. ✅ ProjectLevelHistory 自動記録
4. ✅ リアルタイム通知（WebSocket）

**成功基準**:
- 投票が100点に到達したら自動的にTEAMレベルに昇格
- 昇格イベントが履歴に記録される
- 投稿者にリアルタイム通知が届く

### Phase 3: プロジェクト承認フロー

**スケジュール**: 11/4-11/11（7日間）

**実装内容**:
1. ✅ API-IT-4: プロジェクト承認実行
2. ✅ 承認者権限判定（ProjectPermissionService統合）
3. ✅ チーム編成UI実装
4. ✅ 承認履歴表示

**成功基準**:
- 主任（Level 6）がTEAMレベルのプロジェクトを承認できる
- 師長（Level 8）がDEPARTMENTレベルのプロジェクトを承認できる
- 承認後、プロジェクト進捗管理画面に遷移

---

## 🔗 関連ドキュメント

- **PostTracking_DB要件分析_20251009.md** - 議題モード追跡（6段階）
- **PersonalStation_DB要件分析_20251013.md** - 個人ステーション
- **unified-account-level-definition.json** - 25段階権限レベル定義
- **DM-DEF-2025-1008-001** - データ管理責任分界点定義書

---

**文書終了**
