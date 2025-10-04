/**
 * ユーザーアカウント作成サービス
 * 医療システムAPIと統合した25レベル権限システム対応
 */

import { medicalSystemAPI } from './MedicalSystemAPI';
import type { ProfessionCategory } from '@/types/accountLevel';
import { mapLevelToAccountType } from '@/lib/accountLevelHelpers';

/**
 * ユーザー作成リクエスト
 */
export interface CreateUserRequest {
  // 基本情報
  employeeId: string;
  email: string;
  name: string;
  department?: string;
  facilityId?: string;
  role?: string;
  position?: string;

  // 権限レベル計算用
  experienceYears?: number;
  canPerformLeaderDuty?: boolean;
  professionCategory?: ProfessionCategory;

  // 特別権限フラグ
  isHealthCheckupStaff?: boolean;
  isOccupationalPhysician?: boolean;
  isSystemAdmin?: boolean;
}

/**
 * ユーザー作成レスポンス
 */
export interface CreateUserResponse {
  success: boolean;
  userId?: string;
  user?: {
    id: string;
    employeeId: string;
    email: string;
    name: string;
    accountType: string;
    permissionLevel: number;
    canPerformLeaderDuty: boolean;
    professionCategory?: string;
  };
  error?: string;
  fallbackUsed?: boolean; // フォールバック機能を使用したかどうか
}

/**
 * ユーザーアカウント作成サービス
 */
class UserAccountService {
  /**
   * 新規ユーザー作成（医療システムAPI統合）
   * @param request ユーザー作成リクエスト
   * @param jwtToken 医療システムAPI認証トークン
   */
  async createUser(request: CreateUserRequest, jwtToken?: string): Promise<CreateUserResponse> {
    try {
      // 特別権限レベルの判定
      let permissionLevel: number;
      let accountType: string;
      let fallbackUsed = false;

      if (request.isSystemAdmin) {
        permissionLevel = 99;
        accountType = 'SYSTEM_ADMIN';
      } else if (request.isOccupationalPhysician) {
        permissionLevel = 98;
        accountType = 'OCCUPATIONAL_PHYSICIAN';
      } else if (request.isHealthCheckupStaff) {
        permissionLevel = 97;
        accountType = 'HEALTH_CHECKUP_STAFF';
      } else {
        // 通常レベル（1-18, 1.5-4.5）: 医療システムAPIで計算
        const levelResult = await this.calculatePermissionLevel(request, jwtToken);
        permissionLevel = levelResult.permissionLevel;
        accountType = levelResult.accountType;
        fallbackUsed = levelResult.fallbackUsed;
      }

      // Prismaでユーザー作成（実際のDB操作）
      const user = await this.saveUserToDatabase({
        employeeId: request.employeeId,
        email: request.email,
        name: request.name,
        department: request.department,
        facilityId: request.facilityId,
        role: request.role,
        position: request.position,
        accountType,
        permissionLevel,
        canPerformLeaderDuty: request.canPerformLeaderDuty || false,
        professionCategory: request.professionCategory,
      });

      return {
        success: true,
        userId: user.id,
        user: {
          id: user.id,
          employeeId: user.employeeId,
          email: user.email,
          name: user.name,
          accountType: user.accountType,
          permissionLevel: user.permissionLevel,
          canPerformLeaderDuty: user.canPerformLeaderDuty,
          professionCategory: user.professionCategory || undefined,
        },
        fallbackUsed,
      };
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ユーザー作成に失敗しました',
      };
    }
  }

  /**
   * 医療システムAPIで権限レベルを計算
   */
  private async calculatePermissionLevel(
    request: CreateUserRequest,
    jwtToken?: string
  ): Promise<{ permissionLevel: number; accountType: string; fallbackUsed: boolean }> {
    try {
      // JWTトークンを設定
      if (jwtToken) {
        medicalSystemAPI.setAuthToken(jwtToken);
      }

      // 医療システムAPIを呼び出し（フォールバック機能付き）
      const result = await medicalSystemAPI.calculatePermissionLevelWithFallback({
        staffId: request.employeeId,
        facilityId: request.facilityId,
        position: request.position,
        experienceYears: request.experienceYears,
        canPerformLeaderDuty: request.canPerformLeaderDuty,
        profession: request.professionCategory,
      });

      const accountType = result.accountType || mapLevelToAccountType(
        result.permissionLevel,
        result.canPerformLeaderDuty
      );

      // フォールバック使用の判定（detailsにフォールバックマーカーがあるかチェック）
      const fallbackUsed = result.details?.adjustments?.some(
        adj => adj.reason.includes('フォールバック')
      ) || false;

      return {
        permissionLevel: result.permissionLevel,
        accountType,
        fallbackUsed,
      };
    } catch (error) {
      console.error('医療システムAPI呼び出し失敗:', error);
      throw error;
    }
  }

  /**
   * データベースにユーザーを保存
   * 注意: 実際のPrisma実装に置き換える必要があります
   */
  private async saveUserToDatabase(userData: {
    employeeId: string;
    email: string;
    name: string;
    department?: string;
    facilityId?: string;
    role?: string;
    position?: string;
    accountType: string;
    permissionLevel: number;
    canPerformLeaderDuty: boolean;
    professionCategory?: string;
  }): Promise<{
    id: string;
    employeeId: string;
    email: string;
    name: string;
    accountType: string;
    permissionLevel: number;
    canPerformLeaderDuty: boolean;
    professionCategory: string | null;
  }> {
    // TODO: 実際のPrisma実装
    // import { prisma } from '@/lib/prisma';
    // const user = await prisma.user.create({
    //   data: {
    //     employeeId: userData.employeeId,
    //     email: userData.email,
    //     name: userData.name,
    //     department: userData.department,
    //     facilityId: userData.facilityId,
    //     role: userData.role,
    //     position: userData.position,
    //     accountType: userData.accountType,
    //     permissionLevel: userData.permissionLevel,
    //     canPerformLeaderDuty: userData.canPerformLeaderDuty,
    //     professionCategory: userData.professionCategory,
    //   },
    // });
    // return user;

    // 仮実装（テスト用）
    return {
      id: `user_${Date.now()}`,
      employeeId: userData.employeeId,
      email: userData.email,
      name: userData.name,
      accountType: userData.accountType,
      permissionLevel: userData.permissionLevel,
      canPerformLeaderDuty: userData.canPerformLeaderDuty,
      professionCategory: userData.professionCategory || null,
    };
  }

  /**
   * 既存ユーザーの権限レベル再計算
   * @param employeeId 職員ID
   * @param jwtToken 医療システムAPI認証トークン
   */
  async recalculateUserPermissionLevel(
    employeeId: string,
    jwtToken?: string
  ): Promise<{ success: boolean; permissionLevel?: number; error?: string }> {
    try {
      // TODO: 既存ユーザーの情報を取得
      // const user = await prisma.user.findUnique({ where: { employeeId } });
      // if (!user) throw new Error('ユーザーが見つかりません');

      // JWTトークンを設定
      if (jwtToken) {
        medicalSystemAPI.setAuthToken(jwtToken);
      }

      // 医療システムAPIで権限レベルを再計算
      const result = await medicalSystemAPI.calculatePermissionLevelWithFallback({
        staffId: employeeId,
        // TODO: 既存ユーザー情報から取得
        // facilityId: user.facilityId,
        // position: user.position,
        // experienceYears: calculateExperienceYears(user.hireDate),
        // canPerformLeaderDuty: user.canPerformLeaderDuty,
        // profession: user.professionCategory,
      });

      // TODO: データベースを更新
      // await prisma.user.update({
      //   where: { employeeId },
      //   data: {
      //     permissionLevel: result.permissionLevel,
      //     accountType: result.accountType,
      //   },
      // });

      return {
        success: true,
        permissionLevel: result.permissionLevel,
      };
    } catch (error) {
      console.error('権限レベル再計算エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '権限レベル再計算に失敗しました',
      };
    }
  }

  /**
   * バッチ処理: 全ユーザーの権限レベルを再計算
   * @param jwtToken 医療システムAPI認証トークン
   * @param batchSize バッチサイズ（デフォルト: 10）
   */
  async recalculateAllUsersPermissionLevels(
    jwtToken?: string,
    batchSize: number = 10
  ): Promise<{
    success: boolean;
    totalUsers: number;
    successCount: number;
    failedCount: number;
    errors: Array<{ employeeId: string; error: string }>;
  }> {
    try {
      // TODO: 全ユーザーを取得
      // const users = await prisma.user.findMany({
      //   where: { isRetired: false },
      // });

      const users: Array<{ employeeId: string }> = []; // 仮実装
      const errors: Array<{ employeeId: string; error: string }> = [];
      let successCount = 0;

      // バッチ処理
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(user => this.recalculateUserPermissionLevel(user.employeeId, jwtToken))
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
          } else {
            const error = result.status === 'rejected'
              ? result.reason.message
              : result.value.error || '不明なエラー';
            errors.push({ employeeId: batch[j].employeeId, error });
          }
        }

        // レート制限対策（1秒待機）
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        success: errors.length === 0,
        totalUsers: users.length,
        successCount,
        failedCount: errors.length,
        errors,
      };
    } catch (error) {
      console.error('バッチ再計算エラー:', error);
      return {
        success: false,
        totalUsers: 0,
        successCount: 0,
        failedCount: 0,
        errors: [{ employeeId: 'ALL', error: error instanceof Error ? error.message : '不明なエラー' }],
      };
    }
  }
}

// シングルトンインスタンス
export const userAccountService = new UserAccountService();
