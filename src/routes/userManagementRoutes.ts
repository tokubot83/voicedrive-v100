/**
 * UserManagementRoutes
 * Level 99管理者専用：ユーザー同期API
 *
 * Phase 2.6: UserManagementPage統合
 * 最終更新: 2025-10-26
 */

import { Router, Request, Response } from 'express';
import { UserSyncService } from '../services/UserSyncService';

const router = Router();

/**
 * GET /api/users/sync/:id
 * 単一ユーザーを医療システムから同期
 *
 * @param id - VoiceDrive内部のユーザーID
 * @returns 同期後のユーザー情報
 */
router.get('/sync/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`[UserManagementRoutes] GET /api/users/sync/${id} - 開始`);

    // TODO: Level 99権限チェック
    // if (req.user?.permissionLevel !== 99) {
    //   return res.status(403).json({ error: 'Forbidden: Level 99 required' });
    // }

    const updatedUser = await UserSyncService.syncSingleUser(id);

    console.log(`[UserManagementRoutes] GET /api/users/sync/${id} - 成功`);

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        employeeId: updatedUser.employeeId,
        name: updatedUser.name,
        email: updatedUser.email,
        department: updatedUser.department,
        syncStatus: updatedUser.syncStatus,
        lastSyncedAt: updatedUser.lastSyncedAt,
        syncErrorMessage: updatedUser.syncErrorMessage
      }
    });
  } catch (error) {
    console.error('[UserManagementRoutes] GET /api/users/sync/:id - エラー:', error);

    const errorMessage = error instanceof Error ? error.message : '不明なエラー';

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * POST /api/users/sync/all
 * 全ユーザーを医療システムから一括同期
 *
 * @returns 同期結果の統計情報
 */
router.post('/sync/all', async (req: Request, res: Response) => {
  try {
    console.log('[UserManagementRoutes] POST /api/users/sync/all - 開始');

    // TODO: Level 99権限チェック
    // if (req.user?.permissionLevel !== 99) {
    //   return res.status(403).json({ error: 'Forbidden: Level 99 required' });
    // }

    const result = await UserSyncService.syncAllUsers();

    console.log('[UserManagementRoutes] POST /api/users/sync/all - 成功:', result);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[UserManagementRoutes] POST /api/users/sync/all - エラー:', error);

    const errorMessage = error instanceof Error ? error.message : '不明なエラー';

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * GET /api/users/sync/status
 * 全体の同期ステータスを取得
 *
 * @returns 同期ステータス統計
 */
router.get('/sync/status', async (req: Request, res: Response) => {
  try {
    console.log('[UserManagementRoutes] GET /api/users/sync/status - 開始');

    // TODO: Level 99権限チェック
    // if (req.user?.permissionLevel !== 99) {
    //   return res.status(403).json({ error: 'Forbidden: Level 99 required' });
    // }

    const status = await UserSyncService.getSyncStatus();

    console.log('[UserManagementRoutes] GET /api/users/sync/status - 成功:', status);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('[UserManagementRoutes] GET /api/users/sync/status - エラー:', error);

    const errorMessage = error instanceof Error ? error.message : '不明なエラー';

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

export default router;
