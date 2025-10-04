/**
 * VoiceDrive ⇔ 医療システムAPI 統合テスト
 *
 * 医療職員管理システムのcalculate-level APIとの連携をテスト
 */

// 環境変数から接続情報を取得
const MEDICAL_API_URL = process.env.MEDICAL_API_URL || 'http://localhost:3000/api/v1';
const JWT_TOKEN = process.env.JWT_TOKEN || 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2b2ljZWRyaXZlLWludGVncmF0aW9uIiwicm9sZSI6ImFwaS1jbGllbnQiLCJpYXQiOjE3Mjc5NTIwMDAsImV4cCI6MTczMDU0NDAwMH0.test-integration-token-for-voicedrive-medical-api';
const FACILITY_ID = process.env.FACILITY_ID || 'obara-hospital';

// テストケース定義（医療チーム提供データ）
const testCases = [
  { staffId: 'TEST_STAFF_001', expectedLevel: 1, description: '新人（1年目）' },
  { staffId: 'TEST_STAFF_002', expectedLevel: 1.5, description: '新人リーダー（1年目・リーダー可）' },
  { staffId: 'TEST_STAFF_003', expectedLevel: 3, description: '中堅（5年目）' },
  { staffId: 'TEST_STAFF_004', expectedLevel: 4, description: 'ベテラン（15年目）' },
  { staffId: 'TEST_STAFF_005', expectedLevel: 4.5, description: 'ベテランリーダー（15年目・リーダー可）' },
  { staffId: 'TEST_STAFF_006', expectedLevel: 10, description: '部長・医局長' },
  { staffId: 'TEST_STAFF_007', expectedLevel: 15, description: '人事各部門長' },
  { staffId: 'TEST_STAFF_008', expectedLevel: 18, description: '理事長（最高レベル）' },
  { staffId: 'TEST_STAFF_097', expectedLevel: 97, description: '健診担当者（特別権限）' },
  { staffId: 'TEST_STAFF_098', expectedLevel: 98, description: '産業医（特別権限）' },
  { staffId: 'TEST_STAFF_099', expectedLevel: 99, description: 'システム管理者（最高権限）' },
];

// テスト結果
const results = {
  passed: 0,
  failed: 0,
  errors: 0,
  totalResponseTime: 0,
  tests: []
};

// ヘルスチェック
async function healthCheck() {
  console.log('🔍 医療システムAPIヘルスチェック...\n');

  try {
    const startTime = Date.now();
    const response = await fetch(`${MEDICAL_API_URL}/health`);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`ヘルスチェック失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ APIサーバー稼働中`);
    console.log(`   ステータス: ${data.status}`);
    console.log(`   バージョン: ${data.version}`);
    console.log(`   レスポンスタイム: ${responseTime}ms\n`);

    return true;
  } catch (error) {
    console.error(`❌ ヘルスチェック失敗: ${error.message}\n`);
    return false;
  }
}

// レベル計算APIテスト
async function testCalculateLevel(testCase) {
  const { staffId, expectedLevel, description } = testCase;

  try {
    const startTime = Date.now();
    const response = await fetch(`${MEDICAL_API_URL}/calculate-level`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': JWT_TOKEN
      },
      body: JSON.stringify({
        staffId,
        facilityId: FACILITY_ID
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const actualLevel = data.accountLevel;

    // レベル一致確認（Decimal型を考慮）
    const levelsMatch = Math.abs(Number(actualLevel) - Number(expectedLevel)) < 0.001;

    if (levelsMatch) {
      console.log(`✅ ${staffId}: ${description}`);
      console.log(`   期待レベル: ${expectedLevel}, 実際: ${actualLevel}, レスポンスタイム: ${responseTime}ms`);
      results.passed++;
      results.tests.push({
        staffId,
        description,
        expectedLevel,
        actualLevel,
        responseTime,
        status: 'PASS'
      });
    } else {
      console.log(`❌ ${staffId}: ${description}`);
      console.log(`   期待レベル: ${expectedLevel}, 実際: ${actualLevel} (不一致)`);
      results.failed++;
      results.tests.push({
        staffId,
        description,
        expectedLevel,
        actualLevel,
        responseTime,
        status: 'FAIL',
        error: `レベル不一致: 期待=${expectedLevel}, 実際=${actualLevel}`
      });
    }

    results.totalResponseTime += responseTime;

  } catch (error) {
    console.log(`❌ ${staffId}: ${description}`);
    console.log(`   エラー: ${error.message}`);
    results.errors++;
    results.tests.push({
      staffId,
      description,
      expectedLevel,
      actualLevel: null,
      responseTime: null,
      status: 'ERROR',
      error: error.message
    });
  }
}

// カテゴリ別サマリー表示
function displayCategorySummary() {
  console.log('\n📊 カテゴリ別テスト結果\n');

  const categories = {
    '基本レベル（1-4）': ['TEST_STAFF_001', 'TEST_STAFF_003', 'TEST_STAFF_004'],
    '0.5刻みレベル（リーダー）': ['TEST_STAFF_002', 'TEST_STAFF_005'],
    '役職レベル（5-18）': ['TEST_STAFF_006', 'TEST_STAFF_007', 'TEST_STAFF_008'],
    '特別権限（97-99）': ['TEST_STAFF_097', 'TEST_STAFF_098', 'TEST_STAFF_099']
  };

  for (const [category, staffIds] of Object.entries(categories)) {
    const categoryTests = results.tests.filter(t => staffIds.includes(t.staffId));
    const passed = categoryTests.filter(t => t.status === 'PASS').length;
    const total = categoryTests.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    const icon = passed === total ? '✅' : '⚠️';
    console.log(`${icon} ${category}: ${passed}/${total} (${passRate}%)`);
  }
}

// メイン処理
async function runIntegrationTest() {
  console.log('🧪 VoiceDrive ⇔ 医療システムAPI 統合テスト開始\n');
  console.log('='.repeat(70));
  console.log(`\n接続情報:`);
  console.log(`  API URL: ${MEDICAL_API_URL}`);
  console.log(`  施設ID: ${FACILITY_ID}`);
  console.log(`  テストケース数: ${testCases.length}件\n`);
  console.log('='.repeat(70));

  // Step 1: ヘルスチェック
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    console.error('❌ 医療システムAPIに接続できません。サーバーが起動しているか確認してください。\n');
    process.exit(1);
  }

  // Step 2: 全テストケース実行
  console.log('📋 テストケース実行中...\n');

  for (const testCase of testCases) {
    await testCalculateLevel(testCase);
  }

  // Step 3: 結果サマリー表示
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 統合テスト結果サマリー\n');
  console.log(`  ✅ 合格: ${results.passed}件`);
  console.log(`  ❌ 不合格: ${results.failed}件`);
  console.log(`  💥 エラー: ${results.errors}件`);
  console.log(`  合計: ${results.passed + results.failed + results.errors}件`);

  const successRate = ((results.passed / testCases.length) * 100).toFixed(1);
  console.log(`  合格率: ${successRate}%`);

  const avgResponseTime = (results.totalResponseTime / testCases.length).toFixed(1);
  console.log(`  平均レスポンスタイム: ${avgResponseTime}ms`);

  // Step 4: カテゴリ別サマリー
  displayCategorySummary();

  console.log('\n' + '='.repeat(70));

  // Step 5: 失敗・エラーの詳細表示
  const failedTests = results.tests.filter(t => t.status !== 'PASS');
  if (failedTests.length > 0) {
    console.log('\n⚠️ 失敗・エラー詳細:\n');
    failedTests.forEach(test => {
      console.log(`  ${test.staffId}: ${test.description}`);
      console.log(`    ${test.error}\n`);
    });
  } else {
    console.log('\n🎉 すべてのテストが合格しました！\n');
  }

  // Step 6: 結果をJSONファイルに保存
  const resultJson = {
    timestamp: new Date().toISOString(),
    apiUrl: MEDICAL_API_URL,
    facilityId: FACILITY_ID,
    summary: {
      total: testCases.length,
      passed: results.passed,
      failed: results.failed,
      errors: results.errors,
      successRate: `${successRate}%`,
      avgResponseTime: `${avgResponseTime}ms`
    },
    tests: results.tests
  };

  const fs = require('fs');
  const reportPath = `mcp-shared/logs/integration-test-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(resultJson, null, 2));
  console.log(`📄 詳細レポート保存: ${reportPath}\n`);

  // 終了コード
  process.exit(results.failed + results.errors > 0 ? 1 : 0);
}

// 実行
runIntegrationTest().catch(error => {
  console.error('❌ 統合テスト実行エラー:', error);
  process.exit(1);
});
