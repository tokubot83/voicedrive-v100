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