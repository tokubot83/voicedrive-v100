# Phase 2 顔写真統合 - 作業再開指示書

**文書番号**: VD-RESTART-PHASE2-PHOTO-2025-1021-001
**作成日**: 2025年10月21日
**対象**: VoiceDrive開発チーム
**目的**: Phase 2顔写真統合の作業を中断後に再開するための手順書

---

## 📋 現在の状況（2025年10月21日時点）

### ✅ 完了済み

- **バックエンド実装**: 100%完了
  - Prismaスキーマ拡張
  - Webhook署名検証ミドルウェア
  - Webhookハンドラー（3種類のイベント対応）
  - Webhookルート設定

- **フロントエンド実装**: 100%完了
  - PhotoAvatarコンポーネント拡張（フォールバック対応）
  - 5つのコンポーネントでPhotoAvatar適用
  - User型定義に`profilePhotoUrl`追加

- **ドキュメント**: 100%完了
  - 実装サマリー
  - 医療チームとのやり取り記録
  - 作業再開指示書（本文書）

### ⏳ 次のステップ待ち

- **環境変数設定**: 医療チームからWebhook Secret受領待ち（10/21 17:00予定）
- **統合テスト**: 11/11-11/15予定
- **本番リリース**: 11/22予定

---

## 🎯 作業再開時の手順

### Step 1: 実装状況の確認

#### 1.1 実装ファイルの確認

以下のファイルが実装済みであることを確認：

```bash
# バックエンド
✅ prisma/schema.prisma                          # profilePhotoUrl, profilePhotoUpdatedAt
✅ src/types/index.ts                            # User型定義拡張
✅ src/middleware/webhookAuth.ts                 # HMAC署名検証
✅ src/controllers/webhookController.ts          # Webhookハンドラー
✅ src/routes/apiRoutes.ts                       # Webhookルート

# フロントエンド
✅ src/components/common/PhotoAvatar.tsx         # 写真+イラストフォールバック
✅ src/components/EnhancedPost.tsx               # PhotoAvatar適用
✅ src/components/FreespacePost.tsx              # PhotoAvatar適用
✅ src/components/layout/EnhancedSidebar.tsx     # PhotoAvatar適用
✅ src/pages/ProfilePage.tsx                     # PhotoAvatar適用
✅ src/components/demo/DemoUserSwitcher.tsx      # PhotoAvatar適用

# 環境変数
✅ .env.example                                  # MEDICAL_WEBHOOK_SECRET定義
⏳ .env                                          # 秘密鍵設定（医療チームから受領後）
```

#### 1.2 実装内容の確認

```bash
# Prismaスキーマ確認
cat prisma/schema.prisma | grep -A 2 "Phase 2: 顔写真統合"

# PhotoAvatarコンポーネント確認
cat src/components/common/PhotoAvatar.tsx | head -50

# Webhookエンドポイント確認
cat src/routes/apiRoutes.ts | grep "webhooks/medical-system"
```

---

### Step 2: 環境変数の設定

#### 2.1 Webhook Secretの受領確認

医療システムチームから以下の方法でWebhook Secretを受領：

- **送信日時**: 2025年10月21日 17:00（予定）
- **送信方法**: Slack DM（暗号化）
- **送信元**: @medical-backend-lead
- **送信先**: @voicedrive-backend-lead

#### 2.2 `.env`ファイルへの設定

```bash
# .envファイルを開く
nano .env

# 以下を追加（医療チームから受け取った秘密鍵を使用）
MEDICAL_WEBHOOK_SECRET=<医療チームから受け取った64文字の秘密鍵>
```

**重要**:
- `.env`ファイルは**Gitにコミットしない**（`.gitignore`で除外済み）
- 秘密鍵は**安全に保管**（パスワードマネージャー等）

#### 2.3 動作確認

```bash
# 環境変数が正しく読み込まれるか確認
npm run dev

# ログを確認（秘密鍵未設定時は警告が出る）
# [Webhook Auth] WARNING: MEDICAL_WEBHOOK_SECRET が設定されていません。
# ↑ この警告が出なければ設定成功
```

---

### Step 3: ローカル環境での動作確認

#### 3.1 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# 別のターミナルでログ確認
tail -f logs/development.log
```

#### 3.2 Webhookエンドポイントの動作確認

**テスト用スクリプトを作成**:

```bash
# scripts/test-webhook-medical-photo.sh を作成
touch scripts/test-webhook-medical-photo.sh
chmod +x scripts/test-webhook-medical-photo.sh
```

**スクリプト内容**:
```bash
#!/bin/bash

# Webhook Secret（環境変数から取得）
SECRET=${MEDICAL_WEBHOOK_SECRET}

if [ -z "$SECRET" ]; then
  echo "Error: MEDICAL_WEBHOOK_SECRET が設定されていません"
  exit 1
fi

# タイムスタンプ生成（ミリ秒）
TIMESTAMP=$(date +%s%3N)

