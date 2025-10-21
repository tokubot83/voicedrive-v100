import cron from 'node-cron';
import { systemHealthService } from '../services/SystemHealthService';

/**
 * システムヘルスチェックジョブ
 * 1分毎にシステムの稼働状態を記録
 */
export function startHealthCheckJob() {
  // 1分毎にヘルスチェック実行
  cron.schedule('* * * * *', async () => {
    try {
      const health = await systemHealthService.recordHealth();
      console.log(
        `✅ [HealthCheck] Recorded at ${health.lastHealthCheck.toISOString()} - Status: ${health.status}`
      );
    } catch (error) {
      console.error('❌ [HealthCheck] Error:', error);
    }
  });

  console.log('⏰ Health check job started (runs every 1 minute)');
}

/**
 * 古いヘルスデータのクリーンアップジョブ
 * 日次（深夜2時）で30日以前のデータを削除
 */
export function startHealthCleanupJob() {
  // 日次（深夜2時）で古いヘルスデータを削除
  cron.schedule('0 2 * * *', async () => {
    try {
      const deletedCount = await systemHealthService.cleanupOldData(30);
      console.log(`🧹 [HealthCleanup] Deleted ${deletedCount} old health records`);
    } catch (error) {
      console.error('❌ [HealthCleanup] Error:', error);
    }
  });

  console.log('⏰ Health cleanup job started (runs daily at 2:00 AM)');
}
