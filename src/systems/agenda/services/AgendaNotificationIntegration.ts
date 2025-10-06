/**
 * 議題モード通知統合サービス
 *
 * 各イベントで通知を発火し、適切な対象者に通知を送信する
 */

import { agendaModeNotifications, AgendaNotification } from '../notifications/AgendaModeNotifications';
import { AgendaLevel } from '../../../types/committee';
import { Post, User } from '../../../types';

export interface NotificationRecipient {
  userId: string;
  userName: string;
  role: string;
  reason: 'author' | 'responsible' | 'voter' | 'department' | 'facility' | 'corporation';
}

/**
 * 通知対象者を判定するヘルパークラス
 */
class NotificationTargeting {
  /**
   * レベル昇格時の通知対象者を取得
   */
  getLevelUpRecipients(
    post: Post,
    newLevel: AgendaLevel,
    allUsers: User[]
  ): NotificationRecipient[] {
    const recipients: NotificationRecipient[] = [];

    // 投稿者（必ず通知）
    recipients.push({
      userId: post.author.id,
      userName: post.author.name,
      role: post.author.role || '職員',
      reason: 'author'
    });

    // レベルに応じた責任者を追加
    const responsibleUsers = this.getResponsibleUsers(newLevel, post, allUsers);
    recipients.push(...responsibleUsers);

    // 投票済みユーザー（重要な昇格のみ：FACILITY_AGENDA以上）
    if (newLevel === 'FACILITY_AGENDA' || newLevel === 'CORP_REVIEW' || newLevel === 'CORP_AGENDA') {
      const voters = this.getVoters(post, allUsers);
      recipients.push(...voters);
    }

    return this.deduplicateRecipients(recipients);
  }

  /**
   * 委員会イベント時の通知対象者を取得
   */
  getCommitteeEventRecipients(
    post: Post,
    allUsers: User[]
  ): NotificationRecipient[] {
    const recipients: NotificationRecipient[] = [];

    // 投稿者
    recipients.push({
      userId: post.author.id,
      userName: post.author.name,
      role: post.author.role || '職員',
      reason: 'author'
    });

    // 投票済みユーザー
    const voters = this.getVoters(post, allUsers);
    recipients.push(...voters);

    return this.deduplicateRecipients(recipients);
  }

  /**
   * 期限管理通知の対象者を取得
   */
  getDeadlineRecipients(
    post: Post,
    allUsers: User[],
    scope: 'department' | 'facility' | 'corporation'
  ): NotificationRecipient[] {
    const recipients: NotificationRecipient[] = [];

    // 投稿者
    recipients.push({
      userId: post.author.id,
      userName: post.author.name,
      role: post.author.role || '職員',
      reason: 'author'
    });

    // スコープに応じた未投票ユーザー
    const eligibleUsers = this.getEligibleVoters(post, scope, allUsers);
    const nonVoters = eligibleUsers.filter(user =>
      !this.hasUserVoted(post, user.id)
    );

    recipients.push(...nonVoters.map(user => ({
      userId: user.id,
      userName: user.name,
      role: user.role || '職員',
      reason: scope
    })));

    return this.deduplicateRecipients(recipients);
  }

  /**
   * レベルごとの責任者を取得
   */
  private getResponsibleUsers(
    level: AgendaLevel,
    post: Post,
    allUsers: User[]
  ): NotificationRecipient[] {
    const recipients: NotificationRecipient[] = [];

    // レベルごとの責任者権限レベル
    const responsibleLevels: Record<AgendaLevel, number> = {
      'PENDING': 5,        // 副主任以上
      'DEPT_REVIEW': 6,    // 主任以上
      'DEPT_AGENDA': 8,    // 師長以上
      'FACILITY_AGENDA': 10, // 部長以上
      'CORP_REVIEW': 12,   // 副院長以上
      'CORP_AGENDA': 13    // 院長以上
    };

    const requiredLevel = responsibleLevels[level];

    // 同じ部署の責任者
    const departmentResponsibles = allUsers.filter(user =>
      user.department === post.author.department &&
      user.permissionLevel >= requiredLevel
    );

    recipients.push(...departmentResponsibles.map(user => ({
      userId: user.id,
      userName: user.name,
      role: user.role || '職員',
      reason: 'responsible' as const
    })));

    return recipients;
  }

