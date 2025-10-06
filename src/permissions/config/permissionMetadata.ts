import { PermissionLevel, SpecialPermissionLevel, ProjectScope } from '../types/PermissionTypes';

// 18段階権限レベルのメタデータ定義
export interface PermissionMetadata {
  level: PermissionLevel | SpecialPermissionLevel;
  name: string;
  displayName: string;
  description: string;
  accessibleFeatures: string[];
  projectScopes: ProjectScope[];
  menuItems: string[];
  analyticsAccess: boolean;
  workflowStages: string[];
}

export const PERMISSION_METADATA_V2: Record<string, PermissionMetadata> = {
  // ========== 一般職員層（経験年数別） ==========
  [PermissionLevel.LEVEL_1]: {
    level: PermissionLevel.LEVEL_1,
    name: 'newcomer',
    displayName: '新人（1年目）',
    description: '入職1年目の全職種',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_1_5]: {
    level: PermissionLevel.LEVEL_1_5,
    name: 'newcomer_nurse_leader',
    displayName: '新人看護師（リーダー可）',
    description: '1年目でリーダー業務可能な看護師（稀）',
    accessibleFeatures: ['create_post', 'vote', 'view_team_posts', 'basic_leader_tasks'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_2]: {
    level: PermissionLevel.LEVEL_2,
    name: 'junior',
    displayName: '若手（2-3年目）',
    description: '経験2-3年の職員',
    accessibleFeatures: ['create_post', 'vote', 'view_team_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'department_board'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_2_5]: {
    level: PermissionLevel.LEVEL_2_5,
    name: 'junior_nurse_leader',
    displayName: '若手看護師（リーダー可）',
    description: 'リーダー業務可能な2-3年目看護師',
    accessibleFeatures: ['create_post', 'vote', 'view_team_posts', 'leader_tasks', 'shift_leader'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'department_board'],
    analyticsAccess: false,
    workflowStages: ['proposal', 'team_coordination']
  },

  [PermissionLevel.LEVEL_3]: {
    level: PermissionLevel.LEVEL_3,
    name: 'intermediate',
    displayName: '中堅（4-10年目）',
    description: '経験4-10年の職員',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'mentor_newcomers'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'department_board'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_3_5]: {
    level: PermissionLevel.LEVEL_3_5,
    name: 'intermediate_nurse_leader',
    displayName: '中堅看護師（リーダー可）',
    description: 'リーダー業務可能な中堅看護師、プリセプター',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'leader_tasks', 'preceptor', 'education_support'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'department_board', 'team_dashboard'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'team_coordination']
  },

  [PermissionLevel.LEVEL_4]: {
    level: PermissionLevel.LEVEL_4,
    name: 'veteran',
    displayName: 'ベテラン（11年以上）',
    description: '経験11年以上の職員',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'expert_advice'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'department_board'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_4_5]: {
    level: PermissionLevel.LEVEL_4_5,
    name: 'veteran_nurse_leader',
    displayName: 'ベテラン看護師（リーダー可）',
    description: 'ベテランリーダー看護師、副主任候補',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'leader_tasks', 'mentor_leaders', 'deputy_chief_candidate'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'department_board', 'team_dashboard'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'team_coordination', 'initial_review']
  },

  // ========== 役職層 ==========
  [PermissionLevel.LEVEL_5]: {
    level: PermissionLevel.LEVEL_5,
    name: 'deputy_chief',
    displayName: '副主任',
    description: '主任補佐、チームサブリーダー',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'approve_team_items', 'team_coordination'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'team_dashboard', 'proposal_review'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review']
  },

  [PermissionLevel.LEVEL_6]: {
    level: PermissionLevel.LEVEL_6,
    name: 'chief',
    displayName: '主任',
    description: '各部署主任',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'approve_team_projects', 'moderate_team'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'team_dashboard', 'proposal_review', 'quick_implementation'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'team_approval']
  },

  [PermissionLevel.LEVEL_7]: {
    level: PermissionLevel.LEVEL_7,
    name: 'deputy_head',
    displayName: '副師長・副科長・副課長',
    description: '中間管理職補佐',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'committee_preparation', 'department_coordination'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'department_station', 'committee_tools', 'agenda_generator'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_coordination']
  },

  [PermissionLevel.LEVEL_8]: {
    level: PermissionLevel.LEVEL_8,
    name: 'head',
    displayName: '師長・科長・課長・室長',
    description: '中間管理職',
    accessibleFeatures: ['create_post', 'vote', 'view_all_department_posts', 'approve_department_projects', 'committee_submission'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'department_station', 'committee_tools', 'committee_bridge'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'committee_submission']
  },

  [PermissionLevel.LEVEL_9]: {
    level: PermissionLevel.LEVEL_9,
    name: 'deputy_director',
    displayName: '副部長',
    description: '部長補佐',
    accessibleFeatures: ['create_post', 'vote', 'view_facility_posts', 'cross_department_coordination', 'strategic_planning_support'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: ['personal_station', 'department_station', 'project_governance', 'cross_department'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_coordination']
  },

  [PermissionLevel.LEVEL_10]: {
    level: PermissionLevel.LEVEL_10,
    name: 'director',
    displayName: '部長・医局長',
    description: '部門責任者',
    accessibleFeatures: ['create_post', 'vote', 'view_facility_posts', 'approve_facility_projects', 'operations_committee_member'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: ['personal_station', 'department_station', 'operations_committee', 'facility_governance'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'operations_committee']
  },

  [PermissionLevel.LEVEL_11]: {
    level: PermissionLevel.LEVEL_11,
    name: 'administrative_director',
    displayName: '事務長',
    description: '施設事務統括',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'facility_management', 'administrative_approval'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: ['personal_station', 'facility_management', 'strategic_initiatives'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'facility_approval']
  },

  // ========== 施設経営層 ==========
  [PermissionLevel.LEVEL_12]: {
    level: PermissionLevel.LEVEL_12,
    name: 'vice_director',
    displayName: '副院長',
    description: '院長補佐、医療統括',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'medical_direction', 'strategic_planning', 'decision_support'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: ['personal_station', 'strategic_decision', 'executive_dashboard', 'medical_governance'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'facility_approval', 'strategic_review']
  },

  [PermissionLevel.LEVEL_13]: {
    level: PermissionLevel.LEVEL_13,
    name: 'hospital_director',
    displayName: '院長・施設長',
    description: '施設最高責任者',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'facility_governance', 'strategic_decision', 'final_facility_approval'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: ['personal_station', 'strategic_decision', 'executive_dashboard', 'decision_meeting'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'facility_approval', 'executive_review', 'final_approval']
  },

  // ========== 法人人事部 ==========
  [PermissionLevel.LEVEL_14]: {
    level: PermissionLevel.LEVEL_14,
    name: 'hr_staff',
    displayName: '人事部門員',
    description: '採用、教育、相談、業務革新部門員',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'hr_operations', 'staff_consultation', 'voice_analysis'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['personal_station', 'voice_analytics', 'culture_development'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'hr_support']
  },

  [PermissionLevel.LEVEL_15]: {
    level: PermissionLevel.LEVEL_15,
    name: 'hr_department_head',
    displayName: '人事各部門長',
    description: '採用戦略、教育体制、コンサルカウンター、業務革新の各部門長',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'hr_management', 'department_strategy', 'organizational_insights'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: ['personal_station', 'voice_analytics', 'culture_development', 'organizational_insights'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'hr_review', 'strategic_hr_planning']
  },

  [PermissionLevel.LEVEL_16]: {
    level: PermissionLevel.LEVEL_16,
    name: 'hr_strategic_staff',
    displayName: '戦略企画・統括管理部門員',
    description: '廻総師長、徳留等の戦略企画メンバー',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'strategic_hr_planning', 'cross_facility_coordination', 'system_integration'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION],
    menuItems: ['personal_station', 'strategic_hr_planning', 'organizational_insights', 'executive_reporting'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'strategic_review', 'integration_planning']
  },

  [PermissionLevel.LEVEL_17]: {
    level: PermissionLevel.LEVEL_17,
    name: 'hr_general_manager',
    displayName: '戦略企画・統括管理部門長',
    description: '人事部統括責任者',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'hr_governance', 'organization_design', 'executive_proposal'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION],
    menuItems: ['personal_station', 'strategic_hr_planning', 'executive_reporting', 'board_preparation'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'strategic_review', 'executive_preparation']
  },

  // ========== 最高経営層 ==========
  [PermissionLevel.LEVEL_18]: {
    level: PermissionLevel.LEVEL_18,
    name: 'chairman',
    displayName: '理事長・法人事務局長',
    description: '最終決定権者',
    accessibleFeatures: ['create_post', 'vote', 'view_all_posts', 'final_decision', 'organization_governance', 'executive_override'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION, ProjectScope.STRATEGIC],
    menuItems: ['personal_station', 'board_functions', 'strategic_governance', 'final_approval'],
    analyticsAccess: true,
    workflowStages: ['all'] // 全ステージにアクセス可能
  },

  // ========== 特別権限レベル 97-99 ==========
  [PermissionLevel.LEVEL_97]: {
    level: PermissionLevel.LEVEL_97,
    name: 'health_checkup_staff',
    displayName: '健診担当者',
    description: 'ストレスチェック実施者、健康管理専用',
    accessibleFeatures: ['create_post', 'vote', 'health_checkup_management', 'stress_check'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['personal_station', 'health_management'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_98]: {
    level: PermissionLevel.LEVEL_98,
    name: 'occupational_physician',
    displayName: '産業医',
    description: '産業医、健康管理・医療相談',
    accessibleFeatures: ['create_post', 'vote', 'occupational_health', 'medical_consultation', 'health_reports'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.FACILITY],
    menuItems: ['personal_station', 'health_management', 'medical_consultation'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'health_review']
  },

  [PermissionLevel.LEVEL_99]: {
    level: PermissionLevel.LEVEL_99,
    name: 'system_admin',
    displayName: 'システム管理者',
    description: 'システム開発者・管理者（徳留）',
    accessibleFeatures: ['all'], // 全機能アクセス可能
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION, ProjectScope.STRATEGIC],
    menuItems: ['all'], // 全メニューアクセス可能
    analyticsAccess: true,
    workflowStages: ['all']
  },

  // @deprecated 旧システム管理者レベル - LEVEL_99を使用してください
  [SpecialPermissionLevel.LEVEL_X]: {
    level: SpecialPermissionLevel.LEVEL_X,
    name: 'system_admin',
    displayName: 'システム管理者（旧）',
    description: 'システム開発者・管理者（徳留）- LEVEL_99に移行してください',
    accessibleFeatures: ['all'],
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION, ProjectScope.STRATEGIC],
    menuItems: ['all'],
    analyticsAccess: true,
    workflowStages: ['all']
  }
};

