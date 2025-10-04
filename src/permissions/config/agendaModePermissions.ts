/**
 * 議題システムモード権限定義
 *
 * 目的: 委員会活性化・声を上げる文化の醸成
 * 特徴: 段階的な議題化、委員会への自動提出、シンプルな承認フロー
 */

import { PermissionLevel, SpecialPermissionLevel, ProjectScope } from '../types/PermissionTypes';

export interface AgendaModePermission {
  level: PermissionLevel | SpecialPermissionLevel;
  displayName: string;
  description: string;

  // 議題モード固有の権限
  canCreateIdea: boolean;              // アイデア投稿
  canVoteOnAgenda: boolean;            // 議題への投票
  canCommentOnAgenda: boolean;         // 議題へのコメント
  canViewDepartmentAgendas: boolean;   // 部署議題の閲覧
  canViewFacilityAgendas: boolean;     // 施設議題の閲覧
  canViewCorporateAgendas: boolean;    // 法人議題の閲覧

  // 委員会関連権限
  canPrepareCommitteeAgenda: boolean;  // 委員会議題準備
  canSubmitToCommittee: boolean;       // 委員会への提出
  canGenerateAgendaDocument: boolean;  // 議題提案書生成
  canAccessCommitteeBridge: boolean;   // 委員会ブリッジアクセス

  // 分析・管理権限
  canAccessVotingAnalytics: boolean;   // 投票分析
  canAccessAgendaProgress: boolean;    // 議題進捗確認
  canApproveAgenda: boolean;           // 議題承認

  // アクセス可能範囲
  agendaVisibilityScope: 'department' | 'facility' | 'corporation';

  // メニュー項目
  menuItems: string[];
}

/**
 * 議題モード権限定義（全18レベル + X）
 */
export const AGENDA_MODE_PERMISSIONS: Record<string, AgendaModePermission> = {
  // ========== 一般職員層 ==========
  [PermissionLevel.LEVEL_1]: {
    level: PermissionLevel.LEVEL_1,
    displayName: '新人（1年目）',
    description: '部署内議題に投票・コメント可能',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: false,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: false,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'department',
    menuItems: ['personal_station', 'agenda_progress']
  },

  [PermissionLevel.LEVEL_1_5]: {
    level: PermissionLevel.LEVEL_1_5,
    displayName: '新人看護師（リーダー可）',
    description: '部署内議題に投票・コメント可能',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: false,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: false,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'department',
    menuItems: ['personal_station', 'agenda_progress']
  },

  [PermissionLevel.LEVEL_2]: {
    level: PermissionLevel.LEVEL_2,
    displayName: '若手（2-3年目）',
    description: '部署内議題に積極的に参加',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: false,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: false,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'department',
    menuItems: ['personal_station', 'agenda_progress']
  },

  [PermissionLevel.LEVEL_2_5]: {
    level: PermissionLevel.LEVEL_2_5,
    displayName: '若手看護師（リーダー可）',
    description: '部署内議題に積極的に参加',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: false,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: false,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'department',
    menuItems: ['personal_station', 'agenda_progress']
  },

  [PermissionLevel.LEVEL_3]: {
    level: PermissionLevel.LEVEL_3,
    displayName: '中堅（4-10年目）',
    description: '部署議題への投票と分析閲覧',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: false,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: false,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'department',
    menuItems: ['personal_station', 'agenda_progress']
  },

  [PermissionLevel.LEVEL_3_5]: {
    level: PermissionLevel.LEVEL_3_5,
    displayName: '中堅看護師（リーダー可）',
    description: '投票分析へのアクセス可能',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: false,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: true,  // ✅ 投票分析可能
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'department',
    menuItems: ['personal_station', 'agenda_progress', 'voting_analytics']
  },

  [PermissionLevel.LEVEL_4]: {
    level: PermissionLevel.LEVEL_4,
    displayName: 'ベテラン（11年以上）',
    description: '部署議題への積極的参加',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: false,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'department',
    menuItems: ['personal_station', 'agenda_progress', 'voting_analytics']
  },

  [PermissionLevel.LEVEL_4_5]: {
    level: PermissionLevel.LEVEL_4_5,
    displayName: 'ベテラン看護師（リーダー可）',
    description: '施設議題の閲覧と分析可能',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,  // ✅ 施設議題閲覧可能
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'facility',
    menuItems: ['personal_station', 'agenda_progress', 'voting_analytics']
  },

  // ========== 役職層 ==========
  [PermissionLevel.LEVEL_5]: {
    level: PermissionLevel.LEVEL_5,
    displayName: '副主任',
    description: '議題提案書作成と部署議題の初期承認',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: true,  // ✅ 議題提案書生成可能
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,  // ✅ 部署議題の初期承認
    agendaVisibilityScope: 'facility',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics']
  },

  [PermissionLevel.LEVEL_6]: {
    level: PermissionLevel.LEVEL_6,
    displayName: '主任',
    description: '部署議題の承認と委員会準備',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: true,  // ✅ 委員会議題準備
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'facility',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_preparation']
  },

  [PermissionLevel.LEVEL_7]: {
    level: PermissionLevel.LEVEL_7,
    displayName: '副師長・副科長・副課長',
    description: '委員会準備と部門間調整',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: false,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,  // ✅ 委員会ブリッジアクセス
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'facility',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge']
  },

  [PermissionLevel.LEVEL_8]: {
    level: PermissionLevel.LEVEL_8,
    displayName: '師長・科長・課長・室長',
    description: '委員会への議題提出権限',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,  // ✅ 法人議題閲覧可能
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,  // ✅ 委員会への提出権限
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'committee_submission']
  },

  [PermissionLevel.LEVEL_9]: {
    level: PermissionLevel.LEVEL_9,
    displayName: '副部長',
    description: '部門横断議題の調整',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'cross_department_coordination']
  },

  [PermissionLevel.LEVEL_10]: {
    level: PermissionLevel.LEVEL_10,
    displayName: '部長・医局長',
    description: '運営委員会メンバー',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'operations_committee']
  },

  [PermissionLevel.LEVEL_11]: {
    level: PermissionLevel.LEVEL_11,
    displayName: '事務長',
    description: '施設運営議題の統括',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'facility_governance']
  },

  // ========== 施設経営層 ==========
  [PermissionLevel.LEVEL_12]: {
    level: PermissionLevel.LEVEL_12,
    displayName: '副院長',
    description: '施設議題の戦略的レビュー',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'strategic_review']
  },

  [PermissionLevel.LEVEL_13]: {
    level: PermissionLevel.LEVEL_13,
    displayName: '院長・施設長',
    description: '施設最終議題承認権限',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'executive_decision']
  },

  // ========== 法人人事部 ==========
  [PermissionLevel.LEVEL_14]: {
    level: PermissionLevel.LEVEL_14,
    displayName: '人事部門員',
    description: '組織風土改善議題の分析',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: false,
    canSubmitToCommittee: false,
    canGenerateAgendaDocument: false,
    canAccessCommitteeBridge: false,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: false,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'voting_analytics', 'voice_analytics']
  },

  [PermissionLevel.LEVEL_15]: {
    level: PermissionLevel.LEVEL_15,
    displayName: '人事各部門長',
    description: '組織課題議題の戦略的分析',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'organizational_insights']
  },

  [PermissionLevel.LEVEL_16]: {
    level: PermissionLevel.LEVEL_16,
    displayName: '戦略企画・統括管理部門員',
    description: '法人横断議題の企画・調整',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'strategic_planning']
  },

  [PermissionLevel.LEVEL_17]: {
    level: PermissionLevel.LEVEL_17,
    displayName: '戦略企画・統括管理部門長',
    description: '法人議題の統括管理',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'corporate_governance']
  },

  // ========== 最高経営層 ==========
  [PermissionLevel.LEVEL_18]: {
    level: PermissionLevel.LEVEL_18,
    displayName: '理事長・法人事務局長',
    description: '理事会議題の最終決定',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics', 'committee_bridge', 'board_functions', 'final_approval']
  },

  // ========== 特別権限 ==========
  [SpecialPermissionLevel.LEVEL_X]: {
    level: SpecialPermissionLevel.LEVEL_X,
    displayName: 'システム管理者',
    description: '全議題・全機能へのアクセス',
    canCreateIdea: true,
    canVoteOnAgenda: true,
    canCommentOnAgenda: true,
    canViewDepartmentAgendas: true,
    canViewFacilityAgendas: true,
    canViewCorporateAgendas: true,
    canPrepareCommitteeAgenda: true,
    canSubmitToCommittee: true,
    canGenerateAgendaDocument: true,
    canAccessCommitteeBridge: true,
    canAccessVotingAnalytics: true,
    canAccessAgendaProgress: true,
    canApproveAgenda: true,
    agendaVisibilityScope: 'corporation',
    menuItems: ['all'] // 全メニューアクセス可能
  }
};

/**
 * 権限レベルから議題モード権限を取得
 */
export const getAgendaModePermission = (
  level: PermissionLevel | SpecialPermissionLevel | number
): AgendaModePermission | undefined => {
  const key = typeof level === 'number' ? level.toString() : level;
  return AGENDA_MODE_PERMISSIONS[key];
};
