/**
 * IPホワイトリストミドルウェア
 *
 * 職員カルテシステムなど、特定のIPアドレスからのみアクセスを許可
 */

import { Request, Response, NextFunction } from 'express';

// 環境変数から許可IPリストを取得
const ALLOWED_IPS = (process.env.ANALYTICS_ALLOWED_IPS || '').split(',').filter(Boolean);

// 開発環境ではlocalhostを許可
if (process.env.NODE_ENV === 'development') {
  ALLOWED_IPS.push('127.0.0.1', '::1', 'localhost');
}

/**
 * IPホワイトリストチェックミドルウェア
 */
export const ipWhitelist = (req: Request, res: Response, next: NextFunction): void => {
  // クライアントIPアドレスを取得
  const clientIp =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.headers['x-real-ip']?.toString() ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown';

  // 開発環境でホワイトリストが空の場合は警告のみ
  if (process.env.NODE_ENV === 'development' && ALLOWED_IPS.length === 0) {
    console.warn('⚠️  IPホワイトリストが設定されていません（開発環境）');
    next();
    return;
  }

  // IPアドレスがホワイトリストに含まれているかチェック
  const isAllowed = ALLOWED_IPS.some(allowedIp => {
    // IPv6のlocalhost表記を正規化
    if (allowedIp === 'localhost' || allowedIp === '::1') {
      return clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost';
    }
    return clientIp === allowedIp;
  });

  if (!isAllowed) {
    console.error(`❌ 不正なIPアドレスからのアクセス: ${clientIp}`);

    res.status(403).json({
      error: {
        code: 'IP_NOT_ALLOWED',
        message: 'このIPアドレスからのアクセスは許可されていません',
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  // 許可されたIPアドレス
  console.log(`✅ 許可されたIPアドレス: ${clientIp}`);
  next();
};

/**
 * ホワイトリストに登録されているIP一覧を取得（デバッグ用）
 */
export const getWhitelistedIPs = (): string[] => {
  return ALLOWED_IPS;
};
