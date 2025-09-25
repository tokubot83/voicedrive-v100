import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';
import { PermissionMetadata, getPermissionMetadata } from '../permissions/config/permissionMetadata';
import { demoStaffData, DemoStaffData } from '../data/demoStaffData';

interface User {
  staffId: string;
  name: string;
  email: string;
  facility: string;
  department: string;
  position: string;
  profession: string;
  experienceYears: number;
  accountLevel: PermissionLevel | SpecialPermissionLevel;
  canPerformLeaderDuty?: boolean;
  calculatedLevel?: number;
  profileImage?: string;
}

interface UserContextValue {
  user: User | null;
  permissionLevel: PermissionLevel | SpecialPermissionLevel | null;
  metadata: PermissionMetadata | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePermissionLevel: (level: PermissionLevel | SpecialPermissionLevel) => void;
  hasPermission: (feature: string) => boolean;
  canAccessMenu: (menuItem: string) => boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel | SpecialPermissionLevel | null>(null);
  const [metadata, setMetadata] = useState<PermissionMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初期化（セッションから復元）
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);

      try {
        // セッションストレージから復元
        const savedUserId = sessionStorage.getItem('currentUserId');

        if (savedUserId) {
          // デモデータから取得（実際はAPIから取得）
          const staffData = demoStaffData.find(s => s.staffId === savedUserId);

          if (staffData) {
            const userData: User = {
              staffId: staffData.staffId,
              name: staffData.name,
              email: staffData.email,
              facility: staffData.facility,
              department: staffData.department,
              position: staffData.position,
              profession: staffData.profession,
              experienceYears: staffData.experienceYears,
              accountLevel: staffData.accountLevel,
              canPerformLeaderDuty: staffData.canPerformLeaderDuty,
              profileImage: staffData.profileImage
            };

            // 看護師のリーダー業務による補正
            if (staffData.profession === '看護師' && staffData.canPerformLeaderDuty) {
              userData.calculatedLevel = typeof staffData.accountLevel === 'number'
                ? staffData.accountLevel + 0.5
                : staffData.accountLevel;
            } else {
              userData.calculatedLevel = staffData.accountLevel as number;
            }

            setUser(userData);
            setPermissionLevel(staffData.accountLevel);
            setMetadata(getPermissionMetadata(staffData.accountLevel));
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // ログイン処理
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // デモ用：メールアドレスでスタッフを検索
      const staffData = demoStaffData.find(s => s.email === email);

      if (!staffData) {
        throw new Error('認証に失敗しました');
      }

      const userData: User = {
        staffId: staffData.staffId,
        name: staffData.name,
        email: staffData.email,
        facility: staffData.facility,
        department: staffData.department,
        position: staffData.position,
        profession: staffData.profession,
        experienceYears: staffData.experienceYears,
        accountLevel: staffData.accountLevel,
        canPerformLeaderDuty: staffData.canPerformLeaderDuty,
        profileImage: staffData.profileImage
      };

      // 看護師のリーダー業務による補正
      if (staffData.profession === '看護師' && staffData.canPerformLeaderDuty) {
        userData.calculatedLevel = typeof staffData.accountLevel === 'number'
          ? staffData.accountLevel + 0.5
          : staffData.accountLevel;
      } else {
        userData.calculatedLevel = staffData.accountLevel as number;
      }

      setUser(userData);
      setPermissionLevel(staffData.accountLevel);
      setMetadata(getPermissionMetadata(staffData.accountLevel));
      setIsAuthenticated(true);

      // セッションに保存
      sessionStorage.setItem('currentUserId', staffData.staffId);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト処理
  const logout = () => {
    setUser(null);
    setPermissionLevel(null);
    setMetadata(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('currentUserId');
  };

  // 権限レベル更新
  const updatePermissionLevel = (level: PermissionLevel | SpecialPermissionLevel) => {
    setPermissionLevel(level);
    setMetadata(getPermissionMetadata(level));

    if (user) {
      setUser({
        ...user,
        accountLevel: level
      });
    }
  };

  // 機能へのアクセス権限チェック
  const hasPermission = (feature: string): boolean => {
    if (!metadata) return false;
    return metadata.accessibleFeatures.includes(feature);
  };

  // メニューへのアクセス権限チェック
  const canAccessMenu = (menuItem: string): boolean => {
    if (!metadata) return false;
    return metadata.menuItems.includes(menuItem);
  };

  const value: UserContextValue = {
    user,
    permissionLevel,
    metadata,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updatePermissionLevel,
    hasPermission,
    canAccessMenu
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};