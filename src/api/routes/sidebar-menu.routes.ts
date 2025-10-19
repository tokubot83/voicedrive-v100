/**
 * サイドバーメニュー設定API
 *
 * レベルX（システム管理者）がサイドバーメニューの表示設定を管理
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * サイドバーメニュー設定を取得
 * GET /api/sidebar-menu/configs
 *
 * Query Parameters:
 * - category: 'agenda' | 'project' | 'common'（オプション）
 * - permissionLevel: ユーザーの権限レベル（フィルタリング用）
 */
router.get('/configs', async (req: Request, res: Response) => {
  try {
    const { category, permissionLevel } = req.query;

    // 基本クエリ
    const where: any = {};
    if (category) {
      where.menuCategory = category as string;
    }

    // 全てのメニュー設定を取得
    const configs = await prisma.sidebarMenuConfig.findMany({
      where,
      orderBy: [
        { menuCategory: 'asc' },
        { displayOrder: 'asc' },
      ],
    });

    // 権限レベルでフィルタリング（フロントエンド側でも可能だが、サーバー側で実施）
    let filteredConfigs = configs;
    if (permissionLevel) {
      filteredConfigs = configs.filter((config) => {
        // 非表示の項目は除外
        if (!config.isVisible) return false;

        // visible_for_levels が null = 全レベルで表示
        if (!config.visibleForLevels) return true;

        // JSON パース
        try {
          const levels = JSON.parse(config.visibleForLevels);
          return levels.includes(String(permissionLevel));
        } catch (error) {
          console.error('JSON parse error:', error);
          return true; // エラー時は表示
        }
      });
    }

    res.json({
      success: true,
      configs: filteredConfigs,
      total: filteredConfigs.length,
    });
  } catch (error) {
    console.error('サイドバーメニュー設定取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'サイドバーメニュー設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 特定のメニュー設定を取得
 * GET /api/sidebar-menu/configs/:id
 */
router.get('/configs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await prisma.sidebarMenuConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'メニュー設定が見つかりません',
      });
    }

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('メニュー設定取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'メニュー設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * メニュー設定を作成
 * POST /api/sidebar-menu/configs
 *
 * 権限チェック: レベルXのみ
 */
router.post('/configs', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック（レベルXのみ許可）
    // const userLevel = req.user?.permissionLevel;
    // if (userLevel !== 'X' && userLevel !== 99) {
    //   return res.status(403).json({ message: '権限がありません' });
    // }

    const {
      menuItemId,
      menuCategory,
      menuSubcategory,
      icon,
      label,
      path,
      description,
      isVisible,
      displayOrder,
      showOnDesktop,
      showOnMobile,
      showOnTablet,
      visibleForLevels,
      showNewBadge,
      newBadgeUntil,
      showBadge,
      badgeType,
      adminNotes,
      isCustom,
    } = req.body;

    // 必須項目チェック
    if (!menuItemId || !menuCategory || !icon || !label || !path) {
      return res.status(400).json({
        success: false,
        message: '必須項目が不足しています',
      });
    }

    // 重複チェック
    const existing = await prisma.sidebarMenuConfig.findFirst({
      where: {
        menuItemId,
        menuCategory,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: '同じメニューIDとカテゴリの組み合わせが既に存在します',
      });
    }

    // 作成
    const config = await prisma.sidebarMenuConfig.create({
      data: {
        menuItemId,
        menuCategory,
        menuSubcategory,
        icon,
        label,
        path,
        description,
        isVisible: isVisible ?? true,
        displayOrder: displayOrder ?? 0,
        showOnDesktop: showOnDesktop ?? true,
        showOnMobile: showOnMobile ?? true,
        showOnTablet: showOnTablet ?? true,
        visibleForLevels: visibleForLevels ? JSON.stringify(visibleForLevels) : null,
        showNewBadge: showNewBadge ?? false,
        newBadgeUntil: newBadgeUntil ? new Date(newBadgeUntil) : null,
        showBadge: showBadge ?? false,
        badgeType,
        adminNotes,
        isCustom: isCustom ?? true, // デフォルトはカスタム項目
        isSystem: false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'メニュー設定を作成しました',
      config,
    });
  } catch (error) {
    console.error('メニュー設定作成エラー:', error);
    res.status(500).json({
      success: false,
      message: 'メニュー設定の作成に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * メニュー設定を更新
 * PATCH /api/sidebar-menu/configs/:id
 *
 * 権限チェック: レベルXのみ
 */
router.patch('/configs/:id', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック
    const { id } = req.params;

    // 既存設定を取得
    const existing = await prisma.sidebarMenuConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'メニュー設定が見つかりません',
      });
    }

    // システム項目の削除防止
    if (existing.isSystem && req.body.isSystem === false) {
      return res.status(403).json({
        success: false,
        message: 'システム項目のフラグは変更できません',
      });
    }

    const {
      icon,
      label,
      path,
      description,
      isVisible,
      displayOrder,
      showOnDesktop,
      showOnMobile,
      showOnTablet,
      visibleForLevels,
      showNewBadge,
      newBadgeUntil,
      showBadge,
      badgeType,
      adminNotes,
    } = req.body;

    // 更新データの準備
    const updateData: any = {};
    if (icon !== undefined) updateData.icon = icon;
    if (label !== undefined) updateData.label = label;
    if (path !== undefined) updateData.path = path;
    if (description !== undefined) updateData.description = description;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (showOnDesktop !== undefined) updateData.showOnDesktop = showOnDesktop;
    if (showOnMobile !== undefined) updateData.showOnMobile = showOnMobile;
    if (showOnTablet !== undefined) updateData.showOnTablet = showOnTablet;
    if (visibleForLevels !== undefined) {
      updateData.visibleForLevels = visibleForLevels ? JSON.stringify(visibleForLevels) : null;
    }
    if (showNewBadge !== undefined) updateData.showNewBadge = showNewBadge;
    if (newBadgeUntil !== undefined) {
      updateData.newBadgeUntil = newBadgeUntil ? new Date(newBadgeUntil) : null;
    }
    if (showBadge !== undefined) updateData.showBadge = showBadge;
    if (badgeType !== undefined) updateData.badgeType = badgeType;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // 更新
    const config = await prisma.sidebarMenuConfig.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'メニュー設定を更新しました',
      config,
    });
  } catch (error) {
    console.error('メニュー設定更新エラー:', error);
    res.status(500).json({
      success: false,
      message: 'メニュー設定の更新に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * メニュー設定を削除
 * DELETE /api/sidebar-menu/configs/:id
 *
 * 権限チェック: レベルXのみ
 * システム項目は削除不可
 */
router.delete('/configs/:id', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック
    const { id } = req.params;

    const existing = await prisma.sidebarMenuConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'メニュー設定が見つかりません',
      });
    }

    // システム項目の削除防止
    if (existing.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'システム項目は削除できません',
      });
    }

    await prisma.sidebarMenuConfig.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'メニュー設定を削除しました',
    });
  } catch (error) {
    console.error('メニュー設定削除エラー:', error);
    res.status(500).json({
      success: false,
      message: 'メニュー設定の削除に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * メニュー設定を一括更新（並び替え用）
 * PATCH /api/sidebar-menu/configs/bulk-update
 *
 * Body: { updates: [{ id, displayOrder }, ...] }
 */
router.patch('/configs/bulk-update', async (req: Request, res: Response) => {
  try {
    // TODO: 権限チェック
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'updates配列が必要です',
      });
    }

    // トランザクションで一括更新
    await prisma.$transaction(
      updates.map((update) =>
        prisma.sidebarMenuConfig.update({
          where: { id: update.id },
          data: { displayOrder: update.displayOrder },
        })
      )
    );

    res.json({
      success: true,
      message: `${updates.length}件のメニュー設定を更新しました`,
    });
  } catch (error) {
    console.error('一括更新エラー:', error);
    res.status(500).json({
      success: false,
      message: 'メニュー設定の一括更新に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
