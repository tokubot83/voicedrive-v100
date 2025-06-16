export type ProjectStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'in-progress' | 'completed' | 'rejected' | 'member-selection' | 'approval-pending';
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
  status: 'pending' | 'approved' | 'rejected' | 'revision-required' | 'in-progress';
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
  provisionalMembers?: string[]; // 仮選出中のメンバー
  memberSelectionStatus?: 'not-started' | 'in-progress' | 'completed' | 'cancelled';
  approvalCompletedAt?: Date;
  tags: string[];
}

export const demoProjects: Project[] = [
  // 更衣時間勤務時間算入プロジェクト（承認フローデモ用）
  {
    id: 'proj-uniform-time',
    title: '更衣時間の勤務時間算入制度導入',
    description: '制服着替え時間を勤務時間に算入することで、スタッフの働きやすさ向上と法的コンプライアンスを実現',
    category: 'employee-welfare',
    postId: 'post-uniform-time-proposal',
    initiator: 'user-2', // 佐藤花子（看護師）
    status: 'member-selection',
    priority: 'high',
    createdDate: new Date('2025-01-10T14:30:00'),
    lastUpdated: new Date('2025-01-16T16:20:00'),
    estimatedBudget: 2000000,
    estimatedROI: 120,
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-04-30'),
    approvalCompletedAt: new Date('2025-01-16T16:20:00'),
    memberSelectionStatus: 'in-progress',
    provisionalMembers: ['user-3', 'user-5', 'user-7', 'user-10'],
    milestones: [
      {
        id: 'ms-uniform-1',
        name: '承認プロセス完了',
        dueDate: new Date('2025-01-20'),
        status: 'completed',
        completedDate: new Date('2025-01-16'),
        assignee: 'user-6'
      },
      {
        id: 'ms-uniform-2',
        name: 'プロジェクトメンバー選定',
        dueDate: new Date('2025-01-25'),
        status: 'in-progress',
        assignee: 'user-3'
      },
      {
        id: 'ms-uniform-3',
        name: '労務規定改定案作成',
        dueDate: new Date('2025-02-15'),
        status: 'pending',
        assignee: 'user-5'
      },
      {
        id: 'ms-uniform-4',
        name: '試験運用開始',
        dueDate: new Date('2025-03-01'),
        status: 'pending',
        assignee: 'user-7'
      },
      {
        id: 'ms-uniform-5',
        name: '効果検証・本格運用',
        dueDate: new Date('2025-04-30'),
        status: 'pending',
        assignee: 'user-3'
      }
    ],
    workflows: [
      {
        id: 'wf-uniform-1',
        projectId: 'proj-uniform-time',
        stage: 'AUTO_PROJECT',
        approver: 'SYSTEM',
        approvedDate: new Date('2025-01-10T14:30:00'),
        comments: 'プロジェクト化基準を達成しました',
        status: 'approved'
      },
      {
        id: 'wf-uniform-2',
        projectId: 'proj-uniform-time',
        stage: 'TEAM_LEAD_APPROVAL',
        approver: 'user-3', // 田中太郎（チームリーダー）
        approvedDate: new Date('2025-01-12T11:15:00'),
        comments: '労働環境改善として非常に重要な提案です。法的観点からも適切と判断します。',
        status: 'approved'
      },
      {
        id: 'wf-uniform-3',
        projectId: 'proj-uniform-time',
        stage: 'MANAGER_APPROVAL',
        approver: 'user-6', // 高橋一郎（マネージャー）
        approvedDate: new Date('2025-01-15T14:45:00'),
        comments: 'コンプライアンス面とスタッフ満足度向上の両面で効果が期待できます。予算承認もOKです。',
        status: 'approved'
      },
      {
        id: 'wf-uniform-4',
        projectId: 'proj-uniform-time',
        stage: 'APPROVAL_COMPLETED',
        approver: 'SYSTEM',
        approvedDate: new Date('2025-01-16T16:20:00'),
        comments: '全承認プロセスが完了しました',
        status: 'approved'
      },
      {
        id: 'wf-uniform-5',
        projectId: 'proj-uniform-time',
        stage: 'MEMBER_SELECTION',
        approver: 'user-3', // プロジェクトリーダー
        comments: 'メンバー選出中：労務担当、現場代表、システム担当、HR担当を仮選出',
        status: 'in-progress'
      }
    ],
    teamMembers: ['user-2'], // 提案者
    tags: ['労働環境', '法的コンプライアンス', '働き方改革', '勤務時間管理']
  },
  
  // 既存の完了プロジェクト例
  {
    id: 'proj-001',
    title: '新入社員研修プログラム改革',
    description: '実践的な研修内容の導入により、新入社員の早期戦力化を実現',
    category: 'improvement',
    postId: 'post-1',
    initiator: 'user-3',
    status: 'completed',
    priority: 'high',
    createdDate: new Date('2024-04-16T10:00:00'),
    lastUpdated: new Date('2025-01-06T14:30:00'),
    estimatedBudget: 5000000,
    actualBudget: 4200000,
    estimatedROI: 180,
    actualROI: 195,
    startDate: new Date('2024-05-01'),
    endDate: new Date('2025-01-31'),
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
        name: '実践研修実施',
        dueDate: new Date('2024-09-30'),
        status: 'completed',
        completedDate: new Date('2024-09-28'),
        assignee: 'user-5'
      },
      {
        id: 'ms-001-4',
        name: '効果測定・改善',
        dueDate: new Date('2025-01-31'),
        status: 'completed',
        completedDate: new Date('2025-01-30'),
        assignee: 'user-3'
      }
    ],
    workflows: [
      {
        id: 'wf-001-1',
        projectId: 'proj-001',
        stage: 'APPROVAL_COMPLETED',
        approver: 'SYSTEM',
        approvedDate: new Date('2024-04-20T10:00:00'),
        status: 'approved'
      },
      {
        id: 'wf-001-2',
        projectId: 'proj-001',
        stage: 'MEMBER_SELECTION',
        approver: 'user-3',
        approvedDate: new Date('2024-04-25T15:30:00'),
        status: 'approved'
      }
    ],
    teamMembers: ['user-3', 'user-5', 'user-6', 'user-8'],
    memberSelectionStatus: 'completed',
    tags: ['人材育成', '教育研修', '新入社員', 'OJT']
  },

  // 承認中のプロジェクト例
  {
    id: 'proj-environment',
    title: 'オフィス環境改善プロジェクト',
    description: '照明・空調の最適化による作業環境の向上',
    category: 'improvement',
    postId: 'post-2',
    initiator: 'user-4',
    status: 'approval-pending',
    priority: 'medium',
    createdDate: new Date('2025-01-14T09:30:00'),
    lastUpdated: new Date('2025-01-16T11:00:00'),
    estimatedBudget: 8000000,
    estimatedROI: 150,
    milestones: [
      {
        id: 'ms-env-1',
        name: '現状調査・分析',
        dueDate: new Date('2025-02-28'),
        status: 'pending',
        assignee: 'user-4'
      }
    ],
    workflows: [
      {
        id: 'wf-env-1',
        projectId: 'proj-environment',
        stage: 'AUTO_PROJECT',
        approver: 'SYSTEM',
        approvedDate: new Date('2025-01-14T09:30:00'),
        status: 'approved'
      },
      {
        id: 'wf-env-2',
        projectId: 'proj-environment',
        stage: 'TEAM_LEAD_APPROVAL',
        approver: 'user-3',
        status: 'in-progress'
      }
    ],
    teamMembers: ['user-4'],
    memberSelectionStatus: 'not-started',
    tags: ['環境改善', '省エネ', '作業効率']
  }
];