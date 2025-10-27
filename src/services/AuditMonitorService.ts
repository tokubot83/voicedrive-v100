// Audit Monitor Service for detecting suspicious activities
// Phase 2: Security feature enhancement

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Suspicious activity patterns
const PATTERNS = {
  RAPID_ACTIONS: { threshold: 10, timeWindowMinutes: 5 },
  UNUSUAL_HOURS: { startHour: 22, endHour: 6 },
  REPEATED_FAILURES: { threshold: 5, timeWindowMinutes: 10 },
  HIGH_VALUE_CHANGES: { budgetThreshold: 10000000 }, // 10 million yen
  PERMISSION_ESCALATION: { withinMinutes: 30 },
  BULK_DELETION: { threshold: 50, withinMinutes: 5 },
  CROSS_DEPARTMENT_ANOMALY: { threshold: 5, withinMinutes: 10 }
};

export class AuditMonitorService {
  private static instance: AuditMonitorService;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): AuditMonitorService {
    if (!AuditMonitorService.instance) {
      AuditMonitorService.instance = new AuditMonitorService();
    }
    return AuditMonitorService.instance;
  }

  /**
   * Start continuous monitoring for suspicious patterns
   */
  private startMonitoring(): void {
    // Monitor every 5 minutes
    setInterval(() => {
      this.runSecurityChecks();
    }, 5 * 60 * 1000);

    console.log('[AuditMonitor] Security monitoring started');
  }

  /**
   * Run all security checks
   */
  private async runSecurityChecks(): Promise<void> {
    try {
      await Promise.all([
        this.detectRapidActions(),
        this.detectUnusualHours(),
        this.detectRepeatedFailures(),
        this.detectHighValueChanges(),
        this.detectPermissionEscalation(),
        this.detectBulkDeletion(),
        this.detectCrossDepartmentAnomaly()
      ]);
    } catch (error) {
      console.error('[AuditMonitor] Error during security checks:', error);
    }
  }

  /**
   * Detect rapid actions (10+ actions in 5 minutes)
   */
  private async detectRapidActions(): Promise<void> {
    const cutoffTime = new Date(Date.now() - PATTERNS.RAPID_ACTIONS.timeWindowMinutes * 60 * 1000);

    // Group by userId and count actions
    const userActions = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: cutoffTime }
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gte: PATTERNS.RAPID_ACTIONS.threshold
          }
        }
      }
    });

    for (const userAction of userActions) {
      // Get related log IDs
      const logs = await prisma.auditLog.findMany({
        where: {
          userId: userAction.userId,
          createdAt: { gte: cutoffTime }
        },
        select: { id: true }
      });

      await this.createAlert({
        type: 'suspicious_activity',
        severity: 'high',
        description: `Rapid actions detected: ${userAction._count.id} actions in ${PATTERNS.RAPID_ACTIONS.timeWindowMinutes} minutes by user ${userAction.userId}`,
        relatedLogs: logs.map(log => log.id),
        detectedAt: new Date(),
        investigationStatus: 'pending'
      });
    }
  }

  /**
   * Detect unusual hours access (10 PM - 6 AM)
   */
  private async detectUnusualHours(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const unusualLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: oneDayAgo }
      }
    });

    // Filter by hour (manual filtering since Prisma doesn't support HOUR extraction)
    const suspiciousLogs = unusualLogs.filter(log => {
      const hour = log.createdAt.getHours();
      return hour >= PATTERNS.UNUSUAL_HOURS.startHour || hour <= PATTERNS.UNUSUAL_HOURS.endHour;
    });

    if (suspiciousLogs.length > 0) {
      // Group by user
      const userGroups = new Map<string, string[]>();
      suspiciousLogs.forEach(log => {
        if (!userGroups.has(log.userId)) {
          userGroups.set(log.userId, []);
        }
        userGroups.get(log.userId)!.push(log.id);
      });

      for (const [userId, logIds] of userGroups.entries()) {
        if (logIds.length >= 3) { // At least 3 unusual hour accesses
          await this.createAlert({
            type: 'access_anomaly',
            severity: 'medium',
            description: `Multiple activities during unusual hours (10 PM - 6 AM) by user ${userId}: ${logIds.length} actions`,
            relatedLogs: logIds,
            detectedAt: new Date(),
            investigationStatus: 'pending'
          });
        }
      }
    }
  }

  /**
   * Detect repeated failures (5+ failures in 10 minutes)
   */
  private async detectRepeatedFailures(): Promise<void> {
    const cutoffTime = new Date(Date.now() - PATTERNS.REPEATED_FAILURES.timeWindowMinutes * 60 * 1000);

    // Look for actions containing "FAILED", "ERROR", or "DENIED"
    const failedLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: cutoffTime },
        OR: [
          { action: { contains: 'FAILED' } },
          { action: { contains: 'ERROR' } },
          { action: { contains: 'DENIED' } }
        ]
      }
    });

    // Group by user
    const userFailures = new Map<string, string[]>();
    failedLogs.forEach(log => {
      if (!userFailures.has(log.userId)) {
        userFailures.set(log.userId, []);
      }
      userFailures.get(log.userId)!.push(log.id);
    });

    for (const [userId, logIds] of userFailures.entries()) {
      if (logIds.length >= PATTERNS.REPEATED_FAILURES.threshold) {
        await this.createAlert({
          type: 'suspicious_activity',
          severity: 'high',
          description: `Repeated failures detected: ${logIds.length} failed attempts in ${PATTERNS.REPEATED_FAILURES.timeWindowMinutes} minutes by user ${userId}`,
          relatedLogs: logIds,
          detectedAt: new Date(),
          investigationStatus: 'pending'
        });
      }
    }
  }

  /**
   * Detect high-value budget changes
   */
  private async detectHighValueChanges(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const budgetLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
        action: { contains: 'BUDGET' }
      }
    });

    for (const log of budgetLogs) {
      try {
        const newValues = typeof log.newValues === 'string'
          ? JSON.parse(log.newValues)
          : log.newValues;

        if (newValues?.budgetAmount && newValues.budgetAmount >= PATTERNS.HIGH_VALUE_CHANGES.budgetThreshold) {
          await this.createAlert({
            type: 'policy_violation',
            severity: 'high',
            description: `High-value budget approval: ¥${newValues.budgetAmount.toLocaleString()} by user ${log.userId}`,
            relatedLogs: [log.id],
            detectedAt: new Date(),
            investigationStatus: 'pending'
          });
        }
      } catch (error) {
        // Skip if newValues is not valid JSON
        continue;
      }
    }
  }

  /**
   * Detect permission escalation attempts
   */
  private async detectPermissionEscalation(): Promise<void> {
    const cutoffTime = new Date(Date.now() - PATTERNS.PERMISSION_ESCALATION.withinMinutes * 60 * 1000);

    const permissionLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: cutoffTime },
        OR: [
          { action: { contains: 'PERMISSION' } },
          { action: { contains: 'ROLE_CHANGE' } },
          { action: { contains: 'ESCALATE' } }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by user
    const userEscalations = new Map<string, string[]>();
    permissionLogs.forEach(log => {
      if (!userEscalations.has(log.userId)) {
        userEscalations.set(log.userId, []);
      }
      userEscalations.get(log.userId)!.push(log.id);
    });

    for (const [userId, logIds] of userEscalations.entries()) {
      if (logIds.length >= 2) { // Multiple permission changes
        await this.createAlert({
          type: 'policy_violation',
          severity: 'critical',
          description: `Multiple permission escalation attempts by user ${userId}: ${logIds.length} attempts within ${PATTERNS.PERMISSION_ESCALATION.withinMinutes} minutes`,
          relatedLogs: logIds,
          detectedAt: new Date(),
          investigationStatus: 'pending'
        });
      }
    }
  }

  /**
   * Detect bulk deletion operations
   */
  private async detectBulkDeletion(): Promise<void> {
    const cutoffTime = new Date(Date.now() - PATTERNS.BULK_DELETION.withinMinutes * 60 * 1000);

    const deletionLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: cutoffTime },
        OR: [
          { action: { contains: 'DELETE' } },
          { action: { contains: 'REMOVE' } },
          { action: { contains: 'BULK' } }
        ]
      }
    });

    // Group by user
    const userDeletions = new Map<string, string[]>();
    deletionLogs.forEach(log => {
      if (!userDeletions.has(log.userId)) {
        userDeletions.set(log.userId, []);
      }
      userDeletions.get(log.userId)!.push(log.id);
    });

    for (const [userId, logIds] of userDeletions.entries()) {
      if (logIds.length >= PATTERNS.BULK_DELETION.threshold) {
        await this.createAlert({
          type: 'suspicious_activity',
          severity: 'critical',
          description: `Bulk deletion detected: ${logIds.length} deletion operations in ${PATTERNS.BULK_DELETION.withinMinutes} minutes by user ${userId}`,
          relatedLogs: logIds,
          detectedAt: new Date(),
          investigationStatus: 'pending'
        });
      }
    }
  }

  /**
   * Detect cross-department access anomalies
   */
  private async detectCrossDepartmentAnomaly(): Promise<void> {
    const cutoffTime = new Date(Date.now() - PATTERNS.CROSS_DEPARTMENT_ANOMALY.withinMinutes * 60 * 1000);

    const crossDeptLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: cutoffTime },
        action: { contains: 'CROSS_DEPARTMENT' }
      }
    });

    // Group by user
    const userCrossDept = new Map<string, string[]>();
    crossDeptLogs.forEach(log => {
      if (!userCrossDept.has(log.userId)) {
        userCrossDept.set(log.userId, []);
      }
      userCrossDept.get(log.userId)!.push(log.id);
    });

    for (const [userId, logIds] of userCrossDept.entries()) {
      if (logIds.length >= PATTERNS.CROSS_DEPARTMENT_ANOMALY.threshold) {
        await this.createAlert({
          type: 'access_anomaly',
          severity: 'medium',
          description: `Unusual cross-department access pattern by user ${userId}: ${logIds.length} actions within ${PATTERNS.CROSS_DEPARTMENT_ANOMALY.withinMinutes} minutes`,
          relatedLogs: logIds,
          detectedAt: new Date(),
          investigationStatus: 'pending'
        });
      }
    }
  }

  /**
   * Create an audit alert
   */
  private async createAlert(alertData: {
    type: string;
    severity: string;
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
    investigationStatus: string;
  }): Promise<void> {
    try {
      // Check if similar alert already exists (prevent duplicates)
      const existingAlert = await prisma.auditAlert.findFirst({
        where: {
          type: alertData.type,
          description: alertData.description,
          investigationStatus: 'pending',
          detectedAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Within last hour
          }
        }
      });

      if (existingAlert) {
        // Update existing alert with new related logs
        await prisma.auditAlert.update({
          where: { id: existingAlert.id },
          data: {
            relatedLogs: {
              push: alertData.relatedLogs
            },
            detectedAt: alertData.detectedAt
          }
        });
      } else {
        // Create new alert
        await prisma.auditAlert.create({
          data: alertData
        });

        console.log(`[AuditMonitor] ALERT [${alertData.severity}]: ${alertData.description}`);
      }
    } catch (error) {
      console.error('[AuditMonitor] Failed to create alert:', error);
    }
  }

  /**
   * Manually trigger security checks (for testing or on-demand)
   */
  async runManualCheck(): Promise<void> {
    console.log('[AuditMonitor] Running manual security check...');
    await this.runSecurityChecks();
    console.log('[AuditMonitor] Manual security check completed');
  }

  /**
   * Get pending alerts count
   */
  async getPendingAlertsCount(): Promise<number> {
    return await prisma.auditAlert.count({
      where: {
        investigationStatus: 'pending'
      }
    });
  }

  /**
   * Get alerts by severity
   */
  async getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): Promise<any[]> {
    return await prisma.auditAlert.findMany({
      where: { severity },
      orderBy: { detectedAt: 'desc' },
      take: 100
    });
  }
}

// Export singleton instance
export default AuditMonitorService.getInstance();
