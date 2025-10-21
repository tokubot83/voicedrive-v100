/**
 * 提案決定API（却下・保留・部署案件化）
 * 作成日: 2025年10月21日
 *
 * エンドポイント:
 * - POST /api/agenda/:postId/reject - 提案を却下
 * - POST /api/agenda/:postId/hold - 提案を保留
 * - POST /api/agenda/:postId/department-matter - 部署案件化
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * 権限チェック: 投票期限が切れているか
 */
function isDeadlineExpired(deadline: Date | null): boolean {
  if (!deadline) return false;
  return new Date() > deadline;
}

/**
 * 権限チェック: ユーザーが指定された議題レベルに対する権限を持つか
 */
function hasPermissionForLevel(
  permissionLevel: number,
  agendaLevel: string
): { allowed: boolean; reason?: string } {
  const levelRequirements: Record<string, number> = {
    PENDING: 5,
    DEPT_REVIEW: 6,
    DEPT_AGENDA: 8,
    FACILITY_AGENDA: 10,
    CORP_REVIEW: 12,
    CORP_AGENDA: 13
  };

  const requiredLevel = levelRequirements[agendaLevel];
  if (!requiredLevel) {
    return { allowed: false, reason: '無効な議題レベルです' };
  }

  if (permissionLevel < requiredLevel) {
    return {
      allowed: false,
      reason: `このレベルの決定にはレベル${requiredLevel}以上の権限が必要です`
    };
  }

  return { allowed: true };
}

/**
 * POST /api/agenda/:postId/reject
 * 提案を却下
 *
 * リクエストボディ:
 * {
 *   feedback: string,      // 却下理由（必須）
 *   userId: string,        // 決定者ID（必須）
 *   agendaLevel: string    // 現在の議題レベル（必須）
 * }
 */
router.post('/:postId/reject', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { feedback, userId, agendaLevel } = req.body;

    // 1. バリデーション
    if (!feedback || !userId || !agendaLevel) {
      return res.status(400).json({
        success: false,
        error: '必須フィールドが不足しています（feedback, userId, agendaLevel）'
      });
    }

    // 2. 投稿取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '投稿が見つかりません'
      });
    }

    // 3. ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    // 4. 期限チェック
    if (!isDeadlineExpired(post.agendaVotingDeadline)) {
      return res.status(400).json({
        success: false,
        error: '投票期限が切れていません。期限後に却下できます。'
      });
    }

    // 5. 権限チェック
    const permission = hasPermissionForLevel(
      Number(user.permissionLevel),
      agendaLevel
    );

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        error: permission.reason || '権限がありません'
      });
    }

    console.log('[POST /api/agenda/:postId/reject] 却下処理開始:', {
      postId,
      userId,
      agendaLevel,
      feedback: feedback.substring(0, 50)
    });

    // 6. 決定レコード作成
    const decision = await prisma.proposalDecision.create({
      data: {
        postId: post.id,
        decisionType: 'reject',
        agendaLevel: agendaLevel,
        decidedBy: userId,
        reason: feedback
      }
    });

    console.log('[POST /api/agenda/:postId/reject] ProposalDecision作成完了:', decision.id);

    // 7. 通知作成（投稿者へ）
    const notification = await prisma.notification.create({
      data: {
        category: 'proposal',
        subcategory: 'rejected',
        priority: 'high',
        title: '提案が却下されました',
        content: `あなたの提案「${post.content.substring(0, 30)}...」が却下されました。\n\n理由: ${feedback}`,
        target: post.authorId,
        senderId: userId,
        status: 'pending'
      }
    });

    console.log('[POST /api/agenda/:postId/reject] 通知作成完了:', notification.id);

    // 8. レスポンス
    return res.status(200).json({
      success: true,
      decision: {
        id: decision.id,
        postId: decision.postId,
        decisionType: decision.decisionType,
        agendaLevel: decision.agendaLevel,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt.toISOString(),
        reason: decision.reason
      },
      notification: {
        id: notification.id,
        recipientId: notification.target,
        message: notification.content
      }
    });

  } catch (error: any) {
    console.error('[POST /api/agenda/:postId/reject] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '却下処理中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/agenda/:postId/hold
 * 提案を保留
 *
 * リクエストボディ:
 * {
 *   feedback: string,       // 保留理由（必須）
 *   userId: string,         // 決定者ID（必須）
 *   agendaLevel: string,    // 現在の議題レベル（必須）
 *   reviewDate?: string     // 再検討予定日（ISO 8601、オプション）
 * }
 */
router.post('/:postId/hold', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { feedback, userId, agendaLevel, reviewDate } = req.body;

    // 1. バリデーション
    if (!feedback || !userId || !agendaLevel) {
      return res.status(400).json({
        success: false,
        error: '必須フィールドが不足しています（feedback, userId, agendaLevel）'
      });
    }

    // 2. 投稿取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '投稿が見つかりません'
      });
    }

    // 3. ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    // 4. 期限チェック
    if (!isDeadlineExpired(post.agendaVotingDeadline)) {
      return res.status(400).json({
        success: false,
        error: '投票期限が切れていません。期限後に保留できます。'
      });
    }

    // 5. 権限チェック
    const permission = hasPermissionForLevel(
      Number(user.permissionLevel),
      agendaLevel
    );

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        error: permission.reason || '権限がありません'
      });
    }

    console.log('[POST /api/agenda/:postId/hold] 保留処理開始:', {
      postId,
      userId,
      agendaLevel,
      reviewDate
    });

    // 6. 決定レコード作成
    const decision = await prisma.proposalDecision.create({
      data: {
        postId: post.id,
        decisionType: 'hold',
        agendaLevel: agendaLevel,
        decidedBy: userId,
        reason: feedback,
        reviewDate: reviewDate ? new Date(reviewDate) : null
      }
    });

    console.log('[POST /api/agenda/:postId/hold] ProposalDecision作成完了:', decision.id);

    // 7. 投稿者へ通知
    const reviewDateText = reviewDate
      ? `\n\n再検討予定日: ${new Date(reviewDate).toLocaleDateString('ja-JP')}`
      : '';

    await prisma.notification.create({
      data: {
        category: 'proposal',
        subcategory: 'on_hold',
        priority: 'medium',
        title: '提案が保留されました',
        content: `あなたの提案「${post.content.substring(0, 30)}...」が一時保留されました。\n\n理由: ${feedback}${reviewDateText}`,
        target: post.authorId,
        senderId: userId,
        status: 'pending'
      }
    });

    // 8. 再検討期限通知スケジュール（reviewDateが指定されている場合）
    let notificationSchedule;
    if (reviewDate) {
      const reviewDeadline = new Date(reviewDate);
      reviewDeadline.setDate(reviewDeadline.getDate() - 1); // 1日前に通知

      // TODO: NotificationScheduleテーブルがある場合の実装
      // notificationSchedule = await prisma.notificationSchedule.create({...});
      console.log('[POST /api/agenda/:postId/hold] 再検討通知予定:', reviewDeadline.toISOString());
    }

    // 9. レスポンス
    return res.status(200).json({
      success: true,
      decision: {
        id: decision.id,
        postId: decision.postId,
        decisionType: decision.decisionType,
        agendaLevel: decision.agendaLevel,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt.toISOString(),
        reason: decision.reason,
        reviewDate: decision.reviewDate?.toISOString()
      }
    });

  } catch (error: any) {
    console.error('[POST /api/agenda/:postId/hold] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '保留処理中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/agenda/:postId/department-matter
 * 部署案件化
 *
 * リクエストボディ:
 * {
 *   feedback: string,           // 部署案件化理由（必須）
 *   userId: string,             // 決定者ID（必須）
 *   agendaLevel: string,        // 現在の議題レベル（必須）
 *   targetDepartment: string,   // 対象部署（必須）
 *   assignedTo?: string         // 担当リーダーID（オプション）
 * }
 */
router.post('/:postId/department-matter', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { feedback, userId, agendaLevel, targetDepartment, assignedTo } = req.body;

    // 1. バリデーション
    if (!feedback || !userId || !agendaLevel || !targetDepartment) {
      return res.status(400).json({
        success: false,
        error: '必須フィールドが不足しています（feedback, userId, agendaLevel, targetDepartment）'
      });
    }

    // 2. レベルチェック: DEPT_REVIEW または DEPT_AGENDA のみ許可
    if (agendaLevel !== 'DEPT_REVIEW' && agendaLevel !== 'DEPT_AGENDA') {
      return res.status(400).json({
        success: false,
        error: '部署案件化は部署レベル（DEPT_REVIEW/DEPT_AGENDA）でのみ可能です'
      });
    }

    // 3. 投稿取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '投稿が見つかりません'
      });
    }

    // 4. ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    // 5. 期限チェック
    if (!isDeadlineExpired(post.agendaVotingDeadline)) {
      return res.status(400).json({
        success: false,
        error: '投票期限が切れていません。期限後に部署案件化できます。'
      });
    }

    // 6. 権限チェック
    const permission = hasPermissionForLevel(
      Number(user.permissionLevel),
      agendaLevel
    );

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        error: permission.reason || '権限がありません'
      });
    }

    console.log('[POST /api/agenda/:postId/department-matter] 部署案件化開始:', {
      postId,
      userId,
      targetDepartment,
      assignedTo
    });

    // 7. 決定レコード作成
    const decision = await prisma.proposalDecision.create({
      data: {
        postId: post.id,
        decisionType: 'department_matter',
        agendaLevel: agendaLevel,
        decidedBy: userId,
        reason: feedback,
        targetDepartment: targetDepartment,
        assignedTo: assignedTo || null
      }
    });

    console.log('[POST /api/agenda/:postId/department-matter] ProposalDecision作成完了:', decision.id);

    // 8. 投稿者へ通知
    await prisma.notification.create({
      data: {
        category: 'proposal',
        subcategory: 'department_matter',
        priority: 'medium',
        title: '提案が部署案件化されました',
        content: `あなたの提案「${post.content.substring(0, 30)}...」が部署ミーティング案件として処理されます。\n\n対象部署: ${targetDepartment}\n理由: ${feedback}`,
        target: post.authorId,
        senderId: userId,
        status: 'pending'
      }
    });

    // 9. 担当リーダーへ通知（assignedToが指定されている場合）
    let leaderNotification;
    if (assignedTo) {
      leaderNotification = await prisma.notification.create({
        data: {
          category: 'proposal',
          subcategory: 'department_matter_assigned',
          priority: 'high',
          title: '新しい部署ミーティング案件',
          content: `新しい部署ミーティング案件が割り当てられました。\n\n提案: ${post.content.substring(0, 50)}...\n提案者: ${post.author.name}`,
          target: assignedTo,
          senderId: userId,
          status: 'pending'
        }
      });

      console.log('[POST /api/agenda/:postId/department-matter] リーダー通知作成:', leaderNotification.id);
    }

    // 10. レスポンス
    return res.status(200).json({
      success: true,
      decision: {
        id: decision.id,
        postId: decision.postId,
        decisionType: decision.decisionType,
        agendaLevel: decision.agendaLevel,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt.toISOString(),
        reason: decision.reason,
        targetDepartment: decision.targetDepartment,
        assignedTo: decision.assignedTo
      },
      notification: leaderNotification ? {
        id: leaderNotification.id,
        recipientId: leaderNotification.target,
        message: leaderNotification.content
      } : undefined
    });

  } catch (error: any) {
    console.error('[POST /api/agenda/:postId/department-matter] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '部署案件化処理中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
