import { AccountType } from '../../types';
import { DemoUser, ACCOUNT_TYPE_MAPPING, BUDGET_APPROVAL_LIMITS } from './types';

// Re-export shared types and constants for backward compatibility
export type { DemoUser } from './types';
export { ACCOUNT_TYPE_MAPPING, BUDGET_APPROVAL_LIMITS } from './types';

// 立神リハビリテーション温泉病院のデモユーザー
export const demoUsers: DemoUser[] = [
  // レベル4: 院長
  {
    id: 'user-1',
    name: '山田 太郎',
    username: 'yamada-taro',
    email: 'yamada@tategami-hospital.jp',
    position: '院長',
    department: '経営管理',
    permissionLevel: 4,
    accountType: 'FACILITY_HEAD',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2015-04-01'),
    directReports: 3,
    stakeholderCategory: 'leadership',
    parent_id: null,
    organizationPath: [],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル4: 総師長
  {
    id: 'user-2',
    name: '佐藤 花子',
    username: 'sato-hanako',
    email: 'sato@tategami-hospital.jp',
    position: '総師長',
    department: '看護部',
    permissionLevel: 4,
    accountType: 'FACILITY_HEAD',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2016-06-01'),
    directReports: 2,
    stakeholderCategory: 'leadership',
    parent_id: 'user-1',
    organizationPath: ['user-1'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル3: 医療療養病棟師長
  {
    id: 'user-3',
    name: '鈴木 美香',
    username: 'suzuki-mika',
    email: 'suzuki@tategami-hospital.jp',
    position: '医療療養病棟師長',
    department: '医療療養病棟',
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2018-04-01'),
    directReports: 2,
    stakeholderCategory: 'management',
    parent_id: 'user-2',
    organizationPath: ['user-1', 'user-2'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル2: 看護主任
  {
    id: 'user-4',
    name: '田中 恵子',
    username: 'tanaka-keiko',
    email: 'tanaka@tategami-hospital.jp',
    position: '看護主任',
    department: '医療療養病棟',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2019-07-01'),
    directReports: 5,
    stakeholderCategory: 'staff',
    parent_id: 'user-3',
    organizationPath: ['user-1', 'user-2', 'user-3'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル2: 介護看護補助者主任
  {
    id: 'user-5',
    name: '高橋 真理',
    username: 'takahashi-mari',
    email: 'takahashi@tategami-hospital.jp',
    position: '介護看護補助者主任',
    department: '医療療養病棟',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2019-09-01'),
    directReports: 8,
    stakeholderCategory: 'staff',
    parent_id: 'user-3',
    organizationPath: ['user-1', 'user-2', 'user-3'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 看護師（常勤）
  {
    id: 'user-6',
    name: '伊藤 麻衣',
    username: 'ito-mai',
    email: 'ito@tategami-hospital.jp',
    position: '看護師',
    department: '医療療養病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'user-4',
    organizationPath: ['user-1', 'user-2', 'user-3', 'user-4'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 看護師（非常勤）
  {
    id: 'user-7',
    name: '渡辺 由美',
    username: 'watanabe-yumi',
    email: 'watanabe@tategami-hospital.jp',
    position: '看護師（非常勤）',
    department: '医療療養病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2021-10-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'user-4',
    organizationPath: ['user-1', 'user-2', 'user-3', 'user-4'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 介護看護補助者（常勤）
  {
    id: 'user-8',
    name: '中村 さゆり',
    username: 'nakamura-sayuri',
    email: 'nakamura@tategami-hospital.jp',
    position: '介護看護補助者',
    department: '医療療養病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2021-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'user-5',
    organizationPath: ['user-1', 'user-2', 'user-3', 'user-5'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 介護看護補助者（非常勤）
  {
    id: 'user-9',
    name: '小林 千恵',
    username: 'kobayashi-chie',
    email: 'kobayashi@tategami-hospital.jp',
    position: '介護看護補助者（非常勤）',
    department: '医療療養病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2022-06-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'user-5',
    organizationPath: ['user-1', 'user-2', 'user-3', 'user-5'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: リハビリスタッフ
  {
    id: 'user-10',
    name: '加藤 健太',
    username: 'kato-kenta',
    email: 'kato@tategami-hospital.jp',
    position: '理学療法士',
    department: '医療療養病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2020-09-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'user-3',
    organizationPath: ['user-1', 'user-2', 'user-3'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // リハビリテーション部長（レベル4）
  {
    id: 'user-rehab-head',
    name: '松本 隆一',
    username: 'matsumoto-ryuichi',
    email: 'matsumoto@tategami-hospital.jp',
    position: 'リハビリテーション部長',
    department: 'リハビリテーション部',
    permissionLevel: 4,
    accountType: 'DEPARTMENT_HEAD',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2017-04-01'),
    directReports: 6,
    stakeholderCategory: 'leadership',
    parent_id: 'user-1',
    organizationPath: ['user-1'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // リハビリテーション部理学療法士（レベル1）
  {
    id: 'user-rehab-pt',
    name: '木村 誠',
    username: 'kimura-makoto',
    email: 'kimura@tategami-hospital.jp',
    position: '理学療法士',
    department: 'リハビリテーション部',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'user-rehab-head',
    organizationPath: ['user-1', 'user-rehab-head'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  }
];

// Helper function to get user by ID
export const getDemoUserById = (id: string): DemoUser | undefined => {
  return demoUsers.find(user => user.id === id);
};

// Helper function to get users by permission level
export const getDemoUsersByPermissionLevel = (level: number): DemoUser[] => {
  return demoUsers.filter(user => user.permissionLevel === level);
};

// Helper function to get users by department
export const getDemoUsersByDepartment = (department: string): DemoUser[] => {
  return demoUsers.filter(user => user.department === department);
};

// Helper function to get users by account type
export const getDemoUsersByAccountType = (accountType: AccountType): DemoUser[] => {
  return demoUsers.filter(user => user.accountType === accountType);
};

// Helper function to get users by facility
export const getDemoUsersByFacility = (facilityId: string): DemoUser[] => {
  return demoUsers.filter(user => user.facility_id === facilityId);
};

// Helper function to get direct reports
export const getDirectReports = (userId: string): DemoUser[] => {
  return demoUsers.filter(user => user.parent_id === userId);
};

// Helper function to get user's manager
export const getUserManager = (userId: string): DemoUser | undefined => {
  const user = getDemoUserById(userId);
  if (!user || !user.parent_id) return undefined;
  return getDemoUserById(user.parent_id);
};

// Helper function to get full hierarchy path
export const getUserHierarchyPath = (userId: string): DemoUser[] => {
  const user = getDemoUserById(userId);
  if (!user || !user.organizationPath) return [];
  
  return user.organizationPath
    .map(id => getDemoUserById(id))
    .filter((u): u is DemoUser => u !== undefined);
};

// Current logged-in demo user (default to 看護師)
export const getCurrentDemoUser = (): DemoUser => {
  return demoUsers[5]; // user-6: 伊藤 麻衣（看護師）
};