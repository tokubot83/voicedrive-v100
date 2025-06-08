// 権限管理カスタムフック - 8段階権限システム対応
import { useState, useEffect, useCallback } from 'react';
import { PermissionService } from '../services/PermissionService';
import {
  PermissionLevel,
  PermissionMetadata,
  PermissionCheckResult,
  ProjectScope
} from '../types/PermissionTypes';

interface UsePermissionsReturn {
  userLevel: PermissionLevel;
  metadata: PermissionMetadata;
  checkFeatureAccess: (featureId: string) => PermissionCheckResult;
  checkProjectScope: (scope: ProjectScope) => boolean;
  canApproveAmount: (amount: number) => boolean;
  accessibleMenuItems: string[];
  hasAnalyticsAccess: boolean;
  hasHRPermissions: boolean;
  hasStrategicAuthority: boolean;
  canAccessWorkflowStage: (stage: string) => boolean;
  loading: boolean;
}

export const usePermissions = (userId?: string): UsePermissionsReturn => {
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<PermissionLevel>(PermissionLevel.LEVEL_1);
  const [metadata, setMetadata] = useState<PermissionMetadata | null>(null);
  
  const permissionService = PermissionService.getInstance();
  
  // ユーザーIDを取得（実際の実装では認証システムから取得）
  const effectiveUserId = userId || 'user-001'; // デモ用のデフォルトユーザー
  
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        
        // 権限レベルとメタデータを取得
        const level = permissionService.getUserPermissionLevel(effectiveUserId);
        const meta = permissionService.getUserPermissionMetadata(effectiveUserId);
        
        setUserLevel(level);
        setMetadata(meta);
      } catch (error) {
        console.error('Failed to load permissions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPermissions();
  }, [effectiveUserId, permissionService]);
  
  // 機能アクセスチェック
  const checkFeatureAccess = useCallback(
    (featureId: string): PermissionCheckResult => {
      return permissionService.checkFeatureAccess(effectiveUserId, featureId);
    },
    [effectiveUserId, permissionService]
  );
  
  // プロジェクトスコープチェック
  const checkProjectScope = useCallback(
    (scope: ProjectScope): boolean => {
      return permissionService.checkProjectScopeAccess(effectiveUserId, scope);
    },
    [effectiveUserId, permissionService]
  );
  
  // 承認金額チェック
  const canApproveAmount = useCallback(
    (amount: number): boolean => {
      const limit = permissionService.getApprovalLimit(effectiveUserId);
      return limit === undefined || amount <= limit;
    },
    [effectiveUserId, permissionService]
  );
  
  // ワークフローステージアクセスチェック
  const canAccessWorkflowStage = useCallback(
    (stage: string): boolean => {
      return permissionService.canAccessWorkflowStage(effectiveUserId, stage);
    },
    [effectiveUserId, permissionService]
  );
  
  // デフォルトメタデータ
  const defaultMetadata: PermissionMetadata = {
    level: PermissionLevel.LEVEL_1,
    name: 'employee',
    displayName: '一般従業員',
    description: '基本的な投稿・投票権限',
    accessibleFeatures: [],
    projectScopes: [],
    menuItems: [],
    analyticsAccess: false,
    workflowStages: []
  };
  
  return {
    userLevel,
    metadata: metadata || defaultMetadata,
    checkFeatureAccess,
    checkProjectScope,
    canApproveAmount,
    accessibleMenuItems: permissionService.getAccessibleMenuItems(effectiveUserId),
    hasAnalyticsAccess: permissionService.hasAnalyticsAccess(effectiveUserId),
    hasHRPermissions: permissionService.hasHRPermissions(effectiveUserId),
    hasStrategicAuthority: permissionService.hasStrategicDecisionAuthority(effectiveUserId),
    canAccessWorkflowStage,
    loading
  };
};