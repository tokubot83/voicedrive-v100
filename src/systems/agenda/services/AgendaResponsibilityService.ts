/**
 * 議題モード責任者権限管理サービス
 *
 * 公平性を重視した権限制約:
 * - 投票期限内: レベルアップ承認のみ可能（良い提案を早く上げる）
 * - 投票期限後: 却下・保留・部署案件化が可能
 */

import { Post } from '../../../types';
import { AgendaLevel } from '../../../types/committee';
import AgendaDeadlineManager from '../../../utils/agendaDeadlineManager';

export type ResponsibilityAction =
  | 'approve_levelup'      // レベルアップ承認（期限内でも可）
  | 'reject'               // 却下（期限後のみ）
  | 'hold'                 // 保留（期限後のみ）
  | 'department_matter';   // 部署案件化（期限後のみ）

export interface ActionPermission {
  action: ResponsibilityAction;
  allowed: boolean;
  reason?: string;
}

/**
 * 責任者が実行できるアクションを判定
 */
export class AgendaResponsibilityService {

  /**
   * 責任者が特定のアクションを実行できるかチェック
   */
  static canPerformAction(
    post: Post,
    action: ResponsibilityAction,
    responsibleUserLevel: number
  ): ActionPermission {
    // 投稿の期限状態を確認
    const isWithinDeadline = this.isWithinStandardDeadline(post);
    const hasExpired = this.hasExpired(post);

    // レベルアップ承認は常に可能（良い提案を早く上げる）
    if (action === 'approve_levelup') {
      if (hasExpired) {
        return {
          action,
          allowed: false,
          reason: '投票期限が終了しているため、レベルアップできません'
        };
      }
      return {
        action,
        allowed: true
      };
    }

    // 却下・保留・部署案件化は期限後のみ可能（公平性確保）
    if (isWithinDeadline) {
      return {
        action,
        allowed: false,
        reason: '公平性確保のため、投票期限内は却下・保留できません。期限終了後に判断してください。'
      };
    }

    // 期限後は実行可能
    return {
      action,
      allowed: true
    };
  }

  /**
   * 実行可能な全アクションを取得
   */
  static getAvailableActions(
    post: Post,
    responsibleUserLevel: number
  ): ActionPermission[] {
    const actions: ResponsibilityAction[] = [
      'approve_levelup',
      'reject',
      'hold',
      'department_matter'
    ];

    return actions.map(action =>
      this.canPerformAction(post, action, responsibleUserLevel)
    );
  }

  /**
   * 標準期限内かチェック
   */
  private static isWithinStandardDeadline(post: Post): boolean {
    if (!post.agendaDeadline || !post.createdAt) {
      return false;
    }

    const now = new Date();
    const deadline = new Date(post.agendaDeadline);

    return now < deadline;
  }

  /**
   * 期限切れかチェック
   */
  private static hasExpired(post: Post): boolean {
    if (!post.agendaDeadline) {
      return false;
    }

    const deadlineInfo = AgendaDeadlineManager.getDeadlineInfo(
      new Date(post.agendaDeadline),
      post.agendaDeadlineExtensions || 0
    );

    return deadlineInfo.isExpired;
  }

  /**
   * 責任者が期限延長を承認できるかチェック
   */
  static canApproveExtension(
    post: Post,
    responsibleUserLevel: number
  ): { allowed: boolean; reason?: string } {
    if (!post.agendaStatus?.level || !post.createdAt) {
      return { allowed: false, reason: '議題情報が不足しています' };
    }

    // 最大期限に達している場合は延長不可
    const hasReachedMax = AgendaDeadlineManager.hasReachedMaxDeadline(
      new Date(post.agendaDeadline || Date.now()),
      post.agendaStatus.level,
      new Date(post.createdAt)
    );

    if (hasReachedMax) {
      return {
        allowed: false,
        reason: '最大期限に達しているため、これ以上延長できません'
      };
    }

    return { allowed: true };
  }

  /**
   * アクションの説明文を取得
   */
  static getActionDescription(action: ResponsibilityAction): string {
    const descriptions: Record<ResponsibilityAction, string> = {
      'approve_levelup': '次のレベルへ昇格させる（良い提案を早く実現）',
      'reject': '提案を却下する（投票期限後のみ）',
      'hold': '提案を保留する（投票期限後のみ）',
      'department_matter': '部署ミーティング案件として処理する（投票期限後のみ）'
    };

    return descriptions[action];
  }

  /**
   * 期限状態の説明を取得
   */
  static getDeadlineStatusMessage(post: Post): {
    message: string;
    type: 'info' | 'warning' | 'success';
  } {
    if (!post.agendaDeadline) {
      return {
        message: '投票期限が設定されていません',
        type: 'warning'
      };
    }

    const isWithinDeadline = this.isWithinStandardDeadline(post);
    const hasExpired = this.hasExpired(post);

    if (hasExpired) {
      return {
        message: '投票期限終了。却下・保留・部署案件化の判断ができます',
        type: 'info'
      };
    }

    if (isWithinDeadline) {
      const deadlineInfo = AgendaDeadlineManager.getDeadlineInfo(
        new Date(post.agendaDeadline),
        post.agendaDeadlineExtensions || 0
      );

      return {
        message: `投票期限内（残り${deadlineInfo.remainingDays}日）。レベルアップ承認のみ可能です`,
        type: 'success'
      };
    }

    return {
      message: '投票期限終了',
      type: 'info'
    };
  }
}

export default AgendaResponsibilityService;
