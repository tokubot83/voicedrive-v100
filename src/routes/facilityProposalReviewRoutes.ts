/**
 * 施設議題レビューAPIルート
 * 副看護部長/看護部長の承認/却下処理（100点到達時）
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../api/middleware/auth';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/facility-proposal-review/:postId
 * 施設議題のレビュー（委員会提出承認/却下）
 */
router.post(
  '/:postId',
  standardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const { action, reason } = req.body;
      const reviewerId = req.user?.staffId;

      console.log(`[FacilityProposalReview] postId=${postId}, action=${action}, reviewer=${reviewerId}`);

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

      if (!['approve_for_committee', 'reject'].includes(action)) {
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

      // 権限チェック（副看護部長/看護部長: LEVEL_8+）
      if (!reviewer.permissionLevel || Number(reviewer.permissionLevel) < 8) {
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
        case 'approve_for_committee':
          result = await handleApproveForCommittee(post, reviewer, reason);
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
      console.error('[FacilityProposalReview] エラー:', error);
      res.status(500).json({
        success: false,
        error: 'サーバーエラーが発生しました',
        details: error.message
      });
    }
  }
);

/**
 * 委員会提出を承認
 */
async function handleApproveForCommittee(
  post: any,
  reviewer: any,
  reason: string
): Promise<any> {
  console.log(`[handleApproveForCommittee] postId=${post.id}`);

  // 1. 投稿ステータス更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaStatus: 'APPROVED_FOR_COMMITTEE',
      agendaDecisionBy: reviewer.id,
      agendaDecisionAt: new Date(),
      agendaDecisionReason: reason,
      updatedAt: new Date()
    }
  });

  // 2. ProposalDocument更新（既存のドキュメントがある場合は更新）
  const existingDocument = await prisma.proposalDocument.findFirst({
    where: { postId: post.id }
  });

  if (existingDocument) {
    await prisma.proposalDocument.update({
      where: { id: existingDocument.id },
      data: {
        status: 'approved',
        updatedAt: new Date()
      }
    });
  } else {
    // 存在しない場合は新規作成
    await prisma.proposalDocument.create({
      data: {
        postId: post.id,
        title: post.content.substring(0, 100),
        background: `この提案は施設内で${post.agendaScore || 0}点のスコアを獲得し、委員会提出が承認されました。`,
        objectives: '（記入してください）',
        expectedEffects: '（記入してください）',
        implementationPlan: '（記入してください）',
        status: 'approved',
        creatorId: reviewer.id
      }
    });
  }

  // 3. 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'proposal_approved',
      title: '委員会提出が承認されました',
      message: `あなたの提案「${post.content.substring(0, 50)}...」が委員会提出を承認されました。\n\n承認理由:\n${reason}`,
      relatedPostId: post.id,
      senderId: reviewer.id
    }
  });

  // 4. 施設内全職員への通知
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
        type: 'facility_agenda_approved',
        title: '施設議題が委員会提出されました',
        message: `「${post.content.substring(0, 50)}...」が正式に委員会に提出されました。`,
        relatedPostId: post.id,
        senderId: reviewer.id
      }
    })
  ));

  console.log(`[handleApproveForCommittee] 完了: 通知送信=${facilityUsers.length}件`);

  return {
    message: '委員会提出を承認しました',
    notificationsSent: facilityUsers.length
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

  // 1. 投稿ステータス更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaStatus: 'REJECTED_BY_DEPUTY_DIRECTOR',
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
      title: '施設議題が却下されました',
      message: `あなたの提案「${post.content.substring(0, 50)}...」は委員会提出が却下されました。\n\n却下理由:\n${reason}`,
      relatedPostId: post.id,
      senderId: reviewer.id
    }
  });

  console.log(`[handleReject] 完了`);

  return {
    message: '提案を却下しました',
    status: 'REJECTED_BY_DEPUTY_DIRECTOR'
  };
}

export default router;
