// 承認プロセス関連の型定義

export interface ApprovalStep {
  id: string;
  level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'escalated';
  approvers: Approver[];
  deadline?: Date;
  estimatedDuration: string;
}

export interface Approver {
  name: string;
  role: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: Date;
  comment?: string;
}

import { Post } from '../types';

export interface ApprovalProcessDetailsProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export interface ApprovalStepCardProps {
  step: ApprovalStep;
  isActive: boolean;
  stepNumber: number;
}

export type ApprovalActionType = 'approve' | 'reject' | 'request_info' | 'escalate';

export interface ApprovalAction {
  type: ApprovalActionType;
  stepId: string;
  approverId: string;
  comment?: string;
  timestamp: Date;
}