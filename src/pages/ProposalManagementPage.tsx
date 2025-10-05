import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Post, VoteOption } from '../types';
import { AgendaLevel } from '../types/committee';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { proposalPermissionService, AgendaResponsibility } from '../services/ProposalPermissionService';
import ProposalManagementCard from '../components/proposal/ProposalManagementCard';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { Shield, Filter } from 'lucide-react';
import { AuditService } from '../services/AuditService';

export const ProposalManagementPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [selectedLevel, setSelectedLevel] = useState<AgendaLevel | 'all'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'managed' | 'viewable'>('managed');

  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // ユーザーの管轄レベルと閲覧可能レベルを取得
  const managedLevels = activeUser
    ? proposalPermissionService.getManagedLevels(activeUser)
    : [];
  const viewableLevels = activeUser
    ? proposalPermissionService.getViewableLevels(activeUser)
    : [];

  // データ取得
  useEffect(() => {
    if (activeUser) {
      loadProposals();
    }
  }, [activeUser]);

  const loadProposals = () => {
    // TODO: 実際のAPI実装
    setPosts(getDemoPosts());
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

  // フィルタリングされた投稿
  const filteredPosts = posts.filter(post => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const agendaLevel = getAgendaLevel(currentScore);

    // レベルフィルター
    if (selectedLevel !== 'all' && agendaLevel !== selectedLevel) {
      return false;
    }

    // 権限フィルター
    if (activeUser) {
      const permission = proposalPermissionService.getPermission(activeUser, agendaLevel);

      if (filter === 'managed') {
        return permission.canEdit;
      } else {
        return permission.canView;
      }
    }

    return false;
  });

  // アクションハンドラー
  const handleApprove = (postId: string) => {
    console.log('承認:', postId);
    // TODO: API呼び出し
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'PROPOSAL_APPROVED',
        targetId: postId,
        severity: 'medium'
      });
    }
  };

  const handleReject = (postId: string, reason: string) => {
    console.log('却下:', postId, reason);
    // TODO: API呼び出し
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'PROPOSAL_REJECTED',
        targetId: postId,
        severity: 'medium',
        details: { reason }
      });
    }
  };

  const handleHold = (postId: string, reason: string) => {
    console.log('保留:', postId, reason);
    // TODO: API呼び出し
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'PROPOSAL_HELD',
        targetId: postId,
        severity: 'low',
        details: { reason }
      });
    }
  };

  const handleEmergencyOverride = (postId: string) => {
    console.log('緊急介入:', postId);
    // TODO: API呼び出し
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'EMERGENCY_OVERRIDE',
        targetId: postId,
        severity: 'critical',
        details: { reason: '上位者による緊急介入' }
      });
    }
  };

  // 投稿データの計算
  const getPostData = (post: Post) => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const agendaLevel = getAgendaLevel(currentScore);
    const permission = activeUser
      ? proposalPermissionService.getPermission(activeUser, agendaLevel)
      : proposalPermissionService.getPermission({ id: '', name: '', department: '', permissionLevel: 1 }, agendaLevel);

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
      permission,
      totalVotes,
      supportRate
    };
  };

  if (!activeUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">📋</span>
          投稿管理
        </h1>
        <p className="text-gray-300 mb-4">
          管轄範囲の提案を確認・判断
        </p>

        {/* 権限レベル表示 */}
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300">
            レベル {activeUser.permissionLevel} -
            管轄: {managedLevels.length}レベル、
            閲覧可能: {viewableLevels.length}レベル
          </span>
        </div>
      </div>

      {/* フィルターコントロール */}
      <div className="mx-6 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-white">フィルター</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 権限フィルター */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">表示範囲</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('managed')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'managed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  ✏️ 管轄のみ ({posts.filter(p => {
                    const level = getAgendaLevel(calculateScore(convertVotesToEngagements(p.votes || {}), p.proposalType));
                    const perm = proposalPermissionService.getPermission(activeUser, level);
                    return perm.canEdit;
                  }).length})
                </button>
                <button
                  onClick={() => setFilter('viewable')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'viewable'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  👁️ 全て ({posts.filter(p => {
                    const level = getAgendaLevel(calculateScore(convertVotesToEngagements(p.votes || {}), p.proposalType));
                    const perm = proposalPermissionService.getPermission(activeUser, level);
                    return perm.canView;
                  }).length})
                </button>
              </div>
            </div>

            {/* レベルフィルター */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">議題レベル</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as AgendaLevel | 'all')}
                className="w-full px-4 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのレベル</option>
                {(filter === 'managed' ? managedLevels : viewableLevels).map(level => (
                  <option key={level.agendaLevel} value={level.agendaLevel}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 投稿リスト */}
      <div className="mx-6 pb-24 space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl text-gray-400">
              {filter === 'managed'
                ? '管轄する提案がありません'
                : '閲覧可能な提案がありません'
              }
            </p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const postData = getPostData(post);
            return (
              <ProposalManagementCard
                key={post.id}
                post={post}
                agendaLevel={postData.agendaLevel}
                currentScore={postData.currentScore}
                permission={postData.permission}
                totalVotes={postData.totalVotes}
                supportRate={postData.supportRate}
                onApprove={handleApprove}
                onReject={handleReject}
                onHold={handleHold}
                onEmergencyOverride={handleEmergencyOverride}
              />
            );
          })
        )}
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

// デモデータ取得関数
const getDemoPosts = (): Post[] => {
  return [
    {
      id: 'demo-proposal-1',
      type: 'improvement',
      proposalType: 'operational',
      content: '夜勤の引継ぎ時間を15分延長して、より詳細な患者情報の共有をしたい',
      author: {
        id: 'user-101',
        name: '山田花子',
        department: '看護部',
        permissionLevel: 3
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 12,
        'support': 18,
        'neutral': 3,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: [
        {
          id: 'comment-1',
          postId: 'demo-proposal-1',
          content: '賛成です。安全性向上につながると思います。',
          author: {
            id: 'user-102',
            name: '佐藤太郎',
            department: '看護部'
          },
          commentType: 'support',
          anonymityLevel: 'department_only',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          likes: 5
        }
      ]
    },
    {
      id: 'demo-proposal-2',
      type: 'improvement',
      proposalType: 'communication',
      content: '部署間の情報共有を円滑にするため、週1回の合同ミーティングを提案',
      author: {
        id: 'user-103',
        name: '鈴木一郎',
        department: '医療安全部',
        permissionLevel: 4
      },
      anonymityLevel: 'facility_department',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 5,
        'support': 8,
        'neutral': 2,
        'oppose': 0,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    }
  ];
};

export default ProposalManagementPage;
