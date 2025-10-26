/**
 * プロジェクトモード設定API ルート
 *
 * ProjectModeConfigに関するAPIエンドポイントを定義
 *
 * @file src/routes/projectModeConfigRoutes.ts
 * @created 2025-10-26
 */

import express, { Request, Response } from 'express';
import { ProjectModeConfigService } from '../services/ProjectModeConfigService';
import {
  UpdateThresholdsRequest,
  UpdateTeamFormationRulesRequest,
  UpdateProgressManagementRequest,
} from '../types/project-mode-config';

const router = express.Router();

/**
 * 認証と権限チェックミドルウェア（Level 99のみ許可）
 */
const requireLevel99 = (req: Request, res: Response, next: express.NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  // permissionLevelをnumberに変換
  const permissionLevel = typeof user.permissionLevel === 'string'
    ? parseFloat(user.permissionLevel)
    : user.permissionLevel;

  if (permissionLevel < 99) {
    return res.status(403).json({ error: 'この操作にはLevel 99の権限が必要です' });
  }

  next();
};

/**
 * GET /api/project-mode/configs
 * プロジェクトモード設定一覧取得
 */
router.get('/configs', requireLevel99, async (req: Request, res: Response) => {
  try {
    const { facilityCode, isActive } = req.query;

    const params: any = {};
    if (facilityCode) params.facilityCode = facilityCode as string;
    if (isActive !== undefined) params.isActive = isActive === 'true';

    const configs = await ProjectModeConfigService.getAllConfigs(params);

    res.json({
      configs,
      total: configs.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/project-mode/configs:', error);
    res.status(500).json({ error: error.message || 'サーバーエラー' });
  }
});

/**
 * GET /api/project-mode/configs/:departmentId
 * 部署別プロジェクトモード設定取得
 */
router.get('/configs/:departmentId', requireLevel99, async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;

    const config = await ProjectModeConfigService.getConfigByDepartmentId(departmentId);

    if (!config) {
      return res.status(404).json({ error: '指定された部署の設定が見つかりません' });
    }

    res.json(config);
  } catch (error: any) {
    console.error('Error in GET /api/project-mode/configs/:departmentId:', error);
    res.status(500).json({ error: error.message || 'サーバーエラー' });
  }
});

/**
 * PUT /api/project-mode/configs/:departmentId/thresholds
 * 閾値設定更新
 */
router.put(
  '/configs/:departmentId/thresholds',
  requireLevel99,
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const data: UpdateThresholdsRequest = req.body;
      const userId = (req as any).user.id;

      // バリデーション
      if (!data.thresholds || !data.emergencyEscalation) {
        return res.status(400).json({ error: 'thresholdsとemergencyEscalationは必須です' });
      }

      const updatedConfig = await ProjectModeConfigService.updateThresholds(
        departmentId,
        data,
        userId
      );

      res.json({
        success: true,
        config: updatedConfig,
      });
    } catch (error: any) {
      console.error('Error in PUT /api/project-mode/configs/:departmentId/thresholds:', error);
      res.status(400).json({ error: error.message || 'サーバーエラー' });
    }
  }
);

/**
 * PUT /api/project-mode/configs/:departmentId/team-formation
 * チーム編成ルール更新
 */
router.put(
  '/configs/:departmentId/team-formation',
  requireLevel99,
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const data: UpdateTeamFormationRulesRequest = req.body;
      const userId = (req as any).user.id;

      // バリデーション
      if (!data.teamFormationRules) {
        return res.status(400).json({ error: 'teamFormationRulesは必須です' });
      }

      const updatedConfig = await ProjectModeConfigService.updateTeamFormationRules(
        departmentId,
        data,
        userId
      );

      res.json({
        success: true,
        config: updatedConfig,
      });
    } catch (error: any) {
      console.error('Error in PUT /api/project-mode/configs/:departmentId/team-formation:', error);
      res.status(400).json({ error: error.message || 'サーバーエラー' });
    }
  }
);

/**
 * PUT /api/project-mode/configs/:departmentId/progress-management
 * 進捗管理設定更新
 */
router.put(
  '/configs/:departmentId/progress-management',
  requireLevel99,
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const data: UpdateProgressManagementRequest = req.body;
      const userId = (req as any).user.id;

      // バリデーション
      if (!data.milestones || !data.notifications) {
        return res.status(400).json({ error: 'milestonesとnotificationsは必須です' });
      }

      const updatedConfig = await ProjectModeConfigService.updateProgressManagement(
        departmentId,
        data,
        userId
      );

      res.json({
        success: true,
        config: updatedConfig,
      });
    } catch (error: any) {
      console.error(
        'Error in PUT /api/project-mode/configs/:departmentId/progress-management:',
        error
      );
      res.status(400).json({ error: error.message || 'サーバーエラー' });
    }
  }
);

/**
 * PUT /api/project-mode/configs/:departmentId
 * 設定一括更新
 */
router.put('/configs/:departmentId', requireLevel99, async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const data = req.body;
    const userId = (req as any).user.id;

    const updatedConfig = await ProjectModeConfigService.updateConfig(departmentId, data, userId);

    res.json({
      success: true,
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/project-mode/configs/:departmentId:', error);
    res.status(400).json({ error: error.message || 'サーバーエラー' });
  }
});

/**
 * POST /api/project-mode/configs/:departmentId/preview
 * 設定変更のプレビュー（影響範囲確認）
 */
router.post(
  '/configs/:departmentId/preview',
  requireLevel99,
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const { thresholds } = req.body;

      if (!thresholds) {
        return res.status(400).json({ error: 'thresholdsは必須です' });
      }

      const preview = await ProjectModeConfigService.previewThresholdChanges(
        departmentId,
        thresholds
      );

      res.json(preview);
    } catch (error: any) {
      console.error('Error in POST /api/project-mode/configs/:departmentId/preview:', error);
      res.status(500).json({ error: error.message || 'サーバーエラー' });
    }
  }
);

/**
 * POST /api/project-mode/configs
 * 新規設定作成（デフォルト値使用）
 */
router.post('/configs', requireLevel99, async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.body;
    const userId = (req as any).user.id;

    if (!departmentId) {
      return res.status(400).json({ error: 'departmentIdは必須です' });
    }

    const newConfig = await ProjectModeConfigService.createDefaultConfig(departmentId, userId);

    res.status(201).json({
      success: true,
      config: newConfig,
    });
  } catch (error: any) {
    console.error('Error in POST /api/project-mode/configs:', error);
    res.status(400).json({ error: error.message || 'サーバーエラー' });
  }
});

export default router;
