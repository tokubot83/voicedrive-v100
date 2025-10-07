/**
 * 自動プロジェクト化サービス
 *
 * 議題モードで一定スコアに達したアイデアボイスを
 * プロジェクトモードのプロジェクトに自動変換
 */

import {
  ProjectizationProposal,
  ProjectizationApproval,
  ProjectizationStatus,
  ProjectizationStats,
  ProjectizationHistory,
  getProjectLevelFromScore,
  getBudgetLimitFromLevel,
  getRecommendedDurationFromLevel,
  getRecommendedTeamSizeFromLevel,
  getRequiredApproverLevelFromProjectLevel,
  getPriorityFromScore
} from '../types/autoProjectization';
import { Post, User } from '../types';
import { ProjectLevel } from '../types/visibility';

class AutoProjectizationService {
  private proposals: Map<string, ProjectizationProposal> = new Map();
  private history: Map<string, ProjectizationHistory[]> = new Map();

  /**
   * すべての提案を取得
   */
  getAllProposals(): ProjectizationProposal[] {
    return Array.from(this.proposals.values()).sort((a, b) => {
      // 優先度順
      const priorityOrder = { urgent: 1, high: 2, normal: 3, low: 4 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // スコア降順
      return b.currentScore - a.currentScore;
    });
  }

  /**
   * ステータス別に取得
   */
  getProposalsByStatus(status: ProjectizationStatus): ProjectizationProposal[] {
    return this.getAllProposals().filter(p => p.status === status);
  }

  /**
   * 承認待ち提案を取得
   */
  getPendingApprovals(): ProjectizationProposal[] {
    return this.getProposalsByStatus('pending_review');
  }

  /**
   * 適格な投稿を取得
   */
  getEligibleProposals(): ProjectizationProposal[] {
    return this.getProposalsByStatus('eligible');
  }

  /**
   * IDで提案を取得
   */
  getProposalById(id: string): ProjectizationProposal | null {
    return this.proposals.get(id) || null;
  }

  /**
   * 投稿IDで提案を取得
   */
  getProposalByPostId(postId: string): ProjectizationProposal | null {
    return Array.from(this.proposals.values()).find(p => p.postId === postId) || null;
  }

  /**
   * 適格な投稿を検出（スコアが閾値に達した投稿）
   */
  detectEligiblePosts(posts: Post[]): Post[] {
    return posts.filter(post => {
      const score = this.getPostScore(post);
      const level = getProjectLevelFromScore(score);

      // PENDINGでないレベルに達している = 適格
      return level !== 'PENDING' && !this.getProposalByPostId(post.id);
    });
  }

  /**
   * プロジェクト化提案を作成
   */
  createProposal(post: Post, detectorUser?: User): ProjectizationProposal {
    const score = this.getPostScore(post);
    const level = getProjectLevelFromScore(score);
    const priority = getPriorityFromScore(score);

    // 投票情報を計算
    const totalVotes = Object.values(post.votes || {}).reduce((sum, count) => sum + count, 0);
    const supportVotes = (post.votes?.['strongly-support'] || 0) + (post.votes?.['support'] || 0);
    const supportRate = totalVotes > 0 ? Math.round((supportVotes / totalVotes) * 100) : 0;

    // 推定参加率（仮定：組織の10%が投票）
    const participationRate = 10;

    const proposal: ProjectizationProposal = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      postId: post.id,
      post,
      currentScore: score,
      threshold: this.getThresholdForLevel(level),
      achievedLevel: level,
      proposedDate: new Date(),
      status: 'eligible',
      priority,
      projectEstimate: {
        projectLevel: level,
        estimatedDuration: getRecommendedDurationFromLevel(level),
        estimatedBudget: getBudgetLimitFromLevel(level),
        recommendedTeamSize: getRecommendedTeamSizeFromLevel(level),
        requiredApproverLevel: getRequiredApproverLevelFromProjectLevel(level)
      },
      autoDetectedDate: new Date(),
      supportRate,
      totalVotes,
      participationRate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.proposals.set(proposal.id, proposal);
    this.addHistory(proposal.id, {
      proposalId: proposal.id,
      action: 'created',
      performedBy: detectorUser?.id || 'system',
      performedByName: detectorUser?.name || 'システム自動検出',
      timestamp: new Date(),
      details: `スコア${score}点でプロジェクトレベル${level}に達しました`,
      newStatus: 'eligible'
    });

    return proposal;
  }

  /**
   * 提案を承認
   */
  approveProposal(
    proposalId: string,
    approval: ProjectizationApproval
  ): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return false;

    proposal.status = 'approved';
    proposal.reviewedDate = new Date();
    proposal.reviewedBy = approval.approverName;
    proposal.reviewComment = approval.comment;
    proposal.updatedAt = new Date();

    this.proposals.set(proposalId, proposal);
    this.addHistory(proposalId, {
      proposalId,
      action: 'approved',
      performedBy: approval.approverId,
      performedByName: approval.approverName,
      timestamp: approval.timestamp,
      details: approval.comment,
      previousStatus: 'pending_review',
      newStatus: 'approved'
    });

    // 承認後、プロジェクトに変換
    if (approval.projectSettings) {
      this.convertToProject(proposalId, approval.projectSettings);
    }

    return true;
  }

  /**
   * 提案を却下
   */
  rejectProposal(
    proposalId: string,
    approverId: string,
    approverName: string,
    reason: string
  ): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return false;

    proposal.status = 'rejected';
    proposal.reviewedDate = new Date();
    proposal.reviewedBy = approverName;
    proposal.rejectionReason = reason;
    proposal.updatedAt = new Date();

    this.proposals.set(proposalId, proposal);
    this.addHistory(proposalId, {
      proposalId,
      action: 'rejected',
      performedBy: approverId,
      performedByName: approverName,
      timestamp: new Date(),
      details: reason,
      previousStatus: 'pending_review',
      newStatus: 'rejected'
    });

    return true;
  }

  /**
   * レビュー開始
   */
  startReview(
    proposalId: string,
    approverId: string,
    approverName: string
  ): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return false;

    proposal.status = 'pending_review';
    proposal.assignedApproverId = approverId;
    proposal.assignedApproverName = approverName;
    proposal.updatedAt = new Date();

    this.proposals.set(proposalId, proposal);
    this.addHistory(proposalId, {
      proposalId,
      action: 'reviewed',
      performedBy: approverId,
      performedByName: approverName,
      timestamp: new Date(),
      details: 'レビューを開始しました',
      previousStatus: 'eligible',
      newStatus: 'pending_review'
    });

    return true;
  }

  /**
   * プロジェクトに変換
   */
  private convertToProject(
    proposalId: string,
    projectSettings: ProjectizationApproval['projectSettings']
  ): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return false;

    // プロジェクトIDを生成（実際の実装ではプロジェクト作成APIを呼ぶ）
    const projectId = `project_${Date.now()}`;

    proposal.status = 'converted';
    proposal.projectId = projectId;
    proposal.convertedDate = new Date();
    proposal.updatedAt = new Date();

    this.proposals.set(proposalId, proposal);
    this.addHistory(proposalId, {
      proposalId,
      action: 'converted',
      performedBy: 'system',
      performedByName: 'システム',
      timestamp: new Date(),
      details: `プロジェクトID: ${projectId}`,
      previousStatus: 'approved',
      newStatus: 'converted'
    });

    return true;
  }

  /**
   * 統計情報を取得
   */
  getStats(): ProjectizationStats {
    const all = this.getAllProposals();

    const byStatus = {
      eligible: this.getProposalsByStatus('eligible').length,
      pending_review: this.getProposalsByStatus('pending_review').length,
      approved: this.getProposalsByStatus('approved').length,
      rejected: this.getProposalsByStatus('rejected').length,
      converted: this.getProposalsByStatus('converted').length
    };

    const byLevel: Record<ProjectLevel, number> = {
      PENDING: 0,
      TEAM: 0,
      DEPARTMENT: 0,
      FACILITY: 0,
      ORGANIZATION: 0,
      STRATEGIC: 0
    };

    all.forEach(p => {
      byLevel[p.achievedLevel]++;
    });

    // 今月の変換数
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthConversions = all.filter(p =>
      p.convertedDate && p.convertedDate >= thisMonthStart
    ).length;

    // 平均レビュー時間
    const reviewedProposals = all.filter(p => p.reviewedDate && p.proposedDate);
    let totalReviewDays = 0;
    reviewedProposals.forEach(p => {
      if (p.reviewedDate && p.proposedDate) {
        const days = Math.floor(
          (p.reviewedDate.getTime() - p.proposedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalReviewDays += days;
      }
    });
    const avgReviewTime = reviewedProposals.length > 0
      ? Math.round(totalReviewDays / reviewedProposals.length)
      : 0;

    // 承認率
    const totalReviewed = byStatus.approved + byStatus.rejected;
    const approvalRate = totalReviewed > 0
      ? Math.round((byStatus.approved / totalReviewed) * 100)
      : 0;

    // 週次トレンド（過去4週間）
    const weeklyTrend: ProjectizationStats['weeklyTrend'] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      const eligible = all.filter(p =>
        p.proposedDate >= weekStart && p.proposedDate < weekEnd
      ).length;
      const converted = all.filter(p =>
        p.convertedDate && p.convertedDate >= weekStart && p.convertedDate < weekEnd
      ).length;

      weeklyTrend.push({ week: weekLabel, eligible, converted });
    }

    return {
      totalEligible: byStatus.eligible,
      pendingReview: byStatus.pending_review,
      approved: byStatus.approved,
      rejected: byStatus.rejected,
      converted: byStatus.converted,
      byLevel,
      thisMonthConversions,
      avgReviewTime,
      approvalRate,
      weeklyTrend
    };
  }

  /**
   * 履歴を取得
   */
  getHistory(proposalId: string): ProjectizationHistory[] {
    return this.history.get(proposalId) || [];
  }

  /**
   * ヘルパーメソッド
   */
  private getPostScore(post: Post): number {
    if (post.agendaStatus && typeof post.agendaStatus === 'object') {
      return post.agendaStatus.score || 0;
    }
    return 0;
  }

  private getThresholdForLevel(level: ProjectLevel): number {
    const thresholds: Record<ProjectLevel, number> = {
      PENDING: 0,
      TEAM: 50,
      DEPARTMENT: 100,
      FACILITY: 300,
      ORGANIZATION: 600,
      STRATEGIC: 1200
    };
    return thresholds[level];
  }

  private addHistory(proposalId: string, entry: ProjectizationHistory): void {
    if (!this.history.has(proposalId)) {
      this.history.set(proposalId, []);
    }
    this.history.get(proposalId)!.push(entry);
  }

  /**
   * デモデータを初期化
   */
  initializeDemoData(): void {
    this.proposals.clear();
    this.history.clear();

    const now = new Date();

    // デモ投稿データ（簡略版）
    const createDemoPost = (id: string, content: string, score: number): Post => ({
      id,
      type: 'improvement',
      proposalType: 'operational',
      content,
      author: {
        id: 'user_001',
        name: '山田太郎',
        department: '看護部',
        role: '看護師'
      },
      anonymityLevel: 'department_only',
      timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 15,
        'support': 10,
        'neutral': 3,
        'oppose': 1,
        'strongly-oppose': 0
      },
      comments: [],
      agendaStatus: {
        level: 'DEPT_AGENDA',
        score
      }
    });

    // 提案1: 夜勤シフト改善（スコア120、DEPARTMENT、承認待ち）
    const post1 = createDemoPost(
      'post_001',
      '夜勤シフトの2交代制から3交代制への変更により、職員の負担軽減と医療安全の向上を図りたい。現場からの要望も多く、実現可能性が高い提案です。',
      120
    );
    const proposal1: ProjectizationProposal = {
      id: 'proposal_001',
      postId: post1.id,
      post: post1,
      currentScore: 120,
      threshold: 100,
      achievedLevel: 'DEPARTMENT',
      proposedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      status: 'pending_review',
      priority: 'normal',
      projectEstimate: {
        projectLevel: 'DEPARTMENT',
        estimatedDuration: '3-12ヶ月',
        estimatedBudget: 200000,
        recommendedTeamSize: 5,
        requiredApproverLevel: 3
      },
      assignedApproverId: 'approver_001',
      assignedApproverName: '田中課長',
      autoDetectedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      supportRate: 86,
      totalVotes: 29,
      participationRate: 12,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    };

    // 提案2: リハビリ連携強化（スコア350、FACILITY、承認済み・変換待ち）
    const post2 = createDemoPost(
      'post_002',
      '病院と介護施設のリハビリテーション連携を強化し、退院後の継続的なケアを実現する。地域包括ケアシステムの一環として重要な取り組みです。',
      350
    );
    const proposal2: ProjectizationProposal = {
      id: 'proposal_002',
      postId: post2.id,
      post: post2,
      currentScore: 350,
      threshold: 300,
      achievedLevel: 'FACILITY',
      proposedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      status: 'approved',
      priority: 'high',
      projectEstimate: {
        projectLevel: 'FACILITY',
        estimatedDuration: '6-18ヶ月',
        estimatedBudget: 5000000,
        recommendedTeamSize: 8,
        requiredApproverLevel: 4
      },
      assignedApproverId: 'approver_002',
      assignedApproverName: '佐藤部長',
      reviewedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      reviewedBy: '佐藤部長',
      reviewComment: '地域医療拠点化の戦略に合致しており、積極的に推進すべき。プロジェクトチームを編成して進めましょう。',
      autoDetectedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      supportRate: 92,
      totalVotes: 48,
      participationRate: 18,
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    };

    // 提案3: 地域医療ネットワーク構築（スコア650、ORGANIZATION、変換完了）
    const post3 = createDemoPost(
      'post_003',
      '近隣の医療機関・介護施設との情報共有ネットワークを構築し、患者情報の一元管理と地域連携パスの実現を目指す。DX推進の一環として実施。',
      650
    );
    const proposal3: ProjectizationProposal = {
      id: 'proposal_003',
      postId: post3.id,
      post: post3,
      currentScore: 650,
      threshold: 600,
      achievedLevel: 'ORGANIZATION',
      proposedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      status: 'converted',
      priority: 'urgent',
      projectEstimate: {
        projectLevel: 'ORGANIZATION',
        estimatedDuration: '12-36ヶ月',
        estimatedBudget: 15000000,
        recommendedTeamSize: 12,
        requiredApproverLevel: 5
      },
      assignedApproverId: 'approver_003',
      assignedApproverName: '鈴木事務長',
      reviewedDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      reviewedBy: '鈴木事務長',
      reviewComment: '法人全体の戦略的プロジェクトとして承認。予算確保と人員配置を進めます。',
      projectId: 'project_003',
      convertedDate: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      autoDetectedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      supportRate: 95,
      totalVotes: 87,
      participationRate: 25,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000)
    };

    this.proposals.set(proposal1.id, proposal1);
    this.proposals.set(proposal2.id, proposal2);
    this.proposals.set(proposal3.id, proposal3);

    // 履歴も追加
    this.addHistory(proposal1.id, {
      proposalId: proposal1.id,
      action: 'created',
      performedBy: 'system',
      performedByName: 'システム自動検出',
      timestamp: proposal1.proposedDate,
      newStatus: 'eligible'
    });
    this.addHistory(proposal1.id, {
      proposalId: proposal1.id,
      action: 'reviewed',
      performedBy: 'approver_001',
      performedByName: '田中課長',
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      previousStatus: 'eligible',
      newStatus: 'pending_review'
    });

    this.addHistory(proposal2.id, {
      proposalId: proposal2.id,
      action: 'created',
      performedBy: 'system',
      performedByName: 'システム自動検出',
      timestamp: proposal2.proposedDate,
      newStatus: 'eligible'
    });
    this.addHistory(proposal2.id, {
      proposalId: proposal2.id,
      action: 'approved',
      performedBy: 'approver_002',
      performedByName: '佐藤部長',
      timestamp: proposal2.reviewedDate!,
      previousStatus: 'pending_review',
      newStatus: 'approved'
    });

    this.addHistory(proposal3.id, {
      proposalId: proposal3.id,
      action: 'created',
      performedBy: 'system',
      performedByName: 'システム自動検出',
      timestamp: proposal3.proposedDate,
      newStatus: 'eligible'
    });
    this.addHistory(proposal3.id, {
      proposalId: proposal3.id,
      action: 'approved',
      performedBy: 'approver_003',
      performedByName: '鈴木事務長',
      timestamp: proposal3.reviewedDate!,
      previousStatus: 'pending_review',
      newStatus: 'approved'
    });
    this.addHistory(proposal3.id, {
      proposalId: proposal3.id,
      action: 'converted',
      performedBy: 'system',
      performedByName: 'システム',
      timestamp: proposal3.convertedDate!,
      details: `プロジェクトID: ${proposal3.projectId}`,
      previousStatus: 'approved',
      newStatus: 'converted'
    });
  }
}

// シングルトンインスタンス
export const autoProjectizationService = new AutoProjectizationService();
