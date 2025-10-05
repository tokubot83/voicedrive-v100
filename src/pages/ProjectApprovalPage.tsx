import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Post, VoteOption } from '../types';
import { ProjectLevel } from '../types/visibility';
import { ProjectScale, getProjectScale } from '../types/project';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { projectPermissionService, ProjectResponsibility } from '../services/ProjectPermissionService';
import ProjectApprovalCard from '../components/project/ProjectApprovalCard';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { Shield, Filter, Rocket } from 'lucide-react';
import { AuditService } from '../services/AuditService';

export const ProjectApprovalPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [selectedLevel, setSelectedLevel] = useState<ProjectLevel | 'all'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'approvable' | 'viewable'>('approvable');

  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // ユーザーの承認可能レベルと閲覧可能レベルを取得
  const approvableLevels = activeUser
    ? projectPermissionService.getApprovableLevels(activeUser)
    : [];
  const viewableLevels = activeUser
    ? projectPermissionService.getViewableLevels(activeUser)
    : [];

  // データ取得
  useEffect(() => {
    if (activeUser) {
      loadProjects();
    }
  }, [activeUser]);

  const loadProjects = () => {
    // TODO: 実際のAPI実装
    setPosts(getDemoPosts());
  };

  // プロジェクトレベル取得
  const getProjectLevel = (score: number): ProjectLevel => {
    return projectPermissionService.getProjectLevelFromScore(score);
  };

  // フィルタリングされた投稿
  const filteredPosts = posts.filter(post => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const projectLevel = getProjectLevel(currentScore);

    // レベルフィルター
    if (selectedLevel !== 'all' && projectLevel !== selectedLevel) {
      return false;
    }

    // 権限フィルター
    if (activeUser) {
      const permission = projectPermissionService.getPermission(activeUser, projectLevel);

      if (filter === 'approvable') {
        return permission.canApprove;
      } else {
        return permission.canView;
      }
    }

    return false;
  });

  // アクションハンドラー
  const handleApprove = (postId: string) => {
    console.log('プロジェクト開始承認:', postId);
    // TODO: API呼び出し
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'PROJECT_APPROVED',
        targetId: postId,
        severity: 'high',
        details: { action: 'プロジェクト開始承認' }
      });
    }
  };

  const handleReject = (postId: string, reason: string) => {
    console.log('プロジェクト却下:', postId, reason);
    // TODO: API呼び出し
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'PROJECT_REJECTED',
        targetId: postId,
        severity: 'medium',
        details: { reason }
      });
    }
  };

  const handleHold = (postId: string, reason: string) => {
    console.log('プロジェクト保留:', postId, reason);
    // TODO: API呼び出し
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'PROJECT_HELD',
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
        action: 'PROJECT_EMERGENCY_OVERRIDE',
        targetId: postId,
        severity: 'critical',
        details: { reason: '上位者による緊急介入' }
      });
    }
  };

  const handleFormTeam = (postId: string) => {
    console.log('チーム編成へ:', postId);
    // TODO: チーム編成ページへ遷移
    if (activeUser) {
      AuditService.getInstance().log({
        userId: activeUser.id,
        action: 'PROJECT_TEAM_FORMATION_STARTED',
        targetId: postId,
        severity: 'medium'
      });
    }
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
      : projectPermissionService.getPermission({ id: '', name: '', department: '', permissionLevel: 1 }, projectLevel);

    const totalVotes = post.votes
      ? Object.values(post.votes).reduce((sum, count) => sum + count, 0)
      : 0;
    const supportVotes = post.votes
      ? (post.votes['strongly-support'] || 0) + (post.votes['support'] || 0)
      : 0;
    const supportRate = totalVotes > 0
      ? Math.round((supportVotes / totalVotes) * 100)
      : 0;

    // プロジェクト規模推定
    const estimatedTeamSize = Math.max(5, Math.floor(totalVotes * 0.3));
    const projectScale = getProjectScale(projectLevel, estimatedTeamSize);

    return {
      currentScore,
      projectLevel,
      permission,
      totalVotes,
      supportRate,
      projectScale,
      estimatedTeamSize
    };
  };

  if (!activeUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Rocket className="w-10 h-10" />
          プロジェクト承認
        </h1>
        <p className="text-gray-300 mb-4">
          管轄範囲のプロジェクト提案を確認・承認
        </p>

        {/* 権限レベル表示 */}
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-300">
            レベル {activeUser.permissionLevel} -
            承認可能: {approvableLevels.length}レベル、
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
                  onClick={() => setFilter('approvable')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'approvable'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  ✅ 承認可能 ({posts.filter(p => {
                    const level = getProjectLevel(calculateScore(convertVotesToEngagements(p.votes || {}), p.proposalType));
                    const perm = projectPermissionService.getPermission(activeUser, level);
                    return perm.canApprove;
                  }).length})
                </button>
                <button
                  onClick={() => setFilter('viewable')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'viewable'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  👁️ 全て ({posts.filter(p => {
                    const level = getProjectLevel(calculateScore(convertVotesToEngagements(p.votes || {}), p.proposalType));
                    const perm = projectPermissionService.getPermission(activeUser, level);
                    return perm.canView;
                  }).length})
                </button>
              </div>
            </div>

            {/* レベルフィルター */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">プロジェクトレベル</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as ProjectLevel | 'all')}
                className="w-full px-4 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">すべてのレベル</option>
                {(filter === 'approvable' ? approvableLevels : viewableLevels).map(level => (
                  <option key={level.projectLevel} value={level.projectLevel}>
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
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-xl text-gray-400">
              {filter === 'approvable'
                ? '承認可能なプロジェクトがありません'
                : '閲覧可能なプロジェクトがありません'
              }
            </p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const postData = getPostData(post);
            return (
              <ProjectApprovalCard
                key={post.id}
                post={post}
                projectLevel={postData.projectLevel}
                currentScore={postData.currentScore}
                permission={postData.permission}
                totalVotes={postData.totalVotes}
                supportRate={postData.supportRate}
                projectScale={postData.projectScale}
                estimatedTeamSize={postData.estimatedTeamSize}
                onApprove={handleApprove}
                onReject={handleReject}
                onHold={handleHold}
                onEmergencyOverride={handleEmergencyOverride}
                onFormTeam={handleFormTeam}
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
      id: 'demo-project-1',
      type: 'improvement',
      proposalType: 'operational',
      content: '電子カルテシステムの刷新プロジェクト - 業務効率化と患者安全性の向上',
      author: {
        id: 'user-201',
        name: '田中次郎',
        department: '情報システム部',
        permissionLevel: 8
      },
      anonymityLevel: 'facility_all',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 35,
        'support': 42,
        'neutral': 8,
        'oppose': 3,
        'strongly-oppose': 1
      } as Record<VoteOption, number>,
      comments: [
        {
          id: 'comment-p1',
          postId: 'demo-project-1',
          content: '現場の声を反映した刷新が必要です。ぜひ進めてほしい。',
          author: {
            id: 'user-202',
            name: '山本花子',
            department: '看護部'
          },
          commentType: 'support',
          anonymityLevel: 'facility_all',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          likes: 12
        }
      ]
    },
    {
      id: 'demo-project-2',
      type: 'improvement',
      proposalType: 'communication',
      content: '多職種連携カンファレンスの定期開催プロジェクト',
      author: {
        id: 'user-203',
        name: '佐藤美咲',
        department: '医療安全部',
        permissionLevel: 5
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 15,
        'support': 22,
        'neutral': 5,
        'oppose': 2,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    },
    {
      id: 'demo-project-3',
      type: 'improvement',
      proposalType: 'operational',
      content: '新人教育プログラムの体系化とメンター制度の導入',
      author: {
        id: 'user-204',
        name: '鈴木一郎',
        department: '看護部',
        permissionLevel: 3.5
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 8,
        'support': 12,
        'neutral': 3,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    }
  ];
};

export default ProjectApprovalPage;
