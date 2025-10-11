# 組織分析ページ DB要件分析

**文書番号**: DB-REQ-2025-1010-002
**作成日**: 2025年10月10日
**対象ページ**: https://voicedrive-v100.vercel.app/organization-analytics
**対象ファイル**: `src/pages/OrganizationAnalyticsPage.tsx`
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
組織分析ページは**Level 15+（人事各部門長以上）専用**の戦略的ダッシュボードで、議題化プロセスの分析と組織の声の可視化を提供します。

**現状**: **全データがハードコードされたダミーデータ**（35-81行目）

### 🎯 重大な発見

1. ✅ **議題追跡システムは完備**
   - `Post.agendaLevel`フィールドが存在し、6段階レベル管理
   - `AgendaLevelEngine`が実装済みで稼働中
   - `ManagementCommitteeAgenda`テーブルで委員会議題を管理

2. 🔴 **集計機能が完全に不足**
   - 組織レベルの統計集計サービスが存在しない
   - DBテーブル自体は揃っているが、集計ロジックが未実装

3. 🔴 **実装追跡フィールドが不足**
   - 委員会承認後の「実装状況」を追跡する仕組みが不足
   - `ManagementCommitteeAgenda`テーブルに実装追跡フィールドが必要

4. 🔴 **医療システムAPIが不足**
   - 部門マスタ取得API未実装
   - 職員総数取得API未実装

---

## 🔍 詳細分析

### 1. 組織健康度指標（152-186行目）

#### 表示内容
```typescript
const organizationHealth = {
  voiceActivity: 82,        // 声の活性度
  participationRate: 68,    // 参加率
  resolutionRate: 55,       // 解決率
  engagementScore: 74,      // エンゲージメントスコア
  crossDeptCollaboration: 61 // 部門間連携
};
```

#### 必要なデータソース

| 指標 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|------|---------|--------------|--------------|------|
| **声の活性度** | (投稿数 ÷ 職員数) × 100 | `Post`, `User` | VoiceDrive | 🔴 集計機能不足 |
| **参加率** | (投稿者数 ÷ 全職員数) × 100 | `Post.authorId`, `User` | VoiceDrive | 🔴 集計機能不足 |
| **解決率** | (決議済み ÷ 総議題数) × 100 | `Post.agendaLevel`, `ManagementCommitteeAgenda.decision` | VoiceDrive | 🔴 集計機能不足 |
| **エンゲージメントスコア** | (投票数 + コメント数 + フィードバック数) ÷ 投稿数 | `Vote`, `Comment`, `Feedback` | VoiceDrive | 🔴 集計機能不足 |
| **部門間連携** | クロス部門投票率 | `Vote`, `Post`, `User.department` | VoiceDrive | 🔴 集計機能不足 |

#### 解決策1: OrganizationAnalyticsService（新規作成）

**ファイル**: `src/services/OrganizationAnalyticsService.ts`

```typescript
/**
 * 組織分析サービス
 * Level 15+専用の組織レベル統計集計
 */
export class OrganizationAnalyticsService {

  /**
   * 組織健康度指標を計算
   */
  async calculateOrganizationHealth(period: 'week' | 'month' | 'quarter') {
    const dateRange = this.getDateRange(period);

    // 総職員数（医療システムから取得）
    const totalEmployees = await this.getTotalEmployees();

    // 投稿数
    const totalPosts = await prisma.post.count({
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        status: 'active'
      }
    });

    // 投稿者数（重複排除）
    const uniqueAuthors = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        status: 'active'
      }
    });

    // 声の活性度（投稿数 ÷ 職員数）
    const voiceActivity = Math.round((totalPosts / totalEmployees) * 100);

    // 参加率（投稿者数 ÷ 職員数）
    const participationRate = Math.round((uniqueAuthors.length / totalEmployees) * 100);

    // 解決率
    const resolutionRate = await this.calculateResolutionRate(dateRange);

    // エンゲージメントスコア
    const engagementScore = await this.calculateEngagementScore(dateRange);

    // 部門間連携スコア
    const crossDeptCollaboration = await this.calculateCrossDeptCollaboration(dateRange);

    return {
      voiceActivity,
      participationRate,
      resolutionRate,
      engagementScore,
      crossDeptCollaboration
    };
  }

  /**
   * 医療システムから総職員数を取得
   */
  private async getTotalEmployees(): Promise<number> {
    const response = await fetch('/api/medical-system/employees/count', {
      headers: {
        'Authorization': `Bearer ${process.env.MEDICAL_SYSTEM_API_TOKEN}`
      }
    });

    const data = await response.json();
    return data.totalEmployees;
  }
}
```

---

### 2. 議題化プロセスの進捗（188-218行目）

#### 表示内容
```typescript
const agendaProgress = {
  departmentLevel: 45,    // 部署内議題
  facilityLevel: 23,      // 施設議題
  corporateLevel: 12,     // 法人議題
  committeeSubmitted: 8,  // 委員会提出済み
  resolved: 15            // 決議済み
};
```

#### 必要なデータソース

| データ項目 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|-----------|---------|--------------|--------------|------|
| **部署内議題** | `DEPT_REVIEW` + `DEPT_AGENDA` レベルの投稿数 | `Post.agendaLevel` | VoiceDrive | ✅ テーブル存在 |
| **施設議題** | `FACILITY_AGENDA` レベルの投稿数 | `Post.agendaLevel` | VoiceDrive | ✅ テーブル存在 |
| **法人議題** | `CORP_REVIEW` + `CORP_AGENDA` レベルの投稿数 | `Post.agendaLevel` | VoiceDrive | ✅ テーブル存在 |
| **委員会提出済み** | 委員会議題として登録済み | `ManagementCommitteeAgenda.status='pending'` | VoiceDrive | ✅ テーブル存在 |
| **決議済み** | 委員会で決議完了 | `ManagementCommitteeAgenda.decision='approved'` | VoiceDrive | ✅ テーブル存在 |

**評価**: 🟢 **DB構造は完備** - 集計クエリのみ実装すれば動作可能

#### 解決策2: 議題進捗集計（実装例）

```typescript
/**
 * 議題化プロセスの進捗を取得
 */
async getAgendaProgress(period: 'week' | 'month' | 'quarter') {
  const dateRange = this.getDateRange(period);

  // 部署内議題（DEPT_REVIEW + DEPT_AGENDA）
  const departmentLevel = await prisma.post.count({
    where: {
      createdAt: { gte: dateRange.start, lte: dateRange.end },
      agendaLevel: { in: ['DEPT_REVIEW', 'DEPT_AGENDA'] },
      status: 'active'
    }
  });

  // 施設議題（FACILITY_AGENDA）
  const facilityLevel = await prisma.post.count({
    where: {
      createdAt: { gte: dateRange.start, lte: dateRange.end },
      agendaLevel: 'FACILITY_AGENDA',
      status: 'active'
    }
  });

  // 法人議題（CORP_REVIEW + CORP_AGENDA）
  const corporateLevel = await prisma.post.count({
    where: {
      createdAt: { gte: dateRange.start, lte: dateRange.end },
      agendaLevel: { in: ['CORP_REVIEW', 'CORP_AGENDA'] },
      status: 'active'
    }
  });

  // 委員会提出済み
  const committeeSubmitted = await prisma.managementCommitteeAgenda.count({
    where: {
      proposedDate: { gte: dateRange.start, lte: dateRange.end },
      status: { in: ['pending', 'in_review'] }
    }
  });

  // 決議済み
  const resolved = await prisma.managementCommitteeAgenda.count({
    where: {
      decidedDate: { gte: dateRange.start, lte: dateRange.end },
      decision: 'approved'
    }
  });

  return {
    departmentLevel,
    facilityLevel,
    corporateLevel,
    committeeSubmitted,
    resolved
  };
}
```

---

### 3. 委員会活動の効果測定（220-258行目）

#### 表示内容
```typescript
const committeeEffectiveness = {
  submitted: 32,           // 提出
  reviewed: 28,            // 審議完了
  approved: 21,            // 承認
  implemented: 15,         // 実装済み
  avgReviewDays: 12,       // 平均審議期間
  avgImplementDays: 45,    // 平均実装期間
};
```

#### 必要なデータソース

| データ項目 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|-----------|---------|--------------|--------------|------|
| **提出** | `status='pending'` or `'in_review'` | `ManagementCommitteeAgenda` | VoiceDrive | ✅ テーブル存在 |
| **審議完了** | `actualReviewDate IS NOT NULL` | `ManagementCommitteeAgenda` | VoiceDrive | ✅ テーブル存在 |
| **承認** | `decision='approved'` | `ManagementCommitteeAgenda` | VoiceDrive | ✅ テーブル存在 |
| **実装済み** | ❌ **フィールド不足** | **新規フィールド必要** | VoiceDrive | 🔴 **要追加** |
| **平均審議期間** | `AVG(actualReviewDate - proposedDate)` | `ManagementCommitteeAgenda` | VoiceDrive | ✅ 計算可能 |
| **平均実装期間** | ❌ **フィールド不足** | **新規フィールド必要** | VoiceDrive | 🔴 **要追加** |

