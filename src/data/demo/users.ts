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

// Import hierarchical users
import { hierarchicalDemoUsers } from './hierarchicalUsers';

// Export the hierarchical users as demoUsers for backward compatibility
export const demoUsers: DemoUser[] = hierarchicalDemoUsers;

// Helper function to get user by ID
export const getDemoUserById = (id: string): DemoUser | undefined => {
  return demoUsers.find(user => user.id === id);
};

// Helper function to get users by permission level
export const getDemoUsersByPermissionLevel = (level: number): DemoUser[] => {
  return demoUsers.filter(user => user.permissionLevel === level);
};

// Helper function to get users by department
export const getDemoUsersByDepartment = (department: string): DemoUser[] => {
  return demoUsers.filter(user => user.department === department);
};

// Helper function to get users by account type
export const getDemoUsersByAccountType = (accountType: AccountType): DemoUser[] => {
  return demoUsers.filter(user => user.accountType === accountType);
};

// Helper function to get users by facility
export const getDemoUsersByFacility = (facilityId: string): DemoUser[] => {
  return demoUsers.filter(user => user.facility_id === facilityId);
};

// Helper function to get direct reports
export const getDirectReports = (userId: string): DemoUser[] => {
  return demoUsers.filter(user => user.parent_id === userId);
};

// Helper function to get user's manager
export const getUserManager = (userId: string): DemoUser | undefined => {
  const user = getDemoUserById(userId);
  if (!user || !user.parent_id) return undefined;
  return getDemoUserById(user.parent_id);
};

// Helper function to get full hierarchy path
export const getUserHierarchyPath = (userId: string): DemoUser[] => {
  const user = getDemoUserById(userId);
  if (!user || !user.organizationPath) return [];
  
  return user.organizationPath
    .map(id => getDemoUserById(id))
    .filter((u): u is DemoUser => u !== undefined);
};

// Current logged-in demo user (default to level 5 manager)
export const getCurrentDemoUser = (): DemoUser => {
  return demoUsers[7]; // Default to user-8 (Manager)
};