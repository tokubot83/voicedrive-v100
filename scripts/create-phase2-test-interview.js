// Phase 2テスト用Interviewレコード作成
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPhase2TestInterview() {
  try {
    console.log('\n🔧 Phase 2テスト用Interviewレコード作成\n');
    console.log('='.repeat(60));

    // テストユーザーを取得
    const testUser = await prisma.user.findFirst({
      where: { employeeId: 'EMP-001' }
    });

    if (!testUser) {
      console.log('❌ テストユーザー（EMP-001）が見つかりません');
      return;
    }

    console.log(`✅ テストユーザー: ${testUser.name} (${testUser.employeeId})`);

    // Phase 2テスト用Interviewを作成
    const interview = await prisma.interview.create({
      data: {
        id: 'test-req-phase2-001',  // requestIdと一致
        employeeId: testUser.id,
        category: 'BASIC',
        type: 'regular_followup',
        topic: 'Phase 2通知機能テスト用面談',
        preferredDate: new Date('2025-10-02T14:00:00.000Z'),
        scheduledDate: new Date('2025-10-02T14:00:00.000Z'),
        actualDate: new Date('2025-10-02T14:00:00.000Z'),
        duration: 40,
        status: 'completed',
        urgencyLevel: 'this_week',
        interviewerName: '人事 花子',
        result: 'Phase 2通知機能テスト完了',
        notes: 'Phase 2統合テスト - 通知自動生成確認用'
      }
    });

    console.log('\n✅ Phase 2テスト用Interview作成完了');
    console.log(`   Interview ID: ${interview.id}`);
    console.log(`   従業員: ${testUser.name} (${testUser.employeeId})`);
    console.log(`   ステータス: ${interview.status}`);
    console.log(`   面談日時: ${interview.scheduledDate.toLocaleString('ja-JP')}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 準備完了 - 次のステップ:');
    console.log('   1. 医療システムからサマリを再送信');
    console.log('   2. 通知が自動生成されることを確認');
    console.log('   3. 通知センターで「サマリを見る」ボタンを確認\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPhase2TestInterview();
