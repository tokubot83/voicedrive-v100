import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { Building, Users, TrendingUp, DollarSign, Calendar, MessageSquare, BarChart3 } from 'lucide-react';
import { posts } from '../data/demo/posts';
import { projects } from '../data/demo/projects';
import { demoUsers } from '../data/demo/users';
import { EnhancedPost } from '../components/EnhancedPost';
import ProjectProgressIndicator from '../components/ProjectProgressIndicator';

export const SectionStationPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('section_overview');

  // 部署メンバーを取得（同じdepartment内のより低い権限レベル）
  const sectionMembers = demoUsers.filter(u => 
    u.department === user?.department && u.permissionLevel <= userPermissionLevel
  );
  
  // 部署の投稿
  const sectionPosts = posts.filter(post => {
    const author = demoUsers.find(u => u.id === post.authorId);
    return author?.department === user?.department;
  });

  // 部署のプロジェクト
  const sectionProjects = projects.filter(project =>
    project.department === user?.department
  );

  const sectionTabs = [
    { id: 'section_overview', label: '部署概要', icon: Building },
    { id: 'section_members', label: '部署メンバー', icon: Users },
    { id: 'section_projects', label: '部署プロジェクト', icon: TrendingUp },
    { id: 'budget_management', label: '予算管理', icon: DollarSign },
    { id: 'performance', label: 'パフォーマンス', icon: BarChart3 }
  ];

  const renderSectionOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* KPI カード */}
      <Card className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">総メンバー</span>
        </div>
        <div className="text-2xl font-bold text-white">{sectionMembers.length}</div>
        <div className="text-sm text-green-400">+2 今月</div>
      </Card>

      <Card className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium text-gray-300">アクティブプロジェクト</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {sectionProjects.filter(p => p.status === 'active').length}
        </div>
        <div className="text-sm text-blue-400">3件 計画中</div>
      </Card>

      <Card className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">月次予算</span>
        </div>
        <div className="text-2xl font-bold text-white">¥2.4M</div>
        <div className="text-sm text-orange-400">85% 使用済み</div>
      </Card>

      <Card className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium text-gray-300">今月の投稿</span>
        </div>
        <div className="text-2xl font-bold text-white">{sectionPosts.length}</div>
        <div className="text-sm text-green-400">+15% 先月比</div>
      </Card>

      {/* 最新活動 */}
      <Card className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6 lg:col-span-4">
        <h3 className="text-lg font-semibold text-white mb-4">最新活動</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">進行中プロジェクト</h4>
            <div className="space-y-3">
              {sectionProjects.filter(p => p.status === 'active').slice(0, 3).map(project => (
                <div key={project.id} className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{project.title}</p>
                    <p className="text-xs text-gray-400">進捗: {Math.floor(Math.random() * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-white mb-3">承認待ち案件</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">設備購入申請</p>
                  <p className="text-xs text-gray-400">¥500,000 • 緊急</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">人員配置変更</p>
                  <p className="text-xs text-gray-400">3名 • 通常</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSectionMembers = () => (
    <div className="space-y-6">
      {/* メンバー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">権限レベル分布</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(level => {
              const count = sectionMembers.filter(m => m.permissionLevel === level).length;
              const percentage = count > 0 ? (count / sectionMembers.length) * 100 : 0;
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-20">レベル{level}</span>
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

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">職種分布</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">看護師</span>
              <span className="font-medium">{sectionMembers.filter(m => m.position.includes('看護師')).length}名</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">事務職</span>
              <span className="font-medium">{sectionMembers.filter(m => m.position.includes('事務')).length}名</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">技術職</span>
              <span className="font-medium">{sectionMembers.filter(m => m.position.includes('技師')).length}名</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">活動状況</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">アクティブメンバー</span>
              <span className="font-medium text-green-600">{Math.floor(sectionMembers.length * 0.8)}名</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">今月投稿者</span>
              <span className="font-medium text-blue-600">{Math.floor(sectionMembers.length * 0.6)}名</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">プロジェクト参加者</span>
              <span className="font-medium text-purple-600">{Math.floor(sectionMembers.length * 0.4)}名</span>
            </div>
          </div>
        </Card>
      </div>

      {/* メンバーリスト */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">メンバー一覧</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionMembers.map(member => (
            <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.position}</p>
                <p className="text-xs text-gray-500">レベル {member.permissionLevel}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderBudgetManagement = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">予算概要</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">年間予算</span>
            <span className="text-xl font-bold text-gray-900">¥30,000,000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">使用済み</span>
            <span className="text-xl font-bold text-red-600">¥25,500,000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">残予算</span>
            <span className="text-xl font-bold text-green-600">¥4,500,000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-gray-500">85% 使用済み</p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">月次予算内訳</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">人件費</span>
            <span className="font-medium">¥1,800,000</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">設備費</span>
            <span className="font-medium">¥400,000</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">運営費</span>
            <span className="font-medium">¥200,000</span>
          </div>
          <div className="flex justify-between items-center py-2 font-semibold">
            <span className="text-gray-900">合計</span>
            <span className="text-gray-900">¥2,400,000</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">承認待ち予算申請</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">医療機器更新</h4>
              <p className="text-sm text-gray-600">超音波診断装置の更新</p>
              <p className="text-xs text-gray-500">申請者: 医療技術部 • 3日前</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">¥2,500,000</p>
              <div className="flex gap-2 mt-2">
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

  const renderSectionProjects = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">部署プロジェクト</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionProjects.map(project => (
            <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  project.status === 'active' ? 'bg-green-500' : 
                  project.status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                <h4 className="font-medium text-gray-900">{project.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
              <ProjectProgressIndicator 
                votes={project.votes || []}
                currentScore={project.progress || 0}
                postId={project.id}
                isCompact={true}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSectionAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">部署パフォーマンス</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">プロジェクト完了率</span>
            <span className="text-xl font-bold text-green-600">85%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">生産性指標</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">月間効率性</span>
            <span className="font-medium text-blue-600">92%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">品質スコア</span>
            <span className="font-medium text-purple-600">4.7/5.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">納期遵守率</span>
            <span className="font-medium text-green-600">96%</span>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-2xl p-6 backdrop-blur-xl border border-orange-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🏢</span>
            部署ステーション
          </h1>
          <p className="text-gray-300">部署の運営管理と予算管理を行う場所です。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="bg-gray-800/50 rounded-xl p-1 backdrop-blur border border-gray-700/50">
            <nav className="flex space-x-1">
              {sectionTabs.map(tab => {
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
          {activeTab === 'section_overview' && renderSectionOverview()}
          {activeTab === 'section_members' && renderSectionMembers()}
          {activeTab === 'section_projects' && renderSectionProjects()}
          {activeTab === 'budget_management' && renderBudgetManagement()}
          {activeTab === 'performance' && renderSectionAnalytics()}
        </div>
      </div>
    </div>
  );
};