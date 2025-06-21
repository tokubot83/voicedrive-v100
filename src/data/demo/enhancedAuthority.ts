// 13段階権限システム対応の権限管理デモデータ - 新マッピング対応
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

export interface EnhancedAuthorityNode {
  id: string;
  name: string;
  level: PermissionLevel;
  department: string;
  facility: string;
  isActive: boolean;
  children?: EnhancedAuthorityNode[];
  budgetLimit: number;
  approvalAuthority: string[];
  createdAt: Date;
  updatedAt: Date;
  // 新マッピング対応の追加フィールド
  canApproveEmergencyOverride?: boolean;
  hrSpecialAuthority?: boolean;
  multiApprovalRequired?: boolean;
  facilityScope?: string[];
  approvalChainPosition?: number;
  specialCategories?: string[];
}

export interface EnhancedAuthorityMetrics {
  totalApprovals: number;
  pendingApprovals: number;
  approvedItems: number;
  rejectedItems: number;
  emergencyOverrides: number;
  hrSpecialApprovals: number;
  multiApprovalCases: number;
  averageProcessingTime: number; // hours
  levelBreakdown: Record<PermissionLevel, {
    totalCases: number;
    averageTime: number;
    successRate: number;
  }>;
}

export interface EnhancedWeightAdjustmentRequest {
  id: string;
  userId: string;
  userName: string;
  currentLevel: PermissionLevel;
  currentWeight: number;
  requestedWeight: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvalLevel: PermissionLevel;
  emergencyFlag?: boolean;
}

export interface EmergencyOverrideCase {
  id: string;
  initiatedBy: string;
  initiatorLevel: PermissionLevel;
  projectId: string;
  projectTitle: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  overrideLevel: PermissionLevel;
  timestamp: Date;
  approvedBy?: string;
  urgencyLevel: 'HIGH' | 'CRITICAL';
}

export interface HRSpecialApprovalCase {
  id: string;
  category: 'interview-system' | 'training-career' | 'hr-policy' | 'strategic-hr';
  projectId: string;
  projectTitle: string;
  budgetAmount: number;
  approvalStage: string;
  requiredApprovers: string[];
  currentApprovers: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  initiatedAt: Date;
  completedAt?: Date;
}

