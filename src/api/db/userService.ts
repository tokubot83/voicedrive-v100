// ユーザーサービス（データベース接続）
import prisma from '../../lib/prisma';
import { isValidToken } from '../../middleware/authMiddleware';
import { getEmployeeBasicInfo, getEmployeeExperienceSummary, getEmployeeSkills } from '../medicalSystemAPI';

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

  // ユーザープロフィール取得（またはデフォルトで作成）
  static async getOrCreateProfile(userId: string) {
    try {
      // 既存のプロフィールを検索
      let profile = await prisma.userProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              role: true,
              profilePhotoUrl: true,
            }
          }
        }
      });

      // プロフィールが存在しない場合は作成
      if (!profile) {
        profile = await prisma.userProfile.create({
          data: {
            userId,
            profileCompleteRate: 0,
            privacyLevel: 'private',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                role: true,
                profilePhotoUrl: true,
              }
            }
          }
        });
      }

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.error('Failed to get or create profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get or create profile',
      };
    }
  }

  // ユーザープロフィール更新
  static async updateProfile(userId: string, data: {
    motto?: string | null;
    selfIntroduction?: string | null;
    hobbies?: string | null;
    coverImage?: string | null;
    privacyLevel?: string;
  }) {
    try {
      // プロフィールが存在しない場合は作成
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId }
      });

      if (!existingProfile) {
        await prisma.userProfile.create({
          data: {
            userId,
            ...data,
            profileCompleteRate: 0,
            privacyLevel: data.privacyLevel || 'private',
          }
        });
      }

      // プロフィールを更新
      const profile = await prisma.userProfile.update({
        where: { userId },
        data: {
          ...data,
          lastProfileUpdate: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              role: true,
              profilePhotoUrl: true,
            }
          }
        }
      });

      // プロフィール完成度を計算
      const completeRate = this.calculateProfileCompleteRate({
        motto: profile.motto,
        selfIntroduction: profile.selfIntroduction,
        hobbies: profile.hobbies,
        coverImage: profile.coverImage,
      });

      // 完成度を更新
      if (completeRate !== profile.profileCompleteRate) {
        await prisma.userProfile.update({
          where: { userId },
          data: { profileCompleteRate: completeRate }
        });
      }

      return {
        success: true,
        data: { ...profile, profileCompleteRate: completeRate },
      };
    } catch (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // プロフィール完成度計算（各項目25%）
  private static calculateProfileCompleteRate(profile: {
    motto?: string | null;
    selfIntroduction?: string | null;
    hobbies?: string | null;
    coverImage?: string | null;
  }): number {
    let rate = 0;
    if (profile.motto) rate += 25;
    if (profile.selfIntroduction) rate += 25;
    if (profile.hobbies) rate += 25;
    if (profile.coverImage) rate += 25;
    return rate;
  }

  // ユーザーの統計情報を取得（医療システムAPIと統合）
  static async getUserStats(userId: string, employeeId: string) {
    try {
      // VoiceDrive内の活動データを取得
      const [postsCount, votesCount, commentsCount] = await Promise.all([
        prisma.post.count({ where: { authorId: userId } }),
        prisma.vote.count({ where: { userId } }),
        prisma.comment.count({ where: { authorId: userId } }),
      ]);

      // 医療システムから経験年数データを取得（API-2）
      const experienceResult = await getEmployeeExperienceSummary(employeeId);

      let experienceData = {
        yearsOfService: 0,
        totalExperienceYears: 0,
        previousExperience: 0,
      };

      if (experienceResult.success && experienceResult.data) {
        experienceData = {
          yearsOfService: experienceResult.data.yearsOfService,
          totalExperienceYears: experienceResult.data.totalExperienceYears,
          previousExperience: experienceResult.data.previousExperience,
        };
      } else {
        console.warn('[getUserStats] 医療システムから経験年数データを取得できませんでした:', experienceResult.error);
      }

      // スキル情報を取得（API-3）
      const skillsResult = await getEmployeeSkills(employeeId);
      let skills: string[] = [];

      if (skillsResult.success && skillsResult.data) {
        skills = skillsResult.data.skills.map(skill => skill.skillName);
      } else {
        console.warn('[getUserStats] スキル情報を取得できませんでした:', skillsResult.error);
      }

      return {
        success: true,
        data: {
          postsCount,
          votesCount,
          commentsCount,
          experienceYears: experienceData.yearsOfService,
          totalExperience: experienceData.totalExperienceYears,
          previousExperience: experienceData.previousExperience,
          skills,
        }
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user stats',
      };
    }
  }

  // 医療システムから職員基本情報を取得
  static async getEmployeeInfoFromMedicalSystem(employeeId: string) {
    try {
      const result = await getEmployeeBasicInfo(employeeId);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || '職員情報の取得に失敗しました',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Failed to fetch employee info from medical system:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '医療システムとの通信に失敗しました',
      };
    }
  }
}