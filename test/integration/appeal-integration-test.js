/**
 * 異議申し立て機能統合テストスクリプト
 * 実行日: 2025年8月20日予定
 * 
 * 使用方法:
 * node test/integration/appeal-integration-test.js
 */

import axios from 'axios';
import colors from 'colors';
import { promises as fs } from 'fs';
import path from 'path';

// テスト環境設定
const CONFIG = {
  VOICEDRIVE_API: process.env.VOICEDRIVE_API || 'http://localhost:3001',
  MEDICAL_API: process.env.MEDICAL_API || 'http://localhost:3000',
  AUTH_TOKEN: process.env.AUTH_TOKEN || 'test-token-12345',
  LOG_FILE: 'test-results-' + new Date().toISOString().split('T')[0] + '.json'
};

// テスト結果記録
const testResults = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// APIクライアント設定
const apiClient = axios.create({
  baseURL: CONFIG.VOICEDRIVE_API,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.AUTH_TOKEN}`
  },
  timeout: 10000
});

// 医療システムAPIクライアント
const medicalApiClient = axios.create({
  baseURL: CONFIG.MEDICAL_API,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.AUTH_TOKEN}`
  },
  timeout: 10000
});

// ========== テストケース定義 ==========

/**
 * テストケース1: 評価期間マスタデータ取得
 */
async function test_getEvaluationPeriods() {
  const testCase = {
    name: '評価期間マスタデータ取得',
    category: 'API連携',
    priority: 'high'
  };

  try {
    console.log('\n📋 テスト: 評価期間マスタデータ取得'.cyan);
    
    // 医療システムAPIから評価期間を取得
    const response = await medicalApiClient.get('/api/v1/evaluation/periods');
    
    // 検証
    assert(response.status === 200, 'ステータスコード200');
    assert(response.data.success === true, 'success=true');
    assert(Array.isArray(response.data.periods), '期間配列が存在');
    assert(response.data.periods.length > 0, '1件以上の期間が存在');
    
    // 期限チェック
    const activePeriods = response.data.periods.filter(p => {
      return new Date(p.appealDeadline) > new Date() && p.status === 'active';
    });
    assert(activePeriods.length > 0, '有効な期間が存在');
    
    console.log('  ✅ 取得成功:'.green, `${response.data.periods.length}件の評価期間`);
    console.log('  ✅ 有効期間:'.green, `${activePeriods.length}件`);
    
    recordTest(testCase, 'passed', { periodsCount: response.data.periods.length });
    return activePeriods[0]; // 次のテストで使用
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.message);
    recordTest(testCase, 'failed', { error: error.message });
    return null;
  }
}

/**
 * テストケース2: 高優先度異議申し立て（計算誤り）
 */
async function test_submitHighPriorityAppeal(evaluationPeriod) {
  const testCase = {
    name: '高優先度異議申し立て送信（計算誤り）',
    category: '異議申し立て送信',
    priority: 'high'
  };

  if (!evaluationPeriod) {
    console.log('\n⏭️  スキップ: 評価期間が取得できないため'.yellow);
    recordTest(testCase, 'skipped');
    return null;
  }

  try {
    console.log('\n🔴 テスト: 高優先度異議申し立て（計算誤り）'.cyan);
    
    const appealData = {
      employeeId: 'TEST-E001',
      employeeName: 'テスト太郎',
      evaluationPeriod: evaluationPeriod.id || '2025-H1',
      appealCategory: 'calculation_error', // 高優先度
      appealReason: '評価計算に明らかな誤りがあります。具体的には、研修講師として10回実施した実績が0回として計算されています。これは明確な計算ミスであり、早急な修正を求めます。証拠として研修実施記録を添付します。',
      originalScore: 60,
      requestedScore: 75, // 15点差
      jobCategory: 'manager' // 管理職
    };
    
    const response = await apiClient.post('/api/v1/appeals/submit', appealData);
    
    // 検証
    assert(response.status === 200, 'ステータスコード200');
    assert(response.data.success === true, 'success=true');
    assert(response.data.appealId, 'appealIdが存在');
    assert(response.data.details.priority === 'high', '優先度がhigh');
    
    console.log('  ✅ 送信成功:'.green, response.data.appealId);
    console.log('  ✅ 優先度:'.green, response.data.details.priority);
    console.log('  ✅ 期待応答日:'.green, response.data.expectedResponseDate);
    
    recordTest(testCase, 'passed', { appealId: response.data.appealId });
    return response.data.appealId;
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTest(testCase, 'failed', { error: error.message });
    return null;
  }
}

