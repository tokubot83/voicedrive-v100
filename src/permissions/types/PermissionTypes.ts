// 13段階権限レベルシステム - 医療法人厚生会組織階層対応
export enum PermissionLevel {
  // 施設レベル（小原病院・立神リハビリテーション温泉病院等）
  // レベル1: 一般職員（看護師、看護補助者、事務職員、技術職員等）
  LEVEL_1 = 1,
  
  // レベル2: 主任（主任看護師、各部門主任）
  LEVEL_2 = 2,
  
  // レベル3: 師長（病棟師長、外来師長、各部門師長）
  LEVEL_3 = 3,
  
  // レベル4: 部長・課長（看護部長、医事課長、薬剤部長、各課長）
  LEVEL_4 = 4,
  
  // レベル5: 事務長（各施設の事務長）
  LEVEL_5 = 5,
  
  // レベル6: 副院長（各施設の副院長・副施設長）
  LEVEL_6 = 6,
  
  // レベル7: 院長・施設長（小原病院院長、立神リハビリテーション温泉病院施設長等）
  LEVEL_7 = 7,
  
  // 医療法人厚生会本部レベル
  // レベル8: 人財統括本部事務員（面談予約1次窓口・面談システム管理権限）
  LEVEL_8 = 8,
  
  // レベル9: 人財統括本部 キャリア支援部門員（面談実施者）
  LEVEL_9 = 9,
  
  // レベル10: 人財統括本部 各部門長（キャリア支援・人材開発・業務革新）
  LEVEL_10 = 10,
  
  // レベル11: 人財統括本部 統括管理部門長
  LEVEL_11 = 11,
  
  // レベル12: 厚生会本部統括事務局長
  LEVEL_12 = 12,
  
  // レベル13: 理事長
  LEVEL_13 = 13
}

// 権限レベルのメタデータ
export interface PermissionMetadata {
  level: PermissionLevel;
  name: string;
  displayName: string;
  description: string;
  accessibleFeatures: string[];
  approvalLimit?: number; // 承認可能な予算上限
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
  [PermissionLevel.LEVEL_1]: {
    level: PermissionLevel.LEVEL_1,
    name: 'staff',
    displayName: '一般職員',
    description: '看護師、看護補助者、事務職員、技術職員等',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['home', 'voice', 'my_posts'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },
  
  [PermissionLevel.LEVEL_2]: {
    level: PermissionLevel.LEVEL_2,
    name: 'chief',
    displayName: '主任',
    description: '主任看護師、各部門主任',
    accessibleFeatures: ['create_post', 'vote', 'view_team_posts', 'moderate_team'],
    approvalLimit: 100000,
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['home', 'voice', 'my_posts', 'team_management'],
    analyticsAccess: false,
    workflowStages: ['proposal', 'initial_review']
  },
  
  [PermissionLevel.LEVEL_3]: {
    level: PermissionLevel.LEVEL_3,
    name: 'head_nurse',
    displayName: '師長',
    description: '病棟師長、外来師長、各部門師長',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'approve_team_projects', 'moderate_department'],
    approvalLimit: 500000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['home', 'voice', 'my_posts', 'team_management', 'department_dashboard', 'authority_management'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval']
  },
  
  [PermissionLevel.LEVEL_4]: {
    level: PermissionLevel.LEVEL_4,
    name: 'department_head',
    displayName: '部長・課長',
    description: '看護部長、医事課長、薬剤部長、各課長',
    accessibleFeatures: ['create_post', 'vote', 'view_all_department_posts', 'approve_department_projects', 'budget_management'],
    approvalLimit: 2000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['home', 'voice', 'my_posts', 'team_management', 'department_dashboard', 'budget_control', 'authority_management'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'budget_review']
  },
  
  [PermissionLevel.LEVEL_5]: {
    level: PermissionLevel.LEVEL_5,
    name: 'administrative_director',
    displayName: '事務長',
    description: '各施設の事務長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 
      'facility_management', 'budget_control', 'administrative_approval'
    ],
    approvalLimit: 5000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'home', 'voice', 'my_posts', 'facility_management', 'budget_control', 
      'administrative_dashboard', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval']
  },
  
