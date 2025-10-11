# Corporate Agenda Dashboard 暫定マスターリスト

**作成日**: 2025年10月11日
**対象ページ**: CorporateAgendaDashboard (https://voicedrive-v100.vercel.app/corporate-agenda-dashboard)
**権限レベル**: Level 18（CEO・法人事務局長）
**ドキュメントID**: CORP-AGENDA-DASH-MASTER-20251011

---

## 1. 概要

### 1.1 目的
全10施設の議題化プロセス状況を可視化し、法人全体のガバナンス状況を把握する。

### 1.2 主要機能
- 法人全体KPI表示（総投稿数、参加率、解決率、平均処理時間）
- 10施設の詳細ステータス表示
- アラート機能（参加率低下、処理遅延、ヘルススコア低下）
- 施設タイプ別統計（病院、医療センター、リハビリ、診療所、介護施設）
- 施設詳細表で全施設情報を一覧表示

### 1.3 データ責任分担
- **VoiceDrive**: 100%（既存Post/User/Vote/Commentテーブルから集計）
- **医療職員管理システム**: 施設マスタAPI提供のみ（GET /api/v2/facilities）

---

## 2. 医療職員管理システム側要件

### 2.1 必要API

#### 2.1.1 施設マスタ取得API
```yaml
endpoint: GET /api/v2/facilities
description: 全施設マスタ情報を取得
permission: Level 18以上
response:
  type: array
  items:
    - id: string                    # 施設ID
      name: string                  # 施設名
      type: string                  # 施設タイプ（hospital/medical_center/rehab/clinic/care_facility）
      location: string              # 所在地
      employeeCount: number         # 職員数
      establishedDate: string       # 設立日
      status: string                # 稼働状況（active/inactive）
```

**実装状況**:
- ✅ 既存API（医療システム確認済み）
- データソース: 施設マスタテーブル（医療システム側管理）
- 更新頻度: リアルタイム（施設情報変更時）

### 2.2 追加作業
**なし** - 既存APIのみで対応可能

---

## 3. VoiceDrive側要件

### 3.1 データベース要件

#### 3.1.1 新規テーブル
**なし** - 既存テーブルから集計のみ

#### 3.1.2 既存テーブル使用
以下の既存テーブルからデータを集計：

1. **Post** - 投稿データ
   - 施設別投稿数カウント
   - ステータス別カウント（active/resolved/closed）
   - 処理時間計算（createdAt → resolvedAt）

2. **User** - ユーザーデータ
   - 施設別職員数
   - 施設別投稿者数（参加率計算用）

3. **Vote** - 賛同データ
   - 施設別賛同数
   - 平均賛同数計算

4. **Comment** - コメントデータ
   - 施設別コメント数
   - エンゲージメント計算用

### 3.2 サービス層要件

#### 3.2.1 CorporateAgendaDashboardService
```typescript
class CorporateAgendaDashboardService {
  // 法人全体KPI取得
  async getCorporateKPIs(): Promise<CorporateKPIs>;

  // 全施設ステータス取得
  async getAllFacilitiesStatus(): Promise<FacilityStatus[]>;

  // 施設タイプ別統計取得
  async getFacilityTypeStats(): Promise<FacilityTypeStats[]>;

  // アラート生成
  async generateAlerts(): Promise<Alert[]>;

  // ヘルススコア計算
  calculateHealthScore(
    participationRate: number,
    resolutionRate: number,
    avgProcessTime: number
  ): number;
}
```

#### 3.2.2 主要メソッド詳細

**getCorporateKPIs()**
```typescript
interface CorporateKPIs {
  totalPosts: number;              // 総投稿数
  avgParticipationRate: number;    // 平均参加率（%）
  avgResolutionRate: number;       // 平均解決率（%）
  avgProcessTime: number;          // 平均処理時間（日）
  trend: 'up' | 'down' | 'stable'; // トレンド
  lastUpdated: string;             // 最終更新日時
}

// 実装:
1. 全施設の投稿数を合計
2. 各施設の参加率を計算し平均
3. 各施設の解決率を計算し平均
4. 各施設の処理時間を計算し平均
5. 前月比較でトレンド判定
```

**getAllFacilitiesStatus()**
```typescript
interface FacilityStatus {
  id: string;                      // 施設ID
  name: string;                    // 施設名
  type: string;                    // 施設タイプ
  totalVoices: number;             // 総投稿数
  activeVoices: number;            // 進行中投稿数
  resolvedVoices: number;          // 解決済み投稿数
  participationRate: number;       // 参加率（%）
  avgProcessTime: number;          // 平均処理時間（日）
  healthScore: number;             // ヘルススコア（0-100）
  lastUpdated: string;             // 最終更新日時
  trend: 'up' | 'down' | 'stable'; // トレンド
}

// 実装:
1. 医療システムAPIから施設一覧取得
2. 各施設の投稿データをPost.facilityIdで集計
3. 参加率 = (投稿者数 / 施設職員数) × 100
4. 解決率 = (resolved投稿数 / 総投稿数) × 100
5. 処理時間 = Σ(resolvedAt - createdAt) / resolved投稿数
6. ヘルススコア = calculateHealthScore()で算出
7. 前月比較でトレンド判定
```

**getFacilityTypeStats()**
```typescript
interface FacilityTypeStats {
  type: string;                    // 施設タイプ
  count: number;                   // 施設数
  avgHealthScore: number;          // 平均ヘルススコア
  totalVoices: number;             // 総投稿数
  avgParticipationRate: number;    // 平均参加率
}

// 実装:
1. 施設タイプごとにグループ化（hospital/medical_center/rehab/clinic/care_facility）
2. 各タイプの施設数カウント
3. 各タイプの平均ヘルススコア計算
4. 各タイプの総投稿数合計
5. 各タイプの平均参加率計算
```

**generateAlerts()**
```typescript
interface Alert {
  id: string;
  facilityId: string;
  facilityName: string;
  type: 'low_participation' | 'high_process_time' | 'low_health_score';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

// 実装:
1. 低参加率アラート: participationRate < 30% (warning), < 20% (critical)
2. 処理遅延アラート: avgProcessTime > 30日 (warning), > 45日 (critical)
3. 低ヘルススコアアラート: healthScore < 50 (warning), < 30 (critical)
```

**calculateHealthScore()**
```typescript
// ヘルススコア算出式
healthScore =
  (participationRate × 0.4) +        // 参加率 40%
  (resolutionRate × 0.3) +           // 解決率 30%
  ((100 - processTimeScore) × 0.3)   // 処理速度 30%

// processTimeScore計算:
// 0-14日: 100点
// 15-30日: 70点
// 31-45日: 40点
// 46日以上: 10点
```

### 3.3 API要件

#### 3.3.1 法人全体KPI取得
```typescript
GET /api/corporate/kpis
Permission: Level 18+
Response: CorporateKPIs
```

#### 3.3.2 全施設ステータス取得
```typescript
GET /api/corporate/facilities/status
Permission: Level 18+
Response: FacilityStatus[]
```

#### 3.3.3 施設タイプ別統計取得
```typescript
GET /api/corporate/facilities/type-stats
Permission: Level 18+
Response: FacilityTypeStats[]
```

#### 3.3.4 アラート取得
```typescript
GET /api/corporate/alerts
Permission: Level 18+
Query params:
  - severity?: 'warning' | 'critical'
  - type?: 'low_participation' | 'high_process_time' | 'low_health_score'
Response: Alert[]
```

### 3.4 フロントエンド要件

#### 3.4.1 コンポーネント拡張
```typescript
// src/components/corporate/CorporateKPICards.tsx
interface Props {
  kpis: CorporateKPIs;
}

// src/components/corporate/FacilityStatusGrid.tsx
interface Props {
  facilities: FacilityStatus[];
}

// src/components/corporate/FacilityTypeChart.tsx
interface Props {
  stats: FacilityTypeStats[];
}

// src/components/corporate/AlertPanel.tsx
interface Props {
  alerts: Alert[];
}

// src/components/corporate/FacilityDetailTable.tsx
interface Props {
  facilities: FacilityStatus[];
}
```

#### 3.4.2 データフェッチング
```typescript
// src/hooks/useCorporateDashboard.ts
export const useCorporateDashboard = () => {
  const [kpis, setKpis] = useState<CorporateKPIs | null>(null);
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [typeStats, setTypeStats] = useState<FacilityTypeStats[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [kpisData, facilitiesData, typeStatsData, alertsData] =
        await Promise.all([
          fetch('/api/corporate/kpis'),
          fetch('/api/corporate/facilities/status'),
          fetch('/api/corporate/facilities/type-stats'),
          fetch('/api/corporate/alerts')
        ]);

      setKpis(await kpisData.json());
      setFacilities(await facilitiesData.json());
      setTypeStats(await typeStatsData.json());
      setAlerts(await alertsData.json());
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // 5分ごとに更新
    return () => clearInterval(interval);
  }, []);

  return { kpis, facilities, typeStats, alerts, loading };
};
```

### 3.5 キャッシュ戦略

#### 3.5.1 Redis キャッシュ
```typescript
// 法人全体KPI: 5分キャッシュ
await redis.setex('corporate:kpis', 300, JSON.stringify(kpis));

// 施設ステータス: 5分キャッシュ
await redis.setex('corporate:facilities:status', 300, JSON.stringify(facilities));

// 施設タイプ統計: 10分キャッシュ
await redis.setex('corporate:type-stats', 600, JSON.stringify(typeStats));

// アラート: キャッシュなし（リアルタイム）
```

#### 3.5.2 無効化トリガー
- 投稿ステータス変更時: 該当施設のキャッシュクリア
- 新規投稿作成時: 該当施設のキャッシュクリア
- 施設情報更新時: 全体キャッシュクリア

---

## 4. 初期データ例

### 4.1 集計例（既存データから）

#### 4.1.1 法人全体KPI
```json
{
  "totalPosts": 2847,
  "avgParticipationRate": 42.3,
  "avgResolutionRate": 68.5,
  "avgProcessTime": 18.7,
  "trend": "up",
  "lastUpdated": "2025-10-11T10:00:00Z"
}
```

#### 4.1.2 施設ステータス（例: 第一病院）
```json
{
  "id": "FAC001",
  "name": "第一病院",
  "type": "hospital",
  "totalVoices": 487,
  "activeVoices": 142,
  "resolvedVoices": 315,
  "participationRate": 38.2,
  "avgProcessTime": 22.5,
  "healthScore": 72,
  "lastUpdated": "2025-10-11T10:00:00Z",
  "trend": "stable"
}
```

#### 4.1.3 施設タイプ別統計
```json
[
  {
    "type": "hospital",
    "count": 3,
    "avgHealthScore": 75,
    "totalVoices": 1456,
    "avgParticipationRate": 45.2
  },
  {
    "type": "medical_center",
    "count": 2,
    "avgHealthScore": 68,
    "totalVoices": 823,
    "avgParticipationRate": 38.7
  },
  {
    "type": "rehab",
    "count": 2,
    "avgHealthScore": 71,
    "totalVoices": 342,
    "avgParticipationRate": 41.3
  },
  {
    "type": "clinic",
    "count": 2,
    "avgHealthScore": 65,
    "totalVoices": 156,
    "avgParticipationRate": 35.8
  },
  {
    "type": "care_facility",
    "count": 1,
    "avgHealthScore": 62,
    "totalVoices": 70,
    "avgParticipationRate": 32.1
  }
]
```

#### 4.1.4 アラート例
```json
[
  {
    "id": "ALT001",
    "facilityId": "FAC008",
    "facilityName": "桜ヶ丘診療所",
    "type": "low_participation",
    "severity": "critical",
    "message": "参加率が19.2%まで低下しています",
    "value": 19.2,
    "threshold": 20,
    "timestamp": "2025-10-11T10:00:00Z"
  },
  {
    "id": "ALT002",
    "facilityId": "FAC009",
    "facilityName": "緑の丘診療所",
    "type": "high_process_time",
    "severity": "warning",
    "message": "平均処理時間が35.8日に達しています",
    "value": 35.8,
    "threshold": 30,
    "timestamp": "2025-10-11T10:00:00Z"
  },
  {
    "id": "ALT003",
    "facilityId": "FAC010",
    "facilityName": "緑風園",
    "type": "low_health_score",
    "severity": "critical",
    "message": "ヘルススコアが28まで低下しています",
    "value": 28,
    "threshold": 30,
    "timestamp": "2025-10-11T10:00:00Z"
  }
]
```

---

## 5. 実装スケジュール

### 5.1 Phase 1: サービス層実装（3日）
**担当**: バックエンドチーム
**成果物**:
- CorporateAgendaDashboardService実装
- ヘルススコア計算ロジック実装
- アラート生成ロジック実装
- 集計クエリ最適化

**作業内容**:
```typescript
Day 1:
- CorporateAgendaDashboardService基本構造作成
- getCorporateKPIs() 実装
- getAllFacilitiesStatus() 実装

Day 2:
- getFacilityTypeStats() 実装
- calculateHealthScore() 実装
- generateAlerts() 実装

Day 3:
- パフォーマンス最適化（インデックス追加、クエリ改善）
- ユニットテスト作成
- エラーハンドリング実装
```

### 5.2 Phase 2: API実装（2日）
**担当**: バックエンドチーム
**成果物**:
- 4つのAPIエンドポイント実装
- 権限チェック実装
- Redisキャッシュ実装

**作業内容**:
```typescript
Day 4:
- GET /api/corporate/kpis 実装
- GET /api/corporate/facilities/status 実装
- 権限チェックミドルウェア適用

Day 5:
- GET /api/corporate/facilities/type-stats 実装
- GET /api/corporate/alerts 実装
- Redisキャッシュ層実装
- キャッシュ無効化ロジック実装
```

### 5.3 Phase 3: フロントエンド実装（3日）
**担当**: フロントエンドチーム
**成果物**:
- 5つのコンポーネント実装
- カスタムフック実装
- レスポンシブ対応

**作業内容**:
```typescript
Day 6:
- useCorporateDashboard フック実装
- CorporateKPICards コンポーネント実装
- FacilityStatusGrid コンポーネント実装

Day 7:
- FacilityTypeChart コンポーネント実装
- AlertPanel コンポーネント実装
- FacilityDetailTable コンポーネント実装

Day 8:
- レスポンシブデザイン調整
- エラーハンドリングUI実装
- ローディング状態UI実装
- 統合テスト
```

### 5.4 総工数見積もり
- **開発期間**: 8日（約1.5週間）
- **バックエンド**: 5日（サービス3日 + API 2日）
- **フロントエンド**: 3日
- **並行作業**: Day 6-8はフロント/バック並行可能

---

## 6. テスト要件

### 6.1 ユニットテスト

#### 6.1.1 サービス層テスト
```typescript
describe('CorporateAgendaDashboardService', () => {
  describe('getCorporateKPIs', () => {
    it('全施設のKPIを正しく集計すること', async () => {
      const kpis = await service.getCorporateKPIs();
      expect(kpis.totalPosts).toBeGreaterThan(0);
      expect(kpis.avgParticipationRate).toBeGreaterThanOrEqual(0);
      expect(kpis.avgParticipationRate).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateHealthScore', () => {
    it('参加率40%、解決率30%、処理速度30%の重み付けで計算すること', () => {
      const score = service.calculateHealthScore(50, 80, 15);
      expect(score).toBe(50 * 0.4 + 80 * 0.3 + 100 * 0.3);
    });

    it('処理時間に応じた処理速度スコアを計算すること', () => {
      expect(service.getProcessTimeScore(10)).toBe(100);   // 0-14日
      expect(service.getProcessTimeScore(20)).toBe(70);    // 15-30日
      expect(service.getProcessTimeScore(35)).toBe(40);    // 31-45日
      expect(service.getProcessTimeScore(50)).toBe(10);    // 46日以上
    });
  });

  describe('generateAlerts', () => {
    it('参加率20%未満でcriticalアラートを生成すること', async () => {
      const alerts = await service.generateAlerts();
      const criticalAlerts = alerts.filter(a =>
        a.type === 'low_participation' && a.severity === 'critical'
      );
      expect(criticalAlerts.every(a => a.value < 20)).toBe(true);
    });

    it('処理時間45日超でcriticalアラートを生成すること', async () => {
      const alerts = await service.generateAlerts();
      const criticalAlerts = alerts.filter(a =>
        a.type === 'high_process_time' && a.severity === 'critical'
      );
      expect(criticalAlerts.every(a => a.value > 45)).toBe(true);
    });
  });
});
```

#### 6.1.2 APIテスト
```typescript
describe('Corporate Dashboard API', () => {
  describe('GET /api/corporate/kpis', () => {
    it('Level 18未満はアクセス拒否', async () => {
      const response = await request(app)
        .get('/api/corporate/kpis')
        .set('Authorization', 'Bearer level17_token');
      expect(response.status).toBe(403);
    });

    it('Level 18以上は正常取得', async () => {
      const response = await request(app)
        .get('/api/corporate/kpis')
        .set('Authorization', 'Bearer level18_token');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalPosts');
    });
  });

  describe('GET /api/corporate/alerts', () => {
    it('severityフィルタが動作すること', async () => {
      const response = await request(app)
        .get('/api/corporate/alerts?severity=critical')
        .set('Authorization', 'Bearer level18_token');
      expect(response.status).toBe(200);
      expect(response.body.every(a => a.severity === 'critical')).toBe(true);
    });
  });
});
```

### 6.2 統合テスト

#### 6.2.1 データ整合性テスト
```typescript
describe('Corporate Dashboard Integration', () => {
  it('KPIと施設ステータスの総投稿数が一致すること', async () => {
    const kpis = await service.getCorporateKPIs();
    const facilities = await service.getAllFacilitiesStatus();
    const totalFromFacilities = facilities.reduce((sum, f) => sum + f.totalVoices, 0);
    expect(kpis.totalPosts).toBe(totalFromFacilities);
  });

  it('施設タイプ統計の施設数が実際の施設数と一致すること', async () => {
    const typeStats = await service.getFacilityTypeStats();
    const facilities = await service.getAllFacilitiesStatus();
    const totalCount = typeStats.reduce((sum, s) => sum + s.count, 0);
    expect(totalCount).toBe(facilities.length);
  });
});
```

#### 6.2.2 パフォーマンステスト
```typescript
describe('Performance Tests', () => {
  it('10施設のステータス取得が1秒以内に完了すること', async () => {
    const start = Date.now();
    await service.getAllFacilitiesStatus();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  it('Redisキャッシュが有効に動作すること', async () => {
    // 1回目: DBアクセス
    const start1 = Date.now();
    await service.getCorporateKPIs();
    const duration1 = Date.now() - start1;

    // 2回目: キャッシュヒット
    const start2 = Date.now();
    await service.getCorporateKPIs();
    const duration2 = Date.now() - start2;

    expect(duration2).toBeLessThan(duration1 / 10); // 10倍以上高速化
  });
});
```

---

## 7. セキュリティ要件

### 7.1 アクセス制御
```typescript
// Level 18 (CEO・法人事務局長) のみアクセス可能
const checkCorporateAccess = (user: User) => {
  if (user.permissionLevel < 18) {
    throw new ForbiddenError('法人全体データへのアクセス権限がありません');
  }
};
```

### 7.2 データマスキング
```typescript
// 施設詳細に個人情報が含まれないことを確認
const sanitizeFacilityStatus = (status: FacilityStatus): FacilityStatus => {
  return {
    ...status,
    // 集計データのみ、個人識別情報は含まない
  };
};
```

### 7.3 監査ログ
```typescript
// 法人全体データアクセスをログ記録
await auditLog.create({
  userId: user.id,
  action: 'VIEW_CORPORATE_DASHBOARD',
  resource: 'corporate_kpis',
  timestamp: new Date(),
  ipAddress: req.ip
});
```

---

## 8. 運用要件

### 8.1 モニタリング

#### 8.1.1 パフォーマンス監視
```typescript
// 集計クエリの実行時間監視
const metricsCollector = {
  recordQueryTime: (queryName: string, duration: number) => {
    if (duration > 1000) {
      logger.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }
  }
};
```

#### 8.1.2 アラート監視
```typescript
// 重大アラート発生時の通知
const notifyCriticalAlert = async (alert: Alert) => {
  if (alert.severity === 'critical') {
    await notificationService.send({
      to: 'executives@hospital.jp',
      subject: `【重要】${alert.facilityName}で重大なアラートが発生`,
      body: alert.message
    });
  }
};
```

### 8.2 データ更新頻度
- **リアルタイム**: アラート
- **5分ごと**: KPI、施設ステータス
- **10分ごと**: 施設タイプ統計
- **日次**: トレンド分析

### 8.3 障害時対応
```typescript
// 集計失敗時のフォールバック
const getCorporateKPIsWithFallback = async () => {
  try {
    return await service.getCorporateKPIs();
  } catch (error) {
    logger.error('Failed to get corporate KPIs', error);
    // キャッシュから前回値を返す
    const cached = await redis.get('corporate:kpis:last_success');
    if (cached) return JSON.parse(cached);
    // キャッシュもない場合は空値返却
    return getEmptyKPIs();
  }
};
```

---

## 9. 医療システムとの連携確認

### 9.1 施設マスタAPI確認事項

#### 9.1.1 データ形式確認
```typescript
// 医療システム側に確認が必要な項目
interface FacilityMasterConfirmation {
  // 施設タイプのenumは以下で統一されているか？
  facilityTypes: [
    'hospital',        // 病院
    'medical_center',  // 医療センター
    'rehab',          // リハビリテーションセンター
    'clinic',         // 診療所
    'care_facility'   // 介護施設
  ];

  // 施設ステータスのenumは？
  facilityStatuses: [
    'active',   // 稼働中
    'inactive'  // 休止中
  ];

  // 職員数（employeeCount）は含まれるか？
  includesEmployeeCount: boolean;

  // 設立日（establishedDate）は含まれるか？
  includesEstablishedDate: boolean;
}
```

#### 9.1.2 API仕様確認依頼
以下を医療システムチームに確認：
1. ✅ GET /api/v2/facilities のレスポンス形式
2. ✅ 施設タイプのenum値（5種類の名称統一）
3. ✅ 職員数フィールドの有無と更新頻度
4. ✅ API呼び出し頻度制限の有無
5. ✅ キャッシュポリシー（ETag, Cache-Control）

### 9.2 連携テストシナリオ

#### 9.2.1 正常系
```typescript
describe('Medical System Integration', () => {
  it('施設マスタAPIから10施設取得できること', async () => {
    const facilities = await medicalSystemClient.getFacilities();
    expect(facilities).toHaveLength(10);
  });

  it('各施設に必須フィールドが含まれること', async () => {
    const facilities = await medicalSystemClient.getFacilities();
    facilities.forEach(f => {
      expect(f).toHaveProperty('id');
      expect(f).toHaveProperty('name');
      expect(f).toHaveProperty('type');
      expect(f).toHaveProperty('employeeCount');
    });
  });
});
```

#### 9.2.2 異常系
```typescript
describe('Medical System Error Handling', () => {
  it('API障害時はキャッシュされた施設情報を使用すること', async () => {
    // 医療システムAPIをモック障害
    medicalSystemClient.mockFailure();

    const facilities = await service.getAllFacilitiesStatus();
    expect(facilities).toBeDefined(); // キャッシュから取得
  });

  it('施設マスタ更新時は集計キャッシュを無効化すること', async () => {
    await medicalSystemClient.updateFacility('FAC001', { name: '新名称' });

    const cached = await redis.get('corporate:facilities:status');
    expect(cached).toBeNull(); // キャッシュクリア確認
  });
});
```

---

## 10. 実装チェックリスト

### 10.1 バックエンド

#### サービス層
- [ ] CorporateAgendaDashboardService クラス作成
- [ ] getCorporateKPIs() メソッド実装
- [ ] getAllFacilitiesStatus() メソッド実装
- [ ] getFacilityTypeStats() メソッド実装
- [ ] generateAlerts() メソッド実装
- [ ] calculateHealthScore() メソッド実装
- [ ] getProcessTimeScore() ヘルパーメソッド実装

#### API層
- [ ] GET /api/corporate/kpis エンドポイント実装
- [ ] GET /api/corporate/facilities/status エンドポイント実装
- [ ] GET /api/corporate/facilities/type-stats エンドポイント実装
- [ ] GET /api/corporate/alerts エンドポイント実装
- [ ] Level 18権限チェック実装
- [ ] Redisキャッシュ層実装
- [ ] キャッシュ無効化ロジック実装

#### データ層
- [ ] Post集計クエリ最適化（インデックス追加）
- [ ] User集計クエリ最適化
- [ ] Vote/Comment集計クエリ最適化
- [ ] 施設別集計ビュー作成（オプション）

#### テスト
- [ ] サービス層ユニットテスト（10ケース以上）
- [ ] API層統合テスト（8ケース以上）
- [ ] パフォーマンステスト（<1秒）
- [ ] キャッシュ動作テスト

### 10.2 フロントエンド

#### コンポーネント
- [ ] CorporateKPICards コンポーネント実装
- [ ] FacilityStatusGrid コンポーネント実装
- [ ] FacilityTypeChart コンポーネント実装
- [ ] AlertPanel コンポーネント実装
- [ ] FacilityDetailTable コンポーネント実装

#### フック
- [ ] useCorporateDashboard カスタムフック実装
- [ ] 5分ごとの自動更新実装
- [ ] エラーハンドリング実装
- [ ] ローディング状態管理

#### UI/UX
- [ ] レスポンシブデザイン実装
- [ ] アラート表示UI実装（色分け: warning=黄、critical=赤）
- [ ] トレンド表示UI実装（↑↓→アイコン）
- [ ] ヘルススコア視覚化（0-30:赤、31-50:橙、51-70:黄、71-100:緑）

### 10.3 医療システム連携

#### API確認
- [ ] GET /api/v2/facilities レスポンス形式確認
- [ ] 施設タイプenum確認（5種類）
- [ ] 職員数フィールド確認
- [ ] API呼び出し頻度制限確認
- [ ] キャッシュポリシー確認

#### 連携テスト
- [ ] 施設マスタ取得テスト
- [ ] 施設タイプマッピングテスト
- [ ] API障害時フォールバックテスト
- [ ] キャッシュ無効化テスト

### 10.4 運用準備

#### 監視
- [ ] 集計クエリパフォーマンス監視設定
- [ ] アラート通知設定（critical時）
- [ ] エラーログ収集設定
- [ ] ダッシュボードアクセスログ設定

#### ドキュメント
- [ ] API仕様書作成
- [ ] 運用手順書作成（障害対応含む）
- [ ] ヘルススコア計算式ドキュメント作成
- [ ] アラート閾値設定ドキュメント作成

---

## 11. リスク管理

### 11.1 技術的リスク

#### リスク1: 集計パフォーマンス劣化
**内容**: 投稿数増加により集計処理が遅延
**対策**:
- インデックス最適化（Post.facilityId, Post.status, Post.createdAt）
- 集計結果のRedisキャッシュ（5分）
- 必要に応じてマテリアライズドビュー導入

**検証**:
```sql
-- 集計クエリのEXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT
  facility_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved
FROM posts
GROUP BY facility_id;
```

#### リスク2: 医療システムAPI障害
**内容**: 施設マスタAPI障害でダッシュボード表示不可
**対策**:
- 施設情報のローカルキャッシュ（24時間）
- フォールバック機能実装
- エラー時のユーザーフレンドリーメッセージ

**実装**:
```typescript
const getFacilitiesWithFallback = async () => {
  try {
    const facilities = await medicalSystemClient.getFacilities();
    await redis.setex('facilities:master', 86400, JSON.stringify(facilities));
    return facilities;
  } catch (error) {
    const cached = await redis.get('facilities:master');
    if (cached) return JSON.parse(cached);
    throw new ServiceUnavailableError('施設情報を取得できません');
  }
};
```

### 11.2 運用リスク

#### リスク3: アラート過多
**内容**: アラート閾値が厳しすぎて通知が多発
**対策**:
- 初期閾値を緩めに設定（参加率15%, 処理時間50日）
- 運用開始後1ヶ月でデータ分析し閾値調整
- アラート集約機能実装（同一施設は1日1回のみ）

#### リスク4: データ不整合
**内容**: 集計タイミングにより一時的なデータ不一致
**対策**:
- トランザクション境界の明確化
- 最終更新日時の表示
- 「データは5分ごとに更新されます」の注記表示

---

## 12. 今後の拡張予定

### 12.1 Phase 2 機能（3ヶ月後）
- 施設間比較レポート自動生成
- ヘルススコア推移グラフ（月次/年次）
- トップパフォーマー施設表彰機能
- アラート自動通知（Slack/メール）

### 12.2 Phase 3 機能（6ヶ月後）
- AI予測アラート（参加率低下予測）
- 施設ベンチマーク機能
- カスタムKPI設定機能
- Excel/PDFエクスポート機能

---

## 13. 承認

### 13.1 VoiceDrive側承認
- [ ] バックエンドリード承認
- [ ] フロントエンドリード承認
- [ ] プロダクトマネージャー承認

### 13.2 医療システム側確認事項
- [ ] 施設マスタAPI仕様確認
- [ ] 施設タイプenum統一確認
- [ ] API呼び出し頻度上限確認
- [ ] 職員数フィールド提供確認

### 13.3 統合テスト日程
- **予定日**: 2025年10月25日（金）
- **参加者**: VoiceDrive開発チーム、医療システムチーム
- **確認項目**:
  - 施設マスタAPI連携
  - 10施設の集計正確性
  - アラート生成ロジック
  - パフォーマンス（<1秒）

---

## 14. 関連ドキュメント

- [Corporate Agenda Dashboard DB要件分析](./corporate-agenda-dashboard_DB要件分析_20251011.md)
- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)
- [Phase 18-19 VoiceAnalytics実装完了報告](./phase18-19-implementation-complete.md)

---

**ドキュメント作成者**: Claude (VoiceDrive AI Assistant)
**最終更新日**: 2025年10月11日
**バージョン**: 1.0.0
**ステータス**: ✅ 完成 - 医療システム確認待ち
