import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';

// ========== 型定義 ==========
export interface StaffCharacteristics {
  profession: string;
  experienceYears: number;
  age?: number;
  certifications?: string[];
}

export interface VoteCalculationResult {
  baseScore: number;
  accountLevelWeight: number;
  staffCharacteristicsWeight: number;
  categoryAdjustment: number;
  finalScore: number;
  breakdown: {
    professionWeight: number;
    experienceBonus: number;
    ageWisdom: number;
    specializationBonus: number;
  };
}

export interface CategoryMatrix {
  [profession: string]: {
    [category: string]: number;
  };
}

// ========== ハイブリッド投票計算クラス ==========
export class HybridVotingCalculator {

  // アカウントレベル重み（18段階対応）
  private readonly accountLevelWeights: Record<number, number> = {
    // 一般職員（経験年数別）
    1: 1.0,    // 新人
    1.5: 1.1,  // 新人（リーダー可）
    2: 1.1,    // 若手
    2.5: 1.2,  // 若手（リーダー可）
    3: 1.2,    // 中堅
    3.5: 1.3,  // 中堅（リーダー可）
    4: 1.3,    // ベテラン
    4.5: 1.4,  // ベテラン（リーダー可）

    // 役職者
    5: 1.5,    // 副主任
    6: 1.8,    // 主任
    7: 2.0,    // 副師長等
    8: 2.3,    // 師長等
    9: 2.5,    // 副部長
    10: 2.8,   // 部長
    11: 3.0,   // 事務長

    // 経営層
    12: 3.5,   // 副院長
    13: 4.0,   // 院長

    // 人事部
    14: 2.0,   // 人事部門員
    15: 2.5,   // 各部門長
    16: 3.0,   // 戦略企画部門員
    17: 3.5,   // 戦略企画部門長

    // 最高経営層
    18: 5.0    // 理事長等
  };

  // 職種別基本重み
  private readonly professionWeights: Record<string, number> = {
    '医師': 3.0,
    '歯科医師': 2.8,
    '薬剤師': 2.5,
    '看護師': 2.5,
    '准看護師': 2.0,
    '助産師': 2.5,
    '保健師': 2.3,
    '理学療法士': 2.0,
    '作業療法士': 2.0,
    '言語聴覚士': 2.0,
    '臨床検査技師': 2.0,
    '診療放射線技師': 2.0,
    '臨床工学技士': 2.0,
    '管理栄養士': 2.0,
    '社会福祉士': 2.0,
    '精神保健福祉士': 2.0,
    '介護福祉士': 1.8,
    '看護補助者': 1.5,
    '介護士': 1.5,
    '歯科衛生士': 1.5,
    '医療事務': 1.2,
    '事務職員': 1.0,
    'その他': 1.0
  };

  // カテゴリ×職種の相性マトリックス
  private readonly categoryMatrix: CategoryMatrix = {
    '医師': {
      '医療安全': 1.5,
      '診療改善': 1.5,
      '感染対策': 1.4,
      '患者ケア': 1.3,
      '業務改善': 1.2,
      'イノベーション': 1.3,
      'コミュニケーション': 1.0,
      '戦略提案': 1.2
    },
    '看護師': {
      '医療安全': 1.4,
      '患者ケア': 1.5,
      '感染対策': 1.4,
      '業務改善': 1.3,
      'コミュニケーション': 1.2,
      'チーム連携': 1.3,
      '教育研修': 1.2
    },
    '薬剤師': {
      '医療安全': 1.5,
      '薬剤管理': 1.5,
      '感染対策': 1.3,
      '業務改善': 1.2,
      'コスト削減': 1.3
    },
    'リハビリ職': { // 理学療法士、作業療法士、言語聴覚士
      'リハビリ改善': 1.5,
      '患者ケア': 1.4,
      'チーム連携': 1.3,
      '機器・設備': 1.2,
      '業務改善': 1.2
    },
    '事務職員': {
      '業務改善': 1.5,
      'システム改善': 1.4,
      'コスト削減': 1.3,
      '受付・接遇': 1.4,
      'コミュニケーション': 1.1,
      '戦略提案': 1.0
    }
  };

  // 投票ポイント定義
  private readonly votePoints: Record<string, number> = {
    '😍': 10,   // 強く賛成
    '😊': 5,    // 賛成
    '😐': 2,    // 中立
    '😕': 1,    // 反対
    '😠': 0.5   // 強く反対
  };

