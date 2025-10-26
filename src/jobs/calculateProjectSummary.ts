/**
 * ProjectSummary計算バッチジョブ
 * ProjectListPage Phase 3実装
 *
 * 定期的にすべてのプロジェクトの統計情報を再計算してキャッシュを更新する
 * - 日次実行を想定
 * - cron jobやスケジューラーから呼び出される
 */

import { projectSummaryService } from '../services/ProjectSummaryService';

/**
 * すべてのプロジェクトサマリーを再計算
 */
export async function runProjectSummaryCalculation(): Promise<void> {
  console.log('[Job] ProjectSummary calculation started');
  const startTime = Date.now();

  try {
    // すべてのアクティブプロジェクトの統計を再計算
    const result = await projectSummaryService.recalculateAllProjectSummaries(50);

    const duration = Date.now() - startTime;

    console.log('[Job] ProjectSummary calculation completed');
    console.log(`  Total projects: ${result.totalProjects}`);
    console.log(`  Success: ${result.successCount}`);
    console.log(`  Failures: ${result.failureCount}`);
    console.log(`  Total time: ${result.totalTime}ms`);
    console.log(`  Job duration: ${duration}ms`);

    // 失敗したプロジェクトをログ出力
    if (result.failureCount > 0) {
      const failures = result.results.filter(r => !r.success);
      console.error('[Job] Failed projects:');
      failures.forEach(f => {
        console.error(`  - Project ${f.projectId}: ${f.error}`);
      });
    }

    // 古いキャッシュを削除（30日以上古いもの）
    const cleanedCount = await projectSummaryService.cleanupOldSummaries();
    console.log(`[Job] Cleaned up ${cleanedCount} old summaries`);

    // キャッシュ統計を取得
    const stats = await projectSummaryService.getSummaryStats();
    console.log('[Job] Cache statistics:');
    console.log(`  Total cached: ${stats.totalCached}`);
    console.log(`  Cached last 24h: ${stats.cachedLast24h}`);
    console.log(`  Cached last 7d: ${stats.cachedLast7d}`);
    console.log(`  Oldest cache: ${stats.oldestCache?.toISOString()}`);
    console.log(`  Newest cache: ${stats.newestCache?.toISOString()}`);

  } catch (error) {
    console.error('[Job] ProjectSummary calculation failed:', error);
    throw error;
  }
}

/**
 * 特定のプロジェクトのサマリーを再計算
 *
 * @param projectIds - 計算対象のプロジェクトID配列
 */
export async function runProjectSummaryCalculationForProjects(
  projectIds: string[]
): Promise<void> {
  console.log(`[Job] ProjectSummary calculation started for ${projectIds.length} projects`);
  const startTime = Date.now();

  try {
    const results = await projectSummaryService.calculateMultipleProjectSummaries(projectIds);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const duration = Date.now() - startTime;

    console.log('[Job] ProjectSummary calculation completed');
    console.log(`  Total projects: ${projectIds.length}`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failures: ${failureCount}`);
    console.log(`  Duration: ${duration}ms`);

    // 失敗したプロジェクトをログ出力
    if (failureCount > 0) {
      const failures = results.filter(r => !r.success);
      console.error('[Job] Failed projects:');
      failures.forEach(f => {
        console.error(`  - Project ${f.projectId}: ${f.error}`);
      });
    }

  } catch (error) {
    console.error('[Job] ProjectSummary calculation failed:', error);
    throw error;
  }
}

// CLIから直接実行可能にする
if (require.main === module) {
  runProjectSummaryCalculation()
    .then(() => {
      console.log('[Job] Batch job completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Job] Batch job failed:', error);
      process.exit(1);
    });
}

export default {
  runProjectSummaryCalculation,
  runProjectSummaryCalculationForProjects
};
