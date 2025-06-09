// マイダッシュボード - LEVEL_1 (一般職員専用)
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';

const PersonalDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();

  // ダミーデータ
  const myPosts = [
    { id: 1, title: '新しい休憩室のレイアウト提案', status: '承認待ち', votes: 45, date: '2025-01-08' },
    { id: 2, title: '社内勉強会の頻度を増やす提案', status: '実施中', votes: 68, date: '2025-01-05' },
    { id: 3, title: 'リモートワーク制度の改善案', status: '完了', votes: 124, date: '2024-12-20' }
  ];

  const myVotes = {
    total: 89,
    thisMonth: 12,
    impactScore: 76
  };

  const notifications = [
    { id: 1, type: 'success', message: 'あなたの提案が承認されました！', time: '2時間前' },
    { id: 2, type: 'info', message: '新しい投稿にコメントがあります', time: '5時間前' },
    { id: 3, type: 'warning', message: '提案の締切が近づいています', time: '1日前' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '承認待ち': return 'text-yellow-400 bg-yellow-400/10';
      case '実施中': return 'text-blue-400 bg-blue-400/10';
      case '完了': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '📌';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-blue-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">💫</span>
          マイダッシュボード
        </h1>
        <p className="text-gray-300">
          ようこそ、{currentUser?.name || 'ゲスト'}さん！あなたの活動状況を確認できます。
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">総投票数</span>
            <span className="text-2xl">🗳️</span>
          </div>
          <div className="text-3xl font-bold text-white">{myVotes.total}</div>
          <div className="text-sm text-green-400 mt-1">今月 +{myVotes.thisMonth}</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">影響力スコア</span>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="text-3xl font-bold text-white">{myVotes.impactScore}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${myVotes.impactScore}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">提案数</span>
            <span className="text-2xl">💡</span>
          </div>
          <div className="text-3xl font-bold text-white">{myPosts.length}</div>
          <div className="text-sm text-blue-400 mt-1">承認率 66.7%</div>
        </div>
      </div>

      {/* マイ提案 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          マイ提案
        </h2>
        <div className="space-y-3">
          {myPosts.map(post => (
            <div key={post.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{post.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-400">{post.date}</span>
                    <span className="flex items-center gap-1">
                      <span className="text-blue-400">👍</span>
                      <span className="text-gray-300">{post.votes}</span>
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
          新しい提案を作成
        </button>
      </div>

      {/* 通知 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          最近の通知
        </h2>
        <div className="space-y-3">
          {notifications.map(notification => (
            <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1">
                <p className="text-gray-200">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 参加プロジェクト */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          参加中のプロジェクト
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-600/10 p-4 rounded-lg border border-blue-500/30">
            <h3 className="text-white font-medium mb-2">社内コミュニケーション改善</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">進捗</span>
              <span className="text-blue-400">65%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-600/10 p-4 rounded-lg border border-purple-500/30">
            <h3 className="text-white font-medium mb-2">業務効率化ツール導入</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">進捗</span>
              <span className="text-purple-400">30%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;