/**
 * 提案レビュー履歴取得API
 *
 * GET: 提案に対する全てのレビュー履歴を取得
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

  if (req.method === 'GET') {
    return handleGet(req, res, postId);
  }

  return res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed'
  });
}

/**
 * 提案のレビュー履歴を取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  postId: string
) {
  try {
    // 提案の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        agendaScore: true,
        status: true
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'POST_NOT_FOUND',
        message: '提案が見つかりません'
      });
    }

    // レビュー履歴を取得（新しい順）
    const reviews = await prisma.proposalReview.findMany({
      where: {
        postId
      },
      orderBy: {
        reviewedAt: 'desc'
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            department: true,
            permissionLevel: true
          }
        }
      }
    });

    // レスポンスデータの構築
    const reviewHistory = reviews.map(review => ({
      id: review.id,
      action: review.action,
      reason: review.reason,
      comment: review.comment,
      reviewedAt: review.reviewedAt.toISOString(),
      agendaScoreAtReview: review.agendaScoreAtReview,
      voteCountAtReview: review.voteCountAtReview,
      status: review.status,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name,
        department: review.reviewer.department || '',
        permissionLevel: Number(review.reviewer.permissionLevel)
      }
    }));

    // アクション別のサマリー情報
    const summary = {
      total: reviews.length,
      byAction: {
        approve_as_dept_agenda: reviews.filter(r => r.action === 'approve_as_dept_agenda').length,
        escalate_to_facility: reviews.filter(r => r.action === 'escalate_to_facility').length,
        reject: reviews.filter(r => r.action === 'reject').length
      },
      byStatus: {
        active: reviews.filter(r => r.status === 'active').length,
        superseded: reviews.filter(r => r.status === 'superseded').length
      }
    };

    return res.status(200).json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        agendaScore: post.agendaScore || 0,
        status: post.status
      },
      reviews: reviewHistory,
      summary
    });

  } catch (error) {
    console.error('[Proposal Review History API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