# ペイロード作成
PAYLOAD='{
  "eventType": "employee.created",
  "timestamp": "2025-10-21T10:00:00Z",
  "data": {
    "staffId": "TEST-001",
    "fullName": "テスト太郎",
    "email": "test001@hospital.example.com",
    "facilityId": "obara-hospital",
    "departmentId": "nursing-dept-01",
    "profilePhotoUrl": "https://medical-system.example.com/employees/TEST-001.jpg",
    "photoUpdatedAt": "2025-10-21T10:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 180000
  }
}'

# HMAC署名生成（Node.jsを使用）
SIGNATURE=$(node -e "
const crypto = require('crypto');
const timestamp = '$TIMESTAMP';
const payload = '$PAYLOAD';
const secret = '$SECRET';
const message = timestamp + payload;
const signature = crypto.createHmac('sha256', secret).update(message).digest('hex');
console.log(signature);
")

# Webhook送信
curl -X POST http://localhost:3001/api/webhooks/medical-system/employee \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -H "x-webhook-timestamp: $TIMESTAMP" \
  -d "$PAYLOAD" \
  -v

echo ""
echo "Webhook送信完了"
```

**実行**:
```bash
./scripts/test-webhook-medical-photo.sh
```

**期待される結果**:
```json
{
  "success": true
}
```
ステータスコード: 200

---

### Step 4: フロントエンドの動作確認

#### 4.1 PhotoAvatarコンポーネントの表示確認

```bash
# 開発サーバー起動中に、ブラウザで以下を確認

# 1. ホームページ（投稿一覧）
http://localhost:3001/

# 2. プロフィールページ
http://localhost:3001/profile

# 3. サイドバーのアバター表示
# 左サイドバーのユーザー情報を確認
```

#### 4.2 写真URLの手動設定テスト

**DBに直接写真URLを設定して表示確認**:

```typescript
// Prisma Studioを起動
npx prisma studio

// ブラウザで http://localhost:5555 を開く
// User テーブルを開き、任意のユーザーの以下を設定:
// profilePhotoUrl: "https://medical-system.example.com/employees/TEST-001.jpg"
// profilePhotoUpdatedAt: 2025-10-21T10:00:00Z
```

**ブラウザで確認**:
- 写真URLが存在する → 写真が表示される
- 写真URLがnull → イラストアバターが表示される

---

### Step 5: 統合テスト準備（11/11-11/15）

#### 5.1 テスト環境の準備

```bash
# テスト環境URL
http://voicedrive-test.example.com/api/webhooks/medical-system/employee
```

**医療チームに共有する情報**:
- テスト環境URL
- 受信準備完了日時（11/10まで）

#### 5.2 統合テストスケジュール

| 日時 | イベント | 期待される動作 |
|------|---------|---------------|
| 11/11 10:30 | `employee.created` | 新規職員の写真URL保存 |
| 11/11 13:00 | `employee.photo.updated` | 既存職員の写真URL更新 |
| 11/11 15:00 | `employee.photo.deleted` | 写真URLをnullに設定 |

#### 5.3 監視体制

```bash
# ログ監視
tail -f logs/production.log | grep "Webhook"

# Slack通知設定
# #phase2-photo-integration チャンネルで受信状況を報告
```

---

### Step 6: 本番デプロイ準備（11/18-11/22）

#### 6.1 本番環境URL共有（11/15まで）

```bash
# 本番環境URL
https://voicedrive.example.com/api/webhooks/medical-system/employee
```

**医療チームに共有**:
- 本番環境URL
- 受信準備完了日時

#### 6.2 本番環境デプロイ（11/18）

```bash
# 本番環境へのデプロイ
git push origin main

# 環境変数設定確認（本番サーバー）
ssh user@voicedrive-production
cat .env | grep MEDICAL_WEBHOOK_SECRET

# サーバー再起動
pm2 restart voicedrive
```

#### 6.3 一括送信受信準備（11/20 14:00）

**スケジュール**:
- 11/20 13:00: VoiceDrive側受信準備完了確認
- 11/20 14:00: 医療システム側から300件一括送信開始
  - 送信レート: 5件/秒
  - 予想所要時間: 約60秒

**監視体制**:
```bash
# ログ監視（リアルタイム）
tail -f logs/production.log | grep "Webhook"

# 受信状況カウント
tail -f logs/production.log | grep "Webhook送信成功" | wc -l
```

---

## 🔍 トラブルシューティング

### 問題1: Webhook署名検証エラー

**エラーメッセージ**:
```json
{
  "error": "Invalid signature",
  "message": "Webhook署名が不正です"
}
```

**原因**:
- Webhook Secretの設定ミス
- タイムスタンプが5分以上古い

**解決方法**:
```bash
# 1. Webhook Secretを確認
cat .env | grep MEDICAL_WEBHOOK_SECRET

# 2. 医療チームと秘密鍵が一致しているか確認
# Slack DMで医療チームに確認

# 3. タイムスタンプを現在時刻で再送信
# スクリプトを再実行
```

---

### 問題2: 写真が表示されない

**症状**:
- `profilePhotoUrl`が設定されているのに写真が表示されない

**確認事項**:
```bash
# 1. PhotoAvatarコンポーネントが使われているか確認
grep -r "PhotoAvatar" src/components/

# 2. User型にprofilePhotoUrlが含まれているか確認
cat src/types/index.ts | grep profilePhotoUrl

# 3. ブラウザのコンソールでエラー確認
# F12 → Console タブ
# [PhotoAvatar] 画像読み込み失敗: ... というエラーが出ていないか
```

**解決方法**:
- CORS設定確認（医療システム側）
- URL形式確認（https://medical-system.example.com/employees/...）

---

### 問題3: 一括送信時の負荷エラー

**症状**:
- 300件受信時にサーバーがタイムアウト

**対策**:
```bash
# 1. サーバーリソース確認
htop

# 2. Prismaコネクションプール設定
# prisma/schema.prisma の datasource db に以下を追加:
# connection_limit = 20

# 3. PM2のメモリ上限引き上げ
pm2 start ecosystem.config.js --max-memory-restart 2G
```

---

## 📚 参考資料

### 実装ファイル一覧

| ファイル | 説明 |
|---------|------|
| `prisma/schema.prisma` | profilePhotoUrl, profilePhotoUpdatedAt定義 |
| `src/middleware/webhookAuth.ts` | HMAC署名検証 |
| `src/controllers/webhookController.ts` | Webhookイベント処理 |
| `src/routes/apiRoutes.ts` | Webhookエンドポイント定義 |
| `src/components/common/PhotoAvatar.tsx` | 写真+イラストアバター |
| `src/types/index.ts` | User型定義 |

### ドキュメント一覧

| ドキュメント | ファイルパス |
|------------|------------|
| 実装サマリー | `mcp-shared/docs/phase2-photo-integration-implementation-summary-20251021.md` |
| 作業再開指示書（本文書） | `mcp-shared/docs/phase2-photo-integration-restart-instructions-20251021.md` |
| 医療チーム最終確認書 | `mcp-shared/docs/phase2-medical-final-confirmation-20251021.md` |
| VoiceDrive実装計画 | `mcp-shared/docs/phase2-voicedrive-implementation-plan-photo-integration-20251021.md` |

---

## ✅ 作業再開チェックリスト

### 環境確認

- [ ] Node.js バージョン確認（v18以上）
- [ ] npm パッケージ最新化（`npm install`）
- [ ] Prismaクライアント生成（`npx prisma generate`）
- [ ] `.env`ファイル存在確認

### 実装確認

- [ ] Prismaスキーマに`profilePhotoUrl`存在確認
- [ ] `src/middleware/webhookAuth.ts`存在確認
- [ ] `src/controllers/webhookController.ts`存在確認
- [ ] `src/components/common/PhotoAvatar.tsx`存在確認
- [ ] 5つのコンポーネントでPhotoAvatar使用確認

### 環境変数設定

- [ ] 医療チームからWebhook Secret受領
- [ ] `.env`にMEDICAL_WEBHOOK_SECRET設定
- [ ] 開発サーバー起動時に警告が出ないか確認

### 動作確認

- [ ] ローカル環境でWebhook受信テスト成功
- [ ] PhotoAvatarコンポーネントの表示確認
- [ ] 写真URL設定時に写真が表示されるか確認
- [ ] 写真URL未設定時にイラストが表示されるか確認

### 統合テスト準備

- [ ] テスト環境URL準備（11/10まで）
- [ ] 医療チームにテスト環境URL共有
- [ ] Slack `#phase2-photo-integration` 参加確認
- [ ] 11/11のテストスケジュール確認

---

## 📞 連絡先

**VoiceDriveチーム**:
- Slack: `#phase2-photo-integration`
- 担当: VoiceDriveバックエンドリーダー

**医療システムチーム**:
- Slack: `#phase2-photo-integration`
- 担当: 医療システムバックエンドリーダー

---

## 🎯 重要な期日

| 日付 | マイルストーン |
|------|--------------|
| 10/21 17:00 | Webhook Secret受領 |
| 10/24 | CloudFront/Lightsailドメイン受領 |
| 10/30 15:00 | 調整会議 |
| 11/10 | テスト環境URL共有 |
| 11/11-11/15 | 統合テスト |
| 11/15 | 本番環境URL共有 |
| 11/18 | 本番デプロイ |
| 11/20 14:00 | 一括送信（300件） |
| **11/22** | **Phase 2本番リリース完了** |

---

**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日

この指示書に従って作業を再開すれば、スムーズにPhase 2顔写真統合を完了できます。

---

**END OF DOCUMENT**
