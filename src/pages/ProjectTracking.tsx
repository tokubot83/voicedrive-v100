import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Post, VoteOption } from '../types';
import { ProjectLevel } from '../types/visibility';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { projectPermissionService } from '../services/ProjectPermissionService';
import TrackingPostCard from '../components/tracking/TrackingPostCard';
import TrackingStats from '../components/tracking/TrackingStats';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { Rocket } from 'lucide-react';

export const ProjectTracking: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<'posted' | 'voted' | 'joined'>('posted');
  const [myProjects, setMyProjects] = useState<Post[]>([]);
  const [votedProjects, setVotedProjects] = useState<Post[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Post[]>([]);

  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // データ取得
  useEffect(() => {
    if (activeUser) {
      loadTrackingData();
    }
  }, [activeUser]);

  const loadTrackingData = () => {
    // TODO: 実際のAPI実装
    setMyProjects(getDemoMyProjects());
    setVotedProjects(getDemoVotedProjects());
    setJoinedProjects(getDemoJoinedProjects());
  };

  // プロジェクトレベル取得
  const getProjectLevel = (score: number): ProjectLevel => {
    return projectPermissionService.getProjectLevelFromScore(score);
  };

  // 投稿データの計算
  const getPostData = (post: Post) => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const projectLevel = getProjectLevel(currentScore);
    const permission = activeUser
      ? projectPermissionService.getPermission(activeUser, projectLevel)
      : { canView: true, canApprove: false, canComment: false, canEmergencyOverride: false, canFormTeam: false, role: 'none' as const };

    const totalVotes = post.votes
      ? Object.values(post.votes).reduce((sum, count) => sum + count, 0)
      : 0;
    const supportVotes = post.votes
      ? (post.votes['strongly-support'] || 0) + (post.votes['support'] || 0)
      : 0;
    const supportRate = totalVotes > 0
      ? Math.round((supportVotes / totalVotes) * 100)
      : 0;

    return {
      currentScore,
      agendaLevel: projectLevel, // TrackingPostCardがagendaLevelを期待しているので互換性のため
      permissions: { canView: permission.canView, canVote: true, canComment: permission.canComment },
      totalVotes,
      supportRate
    };
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Rocket className="w-10 h-10" />
          プロジェクトの追跡
        </h1>
        <p className="text-gray-300">
          プロジェクト化モードでの活動状況
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="mx-6 mb-6">
        <TrackingStats
          myPostsCount={myProjects.length}
          votedPostsCount={votedProjects.length}
          commentedPostsCount={joinedProjects.length}
          achievedCount={myProjects.filter(p => getPostData(p).currentScore >= 100).length}
        />
      </div>

      {/* タブナビゲーション */}
      <div className="mx-6 mb-6">
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-2">
          <button
            onClick={() => setActiveTab('posted')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'posted'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            🚀 提案したプロジェクト
          </button>
          <button
            onClick={() => setActiveTab('voted')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'voted'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            🗳️ 投票したプロジェクト
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'joined'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            👥 参加したプロジェクト
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="mx-6 pb-24">
        {activeTab === 'posted' && (
          <div className="space-y-4">
            {myProjects.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-xl text-gray-400">まだプロジェクト提案がありません</p>
                <p className="text-sm text-gray-500 mt-2">トップページから新しいプロジェクトを提案してみましょう</p>
              </div>
            ) : (
              myProjects.map(post => (
                <TrackingPostCard
                  key={post.id}
                  post={post}
                  postData={getPostData(post)}
                  viewType="posted"
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'voted' && (
          <div className="space-y-4">
            {votedProjects.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">🗳️</div>
                <p className="text-xl text-gray-400">まだ投票していません</p>
                <p className="text-sm text-gray-500 mt-2">他の人のプロジェクト提案に投票してみましょう</p>
              </div>
            ) : (
              votedProjects.map(post => (
                <TrackingPostCard
                  key={post.id}
                  post={post}
                  postData={getPostData(post)}
                  viewType="voted"
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'joined' && (
          <div className="space-y-4">
            {joinedProjects.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-xl text-gray-400">まだ参加していません</p>
                <p className="text-sm text-gray-500 mt-2">プロジェクトに参加してみましょう</p>
              </div>
            ) : (
              joinedProjects.map(post => (
                <TrackingPostCard
                  key={post.id}
                  post={post}
                  postData={getPostData(post)}
                  viewType="commented"
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

// デモデータ取得関数
const getDemoMyProjects = (): Post[] => {
  return [
    {
      id: 'demo-my-project-1',
      type: 'improvement',
      proposalType: 'operational',
      content: '新人教育プログラムの体系化とメンター制度の導入',
      author: {
        id: 'user-1',
        name: 'あなた',
        department: '看護部',
        permissionLevel: 3.5
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 12,
        'support': 18,
        'neutral': 3,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    },
    {
      id: 'demo-my-project-2',
      type: 'improvement',
      proposalType: 'communication',
      content: '多職種カンファレンスの定期開催プロジェクト',
      author: {
        id: 'user-1',
        name: 'あなた',
        department: '看護部',
        permissionLevel: 3.5
      },
      anonymityLevel: 'facility_all',
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 25,
        'support': 32,
        'neutral': 5,
        'oppose': 2,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    }
  ];
};

const getDemoVotedProjects = (): Post[] => {
  return [
    {
      id: 'demo-voted-project-1',
      type: 'improvement',
      proposalType: 'operational',
      content: '電子カルテシステムの刷新プロジェクト',
      author: {
        id: 'user-201',
        name: '田中次郎',
        department: '情報システム部',
        permissionLevel: 8
      },
      anonymityLevel: 'facility_all',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 40,
        'support': 55,
        'neutral': 10,
        'oppose': 3,
        'strongly-oppose': 1
      } as Record<VoteOption, number>,
      comments: []
    }
  ];
};

const getDemoJoinedProjects = (): Post[] => {
  return [
    {
      id: 'demo-joined-project-1',
      type: 'improvement',
      proposalType: 'communication',
      content: '患者安全インシデント報告システムの改善プロジェクト',
      author: {
        id: 'user-301',
        name: '佐藤美咲',
        department: '医療安全部',
        permissionLevel: 5
      },
      anonymityLevel: 'facility_department',
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 18,
        'support': 24,
        'neutral': 4,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: [
        {
          id: 'comment-j1',
          postId: 'demo-joined-project-1',
          content: 'インシデント報告の心理的ハードルを下げる工夫が必要ですね。',
          author: {
            id: 'user-1',
            name: 'あなた',
            department: '看護部'
          },
          commentType: 'proposal',
          anonymityLevel: 'facility_department',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          likes: 5
        }
      ]
    }
  ];
};

export default ProjectTracking;
