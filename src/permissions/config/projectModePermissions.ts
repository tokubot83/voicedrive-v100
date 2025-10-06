/**
 * プロジェクト化モード権限定義
 *
 * 目的: チーム編成・組織一体感の向上
 * 特徴: 自動プロジェクトチーム編成、部署横断の協働促進、進捗管理
 */

import { PermissionLevel, SpecialPermissionLevel, ProjectScope } from '../types/PermissionTypes';

export interface ProjectModePermission {
  level: PermissionLevel | SpecialPermissionLevel;
  displayName: string;
  description: string;

  // プロジェクトモード固有の権限
  canCreateProject: boolean;              // プロジェクト作成
  canJoinProject: boolean;                // プロジェクト参加
  canManageOwnTasks: boolean;             // 自分のタスク管理
  canViewTeamProjects: boolean;           // チームプロジェクト閲覧
  canViewDepartmentProjects: boolean;     // 部署プロジェクト閲覧
  canViewFacilityProjects: boolean;       // 施設プロジェクト閲覧
  canViewCorporateProjects: boolean;      // 法人プロジェクト閲覧

  // チーム管理権限
  canFormProjectTeam: boolean;            // プロジェクトチーム編成
  canAssignTasks: boolean;                // タスク割り当て
  canManageMilestones: boolean;           // マイルストーン管理
  canApproveProjectProgress: boolean;     // 進捗承認

  // 分析・管理権限
  canAccessProjectAnalytics: boolean;     // プロジェクト分析
  canAccessProgressDashboard: boolean;    // 進捗ダッシュボード
  canEscalateProject: boolean;            // プロジェクト昇格

  // アクセス可能範囲
  projectVisibilityScope: 'team' | 'department' | 'facility' | 'corporation';

  // メニュー項目
  menuItems: string[];
}

/**
 * プロジェクトモード権限定義（全18レベル + X）
 */
