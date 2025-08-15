/**
 * 異議申し立てシステムのインターフェース定義
 * VoiceDrive SNS連携用の型定義
 */

// 異議申し立てリクエスト
export interface AppealRequest {
  // 必須項目
  employeeId: string;           // 職員ID
  employeeName: string;          // 職員名
  evaluationPeriod: string;      // 評価期間（例: "2025年度上期"）
  appealCategory: AppealCategory; // 申し立てカテゴリー
  appealReason: string;          // 申し立て理由（詳細）
  
  // オプション項目
  originalScore?: number;        // 現在の評価点
  requestedScore?: number;       // 希望する評価点
  evidenceDocuments?: string[];  // 証拠書類（ファイルパス/URL）
  preferredContactMethod?: string; // 希望連絡方法
  departmentId?: string;         // 部署ID
  jobCategory?: string;          // 職種
}

// 申し立てカテゴリー
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
  decision?: {
    outcome: 'approved' | 'partially_approved' | 'rejected';
    reason: string;
    adjustedScore?: number;
    decidedBy: string;
    decidedAt: Date;
  };
  communicationLog?: AppealCommunication[];
}

// 異議申し立てコミュニケーション記録
export interface AppealCommunication {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'clarification' | 'notification';
  from: string;
  to: string;
  message: string;
  attachments?: string[];
  read?: boolean;
}

// 異議申し立てログ
export interface AppealLog {
  timestamp: string;
  appealId: string;
  action: AppealAction;
  userId: string;
  userRole?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

// 異議申し立てアクション
export enum AppealAction {
  SUBMIT = 'submit',
  RECEIVE = 'receive',
  START_REVIEW = 'start_review',
  REQUEST_INFO = 'request_info',
  PROVIDE_INFO = 'provide_info',
  COMPLETE_REVIEW = 'complete_review',
  APPROVE = 'approve',
  REJECT = 'reject',
  WITHDRAW = 'withdraw',
  ESCALATE = 'escalate',
  COMMENT = 'comment'
}

// 異議申し立て統計
export interface AppealStatistics {
  period: string;
  total: number;
  byStatus: Record<AppealStatus, number>;
  byCategory: Record<AppealCategory, number>;
  byDepartment: Record<string, number>;
  averageResolutionDays: number;
  approvalRate: number;
  escalationRate: number;
}

// APIリクエスト/レスポンス型
export interface AppealApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

export interface AppealApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// フィルタリングオプション
export interface AppealFilterOptions {
  status?: AppealStatus[];
  category?: AppealCategory[];
  departmentId?: string[];
  evaluationPeriod?: string;
  dateFrom?: Date;
  dateTo?: Date;
  employeeId?: string;
  reviewerId?: string;
}

// ページネーション
export interface AppealPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 通知設定
export interface AppealNotificationSettings {
  enableEmail: boolean;
  enableSMS: boolean;
  enablePush: boolean;
  enableInApp: boolean;
  recipientRoles: string[];
  escalationThresholdDays: number;
  reminderIntervalDays: number;
}

// 審査ワークフロー
export interface AppealWorkflow {
  workflowId: string;
  appealId: string;
  currentStep: number;
  steps: AppealWorkflowStep[];
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface AppealWorkflowStep {
  stepNumber: number;
  name: string;
  assignedTo: string;
  assignedRole: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  decision?: string;
  comments?: string;
  requiredActions?: string[];
}

// 異議申し立てテンプレート
export interface AppealTemplate {
  templateId: string;
  name: string;
  category: AppealCategory;
  description: string;
  reasonTemplate: string;
  requiredEvidence: string[];
  estimatedResolutionDays: number;
  active: boolean;
}

// バッチ処理用
export interface AppealBatchOperation {
  operationId: string;
  type: 'approve' | 'reject' | 'escalate' | 'notify';
  appealIds: string[];
  reason?: string;
  executedBy: string;
  executedAt: Date;
  results: {
    successful: string[];
    failed: { appealId: string; error: string }[];
  };
}

// エクスポート用フォーマット
export interface AppealExportData {
  appealId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  evaluationPeriod: string;
  category: string;
  reason: string;
  originalScore: number;
  requestedScore: number;
  finalScore: number;
  status: string;
  submittedDate: string;
  resolvedDate?: string;
  decision?: string;
  resolutionDays?: number;
}