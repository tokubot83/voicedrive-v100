// V3評価システムサービス（データベース接続）
import prisma from '../../lib/prisma';

export interface EvaluationData {
  employeeId: string;
  period: string;
  evaluationType: string;
  overallScore?: number;
  categoryScores?: any;
  selfAssessment?: string;
  achievements?: any;
  challenges?: any;
}

export class EvaluationService {
  // 評価作成
  static async create(data: EvaluationData) {
    try {
      const evaluation = await prisma.evaluation.create({
        data: {
          ...data,
          status: 'draft',
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              role: true,
            }
          }
        }
      });

      return {
        success: true,
        data: evaluation,
      };
    } catch (error) {
      console.error('Evaluation creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create evaluation',
      };
    }
  }

  // 期間別評価取得
  static async getByPeriod(period: string, filters?: {
    employeeId?: string;
    evaluationType?: string;
    status?: string;
  }) {
    try {
      const evaluations = await prisma.evaluation.findMany({
        where: {
          period,
          ...filters,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              department: true,
              role: true,
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { updatedAt: 'desc' },
        ],
      });

      return {
        success: true,
        data: evaluations,
        count: evaluations.length,
      };
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch evaluations',
        data: [],
      };
    }
  }

  // 評価詳細取得
  static async getById(id: string) {
    try {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id },
        include: {
          employee: {
            include: {
              parent: {
                select: {
                  name: true,
                  role: true,
                }
              }
            }
          }
        }
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Evaluation not found',
        };
      }

      return {
        success: true,
        data: evaluation,
      };
    } catch (error) {
      console.error('Failed to fetch evaluation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch evaluation',
      };
    }
  }

  // 評価更新
  static async update(id: string, data: Partial<EvaluationData>) {
    try {
      const evaluation = await prisma.evaluation.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          employee: true,
        }
      });

      // 監査ログ記録
      await prisma.auditLog.create({
        data: {
          userId: evaluation.employeeId,
          action: 'UPDATE',
          entityType: 'Evaluation',
          entityId: id,
          newValues: data,
        }
      });

      return {
        success: true,
        data: evaluation,
      };
    } catch (error) {
      console.error('Evaluation update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update evaluation',
      };
    }
  }

  // 評価提出
  static async submit(id: string) {
    try {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id },
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Evaluation not found',
        };
      }

      // バリデーション
      if (!evaluation.selfAssessment || !evaluation.overallScore) {
        return {
          success: false,
          error: 'Evaluation is incomplete',
        };
      }

      const updated = await prisma.evaluation.update({
        where: { id },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
        }
      });

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('Evaluation submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit evaluation',
      };
    }
  }

  // 異議申立
  static async submitObjection(id: string, reason: string) {
    try {
      const evaluation = await prisma.evaluation.update({
        where: { id },
        data: {
          hasObjection: true,
          objectionReason: reason,
          objectionStatus: 'pending',
          updatedAt: new Date(),
        }
      });

      // 監査ログ記録
      await prisma.auditLog.create({
        data: {
          userId: evaluation.employeeId,
          action: 'UPDATE',
          entityType: 'Evaluation',
          entityId: id,
          oldValues: { hasObjection: false },
          newValues: { hasObjection: true, objectionReason: reason },
        }
      });

      return {
        success: true,
        data: evaluation,
      };
    } catch (error) {
      console.error('Objection submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit objection',
      };
    }
  }

  // 異議申立処理
  static async processObjection(id: string, status: string, result?: string) {
    try {
      const evaluation = await prisma.evaluation.update({
        where: { id },
        data: {
          objectionStatus: status,
          objectionResult: result,
          updatedAt: new Date(),
        }
      });

      return {
        success: true,
        data: evaluation,
      };
    } catch (error) {
      console.error('Objection processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process objection',
      };
    }
  }

  // 360度評価追加
  static async add360Feedback(id: string, type: 'peer' | 'subordinate', scores: any) {
    try {
      const field = type === 'peer' ? 'peerScores' : 'subordinateScores';

      const evaluation = await prisma.evaluation.findUnique({
        where: { id },
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Evaluation not found',
        };
      }

      const currentScores = (evaluation as any)[field] || [];
      const updatedScores = [...currentScores, scores];

      const updated = await prisma.evaluation.update({
        where: { id },
        data: {
          [field]: updatedScores,
          updatedAt: new Date(),
        }
      });

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('360 feedback addition failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add 360 feedback',
      };
    }
  }

  // 統計情報取得
  static async getStatistics(period: string) {
    try {
      const [total, draft, submitted, reviewing, completed] = await Promise.all([
        prisma.evaluation.count({ where: { period } }),
        prisma.evaluation.count({ where: { period, status: 'draft' } }),
        prisma.evaluation.count({ where: { period, status: 'submitted' } }),
        prisma.evaluation.count({ where: { period, status: 'reviewing' } }),
        prisma.evaluation.count({ where: { period, status: 'completed' } }),
      ]);

      const objections = await prisma.evaluation.count({
        where: {
          period,
          hasObjection: true,
        }
      });

      const avgScore = await prisma.evaluation.aggregate({
        where: {
          period,
          overallScore: { not: null },
        },
        _avg: {
          overallScore: true,
        }
      });

      const scoreDistribution = await prisma.evaluation.groupBy({
        by: ['overallScore'],
        where: {
          period,
          overallScore: { not: null },
        },
        _count: {
          overallScore: true,
        }
      });

      return {
        success: true,
        data: {
          total,
          draft,
          submitted,
          reviewing,
          completed,
          objections,
          completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
          averageScore: avgScore._avg.overallScore?.toFixed(1) || '0',
          scoreDistribution: scoreDistribution.map(item => ({
            score: item.overallScore,
            count: item._count.overallScore,
          })),
        }
      };
    } catch (error) {
      console.error('Failed to fetch evaluation statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }

  // 評価カテゴリ定義
  static getEvaluationCategories() {
    return {
      performance: '業績評価',
      teamwork: 'チームワーク',
      innovation: '革新性',
      leadership: 'リーダーシップ',
      communication: 'コミュニケーション',
      problemSolving: '問題解決力',
      customerService: '顧客サービス',
      technicalSkills: '専門技術',
      adaptability: '適応力',
      reliability: '信頼性',
    };
  }
}