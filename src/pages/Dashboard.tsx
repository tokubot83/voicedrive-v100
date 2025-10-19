import React, { useState, useEffect } from 'react';
import { PermissionLevelBadge } from '../components/permission/PermissionLevelBadge';
import { useUser } from '../contexts/UserContext';
import { useUserPermission } from '../hooks/useUserPermission';
import {
  Home,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Award,
  TrendingUp,
  UserCheck,
  Shield,
  Bell
} from 'lucide-react';

interface DashboardStat {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

export const Dashboard: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const permission = useUserPermission();
  const [stats, setStats] = useState<DashboardStat[]>([]);

  useEffect(() => {
    if (user) {
      // 権限レベルに応じた統計を生成
      const baseStats: DashboardStat[] = [
        {
          label: '投稿したアイデア',
          value: 12,
          change: '+2 今月',
          icon: <MessageSquare className="w-5 h-5" />,
          color: 'blue'
        },
        {
          label: '投票参加',
          value: 48,
          change: '+8 今週',
          icon: <UserCheck className="w-5 h-5" />,
          color: 'green'
        }
      ];

      // 管理者レベル以上の統計
      if (permission.isManager) {
        baseStats.push({
          label: '承認待ち議題',
          value: 5,
          icon: <Award className="w-5 h-5" />,
          color: 'orange'
        });
      }

      // 分析アクセス権限がある場合
      if (permission.canAccessAnalytics) {
        baseStats.push({
          label: '部署効率',
          value: '87%',
          change: '+3%',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'purple'
        });
      }

      setStats(baseStats);
    }
  }, [user, permission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">ログインが必要です</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Home className="w-6 h-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* ユーザー情報セクション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* アバター */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0)}
              </div>

              {/* ユーザー詳細 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.department} • {user.facility}</p>
                <p className="text-sm text-gray-500">{user.profession} {user.position && `• ${user.position}`}</p>
              </div>
            </div>

            {/* 権限レベルバッジ */}
            <div className="flex flex-col items-end space-y-2">
              <PermissionLevelBadge
                level={permission.level!}
                size="large"
              />
              <span className="text-sm text-gray-600">{permission.levelDescription}</span>
              {permission.isNursingLeader && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  リーダー業務可
                </span>
              )}
            </div>
          </div>

          {/* 権限情報 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{permission.calculatedLevel}</div>
              <div className="text-xs text-gray-500">権限レベル</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{user.experienceYears}年</div>
              <div className="text-xs text-gray-500">経験年数</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {permission.availableMenus.length}
              </div>
              <div className="text-xs text-gray-500">利用可能機能</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center space-x-1">
                {permission.canCreatePost && <span title="投稿">📝</span>}
                {permission.canVote && <span title="投票">🗳️</span>}
                {permission.canApproveProjects && <span title="承認">✅</span>}
                {permission.canAccessAnalytics && <span title="分析">📊</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">権限</div>
            </div>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">活動状況</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  {stat.icon}
                </div>
                {stat.change && (
                  <span className="text-xs text-green-600">{stat.change}</span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* アクセス可能メニュー */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">利用可能な機能</h3>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {permission.availableMenus.map((menu, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <MenuIcon name={menu} />
                </div>
                <span className="text-sm text-gray-700">{getMenuLabel(menu)}</span>
              </button>
            ))}
          </div>

          {/* 権限による制限メッセージ */}
          {permission.isNewcomer && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                🌱 新人期間中です。経験を積むことで、より多くの機能が利用可能になります。
              </p>
            </div>
          )}

          {permission.isManager && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                👔 管理職権限があります。承認業務と分析機能をご利用いただけます。
              </p>
            </div>
          )}

          {permission.isSystemAdmin && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ システム管理者モードです。全ての機能にアクセス可能です。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// メニューアイコンコンポーネント
const MenuIcon: React.FC<{ name: string }> = ({ name }) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'personal_station': <Home className="w-6 h-6 text-blue-600" />,
    'department_board': <Users className="w-6 h-6 text-blue-600" />,
    'team_dashboard': <BarChart3 className="w-6 h-6 text-blue-600" />,
    'proposal_review': <MessageSquare className="w-6 h-6 text-blue-600" />,
    'committee_tools': <Award className="w-6 h-6 text-blue-600" />,
  };

  return <>{iconMap[name] || <Settings className="w-6 h-6 text-blue-600" />}</>;
};

// メニューラベル取得
const getMenuLabel = (menuKey: string): string => {
  const labels: { [key: string]: string } = {
    'personal_station': 'パーソナルステーション',
    'department_board': '部署掲示板',
    'team_dashboard': 'チームダッシュボード',
    'proposal_review': '提案レビュー',
    'committee_tools': '委員会ツール',
    'quick_implementation': '迅速実装',
    'department_station': '部署ステーション',
    'agenda_generator': '議題ジェネレーター',
    'committee_bridge': '委員会ブリッジ',
    'operations_committee': '運営委員会',
    'facility_governance': '施設ガバナンス',
    'strategic_decision': '戦略決定',
    'executive_dashboard': 'エグゼクティブダッシュボード',
  };

  return labels[menuKey] || menuKey;
};