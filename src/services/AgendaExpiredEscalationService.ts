/**
 * 議題昇格後の期限到達・未達成処理サービス
 * Phase 6実装
 *
 * 原則:
 * - 投票期限時のスコアで判断（途中での介入はしない）
 * - 昇格後に目標スコアに達しなかった提案のみ処理
 * - 投票を尊重した上での管理職判断
 */

import { PrismaClient } from '@prisma/client';
import { AgendaLevel } from '../types/committee';
import { agendaLevelEngine } from '../systems/agenda/engines/AgendaLevelEngine';
import { AgendaLevelNotificationService } from './AgendaLevelNotificationService';

const prisma = new PrismaClient();
const notificationService = AgendaLevelNotificationService.getInstance();

export type ExpiredEscalationDecision =
  | 'approve_at_current_level'  // 現在のレベルで議題化承認
  | 'downgrade'                   // 1レベル下にダウングレード
  | 'reject';                     // 不採用

export interface ExpiredEscalationRequest {
  postId: string;
  decision: ExpiredEscalationDecision;
  deciderId: string;
  reason: string;
}

export interface ExpiredEscalationResult {
  success: boolean;
  decision: ExpiredEscalationDecision;
  currentLevel: AgendaLevel;
  newLevel?: AgendaLevel;
  finalScore: number;
  targetScore: number;
  message: string;
}

export interface ExpiredEscalation {
  post: any;
  currentScore: number;
  targetScore: number;
  achievementRate: number; // 到達率（%）
  daysOverdue: number;      // 期限超過日数
}

