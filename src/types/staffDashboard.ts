// 職員ダッシュボード用のデータ型定義

export interface StaffMetrics {
  proposalCount: number;        // 提案数
  projectParticipation: number; // プロジェクト参加数
  commentCount: number;         // コメント数
  likesReceived: number;        // いいね獲得数
  votingParticipation: number;  // 投票参加率
  consensusContribution: number; // 合意形成貢献度
}

export interface MetricsTrend {
  period: string;   // 期間（月次・四半期）
  value: number;    // 値
  change: number;   // 前期比変化率
}

export interface StaffAnalytics {
  userId: string;
  userName: string;
  department: string;
  facility: string;
  position: string;
  metrics: StaffMetrics;
  trends: {
    monthly: MetricsTrend[];
    quarterly: MetricsTrend[];
  };
  ranking: {
    proposals: number;      // 提案数ランキング
    participation: number;  // 参加率ランキング
    engagement: number;     // エンゲージメントランキング
    overall: number;        // 総合ランキング
  };
}

export interface AggregatedMetrics {
  totalStaff: number;
  activeStaff: number;
  averageProposals: number;
  averageParticipation: number;
  averageEngagement: number;
  topPerformers: StaffAnalytics[];
  improvementOpportunities: StaffAnalytics[];
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  facilityId: string;
  facilityName: string;
  staffAnalytics: StaffAnalytics[];
  aggregatedMetrics: AggregatedMetrics;
  departmentRanking: number;
  benchmarkComparison: {
    proposalsVsBenchmark: number;
    participationVsBenchmark: number;
    engagementVsBenchmark: number;
  };
}

export interface FacilityAnalytics {
  facilityId: string;
  facilityName: string;
  departmentAnalytics: DepartmentAnalytics[];
  facilityMetrics: AggregatedMetrics;
  facilityRanking: number;
  crossDepartmentProjects: CrossDepartmentProject[];
  resourceAllocation: ResourceAllocation;
}

export interface CorporateAnalytics {
  organizationId?: string;
  organizationName?: string;
  organizationRanking?: number;
  facilityAnalytics: FacilityAnalytics[];
  corporateMetrics: AggregatedMetrics;
  organizationMetrics?: AggregatedMetrics;
  strategicInitiatives: StrategicInitiative[];
  organizationalHealth: OrganizationalHealth;
  investmentAnalysis: InvestmentAnalysis;
  strategicMetrics?: {
    marketCompetitiveness: number;
    growthPotential: number;
    governanceScore: number;
    digitalTransformation: number;
  };
  departmentAnalytics?: DepartmentAnalytics[];
}

export interface CrossDepartmentProject {
  projectId: string;
  projectName: string;
  involvedDepartments: string[];
  leadDepartment: string;
  participantCount: number;
  progress: number;
  expectedCompletion: string;
  roiProjection: number;
}

export interface ResourceAllocation {
  budgetAllocated: number;
  budgetUsed: number;
  staffHoursAllocated: number;
  staffHoursUsed: number;
  efficiency: number;
  utilizationRate: number;
}

export interface StrategicInitiative {
  initiativeId: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  expectedROI: number;
  involvedFacilities: string[];
  keyMetrics: {
    participationRate: number;
    completionRate: number;
    satisfactionScore: number;
  };
}

export interface OrganizationalHealth {
  engagementScore: number;
  collaborationIndex: number;
  innovationRate: number;
  retentionRate: number;
  satisfactionScore: number;
  cultureAlignment: number;
  trends: {
    engagement: MetricsTrend[];
    collaboration: MetricsTrend[];
    innovation: MetricsTrend[];
  };
}

export interface InvestmentAnalysis {
  totalInvestment: number;
  measuredReturns: number;
  roiPercentage: number;
  paybackPeriod: number;
  costSavings: number;
  productivityGains: number;
  qualityImprovements: number;
}

// ランキング関連
export interface RankingData {
  rank: number;
  userId: string;
  userName: string;
  department: string;
  value: number;
  change: number;
  badge?: 'gold' | 'silver' | 'bronze';
}

export interface Rankings {
  proposals: RankingData[];
  participation: RankingData[];
  comments: RankingData[];
  likes: RankingData[];
  overall: RankingData[];
}

// フィルター・設定
export interface DashboardFilters {
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  departments?: string[];
  facilities?: string[];
  staffLevels?: string[];
  metric: 'proposals' | 'participation' | 'engagement' | 'overall';
}

export interface DashboardConfig {
  level: 3 | 4 | 5;
  scope: 'department' | 'facility' | 'corporate';
  refreshInterval: number;
  displayMetrics: string[];
  chartTypes: string[];
}

// アラート・通知
export interface StaffAlert {
  alertId: string;
  type: 'low-participation' | 'high-performer' | 'engagement-drop' | 'milestone';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  targetUserId?: string;
  targetDepartment?: string;
  createdAt: Date;
  isRead: boolean;
}