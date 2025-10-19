/**
 * 議題モードテストデータ投入スクリプト
 * 実行方法: npx ts-node scripts/seed-agenda-test-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 議題モードテストデータを投入中...\n');

  // 既存のテストデータをクリーンアップ
  console.log('📌 既存のテストデータをクリーンアップ...');

  // test-post-のみ削除（安全に削除可能）
  const deletedPosts = await prisma.post.deleteMany({
    where: {
      id: {
        startsWith: 'test-post-',
      },
    },
  });
  console.log(`  - 投稿削除: ${deletedPosts.count}件`);

  console.log('✅ クリーンアップ完了\n');

  // テストユーザー作成（upsertで既存データを上書き）
  console.log('👥 テストユーザーを作成中...');

  // 投稿者
  await prisma.user.upsert({
    where: { id: 'test-author-1' },
    update: {},
    create: {
      id: 'test-author-1',
      employeeId: 'AUT001',
      email: 'author@test.com',
      name: 'テスト投稿者',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      permissionLevel: 1,
      accountType: 'staff',
      isRetired: false,
    },
  });

  // 主任（Level 3.5）
  await prisma.user.upsert({
    where: { id: 'test-supervisor-1' },
    update: {},
    create: {
      id: 'test-supervisor-1',
      employeeId: 'SUP001',
      email: 'supervisor@test.com',
      name: '主任テスト太郎',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      permissionLevel: 3.5,
      accountType: 'staff',
      isRetired: false,
    },
  });

  // 師長（Level 7）
  await prisma.user.upsert({
    where: { id: 'test-manager-1' },
    update: {},
    create: {
      id: 'test-manager-1',
      employeeId: 'MGR001',
      email: 'manager@test.com',
      name: '師長テスト花子',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      permissionLevel: 7,
      accountType: 'staff',
      isRetired: false,
    },
  });

  // 副看護部長（Level 8）
  await prisma.user.upsert({
    where: { id: 'test-deputy-1' },
    update: {},
    create: {
      id: 'test-deputy-1',
      employeeId: 'DEP001',
      email: 'deputy@test.com',
      name: '副看護部長テスト',
      department: '看護部',
      facilityId: 'facility-1',
      permissionLevel: 8,
      accountType: 'staff',
      isRetired: false,
    },
  });

  // 事務長（Level 11）
  await prisma.user.upsert({
    where: { id: 'test-affairs-1' },
    update: {},
    create: {
      id: 'test-affairs-1',
      employeeId: 'AFF001',
      email: 'affairs@test.com',
      name: '事務長テスト',
      department: '総務部',
      facilityId: 'facility-1',
      permissionLevel: 11,
      accountType: 'staff',
      isRetired: false,
    },
  });

  // 法人統括事務局長（Level 18）
  await prisma.user.upsert({
    where: { id: 'test-director-1' },
    update: {},
    create: {
      id: 'test-director-1',
      employeeId: 'DIR001',
      email: 'director@test.com',
      name: '法人統括事務局長テスト',
      department: '法人本部',
      facilityId: 'facility-1',
      permissionLevel: 18,
      accountType: 'executive',
      isRetired: false,
    },
  });

  // 部署メンバー（3名）
  await prisma.user.upsert({ where: { id: 'test-member-1' }, update: {}, create: { id: 'test-member-1', employeeId: 'MEM001', email: 'member1@test.com', name: 'メンバー1', department: '看護部A病棟', facilityId: 'facility-1', permissionLevel: 1, accountType: 'staff', isRetired: false } });
  await prisma.user.upsert({ where: { id: 'test-member-2' }, update: {}, create: { id: 'test-member-2', employeeId: 'MEM002', email: 'member2@test.com', name: 'メンバー2', department: '看護部A病棟', facilityId: 'facility-1', permissionLevel: 1, accountType: 'staff', isRetired: false } });
  await prisma.user.upsert({ where: { id: 'test-member-3' }, update: {}, create: { id: 'test-member-3', employeeId: 'MEM003', email: 'member3@test.com', name: 'メンバー3', department: '看護部A病棟', facilityId: 'facility-1', permissionLevel: 1, accountType: 'staff', isRetired: false } });

  // 他施設メンバー（法人通知テスト用）
  await prisma.user.upsert({ where: { id: 'test-member-f2-1' }, update: {}, create: { id: 'test-member-f2-1', employeeId: 'MEM101', email: 'member-f2-1@test.com', name: '施設2メンバー1', department: '看護部', facilityId: 'facility-2', permissionLevel: 1, accountType: 'staff', isRetired: false } });
  await prisma.user.upsert({ where: { id: 'test-member-f2-2' }, update: {}, create: { id: 'test-member-f2-2', employeeId: 'MEM102', email: 'member-f2-2@test.com', name: '施設2メンバー2', department: '看護部', facilityId: 'facility-2', permissionLevel: 1, accountType: 'staff', isRetired: false } });

  console.log('✅ テストユーザー作成完了（11名）\n');

  // テスト投稿を作成
  console.log('📝 テスト投稿を作成中...');

  const posts = [
    // 50点の投稿（主任判断待ち）
    {
      id: 'test-post-50',
      type: 'proposal',
      content: 'テスト投稿：50点到達 - 業務効率化のための新システム導入提案。現在の業務フローを見直し、電子化を進めることで業務時間を30%削減できると考えます。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 50,
      agendaLevel: 'DEPT_AGENDA',
      agendaStatus: 'pending',
    },
    // 主任推薦済みの投稿（師長判断待ち）
    {
      id: 'test-post-50-rec',
      type: 'proposal',
      content: 'テスト投稿：主任推薦済み - 患者サービス向上提案。待ち時間短縮のため、予約システムを改善します。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 52,
      agendaLevel: 'DEPT_AGENDA',
      agendaStatus: 'recommended_to_manager',
    },
    // 100点の投稿（副看護部長判断待ち）
    {
      id: 'test-post-100',
      type: 'proposal',
      content: 'テスト投稿：100点到達 - 医療安全改善提案。インシデント報告システムを強化し、再発防止策を体系化します。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 100,
      agendaLevel: 'FACILITY_AGENDA',
      agendaStatus: 'pending_deputy_director_review',
    },
    // 300点の投稿（事務長判断待ち）
    {
      id: 'test-post-300',
      type: 'proposal',
      content: 'テスト投稿：300点到達 - 施設横断的な業務改善。各施設の成功事例を共有するプラットフォームを構築します。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 300,
      agendaLevel: 'CORP_REVIEW',
      agendaStatus: 'pending_general_affairs_review',
    },
    // 600点の投稿（法人統括事務局長判断待ち）
    {
      id: 'test-post-600',
      type: 'proposal',
      content: 'テスト投稿：600点到達 - 法人全体の経営改革提案。法人内全施設の経営指標をダッシュボード化し、リアルタイムで経営状況を可視化します。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 600,
      agendaLevel: 'CORP_AGENDA',
      agendaStatus: 'pending_general_affairs_director_review',
    },
    // スコア到達テスト用投稿
    {
      id: 'test-post-29',
      type: 'proposal',
      content: 'テスト投稿：29点 - 30点到達テスト用。休憩室の環境改善提案。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 29,
      agendaLevel: 'DEPT_REVIEW',
      agendaStatus: 'pending',
    },
    {
      id: 'test-post-49',
      type: 'proposal',
      content: 'テスト投稿：49点 - 50点到達テスト用。業務マニュアルの整備提案。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 49,
      agendaLevel: 'DEPT_REVIEW',
      agendaStatus: 'pending_supervisor_review',
    },
    {
      id: 'test-post-99',
      type: 'proposal',
      content: 'テスト投稿：99点 - 100点到達テスト用。患者満足度向上施策。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 99,
      agendaLevel: 'DEPT_AGENDA',
      agendaStatus: 'escalated_to_facility',
    },
    // 却下テスト用投稿
    {
      id: 'test-post-50-reject',
      type: 'proposal',
      content: 'テスト投稿：50点 - 却下テスト用。実現可能性の低い提案。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 50,
      agendaLevel: 'DEPT_AGENDA',
      agendaStatus: 'pending',
    },
    // 救済フローテスト用投稿
    {
      id: 'test-post-100-rescue',
      type: 'proposal',
      content: 'テスト投稿：100点 - 救済フローテスト用。部署レベルでは重要だが施設レベルでは優先度が低い提案。',
      authorId: 'test-author-1',
      anonymityLevel: 'full',
      status: 'active',
      agendaScore: 100,
      agendaLevel: 'FACILITY_AGENDA',
      agendaStatus: 'pending_rescue_by_manager',
    },
  ];

  for (const postData of posts) {
    await prisma.post.create({ data: postData });
  }

  console.log('✅ テスト投稿作成完了（10件）\n');

  // 確認用クエリ
  console.log('=== テストユーザー一覧 ===');
  const users = await prisma.user.findMany({
    where: {
      id: {
        startsWith: 'test-',
      },
    },
    select: {
      id: true,
      name: true,
      department: true,
      permissionLevel: true,
    },
    orderBy: {
      permissionLevel: 'asc',
    },
  });

  console.table(users);

  console.log('\n=== テスト投稿一覧 ===');
  const testPosts = await prisma.post.findMany({
    where: {
      id: {
        startsWith: 'test-post-',
      },
    },
    select: {
      id: true,
      content: true,
      agendaScore: true,
      agendaLevel: true,
      agendaStatus: true,
    },
    orderBy: {
      agendaScore: 'asc',
    },
  });

  console.table(
    testPosts.map((p) => ({
      id: p.id,
      content: p.content.substring(0, 40) + '...',
      score: p.agendaScore,
      level: p.agendaLevel,
      status: p.agendaStatus,
    }))
  );

  console.log('\n✨ テストデータ投入完了！');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ エラー:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
