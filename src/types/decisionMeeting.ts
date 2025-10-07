/**
 * 決定会議（レベル13：院長・施設長専用）
 * 運営委員会からの議題を最終決定
 */

export type DecisionAgendaType =
  | 'committee_proposal'    // 委員会提案
  | 'facility_policy'       // 施設方針
  | 'personnel'            // 重要人事
  | 'budget'               // 予算承認
  | 'equipment'            // 設備投資
  | 'other';               // その他

export type DecisionStatus =
  | 'pending'      // 審議待ち
  | 'in_review'    // 審議中
  | 'approved'     // 承認
  | 'rejected'     // 却下
  | 'deferred';    // 保留

export type DecisionPriority =
  | 'urgent'       // 緊急
  | 'high'         // 高
  | 'normal'       // 通常
  | 'low';         // 低

export interface DecisionAgenda {
  id: string;
  title: string;
  type: DecisionAgendaType;
  description: string;
  background: string;         // 背景・経緯

  // 提案元情報
  proposedBy: string;         // 提案者（委員会名など）
  proposedDate: Date;
  proposerDepartment: string;

  // ステータス
  status: DecisionStatus;
  priority: DecisionPriority;

  // 審議情報
  scheduledDate?: Date;       // 審議予定日
  decidedDate?: Date;         // 決定日
  decidedBy?: string;         // 決定者（院長名）
  decision?: 'approved' | 'rejected' | 'deferred';
  decisionNotes?: string;     // 決定理由・コメント

  // 影響分析
  impact: {
    departments: string[];    // 影響を受ける部署
    estimatedCost?: number;   // 予算影響
    implementationPeriod?: string; // 実施期間
    expectedEffect: string;   // 期待される効果
  };

  // 関連資料
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];

  // 議事録
  meetingMinutes?: {
    attendees: string[];      // 出席者
    discussion: string;       // 議論内容
    concerns: string[];       // 懸念事項
    conditions?: string[];    // 承認条件
  };

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface DecisionMeetingStats {
  totalAgendas: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  deferredCount: number;
  urgentCount: number;

  // 分類別統計
  byType: Record<DecisionAgendaType, number>;

  // 期間統計
  thisMonthDecisions: number;
  approvalRate: number;      // 承認率 %
  averageDecisionDays: number; // 平均決定日数
}

export interface DecisionTemplate {
  id: string;
  type: DecisionAgendaType;
  name: string;
  description: string;
  requiredFields: string[];
  suggestedImpactAreas: string[];
}
