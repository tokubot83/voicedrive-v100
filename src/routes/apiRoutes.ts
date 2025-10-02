// API ルート定義（データベース接続版）
import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateNotification, validatePayloadSize } from '../middleware/validationMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';
import { NotificationService } from '../api/db/notificationService';
import { UserService } from '../api/db/userService';
import interviewRoutes from './interviewRoutes';
import syncRoutes from './syncRoutes';
import { handleSummaryReceived } from '../api/medicalSystemReceiver';

const router = Router();

// ペイロードサイズ制限
router.use(validatePayloadSize(1048576)); // 1MB

// ====================
// サブルート
// ====================

// 面談予約API
router.use('/interviews', interviewRoutes);

// 医療システム同期API
router.use('/sync', syncRoutes);

// 面談サマリ受信API
router.post('/summaries/receive', standardRateLimit, handleSummaryReceived);

// ====================
// 認証API
// ====================

// ログイン（トークン検証）
router.post('/auth/login',
  standardRateLimit,
  async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token is required',
      });
    }

    const result = await UserService.authenticate(token);

    if (!result.success) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: result.error,
      });
    }

    res.json({
      success: true,
      user: result.data,
      token, // 実際にはリフレッシュトークンを返す
    });
  }
);

// ====================
// 通知API（DB接続）
// ====================

// 通知作成・送信
router.post('/notifications',
  standardRateLimit,
  authenticateToken,
  validateNotification,
  async (req, res) => {
    const { category, subcategory, priority, title, content, target } = req.body;

    // @ts-ignore - req.userはミドルウェアで追加
    const senderId = req.user?.id || 'system';

    const createResult = await NotificationService.create({
      category,
      subcategory,
      priority,
      title,
      content,
      target,
      senderId,
    });

    if (!createResult.success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: createResult.error,
      });
    }

    // 即座に送信処理
    const sendResult = await NotificationService.send(createResult.data.id);

    res.json({
      success: true,
      id: createResult.data.id,
      message: sendResult.success ? 'Notification sent successfully' : 'Notification created but not sent',
      data: createResult.data,
    });
  }
);

// 通知リスト取得
router.get('/notifications',
  standardRateLimit,
  authenticateToken,
  async (req, res) => {
    const { category, status } = req.query;

    const result = await NotificationService.list({
      category: category as string,
      status: status as string,
    });

    res.json({
      success: result.success,
      data: result.data,
      count: result.data?.length || 0,
    });
  }
);

// 通知詳細取得
router.get('/notifications/:id',
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    const result = await NotificationService.getById(id);

    if (!result.success) {
      return res.status(404).json({
        error: 'Not Found',
        message: result.error,
      });
    }

    // 既読カウント更新
    await NotificationService.updateReadCount(id);

    res.json({
      success: true,
      data: result.data,
    });
  }
);

// 通知統計取得
router.get('/notifications/stats/summary',
  authenticateToken,
  async (req, res) => {
    // @ts-ignore
    const userId = req.user?.id;

    const result = await NotificationService.getStatistics(userId);

    res.json({
      success: result.success,
      data: result.data,
    });
  }
);

// ====================
// ユーザーAPI
// ====================

// ユーザー情報取得
router.get('/users/me',
  authenticateToken,
  async (req, res) => {
    // @ts-ignore
    const employeeId = req.user?.employeeId;

    if (!employeeId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const result = await UserService.findByEmployeeId(employeeId);

    if (!result.success) {
      return res.status(404).json({
        error: 'Not Found',
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  }
);

// ユーザーリスト取得
router.get('/users',
  authenticateToken,
  async (req, res) => {
    const { department, facility, type, retired } = req.query;

    const result = await UserService.list({
      department: department as string,
      facilityId: facility as string,
      accountType: type as string,
      isRetired: retired === 'true',
    });

    res.json({
      success: result.success,
      data: result.data,
      count: result.count,
    });
  }
);

// 組織階層取得
router.get('/users/:id/hierarchy',
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    const result = await UserService.getOrganizationHierarchy(id);

    if (!result.success) {
      return res.status(404).json({
        error: 'Not Found',
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  }
);

// ====================
// ヘルスチェック
// ====================

router.get('/health', async (req, res) => {
  try {
    // DB接続確認
    const { prisma } = await import('../lib/prisma');
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '2.1.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Database connection failed',
    });
  }
});

export default router;