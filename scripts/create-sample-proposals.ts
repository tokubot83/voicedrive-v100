/**
 * Phase 6 テスト用提案データ作成スクリプト
 * 期限到達判断のテストに必要な提案を作成
 *
 * 実行方法:
 * npx tsx scripts/create-sample-proposals.ts
 */

import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function createSampleProposals() {
  console.log('🚀 テスト用提案データ作成開始...');

  try {
    // 1. ユーザーを取得
    const users = await prisma.user.findMany({
      take: 10
    });

    if (users.length === 0) {
      console.error('❌ エラー: ユーザーが見つかりません。');
      return;
    }

    console.log(`📊 対象ユーザー: ${users.length}名`);

    // 2. テスト用提案を作成
    const proposals = [
      // 部署議題レベル（期限到達済み）
      {
        content: '【テスト】夜勤看護師の休憩時間確保について',
        agendaLevel: 'escalated_to_dept',
        agendaScore: 80,
        proposalType: 'kaizen',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 5),
        visibility: 'department',
      },
      {
        content: '【テスト】電子カルテの操作性改善提案',
        agendaLevel: 'escalated_to_dept',
        agendaScore: 60,
        proposalType: 'kaizen',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 3),
        visibility: 'department',
      },
      {
        content: '【テスト】新人教育プログラムの見直し',
        agendaLevel: 'escalated_to_dept',
        agendaScore: 45,
        proposalType: 'new_initiative',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 7),
        visibility: 'department',
      },
      // 施設議題レベル（期限到達済み）
      {
        content: '【テスト】院内感染対策マニュアルの改訂',
        agendaLevel: 'escalated_to_facility',
        agendaScore: 250,
        proposalType: 'kaizen',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 10),
        visibility: 'facility',
      },
      {
        content: '【テスト】患者満足度向上のための接遇研修',
        agendaLevel: 'escalated_to_facility',
        agendaScore: 180,
        proposalType: 'training',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 14),
        visibility: 'facility',
      },
      {
        content: '【テスト】医療安全インシデント報告システムの導入',
        agendaLevel: 'escalated_to_facility',
        agendaScore: 150,
        proposalType: 'new_initiative',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 8),
        visibility: 'facility',
      },
      // 法人議題レベル（期限到達済み）
      {
        content: '【テスト】法人全体の人材育成体系の統一',
        agendaLevel: 'escalated_to_corp',
        agendaScore: 550,
        proposalType: 'new_initiative',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 20),
        visibility: 'corporate',
      },
      {
        content: '【テスト】法人内の看護師交流プログラム',
        agendaLevel: 'escalated_to_corp',
        agendaScore: 480,
        proposalType: 'collaboration',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 25),
        visibility: 'corporate',
      },
      {
        content: '【テスト】法人共通の勤怠管理システム導入',
        agendaLevel: 'escalated_to_corp',
        agendaScore: 420,
        proposalType: 'kaizen',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 15),
        visibility: 'corporate',
      },
      // 未到達（期限到達済み）
      {
        content: '【テスト】休憩室の環境改善について',
        agendaLevel: 'escalated_to_dept',
        agendaScore: 30,
        proposalType: 'kaizen',
        department: '看護部',
        facilityId: 'facility-001',
        agendaVotingDeadline: subDays(new Date(), 12),
        visibility: 'department',
      },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < proposals.length; i++) {
      const proposalData = proposals[i];
      const author = users[i % users.length];

      try {
        const post = await prisma.post.create({
          data: {
            type: 'agenda_proposal',
            content: proposalData.content,
            agendaLevel: proposalData.agendaLevel,
            agendaScore: proposalData.agendaScore,
            proposalType: proposalData.proposalType,
            projectDepartment: proposalData.department,
            projectFacilityId: proposalData.facilityId,
            agendaVotingDeadline: proposalData.agendaVotingDeadline,
            authorId: author.id,
            anonymityLevel: 'none',
            agendaStatus: 'FACILITY_VOTE_EXPIRED_PENDING_DECISION',
            createdAt: subDays(new Date(), 30),
            updatedAt: new Date(),
          }
        });

        console.log(`✅ 作成成功: ${proposalData.content} (ID: ${post.id})`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ エラー: ${proposalData.content}`, error.message);
        errorCount++;
      }
    }

    console.log('\n✅ テスト用提案データ作成完了！');
    console.log(`📊 作成件数: ${proposals.length}件`);
    console.log(`   - 成功: ${successCount}件`);
    console.log(`   - エラー: ${errorCount}件`);
    console.log(`\n📊 内訳:`);
    console.log(`   - 部署議題レベル: 4件`);
    console.log(`   - 施設議題レベル: 3件`);
    console.log(`   - 法人議題レベル: 3件`);

  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
createSampleProposals()
  .then(() => {
    console.log('✅ 全処理完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
