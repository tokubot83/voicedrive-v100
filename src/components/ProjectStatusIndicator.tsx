import React from 'react';

interface ProjectStatusIndicatorProps {
  score: number;
  threshold: number;
  status: 'approaching' | 'ready';
}

const ProjectStatusIndicator: React.FC<ProjectStatusIndicatorProps> = ({ score, threshold, status }) => {
  const progressPercentage = Math.min(100, (score / threshold) * 100);
  const remaining = threshold - score;
  
  const isReady = status === 'ready';
  
  return (
    <div className={`
      bg-gradient-to-r ${isReady ? 'from-green-900/30 to-emerald-900/20' : 'from-orange-900/30 to-yellow-900/20'}
      border ${isReady ? 'border-green-500/30' : 'border-orange-500/30'}
      rounded-xl p-6 backdrop-filter backdrop-blur-sm relative overflow-hidden
    `}>
      {/* シマーエフェクト */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isReady ? 'text-green-400' : 'text-orange-400'}`}>
            {isReady ? '✅ プロジェクト化達成！' : '🚀 プロジェクト化間近'}
          </h3>
          <span className="text-sm text-gray-400">
            施設内プロジェクト
          </span>
        </div>
        
        {/* スコア表示 */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-white">
            {isReady ? '達成スコア: ' : '現在: '}
            {score.toFixed(1)}点
          </span>
          {!isReady && (
            <span className="text-orange-400 font-medium animate-pulse">
              あと{remaining.toFixed(1)}点!
            </span>
          )}
        </div>
        
        {/* 進捗バー */}
        <div className="relative w-full bg-gray-700 rounded-full h-4 mb-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
              isReady ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          {isReady ? (
            <p>
              🎉 閾値{threshold}点を達成しました！自動的にプロジェクトとして承認プロセスに進みます。
            </p>
          ) : (
            <p>
              進捗: {progressPercentage.toFixed(1)}% - このまま支持が集まれば、まもなくプロジェクト化されます！
            </p>
          )}
        </div>
        
        {isReady && (
          <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium">
            🏗️ プロジェクト詳細を確認
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectStatusIndicator;