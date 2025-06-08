// Emergency Authority Service for crisis management

import {
  EmergencyLevel,
  EmergencyAuthority,
  EmergencyAction,
  AuthorityActionResult
} from '../types/authority';
import { HierarchicalUser } from '../types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { AuthorityManagementService } from './AuthorityManagementService';
import { v4 as uuidv4 } from 'uuid';

// Post-action report structure
interface PostActionReport {
  actionId: string;
  dueDate: Date;
  requiredDetails: string[];
  submitted: boolean;
  reminders: number;
}

export class EmergencyAuthorityService {
  private static instance: EmergencyAuthorityService;
  private emergencyActions: Map<string, EmergencyAction> = new Map();
  private postActionReports: Map<string, PostActionReport> = new Map();
  private authorityService: AuthorityManagementService;

  // Emergency scenarios
  private readonly EMERGENCY_SCENARIOS = {
    FACILITY: [
      'natural_disaster',
      'facility_accident',
      'critical_staffing_shortage',
      'equipment_failure',
      'security_breach'
    ],
    CORPORATE: [
      'data_breach',
      'financial_crisis',
      'regulatory_violation',
      'major_system_failure',
      'reputation_crisis'
    ],
    SYSTEM: [
      'complete_system_failure',
      'cyber_attack',
      'pandemic_response',
      'executive_incapacitation',
      'hostile_takeover'
    ]
  };

  private constructor() {
    this.authorityService = AuthorityManagementService.getInstance();
    this.startReportMonitor();
  }

  static getInstance(): EmergencyAuthorityService {
    if (!EmergencyAuthorityService.instance) {
      EmergencyAuthorityService.instance = new EmergencyAuthorityService();
    }
    return EmergencyAuthorityService.instance;
  }

  // Declare emergency and execute action
  async declareEmergency(
    actor: HierarchicalUser,
    emergencyLevel: EmergencyLevel,
    scenario: string,
    actionType: string,
    affectedResources: string[],
    reason: string
  ): Promise<AuthorityActionResult> {
    // Validate emergency scenario
    const validScenarios = this.EMERGENCY_SCENARIOS[emergencyLevel];
    if (!validScenarios.includes(scenario)) {
      return {
        success: false,
        actionId: '',
        message: `Invalid emergency scenario for ${emergencyLevel} level`,
        auditLogId: ''
      };
    }

    // Check emergency authority
    const hasAuthority = await this.authorityService.checkAuthority(
      actor,
      'EMERGENCY_ACTION',
      { emergencyLevel }
    );

    if (!hasAuthority) {
      return {
        success: false,
        actionId: '',
        message: `Insufficient authority for ${emergencyLevel} emergency action`,
        auditLogId: ''
      };
    }

    // Execute emergency action
    const result = await this.authorityService.executeAuthorityAction(
      actor,
      'EMERGENCY_ACTION',
      {
        emergencyLevel,
        scenario,
        type: actionType,
        resources: affectedResources,
        resourceType: 'emergency',
        resourceId: scenario
      },
      reason
    );

    if (result.success && result.actionId) {
      // Get the created emergency action
      const emergencyAction = await this.getEmergencyAction(result.actionId);
      if (emergencyAction) {
        // Schedule post-action report
        this.schedulePostActionReport(emergencyAction);
        
        // Notify chain of command
        await this.notifyChainOfCommand(actor, emergencyAction);
      }
    }

    return result;
  }

