/**
 * 25段階権限レベルシステム - 医療法人厚生会組織階層対応
 * 医療職員管理システムと統合
 *
 * 構成：
 * - 基本18レベル（1-18）: 一般職員層から理事まで
 * - 看護職専用4レベル（1.5, 2.5, 3.5, 4.5）: リーダー業務可能な看護職
 * - 特別権限3レベル（97, 98, 99）: 健診担当者、産業医、システム管理者
 */
export enum PermissionLevel {
  // 一般職員層（経験年数別）1-4
  LEVEL_1 = 1,       // 新人（1年目）
  LEVEL_1_5 = 1.5,   // 新人（リーダー可）- 看護職専用
  LEVEL_2 = 2,       // 若手（2-3年目）
  LEVEL_2_5 = 2.5,   // 若手（リーダー可）- 看護職専用
  LEVEL_3 = 3,       // 中堅（4-10年目）
  LEVEL_3_5 = 3.5,   // 中堅（リーダー可）- 看護職専用
  LEVEL_4 = 4,       // ベテラン（11年以上）
  LEVEL_4_5 = 4.5,   // ベテラン（リーダー可）- 看護職専用

  // 役職層 5-11
  LEVEL_5 = 5,       // 副主任
  LEVEL_6 = 6,       // 主任
  LEVEL_7 = 7,       // 副師長・副科長・副課長
  LEVEL_8 = 8,       // 師長・科長・課長・室長
  LEVEL_9 = 9,       // 副部長
  LEVEL_10 = 10,     // 部長・医局長
  LEVEL_11 = 11,     // 事務長

  // 施設経営層 12-13
  LEVEL_12 = 12,     // 副院長
  LEVEL_13 = 13,     // 院長・施設長

  // 法人人事部 14-17
  LEVEL_14 = 14,     // 人事部門員
  LEVEL_15 = 15,     // 人事各部門長
  LEVEL_16 = 16,     // 戦略企画・統括管理部門員
  LEVEL_17 = 17,     // 戦略企画・統括管理部門長

  // 最高経営層 18
  LEVEL_18 = 18,     // 理事長・法人事務局長

  // 特別権限レベル 97-99
  LEVEL_97 = 97,     // 健診担当者（ストレスチェック実施者）
  LEVEL_98 = 98,     // 産業医
  LEVEL_99 = 99      // システム管理者
}

/**
 * @deprecated 旧システム管理者レベル - LEVEL_99を使用してください
 */
export enum SpecialPermissionLevel {
  LEVEL_X = 'X'
}

/**
 * 統合権限型
 */
export type AllPermissionLevels = PermissionLevel | SpecialPermissionLevel;

// 権限レベルのメタデータ
export interface PermissionMetadata {
  level: PermissionLevel;
  name: string;
  displayName: string;
  description: string;
  accessibleFeatures: string[];
  projectScopes: ProjectScope[];
  menuItems: string[];
  analyticsAccess: boolean;
  workflowStages: string[];
}

// プロジェクトスコープ定義
export enum ProjectScope {
  TEAM = 'TEAM',                 // チーム内
  DEPARTMENT = 'DEPARTMENT',     // 部門内
  FACILITY = 'FACILITY',         // 施設全体
  ORGANIZATION = 'ORGANIZATION', // 組織全体
  STRATEGIC = 'STRATEGIC'        // 戦略的プロジェクト
}

// 権限チェック結果
export interface PermissionCheckResult {
  hasPermission: boolean;
  requiredLevel?: PermissionLevel;
  currentLevel: PermissionLevel;
  reason?: string;
}

// 機能権限定義
export interface FeaturePermission {
  featureId: string;
  requiredLevel: PermissionLevel;
  description: string;
  category: 'PROJECT' | 'WORKFLOW' | 'ANALYTICS' | 'ADMIN' | 'SYSTEM';
}

