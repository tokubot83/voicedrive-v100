# SystemSettingsPage DB要件分析

**作成日**: 2025年10月26日
**対象ページ**: SystemSettingsPage (システム基盤設定ページ)
**URL**: https://voicedrive-v100.vercel.app/system-settings

---

## 📋 目次

1. [ページ概要](#ページ概要)
2. [主要機能](#主要機能)
3. [データフロー](#データフロー)
4. [データ管理責任分界点](#データ管理責任分界点)
5. [現在のDB実装状況](#現在のdb実装状況)
6. [不足項目の洗い出し](#不足項目の洗い出し)
7. [API要件](#api要件)
8. [セキュリティ要件](#セキュリティ要件)
9. [パフォーマンス要件](#パフォーマンス要件)

---

## ページ概要

### 目的
システムインフラ・基盤レイヤーの設定を管理するページ（DB、API、セキュリティ、キャッシュ、通知基盤など）

### ユーザー
- **対象**: Level 99専用（システムオペレーター）
- **権限**: すべてのシステム基盤設定の閲覧・編集
- **アクセス**: SystemOperationsPage > システム基盤設定カード

### ページ構成
```
SystemSettingsPage
├── 6つのタブ
│   ├── 一般設定（General）
│   │   ├── サイト名
│   │   ├── メンテナンスモード
│   │   ├── デフォルト言語（ja/en/zh）
│   │   └── セッションタイムアウト（分）
│   ├── セキュリティ（Security）
│   │   ├── パスワード最小文字数
│   │   ├── 特殊文字必須
│   │   ├── 2要素認証
│   │   └── 最大ログイン試行回数
│   ├── 通知設定（Notification）
│   │   ├── メール通知有効化
│   │   ├── システムアラート有効化
│   │   └── 通知保存期間（日）
│   ├── データベース（Database）
│   │   ├── 自動バックアップ有効化
│   │   ├── バックアップ間隔（時間）
│   │   ├── データ保持期間（日）
│   │   ├── データ圧縮有効化
│   │   ├── クエリタイムアウト（秒）
│   │   └── データベース操作（手動バックアップ、最適化、整合性チェック）
│   ├── API設定（API）
│   │   ├── API機能有効化
│   │   ├── レート制限（リクエスト/時）
│   │   ├── CORS有効化
│   │   ├── APIキーローテーション（日）
│   │   ├── Webhook有効化
│   │   └── API情報表示（エンドポイント、バージョン、有効期限）
│   └── 詳細設定（Advanced）
│       ├── ログレベル（debug/info/warn/error）
│       ├── キャッシュ有効化
│       ├── キャッシュ保持時間（秒）
│       ├── パフォーマンス監視
│       ├── デバッグモード
│       ├── システム情報表示
│       └── 危険な操作（全キャッシュクリア、システム再起動）
├── 変更検知（未保存警告）
└── 保存・リセットボタン
```

### 対象外機能
このページでは管理**しない**：
- ❌ 業務機能設定（面談、投票、委員会、プロジェクトなど）→ 各専用ページで管理
- ❌ 通知カテゴリ管理 → NotificationSettingsPage
- ❌ ユーザー・権限管理 → UserManagementPage

---

## 主要機能

### 1. 一般設定（General）

#### 1.1 システム名称
- **key**: `siteName`
- **type**: string
- **default**: "VoiceDrive"
- **UI**: テキスト入力

#### 1.2 メンテナンスモード
- **key**: `maintenanceMode`
- **type**: boolean
- **default**: false
- **UI**: トグルスイッチ
- **影響**: 有効時は一般ユーザーのアクセスを制限

#### 1.3 デフォルト言語
- **key**: `defaultLanguage`
- **type**: select
- **options**: ja（日本語）, en（English）, zh（中文）
- **default**: ja
- **UI**: ドロップダウン

#### 1.4 セッションタイムアウト
- **key**: `sessionTimeout`
- **type**: number
- **default**: 30（分）
- **UI**: 数値入力

### 2. セキュリティ設定（Security）

#### 2.1 パスワード最小文字数
- **key**: `passwordMinLength`
- **type**: number
- **default**: 8
- **UI**: 数値入力
- **バリデーション**: 6-20文字

#### 2.2 特殊文字必須
- **key**: `passwordRequireSpecial`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 2.3 2要素認証
- **key**: `twoFactorAuth`
- **type**: boolean
- **default**: false
- **UI**: トグルスイッチ
- **影響**: 有効時はログイン時に2FAコード要求

#### 2.4 最大ログイン試行回数
- **key**: `maxLoginAttempts`
- **type**: number
- **default**: 5
- **UI**: 数値入力
- **バリデーション**: 3-10回

### 3. 通知設定（Notification）

#### 3.1 メール通知有効化
- **key**: `emailNotifications`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 3.2 システムアラート有効化
- **key**: `systemAlerts`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 3.3 通知保存期間
- **key**: `notificationRetention`
- **type**: number
- **default**: 30（日）
- **UI**: 数値入力

### 4. データベース設定（Database）

#### 4.1 自動バックアップ有効化
- **key**: `autoBackup`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 4.2 バックアップ間隔
- **key**: `backupInterval`
- **type**: number
- **default**: 24（時間）
- **UI**: 数値入力

#### 4.3 データ保持期間
- **key**: `dataRetention`
- **type**: number
- **default**: 365（日）
- **UI**: 数値入力

#### 4.4 データ圧縮有効化
- **key**: `compressionEnabled`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 4.5 クエリタイムアウト
- **key**: `queryTimeout`
- **type**: number
- **default**: 30（秒）
- **UI**: 数値入力

#### 4.6 データベース操作ボタン
- **手動バックアップ実行**: 即座にバックアップを実行
- **最適化実行**: データベース最適化を実行
- **整合性チェック**: データ整合性チェックを実行
- **実装状況**: ❌ 未実装（ボタンのみ表示）

### 5. API設定（API）

#### 5.1 API機能有効化
- **key**: `apiEnabled`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 5.2 レート制限
- **key**: `rateLimit`
- **type**: number
- **default**: 1000（リクエスト/時）
- **UI**: 数値入力

#### 5.3 CORS有効化
- **key**: `corsEnabled`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 5.4 APIキーローテーション
- **key**: `apiKeyRotation`
- **type**: number
- **default**: 90（日）
- **UI**: 数値入力

#### 5.5 Webhook有効化
- **key**: `webhookEnabled`
- **type**: boolean
- **default**: false
- **UI**: トグルスイッチ

#### 5.6 API情報表示
- **APIエンドポイント**: https://api.voicedrive.local/v1（固定値）
- **現在のAPIバージョン**: v1.0.0（固定値）
- **APIキー有効期限**: 2025-12-31（固定値）
- **APIキー再生成ボタン**: ❌ 未実装

### 6. 詳細設定（Advanced）

#### 6.1 ログレベル
- **key**: `logLevel`
- **type**: select
- **options**: debug, info, warn, error
- **default**: info
- **UI**: ドロップダウン

#### 6.2 キャッシュ有効化
- **key**: `cacheEnabled`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 6.3 キャッシュ保持時間
- **key**: `cacheDuration`
- **type**: number
- **default**: 3600（秒）
- **UI**: 数値入力

#### 6.4 パフォーマンス監視
- **key**: `performanceMonitoring`
- **type**: boolean
- **default**: true
- **UI**: トグルスイッチ

#### 6.5 デバッグモード
- **key**: `debugMode`
- **type**: boolean
- **default**: false
- **UI**: トグルスイッチ

#### 6.6 システム情報表示
- **VoiceDriveバージョン**: v1.0.0（固定値）
- **Node.jsバージョン**: process.version（動的取得）
- **稼働時間**: 72時間 15分（固定値、要実装）
- **最終起動**: 2025-10-02 09:30:00（固定値、要実装）

#### 6.7 危険な操作
- **全キャッシュクリア**: ❌ 未実装
- **システム再起動**: ❌ 未実装

### 7. 保存・リセット機能

#### 7.1 変更検知
- **実装**: useState(hasChanges)
- **トリガー**: 任意の設定値変更時に`setHasChanges(true)`
- **UI**: 黄色警告バナー「未保存の変更があります」

#### 7.2 保存機能
- **トリガー**: 「設定を保存」ボタンクリック
- **現在の実装**: 1秒のsetTimeoutでシミュレーション
- **監査ログ**: AuditService.log() - SYSTEM_SETTINGS_UPDATED
- **実装状況**: ❌ API統合なし（メモリのみ、ページリロードでリセット）

#### 7.3 リセット機能
- **トリガー**: 「リセット」ボタンクリック
- **確認ダイアログ**: confirm()
- **実装状況**: ⚠️ 部分実装（confirmのみ、元の値への復元は未実装）

---

## データフロー

### 全体フロー

```
システムオペレーター → VoiceDrive SystemSettingsPage
  ↓
  1. 設定一覧取得（GET /api/system/settings）
  2. カテゴリ別設定表示（6タブ）
  3. 設定値変更（UI）
  4. 変更検知（hasChanges = true）
  5. 保存ボタンクリック
  ↓
VoiceDrive API
  ↓
  6. 設定保存（POST /api/system/settings）
  7. 監査ログ記録（AuditService）
  8. SystemConfigテーブル更新
  ↓
医療システムAPI（該当する場合）
  ↓
  9. セキュリティ設定同期（2FA、パスワードポリシー）
  10. 通知基盤設定同期（メール通知ON/OFF）
```

---

## データ管理責任分界点

### VoiceDrive管理データ（100%）

**理由**: SystemSettingsPageは**VoiceDriveのインフラ設定**であり、医療システムとは独立

#### 1. 一般設定
- サイト名、メンテナンスモード、デフォルト言語、セッションタイムアウト

#### 2. セキュリティ基盤設定
- パスワードポリシー（最小文字数、特殊文字必須）
- 2要素認証有効化
- ログイン試行回数制限

#### 3. 通知基盤設定
- メール通知ON/OFF
- システムアラートON/OFF
- 通知保存期間

#### 4. データベース基盤設定
- 自動バックアップ設定
- データ保持期間
- クエリタイムアウト

#### 5. API基盤設定
- API有効化、レート制限、CORS
- APIキーローテーション
- Webhook有効化

#### 6. 詳細設定
- ログレベル、キャッシュ設定
- パフォーマンス監視、デバッグモード

### 医療システム管理データ（0%）

**理由**: システム基盤設定は各システムが独立して管理

**例外**: 以下の設定は医療システムと**連携が必要**（同期ではなく通知）
- 2要素認証有効化 → 医療システムのSSO設定と連携
- パスワードポリシー → 医療システムの認証サービスに通知
- 通知基盤設定 → 医療システムからの通知送信時に参照

**連携方式**: Webhook または EventBus
- VoiceDrive側で設定変更 → 医療システムへWebhook送信
- 医療システム側で設定を参照（必要に応じて）

### データ同期不要

**理由**:
- システム基盤設定は各システムが独立して管理
- VoiceDriveと医療システムは別々のインフラを持つ
- データ重複のリスクなし

---

## 現在のDB実装状況

### VoiceDrive側テーブル

#### ✅ SystemConfig テーブル（既存、実装済み）

**実装状況**: schema.prisma 204-220行目に存在

```prisma
model SystemConfig {
  id            String   @id @default(cuid())
  configKey     String   @unique
  configValue   Json
  category      String
  description   String?
  isActive      Boolean  @default(true)
  updatedBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  updatedByUser User     @relation("SystemConfigUpdater", fields: [updatedBy], references: [id])

  @@index([configKey])
  @@index([category])
  @@index([updatedAt])
  @@map("system_configs")
}
```

**検証**:
- ✅ `configKey`: 一意キー（siteName, maintenanceMode等）
- ✅ `configValue`: JSON型（任意の値を格納可能）
- ✅ `category`: カテゴリ（general, security, notification, database, api, advanced）
- ✅ `updatedBy`: 更新者（User.idへの外部キー）
- ✅ インデックス: configKey, category, updatedAt

**現状**: テーブルは存在するが、SystemSettingsPageからの**API統合なし**

### 医療システム側テーブル

**不要**: SystemSettingsPageは医療システムと独立

---

## 不足項目の洗い出し

### 1. VoiceDrive側データベーステーブル

#### ✅ SystemConfigテーブル: 既存実装で十分

**理由**:
- 既存のSystemConfigテーブルで全ての設定を管理可能
- configValue: Json型で任意の値を格納
- category: 6つのカテゴリに対応

**追加フィールド不要**: 現在の実装で十分

### 2. API実装

#### ❌ すべて未実装

**現状**: SystemSettingsPage.tsx 269-306行目のhandleSave()は1秒のsetTimeoutでシミュレーション

**必要なAPI**:

#### API-1: GET /api/system/settings

**目的**: 全設定値を取得

**エンドポイント**: `GET /api/system/settings`

**レスポンス**:
```typescript
{
  success: true,
  settings: {
    general: {
      siteName: "VoiceDrive",
      maintenanceMode: false,
      defaultLanguage: "ja",
      sessionTimeout: 30
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      twoFactorAuth: false,
      maxLoginAttempts: 5
    },
    notification: {
      emailNotifications: true,
      systemAlerts: true,
      notificationRetention: 30
    },
    database: {
      autoBackup: true,
      backupInterval: 24,
      dataRetention: 365,
      compressionEnabled: true,
      queryTimeout: 30
    },
    api: {
      apiEnabled: true,
      rateLimit: 1000,
      corsEnabled: true,
      apiKeyRotation: 90,
      webhookEnabled: false
    },
    advanced: {
      logLevel: "info",
      cacheEnabled: true,
      cacheDuration: 3600,
      performanceMonitoring: true,
      debugMode: false
    }
  }
}
```

**実装場所**: `src/app/api/system/settings/route.ts`（新規）

---

#### API-2: POST /api/system/settings

**目的**: 設定値を一括保存

**エンドポイント**: `POST /api/system/settings`

**リクエスト**:
```typescript
{
  category: "general" | "security" | "notification" | "database" | "api" | "advanced",
  settings: {
    [key: string]: string | number | boolean
  }
}
```

**レスポンス**:
```typescript
{
  success: true,
  message: "設定を保存しました",
  updatedSettings: {
    // 更新後の設定値
  }
}
```

**実装場所**: `src/app/api/system/settings/route.ts`（新規）

**処理内容**:
1. リクエストボディから category と settings を取得
2. settings の各キーに対して SystemConfig テーブルを upsert
3. 監査ログ記録（AuditService）
4. 更新後の設定値を返却

---

#### API-3: POST /api/system/database/backup

**目的**: 手動バックアップ実行

**エンドポイント**: `POST /api/system/database/backup`

**実装優先度**: 🟡 中（データベース操作ボタン用）

---

#### API-4: POST /api/system/database/optimize

**目的**: データベース最適化実行

**エンドポイント**: `POST /api/system/database/optimize`

**実装優先度**: 🟡 中

---

#### API-5: POST /api/system/database/integrity-check

**目的**: データ整合性チェック実行

**エンドポイント**: `POST /api/system/database/integrity-check`

**実装優先度**: 🟡 中

---

#### API-6: POST /api/system/api/regenerate-key

**目的**: APIキー再生成

**エンドポイント**: `POST /api/system/api/regenerate-key`

**実装優先度**: 🟡 中

---

#### API-7: POST /api/system/cache/clear

**目的**: 全キャッシュクリア

**エンドポイント**: `POST /api/system/cache/clear`

**実装優先度**: 🟡 中（危険な操作）

---

#### API-8: POST /api/system/restart

**目的**: システム再起動

**エンドポイント**: `POST /api/system/restart`

**実装優先度**: 🟢 低（危険な操作、本番環境では慎重に）

---

### 3. 型定義

#### ✅ 既存型定義（部分実装済み）

SystemSettingsPage.tsx 29-35行目:
```typescript
interface SystemSetting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
}
```

#### ❌ 不足型定義

**必要な追加型定義**:
```typescript
// src/types/systemSettings.ts（新規）

export type SystemSettingCategory =
  | 'general'
  | 'security'
  | 'notification'
  | 'database'
  | 'api'
  | 'advanced';

export interface SystemSettingValue {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
  category: SystemSettingCategory;
  isActive: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface SystemSettingsResponse {
  success: boolean;
  settings: {
    general: Record<string, string | number | boolean>;
    security: Record<string, string | number | boolean>;
    notification: Record<string, string | number | boolean>;
    database: Record<string, string | number | boolean>;
    api: Record<string, string | number | boolean>;
    advanced: Record<string, string | number | boolean>;
  };
}

export interface SystemSettingsSaveRequest {
  category: SystemSettingCategory;
  settings: Record<string, string | number | boolean>;
}

export interface SystemSettingsSaveResponse {
  success: boolean;
  message: string;
  updatedSettings: Record<string, string | number | boolean>;
}
```

---

## API要件

### 1. GET /api/system/settings

**実装状況**: ❌ 未実装

**実装要件**:
1. SystemConfigテーブルから全設定を取得
2. category別にグループ化
3. configValueをパース（JSON → プリミティブ型）
4. レスポンス整形

**推定工数**: 0.5日（4時間）

---

### 2. POST /api/system/settings

**実装状況**: ❌ 未実装

**実装要件**:
1. リクエストボディ検証
2. settings の各キーに対して upsert:
   ```typescript
   await prisma.systemConfig.upsert({
     where: { configKey: key },
     update: {
       configValue: value,
       category,
       updatedBy: user.id,
       updatedAt: new Date()
     },
     create: {
       configKey: key,
       configValue: value,
       category,
       description: descriptions[key],
       updatedBy: user.id
     }
   });
   ```
3. 監査ログ記録
4. レスポンス返却

**推定工数**: 0.5日（4時間）

---

### 3. データベース操作API（3件）

**実装優先度**: 🟡 中

**推定工数**: 各0.5日（合計1.5日、12時間）

---

## セキュリティ要件

### 1. 認証・認可
- **認証**: JWT Bearer Token
- **認可**: Level 99（システムオペレーター）のみアクセス可能
- **実装**: usePermissions() hook

### 2. 監査ログ
- **対象操作**: 設定保存、データベース操作、APIキー再生成、キャッシュクリア、システム再起動
- **ログ内容**: userId, action, details（変更前後の値）, severity（high）
- **実装**: AuditService.log()

### 3. データ保護
- **転送中**: HTTPS（本番環境）
- **保存中**: configValue（JSON型）は暗号化なし（機密情報は含まない想定）

### 4. 危険な操作の確認
- **キャッシュクリア**: confirm()ダイアログ
- **システム再起動**: confirm()ダイアログ + 警告メッセージ

---

## パフォーマンス要件

### 1. レスポンスタイム
- **初期ローディング**: < 2秒（全設定取得）
- **設定保存**: < 3秒（upsert + 監査ログ）

### 2. キャッシュ戦略
- **設定値**: サーバーサイドキャッシュ（5分）
- **クライアント**: React state管理のみ（ページリロードで再取得）

---

## まとめ

### データ管理責任
| データ種別 | 管理者 | 医療システム役割 |
|---------|-------|---------------|
| システム基盤設定 | VoiceDrive | なし（独立） |
| セキュリティ設定 | VoiceDrive | 連携（2FA、パスワードポリシー通知） |
| 通知基盤設定 | VoiceDrive | 連携（通知ON/OFF参照） |
| データベース設定 | VoiceDrive | なし |
| API設定 | VoiceDrive | なし |
| 詳細設定 | VoiceDrive | なし |

### 実装優先度

#### 🔴 高優先度（必須）
1. ❌ **GET /api/system/settings API実装**
2. ❌ **POST /api/system/settings API実装**
3. ❌ **デモデータから実APIへ切り替え**
4. ✅ **SystemConfigテーブル確認**（既存実装で十分）

#### 🟡 中優先度（推奨）
5. ❌ **データベース操作API実装**（3件）
6. ❌ **APIキー再生成API実装**
7. ❌ **キャッシュクリアAPI実装**

#### 🟢 低優先度（オプション）
8. システム再起動API実装（本番環境では慎重に）
9. リアルタイムシステム情報取得（稼働時間、最終起動時刻）
10. 医療システムとのWebhook連携（セキュリティ設定変更通知）

---

**次のステップ**: SystemSettingsPage暫定マスターリスト作成
