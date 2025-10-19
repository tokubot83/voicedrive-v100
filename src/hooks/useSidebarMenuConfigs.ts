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
