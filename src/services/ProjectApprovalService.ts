import { prisma } from '../lib/prisma';
import { ProjectLevel } from './ProjectLevelEngine';

/**
 * ProjectApprovalService
 * ProjectListPage Phase 2実装
 *
 * プロジェクトの承認フローを管理
 * - 承認状態の取得・更新
 * - 承認者の自動割り当て
 * - 承認履歴の管理
 */

export type ApprovalStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'on_hold';

export interface ProjectApprovalInfo {
  projectId: string;
  approvalStatus: ApprovalStatus;
  currentApprover: string | null;
  currentApproverName: string | null;
  approvalHistory: ApprovalHistoryEntry[];
  requiredApprovers: ApproverInfo[];
  canUserApprove: boolean;
}

export interface ApprovalHistoryEntry {
  id: string;
  approverId: string;
  approverName: string;
  action: 'approved' | 'rejected' | 'requested_changes';
  comment: string | null;
  approvedAt: Date;
}

export interface ApproverInfo {
  userId: string;
  userName: string;
  role: string;
  level: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
}

/**
 * プロジェクトの承認情報を取得
 *
 * @param projectId - プロジェクトID
 * @param currentUserId - 現在のユーザーID
 * @returns 承認情報
 */
export async function getProjectApprovalInfo(
  projectId: string,
  currentUserId: string
): Promise<ProjectApprovalInfo> {
  // プロジェクトの基本情報を取得
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      approvalStatus: true,
      currentApprover: true,
      projectLevel: true,
      approver: {
        select: {
          id: true,
          name: true,
          department: true,
          role: true
        }
      }
    }
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // 承認履歴を取得
  const approvalHistory = await prisma.projectApproval.findMany({
    where: { projectId },
    include: {
      approver: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { approvedAt: 'asc' }
  });

  // 承認履歴を整形
  const history: ApprovalHistoryEntry[] = approvalHistory.map(approval => ({
    id: approval.id,
    approverId: approval.approverId,
    approverName: approval.approver.name,
    action: approval.action as 'approved' | 'rejected' | 'requested_changes',
    comment: approval.comment,
    approvedAt: approval.approvedAt
  }));

  // 必要な承認者リストを取得（プロジェクトレベルに基づく）
  const requiredApprovers = await getRequiredApprovers(
    project.projectLevel as ProjectLevel
  );

  // ユーザーが承認可能かチェック
  const canUserApprove = project.currentApprover === currentUserId;

  return {
    projectId: project.id,
    approvalStatus: project.approvalStatus as ApprovalStatus,
    currentApprover: project.currentApprover,
    currentApproverName: project.approver?.name || null,
    approvalHistory: history,
    requiredApprovers,
    canUserApprove
  };
}

/**
 * プロジェクトレベルに基づいて必要な承認者を取得
 *
 * @param level - プロジェクトレベル
 * @returns 必要な承認者リスト
 */
async function getRequiredApprovers(level: ProjectLevel): Promise<ApproverInfo[]> {
  // プロジェクトレベルに応じた承認者の役割を定義
  const approverRoles: Record<ProjectLevel, string[]> = {
    DEPARTMENT: ['DEPARTMENT_HEAD'],
    FACILITY: ['DEPARTMENT_HEAD', 'FACILITY_HEAD'],
    CORPORATE: ['FACILITY_HEAD', 'HR_DEPARTMENT_HEAD', 'EXECUTIVE'],
    EMERGENCY: ['EXECUTIVE', 'CHAIRMAN']
  };

  const roles = approverRoles[level] || [];

  // 各役割に対応するユーザーを取得
  const approvers: ApproverInfo[] = [];

  for (const role of roles) {
    const users = await prisma.user.findMany({
      where: { accountType: role },
      select: {
        id: true,
        name: true,
        role: true,
        department: true
      },
      take: 1 // 各役割の代表者1名のみ取得
    });

    if (users.length > 0) {
      approvers.push({
        userId: users[0].id,
        userName: users[0].name,
        role: users[0].role || role,
        level: role,
        status: 'pending'
      });
    }
  }

  return approvers;
}

/**
 * 承認リクエストを作成
 *
 * @param projectId - プロジェクトID
 * @param requesterId - リクエスト者ID
 * @returns 作成された承認リクエスト
 */
export async function createApprovalRequest(
  projectId: string,
  requesterId: string
): Promise<ProjectApprovalInfo> {
  // プロジェクトレベルを取得
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectLevel: true }
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // 必要な承認者を取得
  const requiredApprovers = await getRequiredApprovers(
    project.projectLevel as ProjectLevel
  );

  if (requiredApprovers.length === 0) {
    throw new Error('No approvers found for this project level');
  }

  // 最初の承認者を設定
  const firstApprover = requiredApprovers[0];

  // プロジェクトの承認状態を更新
  await prisma.project.update({
    where: { id: projectId },
    data: {
      approvalStatus: 'in_review',
      currentApprover: firstApprover.userId
    }
  });

  // 承認情報を返す
  return getProjectApprovalInfo(projectId, requesterId);
}

