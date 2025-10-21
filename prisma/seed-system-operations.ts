import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * system-operations用の初期データを作成
 */
async function seedSystemOperations() {
  console.log('🌱 Seeding system-operations initial data...');

  // システム管理者ユーザーを取得または作成
  let systemUser = await prisma.user.findFirst({
    where: { permissionLevel: 99 },
  });

  if (!systemUser) {
    console.log('⚠️  No Level 99 user found. Creating system user...');
    systemUser = await prisma.user.create({
      data: {
        employeeId: 'SYSTEM-ADMIN',
        email: 'system@voicedrive.local',
        name: 'System Administrator',
        accountType: 'admin',
        permissionLevel: 99,
        canPerformLeaderDuty: true,
      },
    });
    console.log(`✅ System user created: ${systemUser.id}`);
  } else {
    console.log(`✅ Using existing Level 99 user: ${systemUser.name} (${systemUser.id})`);
  }

  // 1. VotingConfig初期データ作成
  console.log('📊 Creating VotingConfig...');
  const votingConfig = await prisma.votingConfig.upsert({
    where: { configKey: 'default' },
    update: {},
    create: {
      configKey: 'default',
      agendaModeSettings: {
        votingPeriod: 14, // 投票期間（日）
        requiredVoteCount: 10, // 必要投票数
        approvalThreshold: 70, // 承認閾値（%）
        escalationThreshold: 100, // エスカレーション閾値（スコア）
      },
      projectModeSettings: {
        votingPeriod: 21, // 投票期間（日）
        requiredVoteCount: 15, // 必要投票数
        approvalThreshold: 80, // 承認閾値（%）
        escalationThreshold: 150, // エスカレーション閾値（スコア）
      },
      votingRules: {
        allowMultipleVotes: false, // 複数回投票を許可するか
        allowVoteChange: true, // 投票変更を許可するか
        anonymousVoting: false, // 匿名投票を許可するか
      },
      votingWeights: {
        'level1-5': 1.0, // レベル1-5の投票重み
        'level6-10': 1.2, // レベル6-10の投票重み
        'level11-15': 1.5, // レベル11-15の投票重み
        'level16-20': 2.0, // レベル16-20の投票重み
        'level21-25': 3.0, // レベル21-25の投票重み
      },
      approvalThresholds: {
        department: 70, // 部署承認閾値（%）
        facility: 80, // 施設承認閾値（%）
        organization: 90, // 組織承認閾値（%）
      },
      description: 'デフォルト投票設定',
      updatedBy: systemUser.id,
    },
  });
  console.log(`✅ VotingConfig created: ${votingConfig.id}`);

  // 2. MenuConfig初期データ作成（11項目）
  console.log('🎛️ Creating MenuConfig items...');

  const menuItems = [
    // 共通メニュー
    {
      menuType: 'common',
      menuKey: 'home',
      label: 'ホーム',
      icon: '🏠',
      path: '/home',
      order: 1,
      isVisible: true,
      requiredLevel: 1,
      enabledInModes: ['AGENDA_MODE', 'PROJECT_MODE'],
      description: 'ホームページ',
    },
    {
      menuType: 'common',
      menuKey: 'personal-station',
      label: 'パーソナルステーション',
      icon: '👤',
      path: '/personal-station',
      order: 2,
      isVisible: true,
      requiredLevel: 1,
      enabledInModes: ['AGENDA_MODE', 'PROJECT_MODE'],
      description: '個人プロフィールページ',
    },
    {
      menuType: 'common',
      menuKey: 'notifications',
      label: '通知',
      icon: '🔔',
      path: '/notifications',
      order: 3,
      isVisible: true,
      requiredLevel: 1,
      enabledInModes: ['AGENDA_MODE', 'PROJECT_MODE'],
      description: '通知一覧',
    },
    // 議題モードメニュー
    {
      menuType: 'agenda',
      menuKey: 'agenda-board',
      label: '議題ボード',
      icon: '📋',
      path: '/agenda-board',
      order: 4,
      isVisible: true,
      requiredLevel: 1,
      enabledInModes: ['AGENDA_MODE'],
      description: '議題一覧',
    },
    {
      menuType: 'agenda',
      menuKey: 'voting-history',
      label: '投票履歴',
      icon: '🗳️',
      path: '/voting-history',
      order: 5,
      isVisible: true,
      requiredLevel: 1,
      enabledInModes: ['AGENDA_MODE'],
      description: '投票履歴ページ',
    },
    {
      menuType: 'agenda',
      menuKey: 'committee-review',
      label: '委員会レビュー',
      icon: '👥',
      path: '/committee-review',
      order: 6,
      isVisible: true,
      requiredLevel: 15,
      enabledInModes: ['AGENDA_MODE'],
      description: '委員会レビューページ',
    },
    // プロジェクトモードメニュー
    {
      menuType: 'project',
      menuKey: 'project-board',
      label: 'プロジェクトボード',
      icon: '📊',
      path: '/project-board',
      order: 7,
      isVisible: true,
      requiredLevel: 1,
      enabledInModes: ['PROJECT_MODE'],
      description: 'プロジェクト一覧',
    },
    {
      menuType: 'project',
      menuKey: 'project-proposals',
      label: 'プロジェクト提案',
      icon: '💡',
      path: '/project-proposals',
      order: 8,
      isVisible: true,
      requiredLevel: 1,
      enabledInModes: ['PROJECT_MODE'],
      description: 'プロジェクト提案ページ',
    },
    // 管理者メニュー
    {
      menuType: 'common',
      menuKey: 'admin-dashboard',
      label: '管理ダッシュボード',
      icon: '⚙️',
      path: '/admin/dashboard',
      order: 9,
      isVisible: true,
      requiredLevel: 99,
      enabledInModes: ['AGENDA_MODE', 'PROJECT_MODE'],
      description: '管理者ダッシュボード',
    },
    {
      menuType: 'common',
      menuKey: 'system-operations',
      label: 'システム運用',
      icon: '🔧',
      path: '/admin/system-operations',
      order: 10,
      isVisible: true,
      requiredLevel: 99,
      enabledInModes: ['AGENDA_MODE', 'PROJECT_MODE'],
      description: 'システム運用ページ',
    },
    {
      menuType: 'common',
      menuKey: 'mode-switcher',
      label: 'モード切替',
      icon: '🔄',
      path: '/admin/mode-switcher',
      order: 11,
      isVisible: true,
      requiredLevel: 99,
      enabledInModes: ['AGENDA_MODE', 'PROJECT_MODE'],
      description: 'モード切替ページ',
    },
  ];

  for (const item of menuItems) {
    const menu = await prisma.menuConfig.upsert({
      where: { menuKey: item.menuKey },
      update: {},
      create: {
        ...item,
        updatedBy: systemUser.id,
      },
    });
    console.log(`  ✅ MenuConfig created: ${menu.label} (${menu.menuKey})`);
  }

  console.log('✅ All initial data created successfully!');
  console.log(`
📊 Summary:
  - VotingConfig: 1 record
  - MenuConfig: ${menuItems.length} records
  `);
}

async function main() {
  try {
    await seedSystemOperations();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
