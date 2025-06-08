export type ProjectStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'in-progress' | 'completed' | 'rejected';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectCategory = 'improvement' | 'cost-reduction' | 'innovation' | 'compliance' | 'employee-welfare';

export interface ProjectMilestone {
  id: string;
  name: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  completedDate?: Date;
  assignee: string;
}

export interface ProjectWorkflow {
  id: string;
  projectId: string;
  stage: string;
  approver: string;
  approvedDate?: Date;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision-required';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  postId: string;
  initiator: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdDate: Date;
  lastUpdated: Date;
  estimatedBudget?: number;
  actualBudget?: number;
  estimatedROI?: number;
  actualROI?: number;
  startDate?: Date;
  endDate?: Date;
  milestones: ProjectMilestone[];
  workflows: ProjectWorkflow[];
  teamMembers: string[];
  tags: string[];
}

export const demoProjects: Project[] = [
  {
    id: 'proj-001',
    title: '新入社員研修プログラム改革',
    description: '実践的な研修内容の導入により、新入社員の早期戦力化を実現',
    category: 'improvement',
    postId: 'post-1',
    initiator: 'user-3',
    status: 'in-progress',
    priority: 'high',
    createdDate: new Date('2024-04-16T10:00:00'),
    lastUpdated: new Date('2025-01-06T14:30:00'),
    estimatedBudget: 5000000,
    actualBudget: 4200000,
    estimatedROI: 180,
    startDate: new Date('2024-05-01'),
    endDate: new Date('2025-03-31'),
    milestones: [
      {
        id: 'ms-001-1',
        name: 'カリキュラム設計',
        dueDate: new Date('2024-05-31'),
        status: 'completed',
        completedDate: new Date('2024-05-28'),
        assignee: 'user-3'
      },
      {
        id: 'ms-001-2',
        name: 'メンター制度導入',
        dueDate: new Date('2024-06-30'),
        status: 'completed',
        completedDate: new Date('2024-06-25'),
        assignee: 'user-6'
      },
      {
        id: 'ms-001-3',
        name: '第1期実施・効果測定',
        dueDate: new Date('2024-09-30'),
        status: 'completed',
        completedDate: new Date('2024-09-28'),
        assignee: 'user-3'
      },
      {
        id: 'ms-001-4',
        name: 'プログラム改善・第2期準備',
        dueDate: new Date('2025-02-28'),
        status: 'in-progress',
        assignee: 'user-3'
      }
    ],
    workflows: [
      {
        id: 'wf-001-1',
        projectId: 'proj-001',
        stage: '部門承認',
        approver: 'user-8',
        approvedDate: new Date('2024-04-20'),
        status: 'approved',
        comments: '素晴らしい提案です。予算枠内で進めてください。'
      },
      {
        id: 'wf-001-2',
        projectId: 'proj-001',
        stage: '経営承認',
        approver: 'user-10',
        approvedDate: new Date('2024-04-25'),
        status: 'approved',
        comments: '人材育成は最重要課題。全面的に支援します。'
      }
    ],
    teamMembers: ['user-3', 'user-6', 'user-2'],
    tags: ['人材育成', '研修', '新入社員', 'OJT']
  },
  {
    id: 'proj-002',
    title: 'オフィス空調最適化プロジェクト',
    description: 'エリア別空調制御システムの導入により、快適性向上と省エネを両立',
    category: 'cost-reduction',
    postId: 'post-3',
    initiator: 'user-2',
    status: 'reviewing',
    priority: 'medium',
    createdDate: new Date('2024-06-21T09:00:00'),
    lastUpdated: new Date('2025-01-05T16:00:00'),
    estimatedBudget: 3000000,
    estimatedROI: 150,
    milestones: [
      {
        id: 'ms-002-1',
        name: '現状調査・要件定義',
        dueDate: new Date('2024-07-15'),
        status: 'completed',
        completedDate: new Date('2024-07-10'),
        assignee: 'user-7'
      },
      {
        id: 'ms-002-2',
        name: '業者選定・見積取得',
        dueDate: new Date('2024-08-15'),
        status: 'pending',
        assignee: 'user-7'
      }
    ],
    workflows: [
      {
        id: 'wf-002-1',
        projectId: 'proj-002',
        stage: '施設管理承認',
        approver: 'user-7',
        status: 'pending'
      }
    ],
    teamMembers: ['user-2', 'user-7'],
    tags: ['省エネ', '職場環境', '空調', 'SDGs']
  },
  {
    id: 'proj-003',
    title: '人事評価システム改善',
    description: '1on1時間の拡充と評価プロセスの透明化',
    category: 'improvement',
    postId: 'post-6',
    initiator: 'user-1',
    status: 'approved',
    priority: 'high',
    createdDate: new Date('2024-09-11T10:00:00'),
    lastUpdated: new Date('2025-01-04T11:00:00'),
    estimatedBudget: 2000000,
    estimatedROI: 200,
    startDate: new Date('2025-02-01'),
    milestones: [
      {
        id: 'ms-003-1',
        name: '新評価制度設計',
        dueDate: new Date('2025-01-31'),
        status: 'pending',
        assignee: 'user-2'
      }
    ],
    workflows: [
      {
        id: 'wf-003-1',
        projectId: 'proj-003',
        stage: 'HR部門承認',
        approver: 'user-2',
        approvedDate: new Date('2024-09-20'),
        status: 'approved'
      },
      {
        id: 'wf-003-2',
        projectId: 'proj-003',
        stage: '経営承認',
        approver: 'user-11',
        approvedDate: new Date('2024-10-05'),
        status: 'approved',
        comments: '従業員満足度向上の重要施策として承認'
      }
    ],
    teamMembers: ['user-1', 'user-2', 'user-8'],
    tags: ['人事評価', '1on1', 'フィードバック']
  },
  {
    id: 'proj-004',
    title: 'AI活用ナレッジ管理システム',
    description: 'AI検索機能を備えた次世代ナレッジ共有プラットフォームの構築',
    category: 'innovation',
    postId: 'post-11',
    initiator: 'user-9',
    status: 'submitted',
    priority: 'high',
    createdDate: new Date('2025-01-05T10:00:00'),
    lastUpdated: new Date('2025-01-08T09:00:00'),
    estimatedBudget: 8000000,
    estimatedROI: 250,
    milestones: [
      {
        id: 'ms-004-1',
        name: '要件定義・技術選定',
        dueDate: new Date('2025-02-28'),
        status: 'pending',
        assignee: 'user-9'
      }
    ],
    workflows: [
      {
        id: 'wf-004-1',
        projectId: 'proj-004',
        stage: 'IT部門レビュー',
        approver: 'user-9',
        status: 'pending'
      }
    ],
    teamMembers: ['user-9', 'user-3'],
    tags: ['AI', 'ナレッジ管理', 'DX', '生産性向上']
  },
  {
    id: 'proj-005',
    title: '育児支援制度拡充プログラム',
    description: '時短勤務期間延長と在宅勤務併用による働きやすい環境づくり',
    category: 'employee-welfare',
    postId: 'post-17',
    initiator: 'user-5',
    status: 'draft',
    priority: 'high',
    createdDate: new Date('2025-01-04T12:00:00'),
    lastUpdated: new Date('2025-01-07T15:00:00'),
    estimatedBudget: 1000000,
    estimatedROI: 300,
    milestones: [],
    workflows: [],
    teamMembers: ['user-5', 'user-2'],
    tags: ['育児支援', 'ワークライフバランス', '在宅勤務', 'D&I']
  }
];

