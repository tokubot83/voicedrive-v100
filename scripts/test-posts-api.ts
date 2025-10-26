/**
 * POST /api/posts 統合テストスクリプト
 * 3種類の投稿タイプ（improvement, community, report）をテスト
 */

const BASE_URL = 'http://localhost:3003';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const testResults: TestResult[] = [];

/**
 * テスト1: アイデアボイス投稿（improvement）
 */
async function testImprovementPost() {
  const testName = 'アイデアボイス投稿（improvement）';

  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'improvement',
        content: '夜勤シフトの負担軽減のため、3交代制から2交代制への移行を提案します。現在の3交代制では、引継ぎ回数が多く情報共有にミスが発生しやすい状況です。',
        anonymityLevel: 'real_name',
        proposalType: 'operational',
        priority: 'high',
        season: '春季',
        moderationScore: 75
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      testResults.push({
        name: testName,
        success: true,
        message: '✅ アイデアボイス投稿が正常に作成されました',
        data: result.data
      });
      console.log(`✅ ${testName}: 成功`);
      console.log(`   投稿ID: ${result.data.id}`);
      console.log(`   タイプ: ${result.data.type}`);
      console.log(`   提案タイプ: ${result.data.proposalType}`);
    } else {
      throw new Error(result.message || 'API呼び出しが失敗しました');
    }
  } catch (error) {
    testResults.push({
      name: testName,
      success: false,
      message: `❌ ${testName}が失敗しました`,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`❌ ${testName}: 失敗`);
    console.error(`   エラー: ${error}`);
  }
}

/**
 * テスト2: フリーボイス投稿（community）
 */
async function testCommunityPost() {
  const testName = 'フリーボイス投稿（community）';

  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'community',
        content: '来月の懇親会について、日程調整をしたいと思います。皆さんのご都合をお聞かせください。',
        anonymityLevel: 'department_only',
        freespaceCategory: 'casual_discussion',
        freespaceScope: 'SAME_DEPARTMENT',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7日後
        moderationScore: 85
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      testResults.push({
        name: testName,
        success: true,
        message: '✅ フリーボイス投稿が正常に作成されました',
        data: result.data
      });
      console.log(`✅ ${testName}: 成功`);
      console.log(`   投稿ID: ${result.data.id}`);
      console.log(`   カテゴリ: ${result.data.freespaceCategory}`);
      console.log(`   有効期限: ${result.data.expirationDate}`);
    } else {
      throw new Error(result.message || 'API呼び出しが失敗しました');
    }
  } catch (error) {
    testResults.push({
      name: testName,
      success: false,
      message: `❌ ${testName}が失敗しました`,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`❌ ${testName}: 失敗`);
    console.error(`   エラー: ${error}`);
  }
}

/**
 * テスト3: コンプライアンス窓口投稿（report）
 */
async function testReportPost() {
  const testName = 'コンプライアンス窓口投稿（report）';

  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'report',
        content: '医療安全に関わる問題を発見しました。詳細については個別に報告させていただきたいと思います。',
        anonymityLevel: 'anonymous',
        priority: 'urgent',
        moderationScore: 90
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      testResults.push({
        name: testName,
        success: true,
        message: '✅ コンプライアンス窓口投稿が正常に作成されました',
        data: result.data
      });
      console.log(`✅ ${testName}: 成功`);
      console.log(`   投稿ID: ${result.data.id}`);
      console.log(`   重要度: ${result.data.priority}`);
      console.log(`   匿名性: ${result.data.anonymityLevel}`);
    } else {
      throw new Error(result.message || 'API呼び出しが失敗しました');
    }
  } catch (error) {
    testResults.push({
      name: testName,
      success: false,
      message: `❌ ${testName}が失敗しました`,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`❌ ${testName}: 失敗`);
    console.error(`   エラー: ${error}`);
  }
}

/**
 * テスト4: Poll付きフリーボイス投稿
 */
