/**
 * 議題モード判断処理APIテストスクリプト
 * 実行方法: npx tsx scripts/test-agenda-decisions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// APIエンドポイント（開発環境）
const API_BASE_URL = 'http://localhost:3003';
const API_ENDPOINT = `${API_BASE_URL}/api/agenda/decision`;

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  postId: string;
  decisionType: string;
  newStatus?: string;
  notificationCount?: number;
}

const testResults: TestResult[] = [];

/**
 * API呼び出しヘルパー
 */
async function callDecisionAPI(payload: {
  postId: string;
  decisionType: string;
  deciderId: string;
  reason: string;
  committeeId?: string;
}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * 投稿の現在の状態を確認
 */
async function checkPostStatus(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      agendaScore: true,
      agendaLevel: true,
      agendaStatus: true,
      agendaDecisionBy: true,
      agendaDecisionAt: true,
      agendaDecisionReason: true,
      agendaRescueLevel: true,
    },
  });

  return post;
}

/**
 * テスト1: 主任が師長に推薦
 */
async function test1_SupervisorRecommendToManager() {
  console.log('\n📌 テスト1: 主任が師長に推薦');

  const testName = '主任→師長推薦';
  const postId = 'test-post-50';
  const decisionType = 'recommend_to_manager';
  const deciderId = 'test-supervisor-1';
  const reason = 'この提案は部署全体に影響があるため、師長の判断を仰ぎます。';

  try {
    // テスト実行前の状態確認
    const beforePost = await checkPostStatus(postId);
    console.log(`実行前ステータス: ${beforePost?.agendaStatus}`);

    // API呼び出し
    const result = await callDecisionAPI({
      postId,
      decisionType,
      deciderId,
      reason,
    });

    console.log(`API結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);

    // 実行後の状態確認
    const afterPost = await checkPostStatus(postId);
    console.log(`実行後ステータス: ${afterPost?.agendaStatus}`);
    console.log(`判断者: ${afterPost?.agendaDecisionBy}`);
    console.log(`通知送信: ${result.notificationsSent}件`);

    testResults.push({
      testName,
      success: result.success && afterPost?.agendaStatus === 'recommended_to_manager',
      postId,
      decisionType,
      newStatus: afterPost?.agendaStatus || '',
      notificationCount: result.notificationsSent,
    });
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId,
      decisionType,
    });
  }
}

/**
 * テスト2: 師長が部署議題として承認
 */
async function test2_ManagerApproveDeptAgenda() {
  console.log('\n📌 テスト2: 師長が部署議題として承認');

  const testName = '師長→部署議題承認';
  const postId = 'test-post-50-rec';
  const decisionType = 'approve_as_dept_agenda';
  const deciderId = 'test-manager-1';
  const reason = '部署内で検討すべき重要な提案です。部署議題として承認します。';

  try {
    const beforePost = await checkPostStatus(postId);
    console.log(`実行前ステータス: ${beforePost?.agendaStatus}`);

    const result = await callDecisionAPI({
      postId,
      decisionType,
      deciderId,
      reason,
    });

    console.log(`API結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);

    const afterPost = await checkPostStatus(postId);
    console.log(`実行後ステータス: ${afterPost?.agendaStatus}`);
    console.log(`判断者: ${afterPost?.agendaDecisionBy}`);
    console.log(`通知送信: ${result.notificationsSent}件`);

    testResults.push({
      testName,
      success: result.success && afterPost?.agendaStatus === 'approved_as_dept_agenda',
      postId,
      decisionType,
      newStatus: afterPost?.agendaStatus || '',
      notificationCount: result.notificationsSent,
    });
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId,
      decisionType,
    });
  }
}

/**
 * テスト3: 師長が施設議題に昇格
 */
async function test3_ManagerEscalateToFacility() {
  console.log('\n📌 テスト3: 師長が施設議題に昇格');

  const testName = '師長→施設議題昇格';
  const postId = 'test-post-99';
  const decisionType = 'escalate_to_facility';
  const deciderId = 'test-manager-1';
  const reason = '部署レベルを超える重要な提案のため、施設議題に昇格します。';

  try {
    const beforePost = await checkPostStatus(postId);
    console.log(`実行前ステータス: ${beforePost?.agendaStatus}`);

    const result = await callDecisionAPI({
      postId,
      decisionType,
      deciderId,
      reason,
    });

    console.log(`API結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);

    const afterPost = await checkPostStatus(postId);
    console.log(`実行後ステータス: ${afterPost?.agendaStatus}`);
    console.log(`判断者: ${afterPost?.agendaDecisionBy}`);
    console.log(`通知送信: ${result.notificationsSent}件`);

    testResults.push({
      testName,
      success: result.success && afterPost?.agendaStatus === 'pending_deputy_director_review',
      postId,
      decisionType,
      newStatus: afterPost?.agendaStatus || '',
      notificationCount: result.notificationsSent,
    });
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId,
      decisionType,
    });
  }
}

/**
 * テスト4: 師長が却下
 */
async function test4_ManagerReject() {
  console.log('\n📌 テスト4: 師長が却下');

  const testName = '師長→却下';
  const postId = 'test-post-50-reject';
  const decisionType = 'reject_by_manager';
  const deciderId = 'test-manager-1';
  const reason = '実現可能性が低いため、却下します。';

  try {
    const beforePost = await checkPostStatus(postId);
    console.log(`実行前ステータス: ${beforePost?.agendaStatus}`);

    const result = await callDecisionAPI({
      postId,
      decisionType,
      deciderId,
      reason,
    });

    console.log(`API結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);

    const afterPost = await checkPostStatus(postId);
    console.log(`実行後ステータス: ${afterPost?.agendaStatus}`);
    console.log(`判断者: ${afterPost?.agendaDecisionBy}`);
    console.log(`通知送信: ${result.notificationsSent}件`);

    testResults.push({
      testName,
      success: result.success && afterPost?.agendaStatus === 'rejected_by_manager',
      postId,
      decisionType,
      newStatus: afterPost?.agendaStatus || '',
      notificationCount: result.notificationsSent,
    });
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId,
      decisionType,
    });
  }
}

