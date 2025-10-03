// Phase 2 通知自動生成テスト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNotificationGeneration() {
  try {
    console.log('\n📊 Phase 2 通知自動生成テスト\n');
    console.log('=' .repeat(60));

    // 1. 最新の面談サマリ受信を確認
    console.log('\n1️⃣ 最新の面談サマリ受信確認');
    console.log('-'.repeat(60));

    const latestResult = await prisma.interviewResult.findFirst({
      orderBy: { receivedAt: 'desc' }
    });

    if (!latestResult) {
      console.log('❌ 面談サマリが見つかりません');
      return;
    }

    console.log(`✅ 最新サマリ: ${latestResult.interviewId}`);
    console.log(`   RequestID: ${latestResult.requestId}`);
    console.log(`   受信日時: ${latestResult.receivedAt.toLocaleString('ja-JP')}`);

    // 2. 対応する通知を確認
    console.log('\n2️⃣ 自動生成された通知確認');
    console.log('-'.repeat(60));

    const notifications = await prisma.notification.findMany({
      where: {
        category: 'interview',
        subcategory: 'summary_received',
        content: {
          contains: latestResult.interviewId
        }
      },
      include: {
        sender: {
          select: {
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📧 面談サマリ通知: ${notifications.length}件`);

    if (notifications.length === 0) {
      console.log('⚠️  自動生成された通知が見つかりません');
      console.log('   → Phase 2実装後に医療システムから新しいサマリを受信する必要があります');
      return;
    }

    notifications.forEach((notif, index) => {
      console.log(`\n通知 ${index + 1}:`);
      console.log(`  ID: ${notif.id}`);
      console.log(`  タイトル: ${notif.title}`);
      console.log(`  カテゴリ: ${notif.category} / ${notif.subcategory}`);
      console.log(`  優先度: ${notif.priority}`);
      console.log(`  ステータス: ${notif.status}`);
      console.log(`  送信者: ${notif.sender.name} (${notif.sender.employeeId})`);
      console.log(`  対象: ${notif.target}`);
      console.log(`  作成日時: ${notif.createdAt.toLocaleString('ja-JP')}`);
      console.log(`  送信日時: ${notif.sentAt ? notif.sentAt.toLocaleString('ja-JP') : '未送信'}`);

      // interviewID抽出
      const match = notif.content.match(/\[INTERVIEW_ID:([^\]]+)\]/);
      if (match) {
        console.log(`  📝 紐付けサマリID: ${match[1]}`);
      }
    });

    // 3. 通知とサマリの紐付け確認
    console.log('\n3️⃣ 通知とサマリの紐付け確認');
    console.log('-'.repeat(60));

    for (const notif of notifications) {
      const match = notif.content.match(/\[INTERVIEW_ID:([^\]]+)\]/);
      if (match) {
        const interviewId = match[1];
        const result = await prisma.interviewResult.findUnique({
          where: { interviewId }
        });

        if (result) {
          console.log(`✅ 通知 ${notif.id.substring(0, 8)}... → サマリ ${interviewId}`);
          console.log(`   サマリ内容: ${result.summary.substring(0, 50)}...`);
        } else {
          console.log(`❌ 通知 ${notif.id} → サマリ ${interviewId} (見つかりません)`);
        }
      }
    }

    // 4. システムユーザー確認
    console.log('\n4️⃣ システムユーザー確認');
    console.log('-'.repeat(60));

    const systemUser = await prisma.user.findFirst({
      where: { employeeId: 'SYSTEM' }
    });

    if (systemUser) {
      console.log(`✅ システムユーザー存在`);
      console.log(`   ID: ${systemUser.id}`);
      console.log(`   名前: ${systemUser.name}`);
      console.log(`   Email: ${systemUser.email}`);
      console.log(`   権限レベル: ${systemUser.permissionLevel}`);

      const systemNotifications = await prisma.notification.findMany({
        where: { senderId: systemUser.id },
        take: 5
      });

      console.log(`   送信した通知: ${systemNotifications.length}件（最新5件）`);
    } else {
      console.log(`⚠️  システムユーザーが見つかりません`);
      console.log(`   → 次回のサマリ受信時に自動生成されます`);
    }

    // 5. 統計情報
    console.log('\n5️⃣ 統計情報');
    console.log('-'.repeat(60));

    const totalSummaries = await prisma.interviewResult.count();
    const totalNotifications = await prisma.notification.count({
      where: {
        category: 'interview',
        subcategory: 'summary_received'
      }
    });

    console.log(`📊 面談サマリ総数: ${totalSummaries}件`);
    console.log(`📧 サマリ通知総数: ${totalNotifications}件`);
    console.log(`📈 通知生成率: ${totalSummaries > 0 ? ((totalNotifications / totalSummaries) * 100).toFixed(1) : 0}%`);

    if (totalNotifications < totalSummaries) {
      console.log(`\n⚠️  注意: Phase 2実装前に受信したサマリには通知が生成されていません`);
      console.log(`   → Phase 2実装後に受信するサマリから通知が自動生成されます`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ テスト完了\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationGeneration();
