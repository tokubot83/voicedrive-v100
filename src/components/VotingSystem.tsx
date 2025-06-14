import { VoteOption } from '../types';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';

interface VotingSystemProps {
  postId: string;
  votes: Record<VoteOption, number>;
  selectedVote: VoteOption | null;
  onVote: (option: VoteOption) => void;
}

const VotingSystem = ({ votes, selectedVote, onVote, postId }: VotingSystemProps) => {
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();
  const voteOptions = [
    { id: 'strongly-oppose' as VoteOption, emoji: '😠', label: '強く反対', color: 'red' },
    { id: 'oppose' as VoteOption, emoji: '😞', label: '反対', color: 'orange' },
    { id: 'neutral' as VoteOption, emoji: '😐', label: '中立', color: 'gray' },
    { id: 'support' as VoteOption, emoji: '😊', label: '賛成', color: 'green' },
    { id: 'strongly-support' as VoteOption, emoji: '😍', label: '強く賛成', color: 'blue' },
  ];

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const consensusScore = totalVotes > 0 
    ? Math.round(((votes.support + votes['strongly-support']) / totalVotes) * 100)
    : 0;
  
  // スコア計算
  const currentScore = calculateScore(convertVotesToEngagements(votes));

  const getVoteStyle = (option: typeof voteOptions[0], isSelected: boolean) => {
    const baseStyles = {
      red: 'border-red-500/40 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-500/15 hover:to-red-500/5',
      orange: 'border-orange-500/40 hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-500/15 hover:to-orange-500/5',
      gray: 'border-gray-500/40 hover:border-gray-500 hover:bg-gradient-to-r hover:from-gray-500/15 hover:to-gray-500/5',
      green: 'border-green-500/40 hover:border-green-500 hover:bg-gradient-to-r hover:from-green-500/15 hover:to-green-500/5',
      blue: 'border-blue-500/40 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500/15 hover:to-blue-500/5',
    };

    const selectedStyles = {
      red: 'border-red-500 bg-gradient-to-r from-red-500 to-red-600 text-white',
      orange: 'border-orange-500 bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      gray: 'border-gray-500 bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      green: 'border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white',
      blue: 'border-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    };

    return isSelected ? selectedStyles[option.color] : baseStyles[option.color];
  };

  const getCountStyle = (color: string) => {
    const styles = {
      red: 'bg-red-500/20 text-red-400',
      orange: 'bg-orange-500/20 text-orange-400',
      gray: 'bg-gray-500/20 text-gray-400',
      green: 'bg-green-500/20 text-green-400',
      blue: 'bg-blue-500/20 text-blue-400',
    };
    return styles[color];
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/8 to-purple-500/8 border border-blue-500/20 rounded-3xl p-6 mt-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(29,155,240,0.5)]">
          🗳️ 合意形成投票
        </h3>
        {consensusScore >= 70 && (
          <span className="px-4 py-2 rounded-3xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_4px_15px_rgba(0,186,124,0.3)] animate-pulse-green">
            合意形成中 {consensusScore}%
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          {voteOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              className={`
                w-full flex items-center justify-between p-4 border-2 rounded-2xl
                bg-white/5 transition-all duration-400 relative overflow-hidden group
                ${getVoteStyle(option, selectedVote === option.id)}
                ${selectedVote === option.id ? 'transform translate-x-3 scale-105 shadow-[0_8px_30px_rgba(29,155,240,0.4)]' : 'hover:transform hover:translate-x-2 hover:scale-102'}
              `}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
              
              <div className="relative z-10 flex items-center gap-4">
                <span className="text-3xl drop-shadow-[0_0_8px_currentColor] group-hover:scale-120 group-hover:drop-shadow-[0_0_12px_currentColor] transition-all duration-300">
                  {option.emoji}
                </span>
                <span className="text-lg font-semibold">{option.label}</span>
              </div>
              
              <div className={`
                min-w-[50px] h-10 rounded-xl flex items-center justify-center
                font-bold text-xl transition-all duration-300
                ${selectedVote === option.id ? 'bg-white/20' : getCountStyle(option.color)}
              `}>
                {votes[option.id]}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center">
          {/* 緊急スコア表示 */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500 rounded-xl p-4 mb-4 w-full">
            <div className="text-center">
              <div className="text-orange-300 font-bold text-sm mb-1">🚨 スコア表示テスト</div>
              <div className="text-white text-2xl font-bold">現在スコア: {Math.round(currentScore)}点</div>
              <div className="text-orange-200 text-xs mt-1">Post ID: {postId}</div>
            </div>
          </div>
          
          <div className="relative w-48 h-48 mb-5">
            <div className="absolute inset-0 rounded-full bg-gradient-conic from-red-500 via-yellow-500 via-gray-500 via-green-500 to-blue-500 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl flex flex-col items-center justify-center border-2 border-white/10">
                <div className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_20px_rgba(29,155,240,0.8)] mb-2">
                  {totalVotes}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  投票数
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-5 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-2xl border border-blue-500/20 w-full max-w-[280px]">
            <div className="text-3xl font-bold text-green-400 mb-2 drop-shadow-[0_0_15px_rgba(0,186,124,0.6)]">
              {consensusScore}%
            </div>
            <div className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 font-semibold">
              {consensusScore >= 70 ? '合意形成進行中' : '議論継続中'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingSystem;