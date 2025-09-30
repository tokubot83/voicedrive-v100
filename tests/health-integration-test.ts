/**
 * 健康データ連携統合テスト
 * 医療職員管理システムとの連携をテスト
 */

import fs from 'fs';
import path from 'path';
import {
  HealthNotification,
  HealthReport,
  HealthCheckupData
} from '../src/types/health-notifications';
import {
  getHealthNotificationHandler
} from '../src/services/healthNotificationHandler';
import {
  getHealthNotificationWatcher
} from '../src/services/healthNotificationWatcher';
import {
  getAdminNotificationService
} from '../src/services/adminNotificationService';

/**
 * テストデータ生成
 */
function generateTestHealthData(): HealthCheckupData {
  return {
    bmi: 26.5,
    bloodPressureSystolic: 145,
    bloodPressureDiastolic: 92,
    ldlCholesterol: 150,
    hdlCholesterol: 38,
    triglycerides: 180,
    bloodGlucose: 115,
    hba1c: 6.2,
    ast: 45,
    alt: 52,
    gammaGtp: 68,
    age: 48,
    gender: 'male',
    smokingStatus: 'current',
    drinkingFrequency: 'regular'
  };
}

/**
 * テスト用通知を生成
 */
function generateTestNotification(
  staffId: string,
  overallScore: number,
  overallLevel: 'low' | 'medium' | 'high' | 'very-high'
): HealthNotification {
  return {
    type: 'health_risk_assessment',
    staffId,
    timestamp: new Date().toISOString(),
    assessment: {
      overallScore,
      overallLevel,
      highRiskCategories: [
        {
          category: '代謝リスク',
          score: 65,
          level: 'high'
        },
        {
          category: '心血管リスク',
          score: 70,
          level: 'high'
        }
      ],
      priorityActions: [
        '禁煙外来の受診',
        '減塩食の開始',
        '有酸素運動の実施'
      ],
      nextCheckup: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    recommendations: {
      lifestyle: ['禁煙プログラムへの参加', '適度な運動習慣の確立'],
      diet: ['塩分制限（1日6g以下）', '野菜摂取量の増加'],
      exercise: ['週3回30分以上の有酸素運動', 'ウォーキングの習慣化'],
      medicalFollowUp: ['3ヶ月後の再検査', '必要に応じて降圧薬の検討']
    },
    metadata: {
      source: 'staff-medical-system',
      version: '1.0.0',
      priority: overallLevel === 'very-high' ? 'urgent' : overallLevel === 'high' ? 'high' : 'medium'
    }
  };
}

/**
 * テスト1: 通知ファイルの検知
 */
async function test1_NotificationDetection() {
  console.log('\n=== テスト1: 通知ファイルの検知 ===');

  const notificationsPath = path.join(process.cwd(), 'mcp-shared', 'notifications');

  // テスト通知を作成
  const testNotification = generateTestNotification('TEST001', 65, 'high');
  const filename = `health_notif_test_${Date.now()}.json`;
  const filePath = path.join(notificationsPath, filename);

  fs.writeFileSync(filePath, JSON.stringify(testNotification, null, 2));
  console.log(`✓ テスト通知ファイルを作成: ${filename}`);

  // ハンドラーで検知
  const handler = getHealthNotificationHandler();
  const notifications = handler.detectNewNotifications();

  const detected = notifications.find(n => n.filename === filename);
  if (detected) {
    console.log(`✓ 通知ファイルを検知しました`);
    console.log(`  - ファイル名: ${detected.filename}`);
    console.log(`  - 作成日時: ${detected.createdAt.toISOString()}`);
  } else {
    console.error('✗ 通知ファイルの検知に失敗しました');
  }
}

/**
 * テスト2: 通知の処理
 */
async function test2_NotificationProcessing() {
  console.log('\n=== テスト2: 通知の処理 ===');

  const notificationsPath = path.join(process.cwd(), 'mcp-shared', 'notifications');

  // テスト通知を作成
  const testNotification = generateTestNotification('TEST002', 80, 'very-high');
  const filename = `health_notif_test_${Date.now()}.json`;
  const filePath = path.join(notificationsPath, filename);

  fs.writeFileSync(filePath, JSON.stringify(testNotification, null, 2));
  console.log(`✓ テスト通知ファイルを作成: ${filename}`);

  // 通知を処理
  const handler = getHealthNotificationHandler();
  const stats = fs.statSync(filePath);
  const notificationFile = {
    filename,
    path: filePath,
    createdAt: stats.birthtime,
    processed: false
  };

  const result = await handler.processNotification(notificationFile);

  if (result.success) {
    console.log(`✓ 通知処理成功`);
    console.log(`  - 職員ID: ${result.staffId}`);
    console.log(`  - 処理日時: ${result.processedAt}`);
    console.log(`  - 実行アクション:`);
    result.actions.forEach(action => console.log(`    - ${action}`));
  } else {
    console.error('✗ 通知処理に失敗しました');
    console.error(`  - エラー: ${result.error}`);
  }
}

/**
 * テスト3: 優先度別処理
 */
async function test3_PriorityProcessing() {
  console.log('\n=== テスト3: 優先度別処理 ===');

  const handler = getHealthNotificationHandler();
  const notificationsPath = path.join(process.cwd(), 'mcp-shared', 'notifications');

  const testCases = [
    { priority: 'low', score: 85, level: 'low' as const },
    { priority: 'medium', score: 70, level: 'medium' as const },
    { priority: 'high', score: 55, level: 'high' as const },
    { priority: 'urgent', score: 30, level: 'very-high' as const }
  ];

  for (const testCase of testCases) {
    const testNotification = generateTestNotification(
      `TEST_${testCase.priority.toUpperCase()}`,
      testCase.score,
      testCase.level
    );
    const filename = `health_notif_${testCase.priority}_${Date.now()}.json`;
    const filePath = path.join(notificationsPath, filename);

    fs.writeFileSync(filePath, JSON.stringify(testNotification, null, 2));

    const stats = fs.statSync(filePath);
    const notificationFile = {
      filename,
      path: filePath,
      createdAt: stats.birthtime,
      processed: false
    };

    const result = await handler.processNotification(notificationFile);

    if (result.success) {
      console.log(`✓ ${testCase.priority}優先度の処理成功`);
      console.log(`  - スコア: ${testCase.score}点`);
      console.log(`  - レベル: ${testCase.level}`);
    } else {
      console.error(`✗ ${testCase.priority}優先度の処理失敗`);
    }

    // 少し待つ
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * テスト4: 管理者通知
 */
async function test4_AdminNotification() {
  console.log('\n=== テスト4: 管理者通知 ===');

  const adminService = getAdminNotificationService({
    urgentTargets: [
      { name: '管理者A', email: 'admin-a@example.com', userId: 'ADMIN001' }
    ],
    highTargets: [
      { name: '管理者B', email: 'admin-b@example.com', userId: 'ADMIN002' }
    ],
    enableEmail: true,
    enableSlack: false,
    enableInApp: true
  });

  // urgent優先度の通知
  const urgentNotification = generateTestNotification('TEST_URGENT', 25, 'very-high');
  console.log('\n【urgent優先度の通知テスト】');
  const urgentResults = await adminService.notifyAdmins(urgentNotification, 'urgent');
  console.log(`通知送信結果: ${urgentResults.length}件`);
  urgentResults.forEach(r => {
    console.log(`  - ${r.method}: ${r.success ? '成功' : '失敗'} (${r.target.name})`);
  });

  // high優先度の通知
  const highNotification = generateTestNotification('TEST_HIGH', 55, 'high');
  console.log('\n【high優先度の通知テスト】');
  const highResults = await adminService.notifyAdmins(highNotification, 'high');
  console.log(`通知送信結果: ${highResults.length}件`);
  highResults.forEach(r => {
    console.log(`  - ${r.method}: ${r.success ? '成功' : '失敗'} (${r.target.name})`);
  });
}

/**
 * テスト5: レポートアクセス
 */
async function test5_ReportAccess() {
  console.log('\n=== テスト5: レポートアクセス ===');

  const reportsPath = path.join(process.cwd(), 'mcp-shared', 'reports', 'health');

  // テストレポートを作成
  const testReport: HealthReport = {
    reportId: `report_test_${Date.now()}`,
    staffId: 'TEST003',
    reportType: 'individual',
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    summary: {
      totalStaff: 1,
      averageScore: 65,
      highRiskCount: 1,
      actionRequiredCount: 1
    },
    data: {
      healthTrends: '改善傾向',
      recommendations: '継続的な健康管理が必要'
    },
    generatedAt: new Date().toISOString(),
    format: 'json'
  };

  const reportFilePath = path.join(reportsPath, `${testReport.reportId}.json`);
  fs.writeFileSync(reportFilePath, JSON.stringify(testReport, null, 2));
  console.log(`✓ テストレポートを作成: ${testReport.reportId}.json`);

  // Markdownレポートも作成
  const mdContent = `# 健康レポート

## 基本情報
- レポートID: ${testReport.reportId}
- 職員ID: ${testReport.staffId}
- 期間: ${new Date(testReport.period.start).toLocaleDateString('ja-JP')} - ${new Date(testReport.period.end).toLocaleDateString('ja-JP')}

## サマリー
- 平均スコア: ${testReport.summary.averageScore}点
- 高リスク者数: ${testReport.summary.highRiskCount}名
- 要対応者数: ${testReport.summary.actionRequiredCount}名

## データ
${JSON.stringify(testReport.data, null, 2)}
`;

  const mdFilePath = path.join(reportsPath, `${testReport.reportId}.md`);
  fs.writeFileSync(mdFilePath, mdContent);
  console.log(`✓ Markdownレポートを作成: ${testReport.reportId}.md`);

  // レポートを読み込み
  if (fs.existsSync(reportFilePath) && fs.existsSync(mdFilePath)) {
    console.log('✓ レポートファイルの読み込みに成功しました');
    const jsonData = JSON.parse(fs.readFileSync(reportFilePath, 'utf-8'));
    const mdData = fs.readFileSync(mdFilePath, 'utf-8');
    console.log(`  - JSONフォーマット: ${Object.keys(jsonData).length}個のフィールド`);
    console.log(`  - Markdownフォーマット: ${mdData.split('\n').length}行`);
  } else {
    console.error('✗ レポートファイルの読み込みに失敗しました');
  }
}

/**
 * テスト6: ログ記録の確認
 */
async function test6_LogVerification() {
  console.log('\n=== テスト6: ログ記録の確認 ===');

  const logsPath = path.join(process.cwd(), 'mcp-shared', 'logs', 'health-notifications.log');

  if (fs.existsSync(logsPath)) {
    const logs = fs.readFileSync(logsPath, 'utf-8');
    const logLines = logs.trim().split('\n').filter(line => line);

    console.log(`✓ ログファイルを確認しました`);
    console.log(`  - ログエントリ数: ${logLines.length}件`);

    if (logLines.length > 0) {
      console.log(`  - 最新のログ:`);
      const latestLog = JSON.parse(logLines[logLines.length - 1]);
      console.log(`    - 日時: ${latestLog.timestamp}`);
      console.log(`    - 職員ID: ${latestLog.staffId || 'N/A'}`);
      console.log(`    - タイプ: ${latestLog.type || latestLog.level || 'N/A'}`);
    }
  } else {
    console.log('ℹ ログファイルはまだ作成されていません');
  }
}

/**
 * すべてのテストを実行
 */
async function runAllTests() {
  console.log('\n');
  console.log('==========================================');
  console.log('  健康データ連携 統合テスト');
  console.log('==========================================');

  try {
    await test1_NotificationDetection();
    await test2_NotificationProcessing();
    await test3_PriorityProcessing();
    await test4_AdminNotification();
    await test5_ReportAccess();
    await test6_LogVerification();

    console.log('\n==========================================');
    console.log('  すべてのテストが完了しました');
    console.log('==========================================\n');

    // 統計情報を表示
    const handler = getHealthNotificationHandler();
    const stats = handler.getStatistics();
    console.log('【統計情報】');
    console.log(`  - 総通知数: ${stats.total}件`);
    console.log(`  - 処理済み: ${stats.processed}件`);
    console.log(`  - 未処理: ${stats.pending}件`);
  } catch (error) {
    console.error('\n✗ テスト実行中にエラーが発生しました:', error);
  }
}

// テストを実行
runAllTests().catch(console.error);

export {
  runAllTests,
  test1_NotificationDetection,
  test2_NotificationProcessing,
  test3_PriorityProcessing,
  test4_AdminNotification,
  test5_ReportAccess,
  test6_LogVerification
};