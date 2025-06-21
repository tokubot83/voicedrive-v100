// 新マッピング対応のプロジェクトデモデータ - 13段階権限レベルと新予算上限対応
import { ProjectScope } from '../../permissions/types/PermissionTypes';

export interface EnhancedProjectDemo {
  id: string;
  title: string;
  description: string;
  scope: ProjectScope;
  estimatedBudget: number;
  status: 'PENDING' | 'IN_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  proposedBy: string;
  proposedByLevel: number;
  facility: string;
  department: string;
  category: 'operational' | 'communication' | 'innovation' | 'strategic';
  expectedScore: number;
  currentApprovalStage?: string;
  requiredApprovers?: string[];
  approvalHistory?: Array<{
    stage: string;
    approver: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    timestamp: Date;
    comments?: string;
  }>;
  expectedBenefits: string[];
  timeline: string;
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  isHRSpecial?: boolean;
  hrCategory?: 'interview-system' | 'training-career' | 'hr-policy' | 'strategic-hr';
}

export const enhancedProjectDemos: EnhancedProjectDemo[] = [
  // チームレベルプロジェクト（予算上限: 5万円）
  {
    id: 'team_001',
    title: '内科病棟の夜勤申し送り時間短縮',
    description: '夜勤申し送りをより効率的に行うためのチェックリスト作成と手順見直し',
    scope: ProjectScope.TEAM,
    estimatedBudget: 30000,
    status: 'APPROVED',
    proposedBy: 'staff_001',
    proposedByLevel: 1,
    facility: '小原病院本院',
    department: '内科病棟',
    category: 'operational',
    expectedScore: 65,
    currentApprovalStage: 'APPROVAL_COMPLETED',
    approvalHistory: [
      {
        stage: 'TEAM_LEAD_APPROVAL',
        approver: 'supervisor_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-15T10:00:00'),
        comments: '実用的な提案。早期実装を支持します。'
      },
      {
        stage: 'MANAGER_APPROVAL',
        approver: 'dept_head_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-16T14:30:00'),
        comments: '病棟全体の効率向上に寄与します。'
      },
      {
        stage: 'HR_STRATEGIC_APPROVAL',
        approver: 'hr_strategic_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-17T09:15:00'),
        comments: '業務効率化の良い事例。承認します。'
      }
    ],
    expectedBenefits: [
      '申し送り時間の20%短縮',
      'ヒューマンエラーの削減',
      'スタッフの負担軽減'
    ],
    timeline: '1ヶ月',
    riskAssessment: 'LOW'
  },
  {
    id: 'team_002',
    title: '薬剤部の在庫管理システム改善',
    description: '薬剤在庫の目視確認を補助するバーコードシステムの導入検討',
    scope: ProjectScope.TEAM,
    estimatedBudget: 45000,
    status: 'IN_APPROVAL',
    proposedBy: 'staff_002',
    proposedByLevel: 1,
    facility: '小原病院本院',
    department: '薬剤部',
    category: 'operational',
    expectedScore: 58,
    currentApprovalStage: 'MANAGER_APPROVAL',
    expectedBenefits: [
      '在庫確認時間の30%短縮',
      '在庫切れリスクの軽減',
      '薬剤ミスの防止'
    ],
    timeline: '2ヶ月',
    riskAssessment: 'LOW'
  },

  // 部門レベルプロジェクト（予算上限: 20万円）
  {
    id: 'dept_001',
    title: '医事課と看護部の連携強化システム',
    description: '入退院手続きの効率化のための部門間情報共有システム構築',
    scope: ProjectScope.DEPARTMENT,
    estimatedBudget: 180000,
    status: 'APPROVED',
    proposedBy: 'dept_head_002',
    proposedByLevel: 3,
    facility: '小原病院本院',
    department: '医事課',
    category: 'operational',
    expectedScore: 125,
    currentApprovalStage: 'APPROVAL_COMPLETED',
    approvalHistory: [
      {
        stage: 'MANAGER_APPROVAL',
        approver: 'dept_head_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-20T11:00:00'),
        comments: '部門間連携の改善は重要です。支持します。'
      },
      {
        stage: 'SECTION_CHIEF_APPROVAL',
        approver: 'facility_head_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-22T15:45:00'),
        comments: '効率化効果が期待できます。'
      },
      {
        stage: 'HR_STRATEGIC_APPROVAL',
        approver: 'hr_strategic_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-24T13:20:00'),
        comments: '部門横断的な改善として評価します。'
      }
    ],
    expectedBenefits: [
      '入退院手続き時間の40%短縮',
      '部門間のコミュニケーション向上',
      '患者満足度の向上'
    ],
    timeline: '3ヶ月',
    riskAssessment: 'MEDIUM'
  },

  // 施設レベルプロジェクト（予算上限: 1000万円）
  {
    id: 'facility_001',
    title: '病院全体の電子カルテシステム更新',
    description: '現行の電子カルテシステムを最新版にアップグレードし、全部門の業務効率を向上',
    scope: ProjectScope.FACILITY,
    estimatedBudget: 8500000,
    status: 'IN_APPROVAL',
    proposedBy: 'facility_head_001',
    proposedByLevel: 4,
    facility: '小原病院本院',
    department: '医事課',
    category: 'innovation',
    expectedScore: 420,
    currentApprovalStage: 'ALL_LEVEL4_APPROVAL',
    requiredApprovers: [
      'facility_head_001',
      'facility_head_002',
      'facility_head_003',
      'facility_head_004'
    ],
    expectedBenefits: [
      '全部門の業務効率20%向上',
      'データ入力時間の大幅短縮',
      '医療安全の向上',
      '患者情報の一元管理'
    ],
    timeline: '6ヶ月',
    riskAssessment: 'HIGH'
  },
  {
    id: 'facility_002',
    title: '看護師の働き方改革推進プロジェクト',
    description: 'シフト管理システムと休憩時間確保のための人員配置最適化',
    scope: ProjectScope.FACILITY,
    estimatedBudget: 3200000,
    status: 'PENDING',
    proposedBy: 'facility_head_002',
    proposedByLevel: 4,
    facility: '小原病院本院',
    department: '看護部',
    category: 'operational',
    expectedScore: 380,
    expectedBenefits: [
      '看護師の満足度向上',
      '離職率の改善',
      '患者ケアの質向上',
      'ワークライフバランスの改善'
    ],
    timeline: '4ヶ月',
    riskAssessment: 'MEDIUM'
  },

  // 法人レベルプロジェクト（予算上限: 2000万円）
  {
    id: 'org_001',
    title: '全施設統合医療情報システム構築',
    description: '本院・分院間での患者情報共有と医療連携強化のための統合システム',
    scope: ProjectScope.ORGANIZATION,
    estimatedBudget: 18000000,
    status: 'IN_APPROVAL',
    proposedBy: 'director_001',
    proposedByLevel: 9,
    facility: '小原病院本院',
    department: '内科',
    category: 'strategic',
    expectedScore: 680,
    currentApprovalStage: 'ALL_FACILITIES_LEVEL5_APPROVAL',
    requiredApprovers: [
      'hr_strategic_001',
      'hr_strategic_002',
      'hr_strategic_003'
    ],
    expectedBenefits: [
      '施設間の医療連携強化',
      '患者の継続的ケア向上',
      '医療データの統合活用',
      '業務効率の大幅改善'
    ],
    timeline: '12ヶ月',
    riskAssessment: 'HIGH'
  },

  // 法人戦略的プロジェクト（予算無制限）
  {
    id: 'strategic_001',
    title: '地域医療連携ネットワーク構築',
    description: '地域の医療機関との連携強化と新たな医療サービス展開',
    scope: ProjectScope.STRATEGIC,
    estimatedBudget: 50000000,
    status: 'PENDING',
    proposedBy: 'ceo_001',
    proposedByLevel: 12,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    expectedScore: 1350,
    expectedBenefits: [
      '地域医療の質向上',
      '新規患者の獲得',
      '医療収益の拡大',
      '地域貢献の実現'
    ],
    timeline: '24ヶ月',
    riskAssessment: 'HIGH'
  },

  // 人財統括本部特別カテゴリプロジェクト
  {
    id: 'hr_special_001',
    title: '全職員キャリア面談システム導入',
    description: '職員のキャリア開発支援のための体系的面談システムと評価制度の構築',
    scope: ProjectScope.ORGANIZATION,
    estimatedBudget: 4500000,
    status: 'IN_APPROVAL',
    proposedBy: 'ceo_001',
    proposedByLevel: 12,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    expectedScore: 520,
    isHRSpecial: true,
    hrCategory: 'interview-system',
    currentApprovalStage: 'ALL_HR_DEPT_HEADS_APPROVAL',
    requiredApprovers: [
      'hr_dept_head_001',
      'hr_dept_head_002',
      'hr_dept_head_003'
    ],
    expectedBenefits: [
      '職員のキャリア満足度向上',
      '人材定着率の改善',
      '組織的な人材育成',
      '離職率の削減'
    ],
    timeline: '8ヶ月',
    riskAssessment: 'MEDIUM'
  },
  {
    id: 'hr_special_002',
    title: '新人研修プログラム体系化',
    description: '新規採用者向けの包括的研修プログラムとメンター制度の整備',
    scope: ProjectScope.ORGANIZATION,
    estimatedBudget: 2800000,
    status: 'APPROVED',
    proposedBy: 'ceo_001',
    proposedByLevel: 12,
    facility: '本部',
    department: '人財統括本部',
    category: 'operational',
    expectedScore: 490,
    isHRSpecial: true,
    hrCategory: 'training-career',
    currentApprovalStage: 'APPROVAL_COMPLETED',
    approvalHistory: [
      {
        stage: 'ALL_HR_DEPT_HEADS_APPROVAL',
        approver: 'hr_dept_head_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-25T10:00:00'),
        comments: '新人研修の体系化は急務です。'
      },
      {
        stage: 'HR_GENERAL_MANAGER_REVIEW',
        approver: 'hr_general_manager_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-26T14:00:00'),
        comments: '人材育成の基盤として重要な取り組み。'
      },
      {
        stage: 'CEO_APPROVAL',
        approver: 'ceo_001',
        status: 'APPROVED',
        timestamp: new Date('2024-01-27T16:30:00'),
        comments: '組織の将来を支える投資として承認。'
      }
    ],
    expectedBenefits: [
      '新人の早期戦力化',
      '研修効果の標準化',
      'メンター制度による組織文化継承',
      '新人の離職率改善'
    ],
    timeline: '6ヶ月',
    riskAssessment: 'LOW'
  },
  {
    id: 'hr_special_003',
    title: '働き方改革推進政策策定',
    description: '全職員の働き方改革を推進するための包括的人事政策の策定と実施',
    scope: ProjectScope.ORGANIZATION,
    estimatedBudget: 1800000,
    status: 'PENDING',
    proposedBy: 'ceo_001',
    proposedByLevel: 12,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    expectedScore: 460,
    isHRSpecial: true,
    hrCategory: 'hr-policy',
    expectedBenefits: [
      '職員の働き方満足度向上',
      '生産性の向上',
      '健康経営の推進',
      '優秀な人材の確保'
    ],
    timeline: '10ヶ月',
    riskAssessment: 'MEDIUM'
  },
  {
    id: 'hr_special_004',
    title: '次世代リーダー育成戦略',
    description: '将来の組織を担うリーダー人材の発掘・育成のための戦略的プログラム',
    scope: ProjectScope.STRATEGIC,
    estimatedBudget: 12000000,
    status: 'PENDING',
    proposedBy: 'ceo_001',
    proposedByLevel: 12,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    expectedScore: 980,
    isHRSpecial: true,
    hrCategory: 'strategic-hr',
    expectedBenefits: [
      '組織の持続的成長',
      'リーダーシップの強化',
      '組織文化の継承発展',
      '競争力の向上'
    ],
    timeline: '18ヶ月',
    riskAssessment: 'HIGH'
  }
];

// プロジェクトスコープ別の統計情報
export const projectScopeStatistics = {
  [ProjectScope.TEAM]: {
    totalProjects: 15,
    averageBudget: 35000,
    successRate: 0.85,
    averageCompletionTime: 6, // weeks
    budgetRange: { min: 10000, max: 50000 }
  },
  [ProjectScope.DEPARTMENT]: {
    totalProjects: 8,
    averageBudget: 150000,
    successRate: 0.78,
    averageCompletionTime: 12, // weeks
    budgetRange: { min: 80000, max: 200000 }
  },
  [ProjectScope.FACILITY]: {
    totalProjects: 4,
    averageBudget: 6500000,
    successRate: 0.70,
    averageCompletionTime: 24, // weeks
    budgetRange: { min: 2000000, max: 10000000 }
  },
  [ProjectScope.ORGANIZATION]: {
    totalProjects: 2,
    averageBudget: 15000000,
    successRate: 0.65,
    averageCompletionTime: 48, // weeks
    budgetRange: { min: 10000000, max: 20000000 }
  },
  [ProjectScope.STRATEGIC]: {
    totalProjects: 1,
    averageBudget: 50000000,
    successRate: 0.60,
    averageCompletionTime: 96, // weeks
    budgetRange: { min: 30000000, max: null }
  }
};

export default enhancedProjectDemos;