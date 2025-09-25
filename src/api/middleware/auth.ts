import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PermissionLevel, SpecialPermissionLevel } from '../../permissions/types/PermissionTypes';

// JWT Secret（環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// ユーザー情報の型定義
export interface JWTPayload {
  staffId: string;
  email: string;
  accountLevel: PermissionLevel | SpecialPermissionLevel;
  facility: string;
  department: string;
  iat?: number;
  exp?: number;
}

// リクエスト拡張
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * JWTトークン生成
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * リフレッシュトークン生成
 */
export const generateRefreshToken = (staffId: string): string => {
  return jwt.sign({ staffId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
};

/**
 * トークン検証ミドルウェア
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: '認証が必要です',
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'トークンの有効期限が切れています',
          timestamp: new Date().toISOString()
        }
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        error: {
          code: 'INVALID_TOKEN',
          message: '無効なトークンです',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        error: {
          code: 'AUTH_ERROR',
          message: '認証エラーが発生しました',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
};

/**
 * 権限レベルチェックミドルウェア
 */
export const requirePermissionLevel = (
  minLevel: PermissionLevel
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: '認証が必要です',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const userLevel = req.user.accountLevel;

    // システム管理者は全てにアクセス可能
    if (userLevel === SpecialPermissionLevel.LEVEL_X) {
      next();
      return;
    }

    // 権限レベルチェック
    if (typeof userLevel === 'number' && userLevel >= minLevel) {
      next();
      return;
    }

    res.status(403).json({
      error: {
        code: 'PERMISSION_DENIED',
        message: `この操作にはレベル${minLevel}以上の権限が必要です`,
        details: {
          required: minLevel,
          current: userLevel
        },
        timestamp: new Date().toISOString()
      }
    });
  };
};

/**
 * 特定の機能へのアクセスチェック
 */
export const requireFeature = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: '認証が必要です',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // TODO: ユーザーのメタデータから機能アクセス権限を確認
    // const hasAccess = await checkFeatureAccess(req.user.accountLevel, feature);

    next();
  };
};

/**
 * レート制限ミドルウェアのヘルパー
 */
export const rateLimitConfig = {
  auth: {
    windowMs: 1 * 60 * 1000, // 1分
    max: 5,
    message: '認証リクエストが多すぎます。しばらく待ってから再試行してください。'
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1分
    max: 100,
    message: 'APIリクエストが多すぎます。'
  },
  webhook: {
    windowMs: 1000, // 1秒
    max: 20,
    message: 'Webhookリクエストが多すぎます。'
  }
};