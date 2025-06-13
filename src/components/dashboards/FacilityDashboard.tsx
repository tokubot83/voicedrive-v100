// 施設管理ダッシュボード - LEVEL_4 (施設長専用)
import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';
import { FACILITIES } from '../../data/medical/facilities';
import FacilityPostingAnalytics from '../facility/FacilityPostingAnalytics';

const FacilityDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  
  // Get facility name from facility_id
  const facilityName = currentUser?.facility_id 
    ? FACILITIES[currentUser.facility_id as keyof typeof FACILITIES]?.name || '第一病院'
    : '第一病院';

  // ダミーデータ
  const facilityMetrics = {
    departments: 8,
    totalStaff: 320,
    occupancyRate: 92,
    budget: { annual: 50000000, ytd: 38000000 },
    efficiency: 89,
    satisfaction: 85,
    incidents: { thisMonth: 2, lastMonth: 3 }
  };

  const departments = [
    { id: 1, name: '診療部', head: '山田太郎', staff: 85, budget: 15000000, efficiency: 91 },
    { id: 2, name: '看護部', head: '佐藤花子', staff: 120, budget: 12000000, efficiency: 94 },
    { id: 3, name: '管理部', head: '鈴木一郎', staff: 45, budget: 8000000, efficiency: 88 },
    { id: 4, name: '技術部', head: '田中美咲', staff: 30, budget: 5000000, efficiency: 87 }
  ];

  const keyMetrics = [
    { label: '患者満足度', value: 92, trend: 'up', change: '+2.5%' },
    { label: '職員定着率', value: 87, trend: 'stable', change: '±0%' },
    { label: '設備稼働率', value: 94, trend: 'up', change: '+1.2%' },
    { label: 'コスト効率', value: 83, trend: 'down', change: '-0.8%' }
  ];

  const recentIssues = [
    { id: 1, type: 'maintenance', title: 'エレベーター定期点検', priority: 'medium', status: 'scheduled', date: '2025-01-10' },
    { id: 2, type: 'incident', title: '駐車場照明故障', priority: 'low', status: 'in_progress', date: '2025-01-08' },
    { id: 3, type: 'compliance', title: '防火設備点検', priority: 'high', status: 'pending', date: '2025-01-15' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400';
      case 'in_progress': return 'text-yellow-400';
      case 'pending': return 'text-orange-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-teal-900/50 to-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl border border-teal-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏥</span>
          施設管理ダッシュボード
        </h1>
        <p className="text-gray-300">
          {facilityName}の統合管理センター
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>🏥</span>
            <span>施設概要</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>📊</span>
            <span>投稿分析</span>
          </button>
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'overview' ? (
        <>
          {/* 施設統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">部門数</span>
            <span className="text-2xl">🏢</span>
          </div>
          <div className="text-3xl font-bold text-white">{facilityMetrics.departments}</div>
          <div className="text-sm text-blue-400 mt-1">全部門稼働中</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">総職員数</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-white">{facilityMetrics.totalStaff}名</div>
          <div className="text-sm text-green-400 mt-1">稼働率 {facilityMetrics.occupancyRate}%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">予算執行率</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-white">76%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full" style={{ width: '76%' }} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">インシデント</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{facilityMetrics.incidents.thisMonth}</div>
          <div className="text-sm text-gray-400 mt-1">前月比 -1</div>
        </div>
      </div>

      {/* 主要指標 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          主要パフォーマンス指標
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">{metric.label}</span>
                <span className="text-xl">{getTrendIcon(metric.trend)}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{metric.value}%</span>
                <span className={`text-sm ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                  {metric.change}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 部門別状況 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            部門別状況
          </h2>
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">{dept.name}</h3>
                    <p className="text-gray-400 text-sm">部門長: {dept.head}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{dept.efficiency}%</p>
                    <p className="text-xs text-gray-400">効率性</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">職員数:</span>
                    <span className="text-white ml-2">{dept.staff}名</span>
                  </div>
                  <div>
                    <span className="text-gray-400">予算:</span>
                    <span className="text-white ml-2">¥{(dept.budget / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 施設課題 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            施設課題・メンテナンス
          </h2>
          <div className="space-y-3">
            {recentIssues.map(issue => (
              <div key={issue.id} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">{issue.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">予定日: {issue.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(issue.priority)}`}>
                    {issue.priority === 'high' ? '高' : issue.priority === 'medium' ? '中' : '低'}優先度
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${getStatusColor(issue.status)}`}>
                    {issue.status === 'scheduled' ? '予定' : 
                     issue.status === 'in_progress' ? '進行中' : 
                     issue.status === 'pending' ? '保留' : '完了'}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    詳細を見る →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 月次サマリー */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          月次サマリー
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-gray-400 mb-2">達成事項</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">患者満足度目標達成</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">安全基準100%クリア</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-400 mb-2">課題事項</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">!</span>
                <span className="text-gray-300">待機時間の短縮必要</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">!</span>
                <span className="text-gray-300">設備更新計画の見直し</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-400 mb-2">来月の重点項目</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">→</span>
                <span className="text-gray-300">新システム導入準備</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">→</span>
                <span className="text-gray-300">職員研修プログラム開始</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
        </>
      ) : (
        <FacilityPostingAnalytics />
      )}
    </div>
  );
};

export default FacilityDashboard;