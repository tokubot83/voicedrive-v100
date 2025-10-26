import { prisma } from '../lib/prisma';
import { getProjectParticipantCount } from './ProjectRoleService';

/**
 * ProjectSummaryService
 * ProjectListPage Phase 3実装
 *
 * プロジェクトの統計情報を事前計算してキャッシュする
 * - 参加者数の集計
 * - アクティブ参加者数の集計
 * - オーナー数・メンバー数の集計
 * - パフォーマンス最適化のための事前計算
 */

export interface ProjectSummaryData {
  projectId: string;
  totalParticipants: number;
  activeParticipants: number;
  ownerCount: number;
  memberCount: number;
  lastCalculatedAt: Date;
}

export interface CalculationResult {
  projectId: string;
  success: boolean;
  previousSummary: ProjectSummaryData | null;
  newSummary: ProjectSummaryData | null;
  calculationTime: number;
  error?: string;
}

/**
 * プロジェクトの統計情報を計算
 *
 * @param projectId - プロジェクトID
 * @returns 統計データ
 */
export async function calculateProjectSummary(
  projectId: string
): Promise<ProjectSummaryData> {
  // プロジェクトが存在するか確認
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, proposerId: true }
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // チームメンバーを取得
  const teamMembers = await prisma.projectTeamMember.findMany({
    where: { projectId },
    select: {
      userId: true,
      role: true,
      leftAt: true,
      joinedAt: true
    }
  });

  // 統計を計算
  const totalParticipants = teamMembers.length + 1; // チームメンバー + 提案者
  const activeParticipants = teamMembers.filter(m => m.leftAt === null).length + 1;
  const ownerCount = teamMembers.filter(m => m.role === 'owner' && m.leftAt === null).length + 1;
  const memberCount = teamMembers.filter(m => m.role === 'member' && m.leftAt === null).length;

  return {
    projectId,
    totalParticipants,
    activeParticipants,
    ownerCount,
    memberCount,
    lastCalculatedAt: new Date()
  };
}

/**
 * プロジェクトの統計情報を計算してDBに保存
 *
 * @param projectId - プロジェクトID
 * @returns 計算結果
 */
