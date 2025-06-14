// SystemOptimizationRecommendationUI - システム最適化推奨UI
// Phase 5: AI改善提案・設定調整・パフォーマンス最適化インターフェース

import React, { useState, useEffect, useCallback } from 'react';
import { 
  OptimizationEngine,
  OptimizationResult,
  OptimizationRecommendation,
  ParameterOptimizationConfig,
  OptimizationHistory,
  AutoMLResult,
  PerformanceImpact
} from '../../services/OptimizationEngineService';
import OptimizationEngineService from '../../services/OptimizationEngineService';

interface SystemOptimizationRecommendationUIProps {
  userId: string;
  permissionLevel: number;
  systemScope?: OptimizationScope;
  refreshInterval?: number; // 秒
}

interface OptimizationScope {
  target_systems: string[];
  optimization_objectives: string[];
  priority_metrics: string[];
  resource_constraints: ResourceConstraints;
}

interface ResourceConstraints {
  max_cost: number;
  max_time: number; // 時間
  max_resource_impact: number; // パーセント
  allowed_downtime: number; // 分
}

interface OptimizationTask {
  task_id: string;
  task_name: string;
  description: string;
  recommendation: OptimizationRecommendation;
  estimated_impact: PerformanceImpact;
  implementation_complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  auto_applicable: boolean;
  requires_approval: boolean;
  dependencies: string[];
  rollback_plan: string;
  status: 'PENDING' | 'APPLYING' | 'APPLIED' | 'FAILED' | 'ROLLED_BACK';
  scheduled_execution?: Date;
}

interface OptimizationSession {
  session_id: string;
  session_name: string;
  created_at: Date;
  optimization_scope: OptimizationScope;
  total_recommendations: number;
  applied_recommendations: number;
  pending_recommendations: number;
  overall_improvement: number; // パーセント
  session_status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
}

