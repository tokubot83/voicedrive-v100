/**
 * 緊急アカウント停止サービス
 *
 * 職員カルテシステム障害時の応急措置として、
 * レベル14-17（人事部門）のみが実行可能なアカウント無効化機能
 */

import { User } from '../types';

export interface EmergencyDeactivation {
  targetUserId: string;
  executedBy: string; // レベル14-17のユーザーID
  reason: string; // 必須入力
  timestamp: Date;
  isEmergency: true; // 応急措置フラグ
  syncToStaffSystem: boolean; // 職員カルテへの同期待ち
}

export interface EmergencyDeactivationResult {
  success: boolean;
  message: string;
  deactivation?: EmergencyDeactivation;
}

/**
 * 緊急アカウント停止サービス
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

    try {
      // 停止記録を作成
      const deactivation: EmergencyDeactivation = {
        targetUserId,
        executedBy: executorUser.id,
        reason: reason.trim(),
        timestamp: new Date(),
        isEmergency: true,
        syncToStaffSystem: false // 職員カルテシステム復旧後に同期
      };

      // LocalStorageに記録（本番環境ではPrismaでDB保存）
      await this.saveDeactivationRecord(deactivation);

      // 監査ログに記録
      await this.logAuditAction(deactivation, executorUser);

      // 職員カルテシステムに通知（復旧後に同期）
      await this.notifyStaffSystemWhenAvailable(targetUserId);

      console.log(`[緊急停止] ${targetUserId} を停止しました（実行者: ${executorUser.name}）`);

      return {
        success: true,
        message: 'アカウントを緊急停止しました。職員カルテシステム復旧後に自動同期されます。',
        deactivation
      };
    } catch (error) {
      console.error('[緊急停止エラー]', error);
      return {
        success: false,
        message: 'アカウント停止処理中にエラーが発生しました。'
      };
    }
  }

  /**
   * 停止記録を保存
   * @param deactivation 停止記録
   */
  private async saveDeactivationRecord(deactivation: EmergencyDeactivation): Promise<void> {
    try {
      // LocalStorageに保存（本番環境ではPrismaでDB保存）
      const key = `emergency_deactivation_${deactivation.targetUserId}`;
      localStorage.setItem(key, JSON.stringify(deactivation));

      // TODO: Prismaでデータベースに保存
      // await prisma.emergencyDeactivation.create({
      //   data: {
      //     targetUserId: deactivation.targetUserId,
      //     executedBy: deactivation.executedBy,
      //     reason: deactivation.reason,
      //     timestamp: deactivation.timestamp,
      //     syncToStaffSystem: deactivation.syncToStaffSystem
      //   }
      // });
    } catch (error) {
      console.error('[停止記録保存エラー]', error);
      throw error;
    }
  }

  /**
   * 監査ログに記録
   * @param deactivation 停止記録
   * @param executorUser 実行者
   */
  private async logAuditAction(
    deactivation: EmergencyDeactivation,
    executorUser: User
  ): Promise<void> {
    try {
      // 監査ログを作成
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
          syncPending: !deactivation.syncToStaffSystem
        }
      };

      // LocalStorageに保存（本番環境ではPrismaでDB保存）
      const auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      auditLogs.push(auditLog);
      localStorage.setItem('audit_logs', JSON.stringify(auditLogs));

      console.log('[監査ログ] 緊急アカウント停止を記録:', auditLog);

      // TODO: Prismaでデータベースに保存
      // await prisma.auditLog.create({
      //   data: auditLog
      // });
    } catch (error) {
      console.error('[監査ログ記録エラー]', error);
    }
  }

  /**
   * 職員カルテシステムに通知（復旧後に同期）
   * @param targetUserId 停止対象のユーザーID
   */
  private async notifyStaffSystemWhenAvailable(targetUserId: string): Promise<void> {
    try {
      // 職員カルテシステムに同期リクエストをキューイング
      const syncQueue = JSON.parse(localStorage.getItem('staff_system_sync_queue') || '[]');
      syncQueue.push({
        type: 'ACCOUNT_DEACTIVATION',
        targetUserId,
        queuedAt: new Date()
      });
      localStorage.setItem('staff_system_sync_queue', JSON.stringify(syncQueue));

      console.log('[同期キュー] 職員カルテシステムへの同期をキューイング:', targetUserId);

      // TODO: 職員カルテシステムのヘルスチェックを定期的に実行し、
      //       復旧後に自動同期する機能を実装
    } catch (error) {
      console.error('[同期通知エラー]', error);
    }
  }

  /**
   * 停止記録を取得
   * @param targetUserId ユーザーID
   * @returns 停止記録（存在しない場合はnull）
   */
  async getDeactivationRecord(targetUserId: string): Promise<EmergencyDeactivation | null> {
    try {
      const key = `emergency_deactivation_${targetUserId}`;
      const record = localStorage.getItem(key);
      return record ? JSON.parse(record) : null;
    } catch (error) {
      console.error('[停止記録取得エラー]', error);
      return null;
    }
  }

  /**
   * 停止を解除（レベル14-17のみ）
   * @param targetUserId 停止対象のユーザーID
   * @param executorUser 実行者（レベル14-17）
   * @returns 解除結果
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
      // 停止記録を削除
      const key = `emergency_deactivation_${targetUserId}`;
      localStorage.removeItem(key);

      console.log(`[停止解除] ${targetUserId} を再有効化しました（実行者: ${executorUser.name}）`);

      return {
        success: true,
        message: 'アカウントを再有効化しました。'
      };
    } catch (error) {
      console.error('[停止解除エラー]', error);
      return {
        success: false,
        message: '停止解除処理中にエラーが発生しました。'
      };
    }
  }
}

// シングルトンインスタンスをエクスポート
export const emergencyAccountService = EmergencyAccountService.getInstance();

// デフォルトエクスポート
export default emergencyAccountService;
