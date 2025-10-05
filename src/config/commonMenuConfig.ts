/**
 * 共通メニュー設定
 *
 * 議題モード・プロジェクト化モード両方で常に表示されるメニュー項目
 */

import { MenuItem } from '../types/sidebar';

/**
 * 全モード共通のメニュー項目
 */
export const COMMON_MENU_ITEMS: Record<string, MenuItem> = {
  // パーソナルステーション（全員）
  personal_station: {
    id: 'personal_station',
    title: 'パーソナルステーション',
    label: 'パーソナルステーション',
    icon: '🏠',
    path: '/personal-station',
    requiredLevel: 1,
    category: 'common'
  },

  // 使い方ガイド（全員）
  user_guide: {
    id: 'user_guide',
    title: '使い方ガイド',
    label: '使い方ガイド',
    icon: '📖',
    path: '/user-guide',
    requiredLevel: 1,
    category: 'common'
  },

  // コンプライアンス窓口（全員）
  compliance_guide: {
    id: 'compliance_guide',
    title: 'コンプライアンス窓口',
    label: 'コンプライアンス窓口',
    icon: '🛡️',
    path: '/compliance-guide',
    requiredLevel: 1,
    category: 'common'
  },

  // 通知（全員）
  notifications: {
    id: 'notifications',
    title: '通知',
    label: '通知',
    icon: '🔔',
    path: '/notifications',
    requiredLevel: 1,
    category: 'common'
  },

  // 設定（全員）
  settings: {
    id: 'settings',
    title: '設定',
    label: '設定',
    icon: '⚙️',
    path: '/settings',
    requiredLevel: 1,
    category: 'common'
  },

  // システム設定（レベルX専用）
  system_settings: {
    id: 'system_settings',
    title: 'システム設定',
    label: 'システム設定',
    icon: '🔧',
    path: '/admin/system-settings',
    requiredLevel: 99, // レベルXのみ
    category: 'common'
  },

  // モード切り替え（レベルX専用）
  mode_switcher: {
    id: 'mode_switcher',
    title: 'モード切り替え',
    label: 'モード切り替え',
    icon: '🔄',
    path: '/admin/mode-switcher',
    requiredLevel: 99, // レベルXのみ
    category: 'common'
  }
};

/**
 * ユーザーの権限レベルに応じた共通メニュー項目を取得
 * @param permissionLevel ユーザーの権限レベル
 * @returns 表示可能な共通メニュー項目の配列
 */
export function getCommonMenuItems(permissionLevel: number | string): MenuItem[] {
  const items: MenuItem[] = [
    COMMON_MENU_ITEMS.personal_station,
    COMMON_MENU_ITEMS.user_guide,
    COMMON_MENU_ITEMS.compliance_guide,
    COMMON_MENU_ITEMS.notifications,
    COMMON_MENU_ITEMS.settings
  ];

  // レベルXの場合、システム設定とモード切り替えを追加
  if (permissionLevel === 'X' || permissionLevel === 99) {
    items.push(COMMON_MENU_ITEMS.system_settings);
    items.push(COMMON_MENU_ITEMS.mode_switcher);
  }

  return items;
}
