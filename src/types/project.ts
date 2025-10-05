/**
 * プロジェクト化モード専用型定義
 * 予算管理機能を撤廃し、プロジェクト規模の概念を導入
 */

import { ProjectLevel } from './visibility';

/**
 * プロジェクト規模（予算の代わり）
 */
export type ProjectScale = 'small' | 'medium' | 'large' | 'strategic';

/**
 * プロジェクト実施範囲
 */
export type FacilityScope = 'single' | 'cross_facility' | 'corporate';

/**
 * プロジェクト規模情報
 */
export interface ProjectScaleInfo {
  scale: ProjectScale;
  teamSize: number;
  estimatedDuration: string; // 「3ヶ月」「6ヶ月」等
  facilityScope: FacilityScope;
  description?: string;
}

/**
 * プロジェクトチーム情報
 */
export interface ProjectTeam {
  teamLeader: {
    id: string;
    name: string;
    department: string;
    permissionLevel: number;
  };
  members: Array<{
    id: string;
    name: string;
    department: string;
    role: string; // 「技術担当」「調整担当」等
    permissionLevel: number;
  }>;
  advisors?: Array<{
    id: string;
    name: string;
    department: string;
  }>;
}

/**
 * プロジェクト承認状態
 */
export type ProjectApprovalStatus =
  | 'pending'       // 承認待ち
  | 'approved'      // 承認済み（チーム編成へ）
  | 'team_forming'  // チーム編成中
  | 'in_progress'   // 実行中
  | 'on_hold'       // 保留
  | 'rejected'      // 却下
  | 'completed';    // 完了

/**
 * プロジェクト承認履歴
 */
export interface ProjectApprovalHistory {
  approver: {
    id: string;
    name: string;
    permissionLevel: number;
  };
  status: ProjectApprovalStatus;
  timestamp: Date;
  comment?: string;
  reason?: string; // 保留・却下の理由
}

/**
 * プロジェクト情報（拡張版）
 */
export interface EnhancedProjectInfo {
  projectId: string;
  title: string;
  description: string;
  projectLevel: ProjectLevel;
  currentScore: number;

  // プロジェクト規模（予算の代わり）
  scaleInfo: ProjectScaleInfo;

  // チーム情報
  team?: ProjectTeam;

  // 承認フロー
  approvalStatus: ProjectApprovalStatus;
  approvalHistory: ProjectApprovalHistory[];

  // スケジュール
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;

  // 進捗
  milestones: ProjectMilestone[];
  overallProgress: number; // 0-100

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * マイルストーン
 */
export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number; // 0-100
  assignedTo?: string[];
}

/**
 * プロジェクト規模の判定ヘルパー
 */
export const getProjectScale = (
  projectLevel: ProjectLevel,
  teamSize: number
): ProjectScale => {
  if (projectLevel === 'ORGANIZATION' || projectLevel === 'STRATEGIC') {
    return 'strategic';
  }
  if (projectLevel === 'FACILITY') {
    return 'large';
  }
  if (projectLevel === 'DEPARTMENT') {
    return teamSize > 10 ? 'large' : 'medium';
  }
  return teamSize > 5 ? 'medium' : 'small';
};

/**
 * プロジェクト規模の説明を取得
 */
export const getProjectScaleDescription = (scale: ProjectScale): string => {
  const descriptions = {
    small: '小規模プロジェクト（チーム内で完結）',
    medium: '中規模プロジェクト（部署レベル）',
    large: '大規模プロジェクト（施設横断）',
    strategic: '戦略プロジェクト（法人全体）'
  };
  return descriptions[scale];
};

/**
 * 実施範囲の説明を取得
 */
export const getFacilityScopeDescription = (scope: FacilityScope): string => {
  const descriptions = {
    single: '単一施設内',
    cross_facility: '施設横断',
    corporate: '法人全体'
  };
  return descriptions[scope];
};
