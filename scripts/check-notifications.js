// 通知データベース直接確認
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    console.log('\n📊 通知データベース直接確認\n');
    console.log('='.repeat(60));

    // 全通知を確認
    const allNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        sender: {
          select: {
            name: true,
            employeeId: true
          }
        }
      }
    });

    console.log(`\n📧 通知総数（最新10件）: ${allNotifications.length}件\n`);

    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.id.substring(0, 8)}...] ${notif.title}`);
      console.log(`   カテゴリ: ${notif.category} / ${notif.subcategory || 'N/A'}`);
      console.log(`   送信者: ${notif.sender.name} (${notif.sender.employeeId})`);
      console.log(`   作成: ${notif.createdAt.toLocaleString('ja-JP')}`);
      console.log(`   内容: ${notif.content.substring(0, 80)}...`);
      console.log('');
    });

    // Phase 2関連の通知を検索
    const phase2Notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { content: { contains: 'test-int-phase2' } },
          { content: { contains: 'Phase 2' } },
          { content: { contains: 'phase2' } },
          {
            AND: [
              { category: 'interview' },
              { subcategory: 'summary_received' }
            ]
          }
        ]
      },
      include: {
        sender: {
          select: {
            name: true,
            employeeId: true
          }
        }
      }
    });

    console.log('='.repeat(60));
    console.log(`\n🔍 Phase 2関連通知: ${phase2Notifications.length}件\n`);

    if (phase2Notifications.length === 0) {
      console.log('⚠️  Phase 2関連の通知が見つかりませんでした');
      console.log('   考えられる原因:');
      console.log('   1. 通知生成コードがスキップされた（Interviewが見つからない）');
      console.log('   2. NotificationService.create()がエラーを返した');
      console.log('   3. 通知生成コードに到達していない');
    } else {
      phase2Notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`);
        console.log(`   ID: ${notif.id}`);
        console.log(`   送信者: ${notif.sender.name}`);
        console.log(`   作成: ${notif.createdAt.toLocaleString('ja-JP')}`);
        console.log(`   内容: ${notif.content}`);
        console.log('');
      });
    }

    console.log('='.repeat(60));
    console.log('✅ 確認完了\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
