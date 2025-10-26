/**
 * プロジェクトモード設定サービス
 *
 * ProjectModeConfigテーブルのCRUD操作とビジネスロジックを提供
 *
 * @file src/services/ProjectModeConfigService.ts
 * @created 2025-10-26
 */

import { PrismaClient } from '@prisma/client';
import {
  ProjectModeConfigData,
  ProjectModeConfigResponse,
  ProjectModeMetadata,
  TeamFormationRules,
  UpdateThresholdsRequest,
  UpdateTeamFormationRulesRequest,
  UpdateProgressManagementRequest,
  DEFAULT_PROJECT_MODE_CONFIG,
  validateTeamSize,
  validateThresholds,
  validateMilestone,
} from '../types/project-mode-config';
import { AuditService } from './AuditService';

const prisma = new PrismaClient();

export class ProjectModeConfigService {
  /**
   * 部署別プロジェクトモード設定を取得
   */
  static async getConfigByDepartmentId(
    departmentId: string
  ): Promise<ProjectModeConfigResponse | null> {
    try {
      const config = await prisma.projectModeConfig.findUnique({
        where: { departmentId },
        include: {
          department: {
            select: {
              departmentName: true,
              facilityCode: true,
            },
          },
        },
      });

      if (!config) {
        return null;
      }

      return {
        id: config.id,
        departmentId: config.departmentId,
        departmentName: config.department.departmentName,
        projectUpgradeThreshold: config.projectUpgradeThreshold,
        teamFormationRules: config.teamFormationRules as TeamFormationRules,
        milestoneRequired: config.milestoneRequired,
        progressReportFrequency: config.progressReportFrequency as 'weekly' | 'biweekly' | 'monthly',
        isActive: config.isActive,
        metadata: config.metadata as ProjectModeMetadata,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error fetching project mode config:', error);
      throw new Error('プロジェクトモード設定の取得に失敗しました');
    }
  }

  /**
   * 全プロジェクトモード設定を取得（フィルタリング対応）
   */
  static async getAllConfigs(params?: {
    facilityCode?: string;
    isActive?: boolean;
  }): Promise<ProjectModeConfigResponse[]> {
    try {
      const where: any = {};

      if (params?.isActive !== undefined) {
        where.isActive = params.isActive;
      }

      if (params?.facilityCode) {
        where.department = {
          facilityCode: params.facilityCode,
        };
      }

      const configs = await prisma.projectModeConfig.findMany({
        where,
        include: {
          department: {
            select: {
              departmentName: true,
              facilityCode: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return configs.map((config) => ({
        id: config.id,
        departmentId: config.departmentId,
        departmentName: config.department.departmentName,
        projectUpgradeThreshold: config.projectUpgradeThreshold,
        teamFormationRules: config.teamFormationRules as TeamFormationRules,
        milestoneRequired: config.milestoneRequired,
        progressReportFrequency: config.progressReportFrequency as 'weekly' | 'biweekly' | 'monthly',
        isActive: config.isActive,
        metadata: config.metadata as ProjectModeMetadata,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching all project mode configs:', error);
      throw new Error('プロジェクトモード設定一覧の取得に失敗しました');
    }
  }

  /**
   * 閾値設定を更新
   */
  static async updateThresholds(
    departmentId: string,
    data: UpdateThresholdsRequest,
    updatedBy: string
  ): Promise<ProjectModeConfigResponse> {
    try {
      // バリデーション
      if (!validateThresholds(data.thresholds)) {
        throw new Error('閾値設定が不正です。department <= facility <= corporate の順序で設定してください。');
      }

      if (data.emergencyEscalation.requiredLevel < 5 || data.emergencyEscalation.requiredLevel > 25) {
        throw new Error('緊急昇格権限レベルは5〜25の範囲で設定してください。');
      }

      // 既存設定を取得
      const existingConfig = await prisma.projectModeConfig.findUnique({
        where: { departmentId },
      });

      if (!existingConfig) {
        throw new Error('指定された部署のプロジェクトモード設定が見つかりません');
      }

      const oldMetadata = existingConfig.metadata as ProjectModeMetadata;

      // metadata更新
      const newMetadata: ProjectModeMetadata = {
        ...oldMetadata,
        thresholds: data.thresholds,
        emergencyEscalation: data.emergencyEscalation,
      };

      // 更新実行
      const updatedConfig = await prisma.projectModeConfig.update({
        where: { departmentId },
        data: {
          metadata: newMetadata,
          updatedAt: new Date(),
        },
        include: {
          department: {
            select: {
              departmentName: true,
              facilityCode: true,
            },
          },
        },
      });

      // 監査ログ記録
      await AuditService.log({
        userId: updatedBy,
        action: 'update_project_mode_thresholds',
        targetType: 'ProjectModeConfig',
        targetId: updatedConfig.id,
        changes: {
          before: {
            thresholds: oldMetadata.thresholds,
            emergencyEscalation: oldMetadata.emergencyEscalation,
          },
          after: {
            thresholds: data.thresholds,
            emergencyEscalation: data.emergencyEscalation,
          },
        },
        metadata: {
          departmentId,
          section: 'thresholds',
        },
      });

      return this.mapToResponse(updatedConfig);
    } catch (error) {
      console.error('Error updating thresholds:', error);
      throw error;
    }
  }

  /**
   * チーム編成ルールを更新
   */
  static async updateTeamFormationRules(
    departmentId: string,
    data: UpdateTeamFormationRulesRequest,
    updatedBy: string
  ): Promise<ProjectModeConfigResponse> {
    try {
      // バリデーション
      if (!validateTeamSize(data.teamFormationRules.teamSize)) {
        throw new Error('チームサイズ設定が不正です。min <= recommended <= max の順序で設定してください。');
      }

      const { roleAssignment } = data.teamFormationRules;
      if (roleAssignment.leaderMinLevel < 3 || roleAssignment.leaderMinLevel > 25) {
        throw new Error('リーダー最低レベルは3〜25の範囲で設定してください。');
      }

      if (roleAssignment.subLeaderMinLevel < 1 || roleAssignment.subLeaderMinLevel > 25) {
        throw new Error('サブリーダー最低レベルは1〜25の範囲で設定してください。');
      }

      // 既存設定を取得
      const existingConfig = await prisma.projectModeConfig.findUnique({
        where: { departmentId },
      });

      if (!existingConfig) {
        throw new Error('指定された部署のプロジェクトモード設定が見つかりません');
      }

      // 更新実行
      const updatedConfig = await prisma.projectModeConfig.update({
        where: { departmentId },
        data: {
          teamFormationRules: data.teamFormationRules,
          updatedAt: new Date(),
        },
        include: {
          department: {
            select: {
              departmentName: true,
              facilityCode: true,
            },
          },
        },
      });

      // 監査ログ記録
      await AuditService.log({
        userId: updatedBy,
        action: 'update_project_mode_team_formation',
        targetType: 'ProjectModeConfig',
        targetId: updatedConfig.id,
        changes: {
          before: existingConfig.teamFormationRules,
          after: data.teamFormationRules,
        },
        metadata: {
          departmentId,
          section: 'teamFormation',
        },
      });

      return this.mapToResponse(updatedConfig);
    } catch (error) {
      console.error('Error updating team formation rules:', error);
      throw error;
    }
  }

  /**
   * 進捗管理設定を更新
   */
  static async updateProgressManagement(
    departmentId: string,
    data: UpdateProgressManagementRequest,
    updatedBy: string
  ): Promise<ProjectModeConfigResponse> {
    try {
      // バリデーション
      for (const milestone of data.milestones) {
        if (!validateMilestone(milestone)) {
          throw new Error(`マイルストーン「${milestone.label}」の設定が不正です。`);
        }
      }

      if (
        data.notifications.deadlineReminderDays < 1 ||
        data.notifications.deadlineReminderDays > 14
      ) {
        throw new Error('期限前通知日数は1〜14の範囲で設定してください。');
      }

      // 既存設定を取得
      const existingConfig = await prisma.projectModeConfig.findUnique({
        where: { departmentId },
      });

      if (!existingConfig) {
        throw new Error('指定された部署のプロジェクトモード設定が見つかりません');
      }

      const oldMetadata = existingConfig.metadata as ProjectModeMetadata;

      // metadata更新
      const newMetadata: ProjectModeMetadata = {
        ...oldMetadata,
        milestones: data.milestones,
        notifications: data.notifications,
      };

      // 更新実行
      const updatedConfig = await prisma.projectModeConfig.update({
        where: { departmentId },
        data: {
          milestoneRequired: data.milestoneRequired,
          progressReportFrequency: data.progressReportFrequency,
          metadata: newMetadata,
          updatedAt: new Date(),
        },
        include: {
          department: {
            select: {
              departmentName: true,
              facilityCode: true,
            },
          },
        },
      });

      // 監査ログ記録
      await AuditService.log({
        userId: updatedBy,
        action: 'update_project_mode_progress',
        targetType: 'ProjectModeConfig',
        targetId: updatedConfig.id,
        changes: {
          before: {
            milestoneRequired: existingConfig.milestoneRequired,
            progressReportFrequency: existingConfig.progressReportFrequency,
            milestones: oldMetadata.milestones,
            notifications: oldMetadata.notifications,
          },
          after: {
            milestoneRequired: data.milestoneRequired,
            progressReportFrequency: data.progressReportFrequency,
            milestones: data.milestones,
            notifications: data.notifications,
          },
        },
        metadata: {
          departmentId,
          section: 'progressManagement',
        },
      });

      return this.mapToResponse(updatedConfig);
    } catch (error) {
      console.error('Error updating progress management:', error);
      throw error;
    }
  }

  /**
   * 設定を一括更新
   */
  static async updateConfig(
    departmentId: string,
    data: Partial<ProjectModeConfigData>,
    updatedBy: string
  ): Promise<ProjectModeConfigResponse> {
    try {
      // 既存設定を取得
      const existingConfig = await prisma.projectModeConfig.findUnique({
        where: { departmentId },
      });

      if (!existingConfig) {
        throw new Error('指定された部署のプロジェクトモード設定が見つかりません');
      }

      // 更新実行
      const updatedConfig = await prisma.projectModeConfig.update({
        where: { departmentId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          department: {
            select: {
              departmentName: true,
              facilityCode: true,
            },
          },
        },
      });

      // 監査ログ記録
      await AuditService.log({
        userId: updatedBy,
        action: 'update_project_mode_config',
        targetType: 'ProjectModeConfig',
        targetId: updatedConfig.id,
        changes: {
          before: existingConfig,
          after: data,
        },
        metadata: {
          departmentId,
          section: 'all',
        },
      });

      return this.mapToResponse(updatedConfig);
    } catch (error) {
      console.error('Error updating project mode config:', error);
      throw error;
    }
  }

  /**
   * 新規設定を作成（デフォルト値使用）
   */
  static async createDefaultConfig(
    departmentId: string,
    createdBy: string
  ): Promise<ProjectModeConfigResponse> {
    try {
      // 部署の存在確認
      const department = await prisma.organizationStructure.findUnique({
        where: { departmentId },
      });

      if (!department) {
        throw new Error('指定された部署が見つかりません');
      }

      // デフォルト設定で作成
      const newConfig = await prisma.projectModeConfig.create({
        data: {
          departmentId,
          projectUpgradeThreshold: DEFAULT_PROJECT_MODE_CONFIG.thresholds.department,
          teamFormationRules: DEFAULT_PROJECT_MODE_CONFIG.teamFormationRules,
          milestoneRequired: DEFAULT_PROJECT_MODE_CONFIG.milestoneRequired,
          progressReportFrequency: DEFAULT_PROJECT_MODE_CONFIG.progressReportFrequency,
          isActive: true,
          metadata: {
            thresholds: DEFAULT_PROJECT_MODE_CONFIG.thresholds,
            emergencyEscalation: DEFAULT_PROJECT_MODE_CONFIG.emergencyEscalation,
            milestones: DEFAULT_PROJECT_MODE_CONFIG.milestones,
            notifications: DEFAULT_PROJECT_MODE_CONFIG.notifications,
          },
        },
        include: {
          department: {
            select: {
              departmentName: true,
              facilityCode: true,
            },
          },
        },
      });

      // 監査ログ記録
      await AuditService.log({
        userId: createdBy,
        action: 'create_project_mode_config',
        targetType: 'ProjectModeConfig',
        targetId: newConfig.id,
        metadata: {
          departmentId,
        },
      });

      return this.mapToResponse(newConfig);
    } catch (error) {
      console.error('Error creating default config:', error);
      throw error;
    }
  }

  /**
   * 設定プレビュー - 閾値変更の影響範囲を計算
   */
  static async previewThresholdChanges(
    departmentId: string,
    newThresholds: { department: number; facility: number; corporate: number }
  ) {
    try {
      // 現在の設定を取得
      const currentConfig = await prisma.projectModeConfig.findUnique({
        where: { departmentId },
      });

      if (!currentConfig) {
        throw new Error('指定された部署のプロジェクトモード設定が見つかりません');
      }

      const currentMetadata = currentConfig.metadata as ProjectModeMetadata;
      const currentThresholds = currentMetadata.thresholds;

      // 該当部署の投稿をスコア付きで取得
      const posts = await prisma.post.findMany({
        where: {
          department: departmentId,
          status: { in: ['active', 'escalated', 'committee', 'project'] },
        },
        select: {
          id: true,
          title: true,
          score: true,
          status: true,
        },
      });

      const details = posts.map((post) => {
        const currentScore = post.score || 0;

        // 現在のレベルを判定
        let currentLevel = 'pending';
        if (currentScore >= currentThresholds.corporate) currentLevel = 'corporate';
        else if (currentScore >= currentThresholds.facility) currentLevel = 'facility';
        else if (currentScore >= currentThresholds.department) currentLevel = 'department';

        // 新しいレベルを判定
        let newLevel = 'pending';
        if (currentScore >= newThresholds.corporate) newLevel = 'corporate';
        else if (currentScore >= newThresholds.facility) newLevel = 'facility';
        else if (currentScore >= newThresholds.department) newLevel = 'department';

        return {
          postId: post.id,
          title: post.title,
          currentScore,
          currentLevel,
          newLevel,
        };
      });

      // 変化があるものだけ抽出
      const changedPosts = details.filter((d) => d.currentLevel !== d.newLevel);
      const upgradedProjects = changedPosts.filter((d) => {
        const levelOrder = ['pending', 'department', 'facility', 'corporate'];
        return levelOrder.indexOf(d.newLevel) > levelOrder.indexOf(d.currentLevel);
      });
      const downgradedProjects = changedPosts.filter((d) => {
        const levelOrder = ['pending', 'department', 'facility', 'corporate'];
        return levelOrder.indexOf(d.newLevel) < levelOrder.indexOf(d.currentLevel);
      });

      return {
        affectedProjects: changedPosts.length,
        upgradedProjects: upgradedProjects.length,
        downgradedProjects: downgradedProjects.length,
        details: changedPosts,
      };
    } catch (error) {
      console.error('Error previewing threshold changes:', error);
      throw new Error('プレビュー計算に失敗しました');
    }
  }

  /**
   * DBレコードをAPIレスポンス形式に変換
   */
  private static mapToResponse(config: any): ProjectModeConfigResponse {
    return {
      id: config.id,
      departmentId: config.departmentId,
      departmentName: config.department.departmentName,
      projectUpgradeThreshold: config.projectUpgradeThreshold,
      teamFormationRules: config.teamFormationRules as TeamFormationRules,
      milestoneRequired: config.milestoneRequired,
      progressReportFrequency: config.progressReportFrequency as 'weekly' | 'biweekly' | 'monthly',
      isActive: config.isActive,
      metadata: config.metadata as ProjectModeMetadata,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }
}
