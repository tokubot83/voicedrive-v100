// useCollaborativeSelection Hook - 協議式メンバー選定機能のReactフック
// Phase 2: 施設レベルの協議式選定機能

import { useState, useEffect, useCallback } from 'react';
import { 
  MemberCandidate, 
  SelectionCriteria,
  CollaborativeSelectionData,
  ProfessionDistribution,
  StakeholderVoteData
} from '../types/memberSelection';
import {
  CollaborativeSelection,
  CollaborationRequest,
  CollaborationResult,
  CandidateVote,
  VotingStatistics,
  ProfessionAnalysis,
  StakeholderParticipant
} from '../services/CollaborativeMemberSelectionService';
import CollaborativeMemberSelectionService from '../services/CollaborativeMemberSelectionService';
import { PermissionLevel } from '../permissions/types/PermissionTypes';

interface UseCollaborativeSelectionProps {
  projectId: string;
  initiatorId: string;
  facilityId: string;
}

interface UseCollaborativeSelectionReturn {
  // 状態
  collaboration: CollaborativeSelection | null;
  candidates: MemberCandidate[];
  stakeholders: StakeholderParticipant[];
  votingStatistics: VotingStatistics | null;
  professionAnalysis: ProfessionAnalysis | null;
  loading: boolean;
  error: string | null;
  
  // 協議管理
  initiateCollaboration: (request: CollaborationRequest) => Promise<CollaborationResult>;
  addStakeholder: (userId: string) => void;
  removeStakeholder: (userId: string) => void;
  setConsensusThreshold: (threshold: number) => void;
  
  // 投票機能
  submitVote: (votes: CandidateVote[], comments?: string) => Promise<CollaborationResult>;
  getCurrentVotingRound: () => number;
  getVotingProgress: () => { voted: number; total: number; percentage: number };
  
  // 候補者管理
  loadCrossDepartmentCandidates: () => Promise<void>;
  filterCandidatesByProfession: (profession: string) => void;
  sortCandidates: (criteria: 'recommendation' | 'availability' | 'workload') => void;
  
  // 職種バランス
  getProfessionDistribution: () => ProfessionDistribution;
  checkProfessionBalance: () => { balanced: boolean; recommendations: string[] };
  
  // 結果分析
  getConsensusLevel: () => number;
  getTopCandidates: (count?: number) => MemberCandidate[];
  exportResults: () => CollaborativeSelectionData;
}

/**
 * 協議式メンバー選定機能のカスタムフック
 */
