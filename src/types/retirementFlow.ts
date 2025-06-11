export type RetirementStepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'error';

export interface RetirementStepData {
  status: RetirementStepStatus;
  completedAt?: Date;
  completedBy?: string;
  data?: any;
  errors?: string[];
  warnings?: string[];
}

export interface RetirementProcessState {
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeeRole: string;
  currentStep: number; // 1-4
  steps: {
    [key: number]: RetirementStepData;
  };
  startedAt: Date;
  completedAt?: Date;
  initiatedBy: string;
  processId: string;
}

export interface Step1AccountDeactivationData {
  timing: 'immediate' | 'scheduled';
  scheduledDate?: Date;
  forceLogout: boolean;
  notifyUser: boolean;
  backupCreated: boolean;
}

export interface Step2PermissionRevocationData {
  revokedPermissions: string[];
  handoverAssignments: {
    [permission: string]: string; // permission -> new assignee
  };
  projectHandovers: {
    projectId: string;
    newOwnerId: string;
  }[];
  emergencyContacts: string[];
}

export interface Step3PostAnonymizationData {
  targetPosts: {
    id: string;
    type: 'improvement' | 'community' | 'report';
    title: string;
    anonymizationLevel: 'full' | 'department' | 'partial';
  }[];
  preservedElements: string[];
  personalInfoRemoved: string[];
  affectedComments: number;
}

export interface Step4CompletionNotificationData {
  notificationRecipients: {
    id: string;
    name: string;
    role: string;
    notified: boolean;
  }[];
  reportGenerated: boolean;
  complianceChecklist: {
    [item: string]: boolean;
  };
  finalNotes?: string;
}

export interface RetirementOperationLog {
  id: string;
  processId: string;
  stepNumber: number;
  employeeId: string;
  executorId: string;
  executorName: string;
  timestamp: Date;
  operation: string;
  data: any;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RetirementStepProps {
  processState: RetirementProcessState;
  onStepComplete: (stepNumber: number, data: any) => Promise<void>;
  onStepError: (stepNumber: number, error: string) => void;
  onNavigateBack: () => void;
}

export const RETIREMENT_STEP_TITLES = {
  1: 'アカウント無効化',
  2: '権限取り消し',
  3: '投稿匿名化',
  4: '完了通知'
} as const;

export const RETIREMENT_STEP_DESCRIPTIONS = {
  1: 'システムアクセスを無効化し、セキュリティを確保します',
  2: '権限を適切に取り消し、必要に応じて引き継ぎを行います',
  3: '投稿内容を匿名化し、個人情報を保護します',
  4: '関係部署に処理完了を通知し、記録を保管します'
} as const;

export const RETIREMENT_STEP_ICONS = {
  1: '🔒',
  2: '🚫',
  3: '👤',
  4: '📢'
} as const;