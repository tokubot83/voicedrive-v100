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
  },

  // === 小原病院看護部デモアカウント ===
  // レベル4: 看護部長
  {
    id: 'kohara-nursing-director',
    name: '田中 美津子',
    username: 'tanaka-mitsuko',
    email: 'tanaka@kohara-hospital.jp',
    position: '看護部長',
    department: '看護部',
    permissionLevel: 4,
    accountType: 'FACILITY_HEAD',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2018-04-01'),
    directReports: 8,
    stakeholderCategory: 'leadership',
    parent_id: null,
    organizationPath: [],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル4: 看護副部長（教育師長）
  {
    id: 'kohara-education-director',
    name: '佐藤 恵子',
    username: 'sato-keiko',
    email: 'sato@kohara-hospital.jp',
    position: '看護副部長（教育師長）',
    department: '看護部',
    permissionLevel: 4,
    accountType: 'FACILITY_HEAD',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2019-04-01'),
    directReports: 2,
    stakeholderCategory: 'leadership',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル3: 看護師長
  {
    id: 'kohara-head-nurse',
    name: '山田 花子',
    username: 'yamada-hanako',
    email: 'yamada@kohara-hospital.jp',
    position: '看護師長',
    department: '看護部',
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 1,
    stakeholderCategory: 'management',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル2: 主任看護師
  {
    id: 'kohara-supervisor-nurse',
    name: '鈴木 直美',
    username: 'suzuki-naomi',
    email: 'suzuki@kohara-hospital.jp',
    position: '主任看護師',
    department: '看護部',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2021-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-head-nurse',
    organizationPath: ['kohara-nursing-director', 'kohara-head-nurse'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // === 外来 ===
  // レベル3: 外来師長
  {
    id: 'kohara-outpatient-head',
    name: '高橋 愛子',
    username: 'takahashi-aiko',
    email: 'takahashi@kohara-hospital.jp',
    position: '外来師長',
    department: '外来',
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2019-04-01'),
    directReports: 2,
    stakeholderCategory: 'management',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル2: 外来主任
  {
    id: 'kohara-outpatient-supervisor',
    name: '伊藤 雅子',
    username: 'ito-masako',
    email: 'ito@kohara-hospital.jp',
    position: '外来主任',
    department: '外来',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 1,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-outpatient-head',
    organizationPath: ['kohara-nursing-director', 'kohara-outpatient-head'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 外来看護師
  {
    id: 'kohara-outpatient-nurse',
    name: '渡辺 真由美',
    username: 'watanabe-mayumi',
    email: 'watanabe@kohara-hospital.jp',
    position: '外来看護師',
    department: '外来',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2021-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-outpatient-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-outpatient-head', 'kohara-outpatient-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // === 3階病棟 ===
  // レベル3: 3階病棟師長
  {
    id: 'kohara-3f-head',
    name: '加藤 理恵',
    username: 'kato-rie',
    email: 'kato@kohara-hospital.jp',
    position: '3階病棟師長',
    department: '3階病棟',
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2019-04-01'),
    directReports: 3,
    stakeholderCategory: 'management',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル2: 3階病棟主任
  {
    id: 'kohara-3f-supervisor',
    name: '佐々木 美紀',
    username: 'sasaki-miki',
    email: 'sasaki@kohara-hospital.jp',
    position: '3階病棟主任',
    department: '3階病棟',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 2,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-3f-head',
    organizationPath: ['kohara-nursing-director', 'kohara-3f-head'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 3階病棟看護師
  {
    id: 'kohara-3f-nurse',
    name: '小林 由紀子',
    username: 'kobayashi-yukiko',
    email: 'kobayashi@kohara-hospital.jp',
    position: '3階病棟看護師',
    department: '3階病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2021-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-3f-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-3f-head', 'kohara-3f-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 3階病棟看護補助者
  {
    id: 'kohara-3f-assistant',
    name: '中村 千春',
    username: 'nakamura-chiharu',
    email: 'nakamura@kohara-hospital.jp',
    position: '3階病棟看護補助者',
    department: '3階病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2022-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-3f-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-3f-head', 'kohara-3f-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // === 4階病棟 ===
  // レベル3: 4階病棟師長
  {
    id: 'kohara-4f-head',
    name: '後藤 美智子',
    username: 'goto-michiko',
    email: 'goto@kohara-hospital.jp',
    position: '4階病棟師長',
    department: '4階病棟',
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2018-04-01'),
    directReports: 3,
    stakeholderCategory: 'management',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル2: 4階病棟主任
  {
    id: 'kohara-4f-supervisor',
    name: '山口 里美',
    username: 'yamaguchi-satomi',
    email: 'yamaguchi@kohara-hospital.jp',
    position: '4階病棟主任',
    department: '4階病棟',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 2,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-4f-head',
    organizationPath: ['kohara-nursing-director', 'kohara-4f-head'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 4階病棟看護師
  {
    id: 'kohara-4f-nurse',
    name: '松本 典子',
    username: 'matsumoto-noriko',
    email: 'matsumoto@kohara-hospital.jp',
    position: '4階病棟看護師',
    department: '4階病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2021-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-4f-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-4f-head', 'kohara-4f-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 4階病棟看護補助者
  {
    id: 'kohara-4f-assistant',
    name: '木村 信子',
    username: 'kimura-nobuko',
    email: 'kimura@kohara-hospital.jp',
    position: '4階病棟看護補助者',
    department: '4階病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2022-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-4f-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-4f-head', 'kohara-4f-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // === 5階病棟 ===
  // レベル3: 5階病棟師長
  {
    id: 'kohara-5f-head',
    name: '斉藤 かおり',
    username: 'saito-kaori',
    email: 'saito@kohara-hospital.jp',
    position: '5階病棟師長',
    department: '5階病棟',
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2019-04-01'),
    directReports: 3,
    stakeholderCategory: 'management',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル2: 5階病棟主任
  {
    id: 'kohara-5f-supervisor',
    name: '長谷川 純子',
    username: 'hasegawa-junko',
    email: 'hasegawa@kohara-hospital.jp',
    position: '5階病棟主任',
    department: '5階病棟',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 2,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-5f-head',
    organizationPath: ['kohara-nursing-director', 'kohara-5f-head'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 5階病棟看護師
  {
    id: 'kohara-5f-nurse',
    name: '森田 聡美',
    username: 'morita-satomi',
    email: 'morita@kohara-hospital.jp',
    position: '5階病棟看護師',
    department: '5階病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2021-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-5f-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-5f-head', 'kohara-5f-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 5階病棟看護補助者
  {
    id: 'kohara-5f-assistant',
    name: '野口 真理',
    username: 'noguchi-mari',
    email: 'noguchi@kohara-hospital.jp',
    position: '5階病棟看護補助者',
    department: '5階病棟',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2022-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-5f-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-5f-head', 'kohara-5f-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // === 中材手術室 ===
  // レベル2: 手術室主任
  {
    id: 'kohara-or-supervisor',
    name: '石井 優子',
    username: 'ishii-yuko',
    email: 'ishii@kohara-hospital.jp',
    position: '手術室主任',
    department: '中材手術室',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2019-04-01'),
    directReports: 1,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 手術室看護師
  {
    id: 'kohara-or-nurse',
    name: '田村 美香',
    username: 'tamura-mika',
    email: 'tamura@kohara-hospital.jp',
    position: '手術室看護師',
    department: '中材手術室',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2020-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-or-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-or-supervisor'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },

  // === 人工透析室 ===
  // レベル2: 透析室主任
  {
    id: 'kohara-dialysis-supervisor',
    name: '藤田 千代',
    username: 'fujita-chiyo',
    email: 'fujita@kohara-hospital.jp',
    position: '透析室主任',
    department: '人工透析室',
    permissionLevel: 2,
    accountType: 'SUPERVISOR',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2018-04-01'),
    directReports: 1,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-nursing-director',
    organizationPath: ['kohara-nursing-director'],
    avatar: '/api/placeholder/150/150',
    isAnonymous: false
  },
  // レベル1: 透析看護師
  {
    id: 'kohara-dialysis-nurse',
    name: '西田 あずさ',
    username: 'nishida-azusa',
    email: 'nishida@kohara-hospital.jp',
    position: '透析看護師',
    department: '人工透析室',
    permissionLevel: 1,
    accountType: 'STAFF',
    facility_id: 'kohara_hospital',
    joinDate: new Date('2021-04-01'),
    directReports: 0,
    stakeholderCategory: 'staff',
    parent_id: 'kohara-dialysis-supervisor',
    organizationPath: ['kohara-nursing-director', 'kohara-dialysis-supervisor'],
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