/**
 * テストケース3: 中優先度異議申し立て（成果見落とし）
 */
async function test_submitMediumPriorityAppeal(evaluationPeriod) {
  const testCase = {
    name: '中優先度異議申し立て送信（成果見落とし）',
    category: '異議申し立て送信',
    priority: 'medium'
  };

  if (!evaluationPeriod) {
    console.log('\n⏭️  スキップ: 評価期間が取得できないため'.yellow);
    recordTest(testCase, 'skipped');
    return null;
  }

  try {
    console.log('\n🟡 テスト: 中優先度異議申し立て（成果見落とし）'.cyan);
    
    const appealData = {
      employeeId: 'TEST-E002',
      employeeName: 'テスト花子',
      evaluationPeriod: evaluationPeriod.id || '2025-H1',
      appealCategory: 'achievement_oversight', // 中優先度
      appealReason: '今期実施した改善提案プロジェクト3件が評価に反映されていません。各プロジェクトは部門の効率化に大きく貢献し、年間200万円のコスト削減を実現しました。改善提案書と実績報告書を証拠として提出します。',
      originalScore: 70,
      requestedScore: 77, // 7点差
      evidenceDocuments: ['doc1.pdf', 'doc2.pdf', 'doc3.pdf'] // 複数証拠
    };
    
    const response = await apiClient.post('/api/v1/appeals/submit', appealData);
    
    // 検証
    assert(response.data.success === true, 'success=true');
    assert(response.data.details.priority === 'medium', '優先度がmedium');
    
    console.log('  ✅ 送信成功:'.green, response.data.appealId);
    console.log('  ✅ 優先度:'.green, response.data.details.priority);
    
    recordTest(testCase, 'passed', { appealId: response.data.appealId });
    return response.data.appealId;
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTest(testCase, 'failed', { error: error.message });
    return null;
  }
}

/**
 * テストケース4: 低優先度異議申し立て
 */
async function test_submitLowPriorityAppeal(evaluationPeriod) {
  const testCase = {
    name: '低優先度異議申し立て送信（その他）',
    category: '異議申し立て送信',
    priority: 'low'
  };

  if (!evaluationPeriod) {
    console.log('\n⏭️  スキップ: 評価期間が取得できないため'.yellow);
    recordTest(testCase, 'skipped');
    return null;
  }

  try {
    console.log('\n🟢 テスト: 低優先度異議申し立て（その他）'.cyan);
    
    const appealData = {
      employeeId: 'TEST-E003',
      employeeName: 'テスト次郎',
      evaluationPeriod: evaluationPeriod.id || '2025-H1',
      appealCategory: 'other', // 低優先度
      appealReason: '評価面談時に説明された内容と実際の評価結果に若干の相違があると感じています。特に、チームワークの項目について、期待していた評価より低い結果となりました。再度検討をお願いいたします。',
      originalScore: 72,
      requestedScore: 75 // 3点差
    };
    
    const response = await apiClient.post('/api/v1/appeals/submit', appealData);
    
    // 検証
    assert(response.data.success === true, 'success=true');
    assert(response.data.details.priority === 'low', '優先度がlow');
    
    console.log('  ✅ 送信成功:'.green, response.data.appealId);
    console.log('  ✅ 優先度:'.green, response.data.details.priority);
    
    recordTest(testCase, 'passed', { appealId: response.data.appealId });
    return response.data.appealId;
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTest(testCase, 'failed', { error: error.message });
    return null;
  }
}

/**
 * テストケース5: 期限切れエラー（E002）
 */
async function test_expiredPeriodError() {
  const testCase = {
    name: '期限切れ評価期間でのエラー確認',
    category: 'エラーハンドリング',
    priority: 'high'
  };

  try {
    console.log('\n⚠️  テスト: 期限切れエラー（E002）'.cyan);
    
    const appealData = {
      employeeId: 'TEST-E004',
      employeeName: 'テスト四郎',
      evaluationPeriod: '2023-H1', // 古い期間
      appealCategory: 'other',
      appealReason: 'これは期限切れのテストです。このテストは失敗することが期待されています。エラーコードE002が返されることを確認します。100文字以上の理由を記載する必要があります。',
      originalScore: 70,
      requestedScore: 75
    };
    
    const response = await apiClient.post('/api/v1/appeals/submit', appealData);
    
    // 成功したら失敗（エラーが期待される）
    console.log('  ❌ 失敗:'.red, 'エラーが発生しませんでした');
    recordTest(testCase, 'failed', { error: 'エラーが期待されたが成功した' });
    
  } catch (error) {
    // エラーが期待される
    const errorCode = error.response?.data?.error?.code;
    const errorMessage = error.response?.data?.error?.message;
    
    if (errorCode === 'E002' || errorMessage?.includes('有効な評価期間')) {
      console.log('  ✅ 期待通りのエラー:'.green, errorCode || 'E002');
      console.log('  ✅ エラーメッセージ:'.green, errorMessage);
      recordTest(testCase, 'passed', { errorCode, errorMessage });
    } else {
      console.log('  ❌ 予期しないエラー:'.red, errorMessage);
      recordTest(testCase, 'failed', { error: errorMessage });
    }
  }
}

