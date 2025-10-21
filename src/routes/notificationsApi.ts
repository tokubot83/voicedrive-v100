// Phase 2: Approvals Page - Notifications API
// 承認通知のCRUD操作API

import express, { Request, Response } from 'express';
import ActionableNotificationService from '../services/ActionableNotificationService';

const router = express.Router();
const notificationService = ActionableNotificationService.getInstance();

/**
 * GET /api/notifications
 * ユーザーの通知一覧を取得
 *
 * Query Parameters:
 * - type: 通知タイプでフィルター (APPROVAL_REQUIRED, MEMBER_SELECTION, etc.)
 * - unreadOnly: true の場合、未読のみ
 * - pendingOnly: true の場合、未アクションのみ
 * - limit: 取得件数（デフォルト: 50）
 */
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // 認証ミドルウェアから取得（要実装）

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const filter = {
      notificationType: req.query.type as string | undefined,
      unreadOnly: req.query.unreadOnly === 'true',
      pendingOnly: req.query.pendingOnly === 'true',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const notifications = await notificationService.getUserNotifications(userId, filter);

    res.json({
      success: true,
      notifications,
      count: notifications.length,
    });

  } catch (error) {
    console.error('GET /api/notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/stats
 * ユーザーの通知統計を取得
 *
 * Response:
 * - pending: 未アクション件数
 * - unread: 未読件数
 * - total: 全件数
 * - overdue: 期限切れ件数
 * - byType: タイプ別件数
 */
router.get('/notifications/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await notificationService.getNotificationStats(userId);

    res.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('GET /api/notifications/stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});

/**
 * POST /api/notifications
 * 新しい通知を作成
 *
 * Body:
 * - category: カテゴリ
 * - title: タイトル
 * - content: 内容
 * - notificationType: APPROVAL_REQUIRED | MEMBER_SELECTION | etc.
 * - recipientIds: 受信者IDリスト
 * - actions: アクション定義リスト
 * - etc.
 */
router.post('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const input = {
      ...req.body,
      senderId: userId,
    };

    const notificationId = await notificationService.createActionableNotification(input);

    res.status(201).json({
      success: true,
      notificationId,
    });

  } catch (error) {
    console.error('POST /api/notifications error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * 通知を既読にする
 */
router.patch('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await notificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });

  } catch (error) {
    console.error(`PATCH /api/notifications/${req.params.id}/read error:`, error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * POST /api/notifications/:id/action
 * 通知のアクションを実行
 *
 * Body:
 * - actionId: 実行するアクションのID
 * - result: アクション実行結果（オプション）
 */
router.post('/notifications/:id/action', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;
    const { actionId, result } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!actionId) {
      return res.status(400).json({ error: 'actionId is required' });
    }

    await notificationService.executeNotificationAction({
      notificationId,
      actionId,
      executedBy: userId,
      result,
    });

    res.json({
      success: true,
      message: 'Action executed successfully',
    });

  } catch (error) {
    console.error(`POST /api/notifications/${req.params.id}/action error:`, error);
    res.status(500).json({ error: 'Failed to execute action' });
  }
});

export default router;
