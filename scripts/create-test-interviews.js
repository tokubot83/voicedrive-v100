// テスト用面談レコード作成
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestInterviews() {
  try {
    // テスト用ユーザーを取得または作成
    let testUser = await prisma.user.findFirst({
      where: { employeeId: 'EMP-001' }
    });

    if (!testUser) {
      console.log('テストユーザーを作成します...');
      testUser = await prisma.user.create({
        data: {
          employeeId: 'EMP-001',
          name: 'テスト 太郎',
          department: '内科',
          position: '医師',
          accountType: 'EMPLOYEE',
          email: 'test001@example.com',
          isRetired: false,
          facilityId: 'FAC-001',
          permissionLevel: 1
        }
      });
      console.log(`✅ テストユーザー作成: ${testUser.name} (${testUser.employeeId})`);
    } else {
      console.log(`既存ユーザー使用: ${testUser.name} (${testUser.employeeId})`);
    }

    // 統合テストで使用されたrequestIdに対応する面談レコードを作成
    const testInterviewIds = [
      'test-req-001',
      'test-req-002',
      'test-req-003',
      'test-req-004',
      'test-req-005',
      'test-req-update',
      'test-req-followup-yes',
      'test-req-followup-no'
    ];

    for (const requestId of testInterviewIds) {
      // requestIdから面談IDを抽出 (interview_プレフィックスを除去)
      const interviewId = requestId.replace('interview_', '');

      // 既存チェック
      const existing = await prisma.interview.findUnique({
        where: { id: interviewId }
      });

      if (existing) {
        console.log(`⏩ スキップ（既存）: ${interviewId}`);
        continue;
      }

      // 面談レコード作成
      const interview = await prisma.interview.create({
        data: {
          id: interviewId,
          employeeId: testUser.id,
          category: 'BASIC',
          type: 'regular_followup',
          topic: `統合テスト用面談 (${interviewId})`,
          preferredDate: new Date(),
          scheduledDate: new Date(),
          actualDate: new Date(),
          duration: 30,
          status: 'completed',
          urgencyLevel: 'this_week',
          interviewerName: '人事 花子',
          result: '面談実施完了',
          notes: '統合テスト用の面談記録'
        }
      });

      console.log(`✅ 面談レコード作成: ${interview.id}`);
    }

    console.log('\n✅ テスト面談レコード作成完了');

    // 作成結果確認
    const interviews = await prisma.interview.findMany({
      where: {
        id: {
          in: testInterviewIds.map(id => id.replace('interview_', ''))
        }
      },
      include: {
        employee: {
          select: {
            name: true,
            employeeId: true
          }
        }
      }
    });

    console.log(`\n📊 作成された面談レコード: ${interviews.length}件`);
    interviews.forEach(i => {
      console.log(`  - ${i.id}: ${i.employee.name} (${i.topic})`);
    });

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestInterviews();
