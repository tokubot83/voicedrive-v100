import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getPermissionMetadata } from '../../permissions/config/permissionMetadata';
import { demoStaffData } from '../../data/demoStaffData';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

const router = Router();

/**
 * GET /api/users/permissions/:staffId
 * 指定スタッフの権限情報取得
 */
router.get('/permissions/:staffId', authenticateToken, (req: Request, res: Response) => {
  const { staffId } = req.params;

  // スタッフ情報を取得
  const staff = demoStaffData.find(s => s.staffId === staffId);

  if (!staff) {
    return res.status(404).json({
      error: {
        code: 'STAFF_NOT_FOUND',
        message: 'スタッフが見つかりません',
        timestamp: new Date().toISOString()
      }
    });
  }

  // 看護師のリーダー業務による補正
  let calculatedLevel = staff.accountLevel;
  let nursingLeaderBonus = false;

  if (staff.profession === '看護師' && staff.canPerformLeaderDuty) {
    nursingLeaderBonus = true;
    if (typeof staff.accountLevel === 'number' && staff.accountLevel <= 4) {
      calculatedLevel = (staff.accountLevel + 0.5) as any;
    }
  }

  const metadata = getPermissionMetadata(staff.accountLevel);

  res.json({
    staffId: staff.staffId,
    level: staff.accountLevel,
    baseLevel: staff.accountLevel,
    nursingLeaderBonus,
    calculatedLevel,
    metadata: {
      label: metadata.displayName,
      description: metadata.description,
      features: metadata.accessibleFeatures,
      menus: metadata.menuItems,
      color: getPermissionColor(staff.accountLevel),
      analyticsAccess: metadata.analyticsAccess
    }
  });
});

/**
 * POST /api/v1/calculate-level
 * 権限レベル計算（最優先API - 医療チーム連携用）
 */
router.post('/v1/calculate-level', authenticateToken, (req: Request, res: Response) => {
  const { staffId } = req.body;

  if (!staffId) {
    return res.status(400).json({
      error: {
        code: 'MISSING_STAFF_ID',
        message: 'staffIdが必要です',
        timestamp: new Date().toISOString()
      }
    });
  }

  // スタッフ情報を取得
  const staff = demoStaffData.find(s => s.staffId === staffId);

  if (!staff) {
    return res.status(404).json({
      error: {
        code: 'STAFF_NOT_FOUND',
        message: 'スタッフが見つかりません',
        timestamp: new Date().toISOString()
      }
    });
  }

  // 基本レベル
  let baseLevel = staff.accountLevel;
  let leaderBonus = 0;
  let positionLevel = undefined;

  // 看護師のリーダー業務ボーナス
  if (staff.profession === '看護師' && staff.canPerformLeaderDuty) {
    if (typeof staff.accountLevel === 'number' && staff.accountLevel <= 4) {
      leaderBonus = 0.5;
    }
  }

  // 役職によるレベル（将来の拡張用）
  if (staff.position) {
    // 役職がある場合の追加ロジック
    positionLevel = staff.accountLevel;
  }

  const calculatedLevel = typeof baseLevel === 'number' ? baseLevel + leaderBonus : baseLevel;

  res.json({
    level: calculatedLevel,
    breakdown: {
      baseLevel: typeof baseLevel === 'number' ? baseLevel : 0,
      leaderBonus,
      positionLevel
    }
  });
});

/**
 * GET /api/permissions/levels
 * 全権限レベル一覧取得
 */
router.get('/levels', authenticateToken, (req: Request, res: Response) => {
  const levels = [
    { value: 1, label: '新人（1年目）', color: '#22C55E' },
    { value: 1.5, label: '新人看護師（リーダー可）', color: '#22C55E' },
    { value: 2, label: '若手（2-3年目）', color: '#3B82F6' },
    { value: 2.5, label: '若手看護師（リーダー可）', color: '#3B82F6' },
    { value: 3, label: '中堅（4-10年目）', color: '#8B5CF6' },
    { value: 3.5, label: '中堅看護師（リーダー可）', color: '#8B5CF6' },
    { value: 4, label: 'ベテラン（11年以上）', color: '#EC4899' },
    { value: 4.5, label: 'ベテラン看護師（リーダー可）', color: '#EC4899' },
    { value: 5, label: '副主任', color: '#F59E0B' },
    { value: 6, label: '主任', color: '#F59E0B' },
    { value: 7, label: '副師長・副科長・副課長', color: '#EF4444' },
    { value: 8, label: '師長・科長・課長・室長', color: '#EF4444' },
    { value: 9, label: '副部長', color: '#DC2626' },
    { value: 10, label: '部長・医局長', color: '#DC2626' },
    { value: 11, label: '事務長', color: '#991B1B' },
    { value: 12, label: '副院長', color: '#7C3AED' },
    { value: 13, label: '院長・施設長', color: '#7C3AED' },
    { value: 14, label: '人事部門員', color: '#2563EB' },
    { value: 15, label: '人事各部門長', color: '#2563EB' },
    { value: 16, label: '戦略企画・統括管理部門員', color: '#1E40AF' },
    { value: 17, label: '戦略企画・統括管理部門長', color: '#1E40AF' },
    { value: 18, label: '理事長・法人事務局長', color: '#111827' },
    { value: 'X', label: 'システム管理者', color: '#6B7280' }
  ];

  res.json({ levels });
});

/**
 * 権限レベルに対応する色を取得
 */
function getPermissionColor(level: PermissionLevel | any): string {
  const colorMap: { [key: number]: string } = {
    1: '#22C55E',
    1.5: '#22C55E',
    2: '#3B82F6',
    2.5: '#3B82F6',
    3: '#8B5CF6',
    3.5: '#8B5CF6',
    4: '#EC4899',
    4.5: '#EC4899',
    5: '#F59E0B',
    6: '#F59E0B',
    7: '#EF4444',
    8: '#EF4444',
    9: '#DC2626',
    10: '#DC2626',
    11: '#991B1B',
    12: '#7C3AED',
    13: '#7C3AED',
    14: '#2563EB',
    15: '#2563EB',
    16: '#1E40AF',
    17: '#1E40AF',
    18: '#111827'
  };

  if (level === 'X') return '#6B7280';
  return colorMap[level as number] || '#9CA3AF';
}

export default router;