/**
 * 医療法人厚生会 施設マスタデータ
 */

import { Facility } from '../types/facility.types';

export const FACILITIES: Record<string, Facility> = {
  'obara-hospital': {
    id: 'obara-hospital',
    name: '小原病院',
    fullName: '医療法人厚生会 小原病院',
    type: 'hospital',
    organizationLevel: 'large',
    address: '鹿児島県鹿児島市',
    isActive: true,
    employeeCount: 500,
    bedCount: 300,
    specialties: ['内科', '外科', '整形外科', '循環器科', '消化器科'],
    createdAt: new Date('1950-01-01'),
    updatedAt: new Date('2025-09-26')
  },

  'tategami-rehabilitation': {
    id: 'tategami-rehabilitation',
    name: '立神リハビリテーション温泉病院',
    fullName: '医療法人厚生会 立神リハビリテーション温泉病院',
    type: 'rehabilitation',
    organizationLevel: 'medium',
    address: '鹿児島県枕崎市',
    isActive: true,
    employeeCount: 150,
    bedCount: 120,
    specialties: ['リハビリテーション科', '内科', '温泉療法'],
    createdAt: new Date('1970-01-01'),
    updatedAt: new Date('2025-09-26')
  },

  // 将来追加予定の施設プレースホルダー
  /*
  sakurajima_clinic: {
    id: 'sakurajima_clinic',
    name: '桜島クリニック',
    fullName: '医療法人厚生会 桜島クリニック',
    type: 'clinic',
    organizationLevel: 'small',
    address: '鹿児島県鹿児島市桜島',
    isActive: false,
    employeeCount: 30,
    bedCount: 0,
    specialties: ['内科', '小児科'],
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2025-09-26')
  }
  */
};

/**
 * アクティブな施設のみを取得
 */
export function getActiveFacilities(): Facility[] {
  return Object.values(FACILITIES).filter(f => f.isActive);
}

/**
 * 施設IDから施設情報を取得
 */
export function getFacilityById(facilityId: string): Facility | undefined {
  return FACILITIES[facilityId];
}

/**
 * デフォルト施設を取得（小原病院）
 */
export function getDefaultFacility(): Facility {
  return FACILITIES['obara-hospital'];
}