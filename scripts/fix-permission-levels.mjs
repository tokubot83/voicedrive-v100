// 権限レベル別表示設定を修正するスクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 権限レベル別表示設定を修正中...\n');

  // エグゼクティブダッシュボード: レベル12以上のみ表示
  const execDashboard = await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'executive_dashboard' },
    data: {
      visibleForLevels: JSON.stringify(['12', '13', '14', '15', '16', '17', '18', 'X']),
    },
  });
  console.log(`✅ エグゼクティブダッシュボード: レベル12以上のみ表示に設定`);

  // システム運用: レベルX（99）のみ表示
  const sysOps = await prisma.sidebarMenuConfig.updateMany({
    where: { menuItemId: 'system_operations' },
    data: {
      visibleForLevels: JSON.stringify(['X', '99']),
    },
  });
  console.log(`✅ システム運用: レベルX（99）のみ表示に設定`);

  // その他の共通メニューは全レベルで表示（visibleForLevels = null）
  const commonMenus = await prisma.sidebarMenuConfig.updateMany({
    where: {
      menuItemId: {
        in: [
          'personal_station',
          'interview_station',
          'career_selection_station',
          'user_guide',
          'compliance_guide',
          'notifications',
          'settings',
        ],
      },
    },
    data: {
      visibleForLevels: null, // 全レベルで表示
    },
  });
  console.log(`✅ その他の共通メニュー: 全レベルで表示に設定`);

  console.log('\n✨ 権限レベル別表示設定の修正完了！');
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
