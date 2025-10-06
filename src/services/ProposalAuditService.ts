/**
 * 議題提案書監査ログサービス
 * 透明性確保のため、誰が・いつ・何をしたかを記録
 */

import { ProposalAuditLog } from '../types/proposalDocument';
import { User } from '../types';

export class ProposalAuditService {
  private static instance: ProposalAuditService;
  private logs: Map<string, ProposalAuditLog[]> = new Map();

  private constructor() {}

  public static getInstance(): ProposalAuditService {
    if (!ProposalAuditService.instance) {
      ProposalAuditService.instance = new ProposalAuditService();
    }
    return ProposalAuditService.instance;
  }

  /**
   * ログを記録
   */
  public log(
    documentId: string,
    user: User,
    action: ProposalAuditLog['action'],
    details?: string,
    changedFields?: string[]
  ): ProposalAuditLog {
    const logEntry: ProposalAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      userLevel: user.permissionLevel || 1,
      action,
      details,
      changedFields
    };

    const existingLogs = this.logs.get(documentId) || [];
    this.logs.set(documentId, [...existingLogs, logEntry]);

    console.log(`[ProposalAudit] ${user.name} (Level ${user.permissionLevel}) - ${action}`, {
      documentId,
      details,
      changedFields
    });

    return logEntry;
  }

  /**
   * 議題提案書作成ログ
   */
  public logCreated(documentId: string, user: User, postId: string): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'created',
      `投稿ID: ${postId}から議題提案書を作成`
    );
  }

  /**
   * 議題提案書編集ログ
   */
  public logEdited(
    documentId: string,
    user: User,
    changedFields: string[]
  ): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'edited',
      `編集フィールド: ${changedFields.join(', ')}`,
      changedFields
    );
  }

  /**
   * 議題提案書レビューログ
   */
  public logReviewed(documentId: string, user: User, notes?: string): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'reviewed',
      notes || 'レビュー完了'
    );
  }

  /**
   * 委員会提出ログ
   */
  public logSubmitted(
    documentId: string,
    user: User,
    targetCommittee: string
  ): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'submitted',
      `委員会: ${targetCommittee}に提出`
    );
  }

  /**
   * 承認ログ
   */
  public logApproved(documentId: string, user: User, reason?: string): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'approved',
      reason || '承認'
    );
  }

  /**
   * 却下ログ
   */
  public logRejected(documentId: string, user: User, reason: string): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'rejected',
      `却下理由: ${reason}`
    );
  }

  /**
   * 議題候補マークログ
   */
  public logMarkedAsCandidate(documentId: string, user: User): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'marked_candidate',
      '議題候補としてマーク'
    );
  }

  /**
   * 議題候補マーク解除ログ
   */
  public logUnmarkedAsCandidate(documentId: string, user: User): ProposalAuditLog {
    return this.log(
      documentId,
      user,
      'unmarked_candidate',
      '議題候補マークを解除'
    );
  }

  /**
   * 特定の提案書のログを取得
   */
  public getLogs(documentId: string): ProposalAuditLog[] {
    return this.logs.get(documentId) || [];
  }

  /**
   * ユーザーが実行した操作のログを取得
   */
  public getUserLogs(userId: string): ProposalAuditLog[] {
    const allLogs: ProposalAuditLog[] = [];

    this.logs.forEach(logs => {
      const userLogs = logs.filter(log => log.userId === userId);
      allLogs.push(...userLogs);
    });

    return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * ログをクリア（テスト用）
   */
  public clearLogs(): void {
    this.logs.clear();
  }

  /**
   * ログをエクスポート（CSV形式）
   */
  public exportLogsAsCSV(documentId: string): string {
    const logs = this.getLogs(documentId);

    const headers = ['タイムスタンプ', 'ユーザー名', '権限レベル', 'アクション', '詳細'];
    const rows = logs.map(log => [
      log.timestamp.toLocaleString('ja-JP'),
      log.userName,
      log.userLevel.toString(),
      this.getActionLabel(log.action),
      log.details || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  /**
   * アクションのラベルを取得
   */
  private getActionLabel(action: ProposalAuditLog['action']): string {
    const labels: Record<ProposalAuditLog['action'], string> = {
      created: '作成',
      edited: '編集',
      reviewed: 'レビュー',
      submitted: '委員会提出',
      approved: '承認',
      rejected: '却下',
      marked_candidate: '議題候補マーク',
      unmarked_candidate: '議題候補マーク解除'
    };

    return labels[action] || action;
  }
}

export const proposalAuditService = ProposalAuditService.getInstance();
