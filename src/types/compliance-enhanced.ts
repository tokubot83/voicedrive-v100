/**
 * コンプライアンス窓口 拡張型定義
 * 小原病院規定準拠版
 * @version 1.0.0
 * @date 2025-09-24
 */

// ==================== 基本型定義 ====================

/**
 * 匿名性レベル
 */
export type AnonymityLevel =
  | 'full_anonymous'  // 完全匿名
  | 'conditional'     // 条件付き開示
  | 'disclosed';      // 実名通報

/**
 * 通報カテゴリ（小原病院規定準拠）
 */
export type ReportMainCategory =
  | 'harassment'        // ハラスメント
  | 'safety'           // 安全管理
  | 'financial'        // 財務・会計
  | 'medical_law'      // 医療法令違反
  | 'discrimination'   // 差別・不公正
  | 'information_leak' // 個人情報漏洩
  | 'research_fraud'   // 研究不正
  | 'other';          // その他

/**
 * ハラスメントタイプ
 */
export type HarassmentType =
  | 'power'      // パワーハラスメント
  | 'sexual'     // セクシャルハラスメント
  | 'maternity'  // マタニティハラスメント
  | 'other';     // その他

/**
 * 医療違反タイプ
 */
export type MedicalViolationType =
  | 'medical_law'     // 医療法違反
  | 'billing_fraud'   // 診療報酬不正請求
  | 'malpractice';    // 医療過誤

/**
 * 緊急度レベル
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * 通報ステータス
 */
export type ReportStatus =
  | 'submitted'         // 送信済み
  | 'under_review'      // 確認中
  | 'investigating'     // 調査中
  | 'pending_decision'  // 判定待ち
  | 'resolved'         // 解決済み
  | 'closed';          // 終了

/**
 * 転送ステータス
 */
export type TransferStatus =
  | 'pending'       // 転送待機
  | 'transferred'   // 転送済み
  | 'acknowledged'  // 受信確認済み
  | 'failed';       // 転送失敗

// ==================== インターフェース定義 ====================

/**
 * 通報者情報（段階的開示対応）
 */
export interface ReporterInfo {
  isAnonymous: boolean;
  disclosureLevel: AnonymityLevel;

  // 開示同意情報
  consentToDisclose?: {
    granted: boolean;
    grantedAt?: Date;
    conditions?: string[];
    expiresAt?: Date;
  };

  // 属性情報（統計用、匿名でも収集）
  attributes?: {
    employmentType?: 'regular' | 'contract' | 'part_time' | 'other';
    yearsOfService?: 'less_than_1' | '1-3' | '3-5' | '5-10' | 'over_10';
    ageGroup?: '20s' | '30s' | '40s' | '50s' | '60s' | 'over_60s';
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    department?: string;  // 段階的開示で使用
  };

  // 連絡先情報（任意）
  contactInfo?: {
    method: 'email' | 'phone' | 'system' | 'none';
    value?: string;  // 暗号化必須
    isVerified: boolean;
  };
}

/**
 * カテゴリ情報
 */
export interface CategoryInfo {
  main: ReportMainCategory;
  sub?: string;
  specificType?: {
    harassmentType?: HarassmentType;
    medicalViolationType?: MedicalViolationType;
    customType?: string;
  };
  tags?: string[];
}

/**
 * 事案詳細情報
 */
export interface IncidentDetails {
  description: string;

  // 場所情報（段階的開示）
  location: {
    general: string;      // "病棟"、"外来"など
    specific?: string;    // "3階東病棟"など（第2段階以降）
    building?: string;    // "本館"など
    isRemote?: boolean;   // リモート/オンライン
  };

  // 時間情報
  timeline: {
    occurredAt?: Date;           // 発生日時
    startedAt?: Date;            // 継続的な場合の開始日
    endedAt?: Date;              // 終了日（あれば）
    frequency?: string;          // "毎日"、"週3-4回"など
    duration?: string;           // "30分程度"など
    isOngoing: boolean;          // 継続中かどうか
    lastOccurrence?: Date;       // 最後の発生日時
  };

