import { Project, ProjectStatus, ProjectPriority, ProjectCategory } from '../../types';
import { demoPosts } from './posts';

export const demoProjects: Project[] = [
  // 非常勤職員の慶弔休暇制度プロジェクト（施設内投票フェーズ）
  {
    id: 'proj-1',
    title: '非常勤職員の慶弔休暇取得制度の導入',
    description: `非常勤職員にも慶弔休暇制度を適用し、全職員が安心して働ける環境を整備するプロジェクト。

【背景】
現在、非常勤職員には慶弔休暇の制度がなく、親族の葬儀等でも通常の欠勤扱いまたは有給休暇を使用している状況。常勤職員との待遇差により、職場の一体感や非常勤職員の定着率に影響が出ている。

【目的】
1. 非常勤職員の福利厚生向上
2. 職員間の待遇格差の是正
3. 優秀な非常勤職員の定着率向上
4. 職場全体のモチベーション向上

【実施内容】
- 慶弔休暇規程の改定
- 対象：勤続6ヶ月以上の非常勤職員
- 適用範囲：配偶者、子、父母の死亡時（3日間）
- 労務管理システムの更新`,
    status: 'approved',
    priority: 'high',
    category: 'employee-welfare',
    originalPostId: 'post-1',
    relatedPostIds: ['post-1'],
    createdBy: 'user-7',
    createdByName: '渡辺 由美',
    createdAt: new Date('2025-05-15T10:00:00'),
    updatedAt: new Date('2025-06-15T14:30:00'),
    startDate: new Date('2025-07-01'),
    targetDate: new Date('2025-09-01'),
    actualEndDate: null,
    budget: 500000,
    actualCost: 0,
    roi: 0,
    teamMembers: [
      {
        userId: 'user-7',
        userName: '渡辺 由美',
        role: 'プロジェクトリーダー',
        joinedAt: new Date('2025-05-15'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-3',
        userName: '鈴木 美香',
        role: '監督者',
        joinedAt: new Date('2025-05-20'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-4',
        userName: '田中 恵子',
        role: 'アドバイザー',
        joinedAt: new Date('2025-05-20'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-2',
        userName: '佐藤 花子',
        role: '承認者',
        joinedAt: new Date('2025-06-01'),
        contribution: 0,
        isProvisional: false
      }
    ],
    milestones: [
      {
        id: 'ms-1',
        title: '現状調査・他施設事例収集',
        description: '非常勤職員の勤務実態調査と他医療機関の事例収集',
        dueDate: new Date('2025-05-31'),
        completed: true,
        completedDate: new Date('2025-05-28'),
        assignedTo: ['user-7']
      },
      {
        id: 'ms-2',
        title: '制度案の作成と部門内協議',
        description: '具体的な制度内容の検討と看護部内での合意形成',
        dueDate: new Date('2025-06-10'),
        completed: true,
        completedDate: new Date('2025-06-08'),
        assignedTo: ['user-7', 'user-4']
      },
      {
        id: 'ms-3',
        title: '人事部門との調整',
        description: '就業規則改定案の作成と人事部門との協議',
        dueDate: new Date('2025-06-20'),
        completed: true,
        completedDate: new Date('2025-06-18'),
        assignedTo: ['user-3', 'user-2']
      },
      {
        id: 'ms-4',
        title: '施設内投票の実施',
        description: '全職員による投票（現在実施中）',
        dueDate: new Date('2025-06-30'),
        completed: false,
        assignedTo: ['user-3']
      },
      {
        id: 'ms-5',
        title: '規程改定と周知',
        description: '就業規則の改定と全職員への周知徹底',
        dueDate: new Date('2025-07-31'),
        completed: false,
        assignedTo: ['user-2']
      }
    ],
    currentPhase: 'facility_voting',
    workflowStages: [
      {
        id: 'wf-1',
        name: '提案',
        status: 'completed',
        completedAt: new Date('2025-05-15'),
        approver: 'user-7',
        approverName: '渡辺 由美',
        comments: '非常勤職員の立場から切実な問題提起'
      },
      {
        id: 'wf-2',
        name: '部門検討',
        status: 'completed',
        completedAt: new Date('2025-06-10'),
        approver: 'user-3',
        approverName: '鈴木 美香',
        comments: '看護部として全面的に支援'
      },
      {
        id: 'wf-3',
        name: '施設承認',
        status: 'in_progress',
        approver: 'user-2',
        approverName: '佐藤 花子',
        comments: '施設内投票実施中（6/30まで）'
      },
      {
        id: 'wf-4',
        name: '法人承認',
        status: 'pending',
        approver: null,
        approverName: null
      }
    ],
    tags: ['福利厚生', '非常勤職員', '働き方改革', '慶弔休暇'],
    visibility: 'facility',
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    impactScore: 85,
    feasibilityScore: 90,
    alignmentScore: 95,
    totalScore: 90,
    votingDeadline: new Date('2025-06-30T23:59:59'),
    requiredVotes: 50,
    currentVotes: 32,
    approvalPercentage: 94
  },

  // 音声入力システム導入プロジェクト（部門検討中）
  {
    id: 'proj-2',
    title: '音声入力を活用した申し送り業務の効率化',
    description: `申し送り記録作成の効率化を図るため、音声入力システムを導入するプロジェクト。

【期待効果】
- 記録作成時間を15-20分から5分程度に短縮
- 記載漏れリスクの低減
- 残業時間の削減（月間20時間削減見込み）`,
    status: 'reviewing',
    priority: 'medium',
    category: 'innovation',
    originalPostId: 'post-4',
    relatedPostIds: ['post-4'],
    createdBy: 'user-4',
    createdByName: '田中 恵子',
    createdAt: new Date('2025-06-08T16:45:00'),
    updatedAt: new Date('2025-06-13T10:00:00'),
    startDate: new Date('2025-08-01'),
    targetDate: new Date('2025-10-31'),
    actualEndDate: null,
    budget: 1200000,
    actualCost: 0,
    roi: 0,
    teamMembers: [
      {
        userId: 'user-4',
        userName: '田中 恵子',
        role: 'プロジェクトリーダー',
        joinedAt: new Date('2025-06-08'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-3',
        userName: '鈴木 美香',
        role: 'スポンサー',
        joinedAt: new Date('2025-06-10'),
        contribution: 0,
        isProvisional: false
      }
    ],
    milestones: [
      {
        id: 'ms-1',
        title: 'システム要件定義',
        description: '必要な機能と仕様の明確化',
        dueDate: new Date('2025-07-15'),
        completed: false,
        assignedTo: ['user-4']
      },
      {
        id: 'ms-2',
        title: 'ベンダー選定',
        description: 'システム提供業者の選定と見積もり取得',
        dueDate: new Date('2025-07-31'),
        completed: false,
        assignedTo: ['user-3', 'user-4']
      }
    ],
    currentPhase: 'department_discussion',
    workflowStages: [
      {
        id: 'wf-1',
        name: '提案',
        status: 'completed',
        completedAt: new Date('2025-06-08'),
        approver: 'user-4',
        approverName: '田中 恵子'
      },
      {
        id: 'wf-2',
        name: '部門検討',
        status: 'in_progress',
        approver: 'user-3',
        approverName: '鈴木 美香'
      }
    ],
    tags: ['業務効率化', 'IT化', '音声入力', '残業削減'],
    visibility: 'department',
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    impactScore: 75,
    feasibilityScore: 70,
    alignmentScore: 80,
    totalScore: 75
  },

  // 委員会運営効率化プロジェクト（アイデア段階）
  {
    id: 'proj-3',
    title: '各種委員会の運営方法見直しによる業務効率化',
    description: `委員会運営の効率化により、月間約20時間の業務時間削減を目指すプロジェクト。

【実施内容】
- オンライン会議システムの活用
- 資料の電子化と事前共有
- 議事録作成の効率化
- 決定事項の即時共有システム構築`,
    status: 'draft',
    priority: 'medium',
    category: 'improvement',
    originalPostId: 'post-2',
    relatedPostIds: ['post-2'],
    createdBy: 'user-6',
    createdByName: '伊藤 麻衣',
    createdAt: new Date('2025-06-10T14:30:00'),
    updatedAt: new Date('2025-06-10T14:30:00'),
    budget: 800000,
    teamMembers: [
      {
        userId: 'user-6',
        userName: '伊藤 麻衣',
        role: '提案者',
        joinedAt: new Date('2025-06-10'),
        contribution: 0,
        isProvisional: true
      }
    ],
    milestones: [],
    workflowStages: [
      {
        id: 'wf-1',
        name: '提案',
        status: 'in_progress',
        approver: 'user-6',
        approverName: '伊藤 麻衣'
      }
    ],
    tags: ['業務効率化', '会議改善', 'DX推進'],
    visibility: 'department',
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    impactScore: 70,
    feasibilityScore: 85,
    alignmentScore: 75,
    totalScore: 77
  }
];

// Helper functions
export const getDemoProjectById = (id: string): Project | undefined => {
  return demoProjects.find(project => project.id === id);
};

export const getDemoProjectsByStatus = (status: ProjectStatus): Project[] => {
  return demoProjects.filter(project => project.status === status);
};

export const getDemoProjectsByDepartment = (department: string): Project[] => {
  return demoProjects.filter(project => project.department === department);
};

export const getDemoProjectsByFacility = (facilityId: string): Project[] => {
  return demoProjects.filter(project => project.facility_id === facilityId);
};

export const getDemoProjectsByMember = (userId: string): Project[] => {
  return demoProjects.filter(project => 
    project.teamMembers.some(member => member.userId === userId)
  );
};