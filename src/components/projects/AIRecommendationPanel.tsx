// AIRecommendationPanel - AI支援メンバー選定UI
// Phase 3: スキルマッチング・最適化・インサイト表示

import React, { useState, useEffect } from 'react';
import { MemberCandidate, SelectionCriteria } from '../../types/memberSelection';
import {
  AIRecommendation,
  TeamComposition,
  TeamInsight,
  RiskAssessment,
  OptimizationConstraints,
  PerformancePrediction,
  SkillProfile
} from '../../services/AIAssistedMemberSelectionService';
import AIAssistedMemberSelectionService from '../../services/AIAssistedMemberSelectionService';

interface AIRecommendationPanelProps {
  projectId: string;
  criteria: SelectionCriteria;
  onTeamSelect?: (team: TeamComposition) => void;
  onAnalysisComplete?: (recommendation: AIRecommendation) => void;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  projectId,
  criteria,
  onTeamSelect,
  onAnalysisComplete
}) => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendation' | 'insights' | 'risks' | 'prediction'>('recommendation');
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    mustIncludeSkills: ['プロジェクト管理', '文書作成'],
    preferredSkills: ['データ分析', 'コミュニケーション'],
    maxWorkloadPerMember: 80,
    minExperienceLevel: 2,
    diversityTargets: {
      departmentDiversity: 3,
      experienceMix: { junior: 30, mid: 50, senior: 20 },
      skillDiversity: 5
    },
    budgetConstraints: {
      maxTotalCost: 5000000,
      costPerMember: {},
      overheadPercentage: 15
    }
  });
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);

  const aiService = new AIAssistedMemberSelectionService();

  useEffect(() => {
    generateAIRecommendation();
  }, [projectId, criteria]);

  /**
   * AI推奨を生成
   */
  const generateAIRecommendation = async () => {
    setLoading(true);
    try {
      const result = await aiService.suggestOptimalTeam(projectId, criteria, constraints);
      setRecommendation(result);
      onAnalysisComplete?.(result);

      // パフォーマンス予測も生成
      if (result.recommendedTeam.members.length > 0) {
        const performancePred = await aiService.predictTeamPerformance(
          result.recommendedTeam.members.map(m => m.candidate),
          { complexity: 'medium', duration: 180 }
        );
        setPrediction(performancePred);
      }
    } catch (error) {
      console.error('AI推奨生成エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * チーム選択
   */
  const selectTeam = (index: number) => {
    setSelectedTeamIndex(index);
    if (recommendation) {
      const teams = [recommendation.recommendedTeam, ...recommendation.alternativeTeams];
      onTeamSelect?.(teams[index]);
    }
  };

  /**
   * スコア表示コンポーネント
   */
  const ScoreIndicator: React.FC<{ label: string; value: number; max?: number }> = ({ 
    label, 
    value, 
    max = 100 
  }) => {
    const percentage = (value / max) * 100;
    const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span className="font-medium">{value}/{max}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  /**
   * チーム推奨タブ
   */
  const renderRecommendationTab = () => {
    if (!recommendation) return null;

    const teams = [recommendation.recommendedTeam, ...recommendation.alternativeTeams];
    const selectedTeam = teams[selectedTeamIndex];

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">AI最適化結果</h3>
            <div className="flex gap-2">
              <span className="text-sm text-blue-600">成功確率: {recommendation.successProbability}%</span>
              <span className="text-sm text-blue-600">最適化スコア: {recommendation.optimizationScore}/100</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{selectedTeam.members.length}</div>
              <div className="text-xs text-gray-600">メンバー数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{selectedTeam.skillCoverage}%</div>
              <div className="text-xs text-gray-600">スキルカバー率</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{selectedTeam.workloadBalance}%</div>
              <div className="text-xs text-gray-600">負荷バランス</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{selectedTeam.diversityScore}%</div>
              <div className="text-xs text-gray-600">多様性スコア</div>
            </div>
          </div>
        </div>

        {/* チーム選択タブ */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {teams.slice(0, 4).map((team, index) => (
              <button
                key={index}
                onClick={() => selectTeam(index)}
                className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTeamIndex === index
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {index === 0 ? '推奨チーム' : `代替案 ${index}`}
                <span className="ml-1 text-xs">({team.totalScore}点)</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 選択されたチームの詳細 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">メンバー構成</h4>
            <div className="space-y-3">
              {selectedTeam.members.map((member, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">{member.candidate.user.name}</h5>
                      <p className="text-sm text-gray-600">
                        {member.candidate.user.department} - {member.candidate.user.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        マッチ度: {member.matchScore}%
                      </div>
                      <div className="text-xs text-gray-500">
                        負荷: {member.workloadImpact}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {member.contribution.map((contrib, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {contrib}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    役割: {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">チーム評価</h4>
            <div className="space-y-3">
              <ScoreIndicator label="スキルカバレッジ" value={selectedTeam.skillCoverage} />
              <ScoreIndicator label="負荷バランス" value={selectedTeam.workloadBalance} />
              <ScoreIndicator label="多様性スコア" value={selectedTeam.diversityScore} />
              <ScoreIndicator label="総合スコア" value={selectedTeam.totalScore} />
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>推定コスト:</span>
                  <span className="font-medium">¥{selectedTeam.estimatedCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>推定期間:</span>
                  <span className="font-medium">{selectedTeam.estimatedDuration}日</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={generateAIRecommendation}
            disabled={loading}
            className="px-4 py-2 text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-md"
          >
            再分析
          </button>
          <button
            onClick={() => onTeamSelect?.(selectedTeam)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          >
            このチームを選択
          </button>
        </div>
      </div>
    );
  };

  /**
   * インサイトタブ
   */
  const renderInsightsTab = () => {
    if (!recommendation) return null;

    const groupedInsights = recommendation.insights.reduce((groups, insight) => {
      if (!groups[insight.type]) groups[insight.type] = [];
      groups[insight.type].push(insight);
      return groups;
    }, {} as Record<string, TeamInsight[]>);

    const getInsightIcon = (type: TeamInsight['type']) => {
      const iconMap = {
        STRENGTH: '💪',
        WEAKNESS: '⚠️',
        OPPORTUNITY: '🚀',
        RISK: '⚡'
      };
      return iconMap[type];
    };

    const getInsightColor = (type: TeamInsight['type']) => {
      const colorMap = {
        STRENGTH: 'bg-green-50 border-green-200 text-green-800',
        WEAKNESS: 'bg-orange-50 border-orange-200 text-orange-800',
        OPPORTUNITY: 'bg-blue-50 border-blue-200 text-blue-800',
        RISK: 'bg-red-50 border-red-200 text-red-800'
      };
      return colorMap[type];
    };

    return (
      <div className="space-y-6">
        {Object.entries(groupedInsights).map(([type, insights]) => (
          <div key={type}>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span>{getInsightIcon(type as TeamInsight['type'])}</span>
              {type === 'STRENGTH' ? '強み' : 
               type === 'WEAKNESS' ? '弱み' : 
               type === 'OPPORTUNITY' ? '機会' : 'リスク'}
              <span className="text-sm text-gray-500">({insights.length})</span>
            </h4>
            
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{insight.category}</div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      insight.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.impact === 'HIGH' ? '高' : insight.impact === 'MEDIUM' ? '中' : '低'} 影響
                    </span>
                  </div>
                  
                  <p className="text-sm mb-3">{insight.description}</p>
                  
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1">推奨アクション:</div>
                      <ul className="text-xs space-y-1">
                        {insight.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * リスクタブ
   */
  const renderRisksTab = () => {
    if (!recommendation) return null;

    const { riskAssessment } = recommendation;
    
    const getRiskColor = (level: string) => {
      const colorMap = {
        HIGH: 'bg-red-500',
        MEDIUM: 'bg-yellow-500',
        LOW: 'bg-green-500'
      };
      return colorMap[level as keyof typeof colorMap];
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-medium">総合リスクレベル</h3>
            <span className={`px-3 py-1 text-white text-sm rounded-full ${getRiskColor(riskAssessment.overallRiskLevel)}`}>
              {riskAssessment.overallRiskLevel === 'HIGH' ? '高' : 
               riskAssessment.overallRiskLevel === 'MEDIUM' ? '中' : '低'}
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">特定されたリスク</h4>
          <div className="space-y-3">
            {riskAssessment.risks.map((risk, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium">{risk.type}</h5>
                  <div className="text-right text-sm">
                    <div>発生確率: {risk.probability}%</div>
                    <div>影響度: {risk.impact}%</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{risk.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {risk.affectedAreas.map((area, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">緩和戦略</h4>
          <div className="space-y-3">
            {riskAssessment.mitigationStrategies.map((strategy, index) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-blue-800">
                    {strategy.riskType} への対策
                  </h5>
                  <div className="text-right text-sm text-blue-600">
                    <div>効果: {strategy.effectiveness}%</div>
                    <div>コスト: ¥{strategy.cost.toLocaleString()}</div>
                  </div>
                </div>
                
                <p className="text-sm text-blue-700">{strategy.strategy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * パフォーマンス予測タブ
   */
  const renderPredictionTab = () => {
    if (!prediction) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">予想完了日</h4>
            <div className="text-2xl font-bold text-green-600">
              {prediction.expectedCompletion.toLocaleDateString('ja-JP')}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">成功確率</h4>
            <div className="text-2xl font-bold text-blue-600">
              {prediction.successProbability}%
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">品質予測</h4>
          <ScoreIndicator label="品質スコア" value={prediction.qualityScore} />
        </div>

        <div>
          <h4 className="font-medium mb-3">重要マイルストーン</h4>
          <div className="space-y-3">
            {prediction.criticalMilestones.map((milestone, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{milestone.name}</h5>
                  <div className="text-right text-sm">
                    <div>{milestone.expectedDate.toLocaleDateString('ja-JP')}</div>
                    <div className="text-green-600">{milestone.completionProbability}% 確率</div>
                  </div>
                </div>
                
                {milestone.criticalPath && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    クリティカルパス
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">フェーズ別パフォーマンス</h4>
          <div className="space-y-3">
            {prediction.performanceByPhase.map((phase, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium">{phase.phase}</h5>
                  <div className="text-sm">
                    <span className="text-gray-600">{phase.expectedDuration}日</span>
                    <span className="ml-2 text-green-600">信頼度: {phase.confidenceLevel}%</span>
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-600">主要リスク:</span>
                    <span className="ml-1">{phase.keyRisks.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">必要スキル:</span>
                    <span className="ml-1">{phase.requiredSkills.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {prediction.riskFactors.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">リスクファクター</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.riskFactors.map((factor, index) => (
                <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">AI分析中...</p>
        <p className="text-sm text-gray-500 mt-1">最適なチーム構成を計算しています</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">AI支援メンバー選定</h2>
        <p className="text-sm text-gray-600 mt-1">機械学習による最適チーム構成とインサイト</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'recommendation', label: '推奨チーム', icon: '🎯' },
            { id: 'insights', label: 'インサイト', icon: '💡' },
            { id: 'risks', label: 'リスク分析', icon: '⚠️' },
            { id: 'prediction', label: 'パフォーマンス予測', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'recommendation' && renderRecommendationTab()}
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'risks' && renderRisksTab()}
        {activeTab === 'prediction' && renderPredictionTab()}
      </div>
    </div>
  );
};

export default AIRecommendationPanel;