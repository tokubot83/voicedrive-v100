import { User, StakeholderCategory, HierarchicalUser, AccountType } from '../../types';

export interface DemoUser extends HierarchicalUser {
  email: string;
  position: string;
  joinDate: Date;
  directReports?: number;
  stakeholderCategory: StakeholderCategory;
}

// Permission levels and account types:
// 1: STAFF - Entry-level employee
// 2: SUPERVISOR - Senior employee/Supervisor
// 3: DEPARTMENT_HEAD - Department head
// 4: FACILITY_HEAD - Facility head
// 5: HR_DEPARTMENT_HEAD - HR department head
// 6: HR_DIRECTOR - HR director
// 7: EXECUTIVE_SECRETARY - Executive secretary
// 8: CHAIRMAN - Chairman/Executive

// Account type mapping
export const ACCOUNT_TYPE_MAPPING: Record<number, AccountType> = {
  1: 'STAFF',
  2: 'SUPERVISOR',
  3: 'DEPARTMENT_HEAD',
  4: 'FACILITY_HEAD',
  5: 'HR_DEPARTMENT_HEAD',
  6: 'HR_DIRECTOR',
  7: 'EXECUTIVE_SECRETARY',
  8: 'CHAIRMAN'
};

// Budget approval limits (in JPY)
export const BUDGET_APPROVAL_LIMITS: Record<AccountType, number | null> = {
  'STAFF': 0,
  'SUPERVISOR': 100000,
  'DEPARTMENT_HEAD': 500000,
  'FACILITY_HEAD': 1000000,
  'HR_DEPARTMENT_HEAD': 2000000,
  'HR_DIRECTOR': 5000000,
  'EXECUTIVE_SECRETARY': 10000000,
  'CHAIRMAN': null // Unlimited
};