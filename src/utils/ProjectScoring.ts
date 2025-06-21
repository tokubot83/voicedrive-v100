// プロジェクト化スコアリング計算エンジン - 参照HTMLの計算ロジックを完全実装 (8段階権限システム対応)
import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';

export interface EngagementData {
  userId: string;
  level: 'strongly-support' | 'support' | 'neutral' | 'oppose' | 'strongly-oppose';
  timestamp: Date;
}

export interface UserWeight {
  userId: string;
  weight: number;
  role: string;
  permissionLevel?: PermissionLevel;
}

export interface ProjectStatus {
  level: 'PENDING' | 'TEAM' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'STRATEGIC';
  scope?: ProjectScope;
  achieved: boolean;
  currentScore?: number;
  threshold?: number;
  nextThreshold?: number;
  remainingPoints?: number;
  progressPercentage?: number;
  displayStage?: 1 | 2 | 3 | 4 | 5; // 段階表示用
  isNearComplete?: boolean; // 90%以上フラグ
  requiredPermissionLevel?: PermissionLevel; // 必要な承認権限レベル
}

export class ProjectScoringEngine {
  // 新マッピング対応閾値設定
  private readonly baseThresholds = {
    TEAM: 50,           // チームレベル（予算上限5万円）
    DEPARTMENT: 100,    // 部門レベル（予算上限20万円）
    FACILITY: 300,      // 施設レベル（予算上限1000万円）
    ORGANIZATION: 600,  // 法人レベル（予算上限2000万円）
    STRATEGIC: 1200     // 法人戦略レベル（予算無制限）
  };
  
  // エンゲージメントレベルごとの重み付け（参照HTML準拠）
  private readonly weightMultipliers = {
    'strongly-support': 10.0,
    'support': 5.0,
    'neutral': 2.0,
    'oppose': 1.0,
    'strongly-oppose': 0.5
  };
  
  // 13段階権限レベル別の重み付け（新マッピング対応）
  private readonly permissionLevelWeights = {
    [PermissionLevel.LEVEL_1]: 1.0,     // 一般従業員
    [PermissionLevel.LEVEL_2]: 1.5,     // チーフ・主任（チームレベル承認権限）
    [PermissionLevel.LEVEL_3]: 2.0,     // 係長・マネージャー（部門レベル承認権限）
    [PermissionLevel.LEVEL_4]: 2.5,     // 課長（施設レベル承認権限）
    [PermissionLevel.LEVEL_5]: 3.0,     // 人財統括本部戦略企画・統括管理部門（法人レベル承認権限）
    [PermissionLevel.LEVEL_6]: 3.2,     // 人財統括本部キャリア支援部門員
    [PermissionLevel.LEVEL_7]: 3.5,     // 人財統括本部キャリア支援部門長
    [PermissionLevel.LEVEL_8]: 4.0,     // 人財統括本部統括管理部門長
    [PermissionLevel.LEVEL_9]: 4.5,     // 部長・本部長
    [PermissionLevel.LEVEL_10]: 5.0,    // 人財統括本部各部門長
    [PermissionLevel.LEVEL_11]: 5.5,    // 人財統括本部統括管理部門長（レビュー権限）
    [PermissionLevel.LEVEL_12]: 6.0,    // 人財統括本部トップ（提案・オーバーライド権限）
    [PermissionLevel.LEVEL_13]: 10.0    // 理事長（最終承認権限）
  };
  
  // 旧システムとの互換性のための役職別重み付け
  private readonly roleWeights = {
    director: 4.0,      // 役員（レベル8相当）
    manager: 2.5,       // 管理者（レベル4相当）
    chief: 2.0,         // 主任・係長（レベル3相当）
    employee: 1.0       // 一般職員（レベル1相当）
  };
  
  calculateProjectScore(
    engagements: EngagementData[], 
    userWeights: Record<string, UserWeight>
  ): number {
    let totalScore = 0;
    
    engagements.forEach(engagement => {
      const baseWeight = this.weightMultipliers[engagement.level];
      const userInfo = userWeights[engagement.userId];
      
      // 権限レベルベースの重み付けを優先、なければ役職ベース
      let userWeight = 1.0;
      if (userInfo) {
        if (userInfo.permissionLevel !== undefined) {
          userWeight = this.permissionLevelWeights[userInfo.permissionLevel];
        } else {
          userWeight = this.roleWeights[userInfo.role as keyof typeof this.roleWeights] || 1.0;
        }
      }
      
      totalScore += baseWeight * userWeight;
    });
    
    // 1小数点で表示（参照HTML準拠）
    return Math.round(totalScore * 10) / 10;
  }
  
