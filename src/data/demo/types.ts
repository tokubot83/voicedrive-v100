import { User, StakeholderCategory, HierarchicalUser, AccountType } from '../../types';

export interface DemoUser extends HierarchicalUser {
  email: string;
  position: string;
  joinDate: Date;
  directReports?: number;
  stakeholderCategory: StakeholderCategory;
  canPerformLeaderDuty?: boolean; // 看護職リーダー業務可否（0.5刻みレベル用）
}

// 25-level permission system (18基本 + 4看護職0.5刻み + 3特別権限):
// 1: 新人（1年目）
// 1.5: 新人看護師（リーダー可）
// 2: 若手（2-3年目）
// 2.5: 若手看護師（リーダー可）
// 3: 中堅（4-10年目）
// 3.5: 中堅看護師（リーダー可）
// 4: ベテラン（11年以上）
// 4.5: ベテラン看護師（リーダー可）
// 5: 副主任
// 6: 主任
// 7: 副師長・副科長・副課長
// 8: 師長・科長・課長・室長
// 9: 副部長
// 10: 部長・医局長
// 11: 事務長
// 12: 副院長
// 13: 院長・施設長
// 14: 人事部門員
// 15: 人事各部門長
// 16: 戦略企画・統括管理部門員
// 17: 戦略企画・統括管理部門長
// 18: 理事長・法人事務局長
// 97: 健診担当（特別権限）
// 98: 産業医（特別権限）
// 99: システム管理者（特別権限）

// Account type mapping for 25-level system
export const ACCOUNT_TYPE_MAPPING: Record<number, AccountType> = {
  1: 'NEW_STAFF',                 // 新人（1年目）
  1.5: 'NEW_NURSE_LEADER',        // 新人看護師（リーダー可）
  2: 'JUNIOR_STAFF',              // 若手（2-3年目）
  2.5: 'JUNIOR_NURSE_LEADER',     // 若手看護師（リーダー可）
  3: 'INTERMEDIATE_STAFF',        // 中堅（4-10年目）
  3.5: 'INTERMEDIATE_NURSE_LEADER', // 中堅看護師（リーダー可）
  4: 'VETERAN_STAFF',             // ベテラン（11年以上）
  4.5: 'VETERAN_NURSE_LEADER',    // ベテラン看護師（リーダー可）
  5: 'DEPUTY_CHIEF',              // 副主任
  6: 'CHIEF',                     // 主任
  7: 'DEPUTY_HEAD',               // 副師長・副科長・副課長
  8: 'MANAGER',                   // 師長・科長・課長・室長
  9: 'DEPUTY_DIRECTOR',           // 副部長
  10: 'DIRECTOR',                 // 部長・医局長
  11: 'ADMINISTRATIVE_DIRECTOR',  // 事務長
  12: 'VICE_PRESIDENT',           // 副院長
  13: 'PRESIDENT',                // 院長・施設長
  14: 'HR_STAFF',                 // 人事部門員
  15: 'HR_MANAGER',               // 人事各部門長
  16: 'STRATEGIC_PLANNING_STAFF', // 戦略企画・統括管理部門員
  17: 'STRATEGIC_PLANNING_MANAGER', // 戦略企画・統括管理部門長
  18: 'BOARD_MEMBER',             // 理事長・法人事務局長
  97: 'HEALTH_CHECKUP',           // 健診担当（特別権限）
  98: 'OCCUPATIONAL_PHYSICIAN',   // 産業医（特別権限）
  99: 'SYSTEM_ADMIN'              // システム管理者（特別権限）
};

// Budget approval limits (in JPY) - 25-level system
export const BUDGET_APPROVAL_LIMITS: Record<AccountType, number | null> = {
  'NEW_STAFF': 0,                      // 新人：承認権限なし
  'NEW_NURSE_LEADER': 0,               // 新人リーダー：承認権限なし
  'JUNIOR_STAFF': 0,                   // 若手：承認権限なし
  'JUNIOR_NURSE_LEADER': 0,            // 若手リーダー：承認権限なし
  'INTERMEDIATE_STAFF': 0,             // 中堅：承認権限なし
  'INTERMEDIATE_NURSE_LEADER': 0,      // 中堅リーダー：承認権限なし
  'VETERAN_STAFF': 0,                  // ベテラン：承認権限なし
  'VETERAN_NURSE_LEADER': 0,           // ベテランリーダー：承認権限なし
  'DEPUTY_CHIEF': 50000,               // 副主任：5万円
  'CHIEF': 100000,                     // 主任：10万円
  'DEPUTY_HEAD': 300000,               // 副師長・副科長・副課長：30万円
  'MANAGER': 500000,                   // 師長・科長・課長・室長：50万円
  'DEPUTY_DIRECTOR': 1000000,          // 副部長：100万円
  'DIRECTOR': 2000000,                 // 部長・医局長：200万円
  'ADMINISTRATIVE_DIRECTOR': 3000000,  // 事務長：300万円
  'VICE_PRESIDENT': 5000000,           // 副院長：500万円
  'PRESIDENT': 10000000,               // 院長・施設長：1000万円
  'HR_STAFF': 0,                       // 人事部門員：承認権限なし
  'HR_MANAGER': 3000000,               // 人事各部門長：300万円
  'STRATEGIC_PLANNING_STAFF': 5000000, // 戦略企画部門員：500万円
  'STRATEGIC_PLANNING_MANAGER': 10000000, // 戦略企画部門長：1000万円
  'BOARD_MEMBER': null,                // 理事長・法人事務局長：無制限
  'HEALTH_CHECKUP': 0,                 // 健診担当：承認権限なし
  'OCCUPATIONAL_PHYSICIAN': 0,         // 産業医：承認権限なし
  'SYSTEM_ADMIN': null,                // システム管理者：無制限
  // 旧システム互換性のため残す
  'STAFF': 0,
  'SUPERVISOR': 100000,
  'DEPARTMENT_HEAD': 500000,
  'FACILITY_HEAD': 2000000,
  'HR_STRATEGIC': 3000000,
  'CAREER_SUPPORT_STAFF': 5000000,
  'CAREER_SUPPORT_HEAD': 8000000,
  'HR_DIRECTOR': 12000000,
  'HR_DEPARTMENT_HEAD': 20000000,
  'HR_GENERAL_MANAGER': 30000000,
  'CEO': 50000000,
  'CHAIRMAN': null
};

// Project scope budget limits according to new mapping
export const PROJECT_SCOPE_BUDGET_LIMITS = {
  TEAM: 50000,        // チームレベル：5万円
  DEPARTMENT: 200000, // 部門レベル：20万円
  FACILITY: 10000000, // 施設レベル：1000万円
  ORGANIZATION: 20000000, // 法人レベル：2000万円
  STRATEGIC: -1       // 戦略レベル：無制限
};

// HR special category budget limits
export const HR_SPECIAL_BUDGET_LIMITS = {
  INTERVIEW_SYSTEM: 5000000,   // 面談システム関連：500万円
  TRAINING_CAREER: 3000000,    // 研修・キャリア支援：300万円
  HR_POLICY: 2000000,          // 人事政策：200万円
  STRATEGIC_HR: -1             // 戦略的人事企画：無制限
};