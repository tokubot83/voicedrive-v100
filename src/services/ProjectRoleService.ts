/**
 * ProjectRoleService
 *
 * プロジェクトにおけるユーザーの役割を判定するサービス
 *
 * Phase 1実装:
 * - ユーザーのプロジェクト内役割判定（owner/participant/viewer）
 * - プロジェクト参加者一覧取得
 * - ユーザーのプロジェクト一覧取得（役割別）
 */

import { prisma } from '../lib/prisma';

export type ProjectRole = 'owner' | 'participant' | 'viewer';

export interface ProjectParticipants {
  owners: Array<{
    id: string;
    name: string;
    department: string;
    email: string;
  }>;
  members: Array<{
    id: string;
    name: string;
    department: string;
    email: string;
  }>;
}

export interface UserProjectsList {
  owned: Array<{ id: string; title: string; status: string }>;
  participated: Array<{ id: string; title: string; status: string }>;
  viewed: Array<{ id: string; title: string; status: string }>;
}

/**
 * ユーザーのプロジェクト内役割を判定
 *
 * @param userId - ユーザーID
 * @param projectId - プロジェクトID
 * @returns 'owner' | 'participant' | 'viewer'
 */
export async function getUserProjectRole(
  userId: string,
  projectId: string
): Promise<ProjectRole> {
  try {
    // 1. プロジェクト提案者かチェック
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { proposerId: true }
    });

    if (!project) {
      // プロジェクトが存在しない場合はviewer
      return 'viewer';
    }

    if (project.proposerId === userId) {
      return 'owner';
    }

    // 2. チームメンバーかチェック
    const membership = await prisma.projectTeamMember.findFirst({
      where: {
        projectId,
        userId,
        leftAt: null // 退出していないメンバーのみ
      }
    });

    if (membership) {
      // ProjectTeamMemberのroleが'owner'の場合もowner扱い
      return membership.role === 'owner' ? 'owner' : 'participant';
    }

    // 3. どちらでもない場合はviewer
    return 'viewer';
  } catch (error) {
    console.error('Error in getUserProjectRole:', error);
    // エラー時はviewerとして扱う
    return 'viewer';
  }
}

/**
 * 複数プロジェクトに対するユーザーの役割を一括判定
 *
 * @param userId - ユーザーID
 * @param projectIds - プロジェクトIDの配列
 * @returns プロジェクトIDをキーとした役割マップ
 */
export async function getUserProjectRoles(
  userId: string,
  projectIds: string[]
): Promise<Record<string, ProjectRole>> {
  try {
    // 1. 全プロジェクトを取得
    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds }
      },
      select: {
        id: true,
        proposerId: true
      }
    });

    // 2. ユーザーのチームメンバーシップを取得
    const memberships = await prisma.projectTeamMember.findMany({
      where: {
        userId,
        projectId: { in: projectIds },
        leftAt: null
      },
      select: {
        projectId: true,
        role: true
      }
    });

    // 3. メンバーシップマップを作成
    const membershipMap = new Map(
      memberships.map(m => [m.projectId, m.role])
    );

    // 4. 各プロジェクトの役割を判定
    const roleMap: Record<string, ProjectRole> = {};

    for (const project of projects) {
      // 提案者かチェック
      if (project.proposerId === userId) {
        roleMap[project.id] = 'owner';
        continue;
      }

      // メンバーかチェック
      const memberRole = membershipMap.get(project.id);
      if (memberRole) {
        roleMap[project.id] = memberRole === 'owner' ? 'owner' : 'participant';
        continue;
      }

      // どちらでもない
      roleMap[project.id] = 'viewer';
    }

    return roleMap;
  } catch (error) {
    console.error('Error in getUserProjectRoles:', error);
    // エラー時は全てviewerとして扱う
    return Object.fromEntries(projectIds.map(id => [id, 'viewer' as ProjectRole]));
  }
}

/**
 * プロジェクトの参加者一覧を取得
 *
 * @param projectId - プロジェクトID
 * @returns 参加者一覧（owners, members）
 */
