import { User, Post, Comment } from '../types';
import { AuditService } from './AuditService';
import { NotificationService } from './NotificationService';

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

export class RetirementProcessingService {
  private static instance: RetirementProcessingService;
  private retiredUsers: Map<string, RetiredUserData> = new Map();

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
   * 退職処理を実行
   * レベル6権限が必要
   */
  async processRetirement(
    userId: string,
    processedBy: User,
    options: RetirementProcessingOptions
  ): Promise<void> {
    // 権限チェック
    if (processedBy.hierarchyLevel < 6) {
      throw new Error('退職処理にはレベル6以上の権限が必要です');
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
      // 1. ユーザーアカウントの無効化
      const anonymizedId = await this.deactivateUserAccount(userId);

      // 2. 投稿とコメントの匿名化
      await this.anonymizeUserContent(userId, anonymizedId, options);

      // 3. 権限とアクセスの取り消し
      await this.revokeAllPermissions(userId);

      // 4. 退職者データの記録
      const retiredUserData: RetiredUserData = {
        originalUserId: userId,
        retirementDate: new Date(),
        anonymizedId,
        department: '', // 実際のユーザーデータから取得
        processingLevel: processedBy.hierarchyLevel,
        processedBy: processedBy.id
      };
      this.retiredUsers.set(userId, retiredUserData);

      // 5. 関連部署への通知
      await this.notifyRelevantParties(userId, processedBy);

      // 処理完了をログに記録
      await this.auditService.logAction({
        userId: processedBy.id,
        action: 'RETIREMENT_PROCESS_COMPLETE',
        targetId: userId,
        details: {
          anonymizedId,
          timestamp: new Date()
        },
        risk: 'HIGH'
      });

    } catch (error) {
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
  private async deactivateUserAccount(userId: string): Promise<string> {
    // 匿名IDの生成（元のIDと関連付けられない形式）
    const anonymizedId = `RETIRED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // アカウントステータスを「退職済み」に更新
    // 実際の実装では、データベースの更新処理を行う
    
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
    // 投稿の匿名化処理
    // - 実名投稿 → 「退職者」または「元[部署名]職員」に変更
    // - 部署レベル投稿 → そのまま保持
    // - 匿名投稿 → そのまま保持

    switch (options.anonymizationLevel) {
      case 'full':
        // 完全匿名化：すべて「退職者」として表示
        break;
      case 'department':
        // 部署レベル保持：「元[部署名]職員」として表示
        break;
      case 'partial':
        // 部分的保持：役職情報を除き、部署情報は保持
        break;
    }
  }

  /**
   * すべての権限を取り消し
   */
  private async revokeAllPermissions(userId: string): Promise<void> {
    // - ログイン権限の取り消し
    // - 承認権限の取り消し
    // - 特殊権限の取り消し
    // - APIアクセストークンの無効化
  }

  /**
   * 関連部署への通知
   */
  private async notifyRelevantParties(
    userId: string,
    processedBy: User
  ): Promise<void> {
    // 通知対象：
    // - 直属の上司
    // - 人事部門
    // - 承認フローに関わっていた場合は代替承認者
    
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
  }

  /**
   * 退職者の投稿を取得する際の表示名を返す
   */
  getRetiredUserDisplayName(
    userId: string,
    originalDepartment?: string
  ): string {
    const retiredData = this.retiredUsers.get(userId);
    if (!retiredData) {
      return '退職者';
    }

    // 退職からの経過期間を計算
    const monthsSinceRetirement = this.calculateMonthsSince(retiredData.retirementDate);

    // 一定期間経過後は完全匿名化
    if (monthsSinceRetirement > 24) {
      return '退職者';
    }

    // 部署情報を含む場合
    if (originalDepartment) {
      return `元${originalDepartment}職員`;
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
   * レベル7権限が必要
   */
  async reverseRetirement(
    userId: string,
    processedBy: User,
    reason: string
  ): Promise<void> {
    if (processedBy.hierarchyLevel < 7) {
      throw new Error('退職処理の取り消しにはレベル7の権限が必要です');
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

    // 実際の復元処理...
  }
}