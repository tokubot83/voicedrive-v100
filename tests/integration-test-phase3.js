// VoiceDrive側 Phase 3 エラーハンドリングテスト
import http from 'http';

console.log('=====================================');
console.log('VoiceDrive Phase 3 エラーハンドリングテスト開始');
console.log('=====================================\n');

// テスト環境設定
const MCP_SERVER = 'http://localhost:8080';
const MEDICAL_API = `${MCP_SERVER}/api/medical`;

// 1. 認証エラーテスト
const authErrorTests = [
    {
        name: '無効なトークン',
        endpoint: `${MEDICAL_API}/notifications`,
        headers: {
            'Authorization': 'Bearer invalid_token_12345'
        },
        data: {
            category: 'announcement',
            priority: 'high',
            title: 'テスト',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 401
    },
    {
        name: '期限切れトークン',
        endpoint: `${MEDICAL_API}/notifications`,
        headers: {
            'Authorization': 'Bearer expired_token_20230101'
        },
        data: {
            category: 'announcement',
            priority: 'medium',
            title: 'テスト',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 401
    },
    {
        name: 'トークンなし',
        endpoint: `${MEDICAL_API}/notifications`,
        headers: {},
        data: {
            category: 'announcement',
            priority: 'low',
            title: 'テスト',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 401
    }
];

// 2. データバリデーションテスト
const validationTests = [
    {
        name: '不正なカテゴリ',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'invalid_category',
            priority: 'high',
            title: 'テスト',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 400
    },
    {
        name: '不正なサブカテゴリ',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'invalid_subcategory',
            priority: 'low',
            title: 'テスト',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 400
    },
    {
        name: '不正な優先度',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'super_urgent',
            title: 'テスト',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 400
    },
    {
        name: '必須フィールド欠落（タイトルなし）',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'high',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 400
    },
    {
        name: 'データ型エラー（優先度が数値）',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 123,
            title: 'テスト',
            content: 'テスト内容',
            target: 'all'
        },
        expectedStatus: 400
    }
];

// 3. レート制限テスト
async function rateLimitTest() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  レート制限テスト');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const requests = [];
    const requestCount = 100;

    console.log(`${requestCount}リクエスト/秒を送信中...`);

    // 100個のリクエストを同時に送信
    for (let i = 0; i < requestCount; i++) {
        requests.push(executeTest({
            endpoint: `${MEDICAL_API}/notifications`,
            headers: {
                'Authorization': 'Bearer test_vd_token_2025_0920'
            },
            data: {
                category: 'announcement',
                priority: 'low',
                title: `レート制限テスト #${i}`,
                content: 'レート制限確認用',
                target: 'all'
            }
        }));
    }

    const results = await Promise.all(requests);
    const rateLimited = results.filter(r => r.status === 429).length;
    const successful = results.filter(r => r.status === 200).length;

    console.log(`結果: ${successful}成功, ${rateLimited}レート制限`);

    if (rateLimited > 0) {
        console.log(`✅ レート制限が機能しています（${rateLimited}件が429エラー）`);
        return { success: true, rateLimited };
    } else {
        console.log(`❌ レート制限が機能していません（全て通過）`);
        return { success: false, rateLimited: 0 };
    }
}

// 4. ネットワークエラーシミュレーション
const networkErrorTests = [
    {
        name: 'タイムアウトシミュレーション',
        endpoint: `${MEDICAL_API}/notifications?delay=5000`,
        timeout: 1000,
        data: {
            category: 'announcement',
            priority: 'high',
            title: 'タイムアウトテスト',
            content: 'タイムアウト確認',
            target: 'all'
        },
        expectedError: 'timeout'
    },
    {
        name: '大容量データ送信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'low',
            title: 'ビッグデータテスト',
            content: 'x'.repeat(1000000), // 1MBのデータ
            target: 'all'
        },
        expectedStatus: 413 // Payload Too Large
    }
];