  // Submit post-action report
  async submitPostActionReport(
    actor: HierarchicalUser,
    actionId: string,
    reportDetails: {
      situation: string;
      actions_taken: string;
      resources_used: string;
      outcomes: string;
      crisis_description?: string;
      decision_rationale?: string;
      impact_assessment?: string;
      mitigation_plan?: string;
      full_report?: string;
      board_briefing?: string;
      stakeholder_communication?: string;
      recovery_plan?: string;
    }
  ): Promise<AuthorityActionResult> {
    const emergencyAction = this.emergencyActions.get(actionId);
    if (!emergencyAction) {
      return {
        success: false,
        actionId: '',
        message: 'Emergency action not found',
        auditLogId: ''
      };
    }

    // Verify actor is the one who declared emergency
    if (emergencyAction.actorId !== actor.id) {
      return {
        success: false,
        actionId: '',
        message: 'Only the declaring officer can submit the post-action report',
        auditLogId: ''
      };
    }

    // Check if report is already submitted
    if (emergencyAction.postActionReport) {
      return {
        success: false,
        actionId: '',
        message: 'Post-action report already submitted',
        auditLogId: ''
      };
    }

    // Validate required details based on emergency level
    const report = this.postActionReports.get(actionId);
    if (report) {
      const missingDetails = report.requiredDetails.filter(
        detail => !reportDetails[detail as keyof typeof reportDetails]
      );

      if (missingDetails.length > 0) {
        return {
          success: false,
          actionId: '',
          message: `Missing required details: ${missingDetails.join(', ')}`,
          auditLogId: ''
        };
      }
    }

    // Submit report
    emergencyAction.postActionReport = {
      submittedAt: new Date(),
      details: JSON.stringify(reportDetails),
      outcomes: reportDetails.outcomes,
      reviewedBy: []
    };

    // Mark report as submitted
    if (report) {
      report.submitted = true;
    }

    // Record submission
    const result = await this.authorityService.executeAuthorityAction(
      actor,
      'EMERGENCY_ACTION',
      {
        resourceType: 'post_action_report',
        resourceId: actionId,
        emergencyLevel: emergencyAction.emergencyLevel,
        reportDetails
      },
      'Post-action report submission'
    );

    // Notify reviewers
    await this.notifyReviewers(emergencyAction);

    return {
      ...result,
      message: 'Post-action report submitted successfully'
    };
  }

  // Review post-action report
  async reviewPostActionReport(
    reviewer: HierarchicalUser,
    actionId: string,
    feedback: string
  ): Promise<AuthorityActionResult> {
    const emergencyAction = this.emergencyActions.get(actionId);
    if (!emergencyAction || !emergencyAction.postActionReport) {
      return {
        success: false,
        actionId: '',
        message: 'Post-action report not found',
        auditLogId: ''
      };
    }

    // Check if reviewer has appropriate level
    const requiredLevel = this.getReviewerLevel(emergencyAction.emergencyLevel);
    if (reviewer.permissionLevel < requiredLevel) {
      return {
        success: false,
        actionId: '',
        message: 'Insufficient authority to review this report',
        auditLogId: ''
      };
    }

    // Add reviewer
    if (!emergencyAction.postActionReport.reviewedBy) {
      emergencyAction.postActionReport.reviewedBy = [];
    }
    emergencyAction.postActionReport.reviewedBy.push(reviewer.id);

    // Record review
    return await this.authorityService.executeAuthorityAction(
      reviewer,
      'EMERGENCY_ACTION',
      {
        resourceType: 'report_review',
        resourceId: actionId,
        feedback
      },
      'Post-action report review'
    );
  }

  // Get emergency actions
  getEmergencyActions(filters?: {
    actorId?: string;
    emergencyLevel?: EmergencyLevel;
    startDate?: Date;
    endDate?: Date;
    pendingReports?: boolean;
  }): EmergencyAction[] {
    let actions = Array.from(this.emergencyActions.values());

    if (filters) {
      if (filters.actorId) {
        actions = actions.filter(action => action.actorId === filters.actorId);
      }
      if (filters.emergencyLevel) {
        actions = actions.filter(action => action.emergencyLevel === filters.emergencyLevel);
      }
      if (filters.startDate) {
        actions = actions.filter(action => action.executedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        actions = actions.filter(action => action.executedAt <= filters.endDate!);
      }
      if (filters.pendingReports) {
        actions = actions.filter(action => !action.postActionReport);
      }
    }

    return actions.sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());
  }

  // Get pending reports for user
  getPendingReports(userId: string): EmergencyAction[] {
    return Array.from(this.emergencyActions.values())
      .filter(action => 
        action.actorId === userId && 
        !action.postActionReport
      );
  }

  // Private methods
  private async getEmergencyAction(actionId: string): Promise<EmergencyAction | undefined> {
    // In production, this would query from the authority service
    // For now, check local storage
    return this.emergencyActions.get(actionId);
  }

