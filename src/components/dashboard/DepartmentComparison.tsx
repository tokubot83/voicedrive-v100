import React, { useState } from 'react';
import { BarChart3, TrendingUp, Building, Users, Award, ChevronDown } from 'lucide-react';
import { DepartmentAnalytics } from '../../types/staffDashboard';

interface DepartmentComparisonProps {
  departments: DepartmentAnalytics[];
  scope: 'facility' | 'corporate';
}

const DepartmentComparison: React.FC<DepartmentComparisonProps> = ({ departments, scope }) => {
  const [selectedMetric, setSelectedMetric] = useState<'proposals' | 'participation' | 'engagement' | 'overall'>('overall');
  const [showAll, setShowAll] = useState(false);

  const getMetricValue = (dept: DepartmentAnalytics, metric: string) => {
    switch (metric) {
      case 'proposals': return dept.aggregatedMetrics.averageProposals;
      case 'participation': return dept.aggregatedMetrics.averageParticipation;
      case 'engagement': return dept.aggregatedMetrics.averageEngagement * 100;
      case 'overall': return (
        dept.aggregatedMetrics.averageProposals * 0.3 +
        dept.aggregatedMetrics.averageParticipation * 0.3 +
        dept.aggregatedMetrics.averageEngagement * 40
      );
      default: return 0;
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'proposals': return '件/月';
      case 'participation': return '件/月';
      case 'engagement': return '%';
      case 'overall': return 'pts';
      default: return '';
    }
  };

  const sortedDepartments = [...departments].sort((a, b) => 
    getMetricValue(b, selectedMetric) - getMetricValue(a, selectedMetric)
  );

  const maxValue = Math.max(...sortedDepartments.map(dept => getMetricValue(dept, selectedMetric)));
  const avgValue = sortedDepartments.reduce((sum, dept) => sum + getMetricValue(dept, selectedMetric), 0) / sortedDepartments.length;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
    if (rank === 3) return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getPerformanceColor = (value: number, average: number) => {
    if (value >= average * 1.2) return 'text-green-400';
    if (value >= average * 1.1) return 'text-blue-400';
    if (value >= average * 0.9) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const displayDepartments = showAll ? sortedDepartments : sortedDepartments.slice(0, 5);

  const metricOptions = [
    { key: 'overall', label: '総合スコア', icon: Award },
    { key: 'proposals', label: '提案数', icon: BarChart3 },
    { key: 'participation', label: '参加率', icon: Users },
    { key: 'engagement', label: 'エンゲージメント', icon: TrendingUp }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">部署間比較分析</h3>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
            {scope === 'facility' ? '施設内' : '法人内'}
          </span>
        </div>

        {/* メトリック選択 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">指標:</span>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
          >
            {metricOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{departments.length}</div>
          <div className="text-sm text-gray-400">部署数</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{avgValue.toFixed(1)}</div>
          <div className="text-sm text-gray-400">平均値</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{maxValue.toFixed(1)}</div>
          <div className="text-sm text-gray-400">最高値</div>
        </div>
      </div>

      {/* 部署ランキング */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-400 border-b border-slate-700/50 pb-2">
          <span>順位</span>
          <span>部署名</span>
          <span>職員数</span>
          <span>{metricOptions.find(m => m.key === selectedMetric)?.label}</span>
          <span>パフォーマンス</span>
        </div>

        {displayDepartments.map((dept, index) => {
          const rank = index + 1;
          const value = getMetricValue(dept, selectedMetric);
          const barWidth = (value / maxValue) * 100;
          
          return (
            <div
              key={dept.departmentId}
              className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg hover:bg-slate-700/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${getRankColor(rank)}`}>
                  {rank}
                </div>
                <div className="min-w-[120px]">
                  <div className="text-white font-medium">{dept.departmentName}</div>
                  <div className="text-xs text-gray-400">{dept.facilityName}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-gray-300 min-w-[60px] text-center">
                  {dept.aggregatedMetrics.totalStaff}名
                </div>
                
                <div className="min-w-[80px] text-right">
                  <div className={`text-lg font-semibold ${getPerformanceColor(value, avgValue)}`}>
                    {value.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">{getMetricUnit(selectedMetric)}</div>
                </div>

                {/* プログレスバー */}
                <div className="min-w-[100px]">
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        value >= avgValue * 1.2 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                        value >= avgValue * 1.1 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                        value >= avgValue * 0.9 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                        'bg-gradient-to-r from-orange-500 to-orange-400'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {((value / avgValue - 1) * 100).toFixed(0)}% vs平均
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 表示切り替えボタン */}
        {departments.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors text-gray-400 hover:text-gray-300"
          >
            <span>{showAll ? '表示を減らす' : `すべての部署を表示 (${departments.length})`}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* パフォーマンス分析 */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">パフォーマンス分析</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-xl font-bold text-green-400">
              {departments.filter(d => getMetricValue(d, selectedMetric) >= avgValue * 1.2).length}
            </div>
            <div className="text-sm text-green-300">優秀部署</div>
            <div className="text-xs text-gray-400">平均+20%以上</div>
          </div>
          
          <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-xl font-bold text-blue-400">
              {departments.filter(d => getMetricValue(d, selectedMetric) >= avgValue * 1.1 && getMetricValue(d, selectedMetric) < avgValue * 1.2).length}
            </div>
            <div className="text-sm text-blue-300">良好部署</div>
            <div className="text-xs text-gray-400">平均+10-20%</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="text-xl font-bold text-yellow-400">
              {departments.filter(d => getMetricValue(d, selectedMetric) >= avgValue * 0.9 && getMetricValue(d, selectedMetric) < avgValue * 1.1).length}
            </div>
            <div className="text-sm text-yellow-300">標準部署</div>
            <div className="text-xs text-gray-400">平均±10%</div>
          </div>
          
          <div className="text-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="text-xl font-bold text-orange-400">
              {departments.filter(d => getMetricValue(d, selectedMetric) < avgValue * 0.9).length}
            </div>
            <div className="text-sm text-orange-300">要改善部署</div>
            <div className="text-xs text-gray-400">平均-10%以下</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentComparison;