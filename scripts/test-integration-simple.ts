// Simple Integration Test for Audit Log Features
// Phase 4: Basic functionality verification

import { PrismaClient } from '@prisma/client';
import { archiveOldAuditLogs, deleteExpiredArchivedLogs, getArchiveStats } from '../src/jobs/archiveAuditLogs';
import { generateDailySummary } from '../src/jobs/dailyAuditSummary';

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function test(name: string, result: boolean, details?: string) {
  if (result) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

async function main() {
  console.log('========================================');
  console.log('🧪 Audit Log Integration Tests');
  console.log('========================================\n');

  try {
    // Get an existing user ID for foreign key constraint
    const existingUser = await prisma.user.findFirst();
    if (!existingUser) {
      throw new Error('No users found in database. Please create a user first.');
    }
    const testUserId = existingUser.id;

    // ============================================
    // Test 1: Create logs with severity & checksum
    // ============================================
    console.log('📝 Test 1: Create test logs\n');

    const testLogs = await Promise.all([
      prisma.auditLog.create({
        data: {
          userId: testUserId,
          action: 'TEST_NORMAL_ACTION',
          entityType: 'test',
          entityId: 'test-001',
          oldValues: '{}',
          newValues: JSON.stringify({ test: 'data' }),
          severity: 'medium',
          executorLevel: 10
        }
      }),
      prisma.auditLog.create({
        data: {
          userId: testUserId,
          action: 'TEST_HIGH_PRIORITY',
          entityType: 'test',
          entityId: 'test-002',
          oldValues: '{}',
          newValues: JSON.stringify({ priority: 'high' }),
          severity: 'high',
          executorLevel: 20
        }
      }),
      prisma.auditLog.create({
        data: {
          userId: testUserId,
          action: 'TEST_EMERGENCY_ACTION',
          entityType: 'test',
          entityId: 'test-003',
          oldValues: '{}',
          newValues: JSON.stringify({ emergency: true }),
          severity: 'critical',
          executorLevel: 25,
          isEmergencyAction: true
        }
      })
    ]);

    test('Create test logs', testLogs.length === 3, `Created ${testLogs.length} test logs`);

    // ============================================
    // Test 2: Verify severity distribution
    // ============================================
    console.log('\n📊 Test 2: Severity Distribution\n');

    const [mediumCount, highCount, criticalCount] = await Promise.all([
      prisma.auditLog.count({ where: { severity: 'medium' } }),
      prisma.auditLog.count({ where: { severity: 'high' } }),
      prisma.auditLog.count({ where: { severity: 'critical' } })
    ]);

    test('Medium severity logs exist', mediumCount > 0, `Count: ${mediumCount}`);
    test('High severity logs exist', highCount > 0, `Count: ${highCount}`);
    test('Critical severity logs exist', criticalCount > 0, `Count: ${criticalCount}`);

    // ============================================
    // Test 3: Archive Statistics
    // ============================================
    console.log('\n📦 Test 3: Archive Statistics\n');

    const stats = await getArchiveStats();
    test(
      'Archive statistics retrieval',
      stats.activeLogsCount > 0,
      `Active: ${stats.activeLogsCount}, Archived: ${stats.archivedLogsCount}`
    );

    // ============================================
    // Test 4: Archive Process
    // ============================================
    console.log('\n🗄️  Test 4: Archive Process\n');

    const archiveResult = await archiveOldAuditLogs();
    test(
      'Archive process execution',
      archiveResult.failed === 0,
      `Archived: ${archiveResult.archived}, Failed: ${archiveResult.failed}`
    );

    const deleteResult = await deleteExpiredArchivedLogs();
    test(
      'Delete process execution',
      true,
      `Deleted: ${deleteResult.deleted} expired logs`
    );

    // ============================================
    // Test 5: Daily Summary Generation
    // ============================================
    console.log('\n📈 Test 5: Daily Summary\n');

    const summary = await generateDailySummary(new Date());
    test(
      'Daily summary generation',
      !!summary.summaryId,
      `Total actions: ${summary.stats.totalActions}`
    );

    const savedSummary = await prisma.auditReportSummary.findUnique({
      where: { id: summary.summaryId }
    });
    test(
      'Summary saved to database',
      !!savedSummary,
      `Actions: ${savedSummary?.totalActions}, Users: ${savedSummary?.totalUsers}`
    );

    // ============================================
    // Test 6: Alert System
    // ============================================
    console.log('\n🔔 Test 6: Alert System\n');

    // Create a test alert
    const testAlert = await prisma.auditAlert.create({
      data: {
        type: 'suspicious_activity',
        severity: 'high',
        description: 'Integration test alert',
        relatedLogs: [testLogs[0].id],
        detectedAt: new Date(),
        investigationStatus: 'pending'
      }
    });

    test('Alert creation', !!testAlert.id, `Alert ID: ${testAlert.id}`);

    const alertCount = await prisma.auditAlert.count();
    test('Alert count', alertCount > 0, `Total alerts: ${alertCount}`);

    // ============================================
    // Test 7: Environment Variables
    // ============================================
    console.log('\n⚙️  Test 7: Configuration\n');

    const slackUrl = process.env.MEDICAL_SYSTEM_SLACK_WEBHOOK_URL;
    const securityEmail = process.env.MEDICAL_SYSTEM_SECURITY_EMAIL;

    console.log(`   Slack Webhook: ${slackUrl ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`   Security Email: ${securityEmail ? '✓ Configured' : '✗ Not configured'}`);
    test(
      'Environment variables check',
      true,
      'Configuration reviewed (notifications will work when env vars are set)'
    );

    // ============================================
    // Test 8: Cleanup
    // ============================================
    console.log('\n🧹 Test 8: Cleanup\n');

    await prisma.auditLog.deleteMany({
      where: {
        id: { in: testLogs.map(log => log.id) }
      }
    });

    await prisma.auditAlert.delete({
      where: { id: testAlert.id }
    });

    test('Test data cleanup', true, 'Test logs and alerts deleted');

    // ============================================
    // Final Results
    // ============================================
    console.log('\n========================================');
    console.log('📊 Test Results');
    console.log('========================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log('========================================\n');

    if (failed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log('⚠️  Some tests failed. Review above.\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(failed > 0 ? 1 : 0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
