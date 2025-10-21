# システムモード管理ページ 暫定マスターリスト

**文書番号**: API-LIST-2025-1021-005
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**対象**: システムモード管理ページ（/mode-switcher）
**作成者**: VoiceDriveチーム

---

## 📋 エグゼクティブサマリー

### 対象ページ
- **URL**: `/mode-switcher`
- **機能**: 議題モード⇄プロジェクト化モードの切り替え管理（レベル99専用）

### 重要な結論

| 項目 | 状態 | 詳細 |
|------|------|------|
| **データ管理責任** | 🟢 VoiceDrive 100% | 医療システムは関与しない |
| **DB実装** | 🔴 未実装 | SystemConfigテーブルが必要 |
| **API実装** | ⏳ 要実装 | 4つのエンドポイントを新規実装 |
| **既存API統合** | 🟡 一部必要 | AuditLogの確認が必要 |
| **医療システム連携** | ❌ 不要 | VoiceDrive内部で完結 |

---

## 1. 必要なテーブル

### 1.1 新規テーブル: `SystemConfig`

**目的**: システム全体設定の永続化（モード設定、将来的には他の設定も）

**スキーマ**:
```prisma
model SystemConfig {
  id          String   @id @default(cuid())

  // 設定情報
  configKey   String   @unique  // "system_mode" など
  configValue Json                // 設定値（JSON形式）
  category    String              // "system", "feature", "ui"
  description String?             // 設定の説明
  isActive    Boolean  @default(true)

  // 更新情報
  updatedBy   String
  updatedByUser User   @relation("SystemConfigUpdater", fields: [updatedBy], references: [id])

  // タイムスタンプ
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([configKey])
  @@index([category])
  @@index([updatedAt])
  @@map("system_configs")
}
```

**主要フィールド説明**:

| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| `configKey` | String (unique) | 設定キー | "system_mode" |
| `configValue` | Json | 設定値（JSON） | `{"mode": "AGENDA_MODE", "enabledAt": "2025-10-21T10:00:00Z", ...}` |
| `category` | String | カテゴリ | "system", "feature", "ui" |
| `description` | String? | 説明 | "システムモード設定（議題モード/プロジェクト化モード）" |
| `isActive` | Boolean | 有効フラグ | true |
| `updatedBy` | String | 更新者ID | "user_abc123" |

**保存される設定値の例**:
```json
{
  "mode": "AGENDA_MODE",
  "enabledAt": "2025-10-21T10:00:00Z",
  "enabledBy": "user_abc123",
  "description": "議題システムモード - 委員会活性化・声を上げる文化の醸成",
  "migrationStatus": "completed"
}
```

---

### 1.2 既存テーブル確認: `AuditLog`

**目的**: モード変更操作の監査記録

**必要なフィールド確認**:
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // "SYSTEM_MODE_CHANGED"
  details   Json     // { previousMode, newMode, changedBy, timestamp }
  severity  String   // "low", "medium", "high"
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

**記録される監査ログの例**:
```json
{
  "userId": "user_abc123",
  "action": "SYSTEM_MODE_CHANGED",
  "details": {
    "previousMode": "AGENDA_MODE",
    "newMode": "PROJECT_MODE",
    "changedBy": "山田 太郎",
    "timestamp": "2025-10-21T14:30:00Z"
  },
  "severity": "high"
}
```

---

### 1.3 既存テーブル確認: `Post`

**目的**: 移行準備統計の計算（月間投稿数、委員会提出数）

**必要なフィールド確認**:
- `createdAt`: DateTime - 月間集計用
- `score`: Int - 委員会提出判定用（100点以上）

**インデックス推奨**:
```prisma
model Post {
  // ... 既存フィールド
  createdAt DateTime @default(now())
  score     Int      @default(0)

  // 推奨インデックス
  @@index([createdAt])
  @@index([score, createdAt]) // 委員会提出数クエリ高速化
}
```

---

### 1.4 既存テーブル確認: `User`

**目的**: 職員参加率の計算、権限チェック

**必要なフィールド確認**:
- `lastLoginAt`: DateTime? - アクティブユーザー判定用
- `permissionLevel`: Int - システム管理者権限チェック用（99）

**追加が必要なRelation**:
```prisma
model User {
  // ... 既存フィールド

  // 🆕 SystemConfig Relation
  systemConfigsUpdated SystemConfig[] @relation("SystemConfigUpdater")
}
```

**インデックス推奨**:
```prisma
model User {
  // ... 既存フィールド
  lastLoginAt     DateTime?
  permissionLevel Int       @default(1)

  // 推奨インデックス
  @@index([lastLoginAt])
  @@index([permissionLevel])
}
```

---

## 2. 必要なAPI一覧

### 2.1 VoiceDrive内部API（新規実装必要）

#### API-1: システムモード取得

**エンドポイント**: `GET /api/system/mode`

**目的**: 現在のシステムモードを取得

**リクエスト**:
```http
GET /api/system/mode
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "mode": "AGENDA_MODE",
  "modeLabel": "議題モード",
  "config": {
    "mode": "AGENDA_MODE",
    "enabledAt": "2025-10-21T10:00:00Z",
    "enabledBy": "user_abc123",
    "description": "議題システムモード - 委員会活性化・声を上げる文化の醸成",
    "migrationStatus": "completed"
  }
}
```

**データベース操作**:
```typescript
const config = await prisma.systemConfig.findUnique({
  where: { configKey: 'system_mode' },
});

if (!config) {
  // デフォルト値を返す
  return {
    mode: 'AGENDA_MODE',
    modeLabel: '議題モード',
    config: {
      mode: 'AGENDA_MODE',
      enabledAt: new Date(),
      enabledBy: 'system',
      description: '議題システムモード（デフォルト）',
      migrationStatus: 'completed'
    }
  };
}

return {
  mode: config.configValue.mode,
  modeLabel: config.configValue.mode === 'AGENDA_MODE' ? '議題モード' : 'プロジェクト化モード',
  config: config.configValue
};
```

**実装ファイル**: `src/app/api/system/mode/route.ts`

**実装優先度**: 🔴 **高** - ページ表示に必須

**予定工数**: 0.5日

---

#### API-2: システムモード変更

**エンドポイント**: `PUT /api/system/mode`

**目的**: システムモードを変更（レベル99専用）

**リクエスト**:
```http
PUT /api/system/mode
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "mode": "PROJECT_MODE"
}
```

**レスポンス**:
```json
{
  "success": true,
  "previousMode": "AGENDA_MODE",
  "newMode": "PROJECT_MODE",
  "updatedAt": "2025-10-21T14:30:00Z"
}
```

**データベース操作**:
```typescript
// 1. 権限チェック
if (user.permissionLevel !== 99) {
  throw new Error('システム管理者（レベル99）のみモード変更可能です');
}

// 2. 現在の設定を取得
const currentConfig = await prisma.systemConfig.findUnique({
  where: { configKey: 'system_mode' },
});

const previousMode = currentConfig?.configValue.mode || 'AGENDA_MODE';

// 3. 新しい設定値を作成
const newConfig = {
  mode: newMode,
  enabledAt: new Date(),
  enabledBy: user.id,
  description: newMode === 'AGENDA_MODE'
    ? '議題システムモード - 委員会活性化・声を上げる文化の醸成'
    : 'プロジェクト化モード - チーム編成・組織一体感の向上',
  migrationStatus: previousMode !== newMode ? 'in_progress' : 'completed'
};

// 4. 設定を保存
await prisma.systemConfig.upsert({
  where: { configKey: 'system_mode' },
  update: {
    configValue: newConfig,
    updatedBy: user.id
  },
  create: {
    configKey: 'system_mode',
    configValue: newConfig,
    category: 'system',
    description: 'システムモード設定（議題モード/プロジェクト化モード）',
    updatedBy: user.id
  }
});

// 5. 監査ログ記録
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'SYSTEM_MODE_CHANGED',
    details: {
      previousMode,
      newMode,
      changedBy: user.name,
      timestamp: new Date().toISOString()
    },
    severity: 'high'
  }
});
```

**実装ファイル**: `src/app/api/system/mode/route.ts`

