// IntegratedAnalyticsDashboard - Phase 5 統合分析ダッシュボード
// 全フェーズ選定データの統合可視化・リアルタイム監視・AI分析結果表示

import React, { useState, useEffect, useCallback } from 'react';
import { 
  SelectionAnalytics,
  AnalyticsMetrics,
  AnalyticsInsight,
  TrendAnalysis,
  PerformanceIndicator
} from '../../services/SelectionAnalyticsService';
// Temporary fix: Use any types for complex services
type DashboardData = any;
type OptimizationResult = any;
import SelectionAnalyticsService from '../../services/SelectionAnalyticsService';
import PerformanceMonitoringService, { MonitoringEvent } from '../../services/PerformanceMonitoringService';
import OptimizationEngineService from '../../services/OptimizationEngineService';

interface IntegratedAnalyticsDashboardProps {
  userId: string;
  permissionLevel: number;
  timeRange?: TimeRange;
  refreshInterval?: number; // 秒
}

interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
}

interface DashboardState {
  analytics: SelectionAnalytics | null;
  monitoring: DashboardData | null;
  optimization: OptimizationResult | null;
  insights: AnalyticsInsight[];
  alerts: MonitoringEvent[];
  kpis: DashboardKPI[];
  trends: TrendData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface DashboardKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'INCREASE' | 'DECREASE' | 'STABLE';
  target?: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  trend: number[];
}

interface TrendData {
  id: string;
  metric: string;
  data: DataPoint[];
  forecast?: DataPoint[];
  anomalies: AnomalyPoint[];
}

interface DataPoint {
  timestamp: Date;
  value: number;
  confidence?: number;
}

