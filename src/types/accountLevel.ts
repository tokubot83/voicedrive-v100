/**
 * アカウントレベル型定義
 * 医療職員管理システムとの統合用
 *
 * 25種類の権限レベル：
 * - 基本18レベル（1-18）
 * - 看護職専用4レベル（1.5, 2.5, 3.5, 4.5）
 * - 特別権限3レベル（97, 98, 99）
 */

/**
 * 基本18レベル
 */
export enum BaseAccountLevel {
  // 一般職員層（1-4）
  NEW_STAFF = 1,
  JUNIOR_STAFF = 2,
  MIDLEVEL_STAFF = 3,
  VETERAN_STAFF = 4,

  // 役職層（5-11）
  DEPUTY_CHIEF = 5,
  CHIEF = 6,
  DEPUTY_MANAGER = 7,
  MANAGER = 8,
  DEPUTY_DIRECTOR = 9,
  DIRECTOR = 10,
  ADMINISTRATIVE_DIRECTOR = 11,

  // 施設経営層（12-13）
  VICE_PRESIDENT = 12,
  PRESIDENT = 13,

  // 法人人事部（14-17）
  HR_STAFF = 14,
  HR_MANAGER = 15,
  STRATEGIC_PLANNING_STAFF = 16,
  STRATEGIC_PLANNING_MANAGER = 17,

  // 最高経営層（18）
  BOARD_MEMBER = 18,
}

/**
 * 看護職専用レベル（0.5刻み）
 */
export enum NursingLeaderLevel {
  NEW_STAFF_LEADER = 1.5,
  JUNIOR_STAFF_LEADER = 2.5,
  MIDLEVEL_STAFF_LEADER = 3.5,
  VETERAN_STAFF_LEADER = 4.5,
}

/**
 * 特別権限レベル
 */
export enum SpecialAuthorityLevel {
  HEALTH_CHECKUP_STAFF = 97,      // 健診担当者（ストレスチェック実施者）
  OCCUPATIONAL_PHYSICIAN = 98,    // 産業医
  SYSTEM_ADMIN = 99,              // システム管理者
}

/**
 * 全権限レベルの統合型
 */
export type AccountLevel =
  | BaseAccountLevel
  | NursingLeaderLevel
  | SpecialAuthorityLevel;

/**
 * アカウントタイプ名（文字列）
 */
export type AccountTypeName =
  // 基本18レベル
  | 'NEW_STAFF'
  | 'JUNIOR_STAFF'
  | 'MIDLEVEL_STAFF'
  | 'VETERAN_STAFF'
  | 'DEPUTY_CHIEF'
  | 'CHIEF'
  | 'DEPUTY_MANAGER'
  | 'MANAGER'
  | 'DEPUTY_DIRECTOR'
  | 'DIRECTOR'
  | 'ADMINISTRATIVE_DIRECTOR'
  | 'VICE_PRESIDENT'
  | 'PRESIDENT'
  | 'HR_STAFF'
  | 'HR_MANAGER'
  | 'STRATEGIC_PLANNING_STAFF'
  | 'STRATEGIC_PLANNING_MANAGER'
  | 'BOARD_MEMBER'
  // 看護職専用（リーダー可フラグで区別）
  | 'NEW_STAFF_LEADER'
  | 'JUNIOR_STAFF_LEADER'
  | 'MIDLEVEL_STAFF_LEADER'
  | 'VETERAN_STAFF_LEADER'
  // 特別権限
  | 'HEALTH_CHECKUP_STAFF'
  | 'OCCUPATIONAL_PHYSICIAN'
  | 'SYSTEM_ADMIN';

/**
 * 職種カテゴリ
 */
export type ProfessionCategory =
  | 'nursing'           // 看護職
  | 'medical'           // 医療職（医師・薬剤師等）
  | 'administrative'    // 事務職
  | 'rehabilitation'    // リハビリ職
  | 'support'           // 補助職
  | 'management'        // 管理職
  | 'other';            // その他

/**
 * レベルからアカウントタイプ名へのマッピング
 */
export const LEVEL_TO_ACCOUNT_TYPE: Record<number, AccountTypeName> = {
  1: 'NEW_STAFF',
  1.5: 'NEW_STAFF_LEADER',
  2: 'JUNIOR_STAFF',
  2.5: 'JUNIOR_STAFF_LEADER',
  3: 'MIDLEVEL_STAFF',
  3.5: 'MIDLEVEL_STAFF_LEADER',
  4: 'VETERAN_STAFF',
  4.5: 'VETERAN_STAFF_LEADER',
  5: 'DEPUTY_CHIEF',
  6: 'CHIEF',
  7: 'DEPUTY_MANAGER',
  8: 'MANAGER',
  9: 'DEPUTY_DIRECTOR',
  10: 'DIRECTOR',
  11: 'ADMINISTRATIVE_DIRECTOR',
  12: 'VICE_PRESIDENT',
  13: 'PRESIDENT',
  14: 'HR_STAFF',
  15: 'HR_MANAGER',
  16: 'STRATEGIC_PLANNING_STAFF',
  17: 'STRATEGIC_PLANNING_MANAGER',
  18: 'BOARD_MEMBER',
  97: 'HEALTH_CHECKUP_STAFF',
  98: 'OCCUPATIONAL_PHYSICIAN',
  99: 'SYSTEM_ADMIN',
};

