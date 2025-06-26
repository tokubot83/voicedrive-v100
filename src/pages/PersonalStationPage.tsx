import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MainTabs } from '../components/tabs/MainTabs';
import { SubFilters } from '../components/tabs/SubFilters';
import { Post } from '../components/Post';
import { ComposeSection } from '../components/ComposeSection';
import { ProjectProgressIndicator } from '../components/ProjectProgressIndicator';
import { EnhancedPost } from '../components/EnhancedPost';
import { posts } from '../data/demo/posts';
import { projects } from '../data/demo/projects';
import { Card } from '../components/ui/Card';
import { Home, User, MessageSquare, TrendingUp } from 'lucide-react';

export const PersonalStationPage: React.FC = () => {
  const { user } = useAuth();
  const { currentUser } = useDemoMode();
  const { userPermissionLevel, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  // 自分の投稿をフィルタリング
  const myPosts = posts.filter(post => post.authorId === user?.id);
  const myProjects = projects.filter(project => 
    project.members.some(member => member.id === user?.id)
  );

  // ダミーデータ
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '📌';
    }
  };

  const personalTabs = [
    { id: 'overview', label: '概要', icon: Home },
    { id: 'my_posts', label: 'マイポスト', icon: MessageSquare },
    { id: 'my_projects', label: 'マイプロジェクト', icon: TrendingUp },
    { id: 'activity', label: 'アクティビティ', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
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

      {/* 最近の通知 */}
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

  const renderMyPosts = () => (
    <div className="space-y-4">
      <ComposeSection />
      {myPosts.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">投稿がありません</h3>
          <p className="text-gray-400">最初の投稿を作成してみましょう。</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            マイ提案
          </h2>
          <div className="space-y-3">
            {myPosts.map(post => (
              <div key={post.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                <EnhancedPost post={post} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMyProjects = () => (
    <div className="space-y-4">
      {myProjects.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">参加プロジェクトがありません</h3>
          <p className="text-gray-400">プロジェクトに参加するか、新しいプロジェクトを提案してみましょう。</p>
        </div>
      ) : (
        myProjects.map(project => (
          <div key={project.id} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="text-gray-300 mt-1">{project.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {project.status === 'active' ? '進行中' :
                 project.status === 'planning' ? '計画中' : '一時停止'}
              </span>
            </div>
            <ProjectProgressIndicator project={project} />
          </div>
        ))
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">最近のアクティビティ</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">新しい投稿を作成しました</p>
              <p className="text-xs text-gray-500">2時間前</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">プロジェクトが承認されました</p>
              <p className="text-xs text-gray-500">1日前</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-blue-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">💫</span>
            パーソナルステーション
          </h1>
          <p className="text-gray-300">
            ようこそ、{currentUser?.name || 'ゲスト'}さん！あなた専用のワークスペースです。
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="bg-gray-800/50 rounded-xl p-1 backdrop-blur border border-gray-700/50">
            <nav className="flex space-x-1">
              {personalTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-6 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* コンテンツ */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'my_posts' && renderMyPosts()}
          {activeTab === 'my_projects' && renderMyProjects()}
          {activeTab === 'activity' && renderActivity()}
        </div>
      </div>
    </div>
  );
};