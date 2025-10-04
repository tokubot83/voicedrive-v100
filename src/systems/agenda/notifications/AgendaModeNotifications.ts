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
      actionUrl: `/idea-voice/proposal/${documentId}`
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
}

// シングルトンインスタンス
export const agendaModeNotifications = new AgendaModeNotifications();
