/**
 * 理事会議題レビューAPI
 * 作成日: 2025年10月13日
 *
 * エンドポイント:
 * - GET /api/board-meetings/next - 次回理事会情報取得
 * - GET /api/board-agendas - 理事会議題一覧取得
 * - POST /api/board-agendas/:id/review - 理事長レビューアクション
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * 権限チェック: レベル18以上（理事長・法人事務局長）のみアクセス可能
 */
function hasChairmanPermission(permissionLevel: number): boolean {
  return permissionLevel >= 18;
}

/**
 * GET /api/board-meetings/next
 * 次回理事会情報取得
 *
 * クエリパラメータ: なし
 *
 * レスポンス:
 * {
 *   id: string,
 *   meetingDate: string (ISO 8601),
 *   startTime: string,
 *   location: string,
 *   expectedAttendees: number,
 *   expectedDuration: number,
 *   totalAgendaCount: number,
 *   totalEstimatedTime: number,
 *   preparationProgress: number,
 *   status: string
 * }
 */
router.get('/board-meetings/next', async (req: Request, res: Response) => {
  try {
    // 1. 次回理事会を取得（未来の日付で最も近いもの）
    const nextMeeting = await prisma.boardMeeting.findFirst({
      where: {
        meetingDate: { gte: new Date() },
        status: { in: ['planning', 'scheduled'] }
      },
      orderBy: { meetingDate: 'asc' }
    });

    if (!nextMeeting) {
      return res.status(404).json({
        success: false,
        error: '予定されている理事会が見つかりません'
      });
    }

    // 2. 議題の総予定時間を集計
    const agendaStats = await prisma.boardMeetingAgenda.aggregate({
      where: { meetingDate: nextMeeting.meetingDate },
      _sum: { duration: true },
      _count: { id: true }
    });

    const totalEstimatedTime = agendaStats._sum.duration || 0;
    const totalAgendaCount = agendaStats._count.id || 0;

    console.log('[GET /api/board-meetings/next] 次回理事会情報取得:', {
      meetingId: nextMeeting.id,
      meetingDate: nextMeeting.meetingDate,
      totalAgendaCount,
      totalEstimatedTime
    });

    // 3. レスポンス
    return res.status(200).json({
      success: true,
      meeting: {
        id: nextMeeting.id,
        meetingDate: nextMeeting.meetingDate.toISOString(),
        startTime: nextMeeting.startTime,
        location: nextMeeting.location,
        expectedAttendees: nextMeeting.expectedAttendees,
        expectedDuration: nextMeeting.expectedDuration,
        totalAgendaCount,
        totalEstimatedTime,
        preparationProgress: nextMeeting.preparationProgress,
        status: nextMeeting.status
      }
    });

  } catch (error: any) {
    console.error('[GET /api/board-meetings/next] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '次回理事会情報の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/board-agendas
 * 理事会議題一覧取得
 *
 * クエリパラメータ:
 * - meetingDate: string (ISO 8601) - 理事会日付（必須）
 *
 * レスポンス:
 * {
 *   agendas: Array<AgendaItem>,
 *   statistics: {
 *     total: number,
 *     approved: number,
 *     pending: number,
 *     needsRevision: number,
 *     rejected: number
 *   }
 * }
 */
router.get('/board-agendas', async (req: Request, res: Response) => {
  try {
    const { meetingDate } = req.query;

    // 1. バリデーション
    if (!meetingDate || typeof meetingDate !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'meetingDateクエリパラメータが必要です（ISO 8601形式）'
      });
    }

    const parsedDate = new Date(meetingDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: '無効な日付形式です'
      });
    }

    // 2. 議題一覧取得
    const agendas = await prisma.boardMeetingAgenda.findMany({
      where: {
        meetingDate: parsedDate
      },
      include: {
        presenter: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true
          }
        }
      },
      orderBy: { agendaOrder: 'asc' }
    });

    // 3. 統計情報を集計
    const statistics = agendas.reduce((acc, agenda) => {
      acc.total++;
      switch (agenda.chairmanReview) {
        case 'approved':
          acc.approved++;
          break;
        case 'pending':
          acc.pending++;
          break;
        case 'needs_revision':
          acc.needsRevision++;
          break;
        case 'rejected':
          acc.rejected++;
          break;
      }
      return acc;
    }, {
      total: 0,
      approved: 0,
      pending: 0,
      needsRevision: 0,
      rejected: 0
    });

    console.log('[GET /api/board-agendas] 議題一覧取得:', {
      meetingDate: parsedDate.toISOString(),
      count: agendas.length,
      statistics
    });

    // 4. レスポンス
    return res.status(200).json({
      success: true,
      agendas: agendas.map(agenda => ({
        id: agenda.id,
        item: agenda.item,
        description: agenda.description,
        category: agenda.category,
        priority: agenda.priority,
        preparedBy: agenda.preparedBy,
        sourceReport: agenda.sourceReport,
        summary: agenda.summary,
        keyPoints: agenda.keyPoints,
        expectedDiscussion: agenda.expectedDiscussion,
        requiredDecision: agenda.requiredDecision,
        documentsReady: agenda.documentsReady,
        presentationReady: agenda.presentationReady,
        duration: agenda.duration,
        chairmanReview: agenda.chairmanReview,
        chairmanComment: agenda.chairmanComment,
        chairmanReviewedAt: agenda.chairmanReviewedAt?.toISOString(),
        agendaOrder: agenda.agendaOrder,
        presenter: agenda.presenter
      })),
      statistics
    });

  } catch (error: any) {
    console.error('[GET /api/board-agendas] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '議題一覧の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/board-agendas/:id/review
 * 理事長レビューアクション
 *
 * リクエストボディ:
 * {
 *   action: 'approve' | 'revise' | 'reject',
 *   comment?: string,
 *   userId: string
 * }
 *
 * レスポンス:
 * {
 *   success: true,
 *   agenda: {
 *     id: string,
 *     chairmanReview: string,
 *     chairmanComment: string,
 *     chairmanReviewedBy: string,
 *     chairmanReviewedAt: string
 *   }
 * }
 */
router.post('/board-agendas/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, comment, userId } = req.body;

    // 1. バリデーション
    const validActions = ['approve', 'revise', 'reject'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'actionは "approve", "revise", "reject" のいずれかである必要があります'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userIdが必要です'
      });
    }

    // 2. ユーザー取得・権限チェック
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    if (!hasChairmanPermission(Number(user.permissionLevel))) {
      return res.status(403).json({
        success: false,
        error: 'この操作にはレベル18以上の権限が必要です（理事長・法人事務局長）'
      });
    }

    // 3. 議題取得
    const agenda = await prisma.boardMeetingAgenda.findUnique({
      where: { id },
      include: {
        presenter: {
          select: { id: true, name: true }
        }
      }
    });

    if (!agenda) {
      return res.status(404).json({
        success: false,
        error: '議題が見つかりません'
      });
    }

    // 4. ステータスマッピング
    const statusMap: Record<string, string> = {
      approve: 'approved',
      revise: 'needs_revision',
      reject: 'rejected'
    };

    console.log('[POST /api/board-agendas/:id/review] レビュー処理開始:', {
      agendaId: id,
      agendaItem: agenda.item.substring(0, 50),
      action,
      userId,
      comment: comment?.substring(0, 50)
    });

    // 5. 議題更新
    const updatedAgenda = await prisma.boardMeetingAgenda.update({
      where: { id },
      data: {
        chairmanReview: statusMap[action],
        chairmanComment: comment || null,
        chairmanReviewedBy: userId,
        chairmanReviewedAt: new Date()
      }
    });

    console.log('[POST /api/board-agendas/:id/review] 議題更新完了:', updatedAgenda.id);

    // 6. 通知作成（議題準備者に通知）
    const notificationTitles: Record<string, string> = {
      approve: '理事会議題が承認されました',
      revise: '理事会議題の修正依頼',
      reject: '理事会議題が却下されました'
    };

    const notificationPriorities: Record<string, string> = {
      approve: 'normal',
      revise: 'high',
      reject: 'high'
    };

    const notification = await prisma.notification.create({
      data: {
        category: 'board_agenda',
        subcategory: 'chairman_review',
        priority: notificationPriorities[action],
        title: notificationTitles[action],
        content: comment
          ? `理事会議題「${agenda.item}」のレビュー結果:\n\n${comment}`
          : `理事会議題「${agenda.item}」が${statusMap[action]}されました。`,
        target: 'individual',
        senderId: userId,
        status: 'pending',
        recipients: {
          create: {
            userId: agenda.presenter.id,
            isRead: false
          }
        }
      }
    });

    console.log('[POST /api/board-agendas/:id/review] 通知作成完了:', notification.id);

    // 7. レスポンス
    return res.status(200).json({
      success: true,
      agenda: {
        id: updatedAgenda.id,
        item: updatedAgenda.item,
        chairmanReview: updatedAgenda.chairmanReview,
        chairmanComment: updatedAgenda.chairmanComment,
        chairmanReviewedBy: updatedAgenda.chairmanReviewedBy,
        chairmanReviewedAt: updatedAgenda.chairmanReviewedAt?.toISOString()
      },
      notification: {
        id: notification.id,
        recipientId: agenda.presenter.id,
        recipientName: agenda.presenter.name
      }
    });

  } catch (error: any) {
    console.error('[POST /api/board-agendas/:id/review] エラー:', error);
    return res.status(500).json({
      success: false,
      error: 'レビュー処理中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
