/**
 * 議題モード投票ボタンコンポーネント
 * Phase 4: フロントエンド統合
 */
import React from 'react';
import { VoteOption } from '../../types';

export interface AgendaVoteButtonsProps {
  postId: string;
  currentVote: VoteOption | null;
  onVote: (option: VoteOption) => Promise<void>;
  disabled?: boolean;
  isVoting?: boolean;
}

const voteOptions: { value: VoteOption; label: string; emoji: string; color: string; hoverColor: string; weight: number }[] = [
  { value: 'strongly-support', label: '強く賛成', emoji: '👍👍', color: 'bg-green-600', hoverColor: 'hover:bg-green-700', weight: 10 },
  { value: 'support', label: '賛成', emoji: '👍', color: 'bg-green-500', hoverColor: 'hover:bg-green-600', weight: 5 },
  { value: 'neutral', label: '中立', emoji: '🤝', color: 'bg-gray-500', hoverColor: 'hover:bg-gray-600', weight: 0 },
  { value: 'oppose', label: '反対', emoji: '👎', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600', weight: -5 },
  { value: 'strongly-oppose', label: '強く反対', emoji: '👎👎', color: 'bg-red-600', hoverColor: 'hover:bg-red-700', weight: -10 },
];

export function AgendaVoteButtons({
  postId,
  currentVote,
  onVote,
  disabled = false,
  isVoting = false,
}: AgendaVoteButtonsProps) {
  const handleVote = async (option: VoteOption) => {
    if (isVoting || disabled) return;

    try {
      await onVote(option);
    } catch (error) {
      console.error('投票エラー:', error);
      // エラーはフックで処理されるので、ここでは何もしない
    }
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">この提案に投票してください</div>
        {currentVote && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>投票済み</span>
          </div>
        )}
      </div>

      {/* 投票ボタン */}
      <div className="grid grid-cols-5 gap-2">
        {voteOptions.map((option) => {
          const isSelected = currentVote === option.value;
          const isDisabled = isVoting || disabled;

          return (
            <button
              key={option.value}
              onClick={() => handleVote(option.value)}
              disabled={isDisabled}
              className={`
                relative
                px-3 py-4
                rounded-lg
                text-white
                font-medium
                text-center
                transition-all
                transform
                ${isSelected ? `${option.color} ring-4 ring-blue-300 scale-105` : `${option.color} ${option.hoverColor}`}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                ${isVoting ? 'animate-pulse' : ''}
              `}
              title={`${option.label} (${option.weight > 0 ? '+' : ''}${option.weight}点)`}
            >
              {/* 絵文字 */}
              <div className="text-2xl mb-1">{option.emoji}</div>

              {/* ラベル */}
              <div className="text-xs leading-tight">{option.label}</div>

              {/* 重み付け表示 */}
              <div className="text-[10px] opacity-75 mt-1">
                {option.weight > 0 ? '+' : ''}{option.weight}点
              </div>

              {/* 選択済みインジケーター */}
              {isSelected && (
                <div className="absolute top-1 right-1 bg-white text-green-600 rounded-full w-5 h-5 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ステータスメッセージ */}
      {isVoting && (
        <div className="text-sm text-blue-600 text-center flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>投票を送信中...</span>
        </div>
      )}

      {currentVote && !isVoting && (
        <div className="text-sm text-gray-600 text-center">
          あなたは「{voteOptions.find((o) => o.value === currentVote)?.label}」に投票済みです
          <span className="text-xs text-gray-500 ml-2">(変更も可能です)</span>
        </div>
      )}

      {disabled && !isVoting && (
        <div className="text-sm text-gray-500 text-center bg-gray-100 rounded p-2">
          投票は現在無効です
        </div>
      )}
    </div>
  );
}

export default AgendaVoteButtons;
