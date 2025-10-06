/**
 * 議題モード委員会操作フック
 *
 * 委員会関連イベントと通知発火を統合
 */

import { useState, useCallback } from 'react';
import { Post, User } from '../types';
import { agendaNotificationIntegration } from '../systems/agenda/services/AgendaNotificationIntegration';

export interface CommitteeSubmission {
  postId: string;
  committeeType: 'facility' | 'corporation';
  documentId: string;
  submittedBy: string;
  submittedAt: Date;
}

export interface CommitteeDecision {
  postId: string;
  committeeType: string;
  decision: 'approved' | 'on_hold' | 'rejected';
  details: string;
  decidedBy: string;
  decidedAt: Date;
}

export function useAgendaCommittee(allUsers: User[] = []) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 委員会への提出
   */
  const submitToCommittee = useCallback(async (
    post: Post,
    committeeType: 'facility' | 'corporation',
    documentId: string,
    currentUser: User
  ): Promise<void> => {
    setIsSubmitting(true);

    try {
      console.log('📝 [AgendaCommittee] Submitting to committee:', {
        postId: post.id,
        postTitle: post.title,
        committeeType,
        documentId
      });

      // 実際の実装では、ここでバックエンドAPIを呼び出し
      // await committeeAPI.submitProposal({ postId, committeeType, documentId });

      // 委員会提出通知を発火
      await agendaNotificationIntegration.notifyCommitteeSubmission(
        post,
        committeeType,
        allUsers
      );

      console.log('✅ [AgendaCommittee] Submission successful');

    } catch (error) {
      console.error('委員会提出エラー:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [allUsers]);

  /**
   * 委員会審議開始
   */
  const startCommitteeReview = useCallback(async (
    post: Post,
    committeeType: string,
    reviewDate: string
  ): Promise<void> => {
    setIsProcessing(true);

    try {
      console.log('👁️ [AgendaCommittee] Starting committee review:', {
        postId: post.id,
        committeeType,
        reviewDate
      });

      // 実際の実装では、ここでバックエンドAPIを呼び出し
      // await committeeAPI.startReview({ postId, committeeType, reviewDate });

      // 審議開始通知を発火
      await agendaNotificationIntegration.notifyCommitteeReviewStarted(
        post,
        committeeType,
        reviewDate,
        allUsers
      );

      console.log('✅ [AgendaCommittee] Review started');

    } catch (error) {
      console.error('委員会審議開始エラー:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [allUsers]);

  /**
   * 委員会決定
   */
  const recordCommitteeDecision = useCallback(async (
    post: Post,
    decision: CommitteeDecision
  ): Promise<void> => {
    setIsProcessing(true);

    try {
      console.log('✅ [AgendaCommittee] Recording committee decision:', {
        postId: post.id,
        decision: decision.decision,
        committeeType: decision.committeeType
      });

      // 実際の実装では、ここでバックエンドAPIを呼び出し
      // await committeeAPI.recordDecision(decision);

      // 委員会決定通知を発火
      await agendaNotificationIntegration.notifyCommitteeDecision(
        post,
        decision.committeeType,
        decision.decision,
        decision.details,
        allUsers
      );

      console.log('✅ [AgendaCommittee] Decision recorded');

    } catch (error) {
      console.error('委員会決定記録エラー:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [allUsers]);

  /**
   * デモ用：通知をテスト
   */
  const testNotifications = useCallback(async (
    post: Post
  ): Promise<void> => {
    console.log('🧪 [AgendaCommittee] Testing notifications...');

    // 1. 提出通知
    await agendaNotificationIntegration.notifyCommitteeSubmission(
      post,
      'facility',
      allUsers
    );

    // 2秒待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. 審議開始通知
    await agendaNotificationIntegration.notifyCommitteeReviewStarted(
      post,
      '施設運営委員会',
      new Date().toLocaleDateString('ja-JP'),
      allUsers
    );

    // 2秒待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 承認通知
    await agendaNotificationIntegration.notifyCommitteeDecision(
      post,
      '施設運営委員会',
      'approved',
      '提案内容が承認されました。予算配分を行い、実施に移ります。',
      allUsers
    );

    console.log('✅ [AgendaCommittee] Test notifications completed');
  }, [allUsers]);

  return {
    submitToCommittee,
    startCommitteeReview,
    recordCommitteeDecision,
    testNotifications,
    isSubmitting,
    isProcessing
  };
}
