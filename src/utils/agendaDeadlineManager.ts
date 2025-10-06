import { AgendaLevel, CommitteeStatus } from '../types/committee';

/**
 * 議題モード専用の期限管理ユーティリティ
 */

export interface AgendaDeadlineConfig {
  standardDays: number;      // 標準期限（日数）
  canExtend: boolean;        // 延長可能か
  autoExtendOnActivity: boolean; // 活動時に自動延長
}

export interface DeadlineInfo {
  deadline: Date;
  remainingDays: number;
  isNearExpiration: boolean; // 期限が近い（7日以内）
  isExpired: boolean;
  extensionCount?: number;   // 延長回数
}

export class AgendaDeadlineManager {
  /**
   * 議題レベル別の標準期限設定
   */
  private static LEVEL_DEADLINES: Record<AgendaLevel, AgendaDeadlineConfig> = {
    'PENDING': {
      standardDays: 30,
      canExtend: true,
      autoExtendOnActivity: true
    },
    'DEPT_REVIEW': {
      standardDays: 60,
      canExtend: true,
      autoExtendOnActivity: true
    },
    'DEPT_AGENDA': {
      standardDays: 90,
      canExtend: true,
      autoExtendOnActivity: true
    },
    'FACILITY_AGENDA': {
      standardDays: 180,
      canExtend: true,
      autoExtendOnActivity: false // 委員会審議中は別ロジック
    },
    'CORP_REVIEW': {
      standardDays: 365,
      canExtend: true,
      autoExtendOnActivity: false
    },
    'CORP_AGENDA': {
      standardDays: 9999, // 実質無期限
      canExtend: false,
      autoExtendOnActivity: false
    }
  };

  /**
   * 投稿作成時の期限を計算
   */
  static calculateInitialDeadline(
    agendaLevel: AgendaLevel,
    createdAt: Date = new Date()
  ): Date {
    const config = this.LEVEL_DEADLINES[agendaLevel];
    const deadline = new Date(createdAt);
    deadline.setDate(deadline.getDate() + config.standardDays);
    return deadline;
  }

  /**
   * 委員会ステータスに応じた期限調整
   */
  static adjustDeadlineByCommitteeStatus(
    currentDeadline: Date,
    committeeStatus?: CommitteeStatus
  ): Date {
    if (!committeeStatus) return currentDeadline;

    const now = new Date();
    const adjustedDeadline = new Date(currentDeadline);

    switch (committeeStatus) {
      case 'committee_reviewing':
        // 審議中は最低でも60日延長
        const minReviewingDeadline = new Date(now);
        minReviewingDeadline.setDate(minReviewingDeadline.getDate() + 60);
        return adjustedDeadline > minReviewingDeadline ? adjustedDeadline : minReviewingDeadline;

      case 'implementation_decided':
        // 実施決定後は1年間表示（実績として）
        const implementationDeadline = new Date(now);
        implementationDeadline.setFullYear(implementationDeadline.getFullYear() + 1);
        return implementationDeadline;

      case 'escalated_to_corp':
        // 法人エスカレーション時は1年延長
        const escalatedDeadline = new Date(now);
        escalatedDeadline.setFullYear(escalatedDeadline.getFullYear() + 1);
        return escalatedDeadline;

      case 'returned_for_improvement':
        // 改善要請時は90日延長
        const returnedDeadline = new Date(now);
        returnedDeadline.setDate(returnedDeadline.getDate() + 90);
        return returnedDeadline;

      case 'rejected':
        // 却下後30日でアーカイブ
        const rejectedDeadline = new Date(now);
        rejectedDeadline.setDate(rejectedDeadline.getDate() + 30);
        return rejectedDeadline;

      default:
        return adjustedDeadline;
    }
  }

  /**
   * 期限情報を取得
   */
  static getDeadlineInfo(
    deadline: Date,
    extensionCount: number = 0
  ): DeadlineInfo {
    const now = new Date();
    const remainingMs = deadline.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

    return {
      deadline,
      remainingDays,
      isNearExpiration: remainingDays > 0 && remainingDays <= 7,
      isExpired: remainingDays <= 0,
      extensionCount
    };
  }

  /**
   * 活動状況に基づく自動延長判定
   */
  static shouldAutoExtend(
    agendaLevel: AgendaLevel,
    lastActivityDate: Date,
    currentDeadline: Date
  ): boolean {
    const config = this.LEVEL_DEADLINES[agendaLevel];

    if (!config.autoExtendOnActivity) {
      return false;
    }

    const now = new Date();
    const daysSinceActivity = Math.floor(
      (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 直近30日以内に活動があり、期限まで14日以内の場合は延長
    const daysUntilDeadline = Math.ceil(
      (currentDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceActivity <= 30 && daysUntilDeadline <= 14;
  }

  /**
   * 期限延長を実行
   */
  static extendDeadline(
    currentDeadline: Date,
    extensionDays: number = 30
  ): Date {
    const newDeadline = new Date(currentDeadline);
    newDeadline.setDate(newDeadline.getDate() + extensionDays);
    return newDeadline;
  }

  /**
   * 期限表示用のフォーマット
   */
  static formatDeadline(deadline: Date): string {
    return deadline.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * 期限アラートメッセージを生成
   */
  static getDeadlineMessage(deadlineInfo: DeadlineInfo): {
    message: string;
    severity: 'info' | 'warning' | 'error';
  } | null {
    if (deadlineInfo.isExpired) {
      return {
        message: '投票期限が終了しました',
        severity: 'error'
      };
    }

    if (deadlineInfo.isNearExpiration) {
      return {
        message: `⏰ 投票期限まであと${deadlineInfo.remainingDays}日`,
        severity: 'warning'
      };
    }

    if (deadlineInfo.remainingDays <= 14) {
      return {
        message: `投票期限まで${deadlineInfo.remainingDays}日`,
        severity: 'info'
      };
    }

    return null;
  }

  /**
   * 委員会ステータスに基づく期限表示の説明
   */
  static getCommitteeDeadlineDescription(committeeStatus?: CommitteeStatus): string | null {
    if (!committeeStatus) return null;

    const descriptions: Record<CommitteeStatus, string> = {
      'pending': '投票期限内に委員会提出を目指しましょう',
      'under_review': '施設長審査中のため期限を延長しています',
      'committee_submitted': '委員会審議開始待ちです',
      'committee_reviewing': '委員会審議中のため期限を延長しています',
      'implementation_decided': '実施決定済み（記録として1年間表示）',
      'escalated_to_corp': '法人検討にエスカレーション（1年間表示）',
      'returned_for_improvement': '改善要請のため90日延長されました',
      'rejected': '却下後30日でアーカイブされます'
    };

    return descriptions[committeeStatus] || null;
  }

  /**
   * レベルアップ時の期限調整
   */
  static adjustDeadlineOnLevelUp(
    currentDeadline: Date,
    newLevel: AgendaLevel
  ): Date {
    const config = this.LEVEL_DEADLINES[newLevel];
    const now = new Date();

    // 新しいレベルの標準期限を計算
    const newStandardDeadline = new Date(now);
    newStandardDeadline.setDate(newStandardDeadline.getDate() + config.standardDays);

    // 現在の期限と新しい標準期限のうち、長い方を採用
    return currentDeadline > newStandardDeadline ? currentDeadline : newStandardDeadline;
  }
}

// デフォルトエクスポート
export default AgendaDeadlineManager;
