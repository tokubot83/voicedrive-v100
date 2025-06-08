// Demo data for Authority Management System

import { 
  WeightAdjustment, 
  ApprovalRequest, 
  EmergencyAction,
  Grievance,
  AuditLogEntry,
  AuthorityType,
  EmergencyLevel,
  DepartmentSpecialty
} from '../../types/authority';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

// Sample Weight Adjustments
export const demoWeightAdjustments: WeightAdjustment[] = [
  {
    id: 'wa-001',
    requesterId: 'dept_head_hr_001',
    departmentSpecialty: 'humanDevelopment',
    proposalType: 'operational',
    stakeholderCategory: 'frontline',
    previousWeight: 1.5,
    newWeight: 1.8,
    adjustment: 0.3,
    reason: 'Frontline staff feedback has been exceptionally valuable for recent operational improvements',
    status: 'approved',
    requestedAt: new Date('2024-01-15T10:00:00'),
    reviewedAt: new Date('2024-01-15T14:00:00'),
    reviewedBy: 'hr_director_001',
    supervisorId: 'hr_director_001',
    affectedDepartments: ['operations', 'quality_control']
  },
  {
    id: 'wa-002',
    requesterId: 'dept_head_career_001',
    departmentSpecialty: 'careerSupport',
    proposalType: 'communication',
    stakeholderCategory: 'veteran',
    previousWeight: 1.2,
    newWeight: 1.6,
    adjustment: 0.4,
    reason: 'Veteran employees have shown exceptional mentoring capabilities',
    status: 'pending',
    requestedAt: new Date('2024-01-18T09:30:00'),
    supervisorId: 'hr_director_001',
    affectedDepartments: ['training', 'human_resources'],
    crossDepartmentReviews: [
      {
        id: 'cdr-001',
        adjustmentId: 'wa-002',
        departmentId: 'training',
        reviewerId: 'dept_head_training_001',
        decision: 'pending',
        vetoDeadline: new Date('2024-01-20T09:30:00')
      }
    ]
  }
];

// Sample Approval Requests
export const demoApprovalRequests: ApprovalRequest[] = [
  {
    id: 'ar-001',
    projectId: 'proj-2024-001',
    requesterId: 'manager_001',
    budgetAmount: 1500000,
    currentApproverId: 'section_chief_001',
    approvalChain: [
      {
        approverId: 'manager_001',
        level: PermissionLevel.LEVEL_3,
        role: 'Manager',
        status: 'approved',
        decision: 'approved',
        reason: 'Project aligns with department goals',
        decidedAt: new Date('2024-01-16T11:00:00')
      },
      {
        approverId: 'section_chief_001',
        level: PermissionLevel.LEVEL_4,
        role: 'Section Chief',
        status: 'pending'
      }
    ],
    status: 'pending',
    reason: 'New employee training system implementation',
    createdAt: new Date('2024-01-16T10:00:00'),
    deadline: new Date('2024-01-19T10:00:00')
  },
  {
    id: 'ar-002',
    projectId: 'proj-2024-002',
    requesterId: 'chief_001',
    budgetAmount: 8000000,
    currentApproverId: 'hr_gm_001',
    approvalChain: [
      {
        approverId: 'section_chief_001',
        level: PermissionLevel.LEVEL_4,
        role: 'Section Chief',
        status: 'approved',
        decision: 'approved',
        reason: 'Critical infrastructure upgrade',
        decidedAt: new Date('2024-01-14T15:00:00')
      },
      {
        approverId: 'hr_dept_head_001',
        level: PermissionLevel.LEVEL_5,
        role: 'HR Department Head',
        status: 'approved',
        decision: 'approved',
        reason: 'Supports talent retention strategy',
        decidedAt: new Date('2024-01-15T09:00:00')
      },
      {
        approverId: 'hr_gm_001',
        level: PermissionLevel.LEVEL_6,
        role: 'HR General Manager',
        status: 'pending'
      }
    ],
    status: 'pending',
    reason: 'Organization-wide performance management system',
    createdAt: new Date('2024-01-14T10:00:00'),
    deadline: new Date('2024-01-17T10:00:00')
  }
];

// Sample Emergency Actions
export const demoEmergencyActions: EmergencyAction[] = [
  {
    id: 'ea-001',
    actorId: 'facility_head_001',
    emergencyLevel: 'FACILITY' as EmergencyLevel,
    actionType: 'Resource Reallocation',
    affectedResources: ['nursing_staff', 'medical_supplies', 'emergency_budget'],
    reason: 'Critical staffing shortage due to flu outbreak',
    executedAt: new Date('2024-01-17T02:30:00'),
    postActionReport: {
      submittedAt: new Date('2024-01-17T20:00:00'),
      details: JSON.stringify({
        situation: 'Sudden 40% staff absence due to flu',
        actions_taken: 'Reallocated staff from non-critical departments',
        resources_used: '15 temporary nurses, ¥2M emergency budget',
        outcomes: 'Maintained critical care services without interruption'
      }),
      outcomes: 'Successfully managed crisis with minimal service disruption',
      reviewedBy: ['hr_director_001', 'executive_001']
    }
  },
  {
    id: 'ea-002',
    actorId: 'director_001',
    emergencyLevel: 'CORPORATE' as EmergencyLevel,
    actionType: 'Policy Override',
    affectedResources: ['data_security_policy', 'it_systems', 'vendor_contracts'],
    reason: 'Major data breach detected, immediate action required',
    executedAt: new Date('2024-01-18T16:45:00')
    // Post-action report pending
  }
];

// Sample Grievances
export const demoGrievances: Grievance[] = [
  {
    id: 'gr-001',
    submitterId: undefined, // Anonymous
    isAnonymous: true,
    targetActionId: 'wa-001',
    targetActionType: 'WEIGHT_ADJUSTMENT' as AuthorityType,
    description: 'The weight adjustment seems to favor certain departments unfairly. Management category weight was reduced without proper consultation.',
    evidence: [
      'Previous meeting minutes showed different agreement',
      'Stakeholder survey results not considered'
    ],
    status: 'under_review',
    submittedAt: new Date('2024-01-16T16:00:00'),
    assignedTo: 'hr_director_001'
  },
  {
    id: 'gr-002',
    submitterId: 'manager_002',
    isAnonymous: false,
    targetActionId: 'ar-002',
    targetActionType: 'BUDGET_APPROVAL' as AuthorityType,
    description: 'Budget approval process bypassed standard procurement procedures',
    evidence: ['Email chain showing irregular approval flow'],
    status: 'resolved',
    submittedAt: new Date('2024-01-15T11:00:00'),
    assignedTo: 'hr_gm_001',
    resolution: {
      resolvedBy: 'hr_gm_001',
      resolvedAt: new Date('2024-01-16T15:00:00'),
      outcome: 'Investigation found emergency procurement justified due to critical timeline',
      actions: [
        'Updated emergency procurement guidelines',
        'Added documentation requirements for future cases'
      ]
    }
  }
];

// Sample Audit Logs
export const demoAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: new Date('2024-01-18T10:15:00'),
    actorId: 'dept_head_hr_001',
    actionType: 'WEIGHT_ADJUSTMENT' as AuthorityType,
    resourceType: 'weight_adjustment',
    resourceId: 'wa-001',
    previousState: { weight: 1.5 },
    newState: { weight: 1.8 },
    reason: 'Frontline staff feedback has been exceptionally valuable',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    checksum: 'a1b2c3d4e5f6...'
  },
  {
    id: 'audit-002',
    timestamp: new Date('2024-01-18T14:30:00'),
    actorId: 'hr_director_001',
    actionType: 'BUDGET_APPROVAL' as AuthorityType,
    resourceType: 'approval_decision',
    resourceId: 'ar-001',
    previousState: { status: 'pending' },
    newState: { status: 'approved', amount: 1500000 },
    reason: 'Project meets all criteria and budget is available',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0...',
    checksum: 'b2c3d4e5f6g7...'
  },
  {
    id: 'audit-003',
    timestamp: new Date('2024-01-17T02:30:00'),
    actorId: 'facility_head_001',
    actionType: 'EMERGENCY_ACTION' as AuthorityType,
    resourceType: 'emergency',
    resourceId: 'critical_staffing_shortage',
    newState: {
      level: 'FACILITY',
      resources: ['nursing_staff', 'medical_supplies', 'emergency_budget']
    },
    reason: 'Critical staffing shortage due to flu outbreak',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0...',
    checksum: 'c3d4e5f6g7h8...'
  }
];

// Demo Authority Metrics
export const demoAuthorityMetrics = {
  weightAdjustments: {
    total: 15,
    pending: 3,
    approved: 10,
    rejected: 2,
    averageProcessingTime: 18.5 // hours
  },
  approvals: {
    total: 45,
    pending: 8,
    approved: 32,
    rejected: 5,
    escalated: 3,
    averageApprovalTime: 36.2 // hours
  },
  emergencies: {
    total: 12,
    byLevel: {
      FACILITY: 8,
      CORPORATE: 3,
      SYSTEM: 1
    },
    pendingReports: 2,
    averageReportTime: 14.5 // hours
  },
  grievances: {
    total: 18,
    resolved: 12,
    dismissed: 3,
    pending: 3,
    anonymous: 7
  },
  audit: {
    totalLogs: 1250,
    integrityIssues: 0,
    alerts: {
      total: 5,
      critical: 1,
      high: 2,
      medium: 2,
      low: 0
    }
  }
};