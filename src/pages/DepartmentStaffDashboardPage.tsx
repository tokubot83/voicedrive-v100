import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Filter, Download, RefreshCw } from 'lucide-react';
import StaffRankings from '../components/dashboard/StaffRankings';
import EngagementMetrics from '../components/dashboard/EngagementMetrics';
import { 
  nursingDepartmentAnalytics, 
  departmentRankings 
} from '../data/demo/staffDashboardData';
import { DashboardFilters } from '../types/staffDashboard';

const DepartmentStaffDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: 'month',
    metric: 'overall'
  });
  
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // TODO: Implement actual data refresh
  };

  const handleExport = () => {
    // TODO: Implement data export functionality
    console.log('Exporting department staff data...');
  };

  const timeRangeOptions = [
    { value: 'week', label: '週間' },
    { value: 'month', label: '月間' },
    { value: 'quarter', label: '四半期' },
    { value: 'year', label: '年間' }
  ];

  const deptAnalytics = nursingDepartmentAnalytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">← ホーム</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-400" />
                部門職員ダッシュボード
              </h1>
              <p className="text-gray-400 text-sm">
                {deptAnalytics.departmentName} - {deptAnalytics.facilityName}
              </p>
            </div>
          </div>
          
          {/* ヘッダーアクション */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">更新</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors text-blue-400"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">エクスポート</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="p-6 space-y-6">
        {/* フィルターバー */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300 font-medium">フィルター:</span>
              
              {/* 期間選択 */}
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 部署情報 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-400">
                部署ランキング: <span className="text-yellow-400 font-semibold">#{deptAnalytics.departmentRanking}</span>
              </div>
              <div className="text-gray-400">
                対象職員: <span className="text-blue-400 font-semibold">{deptAnalytics.aggregatedMetrics.totalStaff}名</span>
              </div>
            </div>
          </div>
        </div>

        {/* エンゲージメント指標 */}
        <EngagementMetrics 
          metrics={deptAnalytics.aggregatedMetrics}
          scope="department"
        />

        {/* 職員ランキング */}
        <StaffRankings 
          rankings={departmentRankings}
          scope="department"
        />

        {/* ベンチマーク比較 */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-green-400" />
            業界ベンチマーク比較
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 提案数比較 */}
            <div className="space-y-3">
              <h4 className="text-gray-400 font-medium">提案数 vs 業界平均</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">当部署</span>
                  <span className="text-white font-semibold">{deptAnalytics.aggregatedMetrics.averageProposals.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">業界平均</span>
                  <span className="text-gray-400">{(deptAnalytics.aggregatedMetrics.averageProposals / (1 + deptAnalytics.benchmarkComparison.proposalsVsBenchmark)).toFixed(1)}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (1 + deptAnalytics.benchmarkComparison.proposalsVsBenchmark) * 50)}%` }}
                  />
                </div>
                <div className="text-sm text-green-400">
                  +{(deptAnalytics.benchmarkComparison.proposalsVsBenchmark * 100).toFixed(1)}% 上回り
                </div>
              </div>
            </div>

            {/* 参加率比較 */}
            <div className="space-y-3">
              <h4 className="text-gray-400 font-medium">参加率 vs 業界平均</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">当部署</span>
                  <span className="text-white font-semibold">{deptAnalytics.aggregatedMetrics.averageParticipation.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">業界平均</span>
                  <span className="text-gray-400">{(deptAnalytics.aggregatedMetrics.averageParticipation / (1 + deptAnalytics.benchmarkComparison.participationVsBenchmark)).toFixed(1)}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (1 + deptAnalytics.benchmarkComparison.participationVsBenchmark) * 50)}%` }}
                  />
                </div>
                <div className="text-sm text-green-400">
                  +{(deptAnalytics.benchmarkComparison.participationVsBenchmark * 100).toFixed(1)}% 上回り
                </div>
              </div>
            </div>

            {/* エンゲージメント比較 */}
            <div className="space-y-3">
              <h4 className="text-gray-400 font-medium">エンゲージメント vs 業界平均</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">当部署</span>
                  <span className="text-white font-semibold">{(deptAnalytics.aggregatedMetrics.averageEngagement * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">業界平均</span>
                  <span className="text-gray-400">{((deptAnalytics.aggregatedMetrics.averageEngagement / (1 + deptAnalytics.benchmarkComparison.engagementVsBenchmark)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (1 + deptAnalytics.benchmarkComparison.engagementVsBenchmark) * 50)}%` }}
                  />
                </div>
                <div className="text-sm text-green-400">
                  +{(deptAnalytics.benchmarkComparison.engagementVsBenchmark * 100).toFixed(1)}% 上回り
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションアイテム */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">改善アクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">🎯 参加促進施策</h4>
              <p className="text-gray-300 text-sm">
                参加率の低い職員に対する個別フォローアップと、
                プロジェクト参加のメリットについての説明会を実施する。
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">🏆 優秀職員の活用</h4>
              <p className="text-gray-300 text-sm">
                トップパフォーマーをメンターとして活用し、
                他の職員のスキルアップとモチベーション向上を図る。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentStaffDashboardPage;