// エラーハンドリング実装テスト
import http from 'http';

const BASE_URL = 'http://localhost:3100';
const MEDICAL_API = `${BASE_URL}/api/medical`;

console.log('=====================================');
console.log('エラーハンドリング実装テスト');
console.log('=====================================\n');

// テスト実行関数
async function runTest(name, options) {
  return new Promise((resolve) => {
    const url = new URL(options.url || `${MEDICAL_API}/notifications`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\nテスト: ${name}`);
        console.log(`ステータス: ${res.statusCode}`);
        console.log(`期待値: ${options.expectedStatus}`);
        console.log(`結果: ${res.statusCode === options.expectedStatus ? '✅ 成功' : '❌ 失敗'}`);

        resolve({
          name,
          statusCode: res.statusCode,
          expected: options.expectedStatus,
          success: res.statusCode === options.expectedStatus,
          data
        });
      });
    });

    req.on('error', (error) => {
      console.log(`\nテスト: ${name}`);
      console.log(`エラー: ${error.message}`);
      console.log(`結果: ❌ 失敗`);

      resolve({
        name,
        error: error.message,
        success: false
      });
    });

    if (options.data) {
      req.write(JSON.stringify(options.data));
    }
    req.end();
  });
}

// テスト実行
async function runAllTests() {
  const tests = [
    // 認証エラーテスト
    {
      name: '認証なし',
      headers: {},
      data: { category: 'announcement', priority: 'high', title: 'Test', content: 'Test', target: 'all' },
      expectedStatus: 401
    },
    {
      name: '無効なトークン',
      headers: { 'Authorization': 'Bearer invalid_token_12345' },
      data: { category: 'announcement', priority: 'high', title: 'Test', content: 'Test', target: 'all' },
      expectedStatus: 401
    },
    {
      name: '有効なトークン',
      headers: { 'Authorization': 'Bearer test_vd_token_2025_0920' },
      data: { category: 'announcement', priority: 'high', title: 'Test', content: 'Test', target: 'all' },
      expectedStatus: 200
    },

    // データバリデーションテスト
    {
      name: '不正なカテゴリ',
      headers: { 'Authorization': 'Bearer test_vd_token_2025_0920' },
      data: { category: 'invalid_category', priority: 'high', title: 'Test', content: 'Test', target: 'all' },
      expectedStatus: 400
    },
    {
      name: '不正な優先度',
      headers: { 'Authorization': 'Bearer test_vd_token_2025_0920' },
      data: { category: 'announcement', priority: 'super_high', title: 'Test', content: 'Test', target: 'all' },
      expectedStatus: 400
    },
    {
      name: 'タイトルなし',
      headers: { 'Authorization': 'Bearer test_vd_token_2025_0920' },
      data: { category: 'announcement', priority: 'high', content: 'Test', target: 'all' },
      expectedStatus: 400
    },
    {
      name: '正しいデータ',
      headers: { 'Authorization': 'Bearer test_vd_token_2025_0920' },
      data: { category: 'announcement', priority: 'high', title: 'Test', content: 'Test content', target: 'all' },
      expectedStatus: 200
    }
  ];

  let successCount = 0;
  const results = [];

  for (const test of tests) {
    const result = await runTest(test.name, test);
    results.push(result);
    if (result.success) successCount++;
  }

  // サマリー
  console.log('\n=====================================');
  console.log('テスト結果サマリー');
  console.log('=====================================');
  console.log(`成功: ${successCount}/${tests.length}`);
  console.log(`成功率: ${(successCount/tests.length*100).toFixed(1)}%`);

  // 改善状況
  const authTests = results.slice(0, 3);
  const validationTests = results.slice(3);

  const authSuccess = authTests.filter(r => r.success).length;
  const validationSuccess = validationTests.filter(r => r.success).length;

  console.log('\n詳細:');
  console.log(`認証エラー処理: ${authSuccess}/${authTests.length} (${(authSuccess/authTests.length*100).toFixed(0)}%)`);
  console.log(`バリデーション: ${validationSuccess}/${validationTests.length} (${(validationSuccess/validationTests.length*100).toFixed(0)}%)`);

  if (successCount === tests.length) {
    console.log('\n🎉 エラーハンドリング実装完了！');
  } else {
    console.log('\n⚠️ 一部のテストが失敗しています。実装を確認してください。');
  }
}

// 実行
runAllTests().catch(console.error);