/**
 * 議題昇格サービス
 *
 * 管理職が手動で議題レベルを昇格させる処理を提供
 * Phase 5実装
 */

import { PrismaClient } from '@prisma/client';
import { agendaLevelEngine } from '../systems/agenda/engines/AgendaLevelEngine';
import { AgendaLevelNotificationService } from './AgendaLevelNotificationService';

const prisma = new PrismaClient();
const notificationService = AgendaLevelNotificationService.getInstance();

export type AgendaLevel = 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';

export interface EscalationRequest {
  postId: string;
  targetLevel: AgendaLevel;
  deciderId: string; // 昇格を決定した管理職のID
  reason: string; // 昇格理由
}

export interface EscalationResult {
  success: boolean;
  previousLevel: AgendaLevel;
  newLevel: AgendaLevel;
  previousScore: number;
  newScore: number;
  deadlineExtended: boolean;
  newDeadline?: Date;
  notificationsSent: number;
  message: string;
}

/**
 * 議題昇格サービスクラス
 */
export class AgendaEscalationService {
  /**
   * 議題レベルの昇格処理
   */
  async escalateAgenda(request: EscalationRequest): Promise<EscalationResult> {
    console.log(`[AgendaEscalation] 昇格処理開始: ${request.postId} → ${request.targetLevel}`);

    // 1. 投稿とユーザー情報を取得
    const post = await prisma.post.findUnique({
      where: { id: request.postId },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      throw new Error(`投稿が見つかりません: ${request.postId}`);
    }

    const decider = await prisma.user.findUnique({
      where: { id: request.deciderId },
    });

    if (!decider) {
      throw new Error(`決定者が見つかりません: ${request.deciderId}`);
    }

    // 2. 権限チェック
    const permLevel = typeof decider.permissionLevel === 'number' ? decider.permissionLevel : Number(decider.permissionLevel);
    this.validateEscalationPermission(permLevel, request.targetLevel);

    // 3. 現在のレベルを取得
    const currentScore = post.agendaScore || 0;
    const currentLevel = agendaLevelEngine.getAgendaLevel(currentScore);

    console.log(`[AgendaEscalation] 現在: ${currentLevel} (${currentScore}点) → 目標: ${request.targetLevel}`);

    // 4. 昇格可能かチェック（降格は不可）
    if (!this.canEscalateTo(currentLevel, request.targetLevel)) {
      throw new Error(`${currentLevel} から ${request.targetLevel} への昇格はできません`);
    }

    // 5. 新しいスコアを設定（最低スコアを保証）
    const newScore = this.getMinimumScoreForLevel(request.targetLevel);
    const scoreToSet = Math.max(currentScore, newScore);

    // 6. 投票期限を延長
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + 14); // +14日延長

    // 7. トランザクションで更新
    const updatedPost = await prisma.$transaction(async (tx) => {
      // 投稿を更新
      const updated = await tx.post.update({
        where: { id: request.postId },
        data: {
          agendaScore: scoreToSet,
          agendaLevel: request.targetLevel,
          agendaVotingDeadline: newDeadline,
        },
        include: {
          author: true,
          votes: true,
        },
      });

      // 昇格決定の記録を作成（agendaDecisionテーブルがない場合はスキップ）
      // await tx.agendaDecision.create({
      //   data: {
      //     postId: request.postId,
      //     deciderId: request.deciderId,
      //     decisionType: 'escalate',
      //     decision: 'approved',
      //     reason: request.reason,
      //     previousLevel: currentLevel,
      //     newLevel: request.targetLevel,
      //     createdAt: new Date(),
      //   },
      // });

      return updated;
    });

    console.log(`[AgendaEscalation] 投稿更新完了: ${currentLevel} → ${request.targetLevel} (${scoreToSet}点)`);

    // 8. 昇格通知を送信
    const notificationsSent = await this.sendEscalationNotifications(
      updatedPost,
      currentLevel,
      request.targetLevel,
      decider,
      request.reason
    );

    console.log(`[AgendaEscalation] 通知送信完了: ${notificationsSent}件`);

    return {
      success: true,
      previousLevel: currentLevel as AgendaLevel,
      newLevel: request.targetLevel,
      previousScore: currentScore,
      newScore: scoreToSet,
      deadlineExtended: true,
      newDeadline,
      notificationsSent,
      message: `議題レベルを ${currentLevel} から ${request.targetLevel} に昇格しました`,
    };
  }

