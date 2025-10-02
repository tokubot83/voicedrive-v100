// 面談結果受信API統合テスト
// /api/sync/interview-results エンドポイントのテスト

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const API_KEY = process.env.MCP_API_KEY || 'test-api-key';

describe('Interview Results Sync API Integration Tests', () => {
  // テストデータ
  const testInterviewResult = {
    requestId: `vd-test-${Date.now()}`,
    interviewId: `med-interview-${Date.now()}`,
    completedAt: new Date().toISOString(),
    duration: 45,
    summary: '定期面談を実施。職員の業務状況は良好で、特に問題は見られない。',
    keyPoints: [
      '業務遂行能力が向上している',
      'チーム内でのコミュニケーションが活発',
      '次回は具体的なキャリアプランの相談を希望',
    ],
    actionItems: [
      {
        description: 'キャリアプラン資料の作成',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7日後
      },
      {
        description: '上司との三者面談のスケジュール調整',
      },
    ],
    followUpRequired: true,
    followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
    feedbackToEmployee: '今回の面談では、あなたの成長を確認できました。引き続き現在の業務を継続しながら、キャリアプランについて一緒に考えていきましょう。',
    nextRecommendations: {
      suggestedNextInterview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90日後
      suggestedTopics: ['キャリア開発', 'スキルアップ計画', 'リーダーシップ研修'],
    },
  };

  describe('POST /api/sync/interview-results', () => {
    it('正常系: 面談結果を正常に受信できる', async () => {
      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(testInterviewResult),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(data.receivedAt).toBeDefined();
      expect(data.data).toBeDefined();
      expect(data.data.requestId).toBe(testInterviewResult.requestId);
      expect(data.data.interviewId).toBe(testInterviewResult.interviewId);
    }, 30000);

    it('正常系: 同じinterviewIdで再送信すると更新される', async () => {
      // 1回目の送信
      const response1 = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(testInterviewResult),
      });

      expect(response1.status).toBe(200);
      const data1 = await response1.json();
      const firstId = data1.data.id;

      // 2回目の送信（summaryを変更）
      const updatedResult = {
        ...testInterviewResult,
        summary: '【更新】定期面談を実施。職員の業務状況は非常に良好。',
      };

      const response2 = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(updatedResult),
      });

      expect(response2.status).toBe(200);
      const data2 = await response2.json();

      // 同じIDで更新されていることを確認
      expect(data2.data.id).toBe(firstId);
    }, 30000);

    it('異常系: 認証トークンなしでリクエストすると401エラー', async () => {
      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testInterviewResult),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('異常系: 無効な認証トークンで401エラー', async () => {
      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token-12345',
        },
        body: JSON.stringify(testInterviewResult),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('異常系: requestIdが欠けていると400エラー', async () => {
      const invalidData = { ...testInterviewResult };
      delete (invalidData as any).requestId;

      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Bad Request');
      expect(data.details).toContain('requestId');
    });

    it('異常系: interviewIdが欠けていると400エラー', async () => {
      const invalidData = { ...testInterviewResult };
      delete (invalidData as any).interviewId;

      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.details).toContain('interviewId');
    });

    it('異常系: summaryが欠けていると400エラー', async () => {
      const invalidData = { ...testInterviewResult };
      delete (invalidData as any).summary;

      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.details).toContain('summary');
    });

    it('異常系: keyPointsが配列でないと400エラー', async () => {
      const invalidData = {
        ...testInterviewResult,
        keyPoints: 'not an array', // 配列でない
      };

      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.details).toContain('keyPoints');
    });

    it('異常系: GETメソッドは405エラー', async () => {
      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });
  });

  describe('データ整合性テスト', () => {
    it('日付フィールドが正しくパースされる', async () => {
      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(testInterviewResult),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);

      // 日付フィールドがISO形式であることを確認
      expect(new Date(data.receivedAt).toISOString()).toBe(data.receivedAt);
    });

    it('actionItemsのdueDateがオプショナルで機能する', async () => {
      const testData = {
        ...testInterviewResult,
        actionItems: [
          { description: 'dueDateなしのアイテム' },
          {
            description: 'dueDateありのアイテム',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };

      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(testData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('followUpDateなしでも正常に動作する', async () => {
      const testData = {
        ...testInterviewResult,
        followUpRequired: false,
        followUpDate: undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/sync/interview-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(testData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
