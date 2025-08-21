// VoiceDrive側の異議申し立て型定義

// 異議申し立てカテゴリー
export enum AppealCategory {
  CRITERIA_MISINTERPRETATION = 'evaluation_criteria_misinterpretation', // 評価基準の誤解釈
  ACHIEVEMENT_OVERSIGHT = 'achievement_oversight',     // 成果の見落とし
  PERIOD_ERROR = 'period_error',                      // 評価期間の誤り
  CALCULATION_ERROR = 'calculation_error',            // 点数計算の誤り
  OTHER = 'other'                                     // その他
}

// 異議申し立てステータス
export enum AppealStatus {
  RECEIVED = 'received',           // 受理済み
  UNDER_REVIEW = 'under_review',   // 審査中
  ADDITIONAL_INFO = 'additional_info', // 追加情報待ち
  RESOLVED = 'resolved',           // 解決済み
  WITHDRAWN = 'withdrawn',         // 取り下げ
  REJECTED = 'rejected'            // 却下
}

// 異議申し立てリクエスト
export interface AppealRequest {
  employeeId: string;
  employeeName: string;
  evaluationPeriod: string;
  appealCategory: AppealCategory;
  appealReason: string;
  originalScore?: number;
  requestedScore?: number;
  evidenceDocuments?: string[];
  preferredContactMethod?: string;
  departmentId?: string;
  jobCategory?: string;
}

// 異議申し立てレスポンス
export interface AppealResponse {
  success: boolean;
  appealId: string;
  message: string;
  expectedResponseDate?: string;
  details?: {
    status: AppealStatus;
    processedAt: string;
    assignedTo?: string;
    priority?: 'high' | 'medium' | 'low';
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// 異議申し立てレコード
export interface AppealRecord {
  appealId: string;
  employeeId: string;
  employeeName: string;
  departmentId?: string;
  evaluationPeriod: string;
  appealCategory: AppealCategory;
  appealReason: string;
  originalScore?: number;
  requestedScore?: number;
  finalScore?: number;
  status: AppealStatus;
  evidenceDocuments?: string[];
  createdAt: Date;
  updatedAt: Date;
  submittedVia: 'voicedrive' | 'paper' | 'email' | 'system';
  reviewStartDate?: Date;
  reviewEndDate?: Date;
  reviewerComments?: string;
}

// フロントエンド用の拡張型
export interface AppealFormData extends Partial<AppealRequest> {
  step?: number;
  isSubmitting?: boolean;
  validationErrors?: Record<string, string>;
}

export interface AppealListItem {
  appealId: string;
  evaluationPeriod: string;
  appealCategory: AppealCategory;
  status: AppealStatus;
  statusLabel: string;
  statusColor: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canWithdraw: boolean;
}

export interface AppealNotification {
  id: string;
  appealId: string;
  type: 'status_update' | 'info_request' | 'resolution';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}

// カテゴリーのラベル定義
export const APPEAL_CATEGORY_LABELS: Record<AppealCategory, string> = {
  [AppealCategory.CRITERIA_MISINTERPRETATION]: '評価基準の誤解釈',
  [AppealCategory.ACHIEVEMENT_OVERSIGHT]: '成果の見落とし',
  [AppealCategory.PERIOD_ERROR]: '評価期間の誤り',
  [AppealCategory.CALCULATION_ERROR]: '点数計算の誤り',
  [AppealCategory.OTHER]: 'その他'
};

// ステータスのラベルと色定義
export const APPEAL_STATUS_CONFIG: Record<AppealStatus, { label: string; color: string; icon: string }> = {
  [AppealStatus.RECEIVED]: {
    label: '受理済み',
    color: 'blue',
    icon: '📝'
  },
  [AppealStatus.UNDER_REVIEW]: {
    label: '審査中',
    color: 'orange',
    icon: '🔍'
  },
  [AppealStatus.ADDITIONAL_INFO]: {
    label: '追加情報待ち',
    color: 'yellow',
    icon: '📋'
  },
  [AppealStatus.RESOLVED]: {
    label: '解決済み',
    color: 'green',
    icon: '✅'
  },
  [AppealStatus.WITHDRAWN]: {
    label: '取り下げ',
    color: 'gray',
    icon: '↩️'
  },
  [AppealStatus.REJECTED]: {
    label: '却下',
    color: 'red',
    icon: '❌'
  }
};

// バリデーションルール
export const APPEAL_VALIDATION_RULES = {
  appealReason: {
    minLength: 100,
    maxLength: 2000,
    required: true
  },
  evidenceDocuments: {
    maxFiles: 5,
    maxSizePerFile: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
  },
  submissionDeadline: 14 // 評価開示後14日以内
};

// 既に上で定義しているため、re-exportは不要