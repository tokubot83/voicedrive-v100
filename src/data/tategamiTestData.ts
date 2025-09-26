/**
 * 立神リハビリテーション温泉病院 テストデータ
 * Phase 3 内部テスト用
 */

import { DemoStaffData } from './demoStaffData';
import { PermissionLevel } from '../permissions/types/PermissionTypes';

export const tategamiTestStaffData: DemoStaffData[] = [
  // 経営層
  {
    staffId: 'TATE_001',
    name: '立神 院太郎',
    email: 'incho@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '経営管理',
    position: '院長',
    profession: '医師',
    experienceYears: 25,
    accountLevel: PermissionLevel.LEVEL_13,
    profileImage: '/images/avatar/default.png'
  },

  // 事務部門
  {
    staffId: 'TATE_002',
    name: '事務 長男',
    email: 'jimucho@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '事務部門',
    position: '事務長',
    profession: '事務職',
    experienceYears: 20,
    accountLevel: PermissionLevel.LEVEL_11,
    profileImage: '/images/avatar/default.png'
  },

  // 看護部門
  {
    staffId: 'TATE_003',
    name: '総師 花子',
    email: 'soshicho@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '看護部門',
    position: '総師長',
    profession: '看護師',
    experienceYears: 22,
    accountLevel: PermissionLevel.LEVEL_10,
    profileImage: '/images/avatar/default.png'
  },

  {
    staffId: 'TATE_004',
    name: '副総師 美代子',
    email: 'fukusoshicho@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '看護部門',
    position: '副総師長',
    profession: '看護師',
    experienceYears: 18,
    accountLevel: PermissionLevel.LEVEL_9,
    profileImage: '/images/avatar/default.png'
  },

  {
    staffId: 'TATE_005',
    name: '病棟 師子',
    email: 'shicho@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '第１病棟',
    position: '師長',
    profession: '看護師',
    experienceYears: 15,
    accountLevel: PermissionLevel.LEVEL_7,
    profileImage: '/images/avatar/default.png'
  },

  {
    staffId: 'TATE_006',
    name: '看護 主任子',
    email: 'kango-shunin@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '第１病棟',
    position: '主任',
    profession: '看護師',
    experienceYears: 10,
    accountLevel: PermissionLevel.LEVEL_5,
    canPerformLeaderDuty: true,
    profileImage: '/images/avatar/default.png'
  },

  // 診療技術部 - 統括主任（レベル7に更新）
  {
    staffId: 'TATE_007',
    name: '統括 主太',
    email: 'tokatsu@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '診療技術部',
    position: '統括主任',
    profession: 'リハビリ技師',
    experienceYears: 17,
    accountLevel: PermissionLevel.LEVEL_7,  // 医療チーム確認により7に設定
    profileImage: '/images/avatar/default.png'
  },

  // 介護医療院
  {
    staffId: 'TATE_008',
    name: '介護 主任太',
    email: 'kaigo-shunin@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '介護医療院',
    position: '介護主任',
    profession: '介護福祉士',
    experienceYears: 12,
    accountLevel: PermissionLevel.LEVEL_5,
    profileImage: '/images/avatar/default.png'
  },

  // 薬剤部門
  {
    staffId: 'TATE_009',
    name: '薬局 長次郎',
    email: 'yakkyoku@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '薬剤部門',
    position: '薬局長',
    profession: '薬剤師',
    experienceYears: 15,
    accountLevel: PermissionLevel.LEVEL_8,
    profileImage: '/images/avatar/default.png'
  },

  // リハビリテーション部門
  {
    staffId: 'TATE_010',
    name: 'リハビリ 主任',
    email: 'rehab-shunin@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: 'リハビリテーション部門',
    position: 'リハビリテーション部門主任',
    profession: '理学療法士',
    experienceYears: 8,
    accountLevel: PermissionLevel.LEVEL_5,
    profileImage: '/images/avatar/default.png'
  },

  // 一般職員
  {
    staffId: 'TATE_011',
    name: '看護 新人子',
    email: 'kango-new@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '第１病棟',
    position: '看護師',
    profession: '看護師',
    experienceYears: 1,
    accountLevel: PermissionLevel.LEVEL_1,
    profileImage: '/images/avatar/default.png'
  },

  {
    staffId: 'TATE_012',
    name: '介護 一般子',
    email: 'kaigo-staff@tategami-rehabilitation.jp',
    facility: '立神リハビリテーション温泉病院',
    facilityId: 'tategami_rehabilitation',
    department: '介護医療院',
    position: '介護職員',
    profession: '介護職',
    experienceYears: 3,
    accountLevel: PermissionLevel.LEVEL_2,
    profileImage: '/images/avatar/default.png'
  }
];

/**
 * 施設間異動テスト用データ
 */
export const facilityTransferTestCases = [
  {
    staffId: 'TRANSFER_001',
    name: '異動 太郎',
    fromFacility: 'kohara_hospital',
    toFacility: 'tategami_rehabilitation',
    fromPosition: '薬剤部長',
    toPosition: '薬局長',
    fromLevel: 10,
    expectedLevel: 8,  // 施設規模により調整
    description: '大規模病院から中規模リハビリ施設への異動'
  },
  {
    staffId: 'TRANSFER_002',
    name: '昇進 花子',
    fromFacility: 'tategami_rehabilitation',
    toFacility: 'tategami_rehabilitation',
    fromPosition: '主任',
    toPosition: '師長',
    fromLevel: 5,
    expectedLevel: 7,
    description: '同一施設内での昇進'
  },
  {
    staffId: 'TRANSFER_003',
    name: '統括 次郎',
    fromFacility: 'tategami_rehabilitation',
    toFacility: 'kohara_hospital',
    fromPosition: '統括主任',
    toPosition: '科長',
    fromLevel: 7,
    expectedLevel: 8,
    description: 'リハビリ施設から大規模病院への栄転'
  }
];

/**
 * テスト用職員をIDで取得
 */
export function getTategamiTestStaffById(staffId: string): DemoStaffData | undefined {
  return tategamiTestStaffData.find(staff => staff.staffId === staffId);
}

/**
 * テスト用職員を役職で取得
 */
export function getTategamiTestStaffByPosition(position: string): DemoStaffData[] {
  return tategamiTestStaffData.filter(staff => staff.position === position);
}