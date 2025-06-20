import { DemoUser } from './types';

// 権限管理用ユーザーデータ（users.tsから参照）
export const authorityUsers: DemoUser[] = [
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
  }
];

export default authorityUsers;