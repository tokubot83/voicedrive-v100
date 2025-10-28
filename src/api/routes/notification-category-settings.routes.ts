/**
 * 通知カテゴリ設定API
 *
 * Level 99（システムオペレーター）が通知システムのカテゴリ別設定を管理
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * デフォルトの通知カテゴリ設定
 */
const getDefaultCategorySettings = () => {
  return [
    {
      id: 'interview',
      name: '面談・予約通知',
      description: '面談予約、リマインダー、キャンセル通知',
      color: '#2196F3',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    },
    {
      id: 'hr',
      name: '人事お知らせ',
      description: '人事からの重要なお知らせ、評価通知',
      color: '#4CAF50',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    },
    {
      id: 'agenda',
      name: '議題・提案通知',
      description: '議題の状態変更、コメント、承認通知',
      color: '#FF9800',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'system',
      name: 'システム通知',
      description: 'メンテナンス、システム更新のお知らせ',
      color: '#9C27B0',
      enabled: true,
      emailEnabled: false,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'training',
      name: '研修・教育通知',
      description: '研修案内、受講リマインダー',
      color: '#00BCD4',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'shift',
      name: 'シフト・勤務通知',
      description: 'シフト変更、勤務時間の通知',
      color: '#FFC107',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    },
    {
      id: 'project',
      name: 'プロジェクト通知',
      description: 'プロジェクトの進捗、マイルストーン通知',
      color: '#8BC34A',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'evaluation',
      name: '評価通知',
      description: '評価開示、フィードバック面談の案内',
      color: '#E91E63',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    }
  ];
};

/**
 * デフォルトの全般設定
 */
const getDefaultGeneralSettings = () => {
  return {
    retentionDays: 30,
    criticalPriorityImmediate: true,
    highPriorityImmediate: true,
    normalPriorityBatch: false,
    lowPriorityBatch: true,
    nightModeStart: '22:00',
    nightModeEnd: '07:00',
    nightModeSilent: true
  };
};

