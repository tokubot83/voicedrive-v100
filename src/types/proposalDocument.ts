/**
 * 議題提案書の型定義
 * 管理職が現場の声をまとめて委員会に提出するための客観的書類
 */

import { User, Post, VoteOption } from './index';
import { AgendaLevel } from './committee';

/**
 * 議題提案書のステータス
 */
export type ProposalDocumentStatus =
  | 'draft'              // 下書き
  | 'under_review'       // レビュー中
  | 'ready'              // 提出準備完了
  | 'submitted'          // 委員会提出済み
  | 'approved'           // 承認
  | 'rejected';          // 却下

/**
 * 投票データ分析
 */
export interface VoteAnalysis {
  totalVotes: number;
  supportRate: number;
  strongSupportRate: number;
  oppositionRate: number;
  neutralRate: number;

  // 部署別分析
  byDepartment?: {
    department: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];

  // 職位別分析
  byPosition?: {
    positionLevel: number;
    positionName: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];

  // ステークホルダー別分析
  byStakeholder?: {
    category: string;
    votes: Record<VoteOption, number>;
    supportRate: number;
  }[];
}

/**
 * コメント分析
 */
export interface CommentAnalysis {
  totalComments: number;
  supportComments: number;
  concernComments: number;
  proposalComments: number;

  // 賛成意見の要約
  supportSummary: string[];

  // 懸念点の要約
  concernSummary: string[];

  // 建設的提案
  constructiveProposals: string[];

  // 主要なコメント（代表的な意見）
  keyComments: {
    content: string;
    author: string; // 匿名化された表示名
    type: 'support' | 'concern' | 'proposal';
    likes: number;
  }[];
}

/**
 * 関連情報
 */
export interface RelatedInfo {
  // 類似の過去議題
  similarPastAgendas?: {
    id: string;
    title: string;
    date: Date;
    outcome: string;
    relevance: number; // 関連度 0-1
  }[];

  // 関連部署への影響
  affectedDepartments?: {
    department: string;
    impactLevel: 'high' | 'medium' | 'low';
    description: string;
  }[];

  // 参考資料
  references?: {
    title: string;
    url?: string;
    description: string;
  }[];
}

/**
 * 議題提案書
 */
export interface ProposalDocument {
  id: string;
  postId: string;
  post: Post;

  // 基本情報
  title: string;
  agendaLevel: AgendaLevel;
  createdBy: User;
  createdDate: Date;
  lastModifiedDate: Date;
  status: ProposalDocumentStatus;

  // 提案内容（自動生成 + 管理職による補足）
  summary: string; // 提案の要約
  background: string; // 背景・経緯
  objectives: string; // 目的
  expectedEffects: string; // 期待される効果
  concerns: string; // 懸念点
  counterMeasures: string; // 懸念への対応策

  // データ分析（自動生成）
  voteAnalysis: VoteAnalysis;
  commentAnalysis: CommentAnalysis;
  relatedInfo: RelatedInfo;

  // 管理職による追記
  managerNotes?: string;
  additionalContext?: string;
  recommendationLevel?: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';

  // 委員会提出情報
  targetCommittee?: string;
  submittedDate?: Date;
  submittedBy?: User;
  committeeDecision?: {
    status: 'approved' | 'rejected' | 'deferred';
    date: Date;
    reason?: string;
    nextSteps?: string;
  };

  // 透明性ログ
  auditLog: ProposalAuditLog[];
}

/**
 * 議題提案書の監査ログ
 */
export interface ProposalAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userLevel: number;
  action: 'created' | 'edited' | 'reviewed' | 'submitted' | 'approved' | 'rejected' | 'marked_candidate' | 'unmarked_candidate';
  details?: string;
  changedFields?: string[];
}
