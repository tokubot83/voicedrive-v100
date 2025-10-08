/**
 * VoiceDrive Webhook通知API統合テスト
 *
 * 職員カルテシステムからのAnalyticsバッチ処理通知受信テスト
 * 作成日: 2025年10月10日
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:4000';
const WEBHOOK_URL = `${BASE_URL}/api/webhook/analytics-notification`;

// HMAC署名シークレット（.env.integration-testと同じ）
const WEBHOOK_SECRET = 'webhook-notification-secret-2025';

/**
 * HMAC署名生成
 */
function generateHMACSignature(payload: string, timestamp: string): string {
  return crypto.createHmac('sha256', WEBHOOK_SECRET)
    .update(payload + timestamp)
    .digest('hex');
}

/**
 * テスト用通知データ作成
 */
function createTestNotification(overrides?: any) {
  const timestamp = new Date().toISOString();
  const notification = {
    notificationId: `test-${Date.now()}`,
    timestamp,
    accountLevel: 99,
    type: 'success',
    title: 'Analyticsバッチ処理完了',
    message: 'LLM分析が正常に完了しました',
    details: {
      processedRecords: 150,
      startTime: '2025-10-10T02:00:00.000Z',
      endTime: '2025-10-10T02:05:30.000Z',
      processingDuration: 330000
    },
    ...overrides
  };

  return { notification, timestamp };
}

describe('VoiceDrive Webhook通知API統合テスト', () => {
  beforeAll(async () => {
    console.log('🚀 Webhook通知統合テスト開始');
    console.log(`📍 WebhookURL: ${WEBHOOK_URL}`);
    console.log(`🔐 HMAC署名検証: 有効`);
  });

  afterAll(() => {
    console.log('✅ Webhook通知統合テスト完了');
  });

  /**
   * Phase 1: 正常系テスト
   */
  describe('Phase 1: 正常系テスト', () => {
    it('成功通知（type: success）', async () => {
      const { notification, timestamp } = createTestNotification();
      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      const response = await axios.post(WEBHOOK_URL, notification, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Timestamp': timestamp
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('通知を受信しました');
      expect(response.data.notificationId).toBe(notification.notificationId);
      expect(response.data.receivedAt).toBeDefined();

      console.log('✅ 成功通知テスト成功');
      console.log(`   通知ID: ${response.data.notificationId}`);
    });

    it('エラー通知（type: error）', async () => {
      const { notification, timestamp } = createTestNotification({
        type: 'error',
        title: 'Analyticsバッチ処理エラー',
        message: 'LLM分析中にエラーが発生しました',
        details: {
          errorCode: 'LLM_CONNECTION_ERROR',
          errorMessage: 'OpenAI APIに接続できません',
          failedAt: '2025-10-10T02:03:15.000Z',
          retryCount: 3
        }
      });

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      const response = await axios.post(WEBHOOK_URL, notification, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Timestamp': timestamp
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log('✅ エラー通知テスト成功');
    });

    it('警告通知（type: warning）', async () => {
      const { notification, timestamp } = createTestNotification({
        type: 'warning',
        title: 'データ量警告',
        message: '分析対象データが予想より少ないです'
      });

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      const response = await axios.post(WEBHOOK_URL, notification, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Timestamp': timestamp
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log('✅ 警告通知テスト成功');
    });

    it('情報通知（type: info）', async () => {
      const { notification, timestamp } = createTestNotification({
        type: 'info',
        title: 'バッチ処理開始',
        message: 'Analyticsバッチ処理を開始しました'
      });

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      const response = await axios.post(WEBHOOK_URL, notification, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Timestamp': timestamp
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log('✅ 情報通知テスト成功');
    });
  });

  /**
   * Phase 2: エラーケーステスト（セキュリティ）
   */
  describe('Phase 2: エラーケーステスト（セキュリティ）', () => {
    it('エラー: X-Signatureヘッダー無し', async () => {
      const { notification, timestamp } = createTestNotification();

      try {
        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Timestamp': timestamp
            // X-Signature無し
          }
        });
        expect(true).toBe(false); // ここには到達しないはず
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
        expect((axiosError.response?.data as any).error.code).toBe('MISSING_SIGNATURE');

        console.log('✅ X-Signatureヘッダー無しエラーテスト成功');
      }
    });

    it('エラー: X-Timestampヘッダー無し', async () => {
      const { notification, timestamp } = createTestNotification();
      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      try {
        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature
            // X-Timestamp無し
          }
        });
        expect(true).toBe(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
        expect((axiosError.response?.data as any).error.code).toBe('MISSING_TIMESTAMP');

        console.log('✅ X-Timestampヘッダー無しエラーテスト成功');
      }
    });

    it('エラー: 無効なHMAC署名', async () => {
      const { notification, timestamp } = createTestNotification();
      const invalidSignature = 'invalid-signature-12345';

      try {
        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': invalidSignature,
            'X-Timestamp': timestamp
          }
        });
        expect(true).toBe(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
        expect((axiosError.response?.data as any).error.code).toBe('INVALID_SIGNATURE');

        console.log('✅ 無効なHMAC署名エラーテスト成功');
      }
    });

    it('エラー: タイムスタンプが古すぎる（6分前）', async () => {
      const { notification } = createTestNotification();
      const oldTimestamp = new Date(Date.now() - 6 * 60 * 1000).toISOString(); // 6分前
      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, oldTimestamp);

      try {
        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
            'X-Timestamp': oldTimestamp
          }
        });
        expect(true).toBe(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
        expect((axiosError.response?.data as any).error.code).toBe('INVALID_SIGNATURE');

        console.log('✅ タイムスタンプ期限切れエラーテスト成功');
      }
    });
  });

  /**
   * Phase 3: エラーケーステスト（バリデーション）
   */
  describe('Phase 3: エラーケーステスト（バリデーション）', () => {
    it('エラー: notificationId無し', async () => {
      const { notification, timestamp } = createTestNotification();
      delete (notification as any).notificationId;

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      try {
        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
            'X-Timestamp': timestamp
          }
        });
        expect(true).toBe(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
        expect((axiosError.response?.data as any).error.code).toBe('MISSING_NOTIFICATION_ID');

        console.log('✅ notificationId無しエラーテスト成功');
      }
    });

    it('エラー: accountLevelが99ではない', async () => {
      const { notification, timestamp } = createTestNotification({
        accountLevel: 1 // 99ではない
      });

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      try {
        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
            'X-Timestamp': timestamp
          }
        });
        expect(true).toBe(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
        expect((axiosError.response?.data as any).error.code).toBe('INVALID_ACCOUNT_LEVEL');

        console.log('✅ accountLevel検証エラーテスト成功');
      }
    });

    it('エラー: 無効な通知タイプ', async () => {
      const { notification, timestamp } = createTestNotification({
        type: 'invalid-type'
      });

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      try {
        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
            'X-Timestamp': timestamp
          }
        });
        expect(true).toBe(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
        expect((axiosError.response?.data as any).error.code).toBe('INVALID_NOTIFICATION_TYPE');

        console.log('✅ 無効な通知タイプエラーテスト成功');
      }
    });
  });

  /**
   * Phase 4: データベース保存確認テスト
   */
  describe('Phase 4: データベース保存確認テスト', () => {
    it('通知がデータベースに保存されることを確認', async () => {
      const { notification, timestamp } = createTestNotification({
        notificationId: `db-test-${Date.now()}`,
        title: 'データベース保存テスト'
      });

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      // 通知を送信
      const response = await axios.post(WEBHOOK_URL, notification, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Timestamp': timestamp
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // データベースから通知を取得
      const getResponse = await axios.get(`${BASE_URL}/api/webhook/notifications`, {
        params: {
          limit: 1
        }
      });

      expect(getResponse.status).toBe(200);
      expect(getResponse.data.success).toBe(true);
      expect(getResponse.data.data.length).toBeGreaterThan(0);

      // 最新の通知が保存されているか確認
      const savedNotification = getResponse.data.data[0];
      expect(savedNotification.notificationId).toBe(notification.notificationId);
      expect(savedNotification.type).toBe(notification.type);
      expect(savedNotification.title).toBe(notification.title);
      expect(savedNotification.message).toBe(notification.message);
      expect(savedNotification.accountLevel).toBe(notification.accountLevel);
      expect(savedNotification.read).toBe(false);

      console.log('✅ データベース保存確認テスト成功');
      console.log(`   保存された通知ID: ${savedNotification.id}`);
      console.log(`   notificationId: ${savedNotification.notificationId}`);
    });

    it('複数通知の取得とフィルタリング', async () => {
      // 異なるタイプの通知を3件送信
      const types = ['success', 'error', 'warning'];
      for (const type of types) {
        const { notification, timestamp } = createTestNotification({
          notificationId: `filter-test-${type}-${Date.now()}`,
          type,
          title: `フィルタリングテスト - ${type}`
        });

        const payload = JSON.stringify(notification);
        const signature = generateHMACSignature(payload, timestamp);

        await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
            'X-Timestamp': timestamp
          }
        });
      }

      // success通知のみフィルタリング
      const getResponse = await axios.get(`${BASE_URL}/api/webhook/notifications`, {
        params: {
          type: 'success',
          limit: 10
        }
      });

      expect(getResponse.status).toBe(200);
      expect(getResponse.data.success).toBe(true);

      // すべてsuccess通知であることを確認
      getResponse.data.data.forEach((notification: any) => {
        expect(notification.type).toBe('success');
      });

      console.log('✅ フィルタリングテスト成功');
      console.log(`   success通知件数: ${getResponse.data.data.length}`);
    });

    it('通知の既読更新', async () => {
      // 通知を1件送信
      const { notification, timestamp } = createTestNotification({
        notificationId: `read-test-${Date.now()}`,
        title: '既読テスト'
      });

      const payload = JSON.stringify(notification);
      const signature = generateHMACSignature(payload, timestamp);

      await axios.post(WEBHOOK_URL, notification, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Timestamp': timestamp
        }
      });

      // 最新の通知を取得
      const getResponse = await axios.get(`${BASE_URL}/api/webhook/notifications`, {
        params: { limit: 1 }
      });

      const savedNotification = getResponse.data.data[0];
      expect(savedNotification.read).toBe(false);

      // 既読にする
      const patchResponse = await axios.patch(
        `${BASE_URL}/api/webhook/notifications/${savedNotification.id}/read`
      );

      expect(patchResponse.status).toBe(200);
      expect(patchResponse.data.success).toBe(true);
      expect(patchResponse.data.data.read).toBe(true);
      expect(patchResponse.data.data.readAt).toBeDefined();

      console.log('✅ 既読更新テスト成功');
      console.log(`   通知ID: ${savedNotification.id}`);
      console.log(`   既読時刻: ${patchResponse.data.data.readAt}`);
    });
  });

  /**
   * Phase 5: パフォーマンステスト
   */
  describe('Phase 5: パフォーマンステスト', () => {
    it('連続5件の通知送信', async () => {
      const startTime = Date.now();
      const results: any[] = [];

      for (let i = 0; i < 5; i++) {
        const { notification, timestamp } = createTestNotification({
          notificationId: `perf-test-${i}-${Date.now()}`,
          title: `パフォーマンステスト通知 ${i + 1}/5`
        });

        const payload = JSON.stringify(notification);
        const signature = generateHMACSignature(payload, timestamp);

        const response = await axios.post(WEBHOOK_URL, notification, {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
            'X-Timestamp': timestamp
          }
        });

        results.push({
          status: response.status,
          notificationId: response.data.notificationId
        });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 5;

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      console.log('✅ 連続5件通知送信成功');
      console.log(`   総処理時間: ${totalTime}ms`);
      console.log(`   平均処理時間: ${avgTime.toFixed(2)}ms/件`);
    });
  });
});