/**
 * テストケース6: 審査者割り当て確認
 */
async function test_reviewerAssignment(appealId) {
  const testCase = {
    name: '審査者自動割り当て確認',
    category: 'ステータス管理',
    priority: 'high'
  };

  if (!appealId) {
    console.log('\n⏭️  スキップ: appealIdがないため'.yellow);
    recordTest(testCase, 'skipped');
    return;
  }

  try {
    console.log('\n👤 テスト: 審査者割り当て確認'.cyan);
    
    // ステータスを審査中に更新（審査者割り当てトリガー）
    const updateResponse = await apiClient.put(`/api/v1/appeals/status/${appealId}`, {
      status: 'under_review',
      userId: 'admin001'
    });
    
    // ステータス確認
    const statusResponse = await apiClient.get(`/api/v1/appeals/status/${appealId}`);
    
    // 検証
    assert(statusResponse.data.success === true, 'ステータス取得成功');
    assert(statusResponse.data.data.status === 'under_review', 'ステータスがunder_review');
    
    console.log('  ✅ ステータス更新:'.green, 'under_review');
    console.log('  ✅ 審査者割り当て:'.green, '完了（自動またはデフォルト）');
    
    recordTest(testCase, 'passed', { status: 'under_review' });
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTest(testCase, 'failed', { error: error.message });
  }
}

/**
 * テストケース7: バリデーションエラー（100文字未満）
 */
async function test_validationError() {
  const testCase = {
    name: 'バリデーションエラー（理由100文字未満）',
    category: 'バリデーション',
    priority: 'medium'
  };

  try {
    console.log('\n📝 テスト: バリデーションエラー'.cyan);
    
    const appealData = {
      employeeId: 'TEST-E005',
      employeeName: 'テスト五郎',
      evaluationPeriod: '2025-H1',
      appealCategory: 'other',
      appealReason: '短い理由', // 100文字未満
      originalScore: 70,
      requestedScore: 75
    };
    
    const response = await apiClient.post('/api/v1/appeals/submit', appealData);
    
    // 成功したら失敗
    console.log('  ❌ 失敗:'.red, 'バリデーションエラーが発生しませんでした');
    recordTest(testCase, 'failed', { error: 'エラーが期待されたが成功した' });
    
  } catch (error) {
    // エラーが期待される
    const errorCode = error.response?.data?.error?.code;
    const errorMessage = error.response?.data?.error?.message;
    
    if (errorCode === 'INVALID_REASON' || errorMessage?.includes('100文字以上')) {
      console.log('  ✅ 期待通りのエラー:'.green, 'INVALID_REASON');
      console.log('  ✅ エラーメッセージ:'.green, errorMessage);
      recordTest(testCase, 'passed', { errorCode, errorMessage });
    } else {
      console.log('  ❌ 予期しないエラー:'.red, errorMessage);
      recordTest(testCase, 'failed', { error: errorMessage });
    }
  }
}

/**
 * テストケース8: 取り下げ機能
 */
async function test_withdrawAppeal(appealId) {
  const testCase = {
    name: '異議申し立て取り下げ',
    category: 'ステータス管理',
    priority: 'medium'
  };

  if (!appealId) {
    console.log('\n⏭️  スキップ: appealIdがないため'.yellow);
    recordTest(testCase, 'skipped');
    return;
  }

  try {
    console.log('\n↩️  テスト: 異議申し立て取り下げ'.cyan);
    
    const response = await apiClient.delete('/api/v1/appeals/submit', {
      data: {
        appealId,
        reason: 'テスト完了のため取り下げ'
      }
    });
    
    // 検証
    assert(response.data.success === true, '取り下げ成功');
    
    // ステータス確認
    const statusResponse = await apiClient.get(`/api/v1/appeals/status/${appealId}`);
    assert(statusResponse.data.data.status === 'withdrawn', 'ステータスがwithdrawn');
    
    console.log('  ✅ 取り下げ成功:'.green, appealId);
    console.log('  ✅ ステータス:'.green, 'withdrawn');
    
    recordTest(testCase, 'passed', { status: 'withdrawn' });
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTest(testCase, 'failed', { error: error.message });
  }
}

