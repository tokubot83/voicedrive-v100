# system-operations（システム運用）暫定マスターリスト

**文書番号**: SO-MASTER-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDrive開発チーム
**対象ページ**: https://voicedrive-v100.vercel.app/system-operations
**関連文書**: system-operations_DB要件分析_20251021.md (SO-DB-REQ-2025-1021-001)

---

## 📋 ドキュメント概要

このドキュメントは、**system-operations（システム運用）ページ**の実装に必要な以下の情報を網羅的にまとめたマスターリストです：

1. **必要なテーブル定義**（Prisma Schema）
2. **必要なAPI定義**（エンドポイント、リクエスト/レスポンス）
3. **実装すべきサービス**（ビジネスロジック）
4. **実装優先順位**（Phase分け）

**目的**: このドキュメント1つで、system-operationsページの実装に必要な全ての情報を把握できるようにする。

---

## 🗂️ テーブル定義（Prisma Schema）

### ❌ 新規追加テーブル

#### 1. SystemHealth（システムヘルス）

**優先度**: 🔴 **最重要**

```prisma
model SystemHealth {
  id                String   @id @default(cuid())
  status            String   // "healthy", "warning", "critical"
  uptime            Int      // 稼働時間（秒）
  serverStartedAt   DateTime // サーバー起動日時
  lastHealthCheck   DateTime @default(now())
  cpuUsage          Float?   // CPU使用率（%）
  memoryUsage       Float?   // メモリ使用率（%）
  diskUsage         Float?   // ディスク使用率（%）
  apiResponseTime   Float?   // API平均応答時間（ms）
  errorRate         Float?   // エラー率（%）
  metadata          Json?    // その他メトリクス
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([status])
  @@index([lastHealthCheck])
  @@map("system_health")
}
```

**使用箇所**:
- システム状態表示（「正常」「警告」「異常」）
- サーバー稼働率表示（「99.8%」）
- 稼働時間表示（「28日」）

---

#### 2. VotingConfig（投票設定）

**優先度**: 🟠 **重要**

```prisma
model VotingConfig {
  id                    String   @id @default(cuid())
  configKey             String   @unique
  agendaModeSettings    Json     // 議題モードの投票設定
  projectModeSettings   Json     // プロジェクトモードの投票設定
  votingRules           Json     // 共通の投票ルール
  votingWeights         Json     // 権限レベル別投票重み
  approvalThresholds    Json     // 承認閾値設定
  description           String?
  updatedBy             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  updatedByUser User @relation("VotingConfigUpdater", fields: [updatedBy], references: [id])

  @@index([configKey])
  @@index([updatedAt])
  @@map("voting_configs")
}
```

**使用箇所**:
- 投票設定カード: 「最終更新: 2025/10/13」

**JSON構造例**:
```typescript
// agendaModeSettings
{
  "votingPeriod": 14,                    // 投票期間（日）
  "requiredVoteCount": 10,               // 必要投票数
  "approvalThreshold": 70,               // 承認閾値（%）
  "escalationThreshold": 100             // エスカレーション閾値（スコア）
}

// votingWeights
{
  "level1-5": 1.0,                       // レベル1-5の投票重み
  "level6-10": 1.2,                      // レベル6-10の投票重み
  "level11-15": 1.5,                     // レベル11-15の投票重み
  "level16-20": 2.0,                     // レベル16-20の投票重み
  "level21-25": 3.0                      // レベル21-25の投票重み
}
```

---

#### 3. MenuConfig（メニュー設定）

**優先度**: 🟠 **重要**

```prisma
model MenuConfig {
  id              String   @id @default(cuid())
  menuType        String   // "agenda", "project", "common"
  menuKey         String   @unique
  label           String   // 表示ラベル
  icon            String?  // アイコン（絵文字またはアイコン名）
  path            String   // ルートパス
  order           Int      // 表示順序
  isVisible       Boolean  @default(true)
  requiredLevel   Float?   // 必要な権限レベル
  enabledInModes  Json     // 有効なモード ["AGENDA_MODE", "PROJECT_MODE"]
  description     String?
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  updatedByUser User @relation("MenuConfigUpdater", fields: [updatedBy], references: [id])

  @@index([menuType])
  @@index([isVisible])
  @@index([order])
  @@map("menu_configs")
}
```

**使用箇所**:
- サイドバーメニュー管理カード: 「管理項目: 11件」

**初期データ例**:
```typescript
const initialMenuItems = [
  {
    menuType: 'common',
    menuKey: 'home',
    label: 'ホーム',
    icon: '🏠',
    path: '/home',
    order: 1,
    isVisible: true,
    requiredLevel: 1,
    enabledInModes: ['AGENDA_MODE', 'PROJECT_MODE']
  },
  {
    menuType: 'agenda',
    menuKey: 'agenda-board',
    label: '議題ボード',
    icon: '📋',
    path: '/agenda-board',
    order: 2,
    isVisible: true,
    requiredLevel: 1,
    enabledInModes: ['AGENDA_MODE']
  },
  // ... 全11項目
];
```

---

### ✅ 既存テーブル（拡張・リレーション追加）

#### 4. User（ユーザー）

**追加リレーション**:
```prisma
model User {
  // ... 既存フィールド

  // 🆕 リレーション追加
  votingConfigsUpdated VotingConfig[] @relation("VotingConfigUpdater")
  menuConfigsUpdated   MenuConfig[]   @relation("MenuConfigUpdater")

  // ✅ 既存リレーション（mode-switcherで追加済み）
  systemConfigsUpdated SystemConfig[] @relation("SystemConfigUpdater")
}
```

**推奨インデックス追加**:
```prisma
model User {
  // ... 既存フィールド

  @@index([lastLoginAt]) // アクティブユーザー数クエリ高速化
}
```

---

#### 5. SystemConfig（システム設定）

**確認**: mode-switcherで追加済み

**使用箇所**:
- 現在のモード表示
- システム設定項目数表示

**追加の設定項目例**:
```typescript
const systemSettings = [
  {
    configKey: 'system_mode',
    configValue: { mode: 'AGENDA_MODE', ... },
    category: 'system'
  },
  {
    configKey: 'notification_settings',
    configValue: { email: true, push: false, ... },
    category: 'feature'
  },
  {
    configKey: 'ui_theme',
    configValue: { theme: 'dark', fontSize: 'medium' },
    category: 'ui'
  },
  // ... 合計28件
];
```

---

#### 6. AuditLog（監査ログ）

**確認**: 既存

**使用箇所**:
- 本日のログ件数表示

**推奨インデックス追加**:
```prisma
model AuditLog {
  // ... 既存フィールド

  @@index([createdAt]) // 日別ログ件数クエリ高速化
}
```

---

## 🔌 API定義

### API 1: システム概要取得

**エンドポイント**: `GET /api/system/overview`

**説明**: システム運用ページに表示する統計情報を取得

**認証**: JWT Bearer Token（Level 99のみ）

**リクエスト**:
```http
GET /api/system/overview
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```typescript
{
  "status": "healthy" | "warning" | "critical",
  "statusDisplay": "正常" | "警告" | "異常",
  "uptime": "28日",
  "uptimeSeconds": 2419200,
  "totalUsers": 342,
  "activeUsers": 287,
  "currentMode": "AGENDA_MODE" | "PROJECT_MODE",
  "currentModeDisplay": "議題" | "プロジェクト",
  "serverStartedAt": "2025-09-23T10:00:00Z",
  "lastHealthCheck": "2025-10-21T15:30:00Z",
  "metrics": {
    "cpuUsage": 45.2,
    "memoryUsage": 62.8,
    "diskUsage": 38.5,
    "apiResponseTime": 125.3,
    "errorRate": 0.12
  }
}
```

**エラーレスポンス**:
```typescript
{
  "error": "Unauthorized",
  "message": "Level 99 permission required",
  "statusCode": 403
}
```

---

### API 2: 管理機能統計取得

**エンドポイント**: `GET /api/system/operations-stats`

**説明**: 7つの管理機能カードに表示する統計情報を取得

**認証**: JWT Bearer Token（Level 99のみ）

**リクエスト**:
```http
GET /api/system/operations-stats
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```typescript
{
  "systemMonitor": {
    "uptimePercentage": 99.8,
    "status": "healthy"
  },
  "modeSwitcher": {
    "currentMode": "AGENDA_MODE",
    "currentModeDisplay": "議題モード",
    "lastChangedAt": "2025-09-15T10:00:00Z"
  },
  "votingSettings": {
    "lastUpdated": "2025-10-13",
    "totalConfigs": 1
  },
  "userManagement": {
    "activeUsers": 342,
    "totalUsers": 342,
    "inactiveUsers": 0
  },
  "systemSettings": {
    "totalSettings": 28,
    "categories": {
      "system": 8,
      "feature": 12,
      "ui": 8
    }
  },
  "auditLogs": {
    "todayCount": 127,
    "weekCount": 845,
    "monthCount": 3421
  },
  "sidebarMenuManagement": {
    "totalMenuItems": 11,
    "visibleItems": 11,
    "hiddenItems": 0
  }
}
```

