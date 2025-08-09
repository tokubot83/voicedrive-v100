/**
 * 統合テスト実行スクリプト
 * 医療職員管理システムとの連携テストを実行
 */

import { IntegrationTestClient } from './apiClient';

// テスト結果を格納する構造
interface TestResult {
  scenario: string;
  testName: string;
  success: boolean;
  message?: string;
  error?: string;
}

class IntegrationTestRunner {
  private client: IntegrationTestClient;
  private results: TestResult[] = [];
  private startTime: Date;
  
  constructor() {
    this.client = new IntegrationTestClient('http://localhost:3000');
    this.startTime = new Date();
  }
  
  async runAllTests() {
    console.log('🚀 統合テスト開始');
    console.log(`開始時刻: ${this.startTime.toISOString()}`);
    console.log('-----------------------------------\n');
    
    // ヘルスチェック
    await this.checkHealth();
    
    // シナリオ1: カテゴリ不要な面談
    await this.testScenario1();
    
    // シナリオ2: カテゴリ必須な面談
    await this.testScenario2();
    
    // シナリオ3: エラーケース
    await this.testScenario3();
    
    // シナリオ4-5: 一覧取得・削除
    await this.testScenario4And5();
    
    // レポート生成
    this.generateReport();
  }
  
  private async checkHealth() {
    console.log('📡 ヘルスチェック...');
    const isHealthy = await this.client.healthCheck();
    if (isHealthy) {
      console.log('✅ APIサーバーは正常に動作しています\n');
    } else {
      console.log('❌ APIサーバーに接続できません\n');
      console.log('テストを中断します。');
      process.exit(1);
    }
  }
  
  private async testScenario1() {
    console.log('📋 シナリオ1: カテゴリ不要な面談の予約テスト');
    
    // 1.1 定期面談
    const test1 = await this.client.createBooking({
      employeeId: 'E001',
      employeeName: '山田太郎',
      employeeEmail: 'yamada@example.com',
      facility: '小原病院',
      department: '内科',
      position: '看護師',
      interviewType: 'regular_annual',
      bookingDate: '2024-12-25',
      startTime: '10:00',
      endTime: '11:00',
      requestedTopics: ['年間振り返り', '来年度目標'],
      urgencyLevel: 'medium'
    });
    
    this.recordResult('シナリオ1', '定期面談（regular_annual）', test1.success, test1.message);
    
    // 1.2 特別面談
    const test2 = await this.client.createBooking({
      employeeId: 'E002',
      employeeName: '佐藤花子',
      employeeEmail: 'sato@example.com',
      facility: '小原病院',
      department: '外科',
      position: '医師',
      interviewType: 'return_to_work',
      bookingDate: '2024-12-26',
      startTime: '14:00',
      endTime: '15:00',
      requestedTopics: ['復職準備', '業務調整'],
      urgencyLevel: 'high'
    });
    
    this.recordResult('シナリオ1', '特別面談（return_to_work）', test2.success, test2.message);
    
    // 1.3 フィードバック面談
    const test3 = await this.client.createBooking({
      employeeId: 'E003',
      employeeName: '鈴木一郎',
      employeeEmail: 'suzuki@example.com',
      facility: '小原病院',
      department: '管理部',
      position: '事務員',
      interviewType: 'feedback',
      bookingDate: '2024-12-27',
      startTime: '16:00',
      endTime: '16:30',
      requestedTopics: ['業務改善提案'],
      urgencyLevel: 'low'
    });
    
    this.recordResult('シナリオ1', 'フィードバック面談（feedback）', test3.success, test3.message);
    
    console.log('');
  }
  
  private async testScenario2() {
    console.log('📋 シナリオ2: カテゴリ必須な面談の予約テスト');
    
    // 2.1 キャリア系面談
    const test1 = await this.client.createBooking({
      employeeId: 'E004',
      employeeName: '田中美香',
      employeeEmail: 'tanaka@example.com',
      facility: '小原病院',
      department: '看護部',
      position: '主任看護師',
      interviewType: 'career_support',
      interviewCategory: 'career_path',
      bookingDate: '2024-12-28',
      startTime: '13:00',
      endTime: '14:00',
      requestedTopics: ['キャリアプラン', '昇進準備'],
      urgencyLevel: 'medium'
    });
    
    this.recordResult('シナリオ2', 'キャリア系面談（career_support）', test1.success, test1.message);
    
    // 2.2 職場環境系面談
    const test2 = await this.client.createBooking({
      employeeId: 'E005',
      employeeName: '高橋健太',
      employeeEmail: 'takahashi@example.com',
      facility: '小原病院',
      department: 'リハビリ科',
      position: '理学療法士',
      interviewType: 'workplace_support',
      interviewCategory: 'work_environment',
      bookingDate: '2024-12-29',
      startTime: '11:00',
      endTime: '12:00',
      requestedTopics: ['職場環境改善', '設備要望'],
      urgencyLevel: 'medium'
    });
    
    this.recordResult('シナリオ2', '職場環境系面談（workplace_support）', test2.success, test2.message);
    
    // 2.3 個別相談面談
    const test3 = await this.client.createBooking({
      employeeId: 'E006',
      employeeName: '渡辺由美',
      employeeEmail: 'watanabe@example.com',
      facility: '小原病院',
      department: '薬剤部',
      position: '薬剤師',
      interviewType: 'individual_consultation',
      interviewCategory: 'other',
      bookingDate: '2024-12-30',
      startTime: '15:00',
      endTime: '16:00',
      requestedTopics: ['個人的な相談'],
      urgencyLevel: 'high'
    });
    
    this.recordResult('シナリオ2', '個別相談面談（individual_consultation）', test3.success, test3.message);
    
    console.log('');
  }
  
