# admin/audit-logs 環境変数設定ガイド

**作成日**: 2025年10月27日
**対象システム**: VoiceDrive
**Phase**: 2-3実装完了後の環境設定

---

## 📋 目次

1. [概要](#概要)
2. [必須環境変数](#必須環境変数)
3. [オプション環境変数](#オプション環境変数)
4. [設定手順](#設定手順)
5. [動作確認](#動作確認)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

admin/audit-logs機能のPhase 2-3実装（セキュリティ機能 + 通知機能）で追加された環境変数の設定方法を説明します。

### 環境変数が必要な機能

- **Slack通知**: セキュリティアラート、日次サマリーをSlackに送信
- **メール通知**: 重要度が高いアラートをメールで送信
- **二重通知**: Critical severity のアラートは Slack + Email の両方で通知

---

## 必須環境変数

### 1. Slack Webhook URL

**変数名**: `MEDICAL_SYSTEM_SLACK_WEBHOOK_URL`

**説明**: 医療システムチームから提供されるSlack Incoming Webhook URL

**取得方法**:
1. 医療システムチームに依頼（担当: セキュリティ担当者）
2. Slackワークスペースの `#security-alerts` チャンネル用のWebhook URLを受領
3. `.env` ファイルに設定

**設定例**:
```bash
MEDICAL_SYSTEM_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

**通知される内容**:
- セキュリティアラート（medium以上）
- 日次監査サマリー
- アーカイブ・削除バッチの実行結果

---

### 2. セキュリティ担当メールアドレス

**変数名**: `MEDICAL_SYSTEM_SECURITY_EMAIL`

**説明**: セキュリティアラートを受信するメールアドレス（医療システムチーム提供）

**取得方法**:
1. 医療システムチームに依頼（担当: セキュリティ担当者）
2. セキュリティ専用メールアドレスを受領
3. `.env` ファイルに設定

**設定例**:
```bash
MEDICAL_SYSTEM_SECURITY_EMAIL=security-alerts@medical-system.example.com
```

**通知される内容**:
- High severity アラート
- Critical severity アラート（二重通知）
- 日次監査サマリー

---

## オプション環境変数

### 1. Critical Alert 追加受信者

**変数名**: `MEDICAL_SYSTEM_CRITICAL_ALERT_EMAILS`

**説明**: Critical severity のアラートを受信する追加のメールアドレス（カンマ区切り）

**設定例**:
```bash
MEDICAL_SYSTEM_CRITICAL_ALERT_EMAILS=cto@medical-system.com,security-lead@medical-system.com
```

**使用例**:
- CTO、セキュリティリードなど、重要インシデントの即時通知が必要な役職者

---

### 2. VoiceDrive送信元メールアドレス

**変数名**: `VOICEDRIVE_FROM_EMAIL`

**説明**: メール通知の送信元アドレス（デフォルト: `noreply@voicedrive.jp`）

**設定例**:
```bash
VOICEDRIVE_FROM_EMAIL=security@voicedrive.jp
```

---

### 3. メール送信サービス API Key

**変数名**: `SENDGRID_API_KEY` (SendGrid使用時)

**説明**: 本番環境でメール送信サービスを使用する場合のAPI Key

**設定例**:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: 開発環境では設定不要（コンソールログのみ）

---

## 設定手順

### Step 1: `.env` ファイルを開く

プロジェクトルートの `.env` ファイルを開きます。

```bash
# Windowsの場合
notepad .env

# macOS/Linuxの場合
nano .env
# または
vim .env
```

---

### Step 2: 環境変数を追加

以下の環境変数を `.env` ファイルに追加します：

```bash
# ========================================
# Audit Log Notification Settings
# Phase 2-3: Security Alerts & Daily Summary
# ========================================

# Slack Webhook URL (医療システムチームから提供)
MEDICAL_SYSTEM_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# セキュリティ担当メールアドレス (医療システムチームから提供)
MEDICAL_SYSTEM_SECURITY_EMAIL=security-alerts@medical-system.example.com

# Critical Alert 追加受信者 (オプション、カンマ区切り)
MEDICAL_SYSTEM_CRITICAL_ALERT_EMAILS=cto@medical-system.com,security-lead@medical-system.com

# VoiceDrive送信元メールアドレス (オプション)
VOICEDRIVE_FROM_EMAIL=security@voicedrive.jp

# メール送信サービス API Key (本番環境のみ、開発環境では不要)
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 3: `.env.example` を更新（チーム共有用）

チームメンバーが設定を参照できるよう、`.env.example` も更新します：

```bash
# ========================================
# Audit Log Notification Settings
# ========================================
MEDICAL_SYSTEM_SLACK_WEBHOOK_URL=
MEDICAL_SYSTEM_SECURITY_EMAIL=
MEDICAL_SYSTEM_CRITICAL_ALERT_EMAILS=
VOICEDRIVE_FROM_EMAIL=noreply@voicedrive.jp
# SENDGRID_API_KEY=
```

---

### Step 4: 開発サーバーを再起動

環境変数の変更を反映するため、開発サーバーを再起動します：

```bash
# Ctrl+C でサーバーを停止

# 再起動
npm run dev
```

---

## 動作確認

### 1. Slack接続テスト

以下のコマンドでSlack通知が正常に機能するかテストします：

```bash
# Node.js REPLを起動
node

# テストコード実行
const SlackService = require('./src/services/SlackNotificationService').default;
await SlackService.testConnection();
```

**期待される結果**:
- Slackの `#security-alerts` チャンネルにテストメッセージが表示される
- コンソールに `[SlackNotification] Test message sent successfully` と表示される

---

### 2. メール接続テスト

```bash
# Node.js REPLを起動
node

# テストコード実行
const EmailService = require('./src/services/EmailNotificationService').default;
await EmailService.testConnection();
```

**期待される結果**:
- コンソールに設定されたメールアドレスが表示される
- `[EmailNotification] Test email would be sent to: [your-email]` と表示される

---

### 3. 統合テスト

```bash
# Node.js REPLを起動
node

# 統合テスト実行
const SecurityService = require('./src/services/SecurityNotificationService').default;
await SecurityService.testAllChannels();
```

**期待される結果**:
- Slackテストメッセージ送信成功
- メール設定確認完了
- コンソールに `Test results: Slack: true, Email: true` と表示される

---

## トラブルシューティング

### 問題1: Slack通知が送信されない

**症状**:
```
[SlackNotification] MEDICAL_SYSTEM_SLACK_WEBHOOK_URL not configured
```

**解決策**:
1. `.env` ファイルに `MEDICAL_SYSTEM_SLACK_WEBHOOK_URL` が設定されているか確認
2. Webhook URLの形式が正しいか確認（`https://hooks.slack.com/services/` で始まる）
3. 開発サーバーを再起動

---

### 問題2: Webhook URLが無効

**症状**:
```
[SlackNotification] Failed to send alert: Slack API error: 404 Not Found
```

**解決策**:
1. 医療システムチームにWebhook URLの再発行を依頼
2. Slackワークスペースで `#security-alerts` チャンネルが存在するか確認
3. Webhook URLの有効期限が切れていないか確認

---

### 問題3: メール通知が設定されていない

**症状**:
```
[EmailNotification] MEDICAL_SYSTEM_SECURITY_EMAIL not configured
```

**解決策**:
1. `.env` ファイルに `MEDICAL_SYSTEM_SECURITY_EMAIL` が設定されているか確認
2. メールアドレスの形式が正しいか確認
3. 開発サーバーを再起動

---

### 問題4: 環境変数が読み込まれない

**症状**:
- 環境変数を設定したのに `undefined` になる

**解決策**:
1. `.env` ファイルがプロジェクトルートに存在するか確認
2. `.env` ファイルの文法エラーがないか確認（`=` の前後にスペース不要）
3. 開発サーバーを完全に再起動（Ctrl+C → `npm run dev`）
4. Next.jsの場合、`next.config.js` で `env` の設定が正しいか確認

---

## 補足情報

### セキュリティ考慮事項

1. **Webhook URLの機密性**
   - Webhook URLは機密情報として扱う
   - GitHubなどにコミットしない（`.gitignore` で `.env` を除外）
   - チーム内でのみ共有

2. **メールアドレスの保護**
   - セキュリティ専用メールアドレスを使用
   - 個人メールアドレスは避ける
   - メーリングリストの使用を推奨

3. **環境変数のバックアップ**
   - `.env` ファイルを安全な場所にバックアップ
   - パスワード管理ツール（1Password, LastPass等）での管理を推奨

---

### 医療システムチームへの依頼テンプレート

```markdown
件名: VoiceDrive監査ログ通知設定のご依頼

VoiceDrive開発チームです。

admin/audit-logs機能のPhase 2-3実装完了に伴い、
以下の情報をご提供いただけますでしょうか。

【依頼事項】
1. Slack Webhook URL
   - 通知先チャンネル: #security-alerts
   - 用途: セキュリティアラート、日次サマリー通知

2. セキュリティ担当メールアドレス
   - 用途: High/Critical アラート通知、日次サマリー

【任意】
3. Critical Alert 追加受信者メールアドレス
   - 用途: Critical severity インシデントの即時通知

【提供期日】
2025年10月28日まで

よろしくお願いいたします。
```

---

## 関連ドキュメント

- [admin_audit-logs_最終実装計画書_20251027.md](./admin_audit-logs_最終実装計画書_20251027.md)
- [admin_audit-logs_DB要件分析_20251027.md](./admin_audit-logs_DB要件分析_20251027.md)
- [admin_audit-logs暫定マスターリスト_20251027.md](./admin_audit-logs暫定マスターリスト_20251027.md)

---

**更新履歴**:
- 2025/10/27: 初版作成（Phase 2-3実装完了）
