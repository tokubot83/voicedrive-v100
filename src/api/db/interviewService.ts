// 面談予約サービス（データベース接続）
import prisma from '../../lib/prisma';

export interface InterviewData {
  employeeId: string;
  category: string;  // BASIC, SUPPORT, SPECIAL
  type: string;      // 詳細タイプ（25種類）
  topic: string;
  preferredDate: Date;
  urgencyLevel: string;
  duration?: number;
  notes?: string;
}

export class InterviewService {
  // 面談予約作成
  static async create(data: InterviewData) {
    try {
      console.log('Creating interview with data:', data);

      // employeeIdからUserのidを取得
      const user = await prisma.user.findFirst({
        where: { employeeId: data.employeeId }
      });

      console.log('Found user:', user);

      if (!user) {
        return {
          success: false,
          error: `Employee with ID ${data.employeeId} not found`,
        };
      }

      const createData = {
        employeeId: user.id, // User.idを使用
        category: data.category,
        type: data.type,
        topic: data.topic,
        preferredDate: data.preferredDate,
        urgencyLevel: data.urgencyLevel,
        duration: data.duration,
        notes: data.notes,
        status: 'pending',
      };

      console.log('Creating interview with processed data:', createData);

      const interview = await prisma.interview.create({
        data: createData,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            }
          }
        }
      });

      return {
        success: true,
        data: interview,
      };
    } catch (error) {
      console.error('Interview creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create interview',
      };
    }
  }

  // 面談予約リスト取得
  static async list(filters?: {
    employeeId?: string;
    category?: string;
    status?: string;
    urgencyLevel?: string;
  }) {
    try {
      const interviews = await prisma.interview.findMany({
        where: filters,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            }
          }
        },
        orderBy: [
          { urgencyLevel: 'asc' },
          { preferredDate: 'asc' },
        ],
        take: 100,
      });

      return {
        success: true,
        data: interviews,
        count: interviews.length,
      };
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch interviews',
        data: [],
      };
    }
  }

  // 面談予約詳細取得
  static async getById(id: string) {
    try {
      const interview = await prisma.interview.findUnique({
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

      if (!interview) {
        return {
          success: false,
          error: 'Interview not found',
        };
      }

      return {
        success: true,
        data: interview,
      };
    } catch (error) {
      console.error('Failed to fetch interview:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch interview',
      };
    }
  }

  // 面談予約更新
  static async update(id: string, data: Partial<InterviewData>) {
    try {
      const interview = await prisma.interview.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          employee: true,
        }
      });

      return {
        success: true,
        data: interview,
      };
    } catch (error) {
      console.error('Interview update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update interview',
      };
    }
  }

  // スケジュール確定
  static async schedule(id: string, scheduledDate: Date, interviewerName: string) {
    try {
      const interview = await prisma.interview.update({
        where: { id },
        data: {
          scheduledDate,
          interviewerName,
          status: 'scheduled',
          updatedAt: new Date(),
        }
      });

      // 監査ログ記録
      await prisma.auditLog.create({
        data: {
          userId: interview.employeeId,
          action: 'UPDATE',
          entityType: 'Interview',
          entityId: id,
          oldValues: { status: 'pending' },
          newValues: { status: 'scheduled', scheduledDate },
        }
      });

      return {
        success: true,
        data: interview,
      };
    } catch (error) {
      console.error('Interview scheduling failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule interview',
      };
    }
  }

  // 面談完了
  static async complete(id: string, result: string, notes?: string) {
    try {
      const interview = await prisma.interview.update({
        where: { id },
        data: {
          actualDate: new Date(),
          status: 'completed',
          result,
          notes,
          updatedAt: new Date(),
        }
      });

      return {
        success: true,
        data: interview,
      };
    } catch (error) {
      console.error('Interview completion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete interview',
      };
    }
  }

  // 面談キャンセル
  static async cancel(id: string, reason?: string) {
    try {
      const interview = await prisma.interview.update({
        where: { id },
        data: {
          status: 'cancelled',
          notes: reason ? `キャンセル理由: ${reason}` : undefined,
          updatedAt: new Date(),
        }
      });

      return {
        success: true,
        data: interview,
      };
    } catch (error) {
      console.error('Interview cancellation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel interview',
      };
    }
  }

  // 統計情報取得
  static async getStatistics(employeeId?: string) {
    try {
      const where = employeeId ? { employeeId } : {};

      const [total, pending, scheduled, completed, cancelled] = await Promise.all([
        prisma.interview.count({ where }),
        prisma.interview.count({ where: { ...where, status: 'pending' } }),
        prisma.interview.count({ where: { ...where, status: 'scheduled' } }),
        prisma.interview.count({ where: { ...where, status: 'completed' } }),
        prisma.interview.count({ where: { ...where, status: 'cancelled' } }),
      ]);

      const categoryStats = await prisma.interview.groupBy({
        by: ['category'],
        where,
        _count: {
          category: true,
        }
      });

      const urgentInterviews = await prisma.interview.findMany({
        where: {
          ...where,
          urgencyLevel: 'urgent',
          status: 'pending',
        },
        select: {
          id: true,
          topic: true,
          preferredDate: true,
          employee: {
            select: {
              name: true,
            }
          }
        },
        take: 5,
      });

      return {
        success: true,
        data: {
          total,
          pending,
          scheduled,
          completed,
          cancelled,
          completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
          categoryBreakdown: categoryStats.map(stat => ({
            category: stat.category,
            count: stat._count.category,
          })),
          urgentInterviews,
        }
      };
    } catch (error) {
      console.error('Failed to fetch interview statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }

  // 3段階25タイプマッピング
  static getCategoryTypeMapping() {
    return {
      BASIC: [
        'regular_1on1',
        'goal_setting',
        'skill_development',
        'career_consultation',
        'performance_review',
        'project_review',
        'trial_period_review',
        'annual_review'
      ],
      SUPPORT: [
        'mental_health',
        'stress_management',
        'work_life_balance',
        'return_to_work',
        'workplace_relationship',
        'harassment_consultation',
        'health_consultation',
        'family_support'
      ],
      SPECIAL: [
        'promotion_interview',
        'transfer_consultation',
        'retirement_planning',
        'disciplinary_hearing',
        'grievance_hearing',
        'exit_interview',
        'crisis_intervention',
        'executive_coaching',
        'innovation_proposal'
      ]
    };
  }
}