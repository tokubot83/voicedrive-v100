/**
 * ユーザー管理ページ（レベル99専用）
 * 全ユーザーのアカウント情報を管理
 */

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Edit, Trash2, UserPlus, Download, Upload, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';
import { AuditService } from '../../services/AuditService';
import { ACCOUNT_TYPE_LABELS } from '../../types/accountLevel';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  permissionLevel: number;
  department: string;
  position: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 権限チェック（レベル99のみアクセス可能）
  useEffect(() => {
    if (!user || user.permissionLevel !== 99) {
      navigate('/');
      return;
    }

    // デモ用ユーザーデータを読み込み
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    // TODO: 実際の実装では、APIから取得
    // const response = await fetch('/api/admin/users');
    // const data = await response.json();

    // デモデータ
    const demoUsers: UserAccount[] = [
      {
        id: 'admin-001',
        name: '徳留 太郎（システム管理者）',
        email: 'tokuru@voicedrive.local',
        permissionLevel: 99,
        department: 'システム開発部',
        position: 'システム管理者',
        isActive: true,
        lastLoginAt: new Date('2025-10-05T14:30:00'),
        createdAt: new Date('2025-01-01')
      },
      {
        id: 'user-001',
        name: '田中 花子',
        email: 'tanaka@example.com',
        permissionLevel: 1,
        department: '看護部',
        position: '看護師',
        isActive: true,
        lastLoginAt: new Date('2025-10-05T10:20:00'),
        createdAt: new Date('2025-01-15')
      },
      {
        id: 'user-002',
        name: '佐藤 次郎',
        email: 'sato@example.com',
        permissionLevel: 6,
        department: 'リハビリテーション科',
        position: '主任',
        isActive: true,
        lastLoginAt: new Date('2025-10-04T16:45:00'),
        createdAt: new Date('2024-06-01')
      },
      {
        id: 'user-003',
        name: '山田 三郎',
        email: 'yamada@example.com',
        permissionLevel: 8,
        department: '看護部',
        position: '師長',
        isActive: true,
        lastLoginAt: new Date('2025-10-05T09:15:00'),
        createdAt: new Date('2023-04-01')
      },
      {
        id: 'user-004',
        name: '鈴木 四郎',
        email: 'suzuki@example.com',
        permissionLevel: 3,
        department: '医事課',
        position: '中堅職員',
        isActive: false,
        lastLoginAt: new Date('2025-09-20T11:30:00'),
        createdAt: new Date('2024-02-01')
      }
    ];

    setUsers(demoUsers);
    setFilteredUsers(demoUsers);
  };

  // フィルタリング処理
  useEffect(() => {
    let filtered = [...users];

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // レベルフィルター
    if (filterLevel !== 'all') {
      const level = parseInt(filterLevel);
      filtered = filtered.filter(u => u.permissionLevel === level);
    }

    // ステータスフィルター
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(u => u.isActive === isActive);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterLevel, filterStatus]);

  const handleEditUser = (user: UserAccount) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('このユーザーを削除してよろしいですか？')) return;

    AuditService.log({
      userId: user?.id || '',
      action: 'USER_DELETED',
      targetId: userId,
      details: { deletedUser: users.find(u => u.id === userId) },
      severity: 'high'
    });

    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleExportUsers = () => {
    const csv = [
      ['ユーザーID', '名前', 'メール', '権限レベル', '部署', '役職', 'ステータス', '最終ログイン', '作成日'],
      ...filteredUsers.map(u => [
        u.id,
        u.name,
        u.email,
        u.permissionLevel.toString(),
        u.department,
        u.position,
        u.isActive ? '有効' : '無効',
        u.lastLoginAt?.toLocaleString('ja-JP') || '',
        u.createdAt.toLocaleString('ja-JP')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getLevelBadge = (level: number) => {
    const config = {
      99: { color: 'bg-purple-500/20 text-purple-400', label: 'Level X' },
      18: { color: 'bg-red-500/20 text-red-400', label: 'Level 18' },
      13: { color: 'bg-orange-500/20 text-orange-400', label: 'Level 13' },
      10: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Level 10' },
      8: { color: 'bg-green-500/20 text-green-400', label: 'Level 8' },
      6: { color: 'bg-blue-500/20 text-blue-400', label: 'Level 6' },
      default: { color: 'bg-gray-500/20 text-gray-400', label: `Level ${level}` }
    };

    const badge = config[level as keyof typeof config] || config.default;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 w-full pb-32">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-blue-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">👥</span>
            ユーザー管理
          </h1>
          <p className="text-gray-300">
            レベルX専用 - 全ユーザーのアカウント情報を管理します
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総ユーザー数</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">アクティブ</p>
                <p className="text-2xl font-bold text-green-400">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">無効</p>
                <p className="text-2xl font-bold text-red-400">
                  {users.filter(u => !u.isActive).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">管理者</p>
                <p className="text-2xl font-bold text-purple-400">
                  {users.filter(u => u.permissionLevel >= 10).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* 検索とフィルター */}
        <Card className="bg-gray-800/50 p-4 border border-gray-700/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="名前、メール、部署で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* レベルフィルター */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全レベル</option>
              <option value="99">Level X</option>
              <option value="18">Level 18</option>
              <option value="13">Level 13</option>
              <option value="10">Level 10</option>
              <option value="8">Level 8</option>
              <option value="6">Level 6</option>
              <option value="1">Level 1</option>
            </select>

            {/* ステータスフィルター */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全ステータス</option>
              <option value="active">有効</option>
              <option value="inactive">無効</option>
            </select>

            {/* アクションボタン */}
            <button
              onClick={handleExportUsers}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSVエクスポート
            </button>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              新規ユーザー
            </button>
          </div>
        </Card>

        {/* ユーザーリスト */}
        <Card className="bg-gray-800/50 border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">名前</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">メール</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">部署</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">役職</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">権限</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">ステータス</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">最終ログイン</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{u.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{u.position}</td>
                    <td className="px-4 py-3 text-sm">{getLevelBadge(u.permissionLevel)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.isActive ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {u.lastLoginAt?.toLocaleString('ja-JP', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="削除"
                          disabled={u.permissionLevel === 99}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">ユーザーが見つかりませんでした</p>
            </div>
          )}
        </Card>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};
