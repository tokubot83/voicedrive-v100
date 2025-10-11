# CorporateAgendaDashboard（法人全体議題化ダッシュボード）ページ DB要件分析

**文書番号**: CORP-AGENDA-DB-2025-1011-001
**作成日**: 2025年10月11日
**対象ページ**: https://voicedrive-v100.vercel.app/corporate-agenda-dashboard
**対象ユーザー**: Level 18（理事長・法人事務局長）
**目的**: 法人全体議題化ダッシュボードページの全機能を分析し、必要なDB要件を明確化

---

## 📋 エグゼクティブサマリー

### ページ概要
CorporateAgendaDashboardページは、**Level 18（理事長・法人事務局長）** が法人全体（全10施設）の議題化プロセス稼働状況を統合的に把握するためのダッシュボードです。

### 主要機能（5セクション）
1. **法人全体KPI**: 総投稿数、平均参加率、平均解決率、平均処理日数
2. **施設別状況**: 全10施設の詳細統計
3. **アラート**: 参加率低下、処理日数増加、スコア低下の警告
4. **施設タイプ別統計**: 総合病院、地域医療センター、リハビリ等5タイプの集計
5. **全施設詳細テーブル**: 10施設の一覧表示

### データ管理責任
- **VoiceDrive**: 100%（既存データの集計表示のみ）
- **医療システム**: 施設マスタAPI提供のみ

### 必要なDB変更
- **新規テーブル**: ❌ 不要
- **既存テーブル拡張**: ❌ 不要
- **新規フィールド**: ❌ 不要

**理由**: 全て既存のPost、User、Voteテーブルから集計可能

---

## 🎯 ページ機能詳細分析

### 1. 法人全体KPI（corporateKPIs）

#### 表示内容（lines 37-66）
```typescript
const corporateKPIs: KPISummary[] = [
  {
    label: '総投稿数（全施設）',
    value: '12,847',
    change: '+8.2%',
    trend: 'up',
    status: 'good'
  },
  {
    label: '平均参加率',
    value: '64.3%',
    change: '+2.1%',
    trend: 'up',
    status: 'good'
  },
  {
    label: '平均解決率',
    value: '58.7%',
    change: '-1.3%',
    trend: 'down',
    status: 'warning'
  },
  {
    label: '平均処理日数',
    value: '26.4日',
    change: '-3.8日',
    trend: 'up',
    status: 'good'
  }
];
```

#### データソース分析

| KPI項目 | 計算ロジック | 使用テーブル |
|---------|------------|------------|
| **総投稿数** | COUNT(Post) | Post |
| **平均参加率** | UNIQUE(authorId) / totalEmployees * 100の全施設平均 | Post, User（医療システムAPI） |
| **平均解決率** | COUNT(Post WHERE status = 'RESOLVED') / COUNT(Post) * 100の全施設平均 | Post |
| **平均処理日数** | AVG(resolvedAt - createdAt)の全施設平均 | Post |

**結論**: ✅ **既存テーブルで対応可能（新規テーブル不要）**

---

### 2. 施設別状況（facilities）

#### 表示内容（lines 69-200）
```typescript
const facilities: FacilityStatus[] = [
  {
    id: 'F001',
    name: '中央総合病院',
    type: '総合病院',
    totalVoices: 3247,
    activeVoices: 487,
    resolvedVoices: 1842,
    participationRate: 72,
    avgProcessTime: 24,
    healthScore: 85,
    lastUpdated: '2時間前',
    trend: 'up'
  },
  // ... 全10施設
];
```

#### データソース分析

| フィールド | 計算ロジック | 使用テーブル |
|-----------|------------|------------|
| **id** | 施設ID | 医療システムAPI |
| **name** | 施設名 | 医療システムAPI |
| **type** | 施設タイプ | 医療システムAPI |
| **totalVoices** | COUNT(Post WHERE User.facilityId = ?) | Post, User |
| **activeVoices** | COUNT(Post WHERE status = 'ACTIVE' AND User.facilityId = ?) | Post, User |
| **resolvedVoices** | COUNT(Post WHERE status = 'RESOLVED' AND User.facilityId = ?) | Post, User |
| **participationRate** | UNIQUE(authorId) / facilityEmployeeCount * 100 | Post, User, 医療システムAPI |
| **avgProcessTime** | AVG(resolvedAt - createdAt) WHERE facilityId = ? | Post, User |
| **healthScore** | 計算式（参加率 * 0.4 + 解決率 * 0.3 + 処理速度スコア * 0.3） | 計算値 |
| **lastUpdated** | MAX(updatedAt) WHERE facilityId = ? | Post, User |
| **trend** | 前月比較 | 計算値 |

**結論**: ✅ **既存テーブル + 医療システムAPI（施設マスタ）で対応可能**

---

### 3. アラート（alerts）

#### 表示内容（lines 242-264）
```typescript
const alerts = [
  {
    id: 'alert-1',
    facility: '西部介護施設',
    type: 'warning',
    message: '参加率が51%に低下（目標60%）',
    timestamp: '2時間前'
  },
  {
    id: 'alert-2',
    facility: '緑の森介護センター',
    type: 'critical',
    message: '平均処理日数が38日に増加（目標30日以内）',
    timestamp: '3時間前'
  },
  {
    id: 'alert-3',
    facility: '南部クリニック',
    type: 'warning',
    message: 'ヘルススコアが65に低下（前月比-8）',
    timestamp: '5時間前'
  }
];
```

#### データソース分析

アラートは **リアルタイム計算** または **バッチ処理で生成**:

| アラート条件 | 計算ロジック | 使用テーブル |
|------------|------------|------------|
| **参加率低下** | participationRate < 60% | Post, User |
| **処理日数増加** | avgProcessTime > 30日 | Post |
| **スコア低下** | healthScore < 70 または 前月比-5以上 | 計算値 |

**結論**: ✅ **既存テーブルで対応可能（リアルタイム計算）**

---

### 4. 施設タイプ別統計（facilityTypeStats）

#### 表示内容（lines 203-239）
```typescript
const facilityTypeStats = [
  {
    type: '総合病院',
    count: 2,
    avgHealthScore: 83,
    avgParticipation: 70.5,
    totalVoices: 5381
  },
  {
    type: '地域医療センター',
    count: 2,
    avgHealthScore: 76.5,
    avgParticipation: 65.5,
    totalVoices: 3184
  },
  // ... 5タイプ
];
```

#### データソース分析

| フィールド | 計算ロジック | 使用テーブル |
|-----------|------------|------------|
| **type** | 施設タイプ | 医療システムAPI |
| **count** | COUNT(DISTINCT facilityId) WHERE facilityType = ? | 医療システムAPI |
| **avgHealthScore** | AVG(healthScore) GROUP BY facilityType | 計算値 |
| **avgParticipation** | AVG(participationRate) GROUP BY facilityType | 計算値 |
| **totalVoices** | SUM(totalVoices) GROUP BY facilityType | Post, User |

**結論**: ✅ **既存テーブル + 医療システムAPI（施設マスタ）で対応可能**

---

### 5. 全施設詳細テーブル（facilities table）

#### 表示内容（lines 414-466）

全10施設の詳細情報を表形式で表示：
- 施設名、タイプ、総投稿数、対応中、解決済、参加率、処理日数、スコア、トレンド

#### データソース分析

**施設別状況（Section 2）と同じデータソース**

**結論**: ✅ **既存テーブル + 医療システムAPI（施設マスタ）で対応可能**

---

## 🗂️ 必要なDB変更まとめ

### 新規テーブル

❌ **なし**

### 既存テーブル拡張

❌ **なし**

### 新規フィールド

❌ **なし**

**理由**:
1. 全て既存のPost、User、Vote、Commentテーブルから集計可能
2. 施設情報は医療システムAPIから取得
3. ヘルススコア、トレンド等はリアルタイム計算で対応

---

## 📊 サービス層設計

### CorporateAgendaDashboardService

