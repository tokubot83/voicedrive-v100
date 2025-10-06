/**
 * 委員会提出フローサービス
 * Level 7+ が準備した議題提案書を Level 8+ が委員会に提出
 */

import { User } from '../types';
import { ProposalDocument, ProposalDocumentStatus } from '../types/proposalDocument';
import { proposalDocumentGenerator } from './ProposalDocumentGenerator';
import { proposalAuditService } from './ProposalAuditService';

/**
 * 委員会提出リクエスト
 */
export interface SubmissionRequest {
  id: string;
  documentId: string;
  document: ProposalDocument;
  requestedBy: User;
  requestedDate: Date;
  targetCommittee: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: User;
  reviewedDate?: Date;
  reviewNotes?: string;
}

export class CommitteeSubmissionService {
  private static instance: CommitteeSubmissionService;
  private submissionRequests: Map<string, SubmissionRequest> = new Map();

  private constructor() {}

  public static getInstance(): CommitteeSubmissionService {
    if (!CommitteeSubmissionService.instance) {
      CommitteeSubmissionService.instance = new CommitteeSubmissionService();
    }
    return CommitteeSubmissionService.instance;
  }

  /**
   * 委員会提出リクエストを作成（Level 7+）
   */
  public createSubmissionRequest(
    documentId: string,
    targetCommittee: string,
    requestedBy: User
  ): SubmissionRequest | undefined {
    const document = proposalDocumentGenerator.getDocument(documentId);
    if (!document) {
      console.error('議題提案書が見つかりません:', documentId);
      return undefined;
    }

    // Level 7+ のみ提出リクエスト可能
    if (!requestedBy.permissionLevel || requestedBy.permissionLevel < 7) {
      console.error('提出リクエストには Level 7 以上の権限が必要です');
      return undefined;
    }

    // ドキュメントのステータスを確認
    if (document.status !== 'ready') {
      console.error('議題提案書が提出準備完了状態ではありません');
      return undefined;
    }

    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: SubmissionRequest = {
      id: requestId,
      documentId,
      document,
      requestedBy,
      requestedDate: new Date(),
      targetCommittee,
      status: 'pending'
    };

    this.submissionRequests.set(requestId, request);

    console.log(`[CommitteeSubmission] 提出リクエスト作成:`, {
      requestId,
      documentTitle: document.title,
      requestedBy: requestedBy.name,
      targetCommittee
    });

    return request;
  }

  /**
   * 提出リクエストを承認（Level 8+）
   */
  public approveSubmissionRequest(
    requestId: string,
    approver: User,
    notes?: string
  ): SubmissionRequest | undefined {
    const request = this.submissionRequests.get(requestId);
    if (!request) {
      console.error('提出リクエストが見つかりません:', requestId);
      return undefined;
    }

    // Level 8+ のみ承認可能
    if (!approver.permissionLevel || approver.permissionLevel < 8) {
      console.error('提出承認には Level 8 以上の権限が必要です');
      return undefined;
    }

    // リクエストを承認
    request.status = 'approved';
    request.reviewedBy = approver;
    request.reviewedDate = new Date();
    request.reviewNotes = notes;

    // 議題提案書を委員会に提出
    proposalDocumentGenerator.submitToCommittee(
      request.documentId,
      request.targetCommittee,
      approver
    );

    console.log(`[CommitteeSubmission] 提出リクエスト承認:`, {
      requestId,
      approver: approver.name,
      targetCommittee: request.targetCommittee
    });

    return request;
  }

  /**
   * 提出リクエストを却下（Level 8+）
   */
  public rejectSubmissionRequest(
    requestId: string,
    reviewer: User,
    reason: string
  ): SubmissionRequest | undefined {
    const request = this.submissionRequests.get(requestId);
    if (!request) {
      console.error('提出リクエストが見つかりません:', requestId);
      return undefined;
    }

    // Level 8+ のみ却下可能
    if (!reviewer.permissionLevel || reviewer.permissionLevel < 8) {
      console.error('提出却下には Level 8 以上の権限が必要です');
      return undefined;
    }

    // リクエストを却下
    request.status = 'rejected';
    request.reviewedBy = reviewer;
    request.reviewedDate = new Date();
    request.reviewNotes = reason;

    console.log(`[CommitteeSubmission] 提出リクエスト却下:`, {
      requestId,
      reviewer: reviewer.name,
      reason
    });

    return request;
  }

  /**
   * ユーザーが作成した提出リクエストを取得
   */
  public getRequestsByUser(userId: string): SubmissionRequest[] {
    return Array.from(this.submissionRequests.values())
      .filter(req => req.requestedBy.id === userId)
      .sort((a, b) => b.requestedDate.getTime() - a.requestedDate.getTime());
  }

  /**
   * レビュー待ちの提出リクエストを取得（Level 8+用）
   */
  public getPendingRequests(): SubmissionRequest[] {
    return Array.from(this.submissionRequests.values())
      .filter(req => req.status === 'pending')
      .sort((a, b) => b.requestedDate.getTime() - a.requestedDate.getTime());
  }

  /**
   * 委員会別の提出リクエストを取得
   */
  public getRequestsByCommittee(targetCommittee: string): SubmissionRequest[] {
    return Array.from(this.submissionRequests.values())
      .filter(req => req.targetCommittee === targetCommittee)
      .sort((a, b) => b.requestedDate.getTime() - a.requestedDate.getTime());
  }

  /**
   * 特定の提出リクエストを取得
   */
  public getRequest(requestId: string): SubmissionRequest | undefined {
    return this.submissionRequests.get(requestId);
  }

  /**
   * 全提出リクエストを取得
   */
  public getAllRequests(): SubmissionRequest[] {
    return Array.from(this.submissionRequests.values())
      .sort((a, b) => b.requestedDate.getTime() - a.requestedDate.getTime());
  }

  /**
   * 提出リクエストをクリア（テスト用）
   */
  public clearRequests(): void {
    this.submissionRequests.clear();
  }
}

export const committeeSubmissionService = CommitteeSubmissionService.getInstance();
