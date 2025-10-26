import { prisma } from '../lib/prisma';
import { ProjectLevel } from './ProjectLevelEngine';

/**
 * ProjectEscalationService
 * ProjectListPage Phase 2実装
 *
 * プロジェクトの緊急エスカレーション処理を管理
 * - エスカレーション実行
 * - エスカレーション解除
 * - エスカレーション履歴管理
 */

export interface EscalationInfo {
  projectId: string;
  isEmergencyEscalated: boolean;
  escalatedBy: string | null;
  escalatedByName: string | null;
  escalatedDate: Date | null;
  escalationReason: string | null;
  canUserEscalate: boolean;
  canUserDeescalate: boolean;
}

export interface EscalationRequest {
  projectId: string;
  escalatedBy: string;
  reason: string;
}

export interface DeescalationRequest {
  projectId: string;
  deescalatedBy: string;
  reason: string;
}

/**
 * プロジェクトのエスカレーション情報を取得
 *
 * @param projectId - プロジェクトID
 * @param currentUserId - 現在のユーザーID
 * @returns エスカレーション情報
 */
export async function getEscalationInfo(
  projectId: string,
  currentUserId: string
): Promise<EscalationInfo> {
  // プロジェクト情報を取得
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      isEmergencyEscalated: true,
      escalatedBy: true,
      escalatedDate: true,
      escalationReason: true,
      escalator: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // ユーザーの権限を確認
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      accountType: true,
      role: true
    }
  });

  // エスカレーション可能な役割: 施設長以上
  const canEscalateRoles = [
    'FACILITY_HEAD',
    'HR_DEPARTMENT_HEAD',
    'HR_DIRECTOR',
    'EXECUTIVE_SECRETARY',
    'CHAIRMAN',
    'EXECUTIVE'
  ];

  const canUserEscalate = currentUser
    ? canEscalateRoles.includes(currentUser.accountType || '')
    : false;

  // エスカレーション解除可能な役割: 役員以上
  const canDeescalateRoles = ['CHAIRMAN', 'EXECUTIVE'];
  const canUserDeescalate = currentUser
    ? canDeescalateRoles.includes(currentUser.accountType || '')
    : false;

  return {
    projectId: project.id,
    isEmergencyEscalated: project.isEmergencyEscalated,
    escalatedBy: project.escalatedBy,
    escalatedByName: project.escalator?.name || null,
    escalatedDate: project.escalatedDate,
    escalationReason: project.escalationReason,
    canUserEscalate,
    canUserDeescalate
  };
}

/**
 * プロジェクトを緊急エスカレーション
 *
 * @param request - エスカレーションリクエスト
 * @returns 更新されたエスカレーション情報
 */
export async function escalateProject(
  request: EscalationRequest
): Promise<EscalationInfo> {
  const { projectId, escalatedBy, reason } = request;

  // ユーザーの権限を確認
  const user = await prisma.user.findUnique({
    where: { id: escalatedBy },
    select: { accountType: true }
  });

  if (!user) {
    throw new Error(`User not found: ${escalatedBy}`);
  }

  const canEscalateRoles = [
    'FACILITY_HEAD',
    'HR_DEPARTMENT_HEAD',
    'HR_DIRECTOR',
    'EXECUTIVE_SECRETARY',
    'CHAIRMAN',
    'EXECUTIVE'
  ];

  if (!canEscalateRoles.includes(user.accountType || '')) {
    throw new Error('Insufficient permissions to escalate project');
  }

  // プロジェクトが既にエスカレーション済みかチェック
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { isEmergencyEscalated: true }
  });

  if (project?.isEmergencyEscalated) {
    throw new Error('Project is already escalated');
  }

  // エスカレーション実行
  await prisma.project.update({
    where: { id: projectId },
    data: {
      isEmergencyEscalated: true,
      escalatedBy,
      escalatedDate: new Date(),
      escalationReason: reason,
      projectLevel: 'EMERGENCY', // レベルをEMERGENCYに強制変更
      approvalStatus: 'in_review' // 承認状態をレビュー中に変更
    }
  });

  // 通知を作成（提案者とチームメンバーに通知）
  await createEscalationNotifications(projectId, escalatedBy, reason);

  // 更新されたエスカレーション情報を返す
  return getEscalationInfo(projectId, escalatedBy);
}

/**
 * プロジェクトの緊急エスカレーションを解除
 *
 * @param request - エスカレーション解除リクエスト
 * @returns 更新されたエスカレーション情報
 */
export async function deescalateProject(
  request: DeescalationRequest
): Promise<EscalationInfo> {
  const { projectId, deescalatedBy, reason } = request;

  // ユーザーの権限を確認
  const user = await prisma.user.findUnique({
    where: { id: deescalatedBy },
    select: { accountType: true }
  });

  if (!user) {
    throw new Error(`User not found: ${deescalatedBy}`);
  }

  const canDeescalateRoles = ['CHAIRMAN', 'EXECUTIVE'];

  if (!canDeescalateRoles.includes(user.accountType || '')) {
    throw new Error('Insufficient permissions to deescalate project');
  }

  // プロジェクトがエスカレーション済みかチェック
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      isEmergencyEscalated: true,
      escalatedBy: true,
      escalatedDate: true
    }
  });

  if (!project?.isEmergencyEscalated) {
    throw new Error('Project is not escalated');
  }

  // エスカレーション解除履歴を記録
  await prisma.emergencyDeactivation.create({
    data: {
      projectId,
      deactivatedBy: deescalatedBy,
      deactivatedAt: new Date(),
      deactivationReason: reason,
      previousEscalatedBy: project.escalatedBy || '',
      previousEscalatedAt: project.escalatedDate || new Date()
    }
  });

  // エスカレーション解除
  await prisma.project.update({
    where: { id: projectId },
    data: {
      isEmergencyEscalated: false,
      escalatedBy: null,
      escalatedDate: null,
      escalationReason: null
      // projectLevelは再計算が必要なのでここでは変更しない
    }
  });

  // 通知を作成
  await createDeescalationNotifications(projectId, deescalatedBy, reason);

  // 更新されたエスカレーション情報を返す
  return getEscalationInfo(projectId, deescalatedBy);
}

