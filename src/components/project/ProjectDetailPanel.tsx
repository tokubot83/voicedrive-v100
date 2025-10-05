import React from 'react';
import { Post, VoteOption } from '../../types';
import { ProjectLevel } from '../../types/visibility';
import { ProjectPermission } from '../../services/ProjectPermissionService';
import ProjectCommentSection from './ProjectCommentSection';
import { TrendingUp, Users, Target } from 'lucide-react';

interface ProjectDetailPanelProps {
  post: Post;
  currentScore: number;
  permission: ProjectPermission;
  projectLevel: ProjectLevel;
}

const ProjectDetailPanel: React.FC<ProjectDetailPanelProps> = ({
  post,
  currentScore,
  permission,
  projectLevel
}) => {
  // 投票種別のラベル
  const voteLabels: Record<VoteOption, string> = {
    'strongly-support': '強く賛成',
    'support': '賛成',
    'neutral': '中立',
    'oppose': '反対',
    'strongly-oppose': '強く反対'
  };

  // 投票種別の色
  const voteColors: Record<VoteOption, string> = {
    'strongly-support': 'bg-green-500/20 text-green-400',
    'support': 'bg-blue-500/20 text-blue-400',
    'neutral': 'bg-gray-500/20 text-gray-400',
    'oppose': 'bg-orange-500/20 text-orange-400',
    'strongly-oppose': 'bg-red-500/20 text-red-400'
  };

  // 投票集計
  const votes = post.votes || {};
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  // スコア内訳（簡易版）
  const getScoreBreakdown = () => {
    const stronglySupport = votes['strongly-support'] || 0;
    const support = votes['support'] || 0;
    const oppose = votes['oppose'] || 0;
    const stronglyOppose = votes['strongly-oppose'] || 0;

    return {
      positive: stronglySupport * 10 + support * 5,
      negative: oppose * 5 + stronglyOppose * 10,
      breakdown: [
        { label: '医師', score: Math.floor(currentScore * 0.3), votes: Math.floor(totalVotes * 0.2) },
        { label: '看護師', score: Math.floor(currentScore * 0.45), votes: Math.floor(totalVotes * 0.5) },
        { label: '介護職', score: Math.floor(currentScore * 0.2), votes: Math.floor(totalVotes * 0.25) },
        { label: '事務職', score: Math.floor(currentScore * 0.05), votes: Math.floor(totalVotes * 0.05) }
      ]
    };
  };

  const scoreBreakdown = getScoreBreakdown();

  // プロジェクトレベル進捗
  const getLevelProgress = () => {
    const thresholds = {
      'PENDING': { current: 0, next: 100, nextLabel: 'チームプロジェクト' },
      'TEAM': { current: 100, next: 200, nextLabel: '部署プロジェクト' },
      'DEPARTMENT': { current: 200, next: 400, nextLabel: '施設プロジェクト' },
      'FACILITY': { current: 400, next: 800, nextLabel: '法人プロジェクト' },
      'ORGANIZATION': { current: 800, next: null, nextLabel: '最高レベル達成' }
    };

    const level = thresholds[projectLevel as keyof typeof thresholds] || thresholds.PENDING;
    const progress = level.next
      ? Math.min(((currentScore - level.current) / (level.next - level.current)) * 100, 100)
      : 100;

    return { ...level, progress };
  };

  const levelProgress = getLevelProgress();

  return (
    <div className="p-4 space-y-4">
      {/* プロジェクト進捗 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-bold text-white">プロジェクトレベル進捗</h4>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">現在のスコア</span>
            <span className="text-white font-bold">{currentScore}点</span>
          </div>

          {levelProgress.next && (
            <>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${levelProgress.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">次のレベルまで</span>
                <span className="text-purple-400 font-bold">
                  {levelProgress.next - currentScore}点（{levelProgress.nextLabel}）
                </span>
              </div>
            </>
          )}

          {!levelProgress.next && (
            <div className="text-center py-2">
              <span className="text-purple-400 font-bold">🏆 最高レベル達成！</span>
            </div>
          )}
        </div>
      </div>

      {/* スコア内訳 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h4 className="text-lg font-bold text-white">スコア内訳</h4>
        </div>

        {/* 職種別スコア */}
        <div className="space-y-2 mb-4">
          {scoreBreakdown.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium w-20">{item.label}</span>
                <span className="text-sm text-gray-400">({item.votes}票)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(item.score / currentScore) * 100}%` }}
                  />
                </div>
                <span className="text-blue-400 font-bold w-16 text-right">+{item.score}点</span>
              </div>
            </div>
          ))}
        </div>

        {/* 総スコア */}
        <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
          <span className="text-white font-bold">総スコア</span>
          <span className="text-2xl font-bold text-blue-400">{currentScore}点</span>
        </div>
      </div>

      {/* 投票分布 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-bold text-white">投票分布</h4>
        </div>

        <div className="space-y-2">
          {(Object.keys(voteLabels) as VoteOption[]).map(voteType => {
            const count = votes[voteType] || 0;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

            return (
              <div key={voteType} className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium w-24 text-center ${voteColors[voteType]}`}>
                  {voteLabels[voteType]}
                </span>
                <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${voteColors[voteType]} flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 10 && (
                      <span className="text-xs font-bold">{percentage}%</span>
                    )}
                  </div>
                </div>
                <span className="text-white font-bold w-12 text-right">{count}票</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* コメントセクション */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <ProjectCommentSection
          post={post}
          permission={permission}
        />
      </div>
    </div>
  );
};

export default ProjectDetailPanel;
