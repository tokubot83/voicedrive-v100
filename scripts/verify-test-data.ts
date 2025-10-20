/**
 * テストデータ検証スクリプト
 * 目標スコアが正しく設定されているか確認
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTestData() {
  console.log('🔍 テストデータ検証開始...\n');

  try {
    const decisions = await prisma.expiredEscalationDecision.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    console.log(`📊 総件数: ${decisions.length}件\n`);

    // 議題レベル別に分類
    const byLevel = {
      dept: decisions.filter(d => d.agendaLevel.includes('dept')),
      facility: decisions.filter(d => d.agendaLevel.includes('facility')),
      corp: decisions.filter(d => d.agendaLevel.includes('corp'))
    };

    console.log('【部署レベル】(' + byLevel.dept.length + '件)');
    byLevel.dept.forEach(d => {
      console.log(`  - スコア: ${d.currentScore}/${d.targetScore} (${d.achievementRate.toFixed(1)}%) - ${d.decision}`);
    });

    console.log('\n【施設レベル】(' + byLevel.facility.length + '件)');
    byLevel.facility.forEach(d => {
      console.log(`  - スコア: ${d.currentScore}/${d.targetScore} (${d.achievementRate.toFixed(1)}%) - ${d.decision}`);
    });

    console.log('\n【法人レベル】(' + byLevel.corp.length + '件)');
    byLevel.corp.forEach(d => {
      console.log(`  - スコア: ${d.currentScore}/${d.targetScore} (${d.achievementRate.toFixed(1)}%) - ${d.decision}`);
    });

    // 検証
    console.log('\n✅ 検証結果:');
    const deptOK = byLevel.dept.every(d => d.targetScore === 100);
    const facilityOK = byLevel.facility.every(d => d.targetScore === 300);
    const corpOK = byLevel.corp.every(d => d.targetScore === 600);

    console.log(`  部署レベル目標スコア: ${deptOK ? '✅ 正常 (100点)' : '❌ 異常'}`);
    console.log(`  施設レベル目標スコア: ${facilityOK ? '✅ 正常 (300点)' : '❌ 異常'}`);
    console.log(`  法人レベル目標スコア: ${corpOK ? '✅ 正常 (600点)' : '❌ 異常'}`);

  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestData()
  .then(() => {
    console.log('\n✅ 検証完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
