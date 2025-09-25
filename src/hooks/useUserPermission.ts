import { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';

interface UseUserPermissionReturn {
  // 基本情報
  level: PermissionLevel | SpecialPermissionLevel | null;
  calculatedLevel: number;
  levelName: string;
  levelDescription: string;

  // 権限チェック
  canCreatePost: boolean;
  canVote: boolean;
  canViewAllPosts: boolean;
  canApproveProjects: boolean;
  canSubmitToCommittee: boolean;
  canAccessAnalytics: boolean;

  // メニューアクセス
  availableMenus: string[];

  // 権限レベル比較
  isAboveLevel: (targetLevel: PermissionLevel) => boolean;
  isBelowLevel: (targetLevel: PermissionLevel) => boolean;
  isInRange: (min: PermissionLevel, max: PermissionLevel) => boolean;

  // 役職判定
  isNewcomer: boolean;      // レベル1-2.5
  isIntermediate: boolean;   // レベル3-4.5
  isManager: boolean;        // レベル5-11
  isExecutive: boolean;      // レベル12-13
  isHR: boolean;            // レベル14-17
  isTopManagement: boolean; // レベル18
  isSystemAdmin: boolean;   // レベルX

  // 看護師リーダー判定
  isNursingLeader: boolean;
}

export const useUserPermission = (): UseUserPermissionReturn => {
  const { user, permissionLevel, metadata, hasPermission, canAccessMenu } = useUser();

  const calculatedLevel = useMemo(() => {
    if (!user) return 0;
    return user.calculatedLevel || (typeof user.accountLevel === 'number' ? user.accountLevel : 0);
  }, [user]);

  const levelName = useMemo(() => {
    return metadata?.displayName || '未設定';
  }, [metadata]);

  const levelDescription = useMemo(() => {
    return metadata?.description || '';
  }, [metadata]);

  // 機能権限
  const canCreatePost = useMemo(() => hasPermission('create_post'), [hasPermission]);
  const canVote = useMemo(() => hasPermission('vote'), [hasPermission]);
  const canViewAllPosts = useMemo(() => hasPermission('view_all_posts'), [hasPermission]);
  const canApproveProjects = useMemo(() =>
    hasPermission('approve_team_projects') ||
    hasPermission('approve_department_projects') ||
    hasPermission('approve_facility_projects'),
    [hasPermission]
  );
  const canSubmitToCommittee = useMemo(() => hasPermission('committee_submission'), [hasPermission]);
  const canAccessAnalytics = useMemo(() => metadata?.analyticsAccess || false, [metadata]);

  // 利用可能メニュー
  const availableMenus = useMemo(() => {
    return metadata?.menuItems || [];
  }, [metadata]);

  // レベル比較関数
  const isAboveLevel = (targetLevel: PermissionLevel): boolean => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel > targetLevel;
  };

  const isBelowLevel = (targetLevel: PermissionLevel): boolean => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel < targetLevel;
  };

  const isInRange = (min: PermissionLevel, max: PermissionLevel): boolean => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel >= min && permissionLevel <= max;
  };

  // 役職カテゴリ判定
  const isNewcomer = useMemo(() => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel >= 1 && permissionLevel <= 2.5;
  }, [permissionLevel]);

  const isIntermediate = useMemo(() => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel >= 3 && permissionLevel <= 4.5;
  }, [permissionLevel]);

  const isManager = useMemo(() => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel >= 5 && permissionLevel <= 11;
  }, [permissionLevel]);

  const isExecutive = useMemo(() => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel >= 12 && permissionLevel <= 13;
  }, [permissionLevel]);

  const isHR = useMemo(() => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel >= 14 && permissionLevel <= 17;
  }, [permissionLevel]);

  const isTopManagement = useMemo(() => {
    if (!permissionLevel || typeof permissionLevel !== 'number') return false;
    return permissionLevel === 18;
  }, [permissionLevel]);

  const isSystemAdmin = useMemo(() => {
    return permissionLevel === SpecialPermissionLevel.LEVEL_X;
  }, [permissionLevel]);

  // 看護師リーダー判定
  const isNursingLeader = useMemo(() => {
    if (!user) return false;
    return user.profession === '看護師' && user.canPerformLeaderDuty === true;
  }, [user]);

  return {
    // 基本情報
    level: permissionLevel,
    calculatedLevel,
    levelName,
    levelDescription,

    // 権限チェック
    canCreatePost,
    canVote,
    canViewAllPosts,
    canApproveProjects,
    canSubmitToCommittee,
    canAccessAnalytics,

    // メニューアクセス
    availableMenus,

    // 権限レベル比較
    isAboveLevel,
    isBelowLevel,
    isInRange,

    // 役職判定
    isNewcomer,
    isIntermediate,
    isManager,
    isExecutive,
    isHR,
    isTopManagement,
    isSystemAdmin,

    // 看護師リーダー判定
    isNursingLeader
  };
};