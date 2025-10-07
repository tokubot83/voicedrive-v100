/**
 * 施設プロジェクト管理サービス
 * Level 10+（人財統括本部各部門長以上）専用
 *
 * ボトムアップ（自動プロジェクト化）プロジェクトの監督・調整
 */

import {
  FacilityProject,
  FacilityProjectStats,
  ProjectFilter,
  ProjectSortField,
  SortOrder,
  ProjectIssue,
  ProjectCoordination,
  ProjectReview,
  ProjectExecutionStatus,
  ProjectHealth,
  ProjectOrigin,
  ProjectResource,
  ProjectMilestone,
  TeamMember
} from '../types/facilityProjectManagement';
import { ProjectLevel } from '../types/visibility';
import { User } from '../types';

class FacilityProjectManagementService {
  private projects: Map<string, FacilityProject> = new Map();
  private reviews: Map<string, ProjectReview[]> = new Map();

  /**
   * すべてのプロジェクトを取得
   */
  getAllProjects(): FacilityProject[] {
    return Array.from(this.projects.values()).sort((a, b) => {
      // デフォルトソート: 健全性 → 進捗率
      const healthOrder = { critical: 1, at_risk: 2, healthy: 3 };
      if (a.health !== b.health) {
        return healthOrder[a.health] - healthOrder[b.health];
      }
      return b.overallProgress - a.overallProgress;
    });
  }

  /**
   * フィルタリング
   */
  getFilteredProjects(filter: ProjectFilter): FacilityProject[] {
    let projects = this.getAllProjects();

    if (filter.status && filter.status.length > 0) {
      projects = projects.filter(p => filter.status!.includes(p.executionStatus));
    }

    if (filter.health && filter.health.length > 0) {
      projects = projects.filter(p => filter.health!.includes(p.health));
    }

    if (filter.origin && filter.origin.length > 0) {
      projects = projects.filter(p => filter.origin!.includes(p.origin));
    }

    if (filter.department && filter.department.length > 0) {
      projects = projects.filter(p =>
        p.departments.some(d => filter.department!.includes(d))
      );
    }

    if (filter.projectLevel && filter.projectLevel.length > 0) {
      projects = projects.filter(p => filter.projectLevel!.includes(p.projectLevel));
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.projectLeader.name.toLowerCase().includes(searchLower)
      );
    }

    return projects;
  }

  /**
   * ソート
   */
  getSortedProjects(
    projects: FacilityProject[],
    sortField: ProjectSortField,
    sortOrder: SortOrder
  ): FacilityProject[] {
    const sorted = [...projects].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'priority':
          // 健全性 + 進捗率で優先度判定
          const healthScore = { critical: 100, at_risk: 50, healthy: 0 };
          const priorityA = healthScore[a.health] + (100 - a.overallProgress);
          const priorityB = healthScore[b.health] + (100 - b.overallProgress);
          comparison = priorityB - priorityA;
          break;

        case 'progress':
          comparison = a.overallProgress - b.overallProgress;
          break;

        case 'startDate':
          comparison = a.plannedStartDate.getTime() - b.plannedStartDate.getTime();
          break;

        case 'endDate':
          comparison = a.plannedEndDate.getTime() - b.plannedEndDate.getTime();
          break;

        case 'budget':
          comparison = a.estimatedBudget - b.estimatedBudget;
          break;

        case 'issuesCount':
          comparison = a.activeIssuesCount - b.activeIssuesCount;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * ステータス別に取得
   */
  getProjectsByStatus(status: ProjectExecutionStatus): FacilityProject[] {
    return this.getAllProjects().filter(p => p.executionStatus === status);
  }

  /**
   * 実行中プロジェクトを取得
   */
  getActiveProjects(): FacilityProject[] {
    return this.getProjectsByStatus('in_progress');
  }

  /**
   * リスクのあるプロジェクトを取得
   */
  getAtRiskProjects(): FacilityProject[] {
    return this.getAllProjects().filter(p => p.health === 'at_risk' || p.health === 'critical');
  }

  /**
   * IDでプロジェクトを取得
   */
  getProjectById(id: string): FacilityProject | null {
    return this.projects.get(id) || null;
  }

  /**
   * プロジェクトを更新
   */
  updateProject(id: string, updates: Partial<FacilityProject>): boolean {
    const project = this.projects.get(id);
    if (!project) return false;

    Object.assign(project, updates);
    project.updatedAt = new Date();
    this.projects.set(id, project);

    return true;
  }

  /**
   * 課題を追加
   */
  addIssue(projectId: string, issue: Omit<ProjectIssue, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const newIssue: ProjectIssue = {
      ...issue,
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.issues.push(newIssue);
    project.activeIssuesCount = project.issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    project.criticalIssuesCount = project.issues.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;

    // 健全性を再評価
    this.updateProjectHealth(project);

    this.projects.set(projectId, project);
    return true;
  }

  /**
   * 課題を解決
   */
  resolveIssue(projectId: string, issueId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const issue = project.issues.find(i => i.id === issueId);
    if (!issue) return false;

    issue.status = 'resolved';
    issue.resolvedDate = new Date();
    issue.updatedAt = new Date();

    project.activeIssuesCount = project.issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    project.criticalIssuesCount = project.issues.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;

    // 健全性を再評価
    this.updateProjectHealth(project);

    this.projects.set(projectId, project);
    return true;
  }

  /**
   * 部門間調整を追加
   */
  addCoordination(
    projectId: string,
    coordination: Omit<ProjectCoordination, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
  ): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const newCoordination: ProjectCoordination = {
      ...coordination,
      id: `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.coordinations.push(newCoordination);
    project.pendingCoordinations = project.coordinations.filter(c => c.status === 'pending' || c.status === 'in_discussion').length;

    this.projects.set(projectId, project);
    return true;
  }

  /**
   * プロジェクトレビューを追加
   */
  addReview(review: Omit<ProjectReview, 'id' | 'createdAt'>): boolean {
    const project = this.projects.get(review.projectId);
    if (!project) return false;

    const newReview: ProjectReview = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    if (!this.reviews.has(review.projectId)) {
      this.reviews.set(review.projectId, []);
    }
    this.reviews.get(review.projectId)!.push(newReview);

    // プロジェクトの健全性を更新
    project.health = review.healthRating;
    project.lastReviewDate = review.reviewDate;
    project.nextReviewDate = review.nextReviewDate;
    this.projects.set(review.projectId, project);

    return true;
  }

  /**
   * プロジェクトの健全性を更新
   */
  private updateProjectHealth(project: FacilityProject): void {
    // 健全性判定ロジック
    if (project.criticalIssuesCount > 0) {
      project.health = 'critical';
    } else if (project.activeIssuesCount > 5 || project.overallProgress < 30) {
      project.health = 'at_risk';
    } else {
      project.health = 'healthy';
    }
  }

  /**
   * 統計情報を取得
   */
  getStats(): FacilityProjectStats {
    const all = this.getAllProjects();

    const byStatus: Record<ProjectExecutionStatus, number> = {
      planning: 0,
      team_forming: 0,
      in_progress: 0,
      on_hold: 0,
      completed: 0,
      cancelled: 0
    };

    const byOrigin: Record<ProjectOrigin, number> = {
      bottom_up: 0,
      top_down: 0,
      committee: 0,
      management: 0
    };

    let totalBudget = 0;
    let usedBudget = 0;
    let totalPersonnel = 0;
    let usedPersonnel = 0;
    let totalIssues = 0;
    let openIssues = 0;
    let criticalIssues = 0;
    let totalProgress = 0;
    let onScheduleCount = 0;
    let delayedCount = 0;

    all.forEach(p => {
      byStatus[p.executionStatus]++;
      byOrigin[p.origin]++;

      totalBudget += p.estimatedBudget;
      usedBudget += p.actualSpending;

      p.resources.forEach(r => {
        if (r.type === 'personnel') {
          totalPersonnel += r.allocated;
          usedPersonnel += r.used;
        }
      });

      totalIssues += p.issues.length;
      openIssues += p.issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
      criticalIssues += p.issues.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;

      totalProgress += p.overallProgress;

      // スケジュール遅延判定（簡易版）
      const now = new Date();
      if (p.executionStatus === 'in_progress') {
        const totalDays = (p.plannedEndDate.getTime() - p.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24);
        const elapsedDays = (now.getTime() - (p.actualStartDate || p.plannedStartDate).getTime()) / (1000 * 60 * 60 * 24);
        const expectedProgress = (elapsedDays / totalDays) * 100;

        if (p.overallProgress >= expectedProgress - 10) {
          onScheduleCount++;
        } else {
          delayedCount++;
        }
      }
    });

    // 今月の開始・完了数
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCompletions = all.filter(p =>
      p.actualEndDate && p.actualEndDate >= thisMonthStart
    ).length;
    const thisMonthStarts = all.filter(p =>
      p.actualStartDate && p.actualStartDate >= thisMonthStart
    ).length;

    // 平均課題解決時間
    let totalResolutionDays = 0;
    let resolvedCount = 0;
    all.forEach(p => {
      p.issues.forEach(i => {
        if (i.resolvedDate && i.reportedDate) {
          const days = (i.resolvedDate.getTime() - i.reportedDate.getTime()) / (1000 * 60 * 60 * 24);
          totalResolutionDays += days;
          resolvedCount++;
        }
      });
    });
    const averageResolutionTime = resolvedCount > 0
      ? Math.round(totalResolutionDays / resolvedCount)
      : 0;

    // 月次トレンド（過去6ヶ月）
    const monthlyTrend: FacilityProjectStats['monthlyTrend'] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = `${monthDate.getMonth() + 1}月`;

      const started = all.filter(p =>
        p.actualStartDate &&
        p.actualStartDate >= monthDate &&
        p.actualStartDate <= monthEnd
      ).length;

      const completed = all.filter(p =>
        p.actualEndDate &&
        p.actualEndDate >= monthDate &&
        p.actualEndDate <= monthEnd
      ).length;

      const active = all.filter(p =>
        p.executionStatus === 'in_progress' &&
        p.actualStartDate &&
        p.actualStartDate <= monthEnd
      ).length;

      monthlyTrend.push({ month: monthLabel, started, completed, active });
    }

    return {
      totalProjects: all.length,
      activeProjects: byStatus.in_progress,
      completedProjects: byStatus.completed,
      onHoldProjects: byStatus.on_hold,
      byStatus,
      byOrigin,
      healthyCount: all.filter(p => p.health === 'healthy').length,
      atRiskCount: all.filter(p => p.health === 'at_risk').length,
      criticalCount: all.filter(p => p.health === 'critical').length,
      totalBudget,
      usedBudget,
      budgetUtilization: totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0,
      totalPersonnel,
      personnelUtilization: totalPersonnel > 0 ? Math.round((usedPersonnel / totalPersonnel) * 100) : 0,
      totalIssues,
      openIssues,
      criticalIssues,
      averageResolutionTime,
      pendingCoordinations: all.reduce((sum, p) => sum + p.pendingCoordinations, 0),
      completedCoordinations: all.reduce((sum, p) => sum + p.coordinations.filter(c => c.status === 'implemented').length, 0),
      averageProgress: all.length > 0 ? Math.round(totalProgress / all.length) : 0,
      onScheduleCount,
      delayedCount,
      thisMonthCompletions,
      thisMonthStarts,
      monthlyTrend
    };
  }

  /**
   * デモデータを初期化
   */
  initializeDemoData(): void {
    this.projects.clear();
    this.reviews.clear();

    const now = new Date();

    // プロジェクト1: リハビリ連携強化（FACILITY、ボトムアップ、実行中、順調）
    const project1: FacilityProject = {
      id: 'fproj_001',
      title: '病院・介護施設間のリハビリテーション連携強化プロジェクト',
      description: '退院後の継続的なリハビリテーションを実現するため、病院と介護施設の連携を強化。情報共有システムの構築とリハビリ計画の一元管理を行う。',
      objectives: [
        '病院から介護施設へのスムーズな情報連携',
        'リハビリ計画の継続性確保',
        '患者満足度の向上（目標：85%以上）',
        '再入院率の低減（目標：20%減）'
      ],
      origin: 'bottom_up',
      originId: 'post_002',
      originScore: 350,
      projectLevel: 'FACILITY',
      scope: 'facility',
      executionStatus: 'in_progress',
      health: 'healthy',
      overallProgress: 65,
      projectLeader: {
        userId: 'user_101',
        name: '佐藤健一',
        department: 'リハビリテーション科',
        role: 'leader',
        allocation: 60,
        expertise: ['リハビリテーション', 'プロジェクト管理'],
        joinedDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      },
      team: [
        {
          userId: 'user_102',
          name: '田中美咲',
          department: '看護部',
          role: 'core',
          allocation: 40,
          expertise: ['看護', '退院支援'],
          joinedDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        },
        {
          userId: 'user_103',
          name: '鈴木太郎',
          department: '介護施設A',
          role: 'core',
          allocation: 40,
          expertise: ['介護', 'リハビリ'],
          joinedDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        },
        {
          userId: 'user_104',
          name: '山田花子',
          department: '情報システム部',
          role: 'support',
          allocation: 20,
          expertise: ['システム開発', 'データ連携'],
          joinedDate: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000)
        }
      ],
      departments: ['リハビリテーション科', '看護部', '介護施設A', '介護施設B', '情報システム部'],
      plannedStartDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      plannedEndDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      actualStartDate: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
      duration: '6ヶ月',
      milestones: [
        {
          id: 'ms_001',
          name: '現状分析と要件定義',
          description: '連携課題の洗い出しと情報共有システムの要件定義',
          targetDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          completedDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
          status: 'completed',
          progress: 100,
          deliverables: ['現状分析レポート', '要件定義書']
        },
        {
          id: 'ms_002',
          name: 'システム開発とパイロット導入',
          description: '情報共有システムのプロトタイプ開発と1施設での試行',
          targetDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
          status: 'in_progress',
          progress: 70,
          deliverables: ['プロトタイプシステム', 'パイロット結果報告']
        },
        {
          id: 'ms_003',
          name: '本格展開と評価',
          description: '全施設への展開と効果測定',
          targetDate: new Date(now.getTime() + 80 * 24 * 60 * 60 * 1000),
          status: 'pending',
          progress: 10,
          deliverables: ['展開計画書', '効果測定レポート']
        }
      ],
      resources: [
        {
          type: 'personnel',
          allocated: 8,
          used: 5.2,
          remaining: 2.8,
          unit: '人',
          utilizationRate: 65
        },
        {
          type: 'budget',
          allocated: 5000000,
          used: 3200000,
          remaining: 1800000,
          unit: '円',
          utilizationRate: 64
        }
      ],
      estimatedBudget: 5000000,
      actualSpending: 3200000,
      issues: [
        {
          id: 'issue_001',
          title: 'システム連携の技術的課題',
          description: '既存システムとの連携で互換性の問題が発生',
          priority: 'medium',
          status: 'in_progress',
          category: 'quality',
          assignedTo: 'user_104',
          assignedToName: '山田花子',
          reportedBy: 'user_102',
          reportedByName: '田中美咲',
          reportedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          impact: 'パイロット導入が1週間遅延する可能性',
          mitigation: 'ベンダーと協議中。代替案も検討',
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      activeIssuesCount: 1,
      criticalIssuesCount: 0,
      coordinations: [],
      pendingCoordinations: 0,
      kpis: [
        { name: '情報連携率', target: '90%以上', current: '75%', achievement: 83 },
        { name: '患者満足度', target: '85%以上', current: '82%', achievement: 96 },
        { name: '再入院率減少', target: '20%減', current: '15%減', achievement: 75 }
      ],
      approvedBy: '佐藤部長',
      approvedDate: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000),
      approvalLevel: 10,
      createdAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      lastReviewDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      tags: ['リハビリ', '連携', '地域医療', 'システム']
    };

    // プロジェクト2: 夜勤シフト改善（DEPARTMENT、ボトムアップ、チーム編成中、リスクあり）
    const project2: FacilityProject = {
      id: 'fproj_002',
      title: '夜勤シフト体制の見直しと職員負担軽減',
      description: '2交代制から3交代制への移行により、夜勤職員の負担を軽減し、医療安全の向上を図る。',
      objectives: [
        '夜勤職員の負担軽減（目標：30%減）',
        'インシデント発生率の低減（目標：20%減）',
        '職員満足度の向上',
        '段階的な導入による現場への影響最小化'
      ],
      origin: 'bottom_up',
      originId: 'post_001',
      originScore: 120,
      projectLevel: 'DEPARTMENT',
      scope: 'department',
      executionStatus: 'team_forming',
      health: 'at_risk',
      overallProgress: 25,
      projectLeader: {
        userId: 'user_201',
        name: '山田太郎',
        department: '看護部',
        role: 'leader',
        allocation: 50,
        expertise: ['看護管理', 'シフト管理'],
        joinedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      },
      team: [
        {
          userId: 'user_202',
          name: '高橋明子',
          department: '看護部',
          role: 'core',
          allocation: 30,
          expertise: ['看護', '夜勤経験'],
          joinedDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)
        }
      ],
      departments: ['看護部', '医事課'],
      plannedStartDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      plannedEndDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      actualStartDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      duration: '3ヶ月',
      milestones: [
        {
          id: 'ms_101',
          name: 'チーム編成と計画策定',
          description: 'プロジェクトチームの編成と詳細計画の策定',
          targetDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          status: 'in_progress',
          progress: 60,
          deliverables: ['チーム編成表', 'プロジェクト計画書']
        },
        {
          id: 'ms_102',
          name: 'パイロット病棟での試行',
          description: '1病棟での3交代制試行',
          targetDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
          status: 'pending',
          progress: 0,
          deliverables: ['試行結果報告']
        }
      ],
      resources: [
        {
          type: 'personnel',
          allocated: 5,
          used: 2,
          remaining: 3,
          unit: '人',
          utilizationRate: 40
        },
        {
          type: 'budget',
          allocated: 200000,
          used: 50000,
          remaining: 150000,
          unit: '円',
          utilizationRate: 25
        }
      ],
      estimatedBudget: 200000,
      actualSpending: 50000,
      issues: [
        {
          id: 'issue_101',
          title: 'チームメンバーの確保難航',
          description: '夜勤経験のある看護師の参加が得られず、チーム編成が遅れている',
          priority: 'high',
          status: 'open',
          category: 'resource',
          reportedBy: 'user_201',
          reportedByName: '山田太郎',
          reportedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
          impact: 'プロジェクト開始が2週間遅延する可能性',
          mitigation: '他部署からの応援要請を検討中',
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'issue_102',
          title: '現場からの反対意見',
          description: '一部の夜勤スタッフから3交代制への懸念が表明されている',
          priority: 'medium',
          status: 'open',
          category: 'communication',
          reportedBy: 'user_202',
          reportedByName: '高橋明子',
          reportedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          impact: '現場の協力が得られず、試行が困難になる可能性',
          mitigation: '説明会を開催し、丁寧な説明を行う',
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
        }
      ],
      activeIssuesCount: 2,
      criticalIssuesCount: 0,
      coordinations: [
        {
          id: 'coord_101',
          projectId: 'fproj_002',
          title: '医事課との勤務時間調整',
          description: '3交代制導入に伴う勤務時間の変更について医事課との調整が必要',
          departments: ['看護部', '医事課'],
          stakeholders: [
            { id: 'user_201', name: '山田太郎', department: '看護部', role: 'lead' },
            { id: 'user_203', name: '伊藤課長', department: '医事課', role: 'support' }
          ],
          status: 'in_discussion',
          priority: 'medium',
          topic: '勤務時間と給与計算の調整',
          requestedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          discussionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          coordinatorId: 'user_201',
          coordinatorName: '山田太郎',
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      pendingCoordinations: 1,
      kpis: [
        { name: 'チーム編成完了', target: '100%', current: '60%', achievement: 60 },
        { name: '計画書作成', target: '完了', current: '80%', achievement: 80 }
      ],
      approvedBy: '田中課長',
      approvedDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      approvalLevel: 3,
      createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      lastReviewDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      nextReviewDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
      tags: ['夜勤', 'シフト', '働き方改革', '医療安全']
    };

    // プロジェクト3: 地域医療ネットワーク構築（ORGANIZATION、委員会提案、完了）
    const project3: FacilityProject = {
      id: 'fproj_003',
      title: '地域医療ネットワーク構築プロジェクト',
      description: '近隣医療機関・介護施設との情報共有ネットワークを構築し、地域連携パスの実現を目指す。',
      objectives: [
        '地域医療機関20施設とのネットワーク構築',
        '患者情報の安全な共有基盤の確立',
        '地域連携パスの運用開始',
        '地域医療の質向上と効率化'
      ],
      origin: 'committee',
      projectLevel: 'ORGANIZATION',
      scope: 'organization',
      executionStatus: 'completed',
      health: 'healthy',
      overallProgress: 100,
      projectLeader: {
        userId: 'user_301',
        name: '鈴木事務長',
        department: '事務局',
        role: 'leader',
        allocation: 70,
        expertise: ['経営企画', 'IT戦略', 'プロジェクト管理'],
        joinedDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      },
      team: [
        {
          userId: 'user_302',
          name: '渡辺部長',
          department: '医局',
          role: 'core',
          allocation: 50,
          expertise: ['医療連携', '地域医療'],
          joinedDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        },
        {
          userId: 'user_303',
          name: '中村課長',
          department: '情報システム部',
          role: 'core',
          allocation: 80,
          expertise: ['システム開発', 'セキュリティ'],
          joinedDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        }
      ],
      departments: ['事務局', '医局', '情報システム部', '地域医療連携室'],
      plannedStartDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      plannedEndDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      actualStartDate: new Date(now.getTime() - 360 * 24 * 60 * 60 * 1000),
      actualEndDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      duration: '12ヶ月',
      milestones: [
        {
          id: 'ms_201',
          name: 'ネットワーク基盤構築',
          description: '安全な情報共有基盤の構築',
          targetDate: new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000),
          completedDate: new Date(now.getTime() - 265 * 24 * 60 * 60 * 1000),
          status: 'completed',
          progress: 100,
          deliverables: ['ネットワークシステム', 'セキュリティポリシー']
        },
        {
          id: 'ms_202',
          name: '参加施設の拡大',
          description: '20施設とのネットワーク接続',
          targetDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          completedDate: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
          status: 'completed',
          progress: 100,
          deliverables: ['接続施設リスト', '運用マニュアル']
        },
        {
          id: 'ms_203',
          name: '本格運用開始',
          description: '地域連携パスの運用開始',
          targetDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          completedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          status: 'completed',
          progress: 100,
          deliverables: ['運用開始報告', '成果報告書']
        }
      ],
      resources: [
        {
          type: 'personnel',
          allocated: 12,
          used: 12,
          remaining: 0,
          unit: '人',
          utilizationRate: 100
        },
        {
          type: 'budget',
          allocated: 15000000,
          used: 14800000,
          remaining: 200000,
          unit: '円',
          utilizationRate: 99
        }
      ],
      estimatedBudget: 15000000,
      actualSpending: 14800000,
      issues: [],
      activeIssuesCount: 0,
      criticalIssuesCount: 0,
      coordinations: [],
      pendingCoordinations: 0,
      kpis: [
        { name: '参加施設数', target: '20施設', current: '22施設', achievement: 110 },
        { name: '情報共有件数', target: '月100件', current: '月120件', achievement: 120 },
        { name: '連携満足度', target: '80%', current: '88%', achievement: 110 }
      ],
      approvedBy: '鈴木事務長',
      approvedDate: new Date(now.getTime() - 370 * 24 * 60 * 60 * 1000),
      approvalLevel: 10,
      createdAt: new Date(now.getTime() - 375 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      lastReviewDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      outcomes: {
        description: '地域医療ネットワークの構築により、患者情報の円滑な共有と地域連携パスの運用が実現した',
        metrics: ['参加施設22施設', '月間情報共有120件', '満足度88%'],
        impact: '地域医療の質向上と効率化に大きく貢献。今後の展開モデルとなる'
      },
      tags: ['地域医療', 'DX', 'ネットワーク', '連携']
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
    this.projects.set(project3.id, project3);
  }
}

// シングルトンインスタンス
export const facilityProjectManagementService = new FacilityProjectManagementService();
