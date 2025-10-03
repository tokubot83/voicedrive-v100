// 医療システム同期API ルート
import { Router, Request, Response } from 'express';
import { InterviewResultService, InterviewResultData } from '../api/db/interviewResultService';
import { NotificationService } from '../api/db/notificationService';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';
import prisma from '../lib/prisma';

const router = Router();

/**
 * 医療システムから面談結果を受信
 * POST /sync/interview-results
 */
router.post('/interview-results',
  standardRateLimit,
  async (req: Request, res: Response) => {
    // Bearer Token認証チェック
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.MCP_API_KEY || process.env.MEDICAL_SYSTEM_API_KEY;

    if (!authHeader || !expectedToken) {
      console.error('[sync/interview-results] Missing authentication configuration');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        details: 'Authentication required',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== expectedToken) {
      console.error('[sync/interview-results] Invalid authentication token');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        details: 'Invalid authentication token',
      });
    }

    try {
      const requestData = req.body;

      console.log('[sync/interview-results] Received request:', {
        requestId: requestData.requestId,
        interviewId: requestData.interviewId,
        completedAt: requestData.completedAt,
      });

      // 必須フィールドのバリデーション
      const validationErrors: string[] = [];

      if (!requestData.requestId) {
        validationErrors.push('Missing required field: requestId');
      }
      if (!requestData.interviewId) {
        validationErrors.push('Missing required field: interviewId');
      }
      if (!requestData.completedAt) {
        validationErrors.push('Missing required field: completedAt');
      }
      if (typeof requestData.duration !== 'number') {
        validationErrors.push('Missing or invalid required field: duration');
      }
      if (!requestData.summary) {
        validationErrors.push('Missing required field: summary');
      }
      if (!Array.isArray(requestData.keyPoints)) {
        validationErrors.push('Invalid field type: keyPoints must be an array');
      }
      if (!Array.isArray(requestData.actionItems)) {
        validationErrors.push('Invalid field type: actionItems must be an array');
      }
      if (typeof requestData.followUpRequired !== 'boolean') {
        validationErrors.push('Missing or invalid required field: followUpRequired');
      }
      if (!requestData.feedbackToEmployee) {
        validationErrors.push('Missing required field: feedbackToEmployee');
      }
      if (!requestData.nextRecommendations || typeof requestData.nextRecommendations !== 'object') {
        validationErrors.push('Missing or invalid required field: nextRecommendations');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          details: validationErrors.join(', '),
        });
      }

      // データ型変換・整形
      const interviewResultData: InterviewResultData = {
        requestId: requestData.requestId,
        interviewId: requestData.interviewId,
        completedAt: new Date(requestData.completedAt),
        duration: requestData.duration,
        summary: requestData.summary,
        keyPoints: requestData.keyPoints,
        actionItems: requestData.actionItems.map((item: any) => ({
          description: item.description,
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
        })),
        followUpRequired: requestData.followUpRequired,
        followUpDate: requestData.followUpDate ? new Date(requestData.followUpDate) : undefined,
        feedbackToEmployee: requestData.feedbackToEmployee,
        nextRecommendations: {
          suggestedNextInterview: requestData.nextRecommendations.suggestedNextInterview
            ? new Date(requestData.nextRecommendations.suggestedNextInterview)
            : undefined,
          suggestedTopics: requestData.nextRecommendations.suggestedTopics || [],
        },
      };

      // データベースに保存
      const result = await InterviewResultService.receiveResult(interviewResultData);

      if (!result.success) {
        console.error('[sync/interview-results] Save failed:', result.error);
        return res.status(500).json({
          success: false,
          error: 'Failed to save interview result',
          details: result.error,
        });
      }

      console.log('[sync/interview-results] Successfully saved:', result.data?.id);

      // Phase 2: サマリ受信時に通知を自動生成
      try {
        console.log('[sync/interview-results] Phase 2: Starting notification generation...');
        // requestIdから対応するInterviewを取得し、従業員IDを特定
        const interview = await prisma.interview.findUnique({
          where: { id: requestData.requestId },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                employeeId: true
              }
            }
          }
        });
        console.log('[sync/interview-results] Interview lookup result:', interview ? `Found (employeeId: ${interview.employee.employeeId})` : 'Not found');

        if (interview) {
          // システムユーザー（通知送信者）を取得または作成
          let systemUser = await prisma.user.findFirst({
            where: { employeeId: 'SYSTEM' }
          });

          if (!systemUser) {
            systemUser = await prisma.user.create({
              data: {
                employeeId: 'SYSTEM',
                email: 'system@voicedrive.local',
                name: 'VoiceDriveシステム',
                accountType: 'SYSTEM',
                permissionLevel: 13,
                department: 'システム管理'
              }
            });
          }

          // 通知作成（interviewIdをコンテンツに含める）
          console.log('[sync/interview-results] Creating notification with params:', {
            category: 'interview',
            subcategory: 'summary_received',
            target: interview.employee.employeeId,
            senderId: systemUser.id
          });

          const notificationResult = await NotificationService.create({
            category: 'interview',
            subcategory: 'summary_received',
            priority: 'high',
            title: '📝 面談サマリが届きました',
            content: `面談「${requestData.summary.substring(0, 50)}...」のサマリが人事部から届きました。詳細をご確認ください。\n\n[INTERVIEW_ID:${requestData.interviewId}]`,
            target: interview.employee.employeeId, // 特定従業員宛て
            senderId: systemUser.id
          });

          console.log('[sync/interview-results] Notification result:', { success: notificationResult.success, error: notificationResult.error });

          if (notificationResult.success) {
            // 通知を即座に送信状態に
            await NotificationService.send(notificationResult.data!.id);
            console.log('[sync/interview-results] Notification created and sent:', notificationResult.data!.id);
          } else {
            console.error('[sync/interview-results] Failed to create notification:', notificationResult.error);
          }
        } else {
          console.warn('[sync/interview-results] Interview not found for requestId:', requestData.requestId);
        }
      } catch (notificationError) {
        // 通知生成エラーは面談サマリ保存には影響させない
        console.error('[sync/interview-results] Notification generation error:', notificationError);
      }

      // 成功レスポンス
      return res.status(200).json({
        success: true,
        message: '面談結果を正常に受信しました',
        receivedAt: new Date().toISOString(),
        data: {
          id: result.data!.id,
          requestId: result.data!.requestId,
          interviewId: result.data!.interviewId,
        },
      });

    } catch (error) {
      console.error('[sync/interview-results] Unexpected error:', error);
      console.error('[sync/interview-results] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
