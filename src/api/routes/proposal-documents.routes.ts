/**
 * 提案書類API（Prisma対応版）
 * 作成日: 2025年10月13日
 * 更新日: 2025年10月22日
 *
 * エンドポイント:
 * - GET /api/proposal-documents - 提案書類一覧取得（NEW: 2025-10-22）
 * - GET /api/proposal-documents/:documentId - 提案書類取得
 * - PUT /api/proposal-documents/:documentId - 提案書類更新
 * - POST /api/proposal-documents - 提案書類作成
 * - POST /api/proposal-documents/:documentId/submit - 委員会提出（NEW: 2025-10-22）
 * - DELETE /api/proposal-documents/:documentId - 提案書類削除（NEW: 2025-10-22）
 * - POST /api/proposal-documents/:documentId/export - PDF/Wordエクスポート
 * - GET /api/proposal-documents/:documentId/audit-logs - 編集履歴取得
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getDocumentWithPermission,
  updateDocumentWithAudit,
  createAuditLog,
  getAuditLogs
} from '../../services/proposalDocumentService';
import {
  generatePDF,
  generateWord
} from '../../services/documentExportService';

const router = Router();
const prisma = new PrismaClient();

// ヘルパー関数: 権限チェック
function hasManagerPermission(level: number): boolean {
  return level >= 11;
}

function hasDirectorPermission(level: number): boolean {
  return level >= 13;
}

/**
 * GET /api/proposal-documents
 * 提案書類一覧取得（ProposalDocumentCard用）
 * NEW: 2025-10-22
 */
