import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
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
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('my_posts');

  // 自分の投稿をフィルタリング
  const myPosts = posts.filter(post => post.authorId === user?.id);
  const myProjects = projects.filter(project => 
    project.members.some(member => member.id === user?.id)
  );

  const personalTabs = [
    { id: 'my_posts', label: 'マイポスト', icon: MessageSquare },
    { id: 'my_projects', label: 'マイプロジェクト', icon: TrendingUp },
    { id: 'activity', label: 'アクティビティ', icon: User }
  ];

  const renderMyPosts = () => (
    <div className="space-y-4">
      <ComposeSection />
      {myPosts.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">投稿がありません</h3>
          <p className="text-gray-500">最初の投稿を作成してみましょう。</p>
        </Card>
      ) : (
        myPosts.map(post => (
          <EnhancedPost key={post.id} post={post} />
        ))
      )}
    </div>
  );

  const renderMyProjects = () => (
    <div className="space-y-4">
      {myProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">参加プロジェクトがありません</h3>
          <p className="text-gray-500">プロジェクトに参加するか、新しいプロジェクトを提案してみましょう。</p>
        </Card>
      ) : (
        myProjects.map(project => (
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
          </Card>
        ))
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近のアクティビティ</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">新しい投稿を作成しました</p>
              <p className="text-xs text-gray-500">2時間前</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">プロジェクトが承認されました</p>
              <p className="text-xs text-gray-500">1日前</p>
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
            <Home className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">パーソナルステーション</h1>
          </div>
          <p className="text-gray-600">あなた専用のワークスペースです。投稿やプロジェクトを管理しましょう。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {personalTabs.map(tab => {
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
          {activeTab === 'my_posts' && renderMyPosts()}
          {activeTab === 'my_projects' && renderMyProjects()}
          {activeTab === 'activity' && renderActivity()}
        </div>
      </div>
    </div>
  );
};