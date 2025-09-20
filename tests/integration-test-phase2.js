// VoiceDrive側 Phase 2 統合テスト（サブカテゴリ・配信対象）
import http from 'http';

console.log('=====================================');
console.log('VoiceDrive Phase 2 統合テスト開始');
console.log('=====================================\n');

// テスト環境設定
const MCP_SERVER = 'http://localhost:8080';
const MEDICAL_API = `${MCP_SERVER}/api/medical`;

// サブカテゴリテストケース
const subcategoryTests = [
    {
        name: 'アンケート - 満足度調査',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'satisfaction',
            priority: 'low',
            title: '[Phase2] 従業員満足度調査',
            content: '今四半期の満足度調査にご協力ください',
            target: 'all'
        }
    },
    {
        name: 'アンケート - 職場環境',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'workenv',
            priority: 'medium',
            title: '[Phase2] 職場環境改善アンケート',
            content: 'より良い職場環境のためのご意見をお聞かせください',
            target: 'all'
        }
    },
    {
        name: 'アンケート - 教育・研修',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'education',
            priority: 'low',
            title: '[Phase2] 研修プログラム評価',
            content: '先日の研修についてのフィードバックをお願いします',
            target: 'participants'
        }
    },
    {
        name: 'アンケート - 福利厚生',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'welfare',
            priority: 'low',
            title: '[Phase2] 福利厚生に関する調査',
            content: '福利厚生制度の改善に向けたアンケート',
            target: 'all'
        }
    },
    {
        name: 'アンケート - システム改善',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'system',
            priority: 'medium',
            title: '[Phase2] システム使用感調査',
            content: '業務システムの改善点についてお聞かせください',
            target: 'it_users'
        }
    },
    {
        name: 'アンケート - イベント',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'event',
            priority: 'low',
            title: '[Phase2] 社内イベント参加意向調査',
            content: '年末イベントの企画についてのアンケート',
            target: 'all'
        }
    },
    {
        name: 'アンケート - その他',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'survey',
            subcategory: 'other',
            priority: 'low',
            title: '[Phase2] その他のご意見募集',
            content: '組織改善に関する自由なご意見をお寄せください',
            target: 'all'
        }
    }
];

// 配信対象テストケース
const targetTests = [
    {
        name: '全員配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'high',
            title: '[Phase2] 全社員向け重要連絡',
            content: '全員必読の重要なお知らせです',
            target: 'all'
        }
    },
    {
        name: '部署A配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'medium',
            title: '[Phase2] 部署A向け連絡',
            content: '営業部門向けのお知らせ',
            target: 'department_a'
        }
    },
    {
        name: '部署B配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'medium',
            title: '[Phase2] 部署B向け連絡',
            content: '技術部門向けのお知らせ',
            target: 'department_b'
        }
    },
    {
        name: '管理職配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'high',
            title: '[Phase2] 管理職向け連絡',
            content: 'マネージャー会議のご案内',
            target: 'managers'
        }
    },
    {
        name: '新入社員配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'training',
            priority: 'high',
            title: '[Phase2] 新入社員研修',
            content: '新入社員向け研修プログラムのご案内',
            target: 'new_employees'
        }
    },
    {
        name: 'ベテラン社員配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'medium',
            title: '[Phase2] ベテラン社員向け',
            content: 'メンター制度についてのお知らせ',
            target: 'veterans'
        }
    },
    {
        name: '個別指定配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'interview',
            priority: 'high',
            title: '[Phase2] 個別面談のご案内',
            content: '個別面談の日程調整について',
            target: 'EMP12345'
        }
    },
    {
        name: '複数グループ配信',
        endpoint: `${MEDICAL_API}/notifications`,
        data: {
            category: 'announcement',
            priority: 'medium',
            title: '[Phase2] 複数部署合同連絡',
            content: '営業部・技術部合同プロジェクトについて',
            target: ['department_a', 'department_b']
        }
    }
];

// パフォーマンステスト用データ生成
function generateBulkNotifications(count) {
    const notifications = [];
    for (let i = 0; i < count; i++) {
        notifications.push({
            category: 'announcement',
            priority: ['high', 'medium', 'low'][i % 3],
            title: `[Phase2-Perf] 通知 #${i + 1}`,
            content: `パフォーマンステスト用通知メッセージ ${i + 1}`,
            target: 'all'
        });
    }
    return notifications;
}

// HTTPリクエスト実行関数
function executeTest(testCase) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const url = new URL(testCase.endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test_vd_token_2025_0920'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    name: testCase.name,
                    status: res.statusCode,
                    responseTime,
                    success: res.statusCode >= 200 && res.statusCode < 300
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                name: testCase.name,
                status: 0,
                error: error.message,
                responseTime: Date.now() - startTime,
                success: false
            });
        });

        req.write(JSON.stringify(testCase.data));
        req.end();
    });
}

// バルクテスト実行関数
async function executeBulkTest(count) {
    const notifications = generateBulkNotifications(count);
    const startTime = Date.now();
    let successCount = 0;

    console.log(`\n${count}件同時送信テスト開始...`);

    const promises = notifications.map(notification => {
        return executeTest({
            endpoint: `${MEDICAL_API}/notifications`,
            data: notification
        });
    });

    const results = await Promise.all(promises);
    successCount = results.filter(r => r.success).length;
    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / count;

    return {
        count,
        successCount,
        totalTime,
        avgTime,
        success: successCount === count
    };
}

// メインテスト実行
async function runTests() {
    let totalTests = 0;
    let successTests = 0;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  サブカテゴリテスト (7種類)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const testCase of subcategoryTests) {
        console.log(`実行中: ${testCase.name}`);
        const result = await executeTest(testCase);
        totalTests++;

        if (result.success) {
            successTests++;
            console.log(`✅ 成功 (${result.responseTime}ms)`);
        } else {
            console.log(`❌ 失敗 (Status: ${result.status})`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  配信対象パターンテスト (8種類)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const testCase of targetTests) {
        console.log(`実行中: ${testCase.name}`);
        const result = await executeTest(testCase);
        totalTests++;

        if (result.success) {
            successTests++;
            console.log(`✅ 成功 (${result.responseTime}ms)`);
        } else {
            console.log(`❌ 失敗 (Status: ${result.status})`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  パフォーマンステスト');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const bulkTests = [100, 500, 1000];
    const perfResults = [];

    for (const count of bulkTests) {
        const result = await executeBulkTest(count);
        perfResults.push(result);

        if (result.success) {
            console.log(`✅ ${count}件送信成功 (平均: ${result.avgTime.toFixed(0)}ms)`);
        } else {
            console.log(`❌ ${count}件送信失敗 (成功: ${result.successCount}/${count})`);
        }
    }

    // 最終結果サマリー
    console.log('\n=====================================');
    console.log('Phase 2 テスト結果サマリー');
    console.log('=====================================\n');

    const successRate = (successTests / totalTests * 100).toFixed(1);
    console.log(`機能テスト: ${successTests}/${totalTests} (${successRate}%)\n`);

    console.log('パフォーマンステスト結果:');
    perfResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.count}件: 平均${result.avgTime.toFixed(0)}ms`);
    });

    return {
        functionalTests: { success: successTests, total: totalTests },
        performanceTests: perfResults,
        overallSuccess: successTests === totalTests && perfResults.every(r => r.success)
    };
}

// 実行
runTests().then(summary => {
    console.log('\n=====================================');
    console.log('VoiceDrive Phase 2 テスト完了');
    console.log('=====================================\n');

    if (summary.overallSuccess) {
        console.log('🎉 Phase 2 完全成功！Phase 3へ進む準備ができています。');
        process.exit(0);
    } else {
        console.log('⚠️ 一部のテストが失敗しました。');
        process.exit(1);
    }
}).catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});