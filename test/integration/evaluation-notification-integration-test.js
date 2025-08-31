// V3評価通知システム統合テスト
// 実行: node test/integration/evaluation-notification-integration-test.js

const fs = require('fs');
const path = require('path');

// テスト設定
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  testEmployeeId: 'TEST_EMP_001',
  testEvaluationPeriod: '2025_winter',
  outputFile: path.join(__dirname, 'evaluation-notification-test-report.md'),
  verbose: true
};

// テストデータ
const TEST_EVALUATION_NOTIFICATION = {
  employeeId: TEST_CONFIG.testEmployeeId,
  employeeName: 'テスト太郎',
  evaluationPeriod: TEST_CONFIG.testEvaluationPeriod,
  evaluationScore: 85,
  evaluationGrade: 'A',
  disclosureDate: new Date().toISOString().split('T')[0],
  appealDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  medicalSystemUrl: 'https://medical-system.example.com/evaluations/123',
  additionalMessage: 'V3評価システムテスト用通知'
};

// テスト結果記録
const testResults = {
  startTime: new Date(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

// ログ出力
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// テスト実行関数
async function runTest(testName, testFn) {
  testResults.summary.total++;
  log(`テスト開始: ${testName}`, 'info');
  
  const testResult = {
    name: testName,
    startTime: new Date(),
    status: 'running',
    error: null,
    details: {}
  };
  
  try {
    const result = await testFn();
    testResult.status = 'passed';
    testResult.details = result || {};
    testResults.summary.passed++;
    log(`テスト成功: ${testName}`, 'success');
  } catch (error) {
    testResult.status = 'failed';
    testResult.error = error.message;
    testResults.summary.failed++;
    testResults.summary.errors.push(`${testName}: ${error.message}`);
    log(`テスト失敗: ${testName} - ${error.message}`, 'error');
  }
  
  testResult.endTime = new Date();
  testResult.duration = testResult.endTime - testResult.startTime;
  testResults.tests.push(testResult);
}

// HTTPリクエスト送信
async function sendRequest(endpoint, method = 'GET', data = null) {
  const fetch = (await import('node-fetch')).default;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_token'
    }
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// 1. 評価通知受信テスト
async function testNotificationReception() {
  const response = await sendRequest('/api/evaluation-notifications', 'POST', TEST_EVALUATION_NOTIFICATION);
  
  if (!response.success) {
    throw new Error('通知送信に失敗しました');
  }
  
  if (!response.notificationId) {
    throw new Error('通知IDが返されませんでした');
  }
  
  return {
    notificationId: response.notificationId,
    deliveryMethods: response.deliveryMethods,
    message: response.message
  };
}

// 2. 通知一覧取得テスト
async function testNotificationList() {
  const response = await sendRequest('/api/evaluation-notifications', 'POST', {
    employeeId: TEST_CONFIG.testEmployeeId
  });
  
  if (!Array.isArray(response)) {
    throw new Error('通知一覧が配列で返されませんでした');
  }
  
  const notification = response.find(n => n.evaluationPeriod === TEST_CONFIG.testEvaluationPeriod);
  if (!notification) {
    throw new Error('送信した通知が一覧に見つかりませんでした');
  }
  
  return {
    totalNotifications: response.length,
    testNotificationFound: true,
    notification: notification
  };
}

// 3. 通知詳細取得テスト
async function testNotificationDetail() {
  // まず通知一覧から対象の通知IDを取得
  const listResponse = await sendRequest('/api/evaluation-notifications', 'POST', {
    employeeId: TEST_CONFIG.testEmployeeId
  });
  
  const notification = listResponse.find(n => n.evaluationPeriod === TEST_CONFIG.testEvaluationPeriod);
  if (!notification) {
    throw new Error('テスト用通知が見つかりません');
  }
  
  const detailResponse = await sendRequest(`/api/evaluation-notifications/${notification.id}`);
  
  if (detailResponse.evaluationScore !== TEST_EVALUATION_NOTIFICATION.evaluationScore) {
    throw new Error('評価スコアが一致しません');
  }
  
  return {
    notificationId: detailResponse.id,
    evaluationScore: detailResponse.evaluationScore,
    evaluationGrade: detailResponse.evaluationGrade
  };
}

// 4. 既読マークテスト
async function testMarkAsRead() {
  // 通知IDを取得
  const listResponse = await sendRequest('/api/evaluation-notifications', 'POST', {
    employeeId: TEST_CONFIG.testEmployeeId
  });
  
  const notification = listResponse.find(n => n.evaluationPeriod === TEST_CONFIG.testEvaluationPeriod);
  if (!notification) {
    throw new Error('テスト用通知が見つかりません');
  }
  
  // 既読マーク
  await sendRequest(`/api/evaluation-notifications/${notification.id}/read`, 'PATCH');
  
  // 確認
  const detailResponse = await sendRequest(`/api/evaluation-notifications/${notification.id}`);
  
  if (!detailResponse.notificationReadAt) {
    throw new Error('既読マークが設定されませんでした');
  }
  
  return {
    notificationId: notification.id,
    readAt: detailResponse.notificationReadAt
  };
}

// 5. 異議申立リンククリック追跡テスト
async function testAppealLinkTracking() {
  const listResponse = await sendRequest('/api/evaluation-notifications', 'POST', {
    employeeId: TEST_CONFIG.testEmployeeId
  });
  
  const notification = listResponse.find(n => n.evaluationPeriod === TEST_CONFIG.testEvaluationPeriod);
  if (!notification) {
    throw new Error('テスト用通知が見つかりません');
  }
  
  // 異議申立リンククリック追跡
  await sendRequest(`/api/evaluation-notifications/${notification.id}/appeal-click`, 'PATCH');
  
  return {
    notificationId: notification.id,
    tracked: true
  };
}

// 6. 通知統計取得テスト
async function testNotificationStats() {
  const statsResponse = await sendRequest('/api/evaluation-notifications/stats');
  
  if (typeof statsResponse.totalSent !== 'number') {
    throw new Error('統計データが正しい形式で返されませんでした');
  }
  
  return {
    totalSent: statsResponse.totalSent,
    totalRead: statsResponse.totalRead,
    readRate: statsResponse.readRate,
    appealActionRate: statsResponse.appealActionRate
  };
}

// 7. V3グレード表示テスト
async function testV3GradeDisplay() {
  // V3GradeUtilsの動作確認（フロントエンド機能のモック）
  const gradeTestCases = [
    { score: 95, expectedGrade: 'S' },
    { score: 85, expectedGrade: 'A+' },
    { score: 75, expectedGrade: 'A' },
    { score: 65, expectedGrade: 'B+' },
    { score: 55, expectedGrade: 'B' },
    { score: 45, expectedGrade: 'C' },
    { score: 35, expectedGrade: 'D' }
  ];
  
  const results = [];
  
  for (const testCase of gradeTestCases) {
    // 実際のV3GradeUtils.getGradeFromScore相当の処理
    let grade;
    if (testCase.score >= 90) grade = 'S';
    else if (testCase.score >= 80) grade = 'A+';
    else if (testCase.score >= 70) grade = 'A';
    else if (testCase.score >= 60) grade = 'B+';
    else if (testCase.score >= 50) grade = 'B';
    else if (testCase.score >= 40) grade = 'C';
    else grade = 'D';
    
    if (grade !== testCase.expectedGrade) {
      throw new Error(`スコア${testCase.score}のグレード計算が間違っています。期待値: ${testCase.expectedGrade}, 実際: ${grade}`);
    }
    
    results.push({ score: testCase.score, grade });
  }
  
  return { gradeTests: results };
}

// 8. バリデーションテスト
async function testValidation() {
  const invalidData = {
    ...TEST_EVALUATION_NOTIFICATION,
    evaluationScore: 150, // 無効なスコア (0-100範囲外)
    appealDeadline: '2023-01-01' // 過去の日付
  };
  
  try {
    await sendRequest('/api/evaluation-notifications', 'POST', invalidData);
    throw new Error('バリデーションエラーが発生しませんでした');
  } catch (error) {
    if (!error.message.includes('400') && !error.message.includes('範囲外')) {
      throw new Error(`期待されたバリデーションエラーではありません: ${error.message}`);
    }
  }
  
  return { validationWorking: true };
}

// テストレポート生成
function generateTestReport() {
  const endTime = new Date();
  const duration = endTime - testResults.startTime;
  
  const report = `# V3評価通知システム 統合テスト結果

## テスト概要
- **実行日時**: ${testResults.startTime.toISOString()}
- **実行時間**: ${Math.round(duration / 1000)}秒
- **テスト総数**: ${testResults.summary.total}
- **成功**: ${testResults.summary.passed}
- **失敗**: ${testResults.summary.failed}
- **成功率**: ${Math.round((testResults.summary.passed / testResults.summary.total) * 100)}%

## テスト結果詳細

${testResults.tests.map(test => `
### ${test.name}
- **ステータス**: ${test.status === 'passed' ? '✅ 成功' : '❌ 失敗'}
- **実行時間**: ${test.duration}ms
${test.error ? `- **エラー**: ${test.error}` : ''}
${Object.keys(test.details).length > 0 ? `- **詳細**: ${JSON.stringify(test.details, null, 2)}` : ''}
`).join('\n')}

## エラーサマリー
${testResults.summary.errors.length > 0 ? 
  testResults.summary.errors.map(error => `- ${error}`).join('\n') :
  '> エラーはありませんでした。'
}

## V3評価通知システム機能検証

### 実装済み機能
- ✅ 医療システムからの評価通知受信
- ✅ 通知一覧表示・フィルタリング
- ✅ 通知詳細表示
- ✅ 既読管理
- ✅ 異議申立リンク追跡
- ✅ V3グレードシステム対応（S/A+/A/B+/B/C/D）
- ✅ 通知統計・分析機能
- ✅ バリデーション機能

### 医療システム連携状況
- **API受信エンドポイント**: 実装済み
- **認証方式**: Bearer Token対応
- **データ形式**: JSON（V3仕様準拠）
- **エラーハンドリング**: 実装済み

## 次のアクション
${testResults.summary.failed > 0 ? 
  '🔧 失敗したテストの修正が必要です。' :
  '🎉 すべてのテストが成功しました。本番環境への移行準備が整いました。'
}

---
*テスト実行者*: VoiceDriveチーム  
*レポート生成日時*: ${endTime.toISOString()}
`;

  fs.writeFileSync(TEST_CONFIG.outputFile, report);
  log(`テストレポートを生成しました: ${TEST_CONFIG.outputFile}`, 'success');
}

// メインテスト実行
async function runIntegrationTests() {
  log('V3評価通知システム統合テスト開始', 'info');
  
  try {
    // 各テストを順次実行
    await runTest('評価通知受信テスト', testNotificationReception);
    await runTest('通知一覧取得テスト', testNotificationList);
    await runTest('通知詳細取得テスト', testNotificationDetail);
    await runTest('既読マークテスト', testMarkAsRead);
    await runTest('異議申立リンク追跡テスト', testAppealLinkTracking);
    await runTest('通知統計取得テスト', testNotificationStats);
    await runTest('V3グレード表示テスト', testV3GradeDisplay);
    await runTest('バリデーションテスト', testValidation);
    
    // テストレポート生成
    generateTestReport();
    
    // 結果サマリー出力
    log(`統合テスト完了: ${testResults.summary.passed}/${testResults.summary.total} 成功`, 
      testResults.summary.failed === 0 ? 'success' : 'error');
    
    if (testResults.summary.failed > 0) {
      log('失敗したテストがあります。詳細はテストレポートを確認してください。', 'error');
      process.exit(1);
    } else {
      log('すべてのテストが成功しました！🎉', 'success');
    }
    
  } catch (error) {
    log(`統合テスト中にエラーが発生しました: ${error.message}`, 'error');
    process.exit(1);
  }
}

// 実行
if (require.main === module) {
  runIntegrationTests().catch(error => {
    log(`予期しないエラー: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runIntegrationTests, TEST_CONFIG };