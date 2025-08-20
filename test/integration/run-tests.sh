#!/bin/bash

# ========================================
# 異議申し立て機能 統合テスト実行スクリプト
# 実行日: 2025年8月20日
# ========================================

echo "========================================"
echo "  異議申し立て機能 統合テスト"
echo "========================================"
echo "開始時刻: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 環境変数設定
export VOICEDRIVE_API=${VOICEDRIVE_API:-"http://localhost:3001"}
export MEDICAL_API=${MEDICAL_API:-"http://localhost:3000"}
export AUTH_TOKEN=${AUTH_TOKEN:-"test-token-12345"}
export NODE_ENV="test"

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 結果ディレクトリ作成
mkdir -p test/results

# サービス起動確認
echo -e "${BLUE}1. サービス起動確認${NC}"
echo "----------------------------------------"

# VoiceDrive API確認
echo -n "VoiceDrive API ($VOICEDRIVE_API): "
if curl -s -o /dev/null -w "%{http_code}" "$VOICEDRIVE_API/health" | grep -q "200"; then
    echo -e "${GREEN}✓ 起動中${NC}"
else
    echo -e "${RED}✗ 停止中${NC}"
    echo -e "${YELLOW}警告: VoiceDrive APIが起動していません${NC}"
    echo "以下のコマンドで起動してください:"
    echo "  npm run dev"
    exit 1
fi

# 医療システムAPI確認
echo -n "医療システムAPI ($MEDICAL_API): "
if curl -s -o /dev/null -w "%{http_code}" "$MEDICAL_API/health" | grep -q "200"; then
    echo -e "${GREEN}✓ 起動中${NC}"
else
    echo -e "${YELLOW}⚠ 停止中（モックモードで実行）${NC}"
    export USE_MOCK=true
fi

echo ""

# MCPフォルダ準備
echo -e "${BLUE}2. MCPフォルダ準備${NC}"
echo "----------------------------------------"
mkdir -p mcp-shared/appeals/{pending,in-progress,resolved,logs}
echo -e "${GREEN}✓ フォルダ作成完了${NC}"
echo ""

# テストデータ準備
echo -e "${BLUE}3. テストデータ準備${NC}"
echo "----------------------------------------"
if [ -f "test/integration/test-data.json" ]; then
    echo -e "${GREEN}✓ テストデータ確認${NC}"
else
    echo -e "${RED}✗ テストデータが見つかりません${NC}"
    exit 1
fi
echo ""

# npmパッケージ確認
echo -e "${BLUE}4. 依存パッケージ確認${NC}"
echo "----------------------------------------"
if ! npm list axios --depth=0 > /dev/null 2>&1; then
    echo "axiosをインストールしています..."
    npm install axios
fi
if ! npm list colors --depth=0 > /dev/null 2>&1; then
    echo "colorsをインストールしています..."
    npm install colors
fi
echo -e "${GREEN}✓ 依存パッケージ確認完了${NC}"
echo ""

# テスト実行
echo -e "${BLUE}5. 統合テスト実行${NC}"
echo "========================================"
echo ""

# Node.jsでテスト実行
node test/integration/appeal-integration-test.js

# 終了コード取得
TEST_RESULT=$?

echo ""
echo "========================================"
echo "  テスト実行完了"
echo "========================================"
echo "終了時刻: $(date '+%Y-%m-%d %H:%M:%S')"

# 結果表示
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}結果: すべてのテストが成功しました${NC}"
else
    echo -e "${RED}結果: 一部のテストが失敗しました${NC}"
fi

# レポート生成
echo ""
echo -e "${BLUE}6. レポート生成${NC}"
echo "----------------------------------------"

REPORT_FILE="test/results/report-$(date '+%Y%m%d-%H%M%S').html"
node test/integration/generate-report.js > "$REPORT_FILE"

if [ -f "$REPORT_FILE" ]; then
    echo -e "${GREEN}✓ レポート生成完了: $REPORT_FILE${NC}"
    
    # ブラウザで開く（Windowsの場合）
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        start "$REPORT_FILE"
    # macOSの場合
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        open "$REPORT_FILE"
    # Linuxの場合
    else
        xdg-open "$REPORT_FILE" 2>/dev/null || echo "レポートを手動で開いてください: $REPORT_FILE"
    fi
else
    echo -e "${YELLOW}⚠ レポート生成スキップ${NC}"
fi

echo ""
echo "========================================"
echo "テストログ: test/results/"
echo "========================================"

exit $TEST_RESULT