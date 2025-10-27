// Daily Audit Summary Batch Job
// Phase 3: Generate and send daily audit summary

import { PrismaClient } from '@prisma/client';
import SecurityNotificationService from '../services/SecurityNotificationService';

const prisma = new PrismaClient();

/**
 * Generate daily summary and save to database
 */
export async function generateDailySummary(date: Date = new Date()): Promise<{
  summaryId: string;
  stats: {
    totalActions: number;
    criticalActions: number;
    highActions: number;
    mediumActions: number;
    lowActions: number;
    uniqueUsers: number;
    newAlerts: number;
  };
}> {
  // Calculate date range (previous day)
  const targetDate = new Date(date);
  targetDate.setDate(targetDate.getDate() - 1);

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  console.log(`[DailySummary] Generating summary for ${targetDate.toLocaleDateString('ja-JP')}`);

  try {
    // Get all statistics in parallel
    const [
      totalActions,
      criticalActions,
      highActions,
      mediumActions,
      lowActions,
      uniqueUsersData,
      newAlerts,
      actionsByType,
      topUsers
    ] = await Promise.all([
      // Total actions count
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      }),

      // Critical actions count
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          severity: 'critical'
        }
      }),

      // High severity actions count
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          severity: 'high'
        }
      }),

      // Medium severity actions count
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          severity: 'medium'
        }
      }),

      // Low severity actions count
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          severity: 'low'
        }
      }),

      // Unique users count
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      }),

      // New alerts count
      prisma.auditAlert.count({
        where: {
          detectedAt: { gte: startOfDay, lte: endOfDay }
        }
      }),

      // Actions by type
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),

      // Top users
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    const uniqueUsers = uniqueUsersData.length;

    // Prepare data for AuditReportSummary table
    const actionTypeCounts: Record<string, number> = {};
    actionsByType.forEach(a => {
      actionTypeCounts[a.action] = a._count.id;
    });

    const summaryData = {
      reportDate: targetDate,
      totalActions,
      totalUsers: uniqueUsers,
      criticalActions,
      highActions,
      mediumActions,
      lowActions,
      actionTypeCounts, // JSON field
      topActors: topUsers.map(u => ({
        userId: u.userId,
        count: u._count.id
      })), // JSON field
      totalAlerts: newAlerts,
      pendingAlerts: 0, // TODO: Count pending alerts
      resolvedAlerts: 0, // TODO: Count resolved alerts
      integrityIssues: 0 // TODO: Track integrity issues
    };

    // Check if summary already exists for this date
    const existingSummary = await prisma.auditReportSummary.findUnique({
      where: { reportDate: targetDate }
    });

    let summary;
    if (existingSummary) {
      // Update existing summary
      summary = await prisma.auditReportSummary.update({
        where: { reportDate: targetDate },
        data: summaryData
      });
      console.log(`[DailySummary] Updated existing summary: ${summary.id}`);
    } else {
      // Create new summary
      summary = await prisma.auditReportSummary.create({
        data: summaryData
      });
      console.log(`[DailySummary] Created new summary: ${summary.id}`);
    }

    const stats = {
      totalActions,
      criticalActions,
      highActions,
      mediumActions,
      lowActions,
      uniqueUsers,
      newAlerts
    };

    console.log('[DailySummary] Statistics:', stats);

    return {
      summaryId: summary.id,
      stats
    };
  } catch (error) {
    console.error('[DailySummary] Failed to generate summary:', error);
    throw error;
  }
}

/**
 * Send daily summary notifications
 */
export async function sendDailySummaryNotifications(date: Date = new Date()): Promise<{
  slack: boolean;
  email: boolean;
}> {
  try {
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() - 1);

    console.log(`[DailySummary] Sending notifications for ${targetDate.toLocaleDateString('ja-JP')}`);

    const securityNotification = SecurityNotificationService;
    const result = await securityNotification.sendDailySummary(targetDate);

    console.log(`[DailySummary] Notifications sent: Slack: ${result.slack}, Email: ${result.email}`);

    return result;
  } catch (error) {
    console.error('[DailySummary] Failed to send notifications:', error);
    return { slack: false, email: false };
  }
}

/**
 * Get summary for a specific date
 */
export async function getSummaryByDate(date: Date): Promise<any | null> {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const summary = await prisma.auditReportSummary.findUnique({
      where: { reportDate: targetDate }
    });

    return summary;
  } catch (error) {
    console.error('[DailySummary] Failed to get summary:', error);
    return null;
  }
}

/**
 * Get summaries for a date range
 */
export async function getSummariesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  try {
    const summaries = await prisma.auditReportSummary.findMany({
      where: {
        reportDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        reportDate: 'desc'
      }
    });

    return summaries;
  } catch (error) {
    console.error('[DailySummary] Failed to get summaries:', error);
    return [];
  }
}

/**
 * Main daily summary job - generate and send
 */
export async function runDailySummaryJob(date: Date = new Date()): Promise<void> {
  console.log('========================================');
  console.log('[DailySummary] Starting daily summary job');
  console.log('========================================');

  try {
    // Step 1: Generate summary
    const { summaryId, stats } = await generateDailySummary(date);
    console.log(`[DailySummary] Summary generated: ${summaryId}`);
    console.log('[DailySummary] Stats:', JSON.stringify(stats, null, 2));

    // Step 2: Send notifications
    const notifications = await sendDailySummaryNotifications(date);
    console.log(`[DailySummary] Notifications: Slack: ${notifications.slack}, Email: ${notifications.email}`);

    console.log('========================================');
    console.log('[DailySummary] Daily summary job completed successfully');
    console.log('========================================');
  } catch (error) {
    console.error('[DailySummary] Daily summary job failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly (not imported)
// Note: In ES modules, use import.meta.url to check if run directly
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname.substring(1);
if (isMainModule) {
  // Get date from command line argument or use yesterday
  const dateArg = process.argv[2];
  const date = dateArg ? new Date(dateArg) : new Date();

  runDailySummaryJob(date)
    .then(() => {
      console.log('Daily summary job finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Daily summary job failed:', error);
      process.exit(1);
    });
}
