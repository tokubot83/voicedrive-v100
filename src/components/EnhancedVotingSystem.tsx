import { VoteOption, ProposalType, StakeholderCategory } from '../types';
import { proposalTypeConfigs } from '../config/proposalTypes';
import { 
  calculateRawConsensus, 
  calculateWeightedConsensus, 
  getStakeholderBreakdown,
  getConsensusLevel 
} from '../utils/votingCalculations';

interface EnhancedVotingSystemProps {
  postId: string;
  votes: Record<VoteOption, number>;
  votesByStakeholder?: Record<StakeholderCategory, Record<VoteOption, number>>;
  proposalType?: ProposalType;
  selectedVote: VoteOption | null;
  onVote: (option: VoteOption) => void;
}

const EnhancedVotingSystem = ({ 
  votes, 
  votesByStakeholder, 
  proposalType, 
  selectedVote, 
  onVote 
}: EnhancedVotingSystemProps) => {
  const voteOptions = [
    { id: 'strongly-oppose' as VoteOption, emoji: '😠', label: '強く反対', color: 'red' },
    { id: 'oppose' as VoteOption, emoji: '😞', label: '反対', color: 'orange' },
    { id: 'neutral' as VoteOption, emoji: '😐', label: '中立', color: 'gray' },
    { id: 'support' as VoteOption, emoji: '😊', label: '賛成', color: 'green' },
    { id: 'strongly-support' as VoteOption, emoji: '😍', label: '強く賛成', color: 'blue' },
  ];

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const rawConsensus = calculateRawConsensus(votes);
  const weightedConsensus = votesByStakeholder && proposalType 
    ? calculateWeightedConsensus(votesByStakeholder, proposalType)
    : rawConsensus;
  
  const consensusLevel = getConsensusLevel(weightedConsensus);
  const proposalConfig = proposalType ? proposalTypeConfigs[proposalType] : null;
  const stakeholderBreakdown = votesByStakeholder && proposalType 
    ? getStakeholderBreakdown(votesByStakeholder, proposalType)
    : [];

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

  const getStakeholderConsensus = (stakeholderVotes: Record<VoteOption, number>) => {
    const total = Object.values(stakeholderVotes).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    const support = (stakeholderVotes.support || 0) + (stakeholderVotes['strongly-support'] || 0);
    return Math.round((support / total) * 100);
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/8 to-purple-500/8 border border-blue-500/20 rounded-3xl p-6 mt-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(29,155,240,0.5)]">
          🗳️ 合意形成投票
        </h3>
        {proposalType && proposalConfig && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${proposalConfig.borderColor.replace('border-', 'bg-').replace('500', '500/20')} ${proposalConfig.borderColor.replace('border-', 'text-')}`}>
            {proposalConfig.icon} {proposalConfig.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Voting Options */}
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

        {/* Consensus Display and Stakeholder Breakdown */}
        <div className="space-y-6">
          {/* Consensus Scores */}
          <div className="bg-black/30 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">通常合意度</div>
                <div className="text-2xl font-bold text-gray-400">{rawConsensus}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">加重合意度</div>
                <div className={`text-3xl font-bold ${consensusLevel.color}`}>
                  {weightedConsensus}%
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                consensusLevel.level === 'strong' ? 'bg-green-500/20 text-green-400' :
                consensusLevel.level === 'high' ? 'bg-blue-500/20 text-blue-400' :
                consensusLevel.level === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {consensusLevel.label}
              </span>
            </div>
          </div>

          {/* Stakeholder Breakdown */}
          {proposalConfig && stakeholderBreakdown.length > 0 && (
            <div className="bg-black/30 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-gray-400 mb-4">ステークホルダー別投票状況</h4>
              <div className="space-y-3">
                {proposalConfig.weights.map((weight) => {
                  const stakeholder = stakeholderBreakdown.find(s => s.category === weight.category);
                  const consensus = stakeholder ? getStakeholderConsensus(stakeholder.votes) : 0;
                  
                  return (
                    <div key={weight.category} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-300">{weight.label}</span>
                          <span className="text-xs text-gray-500">({weight.description})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">重み: {Math.round(weight.weight * 100)}%</span>
                          <span className="text-sm font-bold text-blue-400">{consensus}%</span>
                        </div>
                      </div>
                      
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${consensus}%` }}
                        />
                      </div>
                      
                      {stakeholder && (
                        <div className="mt-1 text-xs text-gray-600">
                          投票数: {stakeholder.totalVotes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total Votes */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_20px_rgba(29,155,240,0.8)]">
              {totalVotes}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              総投票数
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVotingSystem;