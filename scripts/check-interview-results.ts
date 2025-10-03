// VoiceDrive側で受信した面談結果を確認するスクリプト
import { InterviewResultService } from '../src/api/db/interviewResultService';

async function checkInterviewResults() {
  console.log('====================================');
  console.log('VoiceDrive 受信データ確認スクリプト');
  console.log('====================================\n');

  try {
    // 統計情報取得
    console.log('📊 統計情報取得中...');
    const stats = await InterviewResultService.getStatistics();

    if (stats.success) {
      console.log('\n✅ 統計情報:');
      console.log(`   総件数: ${stats.data!.total}`);
      console.log(`   受信済み: ${stats.data!.received}`);
      console.log(`   処理済み: ${stats.data!.processed}`);
      console.log(`   エラー: ${stats.data!.error}`);
      console.log(`   フォローアップ必要: ${stats.data!.followUpCount}`);
      console.log(`   処理率: ${stats.data!.processRate}%`);
    } else {
      console.error('❌ 統計情報取得失敗:', stats.error);
    }

    // 全データ取得
    console.log('\n📋 全データ取得中...');
    const list = await InterviewResultService.list({ limit: 100 });

    if (list.success) {
      console.log(`\n✅ 受信データ一覧（${list.count}件）:\n`);

      list.data!.forEach((result, index) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`${index + 1}. ID: ${result.id}`);
        console.log(`   RequestID: ${result.requestId}`);
        console.log(`   InterviewID: ${result.interviewId}`);
        console.log(`   実施日時: ${result.completedAt}`);
        console.log(`   所要時間: ${result.duration}分`);
        console.log(`   サマリ: ${result.summary.substring(0, 50)}...`);
        console.log(`   重要ポイント: ${JSON.stringify(result.keyPoints).substring(0, 80)}...`);
        console.log(`   アクションアイテム数: ${(result.actionItems as any[]).length}`);
        console.log(`   フォローアップ: ${result.followUpRequired ? 'あり' : 'なし'}`);
        if (result.followUpRequired && result.followUpDate) {
          console.log(`   フォローアップ日: ${result.followUpDate}`);
        }
        console.log(`   ステータス: ${result.status}`);
        console.log(`   受信日時: ${result.receivedAt}`);
        if (result.processedAt) {
          console.log(`   処理日時: ${result.processedAt}`);
        }
        if (result.errorMessage) {
          console.log(`   ⚠️ エラー: ${result.errorMessage}`);
        }
      });
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    } else {
      console.error('❌ データ取得失敗:', list.error);
    }

    // 特定データの詳細確認
    if (list.success && list.data!.length > 0) {
      const firstResult = list.data![0];
      console.log('\n🔍 最初のデータの詳細確認:');
      console.log(JSON.stringify(firstResult, null, 2));
    }

    console.log('\n====================================');
    console.log('✅ データ確認完了');
    console.log('====================================\n');

  } catch (error) {
    console.error('❌ エラー発生:', error);
    if (error instanceof Error) {
      console.error('   メッセージ:', error.message);
      console.error('   スタック:', error.stack);
    }
  }
}

// スクリプト実行
checkInterviewResults()
  .then(() => {
    console.log('✅ スクリプト正常終了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプト異常終了:', error);
    process.exit(1);
  });
