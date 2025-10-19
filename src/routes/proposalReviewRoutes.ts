/**
 * 提案レビューAPIルート
 * 部署議題モード - 主任・師長の承認/却下処理
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../api/middleware/auth';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/proposal-review/:postId
 * 提案のレビュー（承認/施設昇格/却下）
 */
router.post(
  '/:postId',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const { action, reason, comment } = req.body;
      const reviewerId = req.user?.staffId;

      console.log(`[ProposalReview] postId=${postId}, action=${action}, reviewer=${reviewerId}`);

      // バリデーション
      if (!reviewerId) {
        return res.status(401).json({
          success: false,
          error: '認証が必要です'
        });
      }

      if (!action) {
        return res.status(400).json({
          success: false,
          error: 'アクションを指定してください'
        });
      }

      if (!['approve_as_dept_agenda', 'escalate_to_facility', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: '無効なアクションです'
        });
      }

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: '判断理由は10文字以上入力してください'
        });
      }

      // レビュアー情報取得
      const reviewer = await prisma.user.findUnique({
        where: { id: reviewerId },
        select: {
          id: true,
          name: true,
          department: true,
          permissionLevel: true,
          facilityId: true
        }
      });

      if (!reviewer) {
        return res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません'
        });
      }

      // 権限チェック（主任以上: LEVEL_5+）
      if (!reviewer.permissionLevel || Number(reviewer.permissionLevel) < 5) {
        return res.status(403).json({
          success: false,
          error: 'この操作を行う権限がありません'
        });
      }

      // 提案取得
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true
            }
          }
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          error: '提案が見つかりません'
        });
      }

      // アクション別処理
      let result;
      switch (action) {
        case 'approve_as_dept_agenda':
          result = await handleApproveDeptAgenda(post, reviewer, reason, comment);
          break;

        case 'escalate_to_facility':
          result = await handleEscalateToFacility(post, reviewer, reason);
          break;

        case 'reject':
          result = await handleReject(post, reviewer, reason);
          break;

        default:
          return res.status(400).json({
            success: false,
            error: '無効なアクションです'
          });
      }

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('[ProposalReview] エラー:', error);
      res.status(500).json({
        success: false,
        error: 'サーバーエラーが発生しました',
        details: error.message
      });
    }
  }
);

/**
 * 部署議題として承認
 */
async function handleApproveDeptAgenda(
  post: any,
  reviewer: any,
  reason: string,
  comment?: string
): Promise<any> {
  console.log(`[handleApproveDeptAgenda] postId=${post.id}`);

  // 1. 投稿ステータス更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaStatus: 'APPROVED_AS_DEPT_AGENDA',
      agendaDecisionBy: reviewer.id,
      agendaDecisionAt: new Date(),
      agendaDecisionReason: reason,
      updatedAt: new Date()
    }
  });

  // 2. ProposalDocument自動生成
  const document = await prisma.proposalDocument.create({
    data: {
      postId: post.id,
      title: post.content.substring(0, 100),
      background: `この提案は部署内で${post.agendaScore || 0}点のスコアを獲得し、部署議題として承認されました。`,
      objectives: '（記入してください）',
      expectedEffects: '（記入してください）',
      implementationPlan: '（記入してください）',
      status: 'draft',
      creatorId: reviewer.id
    }
  });

  // 3. 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'proposal_approved',
      title: '部署議題として承認されました',
      message: `あなたの提案「${post.content.substring(0, 50)}...」が部署議題として承認されました。\n\n承認理由:\n${reason}\n\n${comment ? `コメント:\n${comment}` : ''}`,
      relatedPostId: post.id,
      senderId: reviewer.id
    }
  });

  // 4. 部署全員への通知
  const deptUsers = await prisma.user.findMany({
    where: {
      department: post.department,
      isRetired: false
    },
    select: { id: true }
  });

  await Promise.all(deptUsers.map(user =>
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'dept_agenda_announced',
        title: '部署議題が正式決定しました',
        message: `「${post.content.substring(0, 50)}...」が部署の正式議題になりました。\n\n${comment || ''}`,
        relatedPostId: post.id,
        senderId: reviewer.id
      }
    })
  ));

  console.log(`[handleApproveDeptAgenda] 完了: documentId=${document.id}, 通知送信=${deptUsers.length}件`);

  return {
    message: '部署議題として承認されました',
    documentId: document.id,
    notificationsSent: deptUsers.length
  };
}

