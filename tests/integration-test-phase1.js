// VoiceDrive側 Phase 1 統合テスト
import http from 'http';

console.log('=====================================');
console.log('VoiceDrive Phase 1 統合テスト開始');
console.log('=====================================\n');

// テスト環境設定
const MCP_SERVER = 'http://localhost:8080';
const MEDICAL_API = `${MCP_SERVER}/api/medical`;

// テストケース定義
const testCases = [
    {
        name: '医療システムへのお知らせ送信（通常優先度）',
        endpoint: `${MEDICAL_API}/notifications`,
        method: 'POST',
        data: {
            category: 'announcement',
            priority: 'medium',
            title: '[VoiceDrive] Phase 1テスト - お知らせ',
            content: 'VoiceDrive側からの通常優先度のお知らせです',
            target: 'all'
        }
    },
    {
        name: '医療システムへのお知らせ送信（高優先度）',
        endpoint: `${MEDICAL_API}/notifications`,
        method: 'POST',
        data: {
            category: 'announcement',
            priority: 'high',
            title: '[VoiceDrive] Phase 1テスト - 緊急連絡',
            content: 'VoiceDrive側からの高優先度のお知らせです',
            target: 'all'
        }
    },
    {
        name: '面談案内配信',
        endpoint: `${MEDICAL_API}/notifications`,
        method: 'POST',
        data: {
            category: 'interview',
            priority: 'medium',
            title: '[VoiceDrive] 面談案内',
            content: 'メンタルヘルス面談のご案内です',
            target: 'department_a'
        }
    },
    {
        name: '研修案内配信',
        endpoint: `${MEDICAL_API}/notifications`,
        method: 'POST',
        data: {
            category: 'training',
            priority: 'medium',
            title: '[VoiceDrive] 研修案内',
            content: '新入社員研修のお知らせ',
            target: 'new_employees'
        }
    },
    {
        name: 'アンケート配信',
        endpoint: `${MEDICAL_API}/notifications`,
        method: 'POST',
        data: {
            category: 'survey',
            subcategory: 'satisfaction',
            priority: 'low',
            title: '[VoiceDrive] 満足度調査',
            content: '職場環境に関するアンケートのお願い',
            target: 'all'
        }
    },
    {
        name: 'MCPサーバーステータス確認',
        endpoint: `${MCP_SERVER}/api/status`,
        method: 'GET'
    }
];

// HTTPリクエスト実行関数
function executeTest(testCase) {
    return new Promise((resolve, reject) => {
        const url = new URL(testCase.endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: testCase.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test_vd_token_2025_0920'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    name: testCase.name,
                    status: res.statusCode,
                    data: data,
                    success: res.statusCode >= 200 && res.statusCode < 300
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                name: testCase.name,
                status: 0,
                error: error.message,
                success: false
            });
        });

        if (testCase.data) {
            req.write(JSON.stringify(testCase.data));
        }

        req.end();
    });
}

// テスト実行
async function runTests() {
    const results = [];

    for (const testCase of testCases) {
        console.log(`テスト実行中: ${testCase.name}`);
        const result = await executeTest(testCase);
        results.push(result);

        if (result.success) {
            console.log(`✅ 成功 (Status: ${result.status})`);
        } else {
            console.log(`❌ 失敗 (Status: ${result.status || 'Connection Error'})`);
            if (result.error) {
                console.log(`   エラー: ${result.error}`);
            }
        }
        console.log('');
    }

    // 結果サマリー
    console.log('=====================================');
    console.log('Phase 1 テスト結果サマリー');
    console.log('=====================================');

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = (successCount / totalCount * 100).toFixed(1);

    console.log(`\n✅ 成功: ${successCount}/${totalCount} (${successRate}%)\n`);

    // 詳細結果
    results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
        if (!result.success && result.error) {
            console.log(`   → ${result.error}`);
        }
    });

    return {
        success: successCount === totalCount,
        successRate,
        results
    };
}

// メイン実行
runTests().then(summary => {
    console.log('\n=====================================');
    console.log('VoiceDrive側テスト完了');
    console.log('=====================================');

    if (summary.success) {
        console.log('\n🎉 全テスト成功！Phase 2へ進む準備ができています。');
    } else {
        console.log('\n⚠️ 一部のテストが失敗しました。ログを確認してください。');
    }

    process.exit(summary.success ? 0 : 1);
}).catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});