export async function calculateAndSaveProjectSummary(
  projectId: string
): Promise<CalculationResult> {
  const startTime = Date.now();

  try {
    // 既存のサマリーを取得
    const previousSummary = await prisma.projectSummary.findUnique({
      where: { projectId }
    });

    // 新しいサマリーを計算
    const summaryData = await calculateProjectSummary(projectId);

    // DBに保存（upsert）
    const newSummary = await prisma.projectSummary.upsert({
      where: { projectId },
      create: {
        projectId: summaryData.projectId,
        totalParticipants: summaryData.totalParticipants,
        activeParticipants: summaryData.activeParticipants,
        ownerCount: summaryData.ownerCount,
        memberCount: summaryData.memberCount,
        lastCalculatedAt: summaryData.lastCalculatedAt
      },
      update: {
        totalParticipants: summaryData.totalParticipants,
        activeParticipants: summaryData.activeParticipants,
        ownerCount: summaryData.ownerCount,
        memberCount: summaryData.memberCount,
        lastCalculatedAt: summaryData.lastCalculatedAt
      }
    });

    const calculationTime = Date.now() - startTime;

    return {
      projectId,
      success: true,
      previousSummary: previousSummary ? {
        projectId: previousSummary.projectId,
        totalParticipants: previousSummary.totalParticipants,
        activeParticipants: previousSummary.activeParticipants,
        ownerCount: previousSummary.ownerCount,
        memberCount: previousSummary.memberCount,
        lastCalculatedAt: previousSummary.lastCalculatedAt
      } : null,
      newSummary: {
        projectId: newSummary.projectId,
        totalParticipants: newSummary.totalParticipants,
        activeParticipants: newSummary.activeParticipants,
        ownerCount: newSummary.ownerCount,
        memberCount: newSummary.memberCount,
        lastCalculatedAt: newSummary.lastCalculatedAt
      },
      calculationTime
    };
  } catch (error) {
    const calculationTime = Date.now() - startTime;

    return {
      projectId,
      success: false,
      previousSummary: null,
      newSummary: null,
      calculationTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 複数プロジェクトの統計情報を一括計算
 *
 * @param projectIds - プロジェクトIDの配列
 * @returns 計算結果の配列
 */
export async function calculateMultipleProjectSummaries(
  projectIds: string[]
): Promise<CalculationResult[]> {
  const results: CalculationResult[] = [];

  // 並列処理で計算
  const promises = projectIds.map(async (projectId) => {
    const result = await calculateAndSaveProjectSummary(projectId);
    results.push(result);
  });

  await Promise.all(promises);

  return results;
}

/**
 * すべてのアクティブプロジェクトの統計情報を再計算
 *
 * @param batchSize - バッチサイズ（デフォルト: 50）
 * @returns 計算結果のサマリー
 */
export async function recalculateAllProjectSummaries(
  batchSize: number = 50
): Promise<{
  totalProjects: number;
  successCount: number;
  failureCount: number;
  totalTime: number;
  results: CalculationResult[];
}> {
  const startTime = Date.now();

  // アクティブなプロジェクトを取得
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { status: 'active' },
        { status: 'proposed' }
      ]
    },
    select: { id: true }
  });

  const projectIds = projects.map(p => p.id);
  const totalProjects = projectIds.length;

  console.log(`[ProjectSummary] Starting recalculation for ${totalProjects} projects`);

  // バッチ処理
  const allResults: CalculationResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < projectIds.length; i += batchSize) {
    const batch = projectIds.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(projectIds.length / batchSize);

    console.log(`[ProjectSummary] Processing batch ${batchNumber}/${totalBatches} (${batch.length} projects)`);

    const batchResults = await calculateMultipleProjectSummaries(batch);
    allResults.push(...batchResults);

    successCount += batchResults.filter(r => r.success).length;
    failureCount += batchResults.filter(r => !r.success).length;
  }

  const totalTime = Date.now() - startTime;

  console.log(`[ProjectSummary] Recalculation complete: ${successCount} success, ${failureCount} failures, ${totalTime}ms`);

  return {
    totalProjects,
    successCount,
    failureCount,
    totalTime,
    results: allResults
  };
}

/**
 * プロジェクトの統計情報を取得（キャッシュ優先）
 *
 * @param projectId - プロジェクトID
 * @param maxAge - キャッシュの最大有効期限（ミリ秒、デフォルト: 24時間）
 * @returns 統計データ
 */
export async function getProjectSummary(
  projectId: string,
  maxAge: number = 24 * 60 * 60 * 1000 // 24時間
): Promise<ProjectSummaryData> {
  // キャッシュを確認
  const cachedSummary = await prisma.projectSummary.findUnique({
    where: { projectId }
  });

  if (cachedSummary) {
    const age = Date.now() - cachedSummary.lastCalculatedAt.getTime();

    // キャッシュが有効期限内の場合は返す
    if (age < maxAge) {
      return {
        projectId: cachedSummary.projectId,
        totalParticipants: cachedSummary.totalParticipants,
        activeParticipants: cachedSummary.activeParticipants,
        ownerCount: cachedSummary.ownerCount,
        memberCount: cachedSummary.memberCount,
        lastCalculatedAt: cachedSummary.lastCalculatedAt
      };
    }
  }

  // キャッシュがないか古い場合はリアルタイム計算
  const summary = await calculateProjectSummary(projectId);

  // 非同期でキャッシュを更新（結果を待たない）
  calculateAndSaveProjectSummary(projectId).catch(error => {
    console.error(`Failed to update cache for project ${projectId}:`, error);
  });

  return summary;
}

