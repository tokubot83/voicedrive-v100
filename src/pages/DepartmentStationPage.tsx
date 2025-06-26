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

  // 部門情報の安全な取得とデフォルト値設定
  const userDepartment = user?.department;
  const safeDepartment = userDepartment || '未設定部門';
  
  // 部門メンバーを取得（徹底的安全チェック）
  const deptMembers = (demoUsers && Array.isArray(demoUsers) && userDepartment) 
    ? demoUsers.filter(u => u?.department === userDepartment) 
    : [];
  
  // 部門の投稿（徹底的安全チェック）
  const deptPosts = (posts && Array.isArray(posts) && demoUsers && Array.isArray(demoUsers) && userDepartment)
    ? posts.filter(post => {
        if (!post?.authorId) return false;
        const author = demoUsers.find(u => u?.id === post.authorId);
        return author?.department === userDepartment;
      })
    : [];

  // 部門のプロジェクト（徹底的安全チェック）
  const deptProjects = (projects && Array.isArray(projects) && userDepartment)
    ? projects.filter(project => project?.department === userDepartment)
    : [];

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
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">部門統計</h3>
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
            <div className="text-2xl font-bold text-purple-400">{deptPosts?.length || 0}</div>
            <div className="text-sm text-gray-400">今月の投稿数</div>
          </div>
        </div>
      </div>

      {/* 最新のプロジェクト */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">最新プロジェクト</h3>
        <div className="space-y-3">
          {deptProjects?.slice(0, 3).map(project => (
            <div key={project?.id || Math.random()} className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-white">{project?.title || 'プロジェクト名未設定'}</h4>
              <p className="text-sm text-gray-300 mt-1">{project?.description || '説明なし'}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>メンバー: {project?.members?.length || 0}名</span>
                <span className={`px-2 py-1 rounded ${
                  project?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  project?.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {project?.status === 'active' ? '進行中' :
                   project?.status === 'planning' ? '計画中' : '一時停止'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDeptMembers = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deptMembers?.map(member => (
        <div key={member?.id || Math.random()} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={member?.avatar || '/default-avatar.png'}
              alt={member?.name || 'ユーザー'}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-white">{member?.name || 'Unknown User'}</h3>
              <p className="text-sm text-gray-300">{member?.position || '職位未設定'}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">権限レベル:</span>
              <span className="font-medium text-gray-200">レベル {member?.permissionLevel || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">所属:</span>
              <span className="font-medium text-gray-200">{member?.department || '未設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">施設:</span>
              <span className="font-medium text-gray-200">{member?.facility || '未設定'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDeptPosts = () => (
    <div className="space-y-4">
      {deptPosts.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur border border-gray-700/50 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">部門投稿がありません</h3>
          <p className="text-gray-400">部門メンバーの投稿がここに表示されます。</p>
        </div>
      ) : (
        deptPosts?.map(post => (
          <EnhancedPost key={post?.id || Math.random()} post={post} />
        ))
      )}
    </div>
  );

  const renderDeptProjects = () => (
    <div className="space-y-4">
      {deptProjects.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur border border-gray-700/50 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">部門プロジェクトがありません</h3>
          <p className="text-gray-400">部門のプロジェクトがここに表示されます。</p>
        </div>
      ) : (
        deptProjects?.map(project => (
          <div key={project?.id || Math.random()} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{project?.title || 'プロジェクト名未設定'}</h3>
                <p className="text-gray-300 mt-1">{project?.description || '説明なし'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                project?.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {project?.status === 'active' ? '進行中' :
                 project?.status === 'planning' ? '計画中' : '一時停止'}
              </span>
            </div>
            <ProjectProgressIndicator project={project} />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>メンバー: {project?.members?.length || 0}名</span>
              <span>予算: ¥{project?.budget?.toLocaleString() || '未設定'}</span>
              <span>期限: {project?.deadline || '未設定'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderDeptAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">活動統計</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">今月の投稿数</span>
            <span className="text-lg font-semibold text-blue-600">{deptPosts?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">アクティブメンバー</span>
            <span className="text-lg font-semibold text-green-600">
              {deptMembers?.filter(m => m?.permissionLevel >= 1).length || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">完了プロジェクト</span>
            <span className="text-lg font-semibold text-purple-400">
              {deptProjects?.filter(p => p.status === 'completed').length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">権限レベル分布</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(level => {
            const count = deptMembers?.filter(m => m?.permissionLevel === level).length || 0;
            const percentage = count > 0 && deptMembers?.length ? (count / deptMembers.length) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300 w-16">レベル{level}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">部門ステーション</h1>
          </div>
          <p className="text-gray-400">部門全体の状況を把握し、管理を行う場所です。</p>
          {!userDepartment && (
            <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">注意: ユーザーの部門情報が設定されていません。デモデータで表示しています。</p>
            </div>
          )}
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
            <nav className="flex space-x-2">
              {deptTabs.map(tab => {
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