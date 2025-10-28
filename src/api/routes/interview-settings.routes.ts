/**
 * 面談設定API
 *
 * Level 99（システムオペレーター）が面談システムの設定を管理
 * - 面談タイプの有効化/無効化
 * - スケジュール設定
 * - 予約制限設定
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const prisma = new PrismaClient();

/**
 * 医療システムの面談タイプマスターを読み込み
 */
function getMedicalInterviewTypes() {
  try {
    const configPath = path.join(__dirname, '../../../mcp-shared/config/interview-types.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    return config.interviewTypes || [];
  } catch (error) {
    console.error('医療システム面談タイプ読み込みエラー:', error);
    return [];
  }
}

/**
 * デフォルトのスケジュール設定
 */
const getDefaultScheduleSettings = () => {
  return [
    { key: 'startTime', value: '13:40', type: 'time', description: '面談開始時刻' },
    { key: 'endTime', value: '17:00', type: 'time', description: '面談終了時刻' },
    { key: 'slotDuration', value: '30', type: 'number', description: '1回の面談時間（分）' },
    { key: 'maxSlotsPerDay', value: '6', type: 'number', description: '1日の最大面談枠数' },
    { key: 'nightShiftSlots', value: 'true', type: 'boolean', description: '夜勤者特別時間帯を有効化' },
    { key: 'advanceBookingDays', value: '60', type: 'number', description: '予約可能期間（日）' }
  ];
};

/**
 * デフォルトの予約制限設定
 */
const getDefaultRestrictionSettings = () => {
  return [
    { key: 'newEmployeeRequired', value: 'true', type: 'boolean', description: '新入職員の面談を必須とする' },
    { key: 'newEmployeeMonthlyLimit', value: '1', type: 'number', description: '新入職員の月間予約上限' },
    { key: 'regularAnnualLimit', value: '1', type: 'number', description: '一般職員の年間予約上限' },
    { key: 'cancellationDeadlineHours', value: '24', type: 'number', description: 'キャンセル期限（時間前）' },
    { key: 'emergencySlotReserve', value: '1', type: 'number', description: '緊急用予約枠数' },
    { key: 'maxConcurrentBookings', value: '2', type: 'number', description: '同時予約可能数' }
  ];
};

/**
 * 面談タイプ設定一覧取得（医療マスター + VoiceDrive設定マージ）
 * GET /api/interview/settings/types
 *
 * 権限チェック: Level 99のみ
 */
router.get('/types', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）
    // const userLevel = req.user?.permissionLevel;
    // if (userLevel !== 99) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '権限レベルが不足しています（Level 99が必要）'
    //   });
    // }

    // 医療システムのマスターデータを取得
    const medicalTypes = getMedicalInterviewTypes();

    // VoiceDriveの有効化設定を取得
    const configs = await prisma.interviewTypeConfig.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    // マージ処理
    const mergedTypes = medicalTypes.map((type: any) => {
      const config = configs.find((c) => c.interviewTypeId === type.id);
      return {
        id: type.id,
        name: type.name,
        frequency: type.frequency,
        classification: type.classification,
        active: type.active,
        // VoiceDrive側の設定（config が存在しない場合は自動的に enabled: true）
        enabled: config?.enabled ?? true,
        displayOrder: config?.displayOrder ?? type.sortOrder ?? 0,
        customName: config?.customName,
        notes: config?.notes,
        isNew: !config // 新規追加タイプのフラグ
      };
    });

    res.json({
      success: true,
      data: mergedTypes
    });
  } catch (error) {
    console.error('面談タイプ設定取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '面談タイプ設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 面談タイプ有効化設定更新
 * PUT /api/interview/settings/types
 *
 * 権限チェック: Level 99のみ
 *
 * Body:
 * {
 *   types: [
 *     {
 *       interviewTypeId: string,
 *       enabled: boolean,
 *       displayOrder?: number,
 *       customName?: string,
 *       notes?: string
 *     }
 *   ]
 * }
 */
router.put('/types', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）
    // const userLevel = req.user?.permissionLevel;
    // if (userLevel !== 99) {
    //   return res.status(403).json({
    //     success: false,
    //     message: '権限レベルが不足しています（Level 99が必要）'
    //   });
    // }

    const { types } = req.body;

    // バリデーション
    if (!types || !Array.isArray(types)) {
      return res.status(400).json({
        success: false,
        message: '面談タイプ設定が不正です'
      });
    }

    // 各タイプの設定を upsert
    for (const type of types) {
      await prisma.interviewTypeConfig.upsert({
        where: { interviewTypeId: type.interviewTypeId },
        create: {
          interviewTypeId: type.interviewTypeId,
          enabled: type.enabled ?? true,
          displayOrder: type.displayOrder ?? 0,
          customName: type.customName,
          notes: type.notes
        },
        update: {
          enabled: type.enabled,
          displayOrder: type.displayOrder,
          customName: type.customName,
          notes: type.notes
        }
      });
    }

    // TODO: 監査ログ記録
    // AuditService.log({
    //   userId: req.user?.id || 'system',
    //   action: 'INTERVIEW_TYPE_CONFIG_UPDATED',
    //   details: { types },
    //   severity: 'medium'
    // });

    res.json({
      success: true,
      message: '面談タイプ設定を保存しました'
    });
  } catch (error) {
    console.error('面談タイプ設定保存エラー:', error);
    res.status(500).json({
      success: false,
      message: '面談タイプ設定の保存に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * スケジュール設定取得
 * GET /api/interview/settings/schedule
 *
 * 権限チェック: Level 99のみ
 */
router.get('/schedule', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）

    const settings = await prisma.interviewSystemSetting.findMany({
      where: { category: 'schedule' }
    });

    // 設定が存在しない場合はデフォルト設定を返す
    if (settings.length === 0) {
      return res.json({
        success: true,
        data: getDefaultScheduleSettings(),
        message: 'デフォルト設定を返しました（未保存）'
      });
    }

    // 設定を整形して返す
    const formattedSettings = settings.map((s) => ({
      key: s.settingKey,
      value: s.settingValue,
      type: s.valueType,
      description: s.description
    }));

    res.json({
      success: true,
      data: formattedSettings
    });
  } catch (error) {
    console.error('スケジュール設定取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スケジュール設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * スケジュール設定更新
 * PUT /api/interview/settings/schedule
 *
 * 権限チェック: Level 99のみ
 *
 * Body:
 * {
 *   settings: [
 *     { key: string, value: string, type: string, description: string }
 *   ]
 * }
 */
router.put('/schedule', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）

    const { settings } = req.body;

    // バリデーション
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'スケジュール設定が不正です'
      });
    }

    // 各設定を upsert
    for (const setting of settings) {
      await prisma.interviewSystemSetting.upsert({
        where: {
          category_settingKey: {
            category: 'schedule',
            settingKey: setting.key
          }
        },
        create: {
          category: 'schedule',
          settingKey: setting.key,
          settingValue: setting.value,
          valueType: setting.type,
          description: setting.description
        },
        update: {
          settingValue: setting.value,
          valueType: setting.type,
          description: setting.description
        }
      });
    }

    res.json({
      success: true,
      message: 'スケジュール設定を保存しました'
    });
  } catch (error) {
    console.error('スケジュール設定保存エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スケジュール設定の保存に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 予約制限設定取得
 * GET /api/interview/settings/restrictions
 *
 * 権限チェック: Level 99のみ
 */
router.get('/restrictions', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）

    const settings = await prisma.interviewSystemSetting.findMany({
      where: { category: 'restriction' }
    });

    // 設定が存在しない場合はデフォルト設定を返す
    if (settings.length === 0) {
      return res.json({
        success: true,
        data: getDefaultRestrictionSettings(),
        message: 'デフォルト設定を返しました（未保存）'
      });
    }

    // 設定を整形して返す
    const formattedSettings = settings.map((s) => ({
      key: s.settingKey,
      value: s.settingValue,
      type: s.valueType,
      description: s.description
    }));

    res.json({
      success: true,
      data: formattedSettings
    });
  } catch (error) {
    console.error('予約制限設定取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '予約制限設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 予約制限設定更新
 * PUT /api/interview/settings/restrictions
 *
 * 権限チェック: Level 99のみ
 *
 * Body:
 * {
 *   settings: [
 *     { key: string, value: string, type: string, description: string }
 *   ]
 * }
 */
router.put('/restrictions', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）

    const { settings } = req.body;

    // バリデーション
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: '予約制限設定が不正です'
      });
    }

    // 各設定を upsert
    for (const setting of settings) {
      await prisma.interviewSystemSetting.upsert({
        where: {
          category_settingKey: {
            category: 'restriction',
            settingKey: setting.key
          }
        },
        create: {
          category: 'restriction',
          settingKey: setting.key,
          settingValue: setting.value,
          valueType: setting.type,
          description: setting.description
        },
        update: {
          settingValue: setting.value,
          valueType: setting.type,
          description: setting.description
        }
      });
    }

    res.json({
      success: true,
      message: '予約制限設定を保存しました'
    });
  } catch (error) {
    console.error('予約制限設定保存エラー:', error);
    res.status(500).json({
      success: false,
      message: '予約制限設定の保存に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 既存予約チェック（面談タイプ無効化時に使用）
 * GET /api/interview/settings/check-bookings?typeId=xxx
 *
 * 権限チェック: Level 99のみ
 */
router.get('/check-bookings', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（Level 99のみ許可）

    const { typeId } = req.query;

    if (!typeId || typeof typeId !== 'string') {
      return res.status(400).json({
        success: false,
        message: '面談タイプIDが不正です'
      });
    }

    // 既存の予約をチェック（scheduled または confirmed ステータス）
    const count = await prisma.interview.count({
      where: {
        interviewTypeId: typeId,
        status: {
          in: ['scheduled', 'confirmed']
        }
      }
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('既存予約チェックエラー:', error);
    res.status(500).json({
      success: false,
      message: '既存予約チェックに失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
