import { DemoUser } from './types';

// 階層構造のユーザーデータ（users.tsから参照）
export const hierarchicalUsers: DemoUser[] = [
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
  },
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
  }
];

export default hierarchicalUsers;