  private schedulePostActionReport(action: EmergencyAction): void {
    const deadlineHours = this.getReportingDeadline(action.emergencyLevel);
    const dueDate = new Date(action.executedAt.getTime() + deadlineHours * 60 * 60 * 1000);

    const report: any = {
      actionId: action.id,
      dueDate,
      requiredDetails: this.getRequiredDetails(action.emergencyLevel),
      submitted: false,
      reminders: 0
    };

    this.postActionReports.set(action.id, report);
    this.emergencyActions.set(action.id, action);
  }

  private getReportingDeadline(level: EmergencyLevel): number {
    switch (level) {
      case 'FACILITY': return 24;
      case 'CORPORATE': return 12;
      case 'SYSTEM': return 48;
      default: return 24;
    }
  }

  private getRequiredDetails(level: EmergencyLevel): string[] {
    switch (level) {
      case 'FACILITY':
        return ['situation', 'actions_taken', 'resources_used', 'outcomes'];
      case 'CORPORATE':
        return ['crisis_description', 'decision_rationale', 'impact_assessment', 'mitigation_plan'];
      case 'SYSTEM':
        return ['full_report', 'board_briefing', 'stakeholder_communication', 'recovery_plan'];
      default:
        return [];
    }
  }

  private getReviewerLevel(emergencyLevel: EmergencyLevel): PermissionLevel {
    switch (emergencyLevel) {
      case 'FACILITY': return PermissionLevel.LEVEL_6;
      case 'CORPORATE': return PermissionLevel.LEVEL_8;
      case 'SYSTEM': return PermissionLevel.LEVEL_8;
      default: return PermissionLevel.LEVEL_8;
    }
  }

  private async notifyChainOfCommand(actor: HierarchicalUser, action: EmergencyAction): Promise<void> {
    // In production, this would send actual notifications
    console.log(`Emergency ${action.emergencyLevel} declared by ${actor.name}`);
    console.log(`Affected resources: ${action.affectedResources.join(', ')}`);
  }

  private async notifyReviewers(action: EmergencyAction): Promise<void> {
    // In production, this would notify appropriate reviewers
    console.log(`Post-action report submitted for emergency ${action.id}`);
  }

  // Monitor for overdue reports
  private startReportMonitor(): void {
    setInterval(() => {
      const now = new Date();
      
      this.postActionReports.forEach((report, actionId) => {
        if (!report.submitted && now > report.dueDate) {
          this.sendReportReminder(actionId, report);
        }
      });
    }, 60 * 60 * 1000); // Check every hour
  }

  private sendReportReminder(actionId: string, report: any): void {
    const action = this.emergencyActions.get(actionId);
    if (!action) return;

    report.reminders++;
    
    console.log(`REMINDER: Post-action report overdue for emergency ${actionId}`);
    console.log(`Emergency level: ${action.emergencyLevel}`);
    console.log(`Due date: ${report.dueDate}`);
    console.log(`Reminders sent: ${report.reminders}`);

    // In production, escalate to higher management after multiple reminders
    if (report.reminders >= 3) {
      console.log('ESCALATION: Report severely overdue, notifying senior management');
    }
  }

  // Emergency response metrics
  getEmergencyMetrics(): {
    totalEmergencies: number;
    byLevel: Record<EmergencyLevel, number>;
    pendingReports: number;
    overdueReports: number;
    averageReportTime: number;
  } {
    const actions = Array.from(this.emergencyActions.values());
    const now = new Date();

    const byLevel: Record<EmergencyLevel, number> = {
      FACILITY: 0,
      CORPORATE: 0,
      SYSTEM: 0
    };

    actions.forEach(action => {
      byLevel[action.emergencyLevel]++;
    });

    const pendingReports = actions.filter(a => !a.postActionReport).length;
    
    const overdueReports = Array.from(this.postActionReports.values())
      .filter(r => !r.submitted && now > r.dueDate).length;

    const completedReports = actions.filter(a => a.postActionReport);
    const totalReportTime = completedReports.reduce((sum, action) => {
      if (action.postActionReport) {
        return sum + (action.postActionReport.submittedAt.getTime() - action.executedAt.getTime());
      }
      return sum;
    }, 0);

    return {
      totalEmergencies: actions.length,
      byLevel,
      pendingReports,
      overdueReports,
      averageReportTime: completedReports.length > 0 
        ? totalReportTime / completedReports.length / (1000 * 60 * 60) // in hours
        : 0
    };
  }
}