  [PermissionLevel.LEVEL_6]: {
    level: PermissionLevel.LEVEL_6,
    name: 'vice_director',
    displayName: '副院長',
    description: '各施設の副院長・副施設長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 
      'facility_policy_management', 'medical_direction', 'cross_department_coordination'
    ],
    approvalLimit: 7000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'home', 'voice', 'my_posts', 'facility_management', 'medical_policy', 
      'strategic_planning', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'medical_review']
  },
  
  [PermissionLevel.LEVEL_7]: {
    level: PermissionLevel.LEVEL_7,
    name: 'hospital_director',
    displayName: '院長・施設長',
    description: '小原病院院長、立神リハビリテーション温泉病院施設長等',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_facility_projects', 
      'facility_governance', 'strategic_decision', 'final_facility_approval'
    ],
    approvalLimit: 10000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'home', 'voice', 'my_posts', 'facility_management', 'strategic_dashboard', 
      'governance', 'executive_reports', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'executive_review']
  },
  
  [PermissionLevel.LEVEL_8]: {
    level: PermissionLevel.LEVEL_8,
    name: 'hr_admin_staff',
    displayName: '人財統括本部事務員',
    description: '面談予約1次窓口・面談システム管理権限',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts',
      'interview_booking_management', 'schedule_management', 'timeslot_control'
    ],
    approvalLimit: 0,
    projectScopes: [ProjectScope.TEAM],
    menuItems: [
      'home', 'voice', 'my_posts', 'interview_management', 'booking_calendar',
      'schedule_reports', 'booking_statistics'
    ],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },

  [PermissionLevel.LEVEL_9]: {
    level: PermissionLevel.LEVEL_9,
    name: 'hr_career_support_staff',
    displayName: '人財統括本部 キャリア支援部門員',
    description: 'キャリア支援部門員、面談実施者',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts',
      'conduct_interviews', 'interview_record_management', 'career_consultation'
    ],
    approvalLimit: 1000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: [
      'home', 'voice', 'my_posts', 'interview_schedule', 'interview_records',
      'career_tracking', 'consultation_reports'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'career_review']
  },

  [PermissionLevel.LEVEL_10]: {
    level: PermissionLevel.LEVEL_10,
    name: 'hr_department_head',
    displayName: '人財統括本部 各部門長',
    description: 'キャリア支援部門長、人材開発部門長、業務革新部門長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_hr_projects',
      'hr_policy_management', 'cross_department_coordination', 'interview_oversight'
    ],
    approvalLimit: 5000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'home', 'voice', 'my_posts', 'team_management', 'department_dashboard',
      'hr_dashboard', 'policy_management', 'talent_analytics', 'interview_oversight', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'hr_review', 'facility_coordination']
  },

  [PermissionLevel.LEVEL_11]: {
    level: PermissionLevel.LEVEL_11,
    name: 'hr_general_manager',
    displayName: '人財統括本部 統括管理部門長',
    description: '人財統括本部統括管理部門長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_facility_projects',
      'strategic_hr_planning', 'organization_design', 'performance_management'
    ],
    approvalLimit: 10000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'home', 'voice', 'my_posts', 'team_management', 'department_dashboard',
      'hr_dashboard', 'strategic_planning', 'org_development', 'performance_analytics', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'hr_review', 'strategic_review']
  },

  [PermissionLevel.LEVEL_12]: {
    level: PermissionLevel.LEVEL_12,
    name: 'general_administrative_director',
    displayName: '厚生会本部統括事務局長',
    description: '医療法人厚生会本部統括事務局長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_organization_projects',
      'organization_management', 'budget_allocation', 'cross_facility_coordination'
    ],
    approvalLimit: 20000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION],
    menuItems: [
      'home', 'voice', 'my_posts', 'organization_management', 'strategic_dashboard',
      'budget_planning', 'analytics', 'executive_reports', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'organization_approval']
  },

  [PermissionLevel.LEVEL_13]: {
    level: PermissionLevel.LEVEL_13,
    name: 'chairman',
    displayName: '理事長',
    description: '医療法人厚生会理事長',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_all_projects',
      'strategic_decision', 'organization_governance', 'executive_override'
    ],
    approvalLimit: undefined, // 無制限
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION, ProjectScope.STRATEGIC],
    menuItems: [
      'home', 'voice', 'executive_dashboard', 'strategic_initiatives',
      'organization_analytics', 'board_reports', 'governance', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'executive_approval', 'board_review']
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