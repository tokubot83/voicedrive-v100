// 職員ダッシュボード用デモデータ
import { 
  StaffAnalytics, 
  DepartmentAnalytics, 
  FacilityAnalytics, 
  CorporateAnalytics,
  Rankings,
  CrossDepartmentProject,
  StrategicInitiative,
  OrganizationalHealth,
  StaffAlert
} from '../../types/staffDashboard';

// Level 3: 部門職員データ（看護部の例）
export const nursingDepartmentStaff: StaffAnalytics[] = [
  {
    userId: 'nurse-001',
    userName: '田中 花子',
    department: '看護部',
    facility: '第一病院',
    position: '主任看護師',
    metrics: {
      proposalCount: 8,
      projectParticipation: 3,
      commentCount: 45,
      likesReceived: 67,
      votingParticipation: 0.95,
      consensusContribution: 0.88
    },
    trends: {
      monthly: [
        { period: '2025-04', value: 6, change: 0.2 },
        { period: '2025-05', value: 7, change: 0.17 },
        { period: '2025-06', value: 8, change: 0.14 }
      ],
      quarterly: [
        { period: '2024-Q4', value: 18, change: 0.15 },
        { period: '2025-Q1', value: 21, change: 0.17 }
      ]
    },
    ranking: {
      proposals: 1,
      participation: 2,
      engagement: 1,
      overall: 1
    }
  },
  {
    userId: 'nurse-002',
    userName: '佐藤 太郎',
    department: '看護部',
    facility: '第一病院',
    position: '看護師',
    metrics: {
      proposalCount: 6,
      projectParticipation: 2,
      commentCount: 32,
      likesReceived: 48,
      votingParticipation: 0.87,
      consensusContribution: 0.76
    },
    trends: {
      monthly: [
        { period: '2025-04', value: 4, change: 0.33 },
        { period: '2025-05', value: 5, change: 0.25 },
        { period: '2025-06', value: 6, change: 0.2 }
      ],
      quarterly: [
        { period: '2024-Q4', value: 12, change: 0.2 },
        { period: '2025-Q1', value: 15, change: 0.25 }
      ]
    },
    ranking: {
      proposals: 2,
      participation: 4,
      engagement: 3,
      overall: 2
    }
  },
  {
    userId: 'nurse-003',
    userName: '山田 美咲',
    department: '看護部',
    facility: '第一病院',
    position: '看護師',
    metrics: {
      proposalCount: 5,
      projectParticipation: 4,
      commentCount: 28,
      likesReceived: 39,
      votingParticipation: 0.92,
      consensusContribution: 0.82
    },
    trends: {
      monthly: [
        { period: '2025-04', value: 3, change: 0.5 },
        { period: '2025-05', value: 4, change: 0.33 },
        { period: '2025-06', value: 5, change: 0.25 }
      ],
      quarterly: [
        { period: '2024-Q4', value: 10, change: 0.25 },
        { period: '2025-Q1', value: 12, change: 0.2 }
      ]
    },
    ranking: {
      proposals: 3,
      participation: 1,
      engagement: 4,
      overall: 3
    }
  }
];

// Level 3: 部門分析データ
export const nursingDepartmentAnalytics: DepartmentAnalytics = {
  departmentId: 'dept-nursing-001',
  departmentName: '看護部',
  facilityId: 'facility-001',
  facilityName: '第一病院',
  staffAnalytics: nursingDepartmentStaff,
  aggregatedMetrics: {
    totalStaff: 24,
    activeStaff: 22,
    averageProposals: 4.2,
    averageParticipation: 2.8,
    averageEngagement: 0.83,
    topPerformers: nursingDepartmentStaff.slice(0, 3),
    improvementOpportunities: []
  },
  departmentRanking: 2, // 施設内で2位
  benchmarkComparison: {
    proposalsVsBenchmark: 0.18, // 業界平均より18%高い
    participationVsBenchmark: 0.25,
    engagementVsBenchmark: 0.12
  }
};

// クロス部門プロジェクトデモデータ
export const crossDepartmentProjects: CrossDepartmentProject[] = [
  {
    projectId: 'cross-001',
    projectName: '患者安全向上プロジェクト',
    involvedDepartments: ['看護部', '医師部', '薬剤部'],
    leadDepartment: '看護部',
    participantCount: 18,
    progress: 65,
    expectedCompletion: '2025-08-15',
    roiProjection: 2.3
  },
  {
    projectId: 'cross-002',
    projectName: 'デジタル化推進プロジェクト',
    involvedDepartments: ['看護部', '事務部', 'IT部'],
    leadDepartment: 'IT部',
    participantCount: 12,
    progress: 40,
    expectedCompletion: '2025-09-30',
    roiProjection: 3.1
  }
];

