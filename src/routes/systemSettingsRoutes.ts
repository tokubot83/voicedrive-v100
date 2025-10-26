// システム設定API ルート定義
import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';
import * as systemSettingsController from '../controllers/systemSettingsController';

const router = Router();

// ====================
// システム設定管理API（Phase 1）
// ====================

/**
 * GET /api/system/settings
 * システム設定を取得
 *
 * クエリパラメータ:
 * - category?: string - 特定カテゴリのみ取得
 *
 * レスポンス:
 * {
 *   success: boolean,
 *   data: {
 *     general: Record<string, SystemSetting>,
 *     security: Record<string, SystemSetting>,
 *     notification: Record<string, SystemSetting>,
 *     database: Record<string, SystemSetting>,
 *     api: Record<string, SystemSetting>,
 *     advanced: Record<string, SystemSetting>
 *   },
 *   metadata: {
 *     lastUpdated: string,
 *     updatedBy: string,
 *     version: number
 *   }
 * }
 */
router.get('/settings',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.getSettings
);

/**
 * POST /api/system/settings
 * システム設定を更新
 *
 * リクエストボディ:
 * {
 *   settings: {
 *     [category: string]: {
 *       [key: string]: string | number | boolean
 *     }
 *   },
 *   userId: string
 * }
 *
 * レスポンス:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     updatedCount: number,
 *     updatedSettings: string[],
 *     timestamp: string
 *   },
 *   errors?: Array<{key: string, error: string}>
 * }
 */
router.post('/settings',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.updateSettings
);

// ====================
// データベース操作API（Phase 2）
// ====================

/**
 * POST /api/system/database/backup
 * データベースバックアップを実行
 */
router.post('/database/backup',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.createBackup
);

/**
 * POST /api/system/database/restore
 * データベースを復元
 */
router.post('/database/restore',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.restoreBackup
);

/**
 * POST /api/system/database/optimize
 * データベースを最適化
 */
router.post('/database/optimize',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.optimizeDatabase
);

// ====================
// その他システム操作API（Phase 3）
// ====================

/**
 * POST /api/system/api/regenerate-key
 * APIキーを再生成
 */
router.post('/api/regenerate-key',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.regenerateApiKey
);

/**
 * POST /api/system/cache/clear
 * システムキャッシュをクリア
 */
router.post('/cache/clear',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.clearCache
);

/**
 * POST /api/system/logs/export
 * システムログをエクスポート
 */
router.post('/logs/export',
  authenticateToken,
  standardRateLimit,
  systemSettingsController.exportLogs
);

export default router;
