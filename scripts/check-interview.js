// Phase 2テスト用Interview確認
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInterview() {
  try {
    console.log('\n🔍 Phase 2テスト用Interview確認\n');
    console.log('='.repeat(60));

    const interview = await prisma.interview.findUnique({
      where: { id: 'test-req-phase2-001' },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            email: true
          }
        }
      }
    });

    if (!interview) {
      console.log('❌ Interview (ID: test-req-phase2-001) が見つかりません\n');
      console.log('→ scripts/create-phase2-test-interview.js を実行してください');
    } else {
      console.log('✅ Interview found!\n');
      console.log(`ID: ${interview.id}`);
      console.log(`Topic: ${interview.topic}`);
      console.log(`Status: ${interview.status}`);
      console.log(`Employee ID (User.id): ${interview.employee.id}`);
      console.log(`Employee Name: ${interview.employee.name}`);
      console.log(`Employee ID (employeeId): ${interview.employee.employeeId}`);
      console.log(`Email: ${interview.employee.email}`);
      console.log(`Created: ${interview.createdAt.toLocaleString('ja-JP')}`);
    }

    console.log('\n' + '='.repeat(60));

    // 最新のサマリも確認
    const latestResult = await prisma.interviewResult.findFirst({
      where: { requestId: 'test-req-phase2-001' },
      orderBy: { receivedAt: 'desc' }
    });

    if (latestResult) {
      console.log('\n✅ 最新サマリ:');
      console.log(`   InterviewResult ID: ${latestResult.id}`);
      console.log(`   Interview ID: ${latestResult.interviewId}`);
      console.log(`   Request ID: ${latestResult.requestId}`);
      console.log(`   受信: ${latestResult.receivedAt.toLocaleString('ja-JP')}`);
    } else {
      console.log('\n⚠️  サマリが見つかりません');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 確認完了\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInterview();
