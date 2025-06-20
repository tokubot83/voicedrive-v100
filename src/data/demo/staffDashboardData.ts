// スタッフダッシュボード用のデモデータ
export interface StaffDashboardData {
  totalStaff: number;
  activeProjects: number;
  pendingApprovals: number;
  completedTasks: number;
  departments: Array<{
    id: string;
    name: string;
    staff: number;
    projects: number;
    efficiency: number;
  }>;
  monthlyStats: Array<{
    month: string;
    proposals: number;
    completed: number;
    efficiency: number;
  }>;
}

export const staffDashboardData: StaffDashboardData = {
  totalStaff: 10,
  activeProjects: 3,
  pendingApprovals: 1,
  completedTasks: 15,
  departments: [
    {
      id: 'medical_therapy_ward',
      name: '医療療養病棟',
      staff: 10,
      projects: 3,
      efficiency: 92
    }
  ],
  monthlyStats: [
    { month: '2025-01', proposals: 2, completed: 1, efficiency: 85 },
    { month: '2025-02', proposals: 3, completed: 2, efficiency: 88 },
    { month: '2025-03', proposals: 4, completed: 3, efficiency: 90 },
    { month: '2025-04', proposals: 3, completed: 4, efficiency: 92 },
    { month: '2025-05', proposals: 5, completed: 3, efficiency: 89 },
    { month: '2025-06', proposals: 6, completed: 4, efficiency: 94 }
  ]
};

// 部署別分析データ
export const nursingDepartmentAnalytics = {
  departmentName: '医療療養病棟',
  totalStaff: 10,
  activeProjects: 3,
  completionRate: 94,
  engagementScore: 85,
  monthlyTrends: [
    { month: '2025-01', engagement: 82, projects: 2, completion: 90 },
    { month: '2025-02', engagement: 83, projects: 2, completion: 88 },
    { month: '2025-03', engagement: 84, projects: 3, completion: 92 },
    { month: '2025-04', engagement: 85, projects: 3, completion: 89 },
    { month: '2025-05', engagement: 86, projects: 4, completion: 94 },
    { month: '2025-06', engagement: 85, projects: 3, completion: 94 }
  ]
};

// 部署ランキング
export const departmentRankings = [
  {
    rank: 1,
    department: '医療療養病棟',
    score: 94,
    projects: 3,
    staff: 10,
    trend: 'up'
  }
];

// 施設分析データ
export const facilityAnalytics = {
  facilityName: '立神リハビリテーション温泉病院',
  totalStaff: 10,
  totalDepartments: 1,
  activeProjects: 3,
  completionRate: 89,
  overallEngagement: 85,
  performanceMetrics: {
    efficiency: 92,
    innovation: 88,
    collaboration: 86,
    satisfaction: 90
  }
};

// 部署間プロジェクト
export const crossDepartmentProjects = [
  {
    id: 'cross-1',
    title: '施設全体の業務効率化',
    departments: ['医療療養病棟', '事務部'],
    progress: 65,
    status: 'active'
  }
];

// 法人分析データ
export const corporateAnalytics = {
  corporateName: '厚生会',
  totalFacilities: 8,
  totalStaff: 350,
  activeProjects: 15,
  completionRate: 87,
  overallEngagement: 83,
  performanceMetrics: {
    efficiency: 89,
    innovation: 85,
    collaboration: 88,
    satisfaction: 86
  }
};

// 戦略的イニシアチブ
export const strategicInitiatives = [
  {
    id: 'init-1',
    title: 'デジタル変革推進',
    description: '全施設でのIT化推進',
    progress: 68,
    status: 'active',
    facilities: ['立神リハビリテーション温泉病院', '小原病院']
  },
  {
    id: 'init-2',
    title: '職員満足度向上',
    description: '働き方改革と福利厚生充実',
    progress: 75,
    status: 'active',
    facilities: ['全施設']
  }
];

// 組織健全性
export const organizationalHealth = {
  overallScore: 85,
  categories: {
    leadership: 88,
    communication: 82,
    innovation: 85,
    engagement: 83,
    performance: 87
  },
  trends: [
    { month: '2025-01', score: 81 },
    { month: '2025-02', score: 82 },
    { month: '2025-03', score: 83 },
    { month: '2025-04', score: 84 },
    { month: '2025-05', score: 85 },
    { month: '2025-06', score: 85 }
  ]
};

export default staffDashboardData;