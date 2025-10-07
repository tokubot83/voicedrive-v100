/**
 * 施設プロジェクト管理型定義
 * Level 10+（人財統括本部各部門長以上）専用
 *
 * ボトムアップ（自動プロジェクト化）プロジェクトの
 * 監督・調整を行う
 */

import { ProjectLevel } from './visibility';
import { User } from './index';

/**
 * プロジェクト起源タイプ
 */
export type ProjectOrigin =
  | 'bottom_up'      // ボトムアップ（アイデアボイスから自動変換）
  | 'top_down'       // トップダウン（戦略イニシアチブ）
  | 'committee'      // 委員会提案
  | 'management';    // 経営層指示

/**
 * プロジェクト実行ステータス
 */
export type ProjectExecutionStatus =
  | 'planning'       // 計画中
  | 'team_forming'   // チーム編成中
  | 'in_progress'    // 実行中
  | 'on_hold'        // 一時停止
  | 'completed'      // 完了
  | 'cancelled';     // 中止

/**
 * プロジェクト健全性
 */
export type ProjectHealth =
  | 'healthy'        // 順調
  | 'at_risk'        // リスクあり
  | 'critical';      // 危機的状況

/**
 * リソースタイプ
 */
export type ResourceType =
  | 'personnel'      // 人員
  | 'budget'         // 予算
  | 'equipment'      // 設備
  | 'time';          // 時間

/**
 * 課題の優先度
 */
export type IssuePriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

/**
 * 課題のステータス
 */
export type IssueStatus =
  | 'open'           // 未対応
  | 'in_progress'    // 対応中
  | 'resolved'       // 解決済み
  | 'closed';        // 完了

/**
 * プロジェクトリソース
 */
export interface ProjectResource {
  type: ResourceType;
  allocated: number;        // 割り当て量
  used: number;             // 使用量
  remaining: number;        // 残量
  unit: string;             // 単位（人、円、台、時間等）
  utilizationRate: number;  // 利用率 %
  notes?: string;
}

/**
 * プロジェクト課題
 */
export interface ProjectIssue {
  id: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  category: 'resource' | 'schedule' | 'quality' | 'scope' | 'communication' | 'other';

  // 担当情報
  assignedTo?: string;
  assignedToName?: string;
  reportedBy: string;
  reportedByName: string;

  // 日付情報
  reportedDate: Date;
  dueDate?: Date;
  resolvedDate?: Date;

  // 影響
  impact: string;             // 影響の説明
  mitigation?: string;        // 対策

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 部門間調整事項
 */
export interface ProjectCoordination {
  id: string;
  projectId: string;
  title: string;
  description: string;

  // 関係部門
  departments: string[];
  stakeholders: {
    id: string;
    name: string;
    department: string;
    role: string;  // 'lead' | 'support' | 'observer'
  }[];

  // ステータス
  status: 'pending' | 'in_discussion' | 'agreed' | 'implemented';
  priority: IssuePriority;

  // 調整内容
  topic: string;
  proposedSolution?: string;
  agreedSolution?: string;
  implementationPlan?: string;

  // 日付
  requestedDate: Date;
  discussionDate?: Date;
  agreedDate?: Date;
  implementedDate?: Date;

  // 担当
  coordinatorId: string;
  coordinatorName: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * マイルストーン
 */
export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;  // 0-100
  deliverables: string[];
  assignedTeam?: string[];
}

/**
 * チームメンバー
 */
export interface TeamMember {
  userId: string;
  name: string;
  department: string;
  role: string;  // 'leader' | 'core' | 'support' | 'advisor'
  allocation: number;  // 稼働率 % (0-100)
  expertise: string[];
  joinedDate: Date;
  contribution?: string;
}

/**
 * 施設プロジェクト
 */
export interface FacilityProject {
  id: string;
  title: string;
  description: string;
  objectives: string[];

  // 起源情報
  origin: ProjectOrigin;
  originId?: string;  // 元のアイデアボイスID、戦略イニシアチブID等
  originScore?: number;  // 元のスコア（ボトムアップの場合）

  // レベル・スコープ
  projectLevel: ProjectLevel;
  scope: 'department' | 'facility' | 'cross_facility' | 'organization';

  // ステータス
  executionStatus: ProjectExecutionStatus;
  health: ProjectHealth;
  overallProgress: number;  // 0-100

  // チーム
  projectLeader: TeamMember;
  team: TeamMember[];
  departments: string[];  // 関係部門

  // スケジュール
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  duration: string;  // '6ヶ月'等

  // マイルストーン
  milestones: ProjectMilestone[];

  // リソース
  resources: ProjectResource[];
  estimatedBudget: number;
  actualSpending: number;

  // 課題・リスク
  issues: ProjectIssue[];
  activeIssuesCount: number;
  criticalIssuesCount: number;

  // 部門間調整
  coordinations: ProjectCoordination[];
  pendingCoordinations: number;

  // KPI
  kpis: {
    name: string;
    target: string;
    current: string;
    achievement: number;  // 達成率 %
  }[];

  // 承認情報
  approvedBy?: string;
  approvedDate?: Date;
  approvalLevel: number;  // 承認者の権限レベル

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  lastReviewDate?: Date;
  nextReviewDate?: Date;

  // 成果
  outcomes?: {
    description: string;
    metrics: string[];
    impact: string;
  };

  // タグ
  tags: string[];
}

/**
 * 施設プロジェクト統計
 */
export interface FacilityProjectStats {
  // プロジェクト数
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;

  // ステータス別
  byStatus: Record<ProjectExecutionStatus, number>;

  // 起源別
  byOrigin: Record<ProjectOrigin, number>;

  // 健全性
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;

  // リソース
  totalBudget: number;
  usedBudget: number;
  budgetUtilization: number;  // %
  totalPersonnel: number;
  personnelUtilization: number;  // %

  // 課題
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
  averageResolutionTime: number;  // 日数

  // 調整
  pendingCoordinations: number;
  completedCoordinations: number;

  // 進捗
  averageProgress: number;  // %
  onScheduleCount: number;
  delayedCount: number;

  // 今月
  thisMonthCompletions: number;
  thisMonthStarts: number;

  // トレンド
  monthlyTrend: {
    month: string;
    started: number;
    completed: number;
    active: number;
  }[];
}

/**
 * プロジェクトフィルタ
 */
export interface ProjectFilter {
  status?: ProjectExecutionStatus[];
  health?: ProjectHealth[];
  origin?: ProjectOrigin[];
  department?: string[];
  projectLevel?: ProjectLevel[];
  search?: string;
}

/**
 * プロジェクトソート
 */
export type ProjectSortField =
  | 'priority'      // 優先度（健全性 + 進捗）
  | 'progress'      // 進捗率
  | 'startDate'     // 開始日
  | 'endDate'       // 終了予定日
  | 'budget'        // 予算
  | 'issuesCount';  // 課題数

export type SortOrder = 'asc' | 'desc';

/**
 * プロジェクトレビュー記録
 */
export interface ProjectReview {
  id: string;
  projectId: string;
  reviewDate: Date;
  reviewerId: string;
  reviewerName: string;
  reviewerLevel: number;

  // レビュー内容
  progressAssessment: string;
  riskAssessment: string;
  recommendations: string[];
  concerns: string[];

  // 評価
  healthRating: ProjectHealth;
  progressRating: number;  // 1-5
  teamPerformance: number;  // 1-5

  // アクション
  actionItems: {
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: 'pending' | 'completed';
  }[];

  nextReviewDate: Date;
  createdAt: Date;
}

/**
 * プロジェクトレベルからラベルを取得
 */
export const getProjectLevelLabel = (level: ProjectLevel): string => {
  const labels: Record<ProjectLevel, string> = {
    PENDING: '検討中',
    TEAM: 'チームレベル',
    DEPARTMENT: '部門レベル',
    FACILITY: '施設レベル',
    ORGANIZATION: '法人レベル',
    STRATEGIC: '戦略レベル'
  };
  return labels[level];
};

/**
 * 健全性からラベルと色を取得
 */
export const getHealthInfo = (health: ProjectHealth): { label: string; color: string; icon: string } => {
  const info: Record<ProjectHealth, { label: string; color: string; icon: string }> = {
    healthy: { label: '順調', color: 'text-emerald-400 bg-emerald-900/30', icon: '✅' },
    at_risk: { label: 'リスクあり', color: 'text-yellow-400 bg-yellow-900/30', icon: '⚠️' },
    critical: { label: '危機的', color: 'text-red-400 bg-red-900/30', icon: '🚨' }
  };
  return info[health];
};

/**
 * ステータスからラベルと色を取得
 */
export const getStatusInfo = (status: ProjectExecutionStatus): { label: string; color: string; icon: string } => {
  const info: Record<ProjectExecutionStatus, { label: string; color: string; icon: string }> = {
    planning: { label: '計画中', color: 'text-blue-400 bg-blue-900/30', icon: '📋' },
    team_forming: { label: 'チーム編成中', color: 'text-cyan-400 bg-cyan-900/30', icon: '👥' },
    in_progress: { label: '実行中', color: 'text-emerald-400 bg-emerald-900/30', icon: '⚡' },
    on_hold: { label: '一時停止', color: 'text-yellow-400 bg-yellow-900/30', icon: '⏸️' },
    completed: { label: '完了', color: 'text-purple-400 bg-purple-900/30', icon: '🎉' },
    cancelled: { label: '中止', color: 'text-gray-400 bg-gray-800/30', icon: '❌' }
  };
  return info[status];
};

/**
 * 起源タイプからラベルと色を取得
 */
export const getOriginInfo = (origin: ProjectOrigin): { label: string; color: string; icon: string } => {
  const info: Record<ProjectOrigin, { label: string; color: string; icon: string }> = {
    bottom_up: { label: 'ボトムアップ', color: 'text-teal-400 bg-teal-900/30', icon: '💡' },
    top_down: { label: 'トップダウン', color: 'text-purple-400 bg-purple-900/30', icon: '🎯' },
    committee: { label: '委員会提案', color: 'text-blue-400 bg-blue-900/30', icon: '📋' },
    management: { label: '経営層指示', color: 'text-red-400 bg-red-900/30', icon: '⚡' }
  };
  return info[origin];
};

/**
 * 課題優先度からラベルと色を取得
 */
export const getIssuePriorityInfo = (priority: IssuePriority): { label: string; color: string; icon: string } => {
  const info: Record<IssuePriority, { label: string; color: string; icon: string }> = {
    low: { label: '低', color: 'text-gray-400 bg-gray-800/30', icon: '📝' },
    medium: { label: '中', color: 'text-blue-400 bg-blue-900/30', icon: '📋' },
    high: { label: '高', color: 'text-orange-400 bg-orange-900/30', icon: '⚠️' },
    critical: { label: '緊急', color: 'text-red-400 bg-red-900/30', icon: '🚨' }
  };
  return info[priority];
};

/**
 * 予算をフォーマット
 */
export const formatBudget = (amount: number): string => {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}億円`;
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(0)}千万円`;
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}万円`;
  return `${amount.toLocaleString()}円`;
};

/**
 * 進捗率から色を取得
 */
export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'bg-emerald-500';
  if (progress >= 70) return 'bg-blue-500';
  if (progress >= 50) return 'bg-cyan-500';
  if (progress >= 30) return 'bg-yellow-500';
  return 'bg-orange-500';
};