  /**
   * 投票済みユーザーを取得
   */
  private getVoters(post: Post, allUsers: User[]): NotificationRecipient[] {
    // 実際の実装では、投票履歴データベースから取得
    // デモ実装ではpost.votesから推測
    const voters = allUsers.filter(user =>
      this.hasUserVoted(post, user.id)
    );

    return voters.map(user => ({
      userId: user.id,
      userName: user.name,
      role: user.role || '職員',
      reason: 'voter' as const
    }));
  }

  /**
   * 投票可能なユーザーを取得
   */
  private getEligibleVoters(
    post: Post,
    scope: 'department' | 'facility' | 'corporation',
    allUsers: User[]
  ): User[] {
    switch (scope) {
      case 'department':
        return allUsers.filter(user =>
          user.department === post.author.department
        );
      case 'facility':
        return allUsers.filter(user =>
          user.facility_id === post.author.facility_id
        );
      case 'corporation':
        return allUsers; // 全員
      default:
        return [];
    }
  }

  /**
   * ユーザーが投票済みかチェック
   */
  private hasUserVoted(post: Post, userId: string): boolean {
    // 実際の実装では、投票履歴データベースから確認
    // デモ実装では簡易的に判定
    return post.hasUserVoted || false;
  }

  /**
   * 重複する受信者を除去
   */
  private deduplicateRecipients(recipients: NotificationRecipient[]): NotificationRecipient[] {
    const seen = new Set<string>();
    return recipients.filter(recipient => {
      if (seen.has(recipient.userId)) {
        return false;
      }
      seen.add(recipient.userId);
      return true;
    });
  }
}

/**
 * 議題モード通知統合サービス
 */
export class AgendaNotificationIntegration {
  private targeting = new NotificationTargeting();

  /**
   * レベル昇格時の通知を発火
   */
  async notifyLevelUp(
    post: Post,
    oldLevel: AgendaLevel,
    newLevel: AgendaLevel,
    score: number,
    allUsers: User[]
  ): Promise<void> {
    console.log('📢 [AgendaNotification] Level up notification:', {
      postId: post.id,
      postTitle: post.title,
      oldLevel,
      newLevel,
      score
    });

    // 通知メッセージを生成
    const notification = agendaModeNotifications.getLevelUpNotification(
      newLevel,
      score,
      post.title
    );

    // 通知対象者を取得
    const recipients = this.targeting.getLevelUpRecipients(post, newLevel, allUsers);

    console.log(`📤 Sending to ${recipients.length} recipients:`, recipients.map(r => r.userName));

    // 各受信者に通知を送信
    await this.sendNotifications(notification, recipients);

    // 委員会提出可能レベルの場合、追加通知
    if (newLevel === 'FACILITY_AGENDA' || newLevel === 'CORP_REVIEW' || newLevel === 'CORP_AGENDA') {
      const submissionNotification = agendaModeNotifications.getCommitteeSubmissionAvailableNotification(
        post.title,
        newLevel
      );
      await this.sendNotifications(submissionNotification, recipients);
    }
  }

  /**
   * 委員会提出時の通知を発火
   */
  async notifyCommitteeSubmission(
    post: Post,
    committeeType: 'facility' | 'corporation',
    allUsers: User[]
  ): Promise<void> {
    console.log('📢 [AgendaNotification] Committee submission:', {
      postId: post.id,
      postTitle: post.title,
      committeeType
    });

    const notification = agendaModeNotifications.getCommitteeSubmissionNotification(
      post.title,
      committeeType
    );

    const recipients = this.targeting.getCommitteeEventRecipients(post, allUsers);

    await this.sendNotifications(notification, recipients);
  }

  /**
   * 委員会審議開始時の通知を発火
   */
  async notifyCommitteeReviewStarted(
    post: Post,
    committeeType: string,
    reviewDate: string,
    allUsers: User[]
  ): Promise<void> {
    console.log('📢 [AgendaNotification] Committee review started:', {
      postId: post.id,
      committeeType,
      reviewDate
    });

    const notification = agendaModeNotifications.getCommitteeReviewStartedNotification(
      post.title,
      committeeType,
      reviewDate
    );

    const recipients = this.targeting.getCommitteeEventRecipients(post, allUsers);

    await this.sendNotifications(notification, recipients);
  }

