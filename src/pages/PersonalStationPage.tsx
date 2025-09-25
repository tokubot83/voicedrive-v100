import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { useDemoMode } from '../components/demo/DemoModeController';
import { useUser } from '../contexts/UserContext';
import { useUserPermission } from '../hooks/useUserPermission';
import { PermissionLevelBadge } from '../components/permission/PermissionLevelBadge';
import { AttentionList } from '../components/management/AttentionList';
import { CommitteeBridge } from '../components/committee/CommitteeBridge';
import { VoteWeightVisualizer } from '../components/voting/VoteWeightVisualizer';
import { MainTabs } from '../components/tabs/MainTabs';
import { SubFilters } from '../components/tabs/SubFilters';
import { Post } from '../components/Post';
import ComposeSection from '../components/ComposeSection';
import ProjectProgressIndicator from '../components/ProjectProgressIndicator';
import EnhancedPost from '../components/EnhancedPost';
import { posts } from '../data/demo/posts';
import { projects } from '../data/demo/projects';
import { Card } from '../components/ui/Card';
import { Home, User, MessageSquare, TrendingUp, Shield, BarChart3, Award, UserCheck } from 'lucide-react';
import { PostType, VoteOption, Comment } from '../types';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

export const PersonalStationPage: React.FC = () => {
  const { user } = useAuth();
  const { currentUser } = useDemoMode();
  const { userPermissionLevel, hasPermission } = usePermissions();

  // UserContextのフックを条件付きで使用
  let contextUser = null;
  let permission = {
    level: null as any,
    calculatedLevel: 1,
    levelDescription: '',
    isNursingLeader: false,
    availableMenus: [],
    canCreatePost: true,
    canVote: true,
    canApproveProjects: false,
    canAccessAnalytics: false,
    isNewcomer: false,
    isManager: false,
    isSystemAdmin: false
  };

  try {
    const userContext = useUser();
    const userPermission = useUserPermission();
    contextUser = userContext.user;
    permission = { ...permission, ...userPermission };
  } catch (error) {
    // UserProviderが存在しない場合はデフォルト値を使用
    console.log('UserProvider not available, using default values');
  }

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('improvement');

  // 自分の投稿をフィルタリング（安全なチェック）
  const myPosts = posts?.filter(post => post.authorId === user?.id) || [];
  const myProjects = projects?.filter(project => 
    project.members?.some(member => member.id === user?.id)
  ) || [];

  // ダミーデータ
  const myVotes = {
    total: 89,
    thisMonth: 12,
    impactScore: 76
  };

  const notifications = [
    { id: 1, type: 'success', message: 'あなたの提案が承認されました！', time: '2時間前' },
    { id: 2, type: 'info', message: '新しい投稿にコメントがあります', time: '5時間前' },
    { id: 3, type: 'warning', message: '提案の締切が近づいています', time: '1日前' }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '📌';
    }
  };

  const handleVote = (postId: string, option: VoteOption) => {
    // 投票処理の実装
    console.log('Vote:', postId, option);
  };

  const handleComment = (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    // コメント処理の実装
    console.log('Comment:', postId, comment);
  };

  const personalTabs = [
    { id: 'overview', label: '概要', icon: Home },
    { id: 'my_posts', label: 'マイポスト', icon: MessageSquare },
    { id: 'my_projects', label: 'マイプロジェクト', icon: TrendingUp },
    { id: 'activity', label: 'アクティビティ', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 権限レベル表示セクション（新規追加） */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* ユーザー詳細 */}
            <div>
              <h2 className="text-xl font-bold text-white">{contextUser?.name || currentUser?.name || 'ゲスト'}</h2>
              <p className="text-sm text-gray-400">
                {contextUser?.department || '未設定'} • {contextUser?.facility || '大原記念財団'}
              </p>
              <p className="text-sm text-gray-400">
                {contextUser?.profession || '医療従事者'} {contextUser?.position && `• ${contextUser.position}`}
              </p>
            </div>
          </div>

          {/* 権限レベルバッジ */}
          {permission.level && (
            <div className="flex flex-col items-end space-y-2">
              <PermissionLevelBadge
                level={permission.level}
                size="large"
              />
              <span className="text-sm text-gray-300">{permission.levelDescription}</span>
              {permission.isNursingLeader && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  リーダー業務可
                </span>
              )}
            </div>
          )}
        </div>

        {/* 権限情報 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{permission.calculatedLevel || 1}</div>
            <div className="text-xs text-gray-400">権限レベル</div>
          </div>

          <div className="text-center p-3 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{contextUser?.experienceYears || 0}年</div>
            <div className="text-xs text-gray-400">経験年数</div>
          </div>

          <div className="text-center p-3 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {permission.availableMenus?.length || 0}
            </div>
            <div className="text-xs text-gray-400">利用可能機能</div>
          </div>

          <div className="text-center p-3 bg-gray-700/30 rounded-lg">
            <div className="flex justify-center space-x-1">
              {permission.canCreatePost && <span title="投稿">📝</span>}
              {permission.canVote && <span title="投票">🗳️</span>}
              {permission.canApproveProjects && <span title="承認">✅</span>}
              {permission.canAccessAnalytics && <span title="分析">📊</span>}
            </div>
            <div className="text-xs text-gray-400 mt-1">権限</div>
          </div>
        </div>
      </div>

      {/* 管理職向け注目リスト（レベル5以上） */}
      {permission.calculatedLevel >= 5 && (
        <AttentionList />
      )}

      {/* 委員会ブリッジ（レベル7以上） */}
      {permission.calculatedLevel >= 7 && (
        <CommitteeBridge />
      )}

      {/* 投票重み付け可視化 */}
      <VoteWeightVisualizer />

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">総投票数</span>
            <span className="text-2xl">🗳️</span>
          </div>
          <div className="text-3xl font-bold text-white">{myVotes.total}</div>
          <div className="text-sm text-green-400 mt-1">今月 +{myVotes.thisMonth}</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">影響力スコア</span>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="text-3xl font-bold text-white">{myVotes.impactScore}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${myVotes.impactScore}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">提案数</span>
            <span className="text-2xl">💡</span>
          </div>
          <div className="text-3xl font-bold text-white">{myPosts?.length || 0}</div>
          <div className="text-sm text-blue-400 mt-1">承認率 66.7%</div>
        </div>
      </div>

      {/* アクセス可能機能一覧（新規追加） */}
      {permission.availableMenus && permission.availableMenus.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            利用可能な機能
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {permission.availableMenus.map((menu, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                  {getMenuIcon(menu)}
                </div>
                <span className="text-sm text-gray-300">{getMenuLabel(menu)}</span>
              </button>
            ))}
          </div>

          {/* 権限による制限メッセージ */}
          {permission.isNewcomer && (
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
              <p className="text-sm text-blue-400">
                🌱 新人期間中です。経験を積むことで、より多くの機能が利用可能になります。
              </p>
            </div>
          )}

          {permission.isManager && (
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg">
              <p className="text-sm text-purple-400">
                👔 管理職権限があります。承認業務と分析機能をご利用いただけます。
              </p>
            </div>
          )}

          {permission.isSystemAdmin && (
            <div className="mt-6 p-4 bg-red-500/10 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ システム管理者モードです。全ての機能にアクセス可能です。
              </p>
            </div>
          )}
        </div>
      )}

      {/* 最近の通知 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          最近の通知
        </h2>
        <div className="space-y-3">
          {notifications.map(notification => (
            <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1">
                <p className="text-gray-200">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 参加プロジェクト */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          参加中のプロジェクト
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-600/10 p-4 rounded-lg border border-blue-500/30">
            <h3 className="text-white font-medium mb-2">社内コミュニケーション改善</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">進捗</span>
              <span className="text-blue-400">65%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-600/10 p-4 rounded-lg border border-purple-500/30">
            <h3 className="text-white font-medium mb-2">業務効率化ツール導入</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">進捗</span>
              <span className="text-purple-400">30%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyPosts = () => (
    <div className="space-y-4">
      <ComposeSection 
        selectedPostType={selectedPostType}
        setSelectedPostType={setSelectedPostType}
      />
      {(myPosts?.length || 0) === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">投稿がありません</h3>
          <p className="text-gray-400">最初の投稿を作成してみましょう。</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            マイ提案
          </h2>
          <div className="space-y-3">
            {myPosts?.map(post => (
              <div key={post.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                <EnhancedPost 
                  post={post} 
                  currentUser={currentUser || user}
                  onVote={handleVote}
                  onComment={handleComment}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMyProjects = () => (
    <div className="space-y-4">
      {(myProjects?.length || 0) === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">参加プロジェクトがありません</h3>
          <p className="text-gray-400">プロジェクトに参加するか、新しいプロジェクトを提案してみましょう。</p>
        </div>
      ) : (
        myProjects?.map(project => (
          <div key={project.id} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="text-gray-300 mt-1">{project.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {project.status === 'active' ? '進行中' :
                 project.status === 'planning' ? '計画中' : '一時停止'}
              </span>
            </div>
            <ProjectProgressIndicator 
              votes={{
                'strongly-support': 3,
                'support': 2,
                'neutral': 1,
                'oppose': 0,
                'strongly-oppose': 0
              }}
              currentScore={project.impactScore || 75}
              postId={project.id}
              isCompact={true}
            />
          </div>
        ))
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">最近のアクティビティ</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">新しい投稿を作成しました</p>
              <p className="text-xs text-gray-500">2時間前</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">プロジェクトが承認されました</p>
              <p className="text-xs text-gray-500">1日前</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      {/* 固定ヘッダーコンテナ */}
      <div className="sticky top-0 z-50">
        {/* ヘッダー */}
        <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3 text-3xl">💫</span>
                パーソナルステーション
              </h1>
              <p className="text-gray-400 text-sm">
                ようこそ、{currentUser?.name || 'ゲスト'}さん！あなた専用のワークスペースです。
              </p>
            </div>
          </div>
        </header>

        {/* タブナビゲーション */}
        <div className="bg-slate-900 border-b border-gray-700">
          <div className="px-6">
            <div className="flex space-x-8">
              {personalTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'my_posts' && renderMyPosts()}
        {activeTab === 'my_projects' && renderMyProjects()}
        {activeTab === 'activity' && renderActivity()}
      </div>
      
      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

// メニューアイコン取得
const getMenuIcon = (menuKey: string): React.ReactNode => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'personal_station': <Home className="w-5 h-5 text-blue-400" />,
    'department_board': <User className="w-5 h-5 text-blue-400" />,
    'team_dashboard': <BarChart3 className="w-5 h-5 text-blue-400" />,
    'proposal_review': <MessageSquare className="w-5 h-5 text-blue-400" />,
    'committee_tools': <Award className="w-5 h-5 text-blue-400" />,
  };

  return iconMap[menuKey] || <Home className="w-5 h-5 text-blue-400" />;
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