**実装優先度**: 🔴 **高** - モード切り替えに必須

**予定工数**: 1日

---

#### API-3: 移行準備統計取得

**エンドポイント**: `GET /api/system/mode/migration-stats`

**目的**: プロジェクト化モードへの移行準備状況を取得

**リクエスト**:
```http
GET /api/system/mode/migration-stats
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "stats": {
    "monthlyPosts": 15,
    "committeeSubmissions": 5,
    "participationRate": 30,
    "activeUsers": 30,
    "totalUsers": 100
  },
  "readiness": {
    "isReady": false,
    "progress": 42,
    "message": "📊 移行準備が順調に進んでいます（40%以上達成）",
    "details": {
      "postsStatus": "in_progress",
      "submissionsStatus": "in_progress",
      "participationStatus": "not_started"
    }
  },
  "thresholds": {
    "monthlyPosts": 30,
    "committeeSubmissions": 10,
    "participationRate": 60
  }
}
```

**データベース操作**:
```typescript
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

// 月間投稿数
const monthlyPosts = await prisma.post.count({
  where: {
    createdAt: { gte: oneMonthAgo }
  }
});

// 委員会提出数（スコア100点以上）
const committeeSubmissions = await prisma.post.count({
  where: {
    score: { gte: 100 },
    createdAt: { gte: oneMonthAgo }
  }
});

// アクティブユーザー数
const activeUsers = await prisma.user.count({
  where: {
    lastLoginAt: { gte: oneMonthAgo }
  }
});

// 総ユーザー数
const totalUsers = await prisma.user.count();

// 参加率
const participationRate = totalUsers > 0
  ? (activeUsers / totalUsers) * 100
  : 0;

// 移行準備判定
const THRESHOLDS = {
  monthlyPosts: 30,
  committeeSubmissions: 10,
  participationRate: 60
};

const postsProgress = Math.min((monthlyPosts / THRESHOLDS.monthlyPosts) * 100, 100);
const submissionsProgress = Math.min((committeeSubmissions / THRESHOLDS.committeeSubmissions) * 100, 100);
const participationProgress = Math.min((participationRate / THRESHOLDS.participationRate) * 100, 100);

const overallProgress = Math.round(
  postsProgress * 0.4 +
  submissionsProgress * 0.3 +
  participationProgress * 0.3
);

const isReady =
  monthlyPosts >= THRESHOLDS.monthlyPosts &&
  committeeSubmissions >= THRESHOLDS.committeeSubmissions &&
  participationRate >= THRESHOLDS.participationRate;
```

**実装ファイル**: `src/app/api/system/mode/migration-stats/route.ts`

**実装優先度**: 🟠 **中** - 移行準備状況表示用

**予定工数**: 1日

---

#### API-4: モード変更履歴取得

**エンドポイント**: `GET /api/system/mode/history`

**目的**: システムモード変更履歴を取得（監査用）