// Level 4: 施設分析データ
export const facilityAnalytics: FacilityAnalytics = {
  facilityId: 'facility-001',
  facilityName: '第一病院',
  departmentAnalytics: [nursingDepartmentAnalytics],
  facilityMetrics: {
    totalStaff: 156,
    activeStaff: 142,
    averageProposals: 3.8,
    averageParticipation: 2.4,
    averageEngagement: 0.79,
    topPerformers: [],
    improvementOpportunities: []
  },
  facilityRanking: 1, // 法人内で1位
  crossDepartmentProjects,
  resourceAllocation: {
    budgetAllocated: 15000000,
    budgetUsed: 12800000,
    staffHoursAllocated: 2400,
    staffHoursUsed: 2180,
    efficiency: 0.91,
    utilizationRate: 0.85
  }
};

// 戦略的イニシアチブデモデータ
export const strategicInitiatives: StrategicInitiative[] = [
  {
    initiativeId: 'init-001',
    title: 'DX推進による業務効率化',
    description: 'AIとデジタル技術を活用した業務プロセスの最適化',
    status: 'in-progress',
    progress: 58,
    expectedROI: 2.8,
    involvedFacilities: ['第一病院', '第二病院', '第三病院'],
    keyMetrics: {
      participationRate: 0.74,
      completionRate: 0.82,
      satisfactionScore: 4.2
    }
  },
  {
    initiativeId: 'init-002',
    title: '働き方改革推進',
    description: 'ワークライフバランス向上と生産性向上の両立',
    status: 'in-progress',
    progress: 71,
    expectedROI: 1.9,
    involvedFacilities: ['第一病院', '第二病院'],
    keyMetrics: {
      participationRate: 0.89,
      completionRate: 0.76,
      satisfactionScore: 4.5
    }
  }
];

// 組織健康度指標
export const organizationalHealth: OrganizationalHealth = {
  engagementScore: 82.5,
  collaborationIndex: 78.3,
  innovationRate: 71.2,
  retentionRate: 94.8,
  satisfactionScore: 4.3,
  cultureAlignment: 85.1,
  trends: {
    engagement: [
      { period: '2024-Q4', value: 79.2, change: 0.05 },
      { period: '2025-Q1', value: 82.5, change: 0.04 }
    ],
    collaboration: [
      { period: '2024-Q4', value: 75.1, change: 0.08 },
      { period: '2025-Q1', value: 78.3, change: 0.04 }
    ],
    innovation: [
      { period: '2024-Q4', value: 68.5, change: 0.12 },
      { period: '2025-Q1', value: 71.2, change: 0.04 }
    ]
  }
};

// Level 5+: 法人分析データ
export const corporateAnalytics: CorporateAnalytics = {
  organizationId: 'org-001',
  organizationName: '医療法人社団 健康会',
  organizationRanking: 1,
  facilityAnalytics: [facilityAnalytics],
  corporateMetrics: {
    totalStaff: 468,
    activeStaff: 431,
    averageProposals: 3.6,
    averageParticipation: 2.3,
    averageEngagement: 0.77,
    topPerformers: [],
    improvementOpportunities: []
  },
  organizationMetrics: {
    totalStaff: 468,
    activeStaff: 431,
    averageProposals: 3.6,
    averageParticipation: 2.3,
    averageEngagement: 0.77,
    topPerformers: [],
    improvementOpportunities: []
  },
  strategicInitiatives,
  organizationalHealth,
  investmentAnalysis: {
    totalInvestment: 45000000,
    measuredReturns: 67500000,
    roiPercentage: 150,
    paybackPeriod: 18,
    costSavings: 22500000,
    productivityGains: 0.28,
    qualityImprovements: 0.35
  },
  strategicMetrics: {
    marketCompetitiveness: 0.87,
    growthPotential: 0.82,
    governanceScore: 0.91,
    digitalTransformation: 0.75
  },
  departmentAnalytics: [nursingDepartmentAnalytics]
};

