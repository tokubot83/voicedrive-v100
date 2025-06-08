// 権限管理カスタムフック
import { useState, useEffect } from 'react';

interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  userLevel: string;
  userRole: string;
  isLoading: boolean;
}

// 権限レベルの階層
const PERMISSION_LEVELS = {
  LEVEL_1: 1, // 一般職員
  LEVEL_2: 2, // 主任・係長
  LEVEL_3: 3, // 部門長
  LEVEL_4: 4, // 施設管理者
  LEVEL_5: 5, // 役員
  LEVEL_6: 6  // 理事長
};

export const usePermissions = (): UsePermissionsReturn => {
  const [userLevel, setUserLevel] = useState('LEVEL_1');
  const [userRole, setUserRole] = useState('employee');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 実際の実装では、APIから現在のユーザー情報を取得
    // デモ用に仮のデータを設定
    const fetchUserPermissions = async () => {
      try {
        // 仮のユーザー情報
        const currentUser = {
          level: 'LEVEL_3', // 部門長レベル
          role: 'department_head'
        };
        
        setUserLevel(currentUser.level);
        setUserRole(currentUser.role);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPermissions();
  }, []);
  
  const hasPermission = (requiredPermission: string): boolean => {
    if (!requiredPermission || isLoading) return false;
    
    const userLevelValue = PERMISSION_LEVELS[userLevel as keyof typeof PERMISSION_LEVELS] || 1;
    const requiredLevelValue = PERMISSION_LEVELS[requiredPermission as keyof typeof PERMISSION_LEVELS] || 1;
    
    // ユーザーのレベルが要求レベル以上であれば権限あり
    return userLevelValue >= requiredLevelValue;
  };
  
  return {
    hasPermission,
    userLevel,
    userRole,
    isLoading
  };
};