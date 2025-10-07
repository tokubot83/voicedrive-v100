/**
 * 戦略プロジェクト管理サービス
 * プロジェクト化モード専用
 */

import {
  StrategicProject,
  StrategicInitiativeStats,
  ProjectTemplate,
  StrategicProjectStatus,
  ProjectMilestone,
  ProjectRisk
} from '../types/strategicInitiatives';

class StrategicProjectService {
  private projects: Map<string, StrategicProject> = new Map();

  /**
   * 全プロジェクトを取得
   */
  getAllProjects(): StrategicProject[] {
    return Array.from(this.projects.values()).sort((a, b) => {
      // ステータス優先順位
      const statusPriority: Record<StrategicProjectStatus, number> = {
        'at_risk': 1,
        'in_progress': 2,
        'planning': 3,
        'on_hold': 4,
        'completed': 5,
        'cancelled': 6
      };
      return statusPriority[a.status] - statusPriority[b.status];
    });
  }

  /**
   * ステータス別プロジェクトを取得
   */
  getProjectsByStatus(status: StrategicProjectStatus): StrategicProject[] {
    return this.getAllProjects().filter(p => p.status === status);
  }

  /**
   * 進行中のプロジェクトを取得
   */
  getActiveProjects(): StrategicProject[] {
    return this.getAllProjects().filter(p =>
      p.status === 'in_progress' || p.status === 'planning'
    );
  }

  /**
   * リスクのあるプロジェクトを取得
   */
  getAtRiskProjects(): StrategicProject[] {
    return this.getProjectsByStatus('at_risk');
  }

  /**
   * プロジェクトIDで取得
   */
  getProjectById(id: string): StrategicProject | null {
    return this.projects.get(id) || null;
  }

  /**
   * 統計情報を取得
   */
  getStats(): StrategicInitiativeStats {
    const allProjects = this.getAllProjects();
    const activeProjects = this.getActiveProjects();
    const completedProjects = this.getProjectsByStatus('completed');
    const atRiskProjects = this.getAtRiskProjects();

    const totalBudget = allProjects.reduce((sum, p) => sum + p.budget.total, 0);
    const totalSpent = allProjects.reduce((sum, p) => sum + p.budget.spent, 0);

    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const averageProgress = activeProjects.length > 0
      ? activeProjects.reduce((sum, p) => sum + p.overallProgress, 0) / activeProjects.length
      : 0;

    // 期限内完了率
    const onTimeProjects = completedProjects.filter(p => {
      const lastMilestone = p.milestones[p.milestones.length - 1];
      return lastMilestone?.completedDate &&
        lastMilestone.completedDate <= lastMilestone.targetDate;
    });
    const onTimeRate = completedProjects.length > 0
      ? (onTimeProjects.length / completedProjects.length) * 100
      : 100;

    return {
      totalProjects: allProjects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      atRiskProjects: atRiskProjects.length,
      totalBudget,
      budgetUtilization,
      averageProgress,
      onTimeRate
    };
  }

  /**
   * プロジェクトを作成
   */
  createProject(project: Omit<StrategicProject, 'id' | 'createdAt' | 'updatedAt'>): StrategicProject {
    const newProject: StrategicProject = {
      ...project,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  /**
   * プロジェクトを更新
   */
  updateProject(id: string, updates: Partial<StrategicProject>): StrategicProject | null {
    const project = this.projects.get(id);
    if (!project) return null;

    const updated = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };

    this.projects.set(id, updated);
    return updated;
  }

  /**
   * マイルストーンを完了
   */
  completeMilestone(projectId: string, milestoneId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    milestone.status = 'completed';
    milestone.completedDate = new Date();
    milestone.completionRate = 100;

    // プロジェクト全体の進捗を再計算
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    project.overallProgress = (completedMilestones / project.milestones.length) * 100;

    this.projects.set(projectId, { ...project, updatedAt: new Date() });
    return true;
  }

  /**
   * リスクを追加
   */
  addRisk(projectId: string, risk: Omit<ProjectRisk, 'id'>): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const newRisk: ProjectRisk = {
      ...risk,
      id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    project.risks.push(newRisk);

    // 高リスクがある場合はプロジェクトステータスを at_risk に
    const hasHighRisk = project.risks.some(r =>
      r.level === 'high' && r.status !== 'resolved'
    );
    if (hasHighRisk && project.status === 'in_progress') {
      project.status = 'at_risk';
    }

    this.projects.set(projectId, { ...project, updatedAt: new Date() });
    return true;
  }

  /**
   * リスクを解決
   */
  resolveRisk(projectId: string, riskId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const risk = project.risks.find(r => r.id === riskId);
    if (!risk) return false;

    risk.status = 'resolved';

    // すべての高リスクが解決されたら at_risk を解除
    const hasUnresolvedHighRisk = project.risks.some(r =>
      r.level === 'high' && r.status !== 'resolved'
    );
    if (!hasUnresolvedHighRisk && project.status === 'at_risk') {
      project.status = 'in_progress';
    }

    this.projects.set(projectId, { ...project, updatedAt: new Date() });
    return true;
  }

  /**
   * プロジェクトテンプレートを取得
   */
  getTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'template_dx',
        name: 'DX推進プロジェクト',
        description: 'デジタルトランスフォーメーションによる業務効率化',
        category: 'digital',
        defaultDuration: 24,
        suggestedMilestones: [
          '現状分析・課題抽出',
          'システム選定',
          'パイロット導入',
          '全体展開',
          '効果測定'
        ],
        suggestedKPIs: ['業務時間削減率', 'ペーパーレス化率', '職員満足度'],
        estimatedBudget: 50000000
      },
      {
        id: 'template_community',
        name: '地域医療拠点化プロジェクト',
        description: '地域医療における中核施設としての機能強化',
        category: 'community',
        defaultDuration: 60,
        suggestedMilestones: [
          '地域ニーズ調査',
          '診療科拡充計画',
          '設備投資',
          '連携病院開拓',
          '認定取得'
        ],
        suggestedKPIs: ['紹介患者数', '逆紹介率', '地域連携施設数'],
        estimatedBudget: 380000000
      },
      {
        id: 'template_hr',
        name: '人材育成改革プロジェクト',
        description: '次世代リーダー育成と組織文化の醸成',
        category: 'hr',
        defaultDuration: 36,
        suggestedMilestones: [
          '育成プログラム設計',
          '研修体系構築',
          'メンター制度導入',
          'キャリアパス整備',
          '効果測定'
        ],
        suggestedKPIs: ['離職率低減', '内部昇進率', '研修満足度'],
        estimatedBudget: 15000000
      },
      {
        id: 'template_quality',
        name: '医療品質向上プロジェクト',
        description: '患者満足度向上と医療安全の強化',
        category: 'quality',
        defaultDuration: 18,
        suggestedMilestones: [
          '品質指標設定',
          '業務フロー改善',
          '職員教育',
          'システム導入',
          '認証取得'
        ],
        suggestedKPIs: ['患者満足度', 'インシデント発生率', '平均在院日数'],
        estimatedBudget: 25000000
      }
    ];
  }

  /**
   * デモプロジェクトを初期化
   */
  initializeDemoProjects(): void {
    // 既存のプロジェクトをクリア
    this.projects.clear();

    const now = new Date();

    // プロジェクト1: 地域医療拠点化プロジェクト
    const project1: StrategicProject = {
      id: 'demo_project_1',
      title: '地域医療拠点化プロジェクト',
      description: '地域における中核医療施設としての機能強化',
      objective: '紹介患者数を年間3000件に増加、地域連携施設を30施設まで拡大',
      status: 'in_progress',
      priority: 'critical',
      phase: 'execution',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2027, 2, 31),
      estimatedDuration: 39,
      overallProgress: 65,
      milestones: [
        {
          id: 'ms1_1',
          title: '地域ニーズ調査完了',
          description: '周辺地域の医療ニーズと競合分析',
          targetDate: new Date(2024, 5, 30),
          completedDate: new Date(2024, 5, 28),
          status: 'completed',
          completionRate: 100
        },
        {
          id: 'ms1_2',
          title: '診療科拡充計画策定',
          description: '新規診療科の選定と収支計画',
          targetDate: new Date(2024, 11, 31),
          completedDate: new Date(2024, 11, 20),
          status: 'completed',
          completionRate: 100
        },
        {
          id: 'ms1_3',
          title: '新棟基本設計完了',
          description: '増築棟の基本設計と予算確定',
          targetDate: new Date(2025, 9, 20),
          status: 'in_progress',
          completionRate: 85
        },
        {
          id: 'ms1_4',
          title: '設備導入・診療開始',
          description: '新規設備の導入と診療科開設',
          targetDate: new Date(2026, 3, 1),
          status: 'pending',
          completionRate: 0
        },
        {
          id: 'ms1_5',
          title: '地域連携ネットワーク構築',
          description: '連携施設30件の達成',
          targetDate: new Date(2027, 2, 31),
          status: 'pending',
          completionRate: 0
        }
      ],
      budget: {
        total: 380000000,
        allocated: 380000000,
        spent: 245000000,
        remaining: 135000000,
        utilizationRate: 64.5
      },
      owner: '徳留 幸輝（院長）',
      teamMembers: [
        { userId: 'user_001', name: '徳留 幸輝', role: 'プロジェクトオーナー', department: '院長室', commitment: 20 },
        { userId: 'user_002', name: '田中 次郎', role: '事務局長', department: '事務部', commitment: 50 },
        { userId: 'user_003', name: '山田 花子', role: '看護部長', department: '看護部', commitment: 30 }
      ],
      teamSize: 35,
      kpis: [
        { id: 'kpi1_1', name: '紹介患者数', target: 3000, current: 2450, unit: '件/年', trend: 'up' },
        { id: 'kpi1_2', name: '地域連携施設数', target: 30, current: 22, unit: '施設', trend: 'up' },
        { id: 'kpi1_3', name: '逆紹介率', target: 85, current: 78, unit: '%', trend: 'stable' }
      ],
      risks: [
        {
          id: 'risk1_1',
          title: '新棟建設の遅延リスク',
          description: '基本設計の承認プロセスが長引いている',
          level: 'medium',
          probability: 'medium',
          impact: 'high',
          mitigation: '週次レビュー会議の設定、代替案の準備',
          status: 'mitigating',
          owner: '田中 次郎'
        }
      ],
      createdAt: new Date(2024, 0, 1),
      updatedAt: now,
      createdBy: 'user_001',
      lastModifiedBy: 'user_001',
      boardApprovalRequired: true,
      boardApprovalStatus: 'approved',
      boardPresentationDate: new Date(2023, 11, 15),
      tags: ['地域医療', '拠点化', '設備投資'],
      category: 'community'
    };

    // プロジェクト2: DX推進プロジェクト
    const project2: StrategicProject = {
      id: 'demo_project_2',
      title: 'DX推進プロジェクト',
      description: '電子カルテ刷新とペーパーレス化の推進',
      objective: '業務時間を30%削減、ペーパーレス化率90%達成',
      status: 'in_progress',
      priority: 'high',
      phase: 'execution',
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2025, 11, 31),
      estimatedDuration: 21,
      overallProgress: 82,
      milestones: [
        {
          id: 'ms2_1',
          title: '現状分析完了',
          description: '業務フロー分析と課題抽出',
          targetDate: new Date(2024, 5, 30),
          completedDate: new Date(2024, 5, 25),
          status: 'completed',
          completionRate: 100
        },
        {
          id: 'ms2_2',
          title: 'システムベンダー選定',
          description: 'RFP実施とベンダー決定',
          targetDate: new Date(2024, 8, 30),
          completedDate: new Date(2024, 9, 15),
          status: 'completed',
          completionRate: 100
        },
        {
          id: 'ms2_3',
          title: 'パイロット部署での稼働',
          description: '看護部での先行導入',
          targetDate: new Date(2025, 2, 31),
          completedDate: new Date(2025, 3, 10),
          status: 'completed',
          completionRate: 100
        },
        {
          id: 'ms2_4',
          title: '全体展開完了',
          description: '全部署での本格稼働',
          targetDate: new Date(2025, 11, 31),
          status: 'in_progress',
          completionRate: 45
        }
      ],
      budget: {
        total: 50000000,
        allocated: 50000000,
        spent: 41000000,
        remaining: 9000000,
        utilizationRate: 82
      },
      owner: '徳留 幸輝（院長）',
      teamMembers: [
        { userId: 'user_001', name: '徳留 幸輝', role: 'プロジェクトオーナー', department: '院長室', commitment: 15 },
        { userId: 'user_004', name: '佐藤 太郎', role: 'IT責任者', department: '情報システム部', commitment: 80 },
        { userId: 'user_005', name: '鈴木 美咲', role: '業務改善リーダー', department: '看護部', commitment: 40 }
      ],
      teamSize: 18,
      kpis: [
        { id: 'kpi2_1', name: '業務時間削減率', target: 30, current: 24, unit: '%', trend: 'up' },
        { id: 'kpi2_2', name: 'ペーパーレス化率', target: 90, current: 75, unit: '%', trend: 'up' },
        { id: 'kpi2_3', name: '職員満足度', target: 80, current: 72, unit: '点', trend: 'up' }
      ],
      risks: [
        {
          id: 'risk2_1',
          title: 'ベンダースケジュール遅延',
          description: 'システム開発の一部が遅れている',
          level: 'high',
          probability: 'high',
          impact: 'high',
          mitigation: '毎週進捗確認、代替機能の検討',
          status: 'identified',
          owner: '佐藤 太郎'
        }
      ],
      createdAt: new Date(2024, 3, 1),
      updatedAt: now,
      createdBy: 'user_001',
      lastModifiedBy: 'user_004',
      boardApprovalRequired: true,
      boardApprovalStatus: 'approved',
      boardPresentationDate: new Date(2024, 2, 10),
      tags: ['DX', 'ペーパーレス', '業務効率化'],
      category: 'digital'
    };

    // プロジェクト3: 人材育成改革プロジェクト
    const project3: StrategicProject = {
      id: 'demo_project_3',
      title: '人材育成改革プロジェクト',
      description: '次世代リーダー育成と組織文化の醸成',
      objective: '離職率を10%以下に低減、内部昇進率50%達成',
      status: 'planning',
      priority: 'medium',
      phase: 'planning',
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2027, 11, 31),
      estimatedDuration: 36,
      overallProgress: 15,
      milestones: [
        {
          id: 'ms3_1',
          title: '育成プログラム設計',
          description: 'リーダーシップ研修の体系化',
          targetDate: new Date(2025, 5, 30),
          status: 'in_progress',
          completionRate: 60
        },
        {
          id: 'ms3_2',
          title: 'メンター制度導入',
          description: '全部署でのメンター配置',
          targetDate: new Date(2025, 11, 31),
          status: 'pending',
          completionRate: 0
        },
        {
          id: 'ms3_3',
          title: 'キャリアパス整備',
          description: '職種別キャリアラダーの策定',
          targetDate: new Date(2026, 5, 30),
          status: 'pending',
          completionRate: 0
        },
        {
          id: 'ms3_4',
          title: '効果測定・改善',
          description: '離職率・満足度の継続モニタリング',
          targetDate: new Date(2027, 11, 31),
          status: 'pending',
          completionRate: 0
        }
      ],
      budget: {
        total: 15000000,
        allocated: 15000000,
        spent: 2200000,
        remaining: 12800000,
        utilizationRate: 14.7
      },
      owner: '徳留 幸輝（院長）',
      teamMembers: [
        { userId: 'user_001', name: '徳留 幸輝', role: 'プロジェクトオーナー', department: '院長室', commitment: 10 },
        { userId: 'user_006', name: '高橋 健一', role: '人事部長', department: '人事部', commitment: 60 }
      ],
      teamSize: 12,
      kpis: [
        { id: 'kpi3_1', name: '離職率', target: 10, current: 13.5, unit: '%', trend: 'down' },
        { id: 'kpi3_2', name: '内部昇進率', target: 50, current: 35, unit: '%', trend: 'stable' },
        { id: 'kpi3_3', name: '研修満足度', target: 85, current: 72, unit: '点', trend: 'up' }
      ],
      risks: [],
      createdAt: new Date(2025, 0, 1),
      updatedAt: now,
      createdBy: 'user_001',
      lastModifiedBy: 'user_006',
      boardApprovalRequired: true,
      boardApprovalStatus: 'pending',
      tags: ['人材育成', 'リーダーシップ', '組織文化'],
      category: 'hr'
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
    this.projects.set(project3.id, project3);
  }
}

// シングルトンインスタンス
export const strategicProjectService = new StrategicProjectService();
