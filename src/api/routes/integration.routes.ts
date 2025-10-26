/**
 * Phase 2: 医療システム連携監視APIルート
 *
 * VoiceDrive側のWebhook受信統計とデータ同期状態を提供
 */

import { Router, Request, Response } from 'express';
import { MonitoringService } from '../../services/MonitoringService';

const router = Router();

/**
 * GET /api/integration/metrics
 *
 * 医療システム連携の監視メトリクスを取得
 *
 * レスポンス例:
 * {
 *   webhook: {
 *     received24h: 150,
 *     byEventType: { ... },
 *     signatureFailures: 2,
 *     processingErrors: 1,
 *     duplicateEvents: 0,
 *     lastReceived: "2025-10-26T12:34:56Z",
 *     avgProcessingTime: 45.2
 *   },
 *   dataSync: { ... },
 *   connectivity: { ... }
 * }
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await MonitoringService.getIntegrationMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Integration API] メトリクス取得エラー:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '連携監視データの取得に失敗しました'
    });
  }
});

/**
 * GET /api/integration/health
 *
 * 連携健全性の簡易チェック（軽量版）
 *
 * レスポンス例:
 * {
 *   status: "healthy" | "warning" | "critical",
 *   message: "...",
 *   details: { ... }
 * }
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const metrics = await MonitoringService.getIntegrationMetrics();

    const { connectivity, webhook } = metrics;

    // 健全性判定
    let status: 'healthy' | 'warning' | 'critical' = connectivity.webhookEndpointStatus;
    let message = '';

    if (status === 'healthy') {
      message = '医療システム連携は正常に動作しています';
    } else if (status === 'warning') {
      if (connectivity.timeSinceLastWebhook !== null && connectivity.timeSinceLastWebhook > 15) {
        message = `Webhook受信が ${Math.floor(connectivity.timeSinceLastWebhook)} 分間ありません`;
      } else {
        message = 'Webhookデータがありません（初期状態または未連携）';
      }
    } else if (status === 'critical') {
      message = `Webhook受信が ${Math.floor(connectivity.timeSinceLastWebhook!)} 分間ありません（重大）`;
    }

    res.status(200).json({
      success: true,
      status,
      message,
      details: {
        lastWebhookReceived: connectivity.lastWebhookReceived,
        timeSinceLastWebhook: connectivity.timeSinceLastWebhook,
        webhookReceived24h: webhook.received24h,
        processingErrors: webhook.processingErrors,
        errorRateTrend: connectivity.errorRateTrend
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Integration API] ヘルスチェックエラー:', error);

    res.status(500).json({
      success: false,
      status: 'critical',
      message: 'ヘルスチェックの実行に失敗しました',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
