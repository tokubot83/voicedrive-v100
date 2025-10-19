import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Post, VoteOption } from '../types';
import { ProjectLevel } from '../types/visibility';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { projectPermissionService } from '../services/ProjectPermissionService';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * プロジェクトモード専用：アイデアボイス投稿の追跡ページ
 * プロジェクト化前のアイデアボイス投稿の投票スコア進捗を追跡
 */
export const IdeaVoiceTrackingPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;
  const navigate = useNavigate();

  const [myIdeas, setMyIdeas] = useState<Post[]>([]);
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // データ取得
  useEffect(() => {
    if (activeUser) {
      loadIdeasData();
    }
  }, [activeUser]);

  const loadIdeasData = () => {
    // TODO: 実際のAPI実装
    // 自分が投稿したアイデアボイス投稿（type: 'improvement', proposalType: 任意）を取得
    setMyIdeas(getDemoMyIdeas());
  };

  // プロジェクトレベル取得
  const getProjectLevel = (score: number): ProjectLevel => {
    return projectPermissionService.getProjectLevelFromScore(score);
  };

  // プロジェクト化要件
  const getProjectThreshold = (): number => {
    return 100; // TEAM レベル = プロジェクト化開始
  };

  // プロジェクト化済みかどうか
  const isProjectized = (score: number): boolean => {
    return score >= getProjectThreshold();
  };

  // 次のレベルまでのスコア
  const getScoreToNextLevel = (currentScore: number, projectLevel: ProjectLevel): { nextLevel: ProjectLevel; remaining: number } | null => {
    const thresholds: Array<{ level: ProjectLevel; score: number }> = [
      { level: 'TEAM', score: 100 },
      { level: 'DEPARTMENT', score: 200 },
      { level: 'FACILITY', score: 400 },
      { level: 'ORGANIZATION', score: 800 }
    ];

    for (const threshold of thresholds) {
      if (currentScore < threshold.score) {
        return {
          nextLevel: threshold.level,
          remaining: threshold.score - currentScore
        };
      }
    }

    return null; // 既に最高レベル
  };

  // プロジェクトレベル表示設定
  const levelConfig: Record<ProjectLevel, { label: string; icon: string; color: string }> = {
    'PENDING': {
      label: 'アイデア検討中',
      icon: '💡',
      color: 'text-gray-400 bg-gray-800/50 border-gray-700'
    },
    'TEAM': {
      label: 'チームプロジェクト',
      icon: '👥',
      color: 'text-blue-400 bg-blue-900/30 border-blue-700'
    },
    'DEPARTMENT': {
      label: '部署プロジェクト',
      icon: '🏢',
      color: 'text-green-400 bg-green-900/30 border-green-700'
    },
    'FACILITY': {
      label: '施設プロジェクト',
      icon: '🏥',
      color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700'
    },
    'ORGANIZATION': {
      label: '法人プロジェクト',
      icon: '🏛️',
      color: 'text-purple-400 bg-purple-900/30 border-purple-700'
    },
    'STRATEGIC': {
      label: '戦略プロジェクト',
      icon: '⭐',
      color: 'text-pink-400 bg-pink-900/30 border-pink-700'
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-10 h-10" />
          投稿の追跡
        </h1>
        <p className="text-gray-300">
          アイデアボイス投稿のプロジェクト化進捗
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="mx-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-1">総アイデア数</div>
            <div className="text-3xl font-bold text-white">{myIdeas.length}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-1">検討中</div>
            <div className="text-3xl font-bold text-gray-400">
              {myIdeas.filter(idea => {
                const score = calculateScore(convertVotesToEngagements(idea.votes || {}), idea.proposalType);
                return !isProjectized(score);
              }).length}
            </div>
          </div>
          <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700/50">
            <div className="text-sm text-blue-400 mb-1">プロジェクト化済み</div>
            <div className="text-3xl font-bold text-blue-400">
              {myIdeas.filter(idea => {
                const score = calculateScore(convertVotesToEngagements(idea.votes || {}), idea.proposalType);
                return isProjectized(score);
              }).length}
            </div>
          </div>
          <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-700/50">
            <div className="text-sm text-purple-400 mb-1">平均スコア</div>
            <div className="text-3xl font-bold text-purple-400">
              {myIdeas.length > 0
                ? Math.round(
                    myIdeas.reduce((sum, idea) => {
                      return sum + calculateScore(convertVotesToEngagements(idea.votes || {}), idea.proposalType);
                    }, 0) / myIdeas.length
                  )
                : 0}
            </div>
          </div>
        </div>
      </div>

      {/* アイデア一覧 */}
      <div className="mx-6 pb-24">
        {myIdeas.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">
              <Lightbulb className="w-24 h-24 mx-auto text-gray-500" />
            </div>
            <p className="text-xl text-gray-400">まだアイデアボイス投稿がありません</p>
            <p className="text-sm text-gray-500 mt-2">トップページから新しいアイデアを投稿してみましょう</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myIdeas.map(idea => {
              const currentScore = calculateScore(convertVotesToEngagements(idea.votes || {}), idea.proposalType);
              const projectLevel = getProjectLevel(currentScore);
              const projectized = isProjectized(currentScore);
              const nextLevel = getScoreToNextLevel(currentScore, projectLevel);
              const totalVotes = idea.votes ? Object.values(idea.votes).reduce((sum, count) => sum + count, 0) : 0;
              const supportVotes = idea.votes ? (idea.votes['strongly-support'] || 0) + (idea.votes['support'] || 0) : 0;
              const supportRate = totalVotes > 0 ? Math.round((supportVotes / totalVotes) * 100) : 0;
              const config = levelConfig[projectLevel];

              return (
                <div
                  key={idea.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  {/* プロジェクト化済みバッジ */}
                  {projectized && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-400 text-sm font-medium">
                      ✅ プロジェクト化達成
                    </div>
                  )}

                  {/* プロジェクトレベル */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${config.color}`}>
                      <span className="text-lg">{config.icon}</span>
                      {config.label}
                    </div>
                  </div>

                  {/* 投稿内容 */}
                  <div className="mb-4">
                    <p className="text-white text-lg leading-relaxed">{idea.content}</p>
                  </div>

                  {/* 投稿日時 */}
                  <div className="text-sm text-gray-400 mb-4">
                    投稿日: {idea.timestamp.toLocaleDateString('ja-JP')}
                  </div>

                  {/* スコア情報 */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">現在のスコア</div>
                      <div className="text-2xl font-bold text-white">{currentScore}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">総投票数</div>
                      <div className="text-2xl font-bold text-white">{totalVotes}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">支持率</div>
                      <div className="text-2xl font-bold text-white">{supportRate}%</div>
                    </div>
                  </div>

                  {/* 進捗バー */}
                  {!projectized && nextLevel && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>プロジェクト化まであと {nextLevel.remaining} 点</span>
                        <span>{levelConfig[nextLevel.nextLevel].label}</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (currentScore / (currentScore + nextLevel.remaining)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* プロジェクトの追跡へのリンク */}
                  {projectized && (
                    <button
                      onClick={() => navigate('/project-tracking')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      プロジェクトの追跡で確認
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })}
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
const getDemoMyIdeas = (): Post[] => {
  return [
    {
      id: 'demo-idea-1',
      type: 'improvement',
      proposalType: 'operational',
      content: '新人教育プログラムの体系化とメンター制度の導入を提案します',
      author: {
        id: 'user-1',
        name: 'あなた',
        department: '看護部',
        permissionLevel: 3.5
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 15,
        'support': 22,
        'neutral': 3,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    },
    {
      id: 'demo-idea-2',
      type: 'improvement',
      proposalType: 'communication',
      content: '多職種カンファレンスの定期開催で情報共有を強化したい',
      author: {
        id: 'user-1',
        name: 'あなた',
        department: '看護部',
        permissionLevel: 3.5
      },
      anonymityLevel: 'facility_all',
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 8,
        'support': 12,
        'neutral': 2,
        'oppose': 0,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    },
    {
      id: 'demo-idea-3',
      type: 'improvement',
      proposalType: 'operational',
      content: '勤務シフト作成の効率化ツールを導入したい',
      author: {
        id: 'user-1',
        name: 'あなた',
        department: '看護部',
        permissionLevel: 3.5
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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

export default IdeaVoiceTrackingPage;
