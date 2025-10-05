// Post Reports API Endpoints
// 投稿通報システムのAPIエンドポイント

import { Request, Response } from 'express';
import { getPrismaClient } from '../lib/prisma-safe';

/**
 * 投稿を通報する
 * POST /api/posts/:postId/report
 */
export const reportPost = async (req: Request, res: Response) => {
  const prisma = await getPrismaClient();

  // Vercel環境の場合はエラーを返す
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'データベース接続が利用できません（Vercel環境）'
    });
  }

  try {
    const { postId } = req.params;
    const { reporterId, reporterName, reportType, description } = req.body;

    // 必須パラメータの検証
    if (!postId || !reporterId || !reportType) {
      return res.status(400).json({
        success: false,
        message: '必須パラメータが不足しています'
      });
    }

    // 重複通報のチェック
    const existingReport = await prisma.postReport.findFirst({
      where: {
        postId,
        reporterId,
        status: 'pending'
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'この投稿は既に通報済みです'
      });
    }

    // 通報を作成
    const report = await prisma.postReport.create({
      data: {
        postId,
        reporterId,
        reporterName,
        reportType,
        description,
        status: 'pending'
      }
    });

    // 同じ投稿への通報数を確認
    const reportCount = await prisma.postReport.count({
      where: {
        postId,
        status: 'pending'
      }
    });

    // 閾値チェックとアラート生成
    await checkThresholdAndCreateAlert(postId, reportCount);

    return res.status(201).json({
      success: true,
      message: '通報を受け付けました。確認後、適切に対応いたします。',
      reportId: report.id
    });
  } catch (error) {
    console.error('通報エラー:', error);
    return res.status(500).json({
      success: false,
      message: '通報の処理中にエラーが発生しました'
    });
  }
};

/**
 * 閾値チェックとアラート生成
 */
const checkThresholdAndCreateAlert = async (postId: string, reportCount: number) => {
  const THRESHOLDS = {
    low: 1,
    medium: 3,
    high: 5,
    critical: 10
  };

  let severity: string = '';
  let message: string = '';

  if (reportCount >= THRESHOLDS.critical) {
    severity = 'critical';
    message = `🚨 重大: ${reportCount}件の通報があります。即座の対応が必要です`;
  } else if (reportCount >= THRESHOLDS.high) {
    severity = 'high';
    message = `⚠️ 緊急: ${reportCount}件の通報があります。優先的な確認が必要です`;
  } else if (reportCount >= THRESHOLDS.medium) {
    severity = 'medium';
    message = `⚡ 警告: ${reportCount}件の通報があります。確認をお願いします`;
  } else if (reportCount >= THRESHOLDS.low) {
    severity = 'low';
    message = `📌 注意: ${reportCount}件の通報があります`;
  }

  if (severity) {
    // 既存のアラートを確認
    const existingAlert = await prisma.postReportAlert.findUnique({
      where: { postId }
    });

    // 最頻出の通報タイプを取得
    const reportTypes = await prisma.postReport.groupBy({
      by: ['reportType'],
      where: {
        postId,
        status: 'pending'
      },
      _count: true,
      orderBy: {
        _count: {
          reportType: 'desc'
        }
      },
      take: 1
    });

    const dominantReportType = reportTypes[0]?.reportType || 'other';

    if (existingAlert) {
      // アラートを更新
      await prisma.postReportAlert.update({
        where: { postId },
        data: {
          severity,
          reportCount,
          dominantReportType,
          message,
          updatedAt: new Date()
        }
      });
    } else {
      // 新規アラートを作成
      await prisma.postReportAlert.create({
        data: {
          postId,
          severity,
          reportCount,
          dominantReportType,
          message
        }
      });
    }

    // 管理者への通知（実装予定）
    // TODO: 管理者通知システムの実装
    console.log('管理者への通知:', { postId, severity, reportCount, message });
  }
};

/**
 * 投稿の通報状況を取得
 * GET /api/posts/:postId/reports
 */
export const getPostReports = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const reports = await prisma.postReport.findMany({
      where: { postId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            accountType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const alert = await prisma.postReportAlert.findUnique({
      where: { postId }
    });

    return res.json({
      success: true,
      data: {
        reports,
        alert,
        summary: {
          total: reports.length,
          pending: reports.filter(r => r.status === 'pending').length,
          reviewing: reports.filter(r => r.status === 'reviewing').length,
          actioned: reports.filter(r => r.status === 'actioned').length,
          dismissed: reports.filter(r => r.status === 'dismissed').length
        }
      }
    });
  } catch (error) {
    console.error('通報取得エラー:', error);
    return res.status(500).json({
      success: false,
      message: '通報情報の取得中にエラーが発生しました'
    });
  }
};

/**
 * 全ての通報を取得（管理者用）
 * GET /api/admin/reports
 */
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const { status, reportType, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (reportType) where.reportType = reportType;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      prisma.postReport.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              accountType: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              accountType: true
            }
          },
          alert: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.postReport.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('通報一覧取得エラー:', error);
    return res.status(500).json({
      success: false,
      message: '通報一覧の取得中にエラーが発生しました'
    });
  }
};

/**
 * 通報を確認・対応する（管理者用）
 * PUT /api/admin/reports/:reportId
 */
export const reviewReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { reviewerId, status, actionTaken, reviewNotes } = req.body;

    if (!reviewerId || !status) {
      return res.status(400).json({
        success: false,
        message: '必須パラメータが不足しています'
      });
    }

    const report = await prisma.postReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        actionTaken,
        reviewNotes
      }
    });

    // 同じ投稿の他の通報も確認
    if (status === 'actioned' || status === 'dismissed') {
      const pendingReports = await prisma.postReport.count({
        where: {
          postId: report.postId,
          status: 'pending'
        }
      });

      // 全て対応済みの場合、アラートも確認済みにする
      if (pendingReports === 0) {
        await prisma.postReportAlert.updateMany({
          where: {
            postId: report.postId,
            acknowledged: false
          },
          data: {
            acknowledged: true,
            acknowledgedBy: reviewerId,
            acknowledgedAt: new Date()
          }
        });
      }
    }

    return res.json({
      success: true,
      message: '通報を確認済みにしました',
      data: report
    });
  } catch (error) {
    console.error('通報確認エラー:', error);
    return res.status(500).json({
      success: false,
      message: '通報の確認処理中にエラーが発生しました'
    });
  }
};

/**
 * アラートを確認済みにする（管理者用）
 * PUT /api/admin/alerts/:alertId/acknowledge
 */
export const acknowledgeAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    if (!acknowledgedBy) {
      return res.status(400).json({
        success: false,
        message: '確認者IDが必要です'
      });
    }

    const alert = await prisma.postReportAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'アラートを確認済みにしました',
      data: alert
    });
  } catch (error) {
    console.error('アラート確認エラー:', error);
    return res.status(500).json({
      success: false,
      message: 'アラートの確認処理中にエラーが発生しました'
    });
  }
};

/**
 * 未確認アラートを取得（管理者用）
 * GET /api/admin/alerts/unacknowledged
 */
export const getUnacknowledgedAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await prisma.postReportAlert.findMany({
      where: {
        acknowledged: false
      },
      include: {
        reports: {
          where: {
            status: 'pending'
          },
          select: {
            id: true,
            reportType: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('アラート取得エラー:', error);
    return res.status(500).json({
      success: false,
      message: 'アラートの取得中にエラーが発生しました'
    });
  }
};

/**
 * 通報統計を取得（管理者用）
 * GET /api/admin/reports/statistics
 */
export const getReportStatistics = async (req: Request, res: Response) => {
  try {
    const [totalReports, reportsByType, reportsByStatus, topReportedPosts] = await Promise.all([
      // 総通報数
      prisma.postReport.count(),

      // 通報タイプ別の集計
      prisma.postReport.groupBy({
        by: ['reportType'],
        _count: true
      }),

      // ステータス別の集計
      prisma.postReport.groupBy({
        by: ['status'],
        _count: true
      }),

      // 最も通報が多い投稿TOP5
      prisma.postReport.groupBy({
        by: ['postId'],
        _count: true,
        orderBy: {
          _count: {
            postId: 'desc'
          }
        },
        take: 5
      })
    ]);

    // 平均対応時間の計算
    const actionedReports = await prisma.postReport.findMany({
      where: {
        status: 'actioned',
        reviewedAt: { not: null }
      },
      select: {
        createdAt: true,
        reviewedAt: true
      }
    });

    const avgResponseTime = actionedReports.length > 0
      ? actionedReports.reduce((sum, report) => {
          const responseTime = report.reviewedAt!.getTime() - report.createdAt.getTime();
          return sum + responseTime / (1000 * 60 * 60); // 時間単位
        }, 0) / actionedReports.length
      : 0;

    return res.json({
      success: true,
      data: {
        totalReports,
        reportsByType: Object.fromEntries(
          reportsByType.map(item => [item.reportType, item._count])
        ),
        reportsByStatus: Object.fromEntries(
          reportsByStatus.map(item => [item.status, item._count])
        ),
        pendingReports: reportsByStatus.find(s => s.status === 'pending')?._count || 0,
        averageResponseTime: Math.round(avgResponseTime * 10) / 10, // 小数点1桁
        topReportedPosts: await Promise.all(
          topReportedPosts.map(async (item) => {
            const alert = await prisma.postReportAlert.findUnique({
              where: { postId: item.postId }
            });
            return {
              postId: item.postId,
              reportCount: item._count,
              severity: alert?.severity || 'low'
            };
          })
        )
      }
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    return res.status(500).json({
      success: false,
      message: '統計情報の取得中にエラーが発生しました'
    });
  }
};