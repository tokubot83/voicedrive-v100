/**
 * 統合テストデータ投入スクリプト
 * 職員カルテシステム統合テスト（10/7-11）用のテストデータを投入
 *
 * 実行方法:
 * npm run seed:integration-test
 *
 * @date 2025-10-05
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * テストユーザーデータ
 */
const testUsers = [
  // 同意済みユーザー（5名） - K-匿名性テスト用
  {
    id: 'test-consent-user-001',
    employeeId: 'EMP-TEST-001',
    email: 'test.consent.001@ohara-hospital.jp',
    name: '田中太郎',
    department: '看護部',
    position: '看護師',
    accountType: 'staff',
    permissionLevel: 5,
    professionCategory: 'nurse'
  },
  {
    id: 'test-consent-user-002',
    employeeId: 'EMP-TEST-002',
    email: 'test.consent.002@ohara-hospital.jp',
    name: '佐藤花子',
    department: '看護部',
    position: '主任看護師',
    accountType: 'staff',
    permissionLevel: 8,
    professionCategory: 'nurse'
  },
  {
    id: 'test-consent-user-003',
    employeeId: 'EMP-TEST-003',
    email: 'test.consent.003@ohara-hospital.jp',
    name: '鈴木一郎',
    department: '医療技術部',
    position: '臨床検査技師',
    accountType: 'staff',
    permissionLevel: 5,
    professionCategory: 'medical_technician'
  },
  {
    id: 'test-consent-user-004',
    employeeId: 'EMP-TEST-004',
    email: 'test.consent.004@ohara-hospital.jp',
    name: '高橋美咲',
    department: '医療技術部',
    position: 'レントゲン技師',
    accountType: 'staff',
    permissionLevel: 5,
    professionCategory: 'medical_technician'
  },
  {
    id: 'test-consent-user-005',
    employeeId: 'EMP-TEST-005',
    email: 'test.consent.005@ohara-hospital.jp',
    name: '伊藤健二',
    department: '事務部',
    position: '経理担当',
    accountType: 'staff',
    permissionLevel: 4,
    professionCategory: 'administrative'
  },

  // 未同意ユーザー（3名）
  {
    id: 'test-no-consent-user-001',
    employeeId: 'EMP-TEST-101',
    email: 'test.noconsent.001@ohara-hospital.jp',
    name: '渡辺次郎',
    department: '看護部',
    position: '看護師',
    accountType: 'staff',
    permissionLevel: 5,
    professionCategory: 'nurse'
  },
  {
    id: 'test-no-consent-user-002',
    employeeId: 'EMP-TEST-102',
    email: 'test.noconsent.002@ohara-hospital.jp',
    name: '山本三郎',
    department: '医療技術部',
    position: '薬剤師',
    accountType: 'staff',
    permissionLevel: 6,
    professionCategory: 'pharmacist'
  },
  {
    id: 'test-no-consent-user-003',
    employeeId: 'EMP-TEST-103',
    email: 'test.noconsent.003@ohara-hospital.jp',
    name: '中村四郎',
    department: '事務部',
    position: '総務担当',
    accountType: 'staff',
    permissionLevel: 4,
    professionCategory: 'administrative'
  },

  // 同意取り消しユーザー（2名）
  {
    id: 'test-revoke-user-001',
    employeeId: 'EMP-TEST-201',
    email: 'test.revoke.001@ohara-hospital.jp',
    name: '小林五郎',
    department: '看護部',
    position: '看護師',
    accountType: 'staff',
    permissionLevel: 5,
    professionCategory: 'nurse'
  },
  {
    id: 'test-revoke-user-002',
    employeeId: 'EMP-TEST-202',
    email: 'test.revoke.002@ohara-hospital.jp',
    name: '加藤六子',
    department: '医療技術部',
    position: '理学療法士',
    accountType: 'staff',
    permissionLevel: 5,
    professionCategory: 'rehabilitation'
  },

  // 削除リクエストユーザー（1名）
  {
    id: 'test-deletion-user-001',
    employeeId: 'EMP-TEST-301',
    email: 'test.deletion.001@ohara-hospital.jp',
    name: '吉田七郎',
    department: '事務部',
    position: '人事担当',
    accountType: 'staff',
    permissionLevel: 4,
    professionCategory: 'administrative'
  }
];

/**
 * 同意データ
 */