  // 被通報者情報（段階的開示）
  accused?: {
    count: number;                                              // 人数
    relationship: 'supervisor' | 'colleague' | 'subordinate' |
                 'external' | 'patient' | 'unknown';          // 関係性
    position?: string;                                         // 役職（段階的開示）
    department?: string;                                       // 部署（段階的開示）
    name?: string;                                            // 実名（第3段階のみ）
    pattern?: string;                                         // 行動パターン
  };

  // 影響範囲
  impact?: {
    affectedPeople: number;
    affectedDepartments?: string[];
    patientImpact: boolean;
    reputationRisk: boolean;
    financialImpact?: number;
  };
}

/**
 * 証拠情報
 */
export interface EvidenceInfo {
  hasEvidence: boolean;
  types: ('document' | 'recording' | 'photo' | 'video' |
          'email' | 'witness' | 'physical' | 'other')[];

  // ファイル情報
  files: {
    id: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    encryptedPath: string;
    checksum: string;
    encryptionKeyId: string;
    isVerified: boolean;
    metadata?: Record<string, any>;
  }[];

  // 証人情報
  witnesses?: {
    count: number;
    willingToTestify: number;
    contacted: boolean;
    statements?: string[];  // 暗号化必須
  };

  // 証拠の説明
  description?: string;
}

/**
 * 緊急度評価
 */
export interface AssessmentInfo {
  severity: SeverityLevel;
  urgencyScore: number;  // 1-10

  // リスク要因
  riskFactors: {
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
  }[];

  requiresImmediateAction: boolean;
  suggestedActions?: string[];

  // 評価情報
  assessment: {
    assessedBy: 'system' | 'human' | 'hybrid';
    assessedAt: Date;
    assessorRole?: string;
    confidence: number;  // 0-100
    reasoning?: string;
  };

  // エスカレーション判定
  escalation?: {
    needed: boolean;
    to: 'management' | 'legal' | 'police' | 'committee';
    reason: string;
    deadline?: Date;
  };
}

/**
 * 転送管理情報
 */
export interface TransferInfo {
  status: TransferStatus;
  attempts: number;

  // 転送履歴
  history: {
    attemptNumber: number;
    timestamp: Date;
    status: 'success' | 'failed';
    errorMessage?: string;
    responseTime?: number;
  }[];

  // 最新の転送情報
  latest?: {
    transferredAt: Date;
    medicalSystemCaseId: string;
    acknowledgement: {
      receivedAt: Date;
      receivedBy: string;
      message: string;
      referenceNumber: string;
    };
  };

  // エラー情報
  lastError?: {
    code: string;
    message: string;
    occurredAt: Date;
    retryAfter?: Date;
  };
}

/**
 * 進捗追跡情報
 */
export interface TrackingInfo {
  currentStatus: ReportStatus;
  currentPhase: string;
  progressPercentage: number;

  // ステータス履歴
  statusHistory: {
    status: ReportStatus;
    changedAt: Date;
    changedBy: string;
    note?: string;
    duration?: number;  // この状態の継続時間（分）
  }[];

  // マイルストーン
  milestones: {
    name: string;
    completed: boolean;
    completedAt?: Date;
    expectedAt?: Date;
  }[];

  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;

  // SLA情報
  sla?: {
    targetResponseTime: number;  // 時間
    actualResponseTime?: number;
    isWithinSLA: boolean;
  };
}

/**
 * アクセス制御情報
 */
export interface AccessControlInfo {
  // 閲覧権限
  permissions: {
    roleId: string;
    roleName: string;
    accessLevel: 'read' | 'write' | 'admin';
    grantedAt: Date;
    grantedBy: string;
    expiresAt?: Date;
  }[];

