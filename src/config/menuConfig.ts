// 18段階権限レベル対応メニュー設定

import { MenuStructure, MenuVisibility } from '../types/menuTypes';

export const MENU_STRUCTURE: MenuStructure = {
  // ステーション系（投稿・プロジェクト関連）
  station: {
    personal: {
      id: 'personal_station',
      label: 'パーソナルステーション',
      icon: '👤',
      path: '/personal-station',
      requiredLevel: 1,
      category: 'station'
    },
    department: {
      id: 'department_station',
      label: '部門ステーション',
      icon: '🏥',
      path: '/department-station',
      requiredLevel: 3,
      category: 'station'
    }
  },

  // 管理機能ページ
  management: {
    authority_basic: {
      id: 'authority_basic',
      label: '権限管理（基本）',
      icon: '🔐',
      path: '/authority',
      requiredLevel: 2,
      category: 'management'
    },
    department: {
      id: 'department_management',
      label: '部門管理',
      icon: '🏥',
      path: '/department-overview',
      requiredLevel: 3,
      category: 'management'
    },
    section: {
      id: 'section_management',
      label: '部署管理',
      icon: '🏢',
      path: '/section-management',
      requiredLevel: 4,
      category: 'management'
    },
    budget: {
      id: 'budget_management',
      label: '予算管理',
      icon: '💰',
      path: '/budget',
      requiredLevel: 4,
      category: 'management'
    },
    users: {
      id: 'user_management',
      label: 'ユーザー管理',
      icon: '👤',
      path: '/admin/users',
      requiredLevel: 5,
      category: 'management'
    },
    system_settings: {
      id: 'system_settings',
      label: 'システム設定',
      icon: '⚙️',
      path: '/admin/system-settings',
      requiredLevel: 6,
      category: 'management'
    },
    audit_logs: {
      id: 'audit_logs',
      label: '監査ログ',
      icon: '📋',
      path: '/admin/audit-logs',
      requiredLevel: 5,
      category: 'management'
    }
  },

  // 人事機能ページ
  hr: {
    dashboard: {
      id: 'hr_dashboard',
      label: '人事ダッシュボード',
      icon: '📈',
      path: '/hr-dashboard',
      requiredLevel: 9,
      category: 'hr'
    }
  },

  // 戦略的人事機能ページ
  strategic_hr: {
    retirement: {
      id: 'retirement_management',
      label: '退職管理',
      icon: '👋',
      path: '/retirement-processing',
      requiredLevel: 10,
      category: 'strategic_hr'
    }
  },

  // 施設管理機能ページ
  facility: {
    own_facility: {
      id: 'own_facility_management',
      label: '所属施設管理',
      icon: '🏥',
      path: '/own-facility-management',
      requiredLevel: 5,
      category: 'facility'
    },
    own_strategy: {
      id: 'own_facility_strategy',
      label: '所属施設戦略概要',
      icon: '📋',
      path: '/own-facility-strategy',
      requiredLevel: 5,
      category: 'facility'
    },
    own_budget: {
      id: 'own_facility_budget',
      label: '所属施設予算計画',
      icon: '💰',
      path: '/own-facility-budget',
      requiredLevel: 5,
      category: 'facility'
    },
    all_strategy: {
      id: 'all_facility_strategy',
      label: '全施設戦略概要',
      icon: '📊',
      path: '/strategic-overview',
      requiredLevel: 10,
      category: 'facility'
    },
    all_budget: {
      id: 'all_facility_budget',
      label: '全施設予算計画',
      icon: '💼',
      path: '/budget-planning',
      requiredLevel: 10,
      category: 'facility'
    }
  },

  // 分析機能ページ（5ページ削除 - VoiceAnalyticsPage Phase 18.5に統合予定）
  analytics: {
    all_user: {
      id: 'all_user_analysis',
      label: '全施設ユーザー分析',
      icon: '👥',
      path: '/organization-analytics',
      requiredLevel: 10,
      category: 'analytics'
    },
    executive_report: {
      id: 'executive_report',
      label: 'エグゼクティブレポート',
      icon: '📋',
      path: '/executive-reports',
      requiredLevel: 10,
      category: 'analytics'
    }
  },

  // 経営機能ページ
  executive: {
    overview: {
      id: 'executive_overview',
      label: '経営概要',
      icon: '📊',
      path: '/executive-dashboard',
      requiredLevel: 11,
      category: 'executive'
    },
    strategic_initiatives: {
      id: 'strategic_initiatives',
      label: '戦略イニシアチブ',
      icon: '🎯',
      path: '/strategic-initiatives',
      requiredLevel: 11,
      category: 'executive'
    },
    organization_analytics: {
      id: 'organization_analytics',
      label: '組織分析',
      icon: '🏢',
      path: '/organization-analytics',
      requiredLevel: 11,
      category: 'executive'
    }
  }
};