  /**
   * 投票の重みを計算
   */
  calculateVoteWeight(
    userLevel: PermissionLevel | SpecialPermissionLevel,
    staffCharacteristics: StaffCharacteristics,
    voteType: string,
    postCategory: string
  ): VoteCalculationResult {

    // システム管理者の特別処理
    if (userLevel === SpecialPermissionLevel.LEVEL_X) {
      return this.createSystemAdminResult(voteType);
    }

    // A: アカウントレベル重み
    const accountLevelWeight = this.getAccountLevelWeight(userLevel);

    // B: 職員特性重み
    const professionWeight = this.getProfessionWeight(staffCharacteristics.profession);
    const experienceBonus = this.getExperienceBonus(staffCharacteristics.experienceYears);
    const ageWisdom = this.getAgeWisdom(staffCharacteristics.age || 0);
    const specializationBonus = this.getSpecializationBonus(staffCharacteristics.certifications || []);

    const staffCharacteristicsWeight = professionWeight + experienceBonus + ageWisdom + specializationBonus;

    // C: カテゴリ調整
    const categoryAdjustment = this.getCategoryAdjustment(
      staffCharacteristics.profession,
      postCategory
    );

    // 最終スコア計算
    const baseScore = this.votePoints[voteType] || 0;
    const finalScore = baseScore * accountLevelWeight * staffCharacteristicsWeight * categoryAdjustment;

    return {
      baseScore,
      accountLevelWeight,
      staffCharacteristicsWeight,
      categoryAdjustment,
      finalScore,
      breakdown: {
        professionWeight,
        experienceBonus,
        ageWisdom,
        specializationBonus
      }
    };
  }

  /**
   * アカウントレベル重みを取得
   */
  private getAccountLevelWeight(level: PermissionLevel | SpecialPermissionLevel): number {
    if (typeof level === 'number') {
      return this.accountLevelWeights[level] || 1.0;
    }
    return 1.0;
  }

  /**
   * 職種重みを取得
   */
  private getProfessionWeight(profession: string): number {
    // リハビリ職の統一処理
    if (['理学療法士', '作業療法士', '言語聴覚士'].includes(profession)) {
      return this.professionWeights[profession] || 2.0;
    }
    return this.professionWeights[profession] || 1.0;
  }

  /**
   * 経験年数ボーナスを計算
   */
  private getExperienceBonus(years: number): number {
    // 5年ごとに0.2、最大1.0
    return Math.min(Math.floor(years / 5) * 0.2, 1.0);
  }

  /**
   * 年齢による知見を計算
   */
  private getAgeWisdom(age: number): number {
    if (age < 25) return 0;
    if (age < 35) return 0.1;
    if (age < 45) return 0.2;
    if (age < 55) return 0.3;
    if (age < 65) return 0.4;
    return 0.5;
  }

  /**
   * 専門資格ボーナスを計算
   */
  private getSpecializationBonus(certifications: string[]): number {
    let bonus = 0;

    certifications.forEach(cert => {
      if (cert.includes('認定看護師')) bonus += 0.3;
      if (cert.includes('専門看護師')) bonus += 0.4;
      if (cert.includes('専門医')) bonus += 0.5;
      if (cert.includes('指導医')) bonus += 0.5;
      if (cert.includes('認定薬剤師')) bonus += 0.3;
      if (cert.includes('専門薬剤師')) bonus += 0.4;
      if (cert.includes('認定理学療法士')) bonus += 0.3;
      if (cert.includes('認定作業療法士')) bonus += 0.3;
      if (cert.includes('認定言語聴覚士')) bonus += 0.3;
    });

    return Math.min(bonus, 0.5); // 最大0.5
  }

  /**
   * カテゴリ調整係数を取得
   */
  private getCategoryAdjustment(profession: string, category: string): number {
    // 職種カテゴリのマッピング
    let professionCategory = profession;

    if (['理学療法士', '作業療法士', '言語聴覚士'].includes(profession)) {
      professionCategory = 'リハビリ職';
    } else if (['医療事務', '事務職員'].includes(profession)) {
      professionCategory = '事務職員';
    }

    const matrix = this.categoryMatrix[professionCategory];
    if (!matrix) return 1.0;

    return matrix[category] || 1.0;
  }

  /**
   * システム管理者用の特別結果
   */
  private createSystemAdminResult(voteType: string): VoteCalculationResult {
    const baseScore = this.votePoints[voteType] || 0;
    return {
      baseScore,
      accountLevelWeight: 10.0, // 特別に高い重み
      staffCharacteristicsWeight: 1.0,
      categoryAdjustment: 1.0,
      finalScore: baseScore * 10.0,
      breakdown: {
        professionWeight: 1.0,
        experienceBonus: 0,
        ageWisdom: 0,
        specializationBonus: 0
      }
    };
  }

  /**
   * 投票計算のログ出力（透明性のため）
   */
  logVoteCalculation(
    userId: string,
    postId: string,
    result: VoteCalculationResult
  ): void {
    const log = {
      timestamp: new Date().toISOString(),
      userId,
      postId,
      calculation: {
        baseScore: result.baseScore,
        multipliers: {
          accountLevel: result.accountLevelWeight,
          staffCharacteristics: result.staffCharacteristicsWeight,
          categoryAdjustment: result.categoryAdjustment
        },
        breakdown: result.breakdown,
        finalScore: result.finalScore
      }
    };

    // 実際のログ出力処理
    console.log('[VoteCalculation]', JSON.stringify(log, null, 2));

    // 将来的にはデータベースに保存
    // await this.saveVoteLog(log);
  }
}

// シングルトンインスタンス
export const hybridVotingCalculator = new HybridVotingCalculator();