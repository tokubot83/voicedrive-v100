import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';
import { ProposalStatus } from './ProposalEscalationEngine';

// ========== 型定義 ==========
export interface VotingPermission {
  canVote: boolean;
  reason: string;
  scope: 'department' | 'facility' | 'corporation' | 'none';
  weight: number;
}

export interface VotingContext {
  userLevel: PermissionLevel | SpecialPermissionLevel;
  userDepartment: string;
  userFacility: string;
  proposalDepartment: string;
  proposalFacility: string;
  proposalScore: number;
  proposalCategory: string;
}

export interface VotingStatistics {
  totalVoters: number;
  departmentVoters: number;
  facilityVoters: number;
  corporationVoters: number;
  averageWeight: number;
  highestWeight: number;
}

// ========== 投票権限マトリックスサービス ==========
export class VotingPermissionMatrix {

  /**
   * 投票権限を判定
   */
  determineVotingPermission(context: VotingContext): VotingPermission {
    
    // システム管理者は常に投票可能
    if (context.userLevel === SpecialPermissionLevel.LEVEL_X) {
      return {
        canVote: true,
        reason: 'システム管理者権限',
        scope: 'corporation',
        weight: 10.0
      };
    }
    
    // スコアに基づく投票範囲の判定
    const votingScope = this.determineVotingScope(context.proposalScore);
    
    // ユーザーが投票可能かチェック
    const permission = this.checkPermission(context, votingScope);
    
    // 重み係数の計算
    const weight = this.calculateVoteWeight(context);
    
    return {
      ...permission,
      weight
    };
  }

  /**
   * スコアに基づく投票範囲の決定
   */
  private determineVotingScope(score: number): 'department' | 'facility' | 'corporation' {
    if (score < 100) {
      return 'department';  // 部署内のみ
    } else if (score < 600) {
      return 'facility';    // 施設全体
    } else {
      return 'corporation'; // 法人全体
    }
  }

  /**
   * 投票権限のチェック
   */
  private checkPermission(
    context: VotingContext,
    votingScope: 'department' | 'facility' | 'corporation'
  ): Omit<VotingPermission, 'weight'> {
    
    const userLevel = context.userLevel as PermissionLevel;
    
    // レベル1未満は投票不可
    if (userLevel < PermissionLevel.LEVEL_1) {
      return {
        canVote: false,
        reason: '権限レベルが不足しています',
        scope: 'none'
      };
    }
    
    // 投票範囲に基づく判定
    switch (votingScope) {
      case 'department':
        return this.checkDepartmentVoting(context, userLevel);
      
      case 'facility':
        return this.checkFacilityVoting(context, userLevel);
      
      case 'corporation':
        return this.checkCorporationVoting(context, userLevel);
      
      default:
        return {
          canVote: false,
          reason: '投票範囲が不明です',
          scope: 'none'
        };
    }
  }

  /**
   * 部署レベル投票の権限チェック
   */
  private checkDepartmentVoting(
    context: VotingContext,
    userLevel: PermissionLevel
  ): Omit<VotingPermission, 'weight'> {
    
    // 同じ部署の職員のみ投票可能
    if (context.userDepartment === context.proposalDepartment) {
      return {
        canVote: true,
        reason: '同じ部署の提案',
        scope: 'department'
      };
    }
    
    // 管理職（レベル5以上）は他部署でも投票可能
    if (userLevel >= PermissionLevel.LEVEL_5) {
      return {
        canVote: true,
        reason: '管理職権限による投票',
        scope: 'department'
      };
    }
    
    return {
      canVote: false,
      reason: '他部署の提案には投票できません',
      scope: 'none'
    };
  }

  /**
   * 施設レベル投票の権限チェック
   */
  private checkFacilityVoting(
    context: VotingContext,
    userLevel: PermissionLevel
  ): Omit<VotingPermission, 'weight'> {
    
    // 同じ施設の職員は投票可能
    if (context.userFacility === context.proposalFacility) {
      return {
        canVote: true,
        reason: '同じ施設の提案',
        scope: 'facility'
      };
    }
    
    // 法人人事部（レベル14以上）は他施設でも投票可能
    if (userLevel >= PermissionLevel.LEVEL_14) {
      return {
        canVote: true,
        reason: '法人人事部権限による投票',
        scope: 'facility'
      };
    }
    
    // 経営層（レベル12以上）は他施設でも投票可能
    if (userLevel >= PermissionLevel.LEVEL_12) {
      return {
        canVote: true,
        reason: '経営層権限による投票',
        scope: 'facility'
      };
    }
    
    return {
      canVote: false,
      reason: '他施設の提案には投票できません',
      scope: 'none'
    };
  }

  /**
   * 法人レベル投票の権限チェック
   */
  private checkCorporationVoting(
    context: VotingContext,
    userLevel: PermissionLevel
  ): Omit<VotingPermission, 'weight'> {
    
    // レベル3以上の全職員が投票可能（中堅以上）
    if (userLevel >= PermissionLevel.LEVEL_3) {
      return {
        canVote: true,
        reason: '法人レベルの重要提案',
        scope: 'corporation'
      };
    }
    
    // 特定カテゴリは全職員が投票可能
    const publicCategories = ['医療安全', '患者ケア', '感染対策'];
    if (publicCategories.includes(context.proposalCategory)) {
      return {
        canVote: true,
        reason: '全職員関連のカテゴリ',
        scope: 'corporation'
      };
    }
    
    return {
      canVote: false,
      reason: '法人レベルの提案には中堅以上の職員のみ投票可能です',
      scope: 'none'
    };
  }

