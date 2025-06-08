interface EchoProposal {
  id: string;
  originalId: string;
  title: string;
  content: string;
  type: string;
  season: string;
  createdAt: Date;
  tags: string[];
  votingWeight: number;
  similarityScore?: number;
}

export class ProposalEchoService {
  private pastProposals: Map<string, EchoProposal[]> = new Map();

  constructor() {
    this.loadHistoricalData();
  }

  private loadHistoricalData() {
    const mockData: EchoProposal[] = [
      {
        id: 'echo-1',
        originalId: 'proposal-2023-spring-01',
        title: '新人研修プログラムの改善',
        content: '新年度の新人研修をより効果的にするための提案',
        type: 'improvement',
        season: 'spring',
        createdAt: new Date('2023-04-15'),
        tags: ['研修', '新人教育', '組織開発'],
        votingWeight: 85
      },
      {
        id: 'echo-2',
        originalId: 'proposal-2023-summer-01',
        title: '夏期の業務効率化施策',
        content: '暑い時期の業務負荷軽減と効率化',
        type: 'improvement',
        season: 'summer',
        createdAt: new Date('2023-07-20'),
        tags: ['効率化', '労働環境', '夏期対策'],
        votingWeight: 92
      },
      {
        id: 'echo-3',
        originalId: 'proposal-2023-autumn-01',
        title: '年度評価システムの見直し',
        content: '公平で透明性の高い評価制度の構築',
        type: 'problem',
        season: 'autumn',
        createdAt: new Date('2023-10-10'),
        tags: ['評価制度', '人事', '公平性'],
        votingWeight: 78
      }
    ];

    mockData.forEach(proposal => {
      const key = `${proposal.season}-${proposal.type}`;
      if (!this.pastProposals.has(key)) {
        this.pastProposals.set(key, []);
      }
      this.pastProposals.get(key)!.push(proposal);
    });
  }

  findSimilarProposals(currentSeason: string, proposalType: string, keywords: string[] = []): EchoProposal[] {
    const key = `${currentSeason}-${proposalType}`;
    const seasonalProposals = this.pastProposals.get(key) || [];
    
    const allSeasonKey = `all-${proposalType}`;
    const allSeasonProposals = this.pastProposals.get(allSeasonKey) || [];
    
    const combinedProposals = [...seasonalProposals, ...allSeasonProposals];

    if (keywords.length === 0) {
      return combinedProposals
        .sort((a, b) => b.votingWeight - a.votingWeight)
        .slice(0, 3);
    }

    const scoredProposals = combinedProposals.map(proposal => {
      let score = 0;
      
      keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        if (proposal.title.toLowerCase().includes(lowerKeyword)) score += 3;
        if (proposal.content.toLowerCase().includes(lowerKeyword)) score += 2;
        if (proposal.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) score += 1;
      });

      if (proposal.season === currentSeason) score += 2;
      
      score += proposal.votingWeight / 20;

      return {
        ...proposal,
        similarityScore: score
      };
    });

    return scoredProposals
      .filter(p => p.similarityScore! > 0)
      .sort((a, b) => b.similarityScore! - a.similarityScore!)
      .slice(0, 3);
  }

  reviveProposal(echoProposal: EchoProposal, newContent: string, userId: string) {
    const revivedProposal = {
      id: `revival-${Date.now()}`,
      originalEchoId: echoProposal.id,
      title: `【再提案】${echoProposal.title}`,
      content: newContent,
      type: echoProposal.type,
      season: new Date().getMonth() < 3 || new Date().getMonth() >= 12 ? 'winter' :
              new Date().getMonth() < 6 ? 'spring' :
              new Date().getMonth() < 9 ? 'summer' : 'autumn',
      createdAt: new Date(),
      createdBy: userId,
      tags: [...echoProposal.tags, '再提案', '改善版'],
      baseVotingWeight: echoProposal.votingWeight * 0.8,
      status: 'active',
      metadata: {
        originalProposalId: echoProposal.originalId,
        originalSeason: echoProposal.season,
        originalVotingWeight: echoProposal.votingWeight,
        revivalReason: 'seasonal_echo'
      }
    };

    console.log('Revived proposal:', revivedProposal);
    return revivedProposal;
  }

  analyzeSeasonalTrends(season: string) {
    const seasonalData: EchoProposal[] = [];
    
    this.pastProposals.forEach((proposals, key) => {
      if (key.startsWith(season)) {
        seasonalData.push(...proposals);
      }
    });

    const typeDistribution = seasonalData.reduce((acc, proposal) => {
      acc[proposal.type] = (acc[proposal.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTags = seasonalData
      .flatMap(p => p.tags)
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const sortedTags = Object.entries(topTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    const averageVotingWeight = seasonalData.length > 0
      ? seasonalData.reduce((sum, p) => sum + p.votingWeight, 0) / seasonalData.length
      : 0;

    return {
      season,
      totalProposals: seasonalData.length,
      typeDistribution,
      topTags: sortedTags,
      averageVotingWeight: Math.round(averageVotingWeight),
      trend: this.calculateTrend(seasonalData)
    };
  }

  private calculateTrend(proposals: EchoProposal[]) {
    if (proposals.length < 2) return 'stable';
    
    const sorted = proposals.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const recentAvg = sorted.slice(-3).reduce((sum, p) => sum + p.votingWeight, 0) / 3;
    const olderAvg = sorted.slice(0, 3).reduce((sum, p) => sum + p.votingWeight, 0) / 3;
    
    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  }
}