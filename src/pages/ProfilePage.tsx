import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MedicalProfile } from '../types/profile';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import Timeline from '../components/Timeline';
import PhotoAvatar from '../components/common/PhotoAvatar';
import { generatePersonalAvatar } from '../utils/avatarGenerator';
import { User, Award, Activity, FileText, TrendingUp, Settings, Lock, Users, Target } from 'lucide-react';
import { systemModeManager, SystemMode } from '../config/systemMode';
import { projectModeAnalytics } from '../systems/project/analytics/ProjectModeAnalytics';
import { demoPosts } from '../data/demo/posts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAgendaStats } from '../hooks/useAgendaStats';
import { useVoteStats } from '../hooks/useVoteStats';

const ProfilePage: React.FC = () => {
  const { currentUser } = useDemoMode();
  const [activeTab, setActiveTab] = useState<'stats' | 'posts' | 'votes' | 'settings'>('stats');
  const [systemMode, setSystemMode] = useState<SystemMode>(systemModeManager.getCurrentMode());

  // ユーザープロフィールと統計情報を取得
  const { profile: userProfile, stats: userStats, loading: profileLoading } = useUserProfile(currentUser.id);

  // 議題統計を取得
  const { stats: agendaStatsData, departmentAverage, loading: agendaStatsLoading } = useAgendaStats(currentUser.id);

  // 投票統計を取得
  const { stats: voteStatsData, voteTendencyLabel, departmentTendency, loading: voteStatsLoading } = useVoteStats(currentUser.id);

  // モード変更を監視
  useEffect(() => {
    const handleModeChange = (newMode: SystemMode) => {
      console.log('[ProfilePage] モード変更検出:', newMode);
      setSystemMode(newMode);
    };

    systemModeManager.addModeChangeListener(handleModeChange);

    return () => {
      systemModeManager.removeModeChangeListener(handleModeChange);
    };
  }, []);

  // Create medical profile from current user data + API data
  const profile: MedicalProfile = {
    id: currentUser.id,
    employeeNumber: 'EMP-2024-' + currentUser.id.slice(-3),
    name: currentUser.name,
    furigana: 'ふりがな',
    facility: 'kohara_hospital',
    department: currentUser.department || 'rehabilitation_ward',
    profession: 'physical_therapist',
    position: currentUser.position || 'member',
    hireDate: '2018-04-01',
    // 医療システムAPIから取得した経験年数を使用（取得中の場合はデフォルト値）
    experienceYears: userStats?.experienceYears ?? 6,
    previousExperience: userStats?.previousExperience ?? 3,
    totalExperience: userStats?.totalExperience ?? 9,
    // UserProfileから取得（存在しない場合はデフォルト値）
    motto: userProfile?.motto ?? '患者さまの笑顔が私の原動力',
    selfIntroduction: userProfile?.selfIntroduction ?? '理学療法士として9年間、患者さまの機能回復をサポートしてきました。',
    hobbies: userProfile?.hobbies ? JSON.parse(userProfile.hobbies) : ['running', 'reading', 'cooking'],
    // 医療システムAPIから取得したスキル情報を使用
    skills: userStats?.skills && userStats.skills.length > 0 ? userStats.skills : ['脳血管リハビリ', 'チーム医療', '患者指導'],
    profileImage: currentUser.avatar,
    coverImage: userProfile?.coverImage ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    votingWeight: 2.5 + (currentUser.permissionLevel || 1) * 0.5,
    permissionLevel: currentUser.permissionLevel || PermissionLevel.LEVEL_1,
    approvalAuthority: currentUser.permissionLevel >= 3 ? 'medium' : 'none',
    createdAt: userProfile?.createdAt ?? '2024-01-01T00:00:00Z',
    updatedAt: userProfile?.updatedAt ?? '2024-06-01T00:00:00Z',
    lastProfileUpdate: userProfile?.lastProfileUpdate ?? '2024-06-01T00:00:00Z',
    profileCompleteRate: userProfile?.profileCompleteRate ?? 85
  };

  // Generate avatar for current user
  const avatarData = generatePersonalAvatar(currentUser);

  // プロジェクトモード用の統計データを取得
  const userPosts = demoPosts.filter(post => post.author.id === currentUser.id);
  const projectAnalytics = projectModeAnalytics.getOverallAnalytics(userPosts);

  // 議題モード用の統計データ（APIから取得またはデフォルト値）
  const agendaStats = {
    totalPosts: userStats?.postsCount ?? 24,
    improvementPosts: 15,  // TODO: カテゴリ別集計実装時に更新
    communityPosts: 6,
    reportPosts: 3,
    totalLikes: 156,
    totalComments: 89,
    submittedAgendas: agendaStatsData?.submittedAgendas ?? 0,
    adoptedAgendas: agendaStatsData?.adoptedAgendas ?? 0,
    rejectedAgendas: agendaStatsData?.rejectedAgendas ?? 0,
    pendingAgendas: agendaStatsData?.pendingAgendas ?? 0,
    implementingAgendas: agendaStatsData?.implementingAgendas ?? 0,
    completedAgendas: agendaStatsData?.completedAgendas ?? 0,
    committeeScore: agendaStatsData?.committeeScore ?? 0,
    adoptionRate: agendaStatsData?.adoptionRate ?? 0,
    implementationRate: agendaStatsData?.implementationRate ?? 0,
  };

  // プロジェクトモード用の統計データ
  const projectStats = {
    totalPosts: userPosts.length,
    totalProjects: projectAnalytics.totalProjects,
    activeProjects: projectAnalytics.activeProjects,
    completedProjects: projectAnalytics.completedProjects,
    projectCompletionRate: projectAnalytics.projectCompletionRate,
    collaborationScore: projectAnalytics.collaborationScore,
    crossDepartmentProjects: projectAnalytics.crossDepartmentProjects,
    averageTeamSize: projectAnalytics.averageTeamSize,
    totalLikes: 156,
    totalComments: 89,
  };

  // 現在のモードに応じた統計データを選択
  const stats = systemMode === SystemMode.PROJECT ? projectStats : agendaStats;

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div 
        className="h-48 relative"
        style={{ background: profile.coverImage }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Profile Header */}
      <div className="px-6 pb-6 -mt-16 relative">
        <div className="flex items-end gap-6">
          <div className="relative">
            <PhotoAvatar
              name={currentUser.name}
              profilePhotoUrl={currentUser.profilePhotoUrl}
              fallbackAvatarData={avatarData}
              size="xl"
              className="border-4 border-slate-800 shadow-2xl"
            />
            {/* オンライン状態インジケーター */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
            <p className="text-gray-400 mt-1">{profile.position} • {profile.department}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                Lv.{profile.permissionLevel}
              </span>
              <span className="text-gray-400">
                投票力: {profile.votingWeight.toFixed(1)}
              </span>
              <span className="text-gray-400">
                {profileLoading ? (
                  '経験年数: 取得中...'
                ) : (
                  `経験年数: ${profile.experienceYears}年 (総: ${profile.totalExperience}年)`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'stats'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            活動統計
            {activeTab === 'stats' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'posts'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            投稿履歴
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('votes')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'votes'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            投票履歴
            {activeTab === 'votes' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'settings'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            設定
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {/* プライバシー通知 */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium">プライベートページ</p>
              <p className="text-gray-400 text-sm mt-1">
                このページの内容はあなたにのみ表示されます。他のユーザーには公開されません。
              </p>
            </div>
          </div>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              活動統計
            </h2>

            {/* Post Stats - 共通表示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <p className="text-gray-400 text-sm">総投稿数</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalPosts}</p>
                <p className="text-xs text-gray-500 mt-1">全期間</p>
              </div>
              {systemMode === SystemMode.AGENDA && (
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                  <p className="text-gray-400 text-sm">改善提案</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{agendaStats.improvementPosts}</p>
                  <p className="text-xs text-gray-500 mt-1">全体の{Math.round(agendaStats.improvementPosts / agendaStats.totalPosts * 100)}%</p>
                </div>
              )}
              {systemMode === SystemMode.PROJECT && (
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                  <p className="text-gray-400 text-sm">プロジェクト数</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{projectStats.totalProjects}</p>
                  <p className="text-xs text-gray-500 mt-1">提案したプロジェクト</p>
                </div>
              )}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <p className="text-gray-400 text-sm">総いいね数</p>
                <p className="text-3xl font-bold text-pink-400 mt-2">{stats.totalLikes}</p>
                <p className="text-xs text-gray-500 mt-1">平均 {stats.totalPosts > 0 ? Math.round(stats.totalLikes / stats.totalPosts) : 0}/投稿</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <p className="text-gray-400 text-sm">総コメント数</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.totalComments}</p>
                <p className="text-xs text-gray-500 mt-1">平均 {stats.totalPosts > 0 ? Math.round(stats.totalComments / stats.totalPosts) : 0}/投稿</p>
              </div>
            </div>

            {/* 議題モード専用統計 */}
            {systemMode === SystemMode.AGENDA && (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">議題提出・採択状況</h3>

                {/* 議題提出実績 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">議題として提出</p>
                      <p className="text-2xl font-bold text-blue-400 mt-1">{agendaStats.submittedAgendas}</p>
                      <p className="text-xs text-gray-500 mt-1">100点到達した提案</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">委員会で採択</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">{agendaStats.adoptedAgendas}</p>
                      <p className="text-xs text-gray-500 mt-1">採択率 {agendaStats.submittedAgendas > 0 ? Math.round(agendaStats.adoptedAgendas / agendaStats.submittedAgendas * 100) : 0}%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>

                {/* 改善活動状況 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">実施中の改善活動</p>
                      <p className="text-2xl font-bold text-yellow-400 mt-1">{agendaStats.implementingAgendas}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">完了した改善活動</p>
                      <p className="text-2xl font-bold text-purple-400 mt-1">{agendaStats.completedAgendas}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* 委員会貢献度スコア */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-300 text-sm">委員会貢献度スコア</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {agendaStatsLoading ? (
                          <span className="text-xl">計算中...</span>
                        ) : (
                          <>{agendaStats.committeeScore}<span className="text-lg text-gray-400">/100</span></>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">組織改善への貢献を</p>
                      <p className="text-xs text-gray-400">総合的に評価</p>
                    </div>
                  </div>

                  {/* 部署平均との比較 */}
                  {departmentAverage && !agendaStatsLoading && (
                    <div className="pt-3 border-t border-blue-500/20">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-400">部署平均スコア</p>
                          <p className="text-sm font-bold text-blue-300 mt-1">{departmentAverage.averageCommitteeScore}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">部署採択率</p>
                          <p className="text-sm font-bold text-green-300 mt-1">{departmentAverage.averageAdoptionRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">部署実施率</p>
                          <p className="text-sm font-bold text-purple-300 mt-1">{departmentAverage.averageImplementationRate}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 詳細メトリクス */}
                {agendaStatsData && !agendaStatsLoading && agendaStatsData.committeeBreakdown.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">委員会別実績</h4>
                    <div className="space-y-2">
                      {agendaStatsData.committeeBreakdown.map((committee, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {committee.committeeType} ({committee.committeeLevel})
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">提出 {committee.submittedCount}</span>
                            <span className="text-green-400">採択 {committee.adoptedCount}</span>
                            <span className="text-blue-400">{committee.adoptionRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* プロジェクトモード専用統計 */}
            {systemMode === SystemMode.PROJECT && (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">プロジェクト実績</h3>

                {/* プロジェクト基本統計 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">進行中のプロジェクト</p>
                      <p className="text-2xl font-bold text-blue-400 mt-1">{projectStats.activeProjects}</p>
                      <p className="text-xs text-gray-500 mt-1">実行中のプロジェクト</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">完了したプロジェクト</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">{projectStats.completedProjects}</p>
                      <p className="text-xs text-gray-500 mt-1">完了率 {projectStats.projectCompletionRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>

                {/* 協働実績 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">部署横断プロジェクト</p>
                      <p className="text-2xl font-bold text-yellow-400 mt-1">{projectStats.crossDepartmentProjects}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">平均チーム規模</p>
                      <p className="text-2xl font-bold text-purple-400 mt-1">{projectStats.averageTeamSize}人</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* 協働スコア */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">協働スコア</p>
                      <p className="text-3xl font-bold text-white mt-1">{projectStats.collaborationScore}<span className="text-lg text-gray-400">/100</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">部署横断・施設横断</p>
                      <p className="text-xs text-gray-400">プロジェクトへの参加度</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Chart Placeholder */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">月別活動推移</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>活動推移グラフ（実装予定）</p>
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                投稿履歴
              </h2>
              <p className="text-gray-400 mt-1">あなたの実名投稿と匿名投稿の履歴</p>
            </div>

            {/* 匿名投稿の説明 */}
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-medium">匿名投稿について</p>
                  <p className="text-gray-400 text-sm mt-1">
                    🔒マークの投稿は匿名で行ったものです。あなただけがこの履歴を見ることができ、他のユーザーには投稿者が特定されません。
                  </p>
                </div>
              </div>
            </div>

            <Timeline activeTab="all" filterByUser={currentUser.id} />
          </div>
        )}

        {/* Votes Tab */}
        {activeTab === 'votes' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                投票履歴
              </h2>
              <p className="text-gray-400 mt-1">あなたが投票した議題の一覧と投票傾向</p>
            </div>

            {voteStatsLoading ? (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-12 border border-slate-700/50 text-center">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-400">投票統計を読み込み中...</p>
              </div>
            ) : voteStatsData && voteStatsData.totalVotes > 0 ? (
              <>
                {/* 投票サマリー */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                    <p className="text-gray-400 text-sm">総投票数</p>
                    <p className="text-3xl font-bold text-white mt-2">{voteStatsData.totalVotes}</p>
                    <p className="text-xs text-gray-500 mt-1">平均 {voteStatsData.votingFrequency} 票/日</p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                    <p className="text-gray-400 text-sm">投票傾向</p>
                    <p className="text-2xl font-bold text-blue-400 mt-2">{voteTendencyLabel}</p>
                    <p className="text-xs text-gray-500 mt-1">スコア: {voteStatsData.voteTendencyScore > 0 ? '+' : ''}{voteStatsData.voteTendencyScore}</p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                    <p className="text-gray-400 text-sm">最も投票が多いカテゴリ</p>
                    <p className="text-xl font-bold text-purple-400 mt-2">{voteStatsData.mostActiveCategory || 'なし'}</p>
                    <p className="text-xs text-gray-500 mt-1">平均重み: {voteStatsData.averageVoteWeight.toFixed(1)}</p>
                  </div>
                </div>

                {/* 投票オプション別分布 */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold mb-4">投票オプション別分布</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">強く賛成</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${(voteStatsData.voteDistribution.stronglySupport / voteStatsData.totalVotes) * 100}%` }}
                          />
                        </div>
                        <span className="text-green-400 font-bold w-12 text-right">{voteStatsData.voteDistribution.stronglySupport}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">賛成</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(voteStatsData.voteDistribution.support / voteStatsData.totalVotes) * 100}%` }}
                          />
                        </div>
                        <span className="text-blue-400 font-bold w-12 text-right">{voteStatsData.voteDistribution.support}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">中立</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gray-500 h-2 rounded-full transition-all"
                            style={{ width: `${(voteStatsData.voteDistribution.neutral / voteStatsData.totalVotes) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-400 font-bold w-12 text-right">{voteStatsData.voteDistribution.neutral}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">反対</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${(voteStatsData.voteDistribution.oppose / voteStatsData.totalVotes) * 100}%` }}
                          />
                        </div>
                        <span className="text-orange-400 font-bold w-12 text-right">{voteStatsData.voteDistribution.oppose}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">強く反対</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${(voteStatsData.voteDistribution.stronglyOppose / voteStatsData.totalVotes) * 100}%` }}
                          />
                        </div>
                        <span className="text-red-400 font-bold w-12 text-right">{voteStatsData.voteDistribution.stronglyOppose}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 部署平均との比較 */}
                {departmentTendency && (
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30">
                    <h3 className="text-lg font-semibold mb-4">部署平均との比較</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">部署平均傾向</p>
                        <p className="text-xl font-bold text-blue-300 mt-2">{departmentTendency.tendencyLabel}</p>
                        <p className="text-xs text-gray-500 mt-1">スコア: {departmentTendency.averageTendencyScore > 0 ? '+' : ''}{departmentTendency.averageTendencyScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">部署総投票数</p>
                        <p className="text-xl font-bold text-green-300 mt-2">{departmentTendency.totalVotes}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">部署平均投票数</p>
                        <p className="text-xl font-bold text-purple-300 mt-2">{departmentTendency.averageVotesPerUser}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* カテゴリ別投票実績 */}
                {voteStatsData.categoryBreakdown.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4">カテゴリ別投票実績</h3>
                    <div className="space-y-3">
                      {voteStatsData.categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-gray-300">{category.category}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">{category.voteCount}票</span>
                            <span className={`text-sm font-semibold ${
                              category.averageTendency > 30 ? 'text-green-400' :
                              category.averageTendency < -30 ? 'text-red-400' :
                              'text-gray-400'
                            }`}>
                              {category.averageTendency > 0 ? '+' : ''}{category.averageTendency}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 最近の投票 */}
                {voteStatsData.recentVotes.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4">最近の投票（直近10件）</h3>
                    <div className="space-y-2">
                      {voteStatsData.recentVotes.map((vote, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              vote.voteOption === 'strongly-support' ? 'bg-green-500/20 text-green-400' :
                              vote.voteOption === 'support' ? 'bg-blue-500/20 text-blue-400' :
                              vote.voteOption === 'neutral' ? 'bg-gray-500/20 text-gray-400' :
                              vote.voteOption === 'oppose' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {vote.voteOption === 'strongly-support' ? '強く賛成' :
                               vote.voteOption === 'support' ? '賛成' :
                               vote.voteOption === 'neutral' ? '中立' :
                               vote.voteOption === 'oppose' ? '反対' : '強く反対'}
                            </span>
                            <span className="text-gray-400">{vote.postCategory || 'その他'}</span>
                          </div>
                          <span className="text-gray-500 text-xs">
                            {new Date(vote.votedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-12 border border-slate-700/50 text-center">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">まだ投票がありません</h3>
                <p className="text-gray-500">
                  議題に投票すると、ここに履歴が表示されます
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                設定
              </h2>
              <p className="text-gray-400 mt-1">プロフィールとプライバシー設定</p>
            </div>

            {/* プロフィール公開設定 */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                プロフィール公開設定
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="privacy-private"
                    name="privacy"
                    defaultChecked
                    className="mt-1"
                  />
                  <label htmlFor="privacy-private" className="flex-1 cursor-pointer">
                    <p className="text-white font-medium">非公開（推奨）</p>
                    <p className="text-gray-400 text-sm mt-1">
                      プロフィール情報は自分だけが閲覧できます。投稿時の匿名性が最大限保護されます。
                    </p>
                  </label>
                </div>
                <div className="flex items-start gap-3 opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    id="privacy-department"
                    name="privacy"
                    disabled
                    className="mt-1"
                  />
                  <label htmlFor="privacy-department" className="flex-1">
                    <p className="text-white font-medium">同じ部署のみ公開（準備中）</p>
                    <p className="text-gray-400 text-sm mt-1">
                      同じ部署のメンバーにのみプロフィールが表示されます。
                    </p>
                  </label>
                </div>
                <div className="flex items-start gap-3 opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    id="privacy-all"
                    name="privacy"
                    disabled
                    className="mt-1"
                  />
                  <label htmlFor="privacy-all" className="flex-1">
                    <p className="text-white font-medium">全体公開（準備中）</p>
                    <p className="text-gray-400 text-sm mt-1">
                      すべてのユーザーにプロフィールが表示されます。
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
