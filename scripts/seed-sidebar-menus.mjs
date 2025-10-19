// Simple seed script for sidebar menu configs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const menuConfigs = [
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
    isVisible: false,
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
    isVisible: false,
    displayOrder: 5,
    showOnDesktop: true,
    showOnMobile: true,
    showOnTablet: true,
    isSystem: false,
    adminNotes: '評価制度は2025年4月導入予定。人事部門の準備完了後に表示を有効化。',
  },
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
    showOnMobile: false,
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
    showBadge: true,
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
  },
  {
    menuItemId: 'system_operations',
    menuCategory: 'common',
    menuSubcategory: 'management',
    icon: '🔧',
    label: 'システム運用',
    path: '/admin/system-operations',
    description: 'システム管理・設定',
    isVisible: true,
    displayOrder: 21,
    showOnDesktop: true,
    showOnMobile: true,
    showOnTablet: true,
    visibleForLevels: JSON.stringify(['X']),
    isSystem: true,
  },
];

async function main() {
  console.log('🌱 サイドバーメニュー設定を投入中...');

  let created = 0;
  let skipped = 0;

  for (const config of menuConfigs) {
    try {
      const existing = await prisma.sidebarMenuConfig.findFirst({
        where: {
          menuItemId: config.menuItemId,
          menuCategory: config.menuCategory,
        },
      });

      if (existing) {
        console.log(`⏭️  スキップ: ${config.label} (既存)`);
        skipped++;
      } else {
        await prisma.sidebarMenuConfig.create({ data: config });
        console.log(`✅ 作成: ${config.label}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ エラー: ${config.label}`, error.message);
    }
  }

  console.log(`\n📊 完了: ${created}件作成, ${skipped}件スキップ`);
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
