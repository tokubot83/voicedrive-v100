// Demo users with specific authority management roles

import { HierarchicalUser, StakeholderCategory } from '../../types';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

export const authorityDemoUsers: HierarchicalUser[] = [
  // HR Director - Level 6 (Supervises all weight adjustments)
  {
    id: 'hr_director_001',
    name: '佐藤 美智子',
    department: 'Human Resources',
    role: 'HR Director',
    accountType: 'HR_DIRECTOR',
    permissionLevel: PermissionLevel.LEVEL_6,
    facility_id: 'kohara_hospital',
    department_id: 'hr_headquarters',
    budgetApprovalLimit: 10000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // Department Heads - Level 5 (Can request weight adjustments)
  {
    id: 'dept_head_hr_001',
    name: '田中 健一',
    department: 'Human Development',
    role: 'Human Development Head',
    accountType: 'HR_DEPARTMENT_HEAD',
    permissionLevel: PermissionLevel.LEVEL_5,
    facility_id: 'kohara_hospital',
    department_id: 'human_development',
    parent_id: 'hr_director_001',
    budgetApprovalLimit: 5000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },
  {
    id: 'dept_head_career_001',
    name: '山田 真理',
    department: 'Career Support',
    role: 'Career Support Head',
    accountType: 'HR_DEPARTMENT_HEAD',
    permissionLevel: PermissionLevel.LEVEL_5,
    facility_id: 'kohara_hospital',
    department_id: 'career_support',
    parent_id: 'hr_director_001',
    budgetApprovalLimit: 5000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },
  {
    id: 'dept_head_innovation_001',
    name: '鈴木 太郎',
    department: 'Business Innovation',
    role: 'Business Innovation Head',
    accountType: 'HR_DEPARTMENT_HEAD',
    permissionLevel: PermissionLevel.LEVEL_5,
    facility_id: 'kohara_hospital',
    department_id: 'business_innovation',
    parent_id: 'hr_director_001',
    budgetApprovalLimit: 5000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // Facility Heads - Level 4 (Emergency authority)
  {
    id: 'facility_head_001',
    name: '高橋 次郎',
    department: 'Kohara Hospital',
    role: 'Facility Head',
    accountType: 'FACILITY_HEAD',
    permissionLevel: PermissionLevel.LEVEL_4,
    facility_id: 'kohara_hospital',
    department_id: 'facility_management',
    parent_id: 'director_001',
    budgetApprovalLimit: 2000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // Section Chiefs for approvals
  {
    id: 'section_chief_001',
    name: '伊藤 和子',
    department: 'Operations',
    role: 'Section Chief',
    accountType: 'FACILITY_HEAD',
    permissionLevel: PermissionLevel.LEVEL_4,
    facility_id: 'kohara_hospital',
    department_id: 'operations',
    parent_id: 'hr_dept_head_001',
    budgetApprovalLimit: 2000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // Managers for approvals - Level 3
  {
    id: 'manager_001',
    name: '小林 修',
    department: 'Operations',
    role: 'Manager',
    accountType: 'DEPARTMENT_HEAD',
    permissionLevel: PermissionLevel.LEVEL_3,
    facility_id: 'kohara_hospital',
    department_id: 'operations',
    parent_id: 'section_chief_001',
    budgetApprovalLimit: 500000,
    stakeholderCategory: 'management' as StakeholderCategory
  },
  {
    id: 'manager_002',
    name: '渡辺 美穂',
    department: 'Quality Control',
    role: 'Manager',
    accountType: 'DEPARTMENT_HEAD',
    permissionLevel: PermissionLevel.LEVEL_3,
    facility_id: 'kohara_hospital',
    department_id: 'quality_control',
    parent_id: 'section_chief_001',
    budgetApprovalLimit: 500000,
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // Chiefs for approvals - Level 2
  {
    id: 'chief_001',
    name: '中村 大輔',
    department: 'Operations',
    role: 'Chief',
    accountType: 'SUPERVISOR',
    permissionLevel: PermissionLevel.LEVEL_2,
    facility_id: 'kohara_hospital',
    department_id: 'operations',
    parent_id: 'manager_001',
    budgetApprovalLimit: 100000,
    stakeholderCategory: 'frontline' as StakeholderCategory
  },

  // Directors - Level 7
  {
    id: 'director_001',
    name: '藤井 隆',
    department: 'Executive',
    role: 'Director',
    accountType: 'EXECUTIVE_SECRETARY',
    permissionLevel: PermissionLevel.LEVEL_7,
    facility_id: 'kohara_hospital',
    department_id: 'executive',
    parent_id: 'executive_001',
    budgetApprovalLimit: 20000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // Executive - Level 8
  {
    id: 'executive_001',
    name: '武田 信一',
    department: 'Executive',
    role: 'Chairman',
    accountType: 'CHAIRMAN',
    permissionLevel: PermissionLevel.LEVEL_8,
    facility_id: 'kohara_hospital',
    department_id: 'executive',
    budgetApprovalLimit: undefined, // Unlimited
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // HR General Manager - Level 6
  {
    id: 'hr_gm_001',
    name: '岡田 洋子',
    department: 'Human Resources',
    role: 'HR General Manager',
    accountType: 'HR_DIRECTOR',
    permissionLevel: PermissionLevel.LEVEL_6,
    facility_id: 'kohara_hospital',
    department_id: 'hr_headquarters',
    parent_id: 'director_001',
    budgetApprovalLimit: 10000000,
    stakeholderCategory: 'management' as StakeholderCategory
  },

  // Department heads for cross-department reviews
  {
    id: 'dept_head_training_001',
    name: '森田 健',
    department: 'Training',
    role: 'Training Department Head',
    accountType: 'DEPARTMENT_HEAD',
    permissionLevel: PermissionLevel.LEVEL_3,
    facility_id: 'kohara_hospital',
    department_id: 'training',
    parent_id: 'hr_dept_head_001',
    budgetApprovalLimit: 500000,
    stakeholderCategory: 'management' as StakeholderCategory
  }
];

// Helper function to get authority demo user by ID
export const getAuthorityDemoUserById = (id: string): HierarchicalUser | undefined => {
  return authorityDemoUsers.find(user => user.id === id);
};