const consentData = [
  // 同意済みユーザー（5名）
  ...testUsers.slice(0, 5).map(user => ({
    userId: user.id,
    analyticsConsent: true,
    analyticsConsentDate: new Date('2025-10-01'),
    personalFeedbackConsent: false,
    dataDeletionRequested: false
  })),

  // 未同意ユーザー（3名）
  ...testUsers.slice(5, 8).map(user => ({
    userId: user.id,
    analyticsConsent: false,
    analyticsConsentDate: null,
    personalFeedbackConsent: false,
    dataDeletionRequested: false
  })),

  // 同意取り消しユーザー（2名）
  ...testUsers.slice(8, 10).map(user => ({
    userId: user.id,
    analyticsConsent: false,
    analyticsConsentDate: new Date('2025-09-15'),
    revokeDate: new Date('2025-10-03'),
    personalFeedbackConsent: false,
    dataDeletionRequested: false
  })),

  // 削除リクエストユーザー（1名）
  {
    userId: testUsers[10].id,
    analyticsConsent: true,
    analyticsConsentDate: new Date('2025-09-01'),
    personalFeedbackConsent: false,
    dataDeletionRequested: true,
    dataDeletionRequestedAt: new Date('2025-10-04')
  }
];

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 統合テストデータ投入開始...\n');

  try {
    // 既存のテストデータをクリーンアップ
    console.log('📝 既存のテストデータをクリーンアップ中...');
    await cleanupTestData();
    console.log('✅ クリーンアップ完了\n');

    // ユーザーデータ投入
    console.log('👥 テストユーザーを作成中...');
    for (const user of testUsers) {
      await prisma.user.create({ data: user });
      console.log(`  ✓ ${user.name} (${user.employeeId})`);
    }
    console.log(`✅ ${testUsers.length}名のユーザーを作成完了\n`);

    // 同意データ投入
    console.log('📋 同意データを作成中...');
    for (const consent of consentData) {
      await prisma.dataConsent.create({ data: consent });
      const user = testUsers.find(u => u.id === consent.userId);
      const status = consent.analyticsConsent
        ? (consent.dataDeletionRequested ? '削除リクエスト済み' : '同意済み')
        : (consent.revokeDate ? '取り消し済み' : '未同意');
      console.log(`  ✓ ${user?.name}: ${status}`);
    }
    console.log(`✅ ${consentData.length}件の同意データを作成完了\n`);

    // サマリー表示
    console.log('📊 投入データサマリー:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  総ユーザー数:        ${testUsers.length}名`);
    console.log(`  同意済み:            5名 (K-匿名性テスト可能)`);
    console.log(`  未同意:              3名`);
    console.log(`  同意取り消し:        2名`);
    console.log(`  削除リクエスト:      1名`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // K-匿名性テストシナリオ情報
    console.log('🧪 K-匿名性テストシナリオ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  【OK】 看護部全体:        3名 (同意済み)');
    console.log('  【OK】 医療技術部全体:    2名 (同意済み)');
    console.log('  【NG】 事務部のみ:        1名 (K<5で分析不可)');
    console.log('  【OK】 全部署合計:        5名 (K=5で分析可能)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // テストシナリオ情報
    console.log('📝 統合テストシナリオ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  シナリオ1: 同意取得フロー');
    console.log('    → test-consent-user-001～005を使用');
    console.log('');
    console.log('  シナリオ2: 同意取り消しフロー');
    console.log('    → test-revoke-user-001～002を使用');
    console.log('');
    console.log('  シナリオ3: K-匿名性チェック');
    console.log('    → 看護部3名、医療技術部2名で検証');
    console.log('');
    console.log('  シナリオ4: データ削除リクエスト');
    console.log('    → test-deletion-user-001を使用');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ 統合テストデータ投入完了！');
    console.log('');
    console.log('🎯 次のステップ:');
    console.log('  1. 開発サーバー起動: npm run dev');
    console.log('  2. Prisma Studio起動: npx prisma studio');
    console.log('  3. 職員カルテチームへデータ準備完了を通知');
    console.log('');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * テストデータのクリーンアップ
 */
async function cleanupTestData() {
  const testUserIds = testUsers.map(u => u.id);

  // 外部キー制約を考慮して順番に削除
  await prisma.auditLog.deleteMany({
    where: { userId: { in: testUserIds } }
  });

  await prisma.notification.deleteMany({
    where: { senderId: { in: testUserIds } }
  });

  await prisma.dataConsent.deleteMany({
    where: { userId: { in: testUserIds } }
  });

  await prisma.user.deleteMany({
    where: { id: { in: testUserIds } }
  });
}

// スクリプト実行
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