```typescript
export class CorporateAgendaDashboardService {
  /**
   * 法人全体KPIを取得
   */
  async getCorporateKPIs() {
    // 総投稿数
    const totalPosts = await prisma.post.count();

    // 前月の総投稿数（前月比計算用）
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthPosts = await prisma.post.count({
      where: { createdAt: { gte: lastMonthStart } }
    });
    const postChange = ((totalPosts - lastMonthPosts) / lastMonthPosts) * 100;

    // 平均参加率（全施設）
    const facilities = await this.getFacilities();
    let totalParticipationRate = 0;
    for (const facility of facilities) {
      const rate = await this.calculateParticipationRate(facility.id);
      totalParticipationRate += rate;
    }
    const avgParticipationRate = totalParticipationRate / facilities.length;

    // 平均解決率
    const resolvedPosts = await prisma.post.count({
      where: { postStatus: 'RESOLVED' }
    });
    const avgResolutionRate = (resolvedPosts / totalPosts) * 100;

    // 平均処理日数
    const resolvedPostsWithDates = await prisma.post.findMany({
      where: {
        postStatus: 'RESOLVED',
        resolvedAt: { not: null }
      },
      select: { createdAt: true, resolvedAt: true }
    });
    const avgDays = resolvedPostsWithDates.reduce((sum, post) => {
      const days = Math.floor(
        (post.resolvedAt.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0) / resolvedPostsWithDates.length;

    return {
      totalPosts: {
        value: totalPosts.toLocaleString(),
        change: `+${postChange.toFixed(1)}%`,
        trend: postChange > 0 ? 'up' : 'down',
        status: postChange > 5 ? 'good' : 'warning'
      },
      avgParticipationRate: {
        value: `${avgParticipationRate.toFixed(1)}%`,
        change: `+2.1%`, // 前月比計算
        trend: 'up',
        status: avgParticipationRate >= 60 ? 'good' : 'warning'
      },
      avgResolutionRate: {
        value: `${avgResolutionRate.toFixed(1)}%`,
        change: `-1.3%`,
        trend: 'down',
        status: avgResolutionRate >= 60 ? 'good' : 'warning'
      },
      avgProcessTime: {
        value: `${avgDays.toFixed(1)}日`,
        change: `-3.8日`,
        trend: 'up',
        status: avgDays <= 30 ? 'good' : 'warning'
      }
    };
  }

  /**
   * 施設別状況を取得
   */
  async getFacilityStatuses(): Promise<FacilityStatus[]> {
    const facilities = await this.getFacilities(); // 医療システムAPI

    const statuses = await Promise.all(
      facilities.map(async (facility) => {
        // 総投稿数
        const totalVoices = await prisma.post.count({
          where: {
            author: { facilityId: facility.id }
          }
        });

        // 対応中
        const activeVoices = await prisma.post.count({
          where: {
            author: { facilityId: facility.id },
            postStatus: 'ACTIVE'
          }
        });

        // 解決済
        const resolvedVoices = await prisma.post.count({
          where: {
            author: { facilityId: facility.id },
            postStatus: 'RESOLVED'
          }
        });

        // 参加率
        const participationRate = await this.calculateParticipationRate(facility.id);

        // 平均処理日数
        const avgProcessTime = await this.calculateAvgProcessTime(facility.id);

        // ヘルススコア
        const healthScore = this.calculateHealthScore(
          participationRate,
          (resolvedVoices / totalVoices) * 100,
          avgProcessTime
        );

        // 最終更新
        const latestPost = await prisma.post.findFirst({
          where: {
            author: { facilityId: facility.id }
          },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true }
        });

        return {
          id: facility.id,
          name: facility.name,
          type: facility.type,
          totalVoices,
          activeVoices,
          resolvedVoices,
          participationRate: Math.round(participationRate),
          avgProcessTime: Math.round(avgProcessTime),
          healthScore: Math.round(healthScore),
          lastUpdated: this.formatRelativeTime(latestPost?.updatedAt),
          trend: 'stable' // 前月比計算で判定
        };
      })
    );

    return statuses;
  }

  /**
   * アラートを生成
   */
  async generateAlerts(): Promise<Alert[]> {
    const facilities = await this.getFacilityStatuses();
    const alerts: Alert[] = [];

    for (const facility of facilities) {
      // 参加率低下アラート
      if (facility.participationRate < 60) {
        alerts.push({
          id: `alert-participation-${facility.id}`,
          facility: facility.name,
          type: facility.participationRate < 50 ? 'critical' : 'warning',
          message: `参加率が${facility.participationRate}%に低下（目標60%）`,
          timestamp: this.formatRelativeTime(new Date())
        });
      }

      // 処理日数増加アラート
      if (facility.avgProcessTime > 30) {
        alerts.push({
          id: `alert-processtime-${facility.id}`,
          facility: facility.name,
          type: facility.avgProcessTime > 35 ? 'critical' : 'warning',
          message: `平均処理日数が${facility.avgProcessTime}日に増加（目標30日以内）`,
          timestamp: this.formatRelativeTime(new Date())
        });
      }

      // ヘルススコア低下アラート
      if (facility.healthScore < 70) {
        alerts.push({
          id: `alert-health-${facility.id}`,
          facility: facility.name,
          type: facility.healthScore < 60 ? 'critical' : 'warning',
          message: `ヘルススコアが${facility.healthScore}に低下`,
          timestamp: this.formatRelativeTime(new Date())
        });
      }
    }

    return alerts;
  }

  /**
   * 施設タイプ別統計を取得
   */
  async getFacilityTypeStats() {
    const facilities = await this.getFacilityStatuses();
    const facilitiesMaster = await this.getFacilities();

    // 施設タイプごとにグループ化
    const typeGroups = facilities.reduce((acc, facility) => {
      const master = facilitiesMaster.find(f => f.id === facility.id);
      const type = master?.type || '不明';

      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(facility);
      return acc;
    }, {} as Record<string, FacilityStatus[]>);

    return Object.entries(typeGroups).map(([type, facilities]) => ({
      type,
      count: facilities.length,
      avgHealthScore: Math.round(
        facilities.reduce((sum, f) => sum + f.healthScore, 0) / facilities.length
      ),
      avgParticipation: Math.round(
        facilities.reduce((sum, f) => sum + f.participationRate, 0) / facilities.length
      ),
      totalVoices: facilities.reduce((sum, f) => sum + f.totalVoices, 0)
    }));
  }

  /**
   * 参加率を計算（施設別）
   */
  private async calculateParticipationRate(facilityId: string): Promise<number> {
    const uniqueAuthors = await prisma.post.findMany({
      where: {
        author: { facilityId }
      },
      select: { authorId: true },
      distinct: ['authorId']
    });

    const facilityEmployeeCount = await this.getFacilityEmployeeCount(facilityId);

    return (uniqueAuthors.length / facilityEmployeeCount) * 100;
  }

  /**
   * 平均処理日数を計算（施設別）
   */
  private async calculateAvgProcessTime(facilityId: string): Promise<number> {
    const resolvedPosts = await prisma.post.findMany({
      where: {
        author: { facilityId },
        postStatus: 'RESOLVED',
        resolvedAt: { not: null }
      },
      select: { createdAt: true, resolvedAt: true }
    });

    if (resolvedPosts.length === 0) return 0;

    const avgDays = resolvedPosts.reduce((sum, post) => {
      const days = Math.floor(
        (post.resolvedAt.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0) / resolvedPosts.length;

    return avgDays;
  }

  /**
   * ヘルススコアを計算
   */
  private calculateHealthScore(
    participationRate: number,
    resolutionRate: number,
    avgProcessTime: number
  ): number {
    // 参加率スコア（40%）: 0-100
    const participationScore = participationRate;

    // 解決率スコア（30%）: 0-100
    const resolutionScore = resolutionRate;

    // 処理速度スコア（30%）: 30日以内=100, 60日以上=0
    const processScore = Math.max(0, 100 - ((avgProcessTime - 30) / 30) * 100);

    return (
      participationScore * 0.4 +
      resolutionScore * 0.3 +
      processScore * 0.3
    );
  }

  /**
   * 医療システムから施設マスタを取得
   */
  private async getFacilities() {
    // 医療システムAPIを呼び出し
    // GET /api/v2/facilities
    return [
      { id: 'F001', name: '中央総合病院', type: '総合病院' },
      { id: 'F002', name: '北部医療センター', type: '地域医療センター' },
      // ... 全10施設
    ];
  }

  /**
   * 医療システムから施設別職員数を取得
   */
  private async getFacilityEmployeeCount(facilityId: string): Promise<number> {
    // 医療システムAPIを呼び出し
    // GET /api/v2/employees/count?facility={facilityId}
    return 150; // 仮の値
  }

  /**
   * 相対時刻をフォーマット
   */
  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${Math.floor(hours / 24)}日前`;
  }
}
```

---

## 🔌 必要なAPI

### VoiceDrive側APIエンドポイント

#### 1. GET /api/corporate-agenda-dashboard/kpis
法人全体KPIを取得

**レスポンス例**:
```json
{
  "corporateKPIs": [
    {
      "label": "総投稿数（全施設）",
      "value": "12,847",
      "change": "+8.2%",
      "trend": "up",
      "status": "good"
    },
    {
      "label": "平均参加率",
      "value": "64.3%",
      "change": "+2.1%",
      "trend": "up",
      "status": "good"
    },
    {
      "label": "平均解決率",
      "value": "58.7%",
      "change": "-1.3%",
      "trend": "down",
      "status": "warning"
    },
    {
      "label": "平均処理日数",
      "value": "26.4日",
      "change": "-3.8日",
      "trend": "up",
      "status": "good"
    }
  ]
}
```

#### 2. GET /api/corporate-agenda-dashboard/facilities
施設別状況を取得

**レスポンス例**:
```json
{
  "facilities": [
    {
      "id": "F001",
      "name": "中央総合病院",
      "type": "総合病院",
      "totalVoices": 3247,
      "activeVoices": 487,
      "resolvedVoices": 1842,
      "participationRate": 72,
      "avgProcessTime": 24,
      "healthScore": 85,
      "lastUpdated": "2時間前",
      "trend": "up"
    }
  ]
}
```

#### 3. GET /api/corporate-agenda-dashboard/alerts
アラート一覧を取得

#### 4. GET /api/corporate-agenda-dashboard/facility-type-stats
施設タイプ別統計を取得

### 医療システム側API

#### 1. GET /api/v2/facilities
施設マスタ取得

**リクエスト**:
```http
GET /api/v2/facilities
Authorization: Bearer {jwt_token}
```

**レスポンス例**:
```json
{
  "facilities": [
    {
      "id": "F001",
      "code": "CC-HOSP",
      "name": "中央総合病院",
      "type": "総合病院",
      "address": "...",
      "isActive": true
    },
    {
      "id": "F002",
      "code": "NM-CENTER",
      "name": "北部医療センター",
      "type": "地域医療センター",
      "address": "...",
      "isActive": true
    }
  ],
  "totalCount": 10,
  "timestamp": "2025-10-11T00:00:00Z"
}
```

#### 2. GET /api/v2/employees/count?facility={id}
施設別職員数取得（既存API）

**実装状況**: ✅ **既に実装済み**（OrganizationAnalytics Phase 1）

---

## 📅 実装計画

### Phase 1: サービス層実装（3日）

**Day 1: CorporateAgendaDashboardService実装**
- `getCorporateKPIs()`
- `getFacilityStatuses()`

**Day 2: アラート・統計機能実装**
- `generateAlerts()`
- `getFacilityTypeStats()`
- ヘルススコア計算ロジック

**Day 3: ユニットテスト**
- サービス層テスト
- 集計ロジックテスト

---

### Phase 2: APIエンドポイント実装（2日）

**Day 4: GET APIエンドポイント**
- `/api/corporate-agenda-dashboard/kpis`
- `/api/corporate-agenda-dashboard/facilities`
- `/api/corporate-agenda-dashboard/alerts`
- `/api/corporate-agenda-dashboard/facility-type-stats`

**Day 5: 統合テスト**
- 医療システムAPI連携テスト
- パフォーマンステスト

---

### Phase 3: フロントエンド統合（3日）

**Day 6-7: データフェッチ実装**
- ハードコードデータをAPI呼び出しに置き換え
- React Queryによるデータキャッシング

**Day 8: テスト・調整**
- E2Eテスト
- パフォーマンス最適化

---

### 推定工数まとめ

| Phase | 内容 | 工数 |
|-------|------|------|
| Phase 1 | サービス層実装 | 3日 |
| Phase 2 | APIエンドポイント実装 | 2日 |
| Phase 3 | フロントエンド統合 | 3日 |
| **合計** | | **8日（約1.5週間）** |

---

## ⚠️ 注意事項・課題

### 1. 医療システムAPI依存

**施設マスタAPI（GET /api/v2/facilities）が未実装**

**対応**:
- 医療システムチームに実装依頼
- 実装完了まではVoiceDrive側で暫定的に施設マスタを管理

### 2. パフォーマンス最適化

法人全体（全10施設）の集計処理は負荷が高い可能性があります。

**対応**:
- 集計結果をキャッシュ（Redis）
- バッチ処理で事前集計（毎時実行）
- データベースインデックス最適化

### 3. リアルタイム更新

ダッシュボードのリアルタイム更新が必要な場合があります。

**対応**:
- WebSocketによるリアルタイム通知
- または、定期的なポーリング（1分ごと）

---

## 🎯 成功指標（KPI）

### 機能要件

- ✅ 法人全体KPIが正しく表示される
- ✅ 施設別状況が一覧表示される
- ✅ アラートが適切に生成される
- ✅ 施設タイプ別統計が正確
- ✅ 全施設詳細テーブルが動作する

### パフォーマンス要件

- 各APIエンドポイントのレスポンスタイム: < 2秒
- ページ初期表示時間: < 3秒
- 施設別集計処理: < 1秒/施設

### データ整合性

- 施設別集計の合計 = 法人全体KPI
- アラート条件が正確に判定される
- ヘルススコア計算が正確

---

## 📞 連絡先

### 開発チーム
- Slack: #corporate-agenda-dashboard-dev
- 担当: VoiceDrive開発チーム

### 関連ドキュメント
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [organization-analytics_DB要件分析_20251010.md](./organization-analytics_DB要件分析_20251010.md)

---

**文書終了**

最終更新: 2025年10月11日
バージョン: 1.0
次回レビュー: Phase 1完了後
