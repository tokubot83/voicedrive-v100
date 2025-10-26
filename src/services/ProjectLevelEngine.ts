import { prisma } from '../lib/prisma';
import { getDepartmentWithEmployeeCount, getFacilityFromDepartment } from './MedicalSystemService';

/**
 * ProjectLevelEngine
 * ProjectListPage Phase 2実装
 *
 * プロジェクトの参加者分布から自動的にプロジェクトレベルを判定する
 * - DEPARTMENT: 単一部署内
 * - FACILITY: 単一施設内の複数部署
 * - CORPORATE: 複数施設にまたがる
 * - EMERGENCY: 緊急エスカレーション済み
 */

export type ProjectLevel = 'DEPARTMENT' | 'FACILITY' | 'CORPORATE' | 'EMERGENCY';

export interface ProjectLevelResult {
  level: ProjectLevel;
  facilityId: string | null;
  facilityName: string | null;
  participantDistribution: {
    departmentCount: number;
    facilityCount: number;
    uniqueDepartments: string[];
    uniqueFacilities: string[];
  };
  calculatedAt: Date;
}

/**
 * プロジェクトのレベルを自動計算
 *
 * @param projectId - プロジェクトID
 * @returns プロジェクトレベルの計算結果
 */
export async function calculateProjectLevel(
  projectId: string
): Promise<ProjectLevelResult> {
  // プロジェクトの基本情報を取得
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      isEmergencyEscalated: true,
      proposer: {
        select: {
          department: true
        }
      }
    }
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // 緊急エスカレーション済みの場合は即座にEMERGENCYを返す
  if (project.isEmergencyEscalated) {
    return {
      level: 'EMERGENCY',
      facilityId: null,
      facilityName: null,
      participantDistribution: {
        departmentCount: 0,
        facilityCount: 0,
        uniqueDepartments: [],
        uniqueFacilities: []
      },
      calculatedAt: new Date()
    };
  }

  // プロジェクトの参加者を取得
  const participants = await prisma.projectTeamMember.findMany({
    where: {
      projectId,
      leftAt: null // 現在参加中のメンバーのみ
    },
    include: {
      user: {
        select: {
          department: true
        }
      }
    }
  });

  // 提案者の部署も含める
  const allDepartments = [
    project.proposer.department,
    ...participants.map(p => p.user.department)
  ].filter(Boolean) as string[];

  // 重複を除去
  const uniqueDepartments = [...new Set(allDepartments)];

  // 部署から施設を取得（並列処理）
  const facilityPromises = uniqueDepartments.map(dept => getFacilityFromDepartment(dept));
  const facilities = await Promise.all(facilityPromises);
  const uniqueFacilities = [...new Set(facilities.filter(Boolean))];

  // レベルを判定
  let level: ProjectLevel;
  if (uniqueFacilities.length > 1) {
    // 複数施設にまたがる = 法人レベル
    level = 'CORPORATE';
  } else if (uniqueDepartments.length > 1) {
    // 単一施設内の複数部署 = 施設レベル
    level = 'FACILITY';
  } else {
    // 単一部署内 = 部署レベル
    level = 'DEPARTMENT';
  }

  // 施設情報を取得
  let facilityId: string | null = null;
  let facilityName: string | null = null;

  if (uniqueFacilities.length === 1) {
    facilityName = uniqueFacilities[0];
    // 施設名から施設IDを推定（簡易実装）
    facilityId = getFacilityIdFromName(facilityName);
  }

  return {
    level,
    facilityId,
    facilityName,
    participantDistribution: {
      departmentCount: uniqueDepartments.length,
      facilityCount: uniqueFacilities.length,
      uniqueDepartments,
      uniqueFacilities
    },
    calculatedAt: new Date()
  };
}

/**
 * プロジェクトレベルを更新
 * DBのprojectLevelフィールドを更新する
 *
 * @param projectId - プロジェクトID
 * @returns 更新後のプロジェクトレベル結果
 */
export async function updateProjectLevel(
  projectId: string
): Promise<ProjectLevelResult> {
  const result = await calculateProjectLevel(projectId);

  // DBを更新
  await prisma.project.update({
    where: { id: projectId },
    data: {
      projectLevel: result.level,
      facilityId: result.facilityId,
      facilityName: result.facilityName
    }
  });

  return result;
}

/**
 * 複数プロジェクトのレベルを一括計算
 *
 * @param projectIds - プロジェクトIDの配列
 * @returns プロジェクトID別のレベル計算結果
 */
