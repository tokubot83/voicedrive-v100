// CollaborativeMemberSelectionService - Phase 2 協議式選定
// Level 4-5による施設レベルの協議式メンバー選定機能

import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';
import { HierarchicalUser } from '../types';
import { 
  MemberSelection, 
  MemberCandidate, 
  SelectionCriteria, 
  SelectionResult,
  MemberAssignment,
  MemberRole 
} from '../types/memberSelection';
import BasicMemberSelectionService from './BasicMemberSelectionService';

// 協議式選定関連の型定義
export interface CollaborativeSelection extends MemberSelection {
  stakeholders: StakeholderParticipant[];
  votingRounds: VotingRound[];
  consensusLevel: number;
  professionBalance: ProfessionBalance;
  finalApprover?: string;
  collaborationNotes?: string;
}

export interface StakeholderParticipant {
  userId: string;
  role: StakeholderRole;
  department: string;
  facility: string;
  permissionLevel: PermissionLevel;
  votingWeight: number;
  hasVoted: boolean;
  votedAt?: Date;
}

export type StakeholderRole = 
  | 'FACILITY_HEAD'      // 施設管理者 (Level 4)
  | 'HR_DEPARTMENT_HEAD' // 人事部門長 (Level 5)
  | 'DEPARTMENT_HEAD'    // 部門長
  | 'SENIOR_STAFF'       // 上級職員
  | 'SPECIALIST'         // 専門家
  | 'ADVISOR';           // アドバイザー

export interface VotingRound {
  roundNumber: number;
  startedAt: Date;
  endedAt?: Date;
  votes: StakeholderVote[];
  proposedMembers: ProposedMember[];
  consensusReached: boolean;
  consensusPercentage: number;
}

export interface StakeholderVote {
  stakeholderId: string;
  candidateVotes: CandidateVote[];
  comments?: string;
  votedAt: Date;
}

export interface CandidateVote {
  candidateId: string;
  support: 'STRONGLY_SUPPORT' | 'SUPPORT' | 'NEUTRAL' | 'OPPOSE' | 'STRONGLY_OPPOSE';
  reason?: string;
}

export interface ProposedMember {
  candidateId: string;
  proposedRole: MemberRole;
  supportPercentage: number;
  oppositionPercentage: number;
  averageScore: number;
}

// 職種バランス管理
export interface ProfessionBalance {
  medicalStaff: ProfessionGroup;    // 医療職
  nursingStaff: ProfessionGroup;    // 看護職
  careStaff: ProfessionGroup;       // 介護職
  rehabilitationStaff: ProfessionGroup; // リハビリ職
  administrativeStaff: ProfessionGroup; // 事務職
  technicalStaff: ProfessionGroup;  // 技術職
  balanceScore: number;             // バランススコア (0-100)
}

export interface ProfessionGroup {
  count: number;
  percentage: number;
  minimumRequired: number;
  maximumAllowed: number;
  professions: string[];
}

export interface CollaborationRequest {
  projectId: string;
  initiatorId: string;
  stakeholderIds: string[];
  criteria: SelectionCriteria;
  requiredConsensusLevel: number; // 必要な合意レベル (0-100)
  deadline?: Date;
  notes?: string;
}

export interface CollaborationResult extends SelectionResult {
  collaboration?: CollaborativeSelection;
  votingStatistics?: VotingStatistics;
  professionAnalysis?: ProfessionAnalysis;
}

export interface VotingStatistics {
  totalStakeholders: number;
  participationRate: number;
  averageConsensus: number;
  roundsRequired: number;
  strongSupportCount: number;
  oppositionCount: number;
}

export interface ProfessionAnalysis {
  balanceScore: number;
  recommendations: string[];
  missingProfessions: string[];
  overrepresentedProfessions: string[];
}

/**
 * CollaborativeMemberSelectionService
 * Phase 2: 協議式選定機能
 */
export class CollaborativeMemberSelectionService extends BasicMemberSelectionService {
  private collaborativeSelections: Map<string, CollaborativeSelection> = new Map();
  private votingRounds: Map<string, VotingRound[]> = new Map();

