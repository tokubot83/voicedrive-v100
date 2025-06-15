// SelectionSimulationUI - 選定効果予測・シミュレーションUI
// Phase 5: 様々な選定シナリオの効果予測・リスク分析・最適解探索インターフェース

import React, { useState, useEffect, useCallback } from 'react';
import { 
  SelectionSimulation,
  SimulationType,
  ScenarioDefinition,
  SimulationResult,
  OptimizationRecommendation,
  SensitivityAnalysis
} from '../../services/SelectionSimulationService';
import SelectionSimulationService from '../../services/SelectionSimulationService';

interface SelectionSimulationUIProps {
  userId: string;
  permissionLevel: number;
  projectId?: string;
  onSimulationComplete?: (results: SimulationResult[]) => void;
}

interface SimulationSetup {
  simulation_name: string;
  simulation_type: SimulationType;
  base_scenario: BaseScenarioInput;
  alternative_scenarios: AlternativeScenarioInput[];
  variable_parameters: VariableParameterInput[];
  monte_carlo_iterations: number;
  confidence_level: number;
}

interface BaseScenarioInput {
  scenario_name: string;
  description: string;
  team_size: number;
  budget: number;
  timeline_days: number;
  complexity_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  required_skills: SkillInput[];
  risk_tolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

interface SkillInput {
  skill_name: string;
  required_level: number;
  criticality: 'ESSENTIAL' | 'IMPORTANT' | 'PREFERRED' | 'OPTIONAL';
}

interface AlternativeScenarioInput {
  scenario_name: string;
  description: string;
  parameter_changes: { [key: string]: any };
}

interface VariableParameterInput {
  parameter_name: string;
  min_value: number;
  max_value: number;
  distribution_type: 'UNIFORM' | 'NORMAL' | 'TRIANGULAR';
}

interface SimulationProgress {
  current_step: number;
  total_steps: number;
  step_description: string;
  progress_percentage: number;
  estimated_time_remaining: number; // 秒
}

export const SelectionSimulationUI: React.FC<SelectionSimulationUIProps> = ({
  userId,
  permissionLevel,
  projectId,
  onSimulationComplete
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'scenarios' | 'parameters' | 'results' | 'analysis'>('setup');
  const [simulationSetup, setSimulationSetup] = useState<SimulationSetup>({
    simulation_name: '',
    simulation_type: 'SCENARIO_COMPARISON',
    base_scenario: {
      scenario_name: 'ベースシナリオ',
      description: '',
      team_size: 8,
      budget: 10000000,
      timeline_days: 180,
      complexity_level: 'MEDIUM',
      required_skills: [],
      risk_tolerance: 'MODERATE'
    },
    alternative_scenarios: [],
    variable_parameters: [],
    monte_carlo_iterations: 1000,
    confidence_level: 95
  });

  const [currentSimulation, setCurrentSimulation] = useState<SelectionSimulation | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [simulationProgress, setSimulationProgress] = useState<SimulationProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<OptimizationRecommendation[]>([]);

  const simulationService = new SelectionSimulationService();

  // シミュレーションの作成
  const createSimulation = async () => {
    if (!simulationSetup.simulation_name) {
      setError('シミュレーション名を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // シナリオ定義の構築
      const scenario_definition: ScenarioDefinition = {
        base_scenario: {
          scenario_name: simulationSetup.base_scenario.scenario_name,
          description: simulationSetup.base_scenario.description,
          project_characteristics: {
            project_type: 'member_selection',
            complexity_level: simulationSetup.base_scenario.complexity_level,
            required_skills: simulationSetup.base_scenario.required_skills.map(skill => ({
              skill_category: skill.skill_name,
              required_level: skill.required_level,
              criticality: skill.criticality,
              rarity_factor: 0.5
            })),
            budget_range: {
              min_budget: simulationSetup.base_scenario.budget * 0.8,
              max_budget: simulationSetup.base_scenario.budget * 1.2,
              preferred_budget: simulationSetup.base_scenario.budget,
              cost_flexibility: 0.2
            },
            risk_tolerance: simulationSetup.base_scenario.risk_tolerance,
            innovation_level: 'INCREMENTAL',
            market_impact: 'LOCAL'
          },
          team_requirements: {
            team_size_range: {
              min_size: Math.max(1, simulationSetup.base_scenario.team_size - 2),
              max_size: simulationSetup.base_scenario.team_size + 3,
              optimal_size: simulationSetup.base_scenario.team_size,
              size_flexibility: 0.3
            },
            composition_requirements: [],
            collaboration_style: 'COLLABORATIVE',
            communication_frequency: 'WEEKLY',
            decision_making_style: 'CONSENSUS'
          },
          resource_constraints: {
            financial_constraints: {
              total_budget: simulationSetup.base_scenario.budget,
              monthly_budget_limit: simulationSetup.base_scenario.budget / 6,
              cost_per_member_limit: simulationSetup.base_scenario.budget / simulationSetup.base_scenario.team_size,
              overhead_allowance: simulationSetup.base_scenario.budget * 0.15,
              contingency_fund: simulationSetup.base_scenario.budget * 0.1
            },
            time_constraints: {
              project_duration: Math.round(simulationSetup.base_scenario.timeline_days / 30),
              selection_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              key_milestones: [],
              critical_path_constraints: []
            },
            infrastructure_constraints: {
              required_tools: [],
              workspace_requirements: [],
              technology_stack: [],
              security_clearance_needed: false
            },
            regulatory_constraints: {
              compliance_requirements: [],
              certification_needed: [],
              audit_requirements: [],
              geographical_restrictions: []
            }
          },
          timeline_constraints: {
            start_date: new Date(),
            end_date: new Date(Date.now() + simulationSetup.base_scenario.timeline_days * 24 * 60 * 60 * 1000),
            phase_definitions: [],
            dependency_constraints: []
          },
          external_factors: []
        },
        alternative_scenarios: simulationSetup.alternative_scenarios.map(alt => ({
          scenario_id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          scenario_name: alt.scenario_name,
          description: alt.description,
          parameter_variations: Object.entries(alt.parameter_changes).map(([key, value]) => ({
            parameter_name: key,
            base_value: (simulationSetup.base_scenario as any)[key],
            alternative_value: value,
            variation_type: 'ABSOLUTE',
            confidence_level: 0.9
          })),
          expected_outcomes: [],
          risk_factors: []
        })),
        variable_parameters: simulationSetup.variable_parameters.map(param => ({
          parameter_id: `param_${param.parameter_name}`,
          parameter_name: param.parameter_name,
          parameter_type: 'CONTINUOUS',
          value_range: {
            min_value: param.min_value,
            max_value: param.max_value,
            distribution_type: param.distribution_type
          },
          default_value: (param.min_value + param.max_value) / 2,
          sensitivity_weight: 0.5,
          constraints: []
        })),
        constraint_definitions: [],
        success_criteria: [
          {
            criteria_id: 'project_success',
            criteria_name: 'プロジェクト成功率',
            measurement_metric: 'success_rate',
            target_value: 85,
            measurement_unit: 'percentage',
            weight: 0.4,
            evaluation_method: 'OBJECTIVE'
          }
        ]
      };

      // シミュレーションの作成
      const simulation = await simulationService.createSimulation(
        simulationSetup.simulation_name,
        simulationSetup.simulation_type,
        scenario_definition,
        userId
      );

      setCurrentSimulation(simulation);
      setActiveTab('results');

    } catch (err) {
      setError(`シミュレーション作成エラー: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // シミュレーションの実行
  const runSimulation = async () => {
    if (!currentSimulation) {
      setError('シミュレーションが作成されていません');
      return;
    }

    setLoading(true);
    setError('');

    // プログレス追跡の開始
    const progressTracker = setInterval(() => {
      setSimulationProgress(prev => {
        if (!prev) {
          return {
            current_step: 1,
            total_steps: 5,
            step_description: 'ベースシナリオの実行',
            progress_percentage: 20,
            estimated_time_remaining: 45
          };
        }
        
        const new_step = Math.min(prev.current_step + 1, prev.total_steps);
        const steps = [
          'ベースシナリオの実行',
          '代替シナリオの実行',
          'モンテカルロシミュレーション',
          '感度分析の実行',
          '結果の統合・分析'
        ];
        
        return {
          current_step: new_step,
          total_steps: prev.total_steps,
          step_description: steps[new_step - 1] || '完了',
          progress_percentage: (new_step / prev.total_steps) * 100,
          estimated_time_remaining: Math.max(0, prev.estimated_time_remaining - 10)
        };
      });
    }, 2000);

    try {
      // シミュレーションの実行
      const results = await simulationService.runSimulation(
        currentSimulation.simulation_id,
        simulationSetup.monte_carlo_iterations
      );

      // プログレス追跡の停止
      clearInterval(progressTracker);
      setSimulationProgress(null);

      setSimulationResults(results);
      setOptimizationRecommendations(currentSimulation.optimization_recommendations);
      
      onSimulationComplete?.(results);

    } catch (err) {
      clearInterval(progressTracker);
      setSimulationProgress(null);
      setError(`シミュレーション実行エラー: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // What-if分析の実行
  const performWhatIfAnalysis = async (parameterChanges: { [key: string]: any }) => {
    if (!currentSimulation) return;

    setLoading(true);
    try {
      const changes = Object.entries(parameterChanges).map(([key, value]) => ({
        parameter_name: key,
        percentage_change: ((value - (simulationSetup.base_scenario as any)[key]) / (simulationSetup.base_scenario as any)[key]) * 100
      }));

      const whatIfResult = await simulationService.performWhatIfAnalysis(
        currentSimulation.simulation_id,
        changes
      );

      // What-if結果の表示
      console.log('What-if Analysis Result:', whatIfResult);

    } catch (err) {
      setError(`What-if分析エラー: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * セットアップタブ
   */
  const renderSetupTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600 text-xl">🎯</span>
          <h3 className="font-bold text-blue-800">選定効果シミュレーション</h3>
        </div>
        <p className="text-blue-700 text-sm">
          様々な選定シナリオの効果を予測し、最適な戦略を特定します。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">基本設定</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">シミュレーション名</label>
              <input
                type="text"
                value={simulationSetup.simulation_name}
                onChange={(e) => setSimulationSetup(prev => ({
                  ...prev,
                  simulation_name: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: Q4選定戦略比較"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">シミュレーションタイプ</label>
              <select
                value={simulationSetup.simulation_type}
                onChange={(e) => setSimulationSetup(prev => ({
                  ...prev,
                  simulation_type: e.target.value as SimulationType
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SCENARIO_COMPARISON">シナリオ比較</option>
                <option value="MONTE_CARLO">モンテカルロシミュレーション</option>
                <option value="SENSITIVITY_ANALYSIS">感度分析</option>
                <option value="WHAT_IF_ANALYSIS">What-if分析</option>
                <option value="OPTIMIZATION_SEARCH">最適化探索</option>
                <option value="RISK_ASSESSMENT">リスク評価</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">信頼度レベル (%)</label>
              <input
                type="number"
                value={simulationSetup.confidence_level}
                onChange={(e) => setSimulationSetup(prev => ({
                  ...prev,
                  confidence_level: parseInt(e.target.value) || 95
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="80"
                max="99"
              />
            </div>

            {simulationSetup.simulation_type === 'MONTE_CARLO' && (
              <div>
                <label className="block text-sm font-medium mb-2">シミュレーション回数</label>
                <input
                  type="number"
                  value={simulationSetup.monte_carlo_iterations}
                  onChange={(e) => setSimulationSetup(prev => ({
                    ...prev,
                    monte_carlo_iterations: parseInt(e.target.value) || 1000
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="10000"
                  step="100"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">ベースシナリオ</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">シナリオ名</label>
              <input
                type="text"
                value={simulationSetup.base_scenario.scenario_name}
                onChange={(e) => setSimulationSetup(prev => ({
                  ...prev,
                  base_scenario: {
                    ...prev.base_scenario,
                    scenario_name: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">チーム規模</label>
                <input
                  type="number"
                  value={simulationSetup.base_scenario.team_size}
                  onChange={(e) => setSimulationSetup(prev => ({
                    ...prev,
                    base_scenario: {
                      ...prev.base_scenario,
                      team_size: parseInt(e.target.value) || 8
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">期間 (日)</label>
                <input
                  type="number"
                  value={simulationSetup.base_scenario.timeline_days}
                  onChange={(e) => setSimulationSetup(prev => ({
                    ...prev,
                    base_scenario: {
                      ...prev.base_scenario,
                      timeline_days: parseInt(e.target.value) || 180
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="730"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">予算 (円)</label>
              <input
                type="number"
                value={simulationSetup.base_scenario.budget}
                onChange={(e) => setSimulationSetup(prev => ({
                  ...prev,
                  base_scenario: {
                    ...prev.base_scenario,
                    budget: parseInt(e.target.value) || 10000000
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="1000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">複雑度</label>
              <select
                value={simulationSetup.base_scenario.complexity_level}
                onChange={(e) => setSimulationSetup(prev => ({
                  ...prev,
                  base_scenario: {
                    ...prev.base_scenario,
                    complexity_level: e.target.value as any
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
                <option value="CRITICAL">最高</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">リスク許容度</label>
              <select
                value={simulationSetup.base_scenario.risk_tolerance}
                onChange={(e) => setSimulationSetup(prev => ({
                  ...prev,
                  base_scenario: {
                    ...prev.base_scenario,
                    risk_tolerance: e.target.value as any
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CONSERVATIVE">保守的</option>
                <option value="MODERATE">中程度</option>
                <option value="AGGRESSIVE">積極的</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setActiveTab('scenarios')}
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
        >
          シナリオ設定 →
        </button>
      </div>
    </div>
  );

  /**
   * シナリオタブ
   */
  const renderScenariosTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">代替シナリオの設定</h3>
      
      <div className="space-y-4">
        {simulationSetup.alternative_scenarios.map((scenario, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium">シナリオ {index + 1}</h4>
              <button
                onClick={() => {
                  const newScenarios = [...simulationSetup.alternative_scenarios];
                  newScenarios.splice(index, 1);
                  setSimulationSetup(prev => ({
                    ...prev,
                    alternative_scenarios: newScenarios
                  }));
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                削除
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">シナリオ名</label>
                <input
                  type="text"
                  value={scenario.scenario_name}
                  onChange={(e) => {
                    const newScenarios = [...simulationSetup.alternative_scenarios];
                    newScenarios[index].scenario_name = e.target.value;
                    setSimulationSetup(prev => ({
                      ...prev,
                      alternative_scenarios: newScenarios
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="例: 大規模チーム構成"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">説明</label>
                <input
                  type="text"
                  value={scenario.description}
                  onChange={(e) => {
                    const newScenarios = [...simulationSetup.alternative_scenarios];
                    newScenarios[index].description = e.target.value;
                    setSimulationSetup(prev => ({
                      ...prev,
                      alternative_scenarios: newScenarios
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="シナリオの概要"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium mb-2">パラメータ変更</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">チーム規模</label>
                  <input
                    type="number"
                    value={scenario.parameter_changes.team_size || simulationSetup.base_scenario.team_size}
                    onChange={(e) => {
                      const newScenarios = [...simulationSetup.alternative_scenarios];
                      newScenarios[index].parameter_changes.team_size = parseInt(e.target.value);
                      setSimulationSetup(prev => ({
                        ...prev,
                        alternative_scenarios: newScenarios
                      }));
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">予算</label>
                  <input
                    type="number"
                    value={scenario.parameter_changes.budget || simulationSetup.base_scenario.budget}
                    onChange={(e) => {
                      const newScenarios = [...simulationSetup.alternative_scenarios];
                      newScenarios[index].parameter_changes.budget = parseInt(e.target.value);
                      setSimulationSetup(prev => ({
                        ...prev,
                        alternative_scenarios: newScenarios
                      }));
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    step="1000000"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">期間 (日)</label>
                  <input
                    type="number"
                    value={scenario.parameter_changes.timeline_days || simulationSetup.base_scenario.timeline_days}
                    onChange={(e) => {
                      const newScenarios = [...simulationSetup.alternative_scenarios];
                      newScenarios[index].parameter_changes.timeline_days = parseInt(e.target.value);
                      setSimulationSetup(prev => ({
                        ...prev,
                        alternative_scenarios: newScenarios
                      }));
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setSimulationSetup(prev => ({
              ...prev,
              alternative_scenarios: [
                ...prev.alternative_scenarios,
                {
                  scenario_name: `代替シナリオ ${prev.alternative_scenarios.length + 1}`,
                  description: '',
                  parameter_changes: {}
                }
              ]
            }));
          }}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + 新しいシナリオを追加
        </button>
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={() => setActiveTab('setup')}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          ← 戻る
        </button>
        <button
          onClick={() => setActiveTab('parameters')}
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
        >
          パラメータ設定 →
        </button>
      </div>
    </div>
  );

  /**
   * パラメータタブ
   */
  const renderParametersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">変動パラメータの設定</h3>
        <button
          onClick={createSimulation}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 rounded-md font-medium"
        >
          {loading ? 'シミュレーション作成中...' : 'シミュレーションを作成'}
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          💡 変動パラメータは、モンテカルロシミュレーションや感度分析で使用されます。
          各パラメータの不確実性を指定することで、より現実的な予測が可能になります。
        </p>
      </div>

      <div className="space-y-4">
        {simulationSetup.variable_parameters.map((param, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium">{param.parameter_name}</h4>
              <button
                onClick={() => {
                  const newParams = [...simulationSetup.variable_parameters];
                  newParams.splice(index, 1);
                  setSimulationSetup(prev => ({
                    ...prev,
                    variable_parameters: newParams
                  }));
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                削除
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">パラメータ名</label>
                <select
                  value={param.parameter_name}
                  onChange={(e) => {
                    const newParams = [...simulationSetup.variable_parameters];
                    newParams[index].parameter_name = e.target.value;
                    setSimulationSetup(prev => ({
                      ...prev,
                      variable_parameters: newParams
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="team_size">チーム規模</option>
                  <option value="budget">予算</option>
                  <option value="timeline_days">期間</option>
                  <option value="skill_level">スキルレベル</option>
                  <option value="market_conditions">市場環境</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">最小値</label>
                <input
                  type="number"
                  value={param.min_value}
                  onChange={(e) => {
                    const newParams = [...simulationSetup.variable_parameters];
                    newParams[index].min_value = parseFloat(e.target.value);
                    setSimulationSetup(prev => ({
                      ...prev,
                      variable_parameters: newParams
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">最大値</label>
                <input
                  type="number"
                  value={param.max_value}
                  onChange={(e) => {
                    const newParams = [...simulationSetup.variable_parameters];
                    newParams[index].max_value = parseFloat(e.target.value);
                    setSimulationSetup(prev => ({
                      ...prev,
                      variable_parameters: newParams
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">分布</label>
                <select
                  value={param.distribution_type}
                  onChange={(e) => {
                    const newParams = [...simulationSetup.variable_parameters];
                    newParams[index].distribution_type = e.target.value as any;
                    setSimulationSetup(prev => ({
                      ...prev,
                      variable_parameters: newParams
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="UNIFORM">一様分布</option>
                  <option value="NORMAL">正規分布</option>
                  <option value="TRIANGULAR">三角分布</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setSimulationSetup(prev => ({
              ...prev,
              variable_parameters: [
                ...prev.variable_parameters,
                {
                  parameter_name: 'team_size',
                  min_value: 5,
                  max_value: 15,
                  distribution_type: 'NORMAL'
                }
              ]
            }));
          }}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + 変動パラメータを追加
        </button>
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={() => setActiveTab('scenarios')}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          ← 戻る
        </button>
      </div>
    </div>
  );

  /**
   * 結果タブ
   */
  const renderResultsTab = () => (
    <div className="space-y-6">
      {!currentSimulation ? (
        <div className="text-center py-8 text-gray-500">
          <p>シミュレーションを作成してください</p>
        </div>
      ) : simulationProgress ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-blue-700">{simulationProgress.step_description}</h3>
            <p className="text-sm text-gray-600 mt-1">
              ステップ {simulationProgress.current_step} / {simulationProgress.total_steps}
            </p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${simulationProgress.progress_percentage}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            残り約 {simulationProgress.estimated_time_remaining} 秒
          </p>
        </div>
      ) : simulationResults.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-lg font-medium mb-2">シミュレーションを実行</h3>
          <p className="text-sm text-gray-600 mb-6">
            設定されたシナリオに基づいて予測分析を実行します
          </p>
          
          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-md font-medium"
          >
            {loading ? '実行中...' : 'シミュレーション実行'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">✅ シミュレーション完了</h3>
            <p className="text-green-700 text-sm">
              {simulationResults.length}個のシナリオの分析が完了しました。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {simulationResults.slice(0, 3).map((result, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">
                  {result.scenario_id === 'base_scenario' ? 'ベースシナリオ' : `シナリオ ${index}`}
                </h4>
                
                <div className="space-y-3">
                  {result.simulation_outputs.slice(0, 2).map((output, outputIndex) => (
                    <div key={outputIndex}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{output.output_name}</span>
                        <span className="font-medium">
                          {output.output_value.toFixed(1)}{output.output_unit}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        信頼区間: {output.confidence_interval.lower.toFixed(1)} - {output.confidence_interval.upper.toFixed(1)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">総合スコア</span>
                      <span className="font-bold text-blue-600">
                        {result.optimization_scores[0]?.score.toFixed(0) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">パフォーマンス比較</h4>
              <div className="space-y-2">
                {simulationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">
                      {result.scenario_id === 'base_scenario' ? 'ベース' : `シナリオ${index}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(result.optimization_scores[0]?.score || 0)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {result.optimization_scores[0]?.score.toFixed(0) || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">リスク評価</h4>
              <div className="space-y-2">
                {simulationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">
                      {result.scenario_id === 'base_scenario' ? 'ベース' : `シナリオ${index}`}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.risk_assessment.overall_risk_score < 0.3 ? 'bg-green-100 text-green-800' :
                      result.risk_assessment.overall_risk_score < 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.risk_assessment.overall_risk_score < 0.3 ? '低リスク' :
                       result.risk_assessment.overall_risk_score < 0.6 ? '中リスク' : '高リスク'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * 分析タブ
   */
  const renderAnalysisTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">詳細分析・推奨事項</h3>
      
      {optimizationRecommendations.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-medium">最適化推奨事項</h4>
          
          {optimizationRecommendations.map((recommendation, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium">{recommendation.title}</h5>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  recommendation.priority_score > 80 ? 'bg-red-100 text-red-800' :
                  recommendation.priority_score > 60 ? 'bg-orange-100 text-orange-800' :
                  recommendation.priority_score > 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  優先度: {recommendation.priority_score}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">期待効果:</span>
                  <div className="font-medium">
                    ROI: {recommendation.expected_benefit.quantified_roi.roi_percentage}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">回収期間:</span>
                  <div className="font-medium">
                    {recommendation.expected_benefit.payback_period}ヶ月
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">成功確率:</span>
                  <div className="font-medium">
                    {(recommendation.success_probability * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>シミュレーションを実行してください</p>
        </div>
      )}
    </div>
  );

  if (loading && !simulationProgress) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-700 font-medium">シミュレーション準備中...</p>
        <p className="text-sm text-gray-600 mt-1">予測モデルを構築しています</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">選定効果シミュレーション</h1>
              <p className="text-sm text-gray-600 mt-1">
                様々なシナリオの選定効果を予測・分析
              </p>
            </div>
            <div className="flex items-center gap-4">
              {currentSimulation && (
                <div className="text-sm text-gray-600">
                  シミュレーション: {currentSimulation.simulation_name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'setup', label: 'セットアップ', icon: '⚙️' },
              { id: 'scenarios', label: 'シナリオ', icon: '🔄' },
              { id: 'parameters', label: 'パラメータ', icon: '📊' },
              { id: 'results', label: '結果', icon: '📈' },
              { id: 'analysis', label: '分析', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
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
      </div>

      {/* メインコンテンツ */}
      <div className="px-6 py-6">
        {activeTab === 'setup' && renderSetupTab()}
        {activeTab === 'scenarios' && renderScenariosTab()}
        {activeTab === 'parameters' && renderParametersTab()}
        {activeTab === 'results' && renderResultsTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </div>
    </div>
  );
};

export default SelectionSimulationUI;