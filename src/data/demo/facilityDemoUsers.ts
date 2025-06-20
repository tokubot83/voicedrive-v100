import { DemoUser } from './types';

// 施設別のユーザーデータ
export const facilityDemoUsers: DemoUser[] = [
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
  }
];

export default facilityDemoUsers;