/**
 * 複数プロジェクトの統計情報を一括取得（キャッシュ優先）
 *
 * @param projectIds - プロジェクトIDの配列
 * @param maxAge - キャッシュの最大有効期限（ミリ秒）
 * @returns プロジェクトID別の統計データ
 */
export async function getMultipleProjectSummaries(
  projectIds: string[],
  maxAge: number = 24 * 60 * 60 * 1000
): Promise<Record<string, ProjectSummaryData>> {
  const summaries: Record<string, ProjectSummaryData> = {};

  // キャッシュを一括取得
  const cachedSummaries = await prisma.projectSummary.findMany({
    where: {
      projectId: { in: projectIds }
    }
  });

  const cachedMap = new Map(cachedSummaries.map(s => [s.projectId, s]));
  const now = Date.now();

  // キャッシュがあるものとないものを分類
  const cachedProjectIds: string[] = [];
  const uncachedProjectIds: string[] = [];

  projectIds.forEach(projectId => {
    const cached = cachedMap.get(projectId);
    if (cached && (now - cached.lastCalculatedAt.getTime() < maxAge)) {
      cachedProjectIds.push(projectId);
      summaries[projectId] = {
        projectId: cached.projectId,
        totalParticipants: cached.totalParticipants,
        activeParticipants: cached.activeParticipants,
        ownerCount: cached.ownerCount,
        memberCount: cached.memberCount,
        lastCalculatedAt: cached.lastCalculatedAt
      };
    } else {
      uncachedProjectIds.push(projectId);
    }
  });

  // キャッシュがないプロジェクトはリアルタイム計算
  if (uncachedProjectIds.length > 0) {
    const calculatePromises = uncachedProjectIds.map(async (projectId) => {
      try {
        const summary = await calculateProjectSummary(projectId);
        summaries[projectId] = summary;

        // 非同期でキャッシュを更新
        calculateAndSaveProjectSummary(projectId).catch(error => {
          console.error(`Failed to update cache for project ${projectId}:`, error);
        });
      } catch (error) {
        console.error(`Failed to calculate summary for project ${projectId}:`, error);
      }
    });

    await Promise.all(calculatePromises);
  }

  return summaries;
}

/**
 * 古いキャッシュを削除
 *
 * @param maxAge - 削除する古さの閾値（ミリ秒、デフォルト: 30日）
 * @returns 削除されたレコード数
 */
export async function cleanupOldSummaries(
  maxAge: number = 30 * 24 * 60 * 60 * 1000 // 30日
): Promise<number> {
  const threshold = new Date(Date.now() - maxAge);

  const result = await prisma.projectSummary.deleteMany({
    where: {
      lastCalculatedAt: {
        lt: threshold
      }
    }
  });

  console.log(`[ProjectSummary] Cleaned up ${result.count} old summaries`);

  return result.count;
}

/**
 * ProjectSummaryの統計を取得
 *
 * @returns キャッシュ統計
 */
export async function getSummaryStats(): Promise<{
  totalCached: number;
  cachedLast24h: number;
  cachedLast7d: number;
  oldestCache: Date | null;
  newestCache: Date | null;
}> {
  const summaries = await prisma.projectSummary.findMany({
    select: { lastCalculatedAt: true }
  });

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const cachedLast24h = summaries.filter(s => s.lastCalculatedAt.getTime() >= oneDayAgo).length;
  const cachedLast7d = summaries.filter(s => s.lastCalculatedAt.getTime() >= sevenDaysAgo).length;

  const dates = summaries.map(s => s.lastCalculatedAt);
  const oldestCache = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const newestCache = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  return {
    totalCached: summaries.length,
    cachedLast24h,
    cachedLast7d,
    oldestCache,
    newestCache
  };
}

export const projectSummaryService = {
  calculateProjectSummary,
  calculateAndSaveProjectSummary,
  calculateMultipleProjectSummaries,
  recalculateAllProjectSummaries,
  getProjectSummary,
  getMultipleProjectSummaries,
  cleanupOldSummaries,
  getSummaryStats
};
