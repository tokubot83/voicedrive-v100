// プロジェクトモード専用の通知メッセージシステム
import { ProjectLevel } from '../../../types/visibility';

export interface ProjectNotification {
  title: string;
  message: string;
  icon: string;
  type: 'info' | 'success' | 'warning' | 'celebration';
  actionText?: string;
  actionUrl?: string;
}

/**
 * プロジェクトモード専用の通知メッセージジェネレーター
 */
export class ProjectModeNotifications {

  /**
   * レベルアップ通知
   */
  getLevelUpNotification(
    newLevel: ProjectLevel,
    score: number,
    postTitle: string
  ): ProjectNotification {
    const notifications: Record<ProjectLevel, ProjectNotification> = {
      'PENDING': {
        title: 'アイデアが投稿されました',
        message: `「${postTitle}」がアイデアとして投稿されました`,
        icon: '💡',
        type: 'info'
      },
      'TEAM': {
        title: 'チームプロジェクトに昇格しました',
        message: `「${postTitle}」が100点を突破！小規模チームでの実施が可能になりました`,
        icon: '👥',
        type: 'success',
        actionText: 'チームを編成',
        actionUrl: '/projects/team-formation'
      },
      'DEPARTMENT': {
        title: '部署プロジェクトに昇格しました',
        message: `「${postTitle}」が200点を突破！部署全体でのプロジェクト化が可能になりました`,
        icon: '🏢',
        type: 'celebration',
        actionText: 'プロジェクト詳細',
        actionUrl: '/projects/my-projects'
      },
      'FACILITY': {
        title: '🎉 施設プロジェクトに昇格！',
        message: `「${postTitle}」が400点を突破！施設横断のプロジェクトとして実施可能になりました`,
        icon: '🏥',
        type: 'celebration',
        actionText: 'プロジェクトチーム編成',
        actionUrl: '/projects/team-formation'
      },
      'ORGANIZATION': {
        title: '🏆 法人プロジェクトに昇格！',
        message: `「${postTitle}」が800点を突破！法人全体でのプロジェクトとして実施可能になりました`,
        icon: '🌐',
        type: 'celebration',
        actionText: 'プロジェクト計画',
        actionUrl: '/projects/project-plan'
      },
      'STRATEGIC': {
        title: '🌟 戦略プロジェクトに認定！',
        message: `「${postTitle}」が戦略プロジェクトに認定されました！法人の最重要案件として推進されます`,
        icon: '🎯',
        type: 'celebration',
        actionText: '戦略プロジェクト詳細',
        actionUrl: '/projects/strategic'
      }
    };

    return notifications[newLevel];
  }

  /**
   * チーム編成通知
   */
  getTeamFormationNotification(
    projectTitle: string,
    teamLeaderName: string,
    teamSize: number
  ): ProjectNotification {
    return {
      title: 'プロジェクトチームが編成されました',
      message: `「${projectTitle}」のチームが編成されました。リーダー: ${teamLeaderName}、メンバー: ${teamSize}名`,
      icon: '👥',
      type: 'success',
      actionText: 'チームを見る',
      actionUrl: '/projects/team'
    };
  }

  /**
   * チーム参加招待通知
   */
  getTeamInvitationNotification(
    projectTitle: string,
    inviterName: string
  ): ProjectNotification {
    return {
      title: 'プロジェクトチームに招待されました',
      message: `${inviterName}さんから「${projectTitle}」のプロジェクトチームに招待されました`,
      icon: '📬',
      type: 'info',
      actionText: '招待を確認',
      actionUrl: '/projects/invitations'
    };
  }

  /**
   * タスク割り当て通知
   */
  getTaskAssignmentNotification(
    projectTitle: string,
    taskName: string,
    assignerName: string
  ): ProjectNotification {
    return {
      title: '新しいタスクが割り当てられました',
      message: `${assignerName}さんから「${projectTitle}」の「${taskName}」が割り当てられました`,
      icon: '📋',
      type: 'info',
      actionText: 'タスクを見る',
      actionUrl: '/projects/my-tasks'
    };
  }

  /**
   * マイルストーン達成通知
   */
  getMilestoneAchievedNotification(
    projectTitle: string,
    milestoneName: string
  ): ProjectNotification {
    return {
      title: 'マイルストーン達成！',
      message: `「${projectTitle}」の「${milestoneName}」が達成されました`,
      icon: '🎯',
      type: 'celebration',
      actionText: 'プロジェクト進捗',
      actionUrl: '/projects/progress'
    };
  }

  /**
   * プロジェクト完了通知
   */
  getProjectCompletionNotification(
    projectTitle: string,
    completionRate: number
  ): ProjectNotification {
    return {
      title: 'プロジェクトが完了しました',
      message: `「${projectTitle}」が完了しました（達成度: ${completionRate}%）`,
      icon: '✅',
      type: 'celebration',
      actionText: '成果を見る',
      actionUrl: '/projects/results'
    };
  }

  /**
   * 進捗更新通知
   */
  getProgressUpdateNotification(
    projectTitle: string,
    updaterName: string,
    progress: number
  ): ProjectNotification {
    return {
      title: 'プロジェクト進捗が更新されました',
      message: `${updaterName}さんが「${projectTitle}」の進捗を更新しました（${progress}%）`,
      icon: '📊',
      type: 'info',
      actionText: '進捗を見る',
      actionUrl: '/projects/progress'
    };
  }

  /**
   * コラボレーション推奨通知
   */
  getCollaborationRecommendation(
    projectTitle: string,
    recommendedDepartments: string[]
  ): ProjectNotification {
    return {
      title: '他部署との連携を推奨',
      message: `「${projectTitle}」は${recommendedDepartments.join('、')}との連携で更に効果が期待できます`,
      icon: '🤝',
      type: 'info',
      actionText: '部署に連絡',
      actionUrl: '/projects/collaboration'
    };
  }

  /**
   * プロジェクト昇格推奨通知
   */
  getProjectEscalationRecommendation(
    projectTitle: string,
    currentScore: number,
    nextLevelScore: number
  ): ProjectNotification {
    const remaining = nextLevelScore - currentScore;
    return {
      title: 'プロジェクト昇格が近づいています',
      message: `「${projectTitle}」はあと${remaining}点で次のレベルに到達します。チームメンバーに共有しましょう！`,
      icon: '📈',
      type: 'info',
      actionText: 'チームに共有',
      actionUrl: '/projects/share'
    };
  }

  /**
   * 部署横断プロジェクト化通知
   */
  getCrossDepartmentProjectNotification(
    projectTitle: string,
    departments: string[]
  ): ProjectNotification {
    return {
      title: '部署横断プロジェクトに発展',
      message: `「${projectTitle}」が${departments.length}部署の協働プロジェクトになりました`,
      icon: '🌉',
      type: 'celebration',
      actionText: 'プロジェクト詳細',
      actionUrl: '/projects/cross-department'
    };
  }

  /**
   * タスク期限間近通知
   */
  getTaskDeadlineNotification(
    projectTitle: string,
    taskName: string,
    hoursRemaining: number
  ): ProjectNotification {
    return {
      title: 'タスク期限が近づいています',
      message: `「${projectTitle}」の「${taskName}」の期限まで残り${hoursRemaining}時間です`,
      icon: '⏰',
      type: 'warning',
      actionText: 'タスクを確認',
      actionUrl: '/projects/my-tasks'
    };
  }
}

// シングルトンインスタンス
export const projectModeNotifications = new ProjectModeNotifications();