  /**
   * 投票の重み係数を計算
   */
  private calculateVoteWeight(context: VotingContext): number {
    const userLevel = context.userLevel;
    
    // システム管理者
    if (userLevel === SpecialPermissionLevel.LEVEL_X) {
      return 10.0;
    }
    
    // 通常の権限レベルに基づく重み
    const level = userLevel as PermissionLevel;
    
    // 基本重み（権限レベルに応じて）
    let baseWeight = 1.0;
    
    if (level >= PermissionLevel.LEVEL_18) {
      baseWeight = 5.0;  // 理事長
    } else if (level >= PermissionLevel.LEVEL_17) {
      baseWeight = 3.5;  // 戦略企画部門長
    } else if (level >= PermissionLevel.LEVEL_16) {
      baseWeight = 3.0;  // 戦略企画部門員
    } else if (level >= PermissionLevel.LEVEL_14) {
      baseWeight = 2.0;  // 人事部門員
    } else if (level >= PermissionLevel.LEVEL_12) {
      baseWeight = 3.5;  // 副院長
    } else if (level >= PermissionLevel.LEVEL_10) {
      baseWeight = 2.8;  // 部長
    } else if (level >= PermissionLevel.LEVEL_8) {
      baseWeight = 2.3;  // 師長
    } else if (level >= PermissionLevel.LEVEL_6) {
      baseWeight = 1.8;  // 主任
    } else if (level >= PermissionLevel.LEVEL_5) {
      baseWeight = 1.5;  // 副主任
    } else if (level >= PermissionLevel.LEVEL_4) {
      baseWeight = 1.3;  // ベテラン
    } else if (level >= PermissionLevel.LEVEL_3) {
      baseWeight = 1.2;  // 中堅
    } else if (level >= PermissionLevel.LEVEL_2) {
      baseWeight = 1.1;  // 若手
    }
    
    // 同じ部署なら1.2倍
    if (context.userDepartment === context.proposalDepartment) {
      baseWeight *= 1.2;
    }
    
    // 同じ施設なら1.1倍
    if (context.userFacility === context.proposalFacility) {
      baseWeight *= 1.1;
    }
    
    return Math.round(baseWeight * 10) / 10; // 小数点第1位まで
  }

  /**
   * 投票統計の集計
   */
  calculateVotingStatistics(
    votes: Array<{ userId: string; weight: number; scope: string }>
  ): VotingStatistics {
    
    const stats = {
      totalVoters: votes.length,
      departmentVoters: votes.filter(v => v.scope === 'department').length,
      facilityVoters: votes.filter(v => v.scope === 'facility').length,
      corporationVoters: votes.filter(v => v.scope === 'corporation').length,
      averageWeight: 0,
      highestWeight: 0
    };
    
    if (votes.length > 0) {
      const weights = votes.map(v => v.weight);
      stats.averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
      stats.highestWeight = Math.max(...weights);
    }
    
    return stats;
  }

  /**
   * 投票可能な職員リストの生成
   */
  async getEligibleVoters(
    proposalStatus: ProposalStatus,
    allStaff: Array<any>
  ): Promise<Array<{ staffId: string; name: string; canVote: boolean; reason: string }>> {
    
    const eligibleVoters = [];
    
    for (const staff of allStaff) {
      const context: VotingContext = {
        userLevel: staff.accountLevel,
        userDepartment: staff.department,
        userFacility: staff.facility,
        proposalDepartment: proposalStatus.id.split('_')[0], // 仮実装
        proposalFacility: '小原病院', // 仮実装
        proposalScore: proposalStatus.currentScore,
        proposalCategory: 'medical_safety' // 仮実装
      };
      
      const permission = this.determineVotingPermission(context);
      
      eligibleVoters.push({
        staffId: staff.staffId,
        name: staff.name,
        canVote: permission.canVote,
        reason: permission.reason
      });
    }
    
    return eligibleVoters;
  }

  /**
   * 権限レベル別の投票分布
   */
  analyzeVotingDistribution(
    votes: Array<{ userLevel: number; voteType: string; weight: number }>
  ): Record<string, { count: number; totalWeight: number }> {
    
    const distribution: Record<string, { count: number; totalWeight: number }> = {};
    
    // レベル別グループ
    const levelGroups = {
      '一般職員 (1-4)': [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5],
      '役職者 (5-11)': [5, 6, 7, 8, 9, 10, 11],
      '経営層 (12-13)': [12, 13],
      '人事部 (14-17)': [14, 15, 16, 17],
      '最高経営層 (18)': [18]
    };
    
    // 初期化
    Object.keys(levelGroups).forEach(group => {
      distribution[group] = { count: 0, totalWeight: 0 };
    });
    
    // 集計
    votes.forEach(vote => {
      for (const [group, levels] of Object.entries(levelGroups)) {
        if (levels.includes(vote.userLevel)) {
          distribution[group].count++;
          distribution[group].totalWeight += vote.weight;
          break;
        }
      }
    });
    
    return distribution;
  }
}

// シングルトンインスタンス
export const votingPermissionMatrix = new VotingPermissionMatrix();