/**
 * アカウントタイプ名からレベルへのマッピング
 */
export const ACCOUNT_TYPE_TO_LEVEL: Record<AccountTypeName, number> = {
  'NEW_STAFF': 1,
  'NEW_STAFF_LEADER': 1.5,
  'JUNIOR_STAFF': 2,
  'JUNIOR_STAFF_LEADER': 2.5,
  'MIDLEVEL_STAFF': 3,
  'MIDLEVEL_STAFF_LEADER': 3.5,
  'VETERAN_STAFF': 4,
  'VETERAN_STAFF_LEADER': 4.5,
  'DEPUTY_CHIEF': 5,
  'CHIEF': 6,
  'DEPUTY_MANAGER': 7,
  'MANAGER': 8,
  'DEPUTY_DIRECTOR': 9,
  'DIRECTOR': 10,
  'ADMINISTRATIVE_DIRECTOR': 11,
  'VICE_PRESIDENT': 12,
  'PRESIDENT': 13,
  'HR_STAFF': 14,
  'HR_MANAGER': 15,
  'STRATEGIC_PLANNING_STAFF': 16,
  'STRATEGIC_PLANNING_MANAGER': 17,
  'BOARD_MEMBER': 18,
  'HEALTH_CHECKUP_STAFF': 97,
  'OCCUPATIONAL_PHYSICIAN': 98,
  'SYSTEM_ADMIN': 99,
};

/**
 * 日本語表示名
 */
export const ACCOUNT_TYPE_LABELS: Record<AccountTypeName, string> = {
  'NEW_STAFF': '新人（1年目）',
  'NEW_STAFF_LEADER': '新人（リーダー可）',
  'JUNIOR_STAFF': '若手（2-3年目）',
  'JUNIOR_STAFF_LEADER': '若手（リーダー可）',
  'MIDLEVEL_STAFF': '中堅（4-10年目）',
  'MIDLEVEL_STAFF_LEADER': '中堅（リーダー可）',
  'VETERAN_STAFF': 'ベテラン（11年以上）',
  'VETERAN_STAFF_LEADER': 'ベテラン（リーダー可）',
  'DEPUTY_CHIEF': '副主任',
  'CHIEF': '主任',
  'DEPUTY_MANAGER': '副師長・副科長',
  'MANAGER': '師長・科長・課長',
  'DEPUTY_DIRECTOR': '副部長',
  'DIRECTOR': '部長・医局長',
  'ADMINISTRATIVE_DIRECTOR': '事務長',
  'VICE_PRESIDENT': '副院長',
  'PRESIDENT': '院長・施設長',
  'HR_STAFF': '人事部門員',
  'HR_MANAGER': '人事各部門長',
  'STRATEGIC_PLANNING_STAFF': '戦略企画部門員',
  'STRATEGIC_PLANNING_MANAGER': '戦略企画部門長',
  'BOARD_MEMBER': '理事',
  'HEALTH_CHECKUP_STAFF': '健診担当者',
  'OCCUPATIONAL_PHYSICIAN': '産業医',
  'SYSTEM_ADMIN': 'システム管理者',
};

/**
 * 権限レベルの表示フォーマット
 * @param level 権限レベル
 * @returns フォーマット済み文字列
 */
export function formatPermissionLevel(level: number): string {
  if (level === 99) return 'X (システム管理者)';
  if (Number.isInteger(level)) return `Level ${level}`;
  return `Level ${Math.floor(level)} (リーダー可)`;
}

/**
 * 権限レベルの妥当性チェック
 * @param level 権限レベル
 * @returns 妥当かどうか
 */
export function isValidPermissionLevel(level: number): boolean {
  // 基本18レベル（1-18）
  if (level >= 1 && level <= 18 && Number.isInteger(level)) return true;

  // 看護職専用4レベル（1.5, 2.5, 3.5, 4.5）
  if ([1.5, 2.5, 3.5, 4.5].includes(level)) return true;

  // 特別権限3レベル（97, 98, 99）
  if ([97, 98, 99].includes(level)) return true;

  return false;
}

/**
 * 旧13レベルから新25種類へのマッピング（移行用）
 */
export const OLD_13_LEVEL_TO_NEW_LEVEL: Record<string, number> = {
  'STAFF': 1,                              // 暫定Level 1
  'SUPERVISOR': 6,                         // 主任
  'HEAD_NURSE': 8,                         // 師長
  'DEPARTMENT_HEAD': 10,                   // 部長
  'ADMINISTRATIVE_DIRECTOR': 11,           // 事務長
  'VICE_DIRECTOR': 12,                     // 副院長
  'HOSPITAL_DIRECTOR': 13,                 // 院長
  'HR_ADMIN_STAFF': 14,                    // 人事部門員
  'CAREER_SUPPORT_STAFF': 14,              // キャリア支援部門員
  'HR_DEPARTMENT_HEAD': 15,                // 人事部門長
  'HR_GENERAL_MANAGER': 17,                // 人事統括部門長
  'GENERAL_ADMINISTRATIVE_DIRECTOR': 18,   // 事務局長
  'CHAIRMAN': 18,                          // 理事長
};
