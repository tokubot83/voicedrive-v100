// 経験年数・投票重み計算エンジン
import { PROFESSIONS } from '../data/medical/professions';
import { POSITIONS } from '../data/medical/positions';
import { PermissionLevel } from '../permissions/types/PermissionTypes';

export class ExperienceCalculationEngine {
  private currentDate: Date;

  constructor() {
    this.currentDate = new Date();
  }

  // 経験年数計算
  calculateExperience(hireDate: string, previousExperience: number = 0) {
    const hire = new Date(hireDate);
    const monthsDiff = (this.currentDate.getFullYear() - hire.getFullYear()) * 12 + 
                      (this.currentDate.getMonth() - hire.getMonth());
    
    const currentExperience = Math.max(0, Math.floor(monthsDiff / 12));
    const totalExperience = currentExperience + previousExperience;
    
    return {
      currentExperience,
      totalExperience,
      monthsInCurrentPosition: monthsDiff % 12
    };
  }

  // 投票重み計算
  calculateVotingWeight(profession: string, position: string, totalExperience: number): number {
    const professionData = PROFESSIONS[profession];
    const positionData = POSITIONS[position];
    
    if (!professionData || !positionData) {
      return 1.0; // デフォルト重み
    }

    // 基本重み（職種）
    let baseWeight = professionData.baseVotingWeight;
    
    // 役職による乗数
    const positionMultiplier = positionData.votingWeightMultiplier;
    
    // 経験による加算（5年ごとに0.1加算、最大1.0まで）
    const experienceBonus = Math.min(1.0, Math.floor(totalExperience / 5) * 0.1);
    
    // 最終計算
    const finalWeight = (baseWeight + experienceBonus) * positionMultiplier;
    
    return Math.round(finalWeight * 100) / 100; // 小数点2位まで
  }

  // 権限レベル決定
  determinePermissionLevel(position: string, facility: string, department: string): PermissionLevel {
    const positionData = POSITIONS[position];
    
    if (!positionData) {
      return PermissionLevel.LEVEL_1; // デフォルト
    }
    
    // 基本的には役職で決定、但し施設・部署により調整の可能性
    let level = positionData.permissionLevel;
    
    // 特別な調整ロジック（必要に応じて）
    if (facility === 'kohara_hospital' && position === 'ward_manager') {
      // 小原病院の病棟師長は特別権限
      level = PermissionLevel.LEVEL_6;
    }
    
    return level;
  }

  // 承認権限レベル取得
  getApprovalAuthority(position: string): string {
    const positionData = POSITIONS[position];
    return positionData?.approvalAuthority || 'basic';
  }

  // プロフィール完成度計算
  calculateProfileCompleteness(profile: any): number {
    let completedFields = 0;
    const totalFields = 10; // チェックするフィールド数

    // 必須フィールドのチェック
    if (profile.name) completedFields++;
    if (profile.furigana) completedFields++;
    if (profile.facility) completedFields++;
    if (profile.department) completedFields++;
    if (profile.profession) completedFields++;
    if (profile.position) completedFields++;
    if (profile.hireDate) completedFields++;
    
    // オプションフィールドのチェック
    if (profile.motto) completedFields++;
    if (profile.selfIntroduction) completedFields++;
    if (profile.hobbies && profile.hobbies.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }
}