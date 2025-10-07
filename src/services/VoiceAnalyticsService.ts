/**
 * ボイス分析サービス
 * Level 14-17（人事部門）専用
 *
 * 職員カルテシステムから受信した集団分析データを管理
 */

import {
  GroupAnalyticsData,
  VoiceAnalyticsSummary,
  AnalyticsFilter,
  AnalysisPeriod,
  ChartDataPoint,
  TimeSeriesData,
} from '../types/voiceAnalytics';

class VoiceAnalyticsService {
  private analyticsData: GroupAnalyticsData | null = null;

  constructor() {
    // デモデータで初期化
    this.initializeDemoData();
  }

  /**
   * デモデータ初期化
   */
  private initializeDemoData(): void {
    this.analyticsData = {
      analysisDate: '2025-10-07',
      period: {
        startDate: '2025-09-01',
        endDate: '2025-09-30',
      },

      // 投稿動向
      postingTrends: {
        totalPosts: 342,
        totalUsers: 89,
        totalEligibleUsers: 120,
        participationRate: 74.2,

        byCategory: [
          { category: 'アイデアボイス', count: 156, percentage: 45.6 },
          { category: 'フリーボイス', count: 98, percentage: 28.7 },
          { category: '議題提案', count: 58, percentage: 17.0 },
          { category: 'その他', count: 30, percentage: 8.8 },
        ],

        byDepartment: [
          { department: '看護部', count: 128, percentage: 37.4 },
          { department: 'リハビリ科', count: 86, percentage: 25.1 },
          { department: '事務部', count: 54, percentage: 15.8 },
          { department: '医局', count: 42, percentage: 12.3 },
          { department: 'その他', count: 32, percentage: 9.4 },
        ],

        byLevel: [
          { levelRange: '1-3', count: 198, percentage: 57.9 },
          { levelRange: '4-6', count: 92, percentage: 26.9 },
          { levelRange: '7-9', count: 38, percentage: 11.1 },
          { levelRange: '10+', count: 14, percentage: 4.1 },
        ],

        monthlyTrend: [
          { month: '2025-04', count: 186 },
          { month: '2025-05', count: 224 },
          { month: '2025-06', count: 298 },
          { month: '2025-07', count: 315 },
          { month: '2025-08', count: 328 },
          { month: '2025-09', count: 342 },
        ],
      },

      // 感情分析
      sentimentAnalysis: {
        positive: 189,
        neutral: 98,
        negative: 55,
        positiveRate: 55.3,
        negativeRate: 16.1,

        byDepartment: [
          { department: '看護部', positiveRate: 52.3, negativeRate: 18.8 },
          { department: 'リハビリ科', positiveRate: 61.6, negativeRate: 12.8 },
          { department: '事務部', positiveRate: 55.6, negativeRate: 14.8 },
          { department: '医局', positiveRate: 50.0, negativeRate: 19.0 },
          { department: 'その他', positiveRate: 56.3, negativeRate: 15.6 },
        ],
      },

      // トピック分析
      topicAnalysis: {
        topKeywords: [
          { keyword: '業務改善', count: 68, category: 'work' },
          { keyword: '働きやすさ', count: 54, category: 'environment' },
          { keyword: '研修', count: 42, category: 'work' },
          { keyword: '休暇', count: 38, category: 'welfare' },
          { keyword: 'コミュニケーション', count: 36, category: 'environment' },
          { keyword: 'システム', count: 32, category: 'system' },
          { keyword: 'シフト', count: 28, category: 'work' },
          { keyword: '設備', count: 24, category: 'environment' },
          { keyword: '連携', count: 22, category: 'work' },
          { keyword: '福利厚生', count: 20, category: 'welfare' },
        ],

        emergingTopics: [
          { topic: 'リモート勤務', growthRate: 245.0, firstSeenDate: '2025-08-15' },
          { topic: '新システム導入', growthRate: 168.0, firstSeenDate: '2025-07-28' },
          { topic: '世代間連携', growthRate: 132.0, firstSeenDate: '2025-08-05' },
        ],

        byDepartment: [
          { department: '看護部', topTopics: ['シフト調整', '患者対応', '業務効率化'] },
          { department: 'リハビリ科', topTopics: ['設備更新', '連携強化', '研修充実'] },
          { department: '事務部', topTopics: ['システム改善', '業務改善', 'ペーパーレス'] },
          { department: '医局', topTopics: ['研修体制', '連携強化', '働き方改革'] },
        ],
      },

      // エンゲージメント
      engagementMetrics: {
        averageCommentsPerPost: 3.8,
        averageVotesPerIdea: 12.4,
        activeUserRate: 68.3,

        byDepartment: [
          { department: '看護部', engagementScore: 72 },
          { department: 'リハビリ科', engagementScore: 78 },
          { department: '事務部', engagementScore: 65 },
          { department: '医局', engagementScore: 58 },
          { department: 'その他', engagementScore: 70 },
        ],
      },

      // アラート
      alerts: [
        {
          id: 'alert-001',
          severity: 'medium',
          topic: 'シフト調整の課題',
          description: '看護部において、シフト調整に関するネガティブな投稿が増加しています。',
          affectedDepartments: ['看護部'],
          recommendedAction: 'シフト管理システムの見直しと、現場ヒアリングの実施を推奨します。',
        },
        {
          id: 'alert-002',
          severity: 'low',
          topic: '新システム導入への期待',
          description: '事務部において、新システム導入に関するポジティブな投稿が増えています。',
          affectedDepartments: ['事務部'],
          recommendedAction: '導入スケジュールと研修計画を共有することで、期待に応えられます。',
        },
      ],

      // プライバシー保護情報
      privacyMetadata: {
        totalConsentedUsers: 120,
        minimumGroupSize: 5,
        excludedSmallGroupsCount: 2,
      },
    };
  }

