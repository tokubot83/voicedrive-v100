// 医療・介護施設マスターデータ
export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'facility' | 'nursing_care' | 'home_service';
  departments: string[];
}

// 配列形式でのエクスポート（IntegratedCorporateDashboard.tsxで必要）
export const facilities: Facility[] = [
  {
    id: 'kohara_hospital',
    name: '小原病院',
    type: 'hospital',
    departments: [
      'regional_comprehensive_care_ward', // 地域包括医療病棟
      'community_care_ward', // 地域包括ケア病棟  
      'rehabilitation_ward', // 回復期リハビリ病棟
      'outpatient', // 外来
      'other_kohara' // その他（今後追加予定）
    ]
  },
  {
    id: 'tategami_hospital', 
    name: '立神リハ温泉病院',
    type: 'hospital',
    departments: [
      'medical_therapy_ward', // 医療療養病棟
      'other_tategami' // その他（今後追加予定）
    ]
  },
  {
    id: 'espoir_tategami',
    name: 'エスポワール立神',
    type: 'facility',
    departments: [
      'residential_service', // 入所サービス部門
      'day_service' // 通所サービス部門
    ]
  },
  {
    id: 'nursing_care_hospital',
    name: '介護医療院',
    type: 'nursing_care',
    departments: [
      'residential_service' // 入所サービス部門
    ]
  },
  {
    id: 'hojuan',
    name: '宝寿庵',
    type: 'facility',
    departments: [
      'residential_service' // 入所サービス部門
    ]
  },
  {
    id: 'visiting_nurse_station',
    name: '訪問看護ステーション',
    type: 'home_service',
    departments: [
      'home_service' // 居宅サービス部門
    ]
  },
  {
    id: 'visiting_care_office',
    name: '訪問介護事業所',
    type: 'home_service', 
    departments: [
      'home_service' // 居宅サービス部門
    ]
  },
  {
    id: 'home_care_support_office',
    name: '居宅介護支援事業所',
    type: 'home_service',
    departments: [
      'home_service' // 居宅サービス部門
    ]
  }
];

// 既存のオブジェクト形式も維持（互換性のため）
export const FACILITIES = {
  'kohara_hospital': {
    id: 'kohara_hospital',
    name: '小原病院',
    type: 'hospital',
    departments: [
      'regional_comprehensive_care_ward', // 地域包括医療病棟
      'community_care_ward', // 地域包括ケア病棟  
      'rehabilitation_ward', // 回復期リハビリ病棟
      'outpatient', // 外来
      'other_kohara' // その他（今後追加予定）
    ]
  },
  'tategami_hospital': {
    id: 'tategami_hospital', 
    name: '立神リハ温泉病院',
    type: 'hospital',
    departments: [
      'medical_therapy_ward', // 医療療養病棟
      'other_tategami' // その他（今後追加予定）
    ]
  },
  'espoir_tategami': {
    id: 'espoir_tategami',
    name: 'エスポワール立神',
    type: 'facility',
    departments: [
      'residential_service', // 入所サービス部門
      'day_service' // 通所サービス部門
    ]
  },
  'nursing_care_hospital': {
    id: 'nursing_care_hospital',
    name: '介護医療院',
    type: 'nursing_care',
    departments: [
      'residential_service' // 入所サービス部門
    ]
  },
  'hojuan': {
    id: 'hojuan',
    name: '宝寿庵',
    type: 'facility',
    departments: [
      'residential_service' // 入所サービス部門
    ]
  },
  'visiting_nurse_station': {
    id: 'visiting_nurse_station',
    name: '訪問看護ステーション',
    type: 'home_service',
    departments: [
      'home_service' // 居宅サービス部門
    ]
  },
  'visiting_care_office': {
    id: 'visiting_care_office',
    name: '訪問介護事業所',
    type: 'home_service', 
    departments: [
      'home_service' // 居宅サービス部門
    ]
  },
  'home_care_support_office': {
    id: 'home_care_support_office',
    name: '居宅介護支援事業所',
    type: 'home_service',
    departments: [
      'home_service' // 居宅サービス部門
    ]
  }
};