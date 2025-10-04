/**
 * 既存データ確認スクリプト
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📊 既存ユーザーデータを確認します...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      employeeId: true,
      name: true,
      accountType: true,
      permissionLevel: true,
      canPerformLeaderDuty: true,
      professionCategory: true,
    },
  });

  console.log(`✅ ユーザー数: ${users.length}件\n`);

  if (users.length > 0) {
    console.log('現在のデータ:');
    console.table(users);
  } else {
    console.log('⚠️ データが存在しません');
  }
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
