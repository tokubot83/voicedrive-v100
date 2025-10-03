// 受信済みサマリデータ確認スクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSummaries() {
  try {
    // サマリデータ取得
    const results = await prisma.interviewResult.findMany({
      orderBy: { receivedAt: 'desc' }
    });

    console.log(`\n📊 受信済みサマリデータ: ${results.length}件\n`);

    results.forEach((result, index) => {
      console.log(`${index + 1}. InterviewID: ${result.interviewId}`);
      console.log(`   RequestID: ${result.requestId}`);
      console.log(`   完了日時: ${result.completedAt}`);
      console.log(`   実施時間: ${result.duration}分`);
      console.log(`   サマリ: ${result.summary.substring(0, 50)}...`);
      console.log(`   受信日時: ${result.receivedAt}`);
      console.log('');
    });

    // 面談データとの紐付け確認
    for (const result of results) {
      const interviewId = result.requestId.replace('interview_', '');
      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          employee: {
            select: {
              name: true,
              employeeId: true
            }
          }
        }
      });

      if (interview) {
        console.log(`✅ ${result.interviewId} → 面談記録あり（従業員: ${interview.employee.name}）`);
      } else {
        console.log(`⚠️  ${result.interviewId} → 面談記録なし`);
      }
    }

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSummaries();
