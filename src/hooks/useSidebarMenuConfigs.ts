/**
 * サイドバーメニュー設定フック
 *
 * DBから動的にメニュー設定を取得
 */

import { useState, useEffect } from 'react';

export interface SidebarMenuConfig {
  id: string;
  menuItemId: string;
  menuCategory: 'agenda' | 'project' | 'common';
  menuSubcategory?: string;
  icon: string;
  label: string;
  path: string;
  description?: string;
  isVisible: boolean;
  displayOrder: number;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  showOnTablet: boolean;
  visibleForLevels?: string | null; // JSON string
  showNewBadge: boolean;
  newBadgeUntil?: Date | null;
  showBadge: boolean;
  badgeType?: string | null;
  adminNotes?: string | null;
  isCustom: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UseSidebarMenuConfigsOptions {
  category?: 'agenda' | 'project' | 'common';
  permissionLevel?: number | string;
  enabled?: boolean;
}

/**
 * デフォルト共通メニュー（フォールバック用）
 */
function getDefaultCommonMenus(): SidebarMenuConfig[] {
  return [
    {
      id: 'default-personal',
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
      showNewBadge: false,
      showBadge: false,
      isCustom: false,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-interview',
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
      showNewBadge: false,
      showBadge: false,
      isCustom: false,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-career',
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
      showNewBadge: false,
      showBadge: false,
      isCustom: false,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-guide',
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
      showNewBadge: false,
      showBadge: false,
      isCustom: false,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-compliance',
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
      showNewBadge: false,
      showBadge: false,
      isCustom: false,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-notifications',
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
      showNewBadge: false,
      showBadge: true,
      badgeType: 'count',
      isCustom: false,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-settings',
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
      showNewBadge: false,
      showBadge: false,
      isCustom: false,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // システム運用メニューはコード内で直接制御（レベル99専用）
    // EnhancedSidebar.tsxで実装
  ];
}

export function useSidebarMenuConfigs(options: UseSidebarMenuConfigsOptions = {}) {
  const { category, permissionLevel, enabled = true } = options;
  const [configs, setConfigs] = useState<SidebarMenuConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchConfigs = async () => {
      try {
        setLoading(true);
        setError(null);

        // クエリパラメータ構築
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (permissionLevel !== undefined) params.append('permissionLevel', String(permissionLevel));

        const response = await fetch(`/api/sidebar-menu/configs?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setConfigs(data.configs);
        } else {
          throw new Error(data.message || 'メニュー設定の取得に失敗しました');
        }
      } catch (err) {
        console.error('メニュー設定取得エラー:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // フォールバック: 静的なデフォルトメニューを返す
        if (category === 'common') {
          setConfigs(getDefaultCommonMenus());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, [category, permissionLevel, enabled]);

  return { configs, loading, error, refetch: () => {} };
}

/**
 * デバイス判定（モバイル・タブレット・デスクトップ）
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
}

/**
 * メニュー設定をデバイスタイプでフィルタリング
 */
export function filterConfigsByDevice(
  configs: SidebarMenuConfig[],
  deviceType: 'mobile' | 'tablet' | 'desktop'
): SidebarMenuConfig[] {
  return configs.filter((config) => {
    switch (deviceType) {
      case 'mobile':
        return config.showOnMobile;
      case 'tablet':
        return config.showOnTablet;
      case 'desktop':
        return config.showOnDesktop;
      default:
        return true;
    }
  });
}
