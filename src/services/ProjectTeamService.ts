/**
 * ProjectTeamService
 * プロジェクトチームメンバー管理サービス
 */

import prisma from '../lib/prisma';

export interface TeamMember {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'invited' | 'accepted' | 'declined';
  joinedAt?: Date;
}

export class ProjectTeamService {
  /**
   * プロジェクトのチームメンバー一覧を取得
   */
  static async getProjectTeamMembers(projectId: string): Promise<TeamMember[]> {
    const members = await prisma.projectTeamMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      department: m.user.department || '未設定',
      role: m.role,
      status: m.status as 'invited' | 'accepted' | 'declined',
      joinedAt: m.joinedAt || undefined,
    }));
  }

  /**
   * プロジェクトに参加
   */
  static async joinProject(
    projectId: string,
    userId: string,
    role: string = 'member'
  ): Promise<void> {
    const existing = await prisma.projectTeamMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (existing) {
      // 既に招待済みの場合は承諾
      if (existing.status === 'invited') {
        await prisma.projectTeamMember.update({
          where: { id: existing.id },
          data: {
            status: 'accepted',
            joinedAt: new Date(),
          },
        });
      }
    } else {
      // 新規参加
      await prisma.projectTeamMember.create({
        data: {
          projectId,
          userId,
          role,
          status: 'accepted',
          joinedAt: new Date(),
        },
      });
    }

    // ProjectSummaryを更新
    await this.updateProjectSummary(projectId);
  }

  /**
   * プロジェクトから退出
   */
  static async leaveProject(projectId: string, userId: string): Promise<void> {
    await prisma.projectTeamMember.update({
      where: {
        projectId_userId: { projectId, userId },
      },
      data: {
        status: 'declined',
        leftAt: new Date(),
      },
    });

    await this.updateProjectSummary(projectId);
  }

  /**
   * メンバーを招待
   */
  static async inviteMember(
    projectId: string,
    userId: string,
    role: string = 'member'
  ): Promise<void> {
    await prisma.projectTeamMember.create({
      data: {
        projectId,
        userId,
        role,
        status: 'invited',
      },
    });

    await this.updateProjectSummary(projectId);
  }

  /**
   * メンバーの役割を更新
   */
  static async updateMemberRole(
    memberId: string,
    newRole: string
  ): Promise<void> {
    await prisma.projectTeamMember.update({
      where: { id: memberId },
      data: { role: newRole },
    });
  }

  /**
   * ProjectSummaryを更新
   */
  private static async updateProjectSummary(projectId: string): Promise<void> {
    const members = await prisma.projectTeamMember.findMany({
      where: { projectId },
    });

    const totalParticipants = members.length;
    const activeParticipants = members.filter(
      (m) => m.status === 'accepted'
    ).length;
    const ownerCount = members.filter(
      (m) => m.role === 'owner' && m.status === 'accepted'
    ).length;
    const memberCount = members.filter(
      (m) => m.role === 'member' && m.status === 'accepted'
    ).length;

    await prisma.projectSummary.upsert({
      where: { projectId },
      create: {
        projectId,
        totalParticipants,
        activeParticipants,
        ownerCount,
        memberCount,
        lastCalculatedAt: new Date(),
      },
      update: {
        totalParticipants,
        activeParticipants,
        ownerCount,
        memberCount,
        lastCalculatedAt: new Date(),
      },
    });
  }
}