#### 解決策3: ManagementCommitteeAgendaテーブルに実装追跡フィールドを追加

**prisma/schema.prisma**に追加:

```prisma
model ManagementCommitteeAgenda {
  // ... 既存フィールド

  // 🆕 実装追跡フィールド
  implementationStatus    String?    @default("not_started")
  // 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'

  implementationStartDate DateTime?  @map("implementation_start_date")  // 実装開始日
  implementationEndDate   DateTime?  @map("implementation_end_date")    // 実装完了日
  implementationProgress  Float?     @default(0) @map("implementation_progress") // 進捗率（0-100）
  implementationNotes     String?    @map("implementation_notes")       // 実装メモ

  @@index([implementationStatus])
  @@index([implementationEndDate])
}
```

---

### 4. 議題カテゴリ別分析（260-309行目）

#### 表示内容
```typescript
const categoryData = [
  { id: 'hr', name: '人事・採用', count: 28, resolved: 12, color: '...' },
  { id: 'education', name: '教育・研修', count: 22, resolved: 10, color: '...' },
  { id: 'workflow', name: '業務改善', count: 35, resolved: 18, color: '...' },
  { id: 'environment', name: '労働環境', count: 18, resolved: 8, color: '...' },
  { id: 'safety', name: '医療安全', count: 15, resolved: 9, color: '...' },
  { id: 'communication', name: 'コミュニケーション', count: 12, resolved: 5, color: '...' },
];
```

#### 必要なデータソース

| データ項目 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|-----------|---------|--------------|--------------|------|
| **カテゴリ別議題数** | `Post.proposalType` でグループ化 | `Post` | VoiceDrive | ⚠️ **マッピング必要** |
| **解決済み数** | 委員会決議承認数 | `ManagementCommitteeAgenda` | VoiceDrive | ✅ 可能 |

**問題**: `Post.proposalType`は`'operational' | 'communication' | 'innovation' | 'strategic'`の4種類のみ。UIで表示している6カテゴリとのマッピングが必要。

#### 解決策4: カテゴリマッピング定義

```typescript
// カテゴリマッピング
const CATEGORY_MAPPING = {
  'operational': ['業務改善', '医療安全'],
  'communication': ['コミュニケーション'],
  'innovation': ['教育・研修'],
  'strategic': ['人事・採用', '労働環境']
};

/**
 * カテゴリ別議題統計を取得
 */
async getCategoryStatistics(period: 'week' | 'month' | 'quarter') {
  const dateRange = this.getDateRange(period);

  const categories = [
    { id: 'hr', name: '人事・採用', proposalTypes: ['strategic'], agendaTypes: ['personnel'] },
    { id: 'education', name: '教育・研修', proposalTypes: ['innovation'], agendaTypes: ['committee_proposal'] },
    { id: 'workflow', name: '業務改善', proposalTypes: ['operational'], agendaTypes: ['committee_proposal'] },
    { id: 'environment', name: '労働環境', proposalTypes: ['strategic'], agendaTypes: ['facility_policy'] },
    { id: 'safety', name: '医療安全', proposalTypes: ['operational'], agendaTypes: ['committee_proposal'] },
    { id: 'communication', name: 'コミュニケーション', proposalTypes: ['communication'], agendaTypes: ['other'] },
  ];

  // 集計ロジック実装
  // ...
}
```

---

### 5. 部門別活性度（311-357行目）

#### 表示内容
```typescript
const departmentActivity = [
  { name: '医療療養病棟', posts: 42, agenda: 8, engagement: 85, trend: 'up' },
  { name: '回復期リハ病棟', posts: 38, agenda: 6, engagement: 78, trend: 'up' },
  // ...
];
```

#### 必要なデータソース

| データ項目 | 計算方法 | 必要なテーブル | データ管理責任 | 現状 |
|-----------|---------|--------------|--------------|------|
| **部門名** | 部門マスタ | 医療システム`DepartmentMaster` | 医療システム | 🔴 **API未実装** |
| **投稿数** | 部門別投稿数 | `Post`, `User.department` | VoiceDrive | ✅ 可能 |
| **議題化数** | 施設議題以上に到達した投稿数 | `Post.agendaLevel` | VoiceDrive | ✅ 可能 |
| **活性度** | (投票数 + コメント数) ÷ 投稿数 | `Vote`, `Comment` | VoiceDrive | ✅ 可能 |
| **トレンド** | 前期比較 | 前期データとの比較 | VoiceDrive | ✅ 可能 |

