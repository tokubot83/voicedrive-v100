// Phase 2: Approvals Page - Actionable Notification Service
// データベース永続化を使用した承認通知サービス

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateActionableNotificationInput {
  // 基本情報
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  content: string;
  target: string;
  senderId: string;

  // Approvals page専用フィールド
  notificationType: 'APPROVAL_REQUIRED' | 'MEMBER_SELECTION' | 'VOTE_REQUIRED' | 'EMERGENCY_ACTION' | 'ESCALATION' | 'PROJECT_UPDATE' | 'DEADLINE_REMINDER';
  urgency: 'normal' | 'high' | 'urgent';
  actionRequired: boolean;
  dueDate?: Date;
  metadata?: any; // { projectId, amount, etc }
  relatedEntityType?: string; // Post, Poll, ApprovalTask
  relatedEntityId?: string;

  // アクション定義
  actions: Array<{
    actionType: 'approve' | 'reject' | 'view' | 'participate' | 'decline' | 'vote' | 'escalate';
    actionLabel: string;
    actionUrl?: string;
    actionData?: any;
    isPrimary?: boolean;
    isDestructive?: boolean;
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
  }>;

  // 受信者リスト
  recipientIds: string[];
}

export interface ExecuteActionInput {
  notificationId: string;
  actionId: string;
  executedBy: string;
  result?: any;
}

export interface ActionCallback {
  actionType: string;
  handler: (data: { notificationId: string; executedBy: string; actionData?: any; result?: any }) => Promise<void>;
}

class ActionableNotificationService {
  private static instance: ActionableNotificationService;
  private actionCallbacks: Map<string, ActionCallback['handler']> = new Map();

  private constructor() {}

  public static getInstance(): ActionableNotificationService {
    if (!ActionableNotificationService.instance) {
      ActionableNotificationService.instance = new ActionableNotificationService();
    }
    return ActionableNotificationService.instance;
  }

  /**
   * アクション可能な通知を作成（データベース永続化）
   */
  public async createActionableNotification(input: CreateActionableNotificationInput): Promise<string> {
    try {
      // 1. Notificationレコードを作成
      const notification = await prisma.notification.create({
        data: {
          category: input.category,
          subcategory: input.subcategory,
          priority: input.priority,
          title: input.title,
          content: input.content,
          target: input.target,
          senderId: input.senderId,
          status: 'pending',
          sentAt: new Date(),
          recipientCount: input.recipientIds.length,
          readCount: 0,
          clickCount: 0,

          // Approvals page専用フィールド
          notificationType: input.notificationType,
          urgency: input.urgency,
          actionRequired: input.actionRequired,
          dueDate: input.dueDate,
          metadata: input.metadata || {},
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,

          // リレーション: アクション
          actions: {
            create: input.actions.map((action, index) => ({
              actionType: action.actionType,
              actionLabel: action.actionLabel,
              actionUrl: action.actionUrl,
              actionData: action.actionData || {},
              isPrimary: action.isPrimary ?? false,
              isDestructive: action.isDestructive ?? false,
              requiresConfirmation: action.requiresConfirmation ?? false,
              confirmationMessage: action.confirmationMessage,
            }))
          },

          // リレーション: 受信者
          recipients: {
            create: input.recipientIds.map(userId => ({
              userId,
              isRead: false,
              actionTaken: null,
            }))
          }
        },
        include: {
          actions: true,
          recipients: true,
        }
      });

      console.log(`✅ Actionable Notification created: ${notification.id}`);
      console.log(`   - Type: ${notification.notificationType}`);
      console.log(`   - Recipients: ${notification.recipientCount}`);
      console.log(`   - Actions: ${notification.actions.length}`);

      return notification.id;

    } catch (error) {
      console.error('❌ Failed to create actionable notification:', error);
      throw error;
    }
  }

  /**
   * 通知アクションを実行
   */
  public async executeNotificationAction(input: ExecuteActionInput): Promise<void> {
    try {
      const { notificationId, actionId, executedBy, result } = input;

      // 1. アクションを検索
      const action = await prisma.notificationAction.findFirst({
        where: {
          notificationId,
          id: actionId,
        },
        include: {
          notification: true,
        }
      });

      if (!action) {
        throw new Error(`Action not found: ${actionId} for notification ${notificationId}`);
      }

      // 2. アクションを実行済みとしてマーク
      await prisma.notificationAction.update({
        where: { id: actionId },
        data: {
          executedAt: new Date(),
          executedBy,
          result: result || {},
        }
      });

      // 3. NotificationRecipientを更新（アクション実行済み）
      await prisma.notificationRecipient.updateMany({
        where: {
          notificationId,
          userId: executedBy,
        },
        data: {
          actionTaken: action.actionType,
          actionTakenAt: new Date(),
          isRead: true,
          readAt: new Date(),
        }
      });

      // 4. 登録されたコールバックを実行
      const callback = this.actionCallbacks.get(action.actionType);
      if (callback) {
        await callback({
          notificationId,
          executedBy,
          actionData: action.actionData,
          result,
        });
      }

      console.log(`✅ Action executed: ${action.actionType} by ${executedBy}`);

    } catch (error) {
      console.error('❌ Failed to execute action:', error);
      throw error;
    }
  }

  /**
   * アクションコールバックを登録
   * 例: approve実行時にApprovalTaskのstatusを更新する
   */
  public registerActionCallback(callback: ActionCallback): void {
    this.actionCallbacks.set(callback.actionType, callback.handler);
    console.log(`✅ Action callback registered: ${callback.actionType}`);
  }

  /**
   * ユーザーの通知一覧を取得（フィルター付き）
   */
  public async getUserNotifications(
    userId: string,
    filter?: {
      notificationType?: string;
      unreadOnly?: boolean;
      pendingOnly?: boolean;
      limit?: number;
    }
  ): Promise<any[]> {
    try {
      const where: any = {
        recipients: {
          some: {
            userId,
          }
        }
      };

      if (filter?.notificationType) {
        where.notificationType = filter.notificationType;
      }

      if (filter?.unreadOnly) {
        where.recipients = {
          some: {
            userId,
            isRead: false,
          }
        };
      }

      if (filter?.pendingOnly) {
        where.recipients = {
          some: {
            userId,
            actionTaken: null,
          }
        };
        where.actionRequired = true;
      }

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          actions: {
            where: {
              executedBy: null, // 未実行のアクションのみ
            }
          },
          recipients: {
            where: {
              userId,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: filter?.limit || 50,
      });

      return notifications;

    } catch (error) {
      console.error('❌ Failed to get user notifications:', error);
      throw error;
    }
  }

  /**
   * 通知を既読にする
   */
  public async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notificationRecipient.updateMany({
        where: {
          notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        }
      });

      // 既読カウント更新
      const readCount = await prisma.notificationRecipient.count({
        where: {
          notificationId,
          isRead: true,
        }
      });

      await prisma.notification.update({
        where: { id: notificationId },
        data: { readCount },
      });

      console.log(`✅ Notification marked as read: ${notificationId} by ${userId}`);

    } catch (error) {
      console.error('❌ Failed to mark as read:', error);
      throw error;
    }
  }

  /**
   * 通知統計を取得
   */
  public async getNotificationStats(userId: string): Promise<{
    pending: number;
    unread: number;
    total: number;
    overdue: number;
    byType: Record<string, number>;
  }> {
    try {
      const now = new Date();

      // 全通知
      const total = await prisma.notificationRecipient.count({
        where: { userId }
      });

      // 未読
      const unread = await prisma.notificationRecipient.count({
        where: {
          userId,
          isRead: false,
        }
      });

      // 未アクション（アクション必須のもの）
      const pending = await prisma.notificationRecipient.count({
        where: {
          userId,
          actionTaken: null,
          notification: {
            actionRequired: true,
          }
        }
      });

      // 期限切れ
      const overdue = await prisma.notificationRecipient.count({
        where: {
          userId,
          actionTaken: null,
          notification: {
            actionRequired: true,
            dueDate: {
              lt: now,
            }
          }
        }
      });

      // タイプ別集計
      const notifications = await prisma.notification.findMany({
        where: {
          recipients: {
            some: { userId }
          }
        },
        select: {
          notificationType: true,
        }
      });

      const byType: Record<string, number> = {};
      notifications.forEach(n => {
        if (n.notificationType) {
          byType[n.notificationType] = (byType[n.notificationType] || 0) + 1;
        }
      });

      return {
        pending,
        unread,
        total,
        overdue,
        byType,
      };

    } catch (error) {
      console.error('❌ Failed to get notification stats:', error);
      throw error;
    }
  }
}

export default ActionableNotificationService;
