import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { Users, UserPlus, Settings, Shield, Clock, TrendingUp } from 'lucide-react';
import { demoUsers } from '../data/demo/users';

export const TeamManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('team_overview');

  // チームメンバーを取得
  const teamMembers = demoUsers.filter(u => 
    u.department === user?.department && u.permissionLevel < userPermissionLevel
  );

  const managementTabs = [
    { id: 'team_overview', label: 'チーム概要', icon: Users },
    { id: 'member_management', label: 'メンバー管理', icon: UserPlus },
    { id: 'permission_basic', label: '基本権限管理', icon: Shield }
  ];

  const renderTeamOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">チーム統計</h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{teamMembers.length}</div>
            <div className="text-sm text-gray-500">総メンバー数</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-green-600">
                {teamMembers.filter(m => Math.random() > 0.3).length}
              </div>
              <div className="text-xs text-gray-500">アクティブ</div>
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-600">2</div>
              <div className="text-xs text-gray-500">研修中</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">新メンバーが加入しました</p>
              <p className="text-xs text-gray-500">田中花子 • 看護師 • 2日前</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">チーム研修が完了しました</p>
              <p className="text-xs text-gray-500">安全管理研修 • 5名参加 • 1週間前</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderMemberManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">メンバー管理</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          新メンバー追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <Card key={member.id} className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.position}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">権限レベル:</span>
                <span className="font-medium">レベル {member.permissionLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">所属期間:</span>
                <span className="font-medium">2年3ヶ月</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                編集
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                詳細
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPermissionBasic = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本権限管理</h3>
        <p className="text-gray-600 mb-6">チームメンバーの基本的な権限設定を管理します。</p>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">投稿権限</h4>
            <p className="text-sm text-gray-600 mb-3">メンバーが投稿できる範囲を設定</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">チーム内投稿</span>
              </label>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">閲覧権限</h4>
            <p className="text-sm text-gray-600 mb-3">メンバーが閲覧できる情報の範囲</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">チーム投稿</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">プロジェクト情報</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            設定を保存
          </button>
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
            リセット
          </button>
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
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">チーム管理</h1>
          </div>
          <p className="text-gray-600">チームメンバーの管理と基本的な権限設定を行います。</p>
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
          {activeTab === 'team_overview' && renderTeamOverview()}
          {activeTab === 'member_management' && renderMemberManagement()}
          {activeTab === 'permission_basic' && renderPermissionBasic()}
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage;