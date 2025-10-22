/**
 * 議題提案書API テスト
 * モックデータを使用したAPIの動作確認
 */

import request from 'supertest';
import app from '../api/server';
import { proposalDocumentGenerator } from '../services/ProposalDocumentGenerator';
import { committeeSubmissionService } from '../services/CommitteeSubmissionService';
import { User, Post } from '../types';

describe('Proposal Documents API', () => {
  let testUser: User;
  let testDocument: any;
  let testDocumentId: string;

  beforeEach(() => {
    // テストユーザーの作成
    testUser = {
      id: 'test-user-001',
      employeeId: 'TEST-001',
      name: 'テスト 太郎',
      department: 'テスト部署',
      position: '課長',
      permissionLevel: 8.0,
      email: 'test@example.com',
      photoUrl: null,
      isActive: true,
      joinDate: new Date('2020-01-01'),
      birthDate: new Date('1985-01-01')
    };

    // テスト用の投稿データ
    const testPost: Post = {
      id: 'test-post-001',
      content: '夜勤体制の見直しと人員配置の最適化を提案します',
      author: testUser,
      authorId: testUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAnonymous: false,
      department: 'テスト部署',
      proposalType: 'operational',
      votes: [],
      comments: [],
      tags: [],
      attachments: [],
      status: 'active'
    };

    // 議題提案書を生成
    testDocument = proposalDocumentGenerator.generateDocument(
      testPost,
      'FACILITY_AGENDA',
      testUser
    );
    testDocumentId = testDocument.id;

    // 委員会提出リクエストをクリア
    committeeSubmissionService.clearRequests();
  });

  afterEach(() => {
    // クリーンアップ
    proposalDocumentGenerator.clearDocuments();
    committeeSubmissionService.clearRequests();
  });

  describe('GET /api/proposal-documents/:documentId', () => {
    it('議題提案書を取得できる', async () => {
      const response = await request(app)
        .get(`/api/proposal-documents/${testDocumentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testDocumentId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('background');
      expect(response.body).toHaveProperty('objectives');
      expect(response.body).toHaveProperty('expectedEffects');
      expect(response.body).toHaveProperty('concerns');
      expect(response.body).toHaveProperty('counterMeasures');
      expect(response.body).toHaveProperty('voteAnalysis');
      expect(response.body).toHaveProperty('commentAnalysis');
      expect(response.body).toHaveProperty('auditLog');
      expect(response.body.status).toBe('draft');
    });

    it('存在しない議題提案書の場合は404エラー', async () => {
      const response = await request(app)
        .get('/api/proposal-documents/non-existent-id')
        .expect(404);

      expect(response.body.error).toHaveProperty('code', 'DOCUMENT_NOT_FOUND');
    });
  });

  describe('PUT /api/proposal-documents/:documentId', () => {
    it('管理職による補足を更新できる', async () => {
      const updates = {
        managerNotes: '現場の声を反映した提案です',
        additionalContext: '人員確保については人事部と調整済みです',
        recommendationLevel: 'recommend',
        user: testUser
      };

      const response = await request(app)
        .put(`/api/proposal-documents/${testDocumentId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('documentId', testDocumentId);
      expect(response.body).toHaveProperty('lastModifiedDate');
      expect(response.body).toHaveProperty('auditLogId');

      // 更新内容を確認
      const document = proposalDocumentGenerator.getDocument(testDocumentId);
      expect(document?.managerNotes).toBe(updates.managerNotes);
      expect(document?.additionalContext).toBe(updates.additionalContext);
      expect(document?.recommendationLevel).toBe(updates.recommendationLevel);
    });

    it('Level 7未満のユーザーは編集できない', async () => {
      const lowLevelUser = { ...testUser, permissionLevel: 6.0 };
      const updates = {
        managerNotes: 'テスト',
        user: lowLevelUser
      };

      const response = await request(app)
        .put(`/api/proposal-documents/${testDocumentId}`)
        .send(updates)
        .expect(403);

      expect(response.body.error).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });

    it('提出済みの議題提案書は編集できない', async () => {
      // 提出済みにマーク
      proposalDocumentGenerator.markAsReady(testDocumentId, testUser);
      const request1 = committeeSubmissionService.createSubmissionRequest(
        testDocumentId,
        '運営委員会',
        testUser
      );
      if (request1) {
        committeeSubmissionService.approveSubmissionRequest(request1.id, testUser);
      }

      const updates = {
        managerNotes: 'テスト',
        user: testUser
      };

      const response = await request(app)
        .put(`/api/proposal-documents/${testDocumentId}`)
        .send(updates)
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'DOCUMENT_ALREADY_SUBMITTED');
    });
  });

  describe('POST /api/proposal-documents/:documentId/mark-ready', () => {
    it('提出準備完了としてマークできる', async () => {
      const response = await request(app)
        .post(`/api/proposal-documents/${testDocumentId}/mark-ready`)
        .send({ user: testUser })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('documentId', testDocumentId);

      // ステータスを確認
      const document = proposalDocumentGenerator.getDocument(testDocumentId);
      expect(document?.status).toBe('ready');
    });

    it('Level 7未満のユーザーはマークできない', async () => {
      const lowLevelUser = { ...testUser, permissionLevel: 6.0 };

      const response = await request(app)
        .post(`/api/proposal-documents/${testDocumentId}/mark-ready`)
        .send({ user: lowLevelUser })
        .expect(403);

      expect(response.body.error).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('GET /api/proposal-documents/:documentId/audit-logs', () => {
    it('監査ログを取得できる', async () => {
      // 複数の操作を実行してログを生成
      proposalDocumentGenerator.updateDocument(
        testDocumentId,
        { managerNotes: 'テスト1' },
        testUser
      );
      proposalDocumentGenerator.updateDocument(
        testDocumentId,
        { additionalContext: 'テスト2' },
        testUser
      );

      const response = await request(app)
        .get(`/api/proposal-documents/${testDocumentId}/audit-logs`)
        .expect(200);

      expect(response.body).toHaveProperty('auditLogs');
      expect(Array.isArray(response.body.auditLogs)).toBe(true);
      expect(response.body.auditLogs.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('limit', 50);
      expect(response.body.pagination).toHaveProperty('offset', 0);
    });

    it('ページネーションが機能する', async () => {
      const response = await request(app)
        .get(`/api/proposal-documents/${testDocumentId}/audit-logs`)
        .query({ limit: 2, offset: 0 })
        .expect(200);

      expect(response.body.pagination).toHaveProperty('limit', 2);
      expect(response.body.pagination).toHaveProperty('offset', 0);
    });
  });

  describe('POST /api/committee-submission-requests', () => {
    beforeEach(() => {
      // 提出準備完了状態にする
      proposalDocumentGenerator.markAsReady(testDocumentId, testUser);
    });

    it('委員会提出リクエストを作成できる', async () => {
      const requestData = {
        documentId: testDocumentId,
        targetCommittee: '運営委員会',
        user: testUser
      };

      const response = await request(app)
        .post('/api/committee-submission-requests')
        .send(requestData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('requestId');
      expect(response.body).toHaveProperty('documentId', testDocumentId);
      expect(response.body).toHaveProperty('targetCommittee', '運営委員会');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('requestedBy');
      expect(response.body.requestedBy).toHaveProperty('name', testUser.name);
    });

    it('Level 7未満のユーザーはリクエストを作成できない', async () => {
      const lowLevelUser = { ...testUser, permissionLevel: 6.0 };
      const requestData = {
        documentId: testDocumentId,
        targetCommittee: '運営委員会',
        user: lowLevelUser
      };

      const response = await request(app)
        .post('/api/committee-submission-requests')
        .send(requestData)
        .expect(403);

      expect(response.body.error).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });

    it('提出準備完了状態でない場合はリクエストを作成できない', async () => {
      // 別の議題提案書を作成（draft状態）
      const draftPost: Post = {
        id: 'test-post-002',
        content: 'テスト投稿2',
        author: testUser,
        authorId: testUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAnonymous: false,
        department: 'テスト部署',
        proposalType: 'operational',
        votes: [],
        comments: [],
        tags: [],
        attachments: [],
        status: 'active'
      };

      const draftDocument = proposalDocumentGenerator.generateDocument(
        draftPost,
        'FACILITY_AGENDA',
        testUser
      );

      const requestData = {
        documentId: draftDocument.id,
        targetCommittee: '運営委員会',
        user: testUser
      };

      const response = await request(app)
        .post('/api/committee-submission-requests')
        .send(requestData)
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'INVALID_STATUS');
    });

    it('必須パラメータが不足している場合はエラー', async () => {
      const requestData = {
        documentId: testDocumentId
        // targetCommittee と user が不足
      };

      const response = await request(app)
        .post('/api/committee-submission-requests')
        .send(requestData)
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'INVALID_INPUT');
    });
  });
});
