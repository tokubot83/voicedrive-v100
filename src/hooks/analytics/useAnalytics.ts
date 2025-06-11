// 分析データ管理カスタムフック - Phase 3 実装
import { useState, useEffect, useCallback } from 'react';
import { ROIAnalysisEngine, ProjectROI } from '../../analytics/engines/ROIAnalysisEngine';
import { StrategicInsightsEngine, ExecutiveInsights } from '../../analytics/engines/StrategicInsightsEngine';
import { PredictiveAnalytics, OrganizationalTrends } from '../../analytics/engines/PredictiveAnalytics';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';
import { 
  strategicInsightsDemoData, 
  roiAnalyticsDemoData, 
  benchmarkComparisonDemoData, 
  riskAssessmentDemoData,
  projectPipelineDemoData 
} from '../../data/demo/strategicDemoData';

interface AnalyticsData {
  roiAnalytics: {
    averageROI: number;
    totalProjects: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    projects: Array<{
      id: string;
      name: string;
      roi: number;
      investment: number;
      returns: number;
      status: string;
    }>;
    historical: Array<{
      period: string;
      averageROI: number;
      projectCount: number;
    }>;
  };
  strategicInsights: ExecutiveInsights;
  performanceMetrics: {
    efficiencyGain: number;
    successRate: number;
    annualSavings: number;
    qualityImprovement: number;
    timeToValue: number;
    employeeSatisfaction: number;
  };
  projectPipeline: {
    total: number;
    byStage: {
      proposal: number;
      approval: number;
      implementation: number;
      completed: number;
    };
    upcoming: Array<{
      id: string;
      name: string;
      stage: string;
      expectedROI: number;
      daysUntilStart: number;
    }>;
  };
  organizationalTrends?: OrganizationalTrends;
}

interface UseAnalyticsReturn extends AnalyticsData {
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useAnalytics = (
  timeframe: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'QUARTERLY'
): UseAnalyticsReturn => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userLevel } = usePermissions();
  
  const roiEngine = new ROIAnalysisEngine();
  const insightsEngine = new StrategicInsightsEngine();
  const predictiveEngine = new PredictiveAnalytics();
  
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // レベル6以上の場合はリアルデータ、それ以外はデモデータ
      if (userLevel >= PermissionLevel.LEVEL_6) {
        // 並列でデータを取得
        const [
          executiveInsights,
          organizationalTrends,
          projectsData
        ] = await Promise.all([
          insightsEngine.generateExecutiveInsights(timeframe),
          predictiveEngine.generateOrganizationalTrends(),
          fetchProjectsData(timeframe)
        ]);
        
        // ROI分析の実行
        const roiResults = await Promise.all(
          projectsData.map(project => roiEngine.calculateProjectROI(project))
        );
        
        // データの集計と整形
        const analyticsData: AnalyticsData = {
          roiAnalytics: {
            averageROI: calculateAverageROI(roiResults),
            totalProjects: projectsData.length,
            trend: determineTrend(roiResults),
            projects: formatProjects(projectsData, roiResults),
            historical: generateHistoricalData(timeframe)
          },
          strategicInsights: executiveInsights,
          performanceMetrics: calculatePerformanceMetrics(projectsData, roiResults),
          projectPipeline: generatePipelineData(projectsData),
          organizationalTrends
        };
        
        setData(analyticsData);
      } else {
        // レベル6未満の場合はデモデータを使用
        const analyticsData: AnalyticsData = {
          roiAnalytics: {
            ...roiAnalyticsDemoData,
            historical: generateHistoricalData(timeframe)
          },
          strategicInsights: {
            executiveSummary: '戦略的機会を分析中',
            strategicRecommendations: strategicInsightsDemoData.recommendations,
            riskAssessment: {
              overallRiskScore: 2.8,
              riskBreakdown: {
                implementationRisks: riskAssessmentDemoData.filter(r => r.category === 'セキュリティ').map(r => ({
                  ...r,
                  score: r.impact * r.probability,
                  description: r.mitigation
                })),
                financialRisks: riskAssessmentDemoData.filter(r => r.category === '財務').map(r => ({
                  ...r,
                  score: r.impact * r.probability,
                  description: r.mitigation
                })),
                operationalRisks: riskAssessmentDemoData.filter(r => r.category === '技術').map(r => ({
                  ...r,
                  score: r.impact * r.probability,
                  description: r.mitigation
                })),
                strategicRisks: riskAssessmentDemoData.filter(r => r.category === '事業').map(r => ({
                  ...r,
                  score: r.impact * r.probability,
                  description: r.mitigation
                }))
              },
              mitigationStrategies: [],
              monitoringMetrics: []
            },
            futureProjections: [],
            benchmarkComparison: benchmarkComparisonDemoData.map(b => ({
              ...b,
              topPerformer: b.organizationValue * 1.3,
              percentile: Math.floor(75 + Math.random() * 20)
            })),
            actionableInsights: strategicInsightsDemoData.keyFindings.map((finding, index) => ({
              insight: finding,
              action: `${finding}に関する具体的なアクション計画を策定`,
              priority: 'IMMEDIATE' as const,
              expectedOutcome: '効率性とROIの大幅な改善',
              requiredResources: ['プロジェクトマネージャー', '技術チーム', '予算承認']
            }))
          },
          performanceMetrics: {
            efficiencyGain: 28.5,
            successRate: 89.2,
            annualSavings: 850000000,
            qualityImprovement: 35.8,
            timeToValue: 6.2,
            employeeSatisfaction: 78.4
          },
          projectPipeline: {
            total: projectPipelineDemoData.projectCount,
            byStage: {
              proposal: projectPipelineDemoData.stages.planning.count,
              approval: projectPipelineDemoData.stages.execution.count,
              implementation: projectPipelineDemoData.stages.monitoring.count,
              completed: projectPipelineDemoData.stages.completed.count
            },
            upcoming: [
              {
                id: 'upcoming-1',
                name: 'デジタル変革プログラム',
                stage: 'planning',
                expectedROI: 245,
                daysUntilStart: 14
              },
              {
                id: 'upcoming-2', 
                name: 'AIアナリティクス導入',
                stage: 'approval',
                expectedROI: 192,
                daysUntilStart: 7
              }
            ]
          }
        };
        
        setData(analyticsData);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [timeframe, userLevel, roiEngine, insightsEngine, predictiveEngine]);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);
  
  // デフォルト値を返す
  const defaultData: AnalyticsData = {
    roiAnalytics: {
      averageROI: 0,
      totalProjects: 0,
      trend: 'STABLE',
      projects: [],
      historical: []
    },
    strategicInsights: {
      executiveSummary: '',
      strategicRecommendations: [],
      riskAssessment: {
        overallRiskScore: 0,
        riskBreakdown: {
          implementationRisks: [],
          financialRisks: [],
          operationalRisks: [],
          strategicRisks: []
        },
        mitigationStrategies: [],
        monitoringMetrics: []
      },
      futureProjections: [],
      benchmarkComparison: [],
      actionableInsights: []
    },
    performanceMetrics: {
      efficiencyGain: 0,
      successRate: 0,
      annualSavings: 0,
      qualityImprovement: 0,
      timeToValue: 0,
      employeeSatisfaction: 0
    },
    projectPipeline: {
      total: 0,
      byStage: {
        proposal: 0,
        approval: 0,
        implementation: 0,
        completed: 0
      },
      upcoming: []
    }
  };
  
  return {
    ...(data || defaultData),
    loading,
    error,
    refresh: fetchAnalyticsData
  };
};

