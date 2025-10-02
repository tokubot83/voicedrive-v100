// マイページ - 面談サマリ取得API
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * 面談サマリ一覧取得
 * GET /api/my/interview-results
 */
router.get('/interview-results', async (req: Request, res: Response) => {
  try {
    // @ts-ignore - authenticateTokenミドルウェアで追加
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'ログインが必要です'
      });
    }

    console.log('[MyInterviewResults] Fetching results for user:', userId);

    // ユーザーの職員IDを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'ユーザーが見つかりません'
      });
    }

    // 該当職員の面談申込（Interview）を取得
    const interviews = await prisma.interview.findMany({
      where: {
        employeeId: userId
      },
      select: { id: true }
    });

    const requestIds = interviews.map(i => i.id);

    console.log('[MyInterviewResults] Found', requestIds.length, 'interview requests');

    // requestIdに紐づく面談サマリを取得
    const results = await prisma.interviewResult.findMany({
      where: {
        requestId: { in: requestIds }
      },
      orderBy: { completedAt: 'desc' }
    });

    console.log('[MyInterviewResults] Found', results.length, 'interview results');

    // サマリプレビュー生成
    const data = results.map(r => ({
      id: r.id,
      interviewId: r.interviewId,
      requestId: r.requestId,
      completedAt: r.completedAt,
      duration: r.duration,
      summaryPreview: r.summary.substring(0, 100) + (r.summary.length > 100 ? '...' : ''),
      followUpRequired: r.followUpRequired,
      followUpDate: r.followUpDate,
      status: r.status,
      receivedAt: r.receivedAt
    }));

    res.json({
      success: true,
      data,
      count: data.length
    });

  } catch (error) {
    console.error('[MyInterviewResults] Error fetching interview results:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました'
    });
  }
});

/**
 * 面談サマリ詳細取得
 * GET /api/my/interview-results/:interviewId
 */
router.get('/interview-results/:interviewId', async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { interviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'ログインが必要です'
      });
    }

    console.log('[MyInterviewResults] Fetching detail for interviewId:', interviewId);

    // ユーザーの職員IDを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'ユーザーが見つかりません'
      });
    }

    // 該当面談サマリを取得
    const result = await prisma.interviewResult.findUnique({
      where: { interviewId }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Interview result not found',
        message: '面談サマリが見つかりません'
      });
    }

    // 該当職員のデータか確認（セキュリティチェック）
    const request = await prisma.interview.findUnique({
      where: { id: result.requestId },
      include: {
        employee: {
          select: { employeeId: true }
        }
      }
    });

    if (!request || request.employee.employeeId !== user.employeeId) {
      console.warn('[MyInterviewResults] Access denied for user:', userId, 'interviewId:', interviewId);
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '他のユーザーの面談サマリは閲覧できません'
      });
    }

    console.log('[MyInterviewResults] Successfully fetched result:', result.id);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[MyInterviewResults] Error fetching interview result detail:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました'
    });
  }
});

/**
 * 面談サマリ既読マーク
 * POST /api/my/interview-results/:interviewId/mark-read
 */
router.post('/interview-results/:interviewId/mark-read', async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { interviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // セキュリティチェック（本人のデータか確認）
    const result = await prisma.interviewResult.findUnique({
      where: { interviewId }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Interview result not found'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true }
    });

    const request = await prisma.interview.findUnique({
      where: { id: result.requestId },
      include: {
        employee: {
          select: { employeeId: true }
        }
      }
    });

    if (!request || !user || request.employee.employeeId !== user.employeeId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden'
      });
    }

    // 既読マーク（将来的な拡張用）
    // 現時点ではログのみ
    console.log('[MyInterviewResults] Marked as read:', interviewId, 'by user:', userId);

    res.json({
      success: true,
      message: 'Marked as read'
    });

  } catch (error) {
    console.error('[MyInterviewResults] Error marking as read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
