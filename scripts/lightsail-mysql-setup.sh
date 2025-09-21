#!/bin/bash

# VoiceDrive - AWS Lightsail MySQL 環境構築スクリプト
# 医療職員管理システムとの共通データベース構築用
# 作成日: 2025年9月21日

set -e

# ==================================================
# 設定変数
# ==================================================
REGION="ap-northeast-1"  # 東京リージョン
DB_NAME="voicedrive-mysql-shared"
DB_BUNDLE_ID="micro_ha_2_0"  # 高可用性マイクロインスタンス（2vCPU, 1GB RAM）
DB_BLUEPRINT_ID="mysql_8_0"
MASTER_DB_NAME="voicedrive_medical_integrated"
MASTER_USERNAME="voicedrive_admin"
BACKUP_RETENTION_DAYS=7
PREFERRED_BACKUP_WINDOW="18:00-19:00"  # JST 03:00-04:00
PREFERRED_MAINTENANCE_WINDOW="sun:19:00-sun:20:00"  # JST Monday 04:00-05:00

# カラー出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==================================================
# 関数定義
# ==================================================

# ログ出力関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# パスワード生成関数
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# AWS CLI確認
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    log_info "AWS CLI found: $(aws --version)"
}

# 認証確認
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured properly."
        exit 1
    fi
    log_info "AWS credentials verified"
}

# ==================================================
# メイン処理
# ==================================================

echo "=========================================="
echo "VoiceDrive Lightsail MySQL Setup Script"
echo "=========================================="
echo ""

# 前提条件チェック
log_info "Checking prerequisites..."
check_aws_cli
check_aws_credentials

# パスワード生成
MASTER_PASSWORD=$(generate_password)
APP_PASSWORD=$(generate_password)
READONLY_PASSWORD=$(generate_password)

log_info "Generated secure passwords for database users"

# 既存のデータベース確認
log_info "Checking for existing database..."
if aws lightsail get-relational-database --relational-database-name "$DB_NAME" --region "$REGION" &> /dev/null; then
    log_warn "Database $DB_NAME already exists."
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deleting existing database..."
        aws lightsail delete-relational-database \
            --relational-database-name "$DB_NAME" \
            --region "$REGION" \
            --skip-final-snapshot \
            --no-cli-pager

        log_info "Waiting for deletion to complete..."
        sleep 60
    else
        log_info "Exiting without changes."
        exit 0
    fi
fi

# MySQL データベースインスタンス作成
log_info "Creating Lightsail MySQL instance..."
aws lightsail create-relational-database \
    --relational-database-name "$DB_NAME" \
    --relational-database-blueprint-id "$DB_BLUEPRINT_ID" \
    --relational-database-bundle-id "$DB_BUNDLE_ID" \
    --master-database-name "$MASTER_DB_NAME" \
    --master-username "$MASTER_USERNAME" \
    --master-user-password "$MASTER_PASSWORD" \
    --preferred-backup-window "$PREFERRED_BACKUP_WINDOW" \
    --preferred-maintenance-window "$PREFERRED_MAINTENANCE_WINDOW" \
    --publicly-accessible \
    --region "$REGION" \
    --tags key=Project,value=VoiceDrive key=Environment,value=Production key=System,value=Medical \
    --no-cli-pager

log_info "Database instance creation initiated"

# インスタンスが利用可能になるまで待機
log_info "Waiting for database to become available (this may take 10-15 minutes)..."
while true; do
    STATE=$(aws lightsail get-relational-database \
        --relational-database-name "$DB_NAME" \
        --region "$REGION" \
        --query 'relationalDatabase.state' \
        --output text 2>/dev/null || echo "unknown")

    if [ "$STATE" = "available" ]; then
        log_info "Database is now available!"
        break
    elif [ "$STATE" = "unknown" ] || [ "$STATE" = "error" ]; then
        log_error "Database creation failed or is in error state"
        exit 1
    else
        echo -n "."
        sleep 30
    fi
