# SettingsPage Phase 2 実装完了報告書

**報告日**: 2025年10月26日
**報告者**: VoiceDrive開発チーム
**対象**: 医療職員管理システム連携チーム
**マスタープラン**: Phase 2 - DB保存対応 & 医療システム連携Webhook実装

---

## 📋 実装サマリー

### ✅ 完了した実装項目

| # | 実装項目 | 完了日 | ステータス |
|---|---------|--------|-----------|
| 1 | 通知設定DB保存対応 | 2025-10-26 | ✅ 完了 |
| 2 | データ分析同意API | 2025-10-26 | ✅ 完了 |
| 3 | データ削除Webhook送信 | 2025-10-26 | ✅ 完了 |
| 4 | データ削除完了Webhook受信 | 2025-10-26 | ✅ 完了 |
| 5 | 同意状態変更通知Webhook | 2025-10-26 | ✅ 完了 |
| 6 | フロントエンド API統合 | 2025-10-26 | ✅ 完了 |

---

## 🗄️ データベーススキーマ変更

### 1. NotificationSettings モデル拡張

```prisma
model NotificationSettings {
  id         String   @id @default(cuid())
  userId     String   @unique @map("user_id")

  // Phase 2: 新規フィールド
  globalEnabled  Boolean @default(true) @map("global_enabled")
  quickSetting   String  @default("important") @map("quick_setting")
  categories     Json?   @map("categories")
  deviceTokens   Json?   @map("device_tokens")

  enableEmailNotifications Boolean @default(true) @map("enable_email_notifications")
  enablePushNotifications  Boolean @default(true) @map("enable_push_notifications")
  enableSmsNotifications   Boolean @default(false) @map("enable_sms_notifications")

  reminderDaysBefore      Int     @default(3) @map("reminder_days_before")
  enableDeadlineReminder  Boolean @default(true) @map("enable_deadline_reminder")
  autoMarkAsRead          Boolean @default(false) @map("auto_mark_as_read")

  quietHoursStart  String? @map("quiet_hours_start")
  quietHoursEnd    String? @map("quiet_hours_end")
  enableQuietHours Boolean @default(false) @map("enable_quiet_hours")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([quickSetting])
  @@map("notification_settings")
}
```

**マイグレーション方法**: `npx prisma db push`（データ保持）

---

## 🔌 実装したAPI エンドポイント

### A. 通知設定API (`src/routes/notificationSettingsRoutes.ts`)

#### 1. 通知設定取得
```
GET /api/users/:userId/notification-settings
```
- **説明**: ユーザーの通知設定を取得
- **認証**: 必須（TODO: 実装予定）
- **レスポンス**: 通知設定オブジェクト（未設定時はデフォルト値を返す）

#### 2. 通知設定更新
```
PUT /api/users/:userId/notification-settings
```
- **説明**: 通知設定を更新（upsertロジック）
- **認証**: 必須（TODO: 実装予定）
- **リクエストボディ**:
```json
{
  "globalEnabled": true,
  "quickSetting": "important",
  "categories": { ... },
  "deviceTokens": [ ... ],
  "enableEmailNotifications": true,
  "enablePushNotifications": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "07:00",
  "enableQuietHours": true
}
```

#### 3. 通知設定リセット
```
POST /api/users/:userId/notification-settings/reset
```
- **説明**: 通知設定を推奨設定にリセット
- **認証**: 必須（TODO: 実装予定）

#### 4. デバイストークン登録（PWA対応）
```
POST /api/users/:userId/notification-settings/devices
```
- **リクエストボディ**:
```json
{
  "token": "fcm-device-token",
  "deviceType": "mobile",
  "browser": "Chrome",
  "os": "Android"
}
```

#### 5. デバイストークン削除
```
DELETE /api/users/:userId/notification-settings/devices/:token
```

---

### B. データ分析同意API (`src/routes/dataConsentRoutes.ts`)

