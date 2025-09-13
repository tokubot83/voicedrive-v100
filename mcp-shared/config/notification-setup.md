# MCPサーバー通知設定ガイド

## 通知チャンネル一覧

### 1. ブラウザ通知（実装済み）
```javascript
// mcp-shared/dashboard.html で自動表示
if (Notification.permission === "granted") {
  new Notification("MCPサーバー", {
    body: "新しいファイルが共有されました",
    icon: "/icon.png"
  });
}
```

### 2. Slack通知（設定手順）

#### Step 1: Slack Webhook URLを取得
1. Slackワークスペースにログイン
2. Apps → Incoming Webhooks → Add to Slack
3. チャンネル選択: #phase2-integration
4. Webhook URLをコピー

#### Step 2: MCPサーバーに設定
```bash
# .env ファイルに追加
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#phase2-integration
SLACK_NOTIFICATIONS=true
```

#### Step 3: 通知テスト
```bash
npm run mcp:test-notification
```

### 3. デスクトップ通知（Windows/Mac）

#### Windows（トースト通知）
```powershell
# PowerShellスクリプト（自動実行）
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
$notify = New-Object Windows.UI.Notifications.ToastNotification
```

#### Mac（通知センター）
```bash
# osascriptで通知
osascript -e 'display notification "新しいファイルが共有されました" with title "MCPサーバー"'
```

### 4. VS Code通知（拡張機能）

```json
// .vscode/settings.json
{
  "mcp.notifications": true,
  "mcp.notificationTypes": ["file-sync", "error", "success"]
}
```

### 5. メール通知（オプション）

```javascript
// mcp-config.js
module.exports = {
  email: {
    enabled: false,  // true に変更で有効化
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      user: "your-email@gmail.com",
      pass: "your-app-password"
    },
    recipients: [
      "medical-team@example.com",
      "voicedrive-team@example.com"
    ]
  }
};
```

## 通知の種類と表示場所

| 通知タイプ | Dashboard | Terminal | Slack | Desktop | VS Code |
|----------|-----------|----------|-------|---------|---------|
| ファイル同期 | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| エラー | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| 成功 | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| 警告 | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |

凡例: ✅実装済み ⚠️要設定 ❌未実装

## 通知のカスタマイズ

### 通知レベルの設定
```javascript
// mcp-shared/config/notifications.json
{
  "levels": {
    "info": true,      // 一般情報
    "success": true,   // 成功通知
    "warning": true,   // 警告
    "error": true      // エラー
  },
  "channels": {
    "dashboard": true,
    "terminal": true,
    "slack": false,    // true で有効化
    "desktop": false,  // true で有効化
    "email": false     // true で有効化
  },
  "filters": {
    "ignorePatterns": ["*.tmp", "*.log"],
    "importantPatterns": ["*.md", "*.json", "*.ts"]
  }
}
```

## 簡単セットアップコマンド

```bash
# 全ての通知を有効化（対話式）
npm run mcp:setup-notifications

# 出力例
? Slack通知を有効にしますか？ (Y/n) Y
? Webhook URLを入力: https://hooks.slack.com/...
? デスクトップ通知を有効にしますか？ (Y/n) Y
? メール通知を有効にしますか？ (y/N) n

✅ 通知設定完了！
- Slack: 有効 (#phase2-integration)
- Desktop: 有効
- Email: 無効
```

## トラブルシューティング

### Slack通知が来ない
```bash
# Webhook URLの確認
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"テスト通知"}' \
  YOUR_WEBHOOK_URL
```

### ブラウザ通知が出ない
```javascript
// ブラウザの権限を確認
Notification.requestPermission().then(permission => {
  console.log('通知権限:', permission);
});
```

### デスクトップ通知が出ない
```bash
# Windows: 通知設定を確認
ms-settings:notifications

# Mac: システム環境設定 → 通知
```