/**
 * 緊急アカウント停止サービス v2.0 - Prisma統合版
 *
 * Phase 2: DB永続化 + Webhook連携
 * LocalStorageを廃止し、Prismaでデータベース管理
 *
 * 職員カルテシステム障害時の応急措置として、
 * レベル14-17（人事部門）のみが実行可能なアカウント無効化機能
 */

import { PrismaClient } from '@prisma/client';
import { User } from '../types';
import { retirementWebhookService } from './RetirementWebhookService';

const prisma = new PrismaClient();

export interface EmergencyDeactivation {
  id: string;
  targetUserId: string;
  targetEmployeeId?: string;
  targetUserName?: string;
  executedBy: string;
  executorEmployeeId?: string;
  executorName?: string;
  executorLevel: number;
  reason: string;
  timestamp: Date;
  isEmergency: boolean;
  deactivationType: string;
  syncToStaffSystem: boolean;
  status: string;
}

export interface EmergencyDeactivationResult {
  success: boolean;
  message: string;
  deactivation?: EmergencyDeactivation;
}

/**
 * 緊急アカウント停止サービス（Prisma統合版）
 */
export class EmergencyAccountService {
  private static instance: EmergencyAccountService;

  private constructor() {}

  static getInstance(): EmergencyAccountService {
    if (!this.instance) {
      this.instance = new EmergencyAccountService();
    }
    return this.instance;
  }

  /**
   * 権限チェック：レベル14-17のみ実行可能
   */
  private hasPermission(executorUser: User): boolean {
    const permissionLevel = executorUser.permissionLevel;
    return permissionLevel >= 14 && permissionLevel <= 17;
  }