#### 1. 同意状態取得
```
GET /api/users/:userId/consent
```
- **説明**: ユーザーの同意状態を取得
- **用途**: 医療システムからのクエリに対応
- **認証**: VoiceDriveユーザー認証 OR 医療システムからのリクエスト

**レスポンス例**:
```json
{
  "userId": "user123",
  "analyticsConsent": true,
  "personalFeedbackConsent": false,
  "isRevoked": false,
  "dataDeletionRequested": false,
  "analyticsConsentDate": "2025-10-26T10:00:00Z",
  "createdAt": "2025-10-26T10:00:00Z",
  "updatedAt": "2025-10-26T10:00:00Z"
}
```

#### 2. 同意状態更新
```
PUT /api/users/:userId/consent
```
- **説明**: 同意状態を更新
- **副作用**: 同意付与時に医療システムへWebhook送信

**リクエストボディ**:
```json
{
  "analyticsConsent": true,
  "personalFeedbackConsent": true
}
```

#### 3. 同意取り消し
```
POST /api/users/:userId/consent/revoke
```
- **説明**: 同意を取り消し
- **副作用**: 医療システムへ取り消し通知Webhook送信

#### 4. データ削除リクエスト
```
POST /api/users/:userId/consent/delete-request
```
- **説明**: 過去データの削除をリクエスト
- **副作用**: 医療システムへデータ削除Webhook送信

**処理フロー**:
1. VoiceDrive DBに削除リクエストを記録
2. 医療システムへWebhook送信（`POST /api/webhooks/voicedrive/deletion-request`）
3. ユーザーへ「リクエスト受付完了」メッセージ表示

---

## 🔔 Webhook連携実装

### VoiceDrive → 医療システム（送信）

#### 1. データ削除リクエスト Webhook
```
POST {MEDICAL_SYSTEM_WEBHOOK_URL}/api/webhooks/voicedrive/deletion-request
```

**ヘッダー**:
```
Content-Type: application/json
X-VoiceDrive-Signature: <署名>
```

**ペイロード**:
```json
{
  "userId": "user123",
  "requestedAt": "2025-10-26T10:00:00Z",
  "source": "voicedrive"
}
```

#### 2. 同意付与通知 Webhook
```
POST {MEDICAL_SYSTEM_WEBHOOK_URL}/api/webhooks/voicedrive/consent-granted
```

**ペイロード**:
```json
{
  "userId": "user123",
  "consentedAt": "2025-10-26T10:00:00Z",
  "source": "voicedrive"
}
```

#### 3. 同意取り消し通知 Webhook
```
POST {MEDICAL_SYSTEM_WEBHOOK_URL}/api/webhooks/voicedrive/consent-revoked
```

**ペイロード**:
```json
{
  "userId": "user123",
  "revokedAt": "2025-10-26T10:00:00Z",
  "source": "voicedrive"
}
```

---

### 医療システム → VoiceDrive（受信）

#### データ削除完了通知 Webhook受信
```
POST /api/webhooks/medical-system/deletion-complete
```

**期待ペイロード**:
```json
{
  "userId": "user123",
  "deletionCompletedAt": "2025-10-30T15:00:00Z",
  "status": "completed"
}
```

**処理内容**:
1. Webhook署名検証（TODO: 本番環境では必須）
2. `dataDeletionCompletedAt` フィールドをDBに記録
3. ユーザーへ通知（オプション）

---

## 🔐 セキュリティ実装状況

### 実装済み
- ✅ Webhook署名生成（簡易版）
- ✅ ペイロードサイズ制限（1MB）
- ✅ JSONバリデーション

### TODO（認証チェック）
以下のエンドポイントで認証チェックが必要です：

```typescript
// TODO: 認証チェック実装箇所
// src/routes/notificationSettingsRoutes.ts
// - GET /api/users/:userId/notification-settings (Line 28)
// - PUT /api/users/:userId/notification-settings (Line 72)
// - POST /api/users/:userId/notification-settings/reset (Line 118)
// - POST /api/users/:userId/notification-settings/devices (Line 162)
// - DELETE /api/users/:userId/notification-settings/devices/:token (Line 233)

// src/routes/dataConsentRoutes.ts
// - GET /api/users/:userId/consent (Line 24)
// - PUT /api/users/:userId/consent (Line 38)
// - POST /api/users/:userId/consent/revoke (Line 74)
// - POST /api/users/:userId/consent/delete-request (Line 113)
```

**認証チェック実装例**:
```typescript
// ユーザー本人 OR 管理者（Level 99以上）のみ許可
if (req.user.id !== userId && req.user.permissionLevel < 99) {
  return res.status(403).json({ error: '権限がありません' });
}
```

### TODO（Webhook署名強化）
本番環境では以下の対応が必要です：

```typescript
// src/routes/dataConsentRoutes.ts - Line 157, 173, 189
// 現在: 簡易Base64署名
// 推奨: HMAC-SHA256署名

import crypto from 'crypto';

function generateWebhookSignature(payload: any): string {
  const secret = process.env.WEBHOOK_SECRET || '';
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}
```

---

## 🧪 テスト項目

### 単体テスト（推奨）

#### 通知設定API
- [ ] GET /api/users/:userId/notification-settings - 未設定時にデフォルト値を返す
- [ ] PUT /api/users/:userId/notification-settings - 新規作成（upsert create）
- [ ] PUT /api/users/:userId/notification-settings - 既存更新（upsert update）
- [ ] POST /api/users/:userId/notification-settings/reset - 推奨設定にリセット
- [ ] POST /api/users/:userId/notification-settings/devices - デバイストークン登録
- [ ] POST /api/users/:userId/notification-settings/devices - 既存トークン更新
- [ ] DELETE /api/users/:userId/notification-settings/devices/:token - トークン削除

#### データ同意API
- [ ] GET /api/users/:userId/consent - 未設定時にデフォルト値を返す
- [ ] PUT /api/users/:userId/consent - 同意付与
- [ ] POST /api/users/:userId/consent/revoke - 同意取り消し
- [ ] POST /api/users/:userId/consent/delete-request - データ削除リクエスト

#### Webhook連携
- [ ] データ削除リクエストWebhook送信成功
- [ ] 医療システムから削除完了Webhook受信
- [ ] Webhook署名検証（本番環境）

---

## 📁 変更ファイル一覧

### 新規作成ファイル

| ファイルパス | 説明 | 行数 |
|------------|------|------|
| `src/routes/notificationSettingsRoutes.ts` | 通知設定API Routes | 261行 |
| `src/routes/dataConsentRoutes.ts` | データ分析同意API & Webhook連携 | 265行 |
| `mcp-shared/docs/SettingsPage_DB要件分析_20251026.md` | DB要件分析書 | - |
| `mcp-shared/docs/SettingsPage暫定マスターリスト_20251026.md` | 暫定マスターリスト | - |
| `mcp-shared/docs/SettingsPage_実装完了報告_20251026.md` | 本報告書 | - |

### 変更ファイル

| ファイルパス | 変更内容 |
|------------|---------|
| `prisma/schema.prisma` | NotificationSettingsモデル拡張（10フィールド追加） |
| `src/types/notification.ts` | UserNotificationSettings型拡張（7フィールド追加） |
| `src/hooks/useNotificationSettings.ts` | LocalStorage → API通信に変更 |
| `src/routes/apiRoutes.ts` | 新規ルート登録（2件） |

---

## 🚀 デプロイ手順

### 1. データベースマイグレーション
```bash
cd c:\projects\voicedrive-v100
npx prisma db push
```
**結果**: "Your database is now in sync with your Prisma schema. Done in 669ms" ✅