// 13段階権限階層（新マッピング対応）
export const enhancedAuthorityHierarchy: EnhancedAuthorityNode[] = [
  // 最上位: 理事長 (Level 13)
  {
    id: 'chairman',
    name: '理事長',
    level: PermissionLevel.LEVEL_13,
    department: '理事会',
    facility: '本部',
    isActive: true,
    budgetLimit: -1, // 無制限
    approvalAuthority: [
      'ALL_PROJECTS', 
      'BUDGET_UNLIMITED', 
      'POLICY_CHANGES', 
      'STRATEGIC_DECISIONS',
      'FINAL_AUTHORITY',
      'EMERGENCY_OVERRIDE_APPROVAL'
    ],
    canApproveEmergencyOverride: true,
    hrSpecialAuthority: true,
    facilityScope: ['ALL'],
    approvalChainPosition: 1,
    specialCategories: ['STRATEGIC', 'EMERGENCY', 'FINAL_AUTHORITY'],
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01'),
    children: [
      // Level 12: 人財統括本部 トップ（緊急オーバーライド権限）
      {
        id: 'ceo',
        name: '人財統括本部 トップ',
        level: PermissionLevel.LEVEL_12,
        department: '人財統括本部',
        facility: '本部',
        isActive: true,
        budgetLimit: 50000000, // 5000万円
        approvalAuthority: [
          'HR_PROJECTS', 
          'TRAINING_BUDGET', 
          'STRATEGIC_HR', 
          'POLICY_REVIEW',
          'EMERGENCY_OVERRIDE',
          'HR_SPECIAL_PROJECTS',
          'STRATEGIC_PROJECT_INITIATION'
        ],
        canApproveEmergencyOverride: true,
        hrSpecialAuthority: true,
        facilityScope: ['ALL'],
        approvalChainPosition: 2,
        specialCategories: ['HR_SPECIAL', 'EMERGENCY_OVERRIDE', 'STRATEGIC'],
        createdAt: new Date('2020-04-01'),
        updatedAt: new Date('2024-01-01'),
        children: [
          // Level 11: 人財統括本部 統括管理部門長（レビュー権限）
          {
            id: 'hr_general_manager',
            name: '人財統括本部 統括管理部門長（レビュー権限）',
            level: PermissionLevel.LEVEL_11,
            department: '人財統括本部',
            facility: '本部',
            isActive: true,
            budgetLimit: 30000000, // 3000万円
            approvalAuthority: [
              'FACILITY_PROJECTS', 
              'HR_POLICY', 
              'BUDGET_ALLOCATION',
              'STRATEGIC_PROJECT_REVIEW',
              'HR_SPECIAL_REVIEW'
            ],
            hrSpecialAuthority: true,
            facilityScope: ['ALL'],
            approvalChainPosition: 3,
            specialCategories: ['HR_SPECIAL', 'STRATEGIC_REVIEW'],
            createdAt: new Date('2021-04-01'),
            updatedAt: new Date('2024-01-01'),
            children: [
              // Level 10: 人財統括本部 各部門長（特別プロジェクト承認）
              {
                id: 'hr_dept_head_1',
                name: '人財統括本部 教育研修部門長',
                level: PermissionLevel.LEVEL_10,
                department: '人財統括本部',
                facility: '本部',
                isActive: true,
                budgetLimit: 20000000, // 2000万円
                approvalAuthority: [
                  'DEPARTMENT_PROJECTS', 
                  'TRAINING_PROGRAMS', 
                  'CAREER_SUPPORT',
                  'HR_SPECIAL_PROJECTS',
                  'ORGANIZATION_PROJECTS'
                ],
                hrSpecialAuthority: true,
                multiApprovalRequired: true,
                facilityScope: ['ALL'],
                approvalChainPosition: 4,
                specialCategories: ['HR_SPECIAL', 'TRAINING'],
                createdAt: new Date('2021-07-01'),
                updatedAt: new Date('2024-01-01'),
                children: []
              },
              {
                id: 'hr_dept_head_2',
                name: '人財統括本部 人事政策部門長',
                level: PermissionLevel.LEVEL_10,
                department: '人財統括本部',
                facility: '本部',
                isActive: true,
                budgetLimit: 20000000, // 2000万円
                approvalAuthority: [
                  'DEPARTMENT_PROJECTS', 
                  'HR_POLICY', 
                  'RECRUITMENT',
                  'HR_SPECIAL_PROJECTS',
                  'ORGANIZATION_PROJECTS'
                ],
                hrSpecialAuthority: true,
                multiApprovalRequired: true,
                facilityScope: ['ALL'],
                approvalChainPosition: 4,
                specialCategories: ['HR_SPECIAL', 'POLICY'],
                createdAt: new Date('2021-08-01'),
                updatedAt: new Date('2024-01-01'),
                children: []
              },
              {
                id: 'hr_dept_head_3',
                name: '人財統括本部 労務管理部門長',
                level: PermissionLevel.LEVEL_10,
                department: '人財統括本部',
                facility: '本部',
                isActive: true,
                budgetLimit: 20000000, // 2000万円
                approvalAuthority: [
                  'DEPARTMENT_PROJECTS', 
                  'LABOR_MANAGEMENT', 
                  'COMPLIANCE',
                  'HR_SPECIAL_PROJECTS',
                  'ORGANIZATION_PROJECTS'
                ],
                hrSpecialAuthority: true,
                multiApprovalRequired: true,
                facilityScope: ['ALL'],
                approvalChainPosition: 4,
                specialCategories: ['HR_SPECIAL', 'LABOR'],
                createdAt: new Date('2021-09-01'),
                updatedAt: new Date('2024-01-01'),
                children: []
              }
            ]
          }
        ]
      },
      // Level 9: 施設レベル部長・本部長
      {
        id: 'medical_director',
        name: '医務部長',
        level: PermissionLevel.LEVEL_9,
        department: '医務部',
        facility: '小原病院本院',
        isActive: true,
        budgetLimit: 15000000, // 1500万円
        approvalAuthority: [
          'FACILITY_PROJECTS', 
          'MEDICAL_EQUIPMENT', 
          'DEPARTMENT_BUDGET',
          'ORGANIZATION_PROJECTS'
        ],
        facilityScope: ['小原病院本院'],
        approvalChainPosition: 5,
        specialCategories: ['MEDICAL'],
        createdAt: new Date('2020-04-01'),
        updatedAt: new Date('2024-01-01'),
        children: [
          // Level 4: 課長レベル（施設レベル承認権限）
          {
            id: 'nursing_manager',
            name: '看護部長',
            level: PermissionLevel.LEVEL_4,
            department: '看護部',
            facility: '小原病院本院',
            isActive: true,
            budgetLimit: 2000000, // 200万円（新マッピング対応）
            approvalAuthority: [
              'TEAM_PROJECTS', 
              'NURSING_BUDGET', 
              'STAFF_MANAGEMENT',
              'FACILITY_PROJECTS' // 施設レベル承認権限追加
            ],
            multiApprovalRequired: true, // 施設レベルでは複数承認が必要
            facilityScope: ['小原病院本院'],
            approvalChainPosition: 6,
            specialCategories: ['NURSING', 'FACILITY_MULTI'],
            createdAt: new Date('2020-05-01'),
            updatedAt: new Date('2024-01-01'),
            children: []
          },
          {
            id: 'medical_affairs_manager',
            name: '医事課長',
            level: PermissionLevel.LEVEL_4,
            department: '医事課',
            facility: '小原病院本院',
            isActive: true,
            budgetLimit: 2000000, // 200万円
            approvalAuthority: [
              'TEAM_PROJECTS', 
              'MEDICAL_AFFAIRS_BUDGET', 
              'ADMINISTRATIVE_MANAGEMENT',
              'FACILITY_PROJECTS'
            ],
            multiApprovalRequired: true,
            facilityScope: ['小原病院本院'],
            approvalChainPosition: 6,
            specialCategories: ['MEDICAL_AFFAIRS', 'FACILITY_MULTI'],
            createdAt: new Date('2020-05-01'),
            updatedAt: new Date('2024-01-01'),
            children: []
          },
          {
            id: 'pharmacy_manager',
            name: '薬剤部長',
            level: PermissionLevel.LEVEL_4,
            department: '薬剤部',
            facility: '小原病院本院',
            isActive: true,
            budgetLimit: 2000000, // 200万円
            approvalAuthority: [
              'TEAM_PROJECTS', 
              'PHARMACY_BUDGET', 
              'DRUG_MANAGEMENT',
              'FACILITY_PROJECTS'
            ],
            multiApprovalRequired: true,
            facilityScope: ['小原病院本院'],
            approvalChainPosition: 6,
            specialCategories: ['PHARMACY', 'FACILITY_MULTI'],
            createdAt: new Date('2020-05-01'),
            updatedAt: new Date('2024-01-01'),
            children: []
          }
        ]
      }
    ]
  }
];

