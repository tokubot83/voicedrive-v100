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
 * GET /api/consent/:userId
 * ユーザーの同意状態を取得（ComposeForm用）
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 🔴 共通DB構築前の暫定実装: 権限チェックをスキップ
    // 本来は JWT認証で req.user.id と userId を比較
    // if (req.user?.id !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '他のユーザーの同意状態は取得できません。'
    //   });
    // }

    let consentRecord = await prisma.dataConsent.findUnique({
      where: { userId }
    });

    // レコードが存在しない場合は初期値を返す
    if (!consentRecord) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          analyticsConsent: false,
          personalFeedbackConsent: false,
          consentedAt: null,
          isRevoked: false,
          dataDeletionRequested: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: consentRecord.userId,
        analyticsConsent: consentRecord.analyticsConsent,
        personalFeedbackConsent: consentRecord.personalFeedbackConsent,
        consentedAt: consentRecord.analyticsConsentDate,
        isRevoked: !!consentRecord.revokeDate,
        dataDeletionRequested: consentRecord.dataDeletionRequested
      }
    });

  } catch (error) {
    console.error('[GET /api/consent/:userId] エラー:', error);

    return res.status(500).json({
      success: false,
      message: '同意状態の取得中にエラーが発生しました。'
    });
  }
});

/**
 * POST /api/consent/:userId
 * ユーザーの同意状態を更新（ComposeForm用）
 */
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { analyticsConsent, personalFeedbackConsent } = req.body;

    // 🔴 共通DB構築前の暫定実装: 権限チェックをスキップ
    // 本来は JWT認証で req.user.id と userId を比較
    // if (req.user?.id !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '他のユーザーの同意状態は更新できません。'
    //   });
    // }

    const consentRecord = await prisma.dataConsent.upsert({
      where: { userId },
      update: {
        analyticsConsent,
        analyticsConsentDate: analyticsConsent ? new Date() : undefined,
        personalFeedbackConsent: personalFeedbackConsent !== undefined
          ? personalFeedbackConsent
          : undefined,
        personalFeedbackConsentDate: personalFeedbackConsent ? new Date() : undefined,
        revokeDate: null  // 同意を更新したら取り消し日時をリセット
      },
      create: {
        userId,
        analyticsConsent,
        analyticsConsentDate: analyticsConsent ? new Date() : null,
        personalFeedbackConsent: personalFeedbackConsent || false,
        personalFeedbackConsentDate: personalFeedbackConsent ? new Date() : null
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        userId: consentRecord.userId,
        analyticsConsent: consentRecord.analyticsConsent,
        personalFeedbackConsent: consentRecord.personalFeedbackConsent,
        consentedAt: consentRecord.analyticsConsentDate,
        isRevoked: false
      }
    });

  } catch (error) {
    console.error('[POST /api/consent/:userId] エラー:', error);

    return res.status(500).json({
      success: false,
      message: '同意状態の更新中にエラーが発生しました。'
    });
  }
});

/**
 * GET /api/consent/status/:userId
 * ユーザーの同意状態を取得（既存エンドポイント・後方互換性のため維持）
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
