// 議題モード専用の通知メッセージシステム
import { AgendaLevel } from '../../../types/committee';

export interface AgendaNotification {
  title: string;
  message: string;
  icon: string;
  type: 'info' | 'success' | 'warning' | 'celebration';
  actionText?: string;
  actionUrl?: string;
}

/**
 * 議題モード専用の通知メッセージジェネレーター
 */
export class AgendaModeNotifications {

  /**
   * レベルアップ通知
   */
  getLevelUpNotification(
    newLevel: AgendaLevel,
    score: number,
    postTitle: string
  ): AgendaNotification {
    const notifications: Record<AgendaLevel, AgendaNotification> = {
      'PENDING': {
        title: '投稿が作成されました',
        message: `「${postTitle}」が部署内で検討開始されました`,
        icon: '💭',
        type: 'info'
      },
      'DEPT_REVIEW': {
        title: '部署検討が開始されました',
        message: `「${postTitle}」が30点を突破！部署内で本格的な検討が始まりました`,
        icon: '📋',
        type: 'success',
        actionText: '部署メンバーに共有',
        actionUrl: '/idea-voice/share'
      },
      'DEPT_AGENDA': {
        title: '部署議題に昇格しました',
        message: `「${postTitle}」が50点を突破！部署の正式議題になりました`,
        icon: '👥',
        type: 'celebration',
        actionText: '議題詳細を見る',
        actionUrl: '/idea-voice/progress'
      },
      'FACILITY_AGENDA': {
        title: '🎉 委員会提出レベルに到達！',
        message: `「${postTitle}」が100点を突破！施設全体の議題として委員会への提出が可能になりました`,
        icon: '🏥',
        type: 'celebration',
        actionText: '委員会に提出',
        actionUrl: '/idea-voice/committee-bridge'
      },
      'CORP_REVIEW': {
        title: '法人レベルの検討開始',
        message: `「${postTitle}」が300点を突破！法人全体で検討が始まりました`,
        icon: '🏢',
        type: 'celebration',
        actionText: '法人メンバーに通知',
        actionUrl: '/idea-voice/share'
      },
      'CORP_AGENDA': {
        title: '🏆 理事会提出レベルに到達！',
        message: `「${postTitle}」が600点を突破！法人の正式議題として理事会への提出が可能になりました`,
        icon: '🏛️',
        type: 'celebration',
        actionText: '理事会に提出',
        actionUrl: '/idea-voice/committee-bridge'
      }
    };

    return notifications[newLevel];
  }

  /**
   * 投票範囲拡大通知
   */
  getVotingScopeExpandedNotification(
    newScope: string,
    postTitle: string
  ): AgendaNotification {
    return {
      title: '投票範囲が拡大されました',
      message: `「${postTitle}」の投票範囲が${newScope}に拡大しました`,
      icon: '📣',
      type: 'info',
      actionText: '投票する',
      actionUrl: '/idea-voice'
    };
  }

  /**
   * 委員会提出通知
   */
  getCommitteeSubmissionNotification(
    postTitle: string,
    committeeType: 'facility' | 'corporation'
  ): AgendaNotification {
    const messages = {
      facility: {
        title: '施設委員会に提出されました',
        message: `「${postTitle}」が施設委員会に正式に提出されました。委員会での審議をお待ちください`,
        icon: '📝',
        actionText: '提出状況を確認'
      },
      corporation: {
        title: '理事会に提出されました',
        message: `「${postTitle}」が理事会に正式に提出されました。理事会での審議をお待ちください`,
        icon: '📋',
        actionText: '提出状況を確認'
      }
    };

    const config = messages[committeeType];

    return {
      ...config,
      type: 'success',
      actionUrl: '/idea-voice/committee-bridge'
    };
  }

  /**
   * 議題承認通知
   */
  getAgendaApprovalNotification(
    postTitle: string,
    approverName: string,
    approverLevel: string
  ): AgendaNotification {
    return {
      title: '議題が承認されました',
      message: `「${postTitle}」が${approverLevel}の${approverName}さんに承認されました`,
      icon: '✅',
      type: 'success',
      actionText: '議題詳細を見る',
      actionUrl: '/idea-voice/progress'
    };
  }

  /**
   * 議題提案書生成完了通知
   */
  getProposalDocumentGeneratedNotification(
    postTitle: string,
    documentId: string
  ): AgendaNotification {
    return {
      title: '議題提案書が生成されました',
      message: `「${postTitle}」の議題提案書が自動生成されました。委員会への提出に使用できます`,
      icon: '📄',
      type: 'success',
      actionText: '提案書を確認',
      actionUrl: `/proposal-management/document/${documentId}`
    };
  }

  /**
   * コメント投稿通知
   */
  getCommentNotification(
    postTitle: string,
    commenterName: string,
    commentSnippet: string
  ): AgendaNotification {
    return {
      title: '新しいコメントが投稿されました',
      message: `${commenterName}さんが「${postTitle}」にコメントしました：「${commentSnippet}」`,
      icon: '💬',
      type: 'info',
      actionText: 'コメントを見る',
      actionUrl: '/idea-voice'
    };
  }

  /**
   * 投票締切間近通知
   */
  getVotingDeadlineNotification(
    postTitle: string,
    hoursRemaining: number
  ): AgendaNotification {
    return {
      title: '投票締切が近づいています',
      message: `「${postTitle}」の投票締切まで残り${hoursRemaining}時間です`,
      icon: '⏰',
      type: 'warning',
      actionText: '今すぐ投票',
      actionUrl: '/idea-voice'
    };
  }