export class AgendaExpiredEscalationService {
  /**
   * 期限到達済み・未達成の昇格提案を検出
   */
  async detectExpiredEscalations(): Promise<ExpiredEscalation[]> {
    const now = new Date();

    // 期限到達済みの昇格提案を取得
    const posts = await prisma.post.findMany({
      where: {
        type: 'proposal',
        status: 'active',
        agendaVotingDeadline: {
          lte: now, // 期限到達
        },
        agendaStatus: {
          in: [
            'escalated_to_facility',      // 施設に昇格済み
            'escalated_to_corp_review',   // 法人検討に昇格済み
            'escalated_to_corp_agenda',   // 法人議題に昇格済み
          ],
        },
      },
      include: {
        author: true,
        votes: true,
      },
    });

    const expiredEscalations: ExpiredEscalation[] = [];

    for (const post of posts) {
      const currentScore = post.agendaScore || 0;
      const currentLevel = post.agendaLevel as AgendaLevel;
      const targetScore = this.getTargetScoreForLevel(currentLevel);

      // 目標スコア未達成の場合のみ
      if (currentScore < targetScore) {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(post.agendaVotingDeadline!).getTime()) / (1000 * 60 * 60 * 24)
        );

        expiredEscalations.push({
          post,
          currentScore,
          targetScore,
          achievementRate: Math.round((currentScore / targetScore) * 100),
          daysOverdue,
        });
      }
    }

    return expiredEscalations;
  }

  /**
   * 期限到達・未達成の判断処理
   */
  async processExpiredEscalation(
    request: ExpiredEscalationRequest
  ): Promise<ExpiredEscalationResult> {
    const { postId, decision, deciderId, reason } = request;

    console.log(`[ExpiredEscalation] 処理開始: postId=${postId}, decision=${decision}`);

    // 1. 投稿とユーザー情報を取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      throw new Error(`投稿が見つかりません: ${postId}`);
    }

    const decider = await prisma.user.findUnique({
      where: { id: deciderId },
    });

    if (!decider) {
      throw new Error(`決定者が見つかりません: ${deciderId}`);
    }

    // 2. 期限到達・未達成をチェック
    const now = new Date();
    const deadline = post.agendaVotingDeadline;

    if (!deadline || deadline > now) {
      throw new Error('投票期限がまだ到達していません');
    }

    const currentLevel = post.agendaLevel as AgendaLevel;
    const currentScore = post.agendaScore || 0;
    const targetScore = this.getTargetScoreForLevel(currentLevel);

    if (currentScore >= targetScore) {
      throw new Error('目標スコアに到達しています');
    }

    // 3. 権限チェック
    this.validateDecisionPermission(decider, currentLevel);

    // 4. 判断処理
    let result: ExpiredEscalationResult;

    switch (decision) {
      case 'approve_at_current_level':
        result = await this.approveAtCurrentLevel(post, decider, reason, currentScore, targetScore);
        break;

      case 'downgrade':
        result = await this.downgradeToLowerLevel(post, decider, reason, currentScore, targetScore);
        break;

      case 'reject':
        result = await this.rejectProposal(post, decider, reason, currentScore, targetScore);
        break;

      default:
        throw new Error(`無効な判断: ${decision}`);
    }

    console.log(`[ExpiredEscalation] 処理完了: ${decision}`);

    return result;
  }

  /**
   * 現在のレベルで議題化承認
   */
  private async approveAtCurrentLevel(
    post: any,
    decider: any,
    reason: string,
    currentScore: number,
    targetScore: number
  ): Promise<ExpiredEscalationResult> {
    const currentLevel = post.agendaLevel as AgendaLevel;
    const statusMap: Record<string, string> = {
      'FACILITY_AGENDA': 'approved_for_committee',
      'CORP_REVIEW': 'approved_as_corp_agenda',
      'CORP_AGENDA': 'approved_for_corp_meeting',
    };

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: statusMap[currentLevel] || 'approved_as_dept_agenda',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        status: 'closed', // 投票終了
      },
    });

    // 通知送信
    await this.sendDecisionNotifications(post, decider, 'approve', currentLevel, reason);

    return {
      success: true,
      decision: 'approve_at_current_level',
      currentLevel,
      finalScore: currentScore,
      targetScore,
      message: `${currentLevel}として議題化承認されました（スコア: ${currentScore}/${targetScore}点）`,
    };
  }

  /**
   * 1レベル下にダウングレード
   */
  private async downgradeToLowerLevel(
    post: any,
    decider: any,
    reason: string,
    currentScore: number,
    targetScore: number
  ): Promise<ExpiredEscalationResult> {
    const currentLevel = post.agendaLevel as AgendaLevel;
    const lowerLevel = this.getLowerLevel(currentLevel);

    if (!lowerLevel) {
      throw new Error(`${currentLevel}より下のレベルがありません`);
    }

    const statusMap: Record<string, string> = {
      'DEPT_AGENDA': 'approved_as_dept_agenda',
      'FACILITY_AGENDA': 'approved_for_committee',
      'CORP_REVIEW': 'approved_as_corp_agenda',
    };

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaLevel: lowerLevel,
        agendaStatus: statusMap[lowerLevel] || 'approved_as_dept_agenda',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        status: 'closed', // 投票終了
      },
    });

    // 通知送信
    await this.sendDecisionNotifications(post, decider, 'downgrade', lowerLevel, reason);

    return {
      success: true,
      decision: 'downgrade',
      currentLevel,
      newLevel: lowerLevel,
      finalScore: currentScore,
      targetScore,
      message: `${lowerLevel}にダウングレードして議題化されました`,
    };
  }

  /**
   * 不採用
   */
  private async rejectProposal(
    post: any,
    decider: any,
    reason: string,
    currentScore: number,
    targetScore: number
  ): Promise<ExpiredEscalationResult> {
    const currentLevel = post.agendaLevel as AgendaLevel;

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'archived',
        agendaStatus: 'rejected_by_manager',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
      },
    });

    // 通知送信
    await this.sendDecisionNotifications(post, decider, 'reject', currentLevel, reason);

    return {
      success: true,
      decision: 'reject',
      currentLevel,
      finalScore: currentScore,
      targetScore,
      message: `不採用として処理されました`,
    };
  }

  /**
   * 議題レベルの目標スコアを取得
   */
  private getTargetScoreForLevel(level: AgendaLevel): number {
    const scoreMap: Record<AgendaLevel, number> = {
      'PENDING': 0,
      'DEPT_REVIEW': 30,
      'DEPT_AGENDA': 50,
      'FACILITY_AGENDA': 100,
      'CORP_REVIEW': 300,
      'CORP_AGENDA': 600,
    };

    return scoreMap[level] || 0;
  }

  /**
   * 1レベル下を取得
   */
  private getLowerLevel(currentLevel: AgendaLevel): AgendaLevel | null {
    const levelOrder: AgendaLevel[] = [
      'PENDING',
      'DEPT_REVIEW',
      'DEPT_AGENDA',
      'FACILITY_AGENDA',
      'CORP_REVIEW',
      'CORP_AGENDA',
    ];

    const currentIndex = levelOrder.indexOf(currentLevel);

    if (currentIndex > 0) {
      return levelOrder[currentIndex - 1];
    }

    return null;
  }

  /**
   * 権限チェック
   */
  private validateDecisionPermission(decider: any, agendaLevel: AgendaLevel): void {
    const permissionLevel = typeof decider.permissionLevel === 'number'
      ? decider.permissionLevel
      : Number(decider.permissionLevel);

    const requiredLevels: Record<AgendaLevel, number> = {
      'PENDING': 5,
      'DEPT_REVIEW': 6,
      'DEPT_AGENDA': 7,
      'FACILITY_AGENDA': 8,
      'CORP_REVIEW': 11,
      'CORP_AGENDA': 18,
    };

    const requiredLevel = requiredLevels[agendaLevel];

    if (permissionLevel < requiredLevel) {
      throw new Error(
        `権限がありません。レベル${requiredLevel}以上が必要です（現在: ${permissionLevel}）`
      );
    }
  }

  /**
   * 判断通知を送信
   */
  private async sendDecisionNotifications(
    post: any,
    decider: any,
    decision: 'approve' | 'downgrade' | 'reject',
    resultLevel: AgendaLevel,
    reason: string
  ): Promise<void> {
    const decisionMessages: Record<string, string> = {
      'approve': `${resultLevel}として議題化承認されました`,
      'downgrade': `${resultLevel}にダウングレードして議題化されました`,
      'reject': '不採用となりました',
    };

    // 投稿者に通知
    console.log(`[ExpiredEscalation] 通知送信: ${post.authorId} に ${decision}`);

    // TODO: 実際の通知送信（通知システムが完成したら実装）
    // await notificationService.sendSimpleNotification({
    //   userId: post.authorId,
    //   title: `📋 期限到達提案の判断結果`,
    //   message: `あなたの提案「${post.content.substring(0, 30)}...」が判断されました。\n\n結果: ${decisionMessages[decision]}\n\n理由: ${reason}`,
    //   urgency: 'normal',
    //   postId: post.id,
    // });
  }

  /**
   * 期限到達・未達成を管理職に通知
   */
  async notifyExpiredEscalations(expiredEscalations: ExpiredEscalation[]): Promise<number> {
    let notificationCount = 0;

    for (const { post, currentScore, targetScore, achievementRate } of expiredEscalations) {
      const responsibleManager = await this.getResponsibleManager(post);

      if (responsibleManager) {
        console.log(`[ExpiredEscalation] 通知送信: ${responsibleManager.id} に期限到達通知`);

        // TODO: 実際の通知送信
        // await notificationService.sendSimpleNotification({
        //   userId: responsibleManager.id,
        //   title: '🔔 昇格提案の判断が必要です',
        //   message: `昇格させた提案が投票期限に到達しましたが、目標スコアに達していません。\n\n提案: ${post.content.substring(0, 50)}...\n現在のスコア: ${currentScore}点\n目標スコア: ${targetScore}点\n到達率: ${achievementRate}%\n\n判断してください。`,
        //   urgency: 'high',
        //   postId: post.id,
        //   actionUrl: `/proposal-management/expired-escalations`,
        //   actionRequired: true,
        // });

        notificationCount++;
      }
    }

    return notificationCount;
  }

  /**
   * 責任者を取得
   */
  private async getResponsibleManager(post: any): Promise<any | null> {
    const currentLevel = post.agendaLevel as AgendaLevel;

    const levelToPermission: Record<AgendaLevel, number> = {
      'PENDING': 5,
      'DEPT_REVIEW': 6,
      'DEPT_AGENDA': 7,
      'FACILITY_AGENDA': 8,
      'CORP_REVIEW': 11,
      'CORP_AGENDA': 18,
    };

    const requiredLevel = levelToPermission[currentLevel];

    // 昇格させた人（agendaDecisionBy）を取得
    if (post.agendaDecisionBy) {
      const decider = await prisma.user.findUnique({
        where: { id: post.agendaDecisionBy },
      });

      if (decider) {
        return decider;
      }
    }

    // 見つからない場合は、該当レベルの管理職を取得
    const managers = await prisma.user.findMany({
      where: {
        permissionLevel: {
          gte: requiredLevel,
        },
        isRetired: false,
      },
      orderBy: {
        permissionLevel: 'asc',
      },
      take: 1,
    });

    return managers[0] || null;
  }
}

export const agendaExpiredEscalationService = new AgendaExpiredEscalationService();
