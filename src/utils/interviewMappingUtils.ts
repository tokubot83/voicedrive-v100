// 面談種別の名称マッピングユーティリティ
import { InterviewType, InterviewCategory } from '../types/interview';

/**
 * 旧名称から新名称へのマッピングテーブル
 */
export const INTERVIEW_TYPE_MAPPING: Record<string, InterviewType> = {
  // 主要な移行マッピング
  'performance_review': 'feedback',
  'career_development': 'career_support',
  'stress_care': 'workplace_support',
  'ad_hoc': 'individual_consultation',
  'grievance': 'workplace_support',
  
  // 旧体系から新体系への追加マッピング
  'evaluation': 'feedback',
  'career': 'career_support',
  'concern': 'workplace_support',
  'development': 'career_support',
  'exit': 'exit_interview',
  
  // 新体系はそのまま
  'new_employee_monthly': 'new_employee_monthly',
  'regular_annual': 'regular_annual',
  'management_biannual': 'management_biannual',
  'return_to_work': 'return_to_work',
  'incident_followup': 'incident_followup',
  'exit_interview': 'exit_interview',
  'feedback': 'feedback',
  'career_support': 'career_support',
  'workplace_support': 'workplace_support',
  'individual_consultation': 'individual_consultation',
  'regular': 'regular_annual',
  'other': 'individual_consultation'
};

/**
 * カテゴリ選択が不要な面談種別
 */
export const CATEGORIES_NOT_REQUIRED: InterviewType[] = [
  // 定期面談（3種類）
  'new_employee_monthly',
  'regular_annual',
  'management_biannual',
  // 特別面談（3種類）
  'return_to_work',
  'incident_followup',
  'exit_interview',
  // フィードバック面談
  'feedback'
];

/**
 * 面談分類の定義
 */
export interface InterviewClassification {
  id: 'regular' | 'special' | 'support';
  name: string;
  description: string;
  types: InterviewType[];
}

export const INTERVIEW_CLASSIFICATIONS: InterviewClassification[] = [
  {
    id: 'regular',
    name: '定期面談',
    description: '定期的に実施が必要な面談',
    types: ['new_employee_monthly', 'regular_annual', 'management_biannual']
  },
  {
    id: 'special',
    name: '特別面談',
    description: '特定の状況で実施する面談',
    types: ['return_to_work', 'incident_followup', 'exit_interview']
  },
  {
    id: 'support',
    name: 'サポート面談',
    description: '職員の希望に応じて実施する支援面談',
    types: ['feedback', 'career_support', 'workplace_support', 'individual_consultation']
  }
];

/**
 * 各面談タイプのカテゴリマッピング
 */
export const INTERVIEW_TYPE_CATEGORIES: Record<string, InterviewCategory[]> = {
  'career_support': ['career_path', 'skill_development', 'promotion', 'transfer'],
  'workplace_support': ['work_environment', 'interpersonal', 'workload_balance', 'health_safety'],
  'individual_consultation': ['performance', 'compensation', 'training', 'compliance', 'other']
};

/**
 * 旧名称を新名称に変換（後方互換性のため）
 */
export function normalizeInterviewType(type: string): InterviewType {
  return INTERVIEW_TYPE_MAPPING[type] || (type as InterviewType);
}

/**
 * カテゴリ選択が必要かどうかを判定
 */
export function shouldShowCategorySelection(interviewType: string): boolean {
  const normalizedType = normalizeInterviewType(interviewType);
  return !CATEGORIES_NOT_REQUIRED.includes(normalizedType);
}

/**
 * 面談タイプに対応するカテゴリを取得
 */
export function getAvailableCategories(interviewType: string): InterviewCategory[] {
  const normalizedType = normalizeInterviewType(interviewType);
  return INTERVIEW_TYPE_CATEGORIES[normalizedType] || [];
}

/**
 * 面談タイプの表示名を取得
 */
export function getInterviewTypeDisplayName(type: string): string {
  const normalizedType = normalizeInterviewType(type);
  
  const displayNames: Record<string, string> = {
    // 定期面談
    'new_employee_monthly': '新入職員月次面談',
    'regular_annual': '一般職員年次面談',
    'management_biannual': '管理職半年面談',
    // 特別面談
    'return_to_work': '復職面談',
    'incident_followup': 'インシデント後面談',
    'exit_interview': '退職面談',
    // サポート面談
    'feedback': 'フィードバック面談',
    'career_support': 'キャリア系面談',
    'workplace_support': '職場環境系面談',
    'individual_consultation': '個別相談面談',
    // 旧体系（非推奨）
    'performance_review': 'フィードバック面談（旧：人事評価面談）',
    'career_development': 'キャリア系面談（旧：キャリア開発面談）',
    'stress_care': '職場環境系面談（旧：ストレスケア面談）',
    'ad_hoc': '個別相談面談（旧：随時面談）',
    'grievance': '職場環境系面談（旧：苦情・相談面談）'
  };
  
  return displayNames[normalizedType] || type;
}

/**
 * 面談データの移行（バックアップ機能付き）
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  backup?: any[];
}

export async function migrateInterviewData(
  data: any[],
  createBackup: boolean = true
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: []
  };
  
  try {
    // バックアップ作成
    if (createBackup) {
      result.backup = JSON.parse(JSON.stringify(data));
    }
    
    // データ移行
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.interviewType) {
        const oldType = item.interviewType;
        const newType = normalizeInterviewType(oldType);
        
        if (oldType !== newType) {
          item.interviewType = newType;
          item._migrationInfo = {
            migratedAt: new Date().toISOString(),
            oldType,
            newType
          };
          result.migratedCount++;
        }
      }
    }
    
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error}`);
  }
  
  return result;
}

/**
 * 移行データの検証
 */
export function validateMigration(data: any[]): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  for (const item of data) {
    // 新体系の型チェック
    if (item.interviewType) {
      const validTypes = Object.keys(INTERVIEW_TYPE_MAPPING);
      if (!validTypes.includes(item.interviewType)) {
        issues.push(`Invalid interview type: ${item.interviewType} in item ${item.id}`);
      }
    }
    
    // カテゴリ必須チェック
    if (shouldShowCategorySelection(item.interviewType) && !item.interviewCategory) {
      issues.push(`Missing required category for ${item.interviewType} in item ${item.id}`);
    }
    
    // カテゴリ不要チェック
    if (!shouldShowCategorySelection(item.interviewType) && item.interviewCategory) {
      // 警告のみ（エラーではない）
      console.warn(`Unnecessary category for ${item.interviewType} in item ${item.id}`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}