done

# エンドポイント情報取得
ENDPOINT=$(aws lightsail get-relational-database \
    --relational-database-name "$DB_NAME" \
    --region "$REGION" \
    --query 'relationalDatabase.masterEndpoint.address' \
    --output text)

PORT=$(aws lightsail get-relational-database \
    --relational-database-name "$DB_NAME" \
    --region "$REGION" \
    --query 'relationalDatabase.masterEndpoint.port' \
    --output text)

log_info "Database endpoint: $ENDPOINT:$PORT"

# 自動バックアップ有効化
log_info "Enabling automatic backups..."
aws lightsail update-relational-database \
    --relational-database-name "$DB_NAME" \
    --enable-backup-retention \
    --backup-retention-enabled \
    --region "$REGION" \
    --no-cli-pager

# パラメータ更新（パフォーマンス最適化）
log_info "Updating database parameters for optimal performance..."
aws lightsail update-relational-database-parameters \
    --relational-database-name "$DB_NAME" \
    --region "$REGION" \
    --parameters \
        parameterName=max_connections,parameterValue=200,applyMethod=immediate \
        parameterName=innodb_buffer_pool_size,parameterValue=536870912,applyMethod=pending-reboot \
        parameterName=character_set_server,parameterValue=utf8mb4,applyMethod=immediate \
        parameterName=collation_server,parameterValue=utf8mb4_unicode_ci,applyMethod=immediate \
    --no-cli-pager

# 環境変数ファイル作成
log_info "Creating environment configuration file..."
cat > .env.mysql <<EOF
# VoiceDrive MySQL Database Configuration
# Generated: $(date)
# WARNING: This file contains sensitive information. Keep it secure!

# Master Database Connection
MYSQL_HOST=$ENDPOINT
MYSQL_PORT=$PORT
MYSQL_DATABASE=$MASTER_DB_NAME
MYSQL_MASTER_USER=$MASTER_USERNAME
MYSQL_MASTER_PASSWORD=$MASTER_PASSWORD

# Application User (for VoiceDrive)
MYSQL_APP_USER=voicedrive_app
MYSQL_APP_PASSWORD=$APP_PASSWORD

# Read-Only User (for reporting)
MYSQL_READONLY_USER=voicedrive_readonly
MYSQL_READONLY_PASSWORD=$READONLY_PASSWORD

# Prisma Database URL
DATABASE_URL="mysql://$MASTER_USERNAME:$MASTER_PASSWORD@$ENDPOINT:$PORT/$MASTER_DB_NAME"
DATABASE_URL_APP="mysql://voicedrive_app:$APP_PASSWORD@$ENDPOINT:$PORT/$MASTER_DB_NAME"

# Connection Pool Settings
DB_CONNECTION_LIMIT=50
DB_ACQUIRE_TIMEOUT=30000
DB_TIMEOUT=30000
EOF

# SQL初期化スクリプト作成
log_info "Creating database initialization SQL script..."
cat > init-database.sql <<EOF
-- VoiceDrive MySQL 初期化スクリプト
-- 医療職員管理システムとの共通データベース

-- データベース文字セット設定
ALTER DATABASE $MASTER_DB_NAME
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- アプリケーションユーザー作成
CREATE USER IF NOT EXISTS 'voicedrive_app'@'%'
    IDENTIFIED BY '$APP_PASSWORD';

-- 読み取り専用ユーザー作成
CREATE USER IF NOT EXISTS 'voicedrive_readonly'@'%'
    IDENTIFIED BY '$READONLY_PASSWORD';

-- アプリケーションユーザー権限付与
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER,
      CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW,
      SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, EVENT, TRIGGER
    ON $MASTER_DB_NAME.*
    TO 'voicedrive_app'@'%';

-- 読み取り専用ユーザー権限付与
GRANT SELECT, SHOW VIEW
    ON $MASTER_DB_NAME.*
    TO 'voicedrive_readonly'@'%';

-- 権限を即座に反映
FLUSH PRIVILEGES;

-- パフォーマンス設定
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_buffer_pool_size = 536870912;
SET GLOBAL query_cache_size = 67108864;
SET GLOBAL query_cache_type = 1;
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 2;

-- タイムゾーン設定（日本時間）
SET GLOBAL time_zone = '+09:00';

-- 初期スキーマ情報テーブル
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) NOT NULL PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初期バージョン記録
INSERT INTO schema_migrations (version, description)
VALUES ('001_initial_setup', 'Initial VoiceDrive database setup for medical staff management system integration');

-- システム設定テーブル
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) NOT NULL PRIMARY KEY,
    config_value TEXT,
    config_type VARCHAR(50),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初期設定値
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('database_version', '1.0.0', 'version', 'Database schema version'),
('voicedrive_integration', 'enabled', 'feature', 'VoiceDrive system integration status'),
('medical_system_integration', 'pending', 'feature', 'Medical staff management system integration status'),
('data_retention_days', '2555', 'setting', 'Data retention period in days (7 years)'),
('backup_enabled', 'true', 'setting', 'Automatic backup status');

SELECT 'Database initialization completed successfully!' as message;
EOF

# Prisma設定スクリプト作成
log_info "Creating Prisma migration script..."
cat > migrate-to-mysql.sh <<EOF
#!/bin/bash

# Prisma MySQL Migration Script

echo "Starting Prisma MySQL migration..."

# 環境変数読み込み
source .env.mysql

# Prismaスキーマをコピー
cp prisma/schema.mysql.prisma prisma/schema.prisma

# Prismaクライアント再生成
npx prisma generate

# データベースリセット（開発環境のみ）
if [ "\$NODE_ENV" != "production" ]; then
    npx prisma migrate reset --force
fi

# マイグレーション実行
npx prisma migrate deploy

# シード実行（必要に応じて）
# npx prisma db seed

echo "Migration completed!"
EOF

chmod +x migrate-to-mysql.sh

# 接続テストスクリプト作成
log_info "Creating connection test script..."
cat > test-connection.js <<EOF
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.mysql' });

async function testConnection() {
    console.log('Testing MySQL connection...');

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_MASTER_USER,
            password: process.env.MYSQL_MASTER_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log('✅ Connection successful!');
        console.log('MySQL Version:', rows[0].version);

        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return false;
    }
}

testConnection();
EOF

# 完了メッセージ
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Lightsail MySQL setup completed!${NC}"
echo "=========================================="
echo ""
echo "Database Information:"
echo "  Name: $DB_NAME"
echo "  Endpoint: $ENDPOINT"
echo "  Port: $PORT"
echo "  Master Database: $MASTER_DB_NAME"
echo ""
echo "Created Files:"
echo "  - .env.mysql (environment variables)"
echo "  - init-database.sql (database initialization)"
echo "  - migrate-to-mysql.sh (Prisma migration script)"
echo "  - test-connection.js (connection test)"
echo ""
echo "Next Steps:"
echo "  1. Test connection: node test-connection.js"
echo "  2. Initialize database: mysql -h $ENDPOINT -u $MASTER_USERNAME -p < init-database.sql"
echo "  3. Run Prisma migration: ./migrate-to-mysql.sh"
echo ""
echo -e "${YELLOW}⚠️  Important: Keep the .env.mysql file secure!${NC}"
echo ""

# オプション：接続情報をクリップボードにコピー（Windowsの場合）
if command -v clip &> /dev/null; then
    echo "DATABASE_URL=\"mysql://$MASTER_USERNAME:$MASTER_PASSWORD@$ENDPOINT:$PORT/$MASTER_DB_NAME\"" | clip
    echo "📋 Database URL copied to clipboard"
fi