// ランキングデータ
export const departmentRankings: Rankings = {
  proposals: [
    { rank: 1, userId: 'nurse-001', userName: '田中 花子', department: '看護部', value: 8, change: 0.14, badge: 'gold' },
    { rank: 2, userId: 'nurse-002', userName: '佐藤 太郎', department: '看護部', value: 6, change: 0.2, badge: 'silver' },
    { rank: 3, userId: 'nurse-003', userName: '山田 美咲', department: '看護部', value: 5, change: 0.25, badge: 'bronze' }
  ],
  participation: [
    { rank: 1, userId: 'nurse-003', userName: '山田 美咲', department: '看護部', value: 4, change: 0.25, badge: 'gold' },
    { rank: 2, userId: 'nurse-001', userName: '田中 花子', department: '看護部', value: 3, change: 0.14, badge: 'silver' },
    { rank: 3, userId: 'nurse-002', userName: '佐藤 太郎', department: '看護部', value: 2, change: 0.2, badge: 'bronze' }
  ],
  comments: [
    { rank: 1, userId: 'nurse-001', userName: '田中 花子', department: '看護部', value: 45, change: 0.18, badge: 'gold' },
    { rank: 2, userId: 'nurse-002', userName: '佐藤 太郎', department: '看護部', value: 32, change: 0.23, badge: 'silver' },
    { rank: 3, userId: 'nurse-003', userName: '山田 美咲', department: '看護部', value: 28, change: 0.16, badge: 'bronze' }
  ],
  likes: [
    { rank: 1, userId: 'nurse-001', userName: '田中 花子', department: '看護部', value: 67, change: 0.15, badge: 'gold' },
    { rank: 2, userId: 'nurse-002', userName: '佐藤 太郎', department: '看護部', value: 48, change: 0.22, badge: 'silver' },
    { rank: 3, userId: 'nurse-003', userName: '山田 美咲', department: '看護部', value: 39, change: 0.18, badge: 'bronze' }
  ],
  overall: [
    { rank: 1, userId: 'nurse-001', userName: '田中 花子', department: '看護部', value: 88.5, change: 0.12, badge: 'gold' },
    { rank: 2, userId: 'nurse-002', userName: '佐藤 太郎', department: '看護部', value: 76.2, change: 0.18, badge: 'silver' },
    { rank: 3, userId: 'nurse-003', userName: '山田 美咲', department: '看護部', value: 72.8, change: 0.15, badge: 'bronze' }
  ]
};

// アラート・通知データ
export const staffAlerts: StaffAlert[] = [
  {
    alertId: 'alert-001',
    type: 'high-performer',
    severity: 'info',
    message: '田中 花子さんが今月の提案数で1位を獲得しました！',
    targetUserId: 'nurse-001',
    targetDepartment: '看護部',
    createdAt: new Date('2025-06-10T09:00:00'),
    isRead: false
  },
  {
    alertId: 'alert-002',
    type: 'low-participation',
    severity: 'warning',
    message: '薬剤部の参加率が前月比20%低下しています。フォローアップをお勧めします。',
    targetDepartment: '薬剤部',
    createdAt: new Date('2025-06-09T14:30:00'),
    isRead: false
  },
  {
    alertId: 'alert-003',
    type: 'milestone',
    severity: 'info',
    message: '患者安全向上プロジェクトが進捗65%に達しました。',
    createdAt: new Date('2025-06-08T16:45:00'),
    isRead: true
  }
];

