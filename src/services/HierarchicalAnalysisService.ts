import { demoUsers } from '../data/demo/users';
import { demoPosts } from '../data/demo/posts';
import { demoProjects } from '../data/demo/projects';

interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

interface HierarchyData {
  name: string;
  levelRange: string;
  count: number;
  percentage: number;
  characteristics: string[];
  averageExperience: number;
  averageDirectReports: number;
}

interface AnalysisResult {
  scope: AnalysisScope;
  hierarchies: HierarchyData[];
  insights: {
    summary: string;
    analysis: string;
    recommendations: string[];
  };
  metrics: {
    engagement: { [key: string]: number };
    participation: { [key: string]: number };
    decisionMaking: { [key: string]: any };
    collaborationIndex: { [key: string]: number };
  };
}

export class HierarchicalAnalysisService {
  // 階層分類（権限レベルベース）
  private static classifyHierarchy(permissionLevel: number, directReports: number = 0): string {
    if (permissionLevel >= 8) return '経営層';
    if (permissionLevel >= 7) return '上級管理職';
    if (permissionLevel >= 5) return '中間管理職';
    if (permissionLevel >= 3) return '主任・リーダー';
    return '一般職員';
  }

  // レベル範囲取得
  private static getLevelRange(hierarchy: string): string {
    switch (hierarchy) {
      case '経営層': return 'Level 8+';
      case '上級管理職': return 'Level 7+';
      case '中間管理職': return 'Level 5-6';
      case '主任・リーダー': return 'Level 3-4';
      case '一般職員': return 'Level 1-2';
      default: return '不明';
    }
  }

  // 階層特性取得
  private static getHierarchyCharacteristics(hierarchy: string): string[] {
    switch (hierarchy) {
      case '経営層':
        return ['戦略的意思決定', '組織全体統括', '長期ビジョン策定', '株主・理事会対応'];
      case '上級管理職':
        return ['部門統括管理', '予算責任', '人事権限', '戦略実行'];
      case '中間管理職':
        return ['チーム管理', '業務調整', '部下育成', '現場と経営の橋渡し'];
      case '主任・リーダー':
        return ['現場リーダーシップ', '業務改善', '新人指導', '専門性発揮'];
      case '一般職員':
        return ['実務遂行', '現場業務', '専門技術', '継続学習'];
      default:
        return [];
    }
  }

  // スコープに基づくユーザーフィルタリング
  private static filterUsersByScope(users: any[], scope: AnalysisScope): any[] {
    switch (scope.type) {
      case 'facility':
        return users.filter(user => 
          user.facility_id === scope.facilityId || 
          user.facilityId === scope.facilityId
        );
      case 'department':
        return users.filter(user => 
          user.department_id === scope.departmentId || 
          user.departmentId === scope.departmentId
        );
      case 'corporate':
        return users;
      default:
        return users;
    }
  }

  // 意思決定参加率計算
  private static calculateDecisionParticipation(userId: string): number {
    // デモデータから意思決定関連の投稿を取得
    const userPosts = demoPosts.filter(post => post.author?.id === userId);
    const decisionPosts = userPosts.filter(post => 
      post.content?.includes('提案') || 
      post.content?.includes('決定') ||
      post.content?.includes('承認') ||
      post.type === 'proposal'
    );
    const totalDecisionPosts = demoPosts.filter(post => 
      post.content?.includes('提案') || 
      post.content?.includes('決定') ||
      post.content?.includes('承認') ||
      post.type === 'proposal'
    ).length;
    
    return totalDecisionPosts > 0 ? (decisionPosts.length / totalDecisionPosts) * 100 : 0;
  }

  // エンゲージメント指数計算（階層別）
  private static calculateEngagementIndex(userId: string, permissionLevel: number): number {
    const userPosts = demoPosts.filter(post => post.author?.id === userId);
    const userComments = demoPosts.reduce((count, post) => count + (post.comments?.length || 0), 0);
    const userProjects = demoProjects.filter(project => 
      project.teamMembers?.includes(userId)
    );

    // 階層別重み付け
    const hierarchyWeight = permissionLevel >= 7 ? 1.5 : permissionLevel >= 5 ? 1.2 : 1.0;
    
    // エンゲージメント指数 = (投稿数 * 3 + コメント数 * 2 + プロジェクト参加数 * 5) * 階層重み / 10
    return ((userPosts.length * 3) + (userComments * 2) + (userProjects.length * 5)) * hierarchyWeight / 10;
  }

  // 階層間コラボレーション指数計算
  private static calculateHierarchicalCollaboration(userId: string, userHierarchy: string): number {
    const userProjects = demoProjects.filter(project => 
      project.teamMembers?.includes(userId)
    );
    
    const crossHierarchyProjects = userProjects.filter(project => {
      const memberHierarchies = new Set(project.teamMembers?.map(memberId => {
        const user = demoUsers.find(u => u.id === memberId);
        if (!user) return userHierarchy;
        return this.classifyHierarchy(user.permissionLevel || 1, user.directReports || 0);
      }));
      return memberHierarchies.size > 1;
    });

    // 階層間コラボレーション指数 = (階層横断プロジェクト数 / 総プロジェクト数) * 100
    return userProjects.length > 0 ? (crossHierarchyProjects.length / userProjects.length) * 100 : 0;
  }

  // 自動分析文生成
  private static generateInsights(hierarchies: HierarchyData[], metrics: any): {
    summary: string;
    analysis: string;
    recommendations: string[];
  } {
    const totalUsers = hierarchies.reduce((sum, hier) => sum + hier.count, 0);
    const dominantHierarchy = hierarchies.reduce((prev, current) => 
      prev.count > current.count ? prev : current
    );

    // エンゲージメント最高階層
    const highestEngagement = Object.entries(metrics.engagement).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    );

    // 意思決定参加率最高階層
    const highestDecisionMaking = Object.entries(metrics.decisionMaking).reduce((prev, current) => 
      current[1].participationRate > prev[1].participationRate ? current : prev
    );

    const summary = `分析対象者数${totalUsers}名の中で、${dominantHierarchy.name}が${dominantHierarchy.percentage}%（${dominantHierarchy.count}名）と最も多い構成となっています。エンゲージメント指数が最も高いのは${highestEngagement[0]}（${highestEngagement[1].toFixed(1)}ポイント）で、意思決定参加率では${highestDecisionMaking[0]}が${highestDecisionMaking[1].participationRate.toFixed(1)}%でトップとなっています。`;

    const analysis = `階層間の特徴として、経営層は戦略的な長期視点での提案が多く、組織全体の方向性に関する議論をリードしています。上級管理職は部門間調整や予算関連の実務的な提案を積極的に行い、組織運営の中核を担っています。中間管理職は現場と経営の橋渡し役として、具体的な業務改善提案や人材育成に関する投稿が目立ちます。主任・リーダー層は専門性を活かした技術的な改善提案や、新人教育に関する建設的な意見を多く発信しています。一般職員は現場の実情に基づく実用的な改善案や、日常業務の効率化に関する具体的な提案を行っており、各階層がそれぞれの役割と責任に応じた参加パターンを示しています。`;

    const recommendations = [
      '経営層の戦略的ビジョンを中間管理職まで効果的に伝達するため、階層間コミュニケーション機会を増加させる',
      '中間管理職の調整機能を強化し、現場と経営の情報伝達をより円滑にするための仕組みを構築する',
      '主任・リーダー層の専門性を活かし、技術的改善提案の実現を支援する予算・権限の委譲を検討する',
      '一般職員の現場知識を経営判断に反映させるボトムアップの提案制度を充実させる',
      '階層を跨いだプロジェクトチーム編成により、組織全体の連携と学習機会を拡大する',
      '各階層の役割と責任を明確化し、適切な権限委譲により意思決定の迅速化を図る'
    ];

    return { summary, analysis, recommendations };
  }

  // メイン分析実行
  static async getHierarchicalAnalysis(scope: AnalysisScope): Promise<AnalysisResult> {
    // スコープに基づくユーザーフィルタリング
    const filteredUsers = this.filterUsersByScope(demoUsers, scope);

    // 階層分類とカウント
    const hierarchyCounts: { [key: string]: number } = {};
    const userHierarchies: { [key: string]: string } = {};
    const hierarchyExperience: { [key: string]: number[] } = {};
    const hierarchyDirectReports: { [key: string]: number[] } = {};

    filteredUsers.forEach(user => {
      const hierarchy = this.classifyHierarchy(user.permissionLevel || 1, user.directReports || 0);
      hierarchyCounts[hierarchy] = (hierarchyCounts[hierarchy] || 0) + 1;
      userHierarchies[user.id] = hierarchy;
      
      // 経験年数集計
      if (!hierarchyExperience[hierarchy]) hierarchyExperience[hierarchy] = [];
      hierarchyExperience[hierarchy].push(user.experienceYears || 0);
      
      // 直属部下数集計
      if (!hierarchyDirectReports[hierarchy]) hierarchyDirectReports[hierarchy] = [];
      hierarchyDirectReports[hierarchy].push(user.directReports || 0);
    });

    // 階層データ構築
    const totalUsers = filteredUsers.length;
    const hierarchies: HierarchyData[] = Object.entries(hierarchyCounts).map(([name, count]) => ({
      name,
      levelRange: this.getLevelRange(name),
      count,
      percentage: Math.round((count / totalUsers) * 100),
      characteristics: this.getHierarchyCharacteristics(name),
      averageExperience: hierarchyExperience[name] ? 
        Math.round(hierarchyExperience[name].reduce((sum, exp) => sum + exp, 0) / hierarchyExperience[name].length) : 0,
      averageDirectReports: hierarchyDirectReports[name] ? 
        Math.round(hierarchyDirectReports[name].reduce((sum, reports) => sum + reports, 0) / hierarchyDirectReports[name].length) : 0
    }));

    // メトリクス計算
    const metrics = {
      engagement: {} as { [key: string]: number },
      participation: {} as { [key: string]: number },
      decisionMaking: {} as { [key: string]: any },
      collaborationIndex: {} as { [key: string]: number }
    };

    // 階層別メトリクス計算
    Object.keys(hierarchyCounts).forEach(hierarchy => {
      const hierarchyUsers = filteredUsers.filter(user => userHierarchies[user.id] === hierarchy);
      
      // エンゲージメント指数
      const avgEngagement = hierarchyUsers.reduce((sum, user) => 
        sum + this.calculateEngagementIndex(user.id, user.permissionLevel || 1), 0) / hierarchyUsers.length;
      metrics.engagement[hierarchy] = Math.round(avgEngagement * 10) / 10;

      // 参加率
      const avgParticipation = hierarchyUsers.reduce((sum, user) => 
        sum + this.calculateDecisionParticipation(user.id), 0) / hierarchyUsers.length;
      metrics.participation[hierarchy] = Math.round(avgParticipation * 10) / 10;

      // 階層間コラボレーション指数
      const avgCollaboration = hierarchyUsers.reduce((sum, user) => 
        sum + this.calculateHierarchicalCollaboration(user.id, hierarchy), 0) / hierarchyUsers.length;
      metrics.collaborationIndex[hierarchy] = Math.round(avgCollaboration * 10) / 10;

      // 意思決定パターン（デモ用に簡易実装）
      const avgPermissionLevel = hierarchyUsers.reduce((sum, user) => sum + (user.permissionLevel || 1), 0) / hierarchyUsers.length;
      metrics.decisionMaking[hierarchy] = {
        participationRate: avgParticipation,
        approvalRate: Math.min(90, 60 + avgPermissionLevel * 4), // レベルが高いほど承認率も高い
        initiationRate: Math.min(80, 40 + avgPermissionLevel * 3), // レベルが高いほど提案開始率も高い
        influenceScore: Math.min(100, avgPermissionLevel * 12) // 影響力スコア
      };
    });

    // 自動分析文生成
    const insights = this.generateInsights(hierarchies, metrics);

    return {
      scope,
      hierarchies,
      insights,
      metrics
    };
  }

  // 特定の階層の詳細分析
  static async getHierarchyDetail(hierarchyName: string, scope: AnalysisScope): Promise<any> {
    const filteredUsers = this.filterUsersByScope(demoUsers, scope);
    const hierarchyUsers = filteredUsers.filter(user => {
      const hierarchy = this.classifyHierarchy(user.permissionLevel || 1, user.directReports || 0);
      return hierarchy === hierarchyName;
    });

    return {
      users: hierarchyUsers,
      averageExperience: hierarchyUsers.reduce((sum, user) => sum + (user.experienceYears || 0), 0) / hierarchyUsers.length,
      averagePermissionLevel: hierarchyUsers.reduce((sum, user) => sum + (user.permissionLevel || 1), 0) / hierarchyUsers.length,
      averageDirectReports: hierarchyUsers.reduce((sum, user) => sum + (user.directReports || 0), 0) / hierarchyUsers.length,
      topPerformers: hierarchyUsers.slice(0, 5), // 上位5名
      commonDepartments: [...new Set(hierarchyUsers.map(user => user.department))],
      projectInvolvement: demoProjects.filter(project => 
        project.teamMembers?.some(memberId => hierarchyUsers.some(user => user.id === memberId))
      ).length,
      budgetAuthority: hierarchyUsers.reduce((sum, user) => sum + (user.budgetApprovalLimit || 0), 0) / hierarchyUsers.length
    };
  }
}