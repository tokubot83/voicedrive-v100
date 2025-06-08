import { VoteOption } from '../types';

interface EnhancedVotingSystemProps {
  postId: string;
  votes: Record<VoteOption, number>;
  selectedVote: VoteOption | null;
  onVote: (option: VoteOption) => void;
}

const EnhancedVotingSystem = ({ votes, selectedVote, onVote }: EnhancedVotingSystemProps) => {
  const voteOptions = [
    { id: 'strongly-oppose' as VoteOption, emoji: '😡', label: '強く反対', color: '#dc2626' },
    { id: 'oppose' as VoteOption, emoji: '😕', label: '反対', color: '#ff7a00' },
    { id: 'neutral' as VoteOption, emoji: '😐', label: '中立', color: '#71767b' },
    { id: 'support' as VoteOption, emoji: '😊', label: '賛成', color: '#00ba7c' },
    { id: 'strongly-support' as VoteOption, emoji: '😍', label: '強く賛成', color: '#1d9bf0' },
  ];

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const positiveVotes = votes.support + votes['strongly-support'];
  const consensusRatio = totalVotes > 0 ? positiveVotes / totalVotes : 0;
  const consensusPercentage = Math.round(consensusRatio * 100);

  // 参照HTMLから移植した合意度判定ロジック
  const getConsensusLabel = (ratio: number) => {
    if (ratio >= 0.8) return "STRONG POSITIVE";
    if (ratio >= 0.6) return "POSITIVE"; 
    if (ratio >= 0.4) return "NEUTRAL";
    if (ratio >= 0.2) return "NEGATIVE";
    return "STRONG NEGATIVE";
  };

  const getConsensusStatus = (ratio: number) => {
    if (ratio >= 0.8) return "高い支持でプロジェクト化達成";
    if (ratio >= 0.6) return "賛成多数で推進可能";
    if (ratio >= 0.4) return "意見が分かれています";
    if (ratio >= 0.2) return "反対意見が多数";
    return "強い反対で実現困難";
  };

  // 円グラフのセグメント計算
  const calculateSegments = () => {
    if (totalVotes === 0) return '';
    
    let currentAngle = 0;
    const segments: string[] = [];
    
    voteOptions.forEach((option) => {
      const voteCount = votes[option.id];
      const angle = (voteCount / totalVotes) * 360;
      const endAngle = currentAngle + angle;
      
      if (angle > 0) {
        segments.push(`${option.color} ${currentAngle}deg ${endAngle}deg`);
      }
      
      currentAngle = endAngle;
    });
    
    return `conic-gradient(from 0deg, ${segments.join(', ')})`;
  };

  const getVoteOptionStyles = (optionId: VoteOption, color: string) => {
    const isSelected = selectedVote === optionId;
    const baseClass = "w-full flex items-center justify-between p-4 border-2 rounded-2xl bg-white/5 transition-all duration-400 relative overflow-hidden group";
    
    if (isSelected) {
      return `${baseClass} border-[${color}] bg-gradient-to-r from-[${color}] to-[${color}]/80 text-white transform translate-x-3 scale-105 shadow-[0_8px_30px_rgba(29,155,240,0.4)]`;
    }
    
    return `${baseClass} border-[${color}]/40 hover:border-[${color}] hover:bg-gradient-to-r hover:from-[${color}]/15 hover:to-[${color}]/5 hover:transform hover:translate-x-2 hover:scale-102`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/8 to-purple-500/8 border border-blue-500/20 rounded-3xl p-6 mt-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(29,155,240,0.5)]">
          🎯 あなたの意見を聞かせてください
        </h3>
        <span className="px-4 py-2 rounded-3xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_4px_15px_rgba(0,186,124,0.3)] animate-pulse">
          合意度: {consensusPercentage}%
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 投票オプション */}
        <div className="space-y-3">
          {voteOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              className={getVoteOptionStyles(option.id, option.color)}
              style={{
                borderColor: selectedVote === option.id ? option.color : `${option.color}40`,
                background: selectedVote === option.id 
                  ? `linear-gradient(45deg, ${option.color}, ${option.color}CC)`
                  : undefined
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
              
              <div className="relative z-10 flex items-center gap-4">
                <span className="text-3xl drop-shadow-[0_0_8px_currentColor] group-hover:scale-120 group-hover:drop-shadow-[0_0_12px_currentColor] transition-all duration-300"
                      style={{ color: option.color }}>
                  {option.emoji}
                </span>
                <span className="text-lg font-semibold">{option.label}</span>
              </div>
              
              <div className={`
                min-w-[50px] h-10 rounded-xl flex items-center justify-center
                font-bold text-xl transition-all duration-300
                ${selectedVote === option.id ? 'bg-white/20' : ''}
              `}
                style={{
                  backgroundColor: selectedVote === option.id ? 'rgba(255,255,255,0.2)' : `${option.color}20`,
                  color: option.color
                }}>
                {votes[option.id]}
              </div>
            </button>
          ))}
        </div>

        {/* 視覚化パネル（参照HTMLから完全移植） */}
        <div className="flex flex-col items-center">
          <div className="relative w-52 h-52 mb-5">
            <div 
              className="w-full h-full rounded-full p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              style={{ background: calculateSegments() || 'conic-gradient(from 0deg, #71767b 0deg 360deg)' }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl flex flex-col items-center justify-center border-2 border-white/10">
                <div className="text-5xl font-bold text-blue-400 drop-shadow-[0_0_20px_rgba(29,155,240,0.8)] mb-2">
                  {totalVotes}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  総意見数
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-5 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-2xl border border-blue-500/20 w-full max-w-[280px]">
            <div className="text-2xl font-bold mb-2 drop-shadow-[0_0_15px_rgba(0,186,124,0.6)]"
                 style={{ color: consensusRatio >= 0.6 ? '#00ba7c' : '#71767b' }}>
              {getConsensusLabel(consensusRatio)}
            </div>
            <div className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 font-semibold">
              {getConsensusStatus(consensusRatio)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVotingSystem;