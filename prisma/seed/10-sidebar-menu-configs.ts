/**
 * サイドバーメニュー設定の初期データ
 *
 * 議題モード・プロジェクト化モード・共通メニューの初期設定を投入
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSidebarMenuConfigs() {
  console.log('🎨 サイドバーメニュー設定の初期データを投入中...');

  // 既存データを削除（開発環境のみ）
  await prisma.sidebarMenuConfig.deleteMany({});

  // 共通メニュー: ステーション系
  const stationMenus = [
    {
      menuItemId: 'personal_station',
      menuCategory: 'common',
      menuSubcategory: 'station',
      icon: '🏠',
      label: 'パーソナルステーション',
      path: '/personal-station',
      description: '面談予約、評価、キャリア情報を確認できます',
      isVisible: true,
      displayOrder: 1,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: 'システム標準項目',
    },
    {
      menuItemId: 'interview_station',
      menuCategory: 'common',
      menuSubcategory: 'station',
      icon: '🤝',
      label: '面談ステーション',
      path: '/interview-station',
      description: '面談予約・履歴を管理できます',
      isVisible: true,
      displayOrder: 2,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: 'Phase 20実装済み',
    },
    {
      menuItemId: 'career_selection_station',
      menuCategory: 'common',
      menuSubcategory: 'station',
      icon: '💼',
      label: 'キャリア選択ステーション',
      path: '/career-selection-station',
      description: 'キャリアコース選択・変更申請ができます',
      isVisible: true,
      displayOrder: 3,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: 'Phase 22実装予定',
    },
    {
      menuItemId: 'health_station',
      menuCategory: 'common',
      menuSubcategory: 'station',
      icon: '🩺',
      label: '健康ステーション',
      path: '/health-station',
      description: 'ストレスチェック・健康診断結果を確認',
      isVisible: false, // 非表示
      displayOrder: 4,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: false,
      adminNotes: 'ベータ版として人事部門のみ先行公開予定。2026年1月から全職員公開予定。',
    },
    {
      menuItemId: 'evaluation_station',
      menuCategory: 'common',
      menuSubcategory: 'station',
      icon: '📊',
      label: '評価ステーション',
      path: '/evaluation-station',
      description: '目標設定・評価・フィードバックを管理できます',
      isVisible: false, // 非表示
      displayOrder: 5,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: false,
      adminNotes: '評価制度は2025年4月導入予定。人事部門の準備完了後に表示を有効化。',
    },
  ];

  // 共通メニュー: 情報・設定系
  const infoMenus = [
    {
      menuItemId: 'user_guide',
      menuCategory: 'common',
      menuSubcategory: 'info',
      icon: '📖',
      label: '使い方ガイド',
      path: '/user-guide',
      description: 'VoiceDriveの使い方を確認',
      isVisible: true,
      displayOrder: 10,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
    },
    {
      menuItemId: 'compliance_guide',
      menuCategory: 'common',
      menuSubcategory: 'info',
      icon: '🛡️',
      label: 'コンプライアンス窓口',
      path: '/compliance-guide',
      description: '内部通報・相談窓口',
      isVisible: true,
      displayOrder: 11,
      showOnDesktop: true,
      showOnMobile: false, // スマホ非表示
      showOnTablet: true,
      isSystem: true,
    },
    {
      menuItemId: 'notifications',
      menuCategory: 'common',
      menuSubcategory: 'info',
      icon: '🔔',
      label: '通知',
      path: '/notifications',
      description: '新着通知を確認',
      isVisible: true,
      displayOrder: 12,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      showBadge: true, // バッジ表示
      badgeType: 'count',
      isSystem: true,
    },
    {
      menuItemId: 'settings',
      menuCategory: 'common',
      menuSubcategory: 'info',
      icon: '⚙️',
      label: '設定',
      path: '/settings',
      description: 'アカウント設定・プライバシー設定',
      isVisible: true,
      displayOrder: 13,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
    },
  ];

  // 共通メニュー: 管理系（権限レベル制限あり）
  const managementMenus = [
    {
      menuItemId: 'executive_dashboard',
      menuCategory: 'common',
      menuSubcategory: 'management',
      icon: '📊',
      label: 'エグゼクティブダッシュボード',
      path: '/dashboard/executive',
      description: '経営指標・分析レポート',
      isVisible: true,
      displayOrder: 20,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      visibleForLevels: JSON.stringify(['12', '13', '14', '15', '16', '17', '18', 'X']),
      isSystem: true,
      adminNotes: 'レベル12（部長）以上のみ表示',
    },
    // システム運用メニューはコード内で直接制御（レベル99専用）
    // EnhancedSidebar.tsxで実装
  ];

  // 🆕 議題モードメニュー
  const agendaMenus = [
    {
      menuItemId: 'agenda_list',
      menuCategory: 'agenda',
      menuSubcategory: 'operation',
      icon: '📋',
      label: '議題一覧',
      path: '/agenda/list',
      description: '投票議題の一覧を表示',
      isVisible: true,
      displayOrder: 1,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: '議題モード標準項目',
    },
    {
      menuItemId: 'create_agenda',
      menuCategory: 'agenda',
      menuSubcategory: 'operation',
      icon: '➕',
      label: '新規議題作成',
      path: '/agenda/create',
      description: '新しい議題を投稿',
      isVisible: true,
      displayOrder: 2,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: '議題モード標準項目',
    },
    {
      menuItemId: 'voting_history',
      menuCategory: 'agenda',
      menuSubcategory: 'operation',
      icon: '🗳️',
      label: '投票履歴',
      path: '/agenda/voting-history',
      description: '自分の投票履歴を確認',
      isVisible: true,
      displayOrder: 3,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: '議題モード標準項目',
    },
    {
      menuItemId: 'voting_analytics',
      menuCategory: 'agenda',
      menuSubcategory: 'analytics',
      icon: '📊',
      label: '投票統計',
      path: '/agenda/analytics',
      description: '投票結果の統計・分析',
      isVisible: true,
      displayOrder: 10,
      showOnDesktop: true,
      showOnMobile: false,
      showOnTablet: true,
      visibleForLevels: JSON.stringify(['10', '12', '13', '14', '15', '16', '17', '18', 'X']),
      isSystem: true,
      adminNotes: 'レベル10（主任）以上のみ表示',
    },
  ];

  // 🆕 プロジェクト化モードメニュー
  const projectMenus = [
    {
      menuItemId: 'project_list',
      menuCategory: 'project',
      menuSubcategory: 'operation',
      icon: '📁',
      label: 'プロジェクト一覧',
      path: '/project/list',
      description: '進行中のプロジェクトを表示',
      isVisible: true,
      displayOrder: 1,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: 'プロジェクトモード標準項目',
    },
    {
      menuItemId: 'create_project',
      menuCategory: 'project',
      menuSubcategory: 'operation',
      icon: '🚀',
      label: '新規プロジェクト提案',
      path: '/project/create',
      description: '新しいプロジェクトを提案',
      isVisible: true,
      displayOrder: 2,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: 'プロジェクトモード標準項目',
    },
    {
      menuItemId: 'my_projects',
      menuCategory: 'project',
      menuSubcategory: 'operation',
      icon: '👤',
      label: 'マイプロジェクト',
      path: '/project/my-projects',
      description: '自分が参加しているプロジェクト',
      isVisible: true,
      displayOrder: 3,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      isSystem: true,
      adminNotes: 'プロジェクトモード標準項目',
    },
    {
      menuItemId: 'project_approval',
      menuCategory: 'project',
      menuSubcategory: 'management',
      icon: '✅',
      label: 'プロジェクト承認',
      path: '/project/approval',
      description: 'プロジェクト承認申請を管理',
      isVisible: true,
      displayOrder: 10,
      showOnDesktop: true,
      showOnMobile: true,
      showOnTablet: true,
      visibleForLevels: JSON.stringify(['10', '12', '13', '14', '15', '16', '17', '18', 'X']),
      showBadge: true,
      badgeType: 'count',
      isSystem: true,
      adminNotes: 'レベル10（主任）以上のみ表示。承認待ち件数をバッジ表示。',
    },
    {
      menuItemId: 'project_dashboard',
      menuCategory: 'project',
      menuSubcategory: 'management',
      icon: '📊',
      label: 'プロジェクトダッシュボード',
      path: '/project/dashboard',
      description: 'プロジェクト進捗・統計を確認',
      isVisible: true,
      displayOrder: 11,
      showOnDesktop: true,
      showOnMobile: false,
      showOnTablet: true,
      visibleForLevels: JSON.stringify(['12', '13', '14', '15', '16', '17', '18', 'X']),
      isSystem: true,
      adminNotes: 'レベル12（部長）以上のみ表示',
    },
  ];

  // 全てのメニューをまとめて投入
  const allMenus = [
    ...stationMenus,
    ...infoMenus,
    ...managementMenus,
    ...agendaMenus,
    ...projectMenus,
  ];

  for (const menu of allMenus) {
    await prisma.sidebarMenuConfig.create({
      data: menu,
    });
  }

  console.log(`✅ サイドバーメニュー設定 ${allMenus.length} 件を投入しました`);
}

// 単独実行用
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSidebarMenuConfigs()
    .then(() => {
      console.log('✅ サイドバーメニュー設定の初期データ投入完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ エラー:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
