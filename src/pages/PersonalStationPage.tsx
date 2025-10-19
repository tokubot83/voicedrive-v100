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
import EnhancedPost from '../components/EnhancedPost';
import { posts } from '../data/demo/posts';
import { Card } from '../components/ui/Card';
import { Home, User, MessageSquare, TrendingUp, Shield, BarChart3, Award, UserCheck } from 'lucide-react';
import { PostType, VoteOption, Comment } from '../types';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

// Phase 7: モバイルスワイプナビゲーション
import { useSwipeableTabs } from '../hooks/useSwipeableTabs';
import { SwipeIndicator } from '../components/common/SwipeableTabContainer';

// Phase 2: 追跡機能統合
import { agendaLevelEngine } from '../systems/agenda/engines/AgendaLevelEngine';
import { projectLevelEngine } from '../systems/project/engines/ProjectLevelEngine';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';

export const PersonalStationPage: React.FC = () => {
  const { user } = useAuth();
  const { currentUser } = useDemoMode();
  const { userPermissionLevel, hasPermission } = usePermissions();
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

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

  const [activeTab, setActiveTab] = useState('dashboard');

  // Phase 7: スワイプナビゲーション
  const { handlers: swipeHandlers } = useSwipeableTabs({
    activeTab,
    tabs: ['dashboard', 'my_posts', 'voting_history'] as const,
    onTabChange: (tab) => setActiveTab(tab as typeof activeTab),
  });

  // 自分の投稿をフィルタリング（安全なチェック）
  const myPosts = posts?.filter(post => post.authorId === user?.id) || [];

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
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'my_posts', label: 'マイポスト', icon: MessageSquare },
    { id: 'voting_history', label: '投票履歴', icon: TrendingUp }
  ];

  const renderDashboard = () => (
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

      {/* Level 99専用：システム運用アクセス */}
      {permission.calculatedLevel >= 99 && (
        <div className="bg-gradient-to-br from-red-900/30 to-purple-900/30 rounded-xl p-6 backdrop-blur border-2 border-red-500/50 shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  システム管理者専用
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                    Level 99
                  </span>
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  全システム機能へのアクセス権限があります
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* システム運用ボタン */}
            <button
              onClick={() => window.location.href = '/admin/system-operations'}
              className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔧</span>
                  <div className="text-left">
                    <div className="font-bold text-lg">システム運用</div>
                    <div className="text-xs opacity-90">全システム管理機能</div>
                  </div>
                </div>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* サイドバーメニュー管理ボタン */}
            <button
              onClick={() => window.location.href = '/admin/sidebar-menu-management'}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎛️</span>
                  <div className="text-left">
                    <div className="font-bold text-lg">メニュー管理</div>
                    <div className="text-xs opacity-90">サイドバー設定</div>
                  </div>
                </div>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* 注意事項 */}
          <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
            <p className="text-xs text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>システム管理機能は慎重に使用してください。変更内容は全ユーザーに影響します。</span>
            </p>
          </div>
        </div>
      )}

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

      {/* Phase 2: 議題モード投稿追跡 */}
      {(() => {
        const myAgendaPosts = myPosts.filter(p => p.type === 'improvement');
        if (myAgendaPosts.length === 0) return null;

        const postsByLevel = myAgendaPosts.reduce((acc, post) => {
          const score = calculateScore(
            convertVotesToEngagements(post.votes || {}),
            post.proposalType
          );
          const level = agendaLevelEngine.getAgendaLevel(score);
          if (!acc[level]) acc[level] = [];
          acc[level].push({ post, score });
          return acc;
        }, {} as Record<string, { post: any; score: number }[]>);

        const levelConfig = {
          'PENDING': { emoji: '💭', label: '検討中', color: 'gray', gradient: 'from-gray-600 to-gray-700' },
          'DEPT_REVIEW': { emoji: '📋', label: '部署検討', color: 'yellow', gradient: 'from-yellow-600 to-yellow-700' },
          'DEPT_AGENDA': { emoji: '👥', label: '部署議題', color: 'blue', gradient: 'from-blue-600 to-blue-700' },
          'FACILITY_AGENDA': { emoji: '🏥', label: '施設議題', color: 'green', gradient: 'from-green-600 to-green-700' },
          'CORP_REVIEW': { emoji: '🏢', label: '法人検討', color: 'purple', gradient: 'from-purple-600 to-purple-700' },
          'CORP_AGENDA': { emoji: '🏛️', label: '法人議題', color: 'pink', gradient: 'from-pink-600 to-pink-700' }
        };

        return (
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              議題モード投稿追跡
              <span className="ml-auto text-sm font-normal text-gray-400">
                {myAgendaPosts.length}件進行中
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(levelConfig).map(([level, config]) => {
                const levelPosts = postsByLevel[level] || [];
                if (levelPosts.length === 0) return null;

                return (
                  <div
                    key={level}
                    className={`bg-gradient-to-br ${config.gradient} rounded-lg p-4 border border-${config.color}-500/30`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.emoji}</span>
                        <div>
                          <div className="font-bold text-white">{config.label}</div>
                          <div className="text-xs text-white/70">{levelPosts.length}件</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {levelPosts.slice(0, 3).map(({ post, score }) => (
                        <div key={post.id} className="bg-black/20 rounded p-2 text-sm">
                          <div className="text-white/90 line-clamp-1">{post.content}</div>
                          <div className="text-xs text-white/60 mt-1">{Math.round(score)}点</div>
                        </div>
                      ))}
                      {levelPosts.length > 3 && (
                        <div className="text-xs text-white/60 text-center pt-1">
                          他{levelPosts.length - 3}件...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Phase 2: プロジェクトモード追跡 */}
      {(() => {
        const myProjects = myPosts.filter(p => p.type !== 'improvement' || p.projectStatus);
        if (myProjects.length === 0) return null;

        const projectsByLevel = myProjects.reduce((acc, post) => {
          const score = calculateScore(
            convertVotesToEngagements(post.votes || {}),
            post.proposalType
          );
          const level = projectLevelEngine.getProjectLevel(score);
          if (!acc[level]) acc[level] = [];
          acc[level].push({ post, score });
          return acc;
        }, {} as Record<string, { post: any; score: number }[]>);

        const projectLevelConfig = {
          'TEAM': { emoji: '👥', label: 'チーム', color: 'blue', gradient: 'from-blue-600 to-blue-700' },
          'DEPARTMENT': { emoji: '🏢', label: '部署', color: 'purple', gradient: 'from-purple-600 to-purple-700' },
          'FACILITY': { emoji: '🏥', label: '施設', color: 'green', gradient: 'from-green-600 to-green-700' },
          'CORPORATION': { emoji: '🏛️', label: '法人', color: 'pink', gradient: 'from-pink-600 to-pink-700' }
        };

        return (
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              プロジェクトモード追跡
              <span className="ml-auto text-sm font-normal text-gray-400">
                {myProjects.length}件進行中
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(projectLevelConfig).map(([level, config]) => {
                const levelProjects = projectsByLevel[level] || [];
                if (levelProjects.length === 0) return null;

                return (
                  <div
                    key={level}
                    className={`bg-gradient-to-br ${config.gradient} rounded-lg p-4 border border-${config.color}-500/30`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.emoji}</span>
                        <div>
                          <div className="font-bold text-white">{config.label}</div>
                          <div className="text-xs text-white/70">{levelProjects.length}件</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {levelProjects.slice(0, 3).map(({ post, score }) => (
                        <div key={post.id} className="bg-black/20 rounded p-2 text-sm">
                          <div className="text-white/90 line-clamp-1">{post.content}</div>
                          <div className="text-xs text-white/60 mt-1">{Math.round(score)}点</div>
                        </div>
                      ))}
                      {levelProjects.length > 3 && (
                        <div className="text-xs text-white/60 text-center pt-1">
                          他{levelProjects.length - 3}件...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

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

      {/* 最近の投票活動 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🗳️</span>
          カテゴリ別投票実績
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-600/10 p-4 rounded-lg border border-blue-500/30">
            <h3 className="text-white font-medium mb-2">🏥 業務改善</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">投票数</span>
              <span className="text-blue-400">23回</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">影響力: 中〜高</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-600/10 p-4 rounded-lg border border-yellow-500/30">
            <h3 className="text-white font-medium mb-2">👥 コミュニケーション</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">投票数</span>
              <span className="text-yellow-400">15回</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">影響力: 標準</div>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-600/10 p-4 rounded-lg border border-purple-500/30">
            <h3 className="text-white font-medium mb-2">💡 イノベーション</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">投票数</span>
              <span className="text-purple-400">8回</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">影響力: やや高</div>
          </div>
          <div className="bg-gradient-to-r from-orange-600/20 to-orange-600/10 p-4 rounded-lg border border-orange-500/30">
            <h3 className="text-white font-medium mb-2">🎯 戦略提案</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">投票数</span>
              <span className="text-orange-400">5回</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">影響力: レベルに応じて変動</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyPosts = () => {
    // 議題モードとプロジェクト化モードで投稿を分類
    const agendaPosts = myPosts.filter(p => p.type === 'improvement');
    const projectPosts = myPosts.filter(p => p.type !== 'improvement');

    if ((myPosts?.length || 0) === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">投稿がありません</h3>
          <p className="text-gray-400">最初の投稿を作成してみましょう。</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 議題モードの投稿 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📍</span>
            議題モードの投稿
            <span className="text-sm text-gray-400 ml-2">({agendaPosts.length}件)</span>
          </h2>
          {agendaPosts.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-6 text-center backdrop-blur border border-gray-700/50">
              <p className="text-gray-400 text-sm">議題モードの投稿はまだありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendaPosts.map(post => (
                <EnhancedPost
                  key={post.id}
                  post={post}
                  currentUser={currentUser || user}
                  onVote={handleVote}
                  onComment={handleComment}
                />
              ))}
            </div>
          )}
        </div>

        {/* プロジェクト化モードの投稿 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            プロジェクト化モードの投稿
            <span className="text-sm text-gray-400 ml-2">({projectPosts.length}件)</span>
          </h2>
          {projectPosts.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-6 text-center backdrop-blur border border-gray-700/50">
              <p className="text-gray-400 text-sm">プロジェクト化モードの投稿はまだありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projectPosts.map(post => (
                <EnhancedPost
                  key={post.id}
                  post={post}
                  currentUser={currentUser || user}
                  onVote={handleVote}
                  onComment={handleComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

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

  const renderVotingHistory = () => {
    // 投票済み投稿を取得
    const votedPosts = posts.filter(p => p.hasUserVoted || p.userVote);

    // 議題モードとプロジェクト化モードで分類
    const agendaVotes = votedPosts.filter(p => p.type === 'improvement');
    const projectVotes = votedPosts.filter(p => p.type !== 'improvement');

    // 投票種類の表示情報
    const getVoteLabel = (voteType: VoteOption) => {
      const labels = {
        'strongly-support': { emoji: '😍', label: '強く賛成', color: 'blue' },
        'support': { emoji: '😊', label: '賛成', color: 'green' },
        'neutral': { emoji: '😐', label: '中立', color: 'gray' },
        'oppose': { emoji: '😕', label: '反対', color: 'orange' },
        'strongly-oppose': { emoji: '😠', label: '強く反対', color: 'red' }
      };
      return labels[voteType] || labels['neutral'];
    };

    if (votedPosts.length === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur border border-gray-700/50">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">投票履歴がありません</h3>
          <p className="text-gray-400">投稿に投票すると、ここに履歴が表示されます。</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 議題モードの投票履歴 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📍</span>
            議題モードの投票
            <span className="text-sm text-gray-400 ml-2">({agendaVotes.length}件)</span>
          </h2>
          {agendaVotes.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-6 text-center backdrop-blur border border-gray-700/50">
              <p className="text-gray-400 text-sm">議題モードの投票はまだありません</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="space-y-3">
                {agendaVotes.map(post => {
                  const voteInfo = getVoteLabel(post.userVote!);
                  return (
                    <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="text-xl">{voteInfo.emoji}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200">
                          「{post.title}」に{voteInfo.label}票を投じました
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs bg-${voteInfo.color}-500/20 text-${voteInfo.color}-400 px-2 py-0.5 rounded`}>
                            {post.category || '業務改善'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* プロジェクト化モードの投票履歴 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            プロジェクト化モードの投票
            <span className="text-sm text-gray-400 ml-2">({projectVotes.length}件)</span>
          </h2>
          {projectVotes.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-6 text-center backdrop-blur border border-gray-700/50">
              <p className="text-gray-400 text-sm">プロジェクト化モードの投票はまだありません</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="space-y-3">
                {projectVotes.map(post => {
                  const voteInfo = getVoteLabel(post.userVote!);
                  return (
                    <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="text-xl">{voteInfo.emoji}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200">
                          「{post.title}」に{voteInfo.label}票を投じました
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs bg-${voteInfo.color}-500/20 text-${voteInfo.color}-400 px-2 py-0.5 rounded`}>
                            {post.category || 'プロジェクト'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 統計サマリー */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            投票統計
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">総投票数</span>
              <span className="text-lg font-semibold text-white">{votedPosts.length}回</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">議題モード</span>
              <span className="text-lg font-semibold text-emerald-400">{agendaVotes.length}回</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">プロジェクト化モード</span>
              <span className="text-lg font-semibold text-blue-400">{projectVotes.length}回</span>
            </div>
          </div>
        </div>
      </div>
    );
  };


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

      {/* Phase 7-C: スワイプインジケーター（モバイルのみ表示） */}
      <div className="lg:hidden">
        <SwipeIndicator
          tabs={personalTabs.map(tab => ({ ...tab, content: null }))}
          activeTab={activeTab}
        />
      </div>

      {/* コンテンツ - Phase 7: スワイプ対応 */}
      <div className="p-6" {...swipeHandlers}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'my_posts' && renderMyPosts()}
        {activeTab === 'voting_history' && renderVotingHistory()}
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