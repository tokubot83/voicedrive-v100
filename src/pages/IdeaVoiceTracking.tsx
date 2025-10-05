import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Post, VoteOption } from '../types';
import { AgendaLevel } from '../types/committee';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { agendaVisibilityEngine } from '../services/AgendaVisibilityEngine';
import TrackingPostCard from '../components/tracking/TrackingPostCard';
import TrackingStats from '../components/tracking/TrackingStats';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

export const IdeaVoiceTracking: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<'posted' | 'voted' | 'commented'>('posted');
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [votedPosts, setVotedPosts] = useState<Post[]>([]);
  const [commentedPosts, setCommentedPosts] = useState<Post[]>([]);

  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // データ取得
  useEffect(() => {
    if (activeUser) {
      loadTrackingData();
    }
  }, [activeUser]);

  const loadTrackingData = () => {
    // TODO: 実際のAPI実装
    // 仮データ（デモ用）
    setMyPosts(getDemoMyPosts());
    setVotedPosts(getDemoVotedPosts());
    setCommentedPosts(getDemoCommentedPosts());
  };

  // 議題レベル取得
  const getAgendaLevel = (score: number): AgendaLevel => {
    if (score >= 600) return 'CORP_AGENDA';
    if (score >= 300) return 'CORP_REVIEW';
    if (score >= 100) return 'FACILITY_AGENDA';
    if (score >= 50) return 'DEPT_AGENDA';
    if (score >= 30) return 'DEPT_REVIEW';
    return 'PENDING';
  };

  // 投稿データの計算
  const getPostData = (post: Post) => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const agendaLevel = getAgendaLevel(currentScore);
    const permissions = agendaVisibilityEngine.getPermissions(
      post,
      activeUser!,
      currentScore
    );
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
      agendaLevel,
      permissions,
      totalVotes,
      supportRate
    };
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl border border-blue-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">📍</span>
          投稿の追跡
        </h1>
        <p className="text-gray-300">
          議題モードでの活動状況
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="mx-6 mb-6">
        <TrackingStats
          myPostsCount={myPosts.length}
          votedPostsCount={votedPosts.length}
          commentedPostsCount={commentedPosts.length}
          achievedCount={myPosts.filter(p => getPostData(p).agendaLevel !== 'PENDING').length}
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
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            📝 投稿した議題
          </button>
          <button
            onClick={() => setActiveTab('voted')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'voted'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            🗳️ 投票した議題
          </button>
          <button
            onClick={() => setActiveTab('commented')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'commented'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            💬 参加した議題
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="mx-6 pb-24">
        {activeTab === 'posted' && (
          <div className="space-y-4">
            {myPosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl text-gray-400">まだ投稿がありません</p>
                <p className="text-sm text-gray-500 mt-2">トップページから新しい提案を投稿してみましょう</p>
              </div>
            ) : (
              myPosts.map(post => (
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
            {votedPosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">🗳️</div>
                <p className="text-xl text-gray-400">まだ投票していません</p>
                <p className="text-sm text-gray-500 mt-2">他の人の提案に投票してみましょう</p>
              </div>
            ) : (
              votedPosts.map(post => (
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

        {activeTab === 'commented' && (
          <div className="space-y-4">
            {commentedPosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-xl text-gray-400">まだコメントしていません</p>
                <p className="text-sm text-gray-500 mt-2">提案にコメントしてみましょう</p>
              </div>
            ) : (
              commentedPosts.map(post => (
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
const getDemoMyPosts = (): Post[] => {
  // TODO: 実装 - 実際のデータ取得に置き換え
  return [
    {
      id: 'demo-post-1',
      type: 'improvement',
      proposalType: 'operational',
      content: '夜勤の引継ぎ時間を15分延長して、より詳細な患者情報の共有をしたい',
      author: {
        id: 'user-1',
        name: 'あなた',
        department: '看護部',
        permissionLevel: 3
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 8,
        'support': 12,
        'neutral': 2,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    },
    {
      id: 'demo-post-2',
      type: 'improvement',
      proposalType: 'communication',
      content: '部署間の情報共有を円滑にするため、週1回の合同ミーティングを提案',
      author: {
        id: 'user-1',
        name: 'あなた',
        department: '看護部',
        permissionLevel: 3
      },
      anonymityLevel: 'facility_department',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 3,
        'support': 5,
        'neutral': 1,
        'oppose': 0,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    }
  ];
};

const getDemoVotedPosts = (): Post[] => {
  // TODO: 実装 - 実際のデータ取得に置き換え
  return [];
};

const getDemoCommentedPosts = (): Post[] => {
  // TODO: 実装 - 実際のデータ取得に置き換え
  return [];
};

export default IdeaVoiceTracking;
