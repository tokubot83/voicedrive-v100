// 既存システムとの統合ユーティリティ
import { MedicalProfile } from '../types/profile';
import { ProjectScope } from '../permissions/types/PermissionTypes';

// 投票システムとの統合
export const integrateWithVotingSystem = (userProfile: MedicalProfile) => {
  // 投票重み適用
  const applyVotingWeight = (baseVote: number): number => {
    return baseVote * userProfile.votingWeight;
  };

  // 承認権限チェック
  const checkApprovalAuthority = (projectType: ProjectScope): boolean => {
    const requiredLevel = getRequiredApprovalLevel(projectType);
    return userProfile.permissionLevel >= requiredLevel;
  };

  return {
    applyVotingWeight,
    checkApprovalAuthority
  };
};

// プロジェクト承認システムとの統合
export const integrateWithApprovalSystem = (userProfile: MedicalProfile) => {
  // 承認可能なプロジェクトタイプ決定
  const getApprovableProjectTypes = (): ProjectScope[] => {
    const allProjectTypes = [
      ProjectScope.TEAM,
      ProjectScope.DEPARTMENT,
      ProjectScope.FACILITY,
      ProjectScope.ORGANIZATION,
      ProjectScope.STRATEGIC
    ];
    
    return allProjectTypes.filter(type => {
      const requiredLevel = getRequiredApprovalLevel(type);
      return userProfile.permissionLevel >= requiredLevel;
    });
  };

  // 承認限度額チェック
  const checkApprovalBudget = (amount: number): boolean => {
    const approvalLimits = {
      'basic': 0,
      'low': 100000,
      'medium': 500000,
      'high': 2000000,
      'very_high': 10000000,
      'highest': Infinity
    };

    const limit = approvalLimits[userProfile.approvalAuthority] || 0;
    return amount <= limit;
  };

  return {
    getApprovableProjectTypes,
    checkApprovalBudget
  };
};

// プロジェクトタイプに必要な承認レベルを取得
function getRequiredApprovalLevel(projectType: ProjectScope): number {
  const levelMap = {
    [ProjectScope.TEAM]: 2,
    [ProjectScope.DEPARTMENT]: 4,
    [ProjectScope.FACILITY]: 7,
    [ProjectScope.ORGANIZATION]: 8,
    [ProjectScope.STRATEGIC]: 8
  };
  
  return levelMap[projectType] || 1;
}

// プロフィールベースの推奨事項生成
export const generateProfileRecommendations = (userProfile: MedicalProfile) => {
  const recommendations: string[] = [];

  // プロフィール完成度に基づく推奨
  if (userProfile.profileCompleteRate < 80) {
    recommendations.push('プロフィールを充実させて、チームメンバーとの交流を深めましょう');
  }

  // 経験年数に基づく推奨
  if (userProfile.totalExperience >= 5 && userProfile.permissionLevel < 3) {
    recommendations.push('豊富な経験を活かして、チームリーダーを目指してみませんか？');
  }

  // 趣味に基づく推奨
  if (userProfile.hobbies && userProfile.hobbies.length > 0) {
    recommendations.push('共通の趣味を持つ職員とサークル活動を始めてみましょう');
  }

  return recommendations;
};