  /**
   * 委員会決定時の通知を発火
   */
  async notifyCommitteeDecision(
    post: Post,
    committeeType: string,
    decision: 'approved' | 'on_hold' | 'rejected',
    details: string,
    allUsers: User[]
  ): Promise<void> {
    console.log('📢 [AgendaNotification] Committee decision:', {
      postId: post.id,
      committeeType,
      decision,
      details
    });

    let notification: AgendaNotification;

    switch (decision) {
      case 'approved':
        notification = agendaModeNotifications.getCommitteeApprovedNotification(
          post.title,
          committeeType,
          details
        );
        break;
      case 'on_hold':
        notification = agendaModeNotifications.getCommitteeOnHoldNotification(
          post.title,
          committeeType,
          details
        );
        break;
      case 'rejected':
        notification = agendaModeNotifications.getCommitteeRejectedNotification(
          post.title,
          committeeType,
          details
        );
        break;
    }

    const recipients = this.targeting.getCommitteeEventRecipients(post, allUsers);

    await this.sendNotifications(notification, recipients);
  }

  /**
   * 投票期限警告通知を発火
   */
  async notifyDeadlineWarning(
    post: Post,
    hoursRemaining: number,
    scope: 'department' | 'facility' | 'corporation',
    allUsers: User[]
  ): Promise<void> {
    console.log('📢 [AgendaNotification] Deadline warning:', {
      postId: post.id,
      hoursRemaining,
      scope
    });

    const notification = hoursRemaining <= 24
      ? agendaModeNotifications.getVotingDeadlineTodayNotification(post.title)
      : agendaModeNotifications.getVotingDeadlineNotification(post.title, hoursRemaining);

    const recipients = this.targeting.getDeadlineRecipients(post, allUsers, scope);

    await this.sendNotifications(notification, recipients);
  }

  /**
   * 期限延長通知を発火
   */
  async notifyDeadlineExtension(
    post: Post,
    newDeadline: string,
    extensionCount: number,
    allUsers: User[]
  ): Promise<void> {
    console.log('📢 [AgendaNotification] Deadline extension:', {
      postId: post.id,
      newDeadline,
      extensionCount
    });

    const notification = agendaModeNotifications.getDeadlineExtensionNotification(
      post.title,
      newDeadline,
      extensionCount
    );

    const recipients = this.targeting.getCommitteeEventRecipients(post, allUsers);

    await this.sendNotifications(notification, recipients);
  }

  /**
   * 提案書生成完了通知を発火
   */
  async notifyProposalDocumentGenerated(
    post: Post,
    documentId: string,
    allUsers: User[]
  ): Promise<void> {
    console.log('📢 [AgendaNotification] Proposal document generated:', {
      postId: post.id,
      documentId
    });

    const notification = agendaModeNotifications.getProposalDocumentGeneratedNotification(
      post.title,
      documentId
    );

    // 投稿者のみに通知
    const recipients: NotificationRecipient[] = [{
      userId: post.author.id,
      userName: post.author.name,
      role: post.author.role || '職員',
      reason: 'author'
    }];

    await this.sendNotifications(notification, recipients);
  }

  /**
   * 実際に通知を送信
   */
  private async sendNotifications(
    notification: AgendaNotification,
    recipients: NotificationRecipient[]
  ): Promise<void> {
    // ブラウザ通知の許可を確認
    if ('Notification' in window && Notification.permission === 'granted') {
      // 代表者1名にのみブラウザ通知（スパム防止）
      if (recipients.length > 0) {
        const primaryRecipient = recipients[0];
        this.sendBrowserNotification(notification, primaryRecipient);
      }
    }

    // 実際の実装では、ここでバックエンドAPIを呼び出して通知を保存
    // await notificationAPI.createNotifications({
    //   notification,
    //   recipients
    // });

    console.log('✅ Notifications sent:', {
      title: notification.title,
      recipientCount: recipients.length,
      notification
    });
  }

  /**
   * ブラウザ通知を送信
   */
  private sendBrowserNotification(
    notification: AgendaNotification,
    recipient: NotificationRecipient
  ): void {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `agenda-${notification.type}`,
        requireInteraction: notification.type === 'celebration'
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };
    } catch (error) {
      console.error('Failed to send browser notification:', error);
    }
  }
}

// シングルトンインスタンス
export const agendaNotificationIntegration = new AgendaNotificationIntegration();
