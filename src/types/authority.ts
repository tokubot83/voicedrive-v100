// Authority Management Types

import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { HierarchicalUser, ProposalType, StakeholderCategory } from './index';

// Authority Types
export type AuthorityType = 
  | 'WEIGHT_ADJUSTMENT'
  | 'BUDGET_APPROVAL'
  | 'EMERGENCY_ACTION'
  | 'CROSS_DEPARTMENT_REVIEW'
  | 'SYSTEM_OVERRIDE';

// Department specialties for weight adjustments
export type DepartmentSpecialty = 
  | 'humanDevelopment'     // Recruitment/Training
  | 'careerSupport'        // Work Environment
  | 'businessInnovation';  // IT/Efficiency

// Weight adjustment configuration
export interface WeightAdjustmentConfig {
  departmentHead: DepartmentSpecialty;
  adjustmentRange: number; // ±0.3, ±0.4, etc.
  affectedCategories: StakeholderCategory[];
  proposalTypes: ProposalType[];
}

// Weight adjustment authority mapping
export const WEIGHT_ADJUSTMENT_AUTHORITIES: Record<DepartmentSpecialty, WeightAdjustmentConfig> = {
  humanDevelopment: {
    departmentHead: 'humanDevelopment',
    adjustmentRange: 0.3,
    affectedCategories: ['frontline', 'management', 'veteran', 'zGen'],
    proposalTypes: ['operational', 'strategic']
  },
  careerSupport: {
    departmentHead: 'careerSupport',
    adjustmentRange: 0.4,
    affectedCategories: ['frontline', 'veteran'],
    proposalTypes: ['operational', 'communication']
  },
  businessInnovation: {
    departmentHead: 'businessInnovation',
    adjustmentRange: 0.3,
    affectedCategories: ['management', 'zGen'],
    proposalTypes: ['innovation', 'strategic']
  }
};

// Weight Adjustment Request
export interface WeightAdjustment {
  id: string;
  requesterId: string;
  departmentSpecialty: DepartmentSpecialty;
  proposalType: ProposalType;
  stakeholderCategory: StakeholderCategory;
  previousWeight: number;
  newWeight: number;
  adjustment: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  supervisorId?: string; // HR Director for supervision
  affectedDepartments?: string[];
  crossDepartmentReviews?: CrossDepartmentReview[];
}

// Cross-department review for changes
export interface CrossDepartmentReview {
  id: string;
  adjustmentId: string;
  departmentId: string;
  reviewerId: string;
  decision: 'approve' | 'veto' | 'pending';
  reason?: string;
  reviewedAt?: Date;
  vetoDeadline: Date; // 48 hours from notification
}

// Approval Flow Configuration
export interface ApprovalFlowConfig {
  budgetTier: {
    min: number;
    max: number;
  };
  requiredApprovers: {
    level: PermissionLevel;
    role: string;
    mandatory: boolean;
  }[];
  escalationThreshold: number; // hours before auto-escalation
  deadlineHours: number; // 72 hours default
}

// Approval Request
export interface ApprovalRequest {
  id: string;
  projectId: string;
  requesterId: string;
  budgetAmount: number;
  currentApproverId: string;
  approvalChain: ApprovalNode[];
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  reason: string;
  createdAt: Date;
  deadline: Date;
  escalatedAt?: Date;
  completedAt?: Date;
}

// Approval Node in the chain
export interface ApprovalNode {
  approverId: string;
  level: PermissionLevel;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decision?: string;
  reason?: string;
  decidedAt?: Date;
}

// Emergency Authority Types
export type EmergencyLevel = 'FACILITY' | 'CORPORATE' | 'SYSTEM';

export interface EmergencyAuthority {
  level: EmergencyLevel;
  requiredPermission: PermissionLevel;
  scope: string[];
  reportingRequirements: {
    reportTo: PermissionLevel[];
    deadlineHours: number;
    requiredDetails: string[];
  };
}

// Emergency Action Record
export interface EmergencyAction {
  id: string;
  actorId: string;
  emergencyLevel: EmergencyLevel;
  actionType: string;
  affectedResources: string[];
  reason: string;
  executedAt: Date;
  postActionReport?: {
    submittedAt: Date;
    details: string;
    outcomes: string;
    reviewedBy?: string[];
  };
}

// Audit Log Entry
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actorId: string;
  actionType: AuthorityType;
  resourceType: string;
  resourceId: string;
  previousState?: any;
  newState?: any;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  checksum?: string; // For tamper protection
}

// Notification for authority actions
export interface AuthorityNotification {
  id: string;
  recipientId: string;
  type: 'weight_adjustment' | 'approval_required' | 'emergency_action' | 'cross_review' | 'deadline_warning';
  title: string;
  message: string;
  actionRequired: boolean;
  deadline?: Date;
  relatedResourceId: string;
  relatedResourceType: string;
  createdAt: Date;
  readAt?: Date;
}

// Grievance submission
export interface Grievance {
  id: string;
  submitterId?: string; // Optional for anonymous
  isAnonymous: boolean;
  targetActionId: string;
  targetActionType: AuthorityType;
  description: string;
  evidence?: string[];
  status: 'submitted' | 'under_review' | 'resolved' | 'dismissed';
  submittedAt: Date;
  assignedTo?: string;
  resolution?: {
    resolvedBy: string;
    resolvedAt: Date;
    outcome: string;
    actions: string[];
  };
}

// Quarterly Review Rotation
export interface QuarterlyReview {
  id: string;
  quarter: string; // e.g., "2024-Q1"
  departmentId: string;
  reviewers: {
    userId: string;
    department: string;
    assignedAt: Date;
  }[];
  completedReviews: {
    reviewerId: string;
    completedAt: Date;
    findings: string[];
    recommendations: string[];
  }[];
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledDate: Date;
  completedDate?: Date;
}

// Authority Action Result
export interface AuthorityActionResult {
  success: boolean;
  actionId: string;
  message: string;
  affectedUsers?: string[];
  notifications?: AuthorityNotification[];
  auditLogId: string;
}