// 拡張権限メトリクス
export const enhancedAuthorityMetrics: EnhancedAuthorityMetrics = {
  totalApprovals: 324,
  pendingApprovals: 18,
  approvedItems: 289,
  rejectedItems: 17,
  emergencyOverrides: 5,
  hrSpecialApprovals: 12,
  multiApprovalCases: 8,
  averageProcessingTime: 4.2,
  levelBreakdown: {
    [PermissionLevel.LEVEL_4]: {
      totalCases: 145,
      averageTime: 2.1,
      successRate: 0.92
    },
    [PermissionLevel.LEVEL_5]: {
      totalCases: 89,
      averageTime: 3.2,
      successRate: 0.88
    },
    [PermissionLevel.LEVEL_7]: {
      totalCases: 34,
      averageTime: 5.8,
      successRate: 0.85
    },
    [PermissionLevel.LEVEL_9]: {
      totalCases: 28,
      averageTime: 8.4,
      successRate: 0.82
    },
    [PermissionLevel.LEVEL_10]: {
      totalCases: 15,
      averageTime: 12.6,
      successRate: 0.87
    },
    [PermissionLevel.LEVEL_11]: {
      totalCases: 8,
      averageTime: 18.2,
      successRate: 0.75
    },
    [PermissionLevel.LEVEL_12]: {
      totalCases: 4,
      averageTime: 24.5,
      successRate: 1.0
    },
    [PermissionLevel.LEVEL_13]: {
      totalCases: 1,
      averageTime: 48.0,
      successRate: 1.0
    }
  }
};

// 重み調整リクエスト（13段階対応）
export const enhancedWeightAdjustmentRequests: EnhancedWeightAdjustmentRequest[] = [
  {
    id: 'weight_001',
    userId: 'staff_001',
    userName: '田中 花子',
    currentLevel: PermissionLevel.LEVEL_1,
    currentWeight: 1.0,
    requestedWeight: 1.2,
    reason: '夜勤業務での積極的な改善提案実績による',
    status: 'pending',
    submittedAt: new Date('2024-01-20T09:00:00'),
    approvalLevel: PermissionLevel.LEVEL_4
  },
  {
    id: 'weight_002',
    userId: 'supervisor_001',
    userName: '鈴木 美智子',
    currentLevel: PermissionLevel.LEVEL_2,
    currentWeight: 1.5,
    requestedWeight: 1.8,
    reason: 'チーム内の業務改善成果と指導力向上',
    status: 'approved',
    submittedAt: new Date('2024-01-18T14:30:00'),
    reviewedBy: 'facility_head_002',
    reviewedAt: new Date('2024-01-19T16:00:00'),
    approvalLevel: PermissionLevel.LEVEL_4
  }
];

// 緊急オーバーライドケース
export const emergencyOverrideCases: EmergencyOverrideCase[] = [
  {
    id: 'emergency_001',
    initiatedBy: 'ceo_001',
    initiatorLevel: PermissionLevel.LEVEL_12,
    projectId: 'strategic_001',
    projectTitle: '地域医療連携ネットワーク構築',
    reason: '新型感染症対応のため地域医療連携を緊急強化する必要がある',
    status: 'approved',
    overrideLevel: PermissionLevel.LEVEL_12,
    timestamp: new Date('2024-01-15T08:00:00'),
    approvedBy: 'chairman_001',
    urgencyLevel: 'CRITICAL'
  },
  {
    id: 'emergency_002',
    initiatedBy: 'ceo_001',
    initiatorLevel: PermissionLevel.LEVEL_12,
    projectId: 'facility_001',
    projectTitle: '病院全体の電子カルテシステム更新',
    reason: 'サイバーセキュリティ対策強化のため緊急システム更新が必要',
    status: 'pending',
    overrideLevel: PermissionLevel.LEVEL_12,
    timestamp: new Date('2024-01-22T10:30:00'),
    urgencyLevel: 'HIGH'
  }
];

// HR特別承認ケース
export const hrSpecialApprovalCases: HRSpecialApprovalCase[] = [
  {
    id: 'hr_special_001',
    category: 'interview-system',
    projectId: 'hr_special_001',
    projectTitle: '全職員キャリア面談システム導入',
    budgetAmount: 4500000,
    approvalStage: 'ALL_HR_DEPT_HEADS_APPROVAL',
    requiredApprovers: ['hr_dept_head_001', 'hr_dept_head_002', 'hr_dept_head_003'],
    currentApprovers: ['hr_dept_head_001', 'hr_dept_head_002'],
    status: 'in_progress',
    initiatedAt: new Date('2024-01-10T09:00:00')
  },
  {
    id: 'hr_special_002',
    category: 'training-career',
    projectId: 'hr_special_002',
    projectTitle: '新人研修プログラム体系化',
    budgetAmount: 2800000,
    approvalStage: 'APPROVAL_COMPLETED',
    requiredApprovers: ['hr_dept_head_001', 'hr_general_manager_001', 'ceo_001'],
    currentApprovers: ['hr_dept_head_001', 'hr_general_manager_001', 'ceo_001'],
    status: 'completed',
    initiatedAt: new Date('2024-01-05T10:00:00'),
    completedAt: new Date('2024-01-27T16:30:00')
  }
];

export default {
  enhancedAuthorityHierarchy,
  enhancedAuthorityMetrics,
  enhancedWeightAdjustmentRequests,
  emergencyOverrideCases,
  hrSpecialApprovalCases
};