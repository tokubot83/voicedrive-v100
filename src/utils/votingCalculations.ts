import { VoteOption, StakeholderCategory, ProposalType } from '../types';
import { proposalTypeConfigs } from '../config/proposalTypes';

interface VoteCount {
  option: VoteOption;
  count: number;
}

interface StakeholderVotes {
  category: StakeholderCategory;
  votes: Record<VoteOption, number>;
  totalVotes: number;
}

// Calculate raw consensus score (unweighted)
export const calculateRawConsensus = (votes: Record<VoteOption, number>): number => {
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  
  if (totalVotes === 0) return 0;
  
  const supportVotes = (votes.support || 0) + (votes['strongly-support'] || 0);
  return Math.round((supportVotes / totalVotes) * 100);
};

// Calculate weighted consensus based on proposal type
export const calculateWeightedConsensus = (
  votesByStakeholder: Record<StakeholderCategory, Record<VoteOption, number>>,
  proposalType: ProposalType
): number => {
  const config = proposalTypeConfigs[proposalType];
  if (!config) return 0;
  
  let weightedSupport = 0;
  let totalWeightedVotes = 0;
  
  config.weights.forEach(({ category, weight }) => {
    const stakeholderVotes = votesByStakeholder[category];
    if (!stakeholderVotes) return;
    
    const totalVotes = Object.values(stakeholderVotes).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return;
    
    const supportVotes = (stakeholderVotes.support || 0) + (stakeholderVotes['strongly-support'] || 0);
    const supportPercentage = supportVotes / totalVotes;
    
    weightedSupport += supportPercentage * weight * totalVotes;
    totalWeightedVotes += weight * totalVotes;
  });
  
  if (totalWeightedVotes === 0) return 0;
  
  return Math.round((weightedSupport / totalWeightedVotes) * 100);
};

// Get stakeholder breakdown for visualization
export const getStakeholderBreakdown = (
  votesByStakeholder: Record<StakeholderCategory, Record<VoteOption, number>>,
  proposalType: ProposalType
): StakeholderVotes[] => {
  const config = proposalTypeConfigs[proposalType];
  if (!config) return [];
  
  return config.weights.map(({ category }) => {
    const votes = votesByStakeholder[category] || {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 0,
      'support': 0,
      'strongly-support': 0
    };
    
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    return {
      category,
      votes,
      totalVotes
    };
  });
};

// Calculate consensus level
export const getConsensusLevel = (consensusScore: number): {
  level: 'low' | 'moderate' | 'high' | 'strong';
  label: string;
  color: string;
} => {
  if (consensusScore >= 80) {
    return { level: 'strong', label: '強い合意形成', color: 'text-green-400' };
  } else if (consensusScore >= 60) {
    return { level: 'high', label: '合意形成中', color: 'text-blue-400' };
  } else if (consensusScore >= 40) {
    return { level: 'moderate', label: '議論継続中', color: 'text-yellow-400' };
  } else {
    return { level: 'low', label: '意見分散', color: 'text-red-400' };
  }
};

// Generate sample votes by stakeholder (for demo)
export const generateSampleVotesByStakeholder = (
  totalVotes: Record<VoteOption, number>
): Record<StakeholderCategory, Record<VoteOption, number>> => {
  const stakeholders: StakeholderCategory[] = ['frontline', 'management', 'veteran', 'zGen'];
  const result: Record<StakeholderCategory, Record<VoteOption, number>> = {} as any;
  
  // Distribute votes with some variation by stakeholder type
  stakeholders.forEach((stakeholder) => {
    const votes: Record<VoteOption, number> = {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 0,
      'support': 0,
      'strongly-support': 0
    };
    
    // Create different voting patterns for each stakeholder group
    const bias = {
      frontline: { support: 1.2, oppose: 0.8 },
      management: { support: 1.0, oppose: 1.0 },
      veteran: { support: 0.9, oppose: 1.1 },
      zGen: { support: 1.3, oppose: 0.7 }
    }[stakeholder];
    
    // Distribute votes with bias
    Object.entries(totalVotes).forEach(([option, count]) => {
      if (count > 0) {
        const isSupport = option === 'support' || option === 'strongly-support';
        const isOppose = option === 'oppose' || option === 'strongly-oppose';
        
        let distribution = Math.floor(count / 4); // Base distribution
        
        if (isSupport) distribution = Math.floor(distribution * bias.support);
        if (isOppose) distribution = Math.floor(distribution * bias.oppose);
        
        votes[option as VoteOption] = Math.max(1, distribution);
      }
    });
    
    result[stakeholder] = votes;
  });
  
  return result;
};