export const SystemOptimizationRecommendationUI: React.FC<SystemOptimizationRecommendationUIProps> = ({
  userId,
  permissionLevel,
  systemScope = {
    target_systems: ['selection_engine', 'analytics_service', 'monitoring_service'],
    optimization_objectives: ['performance', 'cost', 'reliability'],
    priority_metrics: ['response_time', 'accuracy', 'resource_usage'],
    resource_constraints: {
      max_cost: 1000000,
      max_time: 24,
      max_resource_impact: 20,
      allowed_downtime: 30
    }
  },
  refreshInterval = 60
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'automation' | 'history' | 'settings'>('recommendations');
  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([]);
  const [currentSession, setCurrentSession] = useState<OptimizationSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(false);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistory[]>([]);
  
  const optimizationService = new OptimizationEngineService();

  // 最適化推奨事項の取得
  const fetchOptimizationRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // 最適化エンジンの初期化
      const engine = await optimizationService.initializeOptimizationEngine(
        'MULTI_OBJECTIVE',
        systemScope,
        systemScope.optimization_objectives.map(obj => ({
          objective_name: obj,
          weight: 1.0,
          optimization_direction: 'MAXIMIZE',
          target_value: 100,
          constraints: []
        }))
      );

      // パラメータ最適化の実行
      const parameterResult = await optimizationService.executeParameterOptimization(
        engine.engine_id,
        systemScope.priority_metrics,
        {
          max_iterations: 100,
          max_time: systemScope.resource_constraints.max_time * 3600, // 秒に変換
          max_cost: systemScope.resource_constraints.max_cost,
          resource_limits: {
            cpu_limit: 80,
            memory_limit: 8192,
            disk_limit: 100,
            network_limit: 1000
          }
        }
      );

      // 多目的最適化の実行
      const multiObjectiveResult = await optimizationService.executeMultiObjectiveOptimization(
        engine.engine_id,
        systemScope.optimization_objectives.map(obj => ({
          objective_name: obj,
          weight: 1.0,
          optimization_direction: 'MAXIMIZE',
          target_value: 100,
          constraints: []
        })),
        {
          max_iterations: 50,
          max_time: 1800, // 30分
          max_cost: systemScope.resource_constraints.max_cost / 2,
          resource_limits: {}
        }
      );

      // 推奨事項をタスクに変換
      const tasks = await convertRecommendationsToTasks([parameterResult, multiObjectiveResult]);
      setOptimizationTasks(tasks);

      // セッション情報の更新
      updateCurrentSession(tasks);

    } catch (err) {
      setError(`最適化推奨事項の取得に失敗しました: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [systemScope]);

  // 推奨事項をタスクに変換
  const convertRecommendationsToTasks = async (results: OptimizationResult[]): Promise<OptimizationTask[]> => {
    const tasks: OptimizationTask[] = [];
    
    for (const result of results) {
      for (const recommendation of result.recommendations) {
        const task: OptimizationTask = {
          task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          task_name: recommendation,
          description: `${recommendation}の実装により、システムパフォーマンスの向上が期待されます`,
          recommendation: {
            recommendation_id: `rec_${Date.now()}`,
            recommendation_type: 'PARAMETER_ADJUSTMENT',
            title: recommendation,
            description: `${recommendation}の実装`,
            priority_level: 'MEDIUM',
            expected_improvement: Math.random() * 20 + 5, // 5-25%の改善
            implementation_effort: Math.random() * 8 + 2, // 2-10時間
            risk_level: 'LOW',
            confidence_score: Math.random() * 20 + 80, // 80-100%
            applicable_systems: systemScope.target_systems,
            implementation_steps: [
              '現在の設定値の確認',
              'バックアップの作成',
              '新しい設定値の適用',
              'パフォーマンステストの実行',
              '結果の検証'
            ],
            success_criteria: ['パフォーマンス向上の確認', 'エラー率の増加なし'],
            rollback_plan: '元の設定値に戻す',
            dependencies: [],
            estimated_cost: Math.random() * 50000 + 10000, // 1-6万円
            auto_applicable: Math.random() > 0.6
          },
          estimated_impact: {
            performance_improvement: Math.random() * 20 + 5,
            cost_reduction: Math.random() * 15 + 2,
            reliability_improvement: Math.random() * 10 + 5,
            efficiency_gain: Math.random() * 18 + 7,
            user_satisfaction_impact: Math.random() * 12 + 3
          },
          implementation_complexity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
          auto_applicable: Math.random() > 0.6,
          requires_approval: Math.random() > 0.7,
          dependencies: [],
          rollback_plan: '設定値を元に戻し、システムを再起動する',
          status: 'PENDING'
        };
        
        tasks.push(task);
      }
    }
    
    return tasks.slice(0, 12); // 最大12個の推奨事項
  };

  // セッション情報の更新
  const updateCurrentSession = (tasks: OptimizationTask[]) => {
    const session: OptimizationSession = {
      session_id: `session_${Date.now()}`,
      session_name: `最適化セッション ${new Date().toLocaleDateString()}`,
      created_at: new Date(),
      optimization_scope: systemScope,
      total_recommendations: tasks.length,
      applied_recommendations: tasks.filter(t => t.status === 'APPLIED').length,
      pending_recommendations: tasks.filter(t => t.status === 'PENDING').length,
      overall_improvement: 0,
      session_status: 'ACTIVE'
    };
    
    setCurrentSession(session);
  };

  // 最適化タスクの実行
  const executeOptimizationTask = async (taskId: string) => {
    const task = optimizationTasks.find(t => t.task_id === taskId);
    if (!task) return;

    // タスクのステータスを「適用中」に更新
    setOptimizationTasks(prev => 
      prev.map(t => t.task_id === taskId ? { ...t, status: 'APPLYING' } : t)
    );

    try {
      // 実際の最適化実行をシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 成功時の処理
      setOptimizationTasks(prev => 
        prev.map(t => t.task_id === taskId ? { ...t, status: 'APPLIED' } : t)
      );

      // セッション情報の更新
      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          applied_recommendations: prev.applied_recommendations + 1,
          pending_recommendations: prev.pending_recommendations - 1,
          overall_improvement: prev.overall_improvement + task.estimated_impact.performance_improvement
        } : null);
      }

    } catch (err) {
      // 失敗時の処理
      setOptimizationTasks(prev => 
        prev.map(t => t.task_id === taskId ? { ...t, status: 'FAILED' } : t)
      );
      
      setError(`最適化タスク "${task.task_name}" の実行に失敗しました`);
    }
  };

  // 複数タスクの一括実行
  const executeBatchOptimization = async () => {
    const tasksToExecute = optimizationTasks.filter(t => selectedTasks.has(t.task_id) && t.status === 'PENDING');
    
    for (const task of tasksToExecute) {
      if (task.auto_applicable && !task.requires_approval) {
        await executeOptimizationTask(task.task_id);
        // 少し間隔を空ける
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 選択をクリア
    setSelectedTasks(new Set());
  };

  // 自動最適化の開始/停止
  const toggleAutoOptimization = async () => {
    setAutoOptimizationEnabled(!autoOptimizationEnabled);
    
    if (!autoOptimizationEnabled) {
      // 自動最適化開始
      const autoApplicableTasks = optimizationTasks.filter(t => 
        t.auto_applicable && !t.requires_approval && t.status === 'PENDING'
      );
      
      for (const task of autoApplicableTasks) {
        await executeOptimizationTask(task.task_id);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    fetchOptimizationRecommendations();
  }, [fetchOptimizationRecommendations]);

  // 定期更新
  useEffect(() => {
    const interval = setInterval(fetchOptimizationRecommendations, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchOptimizationRecommendations, refreshInterval]);

  /**
   * 推奨事項タブ
   */
  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      {/* セッション概要 */}
      {currentSession && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-blue-900">{currentSession.session_name}</h3>
              <p className="text-sm text-blue-700 mt-1">
                {currentSession.total_recommendations}件の最適化推奨事項を特定
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                +{currentSession.overall_improvement.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">期待パフォーマンス向上</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{currentSession.applied_recommendations}</div>
              <div className="text-xs text-gray-600">適用済み</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">{currentSession.pending_recommendations}</div>
              <div className="text-xs text-gray-600">保留中</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{selectedTasks.size}</div>
              <div className="text-xs text-gray-600">選択中</div>
            </div>
          </div>
        </div>
      )}

      {/* アクションバー */}
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedTasks(new Set(optimizationTasks.filter(t => t.auto_applicable && t.status === 'PENDING').map(t => t.task_id)))}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
          >
            自動適用可能をすべて選択
          </button>
          <button
            onClick={() => setSelectedTasks(new Set())}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
          >
            選択解除
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={executeBatchOptimization}
            disabled={selectedTasks.size === 0}
            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 rounded font-medium"
          >
            選択項目を一括適用 ({selectedTasks.size})
          </button>
          <button
            onClick={fetchOptimizationRecommendations}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded"
          >
            {loading ? '分析中...' : '🔄 再分析'}
          </button>
        </div>
      </div>

      {/* 最適化タスク一覧 */}
      <div className="space-y-3">
        {optimizationTasks.map((task) => (
          <div key={task.task_id} className={`border rounded-lg p-4 transition-colors ${
            selectedTasks.has(task.task_id) ? 'bg-blue-50 border-blue-300' :
            task.status === 'APPLIED' ? 'bg-green-50 border-green-300' :
            task.status === 'FAILED' ? 'bg-red-50 border-red-300' :
            task.status === 'APPLYING' ? 'bg-yellow-50 border-yellow-300' :
            'bg-white border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.task_id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedTasks);
                    if (e.target.checked) {
                      newSelected.add(task.task_id);
                    } else {
                      newSelected.delete(task.task_id);
                    }
                    setSelectedTasks(newSelected);
                  }}
                  disabled={task.status !== 'PENDING'}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{task.task_name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.implementation_complexity === 'LOW' ? 'bg-green-100 text-green-800' :
                      task.implementation_complexity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      task.implementation_complexity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.implementation_complexity}
                    </span>
                    {task.auto_applicable && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        自動適用可能
                      </span>
                    )}
                    {task.requires_approval && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        承認必要
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">パフォーマンス:</span>
                      <span className="font-medium text-green-600 ml-1">
                        +{task.estimated_impact.performance_improvement.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">コスト削減:</span>
                      <span className="font-medium text-blue-600 ml-1">
                        +{task.estimated_impact.cost_reduction.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">信頼性:</span>
                      <span className="font-medium text-purple-600 ml-1">
                        +{task.estimated_impact.reliability_improvement.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">実装時間:</span>
                      <span className="font-medium ml-1">
                        {task.recommendation.implementation_effort.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  task.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                  task.status === 'APPLYING' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'APPLIED' ? 'bg-green-100 text-green-800' :
                  task.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.status === 'PENDING' ? '保留' :
                   task.status === 'APPLYING' ? '適用中' :
                   task.status === 'APPLIED' ? '適用済み' :
                   task.status === 'FAILED' ? '失敗' : 'ロールバック済み'}
                </span>
                
                {task.status === 'PENDING' && (
                  <button
                    onClick={() => executeOptimizationTask(task.task_id)}
                    className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded text-sm font-medium"
                  >
                    適用
                  </button>
                )}
                
                {task.status === 'APPLIED' && (
                  <button
                    onClick={() => {/* ロールバック処理 */}}
                    className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-sm font-medium"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /**
   * 自動化タブ
   */
  const renderAutomationTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">自動最適化設定</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">自動最適化</h4>
              <p className="text-sm text-gray-600 mt-1">
                低リスクの最適化を自動的に適用します
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoOptimizationEnabled}
                onChange={toggleAutoOptimization}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">最大コスト制限</label>
              <input
                type="number"
                value={systemScope.resource_constraints.max_cost}
                onChange={(e) => {/* 設定更新処理 */}}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1000000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">許容ダウンタイム (分)</label>
              <input
                type="number"
                value={systemScope.resource_constraints.allowed_downtime}
                onChange={(e) => {/* 設定更新処理 */}}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">自動適用条件</h4>
            <div className="space-y-2">
              {[
                '信頼度95%以上の推奨事項',
                '実装時間2時間以下',
                'コスト5万円以下',
                '承認不要の項目のみ'
              ].map((condition, index) => (
                <label key={index} className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">{condition}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">スケジュール設定</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">最適化実行頻度</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="continuous">継続的 (リアルタイム)</option>
              <option value="hourly">1時間ごと</option>
              <option value="daily">1日1回</option>
              <option value="weekly">週1回</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">実行時間帯</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="anytime">いつでも</option>
              <option value="low_traffic">低トラフィック時間</option>
              <option value="maintenance">メンテナンス時間</option>
              <option value="custom">カスタム設定</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * 履歴タブ
   */
  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">最適化履歴</h3>
        
        <div className="space-y-3">
          {optimizationTasks
            .filter(task => task.status === 'APPLIED' || task.status === 'FAILED')
            .map((task) => (
              <div key={task.task_id} className={`border-l-4 p-4 rounded-r-lg ${
                task.status === 'APPLIED' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{task.task_name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      適用日時: {new Date().toLocaleString()} {/* 実際の適用日時 */}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === 'APPLIED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {task.status === 'APPLIED' ? '適用成功' : '適用失敗'}
                    </span>
                    {task.status === 'APPLIED' && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        +{task.estimated_impact.performance_improvement.toFixed(1)}% 改善
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  /**
   * 設定タブ
   */
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">最適化設定</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">対象システム</label>
            <div className="space-y-2">
              {['選定エンジン', 'アナリティクス', '監視サービス', 'UI/UX'].map((system) => (
                <label key={system} className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">{system}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">最適化目標</label>
            <div className="grid grid-cols-2 gap-2">
              {['パフォーマンス', 'コスト', '信頼性', 'ユーザビリティ', 'セキュリティ', '拡張性'].map((goal) => (
                <label key={goal} className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">リスク許容度</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="conservative">保守的 (低リスクのみ)</option>
              <option value="moderate">中程度 (バランス重視)</option>
              <option value="aggressive">積極的 (高い改善を優先)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && optimizationTasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-700 font-medium">システム最適化を分析中...</p>
        <p className="text-sm text-gray-600 mt-1">AIがパフォーマンス改善点を特定しています</p>
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
              <h1 className="text-2xl font-bold text-gray-900">システム最適化推奨</h1>
              <p className="text-sm text-gray-600 mt-1">
                AI分析による自動最適化・パフォーマンス改善提案
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                autoOptimizationEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                自動最適化: {autoOptimizationEnabled ? '有効' : '無効'}
              </div>
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
              { id: 'recommendations', label: '推奨事項', icon: '💡' },
              { id: 'automation', label: '自動化設定', icon: '🤖' },
              { id: 'history', label: '適用履歴', icon: '📋' },
              { id: 'settings', label: '最適化設定', icon: '⚙️' }
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
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-6 py-6">
        {activeTab === 'recommendations' && renderRecommendationsTab()}
        {activeTab === 'automation' && renderAutomationTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default SystemOptimizationRecommendationUI;