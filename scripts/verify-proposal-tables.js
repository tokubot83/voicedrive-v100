import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTables() {
  try {
    console.log('🔍 ProposalDocumentテーブルを確認中...');

    // ProposalDocumentテーブルのカウント
    const documentCount = await prisma.proposalDocument.count();
    console.log(`✅ ProposalDocumentテーブル: ${documentCount}件のレコード`);

    // ProposalAuditLogテーブルのカウント
    const auditLogCount = await prisma.proposalAuditLog.count();
    console.log(`✅ ProposalAuditLogテーブル: ${auditLogCount}件のレコード`);

    console.log('\n✨ 全てのテーブルが正常に存在します！');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
