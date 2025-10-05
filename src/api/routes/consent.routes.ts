/**
 * データ同意関連のAPIルート
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * リクエスト型定義
 */
interface DeletionCompletedRequest {
  userId: string;
  deletedAt: string;
  deletedItemCount: number;
}

/**
 * レスポンス型定義
 */
interface DeletionCompletedResponse {
  success: boolean;
  message: string;
  userId: string;
  completedAt: string;
}

/**
 * POST /api/consent/deletion-completed
 * データ削除完了通知を受信
 *
 * 職員カルテシステムからデータ削除完了の通知を受け取り、
 * DataConsentテーブルを更新し、ユーザーに通知を送信します。
 */
router.post('/deletion-completed', async (req: Request, res: Response) => {
  try {
    const { userId, deletedAt, deletedItemCount } = req.body as DeletionCompletedRequest;

    // バリデーション
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'userIdは必須です',
        error: 'INVALID_USER_ID'
      });
    }

    if (!deletedAt || typeof deletedAt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'deletedAtは必須です',
        error: 'INVALID_DELETED_AT'
      });
    }

    if (typeof deletedItemCount !== 'number' || deletedItemCount < 0) {
      return res.status(400).json({
        success: false,
        message: 'deletedItemCountは0以上の数値である必要があります',
        error: 'INVALID_DELETED_ITEM_COUNT'
      });
    }

    // DataConsentレコードの存在確認
    const consentRecord = await prisma.dataConsent.findUnique({
      where: { userId }
    });

    if (!consentRecord) {
      return res.status(404).json({
        success: false,
        message: '指定されたユーザーの同意レコードが見つかりません',
        error: 'CONSENT_RECORD_NOT_FOUND'
      });
    }

    if (!consentRecord.dataDeletionRequested) {
      return res.status(400).json({
        success: false,
        message: 'このユーザーは削除リクエストを行っていません',
        error: 'NO_DELETION_REQUEST'
      });
    }

    if (consentRecord.dataDeletionCompletedAt) {
      return res.status(400).json({
        success: false,
        message: 'このユーザーのデータ削除は既に完了しています',
        error: 'ALREADY_COMPLETED'
      });
    }

    // DataConsentテーブルを更新
    const completedAt = new Date();
    await prisma.dataConsent.update({
      where: { userId },
      data: {
        dataDeletionCompletedAt: completedAt
      }
    });

    // 監査ログの記録
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_DELETION_COMPLETED',
        entityType: 'DataConsent',
        entityId: consentRecord.id,
        oldValues: {
          dataDeletionCompletedAt: null
        },
        newValues: {
          dataDeletionCompletedAt: completedAt.toISOString(),
          deletedAt,
          deletedItemCount
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // ユーザーへの通知を作成
    await prisma.notification.create({
      data: {
        category: 'system',
        subcategory: 'data_deletion',
        priority: 'high',
        title: 'データ削除が完了しました',
        content: `VoiceDrive分析用データの削除が完了しました。削除件数: ${deletedItemCount}件`,
        target: 'specific',
        senderId: userId, // ユーザー自身を送信者として記録
        status: 'sent',
        sentAt: new Date(),
        recipientCount: 1
      }
    });

    // 成功レスポンス
    const response: DeletionCompletedResponse = {
      success: true,
      message: `データ削除完了を記録しました（削除件数: ${deletedItemCount}件）`,
      userId,
      completedAt: completedAt.toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('データ削除完了通知処理エラー:', error);

    res.status(500).json({
      success: false,
      message: 'データ削除完了通知の処理に失敗しました',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/consent/status/:userId
 * ユーザーの同意状態を取得
 */
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const consentRecord = await prisma.dataConsent.findUnique({
      where: { userId }
    });

    if (!consentRecord) {
      return res.status(404).json({
        success: false,
        message: '同意レコードが見つかりません',
        error: 'CONSENT_RECORD_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      consent: {
        analyticsConsent: consentRecord.analyticsConsent,
        analyticsConsentDate: consentRecord.analyticsConsentDate,
        personalFeedbackConsent: consentRecord.personalFeedbackConsent,
        personalFeedbackConsentDate: consentRecord.personalFeedbackConsentDate,
        revokeDate: consentRecord.revokeDate,
        dataDeletionRequested: consentRecord.dataDeletionRequested,
        dataDeletionRequestedAt: consentRecord.dataDeletionRequestedAt,
        dataDeletionCompletedAt: consentRecord.dataDeletionCompletedAt
      }
    });

  } catch (error) {
    console.error('同意状態取得エラー:', error);

    res.status(500).json({
      success: false,
      message: '同意状態の取得に失敗しました',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

export default router;