---

### API 3: システムヘルス記録

**エンドポイント**: `POST /api/system/health`

**説明**: システムヘルスチェック結果を記録（定期実行用）

**認証**: APIキー認証（内部サービス用）

**リクエスト**:
```http
POST /api/system/health
X-API-Key: {internal_api_key}
Content-Type: application/json
```

```typescript
{
  "status": "healthy" | "warning" | "critical",
  "uptime": 2419200,
  "serverStartedAt": "2025-09-23T10:00:00Z",
  "cpuUsage": 45.2,
  "memoryUsage": 62.8,
  "diskUsage": 38.5,
  "apiResponseTime": 125.3,
  "errorRate": 0.12,
  "metadata": {
    "nodeVersion": "18.17.0",
    "platform": "linux"
  }
}
```

**レスポンス**:
```typescript
{
  "id": "ckxyz123...",
  "status": "healthy",
  "recordedAt": "2025-10-21T15:30:00Z"
}
```

---

### API 4: 監査ログ記録

**エンドポイント**: `POST /api/audit/log`

**説明**: システム操作の監査ログを記録

**認証**: JWT Bearer Token

**リクエスト**:
```http
POST /api/audit/log
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```typescript
{
  "action": "SYSTEM_MODE_CHANGED" | "VOTING_CONFIG_UPDATED" | "MENU_CONFIG_UPDATED",
  "entityType": "SystemConfig" | "VotingConfig" | "MenuConfig",
  "entityId": "system_mode",
  "oldValues": { "mode": "AGENDA_MODE" },
  "newValues": { "mode": "PROJECT_MODE" },
  "reason": "プロジェクト化モードへの移行準備が完了したため"
}
```

**レスポンス**:
```typescript
{
  "id": "ckxyz456...",
  "userId": "user_123",
  "action": "SYSTEM_MODE_CHANGED",
  "createdAt": "2025-10-21T15:30:00Z"
}
```

---

## 🛠️ サービス実装

### Service 1: SystemHealthService

**ファイルパス**: `src/services/SystemHealthService.ts`

**主要メソッド**:

```typescript
export class SystemHealthService {
  /**
   * システムヘルス情報を記録
   */
  async recordHealth(): Promise<SystemHealth> {
    const status = await this.checkSystemStatus();
    const metrics = await this.collectMetrics();

    return await prisma.systemHealth.create({
      data: {
        status,
        uptime: process.uptime(),
        serverStartedAt: new Date(Date.now() - process.uptime() * 1000),
        lastHealthCheck: new Date(),
        ...metrics
      }
    });
  }

  /**
   * 最新のヘルス情報を取得
   */
  async getLatestHealth(): Promise<SystemHealth | null> {
    return await prisma.systemHealth.findFirst({
      orderBy: { lastHealthCheck: 'desc' }
    });
  }

  /**
   * サーバー稼働率を計算
   */
  async calculateUptime(period: 'day' | 'week' | 'month'): Promise<number> {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const healthRecords = await prisma.systemHealth.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (healthRecords.length === 0) return 100;

    const totalRecords = healthRecords.length;
    const healthyRecords = healthRecords.filter(r => r.status === 'healthy').length;

    return (healthyRecords / totalRecords) * 100;
  }

  /**
   * システムステータスをチェック
   */
  private async checkSystemStatus(): Promise<'healthy' | 'warning' | 'critical'> {
    const errorRate = await this.calculateErrorRate();
    const apiResponseTime = await this.getAverageApiResponseTime();
    const memoryUsage = await this.getMemoryUsage();

    // Critical条件
    if (errorRate > 5 || apiResponseTime > 1000 || memoryUsage > 90) {
      return 'critical';
    }

    // Warning条件
    if (errorRate > 1 || apiResponseTime > 500 || memoryUsage > 75) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * メトリクス収集
   */
  private async collectMetrics() {
    return {
      cpuUsage: await this.getCpuUsage(),
      memoryUsage: await this.getMemoryUsage(),
      diskUsage: await this.getDiskUsage(),
      apiResponseTime: await this.getAverageApiResponseTime(),
      errorRate: await this.calculateErrorRate(),
      metadata: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  }

  private async getCpuUsage(): Promise<number> {
    // CPU使用率の計算実装
    const cpus = os.cpus();
    const usage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0);
    return usage / cpus.length;
  }

  private async getMemoryUsage(): Promise<number> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    return ((totalMemory - freeMemory) / totalMemory) * 100;
  }

  private async getDiskUsage(): Promise<number> {
    // ディスク使用率の計算実装
    // Node.jsではOS依存のため、外部ライブラリ使用推奨
    return 38.5; // TODO: 実装
  }

  private async getAverageApiResponseTime(): Promise<number> {
    // 過去1時間のAPI応答時間平均を計算
    const oneHourAgo = new Date(Date.now() - 3600000);

    // TODO: APIログから計算
    return 125.3;
  }

  private async calculateErrorRate(): Promise<number> {
    // 過去1時間のエラー率を計算
    const oneHourAgo = new Date(Date.now() - 3600000);

    const totalLogs = await prisma.auditLog.count({
      where: { createdAt: { gte: oneHourAgo } }
    });

    const errorLogs = await prisma.auditLog.count({
      where: {
        createdAt: { gte: oneHourAgo },
        action: { contains: 'ERROR' }
      }
    });

    return totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;
  }
}
```

---

### Service 2: SystemOperationsService

**ファイルパス**: `src/services/SystemOperationsService.ts`

**主要メソッド**:

```typescript
export class SystemOperationsService {
  /**
   * システム概要を取得
   */
  async getSystemOverview() {
    const [health, mode, totalUsers, activeUsers, todayLogs] = await Promise.all([
      this.getSystemHealth(),
      this.getCurrentMode(),
      this.getTotalUsers(),
      this.getActiveUsers(),
      this.getTodayLogsCount()
    ]);

    return {
      status: health?.status || 'unknown',
      statusDisplay: this.formatStatus(health?.status),
      uptime: this.formatUptime(health?.uptime || 0),
      uptimeSeconds: health?.uptime || 0,
      totalUsers,
      activeUsers,
      currentMode: mode,
      currentModeDisplay: mode === 'PROJECT_MODE' ? 'プロジェクト' : '議題',
      serverStartedAt: health?.serverStartedAt,
      lastHealthCheck: health?.lastHealthCheck,
      metrics: {
        cpuUsage: health?.cpuUsage,
        memoryUsage: health?.memoryUsage,
        diskUsage: health?.diskUsage,
        apiResponseTime: health?.apiResponseTime,
        errorRate: health?.errorRate
      }
    };
  }

  /**
   * 管理機能統計を取得
   */
  async getOperationsStats() {
    const [
      uptimePercentage,
      modeConfig,
      votingConfig,
      settingsCount,
      todayLogs,
      weekLogs,
      monthLogs,
      menuItems
    ] = await Promise.all([
      this.getUptimePercentage(),
      this.getModeConfig(),
      this.getVotingConfig(),
      this.getSettingsCount(),
      this.getTodayLogsCount(),
      this.getWeekLogsCount(),
      this.getMonthLogsCount(),
      this.getMenuItemsStats()
    ]);

    const totalUsers = await this.getTotalUsers();
    const activeUsers = await this.getActiveUsers();

    return {
      systemMonitor: {
        uptimePercentage,
        status: uptimePercentage > 99.5 ? 'healthy' : uptimePercentage > 99 ? 'warning' : 'critical'
      },
      modeSwitcher: {
        currentMode: modeConfig?.configValue?.mode || 'AGENDA_MODE',
        currentModeDisplay: modeConfig?.configValue?.mode === 'PROJECT_MODE' ? 'プロジェクトモード' : '議題モード',
        lastChangedAt: modeConfig?.updatedAt
      },
      votingSettings: {
        lastUpdated: votingConfig?.updatedAt?.toLocaleDateString('ja-JP'),
        totalConfigs: votingConfig ? 1 : 0
      },
      userManagement: {
        activeUsers,
        totalUsers,
        inactiveUsers: totalUsers - activeUsers
      },
      systemSettings: {
        totalSettings: settingsCount,
        categories: await this.getSettingsByCategory()
      },
      auditLogs: {
        todayCount: todayLogs,
        weekCount: weekLogs,
        monthCount: monthLogs
      },
      sidebarMenuManagement: {
        totalMenuItems: menuItems.total,
        visibleItems: menuItems.visible,
        hiddenItems: menuItems.hidden
      }
    };
  }

  private async getSystemHealth() {
    return await prisma.systemHealth.findFirst({
      orderBy: { lastHealthCheck: 'desc' }
    });
  }

  private async getUptimePercentage(): Promise<number> {
    const healthService = new SystemHealthService();
    return await healthService.calculateUptime('month');
  }

  private async getCurrentMode(): Promise<string> {
    const config = await prisma.systemConfig.findUnique({
      where: { configKey: 'system_mode' }
    });
    return config?.configValue?.mode || 'AGENDA_MODE';
  }

  private async getModeConfig() {
    return await prisma.systemConfig.findUnique({
      where: { configKey: 'system_mode' }
    });
  }

  private async getVotingConfig() {
    return await prisma.votingConfig.findUnique({
      where: { configKey: 'default' }
    });
  }

  private async getTotalUsers(): Promise<number> {
    return await prisma.user.count();
  }

  private async getActiveUsers(): Promise<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return await prisma.user.count({
      where: { lastLoginAt: { gte: oneMonthAgo } }
    });
  }

  private async getSettingsCount(): Promise<number> {
    return await prisma.systemConfig.count();
  }

  private async getSettingsByCategory() {
    const configs = await prisma.systemConfig.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    return {
      system: configs.find(c => c.category === 'system')?._count.id || 0,
      feature: configs.find(c => c.category === 'feature')?._count.id || 0,
      ui: configs.find(c => c.category === 'ui')?._count.id || 0
    };
  }

  private async getTodayLogsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.auditLog.count({
      where: { createdAt: { gte: today } }
    });
  }

  private async getWeekLogsCount(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return await prisma.auditLog.count({
      where: { createdAt: { gte: weekAgo } }
    });
  }

  private async getMonthLogsCount(): Promise<number> {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return await prisma.auditLog.count({
      where: { createdAt: { gte: monthAgo } }
    });
  }

  private async getMenuItemsStats() {
    const total = await prisma.menuConfig.count();
    const visible = await prisma.menuConfig.count({
      where: { isVisible: true }
    });

    return {
      total,
      visible,
      hidden: total - visible
    };
  }

  private formatStatus(status?: string): string {
    switch (status) {
      case 'healthy':
        return '正常';
      case 'warning':
        return '警告';
      case 'critical':
        return '異常';
      default:
        return '不明';
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    return `${days}日`;
  }
}
```

---

## ⏱️ 定期タスク（Cron Jobs）

### Job 1: システムヘルスチェック

**ファイルパス**: `src/jobs/healthCheck.ts`

**実行頻度**: 1分毎

```typescript
import cron from 'node-cron';
import { SystemHealthService } from '../services/SystemHealthService';

// 1分毎にヘルスチェック実行
cron.schedule('* * * * *', async () => {
  const healthService = new SystemHealthService();

  try {
    await healthService.recordHealth();
    console.log(`[HealthCheck] Successfully recorded at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[HealthCheck] Error:', error);
  }
});
```

---

### Job 2: 古いヘルスデータのクリーンアップ

**ファイルパス**: `src/jobs/cleanupHealthData.ts`

**実行頻度**: 日次（深夜2時）

```typescript
import cron from 'node-cron';
import { prisma } from '../lib/prisma';

// 日次（深夜2時）で古いヘルスデータを削除
cron.schedule('0 2 * * *', async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const deleted = await prisma.systemHealth.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo }
      }
    });

    console.log(`[CleanupHealthData] Deleted ${deleted.count} old health records`);
  } catch (error) {
    console.error('[CleanupHealthData] Error:', error);
  }
});
```

---

## 📦 実装優先順位（Phase分け）

### Phase 1: 基本実装（1-2日）

**優先度**: 🔴 **最重要**

**実装項目**:
1. ✅ SystemHealthテーブル作成
2. ✅ SystemHealthService実装
3. ✅ GET /api/system/overview API実装
4. ✅ 定期ヘルスチェックジョブ実装
5. ✅ SystemOperationsPage に実データ表示実装

**完了条件**:
- システム状態が実データで表示される
- サーバー稼働率が正確に表示される
- 稼働時間が正確に表示される

---

### Phase 2: 統計機能実装（2-3日）

**優先度**: 🟠 **重要**

**実装項目**:
1. ✅ VotingConfigテーブル作成
2. ✅ MenuConfigテーブル作成
3. ✅ User, AuditLogのインデックス追加
4. ✅ GET /api/system/operations-stats API実装
5. ✅ SystemOperationsService実装
6. ✅ 管理機能カードに実データ表示実装

**完了条件**:
- 7つの管理機能カードが全て実データで表示される
- 投票設定の最終更新日が表示される
- メニュー設定の管理項目数が表示される

---

### Phase 3: 監視・運用改善（1-2日）

**優先度**: 🟡 **推奨**

**実装項目**:
1. ✅ POST /api/system/health API実装
2. ✅ POST /api/audit/log API実装
3. ✅ 古いヘルスデータのクリーンアップジョブ実装
4. ✅ アラート機能実装（Critical時に通知）
5. ✅ ダッシュボードの自動更新機能

**完了条件**:
- システム異常時に管理者に通知される
- ヘルスデータが自動的にクリーンアップされる
- ダッシュボードがリアルタイムで更新される

---

## 📊 工数見積もり

| Phase | 工数 | 担当者数 | 期間 |
|-------|------|---------|------|
| Phase 1: 基本実装 | 2日 | 1名 | 2日 |
| Phase 2: 統計機能実装 | 3日 | 1名 | 3日 |
| Phase 3: 監視・運用改善 | 2日 | 1名 | 2日 |
| **合計** | **7日** | **1名** | **7日** |

---

## ✅ 実装チェックリスト

### Phase 1

- [ ] `schema.prisma` にSystemHealthテーブル追加
- [ ] `prisma migrate dev` または `prisma db push` 実行
- [ ] `src/services/SystemHealthService.ts` 実装
- [ ] `src/api/routes/system.ts` 実装（GET /api/system/overview）
- [ ] `src/jobs/healthCheck.ts` 実装
- [ ] SystemOperationsPage修正（実データ表示）
- [ ] 動作確認・テスト

### Phase 2

- [ ] `schema.prisma` にVotingConfig, MenuConfigテーブル追加
- [ ] User, AuditLogのインデックス追加
- [ ] `prisma migrate dev` または `prisma db push` 実行
- [ ] MenuConfigの初期データ作成
- [ ] `src/services/SystemOperationsService.ts` 実装
- [ ] `src/api/routes/system.ts` 実装（GET /api/system/operations-stats）
- [ ] 管理機能カード修正（実データ表示）
- [ ] 動作確認・テスト

### Phase 3

- [ ] `src/api/routes/system.ts` 実装（POST /api/system/health）
- [ ] `src/api/routes/audit.ts` 実装（POST /api/audit/log）
- [ ] `src/jobs/cleanupHealthData.ts` 実装
- [ ] アラート機能実装
- [ ] 自動更新機能実装（WebSocket or SSE）
- [ ] 統合テスト
- [ ] 本番環境デプロイ

---

## 🔗 関連ドキュメント

- [system-operations_DB要件分析_20251021.md](./system-operations_DB要件分析_20251021.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [mode-switcher暫定マスターリスト_20251021.md](./mode-switcher暫定マスターリスト_20251021.md)

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
ステータス: レビュー待ち
