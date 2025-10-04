/**
 * 医療システムAPIで全ユーザーの権限レベルを再計算
 *
 * 使用方法:
 *   JWT_TOKEN=your-token-here node scripts/recalculate-levels-with-api.cjs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 医療システムAPI設定
const MEDICAL_API_URL = process.env.MEDICAL_API_URL || 'http://localhost:3000/api/v1';
const JWT_TOKEN = process.env.JWT_TOKEN;

async function calculateLevelFromAPI(staffId, facilityId) {
  if (!JWT_TOKEN) {
    throw new Error('JWT_TOKEN環境変数が設定されていません');
  }

  const response = await fetch(`${MEDICAL_API_URL}/calculate-level`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ staffId, facilityId })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

async function main() {
  if (!JWT_TOKEN) {
    console.error('❌ エラー: JWT_TOKEN環境変数が設定されていません');
    console.log('\n使用方法:');
    console.log('  JWT_TOKEN=your-token-here node scripts/recalculate-levels-with-api.cjs\n');
    process.exit(1);
  }

  console.log('🔄 医療システムAPIで権限レベルを再計算します...\n');

  const users = await prisma.user.findMany({
    where: { isRetired: false },
    select: {
      id: true,
      employeeId: true,
      name: true,
      facilityId: true,
      accountType: true,
      permissionLevel: true,
    },
  });

  console.log(`📊 対象ユーザー数: ${users.length}件\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const user of users) {
    try {
      console.log(`🔍 ${user.name} (${user.employeeId}): 計算中...`);

      const result = await calculateLevelFromAPI(user.employeeId, user.facilityId);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          permissionLevel: result.accountLevel,
          accountType: result.accountType || user.accountType,
          canPerformLeaderDuty: result.canPerformLeaderDuty || false,
          professionCategory: result.professionCategory || null,
        },
      });

      console.log(`  ✅ ${user.accountType} (${user.permissionLevel}) → ${result.accountType} (${result.accountLevel})\n`);
      successCount++;

      // レート制限対策（1秒待機）
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ エラー: ${error.message}\n`);
      errors.push({ employeeId: user.employeeId, error: error.message });
      errorCount++;
    }
  }

  console.log('\n📊 再計算結果:');
  console.log(`  成功: ${successCount}件`);
  console.log(`  失敗: ${errorCount}件`);

  if (errors.length > 0) {
    console.log('\n❌ エラー一覧:');
    errors.forEach(({ employeeId, error }) => {
      console.log(`  - ${employeeId}: ${error}`);
    });
  }

  console.log('\n✅ 再計算完了\n');
}

main()
  .catch((e) => {
    console.error('❌ 致命的エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