/**
 * テスト5: 副看護部長が委員会提出承認
 */
async function test5_DeputyApproveForCommittee() {
  console.log('\n📌 テスト5: 副看護部長が委員会提出承認');

  const testName = '副看護部長→委員会提出承認';
  const postId = 'test-post-100';
  const decisionType = 'approve_for_committee';
  const deciderId = 'test-deputy-1';
  const reason = '医療安全委員会で検討すべき重要な提案です。';
  const committeeId = 'committee-safety';

  try {
    const beforePost = await checkPostStatus(postId);
    console.log(`実行前ステータス: ${beforePost?.agendaStatus}`);

    const result = await callDecisionAPI({
      postId,
      decisionType,
      deciderId,
      reason,
      committeeId,
    });

    console.log(`API結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);

    const afterPost = await checkPostStatus(postId);
    console.log(`実行後ステータス: ${afterPost?.agendaStatus}`);
    console.log(`判断者: ${afterPost?.agendaDecisionBy}`);
    console.log(`通知送信: ${result.notificationsSent}件`);

    testResults.push({
      testName,
      success: result.success && afterPost?.agendaStatus === 'approved_for_committee',
      postId,
      decisionType,
      newStatus: afterPost?.agendaStatus || '',
      notificationCount: result.notificationsSent,
    });
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId,
      decisionType,
    });
  }
}

/**
 * テスト6: 救済フロー（師長が部署議題として救済）
 */
async function test6_ManagerRescue() {
  console.log('\n📌 テスト6: 救済フロー（師長が部署議題として救済）');

  const testName = '師長→部署議題救済';
  const postId = 'test-post-100-rescue';
  const decisionType = 'rescue_as_dept_agenda';
  const deciderId = 'test-manager-1';
  const reason = '部署レベルでは重要な提案のため、部署議題として救済します。';

  try {
    const beforePost = await checkPostStatus(postId);
    console.log(`実行前ステータス: ${beforePost?.agendaStatus}`);

    const result = await callDecisionAPI({
      postId,
      decisionType,
      deciderId,
      reason,
    });

    console.log(`API結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);

    const afterPost = await checkPostStatus(postId);
    console.log(`実行後ステータス: ${afterPost?.agendaStatus}`);
    console.log(`判断者: ${afterPost?.agendaDecisionBy}`);
    console.log(`救済レベル: ${afterPost?.agendaRescueLevel || 'なし'}`);
    console.log(`通知送信: ${result.notificationsSent}件`);

    testResults.push({
      testName,
      success: result.success && afterPost?.agendaStatus === 'rescued_as_dept_agenda',
      postId,
      decisionType,
      newStatus: afterPost?.agendaStatus || '',
      notificationCount: result.notificationsSent,
    });
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId,
      decisionType,
    });
  }
}

/**
 * テスト結果サマリー表示
 */
function displayTestSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 テスト結果サマリー');
  console.log('='.repeat(60));

  const totalTests = testResults.length;
  const passedTests = testResults.filter((r) => r.success).length;
  const failedTests = totalTests - passedTests;

  console.log(`\n総テスト数: ${totalTests}`);
  console.log(`✅ 成功: ${passedTests}`);
  console.log(`❌ 失敗: ${failedTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  console.table(
    testResults.map((r) => ({
      テスト名: r.testName,
      結果: r.success ? '✅' : '❌',
      投稿ID: r.postId,
      判断タイプ: r.decisionType,
      新ステータス: r.newStatus || 'N/A',
      通知件数: r.notificationCount !== undefined ? r.notificationCount : 'N/A',
      エラー: r.error || '',
    }))
  );

  console.log('\n' + '='.repeat(60));
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🧪 議題モード判断処理APIテスト開始\n');
  console.log('⚙️  設定:');
  console.log(`  - API URL: ${API_ENDPOINT}`);
  console.log(`  - データベース: ${process.env.DATABASE_URL || 'デフォルト'}\n`);

  // 開発サーバーが起動しているか確認
  try {
    await fetch(API_BASE_URL);
    console.log('✅ 開発サーバー接続確認: OK\n');
  } catch (error) {
    console.error('❌ 開発サーバーに接続できません。npm run dev:api を実行してください。');
    process.exit(1);
  }

  // 各テストを順次実行
  await test1_SupervisorRecommendToManager();
  await test2_ManagerApproveDeptAgenda();
  await test3_ManagerEscalateToFacility();
  await test4_ManagerReject();
  await test5_DeputyApproveForCommittee();
  await test6_ManagerRescue();

  // 結果サマリー表示
  displayTestSummary();

  console.log('\n✨ テスト完了！');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ テストエラー:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
