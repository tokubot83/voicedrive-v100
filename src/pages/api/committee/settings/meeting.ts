import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { AuditService } from '../../../../services/AuditService';

/**
 * GET /api/committee/settings/meeting
 * 会議スケジュール設定取得
 *
 * PUT /api/committee/settings/meeting
 * 会議スケジュール設定更新
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET - 会議スケジュール設定取得
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rawSettings = await prisma.committeeSystemSetting.findMany({
      where: { category: 'meeting' },
    });

    // Key-Value形式に変換
    const settings: Record<string, any> = {};
    for (const setting of rawSettings) {
      let value: any = setting.settingValue;

      // 型変換
      if (setting.valueType === 'number') {
        value = parseInt(value, 10);
      } else if (setting.valueType === 'boolean') {
        value = value === 'true';
      }

      settings[setting.settingKey] = value;
    }

    return res.status(200).json({ settings });
  } catch (error) {
    console.error('会議スケジュール設定取得エラー:', error);
    return res.status(500).json({ error: '会議スケジュール設定の取得に失敗しました' });
  }
}

/**
 * PUT - 会議スケジュール設定更新
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { settings, userId } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: '設定オブジェクトが必要です' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'ユーザーIDが必要です' });
    }

    // 一括更新
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      // 既存の設定を取得
      const existingSetting = await prisma.committeeSystemSetting.findUnique({
        where: {
          category_settingKey: {
            category: 'meeting',
            settingKey: key,
          },
        },
      });

      if (!existingSetting) {
        throw new Error(`設定キー "${key}" が見つかりません`);
      }

      // 値を文字列に変換
      const settingValue = String(value);

      return prisma.committeeSystemSetting.update({
        where: {
          category_settingKey: {
            category: 'meeting',
            settingKey: key,
          },
        },
        data: { settingValue },
      });
    });

    await Promise.all(updatePromises);

    // 監査ログ
    AuditService.log({
      userId,
      action: 'COMMITTEE_MEETING_SETTINGS_UPDATED',
      details: { updatedSettings: settings },
      severity: 'high',
    });

    return res.status(200).json({ success: true, updated: Object.keys(settings).length });
  } catch (error) {
    console.error('会議スケジュール設定更新エラー:', error);
    return res.status(500).json({
      error: '会議スケジュール設定の更新に失敗しました',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