  private async testScenario3() {
    console.log('📋 シナリオ3: エラーケースのテスト');
    
    // 3.1 カテゴリが必須なのに未提供
    const test1 = await this.client.createBooking({
      employeeId: 'E007',
      employeeName: '中村太一',
      employeeEmail: 'nakamura@example.com',
      facility: '小原病院',
      department: '検査部',
      position: '臨床検査技師',
      interviewType: 'career_support',
      // interviewCategory を意図的に省略
      bookingDate: '2024-12-31',
      startTime: '10:00',
      endTime: '11:00',
      requestedTopics: ['スキル開発'],
      urgencyLevel: 'medium'
    });
    
    this.recordResult(
      'シナリオ3', 
      'カテゴリ未提供エラー', 
      !test1.success && test1.code === 400,
      test1.errors?.[0]
    );
    
    // 3.2 必須項目の欠落
    const test2 = await this.client.createBooking({
      employeeName: '山田太郎',
      interviewType: 'regular_annual'
    } as any);
    
    this.recordResult(
      'シナリオ3',
      '必須項目欠落エラー',
      !test2.success && test2.code === 400,
      test2.errors?.[0]
    );
    
    console.log('');
  }
  
  private async testScenario4And5() {
    console.log('📋 シナリオ4-5: 一覧取得・削除テスト');
    
    // シナリオ4: 予約一覧取得
    try {
      const bookings = await this.client.getBookings('2024-12-25');
      this.recordResult(
        'シナリオ4',
        '予約一覧取得',
        Array.isArray(bookings),
        `${bookings.length}件の予約を取得`
      );
    } catch (error) {
      this.recordResult('シナリオ4', '予約一覧取得', false, '', String(error));
    }
    
    // シナリオ5: 予約削除
    const deleteResult = await this.client.deleteBooking('BK-2024-12-001');
    this.recordResult(
      'シナリオ5',
      '予約削除',
      deleteResult.success || deleteResult.code === 404,
      deleteResult.message
    );
    
    console.log('');
  }
  
  private recordResult(scenario: string, testName: string, success: boolean, message?: string, error?: string) {
    this.results.push({
      scenario,
      testName,
      success,
      message,
      error
    });
    
    const icon = success ? '✅' : '❌';
    console.log(`  ${icon} ${testName}: ${success ? 'OK' : 'FAILED'}`);
    if (message) console.log(`     → ${message}`);
    if (error) console.log(`     → Error: ${error}`);
  }
  
  private generateReport() {
    const endTime = new Date();
    const duration = (endTime.getTime() - this.startTime.getTime()) / 1000;
    
    console.log('===================================');
    console.log('📊 テスト結果サマリー');
    console.log('===================================\n');
    
    const successCount = this.results.filter(r => r.success).length;
    const failCount = this.results.filter(r => !r.success).length;
    const successRate = (successCount / this.results.length * 100).toFixed(1);
    
    console.log(`実施日時: ${this.startTime.toLocaleString('ja-JP')} - ${endTime.toLocaleString('ja-JP')}`);
    console.log(`実行時間: ${duration.toFixed(2)}秒\n`);
    
    console.log(`総テストケース数: ${this.results.length}件`);
    console.log(`成功: ${successCount}件`);
    console.log(`失敗: ${failCount}件`);
    console.log(`成功率: ${successRate}%\n`);
    
    // シナリオごとの結果
    const scenarios = [...new Set(this.results.map(r => r.scenario))];
    
    console.log('シナリオ別結果:');
    for (const scenario of scenarios) {
      const scenarioResults = this.results.filter(r => r.scenario === scenario);
      const scenarioSuccess = scenarioResults.filter(r => r.success).length;
      const scenarioTotal = scenarioResults.length;
      console.log(`  ${scenario}: ${scenarioSuccess}/${scenarioTotal} 成功`);
    }
    
    // 失敗したテストの詳細
    if (failCount > 0) {
      console.log('\n❌ 失敗したテスト:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.scenario} / ${r.testName}`);
        if (r.error) console.log(`    Error: ${r.error}`);
      });
    }
    
    console.log('\n===================================');
    console.log('テスト完了');
    console.log('===================================');
  }
}

// 実行
const runner = new IntegrationTestRunner();
runner.runAllTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
  process.exit(1);
});