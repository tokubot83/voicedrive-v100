import { User, StakeholderCategory, HierarchicalUser, AccountType } from '../../types';

export interface DemoUser extends HierarchicalUser {
  email: string;
  position: string;
  joinDate: Date;
  directReports?: number;
  stakeholderCategory: StakeholderCategory;
}

// 13-level permission system with new project approval mapping:
// 1: STAFF - 一般職員
// 2: SUPERVISOR - チーフ・主任（チームレベル承認権限）
// 3: DEPARTMENT_HEAD - 係長・マネージャー（部門レベル承認権限）
// 4: FACILITY_HEAD - 課長（施設レベル承認権限）
// 5: HR_STRATEGIC - 人財統括本部 戦略企画・統括管理部門（法人レベル承認権限）
// 6: CAREER_SUPPORT_STAFF - 人財統括本部 キャリア支援部門員
// 7: CAREER_SUPPORT_HEAD - 人財統括本部 キャリア支援部門長
// 8: HR_DIRECTOR - 人財統括本部 統括管理部門長
// 9: DIRECTOR - 部長・本部長
// 10: HR_DEPARTMENT_HEAD - 人財統括本部 各部門長（特別プロジェクト承認）
// 11: HR_GENERAL_MANAGER - 人財統括本部 統括管理部門長（レビュー権限）
// 12: CEO - 人財統括本部 トップ（緊急オーバーライド権限）
// 13: CHAIRMAN - 理事長（最終承認権限）

// Account type mapping for 13-level system
export const ACCOUNT_TYPE_MAPPING: Record<number, AccountType> = {
  1: 'STAFF',
  2: 'SUPERVISOR',
  3: 'DEPARTMENT_HEAD',
  4: 'FACILITY_HEAD',
  5: 'HR_STRATEGIC',              // 新マッピング対応
  6: 'CAREER_SUPPORT_STAFF',
  7: 'CAREER_SUPPORT_HEAD',
  8: 'HR_DIRECTOR',
  9: 'DIRECTOR',                  // 新マッピング対応
  10: 'HR_DEPARTMENT_HEAD',       // 新マッピング対応
  11: 'HR_GENERAL_MANAGER',       // 新マッピング対応
  12: 'CEO',                      // 新マッピング対応
  13: 'CHAIRMAN'                  // 新マッピング対応
};

// Budget approval limits (in JPY) - 13-level system with new mapping
export const BUDGET_APPROVAL_LIMITS: Record<AccountType, number | null> = {
  'STAFF': 0,                     // 一般職員：承認権限なし
  'SUPERVISOR': 100000,           // チーフ・主任：10万円
  'DEPARTMENT_HEAD': 500000,      // 係長・マネージャー：50万円
  'FACILITY_HEAD': 2000000,       // 課長：200万円（新マッピング対応）
  'HR_STRATEGIC': 3000000,        // 人財戦略企画：300万円
  'CAREER_SUPPORT_STAFF': 5000000, // キャリア支援部門員：500万円
  'CAREER_SUPPORT_HEAD': 8000000, // キャリア支援部門長：800万円
  'HR_DIRECTOR': 12000000,        // 人財統括部門長：1200万円
  'DIRECTOR': 15000000,           // 部長・本部長：1500万円
  'HR_DEPARTMENT_HEAD': 20000000, // 人財統括本部各部門長：2000万円
  'HR_GENERAL_MANAGER': 30000000, // 人財統括本部統括管理部門長：3000万円
  'CEO': 50000000,                // 人財統括本部トップ：5000万円
  'CHAIRMAN': null                // 理事長：無制限
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