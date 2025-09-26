/**
 * 施設関連の型定義
 * 医療法人厚生会の各施設を管理
 */

/**
 * 施設タイプ
 */
export type FacilityType = 'hospital' | 'rehabilitation' | 'care_facility' | 'clinic';

/**
 * 組織規模レベル
 */
export type OrganizationLevel = 'large' | 'medium' | 'small';

/**
 * 施設基本情報
 */
export interface Facility {
  id: string;
  name: string;
  fullName: string;
  type: FacilityType;
  organizationLevel: OrganizationLevel;
  address?: string;
  isActive: boolean;
  employeeCount?: number;
  bedCount?: number;
  specialties?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 施設と職員の関連情報
 */
export interface StaffFacility {
  staffId: string;
  facilityId: string;
  position: string;
  department?: string;
  startDate: Date;
  endDate?: Date;
  isPrimary: boolean;
}

/**
 * 施設選択コンテキスト
 */
export interface FacilityContext {
  currentFacility: Facility;
  availableFacilities: Facility[];
  canSwitchFacility: boolean;
  lastSwitchedAt?: Date;
}