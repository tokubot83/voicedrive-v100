/**
 * Phase 3: POST API統合テスト
 */

const crypto = require('crypto');

const BASE_URL = 'http://localhost:4000/api/v1/analytics';
const HMAC_SECRET = 'integration-test-secret-2025';

/**
 * HMAC署名生成
 */
function generateHMACSignature(data) {
  const jsonString = JSON.stringify(data);
  return crypto.createHmac('sha256', HMAC_SECRET)
    .update(jsonString)
    .digest('hex');
}

/**
 * Phase 3.1: 基本統計のみ送信
 */
const test31Data = {
  analysisDate: '2025-10-09',
  period: {
    startDate: '2025-10-01',
    endDate: '2025-10-07',
  },
  postingTrends: {
    totalPosts: 120,
    totalUsers: 50,
    participationRate: 83.3,
    growthRate: 5.2,
    byCategory: [],
    byDepartment: [],
    byLevel: [],
    timeSeries: [],
  },
  engagementMetrics: {
    averagePostLength: 245,
    medianPostLength: 210,
    postsWithMedia: 15,
    postsWithMediaPercentage: 12.5,
  },
  privacyMetadata: {
    consentedUsers: 50,
    analyzedPosts: 120,
    kAnonymityCompliant: true,
    minimumGroupSize: 5,
    dataVersion: '1.0.0',
    processingDate: '2025-10-09T02:00:00Z',
  },
};

const signature31 = generateHMACSignature(test31Data);

console.log('='.repeat(80));
console.log('Phase 3.1: 基本統計のみ送信');
console.log('='.repeat(80));
console.log('\ncurl -X POST ' + BASE_URL + '/group-data \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "X-Analytics-Signature: ' + signature31 + '" \\');
console.log('  -d \'' + JSON.stringify(test31Data) + '\'');
console.log('');

/**
 * Phase 3.2: 感情分析付き送信
 */
const test32Data = {
  ...test31Data,
  sentimentAnalysis: {
    positive: 68,
    neutral: 35,
    negative: 17,
    positiveRate: 56.7,
    negativeRate: 14.2,
    byDepartment: [],
    byCategory: [],
  },
};

const signature32 = generateHMACSignature(test32Data);

console.log('='.repeat(80));
console.log('Phase 3.2: 感情分析付き送信');
console.log('='.repeat(80));
console.log('\nSignature: ' + signature32);
console.log('');

/**
 * Phase 3.3: トピック分析付き送信
 */
const test33Data = {
  ...test31Data,
  topicAnalysis: {
    topKeywords: [
      { keyword: '夜勤', count: 23, trend: 'rising', relatedCategories: [] },
      { keyword: '研修', count: 18, trend: 'stable', relatedCategories: [] },
    ],
    emergingTopics: [
      { topic: '新人教育制度', strength: 0.85, firstAppeared: '2025-10-01', relatedKeywords: [] },
    ],
    byDepartment: [],
  },
};

const signature33 = generateHMACSignature(test33Data);

console.log('='.repeat(80));
console.log('Phase 3.3: トピック分析付き送信');
console.log('='.repeat(80));
console.log('\nSignature: ' + signature33);
console.log('');

/**
 * Phase 3.5: 無効な署名
 */
console.log('='.repeat(80));
console.log('Phase 3.5: 無効な署名テスト');
console.log('='.repeat(80));
console.log('\ncurl -X POST ' + BASE_URL + '/group-data \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "X-Analytics-Signature: invalid-signature-12345" \\');
console.log('  -d \'' + JSON.stringify(test31Data) + '\'');
console.log('');
console.log('期待される結果: 403 Forbidden, INVALID_SIGNATURE');
console.log('');
