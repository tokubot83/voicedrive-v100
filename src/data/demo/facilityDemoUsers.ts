import { DemoUser } from './types';

// 段階的投稿公開システムのデモ用ユーザー（施設・部署別）
export const facilityDemoUsers: DemoUser[] = [
  // === 立神リハ温泉病院 ===
  
  // リハビリテーション科
  {
    id: 'user-rehab-001',
    name: '山田 理学療法士',
    department: 'リハビリテーション科',
    role: '理学療法士',
    position: '理学療法士',
    expertise: 4,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'tategami-rehab-hospital',
    department_id: 'rehabilitation-dept',
    parent_id: 'user-rehab-chief-001',
    budgetApprovalLimit: 100000,
    organizationPath: ['chairman', 'user-rehab-chief-001', 'user-rehab-001']
  },
  {
    id: 'user-rehab-002',
    name: '佐藤 作業療法士',
    department: 'リハビリテーション科',
    role: '作業療法士',
    position: '作業療法士',
    expertise: 3,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'tategami-rehab-hospital',
    department_id: 'rehabilitation-dept',
    parent_id: 'user-rehab-chief-001',
    budgetApprovalLimit: 100000,
    organizationPath: ['chairman', 'user-rehab-chief-001', 'user-rehab-002']
  },
  {
    id: 'user-rehab-chief-001',
    name: 'リハビリ科 主任',
    department: 'リハビリテーション科',
    role: '主任',
    position: '主任',
    expertise: 6,
    hierarchyLevel: 3,
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'tategami-rehab-hospital',
    department_id: 'rehabilitation-dept',
    parent_id: 'user-tategami-director',
    budgetApprovalLimit: 500000,
    organizationPath: ['chairman', 'user-tategami-director', 'user-rehab-chief-001'],
    children_ids: ['user-rehab-001', 'user-rehab-002']
  },

  // 温泉療法科
  {
    id: 'user-onsen-001',
    name: '佐藤 温泉療法士',
    department: '温泉療法科',
    role: '温泉療法士',
    position: '温泉療法士',
    expertise: 4,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'tategami-rehab-hospital',
    department_id: 'onsen-therapy-dept',
    parent_id: 'user-onsen-chief-001',
    budgetApprovalLimit: 100000,
    organizationPath: ['chairman', 'user-onsen-chief-001', 'user-onsen-001']
  },
  {
    id: 'user-onsen-002',
    name: '中村 温泉療法士',
    department: '温泉療法科',
    role: '温泉療法士',
    position: '温泉療法士',
    expertise: 3,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'tategami-rehab-hospital',
    department_id: 'onsen-therapy-dept',
    parent_id: 'user-onsen-chief-001',
    budgetApprovalLimit: 100000,
    organizationPath: ['chairman', 'user-onsen-chief-001', 'user-onsen-002']
  },
  {
    id: 'user-onsen-chief-001',
    name: '温泉療法科 主任',
    department: '温泉療法科',
    role: '主任',
    position: '主任',
    expertise: 5,
    hierarchyLevel: 3,
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'tategami-rehab-hospital',
    department_id: 'onsen-therapy-dept',
    parent_id: 'user-tategami-director',
    budgetApprovalLimit: 500000,
    organizationPath: ['chairman', 'user-tategami-director', 'user-onsen-chief-001'],
    children_ids: ['user-onsen-001', 'user-onsen-002']
  },

  // 立神リハ温泉病院 施設長
  {
    id: 'user-tategami-director',
    name: '立神 施設長',
    department: '立神リハ温泉病院',
    role: '施設長',
    position: '施設長',
    expertise: 8,
    hierarchyLevel: 4,
    permissionLevel: 4,
    accountType: 'FACILITY_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'tategami-rehab-hospital',
    department_id: 'facility-management',
    parent_id: 'chairman',
    budgetApprovalLimit: 5000000,
    organizationPath: ['chairman', 'user-tategami-director'],
    children_ids: ['user-rehab-chief-001', 'user-onsen-chief-001']
  },

  // === 小原病院 ===
  
  // 看護部
  {
    id: 'user-nursing-001',
    name: '田中 看護師長',
    department: '看護部',
    role: '看護師長',
    position: '看護師長',
    expertise: 5,
    hierarchyLevel: 3,
    permissionLevel: 3,
    accountType: 'DEPARTMENT_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'nursing-dept',
    parent_id: 'user-kohara-director',
    budgetApprovalLimit: 1000000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-nursing-001'],
    children_ids: ['user-nurse-002', 'user-nurse-003']
  },
  {
    id: 'user-nurse-002',
    name: '山本 看護師',
    department: '看護部',
    role: '看護師',
    position: '看護師',
    expertise: 3,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'kohara-hospital',
    department_id: 'nursing-dept',
    parent_id: 'user-nursing-001',
    budgetApprovalLimit: 50000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-nursing-001', 'user-nurse-002']
  },
  {
    id: 'user-nurse-003',
    name: '小原病院 看護師',
    department: '看護部',
    role: '看護師',
    position: '看護師',
    expertise: 4,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'kohara-hospital',
    department_id: 'nursing-dept',
    parent_id: 'user-nursing-001',
    budgetApprovalLimit: 50000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-nursing-001', 'user-nurse-003']
  },

  // 医療情報部
  {
    id: 'user-it-director-001',
    name: '佐々木 情報部長',
    department: '医療情報部',
    role: '部長',
    position: '部長',
    expertise: 6,
    hierarchyLevel: 5,
    permissionLevel: 5,
    accountType: 'HR_DEPARTMENT_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'medical-it-dept',
    parent_id: 'user-kohara-director',
    budgetApprovalLimit: 3000000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-it-director-001'],
    children_ids: ['user-it-001', 'user-it-002']
  },
  {
    id: 'user-it-001',
    name: '鈴木 システム管理者',
    department: '医療情報部',
    role: 'システム管理者',
    position: 'システム管理者',
    expertise: 5,
    hierarchyLevel: 3,
    permissionLevel: 3,
    accountType: 'SUPERVISOR',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'medical-it-dept',
    parent_id: 'user-it-director-001',
    budgetApprovalLimit: 500000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-it-director-001', 'user-it-001']
  },
  {
    id: 'user-it-002',
    name: 'システム担当者',
    department: '医療情報部',
    role: 'システム担当者',
    position: 'システム担当者',
    expertise: 3,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'kohara-hospital',
    department_id: 'medical-it-dept',
    parent_id: 'user-it-001',
    budgetApprovalLimit: 100000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-it-director-001', 'user-it-001', 'user-it-002']
  },

  // 事務部
  {
    id: 'user-admin-001',
    name: '高橋 事務長',
    department: '事務部',
    role: '事務長',
    position: '事務長',
    expertise: 6,
    hierarchyLevel: 4,
    permissionLevel: 4,
    accountType: 'FACILITY_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'administration-dept',
    parent_id: 'user-kohara-director',
    budgetApprovalLimit: 2000000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-admin-001'],
    children_ids: ['user-admin-002']
  },
  {
    id: 'user-admin-002',
    name: '事務部 課長',
    department: '事務部',
    role: '課長',
    position: '課長',
    expertise: 4,
    hierarchyLevel: 3,
    permissionLevel: 3,
    accountType: 'SUPERVISOR',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'administration-dept',
    parent_id: 'user-admin-001',
    budgetApprovalLimit: 800000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-admin-001', 'user-admin-002']
  },

  // 薬剤部
  {
    id: 'user-pharmacy-001',
    name: '鈴木 薬剤師',
    department: '薬剤部',
    role: '薬剤師',
    position: '薬剤師',
    expertise: 4,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'kohara-hospital',
    department_id: 'pharmacy-dept',
    parent_id: 'user-pharmacy-chief-001',
    budgetApprovalLimit: 200000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-pharmacy-chief-001', 'user-pharmacy-001']
  },
  {
    id: 'user-pharmacy-chief-001',
    name: '薬剤部長',
    department: '薬剤部',
    role: '部長',
    position: '部長',
    expertise: 6,
    hierarchyLevel: 4,
    permissionLevel: 4,
    accountType: 'DEPARTMENT_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'pharmacy-dept',
    parent_id: 'user-kohara-director',
    budgetApprovalLimit: 1500000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-pharmacy-chief-001'],
    children_ids: ['user-pharmacy-001']
  },

  // 感染管理
  {
    id: 'user-infection-001',
    name: '感染管理看護師',
    department: '看護部',
    role: '感染管理看護師',
    position: '感染管理看護師',
    expertise: 5,
    hierarchyLevel: 4,
    permissionLevel: 4,
    accountType: 'SUPERVISOR',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'infection-control',
    parent_id: 'user-nursing-001',
    budgetApprovalLimit: 1000000,
    organizationPath: ['chairman', 'user-kohara-director', 'user-nursing-001', 'user-infection-001']
  },

  // 小原病院 院長
  {
    id: 'user-kohara-director',
    name: '小原 院長',
    department: '小原病院',
    role: '院長',
    position: '院長',
    expertise: 10,
    hierarchyLevel: 4,
    permissionLevel: 4,
    accountType: 'FACILITY_HEAD',
    stakeholderCategory: 'management',
    facility_id: 'kohara-hospital',
    department_id: 'hospital-management',
    parent_id: 'chairman',
    budgetApprovalLimit: 10000000,
    organizationPath: ['chairman', 'user-kohara-director'],
    children_ids: ['user-nursing-001', 'user-it-director-001', 'user-admin-001', 'user-pharmacy-chief-001']
  },

  // === 本部 ===
  
  // 人事部
  {
    id: 'user-hr-director-001',
    name: '石川 人事部長',
    department: '人事部',
    role: '部長',
    position: '部長',
    expertise: 7,
    hierarchyLevel: 6,
    permissionLevel: 6,
    accountType: 'HR_DIRECTOR',
    stakeholderCategory: 'management',
    facility_id: 'headquarters',
    department_id: 'hr-dept',
    parent_id: 'user-executive-secretary',
    budgetApprovalLimit: 20000000,
    organizationPath: ['chairman', 'user-executive-secretary', 'user-hr-director-001'],
    children_ids: ['user-hr-001']
  },
  {
    id: 'user-hr-001',
    name: '人事担当者',
    department: '人事部',
    role: '担当者',
    position: '担当者',
    expertise: 3,
    hierarchyLevel: 2,
    permissionLevel: 2,
    accountType: 'STAFF',
    stakeholderCategory: 'frontline',
    facility_id: 'headquarters',
    department_id: 'hr-dept',
    parent_id: 'user-hr-director-001',
    budgetApprovalLimit: 100000,
    organizationPath: ['chairman', 'user-executive-secretary', 'user-hr-director-001', 'user-hr-001']
  },

  // 執行役員秘書（Level 7）
  {
    id: 'user-executive-secretary',
    name: '執行役員秘書',
    department: '本部',
    role: '執行役員秘書',
    position: '執行役員秘書',
    expertise: 8,
    hierarchyLevel: 7,
    permissionLevel: 7,
    accountType: 'EXECUTIVE_SECRETARY',
    stakeholderCategory: 'management',
    facility_id: 'headquarters',
    department_id: 'executive-office',
    parent_id: 'chairman',
    budgetApprovalLimit: 50000000,
    organizationPath: ['chairman', 'user-executive-secretary'],
    children_ids: ['user-hr-director-001']
  },

  // 理事長（Level 8）
  {
    id: 'chairman',
    name: '理事長',
    department: '本部',
    role: '理事長',
    position: '理事長',
    expertise: 10,
    hierarchyLevel: 8,
    permissionLevel: 8,
    accountType: 'CHAIRMAN',
    stakeholderCategory: 'management',
    facility_id: 'headquarters',
    department_id: 'executive-office',
    budgetApprovalLimit: null, // Unlimited
    organizationPath: ['chairman'],
    children_ids: ['user-executive-secretary', 'user-kohara-director', 'user-tategami-director']
  }
];

// 施設マッピング
export const facilityMapping = {
  'tategami-rehab-hospital': '立神リハ温泉病院',
  'kohara-hospital': '小原病院',
  'headquarters': '本部'
};

// 部署マッピング
export const departmentMapping = {
  'rehabilitation-dept': 'リハビリテーション科',
  'onsen-therapy-dept': '温泉療法科',
  'nursing-dept': '看護部',
  'medical-it-dept': '医療情報部',
  'administration-dept': '事務部',
  'pharmacy-dept': '薬剤部',
  'infection-control': '感染管理',
  'hr-dept': '人事部',
  'executive-office': '役員室',
  'facility-management': '施設管理',
  'hospital-management': '病院管理'
};

export default facilityDemoUsers;