export const useCollaborativeSelection = ({
  projectId,
  initiatorId,
  facilityId
}: UseCollaborativeSelectionProps): UseCollaborativeSelectionReturn => {
  
  // 状態管理
  const [collaboration, setCollaboration] = useState<CollaborativeSelection | null>(null);
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<MemberCandidate[]>([]);
  const [stakeholders, setStakeholders] = useState<StakeholderParticipant[]>([]);
  const [votingStatistics, setVotingStatistics] = useState<VotingStatistics | null>(null);
  const [professionAnalysis, setProfessionAnalysis] = useState<ProfessionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consensusThreshold, setConsensusThreshold] = useState(80);
  const [sortCriteria, setSortCriteria] = useState<'recommendation' | 'availability' | 'workload'>('recommendation');

  // サービスインスタンス
  const service = new CollaborativeMemberSelectionService();

  useEffect(() => {
    initializeCollaborativeSelection();
  }, [projectId, facilityId]);

  /**
   * 初期化処理
   */
  const initializeCollaborativeSelection = async () => {
    await loadCrossDepartmentCandidates();
    await loadDefaultStakeholders();
  };

  /**
   * 部門横断候補者の読み込み
   */
  const loadCrossDepartmentCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const criteria: SelectionCriteria = {
        projectScope: 'FACILITY' as any,
        maxTeamSize: 15
      };

      const candidateList = await service.getCrossDepartmentCandidates(facilityId, criteria);
      setAllCandidates(candidateList);
      setCandidates(candidateList);
      
    } catch (err) {
      setError('候補者の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  /**
   * デフォルトステークホルダーの読み込み
   */
  const loadDefaultStakeholders = async () => {
    // 実際の実装では、施設の管理者リストを取得
    const defaultStakeholders: StakeholderParticipant[] = [
      {
        userId: initiatorId,
        role: 'FACILITY_HEAD',
        department: '施設管理',
        facility: facilityId,
        permissionLevel: PermissionLevel.LEVEL_4,
        votingWeight: 2.5,
        hasVoted: false
      }
    ];
    
    setStakeholders(defaultStakeholders);
  };

  /**
   * 協議プロセスの開始
   */
  const initiateCollaboration = useCallback(async (
    request: CollaborationRequest
  ): Promise<CollaborationResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await service.initiateCollaborativeSelection(request);
      
      if (result.success && result.collaboration) {
        setCollaboration(result.collaboration);
        setStakeholders(result.collaboration.stakeholders);
        
        if (result.votingStatistics) {
          setVotingStatistics(result.votingStatistics);
        }
        
        if (result.professionAnalysis) {
          setProfessionAnalysis(result.professionAnalysis);
        }
      } else {
        setError(result.errors?.join(', ') || '協議開始に失敗しました');
      }

      return result;
      
    } catch (err) {
      const errorMessage = '協議開始中にエラーが発生しました';
      setError(errorMessage);
      return {
        success: false,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ステークホルダーの追加
   */
  const addStakeholder = useCallback((userId: string) => {
    // 実際の実装では、ユーザー情報を取得して適切なステークホルダーオブジェクトを作成
    const newStakeholder: StakeholderParticipant = {
      userId,
      role: 'DEPARTMENT_HEAD',
      department: '部門',
      facility: facilityId,
      permissionLevel: PermissionLevel.LEVEL_3,
      votingWeight: 2.0,
      hasVoted: false
    };
    
    setStakeholders([...stakeholders, newStakeholder]);
  }, [stakeholders, facilityId]);

  /**
   * ステークホルダーの削除
   */
  const removeStakeholder = useCallback((userId: string) => {
    setStakeholders(stakeholders.filter(s => s.userId !== userId));
  }, [stakeholders]);

  /**
   * 投票の送信
   */
  const submitVote = useCallback(async (
    votes: CandidateVote[],
    comments?: string
  ): Promise<CollaborationResult> => {
    if (!collaboration) {
      return {
        success: false,
        errors: ['協議が開始されていません']
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await service.submitStakeholderVote(
        collaboration.id,
        initiatorId,
        votes,
        comments
      );

      if (result.success && result.collaboration) {
        setCollaboration(result.collaboration);
        
        if (result.votingStatistics) {
          setVotingStatistics(result.votingStatistics);
        }
        
        if (result.professionAnalysis) {
          setProfessionAnalysis(result.professionAnalysis);
        }
      } else {
        setError(result.errors?.join(', ') || '投票送信に失敗しました');
      }

      return result;
      
    } catch (err) {
      const errorMessage = '投票処理中にエラーが発生しました';
      setError(errorMessage);
      return {
        success: false,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, [collaboration, initiatorId]);

  /**
   * 現在の投票ラウンドを取得
   */
  const getCurrentVotingRound = useCallback((): number => {
    if (!collaboration) return 0;
    return collaboration.votingRounds.length + 1;
  }, [collaboration]);

  /**
   * 投票進捗を取得
   */
  const getVotingProgress = useCallback((): { voted: number; total: number; percentage: number } => {
    if (!collaboration) {
      return { voted: 0, total: 0, percentage: 0 };
    }

    const voted = collaboration.stakeholders.filter(s => s.hasVoted).length;
    const total = collaboration.stakeholders.length;
    const percentage = total > 0 ? (voted / total) * 100 : 0;

    return { voted, total, percentage };
  }, [collaboration]);

  /**
   * 職種でフィルタリング
   */
  const filterCandidatesByProfession = useCallback((profession: string) => {
    if (profession === 'all') {
      setCandidates(allCandidates);
    } else {
      const filtered = allCandidates.filter(candidate => {
        const role = candidate.user.role.toLowerCase();
        return role.includes(profession.toLowerCase());
      });
      setCandidates(filtered);
    }
  }, [allCandidates]);

  /**
   * 候補者の並べ替え
   */
  const sortCandidates = useCallback((criteria: 'recommendation' | 'availability' | 'workload') => {
    setSortCriteria(criteria);
    
    const sorted = [...candidates].sort((a, b) => {
      switch (criteria) {
        case 'recommendation':
          return b.recommendationScore - a.recommendationScore;
        case 'availability':
          return (b.availability.isAvailable ? 1 : 0) - (a.availability.isAvailable ? 1 : 0);
        case 'workload':
          return a.availability.workloadPercentage - b.availability.workloadPercentage;
        default:
          return 0;
      }
    });
    
    setCandidates(sorted);
  }, [candidates]);

  /**
   * 職種分布を取得
   */
  const getProfessionDistribution = useCallback((): ProfessionDistribution => {
    const distribution: ProfessionDistribution = {
      medical: 0,
      nursing: 0,
      care: 0,
      rehabilitation: 0,
      administrative: 0,
      technical: 0,
      total: 0
    };

    const selectedCandidates = collaboration?.selectedMembers || [];
    
    selectedCandidates.forEach(member => {
      // 実際の実装では、ユーザーの職種情報から判定
      distribution.total++;
    });

    return distribution;
  }, [collaboration]);

  /**
   * 職種バランスをチェック
   */
  const checkProfessionBalance = useCallback((): { balanced: boolean; recommendations: string[] } => {
    const distribution = getProfessionDistribution();
    const recommendations: string[] = [];
    let balanced = true;

    // バランスチェックロジック
    if (distribution.medical === 0) {
      recommendations.push('医療職のメンバーを含めることを推奨します');
      balanced = false;
    }
    
    if (distribution.nursing < 2) {
      recommendations.push('看護職のメンバーを2名以上含めることを推奨します');
      balanced = false;
    }

    if (distribution.administrative === 0) {
      recommendations.push('事務職のメンバーを含めることを推奨します');
      balanced = false;
    }

    return { balanced, recommendations };
  }, [getProfessionDistribution]);

  /**
   * 合意レベルを取得
   */
  const getConsensusLevel = useCallback((): number => {
    return collaboration?.consensusLevel || 0;
  }, [collaboration]);

  /**
   * 上位候補者を取得
   */
  const getTopCandidates = useCallback((count: number = 10): MemberCandidate[] => {
    if (!collaboration || !collaboration.selectedMembers) {
      return candidates.slice(0, count);
    }

    const selectedIds = collaboration.selectedMembers.map(m => m.userId);
    return allCandidates
      .filter(c => selectedIds.includes(c.user.id))
      .slice(0, count);
  }, [collaboration, candidates, allCandidates]);

  /**
   * 結果をエクスポート
   */
  const exportResults = useCallback((): CollaborativeSelectionData => {
    const progress = getVotingProgress();
    
    return {
      stakeholderCount: stakeholders.length,
      votingRounds: getCurrentVotingRound(),
      consensusLevel: getConsensusLevel(),
      professionBalanceScore: collaboration?.professionBalance?.balanceScore || 0,
      participationRate: progress.percentage
    };
  }, [
    stakeholders,
    getCurrentVotingRound,
    getConsensusLevel,
    getVotingProgress,
    collaboration
  ]);

  return {
    // 状態
    collaboration,
    candidates,
    stakeholders,
    votingStatistics,
    professionAnalysis,
    loading,
    error,
    
    // 協議管理
    initiateCollaboration,
    addStakeholder,
    removeStakeholder,
    setConsensusThreshold,
    
    // 投票機能
    submitVote,
    getCurrentVotingRound,
    getVotingProgress,
    
    // 候補者管理
    loadCrossDepartmentCandidates,
    filterCandidatesByProfession,
    sortCandidates,
    
    // 職種バランス
    getProfessionDistribution,
    checkProfessionBalance,
    
    // 結果分析
    getConsensusLevel,
    getTopCandidates,
    exportResults
  };
};

export default useCollaborativeSelection;