**リクエスト**:
```http
GET /api/system/mode/history?limit=10
Authorization: Bearer {jwt_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 | デフォルト |
|-----------|---|------|------|----------|
| `limit` | number | ❌ | 取得件数 | 10 |

**レスポンス**:
```json
{
  "history": [
    {
      "id": "LOG-001",
      "previousMode": "AGENDA_MODE",
      "newMode": "PROJECT_MODE",
      "changedBy": {
        "id": "user_abc123",
        "name": "山田 太郎",
        "permissionLevel": 99
      },
      "changedAt": "2025-10-21T14:30:00Z"
    },
    {
      "id": "LOG-002",
      "previousMode": "PROJECT_MODE",
      "newMode": "AGENDA_MODE",
      "changedBy": {
        "id": "user_abc123",
        "name": "山田 太郎",
        "permissionLevel": 99
      },
      "changedAt": "2025-10-15T10:00:00Z"
    }
  ]
}
```

**データベース操作**:
```typescript
const logs = await prisma.auditLog.findMany({
  where: {
    action: 'SYSTEM_MODE_CHANGED'
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        permissionLevel: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: limit
});

return {
  history: logs.map(log => ({
    id: log.id,
    previousMode: log.details.previousMode,
    newMode: log.details.newMode,
    changedBy: {
      id: log.user.id,
      name: log.user.name,
      permissionLevel: log.user.permissionLevel
    },
    changedAt: log.createdAt
  }))
};
```

**実装ファイル**: `src/app/api/system/mode/history/route.ts`

**実装優先度**: 🟢 **低** - 監査用（オプション）

**予定工数**: 0.5日

---

## 3. 外部API（医療システムからの取得）

### 結論: ❌ **外部API不要**

理由:
- システムモード設定はVoiceDrive内部の動作制御
- 移行準備統計はVoiceDriveのPost/Userテーブルのみで算出可能
- 総職員数は既にUserテーブルにキャッシュ済み
- 医療システムは関与しない

---

## 4. フロントエンド実装

### 4.1 カスタムフック

#### useSystemMode

**ファイル**: `src/hooks/useSystemMode.ts`（新規作成）

```typescript
import { useState, useEffect } from 'react';
import { fetchSystemMode, updateSystemMode } from '@/services/systemModeService';

export function useSystemMode() {
  const [mode, setMode] = useState<'AGENDA_MODE' | 'PROJECT_MODE'>('AGENDA_MODE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadMode() {
      try {
        setLoading(true);
        const data = await fetchSystemMode();
        setMode(data.mode);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    loadMode();
  }, []);

  const changeMode = async (newMode: 'AGENDA_MODE' | 'PROJECT_MODE') => {
    try {
      setLoading(true);
      await updateSystemMode(newMode);
      setMode(newMode);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mode, loading, error, changeMode };
}
```

**実装優先度**: 🔴 **高**

**予定工数**: 0.5日

---

#### useMigrationStats

**ファイル**: `src/hooks/useMigrationStats.ts`（新規作成）

```typescript
import { useState, useEffect } from 'react';
import { fetchMigrationStats } from '@/services/systemModeService';

export function useMigrationStats() {
  const [stats, setStats] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchMigrationStats();
        setStats(data.stats);
        setReadiness(data.readiness);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return { stats, readiness, loading, error };
}
```

**実装優先度**: 🟠 **中**

**予定工数**: 0.5日

---

### 4.2 サービス

#### systemModeService

**ファイル**: `src/services/systemModeService.ts`（修正）

```typescript
export async function fetchSystemMode() {
  const response = await fetch('/api/system/mode');
  if (!response.ok) throw new Error('Failed to fetch system mode');
  return await response.json();
}

export async function updateSystemMode(mode: 'AGENDA_MODE' | 'PROJECT_MODE') {
  const response = await fetch('/api/system/mode', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!response.ok) throw new Error('Failed to update system mode');
  return await response.json();
}

export async function fetchMigrationStats() {
  const response = await fetch('/api/system/mode/migration-stats');
  if (!response.ok) throw new Error('Failed to fetch migration stats');
  return await response.json();
}

export async function fetchModeHistory(limit: number = 10) {
  const response = await fetch(`/api/system/mode/history?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch mode history');
  return await response.json();
}
```

**実装優先度**: 🔴 **高**

**予定工数**: 0.5日

---

### 4.3 既存コンポーネント修正

#### ModeSwitcherPage

**ファイル**: `src/pages/admin/ModeSwitcherPage.tsx`（修正）

**修正内容**:
- `systemModeManager.setMode()` → `updateSystemMode()` API呼び出しに変更
- `systemModeStatsService.getMigrationStats()` → `fetchMigrationStats()` API呼び出しに変更
- LocalStorageからの読み込みを削除
- API経由でのデータ取得に統一

**実装優先度**: 🔴 **高**

**予定工数**: 1日

---

## 5. 型定義

### 5.1 SystemMode型

**ファイル**: `src/types/systemMode.ts`（既存）

```typescript
export enum SystemMode {
  AGENDA = 'AGENDA_MODE',
  PROJECT = 'PROJECT_MODE'
}

export interface SystemModeConfig {
  mode: SystemMode;
  enabledAt: Date;
  enabledBy: string;
  description: string;
  migrationStatus?: 'planning' | 'in_progress' | 'completed';
}

export interface MigrationStats {
  monthlyPosts: number;
  committeeSubmissions: number;
  participationRate: number;
  activeUsers: number;
  totalUsers: number;
}

export interface MigrationReadiness {
  isReady: boolean;
  progress: number;
  message: string;
  details: {
    postsStatus: 'ready' | 'in_progress' | 'not_started';
    submissionsStatus: 'ready' | 'in_progress' | 'not_started';
    participationStatus: 'ready' | 'in_progress' | 'not_started';
  };
}
```

---

## 6. 実装スケジュール

### Phase 1: DB・基本API実装（2-3日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| SystemConfigテーブル追加 | `prisma/schema.prisma` | 0.5日 |
| User Relation追加 | `prisma/schema.prisma` | 0.1日 |
| AuditLog確認・修正 | `prisma/schema.prisma` | 0.2日 |
| マイグレーション実行 | - | 0.2日 |
| API-1実装（モード取得） | `src/app/api/system/mode/route.ts` | 0.5日 |
| API-2実装（モード変更） | `src/app/api/system/mode/route.ts` | 1日 |

**合計**: 2.5日

---

### Phase 2: 統計API・フロントエンド実装（2-3日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-3実装（移行準備統計） | `src/app/api/system/mode/migration-stats/route.ts` | 1日 |
| systemModeService修正 | `src/services/systemModeService.ts` | 0.5日 |
| useSystemMode実装 | `src/hooks/useSystemMode.ts` | 0.5日 |
| useMigrationStats実装 | `src/hooks/useMigrationStats.ts` | 0.5日 |
| ModeSwitcherPage修正 | `src/pages/admin/ModeSwitcherPage.tsx` | 1日 |

**合計**: 3.5日

---

### Phase 3: 履歴機能（オプション、1-2日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-4実装（モード変更履歴） | `src/app/api/system/mode/history/route.ts` | 0.5日 |
| 履歴表示UI実装 | ModeSwitcherPage内 | 0.5日 |
| テスト | 統合テスト | 0.5日 |

**合計**: 1.5日

---

### Phase 4: インデックス最適化・テスト（1日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| Postテーブルインデックス | `prisma/schema.prisma` | 0.2日 |
| Userテーブルインデックス | `prisma/schema.prisma` | 0.2日 |
| 統合テスト | 全機能テスト | 0.6日 |

**合計**: 1日

---

## 7. まとめ

### 7.1 実装必要項目

| カテゴリ | 項目数 | 優先度 | 予定工数 |
|---------|-------|--------|---------|
| **テーブル追加** | 1テーブル | 🔴 高 | 1日 |
| **API実装** | 4エンドポイント | 🔴 高 | 3日 |
| **フロントエンド** | 3コンポーネント | 🔴 高 | 2.5日 |
| **インデックス最適化** | 2テーブル | 🟡 推奨 | 0.5日 |
| **テスト** | 統合テスト | 🔴 高 | 1日 |

**総工数**: 約8日（Phase 1-2のみで6日）

---

### 7.2 医療システム連携

| 項目 | 必要性 | 理由 |
|------|-------|------|
| **新規API開発依頼** | ❌ 不要 | VoiceDrive内部で完結 |
| **DB変更依頼** | ❌ 不要 | 医療システムDB不使用 |
| **確認質問** | ❌ 不要 | VoiceDrive独自機能 |

**結論**: 医療システムチームへの連絡・依頼は**一切不要**

---

### 7.3 次のステップ

1. ✅ DB要件分析完了
2. ✅ 暫定マスターリスト作成完了
3. ⏳ schema.prisma更新 - `SystemConfig`モデル追加
4. ⏳ マイグレーション実行
5. ⏳ Phase 1: DB・基本API実装
6. ⏳ Phase 2: 統計API・フロントエンド実装
7. ⏳ Phase 3: 履歴機能実装（オプション）
8. ⏳ Phase 4: インデックス最適化・テスト

---

**文書終了**

**作成者**: VoiceDriveチーム
**承認**: 未承認（レビュー待ち）
**最終更新**: 2025年10月21日
