/**
 * 削除完了APIテスト用ユーザー追加スクリプト
 * 職員カルテシステムからの依頼により、test-deletion-user-002を作成
 *
 * 実行方法:
 * npx tsx scripts/add-test-deletion-user-002.ts
 *
 * @date 2025-10-05
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 削除完了APIテスト用ユーザー作成開始...\n');

  try {
    // 1. test-deletion-user-001の状態確認
    console.log('📝 既存ユーザーの状態確認...');
    const existingUser = await prisma.dataConsent.findUnique({
      where: { userId: 'test-deletion-user-001' }
    });

    if (existingUser) {
      console.log('  ✓ test-deletion-user-001 の状態:');
      console.log(`    - dataDeletionRequested: ${existingUser.dataDeletionRequested}`);
      console.log(`    - dataDeletionCompletedAt: ${existingUser.dataDeletionCompletedAt}`);
      console.log('    → 既に削除完了済みのため、新しいユーザーを作成します\n');
    }

    // 2. test-deletion-user-002の存在確認
    const existingUser2 = await prisma.dataConsent.findUnique({
      where: { userId: 'test-deletion-user-002' }
    });

    if (existingUser2) {
      console.log('⚠️  test-deletion-user-002 は既に存在します');
      console.log('   削除完了状態をリセットします...\n');

      await prisma.dataConsent.update({
        where: { userId: 'test-deletion-user-002' },
        data: {
          dataDeletionCompletedAt: null,
          updatedAt: new Date()
        }
      });

      console.log('✅ test-deletion-user-002 をリセットしました\n');
    } else {
      // 3. Userレコードを作成
      console.log('👥 Userレコード作成中...');
      await prisma.user.create({
        data: {
          id: 'test-deletion-user-002',
          employeeId: 'EMP-TEST-302',
          email: 'test.deletion.002@ohara-hospital.jp',
          name: '山田花子',
          department: '看護部',
          position: '看護師',
          accountType: 'staff',
          permissionLevel: 5,
          professionCategory: 'nurse'
        }
      });
      console.log('  ✓ Userレコード作成完了\n');

      // 4. DataConsentレコードを作成
      console.log('📋 DataConsentレコード作成中...');
      await prisma.dataConsent.create({
        data: {
          userId: 'test-deletion-user-002',
          analyticsConsent: true,
          analyticsConsentDate: new Date('2025-10-01T00:00:00.000Z'),
          personalFeedbackConsent: false,
          personalFeedbackConsentDate: null,
          revokeDate: null,
          dataDeletionRequested: true,
          dataDeletionRequestedAt: new Date('2025-10-05T07:00:00.000Z'),
          dataDeletionCompletedAt: null  // 重要: 削除未完了状態
        }
      });
      console.log('  ✓ DataConsentレコード作成完了\n');
    }

    // 5. 作成したユーザーの確認
    console.log('🔍 作成結果の確認...');
    const newUser = await prisma.dataConsent.findUnique({
      where: { userId: 'test-deletion-user-002' }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ test-deletion-user-002 作成完了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  userId: test-deletion-user-002');
    console.log('  analyticsConsent: true');
    console.log('  dataDeletionRequested: true');
    console.log(`  dataDeletionRequestedAt: ${newUser?.dataDeletionRequestedAt}`);
    console.log(`  dataDeletionCompletedAt: ${newUser?.dataDeletionCompletedAt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 6. 削除リクエスト済みユーザーの一覧
    console.log('📊 削除リクエスト済みユーザー一覧:');
    const deletionRequests = await prisma.dataConsent.findMany({
      where: {
        dataDeletionRequested: true
      },
      select: {
        userId: true,
        dataDeletionRequestedAt: true,
        dataDeletionCompletedAt: true
      },
      orderBy: {
        dataDeletionRequestedAt: 'asc'
      }
    });

    deletionRequests.forEach((req, index) => {
      const status = req.dataDeletionCompletedAt ? '✅ 完了済み' : '⏸️ 未完了';
      console.log(`  ${index + 1}. ${req.userId}: ${status}`);
    });
    console.log('');

    console.log('🎯 次のステップ:');
    console.log('  1. 職員カルテチームへ作成完了を連絡');
    console.log('  2. 職員カルテ側で削除完了APIテストを再実行');
    console.log('     → npm run test:deletion-api');
    console.log('');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
