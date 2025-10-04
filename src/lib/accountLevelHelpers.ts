/**
 * アカウントレベル変換ヘルパー関数
 * 医療職員管理システムとの統合用
 */

import type { AccountTypeName, ProfessionCategory } from '@/types/accountLevel';
import {
  LEVEL_TO_ACCOUNT_TYPE,
  ACCOUNT_TYPE_TO_LEVEL,
  ACCOUNT_TYPE_LABELS,
  OLD_13_LEVEL_TO_NEW_LEVEL,
} from '@/types/accountLevel';

/**
 * レベルからアカウントタイプ名への変換
 * @param level 権限レベル
 * @param canPerformLeaderDuty リーダー業務可否（看護職の場合）
 * @returns アカウントタイプ名
 */
export function mapLevelToAccountType(
  level: number,
  canPerformLeaderDuty: boolean = false
): AccountTypeName {
  // 看護職のリーダー可の場合、0.5刻みレベルを使用
  const effectiveLevel =
    canPerformLeaderDuty && level >= 1 && level <= 4 && Number.isInteger(level)
      ? level + 0.5
      : level;

  const accountType = LEVEL_TO_ACCOUNT_TYPE[effectiveLevel];

  if (!accountType) {
    throw new Error(`Invalid permission level: ${level}`);
  }

  return accountType;
}

/**
 * アカウントタイプ名からレベルへの変換
 * @param accountType アカウントタイプ名
 * @returns 権限レベル
 */
export function mapAccountTypeToLevel(accountType: AccountTypeName): number {
  const level = ACCOUNT_TYPE_TO_LEVEL[accountType];

  if (level === undefined) {
    throw new Error(`Invalid account type: ${accountType}`);
  }

  return level;
}

/**
 * アカウントタイプ名の日本語表示名を取得
 * @param accountType アカウントタイプ名
 * @returns 日本語表示名
 */
export function getAccountTypeLabel(accountType: AccountTypeName): string {
  return ACCOUNT_TYPE_LABELS[accountType] || accountType;
}

/**
 * 権限レベルの表示フォーマット
 * @param level 権限レベル
 * @returns フォーマット済み文字列
 */
export function formatPermissionLevel(level: number): string {
  if (level === 99) return 'X (システム管理者)';
  if (Number.isInteger(level)) return `Level ${level}`;
  return `Level ${Math.floor(level)} (リーダー可)`;
}

/**
 * 旧13レベルから新レベルへの変換（マイグレーション用）
 * @param oldAccountType 旧アカウントタイプ名
 * @returns 新権限レベル
 */
export function migrateOldLevelToNew(oldAccountType: string): number {
  const newLevel = OLD_13_LEVEL_TO_NEW_LEVEL[oldAccountType];

  if (newLevel === undefined) {
    // 不明な旧タイプはLevel 1（一般職員）にフォールバック
    console.warn(`Unknown old account type: ${oldAccountType}, defaulting to Level 1`);
    return 1;
  }

  return newLevel;
}

/**
 * 職種カテゴリの判定（看護職リーダー業務の可否判定用）
 * @param professionCategory 職種カテゴリ
 * @returns 看護職かどうか
 */
export function isNursingProfession(professionCategory?: string | null): boolean {
  return professionCategory === 'nursing';
}

/**
 * リーダー業務可能レベルかどうかの判定
 * @param level 権限レベル
 * @param professionCategory 職種カテゴリ
 * @returns リーダー業務可能かどうか
 */
export function canHaveLeaderDuty(
  level: number,
  professionCategory?: string | null
): boolean {
  // 看護職のLevel 1-4のみリーダー業務可能
  return isNursingProfession(professionCategory) && level >= 1 && level <= 4;
}

/**
 * 権限レベルに基づくアクセス権限チェック
 * @param userLevel ユーザーの権限レベル
 * @param requiredLevel 必要な権限レベル
 * @returns アクセス可能かどうか
 */
export function hasPermission(userLevel: number, requiredLevel: number): boolean {
  // 特別権限レベル（97-99）は通常レベルとは独立
  if (userLevel >= 97 && userLevel <= 99) {
    // システム管理者（99）は全アクセス可能
    if (userLevel === 99) return true;
    // 健診担当者（97）・産業医（98）は健康管理専用
    return false;
  }

  // 通常レベルは数値が大きいほど権限が高い
  return userLevel >= requiredLevel;
}

/**
 * 施設別権限調整（統括主任Level 7等）のチェック
 * @param position 役職名
 * @param facilityId 施設ID
 * @returns 調整後の権限レベル
 */
export function getFacilityAdjustedLevel(
  position: string,
  facilityId?: string | null
): number | null {
  // 統括主任は立神リハビリテーション温泉病院でLevel 7
  if (position === '統括主任' && facilityId === 'tategami-rehabilitation') {
    return 7;
  }

  // 他の施設別調整はここに追加

  return null; // 調整なし
}

/**
 * 完全なアカウントレベル情報の取得
 */
export interface AccountLevelInfo {
  level: number;
  accountType: AccountTypeName;
  label: string;
  formattedLevel: string;
  canPerformLeaderDuty: boolean;
  professionCategory: ProfessionCategory | null;
}

/**
 * アカウントレベル情報の完全取得
 * @param level 権限レベル
 * @param canPerformLeaderDuty リーダー業務可否
 * @param professionCategory 職種カテゴリ
 * @returns アカウントレベル情報
 */
export function getAccountLevelInfo(
  level: number,
  canPerformLeaderDuty: boolean = false,
  professionCategory: ProfessionCategory | null = null
): AccountLevelInfo {
  const accountType = mapLevelToAccountType(level, canPerformLeaderDuty);
  const label = getAccountTypeLabel(accountType);
  const formattedLevel = formatPermissionLevel(level);

  return {
    level,
    accountType,
    label,
    formattedLevel,
    canPerformLeaderDuty,
    professionCategory,
  };
}
