// 8段階権限レベルシステム - 人財統括本部組織階層対応
export enum PermissionLevel {
  // レベル1: 一般従業員
  LEVEL_1 = 1,
  
  // レベル2: チーフ・主任級
  LEVEL_2 = 2,
  
  // レベル3: 係長・マネージャー級
  LEVEL_3 = 3,
  
  // レベル4: 課長級
  LEVEL_4 = 4,
  
  // レベル5: 人財統括本部部門長
  LEVEL_5 = 5,
  
  // レベル6: 人財統括本部統括管理部門長
  LEVEL_6 = 6,
  
  // レベル7: 部長・本部長級
  LEVEL_7 = 7,
  
  // レベル8: 役員・経営層
  LEVEL_8 = 8
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
    name: 'employee',
    displayName: '一般従業員',
    description: '基本的な投稿・投票権限',
    accessibleFeatures: ['create_post', 'vote', 'view_own_posts'],
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['home', 'voice', 'my_posts'],
    analyticsAccess: false,
    workflowStages: ['proposal']
  },
  
  [PermissionLevel.LEVEL_2]: {
    level: PermissionLevel.LEVEL_2,
    name: 'chief',
    displayName: 'チーフ・主任',
    description: 'チーム内のプロジェクト管理権限',
    accessibleFeatures: ['create_post', 'vote', 'view_team_posts', 'moderate_team'],
    approvalLimit: 100000,
    projectScopes: [ProjectScope.TEAM],
    menuItems: ['home', 'voice', 'my_posts', 'team_management'],
    analyticsAccess: false,
    workflowStages: ['proposal', 'initial_review']
  },
  
  [PermissionLevel.LEVEL_3]: {
    level: PermissionLevel.LEVEL_3,
    name: 'manager',
    displayName: '係長・マネージャー',
    description: '部門内プロジェクトの承認権限',
    accessibleFeatures: ['create_post', 'vote', 'view_department_posts', 'approve_team_projects', 'moderate_department'],
    approvalLimit: 500000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['home', 'voice', 'my_posts', 'team_management', 'department_dashboard', 'authority_management'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval']
  },
  
  [PermissionLevel.LEVEL_4]: {
    level: PermissionLevel.LEVEL_4,
    name: 'section_chief',
    displayName: '課長',
    description: '部門レベルのプロジェクト最終承認権限',
    accessibleFeatures: ['create_post', 'vote', 'view_all_department_posts', 'approve_department_projects', 'budget_management'],
    approvalLimit: 2000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT],
    menuItems: ['home', 'voice', 'my_posts', 'team_management', 'department_dashboard', 'budget_control', 'authority_management'],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'budget_review']
  },
  
  [PermissionLevel.LEVEL_5]: {
    level: PermissionLevel.LEVEL_5,
    name: 'hr_department_head',
    displayName: '人財統括本部部門長',
    description: '人事関連プロジェクトの統括管理権限',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_hr_projects', 
      'hr_policy_management', 'cross_department_coordination'
    ],
    approvalLimit: 5000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY],
    menuItems: [
      'home', 'voice', 'my_posts', 'team_management', 'department_dashboard', 
      'hr_dashboard', 'policy_management', 'talent_analytics', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'hr_review', 'facility_coordination']
  },
  
  [PermissionLevel.LEVEL_6]: {
    level: PermissionLevel.LEVEL_6,
    name: 'hr_general_manager',
    displayName: '人財統括本部統括管理部門長',
    description: '全社人事戦略の企画・実行権限',
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
  
  [PermissionLevel.LEVEL_7]: {
    level: PermissionLevel.LEVEL_7,
    name: 'director',
    displayName: '部長・本部長',
    description: '施設全体のプロジェクト承認・戦略決定権限',
    accessibleFeatures: [
      'create_post', 'vote', 'view_all_posts', 'approve_facility_projects',
      'strategic_planning', 'budget_allocation', 'cross_facility_coordination'
    ],
    approvalLimit: 20000000,
    projectScopes: [ProjectScope.TEAM, ProjectScope.DEPARTMENT, ProjectScope.FACILITY, ProjectScope.ORGANIZATION],
    menuItems: [
      'home', 'voice', 'my_posts', 'facility_management', 'strategic_dashboard',
      'budget_planning', 'analytics', 'executive_reports', 'authority_management'
    ],
    analyticsAccess: true,
    workflowStages: ['proposal', 'initial_review', 'department_approval', 'facility_approval', 'strategic_review']
  },
  
  [PermissionLevel.LEVEL_8]: {
    level: PermissionLevel.LEVEL_8,
    name: 'executive',
    displayName: '役員・経営層',
    description: '全社レベルの最終意思決定権限',
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
  CREATE_PROJECT: {
    featureId: 'CREATE_PROJECT',
    requiredLevel: PermissionLevel.LEVEL_1,
    description: 'プロジェクト提案の作成',
    category: 'PROJECT'
  },
  APPROVE_TEAM_PROJECT: {
    featureId: 'APPROVE_TEAM_PROJECT',
    requiredLevel: PermissionLevel.LEVEL_3,
    description: 'チームプロジェクトの承認',
    category: 'PROJECT'
  },
  APPROVE_DEPARTMENT_PROJECT: {
    featureId: 'APPROVE_DEPARTMENT_PROJECT',
    requiredLevel: PermissionLevel.LEVEL_4,
    description: '部門プロジェクトの承認',
    category: 'PROJECT'
  },
  APPROVE_FACILITY_PROJECT: {
    featureId: 'APPROVE_FACILITY_PROJECT',
    requiredLevel: PermissionLevel.LEVEL_7,
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
    requiredLevel: PermissionLevel.LEVEL_7,
    description: 'ワークフロー強制承認',
    category: 'WORKFLOW'
  },
  
  // 分析関連
  VIEW_TEAM_ANALYTICS: {
    featureId: 'VIEW_TEAM_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_3,
    description: 'チーム分析の閲覧',
    category: 'ANALYTICS'
  },
  VIEW_DEPARTMENT_ANALYTICS: {
    featureId: 'VIEW_DEPARTMENT_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_4,
    description: '部門分析の閲覧',
    category: 'ANALYTICS'
  },
  VIEW_EXECUTIVE_ANALYTICS: {
    featureId: 'VIEW_EXECUTIVE_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_7,
    description: 'エグゼクティブ分析の閲覧',
    category: 'ANALYTICS'
  },
  
  // HR特有の機能
  MANAGE_HR_POLICIES: {
    featureId: 'MANAGE_HR_POLICIES',
    requiredLevel: PermissionLevel.LEVEL_5,
    description: '人事ポリシーの管理',
    category: 'ADMIN'
  },
  VIEW_TALENT_ANALYTICS: {
    featureId: 'VIEW_TALENT_ANALYTICS',
    requiredLevel: PermissionLevel.LEVEL_5,
    description: 'タレント分析の閲覧',
    category: 'ANALYTICS'
  },
  STRATEGIC_HR_PLANNING: {
    featureId: 'STRATEGIC_HR_PLANNING',
    requiredLevel: PermissionLevel.LEVEL_6,
    description: '戦略的人事計画の策定',
    category: 'ADMIN'
  },
  
  // システム管理
  SYSTEM_CONFIGURATION: {
    featureId: 'SYSTEM_CONFIGURATION',
    requiredLevel: PermissionLevel.LEVEL_7,
    description: 'システム設定の変更',
    category: 'SYSTEM'
  },
  USER_MANAGEMENT: {
    featureId: 'USER_MANAGEMENT',
    requiredLevel: PermissionLevel.LEVEL_6,
    description: 'ユーザー管理',
    category: 'SYSTEM'
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