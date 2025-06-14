// AIAssistedMemberSelectionService - Phase 3 AI支援選定
// スキルマッチング・負荷分散最適化・パフォーマンス予測

import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';
import { HierarchicalUser } from '../types';
import { 
  MemberSelection, 
  MemberCandidate, 
  SelectionCriteria, 
  SelectionResult,
  MemberAssignment,
  MemberRole,
  ProfessionDistribution
} from '../types/memberSelection';
import CollaborativeMemberSelectionService from './CollaborativeMemberSelectionService';

// AI分析関連の型定義
export interface SkillProfile {
  userId: string;
  skills: SkillCategory[];
  experience: ExperienceLevel;
  certifications: Certification[];
  pastPerformance: PerformanceMetrics;
  learningCapability: number; // 0-100: 新しいスキルの習得能力
  collaborationScore: number; // 0-100: チーム協調性スコア
}

export interface SkillCategory {
  category: string;
  subSkills: SubSkill[];
  proficiencyLevel: number; // 0-100
  lastUsed?: Date;
  projectCount: number;
}

export interface SubSkill {
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience: number;
  projectApplications: string[]; // プロジェクトIDのリスト
}

export interface ExperienceLevel {
  totalYears: number;
  domainYears: Record<string, number>; // 分野別経験年数
  leadershipExperience: number; // リーダー経験年数
  crossFunctionalExperience: boolean;
}

export interface Certification {
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate?: Date;
  relevanceScore: number; // プロジェクトとの関連性スコア
}

export interface PerformanceMetrics {
  averageProjectScore: number; // 0-100
  completionRate: number; // 0-100
  timelineAdherence: number; // 0-100
  qualityScore: number; // 0-100
  innovationScore: number; // 0-100
  teamworkScore: number; // 0-100
}

// AI最適化関連
export interface OptimizationConstraints {
  mustIncludeSkills: string[];
  preferredSkills: string[];
  maxWorkloadPerMember: number; // パーセント
  minExperienceLevel: number; // 年数
  diversityTargets: DiversityTargets;
  budgetConstraints: BudgetConstraints;
}

export interface DiversityTargets {
  departmentDiversity: number; // 異なる部門の最小数
  experienceMix: { junior: number; mid: number; senior: number }; // 経験レベルの配分
  skillDiversity: number; // スキルの多様性指標
}

export interface BudgetConstraints {
  maxTotalCost: number;
  costPerMember: Record<string, number>; // メンバーごとのコスト
  overheadPercentage: number;
}

// AI推奨結果
export interface AIRecommendation {
  recommendedTeam: TeamComposition;
  alternativeTeams: TeamComposition[];
  insights: TeamInsight[];
  riskAssessment: RiskAssessment;
  successProbability: number; // 0-100
  optimizationScore: number; // 0-100
}

export interface TeamComposition {
  members: RecommendedMember[];
  totalScore: number;
  skillCoverage: number; // 0-100
  workloadBalance: number; // 0-100
  diversityScore: number; // 0-100
  estimatedCost: number;
  estimatedDuration: number; // 日数
}

export interface RecommendedMember {
  candidate: MemberCandidate;
  role: MemberRole;
  matchScore: number; // 0-100
  contribution: string[]; // このメンバーの主な貢献
  alternativeFor?: string; // 代替候補の場合、元のメンバーID
  workloadImpact: number; // 既存の作業負荷への影響
}

export interface TeamInsight {
  type: 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'RISK';
  category: 'SKILL' | 'WORKLOAD' | 'COLLABORATION' | 'EXPERIENCE' | 'COST';
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations?: string[];
}

export interface RiskAssessment {
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  risks: ProjectRisk[];
  mitigationStrategies: MitigationStrategy[];
}

export interface ProjectRisk {
  type: string;
  probability: number; // 0-100
  impact: number; // 0-100
  description: string;
  affectedAreas: string[];
}

export interface MitigationStrategy {
  riskType: string;
  strategy: string;
  cost: number;
  effectiveness: number; // 0-100
}

// 履歴データ分析
export interface HistoricalAnalysis {
  similarProjects: SimilarProject[];
  successPatterns: SuccessPattern[];
  failurePatterns: FailurePattern[];
  bestPractices: string[];
}

export interface SimilarProject {
  projectId: string;
  similarity: number; // 0-100
  outcome: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
  teamSize: number;
  duration: number;
  keyFactors: string[];
  lessonsLearned: string[];
}

export interface SuccessPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  applicability: number; // 現在のプロジェクトへの適用可能性
}

export interface FailurePattern {
  pattern: string;
  frequency: number;
  failureRate: number;
  warningLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  avoidanceStrategy: string;
}

// パフォーマンス予測
export interface PerformancePrediction {
  expectedCompletion: Date;
  successProbability: number;
  qualityScore: number;
  riskFactors: string[];
  criticalMilestones: Milestone[];
  performanceByPhase: PhasePerformance[];
}

export interface Milestone {
  name: string;
  expectedDate: Date;
  completionProbability: number;
  dependencies: string[];
  criticalPath: boolean;
}

export interface PhasePerformance {
  phase: string;
  expectedDuration: number;
  confidenceLevel: number;
  keyRisks: string[];
  requiredSkills: string[];
}

/**
 * AIAssistedMemberSelectionService
 * Phase 3: AI支援選定機能
 */
export class AIAssistedMemberSelectionService extends CollaborativeMemberSelectionService {
  private skillProfiles: Map<string, SkillProfile> = new Map();
  private historicalData: Map<string, SimilarProject> = new Map();
  private performanceCache: Map<string, PerformanceMetrics> = new Map();

  /**
   * AI支援による最適チーム提案
   */
  async suggestOptimalTeam(
    projectId: string,
    criteria: SelectionCriteria,
    constraints: OptimizationConstraints
  ): Promise<AIRecommendation> {
    try {
      // 1. 候補者のスキルプロファイルを取得
      const candidates = await this.getCandidatesWithSkillProfiles(criteria);
      
      // 2. 過去の類似プロジェクトを分析
      const historicalAnalysis = await this.analyzeHistoricalProjects(projectId, criteria);
      
      // 3. 最適化アルゴリズムの実行
      const optimizedTeams = await this.runOptimizationAlgorithm(
        candidates,
        criteria,
        constraints,
        historicalAnalysis
      );
      
      // 4. リスク評価
      const riskAssessment = await this.assessProjectRisks(
        optimizedTeams[0],
        criteria,
        historicalAnalysis
      );
      
      // 5. インサイトの生成
      const insights = await this.generateTeamInsights(
        optimizedTeams[0],
        candidates,
        constraints
      );
      
      // 6. 成功確率の計算
      const successProbability = await this.calculateSuccessProbability(
        optimizedTeams[0],
        historicalAnalysis,
        riskAssessment
      );

      return {
        recommendedTeam: optimizedTeams[0],
        alternativeTeams: optimizedTeams.slice(1, 4), // 上位3つの代替案
        insights,
        riskAssessment,
        successProbability,
        optimizationScore: optimizedTeams[0].totalScore
      };

    } catch (error) {
      throw new Error(`AI支援選定エラー: ${error}`);
    }
  }

  /**
   * スキルギャップ分析
   */
  async analyzeSkillGaps(
    currentTeam: MemberCandidate[],
    projectRequirements: string[]
  ): Promise<{
    gaps: SkillGap[];
    recommendations: SkillRecommendation[];
    trainingNeeds: TrainingNeed[];
  }> {
    const teamSkills = await this.aggregateTeamSkills(currentTeam);
    const gaps: SkillGap[] = [];
    const recommendations: SkillRecommendation[] = [];
    const trainingNeeds: TrainingNeed[] = [];

    // 必要スキルとチームスキルのギャップを分析
    for (const requirement of projectRequirements) {
      const coverage = this.calculateSkillCoverage(requirement, teamSkills);
      
      if (coverage < 80) {
        gaps.push({
          skill: requirement,
          currentCoverage: coverage,
          requiredCoverage: 100,
          severity: coverage < 50 ? 'HIGH' : 'MEDIUM'
        });

        // 推奨事項の生成
        const candidates = await this.findCandidatesWithSkill(requirement);
        if (candidates.length > 0) {
          recommendations.push({
            type: 'ADD_MEMBER',
            skill: requirement,
            candidates: candidates.slice(0, 3),
            impact: 'HIGH'
          });
        } else {
          trainingNeeds.push({
            skill: requirement,
            targetMembers: this.identifyTrainingCandidates(currentTeam, requirement),
            estimatedDuration: this.estimateTrainingDuration(requirement),
            priority: 'HIGH'
          });
        }
      }
    }

    return { gaps, recommendations, trainingNeeds };
  }

  /**
   * チームパフォーマンス予測
   */
  async predictTeamPerformance(
    team: MemberCandidate[],
    projectDetails: any
  ): Promise<PerformancePrediction> {
    // メンバーの過去のパフォーマンスデータを取得
    const memberPerformance = await this.getMemberPerformanceHistory(team);
    
    // チーム構成の分析
    const teamDynamics = await this.analyzeTeamDynamics(team);
    
    // プロジェクトの複雑性評価
    const projectComplexity = this.assessProjectComplexity(projectDetails);
    
    // 機械学習モデルによる予測（簡略化された実装）
    const prediction = this.runPerformancePredictionModel(
      memberPerformance,
      teamDynamics,
      projectComplexity
    );

    return prediction;
  }