// IntegratedCorporateDashboard.tsx用の統合データ（既存データを活用）
export const staffDashboardData = {
  // 部門職員データ
  departmentStaff: [
    {
      department: '看護部',
      totalStaff: 24,
      activeStaff: 22,
      averageEngagement: 83,
      topPerformers: ['田中 花子', '佐藤 太郎', '山田 美咲'],
      recentActivity: { proposals: 19, projects: 9, discussions: 105 }
    },
    {
      department: '地域包括医療病棟',
      totalStaff: 18,
      activeStaff: 17,
      averageEngagement: 78,
      topPerformers: ['鈴木 健太', '高橋 恵子', '伊藤 真一'],
      recentActivity: { proposals: 12, projects: 5, discussions: 67 }
    },
    {
      department: '地域包括ケア病棟',
      totalStaff: 16,
      activeStaff: 15,
      averageEngagement: 81,
      topPerformers: ['渡辺 美樹', '加藤 雄一', '藤田 愛'],
      recentActivity: { proposals: 15, projects: 7, discussions: 89 }
    },
    {
      department: '回復期リハビリ病棟',
      totalStaff: 14,
      activeStaff: 13,
      averageEngagement: 85,
      topPerformers: ['中村 優子', '小林 大輔', '松本 香織'],
      recentActivity: { proposals: 18, projects: 6, discussions: 72 }
    },
    {
      department: '外来',
      totalStaff: 22,
      activeStaff: 20,
      averageEngagement: 79,
      topPerformers: ['吉田 俊介', '岡田 桜子', '森田 健'],
      recentActivity: { proposals: 14, projects: 8, discussions: 94 }
    },
    {
      department: '医療療養病棟',
      totalStaff: 20,
      activeStaff: 18,
      averageEngagement: 76,
      topPerformers: ['木村 正男', '田村 智子', '石川 直樹'],
      recentActivity: { proposals: 11, projects: 4, discussions: 58 }
    },
    {
      department: '入所サービス部門',
      totalStaff: 32,
      activeStaff: 29,
      averageEngagement: 82,
      topPerformers: ['井上 麻美', '坂本 浩司', '清水 結衣'],
      recentActivity: { proposals: 21, projects: 11, discussions: 126 }
    },
    {
      department: '通所サービス部門',
      totalStaff: 15,
      activeStaff: 14,
      averageEngagement: 84,
      topPerformers: ['西村 康弘', '長谷川 優', '山口 美香'],
      recentActivity: { proposals: 16, projects: 6, discussions: 71 }
    },
    {
      department: '居宅サービス部門',
      totalStaff: 28,
      activeStaff: 26,
      averageEngagement: 88,
      topPerformers: ['大野 修', '前田 千恵', '村上 達也'],
      recentActivity: { proposals: 24, projects: 9, discussions: 112 }
    }
  ],
  
  // 施設職員データ
  facilityStaff: [
    {
      facility: '小原病院',
      totalStaff: 94,
      departments: 5,
      averageEngagement: 80,
      keyMetrics: {
        proposalRate: 0.32,
        projectCompletionRate: 0.86,
        collaborationIndex: 0.78
      }
    },
    {
      facility: '立神リハ温泉病院',
      totalStaff: 38,
      departments: 2,
      averageEngagement: 77,
      keyMetrics: {
        proposalRate: 0.29,
        projectCompletionRate: 0.82,
        collaborationIndex: 0.74
      }
    },
    {
      facility: 'エスポワール立神',
      totalStaff: 47,
      departments: 2,
      averageEngagement: 83,
      keyMetrics: {
        proposalRate: 0.36,
        projectCompletionRate: 0.89,
        collaborationIndex: 0.81
      }
    },
    {
      facility: '介護医療院',
      totalStaff: 35,
      departments: 1,
      averageEngagement: 79,
      keyMetrics: {
        proposalRate: 0.31,
        projectCompletionRate: 0.84,
        collaborationIndex: 0.76
      }
    },
    {
      facility: '宝寿庵',
      totalStaff: 28,
      departments: 1,
      averageEngagement: 85,
      keyMetrics: {
        proposalRate: 0.38,
        projectCompletionRate: 0.91,
        collaborationIndex: 0.83
      }
    },
    {
      facility: '訪問看護ステーション',
      totalStaff: 24,
      departments: 1,
      averageEngagement: 87,
      keyMetrics: {
        proposalRate: 0.42,
        projectCompletionRate: 0.93,
        collaborationIndex: 0.85
      }
    },
    {
      facility: '訪問介護事業所',
      totalStaff: 31,
      departments: 1,
      averageEngagement: 86,
      keyMetrics: {
        proposalRate: 0.39,
        projectCompletionRate: 0.88,
        collaborationIndex: 0.82
      }
    },
    {
      facility: '居宅介護支援事業所',
      totalStaff: 19,
      departments: 1,
      averageEngagement: 89,
      keyMetrics: {
        proposalRate: 0.45,
        projectCompletionRate: 0.95,
        collaborationIndex: 0.87
      }
    }
  ],

  // 法人全体データ
  corporateData: {
    totalFacilities: 8,
    totalDepartments: 15,
    totalStaff: 316,
    averageEngagement: 82,
    overallMetrics: {
      proposalRate: 0.35,
      projectCompletionRate: 0.87,
      collaborationIndex: 0.80,
      retentionRate: 0.94,
      satisfactionScore: 4.2
    }
  }
};