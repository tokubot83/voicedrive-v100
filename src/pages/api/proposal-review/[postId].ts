/**
 * 提案レビュー判断API
 *
 * POST: 提案に対する判断を記録
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { postId } = req.query;

  if (typeof postId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: '提案IDが不正です'
    });
  }

  if (req.method === 'POST') {
    return handlePost(req, res, postId);
  }

  return res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed'
  });
}

/**
 * 提案レビュー判断を記録
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  postId: string
) {
  try {
    const { action, reason, comment, reviewerId } = req.body;

    // バリデーション
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '判断を選択してください',
        details: { field: 'action' }
      });
    }

    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '判断理由を入力してください',
        details: { field: 'reason' }
      });
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'REASON_TOO_SHORT',
        message: '判断理由は10文字以上入力してください',
        details: {
          field: 'reason',
          minLength: 10,
          currentLength: trimmedReason.length
        }
      });
    }

    if (trimmedReason.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'REASON_TOO_LONG',
        message: '判断理由は500文字以内で入力してください',
        details: {
          field: 'reason',
          maxLength: 500,
          currentLength: trimmedReason.length
        }
      });
    }

    if (comment && comment.length > 300) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'コメントは300文字以内で入力してください',
        details: {
          field: 'comment',
          maxLength: 300,
          currentLength: comment.length
        }
      });
    }

    const validActions = ['approve_as_dept_agenda', 'escalate_to_facility', 'reject'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ACTION',
        message: '判断内容が不正です',
        details: {
          field: 'action',
          validValues: validActions
        }
      });
    }

    if (!reviewerId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'レビュー実施者IDが必要です',
        details: { field: 'reviewerId' }
      });
    }

    // レビュー実施者の取得と権限チェック
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId }
    });

    if (!reviewer) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'レビュー実施者が見つかりません'
      });
    }

    if (Number(reviewer.permissionLevel) < 5.0) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSION',
        message: 'この操作には主任以上の権限が必要です',
        details: {
          required: 5.0,
          current: Number(reviewer.permissionLevel)
        }
      });
    }

    // 提案の取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        poll: true,
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
        error: 'POST_NOT_FOUND',
        message: '提案が見つかりません'
      });
    }

    // スコアチェック（50点以上でレビュー可能）
    if ((post.agendaScore || 0) < 50) {
      return res.status(409).json({
        success: false,
        error: 'SCORE_NOT_REACHED',
        message: 'この提案はまだレビュー対象ではありません（50点未到達）',
        details: {
          currentScore: post.agendaScore || 0,
          requiredScore: 50
        }
      });
    }

    // 投票数の集計
    const voteCount = {
      approve: 0,
      neutral: 0,
      oppose: 0
    };

    if (post.poll?.results) {
      const results = post.poll.results as any[];
      voteCount.approve = results.find((r: any) => r.option?.text === '賛成')?.votes || 0;
      voteCount.neutral = results.find((r: any) => r.option?.text === '中立')?.votes || 0;
      voteCount.oppose = results.find((r: any) => r.option?.text === '反対')?.votes || 0;
    }

    // ProposalReview作成
    const review = await prisma.proposalReview.create({
      data: {
        postId,
        reviewerId,
        action,
        reason: trimmedReason,
        comment: comment?.trim(),
        agendaScoreAtReview: post.agendaScore || 0,
        voteCountAtReview: voteCount,
        reviewerPermissionLevel: reviewer.permissionLevel,
        reviewerDepartment: reviewer.department || '',
        status: 'active'
      }
    });

    // Post更新
    const agendaStatusMap: Record<string, string> = {
      'approve_as_dept_agenda': 'APPROVED_AS_DEPT_AGENDA',
      'escalate_to_facility': 'ESCALATED_TO_FACILITY',
      'reject': 'REJECTED'
    };

    const updateData: any = {
      agendaStatus: agendaStatusMap[action],
      agendaDecisionBy: reviewerId,
      agendaDecisionAt: new Date(),
      agendaDecisionReason: trimmedReason
    };

    // アクション別の追加更新
    if (action === 'escalate_to_facility') {
      updateData.agendaLevel = 'facility';
    } else if (action === 'reject') {
      updateData.status = 'archived';
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = reviewerId;
      updateData.rejectionReason = trimmedReason;
    } else if (action === 'approve_as_dept_agenda') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = reviewerId;
      updateData.approvalStatus = 'approved';
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData
    });

    console.log(`[ProposalReview] ${action} by ${reviewer.name} for post ${postId}`);

    return res.status(200).json({
      success: true,
      review: {
        id: review.id,
        postId: review.postId,
        action: review.action,
        reason: review.reason,
        comment: review.comment,
        reviewedAt: review.reviewedAt.toISOString(),
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          permissionLevel: Number(reviewer.permissionLevel),
          department: reviewer.department || ''
        }
      },
      post: {
        id: updatedPost.id,
        agendaStatus: updatedPost.agendaStatus,
        agendaDecisionBy: updatedPost.agendaDecisionBy,
        agendaDecisionAt: updatedPost.agendaDecisionAt?.toISOString(),
        agendaDecisionReason: updatedPost.agendaDecisionReason
      },
      message: '判断を記録しました'
    });

  } catch (error) {
    console.error('[ProposalReview API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
