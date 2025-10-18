/**
 * 退職処理サービス v2.0 - Prisma統合版
 *
 * Phase 2: DB永続化 + Webhook連携
 * LocalStorageを廃止し、Prismaでデータベース管理
 */

import { PrismaClient } from '@prisma/client';
import { User } from '../types';
import { AuditService } from './AuditService';
import NotificationService from './NotificationService';
import { retirementWebhookService } from './RetirementWebhookService';

const prisma = new PrismaClient();

export interface RetirementProcessingOptions {
  preserveAnonymousContent: boolean;
  anonymizationLevel: 'full' | 'department' | 'partial';
  retentionPeriod?: number; // 月単位での保持期間
}

export interface RetiredUserData {
  originalUserId: string;
  retirementDate: Date;
  anonymizedId: string;
  department: string;
  processingLevel: number;
  processedBy: string;
}

/**
 * 退職処理サービス（Prisma統合版）
 */
export class RetirementProcessingService {
  private static instance: RetirementProcessingService;

  private constructor(
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  static getInstance(
    auditService: AuditService,
    notificationService: NotificationService
  ): RetirementProcessingService {
    if (!RetirementProcessingService.instance) {
      RetirementProcessingService.instance = new RetirementProcessingService(
        auditService,
        notificationService
      );
    }
    return RetirementProcessingService.instance;
  }

  /**
   * 退職処理を実行（4ステップフロー）
   * レベル14以上の権限が必要
   */
  async processRetirement(
    userId: string,
    processedBy: User,
    options: RetirementProcessingOptions
  ): Promise<string> {
    // 権限チェック（レベル14-17: 人事部門）
    if (processedBy.permissionLevel < 14) {
      throw new Error('退職処理にはレベル14以上の権限が必要です');
    }

    // 対象ユーザーを取得
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      throw new Error('対象ユーザーが見つかりません');
    }

    // 退職処理の開始をログに記録
    await this.auditService.logAction({
      userId: processedBy.id,
      action: 'RETIREMENT_PROCESS_START',
      targetId: userId,
      details: {
        options,
        timestamp: new Date()
      },
      risk: 'HIGH'
    });

    try {
      // RetirementProcessレコードを作成
      const retirementProcess = await prisma.retirementProcess.create({
        data: {
          targetUserId: userId,
          targetEmployeeId: targetUser.employeeId,
          targetUserName: targetUser.name,
          initiatedBy: processedBy.id,
          initiatorEmployeeId: processedBy.employeeId,
          initiatorName: processedBy.name,
          initiatorLevel: processedBy.permissionLevel,
          preserveAnonymousContent: options.preserveAnonymousContent,
          anonymizationLevel: options.anonymizationLevel,
          retentionPeriod: options.retentionPeriod || 24,
          currentStep: 1,
          status: 'in_progress'
        }
      });

      console.log(`[退職処理] プロセス開始: ${retirementProcess.id}`);

      // ステップ1: ユーザーアカウントの無効化
      const anonymizedId = await this.deactivateUserAccount(userId, retirementProcess.id);

      await prisma.retirementProcess.update({
        where: { id: retirementProcess.id },
        data: {
          step1CompletedAt: new Date(),
          currentStep: 2
        }
      });

      // Webhook送信: ステップ1完了
      await retirementWebhookService.notifyRetirementStepCompleted(
        retirementProcess.id,
        1,
        'account_deactivation'
      );

      // ステップ2: 投稿とコメントの匿名化
      await this.anonymizeUserContent(userId, anonymizedId, options);

      await prisma.retirementProcess.update({
        where: { id: retirementProcess.id },
        data: {
          step2CompletedAt: new Date(),
          currentStep: 3
        }
      });

      // Webhook送信: ステップ2完了
      await retirementWebhookService.notifyRetirementStepCompleted(
        retirementProcess.id,
        2,
        'content_anonymization'
      );

      // ステップ3: 権限とアクセスの取り消し
      await this.revokeAllPermissions(userId);

      await prisma.retirementProcess.update({
        where: { id: retirementProcess.id },
        data: {
          step3CompletedAt: new Date(),
          currentStep: 4
        }
      });

      // Webhook送信: ステップ3完了
      await retirementWebhookService.notifyRetirementStepCompleted(
        retirementProcess.id,
        3,
        'permission_revocation'
      );

      // ステップ4: 関連部署への通知
      await this.notifyRelevantParties(userId, processedBy);

      await prisma.retirementProcess.update({
        where: { id: retirementProcess.id },
        data: {
          step4CompletedAt: new Date(),
          status: 'completed',
          completedAt: new Date()
        }
      });

      // Webhook送信: 退職処理完了
      await retirementWebhookService.notifyRetirementProcessCompleted(
        retirementProcess.id,
        targetUser.employeeId || undefined
      );

      // 医療システムへの同期キュー登録
      await prisma.staffSystemSyncQueue.create({
        data: {
          type: 'RETIREMENT_PROCESS',
          eventType: 'retirement.completed',
          eventId: retirementProcess.id,
          targetUserId: userId,
          targetEmployeeId: targetUser.employeeId,
          payload: {
            processId: retirementProcess.id,
            employeeId: targetUser.employeeId,
            anonymizedId,
            completedAt: new Date().toISOString()
          },
          targetEndpoint: '/api/webhooks/voicedrive/retirement-process',
          httpMethod: 'POST',
          status: 'queued',
          priority: 8 // 高優先度
        }
      });

      // 処理完了をログに記録
      await this.auditService.logAction({
        userId: processedBy.id,
        action: 'RETIREMENT_PROCESS_COMPLETE',
        targetId: userId,
        details: {
          processId: retirementProcess.id,
          anonymizedId,
          timestamp: new Date()
        },
        risk: 'HIGH'
      });

      console.log(`[退職処理] プロセス完了: ${retirementProcess.id}`);

      return retirementProcess.id;

    } catch (error: any) {
      // エラー時の処理
      await this.auditService.logAction({
        userId: processedBy.id,
        action: 'RETIREMENT_PROCESS_ERROR',
        targetId: userId,
        details: {
          error: error.message,
          timestamp: new Date()
        },
        risk: 'HIGH'
      });

      throw error;
    }
  }

