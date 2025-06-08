// Core Authority Management Service

import { 
  AuthorityType, 
  AuthorityActionResult, 
  AuditLogEntry,
  AuthorityNotification,
  EmergencyLevel,
  EmergencyAuthority,
  EmergencyAction
} from '../types/authority';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { HierarchicalUser } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export class AuthorityManagementService {
  private static instance: AuthorityManagementService;
  private auditLogs: Map<string, AuditLogEntry> = new Map();
  private notifications: Map<string, AuthorityNotification[]> = new Map();
  private emergencyActions: Map<string, EmergencyAction> = new Map();

  // Emergency authority configuration
  private readonly EMERGENCY_AUTHORITIES: Record<EmergencyLevel, EmergencyAuthority> = {
    FACILITY: {
      level: 'FACILITY',
      requiredPermission: PermissionLevel.LEVEL_4,
      scope: ['facility_operations', 'local_resources', 'emergency_staffing'],
      reportingRequirements: {
        reportTo: [PermissionLevel.LEVEL_6, PermissionLevel.LEVEL_7],
        deadlineHours: 24,
        requiredDetails: ['situation', 'actions_taken', 'resources_used', 'outcomes']
      }
    },
    CORPORATE: {
      level: 'CORPORATE',
      requiredPermission: PermissionLevel.LEVEL_7,
      scope: ['cross_facility', 'budget_reallocation', 'policy_override'],
      reportingRequirements: {
        reportTo: [PermissionLevel.LEVEL_8],
        deadlineHours: 12,
        requiredDetails: ['crisis_description', 'decision_rationale', 'impact_assessment', 'mitigation_plan']
      }
    },
    SYSTEM: {
      level: 'SYSTEM',
      requiredPermission: PermissionLevel.LEVEL_8,
      scope: ['system_wide', 'all_resources', 'executive_override'],
      reportingRequirements: {
        reportTo: [], // Board level reporting
        deadlineHours: 48,
        requiredDetails: ['full_report', 'board_briefing', 'stakeholder_communication', 'recovery_plan']
      }
    }
  };

  private constructor() {}

  static getInstance(): AuthorityManagementService {
    if (!AuthorityManagementService.instance) {
      AuthorityManagementService.instance = new AuthorityManagementService();
    }
    return AuthorityManagementService.instance;
  }

  // Check if user has authority for specific action
  async checkAuthority(
    user: HierarchicalUser,
    authorityType: AuthorityType,
    context?: any
  ): Promise<boolean> {
    switch (authorityType) {
      case 'WEIGHT_ADJUSTMENT':
        return this.checkWeightAdjustmentAuthority(user, context);
      
      case 'BUDGET_APPROVAL':
        return this.checkBudgetApprovalAuthority(user, context);
      
      case 'EMERGENCY_ACTION':
        return this.checkEmergencyAuthority(user, context);
      
      case 'CROSS_DEPARTMENT_REVIEW':
        return this.checkCrossDepartmentReviewAuthority(user, context);
      
      case 'SYSTEM_OVERRIDE':
        return user.permissionLevel >= PermissionLevel.LEVEL_8;
      
      default:
        return false;
    }
  }

  // Execute authority action with full audit trail
  async executeAuthorityAction(
    user: HierarchicalUser,
    authorityType: AuthorityType,
    action: any,
    reason: string
  ): Promise<AuthorityActionResult> {
    // Check authority
    const hasAuthority = await this.checkAuthority(user, authorityType, action);
    if (!hasAuthority) {
      return {
        success: false,
        actionId: '',
        message: 'Insufficient authority for this action',
        auditLogId: ''
      };
    }

    // Create audit log entry
    const auditEntry = this.createAuditLogEntry(
      user.id,
      authorityType,
      action,
      reason
    );

    // Execute the action based on type
    let result: AuthorityActionResult;
    try {
      switch (authorityType) {
        case 'EMERGENCY_ACTION':
          result = await this.executeEmergencyAction(user, action, reason, auditEntry.id);
          break;
        
        default:
          result = {
            success: true,
            actionId: uuidv4(),
            message: 'Action executed successfully',
            auditLogId: auditEntry.id
          };
      }

      // Create notifications
      const notifications = await this.createActionNotifications(
        user,
        authorityType,
        action,
        result.actionId
      );
      result.notifications = notifications;

    } catch (error) {
      result = {
        success: false,
        actionId: '',
        message: `Action failed: ${error.message}`,
        auditLogId: auditEntry.id
      };
    }

    // Update audit log with result
    auditEntry.newState = { ...auditEntry.newState, result };
    this.auditLogs.set(auditEntry.id, auditEntry);

    return result;
  }

  // Emergency action execution
  private async executeEmergencyAction(
    user: HierarchicalUser,
    action: any,
    reason: string,
    auditLogId: string
  ): Promise<AuthorityActionResult> {
    const emergencyLevel = action.emergencyLevel as EmergencyLevel;
    const authority = this.EMERGENCY_AUTHORITIES[emergencyLevel];

    if (user.permissionLevel < authority.requiredPermission) {
      throw new Error(`Insufficient permission level for ${emergencyLevel} emergency action`);
    }

    const emergencyAction: EmergencyAction = {
      id: uuidv4(),
      actorId: user.id,
      emergencyLevel,
      actionType: action.type,
      affectedResources: action.resources || [],
      reason,
      executedAt: new Date()
    };

    this.emergencyActions.set(emergencyAction.id, emergencyAction);

    // Schedule post-action report reminder
    this.schedulePostActionReport(emergencyAction, authority.reportingRequirements);

    return {
      success: true,
      actionId: emergencyAction.id,
      message: `Emergency action executed. Post-action report due in ${authority.reportingRequirements.deadlineHours} hours.`,
      auditLogId
    };
  }

  // Create audit log entry with tamper protection
  private createAuditLogEntry(
    actorId: string,
    actionType: AuthorityType,
    action: any,
    reason: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      actorId,
      actionType,
      resourceType: action.resourceType || 'unknown',
      resourceId: action.resourceId || '',
      previousState: action.previousState,
      newState: action.newState,
      reason,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent
    };

    // Create checksum for tamper protection
    entry.checksum = this.generateChecksum(entry);
    
    this.auditLogs.set(entry.id, entry);
    return entry;
  }

  // Generate checksum for audit log integrity
  private generateChecksum(entry: AuditLogEntry): string {
    const content = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      actorId: entry.actorId,
      actionType: entry.actionType,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      previousState: entry.previousState,
      newState: entry.newState,
      reason: entry.reason
    });
    
    return createHash('sha256').update(content).digest('hex');
  }

  // Verify audit log integrity
  async verifyAuditLogIntegrity(logId: string): Promise<boolean> {
    const entry = this.auditLogs.get(logId);
    if (!entry) return false;

    const expectedChecksum = this.generateChecksum(entry);
    return entry.checksum === expectedChecksum;
  }

  // Create notifications for authority actions
  private async createActionNotifications(
    actor: HierarchicalUser,
    authorityType: AuthorityType,
    action: any,
    actionId: string
  ): Promise<AuthorityNotification[]> {
    const notifications: AuthorityNotification[] = [];
    const affectedUsers = await this.getAffectedUsers(authorityType, action);

    for (const userId of affectedUsers) {
      const notification: AuthorityNotification = {
        id: uuidv4(),
        recipientId: userId,
        type: this.getNotificationType(authorityType),
        title: this.getNotificationTitle(authorityType, actor),
        message: this.getNotificationMessage(authorityType, action, actor),
        actionRequired: this.isActionRequired(authorityType, userId),
        deadline: this.getActionDeadline(authorityType),
        relatedResourceId: actionId,
        relatedResourceType: authorityType,
        createdAt: new Date()
      };

      notifications.push(notification);
      
      // Store notification
      if (!this.notifications.has(userId)) {
        this.notifications.set(userId, []);
      }
      this.notifications.get(userId)!.push(notification);
    }

    return notifications;
  }

  // Authority checking methods
  private checkWeightAdjustmentAuthority(user: HierarchicalUser, context: any): boolean {
    // Department heads can adjust weights in their specialties
    if (user.permissionLevel >= PermissionLevel.LEVEL_3 && user.permissionLevel <= PermissionLevel.LEVEL_5) {
      return context && context.departmentSpecialty === user.department;
    }
    
    // HR Director supervises all weight adjustments
    if (user.permissionLevel === PermissionLevel.LEVEL_6) {
      return true;
    }
    
    return false;
  }

  private checkBudgetApprovalAuthority(user: HierarchicalUser, context: any): boolean {
    if (!context || !context.budgetAmount) return false;
    
    const budgetLimit = user.budgetApprovalLimit;
    if (!budgetLimit) return false;
    
    return context.budgetAmount <= budgetLimit;
  }

  private checkEmergencyAuthority(user: HierarchicalUser, context: any): boolean {
    if (!context || !context.emergencyLevel) return false;
    
    const emergencyLevel = context.emergencyLevel as EmergencyLevel;
    const requiredPermission = this.EMERGENCY_AUTHORITIES[emergencyLevel]?.requiredPermission;
    
    return user.permissionLevel >= requiredPermission;
  }

  private checkCrossDepartmentReviewAuthority(user: HierarchicalUser, context: any): boolean {
    // Department heads can review changes affecting their departments
    if (user.permissionLevel >= PermissionLevel.LEVEL_3) {
      return context && context.affectedDepartments?.includes(user.department_id);
    }
    return false;
  }

  // Helper methods
  private async getAffectedUsers(authorityType: AuthorityType, action: any): Promise<string[]> {
    // In a real implementation, this would query the database
    // For now, return mock affected users based on action type
    switch (authorityType) {
      case 'WEIGHT_ADJUSTMENT':
        return action.affectedDepartments?.map((d: string) => `head_${d}`) || [];
      
      case 'EMERGENCY_ACTION':
        // Notify all senior management
        return ['hr_director', 'facility_head', 'executive'];
      
      default:
        return [];
    }
  }

  private getNotificationType(authorityType: AuthorityType): AuthorityNotification['type'] {
    switch (authorityType) {
      case 'WEIGHT_ADJUSTMENT':
        return 'weight_adjustment';
      case 'EMERGENCY_ACTION':
        return 'emergency_action';
      default:
        return 'approval_required';
    }
  }

  private getNotificationTitle(authorityType: AuthorityType, actor: HierarchicalUser): string {
    switch (authorityType) {
      case 'WEIGHT_ADJUSTMENT':
        return `Weight Adjustment by ${actor.name}`;
      case 'EMERGENCY_ACTION':
        return `Emergency Action Taken by ${actor.name}`;
      default:
        return `Authority Action by ${actor.name}`;
    }
  }

  private getNotificationMessage(
    authorityType: AuthorityType, 
    action: any, 
    actor: HierarchicalUser
  ): string {
    // Generate appropriate message based on authority type
    return `${actor.name} has executed a ${authorityType} action. Please review if necessary.`;
  }

  private isActionRequired(authorityType: AuthorityType, userId: string): boolean {
    // Determine if the recipient needs to take action
    return authorityType === 'CROSS_DEPARTMENT_REVIEW';
  }

  private getActionDeadline(authorityType: AuthorityType): Date | undefined {
    const now = new Date();
    switch (authorityType) {
      case 'CROSS_DEPARTMENT_REVIEW':
        // 48 hours for veto
        return new Date(now.getTime() + 48 * 60 * 60 * 1000);
      default:
        return undefined;
    }
  }

  private schedulePostActionReport(
    action: EmergencyAction,
    requirements: EmergencyAuthority['reportingRequirements']
  ): void {
    // In a real implementation, this would schedule a job
    // For now, we'll just log it
    console.log(`Post-action report scheduled for emergency action ${action.id}`);
    console.log(`Due in ${requirements.deadlineHours} hours`);
    console.log(`Required details: ${requirements.requiredDetails.join(', ')}`);
  }

  // Get user notifications
  getUserNotifications(userId: string): AuthorityNotification[] {
    return this.notifications.get(userId) || [];
  }

  // Get audit logs with filtering
  getAuditLogs(filters?: {
    actorId?: string;
    actionType?: AuthorityType;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    let logs = Array.from(this.auditLogs.values());

    if (filters) {
      if (filters.actorId) {
        logs = logs.filter(log => log.actorId === filters.actorId);
      }
      if (filters.actionType) {
        logs = logs.filter(log => log.actionType === filters.actionType);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}