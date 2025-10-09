/**
 * Phase 14.0: 健康通知ファイル検知テスト
 *
 * 目的: JSONサンプルファイルの検知確認のみ（DB保存なし）
 *
 * 実行方法:
 * npx tsx scripts/test-health-notification-detection.ts
 */

import { getHealthNotificationWatcher } from '../src/services/healthNotificationWatcher';
import fs from 'fs';
import path from 'path';

console.log('='.repeat(80));
console.log('🧪 Phase 14.0: 健康通知ファイル検知テスト開始');
console.log('='.repeat(80));
console.log('');
console.log('目的: ファイルベース連携の動作確認（DB保存なし）');
console.log('');

// 監視パスを確認
const notificationsPath = path.join(process.cwd(), 'mcp-shared', 'notifications');
console.log(`📁 監視フォルダ: ${notificationsPath}`);

// samples フォルダが存在するか確認
const samplesPath = path.join(notificationsPath, 'samples');
if (fs.existsSync(samplesPath)) {
  console.log(`📁 サンプルフォルダ: ${samplesPath} (存在)`);
} else {
  console.log(`⚠️  サンプルフォルダ: ${samplesPath} (未作成)`);
  console.log('');
  console.log('次のアクション:');
  console.log('1. 医療システムチームがサンプルファイルを作成 (10月11日予定)');
  console.log('2. サンプルファイルを mcp-shared/notifications/samples/ に配置');
  console.log('3. 本スクリプトを再実行');
  console.log('');
  process.exit(0);
}

// ファイル一覧を表示
const files = fs.readdirSync(samplesPath);
const healthNotificationFiles = files.filter(
  filename => filename.startsWith('health_notif_') && filename.endsWith('.json')
);

console.log('');
console.log(`📋 検出されたファイル数: ${healthNotificationFiles.length}`);
console.log('');

if (healthNotificationFiles.length === 0) {
  console.log('⚠️  サンプルファイルが見つかりません');
  console.log('');
  console.log('医療システムチームに以下のサンプルファイル作成を依頼してください:');
  console.log('- health_notif_OH-NS-2024-001_20251010100000.json (health_risk_assessment)');
  console.log('- health_notif_OH-NS-2024-002_20251010100100.json (reexamination_required)');
  console.log('- health_notif_OH-NS-2024-003_20251010100200.json (health_checkup_result)');
  console.log('- health_notif_OH-NS-2024-004_20251010100300.json (stress_check_result)');
  console.log('');
  process.exit(0);
}

// 各ファイルの内容を検証
console.log('📄 ファイル詳細:');
console.log('-'.repeat(80));

healthNotificationFiles.forEach((filename, index) => {
  const filePath = path.join(samplesPath, filename);

  try {
    // ファイルを読み込み
    const content = fs.readFileSync(filePath, 'utf-8');
    const notification = JSON.parse(content);

    console.log(`\n${index + 1}. ${filename}`);
    console.log(`   通知タイプ: ${notification.type}`);
    console.log(`   職員ID: ${notification.staffId}`);
    console.log(`   タイムスタンプ: ${notification.timestamp}`);

    if (notification.assessment) {
      console.log(`   総合スコア: ${notification.assessment.overallScore}`);
      console.log(`   リスクレベル: ${notification.assessment.overallLevel}`);
    }

    if (notification.metadata) {
      console.log(`   バージョン: ${notification.metadata.version}`);
      console.log(`   優先度: ${notification.metadata.priority}`);
    }

    // 必須フィールドの検証
    const requiredFields = ['type', 'staffId', 'timestamp', 'metadata'];
    const missingFields = requiredFields.filter(field => !notification[field]);

    if (missingFields.length > 0) {
      console.log(`   ⚠️  不足フィールド: ${missingFields.join(', ')}`);
    } else {
      console.log(`   ✅ 必須フィールド検証: OK`);
    }

  } catch (error) {
    console.log(`\n${index + 1}. ${filename}`);
    console.log(`   ❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
});

console.log('');
console.log('-'.repeat(80));
console.log('');

// 実際の監視テスト
console.log('🔍 ファイル監視システムのテスト');
console.log('');

// 監視インスタンスを作成（自動開始なし）
const watcher = getHealthNotificationWatcher({
  pollingInterval: 5000,
  autoStart: false
});

// 通知コールバックを設定
let detectedCount = 0;
watcher.onNotification((result) => {
  detectedCount++;
  console.log(`✅ 通知を検知 (${detectedCount}件目)`);
  console.log(`   職員ID: ${result.staffId}`);
  console.log(`   処理結果: ${result.success ? '成功' : '失敗'}`);
  if (result.actions && result.actions.length > 0) {
    console.log(`   アクション: ${result.actions.join(', ')}`);
  }
});

// サンプルファイルを mcp-shared/notifications/ にコピーしてテスト
console.log('📋 テストファイルをコピーしています...');
console.log('');

healthNotificationFiles.forEach((filename) => {
  const sourcePath = path.join(samplesPath, filename);
  const targetPath = path.join(notificationsPath, filename);

  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ コピー完了: ${filename}`);
  } catch (error) {
    console.log(`❌ コピー失敗: ${filename} - ${error instanceof Error ? error.message : String(error)}`);
  }
});

console.log('');
console.log('⏳ ファイル監視を開始します（10秒間）...');
console.log('');

// 監視開始
watcher.start();

// 10秒後に停止
setTimeout(() => {
  watcher.stop();

  console.log('');
  console.log('='.repeat(80));
  console.log('📊 テスト結果');
  console.log('='.repeat(80));
  console.log('');

  const status = watcher.getStatus();
  console.log(`サンプルファイル数: ${healthNotificationFiles.length}`);
  console.log(`検知された通知: ${detectedCount}件`);
  console.log(`処理済みファイル: ${status.processedCount}件`);
  console.log('');

  if (detectedCount === healthNotificationFiles.length) {
    console.log('✅ Phase 14.0テスト成功');
    console.log('');
    console.log('📝 確認事項:');
    console.log('1. ファイル検知システムは正常に動作しています');
    console.log('2. JSON形式の解析は正常です');
    console.log('3. 通知タイプの識別は正常です');
    console.log('');
    console.log('次のフェーズ:');
    console.log('- Phase 14.1-3: DB構築後に本実装を開始');
    console.log('- 実装タイミング: MySQL移行完了後');
  } else {
    console.log('⚠️  Phase 14.0テスト部分成功');
    console.log('');
    console.log(`検知された通知が期待値より少ない: ${detectedCount}/${healthNotificationFiles.length}`);
    console.log('原因: ファイル処理に10秒以上かかる可能性があります');
    console.log('');
    console.log('対応策:');
    console.log('1. テスト時間を延長（30秒）');
    console.log('2. ポーリング間隔を短縮（1秒）');
  }

  // テストファイルをクリーンアップ
  console.log('');
  console.log('🧹 テストファイルをクリーンアップします...');
  healthNotificationFiles.forEach((filename) => {
    const targetPath = path.join(notificationsPath, filename);
    try {
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        console.log(`✅ 削除完了: ${filename}`);
      }
    } catch (error) {
      console.log(`⚠️  削除失敗: ${filename}`);
    }
  });

  console.log('');
  console.log('🎉 Phase 14.0テスト完了');
  console.log('');

  process.exit(0);
}, 10000);