  /**
   * ユーザーアカウントの無効化と匿名ID生成
   */
  private async deactivateUserAccount(userId: string, processId: string): Promise<string> {
    // 匿名IDの生成（元のIDと関連付けられない形式）
    const anonymizedId = `RETIRED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // アカウントステータスを「退職済み」に更新
    await prisma.user.update({
      where: { id: userId },
      data: {
        isRetired: true,
        retirementDate: new Date(),
        anonymizedId,
        updatedAt: new Date()
      }
    });

    console.log(`[退職処理] アカウント無効化完了: ${userId} -> ${anonymizedId}`);

    return anonymizedId;
  }

  /**
   * ユーザーの投稿とコメントを匿名化
   */
  private async anonymizeUserContent(
    userId: string,
    anonymizedId: string,
    options: RetirementProcessingOptions
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { department: true }
    });

    let displayName: string;

    switch (options.anonymizationLevel) {
      case 'full':
        // 完全匿名化：すべて「退職者」として表示
        displayName = '退職者';
        break;
      case 'department':
        // 部署レベル保持：「元[部署名]職員」として表示
        displayName = user?.department ? `元${user.department}職員` : '退職者';
        break;
      case 'partial':
        // 部分的保持：役職情報を除き、部署情報は保持
        displayName = user?.department ? `元${user.department}職員` : '退職者';
        break;
      default:
        displayName = '退職者';
    }

    // 投稿の作成者名を匿名化（実名投稿のみ）
    await prisma.$executeRaw`
      UPDATE posts
      SET author_name = ${displayName}
      WHERE user_id = ${userId}
      AND anonymity_level = 'real_name'
    `;

    // コメントの作成者名を匿名化（実名コメントのみ）
    await prisma.$executeRaw`
      UPDATE comments
      SET author_name = ${displayName}
      WHERE user_id = ${userId}
      AND anonymity_level = 'real_name'
    `;

    console.log(`[退職処理] コンテンツ匿名化完了: ${userId} -> ${displayName}`);
  }

  /**
   * すべての権限を取り消し
   */
  private async revokeAllPermissions(userId: string): Promise<void> {
    // ユーザーのアクセス権限を最小限に設定
    await prisma.user.update({
      where: { id: userId },
      data: {
        permissionLevel: 0, // 権限なし
        canPerformLeaderDuty: false,
        updatedAt: new Date()
      }
    });

    // TODO: APIアクセストークンの無効化（セッション管理実装時）

    console.log(`[退職処理] 権限取り消し完了: ${userId}`);
  }

  /**
   * 関連部署への通知
   */
  private async notifyRelevantParties(
    userId: string,
    processedBy: User
  ): Promise<void> {
    // 人事部門（レベル14-17）に通知
    await this.notificationService.sendNotification({
      recipientId: 'HR_DEPARTMENT',
      type: 'RETIREMENT_PROCESSED',
      title: '退職処理完了通知',
      message: `職員の退職処理が完了しました`,
      data: {
        processedBy: processedBy.id,
        processedAt: new Date()
      },
      priority: 'HIGH'
    });

    console.log(`[退職処理] 通知送信完了: ${userId}`);
  }

  /**
   * 退職者の投稿を取得する際の表示名を返す
   */
  async getRetiredUserDisplayName(
    userId: string,
    originalDepartment?: string
  ): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isRetired: true,
        retirementDate: true,
        department: true
      }
    });

    if (!user || !user.isRetired || !user.retirementDate) {
      return '退職者';
    }

    // 退職からの経過期間を計算
    const monthsSinceRetirement = this.calculateMonthsSince(user.retirementDate);

    // 一定期間経過後は完全匿名化
    if (monthsSinceRetirement > 24) {
      return '退職者';
    }

    // 部署情報を含む場合
    const dept = originalDepartment || user.department;
    if (dept) {
      return `元${dept}職員`;
    }

    return '退職者';
  }

  private calculateMonthsSince(date: Date): number {
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12;
    return months + now.getMonth() - date.getMonth();
  }

  /**
   * 退職処理の取り消し（特殊なケース用）
   * レベル17権限が必要
   */
  async reverseRetirement(
    userId: string,
    processedBy: User,
    reason: string
  ): Promise<void> {
    if (processedBy.permissionLevel < 17) {
      throw new Error('退職処理の取り消しにはレベル17の権限が必要です');
    }

    // 監査ログに記録
    await this.auditService.logAction({
      userId: processedBy.id,
      action: 'RETIREMENT_REVERSAL',
      targetId: userId,
      details: {
        reason,
        timestamp: new Date()
      },
      risk: 'CRITICAL'
    });

    // 退職フラグを解除
    await prisma.user.update({
      where: { id: userId },
      data: {
        isRetired: false,
        retirementDate: null,
        anonymizedId: null,
        updatedAt: new Date()
      }
    });

    console.log(`[退職処理] 退職取り消し完了: ${userId} (理由: ${reason})`);
  }

  /**
   * 退職処理の進捗状況を取得
   */
  async getRetirementProcessStatus(processId: string) {
    return await prisma.retirementProcess.findUnique({
      where: { id: processId }
    });
  }

  /**
   * 特定ユーザーの退職処理履歴を取得
   */
  async getRetirementHistory(userId: string) {
    return await prisma.retirementProcess.findMany({
      where: { targetUserId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
