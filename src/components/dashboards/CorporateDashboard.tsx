// 法人統括ダッシュボード - LEVEL_7 (事務局長専用)
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';

const CorporateDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();

  // ダミーデータ
  const corporateMetrics = {
    facilities: 12,
    totalEmployees: 15000,
    revenue: { annual: 18500000000, ytd: 13875000000, growth: 8.5 },
    operatingMargin: 12.3,
    cashFlow: 2800000000,
    marketShare: 15.8
  };

  const facilityPerformance = [
    { name: '東京第一病院', revenue: 3200000000, margin: 14.2, staff: 2800, rating: 4.8 },
    { name: '大阪総合医療センター', revenue: 2800000000, margin: 13.5, staff: 2400, rating: 4.7 },
    { name: '名古屋中央病院', revenue: 2100000000, margin: 11.8, staff: 1800, rating: 4.6 },
    { name: '福岡西病院', revenue: 1800000000, margin: 12.5, staff: 1500, rating: 4.5 }
  ];

  const strategicProjects = [
    { 
      name: '全国デジタル医療ネットワーク構築',
      budget: 1200000000,
      progress: 45,
      roi: 320,
      status: 'on_track'
    },
    { 
      name: '次世代医療AI導入プロジェクト',
      budget: 800000000,
      progress: 28,
      roi: 450,
      status: 'on_track'
    },
    { 
      name: '地域医療連携強化プログラム',
      budget: 500000000,
      progress: 62,
      roi: 180,
      status: 'ahead'
    }
  ];

  const boardMetrics = [
    { category: '財務健全性', score: 92, benchmark: 85 },
    { category: '成長性', score: 88, benchmark: 80 },
    { category: '社会的責任', score: 94, benchmark: 90 },
    { category: 'ガバナンス', score: 91, benchmark: 88 }
  ];

  const executiveActions = [
    { title: '新規施設開設承認', type: 'approval', urgency: 'high', deadline: '2025-01-15' },
    { title: '年次予算計画レビュー', type: 'review', urgency: 'medium', deadline: '2025-01-20' },
    { title: '戦略的提携契約承認', type: 'approval', urgency: 'high', deadline: '2025-01-12' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-400';
      case 'ahead': return 'text-blue-400';
      case 'delayed': return 'text-yellow-400';
      case 'at_risk': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-2xl p-6 backdrop-blur-xl border border-amber-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏢</span>
          法人統括ダッシュボード
        </h1>
        <p className="text-gray-300">
          医療法人全体の経営状況と戦略的意思決定支援
        </p>
      </div>

      {/* 法人全体指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">年間収益</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-white">¥{(corporateMetrics.revenue.annual / 1000000000).toFixed(1)}B</div>
          <div className="text-sm text-green-400 mt-1">成長率 +{corporateMetrics.revenue.growth}%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">営業利益率</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-white">{corporateMetrics.operatingMargin}%</div>
          <div className="text-sm text-blue-400 mt-1">業界平均 10.5%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">市場シェア</span>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-3xl font-bold text-white">{corporateMetrics.marketShare}%</div>
          <div className="text-sm text-green-400 mt-1">業界3位</div>
        </div>
      </div>

      {/* 施設別パフォーマンス */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          主要施設パフォーマンス
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-400">施設名</th>
                <th className="pb-3 text-gray-400 text-right">年間収益</th>
                <th className="pb-3 text-gray-400 text-right">利益率</th>
                <th className="pb-3 text-gray-400 text-right">職員数</th>
                <th className="pb-3 text-gray-400 text-right">評価</th>
              </tr>
            </thead>
            <tbody>
              {facilityPerformance.map((facility, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 text-white font-medium">{facility.name}</td>
                  <td className="py-3 text-white text-right">¥{(facility.revenue / 1000000000).toFixed(1)}B</td>
                  <td className="py-3 text-right">
                    <span className={`${facility.margin > 13 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {facility.margin}%
                    </span>
                  </td>
                  <td className="py-3 text-white text-right">{facility.staff.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white">{facility.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 戦略プロジェクト */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            戦略プロジェクト
          </h2>
          <div className="space-y-4">
            {strategicProjects.map((project, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">{project.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-gray-400">予算: ¥{(project.budget / 1000000000).toFixed(1)}B</span>
                      <span className={getStatusColor(project.status)}>
                        {project.status === 'on_track' ? '順調' : '前倒し'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">ROI {project.roi}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 理事会指標 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            理事会評価指標
          </h2>
          <div className="space-y-4">
            {boardMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{metric.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{metric.score}</span>
                    <span className="text-sm text-gray-400">/ 100</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <div 
                    className="absolute top-0 h-3 w-0.5 bg-yellow-400"
                    style={{ left: `${metric.benchmark}%` }}
                    title={`ベンチマーク: ${metric.benchmark}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* エグゼクティブアクション */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          要対応事項
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {executiveActions.map((action, index) => (
            <div key={index} className={`rounded-lg p-4 border ${getUrgencyColor(action.urgency)}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-medium">{action.title}</h3>
                <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                  {action.type === 'approval' ? '承認' : 'レビュー'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">期限</span>
                <span className="text-white">{action.deadline}</span>
              </div>
              <button className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded transition-colors">
                対応する
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* キャッシュフロー概要 */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💸</span>
          キャッシュフロー概要
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">¥{(corporateMetrics.cashFlow / 1000000000).toFixed(1)}B</div>
            <div className="text-gray-400 mt-1">営業CF</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">¥-1.2B</div>
            <div className="text-gray-400 mt-1">投資CF</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">¥-0.8B</div>
            <div className="text-gray-400 mt-1">財務CF</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">¥0.8B</div>
            <div className="text-gray-400 mt-1">フリーCF</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateDashboard;