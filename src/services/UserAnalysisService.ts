import { demoUsers } from '../data/demo/users';
import { demoPosts } from '../data/demo/posts';
import { demoProjects } from '../data/demo/projects';
import { GenerationalAnalysisService } from './GenerationalAnalysisService';
import { HierarchicalAnalysisService } from './HierarchicalAnalysisService';

interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

interface UserMetrics {
  totalUsers: number;
  totalGenerations: number;
  totalHierarchies: number;
  engagementScore: number;
  participationRate: number;
  collaborationIndex: number;
  satisfactionScore: number;
}

interface CrossAnalysisData {
  generation: string;
  hierarchy: string;
  count: number;
  avgEngagement: number;
  avgParticipation: number;
  characteristics: string[];
}

interface UserRanking {
  id: string;
  name: string;
  position: string;
  facility: string;
  department: string;
  permissionLevel: number;
  experienceYears: number;
  directReports: number;
  budgetAuthority: number;
  rankingScore: number;
  generation: string;
  hierarchy: string;
  engagementScore: number;
  participationRate: number;
}

interface FacilityUserStats {
  facilityId: string;
  facilityName: string;
  totalUsers: number;
  avgPermissionLevel: number;
  avgExperienceYears: number;
  generationDistribution: { [key: string]: number };
  hierarchyDistribution: { [key: string]: number };
  topPerformers: UserRanking[];
}

interface UserAnalysisResult {
  scope: AnalysisScope;
  metrics: UserMetrics;
  crossAnalysis: CrossAnalysisData[];
  userRankings: UserRanking[];
  facilityStats: FacilityUserStats[];
  departmentStats: any[];
  insights: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
  };
}

export class UserAnalysisService {
  
  // 世代分類（GenerationalAnalysisServiceから継承）
  private static classifyGeneration(experienceYears: number, hireYear: number): string {
    const currentYear = new Date().getFullYear();
    const estimatedAge = (currentYear - hireYear) + 25; // 新卒採用25歳想定

    if (estimatedAge <= 30) return 'Z世代';
    if (estimatedAge <= 45) return 'ミレニアル世代';
    if (estimatedAge <= 60) return 'X世代';
    return 'ベビーブーマー世代';
  }

