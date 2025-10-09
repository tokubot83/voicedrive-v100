export type PostType = 'improvement' | 'community' | 'report';
export type AnonymityLevel = 'anonymous' | 'department_only' | 'facility_anonymous' | 'facility_department' | 'real_name' | 'full';
export type CommentPrivacyLevel = 'anonymous' | 'partial' | 'selective' | 'full';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type VoteOption = 'strongly-oppose' | 'oppose' | 'neutral' | 'support' | 'strongly-support';
export type UserRole = 'employee' | 'chief' | 'manager' | 'executive';

// Re-export types from other files (avoiding circular imports)
export type { Poll, PollOption } from './poll';
export type { Event } from './event';
export type {
  PostMode,
  PostModeInfo,
  DiscussionAnalysisData,
  ProjectAnalysisData,
  PostAnalysisPanel,
} from './postMode';

// Stakeholder categories
export type StakeholderCategory = 'frontline' | 'management' | 'veteran' | 'zGen';

// Proposal types for improvement posts (医療・介護系法人向け)
export type ProposalType = 'operational' | 'communication' | 'innovation' | 'strategic';

// Project levels for organization hierarchy
export type ProjectLevel = 'DEPARTMENT' | 'FACILITY' | 'CORPORATE';
export type ProjectStage = 'DEPARTMENT_PROJECT' | 'FACILITY_PROJECT' | 'CORPORATE_PROJECT';
export type ApprovalLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5' | 'LEVEL_7_OVERRIDE';
export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'in_progress';

// Stakeholder weight configuration
export interface StakeholderWeight {
  category: StakeholderCategory;
  weight: number;
  label: string;
  description: string;
}

// Proposal type configuration
export interface ProposalTypeConfig {
  type: ProposalType;
  label: string;
  icon: string;
  description: string;
  weights: StakeholderWeight[];
  borderColor: string;
}

export interface User {
  id: string;
  name: string;
  department: string;
  role?: string;
  avatar?: string;
  facility_id?: string;
  stakeholderCategory?: StakeholderCategory;
  position?: string;
  expertise?: number;
  hierarchyLevel?: number;
  permissionLevel?: number;
  // 退職関連
  isRetired?: boolean;
  retirementDate?: Date;
  anonymizedId?: string;
  retirementProcessedBy?: string;
  retirementProcessedDate?: Date;
}

// Account types mapping to 13-level permission system
export type AccountType = 
  | 'CHAIRMAN'                      // Level 13 - 理事長
  | 'GENERAL_ADMINISTRATIVE_DIRECTOR' // Level 12 - 厚生会本部統括事務局長
  | 'HR_GENERAL_MANAGER'            // Level 11 - 人財統括本部 統括管理部門長
  | 'HR_DEPARTMENT_HEAD'            // Level 10 - 人財統括本部 各部門長
  | 'CAREER_SUPPORT_STAFF'          // Level 9 - 人財統括本部 キャリア支援部門員
  | 'HR_ADMIN_STAFF'                // Level 8 - 人財統括本部事務員
  | 'HOSPITAL_DIRECTOR'             // Level 7 - 院長・施設長
  | 'VICE_DIRECTOR'                 // Level 6 - 副院長
  | 'ADMINISTRATIVE_DIRECTOR'       // Level 5 - 事務長
  | 'DEPARTMENT_HEAD'               // Level 4 - 部長・課長
  | 'HEAD_NURSE'                    // Level 3 - 師長
  | 'SUPERVISOR'                    // Level 2 - 主任
  | 'STAFF';                        // Level 1 - 一般職員

// Hierarchical user interface extending base User
export interface HierarchicalUser extends User {
  accountType: AccountType;
  permissionLevel: number;
  facility_id?: string;
  department_id?: string;
  parent_id?: string; // ID of direct supervisor
  children_ids?: string[]; // IDs of direct reports
  budgetApprovalLimit?: number; // In JPY, null for unlimited
  organizationPath?: string[]; // Path from root to this user
}

export interface Post {
  id: string;
  type: PostType;
  proposalType?: ProposalType; // For improvement posts
  content: string;
  author: User;
  anonymityLevel: AnonymityLevel;
  priority?: Priority;
  timestamp: Date;
  votes: Record<VoteOption, number>;
  votesByStakeholder?: Record<StakeholderCategory, Record<VoteOption, number>>; // Votes broken down by stakeholder category
  userVote?: VoteOption; // Current user's vote (added by useVoting hook)
  hasUserVoted?: boolean; // Whether current user has voted (added by useVoting hook)
  comments: Comment[];
  projectId?: string;
  approver?: User;

  // 議題モード用（DB統合 - 2025-10-09）
  agendaScore?: number;  // 投票スコア (Prisma schema)
  agendaLevel?: 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';  // 議題レベル (Prisma schema)

