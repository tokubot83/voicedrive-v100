// 通知生成の直接テスト
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../src/api/db/notificationService.js';

const prisma = new PrismaClient();

async function testNotificationCreation() {
  try {
    console.log('\n🧪 通知生成直接テスト\n');
    console.log('='.repeat(60));

    // 1. テストユーザー取得
    const testUser = await prisma.user.findFirst({
      where: { employeeId: 'EMP-001' }
    });

    if (!testUser) {
      console.log('❌ テストユーザーが見つかりません');
      return;
    }

    console.log(`✅ テストユーザー: ${testUser.name} (${testUser.employeeId})`);

    // 2. システムユーザー取得または作成
    let systemUser = await prisma.user.findFirst({
      where: { employeeId: 'SYSTEM' }
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          employeeId: 'SYSTEM',
          email: 'system@voicedrive.local',
          name: 'VoiceDriveシステム',
          accountType: 'SYSTEM',
          permissionLevel: 13,
          department: 'システム管理'
        }
      });
      console.log(`✅ システムユーザー作成: ${systemUser.id}`);
    } else {
      console.log(`✅ システムユーザー: ${systemUser.name} (${systemUser.id})`);
    }

    // 3. 通知作成テスト
    console.log('\n📝 通知作成中...');
    console.log(`   Category: interview`);
    console.log(`   Subcategory: summary_received`);
    console.log(`   Target: ${testUser.employeeId}`);
    console.log(`   Sender: ${systemUser.id}`);

    const notificationResult = await NotificationService.create({
      category: 'interview',
      subcategory: 'summary_received',
      priority: 'high',
      title: '📝 面談サマリが届きました（テスト）',
      content: `面談「Phase 2通知生成テスト：通知センター統合機能の動作...」のサマリが人事部から届きました。詳細をご確認ください。\n\n[INTERVIEW_ID:test-int-phase2-NEW-001]`,
      target: testUser.employeeId,
      senderId: systemUser.id
    });

    console.log('\n📊 通知作成結果:');
    console.log(`   Success: ${notificationResult.success}`);

    if (notificationResult.success) {
      console.log(`   ✅ Notification ID: ${notificationResult.data.id}`);
      console.log(`   Title: ${notificationResult.data.title}`);
      console.log(`   Category: ${notificationResult.data.category}`);
      console.log(`   Subcategory: ${notificationResult.data.subcategory || 'N/A'}`);
      console.log(`   Status: ${notificationResult.data.status}`);
      console.log(`   Target: ${notificationResult.data.target}`);

      // 4. 通知送信テスト
      console.log('\n📤 通知送信中...');
      const sendResult = await NotificationService.send(notificationResult.data.id);

      if (sendResult.success) {
        console.log(`   ✅ 送信成功`);
        console.log(`   Status: ${sendResult.data.status}`);
        console.log(`   Sent At: ${sendResult.data.sentAt.toLocaleString('ja-JP')}`);
      } else {
        console.log(`   ❌ 送信失敗: ${sendResult.error}`);
      }
    } else {
      console.log(`   ❌ Error: ${notificationResult.error}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ テスト完了\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationCreation();
