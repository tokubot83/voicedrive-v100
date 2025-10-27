/**
 * Audit Log Severity Backfill Script
 *
 * 既存のAuditLogレコードに重要度（severity）を自動設定するスクリプト
 *
 * 実行方法:
 *   npx ts-node scripts/backfill-audit-severity.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 重要度を自動判定する関数
 */
function calculateSeverity(
  action: string,
  isEmergencyAction: boolean,
  executorLevel: number | null
): string {
  // 緊急操作は必ずcritical
  if (isEmergencyAction) {
    return 'critical';
  }

  // Level 99（permissionLevel >= 20）の操作
  if (executorLevel !== null && executorLevel >= 20) {
    if (action.includes('SYSTEM_MODE') || action.includes('PERMISSION_LEVEL')) {
      return 'critical';
    }
    return 'high';
  }

  // アクション内容に基づく判定
  if (action.includes('SYSTEM_MODE') || action.includes('PERMISSION_LEVEL')) {
    return 'critical';
  }

  if (action.includes('EMERGENCY') || action.includes('OVERRIDE')) {
    return 'high';
  }

  if (action.includes('DELETE') || action.includes('SUSPEND') || action.includes('REMOVE')) {
    return 'medium';
  }

  // デフォルトは低
  return 'low';
}

async function main() {
  console.log('🔍 既存のAuditLogレコードを取得中...');

  const logs = await prisma.auditLog.findMany({
    where: {
      severity: null, // severityが未設定のレコードのみ
    },
  });

  console.log(`✅ ${logs.length}件のレコードが見つかりました\n`);

  if (logs.length === 0) {
    console.log('✨ すべてのレコードにseverityが設定済みです');
    return;
  }

  let updated = 0;
  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  console.log('⚙️  重要度を計算して更新中...\n');

  for (const log of logs) {
    const severity = calculateSeverity(
      log.action,
      log.isEmergencyAction,
      log.executorLevel ? Number(log.executorLevel) : null
    );

    await prisma.auditLog.update({
      where: { id: log.id },
      data: { severity },
    });

    severityCounts[severity as keyof typeof severityCounts]++;
    updated++;

    // 進捗表示（100件ごと）
    if (updated % 100 === 0) {
      console.log(`  📝 ${updated}/${logs.length}件更新完了...`);
    }
  }

  console.log(`\n✅ 更新完了: ${updated}件\n`);

  // 統計情報を表示
  console.log('📊 重要度別の統計:');
  console.log(`  🔴 Critical: ${severityCounts.critical}件`);
  console.log(`  🟠 High:     ${severityCounts.high}件`);
  console.log(`  🟡 Medium:   ${severityCounts.medium}件`);
  console.log(`  🟢 Low:      ${severityCounts.low}件`);

  console.log('\n✨ バックフィル完了!');
}

main()
  .catch((error) => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
