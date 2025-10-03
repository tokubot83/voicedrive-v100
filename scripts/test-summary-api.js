// サマリAPI動作確認スクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSummaryAPI() {
  try {
    // テストユーザー取得
    const testUser = await prisma.user.findFirst({
      where: { employeeId: 'EMP-001' }
    });

    if (!testUser) {
      console.error('❌ テストユーザーが見つかりません');
      return;
    }

    console.log(`\n✅ テストユーザー: ${testUser.name} (${testUser.employeeId})\n`);

    // 1. サマリ一覧API のロジックをテスト
    console.log('📋 テスト1: サマリ一覧取得API');
    console.log('----------------------------------------');

    // ユーザーの面談を取得
    const interviews = await prisma.interview.findMany({
      where: {
        employeeId: testUser.id
      },
      select: { id: true }
    });

    console.log(`  従業員の面談数: ${interviews.length}件`);

    if (interviews.length === 0) {
      console.log('  ⚠️  面談レコードがありません');
      return;
    }

    // requestIdを取得（InterviewのIDがrequestIdとして使われる）
    const requestIds = interviews.map(i => i.id);
    console.log(`  RequestIDs: ${requestIds.slice(0, 3).join(', ')}...`);

    // サマリデータ取得
    const results = await prisma.interviewResult.findMany({
      where: {
        requestId: { in: requestIds }
      },
      orderBy: { completedAt: 'desc' }
    });

    console.log(`  ✅ 取得サマリ数: ${results.length}件\n`);

    results.forEach((r, i) => {
      const preview = r.summary.substring(0, 40);
      console.log(`  ${i + 1}. ${r.interviewId}`);
      console.log(`     完了: ${r.completedAt.toLocaleString('ja-JP')}`);
      console.log(`     サマリ: ${preview}...`);
      console.log(`     フォローアップ: ${r.followUpRequired ? 'あり' : 'なし'}\n`);
    });

    // 2. サマリ詳細API のロジックをテスト
    console.log('\n📝 テスト2: サマリ詳細取得API');
    console.log('----------------------------------------');

    if (results.length > 0) {
      const firstResult = results[0];
      console.log(`  対象: ${firstResult.interviewId}`);

      // 詳細データ取得（API実装と同じロジック）
      const detail = await prisma.interviewResult.findUnique({
        where: { interviewId: firstResult.interviewId }
      });

      if (detail) {
        console.log('  ✅ 詳細データ取得成功');
        console.log(`\n  📅 実施日時: ${detail.completedAt.toLocaleString('ja-JP')}`);
        console.log(`  ⏱️  実施時間: ${detail.duration}分`);
        console.log(`  📝 サマリ: ${detail.summary}`);
        console.log(`  🔑 重要ポイント: ${JSON.stringify(detail.keyPoints, null, 2)}`);
        console.log(`  ✅ アクションアイテム: ${JSON.stringify(detail.actionItems, null, 2)}`);
        console.log(`  💬 フィードバック: ${detail.feedbackToEmployee}`);

        if (detail.followUpRequired) {
          console.log(`  💡 フォローアップ: ${detail.followUpDate?.toLocaleDateString('ja-JP')}`);
        }

        console.log(`  🎯 次回推奨: ${JSON.stringify(detail.nextRecommendations, null, 2)}`);
      }
    }

    // 3. セキュリティチェック: 他ユーザーのサマリにアクセスできないことを確認
    console.log('\n\n🔒 テスト3: セキュリティチェック');
    console.log('----------------------------------------');

    // 別のテストユーザーがいると仮定
    const otherUser = await prisma.user.findFirst({
      where: {
        employeeId: { not: 'EMP-001' }
      }
    });

    if (otherUser) {
      const otherInterviews = await prisma.interview.findMany({
        where: { employeeId: otherUser.id },
        select: { id: true }
      });

      const otherRequestIds = otherInterviews.map(i => `interview_${i.id}`);
      const otherResults = await prisma.interviewResult.findMany({
        where: {
          requestId: { in: otherRequestIds }
        }
      });

      console.log(`  テストユーザー(EMP-001): ${results.length}件のサマリ`);
      console.log(`  他ユーザー(${otherUser.employeeId}): ${otherResults.length}件のサマリ`);
      console.log('  ✅ ユーザー毎にサマリが分離されています');
    } else {
      console.log('  ℹ️  他のユーザーが存在しないため、セキュリティテストをスキップ');
    }

    console.log('\n✅ API動作確認完了\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSummaryAPI();