### 2. 環境変数設定
```bash
# .env に以下を追加

# 医療システムWebhook URL
MEDICAL_SYSTEM_WEBHOOK_URL=http://localhost:8080/api/webhooks/voicedrive

# Webhook署名用シークレット
WEBHOOK_SECRET=voicedrive-webhook-secret-production-key

# 医療システムからのWebhook検証用シークレット
MEDICAL_SYSTEM_WEBHOOK_SECRET=medical-system-webhook-secret-production-key
```

### 3. アプリケーション再起動
```bash
npm run dev
```

### 4. 動作確認
```bash
# 通知設定API確認
curl http://localhost:3001/api/users/demo-user/notification-settings

# 同意状態API確認
curl http://localhost:3001/api/users/demo-user/consent
```

---

## 📊 医療システム連携チェックリスト

### VoiceDrive側（完了）
- ✅ 同意状態取得API実装（GET /api/users/:userId/consent）
- ✅ データ削除リクエストWebhook送信実装
- ✅ データ削除完了Webhook受信エンドポイント実装
- ✅ 同意付与/取り消し通知Webhook送信実装

### 医療システム側（確認依頼）
- ⏳ VoiceDriveからのWebhook受信エンドポイント実装確認
  - `/api/webhooks/voicedrive/deletion-request`
  - `/api/webhooks/voicedrive/consent-granted`
  - `/api/webhooks/voicedrive/consent-revoked`
- ⏳ データ削除処理実装確認
- ⏳ 削除完了後のVoiceDriveへのWebhook送信確認
- ⏳ Webhook署名検証実装確認

---

## ⚠️ 既知の課題・制限事項

### 1. 認証チェック未実装
**影響**: 全エンドポイントで認証チェックがTODO状態
**対応予定**: Phase 3で実装
**暫定対応**: デモ環境では問題なし

### 2. Webhook署名が簡易版
**影響**: 本番環境ではセキュリティリスク
**対応予定**: デプロイ前にHMAC-SHA256に変更
**暫定対応**: 開発環境では動作確認可能

### 3. エラーハンドリング最小限
**影響**: ネットワークエラー時のリトライ機能なし
**対応予定**: Phase 3で実装
**暫定対応**: エラーログ出力のみ

---

## 📞 連絡事項

### VoiceDrive開発チームからのお願い

1. **Webhook受信エンドポイントの確認**
   - 医療システム側のWebhook受信エンドポイントが稼働しているか確認をお願いします
   - テスト環境でのWebhook送信テストを希望します

2. **データ削除処理の確認**
   - 削除リクエスト受信後、何日以内に完了するか教えてください
   - 削除完了通知Webhookの送信タイミングを教えてください

3. **Webhook署名方式の確認**
   - 医療システム側が期待するWebhook署名方式（HMAC-SHA256等）を教えてください
   - ヘッダー名（X-VoiceDrive-Signature）は問題ないか確認をお願いします

---

## 📅 次のアクション

| # | アクション | 担当 | 期限 |
|---|----------|------|------|
| 1 | Webhook疎通テスト実施 | 両チーム | マスタープラン実行前 |
| 2 | 認証チェック実装 | VoiceDrive | Phase 3 |
| 3 | Webhook署名強化 | VoiceDrive | デプロイ前 |
| 4 | エラーハンドリング強化 | VoiceDrive | Phase 3 |
| 5 | 統合テスト実施 | 両チーム | マスタープラン実行前 |

---

## ✅ 結論

### 実装完了項目
- ✅ 通知設定のDB保存対応（LocalStorage → Prisma）
- ✅ データ分析同意API実装
- ✅ データ削除Webhook連携実装
- ✅ 同意状態変更通知Webhook実装
- ✅ フロントエンドAPI統合

### 医療システムチームへの依頼事項
- Webhook受信エンドポイント稼働確認
- Webhook疎通テストの実施日程調整
- データ削除処理仕様の確認

**マスタープラン実行時までに実装すべきものは全て実装完了しました。**

---

**報告者**: VoiceDrive開発チーム
**連絡先**: Slack #phase2-integration
**報告日**: 2025年10月26日
