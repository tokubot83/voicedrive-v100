// 部門管理ダッシュボード - LEVEL_3 (部門長専用)
import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';
import DepartmentPostingAnalytics from '../department/DepartmentPostingAnalytics';

const DepartmentDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // ダミーデータ
  const departmentMetrics = {
    totalStaff: 45,
    activeProjects: 8,
    budget: { allocated: 5000000, spent: 3200000, remaining: 1800000 },
    efficiency: 87,
    satisfaction: 82,
    proposals: { pending: 12, approved: 28, rejected: 5 }
  };

  const teams = [
    { id: 1, name: '開発チーム', leader: '山田太郎', members: 12, efficiency: 92, projects: 3 },
    { id: 2, name: 'デザインチーム', leader: '佐藤花子', members: 8, efficiency: 88, projects: 2 },
    { id: 3, name: 'QAチーム', leader: '鈴木一郎', members: 6, efficiency: 85, projects: 2 },
    { id: 4, name: 'サポートチーム', leader: '田中美咲', members: 10, efficiency: 90, projects: 1 }
  ];

  const recentProposals = [
    { id: 1, title: '新システム導入提案', author: '山田太郎', status: 'pending', impact: 'high', date: '2025-01-08' },
    { id: 2, title: '業務フロー改善案', author: '佐藤花子', status: 'approved', impact: 'medium', date: '2025-01-06' },
    { id: 3, title: '研修プログラム拡充', author: '鈴木一郎', status: 'pending', impact: 'high', date: '2025-01-05' }
  ];

  const budgetBreakdown = [
    { category: '人件費', amount: 2000000, percentage: 62.5 },
    { category: '開発費', amount: 800000, percentage: 25 },
    { category: '研修費', amount: 300000, percentage: 9.4 },
    { category: 'その他', amount: 100000, percentage: 3.1 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">📈</span>
          部門管理ダッシュボード
        </h1>
        <p className="text-gray-300">
          {currentUser?.department || '開発部門'}の統括管理画面
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>📈</span>
            <span>部門概要</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white'
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
          {/* 部門統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">総人員</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-white">{departmentMetrics.totalStaff}名</div>
          <div className="text-sm text-blue-400 mt-1">4チーム体制</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">部門効率</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-bold text-white">{departmentMetrics.efficiency}%</div>
          <div className="text-sm text-green-400 mt-1">前月比 +3%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">予算執行率</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-white">64%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full" style={{ width: '64%' }} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">承認待ち</span>
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{departmentMetrics.proposals.pending}</div>
          <div className="text-sm text-gray-400 mt-1">提案審査中</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* チーム状況 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            チーム状況
          </h2>
          <div className="space-y-3">
            {teams.map(team => (
              <div key={team.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">{team.name}</h3>
                    <p className="text-gray-400 text-sm">リーダー: {team.leader}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{team.efficiency}%</p>
                    <p className="text-xs text-gray-400">効率性</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{team.members}名</span>
                  <span className="text-blue-400">{team.projects}プロジェクト</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 予算状況 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            予算執行状況
          </h2>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">配分予算</span>
              <span className="text-white font-bold">¥{departmentMetrics.budget.allocated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">執行済み</span>
              <span className="text-yellow-400 font-bold">¥{departmentMetrics.budget.spent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">残額</span>
              <span className="text-green-400 font-bold">¥{departmentMetrics.budget.remaining.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            {budgetBreakdown.map((item, index) => (
              <div key={index} className="bg-gray-700/30 rounded p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300">{item.category}</span>
                  <span className="text-white">¥{item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近の提案 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          最近の提案
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-400">タイトル</th>
                <th className="pb-3 text-gray-400">提案者</th>
                <th className="pb-3 text-gray-400">ステータス</th>
                <th className="pb-3 text-gray-400">影響度</th>
                <th className="pb-3 text-gray-400">日付</th>
              </tr>
            </thead>
            <tbody>
              {recentProposals.map(proposal => (
                <tr key={proposal.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 text-white">{proposal.title}</td>
                  <td className="py-3 text-gray-300">{proposal.author}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(proposal.status)}`}>
                      {proposal.status === 'pending' ? '審査中' : proposal.status === 'approved' ? '承認済' : '却下'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-medium ${getImpactColor(proposal.impact)}`}>
                      {proposal.impact === 'high' ? '高' : proposal.impact === 'medium' ? '中' : '低'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{proposal.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        <DepartmentPostingAnalytics />
      )}
    </div>
  );
};

export default DepartmentDashboard;