// Phase 2テストデータクリーンアップ
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupPhase2Test() {
  try {
    console.log('\n🧹 Phase 2テストデータクリーンアップ\n');
    console.log('='.repeat(60));

    // 既存のサマリを削除
    const deletedResult = await prisma.interviewResult.deleteMany({
      where: { requestId: 'test-req-phase2-001' }
    });

    console.log(`✅ InterviewResult削除: ${deletedResult.count}件`);

    // 既存の通知を削除
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        content: {
          contains: 'test-int-phase2'
        }
      }
    });

    console.log(`✅ Notification削除: ${deletedNotifications.count}件`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ クリーンアップ完了\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupPhase2Test();
