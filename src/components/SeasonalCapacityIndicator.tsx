import React, { useEffect, useState } from 'react';
import { SeasonalManager } from '../utils/SeasonalManager';

interface SeasonalCapacityIndicatorProps {
  currentProposalCount: number;
  onCapacityWarning?: (status: any) => void;
}

const SeasonalCapacityIndicator: React.FC<SeasonalCapacityIndicatorProps> = ({
  currentProposalCount,
  onCapacityWarning
}) => {
  const [manager] = useState(() => new SeasonalManager());
  const [capacityInfo, setCapacityInfo] = useState(manager.getCapacityInfo());
  const [capacityStatus, setCapacityStatus] = useState(manager.checkCapacityStatus(currentProposalCount));
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const status = manager.checkCapacityStatus(currentProposalCount);
    setCapacityStatus(status);
    
    if (status.status === 'warning' || status.status === 'full') {
      onCapacityWarning?.(status);
    }
  }, [currentProposalCount, manager, onCapacityWarning]);

  const getProgressBarColor = () => {
    switch (capacityStatus.status) {
      case 'full': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  const getProgressPercentage = () => {
    return Math.min(100, (currentProposalCount / capacityInfo.maxCapacity) * 100);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{capacityInfo.emoji}</span>
          <div>
            <h3 className="font-bold text-white">
              {capacityInfo.label}期の活動状況
            </h3>
            <p className="text-sm text-gray-400">
              {capacityInfo.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${
            capacityStatus.status === 'full' ? 'text-red-400' :
            capacityStatus.status === 'warning' ? 'text-orange-400' :
            'text-green-400'
          }`}>
            {currentProposalCount} / {capacityInfo.maxCapacity}
          </div>
          <p className="text-xs text-gray-500">
            {capacityStatus.message}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-gray-700 rounded-full h-8 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          >
            <div className="h-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-700 animate-fadeIn">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">ピーク期間</p>
              <p className="text-white">
                {capacityInfo.peakPeriods.join('、')}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">推奨活動</p>
              <div className="flex flex-wrap gap-1">
                {capacityInfo.suggestedFocus.map((focus, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                  >
                    {focus}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400">
              💡 ヒント: {capacityInfo.label}期は
              {capacityInfo.suggestedFocus[0]}に最適な時期です。
              現在の容量状況を考慮して、効果的な活動を心がけましょう。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalCapacityIndicator;