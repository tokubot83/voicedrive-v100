/**
 * 決定会議API
 * 作成日: 2025年10月22日
 *
 * エンドポイント:
 * - GET /api/decision-agendas - 決定会議議題一覧取得
 * - GET /api/decision-agendas/:id - 決定会議議題詳細取得
 * - POST /api/decision-agendas/:id/decide - 決定アクション（承認/却下/保留）
 * - POST /api/decision-agendas/:id/start-review - 審議開始
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * 権限チェック: レベル13以上（院長・施設長）のみアクセス可能
 */
function hasDirectorPermission(permissionLevel: number): boolean {
  return permissionLevel >= 13;
}

/**
 * 統計情報計算
 */
async function calculateStats() {
  const totalAgendas = await prisma.decisionMeetingAgenda.count();

  const pendingCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'pending' }
  });

  const approvedCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'approved' }
  });

  const rejectedCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'rejected' }
  });

  const deferredCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'deferred' }
  });

  const urgentCount = await prisma.decisionMeetingAgenda.count({
    where: { priority: 'urgent' }
  });

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonthDecisions = await prisma.decisionMeetingAgenda.count({
    where: {
      decidedDate: { gte: thisMonthStart },
      status: { in: ['approved', 'rejected', 'deferred'] }
    }
  });

  const approvalRate = totalAgendas > 0 ? (approvedCount / totalAgendas) * 100 : 0;

  // 平均決定日数計算
  const decidedAgendas = await prisma.decisionMeetingAgenda.findMany({
    where: { decidedDate: { not: null } },
    select: { proposedDate: true, decidedDate: true }
  });

  const totalDays = decidedAgendas.reduce((sum, agenda) => {
    if (!agenda.decidedDate) return sum;
    const days = Math.floor(
      (agenda.decidedDate.getTime() - agenda.proposedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  const averageDecisionDays = decidedAgendas.length > 0
    ? Math.round(totalDays / decidedAgendas.length)
    : 0;

  return {
    totalAgendas,
    pendingCount,
    approvedCount,
    rejectedCount,
    deferredCount,
    urgentCount,
    thisMonthDecisions,
    approvalRate: Math.round(approvalRate),
    averageDecisionDays
  };
}

/**
 * 議題データのフォーマット
 */
function formatAgenda(agenda: any) {
  return {
    id: agenda.id,
    title: agenda.title,
    type: agenda.type,
    description: agenda.description,
    background: agenda.background,
    proposedBy: agenda.proposedBy,
    proposedDate: agenda.proposedDate.toISOString(),
    proposerDepartment: agenda.proposerDepartment,
    proposerId: agenda.proposerId,
    status: agenda.status,
    priority: agenda.priority,
    scheduledDate: agenda.scheduledDate?.toISOString(),
    decidedDate: agenda.decidedDate?.toISOString(),
    decidedBy: agenda.decidedBy,
    deciderId: agenda.deciderId,
    decision: agenda.decision,
    decisionNotes: agenda.decisionNotes,
    impact: {
      departments: agenda.impactDepartments as string[],
      estimatedCost: agenda.impactEstimatedCost,
      implementationPeriod: agenda.impactImplementationPeriod,
      expectedEffect: agenda.impactExpectedEffect
    },
    meetingMinutes: agenda.meetingDiscussion ? {
      attendees: (agenda.meetingAttendees as string[]) || [],
      discussion: agenda.meetingDiscussion,
      concerns: (agenda.meetingConcerns as string[]) || [],
      conditions: (agenda.meetingConditions as string[]) || []
    } : undefined,
    relatedCommitteeAgendaId: agenda.relatedCommitteeAgendaId,
    createdAt: agenda.createdAt.toISOString(),
    updatedAt: agenda.updatedAt.toISOString()
  };
}

/**
 * GET /api/decision-agendas
 * 決定会議議題一覧取得
 *
 * クエリパラメータ:
 * - status?: string (pending, in_review, approved, rejected, deferred)
 * - priority?: string (urgent, high, normal, low)
 * - month?: string (YYYY-MM形式、今月決定フィルタ用)
 *
 * レスポンス:
 * {
 *   agendas: Array<Agenda>,
 *   stats: Stats
 * }
 */
router.get('/decision-agendas', async (req: Request, res: Response) => {
  try {
    const { status, priority, month } = req.query;

    // フィルタ条件構築
    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    if (month && typeof month === 'string') {
      const [year, monthNum] = month.split('-');
      if (year && monthNum) {
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
        where.decidedDate = { gte: startDate, lte: endDate };
        where.status = { in: ['approved', 'rejected', 'deferred'] };
      }
    }

    console.log('[GET /api/decision-agendas] 議題一覧取得:', { where });

    // 議題一覧取得
    const agendas = await prisma.decisionMeetingAgenda.findMany({
      where,
      include: {
        proposerUser: {
          select: { id: true, name: true, department: true }
        },
        deciderUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { proposedDate: 'desc' }
      ]
    });

    // 統計計算
    const stats = await calculateStats();

    console.log('[GET /api/decision-agendas] 取得完了:', {
      count: agendas.length,
      stats
    });

    // レスポンス
    return res.status(200).json({
      success: true,
      agendas: agendas.map(formatAgenda),
      stats
    });

  } catch (error: any) {
    console.error('[GET /api/decision-agendas] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '議題一覧の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/decision-agendas/:id
 * 決定会議議題詳細取得
 *
 * レスポンス:
 * {
 *   agenda: Agenda
 * }
 */
router.get('/decision-agendas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('[GET /api/decision-agendas/:id] 議題詳細取得:', { id });

    const agenda = await prisma.decisionMeetingAgenda.findUnique({
      where: { id },
      include: {
        proposerUser: {
          select: { id: true, name: true, department: true }
        },
        deciderUser: {
          select: { id: true, name: true }
        },
        relatedCommitteeAgenda: {
          select: { id: true, agendaTitle: true, status: true }
        }
      }
    });

    if (!agenda) {
      return res.status(404).json({
        success: false,
        error: '議題が見つかりません'
      });
    }

    console.log('[GET /api/decision-agendas/:id] 取得完了:', agenda.title);

    return res.status(200).json({
      success: true,
      agenda: formatAgenda(agenda)
    });

  } catch (error: any) {
    console.error('[GET /api/decision-agendas/:id] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '議題詳細の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/decision-agendas/:id/decide
 * 決定アクション（承認/却下/保留）
 *
 * リクエストボディ:
 * {
 *   action: 'approve' | 'reject' | 'defer',
 *   userId: string,
 *   notes?: string
 * }
 *
 * レスポンス:
 * {
 *   success: true,
 *   agenda: UpdatedAgenda,
 *   notification: NotificationInfo
 * }
 */
router.post('/decision-agendas/:id/decide', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, userId, notes } = req.body;

    // 1. バリデーション
    const validActions = ['approve', 'reject', 'defer'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'actionは approve, reject, defer のいずれかである必要があります'
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

    if (!hasDirectorPermission(Number(user.permissionLevel))) {
      return res.status(403).json({
        success: false,
        error: 'この操作にはレベル13以上の権限が必要です（院長・施設長）'
      });
    }

    // 3. 議題取得
    const agenda = await prisma.decisionMeetingAgenda.findUnique({
      where: { id },
      include: {
        proposerUser: {
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
      reject: 'rejected',
      defer: 'deferred'
    };

    console.log('[POST /api/decision-agendas/:id/decide] 決定処理開始:', {
      agendaId: id,
      agendaTitle: agenda.title.substring(0, 50),
      action,
      userId,
      notes: notes?.substring(0, 50)
    });

    // 5. 議題更新
    const updatedAgenda = await prisma.decisionMeetingAgenda.update({
      where: { id },
      data: {
        status: statusMap[action],
        decision: action,
        decidedDate: new Date(),
        decidedBy: user.name,
        deciderId: userId,
        decisionNotes: notes || null
      }
    });

    console.log('[POST /api/decision-agendas/:id/decide] 議題更新完了:', updatedAgenda.id);

    // 6. 通知作成（提案者に通知）
    const notificationTitles: Record<string, string> = {
      approve: '決定会議で議題が承認されました',
      reject: '決定会議で議題が却下されました',
      defer: '決定会議で議題が保留されました'
    };

    const notificationPriorities: Record<string, string> = {
      approve: 'normal',
      reject: 'high',
      defer: 'normal'
    };

    let notification = null;

    if (agenda.proposerUser) {
      notification = await prisma.notification.create({
        data: {
          category: 'decision_meeting',
          subcategory: 'decision_made',
          priority: notificationPriorities[action],
          title: notificationTitles[action],
          content: notes
            ? `議題「${agenda.title}」の決定:\n\n${notes}`
            : `議題「${agenda.title}」が${statusMap[action]}されました。`,
          target: 'individual',
          senderId: userId,
          status: 'pending',
          recipients: {
            create: {
              userId: agenda.proposerUser.id,
              isRead: false
            }
          }
        }
      });

      console.log('[POST /api/decision-agendas/:id/decide] 通知作成完了:', notification.id);
    }

    // 7. レスポンス
    return res.status(200).json({
      success: true,
      agenda: {
        id: updatedAgenda.id,
        title: updatedAgenda.title,
        status: updatedAgenda.status,
        decision: updatedAgenda.decision,
        decidedDate: updatedAgenda.decidedDate?.toISOString(),
        decidedBy: updatedAgenda.decidedBy,
        deciderId: updatedAgenda.deciderId,
        decisionNotes: updatedAgenda.decisionNotes
      },
      notification: notification ? {
        id: notification.id,
        recipientId: agenda.proposerUser!.id,
        recipientName: agenda.proposerUser!.name
      } : null
    });

  } catch (error: any) {
    console.error('[POST /api/decision-agendas/:id/decide] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '決定処理中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/decision-agendas/:id/start-review
 * 審議開始
 *
 * リクエストボディ:
 * {
 *   userId: string
 * }
 *
 * レスポンス:
 * {
 *   success: true,
 *   agenda: { id, status }
 * }
 */
router.post('/decision-agendas/:id/start-review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // 1. バリデーション
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

    if (!hasDirectorPermission(Number(user.permissionLevel))) {
      return res.status(403).json({
        success: false,
        error: 'この操作にはレベル13以上の権限が必要です'
      });
    }

    // 3. 議題更新
    const updatedAgenda = await prisma.decisionMeetingAgenda.update({
      where: { id },
      data: {
        status: 'in_review'
      }
    });

    console.log('[POST /api/decision-agendas/:id/start-review] 審議開始:', {
      agendaId: id,
      agendaTitle: updatedAgenda.title,
      userId
    });

    return res.status(200).json({
      success: true,
      agenda: {
        id: updatedAgenda.id,
        status: updatedAgenda.status
      }
    });

  } catch (error: any) {
    console.error('[POST /api/decision-agendas/:id/start-review] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '審議開始処理中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