  // アクセスログ
  accessLog: {
    id: string;
    timestamp: Date;
    userId: string;
    userName?: string;
    role: string;
    action: 'view' | 'edit' | 'export' | 'share' | 'delete';
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    duration?: number;  // アクセス時間（秒）
  }[];

  // データマスキング設定
  maskingRules: {
    field: string;
    level: 'none' | 'partial' | 'full';
    condition: string;
  }[];

  // 最終アクセス情報
  lastAccessed?: {
    userId: string;
    timestamp: Date;
    action: string;
  };
}

/**
 * 通知設定
 */
export interface NotificationSettings {
  enabled: boolean;

  // 通知先
  recipients: {
    id: string;
    role: string;
    notifyOn: ReportStatus[];
    method: ('email' | 'sms' | 'system' | 'push')[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
  }[];

  // 自動通知ルール
  rules: {
    trigger: string;
    condition: string;
    action: string;
    template: string;
  }[];

  // 通知履歴
  history?: {
    sentAt: Date;
    to: string[];
    type: string;
    status: 'sent' | 'delivered' | 'failed';
    message?: string;
  }[];
}

// ==================== メインインターフェース ====================

/**
 * コンプライアンス通報（完全版）
 */
export interface ComplianceReport {
  // 識別情報
  reportId: string;          // VD-2025-XXXX形式
  anonymousId: string;       // ANON-XXXXXX形式
  version: string;           // データ構造バージョン

  // タイムスタンプ
  createdAt: Date;
  submittedAt: Date;
  lastUpdatedAt: Date;

  // コア情報
  reporter: ReporterInfo;
  category: CategoryInfo;
  incident: IncidentDetails;
  evidence: EvidenceInfo;
  assessment: AssessmentInfo;

  // システム情報
  transfer: TransferInfo;
  tracking: TrackingInfo;
  accessControl: AccessControlInfo;
  notifications: NotificationSettings;

  // メタデータ
  metadata: {
    source: 'web' | 'mobile' | 'api' | 'import';
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  };

  // 監査情報
  audit: {
    createdBy: string;
    lastModifiedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
    archiveAt?: Date;
    retentionPolicy: string;
  };
}

// ==================== ユーティリティ型 ====================

/**
 * 部分的な通報データ（作成時用）
 */
export type PartialComplianceReport = Partial<ComplianceReport> & {
  reporter: ReporterInfo;
  category: CategoryInfo;
  incident: Pick<IncidentDetails, 'description' | 'timeline'>;
};

/**
 * 通報サマリー（リスト表示用）
 */
export interface ComplianceReportSummary {
  reportId: string;
  anonymousId: string;
  category: string;
  severity: SeverityLevel;
  status: ReportStatus;
  submittedAt: Date;
  lastUpdatedAt: Date;
  progressPercentage: number;
}

/**
 * 通報フィルター
 */
export interface ComplianceReportFilter {
  categories?: ReportMainCategory[];
  severities?: SeverityLevel[];
  statuses?: ReportStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchTerm?: string;
  hasEvidence?: boolean;
  isOngoing?: boolean;
  assignedTo?: string;
}

/**
 * 統計情報
 */
export interface ComplianceStatistics {
  total: number;
  byCategory: Record<ReportMainCategory, number>;
  bySeverity: Record<SeverityLevel, number>;
  byStatus: Record<ReportStatus, number>;

  trends: {
    daily: { date: string; count: number }[];
    weekly: { week: string; count: number }[];
    monthly: { month: string; count: number }[];
  };

  performance: {
    averageResponseTime: number;  // 時間
    averageResolutionTime: number;  // 日
    withinSLA: number;  // パーセンテージ
    escalationRate: number;  // パーセンテージ
  };

  insights: {
    hotspots: { department: string; count: number }[];
    patterns: { pattern: string; frequency: number }[];
    risks: { risk: string; level: string }[];
  };
}

// ==================== エクスポート ====================

export default ComplianceReport;