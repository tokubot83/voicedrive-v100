/**
 * ボイス分析型定義
 * Level 14-17（人事部門）専用
 *
 * 職員カルテシステムから集団分析データを受信し、
 * 組織の声を可視化する機能
 */

/**
 * 集団分析データ（職員カルテから受信）
 */
export interface GroupAnalyticsData {
  // メタデータ
  analysisDate: string;        // 分析実施日
  period: {
    startDate: string;         // 分析期間開始
    endDate: string;           // 分析期間終了
  };

  // 投稿動向
  postingTrends: PostingTrends;

  // 感情分析（オプション）
  sentimentAnalysis?: SentimentAnalysis;

  // トピック分析（オプション）
  topicAnalysis?: TopicAnalysis;

  // エンゲージメント
  engagementMetrics: EngagementMetrics;

  // アラート
  alerts?: AnalyticsAlert[];

  // プライバシー保護情報
  privacyMetadata: PrivacyMetadata;
}

/**
 * 投稿動向データ
 */
export interface PostingTrends {
  totalPosts: number;           // 総投稿数
  totalUsers: number;           // 投稿した職員数（同意済みのみ）
  totalEligibleUsers: number;   // 同意済み職員総数
  participationRate: number;    // 投稿参加率 %

  // カテゴリ別
  byCategory: CategoryData[];

  // 部門別
  byDepartment: DepartmentData[];

  // レベル別
  byLevel: LevelData[];

  // 月次推移
  monthlyTrend: MonthlyTrendData[];
}

/**
 * カテゴリ別データ
 */
export interface CategoryData {
  category: string;             // カテゴリ名
  count: number;                // 投稿数
  percentage: number;           // 割合 %
}

/**
 * 部門別データ
 */
export interface DepartmentData {
  department: string;           // 部門名
  count: number;                // 投稿数
  percentage: number;           // 割合 %
}

/**
 * レベル別データ
 */
export interface LevelData {
  levelRange: string;           // レベル範囲（例："1-3"）
  count: number;                // 投稿数
  percentage: number;           // 割合 %
}

/**
 * 月次推移データ
 */
export interface MonthlyTrendData {
  month: string;                // 月（例："2025-09"）
  count: number;                // 投稿数
}

/**
 * 感情分析データ
 */
export interface SentimentAnalysis {
  positive: number;             // ポジティブ投稿数
  neutral: number;              // 中立投稿数
  negative: number;             // ネガティブ投稿数
  positiveRate: number;         // ポジティブ率 %
  negativeRate: number;         // ネガティブ率 %

  // 部門別感情
  byDepartment: DepartmentSentiment[];
}

/**
 * 部門別感情データ
 */
export interface DepartmentSentiment {
  department: string;           // 部門名
  positiveRate: number;         // ポジティブ率 %
  negativeRate: number;         // ネガティブ率 %
}

/**
 * トピック分析データ
 */
export interface TopicAnalysis {
  // 頻出キーワード
  topKeywords: KeywordData[];

  // 新興トピック
  emergingTopics: EmergingTopic[];

  // 部門別トピック
  byDepartment: DepartmentTopics[];
}

/**
 * キーワードデータ
 */
export interface KeywordData {
  keyword: string;              // キーワード
  count: number;                // 出現回数
  category: 'work' | 'environment' | 'welfare' | 'system' | 'other';
}

/**
 * 新興トピック
 */
export interface EmergingTopic {
  topic: string;                // トピック名
  growthRate: number;           // 増加率 %
  firstSeenDate: string;        // 初出現日
}

/**
 * 部門別トピック
 */
export interface DepartmentTopics {
  department: string;           // 部門名
  topTopics: string[];          // TOP 3トピック
}

/**
 * エンゲージメント指標
 */
export interface EngagementMetrics {
  averageCommentsPerPost: number;    // 投稿あたりコメント数
  averageVotesPerIdea: number;       // アイデアあたり投票数
  activeUserRate: number;            // アクティブユーザー率 %

  // 部門別エンゲージメント
  byDepartment: DepartmentEngagement[];
}

/**
 * 部門別エンゲージメント
 */
export interface DepartmentEngagement {
  department: string;           // 部門名
  engagementScore: number;      // エンゲージメントスコア（0-100）
}

/**
 * アラート
 */
export interface AnalyticsAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  topic: string;                // トピック
  description: string;          // 説明
  affectedDepartments: string[]; // 影響部門
  recommendedAction: string;    // 推奨アクション
}

/**
 * プライバシー保護メタデータ
 */
export interface PrivacyMetadata {
  totalConsentedUsers: number;        // 同意済み職員数
  minimumGroupSize: number;           // 最小グループサイズ（通常5）
  excludedSmallGroupsCount: number;   // 除外された小規模グループ数
}

/**
 * ボイス分析統計サマリー
 */
export interface VoiceAnalyticsSummary {
  // 基本指標
  totalPosts: number;
  participationRate: number;
  averagePostsPerUser: number;

  // エンゲージメント
  totalComments: number;
  totalVotes: number;
  engagementScore: number;        // 総合エンゲージメントスコア

  // 感情分析
  positiveRate: number;
  neutralRate: number;
  negativeRate: number;

