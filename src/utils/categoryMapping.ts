/**
 * カテゴリマッピングユーティリティ
 * 医療チームシステムとVoiceDriveのカテゴリ連携用
 *
 * VoiceDrive: URGENT/MEETING/TRAINING/HEALTH/OTHER + 新規SURVEY
 * 医療チーム: announcement/interview/training/survey/other
 */

// VoiceDrive側のカテゴリタイプ（医療チーム仕様準拠）
export type VoiceDriveCategory =
  | 'ANNOUNCEMENT' // お知らせ（緊急・健康管理含む）
  | 'MEETING'      // 面談
  | 'TRAINING'     // 研修
  | 'SURVEY'       // アンケート
  | 'OTHER';       // その他

// 医療チーム側のカテゴリタイプ
export type MedicalTeamCategory =
  | 'announcement'  // お知らせ（一般的な通知・緊急連絡を含む）
  | 'interview'     // 面談
  | 'training'      // 研修
  | 'survey'        // アンケート
  | 'other';        // その他

// アンケートのサブカテゴリタイプ
export type SurveySubCategory =
  | 'satisfaction'  // 満足度調査
  | 'workenv'      // 職場環境
  | 'education'    // 教育・研修
  | 'welfare'      // 福利厚生
  | 'system'       // システム改善
  | 'event'        // イベント
  | 'other';       // その他

// サブカテゴリ情報を含むカテゴリ構造
export interface CategoryWithSubCategory {
  category: MedicalTeamCategory;
  subCategory?: SurveySubCategory;
}

/**
 * VoiceDriveのカテゴリを医療チームのカテゴリに変換
 *
 * マッピングルール：
 * - ANNOUNCEMENT → announcement
 * - MEETING → interview
 * - TRAINING → training
 * - SURVEY → survey
 * - OTHER → other
 */
export const convertToMedicalTeamCategory = (
  voiceDriveCategory: VoiceDriveCategory
): MedicalTeamCategory => {
  switch (voiceDriveCategory) {
    case 'ANNOUNCEMENT':
      return 'announcement';
    case 'MEETING':
      return 'interview';
    case 'TRAINING':
      return 'training';
    case 'SURVEY':
      return 'survey';
    case 'OTHER':
      return 'other';
    default:
      console.warn(`Unknown category: ${voiceDriveCategory}, defaulting to 'other'`);
      return 'other';
  }
};

/**
 * 医療チームのカテゴリをVoiceDriveのカテゴリに変換
 *
 * 逆マッピングルール：
 * - announcement → ANNOUNCEMENT
 * - interview → MEETING
 * - training → TRAINING
 * - survey → SURVEY
 * - other → OTHER
 */
export const convertFromMedicalTeamCategory = (
  medicalCategory: MedicalTeamCategory
): VoiceDriveCategory => {
  switch (medicalCategory) {
    case 'announcement':
      return 'ANNOUNCEMENT';
    case 'interview':
      return 'MEETING';
    case 'training':
      return 'TRAINING';
    case 'survey':
      return 'SURVEY';
    case 'other':
      return 'OTHER';
    default:
      console.warn(`Unknown medical category: ${medicalCategory}, defaulting to 'OTHER'`);
      return 'OTHER';
  }
};

/**
 * サブカテゴリの日本語ラベルを取得
 */
export const getSurveySubCategoryLabel = (subCategory: SurveySubCategory): string => {
  switch (subCategory) {
    case 'satisfaction':
      return '満足度調査';
    case 'workenv':
      return '職場環境';
    case 'education':
      return '教育・研修';
    case 'welfare':
      return '福利厚生';
    case 'system':
      return 'システム改善';
    case 'event':
      return 'イベント';
    case 'other':
      return 'その他';
    default:
      return 'その他';
  }
};

/**
 * サブカテゴリのアイコンを取得
 */
export const getSurveySubCategoryIcon = (subCategory: SurveySubCategory): string => {
  switch (subCategory) {
    case 'satisfaction':
      return '😊';
    case 'workenv':
      return '🏢';
    case 'education':
      return '📚';
    case 'welfare':
      return '🎁';
    case 'system':
      return '💻';
    case 'event':
      return '🎉';
    case 'other':
      return '📝';
    default:
      return '📝';
  }
};

