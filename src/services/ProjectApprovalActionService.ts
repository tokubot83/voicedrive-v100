/**
 * ProjectApprovalActionService
 * プロジェクト承認アクション処理サービス
 */

import prisma from '../lib/prisma';
import NotificationService from './NotificationService';

export class ProjectApprovalActionService {
  /**
   * プロジェクトを承認
   */
  static async approveProject(
    projectId: string,
    approverId: string,
    comments?: string
  ): Promise<void> {
    // 1. 現在の承認ステップを取得
    const currentApproval = await prisma.projectApproval.findFirst({
      where: {
        projectId,
        approverId,
        status: 'pending',
      },
    });

    if (!currentApproval) {
      throw new Error('承認待ちのステップが見つかりません');
    }

    // 2. 承認ステップを更新
    await prisma.projectApproval.update({
      where: { id: currentApproval.id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        comments: comments || null,
        actionTaken: 'approved',
      },
    });

    // 3. 次の承認ステップがあるか確認
    const nextApproval = await prisma.projectApproval.findFirst({
      where: {
        projectId,
        status: 'pending',
        approvalLevel: {
          gt: currentApproval.approvalLevel,
        },
      },
      orderBy: {
        approvalLevel: 'asc',
      },
    });

    // 4. プロジェクトステータスを更新
    if (!nextApproval) {
      // 全承認完了
      await prisma.project.update({
        where: { id: projectId },
        data: {
          approvalStatus: 'approved',
          status: 'approved',
          currentApprover: null,
        },
      });
    } else {
      // 次の承認者を設定
      await prisma.project.update({
        where: { id: projectId },
        data: {
          currentApprover: nextApproval.approverId,
        },
      });
    }

    // 5. 提案者に通知
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        proposer: { select: { id: true, name: true } },
      },
    });

    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: { name: true },
    });

    if (project && approver) {
      await NotificationService.sendNotification({
        type: 'approval_update',
        recipientId: project.proposer.id,
        message: `${approver.name}があなたのプロジェクト「${project.title}」を承認しました`,
        projectId: project.id,
      });
    }
  }

  /**
   * プロジェクトを却下
   */
  static async rejectProject(
    projectId: string,
    approverId: string,
    reason: string
  ): Promise<void> {
    // 1. 現在の承認ステップを取得
    const currentApproval = await prisma.projectApproval.findFirst({
      where: {
        projectId,
        approverId,
        status: 'pending',
      },
    });

    if (!currentApproval) {
      throw new Error('承認待ちのステップが見つかりません');
    }

    // 2. 承認ステップを更新
    await prisma.projectApproval.update({
      where: { id: currentApproval.id },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        comments: reason,
        actionTaken: 'rejected',
      },
    });

    // 3. プロジェクトステータスを更新
    await prisma.project.update({
      where: { id: projectId },
      data: {
        approvalStatus: 'rejected',
        status: 'rejected',
        rejectionReason: reason,
        currentApprover: null,
      },
    });

    // 4. 提案者に通知
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        proposer: { select: { id: true, name: true } },
      },
    });

    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: { name: true },
    });

    if (project && approver) {
      await NotificationService.sendNotification({
        type: 'approval_update',
        recipientId: project.proposer.id,
        message: `${approver.name}があなたのプロジェクト「${project.title}」を却下しました\n理由: ${reason}`,
        projectId: project.id,
      });
    }
  }

  /**
   * ユーザーが承認可能なプロジェクトか確認
   */
  static async canUserApprove(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    const approval = await prisma.projectApproval.findFirst({
      where: {
        projectId,
        approverId: userId,
        status: 'pending',
      },
    });

    return approval !== null;
  }
}
