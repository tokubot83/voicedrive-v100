import { useMemo } from 'react';
import { ProjectScoringEngine, EngagementData, UserWeight } from '../../utils/ProjectScoring';

export const useProjectScoring = () => {
  const scoringEngine = useMemo(() => new ProjectScoringEngine(), []);
  
  // デモ用のユーザー重みデータ（実際の実装ではAPIから取得）
  const userWeights = useMemo(() => {
    return ProjectScoringEngine.generateDemoUserWeights(100);
  }, []);
  
  const calculateScore = (engagements: EngagementData[], proposalType?: string) => {
    return scoringEngine.calculateProjectScore(engagements, userWeights);
  };
  
  const getStatusConfig = (score: number, postType: 'improvement' | 'community' | 'report') => {
    return scoringEngine.getProjectStatus(score, postType);
  };
  
  const getThresholdName = (threshold: number) => {
    return scoringEngine.getThresholdName(threshold);
  };
  
  // 既存の投票データをEngagementDataに変換
  const convertVotesToEngagements = (votes: Record<string, number>): EngagementData[] => {
    const engagements: EngagementData[] = [];
    const voteTypes = ['strongly-oppose', 'oppose', 'neutral', 'support', 'strongly-support'] as const;
    
    // votesがnullまたはundefinedの場合、空の配列を返す
    if (!votes || typeof votes !== 'object') {
      return [];
    }
    
    let userIndex = 0;
    voteTypes.forEach(voteType => {
      const count = votes[voteType] || 0;
      for (let i = 0; i < count; i++) {
        engagements.push({
          userId: `user_${userIndex % 100}`, // 0-99の範囲で循環
          level: voteType,
          timestamp: new Date()
        });
        userIndex++;
      }
    });
    
    return engagements;
  };
  
  return {
    calculateScore,
    getStatusConfig,
    getThresholdName,
    convertVotesToEngagements
  };
};