  /**
   * 協議式選定プロセスを開始
   */
  async initiateCollaborativeSelection(
    request: CollaborationRequest
  ): Promise<CollaborationResult> {
    try {
      // 権限検証 (Level 4-5が必要)
      const permissionCheck = await this.validateCollaborationPermission(
        request.initiatorId,
        request.projectId
      );
      
      if (!permissionCheck.hasPermission) {
        return {
          success: false,
          errors: [`協議開始権限がありません: ${permissionCheck.reason}`]
        };
      }

      // ステークホルダーの準備
      const stakeholders = await this.prepareStakeholders(request.stakeholderIds);
      
      // 協議式選定の作成
      const collaboration = await this.createCollaborativeSelection(
        request,
        stakeholders
      );

      // 第1回投票ラウンドの開始
      const firstRound = await this.startVotingRound(collaboration.id, 1);
      
      this.collaborativeSelections.set(collaboration.id, collaboration);
      
      return {
        success: true,
        collaboration,
        recommendations: [
          '協議式選定プロセスが開始されました',
          `${stakeholders.length}名のステークホルダーに投票依頼を送信しました`,
          `期限: ${request.deadline || '設定なし'}`
        ]
      };

    } catch (error) {
      return {
        success: false,
        errors: [`協議開始中にエラーが発生しました: ${error}`]
      };
    }
  }

  /**
   * ステークホルダーによる投票
   */
  async submitStakeholderVote(
    selectionId: string,
    stakeholderId: string,
    votes: CandidateVote[],
    comments?: string
  ): Promise<CollaborationResult> {
    const collaboration = this.collaborativeSelections.get(selectionId);
    if (!collaboration) {
      return {
        success: false,
        errors: ['選定プロセスが見つかりません']
      };
    }

    // ステークホルダーの検証
    const stakeholder = collaboration.stakeholders.find(s => s.userId === stakeholderId);
    if (!stakeholder) {
      return {
        success: false,
        errors: ['投票権限がありません']
      };
    }

    if (stakeholder.hasVoted) {
      return {
        success: false,
        errors: ['既に投票済みです']
      };
    }

    // 現在の投票ラウンドを取得
    const currentRound = this.getCurrentVotingRound(selectionId);
    if (!currentRound) {
      return {
        success: false,
        errors: ['投票ラウンドが開始されていません']
      };
    }

    // 投票を記録
    const vote: StakeholderVote = {
      stakeholderId,
      candidateVotes: votes,
      comments,
      votedAt: new Date()
    };

    currentRound.votes.push(vote);
    stakeholder.hasVoted = true;
    stakeholder.votedAt = new Date();

    // 全員投票したかチェック
    const allVoted = collaboration.stakeholders.every(s => s.hasVoted);
    if (allVoted) {
      await this.processVotingRound(collaboration, currentRound);
    }

    return {
      success: true,
      collaboration,
      votingStatistics: this.calculateVotingStatistics(collaboration)
    };
  }

  /**
   * 部門横断でのメンバー候補取得
   */
  async getCrossDepartmentCandidates(
    facilityId: string,
    criteria: SelectionCriteria
  ): Promise<MemberCandidate[]> {
    const candidates: MemberCandidate[] = [];
    
    // 各部門からの候補者を収集
    const departments = await this.getFacilityDepartments(facilityId);
    
    for (const department of departments) {
      const deptCandidates = await this.getDepartmentCandidates(
        department.id,
        criteria
      );
      
      // 職種バランスを考慮してフィルタリング
      const filteredCandidates = this.filterByProfessionBalance(
        deptCandidates,
        candidates,
        criteria
      );
      
      candidates.push(...filteredCandidates);
    }

    // 推奨スコアで並び替え
    return candidates.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  /**
   * 投票ラウンドの処理
   */
  private async processVotingRound(
    collaboration: CollaborativeSelection,
    round: VotingRound
  ): Promise<void> {
    // 投票結果の集計
    const results = this.aggregateVotes(round.votes, collaboration.stakeholders);
    
    // 合意レベルの計算
    const consensusLevel = this.calculateConsensusLevel(results);
    round.consensusPercentage = consensusLevel;
    collaboration.consensusLevel = consensusLevel;

    // 職種バランスの分析
    const professionBalance = await this.analyzeProfessionBalance(
      results.topCandidates
    );
    collaboration.professionBalance = professionBalance;

    // 合意に達したかチェック
    if (consensusLevel >= (collaboration.selectionReason ? 80 : 60)) {
      round.consensusReached = true;
      round.endedAt = new Date();
      
      // 最終的なメンバー選定
      await this.finalizeCollaborativeSelection(collaboration, results.topCandidates);
    } else {
      // 次のラウンドを開始
      const nextRoundNumber = round.roundNumber + 1;
      if (nextRoundNumber <= 3) { // 最大3ラウンド
        await this.startVotingRound(collaboration.id, nextRoundNumber);
      } else {
        // 3ラウンド後も合意に達しない場合は上位権限者に委ねる
        await this.escalateToHigherAuthority(collaboration);
      }
    }
  }

  /**
   * 協議権限の検証
   */
  private async validateCollaborationPermission(
    userId: string,
    projectId: string
  ): Promise<{ hasPermission: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { hasPermission: false, reason: 'ユーザーが見つかりません' };
    }

    // Level 4-5の権限が必要
    if (user.permissionLevel < PermissionLevel.LEVEL_4 || 
        user.permissionLevel > PermissionLevel.LEVEL_5) {
      return { 
        hasPermission: false, 
        reason: 'レベル4-5の権限が必要です（施設管理者または人事部門長）' 
      };
    }

    return { hasPermission: true };
  }

  /**
   * ステークホルダーの準備
   */
  private async prepareStakeholders(
    stakeholderIds: string[]
  ): Promise<StakeholderParticipant[]> {
    const stakeholders: StakeholderParticipant[] = [];

    for (const id of stakeholderIds) {
      const user = await this.getUser(id);
      if (!user) continue;

      const stakeholder: StakeholderParticipant = {
        userId: id,
        role: this.determineStakeholderRole(user),
        department: user.department,
        facility: user.facility_id || 'default',
        permissionLevel: user.permissionLevel,
        votingWeight: this.calculateVotingWeight(user),
        hasVoted: false
      };

      stakeholders.push(stakeholder);
    }

    return stakeholders;
  }

  /**
   * 投票重みの計算
   */
  private calculateVotingWeight(user: HierarchicalUser): number {
    // 権限レベルに基づく基本重み
    const levelWeight = {
      [PermissionLevel.LEVEL_5]: 3.0, // 人事部門長
      [PermissionLevel.LEVEL_4]: 2.5, // 施設管理者
      [PermissionLevel.LEVEL_3]: 2.0, // 部門長
      [PermissionLevel.LEVEL_2]: 1.5, // 主任
      [PermissionLevel.LEVEL_1]: 1.0  // 一般職員
    };

    return levelWeight[user.permissionLevel] || 1.0;
  }

  /**
   * ステークホルダー役割の決定
   */
  private determineStakeholderRole(user: HierarchicalUser): StakeholderRole {
    switch (user.permissionLevel) {
      case PermissionLevel.LEVEL_5:
        return 'HR_DEPARTMENT_HEAD';
      case PermissionLevel.LEVEL_4:
        return 'FACILITY_HEAD';
      case PermissionLevel.LEVEL_3:
        return 'DEPARTMENT_HEAD';
      case PermissionLevel.LEVEL_2:
        return 'SENIOR_STAFF';
      default:
        return 'ADVISOR';
    }
  }

  /**
   * 職種バランスによるフィルタリング
   */
  private filterByProfessionBalance(
    candidates: MemberCandidate[],
    currentSelection: MemberCandidate[],
    criteria: SelectionCriteria
  ): MemberCandidate[] {
    // 現在の職種分布を分析
    const currentBalance = this.calculateCurrentBalance(currentSelection);
    
    // バランスを改善する候補者を優先
    return candidates.filter(candidate => {
      const profession = this.getProfessionCategory(candidate.user.role);
      const group = currentBalance[profession];
      
      // 不足している職種を優先
      if (group && group.count < group.minimumRequired) {
        candidate.recommendationScore += 20; // ボーナススコア
        return true;
      }
      
      // 過剰な職種は除外
      if (group && group.count >= group.maximumAllowed) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * 職種カテゴリーの判定
   */
  private getProfessionCategory(role: string): keyof ProfessionBalance {
    const roleMap: Record<string, keyof ProfessionBalance> = {
      '医師': 'medicalStaff',
      '薬剤師': 'medicalStaff',
      '看護師': 'nursingStaff',
      '准看護師': 'nursingStaff',
      '介護福祉士': 'careStaff',
      '介護士': 'careStaff',
      '理学療法士': 'rehabilitationStaff',
      '作業療法士': 'rehabilitationStaff',
      '言語聴覚士': 'rehabilitationStaff',
      '事務職員': 'administrativeStaff',
      '管理栄養士': 'technicalStaff',
      '診療放射線技師': 'technicalStaff'
    };

    return roleMap[role] || 'administrativeStaff';
  }

  /**
   * 現在の職種バランスを計算
   */
  private calculateCurrentBalance(
    members: MemberCandidate[]
  ): ProfessionBalance {
    const total = members.length || 1;
    
    const balance: ProfessionBalance = {
      medicalStaff: {
        count: 0,
        percentage: 0,
        minimumRequired: 1,
        maximumAllowed: Math.ceil(total * 0.3),
        professions: ['医師', '薬剤師']
      },
      nursingStaff: {
        count: 0,
        percentage: 0,
        minimumRequired: 2,
        maximumAllowed: Math.ceil(total * 0.4),
        professions: ['看護師', '准看護師']
      },
      careStaff: {
        count: 0,
        percentage: 0,
        minimumRequired: 1,
        maximumAllowed: Math.ceil(total * 0.3),
        professions: ['介護福祉士', '介護士']
      },
      rehabilitationStaff: {
        count: 0,
        percentage: 0,
        minimumRequired: 1,
        maximumAllowed: Math.ceil(total * 0.2),
        professions: ['理学療法士', '作業療法士', '言語聴覚士']
      },
      administrativeStaff: {
        count: 0,
        percentage: 0,
        minimumRequired: 1,
        maximumAllowed: Math.ceil(total * 0.3),
        professions: ['事務職員']
      },
      technicalStaff: {
        count: 0,
        percentage: 0,
        minimumRequired: 0,
        maximumAllowed: Math.ceil(total * 0.2),
        professions: ['管理栄養士', '診療放射線技師']
      },
      balanceScore: 0
    };

    // カウント集計
    members.forEach(member => {
      const category = this.getProfessionCategory(member.user.role);
      if (balance[category]) {
        balance[category].count++;
      }
    });

    // パーセンテージ計算とバランススコア
    let balanceScore = 100;
    Object.values(balance).forEach(group => {
      if (typeof group === 'object' && 'count' in group) {
        group.percentage = (group.count / total) * 100;
        
        // バランススコアの減点
        if (group.count < group.minimumRequired) {
          balanceScore -= 20;
        } else if (group.count > group.maximumAllowed) {
          balanceScore -= 10;
        }
      }
    });
    
    balance.balanceScore = Math.max(0, balanceScore);
    
    return balance;
  }

  /**
   * 投票結果の集計
   */
  private aggregateVotes(
    votes: StakeholderVote[],
    stakeholders: StakeholderParticipant[]
  ): { topCandidates: string[]; scores: Map<string, number> } {
    const candidateScores = new Map<string, number>();

    votes.forEach(vote => {
      const stakeholder = stakeholders.find(s => s.userId === vote.stakeholderId);
      const weight = stakeholder?.votingWeight || 1.0;

      vote.candidateVotes.forEach(cv => {
        const currentScore = candidateScores.get(cv.candidateId) || 0;
        const voteScore = this.getVoteScore(cv.support) * weight;
        candidateScores.set(cv.candidateId, currentScore + voteScore);
      });
    });

    // スコア順でソート
    const sortedCandidates = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([candidateId]) => candidateId);

    return {
      topCandidates: sortedCandidates.slice(0, 10), // 上位10名
      scores: candidateScores
    };
  }

  /**
   * 投票スコアの取得
   */
  private getVoteScore(support: CandidateVote['support']): number {
    const scoreMap = {
      'STRONGLY_SUPPORT': 5,
      'SUPPORT': 3,
      'NEUTRAL': 1,
      'OPPOSE': -3,
      'STRONGLY_OPPOSE': -5
    };
    return scoreMap[support];
  }

  /**
   * 合意レベルの計算
   */
  private calculateConsensusLevel(results: { scores: Map<string, number> }): number {
    const scores = Array.from(results.scores.values());
    if (scores.length === 0) return 0;

    // 標準偏差を計算
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // 合意レベル = 100 - (標準偏差 / 平均 * 100)
    const consensusLevel = Math.max(0, 100 - (stdDev / Math.abs(mean) * 100));
    
    return Math.round(consensusLevel);
  }

  /**
   * 職種バランスの分析
   */
  private async analyzeProfessionBalance(
    candidateIds: string[]
  ): Promise<ProfessionBalance> {
    const candidates: MemberCandidate[] = [];
    
    for (const id of candidateIds) {
      const candidate = await this.getMemberCandidate(id);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    return this.calculateCurrentBalance(candidates);
  }

  /**
   * 協議式選定の最終化
   */
  private async finalizeCollaborativeSelection(
    collaboration: CollaborativeSelection,
    selectedCandidateIds: string[]
  ): Promise<void> {
    // 基本的な選定処理を実行
    const memberIds = selectedCandidateIds;
    const result = await this.selectMembers(
      collaboration.projectId,
      collaboration.selectorId,
      memberIds,
      JSON.parse(collaboration.selectionReason || '{}')
    );

    if (result.success && result.selection) {
      collaboration.status = 'APPROVED';
      collaboration.selectedMembers = result.selection.selectedMembers;
      collaboration.updatedAt = new Date();
    }
  }

  /**
   * 上位権限者へのエスカレーション
   */
  private async escalateToHigherAuthority(
    collaboration: CollaborativeSelection
  ): Promise<void> {
    // Level 6以上への承認依頼
    collaboration.status = 'PENDING_APPROVAL';
    collaboration.collaborationNotes = '3ラウンドの協議後も合意に達せず、上位権限者の判断を仰ぎます';
    
    // 通知を送信（実装は別途）
    console.log('上位権限者へエスカレーション:', collaboration.id);
  }

  /**
   * 協議式選定の作成
   */
  private async createCollaborativeSelection(
    request: CollaborationRequest,
    stakeholders: StakeholderParticipant[]
  ): Promise<CollaborativeSelection> {
    const basicSelection = await this.createMemberSelection(
      request.projectId,
      request.initiatorId,
      [],
      'COLLABORATIVE',
      request.criteria
    );

    const collaboration: CollaborativeSelection = {
      ...basicSelection,
      stakeholders,
      votingRounds: [],
      consensusLevel: 0,
      professionBalance: this.getInitialProfessionBalance(),
      collaborationNotes: request.notes
    };

    return collaboration;
  }

  /**
   * 投票ラウンドの開始
   */
  private async startVotingRound(
    selectionId: string,
    roundNumber: number
  ): Promise<VotingRound> {
    const round: VotingRound = {
      roundNumber,
      startedAt: new Date(),
      votes: [],
      proposedMembers: [],
      consensusReached: false,
      consensusPercentage: 0
    };

    const rounds = this.votingRounds.get(selectionId) || [];
    rounds.push(round);
    this.votingRounds.set(selectionId, rounds);

    // ステークホルダーの投票フラグをリセット
    const collaboration = this.collaborativeSelections.get(selectionId);
    if (collaboration) {
      collaboration.stakeholders.forEach(s => {
        s.hasVoted = false;
        s.votedAt = undefined;
      });
    }

    return round;
  }

  /**
   * 現在の投票ラウンドを取得
   */
  private getCurrentVotingRound(selectionId: string): VotingRound | null {
    const rounds = this.votingRounds.get(selectionId) || [];
    return rounds.find(r => !r.endedAt) || null;
  }

  /**
   * 初期職種バランスを取得
   */
  private getInitialProfessionBalance(): ProfessionBalance {
    return {
      medicalStaff: { count: 0, percentage: 0, minimumRequired: 1, maximumAllowed: 3, professions: [] },
      nursingStaff: { count: 0, percentage: 0, minimumRequired: 2, maximumAllowed: 4, professions: [] },
      careStaff: { count: 0, percentage: 0, minimumRequired: 1, maximumAllowed: 3, professions: [] },
      rehabilitationStaff: { count: 0, percentage: 0, minimumRequired: 1, maximumAllowed: 2, professions: [] },
      administrativeStaff: { count: 0, percentage: 0, minimumRequired: 1, maximumAllowed: 3, professions: [] },
      technicalStaff: { count: 0, percentage: 0, minimumRequired: 0, maximumAllowed: 2, professions: [] },
      balanceScore: 0
    };
  }

  /**
   * 投票統計の計算
   */
  private calculateVotingStatistics(
    collaboration: CollaborativeSelection
  ): VotingStatistics {
    const totalStakeholders = collaboration.stakeholders.length;
    const votedCount = collaboration.stakeholders.filter(s => s.hasVoted).length;
    
    return {
      totalStakeholders,
      participationRate: (votedCount / totalStakeholders) * 100,
      averageConsensus: collaboration.consensusLevel,
      roundsRequired: collaboration.votingRounds.length,
      strongSupportCount: 0, // 実装は詳細な集計が必要
      oppositionCount: 0     // 実装は詳細な集計が必要
    };
  }

  /**
   * 施設の部門リストを取得
   */
  private async getFacilityDepartments(facilityId: string): Promise<{ id: string; name: string }[]> {
    // 実際の実装では、施設の部門データを取得
    return [
      { id: 'dept-1', name: '看護部' },
      { id: 'dept-2', name: 'リハビリテーション部' },
      { id: 'dept-3', name: '薬剤部' },
      { id: 'dept-4', name: '事務部' },
      { id: 'dept-5', name: '栄養科' }
    ];
  }

  // ヘルパーメソッド（親クラスからオーバーライド）
  protected async getUser(userId: string): Promise<HierarchicalUser | null> {
    // 実際の実装では、ユーザーサービスから取得
    return {
      id: userId,
      name: `User ${userId}`,
      department: 'デモ部門',
      role: 'STAFF',
      accountType: 'FACILITY_HEAD',
      permissionLevel: PermissionLevel.LEVEL_4,
      facility_id: 'facility-1'
    };
  }
}

export default CollaborativeMemberSelectionService;