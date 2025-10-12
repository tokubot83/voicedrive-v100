/**
 * プロジェクト化モード専用メニュー設定
 *
 * チーム編成・組織一体感の向上に特化したプロジェクト化モードのサイドバーメニュー
 */

import { MenuItem } from '../types/sidebar';
import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';

/**
 * プロジェクト化モード専用メニュー項目
 */
export const PROJECT_MODE_MENU_ITEMS: Record<string, MenuItem> = {
  // 投稿の追跡（レベル1+）- アイデアボイス投稿の追跡
  idea_tracking: {
    id: 'idea_tracking',
    title: '投稿の追跡',
    label: '投稿の追跡',
    icon: '📊',
    path: '/idea-tracking',
    requiredLevel: 1,
    category: 'project'
  },

  // プロジェクトの追跡（レベル1+）
  project_tracking: {
    id: 'project_tracking',
    title: 'プロジェクトの追跡',
    label: 'プロジェクトの追跡',
    icon: '📍',
    path: '/project-tracking',
    requiredLevel: 1,
    category: 'project'
  },

  // プロジェクト承認（レベル6+：主任以上）
  project_approval: {
    id: 'project_approval',
    title: 'プロジェクト承認',
    label: 'プロジェクト承認',
    icon: '✅',
    path: '/project-approval',
    requiredLevel: 6,
    category: 'project'
  },

  // 進捗ダッシュボード（レベル10+：部長以上）
  progress_dashboard: {
    id: 'progress_dashboard',
    title: '進捗ダッシュボード',
    label: '進捗ダッシュボード',
    icon: '📈',
    path: '/progress-dashboard',
    requiredLevel: 10,
    category: 'project'
  },

  // 緊急アカウント停止（レベル14-17専用）
  emergency_account_deactivation: {
    id: 'emergency_account_deactivation',
    title: '緊急アカウント停止',
    label: '緊急アカウント停止',
    icon: '🚨',
    path: '/emergency/account-deactivation',
    requiredLevel: 14,
    category: 'project'
  }
};

/**
 * 権限レベル別のプロジェクト化モードメニュー可視性
 */
export const PROJECT_MODE_MENU_VISIBILITY: Record<number | string, string[]> = {
  // レベル1：新人（1年目）
  1: ['idea_tracking', 'project_tracking'],

  // レベル1.5：新人看護師（リーダー可）
  1.5: ['idea_tracking', 'project_tracking'],

  // レベル2：若手（2-3年目）
  2: ['idea_tracking', 'project_tracking'],

  // レベル2.5：若手看護師（リーダー可）
  2.5: ['idea_tracking', 'project_tracking'],

  // レベル3：中堅（4-10年目）
  3: ['idea_tracking', 'project_tracking'],

  // レベル3.5：中堅看護師（リーダー可）
  3.5: ['idea_tracking', 'project_tracking'],

  // レベル4：ベテラン（11年以上）
  4: ['idea_tracking', 'project_tracking'],

  // レベル4.5：ベテラン看護師（リーダー可）
  4.5: ['idea_tracking', 'project_tracking'],

  // レベル5：副主任
  5: ['idea_tracking', 'project_tracking'],

  // レベル6：主任
  6: ['idea_tracking', 'project_tracking', 'project_approval'],

  // レベル7：副師長・副科長・副課長
  7: ['idea_tracking', 'project_tracking', 'project_approval'],

  // レベル8：師長・科長・課長・室長
  8: ['idea_tracking', 'project_tracking', 'project_approval'],

  // レベル9：副部長
  9: [
    'idea_tracking', 'project_tracking', 'project_approval'
  ],

  // レベル10：部長・医局長
  10: [
    'idea_tracking', 'project_tracking', 'project_approval', 'progress_dashboard'
  ],

  // レベル11：事務長
  11: [
    'idea_tracking', 'project_tracking', 'project_approval', 'progress_dashboard'
  ],

  // レベル12：副院長
  12: [
    'idea_tracking', 'project_tracking', 'project_approval', 'progress_dashboard'
  ],

  // レベル13：院長・施設長
  13: [
    'idea_tracking', 'project_tracking', 'project_approval', 'progress_dashboard'
  ],

  // レベル14：人事部門員
  14: [
    'idea_tracking', 'project_tracking', 'emergency_account_deactivation'
  ],

  // レベル15：人事各部門長
  15: [
    'idea_tracking', 'project_tracking', 'emergency_account_deactivation'
  ],

  // レベル16：戦略企画・統括管理部門員
  16: [
    'idea_tracking', 'project_tracking', 'emergency_account_deactivation'
  ],

  // レベル17：戦略企画・統括管理部門長
  17: [
    'idea_tracking', 'project_tracking', 'emergency_account_deactivation'
  ],

  // レベル18：理事長・法人事務局長
  18: [
    'idea_tracking', 'project_tracking'
  ],

  // レベルX：システム管理者（全アクセス）
  'X': Object.keys(PROJECT_MODE_MENU_ITEMS)
};

/**
 * ユーザーの権限レベルに応じたプロジェクト化モードメニュー項目を取得
 * @param permissionLevel ユーザーの権限レベル
 * @returns 表示可能なメニュー項目の配列
 */
export function getProjectMenuItems(permissionLevel: number | string): MenuItem[] {
  const visibleItemKeys = PROJECT_MODE_MENU_VISIBILITY[permissionLevel] || [];
  return visibleItemKeys
    .map(key => PROJECT_MODE_MENU_ITEMS[key])
    .filter(item => item !== undefined);
}