/**
 * エスカレーション通知を作成
 *
 * @param projectId - プロジェクトID
 * @param escalatedBy - エスカレーション実施者ID
 * @param reason - エスカレーション理由
 */
async function createEscalationNotifications(
  projectId: string,
  escalatedBy: string,
  reason: string
): Promise<void> {
  // プロジェクト情報を取得
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      title: true,
      proposerId: true
    }
  });

  if (!project) return;

  // エスカレーション実施者の情報を取得
  const escalator = await prisma.user.findUnique({
    where: { id: escalatedBy },
    select: { name: true, role: true }
  });

  const escalatorName = escalator?.name || '管理者';

  // 提案者に通知
  await prisma.notification.create({
    data: {
      userId: project.proposerId,
      type: 'project_escalated',
      title: '🚨 プロジェクトが緊急エスカレーションされました',
      message: `プロジェクト「${project.title}」が${escalatorName}により緊急エスカレーションされました。\n理由: ${reason}`,
      relatedId: projectId,
      relatedType: 'project',
      isRead: false
    }
  });

  // チームメンバーに通知
  const teamMembers = await prisma.projectTeamMember.findMany({
    where: {
      projectId,
      leftAt: null
    },
    select: { userId: true }
  });

  const notificationPromises = teamMembers.map(member =>
    prisma.notification.create({
      data: {
        userId: member.userId,
        type: 'project_escalated',
        title: '🚨 プロジェクトが緊急エスカレーションされました',
        message: `プロジェクト「${project.title}」が${escalatorName}により緊急エスカレーションされました。\n理由: ${reason}`,
        relatedId: projectId,
        relatedType: 'project',
        isRead: false
      }
    })
  );

  await Promise.all(notificationPromises);
}

/**
 * エスカレーション解除通知を作成
 *
 * @param projectId - プロジェクトID
 * @param deescalatedBy - エスカレーション解除実施者ID
 * @param reason - 解除理由
 */
async function createDeescalationNotifications(
  projectId: string,
  deescalatedBy: string,
  reason: string
): Promise<void> {
  // プロジェクト情報を取得
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      title: true,
      proposerId: true
    }
  });

  if (!project) return;

  // エスカレーション解除実施者の情報を取得
  const deescalator = await prisma.user.findUnique({
    where: { id: deescalatedBy },
    select: { name: true }
  });

  const deescalatorName = deescalator?.name || '管理者';

  // 提案者に通知
  await prisma.notification.create({
    data: {
      userId: project.proposerId,
      type: 'project_deescalated',
      title: '✅ プロジェクトの緊急エスカレーションが解除されました',
      message: `プロジェクト「${project.title}」の緊急エスカレーションが${deescalatorName}により解除されました。\n理由: ${reason}`,
      relatedId: projectId,
      relatedType: 'project',
      isRead: false
    }
  });
}

/**
 * エスカレーション済みプロジェクト一覧を取得
 *
 * @returns エスカレーション済みプロジェクト
 */
export async function getEscalatedProjects() {
  return await prisma.project.findMany({
    where: {
      isEmergencyEscalated: true
    },
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          department: true
        }
      },
      escalator: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: { escalatedDate: 'desc' }
  });
}

/**
 * エスカレーション統計を取得
 *
 * @returns エスカレーション統計
 */
export async function getEscalationStats(): Promise<{
  totalEscalated: number;
  escalatedLast30Days: number;
  escalatedByUser: Record<string, number>;
  averageEscalationDuration: number;
}> {
  const escalatedProjects = await prisma.project.findMany({
    where: {
      isEmergencyEscalated: true
    },
    select: {
      escalatedBy: true,
      escalatedDate: true
    }
  });

  const totalEscalated = escalatedProjects.length;

  // 過去30日間のエスカレーション数
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const escalatedLast30Days = escalatedProjects.filter(
    p => p.escalatedDate && p.escalatedDate >= thirtyDaysAgo
  ).length;

  // ユーザー別エスカレーション数
  const escalatedByUser: Record<string, number> = {};
  escalatedProjects.forEach(p => {
    if (p.escalatedBy) {
      escalatedByUser[p.escalatedBy] = (escalatedByUser[p.escalatedBy] || 0) + 1;
    }
  });

  // 平均エスカレーション期間を計算
  const deescalations = await prisma.emergencyDeactivation.findMany({
    select: {
      previousEscalatedAt: true,
      deactivatedAt: true
    }
  });

  let totalDuration = 0;
  deescalations.forEach(d => {
    const duration = d.deactivatedAt.getTime() - d.previousEscalatedAt.getTime();
    totalDuration += duration;
  });

  const averageEscalationDuration = deescalations.length > 0
    ? totalDuration / deescalations.length / (1000 * 60 * 60 * 24) // 日数に変換
    : 0;

  return {
    totalEscalated,
    escalatedLast30Days,
    escalatedByUser,
    averageEscalationDuration: Math.round(averageEscalationDuration)
  };
}

export const projectEscalationService = {
  getEscalationInfo,
  escalateProject,
  deescalateProject,
  getEscalatedProjects,
  getEscalationStats
};
