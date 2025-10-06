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

  // プロジェクト承認（レベル3.5+：中堅リーダー以上）
  project_approval: {
    id: 'project_approval',
    title: 'プロジェクト承認',
    label: 'プロジェクト承認',
    icon: '✅',
    path: '/project-approval',
    requiredLevel: 3.5,
    category: 'project'
  },

  // チーム管理（レベル5+：副主任以上）
  team_management: {
    id: 'team_management',
    title: 'チーム管理',
    label: 'チーム管理',
    icon: '👥',
    path: '/team-management',
    requiredLevel: 5,
    category: 'project'
  },

  // 進捗ダッシュボード（レベル5+）
  progress_dashboard: {
    id: 'progress_dashboard',
    title: '進捗ダッシュボード',
    label: '進捗ダッシュボード',
    icon: '📈',
    path: '/progress-dashboard',
    requiredLevel: 5,
    category: 'project'
  },

  // マイルストーン管理（レベル7+：副師長以上）
  milestone_management: {
    id: 'milestone_management',
    title: 'マイルストーン管理',
    label: 'マイルストーン管理',
    icon: '🎯',
    path: '/milestone-management',
    requiredLevel: 7,
    category: 'project'
  },

  // 部署横断プロジェクト（レベル9+：副部長以上）
  cross_department_project: {
    id: 'cross_department_project',
    title: '部署横断プロジェクト',
    label: '部署横断プロジェクト',
    icon: '🔄',
    path: '/cross-department-project',
    requiredLevel: 9,
    category: 'project'
  },

  // 施設プロジェクト管理（レベル10+：部長以上）
  facility_project_management: {
    id: 'facility_project_management',
    title: '施設プロジェクト管理',
    label: '施設プロジェクト管理',
    icon: '🏢',
    path: '/facility-project-management',
    requiredLevel: 10,
    category: 'project'
  },


  // エグゼクティブダッシュボード（レベル12+：副院長以上）
  executive_dashboard: {
    id: 'executive_dashboard',
    title: 'エグゼクティブダッシュボード',
    label: 'エグゼクティブダッシュボード',
    icon: '📊',
    path: '/executive-dashboard',
    requiredLevel: 12,
    category: 'project'
  },

  // プロジェクトガバナンス（レベル12+）
  project_governance: {
    id: 'project_governance',
    title: 'プロジェクトガバナンス',
    label: 'プロジェクトガバナンス',
    icon: '⚖️',
    path: '/project-governance',
    requiredLevel: 12,
    category: 'project'
  },

  // 戦略イニシアチブ（レベル13+：院長以上）
  strategic_initiatives: {
    id: 'strategic_initiatives',
    title: '戦略イニシアチブ',
    label: '戦略イニシアチブ',
    icon: '🎯',
    path: '/strategic-initiatives',
    requiredLevel: 13,
    category: 'project'
  },

  // 組織分析（レベル14+：人事部門員以上）
  organization_analytics: {
    id: 'organization_analytics',
    title: '組織分析',
    label: '組織分析',
    icon: '📊',
    path: '/organization-analytics',
    requiredLevel: 14,
    category: 'project'
  },

  // 人材開発プロジェクト（レベル15+：人事各部門長以上）
  talent_development_project: {
    id: 'talent_development_project',
    title: '人材開発プロジェクト',
    label: '人材開発プロジェクト',
    icon: '🌱',
    path: '/talent-development-project',
    requiredLevel: 15,
    category: 'project'
  },

  // 戦略的HR計画（レベル16+：戦略企画部門員以上）
  strategic_hr_plan: {
    id: 'strategic_hr_plan',
    title: '戦略的HR計画',
    label: '戦略的HR計画',
    icon: '📈',
    path: '/strategic-hr-plan',
    requiredLevel: 16,
    category: 'project'
  },

  // 法人プロジェクト管理（レベル17+：統括管理部門長以上）
  corporate_project_management: {
    id: 'corporate_project_management',
    title: '法人プロジェクト管理',
    label: '法人プロジェクト管理',
    icon: '🏛️',
    path: '/corporate-project-management',
    requiredLevel: 17,
    category: 'project'
  },

  // 理事会プロジェクト（レベル18：理事長専用）
  board_projects: {
    id: 'board_projects',
    title: '理事会プロジェクト',
    label: '理事会プロジェクト',
    icon: '🏛️',
    path: '/board-projects',
    requiredLevel: 18,
    category: 'project'
  },

  // 最終承認（レベル18）
  final_approval: {
    id: 'final_approval',
    title: '最終承認',
    label: '最終承認',
    icon: '✅',
    path: '/final-approval',
    requiredLevel: 18,
    category: 'project'
  },

  // 緊急アカウント停止（レベル14-17専用）
  emergency_account_deactivation: {
    id: 'emergency_account_deactivation',
    title: '🚨 緊急アカウント停止',
    label: '🚨 緊急アカウント停止',
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
  1: ['project_tracking'],

  // レベル1.5：新人看護師（リーダー可）
  1.5: ['project_tracking'],

  // レベル2：若手（2-3年目）
  2: ['project_tracking'],

  // レベル2.5：若手看護師（リーダー可）
  2.5: ['project_tracking'],

  // レベル3：中堅（4-10年目）
  3: ['project_tracking'],

  // レベル3.5：中堅看護師（リーダー可）
  3.5: ['project_tracking', 'project_approval'],

  // レベル4：ベテラン（11年以上）
  4: ['project_tracking', 'project_approval'],

  // レベル4.5：ベテラン看護師（リーダー可）
  4.5: ['project_tracking', 'project_approval'],

  // レベル5：副主任
  5: ['project_tracking', 'project_approval', 'team_management', 'progress_dashboard'],

  // レベル6：主任
  6: ['project_tracking', 'project_approval', 'team_management', 'progress_dashboard'],

  // レベル7：副師長・副科長・副課長
  7: ['project_tracking', 'project_approval', 'team_management', 'progress_dashboard', 'milestone_management'],

  // レベル8：師長・科長・課長・室長
  8: ['project_tracking', 'project_approval', 'team_management', 'progress_dashboard', 'milestone_management'],

  // レベル9：副部長
  9: [
    'project_tracking', 'project_approval', 'team_management', 'progress_dashboard',
    'milestone_management', 'cross_department_project'
  ],

  // レベル10：部長・医局長
  10: [
    'project_tracking', 'project_approval', 'team_management', 'progress_dashboard',
    'milestone_management', 'cross_department_project', 'facility_project_management'
  ],

  // レベル11：事務長
  11: [
    'project_tracking', 'project_approval', 'team_management', 'progress_dashboard',
    'milestone_management', 'cross_department_project', 'facility_project_management', 'budget_management'
  ],

  // レベル12：副院長
  12: [
    'project_tracking', 'project_approval', 'team_management', 'progress_dashboard', 'milestone_management',
    'cross_department_project', 'facility_project_management', 'budget_management',
    'executive_dashboard', 'project_governance'
  ],

  // レベル13：院長・施設長
  13: [
    'project_tracking', 'project_approval', 'team_management', 'progress_dashboard', 'milestone_management',
    'cross_department_project', 'facility_project_management', 'budget_management',
    'executive_dashboard', 'project_governance', 'strategic_initiatives'
  ],

  // レベル14：人事部門員
  14: [
    'project_tracking', 'organization_analytics', 'emergency_account_deactivation'
  ],

  // レベル15：人事各部門長
  15: [
    'project_tracking', 'organization_analytics', 'talent_development_project', 'emergency_account_deactivation'
  ],

  // レベル16：戦略企画・統括管理部門員
  16: [
    'project_tracking', 'organization_analytics', 'talent_development_project',
    'strategic_hr_plan', 'emergency_account_deactivation'
  ],

  // レベル17：戦略企画・統括管理部門長
  17: [
    'project_tracking', 'organization_analytics', 'talent_development_project',
    'strategic_hr_plan', 'corporate_project_management', 'emergency_account_deactivation'
  ],

  // レベル18：理事長・法人事務局長
  18: [
    'project_tracking', 'executive_dashboard', 'project_governance',
    'strategic_initiatives', 'board_projects', 'final_approval'
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
