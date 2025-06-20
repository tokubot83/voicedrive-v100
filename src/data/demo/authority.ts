// 権限管理のデモデータ
export interface AuthorityMetrics {
  totalApprovals: number;
  pendingApprovals: number;
  approvedItems: number;
  rejectedItems: number;
  averageProcessingTime: number; // hours
}

export interface WeightAdjustmentRequest {
  id: string;
  userId: string;
  userName: string;
  currentWeight: number;
  requestedWeight: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface EmergencyManagement {
  level: 'FACILITY' | 'CORPORATE' | 'SYSTEM';
  activeCases: number;
  resolvedCases: number;
  averageResolutionTime: number; // hours
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export interface GrievanceStatistics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: number; // days
}

export const authorityMetrics: AuthorityMetrics = {
  totalApprovals: 156,
  pendingApprovals: 8,
  approvedItems: 142,
  rejectedItems: 6,
  averageProcessingTime: 18.5
};

export const weightAdjustmentRequests: WeightAdjustmentRequest[] = [
  {
    id: 'wa-1',
    userId: 'user-3',
    userName: '鈴木 美香',
    currentWeight: 3.0,
    requestedWeight: 3.5,
    reason: '部署責任者としての影響力向上',
    status: 'pending',
    submittedAt: new Date('2025-06-10'),
  },
  {
    id: 'wa-2',
    userId: 'user-4',
    userName: '田中 恵子',
    currentWeight: 2.0,
    requestedWeight: 2.5,
    reason: '主任職としての権限強化',
    status: 'approved',
    submittedAt: new Date('2025-05-20'),
    reviewedBy: 'user-2',
    reviewedAt: new Date('2025-05-25')
  }
];

export const emergencyManagement: EmergencyManagement[] = [
  {
    level: 'FACILITY',
    activeCases: 1,
    resolvedCases: 12,
    averageResolutionTime: 4.2
  },
  {
    level: 'CORPORATE',
    activeCases: 0,
    resolvedCases: 3,
    averageResolutionTime: 8.7
  },
  {
    level: 'SYSTEM',
    activeCases: 0,
    resolvedCases: 1,
    averageResolutionTime: 24.0
  }
];

export const auditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    action: '投票権限の調整',
    userId: 'user-2',
    userName: '佐藤 花子',
    timestamp: new Date('2025-06-14T10:30:00'),
    details: 'user-4の投票重みを2.0から2.5に調整',
    severity: 'medium'
  },
  {
    id: 'audit-2',
    action: 'プロジェクト承認',
    userId: 'user-1',
    userName: '山田 太郎',
    timestamp: new Date('2025-06-13T15:45:00'),
    details: '非常勤職員慶弔休暇制度プロジェクトを承認',
    severity: 'high'
  },
  {
    id: 'audit-3',
    action: '緊急エスカレーション処理',
    userId: 'user-2',
    userName: '佐藤 花子',
    timestamp: new Date('2025-06-12T09:15:00'),
    details: '感染対策緊急対応を実施',
    severity: 'high'
  }
];

export const grievanceStatistics: GrievanceStatistics = {
  totalReports: 15,
  pendingReports: 3,
  resolvedReports: 12,
  averageResolutionTime: 7.2
};

export default {
  authorityMetrics,
  weightAdjustmentRequests,
  emergencyManagement,
  auditLogs,
  grievanceStatistics
};