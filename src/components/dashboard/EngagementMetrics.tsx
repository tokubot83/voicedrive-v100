import React from 'react';
import { BarChart3, TrendingUp, Users, MessageCircle, ThumbsUp, Vote } from 'lucide-react';
import { AggregatedMetrics } from '../../types/staffDashboard';

interface EngagementMetricsProps {
  metrics: AggregatedMetrics;
  scope: 'department' | 'facility' | 'corporate';
}

const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ metrics, scope }) => {
  const getMetricCard = (
    title: string,
    value: number,
    icon: React.ElementType,
    color: string,
    unit: string = '',
    trend?: number
  ) => {
    const Icon = icon;
    
    return (
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{trend > 0 ? '+' : ''}{(trend * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{value.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  const scopeLabel = scope === 'department' ? '部門' : scope === 'facility' ? '施設' : '法人';

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">エンゲージメント指標</h3>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
          {scopeLabel}レベル
        </span>
      </div>

      {/* メイン指標グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getMetricCard(
          '平均提案数',
          metrics.averageProposals,
          MessageCircle,
          'bg-blue-500/20',
          '件/月',
          0.12
        )}
        
        {getMetricCard(
          '平均参加率',
          metrics.averageParticipation,
          Users,
          'bg-green-500/20',
          '件/月',
          0.18
        )}
        
        {getMetricCard(
          'エンゲージメント',
          metrics.averageEngagement * 100,
          ThumbsUp,
          'bg-purple-500/20',
          '%',
          0.08
        )}
        
        {getMetricCard(
          'アクティブ率',
          (metrics.activeStaff / metrics.totalStaff) * 100,
          Vote,
          'bg-orange-500/20',
          '%',
          0.05
        )}
      </div>

      {/* 詳細統計 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">活動状況詳細</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 総職員数 vs アクティブ職員数 */}
          <div className="space-y-3">
            <h5 className="text-gray-400 font-medium">職員活動状況</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">総職員数</span>
                <span className="text-white font-semibold">{metrics.totalStaff}名</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">アクティブ職員</span>
                <span className="text-green-400 font-semibold">{metrics.activeStaff}名</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.activeStaff / metrics.totalStaff) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-400">
                アクティブ率: {((metrics.activeStaff / metrics.totalStaff) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* トップパフォーマー */}
          <div className="space-y-3">
            <h5 className="text-gray-400 font-medium">トップパフォーマー</h5>
            <div className="space-y-2">
              {metrics.topPerformers.slice(0, 3).map((performer, index) => (
                <div key={performer.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      'bg-orange-600/20 text-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-gray-300 text-sm">{performer.userName}</span>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {performer.metrics.proposalCount}件
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* パフォーマンス分析 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">パフォーマンス分析</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {metrics.topPerformers.length}
            </div>
            <div className="text-sm text-gray-400">優秀職員</div>
            <div className="text-xs text-gray-500 mt-1">上位10%</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {Math.round(metrics.totalStaff * 0.7)}
            </div>
            <div className="text-sm text-gray-400">標準職員</div>
            <div className="text-xs text-gray-500 mt-1">中位70%</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {metrics.improvementOpportunities.length}
            </div>
            <div className="text-sm text-gray-400">改善機会</div>
            <div className="text-xs text-gray-500 mt-1">下位20%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementMetrics;