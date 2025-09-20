// フィードバックサービス（データベース接続）
import prisma from '../../lib/prisma';

export interface FeedbackData {
  senderId: string;
  receiverId: string;
  type: string;
  category: string;
  content: string;
  importance: string;
  isAnonymous?: boolean;
}

export class FeedbackService {
  // フィードバック送信
  static async send(data: FeedbackData) {
    try {
      const feedback = await prisma.feedback.create({
        data: {
          ...data,
          status: 'sent',
          isAnonymous: data.isAnonymous ?? false,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              department: true,
              email: true,
            }
          }
        }
      });

      // 監査ログ記録（匿名でない場合）
      if (!data.isAnonymous) {
        await prisma.auditLog.create({
          data: {
            userId: data.senderId,
            action: 'CREATE',
            entityType: 'Feedback',
            entityId: feedback.id,
            newValues: { type: feedback.type, receiverId: feedback.receiverId },
          }
        });
      }

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      console.error('Feedback send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send feedback',
      };
    }
  }

  // 受信フィードバック一覧取得
  static async getReceived(userId: string, filters?: {
    type?: string;
    category?: string;
    status?: string;
    importance?: string;
  }) {
    try {
      const feedbacks = await prisma.feedback.findMany({
        where: {
          receiverId: userId,
          ...filters,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          }
        },
        orderBy: [
          { importance: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      // 匿名フィードバックの送信者情報を隠す
      const sanitized = feedbacks.map(fb => {
        if (fb.isAnonymous) {
          return {
            ...fb,
            sender: {
              id: 'anonymous',
              name: '匿名',
              department: '非公開',
            }
          };
        }
        return fb;
      });

      return {
        success: true,
        data: sanitized,
        count: sanitized.length,
      };
    } catch (error) {
      console.error('Failed to fetch received feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feedback',
        data: [],
      };
    }
  }

  // 送信フィードバック一覧取得
  static async getSent(userId: string, filters?: {
    type?: string;
    category?: string;
    status?: string;
  }) {
    try {
      const feedbacks = await prisma.feedback.findMany({
        where: {
          senderId: userId,
          ...filters,
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return {
        success: true,
        data: feedbacks,
        count: feedbacks.length,
      };
    } catch (error) {
      console.error('Failed to fetch sent feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feedback',
        data: [],
      };
    }
  }

  // フィードバック詳細取得
  static async getById(id: string, userId: string) {
    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id },
        include: {
          sender: true,
          receiver: true,
        }
      });

      if (!feedback) {
        return {
          success: false,
          error: 'Feedback not found',
        };
      }

      // アクセス権限チェック
      if (feedback.senderId !== userId && feedback.receiverId !== userId) {
        return {
          success: false,
          error: 'Access denied',
        };
      }

      // 既読更新（受信者の場合）
      if (feedback.receiverId === userId && feedback.status === 'sent') {
        await prisma.feedback.update({
          where: { id },
          data: {
            status: 'read',
            readAt: new Date(),
          }
        });
      }

      // 匿名処理
      if (feedback.isAnonymous && feedback.receiverId === userId) {
        feedback.sender = {
          ...feedback.sender,
          id: 'anonymous',
          name: '匿名',
          email: '',
          department: '非公開',
        } as any;
      }

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feedback',
      };
    }
  }

  // フィードバック返信
  static async respond(id: string, userId: string, response: string) {
    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return {
          success: false,
          error: 'Feedback not found',
        };
      }

      // 受信者のみ返信可能
      if (feedback.receiverId !== userId) {
        return {
          success: false,
          error: 'Only receiver can respond',
        };
      }

      const updated = await prisma.feedback.update({
        where: { id },
        data: {
          response,
          respondedAt: new Date(),
          status: 'responded',
        }
      });

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error('Feedback response failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to respond',
      };
    }
  }

  // フィードバック削除（送信者のみ）
  static async delete(id: string, userId: string) {
    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return {
          success: false,
          error: 'Feedback not found',
        };
      }

      // 送信者のみ削除可能
      if (feedback.senderId !== userId) {
        return {
          success: false,
          error: 'Only sender can delete',
        };
      }

      // ステータスを削除済みに変更（物理削除しない）
      await prisma.feedback.update({
        where: { id },
        data: {
          status: 'closed',
        }
      });

      return {
        success: true,
        message: 'Feedback deleted successfully',
      };
    } catch (error) {
      console.error('Feedback deletion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete feedback',
      };
    }
  }

  // 統計情報取得
  static async getStatistics(userId: string) {
    try {
      const [sentTotal, sentPending, sentRead, sentResponded] = await Promise.all([
        prisma.feedback.count({ where: { senderId: userId } }),
        prisma.feedback.count({ where: { senderId: userId, status: 'sent' } }),
        prisma.feedback.count({ where: { senderId: userId, status: 'read' } }),
        prisma.feedback.count({ where: { senderId: userId, status: 'responded' } }),
      ]);

      const [receivedTotal, receivedUnread, receivedPending] = await Promise.all([
        prisma.feedback.count({ where: { receiverId: userId } }),
        prisma.feedback.count({ where: { receiverId: userId, status: 'sent' } }),
        prisma.feedback.count({ where: { receiverId: userId, status: 'read', response: null } }),
      ]);

      // タイプ別統計
      const typeStats = await prisma.feedback.groupBy({
        by: ['type'],
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ]
        },
        _count: {
          type: true,
        }
      });

      // 最近のフィードバック
      const recent = await prisma.feedback.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          category: true,
          importance: true,
          status: true,
          createdAt: true,
          isAnonymous: true,
        }
      });

      return {
        success: true,
        data: {
          sent: {
            total: sentTotal,
            pending: sentPending,
            read: sentRead,
            responded: sentResponded,
            responseRate: sentTotal > 0 ? ((sentResponded / sentTotal) * 100).toFixed(1) : '0',
          },
          received: {
            total: receivedTotal,
            unread: receivedUnread,
            pendingResponse: receivedPending,
          },
          typeBreakdown: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.type,
          })),
          recent,
        }
      };
    } catch (error) {
      console.error('Failed to fetch feedback statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }

  // フィードバックタイプ定義
  static getFeedbackTypes() {
    return {
      praise: '称賛',
      improvement: '改善提案',
      question: '質問',
      concern: '懸念',
      request: '要望',
      gratitude: '感謝',
    };
  }

  // カテゴリ定義
  static getFeedbackCategories() {
    return {
      performance: '業績',
      behavior: '行動',
      skill: 'スキル',
      teamwork: 'チームワーク',
      communication: 'コミュニケーション',
      leadership: 'リーダーシップ',
      attitude: '態度',
      other: 'その他',
    };
  }

  // 重要度定義
  static getImportanceLevels() {
    return {
      high: '高',
      medium: '中',
      low: '低',
    };
  }
}