export async function calculateProjectLevels(
  projectIds: string[]
): Promise<Record<string, ProjectLevelResult>> {
  const results: Record<string, ProjectLevelResult> = {};

  // 並列処理で一括計算
  const promises = projectIds.map(async (projectId) => {
    try {
      const result = await calculateProjectLevel(projectId);
      results[projectId] = result;
    } catch (error) {
      console.error(`Failed to calculate level for project ${projectId}:`, error);
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * 複数プロジェクトのレベルを一括更新
 *
 * @param projectIds - プロジェクトIDの配列
 * @returns 更新されたプロジェクト数
 */
export async function updateProjectLevels(
  projectIds: string[]
): Promise<number> {
  let updatedCount = 0;

  // 並列処理で一括更新
  const promises = projectIds.map(async (projectId) => {
    try {
      await updateProjectLevel(projectId);
      updatedCount++;
    } catch (error) {
      console.error(`Failed to update level for project ${projectId}:`, error);
    }
  });

  await Promise.all(promises);

  return updatedCount;
}

/**
 * プロジェクトレベルの変更を追跡
 * project_level_historyテーブルに履歴を記録
 *
 * @param projectId - プロジェクトID
 * @returns レベル変更が発生した場合true
 */
export async function trackLevelChange(
  projectId: string
): Promise<boolean> {
  // 現在のDBのレベルを取得
  const currentProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectLevel: true }
  });

  // 新しいレベルを計算
  const newResult = await calculateProjectLevel(projectId);

  // レベルが変更されたかチェック
  const hasChanged = currentProject?.projectLevel !== newResult.level;

  if (hasChanged) {
    // レベル履歴を記録
    await prisma.projectLevelHistory.create({
      data: {
        postId: projectId, // ProjectテーブルとリレーションなのでpostIdフィールドを使用
        fromLevel: currentProject?.projectLevel || null,
        toLevel: newResult.level,
        fromScore: null, // ProjectListPageではスコアは使用しない
        toScore: 0,
        upgradedAt: new Date()
      }
    });

    // DBを更新
    await prisma.project.update({
      where: { id: projectId },
      data: {
        projectLevel: newResult.level,
        facilityId: newResult.facilityId,
        facilityName: newResult.facilityName
      }
    });
  }

  return hasChanged;
}

/**
 * プロジェクトレベル別の統計を取得
 *
 * @returns レベル別のプロジェクト数
 */
export async function getProjectLevelStats(): Promise<Record<ProjectLevel, number>> {
  const stats = await prisma.project.groupBy({
    by: ['projectLevel'],
    _count: true
  });

  const result: Record<ProjectLevel, number> = {
    DEPARTMENT: 0,
    FACILITY: 0,
    CORPORATE: 0,
    EMERGENCY: 0
  };

  stats.forEach(stat => {
    if (stat.projectLevel && stat.projectLevel in result) {
      result[stat.projectLevel as ProjectLevel] = stat._count;
    }
  });

  return result;
}

/**
 * 施設名から施設IDを取得（簡易実装）
 *
 * @param facilityName - 施設名
 * @returns 施設ID
 */
function getFacilityIdFromName(facilityName: string): string {
  const facilityMap: Record<string, string> = {
    '小原病院': 'OBARA_HOSPITAL',
    '立神リハ温泉病院': 'TATEGAMI_REHAB',
    '本部': 'HEADQUARTERS'
  };

  return facilityMap[facilityName] || facilityName.toUpperCase().replace(/\s+/g, '_');
}

/**
 * レベルの日本語表示名を取得
 *
 * @param level - プロジェクトレベル
 * @returns 日本語表示名
 */
export function getLevelLabel(level: ProjectLevel): string {
  const labels: Record<ProjectLevel, string> = {
    DEPARTMENT: '部署レベル',
    FACILITY: '施設レベル',
    CORPORATE: '法人レベル',
    EMERGENCY: '緊急対応'
  };

  return labels[level] || level;
}

/**
 * レベルのアイコンを取得
 *
 * @param level - プロジェクトレベル
 * @returns アイコン文字列
 */
export function getLevelIcon(level: ProjectLevel): string {
  const icons: Record<ProjectLevel, string> = {
    DEPARTMENT: '🏢',
    FACILITY: '🏥',
    CORPORATE: '🏛️',
    EMERGENCY: '🚨'
  };

  return icons[level] || '📋';
}

export const projectLevelEngine = {
  calculateProjectLevel,
  updateProjectLevel,
  calculateProjectLevels,
  updateProjectLevels,
  trackLevelChange,
  getProjectLevelStats,
  getLevelLabel,
  getLevelIcon
};
