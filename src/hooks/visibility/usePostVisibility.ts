// 投稿公開範囲管理フック
import { useState, useEffect, useMemo } from 'react';
import { PostDisplayConfig, ProjectLevel, StakeholderGroup } from '../../types/visibility';
import { Post, User } from '../../types';
import { PostVisibilityEngine } from '../../services/PostVisibilityEngine';
import { ProjectUpgradeEngine } from '../../services/ProjectUpgradeEngine';

interface UsePostVisibilityOptions {
  organizationSize?: number;
  autoCheckUpgrade?: boolean;
}

export const usePostVisibility = (
  post: Post, 
  currentUser: User,
  options: UsePostVisibilityOptions = {}
) => {
  const { organizationSize = 400, autoCheckUpgrade = true } = options;
  
  const [displayConfig, setDisplayConfig] = useState<PostDisplayConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeStatus, setUpgradeStatus] = useState<{
    shouldUpgrade: boolean;
    targetLevel?: ProjectLevel;
    newVisibilityScope?: StakeholderGroup;
    notification?: string;
  } | null>(null);

  // エンジンのインスタンス化
  const visibilityEngine = useMemo(() => new PostVisibilityEngine(), []);
  const upgradeEngine = useMemo(() => new ProjectUpgradeEngine(), []);

  // 表示設定の計算
  useEffect(() => {
    const calculateDisplayConfig = async () => {
      setIsLoading(true);
      
      try {
        // 基本の表示設定を取得
        const config = visibilityEngine.getDisplayConfig(post, currentUser);
        setDisplayConfig(config);

        // 自動昇格チェック
        if (autoCheckUpgrade) {
          const upgradeCheck = await upgradeEngine.checkForAutoUpgrade(post, organizationSize);
          setUpgradeStatus(upgradeCheck);
        }
      } catch (error) {
        console.error('Failed to calculate visibility config:', error);
        // フォールバック設定
        setDisplayConfig({
          showVoteButtons: false,
          showCommentForm: false,
          showProjectStatus: true,
          showEmergencyOverride: false,
          accessLevel: 'view_only'
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateDisplayConfig();
  }, [post, currentUser, visibilityEngine, upgradeEngine, organizationSize, autoCheckUpgrade]);

  // ユーザーのスコープを取得
  const userScope = useMemo(() => {
    return visibilityEngine.getUserScope(post, currentUser);
  }, [post, currentUser, visibilityEngine]);

  // 投稿の現在レベルを取得
  const postLevel = useMemo(() => {
    return visibilityEngine.getPostCurrentLevel(post);
  }, [post, visibilityEngine]);

  // 緊急昇格の実行
  const executeEmergencyEscalation = async (
    targetScope: import('../../permissions/types/PermissionTypes').ProjectScope,
    justification?: string
  ) => {
    try {
      const result = await upgradeEngine.executeEmergencyEscalation(
        post,
        targetScope,
        currentUser,
        justification
      );
      
      // 成功時の状態更新
      if (result.success) {
        // 表示設定を再計算
        const newConfig = visibilityEngine.getDisplayConfig(post, currentUser);
        setDisplayConfig(newConfig);
        
        return result;
      }
    } catch (error) {
      console.error('Emergency escalation failed:', error);
      throw error;
    }
  };

  // 可視性情報の取得
  const getVisibilityInfo = () => {
    const scopeLabels = {
      [StakeholderGroup.SAME_TEAM]: 'チーム内',
      [StakeholderGroup.SAME_DEPARTMENT]: '部署内',
      [StakeholderGroup.SAME_FACILITY]: '施設内',
      [StakeholderGroup.SAME_ORGANIZATION]: '法人内',
      [StakeholderGroup.ALL_USERS]: '全職員'
    };

    const levelLabels = {
      'PENDING': '検討中',
      'TEAM': 'チームプロジェクト',
      'DEPARTMENT': '部署プロジェクト',
      'FACILITY': '施設プロジェクト',
      'ORGANIZATION': '法人プロジェクト',
      'STRATEGIC': '戦略プロジェクト'
    };

    return {
      userScopeLabel: scopeLabels[userScope],
      postLevelLabel: levelLabels[postLevel],
      userScope,
      postLevel
    };
  };

  // アクセス権限チェック
  const checkPermissions = () => {
    return {
      canVote: displayConfig?.showVoteButtons ?? false,
      canComment: displayConfig?.showCommentForm ?? false,
      canViewDetails: true,
      canUseEmergencyOverride: displayConfig?.showEmergencyOverride ?? false,
      accessLevel: displayConfig?.accessLevel ?? 'view_only'
    };
  };

  // プロジェクト進捗情報
  const getProjectProgress = () => {
    if (post.projectStatus && typeof post.projectStatus === 'object') {
      return {
        currentScore: post.projectStatus.score,
        threshold: post.projectStatus.threshold,
        progress: post.projectStatus.progress,
        isNearComplete: post.projectStatus.progress >= 90
      };
    }
    return null;
  };

  return {
    // 状態
    displayConfig,
    upgradeStatus,
    isLoading,
    
    // 基本情報
    userScope,
    postLevel,
    
    // アクション
    executeEmergencyEscalation,
    
    // ヘルパー関数
    getVisibilityInfo,
    checkPermissions,
    getProjectProgress,
    
    // 便利なフラグ
    canVote: displayConfig?.showVoteButtons ?? false,
    canComment: displayConfig?.showCommentForm ?? false,
    hasEmergencyOverride: displayConfig?.showEmergencyOverride ?? false,
    shouldShowUpgradeNotification: !!upgradeStatus?.shouldUpgrade
  };
};

export default usePostVisibility;