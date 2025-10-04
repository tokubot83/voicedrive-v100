import { AccountType } from '../../types';
import { DemoUser, ACCOUNT_TYPE_MAPPING, BUDGET_APPROVAL_LIMITS } from './types';

// Re-export shared types and constants for backward compatibility
export type { DemoUser } from './types';
export { ACCOUNT_TYPE_MAPPING, BUDGET_APPROVAL_LIMITS } from './types';

// 25レベル権限システム対応デモユーザー
export const demoUsers: DemoUser[] = [
  // ========== 一般職員層（経験年数別） ==========

  // レベル1: 新人（1年目）
  {
    id: 'level-1-staff',
    name: '新人 花子',
    username: 'shinnyuu-hanako',
    email: 'shinnyuu@tategami-hospital.jp',
    position: '看護師（1年目）',
    department: '医療療養病棟',
    permissionLevel: 1,
    accountType: 'NEW_STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2024-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: false
  },

  // レベル1.5: 新人看護師（リーダー可）
  {
    id: 'level-1.5-nurse-leader',
    name: '新人リーダー 麻衣',
    username: 'shinnyuu-leader-mai',
    email: 'shinnyuu-leader@tategami-hospital.jp',
    position: '看護師（1年目・リーダー可）',
    department: '医療療養病棟',
    permissionLevel: 1.5,
    accountType: 'NEW_NURSE_LEADER',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2024-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: true
  },

  // レベル2: 若手（2-3年目）
  {
    id: 'level-2-junior',
    name: '若手 太郎',
    username: 'wakate-taro',
    email: 'wakate@tategami-hospital.jp',
    position: '看護師（2年目）',
    department: '医療療養病棟',
    permissionLevel: 2,
    accountType: 'JUNIOR_STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2023-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: false
  },

  // レベル2.5: 若手看護師（リーダー可）
  {
    id: 'level-2.5-junior-leader',
    name: '若手リーダー 美咲',
    username: 'wakate-leader-misaki',
    email: 'wakate-leader@tategami-hospital.jp',
    position: '看護師（3年目・リーダー可）',
    department: '医療療養病棟',
    permissionLevel: 2.5,
    accountType: 'JUNIOR_NURSE_LEADER',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2022-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: true
  },

  // レベル3: 中堅（4-10年目）
  {
    id: 'level-3-intermediate',
    name: '中堅 恵子',
    username: 'chuuken-keiko',
    email: 'chuuken@tategami-hospital.jp',
    position: '看護師（5年目）',
    department: '医療療養病棟',
    permissionLevel: 3,
    accountType: 'INTERMEDIATE_STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: false
  },

  // レベル3.5: 中堅看護師（リーダー可）
  {
    id: 'level-3.5-intermediate-leader',
    name: '中堅リーダー 美香',
    username: 'chuuken-leader-mika',
    email: 'chuuken-leader@tategami-hospital.jp',
    position: '看護師（7年目・リーダー可）',
    department: '医療療養病棟',
    permissionLevel: 3.5,
    accountType: 'INTERMEDIATE_NURSE_LEADER',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2018-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: true
  },

  // レベル4: ベテラン（11年以上）
  {
    id: 'level-4-veteran',
    name: 'ベテラン 真理',
    username: 'veteran-mari',
    email: 'veteran@tategami-hospital.jp',
    position: '看護師（12年目）',
    department: '医療療養病棟',
    permissionLevel: 4,
    accountType: 'VETERAN_STAFF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2013-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: false
  },

  // レベル4.5: ベテラン看護師（リーダー可）
  {
    id: 'level-4.5-veteran-leader',
    name: 'ベテランリーダー 由美',
    username: 'veteran-leader-yumi',
    email: 'veteran-leader@tategami-hospital.jp',
    position: '看護師（15年目・リーダー可）',
    department: '医療療養病棟',
    permissionLevel: 4.5,
    accountType: 'VETERAN_NURSE_LEADER',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2010-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false,
    canPerformLeaderDuty: true
  },

  // ========== 役職層 ==========

  // レベル5: 副主任
  {
    id: 'level-5-deputy-chief',
    name: '副主任 千春',
    username: 'fuku-shunin-chiharu',
    email: 'fuku-shunin@tategami-hospital.jp',
    position: '副主任',
    department: '医療療養病棟',
    permissionLevel: 5,
    accountType: 'DEPUTY_CHIEF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2015-04-01'),
    directReports: 3,
    stakeholderCategory: 'management',
    parent_id: 'level-6-chief',
    organizationPath: ['level-13-president', 'level-8-manager', 'level-6-chief'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル6: 主任
  {
    id: 'level-6-chief',
    name: '主任 直美',
    username: 'shunin-naomi',
    email: 'shunin@tategami-hospital.jp',
    position: '主任',
    department: '医療療養病棟',
    permissionLevel: 6,
    accountType: 'CHIEF',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2012-04-01'),
    directReports: 8,
    stakeholderCategory: 'management',
    parent_id: 'level-8-manager',
    organizationPath: ['level-13-president', 'level-8-manager'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル7: 副師長
  {
    id: 'level-7-deputy-head',
    name: '副師長 愛子',
    username: 'fuku-shicho-aiko',
    email: 'fuku-shicho@tategami-hospital.jp',
    position: '副師長',
    department: '医療療養病棟',
    permissionLevel: 7,
    accountType: 'DEPUTY_HEAD',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2010-04-01'),
    directReports: 5,
    stakeholderCategory: 'management',
    parent_id: 'level-8-manager',
    organizationPath: ['level-13-president', 'level-8-manager'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル8: 師長
  {
    id: 'level-8-manager',
    name: '師長 美智子',
    username: 'shicho-michiko',
    email: 'shicho@tategami-hospital.jp',
    position: '医療療養病棟師長',
    department: '医療療養病棟',
    permissionLevel: 8,
    accountType: 'MANAGER',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2008-04-01'),
    directReports: 15,
    stakeholderCategory: 'management',
    parent_id: 'level-10-director',
    organizationPath: ['level-13-president', 'level-10-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル9: 副部長
  {
    id: 'level-9-deputy-director',
    name: '副部長 かおり',
    username: 'fuku-bucho-kaori',
    email: 'fuku-bucho@tategami-hospital.jp',
    position: '看護部副部長',
    department: '看護部',
    permissionLevel: 9,
    accountType: 'DEPUTY_DIRECTOR',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2005-04-01'),
    directReports: 20,
    stakeholderCategory: 'leadership',
    parent_id: 'level-10-director',
    organizationPath: ['level-13-president', 'level-10-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル10: 部長
  {
    id: 'level-10-director',
    name: '部長 理恵',
    username: 'bucho-rie',
    email: 'bucho@tategami-hospital.jp',
    position: '看護部長',
    department: '看護部',
    permissionLevel: 10,
    accountType: 'DIRECTOR',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2003-04-01'),
    directReports: 50,
    stakeholderCategory: 'leadership',
    parent_id: 'level-13-president',
    organizationPath: ['level-13-president'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル11: 事務長
  {
    id: 'level-11-admin-director',
    name: '事務長 隆志',
    username: 'jimucho-takashi',
    email: 'jimucho@tategami-hospital.jp',
    position: '事務長',
    department: '事務部',
    permissionLevel: 11,
    accountType: 'ADMINISTRATIVE_DIRECTOR',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2000-04-01'),
    directReports: 30,
    stakeholderCategory: 'leadership',
    parent_id: 'level-13-president',
    organizationPath: ['level-13-president'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル12: 副院長
  {
    id: 'level-12-vice-president',
    name: '副院長 直樹',
    username: 'fuku-incho-naoki',
    email: 'fuku-incho@tategami-hospital.jp',
    position: '副院長',
    department: '経営管理',
    permissionLevel: 12,
    accountType: 'VICE_PRESIDENT',
    facility_id: 'tategami_hospital',
    joinDate: new Date('1998-04-01'),
    directReports: 80,
    stakeholderCategory: 'leadership',
    parent_id: 'level-13-president',
    organizationPath: ['level-13-president'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル13: 院長
  {
    id: 'level-13-president',
    name: '院長 太郎',
    username: 'incho-taro',
    email: 'incho@tategami-hospital.jp',
    position: '院長',
    department: '経営管理',
    permissionLevel: 13,
    accountType: 'PRESIDENT',
    facility_id: 'tategami_hospital',
    joinDate: new Date('1995-04-01'),
    directReports: 200,
    stakeholderCategory: 'leadership',
    parent_id: 'level-18-board-member',
    organizationPath: ['level-18-board-member'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // ========== 法人人事部 ==========

  // レベル14: 人事部門員
  {
    id: 'level-14-hr-staff',
    name: '人事部門員 美香',
    username: 'jinji-staff-mika',
    email: 'jinji-staff@hr-headquarters.jp',
    position: '人事部門員',
    department: '人財統括本部',
    permissionLevel: 14,
    accountType: 'HR_STAFF',
    facility_id: 'hr_headquarters',
    joinDate: new Date('2020-04-01'),
    directReports: 0,
    stakeholderCategory: 'hr_staff',
    parent_id: 'level-15-hr-manager',
    organizationPath: ['level-18-board-member', 'level-17-strategic-manager', 'level-15-hr-manager'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル15: 人事各部門長
  {
    id: 'level-15-hr-manager',
    name: '人事部門長 信一',
    username: 'jinji-manager-shinichi',
    email: 'jinji-manager@hr-headquarters.jp',
    position: 'キャリア支援部門長',
    department: '人財統括本部',
    permissionLevel: 15,
    accountType: 'HR_MANAGER',
    facility_id: 'hr_headquarters',
    joinDate: new Date('2015-04-01'),
    directReports: 8,
    stakeholderCategory: 'hr_staff',
    parent_id: 'level-17-strategic-manager',
    organizationPath: ['level-18-board-member', 'level-17-strategic-manager'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル16: 戦略企画・統括管理部門員
  {
    id: 'level-16-strategic-staff',
    name: '戦略企画部門員 千代',
    username: 'senryaku-staff-chiyo',
    email: 'senryaku-staff@hr-headquarters.jp',
    position: '戦略企画部門員',
    department: '人財統括本部',
    permissionLevel: 16,
    accountType: 'STRATEGIC_PLANNING_STAFF',
    facility_id: 'hr_headquarters',
    joinDate: new Date('2017-04-01'),
    directReports: 0,
    stakeholderCategory: 'hr_staff',
    parent_id: 'level-17-strategic-manager',
    organizationPath: ['level-18-board-member', 'level-17-strategic-manager'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル17: 戦略企画・統括管理部門長
  {
    id: 'level-17-strategic-manager',
    name: '戦略企画部門長 節夫',
    username: 'senryaku-manager-setsuo',
    email: 'senryaku-manager@hr-headquarters.jp',
    position: '戦略企画・統括管理部門長',
    department: '人財統括本部',
    permissionLevel: 17,
    accountType: 'STRATEGIC_PLANNING_MANAGER',
    facility_id: 'hr_headquarters',
    joinDate: new Date('2010-04-01'),
    directReports: 25,
    stakeholderCategory: 'executive_staff',
    parent_id: 'level-18-board-member',
    organizationPath: ['level-18-board-member'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // ========== 最高経営層 ==========

  // レベル18: 理事長
  {
    id: 'level-18-board-member',
    name: '理事長 節夫',
    username: 'rijichou-setsuo',
    email: 'rijichou@kohara-kosei.jp',
    position: '理事長',
    department: '理事会',
    permissionLevel: 18,
    accountType: 'BOARD_MEMBER',
    facility_id: 'kosei_headquarters',
    joinDate: new Date('1990-04-01'),
    directReports: 300,
    stakeholderCategory: 'executive_staff',
    parent_id: null,
    organizationPath: [],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // ========== 特別権限（オプション） ==========

  // レベル97: 健診担当
  {
    id: 'level-97-health-checkup',
    name: '健診担当 あずさ',
    username: 'kenshin-azusa',
    email: 'kenshin@tategami-hospital.jp',
    position: '健診センター担当',
    department: '健診センター',
    permissionLevel: 97,
    accountType: 'HEALTH_CHECKUP',
    facility_id: 'tategami_hospital',
    joinDate: new Date('2018-04-01'),
    directReports: 2,
    stakeholderCategory: 'staff',
    parent_id: 'level-13-president',
    organizationPath: ['level-13-president'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル98: 産業医
  {
    id: 'level-98-occupational-physician',
    name: '産業医 健太',
    username: 'sangyoui-kenta',
    email: 'sangyoui@kohara-kosei.jp',
    position: '産業医',
    department: '健康管理室',
    permissionLevel: 98,
    accountType: 'OCCUPATIONAL_PHYSICIAN',
    facility_id: 'kosei_headquarters',
    joinDate: new Date('2015-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: null,
    organizationPath: [],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // レベル99: システム管理者
  {
    id: 'level-99-system-admin',
    name: 'システム管理者 徳留',
    username: 'sysadmin-tokudome',
    email: 'tokudome@voicedrive-system.jp',
    position: 'システム管理者',
    department: 'システム部',
    permissionLevel: 99,
    accountType: 'SYSTEM_ADMIN',
    facility_id: 'kosei_headquarters',
    joinDate: new Date('2020-01-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: null,
    organizationPath: [],
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

// Current logged-in demo user (default to レベル6: 主任)
export const getCurrentDemoUser = (): DemoUser => {
  return demoUsers.find(u => u.id === 'level-6-chief')!;
};

// Get demo user by permission level for testing
export const getDemoUserByLevel = (level: number): DemoUser | undefined => {
  return demoUsers.find(user => user.permissionLevel === level);
};
