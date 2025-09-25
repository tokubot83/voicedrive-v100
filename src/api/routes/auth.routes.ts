import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { generateToken, generateRefreshToken, authenticateToken } from '../middleware/auth';
import { demoStaffData } from '../../data/demoStaffData';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/auth/login
 * ユーザーログイン
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上必要です')
  ],
  async (req: Request, res: Response) => {
    // バリデーションエラーチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '入力内容に誤りがあります',
          details: errors.array(),
          timestamp: new Date().toISOString()
        }
      });
    }

    const { email, password } = req.body;

    try {
      // デモ用: メールアドレスでスタッフを検索
      const staff = demoStaffData.find(s => s.email === email);

      if (!staff) {
        return res.status(401).json({
          error: {
            code: 'AUTH_FAILED',
            message: 'メールアドレスまたはパスワードが正しくありません',
            timestamp: new Date().toISOString()
          }
        });
      }

      // デモ用: パスワードは "password" + staffId の組み合わせ
      const demoPassword = `password${staff.staffId}`;
      const isValidPassword = password === demoPassword;

      // 本番環境ではハッシュ化されたパスワードと比較
      // const isValidPassword = await bcrypt.compare(password, staff.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({
          error: {
            code: 'AUTH_FAILED',
            message: 'メールアドレスまたはパスワードが正しくありません',
            timestamp: new Date().toISOString()
          }
        });
      }

      // 看護師のリーダー業務による補正計算
      let calculatedLevel = staff.accountLevel;
      if (staff.profession === '看護師' && staff.canPerformLeaderDuty) {
        if (typeof staff.accountLevel === 'number') {
          calculatedLevel = staff.accountLevel + 0.5 as any;
        }
      }

      // トークン生成
      const token = generateToken({
        staffId: staff.staffId,
        email: staff.email,
        accountLevel: staff.accountLevel,
        facility: staff.facility,
        department: staff.department
      });

      const refreshToken = generateRefreshToken(staff.staffId);

      res.json({
        token,
        refreshToken,
        user: {
          staffId: staff.staffId,
          name: staff.name,
          email: staff.email,
          accountLevel: staff.accountLevel,
          calculatedLevel,
          facility: staff.facility,
          department: staff.department,
          position: staff.position,
          profession: staff.profession,
          canPerformLeaderDuty: staff.canPerformLeaderDuty
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'ログイン処理中にエラーが発生しました',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * トークンリフレッシュ
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('リフレッシュトークンが必要です')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '入力内容に誤りがあります',
          details: errors.array(),
          timestamp: new Date().toISOString()
        }
      });
    }

    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

      if (decoded.type !== 'refresh') {
        return res.status(403).json({
          error: {
            code: 'INVALID_TOKEN',
            message: '無効なリフレッシュトークンです',
            timestamp: new Date().toISOString()
          }
        });
      }

      // スタッフ情報を再取得
      const staff = demoStaffData.find(s => s.staffId === decoded.staffId);

      if (!staff) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'ユーザーが見つかりません',
            timestamp: new Date().toISOString()
          }
        });
      }

      // 新しいトークンを生成
      const newToken = generateToken({
        staffId: staff.staffId,
        email: staff.email,
        accountLevel: staff.accountLevel,
        facility: staff.facility,
        department: staff.department
      });

      const newRefreshToken = generateRefreshToken(staff.staffId);

      res.json({
        token: newToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: {
            code: 'REFRESH_TOKEN_EXPIRED',
            message: 'リフレッシュトークンの有効期限が切れています',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(403).json({
          error: {
            code: 'INVALID_TOKEN',
            message: '無効なリフレッシュトークンです',
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  }
);

/**
 * POST /api/auth/logout
 * ログアウト（クライアント側でトークンを削除）
 */
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  // 本番環境ではリフレッシュトークンをブラックリストに追加する処理を実装
  res.json({
    message: 'ログアウトしました',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/auth/me
 * 現在のユーザー情報取得
 */
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: '認証が必要です',
        timestamp: new Date().toISOString()
      }
    });
  }

  // デモ用: スタッフ情報を取得
  const staff = demoStaffData.find(s => s.staffId === req.user!.staffId);

  if (!staff) {
    return res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'ユーザーが見つかりません',
        timestamp: new Date().toISOString()
      }
    });
  }

  res.json({
    staffId: staff.staffId,
    name: staff.name,
    email: staff.email,
    accountLevel: staff.accountLevel,
    facility: staff.facility,
    department: staff.department,
    position: staff.position,
    profession: staff.profession,
    experienceYears: staff.experienceYears,
    canPerformLeaderDuty: staff.canPerformLeaderDuty
  });
});

export default router;