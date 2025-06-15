import { User, StakeholderCategory, HierarchicalUser, AccountType } from '../../types';

export interface DemoUser extends HierarchicalUser {
  email: string;
  position: string;
  joinDate: Date;
  directReports?: number;
  stakeholderCategory: StakeholderCategory;
}

// 10-level permission system with interview booking functionality:
// 1: STAFF - 一般職員
// 2: SUPERVISOR - チーフ・主任
// 3: DEPARTMENT_HEAD - 係長・マネージャー
// 4: FACILITY_HEAD - 課長
// 5: HR_DEPARTMENT_HEAD - 人財統括本部 戦略企画・統括管理部門（面談予約窓口）
// 6: CAREER_SUPPORT_STAFF - 人財統括本部 キャリア支援部門員（面談実施者）
// 7: CAREER_SUPPORT_HEAD - 人財統括本部 各部門長
// 8: HR_DIRECTOR - 人財統括本部 統括管理部門長
// 9: EXECUTIVE_SECRETARY - 部長・本部長級
// 10: CHAIRMAN - 役員・経営層

// Account type mapping
export const ACCOUNT_TYPE_MAPPING: Record<number, AccountType> = {
  1: 'STAFF',
  2: 'SUPERVISOR',
  3: 'DEPARTMENT_HEAD',
  4: 'FACILITY_HEAD',
  5: 'HR_DEPARTMENT_HEAD',
  6: 'CAREER_SUPPORT_STAFF',
  7: 'CAREER_SUPPORT_HEAD',
  8: 'HR_DIRECTOR',
  9: 'EXECUTIVE_SECRETARY',
  10: 'CHAIRMAN'
};

// Budget approval limits (in JPY)
export const BUDGET_APPROVAL_LIMITS: Record<AccountType, number | null> = {
  'STAFF': 0,
  'SUPERVISOR': 100000,
  'DEPARTMENT_HEAD': 500000,
  'FACILITY_HEAD': 1000000,
  'HR_DEPARTMENT_HEAD': 2000000,
  'CAREER_SUPPORT_STAFF': 3000000,
  'CAREER_SUPPORT_HEAD': 5000000,
  'HR_DIRECTOR': 8000000,
  'EXECUTIVE_SECRETARY': 15000000,
  'CHAIRMAN': null // Unlimited
};