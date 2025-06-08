// プロジェクト化スコアリング計算エンジン - 参照HTMLの計算ロジックを完全実装

export interface EngagementData {
  userId: string;
  level: 'strongly-support' | 'support' | 'neutral' | 'oppose' | 'strongly-oppose';
  timestamp: Date;
}

export interface UserWeight {
  userId: string;
  weight: number;
  role: string;
}

export interface ProjectStatus {
  level: 'PENDING' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION';
  achieved: boolean;
  currentScore?: number;
  threshold?: number;
  nextThreshold?: number;
  remainingPoints?: number;
  progressPercentage?: number;
}

export class ProjectScoringEngine {
  // 参照HTMLで使用されている閾値を完全再現
  private readonly thresholds = {
    DEPARTMENT: 200,    // 部署内プロジェクト
    FACILITY: 400,      // 施設内プロジェクト  
    ORGANIZATION: 800   // 法人内プロジェクト
  };
  
  // エンゲージメントレベルごとの重み付け（参照HTML準拠）
  private readonly weightMultipliers = {
    'strongly-support': 10.0,
    'support': 5.0,
    'neutral': 2.0,
    'oppose': 1.0,
    'strongly-oppose': 0.5
  };
  
  // 役職別の重み付け
  private readonly roleWeights = {
    director: 3.0,      // 役員
    manager: 2.5,       // 管理者
    chief: 2.0,         // 主任・係長
    employee: 1.0       // 一般職員
  };
  
  calculateProjectScore(
    engagements: EngagementData[], 
    userWeights: Record<string, UserWeight>
  ): number {
    let totalScore = 0;
    
    engagements.forEach(engagement => {
      const baseWeight = this.weightMultipliers[engagement.level];
      const userInfo = userWeights[engagement.userId];
      const roleWeight = userInfo ? this.roleWeights[userInfo.role as keyof typeof this.roleWeights] || 1.0 : 1.0;
      
      totalScore += baseWeight * roleWeight;
    });
    
    // 1小数点で表示（参照HTML準拠）
    return Math.round(totalScore * 10) / 10;
  }
  
  getProjectStatus(
    score: number, 
    postType: 'improvement' | 'community' | 'report' = 'improvement'
  ): ProjectStatus {
    // 投稿タイプ別の閾値調整
    const typeMultiplier = {
      improvement: 1.0,      // 改善提案は標準
      community: 0.8,        // コミュニティは少し低い閾値
      report: 1.2           // 公益通報は高い閾値
    };
    
    const adjustedThresholds = {
      DEPARTMENT: this.thresholds.DEPARTMENT * typeMultiplier[postType],
      FACILITY: this.thresholds.FACILITY * typeMultiplier[postType],
      ORGANIZATION: this.thresholds.ORGANIZATION * typeMultiplier[postType]
    };
    
    // 達成済みレベルを判定
    if (score >= adjustedThresholds.ORGANIZATION) {
      return { 
        level: 'ORGANIZATION', 
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.ORGANIZATION 
      };
    } else if (score >= adjustedThresholds.FACILITY) {
      return { 
        level: 'FACILITY', 
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.FACILITY 
      };
    } else if (score >= adjustedThresholds.DEPARTMENT) {
      return { 
        level: 'DEPARTMENT', 
        achieved: true, 
        currentScore: score,
        threshold: adjustedThresholds.DEPARTMENT 
      };
    }
    
    // 次の閾値までの進捗を計算
    const nextThreshold = score < adjustedThresholds.DEPARTMENT ? 
      adjustedThresholds.DEPARTMENT : 
      score < adjustedThresholds.FACILITY ? 
        adjustedThresholds.FACILITY : 
        adjustedThresholds.ORGANIZATION;
    
    const remainingPoints = Math.round((nextThreshold - score) * 10) / 10;
    const progressPercentage = Math.round((score / nextThreshold) * 1000) / 10;
    
    return { 
      level: 'PENDING', 
      achieved: false, 
      currentScore: score,
      nextThreshold,
      remainingPoints,
      progressPercentage
    };
  }
  
  getThresholdName(threshold: number): string {
    if (threshold <= this.thresholds.DEPARTMENT) return '部署内';
    if (threshold <= this.thresholds.FACILITY) return '施設内';
    return '法人内';
  }
  
  // デモ用のダミーユーザー重み生成
  static generateDemoUserWeights(userCount: number): Record<string, UserWeight> {
    const weights: Record<string, UserWeight> = {};
    const roles = ['employee', 'chief', 'manager', 'director'];
    const roleDistribution = [0.7, 0.2, 0.08, 0.02]; // 職員構成比
    
    for (let i = 0; i < userCount; i++) {
      const random = Math.random();
      let role = 'employee';
      let cumulative = 0;
      
      for (let j = 0; j < roleDistribution.length; j++) {
        cumulative += roleDistribution[j];
        if (random <= cumulative) {
          role = roles[j];
          break;
        }
      }
      
      weights[`user_${i}`] = {
        userId: `user_${i}`,
        weight: 1.0,
        role
      };
    }
    
    return weights;
  }
}