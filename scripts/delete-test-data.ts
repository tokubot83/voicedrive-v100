/**
 * テストデータ削除スクリプト
 * 既存の期限到達判断データを削除
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestData() {
  console.log('🗑️  既存テストデータ削除開始...');

  try {
    const result = await prisma.expiredEscalationDecision.deleteMany({});
    console.log(`✅ 削除完了: ${result.count}件`);
  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestData()
  .then(() => {
    console.log('✅ 全処理完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
