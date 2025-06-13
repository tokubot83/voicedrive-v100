import React from 'react';
import { TrendingUp, Building2, Building, Briefcase, Target, Clock } from 'lucide-react';
import { VoteOption, ProjectLevel } from '../types';

interface EnhancedConsensusChartProps {
  votes: Record<VoteOption, number>;
  currentScore: number;
  currentLevel?: ProjectLevel;
  postId: string;
}

const EnhancedConsensusChart: React.FC<EnhancedConsensusChartProps> = ({
  votes,
  currentScore,
  currentLevel,
  postId
}) => {
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  
  // データ検証
  if (currentScore < 0 || isNaN(currentScore)) {
    console.warn('EnhancedConsensusChart: Invalid currentScore', currentScore);
    return null;
  }
  
  if (!votes || typeof votes !== 'object') {
    console.warn('EnhancedConsensusChart: Invalid votes data', votes);
    return null;
  }
  
  // プロジェクトレベルの閾値設定（ProjectScoring.tsと統一）
  const thresholds = [
    { level: 'PENDING', score: 0, label: '部署内議論', icon: Target, color: 'gray' },
    { level: 'TEAM', score: 50, label: 'チーム内', icon: Target, color: 'green' },
    { level: 'DEPARTMENT', score: 100, label: '部署プロジェクト', icon: Building2, color: 'blue' },
    { level: 'FACILITY', score: 300, label: '施設プロジェクト', icon: Building, color: 'purple' },
    { level: 'ORGANIZATION', score: 600, label: '法人プロジェクト', icon: Briefcase, color: 'orange' }
  ];

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
  const progressToNext = nextMilestone 
    ? ((currentScore - (thresholds.find(t => t.score < nextMilestone.score && t.score <= currentScore)?.score || 0)) / 
       (nextMilestone.score - (thresholds.find(t => t.score < nextMilestone.score && t.score <= currentScore)?.score || 0))) * 100
    : 100;

  // 合意度の計算
  const consensusScore = totalVotes > 0 
    ? Math.round(((votes.support + votes['strongly-support']) / totalVotes) * 100)
    : 0;

  // 円グラフのデータ準備
  const voteData = [
    { option: 'strongly-support', count: votes['strongly-support'], color: '#3b82f6', label: '強く賛成' },
    { option: 'support', count: votes.support, color: '#10b981', label: '賛成' },
    { option: 'neutral', count: votes.neutral, color: '#6b7280', label: '中立' },
    { option: 'oppose', count: votes.oppose, color: '#f59e0b', label: '反対' },
    { option: 'strongly-oppose', count: votes['strongly-oppose'], color: '#ef4444', label: '強く反対' }
  ];

  // 現在のレベルを取得
  const getCurrentLevelInfo = () => {
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (currentScore >= thresholds[i].score) {
        return thresholds[i];
      }
    }
    return thresholds[0];
  };

  const currentLevelInfo = getCurrentLevelInfo();

  // マイルストーンリングの描画
  const renderMilestoneRings = () => {
    const radius = 90;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;

    return thresholds.map((threshold, index) => {
      const isAchieved = currentScore >= threshold.score;
      const isNext = nextMilestone?.score === threshold.score;
      
      let strokeDasharray = circumference;
      let strokeDashoffset = 0;
      
      if (isNext && currentScore > 0) {
        // 次のマイルストーンへの進捗を表示
        const prevScore = index > 0 ? thresholds[index - 1].score : 0;
        const progress = Math.min(((currentScore - prevScore) / (threshold.score - prevScore)) * 100, 100);
        strokeDashoffset = circumference - (circumference * progress / 100);
      } else if (!isAchieved) {
        strokeDashoffset = circumference;
      }

      return (
        <circle
          key={threshold.level}
          cx="120"
          cy="120"
          r={radius - (index * 12)}
          fill="none"
          stroke={isAchieved ? `var(--${threshold.color}-500)` : isNext ? `var(--${threshold.color}-400)` : 'rgba(156, 163, 175, 0.3)'}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${isNext ? 'animate-pulse' : ''}`}
          style={{
            '--blue-500': '#3b82f6',
            '--purple-500': '#8b5cf6',
            '--orange-500': '#f59e0b',
            '--gray-500': '#6b7280',
            '--green-500': '#10b981',
            '--blue-400': '#60a5fa',
            '--purple-400': '#a78bfa',
            '--orange-400': '#fbbf24',
            '--gray-400': '#9ca3af',
            '--green-400': '#34d399'
          } as React.CSSProperties}
        />
      );
    });
  };

  // 投票データの円グラフ
  const renderVoteChart = () => {
    if (totalVotes === 0) return null;

    let cumulativeAngle = 0;
    const radius = 60;
    const centerX = 120;
    const centerY = 120;

    return voteData.map((vote, index) => {
      if (vote.count === 0) return null;

      const percentage = (vote.count / totalVotes) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;

      // SVGパスの計算
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      cumulativeAngle += angle;

      return (
        <path
          key={vote.option}
          d={pathData}
          fill={vote.color}
          className="hover:opacity-80 transition-opacity duration-200"
        />
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/8 to-purple-500/8 border border-blue-500/20 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          プロジェクト進捗 & 合意形成
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-400">現在のスコア</div>
          <div className="text-2xl font-bold text-blue-400">{currentScore}点</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 進捗リングチャート */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg width="240" height="240" className="transform -rotate-90">
              {/* マイルストーンリング */}
              {renderMilestoneRings()}
              
              {/* 投票データ円グラフ */}
              <g className="opacity-90">
                {renderVoteChart()}
              </g>
            </svg>
            
            {/* 中央の情報表示 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center bg-black/60 rounded-full p-6 backdrop-blur-sm border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">{consensusScore}%</div>
                <div className="text-xs text-gray-300">合意度</div>
                <div className="text-lg font-semibold text-blue-400 mt-2">{totalVotes}</div>
                <div className="text-xs text-gray-400">投票数</div>
              </div>
            </div>
          </div>

          {/* 現在のレベル表示 */}
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <currentLevelInfo.icon className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">{currentLevelInfo.label}</span>
          </div>
        </div>

        {/* マイルストーン一覧 */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white mb-4">プロジェクトマイルストーン</h4>
          
          {thresholds.map((threshold, index) => {
            const isAchieved = currentScore >= threshold.score;
            const isNext = nextMilestone?.score === threshold.score;
            const Icon = threshold.icon;
            
            return (
              <div
                key={threshold.level}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                  isAchieved 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : isNext 
                      ? 'border-blue-500/50 bg-blue-500/10 animate-pulse' 
                      : 'border-gray-600/30 bg-gray-800/30'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isAchieved ? 'bg-green-500 text-white' : 
                  isNext ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      isAchieved ? 'text-green-400' : 
                      isNext ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {threshold.label}
                    </span>
                    {isAchieved && <span className="text-green-400 text-sm">✓ 達成</span>}
                    {isNext && (
                      <span className="text-blue-400 text-sm">
                        {Math.round(progressToNext)}% 進行中
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    必要スコア: {threshold.score}点
                  </div>
                </div>
                
                <div className={`text-lg font-bold ${
                  isAchieved ? 'text-green-400' : 
                  isNext ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {threshold.score}
                </div>
              </div>
            );
          })}

          {/* 次のマイルストーンまでの進捗 */}
          {nextMilestone && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">次のマイルストーンまで</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">進捗</span>
                  <span className="text-white">{Math.round(progressToNext)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressToNext, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  必要スコア: あと{Math.max(0, nextMilestone.score - currentScore)}点
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 投票内訳（下部） */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <h4 className="text-sm font-medium text-gray-300 mb-3">投票内訳</h4>
        <div className="grid grid-cols-5 gap-2">
          {voteData.map((vote) => (
            <div key={vote.option} className="text-center">
              <div
                className="w-full h-2 rounded-full mb-1"
                style={{ backgroundColor: vote.color }}
              />
              <div className="text-xs text-gray-400">{vote.label}</div>
              <div className="text-sm font-semibold text-white">{vote.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedConsensusChart;