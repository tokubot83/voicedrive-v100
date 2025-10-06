/**
 * 議題モード投稿終了処理サービス
 *
 * 期限切れ後や責任者判断による投稿終了処理を管理
 */

import { Post, User } from '../../../types';
import { AgendaLevel } from '../../../types/committee';
import { agendaNotificationIntegration } from './AgendaNotificationIntegration';

export type ClosureReason =
  | 'deadline_expired'       // 期限切れ
  | 'rejected_by_manager'    // 責任者により却下
  | 'held_by_manager'        // 責任者により保留
  | 'department_matter'      // 部署案件として処理
  | 'committee_approved'     // 委員会承認により終了
  | 'committee_rejected';    // 委員会却下により終了

export interface ClosureInfo {
  reason: ClosureReason;
  closedBy?: string;
  closedAt: Date;
  finalScore: number;
  finalLevel: AgendaLevel;
  feedback?: string;
  archiveDate?: Date;  // アーカイブ予定日
}

/**
 * 投稿終了処理サービス
 */
export class AgendaPostClosureService {

  /**
   * 期限切れによる自動終了
   */
  static async closeByDeadlineExpiration(
    post: Post,
    finalScore: number,
    allUsers: User[]
  ): Promise<ClosureInfo> {
    console.log('⏰ [AgendaClosure] Closing post due to deadline expiration:', {
      postId: post.id,
      postTitle: post.title,
      finalScore
    });

    const closureInfo: ClosureInfo = {
      reason: 'deadline_expired',
      closedAt: new Date(),
      finalScore,
      finalLevel: post.agendaStatus?.level || 'PENDING',
      feedback: '投票期限終了。このまま責任者の判断を待つか、提案を再検討してください。',
      archiveDate: this.calculateArchiveDate('deadline_expired')
    };

    // 実際の実装では、ここでバックエンドAPIを呼び出し
    // await postAPI.closurePost({ postId: post.id, closureInfo });

    // 投稿者に通知
    await this.notifyAuthor(post, closureInfo);

    return closureInfo;
  }

  /**
   * 責任者による却下
   */
  static async closeByRejection(
    post: Post,
    managerId: string,
    managerName: string,
    feedback: string,
    finalScore: number,
    allUsers: User[]
  ): Promise<ClosureInfo> {
    console.log('❌ [AgendaClosure] Closing post by manager rejection:', {
      postId: post.id,
      managerId,
      feedback
    });

    const closureInfo: ClosureInfo = {
      reason: 'rejected_by_manager',
      closedBy: managerName,
      closedAt: new Date(),
      finalScore,
      finalLevel: post.agendaStatus?.level || 'PENDING',
      feedback,
      archiveDate: this.calculateArchiveDate('rejected_by_manager')
    };

    // 投稿者と投票済みユーザーに通知
    await this.notifyStakeholders(post, closureInfo, allUsers);

    return closureInfo;
  }

  /**
   * 責任者による保留
   */
  static async closeByHold(
    post: Post,
    managerId: string,
    managerName: string,
    feedback: string,
    finalScore: number,
    allUsers: User[]
  ): Promise<ClosureInfo> {
    console.log('⏸️ [AgendaClosure] Holding post by manager:', {
      postId: post.id,
      managerId,
      feedback
    });

    const closureInfo: ClosureInfo = {
      reason: 'held_by_manager',
      closedBy: managerName,
      closedAt: new Date(),
      finalScore,
      finalLevel: post.agendaStatus?.level || 'PENDING',
      feedback,
      // 保留は再検討の可能性があるため、アーカイブは180日後
      archiveDate: this.calculateArchiveDate('held_by_manager')
    };

    await this.notifyStakeholders(post, closureInfo, allUsers);

    return closureInfo;
  }

  /**
   * 部署案件として終了
   */
  static async closeAsDepartmentMatter(
    post: Post,
    managerId: string,
    managerName: string,
    feedback: string,
    finalScore: number,
    allUsers: User[]
  ): Promise<ClosureInfo> {
    console.log('🏢 [AgendaClosure] Closing as department matter:', {
      postId: post.id,
      managerId,
      feedback
    });

    const closureInfo: ClosureInfo = {
      reason: 'department_matter',
      closedBy: managerName,
      closedAt: new Date(),
      finalScore,
      finalLevel: post.agendaStatus?.level || 'PENDING',
      feedback: `部署ミーティング案件として処理します。${feedback}`,
      // 部署案件は90日後にアーカイブ
      archiveDate: this.calculateArchiveDate('department_matter')
    };

    await this.notifyStakeholders(post, closureInfo, allUsers);

    return closureInfo;
  }

  /**
   * 委員会決定による終了
   */
  static async closeByCommitteeDecision(
    post: Post,
    decision: 'approved' | 'rejected',
    committeeType: string,
    feedback: string,
    finalScore: number,
    allUsers: User[]
  ): Promise<ClosureInfo> {
    console.log('🏛️ [AgendaClosure] Closing by committee decision:', {
      postId: post.id,
      decision,
      committeeType
    });

    const closureInfo: ClosureInfo = {
      reason: decision === 'approved' ? 'committee_approved' : 'committee_rejected',
      closedBy: committeeType,
      closedAt: new Date(),
      finalScore,
      finalLevel: post.agendaStatus?.level || 'PENDING',
      feedback,
      // 承認は1年間参照表示、却下は30日後にアーカイブ
      archiveDate: this.calculateArchiveDate(
        decision === 'approved' ? 'committee_approved' : 'committee_rejected'
      )
    };

    await this.notifyStakeholders(post, closureInfo, allUsers);

    return closureInfo;
  }

  /**
   * アーカイブ予定日を計算
   */
  private static calculateArchiveDate(reason: ClosureReason): Date {
    const now = new Date();
    const archiveDate = new Date(now);

    const daysUntilArchive: Record<ClosureReason, number> = {
      'deadline_expired': 90,        // 期限切れは90日後
      'rejected_by_manager': 30,     // 却下は30日後
      'held_by_manager': 180,        // 保留は180日後（再検討の可能性）
      'department_matter': 90,       // 部署案件は90日後
      'committee_approved': 365,     // 承認は1年間参照表示
      'committee_rejected': 30       // 委員会却下は30日後
    };

    archiveDate.setDate(archiveDate.getDate() + daysUntilArchive[reason]);
    return archiveDate;
  }

  /**
   * 投稿者に通知
   */
  private static async notifyAuthor(
    post: Post,
    closureInfo: ClosureInfo
  ): Promise<void> {
    // 実際の実装では通知サービスを使用
    console.log('📧 [AgendaClosure] Notifying author:', {
      authorId: post.author.id,
      reason: closureInfo.reason
    });
  }

  /**
   * 関係者（投稿者+投票済みユーザー）に通知
   */
  private static async notifyStakeholders(
    post: Post,
    closureInfo: ClosureInfo,
    allUsers: User[]
  ): Promise<void> {
    // 投稿者と投票済みユーザーに通知
    console.log('📧 [AgendaClosure] Notifying stakeholders:', {
      postId: post.id,
      reason: closureInfo.reason,
      recipientCount: allUsers.length
    });
  }

  /**
   * 終了理由の表示文を取得
   */
  static getClosureReasonText(reason: ClosureReason): string {
    const texts: Record<ClosureReason, string> = {
      'deadline_expired': '投票期限終了',
      'rejected_by_manager': '責任者により却下',
      'held_by_manager': '責任者により保留',
      'department_matter': '部署案件として処理',
      'committee_approved': '委員会承認により実施決定',
      'committee_rejected': '委員会により却下'
    };

    return texts[reason];
  }

  /**
   * アーカイブまでの日数を取得
   */
  static getDaysUntilArchive(archiveDate: Date): number {
    const now = new Date();
    const diffMs = archiveDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * 投稿が終了済みかチェック
   */
  static isClosed(post: Post): boolean {
    // 実際の実装では、post.closureInfoなどのフィールドで判定
    // デモ実装では簡易的にチェック
    return post.isArchived || false;
  }

  /**
   * 投稿がアーカイブ済みかチェック
   */
  static isArchived(post: Post): boolean {
    return post.isArchived || false;
  }
}

export default AgendaPostClosureService;
