export type PostType = 'improvement' | 'community' | 'report';
export type AnonymityLevel = 'real' | 'department' | 'anonymous';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type VoteOption = 'strongly-oppose' | 'oppose' | 'neutral' | 'support' | 'strongly-support';
export type UserRole = 'employee' | 'chief' | 'manager' | 'executive';

// Stakeholder categories
export type StakeholderCategory = 'frontline' | 'management' | 'veteran' | 'zGen';

// Proposal types for improvement posts
export type ProposalType = 'operational' | 'strategic' | 'innovation' | 'riskManagement' | 'communication';

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
  role: string;
  avatar?: string;
  stakeholderCategory?: StakeholderCategory;
}

// Account types mapping to permission levels
export type AccountType = 
  | 'CHAIRMAN'           // Level 8
  | 'EXECUTIVE_SECRETARY' // Level 7
  | 'HR_DIRECTOR'        // Level 6
  | 'HR_DEPARTMENT_HEAD' // Level 5
  | 'FACILITY_HEAD'      // Level 4
  | 'DEPARTMENT_HEAD'    // Level 3
  | 'SUPERVISOR'         // Level 2
  | 'STAFF';             // Level 1

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
  comments: Comment[];
  projectId?: string;
  approver?: User;
  projectStatus?: string | {
    stage: 'approaching' | 'ready' | 'active' | 'completed';
    score: number;
    threshold: number;
    progress: number;
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
}

export interface ProjectMilestone {
  id: string;
  name: string;
  completed: boolean;
  current?: boolean;
  targetDate?: string;
  completedDate?: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: User;
  anonymityLevel: AnonymityLevel;
  timestamp: Date;
}

export interface ComposeFormData {
  type: PostType;
  proposalType?: ProposalType;
  content: string;
  priority?: Priority;
  anonymityLevel: AnonymityLevel;
}