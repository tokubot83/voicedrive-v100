import React from 'react';
import { VoteOption } from '../types';

interface ConsensusProgressBarProps {
  votes: Record<VoteOption, number>;
  percentage: number;
  showLabels?: boolean;
}

const ConsensusProgressBar: React.FC<ConsensusProgressBarProps> = ({ 
  votes, 
  percentage,
  showLabels = false 
}) => {
  // 投票オプションの定義（VotingSectionと統一）
  const voteOptions = [
    { type: 'strongly-support' as VoteOption, label: '強く賛成', color: 'bg-blue-500', emoji: '😍' },
    { type: 'support' as VoteOption, label: '賛成', color: 'bg-green-500', emoji: '😊' },
    { type: 'neutral' as VoteOption, label: '中立', color: 'bg-gray-500', emoji: '😐' },
    { type: 'oppose' as VoteOption, label: '反対', color: 'bg-orange-500', emoji: '😕' },
    { type: 'strongly-oppose' as VoteOption, label: '強く反対', color: 'bg-red-500', emoji: '😠' }
  ];

  // 合計票数を計算
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return (
      <div className="w-full">
        <div className="flex h-8 rounded-full overflow-hidden bg-gray-200">
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
            まだ投票がありません
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* プログレスバー */}
      <div className="flex h-8 rounded-full overflow-hidden bg-gray-200 shadow-inner">
        {voteOptions.map((option) => {
          const voteCount = votes[option.type] || 0;
          const votePercentage = (voteCount / totalVotes) * 100;
          
          if (votePercentage === 0) return null;
          
          return (
            <div
              key={option.type}
              className={`${option.color} h-full transition-all duration-500 hover:opacity-90 relative group`}
              style={{ width: `${votePercentage}%` }}
              title={`${option.label}: ${voteCount}票 (${Math.round(votePercentage)}%)`}
            >
              {/* ホバー時のツールチップ */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {option.emoji} {option.label}: {voteCount}票 ({Math.round(votePercentage)}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* ラベル表示（オプション） */}
      {showLabels && (
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            {voteOptions.slice(0, 2).map((option) => {
              const voteCount = votes[option.type] || 0;
              const votePercentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              return (
                <div key={option.type} className="flex items-center gap-1">
                  <div className={`w-3 h-3 ${option.color} rounded`} />
                  <span>{option.emoji} {votePercentage}%</span>
                </div>
              );
            })}
          </div>
          <div className="text-gray-500">
            計 {totalVotes} 票
          </div>
        </div>
      )}

      {/* 納得率の説明 */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          みんなの納得率
        </span>
        <span className="text-lg font-bold text-emerald-700">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default ConsensusProgressBar;