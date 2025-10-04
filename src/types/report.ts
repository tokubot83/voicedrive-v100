// Post Report Type Definitions
// 投稿通報システムの型定義

/**
 * 通報の種類
 */
export type ReportType =
  | 'personal_attack'       // 個人攻撃
  | 'defamation'            // 誹謗中傷
  | 'harassment'            // ハラスメント
  | 'privacy_violation'     // プライバシー侵害
  | 'inappropriate_content' // 不適切なコンテンツ
  | 'spam'                  // スパム
  | 'other';                // その他

/**
 * 通報の状態
 */
export type ReportStatus =
  | 'pending'    // 確認待ち
  | 'reviewing'  // 確認中
  | 'actioned'   // 対応済み
  | 'dismissed'; // 却下

/**
 * 投稿通報データ
 */
export interface PostReport {
  id: string;
  postId: string;
  reporterId: string;      // 通報者ID（匿名でも内部IDは保持）
  reporterName?: string;   // 通報者名（表示用、匿名の場合は非表示）
  reportType: ReportType;
  description?: string;    // 詳細説明（任意）
  timestamp: Date;
  status: ReportStatus;
  reviewedBy?: string;     // 確認者ID
  reviewedAt?: Date;       // 確認日時
  actionTaken?: string;    // 実施した対応
  reviewNotes?: string;    // 確認者のメモ
}

/**
 * 通報サマリー（投稿ごとの集計）
 */
export interface ReportSummary {
  postId: string;
  totalReports: number;
  reportTypes: Record<ReportType, number>;
  lastReportedAt: Date;
  needsReview: boolean;           // 閾値超過フラグ
  highPriorityReports: number;    // 高優先度通報数
  status: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 通報閾値設定
 */
export interface ReportThreshold {
  lowThreshold: number;      // 注意レベル（例: 1件）
  mediumThreshold: number;   // 警告レベル（例: 3件）
  highThreshold: number;     // 緊急レベル（例: 5件）
  criticalThreshold: number; // 重大レベル（例: 10件）
}

/**
 * 通報統計データ
 */
export interface ReportStatistics {
  totalReports: number;
  reportsByType: Record<ReportType, number>;
  reportsByStatus: Record<ReportStatus, number>;
  pendingReports: number;
  averageResponseTime: number; // 平均対応時間（時間）
  topReportedPosts: Array<{
    postId: string;
    reportCount: number;
    status: ReportStatus;
  }>;
}

/**
 * 通報者への通知データ
 */
export interface ReportNotification {
  reportId: string;
  reporterId: string;
  message: string;
  status: ReportStatus;
  actionTaken?: string;
  timestamp: Date;
}

/**
 * 管理者への通報アラート
 */
export interface ReportAlert {
  id: string;
  postId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportCount: number;
  dominantReportType: ReportType;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}
