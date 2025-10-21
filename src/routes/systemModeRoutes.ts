/**
 * システムモード管理APIルート
 * mode-switcher機能用
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

console.log('⚙️  [SystemModeRoutes] Loading system mode routes...');

const router = Router();
const prisma = new PrismaClient();

// テストエンドポイント
router.get('/test', (req: Request, res: Response) => {
  res.json({ success: true, message: 'SystemMode routes working!' });
});

/**
 * GET /api/system/mode
 * 現在のシステムモードを取得
 */
router.get('/mode', async (req: Request, res: Response) => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { configKey: 'system_mode' },
    });

    if (!config) {
      // デフォルト値を返す
      return res.json({
        mode: 'AGENDA_MODE',
        modeLabel: '議題モード',
        config: {
          mode: 'AGENDA_MODE',
          enabledAt: new Date(),
          updatedBy: 'system',
          description: 'デフォルトモード（初回起動）'
        }
      });
    }

    const configValue = config.configValue as any;
    return res.json({
      mode: configValue.mode,
      modeLabel: configValue.mode === 'AGENDA_MODE' ? '議題モード' : 'プロジェクト化モード',
      config: configValue
    });
  } catch (error) {
    console.error('システムモード取得エラー:', error);
    res.status(500).json({
      error: 'システムモードの取得に失敗しました',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/system/mode
 * システムモードを変更（レベル99のみ）
 */
router.put('/mode', async (req: Request, res: Response) => {
  try {
    const { mode, userId } = req.body;

    // バリデーション
    if (!mode || !userId) {
      return res.status(400).json({
        error: 'モードとユーザーIDが必要です'
      });
    }

    if (mode !== 'AGENDA_MODE' && mode !== 'PROJECT_MODE') {
      return res.status(400).json({
        error: '無効なモードです。AGENDA_MODE または PROJECT_MODE を指定してください'
      });
    }

    // ユーザー権限確認
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'ユーザーが見つかりません'
      });
    }

    if (Number(user.permissionLevel) !== 99) {
      return res.status(403).json({
        error: 'システム管理者（レベル99）のみがモード変更可能です'
      });
    }

    // 現在の設定を取得
    const currentConfig = await prisma.systemConfig.findUnique({
      where: { configKey: 'system_mode' }
    });

    const previousMode = currentConfig
      ? (currentConfig.configValue as any).mode
      : 'AGENDA_MODE';

    // 新しい設定
    const newConfig = {
      mode,
      enabledAt: new Date(),
      updatedBy: user.id,
      previousMode,
      description: mode === 'AGENDA_MODE'
        ? '投稿を議題として管理するモード'
        : 'プロジェクト化して管理するモード'
    };

    // 設定を保存（upsert）
    await prisma.systemConfig.upsert({
      where: { configKey: 'system_mode' },
      update: {
        configValue: newConfig,
        updatedBy: user.id,
        updatedAt: new Date()
      },
      create: {
        configKey: 'system_mode',
        configValue: newConfig,
        category: 'system',
        description: 'システム動作モード設定',
        isActive: true,
        updatedBy: user.id
      }
    });

    // 監査ログ記録
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SYSTEM_MODE_CHANGED',
        entityType: 'SystemConfig',
        entityId: 'system_mode',
        oldValues: { mode: previousMode },
        newValues: { mode },
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown'
      }
    });

    res.json({
      success: true,
      mode,
      modeLabel: mode === 'AGENDA_MODE' ? '議題モード' : 'プロジェクト化モード',
      config: newConfig,
      message: `システムモードを ${mode === 'AGENDA_MODE' ? '議題モード' : 'プロジェクト化モード'} に変更しました`
    });
  } catch (error) {
    console.error('システムモード変更エラー:', error);
    res.status(500).json({
      error: 'システムモードの変更に失敗しました',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/system/mode/migration-stats
 * 移行準備統計を取得
 */
router.get('/mode/migration-stats', async (req: Request, res: Response) => {
  try {
    // 1ヶ月前の日付
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 月間投稿数
    const monthlyPosts = await prisma.post.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    // 委員会提出済み数（議題スコア100以上）
    const committeeSubmissions = await prisma.post.count({
      where: {
        agendaScore: {
          gte: 100
        },
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    // アクティブユーザー数
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: oneMonthAgo
        }
      }
    });

    // 総ユーザー数
    const totalUsers = await prisma.user.count();

    // 参加率計算
    const participationRate = totalUsers > 0
      ? Math.round((activeUsers / totalUsers) * 100)
      : 0;

    // しきい値
    const thresholds = {
      monthlyPosts: 30,
      committeeSubmissions: 10,
      participationRate: 60
    };

    // 進捗率計算
    const postsProgress = Math.min(100, Math.round((monthlyPosts / thresholds.monthlyPosts) * 100));
    const submissionsProgress = Math.min(100, Math.round((committeeSubmissions / thresholds.committeeSubmissions) * 100));
    const participationProgress = Math.min(100, Math.round((participationRate / thresholds.participationRate) * 100));

    // 総合進捗（重み付け平均）
    const overallProgress = Math.round(
      postsProgress * 0.4 +
      submissionsProgress * 0.3 +
      participationProgress * 0.3
    );

    // 統計データ
    const stats = {
      monthlyPosts,
      committeeSubmissions,
      activeUsers,
      totalUsers,
      participationRate,
      postsProgress,
      submissionsProgress,
      participationProgress,
      overallProgress
    };

    // 準備状況
    const readiness = {
      isReady:
        monthlyPosts >= thresholds.monthlyPosts &&
        committeeSubmissions >= thresholds.committeeSubmissions &&
        participationRate >= thresholds.participationRate,
      items: [
        {
          label: '月間投稿数',
          current: monthlyPosts,
          required: thresholds.monthlyPosts,
          isMet: monthlyPosts >= thresholds.monthlyPosts,
          progress: postsProgress
        },
        {
          label: '委員会提出数',
          current: committeeSubmissions,
          required: thresholds.committeeSubmissions,
          isMet: committeeSubmissions >= thresholds.committeeSubmissions,
          progress: submissionsProgress
        },
        {
          label: '職員参加率',
          current: participationRate,
          required: thresholds.participationRate,
          isMet: participationRate >= thresholds.participationRate,
          progress: participationProgress
        }
      ],
      overallProgress,
      message: overallProgress >= 100
        ? 'プロジェクト化モードへの移行準備が整いました'
        : `移行準備進捗: ${overallProgress}%`
    };

    res.json({
      success: true,
      stats,
      readiness,
      thresholds
    });
  } catch (error) {
    console.error('移行準備統計取得エラー:', error);
    res.status(500).json({
      error: '移行準備統計の取得に失敗しました',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
