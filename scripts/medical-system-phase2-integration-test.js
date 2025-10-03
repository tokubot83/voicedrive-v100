/**
 * Phase 2 通知生成機能 統合テスト
 * 医療システム → VoiceDrive サマリ送信 → 通知自動生成確認
 */

const VOICEDRIVE_API_URL = 'http://localhost:3003/api/sync/interview-results';
const AUTH_TOKEN = process.env.MEDICAL_SYSTEM_API_KEY || 'vd_prod_key_A8B9C2D3E4F5G6H7I8J9K0L1M2N3O4P5';

async function testPhase2NotificationGeneration() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Phase 2 通知生成機能 統合テスト              ║');
  console.log('║   医療システム → VoiceDrive                    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');

  // Phase 2検証用の新規サマリデータ（タイムスタンプで一意性確保）
  const timestamp = Date.now();
  const testData = {
    requestId: `test-req-phase2-${timestamp}`,
    interviewId: `test-int-phase2-${timestamp}`,
    completedAt: new Date().toISOString(),
    duration: 40,
    summary: 'Phase 2通知生成機能の検証用面談サマリです。このサマリ受信時に通知が自動生成されることを確認します。従業員の業務状況は良好で、特に問題はありません。',
    keyPoints: [
      'Phase 2検証ポイント1: 通知自動生成機能のテスト',
      'Phase 2検証ポイント2: 通知センターからのモーダル表示確認'
    ],
    actionItems: [
      {
        description: 'Phase 2検証アクション: 通知センターで「サマリを見る」ボタンを確認',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1週間後
      }
    ],
    followUpRequired: true,
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2週間後
    feedbackToEmployee: 'Phase 2検証フィードバック: 通知機能の動作を確認してください。',
    nextRecommendations: {
      suggestedNextInterview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3ヶ月後
      suggestedTopics: ['Phase 2機能検証', '通知センター確認']
    }
  };

  console.log('📤 送信データ:');
  console.log(`   requestId: ${testData.requestId}`);
  console.log(`   interviewId: ${testData.interviewId}`);
  console.log(`   completedAt: ${testData.completedAt}`);
  console.log(`   duration: ${testData.duration}分`);
  console.log(`   summary: ${testData.summary.substring(0, 60)}...`);
  console.log('');

  try {
    console.log('⏳ VoiceDriveへサマリを送信中...');
    const startTime = Date.now();

    const response = await fetch(VOICEDRIVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(testData)
    });

    const responseTime = Date.now() - startTime;
    const responseData = await response.json();

    console.log('');
    console.log('📥 レスポンス結果:');
    console.log(`   HTTPステータス: ${response.status} ${response.ok ? '✅' : '❌'}`);
    console.log(`   レスポンスタイム: ${responseTime}ms`);
    console.log(`   成功: ${responseData.success ? '✅' : '❌'}`);
    console.log('');

    if (response.ok && responseData.success) {
      console.log('✅ ステップ1: サマリ送信成功');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 次の確認事項（VoiceDrive側で実施）');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('1. ✅ InterviewResult保存確認');
      console.log('   → データベースに保存されているか確認');
      console.log(`   → interviewId: ${testData.interviewId}`);
      console.log('');
      console.log('2. 🔔 通知生成確認（Phase 2の主要機能）');
      console.log('   → 通知データベースに新規通知が作成されているか');
      console.log('   → 通知内容:');
      console.log('      - タイトル: 「📝 面談サマリが届きました」');
      console.log('      - カテゴリ: interview');
      console.log('      - サブカテゴリ: summary_received');
      console.log('      - 優先度: high');
      console.log(`      - コンテンツに [INTERVIEW_ID:${testData.interviewId}] が含まれる`);
      console.log('      - ステータス: sent');
      console.log('      - 送信者: システムユーザー（employeeId: SYSTEM）');
      console.log('');
      console.log('3. 🖥️  通知センターUI確認');
      console.log('   → VoiceDrive Webアプリ（http://localhost:5173）を開く');
      console.log('   → テストユーザー（EMP-001）でログイン');
      console.log('   → 通知センターを開く');
      console.log('   → 新着通知に「📝 サマリを見る」ボタンが表示されるか');
      console.log('');
      console.log('4. 📝 サマリモーダル表示確認');
      console.log('   → 「サマリを見る」ボタンをクリック');
      console.log('   → InterviewResultModalが開くか');
      console.log('   → サマリ詳細が正しく表示されるか:');
      console.log(`      - summary: "${testData.summary.substring(0, 50)}..."`);
      console.log('      - keyPoints: 2件');
      console.log('      - actionItems: 1件');
      console.log('      - followUpRequired: true');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 Phase 2検証スクリプト');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('VoiceDrive側で以下のコマンドを実行してください:');
      console.log('');
      console.log('# 1. 通知データベース確認');
      console.log('node scripts/check-notifications.js');
      console.log('');
      console.log('# 2. Interview & InterviewResult確認');
      console.log(`node scripts/check-interview.js ${testData.interviewId}`);
      console.log('');
      console.log('# 3. 通知生成テスト実行');
      console.log('node scripts/test-notification-generation.js');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('✅ 医療システム側のテストは成功しました');
      console.log('⏭️  VoiceDrive側での確認をお願いします');
      console.log('');
      console.log(`📊 テストデータID: ${testData.interviewId}`);
      console.log('');

      return true;
    } else {
      console.log('❌ サマリ送信失敗');
      console.log('');
      console.log('エラー詳細:');
      console.log(JSON.stringify(responseData, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ テスト実行エラー');
    console.error('');
    console.error('エラー詳細:', error.message);
    if (error.cause) {
      console.error('原因:', error.cause);
    }
    return false;
  }
}

// テスト実行
testPhase2NotificationGeneration()
  .then((success) => {
    console.log('');
    console.log('════════════════════════════════════════════════════');
    if (success) {
      console.log('✅ Phase 2統合テスト（医療システム側）完了');
      console.log('⏭️  次: VoiceDrive側で通知生成を確認してください');
    } else {
      console.log('❌ Phase 2統合テスト失敗');
      console.log('   → VoiceDrive APIサーバーが起動しているか確認してください');
      console.log('   → APIキーが正しいか確認してください');
    }
    console.log('════════════════════════════════════════════════════');
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('');
    console.error('╔════════════════════════════════════════════════════╗');
    console.error('║   ❌ テスト実行エラー                          ║');
    console.error('╚════════════════════════════════════════════════════╝');
    console.error('');
    console.error(error);
    process.exit(1);
  });