router.get('/proposal-documents', async (req: Request, res: Response) => {
  try {
    const {
      status,
      agendaLevel,
      createdById,
      targetCommittee,
      limit = '20',
      offset = '0',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
      userLevel
    } = req.query;

    if (!userId || !userLevel) {
      return res.status(400).json({
        success: false,
        error: 'userIdとuserLevelが必要です'
      });
    }

    const currentUserLevel = parseInt(userLevel as string, 10);

    // フィルタ条件構築
    const where: any = {};

    if (status) where.status = status;
    if (agendaLevel) where.agendaLevel = agendaLevel;
    if (createdById) where.createdById = createdById;
    if (targetCommittee) where.targetCommittee = targetCommittee;

    // 権限に応じたフィルタ
    if (currentUserLevel < 11) {
      // 一般職員: 提出済みのみ閲覧可能
      where.status = { in: ['submitted', 'approved', 'rejected'] };
    } else if (currentUserLevel < 13) {
      // 管理職: 自分の提案書 OR 提出済み
      where.OR = [
        { createdById: userId as string },
        { status: { in: ['submitted', 'approved', 'rejected'] } }
      ];
    }
    // Level 13+: すべて閲覧可能（フィルタなし）

    console.log('[GET /api/proposal-documents] 一覧取得開始:', {
      where,
      limit,
      offset,
      sortBy,
      sortOrder
    });

    // 総件数取得
    const total = await prisma.proposalDocument.count({ where });

    // データ取得
    const documents = await prisma.proposalDocument.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true
          }
        },
        submittedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { [sortBy as string]: sortOrder },
      take: Number(limit),
      skip: Number(offset)
    });

    // レスポンス整形
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      postId: doc.postId,
      title: doc.title,
      agendaLevel: doc.agendaLevel,
      status: doc.status,
      summary: doc.summary,
      voteAnalysis: doc.voteAnalysis,
      commentAnalysis: doc.commentAnalysis,
      recommendationLevel: doc.recommendationLevel,
      targetCommittee: doc.targetCommittee,
      submittedDate: doc.submittedDate?.toISOString(),
      createdBy: doc.createdBy,
      submittedBy: doc.submittedBy,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));

    const totalPages = Math.ceil(total / Number(limit));
    const currentPage = Math.floor(Number(offset) / Number(limit)) + 1;

    console.log('[GET /api/proposal-documents] 一覧取得完了:', {
      count: formattedDocuments.length,
      total
    });

    return res.status(200).json({
      success: true,
      data: {
        documents: formattedDocuments,
        pagination: {
          total,
          hasMore: total > Number(offset) + documents.length,
          currentPage,
          totalPages
        }
      }
    });

  } catch (error: any) {
    console.error('[GET /api/proposal-documents] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '提案書類一覧の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/proposal-documents/:documentId
 * 提案書類取得
 */
router.get('/proposal-documents/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { userId, userLevel } = req.query;

    if (!userId || !userLevel) {
      return res.status(400).json({
        success: false,
        error: 'userIdとuserLevelが必要です'
      });
    }

    console.log('[GET /api/proposal-documents/:documentId] 取得開始:', {
      documentId,
      userId,
      userLevel
    });

    const { document, canEdit } = await getDocumentWithPermission(
      documentId,
      userId as string,
      parseInt(userLevel as string, 10)
    );

    const { auditLogs } = await getAuditLogs(documentId, 5, 0);

    const editHistory = auditLogs.map(log => ({
      action: log.action,
      userName: log.userName,
      timestamp: log.timestamp.toISOString(),
      changedFields: log.changedFields ? Object.keys(log.changedFields as any) : []
    }));

    console.log('[GET /api/proposal-documents/:documentId] 取得完了:', {
      documentId: document.id,
      canEdit,
      editHistoryCount: editHistory.length
    });

    return res.status(200).json({
      success: true,
      data: {
        document,
        canEdit,
        editHistory
      }
    });

  } catch (error: any) {
    console.error('[GET /api/proposal-documents/:documentId] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '提案書類の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/proposal-documents/:documentId
 * 提案書類更新
 */
router.put('/proposal-documents/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const {
      title,
      background,
      objectives,
      expectedEffects,
      concerns,
      counterMeasures,
      managerNotes,
      additionalContext,
      userId
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userIdが必要です'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    console.log('[PUT /api/proposal-documents/:documentId] 更新開始:', {
      documentId,
      userId,
      userName: user.name
    });

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (background !== undefined) updateData.background = background;
    if (objectives !== undefined) updateData.objectives = objectives;
    if (expectedEffects !== undefined) updateData.expectedEffects = expectedEffects;
    if (concerns !== undefined) updateData.concerns = concerns;
    if (counterMeasures !== undefined) updateData.counterMeasures = counterMeasures;
    if (managerNotes !== undefined) updateData.managerNotes = managerNotes;
    if (additionalContext !== undefined) updateData.additionalContext = additionalContext;

    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await updateDocumentWithAudit(
      documentId,
      updateData,
      userId,
      user.name,
      Number(user.permissionLevel),
      ipAddress,
      userAgent
    );

    console.log('[PUT /api/proposal-documents/:documentId] 更新完了:', {
      documentId: result.document.id,
      auditLogId: result.auditLog?.id
    });

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[PUT /api/proposal-documents/:documentId] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '提案書類の更新中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/proposal-documents
 * 提案書類作成
 */
router.post('/proposal-documents', async (req: Request, res: Response) => {
  try {
    const {
      postId,
      title,
      agendaLevel,
      summary,
      background,
      objectives,
      expectedEffects,
      concerns,
      counterMeasures,
      voteAnalysis,
      commentAnalysis,
      targetCommittee,
      userId
    } = req.body;

    if (!postId || !title || !agendaLevel || !userId) {
      return res.status(400).json({
        success: false,
        error: '必須フィールドが不足しています',
        required: ['postId', 'title', 'agendaLevel', 'userId']
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    console.log('[POST /api/proposal-documents] 作成開始:', {
      postId,
      title: title.substring(0, 50),
      agendaLevel,
      userId
    });

    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.proposalDocument.create({
        data: {
          postId,
          title,
          agendaLevel,
          createdById: userId,
          status: 'draft',
          summary: summary || '',
          background: background || '',
          objectives: objectives || '',
          expectedEffects: expectedEffects || '',
          concerns: concerns || '',
          counterMeasures: counterMeasures || '',
          voteAnalysis: voteAnalysis || {},
          commentAnalysis: commentAnalysis || {},
          targetCommittee
        }
      });

      console.log('[POST /api/proposal-documents] 提案書類作成完了:', document.id);

      const auditLog = await tx.proposalAuditLog.create({
        data: {
          documentId: document.id,
          action: 'CREATED',
          userId,
          userName: user.name,
          userLevel: Number(user.permissionLevel),
          changedFields: { fields: ['all_fields'] }
        }
      });

      console.log('[POST /api/proposal-documents] 監査ログ作成完了:', auditLog.id);

      return {
        document,
        auditLog
      };
    });

    return res.status(201).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[POST /api/proposal-documents] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '提案書類の作成中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/proposal-documents/:documentId/submit
 * 委員会提出（ProposalDocumentCard用）
 * NEW: 2025-10-22
 */
router.post('/proposal-documents/:documentId/submit', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { targetCommittee, userId } = req.body;

    if (!targetCommittee || !userId) {
      return res.status(400).json({
        success: false,
        error: 'targetCommitteeとuserIdが必要です'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    const userLevel = Number(user.permissionLevel);

    // 管理職権限チェック
    if (!hasManagerPermission(userLevel)) {
      return res.status(403).json({
        success: false,
        error: '管理職権限（Level 11+）が必要です'
      });
    }

    const document = await prisma.proposalDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: '提案書類が見つかりません'
      });
    }

    // 作成者チェック
    if (document.createdById !== userId && !hasDirectorPermission(userLevel)) {
      return res.status(403).json({
        success: false,
        error: '作成者のみが提出できます'
      });
    }

    // ステータスチェック
    if (document.status !== 'ready') {
      return res.status(400).json({
        success: false,
        error: '提出準備完了状態の提案書のみ提出できます',
        currentStatus: document.status
      });
    }

    // トランザクション: 提案書更新 + 提出リクエスト作成 + 監査ログ
    const result = await prisma.$transaction(async (tx) => {
      const updatedDocument = await tx.proposalDocument.update({
        where: { id: documentId },
        data: {
          status: 'submitted',
          targetCommittee,
          submittedDate: new Date(),
          submittedById: userId
        },
        include: {
          createdBy: { select: { id: true, name: true, position: true, department: true } },
          submittedBy: { select: { id: true, name: true } }
        }
      });

      const submissionRequest = await tx.committeeSubmissionRequest.create({
        data: {
          documentId,
          requestedById: userId,
          targetCommittee,
          status: 'pending'
        }
      });

      const auditLog = await tx.proposalAuditLog.create({
        data: {
          documentId,
          userId,
          userName: user.name,
          userLevel: userLevel,
          action: 'submitted',
          details: `委員会に提出: ${targetCommittee}`,
          changedFields: { targetCommittee, status: 'submitted' }
        }
      });

      return { updatedDocument, submissionRequest, auditLog };
    });

    console.log('[POST /proposal-documents/:documentId/submit] 提出完了:', documentId);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[POST /proposal-documents/:documentId/submit] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '提出中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/proposal-documents/:documentId
 * 提案書類削除（ProposalDocumentCard用）
 * NEW: 2025-10-22
 */
router.delete('/proposal-documents/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userIdが必要です'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    const userLevel = Number(user.permissionLevel);

    // 管理職権限チェック
    if (!hasManagerPermission(userLevel)) {
      return res.status(403).json({
        success: false,
        error: '管理職権限（Level 11+）が必要です'
      });
    }

    const document = await prisma.proposalDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: '提案書類が見つかりません'
      });
    }

    // 作成者チェック
    if (document.createdById !== userId && !hasDirectorPermission(userLevel)) {
      return res.status(403).json({
        success: false,
        error: '作成者のみが削除できます'
      });
    }

    // ステータスチェック
    if (document.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: '下書き状態の提案書のみ削除できます',
        currentStatus: document.status
      });
    }

    // トランザクション: 監査ログ作成 + 削除
    await prisma.$transaction(async (tx) => {
      await tx.proposalAuditLog.create({
        data: {
          documentId,
          userId: userId as string,
          userName: user.name,
          userLevel: userLevel,
          action: 'deleted',
          details: `下書き削除: ${document.title}`
        }
      });

      await tx.proposalDocument.delete({
        where: { id: documentId }
      });
    });

    console.log('[DELETE /proposal-documents/:documentId] 削除完了:', documentId);

    return res.status(200).json({
      success: true,
      data: {
        deletedId: documentId,
        message: '提案書類を削除しました'
      }
    });

  } catch (error: any) {
    console.error('[DELETE /proposal-documents/:documentId] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '削除中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/proposal-documents/:documentId/export
 * PDF/Wordエクスポート
 */
router.post('/proposal-documents/:documentId/export', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { format, userId } = req.body;

    if (!format || !['pdf', 'word'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'formatは "pdf" または "word" である必要があります'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userIdが必要です'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    console.log('[POST /api/proposal-documents/:documentId/export] エクスポート開始:', {
      documentId,
      format,
      userId
    });

    const document = await prisma.proposalDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: '提案書類が見つかりません'
      });
    }

    const exportResult = format === 'pdf'
      ? await generatePDF(document)
      : await generateWord(document);

    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await createAuditLog({
      documentId,
      action: 'EXPORTED',
      userId,
      userName: user.name,
      userLevel: Number(user.permissionLevel),
      changedFields: { format },
      ipAddress,
      userAgent
    });

    console.log('[POST /api/proposal-documents/:documentId/export] エクスポート完了:', {
      fileName: exportResult.fileName,
      fileSize: exportResult.fileSize
    });

    return res.status(200).json({
      success: true,
      data: {
        downloadUrl: exportResult.downloadUrl,
        fileName: exportResult.fileName,
        fileSize: exportResult.fileSize,
        expiresAt: exportResult.expiresAt.toISOString()
      }
    });

  } catch (error: any) {
    console.error('[POST /api/proposal-documents/:documentId/export] エラー:', error);
    return res.status(500).json({
      success: false,
      error: 'エクスポート中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/proposal-documents/:documentId/audit-logs
 * 編集履歴取得
 */
router.get('/proposal-documents/:documentId/audit-logs', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const parsedLimit = parseInt(limit as string, 10);
    const parsedOffset = parseInt(offset as string, 10);

    console.log('[GET /api/proposal-documents/:documentId/audit-logs] 取得開始:', {
      documentId,
      limit: parsedLimit,
      offset: parsedOffset
    });

    const { auditLogs, total } = await getAuditLogs(documentId, parsedLimit, parsedOffset);

    console.log('[GET /api/proposal-documents/:documentId/audit-logs] 取得完了:', {
      count: auditLogs.length,
      total
    });

    return res.status(200).json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + parsedLimit < total
        }
      }
    });

  } catch (error: any) {
    console.error('[GET /api/proposal-documents/:documentId/audit-logs] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '編集履歴の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
