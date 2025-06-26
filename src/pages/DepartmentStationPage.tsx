import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { Building2, Users, TrendingUp, BarChart3, MessageSquare } from 'lucide-react';
import { posts } from '../data/demo/posts';
import { projects } from '../data/demo/projects';
import { demoUsers } from '../data/demo/users';
import EnhancedPost from '../components/EnhancedPost';
import ProjectProgressIndicator from '../components/ProjectProgressIndicator';

export const DepartmentStationPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('dept_overview');

  // 部門メンバーを取得（安全なチェック）
  const deptMembers = demoUsers?.filter(u => u.department === user?.department) || [];
  
  // 部門の投稿（安全なチェック）
  const deptPosts = posts?.filter(post => {
    const author = demoUsers?.find(u => u.id === post.authorId);
    return author?.department === user?.department;
  }) || [];

  // 部門のプロジェクト（安全なチェック）
  const deptProjects = projects?.filter(project =>
    project.department === user?.department
  ) || [];

  const deptTabs = [
    { id: 'dept_overview', label: '部門概要', icon: Building2 },
    { id: 'dept_members', label: '部門メンバー', icon: Users },
    { id: 'dept_posts', label: '部門投稿', icon: MessageSquare },
    { id: 'dept_projects', label: '部門プロジェクト', icon: TrendingUp },
    { id: 'dept_analytics', label: '部門分析', icon: BarChart3 }
  ];

  const renderDeptOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 部門統計 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">部門統計</h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{deptMembers?.length || 0}</div>
            <div className="text-sm text-gray-500">総メンバー数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {deptProjects?.filter(p => p.status === 'active').length || 0}
            </div>
            <div className="text-sm text-gray-500">アクティブプロジェクト</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{deptPosts?.length || 0}</div>
            <div className="text-sm text-gray-500">今月の投稿数</div>
          </div>
        </div>
      </Card>

      {/* 最新のプロジェクト */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最新プロジェクト</h3>
        <div className="space-y-3">
          {deptProjects?.slice(0, 3).map(project => (
            <div key={project.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-gray-900">{project.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>メンバー: {project.members?.length || 0}名</span>
                <span className={`px-2 py-1 rounded ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status === 'active' ? '進行中' :
                   project.status === 'planning' ? '計画中' : '一時停止'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDeptMembers = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deptMembers?.map(member => (
        <Card key={member.id} className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.position}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">権限レベル:</span>
              <span className="font-medium">レベル {member.permissionLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">所属:</span>
              <span className="font-medium">{member.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">施設:</span>
              <span className="font-medium">{member.facility}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderDeptPosts = () => (
    <div className="space-y-4">
      {deptPosts.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">部門投稿がありません</h3>
          <p className="text-gray-500">部門メンバーの投稿がここに表示されます。</p>
        </Card>
      ) : (
        deptPosts?.map(post => (
          <EnhancedPost key={post.id} post={post} />
        ))
      )}
    </div>
  );

  const renderDeptProjects = () => (
    <div className="space-y-4">
      {deptProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">部門プロジェクトがありません</h3>
          <p className="text-gray-500">部門のプロジェクトがここに表示されます。</p>
        </Card>
      ) : (
        deptProjects?.map(project => (
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
              <span>メンバー: {project.members?.length || 0}名</span>
              <span>予算: ¥{project.budget?.toLocaleString() || '未設定'}</span>
              <span>期限: {project.deadline || '未設定'}</span>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderDeptAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">活動統計</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">今月の投稿数</span>
            <span className="text-lg font-semibold text-blue-600">{deptPosts?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">アクティブメンバー</span>
            <span className="text-lg font-semibold text-green-600">
              {deptMembers?.filter(m => m.permissionLevel >= 1).length || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">完了プロジェクト</span>
            <span className="text-lg font-semibold text-purple-600">
              {deptProjects?.filter(p => p.status === 'completed').length || 0}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">権限レベル分布</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(level => {
            const count = deptMembers?.filter(m => m.permissionLevel === level).length || 0;
            const percentage = count > 0 && deptMembers?.length ? (count / deptMembers.length) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <span className="text-sm font-medium w-16">レベル{level}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
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
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">部門ステーション</h1>
          </div>
          <p className="text-gray-600">部門全体の状況を把握し、管理を行う場所です。</p>
          {!user?.department && (
            <div className="mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm">注意: ユーザーの部門情報が設定されていません。</p>
            </div>
          )}
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {deptTabs.map(tab => {
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
          {activeTab === 'dept_overview' && renderDeptOverview()}
          {activeTab === 'dept_members' && renderDeptMembers()}
          {activeTab === 'dept_posts' && renderDeptPosts()}
          {activeTab === 'dept_projects' && renderDeptProjects()}
          {activeTab === 'dept_analytics' && renderDeptAnalytics()}
        </div>
      </div>
    </div>
  );
};