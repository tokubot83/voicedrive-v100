// 部署詳細マスターデータ
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