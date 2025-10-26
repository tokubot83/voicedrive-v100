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
import analyticsRoutes from '../api/routes/analytics.routes';
import sidebarMenuRoutes from '../api/routes/sidebar-menu.routes';
import agendaRoutes from './agendaRoutes';
import projectModeConfigRoutes from './projectModeConfigRoutes';
import notificationSettingsRoutes from './notificationSettingsRoutes';
import dataConsentRoutes from './dataConsentRoutes';
import { handleSummaryReceived } from '../api/medicalSystemReceiver';
import {
  verifyWebhookSignature,
  verifyTimestamp,
  validateWebhookPayload
} from '../services/webhookVerifier';
import type { AcknowledgementNotification } from '../types/whistleblowing';
import { ComplianceAcknowledgementService } from '../api/db/complianceAcknowledgementService';
import * as postReportsAPI from '../api/postReports';
import * as expiredEscalationAPI from '../api/expiredEscalationDecision';
// Phase 2: 顔写真統合
import { validateWebhookSignature } from '../middleware/webhookAuth';
import { handleEmployeeWebhook } from '../controllers/webhookController';
// Phase 2: Approvals Page - Notifications API
import notificationsApiRouter from './notificationsApi';

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

// Analytics API（職員カルテシステム連携）
console.log('📊 Registering Analytics API routes at /v1/analytics');
console.log('   Analytics routes type:', typeof analyticsRoutes);
router.use('/v1/analytics', analyticsRoutes);

// サイドバーメニュー管理API
router.use('/sidebar-menu', sidebarMenuRoutes);

// Phase 2: Approvals Page - Actionable Notifications API
console.log('📋 Registering Approvals Notifications API routes at /approvals');
router.use('/approvals', notificationsApiRouter);

// Phase 2: 医療システム連携監視API
import integrationRoutes from '../api/routes/integration.routes';
console.log('🔗 Registering Integration Monitoring API routes at /integration');
router.use('/integration', authenticateToken, integrationRoutes);

// プロジェクトモード設定API
console.log('⚙️ Registering Project Mode Config API routes at /project-mode');
router.use('/project-mode', projectModeConfigRoutes);

// Phase 2: 通知設定API
console.log('🔔 Registering Notification Settings API routes at /users/:userId/notification-settings');
router.use('/', notificationSettingsRoutes);

// Phase 2: データ分析同意API
console.log('🛡️ Registering Data Consent API routes at /users/:userId/consent');
router.use('/', dataConsentRoutes);

// Phase 2: コンプライアンス通報API
import whistleblowingRoutes from './whistleblowingRoutes';
import whistleblowingWebhookRoutes from './whistleblowingWebhookRoutes';
console.log('🚨 Registering Whistleblowing API routes at /whistleblowing');
router.use('/whistleblowing', whistleblowingRoutes);
console.log('🔔 Registering Whistleblowing Webhook routes at /webhooks/medical-system/whistleblowing');
router.use('/webhooks/medical-system/whistleblowing', whistleblowingWebhookRoutes);

// Phase 2.x: 投稿作成API
import { prisma } from '../lib/prisma';

// システム設定API
import systemSettingsRoutes from './systemSettingsRoutes';
console.log('⚙️ Registering System Settings API routes at /system');
router.use('/system', systemSettingsRoutes);

// 議題モードAPI（server.tsで直接登録するため、ここではコメントアウト）
// console.log('📋 Registering Agenda API routes at /api/agenda');
// console.log('   AgendaRoutes type:', typeof agendaRoutes);
// console.log('   AgendaRoutes value:', agendaRoutes);
// console.log('   AgendaRoutes.default:', agendaRoutes?.default);
// if (agendaRoutes) {
//   router.use('/agenda', agendaRoutes);
// } else {
//   console.error('❌ AgendaRoutes is undefined!');
// }

// 面談サマリ受信API
router.post('/summaries/receive', standardRateLimit, handleSummaryReceived);

// ====================
// Webhook API（医療システムからの通知）
// ====================

// Phase 2: 職員顔写真データ連携Webhook
router.post('/webhooks/medical-system/employee',
  validateWebhookSignature,
  handleEmployeeWebhook
);

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
// 投稿作成API（Phase 2.x）
// ====================

/**
 * POST /api/posts - 投稿作成
 * 3種類の投稿タイプに対応: improvement, community, report
 */