/**
 * カテゴリ設定のバリデーション
 * アンケートカテゴリの場合はサブカテゴリが必須
 */
export const validateCategorySettings = (
  category: MedicalTeamCategory,
  subCategory?: SurveySubCategory
): { valid: boolean; message?: string } => {
  if (category === 'survey' && !subCategory) {
    return {
      valid: false,
      message: 'アンケートカテゴリを選択した場合、サブカテゴリの指定が必要です'
    };
  }

  if (category !== 'survey' && subCategory) {
    return {
      valid: false,
      message: 'サブカテゴリはアンケートカテゴリでのみ使用できます'
    };
  }

  return { valid: true };
};

/**
 * カテゴリの表示色を取得
 */
export const getCategoryColor = (category: VoiceDriveCategory | MedicalTeamCategory): string => {
  // VoiceDrive形式の場合
  if (category === category.toUpperCase()) {
    switch (category as VoiceDriveCategory) {
      case 'ANNOUNCEMENT':
        return '#ef4444'; // 赤
      case 'MEETING':
        return '#3b82f6'; // 青
      case 'TRAINING':
        return '#8b5cf6'; // 紫
      case 'SURVEY':
        return '#f59e0b'; // オレンジ
      case 'OTHER':
        return '#9ca3af'; // グレー
      default:
        return '#9ca3af';
    }
  }

  // 医療チーム形式の場合
  switch (category as MedicalTeamCategory) {
    case 'announcement':
      return '#ef4444'; // 赤
    case 'interview':
      return '#3b82f6'; // 青
    case 'training':
      return '#8b5cf6'; // 紫
    case 'survey':
      return '#f59e0b'; // オレンジ
    case 'other':
      return '#9ca3af'; // グレー
    default:
      return '#9ca3af';
  }
};

/**
 * 完全なカテゴリマッピング設定
 */
export const categoryMappingConfig = {
  // VoiceDrive → 医療チーム
  toMedical: {
    'ANNOUNCEMENT': 'announcement',
    'MEETING': 'interview',
    'TRAINING': 'training',
    'SURVEY': 'survey',
    'OTHER': 'other'
  },

  // 医療チーム → VoiceDrive
  fromMedical: {
    'announcement': 'ANNOUNCEMENT',
    'interview': 'MEETING',
    'training': 'TRAINING',
    'survey': 'SURVEY',
    'other': 'OTHER'
  },

  // サブカテゴリ設定
  surveySubCategories: [
    { value: 'satisfaction', label: '満足度調査', icon: '😊' },
    { value: 'workenv', label: '職場環境', icon: '🏢' },
    { value: 'education', label: '教育・研修', icon: '📚' },
    { value: 'welfare', label: '福利厚生', icon: '🎁' },
    { value: 'system', label: 'システム改善', icon: '💻' },
    { value: 'event', label: 'イベント', icon: '🎉' },
    { value: 'other', label: 'その他', icon: '📝' }
  ]
};

/**
 * テスト用のサンプルデータ生成
 */
export const generateCategoryTestData = () => {
  const testCases: Array<{
    voiceDrive: VoiceDriveCategory;
    medical: CategoryWithSubCategory;
    description: string;
  }> = [
    {
      voiceDrive: 'ANNOUNCEMENT',
      medical: { category: 'announcement' },
      description: 'お知らせ'
    },
    {
      voiceDrive: 'MEETING',
      medical: { category: 'interview' },
      description: '面談案内'
    },
    {
      voiceDrive: 'SURVEY',
      medical: {
        category: 'survey',
        subCategory: 'satisfaction'
      },
      description: 'アンケート（満足度調査）'
    },
    {
      voiceDrive: 'SURVEY',
      medical: {
        category: 'survey',
        subCategory: 'workenv'
      },
      description: 'アンケート（職場環境）'
    }
  ];

  return testCases;
};