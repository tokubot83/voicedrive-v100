// 13段階権限レベル対応メニュー設定

import { MenuStructure, MenuVisibility } from '../types/menuTypes';

export const MENU_STRUCTURE: MenuStructure = {
  // ステーション系（投稿・プロジェクト関連）
  station: {
    personal: {
      id: 'personal_station',
      label: 'パーソナルステーション',
      icon: '👤',
      path: '/personal-dashboard',
      requiredLevel: 1,
      category: 'station'
    },
    leader: {
      id: 'leader_station',
      label: 'リーダーステーション',
      icon: '👥',
      path: '/team-leader-dashboard',
      requiredLevel: 2,
      category: 'station'
    },
    department: {
      id: 'department_station',
      label: '部門ステーション',
      icon: '🏥',
      path: '/department-dashboard',
      requiredLevel: 3,
      category: 'station'
    },
    section: {
      id: 'section_station',
      label: '部署ステーション',
      icon: '🏢',
      path: '/facility-dashboard',
      requiredLevel: 4,
      category: 'station'
    }
  },

  // 管理機能ページ
  management: {
    team: {
      id: 'team_management',
      label: 'チーム管理',
      icon: '👥',
      path: '/team-management',
      requiredLevel: 2,
      category: 'management'
    },
    authority_basic: {
      id: 'authority_basic',
      label: '権限管理（基本）',
      icon: '🔐',
      path: '/authority-basic',
      requiredLevel: 2,
      category: 'management'
    },
    department: {
      id: 'department_management',
      label: '部門管理',
      icon: '🏥',
      path: '/department-management',
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
      path: '/budget-planning',
      requiredLevel: 4,
      category: 'management'
    }
  },

  // 人事機能ページ
  hr: {
    interview: {
      id: 'interview_management',
      label: '面談管理',
      icon: '🗣️',
      path: '/interview-management',
      requiredLevel: 8,
      category: 'hr',
      children: [
        {
          id: 'interview_booking',
          label: '面談予約',
          icon: '📅',
          path: '/interview-booking',
          requiredLevel: 8,
          category: 'hr'
        },
        {
          id: 'interview_calendar',
          label: '面談カレンダー',
          icon: '📆',
          path: '/interview-calendar',
          requiredLevel: 8,
          category: 'hr'
        }
      ]
    },
    policy: {
      id: 'policy_management',
      label: 'ポリシー管理',
      icon: '📋',
      path: '/policy-management',
      requiredLevel: 8,
      category: 'hr'
    },
    talent: {
      id: 'talent_analytics',
      label: 'タレント分析',
      icon: '📊',
      path: '/talent-analytics',
      requiredLevel: 8,
      category: 'hr'
    },
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
    planning: {
      id: 'strategic_hr_planning',
      label: '戦略的人事計画',
      icon: '🎯',
      path: '/strategic-planning',
      requiredLevel: 10,
      category: 'strategic_hr'
    },
    org_development: {
      id: 'org_development',
      label: '組織開発',
      icon: '🏗️',
      path: '/org-development',
      requiredLevel: 10,
      category: 'strategic_hr'
    },
    performance: {
      id: 'performance_analytics',
      label: 'パフォーマンス分析',
      icon: '📊',
      path: '/performance-analytics',
      requiredLevel: 10,
      category: 'strategic_hr'
    },
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
    all_facility: {
      id: 'all_facility_management',
      label: '全施設管理',
      icon: '🏢',
      path: '/facility-management',
      requiredLevel: 10,
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

  // 分析機能ページ
  analytics: {
    dept_user: {
      id: 'dept_user_analysis',
      label: '所属部門ユーザー分析',
      icon: '👥',
      path: '/user-analysis',
      requiredLevel: 3,
      category: 'analytics'
    },
    dept_generation: {
      id: 'dept_generation_analysis',
      label: '所属部門世代間分析',
      icon: '📊',
      path: '/generational-analysis',
      requiredLevel: 3,
      category: 'analytics'
    },
    facility_hierarchy: {
      id: 'facility_hierarchy_analysis',
      label: '所属施設階層間分析',
      icon: '🏗️',
      path: '/hierarchical-analysis',
      requiredLevel: 5,
      category: 'analytics'
    },
    facility_profession: {
      id: 'facility_profession_analysis',
      label: '所属施設職種間分析',
      icon: '⚕️',
      path: '/professional-analysis',
      requiredLevel: 5,
      category: 'analytics'
    },
    all_user: {
      id: 'all_user_analysis',
      label: '全施設ユーザー分析',
      icon: '👥',
      path: '/organization-analytics',
      requiredLevel: 10,
      category: 'analytics'
    },
    all_generation: {
      id: 'all_generation_analysis',
      label: '全施設世代間分析',
      icon: '📈',
      path: '/generational-analysis',
      requiredLevel: 10,
      category: 'analytics'
    },
    all_hierarchy: {
      id: 'all_hierarchy_analysis',
      label: '全施設階層間分析',
      icon: '🏢',
      path: '/hierarchical-analysis',
      requiredLevel: 10,
      category: 'analytics'
    },
    all_profession: {
      id: 'all_profession_analysis',
      label: '全施設職種間分析',
      icon: '⚕️',
      path: '/professional-analysis',
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
    },
    board_reports: {
      id: 'board_reports',
      label: '全体会議レポート',
      icon: '📋',
      path: '/board-reports',
      requiredLevel: 11,
      category: 'executive'
    },
    governance: {
      id: 'governance',
      label: 'ガバナンス',
      icon: '⚖️',
      path: '/governance',
      requiredLevel: 11,
      category: 'executive'
    }
  }
};

// 13段階権限レベル別メニュー可視性設定
export const MENU_VISIBILITY: MenuVisibility = {
  1: { // 一般職員 (STAFF)
    station: ['personal'],
    management: [],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  2: { // 主任 (SUPERVISOR)
    station: ['personal', 'leader'],
    management: ['team', 'authority_basic'],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  3: { // 師長 (HEAD_NURSE)
    station: ['personal', 'leader', 'department'],
    management: ['team', 'authority_basic', 'department'],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: ['dept_user', 'dept_generation'],
    executive: []
  },
  4: { // 部長・課長 (DEPARTMENT_HEAD)
    station: ['personal', 'leader', 'department', 'section'],
    management: ['team', 'authority_basic', 'department', 'section', 'budget'],
    hr: [],
    strategic_hr: [],
    facility: [],
    analytics: ['dept_user', 'dept_generation'],
    executive: []
  },
  5: { // 事務長 (ADMINISTRATIVE_DIRECTOR)
    station: ['personal', 'leader', 'department', 'section'],
    management: ['team', 'authority_basic', 'department', 'section', 'budget'],
    hr: [],
    strategic_hr: [],
    facility: ['own_facility', 'own_strategy', 'own_budget'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: []
  },
  6: { // 副院長 (VICE_DIRECTOR)
    station: ['personal', 'leader', 'department', 'section'],
    management: ['team', 'authority_basic', 'department', 'section', 'budget'],
    hr: [],
    strategic_hr: [],
    facility: ['own_facility', 'own_strategy', 'own_budget'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: []
  },
  7: { // 院長・施設長 (HOSPITAL_DIRECTOR)
    station: ['personal', 'leader', 'department', 'section'],
    management: ['team', 'authority_basic', 'department', 'section', 'budget'],
    hr: [],
    strategic_hr: [],
    facility: ['own_facility', 'own_strategy', 'own_budget'],
    analytics: ['dept_user', 'dept_generation', 'facility_hierarchy', 'facility_profession'],
    executive: []
  },
  8: { // 人財統括本部事務員 (HR_ADMIN_STAFF)
    station: ['personal'],
    management: [],
    hr: ['interview', 'policy', 'talent'],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  9: { // 人財統括本部 キャリア支援部門員 (CAREER_SUPPORT_STAFF)
    station: ['personal'],
    management: [],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: [],
    facility: [],
    analytics: [],
    executive: []
  },
  10: { // 人財統括本部 各部門長 (HR_DEPARTMENT_HEAD)
    station: ['personal'],
    management: [],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development', 'performance', 'retirement'],
    facility: ['all_facility', 'all_strategy', 'all_budget'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report'],
    executive: []
  },
  11: { // 人財統括本部 統括管理部門長 (HR_GENERAL_MANAGER)
    station: ['personal'],
    management: [],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development', 'performance', 'retirement'],
    facility: ['all_facility', 'all_strategy', 'all_budget'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report'],
    executive: ['overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance']
  },
  12: { // 厚生会本部統括事務局長 (GENERAL_ADMINISTRATIVE_DIRECTOR)
    station: ['personal'],
    management: [],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development', 'performance', 'retirement'],
    facility: ['all_facility', 'all_strategy', 'all_budget'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report'],
    executive: ['overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance']
  },
  13: { // 理事長 (CHAIRMAN)
    station: ['personal'],
    management: [],
    hr: ['interview', 'policy', 'talent', 'dashboard'],
    strategic_hr: ['planning', 'org_development', 'performance', 'retirement'],
    facility: ['all_facility', 'all_strategy', 'all_budget'],
    analytics: ['all_user', 'all_generation', 'all_hierarchy', 'all_profession', 'executive_report'],
    executive: ['overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance']
  }
};