/**
 * データ分析同意API Routes
 * Phase 2: 医療システム連携対応（2025-10-26）
 *
 * エンドポイント:
 * - GET    /api/users/:userId/consent                同意状態取得
 * - PUT    /api/users/:userId/consent                同意状態更新
 * - POST   /api/users/:userId/consent/revoke         同意取り消し
 * - POST   /api/users/:userId/consent/delete-request データ削除リクエスト
 * - POST   /api/webhooks/medical-system/deletion-complete データ削除完了通知受信
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/users/:userId/consent
 * 同意状態取得（医療システムからのクエリにも対応）
 */
router.get('/users/:userId/consent', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: 認証チェック（req.user.id === userId or permissionLevel >= 99 or 医療システムからのリクエスト）

    const consent = await prisma.dataConsent.findUnique({
      where: { userId }
    });

    if (!consent) {
      // 未設定の場合はデフォルト値を返す
      return res.json({
        userId,
        analyticsConsent: false,
        personalFeedbackConsent: false,
        isRevoked: false,
        dataDeletionRequested: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    res.json(consent);
  } catch (error) {
    console.error('同意状態取得エラー:', error);
    res.status(500).json({ error: '同意状態の取得に失敗しました' });
  }
});

/**
 * PUT /api/users/:userId/consent
 * 同意状態更新
 */
router.put('/users/:userId/consent', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { analyticsConsent, personalFeedbackConsent } = req.body;

    // TODO: 認証チェック（req.user.id === userId）

    const consent = await prisma.dataConsent.upsert({
      where: { userId },
      update: {
        analyticsConsent: analyticsConsent ?? undefined,
        personalFeedbackConsent: personalFeedbackConsent ?? undefined,
        analyticsConsentDate: analyticsConsent ? new Date() : undefined,
        personalFeedbackConsentDate: personalFeedbackConsent ? new Date() : undefined,
        isRevoked: false,
        revokeDate: null,
        updatedAt: new Date()
      },
      create: {
        userId,
        analyticsConsent: analyticsConsent ?? false,
        personalFeedbackConsent: personalFeedbackConsent ?? false,
        analyticsConsentDate: analyticsConsent ? new Date() : null,
        personalFeedbackConsentDate: personalFeedbackConsent ? new Date() : null,
        isRevoked: false,
        dataDeletionRequested: false
      }
    });

    // 🔔 医療システムへの通知（同意状態変更）
    if (analyticsConsent === true && !consent.isRevoked) {
      await notifyMedicalSystemConsentGranted(userId);
    }

    res.json(consent);
  } catch (error) {
    console.error('同意状態更新エラー:', error);
    res.status(500).json({ error: '同意状態の更新に失敗しました' });
  }
});

/**
 * POST /api/users/:userId/consent/revoke
 * 同意取り消し
 */
router.post('/users/:userId/consent/revoke', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: 認証チェック（req.user.id === userId）

    const consent = await prisma.dataConsent.upsert({
      where: { userId },
      update: {
        isRevoked: true,
        revokeDate: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        analyticsConsent: false,
        personalFeedbackConsent: false,
        isRevoked: true,
        revokeDate: new Date(),
        dataDeletionRequested: false
      }
    });

    // 🔔 医療システムへの通知（同意取り消し）
    await notifyMedicalSystemConsentRevoked(userId);

    res.json({
      success: true,
      message: '同意を取り消しました。今後のデータは分析対象外となります。',
      data: consent
    });
  } catch (error) {
    console.error('同意取り消しエラー:', error);
    res.status(500).json({ error: '同意の取り消しに失敗しました' });
  }
});

/**
 * POST /api/users/:userId/consent/delete-request
 * データ削除リクエスト
 */
router.post('/users/:userId/consent/delete-request', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: 認証チェック（req.user.id === userId）

    const consent = await prisma.dataConsent.upsert({
      where: { userId },
      update: {
        dataDeletionRequested: true,
        dataDeletionRequestedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        analyticsConsent: false,
        personalFeedbackConsent: false,
        isRevoked: true,
        revokeDate: new Date(),
        dataDeletionRequested: true,
        dataDeletionRequestedAt: new Date()
      }
    });

    // 🔔 医療システムへWebhookを送信（データ削除リクエスト）
    const webhookResult = await sendDataDeletionWebhook(userId);

    if (!webhookResult.success) {
      console.error('医療システムへのWebhook送信失敗:', webhookResult.error);
      // エラーでもDB更新は成功しているので、リクエストは受け付けた扱い
    }

    res.json({
      success: true,
      message: 'データ削除リクエストを受け付けました。処理完了まで数日かかる場合があります。',
      data: consent
    });
  } catch (error) {
    console.error('データ削除リクエストエラー:', error);
    res.status(500).json({ error: 'データ削除リクエストに失敗しました' });
  }
});

