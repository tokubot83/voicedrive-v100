// /sync/interview-results エンドポイント
// 医療システムから面談結果を受信するAPIルート

import type { NextApiRequest, NextApiResponse } from 'next';
import { InterviewResultService, InterviewResultData } from '../../../api/db/interviewResultService';

// レスポンス型
type SuccessResponse = {
  success: true;
  message: string;
  receivedAt: string;
  data: {
    id: string;
    requestId: string;
    interviewId: string;
  };
};

type ErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

/**
 * 面談結果受信エンドポイント
 * POST /api/sync/interview-results
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      details: 'Only POST method is supported',
    });
    return;
  }

  // Bearer Token認証チェック（環境変数から取得）
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.MCP_API_KEY || process.env.MEDICAL_SYSTEM_API_KEY;

  if (!authHeader || !expectedToken) {
    console.error('[interview-results] Missing authentication configuration');
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      details: 'Authentication required',
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  if (token !== expectedToken) {
    console.error('[interview-results] Invalid authentication token');
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      details: 'Invalid authentication token',
    });
    return;
  }

  try {
    const requestData = req.body;

    console.log('[interview-results] Received request:', {
      requestId: requestData.requestId,
      interviewId: requestData.interviewId,
      completedAt: requestData.completedAt,
    });

    // 必須フィールドのバリデーション
    if (!requestData.requestId) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing required field: requestId',
      });
      return;
    }

    if (!requestData.interviewId) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing required field: interviewId',
      });
      return;
    }

    if (!requestData.completedAt) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing required field: completedAt',
      });
      return;
    }

    if (typeof requestData.duration !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing or invalid required field: duration',
      });
      return;
    }

    if (!requestData.summary) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing required field: summary',
      });
      return;
    }

    if (!Array.isArray(requestData.keyPoints)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Invalid field type: keyPoints must be an array',
      });
      return;
    }

    if (!Array.isArray(requestData.actionItems)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Invalid field type: actionItems must be an array',
      });
      return;
    }

    if (typeof requestData.followUpRequired !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing or invalid required field: followUpRequired',
      });
      return;
    }

    if (!requestData.feedbackToEmployee) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing required field: feedbackToEmployee',
      });
      return;
    }

    if (!requestData.nextRecommendations || typeof requestData.nextRecommendations !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing or invalid required field: nextRecommendations',
      });
      return;
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
      console.error('[interview-results] Save failed:', result.error);
      res.status(500).json({
        success: false,
        error: 'Failed to save interview result',
        details: result.error,
      });
      return;
    }

    console.log('[interview-results] Successfully saved:', result.data?.id);

    // 成功レスポンス
    res.status(200).json({
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
    console.error('[interview-results] Unexpected error:', error);
    console.error('[interview-results] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
