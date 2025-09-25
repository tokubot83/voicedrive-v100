import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';

// 18段階権限レベル対応デモスタッフデータ
export interface DemoStaffData {
  staffId: string;
  name: string;
  facility: string;
  department: string;
  position: string;
  profession: string;
  hireDate: Date;
  experienceYears: number;
  age: number;
  canPerformLeaderDuty?: boolean;
  certifications?: string[];
  accountLevel: PermissionLevel | SpecialPermissionLevel;
  email: string;
  profileImage?: string;
}

export const demoStaffData: DemoStaffData[] = [
  // === 一般職員層 (1-4.5) ===
  {
    staffId: 'STAFF001',
    name: '佐藤 花子',
    facility: '小原病院',
    department: '内科病棟',
    position: '',
    profession: '看護師',
    hireDate: new Date('2024-04-01'),
    experienceYears: 1,
    age: 23,
    canPerformLeaderDuty: false,
    accountLevel: PermissionLevel.LEVEL_1,
    email: 'sato.hanako@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF002',
    name: '鈴木 太郎',
    facility: '小原病院',
    department: '内科病棟',
    position: '',
    profession: '看護師',
    hireDate: new Date('2024-04-01'),
    experienceYears: 1,
    age: 24,
    canPerformLeaderDuty: true,
    accountLevel: PermissionLevel.LEVEL_1_5,
    email: 'suzuki.taro@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF003',
    name: '田中 美由紀',
    facility: '小原病院',
    department: '外科病棟',
    position: '',
    profession: '看護師',
    hireDate: new Date('2022-04-01'),
    experienceYears: 3,
    age: 26,
    canPerformLeaderDuty: false,
    accountLevel: PermissionLevel.LEVEL_2,
    email: 'tanaka.miyuki@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF004',
    name: '高橋 陽子',
    facility: '小原病院',
    department: '外科病棟',
    position: '',
    profession: '看護師',
    hireDate: new Date('2022-04-01'),
    experienceYears: 3,
    age: 27,
    canPerformLeaderDuty: true,
    certifications: ['リーダー研修修了'],
    accountLevel: PermissionLevel.LEVEL_2_5,
    email: 'takahashi.yoko@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF005',
    name: '伊藤 健一',
    facility: '小原病院',
    department: '救急外来',
    position: '',
    profession: '看護師',
    hireDate: new Date('2018-04-01'),
    experienceYears: 7,
    age: 31,
    canPerformLeaderDuty: false,
    accountLevel: PermissionLevel.LEVEL_3,
    email: 'ito.kenichi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF006',
    name: '渡辺 真理',
    facility: '小原病院',
    department: '救急外来',
    position: '',
    profession: '看護師',
    hireDate: new Date('2016-04-01'),
    experienceYears: 9,
    age: 33,
    canPerformLeaderDuty: true,
    certifications: ['救急看護認定看護師'],
    accountLevel: PermissionLevel.LEVEL_3_5,
    email: 'watanabe.mari@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF007',
    name: '山田 武',
    facility: '小原病院',
    department: 'ICU',
    position: '',
    profession: '看護師',
    hireDate: new Date('2010-04-01'),
    experienceYears: 15,
    age: 38,
    canPerformLeaderDuty: false,
    accountLevel: PermissionLevel.LEVEL_4,
    email: 'yamada.takeshi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF008',
    name: '中村 智子',
    facility: '小原病院',
    department: 'ICU',
    position: '',
    profession: '看護師',
    hireDate: new Date('2009-04-01'),
    experienceYears: 16,
    age: 40,
    canPerformLeaderDuty: true,
    certifications: ['集中ケア認定看護師'],
    accountLevel: PermissionLevel.LEVEL_4_5,
    email: 'nakamura.tomoko@ohara-hospital.jp'
  },

  // === 役職層 (5-11) ===
  {
    staffId: 'STAFF009',
    name: '小林 明美',
    facility: '小原病院',
    department: '内科病棟',
    position: '副主任',
    profession: '看護師',
    hireDate: new Date('2008-04-01'),
    experienceYears: 17,
    age: 41,
    certifications: ['糖尿病療養指導士'],
    accountLevel: PermissionLevel.LEVEL_5,
    email: 'kobayashi.akemi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF010',
    name: '加藤 正志',
    facility: '小原病院',
    department: '外科病棟',
    position: '主任',
    profession: '看護師',
    hireDate: new Date('2006-04-01'),
    experienceYears: 19,
    age: 43,
    certifications: ['外科認定看護師'],
    accountLevel: PermissionLevel.LEVEL_6,
    email: 'kato.masashi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF011',
    name: '吉田 由美',
    facility: '小原病院',
    department: '外科病棟',
    position: '副師長',
    profession: '看護師',
    hireDate: new Date('2004-04-01'),
    experienceYears: 21,
    age: 45,
    certifications: ['外科認定看護師', '医療安全管理者'],
    accountLevel: PermissionLevel.LEVEL_7,
    email: 'yoshida.yumi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF012',
    name: '佐々木 清',
    facility: '小原病院',
    department: '外科病棟',
    position: '師長',
    profession: '看護師',
    hireDate: new Date('2002-04-01'),
    experienceYears: 23,
    age: 47,
    certifications: ['認定看護管理者', '外科認定看護師'],
    accountLevel: PermissionLevel.LEVEL_8,
    email: 'sasaki.kiyoshi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF013',
    name: '松本 恵美',
    facility: '小原病院',
    department: '看護部',
    position: '副部長',
    profession: '看護師',
    hireDate: new Date('2000-04-01'),
    experienceYears: 25,
    age: 49,
    certifications: ['認定看護管理者', '専門看護師（急性重症患者看護）'],
    accountLevel: PermissionLevel.LEVEL_9,
    email: 'matsumoto.megumi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF014',
    name: '井上 博',
    facility: '小原病院',
    department: '看護部',
    position: '部長',
    profession: '看護師',
    hireDate: new Date('1998-04-01'),
    experienceYears: 27,
    age: 51,
    certifications: ['認定看護管理者', '専門看護師（急性重症患者看護）', 'MBA'],
    accountLevel: PermissionLevel.LEVEL_10,
    email: 'inoue.hiroshi@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF015',
    name: '木村 正夫',
    facility: '小原病院',
    department: '事務部',
    position: '事務長',
    profession: '事務職員',
    hireDate: new Date('1995-04-01'),
    experienceYears: 30,
    age: 54,
    certifications: ['病院経営管理士'],
    accountLevel: PermissionLevel.LEVEL_11,
    email: 'kimura.masao@ohara-hospital.jp'
  },

  // === 施設経営層 (12-13) ===
  {
    staffId: 'STAFF016',
    name: '山口 明子',
    facility: '小原病院',
    department: '病院経営室',
    position: '副院長',
    profession: '医師',
    hireDate: new Date('1990-04-01'),
    experienceYears: 35,
    age: 58,
    certifications: ['内科専門医', '指導医', '病院管理者'],
    accountLevel: PermissionLevel.LEVEL_12,
    email: 'yamaguchi.akiko@ohara-hospital.jp'
  },
  {
    staffId: 'STAFF017',
    name: '小原 一郎',
    facility: '小原病院',
    department: '病院経営室',
    position: '院長',
    profession: '医師',
    hireDate: new Date('1985-04-01'),
    experienceYears: 40,
    age: 62,
    certifications: ['外科専門医', '指導医', '病院経営管理士', 'MBA'],
    accountLevel: PermissionLevel.LEVEL_13,
    email: 'ohara.ichiro@ohara-hospital.jp'
  },

  // === 法人人事部 (14-17) ===
  {
    staffId: 'STAFF018',
    name: '渡部 美智子',
    facility: '法人本部',
    department: '人事部',
    position: '人事部門員',
    profession: '事務職員',
    hireDate: new Date('2015-04-01'),
    experienceYears: 10,
    age: 34,
    certifications: ['キャリアコンサルタント'],
    accountLevel: PermissionLevel.LEVEL_14,
    email: 'watanabe.michiko@ohara-corp.jp'
  },
  {
    staffId: 'STAFF019',
    name: '斎藤 健太',
    facility: '法人本部',
    department: '人事部',
    position: '採用教育部門長',
    profession: '事務職員',
    hireDate: new Date('2005-04-01'),
    experienceYears: 20,
    age: 44,
    certifications: ['社会保険労務士', 'キャリアコンサルタント'],
    accountLevel: PermissionLevel.LEVEL_15,
    email: 'saito.kenta@ohara-corp.jp'
  },
  {
    staffId: 'STAFF020',
    name: '徳留 優子',
    facility: '法人本部',
    department: '戦略企画部',
    position: '統括管理部門員',
    profession: '事務職員',
    hireDate: new Date('2000-04-01'),
    experienceYears: 25,
    age: 48,
    certifications: ['MBA', '中小企業診断士'],
    accountLevel: PermissionLevel.LEVEL_16,
    email: 'tokudome.yuko@ohara-corp.jp'
  },
  {
    staffId: 'STAFF021',
    name: '廻 総師長',
    facility: '法人本部',
    department: '戦略企画部',
    position: '統括管理部門長',
    profession: '看護師',
    hireDate: new Date('1995-04-01'),
    experienceYears: 30,
    age: 53,
    certifications: ['認定看護管理者', 'MBA', '病院経営管理士'],
    accountLevel: PermissionLevel.LEVEL_17,
    email: 'meguri.sosho@ohara-corp.jp'
  },

  // === 最高経営層 (18) ===
  {
    staffId: 'STAFF022',
    name: '小原 次郎',
    facility: '法人本部',
    department: '理事会',
    position: '理事長',
    profession: '医師',
    hireDate: new Date('1980-04-01'),
    experienceYears: 45,
    age: 68,
    certifications: ['外科専門医', '指導医', 'MBA', 'Ph.D'],
    accountLevel: PermissionLevel.LEVEL_18,
    email: 'ohara.jiro@ohara-corp.jp'
  },

  // === システム管理者 (X) ===
  {
    staffId: 'ADMIN001',
    name: 'システム管理者',
    facility: 'システム',
    department: 'システム管理',
    position: 'システム管理者',
    profession: 'システム',
    hireDate: new Date('2020-01-01'),
    experienceYears: 5,
    age: 0,
    accountLevel: SpecialPermissionLevel.LEVEL_X,
    email: 'admin@voicedrive.system'
  }
];

// ユーティリティ関数
export const getStaffByLevel = (level: PermissionLevel | SpecialPermissionLevel): DemoStaffData[] => {
  return demoStaffData.filter(staff => staff.accountLevel === level);
};

export const getStaffByFacility = (facility: string): DemoStaffData[] => {
  return demoStaffData.filter(staff => staff.facility === facility);
};

export const getStaffByDepartment = (department: string): DemoStaffData[] => {
  return demoStaffData.filter(staff => staff.department === department);
};

export const getNursingStaffWithLeaderCapability = (): DemoStaffData[] => {
  return demoStaffData.filter(staff => 
    (staff.profession === '看護師' || staff.profession === '准看護師') && 
    staff.canPerformLeaderDuty === true
  );
};