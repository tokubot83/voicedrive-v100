/**
 * 投票設定変更ログ記録機能の統合テスト
 *
 * 実行方法: npm run test:voting-log
 */

import { PrismaClient } from '@prisma/client';
import {
  logVotingScopeChange,
  logVotingGroupChange,
  logPrimaryApproverChange,
  logProjectSettingChange,
} from '../services/votingSettingLogService';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 投票設定変更ログ記録機能テスト開始\n');

  try {
    // テストユーザーIDを取得（実際には既存のユーザーIDを使用）
    const testUserId = 'test-user-001';
    const testUserLevel = 99;

    // テスト1: 投票スコープ変更ログ
    console.log('📝 テスト1: 投票スコープ変更ログ記録');
    const scopeLog = await logVotingScopeChange({
      departmentName: '看護部-看護科',
      oldPattern: 'パターンA',
      newPattern: 'パターンB',
      affectedCount: 80,
      changedBy: testUserId,
      changedByLevel: testUserLevel,
    });
    console.log('✅ 投票スコープ変更ログ記録成功:', scopeLog.id);
    console.log(`   - 説明: ${scopeLog.changeDescription}`);
    console.log(`   - 影響: ${scopeLog.impactDescription}\n`);

    // テスト2: 投票グループ作成ログ
    console.log('📝 テスト2: 投票グループ作成ログ記録');
    const groupLog = await logVotingGroupChange({
      groupName: '小規模事務部門グループ',
      action: 'create',
      departments: ['総務科', '経理科', '人事科'],
      affectedCount: 22,
      changedBy: testUserId,
      changedByLevel: testUserLevel,
    });
    console.log('✅ 投票グループ作成ログ記録成功:', groupLog.id);
    console.log(`   - 説明: ${groupLog.changeDescription}`);
    console.log(`   - 影響: ${groupLog.impactDescription}\n`);

    // テスト3: 主承認者ローテーション変更ログ
    console.log('📝 テスト3: 主承認者ローテーション変更ログ記録');
    const approverLog = await logPrimaryApproverChange({
      groupName: 'リハ専門職グループ',
      changeType: 'rotation',
      description: 'リハ専門職グループのローテーション期間を月次から四半期に変更',
      affectedCount: 3,
      changedBy: testUserId,
      changedByLevel: testUserLevel,
      beforeValue: { period: 'monthly' },
      afterValue: { period: 'quarterly' },
    });
    console.log('✅ 主承認者ローテーション変更ログ記録成功:', approverLog.id);
    console.log(`   - 説明: ${approverLog.changeDescription}`);
    console.log(`   - 影響: ${approverLog.impactDescription}\n`);

    // テスト4: プロジェクト閾値変更ログ
    console.log('📝 テスト4: プロジェクト閾値変更ログ記録');
    const projectLog = await logProjectSettingChange({
      category: 'プロジェクト化閾値',
      changeDescription: '施設プロジェクト化の閾値を500点から400点に引き下げ',
      impactDescription: 'プロジェクト化しやすくなる',
      changedBy: testUserId,
      changedByLevel: testUserLevel,
      beforeValue: { facility: 500 },
      afterValue: { facility: 400 },
    });
    console.log('✅ プロジェクト閾値変更ログ記録成功:', projectLog.id);
    console.log(`   - 説明: ${projectLog.changeDescription}`);
    console.log(`   - 影響: ${projectLog.impactDescription}\n`);

    // テスト5: ログ一覧取得
    console.log('📝 テスト5: 変更ログ一覧取得');
    const logs = await prisma.votingSettingChangeLog.findMany({
      take: 10,
      orderBy: {
        changedAt: 'desc',
      },
      select: {
        id: true,
        mode: true,
        category: true,
        changeDescription: true,
        changedAt: true,
      },
    });
    console.log(`✅ ログ取得成功: ${logs.length}件`);
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. [${log.mode}] ${log.category} - ${log.changeDescription.substring(0, 50)}...`);
    });
    console.log();

    // テスト6: 統計情報取得
    console.log('📝 テスト6: 統計情報取得');
    const totalCount = await prisma.votingSettingChangeLog.count();
    const agendaCount = await prisma.votingSettingChangeLog.count({
      where: { mode: 'agenda' },
    });
    const projectCount = await prisma.votingSettingChangeLog.count({
      where: { mode: 'project' },
    });
    console.log('✅ 統計情報取得成功:');
    console.log(`   - 総変更回数: ${totalCount}回`);
    console.log(`   - 議題モード: ${agendaCount}回`);
    console.log(`   - プロジェクトモード: ${projectCount}回\n`);

    console.log('🎉 すべてのテストが成功しました！');
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// テスト実行
if (require.main === module) {
  runTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { runTests };