/**
 * 通知カテゴリ設定を取得
 * GET /api/admin/notification-category-settings
 *
 * 権限チェック: Level 99のみ
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）
    // const userLevel = req.user?.permissionLevel;
    // if (userLevel !== 99) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '権限レベルが不足しています（Level 99が必要）'
    //   });
    // }

    // 最新の設定を取得
    const settings = await prisma.notificationCategorySettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    // 設定が存在しない場合はデフォルト設定を返す
    if (!settings) {
      return res.json({
        success: true,
        data: {
          id: null,
          categories: getDefaultCategorySettings(),
          generalSettings: getDefaultGeneralSettings(),
          updatedBy: null,
          updatedAt: null
        },
        message: 'デフォルト設定を返しました（未保存）'
      });
    }

    // 設定を整形して返す
    res.json({
      success: true,
      data: {
        id: settings.id,
        categories: settings.categories,
        generalSettings: {
          retentionDays: settings.retentionDays,
          criticalPriorityImmediate: settings.criticalPriorityImmediate,
          highPriorityImmediate: settings.highPriorityImmediate,
          normalPriorityBatch: settings.normalPriorityBatch,
          lowPriorityBatch: settings.lowPriorityBatch,
          nightModeStart: settings.nightModeStart,
          nightModeEnd: settings.nightModeEnd,
          nightModeSilent: settings.nightModeSilent
        },
        updatedBy: settings.updatedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('通知カテゴリ設定取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '通知カテゴリ設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 通知カテゴリ設定を保存
 * PUT /api/admin/notification-category-settings
 *
 * 権限チェック: Level 99のみ
 *
 * Body:
 * {
 *   categories: NotificationCategory[],
 *   generalSettings: {
 *     retentionDays: number,
 *     criticalPriorityImmediate: boolean,
 *     highPriorityImmediate: boolean,
 *     normalPriorityBatch: boolean,
 *     lowPriorityBatch: boolean,
 *     nightModeStart: string,
 *     nightModeEnd: string,
 *     nightModeSilent: boolean
 *   }
 * }
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）
    // const userLevel = req.user?.permissionLevel;
    // if (userLevel !== 99) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '権限レベルが不足しています（Level 99が必要）'
    //   });
    // }

    const { categories, generalSettings } = req.body;

    // バリデーション
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'カテゴリ設定が不正です'
      });
    }

    if (!generalSettings || typeof generalSettings !== 'object') {
      return res.status(400).json({
        success: false,
        message: '全般設定が不正です'
      });
    }

    // カテゴリ設定のバリデーション
    const requiredCategoryFields = ['id', 'name', 'description', 'enabled', 'emailEnabled', 'systemEnabled', 'priority'];
    for (const category of categories) {
      for (const field of requiredCategoryFields) {
        if (!(field in category)) {
          return res.status(400).json({
            success: false,
            message: `カテゴリ設定に必須フィールド "${field}" がありません`
          });
        }
      }
    }

    // 全般設定のバリデーション
    const requiredGeneralFields = [
      'retentionDays',
      'criticalPriorityImmediate',
      'highPriorityImmediate',
      'normalPriorityBatch',
      'lowPriorityBatch',
      'nightModeStart',
      'nightModeEnd',
      'nightModeSilent'
    ];
    for (const field of requiredGeneralFields) {
      if (!(field in generalSettings)) {
        return res.status(400).json({
          success: false,
          message: `全般設定に必須フィールド "${field}" がありません`
        });
      }
    }

    // TODO: ユーザーIDの取得
    const updatedBy = 'system'; // req.user?.id || 'system';

    // 既存設定を削除して新規作成（単一レコード管理）
    await prisma.notificationCategorySettings.deleteMany({});

    const settings = await prisma.notificationCategorySettings.create({
      data: {
        categories: categories as any, // Prisma will handle JSON serialization
        retentionDays: generalSettings.retentionDays,
        criticalPriorityImmediate: generalSettings.criticalPriorityImmediate,
        highPriorityImmediate: generalSettings.highPriorityImmediate,
        normalPriorityBatch: generalSettings.normalPriorityBatch,
        lowPriorityBatch: generalSettings.lowPriorityBatch,
        nightModeStart: generalSettings.nightModeStart,
        nightModeEnd: generalSettings.nightModeEnd,
        nightModeSilent: generalSettings.nightModeSilent,
        updatedBy
      }
    });

    res.json({
      success: true,
      message: '通知カテゴリ設定を保存しました',
      data: {
        id: settings.id,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('通知カテゴリ設定保存エラー:', error);
    res.status(500).json({
      success: false,
      message: '通知カテゴリ設定の保存に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 特定のカテゴリ設定を取得（通知配信時に使用）
 * GET /api/admin/notification-category-settings/category/:categoryId
 *
 * 通知配信ロジックから呼び出される
 */
router.get('/category/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    // 最新の設定を取得
    const settings = await prisma.notificationCategorySettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    // 設定が存在しない場合はデフォルト設定を使用
    let categories = getDefaultCategorySettings();
    if (settings) {
      categories = settings.categories as any;
    }

    // 指定されたカテゴリを検索
    const category = categories.find((c: any) => c.id === categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `カテゴリ "${categoryId}" が見つかりません`
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('カテゴリ設定取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'カテゴリ設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 夜間モードチェック（通知配信時に使用）
 * GET /api/admin/notification-category-settings/is-night-mode
 *
 * 通知配信ロジックから呼び出される
 */
router.get('/is-night-mode', async (req: Request, res: Response) => {
  try {
    // 最新の設定を取得
    const settings = await prisma.notificationCategorySettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    // 設定が存在しない場合はデフォルト設定を使用
    const generalSettings = settings || getDefaultGeneralSettings();

    // 現在時刻を取得
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 夜間モードチェック
    const isNightMode = generalSettings.nightModeSilent &&
      isTimeInRange(
        currentTime,
        generalSettings.nightModeStart || '22:00',
        generalSettings.nightModeEnd || '07:00'
      );

    res.json({
      success: true,
      data: {
        isNightMode,
        currentTime,
        nightModeStart: generalSettings.nightModeStart,
        nightModeEnd: generalSettings.nightModeEnd,
        nightModeSilent: generalSettings.nightModeSilent
      }
    });
  } catch (error) {
    console.error('夜間モードチェックエラー:', error);
    res.status(500).json({
      success: false,
      message: '夜間モードチェックに失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 時刻が指定範囲内かチェック
 */
function isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  // 日をまたぐ場合（例: 22:00 - 07:00）
  if (start > end) {
    return current >= start || current < end;
  }

  // 日をまたがない場合（例: 08:00 - 17:00）
  return current >= start && current < end;
}

/**
 * 時刻を分に変換
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export default router;
