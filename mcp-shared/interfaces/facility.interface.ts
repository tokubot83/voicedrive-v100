/**
 * 施設関連の型定義
 * 医療法人厚生会の3施設統合管理用
 */

export type FacilityId =
  | 'ohara_hospital'
  | 'tategami_rehabilitation'
  | 'espoir-tategami';

export type FacilityType =
  | 'general_hospital'
  | 'rehabilitation_hospital'
  | 'geriatric_health_facility';

export type FacilityScale = 'small' | 'medium' | 'large';

export interface IFacility {
  facilityId: FacilityId;
  facilityName: string;
  facilityType: FacilityType;
  scale: FacilityScale;
}

export interface IPositionMapping {
  [position: string]: number | string;
}

export interface IFacilityMapping extends IFacility {
  positionMapping: IPositionMapping;
  departments?: {
    [departmentName: string]: string[] | {
      [subDepartment: string]: string[] | {
        [unit: string]: string[]
      }
    }
  };
}

export interface IStaffPosition {
  staffId: string;
  facilityId: FacilityId;
  position: string;
  department?: string;
  subDepartment?: string;
  unit?: string;
  accountLevel: number;
  experienceYears?: number;
  isTemporary?: boolean;
  isDualRole?: boolean;
  effectiveDate: string;
}

export interface ILevelCalculationRequest {
  staffId: string;
  facilityId: FacilityId;
}

export interface ILevelCalculationResponse {
  staffId: string;
  facilityId: FacilityId;
  staffName?: string;
  position: string;
  accountLevel: number;
  breakdown: {
    baseLevel: number;
    experienceBonus: number;
    leaderBonus: number;
    facilityAdjustment: number;
  };
}

export interface IFacilityTransfer {
  staffId: string;
  fromFacility: FacilityId;
  toFacility: FacilityId;
  fromPosition: string;
  toPosition: string;
  fromLevel: number;
  toLevel: number;
  transferDate: string;
  reason?: string;
}

// エスポワール立神特有の役職
export type EspoirPosition =
  | '施設長'
  | '事務長'
  | '入所課課長'
  | '在宅課課長'
  | '支援相談室長'
  | '看護師長'
  | '介護士長'
  | '通所リハビリテーション事業所管理者'
  | '訪問介護事業所管理者'
  | '居宅介護支援事業所管理者'
  | '通所リハビリテーション事業所管理者代行'
  | '訪問リハビリテーション事業所管理者代行'
  | '居宅介護支援事業所次長'
  | '事務主任'
  | '看護主任'
  | '介護部Aフロア主任'
  | '介護部Bフロア主任'
  | '介護部Cフロア主任'
  | '介護部Aフロアマネージャー'
  | '介護部Bフロアマネージャー'
  | '介護部Cフロアマネージャー'
  | 'ケアプラン管理部リーダー'
  | '栄養管理部主任'
  | 'リハビリテーション部主任'
  | '通所リハビリテーション主任'
  | '居宅介護支援事業所主任';

export interface IEspoirFloor {
  floorId: 'A' | 'B' | 'C';
  floorName: string;
  manager?: string;
  chief?: string;
  staffCount: number;
}

export interface IEspoirDepartment {
  departmentType: '入所課' | '在宅課' | '事務部';
  sections: {
    [sectionName: string]: {
      chief: string;
      staff: string[];
    }
  };
}