  // トレンド
  trendDirection: 'up' | 'down' | 'stable';
  monthOverMonthChange: number;   // 前月比 %

  // アラート
  activeAlertsCount: number;
  criticalAlertsCount: number;
}

/**
 * 分析期間タイプ
 */
export type AnalysisPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * フィルタオプション
 */
export interface AnalyticsFilter {
  period: AnalysisPeriod;
  startDate?: string;
  endDate?: string;
  departments?: string[];
  levelRanges?: string[];
  categories?: string[];
}

/**
 * チャート用データポイント
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

/**
 * 時系列データ
 */
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

/**
 * ヒートマップデータ
 */
export interface HeatmapData {
  department: string;
  metric: string;
  value: number;
  normalized: number;           // 正規化された値（0-100）
}

/**
 * ダッシュボード設定
 */
export interface DashboardSettings {
  defaultPeriod: AnalysisPeriod;
  visibleWidgets: string[];
  refreshInterval: number;      // 分単位
  emailAlerts: boolean;
  alertThresholds: {
    participationRate: number;  // この値を下回るとアラート
    negativeRate: number;       // この値を上回るとアラート
    engagementScore: number;    // この値を下回るとアラート
  };
}

/**
 * ヘルパー関数：感情ラベルと色を取得
 */
export const getSentimentInfo = (rate: number, type: 'positive' | 'negative'): { label: string; color: string; icon: string } => {
  if (type === 'positive') {
    if (rate >= 70) return { label: '非常に良好', color: 'text-emerald-400 bg-emerald-900/30', icon: '😊' };
    if (rate >= 50) return { label: '良好', color: 'text-green-400 bg-green-900/30', icon: '🙂' };
    if (rate >= 30) return { label: '普通', color: 'text-yellow-400 bg-yellow-900/30', icon: '😐' };
    return { label: '要改善', color: 'text-orange-400 bg-orange-900/30', icon: '😟' };
  } else {
    if (rate >= 50) return { label: '危機的', color: 'text-red-400 bg-red-900/30', icon: '😰' };
    if (rate >= 30) return { label: '要注意', color: 'text-orange-400 bg-orange-900/30', icon: '😟' };
    if (rate >= 15) return { label: '軽微', color: 'text-yellow-400 bg-yellow-900/30', icon: '😐' };
    return { label: '良好', color: 'text-green-400 bg-green-900/30', icon: '🙂' };
  }
};

/**
 * ヘルパー関数：エンゲージメントスコアから評価を取得
 */
export const getEngagementLevel = (score: number): { label: string; color: string; icon: string } => {
  if (score >= 80) return { label: '非常に高い', color: 'text-emerald-400 bg-emerald-900/30', icon: '🔥' };
  if (score >= 60) return { label: '高い', color: 'text-green-400 bg-green-900/30', icon: '⚡' };
  if (score >= 40) return { label: '普通', color: 'text-yellow-400 bg-yellow-900/30', icon: '✨' };
  if (score >= 20) return { label: '低い', color: 'text-orange-400 bg-orange-900/30', icon: '💤' };
  return { label: '非常に低い', color: 'text-red-400 bg-red-900/30', icon: '🔇' };
};

/**
 * ヘルパー関数：アラート重要度から表示情報を取得
 */
export const getAlertSeverityInfo = (severity: AnalyticsAlert['severity']): { label: string; color: string; icon: string } => {
  const info: Record<AnalyticsAlert['severity'], { label: string; color: string; icon: string }> = {
    low: { label: '低', color: 'text-blue-400 bg-blue-900/30', icon: 'ℹ️' },
    medium: { label: '中', color: 'text-yellow-400 bg-yellow-900/30', icon: '⚠️' },
    high: { label: '高', color: 'text-orange-400 bg-orange-900/30', icon: '🔔' },
    critical: { label: '緊急', color: 'text-red-400 bg-red-900/30', icon: '🚨' }
  };
  return info[severity];
};

/**
 * ヘルパー関数：トレンド方向から表示情報を取得
 */
export const getTrendInfo = (direction: 'up' | 'down' | 'stable'): { label: string; color: string; icon: string } => {
  const info: Record<'up' | 'down' | 'stable', { label: string; color: string; icon: string }> = {
    up: { label: '増加傾向', color: 'text-emerald-400', icon: '📈' },
    down: { label: '減少傾向', color: 'text-red-400', icon: '📉' },
    stable: { label: '安定', color: 'text-blue-400', icon: '➡️' }
  };
  return info[direction];
};

/**
 * ヘルパー関数：参加率から評価を取得
 */
export const getParticipationRateInfo = (rate: number): { label: string; color: string; icon: string } => {
  if (rate >= 80) return { label: '非常に高い', color: 'text-emerald-400 bg-emerald-900/30', icon: '🎯' };
  if (rate >= 60) return { label: '高い', color: 'text-green-400 bg-green-900/30', icon: '✅' };
  if (rate >= 40) return { label: '普通', color: 'text-yellow-400 bg-yellow-900/30', icon: '📊' };
  if (rate >= 20) return { label: '低い', color: 'text-orange-400 bg-orange-900/30', icon: '📉' };
  return { label: '非常に低い', color: 'text-red-400 bg-red-900/30', icon: '⚠️' };
};
