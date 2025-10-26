/**
 * ProjectListService
 *
 * プロジェクト一覧取得・フィルタリングサービス
 *
 * Phase 1実装:
 * - プロジェクト一覧取得（フィルター対応）
 * - ユーザー統計取得
 * - 詳細情報取得
 */

import { prisma } from '../lib/prisma';
import {
  getUserProjectRole,
  getUserProjectRoles,
  getProjectParticipantCounts,
  type ProjectRole
} from './ProjectRoleService';
import { getFacilitiesFromDepartments } from './MedicalSystemService';
import { getMultipleProjectSummaries } from './ProjectSummaryService';

export interface ProjectListFilters {
  searchTerm?: string;
  status?: 'all' | 'active' | 'completed' | 'proposed' | 'paused';
  category?: 'all' | 'improvement' | 'community' | 'facility' | 'system';
  level?: 'all' | 'DEPARTMENT' | 'FACILITY' | 'CORPORATE' | 'EMERGENCY';
  userId?: string; // ユーザー参加プロジェクトのみ
}

export interface ProjectListItem {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string | null;
  endDate: string | null;
  participants: number;
  department: string;
  facility: string;
  category: 'improvement' | 'community' | 'facility' | 'system';
  priority: 'high' | 'medium' | 'low' | 'urgent' | null;
  myRole: ProjectRole;
  projectLevel: string | null;
  isEmergencyEscalated: boolean;
  escalatedBy: string | null;
  escalatedDate: string | null;
  approvalStatus: string;
  currentApprover: string | null;
}

export interface ProjectStats {
  active: number;
  completed: number;
  proposed: number;
  owned: number;
}

export interface ProjectWithDetails extends ProjectListItem {
  objectives: any;
  expectedOutcomes: any;
  budget: number | null;
  milestones: any | null;
  roi: number | null;
  proposer: {
    id: string;
    name: string;
    department: string | null;
    email: string;
  };
}

/**
 * プロジェクト一覧を取得（フィルター対応）
 *
 * @param filters - フィルター条件
 * @param currentUserId - 現在のユーザーID
 * @returns プロジェクト一覧
 */
export async function getProjectList(
  filters: ProjectListFilters,
  currentUserId: string
): Promise<ProjectListItem[]> {
  try {
    // 1. フィルター条件を構築
    const where: any = {
      AND: []
    };

    // 検索条件
    if (filters.searchTerm) {
      where.AND.push({
        OR: [
          { title: { contains: filters.searchTerm, mode: 'insensitive' } },
          { description: { contains: filters.searchTerm, mode: 'insensitive' } }
        ]
      });
    }

    // ステータスフィルター
    if (filters.status && filters.status !== 'all') {
      where.AND.push({ status: filters.status });
    }

    // カテゴリーフィルター
    if (filters.category && filters.category !== 'all') {
      where.AND.push({ category: filters.category });
    }

    // レベルフィルター
    if (filters.level && filters.level !== 'all') {
      where.AND.push({ projectLevel: filters.level });
    }

    // ユーザー参加プロジェクトフィルター
    if (filters.userId) {
      where.AND.push({
        OR: [
          { proposerId: filters.userId },
          {
            teamMembers: {
              some: {
                userId: filters.userId,
                leftAt: null
              }
            }
          }
        ]
      });
    }

    // ANDが空の場合は削除
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // 2. プロジェクトを取得
    const projects = await prisma.project.findMany({
      where,
      include: {
        proposer: {
          select: {
            id: true,
            name: true,
            department: true,
            email: true
          }
        }
      },
      orderBy: [
        { isEmergencyEscalated: 'desc' }, // 緊急エスカレーションを優先
        { createdAt: 'desc' }
      ]
    });

    if (projects.length === 0) {
      return [];
    }

    // 3. プロジェクトIDリストを作成
    const projectIds = projects.map(p => p.id);

    // 4. 並列で追加情報を取得
    // Phase 3: ProjectSummaryキャッシュを優先して使用（パフォーマンス最適化）
    const [roleMap, summaryMap, facilityMap] = await Promise.all([
      getUserProjectRoles(currentUserId, projectIds),
      getMultipleProjectSummaries(projectIds), // キャッシュ優先
      // 部署名から施設名を取得
      getFacilitiesFromDepartments(
        projects.map((p: any) => p.proposer.department || '未設定')
      )
    ]);

    // サマリーから参加者数を取得（フォールバック: リアルタイム計算）
    const participantCountMap: Record<string, number> = {};
    projectIds.forEach((id: string) => {
      participantCountMap[id] = summaryMap[id]?.activeParticipants || 1;
    });

    // 5. データを統合
    const projectList: ProjectListItem[] = projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status as any,
      progress: project.progressRate,
      startDate: project.startedAt?.toISOString() || null,
      endDate: project.completedAt?.toISOString() || null,
      participants: participantCountMap[project.id] || 1,
      department: project.proposer.department || '未設定',
      facility: facilityMap[project.proposer.department || '未設定'] || project.facilityName || '未設定',
      category: project.category as any,
      priority: project.priority as any,
      myRole: roleMap[project.id] || 'viewer',
      projectLevel: project.projectLevel,
      isEmergencyEscalated: project.isEmergencyEscalated,
      escalatedBy: project.escalatedBy,
      escalatedDate: project.escalatedDate?.toISOString() || null,
      approvalStatus: project.approvalStatus,
      currentApprover: project.currentApprover
    }));

    return projectList;
  } catch (error) {
    console.error('[ProjectListService] Error getting project list:', error);
    return [];
  }
}