// 権限レベルマッピング
export const PERMISSION_METADATA: Record<PermissionLevel, PermissionMetadata> = {
  // 一般職員層 1-4（基本レベル）
  [PermissionLevel.LEVEL_1]: {
    level: PermissionLevel.LEVEL_1,
    name: 'new_staff',
    displayName: '新人（1年目）',
    description: '新人看護師、新人事務職員、新人技術職員等',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  // 看護職専用レベル（リーダー可）
  [PermissionLevel.LEVEL_1_5]: {
    level: PermissionLevel.LEVEL_1_5,
    name: 'new_staff_leader',
    displayName: '新人（リーダー可）',
    description: '新人看護師（リーダー業務可能）',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts', 'leader_duty'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'leader_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_2]: {
    level: PermissionLevel.LEVEL_2,
    name: 'junior_staff',
    displayName: '若手（2-3年目）',
    description: '若手職員（2-3年目）',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_2_5]: {
    level: PermissionLevel.LEVEL_2_5,
    name: 'junior_staff_leader',
    displayName: '若手（リーダー可）',
    description: '若手看護師（リーダー業務可能）',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts', 'leader_duty'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'leader_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_3]: {
    level: PermissionLevel.LEVEL_3,
    name: 'midlevel_staff',
    displayName: '中堅（4-10年目）',
    description: '中堅職員（4-10年目）',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_3_5]: {
    level: PermissionLevel.LEVEL_3_5,
    name: 'midlevel_staff_leader',
    displayName: '中堅（リーダー可）',
    description: '中堅看護師（リーダー業務可能）',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts', 'leader_duty'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'leader_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_4]: {
    level: PermissionLevel.LEVEL_4,
    name: 'veteran_staff',
    displayName: 'ベテラン（11年以上）',
    description: 'ベテラン職員（11年以上）',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_4_5]: {
    level: PermissionLevel.LEVEL_4_5,
    name: 'veteran_staff_leader',
    displayName: 'ベテラン（リーダー可）',
    description: 'ベテラン看護師（リーダー業務可能）',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts', 'leader_duty'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'leader_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  // 役職層 5-11
  [PermissionLevel.LEVEL_5]: {
    level: PermissionLevel.LEVEL_5,
    name: 'deputy_chief',
    displayName: '副主任',
    description: '副主任看護師、各部門副主任',
    accessibleFeatures: ['create_post', 'vote', 'view_team_posts', 'moderate_team'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'leader_station', 'team_management', 'authority_basic'],
    analyticsAccess: false,
    workflowStages: ['proposal', 'initial_review']
  },

  [PermissionLevel.LEVEL_6]: {
    level: PermissionLevel.LEVEL_6,
    name: 'chief',
    displayName: '主任',
    description: '主任看護師、各部門主任',
    accessibleFeatures: ['create_post', 'vote', 'view_team_posts', 'moderate_team'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'leader_station', 'team_management', 'authority_basic'],
    analyticsAccess: false,
    workflowStages: ['proposal', 'initial_review']
  },

  [PermissionLevel.LEVEL_7]: {
    level: PermissionLevel.LEVEL_7,
    name: 'deputy_manager',
    displayName: '副師長・副科長',
    description: '副師長、副科長、副課長',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'approve_team_projects', 'moderate_department'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'leader_station', 'department_station', 'team_management', 'authority_basic', 'dept_user_analysis', 'dept_generation_analysis'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval']
  },

  [PermissionLevel.LEVEL_8]: {
    level: PermissionLevel.LEVEL_8,
    name: 'manager',
    displayName: '師長・科長・課長',
    description: '師長、科長、課長、室長',
    accessibleFeatures: ['create_post', 'vote', 'view_all_department_posts', 'approve_department_projects'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'leader_station', 'department_station', 'section_station', 'team_management', 'authority_basic', 'section_management', 'dept_user_analysis', 'dept_generation_analysis'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval']
  },

  [PermissionLevel.LEVEL_9]: {
    level: PermissionLevel.LEVEL_9,
    name: 'deputy_director',
    displayName: '副部長',
    description: '副部長',
    accessibleFeatures: ['create_post', 'vote', 'view_all_department_posts', 'approve_department_projects'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'leader_station', 'department_station', 'section_station', 'team_management', 'authority_basic', 'section_management', 'dept_user_analysis', 'dept_generation_analysis'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval']
  },

  [PermissionLevel.LEVEL_10]: {
    level: PermissionLevel.LEVEL_10,
    name: 'director',
    displayName: '部長・医局長',
    description: '看護部長、医局長、各部門部長',
    accessibleFeatures: ['create_post', 'vote', 'view_all_department_posts', 'approve_department_projects'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'leader_station', 'department_station', 'section_station', 'team_management', 'authority_basic', 'section_management', 'dept_user_analysis', 'dept_generation_analysis'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval']
  },

  [PermissionLevel.LEVEL_11]: {
    level: PermissionLevel.LEVEL_11,
    name: 'administrative_director',
    displayName: '事務長',
    description: '各施設の事務長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts',
      'facility_management', 'administrative_approval'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'personal_station', 'leader_station', 'department_station', 'section_station',
      'team_management', 'authority_basic', 'section_management',
      'own_facility_management', 'own_facility_strategy',
      'dept_user_analysis', 'dept_generation_analysis', 'facility_hierarchy_analysis', 'facility_profession_analysis'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval']
  },

  // 施設経営層 12-13
  [PermissionLevel.LEVEL_12]: {
    level: PermissionLevel.LEVEL_12,
    name: 'vice_president',
    displayName: '副院長',
    description: '各施設の副院長・副施設長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_organization_projects',
      'organization_management', 'cross_facility_coordination'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION],
    menuItems: [
      'personal_station', 'interview_management', 'policy_management', 'talent_analytics', 'hr_dashboard',
      'strategic_hr_planning', 'org_development', 'performance_analytics', 'retirement_management',
      'all_facility_management', 'all_facility_strategy',
      'all_user_analysis', 'all_generation_analysis', 'all_hierarchy_analysis', 'all_profession_analysis', 'executive_report',
      'executive_overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'organization_approval']
  },

  [PermissionLevel.LEVEL_13]: {
    level: PermissionLevel.LEVEL_13,
    name: 'president',
    displayName: '院長・施設長',
    description: '小原病院院長、立神リハビリテーション温泉病院施設長等',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_facility_projects',
      'facility_governance', 'strategic_decision', 'final_facility_approval'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'personal_station', 'leader_station', 'department_station', 'section_station',
      'team_management', 'authority_basic', 'section_management',
      'own_facility_management', 'own_facility_strategy',
      'dept_user_analysis', 'dept_generation_analysis', 'facility_hierarchy_analysis', 'facility_profession_analysis'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'executive_review']
  },

  // 法人人事部 14-17
  [PermissionLevel.LEVEL_14]: {
    level: PermissionLevel.LEVEL_14,
    name: 'hr_staff',
    displayName: '人事部門員',
    description: '人財統括本部事務員、面談予約1次窓口',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts',
      'interview_booking_management', 'schedule_management'
    ],
    projectScopes: [ProjectScope.TEAM],
    menuItems: [
      'personal_station', 'interview_management', 'policy_management', 'talent_analytics'
    ],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_15]: {
    level: PermissionLevel.LEVEL_15,
    name: 'hr_manager',
    displayName: '人事各部門長',
    description: 'キャリア支援部門長、人材開発部門長、業務革新部門長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_hr_projects',
      'hr_policy_management', 'conduct_interviews', 'interview_oversight'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'personal_station', 'interview_management', 'policy_management', 'talent_analytics', 'hr_dashboard',
      'strategic_hr_planning', 'org_development', 'performance_analytics',
      'all_facility_management', 'all_facility_strategy',
      'all_user_analysis', 'all_generation_analysis', 'all_hierarchy_analysis', 'all_profession_analysis'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'hr_review']
  },

  [PermissionLevel.LEVEL_16]: {
    level: PermissionLevel.LEVEL_16,
    name: 'strategic_planning_staff',
    displayName: '戦略企画・統括管理部門員',
    description: '戦略企画・統括管理部門の一般職員',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts',
      'strategic_planning_support', 'data_analysis'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'personal_station', 'policy_management', 'talent_analytics',
      'all_facility_management', 'all_facility_strategy'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review']
  },

  [PermissionLevel.LEVEL_17]: {
    level: PermissionLevel.LEVEL_17,
    name: 'strategic_planning_manager',
    displayName: '戦略企画・統括管理部門長',
    description: '人財統括本部統括管理部門長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_facility_projects',
      'strategic_hr_planning', 'organization_design', 'performance_management'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION],
    menuItems: [
      'personal_station', 'interview_management', 'policy_management', 'talent_analytics', 'hr_dashboard',
      'strategic_hr_planning', 'org_development', 'performance_analytics', 'retirement_management',
      'all_facility_management', 'all_facility_strategy',
      'all_user_analysis', 'all_generation_analysis', 'all_hierarchy_analysis', 'all_profession_analysis', 'executive_report',
      'executive_overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'hr_review', 'strategic_review']
  },

  // 最高経営層 18
  [PermissionLevel.LEVEL_18]: {
    level: PermissionLevel.LEVEL_18,
    name: 'board_member',
    displayName: '理事長・法人事務局長',
    description: '医療法人厚生会理事長、厚生会本部統括事務局長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_all_projects',
      'strategic_decision', 'organization_governance', 'executive_override'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION, ProjectScope.STRATEGIC],
    menuItems: [
      'personal_station', 'interview_management', 'policy_management', 'talent_analytics', 'hr_dashboard',
      'strategic_hr_planning', 'org_development', 'performance_analytics', 'retirement_management',
      'all_facility_management', 'all_facility_strategy',
      'all_user_analysis', 'all_generation_analysis', 'all_hierarchy_analysis', 'all_profession_analysis', 'executive_report',
      'executive_overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'executive_approval', 'board_review']
  },

  // 特別権限レベル 97-99
  [PermissionLevel.LEVEL_97]: {
    level: PermissionLevel.LEVEL_97,
    name: 'health_checkup_staff',
    displayName: '健診担当者',
    description: 'ストレスチェック実施者、健康管理専用アクセス',
    accessibleFeatures: [
      'create_post', 'vote', 'health_checkup_management', 'stress_check_administration'
    ],
    projectScopes: [ProjectScope.TEAM],
    menuItems: [
      'personal_station', 'health_management'
    ],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_98]: {
    level: PermissionLevel.LEVEL_98,
    name: 'occupational_physician',
    displayName: '産業医',
    description: '産業医、健康管理専用アクセス',
    accessibleFeatures: [
      'create_post', 'vote', 'occupational_health_management', 'medical_consultation'
    ],
    projectScopes: [ProjectScope.TEAM],
    menuItems: [
      'personal_station', 'health_management', 'medical_consultation'
    ],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_99]: {
    level: PermissionLevel.LEVEL_99,
    name: 'system_admin',
    displayName: 'システム管理者',
    description: 'システム管理者・開発者、全アクセス権限',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_all_projects',
      'system_configuration', 'user_management', 'emergency_authority', 'full_access'
    ],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION, ProjectScope.STRATEGIC],
    menuItems: [
      'personal_station', 'interview_management', 'policy_management', 'talent_analytics', 'hr_dashboard',
      'strategic_hr_planning', 'org_development', 'performance_analytics', 'retirement_management',
      'all_facility_management', 'all_facility_strategy',
      'all_user_analysis', 'all_generation_analysis', 'all_hierarchy_analysis', 'all_profession_analysis', 'executive_report',
      'executive_overview', 'strategic_initiatives', 'organization_analytics', 'board_reports', 'governance',
      'system_admin', 'developer_tools'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'executive_approval', 'board_review', 'system_override']
  }
};

// 機能別必要権限レベル
export const FEATURE_PERMISSIONS: Record<string, FeaturePermission> = {
  // プロジェクト関連
  APPROVE_TEAM_PROJECT: {
    featureId: 'APPROVE_TEAM_PROJECT',
    requiredLevel: PermissionLevel.LEVEL_2,
    description: 'チームプロジェクトの承認',
    category: 'PROJECT'
  },
  APPROVE_DEPARTMENT_PROJECT: {
    featureId: 'APPROVE_DEPARTMENT_PROJECT',
    requiredLevel: PermissionLevel.LEVEL_3,
    description: '部門プロジェクトの承認',
    category: 'PROJECT'
  },
  APPROVE_FACILITY_PROJECT: {
    featureId: 'APPROVE_FACILITY_PROJECT',
    requiredLevel: PermissionLevel.LEVEL_5,
    description: '施設プロジェクトの承認',
    category: 'PROJECT'
  },
  
  // ワークフロー関連
  VIEW_WORKFLOW: {
    featureId: 'VIEW_WORKFLOW',
    requiredLevel: PermissionLevel.LEVEL_2,
    description: 'ワークフロー状況の閲覧',
    category: 'WORKFLOW'
  },
  MANAGE_WORKFLOW: {
    featureId: 'MANAGE_WORKFLOW',
    requiredLevel: PermissionLevel.LEVEL_3,
    description: 'ワークフロー管理',
    category: 'WORKFLOW'
  },
  OVERRIDE_WORKFLOW: {
    featureId: 'OVERRIDE_WORKFLOW',
    requiredLevel: PermissionLevel.LEVEL_6,
    description: 'ワークフロー強制承認',
    category: 'WORKFLOW'
  },
  
  // 分析関連
  VIEW_TEAM_ANALYTICS: {
    featureId: 'VIEW_TEAM_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_2,
    description: 'チーム分析の閲覧',
    category: 'ANALYTICS'
  },
  VIEW_DEPARTMENT_ANALYTICS: {
    featureId: 'VIEW_DEPARTMENT_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_3,
    description: '部門分析の閲覧',
    category: 'ANALYTICS'
  },
  VIEW_EXECUTIVE_ANALYTICS: {
    featureId: 'VIEW_EXECUTIVE_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_5,
    description: 'エグゼクティブ分析の閲覧',
    category: 'ANALYTICS'
  },
  
  // HR特有の機能
  MANAGE_HR_POLICIES: {
    featureId: 'MANAGE_HR_POLICIES',
    requiredLevel: PermissionLevel.LEVEL_10,
    description: '人事ポリシーの管理',
    category: 'ADMIN'
  },
  VIEW_TALENT_ANALYTICS: {
    featureId: 'VIEW_TALENT_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_9,
    description: 'タレント分析の閲覧',
    category: 'ANALYTICS'
  },
  STRATEGIC_HR_PLANNING: {
    featureId: 'STRATEGIC_HR_PLANNING',
    requiredLevel: PermissionLevel.LEVEL_11,
    description: '戦略的人事計画の策定',
    category: 'ADMIN'
  },
  
  // システム管理
  SYSTEM_CONFIGURATION: {
    featureId: 'SYSTEM_CONFIGURATION',
    requiredLevel: PermissionLevel.LEVEL_11,
    description: 'システム設定の変更',
    category: 'SYSTEM'
  },
  USER_MANAGEMENT: {
    featureId: 'USER_MANAGEMENT',
    requiredLevel: PermissionLevel.LEVEL_10,
    description: 'ユーザー管理',
    category: 'SYSTEM'
  },
  
  // 面談予約機能
  INTERVIEW_BOOKING_MANAGEMENT: {
    featureId: 'INTERVIEW_BOOKING_MANAGEMENT',
    requiredLevel: PermissionLevel.LEVEL_8,
    description: '面談予約システム管理',
    category: 'ADMIN'
  },
  CONDUCT_INTERVIEWS: {
    featureId: 'CONDUCT_INTERVIEWS',
    requiredLevel: PermissionLevel.LEVEL_9,
    description: '面談実施権限',
    category: 'ADMIN'
  }
};

// 権限レベル間の関係性
export const canAccessLevel = (userLevel: PermissionLevel, requiredLevel: PermissionLevel): boolean => {
  return userLevel >= requiredLevel;
};

// 権限レベルによるプロジェクトスコープアクセス判定
export const canAccessProjectScope = (userLevel: PermissionLevel, scope: ProjectScope): boolean => {
  const metadata = PERMISSION_METADATA[userLevel];
  return metadata.projectScopes.includes(scope);
};