import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { Users, Target, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { posts } from '../data/demo/posts';
import { projects } from '../data/demo/projects';
import { demoUsers } from '../data/demo/users';
import { EnhancedPost } from '../components/EnhancedPost';
import { ProjectProgressIndicator } from '../components/ProjectProgressIndicator';

export const LeaderStationPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('team_overview');

  // チームメンバーを取得（権限レベル2以上が対象）
  const teamMembers = demoUsers.filter(u => 
    u.department === user?.department && u.permissionLevel < userPermissionLevel
  );

  // チーム関連の投稿
  const teamPosts = posts.filter(post => {
    const author = demoUsers.find(u => u.id === post.authorId);
    return author?.department === user?.department;
  });

  // チーム関連のプロジェクト
  const teamProjects = projects.filter(project =>
    project.department === user?.department
  );

  const leaderTabs = [
    { id: 'team_overview', label: 'チーム概要', icon: Users },
    { id: 'team_posts', label: 'チーム投稿', icon: MessageSquare },
    { id: 'team_projects', label: 'チームプロジェクト', icon: TrendingUp },
    { id: 'pending_approvals', label: '承認待ち', icon: AlertCircle }
  ];

  const renderTeamOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* チームメンバー */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          チームメンバー ({teamMembers.length}名)
        </h3>
        <div className="space-y-3">
          {teamMembers.slice(0, 5).map(member => (
            <div key={member.id} className="flex items-center gap-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.position}</p>
              </div>
            </div>
          ))}
          {teamMembers.length > 5 && (
            <p className="text-sm text-gray-500">他 {teamMembers.length - 5}名</p>
          )}
        </div>
      </Card>

      {/* チーム統計 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">チーム統計</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">今月の投稿数</span>
            <span className="text-lg font-semibold text-blue-600">{teamPosts.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">アクティブプロジェクト</span>
            <span className="text-lg font-semibold text-green-600">
              {teamProjects.filter(p => p.status === 'active').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">承認待ち案件</span>
            <span className="text-lg font-semibold text-orange-600">3</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTeamPosts = () => (
    <div className="space-y-4">
      {teamPosts.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">チーム投稿がありません</h3>
          <p className="text-gray-500">チームメンバーの投稿がここに表示されます。</p>
        </Card>
      ) : (
        teamPosts.map(post => (
          <EnhancedPost key={post.id} post={post} />
        ))
      )}
    </div>
  );

  const renderTeamProjects = () => (
    <div className="space-y-4">
      {teamProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">チームプロジェクトがありません</h3>
          <p className="text-gray-500">チームのプロジェクトがここに表示されます。</p>
        </Card>
      ) : (
        teamProjects.map(project => (
          <Card key={project.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                <p className="text-gray-600 mt-1">{project.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status === 'active' ? '進行中' :
                 project.status === 'planning' ? '計画中' : '一時停止'}
              </span>
            </div>
            <ProjectProgressIndicator project={project} />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>メンバー: {project.members.length}名</span>
              <span>予算: ¥{project.budget?.toLocaleString()}</span>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderPendingApprovals = () => (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          承認待ち案件
        </h3>
        <div className="space-y-3">
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">病棟業務改善プロジェクト</h4>
                <p className="text-sm text-gray-600 mt-1">看護業務の効率化を図る改善案</p>
                <p className="text-xs text-gray-500 mt-2">申請者: 田中花子 • 2日前</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  承認
                </button>
                <button className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400">
                  保留
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">リーダーステーション</h1>
          </div>
          <p className="text-gray-600">チーム管理とリーダーシップを発揮する場所です。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {leaderTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
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
    </div>
  );
};