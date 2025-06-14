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
  // 見直し版閾値設定（段階的昇格対応）
  private readonly baseThresholds = {
    TEAM: 50,           // チーム内（昇格なし）
    DEPARTMENT: 100,    // 部署内→施設内昇格可能
    FACILITY: 300,      // 施設内→法人内昇格可能  
    ORGANIZATION: 600   // 法人内（最終）
  };
  
  // エンゲージメントレベルごとの重み付け（参照HTML準拠）
  private readonly weightMultipliers = {
    'strongly-support': 10.0,
    'support': 5.0,
    'neutral': 2.0,
    'oppose': 1.0,
    'strongly-oppose': 0.5
  };
  
  // 8段階権限レベル別の重み付け
  private readonly permissionLevelWeights = {
    [PermissionLevel.LEVEL_1]: 1.0,    // 一般従業員
    [PermissionLevel.LEVEL_2]: 1.5,    // チーフ・主任
    [PermissionLevel.LEVEL_3]: 2.0,    // 係長・マネージャー
    [PermissionLevel.LEVEL_4]: 2.5,    // 課長
    [PermissionLevel.LEVEL_5]: 3.0,    // 人財統括本部部門長
    [PermissionLevel.LEVEL_6]: 3.5,    // 人財統括本部統括管理部門長
    [PermissionLevel.LEVEL_7]: 4.0,    // 部長・本部長
    [PermissionLevel.LEVEL_8]: 5.0     // 役員・経営層
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
    
    // 達成済みレベルを判定
    if (score >= adjustedThresholds.STRATEGIC) {
      return { 
        level: 'STRATEGIC', 
        scope: ProjectScope.STRATEGIC,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.STRATEGIC,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_8
      };
    } else if (score >= adjustedThresholds.ORGANIZATION) {
      return { 
        level: 'ORGANIZATION', 
        scope: ProjectScope.ORGANIZATION,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.ORGANIZATION,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_8
      };
    } else if (score >= adjustedThresholds.FACILITY) {
      return { 
        level: 'FACILITY', 
        scope: ProjectScope.FACILITY,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.FACILITY,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_7
      };
    } else if (score >= adjustedThresholds.DEPARTMENT) {
      return { 
        level: 'DEPARTMENT', 
        scope: ProjectScope.DEPARTMENT,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.DEPARTMENT,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_4
      };
    } else if (score >= adjustedThresholds.TEAM) {
      return { 
        level: 'TEAM', 
        scope: ProjectScope.TEAM,
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.TEAM,
        displayStage: 5,
        requiredPermissionLevel: PermissionLevel.LEVEL_2
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
  
  // プロジェクトスコープから必要な権限レベルを取得
  getRequiredPermissionLevel(scope: ProjectScope): PermissionLevel {
    const scopeToPermissionLevel: Record<ProjectScope, PermissionLevel> = {
      [ProjectScope.TEAM]: PermissionLevel.LEVEL_2,
      [ProjectScope.DEPARTMENT]: PermissionLevel.LEVEL_4,
      [ProjectScope.FACILITY]: PermissionLevel.LEVEL_7,
      [ProjectScope.ORGANIZATION]: PermissionLevel.LEVEL_8,
      [ProjectScope.STRATEGIC]: PermissionLevel.LEVEL_8
    };
    
    return scopeToPermissionLevel[scope];
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