#### 解決策5: 部門別統計集計

```typescript
/**
 * 部門別活性度を取得
 */
async getDepartmentActivity(period: 'week' | 'month' | 'quarter') {
  const dateRange = this.getDateRange(period);
  const previousRange = this.getPreviousDateRange(period);

  // 部門リストを医療システムから取得
  const departments = await this.getDepartments();

  const departmentStats = await Promise.all(
    departments.map(async (dept) => {
      // 投稿数
      const posts = await prisma.post.count({
        where: {
          author: { department: dept.name },
          createdAt: { gte: dateRange.start, lte: dateRange.end },
          status: 'active'
        }
      });

      // 議題化数
      const agenda = await prisma.post.count({
        where: {
          author: { department: dept.name },
          createdAt: { gte: dateRange.start, lte: dateRange.end },
          agendaLevel: { in: ['FACILITY_AGENDA', 'CORP_REVIEW', 'CORP_AGENDA'] },
          status: 'active'
        }
      });

      // エンゲージメント計算
      const postsWithEngagement = await prisma.post.findMany({
        where: {
          author: { department: dept.name },
          createdAt: { gte: dateRange.start, lte: dateRange.end },
          status: 'active'
        },
        include: {
          votes: true,
          comments: true
        }
      });

      const totalEngagement = postsWithEngagement.reduce((sum, post) => {
        return sum + post.votes.length + post.comments.length;
      }, 0);

      const engagement = posts > 0
        ? Math.round((totalEngagement / posts) * 10)
        : 0;

      // トレンド計算
      const previousPosts = await prisma.post.count({
        where: {
          author: { department: dept.name },
          createdAt: { gte: previousRange.start, lte: previousRange.end },
          status: 'active'
        }
      });

      const trend = posts > previousPosts ? 'up'
        : posts < previousPosts ? 'down'
        : 'stable';

      return { name: dept.name, posts, agenda, engagement, trend };
    })
  );

  return departmentStats.sort((a, b) => b.posts - a.posts);
}
```

---

## 📊 データ管理責任マトリクス

### OrganizationAnalyticsPage専用データ

| データカテゴリ | VoiceDrive | 医療システム | 提供方法 | 備考 |
|--------------|-----------|-------------|---------|------|
| **投稿データ** | ✅ マスタ | ❌ | - | `Post`, `Vote`, `Comment` |
| **議題レベル** | ✅ マスタ | ❌ | - | `Post.agendaLevel`（計算済み） |
| **委員会議題** | ✅ マスタ | ❌ | - | `ManagementCommitteeAgenda` |
| **決議情報** | ✅ マスタ | ❌ | - | `ManagementCommitteeAgenda.decision` |
| **実装追跡** | 🔴 不足 | ❌ | - | **新規フィールド必要** |
| **部門マスタ** | キャッシュ | ✅ マスタ | API | `DepartmentMaster` |
| **職員総数** | ❌ | ✅ マスタ | API | Employee集計 |

---

## 📋 必要な追加テーブル・フィールド一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. ManagementCommitteeAgenda テーブルの拡張**

```prisma
model ManagementCommitteeAgenda {
  // ... 既存フィールド

  // 🆕 実装追跡フィールド
  implementationStatus    String?    @default("not_started") @map("implementation_status")
  implementationStartDate DateTime?  @map("implementation_start_date")
  implementationEndDate   DateTime?  @map("implementation_end_date")
  implementationProgress  Float?     @default(0) @map("implementation_progress")
  implementationNotes     String?    @map("implementation_notes")

  @@index([implementationStatus])
  @@index([implementationEndDate])
}
```

**理由**:
- 委員会活動の効果測定に必須
- 平均実装期間の計算に必要
- 実装済み数の集計に必要

**影響範囲**:
- OrganizationAnalyticsPage: 220-258行目（委員会活動の効果測定）

---

**B. OrganizationAnalyticsService（新規作成）**

**ファイル**: `src/services/OrganizationAnalyticsService.ts`

**機能**:
- 組織健康度指標の計算
- 議題化プロセス進捗の集計
- 委員会活動効果測定
- カテゴリ別統計
- 部門別活性度計算

