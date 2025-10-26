/**
 * UserSyncService
 * 医療システムとVoiceDriveユーザーの同期サービス
 *
 * Phase 2.6: UserManagementPage統合
 * 最終更新: 2025-10-26
 * 参照: UserManagementPage_VoiceDrive回答_20251026.md
 */

import { PrismaClient, User, SyncStatus } from '@prisma/client';
import { MedicalSystemClient, MedicalSystemEmployee } from './MedicalSystemClient';

const prisma = new PrismaClient();

export class UserSyncService {
  /**
   * 単一ユーザーを医療システムから同期
   *
   * @param userId - VoiceDrive内部のユーザーID
   * @returns 同期後のユーザー情報
   */
  static async syncSingleUser(userId: string): Promise<User> {
    try {
      console.log(`[UserSyncService.syncSingleUser] 開始: userId=${userId}`);

      // 1. VoiceDriveからユーザー取得
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error(`ユーザーが見つかりません: userId=${userId}`);
      }

      // 2. 医療システムから最新データ取得（employeeIdで取得）
      const medicalEmployee = await MedicalSystemClient.getEmployee(user.employeeId);

      // 3. VoiceDrive側のユーザー情報を更新
      const updatedUser = await this.updateUserFromMedicalSystem(user.id, medicalEmployee);

      console.log(`[UserSyncService.syncSingleUser] 成功: userId=${userId}, employeeId=${user.employeeId}`);

      return updatedUser;
    } catch (error) {
      console.error(`[UserSyncService.syncSingleUser] エラー: userId=${userId}`, error);

      // エラー状態をDBに記録
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      await prisma.user.update({
        where: { id: userId },
        data: {
          syncStatus: SyncStatus.error,
          syncErrorMessage: errorMessage,
          lastSyncedAt: new Date()
        }
      });

      throw error;
    }
  }

  /**
   * 全ユーザーを医療システムから一括同期
   *
   * @returns 同期結果の統計情報
   */
  static async syncAllUsers(): Promise<{
    totalUsers: number;
    succeeded: number;
    failed: number;
    skipped: number;
    errors: Array<{ userId: string; employeeId: string; error: string }>;
  }> {
    try {
      console.log('[UserSyncService.syncAllUsers] 開始');

      // 1. 医療システムから全職員データ取得（ページネーション対応）
      const allEmployees = await this.fetchAllEmployees();

      console.log(`[UserSyncService.syncAllUsers] 医療システムから${allEmployees.length}名取得`);

      // 2. VoiceDriveの全ユーザー取得
      const voiceDriveUsers = await prisma.user.findMany({
        where: { isRetired: false }
      });

      console.log(`[UserSyncService.syncAllUsers] VoiceDriveに${voiceDriveUsers.length}名存在`);

      // 3. employeeId をキーにしたマップ作成
      const employeeMap = new Map<string, MedicalSystemEmployee>();
      allEmployees.forEach(emp => {
        employeeMap.set(emp.employeeId, emp);
      });

      // 4. 各ユーザーを同期
      let succeeded = 0;
      let failed = 0;
      let skipped = 0;
      const errors: Array<{ userId: string; employeeId: string; error: string }> = [];

      for (const user of voiceDriveUsers) {
        try {
          const medicalEmployee = employeeMap.get(user.employeeId);

          if (!medicalEmployee) {
            // 医療システムに存在しないユーザー（スキップ）
            console.warn(`[UserSyncService.syncAllUsers] 医療システムに存在しません: ${user.employeeId}`);
            skipped++;
            continue;
          }

          // 更新
          await this.updateUserFromMedicalSystem(user.id, medicalEmployee);
          succeeded++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '不明なエラー';
          console.error(`[UserSyncService.syncAllUsers] ユーザー同期エラー: ${user.employeeId}`, error);

          errors.push({
            userId: user.id,
            employeeId: user.employeeId,
            error: errorMessage
          });

          failed++;
        }
      }

      const result = {
        totalUsers: voiceDriveUsers.length,
        succeeded,
        failed,
        skipped,
        errors
      };

      console.log('[UserSyncService.syncAllUsers] 完了:', result);

      return result;
    } catch (error) {
      console.error('[UserSyncService.syncAllUsers] エラー:', error);
      throw error;
    }
  }

  /**
   * 医療システムから全職員データを取得（ページネーション自動処理）
   *
   * @returns 全職員データの配列
   */
  private static async fetchAllEmployees(): Promise<MedicalSystemEmployee[]> {
    const allEmployees: MedicalSystemEmployee[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await MedicalSystemClient.getAllEmployees({
        page,
        limit: 100,
        isActive: true // アクティブユーザーのみ
      });

      allEmployees.push(...response.employees);

      hasNext = response.pagination.hasNext;
      page++;

      console.log(`[UserSyncService.fetchAllEmployees] Page ${response.pagination.page}: ${response.employees.length}件取得`);
    }

    return allEmployees;
  }

  /**
   * 医療システムのデータでVoiceDriveユーザーを更新
   *
   * @param userId - VoiceDrive内部のユーザーID
   * @param medicalEmployee - 医療システムの職員データ
   * @returns 更新後のユーザー情報
   */
  private static async updateUserFromMedicalSystem(
    userId: string,
    medicalEmployee: MedicalSystemEmployee
  ): Promise<User> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          // 医療システムがマスターのフィールド
          name: medicalEmployee.name,
          email: medicalEmployee.email,
          department: medicalEmployee.department,
          position: medicalEmployee.position,
          professionCategory: medicalEmployee.professionCategory,
          role: medicalEmployee.role,
          permissionLevel: medicalEmployee.permissionLevel,
          facilityId: medicalEmployee.facilityId,
          avatar: medicalEmployee.avatar,
          isRetired: !medicalEmployee.isActive,

          // 同期ステータス更新
          syncStatus: SyncStatus.synced,
          lastSyncedAt: new Date(),
          syncErrorMessage: null,

          // updatedAt自動更新
          updatedAt: new Date()
        }
      });

      console.log(`[UserSyncService.updateUserFromMedicalSystem] 更新成功: ${medicalEmployee.employeeId}`);

      return updatedUser;
    } catch (error) {
      console.error(`[UserSyncService.updateUserFromMedicalSystem] 更新エラー: ${medicalEmployee.employeeId}`, error);
      throw error;
    }
  }

  /**
   * 同期ステータスを取得
   *
   * @returns 同期ステータス統計
   */
  static async getSyncStatus(): Promise<{
    totalUsers: number;
    synced: number;
    pending: number;
    error: number;
    neverSynced: number;
  }> {
    const [totalUsers, synced, pending, error, neverSynced] = await Promise.all([
      prisma.user.count({ where: { isRetired: false } }),
      prisma.user.count({ where: { syncStatus: SyncStatus.synced, isRetired: false } }),
      prisma.user.count({ where: { syncStatus: SyncStatus.pending, isRetired: false } }),
      prisma.user.count({ where: { syncStatus: SyncStatus.error, isRetired: false } }),
      prisma.user.count({ where: { syncStatus: SyncStatus.never_synced, isRetired: false } })
    ]);

    return {
      totalUsers,
      synced,
      pending,
      error,
      neverSynced
    };
  }
}
