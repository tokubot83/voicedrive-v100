/**
 * 25レベル権限システム統合テスト
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// テスト結果
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ ${testName}`);
    results.passed++;
    results.tests.push({ name: testName, status: 'PASS' });
  } else {
    console.log(`❌ ${testName}`);
    results.failed++;
    results.tests.push({ name: testName, status: 'FAIL' });
  }
}

// Decimal型を数値に変換するヘルパー
function toNumber(value) {
  return typeof value === 'number' ? value : Number(value);
}

async function testMigratedData() {
  console.log('\n📊 Test 1: 移行済みデータの検証\n');

  const users = await prisma.user.findMany();

  assert(users.length === 4, 'ユーザー数が4件である');

  const boardMember = users.find(u => u.accountType === 'BOARD_MEMBER');
  assert(boardMember !== undefined, 'BOARD_MEMBERが存在する');
  assert(toNumber(boardMember?.permissionLevel) === 18, 'BOARD_MEMBERのレベルが18である');

  const hrManager = users.find(u => u.accountType === 'HR_MANAGER');
  assert(hrManager !== undefined, 'HR_MANAGERが存在する');
  assert(toNumber(hrManager?.permissionLevel) === 15, 'HR_MANAGERのレベルが15である');

  const newStaff = users.filter(u => u.accountType === 'NEW_STAFF');
  assert(newStaff.length === 2, 'NEW_STAFFが2件存在する');
  assert(newStaff.every(u => toNumber(u.permissionLevel) === 1), 'NEW_STAFFのレベルが1である');
}

async function testDecimalSupport() {
  console.log('\n📊 Test 2: Decimal型（0.5刻み）のサポート\n');

  // テスト用に0.5刻みレベルのユーザーを作成
  const testUser = await prisma.user.create({
    data: {
      employeeId: 'TEST_DECIMAL',
      email: 'test-decimal@example.com',
      name: 'テストユーザー（0.5刻み）',
      accountType: 'JUNIOR_STAFF_LEADER',
      permissionLevel: 2.5,
      canPerformLeaderDuty: true,
      professionCategory: 'nursing',
    },
  });

  assert(toNumber(testUser.permissionLevel) === 2.5, '0.5刻みレベル（2.5）が保存される');
  assert(testUser.canPerformLeaderDuty === true, 'canPerformLeaderDutyがtrueである');
  assert(testUser.professionCategory === 'nursing', 'professionCategoryが"nursing"である');

  // クリーンアップ
  await prisma.user.delete({ where: { id: testUser.id } });
}

async function testSpecialAuthority() {
  console.log('\n📊 Test 3: 特別権限レベル（97-99）のサポート\n');

  // Level 97: 健診担当者
  const healthCheckupStaff = await prisma.user.create({
    data: {
      employeeId: 'TEST_LEVEL_97',
      email: 'test-97@example.com',
      name: '健診担当者テスト',
      accountType: 'HEALTH_CHECKUP_STAFF',
      permissionLevel: 97,
    },
  });

  assert(toNumber(healthCheckupStaff.permissionLevel) === 97, 'Level 97が保存される');

  // Level 98: 産業医
  const physician = await prisma.user.create({
    data: {
      employeeId: 'TEST_LEVEL_98',
      email: 'test-98@example.com',
      name: '産業医テスト',
      accountType: 'OCCUPATIONAL_PHYSICIAN',
      permissionLevel: 98,
    },
  });

  assert(toNumber(physician.permissionLevel) === 98, 'Level 98が保存される');

  // Level 99: システム管理者
  const admin = await prisma.user.create({
    data: {
      employeeId: 'TEST_LEVEL_99',
      email: 'test-99@example.com',
      name: 'システム管理者テスト',
      accountType: 'SYSTEM_ADMIN',
      permissionLevel: 99,
    },
  });

  assert(toNumber(admin.permissionLevel) === 99, 'Level 99が保存される');

  // クリーンアップ
  await prisma.user.deleteMany({
    where: {
      id: { in: [healthCheckupStaff.id, physician.id, admin.id] }
    }
  });
}

async function testAllLevels() {
  console.log('\n📊 Test 4: 全25レベルのサポート\n');

  const testLevels = [
    { level: 1, type: 'NEW_STAFF' },
    { level: 1.5, type: 'NEW_STAFF_LEADER' },
    { level: 2, type: 'JUNIOR_STAFF' },
    { level: 2.5, type: 'JUNIOR_STAFF_LEADER' },
    { level: 3, type: 'MIDLEVEL_STAFF' },
    { level: 3.5, type: 'MIDLEVEL_STAFF_LEADER' },
    { level: 4, type: 'VETERAN_STAFF' },
    { level: 4.5, type: 'VETERAN_STAFF_LEADER' },
    { level: 5, type: 'DEPUTY_CHIEF' },
    { level: 6, type: 'CHIEF' },
    { level: 7, type: 'DEPUTY_MANAGER' },
    { level: 8, type: 'MANAGER' },
    { level: 9, type: 'DEPUTY_DIRECTOR' },
    { level: 10, type: 'DIRECTOR' },
    { level: 11, type: 'ADMINISTRATIVE_DIRECTOR' },
    { level: 12, type: 'VICE_PRESIDENT' },
    { level: 13, type: 'PRESIDENT' },
    { level: 14, type: 'HR_STAFF' },
    { level: 15, type: 'HR_MANAGER' },
    { level: 16, type: 'STRATEGIC_PLANNING_STAFF' },
    { level: 17, type: 'STRATEGIC_PLANNING_MANAGER' },
    { level: 18, type: 'BOARD_MEMBER' },
    { level: 97, type: 'HEALTH_CHECKUP_STAFF' },
    { level: 98, type: 'OCCUPATIONAL_PHYSICIAN' },
    { level: 99, type: 'SYSTEM_ADMIN' },
  ];

  const createdIds = [];

  for (const { level, type } of testLevels) {
    const user = await prisma.user.create({
      data: {
        employeeId: `TEST_LEVEL_${level}`,
        email: `test-level-${level}@example.com`,
        name: `テストレベル${level}`,
        accountType: type,
        permissionLevel: level,
      },
    });

    createdIds.push(user.id);
  }

  const allUsers = await prisma.user.findMany({
    where: { id: { in: createdIds } },
    orderBy: { permissionLevel: 'asc' }
  });

  assert(allUsers.length === 25, '25種類すべてのレベルが作成される');
  assert(toNumber(allUsers[0].permissionLevel) === 1, '最小レベルが1である');
  assert(toNumber(allUsers[allUsers.length - 1].permissionLevel) === 99, '最大レベルが99である');

  // 0.5刻みレベルの確認
  const halfLevels = allUsers.filter(u =>
    [1.5, 2.5, 3.5, 4.5].includes(toNumber(u.permissionLevel))
  );
  assert(halfLevels.length === 4, '0.5刻みレベルが4件存在する');

  // クリーンアップ
  await prisma.user.deleteMany({
    where: { id: { in: createdIds } }
  });
}

async function testBackwardCompatibility() {
  console.log('\n📊 Test 5: 後方互換性の確認\n');

  // 既存の4件のユーザーが正しく読み込めることを確認
  const existingUsers = await prisma.user.findMany({
    where: {
      employeeId: { in: ['EMP001', 'EMP002', 'EMP100', 'EMP101'] }
    }
  });

  assert(existingUsers.length === 4, '既存ユーザーがすべて読み込める');
  assert(
    existingUsers.every(u => !isNaN(toNumber(u.permissionLevel))),
    'permissionLevelが数値に変換可能である'
  );
  assert(
    existingUsers.every(u => typeof u.canPerformLeaderDuty === 'boolean'),
    'canPerformLeaderDutyがboolean型である'
  );
}

async function runAllTests() {
  console.log('🧪 25レベル権限システム 統合テスト開始\n');
  console.log('='.repeat(60));

  try {
    await testMigratedData();
    await testDecimalSupport();
    await testSpecialAuthority();
    await testAllLevels();
    await testBackwardCompatibility();

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 テスト結果サマリー\n');
    console.log(`  ✅ 成功: ${results.passed}件`);
    console.log(`  ❌ 失敗: ${results.failed}件`);
    console.log(`  合計: ${results.passed + results.failed}件`);

    const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    console.log(`  合格率: ${successRate}%\n`);

    if (results.failed === 0) {
      console.log('🎉 すべてのテストが合格しました！\n');
    } else {
      console.log('⚠️ 失敗したテストがあります:\n');
      results.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => console.log(`  - ${t.name}`));
      console.log('');
    }

    process.exit(results.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ テスト実行エラー:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests();
