/**
 * 提案詳細取得API（レビュー情報付き）
 *
 * GET: 提案の詳細情報と最新のレビュー情報を取得
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
 * 提案詳細とレビュー情報を取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  postId: string
) {
  try {
    // 提案を取得（関連データを含む）
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true,
            permissionLevel: true
          }
        },
        poll: {
          include: {
            results: true,
            options: true
          }
        },
        proposalReviews: {
          where: {
            status: 'active'
          },
          orderBy: {
            reviewedAt: 'desc'
          },
          take: 1,
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

    // 投票数の集計
    const voteCount = {
      approve: 0,
      neutral: 0,
      oppose: 0,
      total: 0
    };

    if (post.poll?.results) {
      const results = post.poll.results as any[];
      voteCount.approve = results.find((r: any) => r.option?.text === '賛成')?.votes || 0;
      voteCount.neutral = results.find((r: any) => r.option?.text === '中立')?.votes || 0;
      voteCount.oppose = results.find((r: any) => r.option?.text === '反対')?.votes || 0;
      voteCount.total = voteCount.approve + voteCount.neutral + voteCount.oppose;
    }

    // レスポンスデータの構築
    const latestReview = post.proposalReviews[0] || null;

    const responseData = {
      success: true,
      post: {
        id: post.id,
        content: post.content,
        title: post.title,
        status: post.status,
        category: post.category,
        priority: post.priority,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),

        // 投票・スコア情報
        agendaScore: post.agendaScore || 0,
        voteCount,
        pollId: post.pollId,

        // 議題・承認情報
        agendaStatus: post.agendaStatus,
        agendaLevel: post.agendaLevel,
        agendaDecisionBy: post.agendaDecisionBy,
        agendaDecisionAt: post.agendaDecisionAt?.toISOString(),
        agendaDecisionReason: post.agendaDecisionReason,

        // 承認情報
        approvalStatus: post.approvalStatus,
        approvedBy: post.approvedBy,
        approvedAt: post.approvedAt?.toISOString(),

        // 却下情報
        rejectedBy: post.rejectedBy,
        rejectedAt: post.rejectedAt?.toISOString(),
        rejectionReason: post.rejectionReason,

        // 著者情報
        author: {
          id: post.author.id,
          name: post.author.name,
          department: post.author.department || '',
          permissionLevel: Number(post.author.permissionLevel)
        },

        // 最新レビュー情報（あれば）
        latestReview: latestReview ? {
          id: latestReview.id,
          action: latestReview.action,
          reason: latestReview.reason,
          comment: latestReview.comment,
          reviewedAt: latestReview.reviewedAt.toISOString(),
          agendaScoreAtReview: latestReview.agendaScoreAtReview,
          voteCountAtReview: latestReview.voteCountAtReview,
          reviewer: {
            id: latestReview.reviewer.id,
            name: latestReview.reviewer.name,
            department: latestReview.reviewer.department || '',
            permissionLevel: Number(latestReview.reviewer.permissionLevel)
          }
        } : null
      }
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('[Post Detail API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
