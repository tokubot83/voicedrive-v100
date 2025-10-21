import { Router, Request, Response } from 'express';
import { systemOperationsService } from '../services/SystemOperationsService';
import { systemHealthService } from '../services/SystemHealthService';

const router = Router();

/**
 * GET /api/system/overview
 * システム概要を取得（Level 99のみ）
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // Level 99権限チェック
    const user = (req as any).user;
    if (!user || user.permissionLevel !== 99) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Level 99 permission required',
      });
    }

    const overview = await systemOperationsService.getSystemOverview();
    res.json(overview);
  } catch (error) {
    console.error('[GET /api/system/overview] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch system overview',
    });
  }
});

/**
 * GET /api/system/operations-stats
 * 管理機能統計を取得（Level 99のみ）
 */
router.get('/operations-stats', async (req: Request, res: Response) => {
  try {
    // Level 99権限チェック
    const user = (req as any).user;
    if (!user || user.permissionLevel !== 99) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Level 99 permission required',
      });
    }

    const stats = await systemOperationsService.getOperationsStats();
    res.json(stats);
  } catch (error) {
    console.error('[GET /api/system/operations-stats] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch operations statistics',
    });
  }
});

/**
 * POST /api/system/health
 * システムヘルスを記録（内部サービス用）
 */
router.post('/health', async (req: Request, res: Response) => {
  try {
    // TODO: APIキー認証の実装
    const health = await systemHealthService.recordHealth();
    res.json({
      id: health.id,
      status: health.status,
      recordedAt: health.lastHealthCheck,
    });
  } catch (error) {
    console.error('[POST /api/system/health] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to record health',
    });
  }
});

export default router;