/**
 * POST /api/webhooks/medical-system/deletion-complete
 * 医療システムからのデータ削除完了通知を受信
 */
router.post('/webhooks/medical-system/deletion-complete', async (req: Request, res: Response) => {
  try {
    const { userId, deletionCompletedAt, status } = req.body;

    // TODO: Webhook署名検証（医療システムからの正当なリクエストか確認）

    if (!userId) {
      return res.status(400).json({ error: 'userIdは必須です' });
    }

    // データ削除完了をDBに記録
    await prisma.dataConsent.update({
      where: { userId },
      data: {
        dataDeletionCompletedAt: deletionCompletedAt ? new Date(deletionCompletedAt) : new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`[Webhook] 医療システムからデータ削除完了通知受信: userId=${userId}, status=${status}`);

    res.json({
      success: true,
      message: 'データ削除完了を記録しました'
    });
  } catch (error) {
    console.error('データ削除完了Webhook処理エラー:', error);
    res.status(500).json({ error: 'Webhook処理に失敗しました' });
  }
});

/**
 * 医療システムへデータ削除リクエストWebhookを送信
 */
async function sendDataDeletionWebhook(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const medicalSystemWebhookUrl = process.env.MEDICAL_SYSTEM_WEBHOOK_URL || 'http://localhost:8080/api/webhooks/voicedrive/deletion-request';

    const response = await fetch(medicalSystemWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VoiceDrive-Signature': generateWebhookSignature({ userId })
      },
      body: JSON.stringify({
        userId,
        requestedAt: new Date().toISOString(),
        source: 'voicedrive'
      })
    });

    if (!response.ok) {
      throw new Error(`医療システムWebhook応答エラー: ${response.status}`);
    }

    console.log(`[Webhook] データ削除リクエストを医療システムへ送信: userId=${userId}`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('医療システムWebhook送信エラー:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 医療システムへ同意付与通知を送信
 */
async function notifyMedicalSystemConsentGranted(userId: string): Promise<void> {
  try {
    const medicalSystemWebhookUrl = process.env.MEDICAL_SYSTEM_WEBHOOK_URL || 'http://localhost:8080/api/webhooks/voicedrive/consent-granted';

    await fetch(medicalSystemWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VoiceDrive-Signature': generateWebhookSignature({ userId })
      },
      body: JSON.stringify({
        userId,
        consentedAt: new Date().toISOString(),
        source: 'voicedrive'
      })
    });

    console.log(`[Webhook] 同意付与を医療システムへ通知: userId=${userId}`);
  } catch (error) {
    console.error('同意付与通知送信エラー:', error);
    // 通知失敗してもVoiceDrive側の処理は継続
  }
}

/**
 * 医療システムへ同意取り消し通知を送信
 */
async function notifyMedicalSystemConsentRevoked(userId: string): Promise<void> {
  try {
    const medicalSystemWebhookUrl = process.env.MEDICAL_SYSTEM_WEBHOOK_URL || 'http://localhost:8080/api/webhooks/voicedrive/consent-revoked';

    await fetch(medicalSystemWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VoiceDrive-Signature': generateWebhookSignature({ userId })
      },
      body: JSON.stringify({
        userId,
        revokedAt: new Date().toISOString(),
        source: 'voicedrive'
      })
    });

    console.log(`[Webhook] 同意取り消しを医療システムへ通知: userId=${userId}`);
  } catch (error) {
    console.error('同意取り消し通知送信エラー:', error);
    // 通知失敗してもVoiceDrive側の処理は継続
  }
}

/**
 * Webhook署名を生成（簡易版）
 * TODO: 本番環境ではHMAC-SHA256等を使用
 */
function generateWebhookSignature(payload: any): string {
  const secret = process.env.WEBHOOK_SECRET || 'voicedrive-webhook-secret';
  // 本番ではcryptoモジュールでHMAC-SHA256を使用
  return Buffer.from(JSON.stringify(payload) + secret).toString('base64');
}

export default router;
