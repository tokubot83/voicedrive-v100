/**
 * VoiceDrive Analytics API統合テスト
 *
 * 職員カルテシステムとの統合テスト
 * 実施日: 2025年10月9日
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:4000';
const API_BASE = `${BASE_URL}/api/v1/analytics`;

// テスト用JWT（職員カルテシステム用）
const TEST_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFmZklkIjoic3lzdGVtLXN0YWZmLWNhcmQiLCJlbWFpbCI6InN5c3RlbUBzdGFmZi1jYXJkLmV4YW1wbGUuY29tIiwiYWNjb3VudExldmVsIjo5OSwiZmFjaWxpdHkiOiJzdGFmZi1jYXJkLXN5c3RlbSIsImRlcGFydG1lbnQiOiJpbnRlZ3JhdGlvbiIsImlhdCI6MTY5NjY5NDQwMCwiZXhwIjoxNzA0NDcwNDAwfQ';

// HMAC署名シークレット
const HMAC_SECRET = 'integration-test-secret-2025';

// Axiosインスタンス作成
const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

/**
 * HMAC署名生成
 */
function generateHMACSignature(data: any): string {
  const jsonString = JSON.stringify(data);
  return crypto.createHmac('sha256', HMAC_SECRET)
    .update(jsonString)
    .digest('hex');
}

describe('VoiceDrive Analytics API統合テスト', () => {
  beforeAll(async () => {
    console.log('🚀 統合テスト開始');
    console.log(`📍 APIベースURL: ${API_BASE}`);
    console.log(`🔑 JWT認証: 設定済み`);
    console.log(`🔐 HMAC署名: 設定済み`);
  });

  afterAll(() => {
    console.log('✅ 統合テスト完了');
  });

  /**
   * Phase 1: 接続確認
   */
  describe('Phase 1: 接続確認', () => {
    it('ヘルスチェック', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');

      console.log('✅ ヘルスチェック成功');
    });

    it('MCP Server ヘルスチェック', async () => {
      const response = await axios.get(`${BASE_URL}/api/mcp/health`);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');

      console.log('✅ MCPサーバーヘルスチェック成功');
    });
  });

  /**
   * Phase 2: GET API テスト（集計データ取得）
   */
  describe('Phase 2: GET API テスト', () => {
    it('正常系: 1週間分のデータ取得', async () => {
      const params = {
        startDate: '2025-10-01',
        endDate: '2025-10-07',
      };

      const response = await client.get('/aggregated-stats', { params });

      expect(response.status).toBe(200);
      expect(response.data.period).toBeDefined();
      expect(response.data.stats).toBeDefined();
      expect(response.data.privacyMetadata).toBeDefined();

      console.log('✅ 1週間分データ取得成功');
      console.log(`   総投稿数: ${response.data.stats.totalPosts}`);
      console.log(`   総ユーザー数: ${response.data.stats.totalUsers}`);
    });

    it('正常系: 1ヶ月分のデータ取得', async () => {
      const params = {
        startDate: '2025-10-01',
        endDate: '2025-10-31',
      };

      const response = await client.get('/aggregated-stats', { params });

      expect(response.status).toBe(200);
      expect(response.data.period.startDate).toBe('2025-10-01');
      expect(response.data.period.endDate).toBe('2025-10-31');

      console.log('✅ 1ヶ月分データ取得成功');
    });

    it('正常系: 3ヶ月分のデータ取得', async () => {
      const params = {
        startDate: '2025-08-01',
        endDate: '2025-10-31',
      };

      const response = await client.get('/aggregated-stats', { params });

      expect(response.status).toBe(200);

      console.log('✅ 3ヶ月分データ取得成功');
    });

    it('エラー系: 過去6ヶ月前を超えるデータ要求', async () => {
      const params = {
        startDate: '2025-03-01',
        endDate: '2025-03-31',
      };

      try {
        await client.get('/aggregated-stats', { params });
        fail('エラーが発生すべき');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.code).toBe('DATE_TOO_OLD');

        console.log('✅ 過去6ヶ月前制限エラー確認');
      }
    });

    it('エラー系: 90日を超える期間要求', async () => {
      const params = {
        startDate: '2025-07-01',
        endDate: '2025-10-31',
      };

      try {
        await client.get('/aggregated-stats', { params });
        fail('エラーが発生すべき');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.code).toBe('DATE_RANGE_TOO_LONG');

        console.log('✅ 90日超過エラー確認');
      }
    });

    it('エラー系: 無効な日付形式', async () => {
      const params = {
        startDate: '2025/10/01',
        endDate: '2025/10/07',
      };

      try {
        await client.get('/aggregated-stats', { params });
        fail('エラーが発生すべき');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error.code).toBe('INVALID_DATE_FORMAT');

        console.log('✅ 日付形式エラー確認');
      }
    });
  });

  /**
   * Phase 3: POST API テスト（分析データ送信）
   */
  describe('Phase 3: POST API テスト', () => {
    it('正常系: 基本統計のみ送信', async () => {
      const data = {
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

      const signature = generateHMACSignature(data);

      const response = await client.post('/group-data', data, {
        headers: {
          'X-Analytics-Signature': signature,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log('✅ 基本統計のみ送信成功');
      console.log(`   受信時刻: ${response.data.receivedAt}`);
    });

    it('正常系: 感情分析付きデータ送信', async () => {
      const data = {
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
        sentimentAnalysis: {
          positive: 68,
          neutral: 35,
          negative: 17,
          positiveRate: 56.7,
          negativeRate: 14.2,
          byDepartment: [],
          byCategory: [],
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

      const signature = generateHMACSignature(data);

      const response = await client.post('/group-data', data, {
        headers: {
          'X-Analytics-Signature': signature,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log('✅ 感情分析付きデータ送信成功');
      console.log(`   感情分析結果: Positive ${data.sentimentAnalysis.positiveRate}%`);
    });

    it('正常系: トピック分析付きデータ送信', async () => {
      const data = {
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
        topicAnalysis: {
          topKeywords: [
            { keyword: '夜勤', count: 23, trend: 'rising' as const, relatedCategories: [] },
            { keyword: '研修', count: 18, trend: 'stable' as const, relatedCategories: [] },
          ],
          emergingTopics: [
            { topic: '新人教育制度', strength: 0.85, firstAppeared: '2025-10-01', relatedKeywords: [] },
          ],
          byDepartment: [],
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

      const signature = generateHMACSignature(data);

      const response = await client.post('/group-data', data, {
        headers: {
          'X-Analytics-Signature': signature,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log('✅ トピック分析付きデータ送信成功');
      console.log(`   トップキーワード数: ${data.topicAnalysis.topKeywords.length}`);
    });

    it('エラー系: 無効なHMAC署名', async () => {
      const data = {
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

      try {
        await client.post('/group-data', data, {
          headers: {
            'X-Analytics-Signature': 'invalid-signature',
          },
        });
        fail('エラーが発生すべき');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.error.code).toBe('INVALID_SIGNATURE');

        console.log('✅ HMAC署名エラー確認');
      }
    });
  });

  /**
   * Phase 4: エラーハンドリングテスト
   */
  describe('Phase 4: エラーハンドリング', () => {
    it('エラー系: JWT認証エラー', async () => {
      const invalidClient = axios.create({
        baseURL: API_BASE,
        timeout: 10000,
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json',
        },
      });

      try {
        await invalidClient.get('/aggregated-stats', {
          params: {
            startDate: '2025-10-01',
            endDate: '2025-10-07',
          },
        });
        fail('エラーが発生すべき');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error.code).toBe('AUTH_REQUIRED');

        console.log('✅ JWT認証エラー確認');
      }
    });
  });
});
