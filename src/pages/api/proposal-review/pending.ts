/**
 * 未処理提案一覧取得API
 *
 * GET: レビュー待ちの提案一覧を取得（50点以上でまだ判断されていない提案）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  return res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed'
  });
}

/**
 * レビュー待ちの提案一覧を取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      department,
      minScore = '50',
      limit = '50',
      offset = '0',
      sortBy = 'agendaScore',
      sortOrder = 'desc'
    } = req.query;

    // クエリパラメータのパース
    const minScoreNum = parseInt(minScore as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // 最大100件
    const offsetNum = parseInt(offset as string, 10);

    if (isNaN(minScoreNum) || isNaN(limitNum) || isNaN(offsetNum)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'クエリパラメータが不正です'
      });
    }

    // 検索条件の構築
    const whereConditions: any = {
      agendaScore: {
        gte: minScoreNum
      },
      status: {
        in: ['published', 'active'] // 公開中または有効な提案のみ
      },
      agendaStatus: {
        in: [null, 'PENDING', 'UNDER_REVIEW'] // 未判断または審査中
      }
    };

    // 部署フィルター（オプション）
    if (department && typeof department === 'string') {
      whereConditions.author = {
        department: department
      };
    }

    // ソート条件の構築
    const validSortFields = ['agendaScore', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'agendaScore';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: any = {};
    orderBy[sortField] = orderDirection;

    // 総数を取得
    const totalCount = await prisma.post.count({
      where: whereConditions
    });

    // 提案を取得
    const posts = await prisma.post.findMany({
      where: whereConditions,
      orderBy,
      skip: offsetNum,
      take: limitNum,
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
            results: true
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
          select: {
            id: true,
            action: true,
            reviewedAt: true,
            reviewer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // レスポンスデータの構築
    const pendingProposals = posts.map(post => {
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

      // 賛成率の計算
      const approvalRate = voteCount.total > 0
        ? Math.round((voteCount.approve / voteCount.total) * 100)
        : 0;

      return {
        id: post.id,
        title: post.title,
        content: post.content?.substring(0, 200) + (post.content && post.content.length > 200 ? '...' : ''), // 要約
        category: post.category,
        priority: post.priority,
        agendaScore: post.agendaScore || 0,
        agendaStatus: post.agendaStatus,
        agendaLevel: post.agendaLevel,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        voteCount,
        approvalRate,
        author: {
          id: post.author.id,
          name: post.author.name,
          department: post.author.department || '',
          permissionLevel: Number(post.author.permissionLevel)
        },
        latestReview: post.proposalReviews[0] || null
      };
    });

    // スコア分布の計算
    const scoreDistribution = {
      '50-99': posts.filter(p => (p.agendaScore || 0) >= 50 && (p.agendaScore || 0) < 100).length,
      '100-199': posts.filter(p => (p.agendaScore || 0) >= 100 && (p.agendaScore || 0) < 200).length,
      '200-299': posts.filter(p => (p.agendaScore || 0) >= 200 && (p.agendaScore || 0) < 300).length,
      '300+': posts.filter(p => (p.agendaScore || 0) >= 300).length
    };

    return res.status(200).json({
      success: true,
      proposals: pendingProposals,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalCount
      },
      filters: {
        department: department || null,
        minScore: minScoreNum,
        sortBy: sortField,
        sortOrder: orderDirection
      },
      statistics: {
        totalPending: totalCount,
        scoreDistribution
      }
    });

  } catch (error) {
    console.error('[Pending Proposals API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