  /**
   * 昇格権限のチェック
   */
  private validateEscalationPermission(permissionLevel: number, targetLevel: AgendaLevel): void {
    const requiredPermissions: Record<AgendaLevel, number> = {
      'PENDING': 0,
      'DEPT_REVIEW': 3.5,
      'DEPT_AGENDA': 3.5,
      'FACILITY_AGENDA': 7, // 師長
      'CORP_REVIEW': 8, // 副看護部長
      'CORP_AGENDA': 11, // 事務長
    };

    const required = requiredPermissions[targetLevel];
    if (permissionLevel < required) {
      throw new Error(
        `${targetLevel}への昇格には権限レベル${required}以上が必要です（現在: ${permissionLevel}）`
      );
    }
  }

  /**
   * 昇格可能かチェック（降格は不可）
   */
  private canEscalateTo(currentLevel: string, targetLevel: AgendaLevel): boolean {
    const levelOrder = ['PENDING', 'DEPT_REVIEW', 'DEPT_AGENDA', 'FACILITY_AGENDA', 'CORP_REVIEW', 'CORP_AGENDA'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    const targetIndex = levelOrder.indexOf(targetLevel);

    return targetIndex > currentIndex;
  }

  /**
   * 議題レベルに必要な最低スコアを取得
   */
  private getMinimumScoreForLevel(level: AgendaLevel): number {
    const minimumScores: Record<AgendaLevel, number> = {
      'PENDING': 0,
      'DEPT_REVIEW': 30,
      'DEPT_AGENDA': 50,
      'FACILITY_AGENDA': 100,
      'CORP_REVIEW': 300,
      'CORP_AGENDA': 600,
    };

    return minimumScores[level];
  }

  /**
   * 昇格通知の送信
   */
  private async sendEscalationNotifications(
    post: any,
    previousLevel: string,
    newLevel: AgendaLevel,
    decider: any,
    reason: string
  ): Promise<number> {
    let totalNotifications = 0;

    // 投稿者に通知（通知システムは未実装のためスキップ）
    console.log(`[AgendaEscalation] 通知送信予定: ${post.authorId} に ${previousLevel} → ${newLevel} の昇格通知`);
    // totalNotifications++;

    // レベルに応じた通知を送信
    if (newLevel === 'FACILITY_AGENDA') {
      // 施設内全員に通知
      totalNotifications += await notificationService.notifyScoreThreshold100(post);
    } else if (newLevel === 'CORP_REVIEW') {
      // 法人検討レベル: 事務長 + 施設内全員
      totalNotifications += await notificationService.notifyScoreThreshold300(post);
    } else if (newLevel === 'CORP_AGENDA') {
      // 法人議題レベル: 法人統括事務局長 + 法人内全員
      totalNotifications += await notificationService.notifyScoreThreshold600(post);
    }

    return totalNotifications;
  }

  /**
   * 昇格可能な次のレベルを取得
   */
  getNextAvailableLevels(currentScore: number, userPermissionLevel: number): AgendaLevel[] {
    const currentLevel = agendaLevelEngine.getAgendaLevel(currentScore);
    const allLevels: AgendaLevel[] = ['FACILITY_AGENDA', 'CORP_REVIEW', 'CORP_AGENDA'];

    return allLevels.filter(level => {
      // 現在のレベルより上位であること
      if (!this.canEscalateTo(currentLevel, level)) {
        return false;
      }

      // 権限があること
      const requiredPermissions: Record<AgendaLevel, number> = {
        'PENDING': 0,
        'DEPT_REVIEW': 3.5,
        'DEPT_AGENDA': 3.5,
        'FACILITY_AGENDA': 7,
        'CORP_REVIEW': 8,
        'CORP_AGENDA': 11,
      };

      return userPermissionLevel >= requiredPermissions[level];
    });
  }
}

export default new AgendaEscalationService();
