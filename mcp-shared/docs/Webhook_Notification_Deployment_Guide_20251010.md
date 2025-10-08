# Webhook通知システム デプロイメントガイド

**作成日**: 2025年10月10日
**対象**: VoiceDrive開発チーム
**目的**: 本番環境（Vercel）へのWebhook通知システムデプロイ手順

---

## 📋 概要

このガイドでは、Webhook通知システムを本番環境（Vercel）にデプロイする手順を説明します。

### 実装済み機能

1. ✅ Webhookエンドポイント (`POST /api/webhook/analytics-notification`)
2. ✅ 通知取得API (`GET /api/webhook/notifications`)
3. ✅ 既読更新API (`PATCH /api/webhook/notifications/:id/read`)
4. ✅ 全既読更新API (`PATCH /api/webhook/notifications/read-all`)
5. ✅ WebhookNotificationテーブル（Prisma）
6. ✅ 通知管理UIコンポーネント
7. ✅ 統合テスト（15/15件 合格）

---

## 🚀 デプロイ手順

### 1. 本番データベースマイグレーション

#### SQLiteの場合（推奨しない）

開発環境で既に`prisma db push`を使用しているため、本番環境では別の方法が必要です。

#### PostgreSQL/MySQLの場合（推奨）

**Step 1: マイグレーションSQLを実行**

```bash
# 本番データベースに接続
psql $DATABASE_URL

# マイグレーションSQLを実行
\i prisma/migrations/20251010_add_webhook_notification/migration.sql
```

または、Prismaマイグレーションを使用：

```bash
# 環境変数を本番データベースに設定
export DATABASE_URL="postgresql://..."

# マイグレーションを適用
npx prisma migrate deploy
```

**注意**: `prisma migrate deploy`は本番環境で安全にマイグレーションを適用します。

---

### 2. Vercel環境変数設定

Vercelダッシュボードで以下の環境変数を設定：

```bash
# データベースURL（PostgreSQL推奨）
DATABASE_URL="postgresql://user:password@host:5432/database"

# Webhook署名検証シークレット
ANALYTICS_WEBHOOK_SECRET="webhook-notification-secret-2025"

# その他の既存環境変数
# ...
```

---

### 3. package.json ビルドスクリプト確認

`package.json`に以下のスクリプトがあることを確認：

```json
{
  "scripts": {
    "build": "vite build",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && npm run build"
  }
}
```

**`vercel-build`の説明**:
- `prisma generate`: Prisma Clientを生成
- `prisma migrate deploy`: 未適用のマイグレーションを適用
- `npm run build`: Viteビルドを実行

---

### 4. Vercelビルド設定

**vercel.json** (プロジェクトルート):

```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

### 5. デプロイ実行

```bash
# Vercel CLIでデプロイ
vercel --prod

# または、GitHubにプッシュ（自動デプロイ）
git add .
git commit -m "feat: Webhook通知システム実装"
git push origin main
```

---

## 🔧 デプロイ後の確認事項

### 1. データベーステーブル確認

```sql
-- WebhookNotificationテーブルが作成されているか確認
SELECT * FROM "WebhookNotification" LIMIT 1;

-- インデックスが作成されているか確認
\d "WebhookNotification"
```

### 2. APIエンドポイント確認

```bash
# ヘルスチェック
curl https://voicedrive.vercel.app/api/webhook/notifications

# 期待されるレスポンス:
# {
#   "success": true,
#   "data": [],
#   "unreadCount": 0,
#   "totalCount": 0
# }
```

### 3. Webhook受信テスト

```bash
# 職員カルテシステムから通知を送信
curl -X POST https://voicedrive.vercel.app/api/webhook/analytics-notification \
  -H "Content-Type: application/json" \
  -H "X-Signature: <HMAC署名>" \
  -H "X-Timestamp: 2025-10-10T10:00:00.000Z" \
  -d '{
    "notificationId": "prod-test-1",
    "timestamp": "2025-10-10T10:00:00.000Z",
    "accountLevel": 99,
    "type": "success",
    "title": "本番環境テスト",
    "message": "Webhook通知システムが正常に動作しています"
  }'
