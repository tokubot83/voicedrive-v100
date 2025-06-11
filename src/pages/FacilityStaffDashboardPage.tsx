import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building, Filter, Download, RefreshCw, TrendingUp } from 'lucide-react';
import DepartmentComparison from '../components/dashboard/DepartmentComparison';
import CrossDepartmentProjects from '../components/dashboard/CrossDepartmentProjects';
import EngagementMetrics from '../components/dashboard/EngagementMetrics';
import { 
  facilityAnalytics,
  crossDepartmentProjects,
  nursingDepartmentAnalytics
} from '../data/demo/staffDashboardData';
import { DashboardFilters } from '../types/staffDashboard';

const FacilityStaffDashboardPage: React.FC = () => {
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
    console.log('Exporting facility staff data...');
  };

  const timeRangeOptions = [
    { value: 'week', label: '週間' },
    { value: 'month', label: '月間' },
    { value: 'quarter', label: '四半期' },
    { value: 'year', label: '年間' }
  ];

  // デモ用に複数部署のデータを作成
  const demoFacilityAnalytics = {
    ...facilityAnalytics,
    departmentAnalytics: [
      nursingDepartmentAnalytics,
      {
        ...nursingDepartmentAnalytics,
        departmentId: 'dept-medical-001',
        departmentName: '医師部',
        departmentRanking: 1,
        aggregatedMetrics: {
          ...nursingDepartmentAnalytics.aggregatedMetrics,
          totalStaff: 18,
          activeStaff: 17,
          averageProposals: 5.2,
          averageParticipation: 3.1,
          averageEngagement: 0.89
        },
        benchmarkComparison: {
          proposalsVsBenchmark: 0.25,
          participationVsBenchmark: 0.32,
          engagementVsBenchmark: 0.18
        }
      },
      {
        ...nursingDepartmentAnalytics,
        departmentId: 'dept-pharmacy-001',
        departmentName: '薬剤部',
        departmentRanking: 3,
        aggregatedMetrics: {
          ...nursingDepartmentAnalytics.aggregatedMetrics,
          totalStaff: 12,
          activeStaff: 10,
          averageProposals: 3.1,
          averageParticipation: 1.8,
          averageEngagement: 0.72
        },
        benchmarkComparison: {
          proposalsVsBenchmark: -0.05,
          participationVsBenchmark: 0.08,
          engagementVsBenchmark: -0.03
        }
      },
      {
        ...nursingDepartmentAnalytics,
        departmentId: 'dept-admin-001',
        departmentName: '事務部',
        departmentRanking: 4,
        aggregatedMetrics: {
          ...nursingDepartmentAnalytics.aggregatedMetrics,
          totalStaff: 15,
          activeStaff: 12,
          averageProposals: 2.8,
          averageParticipation: 1.5,
          averageEngagement: 0.68
        },
        benchmarkComparison: {
          proposalsVsBenchmark: -0.12,
          participationVsBenchmark: -0.08,
          engagementVsBenchmark: -0.15
        }
      }
    ]
  };

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
              <span className="text-sm">ホームに戻る</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Building className="w-7 h-7 text-purple-400" />
                施設職員ダッシュボード
              </h1>
              <p className="text-gray-400 text-sm">
                {demoFacilityAnalytics.facilityName} - 部署間比較分析
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
              className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors text-purple-400"
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
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 施設情報 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-400">
                施設ランキング: <span className="text-yellow-400 font-semibold">#{demoFacilityAnalytics.facilityRanking}</span>
              </div>
              <div className="text-gray-400">
                総職員数: <span className="text-purple-400 font-semibold">{demoFacilityAnalytics.facilityMetrics.totalStaff}名</span>
              </div>
              <div className="text-gray-400">
                部署数: <span className="text-blue-400 font-semibold">{demoFacilityAnalytics.departmentAnalytics.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 施設レベルエンゲージメント指標 */}
        <EngagementMetrics 
          metrics={demoFacilityAnalytics.facilityMetrics}
          scope="facility"
        />

        {/* 部署間比較分析 */}
        <DepartmentComparison 
          departments={demoFacilityAnalytics.departmentAnalytics}
          scope="facility"
        />

        {/* クロス部門プロジェクト */}
        <CrossDepartmentProjects 
          projects={demoFacilityAnalytics.crossDepartmentProjects}
        />

        {/* リソース配分分析 */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            リソース配分分析
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 予算使用状況 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">予算使用状況</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">予算配分</span>
                  <span className="text-white font-semibold">
                    ¥{(demoFacilityAnalytics.resourceAllocation.budgetAllocated / 1000000).toFixed(1)}M
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">予算使用</span>
                  <span className="text-green-400 font-semibold">
                    ¥{(demoFacilityAnalytics.resourceAllocation.budgetUsed / 1000000).toFixed(1)}M
                  </span>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(demoFacilityAnalytics.resourceAllocation.budgetUsed / demoFacilityAnalytics.resourceAllocation.budgetAllocated) * 100}%` 
                    }}
                  />
                </div>
                
                <div className="text-sm text-gray-400">
                  使用率: {((demoFacilityAnalytics.resourceAllocation.budgetUsed / demoFacilityAnalytics.resourceAllocation.budgetAllocated) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* 人的リソース使用状況 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">人的リソース</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">配分時間</span>
                  <span className="text-white font-semibold">
                    {demoFacilityAnalytics.resourceAllocation.staffHoursAllocated}時間
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">使用時間</span>
                  <span className="text-blue-400 font-semibold">
                    {demoFacilityAnalytics.resourceAllocation.staffHoursUsed}時間
                  </span>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(demoFacilityAnalytics.resourceAllocation.staffHoursUsed / demoFacilityAnalytics.resourceAllocation.staffHoursAllocated) * 100}%` 
                    }}
                  />
                </div>
                
                <div className="text-sm text-gray-400">
                  利用率: {((demoFacilityAnalytics.resourceAllocation.staffHoursUsed / demoFacilityAnalytics.resourceAllocation.staffHoursAllocated) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* 効率性指標 */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {(demoFacilityAnalytics.resourceAllocation.efficiency * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-300">運営効率</div>
                <div className="text-xs text-gray-400">目標比</div>
              </div>
              
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {(demoFacilityAnalytics.resourceAllocation.utilizationRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-300">リソース活用率</div>
                <div className="text-xs text-gray-400">全体平均</div>
              </div>
            </div>
          </div>
        </div>

        {/* 改善アクション */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">施設レベル改善アクション</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-semibold mb-2">🏆 優秀部署のノウハウ共有</h4>
              <p className="text-gray-300 text-sm">
                医師部の高いエンゲージメント手法を他部署にも展開し、
                施設全体のパフォーマンス向上を図る。
              </p>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2">📈 低パフォーマンス部署支援</h4>
              <p className="text-gray-300 text-sm">
                事務部に対する個別指導とリソース配分の見直しを実施し、
                部署間格差の縮小を目指す。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityStaffDashboardPage;