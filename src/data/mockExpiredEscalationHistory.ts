/**
 * 期限到達判断履歴のモックデータ
 *
 * 将来的に職員カルテシステムからMCP経由で取得するデータの構造
 * 現在はモックデータとして使用
 */

export interface ExpiredEscalationHistoryItem {
  id: string;
  postId: string;
  postContent: string;
  proposalType: string;
  agendaLevel: string;
  currentScore: number;
  targetScore: number;
  achievementRate: number;
  daysOverdue: number;

  // 判断情報
  decision: 'approve_at_current_level' | 'downgrade' | 'reject';
  deciderId: string;
  deciderName: string;
  deciderLevel: number;
  decisionReason: string;
  decisionAt: string;

  // メタデータ
  department: string;
  facilityId: string;
  createdAt: string;
}

export interface ExpiredEscalationSummary {
  totalCount: number;
  approvedCount: number;
  downgradedCount: number;
  rejectedCount: number;
  approvalRate: number;
  averageDaysToDecision: number;
  averageAchievementRate: number;
}

export interface ExpiredEscalationHistoryData {
  summary: ExpiredEscalationSummary;
  items: ExpiredEscalationHistoryItem[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// LEVEL_5-6: 主任級のモックデータ
export const mockPersonalHistory: ExpiredEscalationHistoryData = {
  summary: {
    totalCount: 5,
    approvedCount: 3,
    downgradedCount: 1,
    rejectedCount: 1,
    approvalRate: 60,
    averageDaysToDecision: 1.8,
    averageAchievementRate: 86,
  },
  items: [
    {
      id: 'hist-001',
      postId: 'post-001',
      postContent: '夜勤シフトの見直し提案',
      proposalType: 'improvement',
      agendaLevel: 'DEPT_AGENDA',
      currentScore: 48,
      targetScore: 50,
      achievementRate: 96,
      daysOverdue: 2,
      decision: 'approve_at_current_level',
      deciderId: 'user-tanaka',
      deciderName: '田中主任',
      deciderLevel: 6,
      decisionReason: '目標にわずかに届かなかったが、現場の強い支持があるため部署議題として承認',
      decisionAt: '2025-10-18T10:30:00Z',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      createdAt: '2025-10-15T00:00:00Z',
    },
    {
      id: 'hist-002',
      postId: 'post-002',
      postContent: '休憩室の環境改善',
      proposalType: 'environment',
      agendaLevel: 'DEPT_AGENDA',
      currentScore: 45,
      targetScore: 50,
      achievementRate: 90,
      daysOverdue: 1,
      decision: 'approve_at_current_level',
      deciderId: 'user-tanaka',
      deciderName: '田中主任',
      deciderLevel: 6,
      decisionReason: '職員の福利厚生に関わる重要な提案のため承認',
      decisionAt: '2025-10-17T14:00:00Z',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      createdAt: '2025-10-12T00:00:00Z',
    },
    {
      id: 'hist-003',
      postId: 'post-003',
      postContent: '電子カルテ入力の簡略化',
      proposalType: 'system',
      agendaLevel: 'DEPT_REVIEW',
      currentScore: 25,
      targetScore: 30,
      achievementRate: 83,
      daysOverdue: 3,
      decision: 'downgrade',
      deciderId: 'user-tanaka',
      deciderName: '田中主任',
      deciderLevel: 6,
      decisionReason: '全体的な支持は得られなかったため、チーム内での検討に変更',
      decisionAt: '2025-10-16T09:00:00Z',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      createdAt: '2025-10-10T00:00:00Z',
    },
    {
      id: 'hist-004',
      postId: 'post-004',
      postContent: '業務マニュアルの刷新',
      proposalType: 'policy',
      agendaLevel: 'DEPT_AGENDA',
      currentScore: 42,
      targetScore: 50,
      achievementRate: 84,
      daysOverdue: 2,
      decision: 'approve_at_current_level',
      deciderId: 'user-tanaka',
      deciderName: '田中主任',
      deciderLevel: 6,
      decisionReason: 'マニュアル整備は喫緊の課題であり、スコアは十分と判断',
      decisionAt: '2025-10-15T11:30:00Z',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      createdAt: '2025-10-08T00:00:00Z',
    },
    {
      id: 'hist-005',
      postId: 'post-005',
      postContent: '新人教育プログラムの見直し',
      proposalType: 'training',
      agendaLevel: 'DEPT_REVIEW',
      currentScore: 22,
      targetScore: 30,
      achievementRate: 73,
      daysOverdue: 5,
      decision: 'reject',
      deciderId: 'user-tanaka',
      deciderName: '田中主任',
      deciderLevel: 6,
      decisionReason: '投票結果から組織全体の支持が不足していると判断',
      decisionAt: '2025-10-14T16:00:00Z',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      createdAt: '2025-10-05T00:00:00Z',
    },
  ],
  period: {
    startDate: '2025-10-01',
    endDate: '2025-10-31',
  },
};

// LEVEL_7-8: 師長・課長級のモックデータ
export const mockDepartmentHistory: ExpiredEscalationHistoryData = {
  summary: {
    totalCount: 15,
    approvedCount: 10,
    downgradedCount: 4,
    rejectedCount: 1,
    approvalRate: 67,
    averageDaysToDecision: 2.1,
    averageAchievementRate: 84,
  },
  items: [
    ...mockPersonalHistory.items,
    {
      id: 'hist-006',
      postId: 'post-006',
      postContent: '患者満足度向上プロジェクト',
      proposalType: 'improvement',
      agendaLevel: 'FACILITY_AGENDA',
      currentScore: 92,
      targetScore: 100,
      achievementRate: 92,
      daysOverdue: 1,
      decision: 'approve_at_current_level',
      deciderId: 'user-yamada',
      deciderName: '山田師長',
      deciderLevel: 8,
      decisionReason: '高い支持率を得ており施設議題として適切と判断',
      decisionAt: '2025-10-19T10:00:00Z',
      department: '看護部A病棟',
      facilityId: 'facility-1',
      createdAt: '2025-10-15T00:00:00Z',
    },
    // ... 他のデータ
  ],
  period: {
    startDate: '2025-10-01',
    endDate: '2025-10-31',
  },
};

// LEVEL_9-13: 部長・院長級のモックデータ
export const mockFacilityHistory: ExpiredEscalationHistoryData = {
  summary: {
    totalCount: 30,
    approvedCount: 21,
    downgradedCount: 6,
    rejectedCount: 3,
    approvalRate: 70,
    averageDaysToDecision: 2.3,
    averageAchievementRate: 85,
  },
  items: mockDepartmentHistory.items,
  period: {
    startDate: '2025-10-01',
    endDate: '2025-10-31',
  },
};

// LEVEL_14-17: 人事部・組織開発のモックデータ
export const mockCorporateHistory: ExpiredEscalationHistoryData = {
  summary: {
    totalCount: 180,
    approvedCount: 122,
    downgradedCount: 42,
    rejectedCount: 16,
    approvalRate: 68,
    averageDaysToDecision: 2.4,
    averageAchievementRate: 83,
  },
  items: mockFacilityHistory.items,
  period: {
    startDate: '2025-10-01',
    endDate: '2025-10-31',
  },
};

/**
 * permissionLevelに応じたモックデータを取得
 */
export function getMockExpiredEscalationHistory(permissionLevel: number): ExpiredEscalationHistoryData {
  if (permissionLevel >= 14) {
    return mockCorporateHistory; // 人事部・組織開発
  } else if (permissionLevel >= 9) {
    return mockFacilityHistory; // 部長・院長
  } else if (permissionLevel >= 7) {
    return mockDepartmentHistory; // 師長・課長
  } else if (permissionLevel >= 5) {
    return mockPersonalHistory; // 主任
  }

  // LEVEL_1-4: 一般職員は自分の提案履歴のみ（別途実装）
  return {
    summary: {
      totalCount: 0,
      approvedCount: 0,
      downgradedCount: 0,
      rejectedCount: 0,
      approvalRate: 0,
      averageDaysToDecision: 0,
      averageAchievementRate: 0,
    },
    items: [],
    period: {
      startDate: '2025-10-01',
      endDate: '2025-10-31',
    },
  };
}
