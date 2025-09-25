// 委員会関連の型定義

export interface CommitteeInfo {
  committees: string[];           // 提出先委員会
  submissionDate: Date;           // 提出日
  submittedBy: {                  // 提出者
    id: string;
    name: string;
    permissionLevel: number;
  };
  note?: string;                  // 備考
}

export interface CommitteeDecision {
  decision: 'approved' | 'escalated' | 'pending' | 'rejected';
  decidedDate?: Date;
  reason?: string;
  nextAction?: string;
}

export interface IdeaProgress {
  // 基本情報
  postId: string;
  currentStatus: CommitteeStatus;
  statusHistory: StatusHistoryItem[];
  lastUpdated: Date;

  // 委員会関連
  committeeInfo?: CommitteeInfo;
  committeeDecision?: CommitteeDecision;

  // スコア情報
  currentScore: number;
  currentLevel: AgendaLevel;

  // 透明性指標
  viewCount: number;
  supportRate: number;
  totalVotes: number;
  uniqueVoters: number;
}

export type CommitteeStatus =
  | 'pending'                    // 委員会提出待ち
  | 'under_review'               // 施設議題（審査中）
  | 'committee_submitted'        // 委員会へ提出済み
  | 'committee_reviewing'        // 委員会で審議中
  | 'implementation_decided'     // 委員会決定：実施予定
  | 'escalated_to_corp'         // 委員会決定：法人検討へ
  | 'returned_for_improvement'  // 要改善
  | 'rejected';                 // 施設議題却下

export type AgendaLevel =
  | 'PENDING'           // 検討中 (0-29点)
  | 'DEPT_REVIEW'      // 部署検討 (30-49点)
  | 'DEPT_AGENDA'      // 部署議題 (50-99点)
  | 'FACILITY_AGENDA'  // 施設議題 (100-299点)
  | 'CORP_REVIEW'      // 法人検討 (300-599点)
  | 'CORP_AGENDA';     // 法人議題 (600点以上)

export interface StatusHistoryItem {
  status: CommitteeStatus;
  timestamp: Date;
  changedBy?: {
    id: string;
    name: string;
  };
  note?: string;
}

export interface SubmissionReview {
  // 権限者が確認する項目
  checkItems: {
    isRealistic: boolean;        // 現実的な提案か
    hasEvidence: boolean;         // 根拠があるか
    notDuplicate: boolean;        // 重複提案でないか
    appropriateScope: boolean;    // 施設レベルの案件か
    notMalicious: boolean;        // 悪意ある内容でないか
  };

  // 判断
  decision: 'approve' | 'return' | 'reject';
  reason?: string;               // 差し戻し・却下時は必須
  reviewedBy: {
    id: string;
    name: string;
    permissionLevel: number;
  };
  reviewedAt: Date;
}