// Demo data for authority management system

export const demoAuthorityMetrics = {
  approvals: {
    total: 156,
    pending: 12,
    approved: 128,
    rejected: 16,
    avgApprovalTime: 18.5
  },
  weightAdjustments: {
    total: 24,
    pending: 3,
    approved: 18,
    rejected: 3
  },
  emergencies: {
    total: 8,
    byLevel: {
      FACILITY: 5,
      CORPORATE: 2,
      SYSTEM: 1
    },
    pendingReports: 2,
    overdueReports: 1,
    avgReportTime: 16.2
  },
  audit: {
    totalLogs: 2847,
    alerts: 7,
    integrityIssues: 0
  },
  grievances: {
    total: 15,
    pending: 2,
    resolved: 11,
    dismissed: 2
  }
};

export const demoWeightAdjustments = [
  {
    id: 'wa_001',
    requesterId: 'user_dept_head_001',
    departmentSpecialty: 'humanDevelopment',
    proposalType: 'operational',
    stakeholderCategory: 'frontline',
    previousWeight: 1.5,
    newWeight: 1.8,
    adjustment: 0.3,
    reason: 'Increased emphasis on frontline staff feedback for operational improvements',
    status: 'approved',
    requestedAt: new Date('2024-01-15'),
    reviewedAt: new Date('2024-01-16'),
    reviewedBy: 'user_hr_director_001'
  },
  {
    id: 'wa_002',
    requesterId: 'user_dept_head_002',
    departmentSpecialty: 'careerSupport',
    proposalType: 'innovation',
    stakeholderCategory: 'zGen',
    previousWeight: 1.5,
    newWeight: 1.9,
    adjustment: 0.4,
    reason: 'Z Generation shows exceptional innovation adoption rate',
    status: 'pending',
    requestedAt: new Date('2024-01-20'),
    affectedDepartments: ['IT', 'R&D']
  }
];

export const demoApprovalRequests = [
  {
    id: 'apr_001',
    projectId: 'PRJ-2024-001',
    requesterId: 'user_team_lead_001',
    budgetAmount: 750000,
    currentApproverId: 'user_facility_head_001',
    approvalChain: [
      {
        approverId: 'user_dept_head_001',
        level: 3,
        role: 'Department Head',
        status: 'approved',
        decision: 'approved',
        decidedAt: new Date('2024-01-19T10:30:00'),
        reason: 'Well-justified budget for team expansion'
      },
      {
        approverId: 'user_facility_head_001',
        level: 4,
        role: 'Facility Head',
        status: 'pending'
      }
    ],
    status: 'pending',
    reason: 'New equipment purchase for production efficiency improvement',
    createdAt: new Date('2024-01-19T09:00:00'),
    deadline: new Date('2024-01-22T09:00:00')
  },
  {
    id: 'apr_002',
    projectId: 'PRJ-2024-002',
    requesterId: 'user_manager_001',
    budgetAmount: 3500000,
    currentApproverId: 'user_hr_dept_head_001',
    approvalChain: [
      {
        approverId: 'user_facility_head_001',
        level: 4,
        role: 'Facility Head',
        status: 'approved',
        decision: 'approved',
        decidedAt: new Date('2024-01-18T14:00:00'),
        reason: 'Strategic initiative aligned with corporate goals'
      },
      {
        approverId: 'user_hr_dept_head_001',
        level: 5,
        role: 'HR Department Head',
        status: 'pending'
      }
    ],
    status: 'pending',
    reason: 'Digital transformation initiative for HR processes',
    createdAt: new Date('2024-01-18T10:00:00'),
    deadline: new Date('2024-01-21T10:00:00'),
    escalatedAt: new Date('2024-01-20T10:00:00')
  }
];

export const demoEmergencyActions = [
  {
    id: 'em_001',
    actorId: 'user_facility_head_001',
    emergencyLevel: 'FACILITY',
    scenario: 'critical_staffing_shortage',
    actionType: 'Staff reallocation',
    affectedResources: ['Department A', 'Department B', 'Overtime Budget'],
    reason: 'Flu outbreak caused 40% staff absence in critical department',
    executedAt: new Date('2024-01-10T08:00:00'),
    postActionReport: {
      submittedAt: new Date('2024-01-11T10:00:00'),
      details: JSON.stringify({
        situation: 'Severe flu outbreak affecting production line',
        actions_taken: 'Reallocated 15 staff from non-critical departments',
        resources_used: 'Emergency overtime budget of ¥500,000',
        outcomes: 'Production maintained at 85% capacity, no delivery delays'
      }),
      outcomes: 'Successfully maintained operations with minimal disruption',
      reviewedBy: ['user_hr_director_001']
    }
  },
  {
    id: 'em_002',
    actorId: 'user_executive_sec_001',
    emergencyLevel: 'CORPORATE',
    scenario: 'data_breach',
    actionType: 'System shutdown and investigation',
    affectedResources: ['IT Systems', 'Customer Database', 'Security Team'],
    reason: 'Detected unauthorized access to customer database',
    executedAt: new Date('2024-01-05T22:00:00')
    // Post-action report pending
  }
];

export const demoAuditLogs = [
  {
    id: 'audit_001',
    timestamp: new Date('2024-01-20T14:30:00'),
    actorId: 'user_dept_head_001',
    actionType: 'WEIGHT_ADJUSTMENT',
    resourceType: 'weight_adjustment',
    resourceId: 'wa_001',
    previousState: { weight: 1.5 },
    newState: { weight: 1.8 },
    reason: 'Increased emphasis on frontline staff feedback',
    checksum: 'a1b2c3d4e5f6...',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'audit_002',
    timestamp: new Date('2024-01-20T13:00:00'),
    actorId: 'user_facility_head_001',
    actionType: 'BUDGET_APPROVAL',
    resourceType: 'approval_decision',
    resourceId: 'apr_001',
    previousState: { status: 'pending' },
    newState: { status: 'approved', budgetAmount: 750000 },
    reason: 'Budget within facility authority limit',
    checksum: 'b2c3d4e5f6g7...',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'audit_003',
    timestamp: new Date('2024-01-20T11:00:00'),
    actorId: 'anonymous',
    actionType: 'SYSTEM_OVERRIDE',
    resourceType: 'grievance',
    resourceId: 'grv_001',
    newState: { status: 'submitted', targetAction: 'wa_001' },
    reason: 'Grievance submitted',
    checksum: 'c3d4e5f6g7h8...'
  }
];

export const demoGrievances = [
  {
    id: 'grv_001',
    submitterId: undefined,
    isAnonymous: true,
    targetActionId: 'wa_001',
    targetActionType: 'WEIGHT_ADJUSTMENT',
    description: 'The recent weight adjustment unfairly diminishes management input in operational decisions',
    evidence: ['Historical data shows management decisions improved efficiency by 23%', 'Recent survey indicates staff morale concerns'],
    status: 'under_review',
    submittedAt: new Date('2024-01-17'),
    assignedTo: 'user_hr_director_001'
  },
  {
    id: 'grv_002',
    submitterId: 'user_employee_001',
    isAnonymous: false,
    targetActionId: 'apr_002',
    targetActionType: 'BUDGET_APPROVAL',
    description: 'Budget allocation does not consider impact on existing projects',
    evidence: ['Project timeline conflicts', 'Resource allocation overlap'],
    status: 'resolved',
    submittedAt: new Date('2024-01-15'),
    assignedTo: 'user_hr_director_001',
    resolution: {
      resolvedBy: 'user_hr_director_001',
      resolvedAt: new Date('2024-01-18'),
      outcome: 'Additional budget allocated to address concerns',
      actions: ['Budget review meeting scheduled', 'Project timelines adjusted', 'Additional resources approved']
    }
  }
];

export const demoQuarterlyReviews = [
  {
    id: 'qr_001',
    quarter: '2024-Q1',
    departmentId: 'HR',
    reviewers: [
      {
        userId: 'user_dept_head_001',
        department: 'Operations',
        assignedAt: new Date('2024-01-01')
      },
      {
        userId: 'user_dept_head_002',
        department: 'Finance',
        assignedAt: new Date('2024-01-01')
      }
    ],
    completedReviews: [],
    status: 'scheduled',
    scheduledDate: new Date('2024-03-15')
  }
];