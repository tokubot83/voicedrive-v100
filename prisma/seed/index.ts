/**
 * メインシードスクリプト
 *
 * 組織構造・職種・議題モード設定を順番に投入
 * Phase 1 実装: 初期データセットアップ
 */

import { PrismaClient } from '@prisma/client';
import { seedFacilities } from './01-facilities';
import { seedOrganizationStructure } from './02-organization-structure';
import { seedJobCategories } from './03-job-categories';
import { seedAgendaModeConfigs } from './04-agenda-mode-configs';
import { seedCommitteeSettings } from './05-committee-settings';
import { seedSidebarMenuConfigs } from './10-sidebar-menu-configs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 VoiceDrive 組織構造シードデータ投入開始\n');
  console.log('='.repeat(60));
  console.log('Phase 1: 組織構造拡張 - 初期データセットアップ');
  console.log('='.repeat(60));
  console.log('');

  const startTime = Date.now();
  const results: any = {};

  try {
    // ========================================
    // Step 1: 施設マスターデータ
    // ========================================
    console.log('📍 Step 1/4: 施設マスターデータ投入');
    console.log('-'.repeat(60));
    results.facilities = await seedFacilities();
    console.log('');

    // ========================================
    // Step 2: 組織構造マスターデータ
    // ========================================
    console.log('📍 Step 2/4: 組織構造マスターデータ投入');
    console.log('-'.repeat(60));
    results.organizations = await seedOrganizationStructure();
    console.log('');

    // ========================================
    // Step 3: 職種マスターデータ
    // ========================================
    console.log('📍 Step 3/4: 職種マスターデータ投入');
    console.log('-'.repeat(60));
    results.jobCategories = await seedJobCategories();
    console.log('');

    // ========================================
    // Step 4: 議題モード設定
    // ========================================
    console.log('📍 Step 4/6: 議題モード設定投入');
    console.log('-'.repeat(60));
    results.agendaModeConfigs = await seedAgendaModeConfigs();
    console.log('');

    // ========================================
    // Step 5: 委員会設定マスターデータ
    // ========================================
    console.log('📍 Step 5/6: 委員会設定マスターデータ投入');
    console.log('-'.repeat(60));
    await seedCommitteeSettings();
    console.log('');

    // ========================================
    // Step 6: サイドバーメニュー設定
    // ========================================
    console.log('📍 Step 6/6: サイドバーメニュー設定投入');
    console.log('-'.repeat(60));
    await seedSidebarMenuConfigs();
    console.log('');

    // ========================================
    // 完了サマリー
    // ========================================
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('='.repeat(60));
    console.log('✅ シードデータ投入完了\n');
    console.log('📊 投入結果サマリー:');
    console.log('');
    console.log(`  🏥 施設:`);
    console.log(`     - 新規: ${results.facilities.createdCount}件`);
    console.log(`     - 更新: ${results.facilities.updatedCount}件`);
    console.log('');
    console.log(`  🏢 組織構造:`);
    console.log(`     - 新規: ${results.organizations.createdCount}件`);
    console.log(`     - 更新: ${results.organizations.updatedCount}件`);
    console.log('');
    console.log(`  👨‍⚕️ 職種:`);
    console.log(`     - 新規: ${results.jobCategories.createdCount}件`);
    console.log(`     - 更新: ${results.jobCategories.updatedCount}件`);
    console.log(`     - 医療チーム依頼分: ${results.jobCategories.addedCount}件`);
    console.log('');
    console.log(`  ⚙️  議題モード設定:`);
    console.log(`     - 新規: ${results.agendaModeConfigs.createdCount}件`);
    console.log(`     - 更新: ${results.agendaModeConfigs.updatedCount}件`);
    console.log(`     - パターンA (location): ${results.agendaModeConfigs.patternACount}部門`);
    console.log(`     - パターンB (profession): ${results.agendaModeConfigs.patternBCount}部門`);
    console.log(`     - パターンC (department): ${results.agendaModeConfigs.patternCCount}部門`);
    console.log('');
    console.log('='.repeat(60));
    console.log(`⏱️  実行時間: ${duration}秒`);
    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 すべての処理が正常に完了しました！');
    console.log('');

    // データ検証
    console.log('🔍 データ検証...');
    const facilitiesCount = await prisma.facility.count();
    const organizationsCount = await prisma.organizationStructure.count();
    const jobCategoriesCount = await prisma.jobCategory.count();
    const agendaModeConfigsCount = await prisma.agendaModeConfig.count();
    const committeeStatusCount = await prisma.committeeAgendaStatus.count();
    const committeePriorityCount = await prisma.committeePriorityLevel.count();
    const committeeTypeCount = await prisma.committeeAgendaType.count();
    const committeeSettingCount = await prisma.committeeSystemSetting.count();
    const sidebarMenuConfigsCount = await prisma.sidebarMenuConfig.count();

    console.log(`   - 施設データ: ${facilitiesCount}件`);
    console.log(`   - 組織構造データ: ${organizationsCount}件`);
    console.log(`   - 職種データ: ${jobCategoriesCount}件`);
    console.log(`   - 議題モード設定: ${agendaModeConfigsCount}件`);
    console.log(`   - 委員会ステータス: ${committeeStatusCount}件`);
    console.log(`   - 委員会優先度: ${committeePriorityCount}件`);
    console.log(`   - 委員会タイプ: ${committeeTypeCount}件`);
    console.log(`   - 委員会設定: ${committeeSettingCount}件`);
    console.log(`   - サイドバーメニュー設定: ${sidebarMenuConfigsCount}件`);
    console.log('');

    // 期待値チェック
    const expectedOrganizations = 23; // 小原10 + 立神7 + エスポワール6
    const expectedAgendaModeConfigs = 23;

    if (organizationsCount !== expectedOrganizations) {
      console.warn(`⚠️  警告: 組織構造データが期待値と異なります（期待: ${expectedOrganizations}件, 実際: ${organizationsCount}件）`);
    }
    if (agendaModeConfigsCount !== expectedAgendaModeConfigs) {
      console.warn(`⚠️  警告: 議題モード設定が期待値と異なります（期待: ${expectedAgendaModeConfigs}件, 実際: ${agendaModeConfigsCount}件）`);
    }

    if (
      organizationsCount === expectedOrganizations &&
      agendaModeConfigsCount === expectedAgendaModeConfigs
    ) {
      console.log('✅ データ検証: すべて正常です\n');
    }

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ エラーが発生しました');
    console.error('='.repeat(60));
    console.error('');
    console.error('エラー詳細:');
    console.error(error);
    console.error('');
    console.error('ロールバック推奨: 不整合なデータが残っている可能性があります');
    console.error('');
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('最終エラー:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