  // 議題モード用のステータス（委員会活性化）
  agendaStatus?: {
    level: 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';
    score: number;
    isSubmittedToCommittee?: boolean;
    committeeSubmissionDate?: string;
    committeeApprovalStatus?: 'pending' | 'approved' | 'rejected';
    proposalDocumentId?: string;
    // 管理職による処理状況
    managementStatus?: 'unreviewed' | 'under_analysis' | 'document_draft' | 'ready_for_submission' | 'submitted';
    lastReviewedBy?: string;
    lastReviewedDate?: Date;
    // 議題候補マーク
    markedAsAgendaCandidate?: boolean;
    markedBy?: string;
    markedDate?: Date;
  };

  // 委員会詳細情報（議題モード専用）
  committeeStatus?: import('./committee').CommitteeStatus;
  committeeInfo?: import('./committee').CommitteeInfo;
  committeeDecision?: import('./committee').CommitteeDecision;

  // 議題モード専用の期限管理
  agendaDeadline?: Date;           // 投票期限
  agendaDeadlineExtensions?: number; // 延長回数
  lastActivityDate?: Date;          // 最終活動日（投票・コメント）

  // プロジェクトモード用のステータス（チーム編成・協働）
  projectStatus?: string | {
    stage: 'approaching' | 'ready' | 'active' | 'completed';
    score: number;
    threshold: number;
    progress: number;
    level?: 'PENDING' | 'TEAM' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'STRATEGIC';
  };

  projectDetails?: {
    manager?: string;
    team?: string[];
    milestones?: ProjectMilestone[];
    roi?: {
      investment: number;
      expectedSavings: number;
    };
    completedDate?: string;
    outcomes?: string;
  };
  // Enhanced project data for project-level posts
  votingData?: VotingData;
  enhancedProjectStatus?: EnhancedProjectStatus;
  approvalFlow?: ApprovalFlow;
  tags?: string[];
  relatedProjects?: string[];
  // Emergency escalation properties
  isEmergencyEscalated?: boolean;
  escalatedBy?: string;
  escalatedDate?: string;
  escalationReason?: string;
  
  // Freespace-specific properties
  freespaceCategory?: 'idea_sharing' | 'casual_discussion' | 'event_planning';
  freespaceScope?: 'team' | 'department' | 'facility' | 'organization';
  
  // Poll and Event integration (using imports for type safety)
  poll?: import('./poll').Poll;
  event?: import('./event').Event;
  
  // Freespace expiration properties
  expirationDate?: Date;
  isExpired?: boolean;
  isArchived?: boolean;
  archivedDate?: Date;
  extensionRequested?: boolean;
  extensionReason?: string;
  extensionRequestedDate?: Date;
  
  // Voting deadline properties
  votingDeadline?: Date;
  eligibleVoters?: number;
  voteBreakdown?: {
    agree: number;
    disagree: number;
    hold: number;
  };
  
  // Poll result properties for auto-generated result posts
  pollResult?: {
    totalVotes: number;
    winnerOption: any;
    participationRate: number;
    results: Array<{
      option: any;
      votes: number;
      percentage: number;
    }>;
  };
  originalPollId?: string;
  originalPostId?: string;
  
  // For backward compatibility
  pollOptions?: import('./poll').PollOption[]; // Alias for poll?.options
  eventDetails?: import('./event').Event; // Alias for event
  title?: string; // For poll results
}

export interface ProjectMilestone {
  id: string;
  name: string;
  completed: boolean;
}

// Enhanced project status for project-level posts
export interface EnhancedProjectStatus {
  stage: ProjectStage;
  level: ProjectLevel;
  approvalLevel: ApprovalLevel;
  budget: number;
  timeline: string;
  milestones: ProjectMilestoneExtended[];
  resources: ProjectResources;
}

export interface ProjectMilestoneExtended {
  name: string;
  status: MilestoneStatus;
  progress?: number;
  date: string;
}

export interface ProjectResources {
  budget_used: number;
  budget_total: number;
  team_size: number;
  completion: number;
}

export interface ApprovalFlowHistory {
  level: ApprovalLevel;
  approver: string;
  status: ApprovalStatus;
  date: string | null;
}

export interface ApprovalFlow {
  currentLevel: ApprovalLevel;
  status: ApprovalStatus;
  history: ApprovalFlowHistory[];
}

export interface VotingData {
  totalVotes: number;
  votes: Record<VoteOption, number>;
  consensus: number;
  participation: number;
}

export type CommentType = 'proposal' | 'question' | 'support' | 'concern';

export interface Comment {
  id: string;
  postId: string;
  parentId?: string; // 返信の場合、親コメントのID
  content: string;
  author: User;
  commentType: CommentType;
  anonymityLevel: AnonymityLevel;
  privacyLevel?: CommentPrivacyLevel;
  timestamp: Date;
  likes: number;
  hasLiked?: boolean;
  replies?: Comment[]; // ネストされた返信
  visibleInfo?: {
    facility?: string;
    position?: string;
    experienceYears?: number;
    isManagement?: boolean;
  };
}

export interface ComposeFormData {
  type: PostType;
  proposalType?: ProposalType;
  content: string;
  priority?: Priority;
  anonymityLevel: AnonymityLevel;
}