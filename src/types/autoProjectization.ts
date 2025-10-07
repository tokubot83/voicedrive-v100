/**
 * 自動プロジェクト化システム型定義
 *
 * 議題モードで一定スコアに達したアイデアボイスを
 * プロジェクトモードのプロジェクトに自動変換
 */

import { Post } from './index';
import { ProjectLevel } from './visibility';

/**
 * プロジェクト化提案のステータス
 */
export type ProjectizationStatus =
  | 'eligible'        // 適格（閾値達成、承認待ち）
  | 'pending_review'  // レビュー中
  | 'approved'        // 承認済み（プロジェクト化実行）
  | 'rejected'        // 却下
  | 'converted';      // 変換完了

/**
 * プロジェクト化の優先度
 */
export type ProjectizationPriority =
  | 'low'             // 通常（スコア50-99）
  | 'normal'          // 標準（スコア100-299）
  | 'high'            // 高（スコア300-599）
  | 'urgent';         // 緊急（スコア600+）

/**
 * プロジェクト規模の推定
 */
export interface ProjectSizeEstimate {
  projectLevel: ProjectLevel;
  estimatedDuration: string;      // 「3-12ヶ月」等
  estimatedBudget: number;        // 推定予算（円）
  recommendedTeamSize: number;    // 推奨チーム人数
  requiredApproverLevel: number;  // 必要承認者レベル
}

/**
 * プロジェクト化提案
 */
export interface ProjectizationProposal {
  id: string;
  postId: string;
  post: Post;

  // スコア情報
  currentScore: number;
  threshold: number;
  achievedLevel: ProjectLevel;

  // 提案情報
  proposedDate: Date;
  status: ProjectizationStatus;
  priority: ProjectizationPriority;

  // プロジェクト推定
  projectEstimate: ProjectSizeEstimate;

  // 承認フロー
  assignedApproverId?: string;
  assignedApproverName?: string;
  reviewedDate?: Date;
  reviewedBy?: string;
  reviewComment?: string;
  rejectionReason?: string;

  // プロジェクト化後
  projectId?: string;
  convertedDate?: Date;

  // 自動判定情報
  autoDetectedDate: Date;
  supportRate: number;           // 賛成率 %
  totalVotes: number;
  participationRate: number;     // 参加率 %

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}

/**
 * プロジェクト化承認アクション
 */
export interface ProjectizationApproval {
  proposalId: string;
  action: 'approve' | 'reject' | 'request_info';
  approverId: string;
  approverName: string;
  approverLevel: number;
  comment?: string;
  rejectionReason?: string;

  // プロジェクト設定（承認時）
  projectSettings?: {
    title: string;
    description: string;
    objectives: string[];
    targetDuration: string;
    estimatedBudget?: number;
    proposedTeamLeaderId?: string;
    proposedTeamMemberIds?: string[];
    milestones?: {
      name: string;
      description: string;
      targetDate: Date;
    }[];
  };

  timestamp: Date;
}

/**
 * プロジェクト化履歴
 */
export interface ProjectizationHistory {
  proposalId: string;
  action: 'created' | 'reviewed' | 'approved' | 'rejected' | 'converted';
  performedBy: string;
  performedByName: string;
  timestamp: Date;
  details?: string;
  previousStatus?: ProjectizationStatus;
  newStatus?: ProjectizationStatus;
}

/**
 * プロジェクト化統計
 */
export interface ProjectizationStats {
  // 提案状況
  totalEligible: number;          // 適格投稿数
  pendingReview: number;          // レビュー待ち
  approved: number;               // 承認済み
  rejected: number;               // 却下
  converted: number;              // 変換完了

  // レベル別内訳
  byLevel: Record<ProjectLevel, number>;

  // 期間統計
  thisMonthConversions: number;   // 今月の変換数
  avgReviewTime: number;          // 平均レビュー時間（日）
  approvalRate: number;           // 承認率 %

  // トレンド
  weeklyTrend: {
    week: string;
    eligible: number;
    converted: number;
  }[];
}

/**
 * プロジェクト化設定
 */
export interface ProjectizationConfig {
  // 自動検出設定
  enableAutoDetection: boolean;
  scoreThresholds: {
    team: number;         // 50
    department: number;   // 100
    facility: number;     // 300
    organization: number; // 600
    strategic: number;    // 1200
  };

  // 承認フロー設定
  requireApproval: boolean;
  approverAssignment: 'auto' | 'manual';
  autoAssignByLevel: Record<ProjectLevel, number>;  // レベル→承認者権限

  // 通知設定
  notifyApprovers: boolean;
  notifyOriginalAuthor: boolean;
  reminderIntervalDays: number;

  // プロジェクト設定
  autoSetProjectDetails: boolean;
  requireTeamLeaderAssignment: boolean;
  minTeamSize: number;
  maxTeamSize: number;
}

/**
 * スコア閾値からプロジェクトレベルを判定
 */
export const getProjectLevelFromScore = (score: number): ProjectLevel => {
  if (score >= 1200) return 'STRATEGIC';
  if (score >= 600) return 'ORGANIZATION';
  if (score >= 300) return 'FACILITY';
  if (score >= 100) return 'DEPARTMENT';
  if (score >= 50) return 'TEAM';
  return 'PENDING';
};

/**
 * プロジェクトレベルから予算上限を取得
 */
export const getBudgetLimitFromLevel = (level: ProjectLevel): number => {
  const limits: Record<ProjectLevel, number> = {
    'TEAM': 50000,           // 5万円
    'DEPARTMENT': 200000,    // 20万円
    'FACILITY': 10000000,    // 1000万円
    'ORGANIZATION': 20000000, // 2000万円
    'STRATEGIC': -1,          // 無制限
    'PENDING': 0
  };
  return limits[level];
};

/**
 * プロジェクトレベルから推奨期間を取得
 */
export const getRecommendedDurationFromLevel = (level: ProjectLevel): string => {
  const durations: Record<ProjectLevel, string> = {
    'TEAM': '3-12ヶ月',
    'DEPARTMENT': '3-12ヶ月',
    'FACILITY': '6-18ヶ月',
    'ORGANIZATION': '12-36ヶ月',
    'STRATEGIC': '12-60ヶ月',
    'PENDING': '未定'
  };
  return durations[level];
};

/**
 * プロジェクトレベルから推奨チーム規模を取得
 */
export const getRecommendedTeamSizeFromLevel = (level: ProjectLevel): number => {
  const sizes: Record<ProjectLevel, number> = {
    'TEAM': 3,
    'DEPARTMENT': 5,
    'FACILITY': 8,
    'ORGANIZATION': 12,
    'STRATEGIC': 15,
    'PENDING': 0
  };
  return sizes[level];
};

/**
 * プロジェクトレベルから必要承認者レベルを取得
 */
export const getRequiredApproverLevelFromProjectLevel = (level: ProjectLevel): number => {
  const approverLevels: Record<ProjectLevel, number> = {
    'TEAM': 2,         // 主任以上
    'DEPARTMENT': 3,   // 係長以上
    'FACILITY': 4,     // 課長以上
    'ORGANIZATION': 5, // 事務長以上
    'STRATEGIC': 13,   // 理事長
    'PENDING': 1
  };
  return approverLevels[level];
};

/**
 * スコアから優先度を判定
 */
export const getPriorityFromScore = (score: number): ProjectizationPriority => {
  if (score >= 600) return 'urgent';
  if (score >= 300) return 'high';
  if (score >= 100) return 'normal';
  return 'low';
};

/**
 * プロジェクト化提案のプレビューデータ生成
 */
export const generateProjectPreview = (
  post: Post,
  score: number
): Partial<ProjectizationProposal> => {
  const level = getProjectLevelFromScore(score);
  const priority = getPriorityFromScore(score);

  return {
    currentScore: score,
    achievedLevel: level,
    priority,
    projectEstimate: {
      projectLevel: level,
      estimatedDuration: getRecommendedDurationFromLevel(level),
      estimatedBudget: getBudgetLimitFromLevel(level),
      recommendedTeamSize: getRecommendedTeamSizeFromLevel(level),
      requiredApproverLevel: getRequiredApproverLevelFromProjectLevel(level)
    }
  };
};