  /**
   * 分析データを取得
   */
  getAnalyticsData(): GroupAnalyticsData | null {
    return this.analyticsData;
  }

  /**
   * サマリーを取得
   */
  getSummary(): VoiceAnalyticsSummary | null {
    if (!this.analyticsData) return null;

    const { postingTrends, sentimentAnalysis, engagementMetrics, alerts } = this.analyticsData;

    // 前月データ（仮）
    const lastMonthPosts = 328;
    const monthOverMonthChange = ((postingTrends.totalPosts - lastMonthPosts) / lastMonthPosts) * 100;

    return {
      totalPosts: postingTrends.totalPosts,
      participationRate: postingTrends.participationRate,
      averagePostsPerUser: postingTrends.totalPosts / postingTrends.totalUsers,

      totalComments: Math.round(postingTrends.totalPosts * engagementMetrics.averageCommentsPerPost),
      totalVotes: Math.round(156 * engagementMetrics.averageVotesPerIdea), // アイデアボイスのみ
      engagementScore: 71,

      positiveRate: sentimentAnalysis?.positiveRate || 0,
      neutralRate: sentimentAnalysis ? (sentimentAnalysis.neutral / postingTrends.totalPosts) * 100 : 0,
      negativeRate: sentimentAnalysis?.negativeRate || 0,

      trendDirection: monthOverMonthChange > 5 ? 'up' : monthOverMonthChange < -5 ? 'down' : 'stable',
      monthOverMonthChange,

      activeAlertsCount: alerts?.length || 0,
      criticalAlertsCount: alerts?.filter(a => a.severity === 'critical').length || 0,
    };
  }

  /**
   * フィルタリングされたデータを取得
   */
  getFilteredData(filter: AnalyticsFilter): GroupAnalyticsData | null {
    // 実際の実装では、フィルタに基づいてデータを絞り込む
    // デモでは全データを返す
    return this.analyticsData;
  }

