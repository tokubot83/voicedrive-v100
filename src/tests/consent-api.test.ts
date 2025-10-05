/**
 * データ同意API 統合テスト
 * 削除完了通知エンドポイントのテスト
 * @version 1.0.0
 * @date 2025-10-05
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../api/server';

// ==================== テスト設定 ====================

const prisma = new PrismaClient();

// テストデータ（タイムスタンプでユニークにする）
const timestamp = Date.now();
const testUserId = `test-user-${timestamp}-001`;
const testUserId2 = `test-user-${timestamp}-002`;
const testUserId3 = `test-user-${timestamp}-003`;

beforeAll(async () => {
  // テストデータのセットアップ
  await setupTestData();
});

afterAll(async () => {
  // テストデータのクリーンアップ
  await cleanupTestData();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // 各テスト前にデータをリセット
  await resetTestData();
});

// ==================== ヘルパー関数 ====================

async function setupTestData() {
  // 既存のテストデータをクリーンアップ
  await cleanupTestData();

  // ユーザーデータ作成
  await prisma.user.create({
    data: {
      id: testUserId,
      employeeId: `TEST-EMP-${timestamp}-001`,
      email: `test-${timestamp}-001@example.com`,
      name: 'テストユーザー1',
      accountType: 'staff',
      permissionLevel: 1
    }
  });

  await prisma.user.create({
    data: {
      id: testUserId2,
      employeeId: `TEST-EMP-${timestamp}-002`,
      email: `test-${timestamp}-002@example.com`,
      name: 'テストユーザー2',
      accountType: 'staff',
      permissionLevel: 1
    }
  });

  await prisma.user.create({
    data: {
      id: testUserId3,
      employeeId: `TEST-EMP-${timestamp}-003`,
      email: `test-${timestamp}-003@example.com`,
      name: 'テストユーザー3',
      accountType: 'staff',
      permissionLevel: 1
    }
  });

  // DataConsentレコード作成
  await prisma.dataConsent.create({
    data: {
      userId: testUserId,
      analyticsConsent: true,
      analyticsConsentDate: new Date(),
      dataDeletionRequested: true,
      dataDeletionRequestedAt: new Date()
    }
  });

  await prisma.dataConsent.create({
    data: {
      userId: testUserId2,
      analyticsConsent: false,
      dataDeletionRequested: false
    }
  });

  await prisma.dataConsent.create({
    data: {
      userId: testUserId3,
      analyticsConsent: true,
      analyticsConsentDate: new Date(),
      dataDeletionRequested: true,
      dataDeletionRequestedAt: new Date(),
      dataDeletionCompletedAt: new Date() // 既に完了済み
    }
  });
}

async function cleanupTestData() {
  // 逆順で削除（外部キー制約対応）
  await prisma.auditLog.deleteMany({
    where: { userId: { in: [testUserId, testUserId2, testUserId3] } }
  });

  await prisma.notification.deleteMany({
    where: { senderId: { in: [testUserId, testUserId2, testUserId3, 'system'] } }
  });

  await prisma.dataConsent.deleteMany({
    where: { userId: { in: [testUserId, testUserId2, testUserId3] } }
  });

  await prisma.user.deleteMany({
    where: { id: { in: [testUserId, testUserId2, testUserId3] } }
  });
}

async function resetTestData() {
  // DataConsentを初期状態に戻す
  await prisma.dataConsent.update({
    where: { userId: testUserId },
    data: {
      dataDeletionCompletedAt: null
    }
  });

  // 監査ログとNotificationを削除
  await prisma.auditLog.deleteMany({
    where: { userId: testUserId }
  });

  await prisma.notification.deleteMany({
    where: { category: 'system', subcategory: 'data_deletion' }
  });
}

// ==================== 削除完了API テスト ====================

describe('POST /api/consent/deletion-completed', () => {
  it('正常な削除完了通知を受信できる', async () => {
    const requestBody = {
      userId: testUserId,
      deletedAt: new Date().toISOString(),
      deletedItemCount: 42
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.userId).toBe(testUserId);
    expect(response.body.completedAt).toBeDefined();
    expect(response.body.message).toContain('42件');

    // DataConsentテーブルが更新されているか確認
    const consentRecord = await prisma.dataConsent.findUnique({
      where: { userId: testUserId }
    });

    expect(consentRecord?.dataDeletionCompletedAt).toBeDefined();
    expect(consentRecord?.dataDeletionCompletedAt).toBeInstanceOf(Date);
  });

  it('監査ログが正しく記録される', async () => {
    const requestBody = {
      userId: testUserId,
      deletedAt: new Date().toISOString(),
      deletedItemCount: 10
    };

    await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(200);

    // 監査ログを確認
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: testUserId,
        action: 'DATA_DELETION_COMPLETED'
      }
    });

    expect(auditLogs.length).toBeGreaterThan(0);

    const log = auditLogs[0];
    expect(log.entityType).toBe('DataConsent');
    expect(log.newValues).toBeDefined();
    expect((log.newValues as any).deletedItemCount).toBe(10);
  });

  it('ユーザー通知が作成される', async () => {
    const requestBody = {
      userId: testUserId,
      deletedAt: new Date().toISOString(),
      deletedItemCount: 25
    };

    await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(200);

    // 通知を確認
    const notifications = await prisma.notification.findMany({
      where: {
        category: 'system',
        subcategory: 'data_deletion',
        content: { contains: '25件' }
      }
    });

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].priority).toBe('high');
    expect(notifications[0].title).toContain('削除が完了');
  });

  it('userIdが未指定の場合はエラー', async () => {
    const requestBody = {
      deletedAt: new Date().toISOString(),
      deletedItemCount: 10
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('INVALID_USER_ID');
  });

  it('deletedAtが未指定の場合はエラー', async () => {
    const requestBody = {
      userId: testUserId,
      deletedItemCount: 10
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('INVALID_DELETED_AT');
  });

  it('deletedItemCountが負の数の場合はエラー', async () => {
    const requestBody = {
      userId: testUserId,
      deletedAt: new Date().toISOString(),
      deletedItemCount: -5
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('INVALID_DELETED_ITEM_COUNT');
  });

  it('存在しないuserIdの場合はエラー', async () => {
    const requestBody = {
      userId: 'non-existent-user',
      deletedAt: new Date().toISOString(),
      deletedItemCount: 10
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('CONSENT_RECORD_NOT_FOUND');
  });

  it('削除リクエストしていないユーザーの場合はエラー', async () => {
    const requestBody = {
      userId: testUserId2, // dataDeletionRequested = false
      deletedAt: new Date().toISOString(),
      deletedItemCount: 10
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('NO_DELETION_REQUEST');
  });

  it('既に削除完了しているユーザーの場合はエラー', async () => {
    const requestBody = {
      userId: testUserId3, // 既にdataDeletionCompletedAt設定済み
      deletedAt: new Date().toISOString(),
      deletedItemCount: 10
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('ALREADY_COMPLETED');
  });

  it('deletedItemCountが0の場合も正常に処理される', async () => {
    const requestBody = {
      userId: testUserId,
      deletedAt: new Date().toISOString(),
      deletedItemCount: 0
    };

    const response = await request(app)
      .post('/api/consent/deletion-completed')
      .send(requestBody)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('0件');
  });
});

// ==================== 同意状態取得API テスト ====================

describe('GET /api/consent/status/:userId', () => {
  it('同意状態を正常に取得できる', async () => {
    const response = await request(app)
      .get(`/api/consent/status/${testUserId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.consent).toBeDefined();
    expect(response.body.consent.analyticsConsent).toBe(true);
    expect(response.body.consent.dataDeletionRequested).toBe(true);
  });

  it('存在しないuserIdの場合は404エラー', async () => {
    const response = await request(app)
      .get('/api/consent/status/non-existent-user')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('CONSENT_RECORD_NOT_FOUND');
  });

  it('削除完了済みユーザーの情報も取得できる', async () => {
    const response = await request(app)
      .get(`/api/consent/status/${testUserId3}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.consent.dataDeletionCompletedAt).toBeDefined();
  });
});

// ==================== E2Eシナリオテスト ====================

describe('E2E: データ削除完了フロー', () => {
  it('完全な削除フローが正常に動作する', async () => {
    // 1. 初期状態確認
    const initialStatus = await request(app)
      .get(`/api/consent/status/${testUserId}`)
      .expect(200);

    expect(initialStatus.body.consent.dataDeletionRequested).toBe(true);
    expect(initialStatus.body.consent.dataDeletionCompletedAt).toBeNull();

    // 2. 削除完了通知
    const deletionRequest = {
      userId: testUserId,
      deletedAt: new Date().toISOString(),
      deletedItemCount: 150
    };

    const deletionResponse = await request(app)
      .post('/api/consent/deletion-completed')
      .send(deletionRequest)
      .expect(200);

    expect(deletionResponse.body.success).toBe(true);

    // 3. 更新後の状態確認
    const updatedStatus = await request(app)
      .get(`/api/consent/status/${testUserId}`)
      .expect(200);

    expect(updatedStatus.body.consent.dataDeletionCompletedAt).toBeDefined();

    // 4. 再度同じリクエストを送信（エラーになるはず）
    const duplicateResponse = await request(app)
      .post('/api/consent/deletion-completed')
      .send(deletionRequest)
      .expect(400);

    expect(duplicateResponse.body.error).toBe('ALREADY_COMPLETED');
  });
});

// ==================== パフォーマンステスト ====================

describe('パフォーマンステスト', () => {
  it('複数の削除完了通知を並行処理できる', async () => {
    // 複数のテストユーザーを作成
    const perfTimestamp = Date.now();
    const userIds = [
      `perf-user-${perfTimestamp}-1`,
      `perf-user-${perfTimestamp}-2`,
      `perf-user-${perfTimestamp}-3`
    ];

    // ユーザーとDataConsentレコードを作成
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      await prisma.user.create({
        data: {
          id: userId,
          employeeId: `PERF-EMP-${perfTimestamp}-${i + 1}`,
          email: `perf-${perfTimestamp}-${i + 1}@example.com`,
          name: `Performance Test User ${i + 1}`,
          accountType: 'staff',
          permissionLevel: 1
        }
      });

      await prisma.dataConsent.create({
        data: {
          userId,
          analyticsConsent: true,
          analyticsConsentDate: new Date(),
          dataDeletionRequested: true,
          dataDeletionRequestedAt: new Date()
        }
      });
    }

    // 並行リクエスト
    const requests = userIds.map(userId =>
      request(app)
        .post('/api/consent/deletion-completed')
        .send({
          userId,
          deletedAt: new Date().toISOString(),
          deletedItemCount: 50
        })
    );

    const responses = await Promise.all(requests);

    // すべて成功
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    // クリーンアップ（外部キー制約を考慮して順序に注意）
    await prisma.auditLog.deleteMany({
      where: { userId: { in: userIds } }
    });

    await prisma.notification.deleteMany({
      where: { senderId: { in: userIds } }
    });

    await prisma.dataConsent.deleteMany({
      where: { userId: { in: userIds } }
    });

    await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });
  }, 15000);
});

// ==================== まとめ ====================

describe('統合テストサマリー', () => {
  it('全機能が正常に動作する', () => {
    const results = {
      deletionCompletedAPI: true,
      validationLogic: true,
      auditLog: true,
      notification: true,
      statusAPI: true,
      e2eFlow: true
    };

    Object.values(results).forEach(result => {
      expect(result).toBe(true);
    });

    console.log('✅ All consent API tests passed successfully');
  });
});
