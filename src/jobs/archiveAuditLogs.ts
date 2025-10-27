// Archive and Delete Audit Logs Batch Job
// Phase 3: Optimization - Archive logs older than 1 year, delete logs older than 3 years

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Archive logs older than 1 year (move to AuditLogArchive table)
 */
export async function archiveOldAuditLogs(): Promise<{
  archived: number;
  failed: number;
}> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  console.log(`[ArchiveBatch] Archiving logs older than ${oneYearAgo.toISOString()}`);

  try {
    // Find logs older than 1 year
    const oldLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          lt: oneYearAgo
        }
      }
    });

    if (oldLogs.length === 0) {
      console.log('[ArchiveBatch] No logs to archive');
      return { archived: 0, failed: 0 };
    }

    console.log(`[ArchiveBatch] Found ${oldLogs.length} logs to archive`);

    let archivedCount = 0;
    let failedCount = 0;

    // Archive logs in batches of 100 for better performance
    const batchSize = 100;
    for (let i = 0; i < oldLogs.length; i += batchSize) {
      const batch = oldLogs.slice(i, i + batchSize);

      try {
        // Create archive records
        await prisma.auditLogArchive.createMany({
          data: batch.map(log => ({
            userId: log.userId,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            oldValues: typeof log.oldValues === 'string' ? log.oldValues : JSON.stringify(log.oldValues),
            newValues: typeof log.newValues === 'string' ? log.newValues : JSON.stringify(log.newValues),
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            severity: log.severity,
            checksum: log.checksum,
            previousChecksum: log.previousChecksum,
            executorLevel: log.executorLevel,
            isEmergencyAction: log.isEmergencyAction,
            archivedAt: new Date(),
            originalCreatedAt: log.createdAt
          }))
        });

        // Delete original logs
        await prisma.auditLog.deleteMany({
          where: {
            id: {
              in: batch.map(log => log.id)
            }
          }
        });

        archivedCount += batch.length;
        console.log(`[ArchiveBatch] Archived batch ${i / batchSize + 1}: ${batch.length} logs`);
      } catch (error) {
        console.error(`[ArchiveBatch] Failed to archive batch ${i / batchSize + 1}:`, error);
        failedCount += batch.length;
      }
    }

    console.log(`[ArchiveBatch] Complete: ${archivedCount} archived, ${failedCount} failed`);

    return { archived: archivedCount, failed: failedCount };
  } catch (error) {
    console.error('[ArchiveBatch] Error during archive process:', error);
    throw error;
  }
}

/**
 * Delete archived logs older than 3 years (legal retention period ended)
 */
export async function deleteExpiredArchivedLogs(): Promise<{
  deleted: number;
}> {
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  console.log(`[DeleteBatch] Deleting archived logs older than ${threeYearsAgo.toISOString()}`);

  try {
    const result = await prisma.auditLogArchive.deleteMany({
      where: {
        originalCreatedAt: {
          lt: threeYearsAgo
        }
      }
    });

    console.log(`[DeleteBatch] Deleted ${result.count} expired archived logs`);

    return { deleted: result.count };
  } catch (error) {
    console.error('[DeleteBatch] Error during delete process:', error);
    throw error;
  }
}

/**
 * Get archive statistics
 */
export async function getArchiveStats(): Promise<{
  activeLogsCount: number;
  archivedLogsCount: number;
  oldestActiveLog: Date | null;
  oldestArchivedLog: Date | null;
}> {
  const [activeCount, archivedCount, oldestActive, oldestArchived] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLogArchive.count(),
    prisma.auditLog.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    }),
    prisma.auditLogArchive.findFirst({
      orderBy: { originalCreatedAt: 'asc' },
      select: { originalCreatedAt: true }
    })
  ]);

  return {
    activeLogsCount: activeCount,
    archivedLogsCount: archivedCount,
    oldestActiveLog: oldestActive?.createdAt || null,
    oldestArchivedLog: oldestArchived?.originalCreatedAt || null
  };
}

/**
 * Main batch job - run both archive and delete
 */
export async function runAuditLogMaintenance(): Promise<void> {
  console.log('========================================');
  console.log('[AuditLogMaintenance] Starting maintenance job');
  console.log('========================================');

  try {
    // Step 1: Get current stats
    const statsBefore = await getArchiveStats();
    console.log('[AuditLogMaintenance] Stats before:', statsBefore);

    // Step 2: Archive old logs
    const archiveResult = await archiveOldAuditLogs();
    console.log(`[AuditLogMaintenance] Archive result: ${archiveResult.archived} archived, ${archiveResult.failed} failed`);

    // Step 3: Delete expired archived logs
    const deleteResult = await deleteExpiredArchivedLogs();
    console.log(`[AuditLogMaintenance] Delete result: ${deleteResult.deleted} deleted`);

    // Step 4: Get final stats
    const statsAfter = await getArchiveStats();
    console.log('[AuditLogMaintenance] Stats after:', statsAfter);

    console.log('========================================');
    console.log('[AuditLogMaintenance] Maintenance job completed successfully');
    console.log('========================================');
  } catch (error) {
    console.error('[AuditLogMaintenance] Maintenance job failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly (not imported)
// Note: In ES modules, use import.meta.url to check if run directly
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname.substring(1);
if (isMainModule) {
  runAuditLogMaintenance()
    .then(() => {
      console.log('Batch job finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Batch job failed:', error);
      process.exit(1);
    });
}
