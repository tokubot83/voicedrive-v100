// プロジェクトモード専用の分析ダッシュボード
import { Post } from '../../../types';
import { ProjectLevel } from '../../../types/visibility';

export interface ProjectAnalytics {
  // プロジェクト基本メトリクス
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectCompletionRate: number;

  // レベル別分布
  levelDistribution: Record<ProjectLevel, number>;

  // 協働メトリクス
  crossDepartmentProjects: number;
  crossFacilityProjects: number;
  collaborationScore: number; // 部署横断度合い

  // チームメトリクス
  averageTeamSize: number;
  totalTeamMembers: number;
  activeTeamCount: number;

  // 進捗メトリクス
  averageProgress: number;
  onTrackProjects: number;
  delayedProjects: number;

  // トレンド
  monthlyProjectTrend: Array<{ month: string; count: number }>;
  monthlyCompletionTrend: Array<{ month: string; rate: number }>;

  // 部署別パフォーマンス
  departmentPerformance: Array<{
    department: string;
    totalProjects: number;
    completedProjects: number;
    completionRate: number;
    collaborationScore: number;
  }>;
}

export interface TeamMetrics {
  totalTeams: number;
  averageMembersPerTeam: number;
  crossDepartmentTeams: number;
  mostActiveTeam: {
    projectTitle: string;
    memberCount: number;
    departments: string[];
  } | null;
}

/**
 * プロジェクトモード専用の分析エンジン
 */
export class ProjectModeAnalytics {

  /**
   * 全体のプロジェクト分析を取得
   */
  getOverallAnalytics(posts: Post[]): ProjectAnalytics {
    const projectPosts = posts.filter(p =>
      p.projectStatus && typeof p.projectStatus === 'object'
    );

    const levelDistribution = this.calculateLevelDistribution(projectPosts);
    const teamMetrics = this.calculateTeamMetrics(projectPosts);
    const collaborationMetrics = this.calculateCollaborationMetrics(projectPosts);

    const completedProjects = projectPosts.filter(p =>
      typeof p.projectStatus === 'object' && p.projectStatus.stage === 'completed'
    ).length;

    const activeProjects = projectPosts.filter(p =>
      typeof p.projectStatus === 'object' && p.projectStatus.stage === 'active'
    ).length;

    return {
      totalProjects: projectPosts.length,
      activeProjects,
      completedProjects,
      projectCompletionRate: projectPosts.length > 0
        ? Math.round((completedProjects / projectPosts.length) * 100)
        : 0,

      levelDistribution,

      crossDepartmentProjects: collaborationMetrics.crossDepartmentProjects,
      crossFacilityProjects: collaborationMetrics.crossFacilityProjects,
      collaborationScore: collaborationMetrics.collaborationScore,

      averageTeamSize: teamMetrics.averageMembersPerTeam,
      totalTeamMembers: teamMetrics.totalTeams * teamMetrics.averageMembersPerTeam,
      activeTeamCount: teamMetrics.totalTeams,

      averageProgress: this.calculateAverageProgress(projectPosts),
      onTrackProjects: this.calculateOnTrackProjects(projectPosts),
      delayedProjects: this.calculateDelayedProjects(projectPosts),

      monthlyProjectTrend: this.calculateMonthlyProjectTrend(projectPosts),
      monthlyCompletionTrend: this.calculateMonthlyCompletionTrend(projectPosts),

      departmentPerformance: this.calculateDepartmentPerformance(projectPosts)
    };
  }

  /**
   * レベル別分布を計算
   */
  private calculateLevelDistribution(posts: Post[]): Record<ProjectLevel, number> {
    const distribution: Record<ProjectLevel, number> = {
      PENDING: 0,
      TEAM: 0,
      DEPARTMENT: 0,
      FACILITY: 0,
      ORGANIZATION: 0,
      STRATEGIC: 0
    };

    posts.forEach(post => {
      if (typeof post.projectStatus === 'object' && post.projectStatus.level) {
        distribution[post.projectStatus.level]++;
      }
    });

    return distribution;
  }

  /**
   * チームメトリクスを計算
   */
  private calculateTeamMetrics(posts: Post[]): TeamMetrics {
    const teams = posts
      .filter(p => p.projectDetails?.team)
      .map(p => p.projectDetails!);

    if (teams.length === 0) {
      return {
        totalTeams: 0,
        averageMembersPerTeam: 0,
        crossDepartmentTeams: 0,
        mostActiveTeam: null
      };
    }

    const totalMembers = teams.reduce((sum, t) => sum + (t.team?.length || 0), 0);
    const averageMembers = Math.round(totalMembers / teams.length);

    // 部署横断チームの計算（仮実装）
    const crossDepartmentTeams = teams.filter(t => (t.team?.length || 0) > 5).length;

    // 最も活発なチームを特定
    const mostActiveTeam = teams.length > 0 ? {
      projectTitle: '仮プロジェクト', // 実装時に実際のタイトルを使用
      memberCount: Math.max(...teams.map(t => t.team?.length || 0)),
      departments: ['リハビリテーション科', '看護部'] // 実装時に実際の部署を使用
    } : null;

    return {
      totalTeams: teams.length,
      averageMembersPerTeam: averageMembers,
      crossDepartmentTeams,
      mostActiveTeam
    };
  }

  /**
   * 協働メトリクスを計算
   */
  private calculateCollaborationMetrics(posts: Post[]): {
    crossDepartmentProjects: number;
    crossFacilityProjects: number;
    collaborationScore: number;
  } {
    const departmentProjects = posts.filter(p =>
      typeof p.projectStatus === 'object' &&
      (p.projectStatus.level === 'DEPARTMENT' || p.projectStatus.level === 'FACILITY')
    ).length;

    const facilityProjects = posts.filter(p =>
      typeof p.projectStatus === 'object' &&
      (p.projectStatus.level === 'FACILITY' || p.projectStatus.level === 'ORGANIZATION')
    ).length;

    // 協働スコア: 部署横断・施設横断プロジェクトの割合
    const collaborationScore = posts.length > 0
      ? Math.round(((departmentProjects + facilityProjects) / posts.length) * 100)
      : 0;

    return {
      crossDepartmentProjects: departmentProjects,
      crossFacilityProjects: facilityProjects,
      collaborationScore
    };
  }

  /**
   * 平均進捗率を計算
   */
  private calculateAverageProgress(posts: Post[]): number {
    const projectsWithProgress = posts.filter(p =>
      typeof p.projectStatus === 'object' && p.projectStatus.progress !== undefined
    );

    if (projectsWithProgress.length === 0) return 0;

    const totalProgress = projectsWithProgress.reduce((sum, p) =>
      sum + (typeof p.projectStatus === 'object' ? p.projectStatus.progress : 0), 0
    );

    return Math.round(totalProgress / projectsWithProgress.length);
  }

  /**
   * 順調なプロジェクト数を計算
   */
  private calculateOnTrackProjects(posts: Post[]): number {
    return posts.filter(p =>
      typeof p.projectStatus === 'object' &&
      p.projectStatus.progress >= 70 &&
      p.projectStatus.stage === 'active'
    ).length;
  }

  /**
   * 遅延プロジェクト数を計算
   */
  private calculateDelayedProjects(posts: Post[]): number {
    return posts.filter(p =>
      typeof p.projectStatus === 'object' &&
      p.projectStatus.progress < 50 &&
      p.projectStatus.stage === 'active'
    ).length;
  }

  /**
   * 月別プロジェクト作成トレンドを計算
   */
  private calculateMonthlyProjectTrend(posts: Post[]): Array<{ month: string; count: number }> {
    const monthlyData: Record<string, number> = {};

    posts.forEach(post => {
      const month = post.timestamp.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 月別完了率トレンドを計算
   */
  private calculateMonthlyCompletionTrend(posts: Post[]): Array<{ month: string; rate: number }> {
    const monthlyData: Record<string, { total: number; completed: number }> = {};

    posts.forEach(post => {
      const month = post.timestamp.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, completed: 0 };
      }
      monthlyData[month].total++;
      if (typeof post.projectStatus === 'object' && post.projectStatus.stage === 'completed') {
        monthlyData[month].completed++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 部署別パフォーマンスを計算
   */
  private calculateDepartmentPerformance(posts: Post[]): Array<{
    department: string;
    totalProjects: number;
    completedProjects: number;
    completionRate: number;
    collaborationScore: number;
  }> {
    const deptData: Record<string, {
      total: number;
      completed: number;
      crossDept: number;
    }> = {};

    posts.forEach(post => {
      const dept = post.author.department;
      if (!deptData[dept]) {
        deptData[dept] = { total: 0, completed: 0, crossDept: 0 };
      }
      deptData[dept].total++;

      if (typeof post.projectStatus === 'object' && post.projectStatus.stage === 'completed') {
        deptData[dept].completed++;
      }

      if (typeof post.projectStatus === 'object' &&
          (post.projectStatus.level === 'FACILITY' || post.projectStatus.level === 'ORGANIZATION')) {
        deptData[dept].crossDept++;
      }
    });

    return Object.entries(deptData).map(([department, data]) => ({
      department,
      totalProjects: data.total,
      completedProjects: data.completed,
      completionRate: data.total > 0
        ? Math.round((data.completed / data.total) * 100)
        : 0,
      collaborationScore: data.total > 0
        ? Math.round((data.crossDept / data.total) * 100)
        : 0
    }));
  }
}

// シングルトンインスタンス
export const projectModeAnalytics = new ProjectModeAnalytics();
