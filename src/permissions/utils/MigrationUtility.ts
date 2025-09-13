// 権限システム移行ユーティリティ - 6段階から8段階への移行
import { PermissionLevel, PERMISSION_METADATA } from '../types/PermissionTypes';
import { UserRole } from '../../types';

export class PermissionMigrationUtility {
  
  // 旧6段階システムから新8段階システムへのマッピング
  private static readonly OLD_TO_NEW_MAPPING: Record<number, PermissionLevel> = {
    1: PermissionLevel.LEVEL_1,  // 一般従業員 → レベル1
    2: PermissionLevel.LEVEL_2,  // チーフ・主任 → レベル2
    3: PermissionLevel.LEVEL_3,  // 係長・マネージャー → レベル3
    4: PermissionLevel.LEVEL_4,  // 課長 → レベル4
    5: PermissionLevel.LEVEL_7,  // 部長 → レベル7（5,6をスキップ）
    6: PermissionLevel.LEVEL_8   // 役員 → レベル8
  };
  
  // UserRole型から新PermissionLevelへのマッピング
  private static readonly ROLE_TO_PERMISSION_MAPPING: Record<UserRole, PermissionLevel> = {
    'employee': PermissionLevel.LEVEL_1,
    'chief': PermissionLevel.LEVEL_2,
    'manager': PermissionLevel.LEVEL_3,
    'executive': PermissionLevel.LEVEL_8
  };
  
  /**
   * 旧6段階権限レベルから新8段階権限レベルへ移行
   */
  static migrateFromOldLevel(oldLevel: number): PermissionLevel {
    const newLevel = this.OLD_TO_NEW_MAPPING[oldLevel];
    if (!newLevel) {
      console.warn(`Unknown old permission level: ${oldLevel}, defaulting to LEVEL_1`);
      return PermissionLevel.LEVEL_1;
    }
    return newLevel;
  }
  
  /**
   * UserRole型から新PermissionLevelへ移行
   */
  static migrateFromUserRole(role: UserRole): PermissionLevel {
    return this.ROLE_TO_PERMISSION_MAPPING[role] || PermissionLevel.LEVEL_1;
  }
  
  /**
   * ユーザーデータの一括移行
   */
  static async migrateUserData(users: Array<{
    id: string;
    role?: UserRole;
    oldPermissionLevel?: number;
  }>): Promise<Array<{
    id: string;
    permissionLevel: PermissionLevel;
    migrationLog: string;
  }>> {
    return users.map(user => {
      let permissionLevel: PermissionLevel;
      let migrationLog: string;
      
      if (user.oldPermissionLevel !== undefined) {
        // 旧権限レベルからの移行
        permissionLevel = this.migrateFromOldLevel(user.oldPermissionLevel);
        migrationLog = `Migrated from old level ${user.oldPermissionLevel} to ${PERMISSION_METADATA[permissionLevel].displayName}`;
      } else if (user.role) {
        // UserRoleからの移行
        permissionLevel = this.migrateFromUserRole(user.role);
        migrationLog = `Migrated from role ${user.role} to ${PERMISSION_METADATA[permissionLevel].displayName}`;
      } else {
        // デフォルト値
        permissionLevel = PermissionLevel.LEVEL_1;
        migrationLog = 'No existing permission data found, defaulted to LEVEL_1';
      }
      
      return {
        id: user.id,
        permissionLevel,
        migrationLog
      };
    });
  }
  
  /**
   * プロジェクト承認ワークフローの移行
   */
  static migrateApprovalWorkflows(workflows: Array<{
    id: string;
    requiredRole?: UserRole;
    requiredLevel?: string;
  }>): Array<{
    id: string;
    requiredPermissionLevel: PermissionLevel;
  }> {
    return workflows.map(workflow => {
      let requiredPermissionLevel: PermissionLevel;
      
      if (workflow.requiredLevel) {
        // 既存のレベル文字列から移行（例: 'LEVEL_3' → PermissionLevel.LEVEL_3）
        const levelNumber = parseInt(workflow.requiredLevel.replace('LEVEL_', ''));
        requiredPermissionLevel = this.migrateFromOldLevel(levelNumber);
      } else if (workflow.requiredRole) {
        // UserRoleから移行
        requiredPermissionLevel = this.migrateFromUserRole(workflow.requiredRole);
      } else {
        // デフォルトはレベル3（マネージャー承認）
        requiredPermissionLevel = PermissionLevel.LEVEL_3;
      }
      
      return {
        id: workflow.id,
        requiredPermissionLevel
      };
    });
  }
  
  /**
   * 移行レポートの生成
   */
  static generateMigrationReport(
    migratedUsers: Array<{ id: string; permissionLevel: PermissionLevel; migrationLog: string }>
  ): {
    totalUsers: number;
    distributionByLevel: Record<PermissionLevel, number>;
    migrationLogs: string[];
  } {
    const distributionByLevel: Record<PermissionLevel, number> = {
      [PermissionLevel.LEVEL_1]: 0,
      [PermissionLevel.LEVEL_2]: 0,
      [PermissionLevel.LEVEL_3]: 0,
      [PermissionLevel.LEVEL_4]: 0,
      [PermissionLevel.LEVEL_5]: 0,
      [PermissionLevel.LEVEL_6]: 0,
      [PermissionLevel.LEVEL_7]: 0,
      [PermissionLevel.LEVEL_8]: 0
    };
    
    migratedUsers.forEach(user => {
      distributionByLevel[user.permissionLevel]++;
    });
    
    return {
      totalUsers: migratedUsers.length,
      distributionByLevel,
      migrationLogs: migratedUsers.map(u => `User ${u.id}: ${u.migrationLog}`)
    };
  }
  
  /**
   * HR部門の特別権限付与
   * 既存の部長・課長級ユーザーでHR部門に所属している場合、
   * レベル5（HR部門長）またはレベル6（HR統括管理部門長）に昇格
   */
  static assignHRSpecialPermissions(users: Array<{
    id: string;
    permissionLevel: PermissionLevel;
    department?: string;
    isHRLeader?: boolean;
  }>): Array<{
    id: string;
    permissionLevel: PermissionLevel;
    upgraded: boolean;
  }> {
    return users.map(user => {
      let upgraded = false;
      let newPermissionLevel = user.permissionLevel;
      
      // HR部門所属でレベル4（課長）の場合、レベル5に昇格
      if (user.department?.toLowerCase().includes('hr') || 
          user.department?.toLowerCase().includes('人事') ||
          user.department?.toLowerCase().includes('人財')) {
        
        if (user.permissionLevel === PermissionLevel.LEVEL_4) {
          newPermissionLevel = PermissionLevel.LEVEL_5;
          upgraded = true;
        }
        
        // HR部門のリーダーの場合、レベル6に昇格
        if (user.isHRLeader && user.permissionLevel >= PermissionLevel.LEVEL_4) {
          newPermissionLevel = PermissionLevel.LEVEL_6;
          upgraded = true;
        }
      }
      
      return {
        id: user.id,
        permissionLevel: newPermissionLevel,
        upgraded
      };
    });
  }
}