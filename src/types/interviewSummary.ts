/**
 * 面談サマリ型定義
 * 医療職員管理システムから受信する面談サマリのデータ構造
 */

export type InterviewType = 'regular' | 'support' | 'special';

export interface InterviewSummary {
  summaryId: string;           // サマリID（UUID形式）
  interviewType: InterviewType; // 面談種類："regular" | "support" | "special"
  interviewId: string;         // 面談ID（UUID形式）
  staffId: string;             // 職員ID
  staffName: string;           // 職員名
  interviewDate: string;       // 面談実施日（ISO 8601形式：YYYY-MM-DD）
  createdAt: string;           // サマリ作成日時（ISO 8601形式）
  createdBy: string;           // 作成者名（人事部担当者名）
  summary: string;             // サマリ本文（Markdown形式）
  status: string;              // ステータス："sent"
  sentAt: string;              // 送信日時（ISO 8601形式）
}

export interface ReceiveSummaryResponse {
  success: boolean;
  message?: string;
  error?: string;
  receivedAt?: string;
}
