/**
 * データ型確認スクリプト
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 データ型を確認します...\n');

  const users = await prisma.user.findMany({
    select: {
      employeeId: true,
      name: true,
      permissionLevel: true,
    },
    take: 5
  });

  users.forEach(user => {
    console.log(`${user.name}:`);
    console.log(`  permissionLevel: ${user.permissionLevel}`);
    console.log(`  typeof: ${typeof user.permissionLevel}`);
    console.log(`  constructor: ${user.permissionLevel.constructor.name}`);
    console.log(`  === 18: ${user.permissionLevel === 18}`);
    console.log(`  == 18: ${user.permissionLevel == 18}`);
    console.log(`  Number(): ${Number(user.permissionLevel)}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
