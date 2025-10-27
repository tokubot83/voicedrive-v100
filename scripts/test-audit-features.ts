// Test script for audit log features
// Phase 4: Simple functionality test

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuditLogFeatures() {
  console.log('========================================');
  console.log('Testing Audit Log Features');
  console.log('========================================\n');

  try {
    // Test 1: Count audit logs
    console.log('Test 1: Counting audit logs...');
    const auditLogCount = await prisma.auditLog.count();
    console.log(`✅ Found ${auditLogCount} audit logs\n`);

    // Test 2: Count audit alerts
    console.log('Test 2: Counting audit alerts...');
    const alertCount = await prisma.auditAlert.count();
    console.log(`✅ Found ${alertCount} audit alerts\n`);

    // Test 3: Count archived logs
    console.log('Test 3: Counting archived logs...');
    const archivedCount = await prisma.auditLogArchive.count();
    console.log(`✅ Found ${archivedCount} archived logs\n`);

    // Test 4: Count report summaries
    console.log('Test 4: Counting report summaries...');
    const summaryCount = await prisma.auditReportSummary.count();
    console.log(`✅ Found ${summaryCount} report summaries\n`);

    // Test 5: Check recent logs with severity
    console.log('Test 5: Checking recent logs with severity...');
    const recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        severity: true,
        checksum: true,
        createdAt: true
      }
    });
    console.log(`✅ Recent logs (showing ${recentLogs.length}):`);
    recentLogs.forEach(log => {
      console.log(`   - ${log.action} [${log.severity || 'N/A'}] ${log.checksum ? '✓ Checksum' : '✗ No checksum'}`);
    });
    console.log('');

    // Test 6: Test severity distribution
    console.log('Test 6: Checking severity distribution...');
    const severityStats = await Promise.all([
      prisma.auditLog.count({ where: { severity: 'critical' } }),
      prisma.auditLog.count({ where: { severity: 'high' } }),
      prisma.auditLog.count({ where: { severity: 'medium' } }),
      prisma.auditLog.count({ where: { severity: 'low' } })
    ]);
    console.log(`✅ Severity distribution:`);
    console.log(`   - Critical: ${severityStats[0]}`);
    console.log(`   - High:     ${severityStats[1]}`);
    console.log(`   - Medium:   ${severityStats[2]}`);
    console.log(`   - Low:      ${severityStats[3]}`);
    console.log('');

    // Test 7: Environment variables check
    console.log('Test 7: Checking environment variables...');
    const slackUrl = process.env.MEDICAL_SYSTEM_SLACK_WEBHOOK_URL;
    const securityEmail = process.env.MEDICAL_SYSTEM_SECURITY_EMAIL;
    console.log(`✅ Environment variables:`);
    console.log(`   - Slack Webhook: ${slackUrl ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`   - Security Email: ${securityEmail ? '✓ Configured' : '✗ Not configured'}`);
    console.log('');

    console.log('========================================');
    console.log('✅ All tests completed successfully!');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testAuditLogFeatures()
  .then(() => {
    console.log('\n✅ Test script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
