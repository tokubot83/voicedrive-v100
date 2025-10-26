#!/bin/bash

# ==================== ステージング環境切り替えスクリプト ====================
# 作成日: 2025-10-26
# 用途: 10/28キックオフMTG後、ステージング環境に切り替える際に使用

echo "=================================================="
echo "  VoiceDrive Phase 2.5 ステージング環境切り替え"
echo "=================================================="
echo ""

# 現在の環境確認
echo "📋 現在の環境設定を確認中..."
if grep -q "MEDICAL_SYSTEM_API_URL=http://localhost:8888" .env; then
  echo "✅ 現在: ローカルモックサーバー環境"
else
  echo "⚠️  現在: 不明な環境"
fi
echo ""

# バックアップ作成
echo "💾 .envファイルをバックアップ中..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ バックアップ完了: .env.backup.$(date +%Y%m%d_%H%M%S)"
echo ""

# ステージング環境変数の入力
echo "🔑 ステージング環境の情報を入力してください"
echo "（10/28キックオフMTGで確認した内容を入力）"
echo ""

read -p "ステージングAPIベースURL (例: https://staging-medical.example.com): " STAGING_URL
read -p "ステージングAPIキー: " STAGING_API_KEY
read -p "Webhook署名シークレット: " STAGING_WEBHOOK_SECRET

echo ""
echo "📝 入力内容の確認:"
echo "  URL: $STAGING_URL"
echo "  APIキー: ${STAGING_API_KEY:0:10}... (一部表示)"
echo "  Webhookシークレット: ${STAGING_WEBHOOK_SECRET:0:10}... (一部表示)"
echo ""

read -p "この内容でステージング環境に切り替えますか？ (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ 切り替えをキャンセルしました"
  exit 1
fi

echo ""
echo "🔄 .envファイルを更新中..."

# .envファイルの更新
sed -i.bak "s|MEDICAL_SYSTEM_API_URL=http://localhost:8888|MEDICAL_SYSTEM_API_URL=$STAGING_URL|g" .env
sed -i.bak "s|MEDICAL_SYSTEM_API_KEY=test-api-key-for-integration-testing|MEDICAL_SYSTEM_API_KEY=$STAGING_API_KEY|g" .env
sed -i.bak "s|MEDICAL_SYSTEM_WEBHOOK_SECRET=test-secret-key-for-integration-testing-32chars|MEDICAL_SYSTEM_WEBHOOK_SECRET=$STAGING_WEBHOOK_SECRET|g" .env

echo "✅ .envファイル更新完了"
echo ""

# 環境変数の確認
echo "📋 更新後の環境設定:"
grep "MEDICAL_SYSTEM_API_URL" .env
grep "MEDICAL_SYSTEM_API_KEY" .env | sed 's/\(MEDICAL_SYSTEM_API_KEY=\).*/\1****** (masked)/'
grep "MEDICAL_SYSTEM_WEBHOOK_SECRET" .env | sed 's/\(MEDICAL_SYSTEM_WEBHOOK_SECRET=\).*/\1****** (masked)/'
echo ""

# 接続テスト
echo "🔍 ステージング環境への接続テスト中..."
echo ""

# ヘルスチェック
echo "1. ヘルスチェック:"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$STAGING_URL/api/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ ヘルスチェック成功 (HTTP 200)"
else
  echo "   ❌ ヘルスチェック失敗 (HTTP $HTTP_CODE)"
fi
echo ""

# API 1テスト
echo "2. Webhook送信統計API:"
API1_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $STAGING_API_KEY" \
  -H "X-VoiceDrive-System-ID: voicedrive-v100" \
  "$STAGING_URL/api/voicedrive/webhook-stats" 2>&1)
HTTP_CODE=$(echo "$API1_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ API 1接続成功 (HTTP 200)"
else
  echo "   ❌ API 1接続失敗 (HTTP $HTTP_CODE)"
fi
echo ""

# API 2テスト
echo "3. 面談完了統計API:"
API2_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $STAGING_API_KEY" \
  -H "X-VoiceDrive-System-ID: voicedrive-v100" \
  "$STAGING_URL/api/voicedrive/interview-completion-stats" 2>&1)
HTTP_CODE=$(echo "$API2_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ API 2接続成功 (HTTP 200)"
else
  echo "   ❌ API 2接続失敗 (HTTP $HTTP_CODE)"
fi
echo ""

# 開発サーバー再起動の案内
echo "=================================================="
echo "  ✅ ステージング環境への切り替え完了"
echo "=================================================="
echo ""
echo "次のステップ:"
echo "1. 開発サーバーを再起動してください:"
echo "   npm run dev"
echo ""
echo "2. ブラウザで動作確認:"
echo "   http://localhost:5173"
echo "   → システム監視ダッシュボード → 医療システム連携タブ"
echo ""
echo "3. ステージング環境のデータが表示されることを確認してください"
echo ""
echo "問題が発生した場合は、バックアップから復元できます:"
echo "   cp .env.backup.YYYYMMDD_HHMMSS .env"
echo ""
