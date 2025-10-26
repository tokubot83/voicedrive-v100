/**
 * 通知設定API Routes
 * Phase 2: DB保存実装（2025-10-26）
 *
 * エンドポイント:
 * - GET    /api/users/:userId/notification-settings        通知設定取得
 * - PUT    /api/users/:userId/notification-settings        通知設定更新
 * - POST   /api/users/:userId/notification-settings/reset  通知設定リセット
 * - POST   /api/users/:userId/notification-settings/devices デバイストークン登録
 * - DELETE /api/users/:userId/notification-settings/devices/:token デバイストークン削除
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { NOTIFICATION_PRESETS } from '../types/notification';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/users/:userId/notification-settings
 * 通知設定取得
 */
router.get('/users/:userId/notification-settings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: 認証チェック（req.user.id === userId or permissionLevel >= 99）

    const settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      // デフォルト設定を返す
      return res.json({
        userId,
        globalEnabled: true,
        quickSetting: 'important',
        categories: NOTIFICATION_PRESETS.recommended.categories,
        deviceTokens: [],
        enableEmailNotifications: true,
        enablePushNotifications: true,
        enableSmsNotifications: false,
        reminderDaysBefore: 3,
        enableDeadlineReminder: true,
        autoMarkAsRead: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        enableQuietHours: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('通知設定取得エラー:', error);
    res.status(500).json({ error: '通知設定の取得に失敗しました' });
  }
});

/**
 * PUT /api/users/:userId/notification-settings
 * 通知設定更新
 */
router.put('/users/:userId/notification-settings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // TODO: 認証チェック（req.user.id === userId or permissionLevel >= 99）

    // バリデーション
    if (updates.quickSetting && !['all', 'important', 'none'].includes(updates.quickSetting)) {
      return res.status(400).json({ error: 'quickSettingの値が不正です' });
    }

    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        ...updates,
        updatedAt: new Date()
      },
      create: {
        userId,
        globalEnabled: updates.globalEnabled ?? true,
        quickSetting: updates.quickSetting ?? 'important',
        categories: updates.categories ?? NOTIFICATION_PRESETS.recommended.categories,
        deviceTokens: updates.deviceTokens ?? null,
        enableEmailNotifications: updates.enableEmailNotifications ?? true,
        enablePushNotifications: updates.enablePushNotifications ?? true,
        enableSmsNotifications: updates.enableSmsNotifications ?? false,
        reminderDaysBefore: updates.reminderDaysBefore ?? 3,
        enableDeadlineReminder: updates.enableDeadlineReminder ?? true,
        autoMarkAsRead: updates.autoMarkAsRead ?? false,
        quietHoursStart: updates.quietHoursStart ?? null,
        quietHoursEnd: updates.quietHoursEnd ?? null,
        enableQuietHours: updates.enableQuietHours ?? false
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('通知設定更新エラー:', error);
    res.status(500).json({ error: '通知設定の更新に失敗しました' });
  }
});

/**
 * POST /api/users/:userId/notification-settings/reset
 * 通知設定リセット（推奨設定に戻す）
 */
router.post('/users/:userId/notification-settings/reset', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: 認証チェック（req.user.id === userId）

    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        globalEnabled: true,
        quickSetting: 'important',
        categories: NOTIFICATION_PRESETS.recommended.categories,
        enableQuietHours: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        updatedAt: new Date()
      },
      create: {
        userId,
        globalEnabled: true,
        quickSetting: 'important',
        categories: NOTIFICATION_PRESETS.recommended.categories,
        enableEmailNotifications: true,
        enablePushNotifications: true,
        enableSmsNotifications: false,
        reminderDaysBefore: 3,
        enableDeadlineReminder: true,
        autoMarkAsRead: false,
        enableQuietHours: false
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('通知設定リセットエラー:', error);
    res.status(500).json({ error: '通知設定のリセットに失敗しました' });
  }
});

/**
 * POST /api/users/:userId/notification-settings/devices
 * デバイストークン登録（PWA対応）
 */
router.post('/users/:userId/notification-settings/devices', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { token, deviceType, browser, os } = req.body;

    // TODO: 認証チェック（req.user.id === userId）

    if (!token || !deviceType) {
      return res.status(400).json({ error: 'tokenとdeviceTypeは必須です' });
    }

    const settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });

    const deviceTokens = (settings?.deviceTokens as any[]) || [];

    // 既存トークンをチェック
    const existingIndex = deviceTokens.findIndex((d: any) => d.token === token);

    if (existingIndex >= 0) {
      // 既存トークンの更新
      deviceTokens[existingIndex] = {
        ...deviceTokens[existingIndex],
        lastUsedAt: new Date().toISOString(),
        isActive: true
      };
    } else {
      // 新規トークン追加
      deviceTokens.push({
        token,
        deviceType,
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        registeredAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        isActive: true
      });
    }

    const updated = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        deviceTokens,
        updatedAt: new Date()
      },
      create: {
        userId,
        globalEnabled: true,
        quickSetting: 'important',
        deviceTokens,
        enableEmailNotifications: true,
        enablePushNotifications: true,
        enableSmsNotifications: false,
        reminderDaysBefore: 3,
        enableDeadlineReminder: true,
        autoMarkAsRead: false,
        enableQuietHours: false
      }
    });

    res.json({ success: true, deviceTokens: updated.deviceTokens });
  } catch (error) {
    console.error('デバイストークン登録エラー:', error);
    res.status(500).json({ error: 'デバイストークンの登録に失敗しました' });
  }
});

/**
 * DELETE /api/users/:userId/notification-settings/devices/:token
 * デバイストークン削除
 */
router.delete('/users/:userId/notification-settings/devices/:token', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.params;

    // TODO: 認証チェック（req.user.id === userId）

    const settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });

    if (!settings || !settings.deviceTokens) {
      return res.status(404).json({ error: 'デバイストークンが見つかりません' });
    }

    const deviceTokens = (settings.deviceTokens as any[]).filter((d: any) => d.token !== token);

    await prisma.notificationSettings.update({
      where: { userId },
      data: {
        deviceTokens,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, message: 'デバイストークンを削除しました' });
  } catch (error) {
    console.error('デバイストークン削除エラー:', error);
    res.status(500).json({ error: 'デバイストークンの削除に失敗しました' });
  }
});

export default router;
