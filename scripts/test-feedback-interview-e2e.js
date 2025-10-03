// フィードバック面談予約 エンドツーエンドテストスクリプト
// VoiceDrive UI → MCP統合サーバーのデータフロー検証

const testCases = [
  {
    name: 'テストケース1: 2025年冬期評価フィードバック（中優先度）',
    payload: {
      staffId: 'EMP001',
      type: 'support',
      supportCategory: 'feedback',
      supportTopic: 'winter_provisional_feedback',
      urgency: 'medium', // 2025-03-29まで約26日
      evaluationDetails: {
        evaluationId: 'eval_2025_winter',
        evaluationType: 'winter_provisional',
        facilityGrade: 'A',
        corporateGrade: 'B',
        totalPoints: 21.75, // 87点 ÷ 4 = 21.75点（25点満点換算）
        appealDeadline: '2025-03-29',
        appealable: true
      },
      notes: '冬期評価の結果について詳しく相談したい',
      timing: 'flexible',
      timeSlot: 'afternoon',
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  },
  {
    name: 'テストケース2: 2024年夏期評価フィードバック（異議申立済み）',
    payload: {
      staffId: 'EMP001',
      type: 'support',
      supportCategory: 'feedback',
      supportTopic: 'summer_provisional_feedback',
      urgency: 'low', // 過去の評価
      evaluationDetails: {
        evaluationId: 'eval_2024_summer',
        evaluationType: 'summer_provisional',
        facilityGrade: 'B',
        corporateGrade: 'B',
        totalPoints: 19.75, // 79点 ÷ 4 = 19.75点
        appealable: false, // 既に異議申立済み
        appealSubmitted: true,
        appealResult: 'approved'
      },
      notes: '異議申立の結果について追加でフィードバックを受けたい',
      timing: 'next_week',
      weekdays: ['wednesday', 'thursday', 'friday']
    }
  },
  {
    name: 'テストケース3: 緊急フィードバック（期限3日前想定）',
    payload: {
      staffId: 'EMP001',
      type: 'support',
      supportCategory: 'feedback',
      supportTopic: 'urgent_evaluation_feedback',
      urgency: 'urgent',
      evaluationDetails: {
        evaluationId: 'eval_urgent_test',
        evaluationType: 'summer_provisional',
        facilityGrade: 'B',
        corporateGrade: 'C',
        totalPoints: 17.5, // 70点 ÷ 4 = 17.5点
        appealDeadline: (() => {
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 3);
          return deadline.toISOString().split('T')[0];
        })(),
        appealable: true
      },
      notes: '評価結果に疑問があり、早急に相談したい',
      timing: 'asap',
      weekdays: ['any']
    }
  }
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${testCase.name}`);
  console.log('='.repeat(60));

  console.log('\n📤 送信データ:');
  console.log(JSON.stringify(testCase.payload, null, 2));

  try {
    const response = await fetch('http://localhost:8080/api/interviews/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.payload)
    });

    const data = await response.json();

    console.log(`\n📥 レスポンス (HTTP ${response.status}):`);
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ テスト成功');

      // 検証項目
      const validations = [
        { check: data.success === true, message: 'success フラグが true' },
        { check: !!data.reservationId, message: '予約ID が生成されている' },
        { check: data.status === 'pending_schedule', message: 'ステータスが pending_schedule' },
        { check: !!data.estimatedResponseDate, message: '予定返信日が設定されている' },
        { check: Array.isArray(data.nextSteps), message: '次のステップが提供されている' }
      ];

      console.log('\n🔍 検証結果:');
      validations.forEach(({ check, message }) => {
        console.log(`  ${check ? '✅' : '❌'} ${message}`);
      });

      // 保存された予約データを確認
      console.log('\n📊 保存データ確認...');
      const verifyResponse = await fetch(`http://localhost:8080/api/interviews/reservations/${data.reservationId}`);

      if (verifyResponse.ok) {
        const savedData = await verifyResponse.json();
        console.log('✅ 予約データが正常に保存されました');
        console.log('   保存された評価詳細:');
        console.log(`   - 評価ID: ${savedData.data.evaluationDetails?.evaluationId}`);
        console.log(`   - 評価タイプ: ${savedData.data.evaluationDetails?.evaluationType}`);
        console.log(`   - 施設内評価: ${savedData.data.evaluationDetails?.facilityGrade}`);
        console.log(`   - 法人内評価: ${savedData.data.evaluationDetails?.corporateGrade}`);
        console.log(`   - 総合点: ${savedData.data.evaluationDetails?.totalPoints}点`);
        console.log(`   - 緊急度: ${savedData.data.urgency}`);
      } else {
        console.log('⚠️  保存データの確認に失敗');
      }

      return { success: true, reservationId: data.reservationId };
    } else {
      console.log('\n❌ テスト失敗');
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('\n❌ エラー発生:');
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('\n🚀 フィードバック面談予約 エンドツーエンドテスト開始');
  console.log('='.repeat(60));
  console.log('テスト環境:');
  console.log('  VoiceDrive → MCP統合サーバー');
  console.log('  エンドポイント: http://localhost:8080/api/interviews/reservations');
  console.log('='.repeat(60));

  const results = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({
      name: testCase.name,
      ...result
    });

    // 次のテストまで少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 最終結果サマリ
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 テスト結果サマリ');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}`);
    console.log(`   ${result.success ? '✅ 成功' : '❌ 失敗'}`);
    if (result.reservationId) {
      console.log(`   予約ID: ${result.reservationId}`);
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`総合結果: ${successCount}/${totalCount} 件成功 (${Math.round(successCount/totalCount*100)}%)`);

  if (successCount === totalCount) {
    console.log('✅ 全テスト成功！');
  } else {
    console.log('⚠️  一部のテストが失敗しました');
  }
  console.log('='.repeat(60));

  // 全予約データの確認
  console.log('\n📋 登録済み予約データ一覧:');
  try {
    const allReservationsResponse = await fetch('http://localhost:8080/api/interviews/reservations?staffId=EMP001');
    const allReservations = await allReservationsResponse.json();

    if (allReservations.success) {
      console.log(`\n合計 ${allReservations.count} 件の予約が登録されています:\n`);
      allReservations.data.forEach((res, idx) => {
        console.log(`${idx + 1}. ${res.id}`);
        console.log(`   タイプ: ${res.supportTopic}`);
        console.log(`   緊急度: ${res.urgency}`);
        console.log(`   評価ID: ${res.evaluationDetails?.evaluationId || 'N/A'}`);
        console.log(`   受信日時: ${res.receivedAt}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('予約一覧の取得に失敗:', error.message);
  }
}

// テスト実行
runAllTests().catch(console.error);