// 18段階権限レベル別メニュー可視性設定
export const MENU_VISIBILITY: MenuVisibility = {
  1: { // 新人（1年目）
    station: ['personal'],
    management: [],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  1.5: { // 新人看護師（リーダー可）
    station: ['personal'],
    management: [],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  2: { // 若手（2-3年目）
    station: ['personal'],
    management: [],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  2.5: { // 若手看護師（リーダー可）
    station: ['personal', 'leader'],
    management: [],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  3: { // 中堅（4-10年目）
    station: ['personal', 'leader'],
    management: [],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  3.5: { // 中堅看護師（リーダー可）
    station: ['personal', 'leader'],
    management: ['authority_basic'],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  4: { // ベテラン（11年以上）
    station: ['personal', 'leader'],
    management: ['authority_basic'],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  4.5: { // ベテラン看護師（リーダー可）
    station: ['personal', 'leader', 'department'],
    management: ['authority_basic', 'department'],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: ['dept_user'],
    executive: []
  },
  5: { // 副主任
    station: ['personal', 'leader', 'department'],
    management: ['authority_basic', 'department'],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: ['dept_user', 'dept_generation'],
    executive: []
  },
  6: { // 主任
    station: ['personal', 'leader', 'department'],
    management: ['authority_basic', 'department'],
    hr: ['policy'],
    strategic_hr: [],
    facility: [],
    analytics: ['dept_user', 'dept_generation'],
    executive: []
  },
  7: { // 副師長・副科長
    station: ['personal', 'leader', 'department'],
    management: ['authority_basic', 'department', 'section'],
    hr: ['policy'],
    strategic_hr: [],
    facility: [],
    analytics: ['dept_user', 'dept_generation'],
    executive: []
  },
  8: { // 師長・科長・課長
    station: ['personal', 'leader', 'department', 'section'],
    management: ['authority_basic', 'department', 'section', 'budget'],
    hr: ['policy'],
    strategic_hr: [],
    facility: [],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy'],
    executive: []
  },
  9: { // 副部長
    station: ['personal', 'leader', 'department', 'section'],
    management: ['authority_basic', 'department', 'section', 'budget'],
    hr: ['policy'],
    strategic_hr: [],
    facility: ['own_facility'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: []
  },
  10: { // 部長・医局長
    station: ['personal', 'leader', 'department', 'section'],
    management: ['authority_basic', 'department', 'section', 'budget', 'users'],
    hr: ['policy'],
    strategic_hr: [],
    facility: ['own_facility', 'own_strategy'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: []
  },
  11: { // 事務長
    station: ['personal', 'leader', 'department', 'section'],
    management: ['authority_basic', 'department', 'section', 'budget', 'users', 'audit_logs'],
    hr: ['policy'],
    strategic_hr: [],
    facility: ['own_facility', 'own_strategy', 'own_budget'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: []
  },
  12: { // 副院長
    station: ['personal', 'leader', 'department', 'section'],
    management: ['authority_basic', 'department', 'section', 'budget', 'users', 'audit_logs', 'system_settings'],
    hr: ['policy'],
    strategic_hr: [],
    facility: ['own_facility', 'own_strategy', 'own_budget'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: ['overview']
  },
  13: { // 院長・施設長
    station: ['personal', 'leader', 'department', 'section'],
    management: ['authority_basic', 'department', 'section', 'budget', 'users', 'audit_logs', 'system_settings'],
    hr: ['policy'],
    strategic_hr: [],
    facility: ['own_facility', 'own_strategy', 'own_budget'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: ['overview', 'strategic_initiatives']
  },
  14: { // 人事部門員
    station: ['personal'],
    management: ['users', 'audit_logs'],
    hr: ['interview', 'policy', 'talent'],
    strategic_hr: [],
    facility: [],
    analytics: ['all_user'],
    executive: []
  },
  15: { // 人事各部門長
    station: ['personal'],
    management: ['users', 'audit_logs', 'system_settings'],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development'],
    facility: [],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession'],
    executive: []
  },
  16: { // 戦略企画・統括管理部門員
    station: ['personal'],
    management: ['users', 'audit_logs', 'system_settings'],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development'],
    facility: ['all_strategy'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report'],
    executive: ['overview', 'organization_analytics']
  },
  17: { // 戦略企画・統括管理部門長
    station: ['personal'],
    management: ['users', 'audit_logs', 'system_settings'],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development', 'retirement'],
    facility: ['all_strategy', 'all_budget'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report'],
    executive: ['overview', 'strategic_initiatives', 'organization_analytics', 'board_reports']
  },
  18: { // 理事長・法人事務局長
    station: ['personal'],
    management: ['users', 'audit_logs', 'system_settings'],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development', 'retirement'],
    facility: ['all_strategy', 'all_budget'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report'],
    executive: ['overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance']
  },
  'X': { // システム管理者
    station: ['personal', 'leader', 'department', 'section'],
    management: ['authority_basic', 'department', 'section', 'budget', 'users', 'audit_logs', 'system_settings'],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development', 'retirement'],
    facility: ['all_strategy', 'all_budget', 'own_facility', 'own_strategy', 'own_budget'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report', 'dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: ['overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance']
  }
};