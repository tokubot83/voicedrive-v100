/**
 * 医療システムの面談タイプマスターデータアクセス
 *
 * mcp-shared/config/interview-types.json を読み込んで
 * VoiceDriveシステムで利用可能な形式で提供します
 */

import interviewConfig from '../../mcp-shared/config/interview-types.json';

export interface MedicalInterviewType {
  id: string;
  name: string;
  classification: string;
  frequency: string;
  target: string;
  trigger: string;
  active: boolean;
  sortOrder: number;
}

export interface MedicalClassification {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface MedicalCategory {
  id: string;
  name: string;
  description: string;
  subcategories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

/**
 * 医療システムの面談タイプ一覧を取得
 */
export function getMedicalInterviewTypes(): MedicalInterviewType[] {
  return interviewConfig.interviewTypes as MedicalInterviewType[];
}

/**
 * 医療システムの面談分類一覧を取得
 */
export function getMedicalClassifications(): MedicalClassification[] {
  return interviewConfig.classifications as MedicalClassification[];
}

/**
 * 医療システムの面談カテゴリ一覧を取得
 */
export function getMedicalCategories(): MedicalCategory[] {
  return interviewConfig.categories as MedicalCategory[];
}

/**
 * 特定の面談タイプを取得
 */
export function getMedicalInterviewTypeById(id: string): MedicalInterviewType | undefined {
  return getMedicalInterviewTypes().find((type) => type.id === id);
}

/**
 * バージョン情報を取得
 */
export function getMedicalInterviewTypesVersion(): string {
  return interviewConfig.version;
}

/**
 * 最終更新日を取得
 */
export function getMedicalInterviewTypesLastUpdated(): string {
  return interviewConfig.lastUpdated;
}
