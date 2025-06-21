// 13段階権限レベル対応の拡張ユーザーデモデータ - 新マッピング対応
import { DemoUser } from './types';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

export const enhancedDemoUsers: DemoUser[] = [
  // レベル1: 一般スタッフ
  {
    id: 'staff_001',
    name: '田中 花子',
    email: 'tanaka.hanako@koharahp.com',
    position: '看護師',
    department: '内科病棟',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_1,
    accountType: 'STAFF',
    stakeholderCategory: 'MEDICAL_STAFF',
    joinDate: new Date('2020-04-01'),
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'staff_002',
    name: '佐藤 太郎',
    email: 'sato.taro@koharahp.com',
    position: '薬剤師',
    department: '薬剤部',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_1,
    accountType: 'STAFF',
    stakeholderCategory: 'MEDICAL_STAFF',
    joinDate: new Date('2019-07-15'),
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル2: チーフ・主任（チームレベル承認権限）
  {
    id: 'supervisor_001',
    name: '鈴木 美智子',
    email: 'suzuki.michiko@koharahp.com',
    position: '看護主任',
    department: '内科病棟',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_2,
    accountType: 'SUPERVISOR',
    stakeholderCategory: 'MEDICAL_STAFF',
    joinDate: new Date('2015-03-01'),
    directReports: 8,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'supervisor_002',
    name: '高橋 健一',
    email: 'takahashi.kenichi@koharahp.com',
    position: '放射線技師長',
    department: '放射線科',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_2,
    accountType: 'SUPERVISOR',
    stakeholderCategory: 'MEDICAL_STAFF',
    joinDate: new Date('2014-09-10'),
    directReports: 5,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル3: 係長・マネージャー（部門レベル承認権限）
  {
    id: 'dept_head_001',
    name: '中村 雅子',
    email: 'nakamura.masako@koharahp.com',
    position: '看護師長',
    department: '内科病棟',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_3,
    accountType: 'DEPARTMENT_HEAD',
    stakeholderCategory: 'MANAGEMENT_STAFF',
    joinDate: new Date('2012-04-01'),
    directReports: 25,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'dept_head_002',
    name: '山田 博行',
    email: 'yamada.hiroyuki@koharahp.com',
    position: '事務長',
    department: '総務部',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_3,
    accountType: 'DEPARTMENT_HEAD',
    stakeholderCategory: 'ADMINISTRATIVE_STAFF',
    joinDate: new Date('2010-08-15'),
    directReports: 15,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル4: 課長（施設レベル承認権限）
  {
    id: 'facility_head_001',
    name: '渡辺 昌平',
    email: 'watanabe.shohei@koharahp.com',
    position: '医事課長',
    department: '医事課',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_4,
    accountType: 'FACILITY_HEAD',
    stakeholderCategory: 'MANAGEMENT_STAFF',
    joinDate: new Date('2008-03-01'),
    directReports: 30,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'facility_head_002',
    name: '林 真理子',
    email: 'hayashi.mariko@koharahp.com',
    position: '看護部長',
    department: '看護部',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_4,
    accountType: 'FACILITY_HEAD',
    stakeholderCategory: 'MANAGEMENT_STAFF',
    joinDate: new Date('2007-05-20'),
    directReports: 120,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル5: 人財統括本部 戦略企画・統括管理部門（法人レベル承認権限）
  {
    id: 'hr_strategic_001',
    name: '岡田 智子',
    email: 'okada.tomoko@koharahp.com',
    position: '人財統括本部 戦略企画・統括管理部門 主査',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_5,
    accountType: 'HR_STRATEGIC',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('2009-10-01'),
    directReports: 8,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'hr_strategic_002',
    name: '村上 大輔',
    email: 'murakami.daisuke@koharahp.com',
    position: '人財統括本部 戦略企画・統括管理部門 企画係長',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_5,
    accountType: 'HR_STRATEGIC',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('2011-04-01'),
    directReports: 6,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル6: 人財統括本部 キャリア支援部門員
  {
    id: 'career_staff_001',
    name: '石井 美香',
    email: 'ishii.mika@koharahp.com',
    position: '人財統括本部 キャリア支援部門 研修企画担当',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_6,
    accountType: 'CAREER_SUPPORT_STAFF',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('2013-07-01'),
    directReports: 4,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'career_staff_002',
    name: '森田 健太',
    email: 'morita.kenta@koharahp.com',
    position: '人財統括本部 キャリア支援部門 面談担当',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_6,
    accountType: 'CAREER_SUPPORT_STAFF',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('2014-02-15'),
    directReports: 3,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル7: 人財統括本部 キャリア支援部門長
  {
    id: 'career_head_001',
    name: '清水 恵子',
    email: 'shimizu.keiko@koharahp.com',
    position: '人財統括本部 キャリア支援部門長',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_7,
    accountType: 'CAREER_SUPPORT_HEAD',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('2006-04-01'),
    directReports: 12,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル8: 人財統括本部 統括管理部門長
  {
    id: 'hr_director_001',
    name: '加藤 正明',
    email: 'kato.masaaki@koharahp.com',
    position: '人財統括本部 統括管理部門長',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_8,
    accountType: 'HR_DIRECTOR',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('2003-10-01'),
    directReports: 25,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル9: 部長・本部長
  {
    id: 'director_001',
    name: '井上 孝司',
    email: 'inoue.takashi@koharahp.com',
    position: '内科部長',
    department: '内科',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_9,
    accountType: 'DIRECTOR',
    stakeholderCategory: 'MEDICAL_STAFF',
    joinDate: new Date('2000-04-01'),
    directReports: 40,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'director_002',
    name: '松本 由美',
    email: 'matsumoto.yumi@koharahp.com',
    position: '薬剤部長',
    department: '薬剤部',
    facility: '小原病院本院',
    permissionLevel: PermissionLevel.LEVEL_9,
    accountType: 'DIRECTOR',
    stakeholderCategory: 'MEDICAL_STAFF',
    joinDate: new Date('2001-09-15'),
    directReports: 35,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル10: 人財統括本部 各部門長（特別プロジェクト承認）
  {
    id: 'hr_dept_head_001',
    name: '橋本 信一',
    email: 'hashimoto.shinichi@koharahp.com',
    position: '人財統括本部 教育研修部門長',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_10,
    accountType: 'HR_DEPARTMENT_HEAD',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('1998-04-01'),
    directReports: 18,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'hr_dept_head_002',
    name: '野口 晶子',
    email: 'noguchi.akiko@koharahp.com',
    position: '人財統括本部 人事政策部門長',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_10,
    accountType: 'HR_DEPARTMENT_HEAD',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('1999-07-10'),
    directReports: 22,
    profileImage: '/default-avatar.svg',
    isActive: true
  },
  {
    id: 'hr_dept_head_003',
    name: '福田 雅人',
    email: 'fukuda.masato@koharahp.com',
    position: '人財統括本部 労務管理部門長',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_10,
    accountType: 'HR_DEPARTMENT_HEAD',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('1997-03-15'),
    directReports: 15,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル11: 人財統括本部 統括管理部門長（レビュー権限）
  {
    id: 'hr_general_manager_001',
    name: '藤田 隆志',
    email: 'fujita.takashi@koharahp.com',
    position: '人財統括本部 統括管理部門長（レビュー権限）',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_11,
    accountType: 'HR_GENERAL_MANAGER',
    stakeholderCategory: 'HR_STAFF',
    joinDate: new Date('1995-04-01'),
    directReports: 60,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル12: 人財統括本部 トップ（緊急オーバーライド権限）
  {
    id: 'ceo_001',
    name: '小原 直樹',
    email: 'kohara.naoki@koharahp.com',
    position: '人財統括本部 トップ',
    department: '人財統括本部',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_12,
    accountType: 'CEO',
    stakeholderCategory: 'EXECUTIVE_STAFF',
    joinDate: new Date('1990-04-01'),
    directReports: 150,
    profileImage: '/default-avatar.svg',
    isActive: true
  },

  // レベル13: 理事長（最終承認権限）
  {
    id: 'chairman_001',
    name: '小原 節夫',
    email: 'kohara.setsuo@koharahp.com',
    position: '理事長',
    department: '理事会',
    facility: '本部',
    permissionLevel: PermissionLevel.LEVEL_13,
    accountType: 'CHAIRMAN',
    stakeholderCategory: 'EXECUTIVE_STAFF',
    joinDate: new Date('1985-04-01'),
    directReports: 200,
    profileImage: '/default-avatar.svg',
    isActive: true
  }
];

// 施設別のユーザー分布
export const facilityUserDistribution = {
  '小原病院本院': {
    totalUsers: 250,
    levelDistribution: {
      [PermissionLevel.LEVEL_1]: 120,  // 一般スタッフ
      [PermissionLevel.LEVEL_2]: 40,   // チーフ・主任
      [PermissionLevel.LEVEL_3]: 25,   // 係長・マネージャー
      [PermissionLevel.LEVEL_4]: 15,   // 課長
      [PermissionLevel.LEVEL_5]: 2,    // 人財戦略
      [PermissionLevel.LEVEL_6]: 2,    // キャリア支援員
      [PermissionLevel.LEVEL_7]: 1,    // キャリア支援部門長
      [PermissionLevel.LEVEL_8]: 1,    // 人財統括部門長
      [PermissionLevel.LEVEL_9]: 4     // 部長・本部長
    }
  },
  '小原病院分院': {
    totalUsers: 150,
    levelDistribution: {
      [PermissionLevel.LEVEL_1]: 80,
      [PermissionLevel.LEVEL_2]: 25,
      [PermissionLevel.LEVEL_3]: 15,
      [PermissionLevel.LEVEL_4]: 8,
      [PermissionLevel.LEVEL_9]: 2
    }
  },
  '人財統括本部': {
    totalUsers: 50,
    levelDistribution: {
      [PermissionLevel.LEVEL_5]: 8,    // 戦略企画
      [PermissionLevel.LEVEL_6]: 6,    // キャリア支援員
      [PermissionLevel.LEVEL_7]: 3,    // キャリア支援部門長
      [PermissionLevel.LEVEL_8]: 2,    // 統括管理部門長
      [PermissionLevel.LEVEL_10]: 5,   // 各部門長
      [PermissionLevel.LEVEL_11]: 1,   // 統括管理部門長（レビュー）
      [PermissionLevel.LEVEL_12]: 1,   // トップ
      [PermissionLevel.LEVEL_13]: 1    // 理事長
    }
  }
};

export default enhancedDemoUsers;