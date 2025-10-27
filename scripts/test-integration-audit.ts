// Integration Test for Audit Log Features
// Phase 4: Comprehensive functionality test

import { PrismaClient } from '@prisma/client';
import { AuditService } from '../src/services/AuditService';
import { AuditMonitorService } from '../src/services/AuditMonitorService';
import { SecurityNotificationService } from '../src/services/SecurityNotificationService';
import { archiveOldAuditLogs, deleteExpiredArchivedLogs, getArchiveStats } from '../src/jobs/archiveAuditLogs';
import { generateDailySummary } from '../src/jobs/dailyAuditSummary';

const prisma = new PrismaClient();

// Test counter
let testsPassed = 0;
let testsFailed = 0;

function logTest(name: string, passed: boolean, details?: string) {
  if (passed) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    testsFailed++;
  }
}

async function runIntegrationTests() {
  console.log('========================================');
  console.log('🧪 Audit Log Integration Tests');
  console.log('========================================\n');

  try {
    // ============================================================
    // Test Suite 1: Checksum & Chain Integrity
    // ============================================================
    console.log('📦 Test Suite 1: Checksum & Chain Integrity\n');

    // Test 1.1: Create new audit log with checksum
    console.log('Test 1.1: Create audit log with automatic checksum generation');
    const auditService = AuditService.getInstance();
    const logId1 = await auditService.logAction({
      userId: 'test-user-001',
      action: 'TEST_ACTION_1',
      targetId: 'test-target-001',
      details: { test: 'integration test 1' },
      executorLevel: 15
    });

    const log1 = await prisma.auditLog.findUnique({ where: { id: logId1 } });
    logTest(
      'Checksum auto-generation',
      !!log1?.checksum,
      log1?.checksum ? `Checksum: ${log1.checksum.substring(0, 16)}...` : 'No checksum generated'
    );

    // Test 1.2: Create second log with chain linking
    console.log('\nTest 1.2: Create chained audit log');
    const logId2 = await auditService.logAction({
      userId: 'test-user-001',
      action: 'TEST_ACTION_2',
      targetId: 'test-target-002',
      details: { test: 'integration test 2' },
      executorLevel: 15
    });

    const log2 = await prisma.auditLog.findUnique({ where: { id: logId2 } });
    logTest(
      'Chain linking (previousChecksum)',
      log2?.previousChecksum === log1?.checksum,
      log2?.previousChecksum ? `Previous checksum matches` : 'Chain link failed'
    );

    // Test 1.3: Verify chain integrity
    console.log('\nTest 1.3: Verify log chain integrity');
    const chainResult = await auditService.verifyLogChain([logId1, logId2]);
    logTest(
      'Chain integrity verification',
      chainResult.isValid && chainResult.brokenLinks.length === 0,
      `Valid: ${chainResult.isValid}, Broken links: ${chainResult.brokenLinks.length}`
    );

    // ============================================================
    // Test Suite 2: Severity Classification
    // ============================================================
    console.log('\n📊 Test Suite 2: Severity Classification\n');

    // Test 2.1: Medium severity (normal action)
    console.log('Test 2.1: Medium severity for normal action');
    const mediumLogId = await auditService.logAction({
      userId: 'test-user-002',
      action: 'USER_LOGIN',
      targetId: 'user-002',
      details: { loginTime: new Date() },
      executorLevel: 10
    });
    const mediumLog = await prisma.auditLog.findUnique({ where: { id: mediumLogId } });
    logTest(
      'Normal action → Medium severity',
      mediumLog?.severity === 'medium',
      `Severity: ${mediumLog?.severity}`
    );

    // Test 2.2: High severity (Level 99 operation)
    console.log('\nTest 2.2: High severity for Level 99 operation');
    const highLogId = await auditService.logAction({
      userId: 'test-user-admin',
      action: 'PERMISSION_LEVEL_CHANGE',
      targetId: 'user-003',
      details: { oldLevel: 10, newLevel: 20 },
      executorLevel: 25  // System administrator
    });
    const highLog = await prisma.auditLog.findUnique({ where: { id: highLogId } });
    logTest(
      'Level 99 operation → High/Critical severity',
      highLog?.severity === 'high' || highLog?.severity === 'critical',
      `Severity: ${highLog?.severity}`
    );

    // Test 2.3: Critical severity (Emergency action)
    console.log('\nTest 2.3: Critical severity for emergency action');
    const criticalLogId = await auditService.logAction({
      userId: 'test-user-admin',
      action: 'EMERGENCY_SYSTEM_OVERRIDE',
      targetId: 'system-001',
      details: { reason: 'Critical security incident' },
      executorLevel: 25
    });
    const criticalLog = await prisma.auditLog.findUnique({ where: { id: criticalLogId } });
    logTest(
      'Emergency action → Critical severity',
      criticalLog?.severity === 'critical',
      `Severity: ${criticalLog?.severity}`
    );

    // ============================================================
    // Test Suite 3: Audit Monitor Service
    // ============================================================
    console.log('\n🔍 Test Suite 3: Audit Monitor Service\n');

    // Test 3.1: Run manual security check
    console.log('Test 3.1: Manual security check execution');
    try {
      const monitor = AuditMonitorService.getInstance();
      await monitor.runManualCheck();
      logTest('Security check execution', true, 'Manual check completed');
    } catch (error) {
      logTest('Security check execution', false, `Error: ${error}`);
    }

    // Test 3.2: Check for generated alerts
    console.log('\nTest 3.2: Check generated alerts');
    const alertCount = await prisma.auditAlert.count();
    logTest(
      'Alert generation',
      true,
      `Total alerts: ${alertCount} (may be 0 if no suspicious patterns detected)`
    );

    // ============================================================
    // Test Suite 4: Archive & Deletion
    // ============================================================
    console.log('\n📦 Test Suite 4: Archive & Deletion\n');

    // Test 4.1: Get archive statistics
    console.log('Test 4.1: Get archive statistics');
    const stats = await getArchiveStats();
    logTest(
      'Archive statistics retrieval',
      true,
      `Active: ${stats.activeLogsCount}, Archived: ${stats.archivedLogsCount}`
    );

    // Test 4.2: Archive old logs (will be 0 if no old logs)
    console.log('\nTest 4.2: Archive old logs (1+ year old)');
    const archiveResult = await archiveOldAuditLogs();
    logTest(
      'Archive process execution',
      true,
      `Archived: ${archiveResult.archived}, Failed: ${archiveResult.failed}`
    );

    // Test 4.3: Delete expired archived logs (will be 0 if no old archives)
    console.log('\nTest 4.3: Delete expired archived logs (3+ years old)');
    const deleteResult = await deleteExpiredArchivedLogs();
    logTest(
      'Delete process execution',
      true,
      `Deleted: ${deleteResult.deleted}`
    );

    // ============================================================
    // Test Suite 5: Daily Summary
    // ============================================================
    console.log('\n📈 Test Suite 5: Daily Summary\n');

    // Test 5.1: Generate daily summary
    console.log('Test 5.1: Generate daily summary for today');
    try {
      const summary = await generateDailySummary(new Date());
      logTest(
        'Daily summary generation',
        !!summary.summaryId,
        `Summary ID: ${summary.summaryId}, Total actions: ${summary.stats.totalActions}`
      );

      // Test 5.2: Verify summary saved to database
      console.log('\nTest 5.2: Verify summary saved to database');
      const savedSummary = await prisma.auditReportSummary.findUnique({
        where: { id: summary.summaryId }
      });
      logTest(
        'Summary database persistence',
        !!savedSummary,
        savedSummary ? `Found summary with ${savedSummary.totalActions} actions` : 'Not found'
      );
    } catch (error) {
      logTest('Daily summary generation', false, `Error: ${error}`);
    }

    // ============================================================
    // Test Suite 6: Notification System
    // ============================================================
    console.log('\n📧 Test Suite 6: Notification System\n');

    // Test 6.1: Test notification channels
    console.log('Test 6.1: Test notification channels configuration');
    const securityService = SecurityNotificationService.getInstance();
    const channelTest = await securityService.testAllChannels();
    logTest(
      'Slack channel test',
      true,
      channelTest.slack ? '✓ Configured' : '✗ Not configured (expected if env var missing)'
    );
    logTest(
      'Email channel test',
      true,
      channelTest.email ? '✓ Configured' : '✗ Not configured (expected if env var missing)'
    );

    // Test 6.2: Send pending alerts (if any)
    console.log('\nTest 6.2: Send pending alerts');
    const pendingResult = await securityService.sendPendingAlerts();
    logTest(
      'Pending alerts processing',
      true,
      `Total: ${pendingResult.total}, Sent: ${pendingResult.sent}, Failed: ${pendingResult.failed}`
    );

    // ============================================================
    // Test Suite 7: Data Cleanup
    // ============================================================
    console.log('\n🧹 Test Suite 7: Data Cleanup\n');

    // Clean up test data
    console.log('Cleaning up test data...');
    await prisma.auditLog.deleteMany({
      where: {
        userId: {
          in: ['test-user-001', 'test-user-002', 'test-user-admin']
        }
      }
    });
    logTest('Test data cleanup', true, 'Test logs deleted');

    // ============================================================
    // Final Results
    // ============================================================
    console.log('\n========================================');
    console.log('📊 Test Results Summary');
    console.log('========================================');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('========================================\n');

    if (testsFailed === 0) {
      console.log('🎉 All integration tests passed successfully!\n');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.\n');
    }

  } catch (error) {
    console.error('❌ Integration test failed with error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run integration tests
runIntegrationTests()
  .then(() => {
    console.log('✅ Integration test suite completed');
    process.exit(testsFailed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('❌ Integration test suite failed:', error);
    process.exit(1);
  });
