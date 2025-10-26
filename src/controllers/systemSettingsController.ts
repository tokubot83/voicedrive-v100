// システム設定コントローラー
import { Request, Response } from 'express';
import { SystemSettingsService } from '../services/SystemSettingsService';
import { AuditService } from '../services/AuditService';

/**
 * GET /api/system/settings
 * システム設定を取得
 */
export async function getSettings(req: Request, res: Response) {
  try {
    const { category } = req.query;

    const result = await SystemSettingsService.getSettings(category as string | undefined);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('[SystemSettings] 設定取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'システム設定の取得に失敗しました'
    });
  }
}

/**
 * POST /api/system/settings
 * システム設定を更新
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    const { settings } = req.body;
    // @ts-ignore - req.userはミドルウェアで追加
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
    }

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: '設定データが不正です'
      });
    }

    const result = await SystemSettingsService.updateSettings(settings, userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        errors: result.errors
      });
    }

    // 監査ログ記録
    await AuditService.log({
      userId,
      action: 'SYSTEM_SETTINGS_UPDATED',
      details: {
        updatedCount: result.data.updatedCount,
        updatedSettings: result.data.updatedSettings,
        categories: Object.keys(settings)
      },
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'システム設定を更新しました',
      data: result.data
    });
  } catch (error) {
    console.error('[SystemSettings] 設定更新エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'システム設定の更新に失敗しました'
    });
  }
}

/**
 * POST /api/system/database/backup
 * データベースバックアップを実行
 */
export async function createBackup(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
    }

    const result = await SystemSettingsService.createDatabaseBackup(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // 監査ログ記録
    await AuditService.log({
      userId,
      action: 'DATABASE_BACKUP_CREATED',
      details: {
        backupId: result.data.backupId,
        fileName: result.data.fileName,
        size: result.data.size
      },
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'データベースバックアップを作成しました',
      data: result.data
    });
  } catch (error) {
    console.error('[SystemSettings] バックアップ作成エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'バックアップの作成に失敗しました'
    });
  }
}

/**
 * POST /api/system/database/restore
 * データベースを復元
 */
export async function restoreBackup(req: Request, res: Response) {
  try {
    const { backupId, confirmationToken } = req.body;
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
    }

    if (!backupId || !confirmationToken) {
      return res.status(400).json({
        success: false,
        error: 'バックアップIDと確認トークンが必要です'
      });
    }

    const result = await SystemSettingsService.restoreDatabaseBackup(backupId, userId, confirmationToken);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // 監査ログ記録
    await AuditService.log({
      userId,
      action: 'DATABASE_RESTORED',
      details: {
        restoreId: result.data.restoreId,
        backupId,
        recordsRestored: result.data.recordsRestored
      },
      severity: 'critical'
    });

    res.json({
      success: true,
      message: 'データベースを復元しました',
      data: result.data
    });
  } catch (error) {
    console.error('[SystemSettings] データベース復元エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'データベースの復元に失敗しました'
    });
  }
}

/**
 * POST /api/system/database/optimize
 * データベースを最適化
 */
export async function optimizeDatabase(req: Request, res: Response) {
  try {
    const { operations } = req.body;
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
    }

    const result = await SystemSettingsService.optimizeDatabase(operations || ['reindex', 'vacuum', 'analyze'], userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // 監査ログ記録
    await AuditService.log({
      userId,
      action: 'DATABASE_OPTIMIZED',
      details: {
        optimizationId: result.data.optimizationId,
        operations: result.data.operations
      },
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'データベースを最適化しました',
      data: result.data
    });
  } catch (error) {
    console.error('[SystemSettings] データベース最適化エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'データベースの最適化に失敗しました'
    });
  }
}

/**
 * POST /api/system/api/regenerate-key
 * APIキーを再生成
 */
export async function regenerateApiKey(req: Request, res: Response) {
  try {
    const { reason } = req.body;
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
    }

    const result = await SystemSettingsService.regenerateApiKey(userId, reason);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // 監査ログ記録
    await AuditService.log({
      userId,
      action: 'API_KEY_REGENERATED',
      details: {
        reason,
        expiresAt: result.data.expiresAt
      },
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'APIキーを再生成しました',
      data: result.data
    });
  } catch (error) {
    console.error('[SystemSettings] APIキー再生成エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'APIキーの再生成に失敗しました'
    });
  }
}

/**
 * POST /api/system/cache/clear
 * システムキャッシュをクリア
 */
export async function clearCache(req: Request, res: Response) {
  try {
    const { cacheTypes } = req.body;
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
    }

    const result = await SystemSettingsService.clearCache(cacheTypes || ['memory'], userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // 監査ログ記録
    await AuditService.log({
      userId,
      action: 'CACHE_CLEARED',
      details: {
        clearedCaches: result.data.clearedCaches
      },
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'キャッシュをクリアしました',
      data: result.data
    });
  } catch (error) {
    console.error('[SystemSettings] キャッシュクリアエラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'キャッシュのクリアに失敗しました'
    });
  }
}

/**
 * POST /api/system/logs/export
 * システムログをエクスポート
 */
export async function exportLogs(req: Request, res: Response) {
  try {
    const { logTypes, startDate, endDate, format } = req.body;
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証情報が不正です'
      });
    }

    if (!logTypes || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'ログタイプ、開始日、終了日が必要です'
      });
    }

    const result = await SystemSettingsService.exportLogs({
      logTypes,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      format: format || 'json',
      userId
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // 監査ログ記録
    await AuditService.log({
      userId,
      action: 'LOGS_EXPORTED',
      details: {
        exportId: result.data.exportId,
        logTypes,
        recordCount: result.data.recordCount
      },
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'ログをエクスポートしました',
      data: result.data
    });
  } catch (error) {
    console.error('[SystemSettings] ログエクスポートエラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'ログのエクスポートに失敗しました'
    });
  }
}