interface AnomalyPoint {
  timestamp: Date;
  value: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export const IntegratedAnalyticsDashboard: React.FC<IntegratedAnalyticsDashboardProps> = ({
  userId,
  permissionLevel,
  timeRange = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7日前
    end: new Date(),
    granularity: 'DAY'
  },
  refreshInterval = 30 // 30秒
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'monitoring' | 'optimization' | 'insights'>('overview');
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    monitoring: null,
    optimization: null,
    insights: [],
    alerts: [],
    kpis: [],
    trends: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  // サービス初期化
  const analyticsService = new SelectionAnalyticsService();
  const monitoringService = new PerformanceMonitoringService();
  const optimizationService = new OptimizationEngineService();

  // データ取得
  const fetchDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 並列でデータを取得
      const [analyticsData, monitoringData, optimizationData] = await Promise.all([
        analyticsService.executeComprehensiveAnalysis(
          'CROSS_PHASE_COMPARISON',
          {
            start_date: timeRange.start,
            end_date: timeRange.end,
            granularity: 'DAILY'
          },
          [] // データソースは実装時に設定
        ),
        monitoringService.generateDashboardData('default_monitoring'),
        optimizationService.executeParameterOptimization(
          'default_engine',
          ['selection_accuracy', 'response_time', 'user_satisfaction'],
          {
            max_iterations: 100,
            max_time: 300,
            max_cost: 10000,
            resource_limits: {}
          }
        )
      ]);

      // KPI データの生成
      const kpis = generateKPIs(analyticsData, monitoringData, optimizationData);
      
      // トレンドデータの生成
      const trends = generateTrendData(analyticsData);
      
      // インサイトの抽出
      const insights = analyticsData.insights;
      
      // アラートの取得
      const alerts = monitoringData.alert_summary?.active_alerts || [];

      setState({
        analytics: analyticsData,
        monitoring: monitoringData,
        optimization: optimizationData,
        insights,
        alerts,
        kpis,
        trends,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `データ取得エラー: ${error}`
      }));
    }
  }, [timeRange]);

  // 初期データ読み込み
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // リアルタイム更新
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, refreshInterval]);

  /**
   * 概要タブ
   */
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* システム健全性概要 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span className="text-green-600">💚</span>
          システム健全性概要
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {state.kpis.slice(0, 4).map((kpi) => (
            <div key={kpi.id} className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                kpi.status === 'EXCELLENT' ? 'text-green-600' :
                kpi.status === 'GOOD' ? 'text-blue-600' :
                kpi.status === 'WARNING' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {kpi.value}{kpi.unit}
              </div>
              <div className="text-sm text-gray-600">{kpi.name}</div>
              <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${
                kpi.changeType === 'INCREASE' ? 'text-green-600' :
                kpi.changeType === 'DECREASE' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                <span>
                  {kpi.changeType === 'INCREASE' ? '↗' :
                   kpi.changeType === 'DECREASE' ? '↘' : '→'}
                </span>
                {Math.abs(kpi.change)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* アクティブアラート */}
      {state.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center gap-2">
            <span>🚨</span>
            アクティブアラート ({state.alerts.length}件)
          </h3>
          <div className="space-y-2">
            {state.alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                <div>
                  <div className="font-medium text-red-800">{alert.description}</div>
                  <div className="text-sm text-red-600">
                    {alert.timestamp.toLocaleString()} - {alert.source}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                  alert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                  alert.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {alert.severity}
                </div>
              </div>
            ))}
            {state.alerts.length > 3 && (
              <div className="text-center">
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  すべてのアラートを表示 →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 主要インサイト */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span className="text-blue-600">💡</span>
          主要インサイト
        </h3>
        
        <div className="space-y-3">
          {state.insights.slice(0, 5).map((insight, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">{insight.description}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    影響度: {insight.impact_level} | 信頼度: {insight.confidence}%
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  insight.category === 'OPPORTUNITY' ? 'bg-green-100 text-green-800' :
                  insight.category === 'RISK' ? 'bg-red-100 text-red-800' :
                  insight.category === 'PERFORMANCE' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insight.category}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setActiveTab('insights')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            すべてのインサイトを表示 →
          </button>
        </div>
      </div>

      {/* パフォーマンストレンド */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span className="text-purple-600">📈</span>
          パフォーマンストレンド
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.trends.slice(0, 2).map((trend) => (
            <div key={trend.id} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{trend.metric}</h4>
              <div className="h-40 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-gray-500">
                  📊 {trend.metric}のトレンドチャート
                  <div className="text-sm mt-1">
                    データポイント: {trend.data.length}個
                  </div>
                </div>
              </div>
              {trend.anomalies.length > 0 && (
                <div className="mt-2 text-sm text-orange-600">
                  ⚠️ {trend.anomalies.length}個の異常値を検出
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * 分析タブ
   */
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">フェーズ横断分析</h3>
        
        {state.analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 選定メトリクス */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">選定パフォーマンス</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総選定数:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.selection_metrics.total_selections}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">成功率:</span>
                  <span className="font-medium text-green-600">
                    {state.analytics.metrics.selection_metrics.selection_success_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">平均チーム規模:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.selection_metrics.average_team_size}名
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">平均選定時間:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.selection_metrics.time_to_selection.average}分
                  </span>
                </div>
              </div>
            </div>

            {/* 効率メトリクス */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">システム効率</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">プロセス効率:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.efficiency_metrics.process_efficiency}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">リソース利用:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.efficiency_metrics.resource_utilization}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">自動化率:</span>
                  <span className="font-medium text-blue-600">
                    {state.analytics.metrics.efficiency_metrics.automation_rate}%
                  </span>
                </div>
              </div>
            </div>

            {/* 品質メトリクス */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">選定品質</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">選定精度:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.quality_metrics.selection_accuracy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">スキル適合:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.quality_metrics.skill_match_quality}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">多様性達成:</span>
                  <span className="font-medium">
                    {state.analytics.metrics.quality_metrics.diversity_achievement}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* フェーズ別パフォーマンス比較 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">フェーズ別パフォーマンス比較</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['Basic', 'Collaborative', 'AI-Assisted', 'Emergency', 'Strategic'].map((phase, index) => (
            <div key={phase} className="text-center border rounded-lg p-4">
              <div className="text-lg font-medium mb-2">{phase}</div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {85 + index * 3}%
                </div>
                <div className="text-sm text-gray-600">成功率</div>
                <div className="text-xs text-gray-500">
                  {120 + index * 30}件実行
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * 監視タブ
   */
  const renderMonitoringTab = () => (
    <div className="space-y-6">
      {/* リアルタイム監視 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-green-600">🔄</span>
            リアルタイム監視
          </span>
          <span className="text-sm text-gray-500">
            最終更新: {state.lastUpdated?.toLocaleTimeString()}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {state.monitoring?.real_time_metrics.slice(0, 4).map((metric, index) => (
            <div key={index} className="border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metric.current_value}
              </div>
              <div className="text-sm text-gray-600">{metric.metric_name}</div>
              <div className="text-xs text-gray-500">{metric.unit}</div>
              <div className={`text-xs mt-1 ${
                metric.quality_score > 90 ? 'text-green-600' :
                metric.quality_score > 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                品質: {metric.quality_score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* アラート一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">アラート管理</h3>
        
        <div className="space-y-3">
          {state.alerts.map((alert, index) => (
            <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
              alert.severity === 'CRITICAL' ? 'border-red-500 bg-red-50' :
              alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-50' :
              alert.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{alert.description}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    発生時刻: {alert.timestamp.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    影響範囲: {alert.affected_components.join(', ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    詳細
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                    対処済み
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* システム健全性 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">システム健全性</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">パフォーマンス指標</h4>
            <div className="space-y-2">
              {state.monitoring?.performance_overview && (
                Object.entries(state.monitoring.performance_overview).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-600">{key}:</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">リソース使用状況</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPU使用率:</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">メモリ使用率:</span>
                <span className="font-medium">72%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ディスク使用率:</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ネットワーク:</span>
                <span className="font-medium">正常</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * 最適化タブ
   */
  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* 最適化状況 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span className="text-purple-600">🤖</span>
          AI最適化エンジン
        </h3>

        {state.optimization && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">最適化進捗</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">実行時間:</span>
                  <span className="font-medium">{state.optimization.execution_time}分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">改善率:</span>
                  <span className="font-medium text-green-600">
                    {(Object.values(state.optimization.performance_improvement)[0] as number) || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">信頼度:</span>
                  <span className="font-medium">{state.optimization.confidence_score}%</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">最適化パラメータ</h4>
              <div className="space-y-2">
                {Object.entries(state.optimization.optimal_parameters).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">推奨事項</h4>
              <div className="space-y-1">
                {state.optimization.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 最適化履歴 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">最適化履歴</h3>
        
        <div className="space-y-3">
          {state.optimization?.optimization_history.slice(0, 5).map((step) => (
            <div key={step.step_number} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-medium">ステップ {step.step_number}</div>
                <div className="text-sm text-gray-600">
                  {step.timestamp.toLocaleString()} - 改善率: {step.improvement}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">パラメータ数</div>
                <div className="font-medium">{Object.keys(step.parameters).length}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * インサイトタブ
   */
  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">AI生成インサイト</h3>
        
        <div className="space-y-4">
          {state.insights.map((insight, index) => (
            <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
              insight.category === 'OPPORTUNITY' ? 'border-green-500 bg-green-50' :
              insight.category === 'RISK' ? 'border-red-500 bg-red-50' :
              insight.category === 'PERFORMANCE' ? 'border-blue-500 bg-blue-50' :
              insight.category === 'EFFICIENCY' ? 'border-purple-500 bg-purple-50' :
              'border-gray-500 bg-gray-50'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    insight.category === 'OPPORTUNITY' ? 'bg-green-600 text-white' :
                    insight.category === 'RISK' ? 'bg-red-600 text-white' :
                    insight.category === 'PERFORMANCE' ? 'bg-blue-600 text-white' :
                    insight.category === 'EFFICIENCY' ? 'bg-purple-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {insight.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    insight.impact_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    insight.impact_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    insight.impact_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {insight.impact_level}
                  </span>
                </div>
                <div className="text-sm text-gray-600">信頼度: {insight.confidence}%</div>
              </div>
              
              <div className="font-medium text-gray-900 mb-2">{insight.description}</div>
              
              {insight.evidence && insight.evidence.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">根拠データ:</div>
                  <div className="space-y-1">
                    {insight.evidence.slice(0, 2).map((evidence, evidenceIndex) => (
                      <div key={evidenceIndex} className="text-xs text-gray-600">
                        • {evidence.metric}: {evidence.value} (有意性: {evidence.significance}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {insight.actionable && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">関係者:</div>
                  <div className="flex flex-wrap gap-1">
                    {insight.stakeholders.map((stakeholder, stakeholderIndex) => (
                      <span key={stakeholderIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {stakeholder}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (state.loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-700 font-medium">統合分析データを読み込み中...</p>
        <p className="text-sm text-gray-600 mt-1">Phase 1-5のデータを統合分析しています</p>
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
              <h1 className="text-2xl font-bold text-gray-900">統合分析ダッシュボード</h1>
              <p className="text-sm text-gray-600 mt-1">
                Phase 1-5 階層的選定システムの統合監視・分析・最適化
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                更新間隔: {refreshInterval}秒
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={state.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {state.loading ? '更新中...' : '🔄 手動更新'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {state.error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-800 text-sm font-medium">{state.error}</p>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'システム概要', icon: '📊' },
              { id: 'analytics', label: '統合分析', icon: '📈' },
              { id: 'monitoring', label: 'リアルタイム監視', icon: '👁️' },
              { id: 'optimization', label: 'AI最適化', icon: '🤖' },
              { id: 'insights', label: 'インサイト', icon: '💡' }
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
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'monitoring' && renderMonitoringTab()}
        {activeTab === 'optimization' && renderOptimizationTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

// ヘルパー関数
function generateKPIs(
  analytics: SelectionAnalytics | null,
  monitoring: DashboardData | null,
  optimization: OptimizationResult | null
): DashboardKPI[] {
  if (!analytics) return [];

  return [
    {
      id: 'selection_success_rate',
      name: '選定成功率',
      value: analytics.metrics.selection_metrics.selection_success_rate,
      unit: '%',
      change: 2.3,
      changeType: 'INCREASE',
      target: 90,
      status: analytics.metrics.selection_metrics.selection_success_rate >= 90 ? 'EXCELLENT' : 
              analytics.metrics.selection_metrics.selection_success_rate >= 80 ? 'GOOD' : 
              analytics.metrics.selection_metrics.selection_success_rate >= 70 ? 'WARNING' : 'CRITICAL',
      trend: [85, 87, 86, 89, analytics.metrics.selection_metrics.selection_success_rate]
    },
    {
      id: 'process_efficiency',
      name: 'プロセス効率',
      value: analytics.metrics.efficiency_metrics.process_efficiency,
      unit: '%',
      change: 1.8,
      changeType: 'INCREASE',
      target: 85,
      status: analytics.metrics.efficiency_metrics.process_efficiency >= 85 ? 'EXCELLENT' : 
              analytics.metrics.efficiency_metrics.process_efficiency >= 75 ? 'GOOD' : 
              analytics.metrics.efficiency_metrics.process_efficiency >= 65 ? 'WARNING' : 'CRITICAL',
      trend: [70, 72, 75, 77, analytics.metrics.efficiency_metrics.process_efficiency]
    },
    {
      id: 'user_satisfaction',
      name: 'ユーザー満足度',
      value: analytics.metrics.user_satisfaction_metrics.overall_satisfaction,
      unit: '%',
      change: 0.5,
      changeType: 'INCREASE',
      target: 80,
      status: analytics.metrics.user_satisfaction_metrics.overall_satisfaction >= 80 ? 'EXCELLENT' : 
              analytics.metrics.user_satisfaction_metrics.overall_satisfaction >= 70 ? 'GOOD' : 
              analytics.metrics.user_satisfaction_metrics.overall_satisfaction >= 60 ? 'WARNING' : 'CRITICAL',
      trend: [78, 79, 78, 80, analytics.metrics.user_satisfaction_metrics.overall_satisfaction]
    },
    {
      id: 'cost_efficiency',
      name: 'コスト効率',
      value: analytics.metrics.cost_metrics.cost_efficiency,
      unit: '%',
      change: -0.2,
      changeType: 'DECREASE',
      target: 90,
      status: analytics.metrics.cost_metrics.cost_efficiency >= 90 ? 'EXCELLENT' : 
              analytics.metrics.cost_metrics.cost_efficiency >= 80 ? 'GOOD' : 
              analytics.metrics.cost_metrics.cost_efficiency >= 70 ? 'WARNING' : 'CRITICAL',
      trend: [82, 84, 83, 85, analytics.metrics.cost_metrics.cost_efficiency]
    }
  ];
}

function generateTrendData(analytics: SelectionAnalytics | null): TrendData[] {
  if (!analytics) return [];

  return analytics.trends.map(trend => ({
    id: trend.trend_id,
    metric: trend.metric,
    data: trend.time_series_data.map(point => ({
      timestamp: point.timestamp,
      value: point.value,
      confidence: point.confidence_interval ? 
        (point.confidence_interval.upper + point.confidence_interval.lower) / 2 : undefined
    })),
    forecast: trend.forecast.map(forecast => ({
      timestamp: forecast.forecast_date,
      value: forecast.predicted_value,
      confidence: forecast.confidence_interval ? 
        (forecast.confidence_interval.upper + forecast.confidence_interval.lower) / 2 : undefined
    })),
    anomalies: trend.time_series_data
      .filter(point => point.anomaly_score && point.anomaly_score > 0.7)
      .map(point => ({
        timestamp: point.timestamp,
        value: point.value,
        severity: point.anomaly_score! > 0.9 ? 'CRITICAL' :
                 point.anomaly_score! > 0.8 ? 'HIGH' : 'MEDIUM',
        description: `異常値検出: ${point.value}`
      })) as AnomalyPoint[]
  }));
}

export default IntegratedAnalyticsDashboard;