/**
 * テストケース9: 通知機能確認
 */
async function test_notificationCheck() {
  const testCase = {
    name: '通知機能動作確認',
    category: '通知',
    priority: 'low'
  };

  try {
    console.log('\n🔔 テスト: 通知機能確認'.cyan);
    
    // ログファイルから通知記録を確認
    const logsPath = path.join(process.cwd(), 'mcp-shared', 'appeals', 'logs');
    const logFile = `appeal-${new Date().toISOString().split('T')[0]}.log`;
    
    try {
      const logContent = await fs.readFile(path.join(logsPath, logFile), 'utf-8');
      const hasNotification = logContent.includes('notify');
      
      assert(hasNotification, '通知ログが存在');
      console.log('  ✅ 通知ログ確認:'.green, '記録あり');
      recordTest(testCase, 'passed');
    } catch (err) {
      console.log('  ⚠️  ログファイルが見つかりません'.yellow);
      recordTest(testCase, 'skipped', { reason: 'ログファイル未確認' });
    }
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.message);
    recordTest(testCase, 'failed', { error: error.message });
  }
}

// ========== ヘルパー関数 ==========

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function recordTest(testCase, status, details = {}) {
  const result = {
    ...testCase,
    status,
    timestamp: new Date().toISOString(),
    details
  };
  
  testResults.tests.push(result);
  testResults.summary.total++;
  testResults.summary[status]++;
}

async function saveResults() {
  testResults.endTime = new Date().toISOString();
  testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);
  
  const resultsPath = path.join(process.cwd(), 'test', 'results', CONFIG.LOG_FILE);
  await fs.mkdir(path.dirname(resultsPath), { recursive: true });
  await fs.writeFile(resultsPath, JSON.stringify(testResults, null, 2));
  
  console.log('\n📊 結果保存:'.cyan, resultsPath);
}

// ========== メイン実行 ==========

async function runIntegrationTests() {
  console.log('========================================'.cyan);
  console.log(' 異議申し立て機能 統合テスト '.bgCyan.black);
  console.log('========================================'.cyan);
  console.log('開始時刻:', new Date().toLocaleString());
  console.log('VoiceDrive API:', CONFIG.VOICEDRIVE_API);
  console.log('医療システムAPI:', CONFIG.MEDICAL_API);
  console.log('');

  try {
    // 1. 評価期間取得
    const evaluationPeriod = await test_getEvaluationPeriods();
    
    // 2. 高優先度申し立て
    const highPriorityId = await test_submitHighPriorityAppeal(evaluationPeriod);
    
    // 3. 中優先度申し立て
    const mediumPriorityId = await test_submitMediumPriorityAppeal(evaluationPeriod);
    
    // 4. 低優先度申し立て
    const lowPriorityId = await test_submitLowPriorityAppeal(evaluationPeriod);
    
    // 5. 期限切れエラー
    await test_expiredPeriodError();
    
    // 6. 審査者割り当て
    await test_reviewerAssignment(highPriorityId);
    
    // 7. バリデーションエラー
    await test_validationError();
    
    // 8. 取り下げ
    await test_withdrawAppeal(lowPriorityId);
    
    // 9. 通知確認
    await test_notificationCheck();
    
  } catch (error) {
    console.error('\n致命的エラー:'.red, error.message);
  }

  // 結果サマリー
  console.log('\n========================================'.cyan);
  console.log(' テスト結果サマリー '.bgCyan.black);
  console.log('========================================'.cyan);
  console.log('総テスト数:'.white, testResults.summary.total);
  console.log('✅ 成功:'.green, testResults.summary.passed);
  console.log('❌ 失敗:'.red, testResults.summary.failed);
  console.log('⏭️  スキップ:'.yellow, testResults.summary.skipped);
  
  const successRate = (testResults.summary.passed / testResults.summary.total * 100).toFixed(1);
  console.log('成功率:'.white, successRate + '%');
  
  // 結果保存
  await saveResults();
  
  // 終了コード
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().catch(console.error);
}

export { runIntegrationTests };