export const PROJECT_MODE_PERMISSIONS: Record<string, ProjectModePermission> = {
  // ========== 一般職員層 ==========
  [PermissionLevel.LEVEL_1]: {
    level: PermissionLevel.LEVEL_1,
    displayName: '新人（1年目）',
    description: 'プロジェクトメンバーとして参加可能',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: false,
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: false,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'team',
    menuItems: ['personal_station', 'my_tasks', 'project_progress']
  },

  [PermissionLevel.LEVEL_1_5]: {
    level: PermissionLevel.LEVEL_1_5,
    displayName: '新人看護師（リーダー可）',
    description: 'プロジェクトメンバーとして参加可能',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: false,
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: false,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'team',
    menuItems: ['personal_station', 'my_tasks', 'project_progress']
  },

  [PermissionLevel.LEVEL_2]: {
    level: PermissionLevel.LEVEL_2,
    displayName: '若手（2-3年目）',
    description: 'チームプロジェクトに積極的に参加',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: false,
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: false,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'team',
    menuItems: ['personal_station', 'my_tasks', 'project_progress']
  },

  [PermissionLevel.LEVEL_2_5]: {
    level: PermissionLevel.LEVEL_2_5,
    displayName: '若手看護師（リーダー可）',
    description: 'チームプロジェクトに積極的に参加',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: false,
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: false,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'team',
    menuItems: ['personal_station', 'my_tasks', 'project_progress']
  },

  [PermissionLevel.LEVEL_3]: {
    level: PermissionLevel.LEVEL_3,
    displayName: '中堅（4-10年目）',
    description: 'プロジェクトメンバーとして主体的に活動',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,  // ✅ 部署プロジェクト閲覧可能
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: false,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'department',
    menuItems: ['personal_station', 'my_tasks', 'project_progress']
  },

  [PermissionLevel.LEVEL_3_5]: {
    level: PermissionLevel.LEVEL_3_5,
    displayName: '中堅看護師（リーダー可）',
    description: 'プロジェクト分析へのアクセス可能',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: true,  // ✅ プロジェクト分析可能
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'department',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics']
  },

  [PermissionLevel.LEVEL_4]: {
    level: PermissionLevel.LEVEL_4,
    displayName: 'ベテラン（11年以上）',
    description: 'プロジェクトメンバーとして経験を活かす',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'department',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics']
  },

  [PermissionLevel.LEVEL_4_5]: {
    level: PermissionLevel.LEVEL_4_5,
    displayName: 'ベテラン看護師（リーダー可）',
    description: '施設プロジェクトの閲覧と参加',
    canCreateProject: false,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,  // ✅ 施設プロジェクト閲覧可能
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'facility',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics']
  },

  // ========== 役職層 ==========
  [PermissionLevel.LEVEL_5]: {
    level: PermissionLevel.LEVEL_5,
    displayName: '副主任',
    description: 'プロジェクトメンバーとして参加・チームサポート',
    canCreateProject: true,  // ✅ プロジェクト作成可能
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'facility',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project']
  },

  [PermissionLevel.LEVEL_6]: {
    level: PermissionLevel.LEVEL_6,
    displayName: '主任',
    description: 'チームプロジェクトのリーダー',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: false,
    canFormProjectTeam: true,  // ✅ チーム編成可能
    canAssignTasks: true,      // ✅ タスク割り当て可能
    canManageMilestones: true, // ✅ マイルストーン管理可能
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'facility',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management']
  },

  [PermissionLevel.LEVEL_7]: {
    level: PermissionLevel.LEVEL_7,
    displayName: '副師長・副科長・副課長',
    description: '部門プロジェクトの調整',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: false,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,  // ✅ 進捗承認可能
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'facility',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'progress_approval']
  },

  [PermissionLevel.LEVEL_8]: {
    level: PermissionLevel.LEVEL_8,
    displayName: '師長・科長・課長・室長',
    description: '部署プロジェクトの統括管理',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,  // ✅ 法人プロジェクト閲覧可能
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,  // ✅ プロジェクト昇格可能
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'progress_approval', 'project_escalation']
  },

  [PermissionLevel.LEVEL_9]: {
    level: PermissionLevel.LEVEL_9,
    displayName: '副部長',
    description: '部門横断プロジェクトの調整',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'progress_approval', 'project_escalation', 'cross_department_coordination']
  },

  [PermissionLevel.LEVEL_10]: {
    level: PermissionLevel.LEVEL_10,
    displayName: '部長・医局長',
    description: '施設プロジェクトの統括',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'progress_approval', 'project_escalation', 'facility_projects']
  },

  [PermissionLevel.LEVEL_11]: {
    level: PermissionLevel.LEVEL_11,
    displayName: '事務長',
    description: '施設運営プロジェクトの統括',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'progress_approval', 'project_escalation', 'facility_governance']
  },

  // ========== 施設経営層 ==========
  [PermissionLevel.LEVEL_12]: {
    level: PermissionLevel.LEVEL_12,
    displayName: '副院長',
    description: '戦略プロジェクトの監督',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'progress_approval', 'project_escalation', 'strategic_projects']
  },

  [PermissionLevel.LEVEL_13]: {
    level: PermissionLevel.LEVEL_13,
    displayName: '院長・施設長',
    description: '施設全プロジェクトの最終承認',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'progress_approval', 'project_escalation', 'executive_dashboard']
  },

  // ========== 法人人事部 ==========
  [PermissionLevel.LEVEL_14]: {
    level: PermissionLevel.LEVEL_14,
    displayName: '人事部門員',
    description: '人事関連プロジェクトへの参加',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: false,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'hr_projects']
  },

  [PermissionLevel.LEVEL_15]: {
    level: PermissionLevel.LEVEL_15,
    displayName: '人事各部門長',
    description: '人事プロジェクトのリーダー',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'hr_projects', 'organizational_development']
  },

  [PermissionLevel.LEVEL_16]: {
    level: PermissionLevel.LEVEL_16,
    displayName: '戦略企画・統括管理部門員',
    description: '法人横断プロジェクトの企画・調整',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'strategic_planning', 'cross_facility_projects']
  },

  [PermissionLevel.LEVEL_17]: {
    level: PermissionLevel.LEVEL_17,
    displayName: '戦略企画・統括管理部門長',
    description: '法人プロジェクトの統括管理',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'strategic_planning', 'corporate_governance']
  },

  // ========== 最高経営層 ==========
  [PermissionLevel.LEVEL_18]: {
    level: PermissionLevel.LEVEL_18,
    displayName: '理事長・法人事務局長',
    description: '全プロジェクトの最終決定',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project', 'team_management', 'strategic_planning', 'board_functions', 'final_approval']
  },

  // ========== 特別権限レベル 97-99 ==========
  [PermissionLevel.LEVEL_97]: {
    level: PermissionLevel.LEVEL_97,
    displayName: '健診担当者',
    description: 'ストレスチェック実施者、プロジェクト参加は制限',
    canCreateProject: false,
    canJoinProject: true,  // 健康関連プロジェクトのみ参加可
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: false,
    canViewFacilityProjects: false,
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: false,
    canAccessProgressDashboard: false,
    canEscalateProject: false,
    projectVisibilityScope: 'team',
    menuItems: ['personal_station', 'my_tasks', 'health_projects']
  },

  [PermissionLevel.LEVEL_98]: {
    level: PermissionLevel.LEVEL_98,
    displayName: '産業医',
    description: '産業医、健康管理プロジェクト参加・閲覧可',
    canCreateProject: true,  // 健康管理プロジェクト作成可
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,  // 施設全体の健康状況確認
    canViewCorporateProjects: false,
    canFormProjectTeam: false,
    canAssignTasks: false,
    canManageMilestones: false,
    canApproveProjectProgress: false,
    canAccessProjectAnalytics: true,  // 健康関連分析のみ
    canAccessProgressDashboard: false,
    canEscalateProject: false,
    projectVisibilityScope: 'facility',
    menuItems: ['personal_station', 'my_tasks', 'health_projects', 'health_analytics']
  },

  [PermissionLevel.LEVEL_99]: {
    level: PermissionLevel.LEVEL_99,
    displayName: 'システム管理者',
    description: '全プロジェクト・全機能へのアクセス',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['all'] // 全メニューアクセス可能
  },

  // @deprecated 旧システム管理者レベル - LEVEL_99を使用してください
  [SpecialPermissionLevel.LEVEL_X]: {
    level: SpecialPermissionLevel.LEVEL_X,
    displayName: 'システム管理者（旧）',
    description: '全プロジェクト・全機能へのアクセス - LEVEL_99に移行してください',
    canCreateProject: true,
    canJoinProject: true,
    canManageOwnTasks: true,
    canViewTeamProjects: true,
    canViewDepartmentProjects: true,
    canViewFacilityProjects: true,
    canViewCorporateProjects: true,
    canFormProjectTeam: true,
    canAssignTasks: true,
    canManageMilestones: true,
    canApproveProjectProgress: true,
    canAccessProjectAnalytics: true,
    canAccessProgressDashboard: true,
    canEscalateProject: true,
    projectVisibilityScope: 'corporation',
    menuItems: ['all']
  }
};

/**
 * 権限レベルからプロジェクトモード権限を取得
 */
export const getProjectModePermission = (
  level: PermissionLevel | SpecialPermissionLevel | number
): ProjectModePermission | undefined => {
  const key = typeof level === 'number' ? level.toString() : level;
  return PROJECT_MODE_PERMISSIONS[key];
};
