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
  // 早期リターンでSSR/CSRの不一致を防ぐ
  if (typeof window === 'undefined') {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400/20 rounded animate-pulse" />
          <span className="text-sm font-medium text-blue-400">プロジェクト進捗読み込み中...</span>
        </div>
      </div>
    );
  }
  // 安全な投票数の計算（votesがundefinedでも対応）
  const safeVotes = votes || {
    'strongly-oppose': 0,
    'oppose': 0,
    'neutral': 0,
    'support': 0,
    'strongly-support': 0
  };
  const totalVotes = Object.values(safeVotes).reduce((sum, count) => sum + (count || 0), 0);
  
  // データ検証 - エラー時も強制表示
  if (currentScore < 0 || isNaN(currentScore)) {
    console.warn('ProjectProgressIndicator: Invalid currentScore', currentScore);
    // エラー時も強制的にスコアを表示
    const fallbackScore = 0;
    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">スコア計算エラー（強制表示）</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">現在スコア</span>
            <span className="text-white font-bold text-lg">{fallbackScore}点</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (!votes || typeof votes !== 'object') {
    console.warn('ProjectProgressIndicator: Invalid votes data', votes);
    // フォールバック表示
    return (
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-red-400">投票データエラー</span>
        </div>
      </div>
    );
  }
  
  // プロジェクトレベルの閾値設定（ProjectScoring.tsと統一）
  const thresholds = [
    { level: 'PENDING', score: 0, label: '議論開始', shortLabel: '議論', icon: Users, color: 'gray' },
    { level: 'TEAM', score: 50, label: 'チーム内', shortLabel: 'チーム', icon: Users, color: 'green' },
    { level: 'DEPARTMENT', score: 100, label: '部署プロジェクト', shortLabel: '部署', icon: Users, color: 'blue' },
    { level: 'FACILITY', score: 300, label: '施設プロジェクト', shortLabel: '施設', icon: Target, color: 'purple' },
    { level: 'ORGANIZATION', score: 600, label: '法人プロジェクト', shortLabel: '法人', icon: Star, color: 'orange' }
  ];

  // 合意度の計算（安全なアクセス）
  const consensusScore = totalVotes > 0 
    ? Math.round((((safeVotes.support || 0) + (safeVotes['strongly-support'] || 0)) / totalVotes) * 100)
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
  
  // 現在の閾値を正しく計算（修正版）
  const getCurrentThreshold = () => {
    let currentThreshold = thresholds[0]; // デフォルトはPENDING
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (currentScore >= thresholds[i].score) {
        currentThreshold = thresholds[i];
        break;
      }
    }
    return currentThreshold;
  };
  
  const currentThreshold = getCurrentThreshold();
  
  // 次のマイルストーンまでの進捗（安全な計算）
  const progressToNext = nextMilestone 
    ? Math.max(0, Math.min(100, ((currentScore - currentThreshold.score) / (nextMilestone.score - currentThreshold.score)) * 100))
    : 100;

  const remainingPoints = nextMilestone ? Math.max(0, nextMilestone.score - currentScore) : 0;

  // 計算結果の検証
  if (isNaN(progressToNext) || progressToNext < 0) {
    console.warn('ProjectProgressIndicator: Invalid progressToNext calculation', {
      currentScore,
      currentThreshold,
      nextMilestone,
      progressToNext
    });
  }

  // コンパクト表示（通常投稿用）
  if (isCompact) {
    try {
      return (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">プロジェクト進捗</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">現在スコア</span>
            <span className="text-white font-bold text-lg">{Math.round(currentScore || 0)}点</span>
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
                // 安全なクラス名の使用（動的クラス名の問題を回避）
                const bgColorClass = currentScore >= threshold.score 
                  ? 'bg-green-500' 
                  : threshold.color === 'gray' ? 'bg-gray-500' :
                    threshold.color === 'green' ? 'bg-green-500' :
                    threshold.color === 'blue' ? 'bg-blue-500' :
                    threshold.color === 'purple' ? 'bg-purple-500' :
                    threshold.color === 'orange' ? 'bg-orange-500' : 'bg-gray-500';
                
                return (
                  <div
                    key={threshold.level}
                    className="absolute top-0 transform -translate-x-1/2"
                    style={{ left: `${Math.min(position, 95)}%` }}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 border-white ${bgColorClass}`} />
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
    } catch (error) {
      console.error('ProjectProgressIndicator render error:', error);
      return (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              プロジェクト進捗の表示中にエラーが発生しました
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            スコア: {currentScore}点 | 投票数: {totalVotes}票
          </div>
        </div>
      );
    }
  }

  // フル表示（EnhancedConsensusChart用）- 既存のEnhancedConsensusChartのロジックを使用
  return null; // フル表示は既存のEnhancedConsensusChartで対応
};

export default ProjectProgressIndicator;