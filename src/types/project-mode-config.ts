/**
 * プロジェクトモード設定の型定義
 *
 * VoiceDriveのプロジェクトモード設定で使用される型定義
 * ProjectModeConfigテーブルのJSONフィールドの型を明確化
 *
 * @file src/types/project-mode-config.ts
 * @created 2025-10-21
 */

// ============================================
// プロジェクト化閾値設定
// ============================================

/**
 * プロジェクト化の閾値設定
 */
export interface ProjectModeThresholds {
  /** 部署プロジェクト化閾値（デフォルト: 200点） */
  department: number;
  /** 施設プロジェクト化閾値（デフォルト: 400点） */
  facility: number;
  /** 法人プロジェクト化閾値（デフォルト: 800点） */
  corporate: number;
}

/**
 * 緊急昇格設定
 */
export interface EmergencyEscalationConfig {
  /** 緊急昇格機能の有効/無効 */
  enabled: boolean;
  /** 緊急昇格を実行できる最低権限レベル（デフォルト: Level 8） */
  requiredLevel: number;
}

// ============================================
// チーム編成ルール設定
// ============================================

/**
 * チームサイズ設定
 */
export interface TeamSizeRules {
  /** 最小チームサイズ（デフォルト: 3名） */
  min: number;
  /** 推奨チームサイズ（デフォルト: 5名） */
  recommended: number;
  /** 最大チームサイズ（デフォルト: 12名） */
  max: number;
}

/**
 * 役割自動割り当て設定
 */
export interface RoleAssignmentRules {
  /** プロジェクトリーダー自動割当の有効/無効 */
  autoAssignLeader: boolean;
  /** サブリーダー自動割当の有効/無効 */
  autoAssignSubLeader: boolean;
  /** 記録係自動割当の有効/無効 */
  autoAssignRecorder: boolean;
  /** リーダーに必要な最低レベル（デフォルト: Level 5） */
  leaderMinLevel: number;
  /** サブリーダーに必要な最低レベル（デフォルト: Level 3） */
  subLeaderMinLevel: number;
}

/**
 * 多様性考慮設定
 */
export interface DiversityRules {
  /** 職種バランスを考慮するか */
  considerSpecialtyBalance: boolean;
  /** 関連部署を優先するか */
  prioritizeRelatedDepartments: boolean;
}

/**
 * チーム編成ルール（全体）
 */
export interface TeamFormationRules {
  /** チームサイズ設定 */
  teamSize: TeamSizeRules;
  /** 役割自動割り当て設定 */
  roleAssignment: RoleAssignmentRules;
  /** 多様性考慮設定 */
  diversityRules: DiversityRules;
}

// ============================================
// 進捗管理設定
// ============================================

/**
 * マイルストーン設定
 */
export interface MilestoneConfig {
  /** マイルストーンキー（例: 'kickoff', 'plan', 'midreport', 'final'） */
  key: string;
  /** マイルストーンラベル（例: 'キックオフ'） */
  label: string;
  /** プロジェクト開始後の日数（キックオフなど） */
  daysAfterStart?: number;
  /** キックオフ後の日数（計画書作成など） */
  daysAfterKickoff?: number;
  /** プロジェクト期間の何%時点か（中間報告など） */
  percentagePoint?: number;
  /** プロジェクト終了前の日数（最終報告など） */
  daysBeforeEnd?: number;
  /** 必須マイルストーンかどうか */
  required?: boolean;
}

/**
 * 通知設定
 */
export interface NotificationSettings {
  /** 期限前通知の有効/無効 */
  deadlineReminder: boolean;
  /** 期限の何日前に通知するか（デフォルト: 3日前） */
  deadlineReminderDays: number;
  /** 遅延アラートの有効/無効 */
  delayAlert: boolean;
  /** 週次レポートの有効/無効 */
  weeklyReport: boolean;
  /** 週次レポート送信曜日（デフォルト: 'friday'） */
  weeklyReportDay?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
}

// ============================================
// ProjectModeConfig.metadata
// ============================================

/**
 * ProjectModeConfig.metadataの型定義
 */
export interface ProjectModeMetadata {
  /** プロジェクト化閾値設定 */
  thresholds: ProjectModeThresholds;
  /** 緊急昇格設定 */
  emergencyEscalation: EmergencyEscalationConfig;
  /** マイルストーン設定 */
  milestones: MilestoneConfig[];
  /** 通知設定 */
  notifications: NotificationSettings;
}

// ============================================
// ProjectModeConfig全体
// ============================================

/**
 * プロジェクトモード設定（データベース完全版）
 *
 * ProjectModeConfigテーブルの完全な型定義
 */
