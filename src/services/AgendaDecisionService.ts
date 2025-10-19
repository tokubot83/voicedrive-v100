/**
 * AgendaDecisionService
 *
 * 議題モードの判断処理を管理するサービス
 * - 各レベル（主任、師長、副看護部長、事務長、法人統括事務局長）の承認/却下処理
 * - 昇格処理
 * - 救済フロー処理
 * - 通知送信
 */

import { prisma } from '../lib/prisma.js';
import { AgendaLevelNotificationService } from './AgendaLevelNotificationService.js';

export type AgendaDecisionType =
  // Level 3.5 (主任)
  | 'recommend_to_manager'
  | 'reject_by_supervisor'

  // Level 7 (師長)
  | 'approve_as_dept_agenda'
  | 'escalate_to_facility'
  | 'reject_by_manager'
  | 'rescue_as_dept_agenda'      // 救済フロー
  | 'complete_rejection'          // 完全却下

  // Level 8 (副看護部長/看護部長)
  | 'approve_for_committee'
  | 'escalate_to_corp_review'
  | 'reject_by_deputy_director'

  // Level 11 (事務長)
  | 'approve_as_corp_agenda'
  | 'escalate_to_corp_agenda'
  | 'reject_by_general_affairs'
  | 'rescue_as_facility_agenda'  // 救済フロー

  // Level 18 (法人統括事務局長)
  | 'approve_for_corp_meeting'
  | 'reject_by_general_affairs_director';

export type AgendaStatus =
  // 基本ステータス
  | 'pending'

  // Level 3.5 (主任) 判断後
  | 'pending_supervisor_review'
  | 'recommended_to_manager'
  | 'rejected_by_supervisor'

  // Level 7 (師長) 判断後
  | 'approved_as_dept_agenda'
  | 'escalated_to_facility'
  | 'rejected_by_manager'

  // Level 8 (副看護部長) 判断後
  | 'pending_deputy_director_review'
  | 'approved_for_committee'
  | 'escalated_to_corp_review'
  | 'rejected_by_deputy_director'
  | 'pending_rescue_by_manager'     // 救済待ち

  // Level 11 (事務長) 判断後
  | 'pending_general_affairs_review'
  | 'approved_as_corp_agenda'
  | 'escalated_to_corp_agenda'
  | 'rejected_by_general_affairs'
  | 'pending_rescue_by_deputy_director' // 救済待ち

  // Level 18 (法人統括事務局長) 判断後
  | 'pending_general_affairs_director_review'
  | 'approved_for_corp_meeting'
  | 'rejected_by_general_affairs_director';

export interface AgendaDecisionInput {
  postId: string;
  decisionType: AgendaDecisionType;
  deciderId: string;
  reason: string;
  committeeId?: string; // Level 8承認時の委員会選択
}

export interface AgendaDecisionResult {
  success: boolean;
  post: any;
  message: string;
  notificationsSent: number;
}

export class AgendaDecisionService {
  private notificationService: AgendaLevelNotificationService;

  constructor() {
    this.notificationService = AgendaLevelNotificationService.getInstance();
  }

