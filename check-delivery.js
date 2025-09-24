// 秘密情報配信確認スクリプト
import { SecretDeliveryService } from './src/services/SecretDeliveryService.ts';

const service = new SecretDeliveryService();

// 医療チームからの配信を確認
const deliveryIds = [
  'SEC-20250925-MED001',
  'SEC-20250925-001',
  'SEC-20250925-PROD'
];

console.log('🔍 秘密情報配信の確認中...\n');
console.log('現在時刻:', new Date().toLocaleString('ja-JP'));
console.log('=' .repeat(50));

let found = false;

for (const id of deliveryIds) {
  const status = service.getDeliveryStatus(id);

  if (status.exists) {
    found = true;
    console.log(`\n✅ 配信が見つかりました！`);
    console.log(`  配信ID: ${id}`);
    console.log(`  状態: ${status.accessed ? '取得済み' : '未取得'}`);
    console.log(`  有効期限: ${status.expiresAt?.toLocaleString('ja-JP')}`);
    console.log(`  アクセス試行: ${status.accessAttempts}回`);

    if (!status.accessed && status.expiresAt) {
      const remaining = status.expiresAt.getTime() - Date.now();
      if (remaining > 0) {
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        console.log(`  残り時間: ${hours}時間${minutes}分`);
      }
    }
  } else {
    console.log(`\n❌ ${id}: 配信なし`);
  }
}

if (!found) {
  console.log('\n⏳ まだ配信されていません');
  console.log('医療チームの業務時間（午前9時以降）をお待ちください');
}

console.log('\n' + '=' .repeat(50));

// テスト配信を作成（デモ用）
console.log('\n📌 テスト配信を作成します（デモ用）...');

const testDelivery = await service.deliverSecrets(
  'voicedrive-test',
  {
    TEST_SECRET: 'demo_value_123',
    TEST_API_KEY: 'demo_api_key_456'
  },
  {
    expiresIn: 3600,  // 1時間
    requiresMFA: false
  }
);

console.log('\n✅ テスト配信が作成されました');
console.log(`  配信ID: ${testDelivery.deliveryId}`);
console.log(`  トークン: ${testDelivery.token}`);
console.log(`  有効期限: ${testDelivery.expiresAt.toLocaleString('ja-JP')}`);
console.log('\n取得コマンド:');
console.log(`  npm run secrets:retrieve -- ${testDelivery.deliveryId} -t ${testDelivery.token} -o .env.test`);