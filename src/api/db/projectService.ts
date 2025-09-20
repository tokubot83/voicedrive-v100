// プロジェクト管理サービス（データベース接続）
import prisma from '../../lib/prisma';

export interface ProjectData {
  title: string;
  description: string;
  category: string;
  proposerId: string;
  objectives: any;
  expectedOutcomes: any;
  budget?: number;
  timeline?: any;
  priority?: string;
}

export class ProjectService {
  // プロジェクト提案
  static async propose(data: ProjectData) {
    try {
      const project = await prisma.project.create({
        data: {
          ...data,
          status: 'proposed',
          progressRate: 0,
        },
        include: {
          proposer: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            }
          }
        }
      });

      // 監査ログ記録
      await prisma.auditLog.create({
        data: {
          userId: data.proposerId,
          action: 'CREATE',
          entityType: 'Project',
          entityId: project.id,
          newValues: { title: project.title, status: 'proposed' },
        }
      });

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error('Project proposal failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to propose project',
      };
    }
  }

  // プロジェクトリスト取得
  static async list(filters?: {
    status?: string;
    category?: string;
    proposerId?: string;
    priority?: string;
  }) {
    try {
      const projects = await prisma.project.findMany({
        where: filters,
        include: {
          proposer: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          }
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return {
        success: true,
        data: projects,
        count: projects.length,
      };
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        data: [],
      };
    }
  }

  // プロジェクト詳細取得
  static async getById(id: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          proposer: {
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

      if (!project) {
        return {
          success: false,
          error: 'Project not found',
        };
      }

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error('Failed to fetch project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project',
      };
    }
  }

  // プロジェクト承認
  static async approve(id: string, approverId: string, comments?: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        return {
          success: false,
          error: 'Project not found',
        };
      }

      // 承認者リスト更新
      const currentApprovers = (project.approvedBy as any[]) || [];
      const updatedApprovers = [...currentApprovers, {
        userId: approverId,
        timestamp: new Date(),
        comments,
      }];

      const updated = await prisma.project.update({
        where: { id },
        data: {
          status: 'approved',
          approvalLevel: { increment: 1 },
          approvedBy: updatedApprovers,
          updatedAt: new Date(),
        }
      });

      // 監査ログ記録
      await prisma.auditLog.create({
        data: {
          userId: approverId,
          action: 'UPDATE',
          entityType: 'Project',
          entityId: id,
          oldValues: { status: project.status },
          newValues: { status: 'approved', approvalLevel: updated.approvalLevel },
        }
      });

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('Project approval failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve project',
      };
    }
  }

  // プロジェクト却下
  static async reject(id: string, approverId: string, reason: string) {
    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          status: 'cancelled',
          rejectionReason: reason,
          updatedAt: new Date(),
        }
      });

      // 監査ログ記録
      await prisma.auditLog.create({
        data: {
          userId: approverId,
          action: 'UPDATE',
          entityType: 'Project',
          entityId: id,
          newValues: { status: 'cancelled', rejectionReason: reason },
        }
      });

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error('Project rejection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject project',
      };
    }
  }

  // プロジェクト開始
  static async start(id: string) {
    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          status: 'in_progress',
          startedAt: new Date(),
          updatedAt: new Date(),
        }
      });

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error('Project start failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start project',
      };
    }
  }

  // 進捗更新
  static async updateProgress(id: string, progressData: {
    progressRate: number;
    milestones?: any;
    deliverables?: any;
    notes?: string;
  }) {
    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...progressData,
          updatedAt: new Date(),
        }
      });

      // 100%完了時は自動的にステータスを変更
      if (progressData.progressRate === 100) {
        await prisma.project.update({
          where: { id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          }
        });
      }

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error('Progress update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update progress',
      };
    }
  }

  // プロジェクト完了
  static async complete(id: string, results: {
    actualOutcomes: any;
    lessonsLearned?: string;
    roi?: number;
  }) {
    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...results,
          status: 'completed',
          progressRate: 100,
          completedAt: new Date(),
          updatedAt: new Date(),
        }
      });

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error('Project completion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete project',
      };
    }
  }

  // ダッシュボード用統計
  static async getDashboard(period?: { start: Date; end: Date }) {
    try {
      const where = period ? {
        createdAt: {
          gte: period.start,
          lte: period.end,
        }
      } : {};

      const [total, proposed, approved, inProgress, completed, cancelled] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.count({ where: { ...where, status: 'proposed' } }),
        prisma.project.count({ where: { ...where, status: 'approved' } }),
        prisma.project.count({ where: { ...where, status: 'in_progress' } }),
        prisma.project.count({ where: { ...where, status: 'completed' } }),
        prisma.project.count({ where: { ...where, status: 'cancelled' } }),
      ]);

      // カテゴリ別統計
      const categoryStats = await prisma.project.groupBy({
        by: ['category'],
        where,
        _count: {
          category: true,
        },
        _avg: {
          progressRate: true,
          budget: true,
        }
      });

      // 優先度別統計
      const priorityStats = await prisma.project.groupBy({
        by: ['priority'],
        where: {
          ...where,
          status: 'in_progress',
        },
        _count: {
          priority: true,
        }
      });

      // 予算合計
      const budgetStats = await prisma.project.aggregate({
        where,
        _sum: {
          budget: true,
        },
        _avg: {
          roi: true,
        }
      });

      // 最近のプロジェクト
      const recentProjects = await prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          priority: true,
          progressRate: true,
          proposer: {
            select: {
              name: true,
            }
          }
        }
      });

      return {
        success: true,
        data: {
          overview: {
            total,
            proposed,
            approved,
            inProgress,
            completed,
            cancelled,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
          },
          categoryBreakdown: categoryStats.map(stat => ({
            category: stat.category,
            count: stat._count.category,
            avgProgress: stat._avg.progressRate?.toFixed(1) || '0',
            avgBudget: stat._avg.budget?.toFixed(0) || '0',
          })),
          priorityBreakdown: priorityStats.map(stat => ({
            priority: stat.priority || 'normal',
            count: stat._count.priority,
          })),
          budget: {
            total: budgetStats._sum.budget || 0,
            averageROI: budgetStats._avg.roi?.toFixed(1) || '0',
          },
          recentProjects,
        }
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard',
      };
    }
  }

  // プロジェクトカテゴリ定義
  static getProjectCategories() {
    return {
      improvement: '業務改善',
      innovation: 'イノベーション',
      event: 'イベント',
      training: '研修・教育',
      facility: '施設改善',
      system: 'システム導入',
      research: '研究開発',
      collaboration: '連携強化',
      other: 'その他',
    };
  }

  // 優先度定義
  static getPriorityLevels() {
    return {
      urgent: '緊急',
      high: '高',
      medium: '中',
      low: '低',
    };
  }
}