```

---

## 📊 監視とログ

### Vercelログ確認

```bash
# Vercel CLIでログを表示
vercel logs --prod --follow
```

### ログ出力内容

- `📨 Webhook通知受信:` - Webhook受信ログ
- `📢 アカウントレベル99のユーザー:` - ユーザー取得ログ
- `✅ Webhook通知レコード作成:` - DB保存成功ログ
- `⚠️ タイムスタンプが許容範囲外:` - セキュリティ警告
- `⚠️ HMAC署名が一致しません:` - セキュリティ警告

---

## 🐛 トラブルシューティング

### 問題1: マイグレーションエラー

**症状**: `Error: P3009: Drift detected`

**原因**: データベースとマイグレーション履歴が同期していない

**解決策**:
```bash
# 本番データベースを手動でマイグレーション
npx prisma migrate resolve --applied 20251010_add_webhook_notification
npx prisma migrate deploy
```

---

### 問題2: Webhook通知が保存されない

**症状**: 200 OKレスポンスだが、DBに保存されていない

**原因**: Prisma Clientが生成されていない

**解決策**:
```bash
# Prisma Clientを再生成
npx prisma generate

# Vercelで再ビルド
vercel --prod --force
```

---

### 問題3: HMAC署名検証エラー

**症状**: `401 Unauthorized - INVALID_SIGNATURE`

**原因**: 環境変数`ANALYTICS_WEBHOOK_SECRET`が設定されていない

**解決策**:
```bash
# Vercel環境変数を設定
vercel env add ANALYTICS_WEBHOOK_SECRET production
# 入力: webhook-notification-secret-2025

# 再デプロイ
vercel --prod
```

---

### 問題4: Vercelで真っ白/真っ黒の画面

**症状**: デプロイ後、画面が真っ白または真っ黒

**原因**:
1. マイグレーションが適用されていない
2. Prisma Clientが生成されていない
3. APIエラーが発生している

**解決策**:
```bash
# 1. ビルドログを確認
vercel logs --prod

# 2. Prismaマイグレーションを確認
npx prisma migrate status

# 3. 手動でマイグレーションを適用
npx prisma migrate deploy

# 4. 再デプロイ
vercel --prod --force
```

**追加チェック**:
- `package.json`の`vercel-build`スクリプトが正しいか確認
- Vercel環境変数`DATABASE_URL`が正しいか確認
- データベース接続テスト: `npx prisma db push --skip-generate`

---

## 📁 デプロイ関連ファイル

```
voicedrive-v100/
├── prisma/
│   ├── schema.prisma                                        # スキーマ定義
│   └── migrations/
│       └── 20251010_add_webhook_notification/
│           └── migration.sql                                # マイグレーションSQL
├── src/
│   ├── api/
│   │   └── routes/
│   │       └── webhook.routes.ts                            # Webhookルート
│   └── components/
│       └── notifications/
│           └── WebhookNotificationPanel.tsx                 # 通知UI
├── tests/
│   └── integration/
│       └── webhook-notification.test.ts                     # 統合テスト
├── package.json                                             # ビルドスクリプト
├── vercel.json                                              # Vercel設定
└── mcp-shared/
    └── docs/
        └── Webhook_Notification_Deployment_Guide_20251010.md  # 本ドキュメント
```

---

## ✅ デプロイ完了チェックリスト

- [ ] 本番データベースにWebhookNotificationテーブルが作成されている
- [ ] Vercel環境変数`ANALYTICS_WEBHOOK_SECRET`が設定されている
- [ ] Vercel環境変数`DATABASE_URL`が正しく設定されている
- [ ] `package.json`の`vercel-build`スクリプトが正しい
- [ ] Vercelビルドが成功している
- [ ] `/api/webhook/notifications` APIが動作している
- [ ] 職員カルテシステムからWebhook通知を受信できる
- [ ] 通知がデータベースに保存されている
- [ ] 通知UIコンポーネントが表示される
- [ ] 既読/未読管理が動作している

---

## 📞 サポート

デプロイ中に問題が発生した場合は、以下に連絡してください：

- **Slack**: `#voicedrive-analytics-integration`
- **MCPサーバー**: `mcp-shared/docs/`
- **開発チームリード**: [連絡先]

---

**VoiceDrive開発チーム**
2025年10月10日