  /**
   * 部署内共有推奨通知
   */
  getDepartmentShareRecommendation(
    postTitle: string,
    currentVotes: number,
    targetVotes: number
  ): AgendaNotification {
    return {
      title: '部署メンバーへの共有を推奨',
      message: `「${postTitle}」は現在${currentVotes}票です。あと${targetVotes - currentVotes}票で次のレベルに到達します！部署メンバーに共有してみませんか？`,
      icon: '📢',
      type: 'info',
      actionText: 'メンバーに共有',
      actionUrl: '/idea-voice/share'
    };
  }

  /**
   * 委員会審議開始通知
   */
  getCommitteeReviewStartedNotification(
    postTitle: string,
    committeeType: string,
    reviewDate: string
  ): AgendaNotification {
    return {
      title: '委員会での審議が開始されました',
      message: `「${postTitle}」が${committeeType}で審議されています（審議日: ${reviewDate}）`,
      icon: '👁️',
      type: 'info',
      actionText: '審議状況を確認',
      actionUrl: '/committee-submission-approval'
    };
  }

  /**
   * 委員会決定通知（承認）
   */
  getCommitteeApprovedNotification(
    postTitle: string,
    committeeType: string,
    decision: string
  ): AgendaNotification {
    return {
      title: '✅ 委員会で承認されました',
      message: `「${postTitle}」が${committeeType}で承認されました！決定内容: ${decision}`,
      icon: '✅',
      type: 'celebration',
      actionText: '決定内容を見る',
      actionUrl: '/committee-submission-approval'
    };
  }

  /**
   * 委員会決定通知（保留）
   */
  getCommitteeOnHoldNotification(
    postTitle: string,
    committeeType: string,
    reason: string
  ): AgendaNotification {
    return {
      title: '委員会で保留となりました',
      message: `「${postTitle}」が${committeeType}で保留されました。理由: ${reason}`,
      icon: '⏸️',
      type: 'warning',
      actionText: '詳細を確認',
      actionUrl: '/committee-submission-approval'
    };
  }

  /**
   * 委員会決定通知（差し戻し）
   */
  getCommitteeRejectedNotification(
    postTitle: string,
    committeeType: string,
    feedback: string
  ): AgendaNotification {
    return {
      title: '委員会から差し戻されました',
      message: `「${postTitle}」が${committeeType}から差し戻されました。フィードバック: ${feedback}`,
      icon: '↩️',
      type: 'warning',
      actionText: '修正して再提出',
      actionUrl: '/proposal-management'
    };
  }

  /**
   * 投票期限延長通知
   */
  getDeadlineExtensionNotification(
    postTitle: string,
    newDeadline: string,
    extensionCount: number
  ): AgendaNotification {
    return {
      title: '投票期限が延長されました',
      message: `「${postTitle}」の投票期限が${newDeadline}まで延長されました（${extensionCount}回目の延長）`,
      icon: '🔔',
      type: 'info',
      actionText: '投票する',
      actionUrl: '/idea-voice'
    };
  }

  /**
   * 責任者割り当て通知
   */
  getResponsibilityAssignedNotification(
    postTitle: string,
    agendaLevel: AgendaLevel,
    responsibleRole: string
  ): AgendaNotification {
    const levelLabels: Record<AgendaLevel, string> = {
      'PENDING': '検討中',
      'DEPT_REVIEW': '部署検討',
      'DEPT_AGENDA': '部署議題',
      'FACILITY_AGENDA': '施設議題',
      'CORP_REVIEW': '法人検討',
      'CORP_AGENDA': '法人議題'
    };

    return {
      title: '議題の責任者に任命されました',
      message: `「${postTitle}」（${levelLabels[agendaLevel]}）の責任者として、${responsibleRole}が任命されました`,
      icon: '👤',
      type: 'info',
      actionText: '議題を確認',
      actionUrl: '/proposal-management'
    };
  }

  /**
   * 投票期限当日通知
   */
  getVotingDeadlineTodayNotification(
    postTitle: string
  ): AgendaNotification {
    return {
      title: '⚠️ 投票締切は本日です',
      message: `「${postTitle}」の投票締切は本日中です。まだ投票していない方はお早めに！`,
      icon: '⚠️',
      type: 'warning',
      actionText: '今すぐ投票',
      actionUrl: '/idea-voice'
    };
  }

  /**
   * 委員会提出可能通知（施設議題以上）
   */
  getCommitteeSubmissionAvailableNotification(
    postTitle: string,
    agendaLevel: AgendaLevel
  ): AgendaNotification {
    const messages = {
      'FACILITY_AGENDA': {
        title: '委員会への提出が可能になりました',
        message: `「${postTitle}」が施設議題レベルに到達しました。施設運営委員会への提出が可能です`,
        targetCommittee: '施設運営委員会'
      },
      'CORP_REVIEW': {
        title: '法人委員会への提出が可能になりました',
        message: `「${postTitle}」が法人検討レベルに到達しました。法人運営委員会への提出が可能です`,
        targetCommittee: '法人運営委員会'
      },
      'CORP_AGENDA': {
        title: '理事会への提出が可能になりました',
        message: `「${postTitle}」が法人議題レベルに到達しました。理事会への提出が可能です`,
        targetCommittee: '理事会'
      }
    };

    const config = messages[agendaLevel as keyof typeof messages] || messages['FACILITY_AGENDA'];

    return {
      title: config.title,
      message: config.message,
      icon: '📋',
      type: 'success',
      actionText: `${config.targetCommittee}に提出`,
      actionUrl: '/committee-submission-approval'
    };
  }
}

// シングルトンインスタンス
export const agendaModeNotifications = new AgendaModeNotifications();
