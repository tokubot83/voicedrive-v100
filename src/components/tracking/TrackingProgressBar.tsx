import React from 'react';
import { TrendingUp } from 'lucide-react';

interface TrackingProgressBarProps {
  currentScore: number;
  nextLevelName?: string;
  pointsToNext?: number;
}

export const TrackingProgressBar: React.FC<TrackingProgressBarProps> = ({
  currentScore,
  nextLevelName,
  pointsToNext
}) => {
  // 議題レベルごとの閾値
  const getLevelThresholds = () => {
    if (currentScore >= 600) return { current: 600, next: null, name: '法人議題' };
    if (currentScore >= 300) return { current: 300, next: 600, name: '法人検討' };
    if (currentScore >= 100) return { current: 100, next: 300, name: '施設議題' };
    if (currentScore >= 50) return { current: 50, next: 100, name: '部署議題' };
    if (currentScore >= 30) return { current: 30, next: 50, name: '部署検討' };
    return { current: 0, next: 30, name: '検討中' };
  };

  const thresholds = getLevelThresholds();

  // プログレスバーの進捗率計算
  const getProgressPercentage = () => {
    if (!thresholds.next) return 100; // 最高レベル到達

    const range = thresholds.next - thresholds.current;
    const progress = currentScore - thresholds.current;
    return Math.min((progress / range) * 100, 100);
  };

  const progressPercentage = getProgressPercentage();

  // 議題レベルごとの色設定
  const getBarColor = () => {
    if (currentScore >= 600) return 'bg-red-500';
    if (currentScore >= 300) return 'bg-orange-500';
    if (currentScore >= 100) return 'bg-yellow-500';
    if (currentScore >= 50) return 'bg-green-500';
    if (currentScore >= 30) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const barColor = getBarColor();

  return (
    <div className="space-y-2">
      {/* プログレスバー */}
      <div className="relative">
        <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 次のレベルまでの情報 */}
      {nextLevelName && pointsToNext !== null && pointsToNext !== undefined ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">次: {nextLevelName}</span>
          <span className="text-yellow-400 font-bold">
            あと{pointsToNext}点
          </span>
        </div>
      ) : (
        <div className="text-center text-xs">
          <span className="text-yellow-400 font-bold">
            🎉 最高レベル到達！
          </span>
        </div>
      )}
    </div>
  );
};

export default TrackingProgressBar;