// レベル判定ヘルパー関数
export const getPermissionMetadata = (level: PermissionLevel | SpecialPermissionLevel | number | string): PermissionMetadata | undefined => {
  // 数値の場合は文字列に変換
  const key = typeof level === 'number' ? level.toString() : level;
  return PERMISSION_METADATA_V2[key];
};

// 権限レベル間の比較
export const canAccessLevel = (userLevel: PermissionLevel | SpecialPermissionLevel, requiredLevel: PermissionLevel): boolean => {
  // システム管理者（LEVEL_99 または 旧LEVEL_X）は全アクセス可能
  if (userLevel === PermissionLevel.LEVEL_99 || userLevel === SpecialPermissionLevel.LEVEL_X) return true;

  // 特別権限レベル（97, 98）は通常レベルとは独立
  if (userLevel === PermissionLevel.LEVEL_97 || userLevel === PermissionLevel.LEVEL_98) {
    return false; // 健診担当者・産業医は専用機能のみ
  }

  // 数値比較
  if (typeof userLevel === 'number' && typeof requiredLevel === 'number') {
    return userLevel >= requiredLevel;
  }

  return false;
};

// 経験年数から基本レベルを計算
export const getExperienceBaseLevel = (years: number): PermissionLevel => {
  if (years <= 1) return PermissionLevel.LEVEL_1;
  if (years <= 3) return PermissionLevel.LEVEL_2;
  if (years <= 10) return PermissionLevel.LEVEL_3;
  return PermissionLevel.LEVEL_4;
};

// 看護職のリーダー加算
export const addNursingLeaderBonus = (baseLevel: PermissionLevel, canPerformLeaderDuty: boolean): PermissionLevel => {
  if (!canPerformLeaderDuty) return baseLevel;

  // 0.5加算のマッピング
  const leaderMapping: Record<number, number> = {
    1: 1.5,
    2: 2.5,
    3: 3.5,
    4: 4.5
  };

  return leaderMapping[baseLevel] as PermissionLevel || baseLevel;
};