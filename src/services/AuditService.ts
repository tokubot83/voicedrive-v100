// Comprehensive Audit Service for transparency and accountability

import {
  AuditLogEntry,
  AuthorityType,
  Grievance,
  QuarterlyReview,
  AuthorityActionResult
} from '../types/authority';
import { HierarchicalUser } from '../types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { v4 as uuidv4 } from 'uuid';

// Audit alert structure
interface AuditAlert {
  id: string;
  type: 'suspicious_activity' | 'policy_violation' | 'access_anomaly' | 'data_tampering';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  relatedLogs: string[];
  detectedAt: Date;
  investigationStatus: 'pending' | 'investigating' | 'resolved' | 'escalated';
  assignedTo?: string;
}

export class AuditService {
  private static instance: AuditService;
  private auditLogs: Map<string, AuditLogEntry> = new Map();
  private grievances: Map<string, Grievance> = new Map();
  private quarterlyReviews: Map<string, QuarterlyReview> = new Map();
  private auditAlerts: Map<string, AuditAlert> = new Map();

  // Suspicious patterns to monitor
  private readonly SUSPICIOUS_PATTERNS = {
    RAPID_ACTIONS: { threshold: 10, timeWindow: 300000 }, // 10 actions in 5 minutes
    UNUSUAL_HOURS: { startHour: 22, endHour: 6 }, // 10 PM to 6 AM
    REPEATED_FAILURES: { threshold: 5, timeWindow: 600000 }, // 5 failures in 10 minutes
    HIGH_VALUE_CHANGES: { budgetThreshold: 10000000 } // 10 million yen
  };

