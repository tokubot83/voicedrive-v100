/**
 * スコア閾値通知テストスクリプト
 * 実行方法: npx tsx scripts/test-score-thresholds.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// APIエンドポイント（開発環境）
const API_BASE_URL = 'http://localhost:3003';

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  postId: string;
  previousScore: number;
  newScore: number;
  threshold: number;
}

const testResults: TestResult[] = [];

/**
 * テスト投稿を作成
 */
async function createTestPost(authorId: string, initialScore: number = 0): Promise<string> {
  const post = await prisma.post.create({
    data: {
      content: `スコア閾値テスト用投稿（初期スコア: ${initialScore}点）`,
      authorId,
      agendaScore: initialScore,
      agendaStatus: 'pending',
      createdAt: new Date(),
    },
  });

  console.log(`✅ テスト投稿作成: ${post.id} (初期スコア: ${initialScore}点)`);
  return post.id;
}

/**
 * 投票APIを呼び出す
 */
async function vote(postId: string, userId: string, voteOption: string, authToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ voteOption }),
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
 * 投稿の現在のスコアを取得
 */
async function getCurrentScore(postId: string): Promise<number> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { agendaScore: true },
  });

  return post?.agendaScore || 0;
}

/**
 * ダミーの認証トークンを生成
 * （開発環境用：実際には認証ミドルウェアをバイパスする必要がある）
 */
function generateAuthToken(userId: string): string {
  // 実際にはJWTトークンを生成する必要がありますが、
  // 開発環境では簡易的なトークンで対応
  return `test-token-${userId}`;
}

/**
 * テスト1: 30点到達テスト
 */
async function test1_Threshold30() {
  console.log('\n📌 テスト1: 30点到達');

  const testName = '30点到達通知';
  const threshold = 30;
  const authorId = 'test-user-author-30';
  const voters = ['test-user-voter-1', 'test-user-voter-2', 'test-user-voter-3'];

  try {
    // テスト投稿作成（0点）
    const postId = await createTestPost(authorId, 0);
    const previousScore = await getCurrentScore(postId);

    // 3人が「強く賛成」で投票（10点 × 3 = 30点）
    for (const voterId of voters) {
      const authToken = generateAuthToken(voterId);
      await vote(postId, voterId, 'strongly-support', authToken);
    }

    // スコア確認
    const newScore = await getCurrentScore(postId);
    console.log(`スコア変化: ${previousScore}点 → ${newScore}点`);

    const success = newScore >= threshold;

    testResults.push({
      testName,
      success,
      postId,
      previousScore,
      newScore,
      threshold,
    });

    if (success) {
      console.log(`✅ テスト成功: 30点到達（${newScore}点）`);
    } else {
      console.log(`❌ テスト失敗: 30点未到達（${newScore}点）`);
    }
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId: '',
      previousScore: 0,
      newScore: 0,
      threshold,
    });
  }
}

/**
 * テスト2: 50点到達テスト
 */
async function test2_Threshold50() {
  console.log('\n📌 テスト2: 50点到達');

  const testName = '50点到達通知';
  const threshold = 50;
  const authorId = 'test-user-author-50';
  const voters = [
    'test-user-voter-4',
    'test-user-voter-5',
    'test-user-voter-6',
    'test-user-voter-7',
    'test-user-voter-8',
  ];

  try {
    // テスト投稿作成（0点）
    const postId = await createTestPost(authorId, 0);
    const previousScore = await getCurrentScore(postId);

    // 5人が「強く賛成」で投票（10点 × 5 = 50点）
    for (const voterId of voters) {
      const authToken = generateAuthToken(voterId);
      await vote(postId, voterId, 'strongly-support', authToken);
    }

    // スコア確認
    const newScore = await getCurrentScore(postId);
    console.log(`スコア変化: ${previousScore}点 → ${newScore}点`);

    const success = newScore >= threshold;

    testResults.push({
      testName,
      success,
      postId,
      previousScore,
      newScore,
      threshold,
    });

    if (success) {
      console.log(`✅ テスト成功: 50点到達（${newScore}点）`);
    } else {
      console.log(`❌ テスト失敗: 50点未到達（${newScore}点）`);
    }
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId: '',
      previousScore: 0,
      newScore: 0,
      threshold,
    });
  }
}

/**
 * テスト3: 100点到達テスト
 */
async function test3_Threshold100() {
  console.log('\n📌 テスト3: 100点到達');

  const testName = '100点到達通知';
  const threshold = 100;
  const authorId = 'test-user-author-100';

  try {
    // テスト投稿作成（90点から開始）
    const postId = await createTestPost(authorId, 90);
    const previousScore = await getCurrentScore(postId);

    // 2人が「強く賛成」で投票（10点 × 2 = 20点追加 → 合計110点）
    const voters = ['test-user-voter-9', 'test-user-voter-10'];
    for (const voterId of voters) {
      const authToken = generateAuthToken(voterId);
      await vote(postId, voterId, 'strongly-support', authToken);
    }

    // スコア確認
    const newScore = await getCurrentScore(postId);
    console.log(`スコア変化: ${previousScore}点 → ${newScore}点`);

    const success = newScore >= threshold;

    testResults.push({
      testName,
      success,
      postId,
      previousScore,
      newScore,
      threshold,
    });

    if (success) {
      console.log(`✅ テスト成功: 100点到達（${newScore}点）`);
    } else {
      console.log(`❌ テスト失敗: 100点未到達（${newScore}点）`);
    }
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId: '',
      previousScore: 0,
      newScore: 0,
      threshold,
    });
  }
}