/**
 * ユーザーのプロジェクト統計を取得
 *
 * @param currentUserId - 現在のユーザーID
 * @returns プロジェクト統計
 */
export async function getProjectStats(
  currentUserId: string
): Promise<ProjectStats> {
  try {
    // 並列でカウント
    const [active, completed, proposed, owned] = await Promise.all([
      // 参加中のプロジェクト数
      prisma.project.count({
        where: {
          status: 'active',
          OR: [
            { proposerId: currentUserId },
            {
              teamMembers: {
                some: {
                  userId: currentUserId,
                  leftAt: null
                }
              }
            }
          ]
        }
      }),
      // 完了済みプロジェクト数
      prisma.project.count({
        where: { status: 'completed' }
      }),
      // 提案中プロジェクト数
      prisma.project.count({
        where: { status: 'proposed' }
      }),
      // オーナープロジェクト数
      prisma.project.count({
        where: { proposerId: currentUserId }
      })
    ]);

    return {
      active,
      completed,
      proposed,
      owned
    };
  } catch (error) {
    console.error('[ProjectListService] Error getting project stats:', error);
    return {
      active: 0,
      completed: 0,
      proposed: 0,
      owned: 0
    };
  }
}

/**
 * プロジェクト詳細を取得
 *
 * @param projectId - プロジェクトID
 * @param currentUserId - 現在のユーザーID
 * @returns プロジェクト詳細
 */
export async function getProjectWithDetails(
  projectId: string,
  currentUserId: string
): Promise<ProjectWithDetails | null> {
  try {
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

    if (!project) {
      return null;
    }

    // 役割と参加者数を取得
    const [myRole, participants, facility] = await Promise.all([
      getUserProjectRole(currentUserId, projectId),
      getProjectParticipantCounts([projectId]),
      getFacilitiesFromDepartments([project.proposer.department || '未設定'])
    ]);

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status as any,
      progress: project.progressRate,
      startDate: project.startedAt?.toISOString() || null,
      endDate: project.completedAt?.toISOString() || null,
      participants: participants[projectId] || 1,
      department: project.proposer.department || '未設定',
      facility: facility[project.proposer.department || '未設定'] || project.facilityName || '未設定',
      category: project.category as any,
      priority: project.priority as any,
      myRole,
      projectLevel: project.projectLevel,
      isEmergencyEscalated: project.isEmergencyEscalated,
      escalatedBy: project.escalatedBy,
      escalatedDate: project.escalatedDate?.toISOString() || null,
      approvalStatus: project.approvalStatus,
      currentApprover: project.currentApprover,
      objectives: project.objectives,
      expectedOutcomes: project.expectedOutcomes,
      budget: project.budget,
      milestones: project.milestones,
      roi: project.roi,
      proposer: project.proposer
    };
  } catch (error) {
    console.error('[ProjectListService] Error getting project details:', error);
    return null;
  }
}

/**
 * プロジェクトを検索（簡易版）
 *
 * @param searchTerm - 検索キーワード
 * @param limit - 最大件数（デフォルト: 10）
 * @returns プロジェクト配列
 */
export async function searchProjects(
  searchTerm: string,
  limit: number = 10
): Promise<Array<{ id: string; title: string; description: string }>> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return projects;
  } catch (error) {
    console.error('[ProjectListService] Error searching projects:', error);
    return [];
  }
}
