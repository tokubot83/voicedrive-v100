/**
 * 議題モード判断処理の型定義
 */

export interface AgendaDecisionInput {
  postId: string;
  decisionType: string;
  deciderId: string;
  reason: string;
  committeeId?: string;
}

export interface AgendaDecisionResult {
  success: boolean;
  error?: string;
  post?: any;
  postId?: string;
  newStatus?: string;
  notificationsSent?: number;
  message?: string;
}
