import React from 'react';
import { TrendingUp, Target, Clock, Users, Star, AlertCircle } from 'lucide-react';
import { VoteOption, ProjectLevel } from '../types';

interface ProjectProgressIndicatorProps {
  votes: Record<VoteOption, number>;
  currentScore: number;
  currentLevel?: ProjectLevel;
  postId: string;
  isCompact?: boolean; // 通常投稿用のコンパクト表示
}

const ProjectProgressIndicator: React.FC<ProjectProgressIndicatorProps> = ({
  votes,
  currentScore,
  currentLevel = 'DEPARTMENT',
  postId,
  isCompact = true
}) => {
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  
  // データ検証
  if (currentScore < 0 || isNaN(currentScore)) {
    console.warn('ProjectProgressIndicator: Invalid currentScore', currentScore);
    return null;
  }
  
  if (!votes || typeof votes !== 'object') {
    console.warn('ProjectProgressIndicator: Invalid votes data', votes);
    return null;
  }
  
  // プロジェクトレベルの閾値設定（ProjectScoring.tsと統一）
  const thresholds = [
    { level: 'PENDING', score: 0, label: '議論開始', shortLabel: '議論', icon: Users, color: 'gray' },
    { level: 'TEAM', score: 50, label: 'チーム内', shortLabel: 'チーム', icon: Users, color: 'green' },
    { level: 'DEPARTMENT', score: 100, label: '部署プロジェクト', shortLabel: '部署', icon: Users, color: 'blue' },
    { level: 'FACILITY', score: 300, label: '施設プロジェクト', shortLabel: '施設', icon: Target, color: 'purple' },
    { level: 'ORGANIZATION', score: 600, label: '法人プロジェクト', shortLabel: '法人', icon: Star, color: 'orange' }
  ];

  // 合意度の計算
  const consensusScore = totalVotes > 0 
    ? Math.round(((votes.support + votes['strongly-support']) / totalVotes) * 100)
    : 0;

  // 次のマイルストーンを計算
  const getNextMilestone = () => {
    for (const threshold of thresholds) {
      if (currentScore < threshold.score) {
        return threshold;
      }
    }
    return null; // 最高レベル到達
  };

  const nextMilestone = getNextMilestone();
  const currentThreshold = thresholds.find(t => currentScore >= t.score) || thresholds[0];
  
  // 次のマイルストーンまでの進捗
  const progressToNext = nextMilestone 
    ? ((currentScore - currentThreshold.score) / (nextMilestone.score - currentThreshold.score)) * 100
    : 100;

  const remainingPoints = nextMilestone ? nextMilestone.score - currentScore : 0;

  // コンパクト表示（通常投稿用）
  if (isCompact) {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">プロジェクト進捗</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">現在スコア</span>
            <span className="text-white font-bold">{currentScore}点</span>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">{currentThreshold.label}</span>
            {nextMilestone && (
              <span className="text-blue-400 font-medium">
                次: {nextMilestone.shortLabel} まであと{remainingPoints}点
              </span>
            )}
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-700/50 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              >
                {progressToNext >= 90 && (
                  <div className="absolute right-1 top-0.5 text-xs text-white">
                    🔥
                  </div>
                )}
              </div>
            </div>
            
            {/* マイルストーンマーカー */}
            {thresholds.map((threshold, index) => {
              if (index === 0) return null; // PENDINGはスキップ
              
              // 安全な除算チェック
              const denominator = (nextMilestone?.score || 0) - currentThreshold.score;
              if (denominator <= 0) return null;
              
              const position = ((threshold.score - currentThreshold.score) / denominator) * 100;
              
              if (position > 0 && position <= 100) {
                const Icon = threshold.icon;
                return (
                  <div
                    key={threshold.level}
                    className="absolute top-0 transform -translate-x-1/2"
                    style={{ left: `${Math.min(position, 95)}%` }}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 border-white ${
                      currentScore >= threshold.score 
                        ? 'bg-green-500' 
                        : `bg-${threshold.color}-500`
                    }`} />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* ステータス表示 */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">合意度</span>
            <span className={`font-medium ${
              consensusScore >= 70 ? 'text-green-400' : 
              consensusScore >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {consensusScore}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">{totalVotes}票</span>
          </div>
        </div>

        {/* 緊急状態表示 */}
        {progressToNext >= 90 && nextMilestone && (
          <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-orange-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span className="font-medium">
                もうすぐ{nextMilestone.label}に！残り{remainingPoints}点
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // フル表示（EnhancedConsensusChart用）- 既存のEnhancedConsensusChartのロジックを使用
  return null; // フル表示は既存のEnhancedConsensusChartで対応
};

export default ProjectProgressIndicator;