import { Post } from '../../types';

// Project-level demo posts for different organizational levels
export const projectDemoPosts: Post[] = [
  // 1. 部署内プロジェクト化 - 看護部デジタル化プロジェクト
  {
    id: 'project-dept-001',
    type: 'improvement',
    proposalType: 'operational',
    content: '電子カルテ入力の簡素化システム導入提案。現在の入力項目を30%削減し、音声入力機能を追加することで、看護師の記録業務時間を1日あたり45分短縮できます。患者ケアにより多くの時間を割けるようになります。',
    author: {
      id: 'project-user-001',
      name: '田中 美咲',
      department: '看護部',
      role: '主任看護師',
      position: '主任看護師',
      expertise: 4,
      stakeholderCategory: 'frontline'
    },
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2024-12-01T09:00:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 1,
      'neutral': 3,
      'support': 9,
      'strongly-support': 5
    },
    votingData: {
      totalVotes: 18,
      votes: {
        'strongly-oppose': 0,
        'oppose': 1,
        'neutral': 3,
        'support': 9,
        'strongly-support': 5
      },
      consensus: 78.5,
      participation: 85.7
    },
    enhancedProjectStatus: {
      stage: 'DEPARTMENT_PROJECT',
      level: 'DEPARTMENT',
      approvalLevel: 'LEVEL_3',
      budget: 2800000,
      timeline: '6ヶ月',
      milestones: [
        { name: '企画・提案', status: 'completed', date: '2024-11-15' },
        { name: '合意形成', status: 'completed', date: '2024-12-01' },
        { name: 'プロジェクト承認', status: 'completed', date: '2024-12-05' },
        { name: '実行・実装', status: 'in_progress', progress: 25, date: '2024-12-15' },
        { name: '効果測定', status: 'pending', date: '2025-06-15' }
      ],
      resources: {
        budget_used: 700000,
        budget_total: 2800000,
        team_size: 8,
        completion: 25
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_3',
      status: 'approved',
      history: [
        { level: 'LEVEL_1', approver: '看護師長', status: 'approved', date: '2024-12-02' },
        { level: 'LEVEL_2', approver: '副看護部長', status: 'approved', date: '2024-12-03' },
        { level: 'LEVEL_3', approver: '看護部長', status: 'approved', date: '2024-12-05' }
      ]
    },
    tags: ['デジタル化', '業務効率', '看護部', 'プロジェクト実行中'],
    relatedProjects: [],
    comments: [],
    projectId: 'dept-nursing-001'
  },

  // 2. 施設内プロジェクト化 - 医療DX推進プロジェクト
  {
    id: 'project-facility-001',
    type: 'improvement',
    proposalType: 'innovation',
    content: 'AI診断支援システム導入による診療精度向上プロジェクト。画像診断における見落とし率を15%削減し、診断時間を20%短縮。年間約300例の早期発見効果を期待できます。',
    author: {
      id: 'project-user-002',
      name: '山田 健太郎',
      department: '医療情報部',
      role: '情報システム課長',
      position: '情報システム課長',
      expertise: 5,
      stakeholderCategory: 'management'
    },
    anonymityLevel: 'real_name',
    priority: 'urgent',
    timestamp: new Date('2024-11-20T14:30:00'),
    votes: {
      'strongly-oppose': 2,
      'oppose': 3,
      'neutral': 8,
      'support': 20,
      'strongly-support': 12
    },
    votingData: {
      totalVotes: 45,
      votes: {
        'strongly-oppose': 2,
        'oppose': 3,
        'neutral': 8,
        'support': 20,
        'strongly-support': 12
      },
      consensus: 71.2,
      participation: 78.9
    },
    enhancedProjectStatus: {
      stage: 'FACILITY_PROJECT',
      level: 'FACILITY',
      approvalLevel: 'LEVEL_4',
      budget: 15000000,
      timeline: '18ヶ月',
      milestones: [
        { name: '企画・提案', status: 'completed', date: '2024-10-01' },
        { name: '合意形成', status: 'completed', date: '2024-11-20' },
        { name: 'プロジェクト承認', status: 'completed', date: '2024-12-01' },
        { name: '実行・実装', status: 'in_progress', progress: 15, date: '2024-12-15' },
        { name: '効果測定', status: 'pending', date: '2026-06-15' }
      ],
      resources: {
        budget_used: 2250000,
        budget_total: 15000000,
        team_size: 25,
        completion: 15
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_4',
      status: 'approved',
      history: [
        { level: 'LEVEL_1', approver: '医療情報部課長', status: 'approved', date: '2024-11-22' },
        { level: 'LEVEL_2', approver: '医療情報部長', status: 'approved', date: '2024-11-25' },
        { level: 'LEVEL_3', approver: '副院長', status: 'approved', date: '2024-11-28' },
        { level: 'LEVEL_4', approver: '院長', status: 'approved', date: '2024-12-01' }
      ]
    },
    tags: ['AI', 'DX', '診療精度', '施設プロジェクト'],
    relatedProjects: ['project-dept-001'],
    comments: [],
    projectId: 'facility-dx-001'
  },

  // 3. 法人プロジェクト化 - 持続可能経営プロジェクト
  {
    id: 'project-corporate-001',
    type: 'improvement',
    proposalType: 'strategic',
    content: 'カーボンニュートラル達成に向けた総合環境改善プロジェクト。再生可能エネルギー導入、省エネ設備更新、廃棄物削減により、2030年までにCO2排出量50%削減を目指します。',
    author: {
      id: 'project-user-003',
      name: '佐藤 理恵',
      department: '経営企画部',
      role: '部長',
      position: '部長',
      expertise: 5,
      stakeholderCategory: 'management'
    },
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2024-10-15T10:00:00'),
    votes: {
      'strongly-oppose': 5,
      'oppose': 12,
      'neutral': 25,
      'support': 55,
      'strongly-support': 23
    },
    votingData: {
      totalVotes: 120,
      votes: {
        'strongly-oppose': 5,
        'oppose': 12,
        'neutral': 25,
        'support': 55,
        'strongly-support': 23
      },
      consensus: 65.8,
      participation: 89.2
    },
    enhancedProjectStatus: {
      stage: 'CORPORATE_PROJECT',
      level: 'CORPORATE',
      approvalLevel: 'LEVEL_5',
      budget: 50000000,
      timeline: '36ヶ月',
      milestones: [
        { name: '企画・提案', status: 'completed', date: '2024-09-01' },
        { name: '合意形成', status: 'completed', date: '2024-10-15' },
        { name: 'プロジェクト承認', status: 'completed', date: '2024-11-01' },
        { name: '実行・実装', status: 'in_progress', progress: 8, date: '2024-12-01' },
        { name: '効果測定', status: 'pending', date: '2027-12-01' }
      ],
      resources: {
        budget_used: 4000000,
        budget_total: 50000000,
        team_size: 45,
        completion: 8
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_5',
      status: 'approved',
      history: [
        { level: 'LEVEL_1', approver: '経営企画課長', status: 'approved', date: '2024-10-18' },
        { level: 'LEVEL_2', approver: '経営企画部長', status: 'approved', date: '2024-10-22' },
        { level: 'LEVEL_3', approver: '事務局長', status: 'approved', date: '2024-10-25' },
        { level: 'LEVEL_4', approver: '院長', status: 'approved', date: '2024-10-28' },
        { level: 'LEVEL_5', approver: '理事会', status: 'approved', date: '2024-11-01' }
      ]
    },
    tags: ['環境', 'カーボンニュートラル', 'サステナビリティ', '法人プロジェクト'],
    relatedProjects: ['project-facility-001'],
    comments: [],
    projectId: 'corporate-env-001'
  },

  // 4. 進行中の部署プロジェクト例
  {
    id: 'project-dept-002',
    type: 'improvement',
    proposalType: 'operational',
    content: '薬剤管理の自動化システム導入。調剤ミス防止、在庫管理最適化、期限切れ薬剤の削減により、年間800万円のコスト削減と患者安全性向上を実現します。',
    author: {
      id: 'project-user-004',
      name: '鈴木 和也',
      department: '薬剤部',
      role: '薬剤師',
      position: '薬剤師',
      expertise: 4,
      stakeholderCategory: 'frontline'
    },
    anonymityLevel: 'real_name',
    priority: 'medium',
    timestamp: new Date('2024-12-10T11:00:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 2,
      'support': 7,
      'strongly-support': 3
    },
    votingData: {
      totalVotes: 12,
      votes: {
        'strongly-oppose': 0,
        'oppose': 0,
        'neutral': 2,
        'support': 7,
        'strongly-support': 3
      },
      consensus: 83.3,
      participation: 92.3
    },
    enhancedProjectStatus: {
      stage: 'DEPARTMENT_PROJECT',
      level: 'DEPARTMENT',
      approvalLevel: 'LEVEL_2',
      budget: 1800000,
      timeline: '4ヶ月',
      milestones: [
        { name: '企画・提案', status: 'completed', date: '2024-11-25' },
        { name: '合意形成', status: 'completed', date: '2024-12-10' },
        { name: 'プロジェクト承認', status: 'in_progress', progress: 60, date: '2024-12-20' },
        { name: '実行・実装', status: 'pending', date: '2025-01-15' },
        { name: '効果測定', status: 'pending', date: '2025-05-15' }
      ],
      resources: {
        budget_used: 0,
        budget_total: 1800000,
        team_size: 6,
        completion: 0
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_2',
      status: 'in_progress',
      history: [
        { level: 'LEVEL_1', approver: '薬剤課長', status: 'approved', date: '2024-12-12' },
        { level: 'LEVEL_2', approver: '薬剤部長', status: 'pending', date: null }
      ]
    },
    tags: ['自動化', '薬剤管理', '部署プロジェクト'],
    relatedProjects: [],
    comments: [],
    projectId: 'dept-pharmacy-001'
  }
];