  getProjectStatus(
    score: number, 
    postType: 'improvement' | 'community' | 'report' | 'operational' | 'communication' | 'innovation' | 'strategic' = 'improvement',
    organizationSize?: number,
    projectScope?: ProjectScope
  ): ProjectStatus {
    // 投稿タイプ別の閾値調整（4カテゴリ対応）
    const typeMultiplier = {
      // 従来タイプ
      improvement: 1.0,      // 改善提案は標準
      community: 0.8,        // コミュニティは少し低い閾値
      report: 1.2,          // 公益通報は高い閾値
      // 新4カテゴリ
      operational: 1.0,      // 業務改善は標準
      communication: 0.9,    // コミュニケーションは少し低め
      innovation: 1.3,       // イノベーションは高い閾値（慎重に）
      strategic: 1.5         // 戦略提案は最も高い閾値（管理職重視）
    };
    
    // 組織規模による調整
    const sizeMultiplier = organizationSize ? this.getSizeMultiplier(organizationSize, projectScope) : 1.0;
    
    const adjustedThresholds = {
      TEAM: this.baseThresholds.TEAM * typeMultiplier[postType] * sizeMultiplier,
      DEPARTMENT: this.baseThresholds.DEPARTMENT * typeMultiplier[postType] * sizeMultiplier,
      FACILITY: this.baseThresholds.FACILITY * typeMultiplier[postType] * sizeMultiplier,
      ORGANIZATION: this.baseThresholds.ORGANIZATION * typeMultiplier[postType] * sizeMultiplier,
      STRATEGIC: 1200 * typeMultiplier[postType] // 戦略的プロジェクトは固定
    };
    
    // 達成済みレベルを判定（新マッピング対応）
    if (score >= adjustedThresholds.STRATEGIC) {
      return { 
        level: 'STRATEGIC', 
        scope: ProjectScope.STRATEGIC,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.STRATEGIC,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_13 // 戦略レベルは理事長承認
      };
    } else if (score >= adjustedThresholds.ORGANIZATION) {
      return { 
        level: 'ORGANIZATION', 
        scope: ProjectScope.ORGANIZATION,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.ORGANIZATION,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_5 // 法人レベルは各施設のレベル5以上
      };
    } else if (score >= adjustedThresholds.FACILITY) {
      return { 
        level: 'FACILITY', 
        scope: ProjectScope.FACILITY,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.FACILITY,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_4 // 施設レベルは所属施設の課長全員
      };
    } else if (score >= adjustedThresholds.DEPARTMENT) {
      return { 
        level: 'DEPARTMENT', 
        scope: ProjectScope.DEPARTMENT,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.DEPARTMENT,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_3 // 部門レベルは係長以上
      };
    } else if (score >= adjustedThresholds.TEAM) {
      return { 
        level: 'TEAM', 
        scope: ProjectScope.TEAM,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.TEAM,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_2 // チームレベルは主任以上
      };
    }
    
    // 次の閾値までの進捗を計算
    const nextThreshold = score < adjustedThresholds.TEAM ?
      adjustedThresholds.TEAM :
      score < adjustedThresholds.DEPARTMENT ? 
        adjustedThresholds.DEPARTMENT : 
        score < adjustedThresholds.FACILITY ? 
          adjustedThresholds.FACILITY : 
          score < adjustedThresholds.ORGANIZATION ?
            adjustedThresholds.ORGANIZATION :
            adjustedThresholds.STRATEGIC;
    
    const remainingPoints = Math.round((nextThreshold - score) * 10) / 10;
    const progressPercentage = Math.round((score / nextThreshold) * 1000) / 10;
    
    // 段階を判定
    let displayStage: 1 | 2 | 3 | 4 = 1;
    let isNearComplete = false;
    
    if (score < 50) {
      displayStage = 1; // スコア50点未満
    } else if (progressPercentage >= 90) {
      displayStage = 4; // 90%以上
      isNearComplete = true;
    } else if (score >= 200) {
      displayStage = 3; // 200-399点（施設内プロジェクト向け）
    } else {
      displayStage = 2; // 50-199点（部署内プロジェクト向け）
    }
    
    return { 
      level: 'PENDING', 
      achieved: false, 
      currentScore: score,
      nextThreshold,
      remainingPoints,
      progressPercentage,
      displayStage,
      isNearComplete
    };
  }
  
