/**
 * プロジェクトモード専用通知サービス
 *
 * プロジェクトレベルが変更された際に、
 * 関係者（チームメンバー、部署職員、施設職員等）に自動通知を送信
 */

import { ProjectLevel } from '../types/visibility';
import { Post, User } from '../types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import NotificationService, { MedicalNotificationConfig } from './NotificationService';
import { projectModeNotifications } from '../systems/project/notifications/ProjectModeNotifications';
import { prisma } from '../lib/prisma.js';

export interface ProjectLevelChangeNotificationConfig {
  post: Post;
  previousLevel: ProjectLevel;
  newLevel: ProjectLevel;
  currentScore: number;
  triggeredBy: User; // 投票・コメントした職員
}

/**
 * プロジェクトレベル変更時の通知送信サービス
 */
export class ProjectLevelNotificationService {
  private static instance: ProjectLevelNotificationService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): ProjectLevelNotificationService {
    if (!this.instance) {
      this.instance = new ProjectLevelNotificationService();
    }
    return this.instance;
  }

  /**
   * プロジェクトレベルアップ通知（メインメソッド）
   *
   * @param post - プロジェクト投稿
   * @param newLevel - 新しいプロジェクトレベル
   * @param currentScore - 現在のスコア
   * @returns 送信した通知の件数
   */
  public async notifyLevelUp(
    post: any,
    newLevel: ProjectLevel | string,
    currentScore: number
  ): Promise<number> {
    let count = 0;

    console.log(`[ProjectLevelNotification] レベルアップ検出: ${newLevel} (${currentScore}点)`);

    // プロジェクトレベルごとの通知先を決定
    const recipients = await this.determineRecipients(newLevel as ProjectLevel, post);

    if (recipients.length === 0) {
      console.log('[ProjectLevelNotification] 通知対象者なし');
      return 0;
    }

    // ProjectModeNotificationsから通知メッセージを生成
    const notificationContent = projectModeNotifications.getLevelUpNotification(
      newLevel as ProjectLevel,
      currentScore,
      post.content?.substring(0, 50) || post.title || '無題のプロジェクト'
    );

    // 各受信者に通知送信
    for (const recipient of recipients) {
      await this.sendNotificationToUser(recipient, notificationContent, post, newLevel as ProjectLevel);
      count++;
    }

    console.log(`[ProjectLevelNotification] 通知送信完了: ${count}件`);
    return count;
  }

  /**
   * プロジェクトレベルに応じた通知先を決定
   */
  private async determineRecipients(newLevel: ProjectLevel, post: any): Promise<User[]> {
    const recipients: User[] = [];

    // 投稿者には必ず通知
    if (post.authorId) {
      const author = await this.getUserById(post.authorId);
      if (author) recipients.push(author);
    }

    switch (newLevel) {
      case 'TEAM': // 100点到達 - チームプロジェクト
        // 同じ部署内の職員に通知
        recipients.push(...await this.getDepartmentMembersByDept(post.author?.department));
        break;

      case 'DEPARTMENT': // 200点到達 - 部署プロジェクト
        // 部署内全員 + 同じ施設の管理職に通知
        recipients.push(...await this.getDepartmentMembersByDept(post.author?.department));
        recipients.push(...await this.getFacilityManagers(post.author?.facilityId));
        break;

      case 'FACILITY': // 400点到達 - 施設プロジェクト
        // 施設内全員に通知
        recipients.push(...await this.getFacilityMembers(post.author?.facilityId));
        break;

      case 'ORGANIZATION': // 800点到達 - 法人プロジェクト
      case 'STRATEGIC': // 戦略プロジェクト
        // 法人内全員に通知
        recipients.push(...await this.getCorporationMembers());
        break;

      default:
        break;
    }

    // 重複排除
    return this.deduplicateUsers(recipients);
  }

  /**
   * ユーザーに通知送信
   */
  private async sendNotificationToUser(
    user: User,
    notificationContent: any,
    post: any,
    newLevel: ProjectLevel
  ): Promise<void> {
    const config: MedicalNotificationConfig = {
      type: 'system_notification',
      title: notificationContent.title,
      message: notificationContent.message,
      urgency: this.determineUrgency(newLevel),
      channels: ['browser', 'storage'], // ブラウザ通知 + ローカルストレージ
      timestamp: new Date().toISOString(),
      actionRequired: false,
      data: {
        userId: user.id,
        postId: post.id,
        postTitle: post.content?.substring(0, 50) || post.title || '無題のプロジェクト',
        projectLevel: newLevel,
        actionUrl: notificationContent.actionUrl || '/idea-voice'
      }
    };

    await this.notificationService.sendNotification(config);
  }

  /**
   * 緊急度を決定
   */
  private determineUrgency(level: ProjectLevel): 'normal' | 'high' | 'urgent' {
    switch (level) {
      case 'ORGANIZATION':
      case 'STRATEGIC':
        return 'high';
      case 'FACILITY':
        return 'high';
      case 'DEPARTMENT':
        return 'normal';
      default:
        return 'normal';
    }
  }

  /**
   * シンプルな通知送信ヘルパー
   */
  private async sendSimpleNotification(config: {
    userId: string;
    title: string;
    message: string;
    urgency: 'normal' | 'high' | 'urgent';
    postId: string;
    actionUrl?: string;
    actionRequired?: boolean;
  }): Promise<void> {
    const notificationConfig: MedicalNotificationConfig = {
      type: 'system_notification',
      title: config.title,
      message: config.message,
      urgency: config.urgency,
      channels: ['browser', 'storage'],
      timestamp: new Date().toISOString(),
      actionRequired: config.actionRequired || false,
      data: {
        userId: config.userId,
        postId: config.postId,
        actionUrl: config.actionUrl || `/idea-voice/${config.postId}`,
      },
    };

    await this.notificationService.sendNotification(notificationConfig);
  }

  /**
   * チーム編成通知
   */
  public async notifyTeamFormation(
    projectId: string,
    projectTitle: string,
    teamLeaderName: string,
    teamSize: number,
    teamMemberIds: string[]
  ): Promise<number> {
    let count = 0;

    const notification = projectModeNotifications.getTeamFormationNotification(
      projectTitle,
      teamLeaderName,
      teamSize
    );

    for (const memberId of teamMemberIds) {
      await this.sendSimpleNotification({
        userId: memberId,
        title: notification.title,
        message: notification.message,
        urgency: 'normal',
        postId: projectId,
        actionUrl: notification.actionUrl,
      });
      count++;
    }

    console.log(`[ProjectLevelNotification] チーム編成通知送信完了: ${count}件`);
    return count;
  }

  /**
   * チーム参加招待通知
   */
  public async notifyTeamInvitation(
    inviteeId: string,
    projectTitle: string,
    inviterName: string,
    projectId: string
  ): Promise<void> {
    const notification = projectModeNotifications.getTeamInvitationNotification(
      projectTitle,
      inviterName
    );

    await this.sendSimpleNotification({
      userId: inviteeId,
      title: notification.title,
      message: notification.message,
      urgency: 'normal',
      postId: projectId,
      actionUrl: notification.actionUrl,
      actionRequired: true,
    });

    console.log(`[ProjectLevelNotification] チーム招待通知送信完了: ${inviteeId}`);
  }

  /**
   * タスク割り当て通知
   */
  public async notifyTaskAssignment(
    assigneeId: string,
    projectTitle: string,
    taskName: string,
    assignerName: string,
    projectId: string
  ): Promise<void> {
    const notification = projectModeNotifications.getTaskAssignmentNotification(
      projectTitle,
      taskName,
      assignerName
    );

    await this.sendSimpleNotification({
      userId: assigneeId,
      title: notification.title,
      message: notification.message,
      urgency: 'normal',
      postId: projectId,
      actionUrl: notification.actionUrl,
      actionRequired: true,
    });

    console.log(`[ProjectLevelNotification] タスク割り当て通知送信完了: ${assigneeId}`);
  }

  /**
   * マイルストーン達成通知
   */
  public async notifyMilestoneAchieved(
    projectId: string,
    projectTitle: string,
    milestoneName: string,
    teamMemberIds: string[]
  ): Promise<number> {
    let count = 0;

    const notification = projectModeNotifications.getMilestoneAchievedNotification(
      projectTitle,
      milestoneName
    );

    for (const memberId of teamMemberIds) {
      await this.sendSimpleNotification({
        userId: memberId,
        title: notification.title,
        message: notification.message,
        urgency: 'normal',
        postId: projectId,
        actionUrl: notification.actionUrl,
      });
      count++;
    }

    console.log(`[ProjectLevelNotification] マイルストーン達成通知送信完了: ${count}件`);
    return count;
  }

  /**
   * プロジェクト完了通知
   */
  public async notifyProjectCompletion(
    projectId: string,
    projectTitle: string,
    completionRate: number,
    teamMemberIds: string[]
  ): Promise<number> {
    let count = 0;

    const notification = projectModeNotifications.getProjectCompletionNotification(
      projectTitle,
      completionRate
    );

    for (const memberId of teamMemberIds) {
      await this.sendSimpleNotification({
        userId: memberId,
        title: notification.title,
        message: notification.message,
        urgency: 'high',
        postId: projectId,
        actionUrl: notification.actionUrl,
      });
      count++;
    }

    console.log(`[ProjectLevelNotification] プロジェクト完了通知送信完了: ${count}件`);
    return count;
  }

  /**
   * 進捗更新通知
   */
  public async notifyProgressUpdate(
    projectId: string,
    projectTitle: string,
    updaterName: string,
    progress: number,
    teamMemberIds: string[]
  ): Promise<number> {
    let count = 0;

    const notification = projectModeNotifications.getProgressUpdateNotification(
      projectTitle,
      updaterName,
      progress
    );

    for (const memberId of teamMemberIds) {
      await this.sendSimpleNotification({
        userId: memberId,
        title: notification.title,
        message: notification.message,
        urgency: 'normal',
        postId: projectId,
        actionUrl: notification.actionUrl,
      });
      count++;
    }

    console.log(`[ProjectLevelNotification] 進捗更新通知送信完了: ${count}件`);
    return count;
  }

  /**
   * タスク期限間近通知
   */
  public async notifyTaskDeadline(
    assigneeId: string,
    projectTitle: string,
    taskName: string,
    hoursRemaining: number,
    projectId: string
  ): Promise<void> {
    const notification = projectModeNotifications.getTaskDeadlineNotification(
      projectTitle,
      taskName,
      hoursRemaining
    );

    await this.sendSimpleNotification({
      userId: assigneeId,
      title: notification.title,
      message: notification.message,
      urgency: 'high',
      postId: projectId,
      actionUrl: notification.actionUrl,
      actionRequired: true,
    });

    console.log(`[ProjectLevelNotification] タスク期限間近通知送信完了: ${assigneeId}`);
  }

  // ========== Prisma統合ユーザー取得メソッド ==========

  /**
   * ユーザーIDからユーザーを取得
   */
  private async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      return user as User | null;
    } catch (error) {
      console.error('[ProjectLevelNotification] ユーザー取得エラー:', error);
      return null;
    }
  }

  /**
   * 部署メンバーを取得
   */
  private async getDepartmentMembersByDept(department: string | undefined): Promise<User[]> {
    if (!department) return [];

    try {
      const users = await prisma.user.findMany({
        where: {
          department,
          isRetired: false,
        },
      });
      console.log(`[ProjectLevelNotification] 部署メンバー取得: ${department} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[ProjectLevelNotification] 部署メンバー取得エラー:', error);
      return [];
    }
  }

  /**
   * 施設の管理職（Level 7以上）を取得
   */
  private async getFacilityManagers(facilityId: string | undefined): Promise<User[]> {
    if (!facilityId) return [];

    try {
      const users = await prisma.user.findMany({
        where: {
          facilityId,
          permissionLevel: { gte: 7 },
          isRetired: false,
        },
      });
      console.log(`[ProjectLevelNotification] 施設管理職取得: ${facilityId} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[ProjectLevelNotification] 施設管理職取得エラー:', error);
      return [];
    }
  }

  /**
   * 施設メンバーを取得
   */
  private async getFacilityMembers(facilityId: string | undefined): Promise<User[]> {
    if (!facilityId) return [];

    try {
      const users = await prisma.user.findMany({
        where: {
          facilityId,
          isRetired: false,
        },
      });
      console.log(`[ProjectLevelNotification] 施設メンバー取得: ${facilityId} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[ProjectLevelNotification] 施設メンバー取得エラー:', error);
      return [];
    }
  }

  /**
   * 法人内全職員を取得
   */
  private async getCorporationMembers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          isRetired: false,
        },
      });
      console.log(`[ProjectLevelNotification] 法人内全職員取得: ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[ProjectLevelNotification] 法人内全職員取得エラー:', error);
      return [];
    }
  }

  /**
   * ユーザーの重複排除
   */
  private deduplicateUsers(users: User[]): User[] {
    const uniqueUsers = new Map<string, User>();
    users.forEach(user => {
      if (user && user.id) {
        uniqueUsers.set(user.id, user);
      }
    });
    return Array.from(uniqueUsers.values());
  }
}

// シングルトンインスタンスはブラウザ環境でのみ作成可能
// サーバーサイドでは ProjectLevelNotificationService.getInstance() を使用してください