// ヘルパー関数
async function fetchProjectsData(timeframe: string): Promise<any[]> {
  // 実際の実装では、APIからデータを取得
  // デモ用のダミーデータ
  return [
    {
      id: '1',
      name: '夜勤シフト改善',
      scope: 'FACILITY',
      complexity: 'MEDIUM',
      riskLevel: 'LOW',
      technologyCosts: 500000,
      metrics: {
        efficiency: {
          timeSavingHours: 200,
          averageHourlyRate: 3000,
          errorReductionPercent: 30,
          errorCost: 50000,
          monthlyErrors: 5
        }
      }
    },
    {
      id: '2',
      name: 'AI在庫管理',
      scope: 'DEPARTMENT',
      complexity: 'HIGH',
      riskLevel: 'MEDIUM',
      technologyCosts: 2000000,
      metrics: {
        efficiency: {
          timeSavingHours: 100,
          averageHourlyRate: 3000,
          errorReductionPercent: 50,
          errorCost: 100000,
          monthlyErrors: 10
        },
        cost: {
          materialsSaving: 300000,
          operationsSaving: 200000
        }
      }
    }
  ];
}

function calculateAverageROI(roiResults: ProjectROI[]): number {
  if (roiResults.length === 0) return 0;
  const total = roiResults.reduce((sum, result) => sum + result.roiPercentage, 0);
  return total / roiResults.length;
}

function determineTrend(roiResults: ProjectROI[]): 'UP' | 'DOWN' | 'STABLE' {
  // 簡易的なトレンド判定
  const averageROI = calculateAverageROI(roiResults);
  if (averageROI > 200) return 'UP';
  if (averageROI < 100) return 'DOWN';
  return 'STABLE';
}

function formatProjects(projectsData: any[], roiResults: ProjectROI[]): any[] {
  return projectsData.map((project, index) => ({
    id: project.id,
    name: project.name,
    roi: roiResults[index]?.roiPercentage || 0,
    investment: roiResults[index]?.totalInvestment || 0,
    returns: roiResults[index]?.totalBenefits || 0,
    status: 'ACTIVE'
  }));
}

function generateHistoricalData(timeframe: string): any[] {
  // デモ用の履歴データ生成
  const periods = timeframe === 'MONTHLY' ? 6 : timeframe === 'QUARTERLY' ? 4 : 12;
  const data = [];
  
  for (let i = periods - 1; i >= 0; i--) {
    data.push({
      period: `Period ${periods - i}`,
      averageROI: 150 + Math.random() * 100,
      projectCount: 10 + Math.floor(Math.random() * 20)
    });
  }
  
  return data;
}

function calculatePerformanceMetrics(projectsData: any[], roiResults: ProjectROI[]): any {
  return {
    efficiencyGain: 15.2,
    successRate: 98.7,
    annualSavings: 4800000,
    qualityImprovement: 22.5,
    timeToValue: 4.5,
    employeeSatisfaction: 85.3
  };
}

function generatePipelineData(projectsData: any[]): any {
  return {
    total: projectsData.length,
    byStage: {
      proposal: 8,
      approval: 5,
      implementation: 12,
      completed: 23
    },
    upcoming: [
      {
        id: '3',
        name: '電子カルテ改善',
        stage: 'approval',
        expectedROI: 180,
        daysUntilStart: 7
      },
      {
        id: '4',
        name: '患者情報共有システム',
        stage: 'proposal',
        expectedROI: 220,
        daysUntilStart: 14
      }
    ]
  };
}