  private constructor() {
    this.startAuditMonitor();
    this.initializeQuarterlyReviewSchedule();
  }

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  // Log audit entry
  async logAuditEntry(
    actorId: string,
    actionType: AuthorityType,
    resourceType: string,
    resourceId: string,
    details: {
      previousState?: any;
      newState?: any;
      reason: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<string> {
    const entry: AuditLogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      actorId,
      actionType,
      resourceType,
      resourceId,
      previousState: details.previousState,
      newState: details.newState,
      reason: details.reason,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent
    };

    // Generate checksum for tamper protection
    entry.checksum = await this.generateChecksum(entry);
    
    this.auditLogs.set(entry.id, entry);

    // Check for suspicious patterns
    await this.checkSuspiciousActivity(actorId, actionType, entry);

    return entry.id;
  }

  // Verify audit log integrity
  async verifyAuditIntegrity(logId: string): Promise<boolean> {
    const entry = this.auditLogs.get(logId);
    if (!entry) return false;

    const expectedChecksum = await this.generateChecksum(entry);
    return entry.checksum === expectedChecksum;
  }

  // Submit anonymous grievance
  async submitGrievance(
    targetActionId: string,
    targetActionType: AuthorityType,
    description: string,
    evidence: string[],
    submitterId?: string
  ): Promise<AuthorityActionResult> {
    const grievance: Grievance = {
      id: uuidv4(),
      submitterId,
      isAnonymous: !submitterId,
      targetActionId,
      targetActionType,
      description,
      evidence,
      status: 'submitted',
      submittedAt: new Date()
    };

    this.grievances.set(grievance.id, grievance);

    // Assign to appropriate reviewer
    const assignedTo = await this.assignGrievanceReviewer(targetActionType);
    if (assignedTo) {
      grievance.assignedTo = assignedTo;
      grievance.status = 'under_review';
    }

    // Log the grievance submission (without revealing anonymous submitter)
    await this.logAuditEntry(
      submitterId || 'anonymous',
      'SYSTEM_OVERRIDE' as AuthorityType,
      'grievance',
      grievance.id,
      {
        reason: 'Grievance submitted',
        newState: { status: grievance.status, targetAction: targetActionId }
      }
    );

    return {
      success: true,
      actionId: grievance.id,
      message: `Grievance submitted ${submitterId ? '' : 'anonymously'}. ID: ${grievance.id}`,
      auditLogId: grievance.id
    };
  }

  // Process grievance
  async processGrievance(
    reviewer: HierarchicalUser,
    grievanceId: string,
    outcome: 'resolved' | 'dismissed',
    resolution: string,
    actions: string[]
  ): Promise<AuthorityActionResult> {
    const grievance = this.grievances.get(grievanceId);
    if (!grievance) {
      return {
        success: false,
        actionId: '',
        message: 'Grievance not found',
        auditLogId: ''
      };
    }

    // Verify reviewer authority
    if (reviewer.permissionLevel < PermissionLevel.LEVEL_6) {
      return {
        success: false,
        actionId: '',
        message: 'Insufficient authority to process grievances',
        auditLogId: ''
      };
    }

    // Update grievance
    grievance.status = outcome === 'resolved' ? 'resolved' : 'dismissed';
    grievance.resolution = {
      resolvedBy: reviewer.id,
      resolvedAt: new Date(),
      outcome: resolution,
      actions
    };

    // Log the resolution
    const auditId = await this.logAuditEntry(
      reviewer.id,
      'SYSTEM_OVERRIDE' as AuthorityType,
      'grievance_resolution',
      grievanceId,
      {
        previousState: { status: 'under_review' },
        newState: { status: grievance.status, outcome },
        reason: resolution
      }
    );

    return {
      success: true,
      actionId: grievanceId,
      message: `Grievance ${outcome}`,
      auditLogId: auditId
    };
  }

  // Create quarterly review
  async createQuarterlyReview(
    quarter: string,
    departmentId: string,
    reviewerIds: string[]
  ): Promise<QuarterlyReview> {
    const review: QuarterlyReview = {
      id: uuidv4(),
      quarter,
      departmentId,
      reviewers: reviewerIds.map(userId => ({
        userId,
        department: this.getReviewerDepartment(userId),
        assignedAt: new Date()
      })),
      completedReviews: [],
      status: 'scheduled',
      scheduledDate: this.getQuarterStartDate(quarter)
    };

    this.quarterlyReviews.set(review.id, review);
    return review;
  }

  // Submit quarterly review
  async submitQuarterlyReview(
    reviewer: HierarchicalUser,
    reviewId: string,
    findings: string[],
    recommendations: string[]
  ): Promise<AuthorityActionResult> {
    const review = this.quarterlyReviews.get(reviewId);
    if (!review) {
      return {
        success: false,
        actionId: '',
        message: 'Quarterly review not found',
        auditLogId: ''
      };
    }

    // Verify reviewer is assigned
    const isAssigned = review.reviewers.some(r => r.userId === reviewer.id);
    if (!isAssigned) {
      return {
        success: false,
        actionId: '',
        message: 'You are not assigned to this review',
        auditLogId: ''
      };
    }

    // Add completed review
    review.completedReviews.push({
      reviewerId: reviewer.id,
      completedAt: new Date(),
      findings,
      recommendations
    });

    // Update status if all reviews complete
    if (review.completedReviews.length === review.reviewers.length) {
      review.status = 'completed';
      review.completedDate = new Date();
    } else {
      review.status = 'in_progress';
    }

    // Log the review submission
    const auditId = await this.logAuditEntry(
      reviewer.id,
      'CROSS_DEPARTMENT_REVIEW' as AuthorityType,
      'quarterly_review',
      reviewId,
      {
        reason: 'Quarterly review submitted',
        newState: { findings: findings.length, recommendations: recommendations.length }
      }
    );

    return {
      success: true,
      actionId: reviewId,
      message: 'Quarterly review submitted successfully',
      auditLogId: auditId
    };
  }

  // Get audit logs with advanced filtering
  async getAuditLogs(filters?: {
    actorId?: string;
    actionType?: AuthorityType;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    verified?: boolean;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    let logs = Array.from(this.auditLogs.values());

    if (filters) {
      if (filters.actorId) {
        logs = logs.filter(log => log.actorId === filters.actorId);
      }
      if (filters.actionType) {
        logs = logs.filter(log => log.actionType === filters.actionType);
      }
      if (filters.resourceType) {
        logs = logs.filter(log => log.resourceType === filters.resourceType);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.verified !== undefined) {
        logs = await Promise.all(logs.map(async log => {
          const isVerified = await this.verifyAuditIntegrity(log.id);
          return isVerified === filters.verified ? log : null;
        })).then(results => results.filter(log => log !== null) as AuditLogEntry[]);
      }
    }

    // Sort by timestamp descending
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit if specified
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  // Get grievances
  getGrievances(filters?: {
    status?: Grievance['status'];
    targetActionType?: AuthorityType;
    submitterId?: string;
    assignedTo?: string;
  }): Grievance[] {
    let grievances = Array.from(this.grievances.values());

    if (filters) {
      if (filters.status) {
        grievances = grievances.filter(g => g.status === filters.status);
      }
      if (filters.targetActionType) {
        grievances = grievances.filter(g => g.targetActionType === filters.targetActionType);
      }
      if (filters.submitterId) {
        grievances = grievances.filter(g => g.submitterId === filters.submitterId);
      }
      if (filters.assignedTo) {
        grievances = grievances.filter(g => g.assignedTo === filters.assignedTo);
      }
    }

    return grievances.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Get quarterly reviews
  getQuarterlyReviews(filters?: {
    quarter?: string;
    departmentId?: string;
    status?: QuarterlyReview['status'];
    reviewerId?: string;
  }): QuarterlyReview[] {
    let reviews = Array.from(this.quarterlyReviews.values());

    if (filters) {
      if (filters.quarter) {
        reviews = reviews.filter(r => r.quarter === filters.quarter);
      }
      if (filters.departmentId) {
        reviews = reviews.filter(r => r.departmentId === filters.departmentId);
      }
      if (filters.status) {
        reviews = reviews.filter(r => r.status === filters.status);
      }
      if (filters.reviewerId) {
        reviews = reviews.filter(r => 
          r.reviewers.some(reviewer => reviewer.userId === filters.reviewerId) ||
          r.completedReviews.some(review => review.reviewerId === filters.reviewerId)
        );
      }
    }

    return reviews.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }

  // Get audit alerts
  getAuditAlerts(filters?: {
    type?: AuditAlert['type'];
    severity?: AuditAlert['severity'];
    investigationStatus?: AuditAlert['investigationStatus'];
    assignedTo?: string;
  }): any[] {
    let alerts = Array.from(this.auditAlerts.values());

    if (filters) {
      if (filters.type) {
        alerts = alerts.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.investigationStatus) {
        alerts = alerts.filter(a => a.investigationStatus === filters.investigationStatus);
      }
      if (filters.assignedTo) {
        alerts = alerts.filter(a => a.assignedTo === filters.assignedTo);
      }
    }

    return alerts.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  // Private methods
  private async generateChecksum(entry: AuditLogEntry): Promise<string> {
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
    
    // Use Web Crypto API for browser compatibility
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async checkSuspiciousActivity(
    actorId: string,
    actionType: AuthorityType,
    entry: AuditLogEntry
  ): Promise<void> {
    // Check rapid actions
    const recentActions = this.getRecentActionsCount(actorId, this.SUSPICIOUS_PATTERNS.RAPID_ACTIONS.timeWindow);
    if (recentActions >= this.SUSPICIOUS_PATTERNS.RAPID_ACTIONS.threshold) {
      await this.createAuditAlert(
        'suspicious_activity',
        'high',
        `Rapid actions detected: ${recentActions} actions in 5 minutes by ${actorId}`,
        [entry.id]
      );
    }

    // Check unusual hours
    const hour = entry.timestamp.getHours();
    if (hour >= this.SUSPICIOUS_PATTERNS.UNUSUAL_HOURS.startHour || 
        hour <= this.SUSPICIOUS_PATTERNS.UNUSUAL_HOURS.endHour) {
      await this.createAuditAlert(
        'access_anomaly',
        'medium',
        `Activity during unusual hours (${hour}:00) by ${actorId}`,
        [entry.id]
      );
    }

    // Check high-value changes
    if (actionType === 'BUDGET_APPROVAL' && entry.newState?.budgetAmount) {
      if (entry.newState.budgetAmount >= this.SUSPICIOUS_PATTERNS.HIGH_VALUE_CHANGES.budgetThreshold) {
        await this.createAuditAlert(
          'policy_violation',
          'high',
          `High-value budget approval: ¥${entry.newState.budgetAmount.toLocaleString()}`,
          [entry.id]
        );
      }
    }
  }

  private getRecentActionsCount(actorId: string, timeWindow: number): number {
    const cutoff = new Date(Date.now() - timeWindow);
    return Array.from(this.auditLogs.values())
      .filter(log => log.actorId === actorId && log.timestamp >= cutoff)
      .length;
  }

  private async createAuditAlert(
    type: AuditAlert['type'],
    severity: AuditAlert['severity'],
    description: string,
    relatedLogs: string[]
  ): Promise<void> {
    const alert: any = {
      id: uuidv4(),
      type,
      severity,
      description,
      relatedLogs,
      detectedAt: new Date(),
      investigationStatus: 'pending'
    };

    this.auditAlerts.set(alert.id, alert);

    // In production, notify security team
    console.log(`AUDIT ALERT [${severity}]: ${description}`);
  }

  private async assignGrievanceReviewer(actionType: AuthorityType): Promise<string | undefined> {
    // In production, assign based on action type and availability
    // For now, return mock reviewer
    return 'hr_director_001';
  }

  private getReviewerDepartment(userId: string): string {
    // In production, query user's department
    return 'department_' + userId;
  }

  private getQuarterStartDate(quarter: string): Date {
    const [year, q] = quarter.split('-Q');
    const quarterMonth = (parseInt(q) - 1) * 3;
    return new Date(parseInt(year), quarterMonth, 1);
  }

  private startAuditMonitor(): void {
    // Monitor for patterns and anomalies
    setInterval(() => {
      this.detectAnomalies();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private initializeQuarterlyReviewSchedule(): void {
    // Schedule quarterly reviews
    const currentQuarter = this.getCurrentQuarter();
    console.log(`Quarterly review schedule initialized for ${currentQuarter}`);
  }

  private getCurrentQuarter(): string {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `${now.getFullYear()}-Q${quarter}`;
  }

  private detectAnomalies(): void {
    // Detect patterns across all audit logs
    const alerts = this.getAuditAlerts({ investigationStatus: 'pending' });
    
    if (alerts.length > 10) {
      console.log(`WARNING: ${alerts.length} pending audit alerts require investigation`);
    }
  }

  // Generate audit report
  async generateAuditReport(startDate: Date, endDate: Date): Promise<{
    totalActions: number;
    actionsByType: Record<AuthorityType, number>;
    topActors: { actorId: string; count: number }[];
    grievances: { total: number; resolved: number; pending: number };
    alerts: { total: number; bySeverity: Record<string, number> };
    integrityIssues: number;
  }> {
    const logs = await this.getAuditLogs({ startDate, endDate });
    
    // Count actions by type
    const actionsByType: Record<AuthorityType, number> = {} as any;
    const actorCounts: Record<string, number> = {};
    let integrityIssues = 0;

    for (const log of logs) {
      // Count by type
      actionsByType[log.actionType] = (actionsByType[log.actionType] || 0) + 1;
      
      // Count by actor
      actorCounts[log.actorId] = (actorCounts[log.actorId] || 0) + 1;
      
      // Check integrity
      if (!(await this.verifyAuditIntegrity(log.id))) {
        integrityIssues++;
      }
    }

    // Top actors
    const topActors = Object.entries(actorCounts)
      .map(([actorId, count]) => ({ actorId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Grievance stats
    const allGrievances = this.getGrievances();
    const grievanceStats = {
      total: allGrievances.length,
      resolved: allGrievances.filter(g => g.status === 'resolved').length,
      pending: allGrievances.filter(g => g.status === 'submitted' || g.status === 'under_review').length
    };

    // Alert stats
    const alerts = this.getAuditAlerts();
    const alertsBySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    alerts.forEach(alert => {
      alertsBySeverity[alert.severity]++;
    });

    return {
      totalActions: logs.length,
      actionsByType,
      topActors,
      grievances: grievanceStats,
      alerts: {
        total: alerts.length,
        bySeverity: alertsBySeverity
      },
      integrityIssues
    };
  }
}