  /**
   * アカウントを緊急停止
   * @param targetUserId 停止対象のユーザーID
   * @param executorUser 実行者（レベル14-17）
   * @param reason 停止理由
   * @returns 停止結果
   */
  async deactivateAccount(
    targetUserId: string,
    executorUser: User,
    reason: string
  ): Promise<EmergencyDeactivationResult> {
    // 権限チェック
    if (!this.hasPermission(executorUser)) {
      return {
        success: false,
        message: '権限がありません。緊急アカウント停止は人事部門（レベル14-17）のみ実行可能です。'
      };
    }

    // 理由の必須チェック
    if (!reason || reason.trim().length === 0) {
      return {
        success: false,
        message: '停止理由を入力してください。'
      };
    }

    // 対象ユーザーを取得
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        employeeId: true,
        name: true
      }
    });

    if (!targetUser) {
      return {
        success: false,
        message: '対象ユーザーが見つかりません。'
      };
    }

    try {
      // EmergencyDeactivationレコードを作成（Prisma使用）
      const deactivationRecord = await prisma.emergencyDeactivation.create({
        data: {
          targetUserId,
          targetEmployeeId: targetUser.employeeId,
          targetUserName: targetUser.name,
          executedBy: executorUser.id,
          executorEmployeeId: executorUser.employeeId,
          executorName: executorUser.name,
          executorLevel: executorUser.permissionLevel,
          reason: reason.trim(),
          timestamp: new Date(),
          isEmergency: true,
          deactivationType: 'emergency',
          syncToStaffSystem: false, // 医療システム復旧後に同期
          status: 'pending',
          retryCount: 0
        }
      });

      // ユーザーアカウントを無効化
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isActive: false,
          permissionLevel: 0, // 権限を剥奪
          updatedAt: new Date()
        }
      });

      // 監査ログに記録
      await this.logAuditAction(deactivationRecord, executorUser);

      // 医療システムへのWebhook送信を試行
      const webhookResult = await retirementWebhookService.notifyEmergencyDeactivation({
        deactivationId: deactivationRecord.id,
        targetUserId,
        targetEmployeeId: targetUser.employeeId,
        targetUserName: targetUser.name,
        executedBy: executorUser.id,
        executorEmployeeId: executorUser.employeeId,
        executorName: executorUser.name,
        executorLevel: executorUser.permissionLevel,
        reason: reason.trim(),
        timestamp: new Date().toISOString(),
        isEmergency: true
      });

      if (webhookResult.success) {
        // Webhook送信成功 → 即座に同期完了
        await prisma.emergencyDeactivation.update({
          where: { id: deactivationRecord.id },
          data: {
            syncToStaffSystem: true,
            syncedAt: new Date(),
            status: 'completed',
            updatedAt: new Date()
          }
        });

        console.log(`[緊急停止] Webhook送信成功 - 即座に同期完了: ${deactivationRecord.id}`);
      } else {
        // Webhook送信失敗 → 同期キューに登録
        await this.queueSyncToStaffSystem(deactivationRecord);

        console.log(`[緊急停止] Webhook送信失敗 - 同期キューに登録: ${deactivationRecord.id}`);
      }

      console.log(`[緊急停止] ${targetUserId} を停止しました（実行者: ${executorUser.name}）`);

      return {
        success: true,
        message: webhookResult.success
          ? 'アカウントを緊急停止し、医療システムに即座に通知しました。'
          : 'アカウントを緊急停止しました。医療システム復旧後に自動同期されます。',
        deactivation: {
          id: deactivationRecord.id,
          targetUserId: deactivationRecord.targetUserId,
          targetEmployeeId: deactivationRecord.targetEmployeeId || undefined,
          targetUserName: deactivationRecord.targetUserName || undefined,
          executedBy: deactivationRecord.executedBy,
          executorEmployeeId: deactivationRecord.executorEmployeeId || undefined,
          executorName: deactivationRecord.executorName || undefined,
          executorLevel: deactivationRecord.executorLevel,
          reason: deactivationRecord.reason,
          timestamp: deactivationRecord.timestamp,
          isEmergency: deactivationRecord.isEmergency,
          deactivationType: deactivationRecord.deactivationType,
          syncToStaffSystem: deactivationRecord.syncToStaffSystem,
          status: deactivationRecord.status
        }
      };

    } catch (error: any) {
      console.error('[緊急停止エラー]', error);
      return {
        success: false,
        message: `アカウント停止処理中にエラーが発生しました: ${error.message}`
      };
    }
  }

  /**
   * 医療システムへの同期をキューに登録
   */
  private async queueSyncToStaffSystem(
    deactivation: any
  ): Promise<void> {
    try {
      await prisma.staffSystemSyncQueue.create({
        data: {
          type: 'ACCOUNT_DEACTIVATION',
          eventType: 'account.emergency_deactivation',
          eventId: deactivation.id,
          targetUserId: deactivation.targetUserId,
          targetEmployeeId: deactivation.targetEmployeeId,
          payload: {
            deactivationId: deactivation.id,
            targetEmployeeId: deactivation.targetEmployeeId,
            executedBy: deactivation.executorEmployeeId,
            reason: deactivation.reason,
            timestamp: deactivation.timestamp.toISOString()
          },
          targetEndpoint: '/api/webhooks/voicedrive/emergency-deactivation',
          httpMethod: 'POST',
          status: 'queued',
          priority: 9, // 最高優先度
          relatedDeactivationId: deactivation.id
        }
      });

      console.log(`[同期キュー] 医療システムへの同期をキューイング: ${deactivation.id}`);
    } catch (error) {
      console.error('[同期キュー登録エラー]', error);
      throw error;
    }
  }

  /**
   * 監査ログに記録（Prisma使用）
   */
  private async logAuditAction(
    deactivation: any,
    executorUser: User
  ): Promise<void> {
    try {
      // TODO: AuditLogモデルがあればPrismaで記録
      // 現在はコンソールログのみ
      const auditLog = {
        action: 'EMERGENCY_ACCOUNT_DEACTIVATION',
        executedBy: executorUser.id,
        executorName: executorUser.name,
        executorLevel: executorUser.permissionLevel,
        targetUserId: deactivation.targetUserId,
        reason: deactivation.reason,
        timestamp: deactivation.timestamp,
        metadata: {
          isEmergency: true,
          deactivationId: deactivation.id,
          syncPending: !deactivation.syncToStaffSystem
        }
      };

      console.log('[監査ログ] 緊急アカウント停止を記録:', auditLog);

      // Prismaで監査ログを保存
      // await prisma.auditLog.create({ data: auditLog });

    } catch (error) {
      console.error('[監査ログ記録エラー]', error);
    }
  }

  /**
   * 停止記録を取得（Prisma使用）
   */
  async getDeactivationRecord(targetUserId: string): Promise<EmergencyDeactivation | null> {
    try {
      const record = await prisma.emergencyDeactivation.findFirst({
        where: { targetUserId },
        orderBy: { timestamp: 'desc' }
      });

      if (!record) {
        return null;
      }

      return {
        id: record.id,
        targetUserId: record.targetUserId,
        targetEmployeeId: record.targetEmployeeId || undefined,
        targetUserName: record.targetUserName || undefined,
        executedBy: record.executedBy,
        executorEmployeeId: record.executorEmployeeId || undefined,
        executorName: record.executorName || undefined,
        executorLevel: record.executorLevel,
        reason: record.reason,
        timestamp: record.timestamp,
        isEmergency: record.isEmergency,
        deactivationType: record.deactivationType,
        syncToStaffSystem: record.syncToStaffSystem,
        status: record.status
      };
    } catch (error) {
      console.error('[停止記録取得エラー]', error);
      return null;
    }
  }

  /**
   * 停止を解除（レベル14-17のみ）
   */
  async reactivateAccount(
    targetUserId: string,
    executorUser: User
  ): Promise<EmergencyDeactivationResult> {
    // 権限チェック
    if (!this.hasPermission(executorUser)) {
      return {
        success: false,
        message: '権限がありません。'
      };
    }

    try {
      // ユーザーアカウントを再有効化
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isActive: true,
          updatedAt: new Date()
          // 注意: permissionLevelは手動で設定する必要がある
        }
      });

      // 停止記録のステータスを更新
      await prisma.emergencyDeactivation.updateMany({
        where: {
          targetUserId,
          status: { not: 'reactivated' }
        },
        data: {
          status: 'reactivated',
          updatedAt: new Date()
        }
      });

      console.log(`[停止解除] ${targetUserId} を再有効化しました（実行者: ${executorUser.name}）`);

      return {
        success: true,
        message: 'アカウントを再有効化しました。権限レベルは別途設定してください。'
      };

    } catch (error: any) {
      console.error('[停止解除エラー]', error);
      return {
        success: false,
        message: `停止解除処理中にエラーが発生しました: ${error.message}`
      };
    }
  }

  /**
   * すべての緊急停止記録を取得（管理用）
   */
  async getAllDeactivations(limit: number = 50) {
    return await prisma.emergencyDeactivation.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  /**
   * 同期待ちの緊急停止記録を取得
   */
  async getPendingSyncDeactivations() {
    return await prisma.emergencyDeactivation.findMany({
      where: {
        syncToStaffSystem: false,
        status: 'pending'
      },
      orderBy: { timestamp: 'asc' }
    });
  }
}

// シングルトンインスタンスをエクスポート
export const emergencyAccountService = EmergencyAccountService.getInstance();

// デフォルトエクスポート
export default emergencyAccountService;
