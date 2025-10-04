// 議題モード専用の分析ダッシュボード
import { Post } from '../../../types';
import { AgendaLevel } from '../../../types/committee';

export interface AgendaAnalytics {
  // 委員会関連メトリクス
  totalAgendas: number;
  committeeSubmissionRate: number;
  committeeApprovalRate: number;
  averageScoreToCommittee: number;

  // レベル別分布
  levelDistribution: Record<AgendaLevel, number>;

  // 進捗メトリクス
  pendingAgendas: number;
  departmentAgendas: number;
  facilityAgendas: number;
  corporationAgendas: number;

  // 承認フロー
  waitingForApproval: number;
  approvedAgendas: number;
  rejectedAgendas: number;

  // トレンド
  monthlySubmissionTrend: Array<{ month: string; count: number }>;
  monthlyApprovalTrend: Array<{ month: string; rate: number }>;

  // 部署別パフォーマンス
  departmentPerformance: Array<{
    department: string;
    totalAgendas: number;
    submittedToCommittee: number;
    approvalRate: number;
  }>;
}

export interface CommitteeMetrics {
  totalSubmissions: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  averageReviewTime: number; // 日数
  facilitySubmissions: number;
  corporationSubmissions: number;
}

/**
 * 議題モード専用の分析エンジン
 */
export class AgendaModeAnalytics {

  /**
   * 全体の議題分析を取得
   */
  getOverallAnalytics(posts: Post[]): AgendaAnalytics {
    const agendaPosts = posts.filter(p => p.agendaStatus);

    const levelDistribution = this.calculateLevelDistribution(agendaPosts);
    const committeeMetrics = this.calculateCommitteeMetrics(agendaPosts);

    return {
      totalAgendas: agendaPosts.length,
      committeeSubmissionRate: this.calculateSubmissionRate(agendaPosts),
      committeeApprovalRate: this.calculateApprovalRate(agendaPosts),
      averageScoreToCommittee: this.calculateAverageScoreToCommittee(agendaPosts),

      levelDistribution,

      pendingAgendas: levelDistribution.PENDING || 0,
      departmentAgendas: (levelDistribution.DEPT_REVIEW || 0) + (levelDistribution.DEPT_AGENDA || 0),
      facilityAgendas: levelDistribution.FACILITY_AGENDA || 0,
      corporationAgendas: (levelDistribution.CORP_REVIEW || 0) + (levelDistribution.CORP_AGENDA || 0),

      waitingForApproval: committeeMetrics.pendingReview,
      approvedAgendas: committeeMetrics.approved,
      rejectedAgendas: committeeMetrics.rejected,

      monthlySubmissionTrend: this.calculateMonthlySubmissionTrend(agendaPosts),
      monthlyApprovalTrend: this.calculateMonthlyApprovalTrend(agendaPosts),

      departmentPerformance: this.calculateDepartmentPerformance(agendaPosts)
    };
  }

  /**
   * レベル別分布を計算
   */
  private calculateLevelDistribution(posts: Post[]): Record<AgendaLevel, number> {
    const distribution: Record<AgendaLevel, number> = {
      PENDING: 0,
      DEPT_REVIEW: 0,
      DEPT_AGENDA: 0,
      FACILITY_AGENDA: 0,
      CORP_REVIEW: 0,
      CORP_AGENDA: 0
    };

    posts.forEach(post => {
      if (post.agendaStatus?.level) {
        distribution[post.agendaStatus.level]++;
      }
    });

    return distribution;
  }

  /**
   * 委員会提出率を計算
   */
  private calculateSubmissionRate(posts: Post[]): number {
    const eligiblePosts = posts.filter(p =>
      p.agendaStatus?.level === 'FACILITY_AGENDA' ||
      p.agendaStatus?.level === 'CORP_AGENDA'
    );

    if (eligiblePosts.length === 0) return 0;

    const submittedPosts = eligiblePosts.filter(p => p.agendaStatus?.isSubmittedToCommittee);
    return Math.round((submittedPosts.length / eligiblePosts.length) * 100);
  }

  /**
   * 委員会承認率を計算
   */
  private calculateApprovalRate(posts: Post[]): number {
    const submittedPosts = posts.filter(p => p.agendaStatus?.isSubmittedToCommittee);

    if (submittedPosts.length === 0) return 0;

    const approvedPosts = submittedPosts.filter(p =>
      p.agendaStatus?.committeeApprovalStatus === 'approved'
    );

    return Math.round((approvedPosts.length / submittedPosts.length) * 100);
  }

  /**
   * 委員会提出までの平均スコアを計算
   */
  private calculateAverageScoreToCommittee(posts: Post[]): number {
    const submittedPosts = posts.filter(p => p.agendaStatus?.isSubmittedToCommittee);

    if (submittedPosts.length === 0) return 0;

    const totalScore = submittedPosts.reduce((sum, post) =>
      sum + (post.agendaStatus?.score || 0), 0
    );

    return Math.round(totalScore / submittedPosts.length);
  }

  /**
   * 委員会メトリクスを計算
   */
  private calculateCommitteeMetrics(posts: Post[]): CommitteeMetrics {
    const submittedPosts = posts.filter(p => p.agendaStatus?.isSubmittedToCommittee);

    const pending = submittedPosts.filter(p =>
      p.agendaStatus?.committeeApprovalStatus === 'pending'
    ).length;

    const approved = submittedPosts.filter(p =>
      p.agendaStatus?.committeeApprovalStatus === 'approved'
    ).length;

    const rejected = submittedPosts.filter(p =>
      p.agendaStatus?.committeeApprovalStatus === 'rejected'
    ).length;

    const facilitySubmissions = submittedPosts.filter(p =>
      p.agendaStatus?.level === 'FACILITY_AGENDA'
    ).length;

    const corporationSubmissions = submittedPosts.filter(p =>
      p.agendaStatus?.level === 'CORP_AGENDA'
    ).length;

    return {
      totalSubmissions: submittedPosts.length,
      pendingReview: pending,
      approved,
      rejected,
      averageReviewTime: 7, // 仮実装: 7日
      facilitySubmissions,
      corporationSubmissions
    };
  }

  /**
   * 月別提出トレンドを計算
   */
  private calculateMonthlySubmissionTrend(posts: Post[]): Array<{ month: string; count: number }> {
    const monthlyData: Record<string, number> = {};

    posts.filter(p => p.agendaStatus?.isSubmittedToCommittee).forEach(post => {
      if (post.agendaStatus?.committeeSubmissionDate) {
        const month = post.agendaStatus.committeeSubmissionDate.substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 月別承認率トレンドを計算
   */
  private calculateMonthlyApprovalTrend(posts: Post[]): Array<{ month: string; rate: number }> {
    const monthlyData: Record<string, { submitted: number; approved: number }> = {};

    posts.filter(p => p.agendaStatus?.isSubmittedToCommittee).forEach(post => {
      if (post.agendaStatus?.committeeSubmissionDate) {
        const month = post.agendaStatus.committeeSubmissionDate.substring(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { submitted: 0, approved: 0 };
        }
        monthlyData[month].submitted++;
        if (post.agendaStatus.committeeApprovalStatus === 'approved') {
          monthlyData[month].approved++;
        }
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        rate: data.submitted > 0 ? Math.round((data.approved / data.submitted) * 100) : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 部署別パフォーマンスを計算
   */
  private calculateDepartmentPerformance(posts: Post[]): Array<{
    department: string;
    totalAgendas: number;
    submittedToCommittee: number;
    approvalRate: number;
  }> {
    const deptData: Record<string, {
      total: number;
      submitted: number;
      approved: number;
    }> = {};

    posts.forEach(post => {
      const dept = post.author.department;
      if (!deptData[dept]) {
        deptData[dept] = { total: 0, submitted: 0, approved: 0 };
      }
      deptData[dept].total++;

      if (post.agendaStatus?.isSubmittedToCommittee) {
        deptData[dept].submitted++;
        if (post.agendaStatus.committeeApprovalStatus === 'approved') {
          deptData[dept].approved++;
        }
      }
    });

    return Object.entries(deptData).map(([department, data]) => ({
      department,
      totalAgendas: data.total,
      submittedToCommittee: data.submitted,
      approvalRate: data.submitted > 0
        ? Math.round((data.approved / data.submitted) * 100)
        : 0
    }));
  }
}

// シングルトンインスタンス
export const agendaModeAnalytics = new AgendaModeAnalytics();
