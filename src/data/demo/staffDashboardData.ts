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