/**
 * 施設議題に昇格
 */
async function handleEscalateToFacility(
  post: any,
  reviewer: any,
  reason: string
): Promise<any> {
  console.log(`[handleEscalateToFacility] postId=${post.id}`);

  // 新しい投票期限（7日後）
  const newDeadline = new Date();
  newDeadline.setDate(newDeadline.getDate() + 7);

  // 1. 投稿ステータス・レベル更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaLevel: 'escalated_to_facility',
      agendaStatus: 'PENDING_DEPUTY_DIRECTOR_REVIEW',
      agendaDecisionBy: reviewer.id,
      agendaDecisionAt: new Date(),
      agendaDecisionReason: reason,
      agendaVotingDeadline: newDeadline,
      // 投稿公開範囲を施設内に拡大
      visibility: 'facility',
      updatedAt: new Date()
    }
  });

  // 2. ProposalDocument自動生成（施設レベル用）
  const document = await prisma.proposalDocument.create({
    data: {
      postId: post.id,
      title: post.content.substring(0, 100),
      background: `この提案は部署内で${post.agendaScore || 0}点を獲得し、${reviewer.name}により施設議題に昇格されました。`,
      objectives: '（記入してください）',
      expectedEffects: '（記入してください）',
      implementationPlan: '（記入してください）',
      status: 'draft',
      creatorId: reviewer.id
    }
  });

  // 3. 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'escalated_to_facility',
      title: '施設議題に昇格しました',
      message: `あなたの提案「${post.content.substring(0, 50)}...」が施設議題に昇格しました。\n\n昇格理由:\n${reason}`,
      relatedPostId: post.id,
      senderId: reviewer.id
    }
  });

  // 4. 副看護部長/看護部長への通知
  const deputyDirectors = await prisma.user.findMany({
    where: {
      permissionLevel: { gte: 8 },
      facilityId: post.facilityId,
      isRetired: false
    },
    select: { id: true }
  });

  await Promise.all(deputyDirectors.map(user =>
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'facility_agenda_review_required',
        title: '施設議題の承認依頼',
        message: `「${post.content.substring(0, 50)}...」が施設議題に昇格しました。委員会提出の承認/却下を判断してください。`,
        relatedPostId: post.id,
        senderId: reviewer.id
      }
    })
  ));

  // 5. 施設内全職員への通知
  const facilityUsers = await prisma.user.findMany({
    where: {
      facilityId: post.facilityId,
      isRetired: false
    },
    select: { id: true }
  });

  await Promise.all(facilityUsers.map(user =>
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'facility_agenda_announced',
        title: '新しい施設議題',
        message: `「${post.content.substring(0, 50)}...」が施設議題になりました。投票期限: ${newDeadline.toLocaleDateString('ja-JP')}まで`,
        relatedPostId: post.id,
        senderId: reviewer.id
      }
    })
  ));

  console.log(`[handleEscalateToFacility] 完了: documentId=${document.id}, 管理者通知=${deputyDirectors.length}件, 全体通知=${facilityUsers.length}件`);

  return {
    message: '施設議題に昇格しました',
    documentId: document.id,
    newDeadline: newDeadline.toISOString(),
    notificationsSent: deputyDirectors.length + facilityUsers.length
  };
}

/**
 * 却下
 */
async function handleReject(
  post: any,
  reviewer: any,
  reason: string
): Promise<any> {
  console.log(`[handleReject] postId=${post.id}`);

  // 師長以上かどうかで却下理由を分ける
  const isManager = Number(reviewer.permissionLevel) >= 7;
  const rejectionStatus = isManager ? 'REJECTED_BY_MANAGER' : 'REJECTED_BY_SUPERVISOR';

  // 1. 投稿ステータス更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaStatus: rejectionStatus,
      agendaDecisionBy: reviewer.id,
      agendaDecisionAt: new Date(),
      agendaDecisionReason: reason,
      visibility: 'private', // 投稿者のみ閲覧可能
      updatedAt: new Date()
    }
  });

  // 2. 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'proposal_rejected',
      title: '投稿が却下されました',
      message: `あなたの提案「${post.content.substring(0, 50)}...」は却下されました。\n\n却下理由:\n${reason}`,
      relatedPostId: post.id,
      senderId: reviewer.id
    }
  });

  console.log(`[handleReject] 完了: status=${rejectionStatus}`);

  return {
    message: '提案を却下しました',
    status: rejectionStatus
  };
}

export default router;
