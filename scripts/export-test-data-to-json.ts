/**
 * Phase 6 期限到達判断テストデータ - JSONエクスポート
 *
 * 実行方法:
 * npx tsx scripts/export-test-data-to-json.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportTestData() {
  console.log('📤 テストデータエクスポート開始...');

  try {
    const decisions = await prisma.expiredEscalationDecision.findMany({
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                department: true
              }
            }
          }
        },
        decider: {
          select: {
            id: true,
            name: true,
            department: true,
            permissionLevel: true,
            facilityId: true
          }
        }
      },
      take: 100,
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (decisions.length === 0) {
      console.warn('⚠️ 警告: 判断履歴データが見つかりません。');
      console.log('💡 先に generate-expired-escalation-test-data.ts を実行してください。');
      return;
    }

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalCount: decisions.length,
        version: '1.0.0',
        description: 'Phase 6 期限到達判断履歴テストデータ'
      },
      summary: {
        totalDecisions: decisions.length,
        approvalCount: decisions.filter(d => d.decision === 'approve_at_current_level').length,
        downgradeCount: decisions.filter(d => d.decision === 'downgrade').length,
        rejectCount: decisions.filter(d => d.decision === 'reject').length,
        averageAchievementRate:
          decisions.reduce((sum, d) => sum + d.achievementRate, 0) / decisions.length,
        averageDaysOverdue:
          decisions.reduce((sum, d) => sum + d.daysOverdue, 0) / decisions.length
      },
      decisions: decisions.map(d => ({
        id: d.id,
        postId: d.postId,
        postContent: d.post.content.substring(0, 100) + '...', // 最初の100文字のみ
        postAgendaLevel: d.post.agendaLevel,
        postProposalType: d.post.proposalType,
        postAuthor: d.post.author
          ? {
              id: d.post.author.id,
              name: d.post.author.name,
              department: d.post.author.department
            }
          : null,
        deciderId: d.deciderId,
        deciderName: d.decider.name,
        deciderDepartment: d.decider.department,
        deciderLevel: Number(d.decider.permissionLevel),
        deciderFacilityId: d.decider.facilityId,
        decision: d.decision,
        decisionReason: d.decisionReason,
        currentScore: d.currentScore,
        targetScore: d.targetScore,
        achievementRate: Number(d.achievementRate.toFixed(1)),
        daysOverdue: d.daysOverdue,
        agendaLevel: d.agendaLevel,
        proposalType: d.proposalType,
        department: d.department,
        facilityId: d.facilityId,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString()
      }))
    };

    // 保存
    const outputPath = path.join('mcp-shared', 'test-data', 'expired-escalation-history.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`✅ JSONエクスポート完了: ${outputPath}`);
    console.log(`📊 件数: ${exportData.decisions.length}件`);
    console.log(`📊 サマリー:`);
    console.log(`   - 承認: ${exportData.summary.approvalCount}件 (${((exportData.summary.approvalCount / exportData.summary.totalDecisions) * 100).toFixed(1)}%)`);
    console.log(`   - ダウングレード: ${exportData.summary.downgradeCount}件 (${((exportData.summary.downgradeCount / exportData.summary.totalDecisions) * 100).toFixed(1)}%)`);
    console.log(`   - 不採用: ${exportData.summary.rejectCount}件 (${((exportData.summary.rejectCount / exportData.summary.totalDecisions) * 100).toFixed(1)}%)`);
    console.log(`   - 平均到達率: ${exportData.summary.averageAchievementRate.toFixed(1)}%`);
    console.log(`   - 平均期限超過日数: ${exportData.summary.averageDaysOverdue.toFixed(1)}日`);

    return exportData;

  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
exportTestData()
  .then(() => {
    console.log('✅ 全処理完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