  /**
   * 動的チーム再編成提案
   */
  async suggestTeamRebalancing(
    currentTeam: MemberAssignment[],
    projectProgress: number,
    issues: string[]
  ): Promise<{
    adjustments: TeamAdjustment[];
    expectedImprovement: number;
    rationale: string[];
  }> {
    const adjustments: TeamAdjustment[] = [];
    const rationale: string[] = [];

    // 現在の問題を分析
    const problemAnalysis = this.analyzeProjectIssues(issues);
    
    // 各メンバーの負荷と貢献度を評価
    const memberAnalysis = await this.analyzeMemberContributions(currentTeam);
    
    // 調整案の生成
    if (problemAnalysis.includes('OVERLOAD')) {
      const overloadedMembers = memberAnalysis.filter(m => m.workload > 90);
      for (const member of overloadedMembers) {
        adjustments.push({
          type: 'REDUCE_WORKLOAD',
          memberId: member.userId,
          newWorkload: 70,
          tasksToReassign: member.criticalTasks
        });
        rationale.push(`${member.name}の負荷を軽減し、バーンアウトを防止`);
      }
    }

    if (problemAnalysis.includes('SKILL_GAP')) {
      const missingSkills = await this.identifyMissingSkills(currentTeam, projectProgress);
      for (const skill of missingSkills) {
        const candidate = await this.findBestSkillMatch(skill);
        if (candidate) {
          adjustments.push({
            type: 'ADD_SPECIALIST',
            candidateId: candidate.user.id,
            role: 'SPECIALIST',
            duration: 'TEMPORARY'
          });
          rationale.push(`${skill}の専門家を追加して技術的課題を解決`);
        }
      }
    }

    // 改善予測
    const expectedImprovement = this.calculateExpectedImprovement(adjustments);

    return { adjustments, expectedImprovement, rationale };
  }

  /**
   * 候補者のスキルプロファイル付き取得
   */
  private async getCandidatesWithSkillProfiles(
    criteria: SelectionCriteria
  ): Promise<MemberCandidate[]> {
    const candidates = await this.getCrossDepartmentCandidates('facility-1', criteria);
    
    // 各候補者のスキルプロファイルを生成（デモ実装）
    for (const candidate of candidates) {
      const profile = await this.generateSkillProfile(candidate.user);
      this.skillProfiles.set(candidate.user.id, profile);
      
      // スキルマッチスコアを更新
      candidate.skillMatch = this.calculateSkillMatchScore(
        profile,
        criteria.requiredSkills || []
      );
    }

    return candidates;
  }

  /**
   * スキルプロファイルの生成
   */
  private async generateSkillProfile(user: HierarchicalUser): Promise<SkillProfile> {
    // 実際の実装では、データベースから取得
    // デモ用のプロファイル生成
    const medicalSkills = ['診療', '薬剤管理', '医療機器操作', '感染管理'];
    const nursingSkills = ['看護ケア', '患者対応', '医療記録', 'チーム医療'];
    const adminSkills = ['文書管理', '予算管理', 'スケジュール調整', 'データ分析'];
    
    let primarySkills: string[] = [];
    switch (user.role) {
      case '医師':
      case '薬剤師':
        primarySkills = medicalSkills;
        break;
      case '看護師':
      case '准看護師':
        primarySkills = nursingSkills;
        break;
      default:
        primarySkills = adminSkills;
    }

    return {
      userId: user.id,
      skills: primarySkills.map(skill => ({
        category: skill,
        subSkills: this.generateSubSkills(skill),
        proficiencyLevel: Math.floor(Math.random() * 40) + 60,
        lastUsed: new Date(),
        projectCount: Math.floor(Math.random() * 10) + 1
      })),
      experience: {
        totalYears: Math.floor(Math.random() * 15) + 1,
        domainYears: { [user.department]: Math.floor(Math.random() * 10) + 1 },
        leadershipExperience: Math.floor(Math.random() * 5),
        crossFunctionalExperience: Math.random() > 0.5
      },
      certifications: this.generateCertifications(user.role),
      pastPerformance: {
        averageProjectScore: Math.floor(Math.random() * 20) + 80,
        completionRate: Math.floor(Math.random() * 15) + 85,
        timelineAdherence: Math.floor(Math.random() * 20) + 75,
        qualityScore: Math.floor(Math.random() * 15) + 85,
        innovationScore: Math.floor(Math.random() * 30) + 60,
        teamworkScore: Math.floor(Math.random() * 10) + 90
      },
      learningCapability: Math.floor(Math.random() * 30) + 70,
      collaborationScore: Math.floor(Math.random() * 20) + 80
    };
  }