  /**
   * 判断を実行
   */
  async executeDecision(input: AgendaDecisionInput): Promise<AgendaDecisionResult> {
    const { postId, decisionType, deciderId, reason, committeeId } = input;

    // 投稿を取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
      },
    });

    if (!post) {
      return {
        success: false,
        post: null,
        message: '投稿が見つかりません',
        notificationsSent: 0,
      };
    }

    // 判断者を取得
    const decider = await prisma.user.findUnique({
      where: { id: deciderId },
    });

    if (!decider) {
      return {
        success: false,
        post: null,
        message: '判断者が見つかりません',
        notificationsSent: 0,
      };
    }

    // 判断タイプに応じて処理を分岐
    switch (decisionType) {
      case 'recommend_to_manager':
        return await this.handleRecommendToManager(post, decider, reason);

      case 'reject_by_supervisor':
        return await this.handleRejectBySupervisor(post, decider, reason);

      case 'approve_as_dept_agenda':
        return await this.handleApproveAsDeptAgenda(post, decider, reason);

      case 'escalate_to_facility':
        return await this.handleEscalateToFacility(post, decider, reason);

      case 'reject_by_manager':
        return await this.handleRejectByManager(post, decider, reason);

      case 'rescue_as_dept_agenda':
        return await this.handleRescueAsDeptAgenda(post, decider, reason);

      case 'complete_rejection':
        return await this.handleCompleteRejection(post, decider, reason);

      case 'approve_for_committee':
        return await this.handleApproveForCommittee(post, decider, reason, committeeId);

      case 'escalate_to_corp_review':
        return await this.handleEscalateToCorpReview(post, decider, reason);

      case 'reject_by_deputy_director':
        return await this.handleRejectByDeputyDirector(post, decider, reason);

      case 'approve_as_corp_agenda':
        return await this.handleApproveAsCorpAgenda(post, decider, reason);

      case 'escalate_to_corp_agenda':
        return await this.handleEscalateToCorpAgenda(post, decider, reason);

      case 'reject_by_general_affairs':
        return await this.handleRejectByGeneralAffairs(post, decider, reason);

      case 'rescue_as_facility_agenda':
        return await this.handleRescueAsFacilityAgenda(post, decider, reason);

      case 'approve_for_corp_meeting':
        return await this.handleApproveForCorpMeeting(post, decider, reason);

      case 'reject_by_general_affairs_director':
        return await this.handleRejectByGeneralAffairsDirector(post, decider, reason);

      default:
        return {
          success: false,
          post: null,
          message: '不明な判断タイプです',
          notificationsSent: 0,
        };
    }
  }

  // ======================================================================
  // Level 3.5 (主任) の処理
  // ======================================================================

  /**
   * 師長に推薦
   */
  private async handleRecommendToManager(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'recommended_to_manager',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
      },
      include: {
        author: true,
      },
    });

    // 通知送信
    const notificationsSent = await this.notificationService.notifySupervisorRecommendation(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '師長への推薦が完了しました',
      notificationsSent,
    };
  }

  /**
   * 主任による却下
   */
  private async handleRejectBySupervisor(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'rejected_by_supervisor',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        status: 'rejected', // 投稿自体も却下状態に
      },
      include: {
        author: true,
      },
    });

    // 通知送信
    const notificationsSent = await this.notificationService.notifySupervisorRejection(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '却下が完了しました',
      notificationsSent,
    };
  }

  // ======================================================================
  // Level 7 (師長) の処理
  // ======================================================================

  /**
   * 部署議題承認
   */
  private async handleApproveAsDeptAgenda(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'approved_as_dept_agenda',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'DEPT_AGENDA', // 部署議題レベル確定
      },
      include: {
        author: true,
      },
    });

    // 通知送信（部署内全員）
    const notificationsSent = await this.notificationService.notifyDeptAgendaApproval(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '部署議題として承認されました',
      notificationsSent,
    };
  }

  /**
   * 施設議題に昇格
   */
  private async handleEscalateToFacility(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    // 投票期限を延長
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + 60); // 施設議題は60日

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'escalated_to_facility',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'FACILITY_AGENDA', // 施設議題レベルに昇格
        agendaVotingDeadline: newDeadline,
      },
      include: {
        author: true,
      },
    });

    // 通知送信（施設内全職員）
    const notificationsSent = await this.notificationService.notifyFacilityEscalation(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '施設議題に昇格しました',
      notificationsSent,
    };
  }

  /**
   * 師長による却下
   */
  private async handleRejectByManager(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'rejected_by_manager',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        status: 'rejected',
      },
      include: {
        author: true,
      },
    });

    // 通知送信（部署内＋施設内全職員）
    const notificationsSent = await this.notificationService.notifyManagerRejection(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '却下が完了しました',
      notificationsSent,
    };
  }

  /**
   * 救済フロー: 部署議題として承認（Level 8却下後）
   */
  private async handleRescueAsDeptAgenda(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'approved_as_dept_agenda',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'DEPT_AGENDA',
        agendaRescueLevel: 7, // 師長による救済
      },
      include: {
        author: true,
      },
    });

    // 通知送信（部署内全員）
    const notificationsSent = await this.notificationService.notifyDeptAgendaRescue(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '部署議題として承認されました（救済）',
      notificationsSent,
    };
  }

  /**
   * 完全却下（救済も拒否）
   */
  private async handleCompleteRejection(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'rejected_by_manager',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        status: 'rejected',
      },
      include: {
        author: true,
      },
    });

    // 通知送信
    const notificationsSent = await this.notificationService.notifyCompleteRejection(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '完全却下が完了しました',
      notificationsSent,
    };
  }

  // ======================================================================
  // Level 8 (副看護部長/看護部長) の処理
  // ======================================================================

  /**
   * 委員会提出承認
   */
  private async handleApproveForCommittee(
    post: any,
    decider: any,
    reason: string,
    committeeId?: string
  ): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'approved_for_committee',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'FACILITY_AGENDA',
      },
      include: {
        author: true,
      },
    });

    // 委員会議題として登録（必要に応じて実装）
    // if (committeeId) {
    //   await this.createCommitteeAgenda(updatedPost, committeeId);
    // }

    // 通知送信（施設内全職員）
    const notificationsSent = await this.notificationService.notifyCommitteeApproval(
      updatedPost,
      decider,
      reason,
      committeeId
    );

    return {
      success: true,
      post: updatedPost,
      message: '委員会提出が承認されました',
      notificationsSent,
    };
  }

  /**
   * 法人検討に昇格（300点目標）
   */
  private async handleEscalateToCorpReview(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    // 投票期限を延長
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + 90); // 法人検討は90日

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'escalated_to_corp_review',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'CORP_REVIEW',
        agendaVotingDeadline: newDeadline,
      },
      include: {
        author: true,
      },
    });

    // 通知送信（施設内全職員）
    const notificationsSent = await this.notificationService.notifyCorpReviewEscalation(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '法人検討に昇格しました',
      notificationsSent,
    };
  }

  /**
   * 副看護部長/看護部長による却下
   */
  private async handleRejectByDeputyDirector(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'pending_rescue_by_manager', // 救済待ち
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
      },
      include: {
        author: true,
      },
    });

    // 通知送信（師長に救済オプションを提示）
    const notificationsSent = await this.notificationService.notifyDeputyDirectorRejection(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '却下されました。師長による救済待ちです',
      notificationsSent,
    };
  }

  // ======================================================================
  // Level 11 (事務長) の処理
  // ======================================================================

  /**
   * 法人議題承認
   */
  private async handleApproveAsCorpAgenda(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'approved_as_corp_agenda',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'CORP_AGENDA',
      },
      include: {
        author: true,
      },
    });

    // 通知送信（施設内全職員）
    const notificationsSent = await this.notificationService.notifyCorpAgendaApproval(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '法人議題として承認されました',
      notificationsSent,
    };
  }

  /**
   * 法人議題に昇格（600点目標）
   */
  private async handleEscalateToCorpAgenda(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    // 投票期限を延長
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + 120); // 法人議題は120日

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'escalated_to_corp_agenda',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'CORP_AGENDA',
        agendaVotingDeadline: newDeadline,
      },
      include: {
        author: true,
      },
    });

    // 通知送信（施設内全職員）
    const notificationsSent = await this.notificationService.notifyCorpAgendaEscalation(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '法人議題に昇格しました',
      notificationsSent,
    };
  }

  /**
   * 事務長による却下
   */
  private async handleRejectByGeneralAffairs(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'pending_rescue_by_deputy_director', // 救済待ち
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
      },
      include: {
        author: true,
      },
    });

    // 通知送信（副看護部長に救済オプションを提示）
    const notificationsSent = await this.notificationService.notifyGeneralAffairsRejection(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '却下されました。副看護部長による救済待ちです',
      notificationsSent,
    };
  }

  /**
   * 救済フロー: 施設議題として承認（Level 18却下後）
   */
  private async handleRescueAsFacilityAgenda(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'approved_for_committee',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'FACILITY_AGENDA',
        agendaRescueLevel: 11, // 事務長による救済
      },
      include: {
        author: true,
      },
    });

    // 通知送信（施設内全職員）
    const notificationsSent = await this.notificationService.notifyFacilityAgendaRescue(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '施設議題として承認されました（救済）',
      notificationsSent,
    };
  }

  // ======================================================================
  // Level 18 (法人統括事務局長) の処理
  // ======================================================================

  /**
   * 法人運営会議提出承認
   */
  private async handleApproveForCorpMeeting(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'approved_for_corp_meeting',
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaLevel: 'CORP_AGENDA',
      },
      include: {
        author: true,
      },
    });

    // 通知送信（法人内全職員）
    const notificationsSent = await this.notificationService.notifyCorpMeetingApproval(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '法人運営会議への提出が承認されました',
      notificationsSent,
    };
  }

  /**
   * 法人統括事務局長による却下
   */
  private async handleRejectByGeneralAffairsDirector(post: any, decider: any, reason: string): Promise<AgendaDecisionResult> {
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'pending_rescue_by_deputy_director', // 事務長による救済待ち
        agendaDecisionBy: decider.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
      },
      include: {
        author: true,
      },
    });

    // 通知送信（事務長に救済オプションを提示）
    const notificationsSent = await this.notificationService.notifyGeneralAffairsDirectorRejection(
      updatedPost,
      decider,
      reason
    );

    return {
      success: true,
      post: updatedPost,
      message: '却下されました。事務長による救済待ちです',
      notificationsSent,
    };
  }
}
