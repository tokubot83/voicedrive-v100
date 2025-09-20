// 通知サービス（データベース接続）
import prisma from '../../lib/prisma';

export interface NotificationData {
  category: string;
  subcategory?: string;
  priority: string;
  title: string;
  content: string;
  target: string;
  senderId: string;
}

export class NotificationService {
  // 通知作成
  static async create(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          ...data,
          status: 'pending',
          recipientCount: this.calculateRecipientCount(data.target),
        },
        include: {
          sender: {
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
        data: notification,
      };
    } catch (error) {
      console.error('Notification creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification',
      };
    }
  }

  // 通知送信
  static async send(notificationId: string) {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'sent',
          sentAt: new Date(),
        }
      });

      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      console.error('Notification send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      };
    }
  }

  // 通知リスト取得
  static async list(filters?: {
    category?: string;
    status?: string;
    senderId?: string;
  }) {
    try {
      const notifications = await prisma.notification.findMany({
        where: filters,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        data: [],
      };
    }
  }

  // 通知詳細取得
  static async getById(id: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id },
        include: {
          sender: true,
        }
      });

      if (!notification) {
        return {
          success: false,
          error: 'Notification not found',
        };
      }

      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notification',
      };
    }
  }

  // 既読数更新
  static async updateReadCount(id: string, increment: number = 1) {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: {
          readCount: {
            increment,
          }
        }
      });

      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      console.error('Failed to update read count:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update read count',
      };
    }
  }

  // 受信者数計算（簡易版）
  private static calculateRecipientCount(target: string): number {
    const targetMap: { [key: string]: number } = {
      'all': 100,
      'doctors': 20,
      'nurses': 40,
      'technicians': 15,
      'admin': 10,
      'selected': 5,
    };

    return targetMap[target] || 1;
  }

  // 統計情報取得
  static async getStatistics(userId?: string) {
    try {
      const where = userId ? { senderId: userId } : {};

      const [total, sent, pending, failed] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { ...where, status: 'sent' } }),
        prisma.notification.count({ where: { ...where, status: 'pending' } }),
        prisma.notification.count({ where: { ...where, status: 'failed' } }),
      ]);

      const recentNotifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
        }
      });

      return {
        success: true,
        data: {
          total,
          sent,
          pending,
          failed,
          successRate: total > 0 ? ((sent / total) * 100).toFixed(1) : '0',
          recent: recentNotifications,
        }
      };
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }
}