  /**
   * サブスキルの生成
   */
  private generateSubSkills(category: string): SubSkill[] {
    const subSkillMap: Record<string, string[]> = {
      '診療': ['内科診療', '外科診療', '救急対応'],
      '看護ケア': ['基礎看護', '専門看護', '緩和ケア'],
      '文書管理': ['報告書作成', '議事録作成', 'プレゼンテーション']
    };

    const subSkillNames = subSkillMap[category] || ['基本スキル', '応用スキル'];
    
    return subSkillNames.map(name => ({
      name,
      level: ['INTERMEDIATE', 'ADVANCED', 'EXPERT'][Math.floor(Math.random() * 3)] as any,
      yearsOfExperience: Math.floor(Math.random() * 5) + 1,
      projectApplications: [`proj-${Math.floor(Math.random() * 100)}`]
    }));
  }

  /**
   * 資格情報の生成
   */
  private generateCertifications(role: string): Certification[] {
    const certMap: Record<string, string[]> = {
      '医師': ['医師免許', '専門医資格'],
      '看護師': ['看護師免許', '認定看護師'],
      '薬剤師': ['薬剤師免許', '認定薬剤師'],
      '理学療法士': ['理学療法士免許', '専門理学療法士']
    };

    const certs = certMap[role] || ['基礎資格'];
    
    return certs.map(name => ({
      name,
      issuedBy: '日本医療協会',
      issuedDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000),
      relevanceScore: Math.floor(Math.random() * 30) + 70
    }));
  }

  /**
   * 過去プロジェクトの分析
   */
  private async analyzeHistoricalProjects(
    projectId: string,
    criteria: SelectionCriteria
  ): Promise<HistoricalAnalysis> {
    // 類似プロジェクトの検索（デモ実装）
    const similarProjects: SimilarProject[] = [
      {
        projectId: 'hist-001',
        similarity: 85,
        outcome: 'SUCCESS',
        teamSize: 8,
        duration: 180,
        keyFactors: ['適切なスキルマッチ', '良好なコミュニケーション'],
        lessonsLearned: ['早期のリスク特定が重要', '定期的な進捗確認が効果的']
      },
      {
        projectId: 'hist-002',
        similarity: 72,
        outcome: 'PARTIAL_SUCCESS',
        teamSize: 6,
        duration: 150,
        keyFactors: ['スキル不足', '期限の厳しさ'],
        lessonsLearned: ['専門家の早期参画が必要', 'バッファ時間の確保']
      }
    ];

    const successPatterns: SuccessPattern[] = [
      {
        pattern: '多職種チーム構成',
        frequency: 0.8,
        successRate: 0.85,
        applicability: 0.9
      },
      {
        pattern: 'リーダー経験者の配置',
        frequency: 0.7,
        successRate: 0.78,
        applicability: 0.8
      }
    ];

    const failurePatterns: FailurePattern[] = [
      {
        pattern: '単一部門からの選出',
        frequency: 0.3,
        failureRate: 0.6,
        warningLevel: 'HIGH',
        avoidanceStrategy: '複数部門からバランスよく選出する'
      }
    ];

    return {
      similarProjects,
      successPatterns,
      failurePatterns,
      bestPractices: [
        'プロジェクト開始時にキックオフミーティングを実施',
        '週次での進捗確認会議を設定',
        'スキルマトリックスの作成と共有'
      ]
    };
  }

  /**
   * 最適化アルゴリズムの実行
   */
  private async runOptimizationAlgorithm(
    candidates: MemberCandidate[],
    criteria: SelectionCriteria,
    constraints: OptimizationConstraints,
    historicalAnalysis: HistoricalAnalysis
  ): Promise<TeamComposition[]> {
    const teams: TeamComposition[] = [];
    
    // 遺伝的アルゴリズムの簡略版実装
    const populationSize = 50;
    const generations = 100;
    
    // 初期集団の生成
    let population = this.generateInitialPopulation(
      candidates,
      criteria.maxTeamSize || 10,
      populationSize
    );

    // 世代交代
    for (let gen = 0; gen < generations; gen++) {
      // 適応度評価
      population = population.map(team => ({
        ...team,
        totalScore: this.evaluateTeamFitness(team, criteria, constraints, historicalAnalysis)
      }));

      // 選択・交叉・突然変異
      population = this.evolvePopulation(population, candidates);
    }

    // 上位チームを返す
    return population
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);
  }

  /**
   * チーム適応度の評価
   */
  private evaluateTeamFitness(
    team: TeamComposition,
    criteria: SelectionCriteria,
    constraints: OptimizationConstraints,
    historicalAnalysis: HistoricalAnalysis
  ): number {
    let score = 100;

    // スキルカバレッジ評価
    const skillCoverage = this.evaluateSkillCoverage(team, constraints.mustIncludeSkills);
    score *= skillCoverage / 100;

    // 負荷バランス評価
    const workloadBalance = this.evaluateWorkloadBalance(team, constraints.maxWorkloadPerMember);
    score *= workloadBalance / 100;

    // 多様性評価
    const diversityScore = this.evaluateDiversity(team, constraints.diversityTargets);
    score *= diversityScore / 100;

    // 過去の成功パターンとの一致度
    const patternMatch = this.evaluatePatternMatch(team, historicalAnalysis.successPatterns);
    score *= (1 + patternMatch / 100);

    // コスト制約
    if (team.estimatedCost > constraints.budgetConstraints.maxTotalCost) {
      score *= 0.5; // ペナルティ
    }

    return Math.round(score);
  }

  /**
   * リスク評価
   */
  private async assessProjectRisks(
    team: TeamComposition,
    criteria: SelectionCriteria,
    historicalAnalysis: HistoricalAnalysis
  ): Promise<RiskAssessment> {
    const risks: ProjectRisk[] = [];

    // スキルギャップリスク
    const skillGaps = await this.identifySkillGaps(team, criteria.requiredSkills || []);
    if (skillGaps.length > 0) {
      risks.push({
        type: 'SKILL_GAP',
        probability: 40,
        impact: 70,
        description: `重要スキル不足: ${skillGaps.join(', ')}`,
        affectedAreas: ['品質', '納期']
      });
    }

    // 負荷集中リスク
    const overloadedMembers = team.members.filter(m => m.workloadImpact > 80);
    if (overloadedMembers.length > 0) {
      risks.push({
        type: 'WORKLOAD_IMBALANCE',
        probability: 60,
        impact: 60,
        description: '特定メンバーへの負荷集中',
        affectedAreas: ['メンバーの健康', '品質']
      });
    }

    // 経験不足リスク
    const inexperiencedRatio = team.members.filter(m => {
      const profile = this.skillProfiles.get(m.candidate.user.id);
      return profile && profile.experience.totalYears < 3;
    }).length / team.members.length;

    if (inexperiencedRatio > 0.5) {
      risks.push({
        type: 'EXPERIENCE_SHORTAGE',
        probability: 50,
        impact: 50,
        description: '経験豊富なメンバーの不足',
        affectedAreas: ['意思決定', '問題解決']
      });
    }

    // リスクレベルの決定
    const maxRisk = Math.max(...risks.map(r => (r.probability * r.impact) / 100));
    const overallRiskLevel = maxRisk > 60 ? 'HIGH' : maxRisk > 30 ? 'MEDIUM' : 'LOW';

    // 緩和戦略の生成
    const mitigationStrategies = this.generateMitigationStrategies(risks);

    return {
      overallRiskLevel,
      risks,
      mitigationStrategies
    };
  }

  /**
   * チームインサイトの生成
   */
  private async generateTeamInsights(
    team: TeamComposition,
    allCandidates: MemberCandidate[],
    constraints: OptimizationConstraints
  ): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];

    // 強み分析
    if (team.skillCoverage > 90) {
      insights.push({
        type: 'STRENGTH',
        category: 'SKILL',
        description: '必要スキルを十分にカバーしています',
        impact: 'HIGH'
      });
    }

    // 弱み分析
    if (team.workloadBalance < 70) {
      insights.push({
        type: 'WEAKNESS',
        category: 'WORKLOAD',
        description: '作業負荷のバランスに改善の余地があります',
        impact: 'MEDIUM',
        recommendations: ['タスクの再配分を検討', '追加メンバーの検討']
      });
    }

    // 機会分析
    const highPotentialMembers = team.members.filter(m => {
      const profile = this.skillProfiles.get(m.candidate.user.id);
      return profile && profile.learningCapability > 85;
    });

    if (highPotentialMembers.length > team.members.length * 0.3) {
      insights.push({
        type: 'OPPORTUNITY',
        category: 'EXPERIENCE',
        description: '学習能力の高いメンバーが多く、スキル向上が期待できます',
        impact: 'MEDIUM'
      });
    }

    // コスト分析
    if (team.estimatedCost < constraints.budgetConstraints.maxTotalCost * 0.8) {
      insights.push({
        type: 'STRENGTH',
        category: 'COST',
        description: '予算内で効率的なチーム構成を実現しています',
        impact: 'HIGH'
      });
    }

    return insights;
  }

  /**
   * 成功確率の計算
   */
  private async calculateSuccessProbability(
    team: TeamComposition,
    historicalAnalysis: HistoricalAnalysis,
    riskAssessment: RiskAssessment
  ): Promise<number> {
    let probability = 70; // ベースライン

    // 過去の類似プロジェクトの成功率を反映
    const successfulProjects = historicalAnalysis.similarProjects
      .filter(p => p.outcome === 'SUCCESS').length;
    const successRate = successfulProjects / historicalAnalysis.similarProjects.length;
    probability = probability * 0.7 + successRate * 100 * 0.3;

    // チーム構成スコアの反映
    probability = probability * 0.6 + team.totalScore * 0.4;

    // リスクの影響
    const riskImpact = riskAssessment.risks.reduce((sum, risk) => 
      sum + (risk.probability * risk.impact) / 10000, 0
    );
    probability -= riskImpact * 10;

    // 緩和戦略の効果
    const mitigationEffect = riskAssessment.mitigationStrategies.reduce((sum, strategy) =>
      sum + strategy.effectiveness / 100, 0
    ) / riskAssessment.mitigationStrategies.length;
    probability += mitigationEffect * 10;

    return Math.max(0, Math.min(100, Math.round(probability)));
  }

  // 以下、ヘルパーメソッド群

  private calculateSkillMatchScore(profile: SkillProfile, requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 80;

    const matches = requiredSkills.filter(required => 
      profile.skills.some(skill => 
        skill.category.toLowerCase().includes(required.toLowerCase()) ||
        skill.subSkills.some(sub => sub.name.toLowerCase().includes(required.toLowerCase()))
      )
    );

    return Math.round((matches.length / requiredSkills.length) * 100);
  }

  private calculateSkillCoverage(skill: string, teamSkills: any): number {
    // 簡略化された実装
    return Math.floor(Math.random() * 50) + 50;
  }

  private async findCandidatesWithSkill(skill: string): Promise<MemberCandidate[]> {
    // 実装では実際にスキルを持つ候補者を検索
    return [];
  }

  private identifyTrainingCandidates(team: MemberCandidate[], skill: string): string[] {
    // 訓練に適したメンバーを特定
    return team.slice(0, 2).map(m => m.user.id);
  }

  private estimateTrainingDuration(skill: string): number {
    // スキルの複雑さに基づいて訓練期間を推定
    return 30; // 日数
  }

  private async getMemberPerformanceHistory(team: MemberCandidate[]): Promise<any> {
    // メンバーの過去のパフォーマンスデータを取得
    return team.map(m => ({
      memberId: m.user.id,
      performance: this.performanceCache.get(m.user.id) || this.generateDefaultPerformance()
    }));
  }

  private generateDefaultPerformance(): PerformanceMetrics {
    return {
      averageProjectScore: 80,
      completionRate: 85,
      timelineAdherence: 75,
      qualityScore: 85,
      innovationScore: 70,
      teamworkScore: 90
    };
  }

  private async analyzeTeamDynamics(team: MemberCandidate[]): Promise<any> {
    // チームダイナミクスの分析
    return {
      cohesion: 0.8,
      communication: 0.85,
      conflictPotential: 0.2
    };
  }

  private assessProjectComplexity(projectDetails: any): number {
    // プロジェクトの複雑性を評価（0-100）
    return 65;
  }

  private runPerformancePredictionModel(
    memberPerformance: any,
    teamDynamics: any,
    projectComplexity: number
  ): PerformancePrediction {
    // 簡略化された予測モデル
    const baseCompletion = 90 - projectComplexity / 10;
    const teamFactor = teamDynamics.cohesion * 10;
    
    return {
      expectedCompletion: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      successProbability: baseCompletion + teamFactor,
      qualityScore: 85,
      riskFactors: ['スキルギャップ', 'スケジュール遅延'],
      criticalMilestones: [
        {
          name: '要件定義完了',
          expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          completionProbability: 95,
          dependencies: [],
          criticalPath: true
        }
      ],
      performanceByPhase: [
        {
          phase: '計画',
          expectedDuration: 30,
          confidenceLevel: 90,
          keyRisks: ['要件の不明確さ'],
          requiredSkills: ['要件定義', 'プロジェクト管理']
        }
      ]
    };
  }

  private analyzeProjectIssues(issues: string[]): string[] {
    // 問題をカテゴライズ
    const categories: string[] = [];
    if (issues.some(i => i.includes('負荷') || i.includes('忙しい'))) {
      categories.push('OVERLOAD');
    }
    if (issues.some(i => i.includes('スキル') || i.includes('技術'))) {
      categories.push('SKILL_GAP');
    }
    return categories;
  }

  private async analyzeMemberContributions(team: MemberAssignment[]): Promise<any[]> {
    // メンバーの貢献度を分析
    return team.map(member => ({
      userId: member.userId,
      name: `Member ${member.userId}`,
      workload: Math.floor(Math.random() * 40) + 60,
      criticalTasks: ['タスク1', 'タスク2']
    }));
  }

  private async identifyMissingSkills(team: MemberAssignment[], progress: number): Promise<string[]> {
    // 不足スキルを特定
    if (progress < 50) {
      return ['プロジェクト管理', 'リスク分析'];
    } else {
      return ['品質保証', 'ドキュメント作成'];
    }
  }

  private async findBestSkillMatch(skill: string): Promise<MemberCandidate | null> {
    // スキルに最適な候補者を検索
    const candidates = await this.getDepartmentCandidates('dept-1');
    return candidates.find(c => c.skillMatch > 80) || null;
  }

  private calculateExpectedImprovement(adjustments: TeamAdjustment[]): number {
    // 調整による改善予測
    return adjustments.length * 15; // 簡略化
  }

  private generateInitialPopulation(
    candidates: MemberCandidate[],
    teamSize: number,
    populationSize: number
  ): TeamComposition[] {
    const population: TeamComposition[] = [];
    
    for (let i = 0; i < populationSize; i++) {
      const team = this.generateRandomTeam(candidates, teamSize);
      population.push(team);
    }
    
    return population;
  }

  private generateRandomTeam(candidates: MemberCandidate[], size: number): TeamComposition {
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(size, shuffled.length));
    
    return {
      members: selected.map(candidate => ({
        candidate,
        role: 'TEAM_MEMBER' as MemberRole,
        matchScore: candidate.skillMatch,
        contribution: ['スキル提供'],
        workloadImpact: candidate.availability.workloadPercentage
      })),
      totalScore: 0,
      skillCoverage: 0,
      workloadBalance: 0,
      diversityScore: 0,
      estimatedCost: 0,
      estimatedDuration: 0
    };
  }

  private evolvePopulation(
    population: TeamComposition[],
    candidates: MemberCandidate[]
  ): TeamComposition[] {
    // 簡略化された進化アルゴリズム
    const sorted = population.sort((a, b) => b.totalScore - a.totalScore);
    const elite = sorted.slice(0, Math.floor(population.length * 0.2));
    const newPopulation = [...elite];
    
    // 交叉と突然変異で新しい個体を生成
    while (newPopulation.length < population.length) {
      const parent1 = elite[Math.floor(Math.random() * elite.length)];
      const parent2 = elite[Math.floor(Math.random() * elite.length)];
      const child = this.crossover(parent1, parent2);
      
      if (Math.random() < 0.1) { // 10%の確率で突然変異
        this.mutate(child, candidates);
      }
      
      newPopulation.push(child);
    }
    
    return newPopulation;
  }

  private crossover(parent1: TeamComposition, parent2: TeamComposition): TeamComposition {
    // 単純な交叉実装
    const members = [];
    const used = new Set<string>();
    
    // 各親から半分ずつ取る
    const half1 = Math.floor(parent1.members.length / 2);
    for (let i = 0; i < half1 && i < parent1.members.length; i++) {
      members.push(parent1.members[i]);
      used.add(parent1.members[i].candidate.user.id);
    }
    
    for (const member of parent2.members) {
      if (!used.has(member.candidate.user.id) && members.length < parent1.members.length) {
        members.push(member);
      }
    }
    
    return { ...parent1, members };
  }

  private mutate(team: TeamComposition, candidates: MemberCandidate[]): void {
    // ランダムに1メンバーを入れ替え
    if (team.members.length > 0 && candidates.length > 0) {
      const index = Math.floor(Math.random() * team.members.length);
      const newCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      
      team.members[index] = {
        candidate: newCandidate,
        role: 'TEAM_MEMBER' as MemberRole,
        matchScore: newCandidate.skillMatch,
        contribution: ['スキル提供'],
        workloadImpact: newCandidate.availability.workloadPercentage
      };
    }
  }

  private evaluateSkillCoverage(team: TeamComposition, requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;
    
    const teamSkills = new Set<string>();
    team.members.forEach(member => {
      const profile = this.skillProfiles.get(member.candidate.user.id);
      if (profile) {
        profile.skills.forEach(skill => {
          teamSkills.add(skill.category);
          skill.subSkills.forEach(sub => teamSkills.add(sub.name));
        });
      }
    });
    
    const covered = requiredSkills.filter(skill => 
      Array.from(teamSkills).some(teamSkill => 
        teamSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return (covered.length / requiredSkills.length) * 100;
  }

  private evaluateWorkloadBalance(team: TeamComposition, maxWorkload: number): number {
    const workloads = team.members.map(m => m.workloadImpact);
    const avg = workloads.reduce((a, b) => a + b, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / workloads.length;
    const stdDev = Math.sqrt(variance);
    
    // 標準偏差が小さいほどバランスが良い
    const balance = Math.max(0, 100 - stdDev);
    
    // 過負荷メンバーがいる場合はペナルティ
    const overloaded = workloads.filter(w => w > maxWorkload).length;
    
    return balance * (1 - overloaded * 0.2);
  }

  private evaluateDiversity(team: TeamComposition, targets: DiversityTargets): number {
    // 部門の多様性
    const departments = new Set(team.members.map(m => m.candidate.user.department));
    const deptScore = Math.min(100, (departments.size / targets.departmentDiversity) * 100);
    
    // 経験レベルの多様性
    let juniorCount = 0, midCount = 0, seniorCount = 0;
    team.members.forEach(member => {
      const profile = this.skillProfiles.get(member.candidate.user.id);
      if (profile) {
        if (profile.experience.totalYears < 3) juniorCount++;
        else if (profile.experience.totalYears < 7) midCount++;
        else seniorCount++;
      }
    });
    
    const total = team.members.length;
    const expScore = 100 - Math.abs(juniorCount/total - targets.experienceMix.junior/100) * 100
                         - Math.abs(midCount/total - targets.experienceMix.mid/100) * 100
                         - Math.abs(seniorCount/total - targets.experienceMix.senior/100) * 100;
    
    return (deptScore + Math.max(0, expScore)) / 2;
  }

  private evaluatePatternMatch(team: TeamComposition, patterns: SuccessPattern[]): number {
    let matchScore = 0;
    
    patterns.forEach(pattern => {
      if (pattern.pattern === '多職種チーム構成') {
        const roles = new Set(team.members.map(m => m.candidate.user.role));
        if (roles.size >= 3) {
          matchScore += pattern.successRate * pattern.applicability * 100;
        }
      } else if (pattern.pattern === 'リーダー経験者の配置') {
        const hasLeader = team.members.some(m => {
          const profile = this.skillProfiles.get(m.candidate.user.id);
          return profile && profile.experience.leadershipExperience > 0;
        });
        if (hasLeader) {
          matchScore += pattern.successRate * pattern.applicability * 100;
        }
      }
    });
    
    return matchScore / patterns.length;
  }

  private async identifySkillGaps(team: TeamComposition, requiredSkills: string[]): Promise<string[]> {
    const teamSkills = new Set<string>();
    
    team.members.forEach(member => {
      const profile = this.skillProfiles.get(member.candidate.user.id);
      if (profile) {
        profile.skills.forEach(skill => {
          teamSkills.add(skill.category.toLowerCase());
        });
      }
    });
    
    return requiredSkills.filter(skill => 
      !Array.from(teamSkills).some(teamSkill => 
        teamSkill.includes(skill.toLowerCase())
      )
    );
  }

  private generateMitigationStrategies(risks: ProjectRisk[]): MitigationStrategy[] {
    const strategies: MitigationStrategy[] = [];
    
    risks.forEach(risk => {
      switch (risk.type) {
        case 'SKILL_GAP':
          strategies.push({
            riskType: risk.type,
            strategy: '専門家の短期契約または内部トレーニングの実施',
            cost: 500000,
            effectiveness: 80
          });
          break;
        case 'WORKLOAD_IMBALANCE':
          strategies.push({
            riskType: risk.type,
            strategy: 'タスクの再配分と追加リソースの検討',
            cost: 300000,
            effectiveness: 70
          });
          break;
        case 'EXPERIENCE_SHORTAGE':
          strategies.push({
            riskType: risk.type,
            strategy: 'メンター制度の導入とナレッジ共有セッションの実施',
            cost: 200000,
            effectiveness: 60
          });
          break;
      }
    });
    
    return strategies;
  }

  private async aggregateTeamSkills(team: MemberCandidate[]): Promise<any> {
    const skills = new Map<string, number>();
    
    team.forEach(member => {
      const profile = this.skillProfiles.get(member.user.id);
      if (profile) {
        profile.skills.forEach(skill => {
          const current = skills.get(skill.category) || 0;
          skills.set(skill.category, Math.max(current, skill.proficiencyLevel));
        });
      }
    });
    
    return skills;
  }
}

// 型定義：調整提案
interface TeamAdjustment {
  type: 'ADD_MEMBER' | 'REMOVE_MEMBER' | 'REDUCE_WORKLOAD' | 'ADD_SPECIALIST';
  memberId?: string;
  candidateId?: string;
  role?: MemberRole;
  newWorkload?: number;
  tasksToReassign?: string[];
  duration?: 'PERMANENT' | 'TEMPORARY';
}

// 型定義：スキル関連
interface SkillGap {
  skill: string;
  currentCoverage: number;
  requiredCoverage: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface SkillRecommendation {
  type: 'ADD_MEMBER' | 'TRAINING' | 'OUTSOURCE';
  skill: string;
  candidates?: MemberCandidate[];
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TrainingNeed {
  skill: string;
  targetMembers: string[];
  estimatedDuration: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default AIAssistedMemberSelectionService;