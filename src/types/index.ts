export type PostType = 'improvement' | 'community' | 'report';
export type AnonymityLevel = 'real' | 'department' | 'anonymous';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type VoteOption = 'strongly-oppose' | 'oppose' | 'neutral' | 'support' | 'strongly-support';
export type UserRole = 'employee' | 'chief' | 'manager' | 'executive';

export interface User {
  id: string;
  name: string;
  department: string;
  role: string;
  avatar?: string;
}

export interface Post {
  id: string;
  type: PostType;
  content: string;
  author: User;
  anonymityLevel: AnonymityLevel;
  priority?: Priority;
  timestamp: Date;
  votes: Record<VoteOption, number>;
  comments: Comment[];
  projectId?: string;
  approver?: string;
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
  content: string;
  priority?: Priority;
  anonymityLevel: AnonymityLevel;
}