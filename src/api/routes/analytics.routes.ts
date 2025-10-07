/**
 * Analytics API Routes
 *
 * 職員カルテシステムとのボイス分析データ連携用エンドポイント
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { ipWhitelist } from '../middleware/ipWhitelist';
import { auditLogger, anomalyDetector } from '../middleware/auditLogger';

const router = Router();
const prisma = new PrismaClient();

/**
 * 集計統計リクエスト型定義
 */
interface AggregatedStatsRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  department?: string;
  levelRange?: string; // "1-3", "4-6" など
  category?: string; // "idea_voice", "free_voice" など
}

/**
 * 集計統計レスポンス型定義
 */
interface AggregatedStatsResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  stats: {
    totalPosts: number;
    totalUsers: number;
    participationRate: number;
    byCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    byDepartment: Array<{
      department: string;
      postCount: number;
      userCount: number;
      participationRate: number;
    }>;
    byLevel: Array<{
      levelRange: string;
      count: number;
      percentage: number;
    }>;
    timeSeries: Array<{
      date: string;
      count: number;
    }>;
    engagement: {
      averageLength: number;
      withMedia: number;
      withMediaPercentage: number;
    };
  };
  privacyMetadata: {
    consentedUsers: number;
    kAnonymityCompliant: boolean;
    minimumGroupSize: number;
    dataVersion: string;
  };
}

/**
 * 分析データ受信リクエスト型定義
 */
interface GroupAnalyticsRequest {
  analysisDate: string;
  period: {
    startDate: string;
    endDate: string;
  };
  postingTrends: {
    totalPosts: number;
    totalUsers: number;
    participationRate: number;
    growthRate: number;
    byCategory: Array<{ category: string; count: number; percentage: number }>;
    byDepartment: Array<{ department: string; postCount: number; userCount: number }>;
    byLevel: Array<{ levelRange: string; count: number; percentage: number }>;
    timeSeries: Array<{ date: string; count: number }>;
  };
  sentimentAnalysis?: {
    positive: number;
    neutral: number;
    negative: number;
    positiveRate: number;
    negativeRate: number;
    byDepartment: Array<{
      department: string;
      positive: number;
      neutral: number;
      negative: number;
    }>;
    byCategory: Array<{
      category: string;
      positive: number;
      neutral: number;
      negative: number;
    }>;
  };
  topicAnalysis?: {
    topKeywords: Array<{
      keyword: string;
      count: number;
      trend: 'rising' | 'stable' | 'falling';
      relatedCategories: string[];
    }>;
    emergingTopics: Array<{
      topic: string;
      strength: number;
      firstAppeared: string;
      relatedKeywords: string[];
    }>;
    byDepartment: Array<{
      department: string;
      topKeywords: Array<{ keyword: string; count: number }>;
    }>;
  };
  engagementMetrics: {
    averagePostLength: number;
    medianPostLength: number;
    postsWithMedia: number;
    postsWithMediaPercentage: number;
  };
  alerts?: Array<{
    type: 'negative_spike' | 'engagement_drop' | 'topic_concern';
    severity: 'low' | 'medium' | 'high';
    message: string;
    affectedDepartment?: string;
    recommendedAction: string;
  }>;
  privacyMetadata: {
    consentedUsers: number;
    analyzedPosts: number;
    kAnonymityCompliant: boolean;
    minimumGroupSize: number;
    dataVersion: string;
    processingDate: string;
  };
}

/**
 * GET /api/v1/analytics/aggregated-stats
 *
 * 職員カルテシステムが集計データを取得するエンドポイント
 *
 * セキュリティ:
 * - JWT認証
 * - IPホワイトリスト
 * - レート制限（100リクエスト/時間）
 * - 監査ログ記録
 * - 異常検知
 */
router.get(
  '/aggregated-stats',
  authenticateToken,
  ipWhitelist,
  anomalyDetector,
  auditLogger('ANALYTICS_AGGREGATED_STATS_REQUEST'),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, department, levelRange, category } =
        req.query as unknown as AggregatedStatsRequest;

      // バリデーション
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'startDateとendDateは必須です',
            timestamp: new Date().toISOString()
          }
        });
      }

      // 日付形式チェック
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATE_FORMAT',
            message: '日付はYYYY-MM-DD形式で指定してください',
            timestamp: new Date().toISOString()
          }
        });
      }

      // 日付範囲チェック
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

      // endDateがstartDate以降であることを確認
      if (diffDays < 0) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATE_RANGE',
            message: 'endDateはstartDate以降である必要があります',
            timestamp: new Date().toISOString()
          }
        });
      }

      // 過去6ヶ月前までの制限
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (start < sixMonthsAgo) {
        return res.status(400).json({
          error: {
            code: 'DATE_TOO_OLD',
            message: '過去6ヶ月前までのデータのみ取得可能です',
            details: {
              requestedStart: startDate,
              oldestAllowed: sixMonthsAgo.toISOString().split('T')[0]
            },
            timestamp: new Date().toISOString()
          }
        });
      }

      // 最大3ヶ月分（90日）の制限
      if (diffDays > 90) {
        return res.status(400).json({
          error: {
            code: 'DATE_RANGE_TOO_LONG',
            message: '期間は最大3ヶ月（90日）以内で指定してください',
            details: {
              requestedDays: Math.ceil(diffDays),
              maxDays: 90
            },
            timestamp: new Date().toISOString()
          }
        });
      }

      // TODO: 実際のデータベースから集計データを取得
      // 現在はデモデータを返す

      // 同意ユーザー数を取得
      const consentedUsersCount = await prisma.dataConsent.count({
        where: {
          analyticsConsent: true,
          revokeDate: null
        }
      });

      // デモレスポンスデータ
      const response: AggregatedStatsResponse = {
        period: {
          startDate,
          endDate
        },
        stats: {
          totalPosts: 342,
          totalUsers: 89,
          participationRate: 74.2,
          byCategory: [
            { category: 'idea_voice', count: 145, percentage: 42.4 },
            { category: 'free_voice', count: 97, percentage: 28.4 },
            { category: 'question_voice', count: 58, percentage: 17.0 },
            { category: 'concern_voice', count: 42, percentage: 12.3 }
          ],
          byDepartment: [
            { department: '看護部', postCount: 128, userCount: 34, participationRate: 76.8 },
            { department: '医局', postCount: 89, userCount: 23, participationRate: 71.2 },
            { department: '薬剤部', postCount: 67, userCount: 18, participationRate: 72.5 },
            { department: '事務部', postCount: 58, userCount: 14, participationRate: 68.3 }
          ],
          byLevel: [
            { levelRange: '1-3', count: 156, percentage: 45.6 },
            { levelRange: '4-6', count: 98, percentage: 28.7 },
            { levelRange: '7-9', count: 67, percentage: 19.6 },
            { levelRange: '10-12', count: 21, percentage: 6.1 }
          ],
          timeSeries: generateTimeSeriesData(startDate, endDate),
          engagement: {
            averageLength: 245,
            withMedia: 68,
            withMediaPercentage: 19.9
          }
        },
        privacyMetadata: {
          consentedUsers: consentedUsersCount,
          kAnonymityCompliant: true,
          minimumGroupSize: 5,
          dataVersion: '1.0.0'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('集計データ取得エラー:', error);

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '集計データの取得に失敗しました',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
);

/**
 * POST /api/v1/analytics/group-data
 *
 * 職員カルテシステムから分析結果を受信するエンドポイント
 *
 * セキュリティ:
 * - JWT認証
 * - IPホワイトリスト
 * - レート制限（10リクエスト/時間）
 * - 監査ログ記録
 * - HMAC署名検証（オプション）
 */
router.post(
  '/group-data',
  authenticateToken,
  ipWhitelist,
  anomalyDetector,
  auditLogger('ANALYTICS_GROUP_DATA_RECEIVED'),
  async (req: Request, res: Response) => {
    try {
      const data = req.body as GroupAnalyticsRequest;

      // バリデーション
      if (!data.analysisDate || !data.period || !data.postingTrends) {
        return res.status(400).json({
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'analysisDate, period, postingTrendsは必須です',
            timestamp: new Date().toISOString()
          }
        });
      }

      // HMAC署名検証（オプション）
      const signature = req.headers['x-analytics-signature'];
      if (process.env.ANALYTICS_VERIFY_SIGNATURE === 'true' && signature) {
        const isValid = verifyHMACSignature(req.body, signature.toString());
        if (!isValid) {
          return res.status(403).json({
            error: {
              code: 'INVALID_SIGNATURE',
              message: '署名が無効です',
              timestamp: new Date().toISOString()
            }
          });
        }
      }

      // TODO: データベースに分析結果を保存
      // 現在は受信のみ

      console.log('📊 分析データ受信:', {
        analysisDate: data.analysisDate,
        totalPosts: data.postingTrends.totalPosts,
        hasSentiment: !!data.sentimentAnalysis,
        hasTopic: !!data.topicAnalysis,
        alertCount: data.alerts?.length || 0
      });

      res.status(200).json({
        success: true,
        message: '分析データを受信しました',
        receivedAt: new Date().toISOString(),
        dataVersion: data.privacyMetadata.dataVersion
      });
    } catch (error) {
      console.error('分析データ受信エラー:', error);

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '分析データの受信に失敗しました',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
);

/**
 * ヘルパー関数：時系列データ生成
 */
function generateTimeSeriesData(startDate: string, endDate: string): Array<{ date: string; count: number }> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeSeries: Array<{ date: string; count: number }> = [];

  let current = new Date(start);
  while (current <= end) {
    timeSeries.push({
      date: current.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20) + 5 // デモデータ
    });
    current.setDate(current.getDate() + 1);
  }

  return timeSeries;
}

/**
 * ヘルパー関数：HMAC署名検証
 */
function verifyHMACSignature(data: any, signature: string): boolean {
  // TODO: 実装（crypto.createHmac を使用）
  const crypto = require('crypto');
  const secret = process.env.ANALYTICS_HMAC_SECRET || '';

  if (!secret) {
    console.warn('⚠️  ANALYTICS_HMAC_SECRET が設定されていません');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('hex');

  return signature === expectedSignature;
}

export default router;
