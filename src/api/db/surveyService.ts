// アンケートサービス（データベース接続）
import prisma from '../../lib/prisma';

export interface SurveyData {
  title: string;
  description?: string;
  category: string;
  createdById: string;
  targetAudience: string;
  deadline: Date;
  isAnonymous?: boolean;
  questions: any;
}

export interface SurveyResponseData {
  surveyId: string;
  respondentId?: string;
  answers: any;
  score?: number;
  comments?: string;
}

export class SurveyService {
  // アンケート作成
  static async create(data: SurveyData) {
    try {
      const survey = await prisma.survey.create({
        data: {
          ...data,
          status: 'draft',
          isAnonymous: data.isAnonymous ?? true,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          }
        }
      });

      return {
        success: true,
        data: survey,
      };
    } catch (error) {
      console.error('Survey creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create survey',
      };
    }
  }

  // アンケート公開
  static async publish(id: string) {
    try {
      const survey = await prisma.survey.update({
        where: { id },
        data: {
          status: 'active',
          publishedAt: new Date(),
        }
      });

      return {
        success: true,
        data: survey,
      };
    } catch (error) {
      console.error('Survey publication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish survey',
      };
    }
  }

  // アンケートリスト取得
  static async list(filters?: {
    category?: string;
    status?: string;
    createdById?: string;
  }) {
    try {
      const surveys = await prisma.survey.findMany({
        where: filters,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          },
          _count: {
            select: {
              responses: true,
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { deadline: 'asc' },
        ],
      });

      return {
        success: true,
        data: surveys.map(survey => ({
          ...survey,
          responseCount: survey._count.responses,
        })),
        count: surveys.length,
      };
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch surveys',
        data: [],
      };
    }
  }

  // アンケート詳細取得
  static async getById(id: string) {
    try {
      const survey = await prisma.survey.findUnique({
        where: { id },
        include: {
          createdBy: true,
          responses: {
            select: {
              id: true,
              submittedAt: true,
              score: true,
            }
          }
        }
      });

      if (!survey) {
        return {
          success: false,
          error: 'Survey not found',
        };
      }

      // 回答率計算
      const targetCount = this.calculateTargetCount(survey.targetAudience);
      const completionRate = targetCount > 0
        ? (survey.responses.length / targetCount) * 100
        : 0;

      return {
        success: true,
        data: {
          ...survey,
          responseCount: survey.responses.length,
          completionRate: completionRate.toFixed(1),
        },
      };
    } catch (error) {
      console.error('Failed to fetch survey:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch survey',
      };
    }
  }

  // アンケート回答送信
  static async submitResponse(data: SurveyResponseData) {
    try {
      // アンケート存在確認
      const survey = await prisma.survey.findUnique({
        where: { id: data.surveyId },
      });

      if (!survey) {
        return {
          success: false,
          error: 'Survey not found',
        };
      }

      if (survey.status !== 'active') {
        return {
          success: false,
          error: 'Survey is not active',
        };
      }

      if (new Date() > survey.deadline) {
        return {
          success: false,
          error: 'Survey deadline has passed',
        };
      }

      // 回答保存
      const response = await prisma.surveyResponse.create({
        data: {
          ...data,
          respondentId: survey.isAnonymous ? null : data.respondentId,
        }
      });

      // アンケート集計更新
      await prisma.survey.update({
        where: { id: data.surveyId },
        data: {
          responseCount: { increment: 1 },
        }
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('Survey response submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit response',
      };
    }
  }

  // アンケート結果集計
  static async getResults(id: string) {
    try {
      const survey = await prisma.survey.findUnique({
        where: { id },
        include: {
          responses: true,
        }
      });

      if (!survey) {
        return {
          success: false,
          error: 'Survey not found',
        };
      }

      // 回答集計
      const responses = survey.responses;
      const totalResponses = responses.length;

      if (totalResponses === 0) {
        return {
          success: true,
          data: {
            surveyId: id,
            title: survey.title,
            totalResponses: 0,
            results: {},
          }
        };
      }

      // 質問ごとの集計
      const questions = survey.questions as any[];
      const results: any = {};

      questions.forEach((question: any) => {
        const questionId = question.id;
        results[questionId] = {
          question: question.question,
          type: question.type,
          responses: [],
        };

        // 回答タイプごとの集計
        if (question.type === 'rating' || question.type === 'scale') {
          const scores = responses
            .map(r => (r.answers as any)[questionId])
            .filter(score => score !== undefined);

          const average = scores.length > 0
            ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
            : 0;

          results[questionId].average = average.toFixed(2);
          results[questionId].distribution = this.getScoreDistribution(scores);
        } else if (question.type === 'choice') {
          const choices = responses
            .map(r => (r.answers as any)[questionId])
            .filter(choice => choice !== undefined);

          results[questionId].distribution = this.getChoiceDistribution(choices);
        } else if (question.type === 'text') {
          results[questionId].responses = responses
            .map(r => (r.answers as any)[questionId])
            .filter(text => text !== undefined && text !== '');
        }
      });

      // 全体スコア計算
      const overallScores = responses
        .map(r => r.score)
        .filter(score => score !== null) as number[];

      const overallAverage = overallScores.length > 0
        ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
        : 0;

      return {
        success: true,
        data: {
          surveyId: id,
          title: survey.title,
          category: survey.category,
          totalResponses,
          overallAverage: overallAverage.toFixed(2),
          completionRate: survey.completionRate,
          results,
          comments: responses
            .map(r => r.comments)
            .filter(c => c !== null && c !== ''),
        }
      };
    } catch (error) {
      console.error('Failed to fetch survey results:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch results',
      };
    }
  }

  // アンケート終了
  static async close(id: string) {
    try {
      const survey = await prisma.survey.update({
        where: { id },
        data: {
          status: 'closed',
          closedAt: new Date(),
        }
      });

      return {
        success: true,
        data: survey,
      };
    } catch (error) {
      console.error('Survey closing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to close survey',
      };
    }
  }

  // 統計情報取得
  static async getStatistics(period?: { start: Date; end: Date }) {
    try {
      const where = period ? {
        createdAt: {
          gte: period.start,
          lte: period.end,
        }
      } : {};

      const [total, active, closed, draft] = await Promise.all([
        prisma.survey.count({ where }),
        prisma.survey.count({ where: { ...where, status: 'active' } }),
        prisma.survey.count({ where: { ...where, status: 'closed' } }),
        prisma.survey.count({ where: { ...where, status: 'draft' } }),
      ]);

      const categoryStats = await prisma.survey.groupBy({
        by: ['category'],
        where,
        _count: {
          category: true,
        },
        _avg: {
          completionRate: true,
        }
      });

      const totalResponses = await prisma.surveyResponse.count({
        where: period ? {
          submittedAt: {
            gte: period.start,
            lte: period.end,
          }
        } : {}
      });

      return {
        success: true,
        data: {
          total,
          active,
          closed,
          draft,
          totalResponses,
          averageResponseRate: total > 0
            ? ((totalResponses / (total * 100)) * 100).toFixed(1)
            : '0',
          categoryBreakdown: categoryStats.map(stat => ({
            category: stat.category,
            count: stat._count.category,
            avgCompletionRate: stat._avg.completionRate?.toFixed(1) || '0',
          })),
        }
      };
    } catch (error) {
      console.error('Failed to fetch survey statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }

  // ヘルパー関数：対象者数計算
  private static calculateTargetCount(targetAudience: string): number {
    const targetMap: { [key: string]: number } = {
      'all': 100,
      'doctors': 20,
      'nurses': 40,
      'technicians': 15,
      'admin': 10,
      'specific_department': 30,
    };

    return targetMap[targetAudience] || 50;
  }

  // ヘルパー関数：スコア分布
  private static getScoreDistribution(scores: number[]): any {
    const distribution: { [key: string]: number } = {};
    scores.forEach(score => {
      const key = score.toString();
      distribution[key] = (distribution[key] || 0) + 1;
    });
    return distribution;
  }

  // ヘルパー関数：選択肢分布
  private static getChoiceDistribution(choices: string[]): any {
    const distribution: { [key: string]: number } = {};
    choices.forEach(choice => {
      distribution[choice] = (distribution[choice] || 0) + 1;
    });
    return distribution;
  }

  // アンケートカテゴリ定義
  static getSurveyCategories() {
    return {
      satisfaction: '満足度調査',
      workenv: '職場環境',
      education: '教育・研修',
      welfare: '福利厚生',
      system: 'システム改善',
      event: 'イベント',
      other: 'その他',
    };
  }
}