import React, { useState, useEffect } from 'react';
import { User, Search, Edit2, Trash2, Shield, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { AuthorityManagementService } from '../services/AuthorityManagementService';
import { AuditService } from '../services/AuditService';

interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  authorityLevel: number;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // ダミーデータの生成
  useEffect(() => {
    const dummyUsers: UserData[] = [
      {
        id: '1',
        name: '山田 太郎',
        email: 'yamada.taro@example.com',
        department: '営業部',
        position: '部長',
        authorityLevel: 5,
        status: 'active',
        lastLogin: '2024-01-15 09:30',
        createdAt: '2023-04-01'
      },
      {
        id: '2',
        name: '鈴木 花子',
        email: 'suzuki.hanako@example.com',
        department: '開発部',
        position: 'シニアエンジニア',
        authorityLevel: 4,
        status: 'active',
        lastLogin: '2024-01-15 10:45',
        createdAt: '2023-06-15'
      },
      {
        id: '3',
        name: '田中 次郎',
        email: 'tanaka.jiro@example.com',
        department: '人事部',
        position: 'マネージャー',
        authorityLevel: 3,
        status: 'inactive',
        lastLogin: '2024-01-10 14:20',
        createdAt: '2023-08-20'
      },
      {
        id: '4',
        name: '佐藤 美咲',
        email: 'sato.misaki@example.com',
        department: '経理部',
        position: '主任',
        authorityLevel: 2,
        status: 'active',
        lastLogin: '2024-01-15 08:15',
        createdAt: '2023-10-01'
      },
      {
        id: '5',
        name: '高橋 健一',
        email: 'takahashi.kenichi@example.com',
        department: '企画部',
        position: '社員',
        authorityLevel: 1,
        status: 'suspended',
        lastLogin: '2024-01-05 16:30',
        createdAt: '2024-01-01'
      }
    ];
    setUsers(dummyUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && user.status === 'active';
    if (activeTab === 'inactive') return matchesSearch && (user.status === 'inactive' || user.status === 'suspended');
    
    return matchesSearch;
  });

  const getStatusBadge = (status: UserData['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" />
            アクティブ
          </span>
        );
      case 'inactive':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            <XCircle className="w-3 h-3" />
            非アクティブ
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            <AlertCircle className="w-3 h-3" />
            停止中
          </span>
        );
    }
  };

  const getAuthorityBadge = (level: number) => {
    const colors = [
      'bg-gray-500/20 text-gray-400',
      'bg-blue-500/20 text-blue-400',
      'bg-green-500/20 text-green-400',
      'bg-yellow-500/20 text-yellow-400',
      'bg-orange-500/20 text-orange-400',
      'bg-purple-500/20 text-purple-400',
      'bg-pink-500/20 text-pink-400',
      'bg-red-500/20 text-red-400',
      'bg-indigo-500/20 text-indigo-400'
    ];
    
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[level] || colors[0]}`}>
        <Shield className="w-3 h-3" />
        レベル {level}
      </span>
    );
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    
    // 監査ログ記録
    AuditService.log({
      userId: user.id,
      action: 'USER_EDIT_INITIATED',
      targetId: user.id,
      details: { userName: user.name }
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('このユーザーを削除してもよろしいですか？')) {
      setUsers(users.filter(u => u.id !== userId));
      
      // 監査ログ記録
      AuditService.log({
        userId: user?.id || '',
        action: 'USER_DELETED',
        targetId: userId,
        severity: 'high'
      });
    }
  };

  const tabs = [
    { id: 'all', label: '全ユーザー', count: users.length },
    { id: 'active', label: 'アクティブ', count: users.filter(u => u.status === 'active').length },
    { id: 'inactive', label: '非アクティブ', count: users.filter(u => u.status === 'inactive' || u.status === 'suspended').length }
  ];

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">👥</span>
            ユーザー管理
          </h1>
          <p className="text-gray-300">
            システムユーザーの管理と権限設定を行います
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">総ユーザー数</span>
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{users.length}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">アクティブ</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {users.filter(u => u.status === 'active').length}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">管理者</span>
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {users.filter(u => u.authorityLevel >= 5).length}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">新規（30日以内）</span>
              <Plus className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">2</div>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="名前、メール、部署で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              新規ユーザー追加
            </button>
          </div>

          {/* タブ */}
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* ユーザーリスト */}
        <div className="bg-gray-800/50 rounded-xl backdrop-blur border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    部署・役職
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    権限レベル
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    最終ログイン
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-white">{user.department}</div>
                        <div className="text-xs text-gray-400">{user.position}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getAuthorityBadge(user.authorityLevel)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};