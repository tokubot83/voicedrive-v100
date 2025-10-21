# system-operations（システム運用）ページ - DB要件分析

**文書番号**: SO-DB-REQ-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDrive開発チーム
**対象ページ**: https://voicedrive-v100.vercel.app/system-operations
**分析基準**: データ管理責任分界点定義書 (DM-DEF-2025-1008-001)

---

## 📋 エグゼクティブサマリー

### ページ概要
**システム運用（System Operations）ページ**は、レベル99（システム管理者）専用のダッシュボードページであり、VoiceDriveの主要な管理機能へのアクセスポイントを提供します。

### 主要機能
1. **システム監視** - サーバー状態、パフォーマンス、エラーログの監視
2. **モード切替** - 議題モード ⇄ プロジェクトモード切替
3. **投票設定** - 議題/プロジェクトモードの投票ルール設定
4. **ユーザー管理** - アカウント管理、権限レベル設定
5. **システム設定** - グローバル設定、機能ON/OFF切替
6. **監査ログ** - システム変更履歴、操作ログの確認
7. **サイドバーメニュー管理** - 議題/プロジェクト/共通メニューの表示設定

### ページの性質

**重要な発見**:
- このページは**ナビゲーションハブ**（リンク集）
- 実際のデータ処理は各リンク先ページで実施
- ページ自体が表示する統計情報のみDB要件が発生

### データ管理責任の結論

| データカテゴリ | VoiceDrive | 医療システム | 判定理由 |
|--------------|-----------|-------------|---------|
| システム状態（正常/異常） | ✅ **マスタ** | ❌ | VoiceDrive内部の稼働状態 |
| 稼働時間 | ✅ **マスタ** | ❌ | VoiceDriveサーバーの稼働時間 |
| 総ユーザー数 | キャッシュ | ✅ **マスタ** | 医療システムから同期 |
| 現在のモード | ✅ **マスタ** | ❌ | SystemConfigテーブル |
| システム監視統計 | ✅ **マスタ** | ❌ | VoiceDrive運用データ |
| 監査ログ件数 | ✅ **マスタ** | ❌ | AuditLogテーブル |

**結論**:
- このページは**100% VoiceDrive内部データのみ**で動作
- 医療システムへのAPI呼び出しは不要
- 統計情報はVoiceDriveのDBから取得

---

## 🎯 ページ機能の詳細分析

### 1. システムステータス概要（175-195行目）

**表示内容**:
```typescript
// システム状態
status: "正常" | "警告" | "異常"
statusIndicator: 緑色の点滅アニメーション

// 稼働時間
uptime: "28日"

// 総ユーザー数
totalUsers: 342名

// 現在のモード
currentMode: "議題" | "プロジェクト"
```

**データソース**:

| 表示項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| システム状態 | VoiceDrive | ❌ ハードコード | SystemHealth（新規） | 🔴 **要追加** |
| 稼働時間 | VoiceDrive | ❌ ハードコード | SystemHealth（新規） | 🔴 **要追加** |
| 総ユーザー数 | VoiceDrive | ✅ User.count() | User（既存） | ✅ OK |
| 現在のモード | VoiceDrive | ✅ SystemConfig | SystemConfig（既存） | ✅ OK |

#### 解決策1: SystemHealth テーブル追加

**目的**: システムの稼働状態を記録・監視

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

**使用例**:
```typescript
// システム状態取得
const health = await prisma.systemHealth.findFirst({
  orderBy: { lastHealthCheck: 'desc' }
});

// 稼働時間計算
const uptime = health ? Math.floor(
  (Date.now() - health.serverStartedAt.getTime()) / 1000 / 60 / 60 / 24
) : 0;

// システムステータス
const status = health?.status === 'healthy' ? '正常' :
               health?.status === 'warning' ? '警告' : '異常';
```

---

### 2. 管理機能カード（197-257行目）

**7つの管理機能カード**:

| カードID | タイトル | データソース | 統計表示 | DB要件 |
|---------|---------|------------|---------|--------|
| system-monitor | システム監視 | SystemHealth | サーバー稼働率: 99.8% | SystemHealth |
| mode-switcher | モード切替 | SystemConfig | 現在: 議題モード | SystemConfig ✅ |
| voting-settings | 投票設定 | VotingConfig | 最終更新: 2025/10/13 | VotingConfig（新規） |
| user-management | ユーザー管理 | User | アクティブユーザー: 342名 | User ✅ |
| system-settings | システム設定 | SystemConfig | 設定項目: 28件 | SystemConfig ✅ |
| audit-logs | 監査ログ | AuditLog | 本日のログ: 127件 | AuditLog ✅ |
| sidebar-menu-management | サイドバーメニュー管理 | MenuConfig | 管理項目: 11件 | MenuConfig（新規） |

#### 不足項目の分析

**🔴 不足テーブル1: VotingConfig（投票設定）**
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

**🔴 不足テーブル2: MenuConfig（サイドバーメニュー設定）**
```prisma
model MenuConfig {
  id              String   @id @default(cuid())
  menuType        String   // "agenda", "project", "common"
  menuKey         String   @unique
  label           String   // 表示ラベル
  icon            String?  // アイコン
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

---

### 3. クイックアクション（260-297行目）

**表示内容**:
- システム状態確認（リンク）
- モード切替（リンク）
- 最新ログ確認（リンク）

**データソース**: 各リンク先ページで処理

**DB要件**: なし（ナビゲーションのみ）

---

## 📊 必要なデータベーステーブル分析

### ❌ 不足テーブル1: SystemHealth

**目的**: システムの稼働状態監視

**優先度**: 🔴 **最重要**

**理由**:
- 現在「サーバー稼働率: 99.8%」「稼働時間: 28日」はハードコード
- 実際のシステム状態を記録・監視する必要がある
- システムダウンタイムの追跡、パフォーマンス監視に必須

**実装例**:
```typescript
// システムヘルスチェック（定期実行: 1分毎）
export async function recordSystemHealth() {
  const health = {
    status: await checkSystemStatus(),
    uptime: process.uptime(),
    serverStartedAt: new Date(Date.now() - process.uptime() * 1000),
    lastHealthCheck: new Date(),
    cpuUsage: await getCpuUsage(),
    memoryUsage: await getMemoryUsage(),
    diskUsage: await getDiskUsage(),
    apiResponseTime: await getAverageApiResponseTime(),
    errorRate: await calculateErrorRate()
  };

  await prisma.systemHealth.create({ data: health });
}
```

---

### ❌ 不足テーブル2: VotingConfig

**目的**: 投票設定の管理

**優先度**: 🟠 **重要**

**理由**:
- 「最終更新: 2025/10/13」を表示するには更新日時が必要
- 議題モード/プロジェクトモードで異なる投票ルールを管理
- 権限レベル別の投票重みを設定

**使用例**:
```typescript
// 投票設定取得
const votingConfig = await prisma.votingConfig.findUnique({
  where: { configKey: 'default' },
  include: { updatedByUser: true }
});

// 最終更新日表示
const lastUpdated = votingConfig.updatedAt.toLocaleDateString('ja-JP');
// "最終更新: 2025/10/13"
```

---

### ❌ 不足テーブル3: MenuConfig

**目的**: サイドバーメニューの表示設定管理

**優先度**: 🟠 **重要**

**理由**:
- 「管理項目: 11件」を表示するにはMenuConfigテーブルが必要
- 議題モード/プロジェクトモード/共通メニューの切り替え
- メニュー項目の表示/非表示制御

**使用例**:
```typescript
// メニュー設定取得
const menuItems = await prisma.menuConfig.findMany({
  where: { isVisible: true },
  orderBy: { order: 'asc' }
});

// 管理項目数
const menuItemCount = menuItems.length; // 11件
```

---

### ✅ 既存テーブル確認: SystemConfig

**確認**: mode-switcherで追加済み

**使用箇所**:
- 現在のモード表示: `SystemConfig.configValue.mode`
- システム設定項目数: `SystemConfig.count()`

**クエリ例**:
```typescript
// 現在のモード取得
const modeConfig = await prisma.systemConfig.findUnique({
  where: { configKey: 'system_mode' }
});
const currentMode = modeConfig?.configValue?.mode === 'PROJECT_MODE' ? 'プロジェクト' : '議題';

// 設定項目数
const settingsCount = await prisma.systemConfig.count();
// "設定項目: 28件"
```

---

### ✅ 既存テーブル確認: User

**確認**: 既存

**使用箇所**:
- 総ユーザー数: `User.count()`
- アクティブユーザー数: `User.count({ where: { lastLoginAt: { gte: ... } } })`

**クエリ例**:
```typescript
// 総ユーザー数
const totalUsers = await prisma.user.count();

// アクティブユーザー数（過去1ヶ月）
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

const activeUsers = await prisma.user.count({
  where: {
    lastLoginAt: { gte: oneMonthAgo }
  }
});
```

---

### ✅ 既存テーブル確認: AuditLog

**確認**: 既存

**使用箇所**:
- 本日のログ件数: `AuditLog.count({ where: { createdAt: { gte: today } } })`

**クエリ例**:
```typescript
// 本日のログ件数
const today = new Date();
today.setHours(0, 0, 0, 0);

const todayLogsCount = await prisma.auditLog.count({
  where: {
    createdAt: { gte: today }
  }
});
// "本日のログ: 127件"
```

---

## 🔍 データ管理責任分界点の適用

### カテゴリ分類

#### ✅ VoiceDrive 100%管轄

| データ項目 | テーブル | 理由 |
|-----------|---------|------|
| システム稼働状態 | SystemHealth | VoiceDriveサーバーの監視 |
| システムモード設定 | SystemConfig | VoiceDrive内部の動作制御 |
| 投票設定 | VotingConfig | VoiceDrive独自の投票ルール |
| メニュー設定 | MenuConfig | VoiceDrive UI設定 |
| 監査ログ | AuditLog | VoiceDrive操作履歴 |
| アクティブユーザー数 | User | ログイン履歴はVoiceDrive管理 |

#### ⚠️ 医療システムから同期（キャッシュ）

| データ項目 | テーブル | 理由 |
|-----------|---------|------|
| 総職員数 | User | 医療システムのEmployeeテーブルが真実の情報源 |

---

## 📝 不足項目の洗い出し

### 🔴 優先度: 最重要

#### 1. SystemHealth テーブル
**理由**:
- システム稼働状態の監視に必須
- 「サーバー稼働率: 99.8%」「稼働時間: 28日」のデータソース
- パフォーマンス監視、障害検知に必要

**影響範囲**:
- system-operationsページのシステムステータス表示
- system-monitorページの詳細監視機能

**実装優先度**: Phase 1（即時実装）

---

### 🟠 優先度: 重要

#### 2. VotingConfig テーブル
**理由**:
- 投票設定の永続化と管理に必要
- 「最終更新: 2025/10/13」の表示に必要
- voting-settingsページの実装に必須

**影響範囲**:
- system-operationsページの投票設定カード
- voting-settingsページの全機能

**実装優先度**: Phase 2（voting-settingsページ実装時）

---

#### 3. MenuConfig テーブル
**理由**:
- サイドバーメニューの表示制御に必要
- 「管理項目: 11件」の表示に必要
- sidebar-menu-managementページの実装に必須

**影響範囲**:
- system-operationsページのサイドバーメニュー管理カード
- sidebar-menu-managementページの全機能
- 全ページのサイドバー表示制御

**実装優先度**: Phase 2（sidebar-menu-managementページ実装時）

---

### ✅ 既存テーブルで対応可能

#### 1. SystemConfig テーブル
**確認項目**:
- ✅ mode-switcherで追加済み
- ✅ システム設定の永続化に使用可能

**使用方法**:
- システムモード取得
- システム設定項目数の表示

---

#### 2. User テーブル
**確認項目**:
- ✅ 既存のUserテーブルで対応可能
- ✅ `lastLoginAt` フィールドが存在

**推奨改善**:
```prisma
model User {
  // ... 既存フィールド

  @@index([lastLoginAt]) // アクティブユーザー数クエリ高速化
}
```

---

#### 3. AuditLog テーブル
**確認項目**:
- ✅ 既存のAuditLogテーブルで対応可能
- ✅ `createdAt` フィールドが存在

**推奨改善**:
```prisma
model AuditLog {
  // ... 既存フィールド

  @@index([createdAt]) // 日別ログ件数クエリ高速化
}
```

---

## 🔄 医療システムとの連携

### ❌ 医療システムAPI不要

**結論**: system-operationsページは**医療システムとの連携が一切不要**

**理由**:
1. 表示される統計情報は全てVoiceDrive内部データ
2. 各管理機能へのリンクのみ提供
3. 総職員数は既にUserテーブルにキャッシュされている

### ✅ VoiceDrive内部で完結

**データフロー**:
```
SystemOperationsPage
  ↓
SystemHealth テーブル読み取り（稼働状態）
  ↓
SystemConfig テーブル読み取り（現在のモード）
  ↓
User テーブル集計（総ユーザー数、アクティブユーザー数）
  ↓
AuditLog テーブル集計（本日のログ件数）
  ↓
画面表示
```

---

## 📋 実装推奨事項

### Phase 1: 緊急対応（1-2日）

#### ✅ SystemHealth テーブル作成
```prisma
model SystemHealth {
  id                String   @id @default(cuid())
  status            String   // "healthy", "warning", "critical"
  uptime            Int      // 稼働時間（秒）
  serverStartedAt   DateTime // サーバー起動日時
  lastHealthCheck   DateTime @default(now())
  cpuUsage          Float?
  memoryUsage       Float?
  diskUsage         Float?
  apiResponseTime   Float?
  errorRate         Float?
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([status])
  @@index([lastHealthCheck])
  @@map("system_health")
}
```

#### ✅ システムヘルスチェックサービス実装
```typescript
// src/services/SystemHealthService.ts
export class SystemHealthService {
  async recordHealth() {
    const status = await this.checkSystemStatus();
    const metrics = await this.collectMetrics();

    await prisma.systemHealth.create({
      data: {
        status,
        uptime: process.uptime(),
        serverStartedAt: new Date(Date.now() - process.uptime() * 1000),
        lastHealthCheck: new Date(),
        ...metrics
      }
    });
  }

  async getLatestHealth() {
    return await prisma.systemHealth.findFirst({
      orderBy: { lastHealthCheck: 'desc' }
    });
  }

  private async checkSystemStatus(): Promise<string> {
    const errorRate = await this.calculateErrorRate();
    const apiResponseTime = await this.getAverageApiResponseTime();

    if (errorRate > 5 || apiResponseTime > 1000) return 'critical';
    if (errorRate > 1 || apiResponseTime > 500) return 'warning';
    return 'healthy';
  }
}
```

#### ✅ 定期ヘルスチェック実装
```typescript
// src/jobs/healthCheck.ts
import cron from 'node-cron';

// 1分毎にヘルスチェック実行
cron.schedule('* * * * *', async () => {
  const healthService = new SystemHealthService();
  await healthService.recordHealth();
});
```

---

### Phase 2: 統計機能の実装（3-5日）

#### ✅ VotingConfig テーブル作成
```prisma
model VotingConfig {
  id                    String   @id @default(cuid())
  configKey             String   @unique
  agendaModeSettings    Json
  projectModeSettings   Json
  votingRules           Json
  votingWeights         Json
  approvalThresholds    Json
  description           String?
  updatedBy             String
  updatedByUser         User     @relation("VotingConfigUpdater", fields: [updatedBy], references: [id])
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([configKey])
  @@index([updatedAt])
  @@map("voting_configs")
}
```

#### ✅ MenuConfig テーブル作成
```prisma
model MenuConfig {
  id              String   @id @default(cuid())
  menuType        String   // "agenda", "project", "common"
  menuKey         String   @unique
  label           String
  icon            String?
  path            String
  order           Int
  isVisible       Boolean  @default(true)
  requiredLevel   Float?
  enabledInModes  Json
  description     String?
  updatedBy       String
  updatedByUser   User     @relation("MenuConfigUpdater", fields: [updatedBy], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([menuType])
  @@index([isVisible])
  @@index([order])
  @@map("menu_configs")
}
```

#### ✅ SystemOperationsService 実装
```typescript
// src/services/SystemOperationsService.ts
export class SystemOperationsService {
  async getSystemOverview() {
    const [health, mode, totalUsers, activeUsers, todayLogs] = await Promise.all([
      this.getSystemHealth(),
      this.getCurrentMode(),
      this.getTotalUsers(),
      this.getActiveUsers(),
      this.getTodayLogsCount()
    ]);

    return {
      status: health.status === 'healthy' ? '正常' :
              health.status === 'warning' ? '警告' : '異常',
      uptime: this.formatUptime(health.uptime),
      totalUsers,
      currentMode: mode === 'PROJECT_MODE' ? 'プロジェクト' : '議題',
      activeUsers,
      todayLogs
    };
  }

  private async getSystemHealth() {
    return await prisma.systemHealth.findFirst({
      orderBy: { lastHealthCheck: 'desc' }
    });
  }

  private async getCurrentMode() {
    const config = await prisma.systemConfig.findUnique({
      where: { configKey: 'system_mode' }
    });
    return config?.configValue?.mode || 'AGENDA_MODE';
  }

  private async getTotalUsers() {
    return await prisma.user.count();
  }

  private async getActiveUsers() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return await prisma.user.count({
      where: { lastLoginAt: { gte: oneMonthAgo } }
    });
  }

  private async getTodayLogsCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.auditLog.count({
      where: { createdAt: { gte: today } }
    });
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    return `${days}日`;
  }
}
```

---

### Phase 3: インデックス最適化（0.5日）

```prisma
// User テーブル
model User {
  // ... 既存フィールド

  @@index([lastLoginAt]) // アクティブユーザー数クエリ高速化
}

// AuditLog テーブル
model AuditLog {
  // ... 既存フィールド

  @@index([createdAt]) // 日別ログ件数クエリ高速化
}

// SystemHealth テーブル
model SystemHealth {
  // ... 既存フィールド

  @@index([status])
  @@index([lastHealthCheck])
}
```

---

## 🎯 優先度まとめ

| 項目 | 優先度 | 工数 | 理由 |
|-----|-------|------|------|
| SystemHealth テーブル作成 | 🔴 最重要 | 0.5日 | システム監視の基盤 |
| SystemHealthService 実装 | 🔴 最重要 | 0.5日 | ヘルスチェック機能 |
| 定期ヘルスチェック実装 | 🔴 最重要 | 0.3日 | 自動監視 |
| SystemOperationsService実装 | 🟠 重要 | 1日 | 統計機能の実装 |
| VotingConfig テーブル作成 | 🟡 推奨 | 0.3日 | voting-settings実装時 |
| MenuConfig テーブル作成 | 🟡 推奨 | 0.3日 | sidebar-menu-management実装時 |
| インデックス最適化 | 🟢 任意 | 0.2日 | パフォーマンス向上 |

**合計工数**: 3.1日（Phase 1-2のみ）

---

## 📌 次のステップ

1. ✅ **system-operations_DB要件分析_20251021.md** を作成（完了）
2. ⏭️ **system-operations暫定マスターリスト_20251021.md** を作成
3. ⏭️ **schema.prisma** にSystemHealth, VotingConfig, MenuConfigテーブルを追加
4. ⏭️ **医療チームへの連絡** - 医療システム側の対応は不要であることを通知

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
ステータス: レビュー待ち