router.post('/posts',
  standardRateLimit,
  async (req, res) => {
    try {
      const {
        type,
        content,
        anonymityLevel,
        proposalType,
        priority,
        freespaceCategory,
        freespaceScope,
        expirationDate,
        pollData,
        eventData,
        season,
        moderationScore
      } = req.body;

      // バリデーション: 必須フィールド
      if (!type || !content || !anonymityLevel) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています（type, content, anonymityLevel）'
        });
      }

      // バリデーション: 投稿タイプ
      const validTypes = ['improvement', 'community', 'report'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: '不正な投稿タイプです'
        });
      }

      // バリデーション: コンテンツ長
      if (content.length < 10) {
        return res.status(400).json({
          success: false,
          message: '投稿内容は10文字以上である必要があります'
        });
      }

      if (content.length > 500) {
        return res.status(400).json({
          success: false,
          message: '投稿内容は500文字以内である必要があります'
        });
      }

      // TODO: JWT認証からauthorIdを取得（現在はデモユーザー）
      // デモ用に既存のユーザーIDを使用
      const authorId = 'cmfs8u4hx0000s5qs2dv42m45';

      // トランザクション開始
      const result = await prisma.$transaction(async (tx) => {
        // Post作成
        const post = await tx.post.create({
          data: {
            type,
            content,
            authorId,
            anonymityLevel,
            proposalType: type === 'improvement' ? proposalType : null,
            priority: (type === 'improvement' || type === 'report') ? (priority || 'medium') : null,
            freespaceCategory: type === 'community' ? freespaceCategory : null,
            freespaceScope: type === 'community' ? freespaceScope : null,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
            season: season || null,
            moderationScore: moderationScore || null,
            status: 'active',
            moderationStatus: 'pending'
          }
        });

        // Poll作成（community専用）
        if (pollData && type === 'community') {
          const poll = await tx.poll.create({
            data: {
              postId: post.id,
              question: pollData.question,
              description: pollData.description || null,
              deadline: new Date(pollData.deadline),
              allowMultiple: pollData.allowMultiple || false,
              showResults: pollData.showResults || 'after_voting',
              category: pollData.category || freespaceCategory || 'general',
              scope: pollData.scope || freespaceScope || 'SAME_DEPARTMENT',
              createdById: authorId
            }
          });

          // PollOption作成
          if (pollData.options && Array.isArray(pollData.options)) {
            await Promise.all(
              pollData.options.map((option: any, index: number) =>
                tx.pollOption.create({
                  data: {
                    pollId: poll.id,
                    text: option.text,
                    emoji: option.emoji || null,
                    sortOrder: index
                  }
                })
              )
            );
          }
        }

        // Event作成（community専用）
        if (eventData && type === 'community') {
          const event = await tx.event.create({
            data: {
              postId: post.id,
              title: eventData.title,
              description: eventData.description,
              type: eventData.type || 'social',
              organizerId: authorId,
              maxParticipants: eventData.maxParticipants || null,
              venueName: eventData.venueName || null,
              venueAddress: eventData.venueAddress || null,
              cost: eventData.cost || null,
              requirements: eventData.requirements || null,
              visibility: eventData.visibility || freespaceScope || 'SAME_DEPARTMENT',
              allowDateVoting: eventData.allowDateVoting !== false,
              allowComments: eventData.allowComments !== false,
              sendReminders: eventData.sendReminders !== false,
              tags: eventData.tags || null
            }
          });

          // ProposedDate作成
          if (eventData.proposedDates && Array.isArray(eventData.proposedDates)) {
            await Promise.all(
              eventData.proposedDates.map((pd: any) =>
                tx.proposedDate.create({
                  data: {
                    eventId: event.id,
                    date: new Date(pd.date),
                    startTime: pd.startTime,
                    endTime: pd.endTime
                  }
                })
              )
            );
          }
        }

        return post;
      });

      console.log('[POST /api/posts] 投稿作成成功:', {
        id: result.id,
        type: result.type,
        authorId: result.authorId
      });

      res.status(201).json({
        success: true,
        data: result,
        message: '投稿が正常に作成されました'
      });
    } catch (error) {
      console.error('[POST /api/posts] 投稿作成エラー:', error);

      // Prismaエラーの詳細をログ出力
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('[POST /api/posts] Prisma Error Code:', (error as any).code);
        console.error('[POST /api/posts] Prisma Error Meta:', (error as any).meta);
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '投稿の作成中にエラーが発生しました',
        debug: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
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
// 期限到達判断API（Phase 6）
// ====================

// 期限到達提案一覧取得（判断待ち）
router.get('/agenda/expired-escalation-proposals',
  authenticateToken,
  async (req, res) => {
    try {
      // @ts-ignore - req.userはミドルウェアで追加
      const userId = req.user?.id;
      // @ts-ignore
      const permissionLevel = req.user?.permissionLevel || 1;
      // @ts-ignore
      const facilityId = req.user?.facilityId;
      // @ts-ignore
      const department = req.user?.department;

      const { limit, offset } = req.query;

      const result = await expiredEscalationAPI.getExpiredEscalationProposals({
        userId,
        permissionLevel,
        facilityId,
        department,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[API] 期限到達提案取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '期限到達提案の取得に失敗しました'
      });
    }
  }
);

// 期限到達判断を記録
router.post('/agenda/expired-escalation-decisions',
  authenticateToken,
  async (req, res) => {
    try {
      // @ts-ignore
      const deciderId = req.user?.id;

      if (!deciderId) {
        return res.status(401).json({
          success: false,
          error: '認証情報が不正です'
        });
      }

      const {
        postId,
        decision,
        decisionReason,
        currentScore,
        targetScore,
        agendaLevel,
        proposalType,
        department
      } = req.body;

      // バリデーション
      if (!postId || !decision || !decisionReason) {
        return res.status(400).json({
          success: false,
          error: '必須パラメータが不足しています'
        });
      }

      const validDecisions = ['approve_at_current_level', 'downgrade', 'reject'];
      if (!validDecisions.includes(decision)) {
        return res.status(400).json({
          success: false,
          error: '不正な判断タイプです'
        });
      }

      // @ts-ignore
      const facilityId = req.user?.facilityId;

      const result = await expiredEscalationAPI.recordExpiredEscalationDecision({
        postId,
        decision,
        deciderId,
        decisionReason,
        currentScore: currentScore || 0,
        targetScore: targetScore || 100,
        agendaLevel: agendaLevel || 'unknown',
        proposalType,
        department,
        facilityId
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || '判断の記録に失敗しました'
        });
      }

      res.json({
        success: true,
        data: {
          decisionId: result.decisionId
        }
      });
    } catch (error) {
      console.error('[API] 判断記録エラー:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '判断の記録に失敗しました'
      });
    }
  }
);

// 期限到達判断履歴を取得（VoiceDrive内部用）
// 医療システム連携は /api/agenda/expired-escalation-history を使用
// （agendaExpiredEscalationRoutes.tsで定義）

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