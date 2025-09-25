// ハイブリッド投票システム - 18段階権限対応の新設計
import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';

export interface VoterProfile {
  userId: string;
  permissionLevel: PermissionLevel | SpecialPermissionLevel; // 18段階権限レベル
  profession?: '医師' | '看護師' | '介護職' | '事務職' | 'その他';
  experienceYears?: number;
  certifications?: string[]; // 認定看護師、専門医など
}

export interface VoteData {
  voterId: string;
  voteType: 'strongly-support' | 'support' | 'neutral' | 'oppose' | 'strongly-oppose';
  timestamp: Date;
  voterProfile: VoterProfile;
}

export interface ProjectLevel {
  level: 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';
  label: string;
  icon: string;
  scoreRange: string;
  description: string;
}

export class HybridVotingSystem {
  // 新設計: 6段階プロジェクトレベル
  private readonly projectLevels: ProjectLevel[] = [
    { level: 'PENDING', label: '検討中', icon: '💭', scoreRange: '0-29点', description: '検討中' },
    { level: 'DEPT_REVIEW', label: '部署検討', icon: '📋', scoreRange: '30-49点', description: '部署検討' },
    { level: 'DEPT_AGENDA', label: '部署議題', icon: '👥', scoreRange: '50-99点', description: '部署議題' },
    { level: 'FACILITY_AGENDA', label: '施設議題', icon: '🏥', scoreRange: '100-299点', description: '施設議題（委員会提出）' },
    { level: 'CORP_REVIEW', label: '法人検討', icon: '🏢', scoreRange: '300-599点', description: '法人検討' },
    { level: 'CORP_AGENDA', label: '法人議題', icon: '🏛️', scoreRange: '600点以上', description: '法人議題（理事会提出）' }
  ];

  // 18段階権限レベル重み（1.0〜5.0倍）
  private readonly permissionWeights: Record<PermissionLevel | SpecialPermissionLevel, number> = {
    [PermissionLevel.LEVEL_1]: 1.0,   // 新人（試用期間）
    [PermissionLevel.LEVEL_2]: 1.1,   // 若手（1-2年目）
    [PermissionLevel.LEVEL_3]: 1.2,   // 中堅（3-5年目）
    [PermissionLevel.LEVEL_4]: 1.3,   // ベテラン（6-10年目）
    [PermissionLevel.LEVEL_5]: 1.5,   // シニア（11年目以上）
    [PermissionLevel.LEVEL_6]: 1.8,   // 主任
    [PermissionLevel.LEVEL_7]: 2.0,   // 係長
    [PermissionLevel.LEVEL_8]: 2.3,   // 師長
    [PermissionLevel.LEVEL_9]: 2.5,   // 課長補佐
    [PermissionLevel.LEVEL_10]: 2.8,  // 部長・課長
    [PermissionLevel.LEVEL_11]: 3.0,  // 事務長
    [PermissionLevel.LEVEL_12]: 3.5,  // 副院長
    [PermissionLevel.LEVEL_13]: 4.0,  // 院長
    [PermissionLevel.LEVEL_14]: 2.5,  // 人事部門員
    [PermissionLevel.LEVEL_15]: 2.8,  // キャリア支援
    [PermissionLevel.LEVEL_16]: 3.5,  // 各部門長
    [PermissionLevel.LEVEL_17]: 4.5,  // 統括管理部門長
    [PermissionLevel.LEVEL_18]: 5.0,  // 理事長
    [SpecialPermissionLevel.LEVEL_X]: 3.0 // システム管理者
  };

  // 職種重み
  private readonly professionWeights = {
    '医師': 3.0,
    '看護師': 2.5,
    '介護職': 2.0,
    '事務職': 1.0,
    'その他': 1.0
  };

  // 投票基礎点
  private readonly voteBaseScores = {
    'strongly-support': 10,   // 強く賛成
    'support': 5,             // 賛成
    'neutral': 0,             // 中立
    'oppose': -5,             // 反対
    'strongly-oppose': -10    // 強く反対
  };

  /**
   * ハイブリッド投票システムによるスコア計算
   * 計算式: 投票基礎点 × 権限レベル重み × (職種重み + 経験ボーナス + 資格加算) × カテゴリ調整
   */
  calculateVoteScore(vote: VoteData, proposalCategory?: string): number {
    const baseScore = this.voteBaseScores[vote.voteType];
    const permissionWeight = this.permissionWeights[vote.voterProfile.permissionLevel];

    // 職種重み計算
    const professionWeight = vote.voterProfile.profession
      ? this.professionWeights[vote.voterProfile.profession]
      : 1.0;

    // 経験ボーナス（5年毎に+0.2、最大1.0）
    const experienceBonus = Math.min(
      Math.floor((vote.voterProfile.experienceYears || 0) / 5) * 0.2,
      1.0
    );

    // 資格加算
    const certificationBonus = this.calculateCertificationBonus(vote.voterProfile.certifications);

    // カテゴリ調整（提案カテゴリによる重み付け）
    const categoryMultiplier = this.getCategoryMultiplier(proposalCategory, vote.voterProfile.profession);

    // 最終スコア計算
    const finalScore = Math.abs(baseScore) * permissionWeight *
                      (professionWeight + experienceBonus + certificationBonus) *
                      categoryMultiplier;

    // 反対票の場合は負の値として扱う（議論促進のため）
    return baseScore < 0 ? -finalScore : finalScore;
  }

  /**
   * 資格加算の計算
   */
  private calculateCertificationBonus(certifications?: string[]): number {
    if (!certifications || certifications.length === 0) return 0;

    let bonus = 0;
    certifications.forEach(cert => {
      if (cert.includes('認定看護師')) bonus += 0.3;
      if (cert.includes('専門医')) bonus += 0.5;
      if (cert.includes('指導医')) bonus += 0.4;
      if (cert.includes('管理栄養士')) bonus += 0.2;
      if (cert.includes('認定薬剤師')) bonus += 0.3;
    });

    return Math.min(bonus, 1.0); // 最大1.0まで
  }

  /**
   * カテゴリ調整係数の取得
   */
  private getCategoryMultiplier(category?: string, profession?: string): number {
    if (!category || !profession) return 1.0;

    // カテゴリと職種の相性による調整
    const adjustments: Record<string, Record<string, number>> = {
      '医療安全': {
        '医師': 1.5,
        '看護師': 1.4,
        '介護職': 1.2,
        '事務職': 1.0
      },
      '業務改善': {
        '医師': 1.2,
        '看護師': 1.3,
        '介護職': 1.3,
        '事務職': 1.4
      },
      'コミュニケーション': {
        '医師': 1.0,
        '看護師': 1.2,
        '介護職': 1.3,
        '事務職': 1.2
      },
      'イノベーション': {
        '医師': 1.4,
        '看護師': 1.2,
        '介護職': 1.0,
        '事務職': 1.3
      },
      '戦略提案': {
        '医師': 1.3,
        '看護師': 1.1,
        '介護職': 1.0,
        '事務職': 1.5
      }
    };

    return adjustments[category]?.[profession] || 1.0;
  }

  /**
   * 部署規模による閾値調整
   */
  getDepartmentSizeMultiplier(departmentSize: number): number {
    if (departmentSize <= 5) return 0.4;      // 小規模部署
    if (departmentSize <= 15) return 0.6;     // 中規模部署
    if (departmentSize <= 30) return 0.8;     // 大規模部署
    return 1.0;                                // 超大規模部署
  }

  /**
   * 現在のプロジェクトレベルを取得
   */
  getProjectLevel(totalScore: number): ProjectLevel {
    if (totalScore >= 600) return this.projectLevels[5];  // 法人議題
    if (totalScore >= 300) return this.projectLevels[4];  // 法人検討
    if (totalScore >= 100) return this.projectLevels[3];  // 施設議題
    if (totalScore >= 50) return this.projectLevels[2];   // 部署議題
    if (totalScore >= 30) return this.projectLevels[1];   // 部署検討
    return this.projectLevels[0];                         // 検討中
  }

  /**
   * 次のレベルまでの必要ポイント計算
   */
  getPointsToNextLevel(currentScore: number): { nextLevel: string; requiredPoints: number } | null {
    if (currentScore >= 600) return null; // 最高レベル達成済み

    const thresholds = [
      { level: '部署検討', threshold: 30 },
      { level: '部署議題', threshold: 50 },
      { level: '施設議題', threshold: 100 },
      { level: '法人検討', threshold: 300 },
      { level: '法人議題', threshold: 600 }
    ];

    for (const { level, threshold } of thresholds) {
      if (currentScore < threshold) {
        return {
          nextLevel: level,
          requiredPoints: threshold - currentScore
        };
      }
    }

    return null;
  }

  /**
   * 複数の投票からの総合スコア計算
   */
  calculateTotalScore(votes: VoteData[], proposalCategory?: string, departmentSize?: number): {
    totalScore: number;
    projectLevel: ProjectLevel;
    nextLevelInfo: { nextLevel: string; requiredPoints: number } | null;
    voterBreakdown: {
      supportCount: number;
      opposeCount: number;
      neutralCount: number;
      consensusRate: number;
    };
  } {
    let totalScore = 0;
    let supportCount = 0;
    let opposeCount = 0;
    let neutralCount = 0;

    // 各投票のスコアを計算
    votes.forEach(vote => {
      const voteScore = this.calculateVoteScore(vote, proposalCategory);
      totalScore += voteScore;

      // 投票タイプ別カウント
      if (vote.voteType === 'strongly-support' || vote.voteType === 'support') {
        supportCount++;
      } else if (vote.voteType === 'strongly-oppose' || vote.voteType === 'oppose') {
        opposeCount++;
      } else {
        neutralCount++;
      }
    });

    // 部署規模による調整
    if (departmentSize) {
      totalScore *= this.getDepartmentSizeMultiplier(departmentSize);
    }

    // 最終スコアは0以上に制限
    totalScore = Math.max(0, totalScore);

    // 納得率計算（賛成票の割合）
    const consensusRate = votes.length > 0
      ? Math.round((supportCount / votes.length) * 100)
      : 0;

    return {
      totalScore: Math.round(totalScore),
      projectLevel: this.getProjectLevel(totalScore),
      nextLevelInfo: this.getPointsToNextLevel(totalScore),
      voterBreakdown: {
        supportCount,
        opposeCount,
        neutralCount,
        consensusRate
      }
    };
  }
}

// シングルトンインスタンス
export const hybridVotingSystem = new HybridVotingSystem();