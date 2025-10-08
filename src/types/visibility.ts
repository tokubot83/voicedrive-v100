// 段階的公開システムの型定義
import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';

export enum StakeholderGroup {
  SAME_TEAM = 'same_team',           // 同一チーム
  SAME_DEPARTMENT = 'same_department', // 同一部署
  SAME_FACILITY = 'same_facility',   // 同一施設
  SAME_ORGANIZATION = 'same_organization', // 同一法人
  ALL_USERS = 'all_users'            // 全職員
}

export interface PostVisibilityScope {
  viewableBy: StakeholderGroup[];     // 閲覧可能な職員グループ
  votableBy: StakeholderGroup[];      // 投票可能な職員グループ
  commentableBy: StakeholderGroup[];  // コメント可能な職員グループ
}

export interface PostDisplayConfig {
  showVoteButtons: boolean;
  showCommentForm: boolean;
  showProjectStatus: boolean;
  showEmergencyOverride: boolean;
  accessLevel: 'full' | 'limited' | 'view_only' | 'no_access';
  upgradeNotification?: string;
  emergencyOverrideOptions?: EmergencyOverrideOption[];
  canView?: boolean;
  viewRestrictionReason?: string;
}

export interface EmergencyOverrideOption {
  targetLevel: ProjectScope;
  label: string;
  icon: string;
  requiredLevel: PermissionLevel;
  requiresJustification: boolean;
  requiresPostActionReport: boolean;
}

export type ProjectLevel = 'PENDING' | 'TEAM' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'STRATEGIC';

export interface ProjectUpgradeCondition {
  currentLevel: ProjectLevel;
  targetLevel: ProjectLevel;
  scoreThreshold: number;
  organizationSizeMultiplier: number;
  newVisibilityScope: StakeholderGroup;
  notificationRequired: boolean;
}

export interface EmergencyEscalationConfig {
  triggerAuthority: PermissionLevel.LEVEL_7 | PermissionLevel.LEVEL_8;
  escalationType: 'workflow_override' | 'executive_override' | 'emergency_authority';
  immediateVisibilityChange: {
    newScope: StakeholderGroup;
    bypassNormalProcess: boolean;
    emergencyNotification: boolean;
  };
  auditRequirements: {
    justificationRequired: boolean;
    postActionReportRequired: boolean;
    approvalChainDocumentation: boolean;
  };
}

export interface EscalationResult {
  success: boolean;
  postId: string;
  fromLevel: ProjectLevel;
  toLevel: ProjectLevel;
  newScope: StakeholderGroup;
  executorId: string;
  executorLevel: PermissionLevel;
  justification?: string;
  timestamp: Date;
  auditId: string;
}

export interface UserScopeContext {
  userId: string;
  teamId?: string;
  departmentId: string;
  facilityId: string;
  organizationId: string;
  permissionLevel: PermissionLevel;
}