// 権限管理カスタムフック
import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { AccountHierarchyService } from '../services/AccountHierarchyService';
import { DemoUser, getDemoUserById } from '../data/demo/users';
import { AccountType } from '../types';

interface UsePermissionsReturn {
  hasPermission: (permission: string | number) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  canViewUser: (targetUserId: string) => boolean;
  canApproveBudget: (amount: number) => boolean;
  getNextApprover: (amount: number) => DemoUser | null;
  userLevel: number;
  userRole: string;
  accountType: AccountType;
  isLoading: boolean;
  currentUser: DemoUser | null;
}

// 権限レベルの階層
const PERMISSION_LEVELS = {
  LEVEL_1: 1, // スタッフ
  LEVEL_2: 2, // スーパーバイザー
  LEVEL_3: 3, // 部門長
  LEVEL_4: 4, // 施設長
  LEVEL_5: 5, // 人事部門長
  LEVEL_6: 6, // 人事部長
  LEVEL_7: 7, // 役員秘書
  LEVEL_8: 8  // 理事長
};

export const usePermissions = (): UsePermissionsReturn => {
  const { currentUser: demoUser } = useDemoMode();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // クライアントサイドでのみ実行
    setIsLoading(false);
  }, []);
  
  const hasPermission = useCallback((requiredPermission: string | number): boolean => {
    if (!demoUser || isLoading) return false;
    
    // If permission is a number, compare directly
    if (typeof requiredPermission === 'number') {
      return demoUser.permissionLevel >= requiredPermission;
    }
    
    // If permission is a string (LEVEL_X format)
    const requiredLevelValue = PERMISSION_LEVELS[requiredPermission as keyof typeof PERMISSION_LEVELS];
    if (!requiredLevelValue) return false;
    
    return demoUser.permissionLevel >= requiredLevelValue;
  }, [demoUser, isLoading]);

  const canViewUser = useCallback((targetUserId: string): boolean => {
    if (!demoUser) return false;
    
    // Import getDemoUserById at the top of the file to avoid require
    const targetUser = getDemoUserById(targetUserId);
    if (!targetUser) return false;
    
    return AccountHierarchyService.canViewUser(demoUser, targetUser);
  }, [demoUser]);

  const canApproveBudget = useCallback((amount: number): boolean => {
    if (!demoUser) return false;
    return AccountHierarchyService.canApproveBudget(demoUser, amount);
  }, [demoUser]);

  const getNextApprover = useCallback((amount: number): DemoUser | null => {
    if (!demoUser) return null;
    return AccountHierarchyService.getNextApprover(demoUser, amount);
  }, [demoUser]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);
  
  return {
    hasPermission,
    hasAnyPermission,
    canViewUser,
    canApproveBudget,
    getNextApprover,
    userLevel: demoUser?.permissionLevel || 1,
    userRole: demoUser?.role || 'employee',
    accountType: demoUser?.accountType || 'STAFF',
    isLoading,
    currentUser: demoUser || null
  };
};