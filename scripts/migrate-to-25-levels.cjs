/**
 * 既存データを13レベルから25レベルに移行
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 旧13レベルから新レベルへのマッピング
const OLD_TO_NEW_LEVEL = {
  'STAFF': 1,
  'SUPERVISOR': 6,
  'HEAD_NURSE': 8,
  'DEPARTMENT_HEAD': 10,
  'ADMINISTRATIVE_DIRECTOR': 11,
  'VICE_DIRECTOR': 12,
  'HOSPITAL_DIRECTOR': 13,
  'HR_ADMIN_STAFF': 14,
  'CAREER_SUPPORT_STAFF': 14,
  'HR_DEPARTMENT_HEAD': 15,
  'HR_GENERAL_MANAGER': 17,
  'GENERAL_ADMINISTRATIVE_DIRECTOR': 18,
  'CHAIRMAN': 18,
};

// 旧account_typeから新account_typeへのマッピング
const OLD_TO_NEW_ACCOUNT_TYPE = {
  'STAFF': 'NEW_STAFF',
  'SUPERVISOR': 'CHIEF',
  'HEAD_NURSE': 'MANAGER',
  'DEPARTMENT_HEAD': 'DIRECTOR',
  'ADMINISTRATIVE_DIRECTOR': 'ADMINISTRATIVE_DIRECTOR', // 変更なし
  'VICE_DIRECTOR': 'VICE_PRESIDENT',
  'HOSPITAL_DIRECTOR': 'PRESIDENT',
  'HR_ADMIN_STAFF': 'HR_STAFF',
  'CAREER_SUPPORT_STAFF': 'HR_STAFF',
  'HR_DEPARTMENT_HEAD': 'HR_MANAGER',
  'HR_GENERAL_MANAGER': 'STRATEGIC_PLANNING_MANAGER',
  'GENERAL_ADMINISTRATIVE_DIRECTOR': 'BOARD_MEMBER',
  'CHAIRMAN': 'BOARD_MEMBER',
};

async function main() {
  console.log('🔄 データ移行を開始します...\n');

  const users = await prisma.user.findMany();
  console.log(`📊 対象ユーザー数: ${users.length}件\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const oldAccountType = user.accountType;

      // 新しいレベルとアカウントタイプを決定
      let newLevel = OLD_TO_NEW_LEVEL[oldAccountType];
      let newAccountType = OLD_TO_NEW_ACCOUNT_TYPE[oldAccountType];

      // マッピングが見つからない場合のフォールバック
      if (!newLevel) {
        console.warn(`⚠️ 未知のaccountType: ${oldAccountType}, Level 1にフォールバック`);
        newLevel = 1;
        newAccountType = 'NEW_STAFF';
      }

      // データ更新
      await prisma.user.update({
        where: { id: user.id },
        data: {
          permissionLevel: newLevel,
          accountType: newAccountType,
          canPerformLeaderDuty: false, // デフォルトfalse
          professionCategory: null,    // デフォルトnull
        },
      });

      console.log(`✅ ${user.name}: ${oldAccountType} (${user.permissionLevel}) → ${newAccountType} (${newLevel})`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${user.name}: エラー - ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n📊 移行結果:');
  console.log(`  成功: ${successCount}件`);
  console.log(`  失敗: ${errorCount}件`);
  console.log('\n⚠️ 注意: この移行は暫定的なものです。');
  console.log('   経験年数やリーダー業務可否などの詳細情報が不足しているため、');
  console.log('   医療システムAPIで正確なレベルを再計算することを強く推奨します。\n');
}

main()
  .catch((e) => {
    console.error('❌ 移行エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
