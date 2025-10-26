/**
 * 議題モード専用メニュー設定
 *
 * 18段階権限レベル詳細一覧.mdに基づく議題システムモードのサイドバーメニュー
 */

import { MenuItem } from '../types/sidebar';
import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';

/**
 * 議題モード専用メニュー項目
 */
export const AGENDA_MODE_MENU_ITEMS: Record<string, MenuItem> = {
  // 投稿の追跡（レベル1+）
  post_tracking: {
    id: 'post_tracking',
    title: '投稿の追跡',
    label: '投稿の追跡',
    icon: '📍',
    path: '/idea-voice/progress',
    requiredLevel: 1,
    category: 'agenda'
  },

  // 投稿管理（レベル3.5+）
  proposal_management: {
    id: 'proposal_management',
    title: '投稿管理',
    label: '投稿管理',
    icon: '📋',
    path: '/proposal-management',
    requiredLevel: 3.5,
    category: 'agenda'
  },

  // 期限到達提案判断（レベル7+：副師長以上）
  expired_escalation_proposals: {
    id: 'expired_escalation_proposals',
    title: '期限到達提案判断',
    label: '期限到達提案判断',
    icon: '⏰',
    path: '/expired-escalation-proposals',
    requiredLevel: 7,
    category: 'agenda'
  },

  // 委員会管理（レベル7+：副師長以上）
  committee_management: {
    id: 'committee_management',
    title: '委員会管理',
    label: '委員会管理',
    icon: '🏛️',
    path: '/committee-management',
    requiredLevel: 7,
    category: 'agenda'
  },

  // 運営委員会（レベル10+：部長以上）
  management_committee: {
    id: 'management_committee',
    title: '運営委員会',
    label: '運営委員会',
    icon: '🏛️',
    path: '/management-committee',
    requiredLevel: 10,
    category: 'agenda'
  },

  // 施設ガバナンス（レベル10+）
  facility_governance: {
    id: 'facility_governance',
    title: '施設ガバナンス',
    label: '施設ガバナンス',
    icon: '⚖️',
    path: '/facility-governance',
    requiredLevel: 10,
    category: 'agenda'
  },

  // 決定会議（レベル13：院長専用）
  decision_meeting: {
    id: 'decision_meeting',
    title: '決定会議',
    label: '決定会議',
    icon: '🏛️',
    path: '/decision-meeting',
    requiredLevel: 13,
    category: 'agenda'
  },

  // ボイス分析（レベル14+：人事部門員以上）
  voice_analytics: {
    id: 'voice_analytics',
    title: 'ボイス分析',
    label: 'ボイス分析',
    icon: '📊',
    path: '/voice-analytics',
    requiredLevel: 14,
    category: 'agenda'
  },

  // カルチャー開発（レベル14+）
  culture_development: {
    id: 'culture_development',
    title: 'カルチャー開発',
    label: 'カルチャー開発',
    icon: '🌱',
    path: '/culture-development',
    requiredLevel: 14,
    category: 'agenda'
  },

  // 組織インサイト（レベル15+：人事各部門長以上）
  organization_insight: {
    id: 'organization_insight',
    title: '組織分析',
    label: '組織分析',
    icon: '🔍',
    path: '/organization-analytics',
    requiredLevel: 15,
    category: 'agenda'
  },

  // 戦略HR計画（レベル16+：戦略企画部門員以上）
  strategic_hr_plan: {
    id: 'strategic_hr_plan',
    title: '戦略HR計画',
    label: '戦略HR計画',
    icon: '📈',
    path: '/strategic-hr-plan',
    requiredLevel: 16,
    category: 'agenda'
  },

  // エグゼクティブ報告（レベル16+）
  executive_report: {
    id: 'executive_report',
    title: 'エグゼクティブ報告',
    label: 'エグゼクティブ報告',
    icon: '📋',
    path: '/executive-reports',
    requiredLevel: 16,
    category: 'agenda'
  },

  // 理事会準備（レベル17：統括管理部門長専用）
  board_preparation: {
    id: 'board_preparation',
    title: '理事会準備',
    label: '理事会準備',
    icon: '🏛️',
    path: '/board-preparation',
    requiredLevel: 17,
    category: 'agenda'
  },

  // 法人全体議題化ダッシュボード（レベル18：理事長・法人事務局長専用）
  corporate_agenda_dashboard: {
    id: 'corporate_agenda_dashboard',
    title: '法人全体議題化ダッシュボード',
    label: '法人全体議題化ダッシュボード',
    icon: '🏢',
    path: '/corporate-agenda-dashboard',
    requiredLevel: 18,
    category: 'agenda'
  },

  // 施設横断課題分析（レベル18）
  cross_facility_analysis: {
    id: 'cross_facility_analysis',
    title: '施設横断課題分析',
    label: '施設横断課題分析',
    icon: '🔄',
    path: '/cross-facility-analysis',
    requiredLevel: 18,
    category: 'agenda'
  },

  // 理事会議題確認（レベル18）
  board_agenda_review: {
    id: 'board_agenda_review',
    title: '理事会議題確認',
    label: '理事会議題確認',
    icon: '📋',
    path: '/board-agenda-review',
    requiredLevel: 18,
    category: 'agenda'
  },

  // 理事会決定事項フォロー（レベル18）
  board_decision_follow: {
    id: 'board_decision_follow',
    title: '理事会決定事項フォロー',
    label: '理事会決定事項フォロー',
    icon: '✅',
    path: '/board-decision-follow',
    requiredLevel: 18,
    category: 'agenda'
  },

  // 緊急アカウント停止（レベル14-17専用）
  emergency_account_deactivation: {
    id: 'emergency_account_deactivation',
    title: '緊急アカウント停止',
    label: '緊急アカウント停止',
    icon: '🚨',
    path: '/emergency/account-deactivation',
    requiredLevel: 14,
    category: 'agenda'
  },

  // 緊急退職処理（レベル14-17専用）
  emergency_retirement_processing: {
    id: 'emergency_retirement_processing',
    title: '緊急退職処理',
    label: '緊急退職処理',
    icon: '⚠️',
    path: '/retirement-processing',
    requiredLevel: 14,
    category: 'agenda'
  }
};

/**
 * 権限レベル別の議題モードメニュー可視性
 */
export const AGENDA_MODE_MENU_VISIBILITY: Record<number | string, string[]> = {
  // レベル1：新人（1年目）
  1: ['post_tracking'],

  // レベル1.5：新人看護師（リーダー可）
  1.5: ['post_tracking'],

  // レベル2：若手（2-3年目）
  2: ['post_tracking'],

  // レベル2.5：若手看護師（リーダー可）
  2.5: ['post_tracking'],

  // レベル3：中堅（4-10年目）
  3: ['post_tracking'],

  // レベル3.5：中堅看護師（リーダー可）
  3.5: ['post_tracking', 'proposal_management'],

  // レベル4：ベテラン（11年以上）
  4: ['post_tracking'],

  // レベル4.5：ベテラン看護師（リーダー可）
  4.5: ['post_tracking', 'proposal_management'],

  // レベル5：副主任
  5: ['post_tracking', 'proposal_management'],

  // レベル6：主任
  6: ['post_tracking', 'proposal_management'],

  // レベル7：副師長・副科長・副課長
  7: [
    'post_tracking', 'proposal_management', 'expired_escalation_proposals', 'committee_management'
  ],

  // レベル8：師長・科長・課長・室長
  8: [
    'post_tracking', 'proposal_management', 'expired_escalation_proposals', 'committee_management'
  ],

  // レベル9：副部長
  9: [
    'post_tracking', 'proposal_management', 'expired_escalation_proposals', 'committee_management'
  ],

  // レベル10：部長・医局長
  10: [
    'post_tracking', 'proposal_management', 'expired_escalation_proposals', 'committee_management', 'management_committee', 'facility_governance'
  ],

  // レベル11：事務長
  11: [
    'post_tracking', 'proposal_management', 'expired_escalation_proposals', 'committee_management', 'management_committee',
    'facility_governance'
  ],

  // レベル12：副院長
  12: [
    'post_tracking', 'expired_escalation_proposals', 'management_committee', 'facility_governance'
  ],

  // レベル13：院長・施設長
  13: [
    'post_tracking', 'expired_escalation_proposals', 'management_committee', 'facility_governance', 'decision_meeting'
  ],

  // レベル14：人事部門員
  14: [
    'post_tracking', 'voice_analytics', 'culture_development', 'emergency_account_deactivation', 'emergency_retirement_processing'
  ],

  // レベル15：人事各部門長
  15: [
    'post_tracking', 'voice_analytics', 'culture_development', 'organization_insight', 'emergency_account_deactivation', 'emergency_retirement_processing'
  ],

  // レベル16：戦略企画・統括管理部門員
  16: [
    'post_tracking', 'voice_analytics', 'culture_development', 'organization_insight',
    'strategic_hr_plan', 'executive_report', 'emergency_account_deactivation', 'emergency_retirement_processing'
  ],

  // レベル17：戦略企画・統括管理部門長
  17: [
    'post_tracking', 'voice_analytics', 'culture_development', 'organization_insight',
    'strategic_hr_plan', 'executive_report', 'board_preparation', 'emergency_account_deactivation', 'emergency_retirement_processing'
  ],

  // レベル18：理事長・法人事務局長
  18: [
    'post_tracking', 'voice_analytics', 'corporate_agenda_dashboard',
    'cross_facility_analysis', 'board_agenda_review', 'board_decision_follow'
  ],

  // レベルX：システム管理者（全アクセス）
  'X': Object.keys(AGENDA_MODE_MENU_ITEMS)
};

/**
 * ユーザーの権限レベルに応じた議題モードメニュー項目を取得
 * @param permissionLevel ユーザーの権限レベル
 * @returns 表示可能なメニュー項目の配列
 */
export function getAgendaMenuItems(permissionLevel: number | string): MenuItem[] {
  const visibleItemKeys = AGENDA_MODE_MENU_VISIBILITY[permissionLevel] || [];
  return visibleItemKeys
    .map(key => AGENDA_MODE_MENU_ITEMS[key])
    .filter(item => item !== undefined);
}