/**
 * テスト4: 300点到達テスト
 */
async function test4_Threshold300() {
  console.log('\n📌 テスト4: 300点到達');

  const testName = '300点到達通知';
  const threshold = 300;
  const authorId = 'test-user-author-300';

  try {
    // テスト投稿作成（290点から開始）
    const postId = await createTestPost(authorId, 290);
    const previousScore = await getCurrentScore(postId);

    // 2人が「強く賛成」で投票（10点 × 2 = 20点追加 → 合計310点）
    const voters = ['test-user-voter-11', 'test-user-voter-12'];
    for (const voterId of voters) {
      const authToken = generateAuthToken(voterId);
      await vote(postId, voterId, 'strongly-support', authToken);
    }

    // スコア確認
    const newScore = await getCurrentScore(postId);
    console.log(`スコア変化: ${previousScore}点 → ${newScore}点`);

    const success = newScore >= threshold;

    testResults.push({
      testName,
      success,
      postId,
      previousScore,
      newScore,
      threshold,
    });

    if (success) {
      console.log(`✅ テスト成功: 300点到達（${newScore}点）`);
    } else {
      console.log(`❌ テスト失敗: 300点未到達（${newScore}点）`);
    }
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId: '',
      previousScore: 0,
      newScore: 0,
      threshold,
    });
  }
}

/**
 * テスト5: 600点到達テスト
 */
async function test5_Threshold600() {
  console.log('\n📌 テスト5: 600点到達');

  const testName = '600点到達通知';
  const threshold = 600;
  const authorId = 'test-user-author-600';

  try {
    // テスト投稿作成（590点から開始）
    const postId = await createTestPost(authorId, 590);
    const previousScore = await getCurrentScore(postId);

    // 2人が「強く賛成」で投票（10点 × 2 = 20点追加 → 合計610点）
    const voters = ['test-user-voter-13', 'test-user-voter-14'];
    for (const voterId of voters) {
      const authToken = generateAuthToken(voterId);
      await vote(postId, voterId, 'strongly-support', authToken);
    }

    // スコア確認
    const newScore = await getCurrentScore(postId);
    console.log(`スコア変化: ${previousScore}点 → ${newScore}点`);

    const success = newScore >= threshold;

    testResults.push({
      testName,
      success,
      postId,
      previousScore,
      newScore,
      threshold,
    });

    if (success) {
      console.log(`✅ テスト成功: 600点到達（${newScore}点）`);
    } else {
      console.log(`❌ テスト失敗: 600点未到達（${newScore}点）`);
    }
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    testResults.push({
      testName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      postId: '',
      previousScore: 0,
      newScore: 0,
      threshold,
    });
  }
}

/**
 * テスト結果サマリー表示
 */
function displayTestSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 スコア閾値通知テスト結果');
  console.log('='.repeat(70));

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
      投稿ID: r.postId || 'N/A',
      閾値: `${r.threshold}点`,
      '前スコア': `${r.previousScore}点`,
      '後スコア': `${r.newScore}点`,
      エラー: r.error || '',
    }))
  );

  console.log('\n' + '='.repeat(70));
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🧪 スコア閾値通知テスト開始\n');
  console.log('⚙️  設定:');
  console.log(`  - API URL: ${API_BASE_URL}`);
  console.log(`  - データベース: ${process.env.DATABASE_URL || 'デフォルト'}\n`);

  // 開発サーバーが起動しているか確認
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (!healthResponse.ok) throw new Error('Health check failed');
    console.log('✅ 開発サーバー接続確認: OK\n');
  } catch (error) {
    console.error('❌ 開発サーバーに接続できません。npm run dev:api を実行してください。');
    process.exit(1);
  }

  console.log('⚠️  注意: このテストは認証トークンが必要です。');
  console.log('   認証ミドルウェアをバイパスするか、有効なトークンを使用してください。\n');

  // 各テストを順次実行
  // await test1_Threshold30();
  // await test2_Threshold50();
  // await test3_Threshold100();
  // await test4_Threshold300();
  // await test5_Threshold600();

  // 結果サマリー表示
  displayTestSummary();

  console.log('\n✨ テスト完了！');
  console.log('\n💡 次のステップ:');
  console.log('   1. 認証トークン生成機能を実装');
  console.log('   2. テストユーザーを作成');
  console.log('   3. 上記のテストコメントアウトを解除して実行');
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
