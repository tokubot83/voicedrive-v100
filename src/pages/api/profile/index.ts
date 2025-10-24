/**
 * ユーザープロフィールAPI
 *
 * GET: プロフィール情報を取得
 * PUT: プロフィール情報を更新
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '../../../api/db/userService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 認証チェック（仮実装）
  // TODO: 本番環境では適切なJWT認証を実装
  const userId = req.headers['x-user-id'] as string || 'user1';

  if (req.method === 'GET') {
    return handleGet(req, res, userId);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, userId);
  }

  return res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed'
  });
}

/**
 * プロフィール情報を取得
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const result = await UserService.getOrCreateProfile(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: result.error || 'プロフィールが見つかりません'
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.data
    });

  } catch (error) {
    console.error('[Profile GET API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * プロフィール情報を更新
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { motto, selfIntroduction, hobbies, coverImage, privacyLevel } = req.body;

    // バリデーション
    if (privacyLevel && !['public', 'private', 'friends'].includes(privacyLevel)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'プライバシーレベルが不正です'
      });
    }

    const result = await UserService.updateProfile(userId, {
      motto,
      selfIntroduction,
      hobbies,
      coverImage,
      privacyLevel
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: result.error || 'プロフィール更新に失敗しました'
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.data
    });

  } catch (error) {
    console.error('[Profile PUT API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