/**
 * 承認を処理
 *
 * @param projectId - プロジェクトID
 * @param approverId - 承認者ID
 * @param action - 承認アクション
 * @param comment - コメント
 * @returns 更新された承認情報
 */
export async function processApproval(
  projectId: string,
  approverId: string,
  action: 'approved' | 'rejected' | 'requested_changes',
  comment?: string
): Promise<ProjectApprovalInfo> {
  // プロジェクトの現在の承認者をチェック
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      currentApprover: true,
      projectLevel: true
    }
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  if (project.currentApprover !== approverId) {
    throw new Error('You are not the current approver for this project');
  }

  // 承認履歴を記録
  await prisma.projectApproval.create({
    data: {
      projectId,
      approverId,
      action,
      comment: comment || null,
      approvedAt: new Date()
    }
  });

  // アクションに応じて次の承認者を決定
  let newStatus: ApprovalStatus;
  let nextApproverId: string | null = null;

  if (action === 'rejected') {
    // 却下された場合
    newStatus = 'rejected';
  } else if (action === 'requested_changes') {
    // 変更要求の場合
    newStatus = 'on_hold';
  } else {
    // 承認された場合、次の承認者を確認
    const requiredApprovers = await getRequiredApprovers(
      project.projectLevel as ProjectLevel
    );

    // 既に承認した人を取得
    const approvedUsers = await prisma.projectApproval.findMany({
      where: {
        projectId,
        action: 'approved'
      },
      select: { approverId: true }
    });

    const approvedUserIds = new Set(approvedUsers.map(a => a.approverId));
    approvedUserIds.add(approverId); // 現在の承認も追加

    // 次の未承認者を探す
    const nextApprover = requiredApprovers.find(
      approver => !approvedUserIds.has(approver.userId)
    );

    if (nextApprover) {
      // まだ承認が必要
      newStatus = 'in_review';
      nextApproverId = nextApprover.userId;
    } else {
      // すべての承認が完了
      newStatus = 'approved';
    }
  }

  // プロジェクトの承認状態を更新
  await prisma.project.update({
    where: { id: projectId },
    data: {
      approvalStatus: newStatus,
      currentApprover: nextApproverId
    }
  });

  // 更新された承認情報を返す
  return getProjectApprovalInfo(projectId, approverId);
}

/**
 * ユーザーの承認待ちプロジェクト数を取得
 *
 * @param userId - ユーザーID
 * @returns 承認待ちプロジェクト数
 */
export async function getPendingApprovalsCount(userId: string): Promise<number> {
  return await prisma.project.count({
    where: {
      currentApprover: userId,
      approvalStatus: 'in_review'
    }
  });
}

/**
 * ユーザーの承認待ちプロジェクト一覧を取得
 *
 * @param userId - ユーザーID
 * @returns 承認待ちプロジェクト一覧
 */
export async function getPendingApprovals(userId: string) {
  return await prisma.project.findMany({
    where: {
      currentApprover: userId,
      approvalStatus: 'in_review'
    },
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          department: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * プロジェクトの承認状態統計を取得
 *
 * @returns 承認状態別のプロジェクト数
 */
export async function getApprovalStats(): Promise<Record<ApprovalStatus, number>> {
  const stats = await prisma.project.groupBy({
    by: ['approvalStatus'],
    _count: true
  });

  const result: Record<ApprovalStatus, number> = {
    pending: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    on_hold: 0
  };

  stats.forEach(stat => {
    if (stat.approvalStatus && stat.approvalStatus in result) {
      result[stat.approvalStatus as ApprovalStatus] = stat._count;
    }
  });

  return result;
}

/**
 * 承認状態の日本語表示名を取得
 *
 * @param status - 承認状態
 * @returns 日本語表示名
 */
export function getApprovalStatusLabel(status: ApprovalStatus): string {
  const labels: Record<ApprovalStatus, string> = {
    pending: '承認待ち',
    in_review: '承認中',
    approved: '承認済み',
    rejected: '却下',
    on_hold: '保留中'
  };

  return labels[status] || status;
}

/**
 * 承認状態のアイコンを取得
 *
 * @param status - 承認状態
 * @returns アイコン文字列
 */
export function getApprovalStatusIcon(status: ApprovalStatus): string {
  const icons: Record<ApprovalStatus, string> = {
    pending: '⏳',
    in_review: '🔍',
    approved: '✅',
    rejected: '❌',
    on_hold: '⏸️'
  };

  return icons[status] || '📋';
}

export const projectApprovalService = {
  getProjectApprovalInfo,
  createApprovalRequest,
  processApproval,
  getPendingApprovalsCount,
  getPendingApprovals,
  getApprovalStats,
  getApprovalStatusLabel,
  getApprovalStatusIcon
};
