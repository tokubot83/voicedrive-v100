/**
 * 議題レベル変更通知サービス
 *
 * スコア変更により議題レベルが変わった際に、
 * 関係者（主任、師長、委員会メンバー等）に自動通知を送信
 */

import { AgendaLevel } from '../types/committee';
import { Post, User } from '../types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import NotificationService, { MedicalNotificationConfig } from './NotificationService';
import { agendaModeNotifications } from '../systems/agenda/notifications/AgendaModeNotifications';
import { prisma } from '../lib/prisma.js';

export interface LevelChangeNotificationConfig {
  post: Post;
  previousLevel: AgendaLevel;
  newLevel: AgendaLevel;
  currentScore: number;
  triggeredBy: User; // 投票・コメントした職員
}

/**
 * 議題レベル変更時の通知送信サービス
 */
export class AgendaLevelNotificationService {
  private static instance: AgendaLevelNotificationService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): AgendaLevelNotificationService {
    if (!this.instance) {
      this.instance = new AgendaLevelNotificationService();
    }
    return this.instance;
  }

  /**
   * 議題レベル変更時の通知送信（メインメソッド）
   */
  public async notifyLevelChange(config: LevelChangeNotificationConfig): Promise<void> {
    const { post, previousLevel, newLevel, currentScore } = config;

    console.log(`[AgendaLevelNotification] レベル変更検出: ${previousLevel} → ${newLevel} (${currentScore}点)`);

    // レベルごとの通知先を決定
    const recipients = this.determineRecipients(newLevel, post);

    if (recipients.length === 0) {
      console.log('[AgendaLevelNotification] 通知対象者なし');
      return;
    }

    // AgendaModeNotificationsから通知メッセージを生成
    const notificationContent = agendaModeNotifications.getLevelUpNotification(
      newLevel,
      currentScore,
      post.title
    );

    // 各受信者に通知送信
    for (const recipient of recipients) {
      await this.sendNotificationToUser(recipient, notificationContent, post, newLevel);
    }

    console.log(`[AgendaLevelNotification] 通知送信完了: ${recipients.length}名に通知`);
  }

  /**
   * レベルに応じた通知先を決定
   */
  private determineRecipients(newLevel: AgendaLevel, post: Post): User[] {
    const recipients: User[] = [];

    // 投稿者には必ず通知
    recipients.push(post.author);

    switch (newLevel) {
      case 'DEPT_REVIEW': // 30点到達 - 部署検討開始
        // 主任（Level 3.5）に通知
        recipients.push(...this.getSupervisors(post.author.department));
        break;

      case 'DEPT_AGENDA': // 50点到達 - 部署議題化
        // 主任（Level 3.5）+ 師長（Level 7）に通知
        recipients.push(...this.getSupervisors(post.author.department));
        recipients.push(...this.getManagers(post.author.department));
        // 部署メンバー全員に通知（オプション）
        recipients.push(...this.getDepartmentMembers(post.author.department));
        break;

      case 'FACILITY_AGENDA': // 100点到達 - 施設議題化
        // 副看護部長（Level 8）+ 委員会メンバー（Level 10+）に通知
        recipients.push(...this.getDeputyDirectors(post.author.department));
        recipients.push(...this.getCommitteeMembers());
        break;

      case 'CORP_REVIEW': // 300点到達 - 法人検討
        // 戦略企画部（Level 11+）に通知
        recipients.push(...this.getExecutives());
        break;

      case 'CORP_AGENDA': // 600点到達 - 法人議題化
        // 理事長（Level 18+）に通知
        recipients.push(...this.getBoardMembers());
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
    post: Post,
    newLevel: AgendaLevel
  ): Promise<void> {
    // 主任・師長の場合は承認/却下アクションが必要
    const requiresApproval = this.requiresApprovalAction(user, newLevel);

    const config: MedicalNotificationConfig = {
      type: 'system_notification',
      title: notificationContent.title,
      message: requiresApproval
        ? this.getApprovalRequiredMessage(notificationContent.message, newLevel)
        : notificationContent.message,
      urgency: this.determineUrgency(newLevel),
      channels: ['browser', 'storage'], // ブラウザ通知 + ローカルストレージ
      timestamp: new Date().toISOString(),
      actionRequired: newLevel === 'DEPT_AGENDA' || newLevel === 'FACILITY_AGENDA',
      data: {
        userId: user.id,
        postId: post.id,
        postTitle: post.title,
        agendaLevel: newLevel,
        actionUrl: requiresApproval
          ? `/proposal-management/review/${post.id}` // 承認/却下画面
          : notificationContent.actionUrl || '/idea-voice'
      }
    };

    await this.notificationService.sendNotification(config);
  }

  /**
   * 承認アクションが必要か判定
   */
  private requiresApprovalAction(user: User, level: AgendaLevel): boolean {
    if (level !== 'DEPT_AGENDA') return false;

    // 主任（Level 3.5）または師長（Level 7）の場合
    const userLevel = user.permissionLevel as number;
    return userLevel === PermissionLevel.LEVEL_3_5 || userLevel === PermissionLevel.LEVEL_7;
  }

  /**
   * 承認が必要な場合のメッセージ生成
   */
  private getApprovalRequiredMessage(baseMessage: string, level: AgendaLevel): string {
    if (level === 'DEPT_AGENDA') {
      return `${baseMessage}\n\n⚠️ 部署議題として承認するか、却下するかの判断をお願いします。`;
    }
    return baseMessage;
  }

  /**
   * 緊急度を決定
   */
  private determineUrgency(level: AgendaLevel): 'normal' | 'high' | 'urgent' {
    switch (level) {
      case 'CORP_AGENDA':
      case 'FACILITY_AGENDA':
        return 'high';
      case 'DEPT_AGENDA':
        return 'high';
      default:
        return 'normal';
    }
  }

  // ========== ユーザー取得メソッド（仮実装） ==========
  // 実際の実装ではPrismaなどからユーザーを取得

  /**
   * 主任（Level 3.5）を取得
   */
  private getSupervisors(department: string): User[] {
    // TODO: Prismaから該当部署のLevel 3.5ユーザーを取得
    console.log(`[AgendaLevelNotification] 主任取得: ${department}`);
    return [];
  }

  /**
   * 師長（Level 7）を取得
   */
  private getManagers(department: string): User[] {
    // TODO: Prismaから該当部署のLevel 7ユーザーを取得
    console.log(`[AgendaLevelNotification] 師長取得: ${department}`);
    return [];
  }

  /**
   * 副看護部長（Level 8）を取得
   */
  private getDeputyDirectors(department: string): User[] {
    // TODO: Prismaから該当施設のLevel 8ユーザーを取得
    console.log(`[AgendaLevelNotification] 副看護部長取得: ${department}`);
    return [];
  }

  /**
   * 委員会メンバー（Level 10+）を取得
   */
  private getCommitteeMembers(): User[] {
    // TODO: Prismaから委員会メンバーを取得
    console.log('[AgendaLevelNotification] 委員会メンバー取得');
    return [];
  }

  /**
   * 経営幹部（Level 11+）を取得
   */
  private getExecutives(): User[] {
    // TODO: Prismaから経営幹部を取得
    console.log('[AgendaLevelNotification] 経営幹部取得');
    return [];
  }

  /**
   * 理事会メンバー（Level 18+）を取得
   */
  private getBoardMembers(): User[] {
    // TODO: Prismaから理事会メンバーを取得
    console.log('[AgendaLevelNotification] 理事会メンバー取得');
    return [];
  }

  /**
   * 部署メンバー全員を取得
   */
  private getDepartmentMembers(department: string): User[] {
    // TODO: Prismaから該当部署の全職員を取得
    console.log(`[AgendaLevelNotification] 部署メンバー取得: ${department}`);
    return [];
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

  /**
   * 委員会提出リクエスト時の通知
   */
  public async notifyCommitteeSubmissionRequest(
    post: Post,
    requestedBy: User,
    targetCommittee: string
  ): Promise<void> {
    console.log(`[AgendaLevelNotification] 委員会提出リクエスト通知: ${post.title} → ${targetCommittee}`);

    // Level 8+（副看護部長以上）に通知
    const approvers = await this.getApprovers();

    const config: MedicalNotificationConfig = {
      type: 'system_notification',
      title: '📋 委員会提出リクエスト',
      message: `${requestedBy.name}さんが「${post.title}」の${targetCommittee}への提出をリクエストしました。承認をお願いします。`,
      urgency: 'high',
      channels: ['browser', 'storage', 'sound'],
      timestamp: new Date().toISOString(),
      actionRequired: true,
      data: {
        postId: post.id,
        postTitle: post.title,
        requestedBy: requestedBy.id,
        targetCommittee,
        actionUrl: '/committee-submission-approval'
      }
    };

    for (const approver of approvers) {
      config.data.userId = approver.id;
      await this.notificationService.sendNotification(config);
    }

    console.log(`[AgendaLevelNotification] 委員会提出リクエスト通知送信完了: ${approvers.length}名に通知`);
  }

  /**
   * 承認者（Level 8+）を取得
   */
  private async getApprovers(): Promise<User[]> {
    // TODO: Prismaから Level 8+ のユーザーを取得
    console.log('[AgendaLevelNotification] 承認者取得 (Level 8+)');
    return [];
  }

  // ========== AgendaDecisionService用の通知メソッド ==========

  /**
   * 主任が師長に推薦した際の通知
   */
  async notifySupervisorRecommendation(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '✅ 主任が推薦しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が主任により師長に推薦されました。\n\n理由: ${reason}`,
      urgency: 'normal',
      postId: post.id,
    });
    count++;

    // 師長に通知（判断要求）
    const managers = await this.getManagersByDepartment(post.author?.department);
    for (const manager of managers) {
      await this.sendSimpleNotification({
        userId: manager.id,
        title: '📋 部署議題の判断が必要です',
        message: `主任が推薦した投稿の判断をお願いします。\n\n投稿: ${post.content.substring(0, 30)}...\n推薦理由: ${reason}`,
        urgency: 'high',
        postId: post.id,
        actionUrl: `/proposal-management/review/${post.id}`,
        actionRequired: true,
      });
      count++;
    }

    return count;
  }

  /**
   * 主任が却下した際の通知
   */
  async notifySupervisorRejection(post: any, decider: any, reason: string): Promise<number> {
    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '❌ 主任が却下しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が主任により却下されました。\n\n理由: ${reason}`,
      urgency: 'normal',
      postId: post.id,
    });

    return 1;
  }

  /**
   * 師長が部署議題として承認した際の通知
   */
  async notifyDeptAgendaApproval(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '🎉 部署議題として承認されました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が部署議題として承認されました。\n\n理由: ${reason}`,
      urgency: 'high',
      postId: post.id,
    });
    count++;

    // 部署内全員に通知
    const deptMembers = await this.getDepartmentMembersByDept(post.author?.department);
    for (const member of deptMembers) {
      if (member.id === post.authorId) continue; // 投稿者は既に通知済み

      await this.sendSimpleNotification({
        userId: member.id,
        title: '📋 新しい部署議題が承認されました',
        message: `「${post.content.substring(0, 30)}...」が部署議題として承認されました。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * 師長が施設議題に昇格した際の通知
   */
  async notifyFacilityEscalation(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者 + 主任に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '⬆️ 施設議題に昇格しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が施設議題に昇格しました。投票期限が延長され、施設内全職員が投票できます。\n\n理由: ${reason}`,
      urgency: 'high',
      postId: post.id,
    });
    count++;

    // Level 8（副看護部長）に通知
    const deputyDirectors = await this.getDeputyDirectorsByFacility(post.author?.facilityId);
    for (const dd of deputyDirectors) {
      await this.sendSimpleNotification({
        userId: dd.id,
        title: '📊 施設議題に昇格しました',
        message: `「${post.content.substring(0, 30)}...」が施設議題に昇格しました。100点到達時に判断をお願いします。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    // 施設内全職員に通知
    const facilityMembers = await this.getFacilityMembers(post.author?.facilityId);
    for (const member of facilityMembers) {
      if (member.id === post.authorId) continue;

      await this.sendSimpleNotification({
        userId: member.id,
        title: '🔔 新しい施設議題',
        message: `「${post.content.substring(0, 30)}...」が施設議題になりました。投票にご協力ください。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * 師長が却下した際の通知
   */
  async notifyManagerRejection(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '❌ 師長が却下しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が師長により却下されました。\n\n理由: ${reason}`,
      urgency: 'normal',
      postId: post.id,
    });
    count++;

    // 部署内全員に通知
    const deptMembers = await this.getDepartmentMembersByDept(post.author?.department);
    for (const member of deptMembers) {
      if (member.id === post.authorId) continue;

      await this.sendSimpleNotification({
        userId: member.id,
        title: '📋 部署議題が却下されました',
        message: `「${post.content.substring(0, 30)}...」が却下されました。\n\n理由: ${reason}`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * 師長が部署議題として救済した際の通知
   */
  async notifyDeptAgendaRescue(post: any, decider: any, reason: string): Promise<number> {
    return await this.notifyDeptAgendaApproval(post, decider, `【救済承認】${reason}`);
  }

  /**
   * 完全却下時の通知
   */
  async notifyCompleteRejection(post: any, decider: any, reason: string): Promise<number> {
    return await this.notifyManagerRejection(post, decider, reason);
  }

  /**
   * Level 8が委員会提出を承認した際の通知
   */
  async notifyCommitteeApproval(post: any, decider: any, reason: string, committeeId?: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '✅ 委員会提出が承認されました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」の委員会提出が承認されました。\n\n理由: ${reason}`,
      urgency: 'high',
      postId: post.id,
    });
    count++;

    // 施設内全職員に通知
    const facilityMembers = await this.getFacilityMembers(post.author?.facilityId);
    for (const member of facilityMembers) {
      if (member.id === post.authorId) continue;

      await this.sendSimpleNotification({
        userId: member.id,
        title: '📋 委員会議題が承認されました',
        message: `「${post.content.substring(0, 30)}...」が委員会に提出されます。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * Level 8が法人検討に昇格した際の通知
   */
  async notifyCorpReviewEscalation(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '⬆️ 法人検討に昇格しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が法人検討に昇格しました。300点到達を目指します。\n\n理由: ${reason}`,
      urgency: 'high',
      postId: post.id,
    });
    count++;

    // 施設内全職員に通知
    const facilityMembers = await this.getFacilityMembers(post.author?.facilityId);
    for (const member of facilityMembers) {
      if (member.id === post.authorId) continue;

      await this.sendSimpleNotification({
        userId: member.id,
        title: '🔔 法人検討に昇格',
        message: `「${post.content.substring(0, 30)}...」が法人検討に昇格しました。投票にご協力ください。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * Level 8が却下した際の通知（救済待ち）
   */
  async notifyDeputyDirectorRejection(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '⚠️ 副看護部長が却下しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が副看護部長により却下されました。師長による救済判断を待っています。\n\n理由: ${reason}`,
      urgency: 'normal',
      postId: post.id,
    });
    count++;

    // 師長に救済オプションを通知
    const managers = await this.getManagersByDepartment(post.author?.department);
    for (const manager of managers) {
      await this.sendSimpleNotification({
        userId: manager.id,
        title: '🆘 救済判断が必要です',
        message: `副看護部長が却下した投稿を部署議題として承認するか、完全却下するかの判断をお願いします。\n\n投稿: ${post.content.substring(0, 30)}...\n却下理由: ${reason}`,
        urgency: 'high',
        postId: post.id,
        actionUrl: `/proposal-management/rescue/${post.id}`,
        actionRequired: true,
      });
      count++;
    }

    return count;
  }

  /**
   * Level 11が法人議題として承認した際の通知
   */
  async notifyCorpAgendaApproval(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '🎉 法人議題として承認されました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が法人議題として承認されました。\n\n理由: ${reason}`,
      urgency: 'high',
      postId: post.id,
    });
    count++;

    // 施設内全職員に通知
    const facilityMembers = await this.getFacilityMembers(post.author?.facilityId);
    for (const member of facilityMembers) {
      if (member.id === post.authorId) continue;

      await this.sendSimpleNotification({
        userId: member.id,
        title: '📋 法人議題が承認されました',
        message: `「${post.content.substring(0, 30)}...」が法人議題として承認されました。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * Level 11が法人議題に昇格した際の通知（600点目標）
   */
  async notifyCorpAgendaEscalation(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '⬆️ 法人議題に昇格しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が法人議題に昇格しました。600点到達を目指します。\n\n理由: ${reason}`,
      urgency: 'high',
      postId: post.id,
    });
    count++;

    // 施設内全職員に通知
    const facilityMembers = await this.getFacilityMembers(post.author?.facilityId);
    for (const member of facilityMembers) {
      if (member.id === post.authorId) continue;

      await this.sendSimpleNotification({
        userId: member.id,
        title: '🔔 法人議題に昇格',
        message: `「${post.content.substring(0, 30)}...」が法人議題に昇格しました。投票にご協力ください。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * Level 11が却下した際の通知（救済待ち）
   */
  async notifyGeneralAffairsRejection(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '⚠️ 事務長が却下しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が事務長により却下されました。副看護部長による救済判断を待っています。\n\n理由: ${reason}`,
      urgency: 'normal',
      postId: post.id,
    });
    count++;

    // 副看護部長に救済オプションを通知
    const deputyDirectors = await this.getDeputyDirectorsByFacility(post.author?.facilityId);
    for (const dd of deputyDirectors) {
      await this.sendSimpleNotification({
        userId: dd.id,
        title: '🆘 救済判断が必要です',
        message: `事務長が却下した投稿を施設議題として承認するか、完全却下するかの判断をお願いします。\n\n投稿: ${post.content.substring(0, 30)}...\n却下理由: ${reason}`,
        urgency: 'high',
        postId: post.id,
        actionUrl: `/proposal-management/rescue/${post.id}`,
        actionRequired: true,
      });
      count++;
    }

    return count;
  }

  /**
   * Level 11が施設議題として救済した際の通知
   */
  async notifyFacilityAgendaRescue(post: any, decider: any, reason: string): Promise<number> {
    return await this.notifyCommitteeApproval(post, decider, `【救済承認】${reason}`);
  }

  /**
   * Level 18が法人運営会議提出を承認した際の通知
   */
  async notifyCorpMeetingApproval(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '🎉 法人運営会議への提出が承認されました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が法人運営会議への提出が承認されました。\n\n理由: ${reason}`,
      urgency: 'high',
      postId: post.id,
    });
    count++;

    // 法人内全職員に通知
    const corpMembers = await this.getCorporationMembers();
    for (const member of corpMembers) {
      if (member.id === post.authorId) continue;

      await this.sendSimpleNotification({
        userId: member.id,
        title: '📋 法人運営会議議題が承認されました',
        message: `施設名: ${post.author?.facilityId}\n投稿者: ${post.author?.name}\n\n「${post.content.substring(0, 30)}...」が法人運営会議に提出されます。`,
        urgency: 'normal',
        postId: post.id,
      });
      count++;
    }

    return count;
  }

  /**
   * Level 18が却下した際の通知（救済待ち）
   */
  async notifyGeneralAffairsDirectorRejection(post: any, decider: any, reason: string): Promise<number> {
    let count = 0;

    // 投稿者に通知
    await this.sendSimpleNotification({
      userId: post.authorId,
      title: '⚠️ 法人統括事務局長が却下しました',
      message: `あなたの投稿「${post.content.substring(0, 30)}...」が法人統括事務局長により却下されました。事務長による救済判断を待っています。\n\n理由: ${reason}`,
      urgency: 'normal',
      postId: post.id,
    });
    count++;

    // 事務長に救済オプションを通知
    const generalAffairs = await this.getGeneralAffairsByFacility(post.author?.facilityId);
    for (const ga of generalAffairs) {
      await this.sendSimpleNotification({
        userId: ga.id,
        title: '🆘 救済判断が必要です',
        message: `法人統括事務局長が却下した投稿を施設議題として承認するか、完全却下するかの判断をお願いします。\n\n投稿: ${post.content.substring(0, 30)}...\n却下理由: ${reason}`,
        urgency: 'high',
        postId: post.id,
        actionUrl: `/proposal-management/rescue/${post.id}`,
        actionRequired: true,
      });
      count++;
    }

    return count;
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

  // ========== Prisma統合済みユーザー取得メソッド ==========

  /**
   * 主任（Level 3.5）を部署で取得
   */
  private async getManagersByDepartment(department: string | undefined): Promise<User[]> {
    if (!department) return [];

    try {
      const users = await prisma.user.findMany({
        where: {
          department,
          permissionLevel: 3.5,
          isRetired: false,
        },
      });
      console.log(`[AgendaLevelNotification] 主任取得: ${department} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[AgendaLevelNotification] 主任取得エラー:', error);
      return [];
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
      console.log(`[AgendaLevelNotification] 部署メンバー取得: ${department} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[AgendaLevelNotification] 部署メンバー取得エラー:', error);
      return [];
    }
  }

  /**
   * 副看護部長（Level 8）を施設で取得
   */
  private async getDeputyDirectorsByFacility(facilityId: string | undefined): Promise<User[]> {
    if (!facilityId) return [];

    try {
      const users = await prisma.user.findMany({
        where: {
          facilityId,
          permissionLevel: 8,
          isRetired: false,
        },
      });
      console.log(`[AgendaLevelNotification] 副看護部長取得: ${facilityId} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[AgendaLevelNotification] 副看護部長取得エラー:', error);
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
      console.log(`[AgendaLevelNotification] 施設メンバー取得: ${facilityId} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[AgendaLevelNotification] 施設メンバー取得エラー:', error);
      return [];
    }
  }

  /**
   * 事務長（Level 11）を施設で取得
   */
  private async getGeneralAffairsByFacility(facilityId: string | undefined): Promise<User[]> {
    if (!facilityId) return [];

    try {
      const users = await prisma.user.findMany({
        where: {
          facilityId,
          permissionLevel: 11,
          isRetired: false,
        },
      });
      console.log(`[AgendaLevelNotification] 事務長取得: ${facilityId} → ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[AgendaLevelNotification] 事務長取得エラー:', error);
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
      console.log(`[AgendaLevelNotification] 法人内全職員取得: ${users.length}名`);
      return users as User[];
    } catch (error) {
      console.error('[AgendaLevelNotification] 法人内全職員取得エラー:', error);
      return [];
    }
  }
}

// シングルトンインスタンスはブラウザ環境でのみ作成可能
// サーバーサイドでは NotificationService.getInstance() を使用してください
