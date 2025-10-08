# VoiceDrive MySQL移行ガイド

**作成日**: 2025年10月8日
**対象**: VoiceDriveチーム & 職員カルテシステムチーム
**前提条件**: MySQL 8.0環境構築完了後に実施

---

## 📋 事前準備

### 1. MySQL環境確認

```bash
# MySQLバージョン確認
mysql --version
# 期待: mysql  Ver 8.0.x

# MySQLサーバー起動確認
sudo systemctl status mysql
# 期待: active (running)
```

### 2. データベース作成

```sql
-- MySQLにログイン
mysql -u root -p

-- データベース作成
CREATE DATABASE voicedrive_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ユーザー作成
CREATE USER 'voicedrive_user'@'localhost' IDENTIFIED BY 'secure_password_here';

-- 権限付与
GRANT ALL PRIVILEGES ON voicedrive_dev.* TO 'voicedrive_user'@'localhost';
FLUSH PRIVILEGES;

-- 確認
SHOW DATABASES;
-- voicedrive_dev が表示されればOK

EXIT;
```

### 3. 環境変数確認

```bash
# .env ファイル確認
cat .env | grep DATABASE_URL

# 期待される出力:
# DATABASE_URL="mysql://voicedrive_user:secure_password_here@localhost:3306/voicedrive_dev"
```

---

## 🔄 マイグレーション実行

### Step 1: 既存SQLiteマイグレーション削除

```bash
# 既存マイグレーション履歴削除（MySQL用に再生成）
rm -rf prisma/migrations/

# SQLiteデータベース削除（バックアップ後）
cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d)
rm prisma/dev.db
rm prisma/dev.db-journal 2>/dev/null || true
```

### Step 2: Prismaマイグレーション初期化

```bash
# MySQL用マイグレーション初期化
npx prisma migrate dev --name init

# 期待される出力:
# Your database is now in sync with your schema.
# ✔ Generated Prisma Client
```

### Step 3: Prisma Client再生成

```bash
# Prisma Client生成
npx prisma generate

# 期待される出力:
# ✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Step 4: マイグレーション確認

```bash
# マイグレーション状態確認
npx prisma migrate status

# 期待される出力:
# Database schema is up to date!

# テーブル一覧確認（MySQL CLIで）
mysql -u voicedrive_user -p voicedrive_dev -e "SHOW TABLES;"

# 期待: User, Post, Notification, Interview等のテーブルが表示される
```

---

## 🧪 動作確認

### 1. 開発サーバー起動テスト

```bash
# 開発サーバー起動
npm run dev

# 期待される出力:
# ✅ 環境変数チェック完了
# 🚀 VoiceDrive API Server running on port 4000
```

### 2. ヘルスチェック

```bash
# APIヘルスチェック
curl http://localhost:4000/api/health

# 期待されるレスポンス:
# {"status":"healthy","timestamp":"..."}
```

### 3. データベース接続確認

```bash
# Prisma Studio起動（GUIでDB確認）
npx prisma studio

# ブラウザで http://localhost:5555 が開く
# テーブル一覧が表示されればOK
```

---

## 🧪 統合テスト実行

### 統合テスト実行手順

```bash
# 統合テスト実行（MySQL環境）
npm run test:integration

# 期待される結果:
# ✅ accountLevel: 230/230 成功
# ✅ analytics-api: 17/17 成功
# ✅ webhook-notification: 12/12 成功
# ✅ interview-results-sync: 8/8 成功
# ✅ medicalSystem: 15/15 成功
# ✅ espoir-tategami: 10/10 成功
#
# 合計: 292/292 成功
```

---

## ⚠️ トラブルシューティング

### エラー1: 接続エラー

```
Error: Can't reach database server at `localhost:3306`
```

**対処法**:
```bash
# MySQLサーバー起動
sudo systemctl start mysql

# ファイアウォール確認
sudo ufw allow 3306
```

### エラー2: 認証エラー

```
Error: Access denied for user 'voicedrive_user'@'localhost'
```

**対処法**:
```sql
-- MySQLにrootでログイン
mysql -u root -p

-- パスワード再設定
ALTER USER 'voicedrive_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### エラー3: 文字コードエラー

```
Error: Incorrect string value
```

**対処法**:
```sql
-- データベースの文字コード確認
SHOW CREATE DATABASE voicedrive_dev;

-- utf8mb4でない場合は再作成
DROP DATABASE voicedrive_dev;
CREATE DATABASE voicedrive_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 📊 型の違いチェックリスト

### SQLite → MySQL 型変換確認

| Prisma型 | SQLite型 | MySQL型 | 動作確認 |
|---------|---------|--------|---------|
| String | TEXT | VARCHAR/TEXT | ⬜ |
| Int | INTEGER | INT | ⬜ |
| Boolean | INTEGER (0/1) | TINYINT(1) | ⬜ |
| Decimal | REAL | DECIMAL(65,30) | ⬜ |
| DateTime | TEXT | DATETIME(3) | ⬜ |
| Json | TEXT | JSON | ⬜ |

### 確認スクリプト

```sql
-- permission_level（Decimal型）の確認
SELECT id, email, permissionLevel FROM User LIMIT 5;

-- DateTime型の確認
SELECT id, createdAt, updatedAt FROM User LIMIT 5;

-- Boolean型の確認
SELECT id, canPerformLeaderDuty, isRetired FROM User LIMIT 5;
```

---

## ✅ 完了チェックリスト

### VoiceDriveチーム

- [ ] MySQL 8.0インストール完了
- [ ] データベース`voicedrive_dev`作成完了
- [ ] .env設定完了
- [ ] マイグレーション実行完了
- [ ] 開発サーバー起動成功
- [ ] 統合テスト292件成功
- [ ] Prisma Studio動作確認

### 職員カルテシステムチーム

- [ ] MySQL 8.0インストール完了
- [ ] データベース`staff_card_dev`作成完了
- [ ] .env設定完了
- [ ] マイグレーション実行完了
- [ ] 開発サーバー起動成功
- [ ] 統合テスト成功
- [ ] Prisma Studio動作確認

### 共同確認（10/11 15:00ミーティング）

- [ ] 両システムMySQL接続確認
- [ ] 両システム統合テスト結果共有
- [ ] データベース権限確認
- [ ] Phase 2（SSO統合）準備確認

---

## 📞 サポート

### 技術的な質問

- Slack: #lightsail-integration
- メール: voicedrive-tech@example.com

### 緊急時

- 医療チームリード: @medical-lead（Slack）
- VoiceDriveチームリード: @voicedrive-lead（Slack）

---

**文書終了**

*このガイドはAWS Lightsail環境構築後に使用してください。*
