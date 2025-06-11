import React, { useState } from 'react';
import { Heart, TrendingUp, Users, Lightbulb, Shield, Star } from 'lucide-react';
import { OrganizationalHealth } from '../../types/staffDashboard';

interface OrganizationalHealthProps {
  healthData: OrganizationalHealth;
}

const OrganizationalHealthComponent: React.FC<OrganizationalHealthProps> = ({ healthData }) => {
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'collaboration' | 'innovation'>('engagement');

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 55) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 85) return '優秀';
    if (score >= 70) return '良好';
    if (score >= 55) return '普通';
    return '要改善';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (score >= 70) return 'bg-gradient-to-r from-blue-500 to-blue-400';
    if (score >= 55) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-orange-500 to-orange-400';
  };

  const getTrendIcon = (trends: any[]) => {
    if (trends.length < 2) return null;
    const latest = trends[trends.length - 1].change;
    if (latest > 0.02) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (latest < -0.02) return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return <div className="w-4 h-4 text-gray-400">→</div>;
  };

  const healthMetrics = [
    {
      key: 'engagementScore',
      label: 'エンゲージメント',
      value: healthData.engagementScore,
      icon: Heart,
      description: '職員の積極的参加度'
    },
    {
      key: 'collaborationIndex',
      label: 'コラボレーション',
      value: healthData.collaborationIndex,
      icon: Users,
      description: '部門間連携の質'
    },
    {
      key: 'innovationRate',
      label: 'イノベーション',
      value: healthData.innovationRate,
      icon: Lightbulb,
      description: '新しいアイデア創出'
    },
    {
      key: 'retentionRate',
      label: '定着率',
      value: healthData.retentionRate,
      icon: Shield,
      description: '職員の継続勤務率'
    },
    {
      key: 'satisfactionScore',
      label: '満足度',
      value: healthData.satisfactionScore * 20, // 5点満点を100点満点に変換
      icon: Star,
      description: '職員満足度スコア'
    },
    {
      key: 'cultureAlignment',
      label: '文化適合',
      value: healthData.cultureAlignment,
      icon: Heart,
      description: '組織文化との整合性'
    }
  ];

  const currentTrendData = healthData.trends[selectedMetric] || [];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-bold text-white">組織健康度指標</h3>
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
          リアルタイム
        </span>
      </div>

      {/* 健康度スコア一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          const score = metric.value;
          
          return (
            <div
              key={metric.key}
              className="bg-slate-700/30 rounded-xl p-4 hover:bg-slate-700/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-600/50 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${getHealthColor(score)}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{metric.label}</h4>
                    <p className="text-xs text-gray-400">{metric.description}</p>
                  </div>
                </div>
                {getTrendIcon(currentTrendData)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getHealthColor(score)}`}>
                    {score.toFixed(1)}
                    {metric.key === 'satisfactionScore' ? '/5.0' : '%'}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    score >= 85 ? 'bg-green-500/20 text-green-400' :
                    score >= 70 ? 'bg-blue-500/20 text-blue-400' :
                    score >= 55 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {getHealthLabel(score)}
                  </span>
                </div>

                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* トレンド分析 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">トレンド分析</h4>
          
          {/* メトリック選択 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">指標:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
            >
              <option value="engagement">エンゲージメント</option>
              <option value="collaboration">コラボレーション</option>
              <option value="innovation">イノベーション</option>
            </select>
          </div>
        </div>

        {/* トレンドデータ表示 */}
        {currentTrendData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400 border-b border-slate-700/50 pb-2">
              <span>期間</span>
              <span>値</span>
              <span>変化率</span>
              <span>トレンド</span>
            </div>

            {currentTrendData.map((trend, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg"
              >
                <span className="text-gray-300">{trend.period}</span>
                <span className="text-white font-medium">{trend.value.toFixed(1)}</span>
                <span className={`font-medium ${
                  trend.change > 0 ? 'text-green-400' : trend.change < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {trend.change > 0 ? '+' : ''}{(trend.change * 100).toFixed(1)}%
                </span>
                <div className="flex items-center">
                  {trend.change > 0.02 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : trend.change < -0.02 ? (
                    <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center text-gray-400">→</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 健康度分析 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">健康度分析</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 強み */}
          <div>
            <h5 className="text-green-400 font-medium mb-3">🌟 組織の強み</h5>
            <div className="space-y-2">
              {healthMetrics
                .filter(m => m.value >= 80)
                .map(metric => (
                  <div key={metric.key} className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                    <span className="text-green-300 text-sm">{metric.label}</span>
                    <span className="text-green-400 font-medium">{metric.value.toFixed(1)}</span>
                  </div>
                ))}
              {healthMetrics.filter(m => m.value >= 80).length === 0 && (
                <p className="text-gray-400 text-sm">現在、特に際立った強みはありません。</p>
              )}
            </div>
          </div>

          {/* 改善機会 */}
          <div>
            <h5 className="text-orange-400 font-medium mb-3">🎯 改善機会</h5>
            <div className="space-y-2">
              {healthMetrics
                .filter(m => m.value < 70)
                .map(metric => (
                  <div key={metric.key} className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg">
                    <span className="text-orange-300 text-sm">{metric.label}</span>
                    <span className="text-orange-400 font-medium">{metric.value.toFixed(1)}</span>
                  </div>
                ))}
              {healthMetrics.filter(m => m.value < 70).length === 0 && (
                <p className="text-gray-400 text-sm">すべての指標が良好な水準を維持しています。</p>
              )}
            </div>
          </div>
        </div>

        {/* 総合評価 */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-700/30 rounded-xl">
              <Heart className="w-6 h-6 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">組織健康度総合スコア</div>
                <div className={`text-2xl font-bold ${getHealthColor(
                  (healthData.engagementScore + healthData.collaborationIndex + healthData.innovationRate + 
                   healthData.retentionRate + healthData.satisfactionScore * 20 + healthData.cultureAlignment) / 6
                )}`}>
                  {((healthData.engagementScore + healthData.collaborationIndex + healthData.innovationRate + 
                     healthData.retentionRate + healthData.satisfactionScore * 20 + healthData.cultureAlignment) / 6).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalHealthComponent;