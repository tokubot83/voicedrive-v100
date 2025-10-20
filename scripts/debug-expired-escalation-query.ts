/**
 * 期限到達判断履歴クエリのデバッグスクリプト
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugQuery() {
  try {
    console.log('🔍 デバッグ開始...\n');

    // 1. 全レコード数確認
    const totalCount = await prisma.expiredEscalationDecision.count();
    console.log(`📊 全レコード数: ${totalCount}件\n`);

    // 2. 最初の5件を取得
    const decisions = await prisma.expiredEscalationDecision.findMany({
      take: 5,
      include: {
        post: {
          select: {
            id: true,
            content: true,
            proposalType: true,
            agendaLevel: true
          }
        },
        decider: {
          select: {
            id: true,
            name: true,
            department: true,
            facilityId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ 取得件数: ${decisions.length}件\n`);

    decisions.forEach((d, index) => {
      console.log(`【${index + 1}】`);
      console.log(`  ID: ${d.id}`);
      console.log(`  Decision: ${d.decision}`);
      console.log(`  Post ID: ${d.postId}`);
      console.log(`  Decider ID: ${d.deciderId}`);
      console.log(`  Decider Name: ${d.decider.name}`);
      console.log(`  Achievement Rate: ${d.achievementRate}%`);
      console.log(`  Days Overdue: ${d.daysOverdue}`);
      console.log(`  Created At: ${d.createdAt}\n`);
    });

    // 3. 権限レベル99の条件でクエリ（空のwhereCondition）
    console.log('🔍 権限レベル99のクエリ実行...\n');
    const level99Query = await prisma.expiredEscalationDecision.findMany({
      where: {}, // 空 = 全データ
      take: 10
    });
    console.log(`✅ LEVEL 99クエリ結果: ${level99Query.length}件\n`);

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugQuery();
