# SystemSettingsPage 暫定マスターリスト

**作成日**: 2025年10月26日
**対象ページ**: SystemSettingsPage (システム基盤設定ページ)
**URL**: https://voicedrive-v100.vercel.app/SystemSettingsPage
**アクセスレベル**: Level 99 (System Operator) 専用

---

## 📋 目次

1. [設定データ項目カタログ（27項目）](#設定データ項目カタログ27項目)
2. [API定義（8エンドポイント）](#api定義8エンドポイント)
3. [UI状態管理項目](#ui状態管理項目)
4. [データベーステーブル](#データベーステーブル)
5. [実装優先度](#実装優先度)

---

## 設定データ項目カタログ（27項目）

### 1. 一般設定（General Settings）- 4項目

| # | 設定キー | データ型 | デフォルト値 | 説明 | category | 必須 |
|---|---------|---------|------------|------|----------|-----|
| 1 | `siteName` | string | "VoiceDrive" | システム名称 | general | ✅ |
| 2 | `maintenanceMode` | boolean | false | メンテナンスモード | general | ✅ |
| 3 | `defaultLanguage` | select | "ja" | デフォルト言語 (ja/en/zh) | general | ✅ |
| 4 | `sessionTimeout` | number | 30 | セッションタイムアウト（分） | general | ✅ |

### 2. セキュリティ設定（Security Settings）- 5項目

| # | 設定キー | データ型 | デフォルト値 | 説明 | category | 必須 |
|---|---------|---------|------------|------|----------|-----|
| 5 | `passwordMinLength` | number | 8 | パスワード最小文字数 | security | ✅ |
| 6 | `passwordRequireNumbers` | boolean | true | 数字必須 | security | ✅ |
| 7 | `passwordRequireSymbols` | boolean | true | 記号必須 | security | ✅ |
| 8 | `twoFactorAuth` | boolean | false | 2要素認証有効化 | security | ✅ |
| 9 | `maxLoginAttempts` | number | 5 | ログイン試行回数上限 | security | ✅ |

### 3. 通知設定（Notification Settings）- 3項目

| # | 設定キー | データ型 | デフォルト値 | 説明 | category | 必須 |
|---|---------|---------|------------|------|----------|-----|
| 10 | `emailNotifications` | boolean | true | メール通知 | notification | ✅ |
| 11 | `systemNotifications` | boolean | true | システム通知 | notification | ✅ |
| 12 | `notificationFrequency` | select | "realtime" | 通知頻度 (realtime/hourly/daily) | notification | ✅ |

### 4. データベース設定（Database Settings）- 5項目

| # | 設定キー | データ型 | デフォルト値 | 説明 | category | 必須 |
|---|---------|---------|------------|------|----------|-----|
| 13 | `autoBackup` | boolean | true | 自動バックアップ | database | ✅ |
| 14 | `backupFrequency` | select | "daily" | バックアップ頻度 (daily/weekly/monthly) | database | ✅ |
| 15 | `backupRetentionDays` | number | 30 | バックアップ保持日数 | database | ✅ |
| 16 | `dataRetentionDays` | number | 365 | データ保持日数 | database | ✅ |
| 17 | `compressionEnabled` | boolean | true | データ圧縮有効化 | database | ✅ |

### 5. API設定（API Settings）- 5項目

| # | 設定キー | データ型 | デフォルト値 | 説明 | category | 必須 |
|---|---------|---------|------------|------|----------|-----|
| 18 | `apiEnabled` | boolean | true | API有効化 | api | ✅ |
| 19 | `apiRateLimit` | number | 100 | APIレート制限（リクエスト/分） | api | ✅ |
| 20 | `apiKeyRotationDays` | number | 90 | APIキー更新間隔（日） | api | ✅ |
| 21 | `apiLogging` | boolean | true | APIログ記録 | api | ✅ |
| 22 | `corsEnabled` | boolean | false | CORS有効化 | api | ✅ |

### 6. 詳細設定（Advanced Settings）- 5項目

| # | 設定キー | データ型 | デフォルト値 | 説明 | category | 必須 |
|---|---------|---------|------------|------|----------|-----|
| 23 | `logLevel` | select | "info" | ログレベル (error/warn/info/debug) | advanced | ✅ |
| 24 | `cacheEnabled` | boolean | true | キャッシュ有効化 | advanced | ✅ |
| 25 | `cacheTTL` | number | 3600 | キャッシュTTL（秒） | advanced | ✅ |
| 26 | `debugMode` | boolean | false | デバッグモード | advanced | ✅ |
| 27 | `performanceMonitoring` | boolean | true | パフォーマンス監視 | advanced | ✅ |

---

## API定義（8エンドポイント）

### Phase 1: 設定管理API（必須実装）

#### 1. GET /api/system/settings - システム設定取得

**説明**: すべてのシステム設定を取得

**リクエスト**:
```typescript
// クエリパラメータ
{
  category?: string; // 特定カテゴリのみ取得 (general/security/notification/database/api/advanced)
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  data: {
    general: Record<string, SystemSetting>;
    security: Record<string, SystemSetting>;
    notification: Record<string, SystemSetting>;
    database: Record<string, SystemSetting>;
    api: Record<string, SystemSetting>;
    advanced: Record<string, SystemSetting>;
  };
  metadata: {
    lastUpdated: string; // ISO 8601
    updatedBy: string;   // User ID
    version: number;     // 設定バージョン
  };
}

interface SystemSetting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
  updatedAt: string;
}
```

**実装優先度**: 🔴 Phase 1 - 必須（ページ初期表示に必要）

---

#### 2. POST /api/system/settings - システム設定更新

**説明**: システム設定を一括更新

**リクエスト**:
```typescript
{
  settings: {
    [category: string]: {
      [key: string]: string | number | boolean;
    };
  };
  userId: string; // 更新者ID（監査ログ用）
}

// 例:
{
  "settings": {
    "general": {
      "siteName": "VoiceDrive Production",
      "maintenanceMode": false
    },
    "security": {
      "twoFactorAuth": true,
      "maxLoginAttempts": 3
    }
  },
  "userId": "user123"
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    updatedCount: number;
    updatedSettings: string[]; // 更新されたキーのリスト
    timestamp: string;
  };
  errors?: {
    key: string;
    error: string;
  }[];
}
```

**実装優先度**: 🔴 Phase 1 - 必須（設定保存に必要）

---

### Phase 2: データベース操作API

#### 3. POST /api/system/database/backup - データベースバックアップ

**説明**: 手動でデータベースバックアップを実行

**リクエスト**:
```typescript
{
  userId: string; // 実行者ID
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    backupId: string;
    fileName: string;
    size: number; // バイト
    timestamp: string;
    status: 'completed' | 'failed';
  };
}
```

**実装優先度**: 🟡 Phase 2（0.5日）

---

#### 4. POST /api/system/database/restore - データベース復元

**説明**: バックアップからデータベースを復元

**リクエスト**:
```typescript
{
  backupId: string;
  userId: string; // 実行者ID
  confirmationToken: string; // 安全性のための確認トークン
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    restoreId: string;
    backupId: string;
    timestamp: string;
    status: 'completed' | 'failed';
    recordsRestored: number;
  };
}
```

**実装優先度**: 🟡 Phase 2（0.5日）

---

#### 5. POST /api/system/database/optimize - データベース最適化

**説明**: データベースを最適化（インデックス再構築、不要データ削除）

**リクエスト**:
```typescript
{
  userId: string; // 実行者ID
  operations: string[]; // ['reindex', 'vacuum', 'analyze']
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    optimizationId: string;
    operations: {
      operation: string;
      status: 'completed' | 'failed';
      duration: number; // ミリ秒
    }[];
    timestamp: string;
  };
}
```

**実装優先度**: 🟡 Phase 2（0.5日）

---

### Phase 3: その他のシステム操作API

#### 6. POST /api/system/api/regenerate-key - APIキー再生成

**説明**: システムAPIキーを再生成

**リクエスト**:
```typescript
{
  userId: string; // 実行者ID
  reason: string; // 再生成理由
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    newApiKey: string;
    expiresAt: string;
    generatedAt: string;
  };
}
```

**実装優先度**: 🟢 Phase 3（0.5日）

---

#### 7. POST /api/system/cache/clear - キャッシュクリア

**説明**: システムキャッシュをクリア

**リクエスト**:
```typescript
{
  userId: string; // 実行者ID
  cacheTypes: string[]; // ['redis', 'memory', 'cdn']
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    clearedCaches: string[];
    timestamp: string;
  };
}
```

**実装優先度**: 🟢 Phase 3（0.5日）

---

#### 8. POST /api/system/logs/export - ログエクスポート

**説明**: システムログをエクスポート

**リクエスト**:
```typescript
{
  userId: string; // 実行者ID
  logTypes: string[]; // ['audit', 'error', 'access', 'performance']
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  format: 'json' | 'csv';
}
```

**レスポンス**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    exportId: string;
    fileName: string;
    downloadUrl: string;
    size: number; // バイト
    recordCount: number;
    expiresAt: string; // ダウンロードリンク有効期限
  };
}
```

**実装優先度**: 🟢 Phase 3（0.5日）

---

## UI状態管理項目

### React State（SystemSettingsPage.tsx）

| 状態変数 | 型 | デフォルト値 | 説明 |
|---------|---|------------|------|
| `generalSettings` | `Record<string, SystemSetting>` | 4項目オブジェクト | 一般設定（useState） |
| `securitySettings` | `Record<string, SystemSetting>` | 5項目オブジェクト | セキュリティ設定（useState） |
| `notificationSettings` | `Record<string, SystemSetting>` | 3項目オブジェクト | 通知設定（useState） |
| `databaseSettings` | `Record<string, SystemSetting>` | 5項目オブジェクト | データベース設定（useState） |
| `apiSettings` | `Record<string, SystemSetting>` | 5項目オブジェクト | API設定（useState） |
| `advancedSettings` | `Record<string, SystemSetting>` | 5項目オブジェクト | 詳細設定（useState） |
| `activeTab` | `string` | "general" | アクティブタブ |
| `hasChanges` | `boolean` | false | 未保存変更フラグ |
| `saveStatus` | `'idle' \| 'saving' \| 'saved'` | 'idle' | 保存状態 |
| `showConfirmDialog` | `boolean` | false | 確認ダイアログ表示フラグ |
| `pendingAction` | `(() => void) \| null` | null | 保留中のアクション |
| `dbBackupStatus` | `'idle' \| 'running' \| 'completed'` | 'idle' | バックアップ状態 |
| `dbOptimizeStatus` | `'idle' \| 'running' \| 'completed'` | 'idle' | 最適化状態 |
| `dbRestoreStatus` | `'idle' \| 'running' \| 'completed'` | 'idle' | 復元状態 |

### Context（useAuth, usePermissions）

| 変数 | 型 | 説明 |
|-----|---|------|
| `user` | `User \| null` | 現在のユーザー（useAuth） |
| `hasPermission` | `(permission: string) => boolean` | 権限チェック関数 |

---

## データベーステーブル

### SystemConfig（既存テーブル - 変更不要）

**テーブル名**: `system_configs`

**フィールド**:

| カラム | 型 | 制約 | 説明 |
|-------|---|------|------|
| `id` | String | PRIMARY KEY, @default(cuid()) | 一意識別子 |
| `configKey` | String | UNIQUE, @index | 設定キー（例: "siteName", "passwordMinLength"） |
| `configValue` | Json | NOT NULL | 設定値（JSON形式） |
| `category` | String | @index | カテゴリ（general/security/notification/database/api/advanced） |
| `description` | String | NULL許可 | 設定の説明 |
| `isActive` | Boolean | @default(true) | 有効/無効フラグ |
| `updatedBy` | String | FOREIGN KEY → User.id | 更新者ID |
| `createdAt` | DateTime | @default(now()) | 作成日時 |
| `updatedAt` | DateTime | @updatedAt | 更新日時 |

**リレーション**:
- `updatedByUser`: User @relation("SystemConfigUpdater")

**インデックス**:
- `configKey`（一意検索用）
- `category`（カテゴリ別検索用）
- `updatedAt`（時系列検索用）

**データ例**:
```json
{
  "id": "clx1234567890",
  "configKey": "siteName",
  "configValue": "VoiceDrive",
  "category": "general",
  "description": "システム名称",
  "isActive": true,
  "updatedBy": "user123",
  "createdAt": "2025-10-26T00:00:00Z",
  "updatedAt": "2025-10-26T00:00:00Z"
}
```

**判定結果**: ✅ 既存テーブルで十分対応可能（schema.prisma更新不要）

---

## 実装優先度

### Phase 1 - 必須実装（2日）

**目的**: SystemSettingsPageの基本機能を動作させる

| # | API | 工数 | 説明 |
|---|-----|------|------|
| 1 | GET /api/system/settings | 0.5日 | 設定取得（ページ初期表示） |
| 2 | POST /api/system/settings | 0.5日 | 設定更新（保存機能） |
| 3 | Prisma操作実装 | 0.5日 | SystemConfig CRUD操作 |
| 4 | 監査ログ統合 | 0.5日 | AuditService連携 |

**完了条件**:
- ✅ 設定の読み込み・表示が可能
- ✅ 設定の保存が永続化される
- ✅ ページリロード後も設定が保持される
- ✅ 監査ログに変更履歴が記録される

---

### Phase 2 - データベース操作（1.5日）

**目的**: データベース管理機能を実装

| # | API | 工数 | 説明 |
|---|-----|------|------|
| 3 | POST /api/system/database/backup | 0.5日 | バックアップ実行 |
| 4 | POST /api/system/database/restore | 0.5日 | バックアップ復元 |
| 5 | POST /api/system/database/optimize | 0.5日 | DB最適化 |

**完了条件**:
- ✅ 手動バックアップ実行可能
- ✅ バックアップからの復元可能
- ✅ データベース最適化実行可能

---

### Phase 3 - その他システム操作（1.5日）

**目的**: システム管理機能を完成

| # | API | 工数 | 説明 |
|---|-----|------|------|
| 6 | POST /api/system/api/regenerate-key | 0.5日 | APIキー再生成 |
| 7 | POST /api/system/cache/clear | 0.5日 | キャッシュクリア |
| 8 | POST /api/system/logs/export | 0.5日 | ログエクスポート |

**完了条件**:
- ✅ APIキー再生成機能動作
- ✅ キャッシュクリア機能動作
- ✅ ログエクスポート機能動作

---

## 総工数見積もり

| Phase | 工数 | 期間（1人） |
|-------|------|------------|
| Phase 1 - 必須実装 | 2日 | 2日 |
| Phase 2 - DB操作 | 1.5日 | 1.5日 |
| Phase 3 - その他操作 | 1.5日 | 1.5日 |
| **合計** | **5日** | **5日** |

**注**: 並行作業可能な場合、Phase 2とPhase 3は同時進行で3.5日で完了可能

---

## データ管理責任分界点

### VoiceDrive管理データ（100%）

**理由**: SystemSettingsPageは**VoiceDriveのインフラ設定**であり、医療システムとは独立

- ✅ 一般設定（サイト名、メンテナンスモード、言語、セッション）
- ✅ セキュリティ基盤設定（パスワードポリシー、2FA、ログイン制限）
- ✅ 通知基盤設定（メール/システム通知のON/OFF）
- ✅ データベース基盤設定（バックアップ、保持期間、圧縮）
- ✅ API基盤設定（有効化、レート制限、CORS）
- ✅ 詳細設定（ログレベル、キャッシュ、デバッグモード）

### 医療システム管理データ（0%）

**理由**: システム基盤設定は各システムが独立して管理

**例外**: 以下の設定は医療システムと**連携が必要**（同期ではなく通知）

1. **2要素認証有効化** (`twoFactorAuth`)
   - VoiceDriveで有効化した場合、医療システムのSSO設定にWebhook通知
   - 医療システム側でも2FA設定を調整する必要がある

2. **パスワードポリシー** (`passwordMinLength`, `passwordRequireNumbers`, `passwordRequireSymbols`)
   - VoiceDriveのパスワードポリシーが変更された場合、医療システムの認証サービスにWebhook通知
   - 医療システム側でパスワード検証ルールを同期

3. **通知基盤設定** (`emailNotifications`, `systemNotifications`)
   - VoiceDriveの通知設定が変更された場合、医療システムからの通知送信時に参照
   - 医療システム側で通知送信前にVoiceDriveの設定を確認

**連携方法**:
```typescript
// 医療システムへのWebhook通知（オプション）
POST https://medical-system.example.com/api/webhooks/voicedrive/settings-changed
{
  "event": "settings.updated",
  "category": "security",
  "changes": {
    "twoFactorAuth": true,
    "passwordMinLength": 12
  },
  "timestamp": "2025-10-26T00:00:00Z"
}
```

---

## 不足項目一覧

### ❌ 未実装API（8エンドポイント）

| # | API | ステータス | 優先度 |
|---|-----|----------|--------|
| 1 | GET /api/system/settings | ❌ 未実装 | 🔴 Phase 1 |
| 2 | POST /api/system/settings | ❌ 未実装 | 🔴 Phase 1 |
| 3 | POST /api/system/database/backup | ❌ 未実装 | 🟡 Phase 2 |
| 4 | POST /api/system/database/restore | ❌ 未実装 | 🟡 Phase 2 |
| 5 | POST /api/system/database/optimize | ❌ 未実装 | 🟡 Phase 2 |
| 6 | POST /api/system/api/regenerate-key | ❌ 未実装 | 🟢 Phase 3 |
| 7 | POST /api/system/cache/clear | ❌ 未実装 | 🟢 Phase 3 |
| 8 | POST /api/system/logs/export | ❌ 未実装 | 🟢 Phase 3 |

### ✅ データベーステーブル

| テーブル | ステータス | 備考 |
|---------|----------|------|
| SystemConfig | ✅ 実装済み | schema.prisma:204-220（変更不要） |

### ⚠️ 現在の問題点

1. **データ永続化なし**
   - 設定変更がReact useStateのみで管理
   - ページリロードで全変更が失われる

2. **handleSave()がシミュレーション**
   - 1秒のsetTimeoutで保存完了を模擬
   - 実際のAPI呼び出しなし

3. **監査ログが未永続化**
   - AuditService.log()呼び出しはあるが、保存先不明

---

## 次のアクション

### VoiceDriveチーム（実装作業）

**Phase 1 - 必須実装（2日）**:
1. 🔴 GET /api/system/settings API実装
2. 🔴 POST /api/system/settings API実装
3. 🔴 Prisma CRUD操作実装
4. 🔴 監査ログ永続化実装

**Phase 2 - DB操作（1.5日）**:
5. 🟡 データベースバックアップAPI実装
6. 🟡 データベース復元API実装
7. 🟡 データベース最適化API実装

**Phase 3 - その他操作（1.5日）**:
8. 🟢 APIキー再生成API実装
9. 🟢 キャッシュクリアAPI実装
10. 🟢 ログエクスポートAPI実装

### 医療システムチーム（確認のみ）

**情報共有**:
- ✅ SystemSettingsPageはVoiceDrive独立管理
- ✅ 医療システム側の実装作業は**不要**
- ℹ️ オプション: Webhook通知受信（2FA、パスワードポリシー変更時）

---

**END OF MASTER LIST**
