import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Card } from '../components/ui/Card';
import { Users, Target, MessageSquare, TrendingUp, AlertCircle, Shield } from 'lucide-react';
import { posts } from '../data/demo/posts';
import { projects } from '../data/demo/projects';
import { demoUsers } from '../data/demo/users';
import EnhancedPost from '../components/EnhancedPost';
import ProjectProgressIndicator from '../components/ProjectProgressIndicator';
import { VoteOption, Comment } from '../types';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

export const LeaderStationPage: React.FC = () => {
  const { user } = useAuth();
  const { currentUser } = useDemoMode();
  const { userPermissionLevel, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('team_overview');

  // 13階層レベル対応 - チームメンバーを取得（部下のみ対象）
  const teamMembers = demoUsers.filter(u => {
    // 同じ部署で、権限レベルが自分より低い（階層が下位）ユーザー
    if (u.department !== user?.department) return false;
    if (u.permissionLevel >= userPermissionLevel) return false;
    
    // 看護主任の場合は看護師のみ、介護主任の場合は介護職のみを対象
    if (user?.position?.includes('看護主任')) {
      return u.position?.includes('看護師') || u.position?.includes('准看護師');
    } else if (user?.position?.includes('介護主任')) {
      return u.position?.includes('介護士') || u.position?.includes('介護福祉士') || 
             u.position?.includes('看護補助者') || u.position?.includes('介護職');
    }
    
    return true;
  });

  // チーム関連の投稿
  const teamPosts = posts.filter(post => {
    const author = demoUsers.find(u => u.id === post.authorId);
    return author?.department === user?.department;
  });

  // チーム関連のプロジェクト
  const teamProjects = projects.filter(project =>
    project.department === user?.department
  );

  // ハンドラー関数を追加
  const handleVote = (postId: string, option: VoteOption) => {
    console.log('Vote:', postId, option);
  };

  const handleComment = (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    console.log('Comment:', postId, comment);
  };

  const leaderTabs = [
    { id: 'team_overview', label: 'チーム概要', icon: Users },
    { id: 'team_posts', label: 'チーム投稿', icon: MessageSquare },
    { id: 'team_projects', label: 'チームプロジェクト', icon: TrendingUp },
    { id: 'pending_approvals', label: '承認待ち', icon: AlertCircle }
  ];

  const renderTeamOverview = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">チームメンバー</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-white">{teamMembers.length}</div>
          <div className="text-sm text-blue-400 mt-1">管理下の職員</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">チーム投稿</span>
            <span className="text-2xl">📝</span>
          </div>
          <div className="text-3xl font-bold text-white">{teamPosts.length}</div>
          <div className="text-sm text-green-400 mt-1">今月の投稿数</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">承認待ち</span>
            <span className="text-2xl">⏳</span>
          </div>
          <div className="text-3xl font-bold text-white">3</div>
          <div className="text-sm text-orange-400 mt-1">要対応案件</div>
        </div>
      </div>

      {/* チームメンバー詳細 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          チームメンバー ({teamMembers.length}名)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.slice(0, 8).map(member => (
            <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full border-2 border-gray-600"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-gray-400">{member.position}</p>
              </div>
              <div className="text-xs text-gray-500">
                Lv.{member.permissionLevel}
              </div>
            </div>
          ))}
          {teamMembers.length > 8 && (
            <div className="col-span-full text-center">
              <p className="text-sm text-gray-400">他 {teamMembers.length - 8}名</p>
            </div>
          )}
        </div>
      </div>

      {/* プロジェクト進捗 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          チームプロジェクト進捗
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamProjects.filter(p => p.status === 'active').slice(0, 4).map(project => (
            <div key={project.id} className="bg-gradient-to-r from-purple-600/20 to-purple-600/10 p-4 rounded-lg border border-purple-500/30">
              <h4 className="text-white font-medium mb-2">{project.title}</h4>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">進捗</span>
                <span className="text-purple-400">{project.progress || 65}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${project.progress || 65}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeamPosts = () => (
    <div className="space-y-4">
      {teamPosts.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">チーム投稿がありません</h3>
          <p className="text-gray-400">チームメンバーの投稿がここに表示されます。</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            チーム投稿
          </h2>
          <div className="space-y-3">
            {teamPosts.map(post => (
              <div key={post.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                <EnhancedPost 
                  post={post} 
                  currentUser={currentUser || user}
                  onVote={handleVote}
                  onComment={handleComment}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTeamProjects = () => (
    <div className="space-y-4">
      {teamProjects.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">チームプロジェクトがありません</h3>
          <p className="text-gray-400">チームのプロジェクトがここに表示されます。</p>
        </div>
      ) : (
        teamProjects.map(project => (
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
            <ProjectProgressIndicator 
              votes={{
                'strongly-support': 3,
                'support': 2,
                'neutral': 1,
                'oppose': 0,
                'strongly-oppose': 0
              }}
              currentScore={project.impactScore || 75}
              postId={project.id}
              isCompact={true}
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>メンバー: {project.members?.length || 0}名</span>
              <span>予算: ¥{project.budget?.toLocaleString() || '未設定'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPendingApprovals = () => (
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          承認待ち案件
        </h3>
        <div className="space-y-3">
          <div className="border border-orange-500/30 rounded-lg p-4 bg-orange-600/10">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-white">病棟業務改善プロジェクト</h4>
                <p className="text-sm text-gray-300 mt-1">看護業務の効率化を図る改善案</p>
                <p className="text-xs text-gray-500 mt-2">申請者: 田中花子 • 2日前</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                  承認
                </button>
                <button className="px-3 py-1 bg-gray-600 text-gray-200 text-sm rounded hover:bg-gray-700 transition-colors">
                  保留
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-600/10">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-white">新人研修プログラム提案</h4>
                <p className="text-sm text-gray-300 mt-1">新人看護師向けの研修カリキュラム</p>
                <p className="text-xs text-gray-500 mt-2">申請者: 佐藤次郎 • 1日前</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                  承認
                </button>
                <button className="px-3 py-1 bg-gray-600 text-gray-200 text-sm rounded hover:bg-gray-700 transition-colors">
                  保留
                </button>
              </div>
            </div>
          </div>

          <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-600/10">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-white">勤務シフト調整システム</h4>
                <p className="text-sm text-gray-300 mt-1">職員の勤務希望を効率的に管理するシステム</p>
                <p className="text-xs text-gray-500 mt-2">申請者: 山田三郎 • 3時間前</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                  承認
                </button>
                <button className="px-3 py-1 bg-gray-600 text-gray-200 text-sm rounded hover:bg-gray-700 transition-colors">
                  保留
                </button>
              </div>
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
        <div className="bg-gradient-to-r from-green-900/50 to-teal-900/50 rounded-2xl p-6 backdrop-blur-xl border border-green-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            リーダーステーション
          </h1>
          <p className="text-gray-300">
            ようこそ、{currentUser?.name || user?.name || 'リーダー'}さん！チーム管理とリーダーシップを発揮する場所です。
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="bg-gray-800/50 rounded-xl p-1 backdrop-blur border border-gray-700/50">
            <nav className="flex space-x-1">
              {leaderTabs.map(tab => {
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
          {activeTab === 'team_overview' && renderTeamOverview()}
          {activeTab === 'team_posts' && renderTeamPosts()}
          {activeTab === 'team_projects' && renderTeamProjects()}
          {activeTab === 'pending_approvals' && renderPendingApprovals()}
        </div>
      </div>
      
      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};