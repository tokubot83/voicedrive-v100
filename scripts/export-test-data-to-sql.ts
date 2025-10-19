/**
 * Phase 6 期限到達判断テストデータ - SQLエクスポート
 *
 * 実行方法:
 * npx tsx scripts/export-test-data-to-sql.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportTestDataToSQL() {
  console.log('📤 テストデータSQLエクスポート開始...');

  try {
    const decisions = await prisma.expiredEscalationDecision.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    if (decisions.length === 0) {
      console.warn('⚠️ 警告: 判断履歴データが見つかりません。');
      console.log('💡 先に generate-expired-escalation-test-data.ts を実行してください。');
      return;
    }

    // SQL INSERT文を生成
    const sqlStatements: string[] = [];

    // ヘッダーコメント
    sqlStatements.push('-- Phase 6 期限到達判断履歴テストデータ');
    sqlStatements.push(`-- エクスポート日時: ${new Date().toISOString()}`);
    sqlStatements.push(`-- 件数: ${decisions.length}件`);
    sqlStatements.push('');

    // テーブル作成文（参考用）
    sqlStatements.push('-- テーブル作成（既に存在する場合はスキップ）');
    sqlStatements.push('CREATE TABLE IF NOT EXISTS "expired_escalation_decisions" (');
    sqlStatements.push('  "id" TEXT NOT NULL PRIMARY KEY,');
    sqlStatements.push('  "post_id" TEXT NOT NULL,');
    sqlStatements.push('  "decider_id" TEXT NOT NULL,');
    sqlStatements.push('  "decision" TEXT NOT NULL,');
    sqlStatements.push('  "decision_reason" TEXT NOT NULL,');
    sqlStatements.push('  "current_score" INTEGER NOT NULL,');
    sqlStatements.push('  "target_score" INTEGER NOT NULL,');
    sqlStatements.push('  "achievement_rate" REAL NOT NULL,');
    sqlStatements.push('  "days_overdue" INTEGER NOT NULL,');
    sqlStatements.push('  "agenda_level" TEXT NOT NULL,');
    sqlStatements.push('  "proposal_type" TEXT,');
    sqlStatements.push('  "department" TEXT,');
    sqlStatements.push('  "facility_id" TEXT,');
    sqlStatements.push('  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,');
    sqlStatements.push('  "updated_at" DATETIME NOT NULL');
    sqlStatements.push(');');
    sqlStatements.push('');

    // インデックス作成文
    sqlStatements.push('-- インデックス作成');
    sqlStatements.push('CREATE INDEX IF NOT EXISTS "expired_escalation_decisions_post_id_decider_id_facility_id_created_at_decision_idx" ON "expired_escalation_decisions"("post_id", "decider_id", "facility_id", "created_at", "decision");');
    sqlStatements.push('');

    // INSERT文
    sqlStatements.push('-- データ投入');
    sqlStatements.push('BEGIN TRANSACTION;');
    sqlStatements.push('');

    for (const decision of decisions) {
      const values = [
        escapeSQL(decision.id),
        escapeSQL(decision.postId),
        escapeSQL(decision.deciderId),
        escapeSQL(decision.decision),
        escapeSQL(decision.decisionReason),
        decision.currentScore,
        decision.targetScore,
        decision.achievementRate,
        decision.daysOverdue,
        escapeSQL(decision.agendaLevel),
        decision.proposalType ? escapeSQL(decision.proposalType) : 'NULL',
        decision.department ? escapeSQL(decision.department) : 'NULL',
        decision.facilityId ? escapeSQL(decision.facilityId) : 'NULL',
        escapeSQL(decision.createdAt.toISOString()),
        escapeSQL(decision.updatedAt.toISOString())
      ];

      const insertSQL = `INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES (${values.join(', ')});`;
      sqlStatements.push(insertSQL);
    }

    sqlStatements.push('');
    sqlStatements.push('COMMIT;');
    sqlStatements.push('');

    // サマリー統計
    const approvalCount = decisions.filter(d => d.decision === 'approve_at_current_level').length;
    const downgradeCount = decisions.filter(d => d.decision === 'downgrade').length;
    const rejectCount = decisions.filter(d => d.decision === 'reject').length;
    const avgAchievementRate = decisions.reduce((sum, d) => sum + d.achievementRate, 0) / decisions.length;
    const avgDaysOverdue = decisions.reduce((sum, d) => sum + d.daysOverdue, 0) / decisions.length;

    sqlStatements.push('-- サマリー統計');
    sqlStatements.push(`-- 総件数: ${decisions.length}件`);
    sqlStatements.push(`-- 承認: ${approvalCount}件 (${((approvalCount / decisions.length) * 100).toFixed(1)}%)`);
    sqlStatements.push(`-- ダウングレード: ${downgradeCount}件 (${((downgradeCount / decisions.length) * 100).toFixed(1)}%)`);
    sqlStatements.push(`-- 不採用: ${rejectCount}件 (${((rejectCount / decisions.length) * 100).toFixed(1)}%)`);
    sqlStatements.push(`-- 平均到達率: ${avgAchievementRate.toFixed(1)}%`);
    sqlStatements.push(`-- 平均期限超過日数: ${avgDaysOverdue.toFixed(1)}日`);

    // 保存
    const outputPath = path.join('mcp-shared', 'test-data', 'expired-escalation-history.sql');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8');

    console.log(`✅ SQLエクスポート完了: ${outputPath}`);
    console.log(`📊 件数: ${decisions.length}件`);
    console.log(`📊 サマリー:`);
    console.log(`   - 承認: ${approvalCount}件 (${((approvalCount / decisions.length) * 100).toFixed(1)}%)`);
    console.log(`   - ダウングレード: ${downgradeCount}件 (${((downgradeCount / decisions.length) * 100).toFixed(1)}%)`);
    console.log(`   - 不採用: ${rejectCount}件 (${((rejectCount / decisions.length) * 100).toFixed(1)}%)`);
    console.log(`   - 平均到達率: ${avgAchievementRate.toFixed(1)}%`);
    console.log(`   - 平均期限超過日数: ${avgDaysOverdue.toFixed(1)}日`);

    return { decisions, approvalCount, downgradeCount, rejectCount };

  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * SQL文字列をエスケープ
 */
function escapeSQL(value: string | null): string {
  if (value === null) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

// スクリプト実行
exportTestDataToSQL()
  .then(() => {
    console.log('✅ 全処理完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
