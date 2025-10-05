// Test Data Seeder for Post Report System
// 通報システムのテストデータ作成スクリプト

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// テスト投稿ID（既存のものを想定）
const TEST_POST_IDS = [
  'post_test_001',
  'post_test_002',
  'post_test_003',
  'post_test_004',
  'post_test_005'
];

// テストユーザーID（既存のものを想定）
const TEST_USER_IDS = [
  'user_nurse_001',
  'user_doctor_001',
  'user_staff_001',
  'user_admin_001',
  'user_tech_001'
];

const REPORT_TYPES = [
  'personal_attack',
  'defamation',
  'harassment',
  'privacy_violation',
  'inappropriate_content',
  'spam',
  'other'
];

const SAMPLE_DESCRIPTIONS = {
  personal_attack: '特定の個人を名指しで批判している投稿です。',
  defamation: '根拠のない噂話を広めている内容が含まれています。',
  harassment: 'パワーハラスメントに該当する可能性があります。',
  privacy_violation: '患者の個人情報が含まれているようです。',
  inappropriate_content: '職場環境にふさわしくない表現が使われています。',
  spam: '同じ内容を何度も投稿しています。',
  other: 'ガイドライン違反の疑いがあります。'
};

async function seedReportData() {
  console.log('🌱 通報テストデータの作成を開始します...\n');

  try {
    // 既存データのクリーンアップ
    console.log('🧹 既存のテストデータをクリーンアップ中...');
    await prisma.postReportAlert.deleteMany({
      where: {
        postId: {
          in: TEST_POST_IDS
        }
      }
    });
    await prisma.postReport.deleteMany({
      where: {
        postId: {
          in: TEST_POST_IDS
        }
      }
    });

    // テストユーザーの作成（存在しない場合のみ）
    console.log('👤 テストユーザーを確認/作成中...');
    for (const userId of TEST_USER_IDS) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: userId,
            employeeId: `EMP_${userId}`,
            email: `${userId}@test.example.com`,
            name: `テストユーザー ${userId}`,
            department: '医療サービス部',
            accountType: 'standard',
            permissionLevel: 3
          }
        });
        console.log(`  ✅ ユーザー作成: ${userId}`);
      }
    }

    // 1. 通報数が少ない投稿（低優先度）
    console.log('\n📝 低優先度の通報を作成中...');
    await createReports(TEST_POST_IDS[0], 1, 'spam');

    // 2. 中程度の通報がある投稿（中優先度）
    console.log('📝 中優先度の通報を作成中...');
    await createReports(TEST_POST_IDS[1], 3, 'inappropriate_content');

    // 3. 多数の通報がある投稿（高優先度）
    console.log('📝 高優先度の通報を作成中...');
    await createReports(TEST_POST_IDS[2], 6, 'harassment');

    // 4. 重大な通報がある投稿（最高優先度）
    console.log('📝 重大優先度の通報を作成中...');
    await createReports(TEST_POST_IDS[3], 12, 'personal_attack');

    // 5. 対応済みの通報
    console.log('📝 対応済みの通報を作成中...');
    const resolvedReports = await createReports(TEST_POST_IDS[4], 4, 'defamation');

    // 一部を対応済みにする
    for (let i = 0; i < 2; i++) {
      await prisma.postReport.update({
        where: { id: resolvedReports[i].id },
        data: {
          status: 'actioned',
          reviewedBy: TEST_USER_IDS[3], // admin user
          reviewedAt: new Date(),
          actionTaken: '投稿を削除し、投稿者に警告を送信しました',
          reviewNotes: '明確なガイドライン違反が確認されました'
        }
      });
    }

    // 統計情報の表示
    console.log('\n📊 作成されたデータの統計:');
    const totalReports = await prisma.postReport.count();
    const totalAlerts = await prisma.postReportAlert.count();
    const pendingReports = await prisma.postReport.count({
      where: { status: 'pending' }
    });
    const actionedReports = await prisma.postReport.count({
      where: { status: 'actioned' }
    });

    console.log(`  総通報数: ${totalReports}件`);
    console.log(`  アラート数: ${totalAlerts}件`);
    console.log(`  確認待ち: ${pendingReports}件`);
    console.log(`  対応済み: ${actionedReports}件`);

    console.log('\n✨ テストデータの作成が完了しました！');
    console.log('\n📌 次のステップ:');
    console.log('1. ブラウザで http://localhost:3001 にアクセス');
    console.log('2. 投稿の通報ボタンをクリックして動作確認');
    console.log('3. 管理者画面で通報一覧を確認（要Level 14以上のアカウント）');
    console.log('4. 統計ダッシュボードで集計結果を確認');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 通報を作成する関数
async function createReports(postId, count, mainReportType) {
  const reports = [];

  for (let i = 0; i < count; i++) {
    const reportType = i === 0 ? mainReportType :
      REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)];

    const report = await prisma.postReport.create({
      data: {
        id: uuidv4(),
        postId,
        reporterId: TEST_USER_IDS[i % TEST_USER_IDS.length],
        reporterName: `テストユーザー${i + 1}`,
        reportType,
        description: SAMPLE_DESCRIPTIONS[reportType],
        status: 'pending',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // 過去7日間のランダムな日時
      }
    });
    reports.push(report);
  }

  // アラートを作成（閾値を超えた場合）
  const severity = getSeverity(count);
  if (severity) {
    await prisma.postReportAlert.create({
      data: {
        id: uuidv4(),
        postId,
        severity,
        reportCount: count,
        dominantReportType: mainReportType,
        message: getAlertMessage(count, severity),
        acknowledged: false,
        createdAt: new Date()
      }
    });
    console.log(`  ✅ ${severity}レベルのアラート作成（${count}件の通報）`);
  }

  return reports;
}

// 重大度を判定
function getSeverity(count) {
  if (count >= 10) return 'critical';
  if (count >= 5) return 'high';
  if (count >= 3) return 'medium';
  if (count >= 1) return 'low';
  return null;
}

// アラートメッセージを生成
function getAlertMessage(count, severity) {
  switch (severity) {
    case 'critical':
      return `🚨 重大: ${count}件の通報があります。即座の対応が必要です`;
    case 'high':
      return `⚠️ 緊急: ${count}件の通報があります。優先的な確認が必要です`;
    case 'medium':
      return `⚡ 警告: ${count}件の通報があります。確認をお願いします`;
    case 'low':
      return `📌 注意: ${count}件の通報があります`;
    default:
      return `通報があります（${count}件）`;
  }
}

// スクリプト実行
seedReportData().catch(console.error);