// HTTPリクエスト実行関数
function executeTest(testCase) {
    return new Promise((resolve) => {
        const url = new URL(testCase.endpoint);
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test_vd_token_2025_0920',
            ...(testCase.headers || {})
        };

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + (url.search || ''),
            method: 'POST',
            headers,
            timeout: testCase.timeout || 30000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    name: testCase.name,
                    status: res.statusCode,
                    success: res.statusCode === (testCase.expectedStatus || 200),
                    expected: testCase.expectedStatus,
                    data
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                name: testCase.name,
                status: 0,
                error: error.message,
                success: testCase.expectedError === 'timeout' && error.code === 'ECONNRESET',
                expected: testCase.expectedStatus || 'error'
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                name: testCase.name,
                status: 0,
                error: 'timeout',
                success: testCase.expectedError === 'timeout',
                expected: 'timeout'
            });
        });

        if (testCase.data) {
            req.write(JSON.stringify(testCase.data));
        }
        req.end();
    });
}

// メインテスト実行
async function runTests() {
    let totalTests = 0;
    let successTests = 0;
    const results = {
        auth: { success: 0, total: 0 },
        validation: { success: 0, total: 0 },
        rateLimit: { success: false },
        network: { success: 0, total: 0 }
    };

    // 認証エラーテスト
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  認証エラーテスト');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const testCase of authErrorTests) {
        console.log(`テスト: ${testCase.name}`);
        const result = await executeTest(testCase);
        results.auth.total++;
        totalTests++;

        if (result.success) {
            results.auth.success++;
            successTests++;
            console.log(`✅ 成功（期待通り${result.expected}を返却）`);
        } else {
            console.log(`❌ 失敗（${result.status}を返却、期待値: ${result.expected}）`);
        }
    }

    // データバリデーションテスト
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  データバリデーションテスト');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const testCase of validationTests) {
        console.log(`テスト: ${testCase.name}`);
        const result = await executeTest(testCase);
        results.validation.total++;
        totalTests++;

        if (result.success) {
            results.validation.success++;
            successTests++;
            console.log(`✅ 成功（期待通り${result.expected}を返却）`);
        } else {
            console.log(`❌ 失敗（${result.status}を返却、期待値: ${result.expected}）`);
        }
    }

    // レート制限テスト
    const rateLimitResult = await rateLimitTest();
    totalTests++;
    if (rateLimitResult.success) {
        successTests++;
        results.rateLimit.success = true;
    }

    // ネットワークエラーテスト
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ネットワークエラーテスト');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const testCase of networkErrorTests) {
        console.log(`テスト: ${testCase.name}`);
        const result = await executeTest(testCase);
        results.network.total++;
        totalTests++;

        if (result.success) {
            results.network.success++;
            successTests++;
            console.log(`✅ 成功（期待通りのエラー処理）`);
        } else {
            console.log(`❌ 失敗（予期せぬ結果）`);
        }
    }

    // 最終結果サマリー
    console.log('\n=====================================');
    console.log('Phase 3 エラーハンドリングテスト結果');
    console.log('=====================================\n');

    console.log(`認証エラー: ${results.auth.success}/${results.auth.total}`);
    console.log(`データバリデーション: ${results.validation.success}/${results.validation.total}`);
    console.log(`レート制限: ${results.rateLimit.success ? '✅' : '❌'}`);
    console.log(`ネットワークエラー: ${results.network.success}/${results.network.total}`);

    const overallRate = (successTests / totalTests * 100).toFixed(1);
    console.log(`\n総合成功率: ${successTests}/${totalTests} (${overallRate}%)`);

    return {
        success: successTests === totalTests,
        results,
        successRate: overallRate
    };
}

// 実行
runTests().then(summary => {
    console.log('\n=====================================');
    console.log('VoiceDrive Phase 3 テスト完了');
    console.log('=====================================\n');

    if (summary.success) {
        console.log('🎉 全エラーハンドリングテスト成功！');
    } else if (parseFloat(summary.successRate) > 50) {
        console.log('⚠️ 一部のエラーハンドリングに改善の余地があります。');
    } else {
        console.log('❌ エラーハンドリングの実装が必要です。');
    }

    process.exit(summary.success ? 0 : 1);
}).catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});