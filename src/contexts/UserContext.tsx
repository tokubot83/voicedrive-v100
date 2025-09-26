import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';
import { PermissionMetadata, getPermissionMetadata } from '../permissions/config/permissionMetadata';
import { demoStaffData, DemoStaffData } from '../data/demoStaffData';
import { medicalSystemAPI } from '../services/MedicalSystemAPI';
import { authTokenService } from '../services/AuthTokenService';
import { Facility } from '../types/facility.types';
import { getFacilityById, getDefaultFacility } from '../data/facilities';
import { facilityPermissionService } from '../services/FacilityPermissionService';

interface User {
  staffId: string;
  name: string;
  email: string;
  facility: string;
  facilityId?: string;
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
  currentFacility: Facility | null;
  permissionLevel: PermissionLevel | SpecialPermissionLevel | null;
  metadata: PermissionMetadata | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, facilityId?: string) => Promise<void>;
  logout: () => void;
  updatePermissionLevel: (level: PermissionLevel | SpecialPermissionLevel) => void;
  refreshPermissionLevel: () => Promise<void>;
  switchFacility: (facilityId: string) => Promise<void>;
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
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
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

  // 医療システムAPIから権限レベル取得
  const fetchPermissionFromMedicalSystem = async (staffId: string, facilityId?: string): Promise<number | null> => {
    try {
      // 認証トークンを設定
      const token = authTokenService.getToken() || authTokenService.generateMockToken();
      medicalSystemAPI.setAuthToken(token);

      const response = await medicalSystemAPI.calculatePermissionLevel(staffId, facilityId);
      return response.permissionLevel;
    } catch (error) {
      console.warn(`医療システムAPIから権限レベルを取得できませんでした (${staffId}):`, error);
      return null;
    }
  };

  // ログイン処理
  const login = async (email: string, password: string, facilityId?: string) => {
    setIsLoading(true);

    try {
      // デモ用：メールアドレスでスタッフを検索
      const staffData = demoStaffData.find(s => s.email === email);

      if (!staffData) {
        throw new Error('認証に失敗しました');
      }

      // 施設情報の設定
      const selectedFacilityId = facilityId || 'kohara_hospital';
      const selectedFacility = getFacilityById(selectedFacilityId) || getDefaultFacility();

      const userData: User = {
        staffId: staffData.staffId,
        name: staffData.name,
        email: staffData.email,
        facility: staffData.facility,
        facilityId: selectedFacilityId,
        department: staffData.department,
        position: staffData.position,
        profession: staffData.profession,
        experienceYears: staffData.experienceYears,
        accountLevel: staffData.accountLevel,
        canPerformLeaderDuty: staffData.canPerformLeaderDuty,
        profileImage: staffData.profileImage
      };

      // Phase 3: 医療システムAPIから最新の権限レベルを取得
      const apiPermissionLevel = await fetchPermissionFromMedicalSystem(staffData.staffId, selectedFacilityId);

      if (apiPermissionLevel !== null) {
        console.log(`[Phase 3] 医療システムAPIから権限レベル取得: ${staffData.staffId} -> Level ${apiPermissionLevel}`);
        userData.accountLevel = apiPermissionLevel as PermissionLevel;
        userData.calculatedLevel = apiPermissionLevel;
      } else {
        // フォールバック: デモデータの値を使用
        console.log(`[Phase 3] フォールバック: デモデータを使用 ${staffData.staffId} -> Level ${staffData.accountLevel}`);
        if (staffData.profession === '看護師' && staffData.canPerformLeaderDuty) {
          userData.calculatedLevel = typeof staffData.accountLevel === 'number'
            ? staffData.accountLevel + 0.5
            : staffData.accountLevel;
        } else {
          userData.calculatedLevel = staffData.accountLevel as number;
        }
      }

      setUser(userData);
      setCurrentFacility(selectedFacility);
      setPermissionLevel(userData.accountLevel);
      setMetadata(getPermissionMetadata(userData.accountLevel));
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
    setCurrentFacility(null);
    setPermissionLevel(null);
    setMetadata(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('currentUserId');
    facilityPermissionService.clearAllCache();
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

  // 医療システムAPIから権限レベル再取得
  const refreshPermissionLevel = async (): Promise<void> => {
    if (!user) return;

    try {
      const apiPermissionLevel = await fetchPermissionFromMedicalSystem(user.staffId, user.facilityId);

      if (apiPermissionLevel !== null) {
        console.log(`[Phase 3] 権限レベル更新: ${user.staffId} -> Level ${apiPermissionLevel}`);
        const updatedUser = {
          ...user,
          accountLevel: apiPermissionLevel as PermissionLevel,
          calculatedLevel: apiPermissionLevel
        };

        setUser(updatedUser);
        setPermissionLevel(updatedUser.accountLevel);
        setMetadata(getPermissionMetadata(updatedUser.accountLevel));
      }
    } catch (error) {
      console.error('権限レベル更新エラー:', error);
    }
  };

  // 施設切り替え
  const switchFacility = async (facilityId: string): Promise<void> => {
    if (!user) return;

    const newFacility = getFacilityById(facilityId);
    if (!newFacility) {
      console.error(`施設 ID ${facilityId} が見つかりません`);
      return;
    }

    // 施設間権限変換
    const adjustedLevel = facilityPermissionService.translatePermissionLevel(
      user.calculatedLevel || user.accountLevel as number,
      user.facilityId || 'kohara_hospital',
      facilityId
    );

    const updatedUser = {
      ...user,
      facilityId,
      facility: newFacility.name,
      calculatedLevel: adjustedLevel
    };

    setUser(updatedUser);
    setCurrentFacility(newFacility);

    // 新施設での権限を取得
    await refreshPermissionLevel();

    console.log(`[施設切替] ${user.facilityId} → ${facilityId}`);
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

  // Webhookイベントリスナー
  useEffect(() => {
    const handleStaffUpdated = async (event: CustomEvent) => {
      const { staffId, facilityId, newLevel } = event.detail;
      if (user && user.staffId === staffId && user.facilityId === facilityId) {
        await refreshPermissionLevel();
      }
    };

    const handleFacilityMappingUpdated = async (event: CustomEvent) => {
      const { facilityId } = event.detail;
      if (user && user.facilityId === facilityId) {
        await facilityPermissionService.syncFacilityMappings();
        await refreshPermissionLevel();
      }
    };

    window.addEventListener('staff-updated', handleStaffUpdated as EventListener);
    window.addEventListener('facility-mapping-updated', handleFacilityMappingUpdated as EventListener);

    return () => {
      window.removeEventListener('staff-updated', handleStaffUpdated as EventListener);
      window.removeEventListener('facility-mapping-updated', handleFacilityMappingUpdated as EventListener);
    };
  }, [user]);

  const value: UserContextValue = {
    user,
    currentFacility,
    permissionLevel,
    metadata,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updatePermissionLevel,
    refreshPermissionLevel,
    switchFacility,
    hasPermission,
    canAccessMenu
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};