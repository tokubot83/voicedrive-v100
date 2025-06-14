// useAIAssistedSelection Hook - AI支援メンバー選定機能のReactフック
// Phase 3: スキルマッチング・最適化・パフォーマンス予測

import { useState, useEffect, useCallback } from 'react';
import { MemberCandidate, SelectionCriteria } from '../types/memberSelection';
import {
  AIRecommendation,
  TeamComposition,
  OptimizationConstraints,
  PerformancePrediction,
  SkillProfile,
  TeamInsight,
  RiskAssessment
} from '../services/AIAssistedMemberSelectionService';
import AIAssistedMemberSelectionService from '../services/AIAssistedMemberSelectionService';

interface UseAIAssistedSelectionProps {
  projectId: string;
  criteria: SelectionCriteria;
  enabled?: boolean;
}

interface UseAIAssistedSelectionReturn {
  // AI推奨データ
  recommendation: AIRecommendation | null;
  selectedTeam: TeamComposition | null;
  alternatives: TeamComposition[];
  
  // 分析データ
  insights: TeamInsight[];
  riskAssessment: RiskAssessment | null;
  performancePrediction: PerformancePrediction | null;
  
  // スキル分析
  skillGaps: SkillGap[];
  skillRecommendations: SkillRecommendation[];
  trainingNeeds: TrainingNeed[];
  
  // 状態
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  
  // アクション
  generateRecommendation: (constraints?: OptimizationConstraints) => Promise<void>;
  selectTeam: (teamIndex: number) => void;
  analyzeSkillGaps: (team: MemberCandidate[]) => Promise<void>;
  predictPerformance: (team: MemberCandidate[]) => Promise<void>;
  suggestRebalancing: (currentTeam: any[], issues: string[]) => Promise<RebalancingResult>;
  
  // カスタマイズ
  updateConstraints: (constraints: Partial<OptimizationConstraints>) => void;
  setOptimizationGoal: (goal: 'SPEED' | 'QUALITY' | 'COST' | 'BALANCE') => void;
  
  // 実時間分析
  enableRealTimeOptimization: () => void;
  disableRealTimeOptimization: () => void;
  
  // エクスポート
  exportAnalysis: () => AnalysisExport;
  generateReport: () => Promise<AISelectionReport>;
}

// 追加の型定義
interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SkillRecommendation {
  type: 'ADD_MEMBER' | 'TRAINING' | 'OUTSOURCE';
  skill: string;
  candidates?: MemberCandidate[];
  cost: number;
  timeToImplement: number;
  effectiveness: number;
}

