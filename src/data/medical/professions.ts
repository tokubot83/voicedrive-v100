// 職種マスターデータ（権限・投票重み付け対応）
export const PROFESSIONS = {
  'doctor': {
    id: 'doctor',
    name: '医師',
    category: 'medical',
    baseVotingWeight: 3.0, // 高い専門性
    approvalAuthority: 'high',
    licenseBased: true
  },
  'nurse': {
    id: 'nurse', 
    name: '看護師',
    category: 'nursing',
    baseVotingWeight: 2.5,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'practical_nurse': {
    id: 'practical_nurse',
    name: '准看護師',
    category: 'nursing',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'nursing_assistant': {
    id: 'nursing_assistant',
    name: '看護補助者',
    category: 'nursing_support',
    baseVotingWeight: 1.5,
    approvalAuthority: 'low',
    licenseBased: false
  },
  'care_worker_certified': {
    id: 'care_worker_certified',
    name: '介護福祉士',
    category: 'care',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'care_worker': {
    id: 'care_worker',
    name: '介護士',
    category: 'care',
    baseVotingWeight: 1.5,
    approvalAuthority: 'low',
    licenseBased: false
  },
  'pharmacist': {
    id: 'pharmacist',
    name: '薬剤師',
    category: 'medical',
    baseVotingWeight: 2.5,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'physical_therapist': {
    id: 'physical_therapist',
    name: '理学療法士',
    category: 'rehabilitation',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'occupational_therapist': {
    id: 'occupational_therapist',
    name: '作業療法士',
    category: 'rehabilitation',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'speech_therapist': {
    id: 'speech_therapist',
    name: '言語聴覚士',
    category: 'rehabilitation',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'dental_hygienist': {
    id: 'dental_hygienist',
    name: '歯科衛生士',
    category: 'medical',
    baseVotingWeight: 1.5,
    approvalAuthority: 'low',
    licenseBased: true
  },
  'administrative_staff': {
    id: 'administrative_staff',
    name: '事務職員',
    category: 'administrative',
    baseVotingWeight: 1.0,
    approvalAuthority: 'low',
    licenseBased: false
  },
  'nutritionist': {
    id: 'nutritionist',
    name: '管理栄養士',
    category: 'medical',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'clinical_technician': {
    id: 'clinical_technician',
    name: '臨床検査技師',
    category: 'medical',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  },
  'radiologic_technologist': {
    id: 'radiologic_technologist',
    name: '診療放射線技師',
    category: 'medical',
    baseVotingWeight: 2.0,
    approvalAuthority: 'medium',
    licenseBased: true
  }
};