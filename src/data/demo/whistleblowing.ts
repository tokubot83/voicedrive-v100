import { WhistleblowingReport, InvestigationNote, ReportStatistics } from '../../types/whistleblowing';

// デモ用公益通報データ
export const demoWhistleblowingReports: WhistleblowingReport[] = [
  {
    id: 'wb-001',
    anonymousId: 'anon-2024-001',
    category: 'harassment',
    severity: 'high',
    title: '上司からの継続的なパワーハラスメント',
    content: '直属の上司から3ヶ月間にわたり、人格を否定するような発言や過度な業務負荷を強いられています。他の同僚も同様の被害を受けており、職場環境が悪化しています。具体的には、「君には無理だ」「向いていない」などの発言を毎日のように受け、残業を強要されています。',
    submittedAt: new Date('2025-05-15T09:30:00'),
    updatedAt: new Date('2025-05-20T14:22:00'),
    status: 'investigating',
    assignedInvestigators: ['hr_specialist', 'legal_counsel'],
    internalNotes: [
      {
        id: 'note-001',
        reportId: 'wb-001',
        authorRole: 'hr_specialist',
        authorName: '田中人事部長',
        content: '初期ヒアリングを実施。複数の証言者を確認。事実関係の調査を継続中。',
        createdAt: new Date('2025-05-16T10:00:00'),
        isConfidential: true,
        actionItems: ['関係者ヒアリング', '証拠収集', '上司の行動パターン分析']
      }
    ],
    followUpRequired: true,
    isAnonymous: true,
    priority: 8
  },
  {
    id: 'wb-002',
    anonymousId: 'anon-2024-002',
    category: 'safety',
    severity: 'critical',
    title: '医療機器の安全点検不備',
    content: '手術室で使用される医療機器の定期点検が適切に実施されていません。点検記録の改ざんも疑われます。患者の安全に直結する重大な問題と考えます。',
    submittedAt: new Date('2025-05-10T16:45:00'),
    updatedAt: new Date('2025-05-11T08:30:00'),
    status: 'escalated',
    assignedInvestigators: ['safety_officer', 'external_expert', 'management'],
    escalationReason: '患者安全に直結する緊急案件のため外部専門機関と連携',
    followUpRequired: true,
    isAnonymous: true,
    priority: 10
  },
  {
    id: 'wb-003',
    anonymousId: 'anon-2024-003',
    category: 'financial',
    severity: 'medium',
    title: '経費精算の不正疑惑',
    content: '特定の管理職が架空の接待費や交通費を計上している可能性があります。領収書の日付や金額に不自然な点が見受けられます。',
    submittedAt: new Date('2025-05-18T11:20:00'),
    updatedAt: new Date('2025-05-19T15:45:00'),
    status: 'triaging',
    assignedInvestigators: ['hr_specialist'],
    followUpRequired: true,
    isAnonymous: true,
    priority: 6
  },
  {
    id: 'wb-004',
    anonymousId: 'anon-2024-004',
    category: 'discrimination',
    severity: 'high',
    title: '採用選考における性別差別',
    content: '採用面接において、女性応募者に対してのみ「結婚の予定は？」「出産後も働き続けられるか？」などの質問が行われています。男女平等の原則に反する行為です。',
    submittedAt: new Date('2025-05-12T13:15:00'),
    updatedAt: new Date('2025-05-14T10:30:00'),
    status: 'investigating',
    assignedInvestigators: ['hr_specialist', 'legal_counsel'],
    followUpRequired: true,
    isAnonymous: false,
    priority: 7
  },
  {
    id: 'wb-005',
    anonymousId: 'anon-2024-005',
    category: 'compliance',
    severity: 'low',
    title: '残業時間の過少申告指示',
    content: '直属の上司から、実際の残業時間よりも少なく申告するよう指示されました。労働基準法違反の可能性があります。',
    submittedAt: new Date('2025-05-08T17:30:00'),
    updatedAt: new Date('2025-05-09T09:15:00'),
    status: 'resolved',
    assignedInvestigators: ['hr_specialist'],
    resolutionSummary: '事実確認完了。該当上司への指導を実施。労務管理研修の実施を決定。',
    followUpRequired: false,
    isAnonymous: true,
    priority: 4
  },
  {
    id: 'wb-006',
    anonymousId: 'anon-2024-006',
    category: 'other',
    severity: 'medium',
    title: '個人情報の不適切な取り扱い',
    content: '患者の個人情報が記載された書類が、施錠されていないキャビネットに保管されています。プライバシー保護の観点から問題があると思われます。',
    submittedAt: new Date('2025-05-20T08:45:00'),
    updatedAt: new Date('2025-05-20T08:45:00'),
    status: 'received',
    assignedInvestigators: [],
    followUpRequired: true,
    isAnonymous: true,
    priority: 5
  }
];

// 統計データ
export const demoReportStatistics: ReportStatistics = {
  totalReports: 23,
  byCategory: {
    harassment: 8,
    safety: 4,
    financial: 3,
    compliance: 5,
    discrimination: 2,
    other: 1
  },
  byStatus: {
    received: 3,
    triaging: 2,
    investigating: 8,
    escalated: 2,
    resolved: 6,
    closed: 2
  },
  bySeverity: {
    low: 5,
    medium: 9,
    high: 7,
    critical: 2
  },
  averageResolutionDays: 12.5,
  escalationRate: 0.17, // 17%
  monthlyTrend: [
    { month: '2025-01', count: 4, resolved: 3 },
    { month: '2025-02', count: 3, resolved: 4 },
    { month: '2025-03', count: 6, resolved: 5 },
    { month: '2025-04', count: 4, resolved: 3 },
    { month: '2025-05', count: 6, resolved: 2 }
  ]
};

// 権限レベル別のアクセス設定
export const getWhistleblowingPermissions = (userLevel: number) => {
  if (userLevel >= 8) {
    // レベル8: 役員・経営層 - 全権限
    return {
      canView: true,
      canInvestigate: true,
      canEscalate: true,
      canResolve: true,
      canViewStatistics: true,
      canAccessConfidentialNotes: true,
      canAssignInvestigators: true,
      maxSeverityLevel: 'critical' as const
    };
  } else if (userLevel >= 7) {
    // レベル7: 部長・本部長級 - 重要案件まで
    return {
      canView: true,
      canInvestigate: true,
      canEscalate: true,
      canResolve: false,
      canViewStatistics: true,
      canAccessConfidentialNotes: true,
      canAssignInvestigators: true,
      maxSeverityLevel: 'high' as const
    };
  } else if (userLevel >= 6) {
    // レベル6: 人財統括本部統括管理部門長 - 中程度まで
    return {
      canView: true,
      canInvestigate: true,
      canEscalate: false,
      canResolve: false,
      canViewStatistics: true,
      canAccessConfidentialNotes: false,
      canAssignInvestigators: false,
      maxSeverityLevel: 'medium' as const
    };
  } else if (userLevel >= 5) {
    // レベル5: 人財統括本部部門長 - 統計のみ
    return {
      canView: false,
      canInvestigate: false,
      canEscalate: false,
      canResolve: false,
      canViewStatistics: true,
      canAccessConfidentialNotes: false,
      canAssignInvestigators: false,
      maxSeverityLevel: 'low' as const
    };
  } else {
    // レベル4以下: 通報投稿のみ
    return {
      canView: false,
      canInvestigate: false,
      canEscalate: false,
      canResolve: false,
      canViewStatistics: false,
      canAccessConfidentialNotes: false,
      canAssignInvestigators: false,
      maxSeverityLevel: 'low' as const
    };
  }
};