interface TrainingNeed {
  skill: string;
  targetMembers: string[];
  duration: number;
  cost: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface RebalancingResult {
  adjustments: TeamAdjustment[];
  expectedImprovement: number;
  rationale: string[];
  cost: number;
}

interface TeamAdjustment {
  type: 'ADD' | 'REMOVE' | 'REASSIGN' | 'WORKLOAD_ADJUST';
  memberId?: string;
  details: string;
  impact: number;
}

interface AnalysisExport {
  timestamp: Date;
  recommendation: AIRecommendation;
  constraints: OptimizationConstraints;
  performance: PerformancePrediction | null;
  summary: AnalysisSummary;
}

interface AnalysisSummary {
  optimalTeamSize: number;
  keyStrengths: string[];
  criticalRisks: string[];
  recommendedActions: string[];
  confidenceScore: number;
}

interface AISelectionReport {
  executiveSummary: string;
  teamComposition: TeamAnalysis;
  riskMatrix: RiskMatrix[];
  implementationPlan: ImplementationStep[];
  budgetBreakdown: BudgetItem[];
}

interface TeamAnalysis {
  memberProfiles: MemberProfile[];
  skillDistribution: SkillDistribution;
  workloadAnalysis: WorkloadAnalysis;
  synergies: TeamSynergy[];
}

interface MemberProfile {
  name: string;
  role: string;
  keyStrengths: string[];
  contribution: string;
  riskFactors: string[];
}

interface SkillDistribution {
  coverage: Record<string, number>;
  gaps: string[];
  redundancies: string[];
}

interface WorkloadAnalysis {
  distribution: number[];
  balance: number;
  riskOfBurnout: string[];
}

interface TeamSynergy {
  members: string[];
  type: 'SKILL_COMPLEMENT' | 'EXPERIENCE_MENTOR' | 'COLLABORATION_BOOST';
  description: string;
  impact: number;
}

interface RiskMatrix {
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
}

interface ImplementationStep {
  step: string;
  description: string;
  timeline: string;
  dependencies: string[];
  deliverables: string[];
}

interface BudgetItem {
  category: string;
  amount: number;
  justification: string;
}

/**
 * AI支援メンバー選定機能のカスタムフック
 */
export const useAIAssistedSelection = ({
  projectId,
  criteria,
  enabled = true
}: UseAIAssistedSelectionProps): UseAIAssistedSelectionReturn => {
  
  // 基本状態
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 分析データ
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [skillRecommendations, setSkillRecommendations] = useState<SkillRecommendation[]>([]);
  const [trainingNeeds, setTrainingNeeds] = useState<TrainingNeed[]>([]);
  const [performancePrediction, setPerformancePrediction] = useState<PerformancePrediction | null>(null);
  
  // 設定
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    mustIncludeSkills: [],
    preferredSkills: [],
    maxWorkloadPerMember: 80,
    minExperienceLevel: 1,
    diversityTargets: {
      departmentDiversity: 2,
      experienceMix: { junior: 30, mid: 50, senior: 20 },
      skillDiversity: 3
    },
    budgetConstraints: {
      maxTotalCost: 10000000,
      costPerMember: {},
      overheadPercentage: 20
    }
  });
  
  const [optimizationGoal, setOptimizationGoal] = useState<'SPEED' | 'QUALITY' | 'COST' | 'BALANCE'>('BALANCE');
  const [realTimeOptimization, setRealTimeOptimization] = useState(false);
  
  // サービス
  const aiService = new AIAssistedMemberSelectionService();

  // 初期化
  useEffect(() => {
    if (enabled && projectId && criteria) {
      generateRecommendation();
    }
  }, [projectId, criteria, enabled]);

  // リアルタイム最適化
  useEffect(() => {
    if (realTimeOptimization && recommendation) {
      const interval = setInterval(() => {
        // 定期的に最適化を再実行（実際の実装では条件に応じて）
        generateRecommendation();
      }, 30000); // 30秒ごと

      return () => clearInterval(interval);
    }
  }, [realTimeOptimization, recommendation]);

  /**
   * AI推奨を生成
   */
  const generateRecommendation = useCallback(async (
    customConstraints?: OptimizationConstraints
  ) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const constraintsToUse = customConstraints || adjustConstraintsForGoal(constraints, optimizationGoal);
      
      const result = await aiService.suggestOptimalTeam(
        projectId,
        criteria,
        constraintsToUse
      );

      setRecommendation(result);
      setSelectedTeamIndex(0);

      // 初期選択チームのパフォーマンス予測
      if (result.recommendedTeam.members.length > 0) {
        await predictPerformance(result.recommendedTeam.members.map(m => m.candidate));
      }

    } catch (err) {
      setError('AI推奨生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [projectId, criteria, constraints, optimizationGoal, enabled]);

  /**
   * チーム選択
   */
  const selectTeam = useCallback((teamIndex: number) => {
    if (!recommendation) return;

    const teams = [recommendation.recommendedTeam, ...recommendation.alternativeTeams];
    if (teamIndex >= 0 && teamIndex < teams.length) {
      setSelectedTeamIndex(teamIndex);
      
      // 選択されたチームのパフォーマンス予測を更新
      const selectedTeam = teams[teamIndex];
      predictPerformance(selectedTeam.members.map(m => m.candidate));
    }
  }, [recommendation]);

  /**
   * スキルギャップ分析
   */
  const analyzeSkillGaps = useCallback(async (team: MemberCandidate[]) => {
    setAnalyzing(true);
    try {
      const requiredSkills = criteria.requiredSkills || [];
      const analysis = await aiService.analyzeSkillGaps(team, requiredSkills);
      
      setSkillGaps(analysis.gaps.map(gap => ({
        skill: gap.skill,
        currentLevel: gap.currentCoverage,
        requiredLevel: gap.requiredCoverage,
        gap: gap.requiredCoverage - gap.currentCoverage,
        priority: gap.severity
      })));
      
      setSkillRecommendations(analysis.recommendations.map(rec => ({
        type: rec.type,
        skill: rec.skill,
        candidates: rec.candidates,
        cost: 500000, // 仮の値
        timeToImplement: 30,
        effectiveness: rec.impact === 'HIGH' ? 90 : rec.impact === 'MEDIUM' ? 70 : 50
      })));
      
      setTrainingNeeds(analysis.trainingNeeds.map(need => ({
        skill: need.skill,
        targetMembers: need.targetMembers,
        duration: need.estimatedDuration,
        cost: need.estimatedDuration * 10000, // 1日1万円として計算
        priority: need.priority
      })));
      
    } catch (err) {
      setError('スキルギャップ分析に失敗しました');
    } finally {
      setAnalyzing(false);
    }
  }, [criteria]);

  /**
   * パフォーマンス予測
   */
  const predictPerformance = useCallback(async (team: MemberCandidate[]) => {
    try {
      const prediction = await aiService.predictTeamPerformance(team, {
        complexity: 'medium',
        duration: 180,
        budget: constraints.budgetConstraints.maxTotalCost
      });
      
      setPerformancePrediction(prediction);
    } catch (err) {
      console.error('パフォーマンス予測エラー:', err);
    }
  }, [constraints]);

  /**
   * チーム再編成提案
   */
  const suggestRebalancing = useCallback(async (
    currentTeam: any[],
    issues: string[]
  ): Promise<RebalancingResult> => {
    try {
      const result = await aiService.suggestTeamRebalancing(
        currentTeam,
        50, // 進捗率50%と仮定
        issues
      );

      return {
        adjustments: result.adjustments.map(adj => ({
          type: adj.type === 'ADD_SPECIALIST' ? 'ADD' : 
                adj.type === 'REDUCE_WORKLOAD' ? 'WORKLOAD_ADJUST' : 'REASSIGN',
          memberId: adj.memberId || adj.candidateId,
          details: `${adj.type}: ${JSON.stringify(adj)}`,
          impact: 75 // 仮の影響度
        })),
        expectedImprovement: result.expectedImprovement,
        rationale: result.rationale,
        cost: 1000000 // 仮のコスト
      };
    } catch (err) {
      throw new Error('再編成提案の生成に失敗しました');
    }
  }, []);

  /**
   * 制約条件の更新
   */
  const updateConstraints = useCallback((newConstraints: Partial<OptimizationConstraints>) => {
    setConstraints(prev => ({ ...prev, ...newConstraints }));
  }, []);

  /**
   * リアルタイム最適化の制御
   */
  const enableRealTimeOptimization = useCallback(() => {
    setRealTimeOptimization(true);
  }, []);

  const disableRealTimeOptimization = useCallback(() => {
    setRealTimeOptimization(false);
  }, []);

  /**
   * 分析結果のエクスポート
   */
  const exportAnalysis = useCallback((): AnalysisExport => {
    if (!recommendation) {
      throw new Error('分析結果がありません');
    }

    return {
      timestamp: new Date(),
      recommendation,
      constraints,
      performance: performancePrediction,
      summary: {
        optimalTeamSize: recommendation.recommendedTeam.members.length,
        keyStrengths: recommendation.insights
          .filter(i => i.type === 'STRENGTH')
          .map(i => i.description),
        criticalRisks: recommendation.riskAssessment.risks
          .filter(r => (r.probability * r.impact) > 50)
          .map(r => r.description),
        recommendedActions: recommendation.insights
          .flatMap(i => i.recommendations || []),
        confidenceScore: recommendation.successProbability
      }
    };
  }, [recommendation, constraints, performancePrediction]);

  /**
   * 詳細レポート生成
   */
  const generateReport = useCallback(async (): Promise<AISelectionReport> => {
    if (!recommendation) {
      throw new Error('推奨データがありません');
    }

    const team = recommendation.recommendedTeam;
    
    return {
      executiveSummary: generateExecutiveSummary(recommendation),
      teamComposition: {
        memberProfiles: team.members.map(m => ({
          name: m.candidate.user.name,
          role: m.candidate.user.role,
          keyStrengths: m.contribution,
          contribution: `マッチ度${m.matchScore}%で${m.role}として参画`,
          riskFactors: m.workloadImpact > 80 ? ['高負荷リスク'] : []
        })),
        skillDistribution: {
          coverage: {}, // 実装では詳細計算
          gaps: skillGaps.map(g => g.skill),
          redundancies: []
        },
        workloadAnalysis: {
          distribution: team.members.map(m => m.workloadImpact),
          balance: team.workloadBalance,
          riskOfBurnout: team.members
            .filter(m => m.workloadImpact > 85)
            .map(m => m.candidate.user.name)
        },
        synergies: [] // 実装では詳細分析
      },
      riskMatrix: recommendation.riskAssessment.risks.map(risk => ({
        risk: risk.type,
        probability: risk.probability,
        impact: risk.impact,
        mitigation: recommendation.riskAssessment.mitigationStrategies
          .find(s => s.riskType === risk.type)?.strategy || '未定義',
        owner: '要決定'
      })),
      implementationPlan: generateImplementationPlan(team),
      budgetBreakdown: generateBudgetBreakdown(team, constraints)
    };
  }, [recommendation, skillGaps, constraints]);

  // 計算されたプロパティ
  const selectedTeam = recommendation 
    ? [recommendation.recommendedTeam, ...recommendation.alternativeTeams][selectedTeamIndex]
    : null;

  const alternatives = recommendation ? recommendation.alternativeTeams : [];
  const insights = recommendation ? recommendation.insights : [];
  const riskAssessment = recommendation ? recommendation.riskAssessment : null;

  return {
    // データ
    recommendation,
    selectedTeam,
    alternatives,
    insights,
    riskAssessment,
    performancePrediction,
    skillGaps,
    skillRecommendations,
    trainingNeeds,
    
    // 状態
    loading,
    analyzing,
    error,
    
    // アクション
    generateRecommendation,
    selectTeam,
    analyzeSkillGaps,
    predictPerformance,
    suggestRebalancing,
    updateConstraints,
    setOptimizationGoal,
    enableRealTimeOptimization,
    disableRealTimeOptimization,
    exportAnalysis,
    generateReport
  };
};

// ヘルパー関数
function adjustConstraintsForGoal(
  constraints: OptimizationConstraints,
  goal: 'SPEED' | 'QUALITY' | 'COST' | 'BALANCE'
): OptimizationConstraints {
  const adjusted = { ...constraints };

  switch (goal) {
    case 'SPEED':
      adjusted.maxWorkloadPerMember = 90;
      adjusted.minExperienceLevel = 3;
      break;
    case 'QUALITY':
      adjusted.maxWorkloadPerMember = 70;
      adjusted.minExperienceLevel = 5;
      break;
    case 'COST':
      adjusted.budgetConstraints.maxTotalCost *= 0.8;
      adjusted.maxWorkloadPerMember = 85;
      break;
    case 'BALANCE':
      // デフォルト設定を維持
      break;
  }

  return adjusted;
}

function generateExecutiveSummary(recommendation: AIRecommendation): string {
  const team = recommendation.recommendedTeam;
  return `AI分析により、${team.members.length}名の最適チーム構成を提案します。` +
         `成功確率${recommendation.successProbability}%、総合スコア${recommendation.optimizationScore}点で、` +
         `高いパフォーマンスが期待できます。主要な強みは${recommendation.insights.filter(i => i.type === 'STRENGTH').length}項目、` +
         `注意すべきリスクは${recommendation.riskAssessment.risks.length}項目特定されています。`;
}

function generateImplementationPlan(team: TeamComposition): ImplementationStep[] {
  return [
    {
      step: 'チーム編成',
      description: '推奨メンバーの招集とキックオフ',
      timeline: '1週間',
      dependencies: [],
      deliverables: ['メンバー確定', 'キックオフ資料']
    },
    {
      step: 'スキル評価',
      description: '各メンバーのスキル詳細評価',
      timeline: '2週間',
      dependencies: ['チーム編成'],
      deliverables: ['スキルマトリックス', '訓練計画']
    }
  ];
}

function generateBudgetBreakdown(
  team: TeamComposition,
  constraints: OptimizationConstraints
): BudgetItem[] {
  return [
    {
      category: '人件費',
      amount: team.estimatedCost * 0.7,
      justification: 'チームメンバーの給与・手当'
    },
    {
      category: '訓練費',
      amount: team.estimatedCost * 0.1,
      justification: 'スキルアップ・研修費用'
    },
    {
      category: 'その他',
      amount: team.estimatedCost * 0.2,
      justification: '設備・ツール・間接費用'
    }
  ];
}

export default useAIAssistedSelection;