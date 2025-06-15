// ExecutiveOverridePanel - 経営層オーバーライド選定UI
// Phase 4: Level 8戦略的変革による無制限権限・組織変革メンバー選定

import React, { useState, useEffect } from 'react';
import { 
  StrategicObjective, 
  TransformationScope, 
  StrategicSelectionResult,
  ExecutiveAlignment,
  TransformationReadiness,
  ImplementationPriority,
  ResourceCommitment
} from '../../services/StrategicOverrideService';
import StrategicOverrideService from '../../services/StrategicOverrideService';

interface ExecutiveOverridePanelProps {
  projectId: string;
  ceoId: string;
  onStrategicTransformation?: (result: StrategicSelectionResult) => void;
  onCancel?: () => void;
}

export const ExecutiveOverridePanel: React.FC<ExecutiveOverridePanelProps> = ({
  projectId,
  ceoId,
  onStrategicTransformation,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'objective' | 'scope' | 'readiness' | 'execution'>('objective');
  const [strategicObjective, setStrategicObjective] = useState<StrategicObjective>({
    vision: '',
    strategic_goals: [],
    business_drivers: [],
    competitive_advantage: [],
    market_positioning: '',
    timeline: {
      planning_phase: {
        name: '計画フェーズ',
        start_date: new Date(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3ヶ月後
        key_milestones: [],
        critical_decisions: [],
        resource_requirements: []
      },
      implementation_phase: {
        name: '実装フェーズ',
        start_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年後
        key_milestones: [],
        critical_decisions: [],
        resource_requirements: []
      },
      consolidation_phase: {
        name: '統合フェーズ',
        start_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 545 * 24 * 60 * 60 * 1000), // 18ヶ月後
        key_milestones: [],
        critical_decisions: [],
        resource_requirements: []
      },
      evaluation_phase: {
        name: '評価フェーズ',
        start_date: new Date(Date.now() + 545 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2年後
        key_milestones: [],
        critical_decisions: [],
        resource_requirements: []
      },
      total_duration: 24 // 24ヶ月
    },
    investment_rationale: '',
    expected_outcomes: []
  });

  const [transformationScope, setTransformationScope] = useState<TransformationScope>({
    digital_transformation: {
      technology_adoption: [],
      data_strategy: {
        data_governance: '',
        analytics_capability: '',
        data_quality_improvement: [],
        privacy_compliance: [],
        data_monetization: []
      },
      automation_roadmap: {
        process_automation: [],
        ai_integration: [],
        robotics_deployment: [],
        workflow_optimization: []
      },
      digital_skills_development: [],
      cybersecurity_enhancement: []
    },
    operational_excellence: {
      process_improvement: [],
      quality_enhancement: [],
      cost_optimization: [],
      resource_utilization: []
    },
    innovation_capability: {
      innovation_strategy: '',
      r_and_d_investment: 0,
      innovation_processes: [],
      collaboration_partnerships: [],
      intellectual_property_strategy: ''
    },
    market_expansion: {
      target_markets: [],
      market_entry_strategy: '',
      competitive_positioning: '',
      go_to_market_approach: [],
      partnership_strategy: []
    },
    regulatory_compliance: {
      compliance_frameworks: [],
      risk_management: {
        risk_assessment: '',
        risk_mitigation: [],
        monitoring_approach: '',
        escalation_procedures: []
      },
      audit_readiness: [],
      documentation_requirements: []
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [readinessAssessment, setReadinessAssessment] = useState<TransformationReadiness | null>(null);
  const [executiveAlignment, setExecutiveAlignment] = useState<ExecutiveAlignment | null>(null);
  const [implementationPriority, setImplementationPriority] = useState<ImplementationPriority[]>([]);
  const [resourceCommitment, setResourceCommitment] = useState<ResourceCommitment | null>(null);

  const strategicService = new StrategicOverrideService();

  useEffect(() => {
    // 初期データの設定
    initializeStrategicData();
  }, []);

  /**
   * 戦略データの初期化
   */
  const initializeStrategicData = async () => {
    // デモ用の戦略目標を設定
    const demoObjective: StrategicObjective = {
      ...strategicObjective,
      vision: '次世代医療サービスへの完全移行',
      strategic_goals: [
        {
          id: 'digital_transformation',
          description: 'デジタル技術を活用した医療サービスの革新',
          category: 'DIGITAL_TRANSFORMATION',
          priority: 'CRITICAL',
          measurable_targets: [
            {
              metric: 'デジタル化率',
              current_value: 30,
              target_value: 90,
              measurement_unit: '%',
              target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              measurement_frequency: 'MONTHLY'
            }
          ],
          dependencies: ['インフラ整備', '人材育成'],
          risk_factors: ['技術的課題', '組織抵抗'],
          success_criteria: ['システム稼働率95%以上', 'ユーザー満足度80%以上']
        }
      ],
      business_drivers: [
        {
          type: 'TECHNOLOGY_ADVANCEMENT',
          description: 'AI・IoT技術の医療分野への本格導入',
          urgency: 'IMMEDIATE',
          impact: 'HIGH',
          response_strategy: '積極的技術導入と人材育成'
        }
      ],
      competitive_advantage: ['先進技術活用', '患者中心サービス', '効率的運営'],
      market_positioning: '地域における次世代医療のリーディングプロバイダー'
    };

    setStrategicObjective(demoObjective);
  };

  /**
   * 変革準備度の評価
   */
  const assessTransformationReadiness = async () => {
    setLoading(true);
    try {
      const readiness = await strategicService.assessTransformationReadiness(strategicObjective);
      setReadinessAssessment(readiness);
    } catch (err) {
      setError('変革準備度評価に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 戦略的変革の実行
   */
  const executeStrategicTransformation = async () => {
    if (!strategicObjective.vision) {
      setError('戦略ビジョンを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await strategicService.executeStrategicOverride(
        projectId,
        ceoId,
        strategicObjective,
        transformationScope
      );

      if (result.success) {
        setReadinessAssessment(result.transformation_readiness);
        setExecutiveAlignment(result.executive_alignment);
        setImplementationPriority(result.implementation_priority);
        setResourceCommitment(result.resource_commitment);
        
        onStrategicTransformation?.(result);
        setActiveTab('execution');
      } else {
        setError(result.errors?.join(', ') || '戦略的変革の実行に失敗しました');
      }

    } catch (err) {
      setError('戦略的変革実行中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 戦略目標タブ
   */
  const renderObjectiveTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600 text-xl">🏛️</span>
          <h3 className="font-bold text-blue-800">経営層戦略権限</h3>
        </div>
        <p className="text-blue-700 text-sm">
          Level 8 CEO・理事長権限による組織全体の戦略的変革。無制限予算・人事権を行使できます。
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">戦略ビジョンと目標</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">変革ビジョン</label>
          <textarea
            value={strategicObjective.vision}
            onChange={(e) => setStrategicObjective({
              ...strategicObjective,
              vision: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="組織が目指す将来像を記述してください"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">市場ポジショニング</label>
          <input
            type="text"
            value={strategicObjective.market_positioning}
            onChange={(e) => setStrategicObjective({
              ...strategicObjective,
              market_positioning: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="目標とする市場での位置づけ"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">投資根拠</label>
          <textarea
            value={strategicObjective.investment_rationale}
            onChange={(e) => setStrategicObjective({
              ...strategicObjective,
              investment_rationale: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="なぜこの変革に投資するのか、その理由"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">競争優位性</h4>
            <div className="space-y-2">
              {['先進技術活用', '患者中心サービス', '効率的運営', 'データ活用'].map((advantage) => (
                <label key={advantage} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={strategicObjective.competitive_advantage.includes(advantage)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setStrategicObjective({
                          ...strategicObjective,
                          competitive_advantage: [...strategicObjective.competitive_advantage, advantage]
                        });
                      } else {
                        setStrategicObjective({
                          ...strategicObjective,
                          competitive_advantage: strategicObjective.competitive_advantage.filter(a => a !== advantage)
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{advantage}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">戦略期間</h4>
            <div className="text-sm space-y-1">
              <div>計画期間: {strategicObjective.timeline.total_duration}ヶ月</div>
              <div>開始: {strategicObjective.timeline.planning_phase.start_date.toLocaleDateString()}</div>
              <div>完了予定: {strategicObjective.timeline.evaluation_phase.end_date.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          キャンセル
        </button>
        <button
          onClick={() => setActiveTab('scope')}
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
        >
          変革範囲を設定 →
        </button>
      </div>
    </div>
  );

  /**
   * 変革範囲タブ
   */
  const renderScopeTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">変革範囲の設定</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>💻</span>
            デジタル変革
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">デジタルスキル開発</label>
              <div className="space-y-1">
                {['AI・機械学習', 'データ分析', 'クラウド技術', 'サイバーセキュリティ'].map((skill) => (
                  <label key={skill} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={transformationScope.digital_transformation.digital_skills_development.includes(skill)}
                      onChange={(e) => {
                        const skills = transformationScope.digital_transformation.digital_skills_development;
                        if (e.target.checked) {
                          setTransformationScope({
                            ...transformationScope,
                            digital_transformation: {
                              ...transformationScope.digital_transformation,
                              digital_skills_development: [...skills, skill]
                            }
                          });
                        } else {
                          setTransformationScope({
                            ...transformationScope,
                            digital_transformation: {
                              ...transformationScope.digital_transformation,
                              digital_skills_development: skills.filter(s => s !== skill)
                            }
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>⚡</span>
            運営効率化
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">改善対象プロセス</label>
              <div className="space-y-1">
                {['患者受付', '診察予約', '医療記録', '請求処理'].map((process) => (
                  <label key={process} className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" />
                    {process}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>🚀</span>
            イノベーション
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">R&D投資額（円）</label>
              <input
                type="number"
                value={transformationScope.innovation_capability.r_and_d_investment}
                onChange={(e) => setTransformationScope({
                  ...transformationScope,
                  innovation_capability: {
                    ...transformationScope.innovation_capability,
                    r_and_d_investment: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="50000000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">戦略</label>
              <textarea
                value={transformationScope.innovation_capability.innovation_strategy}
                onChange={(e) => setTransformationScope({
                  ...transformationScope,
                  innovation_capability: {
                    ...transformationScope.innovation_capability,
                    innovation_strategy: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows={2}
                placeholder="イノベーション戦略"
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>🌍</span>
            市場拡大
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">参入戦略</label>
              <input
                type="text"
                value={transformationScope.market_expansion.market_entry_strategy}
                onChange={(e) => setTransformationScope({
                  ...transformationScope,
                  market_expansion: {
                    ...transformationScope.market_expansion,
                    market_entry_strategy: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="新市場への参入戦略"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">競合ポジショニング</label>
              <input
                type="text"
                value={transformationScope.market_expansion.competitive_positioning}
                onChange={(e) => setTransformationScope({
                  ...transformationScope,
                  market_expansion: {
                    ...transformationScope.market_expansion,
                    competitive_positioning: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="競合他社との差別化"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={() => setActiveTab('objective')}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          ← 戻る
        </button>
        <div className="flex gap-3">
          <button
            onClick={assessTransformationReadiness}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-400 rounded-md"
          >
            {loading ? '評価中...' : '準備度評価'}
          </button>
          <button
            onClick={() => setActiveTab('readiness')}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
          >
            準備度確認 →
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * 準備度評価タブ
   */
  const renderReadinessTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">変革準備度評価</h3>

      {readinessAssessment ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: '組織準備度', value: readinessAssessment.organizational_readiness, color: 'blue' },
              { label: 'リーダーシップ', value: readinessAssessment.leadership_commitment, color: 'green' },
              { label: 'リソース', value: readinessAssessment.resource_availability, color: 'yellow' },
              { label: '変革能力', value: readinessAssessment.change_capability, color: 'purple' },
              { label: 'ステークホルダー', value: readinessAssessment.stakeholder_support, color: 'pink' }
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-2xl font-bold text-${color}-600 mb-1`}>{value}%</div>
                <div className="text-sm text-gray-600">{label}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`bg-${color}-600 h-2 rounded-full`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">準備度ギャップ</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {readinessAssessment.readiness_gaps.map((gap, index) => (
                  <li key={index}>• {gap}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">加速機会</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {readinessAssessment.acceleration_opportunities.map((opportunity, index) => (
                  <li key={index}>• {opportunity}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>準備度評価を実行してください</p>
          <button
            onClick={assessTransformationReadiness}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
          >
            {loading ? '評価中...' : '準備度評価を実行'}
          </button>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <button
          onClick={() => setActiveTab('scope')}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          ← 戻る
        </button>
        <button
          onClick={() => setActiveTab('execution')}
          disabled={!readinessAssessment}
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-md font-medium"
        >
          戦略実行 →
        </button>
      </div>
    </div>
  );

  /**
   * 実行タブ
   */
  const renderExecutionTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">戦略的変革の実行</h3>

      {resourceCommitment ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">✅ 戦略的変革が承認されました</h4>
            <p className="text-green-700 text-sm">
              Level 8権限により、組織全体の戦略的変革が正式に承認・実行されました。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">💰 投資コミット</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>総投資額:</span>
                  <span className="font-medium">¥{resourceCommitment.total_investment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>予想ROI:</span>
                  <span className="font-medium text-green-600">
                    {resourceCommitment.roi_projections[0]?.roi_percentage || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>信頼度:</span>
                  <span className="font-medium">
                    {resourceCommitment.roi_projections[0]?.confidence_level || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">⚡ 実装優先度</h4>
              <div className="space-y-2">
                {implementationPriority.slice(0, 3).map((priority, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      priority.priority_level === 'IMMEDIATE' ? 'bg-red-100 text-red-800' :
                      priority.priority_level === 'SHORT_TERM' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {priority.priority_level}
                    </span>
                    <span>{priority.initiative}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {executiveAlignment && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">👥 経営陣アライメント</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {executiveAlignment.alignment_score}%
                    </span>
                    <div className="text-sm text-gray-600">全体アライメント</div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">合意領域</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {executiveAlignment.consensus_areas.map((area, index) => (
                      <li key={index}>• {area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">📋 次のステップ</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 戦略実行チームの正式編成</li>
              <li>• ステークホルダーへの変革計画発表</li>
              <li>• 第1フェーズ実装の開始</li>
              <li>• 進捗監視システムの稼働</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h4 className="font-medium mb-2">戦略的変革を実行しますか？</h4>
          <p className="text-sm text-gray-600 mb-6">
            この操作により、Level 8権限で組織全体の戦略的変革が開始されます。<br/>
            通常の承認プロセスは迂回され、無制限の予算・人事権が行使されます。
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('readiness')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              ← 準備度を再確認
            </button>
            <button
              onClick={executeStrategicTransformation}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 rounded-md font-medium"
            >
              {loading ? '実行中...' : '🏛️ 戦略的変革を実行'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading && activeTab !== 'execution') {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-700 font-medium">戦略分析実行中...</p>
        <p className="text-sm text-gray-600 mt-1">組織変革計画を策定しています</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200">
      <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-semibold text-blue-900">🏛️ 経営層戦略オーバーライド</h2>
        <p className="text-sm text-blue-700 mt-1">Level 8 CEO・理事長権限による戦略的組織変革</p>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'objective', label: '戦略目標', icon: '🎯' },
            { id: 'scope', label: '変革範囲', icon: '🌐' },
            { id: 'readiness', label: '準備度評価', icon: '📊' },
            { id: 'execution', label: '戦略実行', icon: '🚀' }
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
              <span>{tab?.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'objective' && renderObjectiveTab()}
        {activeTab === 'scope' && renderScopeTab()}
        {activeTab === 'readiness' && renderReadinessTab()}
        {activeTab === 'execution' && renderExecutionTab()}
      </div>
    </div>
  );
};

export default ExecutiveOverridePanel;