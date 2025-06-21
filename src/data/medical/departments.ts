// 部署詳細マスターデータ
export interface Department {
  id: string;
  name: string;
  facility: string;
  type: 'ward' | 'outpatient' | 'service' | 'other';
}

// 配列形式でのエクスポート（IntegratedCorporateDashboard.tsxで必要）
export const departments: Department[] = [
  // 小原病院
  {
    id: 'nursing_administration_kohara',
    name: '看護部',
    facility: 'kohara_hospital',
    type: 'other'
  },
  {
    id: 'outpatient_kohara',
    name: '外来',
    facility: 'kohara_hospital',
    type: 'outpatient'
  },
  {
    id: 'ward_3f_kohara',
    name: '3階病棟',
    facility: 'kohara_hospital',
    type: 'ward'
  },
  {
    id: 'ward_4f_kohara',
    name: '4階病棟',
    facility: 'kohara_hospital',
    type: 'ward'
  },
  {
    id: 'ward_5f_kohara',
    name: '5階病棟',
    facility: 'kohara_hospital',
    type: 'ward'
  },
  {
    id: 'operating_room_kohara',
    name: '中材手術室',
    facility: 'kohara_hospital',
    type: 'other'
  },
  {
    id: 'dialysis_room_kohara',
    name: '人工透析室',
    facility: 'kohara_hospital',
    type: 'other'
  },
  {
    id: 'regional_comprehensive_care_ward',
    name: '地域包括医療病棟',
    facility: 'kohara_hospital',
    type: 'ward'
  },
  {
    id: 'community_care_ward', 
    name: '地域包括ケア病棟',
    facility: 'kohara_hospital',
    type: 'ward'
  },
  {
    id: 'rehabilitation_ward',
    name: '回復期リハビリ病棟', 
    facility: 'kohara_hospital',
    type: 'ward'
  },
  {
    id: 'outpatient',
    name: '外来',
    facility: 'kohara_hospital',
    type: 'outpatient'
  },
  {
    id: 'other_kohara',
    name: 'その他（小原病院）',
    facility: 'kohara_hospital',
    type: 'other'
  },
  
  // 立神リハ温泉病院
  {
    id: 'medical_therapy_ward',
    name: '医療療養病棟',
    facility: 'tategami_hospital', 
    type: 'ward'
  },
  {
    id: 'other_tategami',
    name: 'その他（立神リハ温泉病院）',
    facility: 'tategami_hospital',
    type: 'other'
  },
  
  // エスポワール立神
  {
    id: 'residential_service_espoir',
    name: '入所サービス部門',
    facility: 'espoir_tategami',
    type: 'service'
  },
  {
    id: 'day_service_espoir',
    name: '通所サービス部門',
    facility: 'espoir_tategami',
    type: 'service'
  },
  
  // 介護医療院
  {
    id: 'residential_service_nursing',
    name: '入所サービス部門',
    facility: 'nursing_care_hospital',
    type: 'service'
  },
  
  // 宝寿庵
  {
    id: 'residential_service_hojuan',
    name: '入所サービス部門',
    facility: 'hojuan',
    type: 'service'
  },
  
  // 訪問看護ステーション
  {
    id: 'home_service_visiting_nurse',
    name: '居宅サービス部門',
    facility: 'visiting_nurse_station',
    type: 'service'
  },
  
  // 訪問介護事業所
  {
    id: 'home_service_visiting_care',
    name: '居宅サービス部門',
    facility: 'visiting_care_office',
    type: 'service'
  },
  
  // 居宅介護支援事業所
  {
    id: 'home_service_home_care',
    name: '居宅サービス部門',
    facility: 'home_care_support_office',
    type: 'service'
  }
];

// 既存のオブジェクト形式も維持（互換性のため）
export const DEPARTMENTS = {
  // 小原病院
  'regional_comprehensive_care_ward': {
    id: 'regional_comprehensive_care_ward',
    name: '地域包括医療病棟',
    facility: 'kohara_hospital',
    type: 'ward'
  },
  'community_care_ward': {
    id: 'community_care_ward', 
    name: '地域包括ケア病棟',
    facility: 'kohara_hospital',
    type: 'ward'
  },
  'rehabilitation_ward': {
    id: 'rehabilitation_ward',
    name: '回復期リハビリ病棟', 
    facility: 'kohara_hospital',
    type: 'ward'
  },
  'outpatient': {
    id: 'outpatient',
    name: '外来',
    facility: 'kohara_hospital',
    type: 'outpatient'
  },
  'other_kohara': {
    id: 'other_kohara',
    name: 'その他（小原病院）',
    facility: 'kohara_hospital',
    type: 'other'
  },
  
  // 立神リハ温泉病院
  'medical_therapy_ward': {
    id: 'medical_therapy_ward',
    name: '医療療養病棟',
    facility: 'tategami_hospital', 
    type: 'ward'
  },
  'other_tategami': {
    id: 'other_tategami',
    name: 'その他（立神リハ温泉病院）',
    facility: 'tategami_hospital',
    type: 'other'
  },
  
  // 共通部門
  'residential_service': {
    id: 'residential_service',
    name: '入所サービス部門',
    type: 'service'
  },
  'day_service': {
    id: 'day_service',
    name: '通所サービス部門',
    type: 'service'
  },
  'home_service': {
    id: 'home_service',
    name: '居宅サービス部門',
    type: 'service'
  }
};