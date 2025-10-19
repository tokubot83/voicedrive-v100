/**
 * 議題モードスコア表示コンポーネント
 * Phase 4: フロントエンド統合
 */
import React from 'react';
import { AgendaLevel } from '../../types/committee';

export interface AgendaScoreDisplayProps {
  currentScore: number;
  agendaLevel?: AgendaLevel;
  totalVotes?: number;
  showThresholds?: boolean;
}

// スコア閾値定義
const SCORE_THRESHOLDS = [
  { score: 30, label: '部署検討', level: 'DEPT_REVIEW', color: 'yellow', icon: '📋' },
  { score: 50, label: '部署議題', level: 'DEPT_AGENDA', color: 'blue', icon: '👥' },
  { score: 100, label: '施設議題', level: 'FACILITY_AGENDA', color: 'green', icon: '🏥' },
  { score: 300, label: '法人検討', level: 'CORP_REVIEW', color: 'purple', icon: '🏢' },
  { score: 600, label: '法人議題', level: 'CORP_AGENDA', color: 'pink', icon: '🏛️' },
];

export function AgendaScoreDisplay({
  currentScore,
  agendaLevel,
  totalVotes = 0,
  showThresholds = true,
}: AgendaScoreDisplayProps) {
  // 現在のレベルを取得
  const currentThreshold = SCORE_THRESHOLDS.reduce((acc, threshold) => {
    if (currentScore >= threshold.score) return threshold;
    return acc;
  }, SCORE_THRESHOLDS[0]);

  // 次の閾値を取得
  const nextThreshold = SCORE_THRESHOLDS.find((t) => t.score > currentScore);

  // 進捗率を計算
  const progressPercent = nextThreshold
    ? Math.min(100, ((currentScore - (currentThreshold?.score || 0)) / (nextThreshold.score - (currentThreshold?.score || 0))) * 100)
    : 100;

  return (
    <div className="space-y-4">
      {/* スコア表示 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentThreshold?.icon || '📊'}</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{currentScore}点</div>
              <div className="text-sm text-gray-600">現在のスコア</div>
            </div>
          </div>
          {totalVotes > 0 && (
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-700">{totalVotes}票</div>
              <div className="text-xs text-gray-500">総投票数</div>
            </div>
          )}
        </div>

        {/* 現在のレベル */}
        {currentThreshold && (
          <div className="flex items-center gap-2 bg-white rounded px-3 py-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${currentThreshold.color}-100 text-${currentThreshold.color}-800`}>
              {currentThreshold.label}
            </span>
            {nextThreshold && (
              <span className="text-xs text-gray-600">
                次の閾値: {nextThreshold.score}点（{nextThreshold.label}）
              </span>
            )}
          </div>
        )}
      </div>

      {/* 進捗バー */}
      {showThresholds && nextThreshold && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{currentThreshold?.label || '開始'}</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
            <span>{nextThreshold.label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            あと<span className="font-semibold text-blue-600"> {nextThreshold.score - currentScore}点 </span>
            で{nextThreshold.label}に到達
          </div>
        </div>
      )}

      {/* 閾値一覧（オプション） */}
      {showThresholds && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">スコア閾値</div>
          <div className="grid grid-cols-5 gap-2">
            {SCORE_THRESHOLDS.map((threshold) => {
              const isReached = currentScore >= threshold.score;
              const isCurrent = currentThreshold?.score === threshold.score;

              return (
                <div
                  key={threshold.score}
                  className={`
                    text-center p-2 rounded
                    ${isCurrent ? 'bg-blue-100 border-2 border-blue-400' : isReached ? 'bg-green-100' : 'bg-white border border-gray-200'}
                  `}
                >
                  <div className="text-lg mb-1">{threshold.icon}</div>
                  <div className={`text-xs font-medium ${isReached ? 'text-gray-800' : 'text-gray-400'}`}>
                    {threshold.score}点
                  </div>
                  <div className={`text-[10px] ${isReached ? 'text-gray-600' : 'text-gray-400'}`}>
                    {threshold.label}
                  </div>
                  {isReached && (
                    <div className="text-green-600 mt-1">
                      <svg className="w-3 h-3 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendaScoreDisplay;
