/**
 * 施設別権限管理サービス
 * 各施設の役職と権限レベルのマッピングを管理
 */

import {
  FACILITY_MAPPINGS,
  getPermissionLevel,
  getPositionDisplayName,
  calculateExperienceLevel
} from '../config/facilityPositionMapping';
import { getFacilityById } from '../data/facilities';
import { Facility } from '../types/facility.types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';

interface CachedPermission {
  staffId: string;
  facilityId: string;
  position: string;
  permissionLevel: number;
  cachedAt: Date;
  expiresAt: Date;
}

interface PositionInfo {
  position: string;
  displayName: string;
  department?: string;
  permissionLevel: number;
  managementScope?: number;
}

export class FacilityPermissionService {
  private static instance: FacilityPermissionService;
  private permissionCache: Map<string, CachedPermission>;
  private readonly CACHE_DURATION_MS = 15 * 60 * 1000; // 15分

  private constructor() {
    this.permissionCache = new Map();
  }

  public static getInstance(): FacilityPermissionService {
    if (!FacilityPermissionService.instance) {
      FacilityPermissionService.instance = new FacilityPermissionService();
    }
    return FacilityPermissionService.instance;
  }

  /**
   * 職員の実効権限レベルを取得
   */
  async getEffectivePermissionLevel(
    staffId: string,
    position: string,
    facilityId: string,
    experience?: number,
    isNurseWithLeaderDuty?: boolean
  ): Promise<number> {
    // キャッシュチェック
    const cacheKey = `${staffId}-${facilityId}`;
    const cached = this.permissionCache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      console.log(`[FacilityPermissionService] キャッシュから権限レベル取得: ${staffId} -> Level ${cached.permissionLevel}`);
      return cached.permissionLevel;
    }

    // 新規計算
    const permissionLevel = getPermissionLevel(
      facilityId,
      position,
      experience,
      isNurseWithLeaderDuty
    );

    // キャッシュ更新
    const now = new Date();
    this.permissionCache.set(cacheKey, {
      staffId,
      facilityId,
      position,
      permissionLevel,
      cachedAt: now,
      expiresAt: new Date(now.getTime() + this.CACHE_DURATION_MS)
    });

    console.log(`[FacilityPermissionService] 権限レベル計算: ${staffId} (${position} @ ${facilityId}) -> Level ${permissionLevel}`);
    return permissionLevel;
  }

  /**
   * 施設の役職一覧を取得
   */
  getFacilityPositions(facilityId: string): PositionInfo[] {
    const facilityMapping = FACILITY_MAPPINGS.get(facilityId);

    if (!facilityMapping) {
      console.warn(`[FacilityPermissionService] 施設 ${facilityId} のマッピングが見つかりません`);
      return [];
    }

    const positions: PositionInfo[] = [];
    facilityMapping.positions.forEach((mapping, positionName) => {
      positions.push({
        position: positionName,
        displayName: mapping.displayName,
        department: mapping.department,
        permissionLevel: mapping.baseLevel,
        managementScope: mapping.managementScope
      });
    });

    return positions.sort((a, b) => b.permissionLevel - a.permissionLevel);
  }

  /**
   * 施設間での権限レベル変換
   * 施設間異動時の権限調整に使用
   */
  translatePermissionLevel(
    currentLevel: number,
    fromFacilityId: string,
    toFacilityId: string,
    fromPosition?: string,
    toPosition?: string
  ): number {
    const fromFacility = getFacilityById(fromFacilityId);
    const toFacility = getFacilityById(toFacilityId);

    if (!fromFacility || !toFacility) {
      console.warn('[FacilityPermissionService] 施設情報が見つかりません');
      return currentLevel;
    }

    // 組織規模による調整
    let adjustedLevel = currentLevel;

    // 大規模→中規模: -1レベル調整
    if (fromFacility.organizationLevel === 'large' && toFacility.organizationLevel === 'medium') {
      adjustedLevel = Math.max(1, currentLevel - 1);
    }
    // 中規模→大規模: +1レベル調整
    else if (fromFacility.organizationLevel === 'medium' && toFacility.organizationLevel === 'large') {
      adjustedLevel = Math.min(13, currentLevel + 1);
    }

    // 特殊ケース: 薬剤部長→薬局長（10/1会議で承認）
    if (fromPosition === '薬剤部長' && toFacilityId === 'tategami-rehabilitation') {
      adjustedLevel = 8; // 10 → 8（施設規模-1 + 役職差-1 = -2）
      console.log(
        `[FacilityPermissionService] 特殊ケース適用: 薬剤部長→薬局長, ` +
        `Level ${currentLevel} -> ${adjustedLevel}`
      );
    }

    console.log(
      `[FacilityPermissionService] 施設間権限変換: ${fromFacilityId} -> ${toFacilityId}, ` +
      `Level ${currentLevel} -> ${adjustedLevel}`
    );

    return adjustedLevel;
  }

  /**
   * キャッシュ無効化（特定職員）
   */
  invalidateStaffCache(staffId: string, facilityId?: string): void {
    if (facilityId) {
      const cacheKey = `${staffId}-${facilityId}`;
      this.permissionCache.delete(cacheKey);
      console.log(`[FacilityPermissionService] キャッシュ無効化: ${cacheKey}`);
    } else {
      // 全施設のキャッシュを削除
      const keysToDelete: string[] = [];
      this.permissionCache.forEach((value, key) => {
        if (key.startsWith(`${staffId}-`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.permissionCache.delete(key));
      console.log(`[FacilityPermissionService] 職員 ${staffId} の全キャッシュを無効化`);
    }
  }

  /**
   * キャッシュ全削除
   */
  clearAllCache(): void {
    this.permissionCache.clear();
    console.log('[FacilityPermissionService] 全キャッシュクリア');
  }

  /**
   * 施設別マッピングの同期（将来的にAPIから取得）
   */
  async syncFacilityMappings(): Promise<void> {
    // TODO: 医療システムAPIから最新のマッピング情報を取得
    // 現在はローカル定義を使用
    console.log('[FacilityPermissionService] 施設マッピング同期（ローカル定義使用）');
    this.clearAllCache();
  }

  /**
   * 権限レベルから推奨される役職を取得
   */
  getSuggestedPositions(
    facilityId: string,
    targetLevel: number
  ): PositionInfo[] {
    const positions = this.getFacilityPositions(facilityId);

    // 指定レベルに最も近い役職を返す
    return positions.filter(p =>
      Math.abs(p.permissionLevel - targetLevel) <= 1
    );
  }

  /**
   * デバッグ情報取得
   */
  getDebugInfo(): {
    cacheSize: number;
    facilities: string[];
    cacheDurationMs: number;
  } {
    return {
      cacheSize: this.permissionCache.size,
      facilities: Array.from(FACILITY_MAPPINGS.keys()),
      cacheDurationMs: this.CACHE_DURATION_MS
    };
  }
}

// シングルトンインスタンスをエクスポート
export const facilityPermissionService = FacilityPermissionService.getInstance();