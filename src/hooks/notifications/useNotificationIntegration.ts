import { useEffect } from 'react';
import { NotificationService, NotificationAction } from '../../services/NotificationService';
import { ApprovalWorkflowEngine } from '../../services/ApprovalWorkflowEngine';
import { useAuth } from '../useAuth';
import { VotingPost } from '../../types';

export const useNotificationIntegration = () => {
  const { currentUser } = useAuth();
  const notificationService = NotificationService.getInstance();
  const workflowEngine = ApprovalWorkflowEngine.getInstance();

  useEffect(() => {
    if (!currentUser) return;

    // 承認ワークフロー通知の設定
    const setupWorkflowNotifications = async () => {
      // 承認待ちステージをチェック
      const pendingApprovals = await checkPendingApprovals(currentUser.id);
      
      pendingApprovals.forEach(async (approval) => {
        const actions: NotificationAction[] = [
          {
            id: 'approve',
            label: '承認',
            type: 'primary',
            action: 'approve'
          },
          {
            id: 'reject',
            label: '却下',
            type: 'danger',
            action: 'reject',
            requiresComment: true
          },
          {
            id: 'view',
            label: '詳細を見る',
            type: 'secondary',
            action: 'view'
          }
        ];

        await notificationService.createActionableNotification(
          currentUser.id,
          'APPROVAL_REQUIRED',
          {
            title: `承認依頼: ${approval.projectName}`,
            message: `${approval.stageName}の承認が必要です`,
            dueDate: approval.dueDate,
            actions,
            metadata: {
              projectId: approval.projectId,
              workflowStage: approval.stageId
            }
          }
        );
      });
    };

    // メンバー選定通知の設定
    const setupMemberSelectionNotifications = async () => {
      const pendingSelections = await checkPendingMemberSelections(currentUser.id);
      
      pendingSelections.forEach(async (selection) => {
        const actions: NotificationAction[] = [
          {
            id: 'participate',
            label: '参加する',
            type: 'primary',
            action: 'participate'
          },
          {
            id: 'decline',
            label: '辞退する',
            type: 'secondary',
            action: 'decline',
            requiresComment: true
          }
        ];

        await notificationService.createActionableNotification(
          currentUser.id,
          'MEMBER_SELECTION',
          {
            title: `メンバー募集: ${selection.projectName}`,
            message: `${selection.role}として参加が求められています`,
            dueDate: selection.deadline,
            actions,
            metadata: {
              projectId: selection.projectId
            }
          }
        );
      });
    };

    // 投票通知の設定
    const setupVotingNotifications = async () => {
      const pendingVotes = await checkPendingVotes(currentUser.id);
      
      pendingVotes.forEach(async (vote) => {
        const actions: NotificationAction[] = [
          {
            id: 'vote',
            label: '投票する',
            type: 'primary',
            action: 'vote'
          }
        ];

        await notificationService.createActionableNotification(
          currentUser.id,
          'VOTE_REQUIRED',
          {
            title: `投票依頼: ${vote.postTitle}`,
            message: `${vote.department}での投票が必要です`,
            dueDate: vote.votingDeadline,
            actions,
            metadata: {
              postId: vote.postId
            }
          }
        );
      });
    };

    // 緊急対応通知の設定
    const setupEmergencyNotifications = async () => {
      const emergencyActions = await checkEmergencyActions(currentUser.id);
      
      emergencyActions.forEach(async (emergency) => {
        const actions: NotificationAction[] = [
          {
            id: 'respond',
            label: '対応する',
            type: 'danger',
            action: 'approve'
          },
          {
            id: 'delegate',
            label: '委任する',
            type: 'secondary',
            action: 'delegate'
          }
        ];

        await notificationService.createActionableNotification(
          currentUser.id,
          'EMERGENCY_ACTION',
          {
            title: `【緊急】${emergency.title}`,
            message: emergency.description,
            dueDate: new Date(Date.now() + emergency.responseTimeMinutes * 60 * 1000),
            actions,
            metadata: {
              urgencyLevel: emergency.level
            }
          }
        );
      });
    };

    // 定期的に通知をチェック
    const checkInterval = setInterval(() => {
      setupWorkflowNotifications();
      setupMemberSelectionNotifications();
      setupVotingNotifications();
      setupEmergencyNotifications();
    }, 60000); // 1分ごと

    // 初回実行
    setupWorkflowNotifications();
    setupMemberSelectionNotifications();
    setupVotingNotifications();
    setupEmergencyNotifications();

    return () => clearInterval(checkInterval);
  }, [currentUser]);

  return { notificationService };
};

// ヘルパー関数（実際の実装では適切なAPIやサービスから取得）
async function checkPendingApprovals(userId: string): Promise<Array<{
  projectId: string;
  projectName: string;
  stageId: string;
  stageName: string;
  dueDate: Date;
}>> {
  // 実装例
  return [];
}

async function checkPendingMemberSelections(userId: string): Promise<Array<{
  projectId: string;
  projectName: string;
  role: string;
  deadline: Date;
}>> {
  // 実装例
  return [];
}

async function checkPendingVotes(userId: string): Promise<Array<{
  postId: string;
  postTitle: string;
  department: string;
  votingDeadline: Date;
}>> {
  // 実装例
  return [];
}

async function checkEmergencyActions(userId: string): Promise<Array<{
  title: string;
  description: string;
  level: number;
  responseTimeMinutes: number;
}>> {
  // 実装例
  return [];
}