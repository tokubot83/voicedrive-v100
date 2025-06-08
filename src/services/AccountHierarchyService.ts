import { DemoUser, getDemoUserById, getDirectReports, getUserManager } from '../data/demo/users';
import { AccountType, HierarchicalUser } from '../types';

/**
 * Service for managing hierarchical account relationships and permissions
 */
export class AccountHierarchyService {
  /**
   * Check if a user has permission to view another user's data
   */
  static canViewUser(viewer: DemoUser, target: DemoUser): boolean {
    // Users can always view their own data
    if (viewer.id === target.id) return true;
    
    // Higher permission levels can view lower levels
    if (viewer.permissionLevel > target.permissionLevel) return true;
    
    // Check if viewer is in target's management chain
    if (this.isInManagementChain(viewer.id, target.id)) return true;
    
    // HR roles (level 5+) can view all users
    if (viewer.permissionLevel >= 5) return true;
    
    return false;
  }

  /**
   * Check if a user can approve budget for a specific amount
   */
  static canApproveBudget(user: DemoUser, amount: number): boolean {
    if (user.budgetApprovalLimit === undefined) {
      // Unlimited approval (CHAIRMAN)
      return true;
    }
    return amount <= user.budgetApprovalLimit;
  }

  /**
   * Get the next approver for a budget amount
   */
  static getNextApprover(currentUser: DemoUser, amount: number): DemoUser | null {
    // If current user can approve, no escalation needed
    if (this.canApproveBudget(currentUser, amount)) {
      return null;
    }

    // Walk up the management chain to find someone who can approve
    let manager = getUserManager(currentUser.id);
    while (manager) {
      if (this.canApproveBudget(manager, amount)) {
        return manager;
      }
      manager = getUserManager(manager.id);
    }

    return null;
  }

  /**
   * Check if a user is in another user's management chain
   */
  static isInManagementChain(managerId: string, employeeId: string): boolean {
    let currentUser = getDemoUserById(employeeId);
    
    while (currentUser && currentUser.parent_id) {
      if (currentUser.parent_id === managerId) {
        return true;
      }
      currentUser = getDemoUserById(currentUser.parent_id);
    }
    
    return false;
  }

  /**
   * Get all subordinates (direct and indirect) for a user
   */
  static getAllSubordinates(userId: string): DemoUser[] {
    const subordinates: DemoUser[] = [];
    const queue = [userId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const directReports = getDirectReports(currentId);
      subordinates.push(...directReports);
      queue.push(...directReports.map(u => u.id));
    }

    return subordinates;
  }

  /**
   * Get organizational statistics for a user
   */
  static getOrganizationStats(userId: string): {
    directReports: number;
    totalSubordinates: number;
    organizationDepth: number;
  } {
    const directReports = getDirectReports(userId);
    const allSubordinates = this.getAllSubordinates(userId);
    
    // Calculate max depth
    let maxDepth = 0;
    for (const subordinate of allSubordinates) {
      const depth = (subordinate.organizationPath?.length || 0) - (getDemoUserById(userId)?.organizationPath?.length || 0);
      maxDepth = Math.max(maxDepth, depth);
    }

    return {
      directReports: directReports.length,
      totalSubordinates: allSubordinates.length,
      organizationDepth: maxDepth
    };
  }

  /**
   * Get users by facility and optional department filter
   */
  static getUsersByFacility(facilityId: string, departmentId?: string): DemoUser[] {
    const { demoUsers } = require('../data/demo/users');
    
    return demoUsers.filter((user: DemoUser) => {
      const matchesFacility = user.facility_id === facilityId;
      const matchesDepartment = !departmentId || user.department_id === departmentId;
      return matchesFacility && matchesDepartment;
    });
  }

  /**
   * Get permission level label
   */
  static getPermissionLevelLabel(level: number): string {
    const labels: Record<number, string> = {
      1: 'スタッフ',
      2: 'スーパーバイザー',
      3: '部門長',
      4: '施設長',
      5: '人事部門長',
      6: '人事部長',
      7: '役員秘書',
      8: '理事長'
    };
    return labels[level] || 'Unknown';
  }

  /**
   * Get account type label
   */
  static getAccountTypeLabel(accountType: AccountType): string {
    const labels: Record<AccountType, string> = {
      'STAFF': 'スタッフ',
      'SUPERVISOR': 'スーパーバイザー',
      'DEPARTMENT_HEAD': '部門長',
      'FACILITY_HEAD': '施設長',
      'HR_DEPARTMENT_HEAD': '人事部門長',
      'HR_DIRECTOR': '人事部長',
      'EXECUTIVE_SECRETARY': '役員秘書',
      'CHAIRMAN': '理事長'
    };
    return labels[accountType];
  }

  /**
   * Format budget limit for display
   */
  static formatBudgetLimit(limit: number | undefined): string {
    if (limit === undefined) return '無制限';
    if (limit === 0) return '承認権限なし';
    
    // Format as Japanese Yen
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(limit);
  }
}