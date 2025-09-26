#!/usr/bin/env node

/**
 * 医療システムAPI疎通テスト
 * Phase 3 統合テスト - 初期接続確認
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト環境設定読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

const API_URL = process.env.VITE_MEDICAL_API_URL;
const API_TOKEN = process.env.VITE_MEDICAL_API_TOKEN;

console.log('========================================');
console.log('  医療システムAPI疎通テスト');
console.log('  実施日時:', new Date().toLocaleString('ja-JP'));
console.log('========================================\n');

// テスト結果記録
const results = [];

// 1. ヘルスチェック
async function testHealthCheck() {
  console.log('📡 Test 1: ヘルスチェック');
  console.log('-----------------------------------------');

  try {
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 5000
    });

    console.log('✅ 成功: ステータス', response.status);
    console.log('   レスポンス:', JSON.stringify(response.data, null, 2));
    results.push({ test: 'ヘルスチェック', status: 'SUCCESS', data: response.data });
    return true;
  } catch (error) {
    console.log('❌ 失敗:', error.message);
    results.push({ test: 'ヘルスチェック', status: 'FAILED', error: error.message });
    return false;
  }
}

// 2. 認証トークン検証
async function testAuthentication() {
  console.log('\n🔐 Test 2: 認証トークン検証');
  console.log('-----------------------------------------');

  try {
    const response = await axios.get(`${API_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      },
      timeout: 5000
    });

    console.log('✅ 成功: 認証有効');
    console.log('   トークン情報:', JSON.stringify(response.data, null, 2));
    results.push({ test: '認証検証', status: 'SUCCESS', data: response.data });
    return true;
  } catch (error) {
    console.log('❌ 失敗:', error.message);
    if (error.response) {
      console.log('   ステータス:', error.response.status);
      console.log('   エラー詳細:', error.response.data);
    }
    results.push({ test: '認証検証', status: 'FAILED', error: error.message });
    return false;
  }
}

// 3. 権限計算API（立神病院データ）
async function testPermissionCalculation() {
  console.log('\n🏥 Test 3: 立神病院スタッフ権限取得');
  console.log('-----------------------------------------');

  const testStaff = [
    { id: 'TATE_TEST_001', expected: '総師長', expectedLevel: 10 },
    { id: 'TATE_TEST_002', expected: '統括主任', expectedLevel: 7 },
    { id: 'TATE_TEST_003', expected: '師長', expectedLevel: 7 },
    { id: 'TATE_TEST_004', expected: '介護主任', expectedLevel: 5 },
    { id: 'TATE_TEST_005', expected: '看護師リーダー', expectedLevel: 3.5 }
  ];

  const testResults = [];

  for (const staff of testStaff) {
    console.log(`\n  Testing: ${staff.id} (${staff.expected})`);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/calculate-level`,
        {
          staffId: staff.id,
          facilityId: 'tategami-rehabilitation'
        },
        {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      const actualLevel = response.data.accountLevel || response.data.level;
      const match = actualLevel === staff.expectedLevel ? '✅' : '⚠️';

      console.log(`  ${match} レベル: ${actualLevel} (期待値: ${staff.expectedLevel})`);
      console.log(`     役職: ${response.data.position}`);

      testResults.push({
        staffId: staff.id,
        expected: staff.expectedLevel,
        actual: actualLevel,
        position: response.data.position,
        match: actualLevel === staff.expectedLevel
      });

    } catch (error) {
      console.log(`  ❌ エラー: ${error.message}`);
      testResults.push({
        staffId: staff.id,
        error: error.message
      });
    }
  }

  results.push({ test: '権限計算', status: 'COMPLETED', details: testResults });
  return testResults.filter(r => r.match).length === testResults.length;
}

// 4. エラーハンドリングテスト
async function testErrorHandling() {
  console.log('\n⚠️  Test 4: エラーハンドリング');
  console.log('-----------------------------------------');

  try {
    console.log('  無効なスタッフIDでテスト...');
    const response = await axios.post(
      `${API_URL}/api/v1/calculate-level`,
      {
        staffId: 'INVALID_STAFF_999',
        facilityId: 'tategami-rehabilitation'
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    console.log('  ⚠️ 予期しない成功:', response.data);
    results.push({ test: 'エラーハンドリング', status: 'UNEXPECTED', data: response.data });
    return false;

  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('  ✅ 期待通りのエラー: 404 Not Found');
      results.push({ test: 'エラーハンドリング', status: 'SUCCESS' });
      return true;
    } else {
      console.log('  ❌ 予期しないエラー:', error.message);
      results.push({ test: 'エラーハンドリング', status: 'FAILED', error: error.message });
      return false;
    }
  }
}

// 5. レスポンス時間測定
async function testPerformance() {
  console.log('\n⏱️  Test 5: パフォーマンス測定');
  console.log('-----------------------------------------');

  const iterations = 10;
  const times = [];

  console.log(`  ${iterations}回の権限計算を実行中...`);

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();

    try {
      await axios.post(
        `${API_URL}/api/v1/calculate-level`,
        {
          staffId: 'TATE_TEST_001',
          facilityId: 'tategami-rehabilitation'
        },
        {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      const duration = Date.now() - start;
      times.push(duration);

    } catch (error) {
      console.log(`  ❌ エラー (${i + 1}回目):`, error.message);
    }
  }

  if (times.length > 0) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    console.log(`  ✅ 平均応答時間: ${avg.toFixed(2)}ms`);
    console.log(`     最小: ${min}ms, 最大: ${max}ms`);

    results.push({
      test: 'パフォーマンス',
      status: 'SUCCESS',
      metrics: { avg, min, max, samples: times.length }
    });

    return avg < 500; // 500ms以下なら成功
  } else {
    results.push({ test: 'パフォーマンス', status: 'FAILED' });
    return false;
  }
}

// メイン実行
async function main() {
  console.log('環境設定:');
  console.log('  API URL:', API_URL);
  console.log('  施設ID: tategami-rehabilitation');
  console.log('');

  const tests = [
    testHealthCheck,
    testAuthentication,
    testPermissionCalculation,
    testErrorHandling,
    testPerformance
  ];

  let successCount = 0;
  let failCount = 0;

  for (const test of tests) {
    const success = await test();
    if (success) successCount++;
    else failCount++;
  }

  // 結果サマリー
  console.log('\n========================================');
  console.log('  テスト結果サマリー');
  console.log('========================================');
  console.log(`  成功: ${successCount} / ${tests.length}`);
  console.log(`  失敗: ${failCount} / ${tests.length}`);

  // 結果をファイルに保存
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, '..', 'docs', `api-test-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    environment: API_URL,
    summary: {
      total: tests.length,
      success: successCount,
      failed: failCount
    },
    results
  };

  try {
    const fs = await import('fs');
    fs.default.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 詳細レポート保存: ${reportPath}`);
  } catch (error) {
    console.log('\n⚠️ レポート保存失敗:', error.message);
  }

  console.log('\n✨ テスト完了\n');

  process.exit(failCount > 0 ? 1 : 0);
}

// 実行
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});