async function testPollPost() {
  const testName = 'Poll付きフリーボイス投稿';

  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'community',
        content: '次回の勉強会のテーマについて投票をお願いします。',
        anonymityLevel: 'real_name',
        freespaceCategory: 'idea_sharing',
        freespaceScope: 'SAME_FACILITY',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
        pollData: {
          question: '次回の勉強会のテーマは何が良いですか？',
          description: '皆さんの興味のあるテーマを選んでください',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14日後
          allowMultiple: false,
          showResults: 'after_voting',
          category: 'idea_sharing',
          scope: 'SAME_FACILITY',
          options: [
            { text: '感染症対策', emoji: '🦠' },
            { text: '新人教育', emoji: '📚' },
            { text: 'チームビルディング', emoji: '👥' },
            { text: 'ITツール活用', emoji: '💻' }
          ]
        },
        moderationScore: 80
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      testResults.push({
        name: testName,
        success: true,
        message: '✅ Poll付きフリーボイス投稿が正常に作成されました',
        data: result.data
      });
      console.log(`✅ ${testName}: 成功`);
      console.log(`   投稿ID: ${result.data.id}`);
      console.log(`   Poll作成: 成功`);
    } else {
      throw new Error(result.message || 'API呼び出しが失敗しました');
    }
  } catch (error) {
    testResults.push({
      name: testName,
      success: false,
      message: `❌ ${testName}が失敗しました`,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`❌ ${testName}: 失敗`);
    console.error(`   エラー: ${error}`);
  }
}

/**
 * テスト5: Event付きフリーボイス投稿
 */
async function testEventPost() {
  const testName = 'Event付きフリーボイス投稿';

  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'community',
        content: '春の懇親会を企画しています。日程投票にご協力ください。',
        anonymityLevel: 'real_name',
        freespaceCategory: 'event_planning',
        freespaceScope: 'ORGANIZATION_WIDE',
        expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60日後
        eventData: {
          title: '春の懇親会 2025',
          description: '施設全体の親睦を深めるための懇親会です。皆さんのご参加をお待ちしています。',
          type: 'social',
          maxParticipants: 50,
          venueName: '厚生会ホール',
          venueAddress: '東京都○○区○○1-2-3',
          cost: 3000,
          visibility: 'ORGANIZATION_WIDE',
          proposedDates: [
            {
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              startTime: '18:00',
              endTime: '21:00'
            },
            {
              date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
              startTime: '18:00',
              endTime: '21:00'
            },
            {
              date: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(),
              startTime: '18:00',
              endTime: '21:00'
            }
          ]
        },
        moderationScore: 85
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      testResults.push({
        name: testName,
        success: true,
        message: '✅ Event付きフリーボイス投稿が正常に作成されました',
        data: result.data
      });
      console.log(`✅ ${testName}: 成功`);
      console.log(`   投稿ID: ${result.data.id}`);
      console.log(`   Event作成: 成功`);
    } else {
      throw new Error(result.message || 'API呼び出しが失敗しました');
    }
  } catch (error) {
    testResults.push({
      name: testName,
      success: false,
      message: `❌ ${testName}が失敗しました`,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`❌ ${testName}: 失敗`);
    console.error(`   エラー: ${error}`);
  }
}

/**
 * バリデーションテスト
 */
async function testValidation() {
  const testName = 'バリデーションテスト（必須フィールド不足）';

  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'improvement'
        // contentとanonymityLevelが不足
      })
    });

    const result = await response.json();

    if (response.status === 400 && !result.success) {
      testResults.push({
        name: testName,
        success: true,
        message: '✅ バリデーションが正しく機能しています',
        data: result
      });
      console.log(`✅ ${testName}: 成功`);
      console.log(`   エラーメッセージ: ${result.message}`);
    } else {
      throw new Error('バリデーションエラーが検出されませんでした');
    }
  } catch (error) {
    testResults.push({
      name: testName,
      success: false,
      message: `❌ ${testName}が失敗しました`,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`❌ ${testName}: 失敗`);
    console.error(`   エラー: ${error}`);
  }
}

/**
 * メイン実行
 */
async function runTests() {
  console.log('\n🚀 POST /api/posts 統合テスト開始\n');
  console.log('='.repeat(60));

  // テストを順次実行
  await testImprovementPost();
  console.log('');

  await testCommunityPost();
  console.log('');

  await testReportPost();
  console.log('');

  await testPollPost();
  console.log('');

  await testEventPost();
  console.log('');

  await testValidation();
  console.log('');

  // テスト結果サマリー
  console.log('='.repeat(60));
  console.log('\n📊 テスト結果サマリー\n');

  const successCount = testResults.filter(r => r.success).length;
  const failureCount = testResults.filter(r => !r.success).length;

  testResults.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
    if (!result.success && result.error) {
      console.log(`   エラー: ${result.error}`);
    }
  });

  console.log('');
  console.log(`合計: ${testResults.length}件`);
  console.log(`成功: ${successCount}件`);
  console.log(`失敗: ${failureCount}件`);
  console.log(`成功率: ${Math.round((successCount / testResults.length) * 100)}%`);

  if (failureCount === 0) {
    console.log('\n🎉 すべてのテストが成功しました！');
  } else {
    console.log('\n⚠️ 一部のテストが失敗しました。詳細を確認してください。');
  }
}

// テスト実行
runTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
  process.exit(1);
});
