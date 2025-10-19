/**
 * Phase 6: 期限到達・未達成昇格のテストデータ作成スクリプト
 *
 * このスクリプトは以下のシナリオのテストデータを作成します：
 * 1. 50点で施設議題に昇格したが、85点で期限到達（100点未達成）
 * 2. 100点で法人検討に昇格したが、250点で期限到達（300点未達成）
 * 3. 300点で法人議題に昇格したが、550点で期限到達（600点未達成）
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createExpiredEscalationTestData() {
  console.log('🚀 Phase 6テストデータ作成開始...\n');

  try {
    // テスト用ユーザーを取得（既存のユーザーを使用）
    // permissionLevel: 1=スタッフ, 3=主任, 5=副看護部長, 7=看護部長, 9=理事長
    const testAuthor = await prisma.user.findFirst({
      where: {
        permissionLevel: { lte: 1 } // スタッフレベル
      }
    });

    const facilityManager = await prisma.user.findFirst({
      where: {
        permissionLevel: { gte: 5, lte: 7 } // 副看護部長〜看護部長
      }
    });

    const corpManager = await prisma.user.findFirst({
      where: {
        permissionLevel: { gte: 9 } // 理事長レベル
      }
    });

    if (!testAuthor || !facilityManager || !corpManager) {
      console.error('❌ 必要なユーザーが見つかりません');
      return;
    }

    console.log(`✅ テストユーザー取得完了`);
    console.log(`   投稿者: ${testAuthor.name} (${testAuthor.permissionLevel})`);
    console.log(`   施設管理者: ${facilityManager.name} (${facilityManager.permissionLevel})`);
    console.log(`   法人管理者: ${corpManager.name} (${corpManager.permissionLevel})\n`);

    // 過去の日付（期限切れ）を作成
    const expiredDate1 = new Date();
    expiredDate1.setDate(expiredDate1.getDate() - 3); // 3日前に期限切れ

    const expiredDate2 = new Date();
    expiredDate2.setDate(expiredDate2.getDate() - 5); // 5日前に期限切れ

    const expiredDate3 = new Date();
    expiredDate3.setDate(expiredDate3.getDate() - 7); // 7日前に期限切れ

    // シナリオ1: 50点→施設議題昇格→85点で期限到達
    console.log('📝 シナリオ1作成: 50点→施設議題昇格→85点で期限到達');
    const post1 = await prisma.post.create({
      data: {
        type: 'proposal',
        content: '【テストデータ】業務効率化のための新システム導入提案 - 施設議題レベルで昇格したが目標スコア未達成',
        authorId: testAuthor.id,
        status: 'active',
        anonymityLevel: 'named',
        proposalType: 'improvement',
        agendaScore: 85,
        agendaLevel: 'FACILITY_AGENDA',
        agendaStatus: 'escalated_to_facility',
        agendaDecisionBy: facilityManager.id,
        agendaDecisionAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10日前に昇格
        agendaDecisionReason: '緊急性が高いため施設議題に昇格',
        agendaVotingDeadline: expiredDate1,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15日前に作成
      }
    });
    console.log(`   ✅ 作成完了: ${post1.id}`);
    console.log(`      現在スコア: 85点 / 目標: 100点 / 到達率: 85%`);
    console.log(`      期限: ${expiredDate1.toLocaleDateString()} (3日経過)\n`);

    // シナリオ2: 100点→法人検討昇格→250点で期限到達
    console.log('📝 シナリオ2作成: 100点→法人検討昇格→250点で期限到達');
    const post2 = await prisma.post.create({
      data: {
        type: 'proposal',
        content: '【テストデータ】全社的なワークライフバランス改善プログラム - 法人検討レベルで昇格したが目標スコア未達成',
        authorId: testAuthor.id,
        status: 'active',
        anonymityLevel: 'named',
        proposalType: 'system',
        agendaScore: 250,
        agendaLevel: 'CORP_REVIEW',
        agendaStatus: 'escalated_to_corp_review',
        agendaDecisionBy: corpManager.id,
        agendaDecisionAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12日前に昇格
        agendaDecisionReason: '法人全体に影響する重要な提案のため',
        agendaVotingDeadline: expiredDate2,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20日前に作成
      }
    });
    console.log(`   ✅ 作成完了: ${post2.id}`);
    console.log(`      現在スコア: 250点 / 目標: 300点 / 到達率: 83%`);
    console.log(`      期限: ${expiredDate2.toLocaleDateString()} (5日経過)\n`);

    // シナリオ3: 300点→法人議題昇格→550点で期限到達
    console.log('📝 シナリオ3作成: 300点→法人議題昇格→550点で期限到達');
    const post3 = await prisma.post.create({
      data: {
        type: 'proposal',
        content: '【テストデータ】組織改革と新人事制度の導入 - 法人議題レベルで昇格したが目標スコア未達成',
        authorId: testAuthor.id,
        status: 'active',
        anonymityLevel: 'named',
        proposalType: 'policy',
        agendaScore: 550,
        agendaLevel: 'CORP_AGENDA',
        agendaStatus: 'escalated_to_corp_agenda',
        agendaDecisionBy: corpManager.id,
        agendaDecisionAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14日前に昇格
        agendaDecisionReason: '経営戦略上の最優先事項',
        agendaVotingDeadline: expiredDate3,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25日前に作成
      }
    });
    console.log(`   ✅ 作成完了: ${post3.id}`);
    console.log(`      現在スコア: 550点 / 目標: 600点 / 到達率: 92%`);
    console.log(`      期限: ${expiredDate3.toLocaleDateString()} (7日経過)\n`);

    console.log('✅ Phase 6テストデータ作成完了！\n');
    console.log('📊 作成されたテストデータ:');
    console.log(`   1. ${post1.id} - 施設議題 (85/100点, 85%)`);
    console.log(`   2. ${post2.id} - 法人検討 (250/300点, 83%)`);
    console.log(`   3. ${post3.id} - 法人議題 (550/600点, 92%)`);
    console.log('\n🧪 テスト方法:');
    console.log('   GET http://localhost:3003/api/agenda/expired-escalations');

  } catch (error) {
    console.error('❌ エラー発生:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
createExpiredEscalationTestData()
  .then(() => {
    console.log('\n✅ スクリプト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプトエラー:', error);
    process.exit(1);
  });
