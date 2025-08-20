@echo off
REM ========================================
REM 異議申し立て機能 統合テスト実行スクリプト（Windows用）
REM 実行日: 2025年8月20日
REM ========================================

echo ========================================
echo   異議申し立て機能 統合テスト
echo ========================================
echo 開始時刻: %date% %time%
echo.

REM 環境変数設定
if "%VOICEDRIVE_API%"=="" set VOICEDRIVE_API=http://localhost:3001
if "%MEDICAL_API%"=="" set MEDICAL_API=http://localhost:3000
if "%AUTH_TOKEN%"=="" set AUTH_TOKEN=test-token-12345
set NODE_ENV=test

REM 結果ディレクトリ作成
if not exist "test\results" mkdir test\results

echo 1. サービス起動確認
echo ----------------------------------------

REM VoiceDrive API確認
echo VoiceDrive API (%VOICEDRIVE_API%): 
curl -s -o nul -w "%%{http_code}" "%VOICEDRIVE_API%/health" > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo [OK] 起動中
) else (
    echo [ERROR] 停止中
    echo 警告: VoiceDrive APIが起動していません
    echo 以下のコマンドで起動してください:
    echo   npm run dev
    exit /b 1
)

REM 医療システムAPI確認
echo 医療システムAPI (%MEDICAL_API%): 
curl -s -o nul -w "%%{http_code}" "%MEDICAL_API%/health" > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo [OK] 起動中
) else (
    echo [WARNING] 停止中（モックモードで実行）
    set USE_MOCK=true
)

echo.

echo 2. MCPフォルダ準備
echo ----------------------------------------
if not exist "mcp-shared\appeals\pending" mkdir mcp-shared\appeals\pending
if not exist "mcp-shared\appeals\in-progress" mkdir mcp-shared\appeals\in-progress
if not exist "mcp-shared\appeals\resolved" mkdir mcp-shared\appeals\resolved
if not exist "mcp-shared\appeals\logs" mkdir mcp-shared\appeals\logs
echo [OK] フォルダ作成完了
echo.

echo 3. テストデータ準備
echo ----------------------------------------
if exist "test\integration\test-data.json" (
    echo [OK] テストデータ確認
) else (
    echo [ERROR] テストデータが見つかりません
    exit /b 1
)
echo.

echo 4. 依存パッケージ確認
echo ----------------------------------------
npm list axios --depth=0 >nul 2>&1
if errorlevel 1 (
    echo axiosをインストールしています...
    npm install axios
)
npm list colors --depth=0 >nul 2>&1
if errorlevel 1 (
    echo colorsをインストールしています...
    npm install colors
)
echo [OK] 依存パッケージ確認完了
echo.

echo 5. 統合テスト実行
echo ========================================
echo.

REM Node.jsでテスト実行
node test\integration\appeal-integration-test.js

REM 終了コード取得
set TEST_RESULT=%errorlevel%

echo.
echo ========================================
echo   テスト実行完了
echo ========================================
echo 終了時刻: %date% %time%

REM 結果表示
if %TEST_RESULT%==0 (
    echo [SUCCESS] すべてのテストが成功しました
) else (
    echo [FAILURE] 一部のテストが失敗しました
)

echo.
echo 6. レポート生成
echo ----------------------------------------

REM タイムスタンプ生成
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%mydate%-%mytime: =%

set REPORT_FILE=test\results\report-%TIMESTAMP%.html

REM レポート生成（generate-report.jsが存在する場合）
if exist "test\integration\generate-report.js" (
    node test\integration\generate-report.js > "%REPORT_FILE%"
    echo [OK] レポート生成完了: %REPORT_FILE%
    
    REM ブラウザで開く
    start "" "%REPORT_FILE%"
) else (
    echo [WARNING] レポート生成スキップ（generate-report.jsが見つかりません）
)

echo.
echo ========================================
echo テストログ: test\results\
echo ========================================

exit /b %TEST_RESULT%