export async function getProjectParticipants(
  projectId: string
): Promise<ProjectParticipants> {
  try {
    // 1. プロジェクト提案者を取得
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        proposer: {
          select: {
            id: true,
            name: true,
            department: true,
            email: true
          }
        }
      }
    });

    const owners = project?.proposer ? [project.proposer] : [];

    // 2. チームメンバーを取得
    const teamMembers = await prisma.projectTeamMember.findMany({
      where: {
        projectId,
        leftAt: null // 退出していないメンバーのみ
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            email: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    // 3. ownersとmembersに分類
    const additionalOwners: typeof owners = [];
    const members: typeof owners = [];

    for (const teamMember of teamMembers) {
      // 提案者と重複する場合はスキップ
      if (teamMember.userId === project?.proposerId) {
        continue;
      }

      if (teamMember.role === 'owner') {
        additionalOwners.push(teamMember.user);
      } else {
        members.push(teamMember.user);
      }
    }

    return {
      owners: [...owners, ...additionalOwners],
      members
    };
  } catch (error) {
    console.error('Error in getProjectParticipants:', error);
    return { owners: [], members: [] };
  }
}

/**
 * ユーザーのプロジェクト一覧を役割別に取得
 *
 * @param userId - ユーザーID
 * @returns 役割別プロジェクト一覧
 */
export async function getUserProjects(
  userId: string
): Promise<UserProjectsList> {
  try {
    // 1. 提案したプロジェクト（owned）
    const ownedProjects = await prisma.project.findMany({
      where: {
        proposerId: userId
      },
      select: {
        id: true,
        title: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 2. 参加しているプロジェクト（participated）
    const participatedMemberships = await prisma.projectTeamMember.findMany({
      where: {
        userId,
        leftAt: null
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            proposerId: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // 提案者と重複するものを除外
    const participatedProjects = participatedMemberships
      .filter(m => m.project.proposerId !== userId)
      .map(m => ({
        id: m.project.id,
        title: m.project.title,
        status: m.project.status
      }));

    return {
      owned: ownedProjects,
      participated: participatedProjects,
      viewed: [] // viewedは実装しない（全プロジェクトが対象になるため）
    };
  } catch (error) {
    console.error('Error in getUserProjects:', error);
    return {
      owned: [],
      participated: [],
      viewed: []
    };
  }
}

/**
 * プロジェクトの参加者数を取得
 *
 * @param projectId - プロジェクトID
 * @returns 参加者数（提案者 + チームメンバー）
 */
export async function getProjectParticipantCount(
  projectId: string
): Promise<number> {
  try {
    const count = await prisma.projectTeamMember.count({
      where: {
        projectId,
        leftAt: null
      }
    });

    // 提案者も含めるため +1
    return count + 1;
  } catch (error) {
    console.error('Error in getProjectParticipantCount:', error);
    return 0;
  }
}

/**
 * 複数プロジェクトの参加者数を一括取得
 *
 * @param projectIds - プロジェクトIDの配列
 * @returns プロジェクトIDをキーとした参加者数マップ
 */
export async function getProjectParticipantCounts(
  projectIds: string[]
): Promise<Record<string, number>> {
  try {
    const memberships = await prisma.projectTeamMember.groupBy({
      by: ['projectId'],
      where: {
        projectId: { in: projectIds },
        leftAt: null
      },
      _count: {
        id: true
      }
    });

    const countMap: Record<string, number> = {};

    for (const membership of memberships) {
      // 提案者も含めるため +1
      countMap[membership.projectId] = membership._count.id + 1;
    }

    // 0件のプロジェクトは提案者のみなので1
    for (const projectId of projectIds) {
      if (!countMap[projectId]) {
        countMap[projectId] = 1;
      }
    }

    return countMap;
  } catch (error) {
    console.error('Error in getProjectParticipantCounts:', error);
    return Object.fromEntries(projectIds.map(id => [id, 0]));
  }
}