**推定実装時間**: 2-3日

---

### 2. 医療システム側で追加が必要

#### 🔴 優先度: 高（即対応）

**C. 部門マスタAPI**

**エンドポイント**: `GET /api/departments`

**レスポンス例**:
```json
{
  "departments": [
    {
      "id": "dept-001",
      "name": "医療療養病棟",
      "facilityId": "tategami-hospital",
      "facilityName": "立神リハビリテーション温泉病院",
      "employeeCount": 45,
      "isActive": true
    }
  ]
}
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP

---

**D. 職員総数取得API**

**エンドポイント**: `GET /api/employees/count`

**レスポンス例**:
```json
{
  "totalEmployees": 245,
  "byFacility": {
    "tategami-hospital": 120,
    "obara-hospital": 100,
    "headquarters": 25
  },
  "activeOnly": true
}
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP

---

## 🎯 実装優先順位

### Phase 1: 基本統計の実装（2-3日）

**目標**: OrganizationAnalyticsPageが基本的に動作する

1. 🔴 **OrganizationAnalyticsService作成**
   - 組織健康度指標の計算
   - 議題化プロセス進捗の集計
   - カテゴリ別統計
   - 部門別活性度

2. 🔴 **医療システムAPI実装**
   - GET /api/departments
   - GET /api/employees/count

3. 🔴 **OrganizationAnalyticsPageの修正**
   - ダミーデータをAPI呼び出しに置き換え
   - ローディング状態の追加
   - エラーハンドリング

4. 🔴 **API実装**
   - GET /api/organization-analytics

**このPhaseで動作する機能**:
- ✅ 組織健康度指標（実データ）
- ✅ 議題化プロセス進捗（実データ）
- ⚠️ 委員会活動効果測定（一部ダミー：実装追跡未実装）
- ✅ カテゴリ別分析（実データ）
- ✅ 部門別活性度（実データ）

---

### Phase 2: 委員会追跡の強化（1-2日）

**目標**: 委員会活動の効果測定が正確になる

1. 🔴 **ManagementCommitteeAgendaテーブル拡張**
   - 実装追跡フィールド追加
   - マイグレーション実行

2. 🔴 **委員会管理画面の拡張**
   - 実装ステータス更新UI
   - 実装完了日入力

3. 🔴 **集計ロジック更新**
   - 平均実装期間の計算
   - 実装済み数の集計

**このPhaseで動作する機能**:
- ✅ 委員会活動効果測定（完全実データ）
- ✅ 実装追跡

---

### Phase 3: 戦略的インサイト（AI分析）（2-3日）

**目標**: AI分析によるインサイト提供

1. 🟡 **AI分析サービス実装**
   - 部門別トレンド分析
   - 異常検知
   - 推奨アクション生成

2. 🟡 **インサイト表示機能**
   - 注目ポイントの自動生成
   - ポジティブな動きの検出

**このPhaseで動作する機能**:
- ✅ 戦略的インサイト（AI分析）
- ✅ 自動アラート

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1
- [ ] OrganizationAnalyticsService作成
- [ ] 組織健康度指標の計算実装
- [ ] 議題化プロセス進捗の集計実装
- [ ] カテゴリ別統計の実装
- [ ] 部門別活性度の実装
- [ ] API実装（`/api/organization-analytics`）
- [ ] OrganizationAnalyticsPageの修正
- [ ] ローディング状態の追加
- [ ] エラーハンドリング

#### Phase 2
- [ ] ManagementCommitteeAgendaテーブルに実装追跡フィールド追加
- [ ] マイグレーション実行
- [ ] 委員会効果測定の完全実装
- [ ] 実装ステータス更新UI

#### Phase 3
- [ ] AI分析サービス実装
- [ ] インサイト生成ロジック
- [ ] アラート機能

### 医療システム側の実装

- [ ] 部門マスタAPI実装 (`GET /api/departments`)
- [ ] 職員総数取得API実装 (`GET /api/employees/count`)
- [ ] API仕様書更新
- [ ] 単体テスト作成

### テスト

- [ ] OrganizationAnalyticsServiceの単体テスト
- [ ] 統計集計の精度テスト
- [ ] パフォーマンステスト（大量データ）
- [ ] E2Eテスト（OrganizationAnalyticsPage全機能）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)
- [prisma/schema.prisma](../../prisma/schema.prisma)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
次回レビュー: Phase 1実装後
