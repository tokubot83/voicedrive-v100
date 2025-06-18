import { demoUsers } from '../data/demo/users';
import { posts } from '../data/demo/posts';
import { projects } from '../data/demo/projects';

interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

interface GenerationData {
  name: string;
  ageRange: string;
  count: number;
  percentage: number;
  characteristics: string[];
}

interface AnalysisResult {
  scope: AnalysisScope;
  generations: GenerationData[];
  insights: {
    summary: string;
    analysis: string;
    recommendations: string[];
  };
  metrics: {
    engagement: { [key: string]: number };
    participation: { [key: string]: number };
    votingPatterns: { [key: string]: any };
    collaborationIndex: { [key: string]: number };
  };
}

export class GenerationalAnalysisService {
  // 世代分類（経験年数ベース）
  private static classifyGeneration(experienceYears: number, hireYear: number): string {
    const currentYear = new Date().getFullYear();
    const estimatedAge = (currentYear - hireYear) + 25; // 新卒採用25歳想定

    if (estimatedAge <= 30) return 'Z世代';
    if (estimatedAge <= 45) return 'ミレニアル世代';
    if (estimatedAge <= 60) return 'X世代';
    return 'ベビーブーマー世代';
  }

  // 年齢範囲取得
  private static getAgeRange(generation: string): string {
    switch (generation) {
      case 'Z世代': return '22-30歳';
      case 'ミレニアル世代': return '31-45歳';
      case 'X世代': return '46-60歳';
      case 'ベビーブーマー世代': return '61歳以上';
      default: return '不明';
    }
  }

  // 世代特性取得
  private static getGenerationCharacteristics(generation: string): string[] {
    switch (generation) {
      case 'Z世代':
        return ['デジタルネイティブ', '多様性重視', '即時フィードバック', '社会的責任感'];
      case 'ミレニアル世代':
        return ['技術適応力', 'ワークライフバランス', 'コラボレーション', 'イノベーション志向'];
      case 'X世代':
        return ['実用主義', '独立性', '効率重視', 'リーダーシップ'];
      case 'ベビーブーマー世代':
        return ['豊富な経験', 'メンターシップ', '組織忠誠心', '品質重視'];
      default:
        return [];
    }
  }

  // スコープに基づくユーザーフィルタリング
  private static filterUsersByScope(users: any[], scope: AnalysisScope): any[] {
    switch (scope.type) {
      case 'facility':
        return users.filter(user => user.facilityId === scope.facilityId);
      case 'department':
        return users.filter(user => user.departmentId === scope.departmentId);
      case 'corporate':
        return users;
      default:
        return users;
    }
  }

  // 投票参加率計算
  private static calculateVotingParticipation(userId: string): number {
    // デモデータから投票履歴を取得（実際の実装では投票履歴データベースから取得）
    const userPosts = posts.filter(post => post.userId === userId);
    const totalPosts = posts.length;
    return totalPosts > 0 ? (userPosts.length / totalPosts) * 100 : 0;
  }

  // エンゲージメント指数計算
  private static calculateEngagementIndex(userId: string): number {
    const userPosts = posts.filter(post => post.userId === userId);
    const userComments = posts.reduce((count, post) => count + (post.comments?.length || 0), 0);
    const userProjects = projects.filter(project => 
      project.members?.some(member => member.userId === userId)
    );

    // エンゲージメント指数 = (投稿数 * 3 + コメント数 * 2 + プロジェクト参加数 * 5) / 10
    return ((userPosts.length * 3) + (userComments * 2) + (userProjects.length * 5)) / 10;
  }

  // コラボレーション指数計算
  private static calculateCollaborationIndex(userId: string): number {
    const userProjects = projects.filter(project => 
      project.members?.some(member => member.userId === userId)
    );
    
    const crossDepartmentProjects = userProjects.filter(project => {
      const departments = new Set(project.members?.map(member => {
        const user = demoUsers.find(u => u.id === member.userId);
        return user?.department;
      }));
      return departments.size > 1;
    });

    // コラボレーション指数 = (部門横断プロジェクト数 / 総プロジェクト数) * 100
    return userProjects.length > 0 ? (crossDepartmentProjects.length / userProjects.length) * 100 : 0;
  }

  // 自動分析文生成
  private static generateInsights(generations: GenerationData[], metrics: any): {
    summary: string;
    analysis: string;
    recommendations: string[];
  } {
    const totalUsers = generations.reduce((sum, gen) => sum + gen.count, 0);
    const dominantGeneration = generations.reduce((prev, current) => 
      prev.count > current.count ? prev : current
    );

    // エンゲージメント最高世代
    const highestEngagement = Object.entries(metrics.engagement).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    );

    // 参加率最高世代
    const highestParticipation = Object.entries(metrics.participation).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    );

    const summary = `分析対象者数${totalUsers}名の中で、${dominantGeneration.name}が${dominantGeneration.percentage}%（${dominantGeneration.count}名）と最も多い構成となっています。エンゲージメント指数が最も高いのは${highestEngagement[0]}（${highestEngagement[1].toFixed(1)}ポイント）で、参加率では${highestParticipation[0]}が${highestParticipation[1].toFixed(1)}%でトップとなっています。`;

    const analysis = `世代間の特徴として、Z世代は新しい技術やデジタルツールの活用に長けており、提案の際も革新的なアイデアを積極的に発信する傾向があります。ミレニアル世代はワークライフバランスを重視しながらも、組織の効率化や改善に向けた建設的な提案を多く行っています。X世代は実務経験を活かした実用的な改善案を提示し、ベビーブーマー世代は豊富な経験に基づく質の高いフィードバックと後進の指導に力を発揮しています。投票行動においても、各世代で異なる価値観が反映されており、多様な視点からの合意形成が実現されています。`;

    const recommendations = [
      'Z世代のデジタル活用スキルを活かし、システムUIの改善提案やオンラインコラボレーションツールの導入を推進する',
      'ミレニアル世代の効率化志向を活用し、業務プロセス改善プロジェクトのリーダーシップを委ねる',
      'X世代の実務経験を生かし、新人教育や品質管理体制の構築を担当してもらう',
      'ベビーブーマー世代のメンターシップ機能を強化し、世代間の知識継承プログラムを設計する',
      '世代間の価値観の違いを理解し、多様な視点を取り入れた意思決定プロセスを構築する',
      '各世代の強みを活かした混合チーム編成により、イノベーションと安定性を両立する'
    ];

    return { summary, analysis, recommendations };
  }

  // メイン分析実行
  static async getGenerationalAnalysis(scope: AnalysisScope): Promise<AnalysisResult> {
    // スコープに基づくユーザーフィルタリング
    const filteredUsers = this.filterUsersByScope(demoUsers, scope);

    // 世代分類とカウント
    const generationCounts: { [key: string]: number } = {};
    const userGenerations: { [key: string]: string } = {};

    filteredUsers.forEach(user => {
      const hireYear = user.hireDate ? new Date(user.hireDate).getFullYear() : 2020;
      const generation = this.classifyGeneration(user.experienceYears || 0, hireYear);
      generationCounts[generation] = (generationCounts[generation] || 0) + 1;
      userGenerations[user.id] = generation;
    });

    // 世代データ構築
    const totalUsers = filteredUsers.length;
    const generations: GenerationData[] = Object.entries(generationCounts).map(([name, count]) => ({
      name,
      ageRange: this.getAgeRange(name),
      count,
      percentage: Math.round((count / totalUsers) * 100),
      characteristics: this.getGenerationCharacteristics(name)
    }));

    // メトリクス計算
    const metrics = {
      engagement: {} as { [key: string]: number },
      participation: {} as { [key: string]: number },
      votingPatterns: {} as { [key: string]: any },
      collaborationIndex: {} as { [key: string]: number }
    };

    // 世代別メトリクス計算
    Object.keys(generationCounts).forEach(generation => {
      const generationUsers = filteredUsers.filter(user => userGenerations[user.id] === generation);
      
      // エンゲージメント指数
      const avgEngagement = generationUsers.reduce((sum, user) => 
        sum + this.calculateEngagementIndex(user.id), 0) / generationUsers.length;
      metrics.engagement[generation] = Math.round(avgEngagement * 10) / 10;

      // 参加率
      const avgParticipation = generationUsers.reduce((sum, user) => 
        sum + this.calculateVotingParticipation(user.id), 0) / generationUsers.length;
      metrics.participation[generation] = Math.round(avgParticipation * 10) / 10;

      // コラボレーション指数
      const avgCollaboration = generationUsers.reduce((sum, user) => 
        sum + this.calculateCollaborationIndex(user.id), 0) / generationUsers.length;
      metrics.collaborationIndex[generation] = Math.round(avgCollaboration * 10) / 10;

      // 投票パターン（デモ用に簡易実装）
      metrics.votingPatterns[generation] = {
        supportRate: 65 + Math.random() * 20, // 65-85%の範囲
        neutralRate: 15 + Math.random() * 10, // 15-25%の範囲
        opposeRate: 5 + Math.random() * 10     // 5-15%の範囲
      };
    });

    // 自動分析文生成
    const insights = this.generateInsights(generations, metrics);

    return {
      scope,
      generations,
      insights,
      metrics
    };
  }

  // 特定の世代の詳細分析
  static async getGenerationDetail(generationName: string, scope: AnalysisScope): Promise<any> {
    const filteredUsers = this.filterUsersByScope(demoUsers, scope);
    const generationUsers = filteredUsers.filter(user => {
      const hireYear = user.hireDate ? new Date(user.hireDate).getFullYear() : 2020;
      const generation = this.classifyGeneration(user.experienceYears || 0, hireYear);
      return generation === generationName;
    });

    return {
      users: generationUsers,
      averageExperience: generationUsers.reduce((sum, user) => sum + (user.experienceYears || 0), 0) / generationUsers.length,
      topPerformers: generationUsers.slice(0, 5), // 上位5名
      commonDepartments: [...new Set(generationUsers.map(user => user.department))],
      projectInvolvement: projects.filter(project => 
        project.members?.some(member => generationUsers.some(user => user.id === member.userId))
      ).length
    };
  }
}