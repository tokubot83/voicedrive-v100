// Security Notification Service
// Phase 3: Integrated notification system (Slack + Email)

import SlackNotificationService from './SlackNotificationService';
import EmailNotificationService from './EmailNotificationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SecurityNotificationService {
  private static instance: SecurityNotificationService;
  private slackService: typeof SlackNotificationService;
  private emailService: typeof EmailNotificationService;

  private constructor() {
    this.slackService = SlackNotificationService;
    this.emailService = EmailNotificationService;
  }

  static getInstance(): SecurityNotificationService {
    if (!SecurityNotificationService.instance) {
      SecurityNotificationService.instance = new SecurityNotificationService();
    }
    return SecurityNotificationService.instance;
  }

  /**
   * Send security alert via all configured channels
   */
  async sendSecurityAlert(alertId: string): Promise<{
    slack: boolean;
    email: boolean;
  }> {
    try {
      // Fetch alert from database
      const alert = await prisma.auditAlert.findUnique({
        where: { id: alertId }
      });

      if (!alert) {
        console.error(`[SecurityNotification] Alert not found: ${alertId}`);
        return { slack: false, email: false };
      }

      // Parse relatedLogs if it's a JSON string
      const relatedLogs = typeof alert.relatedLogs === 'string'
        ? JSON.parse(alert.relatedLogs)
        : alert.relatedLogs;

      const alertData = {
        id: alert.id,
        type: alert.type,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        description: alert.description,
        relatedLogs: Array.isArray(relatedLogs) ? relatedLogs : [],
        detectedAt: alert.detectedAt
      };

      // Send notifications based on severity
      const results = await this.sendBySeverity(alertData);

      // Update alert with notification status
      await prisma.auditAlert.update({
        where: { id: alertId },
        data: {
          notifiedAt: new Date(),
          notificationStatus: this.getNotificationStatus(results)
        }
      });

      return results;
    } catch (error) {
      console.error('[SecurityNotification] Failed to send alert:', error);
      return { slack: false, email: false };
    }
  }

  /**
   * Send notifications based on severity level
   */
  private async sendBySeverity(alert: {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
  }): Promise<{ slack: boolean; email: boolean }> {
    const results = { slack: false, email: false };

    switch (alert.severity) {
      case 'critical':
        // Critical: Double notification (Slack + Email to multiple recipients)
        results.slack = await this.slackService.sendSecurityAlert(alert);
        results.email = await this.emailService.sendCriticalAlert(alert as any);
        console.log(`[SecurityNotification] Critical alert sent (Slack: ${results.slack}, Email: ${results.email})`);
        break;

      case 'high':
        // High: Slack + Email
        results.slack = await this.slackService.sendSecurityAlert(alert);
        results.email = await this.emailService.sendSecurityAlert(alert);
        console.log(`[SecurityNotification] High alert sent (Slack: ${results.slack}, Email: ${results.email})`);
        break;

      case 'medium':
        // Medium: Slack only
        results.slack = await this.slackService.sendSecurityAlert(alert);
        console.log(`[SecurityNotification] Medium alert sent (Slack: ${results.slack})`);
        break;

      case 'low':
        // Low: No immediate notification (included in daily summary)
        console.log(`[SecurityNotification] Low alert logged (no immediate notification): ${alert.id}`);
        break;
    }

    return results;
  }

  /**
   * Send daily summary via all channels
   */
  async sendDailySummary(date: Date = new Date()): Promise<{
    slack: boolean;
    email: boolean;
  }> {
    try {
      // Calculate date range (yesterday's data)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get statistics
      const [totalActions, criticalActions, highActions, newAlerts, topUsersData] = await Promise.all([
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            },
            severity: 'critical'
          }
        }),
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            },
            severity: 'high'
          }
        }),
        prisma.auditAlert.count({
          where: {
            detectedAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        prisma.auditLog.groupBy({
          by: ['userId'],
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 5
        })
      ]);

      const topUsers = topUsersData.map(user => ({
        userId: user.userId,
        count: user._count.id
      }));

      const summary = {
        date,
        totalActions,
        criticalActions,
        highActions,
        newAlerts,
        topUsers
      };

      // Send via all channels
      const [slack, email] = await Promise.all([
        this.slackService.sendDailySummary(summary),
        this.emailService.sendDailySummary(summary)
      ]);

      console.log(`[SecurityNotification] Daily summary sent (Slack: ${slack}, Email: ${email})`);

      return { slack, email };
    } catch (error) {
      console.error('[SecurityNotification] Failed to send daily summary:', error);
      return { slack: false, email: false };
    }
  }

  /**
   * Send maintenance notification
   */
  async sendMaintenanceNotification(result: {
    archived: number;
    deleted: number;
    activeLogsCount: number;
    archivedLogsCount: number;
  }): Promise<{ slack: boolean; email: boolean }> {
    try {
      // Send via Slack only (maintenance is not critical)
      const slack = await this.slackService.sendMaintenanceNotification(result);

      console.log(`[SecurityNotification] Maintenance notification sent (Slack: ${slack})`);

      return { slack, email: false };
    } catch (error) {
      console.error('[SecurityNotification] Failed to send maintenance notification:', error);
      return { slack: false, email: false };
    }
  }

  /**
   * Bulk send pending alerts (for batch processing)
   */
  async sendPendingAlerts(): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    try {
      // Find alerts that haven't been notified yet
      const pendingAlerts = await prisma.auditAlert.findMany({
        where: {
          notifiedAt: null,
          investigationStatus: 'pending'
        },
        take: 100 // Process max 100 at a time
      });

      if (pendingAlerts.length === 0) {
        console.log('[SecurityNotification] No pending alerts to send');
        return { total: 0, sent: 0, failed: 0 };
      }

      console.log(`[SecurityNotification] Processing ${pendingAlerts.length} pending alerts`);

      let sentCount = 0;
      let failedCount = 0;

      for (const alert of pendingAlerts) {
        const result = await this.sendSecurityAlert(alert.id);

        if (result.slack || result.email) {
          sentCount++;
        } else {
          failedCount++;
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`[SecurityNotification] Batch complete: ${sentCount} sent, ${failedCount} failed`);

      return {
        total: pendingAlerts.length,
        sent: sentCount,
        failed: failedCount
      };
    } catch (error) {
      console.error('[SecurityNotification] Failed to send pending alerts:', error);
      return { total: 0, sent: 0, failed: 0 };
    }
  }

  /**
   * Get notification status string
   */
  private getNotificationStatus(results: { slack: boolean; email: boolean }): string {
    if (results.slack && results.email) {
      return 'sent_all';
    } else if (results.slack) {
      return 'sent_slack';
    } else if (results.email) {
      return 'sent_email';
    } else {
      return 'failed';
    }
  }

  /**
   * Test all notification channels
   */
  async testAllChannels(): Promise<{
    slack: boolean;
    email: boolean;
  }> {
    console.log('[SecurityNotification] Testing all notification channels...');

    const [slack, email] = await Promise.all([
      this.slackService.testConnection(),
      this.emailService.testConnection()
    ]);

    console.log(`[SecurityNotification] Test results: Slack: ${slack}, Email: ${email}`);

    return { slack, email };
  }
}

// Export singleton instance
export default SecurityNotificationService.getInstance();