export interface ProjectModeConfigData {
  /** 設定ID */
  id: string;
  /** 部署ID */
  departmentId: string;
  /** 部署プロジェクト化閾値（後方互換性のため保持） */
  projectUpgradeThreshold: number;
  /** チーム編成ルール（JSON） */
  teamFormationRules: TeamFormationRules;
  /** マイルストーン必須フラグ */
  milestoneRequired: boolean;
  /** 進捗レポート頻度 */
  progressReportFrequency: 'weekly' | 'biweekly' | 'monthly';
  /** 有効/無効 */
  isActive: boolean;
  /** メタデータ（JSON） */
  metadata: ProjectModeMetadata;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

// ============================================
// API リクエスト/レスポンス型
// ============================================

/**
 * 閾値設定更新リクエスト
 */
export interface UpdateThresholdsRequest {
  thresholds: ProjectModeThresholds;
  emergencyEscalation: EmergencyEscalationConfig;
}

/**
 * チーム編成ルール更新リクエスト
 */
export interface UpdateTeamFormationRulesRequest {
  teamFormationRules: TeamFormationRules;
}

/**
 * 進捗管理設定更新リクエスト
 */
export interface UpdateProgressManagementRequest {
  milestoneRequired: boolean;
  progressReportFrequency: 'weekly' | 'biweekly' | 'monthly';
  milestones: MilestoneConfig[];
  notifications: NotificationSettings;
}

/**
 * プロジェクトモード設定レスポンス（API用）
 */
export interface ProjectModeConfigResponse {
  id: string;
  departmentId: string;
  departmentName: string;
  projectUpgradeThreshold: number;
  teamFormationRules: TeamFormationRules;
  milestoneRequired: boolean;
  progressReportFrequency: 'weekly' | 'biweekly' | 'monthly';
  isActive: boolean;
  metadata: ProjectModeMetadata;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

// ============================================
// デフォルト値
// ============================================

/**
 * プロジェクトモード設定のデフォルト値
 */
export const DEFAULT_PROJECT_MODE_CONFIG = {
  thresholds: {
    department: 200,
    facility: 400,
    corporate: 800,
  },
  emergencyEscalation: {
    enabled: true,
    requiredLevel: 8,
  },
  teamFormationRules: {
    teamSize: {
      min: 3,
      recommended: 5,
      max: 12,
    },
    roleAssignment: {
      autoAssignLeader: true,
      autoAssignSubLeader: true,
      autoAssignRecorder: true,
      leaderMinLevel: 5,
      subLeaderMinLevel: 3,
    },
    diversityRules: {
      considerSpecialtyBalance: true,
      prioritizeRelatedDepartments: true,
    },
  },
  milestones: [
    { key: 'kickoff', label: 'キックオフ', daysAfterStart: 3, required: true },
    { key: 'plan', label: '計画書作成', daysAfterKickoff: 7, required: true },
    { key: 'midreport', label: '中間報告', percentagePoint: 50, required: false },
    { key: 'final', label: '最終報告', daysBeforeEnd: 7, required: true },
  ],
  notifications: {
    deadlineReminder: true,
    deadlineReminderDays: 3,
    delayAlert: true,
    weeklyReport: true,
    weeklyReportDay: 'friday' as const,
  },
  milestoneRequired: true,
  progressReportFrequency: 'weekly' as const,
} as const;

// ============================================
// バリデーションヘルパー
// ============================================

/**
 * チームサイズ設定のバリデーション
 */
export function validateTeamSize(teamSize: TeamSizeRules): boolean {
  return (
    teamSize.min > 0 &&
    teamSize.min <= teamSize.recommended &&
    teamSize.recommended <= teamSize.max &&
    teamSize.max <= 30
  );
}

/**
 * 閾値設定のバリデーション
 */
export function validateThresholds(thresholds: ProjectModeThresholds): boolean {
  return (
    thresholds.department > 0 &&
    thresholds.department <= thresholds.facility &&
    thresholds.facility <= thresholds.corporate
  );
}

/**
 * マイルストーン設定のバリデーション
 */
export function validateMilestone(milestone: MilestoneConfig): boolean {
  const hasValidTiming =
    (milestone.daysAfterStart !== undefined && milestone.daysAfterStart > 0) ||
    (milestone.daysAfterKickoff !== undefined && milestone.daysAfterKickoff > 0) ||
    (milestone.percentagePoint !== undefined && milestone.percentagePoint > 0 && milestone.percentagePoint <= 100) ||
    (milestone.daysBeforeEnd !== undefined && milestone.daysBeforeEnd > 0);

  return (
    milestone.key.length > 0 &&
    milestone.label.length > 0 &&
    hasValidTiming
  );
}
