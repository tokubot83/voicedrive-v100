/**
 * サイドバーメニュー表示設定を更新
 *
 * 一般ユーザー:
 * - パーソナルステーション、コンプライアンス窓口、通知、設定を表示
 * - 面談・キャリアステーションは非表示
 *
 * レベル99:
 * - 設定、システム運用のみ表示
 * - パーソナルステーション、使い方ガイド、通知は非表示
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSidebarMenuVisibility() {
  console.log('🎨 サイドバーメニュー表示設定を更新中...');

  // 面談ステーション → 非表示
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'interview_station' },
    data: { isVisible: false }
  });
  console.log('✅ 面談ステーション → 非表示');

  // キャリア選択ステーション → 非表示
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'career_selection_station' },
    data: { isVisible: false }
  });
  console.log('✅ キャリア選択ステーション → 非表示');

  // パーソナルステーション → レベル1～18のみ表示（レベルXは非表示）
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'personal_station' },
    data: {
      visibleForLevels: JSON.stringify(['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  });
  console.log('✅ パーソナルステーション → レベル1～18のみ表示（レベルX非表示）');

  // 使い方ガイド → レベル1～18のみ表示（レベルXは非表示）
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'user_guide' },
    data: {
      visibleForLevels: JSON.stringify(['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  });
  console.log('✅ 使い方ガイド → レベル1～18のみ表示（レベルX非表示）');

  // 通知 → レベル1～18のみ表示（レベルXは非表示）
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'notifications' },
    data: {
      visibleForLevels: JSON.stringify(['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  });
  console.log('✅ 通知 → レベル1～18のみ表示（レベルX非表示）');

  // コンプライアンス窓口 → 全レベルで表示（visibleForLevels = null）
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'compliance_guide' },
    data: {
      isVisible: true,
      visibleForLevels: null
    }
  });
  console.log('✅ コンプライアンス窓口 → 全レベルで表示');

  // 設定 → 全レベルで表示
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'settings' },
    data: {
      isVisible: true,
      visibleForLevels: null
    }
  });
  console.log('✅ 設定 → 全レベルで表示');

  // システム運用 → レベルXのみ表示（既存設定を維持）
  await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'system_operations' },
    data: {
      isVisible: true,
      visibleForLevels: JSON.stringify(['X', '99'])
    }
  });
  console.log('✅ システム運用 → レベルX/99のみ表示');

  console.log('');
  console.log('📊 更新後の表示設定:');
  console.log('');
  console.log('【一般ユーザー（レベル1～18）】');
  console.log('  ✅ パーソナルステーション');
  console.log('  ✅ コンプライアンス窓口');
  console.log('  ✅ 通知');
  console.log('  ✅ 設定');
  console.log('  ✅ エグゼクティブダッシュボード（レベル12以上）');
  console.log('');
  console.log('【レベル99（システム管理者）】');
  console.log('  ✅ コンプライアンス窓口');
  console.log('  ✅ 設定');
  console.log('  ✅ システム運用');
  console.log('');
  console.log('✅ サイドバーメニュー表示設定の更新完了！');
}

updateSidebarMenuVisibility()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    prisma.$disconnect();
    process.exit(1);
  });
