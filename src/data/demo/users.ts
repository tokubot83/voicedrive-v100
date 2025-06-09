import { AccountType } from '../../types';
import { DemoUser, ACCOUNT_TYPE_MAPPING, BUDGET_APPROVAL_LIMITS } from './types';

// Re-export shared types and constants for backward compatibility
export type { DemoUser } from './types';
export { ACCOUNT_TYPE_MAPPING, BUDGET_APPROVAL_LIMITS } from './types';

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