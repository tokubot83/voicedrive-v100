/**
 * 施設別役職権限マッピング設定
 * 各施設の組織構造に応じた役職と権限レベルの対応表
 */

export interface PositionMapping {
  positionName: string;
  baseLevel: number;
  displayName: string;
  department?: string;
  managementScope?: number; // 管理対象人数
}

export interface FacilityMapping {
  facilityId: string;
  facilityName: string;
  facilityType: 'hospital' | 'rehabilitation' | 'care_facility';
  organizationLevel: 'large' | 'medium' | 'small';
  positions: Map<string, PositionMapping>;
}

// 立神リハビリテーション温泉病院の役職マッピング
const tategamiPositions = new Map<string, PositionMapping>([
  // 経営層
  ['院長', {
    positionName: '院長',
    baseLevel: 13,
    displayName: '院長',
    managementScope: 150 // 想定全職員数
  }],

  // 看護部門
  ['総師長', {
    positionName: '総師長',
    baseLevel: 10,
    displayName: '総師長',
    department: '看護部門',
    managementScope: 80
  }],
  ['副総師長', {
    positionName: '副総師長',
    baseLevel: 9,
    displayName: '副総師長',
    department: '看護部門',
    managementScope: 60
  }],
  ['師長', {
    positionName: '師長',
    baseLevel: 7,
    displayName: '師長',
    department: '看護部門',
    managementScope: 20
  }],
  ['看護主任', {
    positionName: '看護主任',
    baseLevel: 5,
    displayName: '看護主任',
    department: '看護部門',
    managementScope: 8
  }],
  ['主任', {  // 一般的な主任用
    positionName: '主任',
    baseLevel: 5,
    displayName: '主任',
    department: '看護部門',
    managementScope: 8
  }],
  ['介護主任', {
    positionName: '介護主任',
    baseLevel: 5,
    displayName: '介護主任',
    department: '介護医療院',
    managementScope: 10
  }],

  // 診療技術部
  ['統括主任', {
    positionName: '統括主任',
    baseLevel: 7,  // 医療チーム確認により6→7に調整（複数部門統括のため施設別+1）
    displayName: '診療技術部統括主任',
    department: '診療技術部',
    managementScope: 30
  }],
  ['リハビリテーション部門主任', {
    positionName: '主任',
    baseLevel: 5,
    displayName: 'リハビリテーション部門主任',
    department: 'リハビリテーション部門',
    managementScope: 15
  }],
  ['放射線部門主任', {
    positionName: '主任',
    baseLevel: 5,
    displayName: '放射線部門主任',
    department: '放射線部門',
    managementScope: 3
  }],
  ['栄養部門主任', {
    positionName: '主任',
    baseLevel: 5,
    displayName: '栄養部門主任',
    department: '栄養部門',
    managementScope: 5
  }],

  // 事務部門
  ['事務長', {
    positionName: '事務長',
    baseLevel: 11,
    displayName: '事務長',
    department: '事務部門',
    managementScope: 25
  }],
  ['薬局長', {
    positionName: '薬局長',
    baseLevel: 8,
    displayName: '薬局長',
    department: '薬剤部門',
    managementScope: 8
  }],
  ['医事課主任', {
    positionName: '主任',
    baseLevel: 5,
    displayName: '医事課主任',
    department: '医事課',
    managementScope: 6
  }],
  ['総務課主任', {
    positionName: '主任',
    baseLevel: 5,
    displayName: '総務課主任',
    department: '総務課',
    managementScope: 5
  }],
]);

// 小原病院の役職マッピング
const obaraPositions = new Map<string, PositionMapping>([
  // 経営層
  ['院長', {
    positionName: '院長',
    baseLevel: 13,
    displayName: '院長',
    managementScope: 500
  }],
  ['副院長', {
    positionName: '副院長',
    baseLevel: 12,
    displayName: '副院長',
    managementScope: 400
  }],

  // 看護部門
  ['看護部長', {
    positionName: '看護部長',
    baseLevel: 10,
    displayName: '看護部長',
    department: '看護部',
    managementScope: 200
  }],
  ['副看護部長', {
    positionName: '副看護部長',
    baseLevel: 9,
    displayName: '副看護部長',
    department: '看護部',
    managementScope: 150
  }],
  ['病棟師長', {
    positionName: '師長',
    baseLevel: 7,
    displayName: '病棟師長',
    department: '看護部',
    managementScope: 30
  }],

  // 医療技術部門
  ['薬剤部長', {
    positionName: '薬剤部長',
    baseLevel: 10,
    displayName: '薬剤部長',
    department: '薬剤部',
    managementScope: 20
  }],
  ['検査部長', {
    positionName: '検査部長',
    baseLevel: 10,
    displayName: '検査部長',
    department: '検査部',
    managementScope: 15
  }],
  ['放射線部長', {
    positionName: '放射線部長',
    baseLevel: 10,
    displayName: '放射線部長',
    department: '放射線部',
    managementScope: 12
  }],

  // 事務部門
  ['事務長', {
    positionName: '事務長',
    baseLevel: 11,
    displayName: '事務長',
    department: '事務部',
    managementScope: 50
  }],
]);

// 施設マッピング設定
export const FACILITY_MAPPINGS: Map<string, FacilityMapping> = new Map([
  ['tategami-rehabilitation', {
    facilityId: 'tategami-rehabilitation',
    facilityName: '立神リハビリテーション温泉病院',
    facilityType: 'rehabilitation',
    organizationLevel: 'medium',
    positions: tategamiPositions
  }],
  ['obara-hospital', {
    facilityId: 'obara-hospital',
    facilityName: '小原病院',
    facilityType: 'hospital',
    organizationLevel: 'large',
    positions: obaraPositions
  }]
]);

/**
 * 一般職員の経験年数による権限レベル計算
 */
export function calculateExperienceLevel(
  yearsOfExperience: number,
  isNurseWithLeaderDuty: boolean = false
): number {
  let baseLevel: number;

  if (yearsOfExperience < 1) {
    baseLevel = 1;
  } else if (yearsOfExperience <= 3) {
    baseLevel = 2;
  } else if (yearsOfExperience <= 10) {
    baseLevel = 3;
  } else {
    baseLevel = 4;
  }

  // 看護職のリーダー業務加算
  if (isNurseWithLeaderDuty) {
    baseLevel += 0.5;
  }

  return baseLevel;
}

/**
 * 施設と役職から権限レベルを取得
 */
export function getPermissionLevel(
  facilityId: string,
  position: string,
  yearsOfExperience?: number,
  isNurseWithLeaderDuty?: boolean
): number {
  const facility = FACILITY_MAPPINGS.get(facilityId);

  if (!facility) {
    console.warn(`施設ID ${facilityId} のマッピングが見つかりません`);
    return 1; // デフォルト最低権限
  }

  const positionMapping = facility.positions.get(position);

  if (positionMapping) {
    return positionMapping.baseLevel;
  }

  // 役職マッピングがない場合は経験年数から計算
  if (yearsOfExperience !== undefined) {
    return calculateExperienceLevel(yearsOfExperience, isNurseWithLeaderDuty);
  }

  console.warn(`施設 ${facilityId} の役職 ${position} のマッピングが見つかりません`);
  return 1; // デフォルト最低権限
}

/**
 * 施設別の役職表示名を取得
 */
export function getPositionDisplayName(
  facilityId: string,
  position: string
): string {
  const facility = FACILITY_MAPPINGS.get(facilityId);

  if (!facility) {
    return position;
  }

  const positionMapping = facility.positions.get(position);

  return positionMapping?.displayName || position;
}