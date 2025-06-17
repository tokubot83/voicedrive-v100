// コンプライアンス窓口システム用型定義

export type ReportCategory = 
  | 'harassment'      // ハラスメント
  | 'safety'          // 安全管理
  | 'financial'       // 財務・会計
  | 'compliance'      // コンプライアンス
  | 'discrimination'  // 差別・不公正
  | 'other';          // その他

export type ReportSeverity = 
  | 'low'      // 軽微
  | 'medium'   // 中程度
  | 'high'     // 重要
  | 'critical'; // 緊急

export type ReportStatus = 
  | 'received'        // 受付完了
  | 'triaging'        // 分類・重要度判定中
  | 'investigating'   // 内部調査中
  | 'escalated'       // 外部専門家へエスカレーション
  | 'resolved'        // 対応完了
  | 'closed';         // 案件終了

export type InvestigatorRole =
  | 'hr_specialist'     // 人事専門家
  | 'legal_counsel'     // 法務担当
  | 'safety_officer'    // 安全管理者
  | 'external_expert'   // 外部専門家
  | 'management';       // 管理職

export interface WhistleblowingReport {
  id: string;
  anonymousId: string;        // 通報者との連絡用匿名ID
  category: ReportCategory;
  severity: ReportSeverity;
  title: string;
  content: string;
  evidenceFiles?: string[];   // 証拠ファイルのURL
  submittedAt: Date;
  updatedAt: Date;
  status: ReportStatus;
  assignedInvestigators: InvestigatorRole[];
  internalNotes?: InvestigationNote[];
  escalationReason?: string;
  resolutionSummary?: string;
  followUpRequired: boolean;
  isAnonymous: boolean;
  priority: number;           // 1-10の優先度
}

export interface InvestigationNote {
  id: string;
  reportId: string;
  authorRole: InvestigatorRole;
  authorName: string;
  content: string;
  createdAt: Date;
  isConfidential: boolean;
  actionItems?: string[];
}

export interface EscalationRule {
  category: ReportCategory;
  internalThresholdDays: number;
  externalTriggers: string[];
  requiredSpecialists: InvestigatorRole[];
  autoEscalationConditions: string[];
}

export interface ReportStatistics {
  totalReports: number;
  byCategory: Record<ReportCategory, number>;
  byStatus: Record<ReportStatus, number>;
  bySeverity: Record<ReportSeverity, number>;
  averageResolutionDays: number;
  escalationRate: number;
  monthlyTrend: {
    month: string;
    count: number;
    resolved: number;
  }[];
}

export interface WhistleblowingDashboard {
  summary: {
    activeReports: number;
    pendingInvestigation: number;
    escalatedCases: number;
    resolvedThisMonth: number;
    overdueReports: number;
  };
  recentReports: WhistleblowingReport[];
  urgentCases: WhistleblowingReport[];
  trends: ReportStatistics;
  alerts: {
    type: 'overdue' | 'critical' | 'escalation_required';
    message: string;
    reportId: string;
    count: number;
  }[];
}

// 通報フォーム用
export interface ReportSubmissionForm {
  category: ReportCategory;
  title: string;
  content: string;
  isAnonymous: boolean;
  contactMethod?: 'email' | 'phone' | 'none';
  contactInfo?: string;
  evidenceDescription?: string;
  expectedOutcome?: string;
}

// 権限別表示設定
export interface WhistleblowingPermissions {
  canView: boolean;
  canInvestigate: boolean;
  canEscalate: boolean;
  canResolve: boolean;
  canViewStatistics: boolean;
  canAccessConfidentialNotes: boolean;
  canAssignInvestigators: boolean;
  maxSeverityLevel: ReportSeverity;
}