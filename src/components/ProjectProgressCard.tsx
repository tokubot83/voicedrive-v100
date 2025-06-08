import React from 'react';

interface ProjectProgressCardProps {
  score: number;
  threshold: number;
  progress: number;
}

const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({ score, threshold, progress }) => {
  const remaining = threshold - score;
  const progressPercentage = Math.min(100, (score / threshold) * 100);
  
  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-xl p-6 backdrop-filter backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-orange-400">
          📈 プロジェクト化進行中
        </h3>
        <span className="text-sm text-gray-400">
          施設内プロジェクト
        </span>
      </div>
      
      {/* スコア表示 */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-blue-400">{score.toFixed(1)}点</span>
        <span className="text-orange-400 font-medium">
          あと{remaining.toFixed(1)}点!
        </span>
      </div>
      
      {/* 進捗バー */}
      <div className="relative w-full bg-gray-700 rounded-full h-4 mb-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* シマーエフェクト */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">
          進捗: {progressPercentage.toFixed(1)}%
        </span>
        <span className="text-gray-400">
          閾値: {threshold}点
        </span>
      </div>
      
      {/* 追加情報 */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          🎯 このまま支持が集まれば、自動的に施設内プロジェクトとして承認プロセスに進みます
        </p>
      </div>
    </div>
  );
};

export default ProjectProgressCard;