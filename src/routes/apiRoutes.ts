// API ルート定義（データベース接続版）
import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateNotification, validatePayloadSize } from '../middleware/validationMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';
import { NotificationService } from '../api/db/notificationService';
import { UserService } from '../api/db/userService';
import interviewRoutes from './interviewRoutes';
import syncRoutes from './syncRoutes';
import myInterviewRoutes from './myInterviewRoutes';
import consentRoutes from '../api/routes/consent.routes';
import { handleSummaryReceived } from '../api/medicalSystemReceiver';
import {
  verifyWebhookSignature,
  verifyTimestamp,
  validateWebhookPayload
} from '../services/webhookVerifier';
import type { AcknowledgementNotification } from '../types/whistleblowing';
import { ComplianceAcknowledgementService } from '../api/db/complianceAcknowledgementService';
import * as postReportsAPI from '../api/postReports';

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

// マイページAPI（認証必須）
router.use('/my', authenticateToken, myInterviewRoutes);

// データ同意API
router.use('/consent', consentRoutes);

// 面談サマリ受信API
router.post('/summaries/receive', standardRateLimit, handleSummaryReceived);

// ====================
// Webhook API（医療システムからの通知）
// ====================

// コンプライアンス通報 受付確認通知
router.post('/webhook/compliance/acknowledgement', async (req, res) => {
  const startTime = Date.now();

  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    if (!signature || !timestamp) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_HEADERS', message: '必須ヘッダーが不足しています' }
      });
    }

    // ペイロードバリデーションを先に実行（TC-007対応）
    const missingFields = validateWebhookPayload(req.body);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '必須フィールドが不足しています', missingFields }
      });
    }

    const secret = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_CONFIGURATION_ERROR', message: 'サーバー設定エラー' }
      });
    }

    if (!verifyTimestamp(timestamp, 5)) {
      return res.status(401).json({
        success: false,
        error: { code: 'TIMESTAMP_EXPIRED', message: 'タイムスタンプが無効です' }
      });
    }

    if (!verifyWebhookSignature(signature, req.body, secret)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: '署名検証に失敗しました' }
      });
    }

    const notification: AcknowledgementNotification = {
      reportId: req.body.reportId,
      anonymousId: req.body.anonymousId,
      medicalSystemCaseNumber: req.body.caseNumber,
      severity: req.body.severity,
      category: req.body.category,
      receivedAt: new Date(req.body.receivedAt),
      estimatedResponseTime: req.body.estimatedResponseTime,
      requiresImmediateAction: req.body.requiresImmediateAction || false,
      currentStatus: req.body.currentStatus || 'received',
      nextSteps: req.body.nextSteps
    };

    console.log('[Webhook] Acknowledgement received:', {
      reportId: notification.reportId,
      caseNumber: notification.medicalSystemCaseNumber,
      severity: notification.severity
    });

    // データベースに保存
    const saveResult = await ComplianceAcknowledgementService.create({
      reportId: notification.reportId,
      anonymousId: notification.anonymousId,
      medicalSystemCaseNumber: notification.medicalSystemCaseNumber,
      severity: notification.severity,
      category: notification.category,
      receivedAt: notification.receivedAt,
      estimatedResponseTime: notification.estimatedResponseTime,
      requiresImmediateAction: notification.requiresImmediateAction,
      currentStatus: notification.currentStatus,
      nextSteps: notification.nextSteps
    });

    if (!saveResult.success) {
      console.error('[Webhook] Database save failed:', saveResult.error);
      // エラーでもWebhookは成功として返す（医療システムのリトライを避けるため）
    } else {
      console.log('[Webhook] Saved to database:', saveResult.data.id);
    }

    return res.status(200).json({
      success: true,
      notificationId: saveResult.success ? saveResult.data.id : `ACK-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      receivedAt: new Date().toISOString(),
      processingTime: `${Date.now() - startTime}ms`
    });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'サーバー内部エラー' }
    });
  }
});

// ====================
// コンプライアンス受付確認通知API
// ====================

// 受付確認通知一覧取得
router.get('/compliance/acknowledgements',
  authenticateToken,
  async (req, res) => {
    const { severity, status, limit, offset } = req.query;

    const result = await ComplianceAcknowledgementService.list({
      severity: severity as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json({
      success: result.success,
      data: result.data,
    });
  }
);

// 匿名IDで受付確認通知を取得
router.get('/compliance/acknowledgements/by-anonymous/:anonymousId',
  async (req, res) => {
    const { anonymousId } = req.params;

    const result = await ComplianceAcknowledgementService.getByAnonymousId(anonymousId);

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

// reportIdで受付確認通知を取得
router.get('/compliance/acknowledgements/:reportId',
  authenticateToken,
  async (req, res) => {
    const { reportId } = req.params;

    const result = await ComplianceAcknowledgementService.getByReportId(reportId);

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
// 投稿通報API（開発環境向け暫定実装）
// 注意: 共通DB構築後に本番環境への移行が必要
// ====================

// 投稿を通報する
router.post('/posts/:postId/report',
  standardRateLimit,
  postReportsAPI.reportPost
);

// 投稿の通報状況を取得
router.get('/posts/:postId/reports',
  authenticateToken,
  postReportsAPI.getPostReports
);

// 管理者用: 全通報一覧
router.get('/admin/reports',
  authenticateToken,
  // TODO: 管理者権限チェック (Level 14以上)
  postReportsAPI.getAllReports
);

// 管理者用: 通報を確認・対応
router.put('/admin/reports/:reportId',
  authenticateToken,
  // TODO: 管理者権限チェック (Level 14以上)
  postReportsAPI.reviewReport
);

// 管理者用: 未確認アラート取得
router.get('/admin/alerts/unacknowledged',
  authenticateToken,
  // TODO: 管理者権限チェック (Level 14以上)
  postReportsAPI.getUnacknowledgedAlerts
);

// 管理者用: アラート確認済みにする
router.put('/admin/alerts/:alertId/acknowledge',
  authenticateToken,
  // TODO: 管理者権限チェック (Level 14以上)
  postReportsAPI.acknowledgeAlert
);

// 管理者用: 通報統計取得
router.get('/admin/reports/statistics',
  authenticateToken,
  // TODO: 管理者権限チェック (Level 14以上)
  postReportsAPI.getReportStatistics
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