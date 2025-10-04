// 権限管理サービス - 18段階権限システム + モード対応
import {
  PermissionLevel,
  PermissionMetadata,
  PermissionCheckResult,
  PERMISSION_METADATA,
  FEATURE_PERMISSIONS,
  canAccessLevel,
  canAccessProjectScope,
  ProjectScope,
  SpecialPermissionLevel
} from '../types/PermissionTypes';
import { systemModeManager, SystemMode } from '../../config/systemMode';
import { getAgendaModePermission, AgendaModePermission } from '../config/agendaModePermissions';
import { getProjectModePermission, ProjectModePermission } from '../config/projectModePermissions';

export class PermissionService {
  private static instance: PermissionService;

  private constructor() {}

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }
  
  // ユーザーの権限レベルを取得
  getUserPermissionLevel(userId: string): PermissionLevel {
    // 実際の実装では、APIやデータベースから取得
    // デモ用の仮実装
    const userLevelMap: Record<string, PermissionLevel> = {
      'user-001': PermissionLevel.LEVEL_1,  // 一般職員
      'user-002': PermissionLevel.LEVEL_3,  // 係長・マネージャー
      'user-003': PermissionLevel.LEVEL_5,  // 人財統括本部 戦略企画・統括管理部門
      'user-004': PermissionLevel.LEVEL_6,  // 人財統括本部 キャリア支援部門員
      'user-005': PermissionLevel.LEVEL_7,  // 人財統括本部 各部門長
      'user-006': PermissionLevel.LEVEL_8,  // 人財統括本部 統括管理部門長
      'user-007': PermissionLevel.LEVEL_9,  // 部長・本部長級
      'user-008': PermissionLevel.LEVEL_10  // 役員・経営層
    };
    
    return userLevelMap[userId] || PermissionLevel.LEVEL_1;
  }
  
  // 機能へのアクセス権限をチェック
  checkFeatureAccess(userId: string, featureId: string): PermissionCheckResult {
    const userLevel = this.getUserPermissionLevel(userId);
    const featurePermission = FEATURE_PERMISSIONS[featureId];
    
    if (!featurePermission) {
      return {
        hasPermission: false,
        currentLevel: userLevel,
        reason: '指定された機能が見つかりません'
      };
    }
    
    const hasPermission = canAccessLevel(userLevel, featurePermission.requiredLevel);
    
    return {
      hasPermission,
      requiredLevel: featurePermission.requiredLevel,
      currentLevel: userLevel,
      reason: hasPermission 
        ? undefined 
        : `この機能には${PERMISSION_METADATA[featurePermission.requiredLevel].displayName}以上の権限が必要です`
    };
  }
  
  // プロジェクトスコープへのアクセス権限をチェック
  checkProjectScopeAccess(userId: string, scope: ProjectScope): boolean {
    const userLevel = this.getUserPermissionLevel(userId);
    return canAccessProjectScope(userLevel, scope);
  }
  
  // 承認可能な予算上限を取得
  getApprovalLimit(userId: string): number | undefined {
    const userLevel = this.getUserPermissionLevel(userId);
    return PERMISSION_METADATA[userLevel].approvalLimit;
  }
  
  // ユーザーのメタデータを取得
  getUserPermissionMetadata(userId: string): PermissionMetadata {
    const userLevel = this.getUserPermissionLevel(userId);
    return PERMISSION_METADATA[userLevel];
  }
  
  // アクセス可能なメニュー項目を取得
  getAccessibleMenuItems(userId: string): string[] {
    const metadata = this.getUserPermissionMetadata(userId);
    return metadata.menuItems;
  }
  
  // ワークフローステージへのアクセス権限をチェック
  canAccessWorkflowStage(userId: string, stage: string): boolean {
    const metadata = this.getUserPermissionMetadata(userId);
    return metadata.workflowStages.includes(stage);
  }
  
  // 分析機能へのアクセス権限をチェック
  hasAnalyticsAccess(userId: string): boolean {
    const metadata = this.getUserPermissionMetadata(userId);
    return metadata.analyticsAccess;
  }
  
  // 権限レベルの昇格が必要かチェック
  requiresEscalation(
    currentUserId: string, 
    requiredLevel: PermissionLevel
  ): { required: boolean; escalationLevel?: PermissionLevel } {
    const userLevel = this.getUserPermissionLevel(currentUserId);
    
    if (userLevel >= requiredLevel) {
      return { required: false };
    }
    
    return {
      required: true,
      escalationLevel: requiredLevel
    };
  }
  
  // 部下の権限レベルを管理できるかチェック
  canManageSubordinates(managerId: string, subordinateLevel: PermissionLevel): boolean {
    const managerLevel = this.getUserPermissionLevel(managerId);
    // 通常、2レベル以上上位の権限があれば部下を管理可能
    return managerLevel >= subordinateLevel + 2;
  }
  
  // プロジェクト承認権限の階層チェック（10段階システム対応）
  getApprovalHierarchy(projectScope: ProjectScope): PermissionLevel[] {
    const approvalLevels: Record<ProjectScope, PermissionLevel[]> = {
      [ProjectScope.TEAM]: [PermissionLevel.LEVEL_2, PermissionLevel.LEVEL_3],
      [ProjectScope.DEPARTMENT]: [PermissionLevel.LEVEL_3, PermissionLevel.LEVEL_4],
      [ProjectScope.FACILITY]: [PermissionLevel.LEVEL_4, PermissionLevel.LEVEL_7, PermissionLevel.LEVEL_8, PermissionLevel.LEVEL_9],
      [ProjectScope.ORGANIZATION]: [PermissionLevel.LEVEL_7, PermissionLevel.LEVEL_8, PermissionLevel.LEVEL_9, PermissionLevel.LEVEL_10],
      [ProjectScope.STRATEGIC]: [PermissionLevel.LEVEL_9, PermissionLevel.LEVEL_10]
    };
    
    return approvalLevels[projectScope] || [];
  }
  
  // HR特有の権限チェック
  hasHRPermissions(userId: string): boolean {
    const userLevel = this.getUserPermissionLevel(userId);
    // レベル5以上がHR権限を持つ
    return userLevel >= PermissionLevel.LEVEL_5;
  }
  
  // 戦略的決定権限のチェック
  hasStrategicDecisionAuthority(userId: string): boolean {
    const userLevel = this.getUserPermissionLevel(userId);
    // レベル9以上が戦略的決定権を持つ（部長・本部長級以上）
    return userLevel >= PermissionLevel.LEVEL_9;
  }

  // ==================== モード別権限管理 ====================

  /**
   * モードを考慮した権限を取得
   */
  getModeAwarePermissions(
    userLevel: PermissionLevel | SpecialPermissionLevel
  ): AgendaModePermission | ProjectModePermission | undefined {
    const currentMode = systemModeManager.getCurrentMode();

    if (currentMode === SystemMode.AGENDA) {
      return getAgendaModePermission(userLevel);
    } else {
      return getProjectModePermission(userLevel);
    }
  }

  /**
   * 議題モード権限を取得
   */
  getAgendaModePermissions(
    userLevel: PermissionLevel | SpecialPermissionLevel
  ): AgendaModePermission | undefined {
    return getAgendaModePermission(userLevel);
  }

  /**
   * プロジェクトモード権限を取得
   */
  getProjectModePermissions(
    userLevel: PermissionLevel | SpecialPermissionLevel
  ): ProjectModePermission | undefined {
    return getProjectModePermission(userLevel);
  }

  /**
   * 現在のモードでアクセス可能なメニュー項目を取得
   */
  getModeAwareMenuItems(
    userLevel: PermissionLevel | SpecialPermissionLevel
  ): string[] {
    const permissions = this.getModeAwarePermissions(userLevel);
    return permissions?.menuItems || [];
  }

  /**
   * 現在のモードで特定の権限をチェック
   */
  hasModeAwarePermission(
    userLevel: PermissionLevel | SpecialPermissionLevel,
    permissionKey: string
  ): boolean {
    const permissions = this.getModeAwarePermissions(userLevel);
    if (!permissions) return false;

    // permissionsオブジェクトから該当するキーの値を取得
    return (permissions as any)[permissionKey] === true;
  }

  /**
   * モード切替時の権限変更を通知
   */
  onModeChange(newMode: SystemMode): void {
    console.log(`[PermissionService] モード変更: ${newMode}`);
    // UIの再レンダリングをトリガー（将来的にイベントエミッターで実装）
  }
}