  /**
   * カテゴリ別チャートデータを取得
   */
  getCategoryChartData(): ChartDataPoint[] {
    if (!this.analyticsData) return [];

    return this.analyticsData.postingTrends.byCategory.map((cat, index) => ({
      label: cat.category,
      value: cat.count,
      percentage: cat.percentage,
      color: this.getCategoryColor(index),
    }));
  }

  /**
   * 部門別チャートデータを取得
   */
  getDepartmentChartData(): ChartDataPoint[] {
    if (!this.analyticsData) return [];

    return this.analyticsData.postingTrends.byDepartment.map((dept, index) => ({
      label: dept.department,
      value: dept.count,
      percentage: dept.percentage,
      color: this.getDepartmentColor(index),
    }));
  }

  /**
   * 月次推移チャートデータを取得
   */
  getMonthlyTrendData(): TimeSeriesData[] {
    if (!this.analyticsData) return [];

    return this.analyticsData.postingTrends.monthlyTrend.map(trend => ({
      date: trend.month,
      value: trend.count,
      label: this.formatMonth(trend.month),
    }));
  }

  /**
   * 感情分析チャートデータを取得
   */
  getSentimentChartData(): ChartDataPoint[] {
    if (!this.analyticsData?.sentimentAnalysis) return [];

    const { positive, neutral, negative } = this.analyticsData.sentimentAnalysis;
    const total = positive + neutral + negative;

    return [
      {
        label: 'ポジティブ',
        value: positive,
        percentage: (positive / total) * 100,
        color: '#10b981', // emerald-500
      },
      {
        label: '中立',
        value: neutral,
        percentage: (neutral / total) * 100,
        color: '#6b7280', // gray-500
      },
      {
        label: 'ネガティブ',
        value: negative,
        percentage: (negative / total) * 100,
        color: '#ef4444', // red-500
      },
    ];
  }

  /**
   * トップキーワードを取得
   */
  getTopKeywords(limit: number = 10): ChartDataPoint[] {
    if (!this.analyticsData?.topicAnalysis) return [];

    return this.analyticsData.topicAnalysis.topKeywords
      .slice(0, limit)
      .map(kw => ({
        label: kw.keyword,
        value: kw.count,
        color: this.getKeywordCategoryColor(kw.category),
      }));
  }

  /**
   * 部門別エンゲージメントデータを取得
   */
  getDepartmentEngagementData(): ChartDataPoint[] {
    if (!this.analyticsData?.engagementMetrics) return [];

    return this.analyticsData.engagementMetrics.byDepartment.map((dept, index) => ({
      label: dept.department,
      value: dept.engagementScore,
      color: this.getEngagementColor(dept.engagementScore),
    }));
  }

  /**
   * データを更新（職員カルテから受信時に使用）
   */
  updateAnalyticsData(data: GroupAnalyticsData): void {
    this.analyticsData = data;
  }

  /**
   * カテゴリ色を取得
   */
  private getCategoryColor(index: number): string {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
    return colors[index % colors.length];
  }

  /**
   * 部門色を取得
   */
  private getDepartmentColor(index: number): string {
    const colors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#8b5cf6'];
    return colors[index % colors.length];
  }

  /**
   * キーワードカテゴリ色を取得
   */
  private getKeywordCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      work: '#3b82f6',       // blue
      environment: '#10b981', // green
      welfare: '#f59e0b',    // amber
      system: '#8b5cf6',     // purple
      other: '#6b7280',      // gray
    };
    return colorMap[category] || '#6b7280';
  }

  /**
   * エンゲージメントスコアに応じた色を取得
   */
  private getEngagementColor(score: number): string {
    if (score >= 80) return '#10b981'; // emerald
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // amber
    if (score >= 20) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  /**
   * 月フォーマット
   */
  private formatMonth(month: string): string {
    const [year, m] = month.split('-');
    return `${parseInt(m)}月`;
  }
}

// シングルトンインスタンス
export const voiceAnalyticsService = new VoiceAnalyticsService();
export default voiceAnalyticsService;
