/**
 * V3評価システム 異議申し立て機能統合テストスクリプト
 * 実行日: 2025年8月20日
 * V3対応: 100点満点システム・7段階グレード
 */

import axios from 'axios';
import colors from 'colors';
import { promises as fs } from 'fs';
import path from 'path';

// V3テスト環境設定
const V3_CONFIG = {
  VOICEDRIVE_API: process.env.VOICEDRIVE_API || 'http://localhost:5173',
  MEDICAL_API: process.env.MEDICAL_API || 'http://localhost:8080',
  AUTH_TOKEN: process.env.AUTH_TOKEN || 'test-token-12345',
  API_VERSION: 'v3',
  LOG_FILE: 'v3-test-results-' + new Date().toISOString().split('T')[0] + '.json'
};

// V3テスト結果記録
const v3TestResults = {
  startTime: new Date().toISOString(),
  version: 'v3.0.0',
  systemType: '100-point-evaluation',
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// V3 APIクライアント設定
const v3MedicalApiClient = axios.create({
  baseURL: V3_CONFIG.MEDICAL_API,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${V3_CONFIG.AUTH_TOKEN}`
  },
  timeout: 10000
});

// V3グレード計算
function getV3Grade(score) {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A+';
  if (score >= 70) return 'A';
  if (score >= 60) return 'B+';
  if (score >= 50) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

// テスト結果記録
function recordTestResult(testName, status, details = {}) {
  const result = {
    testName,
    status,
    timestamp: new Date().toISOString(),
    details
  };
  
  v3TestResults.tests.push(result);
  v3TestResults.summary.total++;
  
  if (status === 'passed') {
    v3TestResults.summary.passed++;
  } else if (status === 'failed') {
    v3TestResults.summary.failed++;
  } else if (status === 'skipped') {
    v3TestResults.summary.skipped++;
  }
  
  return result;
}

// テスト1: V3評価期間マスタデータ取得
async function testV3EvaluationPeriods() {
  console.log('\\n📋 テスト: V3評価期間マスタデータ取得（100点満点システム）'.cyan);
  
  try {
    const response = await v3MedicalApiClient.get('/api/v3/evaluation/periods');
    const data = response.data;
    
    // V3レスポンス構造検証
    if (data.success && data.version === 'v3.0.0' && data.systemType === '100-point-evaluation') {
      console.log('  ✅ V3システム確認:'.green, `バージョン ${data.version}`);
      console.log('  ✅ 評価システム:'.green, data.systemType);
      console.log('  ✅ 取得成功:'.green, `${data.periods.length}件のV3評価期間`);
      
      // 7段階グレードシステム検証
      const period = data.periods[0];
      if (period.evaluationSystem && period.evaluationSystem.gradeSystem === '7-tier') {
        console.log('  ✅ グレードシステム:'.green, '7段階グレード確認');
        console.log('  ✅ グレードラベル:'.green, period.evaluationSystem.gradeLabels.join(', '));
      }
      
      recordTestResult('V3評価期間取得', 'passed', { periodsCount: data.periods.length, version: data.version });
      return data.periods.filter(p => new Date(p.appealDeadline) > new Date());
    } else {
      throw new Error('V3システムレスポンス形式が不正です');
    }
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.message);
    recordTestResult('V3評価期間取得', 'failed', { error: error.message });
    return null;
  }
}

// テスト2: V3高優先度異議申し立て（計算誤り・100点満点）
async function testV3HighPriorityAppeal(activePeriods) {
  if (!activePeriods || activePeriods.length === 0) {
    console.log('\\n⏭️  スキップ: V3評価期間が取得できないため'.yellow);
    recordTestResult('V3高優先度異議申し立て', 'skipped', { reason: 'No active periods' });
    return null;
  }
  
  console.log('\\n🔴 テスト: V3高優先度異議申し立て（計算誤り・100点満点）'.cyan);
  
  const v3AppealData = {
    employeeId: 'V3-TEST-E001',
    employeeName: 'V3テスト太郎',
    evaluationPeriod: activePeriods[0].id,
    appealCategory: 'calculation_error',
    appealReason: 'V3評価システム（100点満点）において計算誤りが発見されました。研修講師実績10回が0回として計算されており、正確なスコア計算をお願いします。添付の研修実施記録をご確認ください。',
    originalScore: 68,      // B+グレード
    requestedScore: 94,     // Sグレード（26点差で高優先度）
    evidenceDocuments: ['v3-training-record.pdf', 'v3-performance-log.xlsx']
  };
  
  try {
    const response = await v3MedicalApiClient.post('/api/v3/appeals', v3AppealData);
    const data = response.data;
    
    if (data.success && data.version === 'v3.0.0') {
      console.log('  ✅ V3送信成功:'.green, data.appealId);
      console.log('  ✅ 優先度:'.green, data.details.priority, '（期待値: high）');
      console.log('  ✅ スコア差:'.green, `${data.details.scoreDifference}点`);
      console.log('  ✅ グレード変更:'.green, `${data.details.grade.current} → ${data.details.grade.requested}`);
      console.log('  ✅ 評価システム:'.green, data.details.evaluationSystem);
      console.log('  ✅ 期待応答日:'.green, data.expectedResponseDate);
      
      recordTestResult('V3高優先度異議申し立て', 'passed', { 
        appealId: data.appealId, 
        priority: data.details.priority,
        scoreDiff: data.details.scoreDifference,
        gradeChange: `${data.details.grade.current} → ${data.details.grade.requested}`
      });
      return data.appealId;
    } else {
      throw new Error('V3レスポンス形式が不正です');
    }
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTestResult('V3高優先度異議申し立て', 'failed', { error: error.message });
    return null;
  }
}

// テスト3: V3中優先度異議申し立て（成果見落とし）
async function testV3MediumPriorityAppeal(activePeriods) {
  if (!activePeriods || activePeriods.length === 0) {
    console.log('\\n⏭️  スキップ: V3評価期間が取得できないため'.yellow);
    recordTestResult('V3中優先度異議申し立て', 'skipped', { reason: 'No active periods' });
    return null;
  }
  
  console.log('\\n🟡 テスト: V3中優先度異議申し立て（成果見落とし・7段階グレード）'.cyan);
  
  const v3AppealData = {
    employeeId: 'V3-TEST-E002',
    employeeName: 'V3テスト花子',
    evaluationPeriod: activePeriods[0].id,
    appealCategory: 'achievement_oversight',
    appealReason: 'V3評価システムにおいて、今期実施した改善提案プロジェクト3件が評価に反映されていません。100点満点システムでの正確な評価をお願いします。各プロジェクトは部門効率化に貢献し、年間300万円のコスト削減を実現しました。',
    originalScore: 72,      // Aグレード  
    requestedScore: 83,     // A+グレード（11点差で中優先度）
    evidenceDocuments: ['v3-project1.pdf', 'v3-project2.pdf', 'v3-cost-analysis.xlsx']
  };
  
  try {
    const response = await v3MedicalApiClient.post('/api/v3/appeals', v3AppealData);
    const data = response.data;
    
    if (data.success && data.version === 'v3.0.0') {
      console.log('  ✅ V3送信成功:'.green, data.appealId);
      console.log('  ✅ 優先度:'.green, data.details.priority, '（期待値: medium）');
      console.log('  ✅ グレード変更:'.green, `${data.details.grade.current} → ${data.details.grade.requested}`);
      
      recordTestResult('V3中優先度異議申し立て', 'passed', { appealId: data.appealId });
      return data.appealId;
    } else {
      throw new Error('V3レスポンス形式が不正です');
    }
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTestResult('V3中優先度異議申し立て', 'failed', { error: error.message });
    return null;
  }
}

// テスト4: V3低優先度異議申し立て
async function testV3LowPriorityAppeal(activePeriods) {
  if (!activePeriods || activePeriods.length === 0) {
    console.log('\\n⏭️  スキップ: V3評価期間が取得できないため'.yellow);
    recordTestResult('V3低優先度異議申し立て', 'skipped', { reason: 'No active periods' });
    return null;
  }
  
  console.log('\\n🟢 テスト: V3低優先度異議申し立て（その他・100点満点）'.cyan);
  
  const v3AppealData = {
    employeeId: 'V3-TEST-E003',
    employeeName: 'V3テスト次郎',
    evaluationPeriod: activePeriods[0].id,
    appealCategory: 'other',
    appealReason: 'V3評価システムでの評価結果について再検討をお願いします。100点満点システムにおいて、チームワークとコミュニケーション能力の評価が実際のパフォーマンスと若干異なると感じています。7段階グレードでの適切な評価を希望します。',
    originalScore: 76,      // Aグレード
    requestedScore: 81,     // A+グレード（5点差で低優先度）
  };
  
  try {
    const response = await v3MedicalApiClient.post('/api/v3/appeals', v3AppealData);
    const data = response.data;
    
    if (data.success && data.version === 'v3.0.0') {
      console.log('  ✅ V3送信成功:'.green, data.appealId);
      console.log('  ✅ 優先度:'.green, data.details.priority, '（期待値: low）');
      console.log('  ✅ グレードシステム:'.green, data.details.gradingSystem);
      
      recordTestResult('V3低優先度異議申し立て', 'passed', { appealId: data.appealId });
      return data.appealId;
    } else {
      throw new Error('V3レスポンス形式が不正です');
    }
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTestResult('V3低優先度異議申し立て', 'failed', { error: error.message });
    return null;
  }
}

// テスト5: V3審査者割り当て確認
async function testV3ReviewerAssignment(appealId) {
  if (!appealId) {
    console.log('\\n⏭️  スキップ: V3 appealIdがないため'.yellow);
    recordTestResult('V3審査者割り当て', 'skipped', { reason: 'No appeal ID' });
    return;
  }
  
  console.log('\\n👤 テスト: V3審査者割り当て確認'.cyan);
  
  try {
    const response = await v3MedicalApiClient.get(`/api/v3/appeals/${appealId}/status`);
    const data = response.data;
    
    if (data.success && data.version === 'v3.0.0') {
      console.log('  ✅ V3ステータス確認:'.green, data.status);
      console.log('  ✅ 審査者割り当て:'.green, data.assignedReviewer.name);
      console.log('  ✅ ワークフロー:'.green, `${data.workflow.currentStep}/${data.workflow.totalSteps}ステップ`);
      console.log('  ✅ 評価システム:'.green, data.evaluationDetails.systemVersion);
      
      recordTestResult('V3審査者割り当て', 'passed', { 
        reviewer: data.assignedReviewer.name,
        workflow: `${data.workflow.currentStep}/${data.workflow.totalSteps}`
      });
    } else {
      throw new Error('V3ステータス応答が不正です');
    }
    
  } catch (error) {
    console.log('  ❌ 失敗:'.red, error.response?.data?.error?.message || error.message);
    recordTestResult('V3審査者割り当て', 'failed', { error: error.message });
  }
}

// テスト6: V3バリデーションエラー
async function testV3ValidationErrors() {
  console.log('\\n📝 テスト: V3バリデーションエラー（100点満点範囲外）'.cyan);
  
  const invalidV3Data = {
    employeeId: 'V3-TEST-E004',
    evaluationPeriod: '2025-H1-V3',
    appealReason: '短い理由',  // 100文字未満
    originalScore: 150,       // 100点満点を超過
    requestedScore: 200       // 100点満点を超過
  };
  
  try {
    const response = await v3MedicalApiClient.post('/api/v3/appeals', invalidV3Data);
    
    console.log('  ❌ 失敗:'.red, 'V3バリデーションエラーが発生しませんでした');
    recordTestResult('V3バリデーションエラー', 'failed', { error: 'No validation error occurred' });
    
  } catch (error) {
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.error?.code === 'V3_VALIDATION_ERROR') {
        console.log('  ✅ 期待通りのV3エラー:'.green, errorData.error.code);
        console.log('  ✅ エラーメッセージ:'.green, errorData.error.message);
        recordTestResult('V3バリデーションエラー', 'passed', { errorCode: errorData.error.code });
      } else {
        console.log('  ❌ 予期しないエラー:'.red, errorData.error?.message);
        recordTestResult('V3バリデーションエラー', 'failed', { error: errorData.error?.message });
      }
    } else {
      console.log('  ❌ 予期しないエラー:'.red, error.message);
      recordTestResult('V3バリデーションエラー', 'failed', { error: error.message });
    }
  }
}

// V3統合テスト実行
async function runV3IntegrationTests() {
  console.log('========================================'.cyan);
  console.log(' V3評価システム 異議申し立て統合テスト '.bgCyan.black);
  console.log('========================================'.cyan);
  console.log('開始時刻:', new Date().toLocaleString());
  console.log('V3 Medical API:', V3_CONFIG.MEDICAL_API);
  console.log('VoiceDrive API:', V3_CONFIG.VOICEDRIVE_API);
  console.log('API Version:', V3_CONFIG.API_VERSION);
  console.log('System Type: 100点満点・7段階グレード');
  console.log('');

  let activePeriods = null;
  let highPriorityAppealId = null;

  try {
    // テスト実行
    activePeriods = await testV3EvaluationPeriods();
    highPriorityAppealId = await testV3HighPriorityAppeal(activePeriods);
    await testV3MediumPriorityAppeal(activePeriods);
    await testV3LowPriorityAppeal(activePeriods);
    await testV3ReviewerAssignment(highPriorityAppealId);
    await testV3ValidationErrors();

  } catch (error) {
    console.error('\\n致命的エラー:'.red, error.message);
    recordTestResult('V3統合テスト', 'failed', { error: error.message });
  }

  // 結果保存
  const resultsDir = path.join(process.cwd(), 'test', 'results');
  try {
    await fs.mkdir(resultsDir, { recursive: true });
    const resultsPath = path.join(resultsDir, V3_CONFIG.LOG_FILE);
    await fs.writeFile(resultsPath, JSON.stringify(v3TestResults, null, 2));
    console.log('\\n📊 V3結果保存:'.cyan, resultsPath);
  } catch (error) {
    console.error('結果保存エラー:', error.message);
  }

  console.log('\\n========================================'.cyan);
  console.log(' V3テスト結果サマリー '.bgCyan.black);
  console.log('========================================'.cyan);
  console.log('システム:'.white, 'V3評価システム (100点満点・7段階グレード)');
  console.log('総テスト数:'.white, v3TestResults.summary.total);
  console.log('✅ 成功:'.green, v3TestResults.summary.passed);
  console.log('❌ 失敗:'.red, v3TestResults.summary.failed);
  console.log('⏭️  スキップ:'.yellow, v3TestResults.summary.skipped);
  
  const successRate = v3TestResults.summary.total > 0 ? 
    ((v3TestResults.summary.passed / v3TestResults.summary.total) * 100).toFixed(1) : 0;
  console.log('V3成功率:'.white, successRate + '%');

  // 終了コード
  process.exit(v3TestResults.summary.failed > 0 ? 1 : 0);
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  runV3IntegrationTests().catch(console.error);
}

export { runV3IntegrationTests };