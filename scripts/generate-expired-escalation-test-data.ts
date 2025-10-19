/**
 * Phase 6 期限到達判断テストデータ生成スクリプト
 *
 * 実行方法:
 * npx tsx scripts/generate-expired-escalation-test-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function generateTestData() {
  console.log('🚀 期限到達判断テストデータ生成開始...');

  try {
    // 1. テスト用ユーザーの取得（LEVEL_5-18）
    const managers = await prisma.user.findMany({
      where: {
        permissionLevel: { gte: 5 }
      },
      take: 10
    });

    if (managers.length === 0) {
      console.warn('⚠️ 警告: LEVEL_5以上のユーザーが見つかりません。テストデータを作成できません。');
      return;
    }

    console.log(`📊 対象管理職: ${managers.length}名`);

    // 2. テスト用提案の取得（期限到達済み）
    const expiredProposals = await prisma.post.findMany({
      where: {
        agendaVotingDeadline: { lte: new Date() },
        agendaLevel: {
          in: ['escalated_to_dept', 'escalated_to_facility', 'escalated_to_corp']
        }
      },
      take: 100
    });

    console.log(`📊 対象提案: ${expiredProposals.length}件`);

    if (expiredProposals.length === 0) {
      console.warn('⚠️ 警告: 期限到達済みの提案が見つかりません。');
      console.log('💡 通常の提案データを使用します...');

      // 代替: 通常の提案を使用
      const normalProposals = await prisma.post.findMany({
        where: {
          agendaLevel: {
            in: ['escalated_to_dept', 'escalated_to_facility', 'escalated_to_corp']
          }
        },
        take: 100
      });

      if (normalProposals.length === 0) {
        console.error('❌ エラー: 提案データが見つかりません。');
        return;
      }

      console.log(`📊 通常提案を使用: ${normalProposals.length}件`);
      await generateDecisions(managers, normalProposals);
    } else {
      await generateDecisions(managers, expiredProposals);
    }

    console.log('✅ テストデータ生成完了！');

  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function generateDecisions(managers: any[], proposals: any[]) {
  // 3. テストデータ生成
  const testDecisions = [];
  const decisionTypes = [
    'approve_at_current_level', // 60%
    'downgrade',                 // 25%
    'reject'                     // 15%
  ];

  const targetCount = Math.min(100, proposals.length);

  for (let i = 0; i < targetCount; i++) {
    const proposal = proposals[i % proposals.length];
    const manager = managers[i % managers.length];
    const decisionType =
      i < Math.floor(targetCount * 0.6) ? decisionTypes[0] :
      i < Math.floor(targetCount * 0.85) ? decisionTypes[1] :
      decisionTypes[2];

    const currentScore = proposal.agendaScore || Math.floor(Math.random() * 100);
    const targetScore =
      proposal.agendaLevel?.includes('CORP') ? 600 :
      proposal.agendaLevel?.includes('FACILITY') ? 300 :
      100;

    const achievementRate = (currentScore / targetScore) * 100;

    const deadline = proposal.agendaVotingDeadline
      ? new Date(proposal.agendaVotingDeadline)
      : subDays(new Date(), Math.floor(Math.random() * 14) + 1);

    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));

    testDecisions.push({
      postId: proposal.id,
      deciderId: manager.id,
      decision: decisionType,
      decisionReason: generateDecisionReason(decisionType, achievementRate),
      currentScore,
      targetScore,
      achievementRate,
      daysOverdue: Math.max(0, daysOverdue),
      agendaLevel: proposal.agendaLevel || 'escalated_to_dept',
      proposalType: proposal.proposalType,
      department: proposal.department || manager.department,
      facilityId: proposal.facilityId || manager.facilityId,
      createdAt: subDays(new Date(), Math.floor(Math.random() * 30))
    });
  }

  // 4. データベースに投入
  console.log('💾 データベースに投入中...');

  let successCount = 0;
  let errorCount = 0;

  for (const decision of testDecisions) {
    try {
      await prisma.expiredEscalationDecision.create({
        data: decision
      });
      successCount++;
    } catch (error: any) {
      // 既に存在する場合はスキップ
      if (error.code === 'P2002') {
        console.log(`⏭️  スキップ: 判断記録が既に存在します (postId: ${decision.postId})`);
      } else {
        console.error(`❌ エラー (postId: ${decision.postId}):`, error.message);
        errorCount++;
      }
    }
  }

  console.log('✅ テストデータ投入完了！');
  console.log(`📊 生成件数: ${testDecisions.length}件`);
  console.log(`   - 成功: ${successCount}件`);
  console.log(`   - エラー: ${errorCount}件`);
  console.log(`   - 承認: ${testDecisions.filter(d => d.decision === 'approve_at_current_level').length}件`);
  console.log(`   - ダウングレード: ${testDecisions.filter(d => d.decision === 'downgrade').length}件`);
  console.log(`   - 不採用: ${testDecisions.filter(d => d.decision === 'reject').length}件`);

  // 統計情報
  const totalAchievementRate = testDecisions.reduce((sum, d) => sum + d.achievementRate, 0);
  const avgAchievementRate = totalAchievementRate / testDecisions.length;

  const totalDaysOverdue = testDecisions.reduce((sum, d) => sum + d.daysOverdue, 0);
  const avgDaysOverdue = totalDaysOverdue / testDecisions.length;

  console.log(`📊 平均到達率: ${avgAchievementRate.toFixed(1)}%`);
  console.log(`📊 平均期限超過日数: ${avgDaysOverdue.toFixed(1)}日`);
}

function generateDecisionReason(decisionType: string, achievementRate: number): string {
  switch (decisionType) {
    case 'approve_at_current_level':
      return `到達率${achievementRate.toFixed(1)}%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。`;
    case 'downgrade':
      return `到達率${achievementRate.toFixed(1)}%で目標に届きませんでしたが、提案内容には価値があるため、下位レベルでの実施を検討します。`;
    case 'reject':
      return `到達率${achievementRate.toFixed(1)}%と低く、また期限を大幅に超過しているため、今回は不採用とします。別の形での提案を期待します。`;
    default:
      return '判断理由を記入してください。';
  }
}

// スクリプト実行
generateTestData()
  .then(() => {
    console.log('✅ 全処理完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
