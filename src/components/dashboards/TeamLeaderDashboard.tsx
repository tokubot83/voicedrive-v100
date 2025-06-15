// 現場リーダーダッシュボード - LEVEL_2 (主任・師長専用)
import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';
import TeamMemberPostingAnalytics from '../teamleader/TeamMemberPostingAnalytics';

const TeamLeaderDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // ダミーデータ
  const teamMetrics = {
    memberCount: 12,
    activeProjects: 3,
    completedTasks: 28,
    pendingApprovals: 5,
    teamEfficiency: 84,
    moraleScore: 78
  };

  const teamMembers = [
    { id: 1, name: '山田太郎', role: 'シニアエンジニア', status: 'active', performance: 92 },
    { id: 2, name: '佐藤花子', role: 'エンジニア', status: 'active', performance: 85 },
    { id: 3, name: '鈴木一郎', role: 'ジュニアエンジニア', status: 'vacation', performance: 78 },
    { id: 4, name: '田中美咲', role: 'デザイナー', status: 'active', performance: 88 }
  ];

  const recentActivities = [
    { id: 1, type: 'task', message: '山田さんがタスクを完了しました', time: '30分前' },
    { id: 2, type: 'proposal', message: '新しい改善提案が提出されました', time: '2時間前' },
    { id: 3, type: 'approval', message: '予算申請が承認されました', time: '5時間前' }
  ];

  const pendingApprovals = [
    { id: 1, title: '備品購入申請', amount: '¥50,000', submittedBy: '佐藤花子', date: '2025-01-08' },
    { id: 2, title: '研修参加申請', amount: '¥30,000', submittedBy: '山田太郎', date: '2025-01-07' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { text: 'アクティブ', color: 'bg-green-500/20 text-green-400' };
      case 'vacation': return { text: '休暇中', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'busy': return { text: '多忙', color: 'bg-red-500/20 text-red-400' };
      default: return { text: status, color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return '✅';
      case 'proposal': return '💡';
      case 'approval': return '✓';
      default: return '📌';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">⭐</span>
          現場リーダーダッシュボード
        </h1>
        <p className="text-gray-300">
          {currentUser?.name}さん、チームの状況を確認し、効果的なマネジメントを行いましょう。
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>📋</span>
            <span>チーム概要</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
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
          {/* チーム統計 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">チームメンバー</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-white">{teamMetrics.memberCount}名</div>
          <div className="text-sm text-green-400 mt-1">全員アクティブ</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">チーム効率</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-white">{teamMetrics.teamEfficiency}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
              style={{ width: `${teamMetrics.teamEfficiency}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">承認待ち</span>
            <span className="text-2xl">⏳</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{teamMetrics.pendingApprovals}件</div>
          <div className="text-sm text-gray-400 mt-1">要対応</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* チームメンバー */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            チームメンバー
          </h2>
          <div className="space-y-3">
            {teamMembers.map(member => {
              const statusBadge = getStatusBadge(member.status);
              return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-gray-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">パフォーマンス</p>
                      <p className="text-lg font-bold text-white">{member.performance}%</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.color || 'bg-gray-500/20 text-gray-400'}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 承認待ちタスク */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            承認待ちタスク
          </h2>
          <div className="space-y-3">
            {pendingApprovals.map(approval => (
              <div key={approval.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium">{approval.title}</h3>
                  <span className="text-yellow-400 font-bold">{approval.amount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">申請者: {approval.submittedBy}</span>
                  <span className="text-gray-400">{approval.date}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded transition-colors">
                    承認
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded transition-colors">
                    却下
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近の活動 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          最近の活動
        </h2>
        <div className="space-y-3">
          {recentActivities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
              <span className="text-xl">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <p className="text-gray-200">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* チームモラル */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">😊</span>
          チームモラル
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl mb-2">😊</div>
            <p className="text-gray-400">満足度</p>
            <p className="text-2xl font-bold text-white">{teamMetrics.moraleScore}%</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-400">目標達成率</p>
            <p className="text-2xl font-bold text-white">92%</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-400">コミュニケーション</p>
            <p className="text-2xl font-bold text-white">良好</p>
          </div>
        </div>
      </div>
        </>
      ) : (
        <TeamMemberPostingAnalytics />
      )}
    </div>
  );
};

export default TeamLeaderDashboard;