  // 階層分類（HierarchicalAnalysisServiceから継承）
  private static classifyHierarchy(permissionLevel: number, directReports: number = 0): string {
    if (permissionLevel >= 8) return '経営層';
    if (permissionLevel >= 7) return '上級管理職';
    if (permissionLevel >= 5) return '中間管理職';
    if (permissionLevel >= 3) return '主任・リーダー';
    return '一般職員';
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

  // ユーザーランキングスコア計算（法人統合ダッシュボードから継承）
  private static calculateUserRankingScore(user: any): number {
    let score = 0;
    
    // 権限レベル (30点満点)
    score += (user.permissionLevel || 1) * 5;
    
    // 在籍期間 (25点満点)
    const joinDate = user.joinDate || user.hireDate ? new Date(user.joinDate || user.hireDate) : new Date();
    const yearsOfService = new Date().getFullYear() - joinDate.getFullYear();
    score += Math.min(yearsOfService * 3, 25);
    
    // 直属部下数 (20点満点) 
    if (user.directReports || user.children_ids?.length) {
      const reportCount = user.directReports || user.children_ids?.length || 0;
      score += Math.min(reportCount * 2, 20);
    }
    
    // 予算承認権限 (15点満点)
    if (user.budgetApprovalLimit) {
      score += Math.min(user.budgetApprovalLimit / 100000, 15);
    }
    
    // ボーナスポイント (10点満点)
    if (user.accountType === 'CHAIRMAN') score += 10;
    else if (user.accountType === 'EXECUTIVE_SECRETARY') score += 8;
    else if (user.accountType === 'HR_DIRECTOR') score += 6;
    else if (user.accountType === 'HR_DEPARTMENT_HEAD') score += 4;
    else if (user.accountType === 'FACILITY_HEAD') score += 3;
    else if (user.accountType === 'DEPARTMENT_HEAD') score += 2;
    
    return Math.round(score);
  }

  // エンゲージメントスコア計算
  private static calculateEngagementScore(userId: string): number {
    const userPosts = demoPosts.filter(post => post.author?.id === userId);
    const userComments = demoPosts.reduce((count, post) => count + (post.comments?.length || 0), 0);
    const userProjects = demoProjects.filter(project => 
      project.teamMembers?.includes(userId)
    );

    return ((userPosts.length * 3) + (userComments * 2) + (userProjects.length * 5)) / 10;
  }

  // 参加率計算
  private static calculateParticipationRate(userId: string): number {
    const userPosts = demoPosts.filter(post => post.author?.id === userId);
    const totalPosts = demoPosts.length;
    return totalPosts > 0 ? (userPosts.length / totalPosts) * 100 : 0;
  }

  // 施設マッピング
  private static getFacilityMapping() {
    return {
      'kohara_hospital': '小原病院',
      'tategami_hospital': '立神リハ温泉病院',
      'espoir_tategami': 'エスポワール立神',
      'nursing_care_medical_institution': '介護医療院',
      'hojuan': '宝寿庵',
      'visiting_nursing_station': '訪問看護ステーション',
      'home_care_service': '訪問介護事業所',
      'home_care_support': '居宅介護支援事業所'
    };
  }

  // 部署マッピング
  private static getDepartmentMapping() {
    return {
      'regional_comprehensive_care_ward': '地域包括医療病棟',
      'regional_comprehensive_medical_ward': '地域包括ケア病棟',
      'recovery_rehabilitation_ward': '回復期リハビリ病棟',
      'outpatient': '外来',
      'other_kohara': 'その他',
      'medical_therapy_ward': '医療療養病棟',
      'rehabilitation_department': 'リハビリテーション部',
      'hot_spring_therapy': '温泉療法部',
      'other_tategami': 'その他'
    };
  }

  // クロス分析（世代×階層）
  private static generateCrossAnalysis(users: any[]): CrossAnalysisData[] {
    const crossData: { [key: string]: CrossAnalysisData } = {};

    users.forEach(user => {
      const hireYear = user.hireDate || user.joinDate ? 
        new Date(user.hireDate || user.joinDate).getFullYear() : 2020;
      const generation = this.classifyGeneration(user.experienceYears || 0, hireYear);
      const hierarchy = this.classifyHierarchy(user.permissionLevel || 1, user.directReports || 0);
      const key = `${generation}-${hierarchy}`;

      if (!crossData[key]) {
        crossData[key] = {
          generation,
          hierarchy,
          count: 0,
          avgEngagement: 0,
          avgParticipation: 0,
          characteristics: []
        };
      }

      crossData[key].count++;
      crossData[key].avgEngagement += this.calculateEngagementScore(user.id);
      crossData[key].avgParticipation += this.calculateParticipationRate(user.id);
    });

    // 平均値計算と特性設定
    Object.values(crossData).forEach(data => {
      data.avgEngagement = data.avgEngagement / data.count;
      data.avgParticipation = data.avgParticipation / data.count;
      
      // 世代×階層の特性を設定
      data.characteristics = this.getCrossCharacteristics(data.generation, data.hierarchy);
    });

    return Object.values(crossData);
  }

  // 世代×階層の特性取得
  private static getCrossCharacteristics(generation: string, hierarchy: string): string[] {
    const combinations: { [key: string]: string[] } = {
      'Z世代-経営層': ['革新的リーダーシップ', 'デジタル変革推進'],
      'Z世代-上級管理職': ['技術導入推進', '新世代との橋渡し'],
      'Z世代-中間管理職': ['効率化提案', 'デジタル業務改善'],
      'Z世代-主任・リーダー': ['現場イノベーション', '技術活用'],
      'Z世代-一般職員': ['デジタル適応力', '新技術習得'],
      
      'ミレニアル世代-経営層': ['バランス型経営', '多様性重視'],
      'ミレニアル世代-上級管理職': ['働き方改革', 'チーム重視'],
      'ミレニアル世代-中間管理職': ['効率的管理', '部下との連携'],
      'ミレニアル世代-主任・リーダー': ['コラボレーション', '成果重視'],
      'ミレニアル世代-一般職員': ['業務効率化', '継続学習'],
      
      'X世代-経営層': ['実績重視経営', '安定成長'],
      'X世代-上級管理職': ['実務経験活用', '組織安定'],
      'X世代-中間管理職': ['現実的管理', '経験重視'],
      'X世代-主任・リーダー': ['実用的改善', '技術継承'],
      'X世代-一般職員': ['安定業務', '専門技術'],
      
      'ベビーブーマー世代-経営層': ['長期戦略', '組織文化'],
      'ベビーブーマー世代-上級管理職': ['経験継承', '品質重視'],
      'ベビーブーマー世代-中間管理職': ['メンターシップ', '伝統重視'],
      'ベビーブーマー世代-主任・リーダー': ['技術指導', '品質管理'],
      'ベビーブーマー世代-一般職員': ['豊富経験', '職人技術']
    };

    return combinations[`${generation}-${hierarchy}`] || ['バランス型', '協調性'];
  }

  // 施設別ユーザー統計
  private static generateFacilityStats(users: any[]): FacilityUserStats[] {
    const facilityMapping = this.getFacilityMapping();
    const facilityStats: { [key: string]: FacilityUserStats } = {};

    // 初期化
    Object.entries(facilityMapping).forEach(([id, name]) => {
      facilityStats[id] = {
        facilityId: id,
        facilityName: name,
        totalUsers: 0,
        avgPermissionLevel: 0,
        avgExperienceYears: 0,
        generationDistribution: {},
        hierarchyDistribution: {},
        topPerformers: []
      };
    });

    // データ集計
    users.forEach(user => {
      const facilityId = user.facility_id || user.facilityId;
      if (!facilityId || !facilityStats[facilityId]) return;

      const stats = facilityStats[facilityId];
      const hireYear = user.hireDate || user.joinDate ? 
        new Date(user.hireDate || user.joinDate).getFullYear() : 2020;
      const generation = this.classifyGeneration(user.experienceYears || 0, hireYear);
      const hierarchy = this.classifyHierarchy(user.permissionLevel || 1, user.directReports || 0);

      stats.totalUsers++;
      stats.avgPermissionLevel += user.permissionLevel || 1;
      stats.avgExperienceYears += user.experienceYears || 0;
      
      stats.generationDistribution[generation] = (stats.generationDistribution[generation] || 0) + 1;
      stats.hierarchyDistribution[hierarchy] = (stats.hierarchyDistribution[hierarchy] || 0) + 1;
    });

    // 平均値計算
    Object.values(facilityStats).forEach(stats => {
      if (stats.totalUsers > 0) {
        stats.avgPermissionLevel = stats.avgPermissionLevel / stats.totalUsers;
        stats.avgExperienceYears = stats.avgExperienceYears / stats.totalUsers;
      }
    });

    return Object.values(facilityStats);
  }

  // 分析結果生成
  private static generateInsights(
    metrics: UserMetrics, 
    crossAnalysis: CrossAnalysisData[],
    userRankings: UserRanking[]
  ): { summary: string; keyFindings: string[]; recommendations: string[] } {
    
    const topPerformer = userRankings[0];
    const dominantCross = crossAnalysis.reduce((prev, current) => 
      prev.count > current.count ? prev : current
    );

    const summary = `総ユーザー数${metrics.totalUsers}名を対象とした包括的分析では、${dominantCross.generation}×${dominantCross.hierarchy}の組み合わせが${dominantCross.count}名で最多となっています。全体のエンゲージメントスコアは${metrics.engagementScore.toFixed(1)}、参加率は${metrics.participationRate.toFixed(1)}%で、組織全体の活性度は良好な水準を維持しています。トップパフォーマーは${topPerformer?.name || '未定'}（Level ${topPerformer?.permissionLevel || 0}）で、総合スコア${topPerformer?.rankingScore || 0}を記録しています。`;

    const keyFindings = [
      `${metrics.totalGenerations}世代×${metrics.totalHierarchies}階層の多様な組織構成により、豊富な視点と経験が組織に蓄積されている`,
      `${dominantCross.generation}×${dominantCross.hierarchy}層が組織の中核を担い、平均エンゲージメント${dominantCross.avgEngagement.toFixed(1)}の高い活動を示している`,
      `上位ランカーの平均権限レベルは${userRankings.slice(0, 10).reduce((sum, u) => sum + u.permissionLevel, 0) / 10}で、適切な人材配置が実現されている`,
      `世代間・階層間のコラボレーション指数${metrics.collaborationIndex.toFixed(1)}%は、組織の連携力の高さを示している`
    ];

    const recommendations = [
      '世代×階層のクロス分析結果を活用し、最適なチーム編成によりプロジェクト成功率を向上させる',
      'トップパフォーマーの成功パターンを分析し、他職員の能力開発プログラムに反映する',
      '各世代・階層の特性を活かした役割分担により、組織全体の生産性を最大化する',
      'エンゲージメントの低い世代×階層の組み合わせに対し、重点的な支援策を実施する',
      '施設間・部門間の人材交流を促進し、組織全体の知識共有とスキル向上を図る',
      'データドリブンな人事評価制度により、公平で透明性の高い組織運営を実現する'
    ];

    return { summary, keyFindings, recommendations };
  }

  // メイン分析実行
  static async getUserAnalysis(scope: AnalysisScope): Promise<UserAnalysisResult> {
    const filteredUsers = this.filterUsersByScope(demoUsers, scope);
    const facilityMapping = this.getFacilityMapping();
    const departmentMapping = this.getDepartmentMapping();

    // 基本メトリクス計算
    const totalUsers = filteredUsers.length;
    const generations = new Set(filteredUsers.map(user => {
      const hireYear = user.hireDate || user.joinDate ? 
        new Date(user.hireDate || user.joinDate).getFullYear() : 2020;
      return this.classifyGeneration(user.experienceYears || 0, hireYear);
    }));
    const hierarchies = new Set(filteredUsers.map(user => 
      this.classifyHierarchy(user.permissionLevel || 1, user.directReports || 0)
    ));

    const totalEngagement = filteredUsers.reduce((sum, user) => 
      sum + this.calculateEngagementScore(user.id), 0);
    const totalParticipation = filteredUsers.reduce((sum, user) => 
      sum + this.calculateParticipationRate(user.id), 0);

    const metrics: UserMetrics = {
      totalUsers,
      totalGenerations: generations.size,
      totalHierarchies: hierarchies.size,
      engagementScore: totalEngagement / totalUsers,
      participationRate: totalParticipation / totalUsers,
      collaborationIndex: 85.4, // デモ値
      satisfactionScore: 4.2 // デモ値
    };

    // クロス分析
    const crossAnalysis = this.generateCrossAnalysis(filteredUsers);

    // ユーザーランキング
    const userRankings: UserRanking[] = filteredUsers.map(user => {
      const hireYear = user.hireDate || user.joinDate ? 
        new Date(user.hireDate || user.joinDate).getFullYear() : 2020;
      return {
        id: user.id,
        name: user.name,
        position: user.position || '職員',
        facility: facilityMapping[user.facility_id as keyof typeof facilityMapping] || '不明',
        department: departmentMapping[user.department_id as keyof typeof departmentMapping] || user.department || '不明',
        permissionLevel: user.permissionLevel || 1,
        experienceYears: user.experienceYears || 0,
        directReports: user.directReports || 0,
        budgetAuthority: user.budgetApprovalLimit || 0,
        rankingScore: this.calculateUserRankingScore(user),
        generation: this.classifyGeneration(user.experienceYears || 0, hireYear),
        hierarchy: this.classifyHierarchy(user.permissionLevel || 1, user.directReports || 0),
        engagementScore: this.calculateEngagementScore(user.id),
        participationRate: this.calculateParticipationRate(user.id)
      };
    }).sort((a, b) => b.rankingScore - a.rankingScore);

    // 施設別統計
    const facilityStats = this.generateFacilityStats(filteredUsers);

    // 部門別統計（簡易版）
    const departmentStats = []; // 実装は後で追加

    // 分析結果
    const insights = this.generateInsights(metrics, crossAnalysis, userRankings);

    return {
      scope,
      metrics,
      crossAnalysis,
      userRankings,
      facilityStats,
      departmentStats,
      insights
    };
  }
}