// Workflow states configuration
export const workflowStates = {
  draft: {
    name: '下書き',
    color: 'gray',
    nextStates: ['submitted'],
    permissions: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  submitted: {
    name: '申請済み',
    color: 'blue',
    nextStates: ['reviewing', 'rejected'],
    permissions: [3, 4, 5, 6, 7, 8]
  },
  reviewing: {
    name: '審査中',
    color: 'yellow',
    nextStates: ['approved', 'rejected', 'revision-required'],
    permissions: [5, 6, 7, 8]
  },
  approved: {
    name: '承認済み',
    color: 'green',
    nextStates: ['in-progress'],
    permissions: [5, 6, 7, 8]
  },
  'in-progress': {
    name: '実施中',
    color: 'purple',
    nextStates: ['completed'],
    permissions: [3, 4, 5, 6, 7, 8]
  },
  completed: {
    name: '完了',
    color: 'green',
    nextStates: [],
    permissions: [3, 4, 5, 6, 7, 8]
  },
  rejected: {
    name: '却下',
    color: 'red',
    nextStates: ['draft'],
    permissions: [5, 6, 7, 8]
  },
  'revision-required': {
    name: '修正依頼',
    color: 'orange',
    nextStates: ['submitted'],
    permissions: [3, 4, 5, 6, 7, 8]
  }
};

// Helper functions
export const getDemoProjectById = (id: string): Project | undefined => {
  return demoProjects.find(project => project.id === id);
};

export const getDemoProjectsByStatus = (status: ProjectStatus): Project[] => {
  return demoProjects.filter(project => project.status === status);
};

export const getDemoProjectsByCategory = (category: ProjectCategory): Project[] => {
  return demoProjects.filter(project => project.category === category);
};

export const getDemoProjectsByInitiator = (initiatorId: string): Project[] => {
  return demoProjects.filter(project => project.initiator === initiatorId);
};

export const canUserTransitionProject = (userPermissionLevel: number, fromStatus: ProjectStatus, toStatus: ProjectStatus): boolean => {
  const fromState = workflowStates[fromStatus];
  if (!fromState || !fromState.nextStates.includes(toStatus)) {
    return false;
  }
  
  const toState = workflowStates[toStatus];
  return toState.permissions.includes(userPermissionLevel);
};