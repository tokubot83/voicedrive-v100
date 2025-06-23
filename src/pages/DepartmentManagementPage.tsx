import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { Building2, Users, Settings, BarChart3, Shield, Target } from 'lucide-react';
import { demoUsers } from '../data/demo/users';
import { projects } from '../data/demo/projects';

export const DepartmentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('dept_overview');

  // 部門メンバーを取得
  const deptMembers = demoUsers.filter(u => u.department === user?.department);
  const deptProjects = projects.filter(p => p.department === user?.department);

  const managementTabs = [
    { id: 'dept_overview', label: '部門概要', icon: Building2 },
    { id: 'dept_structure', label: '部門構造管理', icon: Users },
    { id: 'authority_management', label: '権限管理', icon: Shield },
    { id: 'project_oversight', label: 'プロジェクト監督', icon: Target },
    { id: 'performance_metrics', label: 'パフォーマンス指標', icon: BarChart3 }
  ];

  const renderDeptOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">部門統計</h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{deptMembers.length}</div>
            <div className="text-sm text-gray-500">総メンバー数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{deptProjects.length}</div>
            <div className="text-sm text-gray-500">部門プロジェクト</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">部門パフォーマンス</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="text-sm text-gray-500">目標達成率</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">8.5</div>
            <div className="text-sm text-gray-500">平均満足度</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">¥2.4M</div>
            <div className="text-sm text-gray-500">月次予算使用</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDeptStructure = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">部門組織構造</h3>
        <div className="space-y-4">
          {/* 権限レベル別表示 */}
          {[4, 3, 2, 1].map(level => {
            const levelMembers = deptMembers.filter(m => m.permissionLevel === level);
            const levelNames = {
              4: '部長・課長',
              3: '師長',
              2: '主任',
              1: '一般職員'
            };
            
            return (
              <div key={level} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  レベル{level} - {levelNames[level as keyof typeof levelNames]} ({levelMembers.length}名)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {levelMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderAuthorityManagement = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">権限管理設定</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">部門レベル権限</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">部門内プロジェクト作成</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">部門予算管理</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">他部門との連携プロジェクト</span>
              </label>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">承認フロー設定</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">小額予算（¥100,000以下）</span>
                <select className="text-sm border rounded px-2 py-1">
                  <option>主任レベル以上</option>
                  <option>師長レベル以上</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">中額予算（¥500,000以下）</span>
                <select className="text-sm border rounded px-2 py-1">
                  <option>師長レベル以上</option>
                  <option>部長レベル以上</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderProjectOversight = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">プロジェクト監督</h3>
        <div className="space-y-4">
          {deptProjects.map(project => (
            <div key={project.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status === 'active' ? '進行中' :
                   project.status === 'planning' ? '計画中' : '一時停止'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">メンバー:</span>
                  <span className="font-medium ml-1">{project.members.length}名</span>
                </div>
                <div>
                  <span className="text-gray-500">予算:</span>
                  <span className="font-medium ml-1">¥{project.budget?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">期限:</span>
                  <span className="font-medium ml-1">{project.deadline}</span>
                </div>
              </div>
            </div>
          ))}
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
            <h1 className="text-2xl font-bold text-gray-900">部門管理</h1>
          </div>
          <p className="text-gray-600">部門全体の管理と権限設定を行います。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {managementTabs.map(tab => {
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
          {activeTab === 'dept_structure' && renderDeptStructure()}
          {activeTab === 'authority_management' && renderAuthorityManagement()}
          {activeTab === 'project_oversight' && renderProjectOversight()}
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagementPage;