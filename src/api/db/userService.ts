// ユーザーサービス（データベース接続）
import prisma from '../../lib/prisma';
import { isValidToken } from '../../middleware/authMiddleware';

export interface UserData {
  employeeId: string;
  email: string;
  name: string;
  department?: string;
  facilityId?: string;
  role?: string;
  accountType: string;
  permissionLevel: number;
}

export class UserService {
  // ユーザー作成
  static async create(data: UserData) {
    try {
      const user = await prisma.user.create({
        data,
      });

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('User creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  // ユーザー認証
  static async authenticate(token: string) {
    try {
      // トークン検証
      if (!isValidToken(token)) {
        return {
          success: false,
          error: 'Invalid token',
        };
      }

      // テスト用: トークンから仮のユーザーIDを取得
      // 本番環境ではJWTデコードを実装
      const userId = 'test_user_id';

      const user = await prisma.user.findFirst({
        select: {
          id: true,
          employeeId: true,
          email: true,
          name: true,
          department: true,
          role: true,
          accountType: true,
          permissionLevel: true,
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // ログイン記録更新
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          loginCount: { increment: 1 },
        }
      });

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  // ユーザー検索
  static async findByEmployeeId(employeeId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { employeeId },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('User search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find user',
      };
    }
  }

  // ユーザーリスト取得
  static async list(filters?: {
    department?: string;
    facilityId?: string;
    accountType?: string;
    isRetired?: boolean;
  }) {
    try {
      const users = await prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          employeeId: true,
          email: true,
          name: true,
          department: true,
          facilityId: true,
          role: true,
          accountType: true,
          permissionLevel: true,
          isRetired: true,
        },
        orderBy: [
          { permissionLevel: 'asc' },
          { name: 'asc' },
        ],
      });

      return {
        success: true,
        data: users,
        count: users.length,
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        data: [],
      };
    }
  }

  // 権限チェック
  static async checkPermission(userId: string, requiredLevel: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          permissionLevel: true,
          accountType: true,
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const hasPermission = user.permissionLevel <= requiredLevel;

      return {
        success: true,
        hasPermission,
        userLevel: user.permissionLevel,
        requiredLevel,
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Permission check failed',
      };
    }
  }

  // ユーザー更新
  static async update(employeeId: string, data: Partial<UserData>) {
    try {
      const user = await prisma.user.update({
        where: { employeeId },
        data: {
          ...data,
          updatedAt: new Date(),
        }
      });

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('User update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  // 退職処理
  static async retire(employeeId: string, processedBy: string) {
    try {
      const anonymizedId = `RETIRED_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const user = await prisma.user.update({
        where: { employeeId },
        data: {
          isRetired: true,
          retirementDate: new Date(),
          anonymizedId,
          email: `${anonymizedId}@retired.local`,
          name: `退職者_${anonymizedId.substring(0, 8)}`,
        }
      });

      // 監査ログ記録
      await prisma.auditLog.create({
        data: {
          userId: processedBy,
          action: 'UPDATE',
          entityType: 'User',
          entityId: user.id,
          oldValues: { isRetired: false },
          newValues: { isRetired: true, anonymizedId },
        }
      });

      return {
        success: true,
        data: {
          id: user.id,
          anonymizedId,
          retirementDate: user.retirementDate,
        }
      };
    } catch (error) {
      console.error('Retirement process failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process retirement',
      };
    }
  }

  // 組織階層取得
  static async getOrganizationHierarchy(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          parent: true,
          children: {
            include: {
              children: true,
            }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // 上位階層を取得
      const hierarchy = [];
      let currentUser = user.parent;
      while (currentUser) {
        hierarchy.unshift({
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          level: currentUser.hierarchyLevel,
        });
        currentUser = await prisma.user.findUnique({
          where: { id: currentUser.parentId || '' },
        });
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            level: user.hierarchyLevel,
          },
          hierarchy,
          subordinates: user.children.map(child => ({
            id: child.id,
            name: child.name,
            role: child.role,
            subordinateCount: child.children.length,
          })),
        }
      };
    } catch (error) {
      console.error('Failed to fetch hierarchy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch hierarchy',
      };
    }
  }
}