  /**
   * 組織規模による閾値調整倍率を計算
   */
  private getSizeMultiplier(organizationSize: number, projectScope?: ProjectScope): number {
    // 基準組織規模（小原病院本院規模: 約400人）
    const baseOrganizationSize = 400;
    
    // プロジェクトスコープ別の調整係数
    const scopeAdjustments = {
      [ProjectScope.TEAM]: 0.8,        // チームは組織規模の影響小
      [ProjectScope.DEPARTMENT]: 1.0,  // 部署は標準
      [ProjectScope.FACILITY]: 1.2,   // 施設は組織規模の影響大
      [ProjectScope.ORGANIZATION]: 1.5, // 法人は最も影響大
      [ProjectScope.STRATEGIC]: 1.0    // 戦略は固定
    };
    
    // 基本倍率計算（対数スケール使用で急激な変化を抑制）
    const baseSizeRatio = organizationSize / baseOrganizationSize;
    const logMultiplier = Math.log(baseSizeRatio) / Math.log(2) * 0.3 + 1.0;
    
    // 0.5倍～2.0倍の範囲に制限
    const clampedMultiplier = Math.max(0.5, Math.min(2.0, logMultiplier));
    
    // スコープ別調整適用
    const scopeAdjustment = projectScope ? scopeAdjustments[projectScope] : 1.0;
    
    return Math.round(clampedMultiplier * scopeAdjustment * 100) / 100;
  }

  getThresholdName(threshold: number): string {
    if (threshold <= this.baseThresholds.TEAM) return 'チーム内';
    if (threshold <= this.baseThresholds.DEPARTMENT) return '部署内';
    if (threshold <= this.baseThresholds.FACILITY) return '施設内';
    if (threshold <= this.baseThresholds.ORGANIZATION) return '法人内';
    return '戦略的';
  }
  
  // プロジェクトスコープから必要な権限レベルを取得（新マッピング対応）
  getRequiredPermissionLevel(scope: ProjectScope): PermissionLevel {
    const scopeToPermissionLevel: Record<ProjectScope, PermissionLevel> = {
      [ProjectScope.TEAM]: PermissionLevel.LEVEL_2,        // チーフ・主任以上
      [ProjectScope.DEPARTMENT]: PermissionLevel.LEVEL_3,  // 係長・マネージャー以上
      [ProjectScope.FACILITY]: PermissionLevel.LEVEL_4,    // 課長以上（所属施設全員）
      [ProjectScope.ORGANIZATION]: PermissionLevel.LEVEL_5, // 各施設のレベル5以上
      [ProjectScope.STRATEGIC]: PermissionLevel.LEVEL_13   // 理事長
    };
    
    return scopeToPermissionLevel[scope];
  }
  
  // 予算上限を取得（新マッピング対応）
  getBudgetLimit(scope: ProjectScope): number {
    const scopeToBudgetLimit: Record<ProjectScope, number> = {
      [ProjectScope.TEAM]: 50000,        // 5万円
      [ProjectScope.DEPARTMENT]: 200000, // 20万円
      [ProjectScope.FACILITY]: 10000000, // 1000万円
      [ProjectScope.ORGANIZATION]: 20000000, // 2000万円
      [ProjectScope.STRATEGIC]: -1       // 無制限（-1で表現）
    };
    
    return scopeToBudgetLimit[scope];
  }
  
  // デモ用のダミーユーザー重み生成（8段階権限システム対応）
  static generateDemoUserWeights(userCount: number): Record<string, UserWeight> {
    const weights: Record<string, UserWeight> = {};
    const roles = ['employee', 'chief', 'manager', 'section_chief', 'hr_dept_head', 'hr_general_manager', 'director', 'executive'];
    const permissionLevels = [
      PermissionLevel.LEVEL_1,
      PermissionLevel.LEVEL_2,
      PermissionLevel.LEVEL_3,
      PermissionLevel.LEVEL_4,
      PermissionLevel.LEVEL_5,
      PermissionLevel.LEVEL_6,
      PermissionLevel.LEVEL_7,
      PermissionLevel.LEVEL_8
    ];
    // 8段階権限レベルの分布（組織の階層構造を反映）
    const levelDistribution = [0.60, 0.20, 0.10, 0.05, 0.02, 0.015, 0.01, 0.005];
    
    for (let i = 0; i < userCount; i++) {
      const random = Math.random();
      let role = 'employee';
      let permissionLevel = PermissionLevel.LEVEL_1;
      let cumulative = 0;
      
      for (let j = 0; j < levelDistribution.length; j++) {
        cumulative += levelDistribution[j];
        if (random <= cumulative) {
          role = roles[j];
          permissionLevel = permissionLevels[j];
          break;
        }
      }
      
      weights[`user_${i}`] = {
        userId: `user_${i}`,
        weight: 1.0,
        role,
        permissionLevel
      };
    }
    
    return weights;
  }
}